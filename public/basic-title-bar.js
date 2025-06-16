class BasicTitleBar extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
    this.shadowRoot.innerHTML = /*html*/ `
      <style>
        .title-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 0.5rem;

          background-color: #bfbfbf;
          padding: 0.25rem;
        }
      </style>
      <div class="title-bar">
        <stripe-lines></stripe-lines>
        <div>${this.textContent.trim()}</div>
        <stripe-lines></stripe-lines>
      </div>
    `;
  }
}

customElements.define('basic-title-bar', BasicTitleBar);
