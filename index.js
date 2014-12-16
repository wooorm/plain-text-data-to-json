'use strict';

/**
 * Cached methods.
 */

var has;

has = Object.prototype.hasOwnProperty;

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
        var index;

        index = value.indexOf(token);

        if (index !== -1) {
            value = value.substr(0, index);
        }

        return value;
    };
}

/**
 * Remove white space at start and end.
 *
 * @param {string} value
 * @return {string} Value with initial and final white
 *   space removed.
 */

function trimWhiteSpace(value) {
    return value.trim();
}

/**
 * Whether or not `value` is empty.
 *
 * @param {string} value
 * @return {boolean}
 */

function isNonEmpty(value) {
    return Boolean(value);
}

/**
 * Factory to transform lines to property--value tuples.
 *
 * @param {string} token
 * @return {function(string): {0: string, 1: string}}
 */

function toPropertyValuePairs(token) {
    /**
     * Transform `value` to a property--value tuple.
     *
     * @param {string} value - Line.
     * @return {{0: string, 1: string}} Array with
     *  property at `0` and value at `1`.
     */

    return function (value) {
        var values,
            result;

        values = value.split(token);
        result = [trimWhiteSpace(values.shift())];

        if (values.length) {
            result.push(trimWhiteSpace(values.join(token)));
        }

        return result;
    };
}

/**
 * Sort on the first (`0`) index.
 *
 * To be passed to `Array#sort()`.
 *
 * @param {{0: *}} a
 * @param {{0: *}} b
 */

function sortOnFirstIndex(a, b) {
    return a[0].charCodeAt(0) - b[0].charCodeAt(0);
}

/**
 * Transform a list of key--value tuples to an object.
 *
 * @param {Array.<{0: string, 1: string}>} pairs
 * @return {Object.<string, string>}
 */

function propertyValuePairsToObject(pairs) {
    var values;

    values = {};

    pairs.forEach(function (pair) {
        values[pair[0]] = pair[1];
    });

    return values;
}

/**
 * Transform a string into an array or object of values.
 *
 * @param {string} value
 * @param {Object?} options
 * @return {Object.<string, string>|Array.<string>}
 */

function textToJSON(value, options) {
    var propertyOrValues,
        lines,
        isPropertyValuePair,
        pairs,
        values;

    propertyOrValues = {};

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

    lines = lines.map(trimWhiteSpace).filter(isNonEmpty);

    pairs = lines.map(toPropertyValuePairs(options.delimiter || ':'));

    pairs.forEach(function (line, index) {
        var currentLineIsPropertyValuePair;

        currentLineIsPropertyValuePair = line.length === 2;

        if (index === 0) {
            isPropertyValuePair = currentLineIsPropertyValuePair;
        } else {
            if (currentLineIsPropertyValuePair !== isPropertyValuePair) {
                throw new Error(
                    'Error at `' + line + '`: ' +
                    'Both property-value pairs and array values found. ' +
                    'Make sure either exists.'
                );
            }
        }

        if (has.call(propertyOrValues, line[0])) {
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

module.exports = textToJSON;
