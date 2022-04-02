import { makeFlexRow, makeButton, makeLabel } from "./domUtils.js";
import openConfirmator from "./confirmator.js";

export default class VariableManager {
  constructor(topLevelEl) {
    this.variableIndex = 0;
    this.variables = {};
    this.changeListeners = [];

    this.topLevelEl = topLevelEl;
    this.menuEl = topLevelEl.querySelector(".menu-list");
    this.addNewButtonEl = topLevelEl.querySelector(".menu-adder-button")
  }

  generateMenuRow(name) {
    const variable = {
      key: this.nextKey(),
      name: name,
      requiredBy: new Set(),
    };

    const keyEl = makeLabel({text: variable.key, classes: ["variable-key"]});
    const labelEl = makeLabel({text: variable.name, classes: ["menu-label"]});
    const removeButtonEl = makeButton({text: "×", classes: ["menu-remove-button"]});
    variable.el = makeFlexRow({children: [keyEl, labelEl, removeButtonEl]});
    removeButtonEl.addEventListener("click", (evt) => {
      evt.stopPropagation();
      const rect = variable.el .getBoundingClientRect();
      const x = rect.right + 4;
      const y = rect.top;
      openConfirmator(x, y, `Delete variable ${variable.key} ${variable.name} ?`, () => this.removeVariable(variable));
    });

    this.variables[variable.key] = variable;
    this.menuEl.appendChild(variable.el );
  }

  removeVariable(variable) {
    if (variable.requiredBy.size) {
      for (const dependent of variable.requiredBy) {
        dependent.el.classList.add("flash");
        dependent.el.addEventListener("animationend", () => {
          dependent.el.classList.remove("flash");
        });
      }
    } else {
      this.menuEl.removeChild(variable.el);
      delete this.variables[variable.key];
      this.onChange();
    }
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

  addChangeListener(callback) {
    this.changeListeners.push(callback);
  }

  onChange() {
    for (const cb of this.changeListeners) {
      cb();
    }
  }
}
