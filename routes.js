var express = require('express');

var router = express.Router();
var bodyParser = require("body-parser") // call body parser module and make use of it
router.use(bodyParser.urlencoded({extended:true}));

router.use(require('./controller/admincontroller'))
router.use(require('./controller/staticpages'))
//router.use(require('./controller/admin'))
router.use(require('./controller/cart'))





module.exports = router;