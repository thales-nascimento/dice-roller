const toastEl = document.querySelector("#toast");
const labelEl = toastEl.querySelector("#toast-label");


export default function showToast(text) {
  toastEl.classList.remove("appear");
  resetAnimation(toastEl);
  labelEl.textContent = text;
  toastEl.classList.add("appear");
  toastEl.addEventListener("animationend", removeAppearClass);
}

function resetAnimation(el) {
  el.style.animation = 'none';
  el.offsetHeight; /* trigger reflow */
  el.style.animation = null;
}

function removeAppearClass(evt) {
  evt.target.classList.remove("appear");
  evt.target.removeEventListener("animationend", removeAppearClass);
}
