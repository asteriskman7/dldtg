/* dld_simulator.js
   Author: asterisk_man
   Date: 16 December 2013
   Description: digital logic cycle simulator
                This file copyright asterisk_man 2014. All rights reserved

   Use:
     Set cycle_sim.logElement to the textarea to be used as a log window.

   TODO:
   1: fix all primitives
   2: move primitives to another file
   3: remove inline callbacks from generated html
   4: can we use a different array for signals[*].value and signals[*].next so
      we can just change the pointer from current to next instead of having to
      iterate over all signals?

*/

//TODO:
//graphs for IO_IN
//graphs for IO_OUT8
//graphs for IO_IN8
//make RAM256 test use rising edge of clock
//finish testing CPU test
//move test text to another file?

/*jslint indent: 2, browser: true, devel: true, vars: true, forin: true, plusplus: true, todo: true, bitwise: true, white: true */
/*global cycle_sim_prim: false, ga: false */
"use strict";

var cycle_sim = {
  hw: {},
  graphsEnabled: true,
  logElement: undefined,
  testFinished: undefined,
  eSimTime: undefined,
  simTickIterations: 1,
  intervalID: undefined,
  simCyclesPerSecond: 20,
  currentCyclesPerSecond: 20,
  speedIndex: 4,
  speedNames: ["1/16x", "1/8x", "1/4x", "1/2x", "1x", "2x", "4x", "8x", "16x", "max"],
  speedList: [1.25, 2.5, 5, 10, 20, 40, 80, 160, 320, 1000],
  speedMax: false,
  nandCount: 0,
  log: function(s) {
    cycle_sim.logElement.value += s + '\n';
    cycle_sim.logElement.scrollTop = cycle_sim.logElement.scrollHeight;
  },
  simLog: function(s) {
    cycle_sim.log("@T=" + cycle_sim.hw.time + " " + s);
  },
  netlistErrorLog: function(s, lineNum, line) {
    cycle_sim.log("ERROR: (line " + lineNum + ") " + s + "\n" + line);
  },
  testFail: function(testName, reason) {
    cycle_sim.simLog('TEST_FAIL\nREASON: ' + reason);
    cycle_sim.hw.testStatus = 'FAIL';
    cycle_sim.simPause();
    cycle_sim.testFinished(-1);
    ga('send', 'event', 'cycle_sim', 'test_fail', testName);
  },
  testPass: function (testName, testNumber) {
    cycle_sim.simLog("TEST PASS\nREASON: All tests were successful");
    cycle_sim.hw.testStatus = "PASS";
    cycle_sim.simPause();
    cycle_sim.testFinished(testNumber);
    ga('send', 'event', 'cycle_sim', 'test_pass', testName);
  },
  randomBool: function() {
    return Math.random() > 0.5;
  },
  randomInt: function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },
  intToBoolList: function(val, len) {
    var result = [];
    var i;

    for (i = 0; i < len; i++) {
      result[i] = Boolean(val & 0x01);
      val = val >> 1;
    }

    return result;
  },
  boolListToInt: function(list) {
    var result = 0;
    var i;

    for (i = list.length - 1; i >= 0; i--) {
      result = (result << 1)  | (list[i] ? 1 : 0);
    }
    return result;
  },
  leftPadNumberString: function (num, len) {
    while (num.length < len) {
      num = "0" + num;
    }
    return num;
  },
  findObjByProp: function (a, prop, value) {
    var i;
    for (i = 0; i < a.length; i++) {
      if (a[i][prop] === value) {
        return a[i];
      }
    }
    return undefined;
  },
  getSigVal: function (inst, name) {
    return cycle_sim.hw.signals[inst.nets[name].signal].value;
  },
  getSigVecVal: function (inst, baseName, msb, lsb) {
    var result = 0;
    var i;
    for (i = msb; i >= lsb; i--) {
      result = (result << 1) + cycle_sim.hw.signals[inst.nets[baseName + "<" + i + ">"].signal].value;
    }
    return result;
  },
  setSigVal: function (inst, name, val) {
    var sigIndex = inst.nets[name].signal;
    //sigIndex 0 is "false" and sigIndex 1 is "true" so we can't write to them
    if (sigIndex > 1) {
      cycle_sim.hw.signals[sigIndex].next = val;
    }
  },
  setSigVecVal: function (inst, baseName, msb, lsb, val) {
    var i;
    var bitVal;
    var signalIndex;
    for (i = lsb; i <= msb; i++) {
      bitVal = val & 0x01;
      val = val >> 1;
      signalIndex = inst.nets[baseName + "<" + i + ">"].signal;
      cycle_sim.hw.signals[signalIndex].next = (bitVal === 1);
    }
  },
  expandNet: function (expression) {
    if (expression.length === 0) {
      return [];
    }
    var commaSplit = expression.split(",");
    var i;
    var vectorRe = /(<([0-9]+):?([0-9]*)>)$/;
    var vectorArray;
    var result = [];
    var vStart;
    var vEnd;
    var vValue;
    var netBase;

    for (i = 0; i < commaSplit.length; i++) {
      vectorArray = vectorRe.exec(commaSplit[i]);
      if (vectorArray) {
        vStart = vectorArray[2];
        vEnd = vectorArray[3];
        if (vectorArray[3].length === 0) {
          result.push(commaSplit[i]);
        } else {
          netBase = commaSplit[i].split("<")[0];
          if (vStart === vEnd) {
            result.push(netBase + "<" + vStart + ">");
          } else {
            if (vStart < vEnd) {
              for (vValue = vStart; vValue <= vEnd; vValue++) {
                result.push(netBase + "<" + vValue + ">");
              }
            } else {
              for (vValue = vStart; vValue >= vEnd; vValue--) {
                result.push(netBase + "<" + vValue + ">");
              }
            }

          }
        }
      } else {
        result.push(commaSplit[i]);
      }
    }
    return result;
  },
  setImgPixel: function (img, x, y, r, g, b, a) {
    var i = (x + y * img.width) * 4;
    img.data[i] = r;
    img.data[i + 1] = g;
    img.data[i + 2] = b;
    img.data[i + 3] = a;
  },
  updateGraph: function(inst, val) {
    var eCan = inst.eIOCan;
    var maxHistory = 200;
    var canHeight = 16;
    var sliceStart;
    inst.history.push(val);
    if (inst.history.length > maxHistory) {
      sliceStart = inst.history.length - maxHistory;
      inst.history = inst.history.slice(sliceStart);
    }

    if (!cycle_sim.graphsEnabled) {
      return;
    }

    var ctx = eCan.getContext("2d");
    //var img = ctx.getImageData(0,0,maxHistory,canHeight);
    var img = ctx.createImageData(maxHistory, canHeight);
    var x;
    var y;
    var histVal;
    var halfHeight = canHeight >> 1;
    for (y = 0; y < canHeight; y++) {
      for (x = 0; x < maxHistory; x++) {
        if (x < inst.history.length) {
          histVal = inst.history[x];
          if (histVal && (y <= halfHeight)) {
            cycle_sim.setImgPixel(img, x, y, 0, 0, 0, 255);
          } else {
            if (!histVal && (y > halfHeight)) {
              cycle_sim.setImgPixel(img, x, y, 0, 0, 0, 255);
            } else {
              cycle_sim.setImgPixel(img, x, y, 255, 255, 255, 255);
            }
          }
        } else {
          cycle_sim.setImgPixel(img, x, y, 0x80, 0x80, 0x80, 255);
        }
      }
    }
    ctx.putImageData(img, 0, 0);
  },
  parseNetlist: function (sourceNetlist) {
    cycle_sim.log("===Netlist parse start.");

    cycle_sim.hw = {};

    var netlistText = sourceNetlist.toUpperCase();
    netlistText = netlistText.replace(/[ \t]{2,}/g, " ");
    cycle_sim.log("Netlist is " + netlistText.length + " bytes long.");

    if (netlistText.length === 0) {
      cycle_sim.log('ERROR: Empty netlist');
      ga('send', 'event', 'cycle_sim', 'parse', 'FAIL-EmptyNetlist');
      return false;
    }

    var netlistLines = netlistText.split("\n");
    cycle_sim.log("Netlist is " + netlistLines.length + " lines long.");
    cycle_sim.clearIODiv();
    cycle_sim.clearHierDiv();

    var i;
    var netlistLinesIndex;
    var lineNum;
    var nonCommentText;
    var line;
    var inDef = false;
    var lineSplit;
    var cmd;
    var block;
    var portDirection;
    var portName;
    var port;
    var net;
    var netName;
    var blockName;
    var instName;
    var inst;
    var instPorts;
    var expandedNetArray;
    var expandedInstPorts;
    cycle_sim.hw.signals = [];
    cycle_sim.hw.primitives = [];
    cycle_sim.hw.time = 0;
    cycle_sim.hw.testStatus = "PASS";
    cycle_sim.hw.blocks = cycle_sim_prim.getBlocks();

    for (netlistLinesIndex = 0; netlistLinesIndex < netlistLines.length; netlistLinesIndex++) {
      lineNum = netlistLinesIndex + 1;
      line = netlistLines[netlistLinesIndex];
      nonCommentText = line.split("#")[0].trim();
      if (nonCommentText.length > 0) {
        lineSplit = nonCommentText.split(" ");
        cmd = lineSplit[0];
        if (inDef === true) {
          switch (cmd) {
           case "PORT":
             if (lineSplit.length !== 3) {
               cycle_sim.netlistErrorLog("PORT should be exactly 3 words", lineNum, line);
               ga('send', 'event', 'cycle_sim', 'parse', 'FAIL-PortShouldBe3Words');
               return false;
             }
             portDirection = lineSplit[1];
             if (["IN","OUT"].indexOf(portDirection) === -1) {
               cycle_sim.netlistErrorLog("PORT direction must be either IN or OUT, not \"" + portDirection + "\"", lineNum, line);
               ga('send', 'event', 'cycle_sim', 'parse', 'FAIL-PortDirectionMustBeInOrOut');
               return false;
             }

             portName = lineSplit[2];
             expandedNetArray = cycle_sim.expandNet(portName);
             for (i = 0; i < expandedNetArray.length; i++) {
               portName = expandedNetArray[i];
               if (cycle_sim.findObjByProp(block.nets, "name", portName) !== undefined) {
                 cycle_sim.netlistErrorLog("PORT must provide a unique name", lineNum, line);
                 ga('send', 'event', 'cycle_sim', 'parse', 'FAIL-PortMustProvideAUniqueName');
                 return false;
               }
               port = {
                 name: portName,
                 direction: portDirection
               };
               block.ports.push(port);
               net = {
                 name: portName,
                 type: "port",
                 portNum: block.ports.length-1
               };
               block.nets.push(net);
             }

             break;
           case "NET":
             if (lineSplit.length !== 2) {
               cycle_sim.netlistErrorLog("NET should be exactly 2 words", lineNum, line);
               ga('send', 'event', 'cycle_sim', 'parse', 'FAIL-NetShouldBe2Words');
               return false;
             }
             netName = lineSplit[1];
             expandedNetArray = cycle_sim.expandNet(netName);
             for (i = 0; i < expandedNetArray.length; i++) {
               netName = expandedNetArray[i];
               if (cycle_sim.findObjByProp(block.nets, "name", netName) !== undefined) {
                 cycle_sim.netlistErrorLog("NET must provide a unique name", lineNum, line);
                 ga('send', 'event', 'cycle_sim', 'parse', 'FAIL-NetMustBeUnique');
                 return false;
               }
               net = {
                 name: netName,
                 type: "net"
               };
               block.nets.push(net);
             }
             break;
           case "INST":
             if (lineSplit.length < 4) {
               cycle_sim.netlistErrorLog("INST must have at least 4 words", lineNum, line);
               ga('send', 'event', 'cycle_sim', 'parse', 'FAIL-InstMustHave4Words');
               return false;
             }

             instName = lineSplit[1];
             blockName = lineSplit[2];

             if (cycle_sim.hw.blocks[blockName] === undefined) {
               cycle_sim.netlistErrorLog("INST must only refer to previously defined blocks (" + blockName + ")", lineNum, line);
               ga('send', 'event', 'cycle_sim', 'parse', 'FAIL-InstMustReferToDefinedBlock');
               return false;
             }
             //TODO: need to make sure that the direction of connections to the inst is correct

             instPorts = lineSplit.slice(3);
             expandedInstPorts = [];
             for (i = 0; i < instPorts.length; i++) {
               expandedInstPorts = expandedInstPorts.concat(cycle_sim.expandNet(instPorts[i]));
             }
             instPorts = expandedInstPorts;
             for (i=0; i<instPorts.length; i++) {
               if (cycle_sim.findObjByProp(block.nets, "name", instPorts[i]) === undefined) {
                 if ((instPorts[i] !== "TRUE") && (instPorts[i] !== "FALSE")) {
                   cycle_sim.netlistErrorLog("INST ports must only be connected to previously defined PORTS/NETS (" + instPorts[i] + ")", lineNum, line);
                   ga('send', 'event', 'cycle_sim', 'parse', 'FAIL-InstPortsMustConnectToDefined');
                   return false;
                 }
               }
             }
             if (instPorts.length !== cycle_sim.hw.blocks[blockName].ports.length) {
               cycle_sim.netlistErrorLog("INST declaration must assign as many ports as a block actually has (" + instPorts.length + " != " + cycle_sim.hw.blocks[blockName].ports.length + ")", lineNum, line);
               ga('send', 'event', 'cycle_sim', 'parse', 'FAIL-InstDeclarationPortCountMismatch');
               return false;
             }

             inst = {
               name:instName,
               blockName:blockName,
               ports:instPorts,
               primitive:false
             };

             if (block.insts.filter(function(inst){return inst.name===instName;}).length > 0) {
               cycle_sim.netlistErrorLog("Each INST name must be unique in a given block. (" + instName + ")", lineNum, line);
               ga('send', 'event', 'cycle_sim', 'parse', 'FAIL-InstNameMustBeUniqueInABlock');
               return false;
             }

             block.insts.push(inst);

             break;
           case "ENDDEF":
             if (lineSplit.length !== 1) {
               cycle_sim.netlistErrorLog("ENDDEF should be exactly 1 word", lineNum, line);
               ga('send', 'event', 'cycle_sim', 'parse', 'FAIL-EnddefMustBe1Word');
               return false;
             }

             if (inDef === false) {
               cycle_sim.netlistErrorLog("ENDDEF should only occur after a valid DEF", lineNum, line);
               ga('send', 'event', 'cycle_sim', 'parse', 'FAIL-EnddefMustComeAfterDef');
               return false;
             }

             cycle_sim.hw.blocks[block.blockName]=block;
             cycle_sim.log("Parsed " + block.blockName);
             inDef = false;
             break;
           case "DEF":
             cycle_sim.netlistErrorLog("DEF not allowed inside previous DEF. ENDDEF should come first", lineNum, line);
             ga('send', 'event', 'cycle_sim', 'parse', 'FAIL-DefNotAllowedInDef');
             return false;
             break;
           default:
            cycle_sim.netlistErrorLog("Unknown command \"" + cmd + "\"", lineNum, line);
            ga('send', 'event', 'cycle_sim', 'parse', 'FAIL-UnknownCommand');
            return false;
          }
        } else {
          if (cmd !== "DEF") {
            cycle_sim.netlistErrorLog("Expected DEF", lineNum, line);
            ga('send', 'event', 'cycle_sim', 'parse', 'FAIL-ExpectedDef');
            return false;
          } else {
            if (lineSplit.length !== 2) {
              cycle_sim.netlistErrorLog("DEF should be exactly 2 words", lineNum, line);
              ga('send', 'event', 'cycle_sim', 'parse', 'FAIL-DefShouldBe2Words');
              return false;
            }
            if (cycle_sim.hw.blocks[lineSplit[1]] !== undefined) {
              cycle_sim.netlistErrorLog("DEF must not redefine previously defined blocks", lineNum, line);
              ga('send', 'event', 'cycle_sim', 'parse', 'FAIL-DefMustNotRedefine');
              return false;
            }
            block = {
              blockName: lineSplit[1],
              ports: [],
              nets: [{name:"FALSE",type:"net"},{name:"TRUE",type:"net"}],
              insts: []
            };
            inDef = true;
          }
        }
      }
    }
    if (inDef === true) {
      cycle_sim.netlistErrorLog("Last open DEF not closed with ENDDEF", "EOF", "");
      ga('send', 'event', 'cycle_sim', 'parse', 'FAIL-LastDEFNotClosed');
      return false;
    }

    //cycle_sim.changeNetlistState("old");
    //cycle_sim.setButtonsState("parsed");
    cycle_sim.log("===Netlist parse complete.");
    ga('send', 'event', 'cycle_sim', 'parse', 'PASS');
    return true;
  },
  createNewSignal: function() {
    var s = {value: false, next: false};
    cycle_sim.hw.signals.push(s);
    return (cycle_sim.hw.signals.length - 1);
  },
  createInstance: function(blockName, portSignals, name) {
    var inst = {name:name};
    inst.blockName = blockName;
    var nets = {};
    //cycle_sim.log("Creating " + name + " (" + blockName + ")");

    var block = cycle_sim.hw.blocks[blockName];

    var i;
    var signal;

    for (i = 0; i < block.nets.length; i++) {
      if (block.nets[i].type === "net") {
        if (block.nets[i].name === "FALSE") {
          signal = 0;
        } else if (block.nets[i].name === "TRUE") {
          signal = 1;
        } else {
          signal = cycle_sim.createNewSignal();
        }
      } else {
        signal = portSignals[block.nets[i].portNum];
      }
      nets[block.nets[i].name] = {name:block.nets[i].name,signal:signal};
    }
    inst.nets = nets;

    inst.insts = [];

    var newInst;
    var childPortSignals;
    var j;
    var childSignal;
    for (i = 0; i < block.insts.length; i++) {
      childPortSignals = [];
      for (j = 0; j < block.insts[i].ports.length; j++) {
        childSignal = nets[block.insts[i].ports[j]].signal;
        childPortSignals.push(childSignal);
      }
      //cycle_sim.log("Creating inst of " + block.insts[i].blockName + " with childPortSignals of " + childPortSignals);
      newInst = cycle_sim.createInstance(block.insts[i].blockName,childPortSignals,name + ":" + block.insts[i].name);
      inst.insts.push(newInst);
    }

    if (block.primitive) {
      block.init(inst);
      cycle_sim.hw.primitives.push(inst);
    }

    return inst;
  },
  printInstState: function(inst,prefix) {
    if (prefix === undefined) {
      prefix = "";
    }
    var instInfo = inst.name + "(" + inst.blockName + ")";
    var i;
    var netNames = Object.keys(inst.nets);
    var signalValue;
    var signalValueString;
    for (i = 0; i < netNames.length; i++) {
      //if (cycle_sim.hw.signals[inst.nets[netNames[i]].signal].value === undefined) {
      if (netNames[i] === "FALSE" || netNames[i] === "TRUE") {
        continue;
      }
      signalValue = cycle_sim.getSigVal(inst,netNames[i]);
      if (signalValue === undefined) {
        signalValueString = "U";
      } else {
        //signalValue = cycle_sim.hw.signals[inst.nets[netNames[i]].signal] ? "T" : "F";
        signalValueString = signalValue ? "T" : "F";
      }
      instInfo += " " + inst.nets[netNames[i]].name + "=" + signalValueString + ",";
    }
    cycle_sim.log(prefix + instInfo);
    for (i = 0; i < inst.insts.length; i++) {
      cycle_sim.printInstState(inst.insts[i],prefix+"-");
    }
  },
  printSingleInstState: function(nodeIndex) {
    var inst;
    var indexSplit;
    var instIndex;
    var i;
    var state;
    var key;
    if (nodeIndex === "TOP") {
      inst = cycle_sim.hw.simState;
    } else {
      inst = cycle_sim.hw.simState;
      indexSplit = nodeIndex.split("_");
      for (i = 1; i < indexSplit.length; i++) {
        instIndex = parseInt(indexSplit[i],10);
        inst = inst.insts[instIndex];
      }
    }

    state = inst.name + " (" + inst.blockName + ")";
    for (key in inst.nets) {
      if (key !== "TRUE" && key !== "FALSE") {
        state += "\n" + key + "=" + cycle_sim.getSigVal(inst, key);
      }
    }
    cycle_sim.log(state);
  },
  clearIODiv: function() {
    cycle_sim.log("Clearing IO");
    var eIO = document.getElementById("div_design_io");
    eIO.innerHTML = "";
  },
  clearHierDiv: function() {
    cycle_sim.log("Clearing Hierarchy");
    var eHier = document.getElementById("div_design_hierarchy");
    eHier.innerHTML = "";
  },
  toggleHierarchy: function (nodeIndex, nodeName) {
    var inst;
    var spanID;
    var eSpan;
    var HTML;
    var newNodeIndex;
    var indexSplit;
    var instIndex;
    var i;
    var nameType;
    var printButtonHTML;
    if (nodeIndex === "TOP") {
      inst = cycle_sim.hw.simState;
    } else {
      inst = cycle_sim.hw.simState;
      indexSplit = nodeIndex.split("_");
      for (i = 1; i < indexSplit.length; i++) {
        instIndex = parseInt(indexSplit[i],10);
        inst = inst.insts[instIndex];
      }
    }

    spanID = "span_design_hier_" + nodeIndex;
    eSpan = document.getElementById(spanID);

    HTML = "<button type=\"button\" onclick=\"cycle_sim.toggleHierarchy('"+nodeIndex+"','"+nodeName+"');\">";
    if (eSpan.childElementCount <= 2) {
      //expand
      HTML += "-</button><button type=\"button\" onclick=\"cycle_sim.printSingleInstState('" + nodeIndex + "')\">Print</button>" + nodeName;
      if (inst.insts.length > 0) {
        HTML += "<ul>";
        for (i = 0; i < inst.insts.length; i++) {
          newNodeIndex = nodeIndex + "_" + i;
          nameType = inst.insts[i].name + " (" + inst.insts[i].blockName + ")";
          HTML += "<li>";
          printButtonHTML = "<button type=\"button\" onclick=\"cycle_sim.printSingleInstState('" + newNodeIndex + "')\">Print</button>";
          if (cycle_sim.hw.blocks[inst.insts[i].blockName].primitive === true) {
            HTML += "<span id=\"span_design_hier_" + newNodeIndex + "\"><button type=\"button\" disabled=\"disabled\">p</button>" + printButtonHTML + nameType + "</span>";
          } else {
            HTML += "<span id=\"span_design_hier_" + newNodeIndex + "\"><button type=\"button\" onclick=\"cycle_sim.toggleHierarchy('" + newNodeIndex + "','" + nameType + "')\">+</button> " + printButtonHTML + nameType + "</span>";
          }
          HTML += "</li>";
        }
        HTML += "</ul>";
      }
    } else {
      //collapse
      HTML += "+</button><button type=\"button\" onclick=\"cycle_sim.printSingleInstState('" + nodeIndex + "')\">Print</button>" + nodeName;
    }
    eSpan.innerHTML = HTML;
  },
  elaborate: function () {
    cycle_sim.log("===Elaboration start.");
    if (cycle_sim.hw.blocks["TOP"] === undefined) {
      cycle_sim.log("ERROR: A block named TOP must be defined");
      ga('send', 'event', 'cycle_sim', 'elaborate', 'FAIL-TopMustBeDefined');
      return false;
    }
    if (cycle_sim.hw.blocks["TOP"].ports.length > 0) {
      cycle_sim.log("ERROR: The TOP block must have no ports");
      ga('send', 'event', 'cycle_sim', 'elaborate', 'FAIL-TopMustNotHavePorts');
      return false;
    }

    cycle_sim.clearIODiv();

    cycle_sim.hw.primitives = [];
    cycle_sim.hw.signals = [];

    cycle_sim.hw.signals.push({value: false, next: false}); //signal 0 is false
    cycle_sim.hw.signals.push({value: true, next: true});   //signal 1 is true

    cycle_sim.hw.simState = cycle_sim.createInstance("TOP",[],"TOP");

    cycle_sim.nandCount = cycle_sim.hw.primitives.filter(function(v) {return v.blockName === 'NAND'; }).length;

    //cycle_sim.log("Created " + cycle_sim.hw.primitives.length + " primitives.");
    cycle_sim.log("Used " + cycle_sim.nandCount + " NANDs.");

    cycle_sim.hw.time = 0;
    //var eSimTime = document.getElementById("span_design_time");
    cycle_sim.eSimTime.textContent = cycle_sim.hw.time;

    var eHier = document.getElementById("div_design_hierarchy");
    //eHier.innerHTML = "<h2>Hierarchy</h2><ul><li>" + "<span id=\"span_hier_TOP\"><button type=\"button\" onclick=\"toggleHierarchy('TOP','TOP (TOP)')\">+</button> TOP (TOP) <button type=\"button\" onclick=\"printSingleInstState('TOP')\">Print</button></span>" + "</li></ul>";
    eHier.innerHTML = "<ul><li>" + "<span id=\"span_design_hier_TOP\"><button type=\"button\" onclick=\"cycle_sim.toggleHierarchy('TOP','TOP (TOP)')\">+</button><button type=\"button\" onclick=\"cycle_sim.printSingleInstState('TOP')\">Print</button> TOP (TOP) </span>" + "</li></ul>";


    //cycle_sim.setButtonsState("elabed");
    cycle_sim.log("===Elaboration end.");
    ga('send', 'event', 'cycle_sim', 'elaborate', 'PASS');
    return true;
  },
  simTick: function () {
    var i;
    var p;
    cycle_sim.eSimTime.textContent = cycle_sim.hw.time;

    var iterCount;

    for (iterCount = 0; iterCount < cycle_sim.simTickIterations; iterCount++) {

      for (i = 0; i < cycle_sim.hw.primitives.length; i++) {
        p = cycle_sim.hw.primitives[i];
        cycle_sim.hw.blocks[p.blockName].tick(p);
      }

      for (i = 0; i < cycle_sim.hw.signals.length; i++) {
        cycle_sim.hw.signals[i].value = cycle_sim.hw.signals[i].next;
      }

      cycle_sim.hw.time += 1;
      if (cycle_sim.intervalID === undefined) {
        ga('send', 'event', 'cycle_sim', 'step');
        break;
      }
    }

    if ((cycle_sim.simCyclesPerSecond !== cycle_sim.currentCyclesPerSecond) && (cycle_sim.intervalID !== undefined)) {
      cycle_sim.simPause();
      cycle_sim.simRun();
    }
  },
  simRun: function () {
    if (cycle_sim.intervalID === undefined) {
      if (cycle_sim.hw.simState !== undefined) {
        cycle_sim.currentCyclesPerSecond = cycle_sim.simCyclesPerSecond;
        cycle_sim.intervalID = setInterval(cycle_sim.simTick, 1000 / cycle_sim.simCyclesPerSecond);
        ga('send', 'event', 'cycle_sim', 'run', 'click');
      } else {
        cycle_sim.log('ERROR: You can not run until you have compiled/elaborated successfully with the Init\\Reset button.');
      }
    }
  },
  simPause: function () {
    if (cycle_sim.intervalID !== undefined) {
      clearInterval(cycle_sim.intervalID);
      cycle_sim.intervalID = undefined;
      cycle_sim.eSimTime.textContent = cycle_sim.hw.time;
      ga('send', 'event', 'cycle_sim', 'pause', 'click');
    }
  },
  changeSimSpeed: function (direction) {
    if (direction === "+") {
      cycle_sim.speedIndex = cycle_sim.speedIndex + 1;
    } else {
      cycle_sim.speedIndex = cycle_sim.speedIndex - 1;
    }
    if (cycle_sim.speedIndex < 0) {
      cycle_sim.speedIndex = 0;
    }
    if (cycle_sim.speedIndex >= cycle_sim.speedList.length) {
      cycle_sim.speedIndex = cycle_sim.speedList.length - 1;
    }
    if (cycle_sim.speedIndex === cycle_sim.speedList.length - 1) {
      cycle_sim.speedMax = true;
      cycle_sim.simTickIterations = 100;
    } else {
      cycle_sim.speedMax = false;
      cycle_sim.simTickIterations = 1;
    }
    cycle_sim.simCyclesPerSecond = cycle_sim.speedList[cycle_sim.speedIndex];

    var eSpeed = document.getElementById("span_design_speed");
    eSpeed.textContent = cycle_sim.speedNames[cycle_sim.speedIndex];
    ga('send', 'event', 'cycle_sim', 'change_speed', cycle_sim.speedIndex);
  },
  reset: function(netlistTextArea) {
    var eText = document.getElementById(netlistTextArea);
    return cycle_sim.parseNetlist(eText.value) && cycle_sim.elaborate();
  },
  initialize: function() {
    cycle_sim.eSimTime = document.getElementById('span_design_time');
  }

};

