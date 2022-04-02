class Operator {
  constructor(text, func) {
    this.text =  text;
    this.apply = func;
  }
}

export const operators = {
  gt: new Operator(">", (a, b) => a > b),
  ge: new Operator("≥", (a, b) => a >= b),
  eq: new Operator("=", (a, b) => a == b),
  ne: new Operator("≠", (a, b) => a != b),
  le: new Operator("≤", (a, b) => a <= b),
  lt: new Operator("<", (a, b) => a < b),
};
for (const [k, v] of Object.entries(operators)) {
  operators[v.text] = v;
}

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
