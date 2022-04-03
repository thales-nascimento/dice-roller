export function setIfNotUndefined(target, key, value) {
  if (value !== undefined) {
    target[key] = value;
  }
}
