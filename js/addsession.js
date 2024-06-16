import { getAllData, createAllSeances } from "./adminsettings.js";

const popupAddSession = document.querySelector(".popup__add-session");
const adminPageSettings = document.querySelector(".admin");
const popupClose = document.querySelector(".popup__add-session__close");
const popupCancellation = document.querySelector(
  ".popup__form-session__cancellation"
);
const popupBtnAddSession = document.querySelector(".popup__btn-add-session");
const selectFilms = document.querySelector(".popup__form__select__films");
const selectHalls = document.querySelector(".popup__form__select__halls");
const inputTime = document.querySelector(".popup__form__input__time");

export function openSessionPopup(filmId, sessionId) {
  popupAddSession.classList.add("popup__add-session-active");
  popupAddSession.style.top = `${document.documentElement.scrollTop + 60}px`;
  adminPageSettings.classList.add("admin__black");
  addOptions(filmId, sessionId);
}

popupClose.addEventListener("click", closePopup);
popupCancellation.addEventListener("click", closePopup);

function closePopup() {
  const parentPopup = popupClose.closest(".popup");
  parentPopup.classList.remove("popup__add-session-active");
  adminPageSettings.classList.remove("admin__black");
}

function addOptions(filmId, sessionId) {
  selectFilms.innerHTML = "";
  selectHalls.innerHTML = "";
  const films = Array.from(document.querySelectorAll(".film"));
  films.map((el) => {
    const optionFilm = document.createElement("option");
    optionFilm.dataset.id = el.dataset.id;
    optionFilm.textContent = `${el.dataset.name}`;
    if (el.dataset.id === filmId) {
      optionFilm.selected = true;
    }
    selectFilms.insertAdjacentElement("beforeend", optionFilm);
  });

  const sessionSchemes = Array.from(
    document.querySelectorAll(".session__scheme")
  );
  sessionSchemes.map((el) => {
    const optionHall = document.createElement("option");
    optionHall.dataset.id = el.dataset.id;
    optionHall.textContent = `${el.previousSibling.textContent}`;
    if (el.dataset.id === sessionId) {
      optionHall.selected = true;
    }
    selectHalls.insertAdjacentElement("beforeend", optionHall);
  });
}

popupBtnAddSession.addEventListener("click", (e) => {
  e.preventDefault();
  const hallId = Array.from(selectHalls.children).find(
    (el) => el.textContent === selectHalls.value
  ).dataset.id;
  const filmId = Array.from(selectFilms.children).find(
    (el) => el.textContent === selectFilms.value
  ).dataset.id;
  const time = inputTime.value;
  fetchAddSession(hallId, filmId, time);
});

async function fetchAddSession(hallId, filmId, time) {
  let isCorrect = await isCorrectTime(time, filmId, hallId).then((data) => {
    return data;
  });
  if (isCorrect) {
    const params = new FormData();
    params.set("seanceHallid", hallId);
    params.set("seanceFilmid", filmId);
    params.set("seanceTime", time);

    let response = await fetch("https://shfe-diplom.neto-server.ru/seance", {
      method: "POST",
      body: params,
    });
    let data = await response.json();
    if (!data.success) {
      alert(data.error);
    }
    createAllSeances();
    location.reload();
  }
}

async function isCorrectTime(time, filmId, hallId) {
  if (!time) {
    alert("Укажите время начала фильма");
    return false;
  }
  const allFilms = Array.from(document.querySelectorAll(".film"));
  const filmDuration = +allFilms.find((el) => el.dataset.id === filmId).dataset
    .duration;
  const midnight = 1439;
  const filmStart = getMinutes(time);
  const filmEnd = filmStart + filmDuration;

  if (filmEnd > midnight) {
    alert("Фильм не должен заканчиваться позже 23:59");
    return false;
  }

  const data = await getAllData();
  const allSeances = data.result.seances;
  let isCorrect = true;
  for (const el of allSeances) {
    if (el.seance_hallid == hallId) {
      const anotherFilmDuration = +allFilms.find(
        (film) => film.dataset.id == el.seance_filmid
      ).dataset.duration;
      const anotherFilmStart = getMinutes(el.seance_time);
      if (
        filmStart < anotherFilmStart + anotherFilmDuration &&
        filmEnd > anotherFilmStart
      ) {
        alert("Фильмы в расписании не должны пересекаться");
        isCorrect = false;
        break;
      }
    }
  }
  return isCorrect;
}

export function getMinutes(time) {
  return +time.slice(0, 2) * 60 + +time.slice(3);
}
