# plain-text-data-to-json [![Build Status](https://travis-ci.org/wooorm/plain-text-data-to-json.svg?branch=master)](https://travis-ci.org/wooorm/plain-text-data-to-json) [![Coverage Status](https://img.shields.io/coveralls/wooorm/plain-text-data-to-json.svg)](https://coveralls.io/r/wooorm/plain-text-data-to-json?branch=master)

Write a “database” or simple (word, phrase) list in plain-text, and transform it (in a build step) to JSON.

## Installation

npm:
```sh
$ npm install plain-text-data-to-json
```

## Usage

```js
var textToJSON = require('plain-text-data-to-json');
var fs = require('fs');

var data = textToJSON(fs.readFileSync('./input.txt', 'utf-8'));

fs.writeFileSync('./output.json', JSON.stringify(data));
```

## API

### plainTextDataToJSON(value)

Transforms the given value (string) to JSON.

## Why?

I found myself rewriting a simple transformation over and over. This (verbosely named) project fixes that. It might not be useful, or to simple for others, but suites my use cases.

## Plain-text?

The term plain-text might be confusing. It’s actually more of some (sparingly specified) standard.

### Comments:

Use a percentage sign to specify a comment. The comment will last until the end of line.

```
% This is a completely commented line.
unicorn % This is a partially commented line.
```

Yields:

```json
["unicorn"]
```

### White Space:

Affixed or suffixed white space (`\s`) is trimmed from values.

```
       unicorn     % some value
```

Yields:

```json
["unicorn"]
```

### Empty lines:

Empty lines will be striped.

```
    %%% this file contains a value. %%%    

unicorn
```

Yields:

```json
["unicorn"]
```

### Property-value pairs

If a line includes a colon (`:`), an the library returns an object.

```
unicorn : magic creature
```

Yields:

```json
{"unicorn":"magic creature"}
```

### Values:

All other lines are treated as array values

```
unicorn
```

Yields:

```json
["unicorn"]
```

### Errors

Some errors are thrown when malformed “plain-text” is found, such as:
- when lines both with and without colons exist;
- in arrays, when duplicate values exist;
- in objects, when duplicate properties exist;

## License

MIT © Titus Wormer
