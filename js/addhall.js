import { getAllHalls } from "./adminsettings.js";

const url = "https://shfe-diplom.neto-server.ru";
const btnAddHall = document.querySelector(".add-hall__btn");
const popupAddHall = document.querySelector(".popup__add-hall");
const adminPageSettings = document.querySelector(".admin");
const popupClose = document.querySelector(".popup__close");
const popupCancellation = document.querySelector(".popup__form__cancellation");
const popupBtnAddHall = document.querySelector(".popup__btn-add-hall");

btnAddHall.addEventListener("click", () => {
  popupAddHall.classList.add("popup__add-hall-active");
  adminPageSettings.classList.add("admin__black");
});

popupClose.addEventListener("click", closePopup);
popupCancellation.addEventListener("click", closePopup);

function closePopup() {
  const parentPopup = popupClose.closest(".popup");
  parentPopup.classList.remove("popup__add-hall-active");
  adminPageSettings.classList.remove("admin__black");
}

popupBtnAddHall.addEventListener("click", (e) => {
  e.preventDefault();
  const hallName = document.querySelector(
    ".popup__form__input__add-hall"
  ).value;
  fetchAddHall(hallName);
});

async function fetchAddHall(name) {
  const params = new FormData();
  params.set("hallName", name);
  await fetch(`${url}/hall`, {
    method: "POST",
    body: params,
  })
    .then((response) => response.json())
    .then((data) => console.log(data));

  await getAllHalls();
}
