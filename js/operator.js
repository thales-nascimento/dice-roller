class Operator {
  constructor(text, func) {
    this.text =  text;
    this.apply = func;
  }
}

export const gt = new Operator(">", (a, b) => a > b);
export const ge = new Operator("≥", (a, b) => a >= b);
export const eq = new Operator("=", (a, b) => a == b);
export const ne = new Operator("≠", (a, b) => a != b);
export const le = new Operator("≤", (a, b) => a <= b);
export const lt = new Operator("<", (a, b) => a < b);
