var express = require('express');

var router = express.Router();
var bodyParser = require("body-parser") // call body parser module and make use of it
router.use(bodyParser.urlencoded({extended:true}));
var db = require('../db');
router.use(require('./user'))
// function to render the home page
var Email = require("../coms/email.js");

const multer = require('multer');
const path = require('path');
const sharp = require('sharp')
const fs = require('fs');



const storage = multer.diskStorage({
  destination: function(req, file, cb) {
      cb(null, './uploads/');
  },
 
  filename: function(req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});
 
var upload = multer({ storage: storage })



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
	res.redirect('/');
}

router.get('/administration', isLoggedIn, isAdmin, function(req, res){
  let grandItems = 0
  var itemT = req.session.cart || [];
      for(let i = 0; i < itemT.length; i++) { 
      grandItems += itemT[i].quantity
      }

    res.render('adminpage', {user: req.user, grandItems});

  });





// orders start **********************************************************
  router.get('/adminOrders', isLoggedIn, isAdmin, function(req, res){  
    let grandItems = 0
    var itemT = req.session.cart || [];
        for(let i = 0; i < itemT.length; i++) { 
        grandItems += itemT[i].quantity
        }


        var countInfo = 'SELECT COUNT(*) as total FROM orders';
        var totalCount;
        db.query(countInfo, function(err, rows) {
          if (err) throw err;
          totalCount = rows[0].total;
         
        
          var offset = req.query.offset || 0;
          
          var numRowsPerPage = 10;
          var sql = 'SELECT * FROM orders ORDER BY Id DESC LIMIT ? OFFSET ?';
          var params = [numRowsPerPage, parseInt(offset)];
          db.query(sql, params, function(err, rows) {
            if (err) throw err;
        
            var totalRows = totalCount; // Use the totalCount variable here
            res.render('adminorders', {grandItems, data: rows, totalRows: totalRows, numRowsPerPage: numRowsPerPage, currentPage: (offset / numRowsPerPage) + 1 });
          });
        });
    });
  

    router.post('/adminOrdersUpdate/:id', isLoggedIn, isAdmin, function(req, res){  
      
      
      //select * from filesAAAGGGH where User = ?

      function generateRandomString(length) {
        let ranLink = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        
        for (let i = 0; i < length; i++) {
          ranLink += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        
        return ranLink;
      }

      const randomString = generateRandomString(35);
      Email.downloadPassword(req.body.username, req.body.uemail, randomString)
      let sql2 = 'Insert Into filesAAAGGGH  (package , dLink, userName) VALUES (?,?,?)';
      let query2 = db.query(sql2, [req.body.chosenP, randomString, req.body.username], (err,result) => {
          if(err) throw err; 
          
      });


      let sql = 'update orders set Status = ? Where Id = ?';
      let query = db.query(sql, [req.body.ostatus, req.params.id], (err,result) => {
          if(err) throw err; 
         
          res.redirect("/adminOrders")
      });

    });


// Orders end **********************************************************




// Packages Start **********************************************************


router.get('/adminpackages', isLoggedIn, isAdmin, function(req, res){   
    
  let grandItems = 0
  var itemT = req.session.cart || [];
      for(let i = 0; i < itemT.length; i++) { 
      grandItems += itemT[i].quantity
      }
  

  let sql = 'select * from package';
  let query = db.query(sql, (err,result) => { 
      if(err) throw err;
      res.render('adminpackages', {result, user: req.user, grandItems});
      });
  });

router.get('/adminaddpackage', isLoggedIn, isAdmin, function(req, res){  
  
  let grandItems = 0
  var itemT = req.session.cart || [];
      for(let i = 0; i < itemT.length; i++) { 
      grandItems += itemT[i].quantity
      }
    res.render('adminaddapackage', {user: req.user, grandItems});
  });


router.post('/adminaddpackage', isLoggedIn, isAdmin, upload.single("image"), async function(req, res){
    const { filename: image } = req.file;      
    await sharp(req.file.path)
        .resize(500, 500)
        .jpeg({ quality: 90 })
        .toFile(
            path.resolve(req.file.destination,'resized',image)
        )
        //fs.unlinkSync(req.file.path)

    var peewee = req.body.description
    var newpeewe = peewee.replace(/(?:\r\n|\r|\n)/g, '<br>')
    // ***** Note to have these preformatted in EJS use <%- instead of <%=
    let sql = 'INSERT INTO package (Title, Icon, Description, Image, ImageTitle, SmallBit, onHome, price) VALUES (?,?,?,?,?,?,?,?)';
    let query = db.query(sql, [req.body.title, req.body.icon, newpeewe, req.file.filename, req.body.imagetitle, req.body.smallbit, req.body.onhome, req.body.price],(err,res) => {
        
        if(err) throw err;
 
    });
    
    res.redirect('/adminpackages');
  });


router.get('/admineditpackage/:id', function(req, res){ 

  let grandItems = 0
  var itemT = req.session.cart || [];
      for(let i = 0; i < itemT.length; i++) { 
      grandItems += itemT[i].quantity
      }

    let sql = 'select * from package where Id = ?';
    let query = db.query(sql,[req.params.id], (err,result) => {       
        if(err) throw err;    
        res.render('admineditpackage', {result, user: req.user, grandItems});        
    });
  });


  router.post('/admineditthispackage/:id', isLoggedIn, isAdmin, upload.single("image"), async function(req, res){
    var peewee = req.body.description
    var newpeewe = peewee.replace(/(?:\r\n|\r|\n)/g, '<br>')

    let sql = 'UPDATE package SET Title = ? , Icon = ? , Description = ?, Image = ?, ImageTitle = ? ,  SmallBit = ? , onHome = ?, price = ? WHERE Id = ?';
    let query = db.query(sql, [req.body.title, req.body.icon, newpeewe, req.body.image, req.body.imagetitle,  req.body.smallbit, req.body.onhome, req.body.price, req.params.id,],(err,res) => {
        
        if(err) throw err;
      
    });
    
    res.redirect('/adminpackages');
  });
  

router.get('/admindeletepackage/:id', isLoggedIn, isAdmin, upload.single("image"), async function(req, res){
    let sql = 'DELETE FROM package WHERE Id = ?';
    let query = db.query(sql, [req.params.id],(err,res) => {
        
        if(err) throw err;
      
    });
    
    res.redirect('/adminpackages');
  });
  



  
// Packages End **********************************************************



// Services Start **********************************************************


router.get('/adminservices', isLoggedIn, isAdmin, function(req, res){   
    
  let grandItems = 0
  var itemT = req.session.cart || [];
      for(let i = 0; i < itemT.length; i++) { 
      grandItems += itemT[i].quantity
      }
  

  let sql = 'select * from services';
  let query = db.query(sql, (err,result) => { 
      if(err) throw err;
     
      res.render('adminservices', {result, user: req.user, grandItems});
      });
  });

router.get('/adminaddservice', isLoggedIn, isAdmin, function(req, res){  
  
  let grandItems = 0
  var itemT = req.session.cart || [];
      for(let i = 0; i < itemT.length; i++) { 
      grandItems += itemT[i].quantity
      }
    res.render('adminaddaservice', {user: req.user, grandItems});
  });


router.post('/adminaddservice', isLoggedIn, isAdmin, upload.single("image"), async function(req, res){
    const { filename: image } = req.file;      
    await sharp(req.file.path)
        .resize(500, 500)
        .jpeg({ quality: 90 })
        .toFile(
            path.resolve(req.file.destination,'resized',image)
        )
        //fs.unlinkSync(req.file.path)

    var peewee = req.body.description
    var newpeewe = peewee.replace(/(?:\r\n|\r|\n)/g, '<br>')
    // ***** Note to have these preformatted in EJS use <%- instead of <%=
    let sql = 'INSERT INTO services (Title, Icon, Description, Image, ImageTitle, SmallBit, onHome, onHomeSection, fadeEffect) VALUES (?,?,?,?,?,?,?,?,?)';
    let query = db.query(sql, [req.body.title, req.body.icon, newpeewe, req.file.filename, req.body.imagetitle, req.body.smallbit, req.body.onhome, req.body.section, req.body.fade],(err,res) => {
        
        if(err) throw err;
 
    });
    
    res.redirect('/adminservices');
  });


router.get('/admineditservice/:id', function(req, res){ 

  let grandItems = 0
  var itemT = req.session.cart || [];
      for(let i = 0; i < itemT.length; i++) { 
      grandItems += itemT[i].quantity
      }

    let sql = 'select * from services where Id = ?';
    let query = db.query(sql,[req.params.id], (err,result) => {       
        if(err) throw err;    
        res.render('admineditservice', {result, user: req.user, grandItems});        
    });
  });


  router.post('/admineditthisservice/:id', isLoggedIn, isAdmin, upload.single("image"), async function(req, res){
    var peewee = req.body.description
    var newpeewe = peewee.replace(/(?:\r\n|\r|\n)/g, '<br>')

    let sql = 'UPDATE services SET Title = ? , Icon = ? , Description = ?, Image = ?, ImageTitle = ? ,  SmallBit = ? , onHome = ?, onHomeSection = ?, fadeEffect = ? WHERE Id = ?';
    let query = db.query(sql, [req.body.title, req.body.icon, newpeewe, req.body.image, req.body.imagetitle,  req.body.smallbit, req.body.onhome, req.body.section, req.body.fade, req.params.id,],(err,res) => {
        
        if(err) throw err;
      
    });
    
    res.redirect('/adminservices');
  });
  

router.get('/admindeleteservice/:id', isLoggedIn, isAdmin, upload.single("image"), async function(req, res){
    let sql = 'DELETE FROM services WHERE Id = ?';
    let query = db.query(sql, [req.params.id],(err,res) => {
        
        if(err) throw err;
      
    });
    
    res.redirect('/adminservices');
  });
  



  
// Services End **********************************************************



// Main Features Start **********************************************************


router.get('/adminfeatures', isLoggedIn, isAdmin, function(req, res){   
    
  let grandItems = 0
  var itemT = req.session.cart || [];
      for(let i = 0; i < itemT.length; i++) { 
      grandItems += itemT[i].quantity
      }
  

  let sql = 'select * from mainFeature';
  let query = db.query(sql, (err,result) => { 
      if(err) throw err;
     
      res.render('adminfeatures', {result, user: req.user, grandItems});
      });
  });

router.get('/adminaddfeature', isLoggedIn, isAdmin, function(req, res){  
  let grandItems = 0
  var itemT = req.session.cart || [];
      for(let i = 0; i < itemT.length; i++) { 
      grandItems += itemT[i].quantity
      }

  let sql = 'select * from package';
    let query = db.query(sql,[req.params.id], (err,result) => {       
        if(err) throw err;    
        res.render('adminaddfeature', {result, user: req.user, grandItems});        
    });




    
  });


router.post('/adminaddfeature', isLoggedIn, isAdmin, upload.single("image"), async function(req, res){
    const { filename: image } = req.file;      
    await sharp(req.file.path)
        .resize(500, 500)
        .jpeg({ quality: 90 })
        .toFile(
            path.resolve(req.file.destination,'resized',image)
        )
        //fs.unlinkSync(req.file.path)

    var peewee = req.body.description
    var newpeewe = peewee.replace(/(?:\r\n|\r|\n)/g, '<br>')
    // ***** Note to have these preformatted in EJS use <%- instead of <%=
    let sql = 'INSERT INTO mainFeature (Title, Icon, Description, Image, ImageTitle, SmallBit, solution) VALUES (?,?,?,?,?,?,?)';
    let query = db.query(sql, [req.body.title, req.body.icon, newpeewe, req.file.filename, req.body.imagetitle, req.body.smallbit, req.body.package],(err,res) => {
        
        if(err) throw err;
 
    });
    
    res.redirect('/adminfeatures');
  });


router.get('/admineditfeature/:id', function(req, res){ 

  let grandItems = 0
  var itemT = req.session.cart || [];
      for(let i = 0; i < itemT.length; i++) { 
      grandItems += itemT[i].quantity
      }

    let sql = 'select * from mainFeature where Id = ?;select * from package';
    let query = db.query(sql,[req.params.id], (err,result) => {       
        if(err) throw err;    
        res.render('admineditfeature', {result, user: req.user, grandItems});        
    });
  });


  router.post('/admineditthisfeature/:id', isLoggedIn, isAdmin, upload.single("image"), async function(req, res){
    var peewee = req.body.description
    var newpeewe = peewee.replace(/(?:\r\n|\r|\n)/g, '<br>')

    let sql = 'UPDATE mainFeature SET Title = ? , Icon = ? , Description = ?, Image = ?, ImageTitle = ? ,  SmallBit = ? , solution = ? WHERE Id = ?';
    let query = db.query(sql, [req.body.title, req.body.icon, newpeewe, req.body.image, req.body.imagetitle,  req.body.smallbit, req.body.package, req.params.id,],(err,res) => {
        
        if(err) throw err;
      
    });
    
    res.redirect('/adminfeatures');
  });
  

router.get('/admindeletefeature/:id', isLoggedIn, isAdmin, upload.single("image"), async function(req, res){
    let sql = 'DELETE FROM mainFeature WHERE Id = ?';
    let query = db.query(sql, [req.params.id],(err,res) => {
        
        if(err) throw err;
      
    });
    
    res.redirect('/adminfeatures');
  });
  
  
// Main Features End **********************************************************


// About Start **********************************************************


router.get('/adminabout', isLoggedIn, isAdmin, function(req, res){   
    
  let grandItems = 0
  var itemT = req.session.cart || [];
      for(let i = 0; i < itemT.length; i++) { 
      grandItems += itemT[i].quantity
      }
  

  let sql = 'select * from aboutAAAGGGH';
  let query = db.query(sql, (err,result) => { 
      if(err) throw err;
     
      res.render('adminabout', {result, user: req.user, grandItems});
      });
  });



  router.get('/admineditabout/:id', function(req, res){ 

    let grandItems = 0
    var itemT = req.session.cart || [];
        for(let i = 0; i < itemT.length; i++) { 
        grandItems += itemT[i].quantity
        }
  
      let sql = 'select * from aboutAAAGGGH where Id = ?';
      let query = db.query(sql,[req.params.id], (err,result) => {       
          if(err) throw err;    
          res.render('admineditabout', {result, user: req.user, grandItems});        
      });
    });

    router.post('/admineditthisabout/:id', isLoggedIn, isAdmin, upload.single("image"), async function(req, res){
      var peewee = req.body.description
      var newpeewe = peewee.replace(/(?:\r\n|\r|\n)/g, '<br>')
  
      let sql = 'UPDATE aboutAAAGGGH SET Title = ? , Icon = ? , Description = ?, Image = ?, ImageTitle = ? ,  SmallBit = ? , siteLocation = ? WHERE Id = ?';
      let query = db.query(sql, [req.body.title, req.body.icon, newpeewe, req.body.image, req.body.imagetitle,  req.body.smallbit, req.body.sitelocation, req.params.id,],(err,res) => {
          
          if(err) throw err;
        
      });
      
      res.redirect('/adminabout');
    });


  


  // About End **********************************************************


// Blog Start **********************************************************


router.get('/adminblog', isLoggedIn, isAdmin, function(req, res){   
    
  let grandItems = 0
  var itemT = req.session.cart || [];
      for(let i = 0; i < itemT.length; i++) { 
      grandItems += itemT[i].quantity
      }
  

  let sql = 'select * from blogAAAGGGH';
  let query = db.query(sql, (err,result) => { 
      if(err) throw err;
     
      res.render('adminblog', {result, user: req.user, grandItems});
      });
  });

router.get('/adminaddblog', isLoggedIn, isAdmin, function(req, res){  
  
  let grandItems = 0
  var itemT = req.session.cart || [];
      for(let i = 0; i < itemT.length; i++) { 
      grandItems += itemT[i].quantity
      }
    res.render('adminaddblog', {user: req.user, grandItems});
  });


router.post('/adminaddblog', isLoggedIn, isAdmin, upload.single("image"), async function(req, res){
    const { filename: image } = req.file;      
    await sharp(req.file.path)
        .resize(500, 500)
        .jpeg({ quality: 90 })
        .toFile(
            path.resolve(req.file.destination,'resized',image)
        )
        fs.unlinkSync(req.file.path)

    var peewee = req.body.description
    var newpeewe = peewee.replace(/(?:\r\n|\r|\n)/g, '<br>')
    const today = new Date().toISOString().slice(0, 10).replace('T', ' ');
    let sql = 'INSERT INTO blogAAAGGGH (Title, Icon, Description, Image, ImageTitle, SmallBit, author, dateWritten) VALUES (?,?,?,?,?,?,?, ?)';
    let query = db.query(sql, [req.body.title, req.body.icon, newpeewe, req.file.filename, req.body.imagetitle, req.body.smallbit, req.body.author, today],(err,res) => {
        
        if(err) throw err;
 
    });
    
    res.redirect('/adminblog');
  });


router.get('/admineditblog/:id', function(req, res){ 

  let grandItems = 0
  var itemT = req.session.cart || [];
      for(let i = 0; i < itemT.length; i++) { 
      grandItems += itemT[i].quantity
      }

    let sql = 'select * from blogAAAGGGH where Id = ?';
    let query = db.query(sql,[req.params.id], (err,result) => {       
        if(err) throw err;    
        res.render('admineditblog', {result, user: req.user, grandItems});        
    });
  });


  router.post('/admineditthisblog/:id', isLoggedIn, isAdmin, upload.single("image"), async function(req, res){
    var peewee = req.body.description
    var newpeewe = peewee.replace(/(?:\r\n|\r|\n)/g, '<br>')

    let sql = 'UPDATE blogAAAGGGH SET Title = ? , Icon = ? , Description = ?, Image = ?, ImageTitle = ? ,  SmallBit = ?  WHERE Id = ?';
    let query = db.query(sql, [req.body.title, req.body.icon, newpeewe, req.body.image, req.body.imagetitle,  req.body.smallbit, req.params.id,],(err,res) => {
        
        if(err) throw err;
      
    });
    
    res.redirect('/adminblog');
  });
  

router.get('/admindeletthisblog/:id', isLoggedIn, isAdmin, upload.single("image"), async function(req, res){
    let sql = 'DELETE FROM blogAAAGGGH WHERE Id = ?';
    let query = db.query(sql, [req.params.id],(err,res) => {
        
        if(err) throw err;
      
    });
    
    res.redirect('/adminservices');
  });
  



  
// Blog End **********************************************************



// Example Start **********************************************************


router.get('/adminexample', isLoggedIn, isAdmin, function(req, res){   
    
  let grandItems = 0
  var itemT = req.session.cart || [];
      for(let i = 0; i < itemT.length; i++) { 
      grandItems += itemT[i].quantity
      }
  

  let sql = 'select * from exampleAAAGGGH';
  let query = db.query(sql, (err,result) => { 
      if(err) throw err;
     
      res.render('adminexample', {result, user: req.user, grandItems});
      });
  });

router.get('/adminaddexample', isLoggedIn, isAdmin, function(req, res){  
  
  let grandItems = 0
  var itemT = req.session.cart || [];
      for(let i = 0; i < itemT.length; i++) { 
      grandItems += itemT[i].quantity
      }
    res.render('adminaddexample', {user: req.user, grandItems});
  });


router.post('/adminaddexample', isLoggedIn, isAdmin, upload.array('images', 3), async function(req, res){
  const filenames = [];

  // Iterate over the array of uploaded files
  req.files.forEach(function(file) {
    // Push the filename of each file into the array
    filenames.push(file.filename);
  });
  
  
  const resizedFilePaths = await Promise.all(req.files.map(async file => {
    const { filename } = file;
    await sharp(file.path)
      .resize(500, 500)
      .jpeg({ quality: 90 })
      .toFile(
        path.resolve(file.destination, 'resized', filename)
      );
    
    return path.resolve(file.destination, 'resized', filename);
   
  }));

  var peewee = req.body.description
    var newpeewe = peewee.replace(/(?:\r\n|\r|\n)/g, '<br>')
  var peeweeb = req.body.descriptionb;
  var newpeeweb = peeweeb.replace(/(?:\r\n|\r|\n)/g, '<br>');
  var peeweec = req.body.descriptionc;
  var newpeewec = peeweec.replace(/(?:\r\n|\r|\n)/g, '<br>');
  
    let sql = 'INSERT INTO exampleAAAGGGH (Title, Icon, Image, ImageTitle, Imageb, ImageTitleb, Imagec, ImageTitlec, SmallBit, Description, Descriptionb, Descriptionc, onHome, externalLink) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
    let query = db.query(sql, [req.body.title, req.body.icon, filenames[0], req.body.imagetitle, filenames[1], req.body.imagetitleb, filenames[2], req.body.imagetitlec ,req.body.smallbit,  newpeewe, newpeeweb, newpeewec, req.body.onhome, req.body.externallink],(err,res) => {
        
        if(err) throw err;
 
    });
    
    res.redirect('/adminexample');
  });


router.get('/admineditexample/:id', function(req, res){ 

  let grandItems = 0
  var itemT = req.session.cart || [];
      for(let i = 0; i < itemT.length; i++) { 
      grandItems += itemT[i].quantity
      }

    let sql = 'select * from exampleAAAGGGH where Id = ?';
    let query = db.query(sql,[req.params.id], (err,result) => {       
        if(err) throw err;    
        res.render('admineditexample', {result, user: req.user, grandItems});        
    });
  });


  router.post('/admineditthisexample/:id', isLoggedIn, isAdmin, upload.single("image"), async function(req, res){
    var peewee = req.body.description
    var newpeewe = peewee.replace(/(?:\r\n|\r|\n)/g, '<br>')
  var peeweeb = req.body.descriptionb;
  var newpeeweb = peeweeb.replace(/(?:\r\n|\r|\n)/g, '<br>');
  var peeweec = req.body.descriptionc;
  var newpeewec = peeweec.replace(/(?:\r\n|\r|\n)/g, '<br>');

    let sql = 'UPDATE exampleAAAGGGH SET Title = ?, Icon = ?, Image = ?, ImageTitle = ?, Imageb = ?, ImageTitleb = ?, Imagec = ?, ImageTitlec = ?, SmallBit = ?, Description = ?, Descriptionb = ?, Descriptionc = ?, onHome = ?, externalLink = ? WHERE Id = ?';
    let query = db.query(sql, [req.body.title, req.body.icon, req.body.image, req.body.imagetitle, req.body.imageb, req.body.imagetitleb, req.body.imagec, req.body.imagetitlec ,req.body.smallbit,  newpeewe, newpeeweb, newpeewec, req.body.onhome, req.body.externallink, req.params.id],(err,res) => {
        
        if(err) throw err;
      
    });
    
    res.redirect('/adminexample');
  });
  

router.get('/admindeletthisblog/:id', isLoggedIn, isAdmin, upload.single("image"), async function(req, res){
    let sql = 'DELETE FROM exampleAAAGGGH WHERE Id = ?';
    let query = db.query(sql, [req.params.id],(err,res) => {
        
        if(err) throw err;
      
    });
    
    res.redirect('/adminexample');
  });
  



  
// Example End **********************************************************






// Images Start **********************************************************

router.get('/allimages',  isLoggedIn, isAdmin, function(req, res){ 

  let grandItems = 0
  var itemT = req.session.cart || [];
      for(let i = 0; i < itemT.length; i++) { 
      grandItems += itemT[i].quantity
      }

    const testFolder = './uploads/resized/';
      fs.readdir(testFolder, (err, files) => {
      files.forEach(file => {
       
      });
      res.render('adminallimages', {user: req.user, files, grandItems})
    });
});
  

router.get('/deleteimage/:id', isLoggedIn, isAdmin, function(req, res){ 
const path = './uploads/resized/'
fs.unlink(path + req.params.id, (err) => {
    if (err) {
    console.error(err)
    return
    }
    res.redirect('/allimages')
    //file removed
    })
});



router.get('/newimageupload',  isLoggedIn, isAdmin, function(req, res){ 
  let grandItems = 0
  var itemT = req.session.cart || [];
      for(let i = 0; i < itemT.length; i++) { 
      grandItems += itemT[i].quantity
      }

  res.render('newimage', {user: req.user, grandItems})
});


router.post('/newimage', isLoggedIn, isAdmin, upload.single("image"), async function(req, res){
  const { filename: image } = req.file;      
  await sharp(req.file.path)
      .resize(500, 500)
      .jpeg({ quality: 90 })
      .toFile(
          path.resolve(req.file.destination,'resized',image)
      )
      // comment this out if you want to keep the image in the folder
    fs.unlinkSync(req.file.path)


  
  res.redirect('/allimages');
});

// Images End **********************************************************

  module.exports = router;








