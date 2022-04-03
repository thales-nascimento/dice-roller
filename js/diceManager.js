import { makeFlexRow, makeButton, makeLabel, makeNumberInput, warmup } from "./domUtils.js";
import Manager from "./manager.js";

export default class DiceManager extends Manager {
  constructor(topLevelEl, creatorEl) {
    super();
    this.diceIndex = 0;

    this.topLevelEl = topLevelEl;
    this.mangedListEl = topLevelEl.querySelector(".list");

    this.creatorEl = creatorEl;
    this.facesEl = creatorEl.querySelector("#new-dice-faces");
    this.faceWeightsEl = creatorEl.querySelector("#new-dice-face-weights");

    this.prepareAdderButton();
  }

  generateRow(weights) {
    console.assert(Array.isArray(weights));
    const dice = {
      key: this.nextKey(),
      faces: weights.length,
      weights,
      balanced: true,
      totalWeight: 0,
      depends: new Set(),
      requiredBy: new Set(),
    };
    if (dice.faces === 2) {
      dice.name = `coin`;
    } else {
      dice.name = `dice-${weights.length}`;
    }
    for (const w of weights) {
      dice.balanced &&= w === weights[0];
      dice.totalWeight += w;
    }
    if (dice.balanced) {
      dice.tooltip = `${dice.faces} faces, fair.`;
    } else {
      console.log(dice.totalWeight);
      dice.tooltip = `${dice.faces} faces, unfair: ${weights.map(w => `${w}/${dice.totalWeight}`).join(' ')}.`;
    }
    const keyEl = makeLabel({text: dice.key, tooltip: dice.tooltip, classes: ["dice-key"]});
    const nameEl = makeLabel({text: dice.name, tooltip: dice.tooltip, classes: ["menu-label"]});
    const removeButtonEl = makeButton({text: "×", classes: ["menu-remove-button"]});
    dice.el = makeFlexRow({children: [keyEl, nameEl, removeButtonEl]});
    this.prepareRemoveConfirmationOnButton(removeButtonEl, dice);

    this.managed[dice.key] = dice;
    this.mangedListEl.appendChild(dice.el);
    this.onChange();
  }

  nextKey() {
    this.diceIndex += 1;
    return `#${this.diceIndex}`
  }

  prepareAdderButton() {
    const addNewButtonEl = this.creatorEl.querySelector("#new-dice-create");

    this.prepareFacesChange();

    addNewButtonEl.addEventListener("click", () => {
      const weights = [];
      for (const weightEl of this.faceWeightsEl.childNodes) {
        const value = weightEl.querySelector("input").value;
        weights.push(parseInt(value));
      }
      this.generateRow(weights);
    });
  }

  prepareFacesChange() {
    this.facesEl.addEventListener("change", (evt) => {
      this.faceWeightsEl.innerHTML = "";
      for (let i = 0; i < evt.target.value; i += 1) {
        const inputId = `weight-${i + 1}`;
        const weightLabelEl = makeLabel({ text: `${i + 1}:`, target: inputId, classes: ["dice-label"]})
        const weightInputEl = makeNumberInput({id: inputId, min: "1", value: "1", step: "1", classes: ["dice-weight-input"]});
        const faceEl = makeFlexRow({children: [ weightLabelEl, weightInputEl ], classes: ["dice-weight"]});
        this.faceWeightsEl.appendChild(faceEl);
      }
    });
    warmup("change", this.facesEl);

    this.preparePresets();
  }

  preparePresets() {
    const presetsEl = this.creatorEl.querySelector("#new-dice-presets");
    for (const presetEl of presetsEl.childNodes) {
      presetEl.addEventListener("click", () => {
        this.facesEl.value = presetEl.dataset.faces;
        const event = new Event("change");
        this.facesEl.dispatchEvent(event);
      });
    }
  }
}
