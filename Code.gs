var profileData;
var urlParameters;

function doGet(e) {

  if (!(e)) {
    console.log("run from editor complete")
    return
  }

  urlParameters = e.parameter;
  var validPages = ['appointments', 'register', 'lookup', 'camera', 'checkin', 'profile', 'barcode', 'questionaire', 'waitlist', 'consent', 'email', 'staff_login'];

  var page = e.parameter['page']
  var prev = e.parameter['prev']
  if ('user_key' in e.parameter) {
    var user_key = e.parameter['user_key']
  } else {
    var user_key = 'patient'
  }

  if (prev == 'register') {
    //give time for append to finish.
    // TODO better to check?  dunno how to persist state across page changes
    Utilities.sleep(2000);
  }

  // If not a valid page, return the index.
  if (validPages.indexOf(page) == -1) {
    page = 'Index'
  } 

  // Serve HTML page with selected page.
  html_template = HtmlService
    .createTemplateFromFile(page);
  html_template.user_key = user_key

  // If page is profile page, get the patient data/
  if (page == 'profile') {
    html_template.profileData = searchPatients(e.parameter);
  }

  return html_template.evaluate();

}

}

// Check if login form given password matches master password
function onLogin(form) {
  if (form.password == master_password) {
    var template =  HtmlService.createTemplateFromFile('Index');
    template.user_key = staff_key
    return template.evaluate()
      .setSandboxMode(HtmlService.SandboxMode.NATIVE)
      .getContent();
  } else {
    throw "You could not be found in the database please try again.";
  }
}

function include(filename) {
  return HtmlService.createTemplateFromFile(filename)
    .evaluate()
    .getContent();
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

