

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
  res = appendSheetData("Patients", [record])
  debug('spreadsheetId' in res ? "pass" : "fail")
  Utilities.sleep(1000)
  res = searchPatients({ "FirstName": "angela", 'LastName': 'wong', 'DateOfBirth': '1960-01-01' });
  debug(res['FirstName']== 'angela' ? "pass" : "fail")

  var res = setSheetValueUsingHeaders('Patients', 'ID', '9HPYPJ0CUWYZGG', 'Dose1DateTime', 'test value')
  debug('spreadsheetId' in res ? "pass" : "fail")

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
  for (var i = 1; i < values.length; i++) {
    dose = 0;
    // if (date == dateFromDateTime(values[i]['Dose1DateTime']))
    //   dose = 1;
    // if (date == dateFromDateTime(values[i]['Dose2DateTime']))
    //   dose = 2;

    var record = {
      'FirstName': values[i][key_lut['FirstName']],
      'LastName': values[i][key_lut['LastName']],
      'ID': values[i][key_lut['ID']],
      'Dose': dose,
      'Waiver': values[i][key_lut['Waiver']],
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


  // Currently limiting profile scope by key order
  // This can be updated in config.gs to define the limited profile view with
  // An array of accepted keys
  if (query.user_key == STAFF_KEY) {
    profile_scope = keys.length 
  } else {
    // ID, First, Last, DoB, Phone
    profile_scope = 5
  }

  if ('ID' in query) {
    queryPatient['ID'] = query['ID']
  } else {
    // if not using ID, require other components
    queryPatient['FirstName'] = query['FirstName'].toUpperCase()
    queryPatient['LastName'] = query['LastName'].toUpperCase()
    queryPatient['DateOfBirth'] = query['DateOfBirth']
  }


  var key_lut = {}
  for (var i = 0; i < keys.length; i++) {
    key_lut[keys[i]] = i
  }

  for (var i = 1; i < values.length; i++) {
    var found = true;
    for (var k in queryPatient) {
      var v = values[i][key_lut[k]]
      // make case insensitive
      if (k == 'FirstName' || k == 'LastName')
        v = v.toUpperCase();
      if (queryPatient[k].length == 0)
        continue
      if (queryPatient[k] != v) {
        found = false;
        break
      }
    }
    // If found, iterate over profile information up the length set by `profile_scope`
    if (found) {
      var result = {}
      for (var j = 0; j < profile_scope; j++) {
        result[keys[j]] = values[i][j];
      }
      return result;
    }
  }
  return undefined
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

// set a cell, using sheet, id, and column name
function setSheetValueUsingHeaders(sheetName, id_header, id, value_header, value) {
  var data = getSheetData(sheetName)
  var keys = data[0];
  var id_idx = keys.indexOf(id_header)
  var value_idx = keys.indexOf(value_header)
  for (var i = 1; i < data.length; i++) {
    if (data[i][id_idx] == id) {
      var range = sheetName + '!' + R1C1toA1(i, value_idx)
      var resource = { values: [[value]] }
      var options = { valueInputOption: 'USER_ENTERED' }
      var res = Sheets.Spreadsheets.Values.update(resource, GOOGLE_SPREADSHEET_ID, range, options);

      // provide input in return value, to give callback more info
      var input = {}
      input[id_header] = id
      input[value_header] = value
      res.input = input
      return res
    }
  }

  return undefined
}