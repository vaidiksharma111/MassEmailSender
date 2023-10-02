// Function to read and print Excel data with an "Email" column
function readAndPrintEmailColumn() {
  const fileInput = document.getElementById('fileInput');
  const emailInput = document.getElementById('to'); // Get the "receiver-email" input field

  if (!fileInput.files[0]) {
    alert('No file selected');
    return;
  }

  const file = fileInput.files[0];
  const reader = new FileReader();

  reader.onload = function (e) {
    const data = e.target.result;
    const workbook = XLSX.read(data, { type: 'array' });
    const sheetName = workbook.SheetNames[0]; // Assuming you want the first sheet
    const sheet = workbook.Sheets[sheetName];

    // Convert the sheet to an array of objects
    const excelData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    // Check if there is an "Email" column
    const headerRow = excelData[0];
    const emailColumnIndex = headerRow.indexOf('Email');

    if (emailColumnIndex === -1) {
      alert('No column with the name "Email" found');
      return;
    }

    // Collect all email values in the "Email" column
    const emailValues = [];
    for (let i = 1; i < excelData.length; i++) {
      const rowData = excelData[i];
      if (rowData.length > emailColumnIndex) {
        emailValues.push(rowData[emailColumnIndex]);
      }
    }

    // Set the "receiver-email" input field value with comma-separated email values
    emailInput.value = emailValues.join(', ');

    // Make the input field non-editable
    emailInput.readOnly = true;
  };

  reader.readAsArrayBuffer(file);
}

function togglePasswordVisibility() {
  const passwordInput = document.getElementById('password');
  const passwordToggle = document.getElementById('password-toggle');

  passwordToggle.addEventListener('change', function () {
      if (passwordToggle.checked) {
          passwordInput.type = 'text';
      } else {
          passwordInput.type = 'password';
      }
  });
}


// Function to close the dialog
function closeMessageDialog() {
  const dialog = document.getElementById('message-dialog');
  dialog.close();
}

// Function to display the message content
function previewMessage() {
  // Get the content from the TinyMCE editor
  const messageContent = tinymce.get('my-expressjs-tinymce-app').getContent();

  // Display the preview content in the dialog
  const previewDiv = document.getElementById('message-preview');
  previewDiv.innerHTML = messageContent;
  
}

function openMessageDialog() {
  console.log("button clicked");
  const to = document.getElementById('to').value;
  const subject = document.getElementById('subject').value;
  const messageContent = tinymce.get('my-expressjs-tinymce-app').getContent();
  const fileInput = document.getElementById('fileInput');
  const file = fileInput.files[0];

  // Create a FormData object and append your data to it
  const formData = new FormData();
  formData.append('to', to);
  formData.append('subject', subject);
  formData.append('messageContent', messageContent);
  formData.append('file', file);

  fetch('/display-message', {
    method: 'POST',
    body: formData,
  })
    .then((response) => {
      if (response.ok) {
        return response.text();
      } else {
        throw new Error('POST request failed');
      }
    })
    .then((responseContent) => {
      const newTab = window.open();
      newTab.document.write(responseContent);
    })
    .catch((error) => {
      console.error('Error:', error);
    });
}

