// @ts-nocheck
/* Background sky canvas (ported from the prototype). */
const $ = (s) => document.querySelector(s);

export function createSky(): void {
  const RM = matchMedia('(prefers-reduced-motion:reduce)').matches;
  const root = document.documentElement;
(()=>{const c=$('#sky'),x=c.getContext('2d');let w,h,stars=[],clouds=[],dpr=Math.min(2,devicePixelRatio||1),night=1;
  function reset(){w=c.width=innerWidth*dpr;h=c.height=innerHeight*dpr;c.style.width=innerWidth+'px';c.style.height=innerHeight+'px';
    stars=Array.from({length:Math.round(innerWidth*innerHeight/5200)},()=>({x:Math.random()*w,y:Math.random()*h,r:(Math.random()*1.3+.3)*dpr,p:Math.random()*6}));
    clouds=Array.from({length:6},(_,i)=>({x:Math.random()*w,y:(.08+i*.15)*h,s:(60+Math.random()*90)*dpr,v:(.08+Math.random()*.12)*dpr}));}
  function draw(t){x.clearRect(0,0,w,h);night+=((root.dataset.mode==='light'?0:1)-night)*.04;
    if(night>.02){for(const s of stars){x.globalAlpha=night*(.35+.45*Math.sin(t/900+s.p)**2);x.fillStyle='#EEF1FF';x.beginPath();x.arc(s.x,s.y,s.r,0,7);x.fill()}}
    if(night<.98){x.fillStyle='#FFFFFF';for(const k of clouds){if(!RM)k.x=(k.x+k.v)%(w+k.s*3);x.globalAlpha=.55*(1-night);for(let i=0;i<4;i++){x.beginPath();x.arc(k.x-k.s+i*k.s*.6,k.y-(i%2)*k.s*.3,k.s*(.5+(i%2)*.2),0,7);x.fill()}}}
    x.globalAlpha=1;requestAnimationFrame(draw)}
  addEventListener('resize',reset);reset();requestAnimationFrame(draw);return{reset}})();
}

