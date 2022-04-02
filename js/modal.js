const modal = document.querySelector(".modal");
const closeEls = document.querySelectorAll(".close-modal");
const modalTitleEl = modal.querySelector(".modal-title");
const bodyEl = modal.querySelector(".modal-body p");
const okEl = modal.querySelector(".modal-ok");
const cancelEl = modal.querySelector(".modal-cancel");
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
  modal.classList.remove("visible");
}

export default function openModal({title = "", body = "", ok = "ok", cancel = "Cancel", okCallback = undefined}) {
  modalTitleEl.textContent = title;
  bodyEl.textContent = body;
  okEl.textContent = ok;
  cancelEl.textContent = cancel;
  onOk = okCallback;
  modal.classList.add("visible");
}
