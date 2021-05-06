var profileData = null;
var urlParameters = null;
var appointmentData = null;

var VALID_PAGES = ['appointments', 'register', 'lookup', 'camera', 'checkin', 'profile', 'barcode', 'questionaire', 'waitlist', 'consent', 'email','upload'];

// was considering making dynamic, but will be static for now
//var NEW_PATIENT_FLOW = ['register', 'questionaire', 'consent', 'appointments', 'lookup'];

function doGet(e) {

  if (!(e)) {
    console.log("run from editor complete")
    return
  }

  urlParameters = e.parameter;
  var page = e.parameter['page']
  var action = e.parameter['action']

  if (action == 'register') {
    var res = processRegistrationForm(e.parameter)
    profileData = searchPatients({'ID':res});
  }

  if ((page == 'profile')||(page == 'appointments')){
    if(profileData == null) {
      profileData = searchPatients(e.parameter);
    }
  }
  return routePage(page);
}

function doPost(e){
  var action = e.parameter['action']
  var page = e.parameter['page']

  if (action == 'register') {
    var res = processRegistrationForm(e.parameter)
    profileData = searchPatients({'ID':res});
//    return HtmlService.createHtmlOutput(formatToHTML(profileData))
  }

  if (action == 'upload') {
    var res = uploadImageFromString(e.parameter.imageFile, e.parameter.imageFileData)
    return HtmlService.createHtmlOutput(formatToHTML(res.getDownloadUrl()));
  }

  if(action == 'feedback'){
    processFeedbackForm(e.parameter);
  }

  if(action == 'questionaire'){
    // TODO implement
  }


  // TODO this is not working with POST method yet.  Following error:
  // TypeError: Cannot use instanceof on a non-object
  return routePage(page);
}

function routePage(page){
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

function test(){
  var testID = '3CLD9S0V3CVYLFL'
  var res = getAppointments(testID)
  debug(res)
}

// just get dose appointment info
function getAppointments(profileID) {
  profileData = searchPatients({ID:profileID});
  res = {}
  for(var key in profileData){
    if(key.indexOf("Dose")>=0) {
      res[key] = profileData[key]
    }
  }

  res.ID = profileID
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
    RelationshipToPatient: randomOption(['self', 'gaurdian']),
    SignatureName: randomString(8, true) + " " + randomString(8, true),
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
    Notes: randomString(10),
  };
  return res;
}


function processRegistrationForm(params) {
  var id = hashTimestamp();
  var namePrefix = params.LastName + "_" + params.FirstName + "_" + id
  var payload = {
    ID: id,
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
    SignatureName: params.SignatureName.toUpperCase(),
    AddressStreet: params.AddressStreet.toUpperCase(),
    AddressCity: params.AddressCity.toUpperCase(),
    AddressState: params.AddressState,
    AddressZip: params.AddressZip,
    Status: 'registered',
    Source: 'webapp',
    ImageIDBack: namePrefix + "_IDBack.jpg",

    InsuranceType: params.InsuranceType,
    ImageInsuranceFront: namePrefix + "_InsuranceFront.jpg",
    ImageInsuranceBack: namePrefix + "_InsuranceBack.jpg",
    InsurancePolicyHolder: params.InsurancePolicyHolder.toUpperCase(),
    InsurancePolicyHolderDateOfBirth: params.InsurancePolicyHolderDateOfBirth,
    InsuranceCompany: params.InsuranceCompany.toUpperCase(),
    InsuranceClaimAddress: params.InsuranceClaimAddress.toUpperCase(),
    InsuranceGroupNumber: params.InsuranceGroupNumber.toUpperCase(),
    InsuranceSubscriberID: params.InsuranceSubscriberID.toUpperCase(),
    InsuranceSSN: params.InsuranceSSN,

    Notes: params.Notes,
  }

  // TODO check if successfully registered
  //upload images and get download URLs
  if (params.ImageIDBack) {
    var res = uploadImageFromString(payload['ImageIDBack'], params.ImageIDBackData)
    payload['ImageIDBack'] = res.getDownloadUrl();
  }else {
    payload['ImageIDBack'] = ''
  }

  if (params.ImageInsuranceFront) {
    var res = uploadImageFromString(payload['ImageInsuranceFront'], params.ImageInsuranceFrontData)
    payload['ImageInsuranceFront'] = res.getDownloadUrl()
  } else {
    payload['ImageInsuranceFront'] = ''
  }

  if (params.ImageInsuranceBack) {
    var res = uploadImageFromString(payload['ImageInsuranceBack'], params.ImageInsuranceBackData)
    payload['ImageInsuranceBack'] = res.getDownloadUrl()
  } else {
    payload['ImageInsuranceBack'] = ''
  }

  // TODO check if already registered
  // store patient info
  res = appendSheetData("Patients", [dictToValueArray("Patients", payload)])

  return id;
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
  var prefix = 'Dose'+dose
  values[prefix+'ConsentStatus'] = res.status
  values[prefix+'ConsentID'] = res.envelopeId
  setSheetValueUsingHeaders("Patients",'ID',id,values)
  return res;
}

function processDocusignComplete(id, dose, result){
  // no ID, cannot update spreadsheet
  if (id == '')
    return null

  var values = {}
  var prefix = 'Dose'+dose
  values[prefix+'ConsentStatus'] = result.status
  values[prefix+'ConsentID'] = result.envelopeId
  values[prefix+'ConsentUrl'] = result.downloadUrl
  return setSheetValueUsingHeaders("Patients",'ID',id,values)
}

function processReserveAppointment(patientId, dose, appointmentId, brand){
  // no ID, cannot update spreadsheet
  if (patientId == '')
    return null

  var values = {}
  // update the patient page
  var prefix = 'Dose'+dose
  values[prefix+'AppointmentID'] = appointmentId
  values[prefix+'Status'] = 'registered'
  values[prefix+'VaccineBrand'] = brand
  var res = setSheetValueUsingHeaders("Patients",'ID',patientId, values)
  if ((res==null)||(!('spreadsheetId' in res[prefix+'AppointmentID']))){
    return ["failed to update patient profile", res, patientId, values]    
  }

  // appointment stats are updated by spreadeheet

  return getAppointments(patientId)
}

function processCancelAppointment(formElem){

  var patientId = formElem.ID

  // no ID, cannot update spreadsheet
  if (patientId == '')
    return null

  var values = {}

  // update the patient page
  var prefix = 'Dose'+formElem.dose
  values[prefix+'AppointmentID'] = ''
  values[prefix+'Status'] = ''
  values[prefix+'VaccineBrand'] = ''

  var res = setSheetValueUsingHeaders("Patients",'ID',patientId, values)
  if (!('spreadsheetId' in res[prefix+'AppointmentID'])){
    return "failed to update patient profile"    
  }
  // appointment stats are updated by spreadeheet
  return getAppointments(patientId)
}


function processCheckIn(patientId, appointmentId, dose){

  // no ID, cannot update spreadsheet
  if (patientId == '')
    return null

  var values = {}

  debugLog('checkedin',patientId + ',' + appointmentId+','+dose)
  // update the patient page
  var prefix = 'Dose'+dose
  values[prefix+'AppointmentID'] = appointmentId
  values[prefix+'Status'] = 'completed'
  var res = setSheetValueUsingHeaders("Patients",'ID',patientId, values)
  if (!('spreadsheetId' in res[prefix+'AppointmentID'])){
    var msg = "failed to update patient profile"  
    return msg
  }

  // appointment stats are updated by spreadeheet
  return getAppointments(patientId)
}