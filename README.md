# SimpleSync website

Landing page for [SimpleSync](https://github.com/jirkacepelka/SimpleSync) — a static site (plain HTML, CSS and JS, no build step) deployed on Vercel.

## Structure

- `index.html` — the landing page
- `guide.html` — the setup guide (server, plugin, sharing, backups, troubleshooting)
- `styles.css` — styles shared by both pages
- `script.js` — small interactive bits
- `assets/` — icon and admin screenshots

## Local preview

```sh
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Deploy

Import this repository in Vercel as a static project: framework preset "Other", no build command, output directory `.` (repository root).

The site was moved here from the `website/` folder of the SimpleSync repository; its history is preserved.
