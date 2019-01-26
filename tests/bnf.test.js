var CFG = require('../src/')
const util = require('util')

try {
  var simple = new CFG.Grammar('<syntax>',
  `
  <postal-address> ::= <name-part> <street-address> <zip-part>

  <name-part> ::= <personal-part> <last-name> <opt-suffix-part> <EOL> | <personal-part> <name-part>

  <personal-part> ::= <initial> "." | <first-name>

  <street-address> ::= <house-num> <street-name> <opt-apt-num> <EOL>

  <zip-part> ::= <town-name> "," <state-code> <ZIP-code> <EOL>

  <opt-suffix-part> ::= "Sr." | "Jr." | <roman-numeral> | ""
  <opt-apt-num> ::= <apt-num> | ""
  `)

  console.log(util.inspect(simple.rules, false, null, true));
} catch(e) {
  console.log(e);
}
