// app.js

const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;


const publicpath=path.join(__dirname , '/public');

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(publicpath));

// Routes
app.get('/', (req, res) => {
  res.sendFile(publicpath +'/index.html');
});

  app.post('/send-email', (req, res) => {
  const { to, subject, message } = req.body;

  // Create a nodemailer transporter
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: 'rayush920@gmail.com', // Your Gmail email address
      pass: 'wvbkmppafssdcpfz', // Your Gmail password or app-specific password
    }
  });

  // Email data
  const mailOptions = {
    from: 'rayush920@gmail.com', // Sender's email address
    to: to, // Recipient's email address
    subject: subject, // Email subject
    text: message, // Email message
  };

  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    // res.send(publicpath);
    if (error) {
      console.log(error);
      res.send('Error sending email.');
    } else {
      console.log('Email sent: ' + info.response);
      res.sendFile(publicpath +'/success.html');
    }
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
