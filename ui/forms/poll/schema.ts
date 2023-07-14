import type { FromSchema, JSONSchema } from "json-schema-to-ts";
import { schema as producesSchema } from "bkit_schemas/events/poll_vote.ts";
import { schema as hrefSchema } from "bkit_schemas/props/href.ts";

export const propsSchema = {
  $id: "https://schemas.bolik.net/v0/ui/poll-form.json",
  type: "object",
  properties: {
    question: { type: "string" },
    answers: {
      type: "array",
      items: { type: "string" },
      minItems: 1,
    },
    freeText: {
      type: "string",
      description: "Free text answer label (leave empty if not needed)",
    },
    href: { $ref: hrefSchema.$id },
  },
  required: ["question", "answers", "href"],
} as const satisfies JSONSchema;

export type Props = FromSchema<
  typeof propsSchema,
  { references: [typeof hrefSchema] }
>;

export const defaultProps: Props = {
  question: "What would you like to eat?",
  answers: ["Burger", "Pizza"],
  freeText: "",
  href: "/bolik/poll",
};

export { producesSchema };
export const nodeName = "bk-poll-form";
