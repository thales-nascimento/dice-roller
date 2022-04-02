import { makeFlexRow, makeButton, makeLabel, makeOption, flash, warmup } from "./domUtils.js";
import openConfirmator from "./confirmator.js";
import effects from "./effects.js"

export default class CausalityManager {
  constructor(topLevelEl, creatorEl, simpleRuleManager, effectManger) {
    this.causalities = {};

    this.topLevelEl = topLevelEl;
    this.menuEl = topLevelEl.querySelector(".menu-list");

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
      tooltip: `if ${cause.key} then ${effect}`,
      cause,
      effect,
      depends: new Set(),
      requiredBy: new Set(),
    };
    causality.depends.add(cause);
    cause.requiredBy.add(causality);

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

    this.refreshCauses();
    this.refreshEffects();

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

      this.generateRow(name, cause, effect);
    });
  }

  refreshCauses() {
    const causes = this.simpleRuleManager.getRules();
    const optionEls = causes.map(r => makeOption({text: r.key, value: r.key}));

    this.causeSelectionEl.innerHTML = "";
    for (const ruleEl of optionEls) {
      this.causeSelectionEl.appendChild(ruleEl);
    }
    warmup("change", this.causeSelectionEl);
  }

  refreshEffects() {
    const effects = this.effectManager.getEffects();
    const optionEls = effects.map(e => makeOption({text: e.key, value: e.key}));

    this.effectionSelectionEl.innerHTML = "";
    for (const ruleEl of optionEls) {
      this.effectionSelectionEl.appendChild(ruleEl);
    }
    warmup("change", this.effectionSelectionEl);
  }
}


function fillEffects(effectSelectionEl) {
  const effectOptionEls = Object.entries(effects).map(([k, v]) => makeOption({text: v, value: k}));
  for (const effectEl of effectOptionEls) {
    effectSelectionEl.appendChild(effectEl);
  }
  warmup("change", effectSelectionEl);
}

/*TODO(thales) não permitir adicionar duplicatas */;
