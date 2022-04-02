import { makeFlexRow, makeButton, makeLabel, flash } from "./domUtils.js";
import openConfirmator from "./confirmator.js";
import Manager from "./manager.js";

export default class VariableManager extends Manager {
  constructor(topLevelEl, creatorEl) {
    super();
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

    this.managed[variable.key] = variable;
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
      delete this.managed[variable.key];
      this.onChange();
    }
  }

  prepareAdderButton() {
    const nameEl = this.creatorEl.querySelector("#new-variable-name");
    const addNewButtonEl = this.creatorEl.querySelector("#new-variable-create");

    const removeInputError = (evt) => evt.target.classList.remove("input-error");
    nameEl.addEventListener("input", removeInputError);

    addNewButtonEl.addEventListener("click", () => {
      let name = nameEl.value;
      if (name === "") {
        nameEl.classList.add("input-error");
        return;
      }

      name = "var-" + name;
      if (this.managed[name] !== undefined) {
        nameEl.classList.add("input-error");
        flash(this.managed[name].el);
        return;
      }

      this.generateRow(name);
    });
  }
}
