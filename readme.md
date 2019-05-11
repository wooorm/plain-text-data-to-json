# plain-text-data-to-json

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Size][size-badge]][size]

Transform a “database” / simple (word, phrase) list from plain-text to
JSON.

## Installation

[npm][]:

```bash
npm install plain-text-data-to-json
```

## Usage

```js
var fs = require('fs')
var toJSON = require('plain-text-data-to-json')

var doc = fs.readFileSync('input.txt', 'utf8')

var data = toJSON(doc)

fs.writeFileSync('output.json', JSON.stringify(data, null, 2) + '\n')
```

## API

### `toJSON(value[, options])`

Transforms the given value (string) to JSON.  Don’t like the default
comment and property-value pair delimiters?  Specify your own:

##### `options`

###### `options.comment`

Character to use for line-comments, `false` turns off comments (`string` or
`boolean`, default: `'%'`)

###### `options.delimiter`

Character to use as delimiter between property-value pairs (`string`,
default: `':'`)

###### `options.forgiving`

How relaxed to be (`string` or `boolean`, default: `false`).  When `true`,
doesn’t throw for duplicate keys.  When `"fix"`, doesn’t throw for
property-value pairs and overwrites (see [errors][]).

###### `options.log`

Whether to log when `forgiving` ignores an error (`boolean`, default: `true`).

## Why

I found myself rewriting a simple transformation over and over.  This
(verbosely named) project fixes that.  It might not be useful, or too
simple for others, but suites my use cases.

## “Plain-text”

The term plain-text might be confusing.  It’s actually more of some
(sparingly specified) standard.

### Comments

Use a percentage sign (by default) to specify a comment.  The comment
will last until the end of line.

```txt
% This is a completely commented line.
unicorn % This is a partially commented line.
```

Yields:

```json
["unicorn"]
```

### White Space

Initial or final white space (`\s`) is trimmed from values.

```txt
       unicorn     % some value
```

Yields:

```json
["unicorn"]
```

### Empty lines

Empty lines will be striped.  This includes blank (white space only)
lines.

```txt
    %%% this file contains a value. %%%

unicorn
```

Yields:

```json
["unicorn"]
```

### Property-value pairs

If a line includes a colon (by default), the library returns an object.

```txt
unicorn : magic creature
```

Yields:

```json
{"unicorn":"magic creature"}
```

### Values

All other lines are treated as array values.

```txt
unicorn
```

Yields:

```json
["unicorn"]
```

### Errors

Some errors are thrown when malformed “plain-text” is found, such as:

*   When lines both with and without colons exist
*   In arrays, when duplicate values exist (unless `forgiving: true`)
*   In objects, when duplicate properties exist (unless `forgiving: true`)
*   In objects, when duplicate properties with different values exist
    (unless `forgiving: "fix"`)

## License

[MIT][license] © [Titus Wormer][author]

<!-- Definitions -->

[build-badge]: https://img.shields.io/travis/wooorm/plain-text-data-to-json.svg

[build]: https://travis-ci.org/wooorm/plain-text-data-to-json

[coverage-badge]: https://img.shields.io/codecov/c/github/wooorm/plain-text-data-to-json.svg

[coverage]: https://codecov.io/github/wooorm/plain-text-data-to-json

[downloads-badge]: https://img.shields.io/npm/dm/plain-text-data-to-json.svg

[downloads]: https://www.npmjs.com/package/plain-text-data-to-json

[size-badge]: https://img.shields.io/bundlephobia/minzip/plain-text-data-to-json.svg

[size]: https://bundlephobia.com/result?p=plain-text-data-to-json

[npm]: https://docs.npmjs.com/cli/install

[license]: license

[author]: https://wooorm.com

[errors]: #errors
