import request from "supertest";
import app from "../src/app.js";

describe("Health Endpoint", () => {
  it("should return 200 and success message", async () => {
    const response = await request(app).get("/api/v1/health");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toContain("running");
  });
});
