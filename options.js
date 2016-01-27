// Copyright (c) 2013 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

function Rule(data) {
  var rules = document.getElementById('rules');
  this.node = document.getElementById('rule-template').cloneNode(true);
  this.node.id = 'rule' + (Rule.next_id++);
  this.node.rule = this;
  rules.appendChild(this.node);
  this.node.hidden = false;

  if (data) {
    this.getElement('src').value = data.src;
    this.getElement('des').value = data.des;
    this.getElement('start_time').value = data.start_time;
    this.getElement('end_time').value = data.end_time;
    this.getElement('limit_time').value = data.limit_time;
    this.getElement('mode').value = data.mode;
    this.getElement('enabled').checked = data.enabled;
  }

  this.getElement('enabled-label').htmlFor = this.getElement('enabled').id =
    this.node.id + '-enabled';

  this.getElement('src').onkeyup = storeRules;
  this.getElement('des').onkeyup = storeRules;
  this.getElement('start_time').onkeyup = storeRules;
  this.getElement('end_time').onkeyup = storeRules;
  this.getElement('limit_time').onkeyup = storeRules;
  this.getElement('mode').onchange = storeRules;
  this.getElement('enabled').onchange = storeRules;

  var rule = this;
  this.getElement('remove').onclick = function() {
    rule.node.parentNode.removeChild(rule.node);
    storeRules();
  };
  storeRules();
}

Rule.prototype.getElement = function(name) {
  return document.querySelector('#' + this.node.id + ' .' + name);
}

Rule.next_id = 0;

function loadRules() {
  var rules = localStorage.rules;
  try {
    JSON.parse(rules).forEach(function(rule) {new Rule(rule);});
  } catch (e) {
    localStorage.rules = JSON.stringify([]);
  }
}

function storeRules() {
  localStorage.rules = JSON.stringify(Array.prototype.slice.apply(
      document.getElementById('rules').childNodes).filter(node => node.rule).map(function(node) {
    return {src: node.rule.getElement('src').value,
            des: node.rule.getElement('des').value,
            start_time: node.rule.getElement('start_time').value,
            end_time: node.rule.getElement('end_time').value,
            limit_time: node.rule.getElement('limit_time').value,
            mode: node.rule.getElement('mode').value,
            enabled: node.rule.getElement('enabled').checked};
  }));
}

window.onload = function() {
  loadRules();
  document.getElementById('new').onclick = function() {
    new Rule();
  };
}
