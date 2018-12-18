import assert from 'assert';
import * as esprima from 'esprima';
import {substitute_program_expr} from '../src/js/symbolic-substitution';
import {paint_program} from '../src/js/code-painter';

let first_example = esprima.parseScript('function foo(x, y, z){\n    let a = x + 1;\n    let b = a + y;\n' +
    '    let c = 0;\n    if (b < z) {\n        c = c + 5;\n        return x + y + z + c;\n    } else if (b < z * 2) {\n' +
    '        c = c + x + 5;\n        return x + y + z + c;\n    } else {\n        c = c + z + 5;\n' +
    '        return x + y + z + c;\n    }\n}');

let second_example = esprima.parseScript('function foo(x, y, z){\n    let a = x + 1;\n    let b = a + y;\n' +
    '    let c = 0;\n    while (a < z) {\n        c = a + b;\n        z = c * 2;\n    }\n    return z;\n}\n');

describe('The symbolic substitute', () => {
    it('is substituting Aviram\'s first example correctly', () => {
        assert.deepEqual(substitute_program_expr(first_example), 'function foo(x, y, z) {\n    if (x + 1 + y < z) {\n' +
            '        return x + y + z + 5;\n    } else if (x + 1 + y < z * 2) {\n        return x + y + z + (x + 5);\n    } else {\n' +
            '        return x + y + z + (z + 5);\n    }\n}');
    });
    it('is substituting Aviram\'s second example correctly', () => {
        assert.deepEqual(substitute_program_expr(second_example), 'function foo(x, y, z) {\n    while (x + 1 < z) {\n' +
            '        z = (x + 1 + (x + 1 + y)) * 2;\n    }\n    return z;\n}');
    });
});

describe('The symbolic substitute', () => {
    it('is substituting programs with global declarations correctly', () => {
        assert.deepEqual(substitute_program_expr(esprima.parseScript('let d = 0;\nfunction foo(x, y, z){\n' +
            '    let b = y + d;\n    let c = 0;\n    if (b < z) {\n        c = c + 5;\n        return x + y + z + c;\n' +
            '    } else {\n        c = c + z + 5;\n        return x + y + z + c;\n    }\n}')),
        'function foo(x, y, z) {\n    if (y < z) {\n        return x + y + z + 5;\n    } else {\n' +
            '        return x + y + z + (z + 5);\n    }\n}');
    });
    it('is substituting programs with arrays correctly', () => {
        assert.deepEqual(substitute_program_expr(esprima.parseScript('function foo(x, y, z){\n' +
            '    let arr = [x+1,y-1,2*z];\n    let b = arr[0] + y;\n    let c = 0;\n    while (b < z) {\n' +
            '        c = c + b;\n        z = c * 2;\n    }\n    return z;\n}')), 'function foo(x, y, z) {\n' +
            '    while (x + 1 + y < z) {\n        z = (x + 1 + y) * 2;\n    }\n    return z;\n}');
    });
});

describe('The symbolic substitute', () => {
    it('is substituting if and else if expressions without else correctly', () => {
        assert.deepEqual(substitute_program_expr(esprima.parseScript('function foo(x, y, z){\n' +
            '    let arr = [x * y * z, x + y + z]\n    if(arr[0]<arr[1]) {\n        let a = arr[0];\n' +
            '        return 2*a;\n    } else if (arr[0]!=arr[1]) {\n        let a = arr[1];\n        return a/2;\n    }\n' +
            '    return arr;\n}')),
        'function foo(x, y, z) {\n    if (x * y * z < x + y + z) {\n        return 2 * (x * y * z);\n' +
            '    } else if (x * y * z != x + y + z) {\n        return (x + y + z) / 2;\n    }\n    return [\n' +
            '        x * y * z,\n        x + y + z\n    ];\n}');
    });
    it('is substituting if expression without else/else if correctly', () => {
        assert.deepEqual(substitute_program_expr(esprima.parseScript('function foo(x, y, z){\n' +
            '    let arr = [x * y * z, x + y + z]\n    let d = x^y;\n    if(arr[0]<arr[1]) {\n' +
            '        let a = arr[0];\n        return d*a;\n    }\n    return d;\n}')),
        'function foo(x, y, z) {\n    if (x * y * z < x + y + z) {\n        return (x ^ y) * (x * y * z);\n    }\n' +
            '    return x ^ y;\n}');
    });
});

describe('The symbolic substitute', () => {
    it('is substituting a program with assigning input arguments to arrays', () => {
        assert.deepEqual(substitute_program_expr(esprima.parseScript('let arr = [1,2,3];\nfunction foo(x, y, z){\n' +
            '    let b = arr[0] + y;\n    let c = 0;\n    arr[1] = 2 * arr[2] + y;\n    if (b < z) {\n        c = arr[1] + b;\n' +
            '        return x + y + z + c;\n    } else {\n        c = c + z + 5;\n        return x + y + z + c;\n    }\n}')),
        'function foo(x, y, z) {\n    if (1 + y < z) {\n        return x + y + z + (2 * 3 + y + (1 + y));\n    } else {\n' +
            '        return x + y + z + (z + 5);\n    }\n}');
    });
    it('is substituting a program with global variables with values from the input vector correctly', () => {
        assert.deepEqual(substitute_program_expr(esprima.parseScript('let a = x + 1;\nlet b = a + y;\nlet c = 0;\nfunction foo(x, y, z){    \n' +
            '    while (a < z) {\n        if(b < x + y) {\n            c = a + b;\n            z = c * 2;\n        }\n' +
            '    }\n    return z;\n}')),
        'function foo(x, y, z) {\n    while (x + 1 < z) {\n        if (x + 1 + y < x + y) {\n' +
            '            z = (x + 1 + (x + 1 + y)) * 2;\n        }\n    }\n    return z;\n}');
    });
});

let array_example = esprima.parseScript('function foo(x, y, z){\n' +
    '    let a = x[0] + 1;\n' +
    '    let b = a + y;\n' +
    '    if (b < z) {\n' +
    '        return x[1] + y + z;\n' +
    '    }\n' +
    '}');
substitute_program_expr(array_example);

describe('The painter', () => {
    it('is painting Aviram\'s first example correctly', () => {
        assert.deepEqual(paint_program(first_example, esprima.parseScript('1, 2, 3')), '<pre>function foo(x, y, z) {<br>' +
            '<mark style="background-color:red">    if (x + 1 + y < z) {</mark><br>' +
            '        return x + y + z + 5;<br><mark style="background-color:green">    } else if (x + 1 + y < z * 2) {</mark><br>' +
            '        return x + y + z + (x + 5);<br>    } else {<br>        return x + y + z + (z + 5);<br>    }<br>}<br></pre>');
    });
    it('is painting Aviram\'s second example correctly', () => {
        assert.deepEqual(paint_program(second_example, esprima.parseScript('4, 5, 6')), '<pre>function foo(x, y, z) {<br>    while (x + 1 < z) {<br>' +
            '        z = (x + 1 + (x + 1 + y)) * 2;<br>    }<br>    return z;<br>}<br></pre>');
    });
    it('is painting if statements with array in the input vector', () => {
        assert.deepEqual(paint_program(array_example, esprima.parseScript('[1,2], 3 ,7')), '<pre>function foo(x, y, z) {<br>' +
            '<mark style="background-color:green">    if (x[0] + 1 + y < z) {</mark><br>' +
            '        return x[1] + y + z;<br>    }<br>}<br></pre>');
    });
});

let single_arg_example = esprima.parseScript('function foo(x) {\n' +
    '    if (x < 10) {\n' +
    '        return x;\n' +
    '    }\n' +
    '}');
substitute_program_expr(single_arg_example);

it('The painter is painting programs with a single argument correctly', ()=> {
    assert.deepEqual(paint_program(single_arg_example, esprima.parseScript('12')), '<pre>function foo(x) {<br>' +
        '<mark style="background-color:red">    if (x < 10) {</mark><br>' +
        '        return x;<br>    }<br>}<br></pre>');
});
