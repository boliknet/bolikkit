import { Props } from "./schema.ts";
import { render } from "preact";
import { useState } from "preact/hooks";
import { type PollVotePayload } from "bkit/schemas/events/poll_vote.ts";

export function mountPoll(el: Node, props: Props) {
  render(<Poll {...props} />, el);
}

function Poll({ question, answers, freeText, href }: Props) {
  const initialValues = getVoted() ?? [];
  const [submitting, setSubmitting] = useState(false);
  const [submited, setSubmited] = useState(!!initialValues.length);
  const [error, setError] = useState(false);
  const [values, setValues] = useState(initialValues);

  const freeTextValue = values.find((v) => !answers.includes(v)) ?? "";

  async function onSubmit(e: Event) {
    e.preventDefault();
    if (submited) {
      return;
    }

    const answers = values;
    if (!answers.length) {
      return;
    }

    setError(false);
    setSubmitting(true);

    // Remove hash from the URL (#)
    const url = new URL(location.href);
    url.hash = "";

    const body: PollVotePayload = {
      event: "poll_vote",
      url: url.toString(),
      referrer: document.referrer,
      answers,
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
        setVoted(answers);
      } else {
        throw new Error(`Server responded with status=${res.statusText}`);
      }
    } catch (_e) {
      setError(true);
      setSubmitting(false);
    }
  }

  function onChange(e: Event, answer: string) {
    const target = e.target as HTMLInputElement;
    const copy = values.filter((v) => v != answer);
    if (target.checked) {
      copy.push(answer);
    }

    setValues(copy);
    setError(false);
  }

  function onFreeText(e: Event) {
    const target = e.target as HTMLInputElement;
    const value = target.value;

    // Remove old value
    const copy = values.filter((v) => v != freeTextValue);
    // Add new value
    if (value) {
      copy.push(value);
    }

    setValues(copy);
    setError(false);
  }

  return (
    <form
      part="form"
      onSubmit={onSubmit}
      class="dark:text-gray-100"
    >
      <span class="text-lg py-2">{question}</span>

      <ul class="ml-1 mb-2">
        {answers.map((a) => (
          <li key={a}>
            <label class="flex gap-2 items-center py-1">
              {submited
                ? (
                  values.includes(a)
                    ? <span class="i-tabler-check color-primary" />
                    : <span class="i-tabler-point color-gray-500" />
                )
                : (
                  <input
                    type="checkbox"
                    name={a}
                    disabled={submitting}
                    class="h-4 w-4"
                    onChange={(e) => onChange(e, a)}
                  />
                )}
              {a}
            </label>
          </li>
        ))}

        {!!freeText && (
          <li>
            <label class="flex gap-2 items-center py-1">
              {submited
                ? (
                  values.includes(freeTextValue)
                    ? <span class="i-tabler-check color-primary" />
                    : <span class="i-tabler-point color-gray-500" />
                )
                : (
                  <input
                    type="checkbox"
                    name="freeText"
                    disabled={submitting}
                    class="h-4 w-4"
                    checked={values.includes(freeTextValue)}
                  />
                )}

              <input
                type="text"
                class="px-1 dark:bg-gray-900 border-b-1"
                onInput={(e) => onFreeText(e)}
                placeholder={freeText}
                disabled={submitting || submited}
                value={freeTextValue}
              />
            </label>
          </li>
        )}
      </ul>

      <button
        type="submit"
        class={classNames(
          "px-4 py-2 text-white dark:text-gray-100 rounded-lg transition-colors",
          {
            "bg-primary enabled-hover-bg-primary/80": !error,
            "bg-red-600 enabled-hover-bg-red-500": error,
            "animate-shake-x": error,
            "invisible": submited,
          },
        )}
        disabled={submitting || submited || !values.length}
      >
        Vote
      </button>
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

const path = location.pathname + location.search;
const storageKey = `bk-poll-form-${path}`;

function getVoted(): string[] | null {
  let value: string | null;
  try {
    value = localStorage.getItem(storageKey);
  } catch (_e) {
    // Local storage might be disabled
    value = sessionStorage.getItem(storageKey);
  }

  if (value) {
    try {
      return JSON.parse(value);
    } catch (_e) {
      return null;
    }
  }

  return null;
}

function setVoted(answers: string[]) {
  const value = JSON.stringify(answers);
  try {
    localStorage.setItem(storageKey, value);
  } catch (_e) {
    // Local storage might be disabled
    sessionStorage.setItem(storageKey, value);
  }
}
