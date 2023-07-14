import { Props } from "./schema.ts";
import { render } from "preact";
import { useState } from "preact/hooks";
import { type FormSubmitPayload } from "bkit_schemas/events/form_submit.ts";

export function mountForm(el: Node, props: Props) {
  render(<ContactForm {...props} />, el);
}

const inputClass = [
  "block w-full rounded-md",
  "py-1.5 px-2.5",
  "text-gray-900 @dark:text-gray-200 shadow-sm @dark:shadow-none",
  "ring-1 ring-inset ring-gray-300 @dark:ring-gray-500",
  "placeholder:text-gray-400",
  "focus:ring-2 focus:ring-inset focus:ring-primary focus:outline-none",
  // Idea from: https://www.bram.us/2021/01/28/form-validation-you-want-notfocusinvalid-not-invalid/
  // We display an error ring when field is not focused and placeholder is not showns (meaning there is a value).
  // For this to work we need a non-empty placeholder.
  "not-focus:not-placeholder-shown:invalid:ring-red-400",
  "@dark:bg-gray-900",
].join(" ");

function ContactForm({ title, fields, submitText, href }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [submited, setSubmited] = useState(false);
  const [error, setError] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});

  async function onSubmit(e: Event) {
    e.preventDefault();

    setError(false);
    setSubmitting(true);

    // Remove hash from the URL (#)
    const url = new URL(location.href);
    url.hash = "";

    const body: FormSubmitPayload = {
      event: "form_submit",
      url: url.toString(),
      fields: fields.map((f) => ({
        id: f.label,
        value: values[f.label] ?? "",
      })),
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

  function onInput(e: Event, id: string) {
    const target = e.target as HTMLInputElement;
    setValues({
      ...values,
      [id]: target.value,
    });
  }

  return (
    <form
      part="form"
      onSubmit={onSubmit}
      class="flex flex-col gap-2 max-w-2xl mx-auto"
    >
      {!!title && <span class="text-xl">{title}</span>}

      {fields.map((f) => (
        <div>
          <label class="flex flex-col gap-2">
            <span class="text-sm font-medium leading-6 text-gray-900 @dark:text-gray-200">
              {f.label}
            </span>
            {f.type == "textarea"
              ? (
                <textarea
                  name={f.label}
                  class={inputClass}
                  required
                  disabled={submitting}
                  placeholder=" "
                  onInput={(e) => onInput(e, f.label)}
                  value={values[f.label] ?? ""}
                />
              )
              : (
                <input
                  type={f.type ?? "text"}
                  class={inputClass}
                  name={f.label}
                  required
                  disabled={submitting}
                  placeholder=" "
                  onInput={(e) => onInput(e, f.label)}
                  value={values[f.label] ?? ""}
                />
              )}
          </label>
        </div>
      ))}

      <div class="pt-4 mt-2 border-t border-gray-200 flex gap-6 items-center">
        <button
          type="submit"
          class={classNames(
            "px-4 py-2 text-white rounded-lg transition-colors",
            {
              "bg-primary enabled:hover:bg-primary/80": !error,
              "bg-red-600 enabled:hover:bg-red-500": error,
              "animate-shake-x": error,
            },
          )}
          disabled={submitting}
        >
          {submitText}
        </button>

        {submited && (
          <div class="inline-flex items-center gap-2 text-green-600">
            <span class="w-24px h-24px i-tabler-check" />
            Thanks!
          </div>
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
