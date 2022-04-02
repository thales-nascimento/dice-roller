import { makeFlexRow, makeButton, makeLabel, makeOption } from "./domUtils.js";
import openConfirmator from "./confirmator.js";
import { operators, Condition } from "./condition.js"

const constantText = "const";

export default class SimpleRuleManager {
  constructor(topLevelEl, simpleRuleCreatorEl, variableManager) {
    this.ruleIndex = 0;
    this.rules = {};

    this.topLevelEl = topLevelEl;
    this.menuEl = topLevelEl.querySelector(".menu-list");

    this.simpleRuleCreatorEl = simpleRuleCreatorEl;
    this.operandBSelectionEl = simpleRuleCreatorEl.querySelector("#new-simple-rule-operand-b-selector");
    this.operandASelectionEl = simpleRuleCreatorEl.querySelector("#new-simple-rule-operand-a-selector");
    this.constantInputEl = simpleRuleCreatorEl.querySelector("#new-simple-rule-constant");

    this.variableManager = variableManager;
    variableManager.addChangeListener(() => this.refreshVariables());

    this.prepareAdderButton();
  }

  generateRow(operandA, operator, operandB) {
    const rule = {
      name: `${operandA.key} ${operator.text} `,
      key: this.nextKey(),
      depends: new Set(),
      requiredBy: new Set(),
      manager: this,
    };
    rule.depends.add(operandA);
    operandA.requiredBy.add(rule);

    const keyEl = makeLabel({text: rule.key, classes: ["variable-key", "simple-rule-key"]});
    const operandALabelEl = makeLabel({text: operandA.key, classes: ["menu-label", "variable-key"]});
    const operatorLabelEl = makeLabel({text: operator.text, classes: ["menu-label", "operator"]});
    let operandBLabelEl;
    if (Number.parseFloat(operandB)) {
      rule.name += operandB.toString();
      operandBLabelEl = makeLabel({text: operandB.toString(), classes: ["menu-label", "constant"]});
    } else {
      rule.name += operandB.key;
      rule.depends.add(operandB);
      operandB.requiredBy.add(rule);
      operandBLabelEl = makeLabel({text: operandB.key, classes: ["menu-label", "variable-key"]});
    }
    const removeButtonEl = makeButton({text: "×", classes: ["menu-remove-button"]});

    rule.el = makeFlexRow({children: [keyEl, operandALabelEl, operatorLabelEl, operandBLabelEl, removeButtonEl]});
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

  nextKey() {
    this.ruleIndex += 1;
    return `#${this.ruleIndex}`
  }

  prepareAdderButton() {
    const operatorSelectionEl = this.simpleRuleCreatorEl.querySelector("#new-simple-rule-operator-selector");
    const operatorOptionEls = Object.values(operators).map(op => makeOption({text: op.text, value: op.text}));
    for (const opEl of operatorOptionEls) {
      operatorSelectionEl.appendChild(opEl);
    }
    this.refreshVariables();
    const addNewButtonEl = this.simpleRuleCreatorEl.querySelector("#new-simple-rule-create");
    addNewButtonEl.addEventListener("click", () => {
      const operandA = this.variableManager.getVariableByKey(this.operandASelectionEl.value);
      const operator = operators[operatorSelectionEl.value];
      let operandB;
      if (this.operandBSelectionEl.value !== constantText) {
        operandB = this.variableManager.getVariableByKey(this.operandBSelectionEl.value);
      } else {
        operandB = this.constantInputEl.value;
      }
      this.generateRow(operandA, operator, operandB);
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
  }

  refreshOperandA(variableOptionEls) {
    this.operandASelectionEl.innerHTML = "";
    for (const variableEl of variableOptionEls) {
      this.operandASelectionEl.appendChild(variableEl);
    }
  }
}

/*TODO(thales) não permitir adicionar duplicatas */;
