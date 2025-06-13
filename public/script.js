let clickAudio;
let currentStackName = '';
let isDragging = false;
let openMenu;
let menus;

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
  dialog.close();
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
  //document.body.addEventListener('click', closeMenus);
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

function makeDraggable(element, handle) {
  element.style.position = 'absolute';
  const {parentElement} = element;
  parentElement.style.position = 'relative';
  const parentRect = parentElement.getBoundingClientRect();

  const target = handle || element;
  target.addEventListener('mousedown', event => {
    const elementRect = element.getBoundingClientRect();
    let offsetX = parentRect.left + event.clientX - elementRect.left;
    let offsetY = parentRect.top + event.clientY - elementRect.top;
    let maxX = parentRect.width - elementRect.width;
    let maxY = parentRect.height - elementRect.height;

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
  // Create a new button.
  const button = document.createElement('button');
  button.classList.add('button');
  button.classList.add('selected');
  button.textContent = 'New Button';
  button.addEventListener('click', event => {
    if (!isDragging) {
      button.classList.toggle('selected');
      event.stopPropagation();
    }
  });

  // Add the button to the section.
  const dialog = document.getElementById('dialog-' + currentStackName);
  const section = dialog.querySelector('section');
  section.appendChild(button);

  makeDraggable(button);
  centerInParent(button);
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

    const section = dialog.querySelector('section');
    section.addEventListener('click', () => deselectAll(section));

    const titleBar = dialog.querySelector('.title-bar');
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
