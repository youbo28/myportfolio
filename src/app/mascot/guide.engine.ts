// @ts-nocheck
/* The 3D guide (moon at night, sun by day). Ported from prototype/portfolio-moon.html.
   Plain imperative three.js code: it owns the canvas, the speech bubble and the horizon sweep. */
import * as THREE from 'three';

export interface GuideHost {
  getLang(): string;
  getContent(): any;
  mode(): 'dark' | 'light';
  applyTheme(next: 'dark' | 'light'): void;
}
export interface GuideApi {
  relabel(): void;
  switchTheme(next: 'dark' | 'light'): boolean;
  react(name: string, lineKey?: string): void;
  hoverSay(el: Element, text: string, holdMs?: number): void;
  hoverEnd(el: Element): void;
  /** Fly to `el` (the chat panel) and stay there, quiet, until undock(). */
  dock(el: Element): void;
  /** Fly to the mouse for a few seconds, wave, and say `text` (e.g. "you can chat with me"). */
  nudge(text: string, holdMs?: number): void;
  undock(): void;
  destroy(): void;
}

const $ = (s) => document.querySelector(s);
const store = { get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };

export function createGuide(host: GuideHost): GuideApi {
  const RM = matchMedia('(prefers-reduced-motion:reduce)').matches;
  const root = document.documentElement;
  const C = () => host.getContent();
  const mode = () => host.mode();
  let stopped = false;
  const canvas=$('#guide3d'), bubble=$('#bubble'), btext=$('#btext'), hit=$('#guide-hit');
  let renderer;
  try{renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});}catch(e){canvas.hidden=true;bubble.hidden=true;hit.classList.add('static');return{relabel(){},switchTheme(){return false},react(){},hoverSay(){},hoverEnd(){},dock(){},undock(){},nudge(){},destroy(){}}}
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  renderer.outputColorSpace=THREE.SRGBColorSpace; renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.1;
  const scene=new THREE.Scene();
  let W=innerWidth,H=innerHeight;
  const cam=new THREE.OrthographicCamera(-W/2,W/2,H/2,-H/2,-2000,2000); cam.position.z=1000;
  function resize(){W=innerWidth;H=innerHeight;renderer.setSize(W,H,false);cam.left=-W/2;cam.right=W/2;cam.top=H/2;cam.bottom=-H/2;cam.updateProjectionMatrix();}
  resize(); addEventListener('resize',resize);
  scene.add(new THREE.HemisphereLight(0xdfe6ff,0x2a2050,1.1));
  const key=new THREE.DirectionalLight(0xfff2dc,2.4); key.position.set(-300,400,600); scene.add(key);
  const rim=new THREE.DirectionalLight(0x9db1ff,1.6); rim.position.set(500,-200,-300); scene.add(rim);

  const glowTex=(()=>{const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');const r=g.createRadialGradient(128,128,0,128,128,128);r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(.25,'rgba(255,255,255,.45)');r.addColorStop(.6,'rgba(255,255,255,.08)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(0,0,256,256);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t})();

  /* moon: an extruded, bevelled crescent with a cratered, softly lit surface */
  function crescentShape(){
    const R=1, c={x:.46,y:.2}, r=.86, d=Math.hypot(c.x,c.y);
    const a=(R*R-r*r+d*d)/(2*d), hh=Math.sqrt(R*R-a*a);
    const ux=c.x/d,uy=c.y/d, px=a*ux,py=a*uy;
    const P1={x:px-hh*uy,y:py+hh*ux}, P2={x:px+hh*uy,y:py-hh*ux};
    const ang=(p,o)=>Math.atan2(p.y-o.y,p.x-o.x), far=Math.atan2(-c.y,-c.x);
    const norm=v=>((v%(2*Math.PI))+2*Math.PI)%(2*Math.PI);
    function arc(o,rad,from,to,through,n){let d1=norm(to-from);const mid=from+d1/2;const diff=Math.abs(Math.atan2(Math.sin(mid-through),Math.cos(mid-through)));if(diff>Math.PI/2)d1=d1-2*Math.PI;const pts=[];for(let i=0;i<=n;i++){const t=from+d1*i/n;pts.push(new THREE.Vector2(o.x+rad*Math.cos(t),o.y+rad*Math.sin(t)))}return pts}
    const outer=arc({x:0,y:0},R,ang(P1,{x:0,y:0}),ang(P2,{x:0,y:0}),far,120);
    const inner=arc(c,r,ang(P2,c),ang(P1,c),far,120);
    return {shape:new THREE.Shape([...outer,...inner.slice(1,-1)]),open:Math.atan2(c.y,c.x)};
  }
  const craterTex=(()=>{const s=512,c=document.createElement('canvas');c.width=c.height=s;const g=c.getContext('2d');g.fillStyle='#808080';g.fillRect(0,0,s,s);
    for(let i=0;i<70;i++){const x=Math.random()*s,y=Math.random()*s,r=4+Math.random()**2*38;const gr=g.createRadialGradient(x,y,r*.2,x,y,r);gr.addColorStop(0,'rgba(40,40,40,.55)');gr.addColorStop(.75,'rgba(90,90,90,.25)');gr.addColorStop(.9,'rgba(200,200,200,.35)');gr.addColorStop(1,'rgba(128,128,128,0)');g.fillStyle=gr;g.beginPath();g.arc(x,y,r,0,7);g.fill()}
    for(let i=0;i<9000;i++){g.fillStyle=`rgba(${Math.random()<.5?0:255},${Math.random()<.5?0:255},${Math.random()<.5?0:255},.04)`;g.fillRect(Math.random()*s,Math.random()*s,2,2)}
    const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;return t})();
  const {shape,open}=crescentShape();
  const mg=new THREE.ExtrudeGeometry(shape,{depth:.28,bevelEnabled:true,bevelThickness:.2,bevelSize:.12,bevelSegments:10,curveSegments:8,steps:1});
  mg.center();
  { const pos=mg.attributes.position,uv=mg.attributes.uv;for(let i=0;i<pos.count;i++){uv.setXY(i,pos.getX(i)*.5+.5,pos.getY(i)*.5+.5)} }
  mg.computeVertexNormals();
  const moonMat=new THREE.MeshStandardMaterial({color:0xF3E4B4,roughness:.82,metalness:0,emissive:0xFFE7A8,emissiveIntensity:.18,bumpMap:craterTex,bumpScale:3});
  const moonMesh=new THREE.Mesh(mg,moonMat);
  const moonHalo=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:0xF6E7B4,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,opacity:.55}));
  moonHalo.scale.set(4.2,4.2,1); moonHalo.position.z=-1;
  const moon=new THREE.Group(); const moonBody=new THREE.Group(); moonBody.add(moonMesh); moon.add(moonHalo,moonBody);
  moonMesh.rotation.z=-open+Math.PI*.15; /* opening faces up-right by default */

  /* sun: a living plasma sphere with breathing rays */
  const sunMat=new THREE.ShaderMaterial({uniforms:{t:{value:0},energy:{value:1}},
    vertexShader:`uniform float t;uniform float energy;varying vec3 vN;varying vec3 vP;varying float vH;
      float n3(vec3 p){return sin(p.x*3.1+t*1.3)*sin(p.y*2.7-t*1.1)*sin(p.z*3.4+t*.9);}
      void main(){vN=normalize(normalMatrix*normal);float h=n3(position*2.2)+.5*n3(position*4.5+1.7);vH=h;vec3 p=position+normal*h*.035*energy;vP=p;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`,
    fragmentShader:`uniform float t;uniform float energy;varying vec3 vN;varying vec3 vP;varying float vH;
      void main(){float f=pow(1.-abs(vN.z),2.2);vec3 core=vec3(1.,.83,.42);vec3 hot=vec3(1.,.95,.75);vec3 edge=vec3(1.,.48,.16);
        float swirl=.5+.5*sin(vP.x*9.+vP.y*7.+t*2.2+vH*4.);vec3 c=mix(core,hot,swirl*.45*energy);c=mix(c,edge,f*.85);gl_FragColor=vec4(c*1.05,1.);}`});
  const sunCore=new THREE.Mesh(new THREE.SphereGeometry(.62,96,96),sunMat);
  const rays=new THREE.Group(); const rayMat=new THREE.MeshBasicMaterial({color:0xFFB23F,transparent:true,opacity:.95});
  const rayList=[];for(let i=0;i<12;i++){const m=new THREE.Mesh(new THREE.CapsuleGeometry(.055,.26,6,12),rayMat);const a=i/12*Math.PI*2;m.userData.a=a;m.rotation.z=a-Math.PI/2;rays.add(m);rayList.push(m)}
  const sunHalo=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:0xFFB347,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,opacity:.7}));
  sunHalo.scale.set(4.6,4.6,1); sunHalo.position.z=-1;
  const sun=new THREE.Group(); const sunBody=new THREE.Group(); sunBody.add(sunCore,rays); sun.add(sunHalo,sunBody);

  const actor=new THREE.Group(); actor.add(moon,sun); scene.add(actor);

  /* particles: stardust trail + sparkle bursts */
  const N=260, pg=new THREE.BufferGeometry(), pPos=new Float32Array(N*3), pA=new Float32Array(N), pS=new Float32Array(N);
  const parts=Array.from({length:N},()=>({life:0,max:1,x:0,y:0,vx:0,vy:0,s:1}));
  pg.setAttribute('position',new THREE.BufferAttribute(pPos,3)); pg.setAttribute('a',new THREE.BufferAttribute(pA,1)); pg.setAttribute('s',new THREE.BufferAttribute(pS,1));
  const pMat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:{col:{value:new THREE.Color(0xF6E7B4)},dpr:{value:renderer.getPixelRatio()}},
    vertexShader:`attribute float a;attribute float s;varying float vA;uniform float dpr;void main(){vA=a;gl_PointSize=s*dpr;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader:`uniform vec3 col;varying float vA;void main(){vec2 d=gl_PointCoord-.5;float r=length(d);float star=max(0.,1.-r*2.)+max(0.,.06-abs(d.x)*abs(d.y)*6.);gl_FragColor=vec4(col,vA*star);}`});
  scene.add(new THREE.Points(pg,pMat));
  let pi=0;function emit(x,y,vx,vy,size,life){const p=parts[pi=(pi+1)%N];Object.assign(p,{x,y,vx,vy,s:size,life,max:life})}
  function burst(n=26){for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,v=60+Math.random()*160;emit(cur.x,cur.y,Math.cos(a)*v,Math.sin(a)*v,5+Math.random()*9,.6+Math.random()*.7)}}

  /* ---------- character: two floating hands (no arms) and an expressive mouth ---------- */
  const RT=()=>C().guide.react;
  const handMat=new THREE.MeshStandardMaterial({color:0xF6EDD2,roughness:.5,metalness:0,emissive:0xF6EDD2,emissiveIntensity:.22});
  function makeHand(side){
    const g=new THREE.Group(), m=new THREE.Group(); m.scale.x=side; g.add(m); g.rotation.order='ZYX';
    const palm=new THREE.Mesh(new THREE.SphereGeometry(.5,32,24),handMat); palm.scale.set(1,1.05,.55); m.add(palm);
    const fingers=[];
    [-.3,-.1,.1,.3].forEach((x,i)=>{const p=new THREE.Group();p.position.set(x,.36,0);const len=i===0?.4:i===3?.28:.36;
      const f=new THREE.Mesh(new THREE.CapsuleGeometry(.115,len,6,12),handMat);f.position.y=len/2+.06;p.add(f);m.add(p);fingers.push(p)});
    const th=new THREE.Group(); th.position.set(-.4,-.02,.05);
    const tm=new THREE.Mesh(new THREE.CapsuleGeometry(.12,.3,6,12),handMat); tm.position.y=.22; th.add(tm); m.add(th);
    g.userData={fingers,th,st:[1.08*side,-.22,.25,.1,-.8*side,-.2*side,.25,.3,.45,.2]};
    g.scale.setScalar(.32); actor.add(g); return g;
  }
  function applyHand(h,q){h.position.set(q[0],q[1],q[2]);h.rotation.set(q[3],q[4],q[5]);
    const u=h.userData;u.fingers[0].rotation.x=q[6]*1.6;for(let i=1;i<4;i++)u.fingers[i].rotation.x=q[7]*1.7;u.th.rotation.z=.25+q[8]*.8;u.th.rotation.x=q[9]*1.3}
  const hands=[makeHand(1),makeHand(-1)];
  // where the mouth sits on the moon: the middle of the crescent's thick part
  const moonFace=(()=>{const sp=shape.getPoints();let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;sp.forEach(p=>{x0=Math.min(x0,p.x);x1=Math.max(x1,p.x);y0=Math.min(y0,p.y);y1=Math.max(y1,p.y)});
    const d=Math.hypot(.46,.2),fx=-.66*.46/d-(x0+x1)/2,fy=-.66*.2/d-(y0+y1)/2,r=moonMesh.rotation.z;return{x:fx*Math.cos(r)-fy*Math.sin(r),y:fx*Math.sin(r)+fy*Math.cos(r)}})();
  const mouthG=new THREE.Group(); actor.add(mouthG);
  const mouthMat=new THREE.MeshBasicMaterial({color:0x3A2810}), mouthFill=new THREE.MeshBasicMaterial({color:0x5A1E14,side:THREE.DoubleSide});
  const capG=new THREE.SphereGeometry(.026,10,8), caps=[new THREE.Mesh(capG,mouthMat),new THREE.Mesh(capG,mouthMat)]; caps.forEach(c=>mouthG.add(c));
  let mouthMeshes=[]; const mo={w:.26,smile:.35,open:0,round:0,skew:0}, moLast={};
  function buildMouth(){
    let changed=false;for(const k in mo)if(Math.abs((moLast[k]??-9)-mo[k])>.002){changed=true;break}
    if(!changed)return; Object.assign(moLast,mo);
    mouthMeshes.forEach(x=>{x.geometry.dispose();mouthG.remove(x)});mouthMeshes=[];
    const n=20,up=[],lo=[];
    for(let i=0;i<=n;i++){const tt=-1+2*i/n,x=tt*mo.w/2,f=lerp(1-tt*tt,Math.sqrt(Math.max(0,1-tt*tt)),mo.round);
      const b=mo.smile*.12*tt*tt-mo.smile*.02+mo.skew*.05*tt;up.push(new THREE.Vector3(x,b+mo.open*.3*f,0));lo.push(new THREE.Vector3(x,b-mo.open*.7*f,0))}
    const add=(geo,mat)=>{const me=new THREE.Mesh(geo,mat);mouthG.add(me);mouthMeshes.push(me)};
    const isOpen=mo.open>.015;
    if(isOpen)add(new THREE.ShapeGeometry(new THREE.Shape([...up.map(p=>new THREE.Vector2(p.x,p.y)),...lo.slice().reverse().map(p=>new THREE.Vector2(p.x,p.y))])),mouthFill);
    add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(up),24,.026,6),mouthMat);
    if(isOpen)add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(lo),24,.026,6),mouthMat);
    caps[0].position.copy(up[0]);caps[1].position.copy(up[n]);
  }
  const MOUTH={
    idle:{w:.26,smile:.35,open:0,round:0,skew:0}, travel:{w:.26,smile:.5,open:.05,round:0,skew:0},
    point:{w:.28,smile:.6,open:.02,round:0,skew:0}, beckon:{w:.3,smile:.85,open:.12,round:0,skew:0},
    present:{w:.32,smile:.9,open:.16,round:0,skew:0}, wave:{w:.3,smile:.85,open:.14,round:0,skew:0},
    hello:{w:.3,smile:.85,open:.14,round:0,skew:0}, bye:{w:.28,smile:.55,open:.08,round:0,skew:0},
    joy:{w:.34,smile:1,open:.28,round:0,skew:0}, proud:{w:.3,smile:.8,open:0,round:0,skew:.15},
    thanks:{w:.24,smile:.7,open:0,round:0,skew:0}, curious:{w:.12,smile:0,open:.1,round:1,skew:.2},
    surprised:{w:.16,smile:0,open:.26,round:1,skew:0}, shy:{w:.15,smile:.45,open:0,round:0,skew:.6},
    sleepy:{w:.2,smile:.1,open:0,round:.8,skew:0}};
  const DUR={wave:2.6,joy:2.4,proud:2.6,thanks:3.2,surprised:1.8,present:2.4};
  let oneShot=null, pending=null, pjMode='point', rigTilt=0, ready=false;
  setTimeout(()=>{ready=true;react('wave')},1200);
  function react(name){if(!ready&&name!=='wave')return;pending=name}
  function onSection(sec,prev){const a={about:'present',skills:'present',experience:'proud',education:'proud',contact:'joy'}[sec]||(sec==='hero'&&prev&&prev!=='hero'?'wave':null);if(a)react(a)}
  const V=new THREE.Vector3();
  function rigUpdate(dt,t,now,speed,dm,isMoon){
    if(pending&&speed<70&&!trans){oneShot={name:pending,t:0,dur:DUR[pending]||2.4};if(pending==='joy'&&!RM)setTimeout(()=>burst(18),350);pending=null}
    if(oneShot){oneShot.t+=dt;if(oneShot.t>oneShot.dur)oneShot=null}
    const M=isMoon?moonFace:{x:0,y:-.15}, hs=isMoon?1:1.12;
    // what to point at: the spotlighted project, the email, or the CV button
    let el=null; const hovering=hoverEl&&now<hoverUntil&&document.contains(hoverEl); if(hovering)el=hoverEl; else if(current==='projects')el=spot; else if(current==='contact')el=$('.mail'); else if(current==='hero')el=$('.hero .btn.primary');
    let pointOn=!!el&&(hovering||current==='projects'||(t%9)<5), dir={x:1,y:0}, ang=0;
    if(el){const r=el.getBoundingClientRect();if(r.bottom<0||r.top>H)pointOn=false;
      actor.updateMatrixWorld();V.set(r.left+r.width/2-W/2,H/2-(r.top+r.height/2),0);actor.worldToLocal(V);
      const l=Math.hypot(V.x,V.y)||1;dir={x:V.x/l,y:V.y/l};ang=Math.atan2(dir.y,dir.x)}
    let b='idle';
    if(trans)b=trans.swapped?'hello':'bye';
    else if(oneShot)b=oneShot.name;
    else if(speed>70)b='travel';
    else if(moodName==='shy')b='shy';
    else if(moodName==='sleepy')b='sleepy';
    else if(pointOn)b=(!hovering&&current==='projects'&&pjMode==='beckon')?'beckon':'point';
    else if(dm<cur.s*3.2&&now-lastMove<1500)b='curious';
    const u=oneShot?oneShot.t:t, ws=cur.x>0?-1:1, ps=dir.x>=0?1:-1, still=RM?0:1;
    const Hp=(s,x,y,z,rx,ry,rz,ci,cf,ta,tc)=>[x*s*hs,y*hs,z,rx,ry*s,rz*s,ci,cf,ta,tc];
    const rest=s=>Hp(s,1.12,-.22+Math.sin(t*1.2+s)*.04*still,.5,.1,-.8,-.2,.25,.3,.45,.2);
    const toFace=(s,dx,dy)=>[(M.x*s+dx)/hs,(M.y+dy)/hs];
    function pose(s){
      switch(b){
        case 'travel':{const p=rest(s);p[0]-=clamp(cur.vx/500,-.35,.35);p[1]-=clamp(cur.vy/500,-.35,.35);p[5]-=.3*s;return p}
        case 'wave':case 'hello':case 'bye':if(s!==ws)return rest(s);return Hp(s,.95,.55,.35,0,0,-.15+Math.sin(u*7)*.38*still,.05,.05,.65,0);
        case 'point':{if(s!==ps)return rest(s);const k=1.3+.06*Math.sin(t*2.6)*still;return Hp(s,dir.x*k*s/hs,dir.y*k/hs,.35,0,-.6,(ang-Math.PI/2)*s,0,1,.1,.7)}
        case 'beckon':{if(s!==ps)return rest(s);const g=(!RM&&t%2.4<1.2)?Math.pow(Math.max(0,Math.sin(t*5.2)),2):0;return Hp(s,dir.x*1.25*s/hs,dir.y*1.25/hs,.4,-.7,0,(ang-Math.PI/2)*s,.1+.75*g,.1+.75*g,.5,0)}
        case 'present':{const e=Math.min(1,u/.5);return Hp(s,1.05+.15*e,-.35+.15*e,.4,-.8*e,0,-1.1*e-.2,.1,.1,.7,0)}
        case 'joy':{if(u<.7){const c=Math.sin(Math.min(1,u/.7)*Math.PI);return Hp(s,.55-.43*c,-.5,.6,0,-1.3,.2,.1,.1,.35,0)}
          return Hp(s,.95,.5+.05*Math.sin(u*4)*still,.35,0,0,-.35+.08*Math.sin(u*5+s)*still,.05,.05,.7,0)}
        case 'proud':if(s!==ws)return rest(s);return Hp(s,.95,.15+.05*Math.sin(u*4)*still,.45,0,-1.4,0,1,1,0,0);
        case 'thanks':if(s!==ws)return rest(s);return Hp(s,.18,-.3,.75,0,-.2,1.35,.1,.1,.2,0);
        case 'curious':{if(s!==ws)return rest(s);const [x,y]=toFace(s,.14,-.3);return Hp(s,x,y,.7,0,-.6,.5,.55,.6,.3,.4)}
        case 'surprised':return Hp(s,1.0,.4,.4,0,0,-.35,0,0,.9,0);
        case 'shy':{if(s!==ws)return rest(s);const [x,y]=toFace(s,.2,.02);return Hp(s,x,y,.75,0,-.3,.8,.15,.15,.2,0)}
        case 'sleepy':{if(t%7<2&&s===ws){const [x,y]=toFace(s,.12,.05);return Hp(s,x,y,.75,0,-.2,1.1,.1,.1,.2,0)}return Hp(s,1.0,-.6,.15,.3,-.9,.2,.55,.6,.3,.3)}
        default:return rest(s);
      }
    }
    const hk=1-Math.exp(-dt*(RM?20:7));
    hands.forEach((h,i)=>{const p=pose(i?-1:1),q=h.userData.st;for(let j=0;j<10;j++)q[j]=lerp(q[j],p[j],hk);applyHand(h,q)});
    handMat.color.set(isMoon?0xF6EDD2:0xFFE2A0); handMat.emissive.copy(handMat.color);
    // mouth
    const mt={...(MOUTH[b]||MOUTH.idle)};
    if(b==='sleepy'){const y=t%7;mt.open=y<2?.3*Math.sin(y/2*Math.PI):0}
    if(!RM&&now-saidAt<1500&&mt.round<.5)mt.open+=.05*(.5+.5*Math.sin(t*10));
    const mk=1-Math.exp(-dt*8);for(const k in mo)mo[k]=lerp(mo[k],mt[k],mk);
    buildMouth(); mouthG.position.set(M.x,M.y,isMoon?.37:.66); mouthMat.color.set(isMoon?0x3A2810:0x7A2A0E);
    rigTilt=lerp(rigTilt,(b==='thanks'&&oneShot)?.35*Math.sin(Math.min(1,u/oneShot.dur)*Math.PI):0,mk);
  }

  /* moods: every visible behaviour is a blend of these numbers */
  const MOODS={
    calm:   {bob:7, bobSp:1.1,glow:1.0,warm:0,  wob:0,  spin:0,  breathe:.03,brSp:.9, lift:0,  tilt:0,   back:0},
    curious:{bob:9, bobSp:1.6,glow:1.2,warm:.15,wob:.02,spin:0,  breathe:.03,brSp:1.4,lift:6,  tilt:.35, back:0},
    excited:{bob:11,bobSp:2.2,glow:1.7,warm:.8, wob:.07,spin:.9, breathe:.06,brSp:3.2,lift:10, tilt:.2,  back:0},
    proud:  {bob:6, bobSp:1.0,glow:1.5,warm:.5, wob:.01,spin:0,  breathe:.04,brSp:1.2,lift:22, tilt:-.1, back:0},
    shy:    {bob:4, bobSp:1.4,glow:.75,warm:-.1,wob:.03,spin:0,  breathe:.02,brSp:1.3,lift:0,  tilt:-.5, back:1},
    sleepy: {bob:5, bobSp:.55,glow:.45,warm:-.35,wob:0, spin:0,  breathe:.06,brSp:.5, lift:-26,tilt:.5,  back:0},
    flying: {bob:3, bobSp:2,  glow:1.25,warm:.3,wob:.02,spin:.2, breathe:0,  brSp:1,  lift:0,  tilt:0,   back:0}};
  const SECTION_MOOD={hero:'curious',about:'calm',skills:'curious',projects:'excited',experience:'calm',education:'calm',contact:'proud'};
  const m={...MOODS.curious};

  const sections=[...document.querySelectorAll('[data-guide]')];
  let current='hero', who=mode()==='light'?'sun':'moon', lineIdx=0, lastLine='', lineTimer=0, pjIdx=0, pjTimer=0, spot=null;
  let hidden=store.get('guide-hidden')==='1';
  const cur={x:0,y:0,s:80,vx:0,vy:0}; let first=true;
  const mouse={x:-9999,y:-9999,t:0}; let lastScroll=performance.now(), lastMove=performance.now();
  addEventListener('pointermove',e=>{mouse.x=e.clientX-W/2;mouse.y=H/2-e.clientY;lastMove=performance.now()},{passive:true});
  addEventListener('scroll',()=>{lastScroll=performance.now()},{passive:true});

  /* theme switch choreography: outgoing body sinks, incoming body rises */
  let trans=null;
  function switchTheme(next){
    if(trans)return true;
    trans={t:0,next,swapped:false,from:who,to:next==='light'?'sun':'moon'};
    $('#horizon').className='run '+(next==='light'?'dawn':'dusk');
    setTimeout(()=>{$('#horizon').className=''},RM?700:2600);
    return true;
  }
  let saidAt=performance.now();
  // lines are written out letter by letter, as if the guide were typing them
  let typing=0;
  function say(text){if(!text||text===lastLine)return;lastLine=text;saidAt=performance.now();bubble.classList.add('swap');clearInterval(typing);
    setTimeout(()=>{bubble.classList.remove('swap');if(RM){btext.textContent=text;return}
      btext.textContent='';let i=0;typing=setInterval(()=>{i+=1;btext.textContent=text.slice(0,i);if(i>=text.length)clearInterval(typing)},22)},200)}
  function lines(k){const v=C().guide[who][k];return Array.isArray(v)?v:[v]}
  function sayFor(k){if(k==='projects'||isHover())return;const l=lines(k);say(l[lineIdx%l.length])}
  function relabel(){lastLine='';current=null;if(ready)react('surprised')}
  let hoverEl=null, hoverUntil=0;
  function hoverSay(el,text,hold){if(hidden||trans||!text||nudging()||docked())return;hoverEl=el;hoverUntil=hold?performance.now()+hold:Infinity;lastLine='';say(text);lineTimer=-5}
  const isHover=()=>!!hoverEl&&performance.now()<hoverUntil&&document.contains(hoverEl);
  function hoverEnd(el){if(hoverEl===el)hoverUntil=Math.min(hoverUntil,performance.now()+1200)}
  // docked: the chat is open, so the guide sits on the panel's top corner and lets the chat do the talking
  let dockEl=null;
  function dock(el){dockEl=el;hoverEl=null;bubble.style.visibility='hidden'}
  function undock(){dockEl=null;bubble.style.visibility='';lastLine='';current=null}
  const docked=()=>!!dockEl&&document.contains(dockEl);
  // nudge: it comes to the mouse and waves, to show the visitor it can chat
  let nudgeUntil=0;
  function nudge(text,hold=6500){if(hidden||trans||docked()||mouse.x<-9000)return;hoverEl=null;nudgeUntil=performance.now()+hold;lastLine='';say(text);lineTimer=-8;react('wave')}
  const nudging=()=>performance.now()<nudgeUntil&&!docked();
  function reactSay(name,key){react(name);if(key){lastLine='';say(RT()[key])}}

  function active(){const mid=H*.42;let best=sections[0];for(const s of sections){if(s.getBoundingClientRect().top<=mid)best=s}return best}
  function target(){
    if(docked()){
      const r=dockEl.getBoundingClientRect(), s=W<=860?30:42, rtl=host.getLang()==='ar';
      const x=rtl?r.left+s*1.1:r.right-s*1.1, y=Math.max(s*1.2,r.top-s*.9);
      return{x:x-W/2,y:H/2-y,s};
    }
    if(nudging()){
      const s=W<=860?32:44, side=mouse.x>0?-1:1;
      return{x:clamp(mouse.x+side*s*2.2,-W/2+s*1.4,W/2-s*1.4),y:clamp(mouse.y+s*.6,-H/2+70,H/2-100),s};
    }
    // companion: fly next to whatever the visitor is hovering, focusing or tapping
    if(isHover()){
      const r=hoverEl.getBoundingClientRect(), mob=W<=860, s=mob?Math.min(30,W*.075):Math.max(34,Math.min(46,W*.03));
      let x, y;
      if(!mob&&r.right+s*2.6<W){x=r.right+s*1.4;y=r.top+Math.min(r.height/2,s*1.3)}
      else if(!mob&&r.left-s*2.6>0){x=r.left-s*1.4;y=r.top+Math.min(r.height/2,s*1.3)}
      else{x=host.getLang()==='ar'?r.left+s*1.1:r.right-s*1.1;y=r.top-s*1.1}
      x=Math.max(s*1.4,Math.min(W-s*1.4,x)); y=Math.max(100,Math.min(H-70,y));
      return{x:x-W/2,y:H/2-y,s};
    }
    const mobile=W<=860, rtl=host.getLang()==='ar';
    if(current==='hero'){const r=$('#home').getBoundingClientRect();if(r.bottom>80)return{x:r.left+r.width/2-W/2,y:H/2-(r.top+r.height/2),s:Math.min(r.width*(W<=860?.17:.24),110)}}
    const wrap=$('.wrap').getBoundingClientRect(); const gutter=Math.max(70,(W-wrap.width)/2);
    const s=mobile?Math.min(30,W*.075):Math.max(34,Math.min(50,gutter*.4));
    let px=mobile?(rtl?s*1.15+4:W-s*1.15-4):(rtl?wrap.left+s*.2:wrap.right-s*.2), py;
    if(current==='projects'&&spot){const r=spot.getBoundingClientRect();if(!mobile)px=rtl?r.left+8:r.right-8;py=r.top+20}
    else{const sec=active();const h2=sec.querySelector('h2');const r=(h2||sec).getBoundingClientRect();const sb=sec.getBoundingClientRect();py=Math.max(110,Math.min(sb.bottom-80,r.top+r.height/2));}
    py=Math.max(100,Math.min(H-70,py));
    return{x:px-W/2,y:H/2-py,s};
  }
  function cyclePj(){clearInterval(pjTimer);document.querySelectorAll('.pj.spot').forEach(e=>e.classList.remove('spot'));spot=null;
    if(current!=='projects')return;
    const show=()=>{const P=C().projects,p=P[pjIdx%P.length];spot=$('#pj-'+p.id);document.querySelectorAll('.pj').forEach(e=>e.classList.toggle('spot',e===spot));pjMode=pjIdx%3===0?'beckon':'point';if(performance.now()>hoverUntil)say(pjMode==='beckon'?RT().come.replace('{p}',p.title):(p.story||C().guide[who].projects.replace('{p}',p.title)));burst(18);pjIdx++};
    show();pjTimer=setInterval(show,4200)}

  function setHidden(v){hidden=v;store.set('guide-hidden',v?'1':'0');canvas.style.visibility=v?'hidden':'visible';bubble.hidden=v;hit.hidden=v;$('#recall').hidden=!v;if(!v){lastLine='';current=null}}
  $('#hide').onclick=()=>setHidden(true); $('#recall').onclick=()=>setHidden(false); setHidden(hidden);

  const clock=new THREE.Clock(); let moodName='curious', prevMood='curious';
  const lerp=(a,b,k)=>a+(b-a)*k, ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2, clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const back=t=>{const c1=1.70158,c3=c1+1;return 1+c3*Math.pow(t-1,3)+c1*Math.pow(t-1,2)};
  const easeIO=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
  let anchor={x:0,y:0}, flight=null; const spring={vx:0,vy:0};
  let phase=0, shyX=0, shyY=0, bankS=0, hoverBias=0, lastEmote=-99; const look={x:0,y:0};
  /* gesture: it gathers itself in, then opens up (used for every change of feeling) */
  const gesture={t:9,kind:'',burst:false};
  function gestureShape(){
    const u=gesture.t;
    if(gesture.kind==='land'){const e=Math.exp(-5*u)*Math.cos(9*u);return{sx:1+.06*e,sy:1-.08*e,curl:0,glow:1}}
    const hold=gesture.kind==='fly'?.22:.34, depth=gesture.kind==='fly'?.08:.16;
    if(u<hold){const g=easeIO(u/hold);return{sx:1-depth*g,sy:1-depth*g,curl:.35*g,glow:1-.35*g}}
    if(!gesture.burst&&gesture.kind==='emote'){gesture.burst=true;if(!RM)burst(16)}
    const v=u-hold, e=Math.exp(-3.8*v)*Math.cos(7*v);
    return{sx:1-depth*e,sy:1-depth*e,curl:.35*e,glow:1+.5*Math.exp(-2.5*v)};
  }

  function loop(){
    if(stopped)return;requestAnimationFrame(safeLoop);
    if(document.hidden)return;
    const dt=Math.max(.001,Math.min(clock.getDelta(),.05)), t=clock.elapsedTime, now=performance.now();
    // section + lines
    const sec=active().dataset.guide;
    if(sec!==current){onSection(sec,current);current=sec;lineIdx=0;lineTimer=0;cyclePj();sayFor(sec)}
    if(isHover())lineTimer=-5;lineTimer+=dt;if(current!=='projects'&&lineTimer>7){lineTimer=0;lineIdx++;sayFor(current)}
    // movement: a glide along a curved path when it changes place, a soft spring otherwise
    const tg=target();
    if(first){cur.x=tg.x;cur.y=tg.y;cur.s=tg.s;first=false;anchor={x:tg.x,y:tg.y}}
    // hovering: once at its spot it drifts slowly around it, up and down, leaning toward the mouse side
    const R=cur.s*(docked()?.06:isHover()?.18:current==='hero'?.12:1.1);
    hoverBias=lerp(hoverBias,clamp((mouse.y-tg.y)/(H*.5),-1,1),1-Math.exp(-dt*.6));
    const hx=RM?0:Math.sin(t*.21)*R*.45+Math.sin(t*.09+2)*R*.25;
    const hy=RM?0:Math.sin(t*.16+1)*R*.8+hoverBias*R*.6;
    const gx=tg.x+hx, gy=tg.y+hy, ox=cur.x, oy=cur.y;
    // travel: always slides toward its spot, never faster than a calm walking pace, and it can never overshoot,
    // so there is nothing to vibrate. Scroll fast and it simply trails behind, then catches up.
    const dx=gx-cur.x, dy=gy-cur.y, d=Math.hypot(dx,dy);
    if(d>.01){
      const MAXV=RM?1e5:Math.min(240,Math.max(150,W*.17))*(docked()||nudging()?3:isHover()?2.2:1);
      const step=Math.min(d, Math.min(MAXV, d*1.4)*dt);
      cur.x+=dx/d*step; cur.y+=dy/d*step;
    }
    anchor={x:tg.x,y:tg.y};
    cur.s=lerp(cur.s,tg.s,1-Math.exp(-dt*3));
    const vk=1-Math.exp(-dt*5); cur.vx=lerp(cur.vx,(cur.x-ox)/dt,vk); cur.vy=lerp(cur.vy,(cur.y-oy)/dt,vk);
    const speed=Math.hypot(cur.vx,cur.vy);
    // pick a mood
    const dm=Math.hypot(mouse.x-cur.x,mouse.y-cur.y);
    let want=SECTION_MOOD[current]||'calm';
    if(speed>120)want='flying';
    else if(dm<cur.s*1.3&&now-lastMove<1500)want='shy';
    else if(dm<cur.s*3.2&&now-lastMove<1500)want=want==='excited'?'excited':'curious';
    if(now-Math.max(lastScroll,lastMove)>10000)want='sleepy';
    if(want!==moodName){prevMood=moodName;moodName=want;
      // emote only when resting and not too often, so it never flickers
      if(want!=='flying'&&prevMood!=='flying'&&want!=='shy'&&prevMood!=='shy'&&t-lastEmote>8){lastEmote=t;gesture.t=0;gesture.kind='emote';gesture.burst=false}
      if(want==='sleepy'&&!isHover())say(C().guide[who].idle);
      if(want==='shy'&&Math.random()<.5)say(C().guide[who].near);
      if(prevMood==='sleepy'){lastLine='';sayFor(current)}}
    const mk=1-Math.exp(-dt*2.4);for(const key in m)m[key]=lerp(m[key],MOODS[moodName][key],mk);
    // transition (sunset / moonrise)
    let sinkOut=0, riseIn=0;
    if(trans){trans.t+=dt/(RM?.6:2.4);const tt=trans.t;
      if(tt<.45){sinkOut=ease(tt/.45)}
      else{if(!trans.swapped){trans.swapped=true;host.applyTheme(trans.next);who=trans.to;lastLine='';say(C().guide[who].arrive);lineTimer=-3}
        riseIn=1-back(clamp((tt-.5)/.5,0,1));sinkOut=0}
      if(tt>=1){trans=null;$('#horizon').className='';}
    }
    const isMoon=who==='moon';
    moon.visible=isMoon; sun.visible=!isMoon;
    // pose
    gesture.t+=dt; const gs=RM?{sx:1,sy:1,curl:0,glow:1}:gestureShape();
    // slow, layered sines only: floating, never shaking
    phase+=dt*m.bobSp;
    const bob=RM?0:Math.sin(phase)*m.bob+Math.sin(phase*.53+1.3)*m.bob*.35;
    const sway=RM?0:Math.sin(phase*.5)*.06;
    const dist=Math.hypot(mouse.x-cur.x,mouse.y-cur.y)+1;
    const shy=docked()||nudging()?0:m.back*Math.max(0,1-dist/(cur.s*3));
    shyX=lerp(shyX,shy*(cur.x-mouse.x)/dist*cur.s*.9,1-Math.exp(-dt*4)); shyY=lerp(shyY,shy*(cur.y-mouse.y)/dist*cur.s*.9,1-Math.exp(-dt*4));
    const offY=-sinkOut*(H*.75)-riseIn*(H*.75);
    actor.position.set(cur.x+shyX,cur.y+bob+m.lift+shyY+offY,0);
    const br=1+Math.sin(phase*.9)*m.breathe;
    const stretch=clamp(speed/1200,0,.16);
    const S=cur.s;
    actor.scale.set(S*br*gs.sx*(1+stretch*.35),S*br*gs.sy*(1-stretch*.2),S*br*gs.sx);
    // look: lean toward the mouse (curious) or away (shy), bank into the direction of travel
    look.x=lerp(look.x,clamp((mouse.x-cur.x)/W,-.5,.5),1-Math.exp(-dt*2.5)); look.y=lerp(look.y,clamp((mouse.y-cur.y)/H,-.5,.5),1-Math.exp(-dt*2.5));
    bankS=lerp(bankS,clamp(-cur.vx/1400,-.35,.35),1-Math.exp(-dt*4));
    actor.rotation.set(-look.y*m.tilt*1.3+sinkOut*.6, look.x*m.tilt*1.5+sway, bankS+sway*.6+gs.curl*(isMoon?1:.4)+sinkOut*(isMoon?.9:-.9)+riseIn*(isMoon?-.7:.7));
    rigUpdate(dt,t,now,speed,dm,isMoon); actor.rotation.x+=rigTilt;
    sunBody.rotation.z+= (RM?0:(.06+m.spin*.25)*dt);
    // glow & colour
    const g=m.glow*gs.glow*(1-sinkOut*.6);
    moonMat.emissiveIntensity=.12+g*.16; moonHalo.material.opacity=.25+g*.32;
    moonHalo.material.color.setHSL(.13-.02*m.warm,.45+.3*Math.max(0,m.warm),.82); moonMat.emissive.setHSL(.12,.6+.2*m.warm,.55+.1*m.warm);
    moonHalo.scale.setScalar(3.6+g*.9+Math.sin(t*m.brSp*2)*.15);
    sunMat.uniforms.t.value=t; sunMat.uniforms.energy.value=.6+g*.7;
    sunHalo.material.opacity=.35+g*.35; sunHalo.scale.setScalar(4+g*1.1+Math.sin(t*m.brSp*2)*.2);
    rayList.forEach((r,i)=>{const len=.85+.18*Math.sin(t*(1.2+.4*m.glow)+i*1.3)*m.glow;r.position.set(Math.cos(r.userData.a)*len,Math.sin(r.userData.a)*len,0);r.scale.set(1,.8+.4*m.glow+.2*Math.sin(t*1.6+i),1)});
    // particles
    pMat.uniforms.col.value.set(isMoon?0xF6E7B4:0xFFC24D);
    if(!RM&&!hidden&&(speed>120||Math.random()<.04*m.glow)){const spread=S*.4;emit(actor.position.x+(Math.random()-.5)*spread,actor.position.y+(Math.random()-.5)*spread,-cur.vx*.15+(Math.random()-.5)*20,-cur.vy*.15+(Math.random()-.5)*20+(moodName==='sleepy'?25:0),3+Math.random()*6,.8+Math.random()*.8)}
    for(let i=0;i<N;i++){const p=parts[i];if(p.life>0){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=.97;p.vy*=.97}const a=Math.max(0,p.life/p.max);pPos[i*3]=p.x;pPos[i*3+1]=p.y;pPos[i*3+2]=5;pA[i]=a*.9;pS[i]=p.s*(.4+a)}
    pg.attributes.position.needsUpdate=pg.attributes.a.needsUpdate=pg.attributes.s.needsUpdate=true;
    renderer.render(scene,cam);
    // the chat button covers the whole guide (the crescent's lit side reaches well past its centre)
    if(!hidden){const hx=actor.position.x+W/2, hy=H/2-actor.position.y, hs=S*2.3;
      hit.style.width=hit.style.height=hs+'px'; hit.style.transform=`translate(${hx-hs/2}px,${hy-hs/2}px)`;}
    // bubble follows, on the side with more room
    if(!hidden){const sx=actor.position.x+W/2, sy=H/2-actor.position.y; const toLeft=sx>W*.55; const bw=bubble.offsetWidth, bh=bubble.offsetHeight;
      let bx=toLeft?sx-S*.62-bw:sx+S*.62, by=sy-S*.55-bh*.2;
      if(W<=860){bx=toLeft?sx-S*.5-bw:sx+S*.5;by=sy-S*.6-bh}
      bx=clamp(bx,8,W-bw-8); by=clamp(by,72,H-bh-8);
      bubble.style.transform=`translate(${bx}px,${by}px)`; bubble.classList.toggle('tail-r',toLeft); bubble.classList.toggle('tail-l',!toLeft);
      bubble.style.opacity=(trans&&!trans.swapped)||(W<=860&&now-saidAt>5000)?'0':'';
      bubble.style.pointerEvents=bubble.style.opacity==='0'?'none':'';}
  }
  const safeLoop=()=>{try{loop()}catch(e){console.error(e)}};
  safeLoop();
  return { relabel, switchTheme, react: reactSay, hoverSay, hoverEnd, dock, undock, nudge, destroy() { stopped = true; renderer.dispose(); } };
}
