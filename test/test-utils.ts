import { ValidationPipe } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import * as matchers from "jest-extended";
import { AppModule } from "../src/app.module";
expect.extend(matchers);

export class TestUtils {
  static get locationStructure() {
    return {
      role: expect.any(String),
      nickname: expect.toBeOneOf([expect.any(String), null]),
      avatarUri: expect.any(String),
      reputation: expect.any(Number),
      popularity: expect.any(Number),
    };
  }

  static get shortLocationStructure() {
    return {
      code: expect.any(String),
      name: expect.any(String),
    };
  }

  static async setUp() {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

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
