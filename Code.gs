var profileData = null;
var urlParameters = null;
var appointmentData = null;

var VALID_PAGES = ['appointments', 'register', 'lookup', 'camera', 'checkin', 'profile', 'barcode', 'questionaire', 'waitlist', 'consent', 'email', 'upload', 'insurance', 'docusign', 'login', 'logout'];

function doGet(e) {

  if (!(e)) {
    console.log("run from editor complete")
    return
  }
  urlParameters = e.parameter;
  var page = e.parameter['page']
  var action = e.parameter['action']

  // log page access in cloud log
  eventLog = {
    event: "pageRequest",
    tempUserKey: Session.getTemporaryActiveUserKey(),
    page: page
  }
  debug(eventLog)

  if (action == 'register') {
    var res = processRegistrationForm(e.parameter)
    profileData = searchPatients({ 'ID': res });
  }

  if (action == 'insurance') {
    processInsuranceForm(e.parameter);
  }

  if (page == 'register') {
    // generate an ID for new registration
    profileData = { 'ID': hashTimestamp() }
  }

  if ((page == 'profile') || (page == 'appointments')) {
    if (profileData == null) {
      profileData = searchPatients(e.parameter);
    }
  }

  // gets all appointments
  if (page == 'appointments') {
    appointmentData = getSheetDataAsDict('Appointments')
  }

  return routePage(page);
}

// post was having trouble with HTMLService return, so using doGet right now
function doPost(e) {
  var action = e.parameter['action']
  var page = e.parameter['page']

  if (action == 'register') {
    var res = processRegistrationForm(e.parameter)
    profileData = searchPatients({ 'ID': res });
  }

  if (action == 'insurance') {
    processInsuranceForm(e.parameter);
  }

  if (action == 'upload') {
    var res = uploadFileWithBase64String(e.parameter.imageFile, e.parameter.imageFileData)
    return HtmlService.createHtmlOutput(formatToHTML(res.getDownloadUrl()));
  }

  if (action == 'feedback') {
    processFeedbackForm(e.parameter);
  }

  if (action == 'questionaire') {
    // TODO implement
  }


  // TODO this is not working with POST method yet.  Following error:
  // TypeError: Cannot use instanceof on a non-object
  return routePage(page);
}

function routePage(page) {
  if (VALID_PAGES.indexOf(page) == -1) {
    //default page
    return HtmlService
      .createTemplateFromFile('Index')
      .evaluate();
  }
  return HtmlService
    .createTemplateFromFile(page)
    .evaluate();
}

function test() {
  var profileID = '3CLD9S0V3CVYLFL'
  var res = searchPatients({ ID: profileID })
  debug(res)
}

// just get dose appointment info
function getAppointments(profileID, action) {
  profileData = searchPatients({ ID: profileID });
  var res = getOnlyAppointmentData(profileData)
  res.action = action
  return res
}

function getOnlyAppointmentData(data) {
  var res = {}
  for (var key in data) {
    if (key.indexOf("Dose") >= 0) {
      res[key] = data[key]
    }
  }
  res.ID = data['ID']
  return res
}

function generateRegistrationTest() {
  var res = {
    FirstName: randomString(8, true),
    LastName: randomString(8, true),
    DateOfBirth: randomDate(),
    Phone: Math.floor(Math.random() * 10000000000),
    Email: randomString(5) + "@" + randomString(5) + ".com",
    Gender: randomOption(['male', 'female', 'other']),
    Race: randomOption(["White", "BlackOrAfricanAmerican", "AmericanIndianOrAlaskaNative", "Asian", "NativeHawaiianOrOtherPacificIslander", "Other", "DeclineToSpecify"]),
    Ethnicity: randomOption(["HispanicOrLatino", "NonHispanicOrLatino", "Other", "DeclineToSpecify"]),
    RelationshipToPatient: randomOption(['self', 'guardian']),
    GuardianFirstName: randomString(8, true),
    GuardianLastName: randomString(8, true),
    AddressStreet: Math.floor(Math.random() * 10000) + " " + randomString(10, true) + " St",
    AddressCity: randomString(10, true),
    AddressState: randomString(2).toUpperCase(),
    AddressZip: Math.floor(Math.random() * 100000),
    ImageInsuranceFront: { name: '' },
    ImageInsuranceBack: { name: '' },
    InsuranceType: randomOption(['Private', 'Medicare', 'None']),
    InsurancePolicyHolder: randomString(8, true) + " " + randomString(8, true),
    InsurancePolicyHolderDateOfBirth: randomDate(),
    InsuranceCompany: randomString(8, true),
    InsuranceClaimAddress: Math.floor(Math.random() * 10000) + " " + randomString(10, true) + " St",
    InsuranceGroupNumber: Math.floor(Math.random() * 10000000000),
    InsuranceSubscriberID: Math.floor(Math.random() * 10000000000),
    InsuranceSSN: Math.floor(Math.random() * 1000000000),
    InsuranceDriversLicense: Math.floor(Math.random() * 1000000000),
    Notes: randomString(10),
  };
  return res;
}

function processRegistrationForm(params) {

  // this ID is already registered - likely form resubmit
  if (searchPatients({ ID: params.ID }) != null)
    return params.ID;

  var payload = {
    ID: params.ID,
    Timestamp: Date.now(),
    FirstName: params.FirstName.toUpperCase(),
    LastName: params.LastName.toUpperCase(),
    DateOfBirth: params.DateOfBirth,
    Phone: params.Phone,
    Email: params.Email.toUpperCase(),
    Gender: params.Gender.toUpperCase(),
    Race: params.Race.toUpperCase(),
    Ethnicity: params.Ethnicity.toUpperCase(),
    RelationshipToPatient: params.RelationshipToPatient,
    GuardianFirstName: params.GuardianFirstName.toUpperCase(),
    GuardianLastName: params.GuardianLastName.toUpperCase(),
    AddressStreet: params.AddressStreet.toUpperCase(),
    AddressCity: params.AddressCity.toUpperCase(),
    AddressState: params.AddressState,
    AddressZip: params.AddressZip,
    Status: 'registered',
    Source: 'webapp',
    Notes: params.Notes,
    Browser: params.Browser,
  }

  if (payload.GuardianFirstName == '')
    payload.GuardianFirstName = payload.FirstName
  if (payload.GuardianLastName == '')
    payload.GuardianLastName = payload.LastName

  // store patient info
  res = appendSheetData("Patients", [dictToValueArray("Patients", payload)])
  return params.ID;
}


function processInsuranceForm(params) {
  var payload = {
    InsuranceType: params.InsuranceType,
    InsurancePolicyHolder: params.InsurancePolicyHolder.toUpperCase(),
    InsurancePolicyHolderDateOfBirth: params.InsurancePolicyHolderDateOfBirth,
    InsuranceCompany: params.InsuranceCompany.toUpperCase(),
    InsuranceClaimAddress: params.InsuranceClaimAddress.toUpperCase(),
    InsuranceGroupNumber: params.InsuranceGroupNumber.toUpperCase(),
    InsuranceSubscriberID: params.InsuranceSubscriberID.toUpperCase(),
    InsuranceSSN: params.InsuranceSSN,
    InsuranceDriversLicense: params.InsuranceDriversLicense,
  }

  var res = setSheetValueUsingHeaders("Patients", 'ID', params.ID, payload)
  if ((res == null) || (!('spreadsheetId' in res['InsuranceType']))) {
    return ["failed to update patient profile", res, params.ID, values]
  }
  return res
}

function processFeedbackForm(params) {
  var id = hashTimestamp();
  var res = dictToValueArray("Tickets", {
    ID: id,
    Status: 'NEW',
    Timestamp: Date.now(),
    CreatedBy: params.CreatedBy,
    Type: params.Type,
    Description: params.Description
  })

  // store ticket
  res = appendSheetData("Tickets", [res])
}

function processWaitlistForm(params) {
  var id = hashTimestamp();
  var res = dictToValueArray("Waitlist", {
    ID: id,
    Status: 'NEW',
    Timestamp: Date.now(),
    CreatedBy: params.CreatedBy.toUpperCase(),
    FirstName: params.FirstName.toUpperCase(),
    LastName: params.LastName.toUpperCase(),
    Phone: params.Phone,
    Email: params.Email.toUpperCase(),
    Notes: params.Notes,
  })

  // store waitlist
  res = appendSheetData("Waitlist", [res])
}

function uploadInsuranceImage(patientId, firstName, lastName, imageName, data) {
  // no ID, cannot update spreadsheet
  if (patientId == '')
    return null

  var filename = lastName + "_" + firstName + "_" + patientId + "_" + imageName + ".jpg"
  var downloadUrl = uploadFileWithBase64String(filename, data).getDownloadUrl();

  var values = {}
  // update the patient page
  values[imageName] = downloadUrl
  var res = setSheetValueUsingHeaders("Patients", 'ID', patientId, values)
  if ((res == null) || (!('spreadsheetId' in res[imageName]))) {
    return ["failed to update patient profile", res, patientId, values]
  }
  return res
}

function processCameraForm(params) {
  debugLog("upload", params.ImageInsuranceFront.name)
  if (params.ImageInsuranceFront.name)
    uploadImage(Date.now() + "_camera.jpg", params.ImageInsuranceFront)
}


function requestSignature(name, email, dose, id) {

  // create the form
  var res = createEmbeddedDocusignEnvelope(name, email, id)

  //executor needs to be logged in
  if ('authUrl' in res)
    return res

  // no ID, cannot update spreadsheet
  if (id == null)
    return res
  if (id == '')
    return res

  // update the spreadsheet
  var values = {}
  var prefix = 'Dose' + dose
  values[prefix + 'ConsentStatus'] = res.status
  values[prefix + 'ConsentID'] = res.envelopeId
  setSheetValueUsingHeaders("Patients", 'ID', id, values)
  return res;
}

function processDocusignComplete(id, dose, result) {
  // no ID, cannot update spreadsheet
  if (id == '')
    return null

  var values = {}
  var prefix = 'Dose' + dose
  values[prefix + 'ConsentStatus'] = result.status
  values[prefix + 'ConsentID'] = result.envelopeId
  values[prefix + 'ConsentUrl'] = result.downloadUrl
  return setSheetValueUsingHeaders("Patients", 'ID', id, values)
}

function processReserveAppointment(patientId, dose, appointmentId, brand) {
  // no ID, cannot update spreadsheet
  if (patientId == '')
    return null

  var values = {}
  // update the patient page
  var prefix = 'Dose' + dose
  values[prefix + 'AppointmentID'] = appointmentId
  values[prefix + 'Status'] = 'registered'
  values[prefix + 'VaccineBrand'] = brand
  var res = setSheetValueUsingHeaders("Patients", 'ID', patientId, values)
  if ((res == null) || (!('spreadsheetId' in res[prefix + 'AppointmentID']))) {
    return ["failed to update patient profile", res, patientId, values]
  }

  // appointment stats are updated by spreadeheet

  return getAppointments(patientId, 'reserve')
}

function processCancelAppointment(formElem) {

  var patientId = formElem.ID

  // no ID, cannot update spreadsheet
  if (patientId == '')
    return null

  var values = {}

  // update the patient page
  var prefix = 'Dose' + formElem.dose
  values[prefix + 'AppointmentID'] = ''
  values[prefix + 'Status'] = ''
  values[prefix + 'VaccineBrand'] = ''

  var res = setSheetValueUsingHeaders("Patients", 'ID', patientId, values)
  if (!('spreadsheetId' in res[prefix + 'AppointmentID'])) {
    return "failed to update patient profile"
  }
  // appointment stats are updated by spreadeheet
  return getAppointments(patientId, 'cancel')
}


function processCheckIn(patientId, appointmentId, dose) {

  // no ID, cannot update spreadsheet
  if (patientId == '')
    return null

  var values = {}

  debugLog('checkedin', patientId + ',' + appointmentId + ',' + dose)
  // update the patient page
  var prefix = 'Dose' + dose
  values[prefix + 'AppointmentID'] = appointmentId
  values[prefix + 'Status'] = 'completed'
  var res = setSheetValueUsingHeaders("Patients", 'ID', patientId, values)
  if (!('spreadsheetId' in res[prefix + 'AppointmentID'])) {
    var msg = "failed to update patient profile"
    return msg
  }

  // appointment stats are updated by spreadeheet
  return getAppointments(patientId, 'checkin')
}
