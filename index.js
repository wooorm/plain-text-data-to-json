'use strict';

var isOwnProperty = Object.prototype.hasOwnProperty;

function stripComments(token) {
    return function (value) {
        var index = value.indexOf(token);

        if (index !== -1) {
            value = value.substr(0, index);
        }

        return value;
    };
}

function trimWhiteSpace(value) {
    return value.trim();
}

function isNonEmpty(value) {
    return Boolean(value);
}

function toPropertyValuePairs(token) {
    return function (value) {
        var values, result;

        values = value.split(token);
        result = [trimWhiteSpace(values.shift())];

        if (values.length) {
            result.push(trimWhiteSpace(values.join(token)));
        }

        return result;
    };
}

function sortOnFirstIndex(a, b) {
    return b[0] - a[0];
}

function propertyValuePairsToObject(pairs) {
    var value = {};

    pairs.forEach(function (pair) {
        value[pair[0]] = pair[1];
    });

    return value;
}

function textToJSON(value, options) {
    var propertyOrValues = {},
        lines, isPropertyValuePair, pairs, values;

    if (!options) {
        options = {};
    }

    lines = value.split('\n')
        .map(stripComments(options.comment || '%'))
        .map(trimWhiteSpace)
        .filter(isNonEmpty);

    pairs = lines.map(toPropertyValuePairs(options.delimiter || ':'));

    pairs.forEach(function (line, index) {
        var currentLineIsPropertyValuePair = line.length === 2;

        if (index === 0) {
            isPropertyValuePair = currentLineIsPropertyValuePair;
        } else {
            if (currentLineIsPropertyValuePair !== isPropertyValuePair) {
                throw new Error(
                    'Both property-value pairs and array values found. ' +
                    'Make sure either exists.'
                );
            }
        }

        if (
            line[0] in propertyOrValues &&
            isOwnProperty.call(propertyOrValues, line[0])
        ) {
            throw new Error(
                'Duplicate data found. ' +
                'Make sure, in objects, no duplicate properties exist, in ' +
                'arrays, no duplicate values.'
            );
        }

        propertyOrValues[line[0]] = true;
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
