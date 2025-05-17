import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "@/app.module";
import { PrismaService } from "@/prisma/prisma.service";
import { UserRole } from "@/common/enums/role.enum";
import { HealthStatus } from "@/common/enums/health-status.enum";

// Helper functions to generate unique test data
function createTestOwner(prefix: string = "owner") {
  return {
    name: `${prefix}_name`,
    email: `${prefix}_${Date.now()}_${Math.random().toString(36).substring(7)}@example.com`,
  };
}

function createTestHorse(prefix: string = "horse") {
  return {
    name: `${prefix}_name`,
    age: 5,
    breed: "Arabian",
    healthStatus: HealthStatus.HEALTHY,
  };
}

describe("HorseController (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
        errorHttpStatusCode: 422,
      }),
    );

    await app.init();

    // Clean database before all tests
    await prisma.$transaction([
      prisma.horse.deleteMany(),
      prisma.owner.deleteMany(),
    ]);
  });

  afterAll(async () => {
    // Clean database after all tests
    await prisma.$transaction([
      prisma.horse.deleteMany(),
      prisma.owner.deleteMany(),
    ]);
    await prisma.$disconnect();
    await app.close();
  });

  describe("CRUD Operations", () => {
    const testOwner = createTestOwner("crud");
    const testHorse = createTestHorse("crud");
    let ownerId: number;
    let horseId: number;

    beforeAll(async () => {
      // Clean database before CRUD tests
      await prisma.$transaction([
        prisma.horse.deleteMany(),
        prisma.owner.deleteMany(),
      ]);
    });

    afterAll(async () => {
      // Clean database after CRUD tests
      await prisma.$transaction([
        prisma.horse.deleteMany(),
        prisma.owner.deleteMany(),
      ]);
    });

    it("should create an owner first", async () => {
      const response = await request(app.getHttpServer())
        .post("/api/v1/owners")
        .set("x-user-role", UserRole.ADMIN)
        .send(testOwner)
        .expect(201);

      expect(response.body).toMatchObject(testOwner);
      expect(response.body.id).toBeDefined();
      ownerId = response.body.id;
    });

    it("should create a horse", async () => {
      const response = await request(app.getHttpServer())
        .post("/api/v1/horses")
        .set("x-user-role", UserRole.ADMIN)
        .send({ ...testHorse, owner: ownerId })
        .expect(201);

      expect(response.body).toMatchObject({
        ...testHorse,
        owner: ownerId,
      });
      expect(response.body.id).toBeDefined();
      horseId = response.body.id;
    });

    it("should get all horses (GET /api/v1/horses)", async () => {
      const response = await request(app.getHttpServer())
        .get("/api/v1/horses")
        .set("x-user-role", UserRole.VET)
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toMatchObject(testHorse);
    });

    it("should get a horse by id (GET /api/v1/horses/:id)", async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/horses/${horseId}`)
        .set("x-user-role", UserRole.VET)
        .expect(200);

      expect(response.body).toMatchObject({
        ...testHorse,
        id: horseId,
        owner: ownerId,
      });
    });

    it("should update a horse (PUT /api/v1/horses/:id)", async () => {
      const updateData = {
        name: "Updated Spirit",
        age: 6,
      };

      const response = await request(app.getHttpServer())
        .put(`/api/v1/horses/${horseId}`)
        .set("x-user-role", UserRole.ADMIN)
        .send(updateData)
        .expect(200);

      expect(response.body).toMatchObject({
        ...testHorse,
        ...updateData,
        id: horseId,
        owner: ownerId,
      });
    });

    it("should delete a horse (DELETE /api/v1/horses/:id)", async () => {
      await request(app.getHttpServer())
        .delete(`/api/v1/horses/${horseId}`)
        .set("x-user-role", UserRole.ADMIN)
        .expect(204);

      // Verify horse was deleted
      await request(app.getHttpServer())
        .get(`/api/v1/horses/${horseId}`)
        .set("x-user-role", UserRole.ADMIN)
        .expect(404);
    });
  });

  describe("Role-based Access Control", () => {
    const testOwner = createTestOwner("rbac");
    const testHorse = createTestHorse("rbac");
    let ownerId: number;

    beforeAll(async () => {
      // Clean database before RBAC tests
      await prisma.$transaction([
        prisma.horse.deleteMany(),
        prisma.owner.deleteMany(),
      ]);

      const owner = await prisma.owner.create({ data: testOwner });
      ownerId = owner.id;
    });

    afterAll(async () => {
      // Clean database after RBAC tests
      await prisma.$transaction([
        prisma.horse.deleteMany(),
        prisma.owner.deleteMany(),
      ]);
    });

    it("should allow VET to read horses", async () => {
      await request(app.getHttpServer())
        .get("/api/v1/horses")
        .set("x-user-role", UserRole.VET)
        .expect(200);
    });

    it("should not allow VET to create horses", async () => {
      await request(app.getHttpServer())
        .post("/api/v1/horses")
        .set("x-user-role", UserRole.VET)
        .send({ ...testHorse, owner: ownerId })
        .expect(403);
    });

    it("should not allow VET to update horses", async () => {
      const horse = await prisma.horse.create({
        data: { ...testHorse, owner: ownerId },
      });

      await request(app.getHttpServer())
        .put(`/api/v1/horses/${horse.id}`)
        .set("x-user-role", UserRole.VET)
        .send({ name: "Updated" })
        .expect(403);
    });

    it("should not allow VET to delete horses", async () => {
      const horse = await prisma.horse.create({
        data: { ...testHorse, owner: ownerId },
      });

      await request(app.getHttpServer())
        .delete(`/api/v1/horses/${horse.id}`)
        .set("x-user-role", UserRole.VET)
        .expect(403);
    });

    it("should reject requests without role header", async () => {
      await request(app.getHttpServer()).get("/api/v1/horses").expect(403);
    });
  });

  describe("Filtering", () => {
    let ownerId: number;

    beforeAll(async () => {
      // Clean database before filtering tests
      await prisma.$transaction([
        prisma.horse.deleteMany(),
        prisma.owner.deleteMany(),
      ]);

      // Create test owner with unique data
      const owner = await prisma.owner.create({
        data: createTestOwner("filter"),
      });
      ownerId = owner.id;

      // Create test horses with different attributes
      await prisma.horse.createMany({
        data: [
          {
            name: "Young Arabian",
            age: 3,
            breed: "Arabian",
            healthStatus: HealthStatus.HEALTHY,
            owner: ownerId,
          },
          {
            name: "Adult Mustang",
            age: 10,
            breed: "Mustang",
            healthStatus: HealthStatus.RECOVERING,
            owner: ownerId,
          },
          {
            name: "Old Arabian",
            age: 15,
            breed: "Arabian",
            healthStatus: HealthStatus.INJURED,
            owner: ownerId,
          },
        ],
      });
    });

    it("should filter horses by age", async () => {
      const response = await request(app.getHttpServer())
        .get("/api/v1/horses")
        .query({ age: 10 })
        .set("x-user-role", UserRole.VET)
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].age).toBe(10);
      expect(response.body[0].breed).toBe("Mustang");
    });

    it("should filter horses by breed", async () => {
      const response = await request(app.getHttpServer())
        .get("/api/v1/horses")
        .query({ breed: "Arabian" })
        .set("x-user-role", UserRole.VET)
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body.every((horse) => horse.breed === "Arabian")).toBe(
        true,
      );
    });

    it("should filter horses by health status", async () => {
      const response = await request(app.getHttpServer())
        .get("/api/v1/horses")
        .query({ healthStatus: HealthStatus.INJURED })
        .set("x-user-role", UserRole.VET)
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].healthStatus).toBe(HealthStatus.INJURED);
    });

    it("should combine multiple filters", async () => {
      const response = await request(app.getHttpServer())
        .get("/api/v1/horses")
        .query({
          breed: "Arabian",
          healthStatus: HealthStatus.HEALTHY,
          age: 3,
        })
        .set("x-user-role", UserRole.VET)
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toMatchObject({
        name: "Young Arabian",
        breed: "Arabian",
        healthStatus: HealthStatus.HEALTHY,
        age: 3,
      });
    });

    it("should return empty array when no matches found", async () => {
      const response = await request(app.getHttpServer())
        .get("/api/v1/horses")
        .query({
          breed: "Arabian",
          healthStatus: HealthStatus.HEALTHY,
          age: 20,
        })
        .set("x-user-role", UserRole.VET)
        .expect(200);

      expect(response.body).toHaveLength(0);
    });
  });

  describe("Health Status Management", () => {
    const testOwner = createTestOwner("health");
    const testHorse = createTestHorse("health");
    let ownerId: number;
    let horseId: number;

    beforeAll(async () => {
      // Clean database before health status tests
      await prisma.$transaction([
        prisma.horse.deleteMany(),
        prisma.owner.deleteMany(),
      ]);

      const owner = await prisma.owner.create({ data: testOwner });
      ownerId = owner.id;

      const horse = await prisma.horse.create({
        data: { ...testHorse, owner: ownerId },
      });
      horseId = horse.id;
    });

    afterAll(async () => {
      // Clean database after health status tests
      await prisma.$transaction([
        prisma.horse.deleteMany(),
        prisma.owner.deleteMany(),
      ]);
    });

    it("should allow VET to update horse health status", async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/horses/${horseId}/health`)
        .set("x-user-role", UserRole.VET)
        .send({ healthStatus: HealthStatus.INJURED })
        .expect(200);

      expect(response.body.healthStatus).toBe(HealthStatus.INJURED);
    });

    it("should allow ADMIN to update horse health status", async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/horses/${horseId}/health`)
        .set("x-user-role", UserRole.ADMIN)
        .send({ healthStatus: HealthStatus.RECOVERING })
        .expect(200);

      expect(response.body.healthStatus).toBe(HealthStatus.RECOVERING);
    });
  });

  describe("Validation and Edge Cases", () => {
    const testOwner = createTestOwner("validation");
    const testHorse = createTestHorse("validation");
    let ownerId: number;

    beforeAll(async () => {
      // Clean database before validation tests
      await prisma.$transaction([
        prisma.horse.deleteMany(),
        prisma.owner.deleteMany(),
      ]);

      const owner = await prisma.owner.create({ data: testOwner });
      ownerId = owner.id;
    });

    afterAll(async () => {
      // Clean database after validation tests
      await prisma.$transaction([
        prisma.horse.deleteMany(),
        prisma.owner.deleteMany(),
      ]);
    });

    it("should validate horse age range", async () => {
      await request(app.getHttpServer())
        .post("/api/v1/horses")
        .set("x-user-role", UserRole.ADMIN)
        .send({ ...testHorse, age: 0, owner: ownerId })
        .expect(422);

      await request(app.getHttpServer())
        .post("/api/v1/horses")
        .set("x-user-role", UserRole.ADMIN)
        .send({ ...testHorse, age: 31, owner: ownerId })
        .expect(422);
    });

    it("should validate required fields", async () => {
      await request(app.getHttpServer())
        .post("/api/v1/horses")
        .set("x-user-role", UserRole.ADMIN)
        .send({ name: "Test Horse" }) // Missing required fields
        .expect(422);
    });

    it("should handle non-existent owner", async () => {
      await request(app.getHttpServer())
        .post("/api/v1/horses")
        .set("x-user-role", UserRole.ADMIN)
        .send({ ...testHorse, owner: 99999 }) // Non-existent owner ID
        .expect(404);
    });

    it("should handle non-existent horse", async () => {
      await request(app.getHttpServer())
        .get("/api/v1/horses/99999")
        .set("x-user-role", UserRole.VET)
        .expect(404);
    });
  });
});
