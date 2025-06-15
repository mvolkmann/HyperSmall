let clickAudio;
let currentStackName = '';
let isResizing = false;
let menuButtons;
let menus;
let openMenu;
let resizeOffsetX;
let resizeOffsetY;
let setupFinished = false;

const cardHeight = {
  Small: 240,
  Classic: 342,
  PowerBook: 400,
  Large: 480,
  MacPaint: 720,
  Window: 480 // same as Large
};

const cardWidth = {
  Small: 416,
  Classic: 512,
  PowerBook: 640,
  Large: 640,
  MacPaint: 576,
  Window: 640 // same as Large
};

setInterval(updateTime, 60000);

function centerInParent(element) {
  const parentRect = element.parentElement.getBoundingClientRect();
  const elementRect = element.getBoundingClientRect();
  const {style} = element;
  style.left = parentRect.width / 2 - elementRect.width / 2 + 'px';
  style.top = parentRect.height / 2 - elementRect.height / 2 + 'px';
}

function closeDialog(element) {
  if (element) element.closest('dialog').close();
}

function closeMenus() {
  for (const menu of menus) {
    const button = menu.querySelector('button');
    button.classList.remove('open');

    const menuItems = menu.querySelector('.menuItems');
    menuItems.style.display = 'none';
  }
  openMenu = null;
}

function configureMenus() {
  document.body.addEventListener('click', closeMenus);
  menus = document.querySelectorAll('.menu');
  for (const menu of menus) {
    const button = menu.querySelector('button');
    button.addEventListener('click', onMenuClick);
    button.addEventListener('mouseover', onMenuHover);
    menu.addEventListener('click', onMenuItemClick);
  }
}

function deselectAll(ancestor) {
  const selected = ancestor.querySelectorAll('.selected');
  for (const element of selected) {
    element.classList.remove('selected');
  }
}

// This returns a Boolean indicating whether mouse cursor
// is over the lower-right corner of the target element.
function isOverLowerRight(event) {
  const {left, top, width, height} = event.target.getBoundingClientRect();
  const x = event.clientX - left;
  const y = event.clientY - top;
  return width - x < 10 && height - y < 10;
}

function makeDraggable(element, handle, canResize) {
  element.style.position = 'absolute';
  const {parentElement} = element;
  parentElement.style.position = 'relative';

  const target = handle || element;
  const targetStyle = target.style;
  targetStyle.cursor = 'grab';

  if (canResize) {
    target.addEventListener('mousemove', () => {
      targetStyle.cursor =
        canResize && isOverLowerRight(event) ? 'se-resize' : 'grab';
    });
  }

  target.addEventListener('mousedown', event => {
    if (targetStyle.cursor === 'grab') targetStyle.cursor = 'grabbing';

    const elementRect = element.getBoundingClientRect();

    // These values are the offset from the mouse location
    // to the upper-left corner of the draggable element.
    const offsetX = event.clientX - elementRect.left;
    const offsetY = event.clientY - elementRect.top;

    // These values are relative to the upper-left corner of the parent element.
    const parentRect = parentElement.getBoundingClientRect();
    const maxDragX = parentRect.width - elementRect.width;
    const maxDragY = parentRect.height - elementRect.height;
    const maxResizeX = parentRect.left + parentRect.width;
    const maxResizeY = parentRect.top + parentRect.height;

    function onMouseMove(event) {
      const targetRect = event.target.getBoundingClientRect();
      const {left, top, width, height} = targetRect;
      const x = event.clientX - left;
      const y = event.clientY - top;

      const {style} = element;

      if (canResize && !isResizing) {
        // Determine if the user is dragging from
        // the lower-right corner of the draggable element.
        // If so, resize the element instead of moving it.
        isResizing = width - x < 10 && height - y < 10;
        if (isResizing) {
          // Calculate the distance from the right side
          // of the element being resized to the mouse cursor x.
          resizeOffsetX = elementRect.left + elementRect.width - event.clientX;

          // Calculate the distance from the bottom side
          // of the element being resized to the mouse cursor y.
          resizeOffsetY = elementRect.top + elementRect.height - event.clientY;
        }
      }

      if (isResizing) {
        // Don't allow the element to be resized outside its parent.
        if (event.clientX < maxResizeX && event.clientY < maxResizeY) {
          style.width = event.clientX - left + resizeOffsetX + 'px';
          style.height = event.clientY - top + resizeOffsetY + 'px';
        }
      } else {
        const left = Math.max(
          0,
          Math.min(maxDragX, event.clientX - parentRect.left - offsetX)
        );
        const top = Math.max(
          0,
          Math.min(maxDragY, event.clientY - parentRect.top - offsetY)
        );
        style.left = left + 'px';
        style.top = top + 'px';
      }
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener(
      'mouseup',
      () => {
        targetStyle.cursor = 'grab';
        isResizing = false;
        document.removeEventListener('mousemove', onMouseMove);
      },
      {once: true}
    );
  });
}

function newButton() {
  // Create a new button.
  const button = document.createElement('button');
  button.classList.add('button');
  button.classList.add('selected');
  button.textContent = 'New Button';
  button.addEventListener('click', event => {
    button.classList.toggle('selected');
    event.stopPropagation();
  });
  button.addEventListener('dblclick', event => {
    document.getElementById('button-info-dialog').showModal();
  });

  // Add the button to the section.
  console.log('script.js newButton: currentStackName =', currentStackName);
  const dialog = document.getElementById('dialog-' + currentStackName);
  console.log('script.js newButton: dialog =', dialog);
  const section = dialog.querySelector('section');
  section.appendChild(button);

  makeDraggable(button, null, true);
  centerInParent(button);

  // Process the htmx attributes on an element that was added dynamically.
  //htmx.process(button);
}

function newStack(event) {
  closeDialog(event.target);
  const {cardSize, stackName} = event.detail;
  const dialogId = 'dialog-' + stackName;
  requestAnimationFrame(() => {
    const dialog = document.getElementById(dialogId);
    const {style} = dialog;
    style.width = cardWidth[cardSize] + 'px';
    style.height = cardHeight[cardSize] + 'px';
    style.zIndex = 1;
    dialog.show();
    currentStackName = stackName;

    const section = dialog.querySelector('section');
    section.addEventListener('click', () => deselectAll(section));

    const titleBar = dialog.querySelector('.title-bar');
    makeDraggable(dialog, titleBar, false);

    dialog.addEventListener('click', event => selectStack(event));
  });
}

function onCardSizeChange(event) {
  const cardSize = event.target.value;
  document.querySelector('#cardWidth').textContent = cardWidth[cardSize];
  document.querySelector('#cardHeight').textContent = cardHeight[cardSize];
}

function onMenuItemClick(event) {
  playClick();
  closeMenus();
}

function onMenuClick(event) {
  event.stopPropagation();

  playClick();

  const button = event.target;
  button.classList.add('hover');
  openMenu = button.parentElement;
  const menuItems = openMenu.querySelector('.menuItems');
  const style = menuItems.style;

  const visible = style.display === 'flex';
  if (visible) {
    style.display = 'none';
    closeMenus();
  } else {
    style.display = 'flex';
    requestAnimationFrame(() => {
      style.width = 'fit-content';
    });
  }

  button.classList.toggle('open');
}

function onMenuHover(event) {
  if (openMenu) {
    const button = openMenu.querySelector('.menu-label');
    button.classList.remove('open');
    const menuItems = openMenu.querySelector('.menuItems');
    menuItems.style.display = 'none';
    onMenuClick(event);
  }
}

function onStackNameChange(event) {
  const submitButton = document.getElementById('saveBtn');
  submitButton.disabled = event.target.value === '';
}

function onStackSelected(event) {
  const submitButton = document.querySelector('button[type=submit]');
  submitButton.disabled = event.target.value === '';
}

function playClick() {
  // In order to prevent autoplay, sounds cannot be played
  // until the user has interacted with the document.
  if (!setupFinished) return;

  // Lazily load the click sound.
  if (!clickAudio) clickAudio = new Audio('sounds/click.mp3');

  clickAudio.play();
}

function replaceStack() {
  alert('replaceStack called');
}

function selectMenuItem(name) {
  // Lazily find all the menu buttons.
  if (!menuButtons) {
    const menuBar = document.querySelector('.menu-bar');
    menuButtons = menuBar.querySelectorAll('button');
  }

  const button = Array.from(menuButtons).find(
    b => b.textContent.trim() === name
  );

  if (button) {
    button.click();
  } else {
    alert(`Unknown menu item "${name}"`);
  }
}

function selectStack(event) {
  if (currentStackName) {
    const id = 'dialog-' + currentStackName;
    let dialog = document.getElementById(id);
    dialog.style.zIndex = 0;
  }

  dialog = event.target.closest('dialog');
  dialog.style.zIndex = 1;
  currentStackName = dialog.id.split('-')[1];
}

// This simulates user events to take some initial actions in the UI.
// It is useful for debugging.
async function setup() {
  document.getElementById('new-stack-btn').addEventListener('click', event => {
    document.getElementById('new-stack-dialog').showModal();
  });

  /*
  selectMenuItem('New Stack...');
  await waitForNextFrame();

  const dialog = document.getElementById('modal-dialog');
  await waitForNextFrame();

  console.log('script.js setup: dialog =', dialog);
  dialog.querySelector('#name').value = 'Demo';
  dialog.querySelector('#saveBtn').click();
  await waitForNextFrame();

  //TODO: Why is this setTimeout necessary?
  setTimeout(() => {
    selectMenuItem('New Button');
    setupFinished = true;
  }, 100);
  */
}

function updateTime() {
  const div = document.getElementById('time');
  div.textContent = new Date().toLocaleTimeString(navigator.language, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

async function waitForNextFrame() {
  return new Promise(requestAnimationFrame);
}
