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
}
