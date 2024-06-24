import { openPopupSeance } from "./seance.js";

const url = "https://shfe-diplom.neto-server.ru";
const allDates = Array.from(document.querySelectorAll(".client__header__data"));
const loginBtn = document.getElementById("btn-login");

allDates.map((data, index) => {
  data.addEventListener("click", () => changeActiveData(index));
});

function changeActiveData(index) {
  if (!allDates[index].classList.contains("client__header__data__active")) {
    allDates[index].classList.add("client__header__data__active");
  }
  allDates.map((el, i, arr) => {
    if (i !== index) {
      arr[i].classList.remove("client__header__data__active");
    }
  });
  createAllFilms();
}

loginBtn.addEventListener("click", () => {
  window.location.href = "admin.html";
});

const daysOfWeek = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
const datesContainer = document.querySelector(".client__header__dates");
const dataBlocks = datesContainer.querySelectorAll(".client__header__data");

function fillDates() {
  const currentDate = new Date();

  dataBlocks[0].querySelector(".day-of-the-week").textContent = "Сегодня";
  dataBlocks[0].querySelector(".data-of-mounth").textContent =
    daysOfWeek[currentDate.getDay()] + ", " + currentDate.getDate();
  isHoliday(daysOfWeek[currentDate.getDay()], dataBlocks[0]);
  dataBlocks[0].dataset.date = getCorrectDate(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    currentDate.getDate()
  );

  for (let i = 1; i < dataBlocks.length; i++) {
    const date = new Date(currentDate.getTime() + i * 24 * 60 * 60 * 1000);
    dataBlocks[i].querySelector(".day-of-the-week").textContent =
      daysOfWeek[date.getDay()] + ",";
    dataBlocks[i].querySelector(".data-of-mounth").textContent = date.getDate();

    isHoliday(daysOfWeek[date.getDay()], dataBlocks[i]);
    dataBlocks[i].dataset.date = getCorrectDate(
      date.getFullYear(),
      date.getMonth() + 1,
      date.getDate()
    );
  }
}

function getCorrectDate(year, mounth, date) {
  const correctMounth = mounth > 9 ? mounth : `0${mounth}`;
  const correctDate = date > 9 ? date : `0${date}`;
  return `${correctDate}.${correctMounth}.${year}`;
}

fillDates();

function isHoliday(day, block) {
  if (day === "Сб" || day === "Вс") {
    block.classList.add("holiday");
  }
}

const allFilmsContainer = document.querySelector(".all-films");

export function getAllData() {
  return fetch(`${url}/alldata`)
    .then((response) => response.json())
    .then((data) => {
      return data;
    });
}

function checkData() {
  getAllData().then((data) => {
    console.log(data);
  });
}

checkData();

function createAllFilms() {
  allFilmsContainer.innerHTML = "";
  getAllData().then((data) => {
    const allFilms = data.result.films;
    const allHalls = data.result.halls;
    const allSeances = data.result.seances;

    const filmsWithSeances = allFilms.filter((el) => {
      return allSeances.find((seance) => {
        return (
          seance.seance_filmid == el.id &&
          allHalls.find((hall) => {
            return hall.id == seance.seance_hallid;
          }).hall_open
        );
      });
    });

    filmsWithSeances.map((el) => {
      const film = document.createElement("section");
      film.classList.add("film");
      film.dataset.id = el.id;
      film.dataset.name = el.film_name;
      film.innerHTML = `<div class="film__poster-and-description">
  <img src=${el.film_poster} alt="film poster" class="film__poster">
  <div class="film__description">
      <h2 class="film__name">${el.film_name}</h2>
      <span class="film__about">${el.film_description}</span>
      <span class="film__duration-and-origin">${el.film_duration} минут ${el.film_origin}</span>
  </div>
  </div>`;
      allFilmsContainer.insertAdjacentElement("beforeEnd", film);
      createHallsForFilm(allHalls, allSeances, film);
    });
  });
}

function createHallsForFilm(allHalls, allSeances, film) {
  const hallsContainer = document.createElement("div");
  hallsContainer.classList.add("film__all-halls");

  const uniqueHalls = [];
  allSeances.map((seance) => {
    if (
      seance.seance_filmid == film.dataset.id &&
      !uniqueHalls.includes(seance.seance_hallid) &&
      allHalls.find((el) => el.id == seance.seance_hallid).hall_open == 1
    ) {
      uniqueHalls.push(seance.seance_hallid);
      const filmHall = document.createElement("div");
      filmHall.classList.add("film__hall");
      filmHall.dataset.id = seance.seance_hallid;
      const hallName = allHalls.find(
        (el) => el.id == seance.seance_hallid
      ).hall_name;
      const hallStandartCost = allHalls.find(
        (el) => el.id == seance.seance_hallid
      ).hall_price_standart;
      const hallVipCost = allHalls.find(
        (el) => el.id == seance.seance_hallid
      ).hall_price_vip;

      filmHall.innerHTML = `<span class="hall__name">${hallName}</span>`;
      filmHall.dataset.hallname = hallName;
      filmHall.dataset.standartcost = hallStandartCost;
      filmHall.dataset.vipcost = hallVipCost;
      hallsContainer.insertAdjacentElement("beforeend", filmHall);
      createSeancesForHall(filmHall, allSeances, film);
    }
  });

  film.insertAdjacentElement("beforeend", hallsContainer);
}

function createSeancesForHall(filmHall, allSeances, film) {
  const allSeancesInHall = document.createElement("ul");
  allSeancesInHall.classList.add("film__hall__all-seances");
  const filmId = film.dataset.id;
  const hallId = filmHall.dataset.id;
  allSeances.map((seance) => {
    if (seance.seance_hallid == hallId && seance.seance_filmid == filmId) {
      const seanceInHall = document.createElement("li");
      seanceInHall.classList.add("film__hall__seance");
      seanceInHall.dataset.id = seance.id;
      seanceInHall.dataset.time = seance.seance_time;
      seanceInHall.innerHTML = `<a>${seance.seance_time}</a>`;
      isAvailableSeance(seanceInHall, seance.seance_time);
      seanceInHall.addEventListener("click", () =>
        openPopupSeance(seanceInHall, filmHall, film)
      );
      allSeancesInHall.insertAdjacentElement("beforeend", seanceInHall);
    }
  });

  filmHall.insertAdjacentElement("beforeend", allSeancesInHall);
}

function isAvailableSeance(seance, seanceTime) {
  const datesInHeader = document.querySelector(".client__header__dates");
  const isToday = datesInHeader.children[0].classList.contains(
    "client__header__data__active"
  );
  const now = new Date();
  const [hours, minutes] = seanceTime.split(":");
  const seanceDate = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    hours,
    minutes
  );

  if (now >= seanceDate && isToday) {
    seance.classList.add("film__hall__seance__not-available");
    seance.disabled = true;
  }
}

createAllFilms();
