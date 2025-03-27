import { HttpServer, INestApplication } from "@nestjs/common";
import request from "supertest";
import { TestUtils } from "../../test-utils";
import { Test } from "@nestjs/testing";
import { HttpService } from "@nestjs/axios";
import { AppModule } from "../../../src/app.module";
import { of } from "rxjs";
import { AxiosResponse } from "axios";
import { locations } from "./locations";

describe("/locations (GET)", () => {
  let app: INestApplication;
  let server: HttpServer;

  const url = "/locations";

  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
      providers: [
        {
          provide: HttpService,
          useFactory: () => ({
            get: jest.fn(),
          }),
        },
      ],
    }).compile();

    app = await TestUtils.setUp(moduleFixture);
    server = app.getHttpServer();

    const httpService = moduleFixture.get(HttpService);

    jest.spyOn(httpService, "get").mockReturnValue(
      of({
        data: locations,
      } as AxiosResponse),
    );
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
