import { makeLabel, makeNumberInput, makeFlexRow } from "./domUtils.js";

export default class Table {
  constructor(topLevelEl, diceManager, causalityManager) {
    this.managed = [];
    this.topLevelEl = topLevelEl;
    this.managedListEl = topLevelEl.querySelector(".list");

    this.diceManager = diceManager;
    this.diceManager.addChangeListener(() => this.refreshDices());

    this.causalityManager = causalityManager;

    this.prepareRollButton();
  }

  refreshDices() {
    const dices = this.diceManager.getAllManaged();
    this.managed = [];
    this.managedListEl.innerHTML = "";

    for (const dice of dices) {
      const { diceEl, inputEl } = makeDiceEl(dice);
      this.managedListEl.appendChild(diceEl);
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
        const rolled = rollDice(dice);
        inputEl.value = rolled;
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

function rollDice(dice) {
  let rolled = getRandomInt(1, dice.totalWeight);
  let consumed = 0;
  let i;
  for (i = 0; i < dice.faces && consumed < rolled; i += 1) {
    consumed += dice.weights[i];
  }
  return i;
}

function getRandomInt(min, maxInclusive) {
  const array = new Uint8Array(4);
  window.crypto.getRandomValues(array);
  const view = new DataView(array.buffer, 0);
  const n = view.getUint32(0, true);
  return n % (maxInclusive - min + 1) + min;
}
