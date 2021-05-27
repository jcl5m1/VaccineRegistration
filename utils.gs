//helper function that prints the calling line number.  it also auto converts objects with JSON.stringify
function debug(message) {
  var line = getCallerLine(getErrorObject())
  if (typeof message === 'object' && message !== null)
    message = JSON.stringify(message);
  console.log(line + ': ' + message);
}

function getCallerLine(err) {
  var caller_line = err.stack.split("\n")[2];
  var index = caller_line.indexOf("at ");
  return caller_line.slice(index + 3, caller_line.length);
}

function isDict(v) {
  return typeof v === 'object' && v !== null && !(v instanceof Array) && !(v instanceof Date);
}

function formatIfURL(data) {
  if ((data == null) || (typeof data == undefined))
    return data;

  if (data.indexOf("http") != 0)
    return data;

  return "<a href='" + data + "'>" + data + "</a>";
}

//convert 24 time to 12hr with AM/PM
function convert24to12hr(time){
  var hrs = parseInt(time.split(':')[0]);
  var suffix = (hrs >= 12) ? " PM" : " AM";
  hrs = (hrs >= 13) ? hrs-12: hrs;
  return '' + hrs + ':' + time.split(':')[1] + suffix;
}

//convert yyyy-mm-dd to yyyy-MMM-dd
function convertDateToString(date){
  var parts = date.split('-')
  var year = parts[0];
  var month = parseInt(parts[1])-1;
  var day = parts[2];
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return year + '-' + months[month] + '-'+day;
}

// convert variables,array, and dict to html table
function formatToHTML(data) {
  var i = 0;
  if (isDict(data)) {
    html = "<table border=0 width=992>";
    for (var key in data) {
      var color = (i % 2 == 0) ? '#eee' : '#fff';
      i += 1;
      html += "<tr bgcolor='" + color + "'>";
      html += "<td><b><p>" + key + ":</p></b></td>";
      html += "<td><p>" + formatIfURL(data[key]) + "</p></td>";
      html += "</tr>";
    }
    html += "</table>";
    return html;
  }
  if (Array.isArray(data)) {
    html = "<table border=0 style='width: 100%>";
    for (var i = 0; i < data.length; i++) {
      var color = (i % 2 == 0) ? '#eee' : '#fff';
      html += "<tr bgcolor='" + color + "'>";
      html += "<td><b><p>" + i + ":</p></b></td>";
      html += "<td><p>" + formatIfURL(data[i]) + "</p></td>";
      html += "</tr>";
    }
    html += "</table>";
    return html;
  }
  return formatIfURL(data);
}

function getErrorObject() {
  try { throw Error('') } catch (err) { return err; }
}

function getScriptUrl() {
  return ScriptApp.getService().getUrl();
}


function testUserEmail() {
  debug(getUserEmail())
}


// imports html file and evaluates with Appscript using optional parameters
function importHTML(filename, params) {
  var htmlTemplate = HtmlService.createTemplateFromFile(filename);
  if(params != null)
    htmlTemplate.dataFromServerTemplate = params
  return htmlTemplate.evaluate().getContent();
}

function importNavbar(active) {
  var t = HtmlService.createTemplateFromFile('navbar.html');

  t.active = active;
  return t.evaluate().getContent();
}

function getUserEmail() {
  email = Session.getActiveUser().getEmail()
  if (email == "")
    email = "Unavailable"
  return email
}


function needHelpHTML() {
  html = "<table><td bgcolor='#aaf'><div onclick=\"alert('help')\">Need Help?</div></td></table>"
  return html
}

// time based UUID+random, provides good uniqueness gaurantee
function hashTimestamp() {
  randSuffix = 1000000000;
  // removing vowels reduces chance of bad words and numerical confusion
  var charDict = {
    '0': '0',
    '1': '1',
    '2': '2',
    '3': '3',
    '4': '4',
    '5': '5',
    '6': '6',
    '7': '7',
    '8': '8',
    '9': '9',
    A: 'B',
    B: 'C',
    C: 'D',
    D: 'F',
    E: 'G',
    F: 'H',
    G: 'J',
    H: 'K',
    I: 'L',
    J: 'M',
    K: 'N',
    L: 'P',
    M: 'Q',
    N: 'R',
    O: 'S',
    P: 'T',
    Q: 'V',
    R: 'W',
    S: 'Y',
    T: 'Z'
  }

  var hash = (Date.now() * randSuffix + Math.round(Math.random() * randSuffix)).toString(Object.keys(charDict).length).toUpperCase();
  var res = ''
  var i = hash.length;
  while (i--) {
    res = charDict[hash[i]] + res;
  }
  return res
}

function randomDate() {
  var d = new Date(Math.random() * 1000000000000);
  month = '' + (d.getMonth() + 1);
  day = '' + d.getDate();
  year = d.getFullYear();

  if (month.length < 2)
    month = '0' + month;
  if (day.length < 2)
    day = '0' + day;

  return [year, month, day].join('-');
}

function randomString(length, titleCase, useNumbers) {
  if (!titleCase)
    titleCase = false;
  if (!useNumbers)
    useNumbers = false
  var result = [];
  var characters = 'abcdefghijklmnopqrstuvwxyz';
  if (useNumbers)
    characters += '0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    var c = characters.charAt(Math.floor(Math.random() * charactersLength))
    if (titleCase && (i == 0))
      c = c.toUpperCase()
    result.push(c);
  }
  return result.join('');
}

function randomOption(options) {
  return options[Math.floor(Math.random() * options.length)]
}

function test_randomString() {
  debug(randomString(10, true))
}