# Notes Web Application

A clean, responsive, local-first note-taking web application with rich text formatting, sketch / canvas drawing tools, PDF annotation, tags, folders, and export options.

## Deployment on Vercel

This is a static web application and is 100% ready for deployment on [Vercel](https://vercel.com).

### Option 1: Via GitHub (Recommended)

1. Create a new repository on [GitHub](https://github.com/new).
2. Push your project to GitHub:
   ```bash
   git remote add origin https://github.com/<your-username>/<repo-name>.git
   git push -u origin main
   ```
3. Go to [vercel.com/new](https://vercel.com/new).
4. Import your GitHub repository.
5. Click **Deploy**. Vercel will build and assign you a live `.vercel.app` URL immediately.

### Option 2: Via Vercel CLI

Run the following command in your terminal:
```bash
npx vercel
```
Follow the interactive prompt to log in and deploy. For production deployment:
```bash
npx vercel --prod
```

## Local Development

To run locally:
```bash
node server.js
```
or run `start.bat`.
Open [http://localhost:8000](http://localhost:8000) in your web browser.
