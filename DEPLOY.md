# Deployment Guide

This project is configured to automatically deploy to GitHub Pages when you push to the `sprint` branch.

## GitHub Pages Setup

### 1. Enable GitHub Pages

1. Go to your GitHub repository
2. Click on **Settings** tab
3. Scroll down to **Pages** section in the left sidebar
4. Under **Source**, select **GitHub Actions**

### 2. Environment Variables (Optional)

If your app uses Supabase or other environment variables, you'll need to add them as repository secrets:

1. Go to **Settings** > **Secrets and variables** > **Actions**
2. Click **New repository secret**
3. Add your environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - Any other environment variables your app needs

### 3. Update the Workflow (if needed)

The workflow file `.github/workflows/deploy.yml` is set up to:
- Trigger on pushes to the `sprint` branch
- Build your Vite React app
- Deploy to GitHub Pages

If you want to deploy from a different branch, edit the workflow file and change:
```yaml
branches: ["sprint"]
```
to your preferred branch name.

### 4. Uncomment Environment Variables

If you're using environment variables, uncomment these lines in `.github/workflows/deploy.yml`:
```yaml
env:
  VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
  VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
```

## Deployment Process

1. **Push to sprint branch**:
   ```bash
   git add .
   git commit -m "Deploy to GitHub Pages"
   git push origin sprint
   ```

2. **Check deployment status**:
   - Go to the **Actions** tab in your GitHub repository
   - You should see a workflow run called "Deploy to GitHub Pages"
   - Wait for it to complete (usually takes 2-3 minutes)

3. **Access your deployed app**:
   - Your app will be available at: `https://yourusername.github.io/borrow-tracker/`
   - Replace `yourusername` with your actual GitHub username

## Local Testing

To test the production build locally:

```bash
npm run build
npm run preview
```

## Troubleshooting

### Common Issues:

1. **404 errors**: Make sure the `base` path in `vite.config.ts` matches your repository name
2. **Build failures**: Check the Actions tab for detailed error logs
3. **Missing dependencies**: Ensure all dependencies are in `package.json`, not just `devDependencies`

### Build Logs:
Check the GitHub Actions logs for detailed build information if deployment fails.

## Manual Deployment

If you prefer to deploy manually:

1. Build the project: `npm run build`
2. The built files will be in the `dist` folder
3. Upload the contents of `dist` to your web server

## Notes

- The workflow uses Node.js 18 and npm for building
- The app is built in production mode with optimizations
- Static assets are properly handled for GitHub Pages subdirectory deployment
