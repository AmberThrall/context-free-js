'use strict';

/**
 * Grammar class.
 *
 * @constructor
 * @param {String} start - Initial starting variable.
 * @param {Object} rules - Optional argument to add multiple rules at once.
 */
function Grammar(start = '<start>', rules = {}) {
  this.rules = {};
  this.start = start;
  this.varRegex = /(\[<\()*(\w+)(\]>\))*/g;

  if (rules !== {}) {
    this.addRules(rules);
  }
}

/**
 * Adds a set of rules for a given variable.
 *
 * @param {String} variable - Our variable.
 * @param {[String]} expressions - List of expressions, results in the or operator '|' being used.
 */
Grammar.prototype.addRule = function(variable, ...exprs) {
  if (exprs.length === 0) {
    throw Error("No expression(s) given to a rule.")
  }
  for (const expr of exprs) {
    if (!this.rules[variable]) {
      this.rules[variable] = [];
    }
    if (this.rules[variable].includes(expr)) {
      console.warn("A rule was added more than once: "+variable+" -> "+expr)
    }
    this.rules[variable].push(expr);
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
 * Performs a rule (variable -> rule) to a string.
 *
 * @param {String} string - Input string
 * @param {String} variable - Variable for the rule
 * @param {String} expressoin - Expression for the rule
 * @return {String}
 */
Grammar.prototype.performRule = function(str, variable, rule) {
  return str.replace(variable, rule);
}

/**
 * Generates a random string using the grammar.
 *
 * @param {String} start - (Optional) Override the grammar's start location.
 * @return {String}
 */
Grammar.prototype.generate = function(start) {
  const firstRule = start || this.start;

  if (firstRule === '' || !this.rules[firstRule]) {
    throw new Error('Cannot generate from grammer, invalid/no start point specified.')
  }

  return _genStep(firstRule, this);
}

module.exports = { Grammar: Grammar }

/////////////////////////////////////
// Private methods
/////////////////////////////////////
var _genStep = function(rule, grammar) {
  if (!rule) {
    return rule;
  }

  let vars = [];
  for (const v of Object.keys(grammar.rules)) {
    if (rule.includes(v))
      vars.push(v);
  }
  if (vars.length == 0) {
    return rule;
  }

  for (const v of vars) {
    var nextRule = getSample(grammar.rules[v]);
    rule = grammar.performRule(rule, v, nextRule);
  }

  return _genStep(rule, grammar);
}

// Get a random integer between min and max (including min, excluding max).
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

// Get a random array element.
function getSample(array) {
  const idx = getRandomInt(0, array.length);
  return array[idx];
}
