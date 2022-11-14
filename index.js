/**
 * @typedef Options
 *   Configuration.
 * @property {string} [delimiter=':']
 *   Character to use as delimiter between key/value pairs.
 * @property {Array<string>|string|false} [comment='%']
 *   Character(s) to use for line comments, `false` turns off comments.
 * @property {boolean|'fix'} [forgiving]
 *   How relaxed to be.
 *   When `true`, doesn’t throw for duplicate keys.
 *   When `'fix'`, doesn’t throw for key/value pairs and overwrites.
 * @property {boolean} [log=true]
 *   Whether to log when `forgiving` ignores an error.
 */

/**
 * @typedef {Options} ToJsonOptions
 *   Deprecated: please use `Options`.
 */

const own = {}.hasOwnProperty

/**
 * Transform basic plain-text lists or objects into arrays and objects.
 *
 * @param {string} value
 *   Value to parse.
 * @param {Options} [options]
 *   Configuration (optional).
 */
export function toJson(value, options = {}) {
  const log =
    options.log === null || options.log === undefined ? true : options.log
  const comment =
    options.comment === null || options.comment === undefined
      ? '%'
      : options.comment
  const comments = comment ? (Array.isArray(comment) ? comment : [comment]) : []
  const delimiter = options.delimiter || ':'
  const forgiving = options.forgiving
  /** @type {Record<string, unknown>} */
  const propertyOrValues = {}

  const lines = value
    .split('\n')
    .map((line) => {
      let commentIndex = -1

      while (++commentIndex < comments.length) {
        const index = line.indexOf(comments[commentIndex])
        if (index !== -1) line = line.slice(0, index)
      }

      return line.trim()
    })
    .filter(Boolean)

  const pairs = lines.map(
    // Transform `value` to a property--value tuple.
    function (value) {
      const values = value.split(delimiter)
      /** @type {[string, undefined|string]} */
      // @ts-expect-error: always one.
      const result = [values.shift().trim()]

      if (values.length > 0) {
        result.push(values.join(delimiter).trim())
      }

      return result
    }
  )

  /** @type {boolean|undefined} */
  let isPropertyValuePair

  for (const [index, line] of pairs.entries()) {
    const currentLineIsPropertyValuePair = line.length === 2

    if (index === 0) {
      isPropertyValuePair = currentLineIsPropertyValuePair
    } else if (currentLineIsPropertyValuePair !== isPropertyValuePair) {
      throw new Error(
        'Error at `' +
          line +
          '`: ' +
          'Both property-value pairs and array values found. ' +
          'Make sure either exists.'
      )
    }

    if (own.call(propertyOrValues, line[0])) {
      if (
        !forgiving ||
        (forgiving === true &&
          currentLineIsPropertyValuePair &&
          line[1] !== propertyOrValues[line[0]])
      ) {
        throw new Error(
          'Error at `' +
            line +
            '`: ' +
            'Duplicate data found. ' +
            'Make sure, in objects, no duplicate properties exist;' +
            'in arrays, no duplicate values.'
        )
      }

      if (log) {
        if (forgiving === 'fix' && propertyOrValues[line[0]] !== line[1]) {
          console.log(
            'Overwriting `' +
              propertyOrValues[line[0]] +
              '` ' +
              'to `' +
              line[1] +
              '` for `' +
              line[0] +
              '`'
          )
        } else {
          console.log('Ignoring duplicate key for `' + line[0] + '`')
        }
      }
    }

    propertyOrValues[line[0]] = line[1]
  }

  if (isPropertyValuePair) {
    pairs.sort(sortOnFirstIndex)
    return Object.fromEntries(pairs)
  }

  return lines.sort()
}

/**
 * Sort on the first (`0`) index.
 * @param {[string, undefined|string]} a
 * @param {[string, undefined|string]} b
 */
function sortOnFirstIndex(a, b) {
  // @ts-expect-error: never empty
  return a[0].codePointAt(0) - b[0].codePointAt(0)
}
