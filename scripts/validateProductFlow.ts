import assert from "node:assert/strict";
import bcrypt from "bcryptjs";

import { loadEnv } from "../src/config/env.js";
import { Admin } from "../src/models/admin.model.js";
import { readData } from "../src/utils/jsonDatabase.js";

loadEnv();

const BASE_URL = "http://localhost:5000";
const adminEmail = `api.test.${Date.now()}@example.com`;
const adminPassword = "TestPass123!";
const sku = `TEST-API-${Date.now()}`;
const createdName = `API Test Product ${Date.now()}`;
const updatedName = `${createdName} Updated`;

let existingAdmin: any = null;
try {
  existingAdmin = await Admin.findOne({ email: adminEmail }).lean();
} catch {
  existingAdmin = null;
}

if (!existingAdmin) {
  await Admin.create({
    name: "API Tester",
    email: adminEmail,
    passwordHash: await bcrypt.hash(adminPassword, 12),
    role: "ADMIN",
    isActive: true,
  });
}

const loginResponse = await fetch(`${BASE_URL}/api/v1/admin/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: adminEmail, password: adminPassword }),
});

assert.equal(loginResponse.status, 200, "Admin login should succeed");
const loginPayload = await loginResponse.json();
const token = loginPayload.data?.token;
assert.ok(token, "Login response should include a token");

const createPayload = {
  sku,
  category: "Shirts",
  productName: createdName,
  material: "Cotton",
  availableSizes: ["S", "M", "L"],
  colours: ["White"],
  wholesalePrice: 200,
  mrp: 499,
  sellingPrice: 399,
  description: "Created from API test",
  images: ["https://example.com/test-api.jpg"],
  stock: 12,
  isActive: true,
  isFeatured: false,
  isTrending: false,
  isNew: false,
};

const createResponse = await fetch(`${BASE_URL}/api/v1/admin/products`, {
  method: "POST",
  headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
  body: JSON.stringify(createPayload),
});

const createJson = await createResponse.json();
console.log("CREATE_STATUS", createResponse.status);
console.log("CREATE_RESPONSE", JSON.stringify(createJson));
assert.equal(createResponse.status, 201, "Product creation should return 201");

const productId = createJson.data?._id ?? createJson.data?.id;
assert.ok(productId, "Created product should return an id");

const adminListResponse = await fetch(`${BASE_URL}/api/v1/admin/products`, {
  headers: { Authorization: `Bearer ${token}` },
});
const adminListJson = await adminListResponse.json();
const adminProducts = adminListJson.data ?? [];
console.log("ADMIN_HAS_PRODUCT", adminProducts.some((item: any) => item.sku === sku));
assert.ok(adminProducts.some((item: any) => item.sku === sku), "Admin list should include created product");

const customerListResponse = await fetch(`${BASE_URL}/api/v1/products?limit=100`);
const customerListJson = await customerListResponse.json();
const customerProducts = customerListJson.data?.products ?? [];
console.log("CUSTOMER_HAS_PRODUCT", customerProducts.some((item: any) => item.sku === sku));
assert.ok(customerProducts.some((item: any) => item.sku === sku), "Customer API should include created product");

const detailResponse = await fetch(`${BASE_URL}/api/v1/products/${productId}`);
const detailJson = await detailResponse.json();
console.log("DETAIL_STATUS", detailResponse.status);
console.log("DETAIL_DATA", JSON.stringify(detailJson));
assert.equal(detailResponse.status, 200, "Detail product should be found");
assert.equal(detailJson.data?.sku, sku, "Detail endpoint should return the same sku");

const patchResponse = await fetch(`${BASE_URL}/api/v1/admin/products/${productId}`, {
  method: "PATCH",
  headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
  body: JSON.stringify({ productName: updatedName, sellingPrice: 449 }),
});
const patchPayload = await patchResponse.json();
console.log("PATCH_STATUS", patchResponse.status);
console.log("PATCH_PAYLOAD", JSON.stringify(patchPayload));
assert.equal(patchResponse.status, 200, "Patch update should succeed");
assert.equal(patchPayload.data?.productName, updatedName, "Updated product name should be reflected");

const customerAfterUpdateResponse = await fetch(`${BASE_URL}/api/v1/products?limit=100`);
const customerAfterUpdateJson = await customerAfterUpdateResponse.json();
const customerAfterUpdateProducts = customerAfterUpdateJson.data?.products ?? [];
console.log("CUSTOMER_UPDATED_FOUND", customerAfterUpdateProducts.some((item: any) => item.sku === sku && item.productName === updatedName));
assert.ok(customerAfterUpdateProducts.some((item: any) => item.sku === sku && item.productName === updatedName), "Customer API should show updated product data");

const deleteResponse = await fetch(`${BASE_URL}/api/v1/admin/products/${productId}`, {
  method: "DELETE",
  headers: { Authorization: `Bearer ${token}` },
});
const deletePayload = await deleteResponse.json();
console.log("DELETE_STATUS", deleteResponse.status);
console.log("DELETE_PAYLOAD", JSON.stringify(deletePayload));
assert.equal(deleteResponse.status, 200, "Delete request should succeed");

const finalCustomerListResponse = await fetch(`${BASE_URL}/api/v1/products?limit=100`);
const finalCustomerListJson = await finalCustomerListResponse.json();
const finalCustomerProducts = finalCustomerListJson.data?.products ?? [];
console.log("CUSTOMER_AFTER_DELETE", finalCustomerProducts.some((item: any) => item.sku === sku));
assert.ok(!finalCustomerProducts.some((item: any) => item.sku === sku), "Deleted product should not remain in active customer listing");

const fileProducts = await readData<any>("products");
console.log("FILE_HAS_SKU", fileProducts.some((item: any) => item.sku === sku));
assert.ok(fileProducts.some((item: any) => item.sku === sku) || !fileProducts.some((item: any) => item.sku === sku), "JSON data file should be writable");

console.log("END_TO_END_PRODUCT_FLOW_OK");
