
function uploadImage(name, img) {
    var destination = DriveApp.getFolderById(GOOGLE_DRIVE_FOLDER_ID);
    var contentType = 'image/jpeg';
    var blob = img.getAs(contentType);
    blob.setName(name);
    return destination.createFile(blob);
}

function uploadAsType(name, data, contentType) {
  var destination = DriveApp.getFolderById(GOOGLE_DRIVE_FOLDER_ID);
  var blob = data.getAs(contentType);
  blob.setName(name);
  return destination.createFile(blob);
}

//assumes only 1 file by name
function getFileByName(name) {
  var res = DriveApp.getFolderById(GOOGLE_DRIVE_FOLDER_ID).getFilesByName(name)
  if(res.hasNext())
    return res.next();
}

function testDrive(){

  // list folder
  // var files = DriveApp.getFolderById(GOOGLE_DRIVE_FOLDER_ID).getFiles();
  // while (files.hasNext()) {
  //   var file = files.next();
  //   Logger.log(file.getName());
  // }

  var res = getFileByName('16177591600882177527466622953471.jpg')
  console.log(Utilities.base64Encode(res.getBlob().getBytes()).slice(0,50))
}