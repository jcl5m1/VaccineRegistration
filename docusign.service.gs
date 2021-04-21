/*
 * This sample demonstrates how to configure the library for the DocuSign API.
 * Instructions on how to generate OAuth credentuals is available here:
 * https://developers.docusign.com/esign-rest-api/guides/authentication/oauth2-code-grant
 */

var CLIENT_ID = docusignIntegrationKey;
var CLIENT_SECRET = docusignSecretKey;

// To connect to developer sandbox accounts, use the host
// "account-d.docusign.com". For production accounts, use
// "account.docusign.com".
var OAUTH_HOST = 'account-d.docusign.com';

/**
 * Authorizes and makes a request to the Docusign API.
 */
function docusignConnect() {
  var service = getService();
  if (service.hasAccess()) {

    // send form for signature
    // var email = "jcl5m1+"+Date.now()+"@gmail.com"
    // var name = "John Doe"
    // var res = requestDocusignSignatureUsingTemplate(service, docusignEmailSubject, docusignTemplateID, name, email);

    // check status of envelope
//    var envelopeID = '71741d0a-bf3f-4755-86d5-dddb629ba1cd'
    var envelopeID = '0da3c930-913e-49ee-af94-b87a18f40763'
    var res = getDocusignEnvelopeStatus(service, envelopeID)
    debug(res)
    return res

  } else {
    var authorizationUrl = service.getAuthorizationUrl();
    debug(authorizationUrl)
    return {"authUrl": authorizationUrl }
  }
}

// call docusign REST api for account info
function getDocusignAccountInfo(service){
  // default result without any additional parameters is account info
  return callDocusignAPI(service)
}

// call docusign REST API to create a new envelope and send to signer
function requestDocusignSignatureUsingTemplate(service, subject, templateID, name, email) {
  payload = {
  "emailSubject": subject,
  "status": "sent",
  "templateId": templateID,
  "templateRoles": [
      {
      "email": email,
      "name": name,
      "roleName": "Patient"
      } 
    ]
  }
  return callDocusignAPI(service,"envelopes", 'post', payload)
}

// call docusign REST API to get envelope info
function getDocusignEnvelopeStatus(service, envelopeID) {
  var res = callDocusignAPI(service,'envelopes/' + envelopeID)
  return {
    status: res.status,
    sentDatTime: res.sentDateTime,
    completedDateTime: res.completedDateTime
  }
}

// call docusign REST API 
function callDocusignAPI(service, command, method, payload){
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
    return JSON.parse(response.getContentText());
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
    return HtmlService.createHtmlOutput('Login Denied.');
  }
}

/**
 * Logs the redict URI to register in the Dropbox application settings.
 */
function logRedirectUri() {
  Logger.log(OAuth2.getRedirectUri());
}