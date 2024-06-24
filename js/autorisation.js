const url = "https://shfe-diplom.neto-server.ru";
const clientPage = document.querySelector(".client");
const adminPage = document.querySelector(".admin");
const adminPageLogin = document.querySelector(".admin__login");
const autorisationBtn = document.querySelector(".login__form__btn");
const autorisationForm = document.querySelector(".login__form");
const allSettingsPage = document.querySelector(".admin__all-settings");

if (document.cookie.includes("isLoggedIn=true")) {
  adminPageLogin.style.display = "none";
  allSettingsPage.classList.add("admin__all-settings-active");
}

autorisationBtn.onclick = async (e) => {
  e.preventDefault();
  let response = await fetch(`${url}/login`, {
    method: "POST",
    body: new FormData(autorisationForm),
  });

  let result = await response.json();
  if (!result.success) {
    alert("Неверный логин или пароль");
  } else {
    adminPageLogin.style.display = "none";
    allSettingsPage.classList.add("admin__all-settings-active");
    document.cookie = "isLoggedIn=true; path=/";
  }
  autorisationForm.reset();
};
