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

## T2. Design tokens, fonts and themes
- Move the prototype's colours into CSS variables / Tailwind theme: dark "night" theme (`--sky #0B1026`, `--glow #F6E7B4`) and light "dawn" theme.
- Self-host the fonts (Bricolage Grotesque, Onest, Cairo for Arabic, JetBrains Mono) in `src/assets/fonts`.
- Keep `ThemeService` and the `portfolio-theme` localStorage key.

**Done when:** both themes switch and fonts load with no request to Google Fonts.

## T3. Page shell: navigation and background
- New nav bar: name, section links, CV button (Drive link), theme toggle, EN / FR / DE / AR switcher.
- Background sky: stars at night, drifting clouds by day.
- Section order: Hero → About → Skills → Projects → Experience → Education → Contact.
- Mobile menu.

**Done when:** the nav works on desktop and mobile, in LTR and RTL.

## T4. Hero section
- Greeting, name, role, "See my CV" and "Contact me" buttons, LinkedIn / GitHub / YouTube links.
- Space reserved in the centre for the mascot.

## T5. About section
- Short first-person introduction, languages I speak, key facts.

## T6. Skills section
- Skills as grouped chips (Backend, Frontend, Database, Tools…), no percentages.
- Data from `src/assets/data/` JSON, as today.
- Decide whether to delete the unused `competance` component.

## T7. Projects section
- Project cards with title, description, tech stack, live demo and GitHub links.
- A "spotlight" state on a card, which the mascot can trigger.
- Data from JSON, as today.

## T8. Experience and Education sections
- Timeline layout, newest first.
- Data from JSON, as today.

## T9. Contact section
- Show both the email address (with a Copy button and a `mailto:` link) and the contact form.
- The form still posts to the Netlify function `/.netlify/functions/sendEmail`.
- Success and error messages.

**Done when:** a test message arrives in the inbox from the deployed preview.

## T10. YouTube popup
- Restyle the popup in the new design.
- Still shows once (`youtube-modal-shown` localStorage key), closes with button, backdrop or Escape.

## T11. Mascot: 3D scene component
- Install `three` from npm (no CDN).
- `MascotComponent` with a full-screen transparent canvas behind the bubble, above the page.
- Moon (dark theme) and sun (light theme) bodies, halo glow and stardust particles, as in the prototype.
- Pause rendering when the tab is hidden; respect `prefers-reduced-motion`.
- Fall back cleanly (no mascot) if WebGL is not available.

## T12. Mascot: movement
- Follows the active section: glides slowly at a capped speed, never jumps, never overshoots (no vibration).
- When the visitor scrolls fast it trails behind, then catches up after they stop.
- Hovers slowly around its spot, drifting up or down toward the mouse.
- Desktop: sits in the side gutter or on the spotlighted project card. Mobile: right edge beside each section title (left edge in Arabic).
- Theme switch: the sun sets and the moon rises (and the reverse), with the dusk/dawn sweep.

## T13. Mascot: hands, mouth and reactions
- Two floating 3D hands (no arms) and a mouth with several emotions.
- Reactions: wave hello, point at the real element (CV button, project card, email), "come see this" beckon, present, joy/clap, thumbs-up, thank-you bow, curious, surprised, shy, sleepy/yawn, travel, goodbye/hello wave on theme switch.
- Tie them to sections and events (copy email → joy, form sent → thanks, language change → surprised).
- Professional, not too cute: slow, smooth easing.

## T14. Mascot: speech bubble and lines
- Speech bubble that follows the mascot and flips side when there is no room; fades after a few seconds on mobile.
- All lines in the translation files (`en`, `fr`, `de`, `ar`), first person, separate moon and sun lines.
- Write the French and German lines (the prototype only has English and Arabic).
- A button to hide the mascot, remembered in localStorage.

## T15. i18n and RTL review
- Every visible string in all 4 languages, including the mascot lines.
- Arabic: RTL layout, Cairo font, mascot and bubble mirrored.

## T16. Quality pass and release
- Test on desktop and mobile (Chrome, Firefox, Safari), both themes, all 4 languages.
- Accessibility: keyboard navigation, focus states, contrast, `aria-hidden` on the 3D canvas.
- Performance: Lighthouse check, lazy-load three.js, keep the bundle small.
- Update `intent.md` and the README.
- Netlify deploy preview → review → merge to `main`.
