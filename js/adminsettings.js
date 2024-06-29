import { getMinutes, openSessionPopup } from "./addsession.js";

const url = "https://shfe-diplom.neto-server.ru";
const allHalls = document.querySelector(".all-halls");

let allData;

export async function getAllData() {
  if (allData) {
    return allData;
  } else {
    const request = await fetch(`${url}/alldata`)
      .then((response) => response.json())
      .then((data) => {
        allData = data;
      });
    return allData;
  }
}

export async function getAllHalls() {
  allHalls.innerHTML = "";
  const data = await getAllData();
  console.log(data);
  createAllHalls(data);
  createHallsForSelection(data.result.halls);
  createHallsForChangePrice(data.result.halls);
  createAllSession();
  createHallsForSales(data.result.halls);
  createAllFilms(data.result.films);
}

getAllHalls();

function createAllHalls(data) {
  let halls = data.result.halls;
  halls.map((el) => {
    let hall = document.createElement("li");
    hall.id = `hall-${el.id}`;
    hall.innerHTML = `<span>- ${el.hall_name}</span>`;

    let basket = document.createElement("img");
    basket.src = "img/basket.png";
    basket.className = "basket";
    basket.addEventListener("click", () =>
      deleteHall(basket.parentElement, el.id)
    );

    hall.insertAdjacentElement("beforeend", basket);

    allHalls.insertAdjacentElement("beforeend", hall);
  });
}

async function deleteHall(el, id) {
  el.remove();
  await fetch(`${url}/hall/${id}`, {
    method: "DELETE",
  })
    .then((response) => response.json())
    .then((data) => {
      createHallsForChangePrice(data.result.halls);
      createHallsForSales(data.result.halls);
      createHallsForSelection(data.result.halls);
    });
  await createAllSession();
  location.reload();
}

const allHallsForSelection = document.querySelector(
  ".hall-configuration__all-halls"
);
let activeHallId;

async function createHallsForSelection(halls) {
  const data = await getAllData();
  const allHalls = halls || data.result.halls;
  allHallsForSelection.innerHTML = "";
  allHalls.map((el) => {
    const hall = document.createElement("div");
    hall.textContent = el.hall_name;
    hall.classList.add("hall-configuration__selection");
    hall.id = `selection-hall-${el.id}`;
    hall.addEventListener("click", () => changeSelectionHall(hall.id, el));
    hall.dataset.id = el.id;
    hall.dataset.rows = el.hall_rows;
    hall.dataset.places = el.hall_places;

    allHallsForSelection.insertAdjacentElement("beforeend", hall);
    allHallsForSelection.firstChild.classList.add(
      "hall-configuration__selection-active"
    );
    activeHallId = allHallsForSelection.firstChild.id;

    setHallSize(allHalls[0]);
    createHallScheme(allHallsForSelection.firstChild.dataset.id, allHalls);
  });
}

const numberRowsInput = document.querySelector(".number-rows__input");
const numberSeatsInput = document.querySelector(".number-seats__input");

function changeSelectionHall(id, hall) {
  const allHalls = Array.from(allHallsForSelection.children);
  numberRowsInput.value = "";
  numberSeatsInput.value = "";

  allHalls.map((el) => {
    if (
      el.id === id &&
      !el.classList.contains("hall-configuration__selection-active")
    ) {
      el.classList.add("hall-configuration__selection-active");
      activeHallId = el.id;
      createHallScheme(el.dataset.id);
    } else if (el.id !== id) {
      el.classList.remove("hall-configuration__selection-active");
    }
  });
  setHallSize(hall);
}

function setHallSize(hall) {
  numberRowsInput.value = hall.hall_rows;
  numberSeatsInput.value = hall.hall_places;
}

let hallScheme = document.querySelector(".hall-scheme__hall");

async function createHallScheme(id, halls) {
  let activeHall;
  if (halls) {
    activeHall = halls.find((el) => el.id == id);
  } else {
    const data = await getAllData();
    activeHall = data.result.halls.find((el) => el.id == id);
  }
  hallScheme.innerHTML = "";
  const config = activeHall.hall_config;
  for (let i = 0; i < config.length; i++) {
    const rowDiv = document.createElement("div");
    rowDiv.classList.add("hall-scheme__row");
    for (let j = 0; j < config[i].length; j++) {
      const placeDiv = document.createElement("div");
      placeDiv.classList.add(`${config[i][j]}`);
      placeDiv.dataset.type = `${config[i][j]}`;
      placeDiv.dataset.row = i + 1;
      placeDiv.dataset.place = j + 1;

      placeDiv.addEventListener("click", (event) => {
        event.stopPropagation();
        changeTypePlace(placeDiv);
        enableHallConfigurationCancel();
      });
      rowDiv.appendChild(placeDiv);
    }
    hallScheme.appendChild(rowDiv);
  }
}

function enableHallConfigurationCancel() {
  hallConfigurationCancel.removeAttribute("disabled");
}

numberRowsInput.addEventListener("input", () => {
  const activeHall = document.querySelector(
    ".hall-configuration__selection-active"
  );
  activeHall.dataset.rows = numberRowsInput.value;
  createHallSchemeWithRowOrPlace(
    activeHall.dataset.rows,
    activeHall.dataset.places
  );
});

numberSeatsInput.addEventListener("input", () => {
  const activeHall = document.querySelector(
    ".hall-configuration__selection-active"
  );
  activeHall.dataset.places = numberSeatsInput.value;
  createHallSchemeWithRowOrPlace(
    activeHall.dataset.rows,
    activeHall.dataset.places
  );
});

function createHallSchemeWithRowOrPlace(rows, places) {
  hallScheme.innerHTML = "";
  for (let i = 0; i < +rows; i++) {
    const rowDiv = document.createElement("div");
    rowDiv.classList.add("hall-scheme__row");
    for (let j = 0; j < +places; j++) {
      const placeDiv = document.createElement("div");
      placeDiv.classList.add(`standart`);
      placeDiv.dataset.type = `standart`;
      placeDiv.dataset.row = i + 1;
      placeDiv.dataset.place = j + 1;
      placeDiv.addEventListener("click", () => changeTypePlace(placeDiv));
      rowDiv.appendChild(placeDiv);
    }
    hallScheme.appendChild(rowDiv);
  }
}

function changeTypePlace(place) {
  const types = ["standart", "vip", "disabled"];
  const currentType = place.dataset.type;
  const currentIndex = types.indexOf(currentType);
  const nextIndex = (currentIndex + 1) % types.length;
  const nextType = types[nextIndex];

  place.classList.remove(currentType);
  place.classList.add(nextType);
  place.dataset.type = nextType;
}

const hallConfigurationCancel = document.querySelector(
  ".hall-configuration__button__cancel"
);
hallConfigurationCancel.addEventListener("click", () => {
  cancelHallConfiguration();
});

hallConfigurationCancel.setAttribute("disabled", "disabled");

const btnSaveConfigHall = document.querySelector(
  ".hall-configuration__button__save"
);
btnSaveConfigHall.addEventListener("click", () => {
  fetchConfigHall();
});

async function cancelHallConfiguration() {
  const allData = await getAllData();
  const activeHall = document.querySelector(
    ".hall-configuration__selection-active"
  );
  const hallId = activeHall.dataset.id;

  const hallData = allData.result.halls.find((hall) => hall.id == hallId);

  numberRowsInput.value = hallData.hall_rows;
  numberSeatsInput.value = hallData.hall_places;

  createHallScheme(hallId);
  hallConfigurationCancel.setAttribute("disabled", "disabled");
}

for (const input of [numberRowsInput, numberSeatsInput]) {
  input.addEventListener("input", () => {
    const activeHall = document.querySelector(
      ".hall-configuration__selection-active"
    );
    const hallId = activeHall.dataset.id;
    const allData = getAllData();
    allData.then((data) => {
      const hall = data.result.halls.find((hall) => hall.id == hallId);
      const oldRows = hall.hall_rows;
      const oldPlaces = hall.hall_places;

      if (
        numberRowsInput.value !== oldRows.toString() ||
        numberSeatsInput.value !== oldPlaces.toString()
      ) {
        hallConfigurationCancel.removeAttribute("disabled");
      } else {
        hallConfigurationCancel.setAttribute("disabled", "disabled");
      }
    });
  });
}

function fetchConfigHall() {
  const activeHall = document.querySelector(
    ".hall-configuration__selection-active"
  );
  const hallId = activeHall.dataset.id;
  const rowCount = activeHall.dataset.rows;
  const placeCount = activeHall.dataset.places;
  const config = createConfigArray();
  console.log(hallId, rowCount, placeCount, config);

  const params = new FormData();
  params.set("rowCount", rowCount);
  params.set("placeCount", placeCount);
  params.set("config", JSON.stringify(config));
  fetch(`${url}/hall/${hallId}`, {
    method: "POST",
    body: params,
  }).then((response) => response.json());
  location.reload();
}

function createConfigArray() {
  const arr = [];
  const rows = Array.from(document.querySelectorAll(".hall-scheme__row"));
  for (let i = 0; i < rows.length; i++) {
    arr.push([]);
    for (let j = 0; j < rows[i].children.length; j++) {
      arr[i][j] = rows[i].children[j].dataset.type;
    }
  }
  return arr;
}

const allHallsForChangePrice = document.querySelector(
  ".price-configuration__all-halls"
);

function createHallsForChangePrice(data) {
  allHallsForChangePrice.innerHTML = "";
  const allHalls = data;
  allHalls.map((el) => {
    const hall = document.createElement("div");
    hall.textContent = el.hall_name;
    hall.classList.add("hall-configuration-price__selection");
    hall.id = `selection-hall-price-${el.id}`;
    hall.addEventListener("click", () => changeSelectionHallForPrice(hall.id));
    hall.dataset.id = el.id;
    hall.dataset.hallPriceStandart = el.hall_price_standart;
    hall.dataset.hallPriceVip = el.hall_price_vip;

    allHallsForChangePrice.insertAdjacentElement("beforeend", hall);
    allHallsForChangePrice.firstChild.classList.add(
      "hall-configuration-price__selection-active"
    );
  });
  getPlacePrice();
}

function changeSelectionHallForPrice(id) {
  const allHalls = Array.from(allHallsForChangePrice.children);
  allHalls.map((el) => {
    if (
      el.id === id &&
      !el.classList.contains("hall-configuration-price__selection-active")
    ) {
      el.classList.add("hall-configuration-price__selection-active");
      btnСancellationPrice.setAttribute("disabled", "disabled");
    } else if (el.id !== id) {
      el.classList.remove("hall-configuration-price__selection-active");
    }
  });
  getPlacePrice();
}

const pricePlaceStandart = document.querySelector(".price__standart__input");
const pricePlaceVip = document.querySelector(".price__vip__input");

function getPlacePrice() {
  const activeHall = document.querySelector(
    ".hall-configuration-price__selection-active"
  );
  pricePlaceStandart.value = activeHall.dataset.hallPriceStandart;
  pricePlaceVip.value = activeHall.dataset.hallPriceVip;
}

const btnСancellationPrice = document.querySelector(
  ".price__configuration__button__cancel"
);

btnСancellationPrice.setAttribute("disabled", "disabled");

for (const priceInput of [pricePlaceStandart, pricePlaceVip]) {
  priceInput.addEventListener("input", async () => {
    const data = await getAllData();
    const selectedHall = document.querySelector(
      ".hall-configuration-price__selection-active"
    );
    const hallId = selectedHall.dataset.id;

    const oldPrices = {
      standart: data.result.halls.find((hall) => hall.id == hallId)
        .hall_price_standart,
      vip: data.result.halls.find((hall) => hall.id == hallId).hall_price_vip,
    };

    const standartHasBeenChanged =
      pricePlaceStandart.value != oldPrices.standart;
    const vipHasBeenChanged = pricePlaceVip.value != oldPrices.vip;

    if (standartHasBeenChanged || vipHasBeenChanged) {
      btnСancellationPrice.removeAttribute("disabled");
    } else {
      btnСancellationPrice.setAttribute("disabled", "disabled");
    }
  });
}

btnСancellationPrice.addEventListener("click", () => {
  const activeHall = document.querySelector(
    ".hall-configuration-price__selection-active"
  );
  pricePlaceStandart.value = activeHall.dataset.hallPriceStandart;
  pricePlaceVip.value = activeHall.dataset.hallPriceVip;
});

const btnSavePrices = document.querySelector(
  ".price__configuration__button__save"
);

btnSavePrices.addEventListener("click", async () => {
  const selectedHall = document.querySelector(
    ".hall-configuration-price__selection-active"
  );
  const hallId = selectedHall.dataset.id;
  const standart = pricePlaceStandart.value;
  const vip = pricePlaceVip.value;

  const params = new FormData();
  params.set("priceStandart", standart);
  params.set("priceVip", vip);
  await fetch(`${url}/price/${hallId}`, {
    method: "POST",
    body: params,
  })
    .then((response) => response.json())
    .then((data) => console.log(data));
  location.reload();
});

const colors = ["yellow", "green", "lightgreen", "lightblue", "darkblue"];
const allFilms = document.querySelector(".all-films__container");

export async function createAllFilms(filmsFromFetch) {
  allFilms.innerHTML = "";
  const data = await getAllData();
  const films = filmsFromFetch || data.result.films;
  films.map((el) => {
    const film = document.createElement("div");
    film.classList.add("film");
    film.id = `film-${el.id}`;
    film.dataset.id = el.id;
    film.dataset.name = el.film_name;
    film.dataset.duration = el.film_duration;
    film.innerHTML = `<img src="${el.film_poster}" alt="img of film" class="film__poster">
      <div class="film__name-and-duration">
          <span class="film__name">${el.film_name}</span>
          <span class="film__duration">${el.film_duration} минут</span>
      </div>`;

    const basket = document.createElement("img");
    basket.src = "img/basket.png";
    basket.classList.add("basket");
    basket.classList.add("film__basket");
    basket.addEventListener("click", () =>
      deleteFilm(basket.parentElement, el.id)
    );

    film.insertAdjacentElement("beforeend", basket);
    film.addEventListener("mousedown", (event) => {
      raisingFilm(film, event);
    });
    allFilms.insertAdjacentElement("beforeend", film);

    const films = document.querySelectorAll(".film");
    films.forEach((film, index) => {
      const colorIndex = index % colors.length;
      film.classList.add(`background-color-${colors[colorIndex]}`);
      film.dataset.color = colors[colorIndex];
    });
  });
}

function deleteFilm(el, id) {
  el.remove();
  fetch(`${url}/film/${id}`, {
    method: "DELETE",
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      createAllSeances();
    });
}

const allSession = document.querySelector(".all-sessions");

async function createAllSession() {
  allSession.innerHTML = "";
  const data = await getAllData();
  const allHalls = data.result.halls;
  allHalls.map((el) => {
    const session = document.createElement("div");
    session.classList.add("session");
    session.innerHTML = `<span class="session__hall-name">${el.hall_name}</span>`;
    const sessionScheme = document.createElement("div");
    sessionScheme.classList.add("session__scheme");
    sessionScheme.id = `session__scheme-${el.id}`;
    sessionScheme.dataset.id = el.id;

    session.insertAdjacentElement("beforeend", sessionScheme);
    allSession.insertAdjacentElement("beforeend", session);
  });
  await createAllSeances();
}

let draggedFilm = null;

function raisingFilm(film, event) {
  draggedFilm = film.cloneNode(true);
  draggedFilm.style.position = "absolute";
  draggedFilm.style.zIndex = 1000;
  draggedFilm.style.transform = "translate(-50%, -50%)";
  draggedFilm.style.transition = "transform 0.2s ease";
  draggedFilm.style.left = `${event.pageX}px`;
  draggedFilm.style.top = `${event.pageY}px`;
  draggedFilm.style.width = `${film.getBoundingClientRect().width}px`;
  document.body.appendChild(draggedFilm);

  document.addEventListener("mousemove", moveFilm);
  document.addEventListener("mouseup", letGoFilm);
}

function moveFilm(event) {
  if (draggedFilm) {
    draggedFilm.style.left = `${event.pageX}px`;
    draggedFilm.style.top = `${event.pageY}px`;
  }
}

function letGoFilm(event) {
  if (draggedFilm) {
    const sessionSchemes = Array.from(
      document.querySelectorAll(".session__scheme")
    );
    sessionSchemes.map((sessionScheme) => {
      if (
        checkFilmPosition(
          event.target.getBoundingClientRect(),
          sessionScheme.getBoundingClientRect()
        )
      ) {
        const sessionId = sessionScheme.dataset.id;
        const filmId = draggedFilm.dataset.id;
        console.log(`Film ID: ${filmId}, Session ID: ${sessionId}`);
        draggedFilm.remove();
        openSessionPopup(filmId, sessionId);
      }
    });
    draggedFilm.remove();
    draggedFilm = null;
    document.removeEventListener("mousemove", moveFilm);
    document.removeEventListener("mouseup", letGoFilm);
  }
}

function checkFilmPosition(filmPosition, schemePosition) {
  const filmTop = filmPosition.top;
  const filmBottom = filmPosition.bottom;
  const filmLeft = filmPosition.left;

  const schemeTop = schemePosition.top;
  const schemeBottom = schemePosition.bottom;
  const schemeLeft = schemePosition.left;

  return (
    filmTop >= schemeTop && filmBottom <= schemeBottom && filmLeft >= schemeLeft
  );
}

export async function createAllSeances() {
  const data = await getAllData();

  const allHalls = Array.from(document.querySelectorAll(".session__scheme"));
  const allFilms = Array.from(document.querySelectorAll(".film"));
  const minutInPixel = 100 / 1439;

  allHalls.forEach((el) => (el.innerHTML = ""));

  const allSeances = data.result.seances;
  allSeances.map((seance) => {
    const hall = allHalls.find((el) => el.dataset.id == seance.seance_hallid);
    const film = allFilms.find((el) => el.dataset.id == seance.seance_filmid);

    const filmInHall = document.createElement("div");
    filmInHall.classList.add("session__film");
    filmInHall.dataset.seanceid = seance.id;
    filmInHall.setAttribute("draggable", "true");
    const filmInHallSpan = document.createElement("span");
    filmInHallSpan.classList.add("session__film-name");
    filmInHallSpan.textContent = film.dataset.name;
    filmInHall.innerHTML = `
      <div class="session__film__line-and-time">
          <div class="session__film__line"></div>
          <span class="session__film-time">${seance.seance_time}</span>
      </div>`;
    filmInHall.insertAdjacentElement("afterbegin", filmInHallSpan);
    filmInHall.style.left = `${getMinutes(seance.seance_time) * minutInPixel}%`;
    filmInHall.classList.add(`background-color-${film.dataset.color}`);
    filmInHall.style.width = `${film.dataset.duration * minutInPixel}%`;

    hall.insertAdjacentElement("beforeend", filmInHall);

    filmInHall.style.top = `-${getTopPosition(hall, filmInHall)}px`;

    const dropzone = document.createElement("div");
    dropzone.classList.add("dropzone");
    const hallContainer = filmInHall.closest(".session");
    if (!hallContainer.querySelector(".dropzone")) {
      hallContainer.insertAdjacentElement("afterbegin", dropzone);
    }

    const closestDropzone = hallContainer.querySelector(".dropzone");
    let draggableFilm;

    filmInHall.addEventListener("dragstart", (event) => {
      event.target.querySelector(
        ".session__film__line-and-time"
      ).style.display = "none";
      closestDropzone.classList.add("visible");
      draggableFilm = filmInHall;
    });

    closestDropzone.addEventListener("dragover", (event) => {
      event.preventDefault();
    });

    closestDropzone.addEventListener("drop", (event) => {
      event.preventDefault();
      closestDropzone.classList.remove("visible");
      if (!draggableFilm) return;
      deleteSeance(draggableFilm.dataset.seanceid);
    });

    closestDropzone.addEventListener("dragleave", () => {
      closestDropzone.classList.remove("visible");
    });

    filmInHall.addEventListener("dragend", (event) => {
      event.target.querySelector(
        ".session__film__line-and-time"
      ).style.display = "";
      closestDropzone.classList.remove("visible");
      draggableFilm = 0;
    });
  });
}

function getTopPosition(hall, film) {
  const hallTop = hall.getBoundingClientRect().top + 10;
  const filmTop = film.getBoundingClientRect().top;
  return filmTop - hallTop;
}

async function deleteSeance(seanceId) {
  await fetch(`${url}/seance/${seanceId}`, {
    method: "DELETE",
  })
    .then((response) => response.json())
    .then((data) => console.log(data));
  await createAllSeances();
  location.reload();
}

const containerHallsForSales = document.querySelector(
  ".sales-configuration__all-halls"
);
const salesBtn = document.querySelector(".setting__open-sales-btn");

function createHallsForSales(data) {
  containerHallsForSales.innerHTML = "";
  data.map((el) => {
    const hall = document.createElement("div");
    hall.textContent = el.hall_name;
    hall.classList.add("sales-configuration__selection");
    hall.id = `hall-for-sales-${el.id}`;
    hall.addEventListener("click", () => changeSelectionHallforSales(hall.id));
    hall.dataset.id = el.id;
    hall.dataset.isopen = el.hall_open;

    containerHallsForSales.insertAdjacentElement("beforeend", hall);
    containerHallsForSales.firstChild.classList.add(
      "sales-configuration__selection-active"
    );

    getSalesBtnText(containerHallsForSales.firstChild);
  });
}

async function getSalesBtnText(activeHall) {
  const data = await getAllData();
  const hallId = activeHall.dataset.id;
  const hallHasSeances = data.result.seances.some(
    (seance) => seance.seance_hallid == hallId
  );
  salesBtn.textContent =
    activeHall.dataset.isopen == 1
      ? "Закрыть продажу билетов"
      : "Открыть продажу билетов";
  salesBtn.disabled = !hallHasSeances;
}

function changeSelectionHallforSales(id) {
  const allHalls = Array.from(containerHallsForSales.children);
  allHalls.map((el) => {
    if (
      el.id === id &&
      !el.classList.contains("sales-configuration__selection-active")
    ) {
      el.classList.add("sales-configuration__selection-active");
      getSalesBtnText(el);
    } else if (el.id !== id) {
      el.classList.remove("sales-configuration__selection-active");
    }
  });
}

salesBtn.addEventListener("click", () => openCloseSales());

function openCloseSales() {
  const activeHall = document.querySelector(
    ".sales-configuration__selection-active"
  );
  const activeHallId = activeHall.dataset.id;
  const isOpen = parseInt(activeHall.dataset.isopen);
  const params = new FormData();
  params.set("hallOpen", isOpen ? "0" : "1");

  fetch(`${url}/open/${activeHallId}`, {
    method: "POST",
    body: params,
  })
    .then((response) => response.json())
    .then((data) => {
      activeHall.dataset.isopen = isOpen ? 0 : 1;
      getSalesBtnText(activeHall);
    });
}
