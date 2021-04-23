function sendAppointmentEmail(formObject) {
    var message = 'test message';
    var subject = 'COVID-19 Vaccine Appointment Confirmation';
    MailApp.sendEmail(formObject.Email, subject, message);
}

function testMail(){
  var emailQuotaRemaining = MailApp.getRemainingDailyQuota();
  console.log("Remaining email quota: " + emailQuotaRemaining);
}
