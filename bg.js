// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

function hashCode(rule) {
  return JSON.stringify(rule);
}

function shouldCheckRule(rule) {
  if (!rule.enabled) {
    return false;
  }
  var day = (new Date()).getDay();
  if (rule.mode == 'weekday' && (day == 0 || day == 6)) {
    return false;
  }
  var start_time = Date.parse(moment(rule.start_time, ['h:m a', 'H:m']))
  var end_time = Date.parse(moment(rule.end_time, ['h:m a', 'H:m']))
  localStorage.checkedRule = localStorage.checkedRule  || {};
  if (rule.mode == 'onetime' && Date.now() > end_time &&
    localStorage.checkedRule[hashCode(rule)]) {
    rule.enabled = false;
    return false;
  }
  if (Date.now() < start_time || Date.now() > end_time) {
    return false;
  }
  if (rule.mode == 'onetime') {
    localStorage.checkedRule[hashCode(rule)] = true;
  }
  return true;
}

function checkRule(rule) {
  var xmlHttp = new XMLHttpRequest();
  var url = 
    "https://maps.googleapis.com/maps/api/directions/json?origin=" +
    rule.src + "&destination=" + rule.des;
  xmlHttp.open( "GET", url, false );
  xmlHttp.send( null );
  var response = JSON.parse(xmlHttp.responseText);
  if (response.routes[0].legs[0].duration.value < 
    parseInt(rule.limit_time, 10) * 60) {
    return true;
  }
  return false; 
}

// init for testing
// if (!localStorage.rules) {
//   localStorage.rules = JSON.stringify([{
//     src: '4242 S El Camino Real, San Mateo, CA 94403',
//     des: '888 Brannan St, San Francisco, CA 94103',
//     start_time: '8am',
//     end_time: '11am',
//     limit_time: '35',
//     mode: 'weekday',
//     enabled: true
//   },
//   {
//     src: '888 Brannan St, San Francisco, CA 94103',
//     des: '4242 S El Camino Real, San Mateo, CA 94403',
//     start_time: '5pm',
//     end_time: '8pm',
//     limit_time: '25',
//     mode: 'weekday',
//     enabled: true
//   },
//   {
//     src: '888 Brannan St, San Francisco, CA 94103',
//     des: '4242 S El Camino Real, San Mateo, CA 94403',
//     start_time: '1pm',
//     end_time: '8pm',
//     limit_time: '25',
//     mode: 'onetime',
//     enabled: true
//   }]);
// }

function checkTrip() {
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

// checkTrip(); // testing
setInterval(checkTrip , 300000); 
