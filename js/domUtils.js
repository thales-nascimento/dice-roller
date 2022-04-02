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
  labelEl.title = tooltip;
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

export function makeNumberInput({name, min, max, value, step, classes = []}) {
  console.assert(Array.isArray(classes));
  const inputEl = document.createElement('input');
  inputEl.type = "number";

  if (name !== undefined) {
    inputEl.name = name;
  }
  if (min !== undefined) {
    inputEl.min = min;
  }
  if (max !== undefined) {
    inputEl.max = max;
  }
  if (value !== undefined) {
    inputEl.value = value;
  }
  if (step !== undefined) {
    inputEl.step = step;
  }
  for (const c of classes) {
    inputEl.classList.add(c);
  }
  return inputEl;
}
