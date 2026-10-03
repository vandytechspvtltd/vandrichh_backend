import test from "node:test";
import assert from "node:assert/strict";
import { loadEnv } from "../src/config/env.js";

loadEnv();

const { default: app } = await import("../src/app.js");
const { Admin } = await import("../src/models/admin.model.js");
const { Product } = await import("../src/models/product.model.js");
const { readData } = await import("../src/utils/jsonDatabase.js");

const port = 5010 + Math.floor(Math.random() * 1000);

const productSku = `TEST-FLOW-${Date.now()}`;
const productName = "API Test Product";
const updatedName = "API Test Product Updated";

async function withServer<T>(fn: (baseUrl: string, token: string) => Promise<T>) {
  const server = app.listen(port);
  const adminEmail = `product-test-${Date.now()}@example.com`;
  const adminPassword = "TestPass123!";

  const admin = await Admin.create({
    name: "Product Test Admin",
    email: adminEmail,
    passwordHash: await (await import("bcryptjs")).default.hash(adminPassword, 12),
    role: "ADMIN",
    isActive: true,
  });

  const loginResponse = await fetch(`http://localhost:${port}/api/v1/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: adminEmail, password: adminPassword }),
  });

  assert.equal(loginResponse.status, 200, "Admin login should succeed");
  const loginData = await loginResponse.json();
  const token = loginData.data.token;

  try {
    return await fn(`http://localhost:${port}`, token);
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
    await Admin.findByIdAndDelete(String(admin._id));
  }
}

test("admin create + patch + customer visibility flow works with JSON product storage", async () => {
  await withServer(async (baseUrl, token) => {
    const createResponse = await fetch(`${baseUrl}/api/v1/admin/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        sku: productSku,
        category: "Shirts",
        productName: productName,
        material: "Cotton",
        availableSizes: ["S", "M", "L"],
        colours: ["White"],
        wholesalePrice: 200,
        mrp: 499,
        sellingPrice: 399,
        description: "Created from API test",
        images: ["https://example.com/test.jpg"],
        stock: 12,
        isActive: true,
        isFeatured: false,
        isTrending: false,
        isNew: false,
      }),
    });

    assert.equal(createResponse.status, 201, "Product creation should return 201");
    const created = await createResponse.json();
    assert.ok(created.data?._id || created.data?.id, "Create response should return a product id");

    const productId = created.data?._id || created.data?.id;
    const fileProducts = await readData<any>("products");
    assert.ok(fileProducts.some((item) => item.sku === productSku && item.productName === productName), "Product should be persisted to src/data/products.json");

    const customerResponse = await fetch(`${baseUrl}/api/v1/products?limit=100`);
    assert.equal(customerResponse.status, 200, "Customer product list should be available");
    const customerData = await customerResponse.json();
    const customerProducts = customerData.data?.products ?? [];
    assert.ok(customerProducts.some((item) => item.sku === productSku && item.productName === productName), "Customer API should include the created product");

    const patchResponse = await fetch(`${baseUrl}/api/v1/admin/products/${productId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ productName: updatedName, sellingPrice: 449 }),
    });

    assert.equal(patchResponse.status, 200, "PATCH update should succeed");
    const patched = await patchResponse.json();
    assert.equal(patched.data.productName, updatedName, "Product name should be updated");

    const refreshedCustomerResponse = await fetch(`${baseUrl}/api/v1/products?limit=100`);
    const refreshedCustomerProducts = (await refreshedCustomerResponse.json()).data?.products ?? [];
    assert.ok(refreshedCustomerProducts.some((item) => item.sku === productSku && item.productName === updatedName), "Customer API should show the updated product data");

    const deleteResponse = await fetch(`${baseUrl}/api/v1/admin/products/${productId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    assert.equal(deleteResponse.status, 200, "Delete should succeed");

    const afterDeleteCustomerResponse = await fetch(`${baseUrl}/api/v1/products?limit=100`);
    const afterDeleteCustomerProducts = (await afterDeleteCustomerResponse.json()).data?.products ?? [];
    assert.ok(!afterDeleteCustomerProducts.some((item) => item.sku === productSku), "Deleted product should not remain in customer listing");
  });
});
