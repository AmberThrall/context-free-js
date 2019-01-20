var CFG = require('../src/')
//var Test = require('tape');

var applyState = function(str, state) {
  var idx = str.indexOf(state.rule.nonterminal);
  return str.substr(0, idx) + state.rule.production + str.substr(idx + state.rule.nonterminal.length);
}

function dumpParse(parse, start, string) {
  console.log(string);
  console.log("Number of derivations: "+parse.derivations.length);
  for (var derivation of parse.sppfs) {
    console.log();
    console.log("Rule\t\tBefore\t\tAfter");
    console.log("========================================")
    var currentString = start;
    for (var state of derivation.spdf) {
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
var parse = CFG.Parser.derive(grammar, "((()))()");
//console.log(CFG.Parser.Tree.ParseTree(parse.derivations[0]).toDOT());
//console.log();

grammar = new CFG.Grammar('<SENTENCE>', {
  '<SENTENCE>': [
    "<NOUN-PHRASE><VERB-PHRASE>"
  ],
  '<NOUN-PHRASE>': [
    "<CMPLX-NOUN>", "<CMPLX-NOUN><PREP-PHRASE>"
  ],
  '<VERB-PHRASE>': [
    "<CMPLX-VERB>", "<CMPLX-VERB><PREP-PHRASE>"
  ],
  '<PREP-PHRASE>': [
    "<PREP> <CMPLX-NOUN>"
  ],
  '<CMPLX-NOUN>': [
    "<ARTICLE> <NOUN> "
  ],
  '<CMPLX-VERB>': [
    "<VERB> ", "<VERB> <NOUN-PHRASE>"
  ],
  '<ARTICLE>': [
    'a', 'the'
  ],
  '<NOUN>': [
    'boy', 'girl', 'flower'
  ],
  '<VERB>': [
    'touches', 'likes', 'sees'
  ],
  '<PREP>': [ 'with' ]
});
//parse "the girl with a flower likes a boy with a flower ";
var parse = CFG.Parser.derive(grammar, "the girl with a flower likes a boy with a flower ");
//dumpParse(parse, "<start>", parse.input);
//console.log(CFG.Parser.Tree.ParseTree(parse.derivations[0]).toDOT());

grammar = new CFG.Grammar('<start>', {
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
})
//parse "the girl with a flower likes a boy with a flower ";
var parse = CFG.Parser.derive(grammar, "The cat is cute.");
//dumpParse(parse, "<start>", parse.input);
//console.log(CFG.Parser.Tree.ParseTree(parse.derivations[0]).toDOT());
//console.log();

const rules = {
  'S': [
    "N", "S+S", "S-S", "S*S", "S/S", "(S)"
  ],
  "N": [
    "NN", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0"
  ]
};

grammar = new CFG.Grammar('S', rules);
var parse = CFG.Parser.derive(grammar, "2*4+7");
//dumpParse(parse, "<start>", parse.input);
console.log(CFG.Parser.Tree.ParseTree(parse.derivations[0]).toDOT());
