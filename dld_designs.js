/* dld_designs.js
   Description: design definitions for Digital Logig Design (The Game)

    Copyright (C) 2014 asterisk_man

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

'use strict';

//we must never change the order of dld_designs but we can adjust the display order with this var
//var dld_designs_display_order = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30];
var dld_designs_display_order = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 17, 18, 19, 20, 21];

var dld_designs = [];

dld_designs[0] = {
    name: 'NAND',
    desc: 'Instantiate a NAND gate and connect it to the test fixture. This has already been done for you. Just press "Load Test". <br>To run the test press "Init\\Reset" and then "Run".',
    netlist: [
      'DEF TOP',
      '  NET A',
      '  NET B',
      '  NET Z',
      '  INST NAND1 NAND A B Z',
      '  INST TEST NAND_TEST A B Z',
      '  INST OUTA IO_OUT A',
      '  INST OUTB IO_OUT B',
      '  INST OUTZ IO_OUT Z',
      'ENDDEF'
    ].join('\n'),
    cost: 0, //How much money it costs to buy this design
    price: 1, //How much money you make when you sell this design
    expectedNands: 1
  };
dld_designs[1] = {
    name: 'NOT',
    desc: [
      'Implement a NOT gate. <br>',
      'Inputs:',
      '<dl>',
      '  <dt>A</dt><dd>The single input to the NOT gate.</dd>',
      '</dl>',
      'Outputs:',
      '<dl>',
      '  <dt>Z</dt><dd>The logical inverse of A.</dd>',
      '</dl>',
      'Note: Port names are for descriptive purposes only. Feel free to use whatever names you feel most appropriate.'
      ].join(''),
    netlist: [
      'DEF TOP',
      '  NET A',
      '  NET Z',
      '  INST NOT1 NOT A Z',
      '  INST TEST NOT_TEST A Z',
      '  INST OUTA IO_OUT A',
      '  INST OUTZ IO_OUT Z',
      'ENDDEF'
    ].join('\n'),
    cost: 10,
    price: 2,
    expectedNands: 1
  };
dld_designs[2] = {
    name: 'AND',
    desc: [
      'Implement an AND gate.<br>',
      'Inputs:',
      '<dl>',
      '  <dt>A</dt><dd>First AND gate input</dd>',
      '  <dt>B</dt><dd>Second AND gate input</dd>',
      '</dl>',
      'Outputs:',
      '<dl>',
      '  <dt>Z</dt><dd>The logical AND of A and B.</dd>',
      '</dl>'
      ].join(''),
    netlist: [
      'DEF TOP',
      '  NET A',
      '  NET B',
      '  NET Z',
      '  INST AND1 AND A B Z',
      '  INST TEST AND_TEST A B Z',
      '  INST OUTA IO_OUT A',
      '  INST OUTB IO_OUT B',
      '  INST OUTZ IO_OUT Z',
      'ENDDEF'
      ].join('\n'),
    cost: 29,
    price: 5,
    expectedNands: 2
  };
dld_designs[3] = {
    name: 'OR',
    desc: [
      'Implement an OR gate.<br>',
      'Inputs:',
      '<dl>',
      '  <dt>A</dt><dd>First OR gate input</dd>',
      '  <dt>B</dt><dd>Second OR gate input</dd>',
      '</dl>',
      'Outputs:',
      '<dl>',
      '  <dt>Z</dt><dd>The logical OR of A and B.</dd>',
      '</dl>'
      ].join('\n'),
    netlist: [
      'DEF TOP',
      '  NET A',
      '  NET B',
      '  NET Z',
      '  INST OR1 OR A B Z',
      '  INST TEST OR_TEST A B Z',
      '  INST OUTA IO_OUT A',
      '  INST OUTB IO_OUT B',
      '  INST OUTZ IO_OUT Z',
      'ENDDEF'
      ].join('\n'),
    cost: 43,
    price: 9,
    expectedNands: 3
  };
dld_designs[4] = {
    name: 'NOR',
    desc: [
      'Implement an NOR gate.<br>',
      'Inputs:',
      '<dl>',
      '  <dt>A</dt><dd>First NOR gate input</dd>',
      '  <dt>B</dt><dd>Second NOR gate input</dd>',
      '</dl>',
      'Outputs:',
      '<dl>',
      '  <dt>Z</dt><dd>The logical NOR of A and B.</dd>',
      '</dl>'
      ].join(''),
    netlist: [
      'DEF TOP',
      '  NET A',
      '  NET B',
      '  NET Z',
      '  INST NOR1 NOR A B Z',
      '  INST TEST NOR_TEST A B Z',
      '  INST OUTA IO_OUT A',
      '  INST OUTB IO_OUT B',
      '  INST OUTZ IO_OUT Z',
      'ENDDEF'
      ].join('\n'),
    cost: 62,
    price: 14,
    expectedNands: 4
  };
dld_designs[5] = {
    name: 'XOR',
    desc: [
      'Implement an XOR gate.<br>',
      'Inputs:',
      '<dl>',
      '  <dt>A</dt><dd>First XOR gate input</dd>',
      '  <dt>B</dt><dd>Second XOR gate input</dd>',
      '</dl>',
      'Outputs:',
      '<dl>',
      '  <dt>Z</dt><dd>The logical XOR of A and B.</dd>',
      '</dl>'
      ].join(''),
    netlist: [
      'DEF TOP',
      '  NET A',
      '  NET B',
      '  NET Z',
      '  INST XOR1 XOR A B Z',
      '  INST TEST XOR_TEST A B Z',
      '  INST OUTA IO_OUT A',
      '  INST OUTB IO_OUT B',
      '  INST OUTZ IO_OUT Z',
      'ENDDEF'
      ].join('\n'),
    cost: 87,
    price: 16,
    expectedNands: 4
  };
dld_designs[6] = {
    name: 'TRUTH_TABLE1',
    desc: [
      'Implement a 2 input truth table.<br>',
      'Inputs:',
      '<dl>',
      '  <dt>A</dt><dd>First truth table input</dd>',
      '  <dt>B</dt><dd>Second truth table input</dd>',
      '</dl>',
      'Outputs:',
      '<dl>',
      '  <dt>Z</dt><dd>The truth table output for the inputs A and B. Refer to the table below.</dd>',
      '</dl>',
      '<table class="table_truth_table">',
      '  <tr><th>A</th><th>B</th><th>Z</th></tr>',
      '  <tr><td>0</td><td>0</td><td>0</td></tr>',
      '  <tr><td>0</td><td>1</td><td>0</td></tr>',
      '  <tr><td>1</td><td>0</td><td>1</td></tr>',
      '  <tr><td>1</td><td>1</td><td>0</td></tr>',
      '</table>'
      ].join(''),
    netlist: [
      'DEF TOP',
      '  NET A',
      '  NET B',
      '  NET Z',
      '  INST TRUTH_TABLE1 TRUTH_TABLE1 A B Z',
      '  INST TEST TRUTH_TABLE1_TEST A B Z',
      '  INST OUTA IO_OUT A',
      '  INST OUTB IO_OUT B',
      '  INST OUTZ IO_OUT Z',
      'ENDDEF'
      ].join('\n'),
    cost: 119,
    price: 15,
    expectedNands: 3
  };
dld_designs[7] = {
    name: 'TRUTH_TABLE2',
    desc: [
      'Implement a 3 input truth table.<br>',
      'Inputs:',
      '<dl>',
      '  <dt>A</dt><dd>First truth table input</dd>',
      '  <dt>B</dt><dd>Second truth table input</dd>',
      '  <dt>C</dt><dd>Third truth table input</dd>',
      '</dl>',
      'Outputs:',
      '<dl>',
      '  <dt>Z</dt><dd>The truth table output for the inputs A, B, and C. Refer to the table below.</dd>',
      '</dl>',
      '<table class="table_truth_table">',
      '  <tr><th>A</th><th>B</th><th>C</th><th>Z</th></tr>',
      '  <tr><td>0</td><td>0</td><td>0</td><td>1</td></tr>',
      '  <tr><td>0</td><td>0</td><td>1</td><td>1</td></tr>',
      '  <tr><td>0</td><td>1</td><td>0</td><td>0</td></tr>',
      '  <tr><td>0</td><td>1</td><td>1</td><td>0</td></tr>',
      '  <tr><td>1</td><td>0</td><td>0</td><td>1</td></tr>',
      '  <tr><td>1</td><td>0</td><td>1</td><td>1</td></tr>',
      '  <tr><td>1</td><td>1</td><td>0</td><td>0</td></tr>',
      '  <tr><td>1</td><td>1</td><td>1</td><td>1</td></tr>',
      '</table>'
      ].join(''),
    netlist: [
      'DEF TOP',
      '  NET A',
      '  NET B',
      '  NET C',
      '  NET Z',
      '  INST TRUTH_TABLE2 TRUTH_TABLE2 A B C Z',
      '  INST TEST TRUTH_TABLE2_TEST A B C Z',
      '  INST OUTA IO_OUT A',
      '  INST OUTB IO_OUT B',
      '  INST OUTC IO_OUT C',
      '  INST OUTZ IO_OUT Z',
      'ENDDEF'
      ].join('\n'),
    cost: 179,
    price: 11,
    expectedNands: 2
  };
dld_designs[8] = {
    name: 'TRUTH_TABLE3',
    desc: [
      'Implement a 4 input truth table.<br>',
      'Inputs:',
      '<dl>',
      '  <dt>A</dt><dd>First truth table input</dd>',
      '  <dt>B</dt><dd>Second truth table input</dd>',
      '  <dt>C</dt><dd>Third truth table input</dd>',
      '  <dt>D</dt><dd>Fourth truth table input</dd>',
      '</dl>',
      'Outputs:',
      '<dl>',
      '  <dt>Z</dt><dd>The truth table output for the inputs A, B, C, and D. Refer to the table below.</dd>',
      '</dl>',
      '<table class="table_truth_table">',
      '  <tr><th>A</th><th>B</th><th>C</th><th>D</th><th>Z</th></tr>',
      '  <tr><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td></tr>',
      '  <tr><td>0</td><td>0</td><td>0</td><td>1</td><td>0</td></tr>',
      '  <tr><td>0</td><td>0</td><td>1</td><td>0</td><td>0</td></tr>',
      '  <tr><td>0</td><td>0</td><td>1</td><td>1</td><td>0</td></tr>',
      '  <tr><td>0</td><td>1</td><td>0</td><td>0</td><td>1</td></tr>',
      '  <tr><td>0</td><td>1</td><td>0</td><td>1</td><td>1</td></tr>',
      '  <tr><td>0</td><td>1</td><td>1</td><td>0</td><td>1</td></tr>',
      '  <tr><td>0</td><td>1</td><td>1</td><td>1</td><td>0</td></tr>',
      '  <tr><td>1</td><td>0</td><td>0</td><td>0</td><td>1</td></tr>',
      '  <tr><td>1</td><td>0</td><td>0</td><td>1</td><td>0</td></tr>',
      '  <tr><td>1</td><td>0</td><td>1</td><td>0</td><td>1</td></tr>',
      '  <tr><td>1</td><td>0</td><td>1</td><td>1</td><td>1</td></tr>',
      '  <tr><td>1</td><td>1</td><td>0</td><td>0</td><td>1</td></tr>',
      '  <tr><td>1</td><td>1</td><td>0</td><td>1</td><td>1</td></tr>',
      '  <tr><td>1</td><td>1</td><td>1</td><td>0</td><td>1</td></tr>',
      '  <tr><td>1</td><td>1</td><td>1</td><td>1</td><td>1</td></tr>',
      '</table>'
      ].join(''),
    netlist: [
      'DEF TOP',
      '  NET A',
      '  NET B',
      '  NET C',
      '  NET D',
      '  NET Z',
      '  INST TRUTH_TABLE3 TRUTH_TABLE3 A B C D Z',
      '  INST TEST TRUTH_TABLE3_TEST A B C D Z',
      '  INST OUTA IO_OUT A',
      '  INST OUTB IO_OUT B',
      '  INST OUTC IO_OUT C',
      '  INST OUTD IO_OUT D',
      '  INST OUTZ IO_OUT Z',
      'ENDDEF'
      ].join('\n'),
    cost: 236,
    price: 36,
    expectedNands: 5
  };
dld_designs[9] = {
    name: 'MUX21',
    desc: [
      'Implement a 2 to 1 multiplexer.<br>',
      'Inputs:',
      '<dl>',
      '  <dt>I0</dt><dd>Input zero.</dd>',
      '  <dt>I1</dt><dd>Input one.</dd>',
      '  <dt>S</dt><dd>Input selector.</dd>',
      '</dl>',
      'Outputs:',
      '<dl>',
      '  <dt>Z</dt><dd>The multiplexer output. When S=0 Z=I0, and when S=1 Z=I1. Refer to the truth table below.</dd>',
      '</dl>',
      '<table class="table_truth_table">',
      '  <tr><th>S</th><th>I0</th><th>I1</th><th>Z</th></tr>',
      '  <tr><td>0</td><td>0</td> <td>0</td> <td>0</td></tr>',
      '  <tr><td>0</td><td>0</td> <td>1</td> <td>0</td></tr>',
      '  <tr><td>0</td><td>1</td> <td>0</td> <td>1</td></tr>',
      '  <tr><td>0</td><td>1</td> <td>1</td> <td>1</td></tr>',
      '  <tr><td>1</td><td>0</td> <td>0</td> <td>0</td></tr>',
      '  <tr><td>1</td><td>0</td> <td>1</td> <td>1</td></tr>',
      '  <tr><td>1</td><td>1</td> <td>0</td> <td>0</td></tr>',
      '  <tr><td>1</td><td>1</td> <td>1</td> <td>1</td></tr>',
      '</table>'
      ].join(''),
    netlist: [
      'DEF TOP',
      '  NET I0',
      '  NET I1',
      '  NET S',
      '  NET Z',
      '  INST MUX21 MUX21 I0 I1 S Z',
      '  INST TEST MUX21_TEST I0 I1 S Z',
      '  INST OUTI0 IO_OUT I0',
      '  INST OUTI1 IO_OUT I1',
      '  INST OUTS IO_OUT S',
      '  INST OUTZ IO_OUT Z',
      'ENDDEF'
      ].join('\n'),
    cost: 310,
    price: 26,
    expectedNands: 4
  };
dld_designs[10] = {
    name: 'MUX41',
    desc: [
      'Implement a 4 to 1 multiplexer.<br>',
      'Inputs:',
      '<dl>',
      '  <dt>I0</dt><dd>Input zero.</dd>',
      '  <dt>I1</dt><dd>Input one.</dd>',
      '  <dt>I2</dt><dd>Input two.</dd>',
      '  <dt>I3</dt><dd>Input three.</dd>',
      '  <dt>S&lt;1:0&gt;</dt><dd>Input selector.</dd>',
      '</dl>',
      'Outputs:',
      '<dl>',
      '  <dt>Z</dt><dd>The multiplexer output. Output one of the inputs based on the value of S&lt;1:0&gt;. Refer to the truth table below.</dd>',
      '</dl>',
      '<table class="table_truth_table">',
      '  <tr><th>S&lt;1:0&gt;</th><th>Z</th></tr>',
      '  <tr><td>00</td><td>I0</td></tr>',
      '  <tr><td>01</td><td>I1</td></tr>',
      '  <tr><td>10</td><td>I2</td></tr>',
      '  <tr><td>11</td><td>I3</td></tr>',
      '</table>'
      ].join(''),
    netlist: [
      'DEF TOP',
      '  NET I0',
      '  NET I1',
      '  NET I2',
      '  NET I3',
      '  NET S<1:0>',
      '  NET Z',
      '  INST MUX41 MUX41 I0 I1 I2 I3 S<1:0> Z',
      '  INST TEST MUX41_TEST I0 I1 I2 I3 S<1:0> Z',
      '  INST OUTI0 IO_OUT I0',
      '  INST OUTI1 IO_OUT I1',
      '  INST OUTI2 IO_OUT I2',
      '  INST OUTI3 IO_OUT I3',
      '  INST OUTS1 IO_OUT S<1>',
      '  INST OUTS0 IO_OUT S<0>',
      '  INST OUTZ IO_OUT Z',
      'ENDDEF'
      ].join('\n'),
    cost: 402,
    price: 77,
    expectedNands: 11
  };
dld_designs[11] = {
    name: 'MUX81x8',
    desc: [
      'Implement an 8 bits wide 8 to 1 multiplexer.<br>',
      'Inputs:',
      '<dl>',
      '  <dt>I0&lt;7:0&gt;</dt><dd>Input zero (8 bits wide).</dd>',
      '  <dt>I1&lt;7:0&gt;</dt><dd>Input one (8 bits wide).</dd>',
      '  <dt>I2&lt;7:0&gt;</dt><dd>Input two (8 bits wide).</dd>',
      '  <dt>I3&lt;7:0&gt;</dt><dd>Input three (8 bits wide).</dd>',
      '  <dt>I4&lt;7:0&gt;</dt><dd>Input four (8 bits wide).</dd>',
      '  <dt>I5&lt;7:0&gt;</dt><dd>Input five (8 bits wide).</dd>',
      '  <dt>I6&lt;7:0&gt;</dt><dd>Input six (8 bits wide).</dd>',
      '  <dt>I7&lt;7:0&gt;</dt><dd>Input seven (8 bits wide).</dd>',
      '  <dt>S&lt;2:0&gt;</dt><dd>Input selector.</dd>',
      '</dl>',
      'Outputs:',
      '<dl>',
      '  <dt>Z&lt;7:0&gt;</dt><dd>The multiplexer output (8 bits wide). Output one of the inputs based on the value of S&lt;2:0&gt;. Refer to the truth table below.</dd>',
      '</dl>',
      '<table class="table_truth_table">',
      '  <tr><th>S&lt;2:0&gt;</th><th>Z</th></tr>',
      '  <tr><td>000</td><td>I0</td></tr>',
      '  <tr><td>001</td><td>I1</td></tr>',
      '  <tr><td>010</td><td>I2</td></tr>',
      '  <tr><td>011</td><td>I3</td></tr>',
      '  <tr><td>100</td><td>I4</td></tr>',
      '  <tr><td>101</td><td>I5</td></tr>',
      '  <tr><td>110</td><td>I6</td></tr>',
      '  <tr><td>111</td><td>I7</td></tr>',
      '</table>'
      ].join(''),
    netlist: [
      'DEF TOP',
      '  NET I0<7:0>',
      '  NET I1<7:0>',
      '  NET I2<7:0>',
      '  NET I3<7:0>',
      '  NET I4<7:0>',
      '  NET I5<7:0>',
      '  NET I6<7:0>',
      '  NET I7<7:0>',
      '  NET S<2:0>',
      '  NET Z<7:0>',
      '  INST MUX81x8 MUX81x8 I0<7:0> I1<7:0> I2<7:0> I3<7:0> I4<7:0> I5<7:0> I6<7:0> I7<7:0> S<2:0> Z<7:0>',
      '  INST TEST MUX81x8_TEST I0<7:0> I1<7:0> I2<7:0> I3<7:0> I4<7:0> I5<7:0> I6<7:0> I7<7:0> S<2:0> Z<7:0>',
      '  INST OUTI0 IO_OUT8 I0<7:0>',
      '  INST OUTI1 IO_OUT8 I1<7:0>',
      '  INST OUTI2 IO_OUT8 I2<7:0>',
      '  INST OUTI3 IO_OUT8 I3<7:0>',
      '  INST OUTI4 IO_OUT8 I4<7:0>',
      '  INST OUTI5 IO_OUT8 I5<7:0>',
      '  INST OUTI6 IO_OUT8 I6<7:0>',
      '  INST OUTI7 IO_OUT8 I7<7:0>',
      '  INST OUTS2 IO_OUT S<2>',
      '  INST OUTS1 IO_OUT S<1>',
      '  INST OUTS0 IO_OUT S<0>',
      '  INST OUTZ IO_OUT8 Z<7:0>',
      'ENDDEF'
      ].join('\n'),
    cost: 520,
    price: 1283,
    expectedNands: 171
  };
dld_designs[12] = {
    name: 'DEMUX12',
    desc: [
      'Implement a 1 to 2 de-multiplexer.<br>',
      'Inputs:',
      '<dl>',
      '  <dt>A</dt><dd>The de-multiplexer input.</dd>',
      '  <dt>S</dt><dd>Output selector.</dd>',
      '</dl>',
      'Outputs:',
      '<dl>',
      '  <dt>Z0</dt><dd>Output zero.</dd>',
      '  <dt>Z1</dt><dd>Output one.</dd>',
      '</dl>',
      '<table class="table_truth_table">',
      '  <tr><th>S</th><th>Z0</th><th>Z1</th></tr>',
      '  <tr><td>0</td><td>A</td> <td>0</td> </tr>',
      '  <tr><td>1</td><td>0</td> <td>A</td> </tr>',
      '</table>'
      ].join(''),
    netlist: [
      'DEF TOP',
      '  NET A',
      '  NET S',
      '  NET Z0',
      '  NET Z1',
      '  INST DEMUX12 DEMUX12 A S Z0 Z1',
      '  INST TEST DEMUX12_TEST A S Z0 Z1',
      '  INST OUTA IO_OUT A',
      '  INST OUTS IO_OUT S',
      '  INST OUTZ0 IO_OUT Z0',
      '  INST OUTZ1 IO_OUT Z1',
      'ENDDEF'
      ].join('\n'),
    cost: 669,
    price: 40,
    expectedNands: 4
  };
dld_designs[13] = {
    name: 'DEMUX14',
    desc: [
      'Implement a 1 to 4 de-multiplexer.<br>',
      'Inputs:',
      '<dl>',
      '  <dt>A</dt><dd>The de-multiplexer input.</dd>',
      '  <dt>S&lt;1:0&gt;</dt><dd>Output selector.</dd>',
      '</dl>',
      'Outputs:',
      '<dl>',
      '  <dt>Z0</dt><dd>Output zero.</dd>',
      '  <dt>Z1</dt><dd>Output one.</dd>',
      '  <dt>Z2</dt><dd>Output two.</dd>',
      '  <dt>Z3</dt><dd>Output three.</dd>',
      '</dl>',
      '<table class="table_truth_table">',
      '  <tr><th>S&lt;1:0&gt;</th><th>Z0</th><th>Z1</th><th>Z2</th><th>Z3</th></tr>',
      '  <tr><td>00</td>          <td>A</td> <td>0</td> <td>0</td> <td>0</td></tr>',
      '  <tr><td>01</td>          <td>0</td> <td>A</td> <td>0</td> <td>0</td></tr>',
      '  <tr><td>10</td>          <td>0</td> <td>0</td> <td>A</td> <td>0</td></tr>',
      '  <tr><td>11</td>          <td>0</td> <td>0</td> <td>0</td> <td>A</td></tr>',
      '</table>'
      ].join(''),
    netlist: [
      'DEF TOP',
      '  NET A',
      '  NET S<1:0>',
      '  NET Z0',
      '  NET Z1',
      '  NET Z2',
      '  NET Z3',
      '  INST DEMUX14 DEMUX14 A S<1:0> Z0 Z1 Z2 Z3',
      '  INST TEST DEMUX14_TEST A S<1:0> Z0 Z1 Z2 Z3',
      '  INST OUTA IO_OUT A',
      '  INST OUTS1 IO_OUT S<1>',
      '  INST OUTS0 IO_OUT S<0>',
      '  INST OUTZ0 IO_OUT Z0',
      '  INST OUTZ1 IO_OUT Z1',
      '  INST OUTZ2 IO_OUT Z2',
      '  INST OUTZ3 IO_OUT Z3',
      'ENDDEF'
      ].join('\n'),
    cost: 856,
    price: 119,
    expectedNands: 12
  };
dld_designs[14] = {
    name: 'DEMUX18x8',
    desc: [
      'Implement an 8 bits wide 1 to 8 de-multiplexer.<br>',
      'Inputs:',
      '<dl>',
      '  <dt>A&lt;7:0&gt;</dt><dd>The de-multiplexer input (8 bits wide).</dd>',
      '  <dt>S&lt;2:0&gt;</dt><dd>Output selector.</dd>',
      '</dl>',
      'Outputs:',
      '<dl>',
      '  <dt>Z0&lt;7:0&gt;</dt><dd>Output zero (8 bits wide).</dd>',
      '  <dt>Z1&lt;7:0&gt;</dt><dd>Output one (8 bits wide).</dd>',
      '  <dt>Z2&lt;7:0&gt;</dt><dd>Output two (8 bits wide).</dd>',
      '  <dt>Z3&lt;7:0&gt;</dt><dd>Output three (8 bits wide).</dd>',
      '  <dt>Z4&lt;7:0&gt;</dt><dd>Output four (8 bits wide).</dd>',
      '  <dt>Z5&lt;7:0&gt;</dt><dd>Output five (8 bits wide).</dd>',
      '  <dt>Z6&lt;7:0&gt;</dt><dd>Output six (8 bits wide).</dd>',
      '  <dt>Z7&lt;7:0&gt;</dt><dd>Output seven (8 bits wide).</dd>',
      '</dl>',
      '<table class="table_truth_table">',
      '  <tr><th>S&lt;2:0&gt;</th><th>Z0</th><th>Z1</th><th>Z2</th><th>Z3</th><th>Z4</th><th>Z5</th><th>Z6</th><th>Z7</th></tr>',
      '  <tr><td>000</td>         <td>A</td> <td>0</td> <td>0</td> <td>0</td> <td>0</td> <td>0</td> <td>0</td> <td>0</td></tr>',
      '  <tr><td>001</td>         <td>0</td> <td>A</td> <td>0</td> <td>0</td> <td>0</td> <td>0</td> <td>0</td> <td>0</td></tr>',
      '  <tr><td>010</td>         <td>0</td> <td>0</td> <td>A</td> <td>0</td> <td>0</td> <td>0</td> <td>0</td> <td>0</td></tr>',
      '  <tr><td>011</td>         <td>0</td> <td>0</td> <td>0</td> <td>A</td> <td>0</td> <td>0</td> <td>0</td> <td>0</td></tr>',
      '  <tr><td>100</td>         <td>0</td> <td>0</td> <td>0</td> <td>0</td> <td>A</td> <td>0</td> <td>0</td> <td>0</td></tr>',
      '  <tr><td>101</td>         <td>0</td> <td>0</td> <td>0</td> <td>0</td> <td>0</td> <td>A</td> <td>0</td> <td>0</td></tr>',
      '  <tr><td>110</td>         <td>0</td> <td>0</td> <td>0</td> <td>0</td> <td>0</td> <td>0</td> <td>A</td> <td>0</td></tr>',
      '  <tr><td>111</td>         <td>0</td> <td>0</td> <td>0</td> <td>0</td> <td>0</td> <td>0</td> <td>0</td> <td>A</td></tr>',
      '</table>'
      ].join(''),
    netlist: [
      'DEF TOP',
      '  NET A<7:0>',
      '  NET S<2:0>',
      '  NET Z0<7:0>',
      '  NET Z1<7:0>',
      '  NET Z2<7:0>',
      '  NET Z3<7:0>',
      '  NET Z4<7:0>',
      '  NET Z5<7:0>',
      '  NET Z6<7:0>',
      '  NET Z7<7:0>',
      '  INST DEMUX18x8 DEMUX18x8 A<7:0> S<2:0> Z0<7:0> Z1<7:0> Z2<7:0> Z3<7:0> Z4<7:0> Z5<7:0> Z6<7:0> Z7<7:0>',
      '  INST TEST DEMUX18x8_TEST A<7:0> S<2:0> Z0<7:0> Z1<7:0> Z2<7:0> Z3<7:0> Z4<7:0> Z5<7:0> Z6<7:0> Z7<7:0>',
      '  INST OUTA IO_OUT8 A<7:0>',
      '  INST OUTS2 IO_OUT S<2>',
      '  INST OUTS1 IO_OUT S<1>',
      '  INST OUTS0 IO_OUT S<0>',
      '  INST OUTZ0 IO_OUT8 Z0<7:0>',
      '  INST OUTZ1 IO_OUT8 Z1<7:0>',
      '  INST OUTZ2 IO_OUT8 Z2<7:0>',
      '  INST OUTZ3 IO_OUT8 Z3<7:0>',
      '  INST OUTZ4 IO_OUT8 Z4<7:0>',
      '  INST OUTZ5 IO_OUT8 Z5<7:0>',
      '  INST OUTZ6 IO_OUT8 Z6<7:0>',
      '  INST OUTZ7 IO_OUT8 Z7<7:0>',
      'ENDDEF'
      ].join('\n'),
    cost: 1091,
    price: 1395,
    expectedNands: 154
  };
dld_designs[15] = {
    name: 'SRLAT',
    desc: [
      'Implement an SR latch.<br>',
      'Inputs:',
      '<dl>',
      '  <dt>S</dt><dd>"Set" the latch output to true.</dd>',
      '  <dt>R</dt><dd>"Reset" the latch output to false.</dd>',
      '</dl>',
      'Outputs:',
      '<dl>',
      '  <dt>QT</dt><dd>Normal, "true", latch output.</dd>',
      '  <dt>QC</dt><dd>Inverted, "complement", latch output.</dd>',
      '</dl>',
      '<table class="table_truth_table">',
      '  <tr><th>S</th><th>R</th><th>QT</th><th>QC</th></tr>',
      '  <tr><td>0</td><td>0</td><td>hold previous QT</td><td>hold previous QC</td></tr>',
      '  <tr><td>0</td><td>1</td><td>0</td><td>1</td></tr>',
      '  <tr><td>1</td><td>0</td><td>1</td><td>0</td></tr>',
      '  <tr><td>1</td><td>1</td><td>illegal</td><td>illegal</td></tr>',
      '</table>'
      ].join(''),
    netlist: [
      'DEF TOP',
      '  NET S',
      '  NET R',
      '  NET QT',
      '  NET QC',
      '  INST SRLAT SRLAT S R QT QC',
      '  INST TEST SRLAT_TEST S R QT QC',
      '  INST OUTS IO_OUT S',
      '  INST OUTR IO_OUT R',
      '  INST OUTQT IO_OUT QT',
      '  INST OUTQC IO_OUT QC',
      'ENDDEF'
      ].join('\n'),
    cost: 1387,
    price: 38,
    expectedNands: 4
  };
dld_designs[16] = {
    name: 'DLAT',
    desc: [].join(),
    netlist: [].join('\n'),
    cost: 10,
    price: 10,
    expectedNands: 6
  };
dld_designs[17] = {
    name: 'DFF',
    desc: [
      'Implement a D flip-flop.<br>',
      'Inputs:',
      '<dl>',
      '  <dt>D</dt><dd>Flip-flop data input.</dd>',
      '  <dt>E</dt><dd>Flip-flop enable.</dd>',
      '</dl>',
      'Outputs:',
      '<dl>',
      '  <dt>QT</dt><dd>Normal, "true", flip-flop output.</dd>',
      '  <dt>QC</dt><dd>Inverted, "complement", flip-flop output.</dd>',
      '</dl>',
      '<table class="table_truth_table">',
      '  <tr><th>E</th><th>QT</th><th>QC</th></tr>',
      '  <tr><td>0</td><td>hold previous QT</td><td>hold previous QC</td></tr>',
      '  <tr><td>1</td><td>hold previous QT</td><td>hold previous QC</td></tr>',
      '  <tr><td>Rising-edge</td><td>D</td><td>NOT(D)</td></tr>',
      '</table>'
      ].join(''),
    netlist: [
      'DEF TOP',
      '  NET D',
      '  NET E',
      '  NET QT',
      '  NET QC',
      '  INST DFF DFF D E QT QC',
      '  INST TEST DFF_TEST D E QT QC',
      '  INST OUTD IO_OUT D',
      '  INST OUTE IO_OUT E',
      '  INST OUTQT IO_OUT QT',
      '  INST OUTQC IO_OUT QC',
      'ENDDEF'
      ].join('\n'),
    cost: 2108,
    price: 80,
    expectedNands: 8
  };
dld_designs[18] = {
    name: 'TFF',
    desc: [
      'Implement a T flip-flop.<br>',
      'Inputs:',
      '<dl>',
      '  <dt>T</dt><dd>Flip-flop toggle enable.</dd>',
      '  <dt>R</dt><dd>Flip-flop reset.</dd>',
      '  <dt>E</dt><dd>Flip-flop enable.</dd>',
      '</dl>',
      'Outputs:',
      '<dl>',
      '  <dt>QT</dt><dd>Normal, "true", flip-flop output.</dd>',
      '  <dt>QC</dt><dd>Inverted, "complement", flip-flop output.</dd>',
      '</dl>',
      '<table class="table_truth_table">',
      '  <tr><th>E</th><th>R</th><th>T</th><th>QT</th><th>QC</th></tr>',
      '  <tr><td>Rising-edge</td><td>0</td><td>0</td><td>hold previous QT</td><td>hold previous QC</td></tr>',
      '  <tr><td>Rising-edge</td><td>0</td><td>1</td><td>NOT(QT)</td><td>NOT(QC)</td></tr>',
      '  <tr><td>Rising-edge</td><td>1</td><td>0</td><td>0</td><td>1</td></tr>',
      '  <tr><td>Rising-edge</td><td>1</td><td>1</td><td>0</td><td>1</td></tr>',
      '</table>'
      ].join(''),
    netlist: [
      'DEF TOP',
      '  NET T',
      '  NET R',
      '  NET E',
      '  NET QT',
      '  NET QC',
      '  INST TFF TFF T R E QT QC',
      '  INST TEST TFF_TEST T R E QT QC',
      '  INST OUTT IO_OUT T',
      '  INST OUTR IO_OUT R',
      '  INST OUTE IO_OUT E',
      '  INST OUTQT IO_OUT QT',
      '  INST OUTQC IO_OUT QC',
      'ENDDEF'
      ].join('\n'),
    cost: 2662,
    price: 168,
    expectedNands: 15
  };
/*
  {
    name: 'CLKDIV2',
    desc: [].join(),
    netlist: [].join('\n'),
    cost: 10,
    price: 10,
    expectedNands: 6
  },
  {
    name: 'CLKDIV3',
    desc: [].join(),
    netlist: [].join('\n'),
    cost: 10,
    price: 10,
    expectedNands: 6
  },
  {
    name: 'DFFx8',
    desc: [].join(),
    netlist: [].join('\n'),
    cost: 10,
    price: 10,
    expectedNands: 6
  },
  {
    name: 'ALUx8',
    desc: [].join(),
    netlist: [].join('\n'),
    cost: 10,
    price: 10,
    expectedNands: 6
  },
  {
    name: 'RAM8x8',
    desc: [].join(),
    netlist: [].join('\n'),
    cost: 10,
    price: 10,
    expectedNands: 6
  },
  {
    name: 'RAM256x8',
    desc: [].join(),
    netlist: [].join('\n'),
    cost: 10,
    price: 10,
    expectedNands: 6
  },
  {
    name: 'CPU',
    desc: [].join(),
    netlist: [].join('\n'),
    cost: 10,
    price: 10,
    expectedNands: 6
  }
];
*/

dld_designs[19] = {
    name: 'BIN_TO_7SEG',
    desc: [
      'Implement a binary to 7 segment display decoder. You need to properly light up the',
      'segments of a 7 segment display given 4 binary input bits representing a number to',
      'display. The 4 bits can represent a value from 0 to 15. Values from 10-15 should',
      'be shown as A-F. Due to the nature of the display, you\'ll need to show b and d as',
      'lowercase and make sure you have tails on your 6 and 9.<br>',
      'Inputs:',
      '<dl>',
      '  <dt>BIN&lt;3:0&gt;</dt><dd>4 binary input to be decoded. (msb..lsb)</dd>',
      '</dl>',
      'Outputs:',
      '<dl>',
      '  <dt>A-G</dt><dd>Controls for each of the segments of the display.</dd>',
      '</dl>',
      'Please see the <a href="http://en.wikipedia.org/wiki/Seven-segment_display">Seven-segment display Wikipedia article</a> for details on how the display works.'
      ].join(' '),
    netlist: [
      'DEF TOP',
      '  NET BIN<3:0>',
      '  NET A',
      '  NET B',
      '  NET C',
      '  NET D',
      '  NET E',
      '  NET F',
      '  NET G',
      '  INST BIN_TO_7SEG BIN_TO_7SEG BIN<3:0> A B C D E F G',
      '  INST TEST BIN_TO_7SEG_TEST BIN<3:0> A B C D E F G',
      '  INST OUTBIN IO_OUT8 false,false,false,false,BIN<3:0>',
      '  INST OUT7SEG IO_OUT7SEG A B C D E F G',
      'ENDDEF'
      ].join('\n'),
    cost: 3355,
    price: 1826,
    expectedNands: 37
  };
dld_designs[20] = {
  name: 'ADDx8',
    desc: [
      'Implement an 8 bit adder with carry in and carry out.<br>',
      'Inputs:',
      '<dl>',
      '  <dt>A&lt;7:0&gt;</dt><dd>First 8 bit adder input. (msb..lsb)</dd>',
      '  <dt>B&lt;7:0&gt;</dt><dd>Second 8 bit adder input. (msb..lsb)</dd>',
      '  <dt>CIN</dt><dd>Carry in into adder.</dd>',
      '</dl>',
      'Outputs:',
      '<dl>',
      '  <dt>S&lt;7:0&gt;</dt><dd>The 8 bit adder result. (msb..lsb)</dd>',
      '  <dt>COUT</dt><dd>Carry out of the adder.</dd>',
      '</dl>',
      '<p>Truth table for a single bit of the adder:</p>',
      '<table class="table_truth_table">',
      '  <tr><th>CIN</th><th>A</th><th>B</th><th>S</th><th>COUT</t</tr>',
      '  <tr><td>0</td>  <td>0</td><td>0</td><td>0</td><td>0</td></tr>',
      '  <tr><td>0</td>  <td>0</td><td>1</td><td>1</td><td>0</td></tr>',
      '  <tr><td>0</td>  <td>1</td><td>0</td><td>1</td><td>0</td></tr>',
      '  <tr><td>0</td>  <td>1</td><td>1</td><td>0</td><td>1</td></tr>',
      '  <tr><td>1</td>  <td>0</td><td>0</td><td>1</td><td>0</td></tr>',
      '  <tr><td>1</td>  <td>0</td><td>1</td><td>0</td><td>1</td></tr>',
      '  <tr><td>1</td>  <td>1</td><td>0</td><td>0</td><td>1</td></tr>',
      '  <tr><td>1</td>  <td>1</td><td>1</td><td>1</td><td>1</td></tr>',
      '</table>',
      '<p>Each bit\'s CIN is the COUT of the bit immediately less than itself',
      'except for the lsb which takes its CIN from the main CIN pin. The COUT',
      'of the msb drives the main COUT pin.</p>'
      ].join(' '),
  netlist: [
    'DEF TOP',
    '  NET A<7:0>',
    '  NET B<7:0>',
    '  NET CIN',
    '  NET S<7:0>',
    '  NET COUT',
    '  INST ADDx8 ADDx8 A<7:0> B<7:0> CIN S<7:0> COUT',
    '  INST TEST ADDx8_TEST A<7:0> B<7:0> CIN S<7:0> COUT',
    '  INST OUTA IO_OUT8 A<7:0>',
    '  INST OUTB IO_OUT8 B<7:0>',
    '  INST OUTCIN IO_OUT CIN',
    '  INST OUTS IO_OUT8 S<7:0>',
    '  INST COUT IO_OUT COUT',
    'ENDDEF'
  ].join('\n'),
  cost: 4217,
  price: 828,
  expectedNands: 72
};
dld_designs[21] = {
  name: 'ALUx8',
    desc: [
      'Implement an 8 bit arithmetic logic unit (ALU) with 4 functions: ADD, AND, OR, NOT.',
      'The ALU will perform the operation selected on the two inputs and output the result.',
      '(In the case of NOT the output should just be the NOT of A.)<br>',
      'Inputs:',
      '<dl>',
      '  <dt>A&lt;7:0&gt;</dt><dd>First 8 bit ALU input. (msb..lsb)</dd>',
      '  <dt>B&lt;7:0&gt;</dt><dd>Second 8 bit ALU input. (msb..lsb)</dd>',
      '  <dt>OP&lt;1:0&gt;</dt><dd>ALU operation. 00=ADD, 01=AND, 10=OR, 11=NOT</dd>',
      '</dl>',
      'Outputs:',
      '<dl>',
      '  <dt>Z&lt;7:0&gt;</dt><dd>The 8 bit ALU result. (msb..lsb)</dd>',
      '</dl>'
      ].join(' '),
  netlist: [
    'DEF TOP',
    '  NET A<7:0>',
    '  NET B<7:0>',
    '  NET OP<1:0>',
    '  NET Z<7:0>',
    '  INST ALUx8 ALUx8 A<7:0> B<7:0> OP<1:0> Z<7:0>',
    '  INST TEST ALUx8_TEST A<7:0> B<7:0> OP<1:0> Z<7:0>',
    '  INST OUTA IO_OUT8 A<7:0>',
    '  INST OUTB IO_OUT8 B<7:0>',
    '  INST OUTOP IO_OUT8 false,false,false,false,false,false,OP<1:0>',
    '  INST OUTZ IO_OUT8 Z<7:0>',
    'ENDDEF'
  ].join('\n'),
  cost: 5291,
  price: 2076,
  expectedNands: 173
};
