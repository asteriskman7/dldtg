/*dld.js
   Author: asterisk_man
   Date: 11 December 2013
   Description: javascript for Digital Logic Design (The Game)
                This file copyright asterisk_man 2014. All rights reserved
*/
/*global cycle_sim: false, dld_designs: false, dld_designs_display_order: false, FileReader: false, ga: false */
'use strict';

var dld = {
  dld_version: 'ver_20140506.1',
  state: {},
  curTab: 'Docs',
  lastTick: undefined,
  moving: undefined,

  init: function() {
    console.log('dld.init');

    //remove unsupported message
    document.getElementById('div_unsupported').style.display = 'none';

    //initialize state and then load from localStorage
    dld.loadDefaultState();
    dld.loadFromLocalStorage();

    //initialize simulator
    cycle_sim.initialize();
    cycle_sim.logElement = document.getElementById('textarea_design_log');
    cycle_sim.testFinished = dld.testFinished;

    //set up popup ok button
    document.getElementById('button_popup_ok').onclick = dld.popupOk;

    //set up tab selection buttons
    document.getElementById('button_tab_docs').onclick = function() {dld.changeTab('docs', true); };
    document.getElementById('button_tab_mine').onclick = function() {dld.changeTab('mine', true); };
    document.getElementById('button_tab_design').onclick = function() {dld.changeTab('design', true); };
    document.getElementById('button_tab_business').onclick = function() {dld.changeTab('business', true); };
    document.getElementById('button_tab_upgrades').onclick = function() {dld.changeTab('upgrades', true); };
    document.getElementById('button_tab_info').onclick = function() {dld.changeTab('info', true); };
    dld.changeTab('docs', false);

    //set up document tab
    document.getElementById('select_docs').onchange = dld.changeDoc;
    dld.showDoc('Introduction');
    dld.changeDoc(true);
    dld.initPopupButtons();

    //set up mine tab
    document.getElementById('button_mine').onclick = dld.mineClick;
    //prevent holding enter from mining
    document.getElementById('button_mine').onkeypress = function (e) {e.preventDefault(); };

    //set up design tab
    document.getElementById('button_design_init').onclick = function() {cycle_sim.reset('textarea_design_netlist'); };
    document.getElementById('button_design_run').onclick = cycle_sim.simRun;
    document.getElementById('button_design_pause').onclick = cycle_sim.simPause;
    document.getElementById('button_design_step').onclick = cycle_sim.simTick;
    document.getElementById('button_design_speed+').onclick = function() {cycle_sim.changeSimSpeed('+'); };
    document.getElementById('button_design_speed-').onclick = function() {cycle_sim.changeSimSpeed('-'); };
    document.getElementById('button_design_load_test').onclick = dld.loadTest;
    document.getElementById('button_design_load_netlist').onclick = dld.loadNetlistFile;
    document.getElementById('button_design_clear_netlist').onclick = dld.clearNetlist;
    document.getElementById('checkbox_design_graphs').onchange = function() {cycle_sim.graphsEnabled = this.checked; ga('send', 'event', 'design', 'enable_graphs', this.checked.toString()); };

    document.getElementById('span_design_rDesigns').innerHTML = dld.designListToSelectHTML();
    document.getElementById('select_design_rDesigns').onchange = dld.loadDesignDesc;

    document.getElementById('textarea_design_netlist').addEventListener('keydown', dld.netlistKeyHandler, false);

    //set up business tab
    dld.initBusinessBlueprints();
    dld.initBusinessCompletedDesigns();

    //set up upgrades tab
    dld.initUpgrades();

    //set up info tab
    document.getElementById('button_info_save').onclick = dld.saveClick;
    document.getElementById('button_info_reset').onclick = dld.reset;

    //start periodic updates every 300ms
    setInterval(dld.tick, 300);

    //start automatic saves every 30 seconds
    setInterval(dld.saveToLocalStorage, 30000);

    if (dld.state.firstVisit) {
      dld.state.firstVisit = false;
      dld.showPopup("Welcome! Please read the introduction document to get started and then proceed to Tutorial 1. ");
    }
    ga('send', 'event', 'init', 'PASS');

  },


  loadDefaultState: function() {
    dld.state = {
      si: 0,
      autoMineThousandths: 0,
      siPerAttempt: 1,
      siPerNand: 10,
      autoMiners: 0,
      autoMinerRate: 0.01,
      saleScalingFactor: 1,
      cash: 0,
      rDesigns: [],
      cDesigns: [],
      upgrades: [],
      mineClicks: 0,
      sellClicks: 0,
      totalMined: 0,
      totalSold: 0,
      firstVisit: true
    };
  },

  loadFromLocalStorage: function() {
    var key;
    var loadedState = JSON.parse(localStorage.getItem('state'));
    //apply all loaded state to dld.state which has been initialized with loadDefaultState()
    for (key in loadedState) {
      dld.state[key] = loadedState[key];
    }
  },

  saveToLocalStorage: function() {
    var jstate = JSON.stringify(dld.state);
    var localStorageMax = 5 * Math.pow(2, 20);
    if (jstate.length >= localStorageMax) {
      console.log('Attempting to write ' + jstate.length + 'B to localStorage which is probably not large enough to handle it.');
    }
    localStorage.clear();
    localStorage.setItem('state', jstate);
  },

  saveClick: function() {
    dld.saveToLocalStorage();
    ga('send', 'event', 'info', 'save', 'click');
  },

  reset: function() {
    if (window.confirm('Reset all game data?') === true) {
      localStorage.clear();
      dld.loadDefaultState();
      dld.init();
      ga('send', 'event', 'info', 'reset', 'click');
    }
  },

  showPopup: function(msg) {
    document.getElementById('div_popup_text').innerHTML = msg;
    document.getElementById('div_popup').style.visibility = 'visible';
  },

  popupOk: function() {
    document.getElementById('div_popup').style.visibility = 'hidden';
  },

  createDialog: function(name, title, html) {
    if (document.getElementById(name) !== null) {
      return;
    }

    ga('send', 'event', 'dialog', 'create', title);

    var body = document.getElementById('body');
    var divDialog = document.createElement('div');
    divDialog.classList.add('div_dialog');
    divDialog.id = name;

    var divContent = document.createElement('div');
    var titleBar = document.createElement('div');
    var titleHTML;
    titleBar.classList.add('div_dialogTitle');

    titleHTML = title;
    titleHTML += '<button type="button" class="button_dialog_close" onclick="document.getElementById(\'';
    titleHTML += name;
    titleHTML += '\').parentNode.removeChild(document.getElementById(\'';
    titleHTML += name;
    titleHTML += '\'));">X</button>';
    titleBar.innerHTML = titleHTML;

    dld.moving = undefined;
    titleBar.onmousedown = function(e) {dld.moving = this.parentElement; };
    titleBar.onmouseup = function(e) {dld.moving = undefined; };
    document.onmousemove = function(e) {if (dld.moving !== undefined) {dld.moving.style.top = (e.pageY - 20) + 'px'; dld.moving.style.left = (e.pageX - 20) + 'px'; } };

    divDialog.appendChild(titleBar);

    divContent.classList.add('div_dialogContent');

    divContent.insertAdjacentHTML('beforeend', html);

    divDialog.appendChild(divContent);

    body.appendChild(divDialog);
  },

  initPopupButtons: function() {
    var popoutButtons = document.getElementsByClassName('button_popout');
    var i;
    var button;
    var popoutDivId;
    var popoutDiv;
    var popoutTitle;
    var dialogName;
    for (i = 0; i < popoutButtons.length; i++) {
      button = popoutButtons.item(i);
      popoutDivId = button.dataset.popout_div;
      if (popoutDivId !== undefined) {
        popoutDiv = document.getElementById(popoutDivId);
        if (popoutDiv !== undefined) {
          popoutTitle = popoutDiv.dataset.title;
          if (popoutTitle !== undefined) {
            dialogName = 'div_dialog_' + popoutDivId;
            button.onclick = (function() {
              var n = dialogName;
              var t = popoutTitle;
              var h = popoutDiv.innerHTML;
              return function() {dld.createDialog(n, t, h); };
            }());
          }
        }
      }
    }

  },

  changeTab: function(newTab, userRequested) {
    var i;
    //change for IE8 compatibility
    //var tabs = document.getElementsByClassName('div_tab');
    var tabs = document.querySelectorAll('.div_tab');
    for (i = 0; i < tabs.length; i++) {
      tabs.item(i).style.display = 'none';
    }
    document.getElementById('div_tab_' + newTab).style.display = 'block';
    dld.curTab = newTab;
    if (userRequested) {
      ga('send', 'event', 'changeTab', 'change', newTab);
    }
  },

  showDoc: function(newDoc) {
    dld.changeTab('docs', false);
    document.getElementById('select_docs').value = newDoc;
    dld.changeDoc(true);
  },

  changeDoc: function(notUserRequested) {
    var i;
    var seldoc = document.getElementById('select_docs').value;
    //change for IE8 compatibility
    //var docs = document.getElementsByClassName('div_docs');
    var docs = document.querySelectorAll('.div_docs');
    for (i = 0; i < docs.length; i++) {
      docs.item(i).style.display = 'none';
    }
    if (notUserRequested !== true) {
      ga('send', 'event', 'changeDoc', 'show', seldoc);
    }
    document.getElementById('div_docs_' + seldoc).style.display = 'block';
  },

  designListToSelectHTML: function() {
    var html = '<select size="10" id="select_design_rDesigns" class="select_designs">';
    var i;
    var designIndex;
    var designSize;
    var designIndicator;

    for (designIndex = 0; designIndex < dld_designs_display_order.length; designIndex++) {
      i = dld_designs_display_order[designIndex];
      if (dld.state.rDesigns[i] !== undefined && dld.state.rDesigns[i] !== null) {
        designSize = dld.state.cDesigns[i];
        if (designSize === undefined || designSize === null) {
          designSize = ' (INCOMPLETE)';
          designIndicator = '';
        } else {
          if (designSize === dld_designs[i].expectedNands) {
            designIndicator = ' =';
          } else if (designSize > dld_designs[i].expectedNands) {
            designIndicator = ' >';
          } else {
            designIndicator = ' < WOW';
          }
          designSize = ' (' + designSize + ')';
        }
        html += '<option value="' + i + '">' + dld_designs[i].name + designSize + designIndicator + '</option>\n';
      }
    }
    html += '</select>';

    return html;
  },

  loadDesignDesc: function() {
    var eSel = document.getElementById('select_design_rDesigns');
    if (eSel.value.length > 0) {
      var eDesc = document.getElementById('div_design_description');
      eDesc.innerHTML = dld_designs[parseInt(eSel.value, 10)].desc;
    }
  },

  loadTest: function() {
    var eSel = document.getElementById('select_design_rDesigns');
    var eText = document.getElementById('textarea_design_netlist');
    var designNum;
    if (eSel.value.length > 0) {
      designNum = parseInt(eSel.value, 10);
      eText.value = dld_designs[designNum].netlist;
      ga('send', 'event', 'design', 'load', dld_designs[designNum].name);
    } else {
      cycle_sim.log('ERROR: You must select a design before you can load a test.');
      ga('send', 'event', 'design', 'load', 'FAIL');
    }
  },

  tick: function() {
    var curTime = new Date();
    if (dld.lastTick !== undefined) {
      var deltaMs = curTime.getTime() - dld.lastTick.getTime();
      //var deltaTime = deltaTime / 1000.0;
      var autoMineSize;
      var remainingThousandths;

      //update Si due to auto miners
      dld.state.autoMineThousandths += Math.round(dld.state.autoMiners * dld.state.autoMinerRate * deltaMs);
      //autoMineSize = (dld.state.autoMiners * dld.state.autoMinerRate * deltaTime);
      if (dld.state.autoMineThousandths >= 10) {
        remainingThousandths = dld.state.autoMineThousandths % 10;
        autoMineSize = (dld.state.autoMineThousandths - remainingThousandths) / 1000.0;
        dld.state.autoMineThousandths = remainingThousandths;
        dld.state.si = dld.roundDecimal(dld.state.si + autoMineSize, 2);

        dld.state.totalMined = dld.roundDecimal(dld.state.totalMined + autoMineSize, 2);
      }
    }
    dld.lastTick = curTime;

    dld.updateDisplay();
  },

  roundDecimal: function(f, digits) {
    var factor = Math.pow(10, digits);
    return parseFloat((Math.round(f * factor) / factor).toFixed(digits));
  },

  updateDisplay: function() {
    //var siCount = (Math.round(dld.state.si * 100) / 100).toFixed(2);
    var siCount = dld.roundDecimal(dld.state.si, 2).toFixed(2);
    var cashCount = dld.state.cash;
    document.getElementById('span_si_count').innerHTML = siCount;
    document.getElementById('span_cash_count').innerHTML = cashCount;

    switch (dld.curTab) {
    case 'docs':
      break;
    case 'mine':
      document.getElementById('span_mine_si_count').innerHTML = siCount;
      document.getElementById('span_mine_skill').innerHTML = dld.state.siPerAttempt;
      document.getElementById('span_mine_autoMiner_count').innerHTML = dld.state.autoMiners;
      document.getElementById('span_mine_autoMiner_attempt_rate').innerHTML = dld.state.autoMinerRate;
      document.getElementById('span_mine_autoMiner_si_rate').innerHTML = dld.roundDecimal(dld.state.autoMiners * dld.state.autoMinerRate, 2);
      break;
    case 'design':
      break;
    case 'business':
      dld.updateBusinessBlueprints();
      dld.updateBusinessCompletedDesigns();
      break;
    case 'upgrades':
      dld.updateUpgrades();
      break;
    case 'info':
      document.getElementById('span_info_version').innerHTML = dld.dld_version;
      document.getElementById('span_info_mine_clicks').innerHTML = dld.state.mineClicks;
      document.getElementById('span_info_sell_clicks').innerHTML = dld.state.sellClicks;
      document.getElementById('span_info_total_mined').innerHTML = dld.state.totalMined.toFixed(2);
      document.getElementById('span_info_total_sold').innerHTML = dld.state.totalSold;
      document.getElementById('span_info_completed_designs').innerHTML = dld.state.cDesigns.reduce(function(p, c) {return p + ((c !== undefined) && (c !== null)); }, 0);
      break;
    }
  },

  //mine functions
  mineClick: function() {
    dld.state.si = dld.roundDecimal(dld.state.si + dld.state.siPerAttempt, 2);
    dld.state.mineClicks += 1;
    dld.state.totalMined = dld.roundDecimal(dld.state.totalMined + dld.state.siPerAttempt, 2);
    dld.updateDisplay();
    if (dld.state.mineClicks < 1000) {
      if (dld.state.mineClicks % 100 === 0) {
        ga('send', 'event', 'mine', 'click', 'button', 100);
      }
    } else {
      if (dld.state.mineClicks % 1000 === 0) {
        ga('send', 'event', 'mine', 'click', 'button', 1000);
      }
    }
  },

  //design functions
  loadNetlistFile: function() {
    var eFileSelect = document.getElementById('input_design_netlist');
    var file = eFileSelect.files[0];
    if (file) {
      var reader = new FileReader();
      reader.onload = function(e) {
        //log("Loaded " + file.name + " (" + file.size + "b)");
        var data = e.target.result;
        var eNetlist = document.getElementById('textarea_design_netlist');
        //eNetlist.value = "#\\/---Loaded from " + file.name + " ---\n" + data + "\n#/\\---Loaded from " + file.name + " ---\n" + eNetlist.value;
        eNetlist.value = data + "\n#/\\---Loaded from " + file.name + " ---\n" + eNetlist.value;
      };

      reader.readAsText(file);
      ga('send', 'event', 'design', 'load_netlist', 'SUCCESS');
    } else {
      cycle_sim.log('ERROR: You must select a file before it can be loaded.');
      ga('send', 'event', 'design', 'load_netlist', 'FAIL');
    }
  },

  clearNetlist: function() {
    document.getElementById('textarea_design_netlist').value = '';
    ga('send', 'event', 'design', 'clear_netlist', 'SUCCESS');
  },

  netlistKeyHandler: function(e) {
    var TABKEY = 9;
    var oldSelStart;
    if (e.keyCode === TABKEY) {
      oldSelStart = this.selectionStart;
      this.value = this.value.substr(0, this.selectionStart) + "\t" + this.value.substr(this.selectionEnd, this.value.length);
      this.selectionStart = oldSelStart + 1;
      this.selectionEnd = oldSelStart + 1;
      e.preventDefault();
    }
  },

  testFinished: function(testNumber) {
    if (testNumber >= 0) {
      dld.updateDesigns(testNumber, cycle_sim.nandCount);
    }
  },

  updateDesigns: function(testNumber, nandCount) {
    //if the test hasn't already been purchased don't update the design
    if (dld.state.rDesigns[testNumber] !== true) {
      cycle_sim.log('ERROR: A test passed but hasn\'t been purchased yet. Are you cheating??');
      return;
    }

    if (dld.state.cDesigns[testNumber] === undefined || dld.state.cDesigns[testNumber] === null) {
      dld.state.cDesigns[testNumber] = nandCount;
    } else {
      if (dld.state.cDesigns[testNumber] > nandCount) {
        dld.state.cDesigns[testNumber] = nandCount;
      }
    }

    //update design select box
    document.getElementById('span_design_rDesigns').innerHTML = dld.designListToSelectHTML();
    document.getElementById('select_design_rDesigns').onchange = dld.loadDesignDesc;

    //update business available choices?
    dld.initBusinessCompletedDesigns();
    //update upgrade available choices?
  },

  initBusinessBlueprints: function() {
    var i;
    var eul = document.getElementById('ul_business_research');
    var html = '';
    var designIndex;

    for (designIndex = 0; designIndex < dld_designs_display_order.length; designIndex++) {
      i = dld_designs_display_order[designIndex];
      html += '<li class="li_business_list"><span class="span_business_name">';
      html += dld_designs[i].name;
      html += '</span><button type="button" class="button_business_purchase" id="button_business_research_';
      html += i;
      html += '" onclick="dld.purchaseBlueprints(' + i + ');" >';
      html += '</button>Sells for $';
      html += dld_designs[i].price;
      html += '</li>\n';
    }

    eul.innerHTML = html;
  },

  updateBusinessBlueprints: function() {
    var i;
    var eb;
    var buttonText;
    var buttonDisabled;
    var designIndex;

    for (designIndex = 0; designIndex < dld_designs_display_order.length; designIndex++) {
      i = dld_designs_display_order[designIndex];
      eb = document.getElementById('button_business_research_' + i);
      if (dld.state.rDesigns[i] !== undefined && dld.state.rDesigns[i] !== null) {
        buttonText = 'Already purchased';
        buttonDisabled = true;
      } else {
        buttonDisabled = dld.state.cash < dld_designs[i].cost;
        buttonText = 'Buy for $' + dld_designs[i].cost;
      }

      //only change it if it really is a change. this may help the multiple clicks issue
      if (eb.textContent !== buttonText) {
        eb.textContent = buttonText;
      }
      if (eb.disabled !== buttonDisabled) {
        eb.disabled = buttonDisabled;
      }
    }
  },

  floatToCash: function(f) {
    return Math.round(f);
  },

  floatToCash2: function(f) {
    return f.toFixed(2);
  },

  initBusinessCompletedDesigns: function() {
    var i;
    var eul = document.getElementById('ul_business_sale');
    var html = '';
    var siCost;
    var designIndex;
    var nandCount;

    for (designIndex = 0; designIndex < dld_designs_display_order.length; designIndex++) {
      i = dld_designs_display_order[designIndex];
      nandCount = dld.state.cDesigns[i];
      if (nandCount !== undefined && nandCount !== null) {
        siCost = nandCount * dld.state.siPerNand;
        html += '<li class="li_business_list"><span class="span_business_name">';
        html += dld_designs[i].name;
        html += '</span><button type="button" class="button_business_purchase" id="button_business_sale_';
        html += i;
        html += '" onclick="dld.sellDesign(' + i + ');">Sell for $';
        html += dld.floatToCash(dld_designs[i].price * dld.state.saleScalingFactor);
        html += '</button>Costs <span id="span_business_sale_cost_';
        html += i;
        html += '">';
        html += siCost;
        html += '</span> Si ($<span id="span_business_sale_cps_';
        html += i;
        html += '">?</span>/Si)</li>\n';
      }
    }

    eul.innerHTML = html;
  },

  updateBusinessCompletedDesigns: function() {
    var i;
    var eb;
    var es;
    var ecps;
    var siCost;
    var designIndex;
    var nandCount;
    var price;
    var buttonDisabled;
    var priceText;
    var cps;

    for (designIndex = 0; designIndex < dld_designs_display_order.length; designIndex++) {
      i = dld_designs_display_order[designIndex];
      nandCount = dld.state.cDesigns[i];
      if (nandCount !== undefined && nandCount !== null) {
        siCost = nandCount * dld.state.siPerNand;
        eb = document.getElementById('button_business_sale_' + i);
        es = document.getElementById('span_business_sale_cost_' + i);
        buttonDisabled = siCost > dld.state.si;

        price = dld.floatToCash(dld_designs[i].price * dld.state.saleScalingFactor);
        priceText = 'Sell for $' + price;
        ecps = document.getElementById('span_business_sale_cps_' + i);
        cps = dld.floatToCash2(price / siCost);

        if (eb.disabled !== buttonDisabled) {
          eb.disabled = buttonDisabled;
        }
        if (eb.textContent !== priceText) {
          eb.textContent = priceText;
        }
        if (es.innerHTML !== siCost) {
          es.innerHTML = siCost;
        }
        if (ecps.innerHTML !== cps) {
          ecps.innerHTML = cps;
        }
      }
    }
  },

  purchaseBlueprints: function(designIndex) {
    var designCost = dld_designs[designIndex].cost;
    if (dld.state.cash >= designCost) {
      dld.state.cash -= designCost;
      dld.state.rDesigns[designIndex] = true;
      dld.updateBusinessBlueprints();
      document.getElementById('span_design_rDesigns').innerHTML = dld.designListToSelectHTML();
      document.getElementById('select_design_rDesigns').onchange = dld.loadDesignDesc;
      ga('send', 'event', 'blueprint', 'buy', dld_designs[designIndex].name);
    }
  },

  sellDesign: function(designIndex) {
    var siCost = dld.state.cDesigns[designIndex] * dld.state.siPerNand;
    var sellPrice;
    if (siCost <= dld.state.si) {
      dld.state.si = dld.roundDecimal(dld.state.si - siCost, 2);
      sellPrice = dld.floatToCash(dld_designs[designIndex].price * dld.state.saleScalingFactor);
      dld.state.totalSold += sellPrice;
      dld.state.sellClicks += 1;
      dld.state.cash += sellPrice;
      dld.updateDisplay();
    }
  },

  /*
  upgrades: [
    {initialPrice: 10,   desc: 'Increase Si/mining attempt',           stateVar: 'siPerAttempt',      op: '*', opVal: 1.5, scalePrice: 1.15, round: 2, maxLevel: 100},
    {initialPrice: 10,   desc: 'Increase auto-miner count',            stateVar: 'autoMiners',        op: '+', opVal: 1,   scalePrice: 1.5,  round: 0, maxLevel: 100},
    {initialPrice: 100,  desc: 'Increase auto-miner attempts/s',       stateVar: 'autoMinerRate',     op: '*', opVal: 1.5, scalePrice: 1.15, round: 2, maxLevel: 100},
    {initialPrice: 100,  desc: 'Decrease Si/NAND',                     stateVar: 'siPerNand',         op: '*', opVal: 0.9, scalePrice: 1.15, round: 2, maxLevel: 100},
    {initialPrice: 100,  desc: 'Increase completed design sale price', stateVar: 'saleScalingFactor', op: '*', opVal: 1.5, scalePrice: 1.5,  round: 2, maxLevel: 100}
    //{initialPrice: 100,  desc: 'Increase simulator max speed',         stateVar: '',                  op: '+', opVal: 1,   scalePrice: 2.0,  round: 0, maxLevel: 5}
  ],
  */
  upgrades: [
    {initialPrice: 100,    desc: 'Increase Si/mining attempt',           stateVar: 'siPerAttempt',      op: '+', opVal: 0.1,  scalePrice: 1.15, round: 2, maxLevel: 100},
    {initialPrice: 1000,   desc: 'Increase auto-miner count',            stateVar: 'autoMiners',        op: '+', opVal: 1,    scalePrice: 1.15, round: 0, maxLevel: 100},
    {initialPrice: 1000,   desc: 'Increase auto-miner attempts/s',       stateVar: 'autoMinerRate',     op: '+', opVal: 0.01, scalePrice: 1.15, round: 2, maxLevel: 100},
    {initialPrice: 10000,  desc: 'Decrease Si/NAND',                     stateVar: 'siPerNand',         op: '+', opVal: -0.2, scalePrice: 1.15, round: 2, maxLevel: 45},
    {initialPrice: 10000,  desc: 'Increase completed design sale price', stateVar: 'saleScalingFactor', op: '+', opVal: 0.1,  scalePrice: 1.15, round: 2, maxLevel: 100}
    //{initialPrice: 100,  desc: 'Increase simulator max speed',         stateVar: '',                  op: '+', opVal: 1,   scalePrice: 2.0,  round: 0, maxLevel: 5}
  ],

  initUpgrades: function() {
    var eul = document.getElementById('ul_upgrades_list');
    var html = '';
    var i;
    var upgradeCost;
    var upgradeTimes;

    for (i = 0; i < dld.upgrades.length; i++) {
      upgradeTimes = dld.state.upgrades[i];
      if (upgradeTimes === undefined || upgradeTimes === null) {
        upgradeTimes = 0;
      }
      upgradeCost = Math.round(dld.upgrades[i].initialPrice * Math.pow(dld.upgrades[i].scalePrice, upgradeTimes));

      html += '<li class="li_upgrades_list"><button type="button" class="button_upgrades_purchase" id="button_upgrades_purchase_';
      html += i;
      html += '" onclick="dld.buyUpgrade(';
      html += i;
      html += ');">Buy for $';
      html += dld.floatToCash(upgradeCost);
      html += '</button>';
      html += dld.upgrades[i].desc;
      html += ' (';
      html += '<span id="span_upgrades_curVal_';
      html += i;
      html += '"></span>';
      html += ' => ';
      html += '<span id="span_upgrades_nextVal_';
      html += i;
      html += '"></span>';
      html += ')';
      html += '</li>\n';
    }

    eul.innerHTML = html;
  },

  updateUpgrades: function() {
    var i;
    var eb;
    var upgradeCost;
    var curLevel;
    var buttonDisabled;
    var buttonText;
    var scv;
    var snv;

    for (i = 0; i < dld.upgrades.length; i++) {
      eb = document.getElementById('button_upgrades_purchase_' + i);
      scv = document.getElementById('span_upgrades_curVal_' + i);
      snv = document.getElementById('span_upgrades_nextVal_' + i);

      scv.innerHTML = dld.state[dld.upgrades[i].stateVar];


      snv.innerHTML = dld.getNextUpgradeVal(i);

      curLevel = dld.state.upgrades[i];
      if (curLevel === undefined || curLevel === null) {
        curLevel = 0;
      }
      upgradeCost = Math.round(dld.upgrades[i].initialPrice * Math.pow(dld.upgrades[i].scalePrice, curLevel));
      if (curLevel < dld.upgrades[i].maxLevel) {
        buttonDisabled = upgradeCost > dld.state.cash;
        buttonText = 'Buy for $' + upgradeCost;
      } else {
        buttonDisabled = true;
        buttonText = 'At max level';
      }
      if (eb.disabled !== buttonDisabled) {
        eb.disabled = buttonDisabled;
      }
      if (eb.textContent !== buttonText) {
        eb.textContent = buttonText;
      }
    }

  },

  getNextUpgradeVal: function(index) {
    var curLevel = dld.state.upgrades[index];
    var newVal;
    if (curLevel === undefined || curLevel === null) {
      curLevel = 0;
    }

    /*
    if ((curLevel + 1) > dld.upgrades[index].maxLevel) {
      return 'MAX';
    } else if (dld.upgrades[index].op === '+') { */
    if (dld.upgrades[index].op === '+') {
      newVal = dld.state[dld.upgrades[index].stateVar] + dld.upgrades[index].opVal;
      return parseFloat(newVal.toFixed(dld.upgrades[index].round));
    } else {
      newVal = dld.state[dld.upgrades[index].stateVar] * dld.upgrades[index].opVal;
      return parseFloat(newVal.toFixed(dld.upgrades[index].round));
    }
  },

  buyUpgrade: function(index) {
    var curLevel = dld.state.upgrades[index];
    var upgradePrice;

    if (curLevel === undefined || curLevel === null) {
      curLevel = 0;
    }

    upgradePrice = Math.round(dld.upgrades[index].initialPrice * Math.pow(dld.upgrades[index].scalePrice, curLevel));
    if ((upgradePrice <= dld.state.cash) && (curLevel < dld.upgrades[index].maxLevel)) {
      dld.state.cash = dld.state.cash - upgradePrice;
      dld.state.upgrades[index] = curLevel + 1;
      dld.state[dld.upgrades[index].stateVar] = dld.getNextUpgradeVal(index);
      /*
      if (dld.upgrades[index].op === '+') {
        dld.state[dld.upgrades[index].stateVar] += dld.upgrades[index].opVal;
      } else {
        dld.state[dld.upgrades[index].stateVar] *= dld.upgrades[index].opVal;
      }
      */
      dld.updateUpgrades();
      ga('send', 'event', 'upgrades', 'buy', index.toString());
    }

  }

};

var gaErrorReportsRemaining = 5;
window.onerror = function(errorMsg, url, lineNumber) {
  console.log("ERROR\nMSG: " + errorMsg + "\nURL: " + url + "\nLINE: " + lineNumber);

  //event action and label have a max of 500 bytes
  var version;
  if ((window.dld === "undefined") || (window.dld.dld_version === "undefined")) {
    version = 'ver_ERR:';
  } else {
    version = dld.dld_version + ':';
  }
  var action = version + (url + ':' + lineNumber).substr(-500 + version.length);
  var label = errorMsg.substr(0, 500);

  if (gaErrorReportsRemaining > 0) {
    ga('send', 'event', 'error', action, label);
    console.log('Sent as "' + action.substr(0, 500) + '", "' + label.substr(0, 500) + '"');
    gaErrorReportsRemaining -= 1;
  } else {
    console.log('Max GA reports reached. No further reports will be sent.');
  }

  return false;
};

//window.onload = function() {
//  dld.init();
//};

if (window.addEventListener === undefined) {
  ga('send', 'event', 'init', 'FAIL');
} else {
  window.addEventListener('load', dld.init, false);
}
