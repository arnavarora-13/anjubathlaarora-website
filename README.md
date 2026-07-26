# Dr. Anju Bathla Arora Website

Official website of Dr. Anju Bathla Arora—Author, Researcher, and Associate Professor. This repository features a completely client-side architecture with a static Articles Management system.

---

## Architecture & Flexibility

The website is designed to be **highly portable and flexible**, meaning it can be deployed on virtually any web hosting platform without complex backend setup.
- **Client-Side Database**: The articles system uses browser `localStorage`. No database credentials (like MySQL/Postgres) are required.
- **Clean URLs**: Clean path resolution (e.g., `/admin` instead of `/admin.html`) is supported across different hosting configurations (Node.js, Apache/htaccess, and Vercel).

---

## Deployment Instructions

Here is how you can deploy this website on various popular hosting platforms:

### 1. Vercel (Recommended - Free & Fast)
Vercel is ideal for static portfolios and handles clean URLs automatically using `vercel.json`.
1. Push this repository to GitHub.
2. Sign in to [Vercel](https://vercel.com/) and click **Add New** > **Project**.
3. Import this repository.
4. Keep the default settings (Vercel automatically detects the static HTML files) and click **Deploy**.
5. Done! Vercel handles `/admin` -> `admin.html` routing natively because of the configured `"cleanUrls": true` in `vercel.json`.

---

### 2. Hostinger
Depending on your Hostinger plan, you can deploy the site as a Static website or as a Node.js server.

#### Option A: Shared Hosting / Apache (cPanel File Manager)
If you have standard shared hosting:
1. Open the Hostinger cPanel and navigate to the **File Manager**.
2. Open the `public_html` folder.
3. Upload all the files from this repository directly into `public_html`.
4. The `.htaccess` file provided in the repository will automatically rewrite clean URLs (e.g., requests to `/admin` will load `admin.html` without changing the browser URL).

#### Option B: Hostinger VPS or Node.js Selector
If you want to run the Node.js development server on Hostinger:
1. Set up a Node.js Application using Hostinger's Node.js Selector (cPanel) or on a VPS.
2. Set the entry file/startup script to `server.js`.
3. The server dynamically binds to `process.env.PORT || 8000`, matching Hostinger's automatic port allocation.
4. Run `npm start` or specify `node server.js` as the startup command.

---

### 3. Netlify (Free & Fast)
Netlify is another excellent option for hosting static sites:
1. Push this repository to GitHub.
2. Log in to [Netlify](https://www.netlify.com/) and select **Import from Git**.
3. Choose this repository.
4. Set the **Publish directory** to `.` (the root folder).
5. Click **Deploy**. Netlify automatically supports clean URLs for HTML files.

---

### 4. GitHub Pages (Free)
To deploy on GitHub Pages:
1. Push this repository to GitHub.
2. Go to **Settings** > **Pages** in your repository.
3. Under **Build and deployment**, set the source to **Deploy from a branch** and select `main` (root directory).
4. Click **Save**.
5. *Note: Since GitHub Pages is a basic static host, it doesn't do server-side URL rewrites. To access pages, use the full extension (e.g., `yoursite.github.io/admin.html`) or navigate using links.*

---

## Local Development

To run the project locally:
1. Ensure you have [Node.js](https://nodejs.org/) installed.
2. Run the start command:
   ```bash
   npm start
   ```
3. Open `http://localhost:8000` in your web browser.
