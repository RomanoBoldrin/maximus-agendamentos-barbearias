import orchestrator from "@/tests/orchestrator/orchestrator.mjs";
import webserver from "@/infra/webserver.mjs";

describe("GET /api/v1/barbers", () => {
  describe("Anonymous user", () => {
    test("With empty barbers list", async () => {
      const response = await fetch(`${webserver.origin}/api/v1/barbers`);

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(Array.isArray(responseBody)).toBe(true);
    });

    test("With active barbers", async () => {
      const createdBarber1 = await orchestrator.createBarber({
        barberName: "Barber 1",
        phoneNumber: "123456789",
        workStart: "08:00",
        workEnd: "18:00",
      });

      const createdBarber2 = await orchestrator.createBarber({
        barberName: "Barber 2",
        phoneNumber: "987654321",
      });

      const response = await fetch(`${webserver.origin}/api/v1/barbers`);

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            barber_id: createdBarber1.barberId,
            barber_name: "Barber 1",
            phone_number: "123456789",
            work_start: "08:00",
            work_end: "18:00",
            lunch_start: null,
            lunch_end: null,
            is_active: true,
            created_at: createdBarber1.createdAt.toISOString(),
            updated_at: createdBarber1.updatedAt.toISOString(),
          }),
          expect.objectContaining({
            barber_id: createdBarber2.barberId,
            barber_name: "Barber 2",
            phone_number: "987654321",
            work_start: "08:00",
            work_end: "18:00",
            lunch_start: null,
            lunch_end: null,
            is_active: true,
            created_at: createdBarber2.createdAt.toISOString(),
            updated_at: createdBarber2.updatedAt.toISOString(),
          }),
        ]),
      );
    });

    test("With inactive barbers excluded", async () => {
      await orchestrator.createBarber({
        barberName: "Active Barber",
        isActive: true,
      });

      await orchestrator.createBarber({
        barberName: "Inactive Barber",
        isActive: false,
      });

      const response = await fetch(`${webserver.origin}/api/v1/barbers`);

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      // Ensure active barber is present and inactive barber is not
      const names = responseBody.map((b) => b.barber_name);
      expect(names).toEqual(expect.arrayContaining(["Active Barber"]));
      expect(names).not.toEqual(expect.arrayContaining(["Inactive Barber"]));
    });
  });
});
