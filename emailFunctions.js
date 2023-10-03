const xlsx = require('xlsx');
const striptags = require('striptags');
const nodemailer = require('nodemailer');
const path = require('path');

function processMessageContent(req, res, next) {
    const message = req.body.message;
    console.log("in this function processMessageContent message = ", message);
    // Find words starting with "{{" and ending with "}}" with a maximum length of 15 characters
    const foundWords = message.match(/{{([^<>]{1,15})}}/g);
    const extractedWords = [];
  
    if (foundWords) {
      // Remove the "{{" and "}}" delimiters from found words and store them
      extractedWords.push(...foundWords.map((word) => word.slice(2, -2)));
  
      // Print the extracted words
      console.log('Found words:', extractedWords);
    } else {
      console.log('No words matching the pattern found.');
    }
  
    // Attach the extracted words to the request object
    req.globalFoundWords = extractedWords;
  
    // Continue to the next middleware or route handler
    next();
  }
  

  async function processEmailContent(req) {
    if (req.files && req.files['file']) {
        console.log("we have found one file in the processemail content");
      try {
        if (!req.files || !req.files['file'] || req.files['file'].size === 0) {
            console.log('No file or empty file uploaded');
            // Handle the error or send a response accordingly
            return;
          }
    //       const fileExtension = path.extname(req.files['file'].originalname).toLowerCase();
    // if (!['.xlsx', '.xls'].includes(fileExtension)) {
    //   console.log('Invalid file format');
    //   // Handle the error or send a response accordingly
    //   return;
    // }
        const workbook = xlsx.read(req.files['file'][0].buffer, { type: 'buffer' });
        if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
            console.log('No sheets found in the Excel file');
            // Handle the error or send a response accordingly
            return;
          }
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const columnNames = extractColumnNames(sheet);
        console.log('Column Names:', columnNames);
  
        const matchingWords = getMatchingWords(columnNames, req.globalFoundWords);
  
        if (matchingWords.length > 0) {
          console.log('Matching Words:', matchingWords);
  
          const columnValues = getColumnValues(sheet, matchingWords);
          const toAddresses = req.body.to.split(',').map(email => email.trim());
  
          await sendEmailsWithReplacement(req, matchingWords, columnValues, toAddresses);
  
          console.log('Size of the List:', matchingWords.length);
        } else {
          console.log('No matching words found between globalFoundWords and column names.');
          const toAddresses = req.body.to.split(',').map(email => email.trim());
          await sendEmailsWithoutReplacement(req, toAddresses);
        }
      } catch (error) {
        console.error('Error processing Excel file:', error);
        throw error;
      }
    } else {
        console.log("we do not have found one file in the processemail content");
      const toAddresses = req.body.to.split(',').map(email => email.trim());
      await sendEmailsWithoutReplacement(req, toAddresses);
    }
  }

function extractColumnNames(sheet) {
    const headers = xlsx.utils.sheet_to_json(sheet, { header: 1 })[0];
    return headers;
}

function getMatchingWords(columnNames, globalFoundWords) {
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

function extractValuesInColumn(sheet, columnIndex) {
    const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });
    const valuesInColumn = [];

    for (let i = 1; i < rows.length; i++) {
        if (rows[i][columnIndex]) {
            const valueAsString = String(rows[i][columnIndex]); // Convert the value to a string
            valuesInColumn.push(valueAsString);
            // valuesInColumn.push(rows[i][columnIndex]);
        }
    }

    return valuesInColumn;
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
                const regex = new RegExp(`{{${word}}}`, 'g');
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
    const attachments = [];

if (req.files['fileMaterial'] && req.files['fileMaterial'].length > 0) {
    req.files['fileMaterial'].forEach(file => {
        attachments.push({
            filename: file.originalname, // Use the original filename
            content: file.buffer, // Use the buffer of the uploaded file
        });
    });
}

const mailOptions = {
    from: req.session.user_email, // Sender's email address
    to: recipient, // Current recipient's email address
    subject: req.body.subject, // Email subject
    text: plainTextContent, // Plain text version of the email
    attachments: attachments, // Attachments array
};

    // const mailOptions = {
    //     from: req.session.user_email, // Sender's email address
    //     to: recipient, // Current recipient's email address
    //     subject: req.body.subject, // Email subject
    //     // text: messageContent, // Email message
    //     text: plainTextContent,
    // };

    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: req.body['sender-email'],
            // pass: req.body.password,
            pass: 'qjvl skyp msvt rqwd',
        }
    });

    await transporter.sendMail(mailOptions);
    console.log(`Email sent to: ${recipient}`);
}

module.exports = {
    sendEmail,
    sendEmailsWithReplacement,
    sendEmailsWithoutReplacement,
    getMatchingWords,
    getColumnValues,
    extractColumnIndex,
    extractColumnNames,
    processMessageContent,
    processEmailContent,
};