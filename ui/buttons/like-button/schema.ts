import type { FromSchema, JSONSchema } from "json-schema-to-ts";
import { schema as producesSchema } from "bkit_schemas/events/button_click.ts";
import { schema as hrefSchema } from "bkit_schemas/props/href.ts";

export const propsSchema = {
  $id: "https://schemas.bolik.net/v0/ui/like-button.json",
  type: "object",
  properties: {
    text: { type: "string" },
    href: { $ref: hrefSchema.$id },
  },
  required: ["text", "href"],
} as const satisfies JSONSchema;

export type Props = FromSchema<
  typeof propsSchema,
  { references: [typeof hrefSchema] }
>;

export const defaultProps: Props = {
  text: "Like",
  href: "/bolik/button_click",
};

export { producesSchema };
export const nodeName = "bk-like-button";
