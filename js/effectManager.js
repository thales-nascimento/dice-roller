import { makeFlexRow, makeButton, makeLabel } from "./domUtils.js";
import Manager, { validateInputValue , removeInputError } from "./manager.js";

export default class EffectManager extends Manager {
  constructor(topLevelEl, creatorEl) {
    super("★");
    this.topLevelEl = topLevelEl;
    this.mangedListEl = topLevelEl.querySelector(".list");

    this.creatorEl = creatorEl;

    this.prepareAdderButton();
    this.generatePresets();
  }

  generatePresets() {
    this.generateRow(this.keyPrefix + "Success");
    this.generateRow(this.keyPrefix + "Failure");
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
      if (!validateInputValue(nameEl)) {
        return;
      }

      const name = this.keyPrefix + nameEl.value;
      if (!this.validateDuplicateManagedKey(name, nameEl)) {
        return;
      }

      this.generateRow(name);
    });
  }
}
