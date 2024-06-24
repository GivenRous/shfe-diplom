import { getDateForFech } from "./seance.js";

const url = "https://shfe-diplom.neto-server.ru";
const popupTicket = document.querySelector(".popup__ticket");
const popupGetCode = document.querySelector(".popup__get-code");
const btnTicketCancel = document.querySelector(".ticket__btn__cancel");

export function createTicket(
  filmName,
  seats,
  hallName,
  date,
  time,
  seanceId,
  arrayOfSeats
) {
  fetchTicket(seanceId, date, arrayOfSeats);

  popupTicket.classList.remove("hidden");
  popupGetCode.classList.add("hidden");

  const filmNameSpan = document.querySelector(".ticket__film-name");
  filmNameSpan.textContent = filmName;
  const seatsSpan = document.querySelector(".ticket__seats");
  seatsSpan.textContent = seats;
  const hallNameSpan = document.querySelector(".ticket__hall");
  hallNameSpan.textContent = hallName;
  const dateSpan = document.querySelector(".ticket__date");
  dateSpan.textContent = date;
  const timeSpan = document.querySelector(".ticket__time");
  timeSpan.textContent = time;

  createQRCode(date, time, filmName, hallName, arrayOfSeats);
}

function fetchTicket(seanceId, date, seats) {
  const correctDate = getDateForFech(date);
  const params = new FormData();
  params.set("seanceId", seanceId);
  params.set("ticketDate", correctDate);
  params.set("tickets", JSON.stringify(seats));

  fetch(`${url}/ticket`, {
    method: "POST",
    body: params,
  })
    .then((response) => response.json())
    .then((data) => console.log(data));
}

function createQRCode(date, time, filmName, hallName, arrayOfSeats) {
  const codeDiv = document.querySelector(".popup__ticket__code");
  codeDiv.innerHTML = "";
  const seatsInfo = getRowSeatsCoast(arrayOfSeats);
  const ticketInfo = `Ваш электронный билет. Дата: ${date}. Время: ${time}. Фильм: ${filmName}. Зал: ${hallName}. ${seatsInfo} Билет действителен строго на свой сеанс`;
  const qrcode = QRCreator(ticketInfo, { image: "png", modsize: 2 });
  const content = (qrcode) => {
    return qrcode.error
      ? `недопустимые исходные данные ${qrcode.error}`
      : qrcode.result;
  };
  codeDiv.append(content(qrcode));
}

function getRowSeatsCoast(arr) {
  let info = "";
  arr.map((el) => {
    info += `Ряд ${el.row}, Место ${el.place}, Цена ${el.coast}. `;
  });
  return info;
}

btnTicketCancel.addEventListener("click", () => {
  location.reload();
});
