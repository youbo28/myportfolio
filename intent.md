# Intent — My Portfolio

## Purpose

This project is the personal portfolio website of **Razali Ayoub**, a Full-Stack Developer specialized in **Java Spring Boot** and **Angular**. It is live at [ayoubrazali.site](https://ayoubrazali.site).

The site has four goals:

1. **Introduce me.** Say who I am, what I do and what I care about as a developer.
2. **Show my work.** List real projects with their tech stacks, live links and GitHub repositories.
3. **Show my background.** Present my professional experience, education and technical skills in a clear, structured way.
4. **Make contact easy.** Let recruiters, clients and collaborators reach me directly through a contact form, and point visitors to my YouTube channel.

## Target audience

- Recruiters and hiring managers looking at full-stack / Java / Angular profiles
- Potential freelance clients
- Other developers and people in the tech community, including viewers of my YouTube channel
- An international audience: English, French, German and Arabic speakers

## Key features

### Single-page layout
The whole portfolio is one scrolling page, in this order: Hero → About → Skills → Projects → Experience → Education → Contact (`src/app/app.component.ts`).

### 3D guide
A 3D mascot (`src/app/mascot/`) represents me and speaks in the first person: a crescent moon in dark mode, a sun in light mode. It has floating hands and an expressive mouth, glides slowly to the section being read, hovers there, points at the CV button, project cards and the email, and reacts to events (copying the email, sending the form, changing language). Switching the theme plays a sunset or moonrise.

### Multilingual (i18n)
- Available in **English, French, German and Arabic** through Transloco (`src/assets/i18n/*.json`).
- The page switches to **RTL** layout when Arabic is selected (`dir="rtl"`, with `tailwindcss-rtl`).
- All content, including project titles and descriptions, is referenced by translation keys, so every language gets the same content.

### Data-driven content
Projects, experience, education, skills and the guide's lines live in the translation files `src/assets/i18n/*.json`. Updating the portfolio means editing JSON, not templates.

### Light / dark theme
`ThemeService` sets `data-theme` on the root element and saves the choice in `localStorage` (`portfolio-theme`).

### Contact form
The form posts to a serverless **Netlify Function** (`/.netlify/functions/sendEmail`), so messages reach my inbox without a dedicated backend.

### YouTube channel announcement
On a visitor's first visit, a modal announces my YouTube channel. It closes with the button, a backdrop click or `Escape`, and it doesn't come back after that (`localStorage` key `youtube-modal-shown`).

## Featured projects

- **Portfolio** (this site): Angular, Tailwind CSS, SCSS
- **Movies Watchlist**: Spring Boot
- **Loan Management**: Angular, Spring Boot, MySQL
- **Library Management**: JEE, JavaScript, MySQL

## Tech stack

- **Framework:** Angular 21 (standalone components, signals)
- **Styling:** plain SCSS with CSS custom properties (`src/styles.scss`)
- **3D:** three.js, loaded lazily
- **i18n:** `@jsverse/transloco`
- **Fonts:** self-hosted with `@fontsource`
- **Hosting:** Netlify, with Netlify Functions for email

## Design principles

- **Clean and professional:** a modern, readable layout that keeps the focus on the content
- **Responsive:** works on mobile, tablet and desktop
- **Accessible to everyone:** four languages, RTL support and both themes
- **Easy to maintain:** content in JSON and translations kept apart from the code
- **Lightweight:** a static single-page app with no dedicated backend server

## Non-goals

- No blog or CMS. Content is updated through JSON and translation files.
- No user accounts and no authentication.
- No multi-page routing. The router is set up but has no routes.

## Running locally

```bash
npm install
npm start      # http://localhost:4200
npm run build  # production build in dist/
```
