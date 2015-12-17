/* cycle_sim_prim.js
   Author: asterisk_man
   Date: 18 December 2013
   Description: circuit primitive definitions to be used with
                cycle_sim.js
                This file copyright asterisk_man 2014. All rights reserved
*/

/*global cycle_sim: false */
"use strict";

var Cycle_sim_prim_obj = function(name, inPorts, outPorts, inOutOrder) {
  this.blockName = name;

  this.ports = [];

  //use expandNet() so we can write vectors as vectors and not be forced to manually expand them
  //console.log('pre:' + inPorts.toString());
  var expandedInPorts = cycle_sim.expandNet(inPorts.join(','));
  //console.log('post:' + inPorts.toString());
  var expandedOutPorts = cycle_sim.expandNet(outPorts.join(','));


  if (inOutOrder) {
    expandedInPorts.forEach(function(v) {this.ports.push({name:v, direction:'IN'});}, this);
    expandedOutPorts.forEach(function(v) {this.ports.push({name:v, direction:'OUT'});}, this);
    //inPorts.forEach(function(v) {this.ports.push({name:v, direction:'IN'});}, this);
    //outPorts.forEach(function(v) {this.ports.push({name:v, direction:'OUT'});}, this);
  } else {
    expandedOutPorts.forEach(function(v) {this.ports.push({name:v, direction:'OUT'});}, this);
    expandedInPorts.forEach(function(v) {this.ports.push({name:v, direction:'IN'});}, this);
    //outPorts.forEach(function(v) {this.ports.push({name:v, direction:'OUT'});}, this);
    //inPorts.forEach(function(v) {this.ports.push({name:v, direction:'IN'});}, this);
  }

  this.nets = this.ports.map(function(v,i) {return {name:v.name, type:'port', portNum:i};});

  this.intNets = [];
  this.insts = [];
  this.primitive = true;
  this.init = function(inst) { };
  this.tick = function(inst) { };
};

var cycle_sim_prim = {
  getBlocks: function() {
    var primBlocks = {};

    primBlocks.NAND = new Cycle_sim_prim_obj('NAND', ['A', 'B'], ['Z'], true);
    primBlocks.NAND.init = function(inst) {
      //store some data to optimize the tick function here since it's a large cpu user
      inst.siga = inst.nets.A.signal;
      inst.sigb = inst.nets.B.signal;
      inst.sigz = inst.nets.Z.signal;
    };
    primBlocks.NAND.tick = function(inst) {
      var valA = cycle_sim.hw.signals[inst.siga].value;
      var valB = cycle_sim.hw.signals[inst.sigb].value;
      var result = !(valA && valB);
      //sigIndex 0 is "false" and sigIndex 1 is "true" so we can't write to them
      if (inst.sigz > 1) {
        cycle_sim.hw.signals[inst.sigz].next = result;
      }
    };

    primBlocks.IO_IN = new Cycle_sim_prim_obj('IO_IN', [], ['Z'], true);
    primBlocks.IO_IN.init = function(inst) {
      var eIO = document.getElementById("div_design_io");
      var ioID = "checkbox_design_IO_IN_" + inst.name;
      inst.IO_ID = ioID;
      eIO.innerHTML += "<input type=\"checkbox\" id=\"" + ioID + "\">" + inst.name + "<br>";
      inst.eIO = undefined;
    };
    primBlocks.IO_IN.tick = function(inst) {
      if (inst.eIO === undefined) {
        inst.eIO = document.getElementById(inst.IO_ID);
      }
      cycle_sim.setSigVal(inst,"Z",inst.eIO.checked);
    };

    primBlocks.IO_IN8 = new Cycle_sim_prim_obj('IO_IN8', [], ['Z<7>', 'Z<6>', 'Z<5>','Z<4>', 'Z<3>', 'Z<2>', 'Z<1>', 'Z<0>'], true);
    primBlocks.IO_IN8.init = function(inst) {
      var eIO = document.getElementById("div_design_io");
      var ioID = "checkbox_design_IO_IN8_" + inst.name;
      inst.IO_ID = ioID;
      eIO.innerHTML += "<div><input type='text' id='" + ioID + "' size='14' value='00000000'>" + inst.name + '</div>';
      inst.eIO = undefined;
    };
    primBlocks.IO_IN8.tick = function(inst) {
      if (inst.eIO === undefined) {
        inst.eIO = document.getElementById(inst.IO_ID);
      }
      var stringInput = inst.eIO.value;
      var inputInt;
      var inputBoolList;
      var i;
      if (stringInput.length === 3) {
        if (stringInput[0].toUpperCase() === "X") {
          inputInt = parseInt(stringInput.substr(1,2),16);
        }
      } else {
        if (stringInput.length === 8) {
          inputInt = parseInt(stringInput,2);
        }
      }
      if (inputInt !== undefined) {
        inputBoolList = cycle_sim.intToBoolList(inputInt,8);
        for (i = 0; i < inputBoolList.length; i++) {
          cycle_sim.setSigVal(inst,"Z<" + i + ">", inputBoolList[i]);
        }
        inst.eIO.style.backgroundColor="#FFFFFF";
      } else {
        inst.eIO.style.backgroundColor="#FF0000";
      }
    };

    primBlocks.IO_OUT = new Cycle_sim_prim_obj('IO_OUT', ['A'], [], true);
    primBlocks.IO_OUT.init = function(inst) {
      var eIO = document.getElementById("div_design_io");
      var ioID = "checkbox_design_IO_OUT_" + inst.name;
      inst.IO_ID = ioID;
      inst.IO_ID_CAN = 'canvas_design_' + ioID;
      eIO.innerHTML += "<div><canvas class=\"canvas_wave\" id=\"canvas_design_" + ioID + "\" width=\"200\" height=\"16\"></canvas><input type=\"checkbox\" id=\"" + ioID + "\" disabled=\"disabled\">" + inst.name + "</div>";
      inst.history = [];
      inst.eIO = undefined;
      inst.eIOCan = undefined;
    };
    primBlocks.IO_OUT.tick = function(inst) {
      if (inst.eIO === undefined) {
        inst.eIO = document.getElementById(inst.IO_ID);
        inst.eIOCan = document.getElementById(inst.IO_ID_CAN);
      }
      var val = cycle_sim.getSigVal(inst, "A");
      inst.eIO.checked = val;
      cycle_sim.updateGraph(inst, val);
    };

    primBlocks.IO_OUT8 = new Cycle_sim_prim_obj('IO_OUT8', ['A<7>', 'A<6>', 'A<5>', 'A<4>', 'A<3>', 'A<2>', 'A<1>', 'A<0>'], [], true);
    primBlocks.IO_OUT8.init = function(inst) {
      var eIO = document.getElementById("div_design_io");
      var ioID = "checkbox_design_IO_OUT8_" + inst.name;
      inst.IO_ID = ioID;
      eIO.innerHTML += "<div><input type=\"text\" id=\"" + ioID + "\" size=\"14\" value=\"00000000 (0x00)\">" + inst.name + "</div>";
      inst.history = [];
      inst.eIO = undefined;
    };
    primBlocks.IO_OUT8.tick = function(inst) {
      if (inst.eIO === undefined) {
        inst.eIO = document.getElementById(inst.IO_ID);
      }
      var val = cycle_sim.getSigVecVal(inst, "A", 7, 0);
      var binString = cycle_sim.leftPadNumberString(val.toString(2), 8);
      var hexString = cycle_sim.leftPadNumberString(val.toString(16), 2).toUpperCase();
      inst.eIO.value = binString + " (x" + hexString + ")";
    };

    primBlocks.IO_OUT7SEG = new Cycle_sim_prim_obj('IO_OUT7SEG', ['A', 'B', 'C', 'D', 'E', 'F', 'G'], [], true);
    primBlocks.IO_OUT7SEG.init = function(inst) {
      var eIO = document.getElementById('div_design_io');
      var ioID = 'canvas_design_IO_OUT7SEG_' + inst.name;
      inst.IO_ID = ioID;
      eIO.innerHTML += '<div><canvas class="canvas_7seg" id="' + ioID + '" width="32px" height="50px"></canvas>' + inst.name + '</div>';
      inst.eIO = undefined;
      inst.lastState = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
    };
    primBlocks.IO_OUT7SEG.tick = function(inst) {
      if (inst.eIO === undefined) {
        inst.eIO = document.getElementById(inst.IO_ID);
      }

      var canWidth = 32;
      var canHeight = 50;
      var changed = false;
      var i;
      var segIndex;

      var ctx = inst.eIO.getContext("2d");
      var segVals = [];
      segVals.push(cycle_sim.getSigVal(inst, "A"));
      segVals.push(cycle_sim.getSigVal(inst, "B"));
      segVals.push(cycle_sim.getSigVal(inst, "C"));
      segVals.push(cycle_sim.getSigVal(inst, "D"));
      segVals.push(cycle_sim.getSigVal(inst, "E"));
      segVals.push(cycle_sim.getSigVal(inst, "F"));
      segVals.push(cycle_sim.getSigVal(inst, "G"));

      //check if the inputs have changed since the last drawing and don't re-draw if they haven't
      for (i = 0; i < segVals.length; i++) {
        if (segVals[i] !== inst.lastState[i]) {
          changed = true;
          inst.lastState = segVals;
          break;
        }
      }

      if (changed === false) {
        return;
      }

      var segPolys = [
        [[5,5], [8,2], [25,2], [27,5], [25,7], [8,7]],
        [[25,7], [27,5], [30,7], [30,22], [27,25], [25,22]],
        [[27,25], [30,27], [30,42], [27,45], [25,42], [25,27]],
        [[25,42], [27,45], [25,47], [8,47], [5,45], [8,42]],
        [[8,42], [5,45], [3,42], [3,27], [5,25], [8,27]],
        [[5,25], [3,22], [3,7], [5,5], [8,7], [8,22]],
        [[5,25], [8,22], [25,22], [27,25], [25,27], [8,27]]
      ];

      ctx.clearRect(0, 0, canWidth, canHeight);
      ctx.strokeStyle = '#D0D0D0';
      ctx.lineWidth = 1;
      ctx.fillStyle = '#FF0000';

      var curPoly;
      for (segIndex = 0; segIndex < segVals.length; segIndex++) {
        curPoly = segPolys[segIndex];
        ctx.beginPath();

        ctx.moveTo(curPoly[0][0]-0.5, curPoly[0][1]+0.5);
        for (i = 1; i < curPoly.length; i++) {
          ctx.lineTo(curPoly[i][0]-0.5, curPoly[i][1]+0.5);
        }
        ctx.closePath();

        if (segVals[segIndex]) {
          ctx.fill();
          //ctx.strokeStyle = '#000000';
        } else {
          ctx.strokeStyle = '#D0D0D0';
        }
        ctx.stroke();
      }
    };

    primBlocks.NAND_TEST = new Cycle_sim_prim_obj('NAND_TEST', ['Z'], ['A', 'B'], false);
    primBlocks.NAND_TEST.init = function(inst) {
      inst.testCount = 0;
      inst.nextTime = 0;
      inst.state = 0;
      inst.failed = false;
      inst.expectedZ = undefined;
    };
    primBlocks.NAND_TEST.tick = function(inst) {
      var valZ;
      var newA;
      var newB;

      var propTime = 10;
      var requiredTests = 16;

      if (cycle_sim.hw.time >= inst.nextTime) {
        switch (inst.state) {
          case 0:
            //set inputs randomly
            newA = cycle_sim.randomBool();
            newB = cycle_sim.randomBool();
            inst.expectedZ = !(newA && newB);

            cycle_sim.setSigVal(inst, 'A', newA);
            cycle_sim.setSigVal(inst, 'B', newB);

            inst.nextTime += propTime;
            inst.state = 1;
            break;
          case 1:
            //verify output is correct
            valZ = cycle_sim.getSigVal(inst,'Z');
            if (valZ !== inst.expectedZ) {
              cycle_sim.testFail('NAND', 'NAND output was not correct.');
              inst.failed = true;
              return;
            } else {
              inst.testCount += 1;
              inst.nextTime += 1;
              inst.state = 0;
              cycle_sim.simLog('Passed ' + inst.testCount + ' tests of ' + requiredTests);
            }
            break;
        }
      }

      if (inst.testCount >= requiredTests) {
        if (inst.failed === false) {
          cycle_sim.testPass('NAND', 0);
        } else {
          cycle_sim.testFail('NAND', 'Test completed with previous fails.');
        }
      }
    };

    primBlocks.NOT_TEST = new Cycle_sim_prim_obj('NOT_TEST', ['Z'], ['A'], false);
    primBlocks.NOT_TEST.init = function(inst) {
      inst.testCount = 0;
      inst.nextTime = 0;
      inst.state = 0;
      inst.failed = false;
      inst.expectedZ = undefined;
    };
    primBlocks.NOT_TEST.tick = function(inst) {
      var valZ;
      var newA;

      var propTime = 10;
      var requiredTests = 8;

      if (cycle_sim.hw.time >= inst.nextTime) {
        switch (inst.state) {
          case 0:
            //set inputs randomly
            newA = cycle_sim.randomBool();
            inst.expectedZ = !newA;

            cycle_sim.setSigVal(inst, 'A', newA);

            inst.nextTime += propTime;
            inst.state = 1;
            break;
          case 1:
            //verify output is correct
            valZ = cycle_sim.getSigVal(inst, 'Z');
            if (valZ !== inst.expectedZ) {
              cycle_sim.testFail('NOT', 'NOT output was not correct.');
              inst.failed = true;
              return;
            } else {
              inst.testCount += 1;
              inst.nextTime += 1;
              inst.state = 0;
              cycle_sim.simLog('Passed ' + inst.testCount + ' tests of ' + requiredTests);
            }
            break;
        }
      }

      if (inst.testCount >= requiredTests) {
        if (inst.failed === false) {
          cycle_sim.testPass('NOT', 1);
        } else {
          cycle_sim.testFail('NOT', 'Test completed with previous fails.');
        }
      }
    };

    primBlocks.AND_TEST = new Cycle_sim_prim_obj('AND_TEST', ['Z'], ['A', 'B'], false);
    primBlocks.AND_TEST.init = function(inst) {
      inst.testCount = 0;
      inst.nextTime = 0;
      inst.state = 0;
      inst.failed = false;
      inst.expectedZ = undefined;
    };
    primBlocks.AND_TEST.tick = function(inst) {
      var valZ;
      var newA;
      var newB;

      var propTime = 10;
      var requiredTests = 16;

      if (cycle_sim.hw.time >= inst.nextTime) {
        switch (inst.state) {
          case 0:
            //set inputs randomly
            newA = cycle_sim.randomBool();
            newB = cycle_sim.randomBool();
            inst.expectedZ = newA && newB;

            cycle_sim.setSigVal(inst, 'A', newA);
            cycle_sim.setSigVal(inst, 'B', newB);

            inst.nextTime += propTime;
            inst.state = 1;
            break;
          case 1:
            //verify output is correct
            valZ = cycle_sim.getSigVal(inst, 'Z');
            if (valZ !== inst.expectedZ) {
              cycle_sim.testFail('AND', 'AND output was not correct.');
              inst.failed = true;
              return;
            } else {
              inst.testCount += 1;
              inst.nextTime += 1;
              inst.state = 0;
              cycle_sim.simLog('Passed ' + inst.testCount + ' tests of ' + requiredTests);
            }
            break;
        }
      }

      if (inst.testCount >= requiredTests) {
        if (inst.failed === false) {
          cycle_sim.testPass('AND', 2);
        } else {
          cycle_sim.testFail('AND', 'Test completed with previous fails.');
        }
      }
    };

    primBlocks.NOR_TEST = new Cycle_sim_prim_obj('NOR_TEST', ['Z'], ['A', 'B'], false);
    primBlocks.NOR_TEST.init = function(inst) {
      inst.testCount = 0;
      inst.nextTime = 0;
      inst.state = 0;
      inst.failed = false;
      inst.expectedZ = undefined;
    };
    primBlocks.NOR_TEST.tick = function(inst) {
      var valZ;
      var newA;
      var newB;

      var propTime = 10;
      var requiredTests = 16;

      if (cycle_sim.hw.time >= inst.nextTime) {
        switch (inst.state) {
          case 0:
            //set inputs randomly
            newA = cycle_sim.randomBool();
            newB = cycle_sim.randomBool();
            inst.expectedZ = !(newA || newB);

            cycle_sim.setSigVal(inst, 'A', newA);
            cycle_sim.setSigVal(inst, 'B', newB);

            inst.nextTime += propTime;
            inst.state = 1;
            break;
          case 1:
            //verify output is correct
            valZ = cycle_sim.getSigVal(inst, 'Z');
            if (valZ !== inst.expectedZ) {
              cycle_sim.testFail('NOR', 'NOR output was not correct.');
              inst.failed = true;
              return;
            } else {
              inst.testCount += 1;
              inst.nextTime += 1;
              inst.state = 0;
              cycle_sim.simLog('Passed ' + inst.testCount + ' tests of ' + requiredTests);
            }
            break;
        }
      }

      if (inst.testCount >= requiredTests) {
        if (inst.failed === false) {
          cycle_sim.testPass('NOR', 4);
        } else {
          cycle_sim.testFail('NOR', 'Test completed with previous fails.');
        }
      }
    };

    primBlocks.OR_TEST = new Cycle_sim_prim_obj('OR_TEST', ['Z'], ['A', 'B'], false);
    primBlocks.OR_TEST.init = function(inst) {
      inst.testCount = 0;
      inst.nextTime = 0;
      inst.state = 0;
      inst.failed = false;
      inst.expectedZ = undefined;
    };
    primBlocks.OR_TEST.tick = function(inst) {
      var valZ;
      var newA;
      var newB;

      var propTime = 10;
      var requiredTests = 16;

      if (cycle_sim.hw.time >= inst.nextTime) {
        switch (inst.state) {
          case 0:
            //set inputs randomly
            newA = cycle_sim.randomBool();
            newB = cycle_sim.randomBool();
            inst.expectedZ = (newA || newB);

            cycle_sim.setSigVal(inst, 'A', newA);
            cycle_sim.setSigVal(inst, 'B', newB);

            inst.nextTime += propTime;
            inst.state = 1;
            break;
          case 1:
            //verify output is correct
            valZ = cycle_sim.getSigVal(inst, 'Z');
            if (valZ !== inst.expectedZ) {
              cycle_sim.testFail('OR', 'OR output was not correct.');
              inst.failed = true;
              return;
            } else {
              inst.testCount += 1;
              inst.nextTime += 1;
              inst.state = 0;
              cycle_sim.simLog('Passed ' + inst.testCount + ' tests of ' + requiredTests);
            }
            break;
        }
      }

      if (inst.testCount >= requiredTests) {
        if (inst.failed === false) {
          cycle_sim.testPass('OR', 3);
        } else {
          cycle_sim.testFail('OR', 'Test completed with previous fails.');
        }
      }
    };

    primBlocks.XOR_TEST = new Cycle_sim_prim_obj('XOR_TEST', ['Z'], ['A', 'B'], false);
    primBlocks.XOR_TEST.init = function(inst) {
      inst.testCount = 0;
      inst.nextTime = 0;
      inst.state = 0;
      inst.failed = false;
      inst.expectedZ = undefined;
    };
    primBlocks.XOR_TEST.tick = function(inst) {
      var valZ;
      var newA;
      var newB;

      var propTime = 10;
      var requiredTests = 16;

      if (cycle_sim.hw.time >= inst.nextTime) {
        switch (inst.state) {
          case 0:
            //set inputs randomly
            newA = cycle_sim.randomBool();
            newB = cycle_sim.randomBool();
            //no logical xor in javascript so use !== instead
            inst.expectedZ = (newA !== newB);

            cycle_sim.setSigVal(inst, 'A', newA);
            cycle_sim.setSigVal(inst, 'B', newB);

            inst.nextTime += propTime;
            inst.state = 1;
            break;
          case 1:
            //verify output is correct
            valZ = cycle_sim.getSigVal(inst, 'Z');
            if (valZ !== inst.expectedZ) {
              cycle_sim.testFail('XOR', 'XOR output was not correct, expected ' + inst.expectedZ + ' but saw ' + valZ);
              inst.failed = true;
              return;
            } else {
              inst.testCount += 1;
              inst.nextTime += 1;
              inst.state = 0;
              cycle_sim.simLog('Passed ' + inst.testCount + ' tests of ' + requiredTests);
            }
            break;
        }
      }

      if (inst.testCount >= requiredTests) {
        if (inst.failed === false) {
          cycle_sim.testPass('XOR', 5);
        } else {
          cycle_sim.testFail('XOR', 'Test completed with previous fails.');
        }
      }
    };

    primBlocks.TRUTH_TABLE1_TEST = new Cycle_sim_prim_obj('TRUTH_TABLE1_TEST', ['Z'], ['A', 'B'], false);
    primBlocks.TRUTH_TABLE1_TEST.init = function(inst) {
      inst.testCount = 0;
      inst.nextTime = 0;
      inst.state = 0;
      inst.failed = false;
      inst.expectedZ = undefined;
      inst.truthTable = [[false,false],[true,false]];
    };
    primBlocks.TRUTH_TABLE1_TEST.tick = function(inst) {
      var valZ;
      var newA;
      var newB;

      var propTime = 12;
      var requiredTests = 16;

      if (cycle_sim.hw.time >= inst.nextTime) {
        switch (inst.state) {
          case 0:
            //set inputs randomly
            newA = cycle_sim.randomBool();
            newB = cycle_sim.randomBool();
            inst.expectedZ = inst.truthTable[newA+0][newB+0];

            cycle_sim.setSigVal(inst, 'A', newA);
            cycle_sim.setSigVal(inst, 'B', newB);

            inst.nextTime += propTime;
            inst.state = 1;
            break;
          case 1:
            //verify output is correct
            valZ = cycle_sim.getSigVal(inst, 'Z');
            if (valZ !== inst.expectedZ) {
              cycle_sim.testFail('TRUTH_TABLE1', 'TRUTH_TABLE1 output was not correct. Expected ' + inst.expectedZ + ' but saw ' + valZ);
              inst.failed = true;
              return;
            } else {
              inst.testCount += 1;
              inst.nextTime += 1;
              inst.state = 0;
              cycle_sim.simLog('Passed ' + inst.testCount + ' tests of ' + requiredTests);
            }
            break;
        }
      }

      if (inst.testCount >= requiredTests) {
        if (inst.failed === false) {
          cycle_sim.testPass('TRUTH_TABLE1', 6);
        } else {
          cycle_sim.testFail('TRUTH_TABLE1', 'Test completed with previous fails.');
        }
      }
    };

    primBlocks.TRUTH_TABLE2_TEST = new Cycle_sim_prim_obj('TRUTH_TABLE2_TEST', ['Z'], ['A', 'B', 'C'], false);
    primBlocks.TRUTH_TABLE2_TEST.init = function(inst) {
      inst.testCount = 0;
      inst.nextTime = 0;
      inst.state = 0;
      inst.failed = false;
      inst.expectedZ = undefined;
      inst.truthTable = [[[true,true],[false,false]],[[true,true],[false,true]]];
    };
    primBlocks.TRUTH_TABLE2_TEST.tick = function(inst) {
      var valZ;
      var newA;
      var newB;
      var newC;

      var propTime = 14;
      var requiredTests = 32;

      if (cycle_sim.hw.time >= inst.nextTime) {
        switch (inst.state) {
          case 0:
            //set inputs randomly
            newA = cycle_sim.randomBool();
            newB = cycle_sim.randomBool();
            newC = cycle_sim.randomBool();
            inst.expectedZ = inst.truthTable[newA+0][newB+0][newC+0];

            cycle_sim.setSigVal(inst, 'A', newA);
            cycle_sim.setSigVal(inst, 'B', newB);
            cycle_sim.setSigVal(inst, 'C', newC);

            inst.nextTime += propTime;
            inst.state = 1;
            break;
          case 1:
            //verify output is correct
            valZ = cycle_sim.getSigVal(inst, 'Z');
            if (valZ !== inst.expectedZ) {
              cycle_sim.testFail('TRUTH_TABLE2', 'TRUTH_TABLE2 output was not correct. Expected ' + inst.expectedZ + ' but saw ' + valZ);
              inst.failed = true;
              return;
            } else {
              inst.testCount += 1;
              inst.nextTime += 1;
              inst.state = 0;
              cycle_sim.simLog('Passed ' + inst.testCount + ' tests of ' + requiredTests);
            }
            break;
        }
      }

      if (inst.testCount >= requiredTests) {
        if (inst.failed === false) {
          cycle_sim.testPass('TRUTH_TABLE2', 7);
        } else {
          cycle_sim.testFail('TRUTH_TABLE2', 'Test completed with previous fails.');
        }
      }
    };

    primBlocks.TRUTH_TABLE3_TEST = new Cycle_sim_prim_obj('TRUTH_TABLE3_TEST', ['Z'], ['A', 'B', 'C', 'D'], false);
    primBlocks.TRUTH_TABLE3_TEST.init = function(inst) {
      inst.testCount = 0;
      inst.nextTime = 0;
      inst.state = 0;
      inst.failed = false;
      inst.expectedZ = undefined;
      inst.truthTable = [[[[false,false],[false,false]],[[true,true],[true,false]]],[[[true,false],[true,true]],[[true,true],[true,true]]]];
    };
    primBlocks.TRUTH_TABLE3_TEST.tick = function(inst) {
      var valZ;
      var newA;
      var newB;
      var newC;
      var newD;

      var propTime = 18;
      var requiredTests = 64;

      if (cycle_sim.hw.time >= inst.nextTime) {
        switch (inst.state) {
          case 0:
            //set inputs randomly
            newA = cycle_sim.randomBool();
            newB = cycle_sim.randomBool();
            newC = cycle_sim.randomBool();
            newD = cycle_sim.randomBool();
            inst.expectedZ = inst.truthTable[newA+0][newB+0][newC+0][newD+0];

            cycle_sim.setSigVal(inst, 'A', newA);
            cycle_sim.setSigVal(inst, 'B', newB);
            cycle_sim.setSigVal(inst, 'C', newC);
            cycle_sim.setSigVal(inst, 'D', newD);

            inst.nextTime += propTime;
            inst.state = 1;
            break;
          case 1:
            //verify output is correct
            valZ = cycle_sim.getSigVal(inst, 'Z');
            if (valZ !== inst.expectedZ) {
              cycle_sim.testFail('TRUTH_TABLE3', 'TRUTH_TABLE3 output was not correct. Expected ' + inst.expectedZ + ' but saw ' + valZ);
              inst.failed = true;
              return;
            } else {
              inst.testCount += 1;
              inst.nextTime += 1;
              inst.state = 0;
              cycle_sim.simLog('Passed ' + inst.testCount + ' tests of ' + requiredTests);
            }
            break;
        }
      }

      if (inst.testCount >= requiredTests) {
        if (inst.failed === false) {
          cycle_sim.testPass('TRUTH_TABLE3', 8);
        } else {
          cycle_sim.testFail('TRUTH_TABLE3', 'Test completed with previous fails.');
        }
      }
    };

    primBlocks.MUX21_TEST = new Cycle_sim_prim_obj('MUX21_TEST', ['Z'], ['I0', 'I1', 'S'], false);
    primBlocks.MUX21_TEST.init = function(inst) {
      inst.testCount = 0;
      inst.nextTime = 0;
      inst.state = 0;
      inst.failed = false;
      inst.expectedZ = undefined;
    };
    primBlocks.MUX21_TEST.tick = function(inst) {
      var valZ;
      var newI0;
      var newI1;
      var newS;

      var propTime = 12;
      var requiredTests = 32;

      if (cycle_sim.hw.time >= inst.nextTime) {
        switch (inst.state) {
          case 0:
            //set inputs randomly
            newI0 = cycle_sim.randomBool();
            newI1 = cycle_sim.randomBool();
            newS = cycle_sim.randomBool();

            if (newS) {
              inst.expectedZ = newI1;
            } else {
              inst.expectedZ = newI0;
            }

            cycle_sim.setSigVal(inst, 'I0', newI0);
            cycle_sim.setSigVal(inst, 'I1', newI1);
            cycle_sim.setSigVal(inst, 'S', newS);

            inst.nextTime += propTime;
            inst.state = 1;
            break;
          case 1:
            //verify output is correct
            valZ = cycle_sim.getSigVal(inst, 'Z');
            if (valZ !== inst.expectedZ) {
              cycle_sim.testFail('MUX21', 'Output was not correct. Expected ' + inst.expectedZ + ' but saw ' + valZ);
              inst.failed = true;
              return;
            } else {
              inst.testCount += 1;
              inst.nextTime += 1;
              inst.state = 0;
              cycle_sim.simLog('Passed ' + inst.testCount + ' tests of ' + requiredTests);
            }
            break;
        }
      }

      if (inst.testCount >= requiredTests) {
        if (inst.failed === false) {
          cycle_sim.testPass('MUX21', 9);
        } else {
          cycle_sim.testFail('MUX21', 'Test completed with previous fails.');
        }
      }
    };

    primBlocks.MUX41_TEST = new Cycle_sim_prim_obj('MUX41_TEST', ['Z'], ['I0', 'I1', 'I2', 'I3', 'S<1>', 'S<0>'], false);
    primBlocks.MUX41_TEST.init = function(inst) {
      inst.testCount = 0;
      inst.nextTime = 0;
      inst.state = 0;
      inst.failed = false;
      inst.expectedZ = undefined;
    };
    primBlocks.MUX41_TEST.tick = function(inst) {
      var valZ;
      var newI0;
      var newI1;
      var newI2;
      var newI3;
      var newS1;
      var newS0;
      var Sint;

      var propTime = 15;
      var requiredTests = 64;

      if (cycle_sim.hw.time >= inst.nextTime) {
        switch (inst.state) {
          case 0:
            //set inputs randomly
            newI0 = cycle_sim.randomBool();
            newI1 = cycle_sim.randomBool();
            newI2 = cycle_sim.randomBool();
            newI3 = cycle_sim.randomBool();
            newS1 = cycle_sim.randomBool();
            newS0 = cycle_sim.randomBool();

            Sint = ((newS1 + 0) << 1)  | (newS0 + 0);
            switch (Sint) {
              case 0:
                inst.expectedZ = newI0;
                break;
              case 1:
                inst.expectedZ = newI1;
                break;
              case 2:
                inst.expectedZ = newI2;
                break;
              case 3:
                inst.expectedZ = newI3;
                break;
            }

            cycle_sim.setSigVal(inst, 'I0', newI0);
            cycle_sim.setSigVal(inst, 'I1', newI1);
            cycle_sim.setSigVal(inst, 'I2', newI2);
            cycle_sim.setSigVal(inst, 'I3', newI3);
            cycle_sim.setSigVal(inst, 'S<1>', newS1);
            cycle_sim.setSigVal(inst, 'S<0>', newS0);

            inst.nextTime += propTime;
            inst.state = 1;
            break;
          case 1:
            //verify output is correct
            valZ = cycle_sim.getSigVal(inst, 'Z');
            if (valZ !== inst.expectedZ) {
              cycle_sim.testFail('MUX41', 'Output was not correct. Expected ' + inst.expectedZ + ' but saw ' + valZ);
              inst.failed = true;
              return;
            } else {
              inst.testCount += 1;
              inst.nextTime += 1;
              inst.state = 0;
              cycle_sim.simLog('Passed ' + inst.testCount + ' tests of ' + requiredTests);
            }
            break;
        }
      }

      if (inst.testCount >= requiredTests) {
        if (inst.failed === false) {
          cycle_sim.testPass('MUX41', 10);
        } else {
          cycle_sim.testFail('MUX41', 'Test completed with previous fails.');
        }
      }
    };

    primBlocks.MUX81X8_TEST = new Cycle_sim_prim_obj('MUX81X8_TEST', ['Z<7>', 'Z<6>', 'Z<5>', 'Z<4>', 'Z<3>', 'Z<2>', 'Z<1>', 'Z<0>'],
      [ 'I0<7>', 'I0<6>', 'I0<5>', 'I0<4>', 'I0<3>', 'I0<2>', 'I0<1>', 'I0<0>',
        'I1<7>', 'I1<6>', 'I1<5>', 'I1<4>', 'I1<3>', 'I1<2>', 'I1<1>', 'I1<0>',
        'I2<7>', 'I2<6>', 'I2<5>', 'I2<4>', 'I2<3>', 'I2<2>', 'I2<1>', 'I2<0>',
        'I3<7>', 'I3<6>', 'I3<5>', 'I3<4>', 'I3<3>', 'I3<2>', 'I3<1>', 'I3<0>',
        'I4<7>', 'I4<6>', 'I4<5>', 'I4<4>', 'I4<3>', 'I4<2>', 'I4<1>', 'I4<0>',
        'I5<7>', 'I5<6>', 'I5<5>', 'I5<4>', 'I5<3>', 'I5<2>', 'I5<1>', 'I5<0>',
        'I6<7>', 'I6<6>', 'I6<5>', 'I6<4>', 'I6<3>', 'I6<2>', 'I6<1>', 'I6<0>',
        'I7<7>', 'I7<6>', 'I7<5>', 'I7<4>', 'I7<3>', 'I7<2>', 'I7<1>', 'I7<0>',
        'S<2>', 'S<1>', 'S<0>'], false);
    primBlocks.MUX81X8_TEST.init = function(inst) {
      inst.testCount = 0;
      inst.nextTime = 0;
      inst.state = 0;
      inst.failed = false;
      inst.expectedZ = undefined;
    };
    primBlocks.MUX81X8_TEST.tick = function(inst) {
      var valZ;
      var newI0;
      var newI1;
      var newI2;
      var newI3;
      var newI4;
      var newI5;
      var newI6;
      var newI7;
      var newS;

      var propTime = 20;
      var requiredTests = 128;

      if (cycle_sim.hw.time >= inst.nextTime) {
        switch (inst.state) {
          case 0:
            //set inputs randomly
            newI0 = cycle_sim.randomInt(0,255);
            newI1 = cycle_sim.randomInt(0,255);
            newI2 = cycle_sim.randomInt(0,255);
            newI3 = cycle_sim.randomInt(0,255);
            newI4 = cycle_sim.randomInt(0,255);
            newI5 = cycle_sim.randomInt(0,255);
            newI6 = cycle_sim.randomInt(0,255);
            newI7 = cycle_sim.randomInt(0,255);
            newS = cycle_sim.randomInt(0,7);

            switch (newS) {
              case 0:
                inst.expectedZ = newI0;
                break;
              case 1:
                inst.expectedZ = newI1;
                break;
              case 2:
                inst.expectedZ = newI2;
                break;
              case 3:
                inst.expectedZ = newI3;
                break;
              case 4:
                inst.expectedZ = newI4;
                break;
              case 5:
                inst.expectedZ = newI5;
                break;
              case 6:
                inst.expectedZ = newI6;
                break;
              case 7:
                inst.expectedZ = newI7;
                break;
            }

            cycle_sim.setSigVecVal(inst, 'I0', 7, 0, newI0);
            cycle_sim.setSigVecVal(inst, 'I1', 7, 0, newI1);
            cycle_sim.setSigVecVal(inst, 'I2', 7, 0, newI2);
            cycle_sim.setSigVecVal(inst, 'I3', 7, 0, newI3);
            cycle_sim.setSigVecVal(inst, 'I4', 7, 0, newI4);
            cycle_sim.setSigVecVal(inst, 'I5', 7, 0, newI5);
            cycle_sim.setSigVecVal(inst, 'I6', 7, 0, newI6);
            cycle_sim.setSigVecVal(inst, 'I7', 7, 0, newI7);
            cycle_sim.setSigVecVal(inst, 'S', 2, 0, newS);

            inst.nextTime += propTime;
            inst.state = 1;
            break;
          case 1:
            //verify output is correct
            valZ = cycle_sim.getSigVecVal(inst, 'Z', 7, 0);
            if (valZ !== inst.expectedZ) {
              cycle_sim.testFail('MUX81X8', 'Output was not correct. Expected ' + inst.expectedZ + ' but saw ' + valZ);
              inst.failed = true;
              return;
            } else {
              inst.testCount += 1;
              inst.nextTime += 1;
              inst.state = 0;
              cycle_sim.simLog('Passed ' + inst.testCount + ' tests of ' + requiredTests);
            }
            break;
        }
      }

      if (inst.testCount >= requiredTests) {
        if (inst.failed === false) {
          cycle_sim.testPass('MUX81X8', 11);
        } else {
          cycle_sim.testFail('MUX81X8', 'Test completed with previous fails.');
        }
      }
    };

    primBlocks.DEMUX12_TEST = new Cycle_sim_prim_obj('DEMUX12_TEST', ['Z0', 'Z1'], ['A', 'S'], false);
    primBlocks.DEMUX12_TEST.init = function(inst) {
      inst.testCount = 0;
      inst.nextTime = 0;
      inst.state = 0;
      inst.failed = false;
      inst.expectedZ0 = undefined;
      inst.expectedZ1 = undefined;
    };
    primBlocks.DEMUX12_TEST.tick = function(inst) {
      var valZ0;
      var valZ1;
      var newA;
      var newS;

      var propTime = 12;
      var requiredTests = 32;

      if (cycle_sim.hw.time >= inst.nextTime) {
        switch (inst.state) {
          case 0:
            //set inputs randomly
            newA = cycle_sim.randomBool();
            newS = cycle_sim.randomBool();

            if (newS) {
              inst.expectedZ0 = false;
              inst.expectedZ1 = newA;
            } else {
              inst.expectedZ0 = newA;
              inst.expectedZ1 = false;
            }

            cycle_sim.setSigVal(inst, 'A', newA);
            cycle_sim.setSigVal(inst, 'S', newS);

            inst.nextTime += propTime;
            inst.state = 1;
            break;
          case 1:
            //verify output is correct
            valZ0 = cycle_sim.getSigVal(inst, 'Z0');
            valZ1 = cycle_sim.getSigVal(inst, 'Z1');
            if ((valZ0 !== inst.expectedZ0) || (valZ1 !== inst.expectedZ1)) {
              cycle_sim.testFail('DEMUX12', 'Output was not correct. Expected Z0=' + inst.expectedZ0 + ', Z1=' + inst.expectedZ1 + ' but saw ' + valZ0 + ',' + valZ1);
              inst.failed = true;
              return;
            } else {
              inst.testCount += 1;
              inst.nextTime += 1;
              inst.state = 0;
              cycle_sim.simLog('Passed ' + inst.testCount + ' tests of ' + requiredTests);
            }
            break;
        }
      }

      if (inst.testCount >= requiredTests) {
        if (inst.failed === false) {
          cycle_sim.testPass('DEMUX12', 12);
        } else {
          cycle_sim.testFail('DEMUX12', 'Test completed with previous fails.');
        }
      }
    };

    primBlocks.DEMUX14_TEST = new Cycle_sim_prim_obj('DEMUX14_TEST', ['Z0', 'Z1', 'Z2', 'Z3'], ['A', 'S<1>', 'S<0>'], false);
    primBlocks.DEMUX14_TEST.init = function(inst) {
      inst.testCount = 0;
      inst.nextTime = 0;
      inst.state = 0;
      inst.failed = false;
      inst.expectedZ0 = undefined;
      inst.expectedZ1 = undefined;
      inst.expectedZ2 = undefined;
      inst.expectedZ3 = undefined;
    };
    primBlocks.DEMUX14_TEST.tick = function(inst) {
      var valZ0;
      var valZ1;
      var valZ2;
      var valZ3;
      var newA;
      var newS;

      var propTime = 14;
      var requiredTests = 32;

      if (cycle_sim.hw.time >= inst.nextTime) {
        switch (inst.state) {
          case 0:
            //set inputs randomly
            newA = cycle_sim.randomBool();
            newS = cycle_sim.randomInt(0,3);

            inst.expectedZ0 = false;
            inst.expectedZ1 = false;
            inst.expectedZ2 = false;
            inst.expectedZ3 = false;

            switch (newS) {
              case 0:
                inst.expectedZ0 = newA;
                break;
              case 1:
                inst.expectedZ1 = newA;
                break;
              case 2:
                inst.expectedZ2 = newA;
                break;
              case 3:
                inst.expectedZ3 = newA;
                break;
            }

            cycle_sim.setSigVal(inst, 'A', newA);
            cycle_sim.setSigVecVal(inst, 'S', 1, 0, newS);

            inst.nextTime += propTime;
            inst.state = 1;
            break;
          case 1:
            //verify output is correct
            valZ0 = cycle_sim.getSigVal(inst, 'Z0');
            valZ1 = cycle_sim.getSigVal(inst, 'Z1');
            valZ2 = cycle_sim.getSigVal(inst, 'Z2');
            valZ3 = cycle_sim.getSigVal(inst, 'Z3');
            if ((valZ0 !== inst.expectedZ0) || (valZ1 !== inst.expectedZ1) || (valZ2 !== inst.expectedZ2) || (valZ3 !== inst.expectedZ3)) {
              cycle_sim.testFail('DEMUX14', 'Output was not correct. Expected Z0=' + inst.expectedZ0 + ', Z1=' + inst.expectedZ1 + ', Z2=' + inst.expectedZ2 + ', Z3=' + inst.expectedZ3 + ' but saw ' + valZ0 + ',' + valZ1 + ',' + valZ2 + ',' + valZ3);
              inst.failed = true;
              return;
            } else {
              inst.testCount += 1;
              inst.nextTime += 1;
              inst.state = 0;
              cycle_sim.simLog('Passed ' + inst.testCount + ' tests of ' + requiredTests);
            }
            break;
        }
      }

      if (inst.testCount >= requiredTests) {
        if (inst.failed === false) {
          cycle_sim.testPass('DEMUX14', 13);
        } else {
          cycle_sim.testFail('DEMUX14', 'Test completed with previous fails.');
        }
      }
    };

    primBlocks.DEMUX18X8_TEST = new Cycle_sim_prim_obj('DEMUX18X8_TEST',
      [
        'Z0<7>', 'Z0<6>', 'Z0<5>', 'Z0<4>', 'Z0<3>', 'Z0<2>', 'Z0<1>', 'Z0<0>',
        'Z1<7>', 'Z1<6>', 'Z1<5>', 'Z1<4>', 'Z1<3>', 'Z1<2>', 'Z1<1>', 'Z1<0>',
        'Z2<7>', 'Z2<6>', 'Z2<5>', 'Z2<4>', 'Z2<3>', 'Z2<2>', 'Z2<1>', 'Z2<0>',
        'Z3<7>', 'Z3<6>', 'Z3<5>', 'Z3<4>', 'Z3<3>', 'Z3<2>', 'Z3<1>', 'Z3<0>',
        'Z4<7>', 'Z4<6>', 'Z4<5>', 'Z4<4>', 'Z4<3>', 'Z4<2>', 'Z4<1>', 'Z4<0>',
        'Z5<7>', 'Z5<6>', 'Z5<5>', 'Z5<4>', 'Z5<3>', 'Z5<2>', 'Z5<1>', 'Z5<0>',
        'Z6<7>', 'Z6<6>', 'Z6<5>', 'Z6<4>', 'Z6<3>', 'Z6<2>', 'Z6<1>', 'Z6<0>',
        'Z7<7>', 'Z7<6>', 'Z7<5>', 'Z7<4>', 'Z7<3>', 'Z7<2>', 'Z7<1>', 'Z7<0>'
      ],
      [
        'A<7>', 'A<6>', 'A<5>', 'A<4>', 'A<3>', 'A<2>', 'A<1>', 'A<0>',
        'S<2>', 'S<1>', 'S<0>'], false);
    primBlocks.DEMUX18X8_TEST.init = function(inst) {
      inst.testCount = 0;
      inst.nextTime = 0;
      inst.state = 0;
      inst.failed = false;
      inst.expectedZ0 = undefined;
      inst.expectedZ1 = undefined;
      inst.expectedZ2 = undefined;
      inst.expectedZ3 = undefined;
      inst.expectedZ4 = undefined;
      inst.expectedZ5 = undefined;
      inst.expectedZ6 = undefined;
      inst.expectedZ7 = undefined;
    };
    primBlocks.DEMUX18X8_TEST.tick = function(inst) {
      var valZ0;
      var valZ1;
      var valZ2;
      var valZ3;
      var valZ4;
      var valZ5;
      var valZ6;
      var valZ7;
      var newA;
      var newS;

      var propTime = 20;
      var requiredTests = 128;

      if (cycle_sim.hw.time >= inst.nextTime) {
        switch (inst.state) {
          case 0:
            //set inputs randomly
            newA = cycle_sim.randomInt(0,255);
            newS = cycle_sim.randomInt(0,7);

            inst.expectedZ0 = 0;
            inst.expectedZ1 = 0;
            inst.expectedZ2 = 0;
            inst.expectedZ3 = 0;
            inst.expectedZ4 = 0;
            inst.expectedZ5 = 0;
            inst.expectedZ6 = 0;
            inst.expectedZ7 = 0;

            switch (newS) {
              case 0:
                inst.expectedZ0 = newA;
                break;
              case 1:
                inst.expectedZ1 = newA;
                break;
              case 2:
                inst.expectedZ2 = newA;
                break;
              case 3:
                inst.expectedZ3 = newA;
                break;
              case 4:
                inst.expectedZ4 = newA;
                break;
              case 5:
                inst.expectedZ5 = newA;
                break;
              case 6:
                inst.expectedZ6 = newA;
                break;
              case 7:
                inst.expectedZ7 = newA;
                break;
            }

            cycle_sim.setSigVecVal(inst, 'A', 7, 0, newA);
            cycle_sim.setSigVecVal(inst, 'S', 2, 0, newS);

            inst.nextTime += propTime;
            inst.state = 1;
            break;
          case 1:
            //verify output is correct
            valZ0 = cycle_sim.getSigVecVal(inst, 'Z0', 7, 0);
            valZ1 = cycle_sim.getSigVecVal(inst, 'Z1', 7, 0);
            valZ2 = cycle_sim.getSigVecVal(inst, 'Z2', 7, 0);
            valZ3 = cycle_sim.getSigVecVal(inst, 'Z3', 7, 0);
            valZ4 = cycle_sim.getSigVecVal(inst, 'Z4', 7, 0);
            valZ5 = cycle_sim.getSigVecVal(inst, 'Z5', 7, 0);
            valZ6 = cycle_sim.getSigVecVal(inst, 'Z6', 7, 0);
            valZ7 = cycle_sim.getSigVecVal(inst, 'Z7', 7, 0);
            if (
                 (valZ0 !== inst.expectedZ0) ||
                 (valZ1 !== inst.expectedZ1) ||
                 (valZ2 !== inst.expectedZ2) ||
                 (valZ3 !== inst.expectedZ3) ||
                 (valZ4 !== inst.expectedZ4) ||
                 (valZ5 !== inst.expectedZ5) ||
                 (valZ6 !== inst.expectedZ6) ||
                 (valZ7 !== inst.expectedZ7)
               ) {
              cycle_sim.testFail('DEMUX18X8', 'Output was not correct. Expected ' +
                  'Z0=' + cycle_sim.leftPadNumberString(inst.expectedZ0.toString(2), 8) +
                ', Z1=' + cycle_sim.leftPadNumberString(inst.expectedZ1.toString(2), 8) +
                ', Z2=' + cycle_sim.leftPadNumberString(inst.expectedZ2.toString(2), 8) +
                ', Z3=' + cycle_sim.leftPadNumberString(inst.expectedZ3.toString(2), 8) +
                ', Z4=' + cycle_sim.leftPadNumberString(inst.expectedZ4.toString(2), 8) +
                ', Z5=' + cycle_sim.leftPadNumberString(inst.expectedZ5.toString(2), 8) +
                ', Z6=' + cycle_sim.leftPadNumberString(inst.expectedZ6.toString(2), 8) +
                ', Z7=' + cycle_sim.leftPadNumberString(inst.expectedZ7.toString(2), 8) +
                ' but saw ' +
                  'Z0=' + cycle_sim.leftPadNumberString(valZ0.toString(2), 8) +
                ', Z1=' + cycle_sim.leftPadNumberString(valZ1.toString(2), 8) +
                ', Z2=' + cycle_sim.leftPadNumberString(valZ2.toString(2), 8) +
                ', Z3=' + cycle_sim.leftPadNumberString(valZ3.toString(2), 8) +
                ', Z4=' + cycle_sim.leftPadNumberString(valZ4.toString(2), 8) +
                ', Z5=' + cycle_sim.leftPadNumberString(valZ5.toString(2), 8) +
                ', Z6=' + cycle_sim.leftPadNumberString(valZ6.toString(2), 8) +
                ', Z7=' + cycle_sim.leftPadNumberString(valZ7.toString(2), 8)
                );
              inst.failed = true;
              return;
            } else {
              inst.testCount += 1;
              inst.nextTime += 1;
              inst.state = 0;
              cycle_sim.simLog('Passed ' + inst.testCount + ' tests of ' + requiredTests);
            }
            break;
        }
      }

      if (inst.testCount >= requiredTests) {
        if (inst.failed === false) {
          cycle_sim.testPass('DEMUX18X8', 14);
        } else {
          cycle_sim.testFail('DEMUX18X8', 'Test completed with previous fails.');
        }
      }
    };

    primBlocks.SRLAT_TEST = new Cycle_sim_prim_obj('SRLAT_TEST', ['QT', 'QC'], ['S', 'R'], false);
    primBlocks.SRLAT_TEST.init = function(inst) {
      inst.testCount = 0;
      inst.nextTime = 0;
      inst.state = 0;
      inst.failed = false;
      inst.expectedQT = undefined;
      inst.expectedQC = undefined;
    };
    primBlocks.SRLAT_TEST.tick = function(inst) {
      var valQT;
      var valQC;
      var newS;
      var newR;

      var propTime = 12;
      var requiredTests = 32;

      if (cycle_sim.hw.time >= inst.nextTime) {
        switch (inst.state) {
          case 0:
            //set inputs randomly
            newS = cycle_sim.randomBool();
            newR = cycle_sim.randomBool();

            //make sure S and R are never both true
            if (newS && newR) {
              newS = cycle_sim.randomBool();
              newR = !newS;
            }

            //if S and R are both false and this is our first test
            //turn S on so that our first output isn't going to be undefined
            if (!(newS || newR) && (inst.testCount === 0)) {
              newS = true;
              newR = false;
            }

            if (newS) {
              inst.expectedQT = true;
              inst.expectedQC = false;
            }
            if (newR) {
              inst.expectedQT = false;
              inst.expectedQC = true;
            }

            cycle_sim.setSigVal(inst, 'S', newS);
            cycle_sim.setSigVal(inst, 'R', newR);

            inst.nextTime += propTime;
            inst.state = 1;
            break;
          case 1:
            //verify output is correct
            valQT = cycle_sim.getSigVal(inst, 'QT');
            valQC = cycle_sim.getSigVal(inst, 'QC');
            if ((valQT !== inst.expectedQT) || (valQC !== inst.expectedQC)) {
              cycle_sim.testFail('SRLAT', 'Output was not correct. Expected QT=' + inst.expectedQT + ', QC=' + inst.expectedQC + ' but saw ' + valQT + ',' + valQC);
                inst.failed = true;
              return;
            } else {
              inst.testCount += 1;
              inst.nextTime += 1;
              inst.state = 0;
              cycle_sim.simLog('Passed ' + inst.testCount + ' tests of ' + requiredTests);
            }
            break;
        }
      }

      if (inst.testCount >= requiredTests) {
        if (inst.failed === false) {
          cycle_sim.testPass('SRLAT', 15);
        } else {
          cycle_sim.testFail('SRLAT', 'Test completed with previous fails.');
        }
      }
    };

    primBlocks.DFF_TEST = new Cycle_sim_prim_obj('DFF_TEST', ['QT', 'QC'], ['D', 'E'], false);
    primBlocks.DFF_TEST.init = function(inst) {
      inst.testCount = 0;
      inst.nextTime = 0;
      inst.state = 0;
      inst.failed = false;
      inst.expectedQT = undefined;
      inst.expectedQC = undefined;
      inst.lastE = undefined;
      inst.lastD = undefined;
    };
    primBlocks.DFF_TEST.tick = function(inst) {
      var valQT;
      var valQC;
      var newD;
      var newE;

      var propTime = 8;
      var requiredTests = 64;

      if (cycle_sim.hw.time >= inst.nextTime) {
        switch (inst.state) {
          case 0:
            //set data randomly
            newD = cycle_sim.randomBool();
            cycle_sim.setSigVal(inst, 'D', newD);
            inst.lastD = newD;
            if (cycle_sim.hw.time === 0) {
              newE = false;
              cycle_sim.setSigVal(inst, 'E', newE);
              inst.lastE = false;
            }
            inst.nextTime += propTime;
            inst.state = 1;
            break;
          case 1:
            //set enable randomly
            newE = cycle_sim.randomBool();

            if (newE && !inst.lastE) {
              inst.expectedQT = inst.lastD;
              inst.expectedQC = !inst.lastD;
            }

            inst.lastE = newE;

            cycle_sim.setSigVal(inst,'E', newE);

            inst.nextTime += propTime;
            inst.state = 2;
            break;
          case 2:
            //verify output is correct
            valQT = cycle_sim.getSigVal(inst, 'QT');
            valQC = cycle_sim.getSigVal(inst, 'QC');
            if (inst.expectedQT !== undefined) {
              if ((valQT !== inst.expectedQT) || (valQC !== inst.expectedQC)) {
                cycle_sim.testFail('DFF', 'Output was not correct. Expected QT=' + inst.expectedQT + ', QC=' + inst.expectedQC + ' but saw ' + valQT + ',' + valQC);
                inst.failed = true;
                return;
              } else {
                inst.testCount += 1;
                inst.nextTime += 1;
                inst.state = 0;
                cycle_sim.simLog('Passed ' + inst.testCount + ' tests of ' + requiredTests);
              }
            } else {
              inst.nextTime += 1;
              inst.state = 0;
            }
            break;
        }
      }

      if (inst.testCount >= requiredTests) {
        if (inst.failed === false) {
          cycle_sim.testPass('DFF', 17);
        } else {
          cycle_sim.testFail('DFF', 'Test completed with previous fails.');
        }
      }
    };

    primBlocks.TFF_TEST = new Cycle_sim_prim_obj('TFF_TEST', ['QT', 'QC'], ['T', 'R', 'E'], false);
    primBlocks.TFF_TEST.init = function(inst) {
      inst.testCount = 0;
      inst.nextTime = 0;
      inst.state = 0;
      inst.failed = false;
      inst.expectedQT = undefined;
      inst.expectedQC = undefined;
      inst.lastE = undefined;
      inst.lastD = undefined;
      inst.lastT = undefined;
      inst.lastR = undefined;
      inst.initComplete = false;
    };
    primBlocks.TFF_TEST.tick = function(inst) {
      var valQT;
      var valQC;
      var newT;
      var newR;
      var newE;

      var propTime = 12;
      var requiredTests = 64;

      if (cycle_sim.hw.time >= inst.nextTime) {
        switch (inst.state) {
          case 0:
            //set T randomly
            newT = cycle_sim.randomBool();
            newR = cycle_sim.randomBool();
            if (cycle_sim.hw.time === 0) {
              newE = false;
              cycle_sim.setSigVal(inst, 'E', newE);
              inst.lastE = false;
              //force a reset at the beginning
              newT = false;
              newR = true;
            }

            inst.lastR = newR;
            inst.lastT = newT;
            cycle_sim.setSigVal(inst, 'T', newT);
            cycle_sim.setSigVal(inst, 'R', newR);
            inst.nextTime += propTime;
            inst.state = 1;
            break;
          case 1:
            //set enable randomly
            if (inst.initComplete) {
              newE = cycle_sim.randomBool();
            } else {
              newE = true;
              inst.initComplete = true;
            }

            if (newE && !inst.lastE) {
              if (inst.lastR) {
                inst.lastD = false;
              } else if (inst.lastT) {
                inst.lastD = !inst.lastD;
              }
              inst.expectedQT = inst.lastD;
              inst.expectedQC = !inst.lastD;
            }

            inst.lastE = newE;

            cycle_sim.setSigVal(inst,'E', newE);

            inst.nextTime += propTime;
            inst.state = 2;
            break;
          case 2:
            //verify output is correct
            valQT = cycle_sim.getSigVal(inst, 'QT');
            valQC = cycle_sim.getSigVal(inst, 'QC');
            if (inst.expectedQT !== undefined) {
              if ((valQT !== inst.expectedQT) || (valQC !== inst.expectedQC)) {
              //if (false) {
                cycle_sim.testFail('TFF', 'Output was not correct. Expected QT=' + inst.expectedQT + ', QC=' + inst.expectedQC + ' but saw ' + valQT + ',' + valQC);
                inst.failed = true;
                return;
              } else {
                inst.testCount += 1;
                inst.nextTime += 1;
                inst.state = 0;
                cycle_sim.simLog('Passed ' + inst.testCount + ' tests of ' + requiredTests);
              }
            } else {
              inst.lastD = valQT;
              inst.nextTime += 1;
              inst.state = 0;
            }
            break;
        }
      }

      if (inst.testCount >= requiredTests) {
        if (inst.failed === false) {
          cycle_sim.testPass('TFF', 18);
        } else {
          cycle_sim.testFail('TFF', 'Test completed with previous fails.');
        }
      }
    };

    primBlocks.BIN_TO_7SEG_TEST = new Cycle_sim_prim_obj('BIN_TO_7SEG_TEST', ['A', 'B', 'C', 'D', 'E', 'F', 'G'], ['BIN<3>', 'BIN<2>', 'BIN<1>', 'BIN<0>'], false);
    primBlocks.BIN_TO_7SEG_TEST.init = function(inst) {
      inst.testCount = 0;
      inst.nextTime = 0;
      inst.state = 0;
      inst.failed = false;
      inst.expected = undefined;
      inst.lastBIN = undefined;
    };
    primBlocks.BIN_TO_7SEG_TEST.tick = function(inst) {
      var newBIN;
      var valAll;
      var outputMatches;
      var failMsg;
      var i;

      var propTime = 20;
      var requiredTests = 64;

      if (cycle_sim.hw.time >= inst.nextTime) {
        switch (inst.state) {
          case 0:
            if (inst.testCount <= 15) {
              newBIN = inst.testCount;
            } else {
              //set BIN randomly
              newBIN = cycle_sim.randomInt(0, 15);
            }

            inst.lastBIN = newBIN;

            inst.expected = [
              [true,true,true,true,true,true,false],
              [false,true,true,false,false,false,false],
              [true,true,false,true,true,false,true],
              [true,true,true,true,false,false,true],
              [false,true,true,false,false,true,true],
              [true,false,true,true,false,true,true],
              [true,false,true,true,true,true,true],
              [true,true,true,false,false,false,false],
              [true,true,true,true,true,true,true],
              [true,true,true,true,false,true,true],
              [true,true,true,false,true,true,true],
              [false,false,true,true,true,true,true],
              [true,false,false,true,true,true,false],
              [false,true,true,true,true,false,true],
              [true,false,false,true,true,true,true],
              [true,false,false,false,true,true,true]
            ][newBIN];

            cycle_sim.setSigVecVal(inst, 'BIN', 3, 0, newBIN);

            inst.nextTime += propTime;
            inst.state = 1;
            break;
          case 1:
            //verify output is correct
            valAll = [];
            valAll.push(cycle_sim.getSigVal(inst, 'A'));
            valAll.push(cycle_sim.getSigVal(inst, 'B'));
            valAll.push(cycle_sim.getSigVal(inst, 'C'));
            valAll.push(cycle_sim.getSigVal(inst, 'D'));
            valAll.push(cycle_sim.getSigVal(inst, 'E'));
            valAll.push(cycle_sim.getSigVal(inst, 'F'));
            valAll.push(cycle_sim.getSigVal(inst, 'G'));

            outputMatches = true;
            for (i = 0; i < valAll.length; i++) {
              if (valAll[i] !== inst.expected[i]) {
                outputMatches = false;
                break;
              }
            }
            if (!outputMatches) {
                failMsg = 'Output was not correct. Expected A-G=[' + inst.expected.toString() + '] but found A-G=[' + valAll.toString() + ']';
                cycle_sim.testFail('BIN_TO_7SEG', failMsg);
                inst.failed = true;
                return;
            } else {
              inst.testCount += 1;
              inst.nextTime += 1;
              inst.state = 0;
              cycle_sim.simLog('Passed ' + inst.testCount + ' tests of ' + requiredTests);
            }
            break;
        }
      }

      if (inst.testCount >= requiredTests) {
        if (inst.failed === false) {
          cycle_sim.testPass('BIN_TO_7SEG', 19);
        } else {
          cycle_sim.testFail('BIN_TO_7SEG', 'Test completed with previous fails.');
        }
      }
    };

    primBlocks.ADDX8_TEST = new Cycle_sim_prim_obj('ADDx8_TEST', ['S<7:0>', 'COUT'], ['A<7:0>', 'B<7:0>', 'CIN'], false);
    primBlocks.ADDX8_TEST.init = function(inst) {
      inst.testCount = 0;
      inst.nextTime = 0;
      inst.state = 0;
      inst.failed = false;
      inst.expectedS = undefined;
      inst.expectedCOUT = undefined;
      inst.lastA = undefined;
      inst.lastB = undefined;
      inst.lastCIN = undefined;
    };
    primBlocks.ADDX8_TEST.tick = function(inst) {
      var newA;
      var newB;
      var newCIN;
      var valS;
      var valCOUT;
      var sum;
      var failMsg;

      var propTime = 30;
      var requiredTests = 128;

      if (cycle_sim.hw.time >= inst.nextTime) {
        switch (inst.state) {
          case 0:
            newA = cycle_sim.randomInt(0,255);
            newB = cycle_sim.randomInt(0,255);
            newCIN = cycle_sim.randomInt(0,1);
            sum = newA + newB + newCIN;

            inst.lastA = newA;
            inst.lastB = newB;
            inst.lastCIN = newCIN===1;

            inst.expectedS = sum & 0xFF;
            inst.expectedCOUT = ((sum >> 8) & 0x01)===1;

            cycle_sim.setSigVecVal(inst, 'A', 7, 0, newA);
            cycle_sim.setSigVecVal(inst, 'B', 7, 0, newB);
            cycle_sim.setSigVal(inst, 'CIN', newCIN===1); //pass a bool, not an int

            inst.nextTime += propTime;
            inst.state = 1;
            break;
          case 1:
            //verify output is correct
            valS = cycle_sim.getSigVecVal(inst, 'S', 7, 0);
            valCOUT = cycle_sim.getSigVal(inst, 'COUT');

            if (!((valS === inst.expectedS) && (valCOUT === inst.expectedCOUT))) {
                failMsg = 'Output was not correct. Expected ' +
                          cycle_sim.leftPadNumberString(inst.lastA.toString(2), 8) +
                          ' + ' +
                          cycle_sim.leftPadNumberString(inst.lastB.toString(2), 8) +
                          ' + ' +
                          (inst.lastCIN + 0) +
                          ' = ' +
                          (inst.expectedCOUT + 0) +
                          ',' +
                          cycle_sim.leftPadNumberString(inst.expectedS.toString(2), 8) +
                          ' but found ' +
                          (valCOUT + 0) +
                          ',' +
                          cycle_sim.leftPadNumberString(valS.toString(2), 8);
                cycle_sim.testFail('ADDx8', failMsg);
                inst.failed = true;
                return;
            } else {
              inst.testCount += 1;
              inst.nextTime += 1;
              inst.state = 0;
              cycle_sim.simLog('Passed ' + inst.testCount + ' tests of ' + requiredTests);
            }
            break;
        }
      }

      if (inst.testCount >= requiredTests) {
        if (inst.failed === false) {
          cycle_sim.testPass('ADDX8', 20);
        } else {
          cycle_sim.testFail('ADDX8', 'Test completed with previous fails.');
        }
      }
    };

    primBlocks.ALUX8_TEST = new Cycle_sim_prim_obj('ALUx8_TEST', ['Z<7:0>'], ['A<7:0>', 'B<7:0>', 'OP<1:0>'], false);
    primBlocks.ALUX8_TEST.init = function(inst) {
      inst.testCount = 0;
      inst.nextTime = 0;
      inst.state = 0;
      inst.failed = false;
      inst.expectedZ = undefined;
      inst.lastA = undefined;
      inst.lastB = undefined;
      inst.lastOP = undefined;
    };
    primBlocks.ALUX8_TEST.tick = function(inst) {
      var newA;
      var newB;
      var newOP;
      var valZ;
      var out;
      var failMsg;

      var propTime = 40;
      var requiredTests = 512;
      var opString = ['ADD', 'AND', 'OR', 'NOT'];

      if (cycle_sim.hw.time >= inst.nextTime) {
        switch (inst.state) {
          case 0:
            newA = cycle_sim.randomInt(0,255);
            newB = cycle_sim.randomInt(0,255);
            newOP = cycle_sim.randomInt(0,3);
            switch (newOP) {
              case 0:
                out = newA + newB;
                break;
              case 1:
                out = newA & newB;
                break;
              case 2:
                out = newA | newB;
                break;
              case 3:
                out = ~newA;
                break;
            }
            out = out & 0xFF;

            inst.lastA = newA;
            inst.lastB = newB;
            inst.lastOP = newOP;

            inst.expectedZ = out;

            cycle_sim.setSigVecVal(inst, 'A', 7, 0, newA);
            cycle_sim.setSigVecVal(inst, 'B', 7, 0, newB);
            cycle_sim.setSigVecVal(inst, 'OP', 1, 0, newOP);

            inst.nextTime += propTime;
            inst.state = 1;
            break;
          case 1:
            //verify output is correct
            valZ = cycle_sim.getSigVecVal(inst, 'Z', 7, 0);

            if (valZ !== inst.expectedZ) {
                failMsg = 'Output was not correct. Expected ' + opString[inst.lastOP] + '('+
                          cycle_sim.leftPadNumberString(inst.lastA.toString(2), 8) +
                          ' , ' +
                          cycle_sim.leftPadNumberString(inst.lastB.toString(2), 8) +
                          ') ' +
                          ' = ' +
                          cycle_sim.leftPadNumberString(inst.expectedZ.toString(2), 8) +
                          ' but found ' +
                          cycle_sim.leftPadNumberString(valZ.toString(2), 8);
                cycle_sim.testFail('ALUX8', failMsg);
                inst.failed = true;
                return;
            } else {
              inst.testCount += 1;
              inst.nextTime += 1;
              inst.state = 0;
              cycle_sim.simLog('Passed ' + inst.testCount + ' tests of ' + requiredTests);
            }
            break;
        }
      }

      if (inst.testCount >= requiredTests) {
        if (inst.failed === false) {
          cycle_sim.testPass('ALUX8', 21);
        } else {
          cycle_sim.testFail('ALUX8', 'Test completed with previous fails.');
        }
      }
    };

    //=====
    return primBlocks;
  }
};

