# SmartPark — Vercel & MongoDB Atlas Deployment Guide

Deploy SmartPark to production in minutes as two decoupled Vercel projects (Serverless API + React SPA) backed by a managed MongoDB Atlas database.

---

## 7-Step Production Deployment Guide

### 1. Two Vercel Projects Setup
Deploy both frontend and backend from the same GitHub repository ([https://github.com/yuvanharshaj/FSD-PROJECT](https://github.com/yuvanharshaj/FSD-PROJECT)):
- **Backend API Project**: Set **Root Directory** to `server`.
- **Frontend Client Project**: Set **Root Directory** to `client`.

---

### 2. Create MongoDB Atlas Database Cluster
Vercel is a serverless application platform and cannot host a persistent database.
1. Sign in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a **Free M0 Sandbox Cluster**.
2. Under **Database Access**, create a database user (e.g. `smartpark_admin`) with a secure password.
3. Under **Network Access**, click **Add IP Address** and choose **Allow Access from Anywhere (`0.0.0.0/0`)**. This is required because Vercel's serverless IP addresses rotate dynamically across regions.
4. Click **Connect** > **Drivers** > copy your connection URI string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/smartpark?retryWrites=true&w=majority
   ```

---

### 3. Seed Initial Data to Atlas
Populate the 4 Bengaluru parking hubs, 130 slots, demo users, and bookings to your live Atlas cluster before running the frontend:
```bash
# In your local terminal, set your Atlas connection string and run seed
MONGO_URI="mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/smartpark?retryWrites=true&w=majority" npm run seed
```

---

### 4. Configure Backend Server Project Environment Variables
In your Vercel Dashboard for the **Server Project** (`Root Directory: server`), add the following under **Settings > Environment Variables**:

| Variable | Value | Description |
| :--- | :--- | :--- |
| `MONGO_URI` | `mongodb+srv://...` | Your MongoDB Atlas connection URI |
| `JWT_SECRET` | `super_secure_jwt_secret_smartpark_2026` | Secret key for JWT signing |
| `CLIENT_URL` | `https://smartpark-client.vercel.app` | The client's live Vercel URL (whitelist for CORS) |
| `NODE_ENV` | `production` | Enables strict production error handling & disables local memory server |

---

### 5. Configure Frontend Client Project Environment Variable
In your Vercel Dashboard for the **Client Project** (`Root Directory: client`), add:

| Variable | Value | Description |
| :--- | :--- | :--- |
| `VITE_API_URL` | `https://smartpark-server.vercel.app/api` | Server project live URL with `/api` path |

---

### 6. Deployment Order
1. **Deploy the Server Project first** on Vercel.
2. Once deployed, copy its assigned production URL (e.g. `https://smartpark-server.vercel.app`).
3. Paste `https://smartpark-server.vercel.app/api` into the client project's `VITE_API_URL` environment variable.
4. **Deploy the Client Project** on Vercel.
5. Once the client deploys, copy its assigned URL (e.g. `https://smartpark-client.vercel.app`), paste it into the server project's `CLIENT_URL` variable, and trigger a quick redeploy on the server so CORS whitelist is active.

---

### 7. Troubleshooting & Common Fixes

- **Build Failures**: Check Vercel **Deployment > Building Logs** for exact stack traces. Ensure Node.js runtime is set to 20.x in project settings.
- **CORS Errors (`Blocked by CORS policy`)**: Verify that `CLIENT_URL` in the server environment matches your exact client domain (including `https://` without a trailing slash).
- **404 on Browser Refresh**: Handled automatically by `/client/vercel.json` with single-page rewrite to `/index.html`.
- **Database Connection Timeouts (`MongoServerSelectionError`)**: Ensure `0.0.0.0/0` is active in MongoDB Atlas **Network Access**, and that the user password does not contain unencoded special characters.
- **Missing Environment Variables**: In serverless functions, environment variable changes only apply to *new* deployments. Go to **Deployments > ... > Redeploy** after modifying any variables.
