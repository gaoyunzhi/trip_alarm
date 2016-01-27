// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

function matches(rule, item) {
  if (rule.matcher == 'js')
    return eval(rule.match_param);
  if (rule.matcher == 'hostname') {
    var link = document.createElement('a');
    link.href = item.url.toLowerCase();
    var host = (rule.match_param.indexOf(':') < 0) ? link.hostname : link.host;
    return (host.indexOf(rule.match_param.toLowerCase()) ==
            (host.length - rule.match_param.length));
  }
  if (rule.matcher == 'default')
    return item.filename == rule.match_param;
  if (rule.matcher == 'url-regex')
    return (new RegExp(rule.match_param)).test(item.url);
  if (rule.matcher == 'default-regex')
    return (new RegExp(rule.match_param)).test(item.filename);
  return false;
}

chrome.browserAction.setIcon({path:"icon_white.png"});

var checkTrip = function() {
  console.log('checktrip');
  var pass = 0;
  var fail = 0;
  var rules = localStorage.rules;
  try {
    rules = JSON.parse(rules);
  } catch (e) {
    localStorage.rules = JSON.stringify([]);
  }
  for (var index = 0; index < rules.length; ++index) {
    var rule = rules[index];
    if (shouldCheckRule(rule)) {
      if checkRule(rule) {
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
    chrome.browserAction.setIcon({path:"icon_red.png"});
    return;
  }
  chrome.browserAction.setIcon({path:"icon_green.png"});
  return;
}

setInterval(checkTrip , 5000); // change 5000 to 300000 (5s -> 5min)
