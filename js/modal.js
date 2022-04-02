const modalEl = document.querySelector(".modal");
const closeEls = document.querySelectorAll(".close-modal");
const modalTitleEl = modalEl.querySelector(".modal-title");
const bodyEl = modalEl.querySelector(".modal-body p");
const okEl = modalEl.querySelector(".modal-ok");
const cancelEl = modalEl.querySelector(".modal-cancel");
let onOk = undefined;

for (const el of closeEls) {
  el.addEventListener("click", closeModal);
}

okEl.addEventListener("click", () => {
  if (onOk !== undefined) {
    onOk();
  }
})

function closeModal() {
  modalEl.classList.remove("visible");
}

export default function openModal({title = "", body = "", ok = "ok", cancel = "Cancel", okCallback = undefined}) {
  modalTitleEl.textContent = title;
  bodyEl.textContent = body;
  okEl.textContent = ok;
  cancelEl.textContent = cancel;
  onOk = okCallback;
  modalEl.classList.add("visible");
}
