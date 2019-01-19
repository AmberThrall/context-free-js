var { Grammar } = require('../src/grammar')
var Test = require('tape');

Test('Matching pairs', function (t) {
  var grammar = new Grammar('S');
  grammar.addRule('S', 'aSb', '');

  var count = 0;
  for (var i = 0; i < 10; i += 1) {
    var gen = grammar.generate();
    if (gen.match(/a*b*/).length === 1) { count += 1; }

    t.equal(i+1, count);
  }

  t.end();
});

Test('Well-formed parentheses', function(t) {
  var grammar = new Grammar('S');
  grammar.addRule('S', 'SS', '(S)', '()');

  for (var i = 0; i < 10; i += 1) {
    var gen = grammar.generate();
    var stack = 0;
    for (var c of gen) {
      if (c === '(') { stack += 1; }
      else if (c === ')') { stack -= 1; }
      else { stack = -9999; }
    }
    t.equal(0, stack);
  }

  t.end();
});

Test('Chomsky normal form', function(t) {
  var grammar1 = new Grammar('S', {
    'S': [ 'AB', '' ],
    'A': [ 'a' ],
    'B': [ 'b' ]
  });
  t.equal(true, grammar1.isChomsky());

  var grammar2 = new Grammar('S', {
    'S': [ 'ASA', 'aB' ],
    'A': [ 'B', 'S' ],
    'B': [ 'b', '' ]
  });
  t.equal(false, grammar2.isChomsky());

  // Grammar 3 is equivalent to grammar 2 but in CNF.
  var grammar3 = new Grammar('S0', {
    'S0': [ 'AX', 'YB', 'a', 'AS', 'SA' ],
    'S': [ 'AX', 'YB', 'a', 'AS', 'SA' ],
    'A': [ 'b', 'AX', 'YB', 'a', 'AS', 'SA' ],
    'B': [ 'b' ],
    'X': [ 'SA' ],
    'Y': [ 'a' ]
  });
  t.equal(true, grammar3.isChomsky());
  t.end();
})

/*function test2() {
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

  var grammar = new Grammar('<start>', rules);
  console.log(grammar);

  for (let i=1; i < 10; i++) {
    console.log(grammar.generate());
  }
}

function test3() {
  // Thanks to http://rednoise.org/rita/examples/p5js/HaikuGrammar/
  const rules = {
    '<start>': [ '<5-line> \n  <7-line> \n<5-line>' ],
    '<5-line>': ['<1> <4>','<1> <3> <1>','<1> <1> <3>','<1> <2> <2>','<1> <2> <1> <1>','<1> <1> <2> <1>','<1> <1> <1> <2>','<1> <1> <1> <1> <1>','<2> <3>','<2> <2> <1>','<2> <1> <2>','<2> <1> <1> <1>','<3> <2>','<3> <1> <1>','<4> <1>','<5>'],
    '<7-line>': ['<1> <1> <5-line>','<2> <5-line>','<5-line> <1> <1>','<5-line> <2>'],
    '<1>': ['red','white','black','sky','dawns','breaks','falls','leaf','rain','pool','my','your','sun','clouds','blue','green','night','day','dawn','dusk','birds','fly','grass','tree','branch','through','hell','zen','smile','gray','wave','sea','through','sound','mind','smoke','cranes','fish'],
    '<2>': ['drifting','purple','mountains','skyline','city','faces','toward','empty','buddhist','temple','japan','under','ocean','thinking','zooming','rushing','over','rice field','rising','falling','sparkling','snowflake'],
    '<3>': ['sunrises','pheasant farms','people farms','samurai','juniper','fishing boats','far away','kimonos','evenings','peasant rain','sad snow fall'],
    '<4>': ['aluminum','yakitori','the east village','west of the sun',' chrysanthemums','cherry blossoms'],
    '<5>': ['resolutional','non-elemental','rolling foothills rise','toward mountains higher','out over this country','in the springtime again'],
  };

  var grammar = new Grammar('<start>', rules);
  console.log(grammar);

  for (let i=1; i < 10; i++) {
    console.log(grammar.generate());
    console.log();
  }
}*/
