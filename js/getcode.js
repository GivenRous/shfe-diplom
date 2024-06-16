import { createTicket } from "./getticket.js";

const popupSeance = document.querySelector(".popup__seance");
const popupGetCode = document.querySelector(".popup__get-code");
const btnCancelPopup = document.querySelector(".get-code__btn__cancel");
const btnGetCode = document.querySelector(".get-code__btn");

export function openPopupGetCode(seanceId, date, arrayOfSeats, data) {
  popupSeance.classList.add("hidden");
  popupGetCode.classList.remove("hidden");
  createPopupGetCodeInfo(seanceId, arrayOfSeats, data);
}

btnCancelPopup.addEventListener("click", () => {
  popupSeance.classList.remove("hidden");
  popupGetCode.classList.add("hidden");
});

function createPopupGetCodeInfo(seanceId, arrayOfSeats, data) {
  const allFilms = data.result.films;
  const currentSeance = data.result.seances.find((el) => el.id == seanceId);
  const allHalls = data.result.halls;
  const filmId = currentSeance.seance_filmid;
  const hallId = currentSeance.seance_hallid;

  const filmNameSpan = document.querySelector(".description__film-name");
  filmNameSpan.textContent = `${
    allFilms.find((el) => el.id == filmId).film_name
  }`;
  const hallNameSpan = document.querySelector(".description__hall");
  hallNameSpan.textContent = `${
    allHalls.find((el) => el.id == hallId).hall_name
  }`;
  const timeSpan = document.querySelector(".description__time");
  timeSpan.textContent = `${currentSeance.seance_time}`;

  const seatsSpan = document.querySelector(".description__seats");
  seatsSpan.textContent = `${getStrOfPlaces(arrayOfSeats)}`;

  const coastSpan = document.querySelector(".description__coast");
  coastSpan.textContent = `${getCoast(arrayOfSeats)}`;

  const dateSpan = document.querySelector(".description__date");
  const currentData = document.querySelector(".client__header__data__active");
  dateSpan.textContent = `${currentData.dataset.date}`;

  btnGetCode.addEventListener("click", () =>
    createTicket(
      filmNameSpan.textContent,
      seatsSpan.textContent,
      hallNameSpan.textContent,
      dateSpan.textContent,
      timeSpan.textContent,
      seanceId,
      arrayOfSeats
    )
  );
}

function getStrOfPlaces(arr) {
  let string = "";
  arr.map((el) => {
    string += `${el.row}/${el.place}, `;
  });

  return string.slice(0, -2);
}

function getCoast(arr) {
  let coast = 0;
  console.log(arr);
  arr.map((el) => {
    coast += el.coast;
  });
  return coast;
}
