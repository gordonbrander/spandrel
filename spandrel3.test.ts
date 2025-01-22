import { parseRule } from "./spandrel3.ts";
import { assertEquals } from "@std/assert";

Deno.test("tokenizeRule - simple text", () => {
  const input = "Hello world";
  const tokens = Array.from(parseRule(input));
  assertEquals(tokens, [
    { type: "text", value: "Hello world" },
  ]);
});

Deno.test("tokenizeRule - single rule", () => {
  const input = "#name#";
  const tokens = Array.from(parseRule(input));
  assertEquals(tokens, [
    { type: "rule", key: "name", modifiers: [] },
  ]);
});

Deno.test("tokenizeRule - rule with modifiers", () => {
  const input = "#name.uppercase.trim#";
  const tokens = Array.from(parseRule(input));
  assertEquals(tokens, [
    { type: "rule", key: "name", modifiers: ["uppercase", "trim"] },
  ]);
});

Deno.test("tokenizeRule - single action", () => {
  const input = "[set:value]";
  const tokens = Array.from(parseRule(input));
  assertEquals(tokens, [
    { type: "action", key: "set", value: "value" },
  ]);
});

Deno.test("tokenizeRule - mixed content", () => {
  const input = "Hello #name#! [set:greeting]";
  const tokens = Array.from(parseRule(input));
  assertEquals(tokens, [
    { type: "text", value: "Hello " },
    { type: "rule", key: "name", modifiers: [] },
    { type: "text", value: "! " },
    { type: "action", key: "set", value: "greeting" },
  ]);
});

Deno.test("tokenizeRule - invalid action format", () => {
  const input = "[invalid]";
  const tokens = Array.from(parseRule(input));
  assertEquals(tokens, []);
});

Deno.test("tokenizeRule - unclosed rule", () => {
  const input = "#unclosed";
  const tokens = Array.from(parseRule(input));
  assertEquals(tokens, [
    { type: "text", value: "#unclosed" },
  ]);
});

Deno.test("tokenizeRule - complex mixed content", () => {
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
