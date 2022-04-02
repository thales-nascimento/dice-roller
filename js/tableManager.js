export default class TableManager {
  constructor(topLevelEl, diceManager, causalityManager) {
    this.topLevelEl = topLevelEl;

    this.diceManager = diceManager;
    this.diceManager.addChangeListener(() => this.refreshDices());

    this.causalityManager = causalityManager;

    this.prepareRollButton();
  }

  refreshDices() {
    console.log("refresh dices");
  }

  prepareRollButton() {
    const rollButtonEl = this.topLevelEl.querySelector("#table-roll");
    rollButtonEl.addEventListener("click", () => {
      console.log("roll");
    });
  }
}
