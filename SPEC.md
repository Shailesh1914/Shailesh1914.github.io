# Portfolio site, Shailesh Srivastava

Program & Project Management Professional. Personal portfolio, deployed on GitHub Pages.

Source document: `projects.md` (About text and projects list).

## Who is this for

Recruiters and organisations I apply to, and fellow learners.

## Sections

- **About**: two paragraphs, copied verbatim from the About section of `projects.md`.
  The text is written by me; the agent must not write, rewrite or extend it.
- **Projects**: a table with columns Title | Description | Link, generated from
  the Projects list in `projects.md`. Adding a project means editing `projects.md` only.
- **Contact**: a link to my GitHub profile (https://github.com/Shailesh1914).
  No email address, no phone number, no contact form.

## Privacy

- No email address, phone number or resume file is published on the site.

## Voice

Plain, specific, first person. Keep it simple.

Never the words: bespoke, curated, elevate, transform, journey, passion.

## Visual constraints

- Single page (no separate routes/pages).
- Warm and light: sand, clay and terracotta. Not a dark theme.
- Must render correctly on a 375px-wide mobile viewport (no horizontal scroll,
  no overlapping or clipped content).

## Acceptance criteria

Automated (run by `npm test`):

1. Every link in the Projects and Contact sections returns a success status (no 404s).
2. Lighthouse accessibility score ≥ 90 (mobile preset).
3. Lighthouse performance, mobile preset, first uncached load: Largest Contentful Paint ≤ 2.0 s.
4. At a 375px viewport, the page has no horizontal scroll (page width ≤ viewport width).
5. None of the banned words (see Voice) appear in the page text (case-insensitive).
6. The page contains no email address, no phone number and no link to a .pdf file.
7. The About text on the page matches the About section of `projects.md` exactly.

Manual (checked by me before each release):

- Colours are warm and light (sand, clay, terracotta); no dark theme.
- On a 375px screen, nothing overlaps or is clipped.

## Planned for later (not in this version)

- LinkedIn profile link in Contact.

## Deployment

GitHub Pages, from `main`, at https://shailesh1914.github.io.