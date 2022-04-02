import { makeFlexRow, makeButton, makeLabel, makeNumberInput } from "./domUtils.js";
import openConfirmator from "./confirmator.js";

export default class DiceManager {
  constructor(topLevelEl, creatorEl) {
    this.diceIndex = 0;
    this.dices = {};
    this.changeListeners = [];

    this.topLevelEl = topLevelEl;
    this.menuEl = topLevelEl.querySelector(".menu-list");

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
      name: `d${weights.length}`,
      balanced: true,
      totalWeight: 0,
      requiredBy: new Set(),
    };
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
    removeButtonEl.addEventListener("click", (evt) => {
      evt.stopPropagation();
      const rect = removeButtonEl.getBoundingClientRect();
      const x = rect.right + 4;
      const y = rect.top;
      openConfirmator(x, y, `Delete dice ${dice.key} ${dice.name}?`, () => this.removeDice(dice));
    });

    this.dices[dice.key] = dice;
    this.menuEl.appendChild(dice.el);
  }

  removeDice(dice) {
    if (dice.requiredBy.size) {
      for (const dependent of dice.requiredBy) {
        dependent.el.classList.add("flash");
        dependent.el.addEventListener("animationend", () => {
          dependent.el.classList.remove("flash");
        });
      }
    } else {
      this.menuEl.removeChild(dice.el);
      delete this.dices[dice.key];
      this.onChange();
    }
  }

  nextKey() {
    this.diceIndex += 1;
    return `#${this.diceIndex}`
  }

  prepareAdderButton() {
    this.prepareFacesChange();

    const addNewButtonEl = this.creatorEl.querySelector("#new-dice-create");
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
        const inputName = `weight-${i+1}`;
        const weightLabelEl = makeLabel({ text: `${i + 1}:`, target: inputName, classes: ["dice-label"]})
        const weightInputEl = makeNumberInput({name: inputName, min: "1", value: "1", step: "1", classes: ["dice-weight-input"]});
        const faceEl = makeFlexRow({children: [ weightLabelEl, weightInputEl ], classes: ["dice-weight"]});
        this.faceWeightsEl.appendChild(faceEl);
      }
    });

    //warmup
    const event = new Event("change");
    this.facesEl.dispatchEvent(event);  // warmup

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

  addChangeListener(callback) {
    this.changeListeners.push(callback);
  }

  onChange() {
    for (const cb of this.changeListeners) {
      cb();
    }
  }
}
