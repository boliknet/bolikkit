/**
 * Create a Web Component.
 */
import { props } from "./props.ts";
import { mountForm } from "./NewsletterForm.tsx";
import { nodeName } from "./schema.ts";
import styles from "./uno.css.js";
import { WebComponent } from "../../common/WebComponent.tsx";

class NewsletterFormComponent extends WebComponent {
  constructor() {
    super(styles);
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
