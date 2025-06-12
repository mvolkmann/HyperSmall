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

let isDragging = false;

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
  if (!handle) handle = element;

  handle.addEventListener('mousedown', event => {
    const rect = handle.getBoundingClientRect();
    let offsetX = event.clientX - rect.left;
    let offsetY = event.clientY - rect.top + rect.height;

    function onMouseMove(event) {
      const left = Math.max(0, event.clientX - offsetX);
      const top = Math.max(0, event.clientY - offsetY);
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

function newStack(dialogDescendant) {
  closeDialog(dialogDescendant);
  /*
  const dialog = document.createElement('dialog');
  dialog.style.width = '600px';
  dialog.style.height = '400px';
  document.body.appendChild(dialog);
  //TODO: Add title bar and event handling to enable dragging.
  dialog.show();
  */
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

function openNewStack(event) {
  const dialogId = event.detail.value;
  requestAnimationFrame(() => {
    const dialog = document.getElementById(dialogId);
    dialog.show();

    const titleBar = dialog.querySelector('.titleBar');
    makeDraggable(dialog, titleBar);
  });
}

function playClick() {
  if (!clickAudio) clickAudio = new Audio('sounds/click.mp3');
  clickAudio.play();
}

function replaceStack() {
  alert('replaceStack called');
}

function updateTime() {
  const div = document.getElementById('time');
  div.textContent = new Date().toLocaleTimeString(navigator.language, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}
