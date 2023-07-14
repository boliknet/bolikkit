import type { FromSchema, JSONSchema } from "json-schema-to-ts";
import { schema as producesSchema } from "bkit_schemas/events/newsletter_subscribe.ts";
import { schema as hrefSchema } from "bkit_schemas/props/href.ts";

// Reference: https://www.learnjsonschema.com/
export const propsSchema = {
  $id: "https://schemas.bolik.net/v0/ui/newsletter-form.json",
  type: "object",
  properties: {
    title: { type: "string" },
    submitText: { type: "string" },
    href: { $ref: hrefSchema.$id },
  },
  required: ["submitText", "href"],
} as const satisfies JSONSchema;

export type Props = FromSchema<
  typeof propsSchema,
  { references: [typeof hrefSchema] }
>;

export const defaultProps: Props = {
  title: "Subscribe to our newsletter.",
  submitText: "Subscribe",
  href: "/bolik/newsletter_submit",
};

export { producesSchema };
export const nodeName = "bk-newsletter-form";
