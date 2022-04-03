import { makeLabel, makeNumberInput, makeFlexRow } from "./domUtils.js";

export default class Table {
  constructor(topLevelEl, diceManager, causalityManager) {
    this.managed = [];
    this.topLevelEl = topLevelEl;
    this.diceListEl = topLevelEl.querySelector("#table-dice-list");
    this.causalityListEL = topLevelEl.querySelector("#table-causality-list");

    this.diceManager = diceManager;
    this.diceManager.addChangeListener(() => this.refreshDices());

    this.causalityManager = causalityManager;

    this.prepareRollButton();
  }

  refreshDices() {
    const dices = this.diceManager.getAllManaged();
    this.managed = [];
    this.diceListEl.innerHTML = "";

    for (const dice of dices) {
      const { diceEl, inputEl } = makeDiceEl(dice);
      this.diceListEl.appendChild(diceEl);
      this.managed.push({
        dice,
        inputEl,
      });
    }
  }

  prepareRollButton() {
    const rollButtonEl = this.topLevelEl.querySelector("#table-roll");
    rollButtonEl.addEventListener("click", () => {
      for (const { dice, inputEl } of this.managed) {
        dice.roll(dice);
        inputEl.value = dice.value;
      }
      const triggeredCausalities = this.causalityManager.check();
      this.causalityListEL.innerHTML = "";
      for (const causality of triggeredCausalities) {
        const keyEl = makeLabel({text: causality.key, tooltip: causality.tooltip, classes: ["causality-key"]});
        const effectEl = makeLabel({text: causality.effect.key, classes: ["effect-key"]});
        const causalityEl = makeFlexRow({children: [keyEl, effectEl]});
        this.causalityListEL.appendChild(causalityEl);
      }
    });
  }
}

function makeDiceEl(dice) {
  const inputId = `table-dice-${dice.key}`;
  const keyEl = makeLabel({text: dice.key, target: inputId, tooltip: dice.tooltip, classes: ["dice-key"]});
  const nameEl = makeLabel({text: dice.name, target: inputId, tooltip: dice.tooltip, classes: ["menu-label"]});
  const inputEl = makeNumberInput({id: inputId, min: 1, max: dice.totalWeight, placeholder: "-"});
  inputEl.disabled = true;
  const diceEl = makeFlexRow({children: [keyEl, nameEl, inputEl], classes: ["rollable-dice"]});
  return { diceEl, inputEl };
}

