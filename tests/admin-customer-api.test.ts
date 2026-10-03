import test from "node:test";
import assert from "node:assert/strict";
import bcrypt from "bcryptjs";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { loadEnv } from "../src/config/env.js";

const originalWorkingDirectory = process.cwd();
const temporaryDataDirectory = await mkdtemp(path.join(tmpdir(), "vandrichh-api-test-"));
process.chdir(temporaryDataDirectory);
loadEnv();

const { default: app } = await import("../src/app.js");
const { Admin } = await import("../src/models/admin.model.js");
const { Banner } = await import("../src/models/banner.model.js");
const { Cart } = await import("../src/models/cart.model.js");
const { Category } = await import("../src/models/category.model.js");
const { Order } = await import("../src/models/order.model.js");
const { Product } = await import("../src/models/product.model.js");
const { User } = await import("../src/models/user.model.js");
const { Wishlist } = await import("../src/models/wishlist.model.js");
const { Inventory } = await import("../src/modules/admin/models/inventory.model.js");
const { Coupon } = await import("../src/modules/admin/models/coupon.model.js");
const { Review } = await import("../src/modules/customer/models/review.model.js");

const failures: string[] = [];
let apiChecks = 0;

async function request(
  baseUrl: string,
  label: string,
  path: string,
  options: { method?: string; token?: string; body?: Record<string, any>; expected?: number } = {}
) {
  const method = options.method || "GET";
  apiChecks += 1;
  const headers: Record<string, string> = {};
  if (options.body) headers["Content-Type"] = "application/json";
  if (options.token) headers.Authorization = `Bearer ${options.token}`;

  try {
    const response = await fetch(`${baseUrl}${path}`, {
      method,
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
    const text = await response.text();
    let data: any = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { raw: text.slice(0, 200) };
    }

    const expected = options.expected ?? 200;
    console.log(`[API] ${method} ${path} -> ${response.status}`);
    if (response.status !== expected) {
      failures.push(`${label}: expected ${expected}, got ${response.status}: ${JSON.stringify(data).slice(0, 250)}`);
    }
    return data;
  } catch (error) {
    failures.push(`${label}: request failed: ${String(error)}`);
    return {};
  }
}

const idOf = (result: any) => String(result?.data?._id ?? result?.data?.id ?? "missing-id");

const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const adminEmail = `api-admin-${unique}@example.com`;
const customerEmail = `api-customer-${unique}@example.com`;
const customerPhone = String(7000000000 + Math.floor(Math.random() * 99999999));
const adminPassword = "TestAdmin123!";
const customerPassword = "TestCustomer123!";
const sku = `API-ALL-${unique}`;
const categorySlug = `api-all-${unique}`;
const aliasSku = `API-ALIAS-${unique}`;
const aliasCategorySlug = `api-alias-${unique}`;
const couponCode = `ALL${unique.replace(/\D/g, "").slice(-6)}`;

const created: Record<string, string | undefined> = {};

test("admin and customer HTTP APIs work across shared JSON data", async () => {
  const server = app.listen(0);
  await new Promise<void>((resolve) => server.once("listening", resolve));
  const address = server.address();
  assert.ok(address && typeof address !== "string");
  const baseUrl = `http://127.0.0.1:${address.port}`;

  try {
    const admin = await Admin.create({
      name: "API Test Admin",
      email: adminEmail,
      passwordHash: await bcrypt.hash(adminPassword, 4),
      role: "ADMIN",
      isActive: true,
    });
    created.admin = String(admin._id);

    const login = await request(baseUrl, "admin login", "/api/v1/admin/login", {
      method: "POST",
      body: { email: adminEmail, password: adminPassword },
    });
    const adminToken = login?.data?.token as string;

    await request(baseUrl, "legacy admin login alias", "/api/admin/login", {
      method: "POST",
      body: { email: adminEmail, password: adminPassword },
    });

    await request(baseUrl, "admin profile", "/api/v1/admin/me", { token: adminToken });
    await request(baseUrl, "admin dashboard", "/api/v1/admin/dashboard", { token: adminToken });
    await request(baseUrl, "legacy admin dashboard alias", "/api/admin/dashboard", { token: adminToken });

    const registration = await request(baseUrl, "customer register", "/api/v1/auth/register", {
      method: "POST",
      expected: 201,
      body: { name: "API Test Customer", email: customerEmail, phone: customerPhone, password: customerPassword },
    });
    created.customer = String(registration?.data?.user?._id ?? "");
    let customerToken = registration?.data?.token as string;

    await request(baseUrl, "customer OTP request", "/api/v1/auth/login", {
      method: "POST",
      body: { phone: customerPhone },
    });
    const verification = await request(baseUrl, "customer OTP verify", "/api/v1/auth/verify-otp", {
      method: "POST",
      body: { phone: customerPhone, otp: "123456" },
    });
    customerToken = verification?.data?.token || customerToken;

    await request(baseUrl, "auth current profile", "/api/v1/auth/me", { token: customerToken });
    await request(baseUrl, "auth update profile", "/api/v1/auth/me", {
      method: "PUT",
      token: customerToken,
      body: { name: "API Test Customer Updated" },
    });
    await request(baseUrl, "user profile read", "/api/v1/user/profile", { token: customerToken });
    await request(baseUrl, "user profile update", "/api/v1/user/profile", {
      method: "PUT",
      token: customerToken,
      body: { name: "API Test Customer" },
    });

    await request(baseUrl, "customer address list", "/api/v1/user/addresses", { token: customerToken });
    await request(baseUrl, "customer add address", "/api/v1/user/addresses", {
      method: "POST",
      expected: 201,
      token: customerToken,
      body: {
        fullName: "API Test Customer",
        phone: customerPhone,
        street: "1 Test Street",
        city: "Nashville",
        state: "Tennessee",
        pincode: "37201",
        isDefault: true,
      },
    });

    const product = await request(baseUrl, "admin create product", "/api/v1/admin/products", {
      method: "POST",
      expected: 201,
      token: adminToken,
      body: {
        sku,
        category: "API Test Category",
        productName: "API Flow Product",
        material: "Cotton",
        availableSizes: ["M", "L"],
        colours: ["Blue"],
        wholesalePrice: 10,
        mrp: 30,
        sellingPrice: 20,
        description: "Temporary API flow product",
        images: [],
        stock: 10,
        isActive: true,
        isFeatured: true,
        isTrending: true,
        isNew: true,
      },
    });
    created.product = idOf(product);
    const productId = created.product;

    await request(baseUrl, "admin products list", "/api/v1/admin/products?page=1&limit=100", { token: adminToken });
    await request(baseUrl, "admin product detail", `/api/v1/admin/products/${productId}`, { token: adminToken });
    await request(baseUrl, "admin product PUT", `/api/v1/admin/products/${productId}`, {
      method: "PUT",
      token: adminToken,
      body: { description: "Updated with PUT" },
    });
    await request(baseUrl, "admin product PATCH", `/api/v1/admin/products/${productId}`, {
      method: "PATCH",
      token: adminToken,
      body: { description: "Updated with PATCH" },
    });

    await request(baseUrl, "customer product list and search", `/api/v1/products?search=${encodeURIComponent(sku)}`);
    await request(baseUrl, "customer featured products", "/api/v1/products/featured");
    await request(baseUrl, "customer trending products", "/api/v1/products/trending");
    await request(baseUrl, "customer new arrivals", "/api/v1/products/new-arrivals");
    await request(baseUrl, "customer product by SKU", `/api/v1/products/sku/${encodeURIComponent(sku)}`);
    await request(baseUrl, "customer product detail", `/api/v1/products/${productId}`);

    const aliasProduct = await request(baseUrl, "legacy admin create product", "/api/v1/products", {
      method: "POST",
      expected: 201,
      token: adminToken,
      body: {
        sku: aliasSku,
        category: "API Alias Category",
        productName: "API Alias Product",
        wholesalePrice: 10,
        mrp: 30,
        sellingPrice: 20,
        stock: 2,
        isActive: true,
      },
    });
    created.aliasProduct = idOf(aliasProduct);
    await request(baseUrl, "legacy admin update product", `/api/v1/products/${created.aliasProduct}`, {
      method: "PUT",
      token: adminToken,
      body: { productName: "Updated API Alias Product" },
    });
    await request(baseUrl, "legacy admin deactivate product", `/api/v1/products/${created.aliasProduct}/deactivate`, {
      method: "DELETE",
      token: adminToken,
    });
    await request(baseUrl, "legacy admin delete product", `/api/v1/products/${created.aliasProduct}`, {
      method: "DELETE",
      token: adminToken,
    });

    const category = await request(baseUrl, "admin create category", "/api/v1/admin/categories", {
      method: "POST",
      expected: 201,
      token: adminToken,
      body: { name: "API Test Category", slug: categorySlug, description: "Temporary category", isActive: true },
    });
    created.category = idOf(category);
    await request(baseUrl, "admin category list", "/api/v1/admin/categories", { token: adminToken });
    await request(baseUrl, "admin category detail", `/api/v1/admin/categories/${created.category}`, { token: adminToken });
    await request(baseUrl, "admin category update", `/api/v1/admin/categories/${created.category}`, {
      method: "PUT",
      token: adminToken,
      body: { description: "Updated category" },
    });
    await request(baseUrl, "customer category list", "/api/v1/categories");
    await request(baseUrl, "customer category detail", `/api/v1/categories/${created.category}`);

    const aliasCategory = await request(baseUrl, "legacy admin create category", "/api/v1/categories", {
      method: "POST",
      expected: 201,
      token: adminToken,
      body: { name: "API Alias Category", slug: aliasCategorySlug, isActive: true },
    });
    created.aliasCategory = idOf(aliasCategory);
    await request(baseUrl, "legacy admin update category", `/api/v1/categories/${created.aliasCategory}`, {
      method: "PUT",
      token: adminToken,
      body: { description: "Updated alias category" },
    });
    await request(baseUrl, "legacy admin delete category", `/api/v1/categories/${created.aliasCategory}`, {
      method: "DELETE",
      token: adminToken,
    });

    const banner = await request(baseUrl, "admin create banner", "/api/v1/admin/banners", {
      method: "POST",
      expected: 201,
      token: adminToken,
      body: { title: "API Test Banner", imageUrl: "https://example.com/test.jpg", isActive: true },
    });
    created.banner = idOf(banner);
    await request(baseUrl, "admin banner list", "/api/v1/admin/banners", { token: adminToken });
    await request(baseUrl, "admin banner detail", `/api/v1/admin/banners/${created.banner}`, { token: adminToken });
    await request(baseUrl, "admin banner update", `/api/v1/admin/banners/${created.banner}`, {
      method: "PUT",
      token: adminToken,
      body: { title: "Updated API Test Banner" },
    });
    await request(baseUrl, "customer banner list", "/api/v1/banners");
    await request(baseUrl, "legacy banner list alias", "/api/banners");

    const inventory = await request(baseUrl, "admin create inventory", "/api/v1/admin/inventory", {
      method: "POST",
      expected: 201,
      token: adminToken,
      body: { productId, sku, stock: 10, reserved: 1, location: "test", status: "IN_STOCK" },
    });
    created.inventory = idOf(inventory);
    await request(baseUrl, "admin inventory list", "/api/v1/admin/inventory", { token: adminToken });
    await request(baseUrl, "admin inventory detail", `/api/v1/admin/inventory/${created.inventory}`, { token: adminToken });
    await request(baseUrl, "admin inventory update", `/api/v1/admin/inventory/${created.inventory}`, {
      method: "PATCH",
      token: adminToken,
      body: { stock: 12 },
    });

    const coupon = await request(baseUrl, "admin create coupon", "/api/v1/admin/coupons", {
      method: "POST",
      expected: 201,
      token: adminToken,
      body: {
        code: couponCode,
        description: "API test coupon",
        type: "PERCENTAGE",
        value: 10,
        minOrderValue: 0,
        maxDiscount: 20,
        isActive: true,
        usageLimit: 10,
      },
    });
    created.coupon = idOf(coupon);
    await request(baseUrl, "admin coupons list", "/api/v1/admin/coupons", { token: adminToken });
    await request(baseUrl, "admin coupon detail", `/api/v1/admin/coupons/${created.coupon}`, { token: adminToken });
    await request(baseUrl, "admin coupon update", `/api/v1/admin/coupons/${created.coupon}`, {
      method: "PATCH",
      token: adminToken,
      body: { value: 15 },
    });

    await request(baseUrl, "admin customer list", "/api/v1/admin/users", { token: adminToken });
    await request(baseUrl, "admin customer detail", `/api/v1/admin/users/${created.customer}`, { token: adminToken });

    await request(baseUrl, "customer cart list", "/api/v1/cart", { token: customerToken });
    await request(baseUrl, "customer cart add", "/api/v1/cart/add", {
      method: "POST",
      token: customerToken,
      body: { productId, quantity: 1, selectedSize: "M", selectedColour: "Blue" },
    });
    await request(baseUrl, "customer cart update", `/api/v1/cart/items/${productId}`, {
      method: "PUT",
      token: customerToken,
      body: { quantity: 2 },
    });

    const order = await request(baseUrl, "customer checkout", "/api/v1/orders/checkout", {
      method: "POST",
      expected: 201,
      token: customerToken,
      body: {
        shippingAddress: {
          name: "API Test Customer",
          phone: customerPhone,
          addressLine1: "1 Test Street",
          city: "Nashville",
          state: "Tennessee",
          pincode: "37201",
        },
        paymentMethod: "COD",
      },
    });
    created.order = idOf(order);
    await request(baseUrl, "customer cart read after checkout", "/api/v1/cart", { token: customerToken });
    await request(baseUrl, "customer orders list", "/api/v1/orders", { token: customerToken });
    await request(baseUrl, "customer order detail", `/api/v1/orders/${created.order}`, { token: customerToken });
    await request(baseUrl, "admin order list", "/api/v1/admin/orders", { token: adminToken });
    await request(baseUrl, "admin order detail", `/api/v1/admin/orders/${created.order}`, { token: adminToken });
    await request(baseUrl, "admin order status update", `/api/v1/admin/orders/${created.order}/status`, {
      method: "PUT",
      token: adminToken,
      body: { orderStatus: "CONFIRMED" },
    });

    await request(baseUrl, "admin all-orders compatibility route", "/api/v1/orders/admin/orders", { token: adminToken });
    await request(baseUrl, "admin status compatibility route", `/api/v1/orders/${created.order}/status`, {
      method: "PUT",
      token: adminToken,
      body: { orderStatus: "PROCESSING" },
    });

    await request(baseUrl, "customer wishlist list", "/api/v1/wishlist", { token: customerToken });
    await request(baseUrl, "customer wishlist add", `/api/v1/wishlist/${productId}`, { method: "POST", token: customerToken });
    await request(baseUrl, "customer wishlist remove", `/api/v1/wishlist/${productId}`, { method: "POST", token: customerToken });

    const review = await request(baseUrl, "customer review create", "/api/v1/reviews", {
      method: "POST",
      expected: 201,
      token: customerToken,
      body: { productId, rating: 5, title: "Great", comment: "API flow review" },
    });
    created.review = idOf(review);
    await request(baseUrl, "customer review list", `/api/v1/reviews?productId=${productId}`);
    await request(baseUrl, "customer review update", `/api/v1/reviews/${created.review}`, {
      method: "PATCH",
      token: customerToken,
      body: { comment: "Updated API flow review" },
    });

    await request(baseUrl, "customer cart add for remove", "/api/v1/cart/add", {
      method: "POST",
      token: customerToken,
      body: { productId, quantity: 1 },
    });
    await request(baseUrl, "customer cart remove item", `/api/v1/cart/items/${productId}`, {
      method: "DELETE",
      token: customerToken,
    });
    await request(baseUrl, "customer cart add for clear", "/api/v1/cart/add", {
      method: "POST",
      token: customerToken,
      body: { productId, quantity: 1 },
    });
    await request(baseUrl, "customer cart clear", "/api/v1/cart/clear", {
      method: "DELETE",
      token: customerToken,
    });
    await request(baseUrl, "customer review delete", `/api/v1/reviews/${created.review}`, {
      method: "DELETE",
      token: customerToken,
    });

    await request(baseUrl, "admin inventory delete", `/api/v1/admin/inventory/${created.inventory}`, {
      method: "DELETE",
      token: adminToken,
    });
    await request(baseUrl, "admin coupon delete", `/api/v1/admin/coupons/${created.coupon}`, {
      method: "DELETE",
      token: adminToken,
    });
    await request(baseUrl, "admin banner delete", `/api/v1/admin/banners/${created.banner}`, {
      method: "DELETE",
      token: adminToken,
    });
    await request(baseUrl, "admin category delete", `/api/v1/admin/categories/${created.category}`, {
      method: "DELETE",
      token: adminToken,
    });
    await request(baseUrl, "admin product deactivate", `/api/v1/admin/products/${productId}/deactivate`, {
      method: "DELETE",
      token: adminToken,
    });
    await request(baseUrl, "admin product delete", `/api/v1/admin/products/${productId}`, {
      method: "DELETE",
      token: adminToken,
    });

    console.log(`[API] Completed ${apiChecks} HTTP checks`);
    assert.deepEqual(failures, [], `Failed API checks:\n${failures.join("\n")}`);
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    const clean = async (model: any, id?: string) => {
      if (id && id !== "missing-id") await model.findByIdAndDelete(id);
    };
    try {
      await clean(Admin, created.admin);
      await clean(User, created.customer);
      await clean(Product, created.product);
      await clean(Product, created.aliasProduct);
      await clean(Category, created.category);
      await clean(Category, created.aliasCategory);
      await clean(Banner, created.banner);
      await clean(Inventory, created.inventory);
      await clean(Coupon, created.coupon);
      await clean(Order, created.order);
      await clean(Review, created.review);
      if (created.customer) {
        const cart = await Cart.findOne({ user: created.customer });
        if (cart) await Cart.findByIdAndDelete(String(cart._id));
        const wishlist = await Wishlist.findOne({ user: created.customer });
        if (wishlist) await Wishlist.findByIdAndDelete(String(wishlist._id));
      }
    } finally {
      process.chdir(originalWorkingDirectory);
      await rm(temporaryDataDirectory, {
        recursive: true,
        force: true,
        maxRetries: 10,
        retryDelay: 100,
      });
    }
  }
});
