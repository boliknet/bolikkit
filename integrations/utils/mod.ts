/**
 * These are types and helper methods we should host publicly (versioned on deno.land/x/)
 */

import { Ajv, JSONSchema, ValidateFunction } from "./deps.ts";

export type ReceivedRequest<P> = {
  url: URL;
  headers: {
    "User-Agent": string;
    "X-Forwarded-For"?: string;
  };
  payload: P;
};

/**
 * Create a JSON schema validator function.
 */
export function createValidator(
  schema: JSONSchema,
  opts?: {
    ajv?: Ajv;
  },
): ValidateFunction<unknown> {
  const ajv = opts?.ajv ?? new Ajv();
  return ajv.compile(schema);
}

/**
 * A helper function to handler incoming request.
 *
 * It automatically validates incoming request against JSON schema and
 * rejects invalid ones.
 *
 * If your handler returns undefined then it will fallback to an empty status=200 response.
 */
export async function handleRequest<P>(
  req: Request,
  validate: ValidateFunction<unknown>,
  handler: (
    received: ReceivedRequest<P>,
  ) => Promise<Response | void> | Response | void,
): Promise<Response> {
  let payload: P;
  try {
    payload = await req.json();
  } catch (e) {
    console.error("Failed to read payload as JSON", e);
    const body = {
      error: "Invalid payload",
      cause: "Payload is not valid JSON",
    };

    return new Response(JSON.stringify(body), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  const valid = validate(payload);
  if (!valid) {
    console.error("Invalid payload=", payload, "errors=", validate.errors);
    const cause = validate.errors?.length
      ? validate.errors[0].toString()
      : "unknown";
    const body = {
      error: "Invalid payload",
      cause,
    };

    return new Response(JSON.stringify(body), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  const url = new URL(req.url);
  const received = {
    url,
    headers: {
      "User-Agent": req.headers.get("User-Agent") ?? "unknown",
      "X-Forwarded-For": req.headers.get("X-Forwarded-For") ?? undefined,
    },
    payload,
  };

  const res = await handler(received);
  if (res) {
    return res;
  }

  const body = {
    status: "ok",
  };
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
