function toggleDialogCollapse(element) {
  const dialog = element.closest('dialog');
  const {style} = dialog;
  const titleBar = dialog.querySelector('fancy-title-bar');
  const nextSibling = titleBar.nextElementSibling;

  if (style.height === 'auto') {
    playAudio('window-expand.wav');
    nextSibling.style.display = 'block';
    style.height = dialog.savedHeight;
  } else {
    playAudio('window-collapse.wav');
    dialog.savedHeight = style.height;
    nextSibling.style.display = 'none';
    style.height = 'auto';
  }
}

class FancyTitleBar extends HTMLElement {
  // This custom element does not use shadow DOM.
  connectedCallback() {
    this.innerHTML = /*html*/ `
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
        <img
          class="icon-button"
          onclick="closeDialog(this)"
          src="images/close-icon.png"
        />
        <stripe-lines></stripe-lines>
        <div>${this.textContent.trim()}</div>
        <stripe-lines></stripe-lines>
        <img class="icon-button" src="images/zoom-icon.png" />
        <img
          class="icon-button"
          onclick="toggleDialogCollapse(this)"
          src="images/collapse-icon.png"
        />
      </div>
    `;
  }
}

customElements.define('fancy-title-bar', FancyTitleBar);
