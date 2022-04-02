import Dice from './diceManager.js'
import SimpleRuleManager from './simpleRuleManager.js';
import VariableManager from './variableManager.js';


function start() {
  console.log("dom loaded, start scripts");

  const diceEl = document.querySelector("#dices-top-level");
  const diceManager = new Dice(diceEl);

  const variableEl = document.querySelector("#variables-top-level");
  const variableManager = new VariableManager(variableEl);

  const simpleRuleEl = document.querySelector("#simple-rules-top-level");
  const simpleRuleCreatorEl = document.querySelector("#new-simple-rule");
  const simpleRuleManager = new SimpleRuleManager(simpleRuleEl, simpleRuleCreatorEl, variableManager);
}

window.addEventListener("load", function () {
  console.log("Everything is loaded");
});

document.addEventListener("DOMContentLoaded", start);
