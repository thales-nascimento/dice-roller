import { makeFlexRow, makeButton, makeLabel, makeOption, warmup } from "./domUtils.js";
import { numberOperators, Condition } from "./condition.js"
import Manager, { validateInputValue } from "./manager.js";

const constantText = "const";

export default class SimpleCauseManager extends Manager {
  constructor(topLevelEl, creatorEl, diceManager, variableManager) {
    super("∵");
    this.topLevelEl = topLevelEl;
    this.managedListEl = topLevelEl.querySelector(".list");

    this.creatorEl = creatorEl;
    this.operandBSelectionEl = creatorEl.querySelector("#new-simple-cause-operand-b-selector");
    this.operandASelectionEl = creatorEl.querySelector("#new-simple-cause-operand-a-selector");
    this.constantInputEl = creatorEl.querySelector("#new-simple-cause-constant");

    this.diceManager = diceManager;
    diceManager.addChangeListener(() => this.refreshVariables());

    this.variableManager = variableManager;
    variableManager.addChangeListener(() => this.refreshVariables());

    this.prepareAdderButton();
  }

  generateRow(operandA, operator, operandB, bIsConstant) {
    const cause = {
      name: `${operandA.key} ${operator.text} ${bIsConstant ? operandB : operandB.key}`,
      depends: new Set(),
      requiredBy: new Set(),
      condition: new Condition(operator, () => operandA.value, bIsConstant ? () => operandB : () => operandB.value),
    };

    if (!this.validateDuplicateManagedName(cause.name)) {
      return;
    }
    cause.key = this.nextKey();
    cause.depends.add(operandA);
    operandA.requiredBy.add(cause);
    if (!bIsConstant) {
      cause.depends.add(operandB);
      operandB.requiredBy.add(cause);
    }

    const keyEl = makeLabel({text: cause.key, classes: ["simple-cause-key"]});
    const nameEl = makeLabel({text: cause.name, classes: ["menu-label"]});
    const removeButtonEl = makeButton({text: "×", classes: ["menu-remove-button"]});

    cause.el = makeFlexRow({children: [keyEl, nameEl, removeButtonEl]});
    this.prepareRemoveConfirmationOnButton(removeButtonEl, cause);

    this.managed[cause.key] = cause;
    this.managedListEl.appendChild(cause.el);
    this.onChange();
  }

  prepareAdderButton() {
    const operatorSelectionEl = this.creatorEl.querySelector("#new-simple-cause-operator-selector");
    const addNewButtonEl = this.creatorEl.querySelector("#new-simple-cause-create");

    fillOperators(operatorSelectionEl);

    const removeAllinputErros = () => {
      operatorSelectionEl.classList.remove("input-error");
      this.operandASelectionEl.classList.remove("input-error");
      this.constantInputEl.classList.remove("input-error");
    }

    operatorSelectionEl.addEventListener("change", removeAllinputErros);
    this.operandASelectionEl.addEventListener("change", removeAllinputErros);
    this.constantInputEl.addEventListener("change", removeAllinputErros);
    this.operandBSelectionEl.addEventListener("change", (evt) => {
      this.constantInputEl.disabled = evt.target.value !== constantText;
    });

    this.refreshVariables();

    addNewButtonEl.addEventListener("click", () => {
      if (!validateInputValue(this.operandASelectionEl)) {
        return;
      }

      const operandAKey = this.operandASelectionEl.value;
      let operandA = this.diceManager.getManagedByKey(operandAKey)
      const aIsDice = operandA !== undefined;
      if (!aIsDice) {
        operandA = this.variableManager.getManagedByKey(operandAKey);
      }
      const operator = numberOperators[operatorSelectionEl.value];
      let operandB;
      const bIsConstant = this.operandBSelectionEl.value === constantText;
      if (bIsConstant) {
        const constant = this.constantInputEl.value;
        if (aIsDice) {
          if (constant > operandA.faces || constant < 1) {
            this.constantInputEl.classList.add("input-error");
            return;
          } else if (constant == operandA.faces && operator == numberOperators[">"]) {
            operatorSelectionEl.classList.add("input-error");
            this.constantInputEl.classList.add("input-error");
            return;
          } else if (constant == 1 && operator == numberOperators["<"]) {
            operatorSelectionEl.classList.add("input-error");
            this.constantInputEl.classList.add("input-error");
            return;
          }

        }
        operandB = constant;
      } else {
        const operandBKey = this.operandBSelectionEl.value;
        operandB = this.diceManager.getManagedByKey(operandBKey) || this.variableManager.getManagedByKey(operandBKey);
      }
      this.generateRow(operandA, operator, operandB, bIsConstant);
    });
  }

  refreshVariables() {
    const variables = this.variableManager.getAllManaged();
    const dices = this.diceManager.getAllManaged();
    const optionEls = variables.concat(dices).map(v => makeOption({text: v.key, value: v.key}));

    this.refreshOperandA(optionEls);
    this.refreshOperandB(optionEls.map(v => v.cloneNode(true)));
  }

  refreshOperandB(optionEls) {
    this.operandBSelectionEl.innerHTML = "";
    const constantOptionEl = makeOption({text: constantText, value: constantText});
    this.operandBSelectionEl.appendChild(constantOptionEl);
    for (const optionEl of optionEls) {
      this.operandBSelectionEl.appendChild(optionEl);
    }
    warmup("change", this.operandBSelectionEl);
  }

  refreshOperandA(optionEls) {
    this.operandASelectionEl.innerHTML = "";
    for (const optionEl of optionEls) {
      this.operandASelectionEl.appendChild(optionEl);
    }
    warmup("change", this.operandASelectionEl);
  }
}

function fillOperators(operatorSelectionEl) {
  const operatorOptionEls = Object.values(numberOperators).map(op => makeOption({text: op.text, value: op.text}));
  for (const opEl of operatorOptionEls) {
    operatorSelectionEl.appendChild(opEl);
  }
}

//TODO(THALES) IMPLEMENT VARIABLE CHANGERS
