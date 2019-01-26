var Grammar = require('./grammar');
var Parser = require('./parser');

function parseSyntax(root) {
  var rules = {};

  for (child of root.nodes) {
    if (child.label === "{rule}") {
      var rule = parseRule(child);
      if (!rules[rule.nonterminal])
        rules[rule.nonterminal] = [];

      for (var i = 0; i < rule.expressions.length; ++i) {
        var str = '';
        for (var j = 0; j < rule.expressions[i].length; ++j) { str += rule.expressions[i][j]; }
        rules[rule.nonterminal].push(str);
      }
    }
    if (child.label === "{syntax}") {
      rules.push(parseSyntax(child));
    }
  }

  return rules;
}

function parseRule(rule) {
  var onExpression = false;
  var ruleName = "";
  var expressions = [];
  for (child of rule.nodes) {
    if (child.label === "{rule-name}") {
      if (ruleName !== "")
        throw Error("Rule has multiple nonterminals.");
      if (onExpression)
        throw Error("Expected an expression.")

      ruleName = parseRuleName(child);
    }
    else if (child.label === "::=") {
      if (onExpression)
        throw Error("Encounted '::=' multiple times.")
      onExpression = true;
    }
    else if (child.label === '{expression}') {
      if (!onExpression)
        throw Error("Expected an rule name.")

      expressions = parseExpression(child);
    }
  }

  if (ruleName === "")
    throw Error("Never received a rule name.");
  if (expressions.length <= 0)
    throw Error("Rule has no expressions.");

  return {
    nonterminal: "<"+ruleName+">",
    expressions: expressions
  }
}

function parseRuleName(root) {
  var name = "";

  function _rchar(root) {
    for (child of root.nodes) {
      if (child.label === '{letter}' || child.label === '{digit}') {
        var grandchild = child.nodes[0];
        name += grandchild.label;
      }
      else if (child.label === '-')
        name += child.label;
    }
  }

  function _rname(root) {
    for (child of root.nodes) {
      if (child.label === '{rule-name}')
        _rname(child);
      if (child.label === '{letter}' || child.label === '{digit}')
        _rchar(root);
      else if (child.label === '{rule-char}')
        _rchar(child);
    }
  }
  _rname(root);

  return name;
}

function parseExpression(root) {
  var expressions = [];

  for (child of root.nodes) {
    if (child.label === '{list}') {
      expressions.push(parseList(child));
    }
    else if (child.label === '{expression}') {
      expressions.push([].concat.apply([], parseExpression(child)));
    }
  }

  return expressions;
}

function parseList(root) {
  var terms = [];

  for (child of root.nodes) {
    if (child.label === '{list}') {
      terms.push(parseList(child));
    }
    else if (child.label === '{term}') {
      for (grandchild of child.nodes) {
        if (!grandchild)
          throw Error("Term was preimpetively terminated.");
        if (grandchild.label === "{rule-name}")
          terms.push("<"+parseRuleName(grandchild)+">");
        else if (grandchild.label === "{literal}")
          terms.push(parseLiteral(grandchild));
      }
    }
  }

  return [].concat.apply([],terms);
}

function parseLiteral(root) {
  var literal = "";

  function _rchar(root) {
    for (child of root.nodes) {
      if (child.label === '{character}') {
        var grandchild = child.nodes[0];
        var greatgrandchild = grandchild.nodes[0];
        literal += greatgrandchild.label;
      }
      else if (child.label === '\"' || child.label === '\'')
        literal += child.label;
    }
  }

  function _rtext(root) {
    for (child of root.nodes) {
      if (child.label === '{text1}' || child.label === '{text2}')
        _rtext(child);
      else if (child.label === '{character1}' || child.label === '{character2}')
        _rchar(child);
    }
  }
  _rtext(root);

  return literal;
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
    if (line.slice(-1) !== '\0' && line.slice(-1) !== '\n' && line.slice(-1) !== '\r')
      line = line+"\0";

    var parse = Parser.derive(BNF.grammar, line);
    if (parse.derivations.length === 0)
      throw Error("Invalid BNF input. No derivations found.");
    if (parse.derivations.length > 1)
      console.warn("BNF input is ambiguous.");

    return parseSyntax(parse.derivations[0].root);
  }
}

module.exports = BNF;
