import { makeFlexRow, makeButton, makeLabel } from "./domUtils.js";
import openConfirmator from "./confirmator.js";
import { gt } from "./operator.js"
import State from './state.js'

class Condition {
  constructor(operandGetter, operation, constant) {
    this.operandGetter = operandGetter;
    this.operation = operation;
    this.constant = constant;
  }

  check() {
    const b = this.operandGetter();
    return this.operation.apply(this.constant, b);
  }
}

export default class BasicRule {
  constructor(topLevelEl) {
    this.topLevelEl = topLevelEl;
    this.menuEl = topLevelEl.querySelector(".menu-list");
    this.addNewButtonEl = topLevelEl.querySelector(".menu-adder-button")
    this.generateMenu();
  }

  generateMenu() {
    const rowEl = this.generateMenuRow(0, "$1", gt, 7);
    this.menuEl.appendChild(rowEl);
  }

  generateMenuRow(i, variableKey, operation, constant) {
    const indexEl = makeLabel({text: `#${i + 1}`, classes: ["index-variable", "index-basic-rule"]});
    const variableLabel = makeLabel({text: variableKey, classes: ["menu-label", "index-variable"]});
    const operationLabel = makeLabel({text: `${operation.text} ${constant}`, classes: ["menu-label"]});
    const removeButtonEl = makeButton({text: "×", classes: ["menu-remove-button"]});

    const rowEl = makeFlexRow({children: [indexEl, variableLabel, operationLabel, removeButtonEl]});
    removeButtonEl.addEventListener("click", (evt) => {
      evt.stopPropagation();
      const rect = rowEl.getBoundingClientRect();
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
