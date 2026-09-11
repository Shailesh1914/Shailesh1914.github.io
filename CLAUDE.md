# CLAUDE.md

Reference for working on this project. Read this before making changes so conventions stay consistent across sessions.

## What this is

Shailesh Srivastava's personal portfolio site, deployed on GitHub Pages via the special user-site repo `Shailesh1914/Shailesh1914.github.io`. Plain HTML/CSS/JS — no build step, no framework, no bundler.

## File/folder layout

```
Shailesh1914.github.io/
├── CLAUDE.md                    # this file
├── SPEC.md                      # content/design spec — source of truth for what the site should contain
├── projects.md                  # source data for the Projects section (title, description, link per project)
├── shaileshsrivastava_Resume.pdf # source data for the About section — About content must be pulled only from this file, never invented
├── index.html                   # the entire site — single page (About, Work/Projects, Contact)
├── style.css                    # all styling; light/dark theme via CSS custom properties + prefers-color-scheme
└── script.js                    # theme toggle + footer year, vanilla JS only
```

Conventions:
- Single-page site — do not split into multiple HTML pages/routes (see SPEC.md "Visual constraints").
- `index.html`, `style.css`, `script.js` are served as-is by GitHub Pages — no build/compile step. Any edit to these files is live immediately after a push to `main`.
- `projects.md` and the resume PDF are **source documents**, not part of the deployed site. When updating the Projects or About sections in `index.html`, pull content from these files rather than inventing copy. If `projects.md` changes, `index.html`'s Work section should be updated to match.
- `SPEC.md` records content/design requirements and acceptance criteria (link validity, Lighthouse accessibility score, load time, mobile rendering at 375px). Check new work against it before considering a change done.

## Deploying to GitHub Pages

This repo *is* the GitHub Pages source — deploying is just pushing to `main`.

1. Make changes to `index.html` / `style.css` / `script.js` locally.
2. (Optional but recommended) preview locally before pushing:
   ```bash
   cd ~/Shailesh1914.github.io
   python3 -m http.server 8765
   # open http://localhost:8765/ in a browser, then Ctrl+C or:
   pkill -f "http.server 8765"
   ```
3. Commit and push to `main`:
   ```bash
   cd ~/Shailesh1914.github.io
   git add -A
   git commit -m "<describe the change>"
   git push
   ```
4. GitHub Pages auto-builds from `main` / root (`source.branch: main`, `source.path: /` — already configured, no further setup needed). The live site updates at **https://shailesh1914.github.io/** within roughly 30–60 seconds of the push.
5. To confirm the deploy finished:
   ```bash
   gh api repos/Shailesh1914/Shailesh1914.github.io/pages
   # status should read "built" (not "building")
   curl -s -o /dev/null -w "%{http_code}\n" https://shailesh1914.github.io/
   # should return 200
   ```

## Auth / tooling assumed available

- `git` is configured with `user.name "Shailesh1914"` and `user.email "ssrivastava1914@gmail.com"` locally in this repo (note: this is the git-commit identity, distinct from the site's public contact email `shailesh1914@hotmail.com` used in the Contact section — don't conflate the two).
- `gh` (GitHub CLI) is installed and authenticated as `Shailesh1914` with `repo` and `workflow` scopes. Use it for repo/Pages status checks (`gh api repos/...`) rather than the web UI when working from this environment.
- Remote: `origin` → `https://github.com/Shailesh1914/Shailesh1914.github.io.git`, default branch `main`.
