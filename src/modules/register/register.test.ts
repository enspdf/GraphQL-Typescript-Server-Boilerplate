import { request } from "graphql-request";
import { startServer } from "../../startServer";
import { AddressInfo } from "net";
import { User } from "../../entity/User";
import {
  duplicateEmail,
  emailNotLongEnough,
  invalidEmail,
  passwordNotLongEnough
} from "./errorMessages";

let getHost = () => "";

beforeAll(async () => {
  const app = await startServer();
  const { port } = app.address() as AddressInfo;
  getHost = () => `http://127.0.0.1:${port}`;
});

const email = "tom@bob.com";
const password = "kajsdag";

const mutation = (em: string, pw: string) => `
    mutation {
        register(email: "${em}", password: "${pw}") {
          path
          message
        }
    }
`;

test("Register User", async () => {
  // Make sure we can register a user
  const response = await request(getHost(), mutation(email, password));
  expect(response).toEqual({ register: null });
  const users = await User.find({ where: { email } });
  expect(users).toHaveLength(1);
  const user = users[0];
  expect(user.email).toEqual(email);
  expect(user.password).not.toEqual(password);

  // Test for duplicate emails
  const response2: any = await request(getHost(), mutation(email, password));
  expect(response2.register).toHaveLength(1);
  expect(response2.register[0]).toEqual({
    path: "email",
    message: duplicateEmail
  });

  // Catch bad email
  const response3: any = await request(getHost(), mutation("b", password));
  expect(response3).toEqual({
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

  // Catch bas password
  const response4: any = await request(getHost(), mutation(email, "ad"));
  expect(response4).toEqual({
    register: [
      {
        path: "password",
        message: passwordNotLongEnough
      }
    ]
  });

  // Catch bad password and bad email
  const response5: any = await request(getHost(), mutation("sd", "ad"));
  expect(response5).toEqual({
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
