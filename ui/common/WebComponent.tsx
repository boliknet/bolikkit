

export abstract class WebComponent extends HTMLElement {
  protected shadow: ShadowRoot;

  constructor(styles: string) {
    super();

    this.shadow = this.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = styles;
    this.shadow.appendChild(style);

    // TODO: this constructor and replaceSync are supported on Safari only starting from March 2023
    // const sheet = new CSSStyleSheet();
    // sheet.replaceSync(styles);
    // this.shadow.adoptedStyleSheets = [sheet];

    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  abstract render(): void;
}
