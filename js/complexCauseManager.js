import { makeFlexRow, makeButton, makeLabel, makeOption, warmup, addErrorClass } from "./domUtils.js";
import { propositionOperators, Condition } from "./condition.js"
import Manager, { removeInputError, validateInputValue } from "./manager.js";
import showToast from "./toast.js";

export default class ComplexCauseManager extends Manager {
  constructor(topLevelEl, creatorEl, simpleCauseManager) {
    super("@");
    this.topLevelEl = topLevelEl;
    this.managedListEl = topLevelEl.querySelector(".list");

    this.creatorEl = creatorEl;
    this.premiseBSelectionEl = creatorEl.querySelector("#new-complex-cause-premise-b-selector");
    this.premiseASelectionEl = creatorEl.querySelector("#new-complex-cause-premise-a-selector");

    this.simpleCauseManager = simpleCauseManager;
    simpleCauseManager.addChangeListener(() => this.refreshCauses());

    this.prepareAdderButton();
  }

  generateRow(premiseA, operator, premiseB) {
    const cause = {
      name: `${premiseA.key} ${operator.text} ${premiseB.key}`,
      depends: new Set(),
      requiredBy: new Set(),
      condition: new Condition(operator, () => premiseA.check(), () => premiseB.check()),
      check: () => cause.condition.check(),
    };

    if (!this.validateDuplicateManagedName(cause.name)) {
      return;
    }
    cause.key = this.nextKey();
    cause.depends.add(premiseA);
    premiseA.requiredBy.add(cause);
    cause.depends.add(premiseB);
    premiseB.requiredBy.add(cause);

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

    const removeAllinputErros = () => {
      this.premiseASelectionEl.classList.remove("input-error");
      this.premiseBSelectionEl.classList.remove("input-error");
    }
    this.premiseASelectionEl.addEventListener("change", removeAllinputErros);
    this.premiseBSelectionEl.addEventListener("change", removeAllinputErros);

    this.refreshCauses();

    addNewButtonEl.addEventListener("click", () => {
      if (!validateInputValue(this.premiseASelectionEl)) {
        return;
      }
      if (!validateInputValue(this.premiseBSelectionEl)) {
        return;
      }

      const premiseAKey = this.premiseASelectionEl.value;
      const premiseBKey = this.premiseBSelectionEl.value;
      if (premiseAKey === premiseBKey) {
        addErrorClass(this.premiseASelectionEl);
        addErrorClass(this.premiseBSelectionEl);
        showToast(`Premises are the same`);
        return false;
      }

      const premiseA = this.simpleCauseManager.getManagedByKey(premiseAKey)
      const premiseB = this.simpleCauseManager.getManagedByKey(premiseBKey)
      const operator = propositionOperators[operatorSelectionEl.value];

      this.generateRow(premiseA, operator, premiseB);
    });
  }

  refreshCauses() {
    const causes = this.simpleCauseManager.getAllManaged();
    const optionEls = causes.map(c => makeOption({text: c.key, value: c.key}));

    this.refreshpremiseSelection(this.premiseASelectionEl, optionEls);
    this.refreshpremiseSelection(this.premiseBSelectionEl, optionEls.map(v => v.cloneNode(true)));
  }

  refreshpremiseSelection(selectionEl, optionEls) {
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
