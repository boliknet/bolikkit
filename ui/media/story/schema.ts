import type { FromSchema, JSONSchema } from "json-schema-to-ts";
import { schema as hrefSchema } from "bkit_schemas/props/href.ts";

// Reference: https://www.learnjsonschema.com/
export const propsSchema = {
  $id: "https://schemas.bolik.net/v0/ui/story-media.json",
  type: "object",
  properties: {
    screens: {
      type: "array",
      items: {
        type: "object",
        properties: {
          href: { type: "string" },
          type: {
            type: "string",
            enum: ["image", "video"],
          },
        },
        required: ["href"],
      },
      minItems: 1,
    },
  },
  required: ["screens"],
} as const satisfies JSONSchema;

export type Props = FromSchema<
  typeof propsSchema,
  { references: [typeof hrefSchema] }
>;

export const defaultProps: Props = {
  screens: [{
    href:
      "https://images.unsplash.com/photo-1686040068882-1ecdf4e25549?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=987&q=80",
  }, {
    href:
      "https://images.unsplash.com/photo-1593293875782-a4a183bb00ff?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=987&q=80",
  }, {
    href:
      "https://images.unsplash.com/photo-1677177894552-3583b6e31004?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=987&q=80",
  }],
};

export const nodeName = "bk-story-media";
