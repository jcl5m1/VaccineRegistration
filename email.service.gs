function sendAppointmentEmail(formObject) {
  var message = 'test message';
  var subject = 'COVID-19 Vaccine Appointment Confirmation';
  MailApp.sendEmail(formObject.Email, subject, message);
}

var dataFromServerTemplate = null

function sendAppointmentConfirmationEmail(id, dose, url) {

  if(profileData == null)
    profileData = searchPatients({ 'ID': id });

  if (appointmentData == null) {
    appointmentData = getSheetDataAsDict('Appointments')
  }

  var prefix = "Dose"+dose
  var email = profileData['Email']  
  var appointmentId = profileData[prefix+"AppointmentID"]

  var appointment = null
  for(var i in appointmentData) {
    var a = appointmentData[i]
    if(a['ID'] == appointmentId) {
      appointment = a;
      break;
    }
  }

  // override email with developer recipient email address
  if(DEVELOPER_MODE)
    email=DEVELOPER_RECIPIENT_EMAIL

  var params = {
    'id': id,
    'email': email,
    'appointmentId': appointmentId,
    'appointment': appointment,
    'dose': dose,
    'url': url
  }
  dataFromServerTemplate = params // for debugging allows loading the email html template as a page instead of sending email
  sendEmail(email, 'COVID-19 Vaccine - Appointment Confirmation', importHTML('confirmation.email.html', params))
  return [id, dose, email, appointmentId]
}

function sendAppointmentCancellationEmail(id, dose, url) {
  if(profileData == null)
    profileData = searchPatients({ 'ID': id });

  var email = profileData['Email']  

  // override email with developer recipient email address
  if(DEVELOPER_MODE)
    email=DEVELOPER_RECIPIENT_EMAIL

  var params = {
    'id': id,
    'email': email,
    'dose': dose,
    'url': url
  }
  dataFromServerTemplate = params // for debugging allows loading the email html template as a page instead of sending email
  sendEmail(email, 'COVID-19 Vaccine - Appointment Cancelled', importHTML('cancel.email.html', params))
  return [id, dose, email]
}


function sendRegisterInvitationEmail(email, url) {
  // override email with developer recipient email address
  if(DEVELOPER_MODE)
    email=DEVELOPER_RECIPIENT_EMAIL

  var params = {
    'email': email,
    'url': url
  }
  dataFromServerTemplate = params // for debugging allows loading the email html template as a page instead of sending email
  sendEmail(email, 'COVID-19 Vaccine - Begin Your Registration', importHTML('invitation.email.html'), params)
  return [email, url]
}


function sendAppointmentFollowupEmail(id, dose, url) {
  if(profileData == null)
    profileData = searchPatients({ 'ID': id });

  var email = profileData['Email']  

  // override email with developer recipient email address
  if(DEVELOPER_MODE)
    email=DEVELOPER_RECIPIENT_EMAIL

  var params = {
    'id': id,
    'email': email,
    'dose': dose,
    'url': url
  }
  dataFromServerTemplate = params // for debugging allows loading the email html template as a page instead of sending email
  sendEmail(email, 'COVID-19 Vaccine - Schedule Your Followup', importHTML('followup.email.html', params))
  return [id, dose, email]
}


function sendAppointmentConsentEmail(id, dose, url) {
  if(profileData == null)
    profileData = searchPatients({ 'ID': id });

  var email = profileData['Email']  

  // override email with developer recipient email address
  if(DEVELOPER_MODE)
    email=DEVELOPER_RECIPIENT_EMAIL

  var params = {
    'id': id,
    'email': email,
    'dose': dose,
    'url': url
  }
  dataFromServerTemplate = params // for debugging allows loading the email html template as a page instead of sending email
  sendEmail(email, 'COVID-19 Vaccine - Complete Consent', importHTML('consent.email.html', params))
  return [id, dose, email]
}

function sendEmail(email, subject, body) {
  MailApp.sendEmail({
    to: email,
    subject: subject,
    htmlBody: body,
    // inlineImages:
    //   {
    //     googleLogo: googleLogoBlob,
    //     youtubeLogo: youtubeLogoBlob
    //   }
  });

}

function testMail() {
  var emailQuotaRemaining = MailApp.getRemainingDailyQuota();
  console.log("Remaining email quota: " + emailQuotaRemaining);
}
