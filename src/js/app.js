import $ from 'jquery';
import {parseCode} from './code-analyzer';
import {substitute_program_expr} from './symbolic-substitution';
import {paint_program} from './code-painter';

$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val();
        let inputVector = parseCode($('#inputVector').val());
        let parsedCode = parseCode(codeToParse);
        let substituted_code = substitute_program_expr(parsedCode);
        $('#parsedCode').val(substituted_code);
        let painted_string = paint_program(parsedCode,inputVector);
        let painted_code_selector = $('#paintedCode');
        painted_code_selector.empty();
        painted_code_selector.append('<label>Code after painting</label>\n');
        painted_code_selector.append(painted_string);
    });
});

