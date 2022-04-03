import { makeFlexRow, makeButton, makeLabel, makeNumberInput, warmup } from "./domUtils.js";
import Manager, { removeInputError, validateInputValue } from "./manager.js";

const sumVariableName = "sum";
const averageVariableName = "average";

export default class VariableManager extends Manager {
  constructor(topLevelEl, creatorEl, diceManager) {
    super();
    this.topLevelEl = topLevelEl;
    this.managedListEl = topLevelEl.querySelector(".list");

    this.creatorEl = creatorEl;

    this.diceManager = diceManager;

    this.prepareAdderButton();
    this.generateFixedVariables();
  }

  generateFixedVariables() {
    this.generateRow(sumVariableName, true);
    this.generateRow(averageVariableName, true);
  }

  refreshFixedVariables() {
    console.log("refresh");
    const diceValues = this.diceManager.getDiceValues();

    const sumVariable = this.managed[sumVariableName];
    sumVariable.value = diceValues.reduce((accumulated, v) => accumulated + v, 0);
    sumVariable.inputEl.value = sumVariable.value;

    const avgVariable = this.managed[averageVariableName];
    avgVariable.value = (sumVariable.value / diceValues.length).toFixed(2);
    avgVariable.inputEl.value = avgVariable.value;
  }

  generateRow(name, fixed) {
    const variable = {
      key: name,
      value: 0,
      depends: new Set(),
      requiredBy: new Set(),
    };

    const keyEl = makeLabel({text: variable.key, classes: ["standard-row", "variable-key"]});
    const removeButtonEl = makeButton({text: "×", classes: ["standard-row", "menu-remove-button"]});
    removeButtonEl.disabled = !!fixed;
    variable.inputEl = makeNumberInput({min: 0, step: 1, value: 0, classes: ["standard-row", "number-input", "variable-input"]});
    variable.inputEl.disabled = !!fixed;
    variable.inputEl.addEventListener("change", (evt) => {
      variable.value = evt.target.value;
    });
    warmup("change", variable.inputEl);
    variable.el = makeFlexRow({children: [keyEl, variable.inputEl, removeButtonEl]});
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
