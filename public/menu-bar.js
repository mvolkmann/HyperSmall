class MenuBar extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
    this.shadowRoot.innerHTML = /*html*/ `
      <style>
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
        <div class="menu">
          <button class="menu-label">Tools</button>
          <div class="menu-items"></div>
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
            <button>Bring Closer</button>
            <button>Send Farther</button>
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

    for (const menu of this.menus) {
      const button = menu.querySelector('button');
      button.addEventListener('click', onMenuClick);
      //TODO: Should this listen for 'mouseenter' instead?
      button.addEventListener('mouseover', onMenuHover);
      menu.addEventListener('click', onMenuItemClick);

      const menuItems = menu.querySelector('.menu-items');
      const buttons = menuItems.querySelectorAll('button');
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

    // Wire up menu items.
    root.querySelector('#new-stack-btn').addEventListener('click', event => {
      const dialog = document.getElementById('new-stack-dialog');
      dialog.style.display = 'flex';
      dialog.showModal();
    });
  }

  closeMenus() {
    for (const menu of this.menus) {
      const button = menu.querySelector('button');
      button.classList.remove('open');

      const menuItems = menu.querySelector('.menu-items');
      menuItems.style.display = 'none';
    }
    openMenu = null;
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
}

customElements.define('menu-bar', MenuBar);
