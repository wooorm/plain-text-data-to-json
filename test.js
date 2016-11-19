'use strict';

var test = require('tape');
var cept = require('cept');
var toJSON = require('./');

test('toJSON', function (t) {
  t.equal(typeof toJSON, 'function', 'should be a `function`');
  t.end();
});

test('Comments', function (t) {
  t.deepEqual(
    toJSON([
      '% This is a completely commented line.',
      'unicorn'
    ].join('\n')),
    ['unicorn'],
    'should strip line comments'
  );

  t.deepEqual(
    toJSON('unicorn % This is a partially commented line.'),
    ['unicorn'],
    'should strip partial line comments'
  );

  t.deepEqual(
    toJSON('unicorn % This is a partially commented line.', {
      comment: false
    }),
    ['unicorn % This is a partially commented line.'],
    'should honour `comment: false`'
  );

  t.deepEqual(
    toJSON([
      '# This is a completely commented line.',
      'unicorn'
    ].join('\n'), {
      comment: '#'
    }),
    ['unicorn'],
    'should strip line comments based on a given token'
  );

  t.deepEqual(
    toJSON('unicorn # This is a partially commented line.', {
      comment: '#'
    }),
    ['unicorn'],
    'should strip partial comments based on a given token'
  );

  t.end();
});

test('White space', function (t) {
  t.deepEqual(
    toJSON('  \tunicorn  \t'),
    ['unicorn'],
    'should trim prefixed and suffixed white space'
  );

  t.end();
});

test('Blank lines', function (t) {
  t.deepEqual(
    toJSON('\n  \t  \ndoge\n\nunicorn\r\n'),
    ['doge', 'unicorn'],
    'should remove empty / blank lines'
  );

  t.end();
});

test('EOF', function (t) {
  t.deepEqual(toJSON('unicorn'), ['unicorn'], 'No EOL');
  t.deepEqual(toJSON('unicorn\n'), ['unicorn'], 'LF');
  t.deepEqual(toJSON('unicorn\r\n'), ['unicorn'], 'CR+LF');

  t.end();
});

test('Property-value pairs', function (t) {
  t.deepEqual(
    toJSON('unicorn: magic creature'),
    {unicorn: 'magic creature'},
    'should support pair delimiters'
  );

  t.deepEqual(
    toJSON([
      'unicorn : magic creature',
      '\trainbow:double\t',
      'doge\t:\tso scare'
    ].join('\n')),
    {
      doge: 'so scare',
      rainbow: 'double',
      unicorn: 'magic creature'
    },
    'white-space around pair delimiters'
  );

  t.deepEqual(
    toJSON('unicorn\tmagic creature', {delimiter: '\t'}),
    {unicorn: 'magic creature'},
    'given delimiters'
  );

  t.end();
});

test('Values', function (t) {
  t.deepEqual(toJSON('unicorn'), ['unicorn'], 'one value');

  t.deepEqual(
    toJSON('unicorn \n doge\n\trainbow'),
    ['doge', 'rainbow', 'unicorn'],
    'multiple values'
  );

  t.end();
});

test('Mixed values', function (t) {
  t.throws(
    function () {
      toJSON('unicorn\nrainbow: double');
    },
    /^Error: Error at `rainbow,double`/,
    'should throw when both property-value pairs and values are provided'
  );

  t.end();
});

test('Invalid lists', function (t) {
  t.throws(
    function () {
      toJSON('unicorn\nrainbow\nunicorn');
    },
    /^Error: Error at `unicorn`: Duplicate data found/,
    'should throw when duplicate values exist'
  );

  t.deepEqual(
    toJSON('unicorn\nrainbow\nunicorn', {forgiving: true}),
    ['rainbow', 'unicorn', 'unicorn'],
    'should honour forgiving'
  );

  t.test('should log duplicate values when `forgiving`', function (st) {
    var stop = cept(console, 'log', hoist);
    var params;

    toJSON('unicorn\nrainbow\nunicorn', {forgiving: true});

    stop();

    st.equal(params[0], 'Ignoring duplicate key for `unicorn`');
    st.end();

    function hoist() {
      params = arguments;
    }
  });

  t.test('should honour `log: false`', function (st) {
    var stop = cept(console, 'log', hoist);
    var params;

    toJSON('unicorn\nrainbow\nunicorn', {forgiving: true, log: false});

    stop();

    st.equal(params, undefined);
    st.end();

    function hoist() {
      params = arguments;
    }
  });

  t.end();
});

test('Invalid objects', function (t) {
  t.throws(
    function () {
      toJSON('doge: so scare\nunicorn: magic\ndoge: double');
    },
    /^Error: Error at `doge,double`: Duplicate data found/,
    'should throw when duplicate values exist'
  );

  t.deepEqual(
    toJSON('doge: so scare\nunicorn: magic creature\ndoge: so scare\n', {
      forgiving: true
    }),
    {doge: 'so scare', unicorn: 'magic creature'},
    'should honour forgiving'
  );

  t.test('should log duplicate values when `forgiving`', function (st) {
    var stop = cept(console, 'log', hoist);
    var params;

    toJSON('doge: so scare\nunicorn: magic creature\ndoge: so scare\n', {
      forgiving: true
    });

    stop();

    st.equal(params[0], 'Ignoring duplicate key for `doge`');
    st.end();

    function hoist() {
      params = arguments;
    }
  });

  t.test('should honour `log: false`', function (st) {
    var stop = cept(console, 'log', hoist);
    var params;

    toJSON('doge: so scare\nunicorn: magic creature\ndoge: so scare\n', {
      forgiving: true,
      log: false
    });

    stop();

    st.equal(params, undefined);
    st.end();

    function hoist() {
      params = arguments;
    }
  });

  t.deepEqual(
    toJSON('doge: so scare\nunicorn: magic creature\ndoge: so scare\n', {
      forgiving: 'fix'
    }),
    {doge: 'so scare', unicorn: 'magic creature'},
    'should honour `forgiving: \'fix\'`'
  );

  t.deepEqual(
    toJSON('doge: so scare\nunicorn: magic creature\ndoge: rainbows\n', {
      forgiving: 'fix'
    }),
    {doge: 'rainbows', unicorn: 'magic creature'},
    'duplicate keys with different values'
  );

  t.test('should log for duplicate keys when `forgiving` is `"fix"', function (st) {
    var stop = cept(console, 'log', hoist);
    var params;

    toJSON('doge: so scare\nunicorn: magic creature\ndoge: so scare\n', {
      forgiving: true
    });

    stop();

    st.equal(params[0], 'Ignoring duplicate key for `doge`');
    st.end();

    function hoist() {
      params = arguments;
    }
  });

  t.end();
});
