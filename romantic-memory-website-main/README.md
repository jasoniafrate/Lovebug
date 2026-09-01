# 💜 Our Journey

A romantic interactive website created to capture memories, time, music, and stories in one emotional experience.

## ✨ Features
- Love timer since a special date
- Music playlist with floating player
- Relationship timeline & photo gallery
- Smooth animations and romantic dark theme

## 🛠 Tech Stack
HTML, CSS, JavaScript

## ▶️ How to Run
Open `index.html` in your browser.

## ▶️ How to Run
Open `index.html` in your browser (double-click or serve with a simple static server).

## 🚀 Host on GitHub Pages
1. Create a GitHub repository and push this folder.
2. In the repository settings, go to 'Pages' and select the `main` branch and `/ (root)` folder.
3. Save — your site will be available at `https://<your-username>.github.io/<repo-name>/`.

## ✏️ Adding content
- To add photos/videos for the scrapbook or reviews, place files in the repo and update the HTML/JS entries or use the review "Tambah contoh review" button to add placeholders.
- Ratings and reviews are stored in your browser's `localStorage` (so they'll persist on your browser only).

Built with love, for someone special.

## Creator (Upload) Page
There is a `Creator` section in the site where you and your partner can add posts — enter a title, a short note, and either paste a media URL or upload an image/video file. Uploaded files are stored as data URLs in your browser `localStorage`.

## Optional: Sync across devices (Supabase)
If you want posts to sync across devices, you can connect the site to a simple backend such as Supabase. High-level steps:
1. Create a free account at https://supabase.com and create a new project.
2. In the database, create a `reviews` table with columns: `id (text)`, `title (text)`, `text (text)`, `media (text)`, `media_type (text)`, `rating (text)`, `date (date)`.
3. Create a service role or RLS policy depending on your security needs.
4. Add Supabase client JS to the site and replace the `localStorage` save/load calls with Supabase `insert` and `select` calls. Keep your anon key in a safe place (or restrict writes with RLS).

If you'd like, I can scaffold the Supabase client integration and a simple migration for the `reviews` table.
