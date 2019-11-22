import {getCredentials} from './CREDENTIALS'; 

var credentials = getCredentials();
console.error(credentials);

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
    rule.src + "&destination=" + rule.des; + "&key=" + credentials.key;
  xmlHttp.open( "GET", url, false );
  xmlHttp.send( null );
  var response = JSON.parse(xmlHttp.responseText);
  console.error(url);
  if (response.routes[0].legs[0].duration.value < 
    parseInt(rule.limit_time, 10) * 60) {
    return true;
  }
  return false; 
}

console.log('here00');
// init for testing
if (!localStorage.rules) {
  localStorage.rules = JSON.stringify([{
    src: '4242 S El Camino Real, San Mateo, CA 94403',
    des: '888 Brannan St, San Francisco, CA 94103',
    start_time: '3am',
    end_time: '11am',
    limit_time: '35',
    mode: 'weekday',
    enabled: true
  }]);
}
console.log('here01');

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
      console.log('here1');
      if (checkRule(rule)) {
        pass += 1;
      } else {
        fail += 1;
      }
      console.log('here5');
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

console.log('herea');
checkTrip(); // testing
console.log('hereb');
setInterval(checkTrip , 300000); 
