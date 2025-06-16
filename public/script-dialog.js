class ScriptDialog extends HTMLElement {
  // This custom element does not use shadow DOM.
  connectedCallback() {
    this.innerHTML = /*html*/ `
      <style>
        .dialog-with-title-bar {
          display: none; /* initially */
          margin: 0;
          z-index: 10;

          form {
            display: flex;
            padding: 0;
          }

          textarea {
            flex-grow: 1;
            overflow: scroll;
            white-space: nowrap;
            width: 100%;
          }

          .top {
            padding: 1rem;
          }
        }
      </style>

      <dialog class="dialog-with-title-bar" id="script-dialog">
        <fancy-title-bar>Script of card button id ???</fancy-title-bar>
        <form
          hx-post="/script"
          hx-on:htmx:after-request="this.reset()"
          id="script-form"
        >
          <div class="top">
            <div class="row gap2">
              <div class="column gap2">
                <div class="row">
                  <label>Scripting language:</label>
                  <select>
                    <option>HyperTalk</option>
                    <option>AppleScript</option>
                  </select>
                </div>
                <div class="row">
                  <label>Length:</label>
                  <div id="length">0</div>
                </div>
              </div>
              <div class="column">
                <div class="row">
                  <label>Handlers:</label>
                  <select>
                  </select>
                </div>
                <div class="row">
                  <label>Functions:</label>
                  <select>
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div class="row">
            <textarea></textarea>
          </div>
        </form>
      </dialog>
    `;

    // Process the htmx attributes on elements that were added dynamically.
    htmx.process(this);

    const textarea = this.querySelector('textarea');
    const lengthDiv = this.querySelector('#length');
    textarea.addEventListener('input', () => {
      lengthDiv.textContent = textarea.value.length;
    });
  }

  show() {
    const dialog = this.querySelector('dialog');
    dialog.style.display = 'flex';
    dialog.show();
    centerInParent(dialog);

    const titleBar = dialog.querySelector('title-bar');

    //TODO: Change the way resizing works
    // so there is a square in the lower-right?
    // Currently, resizing occurs by resizing the textarea.
    makeDraggable(dialog, titleBar, false);
  }
}

customElements.define('script-dialog', ScriptDialog);
