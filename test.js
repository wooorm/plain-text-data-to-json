import assert from 'node:assert/strict'
import test from 'node:test'
import {cept} from 'cept'
import {toJson} from './index.js'

test('toJson', function () {
  assert.equal(typeof toJson, 'function', 'should be a `function`')
})

test('Comments', function () {
  assert.deepEqual(
    toJson(['% This is a completely commented line.', 'unicorn'].join('\n')),
    ['unicorn'],
    'should strip line comments'
  )

  assert.deepEqual(
    toJson('unicorn % This is a partially commented line.'),
    ['unicorn'],
    'should strip partial line comments'
  )

  assert.deepEqual(
    toJson('unicorn % This is a partially commented line.', {
      comment: false
    }),
    ['unicorn % This is a partially commented line.'],
    'should honour `comment: false`'
  )

  assert.deepEqual(
    toJson(['# This is a completely commented line.', 'unicorn'].join('\n'), {
      comment: '#'
    }),
    ['unicorn'],
    'should strip line comments based on a given token'
  )

  assert.deepEqual(
    toJson('unicorn # This is a partially commented line.', {
      comment: '#'
    }),
    ['unicorn'],
    'should strip partial comments based on a given token'
  )

  assert.deepEqual(
    toJson('unicorn # 1\n% 2\ndoge', {
      comment: ['#', '%']
    }),
    ['doge', 'unicorn'],
    'should strip partial comments based on a given token'
  )
})

test('White space', function () {
  assert.deepEqual(
    toJson('  \tunicorn  \t'),
    ['unicorn'],
    'should trim prefixed and suffixed white space'
  )
})

test('Blank lines', function () {
  assert.deepEqual(
    toJson('\n  \t  \ndoge\n\nunicorn\r\n'),
    ['doge', 'unicorn'],
    'should remove empty / blank lines'
  )
})

test('EOF', function () {
  assert.deepEqual(toJson('unicorn'), ['unicorn'], 'No EOL')
  assert.deepEqual(toJson('unicorn\n'), ['unicorn'], 'LF')
  assert.deepEqual(toJson('unicorn\r\n'), ['unicorn'], 'CR+LF')
})

test('Property-value pairs', function () {
  assert.deepEqual(
    toJson('unicorn: magic creature'),
    {unicorn: 'magic creature'},
    'should support pair delimiters'
  )

  assert.deepEqual(
    toJson(
      [
        'unicorn : magic creature',
        '\trainbow:double\t',
        'doge\t:\tso scare'
      ].join('\n')
    ),
    {
      doge: 'so scare',
      rainbow: 'double',
      unicorn: 'magic creature'
    },
    'white-space around pair delimiters'
  )

  assert.deepEqual(
    toJson('unicorn\tmagic creature', {delimiter: '\t'}),
    {unicorn: 'magic creature'},
    'given delimiters'
  )
})

test('Values', function () {
  assert.deepEqual(toJson('unicorn'), ['unicorn'], 'one value')

  assert.deepEqual(
    toJson('unicorn \n doge\n\trainbow'),
    ['doge', 'rainbow', 'unicorn'],
    'multiple values'
  )
})

test('Mixed values', function () {
  assert.throws(
    function () {
      toJson('unicorn\nrainbow: double')
    },
    /^Error: Error at `rainbow,double`/,
    'should throw when both property-value pairs and values are provided'
  )
})

test('Invalid lists', async function (t) {
  assert.throws(
    function () {
      toJson('unicorn\nrainbow\nunicorn')
    },
    /^Error: Error at `unicorn`: Duplicate data found/,
    'should throw when duplicate values exist'
  )

  assert.deepEqual(
    toJson('unicorn\nrainbow\nunicorn', {forgiving: true}),
    ['rainbow', 'unicorn', 'unicorn'],
    'should honour forgiving'
  )

  await t.test('should log duplicate values when `forgiving`', function () {
    const stop = cept(console, 'log', hoist)
    /** @type {Array<unknown>} */
    let parameters = []

    toJson('unicorn\nrainbow\nunicorn', {forgiving: true})

    stop()

    assert.equal(parameters[0], 'Ignoring duplicate key for `unicorn`')

    function hoist() {
      parameters = [...arguments]
    }
  })

  await t.test('should honour `log: false`', function () {
    const stop = cept(console, 'log', hoist)
    /** @type {Array<unknown>|undefined} */
    let parameters

    toJson('unicorn\nrainbow\nunicorn', {forgiving: true, log: false})

    stop()

    assert.equal(parameters, undefined)

    function hoist() {
      parameters = [...arguments]
    }
  })
})

test('Invalid objects', async function (t) {
  assert.throws(
    function () {
      toJson('doge: so scare\nunicorn: magic\ndoge: double')
    },
    /^Error: Error at `doge,double`: Duplicate data found/,
    'should throw when duplicate values exist'
  )

  assert.deepEqual(
    toJson('doge: so scare\nunicorn: magic creature\ndoge: so scare\n', {
      forgiving: true
    }),
    {doge: 'so scare', unicorn: 'magic creature'},
    'should honour forgiving'
  )

  await t.test('should log duplicate values when `forgiving`', function () {
    const stop = cept(console, 'log', hoist)
    /** @type {Array<unknown>} */
    let parameters = []

    toJson('doge: so scare\nunicorn: magic creature\ndoge: so scare\n', {
      forgiving: true
    })

    stop()

    assert.equal(parameters[0], 'Ignoring duplicate key for `doge`')

    function hoist() {
      parameters = [...arguments]
    }
  })

  await t.test('should honour `log: false`', function () {
    const stop = cept(console, 'log', hoist)
    /** @type {Array<unknown>|undefined} */
    let parameters

    toJson('doge: so scare\nunicorn: magic creature\ndoge: so scare\n', {
      forgiving: true,
      log: false
    })

    stop()

    assert.equal(parameters, undefined)

    function hoist() {
      parameters = [...arguments]
    }
  })

  assert.deepEqual(
    toJson('doge: so scare\nunicorn: magic creature\ndoge: so scare\n', {
      forgiving: 'fix'
    }),
    {doge: 'so scare', unicorn: 'magic creature'},
    "should honour `forgiving: 'fix'`"
  )

  assert.deepEqual(
    toJson('doge: so scare\nunicorn: magic creature\ndoge: rainbows\n', {
      forgiving: 'fix'
    }),
    {doge: 'rainbows', unicorn: 'magic creature'},
    'duplicate keys with different values'
  )

  await t.test(
    'should log for duplicate keys when `forgiving` is `"fix"',
    function () {
      const stop = cept(console, 'log', hoist)
      /** @type {Array<unknown>} */
      let parameters = []

      toJson('doge: so scare\nunicorn: magic creature\ndoge: so scare\n', {
        forgiving: true
      })

      stop()

      assert.equal(parameters[0], 'Ignoring duplicate key for `doge`')

      function hoist() {
        parameters = [...arguments]
      }
    }
  )
})
