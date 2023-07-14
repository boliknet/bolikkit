import type { FromSchema, JSONSchema } from "../deps.ts";

export const schema = {
  $id: "https://schemas.bolik.net/v0/events/button_click.json",
  type: "object",
  properties: {
    event: { "const": "button_click" },
    url: { type: "string" },
    referrer: { type: "string" },
  },
  required: ["event", "url", "referrer"],
} as const satisfies JSONSchema;

export type ButtonClickPayload = FromSchema<typeof schema>;
