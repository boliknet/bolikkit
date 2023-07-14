import { Props } from "./schema.ts";
import { IconHeart } from "@tabler/icons";
import { type ButtonClickPayload } from "bkit_schemas/events/button_click.ts";

export function LikeButton(el: ShadowRoot, props: Props) {
  const btn = document.createElement("button");
  btn.setAttribute("type", "button");
  btn.setAttribute("part", "button");
  btn.setAttribute(
    "class",
    "group rounded-md bg-white @dark:bg-gray-200 px-3.5 py-1.5 text-sm font-semibold" +
      " text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 @dark:ring-gray-600" +
      " enabled:hover:bg-gray-50 flex gap-2 flex-items-center" +
      " transition-colors enabled:cursor-pointer",
  );

  const icon = document.createElement("span");
  // @ts-ignore Tabler icons have wrong types. IconHeart is a function.
  icon.innerHTML = IconHeart();
  icon.firstElementChild!.setAttribute(
    "class",
    "w-1.2em h-1.2em stroke-rose-400 group-enabled:group-hover:stroke-rose-500" +
      " fill-transparent transition-colors" +
      " group-enabled:group-hover:animate-heart-beat",
  );

  const text = document.createElement("span");
  text.innerText = props.text;

  if (wasClicked()) {
    markLiked(btn, icon);
  }

  btn.appendChild(icon);
  btn.appendChild(text);
  el.replaceChildren(btn);

  btn.addEventListener("click", async () => {
    btn.disabled = true;

    // Remove hash from the URL (#)
    const url = new URL(location.href);
    url.hash = "";

    const body: ButtonClickPayload = {
      event: "button_click",
      url: url.toString(),
      referrer: document.referrer,
    };
    const res = await fetch(props.href, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      setClicked();
      markLiked(btn, icon);
    } else {
      btn.disabled = false;
    }
  });
}

function markLiked(btn: HTMLButtonElement, icon: HTMLSpanElement) {
  btn.disabled = true;
  icon.firstElementChild!.classList.remove("fill-transparent");
  icon.firstElementChild!.classList.add("fill-rose-400");
}

const path = location.pathname + location.search;
const storageKey = `bk-like-button-${path}`;

function wasClicked() {
  try {
    return localStorage.getItem(storageKey) == "true";
  } catch (_e) {
    // Local storage might be disabled
    return sessionStorage.getItem(storageKey) == "true";
  }
}

function setClicked() {
  try {
    localStorage.setItem(storageKey, "true");
  } catch (_e) {
    // Local storage might be disabled
    sessionStorage.setItem(storageKey, "true");
  }
}
