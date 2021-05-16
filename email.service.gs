function sendAppointmentEmail(formObject) {
  var message = 'test message';
  var subject = 'COVID-19 Vaccine Appointment Confirmation';
  MailApp.sendEmail(formObject.Email, subject, message);
}

function sendAppointmentConfirmationEmail(id, dose) {

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
  email='jcl5m1@gmail.com'
  sendEmail(email, 'COVID-19 Vaccine Appointment Confirmation', importHTML('confirmation.email.html'))
  return [id, dose, email, appointment]
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
