import $ from 'jquery';
import {parseCode} from './code-analyzer';
import {program_graph} from './cfg-creator';
import * as d3 from 'd3-graphviz';

$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val();
        let inputVector = parseCode($('#inputVector').val());
        let dot = program_graph(codeToParse, inputVector);
        $('#cfg').empty();
        d3.graphviz('#cfg', {
            keyMode: 'id',
            fit: true,
            useWorker: false,
            zoom: false
        }).renderDot('digraph {' + dot + '}');
    });
});

