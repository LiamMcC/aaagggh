var express = require('express');

var router = express.Router();
var bodyParser = require("body-parser") // call body parser module and make use of it
router.use(bodyParser.urlencoded({extended:true}));
var db = require('../db');
router.use(require('./user'))
var Email = require("../coms/email.js");


router.use((req, res, next) => {
  res.locals.cookies = req.cookies;
  next();
});


// function to render the home page
router.get('/', function(req, res){
  
  
  
 

  let grandItems = 0
  var itemT = req.session.cart || [];
      for(let i = 0; i < itemT.length; i++) { 
      grandItems += itemT[i].quantity
      }
     

  let sql = 'select * from services where onHomeSection = "Solution" AND onHome = true ORDER BY ID DESC Limit 4; select * from services where onHomeSection = "Give" AND onHome = true ORDER BY ID DESC Limit 3; select * from services where onHomeSection = "Do" AND onHome = true ORDER BY ID DESC Limit 3;SELECT * FROM exampleAAAGGGH;';
  let query = db.query(sql, (err,result) => {     
    if(err) {
      res.redirect('/error'); // Redirect to error page
    } else {   
      const xxx = req.cookies.cookie_consent || '123';  
     // var xxx = req.cookie.cookie_consent
      
      res.render('home', {result, user: req.user, grandItems}); 
    }   
      });  
  });



// ****** Email Contact handlers
router.get('/contact', function(req, res){
  let grandItems = 0
  var itemT = req.session.cart || [];
      for(let i = 0; i < itemT.length; i++) { 
      grandItems += itemT[i].quantity
      }


      let sql = 'select * from aboutAAAGGGH where siteLocation ="Contact"';
let query = db.query(sql, (err,result) => {
  if(err) {
    res.redirect('/error'); // Redirect to error page
  } else { 
    res.render('contactus', {result, user: req.user, grandItems});
  }
});

   
  });


  router.post('/contact', function(req, res){
    let grandItems = 0
    var itemT = req.session.cart || [];
        for(let i = 0; i < itemT.length; i++) { 
        grandItems += itemT[i].quantity
        }
  

        if (req.body.verifybox == "Madrid" || req.body.verifybox == "madrid" || req.body.verifybox == "MADRID" ) {

          Email.contactMailForm(req.body.fullname, req.body.email, req.body.comment, req.body.verifybox)
          res.redirect('/thankyou')
          } else {
      
              res.redirect('/wrongcaptcha')
          }


      res.redirect('thankyou', {user: req.user, grandItems});
    });



    router.get('/thankyou', function(req, res){
      let grandItems = 0
      var itemT = req.session.cart || [];
          for(let i = 0; i < itemT.length; i++) { 
          grandItems += itemT[i].quantity
          }
    

          let sql = 'select * from aboutAAAGGGH where siteLocation ="Thanks"';
    let query = db.query(sql, (err,result) => {
      if(err) {
        res.redirect('/error'); // Redirect to error page
      } else { 
        res.render('thankyou', {result, user: req.user, grandItems});
      }
    });

       
      });
    


      router.get('/wrongcaptcha', function(req, res){
        let grandItems = 0
        var itemT = req.session.cart || [];
            for(let i = 0; i < itemT.length; i++) { 
            grandItems += itemT[i].quantity
            }
      

            let sql = 'select * from aboutAAAGGGH where siteLocation ="Wrong"';
            let query = db.query(sql, (err,result) => {
              if(err) {
                res.redirect('/error'); // Redirect to error page
              } else { 
                res.render('wrongcaptcha', {result, user: req.user, grandItems});
              }
            });
         
        });
  
// ****** End Email Contact Handlers

// function to render the about page
router.get('/about', function(req, res){
  let grandItems = 0
  var itemT = req.session.cart || [];
      for(let i = 0; i < itemT.length; i++) { 
      grandItems += itemT[i].quantity
      }

    let sql = 'select * from aboutAAAGGGH where siteLocation ="About"';
    let query = db.query(sql, (err,result) => {
      if(err) {
        res.redirect('/error'); // Redirect to error page
      } else { 
        res.render('about', {result, user: req.user, grandItems});
      }
    });
});


router.get('/about/:which/:id', function(req, res){ 
  let grandItems = 0
  var itemT = req.session.cart || [];
      for(let i = 0; i < itemT.length; i++) { 
      grandItems += itemT[i].quantity
      }

  let sql = 'select * from about where Id = ?';
  let query = db.query(sql,[req.params.id], (err,result) => {
    if(err) {
      res.redirect('/error'); // Redirect to error page
    } else { 
      res.render('details', {result, user: req.user, grandItems});
    }
      });
});




// Solutions Start -------------------------------
router.get('/solutions', function(req, res){
  let grandItems = 0
  var itemT = req.session.cart || [];
      for(let i = 0; i < itemT.length; i++) { 
      grandItems += itemT[i].quantity
      }


  

  // ************ Let me put in a dynamic dropdown to pick what its sorted by
  let sql = 'select * from package ORDER BY Id DESC;select * from aboutAAAGGGH where siteLocation ="Solution"';
  let query = db.query(sql, (err,result) => {
    if(err) {
      res.redirect('/error'); // Redirect to error page
    } else { 
      res.render('solutions', {result, user: req.user, grandItems});
    }
      });
});


router.get('/solution/:which/:id', function(req, res){ 
  let grandItems = 0
  var itemT = req.session.cart || [];
      for(let i = 0; i < itemT.length; i++) { 
      grandItems += itemT[i].quantity
      }


  let sql = 'select * from package where Id = ?; select * from mainFeature where solution = ?;';
  let query = db.query(sql,[req.params.id,req.params.id], (err,result,) => {
    if(err) {
      res.redirect('/error'); // Redirect to error page
    } else { 
      res.render('details', {result, user: req.user, grandItems});
    }
      });
});





// Solutions end -------------------------------



// Examples 

router.get('/examples', function(req, res){   
    
  let grandItems = 0
  var itemT = req.session.cart || [];
      for(let i = 0; i < itemT.length; i++) { 
      grandItems += itemT[i].quantity
      }
  

      let sql = 'select * from exampleAAAGGGH;select * from aboutAAAGGGH where siteLocation ="Example"';
  let query = db.query(sql, (err,result) => { 
    if(err) {
      res.redirect('/error'); // Redirect to error page
    } else { 
     
      res.render('examples', {result, user: req.user, grandItems});
    }
      });
  });


  
router.get('/examples/:id',  function(req, res){   
    
  let grandItems = 0
  var itemT = req.session.cart || [];
      for(let i = 0; i < itemT.length; i++) { 
      grandItems += itemT[i].quantity
      }
  

  let sql = 'select * from exampleAAAGGGH Where Id = ?';
  let query = db.query(sql,[req.params.id], (err,result) => { 
    if(err) {
      res.redirect('/error'); // Redirect to error page
    } else { 
     
      res.render('individualexample', {result, user: req.user, grandItems});
    }
      });
  });


  




// End Examples




// Blog 


router.get('/blog', function(req, res){   
    
  let grandItems = 0
  var itemT = req.session.cart || [];
      for(let i = 0; i < itemT.length; i++) { 
      grandItems += itemT[i].quantity
      }
  

  let sql = 'select * from blogAAAGGGH ORDER BY Id DESC';
  let query = db.query(sql, (err,result) => { 
    if(err) {
      res.redirect('/error'); // Redirect to error page
    } else { 
     
      res.render('blog', {result, user: req.user, grandItems});
    }
      });
  });


  
router.get('/blog/:title/:id',  function(req, res){   
    
  let grandItems = 0
  var itemT = req.session.cart || [];
      for(let i = 0; i < itemT.length; i++) { 
      grandItems += itemT[i].quantity
      }
  

  let sql = 'select * from blogAAAGGGH Where Id = ?';
  let query = db.query(sql,[req.params.id], (err,result) => { 
    if(err) {
      res.redirect('/error'); // Redirect to error page
    } else { 
     
      res.render('individualblog', {result, user: req.user, grandItems});
    }
      });
  });





// End Blog






router.post('/acceptCookie', function(req, res) {

  let options = {
      maxAge: 1000 * 60 * 5// would expire after 90 minutes
      //httpOnly: true, // The cookie only accessible by the web server
    // signed: true // Indicates if the cookie should be signed
  }
 
  res.cookie('cookie_consent', 1, options) // options is optional
  //res.send('')


 
  res.redirect(req.get('referer'));
 //res.redirect('/');
 });


 router.get('/rejectCookie', function(req, res) {

  let options = {
      maxAge: 1000 * 60 * 5// would expire after 90 minutes
      //httpOnly: true, // The cookie only accessible by the web server
    // signed: true // Indicates if the cookie should be signed
  }
 
  res.cookie('cookie_consent', 0 , options) // options is optional
  //res.send('')


 
  res.redirect(req.get('referer'));
 //res.redirect('/');
 });

 router.get('/cookieinfo', function(req, res){
  let grandItems = 0
  var itemT = req.session.cart || [];
      for(let i = 0; i < itemT.length; i++) { 
      grandItems += itemT[i].quantity
      }

    let sql = 'select * from aboutAAAGGGH where siteLocation ="Cook"';
    let query = db.query(sql, (err,result) => {
      if(err) {
        res.redirect('/error'); // Redirect to error page
      } else { 
        res.render('cookieinfo', {result, user: req.user, grandItems});
      }
    });
});


router.get('/oops', function(req, res){
  

  let sql = 'select * from aboutAAAGGGH where siteLocation ="Error"';
  let query = db.query(sql, (err,result) => {
    if(err) {
      res.redirect('/error'); // Redirect to error page
    } else { 
      res.render('oops', {result, user: req.user, grandItems: 0});
    }
  });
});



router.get('/error', function(req, res){
  //let grandItems = 0
  

  let sql = 'select * from aboutAAAGGGH where siteLocation ="Error"';
  let query = db.query(sql, (err,result) => {
    if(err) {
      res.redirect('/error'); // Redirect to error page
    } else { 
      res.render('error', {result, user: req.user, grandItems: 0});
    }
  });
});








  module.exports = router;



  // Sample Try Catch for EJS 

  // <% try { %>
										
  //   <% } catch (err) { %>
  //     <p>It looks as if there is an error with this section. We may not be aware of this so please let us know <a href="contact">Contact Us</a> Thank you!</p>
  //   <% } %>
