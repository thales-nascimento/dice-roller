const confirmatorEl = document.querySelector("#confirmator");
const yesEl = confirmatorEl.querySelector("#confirmator-yes");
const noEl = confirmatorEl.querySelector("#confirmator-no");
let onYes = undefined;
let opened = false;

noEl.addEventListener("click", closeConfirmator);

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

export default function openConfirmator(x, y, yesCallback) {
  onYes = yesCallback
  confirmatorEl.style.top = `${y}px`;
  confirmatorEl.style.left = `${x}px`;
  confirmatorEl.classList.add("visible");
  opened = true;
}
