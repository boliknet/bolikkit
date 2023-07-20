/**
 * Create a Web Component.
 */
import { props } from "./props.ts";
import { mount } from "./Story.tsx";
import { nodeName } from "./schema.ts";
import styles from "./uno.css.js";
import { WebComponent } from "../../common/WebComponent.tsx";

class StoryMediaComponent extends WebComponent {
  constructor() {
    super(styles);
  }

  render() {
    const screensStr = this.getAttribute("screens");
    let screens = props.screens;
    if (screensStr) {
      // Fields is a JSON Data URL -->  data:,%7B%22items%22%3A%5B%5D%7D
      const data = screensStr.split(",")[1];
      screens = JSON.parse(decodeURIComponent(data));
    }

    mount(this.shadow, {
      screens,
    });
  }

  static get observedAttributes() {
    return Object.keys(props).map((p) => p.toLowerCase());
  }
}

customElements.define(nodeName, StoryMediaComponent);
