import * as esgraph from 'esgraph';
import {parseCode} from './code-analyzer';
import {substitute_func_decl, Scope} from './symbolic-substitution';
import {bind_params, parse_input_vector} from './code-painter';
import * as escodegen from 'escodegen';

let split_dot = [], type_dot = [], shaped_nodes = [], painted_nodes = [], flow_nodes = [], edges = [];
let flow_map;

function program_graph(codeToParse, input) {
    flow_map = new Map();
    let parsedCode = parseCode(codeToParse), func_decl = parsedCode['body'][0], cfg = esgraph(func_decl['body']);
    if (input.body.length > 0) {
        let parsed_input = parse_input_vector(input.body[0]);
        let scope = bind_params(func_decl, parsed_input);
        substitute_func_decl(func_decl, new Scope(scope));
    }
    setup_graph(cfg, codeToParse);
    if (input.body.length > 0) {
        paint_nodes();
        return merge_nodes(painted_nodes.slice(0, -1)) + merge_edges(edges);
    } else
        return merge_nodes(shaped_nodes) + merge_edges(edges);
}

function setup_graph(cfg, codeToParse) {
    flow_nodes = cfg[2].slice(1);
    flow_nodes.forEach(node => node.exception = null);
    cfg[2] = flow_nodes;
    split_dot = esgraph.dot(cfg, {counter: 0, source: codeToParse}).split('\n');
    type_dot = esgraph.dot(cfg).split('\n');
    shaped_nodes = []; painted_nodes = [];
    split_dot.splice(0, cfg[2].length - 1).forEach(node => shape_node(node));
    edges = split_dot.slice(1).filter(edge => !edge.includes('n' + (cfg[2].length - 1).toString()));
}

function paint_nodes() {
    for (let i = 0; i < shaped_nodes.length; i++) {
        flow_map.set(flow_nodes[i], shaped_nodes[i]);
    }
    check_paint(flow_nodes[0]);
    let iterator = flow_map.values();
    let dot_node = iterator.next();
    while (!dot_node.done) {
        painted_nodes.push(dot_node.value);
        dot_node = iterator.next();
    }
}

const shape_node = node => {
    is_bin_expr(node) ? node = node.replace(']', ' shape=diamond]') : node = node.replace(']', ' shape=box]');
    shaped_nodes.push(node);
};

function check_paint(flow_node) {
    let node = flow_node.astNode;
    flow_map.set(flow_node, paint_node(flow_map.get(flow_node)));
    if (node && node.type === 'BinaryExpression') {
        check_paint_bin_expr(flow_node, node);
    } else if(flow_node.normal && !is_painted(flow_map.get(flow_node.normal))) {
        check_paint(flow_node.normal);
    }
}

function check_paint_bin_expr(flow_node, node) {
    let eval_result = eval(escodegen.generate(node));
    if (flow_node.parent.type !== 'WhileStatement')
        eval_result ? check_paint(flow_node.true) : check_paint(flow_node.false);
    else if (eval_result) {
        check_paint(flow_node.true);
        check_paint(flow_node.false);
    } else {
        check_paint(flow_node.false);
    }
}

const is_painted = node => node && node.includes('green');

const paint_node = node => {
    return node ? node.replace(']', '; style=filled; fillcolor=green]') : node;
};

const is_bin_expr = node => (!node || node.length < 2) ? false : type_dot[dot_node_index(node)].includes('BinaryExpression');

const dot_node_index = node => parseInt(node.charAt(1));

function merge_edges(arr) {
    let str = '';
    arr.forEach(e => str += e.toString() + '\n');
    return str;
}

function merge_nodes(nodes) {
    let str = '';
    for (let i = 0; i < nodes.length; i++)
        str += nodes[i].toString().replace('label="', 'label="(' + (i + 1) + ')\n') + '\n';
    return str;
}

export {program_graph, is_bin_expr};