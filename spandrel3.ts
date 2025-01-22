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

export type Rule = {
  type: "rule";
  text: string;
  key: string;
  modifiers: Array<string>;
};
export type Action = {
  type: "action";
  text: string;
  key: string;
  value: string;
};
export type Text = { type: "text"; text: string };

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
      const text = cut(state);
      const match = text.match(RuleRegex);
      if (!match) return;
      const parts = match[1].split(".");
      yield {
        type: "rule",
        text,
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
      const text = cut(state);
      const match = text.match(ActionRegex);
      if (!match) return;
      const [_all, key, value] = match;
      yield {
        type: "action",
        text,
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
    text: text,
  };
}

/**
 * Parse a Tracery rule into a sequence of tokens. Tracery uses a simple grammar
 * with three token types:
 *  - Rule: `#any.mod1.mod2#` - Expand a key from the grammar with optional modifiers
 *  - Action: `[key:value]` - Set a key in the grammar
 *  - Text: Any plain text between rules/actions
 * @param rule The tracery rule string to parse
 */
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

const renderText = (text: Text): string => text.text;

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
    const branch = state[rule.key];
    if (branch == null) {
      return rule.text;
    }
    const leaf = chooseWith(random, branch) ?? "";
    const text = render(leaf);
    const mods = getModifiers(modifiers, rule.modifiers);
    return pipeModifiers(text, mods);
  };

  const renderAction = (action: Action): string => {
    state[action.key] = [action.value];
    return "";
  };

  let depth = 0;

  const render = (leaf: string): string => {
    // Prevent call stack overflows. This can happen due to infinitely
    // recursive rules, or cycles.
    depth++;
    if (depth > 999) {
      return leaf;
    }

    const parts = map(parseRule(leaf), (token) => {
      switch (token.type) {
        case "rule":
          return renderRule(token);
        case "action":
          return renderAction(token);
        case "text":
          return renderText(token);
        default:
          throw new Error("Unknown token type");
      }
    });

    return Array.from(parts).join("");
  };

  return render(origin);
};

export default parser;
