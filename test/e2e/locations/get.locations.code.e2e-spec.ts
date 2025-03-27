import { HttpServer, INestApplication } from "@nestjs/common";
import request from "supertest";
import { TestUtils } from "../../test-utils";

describe("/locations/:code (GET)", () => {
  let app: INestApplication;
  let server: HttpServer;

  const url = "/locations";

  beforeEach(async () => {
    app = await TestUtils.setUp();
    server = app.getHttpServer();
  });

  afterEach(async () => {
    await app.close();
    server.close();
  });

  it("fails when not found", async () => {
    await request(server).get(`${url}/-1`).expect(404);
  });

  // it("works", async () => {
  //   const res = await request(server).get(`${url}/1`).expect(200);

  //   expect(res.body).toEqual(TestUtils.locationStructure);
  // });
});
