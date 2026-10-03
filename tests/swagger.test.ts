import test from "node:test";
import assert from "node:assert/strict";

import { swaggerSpec } from "../src/swagger.js";

test("Swagger documents admin inventory, coupons, and customer reviews", () => {
  const paths = swaggerSpec.paths ?? {};

  assert.ok(paths["/admin/inventory"]?.get);
  assert.ok(paths["/admin/inventory"]?.post);
  assert.ok(paths["/admin/inventory/{id}"]?.get);
  assert.ok(paths["/admin/inventory/{id}"]?.patch);
  assert.ok(paths["/admin/inventory/{id}"]?.delete);

  assert.ok(paths["/admin/coupons"]?.get);
  assert.ok(paths["/admin/coupons"]?.post);
  assert.ok(paths["/admin/coupons/{id}"]?.get);
  assert.ok(paths["/admin/coupons/{id}"]?.patch);
  assert.ok(paths["/admin/coupons/{id}"]?.delete);

  assert.ok(paths["/reviews"]?.get);
  assert.ok(paths["/reviews"]?.post);
  assert.ok(paths["/reviews/{id}"]?.patch);
  assert.ok(paths["/reviews/{id}"]?.delete);
});
