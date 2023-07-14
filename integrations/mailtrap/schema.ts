import { formSubmitSchema, FromSchema, JSONSchema } from "./deps.ts";

export const propsSchema = {
  type: "object",
  properties: {
    to: {
      type: "string",
      description: "Email address to send the form to",
    },
    subject: {
      type: "string",
      description: "Email subject",
    },
  },
  required: ["to", "subject"],
} as const satisfies JSONSchema;

export type Props = FromSchema<typeof propsSchema>;

export const defaultProps: Props = {
  to: "",
  subject: "New contact request",
};

export const acceptSchemas = [
  formSubmitSchema,
];

export const payloadSchema = {
  anyOf: [
    { $ref: formSubmitSchema.$id },
  ],
} as const satisfies JSONSchema;

export type Payload = FromSchema<
  typeof payloadSchema,
  { references: [typeof formSubmitSchema] }
>;
