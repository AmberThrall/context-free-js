<h2 align="center">
  context-free-js
</h2>
<p align="center">
  Module for working with context-free grammars.
</p>

  ```js
  const Grammar = require('context-free-js');

  const rules = {
    '<start>': [
      'The <noun> <verb> <adj>.',
      'A <adj> <noun>.'
    ],
    '<noun>': [
      'cat', 'dog', 'boy', 'girl'
    ],
    '<adj>': [
      'big', 'small', 'cute'
    ],
    '<verb>': [
      'is', 'will be'
    ]
  };

  const grammar = new Grammar('<start>', rules);
  grammar.generate();
  ```

### Install

  ```
  $ npm install context-free-js
  ```

### Development

  ```
  # Clone the repository
  $ git clone https://github.com/AmberThrall/context-free-js

  # Test the code
  $ npm test
  ```

### License

MIT License

Copyright (c) 2019 Amber Thrall

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
