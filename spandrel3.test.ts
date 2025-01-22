import { chooseWith, parser, parseRule } from "./spandrel3.ts";
import { assertEquals } from "@std/assert";
import prng from "./prng.ts";

Deno.test("tokenizeRule", async (t) => {
  await t.step("tokenizeRule - simple text", () => {
    const input = "Hello world";
    const tokens = Array.from(parseRule(input));
    assertEquals(tokens, [
      { type: "text", value: "Hello world" },
    ]);
  });

  await t.step("tokenizeRule - single rule", () => {
    const input = "#name#";
    const tokens = Array.from(parseRule(input));
    assertEquals(tokens, [
      { type: "rule", key: "name", modifiers: [] },
    ]);
  });

  await t.step("tokenizeRule - rule with modifiers", () => {
    const input = "#name.uppercase.trim#";
    const tokens = Array.from(parseRule(input));
    assertEquals(tokens, [
      { type: "rule", key: "name", modifiers: ["uppercase", "trim"] },
    ]);
  });

  await t.step("tokenizeRule - single action", () => {
    const input = "[set:value]";
    const tokens = Array.from(parseRule(input));
    assertEquals(tokens, [
      { type: "action", key: "set", value: "value" },
    ]);
  });

  await t.step("tokenizeRule - mixed content", () => {
    const input = "Hello #name#! [set:greeting]";
    const tokens = Array.from(parseRule(input));
    assertEquals(tokens, [
      { type: "text", value: "Hello " },
      { type: "rule", key: "name", modifiers: [] },
      { type: "text", value: "! " },
      { type: "action", key: "set", value: "greeting" },
    ]);
  });

  await t.step("tokenizeRule - invalid action format", () => {
    const input = "[invalid]";
    const tokens = Array.from(parseRule(input));
    assertEquals(tokens, []);
  });

  await t.step("tokenizeRule - unclosed rule", () => {
    const input = "#unclosed";
    const tokens = Array.from(parseRule(input));
    assertEquals(tokens, [
      { type: "text", value: "#unclosed" },
    ]);
  });

  await t.step("tokenizeRule - complex mixed content", () => {
    const input =
      "Hello #name.uppercase#! How are you? [set:greeting] #age# years old";
    const tokens = Array.from(parseRule(input));
    assertEquals(tokens, [
      { type: "text", value: "Hello " },
      { type: "rule", key: "name", modifiers: ["uppercase"] },
      { type: "text", value: "! How are you? " },
      { type: "action", key: "set", value: "greeting" },
      { type: "text", value: " " },
      { type: "rule", key: "age", modifiers: [] },
      { type: "text", value: " years old" },
    ]);
  });
});

const random = prng("seed");

Deno.test("Spandrel parser", async (t) => {
  await t.step("handles simple substitution", () => {
    const spandrel = parser({ random });
    const grammar = {
      origin: ["hello"],
    };
    assertEquals(spandrel(grammar), "hello");
  });

  await t.step("handles multiple choices", () => {
    const spandrel = parser({ random });
    const grammar = {
      origin: ["a", "b", "c"],
    };
    // With our seeded random, we can expect consistent output
    assertEquals(spandrel(grammar), "b");
  });

  await t.step("handles nested substitutions", () => {
    const spandrel = parser({ random });
    const grammar = {
      origin: ["The #animal# #verb#"],
      animal: ["cat", "dog"],
      verb: ["jumps", "runs"],
    };
    assertEquals(spandrel(grammar), "The dog jumps");
  });

  await t.step("handles custom origin symbol", () => {
    const spandrel = parser({ random });
    const grammar = {
      greeting: ["hello", "hi"],
    };
    assertEquals(spandrel(grammar, "#greeting#"), "hello");
  });

  await t.step("preserves unknown tokens", () => {
    const spandrel = parser({ random });
    const grammar = {
      origin: ["hello #nonexistent#"],
    };
    assertEquals(spandrel(grammar), "hello #nonexistent#");
  });

  await t.step("handles modifiers", () => {
    const customSpandrel = parser({
      random,
      modifiers: {
        upper: (s: string) => s.toUpperCase(),
      },
    });

    const grammar = {
      origin: ["#word.upper#"],
      word: ["hello"],
    };
    assertEquals(customSpandrel(grammar), "HELLO");
  });

  await t.step("handles deep recursion gracefully", () => {
    const spandrel = parser({ random });
    const grammar = {
      origin: ["#a#"],
      a: ["#b#"],
      b: ["#a#"],
    };
    // Should not stack overflow and should return something
    const result = spandrel(grammar);
    assertEquals(typeof result, "string");
  });

  await t.step("handles empty arrays", () => {
    const spandrel = parser({ random });
    const grammar = {
      origin: [],
    };
    assertEquals(spandrel(grammar), "");
  });

  await t.step("handles multiple tokens in same string", () => {
    const spandrel = parser({ random });
    const grammar = {
      origin: ["#adj# #noun# #verb#"],
      adj: ["big"],
      noun: ["cat"],
      verb: ["jumps"],
    };
    assertEquals(spandrel(grammar), "big cat jumps");
  });

  await t.step("gracefully handles infinite recursion", () => {
    const spandrel = parser();

    const grammar = {
      "origin": ["#origin#"],
    };

    const output = spandrel(grammar);
    assertEquals(output, "#origin#");
  });
});

Deno.test("chooseWith", async (t) => {
  await t.step("picks from array", () => {
    const arr = ["a", "b", "c"];
    assertEquals(chooseWith(random, arr), "a");
  });

  await t.step("returns null for empty array", () => {
    const arr: string[] = [];
    assertEquals(chooseWith(random, arr), null);
  });

  await t.step("returns single item for single item array", () => {
    const arr = ["only"];
    assertEquals(chooseWith(random, arr), "only");
  });
});
