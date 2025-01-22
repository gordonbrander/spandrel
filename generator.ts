export function* map<T, U>(
  iterable: Iterable<T>,
  fn: (value: T) => U,
): Generator<U> {
  for (const value of iterable) {
    yield fn(value);
  }
}
