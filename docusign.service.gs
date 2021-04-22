/*
 * This sample demonstrates how to configure the library for the DocuSign API.
 * Instructions on how to generate OAuth credentuals is available here:
 * https://developers.docusign.com/esign-rest-api/guides/authentication/oauth2-code-grant
 */

// Docusign dashboard: https://appdemo.docusign.com/home


var CLIENT_ID = DOCUSIGN_INTEGRATION_KEY;
var CLIENT_SECRET = DOCUSIGN_SECRET_KEY;

// To connect to developer sandbox accounts, use the host
// "account-d.docusign.com". For production accounts, use
// "account.docusign.com".
var OAUTH_HOST = 'account-d.docusign.com';

var docusignService = null;

function testDocusign(){

    // send form for signature
    // var email = DOCUSIGN_TEST_RECIPIENT_EMAIL
    // var name = DOCUSIGN_TEST_RECIPIENT_NAME
    // var res = requestDocusignSignatureUsingConfigTemplate(name, email);
    // debug(res)
    // debug(res.status == 'sent'? 'pass':'fail')

    // create envlope
    var email = DOCUSIGN_TEST_RECIPIENT_EMAIL
    var name = DOCUSIGN_TEST_RECIPIENT_NAME
    var res = createEmbeddedDocusignEnvelope(name, email);
    debug(res)
    debug(res.status == 'sent'? 'pass':'fail')



    // // check status of envelope
    // var envelopeID = DOCUSIGN_TEST_ENVELOPE_ID
    // var res = getDocusignEnvelopeStatus(envelopeID)
    // debug(res)
    // debug(res.status == 'completed'? 'pass':'fail')

    // download envelope as PDF into Google Drive
    // var envelopeID = DOCUSIGN_TEST_ENVELOPE_ID
    // var res = downloadDocusignEnvelopeAsPDF(envelopeID,envelopeID+".pdf")
    // debug(res)
    // debug("name" in res ? 'pass':'fail')
}

/**
 * Authorizes and makes a request to the Docusign API.
 */
function checkDocusignLogin() {
  if(docusignService == null)
    docusignService = getService();
  if (docusignService.hasAccess()) {
    return {service: docusignService}
  } else {
    var authorizationUrl = docusignService.getAuthorizationUrl();
    return {"authUrl": authorizationUrl }
  }
}

// call docusign REST api for account info
function getDocusignAccountInfo(){
  // default result without any additional parameters is account info
  return callDocusignAPI()
}

function downloadDocusignEnvelopeAsPDF(envelopeID, name) {

  //check if file already exists first
  var file = getFileByName(name)

  // file not found, download it from docusign
  if(file == null) {
    debug("downloading from docusign: " + name)
    //var res = callDocusignAPI('envelopes/' + envelopeID + '/documents','get',null, false)
    var res = callDocusignAPI('envelopes/' + envelopeID + '/documents/combined','get',null, true)
    file = uploadAsType(name, res, 'application/pdf');
  }

  return {
    name: file.getName(),
    mimeType: file.getMimeType(),
    dateCreated: file.getDateCreated(),
    downloadUrl: file.getDownloadUrl(),
    envelopeID: envelopeID, 
    id: file.getId(),
  }
}

// call docusign REST API to create a new envelope and send to signer using config template ID and subjet
function requestDocusignSignatureUsingConfigTemplate(name, email) {
  payload = {
  "emailSubject": DOCUSIGN_EMAIL_SUBJECT,
  "status": "sent",
  "templateId": DOCUSIGN_TEMPLATE_ID,
  "templateRoles": [
      {
      "email": email,
      "name": name,
      "roleName": DOCUSIGN_TEMPLATE_ROLE,
      } 
    ]
  }
  return callDocusignAPI("envelopes", 'post', payload)
}


function createEmbeddedDocusignEnvelope(name, email){

  clientID = randomString(10).toUpperCase();

  // create envelope
  payload = {
    "emailSubject": DOCUSIGN_EMAIL_SUBJECT,
    "status": "sent",
    "templateId": DOCUSIGN_TEMPLATE_ID,
      "templateRoles": [
      {
      "email": email,
      "name": name,
      "roleName": DOCUSIGN_TEMPLATE_ROLE,
      "clientUserId": clientID,
      } 
    ],
  }

  var res = callDocusignAPI("envelopes", 'post', payload)
  if ('authUrl' in res)
    return res

  var envelopeID = res.envelopeId

  // can't use script.google.com because it set 'X-Frame-Options' to 'sameorigin'
  // and won't allow a redirect to it.  so, using iframe as work around
  returnUrl = "https://none";

  // create a recipent view URL
  payload = {
    "returnUrl": returnUrl,
    "authenticationMethod": "None",
    "email": email,
    "userName": name,
    "clientUserId": clientID,
  }

  var res = callDocusignAPI("envelopes/"+envelopeID+'/views/recipient', 'post', payload);
  if ('authUrl' in res)
    return res

  res.clientID = clientID;
  res.envelopeID = envelopeID;
  return res;

}

// call docusign REST API to get envelope info
function getDocusignEnvelopeStatus(envelopeID) {
  var res = callDocusignAPI('envelopes/' + envelopeID)
  
  if('authUrl' in res) {
    return res
  }

  // if the envelope is complete, download to google drive and populate download link
  var downloadUrl = ''
  if(res.status == 'completed'){
    file = downloadDocusignEnvelopeAsPDF(envelopeID, envelopeID+".pdf")
    if(file) {
      downloadUrl = file.downloadUrl
    }
  }

  // strip out only the required subset of data to client, a bit more secure since remaining data stays on server side
  return {
    envelopeId: res.envelopeId,    
    status: res.status,
    sentDateTime: res.sentDateTime,
    downloadUrl: downloadUrl,
    completedDateTime: res.completedDateTime
  }
}

// call docusign REST API 
function callDocusignAPI(command, method, payload, as_blob){

  //default parameter value
  if(as_blob == null)
    as_blob = false;

  if(payload == null)
    payload = undefined;  // fetch doesn't like null

  // login into docusign if needed for multiple events
    var res = checkDocusignLogin();
    if('authUrl' in res) {
      return res
    }

    var service = docusignService
    var storage = service.getStorage();
    var accountId = storage.getValue('account_id');
    var baseUri = storage.getValue('base_uri');

    var url = baseUri + '/restapi/v2.1/accounts/' + accountId;
    if(command) {
      url += '/'+command;
    }
    debug(url)
    if(method == null)
      method = 'get'

    var response = UrlFetchApp.fetch(url, 
      { method: method, 
        headers: { Authorization: 'Bearer ' + service.getAccessToken() },
        contentType: 'application/json',
        payload: JSON.stringify(payload),
        muteHttpExceptions: true
      }
    )

    if(as_blob)
      return response.getBlob();
    else
      return JSON.parse(response.getContentText())
}

/**
 * Reset the authorization state, so that it can be re-tested.
 */
function logoutDocusign() {
  getService().reset();
}

/**
 * Configures the service.
 */
function getService() {
  return OAuth2.createService('DocuSign')
    // Set the endpoint URLs.
    .setAuthorizationBaseUrl('https://' + OAUTH_HOST + '/oauth/auth')
    .setTokenUrl('https://' + OAUTH_HOST + '/oauth/token')

    // Set the client ID and secret.
    .setClientId(CLIENT_ID)
    .setClientSecret(CLIENT_SECRET)

    // Set the name of the callback function that should be invoked to
    // complete the OAuth flow.
    .setCallbackFunction('authCallback')

    // Set the property store where authorized tokens should be persisted.
    .setPropertyStore(PropertiesService.getUserProperties())

    // Set the scope. The "signature" scope is used for all endpoints in the
    // eSignature REST API.
    .setScope('signature')

    // Set the "Authorization" header when requesting tokens, as required by the
    // API.
    .setTokenHeaders({
      'Authorization': 'Basic ' +
          Utilities.base64Encode(CLIENT_ID + ':' + CLIENT_SECRET)
    });
};

/**
 * Handles the OAuth callback.
 */
function authCallback(request) {
  var service = getService();
  var authorized = service.handleCallback(request);
  if (authorized) {
    // Get the user info to determine the ase URI and account ID needed for
    // future requests.
    var url = 'https://' + OAUTH_HOST + '/oauth/userinfo';
    var response = UrlFetchApp.fetch(url, {
      headers: {
        Authorization: 'Bearer ' + service.getAccessToken()
      }
    });
    var result = JSON.parse(response.getContentText());

    // Find the default account.
    var account = result.accounts.filter(function(account) {
      return account.is_default;
    })[0];

    // Store the base URI and account ID for later.
    var storage = service.getStorage();
    storage.setValue('account_id', account.account_id);
    storage.setValue('base_uri', account.base_uri);

    return HtmlService.createHtmlOutput('Login Success!  You can close this window and refresh the original page.');
  } else {
    return HtmlService.createHtmlOutput('Login Failed.');
  }
}

/**
 * Logs the redict URI to register in the Dropbox application settings.
 */
function logRedirectUri() {
  Logger.log(OAuth2.getRedirectUri());
}