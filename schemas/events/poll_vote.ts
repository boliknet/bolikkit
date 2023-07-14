import type { FromSchema, JSONSchema } from "../deps.ts";

export const schema = {
  $id: "https://schemas.bolik.net/v0/events/poll_vote.json",
  type: "object",
  properties: {
    event: { "const": "poll_vote" },
    url: { type: "string" },
    referrer: { type: "string" },
    answers: {
      type: "array",
      items: { type: "string" },
    },
  },
  required: ["event", "answers"],
} as const satisfies JSONSchema;

export type PollVotePayload = FromSchema<typeof schema>;
