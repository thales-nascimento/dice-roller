import { makeFlexRow, makeButton, makeLabel, makeOption, warmup } from "./domUtils.js";
import Manager, { removeInputError, validateInputValue } from "./manager.js";

export default class CausalityManager extends Manager {
  constructor(topLevelEl, creatorEl, simpleCauseManager, complexCauseManager, effectManger) {
    super("⇒");
    this.topLevelEl = topLevelEl;
    this.managedListEl = topLevelEl.querySelector(".list");

    this.creatorEl = creatorEl;
    this.causeSelectionEl = creatorEl.querySelector("#new-causality-cause");
    this.effectionSelectionEl = creatorEl.querySelector("#new-causality-effect");

    this.simpleCauseManager = simpleCauseManager;
    simpleCauseManager.addChangeListener(() => this.refreshCauses());

    this.complexCauseManager = complexCauseManager;
    complexCauseManager.addChangeListener(() => this.refreshCauses());

    this.effectManager = effectManger;
    effectManger.addChangeListener(() => this.refreshEffects());

    this.prepareAdderButton();
  }

  generateRow(cause, effect) {
    const causality = {
      name: `${cause.key} ⇒ ${effect.key}`,
      tooltip: `if ${cause.key} then ${effect.key}`,
      cause,
      effect,
      depends: new Set(),
      requiredBy: new Set(),
    };

    if (!this.validateDuplicateManagedName(causality.name)) {
      return;
    }
    causality.key = this.nextKey();
    causality.depends.add(cause);
    cause.requiredBy.add(causality);
    causality.depends.add(effect);
    effect.requiredBy.add(causality);

    const keyEl = makeLabel({text: causality.key, tooltip: causality.tooltip, classes: ["causality-key"]});
    const nameEl = makeLabel({text: causality.name, tooltip: causality.tooltip, classes: ["menu-label"]});
    const removeButtonEl = makeButton({text: "×", classes: ["menu-remove-button"]});

    causality.el = makeFlexRow({children: [keyEl, nameEl, removeButtonEl]});
    this.prepareRemoveConfirmationOnButton(removeButtonEl, causality);

    this.managed[causality.key] = causality;
    this.managedListEl.appendChild(causality.el);
  }

  prepareAdderButton() {
    const effectSelectionEl = this.creatorEl.querySelector("#new-causality-effect");
    const addNewButtonEl = this.creatorEl.querySelector("#new-causality-create");

    this.causeSelectionEl.addEventListener("change", removeInputError);

    this.refreshCauses();
    this.refreshEffects();

    addNewButtonEl.addEventListener("click", () => {
      if (!validateInputValue(this.causeSelectionEl)) {
        return;
      }

      if (!validateInputValue(effectSelectionEl)) {
        return;
      }

      const causeKey = this.causeSelectionEl.value;
      const cause = this.simpleCauseManager.getManagedByKey(causeKey) || this.complexCauseManager.getManagedByKey(causeKey);
      const effect = this.effectManager.getManagedByKey(effectSelectionEl.value);

      this.generateRow(cause, effect);
    });
  }

  refreshCauses() {
    const simpleCauses = this.simpleCauseManager.getAllManaged();
    const complexCauses = this.complexCauseManager.getAllManaged();
    const optionEls = simpleCauses.concat(complexCauses).map(r => makeOption({text: r.key, value: r.key}));

    this.causeSelectionEl.innerHTML = "";
    for (const causeEl of optionEls) {
      this.causeSelectionEl.appendChild(causeEl);
    }
    warmup("change", this.causeSelectionEl);
  }

  refreshEffects() {
    const effects = this.effectManager.getAllManaged();
    const optionEls = effects.map(e => makeOption({text: e.key, value: e.key}));

    this.effectionSelectionEl.innerHTML = "";
    for (const causeEl of optionEls) {
      this.effectionSelectionEl.appendChild(causeEl);
    }
    warmup("change", this.effectionSelectionEl);
  }

  check() {
    const causalities = this.getAllManaged();
    return causalities.filter(causality => causality.cause.condition.check());
  }
}
