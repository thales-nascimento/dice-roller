import { makeFlexRow, makeButton, makeLabel, flash } from "./domUtils.js";
import openConfirmator from "./confirmator.js";
import Manager from "./manager.js";

export default class EffectManager extends Manager {
  constructor(topLevelEl, creatorEl) {
    super();
    this.topLevelEl = topLevelEl;
    this.menuEl = topLevelEl.querySelector(".menu-list");

    this.creatorEl = creatorEl;

    this.prepareAdderButton();
  }

  generateRow(name) {
    const effect = {
      key: name,
      requiredBy: new Set(),
    };

    const keyEl = makeLabel({text: effect.key, classes: ["effect-key"]});
    const removeButtonEl = makeButton({text: "×", classes: ["menu-remove-button"]});
    effect.el = makeFlexRow({children: [keyEl, removeButtonEl]});
    removeButtonEl.addEventListener("click", (evt) => {
      evt.stopPropagation();
      const rect = effect.el .getBoundingClientRect();
      const x = rect.right + 4;
      const y = rect.top;
      openConfirmator(x, y, `Delete effect ${effect.key} ?`, () => this.removeEffect(effect));
    });

    this.managed[effect.key] = effect;
    this.menuEl.appendChild(effect.el );
    this.onChange();
  }

  removeEffect(variable) {
    if (variable.requiredBy.size) {
      for (const dependent of variable.requiredBy) {
        flash(dependent.el);
      }
    } else {
      this.menuEl.removeChild(variable.el);
      delete this.managed[variable.key];
      this.onChange();
    }
  }

  prepareAdderButton() {
    const nameEl = this.creatorEl.querySelector("#new-effect-name");
    const addNewButtonEl = this.creatorEl.querySelector("#new-effect-create");

    const removeInputError = (evt) => evt.target.classList.remove("input-error");
    nameEl.addEventListener("input", removeInputError);

    addNewButtonEl.addEventListener("click", () => {
      let name = nameEl.value;
      if (name === "") {
        nameEl.classList.add("input-error");
        return;
      }

      name = "eff-" + name;
      if (this.managed[name] !== undefined) {
        nameEl.classList.add("input-error");
        flash(this.managed[name].el);
        return;
      }

      this.generateRow(name);
    });
  }
}
