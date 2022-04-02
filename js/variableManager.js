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

export default class VariableManager {
  constructor(topLevelEl) {
    this.topLevelEl = topLevelEl;
    this.menuEl = topLevelEl.querySelector(".menu-list");
    this.addNewButtonEl = topLevelEl.querySelector(".menu-adder-button")
    this.generateMenu();
  }

  generateMenu() {
    for (let i = 0; i < presets.length; i += 1) {
      const rowEl = this.generateMenuRow(i);
      this.menuEl.appendChild(rowEl);
    }
  }

  generateMenuRow(i) {
    const preset = presets[i];
    const indexEl = makeLabel({text: `$${i + 1}`, classes: ["index-variable"]});
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
    this.menuEl.removeChild(el);
  }
}
