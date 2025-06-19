class ToolsPalette extends HTMLElement {
  filledPrefix = '';
  selectedToolButton = null;
  selectedToolName = '';

  constructor() {
    super();
    this.attachShadow({mode: 'open'});
    this.shadowRoot.innerHTML = /*html*/ `
      <style>
        @keyframes flashBorder {
          0%, 100% {
            border-color: transparent;
          }
          50% {
            border-color: black;
          }
        }

        #tools-palette {
          position: absolute;
          top: 1.2rem;
          left: 0.1rem;

          box-shadow: 3px 3px black;
          display: none;
          grid-template-columns: repeat(3, 30px);
          grid-template-rows: repeat(6, 28px);

          button {
            display: flex;
            justify-content: center;
            align-items: center;

            background-color: white;
            border-left: 1px solid black;
            border-top: 1px solid black;
            border-right: 1px solid white;
            border-bottom: 1px solid white;
            padding: 2px;

            img {
              width: 20px;
              height: auto;
            }
          }

          button.selected {
            background-color: black;
            border-right-color: black;
            border-bottom-color: black;

            img {
              filter: invert(100%);
            }
          }
        }
      </style>

      <div id="tools-palette">
        <button><img alt="Browse mode" src="images/tools-palette/browse-mode-icon.png" /></button>
        <button><img alt="Button mode" src="images/tools-palette/button-mode-icon.png" /></button>
        <button><img alt="Field mode" src="images/tools-palette/field-mode-icon.png" /></button>
        <button><img alt="Select tool" src="images/tools-palette/select-tool-icon.png" /></button>
        <button><img alt="Lasso tool" src="images/tools-palette/lasso-tool-icon.png" /></button>
        <button><img alt="Pencil tool" src="images/tools-palette/pencil-tool-icon.png" /></button>
        <button><img alt="Brush tool" src="images/tools-palette/brush-tool-icon.png" /></button>
        <button><img alt="Eraser tool" src="images/tools-palette/eraser-tool-icon.png" /></button>
        <button><img alt="Line tool" src="images/tools-palette/line-tool-icon.png" /></button>
        <button><img alt="Spray tool" src="images/tools-palette/spray-tool-icon.png" /></button>
        <button><img alt="Rectangle tool" src="images/tools-palette/${this.filledPrefix}rectangle-tool-icon.png" /></button>
        <button><img alt="Rounded Rectangle tool" src="images/tools-palette/${this.filledPrefix}rounded-rectangle-tool-icon.png" /></button>
        <button><img alt="Bucket tool" src="images/tools-palette/bucket-tool-icon.png" /></button>
        <button><img alt="Oval tool" src="images/tools-palette/${this.filledPrefix}oval-tool-icon.png" /></button>
        <button><img alt="Curve tool" src="images/tools-palette/${this.filledPrefix}curve-tool-icon.png" /></button>
        <button><img alt="Text tool" src="images/tools-palette/text-tool-icon.png" /></button>
        <button><img alt="Polygon tool" src="images/tools-palette/${this.filledPrefix}regular-polygon-tool-icon.png" /></button>
        <button><img alt="Irregular Polygon tool" src="images/tools-palette/${this.filledPrefix}irregular-polygon-tool-icon.png" /></button>
      </div>
    `;
  }

  connectedCallback() {
    const root = this.shadowRoot;

    // Process the htmx attributes on elements that were added dynamically.
    //htmx.process(root);

    this.toolsPaletteSetup();
  }

  hide() {
    const palette = this.shadowRoot.getElementById('tools-palette');
    palette.style.display = 'none';
  }

  selectMenuItem(name) {
    const button = Array.from(this.menuButtons).find(
      b => b.textContent.trim() === name
    );

    if (button) {
      button.click();
    } else {
      alert(`Unknown menu item "${name}"`);
    }
  }

  setFilled(filled) {
    this.filledPrefix = filled ? 'filled-' : '';
    this.render();
  }

  show() {
    const palette = this.shadowRoot.getElementById('tools-palette');
    palette.style.display = 'grid';
  }

  toggle() {
    const palette = this.shadowRoot.getElementById('tools-palette');
    const {style} = palette;
    style.display = style.display === 'grid' ? 'none' : 'grid';
  }

  toolsPaletteSetup() {
    const palette = this.shadowRoot.getElementById('tools-palette');
    const buttons = palette.querySelectorAll('button');
    for (const button of buttons) {
      const {style} = button;

      button.addEventListener('click', () => {
        if (this.selectedButton) {
          if (this.selectedButton !== button) {
            this.selectedButton.classList.remove('selected');
            button.classList.add('selected');
          }
        } else {
          button.classList.add('selected');
        }
        this.selectedButton = button;

        const img = button.querySelector('img');
        this.selectedToolName = img.alt;
        this.dispatchEvent(
          new CustomEvent('tool-selected', {
            bubbles: true,
            composed: true,
            detail: this.selectedToolName
          })
        );
      });

      button.addEventListener('mouseenter', () => {
        playAudio('menu-item.wav');
        style.borderRight = '1px solid black';
        style.borderBottom = '1px solid black';
        style.animation = 'flashBorder 100ms step-end infinite';
      });

      button.addEventListener('mouseleave', () => {
        style.borderRight = '1px solid white';
        style.borderBottom = '1px solid white';
        style.animation = 'none';
      });
    }
  }
}

customElements.define('tools-palette', ToolsPalette);
