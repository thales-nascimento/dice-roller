import { makeFlexRow, makeButton, makeLabel, makeOption } from "./domUtils.js";
import openConfirmator from "./confirmator.js";
import { operators, Condition } from "./condition.js"

const constantText = "const";

export default class SimpleRuleManager {
  constructor(topLevelEl, simpleRuleCreatorEl, variableManager) {
    this.ruleIndex = 0;
    this.rules = {};
    this.topLevelEl = topLevelEl;

    this.simpleRuleCreatorEl = simpleRuleCreatorEl;
    this.operandBSelectionEl = simpleRuleCreatorEl.querySelector("#new-simple-rule-operand-b-selector");
    this.operandASelectionEl = simpleRuleCreatorEl.querySelector("#new-simple-rule-operand-a-selector");
    this.constantInputEl = simpleRuleCreatorEl.querySelector("#new-simple-rule-constant");

    this.variableManager = variableManager;
    this.menuEl = topLevelEl.querySelector(".menu-list");
    this.prepareAdderButton();
  }

  generateRow(operandA, operator, operandB) {
    const ruleKey = this.nextKey();
    const depends = new Set();
    depends.add(operandA.key);
    operandA.requiredBy.add(ruleKey);

    let ruleName = `${operandA.key} ${operator.text} `;

    const keyEl = makeLabel({text: ruleKey, classes: ["variable-key", "simple-rule-key"]});
    const operandALabelEl = makeLabel({text: operandA.key, classes: ["menu-label", "variable-key"]});
    const operatorLabelEl = makeLabel({text: operator.text, classes: ["menu-label", "operator"]});
    let operandBLabelEl;
    if (Number.parseFloat(operandB)) {
      ruleName += operandB.toString();
      operandBLabelEl = makeLabel({text: operandB.toString(), classes: ["menu-label", "constant"]});
    } else {
      ruleName += operandB.key;
      depends.add(operandB.key);
      operandB.requiredBy.add(ruleKey);
      operandBLabelEl = makeLabel({text: operandB.key, classes: ["menu-label", "variable-key"]});
    }
    const removeButtonEl = makeButton({text: "×", classes: ["menu-remove-button"]});

    const rowEl = makeFlexRow({children: [keyEl, operandALabelEl, operatorLabelEl, operandBLabelEl, removeButtonEl]});
    removeButtonEl.addEventListener("click", (evt) => {
      evt.stopPropagation();
      const rect = rowEl.getBoundingClientRect();
      const x = rect.right + 4;
      const y = rect.top;
      openConfirmator(x, y, `Delete rule ${ruleName} ?`, () => this.removeRule(ruleKey));
    });

    this.rules[ruleKey] = {
      key: ruleKey,
      el: rowEl,
      depends: depends,
      requiredBy: new Set(),
    };
    this.menuEl.appendChild(rowEl);
  }

  removeRule(ruleKey) {
    this.menuEl.removeChild(this.rules[ruleKey].el);
    delete this.rules[ruleKey];
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
