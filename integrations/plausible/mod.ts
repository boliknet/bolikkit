import { ReceivedRequest } from "./deps.ts";
import { type Payload, payloadSchema, type Props } from "./schema.ts";

export { type Payload, payloadSchema, type Props };

export default async function plausible(
  req: ReceivedRequest<Payload>,
  props: Props,
) {
  if (req.payload.event == "poll_vote") {
    for (const answer of req.payload.answers) {
      await sendEvent(req, props, {
        answer,
      });
    }
  } else {
    await sendEvent(req, props);
  }
}

async function sendEvent(
  req: ReceivedRequest<Payload>,
  props: Props,
  plausibleProps: Record<string, string> = {},
) {
  const body = {
    name: props.eventName,
    domain: props.domain,
    url: req.payload.url,
    referrer: req.payload.referrer,
    props: plausibleProps,
  };

  const res = await fetch("https://plausible.io/api/event", {
    method: "POST",
    headers: {
      ...req.headers,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  const msg =
    `Plausible responded with status=${res.statusText} and body=${text}`;
  if (!res.ok) {
    throw new Error(msg);
  }

  console.log(msg);
}
