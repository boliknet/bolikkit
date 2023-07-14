import type { FromSchema, JSONSchema } from "../deps.ts";

export const schema = {
  $id: "https://schemas.bolik.net/v0/events/form_submit.json",
  type: "object",
  properties: {
    event: { "const": "form_submit" },
    url: { type: "string" },
    fields: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          value: {
            anyOf: [{ type: "string" }, { type: "number" }],
          },
        },
        required: ["id", "value"],
      },
      minItems: 1,
    },
  },
  required: ["event", "url", "fields"],
} as const satisfies JSONSchema;

export type FormSubmitPayload = FromSchema<typeof schema>;
