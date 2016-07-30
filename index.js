/**
 * @author Titus Wormer
 * @copyright 2014 Titus Wormer
 * @license MIT
 * @module plain-text-data-to-json
 * @fileoverview Transform a simple plain-text database to JSON.
 */

'use strict';

/* Dependencies. */
var has = require('has');
var trim = require('trim');

/* Expose. */
module.exports = toJSON;

/**
 * Transform a string into an array or object of values.
 *
 * @param {string} value
 * @param {?Object} options
 * @param {?boolean} options.log
 * @param {?(string|boolean)} options.comment
 * @param {?(string|boolean)} options.delimiter
 * @param {?(string|boolean)} options.fix
 * @return {Object.<string, string>|Array.<string>}
 */
function toJSON(value, options) {
  var propertyOrValues = {};
  var lines;
  var isPropertyValuePair;
  var pairs;
  var values;

  if (!options) {
    options = {};
  }

  if (options.log === null || options.log === undefined) {
    options.log = true;
  }

  if (options.comment === null || options.comment === undefined) {
    options.comment = '%';
  }

  lines = value.split('\n');

  if (options.comment) {
    lines = lines.map(stripComments(options.comment));
  }

  lines = lines.map(trim).filter(Boolean);

  pairs = lines.map(toPropertyValuePairs(options.delimiter || ':'));

  pairs.forEach(function (line, index) {
    var currentLineIsPropertyValuePair;

    currentLineIsPropertyValuePair = line.length === 2;

    if (index === 0) {
      isPropertyValuePair = currentLineIsPropertyValuePair;
    } else if (currentLineIsPropertyValuePair !== isPropertyValuePair) {
      throw new Error(
        'Error at `' + line + '`: ' +
        'Both property-value pairs and array values found. ' +
        'Make sure either exists.'
      );
    }

    if (has(propertyOrValues, line[0])) {
      if (
        !options.forgiving ||
        (
          options.forgiving === true &&
          currentLineIsPropertyValuePair &&
          line[1] !== propertyOrValues[line[0]]
        )
      ) {
        throw new Error(
          'Error at `' + line + '`: ' +
          'Duplicate data found. ' +
          'Make sure, in objects, no duplicate properties exist;' +
          'in arrays, no duplicate values.'
        );
      }

      if (options.log) {
        if (
          options.forgiving === 'fix' &&
          propertyOrValues[line[0]] !== line[1]
        ) {
          console.log(
              'Overwriting `' + propertyOrValues[line[0]] + '` ' +
              'to `' + line[1] + '` for `' + line[0] + '`'
          );
        } else {
          console.log(
            'Ignoring duplicate key for `' + line[0] + '`'
          );
        }
      }
    }

    propertyOrValues[line[0]] = line[1];
  });

  if (isPropertyValuePair) {
    pairs.sort(sortOnFirstIndex);
    values = propertyValuePairsToObject(pairs);
  } else {
    lines.sort();
  }

  return values || lines;
}

/**
 * Transform a list of property--value tuples to an object.
 *
 * @param {Array.<Pair>} pairs
 * @return {Object.<string, string>}
 */
function propertyValuePairsToObject(pairs) {
  var values = {};

  pairs.forEach(function (pair) {
    values[pair[0]] = pair[1];
  });

  return values;
}

/**
 * Sort on the first (`0`) index.
 *
 * To be passed to `Array#sort()`.
 *
 * @param {Pair} a
 * @param {Pair} b
 * @return {number}
 */
function sortOnFirstIndex(a, b) {
  return a[0].charCodeAt(0) - b[0].charCodeAt(0);
}

/**
 * Factory to transform lines to property--value tuples.
 *
 * @param {string} token
 * @return {function(string): Pair}
 */
function toPropertyValuePairs(token) {
  /**
   * Transform `value` to a property--value tuple.
   *
   * @param {string} value - Line.
   * @return {Pair}
   */
  return function (value) {
    var values = value.split(token);
    var result = [trim(values.shift())];

    if (values.length) {
      result.push(trim(values.join(token)));
    }

    return result;
  };
}

/**
 * Strip comments factory.
 *
 * @param {string} token
 * @return {function(string): string}
 */
function stripComments(token) {
  /**
   * Strip comments.
   *
   * @param {string} value - Line.
   * @return {string} Value with comments removed.
   */
  return function (value) {
    var index = value.indexOf(token);

    if (index !== -1) {
      value = value.substr(0, index);
    }

    return value;
  };
}
