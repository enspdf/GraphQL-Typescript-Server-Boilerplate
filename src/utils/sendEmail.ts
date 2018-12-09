import * as SparkPost from "sparkpost";
const sparkPostApiKey = process.env.SPARKPOST_API_KEY || "XXX";
const client = new SparkPost(sparkPostApiKey);

export const sendEmail = async (recipient: string, url: string) => {
  const response = await client.transmissions.send({
    options: {
      sandbox: true
    },
    content: {
      from: "testing@sparkpostbox.com",
      subject: "Confirm Email",
      html: `<html>
            <body>
            <p>Test SparkPost</p>
            <a href="${url}">Confirm Email</a>
            </body>
            </html>`
    },
    recipients: [{ address: recipient }]
  });
  console.log(response);
};
