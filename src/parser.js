var Grammar = require('./grammar')

/**
 * Parser class.
 *
 * @constructor
 * @param {Grammar} grammar - The grammar used for parsing.
 */
function Parser(grammar) {
  this.grammar = grammar;
}

Parser.prototype.derive = function(str) {
  if (!this.grammar) {
    throw Error("Failed to derive string from language, no grammar specified.");
  }

  let seq = [];
  seq.push({ variable: '<start>', rule: 'hello world' });

  return seq;
}

module.exports = { Parser: Parser }
