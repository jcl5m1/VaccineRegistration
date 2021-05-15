function sendAppointmentEmail(formObject) {
  var message = 'test message';
  var subject = 'COVID-19 Vaccine Appointment Confirmation';
  MailApp.sendEmail(formObject.Email, subject, message);
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
