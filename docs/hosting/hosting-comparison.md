## AgriConnect Hosting Platform Comparison

| Criterion | Render (Free) | Railway (Free/Trial) | Vercel (Hobby) |
|---|---|---|---|
| Free Resource Allocation | 512 MB RAM, 0.1 CPU, 750 instance hours per month. Sleeps after 15 idle minutes and takes about a minute to wake. | One-time trial credit, then a very small free plan (about $1 of usage credit per month), so it may stop when credit runs out. | Free Hobby plan with generous limits for sites and serverless functions. |
| Automatic SSL/TLS | Yes, on `onrender.com` and on custom domains, renewed automatically. | Yes, on its generated domains. | Yes, automatic. |
| Git Deployment | Yes, connect a GitHub repository, auto-deploy on every push. | Yes, from GitHub. | Yes, from GitHub. |
| Database Support | Managed PostgreSQL (free one expires after 30 days). SQLite works but the free disk is not permanent. | Managed PostgreSQL/MySQL add-ons paid from credit. | No built-in database; needs an external one. |
| Node.js/Express Backend Compatibility | Full: runs a normal long-running Express server. | Full. | Poor fit: serverless functions, not a long-running Express server with a local database file. |
| Ease of Deployment | Easy: build command plus start command. | Easy. | Easy for front ends, extra work for this backend. |
| Reliability | Good uptime; cold start after idle is the main drawback. | Free credit can run out. | Very reliable for static and serverless. |



I chose Render. AgriConnect is a long-running Node.js/Express server, which Render runs
without changes, whereas Vercel is built for serverless functions and would need the app
rewritten. Render gives a free web service with automatic HTTPS, Git deployment on every push
to GitHub, environment variable management and logs in one dashboard, so deployment is simple
and I can show the evidence quickly. Railway is similar but its free credit is very small and
can run out, which is a reliability risk. The trade-off with Render's free tier is that the
service sleeps after 15 idle minutes (the first request then takes about a minute), and the
free disk is temporary, so I seed demo data on start-up. For a start-up prototype this is
acceptable, and moving to a paid instance later removes the sleeping.