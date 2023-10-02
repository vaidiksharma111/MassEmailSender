const emailFunctions = require('./emailFunctions');
const striptags = require('striptags');
const xlsx = require('xlsx');


function findPlaceHolderWords(message) {

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

    return extractedWords;
}

function processMessageContent(req) {
    req.globalFoundWords = findPlaceHolderWords(req.body.messageContent);
    if (req.file) {
        console.log("we have got one file");
      try {
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const columnNames = emailFunctions.extractColumnNames(sheet);
        console.log('Column Names:', columnNames);
  
        const matchingWords = emailFunctions.getMatchingWords(columnNames, req.globalFoundWords);
  
        if (matchingWords.length > 0) {
          console.log('Matching Words:', matchingWords);
  
          const columnValues = emailFunctions.getColumnValues(sheet, matchingWords);
          const toAddresses = req.body.to.split(',').map(email => email.trim());
  
        //   await sendEmailsWithReplacement(req, matchingWords, columnValues, toAddresses);
            return getEmailsWithReplacement(req, matchingWords, columnValues, toAddresses);
          console.log('Size of the List:', matchingWords.length);
        } else {
          console.log('No matching words found between globalFoundWords and column names.');
          const toAddresses = req.body.to.split(',').map(email => email.trim());
          return getEmailsWithoutReplacement(req, toAddresses);
        //   await sendEmailsWithoutReplacement(req, toAddresses);
        }
      } catch (error) {
        console.error('Error processing Excel file:', error);
        throw error;
      }
    } else {
        console.log("we do not have got one file");
      const toAddresses = req.body.to.split(',').map(email => email.trim());
      return getEmailsWithoutReplacement(req, toAddresses);
    //   await sendEmailsWithoutReplacement(req, toAddresses);
    }
  }


  async function getEmailsWithReplacement(req, matchingWords, columnValues, toAddresses) {
    const emailList = []; // Initialize an empty list to store email data
    const subject = req.body.subject;
    for (let i = 0; i < toAddresses.length; i++) {
      const recipient = toAddresses[i];
      let messageContent = req.body.messageContent;
      messageContent = striptags(messageContent);

      for (const word of matchingWords) {
        const values = columnValues[word];
        if (values.length > i) {
          const regex = new RegExp(`{{${word}}}`, 'g');
          messageContent = messageContent.replace(regex, values[i]);
        }
      }
  
      // Add email data to the list
      emailList.push({ recipient, subject, messageContent });
  
      console.log('Message Content:');
      console.log(messageContent);
    }
    return emailList;
  }
  

async function getEmailsWithoutReplacement(req, toAddresses) {
    const emailList = [];
    const subject = req.body.subject;
    for (let i = 0; i < toAddresses.length; i++) {
        const recipient = toAddresses[i];
        let messageContent = req.body.messageContent;
        messageContent = striptags(messageContent);
        console.log('Message Content:');
        console.log(messageContent);

        emailList.push({ recipient, subject, messageContent });
        // await sendEmail(req, messageContent, recipient);
    }
    return emailList;
}

module.exports = {
    findPlaceHolderWords,
    getEmailsWithReplacement,
    getEmailsWithoutReplacement,
    processMessageContent,
};