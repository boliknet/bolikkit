import type { FromSchema, JSONSchema } from "json-schema-to-ts";
import { schema as producesSchema } from "bkit_schemas/events/form_submit.ts";
import { schema as hrefSchema } from "bkit_schemas/props/href.ts";

// Reference: https://www.learnjsonschema.com/
export const propsSchema = {
  $id: "https://schemas.bolik.net/v0/ui/contact-form.json",
  type: "object",
  properties: {
    title: { type: "string" },
    fields: {
      type: "array",
      items: {
        type: "object",
        properties: {
          label: { type: "string" },
          type: {
            type: "string",
            enum: ["text", "email", "textarea"],
          },
        },
        required: ["label"],
      },
      minItems: 1,
    },
    submitText: { type: "string" },
    href: { $ref: hrefSchema.$id },
  },
  required: ["fields", "submitText", "href"],
} as const satisfies JSONSchema;

export type Props = FromSchema<
  typeof propsSchema,
  { references: [typeof hrefSchema] }
>;

export const defaultProps: Props = {
  title: "Contact us",
  fields: [{
    label: "Name",
  }, {
    label: "Email",
    type: "email",
  }, {
    label: "Message",
    type: "textarea",
  }],
  submitText: "Submit",
  href: "/bolik/form_submit",
};

export { producesSchema };
export const nodeName = "bk-contact-form";
