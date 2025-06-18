class ContentsDialog extends HTMLElement {
  // This custom element does not use shadow DOM.
  connectedCallback() {
    this.innerHTML = /*html*/ `
      <style>
        .contents-dialog {
          display: none; /* initially */
          margin: 0;
          min-width: 24rem;
          z-index: 200;

          form {
            display: flex;
            flex-direction: column;
            padding: 1rem;
          }

          .row {
            justify-content: flex-end;
          }

          textarea {
            flex-grow: 1;
            height: 10rem;
            overflow: scroll;
            white-space: nowrap;
            width: 100%;
          }
        }
      </style>

      <dialog class="dialog-with-title-bar contents-dialog">
        <basic-title-bar>Button Contents</basic-title-bar>
        <form hx-post="/button-contents">
          <label>Contents of card button {buttonId}</label>
          <textarea name="contents"></textarea>
          <div class="row gap4">
            <button class="defaultButton">OK</button>
            <button onclick="closeDialog(this, true)" type="button">
              Cancel
            </button>
          </div>
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
    centerInParent(dialog);

    const titleBar = dialog.querySelector('fancy-title-bar');

    //TODO: Change the way resizing works
    // so there is a square in the lower-right?
    // Currently, resizing occurs by resizing the textarea.
    makeDraggable({element: dialog, handle: titleBar});
  }
}

customElements.define('contents-dialog', ContentsDialog);
