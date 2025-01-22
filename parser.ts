export type ParserState = {
  text: string;
  from: number;
  to: number;
  saved: number;
};

export const isExhausted = ({ to, text }: ParserState): boolean =>
  to >= text.length;

export const take = (state: ParserState): string => {
  const char = state.text[state.to];
  state.to = state.to + 1;
  return char;
};

export const peek = (state: ParserState): string => state.text[state.to];

export const cut = (state: ParserState): string => {
  const text = state.text.slice(state.from, state.to);
  state.from = state.to;
  return text;
};

export const save = (state: ParserState) => {
  state.saved = state.to;
  return state;
};

export const backtrack = (state: ParserState) => {
  state.to = state.saved;
  return state;
};
