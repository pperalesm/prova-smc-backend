import { ValidationPipe } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import * as matchers from "jest-extended";
import { AppModule } from "../src/app.module";
expect.extend(matchers);

export class TestUtils {
  static get dailyVariableStructure() {
    return {
      maxTemperature: expect.toBeOneOf([expect.any(Number), undefined]),
      minTemperature: expect.toBeOneOf([expect.any(Number), undefined]),
      precipitationProbability: expect.toBeOneOf([
        expect.any(Number),
        undefined,
      ]),
      dateString: expect.any(String),
    };
  }

  static get locationStructure() {
    return {
      code: expect.any(String),
      name: expect.any(String),
      dailyVariables: expect.any(Array),
    };
  }

  static get shortLocationStructure() {
    return {
      code: expect.any(String),
      name: expect.any(String),
    };
  }

  static async setUp(moduleFixture?: TestingModule) {
    if (!moduleFixture) {
      moduleFixture = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();
    }

    const app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );

    await app.init();

    return app;
  }
}
