import { HttpServer, INestApplication } from "@nestjs/common";
import request from "supertest";
import { TestUtils } from "../../test-utils";

describe("/locations (GET)", () => {
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

  it("works", async () => {
    const res = await request(server).get(url).expect(200);

    expect(res.body.data).toBeArrayOfSize(10);

    for (const location of res.body.data) {
      expect(location).toEqual(TestUtils.shortLocationStructure);
    }
  });

  it("works with name filter", async () => {
    const query = `name=AbO`;

    const res = await request(server).get(`${url}?${query}`).expect(200);

    expect(res.body.data).toBeArrayOfSize(2);

    for (const location of res.body.data) {
      expect(location).toEqual(TestUtils.shortLocationStructure);
    }
  });

  it("works with pagination", async () => {
    const query = `take=20`;

    const res = await request(server).get(`${url}?${query}`).expect(200);

    expect(res.body.data).toBeArrayOfSize(20);

    for (const location of res.body.data) {
      expect(location).toEqual(TestUtils.shortLocationStructure);
    }

    const query2 = `take=5&page=4`;

    const res2 = await request(server).get(`${url}?${query2}`).expect(200);

    expect(res2.body.data).toBeArrayOfSize(5);

    for (const location of res2.body.data) {
      expect(location).toEqual(TestUtils.shortLocationStructure);
    }

    expect(res.body.data[19]).toEqual(res2.body.data[4]);
  });
});
