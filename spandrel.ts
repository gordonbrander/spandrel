export type RandomFn = () => number;

export const rand: RandomFn = Math.random;

/** Choose a value from an array using a random function */
export const chooseWith = <T>(random: RandomFn, array: T[]): T | null => {
  const i = Math.floor(random() * array.length);
  return array[i] ?? null;
};

const id = <T>(x: T): T => x;

/**
 * Get value from object using an unknown key.
 * @returns value or null if key or value do not exist.
 */
const get = <T extends object, K extends keyof T>(
  object: T,
  key: unknown,
): T[K] | null => {
  if (key == null) {
    return null;
  }
  const value = object[key as K];
  if (value == null) {
    return null;
  }
  return value;
};

const TOKEN = /#(\w+)(\.(\w+))?#/g;

export type Grammar = Record<string, string[]>;
export type ModifierFn = (s: string) => string;
export type ModifierMap = Record<string, ModifierFn>;
export type FlattenFn = (grammar: Grammar, start?: string) => string;

/**
 * Create a Tracery parser.
 * Returns a function `flatten(grammar, start='#start#')` which can be called to flatten a grammar.
 */
export const parser = ({
  modifiers = {},
  random = rand,
}: {
  modifiers?: ModifierMap;
  random?: RandomFn;
} = {}): FlattenFn =>
(grammar: Grammar, start = "#start#") => {
  let depth: number = 0;

  const walk = (text: string): string => {
    depth++;
    if (depth > 999) {
      return text;
    }
    return text.replaceAll(TOKEN, (match, key, _, modifier) => {
      const branch = get(grammar, key);
      if (branch) {
        const leaf = chooseWith(random, branch) ?? "";
        const text = walk(leaf);
        const postprocess = get(modifiers, modifier) ?? id;
        return postprocess(text);
      }
      return match;
    });
  };

  return walk(start);
};

export default parser;
