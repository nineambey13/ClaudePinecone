# Hosting Options for Mobile Access

Here are several options for hosting your application so you can access it on your phone:

## GitHub Pages + Separate Backend (Hybrid Solution)

You can use GitHub Pages for the frontend and a separate service for the backend functionality.

### Steps:
1. Configure your app to build as a static site: `npm run build`
2. Deploy the frontend to GitHub Pages:
   ```
   git add dist
   git commit -m "Add dist for GitHub Pages"
   git subtree push --prefix dist origin gh-pages
   ```
3. Host the server component (Pinecone proxy) separately on:
   - Vercel Serverless Functions
   - Netlify Functions
   - Railway
   - A simple VPS

### Pros:
- Free hosting for the frontend
- Simple deployment for the static part
- Can use GitHub Actions for automated deployment

### Cons:
- Requires separate backend hosting
- Need to configure CORS carefully
- More complex setup than all-in-one solutions

## 1. Vercel (Easiest Option)

Vercel is a cloud platform for static sites and serverless functions that's perfect for Next.js applications.

### Steps:
1. Create a Vercel account at [vercel.com](https://vercel.com)
2. Install the Vercel CLI: `npm install -g vercel`
3. From your project directory, run: `vercel login`
4. Deploy your app: `vercel`
5. Set up your environment variables in the Vercel dashboard:
   - CLAUDE_API_KEY
   - PINECONE_API_KEY
   - PINECONE_INDEX (clarity-opensource)

### Pros:
- Free tier available
- Optimized for Next.js
- Easy deployment with Git integration
- Automatic HTTPS

### Cons:
- Server-side functions have limitations on the free tier

## 2. Netlify

Similar to Vercel, Netlify offers hosting for static sites with serverless functions.

### Steps:
1. Create a Netlify account at [netlify.com](https://netlify.com)
2. Install the Netlify CLI: `npm install -g netlify-cli`
3. From your project directory, run: `netlify login`
4. Deploy your app: `netlify deploy`
5. Set up your environment variables in the Netlify dashboard

### Pros:
- Free tier available
- Good CI/CD integration
- Automatic HTTPS

### Cons:
- May require some configuration for serverless functions

## 3. Railway

Railway is a platform that makes it easy to deploy full-stack applications.

### Steps:
1. Create a Railway account at [railway.app](https://railway.app)
2. Install the Railway CLI: `npm install -g @railway/cli`
3. Login: `railway login`
4. Initialize your project: `railway init`
5. Deploy: `railway up`
6. Set up your environment variables in the Railway dashboard

### Pros:
- Easy deployment
- Good for full-stack applications
- Reasonable free tier

### Cons:
- Free tier has usage limits

## 4. Digital Ocean App Platform

Digital Ocean's App Platform is a PaaS solution for deploying apps.

### Steps:
1. Create a Digital Ocean account
2. Go to the App Platform section
3. Connect your GitHub repository
4. Configure your app and deploy
5. Set up your environment variables

### Pros:
- Reliable infrastructure
- Scalable
- Good documentation

### Cons:
- No free tier (starts at $5/month)

## 5. Self-Hosting with a VPS

You can host the application on a Virtual Private Server (VPS) like Digital Ocean Droplet, Linode, or AWS EC2.

### Steps:
1. Create a VPS instance
2. Set up Node.js environment
3. Clone your repository
4. Install dependencies: `npm install`
5. Build the app: `npm run build`
6. Use PM2 to run the app: `pm2 start npm -- start`
7. Set up Nginx as a reverse proxy
8. Configure domain and SSL with Let's Encrypt

### Pros:
- Full control over the environment
- No limitations on usage
- Can be cost-effective for long-term hosting

### Cons:
- Requires more technical knowledge
- You're responsible for maintenance and security

## Important Considerations for Any Hosting Option

1. **Environment Variables**: Make sure to set up all required environment variables (CLAUDE_API_KEY, PINECONE_API_KEY, etc.)

2. **CORS Configuration**: Ensure your Pinecone proxy server is properly configured to handle requests from your hosted frontend

3. **Security**: Use environment variables for sensitive information and never commit API keys to your repository

4. **Serverless Functions**: For the Pinecone proxy server, you'll need a hosting solution that supports serverless functions or backend services

5. **Mobile Optimization**: Test the application on mobile devices to ensure good user experience

## Recommended Option for Your Use Case

Based on your needs, **Vercel** is likely the best option because:
- It's easy to set up
- Has a generous free tier
- Works well with Next.js applications
- Supports serverless functions for your Pinecone proxy
- Provides automatic HTTPS and a global CDN

To get started with Vercel, follow the steps in the Vercel section above or visit [vercel.com](https://vercel.com) to learn more.
