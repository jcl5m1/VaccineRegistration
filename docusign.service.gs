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

function testDocusignAPI() {
  // get account info
  var res = getDocusignAccountInfo();
  debug(res)
  debug("accountName" in res ? 'pass' : 'fail')

  // send form for signature
  // var email = DOCUSIGN_TEST_RECIPIENT_EMAIL
  // var name = DOCUSIGN_TEST_RECIPIENT_NAME
  // var res = requestDocusignSignatureUsingConfigTemplate(name, email);
  // debug(res)
  // debug(res.status == 'sent'? 'pass':'fail')

  // create embedded envlope
  // var email = DOCUSIGN_TEST_RECIPIENT_EMAIL
  // var name = DOCUSIGN_TEST_RECIPIENT_NAME
  // var res = createEmbeddedDocusignEnvelope(name, email);
  // debug(res)
  // debug(res.status == 'sent'? 'pass':'fail')

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

// test JWT authorization flow
function testJWT() {
  //open link in browser to provide consent for server to impersonate user
  // ignore site can't be reached error as long as code appears in the URL
  var res = getApplicationConsentURI();
  debug(res)

  // generate the encrypted JWT, then use the JWT to request an access token
  var jwt = generateDocusignJWT();
  debug(jwt)
  var res = tryDocusignJWT(jwt);
  debug(res)
  debug("access_token" in res ? "pass" : "fail")

  // test main getService in JWT mode
  var service = getService()
  debug(service.hasAccess())
  if (service.hasAccess()) {
    var res = getDocusignAccountInfo();
    debug(res)
    debug("accountName" in res ? 'pass' : 'fail')
  }

}

/**
 * Authorizes and makes a request to the Docusign API.
 */
function checkDocusignLogin() {
  if (docusignService == null)
    docusignService = getService();

  if (docusignService.hasAccess()) {
    return { service: docusignService }
  } else {
    var authorizationUrl = docusignService.getAuthorizationUrl();
    return { "authUrl": authorizationUrl }
  }
}

// call docusign REST api for account info
function getDocusignAccountInfo() {
  // default result without any additional parameters is account info
  return callDocusignAPI()
}

function downloadDocusignEnvelopeAsPDF(envelopeID, name) {

  //check if file already exists first
  var file = getFileByName(name)

  // file not found, download it from docusign
  if (file == null) {
    debug("downloading from docusign: " + name)
    //var res = callDocusignAPI('envelopes/' + envelopeID + '/documents','get',null, false)
    var res = callDocusignAPI('envelopes/' + envelopeID + '/documents/combined', 'get', null, true)
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


function createEmbeddedDocusignEnvelope(name, email, id) {

  // clientId = id
  // if(clientId == null)
  clientId = randomString(10).toUpperCase();

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
        "clientUserId": clientId,
      }
    ],
  }

  var res = callDocusignAPI("envelopes", 'post', payload)
  if ('authUrl' in res)
    return res

  var envelopeId = res.envelopeId

  // can't use script.google.com because it set 'X-Frame-Options' to 'sameorigin'
  // and won't allow a redirect to it.  so, using iframe as work around
  // safari still requires this to end the docusign session
  returnUrl = getScriptUrl();

  // create a recipent view URL
  payload = {
    "returnUrl": returnUrl,
    "authenticationMethod": "None",
    "email": email,
    "userName": name,
    "clientUserId": clientId,
  }

  // executor needs to be logged in
  var res = callDocusignAPI("envelopes/" + envelopeId + '/views/recipient', 'post', payload);
  if ('authUrl' in res)
    return res

  res.clientId = clientId;
  res.envelopeId = envelopeId;
  res.status = 'sent'
  return res;

}

// call docusign REST API to get envelope info
function getDocusignEnvelopeStatus(envelopeID) {
  var res = callDocusignAPI('envelopes/' + envelopeID)

  if ('authUrl' in res) {
    return res
  }

  // if the envelope is complete, download to google drive and populate download link
  var downloadUrl = ''
  if (res.status == 'completed') {
    file = downloadDocusignEnvelopeAsPDF(envelopeID, envelopeID + ".pdf")
    if (file) {
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
function callDocusignAPI(command, method, payload, as_blob) {

  //default parameter value
  if (as_blob == null)
    as_blob = false;

  if (payload == null)
    payload = undefined;  // fetch doesn't like null

  // login into docusign if needed for multiple events
  var res = checkDocusignLogin();
  debug(res)
  if ('authUrl' in res) {
    return res
  }

  var service = docusignService
  var storage = service.getStorage();
  var accountId = storage.getValue('account_id');
  var baseUri = storage.getValue('base_uri');
  var url = baseUri + '/restapi/v2.1/accounts/' + accountId;
  if (command) {
    url += '/' + command;
  }
  debug(url)
  if (method == null)
    method = 'get'

  var response = UrlFetchApp.fetch(url,
    {
      method: method,
      headers: { Authorization: 'Bearer ' + service.getAccessToken() },
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    }
  )

  if (as_blob)
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
  var service = OAuth2.createService('DocuSign')
    // Set the endpoint URLs.
    .setAuthorizationBaseUrl('https://' + OAUTH_HOST + '/oauth/auth')

    // Set the client ID
    .setClientId(CLIENT_ID)

    // Set the property store where authorized tokens should be persisted.
    .setPropertyStore(PropertiesService.getUserProperties());

  if (DOCUSIGN_PRIVATE_KEY == null) {
    // OAuth setup
    service.setTokenUrl('https://' + OAUTH_HOST + '/oauth/token')

    // Set the name of the callback function that should be invoked to
    // complete the OAuth flow.
    service.setCallbackFunction('authCallback')

    // Set the client secret.
    service.setClientSecret(CLIENT_SECRET)

    // Set the "Authorization" header when requesting tokens, as required by the
    // API.
    service.setTokenHeaders({
      'Authorization': 'Basic ' +
        Utilities.base64Encode(CLIENT_ID + ':' + CLIENT_SECRET)
    });
    // Set the scope. The "signature" scope is used for all endpoints in the
    // eSignature REST API.
    service.setScope('signature')
  } else {

    //JWT setup
    service.setPrivateKey(DOCUSIGN_PRIVATE_KEY)
    service.setScope('signature impersonation')
    service.setTokenUrl(OAUTH_HOST)
    service.setSubject(DOCUSIGN_API_USERNAME)

    //OAuth2 library doesn't do JWT base64Encode correctly, using custom version
    if (!service.hasAccess()) {
      debug("Authorizing using JWT...")
      var jwt = generateDocusignJWT();
      var token = tryDocusignJWT(jwt);
      token.granted_time = Math.round(Date.now() / 1000);

      debug('1619111551')
      debug(token.granted_time)
      service.saveToken_(token);
      storeDocusignUserInfo(service)
    }
  }
  return service;
};

// Get the user info to determine the ase URI and account ID needed for
// future requests.
function storeDocusignUserInfo(service) {
  var url = 'https://' + OAUTH_HOST + '/oauth/userinfo';
  var response = UrlFetchApp.fetch(url, {
    headers: {
      Authorization: 'Bearer ' + service.getAccessToken()
    }
  });
  var result = JSON.parse(response.getContentText());

  // Find the default account.
  var account = result.accounts.filter(function (account) {
    return account.is_default;
  })[0];

  // Store the base URI and account ID for later.
  var storage = service.getStorage();
  storage.setValue('account_id', account.account_id);
  storage.setValue('base_uri', account.base_uri);
}

/**
 * Handles the OAuth callback.
 */
function authCallback(request) {
  var service = getService();
  var authorized = service.handleCallback(request);
  if (authorized) {
    storeDocusignUserInfo(service)
    return HtmlService.createHtmlOutput("<div style=\"display: flex; height: 100vh;\"><div style=\"margin: auto;\">Login Success! You can close this window and refresh the original page.</div></div>");
  } else {
    return HtmlService.createHtmlOutput("<div style=\"display: flex; height: 100vh;\"><div style=\"margin: auto;\">Login Failed!</div></div>");
  }
}

/**
 * Logs the redict URI to register in the Dropbox application settings.
 */
function logRedirectUri() {
  Logger.log(OAuth2.getRedirectUri());
}

//get conset url for generating JWT
//https://developers.docusign.com/platform/auth/jwt/jwt-get-token/
function getApplicationConsentURI() {
  var redirect_uri = 'https://localhost:3000/auth/docusign/callback' // not important, just need a result page after approval
  var uri = 'https://account-d.docusign.com/oauth/auth?response_type=code&scope=signature&client_id=' + DOCUSIGN_INTEGRATION_KEY + '&redirect_uri=' + redirect_uri;
  return uri;
}

// Sign token using RSASHA256 algorithm
function createJWT(privateKey, expiresInHours, data) {
  const header = {
    alg: 'RS256',
    typ: 'JWT',
  };

  const now = Date.now();
  const expires = new Date(now);
  expires.setHours(expires.getHours() + expiresInHours);

  // iat = issued time, exp = expiration time
  const payload = {
    exp: Math.round(expires.getTime() / 1000),
    iat: Math.round(now / 1000),
  };

  // add user payload
  Object.keys(data).forEach(function (key) {
    payload[key] = data[key];
  });

  function base64Encode(text, json) {
    const data = json ? JSON.stringify(text) : text;
    return Utilities.base64EncodeWebSafe(data).replace(/=+$/, '');
  };

  const toSign = base64Encode(header, true) + '.' + base64Encode(payload, true);
  const signatureBytes = Utilities.computeRsaSha256Signature(toSign, privateKey);
  const signature = base64Encode(signatureBytes, false);
  return toSign + '.' + signature;
};

function generateDocusignJWT() {
  const payload = {
    iss: DOCUSIGN_INTEGRATION_KEY,
    sub: DOCUSIGN_API_USERNAME,
    aud: OAUTH_HOST,
    scope: "signature impersonation"
  }

  return createJWT(DOCUSIGN_PRIVATE_KEY, 1, payload);
};

function tryDocusignJWT(accessToken) {
  var response = UrlFetchApp.fetch('https://account-d.docusign.com/oauth/token',
    {
      'method': 'post',
      'payload': {
        'grant_type': 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        'assertion': accessToken,
      },
      'muteHttpExceptions': true
    }
  )
  return JSON.parse(response.getContentText())
}