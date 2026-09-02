# Vandrichh E-commerce API

A production-ready REST API backend for the Vandrichh e-commerce platform, built with Node.js, TypeScript, Express, and MongoDB.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [MongoDB Atlas Setup](#mongodb-atlas-setup)
- [Local Development](#local-development)
- [API Documentation](#api-documentation)
- [Product Data Import](#product-data-import)
- [Authentication](#authentication)
- [API Endpoints](#api-endpoints)
- [Testing](#testing)
- [Production Build](#production-build)
- [Hostinger Deployment](#hostinger-deployment)
- [Security](#security)
- [Troubleshooting](#troubleshooting)

## Features

- ✅ User authentication with JWT and bcrypt password hashing
- ✅ Product management with advanced filtering and pagination
- ✅ Category management
- ✅ Shopping cart functionality
- ✅ Order management with multiple payment methods
- ✅ Admin dashboard APIs
- ✅ Comprehensive error handling
- ✅ Request validation with Zod
- ✅ API documentation with Swagger/OpenAPI
- ✅ Rate limiting and security headers
- ✅ CORS support
- ✅ MongoDB with Mongoose ODM
- ✅ TypeScript for type safety

## Tech Stack

- **Runtime**: Node.js 18+
- **Language**: TypeScript 5.x
- **Framework**: Express.js 4.x
- **Database**: MongoDB Atlas
- **ODM**: Mongoose 8.x
- **Authentication**: JWT (jsonwebtoken), bcrypt
- **Validation**: Zod
- **API Documentation**: Swagger/OpenAPI
- **Security**: Helmet, CORS, express-rate-limit
- **Logging**: Morgan
- **Development**: tsx (TypeScript executor)
- **Linting**: ESLint
- **Code Formatting**: Prettier
- **Testing**: Jest

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── env.ts              # Environment variable validation
│   │   └── database.ts         # MongoDB connection
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── product.controller.ts
│   │   ├── category.controller.ts
│   │   ├── cart.controller.ts
│   │   └── order.controller.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   └── notFound.middleware.ts
│   ├── models/
│   │   ├── User.ts
│   │   ├── Product.ts
│   │   ├── Category.ts
│   │   ├── Cart.ts
│   │   └── Order.ts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── product.routes.ts
│   │   ├── category.routes.ts
│   │   ├── cart.routes.ts
│   │   └── order.routes.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── product.service.ts
│   │   ├── category.service.ts
│   │   ├── cart.service.ts
│   │   └── order.service.ts
│   ├── utils/
│   │   ├── ApiError.ts
│   │   ├── ApiResponse.ts
│   │   ├── helpers.ts
│   │   └── pagination.ts
│   ├── validators/
│   │   ├── auth.validator.ts
│   │   ├── product.validator.ts
│   │   ├── category.validator.ts
│   │   ├── cart.validator.ts
│   │   └── order.validator.ts
│   ├── app.ts                  # Express app configuration
│   └── server.ts               # Server entry point
├── data/
│   └── vandrichh_products.json # Product data
├── scripts/
│   └── seedProducts.ts         # Database seeding script
├── tests/
│   └── health.test.ts
├── package.json
├── tsconfig.json
├── .env.example
├── .gitignore
├── eslint.config.js
├── prettier.config.js
└── README.md
```

## Installation

### Prerequisites

- Node.js 18.x or higher
- npm 8.x or higher
- MongoDB Atlas account (for cloud database) or local MongoDB
- A text editor or IDE (VS Code recommended)

### Steps

1. **Clone or navigate to the project**

   ```bash
   cd backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Create `.env` file**

   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables** (see below)

5. **Build TypeScript**

   ```bash
   npm run build
   ```

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/vandrichh?retryWrites=true&w=majority

# Authentication
JWT_SECRET=your_very_secret_jwt_key_change_this_in_production_minimum_32_characters
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:3000

# Logging
LOG_LEVEL=debug
```

### Environment Variable Details

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | 5000 | Express server port |
| `NODE_ENV` | No | development | Environment (development/production/test) |
| `MONGODB_URI` | Yes | - | MongoDB connection string |
| `JWT_SECRET` | Yes | - | Secret key for signing JWTs (min 32 chars) |
| `JWT_EXPIRES_IN` | No | 7d | JWT expiration time |
| `CORS_ORIGIN` | No | http://localhost:3000 | Frontend origin for CORS |
| `LOG_LEVEL` | No | info | Logging level (debug/info/warn/error) |

## MongoDB Atlas Setup

### Create a Free MongoDB Atlas Cluster

1. **Go to MongoDB Atlas**
   - Visit [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up or log in

2. **Create a new project**
   - Click "Create Project"
   - Name it "Vandrichh"
   - Click "Create Project"

3. **Create a cluster**
   - Click "Build a Database"
   - Select "M0 Free" (free tier)
   - Choose provider and region (AWS recommended)
   - Click "Create Cluster"

4. **Create database credentials**
   - In the cluster, click "Connect"
   - Create a database user:
     - Username: `vandrichh_user`
     - Password: Generate a strong password (copy this)
   - Add IP address: Click "Add Current IP Address" or use `0.0.0.0/0` (for development only)

5. **Get connection string**
   - Click "Drivers"
   - Select "Node.js"
   - Copy the connection string
   - Replace `<username>`, `<password>` with your credentials
   - Replace `<database_name>` with `vandrichh`

6. **Update .env**
   ```env
   MONGODB_URI=mongodb+srv://vandrichh_user:your_password@cluster.mongodb.net/vandrichh?retryWrites=true&w=majority
   ```

### Create Collections

MongoDB will auto-create collections on first use, but you can pre-create them:

```javascript
// In MongoDB Atlas Console
db.createCollection("users")
db.createCollection("products")
db.createCollection("categories")
db.createCollection("carts")
db.createCollection("orders")
```

## Local Development

### Start Development Server

```bash
npm run dev
```

The server will:
1. Load environment variables
2. Validate configuration
3. Connect to MongoDB
4. Start Express server on port 5000
5. Log the server URL and documentation link

### Access API

- **API Base**: http://localhost:5000/api/v1
- **Health Check**: http://localhost:5000/api/v1/health
- **API Docs**: http://localhost:5000/api-docs
- **Swagger UI**: Open [http://localhost:5000/api-docs](http://localhost:5000/api-docs) in browser

### Example Requests

**Health Check**
```bash
curl http://localhost:5000/api/v1/health
```

**Register User**
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "password": "password123"
  }'
```

**Login**
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Get Products**
```bash
curl http://localhost:5000/api/v1/products
```

## API Documentation

### Response Format

All API responses follow a standard format:

**Success Response**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

**Error Response**
```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Detailed error 1", "Detailed error 2"]
}
```

### Authentication

Protected endpoints require JWT token in the Authorization header:

```bash
Authorization: Bearer <jwt_token>
```

Tokens are obtained from:
- `/api/v1/auth/register` - User registration
- `/api/v1/auth/login` - User login

## API Endpoints

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | No | Register new user |
| POST | `/auth/login` | No | Login user |
| GET | `/auth/me` | Yes | Get current user |
| PUT | `/auth/me` | Yes | Update profile |

### Products

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/products` | No | List products (paginated) |
| GET | `/products/:id` | No | Get product by ID |
| GET | `/products/sku/:sku` | No | Get product by SKU |
| POST | `/products` | Admin | Create product |
| PUT | `/products/:id` | Admin | Update product |
| DELETE | `/products/:id/deactivate` | Admin | Soft delete product |
| DELETE | `/products/:id` | Admin | Hard delete product |

### Categories

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/categories` | No | List categories |
| GET | `/categories/:id` | No | Get category |
| POST | `/categories` | Admin | Create category |
| PUT | `/categories/:id` | Admin | Update category |
| DELETE | `/categories/:id` | Admin | Delete category |

### Cart

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/cart` | Yes | Get cart |
| POST | `/cart/items` | Yes | Add to cart |
| PUT | `/cart/items/:productId` | Yes | Update cart item |
| DELETE | `/cart/items/:productId` | Yes | Remove from cart |
| DELETE | `/cart` | Yes | Clear cart |

### Orders

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/orders` | Yes | Create order |
| GET | `/orders` | Yes | Get my orders |
| GET | `/orders/:id` | Yes | Get order details |
| GET | `/orders/admin/orders` | Admin | Get all orders |
| PUT | `/orders/:id/status` | Admin | Update order status |

## Product Data Import

### Import Products

```bash
npm run seed:products
```

This will:
1. Read products from `data/vandrichh_products.json`
2. Connect to MongoDB
3. Insert/update 150+ products (shirts, footwear, innerwear)
4. Report inserted, updated, and failed counts
5. Disconnect from database

### Sample Data

The included dataset contains:
- 5 White Shirts (various styles)
- 5 Footwear products
- 5 Ladies Innerwear products

To add more products:
1. Edit `data/vandrichh_products.json`
2. Run `npm run seed:products` again

Products use upsert, so duplicates are handled automatically.

## Testing

### Run Tests

```bash
npm test
```

### Test Health Endpoint

```bash
npm run dev &
curl http://localhost:5000/api/v1/health
```

Expected response:
```json
{
  "success": true,
  "message": "Vandrichh API is running"
}
```

## Code Quality

### Lint Code

```bash
npm run lint
```

### Format Code

```bash
npm run format
```

### Build

```bash
npm run build
```

Outputs compiled JavaScript to `dist/` directory.

## Production Build

### Build for Production

```bash
npm run build
npm start
```

### Environment Setup for Production

Set these in production `.env`:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=<very-long-secret-key-minimum-32-characters>
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://yourdomain.com
LOG_LEVEL=warn
```

### Security Checklist

- ✅ Change `JWT_SECRET` to a strong, random value
- ✅ Use HTTPS only in production
- ✅ Set `CORS_ORIGIN` to your frontend domain (not *)
- ✅ Use MongoDB Atlas with IP whitelist (not 0.0.0.0/0)
- ✅ Enable MongoDB authentication
- ✅ Use strong database passwords
- ✅ Set `NODE_ENV=production`
- ✅ Configure security headers (Helmet enabled)
- ✅ Enable rate limiting
- ✅ Monitor logs and errors

## Hostinger Deployment

### Prerequisites

- Hostinger account with Node.js hosting
- SSH access to server
- MongoDB Atlas connection string

### Deployment Steps

1. **Upload Code via FTP/SFTP**
   ```bash
   # Using scp (local machine)
   scp -r backend/ user@host:/home/user/vandrichh/
   ```

2. **Connect via SSH**
   ```bash
   ssh user@host
   cd /home/user/vandrichh/backend
   ```

3. **Install Dependencies**
   ```bash
   npm install --production
   ```

4. **Build TypeScript**
   ```bash
   npm run build
   ```

5. **Create Production .env**
   ```bash
   nano .env
   ```
   Add your production environment variables.

6. **Start Application**
   
   **Option 1: Using PM2 (Recommended)**
   ```bash
   npm install -g pm2
   pm2 start dist/server.js --name "vandrichh-api"
   pm2 save
   ```

   **Option 2: Using Hostinger's Control Panel**
   - Go to Node.js Settings
   - Set Entry Point: `dist/server.js`
   - Set Node.js version: 18+
   - Click Deploy

   **Option 3: Using nohup (Manual)**
   ```bash
   nohup npm start > api.log 2>&1 &
   ```

7. **Configure Domain/Subdomain**
   - Go to Hostinger Domain Manager
   - Add DNS records pointing to your server IP
   - Point subdomain (e.g., api.vandrichh.com) to your application

8. **Configure SSL/HTTPS**
   - Use Hostinger's SSL certificate manager
   - Recommended: Let's Encrypt (usually free)
   - Enable auto-renewal

### Environment Variables on Hostinger

1. **Via Control Panel** (if available)
   - Go to Node.js Settings
   - Add Environment Variables

2. **Via .env file**
   ```bash
   nano .env
   PORT=5000
   NODE_ENV=production
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_secret
   CORS_ORIGIN=https://yourdomain.com
   ```

3. **Via application startup script**
   ```bash
   # Create start.sh
   #!/bin/bash
   export NODE_ENV=production
   export MONGODB_URI=your_mongodb_uri
   export JWT_SECRET=your_secret
   npm start
   ```

### Verify Deployment

```bash
curl https://api.yourdomain.com/api/v1/health
```

Should respond:
```json
{
  "success": true,
  "message": "Vandrichh API is running"
}
```

### Monitor Application

```bash
# View logs
pm2 logs vandrichh-api

# View processes
pm2 status

# Restart app
pm2 restart vandrichh-api
```

## Security

### Implemented Security Features

1. **Password Security**
   - Bcrypt hashing with salt rounds = 12
   - Never stored in plain text
   - Never returned in API responses

2. **Authentication**
   - JWT tokens with configurable expiration
   - Secure token signing with secret key
   - Authorization header validation

3. **HTTP Security**
   - Helmet.js for secure headers
   - CORS with whitelist configuration
   - Rate limiting (100 requests per 15 minutes)
   - Request size limits (10MB)

4. **Data Validation**
   - Zod schema validation for all inputs
   - Type-safe data handling
   - SQL injection prevention (MongoDB parameterization)

5. **Database Security**
   - MongoDB Atlas with IP whitelist
   - Unique indexes on sensitive fields
   - Data encryption in transit (TLS/SSL)
   - Automatic backups

6. **Error Handling**
   - No stack traces in production
   - Safe error messages
   - Sensitive data never logged

### Best Practices

- Always use HTTPS in production
- Rotate JWT_SECRET periodically
- Keep dependencies updated: `npm audit`, `npm update`
- Use strong passwords for databases
- Monitor access logs regularly
- Implement rate limiting on frontend
- Use CORS_ORIGIN whitelist, never use "*"

## Troubleshooting

### MongoDB Connection Failed

**Error**: `Cannot connect to MongoDB`

**Solutions**:
1. Check MONGODB_URI in .env
2. Verify IP address is whitelisted in MongoDB Atlas
3. Check username and password are correct
4. Ensure database name is correct
5. Test connection: `mongosh "your_connection_string"`

### Port Already in Use

**Error**: `Error: listen EADDRINUSE :::5000`

**Solutions**:
1. Change PORT in .env
2. Kill process on port 5000:
   ```bash
   # Linux/Mac
   lsof -ti:5000 | xargs kill -9
   
   # Windows
   netstat -ano | findstr :5000
   taskkill /PID <PID> /F
   ```

### JWT Token Invalid

**Error**: `Invalid or expired token`

**Solutions**:
1. Token may have expired (check JWT_EXPIRES_IN)
2. JWT_SECRET might have changed
3. Token format: Include "Bearer " prefix
4. Generate new token via login endpoint

### Product Import Failed

**Error**: `Failed to seed products`

**Solutions**:
1. Check MongoDB connection
2. Verify JSON file exists at `data/vandrichh_products.json`
3. Check JSON syntax: `cat data/vandrichh_products.json | jq .`
4. Ensure all required fields in products
5. Check MongoDB user has write permissions

### Build Errors

**Error**: `TypeScript compilation failed`

**Solutions**:
1. Clear dist folder: `rm -rf dist`
2. Reinstall dependencies: `rm -rf node_modules && npm install`
3. Check TypeScript version: `npx tsc --version`
4. Fix type errors in code

### High Memory Usage

**Solutions**:
1. Check Node.js memory limit: `node --max-old-space-size=2048 dist/server.js`
2. Enable garbage collection monitoring
3. Review MongoDB query performance
4. Optimize pagination limits
5. Monitor with PM2: `pm2 monit`

## Support and Updates

- Report issues on GitHub
- Check documentation at `/api-docs`
- Review logs: `pm2 logs vandrichh-api`
- Update dependencies: `npm update`
- Security updates: `npm audit fix`

## License

Proprietary - Vandrichh E-commerce Platform
