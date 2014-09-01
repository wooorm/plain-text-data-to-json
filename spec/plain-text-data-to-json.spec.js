'use strict';

var textToJSON, assert, stringify;

textToJSON = require('..');
assert = require('assert');
stringify = JSON.stringify;

describe('textToJSON', function () {
    it('should be a Function', function () {
        assert(typeof textToJSON === 'function');
    });
});

describe('Comments', function () {
    it('should strip line comments', function () {
        var data = textToJSON(
            '% This is a completely commented line.\n' +
            'unicorn'
        );

        assert(stringify(data) === '["unicorn"]');
    });

    it('should strip partial line comments', function () {
        var data = textToJSON(
            'unicorn % This is a partially commented line.'
        );

        assert(stringify(data) === '["unicorn"]');
    });
});

describe('White space', function () {
    it('should trim affixed white space', function () {
        var data = textToJSON('  \tunicorn');

        assert(stringify(data) === '["unicorn"]');
    });

    it('should trim suffixed white space', function () {
        var data = textToJSON('unicorn  \t');

        assert(stringify(data) === '["unicorn"]');
    });
});

describe('Empty lines', function () {
    it('should remove empty lines', function () {
        var data = textToJSON('\n\n\nunicorn\r\n');

        assert(stringify(data) === '["unicorn"]');
    });

    it('should remove empty (white space only) lines', function () {
        var data = textToJSON(
            '  \t  \n' +
            'unicorn'
        );

        assert(stringify(data) === '["unicorn"]');
    });
});

describe('End-of-file end-of-line', function () {
    it('should return the same result, with or without EOF EOL', function () {
        assert(stringify(textToJSON('unicorn')) === '["unicorn"]');
        assert(stringify(textToJSON('unicorn\n')) === '["unicorn"]');
        assert(stringify(textToJSON('unicorn\r\n')) === '["unicorn"]');
    });
});

describe('Property-value pairs', function () {
    it('should return an object when a file contains colons', function () {
        assert(
            stringify(textToJSON('unicorn : magic creature')) ===
            '{"unicorn":"magic creature"}'
        );

        assert(stringify(textToJSON(
                'unicorn : magic creature\n' +
                '\trainbow:double\t\n' +
                'doge\t:\tso scare'
            )) === JSON.stringify({
                'unicorn' : 'magic creature',
                'rainbow' : 'double',
                'doge' : 'so scare'
            })
        );
    });
});

describe('Values', function () {
    it('should return an array', function () {
        assert(stringify(textToJSON('unicorn')) === '["unicorn"]');

        assert(stringify(textToJSON(
                'unicorn \n' +
                ' doge\n' +
                '\trainbow\t'
            )) === JSON.stringify([
                'doge',
                'rainbow',
                'unicorn'
            ])
        );
    });
});

describe('Mixed property-value pairs and values', function () {
    it('should throw when both property-value pairs and values are provided',
        function () {
            assert.throws(function () {
                textToJSON('unicorn\nrainbow: double');
            });
        }
    );
});

describe('Property-value pairs', function () {
    it('should throw when duplicate properties exist',
        function () {
            assert.throws(function () {
                textToJSON(
                    'unicorn\n' +
                    'doge\n' +
                    'unicorn\n'
                );
            });
        }
    );
});

describe('Values', function () {
    it('should throw when duplicate values exist',
        function () {
            assert.throws(function () {
                textToJSON(
                    'doge: so scare\n' +
                    'unicorn: magic creature\n' +
                    'doge: so scare\n'
                );
            });
        }
    );
});
