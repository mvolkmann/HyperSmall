class NewStackDialog extends HTMLElement {
  // This custom element does not use shadow DOM.
  connectedCallback() {
    this.innerHTML = /*html*/ `
      <style>
        dialog {
          display: none; /* initially */
        }

        .border-right-dotted {
          border-right: 1px dotted black;
          padding-right: 1rem;
        }
      </style>

      <dialog id="new-stack-dialog">
        <form
          hx-post="/stack"
          hx-target="main"
          hx-swap="beforeend"
          hx-on:htmx:after-request="this.reset()"
          id="new-stack-form"
          x-data="{
            cardSize: 'Small',
            name: '',
            onCardSizeChange,
            onStackNameChange
          }"
        >
          <div class="column">
            <label class="mb1" for="name"> New stack name: </label>
            <input
              autofocus
              id="name"
              name="name"
              required
              style="margin-bottom: 1rem"
              type="text"
              x-model="name"
              x-on:keyup="onStackNameChange($event)"
            />
            <div class="row">
              <input type="checkbox" id="copyBg" name="copyBg" />
              <label for="copyBg">Copy current background</label>
            </div>
            <div class="row">
              <input type="checkbox" checked id="openNew" name="openNew" />
              <label for="openNew">Open stack in new window</label>
            </div>
          </div>
          <div class="border-right-dotted column gap2">
            <button autofocus onclick="closeDialog(this)">Cancel</button>
            <button id="saveBtn">Save</button>
          </div>
          <div class="column">
            <label class="mb1" for="cardSize"> Card size: </label>
            <select
              class="mb4"
              id="cardSize"
              name="cardSize"
              x-model="cardSize"
              x-on:change="onCardSizeChange($event)"
            >
              <option>Small</option>
              <option>Classic</option>
              <option>PowerBook</option>
              <option>Large</option>
              <option>MacPaint</option>
              <option>Window</option>
            </select>
            <div>
              &#x2194;
              <span id="cardWidth">416</span>
              &nbsp; &#x2195;
              <span id="cardHeight">240</span>
            </div>
          </div>
        </form>
      </dialog>
    `;

    // Process the htmx attributes on elements that were added dynamically.
    htmx.process(this);

    /*
    // Adopt an external stylesheet when using shadow DOM.
    const style = document.createElement('link');
    style.rel = 'stylesheet';
    style.href = 'style.css';
    root.appendChild(style);
    */
  }

  showModal() {
    const dialog = this.querySelector('dialog');
    dialog.style.display = 'flex';
    dialog.showModal();
  }
}

customElements.define('new-stack-dialog', NewStackDialog);
