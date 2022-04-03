import { makeFlexRow, makeButton, makeLabel, makeOption, warmup } from "./domUtils.js";
import { operators } from "./condition.js"
import Manager, { removeInputError, validateInputValue } from "./manager.js";

const constantText = "const";

export default class SimpleRuleManager extends Manager {
  constructor(topLevelEl, creatorEl, diceManager, variableManager) {
    super();
    this.topLevelEl = topLevelEl;
    this.mangedListEl = topLevelEl.querySelector(".list");

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

  generateRow(name, operandA, operator, operandB) {
    const rule = {
      key: name,
      tooltip: `${operandA.key} ${operator.text} `,
      depends: new Set(),
      requiredBy: new Set(),
    };
    rule.depends.add(operandA);
    operandA.requiredBy.add(rule);

    if (Number.parseFloat(operandB)) {
      rule.tooltip += operandB.toString();
    } else {
      rule.tooltip += operandB.key;
      rule.depends.add(operandB);
      operandB.requiredBy.add(rule);
    }
    const keyEl = makeLabel({text: rule.key, tooltip: rule.tooltip, classes: ["simple-cause-key"]});
    const removeButtonEl = makeButton({text: "×", classes: ["menu-remove-button"]});

    rule.el = makeFlexRow({children: [keyEl, removeButtonEl]});
    this.prepareRemoveConfirmationOnButton(removeButtonEl, rule);

    this.managed[rule.key] = rule;
    this.mangedListEl.appendChild(rule.el);
    this.onChange();
  }

  prepareAdderButton() {
    const nameEl = this.creatorEl.querySelector("#new-simple-cause-name");
    const operatorSelectionEl = this.creatorEl.querySelector("#new-simple-cause-operator-selector");
    const addNewButtonEl = this.creatorEl.querySelector("#new-simple-cause-create");

    fillOperators(operatorSelectionEl);

    nameEl.addEventListener("input", removeInputError);
    this.operandASelectionEl.addEventListener("change", removeInputError);

    this.refreshVariables();

    addNewButtonEl.addEventListener("click", () => {
      if (!validateInputValue(nameEl)) {
        return;
      }

      const name = "cse-" + nameEl.value;
      if (!this.validateDuplicateManagedKey(name, nameEl)) {
        return;
      }

      if (!validateInputValue(this.operandASelectionEl)) {
        return;
      }

      const operandAKey = this.operandASelectionEl.value;
      const operandA = this.diceManager.getManagedByKey(operandAKey) || this.variableManager.getManagedByKey(operandAKey);
      const operator = operators[operatorSelectionEl.value];
      let operandB;
      if (this.operandBSelectionEl.value !== constantText) {
        const operandBKey = this.operandBSelectionEl.value;
        operandB = this.diceManager.getManagedByKey(operandBKey) || this.variableManager.getManagedByKey(operandBKey);
      } else {
        //TODO(thales) check if constant makes sense against dice
        operandB = this.constantInputEl.value;
      }
      this.generateRow(name, operandA, operator, operandB);
    });
  }

  refreshVariables() {
    const variables = this.variableManager.getAllManaged();
    const dices = this.diceManager.getAllManaged();
    const optionEls = variables.concat(dices).map(v => makeOption({text: v.key, value: v.key}));

    this.refreshOperandA(optionEls);
    this.refreshOperandB(optionEls.map(v => v.cloneNode(true)));
  }

  refreshOperandB(variableOptionEls) {
    this.operandBSelectionEl.innerHTML = "";
    const constantOptionEl = makeOption({text: constantText, value: constantText});
    this.operandBSelectionEl.appendChild(constantOptionEl);
    for (const variableEl of variableOptionEls) {
      this.operandBSelectionEl.appendChild(variableEl);
    }
    this.operandBSelectionEl.addEventListener("change", (evt) => {
      this.constantInputEl.disabled = evt.target.value !== constantText;
    });
    warmup("change", this.operandBSelectionEl);
  }

  refreshOperandA(variableOptionEls) {
    this.operandASelectionEl.innerHTML = "";
    for (const variableEl of variableOptionEls) {
      this.operandASelectionEl.appendChild(variableEl);
    }
    warmup("change", this.operandASelectionEl);
  }
}

function fillOperators(operatorSelectionEl) {
  const operatorOptionEls = Object.values(operators).map(op => makeOption({text: op.text, value: op.text}));
  for (const opEl of operatorOptionEls) {
    operatorSelectionEl.appendChild(opEl);
  }
}

/*TODO(thales) não permitir adicionar duplicatas */;
