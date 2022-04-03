import { makeFlexRow, makeButton, makeLabel, makeNumberInput, warmup } from "./domUtils.js";
import Manager, { removeInputError, validateInputValue } from "./manager.js";

export default class VariableManager extends Manager {
  constructor(topLevelEl, creatorEl) {
    super();
    this.topLevelEl = topLevelEl;
    this.managedListEl = topLevelEl.querySelector(".list");

    this.creatorEl = creatorEl;

    this.prepareAdderButton();
  }

  generateRow(name) {
    const variable = {
      key: name,
      value: 0,
      depends: new Set(),
      requiredBy: new Set(),
    };

    const keyEl = makeLabel({text: variable.key, classes: ["standard-row", "variable-key"]});
    const inputEl = makeNumberInput({min: 0, step: 1, value: 1, classes: ["standard-row", "number-input", "variable-input"]});
    const removeButtonEl = makeButton({text: "×", classes: ["standard-row", "menu-remove-button"]});
    variable.el = makeFlexRow({children: [keyEl, inputEl, removeButtonEl]});
    inputEl.addEventListener("change", (evt) => {
      variable.value = evt.target.value;
    });
    warmup("change", inputEl);
    this.prepareRemoveConfirmationOnButton(removeButtonEl, variable);

    this.managed[variable.key] = variable;
    this.managedListEl.appendChild(variable.el );
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

//TODO(thales) variavel de soma
//TODO(thales) variavel de média
