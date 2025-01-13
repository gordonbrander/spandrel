# Spandrel

Spandrel is a TypeScript port of [Kate Compton's Tracery](https://tracery.io/), a simple tool for procedural text generation. Spandrel (and Tracery) can be used for many kinds of procedural generation, including stories, game dialog, dungeon level generation, creature design, game rules... whatever!

This port is designed to be easily imported and used as an ES module in modern TypeScript/JavaScript environments.

## Installing

For Deno:

```ts
import parser from "jsr:@gordonb/spandrel";
```

## Getting started

Create a grammar object and use the parser to generate text:

```ts
import { parser } from "jsr:@gordonb/spandrel";

const grammar = {
  "start": ["Once upon a time, there was #character#"],
  "character": ["a #profession#", "a #trait# #profession#"],
  "profession": ["wizard", "knight", "baker"],
  "trait": ["wise", "brave", "clumsy"]
};

// Create a parser instance
const flatten = parser();

// Flatten!
console.log(flatten(grammar)); // "Once upon a time, there was a brave knight"
```

Grammar rules are defined using `#tagName#` syntax. When the text is processed, each tag is replaced with a random selection from its corresponding array of possibilities.

## Syntax overview

### Grammar

A grammar is a key-value storage system for rules.

### Rule syntax

Each key should be followed by an array of text strings representing rules

```
"emotion" : ["happy", "sad", "proud"],
```

Rules can also contain expansion symbols, words surrounded by #'s:

```
mainCharacter: ["Brittany the Wombat"],
story : ["This is a story about #mainCharacter#"]
```

Expansion symbols can have modifiers. Modifiers can change something about the string expansion of that symbol. #animal.capitalize# or #animal.a# or #animal.s#

```
name: ["Brittany"],
animal: ["wombat"],
story : ["This is a story about #name# the #animal.capitalize#"]
```

## Advanced use

### Modifiers

Spandrel supports text modifiers using the syntax `#tagName.modifier#`. Some basic English language modifiers are included:

```ts
// Import parser and eng modifiers
import { parser, eng } from "jsr:@gordonb/spandrel";

const grammar = {
  "start": ["#animal.a# chased #animal.a#"],
  "animal": ["cat", "elephant", "owl"]
};

// Configure modifiers for parser
const flatten = parser({ modifiers: eng });

console.log(flatten(grammar)); // "an owl chased an elephant"
```

Built-in modifiers include:
- `a`: adds "a" or "an" appropriately
- `s`: pluralizes words
- `firstS`: pluralizes first word
- `capitalize`: capitalizes first letter
- `capitalizeAll`: capitalizes first letter of each word
- `lowercase`: lowercases all letters
- `ed`: Adds past tense ending

These modifiers are not always perfect! Try playing around with them to get a sense of their limits.

You can also create your own modifiers. A modifier is just a function of `(s: string) => string`. To define your own modifiers, pass in an object to the parser's `modifers`. The object's keys define the modifier's name, and the value is the modifier function to run.

### Custom Random Number Generator

You can provide your own random number generator to Spandrel... anything that returns a number between `0..1`.

A simple seeded random number generator (`prng`) implementation is included. This can be useful for generating random, but deterministic output (think Minecraft world seeds).

```ts
import { parser, prng } from "jsr:@gordonb/spandrel";

const seededRandom = rand("my seed");
const flatten = parser({ random: seededRandom });
```

## Credits

Spandrel is based on [Tracery](https://tracery.io/) by [Kate Compton](https://www.galaxykate.com/), a very cool library for procedural text generation.
