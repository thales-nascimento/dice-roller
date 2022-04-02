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

export function makeLabel({text = "", target = "", classes = []}) {
  console.assert(Array.isArray(classes));
  const labelEl = document.createElement('label');
  labelEl.textContent = text;
  labelEl.for = target;
  for (const c of classes) {
    labelEl.classList.add(c);
  }
  return labelEl;
}
