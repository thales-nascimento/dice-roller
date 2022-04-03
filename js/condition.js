class Operator {
  constructor(text, func) {
    this.text =  text;
    this.apply = func;
  }
}

export const numberOperators = {
  ">": new Operator(">", (a, b) => a > b),
  "≥": new Operator("≥", (a, b) => a >= b),
  "=": new Operator("=", (a, b) => a == b),
  "≠": new Operator("≠", (a, b) => a != b),
  "≤": new Operator("≤", (a, b) => a <= b),
  "<": new Operator("<", (a, b) => a < b),
};

export const propositionOperators = {
  "AND": new Operator("AND", (a, b) => a && b),
  "OR": new Operator("OR", (a, b) => a || b),
};

export class Condition {
  constructor(operator, operandAGetter, operandBGetter) {
    this.operator = operator;
    this.operandAGetter = operandAGetter;
    this.operandBGetter = operandBGetter;
  }

  check() {
    const a = this.operandAGetter();
    const b = this.operandBGetter();
    return this.operator.apply(a, b);
  }
}
