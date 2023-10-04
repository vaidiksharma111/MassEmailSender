const express = require('express');
const multer = require('multer');
const session = require('express-session');
const striptags = require('striptags');
const fs = require('fs');
const app = express();
const path = require('path');
const port = process.env.PORT || 3000;
const publicpath = path.join(__dirname, '/public');
const bodyParser = require('body-parser');
app.use('/tinymce', express.static(path.join(__dirname, 'node_modules', 'tinymce')));
const emailFunctions = require('./emailFunctions');
const previewFunctions = require('./previewFunctions');

// Create a storage engine for multer
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Middleware
app.use(bodyParser.json());
app.use(express.static(publicpath));
// app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({ extended: true }));

//Configure express-session
app.use(session({
  secret: '1234', // A secret key used for session data encryption
  resave: false,             // Do not save session data if not modified
  saveUninitialized: true,   // Save uninitialized sessions
}));


// Routes
app.get('/', (req, res) => {
  res.sendFile(publicpath + '/homepage.html');
});

app.get('/how-to-use', (req, res) => {
  res.sendFile(publicpath + '/help.html');
});

app.get('/create-email', (req, res) => {
  res.sendFile(publicpath + '/home.html');
});

app.post('/send-email', upload.fields([{ name: 'file' }, { name: 'fileMaterial' }]), emailFunctions.processMessageContent, async (req, res) => {
  console.log('Global Found Words:', req.globalFoundWords);
  try {
    await emailFunctions.processEmailContent(req);

    res.redirect('/success.html');
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});


// Define a route to handle the POST request
app.post('/display-message', upload.single('file'), async (req, res) => {
  // Extract data from the request body
  try {
    // Extract data from the request body
    const to = req.body.to;
    const subject = req.body.subject;
    const message = req.body.messageContent;
    const plainMessage = striptags(message);
    const file = req.file;

    const templateHtml = fs.readFileSync(publicpath + '/preview-email.html', 'utf8');
    const emailsList = await previewFunctions.processMessageContent(req);
    console.log(emailsList);

    // Set the index to 0 initially
    let currentIndex = 0;

    // Function to display an email based on the index
    function displayEmail(index, res) {
      if (index >= 0 && index < emailsList.length) {
        const email = emailsList[index];
        const modifiedHtml = templateHtml
          .replace('${to}', email.recipient)
          .replace('${subject}', email.subject)
          .replace('${message}', email.messageContent);

        res.send(modifiedHtml);
      } else {
        // Handle the case where the index is out of bounds (e.g., show an error message)
        res.send('No more emails to display.');
      }
    }
    function displayEmail2(index, res) {
      if (index >= 0 && index < emailsList.length) {
        const email = emailsList[index];
        console.log(email);
        const modifiedHtml = `
          <div id="receiver-email">
            <label>To :</label>
            <input type="text" id="to" name="to" value="${email.recipient}" readonly><br>
          </div>
          <label>Subject:</label>
          <input type="text" name="subject" id="subject" value="${email.subject}" readonly><br>
          <label>Message:</label>
          <div id="my-expressjs-tinymce-app-container">
            <textarea name="message" readonly>${email.messageContent}</textarea>
          </div><br>
        `;
        res.send(modifiedHtml);
      } else {
        res.send('No more emails to display.');
      }
    }
    // Handle "Next" button click
    app.get('/next-email', (req, res) => {
      // Increment the index
      currentIndex = (currentIndex + 1) % emailsList.length;

      // Display the next email
      displayEmail2(currentIndex, res);
    });

    // Handle "Previous" button click
    app.get('/previous-email', (req, res) => {
      // Decrement the index
      currentIndex = (currentIndex - 1 + emailsList.length) % emailsList.length;

      // Display the previous email
      displayEmail2(currentIndex, res);
    });


    // Display the first email initially
    displayEmail(currentIndex, res);


  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});


// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
