document.addEventListener('DOMContentLoaded', () => {
  const nameInput = document.getElementById('name');
  const designationInput = document.getElementById('designation');
  const bloodGroupInput = document.getElementById('bloodGroup');
  const phoneInput = document.getElementById('phone');
  const addressInput = document.getElementById('address');
  const emailInput = document.getElementById('email');
  const imageUpload = document.getElementById('imageUpload');
  const imagePreview = document.getElementById('imagePreview');
  const toggleLiveCapture = document.getElementById('toggleLiveCapture');
  const cameraContainer = document.getElementById('cameraContainer');
  const camera = document.getElementById('camera');
  const takePhotoBtn = document.getElementById('takePhotoBtn');
  const closeCameraBtn = document.getElementById('closeCameraBtn');
  const generateBtn = document.getElementById('generateBtn');
  const downloadBtn = document.getElementById('downloadBtn');
  const virtualId = document.getElementById('virtualId');
  const displayName = document.getElementById('displayName');
  const displayDesignation = document.getElementById('displayDesignation');
  const displayBloodGroup = document.getElementById('displayBloodGroup');
  const displayPhone = document.getElementById('displayPhone');
  const profilePic = document.getElementById('profilePic');
  const openAdminBtn = document.getElementById('openAdminBtn');
  const imageToCrop = document.getElementById('imageToCrop');
  const cropModal = document.getElementById('cropModal');
  const cropBtn = document.getElementById('cropBtn');

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  let cropper;
  let videoStream = null;

  // Data Validation Functions
  function validateName(name) {
    const nameRegex = /^[a-zA-Z\s]+$/;
    return nameRegex.test(name);
  }

  function validateDesignation(designation) {
    return designation.trim() !== "";
  }

  // Image Upload with Preview and Cropping
  imageUpload.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type (optional, you can add more specific checks)
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        imageToCrop.src = e.target.result;

        // Initialize Cropper.js
        if (!cropper) {
          cropper = new Cropper(imageToCrop, {
            aspectRatio: NaN, // Allow freeform cropping
            viewMode: 1, // Restrict the cropped image to the container
          });
        } else {
          cropper.replace(e.target.result);
        }

        // Show the modal
        const modal = new bootstrap.Modal(cropModal);
        modal.show();
      };
      reader.readAsDataURL(file);
    }
  });

  // Handle the crop button click
  cropBtn.addEventListener('click', () => {
    const croppedCanvas = cropper.getCroppedCanvas();
    profilePic.src = croppedCanvas.toDataURL();
    const modal = bootstrap.Modal.getInstance(cropModal);
    modal.hide();
  });


  // Camera Functionality
  if (!/Mobi|Android/i.test(navigator.userAgent)) {
    toggleLiveCapture.style.display = 'block';

    toggleLiveCapture.addEventListener('click', () => {
      navigator.mediaDevices.getUserMedia({video: true})
          .then((stream) => {
            videoStream = stream;
            camera.srcObject = stream;
            cameraContainer.style.display = 'block';
          })
          .catch((error) => {
            alert('Unable to access camera. Please upload an image instead.');
            console.error('Camera access error:', error);
          });
    });

    takePhotoBtn.addEventListener('click', () => {
      if (videoStream) {
        canvas.width = camera.videoWidth;
        canvas.height = camera.videoHeight;
        context.drawImage(camera, 0, 0, canvas.width, canvas.height);

        imageToCrop.src = canvas.toDataURL('image/png');

        if (!cropper) {
          cropper = new Cropper(imageToCrop, {
            aspectRatio: NaN,
            viewMode: 1,
          });
        } else {
          cropper.replace(canvas.toDataURL('image/png'));
        }

        const modal = new bootstrap.Modal(cropModal);
        modal.show();

        closeCamera();
      }
    });

    closeCameraBtn.addEventListener('click', closeCamera);

    function closeCamera() {
      if (videoStream) {
        videoStream.getTracks().forEach((track) => track.stop());
      }
      cameraContainer.style.display = 'none';
    }
  } else {
    toggleLiveCapture.style.display = 'none';
  }

  // Generate ID Card
  generateBtn.addEventListener('click', (e) => {
    e.preventDefault();

    // Input Validation
    if (!validateName(nameInput.value)) {
      alert('Please enter a valid name with only alphabets and spaces.');
      return;
    }

    if (!validateDesignation(designationInput.value)) {
      alert('Please enter a valid designation.');
      return;
    }

    // Get the ID template from localStorage (if available)
    const idTemplate = localStorage.getItem('idTemplate');
    if (idTemplate) {
      virtualId.style.backgroundImage = `url(${idTemplate})`;
      virtualId.style.backgroundSize = 'cover';
    }

    displayName.textContent = nameInput.value;
    displayDesignation.textContent = designationInput.value;
    displayBloodGroup.textContent = bloodGroupInput.value;
    displayPhone.textContent = phoneInput.value;
    virtualId.style.display = 'block';
    downloadBtn.disabled = false;

    // Store employee data with a unique key (e.g., using a timestamp)
    const timestamp = Date.now();
    const employeeData = {
      name: nameInput.value,
      designation: designationInput.value,
      bloodGroup: bloodGroupInput.value,
      phone: phoneInput.value,
      address: addressInput.value,
      email: emailInput.value,
      photo: profilePic.src,
    };

    // Generate a unique key for localStorage
    const key = `employee-${timestamp}-${nameInput.value.replace(/\s+/g, '')}`;

    // Store data in localStorage (with error handling)
    try {
      localStorage.setItem(key, JSON.stringify(employeeData));
    } catch (error) {
      console.error('Error saving data to localStorage:', error);
      // You can display a user-friendly message here if needed
      if (error.name === 'QuotaExceededError') {
        alert('Local storage is full. Cannot save data.');
      } else {
        alert('An error occurred while saving data.');
      }
    }
  });

  // Download ID Card as Image
  downloadBtn.addEventListener('click', () => {
    html2canvas(document.getElementById('idCardFront')).then((canvas) => {
      const link = document.createElement('a');
      link.download = 'ID_Card.png';
      link.href = canvas.toDataURL();
      link.click();
    });
  });

  // Retrieve data from local storage (with error handling)
  try {
    nameInput.value = localStorage.getItem('name') || '';
    designationInput.value = localStorage.getItem('designation') || '';
    bloodGroupInput.value = localStorage.getItem('bloodGroup') || '';
  } catch (error) {
    console.error('Error accessing localStorage:', error);
    // You can display a user-friendly message here if needed
  }

  // Admin Panel Functionality (with secret code and redirect)
  openAdminBtn.addEventListener('click', () => {
    let enteredCode = prompt('Enter the secret code to open the Admin Panel:');
    if (enteredCode === '2003') {
      // Redirect to the admin page
      window.location.href = 'admin.html';
    } else {
      alert('Incorrect code!');
    }
  });
});