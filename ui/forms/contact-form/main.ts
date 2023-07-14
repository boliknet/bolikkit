/**
 * Create a Web Component.
 */
import { props } from "./props.ts";
import { mountForm } from "./ContactForm.tsx";
import { nodeName } from "./schema.ts";
import styles from "./uno.css.js";

class ContactFormComponent extends HTMLElement {
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
    const fieldsStr = this.getAttribute("fields");
    let fields = props.fields;
    if (fieldsStr) {
      // Fields is a JSON Data URL -->  data:,%7B%22items%22%3A%5B%5D%7D
      const data = fieldsStr.split(",")[1];
      fields = JSON.parse(decodeURIComponent(data));
    }

    mountForm(this.shadow, {
      title: this.getAttribute("title") ?? props.title,
      fields,
      submitText: this.getAttribute("submittext") ?? props.submitText,
      href: this.getAttribute("href") ?? props.href,
    });
  }

  static get observedAttributes() {
    return Object.keys(props).map((p) => p.toLowerCase());
  }
}

customElements.define(nodeName, ContactFormComponent);
