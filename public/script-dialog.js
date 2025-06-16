class ScriptDialog extends HTMLElement {
  // This custom element does not use shadow DOM.
  connectedCallback() {
    this.innerHTML = /*html*/ `
      <style>
        dialog {
          display: none; /* initially */
        }
      </style>

      <dialog id="script-dialog">
        <form
          hx-post="/script"
          hx-on:htmx:after-request="this.reset()"
          id="script-form"
        >
          <div class="row">
            <div class="column">
              <div class="row">
                <label>Scripting language:</label>
                <select>
                  <option>HyperTalk</option>
                  <option>AppleScript</option>
                </select>
              </div>
              <div class="row">
                <label>Length:</label>
                <div>0</div>
              </div>
            </div>
            <div class="column">
              <div class="row">
                <label>Handlers:</label>
              </div>
              <div class="row">
                <label>Functions:</label>
              </div>
            </div>
          </div>
          <textarea>
        </form>
      </dialog>
    `;

    // Process the htmx attributes on elements that were added dynamically.
    htmx.process(this);
  }

  show() {
    const dialog = this.querySelector('dialog');
    dialog.style.display = 'flex';
    dialog.show();
  }
}

customElements.define('script-dialog', ScriptDialog);
