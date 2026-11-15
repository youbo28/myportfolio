# Razali Ayoub · Portfolio

Personal portfolio of Razali Ayoub, full-stack developer (Java Spring Boot, Angular). Live at [ayoubrazali.site](https://ayoubrazali.site).

A single scrolling page with a 3D guide: a crescent moon at night and a sun by day, with floating hands and a mouth, that glides beside the section you are reading, points at things and talks in a speech bubble (in the first person).

## Run it

```bash
npm install
npm start        # http://localhost:4200
npm run build    # production build in dist/
```

## Where things live

| What | Where |
|---|---|
| All text, project / job / education content and the guide's lines | `src/assets/i18n/{en,fr,de,ar}.json` |
| Links (CV on Google Drive, email, LinkedIn, GitHub, YouTube) | `src/app/core/content.ts` |
| Page sections | `src/app/sections/` |
| Nav bar, background sky, YouTube popup | `src/app/layout/` |
| 3D guide (three.js, loaded in its own chunk) | `src/app/mascot/` |
| Colours, fonts, light/dark themes | `src/styles.scss` |
| Design reference | `prototype/portfolio-moon.html` |

## Stack

Angular 21 (standalone components, signals), Transloco (`@jsverse/transloco`) for EN / FR / DE / AR with right-to-left Arabic, three.js for the guide, self-hosted fonts through `@fontsource`. The contact form posts to the Netlify function `/.netlify/functions/sendEmail`.
