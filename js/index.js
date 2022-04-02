import Dice from './diceManager.js'
import BasicRule from './basicRuleManager.js';
import VariableManager from './variableManager.js';


function start() {
  console.log("dom loaded, start scripts");

  const diceEl = document.querySelector("#dices-top-level");
  const dice = new Dice(diceEl);
  const variableEl = document.querySelector("#variables-top-level");
  const variable = new VariableManager(variableEl);
  const simpleRuleEl = document.querySelector("#simple-rules-top-level");
  const basicRule = new BasicRule(simpleRuleEl);
}

window.addEventListener("load", function () {
  console.log("Everything is loaded");
});

document.addEventListener("DOMContentLoaded", start);
