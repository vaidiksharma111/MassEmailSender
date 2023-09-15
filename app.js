// app.js

const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const app = express();
const path = require('path');
const port = process.env.PORT || 3000;


const publicpath=path.join(__dirname , '/public');

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(publicpath));

// Routes
app.get('/', (req, res) => {
  res.sendFile(publicpath +'/index.html');
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

    res.sendFile(publicpath + '/success.html');
  } catch (error) {
    console.error(error);
    res.send('Error sending email.');
  }
});


// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
