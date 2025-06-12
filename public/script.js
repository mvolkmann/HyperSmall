let clickAudio;
let menus;
let menuOpen;

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

let currentStackName = '';
let isDragging = false;
let titleBarHeight = 0;

setInterval(updateTime, 60000);

function closeDialog(element) {
  element.closest('dialog').close();
}

function closeMenus() {
  for (const menu of menus) {
    const button = menu.querySelector('button');
    button.classList.remove('selected');

    const menuItems = menu.querySelector('.menuItems');
    menuItems.style.display = 'none';
  }
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

function makeDraggable(element, handle) {
  console.log('script.js makeDraggable: element =', element);
  element.style.position = 'absolute';
  const mainElement = document.body.querySelector('main');
  const mainRect = mainElement.getBoundingClientRect();

  const target = handle || element;
  target.addEventListener('mousedown', event => {
    const elementRect = element.getBoundingClientRect();
    let offsetX = event.clientX - elementRect.left;
    let offsetY = event.clientY - elementRect.top;
    //if (handle) offsetY += handle.getBoundingClientRect().height;
    offsetY += titleBarHeight;

    let maxX = mainRect.width - elementRect.width;
    let maxY = mainRect.height - elementRect.height;

    function onMouseMove(event) {
      const left = Math.max(0, Math.min(maxX, event.clientX - offsetX));
      const top = Math.max(0, Math.min(maxY, event.clientY - offsetY));
      element.style.left = left + 'px';
      element.style.top = top + 'px';
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener(
      'mouseup',
      () => {
        document.removeEventListener('mousemove', onMouseMove);
      },
      {once: true}
    );
  });
}

function newButton() {
  const button = document.createElement('button');
  button.textContent = 'Click Me';
  button.addEventListener('click', () => alert('Got Click!'));
  console.log('script.js newButton: currentStackName =', currentStackName);
  const dialog = document.getElementById('dialog-' + currentStackName);
  console.log('script.js newButton: dialog =', dialog);
  dialog.appendChild(button);
  makeDraggable(button);
}

function newStack(event) {
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

    const titleBar = dialog.querySelector('.titleBar');
    titleBarHeight = titleBar.getBoundingClientRect().height;
    makeDraggable(dialog, titleBar);

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

  menuOpen = true;

  const button = event.target;
  const menu = button.parentElement;
  const menuItems = menu.querySelector('.menuItems');
  const style = menuItems.style;

  const visible = style.display === 'flex';
  if (visible) {
    style.display = 'none';
  } else {
    closeMenus();
    style.display = 'flex';
    requestAnimationFrame(() => {
      style.width = 'fit-content';
    });
  }

  button.classList.toggle('selected');
}

function onMenuHover(event) {
  if (menuOpen) onMenuClick(event);
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
  if (!clickAudio) clickAudio = new Audio('sounds/click.mp3');
  clickAudio.play();
}

function replaceStack() {
  alert('replaceStack called');
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

function updateTime() {
  const div = document.getElementById('time');
  div.textContent = new Date().toLocaleTimeString(navigator.language, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}
