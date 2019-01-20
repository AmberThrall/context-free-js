var Grammar = require('./grammar')
var Tree = require('./tree');

/**
 * State class. Used internally for parser.
 *
 * @constructor
 * @param {String} nonterminal - The rules nonterminal.
 * @param {String} production - The rules production.
 * @param {String} index - The current position within the production.
 * @param {String} origin - What branch of chart was this created for.
 */
function State(nonterminal, production, index, origin, sppf) {
  this.rule = {
    nonterminal: nonterminal,
    production: production
  }

  if (!nonterminal || nonterminal === '' || !production || production === '') {
    throw Error("Received bad state.")
  }

  this.index = index;
  this.origin = origin;
  this.sppf = sppf || [];
}

/**
 * Determines if this state finished.
 *
 * @return {Boolean}
 */
State.prototype.finished = function() {
  return this.index >= this.rule.production.length;
}

/**
 * Creates a new identical state whose index has been shifted.
 *
 * @param {Integer} amt - The amount to shift.
 * @return {State}
 */
State.prototype.shift = function(amt) {
  return new State(this.rule.nonterminal, this.rule.production, this.index + amt, this.origin, this.sppf.slice(0));
}

/**
 * Adds a new state to the sppf list.
 *
 * @param {State} state
 * @return {this}
 */
State.prototype.addState = function(state) {
  this.sppf.push(state);
  return this;
}

/**
 * Gets the next word of the production. Does not change index.
 *
 * @param {Integer} grammar - The grammar we are working with. Required to find nonterminals in string.
 * @return {String}
 */
State.prototype.next = function(grammar) {
  // Get the next nonterminal/terminal.
  if (grammar && this.rule.production.length > 1) {
    // Check if it is a nonterminal first.
    for (const key of Object.keys(grammar.rules)) {
      if (this.rule.production.substring(this.index, this.index+key.length) === key)
        return key;
    }
  }

  // If the length is only one, don't bother searching.
  return this.rule.production[this.index];
}

/**
 * Compares two states to determine if they are the same.
 *
 * @param {State} other - The other state.
 * @return {Boolean}
 */
State.prototype.equals = function(other) {
  if (this.rule.nonterminal === other.rule.nonterminal &&
    this.rule.production === other.rule.production &&
    this.origin === other.origin &&
    this.index === other.index &&
    this.sppf.length === other.sppf.length) {
      return true;
  }
  return false;
}

/**
 * Constructs a nice string of our state.
 *
 * @return {String}
 */
State.prototype.toString = function() {
  var str = this.rule.nonterminal + "→";
  for (var i = 0; i <= this.rule.production.length; ++i) {
    if (i == this.index) {
      str += '•';
    }
    if (i < this.rule.production.length)
      str += this.rule.production[i];
  }

  return str;
}

var Parser = {
  Tree: Tree,

  /**
   * Derives the path to a given string for a grammar. Uses Earley's parsing algorithm.
   * https://en.wikipedia.org/wiki/Earley_parser
   *
   * @param {Grammar} grammar  - The grammar used for derivation.
   * @param {String} str - The target string.
   * @return {{Object}} -  Output of the algorithm.
   *                          gamma: The inserted new start state requried.
   *                          input: The given input.
   *                          derivations: List of derivations to the input (if any).
   *                          chart: The chart constructed by Earley's algorithm.
   *
  */
  derive: function(grammar, str) {
    if (!grammar) {
      throw Error("Failed to derive string from language, no grammar specified.");
    }

    /**
     * Prepare our chart to be the correct dimensions.
    */
    var chart = [];
    for (var k = 0; k <= str.length; ++k) {
      chart.push([]);
    }
    var gamma = "S";
    if (grammar.rules[gamma]) {
      var cnt = 0;
      while (true) {
        gamma = "S"+cnt;
        if (grammar.rules[gamma])
          cnt += 1;
        else
          break;
      }
    }

    /**
     * Add a new state to the chart if it is new.
    */
    var addToSet = function(newState, k) {
      if (k > str.length || k < 0)
        return;

      for (var j = 0; j < chart[k].length; ++j) {
        var state = chart[k][j];
        if (state.equals(newState))
          return;
      }

      chart[k].push(newState);
    }

    /*
     * Predictor stage
    */
    var predictor = function(state, k) {
      var nonterminal = state.next(grammar); // Should be a nonterminal.
      for (var production of grammar.rules[nonterminal]) {
        var newState = new State(nonterminal, production, 0, k);
        addToSet(newState, k);
      }

      /*for(var i=0; i < chart[k].length; ++i) {
        var candidate = chart[k][i];

        if (candidate.rule.nonterminal === nonterminal && candidate.origin === k && candidate.finished()) {
          var newState = state.shift(candidate.rule.nonterminal.length);
          newState.addState(candidate);
          addToSet(newState, k+1);
        }
      }*/
    }

    /*
     * Scanner stage
     */
    var scanner = function(state, k) {
      var next = state.next(grammar);
      if (next === str[k]) { // Should be a terminal.
        var newState = state.shift(1);
        newState.addState(next);
        addToSet(newState, k+1);
      }
    }

    /*
     * Completer stage
     */
    var completer = function(state, k) {
      for(var i=0; i<chart[state.origin].length; ++i) {
        var prev = chart[state.origin][i];
        if (!prev.finished() && state.rule.nonterminal === prev.next(grammar)) {
          var newState = prev.shift(state.rule.nonterminal.length);
          newState.addState(state);
          addToSet(newState, k);
        }
      }
    }

    /*
     * Perform the actual algorithm.
     */
    addToSet(new State(gamma, grammar.start, 0, 0), 0);
    for (var k = 0; k <= str.length; ++k) {
      for (var j = 0; j < chart[k].length; ++j) { // The array S[k] may grow in size.
        var state = chart[k][j];

        if (state.finished()) {
          completer(state, k);
        }
        else if (grammar.rules[state.next(grammar)]) { // Is the next symbol a non terminal?
          predictor(state, k);
        }
        else {
          scanner(state, k);
        }
      }
    }

    /*
     * Clean up any unfinished states.
     */
    for (var k = 0; k <= str.length; ++k) {
      for (var j = 0; j < chart[k].length; ++j) {
        var state = chart[k][j];
        if (!state.finished()) {
          chart[k].splice(j,1);
          j -= 1;
        }
      }
    }

    /*
     * Find any paths that succesfully completed.
     */
    var derivations = [];
    for (var state of chart[str.length]) {
      if (state.rule.nonterminal === gamma && state.finished()) {
        derivations.push(state);
      }
    }

    return {
      gamma: gamma,
      input: str,
      derivations: derivations,
      chart: chart
    };
  }
}

module.exports = Parser;
