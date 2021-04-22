
// find server side ip to restrict APIkey usage
function getIP() {
  var data = UrlFetchApp.fetch('https://www.cloudflare.com/cdn-cgi/trace');
  var re = RegExp(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/);
  var ip = re.exec(data)[0];
  console.log(ip);
  return ip;
}

function testVisionAPI() {
  var name = '1617767629200_camera.jpg'
  res = makeVisionAPIRequestWithDriveFilename(name)
  for (var i in res) {
    console.log(JSON.stringify(res[i]))
  }
}

function makeVisionAPIRequestWithDriveFilename(name) {
  var blob = getImageByName(name).getBlob()
  return makeVisionAPIRequestWithBase64Blob(Utilities.base64Encode(blob.getBytes()))
}

// loads the drive image into a blob and does base64 encoding into the JSON object
// slow for large images
function buildJSONRequestWithBase64Blob(base64blob) {
  return JSON.stringify({
    "requests": [
      {
        "image": {
          "content": base64blob
        },
        "features": [
          {
            "type": "DOCUMENT_TEXT_DETECTION",
            "maxResults": 1
          }
        ]
      }
    ]
  });
}

function buildJSONRequestImgUrl(imgUrl) {
  return JSON.stringify({
    requests: [{
      image: {
        source: {
          imageUri: imgUrl
        }
      },
      features: [{
        type: "DOCUMENT_TEXT_DETECTION",
        maxResults: 1
      }]
    }]
  });
}


function regex_test() {
  var text = "MEDICARE HEALTH INSURANCE 1-800-MEDICARE (1-800-633-4227) SAMPLE NAME OF BENEFICIARY JOHN DOE MEDICARE CLAIM NUMBER SEX 000-00-0000-A MALE IS ENTITLED TO EFFECTIVE DATE HOSPITAL (PART A) 01-01-2007 MEDICAL (PART B) 01-01-2007 SIGN HERE";
  var beneficiary = extractText(text, 'BENEFICIARY', 'MEDICARE')
  var medicareClaimNumber = text.match(/\d\d\d-\d\d-\d\d\d\d-[AB]/g)[0];
  console.log(beneficiary);
  console.log(medicareClaimNumber);
}

function makeVisionAPIRequest(imgUrl) {
  // Make a POST request to Vision API with a JSON payload.      
  var visionApiUrl = 'https://vision.googleapis.com/v1/images:annotate?key=' + GOOGLE_CLOUD_VISION_API_KEY;
  var JSON_REQ = buildJSONRequestImgUrl(imgUrl);
  var options = {
    'method': 'post',
    'contentType': 'application/json',
    'payload': JSON_REQ
  };
  var response = UrlFetchApp.fetch(visionApiUrl, options);
  return JSON.parse(response.getContentText())["responses"][0]['textAnnotations'];
}

function makeVisionAPIRequestWithBase64Blob(base64blob) {
  // Make a POST request to Vision API with a JSON payload.      
  var visionApiUrl = 'https://vision.googleapis.com/v1/images:annotate?key=' + GOOGLE_CLOUD_VISION_API_KEY;
  var JSON_REQ = buildJSONRequestWithBase64Blob(base64blob);
  var options = {
    'method': 'post',
    'contentType': 'application/json',
    'payload': JSON_REQ
  };
  var response = UrlFetchApp.fetch(visionApiUrl, options);
  return JSON.parse(response.getContentText())["responses"][0]['textAnnotations'];
}
