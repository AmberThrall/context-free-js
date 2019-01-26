/* Grammar class.
 *
 * @constructor
 * @param {String} start - Initial starting variable.
 * @param {Object} rules - Optional argument to add multiple rules at once.
 */
function Grammar(start = '<start>', rules = {}) {
  this.rules = {};
  this.start = start;
  this.varRegex = /(\[<\()*(\w+)(\]>\))*/g;

  if (typeof rules === "string") {
    var BNF = require('./bnf');
    this.addRules(BNF.predefinedRules);

    var newLines = [];
    var lines = rules.split('\n');
    for (var i = 0; i < lines.length; ++i) {
      var line = lines[i];
      var firstChar = line.match(/\S/);
      if (firstChar === null || firstChar[0] === "\0" || firstChar[0] === "\r" || firstChar[0] === "\n")
        continue;
      firstChar = firstChar[0];

      // Comments
      if (firstChar === ';')
        continue;
      // Combine lines split
      /*for (var j = i+1; j < lines.length; ++j) {

      }*/

      newLines.push(line+"\n");
    }

    for (var i = 0; i < newLines.length; ++i) {
      try {
        var line = newLines[i];
        var parse = BNF.parseLine(line);

        this.addRules(parse);
      }
      catch (e) {
        throw "Line "+(i+1)+": error: "+e.message;
      }
    }
  }
  else {
    if (rules !== {}) {
      this.addRules(rules);
    }
  }
}

/**
 * Adds a set of rules for a given variable.
 *
 * @param {String} nonterminal - The nonterminal.
 * @param {[String]} expressions - List of expressions, results in the or operator '|' being used.
 */
Grammar.prototype.addRule = function(nonterminal, ...exprs) {
  if (exprs.length === 0) {
    throw Error("No expression(s) given to a rule.")
  }
  for (const expr of exprs) {
    if (!this.rules[nonterminal]) {
      this.rules[nonterminal] = [];
    }
    if (this.rules[nonterminal].includes(expr)) {
      console.warn("A rule was added more than once: "+nonterminal+" -> "+expr)
    }
    this.rules[nonterminal].push(expr);
  }
}

/**
 * Adds several rules at once in the form of an object.
 *
 * @param {Object} rules - New list of rules to append.
 */
Grammar.prototype.addRules = function(rules) {
  for (const key of Object.keys(rules)) {
    if (!Array.isArray(rules[key])) {
      throw Error("Invalid rule '"+key+"'. Content must of an array of strings.")
    }

    for (const rule of rules[key]) {
      this.addRule(key, rule);
    }
  }
}

/**
 * Determines if a given grammar is valid. Namely, no infinite parsing (A -> A is only rule for a nonterminal) or no
 * path given for a nonterminal.
 *
 * @return {Boolean}
 */
Grammar.prototype.isValid = function() {
  for (const key of Object.keys(this.rules)) {
    // There needs to be at least one rule for nonterminals.
    if (!this.rules[key] || this.rules[key].length === 0)
      return false;

    // Check for A->A type rules being the only rule.
    if (this.rules[key].length === 1) {
      if (this.rules[key][0].includes(key))
        return false;
    }
  }

  return true;
}

/**
 * Determines if the grammar is in Chomsky normal form.
 * https://en.wikipedia.org/wiki/Chomsky_normal_form
 *
 * @param {String} start - (Optional) Override the grammar's start location.
 * @param {String} epsilon - String representing the empty string (default: '').
 * @return {Boolean}
 */
Grammar.prototype.isChomsky = function(start, epsilon) {
  var firstRule = start || this.start;
  var eps = epsilon || '';

  for (const key of Object.keys(this.rules)) {
    for (const rule of this.rules[key]) {
      // Only start can go to the empty string:
      if (rule === epsilon && key !== firstRule) { return false; }

      // Zero or two nonterminal symbols
      var nonterminals = [];
      for (const v of Object.keys(this.rules)) {
        if (rule.includes(v)) {
          if (v === firstRule) { return false; }
          nonterminals.push(v);
        }
      }
      if (nonterminals.length !== 0 && nonterminals.length !== 2) { return false; }

      // Cannot mix terminals and nonterminals in the same production.
      var terminals = rule;
      for (const v of nonterminals) { terminals = terminals.replace(new RegExp(v, 'g'), ''); }

      if (nonterminals.length > 0 && terminals !== '') { return false; }
    }
  }

  return true;
}

/**
 * Determines the grammars alphabet.
 *
 * @param {Boolean} includeSpace - Is space it's own character in the alphabet (default: true)
 * @param {Boolean} eachCharacter - Whether or not the alphabet should be character wise. (default: false)
 * @return {[String]}
 */
Grammar.prototype.alphabet = function(includeSpace, eachCharacter) {
  var includeSpace = includeSpace !== false;
  var eachCharacter = eachCharacter !== true;

  var alphabet = [];
  if (includeSpace)
    alphabet.push(' ');

  for (const nonterminal of Object.keys(this.rules)) {
    for (const production of this.rules[nonterminal]) {
      var word = "";
      for (var i = 0; i < production.length; ++i) {
        var jump = 0;

        // Check if the next one is a nonterminal.
        for (const candidate of Object.keys(this.rules)) {
          if (production.substring(i, i+candidate.length) === candidate) {
            if (word !== "" && !alphabet.includes(word))
              alphabet.push(word);
            word = "";
            jump = candidate.length;
            break;
          }
        }

        if (jump > 0) {
          i += jump-1;
        }
        else if (includeSpace && production[i] === ' ') { // Reset if it's in the alphabet.
          if (word !== "" && !alphabet.includes(word))
            alphabet.push(word);
          word = "";
        }
        else {
          word += production[i];
        }
      }
      if (word !== "" && !alphabet.includes(word))
        alphabet.push(word);
    }
  }

  return alphabet;
}

/**
 * Generates a random string using the grammar.
 *
 * @param {String} start - (Optional) Override the grammar's starting nonterminal.
 * @return {String}
 */
Grammar.prototype.generate = function(start) {
  if (!this.isValid()) {
    throw new Error('Cannot generate from invalid grammar.')
  }

  const firstRule = start || this.start;

  if (firstRule === '' || !this.rules[firstRule]) {
    throw new Error('Cannot generate from grammer, invalid/no start point specified.')
  }

  var str = firstRule;
  while (true) {
    // Find the first variable, left-to-right.
    let nonterminal;
    let dist = -1;
    for (const v of Object.keys(this.rules)) {
      var idx = str.indexOf(v);
      if (idx >= 0 && (idx < dist || dist === -1)) {
        nonterminal = v;
        dist = idx;
      }
    }

    // No more variables found. Generation is done.
    if (dist === -1)
      break;

    // Replace the first entry with our randomly chosen rule.
    var nextRule = getSample(this.rules[nonterminal]);
    str = str.replace(nonterminal, nextRule);
  }

  return str;
}

module.exports = Grammar;

/////////////////////////////////////
// Private methods                 //
/////////////////////////////////////
// Robert Jenkin's random function.
var seed = Math.random()*0x2F6E2B1;
function random() {
  seed = ((seed + 0x7ED55D16) + (seed << 12))  & 0xFFFFFFFF;
  seed = ((seed ^ 0xC761C23C) ^ (seed >>> 19)) & 0xFFFFFFFF;
  seed = ((seed + 0x165667B1) + (seed << 5))   & 0xFFFFFFFF;
  seed = ((seed + 0xD3A2646C) ^ (seed << 9))   & 0xFFFFFFFF;
  seed = ((seed + 0xFD7046C5) + (seed << 3))   & 0xFFFFFFFF;
  seed = ((seed ^ 0xB55A4F09) ^ (seed >>> 16)) & 0xFFFFFFFF;
  return (seed & 0xFFFFFFF) / 0x10000000;
}

// Get a random integer between min and max (including min, excluding max).
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(random() * (max - min)) + min;
}

// Get a random array element.
function getSample(array) {
  const idx = getRandomInt(0, array.length);
  return array[idx];
}
