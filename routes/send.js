const express = require('express');
const router = express.Router();
const JSONResponse  = dicontainer.get( "JSONResponse" );
const DB              = dicontainer.get( "DB" );
const pathUtil        = dicontainer.get( "pathUtil" );
const module_path     = pathUtil.basename( __filename );

/* POST */
router.post('/getlist', JSONResponse.isLoggedin, async function(req, res, next) {
    let userid = req.user.userid;

    let query = `
        SELECT /* ?.get past transaction lists */
            send_id,
            user_id,
            sent_amount,
            received_amount,
            transactionFee,
            DATE_FORMAT(reg_date,'%Y-%m-%d %H:%i:%S') AS reg_date,
            to_userid,
            send_type
        FROM tb_send
        where user_id = ?
    `;
    
    let result = await DB.Sql( query, [module_path, userid]);
    res.send({"data":result, "itemsCount":result.length});
  });

router.post('/checkpwd', JSONResponse.isLoggedin, async function(req, res){
    let pwd = req.body.pwd;
    let userid = req.user.userid;
    var sql = `SELECT /* ?.withdraw password */ withdrawpassword from tb_user where user_id = ?`;
    let PWDinfo = await DB.Sql( sql, [ module_path, userid ]);
    console.log(PWDinfo)
    if(PWDinfo.length == 1 && PWDinfo[0].withdrawpassword == pwd){
        res.send({status : true});
    }else{
        res.send({status : false});
    };
});

router.post('/checkid', JSONResponse.isLoggedin, async function(req, res){ 
    console.log("들어옴");
    let to = req.body.to;
    console.log("to 값 :" +to);
    var sendData = {};
    var sql = `select /* ?.check id for validation */ user_id, userrealnameField  from tb_user where user_id = ?`;
    let IDinfo = await DB.Sql( sql, [ module_path,to ]);
    console.log("여기")
    if(IDinfo.length == 1){
        sendData.to =  IDinfo[0].user_id;
        sendData.userrealnameField =  IDinfo[0].userrealnameField;
        console.log(IDinfo[0])
        res.send({data : sendData, status : true});
    }else{
        res.send({data : sendData, status : false});
    };
  });

router.post('/Kpay', JSONResponse.isLoggedin, async function(req, res) {
    let sent_amount = req.body.k_pay;
    let to = req.body.to;
    let userid = req.user.userid;
    let fee_ratio = 0.02; //수수료 2 %
    let change_ratio = 7.8896; //환욜 %
    let transactionfee = Math.floor(sent_amount * fee_ratio);
    let received_amount = Math.floor((sent_amount-transactionfee)*change_ratio)//수수료를 제외한 나머지 금액에 환율 적용한 값
    let type = "KTU"
    var sendData = {};
    sendData.to = to;
    sendData.transactionfee = transactionfee;
    sendData.sent_amount = sent_amount;
    sendData.received_amount = received_amount;

    var sql = `INSERT INTO /* ?.sended amount of K_PAY */ wdl.tb_send(user_id, sent_amount, received_amount, transactionFee, to_userid, send_type) VALUE (?,?,?,?,?,?)`;
    let Kpay_content = await DB.Sql( sql, [ module_path,userid, sent_amount,received_amount, transactionfee, to, type ]);
    if(Kpay_content.affectedRows==1){
        var sql = `UPDATE /* ?.minus Kpay amount to send */ tb_user SET K_PAY = K_PAY - ? WHERE user_id = ?`;
        let minus_sendKpay = await DB.Sql( sql, [ module_path, sent_amount, userid ]);
        console.log(minus_sendKpay)
        if(minus_sendKpay.changedRows==1){
            var sql = `UPDATE /* ?.add UZpay amount to send */ tb_user SET UZ_PAY = UZ_PAY + ? WHERE user_id = ?`;
            let add_sendUZpay = await DB.Sql( sql, [  module_path, received_amount, to ]);
            if(add_sendUZpay.changedRows==1){
                res.send({data : sendData, status : true});

            }else{
                res.send({data : sendData, status : false});
            }
        }else{
            res.send({data : sendData, status : false});
        }
    }else{
        res.send({data : sendData, status : false});
    };
  });


  router.post('/UZpay', JSONResponse.isLoggedin, async function(req, res) {
    let sent_amount = req.body.UZ_PAY;
    let to = req.body.to;
    let userid = req.user.userid;
    let fee_ratio = 0.02; //수수료 2 %
    let change_ratio = 0.12675; //환욜 %
    let transactionfee = Math.floor(sent_amount * fee_ratio);
    let received_amount = Math.floor((sent_amount-transactionfee)*change_ratio)//수수료를 제외한 나머지 금액에 환율 적용한 값
    let type = "UTK"; 
    var sendData = {};
    sendData.to = to;
    sendData.transactionfee = transactionfee;
    sendData.sent_amount = sent_amount;
    sendData.received_amount = received_amount;
    var date = new Date();
    var sql = `INSERT INTO /* ?.sended amount of UZ_PAY */ wdl.tb_send(user_id, sent_amount, received_amount, transactionFee, to_userid, send_type) VALUE (?,?,?,?,?,?)`;
    let UZpay_content = await DB.Sql( sql, [ module_path,userid, sent_amount,received_amount, transactionfee, to, type ]);
    if(UZpay_content.affectedRows==1){
        var sql = `UPDATE /* ?.minus Kpay amount to send */ tb_user SET K_PAY = K_PAY - ? WHERE user_id = ?`;
        let minus_sendKpay = await DB.Sql( sql, [ module_path, sent_amount, userid ]);
        console.log(minus_sendKpay)
        if(minus_sendKpay.changedRows==1){
            var sql = `UPDATE /* ?.add UZpay amount to send */ tb_user SET UZ_PAY = UZ_PAY + ? WHERE user_id = ?`;
            let add_sendUZpay = await DB.Sql( sql, [  module_path, received_amount, to ]);
            if(add_sendUZpay.changedRows==1){
                res.send({data : sendData, status : true});

            }else{
                res.send({data : sendData, status : false});
            }
        }else{
            res.send({data : sendData, status : false});
        }
    }else{
        res.send({data : sendData, status : false});
    };
  });

  module.exports = router;

