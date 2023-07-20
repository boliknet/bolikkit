/**
 * Create a Web Component.
 */
import { LikeButton } from "./LikeButton.ts";
import { props } from "./props.ts";
import { nodeName } from "./schema.ts";

import styles from "./uno.css.js";

class LikeButtonComponent extends HTMLElement {
  private shadow: ShadowRoot;

  constructor() {
    super();

    this.shadow = this.attachShadow({ mode: "open" });

    // TODO: this constructor and replaceSync are supported on Safari only starting from March 2023
    // const sheet = new CSSStyleSheet();
    // sheet.replaceSync(styles);
    // this.shadow.adoptedStyleSheets = [sheet];

    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  render() {
    LikeButton(this.shadow, {
      text: this.getAttribute("text") ?? props.text,
      href: this.getAttribute("href") ?? props.href,
    });

    const style = document.createElement("style");
    style.textContent = styles;
    this.shadow.appendChild(style);
  }

  static get observedAttributes() {
    return Object.keys(props);
  }
}

customElements.define(nodeName, LikeButtonComponent);
