import { makeFlexRow, makeButton, makeLabel, makeNumberInput } from "./domUtils.js";
import openConfirmator from "./confirmator.js";

export default class DiceManager {
  constructor(topLevelEl, diceCreatorEl) {
    this.topLevelEl = topLevelEl;
    this.menuEl = topLevelEl.querySelector(".menu-list");

    this.diceCreatorEl = diceCreatorEl;
    this.facesEl = diceCreatorEl.querySelector("#new-dice-faces");
    this.faceWeightsEl = diceCreatorEl.querySelector("#new-dice-face-weights");

    this.prepareAdderButton();
  }

  generateRow(i) {
    const recipe = presets[i];
    const labelEl = makeLabel({text: recipe.name, classes: ["menu-label"]});
    const removeButtonEl = makeButton({text: "×", classes: ["menu-remove-button"]});
    const rowEl = makeFlexRow({children: [labelEl, removeButtonEl]});
    removeButtonEl.addEventListener("click", (evt) => {
      evt.stopPropagation();
      const rect = removeButtonEl.getBoundingClientRect();
      const x = rect.right + 4;
      const y = rect.top;
      openConfirmator(x, y, `Delete dice ${recipe.name}?`, () => this.removePreset(i, rowEl));
    });

    this.menuEl.appendChild(rowEl);
  }

  removePreset(i, el) {
    presets.splice(i, 1);
    this.menuEl.removeChild(el);
  }

  prepareAdderButton() {
    this.prepareFacesChange();

    const addNewButtonEl = this.diceCreatorEl.querySelector("#new-dice-create");
    addNewButtonEl.addEventListener("click", () => {
      console.log("add dice");
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
    const presetsEl = this.diceCreatorEl.querySelector("#new-dice-presets");
    for (const presetEl of presetsEl.childNodes) {
      presetEl.addEventListener("click", () => {
        this.facesEl.value = presetEl.dataset.faces;
        const event = new Event("change");
        this.facesEl.dispatchEvent(event);
      });
    }
  }
}


function makeBalancedDice(faces) {
  const faceWeight = [];
  for (let i = 0; i < faces; i += 1) {
    faceWeight.push(1);
  }
  return {
    name: `d${faces}`,
    faceWeight,
  };
}
