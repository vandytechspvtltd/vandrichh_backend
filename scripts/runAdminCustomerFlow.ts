import bcrypt from "bcryptjs";
import { loadEnv } from "../src/config/env.js";
import { Admin } from "../src/models/admin.model.js";

loadEnv();

const baseUrl = "http://localhost:5000";
const adminEmail = `all-apis-${Date.now()}@example.com`;
const adminPassword = "TestPass123!";
const sku = `ADMIN-API-${Date.now()}`;
const productName = `All API Product ${Date.now()}`;
const updatedName = `${productName} Updated`;

let existing: any = null;
try {
  existing = await Admin.findOne({ email: adminEmail }).lean();
} catch {
  existing = null;
}

if (!existing) {
  await Admin.create({
    name: "API Auditor",
    email: adminEmail,
    passwordHash: await bcrypt.hash(adminPassword, 12),
    role: "ADMIN",
    isActive: true,
  });
}

const loginResponse = await fetch(`${baseUrl}/api/v1/admin/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: adminEmail, password: adminPassword }),
});
const loginJson = await loginResponse.json();
const token = loginJson.data?.token;
console.log("LOGIN_STATUS", loginResponse.status);
console.log("LOGIN_OK", !!token);

const createBody = {
  sku,
  category: "Shirts",
  productName,
  material: "Cotton",
  availableSizes: ["S", "M", "L"],
  colours: ["White"],
  wholesalePrice: 200,
  mrp: 499,
  sellingPrice: 399,
  description: "All API flow test",
  images: ["https://example.com/all-api.jpg"],
  stock: 20,
  isActive: true,
  isFeatured: false,
  isTrending: false,
  isNew: false,
};

const createResponse = await fetch(`${baseUrl}/api/v1/admin/products`, {
  method: "POST",
  headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
  body: JSON.stringify(createBody),
});
const createJson = await createResponse.json();
console.log("CREATE_STATUS", createResponse.status);
console.log("CREATE_ID", createJson.data?._id ?? createJson.data?.id);

const listResponse = await fetch(`${baseUrl}/api/v1/admin/products`, {
  headers: { Authorization: `Bearer ${token}` },
});
const listJson = await listResponse.json();
console.log("ADMIN_LIST_STATUS", listResponse.status);
console.log("ADMIN_HAS_PRODUCT", listJson.data?.some((product: any) => product.sku === sku) ?? false);

const customerListResponse = await fetch(`${baseUrl}/api/v1/products?limit=100`);
const customerListJson = await customerListResponse.json();
console.log("CUSTOMER_LIST_STATUS", customerListResponse.status);
console.log("CUSTOMER_HAS_PRODUCT", customerListJson.data?.products?.some((product: any) => product.sku === sku) ?? false);

const detailId = createJson.data?._id ?? createJson.data?.id;
const detailResponse = await fetch(`${baseUrl}/api/v1/products/${detailId}`);
const detailJson = await detailResponse.json();
console.log("DETAIL_STATUS", detailResponse.status);
console.log("DETAIL_SKU", detailJson.data?.sku);
console.log("DETAIL_NAME", detailJson.data?.productName);

const patchResponse = await fetch(`${baseUrl}/api/v1/admin/products/${detailId}`, {
  method: "PATCH",
  headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
  body: JSON.stringify({ productName: updatedName, sellingPrice: 429 }),
});
const patchJson = await patchResponse.json();
console.log("PATCH_STATUS", patchResponse.status);
console.log("PATCH_NAME", patchJson.data?.productName);

const customerAfterPatchResponse = await fetch(`${baseUrl}/api/v1/products?limit=100`);
const customerAfterPatchJson = await customerAfterPatchResponse.json();
console.log("CUSTOMER_PATCH_FOUND", customerAfterPatchJson.data?.products?.some((product: any) => product.sku === sku && product.productName === updatedName) ?? false);

const deleteResponse = await fetch(`${baseUrl}/api/v1/admin/products/${detailId}`, {
  method: "DELETE",
  headers: { Authorization: `Bearer ${token}` },
});
console.log("DELETE_STATUS", deleteResponse.status);

const customerAfterDeleteResponse = await fetch(`${baseUrl}/api/v1/products?limit=100`);
const customerAfterDeleteJson = await customerAfterDeleteResponse.json();
console.log("CUSTOMER_AFTER_DELETE", customerAfterDeleteJson.data?.products?.some((product: any) => product.sku === sku) ?? false);

const healthResponse = await fetch(`${baseUrl}/api/v1/health`);
console.log("HEALTH_STATUS", healthResponse.status);
console.log("HEALTH_BODY", await healthResponse.text());

console.log("ALL_API_FLOW_OK");
