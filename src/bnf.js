var Grammar = require('./grammar');
var Parser = require('./parser');

function explodeExpressions(rhs) {
  var exprs = [];

  // Because of "|", we can't use regex. No states.
  var cur = "";
  var quote = '';
  for (var i = 0; i < rhs.length; ++i) {
    var c = rhs[i];

    if (c === '|' && quote === '') {
      if (cur.replace(/\s+/,'') === "")
        throw "Double '|' encountered.";
      exprs.push(parseExpression(cur.trim()));
      cur = "";
    }
    else if (c === ';' && quote === '') // Begin a comment
      break;
    else {
      cur += c;
    }

    if (c === '"' || c === '\'') {
      if (quote === '')  { quote = c; }
      else if (quote === c) { quote = ""; }
    }
  }
  if (quote !== '')
    throw "Unterminated quote.";

  if (cur.replace(/\s+/,'') !== '')
    exprs.push(parseExpression(cur.trim()));

  return exprs;
}

function parseExpression(expr) {
  var ret = [];

  var cur = "";
  var quote = '';
  for (var i = 0; i < expr.length; ++i) {
    var c = expr[i];
    if ((c === ' ' || c === '\t') && quote === '') {
      if (cur.replace(/\s+/,'') !== "")
        ret.push(cur.trim());
      cur = "";
    }
    else if (c === '"' || c === '\'') {
      if (quote === '')  { quote = c; }
      else if (quote === c) { quote = ""; }
    }
    else
      cur += c;
  }
  if (quote !== '')
    throw "Unterminated quote in expression.";

  if (cur.replace(/\s+/,'') !== '')
    ret.push(cur.trim());

  return ret;
}

var BNF = {
  predefinedRules: {
    '<character>'      : [ '<letter>',  '<digit>',  '<symbol>' ],
    '<letter>'         : [ "A",  "B",  "C",  "D",  "E",  "F",  "G",  "H",  "I",  "J",  "K",  "L",  "M",  "N",  "O",  "P",
                           "Q",  "R",  "S",  "T",  "U",  "V",  "W",  "X",  "Y",  "Z",  "a",  "b",  "c",  "d",  "e",  "f",
                           "g",  "h",  "i",  "j",  "k",  "l",  "m",  "n",  "o",  "p",  "q",  "r",  "s",  "t",  "u",  "v",
                           "w",  "x",  "y",  "z" ],
    '<digit>'          : [ "0",  "1",  "2",  "3",  "4",  "5",  "6",  "7",  "8",  "9" ],
    '<symbol>'         : [  "|",  " ",  "!",  "#",  "$",  "%",  "&",  "(",  ")",  "*",  "+",  ",",  "-",  ".",  "/",  ":",
                            ";",  ">",  "=",  "<",  "?",  "@",  "[",  "\\",  "],",  "^",  "_",  "`",  "{",  "}",  "~" ],
    '<EOL>'            : [ '\n', '\r', '\0' ]
  },

  grammar: new Grammar('{syntax}', {
    '{syntax}'         : [ '{rule}',  '{rule}{syntax}' ],
    '{rule}'           : [ '{opt-whitespace}<{rule-name}>{opt-whitespace}::={opt-whitespace}{expression}{line-end}' ],
    '{opt-whitespace}' : [ ' {opt-whitespace}',  '' ],
    '{expression}'     : [ '{list}',  '{list}{opt-whitespace}|{opt-whitespace}{expression}' ],
    '{line-end}'       : [ '{EOL}', '{opt-whitespace}{EOL}',  '{line-end}{line-end}' ],
    '{list}'           : [ '{term}',  '{term}{opt-whitespace}{list}' ],
    '{term}'           : [ '{literal}',  '<{rule-name}>' ],
    '{literal}'        : [ '"{text1}"',  "'{text2}'" ],
    '{text1}'          : [ '',  '{character1}{text1}' ],
    '{text2}'          : [ '',  '{character2}{text2}' ],
    '{character}'      : [ '{letter}',  '{digit}',  '{symbol}' ],
    '{letter}'         : [ "A",  "B",  "C",  "D",  "E",  "F",  "G",  "H",  "I",  "J",  "K",  "L",  "M",  "N",  "O",  "P",
                           "Q",  "R",  "S",  "T",  "U",  "V",  "W",  "X",  "Y",  "Z",  "a",  "b",  "c",  "d",  "e",  "f",
                           "g",  "h",  "i",  "j",  "k",  "l",  "m",  "n",  "o",  "p",  "q",  "r",  "s",  "t",  "u",  "v",
                           "w",  "x",  "y",  "z" ],
    '{digit}'          : [ "0",  "1",  "2",  "3",  "4",  "5",  "6",  "7",  "8",  "9" ],
    '{symbol}'         : [  "|",  " ",  "!",  "#",  "$",  "%",  "&",  "(",  ")",  "*",  "+",  ",",  "-",  ".",  "/",  ":",
                            ";",  ">",  "=",  "<",  "?",  "@",  "[",  "\\",  "],",  "^",  "_",  "`",  "{",  "}",  "~" ],
    '{character1}'     : [ '{character}',  "'" ],
    '{character2}'     : [ '{character}',  '"' ],
    '{rule-name}'      : [ '{letter}',  '{rule-name}{rule-char}' ],
    '{rule-char}'      : [ '{letter}',  '{digit}',  '-' ],
    '{EOL}'            : [ '\n', '\r', '\0' ]
  }),

  /**
   * Parses a line of Backus-Naur form syntax.
   *
   * @param {String} line - The line to parse.
   * @return {{nonterminal, expressions}} - nonterminal -> expressions
   */
  parseLine: function(line) {
    var productions=[];
    var sides = line.split(/::=/);
    if (!sides || sides.length < 2)
      throw "Expected '::=', but never found it."
    if (sides.length > 2)
      throw "The string '::=' was found multiple times."

    var nonterminal = sides[0].trim();
    if (nonterminal === "" || !nonterminal.match(/\<[\w\d-]+\>/))
      throw "Bad nonterminal name. Should be of the form '<name>'."

    var exprs = explodeExpressions(sides[1]);
    if (exprs.length <= 0)
      throw "No expressions were found."

    for (var i = 0; i < exprs.length; ++i) {
      var str = '';
      for (var j = 0; j < exprs[i].length; ++j) { str += exprs[i][j]; }
      productions.push(str);
    }

    var ret = {};
    ret[nonterminal] = productions;

    return ret;
  }
}

module.exports = BNF;
