let clickAudio;
let menus;
let menuOpen;

setInterval(updateTime, 60000);

const handlers = {
  "New Stack...": newStack,
};

function closeMenus() {
  for (const menu of menus) {
    const button = menu.querySelector("button");
    button.classList.remove("selected");

    const menuItems = menu.querySelector(".menuItems");
    menuItems.style.display = "none";
  }
}

function configureMenus() {
  document.body.addEventListener("click", closeMenus);
  menus = document.querySelectorAll(".menu");
  for (const menu of menus) {
    const button = menu.querySelector("button");
    button.addEventListener("click", onMenuClick);
    button.addEventListener("mouseover", onMenuHover);
    menu.addEventListener("click", onMenuItemClick);
  }
}

function newStack() {
  const dialog = document.getElementById("newStackDialog");
  dialog.show(); // or showModal()
}

function onMenuItemClick(event) {
  playClick();
  closeMenus();

  const button = event.target;
  const handler = handlers[button.textContent];
  if (handler) {
    handler();
  } else {
    requestAnimationFrame(() => {
      alert("That is not implemented yet.");
    });
  }
}

function onMenuClick(event) {
  event.stopPropagation();

  playClick();

  menuOpen = true;

  const button = event.target;
  const menu = button.parentElement;
  const menuItems = menu.querySelector(".menuItems");
  const style = menuItems.style;

  const visible = style.display === "flex";
  if (visible) {
    style.display = "none";
  } else {
    closeMenus();
    style.display = "flex";
    requestAnimationFrame(() => {
      style.width = "fit-content";
    });
  }

  button.classList.toggle("selected");
}

function onMenuHover(event) {
  if (menuOpen) onMenuClick(event);
}

function playClick() {
  if (!clickAudio) clickAudio = new Audio("sounds/click.mp3");
  clickAudio.play();
}

function updateTime() {
  const div = document.getElementById("time");
  div.textContent = new Date().toLocaleTimeString(navigator.language, {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}
