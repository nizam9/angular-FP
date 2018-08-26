var fs = require('fs-extra');
var path = require('path');
var busboy = require('connect-busboy'); //middleware for form/file upload
var http = require('http');
var multer = require("multer");


uploadFile = (function (req, res) {
  console.log(req.body);
  var appRoot = path.resolve(__dirname);
  var fStream;
  appRoot = path.resolve(appRoot, "../", "assets");
  req.pipe(req.busboy);
  var upload = multer({
    dest: appRoot
  });
  //   Busboy doesn't parse request if it's not multipart/form-data.

  req.busboy.on('file', (unused, file, fileName) => {
    console.log(file);
    var temp_filename = new Date().getTime() + "." + fileName.split('.')[1];
    var new_filename = appRoot + '/' + temp_filename;

    fStream = fs.createWriteStream(new_filename);
    file.pipe(fStream);


    fStream.on('close', () => {
      res.send({
        status: "success",
        message: "Image uploaded",
        imageUrl: new_filename
      });
    })

  })

})


// FILE UPLOAD USING MULTER

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './assets')
  },
  filename: function (req, file, cb) {
    let extArray = file.mimetype.split("/");
    let extension = extArray[extArray.length - 1];
    cb(null, file.fieldname + '-' + Date.now() + '.' + extension)
  }
})

var upload = multer({
  storage: storage
})

uploadAssets = function (req, res) {
  res.send({
    status: "success",
    message: "Image uploaded",
    fileData: req.files,
    otherData: req.body
  });
}

module.exports.route = function (router) {
  router.post('/uploadImage', uploadFile); // NATIVE FILE UPLOAD METHOD (ACCEPTS ONE AT A TIME)
  router.post('/uploadFile', upload.array('files', 22), uploadAssets); // API FOR FILE UPLOAD USING MULTER
};