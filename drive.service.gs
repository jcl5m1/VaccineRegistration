
function uploadImage(name, img) {
    var destination = DriveApp.getFolderById(folderId)
    var contentType = 'image/jpeg'
    var blob = img.getAs(contentType)
    blob.setName(name)
    destination.createFile(blob)
}

//assumes only 1 file by name
function getImageByName(name) {
  return DriveApp.getFolderById(folderId).getFilesByName(name).next();
}

function testDrive(){

  // list folder
  // var files = DriveApp.getFolderById(folderId).getFiles();
  // while (files.hasNext()) {
  //   var file = files.next();
  //   Logger.log(file.getName());
  // }

  var res = getImageByName('16177591600882177527466622953471.jpg')
  console.log(Utilities.base64Encode(res.getBlob().getBytes()).slice(0,50))
}