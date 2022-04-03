import { setIfNotUndefined } from "./unclassifiedUtils.js";

export function makeDiv({children = [], classes = []}) {
  console.assert(Array.isArray(children));
  console.assert(Array.isArray(classes));
  const divEl = document.createElement('div');
  for (const c of classes) {
    divEl.classList.add(c);
  }
  for (const c of children) {
    divEl.appendChild(c);
  }
  return divEl;
}

export function makeFlexRow(recipe) {
  const divEl = makeDiv(recipe);
  divEl.classList.add(["flex-row"]);
  return divEl;
}

export function makeFlexCol(recipe) {
  const divEl = makeDiv(recipe);
  divEl.classList.add(["flex-col"]);
  return divEl;
}

export function makeButton({text = "", classes = []}) {
  console.assert(Array.isArray(classes));
  const buttonEl = document.createElement('button');
  buttonEl.textContent = text;
  for (const c of classes) {
    buttonEl.classList.add(c);
  }
  return buttonEl;
}

export function makeLabel({text, target, tooltip, classes = []}) {
  console.assert(Array.isArray(classes));
  const labelEl = document.createElement('label');
  labelEl.textContent = text;
  labelEl.for = target;
  setIfNotUndefined(labelEl, "tooltip", tooltip);
  for (const c of classes) {
    labelEl.classList.add(c);
  }
  return labelEl;
}

export function makeOption({text, value, classes = []}) {
  console.assert(Array.isArray(classes));
  const optionEl = document.createElement('option');
  optionEl.textContent = text;
  optionEl.value = value;
  for (const c of classes) {
    optionEl.classList.add(c);
  }
  return optionEl;
}

export function makeInput({type, id, min, max, step, value, placeholder, classes = []}) {
  console.assert(Array.isArray(classes));
  const inputEl = document.createElement('input');

  setIfNotUndefined(inputEl, "type", type);
  setIfNotUndefined(inputEl, "id", id);
  setIfNotUndefined(inputEl, "min", min);
  setIfNotUndefined(inputEl, "max", max);
  setIfNotUndefined(inputEl, "step", step);
  setIfNotUndefined(inputEl, "value", value);
  setIfNotUndefined(inputEl, "placeholder", placeholder);

  for (const c of classes) {
    inputEl.classList.add(c);
  }
  return inputEl;
}

export function makeNumberInput(recipe) {
  const inputEl = makeInput({...recipe, type: "number"})
  return inputEl;
}

export function flash(el) {
  function removeFlashClass(evt) {
    evt.target.classList.remove("flash");
    evt.target.removeEventListener("animationend", removeFlashClass);
  }
  el.classList.add("flash");
  el.addEventListener("animationend", removeFlashClass);
}

export function warmup(evtName, el) {
  const event = new Event(evtName);
  el.dispatchEvent(event);
}
