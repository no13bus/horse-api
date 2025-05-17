import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/prisma/prisma.service";
import { UserRole } from "../src/common/enums/role.enum";
import { HealthStatus } from "../src/common/enums/health-status.enum";

// Helper function to generate unique test data
function createTestOwner(prefix: string = "owner") {
  return {
    name: `${prefix}_name`,
    email: `${prefix}_${Date.now()}_${Math.random().toString(36).substring(7)}@example.com`,
  };
}

describe("OwnerController (e2e)", () => {
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
    let ownerId: number;

    it("should create an owner", async () => {
      const response = await request(app.getHttpServer())
        .post("/api/v1/owners")
        .set("x-user-role", UserRole.ADMIN)
        .send(testOwner)
        .expect(201);

      expect(response.body).toMatchObject(testOwner);
      expect(response.body.id).toBeDefined();
      ownerId = response.body.id;
    });

    it("should get all owners (GET /api/v1/owners)", async () => {
      const response = await request(app.getHttpServer())
        .get("/api/v1/owners")
        .set("x-user-role", UserRole.ADMIN)
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toMatchObject(testOwner);
    });

    it("should get an owner by id (GET /api/v1/owners/:id)", async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/owners/${ownerId}`)
        .set("x-user-role", UserRole.ADMIN)
        .expect(200);

      expect(response.body).toMatchObject({
        ...testOwner,
        id: ownerId,
      });
    });

    it("should update an owner (PUT /api/v1/owners/:id)", async () => {
      const updateData = {
        name: "John Updated",
        email: "john.updated@example.com",
      };

      const response = await request(app.getHttpServer())
        .put(`/api/v1/owners/${ownerId}`)
        .set("x-user-role", UserRole.ADMIN)
        .send(updateData)
        .expect(200);

      expect(response.body).toMatchObject({
        ...updateData,
        id: ownerId,
      });
    });

    it("should delete an owner (DELETE /api/v1/owners/:id)", async () => {
      await request(app.getHttpServer())
        .delete(`/api/v1/owners/${ownerId}`)
        .set("x-user-role", UserRole.ADMIN)
        .expect(204);

      // Verify owner was deleted
      await request(app.getHttpServer())
        .get(`/api/v1/owners/${ownerId}`)
        .set("x-user-role", UserRole.ADMIN)
        .expect(404);
    });
  });

  describe("Role-based Access Control", () => {
    const testOwner = createTestOwner("rbac");
    let ownerId: number;

    beforeAll(async () => {
      const owner = await prisma.owner.create({ data: testOwner });
      ownerId = owner.id;
    });

    it("should allow VET to read owners", async () => {
      await request(app.getHttpServer())
        .get("/api/v1/owners")
        .set("x-user-role", UserRole.VET)
        .expect(200);
    });

    it("should not allow VET to create owners", async () => {
      await request(app.getHttpServer())
        .post("/api/v1/owners")
        .set("x-user-role", UserRole.VET)
        .send(testOwner)
        .expect(403);
    });

    it("should not allow VET to update owners", async () => {
      await request(app.getHttpServer())
        .put(`/api/v1/owners/${ownerId}`)
        .set("x-user-role", UserRole.VET)
        .send({ name: "Updated" })
        .expect(403);
    });

    it("should not allow VET to delete owners", async () => {
      await request(app.getHttpServer())
        .delete(`/api/v1/owners/${ownerId}`)
        .set("x-user-role", UserRole.VET)
        .expect(403);
    });

    it("should reject requests without role header", async () => {
      await request(app.getHttpServer()).get("/api/v1/owners").expect(403);
    });
  });

  describe("Owner-Horse Relationship", () => {
    const testOwner = createTestOwner("relationship");
    let ownerId: number;

    beforeAll(async () => {
      // Clean database before relationship tests
      await prisma.$transaction([
        prisma.horse.deleteMany(),
        prisma.owner.deleteMany(),
      ]);

      const owner = await prisma.owner.create({ data: testOwner });
      ownerId = owner.id;

      // Create test horses
      await prisma.horse.createMany({
        data: [
          {
            name: "Horse 1",
            age: 5,
            breed: "Arabian",
            healthStatus: HealthStatus.HEALTHY,
            owner: ownerId,
          },
          {
            name: "Horse 2",
            age: 7,
            breed: "Mustang",
            healthStatus: HealthStatus.HEALTHY,
            owner: ownerId,
          },
        ],
      });
    });

    it("should get owner details successfully", async () => {
      await request(app.getHttpServer())
        .get(`/api/v1/owners/${ownerId}`)
        .set("x-user-role", UserRole.ADMIN)
        .expect(200);
    });

    it("should delete associated horses when owner is deleted", async () => {
      // First verify horses exist
      const horsesBeforeDelete = await prisma.horse.findMany({
        where: { owner: ownerId },
      });
      expect(horsesBeforeDelete).toHaveLength(2);

      // Delete owner
      await request(app.getHttpServer())
        .delete(`/api/v1/owners/${ownerId}`)
        .set("x-user-role", UserRole.ADMIN)
        .expect(204);

      // Verify horses were deleted
      const horsesAfterDelete = await prisma.horse.findMany({
        where: { owner: ownerId },
      });
      expect(horsesAfterDelete).toHaveLength(0);
    });
  });
});
