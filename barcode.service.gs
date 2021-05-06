// handle barcode parsing either client side (or server side) across browser
// currently only client side with Chrome.  barcode.js doesn't work in Safari, so it skips.

function generateBarcodeJavascript() {
  //returns a bunch of javascript, using an html file.
  //not sure how to elegantly do this with just a .gs file.
  return HtmlService.createTemplateFromFile('barcodeservice').getRawContent()
}
