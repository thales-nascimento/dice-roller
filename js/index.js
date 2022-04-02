import Dice from './dice.js'


function start() {
  console.log("dom loaded, start scripts");

  const diceEl = document.querySelector("#dice-top-level");
  const dice = new Dice(diceEl);
}

window.addEventListener("load", function () {
  console.log("Everything is loaded");
});

document.addEventListener("DOMContentLoaded", start);
