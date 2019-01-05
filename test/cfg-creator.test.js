import assert from 'assert';
import {program_graph, is_bin_expr} from '../src/js/cfg-creator';
import * as esprima from 'esprima';

let first_example = 'function foo(x, y, z){\n' +
    '    let a = x + 1;\n' +
    '    let b = a + y;\n' +
    '    let c = 0;\n' +
    '    \n' +
    '    if (b < z) {\n' +
    '        c = c + 5;\n' +
    '    } else if (b < z * 2) {\n' +
    '        c = c + x + 5;\n' +
    '    } else {\n' +
    '        c = c + z + 5;\n' +
    '    }\n' +
    '    \n' +
    '    return c;\n' +
    '}\n';

let second_exmaple = 'function foo(x, y, z){\n' +
    '   let a = x + 1;\n' +
    '   let b = a + y;\n' +
    '   let c = 0;\n' +
    '   \n' +
    '   while (a < z) {\n' +
    '       c = a + b;\n' +
    '       z = c * 2;\n' +
    '       a++;\n' +
    '   }\n' +
    '   \n' +
    '   return z;\n' +
    '}\n';

let my_func = 'function foo(x, y, z){\n' +
    '   let a = x + 1;\n' +
    '   let b = a + y;\n' +
    '   let c = 0;\n' +
    '   \n' +
    '   while (a < z) {\n' +
    '       c = a + b;\n' +
    '       if(c < 5) {\n' +
    '            z = c * 2;\n' +
    '       } else {\n' +
    '            z = c * 4;\n' +
    '       }\n' +
    '       a++;\n' +
    '   }\n' +
    '   \n' +
    '   return z;\n' +
    '}';

let my_other_func = 'function foo(x, y, z){\n' +
    '    let a = x + 1;\n' +
    '    let b = a + y;\n' +
    '    let c = 0;\n' +
    '    \n' +
    '    if (b < z) {\n' +
    '        if(b < z / 2) {\n' +
    '            c = c + 10;\n' +
    '        } else {\n' +
    '            c = c + 5;\n' +
    '        }\n' +
    '    } else if (b < z * 2) {\n' +
    '        c = c + x + 5;\n' +
    '    } else {\n' +
    '        c = c + z + 5;\n' +
    '    }\n' +
    '    \n' +
    '    return c;\n' +
    '}\n';

it('The cfg-creator should create a valid cfg from Aviram\'s first example with input', () => {
    assert.deepEqual(program_graph(first_example, esprima.parseScript('1, 2, 3')),
        'n0 [label="(1)\nlet a = x + 1;" shape=box; style=filled; fillcolor=green]\n' +
        'n1 [label="(2)\nlet b = a + y;" shape=box; style=filled; fillcolor=green]\n' +
        'n2 [label="(3)\nlet c = 0;" shape=box; style=filled; fillcolor=green]\n' +
        'n3 [label="(4)\nb < z" shape=diamond; style=filled; fillcolor=green]\n' +
        'n4 [label="(5)\nc = c + 5" shape=box]\n' +
        'n5 [label="(6)\nreturn c;" shape=box; style=filled; fillcolor=green]\n' +
        'n6 [label="(7)\nb < z * 2" shape=diamond; style=filled; fillcolor=green]\n' +
        'n7 [label="(8)\nc = c + x + 5" shape=box; style=filled; fillcolor=green]\n' +
        'n8 [label="(9)\nc = c + z + 5" shape=box]\n' +
        'n0 -> n1 []\nn1 -> n2 []\n' +
        'n2 -> n3 []\nn3 -> n4 [label="true"]\n' +
        'n3 -> n6 [label="false"]\nn4 -> n5 []\n' +
        'n6 -> n7 [label="true"]\nn6 -> n8 [label="false"]\n' +
        'n7 -> n5 []\nn8 -> n5 []\n\n'
    );});

it('The cfg-creator should create a valid cfg from Aviram\'s first example with different input', () => {
    assert.deepEqual(program_graph(first_example, esprima.parseScript('3, 2, 1')),
        'n0 [label="(1)\nlet a = x + 1;" shape=box; style=filled; fillcolor=green]\n' +
        'n1 [label="(2)\nlet b = a + y;" shape=box; style=filled; fillcolor=green]\n' +
        'n2 [label="(3)\nlet c = 0;" shape=box; style=filled; fillcolor=green]\n' +
        'n3 [label="(4)\nb < z" shape=diamond; style=filled; fillcolor=green]\n' +
        'n4 [label="(5)\nc = c + 5" shape=box]\n' +
        'n5 [label="(6)\nreturn c;" shape=box; style=filled; fillcolor=green]\n' +
        'n6 [label="(7)\nb < z * 2" shape=diamond; style=filled; fillcolor=green]\n' +
        'n7 [label="(8)\nc = c + x + 5" shape=box]\n' +
        'n8 [label="(9)\nc = c + z + 5" shape=box; style=filled; fillcolor=green]\n' +
        'n0 -> n1 []\nn1 -> n2 []\n' +
        'n2 -> n3 []\nn3 -> n4 [label="true"]\n' +
        'n3 -> n6 [label="false"]\nn4 -> n5 []\n' +
        'n6 -> n7 [label="true"]\nn6 -> n8 [label="false"]\n' +
        'n7 -> n5 []\nn8 -> n5 []\n\n'
    );});

it('The cfg-creator should create a valid cfg from Aviram\'s first example without input', () => {
    assert.deepEqual(program_graph(first_example, esprima.parseScript('')),
        'n0 [label="(1)\nlet a = x + 1;" shape=box]\n' +
        'n1 [label="(2)\nlet b = a + y;" shape=box]\n' +
        'n2 [label="(3)\nlet c = 0;" shape=box]\n' +
        'n3 [label="(4)\nb < z" shape=diamond]\n' +
        'n4 [label="(5)\nc = c + 5" shape=box]\n' +
        'n5 [label="(6)\nreturn c;" shape=box]\n' +
        'n6 [label="(7)\nb < z * 2" shape=diamond]\n' +
        'n7 [label="(8)\nc = c + x + 5" shape=box]\n' +
        'n8 [label="(9)\nc = c + z + 5" shape=box]\n' +
        'n0 -> n1 []\nn1 -> n2 []\n' +
        'n2 -> n3 []\nn3 -> n4 [label="true"]\n' +
        'n3 -> n6 [label="false"]\nn4 -> n5 []\n' +
        'n6 -> n7 [label="true"]\nn6 -> n8 [label="false"]\n' +
        'n7 -> n5 []\nn8 -> n5 []\n\n'
    );});

it('The cfg-creator should create a valid cfg from Aviram\'s second example without input', () => {
    assert.deepEqual(program_graph(second_exmaple, esprima.parseScript('')),
        'n0 [label="(1)\nlet a = x + 1;" shape=box]\n' +
        'n1 [label="(2)\nlet b = a + y;" shape=box]\n' +
        'n2 [label="(3)\nlet c = 0;" shape=box]\n' +
        'n3 [label="(4)\na < z" shape=diamond]\n' +
        'n4 [label="(5)\nc = a + b" shape=box]\n' +
        'n5 [label="(6)\nz = c * 2" shape=box]\n' +
        'n6 [label="(7)\na++" shape=box]\n' +
        'n7 [label="(8)\nreturn z;" shape=box]\n' +
        'n0 -> n1 []\n' +
        'n1 -> n2 []\n' +
        'n2 -> n3 []\n' +
        'n3 -> n4 [label="true"]\n' +
        'n3 -> n7 [label="false"]\n' +
        'n4 -> n5 []\n' +
        'n5 -> n6 []\n' +
        'n6 -> n3 []\n\n'
    );});

it('The cfg-creator should create a valid cfg from Aviram\'s second example with input', () => {
    assert.deepEqual(program_graph(second_exmaple, esprima.parseScript('1,2,3')),
        'n0 [label="(1)\nlet a = x + 1;" shape=box; style=filled; fillcolor=green]\n' +
        'n1 [label="(2)\nlet b = a + y;" shape=box; style=filled; fillcolor=green]\n' +
        'n2 [label="(3)\nlet c = 0;" shape=box; style=filled; fillcolor=green]\n' +
        'n3 [label="(4)\na < z" shape=diamond; style=filled; fillcolor=green]\n' +
        'n4 [label="(5)\nc = a + b" shape=box; style=filled; fillcolor=green]\n' +
        'n5 [label="(6)\nz = c * 2" shape=box; style=filled; fillcolor=green]\n' +
        'n6 [label="(7)\na++" shape=box; style=filled; fillcolor=green]\n' +
        'n7 [label="(8)\nreturn z;" shape=box; style=filled; fillcolor=green]\n' +
        'n0 -> n1 []\n' +
        'n1 -> n2 []\n' +
        'n2 -> n3 []\n' +
        'n3 -> n4 [label="true"]\n' +
        'n3 -> n7 [label="false"]\n' +
        'n4 -> n5 []\n' +
        'n5 -> n6 []\n' +
        'n6 -> n3 []\n\n'
    );});

it('The cfg-creator should create a valid cfg from Aviram\'s second example with different input', () => {
    assert.deepEqual(program_graph(second_exmaple, esprima.parseScript('3,2,1')),
        'n0 [label="(1)\nlet a = x + 1;" shape=box; style=filled; fillcolor=green]\n' +
        'n1 [label="(2)\nlet b = a + y;" shape=box; style=filled; fillcolor=green]\n' +
        'n2 [label="(3)\nlet c = 0;" shape=box; style=filled; fillcolor=green]\n' +
        'n3 [label="(4)\na < z" shape=diamond; style=filled; fillcolor=green]\n' +
        'n4 [label="(5)\nc = a + b" shape=box]\n' +
        'n5 [label="(6)\nz = c * 2" shape=box]\n' +
        'n6 [label="(7)\na++" shape=box]\n' +
        'n7 [label="(8)\nreturn z;" shape=box; style=filled; fillcolor=green]\n' +
        'n0 -> n1 []\n' +
        'n1 -> n2 []\n' +
        'n2 -> n3 []\n' +
        'n3 -> n4 [label="true"]\n' +
        'n3 -> n7 [label="false"]\n' +
        'n4 -> n5 []\n' +
        'n5 -> n6 []\n' +
        'n6 -> n3 []\n\n'
    );});

it('The cfg-creator should create a valid cfg from my function with input', ()=> {
    assert.deepEqual(program_graph(my_func, esprima.parseScript('3,2,1')),
        'n0 [label="(1)\nlet a = x + 1;" shape=box; style=filled; fillcolor=green]\n' +
        'n1 [label="(2)\nlet b = a + y;" shape=box; style=filled; fillcolor=green]\n' +
        'n2 [label="(3)\nlet c = 0;" shape=box; style=filled; fillcolor=green]\n' +
        'n3 [label="(4)\na < z" shape=diamond; style=filled; fillcolor=green]\n' +
        'n4 [label="(5)\nc = a + b" shape=box]\n' +
        'n5 [label="(6)\nc < 5" shape=diamond]\n' +
        'n6 [label="(7)\nz = c * 2" shape=box]\n' +
        'n7 [label="(8)\na++" shape=box]\n' +
        'n8 [label="(9)\nz = c * 4" shape=box]\n' +
        'n9 [label="(10)\nreturn z;" shape=box; style=filled; fillcolor=green]\n' +
        'n0 -> n1 []\nn1 -> n2 []\nn2 -> n3 []\n' +
        'n3 -> n4 [label="true"]\n' +
        'n3 -> n9 [label="false"]\n' +
        'n4 -> n5 []\nn5 -> n6 [label="true"]\n' +
        'n5 -> n8 [label="false"]\nn6 -> n7 []\nn7 -> n3 []\nn8 -> n7 []\n\n'
    );});

it('The cfg-creator should create a valid cfg from my function with different input', ()=> {
    assert.deepEqual(program_graph(my_func, esprima.parseScript('1,2,3')),
        'n0 [label="(1)\nlet a = x + 1;" shape=box; style=filled; fillcolor=green]\n' +
        'n1 [label="(2)\nlet b = a + y;" shape=box; style=filled; fillcolor=green]\n' +
        'n2 [label="(3)\nlet c = 0;" shape=box; style=filled; fillcolor=green]\n' +
        'n3 [label="(4)\na < z" shape=diamond; style=filled; fillcolor=green]\n' +
        'n4 [label="(5)\nc = a + b" shape=box; style=filled; fillcolor=green]\n' +
        'n5 [label="(6)\nc < 5" shape=diamond; style=filled; fillcolor=green]\n' +
        'n6 [label="(7)\nz = c * 2" shape=box]\n' +
        'n7 [label="(8)\na++" shape=box; style=filled; fillcolor=green]\n' +
        'n8 [label="(9)\nz = c * 4" shape=box; style=filled; fillcolor=green]\n' +
        'n9 [label="(10)\nreturn z;" shape=box; style=filled; fillcolor=green]\n' +
        'n0 -> n1 []\nn1 -> n2 []\n' +
        'n2 -> n3 []\nn3 -> n4 [label="true"]\n' +
        'n3 -> n9 [label="false"]\nn4 -> n5 []\n' +
        'n5 -> n6 [label="true"]\n' +
        'n5 -> n8 [label="false"]\n' +
        'n6 -> n7 []\nn7 -> n3 []\nn8 -> n7 []\n\n');
});

it('The cfg-creator should create a valid cfg from my function with another input', ()=> {
    assert.deepEqual(program_graph(my_func, esprima.parseScript('1,0,3')),
        'n0 [label="(1)\nlet a = x + 1;" shape=box; style=filled; fillcolor=green]\n' +
        'n1 [label="(2)\nlet b = a + y;" shape=box; style=filled; fillcolor=green]\n' +
        'n2 [label="(3)\nlet c = 0;" shape=box; style=filled; fillcolor=green]\n' +
        'n3 [label="(4)\na < z" shape=diamond; style=filled; fillcolor=green]\n' +
        'n4 [label="(5)\nc = a + b" shape=box; style=filled; fillcolor=green]\n' +
        'n5 [label="(6)\nc < 5" shape=diamond; style=filled; fillcolor=green]\n' +
        'n6 [label="(7)\nz = c * 2" shape=box; style=filled; fillcolor=green]\n' +
        'n7 [label="(8)\na++" shape=box; style=filled; fillcolor=green]\n' +
        'n8 [label="(9)\nz = c * 4" shape=box]\n' +
        'n9 [label="(10)\nreturn z;" shape=box; style=filled; fillcolor=green]\n' +
        'n0 -> n1 []\nn1 -> n2 []\n' +
        'n2 -> n3 []\nn3 -> n4 [label="true"]\n' +
        'n3 -> n9 [label="false"]\nn4 -> n5 []\n' +
        'n5 -> n6 [label="true"]\nn5 -> n8 [label="false"]\n' +
        'n6 -> n7 []\nn7 -> n3 []\nn8 -> n7 []\n\n');
});

it('The cfg-creator should create a valid cfg from my other function with nested if', ()=> {
    assert.deepEqual(program_graph(my_other_func, esprima.parseScript('2,2,4')),
        'n0 [label="(1)\nlet a = x + 1;" shape=box; style=filled; fillcolor=green]\n' +
        'n1 [label="(2)\nlet b = a + y;" shape=box; style=filled; fillcolor=green]\n' +
        'n2 [label="(3)\nlet c = 0;" shape=box; style=filled; fillcolor=green]\n' +
        'n3 [label="(4)\nb < z" shape=diamond; style=filled; fillcolor=green]\n' +
        'n4 [label="(5)\nb < z / 2" shape=diamond]\n' +
        'n5 [label="(6)\nc = c + 10" shape=box]\n' +
        'n6 [label="(7)\nreturn c;" shape=box; style=filled; fillcolor=green]\n' +
        'n7 [label="(8)\nc = c + 5" shape=box]\n' +
        'n8 [label="(9)\nb < z * 2" shape=diamond; style=filled; fillcolor=green]\n' +
        'n9 [label="(10)\nc = c + x + 5" shape=box; style=filled; fillcolor=green]\n' +
        'n10 [label="(11)\nc = c + z + 5" shape=box]\n' +
        'n0 -> n1 []\nn1 -> n2 []\n' +
        'n2 -> n3 []\nn3 -> n4 [label="true"]\n' +
        'n3 -> n8 [label="false"]\nn4 -> n5 [label="true"]\n' +
        'n4 -> n7 [label="false"]\nn5 -> n6 []\n' +
        'n7 -> n6 []\nn8 -> n9 [label="true"]\n' +
        'n8 -> n10 [label="false"]\nn9 -> n6 []\nn10 -> n6 []\n\n');
});

it('Check if a node is a binary expression', ()=>{
    assert.deepEqual(is_bin_expr(''), false);
});