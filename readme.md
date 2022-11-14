# plain-text-data-to-json

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Size][size-badge]][size]

Transform basic plain-text lists or objects into arrays and objects.

## Contents

*   [What is this?](#what-is-this)
*   [When should I use this?](#when-should-i-use-this)
*   [Install](#install)
*   [Use](#use)
*   [API](#api)
    *   [`toJson(value[, options])`](#tojsonvalue-options)
*   [Data](#data)
    *   [Comments](#comments)
    *   [Whitespace](#whitespace)
    *   [Empty lines](#empty-lines)
    *   [Key/value pairs](#keyvalue-pairs)
    *   [Values](#values)
    *   [Errors](#errors)
*   [Types](#types)
*   [Compatibility](#compatibility)
*   [Contribute](#contribute)
*   [Security](#security)
*   [License](#license)

## What is this?

This package takes a file (a sort of simple database), parses it, and returns
clean data.

## When should I use this?

I found myself rewriting a simple transformation over and over to handle text
files.
One example is this source file in [`emoji-emotion`][emoji-emotion-example]
This project fixes that for me.
You can use it too if it matches your needs.

## Install

This package is [ESM only][esm].
In Node.js (version 14.14+, 16.0+), install with [npm][]:

```sh
npm install plain-text-data-to-json
```

In Deno with [`esm.sh`][esmsh]:

```js
import {toJson} from 'https://esm.sh/plain-text-data-to-json@2'
```

In browsers with [`esm.sh`][esmsh]:

```html
<script type="module">
  import {toJson} from 'https://esm.sh/plain-text-data-to-json@2?bundle'
</script>
```

## Use

If we have the following file `input.txt`:

```txt
% A comment

alpha
bravo
charlie
```

…and our module `example.js` looks as follows:

```js
import fs from 'node:fs/promises'
import {toJson} from 'plain-text-data-to-json'

const document = String(await fs.readFile('input.txt'))

const data = toJson(document)

await fs.writeFile('output.json', JSON.stringify(data, null, 2) + '\n')
```

…then running `node example.js` yields in `output.json`:

```json
[
  "alpha",
  "bravo",
  "charlie"
]
```

## API

This package exports the identifier `toJson`.
There is no default export.

### `toJson(value[, options])`

Transform basic plain-text lists or objects into arrays and objects.

##### `options`

Configuration (optional).

###### `options.delimiter`

Character to use as delimiter between key/value pairs (`string`, default:
`':'`).

###### `options.comment`

Character(s) to use for line comments, `false` turns off comments (`string`,
`Array<string>`, or `boolean`, default: `'%'`)

###### `options.forgiving`

How relaxed to be (`'fix'` or `boolean`, default: `false`).
When `true`, doesn’t throw for duplicate keys.
When `'fix'`, doesn’t throw for key/value pairs and overwrites (see
[errors][]).

###### `options.log`

Whether to call `console.log` with info when `forgiving` ignores an error
(`boolean`, default: `true`).

## Data

The term plain text might be confusing.
It’s actually more of some (sparingly specified) standard.

### Comments

Use a percentage sign (by default) to specify a comment.
The comment will last until the end of line.

```txt
% This is a completely commented line.
unicorn % This is a partially commented line.
```

Yields:

```js
['unicorn']
```

### Whitespace

Initial or final white space (`\s`) is trimmed from values.

```txt
       unicorn     % some value
```

Yields:

```js
['unicorn']
```

### Empty lines

Empty lines are striped.
This includes whitespace only lines.

```txt
    %%% this file contains a value. %%%

unicorn
```

Yields:

```js
['unicorn']
```

### Key/value pairs

If a line includes a colon (by default), the library returns an object.

```txt
unicorn : magic creature
```

Yields:

```js
{unicorn: 'magic creature'}
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

*   when lines both with and without colons exist
*   in arrays, when duplicate values exist (unless `forgiving: true`)
*   in objects, when duplicate properties exist (unless `forgiving: true`)
*   in objects, when duplicate properties with different values exist (unless
    `forgiving: "fix"`)

## Types

This package is fully typed with [TypeScript][].
It exports the additional type `Options`.

## Compatibility

This package is at least compatible with all maintained versions of Node.js.
As of now, that is Node.js 14.14+ and 16.0+.
It also works in Deno and modern browsers.

## Contribute

Yes please!
See [How to Contribute to Open Source][contribute].

## Security

This package is safe.

## License

[MIT][license] © [Titus Wormer][author]

<!-- Definitions -->

[build-badge]: https://github.com/wooorm/plain-text-data-to-json/workflows/main/badge.svg

[build]: https://github.com/wooorm/plain-text-data-to-json/actions

[coverage-badge]: https://img.shields.io/codecov/c/github/wooorm/plain-text-data-to-json.svg

[coverage]: https://codecov.io/github/wooorm/plain-text-data-to-json

[downloads-badge]: https://img.shields.io/npm/dm/plain-text-data-to-json.svg

[downloads]: https://www.npmjs.com/package/plain-text-data-to-json

[size-badge]: https://img.shields.io/bundlephobia/minzip/plain-text-data-to-json.svg

[size]: https://bundlephobia.com/result?p=plain-text-data-to-json

[npm]: https://docs.npmjs.com/cli/install

[esm]: https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c

[esmsh]: https://esm.sh

[typescript]: https://www.typescriptlang.org

[contribute]: https://opensource.guide/how-to-contribute/

[license]: license

[author]: https://wooorm.com

[errors]: #errors

[emoji-emotion-example]: https://github.com/words/emoji-emotion/blob/main/faces.txt
