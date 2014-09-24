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
    var customTokens;

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

    customTokens = {
        'comment' : '#'
    };

    it('should strip line comments based on a given token', function () {
        var data = textToJSON(
            '# This is a completely commented line.\n' +
            'unicorn',
            customTokens
        );

        assert(stringify(data) === '["unicorn"]');
    });

    it('should strip partial line comments based on a given token',
        function () {
            var data = textToJSON(
                'unicorn # This is a partially commented line.',
                customTokens
            );

            assert(stringify(data) === '["unicorn"]');
        }
    );
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
    it('should return an object when a file contains pair delimiters',
        function () {
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
        }
    );

    it('should return an object when a file contains pair delimiters ' +
        'based on a given token', function () {
            var customTokens = {
                'delimiter' : '\t'
            };

            assert(
                stringify(
                    textToJSON('unicorn	magic creature', customTokens)
                ) === '{"unicorn":"magic creature"}'
            );

            assert(stringify(textToJSON(
                    'unicorn \t magic creature\n' +
                    '\trainbow\tdouble\t\n' +
                    'doge\t\t\tso scare',
                    customTokens
                )) === JSON.stringify({
                    'unicorn' : 'magic creature',
                    'rainbow' : 'double',
                    'doge' : 'so scare'
                })
            );
        }
    );
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
            }, /`rainbow/);
        }
    );
});

describe('Values', function () {
    it('should throw when duplicate values exist',
        function () {
            assert.throws(function () {
                textToJSON(
                    'unicorn\n' +
                    'doge\n' +
                    'unicorn\n'
                );
            }, /`unicorn/);
        }
    );

    it('should NOT throw when duplicate values exist and `forgiving` is ' +
        '`true`',
        function () {
            assert.doesNotThrow(function () {
                textToJSON(
                    'unicorn\n' +
                    'doge\n' +
                    'unicorn\n', {
                        'forgiving' : true
                    }
                );
            });
        }
    );

    it('should log for duplicate values when `forgiving` is `true`',
        function () {
            var log,
                isCalled;

            log = console.log;

            global.console.log = function () {
                isCalled = true;
            };

            textToJSON(
                'unicorn\n' +
                'doge\n' +
                'unicorn\n', {
                    'forgiving' : true
                }
            );

            assert(isCalled === true);

            global.console.log = log;
        }
    );

    it('should NOT log for duplicate keys when `forgiving` is `true`' +
        ' and `log` is `false`',
        function () {
            var log,
                isCalled;

            log = console.log;

            /* istanbul ignore next */
            global.console.log = function () {
                isCalled = true;
            };

            textToJSON(
                'unicorn\n' +
                'doge\n' +
                'unicorn\n', {
                    'forgiving' : true,
                    'log' : false
                }
            );

            assert(isCalled !== true);

            global.console.log = log;
        }
    );
});

describe('Property-value pairs', function () {
    it('should throw when duplicate keys exist',
        function () {
            assert.throws(function () {
                textToJSON(
                    'doge: so scare\n' +
                    'unicorn: magic creature\n' +
                    'doge: double\n'
                );
            }, /`doge/);
        }
    );

    it('should NOT throw for duplicate keys when `forgiving` is `true`',
        function () {
            assert.doesNotThrow(function () {
                textToJSON(
                    'doge: so scare\n' +
                    'unicorn: magic creature\n' +
                    'doge: so scare\n', {
                        'forgiving' : true
                    }
                );
            });
        }
    );

    it('should log for duplicate keys when `forgiving` is `true`',
        function () {
            var log,
                isCalled;

            log = console.log;

            global.console.log = function () {
                isCalled = true;
            };

            textToJSON(
                'doge: so scare\n' +
                'unicorn: magic creature\n' +
                'doge: so scare\n', {
                    'forgiving' : true
                }
            );

            assert(isCalled === true);

            global.console.log = log;
        }
    );

    it('should NOT log for duplicate keys when `forgiving` is `true`' +
        ' and `log` is `false`',
        function () {
            var log,
                isCalled;

            log = console.log;

            /* istanbul ignore next */
            global.console.log = function () {
                isCalled = true;
            };

            textToJSON(
                'doge: so scare\n' +
                'unicorn: magic creature\n' +
                'doge: so scare\n', {
                    'forgiving' : true,
                    'log' : false
                }
            );

            assert(isCalled !== true);

            global.console.log = log;
        }
    );

    it('should throw when duplicate key-values exist when `forgiving` ' +
        'is `true`',
        function () {
            assert.throws(function () {
                textToJSON(
                    'doge: so scare\n' +
                    'unicorn: magic creature\n' +
                    'doge: so scrare\n', {
                        'forgiving' : true
                    }
                );
            }, /`doge/);
        }
    );
});
