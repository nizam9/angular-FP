var router = require('express').Router();

require('./fileUpload').route(router);

module.exports = router;
