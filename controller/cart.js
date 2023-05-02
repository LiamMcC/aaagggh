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

// Cart function

  let cart = [];

// router.post('/cookie-cart/:id', (req, res) => {

//     let sql = 'select * from liammc where Id = ?';
//     let query = db.query(sql,[req.params.id], (err,result) => {
//       if(err) throw err;



//             // Get the product details from the request body
//     const { productId = result[0].Id, productName = result[0].Name, productPrice = result[0].Price } = req.body;
  
//     // Check if the product is already in the cart
//     const index = cart.findIndex(item => item.productId === productId);
  
//     if (index !== -1) {
//       // If the product is already in the cart, increase the quantity
//       cart[index].quantity++;
//     } else {
//       // If the product is not in the cart, add it with quantity 1
//       cart.push({ productId, productName, productPrice, quantity: 1 });
//     }
  
//     // Send a response to confirm that the item has been added to the cart
//     // res.send(`${productName} has been added to your cart.\n\n` + cart.productId);
//     res.redirect('/cart')

//  });
  
//   });


// ****************** Testing Cart in a session

router.post('/cart/:id', (req, res) => {
  if (req.isAuthenticated()) {
  
  let sql = 'select * from package where Id = ?';
  let query = db.query(sql,[req.params.id], (err,result) => {
    if(err) throw err;
          // Get the product details from the request body
  const { productId = result[0].Id, productName = result[0].Title, productPrice = result[0].price, productImage = result[0].Image } = req.body;
  if (!req.session.cart) {
    req.session.cart = [];
  }
  // Check if the product is already in the cart
  const index = req.session.cart.findIndex(item => item.productId === productId);
  if (index !== -1) {
    // If the product is already in the cart, increase the quantity
    req.session.cart[index].quantity++;
  } else {
    // If the product is not in the cart, add it with quantity 1
    req.session.cart.push({ productId, productName, productPrice, quantity: 1, productImage });
  }

  res.redirect('/cart')

}); // this is the closing bracket for the sql 
} else {
  res.redirect('/login')
}
});

// ****************


  router.post('/cart/delete/:productId', (req, res) => {

    var keyToFind = parseInt(req.params.productId)
    
    // use predetermined JavaScript functionality to map the data and find the information I need 
    var index = req.session.cart.map(function(cart) {return cart.productId}).indexOf(keyToFind)
    

    req.session.cart.splice(index, 1)

    res.redirect('/cart');
  });



  router.post('/reduce/:productId', (req, res) => {
    var keyToFind = parseInt(req.params.productId)
   // const index = req.session.cart.findIndex(item => item.productId === req.paramsproductId);
   var index = req.session.cart.map(function(cart) {return cart.productId}).indexOf(keyToFind)
   
    
    if(req.session.cart[index].quantity > 1){
      if (index !== -1) {
        // If the product is already in the cart, increase the quantity
        req.session.cart[index].quantity--;
      }

    } else {

      

    req.session.cart.splice(index, 1)
    }
  


    //req.session.cart.splice(index, 1)
    res.redirect('/cart')
  
  

    
  });







  router.get('/cart', function(req, res){

    let grandItems = 0
    var itemT = req.session.cart || [];
        for(let i = 0; i < itemT.length; i++) { 
        grandItems += itemT[i].quantity
        }

    const cartItems = req.session.cart || [];
    let grandtotal = 0
     for(let i = 0; i < cartItems.length; i++) { 
      cartItems[i].lineTotal = cartItems[i].productPrice * cartItems[i].quantity
       grandtotal += cartItems[i].lineTotal
     
     }

   
        
    res.render('cart', {user: req.user, cart, grandtotal, cartItems, grandItems});
  });






  router.get('/clearcart', function(req, res){

    let grandItems = 0
    var itemT = req.session.cart || [];
        for(let i = 0; i < itemT.length; i++) { 
        grandItems += itemT[i].quantity
        }
    req.session.cart = [];
    var cartItems = []
    var grandtotal = 0
    
    res.render('cart', {user: req.user, cart, grandtotal, cartItems, grandItems});
  });



  router.post('/guestcheckout', function(req, res){
    const cartItems = req.session.cart || [];
    
    let grandtotal = 0
    for(let i = 0; i < cartItems.length; i++) { 
      cartItems[i].lineTotal = cartItems[i].productPrice * cartItems[i].quantity
       grandtotal += cartItems[i].lineTotal
     
     }

    const sql = 'INSERT INTO orders (totalCost, userMail) VALUES (?, ?)';
    let query = db.query(sql, [grandtotal, req.user.uemail], (err,result) => {     
      if(err) {
        res.redirect('/error'); // Redirect to error page
      }   
        const orderId = result.insertId;
        req.session.checkout = orderId
      

        for (const item of cartItems) {
          // CREATE TABLE orderItemss (Id int NOT NULL AUTO_INCREMENT PRIMARY KEY, productId int(10), productName varchar(20), productPrice int(10), quantity int(5), productImage varchar(20), lineTotal int(10))
    
          const itemSql = 'INSERT INTO orderItemss (orderNo, productId, productName, productPrice, quantity, productImage, lineTotal) VALUES (?, ?, ?, ?, ?, ?, ?)';
          const itemValues = [orderId, item.productId, item.productName, item.productPrice, item.quantity, item.productImage, item.lineTotal];
        
          db.query(itemSql, itemValues, (err, results) => {
            if(err) {
              res.redirect('/error'); // Redirect to error page
            } 
          });
        }




        

        res.redirect('/checkout');  
        });  
    
    

   
        

   

    
  });

  router.get('/checkout', function(req, res){
    if (req.isAuthenticated()) {
    let grandItems = 0
    var itemT = req.session.cart || [];
        for(let i = 0; i < itemT.length; i++) { 
        grandItems += itemT[i].quantity
        }


    const cartItems = req.session.cart || [];
    let grandtotal = 0
     for(let i = 0; i < cartItems.length; i++) { 
      cartItems[i].lineTotal = cartItems[i].productPrice * cartItems[i].quantity
       grandtotal += cartItems[i].lineTotal
     
     }
    var ordNox = req.session.checkout
    res.render('checkout', {user: req.user, cart, grandtotal, orderItems: cartItems, ordNox , grandItems});

  } else {
    res.redirect('/login')
  }
  });



// router.get('/orders', function(req,res){
//   let grandItems = 0
//     var itemT = req.session.cart || [];
//         for(let i = 0; i < itemT.length; i++) { 
//         grandItems += itemT[i].quantity
//         }


//         var countInfo = 'SELECT COUNT(*) as total FROM orders';
//         var totalCount;
//         db.query(countInfo, function(err, rows) {
//           if (err) throw err;
//           totalCount = rows[0].total;
          
        
//           var offset = req.query.offset || 0;
          
//           var numRowsPerPage = 10;
//           var sql = 'SELECT * FROM orders LIMIT ? OFFSET ?';
//           var params = [numRowsPerPage, parseInt(offset)];
//           db.query(sql, params, function(err, rows) {
//             if (err) throw err;
        
//             var totalRows = totalCount; // Use the totalCount variable here
//             res.render('orders', {grandItems, data: rows, totalRows: totalRows, numRowsPerPage: numRowsPerPage, currentPage: (offset / numRowsPerPage) + 1 });
//           });
//         });

    
// })


router.get('/order/:id', function(req,res){
  if (req.isAuthenticated()) {
    let grandItems = 0
    var itemT = req.session.cart || [];
    for(let i = 0; i < itemT.length; i++) { 
      grandItems += itemT[i].quantity
    }

    let sql = 'SELECT * FROM orders WHERE Id = ? AND User = ?; SELECT * FROM orderItemss WHERE orderNo = ?';
  
    let query = db.query(sql, [req.params.id, req.user.userName, req.params.id], (err,result) => {
      if(err) {
        res.redirect('/error'); // Redirect to error page
      }   
      if (result[0].length === 0) {
        // Order not found or user doesn't have permission to view it
        res.status(404).render("error")
      } else {
        // Order found and user has permission to view it
        res.render("individualorder", {result, grandItems})
      }
    });
  } else {
    res.redirect('/login')
  }
});

  
  



router.post('/paynow/:id', function(req,res){
  

  if (req.isAuthenticated()) {
    let sql = 'update orders set status = "Paid", User = ? Where Id = ?';
    let query = db.query(sql, [req.user.userName, req.params.id], (err,result) => {
      if(err) {
        res.redirect('/error'); // Redirect to error page
      }   

   
      req.session.cart = [];
    
        Email.orderConfirmed(req.user.userName, req.user.uemail)
        Email.adminOrderNotice()
        res.redirect("/profile")
    });
  } else {
    res.redirect('/login')
  }

  
  
  
  
})


  // Cart function end






  module.exports = router;