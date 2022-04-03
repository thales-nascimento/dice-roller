import { flash } from "./domUtils.js";
import openConfirmator from "./confirmator.js";

export default class Manager {
  constructor() {
    this.changeListeners = [];
    this.managed = {};
  }

  getAllManaged() {
    return Object.values(this.managed);
  }

  getManagedByKey(key) {
    return this.managed[key];
  }

  addChangeListener(callback) {
    this.changeListeners.push(callback);
  }

  onChange() {
    for (const cb of this.changeListeners) {
      cb();
    }
  }

  removeManaged(managedInstance) {
    if (managedInstance.requiredBy.size) {
      for (const dependent of managedInstance.requiredBy) {
        flash(dependent.el);
      }
    } else {
      for (const dep of managedInstance.depends) {
        dep.requiredBy.delete(managedInstance);
      }
      console.assert(this.mangedListEl !== undefined, "all Manager subclasses must provide mangedListEl.");
      this.mangedListEl.removeChild(managedInstance.el);
      delete this.managed[managedInstance.key];
      this.onChange();
    }
  }

  prepareRemoveConfirmationOnButton(buttonEl, managedInstance) {
    buttonEl.addEventListener("click", (evt) => {
      evt.stopPropagation();
      const rect = managedInstance.el.getBoundingClientRect();
      const x = rect.right + 4;
      const y = rect.top;
      openConfirmator(x, y, `Delete ${managedInstance.key}?`, () => this.removeManaged(managedInstance));
    });
  }

  validateDuplicateManagedKey(key, inputEl) {
    if (this.managed[key] !== undefined) {
      if (inputEl !== undefined) {
        inputEl.classList.add("input-error");
      }
      flash(this.managed[key].el);
      return false;
    }
    return true;
  }
}

export function removeInputError(evt) {
  evt.target.classList.remove("input-error");
}

export function validateInputValue(el) {
  if (el.value === "") {
    el.classList.add("input-error");
    return false;
  }
  return true;
}
