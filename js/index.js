import Dice from './diceManager.js'
import SimpleCauseManager from './simpleCauseManager.js';
import VariableManager from './variableManager.js';
import EffectManager from './effectManager.js';
import CausalityManager from './causalityManager.js';
import Table from './table.js';


function start() {
  console.log("dom loaded, start scripts");

  const diceEl = document.querySelector("#dices-top-level");
  const diceCreatorEl = document.querySelector("#new-dice");
  const diceManager = new Dice(diceEl, diceCreatorEl);

  const variableEl = document.querySelector("#variables-top-level");
  const variableCreatorEl = document.querySelector("#new-variable");
  const variableManager = new VariableManager(variableEl, variableCreatorEl);

  const simplecauseEl = document.querySelector("#simple-causes-top-level");
  const simpleCauseCreatorEl = document.querySelector("#new-simple-cause");
  const simpleCauseManager = new SimpleCauseManager(simplecauseEl, simpleCauseCreatorEl, diceManager, variableManager);

  const effectEl = document.querySelector("#effects-top-level");
  const effectCreatorEl = document.querySelector("#new-effect");
  const effectManager = new EffectManager(effectEl, effectCreatorEl);

  const conditionEl = document.querySelector("#conditions-top-level");
  const conditionsCreatorEl = document.querySelector("#new-causality");
  const causalityManager = new CausalityManager(conditionEl, conditionsCreatorEl, simpleCauseManager, effectManager);

  const tableEl = document.querySelector("#table-top-level")
  const table = new Table(tableEl, diceManager, causalityManager);
}

window.addEventListener("load", function () {
  console.log("Everything is loaded");
});

document.addEventListener("DOMContentLoaded", start);
