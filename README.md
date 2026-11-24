# Candilicious

Full source for the Candilicious handmade candle storefront and store administration app. The frontend is React/Vite; the REST API uses Express, MongoDB/Mongoose, JWT sessions, bcrypt password hashing, and optional Cloudinary uploads.

## Requirements

- Node.js 20 or newer and npm
- MongoDB. A local standalone MongoDB service works for development; replica sets or Atlas support transactional order placement.
- Cloudinary credentials are optional; image URLs can be entered directly in product management.

## Start the app

1. Copy `server/.env.example` to `server/.env`. The local default URL is `mongodb://127.0.0.1:27017/candilicious`. Set a long random `JWT_SECRET`. Set both `ADMIN_EMAIL` and `ADMIN_PASSWORD` to create an admin; leave both blank to seed only the catalog.
2. Install dependencies from this folder with `npm install`.
3. Start your local MongoDB service on port `27017`. For full transactional order creation, configure MongoDB as a replica set and initialize it once with `npm run db:init --workspace server`. The API also supports a standalone local server with inventory rollback if order creation fails.
4. Seed the starter candle catalog and environment-configured admin account with `npm run seed`.
5. Run both apps with `npm run dev`. The web app is at `http://localhost:5173` (Vite may choose `5174` if that port is occupied); the API is at `http://localhost:5000/api`.
6. If the API is already running on port 5000, use `npm run dev:client` to launch only Vite. Use `npm run dev:server` to launch only the API. Don’t start a second API on the same port.
7. Customers can create an account at `/register` or sign in at `/login`. Admins can use the same sign-in, or open `/admin/login`, with the admin email/password configured in `server/.env`.

Use `npm run build` for the production frontend build and `npm start` to start the API. Set `CLIENT_ORIGIN` in `server/.env` to the deployed frontend origin before hosting.


## Deploy to Render

This repository includes `render.yaml` for a single Render web service. It builds the Vite client, serves the compiled storefront and API from Express, and stores application data in MongoDB Atlas. The blueprint keeps secrets out of source control.

### 1. Create a MongoDB Atlas database

1. Create an Atlas project and cluster, then create a database user with a strong password.
2. In **Network Access**, add the Render service's outbound IP ranges from the service's **Connect → Outbound** panel after the first deploy. If you use a free Render instance and need to get started before allowlisting the ranges, Atlas can be configured to allow `0.0.0.0/0`; this permits connections from any IP, so use a unique database password and the narrowest access rule your hosting plan allows.
3. Copy the Atlas driver connection string and replace its username, password, and database name. Keep it private.

### 2. Push the project to GitHub

Create a repository and push the project root (the folder containing `render.yaml` and `package-lock.json`). Do not commit `server/.env`; it is ignored by Git.

### 3. Create the Render service

1. In Render, choose **New → Blueprint**, connect the GitHub repository, and select the branch to deploy.
2. Render reads `render.yaml`. Enter the Atlas URI when prompted for `MONGODB_URI`; Render generates `JWT_SECRET` automatically.
3. Apply the Blueprint and wait for the deploy to finish. The same service serves both the website and `/api`, so no separate frontend URL or CORS setting is needed.
4. Open the service URL and check `/api/health`. The response should report `"ok": true` and `"database": "connected"`.

### 4. Add products and create the admin account

Seed the starter candles and admin account once against the Atlas database from your computer after allowing your current IP in Atlas Network Access. From the project root in PowerShell, enter the connection string and password at secure prompts (they are not echoed):

```powershell
$uriSecure = Read-Host "Atlas connection string" -AsSecureString
$passwordSecure = Read-Host "Strong admin password" -AsSecureString
$uriPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($uriSecure)
$passwordPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($passwordSecure)
try {
  $env:MONGODB_URI = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($uriPointer)
  $env:ADMIN_EMAIL = Read-Host "Admin email"
  $env:ADMIN_PASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($passwordPointer)
  npm run seed
} finally {
  [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($uriPointer)
  [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($passwordPointer)
  Remove-Item Env:MONGODB_URI, Env:ADMIN_EMAIL, Env:ADMIN_PASSWORD -ErrorAction SilentlyContinue
}
```

Use a new, unique admin password. The seed script adds starter products only when they are missing and creates the admin only if that email does not already exist. After remote seeding, remove the temporary Atlas IP access entry if you added one. Then sign in at `/admin/login`.

### 5. Verify and update

Visit the service root, refresh a deep link such as `/shop`, check `/api/health`, sign in to the admin area, and place a test order. Push later code changes to the connected branch to trigger another deploy.

The Blueprint uses Render's Free plan for a low-cost preview. Free web services spin down after 15 minutes without traffic; the first request after idle can take about a minute. Upgrade the service for an always-on storefront. Keep MongoDB in Atlas: Render's free service filesystem is temporary and must not be used for order data or uploaded product images.

## Included flows

- Responsive home, collections, searchable/filterable shop, candle details, persistent cart, checkout, and confirmation.
- Server-side pricing and stock validation; order creation uses a transaction on replica sets and safe compensating stock updates on standalone local MongoDB. No payment gateway is integrated; new orders are marked payment pending.
- Contact submissions saved to MongoDB.
- Customer accounts with order history, profile details, saved delivery addresses, default-address selection, address editing/deletion, and sign out. When a signed-in customer orders to a new address, it is saved to their account. Customers can choose saved addresses during checkout; order history matches the checkout email.
- Checkout confirms successful orders in a dialog and reuses an idempotency key for safe retries.
- Shared customer/admin sign-in with role-based redirects and a role-protected dashboard for products and orders; inventory, price, category, featured/bestseller, order status, and payment status management.
- Starter products and admin creation through `npm run seed`. No credentials are hard-coded; the admin account is created from server environment variables.
- Optional Cloudinary upload endpoint; product management accepts image URLs without it.
- Detailed product specifications, multi-image galleries, gift-bundle labeling, and Product/Offer structured data for search crawlers.
- Verified-purchase reviews with admin approval; browser-saved wishlist and account order reorder.
- Gift wrapping with message, server-validated promo codes, and shipping/returns/privacy/terms/candle-care pages.

## Configuration notes

MongoDB and the environment variables must be configured before the app can place real orders or load the database catalog. Local development allows Vite origins on ports 5173 and 5174 by default. Without the API, the storefront falls back to a small starter catalog, while checkout clearly reports that order service is unavailable. Online payment is intentionally not represented as completed. Product photography uses Unsplash URLs and typography uses Google Fonts.

The complete MERN application runs from `client/` and `server/` through the root npm scripts.
