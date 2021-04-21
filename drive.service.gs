
function uploadImage(name, img) {
    var destination = DriveApp.getFolderById(GOOGLE_DRIVE_FOLDER_ID)
    var contentType = 'image/jpeg'
    var blob = img.getAs(contentType)
    blob.setName(name)
    destination.createFile(blob)
}

//assumes only 1 file by name
function getImageByName(name) {
  return DriveApp.getFolderById(GOOGLE_DRIVE_FOLDER_ID).getFilesByName(name).next();
}

function testDrive(){

  // list folder
  // var files = DriveApp.getFolderById(GOOGLE_DRIVE_FOLDER_ID).getFiles();
  // while (files.hasNext()) {
  //   var file = files.next();
  //   Logger.log(file.getName());
  // }

  var res = getImageByName('16177591600882177527466622953471.jpg')
  console.log(Utilities.base64Encode(res.getBlob().getBytes()).slice(0,50))
}