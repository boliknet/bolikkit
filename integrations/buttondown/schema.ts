import { FromSchema, JSONSchema, newsletterSubscribeSchema } from "./deps.ts";

export const propsSchema = {
  type: "object",
  properties: {
    username: {
      type: "string",
      minLength: 1,
      description:
        "Your Buttondown username (https://buttondown.com/<username>)",
    },
  },
  required: ["username"],
} as const satisfies JSONSchema;

export type Props = FromSchema<typeof propsSchema>;

export const defaultProps: Props = {
  eventName: "newsletter-subscribe",
  username: "",
};

export const acceptSchemas = [
  newsletterSubscribeSchema,
];

export const payloadSchema = {
  anyOf: [
    { $ref: newsletterSubscribeSchema.$id },
  ],
} as const satisfies JSONSchema;

export type Payload = FromSchema<
  typeof payloadSchema,
  { references: [typeof newsletterSubscribeSchema] }
>;
