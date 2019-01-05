import * as escodegen from 'escodegen';

let func_params = [];

function add_binding(scope, name, value) {
    scope.bindings[name] = value;
}

function Scope(bindings) {
    this.bindings = bindings;
}

const copy_map = (map) => JSON.parse(JSON.stringify(map));

function substitute_program_expr(program) {
    let globalScope = new Scope({});
    program.body.forEach((e) => {
        e = substitute(e, globalScope);
        return e;
    });
    // program.body = program.body.filter((e) => e.type !== 'VariableDeclaration' && (e.type !== 'ExpressionStatement' ||
    //     e.expression.type !== 'AssignmentExpression')).map((e) => remove_decl_and_assignment(e));
    program.body = program.body.filter((e) => e.type !== 'VariableDeclaration' && e.type !== 'ExpressionStatement').map((e) => remove_decl_and_assignment(e));
    return escodegen.generate(program);
}

function substitute_func_decl(func_decl, scope) {
    func_params = func_decl.params.map((param) => escodegen.generate(param));
    func_decl.body = substitute(func_decl.body, new Scope(scope.bindings));
    return func_decl;
}

const remove_decl_and_assignment = code => code.type === 'IfStatement' ? remove_in_if_stmt(code) :
    (code.type === 'WhileStatement' || code.type === 'FunctionDeclaration') ?  remove_in_while_and_func_decl(code) :
        code.type === 'BlockStatement' ? remove_in_block_stmt(code) : code;

function remove_in_if_stmt(if_stmt) {
    if_stmt.consequent = remove_decl_and_assignment(if_stmt.consequent);
    if_stmt.alternate = if_stmt.alternate ? remove_decl_and_assignment(if_stmt.alternate) : if_stmt.alternate;
    return if_stmt;
}

function remove_in_while_and_func_decl(code) {
    code.body = remove_decl_and_assignment(code.body);
    return code;
}

function remove_in_block_stmt(block_stmt) {
    block_stmt.body = block_stmt.body.filter((e) => e.type !== 'VariableDeclaration' && (e.type !== 'ExpressionStatement' ||
        e.expression.type !== 'AssignmentExpression' || func_params.includes(escodegen.generate(e.expression.left)))).map((e) => remove_decl_and_assignment(e));
    return block_stmt;
}

const substitute = (e, scope) => sub_func_map[e.type] ? sub_func_map[e.type](e, scope) : e;

function substitute_expr_stmt(expr_stmt, scope) {
    expr_stmt.expression = substitute(expr_stmt.expression, scope);
    return expr_stmt;
}

function substitute_block_stmt(stmt, scope) {
    // let innerScope = new Scope(scope.bindings);
    stmt.body.forEach((e) => {
        e = substitute(e, scope);
        return e;
    });
    return stmt;
}

function substitute_while_stmt(while_stmt, scope) {
    let innerScope = new Scope(copy_map(scope.bindings));
    while_stmt.test = substitute(while_stmt.test, innerScope);
    while_stmt.body = substitute(while_stmt.body, innerScope);
    return while_stmt;
}

function substitute_if_stmt(if_stmt, scope) {
    if_stmt.test = substitute(if_stmt.test, scope);
    if_stmt.consequent = substitute(if_stmt.consequent, new Scope(copy_map(scope.bindings)));
    if_stmt.alternate =  if_stmt.alternate ? substitute(if_stmt.alternate, new Scope(copy_map(scope.bindings))) : if_stmt.alternate;
    return if_stmt;
}

function substitute_assignment_expr(expr, scope) {
    expr.right = substitute(expr.right, scope);
    expr.left.type === 'MemberExpression' ?  scope.bindings[escodegen.generate(expr.left.object)].elements[parseInt(expr.left.property['value'])] = expr.right :
        add_binding(scope, escodegen.generate(expr.left), expr.right);
    return expr;
}

function substitute_decl_expr(expr, scope) {
    expr.declarations.map((decl) => add_binding(scope, escodegen.generate(decl.id), substitute(decl.init, scope)));
    return null;
}

function substitute_ret_stmt(stmt, scope) {
    stmt.argument = substitute(stmt.argument, scope);
    return stmt;
}

function substitute_bin_expr(bin_expr, scope) {
    bin_expr.left = substitute(bin_expr.left, scope);
    bin_expr.right = substitute(bin_expr.right, scope);
    return escodegen.generate(bin_expr.left) === '0' ? bin_expr.right : escodegen.generate(bin_expr.right) === '0' ?
        bin_expr.left : bin_expr;
}

const substitute_identifier = (identifier, scope) => scope.bindings[escodegen.generate(identifier)] ? substitute(scope.bindings[escodegen.generate(identifier)], scope) : identifier;

const substitute_mem_expr = (mem_expr, scope) => scope.bindings[escodegen.generate(mem_expr.object)] ?
    substitute(scope.bindings[escodegen.generate(mem_expr.object)].elements[parseInt(mem_expr.property['value'])], scope) : mem_expr;

let sub_func_map = {
    'BlockStatement': substitute_block_stmt,
    'VariableDeclaration': substitute_decl_expr,
    'AssignmentExpression': substitute_assignment_expr,
    'WhileStatement': substitute_while_stmt,
    'IfStatement': substitute_if_stmt,
    'BinaryExpression': substitute_bin_expr,
    'Identifier': substitute_identifier,
    'ReturnStatement': substitute_ret_stmt,
    'ExpressionStatement': substitute_expr_stmt,
    'FunctionDeclaration': substitute_func_decl,
    'MemberExpression': substitute_mem_expr
};

export {substitute_program_expr, substitute, Scope, substitute_func_decl};