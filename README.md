# Spandrel

Spandrel is a TypeScript port of [Kate Compton's Tracery](https://tracery.io/),
a simple tool for procedural text generation. Spandrel (and Tracery) can be used
for many kinds of procedural generation, including stories, game dialog, dungeon
level generation, creature design, game rules... whatever!

This port is designed to be easily imported and used as an ES module in modern
TypeScript/JavaScript environments.

## Installing

For Deno:

```ts
import parser from "jsr:@gordonb/spandrel";
```

## Getting started

Create a grammar object and use the parser to generate text:

```ts
import parser from "jsr:@gordonb/spandrel";

const grammar = {
  "origin": ["Once upon a time, there was #character#"],
  "character": ["a #profession#", "a #trait# #profession#"],
  "profession": ["wizard", "knight", "baker"],
  "trait": ["wise", "brave", "clumsy"],
};

// Create a parser instance
const flatten = parser();

// Flatten!
console.log(flatten(grammar)); // "Once upon a time, there was a brave knight"
```

Grammar rules are defined using `#tagName#` syntax. When the text is processed,
each tag is replaced with a random selection from its corresponding array of
possibilities.

## Syntax overview

### Rule syntax

A Spandral grammar is an object containing sets of rules. Each key in the object
contains a rule set, an array of rules (text strings) representing possible
substitutions for that key.

```json
{
  "emotion": ["happy", "sad", "proud"]
}
```

Rule text can also contain `#tags#`. When they do, these tags will also get
replaced with a random item from the corresponding rule set.

```json
{
  "mainCharacter": ["Brittany the Wombat"],
  "story": ["This is a story about #mainCharacter#"]
}
```

## Advanced use

### Custom origin

By convention, the flatten function returned by the parser will look for a rule
called `origin`. You can also customize this by passing a second argument, which
should be the text of a rule from which to begin expanding:

```typescript
flatten(grammar, "Hello this is a #customOriginRule#");
```

### Modifiers

Modifiers let you transform rule text after it has been expanded. Some basic
English language modifiers are included with Spandrel:

```ts
// Import parser and eng modifiers
import { eng, parser } from "jsr:@gordonb/spandrel";

const grammar = {
  "origin": ["#animal.a# chased #animal.a#"],
  "animal": ["cat", "elephant", "owl"],
};

// Configure modifiers for parser
const flatten = parser({ modifiers: eng });

console.log(flatten(grammar)); // "an owl chased an elephant"
```

You can add a modifier by writing dot after a rule's name, followed by the
modifier name:

```
#tagName.modifier#
```

Modifiers can also be chained. They're applied from left to right.

```
#animal.s.lowercase#
```

The built-in eng modifiers include:

- `a`: adds "a" or "an" appropriately
- `s`: pluralizes words
- `firstS`: pluralizes first word
- `capitalize`: capitalizes first letter
- `capitalizeAll`: capitalizes first letter of each word
- `lowercase`: lowercases all letters
- `ed`: Adds past tense ending

You can also create your own modifiers. A modifier is just a function of
`(s: string) => string`. To define your own modifiers, pass in an object to the
parser's `modifers`. The object's keys define the modifier's name, and the value
is the modifier function to run.

### Actions

Actions let you remember chosen values while flattening a grammar. This gives
you a way to keep randomly-generated stories cohesive.

```json
{
  "boy": ["jack", "john"],
  "girl": ["jill", "jenny"],
  "sentence": "[b:#boy#][g:#girl#] #b# and #g# went up the hill, #b# fell down, and so did #g#"
}
```

Actions have the syntax:

```
[key:value]
```

The value can be any kind of rule text, and can even include other `#rule#`
tags. After being expanded, the value is assigned to the key on the grammar.
Whenever that key is encountered going forward, it will be replaced with the
remembered value. The action tag doesn't end up in the final text. Its only job
is to set the value of a key on the grammar.

Actions values are variable - the same key can be set multiple times over the
course of an expansion.

### Custom Random Number Generator

You can provide your own random number generator to Spandrel... anything that
returns a number between `0..1`.

A simple seeded random number generator (`prng`) implementation is included.
This can be useful for generating random, but deterministic output (think
Minecraft world seeds).

```ts
import { parser, prng } from "jsr:@gordonb/spandrel";

const seededRandom = rand("my seed");
const flatten = parser({ random: seededRandom });
```

## Credits

Spandrel is based on [Tracery](https://tracery.io/) by
[Kate Compton](https://www.galaxykate.com/), a very cool library for procedural
text generation.
