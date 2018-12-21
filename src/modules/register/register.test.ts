import { User } from "../../entity/User";
import {
  duplicateEmail,
  emailNotLongEnough,
  invalidEmail,
  passwordNotLongEnough
} from "./errorMessages";
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

describe("Register User", async () => {
  it("Check for duplicate email", async () => {
    const client = new TestClient(process.env.TEST_HOST as string);
    const response = await client.register(email, password);
    expect(response.data).toEqual({ register: null });
    const users = await User.find({ where: { email } });
    expect(users).toHaveLength(1);
    const user = users[0];
    expect(user.email).toEqual(email);
    expect(user.password).not.toEqual(password);

    const response2 = await client.register(email, password);

    expect(response2.data.register).toHaveLength(1);
    expect(response2.data.register[0]).toEqual({
      path: "email",
      message: duplicateEmail
    });
  });

  it("Check bad email", async () => {
    const client = new TestClient(process.env.TEST_HOST as string);
    const response3 = await client.register("b", password);

    expect(response3.data).toEqual({
      register: [
        {
          path: "email",
          message: emailNotLongEnough
        },
        {
          path: "email",
          message: invalidEmail
        }
      ]
    });
  });

  it("Check bad password", async () => {
    const client = new TestClient(process.env.TEST_HOST as string);
    const response4 = await client.register(email, "ad");

    expect(response4.data).toEqual({
      register: [
        {
          path: "password",
          message: passwordNotLongEnough
        }
      ]
    });
  });

  it("Check bad password and bad email", async () => {
    const client = new TestClient(process.env.TEST_HOST as string);
    const response5 = await client.register("sd", "ad");

    expect(response5.data).toEqual({
      register: [
        {
          path: "email",
          message: emailNotLongEnough
        },
        {
          path: "email",
          message: invalidEmail
        },
        {
          path: "password",
          message: passwordNotLongEnough
        }
      ]
    });
  });
});
