import type { JSONSchema } from "../deps.ts";

export const schema = {
  $id: "https://schemas.bolik.net/v0/props/href.json",
  type: "string",
  description: "Specify URL where component will submit the events",
} as const satisfies JSONSchema;
