import { makeFlexRow, makeButton, makeLabel, makeOption, flash, warmup } from "./domUtils.js";
import openConfirmator from "./confirmator.js";
import effects from "./effects.js"

export default class CausalityManager {
  constructor(topLevelEl, creatorEl, diceManager, simpleRuleManager) {
    this.causalities = {};

    this.topLevelEl = topLevelEl;
    this.menuEl = topLevelEl.querySelector(".menu-list");

    this.creatorEl = creatorEl;
    this.causeSelectionEl = creatorEl.querySelector("#new-causality-cause");
    this.rerollTargetSelectionEl = creatorEl.querySelector("#new-causality-reroll-target");

    this.diceManager = diceManager;
    diceManager.addChangeListener(() => this.refreshRerollTargets());

    this.simpleRuleManager = simpleRuleManager;
    simpleRuleManager.addChangeListener(() => this.refreshCauses());

    this.prepareAdderButton();
  }

  generateRow(name, cause, effect, rerollTarget) {
    const causality = {
      key: name,
      tooltip: `if ${cause.key} then ${effect}`,
      cause,
      effect,
      rerollTarget,
      depends: new Set(),
      requiredBy: new Set(),
    };
    causality.depends.add(cause);
    cause.requiredBy.add(causality);

    if (effect == effects.rerollSingle) {
      causality.tooltip += ` ${rerollTarget.key}`;
      causality.depends.add(rerollTarget);
      rerollTarget.requiredBy.add(causality);
    }

    const keyEl = makeLabel({text: causality.key, tooltip: causality.tooltip, classes: ["causality-key"]});
    const removeButtonEl = makeButton({text: "×", classes: ["menu-remove-button"]});

    causality.el = makeFlexRow({children: [keyEl, removeButtonEl]});
    removeButtonEl.addEventListener("click", (evt) => {
      evt.stopPropagation();
      const rect = causality.el.getBoundingClientRect();
      const x = rect.right + 4;
      const y = rect.top;
      openConfirmator(x, y, `Delete causality ${causality.key} ?`, () => this.removeCausality(causality));
    });

    this.causalities[causality.key] = causality;
    this.menuEl.appendChild(causality.el);
  }

  removeCausality(causality) {
    for (const dep of causality.depends) {
      dep.requiredBy.delete(causality);
    }
    this.menuEl.removeChild(causality.el);
    delete this.causalities[causality.key];
  }

  prepareAdderButton() {
    const nameEl = this.creatorEl.querySelector("#new-causality-name");
    const effectSelectionEl = this.creatorEl.querySelector("#new-causality-effect");
    const addNewButtonEl = this.creatorEl.querySelector("#new-causality-create");

    fillEffects(effectSelectionEl);

    const removeInputError = (evt) => evt.target.classList.remove("input-error");
    nameEl.addEventListener("input", removeInputError);
    this.causeSelectionEl.addEventListener("change", removeInputError);
    this.rerollTargetSelectionEl.addEventListener("change", removeInputError);

    effectSelectionEl.addEventListener("change", (evt) => {
      const effect = effects[evt.target.value];
      this.rerollTargetSelectionEl.disabled = effect !== effects.rerollSingle;
    });
    warmup("change", effectSelectionEl);

    this.refreshRerollTargets();
    this.refreshCauses();

    addNewButtonEl.addEventListener("click", () => {
      let name = nameEl.value;
      if (name === "") {
        nameEl.classList.add("input-error");
        return;
      }

      name = "cslty-" + name;
      if (this.causalities[name] !== undefined) {
        nameEl.classList.add("input-error");
        flash(this.causalities[name].el);
        return;
      }

      const causeKey = this.causeSelectionEl.value;
      if (causeKey === "") {
        this.causeSelectionEl.classList.add("input-error");
        return;
      }

      const cause = this.simpleRuleManager.getRuleByKey(causeKey);
      const effect = effects[effectSelectionEl.value];
      let rerollTarget = undefined;
      if (effect == effects.rerollSingle) {
        const rerollTargetKey = this.rerollTargetSelectionEl.value;
        if (rerollTargetKey === "") {
          this.rerollTargetSelectionEl.classList.add("input-error");
          return;
        }
        rerollTarget = this.diceManager.getDiceByKey(rerollTargetKey);
      }

      this.generateRow(name, cause, effect, rerollTarget);
    });
  }

  refreshRerollTargets() {
    const dices = this.diceManager.getDices();
    const optionEls = dices.map(d => makeOption({text: d.key, value: d.key}));

    this.rerollTargetSelectionEl.innerHTML = "";
    for (const diceEl of optionEls) {
      this.rerollTargetSelectionEl.appendChild(diceEl);
    }
    warmup("change", this.causeSelectionEl);
  }

  refreshCauses() {
    const rules = this.simpleRuleManager.getRules();
    const optionEls = rules.map(r => makeOption({text: r.key, value: r.key}));

    this.causeSelectionEl.innerHTML = "";
    for (const ruleEl of optionEls) {
      this.causeSelectionEl.appendChild(ruleEl);
    }
    warmup("change", this.causeSelectionEl);
  }
}


function fillEffects(effectSelectionEl) {
  const effectOptionEls = Object.entries(effects).map(([k, v]) => makeOption({text: v, value: k}));
  for (const effectEl of effectOptionEls) {
    effectSelectionEl.appendChild(effectEl);
  }
}

/*TODO(thales) não permitir adicionar duplicatas */;
