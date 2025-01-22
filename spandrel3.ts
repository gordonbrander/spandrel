import {
  backtrack,
  cut,
  isExhausted,
  type ParserState,
  peek,
  save,
  take,
} from "./parser.ts";

import { map } from "./generator.ts";

export type Rule = { type: "rule"; key: string; modifiers: Array<string> };
export type Action = { type: "action"; key: string; value: string };
export type Text = { type: "text"; value: string };

export type Token =
  | Rule
  | Action
  | Text;

const RuleRegex = /#([^#]+)#/;

function* consumeRule(state: ParserState): Generator<Token> {
  save(state);
  while (!isExhausted(state)) {
    const char = take(state);
    if (char === "#") {
      const slice = cut(state);
      const match = slice.match(RuleRegex);
      if (!match) return;
      const parts = match[1].split(".");
      yield {
        type: "rule",
        key: parts[0],
        modifiers: parts.slice(1),
      };
      return;
    }
  }
  backtrack(state);
}

const ActionRegex = /\[([^:]+):([^\]]+)\]/;

function* consumeAction(state: ParserState): Generator<Token> {
  save(state);
  while (!isExhausted(state)) {
    const char = take(state);
    if (char === "]") {
      const slice = cut(state);
      const match = slice.match(ActionRegex);
      if (!match) return;
      const [_all, key, value] = match;
      yield {
        type: "action",
        key,
        value,
      };
      return;
    }
  }
  backtrack(state);
  return;
}

function* consumeText(state: ParserState): Generator<Token> {
  while (!isExhausted(state)) {
    const char = peek(state);
    if (char === "#" || char === "[") {
      break;
    }
    take(state);
  }

  const text = cut(state);
  yield {
    type: "text",
    value: text,
  };
}

export function* parseRule(
  rule: string,
): Generator<Token> {
  const state: ParserState = {
    text: rule,
    from: 0,
    to: 0,
    saved: 0,
  };

  while (!isExhausted(state)) {
    const char = take(state);
    if (char === "#") {
      yield* consumeRule(state);
      continue;
    } else if (char === "[") {
      yield* consumeAction(state);
      continue;
    } else {
      yield* consumeText(state);
      continue;
    }
  }
}

export type RandomFn = () => number;

export const rand: RandomFn = Math.random;

/** Choose a value from an array using a random function */
export const chooseWith = <T>(random: RandomFn, array: T[]): T | null => {
  const i = Math.floor(random() * array.length);
  return array[i] ?? null;
};

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

export type Grammar = Record<string, string[]>;
export type ModifierFn = (s: string) => string;
export type ModifierMap = Record<string, ModifierFn>;
export type FlattenFn = (grammar: Grammar, start?: string) => string;

const id = <T>(value: T): T => value;

const getModifiers = (
  registry: ModifierMap,
  modifiers: Array<string>,
): Array<ModifierFn> => modifiers.map((key) => registry[key] ?? id);

const pipeModifiers = (
  text: string,
  modifiers: Array<ModifierFn>,
) => modifiers.reduce((acc, fn) => fn(acc), text);

const renderText = (text: Text): string => text.value;

/**
 * Create a Tracery parser.
 * @returns a function `flatten(grammar, origin='#origin#')` which can be called to flatten a grammar.
 * @example
 * const grammar = {
 *   start: ["The #creature# #action#."],
 *   creature: ["cat", "dog", "bird"],
 *   action: ["jumps", "runs", "flies"]
 * };
 * const flatten = parser();
 * flatten(grammar);
 */
export const parser = ({
  modifiers = {},
  random = rand,
}: {
  modifiers?: ModifierMap;
  random?: RandomFn;
} = {}): FlattenFn =>
(grammar: Grammar, origin = "#origin#") => {
  const state: Grammar = { ...grammar };

  const renderRule = (rule: Rule): string => {
    const branch = get(state, rule.key) ?? [];
    const leaf = chooseWith(random, branch) ?? "";
    const text = render(leaf);
    const mods = getModifiers(modifiers, rule.modifiers);
    return pipeModifiers(text, mods);
  };

  const renderAction = (action: Action): string => {
    state[action.key] = [action.value];
    return "";
  };

  const render = (leaf: string): string => {
    const parts = map(parseRule(leaf), (token) => {
      switch (token.type) {
        case "rule":
          return renderRule(token);
        case "action":
          return renderAction(token);
        case "text":
          return renderText(token);
        default:
          throw new Error("Switch should be exhaustive");
      }
    });
    return Array.from(parts).join("");
  };

  return render(origin);
};

export default parser;
