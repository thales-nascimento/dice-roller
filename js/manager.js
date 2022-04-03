import { flash } from "./domUtils.js";
import openConfirmator from "./confirmator.js";
import showToast from "./toast.js";

export default class Manager {
  constructor(keyPrefix) {
    this.keyCounter = 0;
    this.changeListeners = [];
    this.managed = {};
    this.keyPrefix = keyPrefix;
  }

  nextKey() {
    this.keyCounter += 1;
    return `${this.keyPrefix}${this.keyCounter}`
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
      showToast("Remove dependencies first.");
    } else {
      for (const dep of managedInstance.depends) {
        dep.requiredBy.delete(managedInstance);
      }
      console.assert(this.managedListEl !== undefined, "all Manager subclasses must provide managedListEl.");
      this.managedListEl.removeChild(managedInstance.el);
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
      showToast("Duplicated key.");
      return false;
    }
    return true;
  }

  validateDuplicateManagedName(name) {
    for (const m of this.getAllManaged()) {
      if (m.name === name) {
        flash(m.el);
        showToast("Duplicated name.");
        return false;
      }
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
