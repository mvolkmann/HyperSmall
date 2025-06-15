class TitleBar extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
    this.shadowRoot.innerHTML = `
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
        <div>Button Info</div>
        <stripe-lines></stripe-lines>
      </div>
    `;
  }
}

customElements.define('title-bar', TitleBar);
