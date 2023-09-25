# Email Sender Application

The Email Sender Application is a web-based tool that allows users to send personalized email messages to a list of recipients. This application is particularly useful for sending bulk emails with customized content to multiple recipients.

## Features

- **Excel File Integration**: Users can upload an Excel file containing recipient data, including email addresses and other relevant information.

- **Message Customization**: Users can create email templates with placeholders, and the application will replace these placeholders with corresponding values from the Excel file.

- **Email Sending**: The application uses the Nodemailer library to send emails via a Gmail account. Users can specify the sender's email address, subject, and message content.

- **Placeholder Highlighting**: The application can highlight placeholders within the message content for easy identification.

## Getting Started

1. Clone the repository to your local machine:

   ```shell
   git clone https://github.com/vaidiksharma111/MassEmailSender/

2. Install the required dependencies:
   ```shell
   npm install
3. Start the application:
   ```shell
   npm start
4. Access the application in your web browser at http://localhost:3000.

## Usage

### Upload Excel File
Click the "Choose File" button to upload an Excel file containing recipient data. The Excel file should have columns with appropriate headers.

### Specify Email Details
Enter the sender's email address, email subject, and create your email message with placeholders (e.g., `#<Name>#`, `#<Company>#`).

### Highlight Placeholders
Click the "Check for Placeholders" button to highlight placeholders within the message content.

### Send Emails
Click the "Send Email" button to send personalized emails to the recipients.

## Contributing

Contributions are welcome! If you'd like to contribute to this project, please follow these steps:

1. Fork the repository.

2. Create a new branch for your feature or bug fix.

   ```shell
   git checkout -b feature/my-feature
3. Make your changes and commit them:

   ```shell
   git commit -m "Add my feature"
4. Push your changes to your fork:

   ```shell
   git push origin feature/my-feature

5. Create a pull request to the main repository.

## Acknowledgments

This project acknowledges the following libraries and tools:

- [Nodemailer](https://nodemailer.com/): For email sending functionality.

- [XLSX](https://github.com/SheetJS/sheetjs): For Excel file processing.


