const express = require('express');
const router = express.Router();
const JSONResponse  = dicontainer.get( "JSONResponse" );
const DB              = dicontainer.get( "DB" );
const pathUtil        = dicontainer.get( "pathUtil" );
const module_path     = pathUtil.basename( __filename );

router.post('/Kpay', JSONResponse.isLoggedin, async function(req, res) {
    let amount = req.body.amount;
    let userid = req.user.userid;
    var sendData = {};
    var sql = `UPDATE /* ?.chargeKpay */ tb_user SET K_PAY = K_PAY + ? WHERE user_id = ?`;
    let Kpay_content = await DB.Sql( sql, [ module_path, amount, userid ]);
    if(Kpay_content.changedRows==1){
        res.send({data : sendData, status : true});
    }else{
        res.send({data : sendData, status : false});
    };
  });

  router.post('/UZpay', JSONResponse.isLoggedin, async function(req, res) {
    let amount = req.body.amount;
    let userid = req.user.userid;
    var sendData = {};
    var sql = `UPDATE /* ?.chargeUZpay */ tb_user SET UZ_PAY = UZ_PAY + ? WHERE user_id = ?`;
    let UZpay_content = await DB.Sql( sql, [ module_path, amount, userid ]);
    sendData.UZpay_amount = amount;
    if(UZpay_content.changedRows==1){
        res.send({data : sendData, status : true});
    }else{
        res.send({data : sendData, status : false});
    };
  });

  module.exports = router;

