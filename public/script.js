const audioMap = {};

let cardIndex = 0;
let currentStackName = '';
let isResizing = false;
let menuBar;
let openMenu;
let resizeOffsetX;
let resizeOffsetY;
let selectedObject;
let setupFinished = false;
let stack = {
  cards: [
    {
      buttons: [],
      fields: []
    }
  ]
};
let timeoutId;
let wasDraggedOrMoved = false;

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

function atLeast(value, min) {
  return min ? Math.max(min, value) : value;
}

function bringCloser() {
  const zIndex = Number(selectedObject.style.zIndex);
  selectedObject.style.zIndex = zIndex + 1;
  htmx.ajax('POST', '/bring-closer/' + getButtonId(selectedObject));
}

function buttonContents(event) {
  const {contents, id} = event.detail;
  const select = document.getElementById('popup' + id);
  updatePopup(select, contents);
}

const getButtonId = button => button.id.substring('button'.length);

//TODO: This function is too long!  Break it up.
function buttonInfo(event) {
  // action indicates which submit button
  // in the "Button Info" dialog was clicked.
  const {
    action,
    autoHilite,
    contents,
    enabled,
    family,
    id,
    name,
    showName,
    style
  } = event.detail;

  const button = document.getElementById('button' + id);

  button.textContent = showName ? name : '';
  // We can't really disable the button because that would prevent
  // dragging, resizing, and double clicking (to edit) the button.
  button.setAttribute('data-enabled', enabled);

  const bStyle = button.style;

  // Set some default styles that will be customized
  // in the switch below based on the select button style.
  button.classList.remove('defaultButton');
  bStyle.backgroundColor = 'white';
  bStyle.borderRadius = 0;
  bStyle.borderColor = 'black';
  bStyle.borderWidth = '1px';
  bStyle.boxShadow = 'none';
  bStyle.display = 'block';

  checkboxSetup(button, style);
  popupSetup(button, style);
  radioButtonSetup(button, style, family);

  switch (style) {
    case 'Check Box':
      bStyle.display = 'none'; // hide the button
      break;
    case 'Default':
      bStyle.borderRadius = '0.5rem';
      bStyle.borderWidth = '4px';
      bStyle.position = 'relative';
      button.classList.add('defaultButton');
      break;
    case 'Opaque':
      bStyle.borderColor = 'transparent';
      break;
    case 'Oval':
      bStyle.backgroundColor = 'transparent';
      bStyle.borderRadius = '50%';
      bStyle.borderWidth = 1;
      break;
    case 'Popup':
      bStyle.display = 'none'; // hide the button
      break;
    case 'Radio Button':
      bStyle.display = 'none'; // hide the button
      break;
    case 'Rectangle':
      bStyle.borderWidth = 1;
      break;
    case 'Round Rect':
      bStyle.borderRadius = '0.5rem';
      bStyle.borderWidth = 1;
      bStyle.boxShadow = '2px 2px 2px black';
      break;
    case 'Shadow':
      bStyle.borderWidth = 1;
      bStyle.boxShadow = '2px 2px 2px black';
      break;
    case 'Standard':
      bStyle.borderRadius = '0.5rem';
      bStyle.borderWidth = 1;
      break;
    case 'Transparent':
      bStyle.backgroundColor = 'transparent';
      bStyle.borderColor = 'transparent';
      break;
  }

  //TODO: Implement autoHilite which inverts the pixel colors
  // in a button when the mouse is pressed down on it.

  if (action === 'contents') {
    setupContentsDialog(id, contents);
  } else if (action === 'script') {
    setupScriptDialog(id);
  }
}

function cancelPendingClick() {
  if (timeoutId) {
    clearTimeout(timeoutId);
    timeoutId = 0;
  }
}

function centerInParent(element) {
  let parent = element.parentElement;
  if (isCustomElement(parent)) parent = parent.parentElement;

  const parentRect = parent.getBoundingClientRect();
  const elementRect = element.getBoundingClientRect();
  const {style} = element;
  style.left = parentRect.width / 2 - elementRect.width / 2 + 'px';
  style.top = parentRect.height / 2 - elementRect.height / 2 + 'px';
}

function checkboxSetup(button, style) {
  const nextElement = button.nextElementSibling;

  if (style === 'Check Box') {
    const id = 'checkbox' + getButtonId(button);
    let label;

    // If the checkbox container already exists, use it.
    if (nextElement?.classList.contains('checkbox-container')) {
      label = nextElement.querySelector('label');
    } else {
      // Create the checkbox container.
      const input = document.createElement('input');
      input.id = id;
      input.type = 'checkbox';

      label = document.createElement('label');

      const div = document.createElement('div');
      div.classList.add('checkbox-container');
      const divStyle = div.style;
      const bStyle = button.style;
      divStyle.left = bStyle.left;
      divStyle.top = bStyle.top;
      div.appendChild(input);
      div.appendChild(label);
      button.after(div);

      // If the checkbox container is double-clicked, trigger that event
      // on the button that is currently not displayed
      // which will open the "Button Info" dialog.
      div.addEventListener('dblclick', () => {
        button.dispatchEvent(new MouseEvent('dblclick'));
      });

      makeDraggable({element: div});
    }

    label.setAttribute('for', id);
    label.textContent = button.textContent;
  } else {
    // Remove the checkbox container if it exists.
    if (nextElement?.classList.contains('checkbox-container')) {
      nextElement.remove();
    }
  }
}

function closeDialog(element, remove) {
  const dialog = element.closest('dialog');
  dialog.style.display = 'none';
  dialog.close();
  if (remove) dialog.remove();
}

function deselectAll(ancestor) {
  const selected = ancestor.querySelectorAll('.selected');
  for (const element of selected) {
    element.classList.remove('selected');
  }
}

function isCustomElement(element) {
  return element.tagName.includes('-');
}

// This returns a Boolean indicating whether mouse cursor
// is over the lower-right corner of the target element.
function isOverLowerRight(event) {
  const {left, top, width, height} = event.target.getBoundingClientRect();
  const x = event.clientX - left;
  const y = event.clientY - top;
  return width - x < 10 && height - y < 10;
}

function makeDraggable({element, handle, canResize, minWidth, minHeight}) {
  element.style.position = 'absolute';

  let {parentElement} = element;
  if (isCustomElement(parentElement)) {
    parentElement = parentElement.parentElement;
  }
  parentElement.style.position = 'relative';

  const target = handle || element;
  const targetStyle = target.style;

  if (canResize) {
    target.addEventListener('mousemove', event => {
      targetStyle.cursor =
        canResize && isOverLowerRight(event)
          ? 'se-resize'
          : getCursor(target, event.buttons > 0);
    });
  }

  target.addEventListener('mousedown', event => {
    // Only handle the left mouse button.
    if (event.buttons !== 1) return;

    // Only allow buttons and fields to be dragged if in the correct mode.
    const {tagName} = event.target;
    const mode = sessionStorage.getItem('mode');
    if (tagName === 'BUTTON' && mode !== 'Button') return;
    if (tagName === 'INPUT' && mode !== 'Field') return;

    if (targetStyle.cursor === 'grab') targetStyle.cursor = 'grabbing';

    const elementRect = element.getBoundingClientRect();

    // These values are the offsets from the mouse location
    // to the upper-left corner of the draggable element.
    const offsetX = event.clientX - elementRect.left;
    const offsetY = event.clientY - elementRect.top;

    // These values are the distances from the mouse location
    // to the lower-right corner of the draggable element.
    const resizeOffsetX = elementRect.width - offsetX;
    const resizeOffsetY = elementRect.height - offsetY;

    // These values are relative to the upper-left corner of the parent element.
    const parentRect = parentElement.getBoundingClientRect();
    const maxDragX = parentRect.width - elementRect.width;
    const maxDragY = parentRect.height - elementRect.height;
    const maxResizeX = parentRect.left + parentRect.width - resizeOffsetX;
    const maxResizeY = parentRect.top + parentRect.height - resizeOffsetY;

    // This function is defined inside the makeDraggable function
    // because it uses variables defined in that function.
    function onMouseMove(event) {
      cancelPendingClick();

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
      }

      if (isResizing) {
        // Don't allow the element to be resized outside its parent.
        if (event.clientX < maxResizeX && event.clientY < maxResizeY) {
          style.width =
            atLeast(event.clientX - left + resizeOffsetX, minWidth) + 'px';
          style.height =
            atLeast(event.clientY - top + resizeOffsetY, minHeight) + 'px';
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

        style.left = left + 'px';
        style.top = top + 'px';
      }

      wasDraggedOrMoved = true;
    }

    // This function is defined inside the makeDraggable function
    // because it refers to the onMouseMove function
    // which defined in makeDraggable.
    function onMouseUp() {
      //TODO: Send request to server to update
      // the position and size of the element.

      targetStyle.cursor = getCursor(target, false);
      isResizing = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  });
}

function getCursor(element, mouseDown) {
  const {tagName} = element;
  const mode = sessionStorage.getItem('mode');
  if (tagName === 'BUTTON' && mode !== 'Button') return 'pointer';
  if (tagName === 'INPUT' && mode !== 'Field') return 'text';
  return mouseDown ? 'grabbing' : 'grab';
}

async function newButton(event) {
  const {buttonId} = event.detail;

  // Create a new button.
  const button = document.createElement('button');
  button.id = 'button' + buttonId;
  button.classList.add('button');
  button.textContent = 'New Button';

  button.addEventListener('click', event => {
    event.stopPropagation();

    // This is some trickery to prevent double clicks
    // from also triggering this listener.
    // If there is already a pending click handler, ignore this click.
    if (timeoutId) return;

    timeoutId = setTimeout(() => {
      timeoutId = 0;
      const mode = sessionStorage.getItem('mode');
      if (mode === 'Browse') {
        const enabled = button.getAttribute('data-enabled');
        if (enabled === 'false') return;
        //TODO: Run the button script instead of calling alert.
        alert(`You clicked "${button.textContent}".`);
      } else if (mode === 'Button' || mode === 'Field') {
        if (wasDraggedOrMoved) {
          wasDraggedOrMoved = false;
          return;
        }

        button.classList.toggle('selected');
        selectedObject = button;
      }
    }, 200);
  });

  button.addEventListener('dblclick', async () => {
    cancelPendingClick();

    // Only open the "Button Info" dialog if in Button mode.
    const mode = sessionStorage.getItem('mode');
    if (mode !== 'Button') return;

    await htmx.ajax('GET', '/button-info-dialog/' + getButtonId(button), {
      target: 'main',
      swap: 'beforeend'
    });
    const dialog = document.getElementById('button-info-dialog');
    htmx.process(dialog);

    const input = dialog.querySelector('#buttonName');
    input.select(); // selects all the text so it is ready to be replaced

    dialog.style.display = 'flex';
    centerInParent(dialog);
    const titleBar = dialog.querySelector('basic-title-bar');
    makeDraggable({element: dialog, handle: titleBar});
    dialog.showModal();
  });

  button.addEventListener('keydown', event => {
    if (event.key === 'Backspace') {
      button.remove();
      event.stopPropagation();
    }
    // Allow other key events to propagate,
    // such as cmd-plus (Bring Closer) and cmd-minus (Send Farther).
  });

  // Add the button to the section.
  const dialog = await waitForElement(stackDialogSelector(currentStackName));
  const section = dialog.querySelector('section');
  section.appendChild(button);
  button.focus();

  makeDraggable({
    element: button,
    canResize: true,
    minWidth: 48,
    minHeight: 24
  });
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
  makeDraggable({element: dialog, handle: titleBar});

  dialog.addEventListener('click', selectStack);

  dialog.addEventListener('keydown', event => {
    const {ctrlKey, key, metaKey} = event;
    if ((metaKey || ctrlKey) && key === '-') {
      event.preventDefault(); // prevents browser zoom out
      sendFarther();
    } else if ((metaKey || ctrlKey) && key === '=') {
      event.preventDefault(); // prevents browser zoom in
      bringCloser();
    }
  });
}

function onCardSizeChange(event) {
  const cardSize = event.target.value;
  document.querySelector('#cardWidth').textContent = cardWidth[cardSize];
  document.querySelector('#cardHeight').textContent = cardHeight[cardSize];
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
  dialog.showModal();
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

async function popupSetup(button, style) {
  let contents = '';
  try {
    const res = await fetch('/button-contents/' + getButtonId(button));
    contents = (await res.text()).trim();
  } catch (e) {
    console.error(e);
    return;
  }

  const nextElement = button.nextElementSibling;

  if (style === 'Popup') {
    const id = 'popup' + getButtonId(button);
    let label;

    // If the popup container already exists, use it.
    if (nextElement?.classList.contains('popup-container')) {
      label = nextElement.querySelector('label');
    } else {
      // Create the popup container.
      label = document.createElement('label');
      const select = document.createElement('select');
      select.id = id;
      updatePopup(select, contents);

      const div = document.createElement('div');
      div.classList.add('popup-container');
      const divStyle = div.style;
      const bStyle = button.style;
      divStyle.left = bStyle.left;
      divStyle.top = bStyle.top;
      div.appendChild(label);
      div.appendChild(select);
      button.after(div);

      // If the popup container is double-clicked, trigger that event
      // on the button that is currently not displayed
      // which will open the "Button Info" dialog.
      div.addEventListener('dblclick', () => {
        button.dispatchEvent(new MouseEvent('dblclick'));
      });

      makeDraggable({element: div});
    }

    label.setAttribute('for', id);
    label.textContent = button.textContent;
  } else {
    // Remove the popup container if it exists.
    if (nextElement?.classList.contains('popup-container')) {
      nextElement.remove();
    }
  }
}

function radioButtonSetup(button, style, family) {
  const nextElement = button.nextElementSibling;

  if (style === 'Radio Button') {
    const id = `radioButton${getButtonId(button)}-${family}`;

    let input, label;

    // If the radio button container already exists, use it.
    if (nextElement?.classList.contains('radio-button-container')) {
      input = nextElement.querySelector('input');
      label = nextElement.querySelector('label');
    } else {
      // Create the radio button container.
      input = document.createElement('input');
      input.id = id;
      input.type = 'radio';

      label = document.createElement('label');

      const div = document.createElement('div');
      div.classList.add('radio-button-container');
      const divStyle = div.style;
      const bStyle = button.style;
      divStyle.left = bStyle.left;
      divStyle.top = bStyle.top;
      div.appendChild(input);
      div.appendChild(label);
      button.after(div);

      // If the radio button container is double-clicked, trigger that event
      // on the button that is currently not displayed
      // which will open the "Button Info" dialog.
      div.addEventListener('dblclick', () => {
        button.dispatchEvent(new MouseEvent('dblclick'));
      });

      makeDraggable({element: div});
    }

    const value = button.textContent;
    input.id = id;
    input.name = 'family' + family;
    input.value = value;
    label.setAttribute('for', id);
    label.textContent = value;
  } else {
    // Remove the radio button container if it exists.
    if (nextElement?.classList.contains('radio-button-container')) {
      nextElement.remove();
    }
  }
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
  sessionStorage.setItem('mode', 'Browse');

  menuBar = document.querySelector('menu-bar');
  document.body.addEventListener('click', () => menuBar.closeMenus());

  // Make all dialogs with a title bar be draggable by its title bar.
  const dialogs = document.querySelectorAll('.dialog-with-title-bar');
  for (const dialog of dialogs) {
    const titleBar = dialog.querySelector('basic-title-bar');
    makeDraggable({element: dialog, handle: titleBar});
  }

  // Simulate user events to take some initial actions in the UI.
  // This is useful for debugging.
  menuBar.selectMenuItem('New Stack...');
  const dialog = await waitForElement('#new-stack-dialog');
  const stackName = 'Demo';
  dialog.querySelector('#name').value = stackName;
  dialog.querySelector('#saveBtn').click();
  await waitForElement(stackDialogSelector(stackName));
  menuBar.selectMenuItem('New Button');

  document.addEventListener('tool-selected', event => {
    const tool = event.detail;
    console.log('script.js: tool selected is', tool);
    const parts = tool.split(' ');
    if (parts[1] === 'mode') {
      const mode = parts[0];
      sessionStorage.setItem('mode', mode);

      // Change the cursor for all buttons and fields in the current stack.
      const buttonCursor = mode === 'Button' ? 'grab' : 'pointer';
      const fieldCursor = mode === 'Field' ? 'grab' : 'text';
      for (const card of stack.cards) {
        for (const button of card.buttons) {
          button.style.cursor = buttonCursor;
        }
        for (const field of card.fields) {
          field.style.cursor = fieldCursor;
        }
      }
    }
  });

  setupFinished = true;
}

function sendFarther() {
  const zIndex = Number(selectedObject.style.zIndex);
  if (zIndex > 0) {
    selectedObject.style.zIndex = zIndex - 1;
    htmx.ajax('POST', '/send-farther/' + getButtonId(selectedObject));
  }
}

async function setupContentsDialog(id, contents) {
  const select = await waitForElement('#popup' + id);
  updatePopup(select, contents);

  const dialog = await waitForElement('#button-contents-dialog-' + id);
  htmx.process(dialog);
  const handle = dialog.querySelector('basic-title-bar');
  makeDraggable({element: dialog, handle});

  dialog.style.display = 'flex';
  centerInParent(dialog);
  dialog.showModal();
}

async function setupScriptDialog(id) {
  const dialog = await waitForElement('#script-dialog-' + id);
  const handle = dialog.querySelector('fancy-title-bar');
  makeDraggable({element: dialog, handle});

  dialog.style.display = 'flex';
  centerInParent(dialog);
  dialog.show();

  let dirty = false;

  const textarea = dialog.querySelector('textarea');
  const lengthDiv = dialog.querySelector('#length');
  textarea.addEventListener('input', () => {
    lengthDiv.textContent = textarea.value.length;
    dirty = true;
  });

  dialog.addEventListener('keydown', event => {
    if (event.key === 's' && (event.ctrlKey || event.metaKey)) {
      event.stopPropagation();
      event.preventDefault();
      //TODO: Save script in database.
      dirty = false;
    }
  });

  //TODO: If the user tries to close the dialog and dirty is true,
  // prompt them to save the script.
}

const stackDialogSelector = stackName => '#stack-' + stackName;

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

function updatePopup(select, contents) {
  // Delete all the current options.
  select.innerHTML = '';

  // Add the new options.
  for (const optionText of contents.split('\n')) {
    const option = document.createElement('option');
    option.textContent = optionText;
    select.appendChild(option);
  }
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
