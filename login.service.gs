var CLIENT_ID = "YOUR_CLIENT_ID";
var CLIENT_SECRET = "YOUR_CLIENT_SECRET";

// Enter required scopes (we only need email)
var SCOPES = ["https://www.googleapis.com/auth/userinfo.email"];
var AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
var TOKEN_URL = "https://accounts.google.com/o/oauth2/token";

// API URL for user info endpoint.
var API_URL = "https://www.googleapis.com/oauth2/v2/userinfo";

/**
 * Creates the URL for pasting in the browser, which will generate the code
 * to be placed in the CODE variable.
 */
function generateAuthUrl() {
  var payload = {
    scope: SCOPES.join(" "),
    // Specify that no redirection should take place
    redirect_uri: "urn:ietf:wg:oauth:2.0:oob",
    response_type: "code",
    access_type: "offline",
    client_id: CLIENT_ID,
  };
  var options = { payload: payload };
  var request = UrlFetchApp.getRequest(AUTH_URL, options);
  return AUTH_URL + "?" + request.payload;
}

/**
 * Generates a access token given the authorization code.
 */
function generateAccessToken(token) {
  var payload = {
    code: token,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    // Specify that no redirection should take place
    // This is Google-specific and not part of the OAuth2 specification.
    redirect_uri: "urn:ietf:wg:oauth:2.0:oob",
    grant_type: "authorization_code",
  };
  var options = { method: "POST", payload: payload, muteHttpExceptions: true };
  // Get the access token.
  var response = UrlFetchApp.fetch(TOKEN_URL, options);
  debug(response);

  //   if (response.getResponseCode() == 404) {
  //     Logger.log("Web page not found");
  //     return null
  //   }
  //   if (response.getResponseCode() == 400) {
  //     Logger.log("Request failed");
  //     return null
  //   }

  var data = JSON.parse(response.getContentText());
  if (data.access_token) {
    Logger.log("Success!");
    return data.access_token;
  } else {
    console.log("Error, failed to generate token.");
    Logger.log(
      "Error, failed to generate auth token: " + response.getContentText()
    );
    return null;
  }
}

/**
 * Try access OAuth API with access token.
 */
function tryOauthJWT(accessToken) {
  var params = {
    method: "GET",
    contentType: "application/json",
    headers: { Authorization: "Bearer " + accessToken },
    muteHttpExceptions: true,
  };
  var response = UrlFetchApp.fetch(API_URL, params);
  return JSON.parse(response.getContentText());
}

/**
 * Try and get user email given the auth token.
 */
function tryGetEmailWithToken(auth_token) {
  access_token = generateAccessToken(auth_token);
  if (access_token) {
    var response = tryOauthJWT(access_token);
    return response;
  } else {
    return "Unable to authorize your token! Please try logging in again.";
  }
}

/**
 * Test in App Script
 */
function testJWT() {
  // you can get a one-time code after logging in at login.html page
  var code = "YOUR_AUTH_CODE";
  access_token = generateAccessToken(code);
  debug(access_token);
  if (access_token) {
    var res = tryOauthJWT(access_token);
    debug(res);
  }
}
