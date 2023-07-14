import { Props } from "./schema.ts";
import { render } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";

export function mount(el: Node, props: Props) {
  render(<Story {...props} />, el);
}

const animationStyles = `
@keyframes BkStoryLinearGradient {
  0% {
    background-position: 100%;
  }

  100% {
    background-position: 0%;
  }
}
`;

const secPerScreen = 10;

function Story({ screens }: Props) {
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(true);
  const timer = useRef<number | undefined>(undefined);

  function onClick() {
    // Since this function is run from setTimeout it might not have the knowledge
    // of the latest `current` value. Hence we set next value inside a callback.
    setCurrent((prev) => {
      const next = prev + 1;
      if (next < screens.length) {
        return next;
      } else {
        return 0;
      }
    });

    startTimer();
  }

  function onSelect(index: number) {
    setCurrent(index);
    startTimer();
  }

  function onPlayToggle() {
    const next = !playing;
    setPlaying(next);

    if (next) {
      startTimer();
    } else {
      clearTimeout(timer.current);
    }
  }

  function startTimer() {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      onClick();
    }, secPerScreen * 1000);
  }

  useEffect(() => {
    startTimer();
  }, []);

  return (
    <section part="story" class="relative max-h-60 aspect-video">
      <style dangerouslySetInnerHTML={{ __html: animationStyles }} />
      <div class="absolute top-0 left-0 right-0 rounded-t-lg bg-gradient-to-b from-gray-700/60 to-gray-700/0 px-4">
        <div class="flex gap-1 mt-0">
          {screens.map((_, index) => (
            <div
              class="flex-grow pt-4 pb-2 cursor-pointer"
              onClick={() => onSelect(index)}
            >
              <div
                class={classNames("rounded-lg h-1", {
                  "bg-white": index < current,
                  "bg-light/50": index > current ||
                    (!playing && (index == current)),
                })}
                style={{
                  backgroundSize: "200%",
                  backgroundImage: playing && (index == current)
                    ? "linear-gradient(to right, #fff 50%, rgba(246, 246, 246, 0.5) 50%)"
                    : "",
                  animation: playing && (index == current)
                    ? `BkStoryLinearGradient ${secPerScreen}s linear`
                    : "",
                }}
              />
            </div>
          ))}
        </div>

        <div class="flex pt-2 justify-end pb-4">
          <button type="button" onClick={onPlayToggle}>
            <span
              class={classNames("block w-24px h-24px bg-white shadow", {
                "i-tabler-player-play-filled": !playing,
                "i-tabler-player-pause-filled": playing,
              })}
            />
          </button>
        </div>
      </div>

      <div onClick={onClick}>
        <img class="rounded-lg object-contain" src={screens[current].href} />
      </div>
    </section>
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
