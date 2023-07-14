import type { FromSchema, JSONSchema } from "../deps.ts";

export const schema = {
  $id: "https://schemas.bolik.net/v0/events/newsletter_subscribe.json",
  type: "object",
  properties: {
    event: { "const": "newsletter_subscribe" },
    email: { type: "string" },
  },
  required: ["event", "email"],
} as const satisfies JSONSchema;

export type NewsletterSubscribePayload = FromSchema<typeof schema>;
