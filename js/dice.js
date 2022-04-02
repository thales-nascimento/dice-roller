import { makeFlexRow, makeButton, makeLabel } from "./domUtils.js";
import openConfirmator from "./confirmator.js";

const presets = [4, 6, 8, 10, 12, 20].map(makeBalancedDice);

export default class Dice {
  constructor(topLevelEl) {
    this.topLevelEl = topLevelEl;
    this.menuEl = topLevelEl.querySelector(".menu-list");
    this.addNewButtonEl = topLevelEl.querySelector(".menu-adder-button")
    this.generateMenu();
  }

  generateMenu() {
    for (let i = 0; i < presets.length; i += 1) {
      const rowEl = this.generateRow(i);
      this.menuEl.appendChild(rowEl);
    }
  }

  generateRow(i) {
    const preset = presets[i];
    const labelEl = makeLabel({text: preset.name, classes: ["menu-label"]});
    const removeButtonEl = makeButton({text: "×", classes: ["menu-remove-button"]});
    const rowEl = makeFlexRow({children: [labelEl, removeButtonEl]});
    removeButtonEl.addEventListener("click", (evt) => {
      evt.stopPropagation();
      const rect = removeButtonEl.getBoundingClientRect();
      const x = rect.right + 4;
      const y = rect.top;
      openConfirmator(x, y, () => this.removePreset(i, rowEl));
    });
    return rowEl;
  }

  removePreset(i, el) {
    presets.splice(i, 1);
    this.menuEl.removeChild(el);
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
