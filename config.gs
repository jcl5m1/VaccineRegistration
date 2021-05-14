// Put private key and configruation information in this file.  
// Once you add your information, DO NOT CHECK THIS INTO GITHUB because it may become publicly visible

// use to toggle developer version of the tool on/off
var DEVELOPER_MODE = false

//Google drive id of your project folder
var GOOGLE_DRIVE_FOLDER_ID = 'YOUR_FOLDER_ID'

//Google drive id of your main spreadsheet
var GOOGLE_SPREADSHEET_ID = 'YOUR_SHEET_ID';

//cloud vision API key for OCR services
var GOOGLE_CLOUD_VISION_API_KEY = 'YOUR_VISION_API_KEY';

//Docusign config
var DOCUSIGN_INTEGRATION_KEY = 'YOUR_INTEGRATION_KEY'
var DOCUSIGN_SECRET_KEY = 'YOUR_SECRET_KEY'
var DOCUSIGN_TEMPLATE_ID = "YOUR_TEMPLATE_ID"
var DOCUSIGN_TEMPLATE_ROLE = "Patient"
var DOCUSIGN_EMAIL_SUBJECT = "COVID Vaccine Consent Form"
var DOCUSIGN_TEST_RECIPIENT_EMAIL = "YOUR_TEST_EMAIL"
var DOCUSIGN_TEST_RECIPIENT_NAME = "YOUR_TEST_NAME"
var DOCUSIGN_TEST_ENVELOPE_ID = 'YOUR_TEST_ID'

//3rd party utilities/links
var WAIT_GIF_URL = 'https://media1.giphy.com/media/3oEjI6SIIHBdRxXI40/200.gif';
var QR_CODE_URL = 'http://chart.googleapis.com/chart?chs=150x150&cht=qr&choe=UTF-8&chl='
var ENABLE_QR_CODE = true

var HELP_PHONE_NUMBER = '555-555-5555';
var HELP_EMAIL = 'help@testemail.com';

var FRONT_PAGE_LOGO_IMAGE = 'YOUR_LOGO_URL'

// required for JWT Auth flow
var DOCUSIGN_API_USERNAME = 'YOUR_API_USERNAME';  //https://admindemo.docusign.com/users

/* 
RSA keys required for JWT Grant Authentication (server can impersonate an authorized user without user present to login to Docusign), docusign generates a RSA PRIVATE KEY.  However, App Script's Utilities.computeRsaSha256Signature requires a PRIVATE KEY for encrypting the JWT.  Converting the private key is a manual step using openssl.  Sad.  Possible to do this in App Script?

https://stackoverflow.com/questions/36614051/computersasha256signature-returns-invalid-argument-key-error-when-key-is-publ/36700930#36700930

Also appscript requires new lines to be converted to \n. Muliline string requires the additional \. Easiest with a text editor.
*/

var DOCUSIGN_PUBLIC_KEY = null; // non-RSA PRIVATE KEY