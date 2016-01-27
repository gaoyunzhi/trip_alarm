// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

function shouldCheckRule(rule) {
  if (!rule.enabled) {
    return false;
  }
  var day = (new Date()).getDay();
  if (rule.mode == 'weekday' && day > 5) {
    return false;
  }
  var start_time = Date.parse(moment(rule.start_time, ['h:m a', 'H:m']))
  var end_time = Date.parse(moment(rule.end_time, ['h:m a', 'H:m']))
  if (Date.now() < start_time || Date.now() > end_time) {
    return false;
  }
  return true;
}

function checkRule(rule) {
  return true; // for testing
}

// init for testing
localStorage.rules = JSON.stringify([{
  src: '245 E 40th Ave, San Mateo, CA 94403',
  des: '888 Brannan St, San Francisco, CA 94103',
  start_time: '8am',
  end_time: '11am',
  limit_time: '35',
  mode: 'weekday',
  enabled: true
}]);


function checkTrip() {
  console.log('checktrip');
  var pass = 0;
  var fail = 0;
  var rules = localStorage.rules;
  try {
    rules = JSON.parse(rules);
  } catch (e) {
    localStorage.rules = JSON.stringify([]);
  }
  if (!rules) {
    return;
  }
  for (var index = 0; index < rules.length; ++index) {
    var rule = rules[index];
    if (shouldCheckRule(rule)) {
      if (checkRule(rule)) {
        pass += 1;
      } else {
        fail += 1;
      }
    }
  }
  if (pass + fail == 0) {
    chrome.browserAction.setIcon({path:"icon_white.png"});
    return;
  } 
  if (fail == 0) {
    chrome.browserAction.setIcon({path:"icon_green.png"});
    return;
  }
  chrome.browserAction.setIcon({path:"icon_red.png"});
  return;
}

checkTrip();
// setInterval(checkTrip , 5000); // change 5000 to 300000 (5s -> 5min)
chrome.browserAction.setIcon({path:"icon_white.png"});
