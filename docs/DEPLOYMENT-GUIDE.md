# React + Vite GitHub Pages Deployment Guide

A complete guide for deploying React + Vite applications to GitHub Pages, covering initial setup, automated CI/CD, and multi-environment deployments.

---

## Table of Contents

1. [Quick Start (Experienced Developers)](#quick-start-experienced-developers)
2. [Understanding GitHub Pages](#understanding-github-pages)
3. [Initial Setup](#initial-setup)
4. [Automated Deployment with GitHub Actions](#automated-deployment-with-github-actions)
5. [Multi-Environment Deployments](#multi-environment-deployments)
6. [Verification & Testing](#verification--testing)
7. [Troubleshooting](#troubleshooting)

---

## Quick Start (Experienced Developers)

**TL;DR**: Configure base path → push to main → GitHub Actions deploys automatically.

```js
// vite.config.js
export default {
  base: '/your-repo-name/',  // Must match your GitHub repo name
  // ... rest of config
}
```

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

**Then:** Go to repo Settings → Pages → Set source to "GitHub Actions". Done.

---

## Understanding GitHub Pages

### User Pages vs Project Pages

GitHub Pages hosts content in two ways:

| Type | URL | Repository | Base Path |
|------|-----|-----------|-----------|
| **User/Org Pages** | `username.github.io` | `username/username.github.io` | `/` (root) |
| **Project Pages** | `username.github.io/repo-name` | `username/repo-name` | `/repo-name/` |

### Why Base Path Matters

When your React app is hosted at `username.github.io/my-app/`, all assets must be requested from `/my-app/`.

**Without base path configuration:**
- HTML loads from `my-app/index.html` ✓
- But CSS tries to load from `/styles.css` (root) ✗
- Images look for `/logo.png` instead of `/my-app/logo.png` ✗
- React Router routes break ✗

**With proper configuration:**
- All assets load from `/my-app/styles.css` ✓
- Router links work correctly ✓

---

## Initial Setup

### Prerequisites

- Node.js 16+ installed
- Git repository on GitHub
- Basic knowledge of npm and Git

### Step 1: Configure Vite Base Path

Open `vite.config.js` and set the `base` option to your repository name:

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/JesusSays/',  // Replace 'JesusSays' with your repo name
  plugins: [react()],
  // ... rest of your configuration
})
```

> **For user pages** (username.github.io): Use `base: '/'` (root)
> **For project pages** (username.github.io/repo): Use `base: '/repo/'`

### Step 2: Install Dependencies

If you haven't already, ensure `gh-pages` is installed (useful for local testing):

```bash
npm install --save-dev gh-pages
```

Or use GitHub Actions (recommended) — no additional package needed.

### Step 3: Test Build Locally

```bash
npm run build
```

This creates a `dist/` folder with your optimized production build.

### Step 4: Preview Build Locally

```bash
npm run preview
```

This starts a local server showing your production build. Open `http://localhost:4173` and verify:
- ✓ Page loads without 404 errors
- ✓ All CSS and images display correctly
- ✓ React Router navigation works
- ✓ Links point to correct paths (e.g., `/JesusSays/category/grace`)

---

## Automated Deployment with GitHub Actions

Automated deployment means your site updates automatically every time you push to `main`.

### Step 1: Create GitHub Actions Workflow

Create file: `.github/workflows/deploy.yml`

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      # Step 1: Check out code
      - name: Checkout code
        uses: actions/checkout@v4
      
      # Step 2: Set up Node.js
      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm  # Cache node_modules for faster builds
      
      # Step 3: Install dependencies
      - name: Install dependencies
        run: npm ci
      
      # Step 4: Build the app
      - name: Build
        run: npm run build
      
      # Step 5: Deploy to GitHub Pages
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

**Copy this file exactly** — it uses `peaceiris/actions-gh-pages@v4`, the industry-standard action for GitHub Pages deployments.

### Step 2: Commit and Push

```bash
git add .github/workflows/deploy.yml
git commit -m "Add GitHub Pages deployment workflow"
git push origin main
```

### Step 3: Enable GitHub Pages in Repository

1. Go to your GitHub repository
2. Click **Settings** → **Pages**
3. Under "Build and deployment":
   - **Source:** Select "GitHub Actions"
   - (No additional configuration needed)
4. Click **Save**

![GitHub Pages Settings](./images/gh-pages-settings.png)

### Step 4: Monitor First Deployment

1. Go to your repo's **Actions** tab
2. You should see "Deploy to GitHub Pages" workflow running
3. Wait for it to complete (usually 1-2 minutes)
4. Once complete, your site is live at `https://username.github.io/repo-name/`

---

## Multi-Environment Deployments

Deploy different branches to different environments (e.g., staging for `develop`, production for `main`).

### Setup: Staging + Production

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main, develop]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      
      - run: npm ci
      - run: npm run build
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
          # Deploy to 'main' branch (production) from 'main' branch
          target_branch: ${{ github.ref == 'refs/heads/main' && 'gh-pages' || 'gh-pages-staging' }}
```

This deploys:
- `main` branch → `gh-pages` branch → Live at `username.github.io/repo`
- `develop` branch → `gh-pages-staging` branch → Live at `username.github.io/repo-staging` (if you create a secondary Pages source)

### Alternative: Environment Variables in Build

You can also configure different API endpoints, features, or branding per environment:

```bash
# In your workflow
- run: npm run build
  env:
    VITE_API_URL: ${{ github.ref == 'refs/heads/main' && 'https://api.production.com' || 'https://api.staging.com' }}
```

Then use in your code:

```js
const API_URL = import.meta.env.VITE_API_URL
```

---

## Verification & Testing

### Verification Checklist

After deployment, verify your site is working:

- [ ] Site is accessible at `https://username.github.io/repo-name/`
- [ ] Home page loads without 404 errors
- [ ] All images and CSS display correctly
- [ ] Navigation links work (React Router routes resolve)
- [ ] No console errors in browser DevTools
- [ ] Mobile responsive layout works

### Testing Base Path Routes

If using React Router, verify routes resolve correctly:

```js
// These should resolve to https://username.github.io/repo-name/category/grace
<Link to="/category/grace">Grace</Link>

// NOT to https://username.github.io/category/grace (incorrect)
```

### Testing on Different Browsers

- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (if possible)
- [ ] Mobile Safari (if possible)

---

## Troubleshooting

### Issue: Assets Return 404 Errors

**Symptoms:** CSS, images, or JavaScript don't load. Console shows 404 errors.

**Cause:** Base path mismatch.

**Solution:**

1. Verify `vite.config.js` has correct base:
   ```js
   export default {
     base: '/your-repo-name/',  // Must end with /
   }
   ```

2. Rebuild and redeploy:
   ```bash
   npm run build
   git add .
   git commit -m "Fix: Update base path"
   git push
   ```

3. Clear browser cache:
   - Open DevTools (F12)
   - Network tab → Disable cache
   - Reload page

### Issue: Build Fails in GitHub Actions

**Symptoms:** Workflow shows red X, build step failed.

**Diagnosis:**

1. Check the workflow logs:
   - Go to **Actions** tab
   - Click failed workflow
   - Expand failed step to see error message

2. Common causes:
   - **Missing environment variables:** Add via repository Settings → Secrets
   - **Node version mismatch:** Ensure `node-version: 20` matches your local setup
   - **Lock file conflicts:** Run `npm install` locally, commit lock file

3. Fix and retry:
   ```bash
   # Fix locally
   npm install
   npm run build
   git add .
   git commit -m "Fix: Build errors"
   git push
   ```

### Issue: Site Shows Old Version

**Symptoms:** You pushed new code but the live site hasn't updated.

**Cause:** Browser or GitHub Pages cache.

**Solution:**

1. Hard refresh browser:
   - **Windows/Linux:** Ctrl+Shift+R
   - **Mac:** Cmd+Shift+R
   - Or open DevTools → Network → Disable cache → Reload

2. Check deployment succeeded:
   - Go to **Actions** → Check latest workflow completed successfully
   - Go to **Settings** → **Pages** → Verify deployment completed

3. Force clear GitHub Pages cache:
   - Go to **Settings** → **Pages**
   - Change source from "GitHub Actions" → "Deploy from a branch" (select main branch)
   - Wait 30 seconds
   - Switch back to "GitHub Actions"

### Issue: Blank Page or Routing Doesn't Work

**Symptoms:** Site loads but shows blank content, or React Router navigation breaks.

**Cause:** React app not handling base path correctly.

**Solution:**

1. Verify `vite.config.js` base path:
   ```js
   export default {
     base: '/your-repo-name/',
   }
   ```

2. If using React Router, ensure `<BrowserRouter>` becomes `<HashRouter>`:
   ```js
   // Old (doesn't work on GitHub Pages)
   <BrowserRouter>
   
   // New (correct for GitHub Pages)
   <HashRouter basename="/your-repo-name/">
   ```

3. Test links use relative paths:
   ```js
   // Correct
   <Link to="/category/grace">Grace</Link>
   
   // Incorrect (hardcodes full URL)
   <a href="https://example.com/repo-name/category/grace">Grace</a>
   ```

### Issue: Workflow Permissions Error

**Symptoms:** Deployment step fails with permission error.

**Cause:** GitHub Actions token lacks permissions.

**Solution:**

1. Go to repo **Settings** → **Actions** → **General**
2. Scroll to "Workflow permissions"
3. Select "Read and write permissions"
4. Check "Allow GitHub Actions to create and approve pull requests"
5. Click **Save**

---

## Additional Resources

- [Vite: Building for Production](https://vitejs.dev/guide/build.html)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Vite + GitHub Pages Blog Post](https://vitejs.dev/guide/static-deploy.html#github-pages)
- [peaceiris/actions-gh-pages](https://github.com/peaceiris/actions-gh-pages)
- [React Router Documentation](https://reactrouter.com/)

---

## Summary

| Task | Solution |
|------|----------|
| Configure base path | Set `base: '/repo-name/'` in vite.config.js |
| Test locally | Run `npm run preview` and check assets load |
| Automate deployment | Create `.github/workflows/deploy.yml` with peaceiris action |
| Enable Pages | Settings → Pages → Select "GitHub Actions" source |
| Monitor builds | Check **Actions** tab for workflow runs |
| Multi-environment | Use conditional deploy based on branch |
| Troubleshoot issues | Check base path, browser cache, workflow logs |

---

**Next Steps:**
1. Configure `vite.config.js` base path
2. Create `.github/workflows/deploy.yml`
3. Push to main branch
4. Enable GitHub Pages in repository settings
5. Verify deployment in Actions tab
