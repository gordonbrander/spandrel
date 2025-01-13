import parser, { chooseWith } from "./spandrel.ts";
import createRandom from "./prng.ts";
import { assertEquals } from "@std/assert";

const random = createRandom("seed");

Deno.test("Spandrel parser", async (t) => {
  await t.step("handles simple substitution", () => {
    const spandrel = parser({ random });
    const grammar = {
      start: ["hello"],
    };
    assertEquals(spandrel(grammar), "hello");
  });

  await t.step("handles multiple choices", () => {
    const spandrel = parser({ random });
    const grammar = {
      start: ["a", "b", "c"],
    };
    // With our seeded random, we can expect consistent output
    assertEquals(spandrel(grammar), "b");
  });

  await t.step("handles nested substitutions", () => {
    const spandrel = parser({ random });
    const grammar = {
      start: ["The #animal# #verb#"],
      animal: ["cat", "dog"],
      verb: ["jumps", "runs"],
    };
    assertEquals(spandrel(grammar), "The dog jumps");
  });

  await t.step("handles custom start symbol", () => {
    const spandrel = parser({ random });
    const grammar = {
      greeting: ["hello", "hi"],
    };
    assertEquals(spandrel(grammar, "#greeting#"), "hello");
  });

  await t.step("preserves unknown tokens", () => {
    const spandrel = parser({ random });
    const grammar = {
      start: ["hello #nonexistent#"],
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
      start: ["#word.upper#"],
      word: ["hello"],
    };
    assertEquals(customSpandrel(grammar), "HELLO");
  });

  await t.step("handles deep recursion gracefully", () => {
    const spandrel = parser({ random });
    const grammar = {
      start: ["#a#"],
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
      start: [],
    };
    assertEquals(spandrel(grammar), "");
  });

  await t.step("handles multiple tokens in same string", () => {
    const spandrel = parser({ random });
    const grammar = {
      start: ["#adj# #noun# #verb#"],
      adj: ["big"],
      noun: ["cat"],
      verb: ["jumps"],
    };
    assertEquals(spandrel(grammar), "big cat jumps");
  });

  await t.step("gracefully handles infinite recursion", () => {
    const spandrel = parser();

    const grammar = {
      "start": ["#start#"],
    };

    const output = spandrel(grammar);
    assertEquals(output, "#start#");
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
