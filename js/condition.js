class Operator {
  constructor(text, func) {
    this.text =  text;
    this.apply = func;
  }
}

export const operators = {
  ">": new Operator(">", (a, b) => a > b),
  "≥": new Operator("≥", (a, b) => a >= b),
  "=": new Operator("=", (a, b) => a == b),
  "≠": new Operator("≠", (a, b) => a != b),
  "≤": new Operator("≤", (a, b) => a <= b),
  "<": new Operator("<", (a, b) => a < b),
};

export class Condition {
  constructor(operandAGetter, operation, operandBGetter) {
    this.operandAGetter = operandAGetter;
    this.operation = operation;
    this.operandBGetter = operandBGetter;
  }

  check() {
    const a = this.operandAGetter();
    const b = this.operandBGetter();
    return this.operation.apply(a, b);
  }
}
