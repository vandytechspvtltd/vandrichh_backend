# Admin API Contract

This document describes the backend contract for implementing the Admin Panel. It does not connect or modify the Admin Panel.

## Base URL and Authentication

Development base URL: `http://localhost:5000/api/v1`

Admin login: `POST /admin/login`. Use the returned `data.token` for every other admin endpoint:

```http
Authorization: Bearer <admin-token>
Content-Type: application/json
```

Admin routes use the separate Admin JWT. Customer access tokens are not valid for these routes. IDs are prefixed strings such as `prod_001`, `cat_001`, `order_001`, `user_001`, `banner_001`, `inv_001`, and `coup_001`.

All endpoints below are relative to the base URL. Except for login, requests require an Admin JWT.

## Endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/admin/login` | Authenticate admin; returns admin profile and JWT |
| `GET` | `/admin/me` | Get authenticated admin profile |
| `GET` | `/admin/dashboard` | Get product, category, customer, order, and banner counts |
| `GET` | `/admin/products?page=1&limit=20` | List products; `limit` max is 100 |
| `POST` | `/admin/products` | Create product |
| `GET` | `/admin/products/:id` | Get product, including inactive products |
| `PUT` / `PATCH` | `/admin/products/:id` | Update product |
| `DELETE` | `/admin/products/:id` | Permanently delete product |
| `DELETE` | `/admin/products/:id/deactivate` | Soft-deactivate product (`isActive=false`) |
| `GET` | `/admin/categories?page=1&limit=20` | List categories; `limit` max is 100 |
| `POST` | `/admin/categories` | Create category |
| `GET` | `/admin/categories/:id` | Get category |
| `PUT` | `/admin/categories/:id` | Update category |
| `DELETE` | `/admin/categories/:id` | Soft-deactivate category |
| `GET` | `/admin/orders?page=1&limit=20` | List orders with user and product data populated |
| `GET` | `/admin/orders/:id` | Get order detail |
| `PUT` | `/admin/orders/:id/status` | Update order status |
| `GET` | `/admin/users?page=1&limit=20` | List customers without credentials |
| `GET` | `/admin/users/:id` | Get customer without credentials |
| `GET` | `/admin/banners` | List banners |
| `POST` | `/admin/banners` | Create banner |
| `GET` | `/admin/banners/:id` | Get banner |
| `PUT` | `/admin/banners/:id` | Update banner |
| `DELETE` | `/admin/banners/:id` | Permanently delete banner |
| `GET` | `/admin/inventory` | List inventory |
| `POST` | `/admin/inventory` | Create inventory record |
| `GET` | `/admin/inventory/:id` | Get inventory record |
| `PATCH` | `/admin/inventory/:id` | Update inventory record |
| `DELETE` | `/admin/inventory/:id` | Permanently delete inventory record |
| `GET` | `/admin/coupons` | List coupons |
| `POST` | `/admin/coupons` | Create coupon |
| `GET` | `/admin/coupons/:id` | Get coupon |
| `PATCH` | `/admin/coupons/:id` | Update coupon |
| `DELETE` | `/admin/coupons/:id` | Permanently delete coupon |

List endpoints for products, categories, orders, and customers return pagination metadata. Inventory, coupons, and banners currently return unpaginated lists.

## TypeScript Models

```ts
export type AdminRole = "ADMIN" | "SUPER_ADMIN";

export interface Admin {
  _id: string;
  name: string;
  email: string;
  role: AdminRole;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminLoginResponse {
  success: true;
  message: string;
  data: {
    admin: Admin;
    token: string;
  };
}

export interface Product {
  _id: string;
  id?: string;
  sku: string;
  category: string;
  subcategory?: string;
  productName: string;
  material?: string;
  availableSizes?: string[];
  colours?: string[];
  wholesalePrice?: number;
  mrp: number;
  sellingPrice: number;
  description?: string;
  images?: string[];
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
  isTrending: boolean;
  isNew: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type ProductCreateInput = Omit<Product, "_id" | "id" | "createdAt" | "updatedAt">;
export type ProductUpdateInput = Partial<ProductCreateInput>;

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type CategoryInput = Pick<Category, "name" | "slug"> & Partial<Pick<Category, "description" | "image" | "isActive">>;

export type OrderStatus = "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export interface ShippingAddress {
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
}

export interface OrderItem {
  product: string | Product;
  productSnapshot?: {
    sku: string;
    productName: string;
    sellingPrice: number;
    images: string[];
  };
  quantity: number;
  selectedSize?: string;
  selectedColour?: string;
  price: number;
  subtotal: number;
}

export interface Order {
  _id: string;
  user: string | Pick<Customer, "_id" | "name" | "email" | "phone" | "role">;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  paymentMethod: "COD";
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface CustomerAddress {
  _id?: string;
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  isDefault: boolean;
}

export interface Customer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: "CUSTOMER";
  isActive: boolean;
  addresses?: CustomerAddress[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Banner {
  _id: string;
  imageUrl: string;
  title: string;
  description?: string;
  redirectUrl?: string;
  displayOrder?: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type BannerInput = Pick<Banner, "imageUrl" | "title"> & Partial<Pick<Banner, "description" | "redirectUrl" | "displayOrder" | "isActive">>;

export type InventoryStatus = "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";

export interface Inventory {
  _id: string;
  productId: string;
  sku: string;
  stock: number;
  reserved: number;
  available: number;
  location: string;
  status: InventoryStatus;
  updatedAt?: string;
}

export type InventoryInput = Pick<Inventory, "productId" | "sku"> & Partial<Pick<Inventory, "stock" | "reserved" | "location" | "status">>;
export type InventoryUpdateInput = Partial<InventoryInput>;

export type CouponType = "PERCENTAGE" | "FIXED";

export interface Coupon {
  _id: string;
  code: string;
  description: string;
  type: CouponType;
  value: number;
  minOrderValue: number;
  maxDiscount: number;
  isActive: boolean;
  usageLimit: number;
  usedCount: number;
  expiresAt: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export type CouponInput = Pick<Coupon, "code" | "description"> & Partial<Pick<Coupon, "type" | "value" | "minOrderValue" | "maxDiscount" | "isActive" | "usageLimit" | "expiresAt">>;
export type CouponUpdateInput = Partial<CouponInput>;

export interface DashboardCounts {
  products: number;
  categories: number;
  users: number;
  orders: number;
  banners: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
```

`GET /admin/orders` and `GET /admin/orders/:id` populate `user` and `items[].product`; those fields may therefore be objects rather than IDs. Customer responses omit password and refresh-token fields.

## Request Examples

Create product:

```json
{
  "sku": "SHR-WHT-001",
  "category": "Shirts",
  "productName": "White Cotton Shirt",
  "mrp": 499,
  "sellingPrice": 399,
  "stock": 25,
  "isActive": true,
  "isFeatured": false,
  "isTrending": false,
  "isNew": true
}
```

Create inventory record:

```json
{
  "productId": "prod_001",
  "sku": "SHR-WHT-001",
  "stock": 25,
  "reserved": 2,
  "location": "warehouse",
  "status": "IN_STOCK"
}
```

Create coupon:

```json
{
  "code": "SAVE10",
  "description": "Ten percent off",
  "type": "PERCENTAGE",
  "value": 10,
  "minOrderValue": 500,
  "maxDiscount": 200,
  "isActive": true,
  "usageLimit": 100,
  "expiresAt": "2026-12-31T23:59:59.000Z"
}
```

Update order status:

```json
{
  "orderStatus": "CONFIRMED"
}
```

## Response and Error Handling

Success responses use `{ "success": true, "message": "...", "data": ... }`. Paged list responses also include `pagination`. Common statuses are `400` invalid input, `401` missing/invalid Admin JWT, `403` inactive/unauthorized admin, `404` missing record, and `409` duplicate SKU, category slug, or coupon code.

The interactive OpenAPI document is available at `/api-docs` while the backend is running. Use `/api/v1/admin/...` as the canonical Admin Panel API. Older compatibility routes remain available where already supported.
