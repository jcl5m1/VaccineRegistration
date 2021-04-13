

function test() {
  values = getSheetData('Appointments');
  res = getCellByKey(values,1,"Registered");
  console.log("appointment read: " + res)
  // if(res!=12) {
  //   throw new Error("get sheet and cell failed");
  // }

  // res = getColumnByKey(values,"Registered");
  // console.log(res)

  // res = getSheetDataAsDict('Appointments');
  // console.log(res)


  record = dictToValueArray("Patients",
  {
    "ID": hashTimestamp(),
    "FirstName": "angela",
    "LastName": "wong",
    "Status": "registered",
    "DateOfBirth": "1960-01-01"
  })
  res = appendSheetData("Patients",[record])
  console.log("append result:" + res)

  Utilities.sleep(1000)
  res = searchPatients({"FirstName": "angela",'LastName': 'wong', 'DateOfBirth': '1960-01-01'});
  if(res)
    console.log("searchPatients:" + JSON.stringify(res));
  else
    console.log("fail");

}

// save to spreadsheet tab
function debugLog(type, message){
  var res = dictToValueArray("Log",{
    'Timestamp': Date.now(),
    'Type': type,
    'Message': message
  })
  return appendSheetData("Log",[res])
}

// get cell from 2D array, using header row key
function getCellByKey(values, row, key){
  var index = values[0].indexOf(key);
  return getCell(values,row,index);
}

//get cell from 2D array
function getCell(values, row, index){
  return values[row][index];
}

// get column by key using header row
function getColumnByKey(values, key){
  var results = [];
  var index = values[0].indexOf(key);
  for (var i = 1; i < values.length; i++)
    results.push(getCell(values,i,index));
  return results;
}

// get range of values from Google sheet
function getSheetData(rangeName) {
  return Sheets.Spreadsheets.Values.get(spreadsheetId, rangeName).values;
}

// get range of values from Google sheet
function getSheetDataAsDict(rangeName) {
  values = Sheets.Spreadsheets.Values.get(spreadsheetId, rangeName).values;
  keys = values[0]
  var result = []
  for(var r = 1; r < values.length; r++) {
    var data = {}
    for(var i = 0; i < keys.length;i++){
      data[keys[i]] = values[r][i]
    }
    result.push(data)
  }
  return result;
}

//look up header to convert dict to array
function dictToValueArray(range, data) {
 var values = Sheets.Spreadsheets.Values.get(spreadsheetId, range).values
  keys = values[0];
  var result = []
  for(var i = 0; i < keys.length; i++) {
    if(keys[i] in data)
      result.push(data[keys[i]])
    else
      result.push('')
  }
  return result;
}

//append data in first empty row below table starting at range: A1 string
function appendSheetData(range, values) {
  var valueRange = Sheets.newRowData();
  valueRange.values = values;

  var appendRequest = Sheets.newAppendCellsRequest();
  appendRequest.sheetId = spreadsheetId;
  appendRequest.rows = [valueRange];

  var result = Sheets.Spreadsheets.Values.append(valueRange,spreadsheetId,range, {
    valueInputOption: 'USER_ENTERED'
  });
  return result;
}

//update data in range: A1 string
function updateSheetData(range, values) {
  var valueRange = Sheets.newRowData();
  valueRange.values = values;

  var appendRequest = Sheets.newAppendCellsRequest();
  appendRequest.sheetId = spreadsheetId;
  appendRequest.rows = [valueRange];

  var result = Sheets.Spreadsheets.Values.update(valueRange,spreadsheetId,range, {
    valueInputOption: 'USER_ENTERED'
  });
  return result;
}

function searchPatients(query)
{
  var sheetName = 'Patients'
  var values = getSheetData(sheetName)
  keys = values[0];

  // only extract a few keys
  queryPatient = {
    "FirstName": query['FirstName'],
    "LastName": query['LastName'],
    "DateOfBirth": query['DateOfBirth']
  }

  var key_lut = {}
  for(var i = 0; i < keys.length; i++) {
    key_lut[keys[i]] = i
  }
//  console.log("keys:" + keys)

  for(var i = 1; i < values.length; i++) {
    var found = true;
    for(var k in queryPatient) {
      if(queryPatient[k] != values[i][key_lut[k]]) {
        found = false;
        break;
      }
    }
    if(found) {
      var result = {}
      for(var j = 0; j < keys.length; j++) {
        result[keys[j]] = values[i][j];
      }
      return result;
    }
  }
  return undefined
}