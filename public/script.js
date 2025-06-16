const audioMap = {};
let currentStackName = '';
let isResizing = false;
let menuBar;
const menuSelectColor = '#339';
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
  const dialog = element.closest('dialog');
  dialog.style.display = 'none';
  dialog.close();
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
      const targetRect = target.getBoundingClientRect();
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
        let top = Math.max(
          0,
          Math.min(maxDragY, event.clientY - parentRect.top - offsetY)
        );

        // Handle special case for dialogs with a title bar.
        if (element.classList.contains('dialog-with-title-bar')) {
          const titleBar = element.querySelector('title-bar');
          top += titleBar.offsetHeight;
        }

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

async function newButton() {
  // Create a new button.
  const button = document.createElement('button');
  button.classList.add('button');
  button.classList.add('selected');
  button.textContent = 'New Button';

  button.addEventListener('click', event => {
    button.classList.toggle('selected');
    event.stopPropagation();
  });

  button.addEventListener('dblclick', () => {
    const dialog = openTitledDialog('#button-info-dialog');
    const input = dialog.querySelector('#buttonName');
    input.value = button.textContent;
  });

  button.addEventListener('keydown', event => {
    event.stopPropagation();
    if (event.key === 'Backspace') button.remove();
  });

  // Add the button to the section.
  const dialog = await waitForElement(stackDialogSelector(currentStackName));
  const section = dialog.querySelector('section');
  section.appendChild(button);
  button.focus();

  makeDraggable(button, null, true);
  centerInParent(button);
}

async function newStack(event) {
  // Close the "New Stack..." dialog.
  closeDialog(event.target);

  // Create a dialog for the new stack.
  const {cardSize, stackName} = event.detail;
  const dialog = await waitForElement(stackDialogSelector(stackName));
  const {style} = dialog;
  style.width = cardWidth[cardSize] + 'px';
  style.height = cardHeight[cardSize] + 'px';
  style.zIndex = 1;
  dialog.show();
  centerInParent(dialog);

  currentStackName = stackName;

  const section = dialog.querySelector('section');
  section.addEventListener('click', () => deselectAll(section));

  const titleBar = dialog.querySelector('.title-bar');
  makeDraggable(dialog, titleBar, false);

  dialog.addEventListener('click', selectStack);
}

function onCardSizeChange(event) {
  const cardSize = event.target.value;
  document.querySelector('#cardWidth').textContent = cardWidth[cardSize];
  document.querySelector('#cardHeight').textContent = cardHeight[cardSize];
}

function onMenuItemClick(event) {
  playAudio('menu-open.wav');
  menuBar.closeMenus();
}

function onMenuClick(event) {
  event.stopPropagation();

  playAudio('menu-open.wav');

  const menuButton = event.target;
  openMenu = menuButton.parentElement;
  const menuItems = openMenu.querySelector('.menu-items');
  const menuItemsStyle = menuItems.style;
  const visible = menuItemsStyle.display === 'flex';

  if (visible) {
    menuItemsStyle.display = 'none';
    menuBar.closeMenus();
  } else {
    menuItemsStyle.display = 'flex';
    //TODO: Why is this necessary?
    requestAnimationFrame(() => {
      menuItemsStyle.width = 'fit-content';
    });
  }

  menuButton.classList.toggle('open');
}

function onMenuHover(event) {
  if (openMenu) {
    const button = openMenu.querySelector('.menu-label');
    button.classList.remove('open');
    const menuItems = openMenu.querySelector('.menu-items');
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

function openTitledDialog(selector) {
  const dialog = document.querySelector(selector);
  dialog.style.display = 'flex';
  dialog.showModal();
  centerInParent(dialog);
  const titleBar = dialog.querySelector('.title-bar');
  makeDraggable(dialog, titleBar, false);
  return dialog;
}

// This lazily loads each audio file only once.
function playAudio(fileName) {
  // In order to prevent autoplay, sounds cannot be played
  // until the user has interacted with the document.
  if (!setupFinished) return;

  let audio = audioMap[fileName];
  if (!audio) {
    audio = audioMap[fileName] = new Audio('sounds/' + fileName);
  }
  audio.play();
}

function replaceStack() {
  alert('replaceStack called');
}

async function selectStack(event) {
  if (currentStackName) {
    const dialog = await waitForElement(stackDialogSelector(currentStackName));
    dialog.style.zIndex = 0;
  }

  dialog = event.target.closest('dialog');
  dialog.style.zIndex = 1;
  currentStackName = dialog.id.split('-')[1];
}

async function setup() {
  menuBar = document.querySelector('menu-bar');
  document.body.addEventListener('click', () => menuBar.closeMenus());

  // Make all dialogs with a title bar be draggable by its title bar.
  const dialogs = document.querySelectorAll('.dialog-with-title-bar');
  for (const dialog of dialogs) {
    const titleBar = dialog.querySelector('.title-bar');
    makeDraggable(dialog, titleBar, false);
  }

  /*
  // Simulate user events to take some initial actions in the UI.
  // This is useful for debugging.
  menuBar.selectMenuItem('New Stack...');
  const dialog = await waitForElement('#new-stack-dialog');
  const stackName = 'Demo';
  dialog.querySelector('#name').value = stackName;
  dialog.querySelector('#saveBtn').click();
  await waitForElement(stackDialogSelector(stackName));
  menuBar.selectMenuItem('New Button');
  setupFinished = true;
  */
}

const stackDialogSelector = stackName => '#stack-' + stackName;

function toggleDialogCollapse(element) {
  const dialog = element.closest('dialog');
  const {style} = dialog;
  const section = dialog.querySelector('section');

  if (style.height === 'auto') {
    playAudio('window-expand.wav');
    section.style.display = 'block';
    style.height = dialog.savedHeight;
  } else {
    playAudio('window-collapse.wav');
    dialog.savedHeight = style.height;
    section.style.display = 'none';
    style.height = 'auto';
  }
}

function updateTime() {
  const div = document.getElementById('time');
  /* TODO: Fix this to work with menu-bar custom element.
  div.textContent = new Date().toLocaleTimeString(navigator.language, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
  */
}

function waitForElement(selector) {
  return new Promise(resolve => {
    const element = document.querySelector(selector);
    if (element) return resolve(element);

    const observer = new MutationObserver(() => {
      const element = document.querySelector(selector);
      if (element) {
        observer.disconnect(); // stop observing
        resolve(element);
      }
    });

    observer.observe(document.body, {childList: true, subtree: true});
  });
}
