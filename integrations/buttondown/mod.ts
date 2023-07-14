import { ReceivedRequest } from "./deps.ts";
import { type Payload, payloadSchema, type Props } from "./schema.ts";

export { type Payload, payloadSchema, type Props };

export default async function plausible(
  req: ReceivedRequest<Payload>,
  props: Props,
) {
  const data = new URLSearchParams();
  data.append("email", req.payload.email);

  const res = await fetch(
    `https://buttondown.email/api/emails/embed-subscribe/${props.username}`,
    {
      method: "POST",
      headers: {
        ...req.headers,
      },
      body: data,
    },
  );
  const text = await res.text();
  const msg =
    `Buttondown responded with status=${res.statusText} and body=${text}`;
  if (!res.ok) {
    throw new Error(msg);
  }

  console.log(msg);
}
