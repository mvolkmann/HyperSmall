class StripeLines extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          flex-grow: 1;
        }

        hr {
          border-color: WhiteSmoke;
          margin: 1px;
        }
      </style>
      <div>
        <hr />
        <hr />
        <hr />
        <hr />
        <hr />
        <hr />
      </div>
    `;
  }
}

customElements.define('stripe-lines', StripeLines);
