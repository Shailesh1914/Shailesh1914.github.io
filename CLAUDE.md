# CLAUDE.md

Read this before making changes so conventions stay consistent across sessions.

## What this is

Shailesh Srivastava's personal portfolio site, deployed on GitHub Pages from the
user-site repo `Shailesh1914/Shailesh1914.github.io`. Plain HTML/CSS/JS: no build
step, no framework, no bundler.

## Source of truth

- `SPEC.md` defines what the site must contain and its acceptance criteria.
  If a request conflicts with SPEC.md, stop and ask. Never edit SPEC.md unless
  explicitly asked.
- `projects.md` holds the About text and the Projects list.

## File layout

Shailesh1914.github.io/
├── CLAUDE.md      # this file
├── SPEC.md        # requirements and acceptance criteria
├── projects.md    # source: About text + Projects list
├── index.html     # the entire site, single page (About, Projects, Contact)
├── style.css      # all styling
├── script.js      # small vanilla JS only (e.g. footer year)
├── scripts/       # test scripts used by npm test
├── package.json   # test tooling
└── .gitignore

## Content rules

- About: copy the two paragraphs under "## About" in projects.md verbatim.
  Never write, rewrite, shorten or extend them.
- Projects: a table (Title | Description | Link) generated from "## Projects"
  in projects.md. When projects.md changes, update index.html to match.
- Contact: a link to https://github.com/Shailesh1914 only. Never add an email
  address, phone number, contact form, or a link to a resume or any PDF.
- Voice and banned words: see SPEC.md.

## Styling rules

- Light theme only: sand, clay and terracotta. No dark mode, no
  prefers-color-scheme dark overrides, no theme toggle.

## Privacy

- Every file committed to this repo is public and served by GitHub Pages,
  including .md files. Never commit email addresses, phone numbers or resume
  files to any file.

## Definition of done

1. `npm run test:local` passes before pushing.
2. After deploying, `npm run test:live` passes.
3. The manual checks in SPEC.md have been reviewed.
4. The diff stays within the requested scope; nothing unrequested changed.

## Deploying

1. Preview locally: `python3 -m http.server 8765`, open http://localhost:8765/
2. Run `npm run test:local`.
3. Stage files by name (not `git add -A`), commit, `git push` to main.
4. GitHub Pages rebuilds in about 30-60 seconds. Confirm with
   `gh api repos/Shailesh1914/Shailesh1914.github.io/pages` (status "built").
5. Run `npm run test:live`.

## Tooling

- `gh` is authenticated as Shailesh1914. Remote `origin` is
  https://github.com/Shailesh1914/Shailesh1914.github.io.git, branch `main`.