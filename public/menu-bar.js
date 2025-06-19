class MenuBar extends HTMLElement {
  filledPrefix = '';
  selectedTool = '';

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

        .menu-bar {
          display: flex;
          align-items: center;

          background: #ddd;
          font-family: sans-serif;
          font-weight: bold;
          padding: 0 0.7rem;
          z-index: 100;

          .menu {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            position: relative;
            z-index: 100;

            button {
              background-color: transparent;
              border: none;
              cursor: pointer;
            }

            hr {
              width: 100%;
            }

            .menu-items {
              display: none;
              flex-direction: column;
              align-items: flex-start;

              position: absolute;
              top: 1.2rem;

              background-color: #ddd;
              border: 1px solid black;
              box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.3);

              button {
                border-radius: 0;
                display: inline-block;
                text-align: left;
                white-space: nowrap;
                width: 100%;
              }
            }

            .open {
              background-color: #339; /* blue */
              color: white;
            }
          }

          .spacer {
            flex-grow: 1;
          }

          #time {
            font-size: 0.8rem;
            margin-right: 0.5rem;
          }

          #tools-palette {
            position: absolute;
            top: 1.2rem;
            left: 0.1rem;

            box-shadow: 3px 3px black;
            display: none;
            grid-template-columns: repeat(3, 32px);
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
          }
        }

        .menu-bar-logo {
          height: 1rem;
          margin.right: 0.4rem;
        }

        .menu-label {
          border-radius: 0;
          font-size: 0.8rem;
          font-weight: bold;
          padding: 2px 6px;
        }
      </style>

      <div class="menu-bar">
        <img
          class="menu-bar-logo"
          src="images/apple-logo-pixels.png"
          alt="Apple logo"
        />
        <div class="menu">
          <button class="menu-label">File</button>
          <div class="menu-items">
            <button id="new-stack-btn">New Stack...</button>
            <button hx-get="/open-stack" hx-target="#modal-dialog">
              Open Stack...
            </button>
            <button>Close Stack</button>
            <hr />
            <button hx-delete="/stack" hx-target="#modal-dialog">
              Delete Stack...
            </button>
          </div>
        </div>
        <div class="menu">
          <button class="menu-label">Edit</button>
          <div class="menu-items">
            <button>Undo</button>
            <button>Cut</button>
            <button>Copy</button>
            <button>Paste</button>
            <button>Clear</button>
            <hr />
            <button>New Card</button>
            <button>Delete Card</button>
            <button>Cut Card</button>
            <button>Copy Card</button>
            <hr />
            <button>Text Style...</button>
            <button>Background</button>
            <button>Icon...</button>
          </div>
        </div>
        <div class="menu">
          <button class="menu-label">Go</button>
          <div class="menu-items">
            <button>Back</button>
            <button>Home</button>
            <button>Help</button>
            <button>Recent</button>
            <hr />
            <button>First</button>
            <button>Prev</button>
            <button>Next</button>
            <button>Last</button>
            <hr />
            <button>Find...</button>
            <button>Message</button>
            <button>Scroll</button>
            <button>Next Window</button>
          </div>
        </div>
        <div class="menu" style="position: relative">
          <button class="menu-label" onclick="openTools()">Tools</button>
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
        </div>
        <div class="menu">
          <button class="menu-label">Objects</button>
          <div class="menu-items">
            <button>Button Info...</button>
            <button>Field Info...</button>
            <button>Card Info...</button>
            <button>Bkgnd Info...</button>
            <button>Stack Info...</button>
            <hr />
            <button onclick="bringCloser()">Bring Closer</button>
            <button onclick="sendFarther()">Send Farther</button>
            <hr />
            <button hx-get="/new-button">New Button</button>
            <button>New Field</button>
            <button>New Background</button>
          </div>
        </div>
        <div class="menu">
          <button class="menu-label">Font</button>
          <div class="menu-items">
            <button>Serif</button>
            <button>Sans-Serif</button>
            <button>Monospace</button>
            <button>Cursive</button>
            <button>Fantasy</button>
          </div>
        </div>
        <div class="menu">
          <button class="menu-label">Style</button>
          <div class="menu-items">
            <button>Plain</button>
            <button>Bold</button>
            <button>Italic</button>
            <button>Underline</button>
            <button>Outline</button>
            <button>Shadow</button>
            <button>Group</button>
            <hr />
            <button>9</button>
            <button>10</button>
            <button>12</button>
            <button>14</button>
            <button>18</button>
            <button>24</button>
            <hr />
            <button>Other...</button>
          </div>
        </div>
        <div class="menu">
          <button class="menu-label">Help</button>
          <div class="menu-items">
            <button>About Balloon Help...</button>
            <button>Show Balloons</button>
          </div>
        </div>
        <div class="spacer"></div>
        <div id="time"></div>
        <img
          class="menuBarLogo"
          src="images/hypercard-logo.png"
          style="height: 1.2rem; margin-right: 0.2rem"
          alt="HyperCard logo"
        />
        <div class="menu-label">HyperCard</div>
      </div>
    `;
  }

  connectedCallback() {
    const root = this.shadowRoot;

    // Process the htmx attributes on elements that were added dynamically.
    htmx.process(root);

    this.menus = root.querySelectorAll('.menu');
    this.menuButtons = root.querySelectorAll('.menu-items > button');

    // Add event handling to menus and menu items.
    for (const menu of this.menus) {
      const button = menu.querySelector('button');
      button.addEventListener('click', onMenuClick);
      //TODO: Should this listen for 'mouseenter' instead?
      button.addEventListener('mouseover', onMenuHover);
      menu.addEventListener('click', onMenuItemClick);

      const menuItems = menu.querySelector('.menu-items');
      const buttons = menuItems?.querySelectorAll('button') || [];
      for (const button of buttons) {
        button.addEventListener('mouseenter', () => {
          playAudio('menu-item.wav');
          button.style.backgroundColor = menuSelectColor;
          button.style.color = 'white';
        });
        button.addEventListener('mouseleave', () => {
          button.style.backgroundColor = 'transparent';
          button.style.color = 'black';
        });
      }
    }

    // Wire up menu item functionality.
    root.querySelector('#new-stack-btn').addEventListener('click', () => {
      const nsd = document.querySelector('new-stack-dialog');
      nsd.showModal();
    });

    this.toolsPaletteSetup();
  }

  closeMenus() {
    for (const menu of this.menus) {
      const button = menu.querySelector('button');
      button.classList.remove('open');

      const menuItems = menu.querySelector('.menu-items');
      if (menuItems) menuItems.style.display = 'none';
    }
    openMenu = null;
  }

  setFilled(filled) {
    this.filledPrefix = filled ? 'filled-' : '';
    this.render();
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

  toggleToolsPalette() {
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
        const img = button.querySelector('img');
        console.log('menu-bar.js toolsPaletteSetup: img.alt =', img.alt);
        this.selectedTool = img.alt;
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

customElements.define('menu-bar', MenuBar);
