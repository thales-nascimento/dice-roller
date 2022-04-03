import { makeFlexRow, makeButton, makeLabel, makeOption, warmup } from "./domUtils.js";
import { propositionOperators, Condition } from "./condition.js"
import Manager, { removeInputError, validateInputValue } from "./manager.js";

export default class ComplexCauseManager extends Manager {
  constructor(topLevelEl, creatorEl, simpleCauseManager) {
    super("@");
    this.topLevelEl = topLevelEl;
    this.managedListEl = topLevelEl.querySelector(".list");

    this.creatorEl = creatorEl;
    this.operandBSelectionEl = creatorEl.querySelector("#new-complex-cause-operand-b-selector");
    this.operandASelectionEl = creatorEl.querySelector("#new-complex-cause-operand-a-selector");

    this.simpleCauseManager = simpleCauseManager;
    simpleCauseManager.addChangeListener(() => this.refreshCauses());

    this.prepareAdderButton();
  }

  generateRow(operandA, operator, operandB, bIsConstant) {
    const cause = {
      name: `${operandA.key} ${operator.text} ${operandB.key}`,
      depends: new Set(),
      requiredBy: new Set(),
      condition: new Condition(operator, () => operandA.condition.check(), () => operandB.condition.check()),
    };

    if (!this.validateDuplicateManagedName(cause.name)) {
      return;
    }
    cause.key = this.nextKey();
    cause.depends.add(operandA);
    operandA.requiredBy.add(cause);
    cause.depends.add(operandB);
    operandB.requiredBy.add(cause);

    const keyEl = makeLabel({text: cause.key, classes: ["standard-row", "complex-cause-key"]});
    const nameEl = makeLabel({text: cause.name, classes: ["standard-row", "menu-label"]});
    const removeButtonEl = makeButton({text: "×", classes: ["standard-row", "menu-remove-button"]});

    cause.el = makeFlexRow({children: [keyEl, nameEl, removeButtonEl]});
    this.prepareRemoveConfirmationOnButton(removeButtonEl, cause);

    this.managed[cause.key] = cause;
    this.managedListEl.appendChild(cause.el);
    this.onChange();
  }

  prepareAdderButton() {
    const operatorSelectionEl = this.creatorEl.querySelector("#new-complex-cause-operator-selector");
    const addNewButtonEl = this.creatorEl.querySelector("#new-complex-cause-create");

    fillOperators(operatorSelectionEl);

    this.operandASelectionEl.addEventListener("change", removeInputError);
    this.operandBSelectionEl.addEventListener("change", removeInputError);

    this.refreshCauses();

    addNewButtonEl.addEventListener("click", () => {
      if (!validateInputValue(this.operandASelectionEl)) {
        return;
      }
      if (!validateInputValue(this.operandBSelectionEl)) {
        return;
      }

      const operandAKey = this.operandASelectionEl.value;
      const operandA = this.simpleCauseManager.getManagedByKey(operandAKey)
      const operandBKey = this.operandBSelectionEl.value;
      const operandB = this.simpleCauseManager.getManagedByKey(operandBKey)
      const operator = propositionOperators[operatorSelectionEl.value];

      this.generateRow(operandA, operator, operandB);
    });
  }

  refreshCauses() {
    const causes = this.simpleCauseManager.getAllManaged();
    const optionEls = causes.map(c => makeOption({text: c.key, value: c.key}));

    this.refreshOperandSelection(this.operandASelectionEl, optionEls);
    this.refreshOperandSelection(this.operandBSelectionEl, optionEls.map(v => v.cloneNode(true)));
  }

  refreshOperandSelection(selectionEl, optionEls) {
    selectionEl.innerHTML = "";
    for (const option of optionEls) {
      selectionEl.appendChild(option);
    }
    warmup("change", selectionEl);
  }
}

function fillOperators(operatorSelectionEl) {
  const operatorOptionEls = Object.values(propositionOperators).map(op => makeOption({text: op.text, value: op.text}));
  for (const opEl of operatorOptionEls) {
    operatorSelectionEl.appendChild(opEl);
  }
}
