var CFG = require('../src/')
const util = require('util')

try {
  var grammar = new CFG.Grammar('<syntax>',
  `
  <syntax> ::= <number> | <syntax> "+" <syntax> | <syntax> "*" <syntax> | <syntax> "/" <syntax> | "(" <syntax> ")"
  <number> ::= <number><number> | <digit>
  `)

  var parse = CFG.Parser.derive(grammar, "2*4+7");
  console.log(parse.derivations[0].toDOT());
} catch(e) {
  console.log(e);
}
