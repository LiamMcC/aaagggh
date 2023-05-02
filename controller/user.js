var express = require('express');

var router = express.Router();


var bodyParser = require("body-parser") // call body parser module and make use of it
router.use(bodyParser.urlencoded({extended:true}));

var flash    = require('connect-flash');
var passport = require('passport');
var db = require('../db');
var Email = require("../coms/email.js");
const path = require('path');
//const AdmZip = require('adm-zip');
const fs = require('fs');

var LocalStrategy = require('passport-local').Strategy;
var localStorage = require('node-localstorage')
var session  = require('express-session');
var cookieParser = require('cookie-parser');

var bcrypt = require('bcrypt-nodejs');
const { Console } = require('console');

const saltRounds = 10;




router.use(cookieParser('qwerty')); // read cookies (needed for auth)



// required for passport
router.use(session({
	secret: 'bEx2eDuZFvnx',
	resave: true,
	saveUninitialized: true,
    name: 'cart-session-id', 
    merge: true
    // cookie: { maxAge: 1000 * 60 * 3 } // Set this so that sessions time out after whatever time I need
 } )); // session secret
 router.use(passport.initialize());
 router.use(passport.session()); // persistent login sessions
 router.use(flash()); // use connect-flash for flash messages stored in session

 router.use(function (req, res, next) {
    res.locals.isAuthenticated = req.isAuthenticated();
    next();
  });


  router.use((req, res, next) => {
    res.locals.cookies = req.cookies;
    next();
  });
  

  function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on
	if (req.isAuthenticated())
    
		return next();

	// if they aren't redirect them to the home page
	res.redirect('/');
}



function isAdmin(req, res, next) {

	// if user is authenticated in the session, carry on
	if (req.user.adminRights)
		return next();

	// if they aren't redirect them to the home page
	res.redirect('/about');
}

// function to render the home page
router.get('/admin', function(req, res){
    
    res.render('admin'), {user : req.user};
    
  });




  // ---------------------------- Auth -----------------------------------

  // =====================================
	// LOGIN ===============================
	// =====================================
	// show the login form
	router.get('/login', function(req, res) {
        const successMessage = req.flash('wrongcombo');
        var mycart = req.session.cart
        let grandItems = 0
        var itemT = req.session.cart || [];
            for(let i = 0; i < itemT.length; i++) { 
            grandItems += itemT[i].quantity
            }
		// render the page and pass in any flash data if it exists
        
		res.render('login', { grandItems, mycart, flash: req.flash(), message: successMessage });
	});

	// process the login form
	router.post('/login', passport.authenticate('local-login', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
		}),
        function(req, res) {
            // get the cart data
            

            
            if (req.body.remember) {
                //  maxAge: 1000 * 60 * 1
              req.session.cookie.maxAge = 1000 * 60 * 3;
            } else {
              req.session.cookie.expires = false;
            }
        res.redirect('/');
    });

	// =====================================
	// SIGNUP ==============================
	// =====================================
	// show the signup form
	router.get('/signup', function(req, res) {
        let grandItems = 0
        var itemT = req.session.cart || [];
            for(let i = 0; i < itemT.length; i++) { 
            grandItems += itemT[i].quantity
            }
		// render the page and pass in any flash data if it exists
		res.render('register', {user : req.user, grandItems});
	});

	// process the signup form
	router.post('/signup', passport.authenticate('local-signup', {
		successRedirect : '/profile', // redirect to the secure profile section
		failureRedirect : '/', // redirect back to the signup page if there is an error
		failureFlash : true // allow flash messages
	}));

	// =====================================
	// PROFILE SECTION =========================
	// =====================================
	// we will want this protected so you have to be logged in to visit
	// we will use route middleware to verify this (the isLoggedIn function)
	router.get('/profile',isLoggedIn, function(req, res) {
        
        const successMessage = req.flash('wrongcombo');

        let grandItems = 0
        var itemT = req.session.cart || [];
            for(let i = 0; i < itemT.length; i++) { 
            grandItems += itemT[i].quantity
            }


            let sql = 'select * from users WHERE userName = ?; select * from orders where User = ? ORDER BY Id DESC; select * from filesAAAGGGH where userName = ?';
            let query = db.query(sql,[req.user.userName, req.user.userName, req.user.userName], (err,result) => {     
                if(err) throw err;    
                res.render('profile', {result, user: req.user, grandItems, message: successMessage });    
                });  

  


		
	});


   
	

    router.get('/logout', function(req, res, next) {
        
        req.logout(function(err) {
          if (err) { return next(err); }
          res.redirect('/');
        });
      });



      router.post('/changepassword',isLoggedIn,  function(req, res, next){  // I have this restricted for admin just for proof of concept
        
        let oldP = req.body.oldpassword
        let newP = req.body.newpassword
        let pFind = 'select password from users where userName = ?;'  
        let pcheck = db.query(pFind, [req.user.userName],(err,result) => {
           if (!bcrypt.compareSync(oldP, result[0].password)){
            req.flash('wrongcombo', 'Looks Like you entered the wrong current password!');
            res.redirect('/profile')
           } else {

            const salt = bcrypt.genSaltSync(saltRounds);
            const hash = bcrypt.hashSync(newP, salt);
            
            Email.passwordResetNotice(req.user.uemail)
           
            let sql = 'update users set password = ? where userName = ?;'  
            let query = db.query(sql, [hash, req.user.userName],(err,result) => {
               if(err) throw err;
                res.redirect('/logout')
                
            });
           }
            
        });

       });




       router.post('/xxxxxx',  function(req, res, next){  // I have this restricted for admin just for proof of concept
        
        function makeid(length) {
            var result           = '';
            var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            var charactersLength = characters.length;
            for ( var i = 0; i < length; i++ ) {
              result += characters.charAt(Math.floor(Math.random() * 
         charactersLength));
           }
           return result;
        }
        
        var randomPassword = makeid(32)
        

        let email = req.body.email
        let who = req.body.username
        let pFind = 'select * from users where userName = ?;'  
        let pcheck = db.query(pFind, [who],(err,result) => {

            if(result.length == 0){
                
                
                req.flash('wrongcombo', 'Something looks wrong. Also remember Usernames are case sensitive and emails must be the same as the one you have associateted with your account!');
            res.redirect('/login')
            
            
            } else {

           if (result[0].uemail !== email || result[0].userName != who ){
            req.flash('wrongcombo', 'That Looks Wrong!');
            res.redirect('/login')
           } else {
            Email.rmaiReset(email, randomPassword)
            const salt = bcrypt.genSaltSync(saltRounds);
            const hash = bcrypt.hashSync(randomPassword, salt);
    
            
            let sql = 'update users set password = ? where userName = ?;'  
            let query = db.query(sql, [hash, who],(err,result) => {
               if(err) throw err;
               req.flash('wrongcombo', "Check Your Email.");
                res.redirect('/login')
                
            });
           }


        }
            
        });

        

       });




       router.post('/changeemail',isLoggedIn,  function(req, res, next){  // I have this restricted for admin just for proof of concept
        
    
         // use the generateHash function in our user model
        let sql = 'update users set uemail = ? where userName = ?;'  
        let query = db.query(sql, [req.body.newemail, req.user.userName],(err,result) => {
           if(err) throw err;
            res.redirect('/profile')
            
        });
    
       });


 // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {

        
        done(null, user.Id); // Very important to ensure the case if the Id from your database table is the same as it is here
        
    });

    // used to deserialize the 
    passport.deserializeUser(function(Id, done) {    // LOCAL SIGNUP ============================================================

       db.query("SELECT * FROM users WHERE Id = ? ",[Id], function(err, rows){
            done(err, rows[0]);
            
        });
    });

    // =========================================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

  passport.use(
        'local-signup',
        new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField : 'username',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, username, password, done) {
            // find a user whose email is the same as the forms email
            // we are checking to see if the user trying to login already exists
            db.query("SELECT * FROM users WHERE userName = ?",[username], function(err, rows) {
                if (err)
                    return done(err);
                if (rows.length) {
                    return done(null, false, req.flash('signupMessage', 'That username is already taken.'));
                } else {
                    // if there is no user with that username
                    // create the user

                    const salt = bcrypt.genSaltSync(saltRounds);
                    const hash = bcrypt.hashSync(password, salt);

                    var newUserMysql = {
                        username: username,
                        email: req.body.email,
                        password: hash  // use the generateHash function in our user model
                    };

                    var insertQuery = "INSERT INTO users ( userName, uemail, password ) values (?,?,?)";
                   
                    db.query(insertQuery,[newUserMysql.username, newUserMysql.email, newUserMysql.password],function(err, rows) {
                        newUserMysql.Id = rows.insertId;

                        return done(null, newUserMysql);
                    });
                }
            });
        })
    );

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use(
        'local-login',
        new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField : 'username',
            passwordField : 'password',
            passReqToCallback : true// allows us to pass back the entire request to the callback
            
        },
        function(req, username, password, done) { // callback with email and password from our form
            db.query("SELECT * FROM users WHERE userName = ?",[username], function(err, rows){
                if (err)
                    return done(err);
                if (!rows.length) {
                    return done(null, false, req.flash('loginMessage', 'Username Or Password Are Wrong.')); // req.flash is the way to set flashdata using connect-flash
                }

                // if the user is found but the password is wrong
                if (!bcrypt.compareSync(password, rows[0].password))
                    return done(null, false, req.flash('loginMessage', 'Username Or Password Are Wrong.')); // create the loginMessage and save it to session as flashdata

                // all is well, return successful user
                
                return done(null, rows[0]);
            });
        })
    );



// *************** Download Link

router.post('/download/:code/:id/:who', (req, res) => {
console.log(req.body.pname)
let zipFilePath;
if (req.body.pname == "p1") {
    zipFilePath = './views/p1dld.zip';
    console.log('zipFilePath is:', zipFilePath);
  } else if (req.body.pname == "p2") {
    zipFilePath = './views/p2dld.zip';
    console.log('zipFilePath is:', zipFilePath);
  } else if (req.body.pname == "p3") {
    zipFilePath = './views/p3dld.zip';
    console.log('zipFilePath is:', zipFilePath);
  } else if (req.body.pname == "p4") {
    zipFilePath = './views/p4dld.zip';
    console.log('zipFilePath is:', zipFilePath);
  } else if (req.body.pname == "p5") {
    zipFilePath = './views/p5dld.zip';
    console.log('zipFilePath is:', zipFilePath);
  } else {
    console.log('No matching condition found');
  }
  
  

    
  const fileName = 'file.zip'; // Set the name of the downloaded file
  
  let sql = 'select * FROM filesAAAGGGH where Id = ? AND userName = ?';
  let query = db.query(sql,[req.params.id, req.params.who], (err,result) => {
      if(err) throw err;
    let secretCode = result[0].dLink
            // Check if the user has entered a valid code
    
            if (secretCode !== req.body.uCode ) {
                const downloadFail = req.flash('Something Is Stopping You Frm Downloading This. Make Sure you enter the right code and are clickig the right link.');
            return res.redirect("/profile");
            }

            // Set the headers to force a file download
                res.setHeader('Content-Type', 'application/zip');
                res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
                
                // Stream the file to the client
                const fileStream = fs.createReadStream(zipFilePath);
                fileStream.pipe(res);
      
      });



    
    
  
   

  
  });

// **************** End Download Link




      // ----------------------------- Auth End ------------------------
  
  



  module.exports = router;