// load from credentials.js
var credentials = {
  "key":""
};

var INTERVAL = 300000;
var user_pos = undefined;

function saveLoc(position) {
  user_pos = position;
  checkTrip();
}

navigator.geolocation.getCurrentPosition(saveLoc);

function hashCode(rule) {
  return JSON.stringify(rule);
}

function getDuration(src, des) {
  var xmlHttp = new XMLHttpRequest();
  var url = 
    "https://maps.googleapis.com/maps/api/directions/json?origin=" +
    src + "&destination=" + des + "&key=" + credentials['key'];
  xmlHttp.open( "GET", url, false );
  xmlHttp.send( null );
  var response = JSON.parse(xmlHttp.responseText);
  return response.routes[0].legs[0].duration.value;
}

function getPosString(pos) {
  return pos.coords.latitude.toString() + ',' + pos.coords.longitude.toString()
}

function isEnabled(smart_loc) {
  return smart_loc === "true" || smart_loc === true;
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
  if (user_pos) {
    // user no longer in the rule.src, don't show signal
    if (isEnabled(localStorage.smart_loc) && getDuration(getPosString(user_pos), rule.src) > 10*60) {
      return false;
    }
  }
  return true;
}

function checkRule(rule) {
  if (getDuration(rule.src, rule.des) < 
    parseInt(rule.limit_time, 10) * 60) {
    return true;
  }
  return false; 
}

// init for testing
if (!localStorage.rules) {
  localStorage.rules = JSON.stringify([{
    src: '240 E 40th Ave, San Mateo, CA 94403',
    des: '1170 Bordeaux Dr, Sunnyvale, CA 94089',
    start_time: '6pm',
    end_time: '8pm',
    limit_time: '35',
    mode: 'weekday',
    enabled: true
  }]);
}

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

function checkLoc() {
  navigator.geolocation.getCurrentPosition(saveLoc);
}

checkLoc();
setInterval(checkTrip, INTERVAL); 
setInterval(checkLoc, INTERVAL); 
