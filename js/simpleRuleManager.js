import { makeFlexRow, makeButton, makeLabel, makeOption, flash, warmup } from "./domUtils.js";
import openConfirmator from "./confirmator.js";
import { operators } from "./condition.js"

const constantText = "const";

export default class SimpleRuleManager {
  constructor(topLevelEl, creatorEl, variableManager) {
    this.rules = {};

    this.topLevelEl = topLevelEl;
    this.menuEl = topLevelEl.querySelector(".menu-list");

    this.creatorEl = creatorEl;
    this.operandBSelectionEl = creatorEl.querySelector("#new-simple-rule-operand-b-selector");
    this.operandASelectionEl = creatorEl.querySelector("#new-simple-rule-operand-a-selector");
    this.constantInputEl = creatorEl.querySelector("#new-simple-rule-constant");

    this.variableManager = variableManager;
    variableManager.addChangeListener(() => this.refreshVariables());

    this.prepareAdderButton();
  }

  generateRow(name, operandA, operator, operandB) {
    const rule = {
      key: name,
      tooltip: `${operandA.key} ${operator.text} `,
      manager: this,
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
    const keyEl = makeLabel({text: rule.key, tooltip: rule.tooltip, classes: ["simple-rule-key"]});
    const removeButtonEl = makeButton({text: "×", classes: ["menu-remove-button"]});

    rule.el = makeFlexRow({children: [keyEl, removeButtonEl]});
    removeButtonEl.addEventListener("click", (evt) => {
      evt.stopPropagation();
      const rect = rule.el.getBoundingClientRect();
      const x = rect.right + 4;
      const y = rect.top;
      openConfirmator(x, y, `Delete rule ${rule.name} ?`, () => this.removeRule(rule));
    });

    this.rules[rule.key] = rule;
    this.menuEl.appendChild(rule.el);
  }

  removeRule(rule) {
    for (const dep of rule.depends) {
      console.log(dep);
      dep.requiredBy.delete(rule);
    }
    this.menuEl.removeChild(rule.el);
    delete this.rules[rule.key];
  }

  prepareAdderButton() {
    const nameEl = this.creatorEl.querySelector("#new-simple-rule-name");
    const operatorSelectionEl = this.creatorEl.querySelector("#new-simple-rule-operator-selector");
    const operatorOptionEls = Object.values(operators).map(op => makeOption({text: op.text, value: op.text}));

    for (const opEl of operatorOptionEls) {
      operatorSelectionEl.appendChild(opEl);
    }

    const removeInputError = (evt) => evt.target.classList.remove("input-error");
    nameEl.addEventListener("input", removeInputError);
    this.operandASelectionEl.addEventListener("change", removeInputError);

    this.refreshVariables();

    const addNewButtonEl = this.creatorEl.querySelector("#new-simple-rule-create");
    addNewButtonEl.addEventListener("click", () => {
      let name = nameEl.value;
      if (name === "") {
        nameEl.classList.add("input-error");
        return;
      }

      name = "%" + name;
      if (this.rules[name] !== undefined) {
        nameEl.classList.add("input-error");
        flash(this.rules[name].el);
        return;
      }

      const operandAKey = this.operandASelectionEl.value;
      if (operandAKey === "") {
        this.operandASelectionEl.classList.add("input-error");
        return;
      }

      const operandA = this.variableManager.getVariableByKey(operandAKey);
      const operator = operators[operatorSelectionEl.value];
      let operandB;
      if (this.operandBSelectionEl.value !== constantText) {
        operandB = this.variableManager.getVariableByKey(this.operandBSelectionEl.value);
      } else {
        operandB = this.constantInputEl.value;
      }
      this.generateRow(name, operandA, operator, operandB);
    });
  }

  refreshVariables() {
    const variables = this.variableManager.getVariables();
    const variableOptionEls = Object.values(variables).map(v => makeOption({text: v.key, value: v.key}));

    this.refreshOperandA(variableOptionEls);
    this.refreshOperandB(variableOptionEls.map(v => v.cloneNode(true)));
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

/*TODO(thales) não permitir adicionar duplicatas */;
