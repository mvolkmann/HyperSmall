let menus;

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

function onMenuItemClick(event) {
  playClick();
  closeMenus();
  setTimeout(() => {
    alert("That is not implemented yet.");
  }, 100);
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
    setTimeout(() => {
      style.width = "fit-contents";
    }, 100);
  }

  button.classList.toggle("selected");
}

function playClick() {
  const audio = new Audio("sounds/click.mp3");
  audio.play();
}
