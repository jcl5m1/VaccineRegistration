function testSpreadsheet() {
  values = getSheetData('Appointments');
  res = getCellByKey(values, 1, "Registered");
  debug( res > 0 ? "pass" : "fail")

  res = getColumnByKey(values,"Registered");
  debug(res.length > 0 ? "pass" : "fail")

  res = getSheetDataAsDict('Appointments');
  debug(res.length > 0 ? "pass" : "fail")


  record = dictToValueArray("Patients",
    {
      "ID": hashTimestamp(),
      "FirstName": "angela",
      "LastName": "wong",
      "Status": "registered",
      "DateOfBirth": "1960-01-01"
    })

  //add patient
  res = appendSheetData("Patients", [record])
  debug('spreadsheetId' in res ? "pass" : "fail")
  Utilities.sleep(1000)

  // search for patient
  res = searchPatients({ "FirstName": "angela", 'LastName': 'wong', 'DateOfBirth': '1960-01-01' });
  debug(res['FirstName'] == 'angela' ? "pass" : "fail")

  // set patient cell status
  var res = setSheetValueUsingHeaders('Patients', 'ID', '9HS74T8DPAFABK', {'Dose1Status':'registered'})
  debug('spreadsheetId' in res['Dose1Status'] ? "pass" : "fail")
            
  // test spreadsheet log
  var res = debugLog("test","test debug log message")
  debug('spreadsheetId' in res ? "pass" : "fail")

  //modify appointment capacity  count
  var appointmentId = '20210415_1000_VaccineSiteA'
  var colName = 'Capacity'
  var amount = 2
  var res = addToCellIntegerValue("Appointments","ID",appointmentId,colName,amount)
  debug(colName in res ? "pass" : "fail")
  var res = addToCellIntegerValue("Appointments","ID",appointmentId,colName,-amount)
  debug(colName in res ? "pass" : "fail")
}

// save to spreadsheet tab
function debugLog(type, message) {
  var res = dictToValueArray("Log", {
    'Timestamp': Date.now(),
    'Type': type,
    'Message': message
  })
  return appendSheetData("Log", [res])
}

// get cell from 2D array, using header row key
function getCellByKey(values, row, key) {
  var index = values[0].indexOf(key);
  return getCell(values, row, index);
}

//get cell from 2D array
function getCell(values, row, index) {
  return values[row][index];
}

// get column by key using header row
function getColumnByKey(values, key) {
  var results = [];
  var index = values[0].indexOf(key);
  for (var i = 1; i < values.length; i++)
    results.push(getCell(values, i, index));
  return results;
}


// get range of values from Google sheet
function getSheetData(rangeName) {
  return Sheets.Spreadsheets.Values.get(GOOGLE_SPREADSHEET_ID, rangeName).values;
}

// get range of values from Google sheet
function getSheetDataAsDict(rangeName) {
  values = Sheets.Spreadsheets.Values.get(GOOGLE_SPREADSHEET_ID, rangeName).values;
  keys = values[0]
  var result = []
  for (var r = 1; r < values.length; r++) {
    var data = {}
    for (var i = 0; i < keys.length; i++) {
      data[keys[i]] = values[r][i]
    }
    result.push(data)
  }
  return result;
}

//look up header to convert dict to array
function dictToValueArray(range, data) {
  var values = Sheets.Spreadsheets.Values.get(GOOGLE_SPREADSHEET_ID, range).values
  keys = values[0];
  var result = []
  for (var i = 0; i < keys.length; i++) {
    if (keys[i] in data)
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
  appendRequest.sheetId = GOOGLE_SPREADSHEET_ID;
  appendRequest.rows = [valueRange];

  var result = Sheets.Spreadsheets.Values.append(valueRange, GOOGLE_SPREADSHEET_ID, range, {
    valueInputOption: 'USER_ENTERED'
  });
  return result;
}

//update data in range: A1 string
function updateSheetData(range, values) {
  var valueRange = Sheets.newRowData();
  valueRange.values = values;

  var appendRequest = Sheets.newAppendCellsRequest();
  appendRequest.sheetId = GOOGLE_SPREADSHEET_ID;
  appendRequest.rows = [valueRange];

  var result = Sheets.Spreadsheets.Values.update(valueRange, GOOGLE_SPREADSHEET_ID, range, {
    valueInputOption: 'USER_ENTERED'
  });
  return result;
}


function dateFromDateTime(datetTime) {
  return dateTime.split(' ')[0];
}

// for a given day, get patient info needed for checkin only
function getCheckInDataset(date) {
  var sheetName = 'Patients';
  var values = getSheetData(sheetName);
  keys = values[0];
  var key_lut = {};
  for (var i = 0; i < keys.length; i++) {
    key_lut[keys[i]] = i;
  }
  var checkInDataset = [];

  var resultValues = ['FirstName', 
                      'LastName', 
                      'ID', 
                      'Dose1AppointmentID', 
                      'Dose1Status',
                      'Dose1VaccineBrand',
                      'Dose1ConsentStatus',
                      'Dose1ConsentUrl',
                      'Dose2AppointmentID', 
                      'Dose2Status',
                      'Dose2VaccineBrand',
                      'Dose2ConsentStatus',
                      'Dose2ConsentUrl',
                      'Notes']

  for (var i = 1; i < values.length; i++) {
    // if (date == dateFromDateTime(values[i]['Dose1DateTime']))
    //   dose = 1;
    // if (date == dateFromDateTime(values[i]['Dose2DateTime']))
    //   dose = 2;

    var record = {}
    for(var j = 0; j < resultValues.length; j++) {
      record[resultValues[j]] = values[i][key_lut[resultValues[j]]]
    }

    checkInDataset.push(record);
  }
  return checkInDataset;
}

// search for patient profile using name and DOB
function searchPatients(query) {
  var sheetName = 'Patients'
  var values = getSheetData(sheetName)
  keys = values[0];

  // only extract a few keys
  queryPatient = {}
  // if non-empty ID is provided, just use the ID
  if ('ID' in query) {
    if(query['ID'].length > 0){
      queryPatient['ID'] = query['ID']
    }
  }
  
  if(!('ID' in queryPatient)){
    // if not using ID, require other components
    if('FirstName' in query)
      queryPatient['FirstName'] = query['FirstName'].toUpperCase()
    if('LastName' in query)
      queryPatient['LastName'] = query['LastName'].toUpperCase()
    if('DateOfBirth' in query)
      queryPatient['DateOfBirth'] = query['DateOfBirth']
  }
 
  // not enough valid parameters
  if(Object.keys(queryPatient).length == 0)
    return null

  var key_lut = {}
  for (var i = 0; i < keys.length; i++) {
    key_lut[keys[i]] = i
  }

  for (var i = 1; i < values.length; i++) {
    // must match ALL provided query params
    var found = true;
    for (var k in queryPatient) {
      var v = values[i][key_lut[k]]
      // make case insensitive
      if (k == 'FirstName' || k == 'LastName')
        v = v.toUpperCase();
      if (queryPatient[k] != v) {
        found = false;
        break;
      }
    }
    if (found) {
      var result = {}
      for (var j = 0; j < keys.length; j++) {
        result[keys[j]] = values[i][j];
      }
      return result;
    }
  }
  return null
}

function R1C1toA1(row, column) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const base = chars.length;
  var columnRef = '';

  column += 1
  row += 1
  if (column < 1) {
    columnRef = chars[0];
  } else {
    var maxRoot = 0;
    while (Math.pow(base, maxRoot + 1) < column) {
      maxRoot++;
    }

    var remainder = column;
    for (var root = maxRoot; root >= 0; root--) {
      var value = Math.floor(remainder / Math.pow(base, root));
      remainder -= (value * Math.pow(base, root));
      columnRef += chars[value - 1];
    }
  }

  // Use Math.max to ensure minimum row is 1
  return columnRef + Math.max(row, 1)
};


// set cells using sheetID, id column, id value, and dictionary {column_name:new_value,...}
function setSheetValueUsingHeaders(sheetName, id_header, id, values) {
  var data = getSheetData(sheetName) // potentially inefficient - gets entire sheet?
  var keys = data[0];
  var id_idx = keys.indexOf(id_header)
  for (var row_idx = 1; row_idx < data.length; row_idx++) { 
    // find the row match in the id_header column
    if (data[row_idx][id_idx] != id) 
      continue

    var res = {}
    var options = { valueInputOption: 'USER_ENTERED' }

    // one call per cell, how to do potentially disjoint cells?
    for(var col in values) {
      var col_idx = keys.indexOf(col)
      // not found, skip
      if(col_idx < 0)
        continue
      var range = sheetName + '!' + R1C1toA1(row_idx, col_idx)
      var resource = { values: [[values[col]]] }
      res[col] = Sheets.Spreadsheets.Values.update(resource, GOOGLE_SPREADSHEET_ID, range, options);
    }

    // provide input in return value, to give callback more info
    var input = values
    input[id_header] = id
    res.input = input
    return res
  }
  // there was a reason why this was undefined vs null.  but, I forgot :(
  return null
}

//get sheet values by headers list and row ID
function getSheetValueUsingHeaders(sheetName, id_header, id, headers) {
  var data = getSheetData(sheetName) // potentially inefficient - gets entire sheet?
  var keys = data[0];
  var id_idx = keys.indexOf(id_header)
  for (var row_idx = 1; row_idx < data.length; row_idx++) { 
    // find the row match in the id_header column
    if (data[row_idx][id_idx] != id) 
      continue

    var res = {}
    // single input, wrap in array
    if(!Array.isArray(headers))
      headers = [headers]

    for(var i in headers) {
      var col_idx = keys.indexOf(headers[i])
      res[headers[i]] = data[row_idx][col_idx]
    }

    // provide input in return value, to give callback more info
    var input = {}
    input[id_header] = id
    res.input = input
    return res
  }
  // there was a reason why this was undefined vs null.  but, I forgot :(
  return undefined
}

function addToCellIntegerValue(sheetName, id_header, id, colName, amount){
  // get current registration count
  var res = getSheetValueUsingHeaders(sheetName, id_header, id, [colName])
  if (!(colName in res)){
    return "failed to read cell value"
  }

  //increment registration count
  var payload = {}
  payload[colName] = parseInt(res[colName])+amount
  var res = setSheetValueUsingHeaders(sheetName,id_header,id, payload)
  return res
}