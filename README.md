# Vandrichh E-commerce API

REST API for the Vandrichh e-commerce platform, built with Node.js, TypeScript, and Express. All application records are stored in local JSON files under `src/data/`.

## Requirements

- Node.js 18 or later
- npm 8 or later

## Setup

```bash
npm install
```

Create a `.env` file with the settings needed for authentication and runtime configuration:

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=replace_with_a_secret_at_least_32_characters_long
ADMIN_JWT_SECRET=replace_with_a_different_secret_at_least_32_characters
JWT_EXPIRES_IN=7d
ADMIN_JWT_EXPIRES_IN=8h
CORS_ORIGIN=http://localhost:3000
IMAGE_BASE_URL=https://cdn.example.com
LOG_LEVEL=info
```

`PORT`, `NODE_ENV`, `JWT_EXPIRES_IN`, `ADMIN_JWT_EXPIRES_IN`, `CORS_ORIGIN`, and `LOG_LEVEL` have defaults. `ADMIN_JWT_SECRET` falls back to `JWT_SECRET`; `IMAGE_BASE_URL` is optional.

## Local Data

The API creates a missing collection file as an empty array when first read. Collections are stored in `src/data/`:

- `products.json`
- `categories.json`
- `banners.json`
- `users.json`
- `carts.json`
- `orders.json`
- `wishlists.json`

IDs are local strings such as `prod_001`, `cat_001`, and `user_001`. The supplied product fixture can be imported or refreshed with:

```bash
npm run seed:products
```

Create a local administrator with:

```bash
npm run admin:create -- "Store Admin" admin@example.com "your-password" ADMIN
```

## Run

```bash
npm run dev
```

The API listens on port 5000 by default. Swagger UI is available at `/api-docs`; the health endpoint is `/api/v1/health`.

For a production build:

```bash
npm run build
npm start
```

## API Groups

- Authentication: `/api/v1/auth`
- Products: `/api/v1/products`
- Categories: `/api/v1/categories`
- Banners: `/api/v1/banners`
- Wishlist: `/api/v1/wishlist`
- Cart: `/api/v1/cart`
- Orders: `/api/v1/orders`
- User: `/api/v1/user`
- Admin: `/api/v1/admin` and `/api/admin`