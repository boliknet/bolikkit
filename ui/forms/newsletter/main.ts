/**
 * Create a Web Component.
 */
import { props } from "./props.ts";
import { mountForm } from "./NewsletterForm.tsx";
import { nodeName } from "./schema.ts";
import styles from "./uno.css.js";

class NewsletterFormComponent extends HTMLElement {
  private shadow: ShadowRoot;

  constructor() {
    super();

    this.shadow = this.attachShadow({ mode: "open" });
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(styles);
    this.shadow.adoptedStyleSheets = [sheet];

    mountForm(this.shadow, props);
  }

  attributeChangedCallback() {
    this.render();
  }

  render() {
    mountForm(this.shadow, {
      title: this.getAttribute("title") ?? props.title,
      submitText: this.getAttribute("submittext") ?? props.submitText,
      href: this.getAttribute("href") ?? props.href,
    });
  }

  static get observedAttributes() {
    return Object.keys(props).map((p) => p.toLowerCase());
  }
}

customElements.define(nodeName, NewsletterFormComponent);
