import Dice from './diceManager.js'
import SimpleRuleManager from './simpleRuleManager.js';
import VariableManager from './variableManager.js';
import CausalityManager from './causalityManager.js';


function start() {
  console.log("dom loaded, start scripts");

  const diceEl = document.querySelector("#dices-top-level");
  const diceCreatorEl = document.querySelector("#new-dice");
  const diceManager = new Dice(diceEl, diceCreatorEl);

  const variableEl = document.querySelector("#variables-top-level");
  const variableCreatorEl = document.querySelector("#new-variable");
  const variableManager = new VariableManager(variableEl, variableCreatorEl);

  const simpleRuleEl = document.querySelector("#simple-rules-top-level");
  const simpleRuleCreatorEl = document.querySelector("#new-simple-rule");
  const simpleRuleManager = new SimpleRuleManager(simpleRuleEl, simpleRuleCreatorEl, diceManager, variableManager);

  const conditionEl = document.querySelector("#conditions-top-level");
  const conditionsCreatorEl = document.querySelector("#new-causality");
  const causalityManager = new CausalityManager(conditionEl, conditionsCreatorEl, diceManager, simpleRuleManager);
}

window.addEventListener("load", function () {
  console.log("Everything is loaded");
});

document.addEventListener("DOMContentLoaded", start);
