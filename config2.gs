// Put private key and configruation information in this file.  
// Once you add your information, DO NOT CHECK THIS INTO GITHUB because it may become publicly visible

// use to toggle developer version of the tool on/off
var DEVELOPER_MODE = false

//Google drive id of your project folder
var GOOGLE_DRIVE_FOLDER_ID = '12IKdjXvPmQPY1bN-s-bR-5TYGICB5m0N'

//Google drive id of your main spreadsheet
var GOOGLE_SPREADSHEET_ID = '1Tu_2g4zH3zLDevBBZYHBpyg6J6ndhgNTLp0YmbbS2dM';

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
var QR_CODE_URL = 'https://chart.googleapis.com/chart?chs=150x150&cht=qr&choe=UTF-8&chl='
var ENABLE_QR_CODE = true

var HELP_PHONE_NUMBER = '555-555-5555';
var HELP_EMAIL = 'help@testemail.com';

var FRONT_PAGE_LOGO_IMAGE = 'https://www.fairfaxpediatrics.com/wp-content/uploads/2020/04/FPA-fulllogo-tiny.png'

//Docusign config
var DOCUSIGN_INTEGRATION_KEY = '3ef3f422-2016-448a-a601-0d562323cb2d'
var DOCUSIGN_SECRET_KEY = '27705216-ad46-48ee-8f68-855ff0fa52ac'
var DOCUSIGN_EMAIL_SUBJECT = "COVID Vaccine Consent Form"
var DOCUSIGN_TEMPLATE_ID = "e61c36b6-cca8-44df-97d3-2f1abe3504dc"
var DOCUSIGN_TEMPLATE_ROLE = "Patient"
var DOCUSIGN_TEST_RECIPIENT_EMAIL = "jcl5m1+test@gmail.com"
var DOCUSIGN_TEST_RECIPIENT_NAME = "John Doe"
var DOCUSIGN_TEST_ENVELOPE_ID = '71741d0a-bf3f-4755-86d5-dddb629ba1cd' //completed

// required for JWT Auth flow

var DOCUSIGN_API_USERNAME = '6ddaf671-512f-448b-98bb-c9f818716de5'; //https://admindemo.docusign.com/users

var DOCUSIGN_PUBLIC_KEY = '-----BEGIN PUBLIC KEY-----\n\
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAuWpH0ObOPp8dBKOSU2N3\n\
zZAStXqSSsnkRykE7aToNjU8oL4/nOyfherX4ztBLwo+zmboiXAFn0J2nkCcy4fC\n\
xzLxsFcnC2mAjPVT+PXVCWLksT9W0GxLFG0pStgoM2aFLvfOIMjar+Cc40M8Yv2e\n\
3pcD9tnqUk6LswzPVdPqKRb/qhHSJkCagetwYOybGQNz0EGYJIRauq1s9boS1SB7\n\
QxzsUd3HvXx2sW4IVnQpilS3QFDDKaar0ivAKZRmTul2pgEyBNdcm8gu9jLY/Oz1\n\
YDCMs/XblL0BNTd/9odnu2QbNQEWRiaLMhDpfi5p8kcUpQ9ZpJWCwxQ8VJ5UDc/N\n\
dwIDAQAB\n\
-----END PUBLIC KEY-----';

/*
RSA keys required for JWT Grant Authentication (server can impersonate an authorized user without user present to login to Docusign), docusign generates a RSA PRIVATE KEY. However, App Script's Utilities.computeRsaSha256Signature requires a PRIVATE KEY for encrypting the JWT. Converting the private key is a manual step using openssl. Sad. Possible to do this in App Script?

https://stackoverflow.com/questions/36614051/computersasha256signature-returns-invalid-argument-key-error-when-key-is-publ/36700930#36700930

Also appscript requires new lines to be converted to \n. Muliline string requires the additional \. Easiest with a text editor.
*/

var DOCUSIGN_PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----\n\
MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQC5akfQ5s4+nx0E\n\
o5JTY3fNkBK1epJKyeRHKQTtpOg2NTygvj+c7J+F6tfjO0EvCj7OZuiJcAWfQnae\n\
QJzLh8LHMvGwVycLaYCM9VP49dUJYuSxP1bQbEsUbSlK2CgzZoUu984gyNqv4Jzj\n\
Qzxi/Z7elwP22epSTouzDM9V0+opFv+qEdImQJqB63Bg7JsZA3PQQZgkhFq6rWz1\n\
uhLVIHtDHOxR3ce9fHaxbghWdCmKVLdAUMMppqvSK8AplGZO6XamATIE11ybyC72\n\
Mtj87PVgMIyz9duUvQE1N3/2h2e7ZBs1ARZGJosyEOl+LmnyRxSlD1mklYLDFDxU\n\
nlQNz813AgMBAAECggEAPhyORjqrKGsgy2cII4sUnPYAbm7LBuau4++nyPwPFemr\n\
j6VrpePWZIQRIfu9kEZ8V6Q9jZzLJVicZ9L5M20dIKG+OPZZDAehmpasNKAVZ3mL\n\
ZpzzNgqw8/zFcl8KyH01bFBy6qSeLYCuzaq+VeLkD2jDWTQSvNO3FJnb8sJ0lKKf\n\
f2Sig/0YC17m7kmyubf4eu29e4HHrDtzqGY7hcLVyW/NvDz6kHis1wxqQ6txjHzt\n\
MW3yVv06DCs4mGhKUZweLVDsarQqkmso6Gwp16VIzV3CTy1lsHmsTEuaGj6VMfsl\n\
g+H6TJDIjxCGWl2PUBHYV2Oqf98qY7QIKqyTBfuZAQKBgQDmEgCUqN6EajqDwNAc\n\
n3CQCWZHGHBemvjdL5ktjpmjEInUr6bmy0FDYsKpZfbj3F30wgc2LoTPyIVlwYDx\n\
Qo/pQMYz3aYPIkU8aU2ptKr0+Z5fvWdw4HArZbWd+uVa+LuooCBBhPzK72Y1et8R\n\
/yKRc0PsKgbAI9XKudgI9HWuwQKBgQDOT+LC847FF3JlWM9nmnLv3sI3xoTG82Gh\n\
tbwZ3ZNriiDToLCtb3n9aiCjqrcAgkD+6kadaWa9Nrcotnj3mmVbARkz+8LcSeRk\n\
exCtGprCCArePf5TmByk2/BaHR1bas1NKXEqaHV2eRYm7kxctjCofpebzPTV2iYq\n\
6K7b2VnCNwKBgA2HlX0oiR1kWdiRqCtmvOnbg6Y+q60ElAn92JYzQpmySUi2o6wC\n\
2+2oiyYHFwPDW8se9embxrepZR7cyEZn0aq34m/+YtuU+llZH/YQ59TMMSIUM1cR\n\
+8axjoKh1IcLBY4fDIaN2YfdmDcg6KlYRaIkEyR6PDdkZBgt4aR1K86BAoGAXmmS\n\
ZRKeSDV1pUliCJBWfsza5jlTs9PW3vDStqd+eh0I7q+/im7UTZLOgvdxrart4XoG\n\
fKyqVnZ+lQQEEZM3RNEY3oAc6UBrY0wqEn11SsvxZUjLZSfcG9mGgUaHk7kpYGFR\n\
p02MS34YFBLDIT5CwCjGaob9mAuvob0/n940RDsCgYB6AhQ/svaWUK8DFdFMrZrj\n\
AFWtRhH++kqJu4F9gfkzDQUnfzSiXGxDGi+Xs0+ECzgq1IknmfuDZKOVynA2Tj6H\n\
8pF6kfBskPtDDV5MA7+ZekwuzeZxl3NZuTuWwZWHF/TIPLDlm7WIfiXn6MWvNfx/\n\
3GxOXnRQ05WJbWlz6J3+Cg==\n\
-----END PRIVATE KEY-----';



