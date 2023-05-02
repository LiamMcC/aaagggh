'use strict';
require('dotenv').config();

const res = require('express/lib/response');
var db = require('../db');
var nodemailer = require('nodemailer');


var transporter = nodemailer.createTransport({

    host: process.env.EMAIL_HOST,
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER, // your domain email user set this in .env file
      pass: process.env.EMAIL_PASS // your password for your email server outbox this in .env file
    },
    tls:{
      rejectUnauthorized: false
    }
  });


module.exports = class Email {
    // An email to all users
    // you can change the message here 
    // call this message in any route by calling the method in the route

    static liamo() {

    let sql = 'select email from users' 
    let query = db.query(sql, (err,result) => {
       if(err) throw err;
       
       result.forEach(function(row) {
           

        var mailOptions = {
            from: process.env.EMAIL_FROMT,
            to: row.uemail,
            subject: "Test MAil", // Chnage the subject as needed
            text: 'Can I just check that the email was sent! ' + row.email ,
            html: "<div style='width:100%;background:#a7c7d1'>Welcome to Win.ie.....</div>"
          };
          
          
          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
              
            }
          });

          

       })
       
        
    });

   }    
	
	// ***** End Email To All Users
	
	
	
	
	
	

   // ********** Contact Form Email

   static contactMailForm(name, email, comment, verifyBox) {

    var mailOptions = {
     from: process.env.EMAIL_FROMT, // Your email address here
      replyTo: email,
		cc: email,
      to: process.env.EMAIL_REPTO,
      subject: 'Website Contact',
      // text: comment + " is what they said This is an email from " + name +" the verify answer was " + verifyBox + "the email is " + email,
      html: '<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Contact Form!</title><style>body{font-family:Arial,sans-serif;background-color:#333;color:#FFF;margin:0;padding:0}div{box-sizing:border-box}div.container{width:90%;max-width:600px;margin:0 auto;background-color:#222;border-radius:10px;padding:20px;box-shadow:0px 2px 5px rgba(0,0,0,0.3)}div.header{text-align:center;margin-bottom:20px}h1{margin-top:0;color:#00FFFF}div.content{color:#FFF}h2,h3,h4,h5,h6{margin-top:0;margin-bottom:10px}p{margin-top:0;margin-bottom:20px}a.button{display:inline-block;background-color:#00FFFF;color:#222;padding:10px 20px;text-decoration:none;border-radius:5px;margin-right:10px;box-shadow:0px 2px 5px rgba(0,0,0,0.3)}a.button:hover{background-color:#00CCFF}hr{border: none;border-top: 2px solid #00FFFF;margin: 20px 0;}a {color: #00FFFF;}</style></head><body><div class="container"><div class="header"><h1>Contact Form!</h1></div><div class="content"><h2>Hi there ' + name + '!</h2><p>Thank you for contacting us. We will read your comment and get back to you as soon as possible to see how we can help.</p><p>We have attached a copy of your comment below.</p><p>Best regards,</p><p>The AAAGGGH.com Team</p><hr><p>' + comment + '</p><a href="aaagggh.com" class="button">Visit our Website</a></div></div></body></html>'

    };
    
    // Remove these console logs before production
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(" A Wee Problem " + error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
    
 
   }  
   



   static rmaiReset(xxemail, newRandomPword) {

    var mailOptions = {
      from: process.env.EMAIL_FROMT, // this is your websites email address
      replyTo: process.env.EMAIL_REPTO, // set this to an email you will see if the user needs to reply to a reset password email
      to: xxemail,
      subject: 'AAAGGGH.COM Reset Password notice',
      html: '<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Password Reset!</title><style>body{font-family:Arial,sans-serif;background-color:#333;color:#FFF;margin:0;padding:0}div{box-sizing:border-box}div.container{width:90%;max-width:600px;margin:0 auto;background-color:#222;border-radius:10px;padding:20px;box-shadow:0px 2px 5px rgba(0,0,0,0.3)}div.header{text-align:center;margin-bottom:20px}h1{margin-top:0;color:#00FFFF}div.content{color:#FFF}h2,h3,h4,h5,h6{margin-top:0;margin-bottom:10px}p{margin-top:0;margin-bottom:20px}a.button{display:inline-block;background-color:#00FFFF;color:#222;padding:10px 20px;text-decoration:none;border-radius:5px;margin-right:10px;box-shadow:0px 2px 5px rgba(0,0,0,0.3)}a.button:hover{background-color:#00CCFF}hr{border: none;border-top: 2px solid #00FFFF;margin: 20px 0;}a {color: #00FFFF;}</style></head><body><div class="container"><div class="header"><h1>Contact Form!</h1></div><div class="content"><h2>Hi there!</h2><p>As you have requested a reset password for aaagggh.com we have reset it for you. Your temporary password is ' + newRandomPword + ' We recommend you change this through your profile when you log back in here <a href="https://www.aaagggh.com/login">AAAGGGH.COM</a>.</p><p>If you did not request this email please reply immediately to this email and inform us what happened. Also immediately go to our website and reset your password again, Thank you for using <a href = "https://aaagggh.com" style="text-decoration:none;"></a></p></p><p>Best regards,</p><p>The AAAGGGH.com Team</p><hr><a href="https://www.aaagggh.com" class="button">Visit our Website</a></div></div></body></html>'

    };
    
    
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });

   }  


   static passwordResetNotice(xxemail) {
    var mailOptions = {
      from: process.env.EMAIL_FROMT, // this is your websites email address
      replyTo: process.env.EMAIL_REPTO, // set this to an email you will see if the user needs to reply to a reset password email
      to: xxemail,
      subject: 'Reset AAAGGGH.COM Password Has Been Reset Through Your Profile',
      html: '<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Password Reset!</title><style>body{font-family:Arial,sans-serif;background-color:#333;color:#FFF;margin:0;padding:0}div{box-sizing:border-box}div.container{width:90%;max-width:600px;margin:0 auto;background-color:#222;border-radius:10px;padding:20px;box-shadow:0px 2px 5px rgba(0,0,0,0.3)}div.header{text-align:center;margin-bottom:20px}h1{margin-top:0;color:#00FFFF}div.content{color:#FFF}h2,h3,h4,h5,h6{margin-top:0;margin-bottom:10px}p{margin-top:0;margin-bottom:20px}a.button{display:inline-block;background-color:#00FFFF;color:#222;padding:10px 20px;text-decoration:none;border-radius:5px;margin-right:10px;box-shadow:0px 2px 5px rgba(0,0,0,0.3)}a.button:hover{background-color:#00CCFF}hr{border: none;border-top: 2px solid #00FFFF;margin: 20px 0;}a {color: #00FFFF;}</style></head><body><div class="container"><div class="header"><h1>Contact Form!</h1></div><div class="content"><h2>Hi there!</h2><p>You have just reset your password for aaagggh.com.</p><p>If you did not request this email please reply immediately to this email and inform us what happened. Also immediately go to our website and reset your password again, Thank you for using <a href = "https://aaagggh.com" style="text-decoration:none;"></a></p></p><p>Best regards,</p><p>The AAAGGGH.com Team</p><hr><a href="https://www.aaagggh.com" class="button">Visit our Website</a></div></div></body></html>'
};
    
    
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });

   }  


// *************************** Order Confirmed Mail To Be Configured

   static orderConfirmed(who, xxemail) {
   
    var mailOptions = {
      from: process.env.EMAIL_FROMT, // this is your websites email address
      replyTo: process.env.EMAIL_REPTO, // set this to an email you will see if the user needs to reply to a reset password email
      to: xxemail,
      subject: 'An order has been placed',
      html: '<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Order Confirmed!</title><style>body{font-family:Arial,sans-serif;background-color:#333;color:#FFF;margin:0;padding:0}div{box-sizing:border-box}div.container{width:90%;max-width:600px;margin:0 auto;background-color:#222;border-radius:10px;padding:20px;box-shadow:0px 2px 5px rgba(0,0,0,0.3)}div.header{text-align:center;margin-bottom:20px}h1{margin-top:0;color:#00FFFF}div.content{color:#FFF}h2,h3,h4,h5,h6{margin-top:0;margin-bottom:10px}p{margin-top:0;margin-bottom:20px}a.button{display:inline-block;background-color:#00FFFF;color:#222;padding:10px 20px;text-decoration:none;border-radius:5px;margin-right:10px;box-shadow:0px 2px 5px rgba(0,0,0,0.3)}a.button:hover{background-color:#00CCFF}hr{border: none;border-top: 2px solid #00FFFF;margin: 20px 0;}a {color: #00FFFF;}</style></head><body><div class="container"><div class="header"><h1>Order Confirmed!</h1></div><div class="content"><h2>Hi there ' + who + '!</h2><p>Your order has been received. We will process and verify your order. Once this is done you will see a new link in your profile which will bring you to the location where you can download the code you just purchased. If you just purchased custom support hours we will be in touch with you soon to arrange this, Thank you for using <a href = "https://aaagggh.com" style="text-decoration:none;"></a></p></p><p>Best regards,</p><p>The AAAGGGH.com Team</p><hr><a href="https://www.aaagggh.com" class="button">Visit our Website</a></div></div></body></html>'
 };
    
    
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });

   }  
 // downloadPassword(req.body.uemail, randomString)
// Download Password
 static downloadPassword(who, xxemail, pword) {
  var mailOptions = {
    from: process.env.EMAIL_FROMT, // this is your websites email address
    replyTo: process.env.EMAIL_REPTO, // set this to an email you will see if the user needs to reply to a reset password email
    to: xxemail,
    subject: 'An order has been delivered',
    html: '<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Order Confirmed!</title><style>body{font-family:Arial,sans-serif;background-color:#333;color:#FFF;margin:0;padding:0}div{box-sizing:border-box}div.container{width:90%;max-width:600px;margin:0 auto;background-color:#222;border-radius:10px;padding:20px;box-shadow:0px 2px 5px rgba(0,0,0,0.3)}div.header{text-align:center;margin-bottom:20px}h1{margin-top:0;color:#00FFFF}div.content{color:#FFF}h2,h3,h4,h5,h6{margin-top:0;margin-bottom:10px}p{margin-top:0;margin-bottom:20px}a.button{display:inline-block;background-color:#00FFFF;color:#222;padding:10px 20px;text-decoration:none;border-radius:5px;margin-right:10px;box-shadow:0px 2px 5px rgba(0,0,0,0.3)}a.button:hover{background-color:#00CCFF}hr{border: none;border-top: 2px solid #00FFFF;margin: 20px 0;}a {color: #00FFFF;}</style></head><body><div class="container"><div class="header"><h1>Order Confirmed!</h1></div><div class="content"><h2>Hi there ' + who + '!</h2><p>Your order has been delivered. We have assigned the package to you and you should now see a new link in your profile which will bring you to the location where you can download the package you purchased. To download the order you will need this unique code. <br><br>' + pword +'<br><br>If you just purchased custom support hours we will be in touch with you soon to arrange this, Thank you for using <a href = "https://aaagggh.com" style="text-decoration:none;"></a></p></p><p>Best regards,</p><p>The AAAGGGH.com Team</p><hr><a href="https://www.aaagggh.com/login" class="button">Visit your profile</a></div></div></body></html>'
};
  
  
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });

 }  



   static adminOrderNotice() {
    var mailOptions = {
      from: process.env.EMAIL_FROMT, // this is your websites email address
      replyTo: process.env.EMAIL_REPTO, // set this to an email you will see if the user needs to reply to a reset password email
      to: process.env.EMAIL_FROMT,
      subject: 'An order has been placed',
      text: "An order has been placed and this email needs to be customised to send to the business"
	  };
    
    
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });

   }  
// *************************** Order Confirmed Mail To Be Configured

 
}




 







// Gmail

// var transporter = nodemailer.createTransport({
//     service: 'gmail',
//   host: 'smtp.gmail.com',
//   auth: {

   
//     user: "PUT YOUR USER HERE", 
//     pass: "PUT YOUR PASSWORD HERE",
//   }
// });