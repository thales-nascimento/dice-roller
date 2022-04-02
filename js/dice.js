import { makeFlexRow, makeButton, makeLabel } from "./domUtils.js";
import openModal from "./modal.js";

const presets = [4, 6, 8, 10, 12, 20].map(makeBalancedDice);

export default class Dice {
  constructor(diceEl) {
    this.diceEl = diceEl;
    this.diceMenuEl = diceEl.querySelector("#dice-menu");
    this.generateDiceMenu();
  }

  generateDiceMenu() {
    for (const p of presets) {
      const rowEl = this.generateDiceControlRow(p);
      this.diceMenuEl.appendChild(rowEl);
    }
  }

  generateDiceControlRow(p) {
    const removeButtonEl = makeButton({text: "×", classes: ["remove-button"]});
    const addButtonEl = makeButton({text: "+", classes: ["plus-button"]});
    const labelEl = makeLabel({text: p.name, classes: ["dice-label"]});
    const rowEl = makeFlexRow({children: [removeButtonEl, addButtonEl, labelEl]});
    removeButtonEl.addEventListener("click", () => openModal({
      title: `Remove dice ${p.name}`,
      body: `Are you sure you want to remove dice ${p.name} from presets?`,
      okCallback: () => this.removePreset(p, rowEl),
    }));
    return rowEl;
  }

  removePreset(preset, el) {
    const i = presets.indexOf(preset);
    console.assert(i !== undefined);
    presets.splice(i, 1);
    this.diceMenuEl.removeChild(el);
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
