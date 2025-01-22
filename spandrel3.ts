import {
  backtrack,
  cut,
  isExhausted,
  type ParserState,
  peek,
  save,
  take,
} from "./parser.ts";

export type Token =
  | { type: "rule"; key: string; filters: Array<string> }
  | { type: "action"; key: string; value: string }
  | { type: "text"; value: string };

export const ActionRegex = /\[([^:]+):([^\]]+)\]/;
export const RuleRegex = /#([^#]+)#/;

function* consumeRule(state: ParserState) {
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
        filters: parts.slice(1),
      };
      return;
    }
  }
  backtrack(state);
}

function* consumeAction(state: ParserState) {
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

export function* consumeText(state: ParserState) {
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

export function* tokenizeRule(
  rule: string,
) {
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
