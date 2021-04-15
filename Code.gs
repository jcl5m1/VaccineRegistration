var profileData;

function doGet(e) {
  
  var params = JSON.stringify(e);
  // return HtmlService.createHtmlOutput(params);
  
  var validPages = ['appointments', 'register', 'lookup','camera', 'checkin', 'profile', 'barcode', 'questionaire'];

  var page = e.parameter['page']
  var prev = e.parameter['prev']

  if(prev == 'register') {
    //give time for append to finish.
    // TODO better to check?  dunno how to persist state across page changes
    Utilities.sleep(2000);
  }

  if(page == 'profile') {
    profileData = searchPatients(e.parameter);
  }

  if (validPages.indexOf(page) !== -1) {
    return HtmlService
        .createTemplateFromFile(page)
        .evaluate();
  }

  //default page comes last
  return HtmlService
    .createTemplateFromFile('Index')
    .evaluate();

}

function generateRegistrationTest(){
  var res = {
    FirstName: randomString(8,true),
    LastName: randomString(8,true),
    DateOfBirth: randomDate(),
    Phone: Math.floor(Math.random()*10000000000),
    Email: randomString(5)+"@"+randomString(5)+".com",
    Gender: randomOption(['male','female','other']),
    Race: randomString(8,true),
    RelationshipToPatient: randomOption(['self','gaurdian']),
    SignatureName: randomString(8,true)+" "+randomString(8,true),
    AddressStreet: Math.floor(Math.random()*10000) + " " + randomString(10,true) + " St",
    AddressCity: randomString(10,true),
    AddressState: randomString(2).toUpperCase(),
    AddressZip: Math.floor(Math.random()*100000),
    ImageInsuranceFront: {name: ''},
    ImageInsuranceBack: {name: ''}
  };
  return res;
}


function processRegistrationForm(formObject){
  var id = hashTimestamp();

  var namePrefix = formObject.LastName +"_"+formObject.FirstName+"_"+id
  var data = {
    'ID': id,
    'FirstName': formObject.FirstName.toUpperCase(),
    'LastName': formObject.LastName.toUpperCase(),
    'DateOfBirth': formObject.DateOfBirth,
    'Phone': formObject.Phone,
    'Email': formObject.Email.toUpperCase(),
    'Gender': formObject.Gender.toUpperCase(),
    'Race': formObject.Race.toUpperCase(),
    'RelationshipToPatient': formObject.RelationshipToPatient,
    'SignatureName': formObject.SignatureName.toUpperCase(),
    'AddressStreet': formObject.AddressStreet.toUpperCase(),
    'AddressCity': formObject.AddressCity.toUpperCase(),
    'AddressState': formObject.AddressState,
    'AddressZip': formObject.AddressZip,
    'Status': 'registered',
    'Source': 'webapp',
    'ImageIDBack': namePrefix + "_IDBack.jpg",
    'ImageInsuranceFront': namePrefix + "_InsuranceFront.jpg",
    'ImageInsuranceBack': namePrefix + "_InsuranceBack.jpg",
    'Notes': formObject.Notes,
  }
  var res = dictToValueArray("Patients",data)

  // TODO check if already registered
  // store patient info
  res = appendSheetData("Patients",[res])

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


function processFeedbackForm(formObject){
  var id = hashTimestamp();
  var res = dictToValueArray("Tickets",{
    'Status': 'new',
    'Timestamp': Date.now(),
    'CreatedBy': formObject.CreatedBy,
    'Type': formObject.Type,
    'Description': formObject.Description
  })

  // store patient info
  res = appendSheetData("Tickets",[res])
}

function processCameraForm(formObject){
  debugLog("upload", formObject.ImageInsuranceFront.name)
  if(formObject.ImageInsuranceFront.name)
    uploadImage(Date.now()+"_camera.jpg", formObject.ImageInsuranceFront)
}
