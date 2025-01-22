import { chooseWith, parser, parseRule } from "./spandrel.ts";
import { assertEquals } from "@std/assert";
import prng from "./prng.ts";

Deno.test("tokenizeRule", async (t) => {
  await t.step("simple text", () => {
    const input = "Hello world";
    const tokens = Array.from(parseRule(input));
    assertEquals(tokens, [
      { type: "text", text: "Hello world" },
    ]);
  });

  await t.step("single rule", () => {
    const input = "#name#";
    const tokens = Array.from(parseRule(input));
    assertEquals(tokens, [
      { type: "rule", text: "#name#", key: "name", modifiers: [] },
    ]);
  });

  await t.step("rule with modifiers", () => {
    const input = "#name.uppercase.trim#";
    const tokens = Array.from(parseRule(input));
    assertEquals(tokens, [
      {
        type: "rule",
        text: "#name.uppercase.trim#",
        key: "name",
        modifiers: ["uppercase", "trim"],
      },
    ]);
  });

  await t.step("single action", () => {
    const input = "[set:value]";
    const tokens = Array.from(parseRule(input));
    assertEquals(tokens, [
      { type: "action", text: "[set:value]", key: "set", value: "value" },
    ]);
  });

  await t.step("mixed content", () => {
    const input = "Hello #name#! [set:greeting]";
    const tokens = Array.from(parseRule(input));
    assertEquals(tokens, [
      { type: "text", text: "Hello " },
      { type: "rule", text: "#name#", key: "name", modifiers: [] },
      { type: "text", text: "! " },
      { type: "action", text: "[set:greeting]", key: "set", value: "greeting" },
    ]);
  });

  await t.step("invalid action format", () => {
    const input = "[invalid]";
    const tokens = Array.from(parseRule(input));
    assertEquals(tokens, []);
  });

  await t.step("unclosed rule", () => {
    const input = "#unclosed";
    const tokens = Array.from(parseRule(input));
    assertEquals(tokens, [
      { type: "text", text: "#unclosed" },
    ]);
  });

  await t.step("complex mixed content", () => {
    const input =
      "Hello #name.uppercase#! How are you? [set:greeting] #age# years old";
    const tokens = Array.from(parseRule(input));
    assertEquals(tokens, [
      { type: "text", text: "Hello " },
      {
        type: "rule",
        text: "#name.uppercase#",
        key: "name",
        modifiers: ["uppercase"],
      },
      { type: "text", text: "! How are you? " },
      { type: "action", text: "[set:greeting]", key: "set", value: "greeting" },
      { type: "text", text: " " },
      { type: "rule", text: "#age#", key: "age", modifiers: [] },
      { type: "text", text: " years old" },
    ]);
  });
});

Deno.test("Spandrel parser", async (t) => {
  const random = prng("seed");

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
  const random = prng("seed");

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
