const LocalStrategy   = require('passport-local').Strategy;
const DB              = dicontainer.get( "DB" );
const pathUtil        = dicontainer.get( "pathUtil" );
const Err             = dicontainer.get( "Err" );
const crypto          = dicontainer.get( "crypto" );
const module_path     = pathUtil.basename( __filename )

module.exports = function(passport) {

    passport.serializeUser(function(user, done) {
        done(null, user);
    });

    passport.deserializeUser(async function(user, done) {
        done(null, user);
    });


    /* 로그인 전략 */
    passport.use('local-login', new LocalStrategy({
        usernameField: 'user_id',
        passwordField: 'user_passwd',
        passReqToCallback : true
    }, 
    async function(req, userid, password, done) {

        var query = `SELECT /* ?.loginprocess */
                            user_id,
                            password,
                            salt_pass
                        FROM tb_user
                        WHERE user_id = ? AND status = 'Y' `;
        let rows = await DB.Sql( query, [ module_path, userid ]);

        if(rows.length == 0){
            return done(null, false, req.flash('loginMessage', '아이디 또는 비밀번호가 틀렸습니다.'));
        }else{
            let pass = rows[0].password;  // DB 해쉬값 참조
            let salt = rows[0].salt_pass;  // DB 솔트값 참조
            let userHashPass = crypto.createHash("sha512").update(password+salt).digest("hex"); // 사용자 패스워드 + DB 솔트값

            if(pass === userHashPass){
                console.log('성공!');

                let userInfo = {
                    'userid' : userid
                };
                return done(null, userInfo);
            }else{
                console.log('아이디 또는 비밀번호가 틀렸습니다.')
                return done(null, false, req.flash('loginMessage', '아이디 또는 비밀번호가 틀렸습니다.'));
            }
        }
    }
    ))


    /* 회원가입 전략 */
    passport.use('local-join', new LocalStrategy({
        usernameField: 'user_id',
        passwordField: 'user_passwd',

        passReqToCallback : true
    }, 
    async function(req, userid, password, done) {
        let salt = Math.round((new Date().valueOf() * Math.random())) + "";
        let hashpass = crypto.createHash("sha512").update(password+salt).digest("hex");
        var query = `SELECT /* ?.joinprocess */
                            user_id,
                            password,
                            salt_pass
                        FROM tb_user
                        WHERE user_id = ? `;
        let Result = await DB.Sql( query, [ module_path, userid ]);
        
        if(Result.length){
            console.log('중복된 이메일입니다.')
            return done(null, false, req.flash('error', '중복된 이메일입니다.'));
        }else{
            console.log('성공')
            let withdrawpassword = req.body.withdraw_password;
            let userrealnameField = req.body.user_name;
            var sql = `INSERT INTO /* ?.joinprocess */ tb_user(user_id, password, salt_pass,  withdrawpassword, userrealnameField) VALUE (?,?,?,?,?)`;
            console.log(userid, hashpass, salt)
            let inresult = await DB.Sql( sql, [ module_path, userid, hashpass, salt, withdrawpassword, userrealnameField  ]);
            if(inresult.affectedRows == 1){
                var userInfo = {
                    'userid' : userid,
                };

                return done(null, userInfo)
            }else{
                console.log('inresult error');
            }

        }
    }
    ))
}
