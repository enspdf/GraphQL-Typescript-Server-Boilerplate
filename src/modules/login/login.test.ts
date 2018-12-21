import { invalidLogin, confirmEmailError } from "./errorMessages";
import { User } from "../../entity/User";
import { createTypeormConn } from "../../utils/createTypeormConn";
import { Connection } from "typeorm";
import { TestClient } from "../../utils/TestClient";

const email = "tom@bob.com";
const password = "kajsdag";

let conn: Connection;

beforeAll(async () => {
  conn = await createTypeormConn();
});

afterAll(async () => {
  conn.close();
});

const loginExpectError = async (
  client: TestClient,
  e: string,
  p: string,
  errMsg: string
) => {
  const loginResponse = await client.login(e, p);

  expect(loginResponse.data).toEqual({
    login: [
      {
        path: "email",
        message: errMsg
      }
    ]
  });
};

describe("login", () => {
  test("email not found send back error", async () => {
    const client = new TestClient(process.env.TEST_HOST as string);
    await loginExpectError(client, "bob@bob.com", "whatever", invalidLogin);
  });

  test("email not confirmed", async () => {
    const client = new TestClient(process.env.TEST_HOST as string);
    await client.register(email, password);

    await loginExpectError(client, email, password, confirmEmailError);

    await User.update({ email }, { confirmed: true });

    await loginExpectError(client, email, "aslkdfjaksdljf", invalidLogin);

    const loginResponse = await client.login(email, password);

    expect(loginResponse.data).toEqual({ login: null });
  });
});
