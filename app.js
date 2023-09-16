// app.js
//passcode for my email login ---  wvbkmppafssdcpfz
const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const session=require('express-session');
const app = express();
const path = require('path');
const xlsx=require('xlsx');
const port = process.env.PORT || 3000;


const publicpath=path.join(__dirname , '/public');

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(publicpath));

//Configure multer Middleware: 
const multer = require('multer');
const upload = multer({ dest: 'home/' }); // Set the destination folder for uploaded files


//Configure express-session
app.use(session({
  secret: '1234', // A secret key used for session data encryption
  resave: false,             // Do not save session data if not modified
  saveUninitialized: true,   // Save uninitialized sessions
}));

// Routes
app.get('/', (req, res) => {
//   const workbook = xlsx.readFile(path.join(publicpath, 'new.xlsx'));
// const worksheet = workbook.Sheets[workbook.SheetNames[0]];

// for (let i = 2; i <= 5; i++) {
//   const id = worksheet[`A${i}`].v;
//   const name = worksheet[`B${i}`].v;

//   console.log({ id, name });
// }

  res.sendFile(publicpath +'/login.html');
});
app.post('/file-submit', (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }
  else
  {
    return res.send('file uploaded.');
  }

    const workbook = xlsx.readFile(path.join(publicpath, 'new.xlsx'));
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  
  for (let i = 2; i <= 5; i++) {
    const id = worksheet[`A${i}`].v;
    const name = worksheet[`B${i}`].v;
  
    console.log({ id, name });
  }
  
    // res.sendFile(publicpath +'/login.html');
  });


app.post('/home', (req, res) => {
  // Process the hometed form data here
 
  try {
    const { email, password } = req.body;
      req.session.user_email= email;
      req.session.app_password= password;
      // res.send(email);
      res.sendFile(publicpath +'/home.html');
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
  // Perform server-side operations like authentication, data storage, etc.

});



app.post('/send-email', async (req, res) => {
   
  const { subject, message } = req.body;
  const toAddresses = req.body.to.split(',').map(email => email.trim());
   
  // Create a nodemailer transporter
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: req.session.user_email, // Your Gmail email address
      pass: req.session.app_password, // Your Gmail password or app-specific password
    }
  });

  try {
    for (const recipient of toAddresses) {
      // Email data
      const mailOptions = {
        from: req.session.user_email, // Sender's email address
        to: recipient, // Current recipient's email address
        subject: subject, // Email subject
        text: message, // Email message
      };

      // Send the email
      await transporter.sendMail(mailOptions);
      console.log(`Email sent to: ${recipient}`);
    }
    // res.send(req.session.user_email);
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
