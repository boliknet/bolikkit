import plausible, { type Payload } from "./mod.ts";
import { assertEquals } from "https://deno.land/std@0.186.0/testing/asserts.ts";

Deno.test("Send button_blick event", async () => {
  const mockedCalls = mockFetch({
    "https://plausible.io/api/event": {
      status: 202,
      body: "{}",
    },
  });
  const payload: Payload = {
    event: "button_click",
    url: "http://localhost/",
    referrer: "",
  };

  await plausible({
    url: new URL("http://bolik.localhost/"),
    headers: {
      "User-Agent": "firefox/105",
    },
    payload,
  }, {
    eventName: "test-click",
    domain: "example.com",
  });

  assertEquals(mockedCalls.length, 1);
});

Deno.test("Send poll_vote event", async () => {
  const mockedCalls = mockFetch({
    "https://plausible.io/api/event": {
      status: 202,
      body: "{}",
    },
  });
  const payload: Payload = {
    event: "poll_vote",
    answers: ["Burget", "Pizza"],
  };

  await plausible({
    url: new URL("http://bolik.localhost/"),
    headers: {
      "User-Agent": "firefox/105",
    },
    payload,
  }, {
    eventName: "test-vote",
    domain: "example.com",
  });

  assertEquals(mockedCalls.length, 2);
});

type FetchCall = {
  url: string;
  payload?: string;
};

function mockFetch(
  mapping: Record<string, { status: number; body?: string }>,
): FetchCall[] {
  const calls: FetchCall[] = [];

  globalThis.fetch = function (
    input: URL | Request | string,
    init?: RequestInit,
  ): Promise<Response> {
    if (input instanceof URL || typeof input == "string") {
      const override = mapping[input.toString()];
      if (override) {
        calls.push({
          url: input.toString(),
          payload: init?.body?.toString(),
        });

        return Promise.resolve(
          new Response(override.body, {
            status: override.status,
            statusText: override.status + "",
          }),
        );
      }
    }

    throw new Error("Request not mocked url=" + input);
  };

  return calls;
}
