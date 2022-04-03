import { makeFlexRow, makeButton, makeLabel, flash } from "./domUtils.js";
import Manager, { removeInputError, validateInputValue } from "./manager.js";

export default class VariableManager extends Manager {
  constructor(topLevelEl, creatorEl) {
    super();
    this.topLevelEl = topLevelEl;
    this.mangedListEl = topLevelEl.querySelector(".list");

    this.creatorEl = creatorEl;

    this.prepareAdderButton();
  }

  generateRow(name) {
    const variable = {
      key: name,
      depends: new Set(),
      requiredBy: new Set(),
    };

    const keyEl = makeLabel({text: variable.key, classes: ["variable-key"]});
    const removeButtonEl = makeButton({text: "×", classes: ["menu-remove-button"]});
    variable.el = makeFlexRow({children: [keyEl, removeButtonEl]});
    this.prepareRemoveConfirmationOnButton(removeButtonEl, variable);

    this.managed[variable.key] = variable;
    this.mangedListEl.appendChild(variable.el );
    this.onChange();
  }

  prepareAdderButton() {
    const nameEl = this.creatorEl.querySelector("#new-variable-name");
    const addNewButtonEl = this.creatorEl.querySelector("#new-variable-create");

    nameEl.addEventListener("input", removeInputError);

    addNewButtonEl.addEventListener("click", () => {
      if (!validateInputValue(nameEl)) {
        return;
      }

      const name = "$" + nameEl.value;
      if (!this.validateDuplicateManagedKey(name, nameEl)) {
        return;
      }

      this.generateRow(name);
    });
  }
}
