import { makeFlexRow, makeButton, makeLabel, makeOption, warmup, addErrorClass } from "./domUtils.js";
import { numberOperators, Condition, groupMode } from "./condition.js"
import Manager, { validateInputValue } from "./manager.js";
import showToast from "./toast.js";

const constantText = "const";

const premiseType = {
  dice: Symbol("dice"),
  constant: Symbol("const"),
  variable: Symbol("var"),
  special: Symbol("special"),
}

export default class SimpleCauseManager extends Manager {
  constructor(topLevelEl, creatorEl, diceManager, variableManager) {
    super("∵");

    this.topLevelEl = topLevelEl;
    this.managedListEl = topLevelEl.querySelector(".list");

    this.creatorEl = creatorEl;
    this.operandBSelectionEl = creatorEl.querySelector("#new-simple-cause-operand-b-selector");
    this.operandASelectionEl = creatorEl.querySelector("#new-simple-cause-operand-a-selector");
    this.constantInputEl = creatorEl.querySelector("#new-simple-cause-constant");
    this.nDicesInputEl = creatorEl.querySelector("#new-simple-cause-n-dices");

    this.diceManager = diceManager;
    diceManager.addChangeListener(() => this.refreshOperands());

    this.variableManager = variableManager;
    variableManager.addChangeListener(() => this.refreshOperands());

    this.specialCauses = {
      anyDice: {
        key: "anyDice",
        name: "any dice",
        requiredBy: new Set(),
        getValue: () => ({groupMode: groupMode.any, values: this.diceManager.getDiceValues()}),
      },
      nDices: {
        key: "nDices",
        name: "n dices",
        requiredBy: new Set(),
        getValue: () => ({groupMode: groupMode.n, values: this.diceManager.getDiceValues(), n: Number.parseInt(this.nDicesInputEl.value)}),
      },
      allDices: {
        key: "allDices",
        name: "all dices",
        requiredBy: new Set(),
        getValue: () => ({groupMode: groupMode.all, values: this.diceManager.getDiceValues()}),
      },
    };

    this.prepareAdderButton();
  }

  generateRow(operator, operandA, aType, operandB, bType) {
    const cause = {
      name: `${operandA.key} ${operator.text} ${bType == premiseType.constant ? operandB : operandB.key}`,
      condition: new Condition(operator, generateValueGetter(operandA, aType), generateValueGetter(operandB, bType)),
      depends: new Set(),
      requiredBy: new Set(),
      check: () => cause.condition.check(),
    };

    if (!this.validateDuplicateManagedName(cause.name)) {
      return;
    }
    cause.key = this.nextKey();
    cause.depends.add(operandA);
    operandA.requiredBy.add(cause);
    if (bType !== premiseType.constant) {
      cause.depends.add(operandB);
      operandB.requiredBy.add(cause);
    }

    const keyEl = makeLabel({text: cause.key, classes: ["standard-row", "simple-cause-key"]});
    const nameEl = makeLabel({text: cause.name, classes: ["standard-row", "menu-label"]});
    const removeButtonEl = makeButton({text: "×", classes: ["standard-row", "menu-remove-button"]});

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
    this.operandASelectionEl.addEventListener("change", (evt) => {
      removeAllinputErros(evt);
      this.nDicesInputEl.disabled = evt.target.value !== this.specialCauses.nDices.key;
    });
    this.constantInputEl.addEventListener("change", removeAllinputErros);
    this.operandBSelectionEl.addEventListener("change", (evt) => {
      this.constantInputEl.disabled = evt.target.value !== constantText;
    });

    this.refreshOperands();

    addNewButtonEl.addEventListener("click", () => {
      if (!validateInputValue(this.operandASelectionEl)) {
        return;
      }

      const [ operandA, aType ] = this.getOperandAndType(this.operandASelectionEl);
      const [ operandB, bType ] = this.getOperandAndType(this.operandBSelectionEl);

      const operator = numberOperators[operatorSelectionEl.value];
      if (!this.validateOperation(operator, operandA, aType, operandB, bType)) {
        return;
      }
      this.generateRow(operator, operandA, aType, operandB, bType);
    });
  }

  refreshOperands() {
    const variables = this.variableManager.getAllManaged();
    const dices = this.diceManager.getAllManaged();
    let optionEls = variables.concat(dices).map(o => makeOption({text: o.key, value: o.key}));
    this.refreshOperandB(optionEls);

    const specialEls = Object.values(this.specialCauses).map(s => makeOption({text: s.name, value: s.key}));
    optionEls = optionEls.map(o => o.cloneNode(true)).concat(specialEls);
    this.refreshOperandA(optionEls);
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

  getOperandAndType(operandEl) {
    const operandKey = operandEl.value;
    if (operandKey === constantText) {
      return [ this.constantInputEl.value, premiseType.constant ];
    }

    let operand = this.diceManager.getManagedByKey(operandKey)
    let type = premiseType.dice;
    if (operand === undefined) {
      operand = this.variableManager.getManagedByKey(operandKey)
      type = premiseType.variable;
    }
    if (operand === undefined) {
      operand = this.specialCauses[operandKey];
      type = premiseType.special;
    }
    return [ operand, type ];
  }

  validateOperation(operator, operandA, aType, operandB, bType) {
    if (aType === premiseType.dice && bType === premiseType.constant) {
      const constant = operandB;
      if (constant > operandA.faces) {
        addErrorClass(this.constantInputEl);
        showToast("constant is greater than number of faces");
        return false;
      } else if (constant === operandA.faces && operator === numberOperators[">"]) {
        addErrorClass(this.operatorSelectionEl);
        addErrorClass(this.constantInputEl);
        showToast(`dice has ${operandA.faces} faces and will never be greater than ${constant}`);
        return false;
      } else if (constant === 1 && operator === numberOperators["<"]) {
        addErrorClass(this.operatorSelectionEl);
        addErrorClass(this.constantInputEl);
        showToast(`dice will never roll less than ${constant}`);
        return false;
      }
    }
    return true;
    /*TODO(thales) melhorar verificaoes de condicao*/
  }
}

const generateValueGetter = (operand, type) => () => {
  switch (type) {
    case premiseType.constant:
      return Number.parseFloat(operand);
    case premiseType.special:
      return operand.getValue();
    default:
      return Number.parseFloat(operand.value);
  }
};

function fillOperators(operatorSelectionEl) {
  const operatorOptionEls = Object.values(numberOperators).map(op => makeOption({text: op.text, value: op.text}));
  for (const opEl of operatorOptionEls) {
    operatorSelectionEl.appendChild(opEl);
  }
}

//TODO(thales) rename operand to premise
