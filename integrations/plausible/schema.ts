import {
  buttonClickSchema,
  FromSchema,
  JSONSchema,
  pollVoteSchema,
} from "./deps.ts";

export const propsSchema = {
  type: "object",
  properties: {
    eventName: {
      type: "string",
      minLength: 1,
      description: "Event name that will be send to Plausible",
    },
    domain: {
      type: "string",
      minLength: 1,
      description: "Your website's domain name as configured in Plausible",
    },
  },
  required: ["eventName", "domain"],
} as const satisfies JSONSchema;

export type Props = FromSchema<typeof propsSchema>;

export const defaultProps: Props = {
  eventName: "button-click",
  domain: "",
};

export const acceptSchemas = [
  buttonClickSchema,
  pollVoteSchema,
];

export const payloadSchema = {
  anyOf: [
    { $ref: buttonClickSchema.$id },
    { $ref: pollVoteSchema.$id },
  ],
} as const satisfies JSONSchema;

export type Payload = FromSchema<
  typeof payloadSchema,
  { references: [typeof buttonClickSchema, typeof pollVoteSchema] }
>;
