/**
 * Create a Web Component.
 */
import { mountPoll } from "./Poll.tsx";
import { props } from "./props.ts";
import { nodeName } from "./schema.ts";
import { WebComponent } from "../../common/WebComponent.tsx";

import styles from "./uno.css.js";

class PollComponent extends WebComponent {
  constructor() {
    super(styles);
  }

  render() {
    const answersStr = this.getAttribute("answers");
    let answers = props.answers;
    if (answersStr) {
      // Answers is a JSON Data URL -->  data:,%5B%5D
      const data = answersStr.split(",")[1];
      answers = JSON.parse(decodeURIComponent(data));
    }

    mountPoll(this.shadow, {
      question: this.getAttribute("question") ?? props.question,
      answers,
      freeText: this.getAttribute("freeText") ?? props.freeText,
      href: this.getAttribute("href") ?? props.href,
    });
  }

  static get observedAttributes() {
    return Object.keys(props);
  }
}

customElements.define(nodeName, PollComponent);
