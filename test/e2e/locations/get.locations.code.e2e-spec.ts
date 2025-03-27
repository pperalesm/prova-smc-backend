import { HttpServer, INestApplication } from "@nestjs/common";
import request from "supertest";
import { TestUtils } from "../../test-utils";
import { HttpService } from "@nestjs/axios";
import { AppModule } from "../../../src/app.module";
import { Test } from "@nestjs/testing";
import { of } from "rxjs";
import { AxiosResponse } from "axios";
import { locations } from "./locations";
import { variables } from "./variables";
import { LOCATIONS_API_URL } from "../../../src/modules/location/location.constants";

describe("/locations/:code (GET)", () => {
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

    jest.spyOn(httpService, "get").mockImplementation((apiUrl: string) => {
      if (apiUrl === LOCATIONS_API_URL) {
        return of({
          data: locations,
        } as AxiosResponse);
      }

      return of({
        data: variables,
      } as AxiosResponse);
    });
  });

  afterEach(async () => {
    await app.close();
    server.close();
  });

  it("fails when not found", async () => {
    await request(server).get(`${url}/-1`).expect(404);
  });

  it("works", async () => {
    const res = await request(server).get(`${url}/250019`).expect(200);

    expect(res.body).toEqual(TestUtils.locationStructure);

    expect(res.body.dailyVariables).toBeArrayOfSize(8);

    for (let i = 0; i < res.body.dailyVariables.length; i++) {
      expect(res.body.dailyVariables[i]).toEqual(
        TestUtils.dailyVariableStructure,
      );

      if (i === 0) {
        expect(res.body.dailyVariables[i].maxTemperature).toBe(16.269);
        expect(res.body.dailyVariables[i].minTemperature).toBe(16.269);
        expect(res.body.dailyVariables[i].precipitationProbability).toBe(
          16.269,
        );
      } else {
        expect(res.body.dailyVariables[i].maxTemperature).toBeUndefined();
        expect(res.body.dailyVariables[i].minTemperature).toBeUndefined();
        expect(
          res.body.dailyVariables[i].precipitationProbability,
        ).toBeUndefined();
      }
    }
  });
});
