import { Test, TestingModule } from "@nestjs/testing";
import { test } from "vitest";

import { AppCommandBus, AppModule, AppQueryBus, UserService } from "./test-app.js";

test.describe(`DispatchableModule`, () => {
  let app: TestingModule;

  test.beforeAll(async () => {
    app = await Test.createTestingModule({ imports: [AppModule] }).compile();
    await app.init();
  });

  test(`dispatchables are available and registered`, async ({ expect }) => {
    const users = app.get(UserService);

    const user = await users.createUser({ name: `John1` });
    await users.renameUser({ id: user.id, name: `John2` });

    const detailedUser = await users.detailsUser({ id: user.id });
    expect(detailedUser).toEqual({ id: expect.any(String), name: `John2` });
  });

  test(`dispatching is bound to known dispatchables`, async ({ expect }) => {
    const commandBus = app.get(AppCommandBus);
    expect(Object.keys(commandBus.dispatch)).toEqual(["CreateUser", "RenameUser"]);

    const queryBus = app.get(AppQueryBus);
    expect(Object.keys(queryBus.dispatch)).toEqual(["__DANGER_NOT_HANDLED", "DetailsUser"]);
  });

  test(`dispatching not handled dispatchable throws`, async ({ expect }) => {
    const queryBus = app.get(AppQueryBus);
    await expect(() => queryBus.dispatch.__DANGER_NOT_HANDLED({ id: "" })).rejects.toThrow(
      "no handler defined for userQueries/__DANGER_NOT_HANDLED",
    );
  });
});
