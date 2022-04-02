import { makeFlexRow, makeButton, makeLabel, flash } from "./domUtils.js";
import openConfirmator from "./confirmator.js";

export default class VariableManager {
  constructor(topLevelEl, creatorEl) {
    this.variables = {};
    this.changeListeners = [];

    this.topLevelEl = topLevelEl;
    this.menuEl = topLevelEl.querySelector(".menu-list");

    this.creatorEl = creatorEl;

    this.prepareAdderButton();
  }

  generateRow(name) {
    const variable = {
      key: name,
      requiredBy: new Set(),
    };

    const keyEl = makeLabel({text: variable.key, classes: ["variable-key"]});
    const removeButtonEl = makeButton({text: "×", classes: ["menu-remove-button"]});
    variable.el = makeFlexRow({children: [keyEl, removeButtonEl]});
    removeButtonEl.addEventListener("click", (evt) => {
      evt.stopPropagation();
      const rect = variable.el .getBoundingClientRect();
      const x = rect.right + 4;
      const y = rect.top;
      openConfirmator(x, y, `Delete variable ${variable.key} ?`, () => this.removeVariable(variable));
    });

    this.variables[variable.key] = variable;
    this.menuEl.appendChild(variable.el );
    this.onChange();
  }

  removeVariable(variable) {
    if (variable.requiredBy.size) {
      for (const dependent of variable.requiredBy) {
        flash(dependent.el);
      }
    } else {
      this.menuEl.removeChild(variable.el);
      delete this.variables[variable.key];
      this.onChange();
    }
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

  prepareAdderButton() {
    const addNewButtonEl = this.creatorEl.querySelector("#new-variable-create");
    const nameEl = this.creatorEl.querySelector("#new-variable-name");

    nameEl.addEventListener("input", () => {
      nameEl.classList.remove("input-error");
    });

    addNewButtonEl.addEventListener("click", () => {
      let name = nameEl.value;
      if (name === "") {
        nameEl.classList.add("input-error");
        return;
      }

      name = "$" + name;
      if (this.variables[name] !== undefined) {
        nameEl.classList.add("input-error");
        flash(this.variables[name].el);
        return;
      }

      this.generateRow(name);
    });
  }
}
