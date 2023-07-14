import { ReceivedRequest } from "./deps.ts";
import { type Payload, payloadSchema, type Props } from "./schema.ts";

export { type Payload, payloadSchema, type Props };

const url = Deno.env.get("MAILTRAP_URL")!;
const apiToken = Deno.env.get("MAILTRAP_TOKEN")!;

if (!url) {
  throw new Error("MAILTRAP_URL env var is missing");
}

if (!apiToken) {
  throw new Error("MAILTRAP_TOKEN env var is missing");
}

export default async function mailtrap(
  req: ReceivedRequest<Payload>,
  props: Props,
) {
  // E.g 2023-05-25T06:53:05.240Z

  const now = new Date();
  const [date, preciseTime] = now.toISOString().split("T");
  const [time] = preciseTime.split(".");
  const fields = req.payload.fields.map((f) => ({
    label: f.id,
    value: "" + f.value,
  }));
  const metadata = [{ label: "Date", value: `${date} at ${time}` }];
  const href = getHref(req.payload);

  const text = renderText({ fields, metadata, href });
  const html = renderHtml({ fields, metadata, href });

  const body = {
    to: [{ email: props.to }],
    from: {
      email: "no-reply@assistant.bolik.net",
      name: "Bolik Assistant",
    },
    subject: "Bolik Form: " + props.subject,
    headers: {
      // Theoretically, we can accept a field type and then find the email field.
      // 'Reply-To': '',
    },
    category: req.payload.event,
    text,
    html,
  };

  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiToken}`,
    },
    body: JSON.stringify(body),
  };

  const res = await fetch(url, options);
  const resText = await res.text();
  const msg =
    `Mailtrap responded with status=${res.statusText} and body=${resText}`;
  if (!res.ok) {
    throw new Error(msg);
  }

  console.log(msg);
}

function getHref(payload: Payload): URL | undefined {
  try {
    return new URL(payload.url);
  } catch (_e) {
    return;
  }
}

function renderText({
  fields,
  metadata,
  href,
}: {
  fields: { label: string; value: string }[];
  metadata: { label: string; value: string }[];
  href?: URL;
}) {
  const fieldRows = fields.map((f) => `* ${f.label}: ${f.value}`);
  const metadataRows = metadata.map((m) => `* ${m.label}: ${m.value}`);
  const hrefLine = href
    ? `Someone submitted a form on ${href.host + href.pathname + href.search}.`
    : "Someone submitted a form.";

  return `Hi!

${hrefLine}

Fields:

${fieldRows.join("\n")}

Metadata:

${metadataRows.join("\n")}

Best wishes,
Bolik Assistant
`;
}

function renderHtml({
  fields,
  metadata,
  href,
}: {
  fields: { label: string; value: string }[];
  metadata: { label: string; value: string }[];
  href?: URL;
}) {
  const hrefLine = href
    ? `Someone submitted a form on <a href="${href}" style="text-decoration: underline; color: rgb(29 78 216);">
${href.host + href.pathname + href.search}</a>.`
    : "Someone submitted a form.";

  const fieldRows = fields.map((f) => (`
<tr style="border-top: 1px solid rgb(209 213 219);">
  <td style="padding: 4px; color: rgb(55 65 81);">${f.label}</td>
  <td style="padding: 4px; white-space: pre;">${f.value}</td>
</tr>`));

  const metadataRows = metadata.map((m) => (`
<li>
  <span style="font-weight: 500;">${m.label}:</span> ${m.value}
</li>
`));

  return `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
  </head>
  <body>
    <div>
      <p>
        Hi!
      </p>
      <p>
        ${hrefLine}
      </p>

      <table style="text-align: left; border-collapse: collapse; padding: 4px; margin: 8px 0;">
        <thead>
          <tr>
            <th style="padding: 4px;">Field</th>
            <th style="padding: 4px;">Value</th>
          </tr>
        </thead>
        <tbody style="vertical-align: top;">
          ${fieldRows.join("")}
        </tbody>
      </table>

      <p style="padding-top: 8px;">Extra information:</p>

      <ul style="margin: 2px 0 8px;">
        ${metadataRows.join("")}
      </ul>

      <p>
        Best wishes,
        <br />
        Bolik Assistant
      </p>
    </div>
  </body>
</html>
`;
}
