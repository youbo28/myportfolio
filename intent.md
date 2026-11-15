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
The whole portfolio is one scrolling page. The sections appear in this order (`src/app/app.component.html`):

| Section | Component | Content |
|---|---|---|
| Navigation | `nav-bar` | Section links, resume, theme toggle, language switcher |
| YouTube announcement | `youtube-modal` | One-time popup announcing my new channel |
| Hero | `hero` | Greeting, typewriter text and a "Contact Me" call to action |
| About | `about-me` | Personal introduction and skills/competences |
| Projects | `project` | Project cards (image, description, technologies, demo and GitHub links) |
| Experience | `experience` | Professional experience timeline |
| Education | `education` | Academic background |
| Contact | `contact-me` | Contact form |

### Multilingual (i18n)
- Available in **English, French, German and Arabic** through Transloco (`src/assets/i18n/*.json`).
- The page switches to **RTL** layout when Arabic is selected (`dir="rtl"`, with `tailwindcss-rtl`).
- All content, including project titles and descriptions, is referenced by translation keys, so every language gets the same content.

### Data-driven content
Projects, experience, education, skills and competences live in JSON files in `src/assets/data/` and are loaded by dedicated services (`src/app/services/`). Updating the portfolio means editing JSON, not templates.

### Light / dark theme
`ThemeService` toggles Tailwind's `dark` class on the root element and saves the choice in `localStorage` (`portfolio-theme`).

### Contact form
The form posts to a serverless **Netlify Function** (`/.netlify/functions/sendEmail`), so messages reach my inbox without a dedicated backend.

### YouTube channel announcement
On a visitor's first visit, an animated modal (fireworks, confetti, sparkles, in green tones inspired by Spring Boot) announces my YouTube channel. It closes with the button, a backdrop click or `Escape`, and it doesn't come back after that (`localStorage` key `youtube-modal-shown`).

## Featured projects

- **Portfolio** (this site): Angular, Tailwind CSS, SCSS
- **Movies Watchlist**: Spring Boot
- **Loan Management**: Angular, Spring Boot, MySQL
- **Library Management**: JEE, JavaScript, MySQL

## Tech stack

- **Framework:** Angular 17 (standalone components)
- **Styling:** Tailwind CSS 3 + SCSS, `tailwindcss-rtl`
- **i18n:** `@ngneat/transloco`
- **Icons:** `lucide-angular`
- **Animations:** `@angular/animations` and CSS keyframes
- **Hosting:** Netlify, with Netlify Functions for email
- **Testing:** Jasmine + Karma

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
