let clickAudio;
let menus;

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
  menus = document.querySelectorAll(".menu");
  for (const menu of menus) {
    const button = menu.querySelector("button");
    button.addEventListener("click", onMenuClick);
    menu.addEventListener("click", onMenuItemClick);
  }
}

function newStack() {
  console.log("script.js newStack: entered");
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

function playClick() {
  if (!clickAudio) clickAudio = new Audio("sounds/click.mp3");
  clickAudio.play();
}
