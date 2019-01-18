'use strict';

const Grammar = require('../');

function test1() {
  var grammar = new Grammar('S');
  grammar.addRule('S', 'aSa', 'bSb', '');
  console.log(grammar);

  for (let i=1; i < 10; i++) {
    console.log(grammar.generate());
  }
}

function test2() {
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
}

try {
  test1();
  test2();
  test3();
} catch(e) {
  console.log(e);
}
