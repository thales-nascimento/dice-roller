const confirmatorEl = document.querySelector("#confirmator");
const labelEl = confirmatorEl.querySelector("#confirmator-label");
const yesEl = confirmatorEl.querySelector("#confirmator-yes");
let onYes = undefined;
let opened = false;

yesEl.addEventListener("click", () => {
  if (onYes !== undefined) {
    onYes();
  }
  closeConfirmator();
})

document.addEventListener("click", (evt) => {
  if (!opened) {
    return;
  }

  let targetEl = evt.target; // clicked element
  do {
    if (targetEl == confirmatorEl) {
      // This is a click inside, does nothing, just return.
      return;
    }
    // Go up the DOM
    targetEl = targetEl.parentNode;
  } while (targetEl);
  // This is a click outside.
  closeConfirmator();
});

function closeConfirmator() {
  confirmatorEl.classList.remove("visible");
  opened = false;
}

export default function openConfirmator(x, y, text, yesCallback) {
  onYes = yesCallback
  labelEl.textContent = text;
  confirmatorEl.style.top = `${y}px`;
  confirmatorEl.style.left = `${x}px`;
  confirmatorEl.classList.add("visible");
  opened = true;
}
