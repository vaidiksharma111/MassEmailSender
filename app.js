const express = require('express');
const nodemailer = require('nodemailer');
const multer = require('multer');
const session = require('express-session');
const app = express();
const path = require('path');
const port = process.env.PORT || 3000;
const publicpath = path.join(__dirname, '/public');
const bodyParser = require('body-parser');
const xlsx = require('xlsx');
const striptags = require('striptags');
const globalFoundWords = [];
app.use('/tinymce', express.static(path.join(__dirname, 'node_modules', 'tinymce')));

// Create a storage engine for multer
// const storage = multer.memoryStorage();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Middleware
app.use(express.static(publicpath));
app.use(bodyParser.urlencoded({ extended: false }));
//qjvl skyp msvt rqwd
//Configure express-session
app.use(session({
  secret: '1234', // A secret key used for session data encryption
  resave: false,             // Do not save session data if not modified
  saveUninitialized: true,   // Save uninitialized sessions
}));

function processMessageContent(req, res, next) {
  const message = req.body.message;
  console.log("in this function processMessageContent message = ", message);
  // Find words starting with "#<" and ending with ">#" with a maximum length of 15 characters
  const foundWords = message.match(/##([^<>]{1,15})##/g);
  const extractedWords = [];

  if (foundWords) {
    // Remove the "#<" and ">#" delimiters from found words and store them
    extractedWords.push(...foundWords.map((word) => word.slice(2, -2)));

    // Print the extracted words
    console.log('Found words:', extractedWords);
  } else {
    console.log('No words matching the pattern found.');
  }

  // Store the found words in the global variable
  globalFoundWords.push(...extractedWords);

  // Continue to the next middleware or route handler
  next();
}


function extractValuesInColumn(sheet, columnIndex) {
  const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });
  const valuesInColumn = [];

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][columnIndex]) {
      valuesInColumn.push(rows[i][columnIndex]);
    }
  }

  return valuesInColumn;
}

function extractColumnNames(sheet) {
  const headers = xlsx.utils.sheet_to_json(sheet, { header: 1 })[0];
  return headers;
}

// Routes
app.get('/', (req, res) => {
  res.sendFile(publicpath + '/home.html');
});


app.post('/send-email', upload.single('file'), processMessageContent, async (req, res) => {
  console.log('Global Found Words:', globalFoundWords);
  try {
    if (req.file) {
      const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const columnNames = extractColumnNames(sheet);
      console.log('Column Names:', columnNames);

      const matchingWords = getMatchingWords(columnNames);

      if (matchingWords.length > 0) {
        console.log('Matching Words:', matchingWords);

        const columnValues = getColumnValues(sheet, matchingWords);
        const toAddresses = req.body.to.split(',').map(email => email.trim());

        await sendEmailsWithReplacement(req, matchingWords, columnValues, toAddresses);

        console.log('Size of the List:', matchingWords.length);
      } else {
        console.log('No matching words found between globalFoundWords and column names.');
      }
    }
    else {
      const toAddresses = req.body.to.split(',').map(email => email.trim());
      await sendEmailsWithoutReplacement(req, toAddresses);
    }

    // Redirect to success.html after sending the email
    res.redirect('/success.html');
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});


function getMatchingWords(columnNames) {
  return globalFoundWords.filter(word =>
    columnNames.some(column => column.toLowerCase() === word.toLowerCase())
  );
}

function getColumnValues(sheet, matchingWords) {
  const columnValues = {};
  matchingWords.forEach(word => {
    const columnIndex = extractColumnIndex(sheet, word);
    if (columnIndex !== -1) {
      const valuesInColumn = extractValuesInColumn(sheet, columnIndex);
      console.log(`Values in Column "${word}":`, valuesInColumn);
      columnValues[word] = valuesInColumn;
    }
  });
  return columnValues;
}

function extractColumnIndex(sheet, columnName) {
  const headers = xlsx.utils.sheet_to_json(sheet, { header: 1 })[0];
  return headers.findIndex(header => header.toLowerCase() === columnName.toLowerCase());
}

async function sendEmailsWithReplacement(req, matchingWords, columnValues, toAddresses) {
  for (let i = 0; i < toAddresses.length; i++) {
    const recipient = toAddresses[i];
    let messageContent = req.body.message;

    for (const word of matchingWords) {
      const values = columnValues[word];
      if (values.length > i) {
        const regex = new RegExp(`##${word}##`, 'g');
        messageContent = messageContent.replace(regex, values[i]);
      }
    }

    console.log('Message Content:');
    console.log(messageContent);

    await sendEmail(req, messageContent, recipient);
  }
}

async function sendEmailsWithoutReplacement(req, toAddresses) {
  for (let i = 0; i < toAddresses.length; i++) {
    const recipient = toAddresses[i];
    let messageContent = req.body.message;

    console.log('Message Content:');
    console.log(messageContent);

    await sendEmail(req, messageContent, recipient);
  }
}

async function sendEmail(req, messageContent, recipient) {
  console.log(req.body);
  const plainTextContent = striptags(messageContent);
  const mailOptions = {
    from: req.session.user_email, // Sender's email address
    to: recipient, // Current recipient's email address
    subject: req.body.subject, // Email subject
    // text: messageContent, // Email message
    text: plainTextContent,
  };

  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: req.body['sender-email'],
      pass: req.body.password,
    }
  });

  await transporter.sendMail(mailOptions);
  console.log(`Email sent to: ${recipient}`);
}


// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
