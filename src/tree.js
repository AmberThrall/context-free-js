/**
 * Node class
 *
 * @constructor
 * @param {String} id - Unique string id for outputting to DOT format.
 * @param {Object} data - Store data in the node.
 * @param {String} label - Node's label, used for output. (default: id)
 * @param {String} shape - Sets the node's shape for DOT format. (default: 'box')
 */
function Node(id, data, label, shape) {
  this.id = id;
  this.data = data;
  this.label = label || id;
  this.nodes = [];
  this.edgeAttributes = [];
  this.shape = shape || 'box';
}

/**
 * Attaches two nodes together (this -> other)
 *
 * @constructor
 * @param {Node} other - Other node.
 * @param {String} label - Edge's label, used for output. (default: undefined)
 * @param {String} color - Edge's color, used for output. (default: undefined)
 * @param {String} style - Edge's style, used for output. (default: undefined)
 */
Node.prototype.attachNode = function(other, label, color, style) {
  this.nodes.push(other);
  this.edgeAttributes.push({
    label: label,
    color: color,
    style: style
  });
}

/**
 * Tree class
 *
 * @constructor
 * @param {Node} root - Tree's root node.
 */
function Tree(root) {
  this.root = root;
}

// Make nodes publicly accessbile.
Tree.Node = Node;

/**
 * Depth-first-search (DFS)
 *
 * @param {Node} start - Choose where to start the search (default: tree's root)
 * @return {[Node]} - Path to target nodes given as array of nodes.
 */
Tree.prototype.DFS = function(start) {
  start = start || this.root;

  var history = [];
  function _dfs(v) {
    history.push(v);

    for (var w of v.nodes) {
      if (!history.includes(w)) {
        _dfs(w);
      }
    }
  }

  _dfs(start);
  return history;
}

/**
 * Forms a parse tree based off a derivation given by the parser.
 *
 * @param {State} sppf - Our discovered derivation's SPPF linked list.
 * @return {Tree} - Result.
 */
Tree.ParseTree = function(sppf) {
  if (!sppf)
    throw new Error("No chart was provided for parse tree.");
  var root = new Node('root', sppf.sppf[0], sppf.sppf[0].rule.nonterminal);
  var nodeCount = 0;

  function _build(root, state, depth) {
    depth = depth || 0;

    var head = root;
    if (depth > 0) {
      var head = new Node('node'+nodeCount, state, state.rule.nonterminal);
      root.attachNode(head);
      nodeCount++;
    }

    for (var i = 0; i < state.sppf.length; ++i) {
      var next = state.sppf[i];
      if (typeof next === "string") { // We hit a terminal.
        if (next === ' ') next = '␣';
        head.attachNode(new Node('node'+nodeCount, state, next, 'oval'));
        nodeCount++;
      }
      else {
        _build(head, next, depth+1);
      }
    }
  }

  _build(root, sppf.sppf[0]);
  return new Tree(root);
}

/**
 * Converts the tree to a DOT format digraph for use in software like graphviz.
 *
 * @param {String} name - Name of the digraph (default: g)
 * @return {String}
 */
Tree.prototype.toDOT = function(name) {
  name = name || 'g'
  var text = "digraph "+name+" {\n"
  text += "    root [label=\""+this.root.label+"\", shape="+this.root.shape+"];\n";
  text += treeBuildDOTNodes(this.root)+"\n";
  text += treeBuildDOTEdges(this.root);
  text += "}";
  return text;
}

/**
 * Constructs a tree from a Earley chart.
 *
 * @param {[[State]]} chart - Chart given by Parser.derive.
 * @param {String} input - The input string. Only used if createBranches is true. If input="", the branch nodes will be labeled
 *                         by the branch index. Otherwise the branch nodes will be the input with a dot placed at position k. (default: "")
 * @param {Boolean} createBranches - Incorporate the outer loop into the graph. (default: true)
 * @return {String}
 */
Tree.fromChart = function(chart, input, createBranches) {
  createBranches = createBranches !== false;
  input = input || "";
  var root = new Node('root', null, "γ", "invtriangle");
  var branches;

  if (createBranches) {
    branches = [];
    for (var k = 0; k < chart.length; ++k) {
      var label = "";
      for (var i = 0; i <= input.length; ++i) {
        if (i == k) {
          label += '•';
        }
        if (i < input.length)
          label += input[i];
      }
      if (label==="") label=k;
      branches.push(new Node('branch'+k, null, label, "plain"));

      if (k>0)
        branches[k-1].attachNode(branches[k]);
      else
        root.attachNode(branches[k]);
    }
  }

  var prevNode = root;
  for (var k = 0; k < chart.length; ++k) {
    if (createBranches) {
      prevNode = branches[k];
    }

    for (var j = 0; j < chart[k].length; ++j) {
      var node = new Node('node_'+k+'_'+j, chart[k][j], "("+chart[k][j].toString()+", "+chart[k][j].origin+")");
      if (chart[k][j].finished())
        node.shape = "oval";
      prevNode.attachNode(node);
      prevNode = node;
    }
  }

  return new Tree(root);
}

module.exports = Tree;


/////////////////////////////////////
// Private methods                 //
/////////////////////////////////////
function treeBuildDOTNodes(root, text) {
  text = text || "";

  var prefix = '    ';
  for (var i = 0; i < root.nodes.length; ++i) {
    var node = root.nodes[i];

    text += prefix + node.id + " [label=\""+node.label+"\", shape="+node.shape+"];\n"
    text = treeBuildDOTNodes(node, text);
  }

  return text;
}

function treeBuildDOTEdges(root, text) {
  text = text || "";

  var prefix = '    ';
  for (var i = 0; i < root.nodes.length; ++i) {
    var node = root.nodes[i];
    var attributes = root.edgeAttributes[i];

    // Build the attribute box.
    var attrib = "";
    if (attributes && attributes.label) { attrib+=" [label=\""+attributes.label+"\"" }
    if (attributes && attributes.color) {
      if (attrib !== "") attrib += ", ";
      else attrib = " [";
      attrib+="color="+attributes.color;
    }
    if (attributes && attributes.style) {
      if (attrib !== "") attrib += ", ";
      else attrib = " [";
      attrib+="style="+attributes.style;
    }
    if (attrib !== "") attrib += "]";

    text += prefix + root.id + " -> " + node.id+attrib+";\n";
    text = treeBuildDOTEdges(node, text);
  }

  return text;
}
