var CFG = require('../src/')
//var Test = require('tape');

var applyState = function(str, state) {
  var idx = str.indexOf(state.rule.nonterminal);
  return str.substr(0, idx) + state.rule.production + str.substr(idx + state.rule.nonterminal.length);
}

function dumpParse(parse, start, string) {
  console.log(string);
  console.log("Number of derivations: "+parse.derivations.length);
  for (var derivation of parse.derivations) {
    console.log();
    console.log("Rule\t\tBefore\t\tAfter");
    console.log("========================================")
    var currentString = start;
    for (var state of derivation) {
      if (state === null)
        continue;
      var newString = applyState(currentString, state);
      var line = state.rule.nonterminal + "->" + state.rule.production + "\t\t" + currentString + "\t\t" + newString;
      console.log(line);
      currentString = newString;
    }
  }
}

var grammar = new CFG.Grammar('S');
grammar.addRule('S', 'SS', '(S)', '()');
//dumpParse(CFG.Parser.derive(grammar, "(())"), "S", "(())")
//console.log();

grammar = new CFG.Grammar('S', {
  'S': [
    "N", "S+S", "S-S", "S*S", "S/S", "(S)"
  ],
  "N": [
    "NN", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0"
  ]
})
var parse = CFG.Parser.derive(grammar, "2+3*4");
//dumpParse(parse, "S", parse.input);
console.log(CFG.Parser.Tree.ParseTree(parse.derivations[0]).toDOT());
//console.log();

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

grammar = new CFG.Grammar('<start>', rules);
var parse = CFG.Parser.derive(grammar, "The cat is cute.");
//dumpParse(parse, "<start>", parse.input);
