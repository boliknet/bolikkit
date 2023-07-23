import { Props } from "./schema.ts";
import { render } from "preact";
import { useState } from "preact/hooks";
import { type NewsletterSubscribePayload } from "bkit/schemas/events/newsletter_subscribe.ts";

export function mountForm(el: Node, props: Props) {
  render(<NewsletterForm {...props} />, el);
}

const inputClass = [
  "appearance-none block w-full rounded-md",
  "py-1.5 px-2.5",
  "text-gray-900 dark:text-gray-200 shadow-sm dark:shadow-none",
  "ring-1 ring-inset ring-gray-300 dark:ring-gray-500",
  "placeholder:text-gray-400",
  "focus:ring-2 focus:ring-inset !focus:ring-primary focus:outline-none",
  "disabled:bg-gray-100 dark:bg-gray-900 dark:disabled:bg-gray-900",
].join(" ");

function NewsletterForm({ title, submitText, href }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [submited, setSubmited] = useState(false);
  const [error, setError] = useState(false);
  const [email, setEmail] = useState("");

  async function onSubmit(e: Event) {
    e.preventDefault();

    setError(false);
    setSubmitting(true);

    const body: NewsletterSubscribePayload = {
      event: "newsletter_subscribe",
      email,
    };

    try {
      const res = await fetch(href, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setSubmited(true);
      } else {
        throw new Error(`Server responded with status=${res.statusText}`);
      }
    } catch (_e) {
      setError(true);
      setSubmitting(false);
    }
  }

  function onInput(e: Event) {
    const target = e.target as HTMLInputElement;
    setEmail(target.value);
  }

  return (
    <form
      part="form"
      onSubmit={onSubmit}
      class="flex flex-col gap-2 max-w-2xl mx-auto"
    >
      {!!title && <span class="text-xl dark:text-gray-200">{title}</span>}

      <div class="flex gap-4">
        <input
          type="email"
          class={`flex-grow ${inputClass}`}
          name="email"
          required
          disabled={submitting}
          placeholder="Enter your email"
          onInput={onInput}
          value={email}
        />

        {submited
          ? (
            <div class="inline-flex items-center gap-2 text-green-600">
              <span class="w-24px h-24px i-tabler-check" />
              Subscribed!
            </div>
          )
          : (
            <button
              type="submit"
              class={classNames(
                "shrink-0 px-4 py-2 text-white rounded-lg transition-colors",
                {
                  "bg-primary hover:bg-primary/80": !error,
                  "bg-red-600 hover:bg-red-500": error,
                  "animate-shake-x": error,
                },
              )}
              disabled={submitting}
            >
              {submitText}
            </button>
          )}
      </div>
    </form>
  );
}

function classNames(names: string, optional: Record<string, boolean>): string {
  const res = names;
  const extra = Object.entries(optional)
    .filter(([_key, value]) => value)
    .map(([key, _v]) => key)
    .join(" ");
  return res + " " + extra;
}
