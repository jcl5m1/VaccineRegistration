//helper function to steer messages
function debug(message){
  console.log(message);
}


function getScriptUrl() {
 var url = ScriptApp.getService().getUrl();
 return url;
}

// strong gaurantee of UUID
function hashTimestamp(){
  randSuffix = 1000000000;
  return (Date.now()*randSuffix+Math.round(Math.random()*randSuffix)).toString(36).toUpperCase();
}

function randomDate(){
    var d = new Date(Math.random()*1000000000000);
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
  if(!titleCase)
    titleCase = false;
  if(!useNumbers)
  useNumbers = false
  var result           = [];
  var characters       = 'abcdefghijklmnopqrstuvwxyz';
  if(useNumbers)
    characters += '0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
    var c = characters.charAt(Math.floor(Math.random() * charactersLength))
    if(titleCase && (i==0))
      c = c.toUpperCase()
    result.push(c);
   }
   return result.join('');
}

function randomOption(options) {
   return options[Math.floor(Math.random() * options.length)]
}

function test_randomString(){
  debug(randomString(10,true))
}