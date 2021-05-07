var CLIENT_ID =
  "358441841881-719d88b50spka3eug4puj136hsdehfmh.apps.googleusercontent.com";
var CLIENT_SECRET = "GLje72fQ3Ohz68GnPA5oJ2_R";

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
 * Try access OAuth API with access token.
 */
function testGetId() {
  var result = getID();
  debug(result);
}

function validateStaffEmail() {

}

/**#####################################
 * Check if user session is a validated staff session.
 *
 * Checks in the user properties if the session has been stored
 * as a staff session.
 *
 * @return {bool} Validated staff session.
 */
function validateStaffSession() {
  var userKey = Session.getTemporaryActiveUserKey();
  var prop_keys = PropertiesService.getScriptProperties().getKeys();
  var validated_session = false;

  if (prop_keys == null) {
    return validated_session;
  }
  if (prop_keys.indexOf(userKey) != -1) {
    validated_session = true;
  }
  return validated_session;
}

/**#####################################
 * Is initiated when Index.html first loads.
 *
 * Checks for stored records of the users. Then collects their user records
 * HTML containing their unique key the number of time that they have accessed the
 * web app and how many days and hours are remaning for them before their token
 * expires.
 *
 * @return {string} HTML data.
 */
function getID() {
  const UserProp = createUserProperty();
  var key = Object.keys(UserProp)[0];
  var prop = UserProp[key];
  var timeRemaining = getDaysAndHoursRemaining(prop.date, prop.currentDate, 30);

  var days = timeRemaining.days + " days";
  var hours = timeRemaining.hrs + " hours";

  if (prop.timesAccessed == 1) {
    ("This is the first time you have accessed this webApp");
  } else {
    "You have accessed this webApp " + prop.timesAccessed + " times.";
  }

  // Id text result output
  const textOutput =
    "<p>You have been assigned the unique token (you do not need to save this): </p>" +
    "<em>" +
    key +
    "</em>" +
  "<p> Your unique token will stay valid for " +
    days +
    " " +
    hours +
    ". <p>" +
    "<p><em> No other personal data was taken besides an anonymous temporary active user key</em><br>Please return to the home page. <br>TODO(hellojas): Add auto redirect?</p>";

  return textOutput;
}

/**#####################################
 * Collects a unique session key from the current users and
 * first compares it with current prop service list of keys.
 * If already exists it updates the current key:value pair.
 * If it is new, it adds it to the prop service along with the
 * initial startdate, adds times accessed to 1 and current date
 * last access.
 *
 * @return {object} object of user details.
 * @return {object.date} Start date of first time key was activated.
 * @return {object.timesAccessed} Count of times accessed.
 * @return {object.currentDate} Current date of last accessed.
 */
function createUserProperty() {
  const userSession = Session.getTemporaryActiveUserKey();

  var userProperty = {};
  var resultDic = {};

  //Check if current ID exists:
  var props = PropertiesService.getScriptProperties();

  debug(props);
  if (props.getKeys()[userSession]) {
    const currentVals = JSON.parse(props.getProperty(userSession));
    userProperty = {
      date: currentVals.date,
      timesAccessed: parseInt(currentVals.timesAccessed) + 1,
      currentDate: new Date(),
    };
  } else {
    userProperty = {
      date: new Date(),
      timesAccessed: 1,
      currentDate: new Date(),
    };
  }

  var userPropToString = JSON.stringify(userProperty);
  props.setProperty(userSession, userPropToString);
  resultDic[userSession] = userProperty;
  debug(resultDic);
  return resultDic;
}

/**#####################################
 * The total days and hours remianing of unique user access key.
 *
 * @param {date} startDate - the date the key was first given.
 * @param {date} currentDate - the current date of this access of the WebApp.
 * @param {number} expiryDays - Number of days unit the unique user key expires.
 *
 * @return {object} containing remaining days and hours.
 * @return {object.days} days remaning.
 * @return {object.hrs} hours remaining.
 */
function getDaysAndHoursRemaining(startDate, currentDate, expiryDays) {
  var start = new Date(startDate);
  var current = new Date(currentDate);

  var dateDifference = start.setDate(start.getDate() + expiryDays) - current;

  var millisecondsPerHour = 60 * 60 * 1000;
  var millisecondsPerDay = 24 * 60 * 60 * 1000;

  var daysRemaining = Math.floor(dateDifference / millisecondsPerDay);

  var millisecondsRemaining = dateDifference % millisecondsPerDay;
  var hoursRemaining = Math.floor(millisecondsRemaining / millisecondsPerHour);

  return { days: daysRemaining, hrs: hoursRemaining };
}

function deleteCurrentUserSession ( ) {
  const userSession = Session.getTemporaryActiveUserKey();
  var scriptProperties = PropertiesService.getScriptProperties();
  scriptProperties.deleteProperty(userSession);
  debug(scriptProperties.getKeys())
  Utilities.sleep(3000);// pause in the loop for 200 milliseconds

}

function getUserSession ( ) {
  const userSession = Session.getTemporaryActiveUserKey();
  var scriptProperties = PropertiesService.getScriptProperties();
  debug(scriptProperties.getKeys())
}