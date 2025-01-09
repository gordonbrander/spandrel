import {
  isVowel,
  isAlphaNum,
  capitalize,
  capitalizeAll,
  lowercase,
  s,
  firstS,
  ed,
} from "./modifiers-eng.ts";
import { assertEquals } from "@std/assert";

Deno.test("isVowel", () => {
  assertEquals(isVowel("a"), true);
  assertEquals(isVowel("e"), true);
  assertEquals(isVowel("i"), true);
  assertEquals(isVowel("o"), true);
  assertEquals(isVowel("u"), true);
  assertEquals(isVowel("y"), false);
  assertEquals(isVowel("x"), false);
});

Deno.test("isAlphaNum", () => {
  assertEquals(isAlphaNum("a"), true);
  assertEquals(isAlphaNum("1"), true);
  assertEquals(isAlphaNum("!"), false);
  assertEquals(isAlphaNum(" "), false);
});

Deno.test("capitalize", () => {
  assertEquals(capitalize("hello"), "Hello");
  assertEquals(capitalize("world"), "World");
  assertEquals(capitalize(""), "");
});

Deno.test("capitalizeAll", () => {
  assertEquals(capitalizeAll("hello world"), "Hello World");
  assertEquals(capitalizeAll("test string"), "Test String");
  assertEquals(capitalizeAll(""), "");
});

Deno.test("lowercase", () => {
  assertEquals(lowercase("HELLO"), "hello");
  assertEquals(lowercase("World"), "world");
  assertEquals(lowercase(""), "");
});

Deno.test("s pluralization", () => {
  assertEquals(s("cat"), "cats");
  assertEquals(s("dog"), "dogs");
  assertEquals(s(""), "");
});

Deno.test("firstS pluralization", () => {
  assertEquals(firstS("cat"), "cats");
  assertEquals(firstS(""), "");
});

Deno.test("ed past tense", () => {
  assertEquals(ed("walk"), "walked");
  assertEquals(ed("jump"), "jumped");
  assertEquals(ed(""), "ed");
});
