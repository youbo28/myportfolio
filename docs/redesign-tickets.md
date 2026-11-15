# Portfolio redesign: Angular tickets

Build the design from `prototype/portfolio-moon.html` into the Angular app.
Work on the branch `redesign-moon-prototype` (or a branch cut from it). Leave `main` untouched until the whole redesign is reviewed.

Tickets are in order. Each one should end with the app building (`npm run build`) and running (`npm start`).

**Fixed facts for every ticket**
- Name: **Razali Ayoub** in Latin letters, **غزالي أيوب** in Arabic.
- Email: ayoubrazali28@gmail.com
- CV: Google Drive link (not a PDF): https://drive.google.com/file/d/1ucq3uOuMHMxDRxRFfX7oy3XTGdMYhkS3/view?usp=drive_link
- LinkedIn: https://www.linkedin.com/in/ayoub-razali-507a791a8/
- GitHub: https://github.com/youbo28
- YouTube: https://www.youtube.com/@ayoubrazali2484
- No profile picture. No external images: only assets in the repo.
- The mascot speaks as me, in the first person.

---

## T1. Upgrade Angular to the latest version — ✅ DONE (Angular 21)
- Upgrade from Angular 17 one major version at a time with `ng update` (17 → 18 → 19 → …).
- Update `@ngneat/transloco` (or move to `@jsverse/transloco`), `lucide-angular`, TypeScript and Tailwind to compatible versions.
- Fix anything the upgrade breaks.

**Done when:** the current site builds and looks the same as before on the newest Angular, in all 4 languages.

**Result:** upgraded 17 → 21, one major version per commit. Moved to `@jsverse/transloco`, removed unused `lucide-angular` and `@ngx-translate`, cleaned `main.ts` / `app.config.ts`. Build passes, site runs, Arabic RTL works.
**Left over:** Angular 22 needs Node.js 22.22.3+ (this machine has 22.18). Upgrade Node, then run `npx ng update @angular/core@22 @angular/cli@22`.

## T2. Design tokens, fonts and themes — ✅ DONE
- Move the prototype's colours into CSS variables / Tailwind theme: dark "night" theme (`--sky #0B1026`, `--glow #F6E7B4`) and light "dawn" theme.
- Self-host the fonts (Bricolage Grotesque, Onest, Cairo for Arabic, JetBrains Mono) in `src/assets/fonts`.
- Keep `ThemeService` and the `portfolio-theme` localStorage key.

**Done when:** both themes switch and fonts load with no request to Google Fonts.

**Result:** Tokens and both themes ported to `src/styles.scss`; fonts self-hosted via `@fontsource`; Tailwind removed; `ThemeService` keeps `portfolio-theme`.

## T3. Page shell: navigation and background — ✅ DONE
- New nav bar: name, section links, CV button (Drive link), theme toggle, EN / FR / DE / AR switcher.
- Background sky: stars at night, drifting clouds by day.
- Section order: Hero → About → Skills → Projects → Experience → Education → Contact.
- Mobile menu.

**Done when:** the nav works on desktop and mobile, in LTR and RTL.

**Result:** Nav with section links, CV, theme toggle, EN/FR/DE/AR; star/cloud sky; mobile menu (language switcher moves into it under 640px, no horizontal scroll).

## T4. Hero section — ✅ DONE
- Greeting, name, role, "See my CV" and "Contact me" buttons, LinkedIn / GitHub / YouTube links.
- Space reserved in the centre for the mascot.

**Result:** Greeting, name, role, typewriter, CV + contact buttons, space for the guide.

## T5. About section — ✅ DONE
- Short first-person introduction, languages I speak, key facts.

**Result:** First-person intro and three fact cards.

## T6. Skills section — ✅ DONE
- Skills as grouped chips (Backend, Frontend, Database, Tools…), no percentages.
- Data from `src/assets/data/` JSON, as today.
- Decide whether to delete the unused `competance` component.

**Result:** Grouped chips from the translation files; the unused `competance` component was deleted.

## T7. Projects section — ✅ DONE
- Project cards with title, description, tech stack, live demo and GitHub links.
- A "spotlight" state on a card, which the mascot can trigger.
- Data from JSON, as today.

**Result:** Cards with drawn cover art (no screenshots), tech, GitHub/live links, spotlight state driven by the guide.

## T8. Experience and Education sections — ✅ DONE
- Timeline layout, newest first.
- Data from JSON, as today.

**Result:** Timeline (newest first, NOW tag) and education cards.

## T9. Contact section — ✅ DONE (send not verified)
- Show both the email address (with a Copy button and a `mailto:` link) and the contact form.
- The form still posts to the Netlify function `/.netlify/functions/sendEmail`.
- Success and error messages.

**Done when:** a test message arrives in the inbox from the deployed preview.

**Result:** Email with Copy + mailto, LinkedIn/GitHub/YouTube, form posting to `/.netlify/functions/sendEmail` with sending/success/error states. Locally the function does not exist, so the error message shows as expected. **Check a real send on the Netlify deploy preview.**

## T10. YouTube popup — ✅ DONE
- Restyle the popup in the new design.
- Still shows once (`youtube-modal-shown` localStorage key), closes with button, backdrop or Escape.

**Result:** Restyled; shows once (`youtube-modal-shown`); closes with button, backdrop or Escape; footer button reopens it.

## T11. Mascot: 3D scene component — ✅ DONE
- Install `three` from npm (no CDN).
- `MascotComponent` with a full-screen transparent canvas behind the bubble, above the page.
- Moon (dark theme) and sun (light theme) bodies, halo glow and stardust particles, as in the prototype.
- Pause rendering when the tab is hidden; respect `prefers-reduced-motion`.
- Fall back cleanly (no mascot) if WebGL is not available.

**Result:** `three` from npm, engine in its own lazy chunk; stops on hidden tab; reduced-motion respected; no mascot if WebGL fails. The engine file is ported prototype code and is not type-checked (`// @ts-nocheck`).

## T12. Mascot: movement — ✅ DONE
- Follows the active section: glides slowly at a capped speed, never jumps, never overshoots (no vibration).
- When the visitor scrolls fast it trails behind, then catches up after they stop.
- Hovers slowly around its spot, drifting up or down toward the mouse.
- Desktop: sits in the side gutter or on the spotlighted project card. Mobile: right edge beside each section title (left edge in Arabic).
- Theme switch: the sun sets and the moon rises (and the reverse), with the dusk/dawn sweep.

**Result:** Same motion as the approved prototype: capped-speed glide, trailing on fast scroll, slow hover, sunset/moonrise.

## T13. Mascot: hands, mouth and reactions — ✅ DONE
- Two floating 3D hands (no arms) and a mouth with several emotions.
- Reactions: wave hello, point at the real element (CV button, project card, email), "come see this" beckon, present, joy/clap, thumbs-up, thank-you bow, curious, surprised, shy, sleepy/yawn, travel, goodbye/hello wave on theme switch.
- Tie them to sections and events (copy email → joy, form sent → thanks, language change → surprised).
- Professional, not too cute: slow, smooth easing.

**Result:** All reactions ported and wired to sections and events.

## T14. Mascot: speech bubble and lines — ✅ DONE
- Speech bubble that follows the mascot and flips side when there is no room; fades after a few seconds on mobile.
- All lines in the translation files (`en`, `fr`, `de`, `ar`), first person, separate moon and sun lines.
- Write the French and German lines (the prototype only has English and Arabic).
- A button to hide the mascot, remembered in localStorage.

**Result:** Lines for moon and sun in EN, FR, DE, AR (first person); hide/recall button.

## T15. i18n and RTL review — ✅ DONE
- Every visible string in all 4 languages, including the mascot lines.
- Arabic: RTL layout, Cairo font, mascot and bubble mirrored.

**Result:** Every key exists in all 4 files; switching tested in the browser for FR, DE, AR (RTL, Cairo font, guide lines).

## T16. Quality pass and release — 🟡 IN PROGRESS
- Test on desktop and mobile (Chrome, Firefox, Safari), both themes, all 4 languages.
- Accessibility: keyboard navigation, focus states, contrast, `aria-hidden` on the 3D canvas.
- Performance: Lighthouse check, lazy-load three.js, keep the bundle small.
- Update `intent.md` and the README.
- Netlify deploy preview → review → merge to `main`.

**Result:** Done: production build passes; main bundle 65 kB gzipped, three.js lazy (129 kB gzipped); README and intent.md updated; unused router, animations, images and packages removed. **Still to do (needs you):** test on a real phone and on Safari/Firefox; run Lighthouse; open a Netlify deploy preview, check the contact form sends, then merge to `main`.

