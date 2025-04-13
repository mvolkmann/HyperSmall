let menus;

function closeMenus() {
  for (const menu of menus) {
    const menuItems = menu.querySelector(".menuItems");
    menuItems.style.display = "none";
  }
}

function configureMenus() {
  menus = document.querySelectorAll(".menu");
  for (const menu of menus) {
    menu.addEventListener("click", onMenuClick);

    const button = menu.querySelector("button");
    button.addEventListener("click", onMenuItemClick);
  }
}

function onMenuClick(event) {
  alert("That is not implemented yet.");
  closeMenus();
}

function onMenuItemClick(event) {
  event.stopPropagation();

  const button = event.target;
  const menu = button.parentElement;
  const menuItems = menu.querySelector(".menuItems");
  const style = menuItems.style;

  const visible = style.display === "flex";
  if (!visible) closeMenus();

  // Toggle the visibility of the clicked menu.
  style.display = visible ? "none" : "flex";
}
