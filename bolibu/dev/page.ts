/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference lib="dom.asynciterable" />

/**
 * Helper script loaded in the browser by local development server
 */

const updates = new EventSource("/_dev/updates");

updates.onmessage = (e) => {
  const data = JSON.parse(e.data);

  switch (data.event) {
    case "modified":
      console.log("UI component was modified, refreshing the page");
      window.location.reload();
      return;
  }
};
