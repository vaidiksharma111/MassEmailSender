// app.js

const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const session=require('express-session');
const app = express();
const path = require('path');
const port = process.env.PORT || 3000;


const publicpath=path.join(__dirname , '/public');

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(publicpath));

//Configure express-session
app.use(session({
  secret: '1234', // A secret key used for session data encryption
  resave: false,             // Do not save session data if not modified
  saveUninitialized: true,   // Save uninitialized sessions
}));

// Routes
app.get('/', (req, res) => {

  res.sendFile(publicpath +'/login.html');
});
const password = process.env.myPassword;
app.get('/home', (req, res) => {
   
  const {email, password} = req.body;
  // req.session.user="ayush";
  req.session.user_email= email;
  req.session.app_password= password;
  res.sendFile(publicpath +'/home.html');
});



app.post('/send-email', async (req, res) => {
   
  const { subject, message } = req.body;
  const toAddresses = req.body.to.split(',').map(email => email.trim());
   
  // Create a nodemailer transporter
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: 'rayush920@gmail.com', // Your Gmail email address
      pass: 'wvbkmppafssdcpfz', // Your Gmail password or app-specific password
    }
  });

  try {
    for (const recipient of toAddresses) {
      // Email data
      const mailOptions = {
        from: 'rayush920@gmail.com', // Sender's email address
        to: recipient, // Current recipient's email address
        subject: subject, // Email subject
        text: message, // Email message
      };

      // Send the email
      await transporter.sendMail(mailOptions);
      console.log(`Email sent to: ${recipient}`);
    }
    // res.send(req.session.user_email);
    // res.sendFile(publicpath + '/success.html');
  } catch (error) {
  
    console.error(error);
    res.send('Error sending email.');
  }
});


// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
