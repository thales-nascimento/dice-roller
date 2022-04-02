import Dice from './dice.js'
import BasicRule from './basicRule.js';
import Variable from './variable.js';


function start() {
  console.log("dom loaded, start scripts");

  const diceEl = document.querySelector("#dices-top-level");
  const dice = new Dice(diceEl);
  const variableEl = document.querySelector("#variables-top-level");
  const variable = new Variable(variableEl);
  const simpleRuleEl = document.querySelector("#simple-rules-top-level");
  const basicRule = new BasicRule(simpleRuleEl);
}

window.addEventListener("load", function () {
  console.log("Everything is loaded");
});

document.addEventListener("DOMContentLoaded", start);
