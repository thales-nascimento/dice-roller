import { makeFlexRow, makeButton, makeLabel } from "./domUtils.js";
import openConfirmator from "./confirmator.js";

const presets = [
  {
    name: "dice",
    removable: false,
  },
  {
    name: "hunger",
    removable: true,
  }
];

export default class Variable {
  constructor(variableEl) {
    this.variableEl = variableEl;
    this.variableMenuEl = variableEl.querySelector("#variable-menu");
    this.generateVariableMenu();
  }

  generateVariableMenu() {
    for (let i = 0; i < presets.length; i += 1) {
      const rowEl = this.generateVariableRow(i);
      this.variableMenuEl.appendChild(rowEl);
    }
  }

  generateVariableRow(i) {
    const preset = presets[i];
    const indexEl = makeLabel({text: `$${i + 1}`, classes: ["menu-index"]});
    const labelEl = makeLabel({text: preset.name, classes: ["menu-label"]});
    const removeButtonEl = makeButton({text: "×", classes: ["menu-remove-button"]});
    if (!preset.removable) {
      removeButtonEl.disabled = true;
    }
    const rowEl = makeFlexRow({children: [indexEl, labelEl, removeButtonEl]});
    removeButtonEl.addEventListener("click", (evt) => {
      evt.stopPropagation();
      const rect = rowEl.getBoundingClientRect();
      const x = rect.right + 4;
      const y = rect.top;
      openConfirmator(x, y, () => this.removePreset(i, rowEl));
    });
    return rowEl;
  }

  removePreset(i, el) {
    presets.splice(i, 1);
    this.variableMenuEl.removeChild(el);
  }
}
