document.addEventListener('DOMContentLoaded', () => {
    const employeeDataTable = document.getElementById('employeeDataTable').getElementsByTagName('tbody')[0];
    const downloadCsvBtn = document.getElementById('downloadCsvBtn');
    const searchInput = document.getElementById('searchInput');
    const clearSearchBtn = document.getElementById('clearSearchBtn');
    const templateUpload = document.getElementById('templateUpload');
    const saveTemplateBtn = document.getElementById('saveTemplateBtn');
    const uploadTemplateBtn = document.getElementById('uploadTemplateBtn');
    const templateUploadSection = document.getElementById('templateUploadSection');
    const editModal = document.getElementById('editModal');
    const editForm = document.getElementById('editForm');
    const editKeyInput = document.getElementById('editKey');
    const editNameInput = document.getElementById('editName');
    const editDesignationInput = document.getElementById('editDesignation');
    const editBloodGroupInput = document.getElementById('editBloodGroup');
    const editPhoneInput = document.getElementById('editPhone');
    const editAddressInput = document.getElementById('editAddress');
    const editEmailInput = document.getElementById('editEmail');
  
    // Function to populate the employee data table
    function populateEmployeeData() {
      employeeDataTable.innerHTML = ''; // Clear existing data
  
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('employee-')) {
          const employeeData = JSON.parse(localStorage.getItem(key));
  
          const row = employeeDataTable.insertRow();
          const nameCell = row.insertCell();
          const designationCell = row.insertCell();
          const bloodGroupCell = row.insertCell();
          const phoneCell = row.insertCell();
          const addressCell = row.insertCell();
          const emailCell = row.insertCell();
          const timestampCell = row.insertCell();
  
          nameCell.innerHTML = employeeData.name;
          designationCell.innerHTML = employeeData.designation;
          bloodGroupCell.innerHTML = employeeData.bloodGroup;
          phoneCell.innerHTML = employeeData.phone;
          addressCell.innerHTML = employeeData.address;
          emailCell.innerHTML = employeeData.email;
          timestampCell.innerHTML = new Date(parseInt(key.split('-')[1])).toLocaleString();
  
          // --- Add Edit button ---
          const editBtn = document.createElement('button');
          editBtn.textContent = 'Edit';
          editBtn.setAttribute('data-bs-toggle', 'modal');
          editBtn.setAttribute('data-bs-target', '#editModal');
          editBtn.addEventListener('click', () => {
            // Populate the edit form with employee data
            editKeyInput.value = key;
            editNameInput.value = employeeData.name;
            editDesignationInput.value = employeeData.designation;
            editBloodGroupInput.value = employeeData.bloodGroup;
            editPhoneInput.value = employeeData.phone;
            editAddressInput.value = employeeData.address;
            editEmailInput.value = employeeData.email;
          });
          const editCell = row.insertCell();
          editCell.appendChild(editBtn);
  
          // --- Add Delete button ---
          const deleteBtn = document.createElement('button');
          deleteBtn.textContent = 'Delete';
          deleteBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to delete this record?')) {
              localStorage.removeItem(key);
              employeeDataTable.deleteRow(row.rowIndex - 1);
            }
          });
          const deleteCell = row.insertCell();
          deleteCell.appendChild(deleteBtn);
        }
      }
    }
  
    // Call populateEmployeeData() to initially populate the table
    populateEmployeeData();
  
    // --- CSV Download Functionality ---
    downloadCsvBtn.addEventListener('click', () => {
      const csv = [];
      const rows = document.querySelectorAll('#employeeDataTable tr');
  
      for (let i = 0; i < rows.length; i++) {
        const row = [], cols = rows[i].querySelectorAll('td, th');
  
        for (let j = 0; j < cols.length - 2; j++) { // Exclude Edit and Delete columns
          row.push(cols[j].innerText);
        }
  
        csv.push(row.join(','));
      }
  
      const csvFile = new Blob([csv.join('\n')], {type: 'text/csv'});
      const downloadLink = document.createElement('a');
      downloadLink.href = window.URL.createObjectURL(csvFile);
      downloadLink.download = 'employee_data.csv';
      downloadLink.click();
    });
  
    // --- Add search functionality to the table ---
    searchInput.addEventListener('keyup', () => {
      const filter = searchInput.value.toUpperCase();
      const rows = employeeDataTable.getElementsByTagName('tr');
  
      for (let i = 0; i < rows.length; i++) {
        const cells = rows[i].getElementsByTagName('td');
        let found = false;
        for (let j = 0; j < cells.length; j++) {
          if (cells[j].textContent.toUpperCase().indexOf(filter) > -1) {
            found = true;
            break;
          }
        }
        if (found) {
          rows[i].style.display = '';
        } else {
          rows[i].style.display = 'none';
        }
      }
    });
  
    // --- Add a "Clear Search" button ---
    clearSearchBtn.addEventListener('click', () => {
      searchInput.value = ''; // Clear the search input field
      const rows = employeeDataTable.getElementsByTagName('tr');
      for (let i = 0; i < rows.length; i++) {
        rows[i].style.display = ''; // Show all rows
      }
    });
  
    // --- Save ID Template ---
    saveTemplateBtn.addEventListener('click', () => {
      const file = templateUpload.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          localStorage.setItem('idTemplate', e.target.result);
          alert('Template saved successfully!');
          templateUploadSection.style.display = 'none'; // Hide the upload section
        };
        reader.readAsDataURL(file);
      }
    });
  
    // --- Show/Hide Template Upload Section ---
    uploadTemplateBtn.addEventListener('click', () => {
      if (templateUploadSection.style.display === 'none') {
        templateUploadSection.style.display = 'block';
      } else {
        templateUploadSection.style.display = 'none';
      }
    });
  
    // --- Handle Edit Form Submission ---
    editForm.addEventListener('submit', (event) => {
      event.preventDefault();
  
      const key = editKeyInput.value;
      const updatedEmployeeData = {
        name: editNameInput.value,
        designation: editDesignationInput.value,
        bloodGroup: editBloodGroupInput.value,
        phone: editPhoneInput.value,
        address: editAddressInput.value,
        email: editEmailInput.value
        // You may need to update the photo if you implement photo editing
      };
  
      localStorage.setItem(key, JSON.stringify(updatedEmployeeData));
  
      // Close the modal
      const modal = bootstrap.Modal.getInstance(editModal);
      modal.hide();
  
      // Update the table
      populateEmployeeData();
    });
  });