
export const rand = () => Math.random()

export const chooseWith = (random, array) => {
  const i = Math.floor(random() * array.length)
  return array[i]
}

const id = x => x

const _get = (object, key, fallback=null) => {
  if (key == null) {
    return fallback
  }
  const value = object[key]
  if (value == null) {
    return fallback
  }
  return value
}

const TOKEN = /#(\w+)(\.(\w+))?#/g

/** @typedef {Object<string, Array<string>>} Grammar */

/**
 * Create a Tracery parser.
 * Returns a function `flatten(grammar, start='#start#')` which can be used to flatten a grammar.
 * @param {object} options 
 * @param {Object<string, (s: string) => string} [options.modifiers] - a map of modifier names to functions
 * @param {() => number} [options.random] - a function that returns a random number between 0 and 1
 * @returns {(grammar: Grammar, start: string) => string}
 */
export const parser = ({modifiers={}, random=rand}) => {
  /**
   * Flatten a tracery grammar
   * @type {(grammar: Grammar, start: string) => string}
   */
  const flatten = (grammar, start='#start#') => start.replaceAll(
    TOKEN,
    (match, key, _, modifier) => {
      if (grammar[key]) {
        const postprocess = _get(modifiers, modifier, id)
        return postprocess(
          flatten(
            grammar,
            chooseWith(random, grammar[key])
          )
        )
      }
      return match
    }
  )
  return flatten
}

export default parser
