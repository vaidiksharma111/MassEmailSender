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
    };
  
    reader.readAsArrayBuffer(file);
  }
  
  
  
  
  
  