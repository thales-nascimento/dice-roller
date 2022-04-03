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

export const groupMode = {
  all: Symbol("all"),
  any: Symbol("any"),
  n: Symbol("n"),
}

export class Condition {
  constructor(operator, operandAGetter, operandBGetter) {
    this.operator = operator;
    this.operandAGetter = operandAGetter;
    this.operandBGetter = operandBGetter;
  }

  check() {
    const opA = this.operandAGetter();
    const opB = this.operandBGetter();
    console.assert(Number.parseFloat(opB) !== NaN, "operand b must be a number.");
    if (Number.parseFloat(opA) !== NaN) {
      const mode = opA.groupMode;
      const n = opA.n;

      if (mode === groupMode.all) {
        return opA.values.every(a => this.operator.apply(a, opB));
      } else if (mode === groupMode.any) {
        return opA.values.find(a => this.operator.apply(a, opB)) !== undefined;
      } else if (mode === groupMode.n) {
        console.assert(Number.parseFloat(n) !== NaN, "user must supply an n when using group mode n.");
        let passed = 0;
        for (const a of opA.values) {
          if (this.operator.apply(a, opB)) {
            passed += 1;
            if (passed >= n) {
              return true;
            }
          }
        }
        return false;
      }
    }
    return this.operator.apply(opA, opB);
  }
}
