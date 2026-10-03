import test from "node:test";
import assert from "node:assert/strict";
import { loadEnv } from "../src/config/env.js";

loadEnv();

const { default: app } = await import("../src/app.js");

test("health endpoint returns success", async () => {
  const port = 5100 + Math.floor(Math.random() * 1000);
  const server = app.listen(port);

  try {
    const response = await fetch(`http://localhost:${port}/api/v1/health`);
    assert.equal(response.status, 200);
    const payload = await response.json();
    assert.equal(payload.success, true);
    assert.match(payload.message, /running/i);
  } finally {
    await new Promise<void>((resolve, reject) => server.close((err) => (err ? reject(err) : resolve())));
  }
});
