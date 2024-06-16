import { getAllData } from "./index.js";
import { openPopupGetCode } from "./getcode.js";

const popupSeance = document.querySelector(".popup__seance");
const btnLogin = document.querySelector(".client__header__login");
const datesInHeades = document.querySelector(".client__header__dates");
const mainBlock = document.querySelector("main");
const btnCancelPopup = document.querySelector(".seanse__btn__cancel");

export function openPopupSeance(seanceInHall, filmHall, film) {
  if (!seanceInHall.classList.contains("film__hall__seance__not-available")) {
    popupSeance.classList.remove("hidden");
    btnLogin.classList.add("hidden");
    datesInHeades.classList.add("hidden");
    mainBlock.classList.add("hidden");
    createInfoSeance(seanceInHall, filmHall, film);
  }
}

btnCancelPopup.addEventListener("click", () => {
  popupSeance.classList.add("hidden");
  btnLogin.classList.remove("hidden");
  datesInHeades.classList.remove("hidden");
  mainBlock.classList.remove("hidden");
});

function createInfoSeance(seanceInHall, filmHall, film) {
  const filmName = document.querySelector(".seance__film-name");
  const seanceTime = document.querySelector(".seance__time");
  const hallName = document.querySelector(".seance__hall-name");
  const seanceDate = document.querySelector(".seance__data");
  const currentData = document.querySelector(".client__header__data__active");
  const standartCost = document.querySelector(".seance__seat__standart-cost");
  const vipCost = document.querySelector(".seance__seat__vip-cost");

  seanceDate.textContent = `Дата: ${currentData.dataset.date}`;
  hallName.textContent = filmHall.dataset.hallname;
  seanceTime.textContent = `Начало сеанса: ${seanceInHall.dataset.time}`;
  filmName.textContent = film.dataset.name;
  standartCost.textContent = `${filmHall.dataset.standartcost}`;
  vipCost.textContent = `${filmHall.dataset.vipcost}`;

  createHallScheme(seanceInHall.dataset.id, currentData.dataset.date, filmHall);
}

function getHallConfig(seanceId, date) {
  return fetch(
    `https://shfe-diplom.neto-server.ru/hallconfig?seanceId=${seanceId}&date=${date}`
  )
    .then((response) => response.json())
    .then((data) => {
      return data;
    });
}

function createHallScheme(seanceId, currentData, filmHall) {
  const date = getDateForFech(currentData);
  const hallSchemeContainer = document.querySelector(".seance__hall-scheme");
  const btnReserve = document.querySelector(".seanse__btn__reserve");
  hallSchemeContainer.innerHTML = "";

  getHallConfig(seanceId, date).then((data) => {
    const hallScheme = data.result;

    for (let i = 0; i < hallScheme.length; i++) {
      const row = document.createElement("div");
      row.classList.add("seance__hall-scheme__row");

      for (let j = 0; j < hallScheme[i].length; j++) {
        const seat = document.createElement("div");
        seat.classList.add("seance__seat");
        seat.setAttribute("data-row", i + 1);
        seat.setAttribute("data-place", j + 1);
        seat.setAttribute("data-type", hallScheme[i][j]);
        seat.classList.add(`${hallScheme[i][j]}`);

        seat.addEventListener("click", () => {
          choosePlace(seat);
        });

        row.appendChild(seat);
      }

      hallSchemeContainer.appendChild(row);
    }
    btnReserve.addEventListener("click", () => {
      reserveSeance(seanceId, date, hallSchemeContainer, filmHall);
    });
  });
}

function choosePlace(seat) {
  if (seat.dataset.type !== "taken" && seat.dataset.type !== "disabled") {
    seat.classList.toggle("color__seats-selected");
  }
}

export function getDateForFech(date) {
  const year = date.slice(6);
  const mounth = date.slice(3, 5);
  const day = date.slice(0, 2);
  return `${year}-${mounth}-${day}`;
}

function reserveSeance(seanceId, date, hallSchemeContainer, filmHall) {
  const hallId = filmHall.dataset.id;
  const arrayOfSeats = [];
  const allRows = hallSchemeContainer.children;

  if (hallSchemeContainer.querySelector(".color__seats-selected") === null) {
    alert("Выберете места");
    return;
  }

  getAllData().then((data) => {
    const allHalls = data.result.halls;

    for (let i = 0; i < allRows.length; i++) {
      const seatsInRow = Array.from(
        allRows[i].querySelectorAll(".seance__seat")
      );

      for (let j = 0; j < seatsInRow.length; j++) {
        if (seatsInRow[j].classList.contains("color__seats-selected")) {
          const rowNumber = seatsInRow[j].dataset.row;
          const placeNumber = seatsInRow[j].dataset.place;
          const seatType = seatsInRow[j].dataset.type;
          const seatCost = allHalls.find((hall) => hall.id == hallId)[
            `hall_price_${seatType}`
          ];

          arrayOfSeats.push({
            row: +rowNumber,
            place: +placeNumber,
            coast: seatCost,
          });
        }
      }
    }

    openPopupGetCode(seanceId, date, arrayOfSeats, data);
  });
}
