'use strict'

var trim = require('trim')

module.exports = toJSON

var own = {}.hasOwnProperty

// Transform a string into an array or object of values.
function toJSON(value, options) {
  var propertyOrValues = {}
  var lines
  var isPropertyValuePair
  var pairs
  var values

  if (!options) {
    options = {}
  }

  if (options.log === null || options.log === undefined) {
    options.log = true
  }

  if (options.comment === null || options.comment === undefined) {
    options.comment = '%'
  }

  lines = value.split('\n')

  if (options.comment) {
    lines = lines.map(stripComments(options.comment))
  }

  lines = lines.map(trim).filter(Boolean)

  pairs = lines.map(toPropertyValuePairs(options.delimiter || ':'))

  pairs.forEach(function(line, index) {
    var currentLineIsPropertyValuePair

    currentLineIsPropertyValuePair = line.length === 2

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
        !options.forgiving ||
        (options.forgiving === true &&
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

      if (options.log) {
        if (
          options.forgiving === 'fix' &&
          propertyOrValues[line[0]] !== line[1]
        ) {
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
  })

  if (isPropertyValuePair) {
    pairs.sort(sortOnFirstIndex)
    values = propertyValuePairsToObject(pairs)
  } else {
    lines.sort()
  }

  return values || lines
}

// Transform a list of property--value tuples to an object.
function propertyValuePairsToObject(pairs) {
  var values = {}

  pairs.forEach(function(pair) {
    values[pair[0]] = pair[1]
  })

  return values
}

// Sort on the first (`0`) index.
function sortOnFirstIndex(a, b) {
  return a[0].charCodeAt(0) - b[0].charCodeAt(0)
}

// Factory to transform lines to property--value tuples.
function toPropertyValuePairs(token) {
  return toPropValuePairs

  // Transform `value` to a property--value tuple.
  function toPropValuePairs(value) {
    var values = value.split(token)
    var result = [trim(values.shift())]

    if (values.length !== 0) {
      result.push(trim(values.join(token)))
    }

    return result
  }
}

// Strip comments factory.
function stripComments(token) {
  return strip

  // Strip comments.
  function strip(value) {
    var index = value.indexOf(token)

    if (index !== -1) {
      value = value.substr(0, index)
    }

    return value
  }
}
