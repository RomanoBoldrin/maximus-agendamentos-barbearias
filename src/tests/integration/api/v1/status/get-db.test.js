test("GET /api/v1/status/db should return 200 and confirm database is ok", async () => {
  const response = await fetch("http://localhost:3000/api/v1/status/db");

  expect(response.status).toBe(200);

  const body = await response.json();

  expect(body.database).toBe("ok");
  expect(typeof body.clientCount).toBe("number");
});
