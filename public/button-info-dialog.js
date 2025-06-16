class ButtonInfoDialog extends HTMLElement {
  // This custom element does not use shadow DOM.
  connectedCallback() {
    this.innerHTML = /*html*/ `
      <style>
        dialog {
          display: none; /* initially */
        }

        .grid-3-columns {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
        }
      </style>

      <dialog class="dialog-with-title-bar" id="button-info-dialog">
        <title-bar></title-bar>
        <form hx-post="/button-info">
            <div class="row gap1">
              <label class="mb1" for="cardSize"> Button Name: </label>
              <input autofocus id="buttonName" name="buttonName" required />
            </div>
            <div class="row-align-start gap2">
              <div class="column">
                <label>Card button number:</label>
                <label>Card part number:</label>
                <label>Card button ID:</label>
              </div>
              <div class="column">
                <label>Style:</label>
                <label>Family:</label>
              </div>
            </div>

            <div class="row">
              <div class="column">
                <div class="row">
                  <input type="checkbox" id="showName" name="showName" />
                  <label for="showName">Show name</label>
                </div>
                <div class="row">
                  <input type="checkbox" id="authHilite" name="authHilite" />
                  <label for="autoHilite">Auto Hilite</label>
                </div>
                <div class="row">
                  <input type="checkbox" id="enabled" name="enabled" />
                  <label for="enabled">Enabled</label>
                </div>
              </div>
            </div>
            <div class="row gap2">
              <div class="grid-3-columns gap1">
                <button>Text Style...</button>
                <button>Icon...</button>
                <button>LinkTo...</button>
                <button>Script...</button>
                <button>Contents...</button>
                <button>Tasks...</button>
              </div>
              <div class="column gap1">
                <button
                  id="okBtn"
                  disabled="{true}"
                  onclick="closeDialog(this)"
                >
                  OK
                </button>
                <button onclick="closeDialog(this)" type="button">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </form>
      </dialog>
    `;

    // Process the htmx attributes on elements that were added dynamically.
    htmx.process(this);
  }

  showModal() {
    const dialog = this.querySelector('dialog');
    dialog.style.display = 'flex';
    dialog.showModal();
    centerInParent(dialog);
  }
}

customElements.define('button-info-dialog', ButtonInfoDialog);
