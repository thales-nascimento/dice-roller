import { makeFlexRow, makeButton, makeLabel, makeOption, warmup } from "./domUtils.js";
import Manager, { removeInputError, validateInputValue } from "./manager.js";

export default class CausalityManager extends Manager {
  constructor(topLevelEl, creatorEl, simpleRuleManager, effectManger) {
    super();
    this.topLevelEl = topLevelEl;
    this.mangedListEl = topLevelEl.querySelector(".list");

    this.creatorEl = creatorEl;
    this.causeSelectionEl = creatorEl.querySelector("#new-causality-cause");
    this.effectionSelectionEl = creatorEl.querySelector("#new-causality-effect");

    this.simpleRuleManager = simpleRuleManager;
    simpleRuleManager.addChangeListener(() => this.refreshCauses());

    this.effectManager = effectManger;
    effectManger.addChangeListener(() => this.refreshEffects());

    this.prepareAdderButton();
  }

  generateRow(name, cause, effect) {
    const causality = {
      key: name,
      tooltip: `if ${cause.key} then ${effect.key}`,
      cause,
      effect,
      depends: new Set(),
      requiredBy: new Set(),
    };
    causality.depends.add(cause);
    cause.requiredBy.add(causality);
    causality.depends.add(effect);
    effect.requiredBy.add(causality);

    const keyEl = makeLabel({text: causality.key, tooltip: causality.tooltip, classes: ["causality-key"]});
    const removeButtonEl = makeButton({text: "×", classes: ["menu-remove-button"]});

    causality.el = makeFlexRow({children: [keyEl, removeButtonEl]});
    this.prepareRemoveConfirmationOnButton(removeButtonEl, causality);

    this.managed[causality.key] = causality;
    this.mangedListEl.appendChild(causality.el);
  }

  prepareAdderButton() {
    const nameEl = this.creatorEl.querySelector("#new-causality-name");
    const effectSelectionEl = this.creatorEl.querySelector("#new-causality-effect");
    const addNewButtonEl = this.creatorEl.querySelector("#new-causality-create");

    nameEl.addEventListener("input", removeInputError);
    this.causeSelectionEl.addEventListener("change", removeInputError);

    this.refreshCauses();
    this.refreshEffects();

    addNewButtonEl.addEventListener("click", () => {
      if (!validateInputValue(nameEl)) {
        return;
      }

      const name = "cfx-" + nameEl.value;
      if (!this.validateDuplicateManagedKey(name, nameEl)) {
        return;
      }

      if (!validateInputValue(this.causeSelectionEl)) {
        return;
      }

      if (!validateInputValue(effectSelectionEl)) {
        return;
      }

      const cause = this.simpleRuleManager.getManagedByKey(this.causeSelectionEl.value);
      const effect = this.effectManager.getManagedByKey(effectSelectionEl.value);

      this.generateRow(name, cause, effect);
    });
  }

  refreshCauses() {
    const causes = this.simpleRuleManager.getAllManaged();
    const optionEls = causes.map(r => makeOption({text: r.key, value: r.key}));

    this.causeSelectionEl.innerHTML = "";
    for (const ruleEl of optionEls) {
      this.causeSelectionEl.appendChild(ruleEl);
    }
    warmup("change", this.causeSelectionEl);
  }

  refreshEffects() {
    const effects = this.effectManager.getAllManaged();
    const optionEls = effects.map(e => makeOption({text: e.key, value: e.key}));

    this.effectionSelectionEl.innerHTML = "";
    for (const ruleEl of optionEls) {
      this.effectionSelectionEl.appendChild(ruleEl);
    }
    warmup("change", this.effectionSelectionEl);
  }
}

/*TODO(thales) não permitir adicionar duplicatas */;
