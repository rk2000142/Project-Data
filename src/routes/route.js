const express = require('express');
const router = express.Router();

const UrlController = require('../controllers/urlController.js');

router.post('/url/shorten', UrlController.createUrl);
router.get('/:urlCode', UrlController.getUrl);

router.all("/*",function(req,res){
    res.status(400).send({
        status:false,msg:"The endpoint is not correct"
    });
  });

module.exports = router;