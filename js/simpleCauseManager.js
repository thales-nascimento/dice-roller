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
    this.premiseBSelectionEl = creatorEl.querySelector("#new-simple-cause-premise-b-selector");
    this.premiseASelectionEl = creatorEl.querySelector("#new-simple-cause-premise-a-selector");
    this.constantInputEl = creatorEl.querySelector("#new-simple-cause-constant");
    this.nDicesInputEl = creatorEl.querySelector("#new-simple-cause-n-dices");

    this.diceManager = diceManager;
    diceManager.addChangeListener(() => this.refreshPremises());

    this.variableManager = variableManager;
    variableManager.addChangeListener(() => this.refreshPremises());

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
        getValue: (n) => ({groupMode: groupMode.n, values: this.diceManager.getDiceValues(), n: n}),
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

  generateRow(operator, premiseA, aType, premiseB, bType, n) {
    const leftName = premiseA === this.specialCauses.nDices ? `${n} dices` : premiseA.key;
    const rightName = bType === premiseType.constant ? premiseB : premiseB.key;
    const cause = {
      name: `${leftName} ${operator.text} ${rightName}`,
      condition: new Condition(operator, generateValueGetter(premiseA, aType, n), generateValueGetter(premiseB, bType)),
      depends: new Set(),
      requiredBy: new Set(),
      check: () => cause.condition.check(),
    };

    if (!this.validateDuplicateManagedName(cause.name)) {
      return;
    }
    cause.key = this.nextKey();
    cause.depends.add(premiseA);
    premiseA.requiredBy.add(cause);
    if (bType !== premiseType.constant) {
      cause.depends.add(premiseB);
      premiseB.requiredBy.add(cause);
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
      this.premiseASelectionEl.classList.remove("input-error");
      this.constantInputEl.classList.remove("input-error");
    }

    operatorSelectionEl.addEventListener("change", removeAllinputErros);
    this.premiseASelectionEl.addEventListener("change", (evt) => {
      removeAllinputErros(evt);
      this.nDicesInputEl.disabled = evt.target.value !== this.specialCauses.nDices.key;
    });
    this.constantInputEl.addEventListener("change", removeAllinputErros);
    this.premiseBSelectionEl.addEventListener("change", (evt) => {
      this.constantInputEl.disabled = evt.target.value !== constantText;
    });

    this.refreshPremises();

    addNewButtonEl.addEventListener("click", () => {
      if (!validateInputValue(this.premiseASelectionEl)) {
        return;
      }

      const [ premiseA, aType ] = this.getPremiseAndType(this.premiseASelectionEl);
      const [ premiseB, bType ] = this.getPremiseAndType(this.premiseBSelectionEl);
      const n = Number.parseInt(this.nDicesInputEl.value);

      const operator = numberOperators[operatorSelectionEl.value];
      if (!this.validateOperation(operator, premiseA, aType, premiseB, bType)) {
        return;
      }

      this.generateRow(operator, premiseA, aType, premiseB, bType, n);
    });
  }

  refreshPremises() {
    const variables = this.variableManager.getAllManaged();
    const dices = this.diceManager.getAllManaged();
    let optionEls = variables.concat(dices).map(o => makeOption({text: o.key, value: o.key}));
    this.refreshPremiseB(optionEls);

    const specialEls = Object.values(this.specialCauses).map(s => makeOption({text: s.name, value: s.key}));
    optionEls = optionEls.map(o => o.cloneNode(true)).concat(specialEls);
    this.refreshPremiseA(optionEls);
  }

  refreshPremiseB(optionEls) {
    this.premiseBSelectionEl.innerHTML = "";
    const constantOptionEl = makeOption({text: constantText, value: constantText});
    this.premiseBSelectionEl.appendChild(constantOptionEl);
    for (const optionEl of optionEls) {
      this.premiseBSelectionEl.appendChild(optionEl);
    }
    warmup("change", this.premiseBSelectionEl);
  }

  refreshPremiseA(optionEls) {
    this.premiseASelectionEl.innerHTML = "";
    for (const optionEl of optionEls) {
      this.premiseASelectionEl.appendChild(optionEl);
    }
    warmup("change", this.premiseASelectionEl);
  }

  getPremiseAndType(premiseEl) {
    const premiseKey = premiseEl.value;
    if (premiseKey === constantText) {
      return [ this.constantInputEl.value, premiseType.constant ];
    }

    let premise = this.diceManager.getManagedByKey(premiseKey)
    let type = premiseType.dice;
    if (premise === undefined) {
      premise = this.variableManager.getManagedByKey(premiseKey)
      type = premiseType.variable;
    }
    if (premise === undefined) {
      premise = this.specialCauses[premiseKey];
      type = premiseType.special;
    }
    return [ premise, type ];
  }

  validateOperation(operator, premiseA, aType, premiseB, bType) {
    if (aType === premiseType.dice && bType === premiseType.constant) {
      const constant = premiseB;
      if (constant > premiseA.faces) {
        addErrorClass(this.constantInputEl);
        showToast("constant is greater than number of faces");
        return false;
      } else if (constant === premiseA.faces && operator === numberOperators[">"]) {
        addErrorClass(this.operatorSelectionEl);
        addErrorClass(this.constantInputEl);
        showToast(`dice has ${premiseA.faces} faces and will never be greater than ${constant}`);
        return false;
      } else if (constant === 1 && operator === numberOperators["<"]) {
        addErrorClass(this.operatorSelectionEl);
        addErrorClass(this.constantInputEl);
        showToast(`dice will never roll less than ${constant}`);
        return false;
      }
    }
    return true;
  }
}

const generateValueGetter = (premise, type, n) => () => {
  switch (type) {
    case premiseType.constant:
      return Number.parseFloat(premise);
    case premiseType.special:
      return premise.getValue(n);
    default:
      return Number.parseFloat(premise.value);
  }
};

function fillOperators(operatorSelectionEl) {
  const operatorOptionEls = Object.values(numberOperators).map(op => makeOption({text: op.text, value: op.text}));
  for (const opEl of operatorOptionEls) {
    operatorSelectionEl.appendChild(opEl);
  }
}
