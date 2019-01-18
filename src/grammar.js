"use strict";

var m_w = 123456789;
var m_z = 987654321;
var mask = 0xffffffff;

// Takes any integer
function setSeed(i) {
    m_w = (123456789 + i) & mask;
    m_z = (987654321 - i) & mask;
}

// Returns number between 0 (inclusive) and 1.0 (exclusive), identical output as Math.random()
function getRandom()
{
    m_z = (36969 * (m_z & 65535) + (m_z >> 16)) & mask;
    m_w = (18000 * (m_w & 65535) + (m_w >> 16)) & mask;
    var result = ((m_z << 16) + (m_w & 65535)) >>> 0;
    result /= 4294967296;
    return result;
}

// Get a random integer between min and max (including min, excluding max).
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(getRandom() * (max - min)) + min;
}

function getSample(array) {
  const idx = getRandomInt(0, array.length);
  return array[idx];
}

class Grammar {
  constructor(start = '<start>', rules = {}) {
    this.rules = {};
    this.start = start;
    this.varRegex = /(\[<\()*(\w+)(\]>\))*/g;

    if (rules !== {}) {
      this.addRules(rules);
    }

    return this;
  }

  addRule(variable, ...exprs) {
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

    return this;
  }

  addRules(rules) {
    for (const key of Object.keys(rules)) {
      if (!Array.isArray(rules[key])) {
        throw Error("Invalid rule '"+key+"'. Content must of an array of strings.")
      }

      for (const rule of rules[key]) {
        this.addRule(key, rule);
      }
    }

    return this;
  }

  generate(start, seed) {
    const firstRule = start || this.start;

    if (firstRule === '' || !this.rules[firstRule]) {
      throw new Error('Cannot generate from grammer, invalid/no start point specified.')
    }

    if (seed) { setSeed(seed); }
    else { setSeed(Math.random()*1000); }
    return this._genStep(firstRule);
  }

  _genStep(rule) {
    if (!rule) {
      return rule;
    }

    let vars = [];
    for (const v of Object.keys(this.rules)) {
      if (rule.includes(v))
        vars.push(v);
    }
    if (vars.length == 0) {
      return rule;
    }

    for (const v of vars) {
      var nextRule = getSample(this.rules[v]);
      rule = rule.replace(v, nextRule);
    }

    return this._genStep(rule);
  };
}

module.exports = Grammar;
