import { makeFlexRow, makeButton, makeLabel, flash } from "./domUtils.js";
import Manager, { removeInputError } from "./manager.js";

export default class EffectManager extends Manager {
  constructor(topLevelEl, creatorEl) {
    super();
    this.topLevelEl = topLevelEl;
    this.mangedListEl = topLevelEl.querySelector(".list");

    this.creatorEl = creatorEl;

    this.prepareAdderButton();
  }

  generateRow(name) {
    const effect = {
      key: name,
      requiredBy: new Set(),
      depends: new Set(),
    };

    const keyEl = makeLabel({text: effect.key, classes: ["effect-key"]});
    const removeButtonEl = makeButton({text: "×", classes: ["menu-remove-button"]});
    effect.el = makeFlexRow({children: [keyEl, removeButtonEl]});
    this.prepareRemoveConfirmationOnButton(removeButtonEl, effect);

    this.managed[effect.key] = effect;
    this.mangedListEl.appendChild(effect.el );
    this.onChange();
  }

  prepareAdderButton() {
    const nameEl = this.creatorEl.querySelector("#new-effect-name");
    const addNewButtonEl = this.creatorEl.querySelector("#new-effect-create");

    nameEl.addEventListener("input", removeInputError);

    addNewButtonEl.addEventListener("click", () => {
      let name = nameEl.value;
      if (name === "") {
        nameEl.classList.add("input-error");
        return;
      }

      name = "★" + name;
      if (this.managed[name] !== undefined) {
        nameEl.classList.add("input-error");
        flash(this.managed[name].el);
        return;
      }

      this.generateRow(name);
    });
  }
}

//TODO(thales) add presets
