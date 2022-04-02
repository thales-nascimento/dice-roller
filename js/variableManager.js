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
    this.variableIndex = 0;
    this.variables = {};
    this.topLevelEl = topLevelEl;
    this.menuEl = topLevelEl.querySelector(".menu-list");
    this.addNewButtonEl = topLevelEl.querySelector(".menu-adder-button")
    this.generatePresets();
  }

  generatePresets() {
    for (const preset of presets) {
      const rowEl = this.generateMenuRow(preset);
    }
  }

  generateMenuRow(recipe) {
    const variableKey = this.nextKey();
    const keyEl = makeLabel({text: variableKey, classes: ["variable-key"]});
    const labelEl = makeLabel({text: recipe.name, classes: ["menu-label"]});
    const removeButtonEl = makeButton({text: "×", classes: ["menu-remove-button"]});
    if (!recipe.removable) {
      removeButtonEl.disabled = true;
    }
    const rowEl = makeFlexRow({children: [keyEl, labelEl, removeButtonEl]});
    removeButtonEl.addEventListener("click", (evt) => {
      evt.stopPropagation();
      const rect = rowEl.getBoundingClientRect();
      const x = rect.right + 4;
      const y = rect.top;
      openConfirmator(x, y, `Delete variable ${recipe.name} ?`, () => this.removeVariable(variableKey));
    });

    this.variables[variableKey] = {
      key: variableKey,
      el: rowEl,
      requiredBy: new Set(),
    };
    this.menuEl.appendChild(rowEl);
  }

  removeVariable(variableKey) {
    this.menuEl.removeChild(this.variables[variableKey].el);
    delete this.variables[variableKey];
  }

  nextKey() {
    this.variableIndex += 1;
    return `$${this.variableIndex}`
  }

  getVariables() {
    return this.variables
  }

  getVariableByKey(key) {
    return this.variables[key];
  }
}
