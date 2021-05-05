var profileData = null;
var urlParameters = null;
var appointmentData = null;

var VALID_PAGES = ['appointments', 'register', 'lookup', 'camera', 'checkin', 'profile', 'barcode', 'questionaire', 'waitlist', 'consent', 'email'];

// was considering making dynamic, but will be static for now
//var NEW_PATIENT_FLOW = ['register', 'questionaire', 'consent', 'appointments', 'lookup'];

function doGet(e) {

  if (!(e)) {
    console.log("run from editor complete")
    return
  }

  urlParameters = e.parameter;
  // return HtmlService.createHtmlOutput(params);


  var page = e.parameter['page']
  var prev = e.parameter['prev']
  
  // give time form submit processing to finish.
  // TODO better to subscribe to callback?  not sure how to do that across a form submit.
  if (prev == 'register') {
    Utilities.sleep(2000);
    profileData = searchPatients(e.parameter);
  }

  if ((page == 'profile')||(page == 'appointments')){
    if(profileData == null) {
      profileData = searchPatients(e.parameter);
    }
  }
  // if(page == 'appointments') {
  //   appointmentData = getSheetDataAsDict('Appointments')
  // }

  if (VALID_PAGES.indexOf(page) !== -1) {
    return HtmlService
      .createTemplateFromFile(page)
      .evaluate();
  }

  //default page comes last
  return HtmlService
    .createTemplateFromFile('Index')
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


function processRegistrationForm(formObject) {
  var id = hashTimestamp();

  var namePrefix = formObject.LastName + "_" + formObject.FirstName + "_" + id
  var data = {
    ID: id,
    Timestamp: Date.now(),
    FirstName: formObject.FirstName.toUpperCase(),
    LastName: formObject.LastName.toUpperCase(),
    DateOfBirth: formObject.DateOfBirth,
    Phone: formObject.Phone,
    Email: formObject.Email.toUpperCase(),
    Gender: formObject.Gender.toUpperCase(),
    Race: formObject.Race.toUpperCase(),
    Ethnicity: formObject.Ethnicity.toUpperCase(),
    RelationshipToPatient: formObject.RelationshipToPatient,
    SignatureName: formObject.SignatureName.toUpperCase(),
    AddressStreet: formObject.AddressStreet.toUpperCase(),
    AddressCity: formObject.AddressCity.toUpperCase(),
    AddressState: formObject.AddressState,
    AddressZip: formObject.AddressZip,
    Status: 'registered',
    Source: 'webapp',
    ImageIDBack: namePrefix + "_IDBack.jpg",

    InsuranceType: formObject.InsuranceType,
    ImageInsuranceFront: namePrefix + "_InsuranceFront.jpg",
    ImageInsuranceBack: namePrefix + "_InsuranceBack.jpg",
    InsurancePolicyHolder: formObject.InsurancePolicyHolder.toUpperCase(),
    InsurancePolicyHolderDateOfBirth: formObject.InsurancePolicyHolderDateOfBirth,
    InsuranceCompany: formObject.InsuranceCompany.toUpperCase(),
    InsuranceClaimAddress: formObject.InsuranceClaimAddress.toUpperCase(),
    InsuranceGroupNumber: formObject.InsuranceGroupNumber.toUpperCase(),
    InsuranceSubscriberID: formObject.InsuranceSubscriberID.toUpperCase(),
    InsuranceSSN: formObject.InsuranceSSN,

    Notes: formObject.Notes,
  }
  var res = dictToValueArray("Patients", data)

  // TODO check if already registered
  // store patient info
  res = appendSheetData("Patients", [res])

  // TODO check if successfully registered

  //upload images
  if (formObject.ImageIDBack.name) {
    uploadImage(data['ImageIDBack'], formObject.ImageIDBack)
  }

  if (formObject.ImageInsuranceFront.name) {
    uploadImage(data['ImageInsuranceFront'], formObject.ImageInsuranceFront)
  }

  if (formObject.ImageInsuranceBack.name) {
    uploadImage(data['ImageInsuranceBack'], formObject.ImageInsuranceBack)
  }

  return id;
}


function processFeedbackForm(formObject) {
  var id = hashTimestamp();
  var res = dictToValueArray("Tickets", {
    ID: id,
    Status: 'NEW',
    Timestamp: Date.now(),
    CreatedBy: formObject.CreatedBy,
    Type: formObject.Type,
    Description: formObject.Description
  })

  // store ticket
  res = appendSheetData("Tickets", [res])
}

function processWaitlistForm(formObject) {
  var id = hashTimestamp();
  var res = dictToValueArray("Waitlist", {
    ID: id,
    Status: 'NEW',
    Timestamp: Date.now(),
    CreatedBy: formObject.CreatedBy.toUpperCase(),
    FirstName: formObject.FirstName.toUpperCase(),
    LastName: formObject.LastName.toUpperCase(),
    Phone: formObject.Phone,
    Email: formObject.Email.toUpperCase(),
    Notes: formObject.Notes,
  })

  // store waitlist
  res = appendSheetData("Waitlist", [res])
}


function processCameraForm(formObject) {
  debugLog("upload", formObject.ImageInsuranceFront.name)
  if (formObject.ImageInsuranceFront.name)
    uploadImage(Date.now() + "_camera.jpg", formObject.ImageInsuranceFront)
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