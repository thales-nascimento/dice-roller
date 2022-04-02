import Dice from './dice.js'
import Variable from './variable.js';


function start() {
  console.log("dom loaded, start scripts");

  const diceEl = document.querySelector("#dices-top-level");
  const dice = new Dice(diceEl);
  const variableEl = document.querySelector("#variables-top-level");
  const variable = new Variable(variableEl);
}

window.addEventListener("load", function () {
  console.log("Everything is loaded");
});

document.addEventListener("DOMContentLoaded", start);
