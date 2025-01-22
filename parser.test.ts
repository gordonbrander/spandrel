import {
  backtrack,
  cut,
  isExhausted,
  type ParserState,
  peek,
  save,
  take,
} from "./parser.ts";

import { assertEquals } from "@std/assert";

Deno.test("isExhausted - should return true when at end of text", () => {
  const state: ParserState = {
    text: "abc",
    from: 0,
    to: 3,
    saved: 0,
  };
  assertEquals(isExhausted(state), true);
});

Deno.test("isExhausted - should return false when not at end of text", () => {
  const state: ParserState = {
    text: "abc",
    from: 0,
    to: 1,
    saved: 0,
  };
  assertEquals(isExhausted(state), false);
});

Deno.test("take - should return current character and advance position", () => {
  const state: ParserState = {
    text: "abc",
    from: 0,
    to: 0,
    saved: 0,
  };

  assertEquals(take(state), "a");
  assertEquals(state.to, 1);
  assertEquals(take(state), "b");
  assertEquals(state.to, 2);
});

Deno.test("peek - should return current character without advancing", () => {
  const state: ParserState = {
    text: "abc",
    from: 0,
    to: 1,
    saved: 0,
  };

  assertEquals(peek(state), "b");
  assertEquals(state.to, 1); // Position should not change
});

Deno.test("cut - should return slice from 'from' to 'to' and update 'from'", () => {
  const state: ParserState = {
    text: "abcdef",
    from: 0,
    to: 3,
    saved: 0,
  };

  assertEquals(cut(state), "abc");
  assertEquals(state.from, 3);
  assertEquals(state.to, 3);
});

Deno.test("save - should store current position in 'saved'", () => {
  const state: ParserState = {
    text: "abc",
    from: 0,
    to: 2,
    saved: 0,
  };

  save(state);
  assertEquals(state.saved, 2);
});

Deno.test("backtrack - should restore position from 'saved'", () => {
  const state: ParserState = {
    text: "abc",
    from: 0,
    to: 3,
    saved: 1,
  };

  backtrack(state);
  assertEquals(state.to, 1);
});

Deno.test("integration test - combining multiple operations", () => {
  const state: ParserState = {
    text: "abcdef",
    from: 0,
    to: 0,
    saved: 0,
  };

  // Take first character
  assertEquals(take(state), "a");

  // Save position
  save(state);

  // Take more characters
  assertEquals(take(state), "b");
  assertEquals(take(state), "c");

  // Backtrack to saved position
  backtrack(state);
  assertEquals(peek(state), "b");

  // Cut from start to current position
  assertEquals(cut(state), "a");
});
