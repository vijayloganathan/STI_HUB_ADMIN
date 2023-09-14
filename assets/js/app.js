const firebaseConfig = {
    apiKey: "AIzaSyDMlhB0dNigS2SJmkMvcUpl9z1CLN0fhcM",
    authDomain: "sona-dst-sti-hub.firebaseapp.com",
    databaseURL: "https://sona-dst-sti-hub-default-rtdb.firebaseio.com",
    projectId: "sona-dst-sti-hub",
    storageBucket: "sona-dst-sti-hub.appspot.com",
    messagingSenderId: "171152885658",
    appId: "1:171152885658:web:1324d8dba760c07f60dc23",
    measurementId: "G-SXBXLDN7XF"
  };


  
  firebase.initializeApp(firebaseConfig);
  firebase.analytics();
  
  const auth = firebase.auth()
  const db = firebase.firestore()
  var database = firebase.database();
  var storage = firebase.storage();
  
  var upevent = database.ref("upevent");
  var yearplan = database.ref("yearplan");
  
  // declare the content
  const dnevent=document.getElementById('displaynewevents');
  const yearplans=document.getElementById('yearplans');
  const homeimgd=document.getElementById('homeimgd');
  displaynevent();
  displayhomeimg();
  displayyearplans();
  displayEventsWithImages();
  displayInterventionsWithImages();
  galleryd();
  
  // Function to delete an event by its eventId (key) and associated PDF URL
  function deleteEvent(eventId, pdfUrl) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Are you sure you want to delete this event?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        // User confirmed the delete action
  
        // 1. Delete data from the Firebase Realtime Database
        var eventRef = database.ref('upevent/' + eventId);
        eventRef.remove()
          .then(function() {
            console.log('Event data successfully deleted from Firebase');
  
            // 2. After deleting data from the database, delete the associated file from Firebase Storage
            deleteFileFromStorage(pdfUrl);
          })
          .catch(function(error) {
            console.error('Error deleting event data: ' + error);
          });
      } else {
        // User canceled the delete action, do nothing
      }
    });
  }
  
  
  // Function to delete a file from Firebase Storage
  function deleteFileFromStorage(pdfUrl) {
    // Create a reference to the file in Firebase Storage based on its URL
    var storageRef = firebase.storage().refFromURL(pdfUrl);
  
    // Delete the file from Firebase Storage
    storageRef.delete()
      .then(function() {
        console.log('File successfully deleted from Firebase Storage');
  
        // After successfully deleting the file, refresh the displayed events
        displaynevent();
        
        // Display a success message using SweetAlert
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'File deleted Successfully'
        });
      })
      .catch(function(error) {
        console.error('Error deleting file from Firebase Storage: ' + error);
        
        // Display an error message using SweetAlert
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error deleting file from Storage: ' + error
        });
      });
  }
  
  // onload display
  function displaynevent() {
    dnevent.innerHTML = '';
  
    upevent.once('value', function (snapshot) {
      snapshot.forEach(function (childSnapshot) {
        var event = childSnapshot.val();
        var eventId = childSnapshot.key;
        const cardDiv = document.createElement('div');
        cardDiv.className = 'col-lg-4 mt-3 mx-auto'; // Add "mx-auto" class for horizontal centering
  
        const card = document.createElement('div');
        card.className = 'card card-with-padding'; // Apply custom padding class
  
        // Adjust the width of the card to make it wider
        card.style.width = '350px'; // Adjust the width as needed
  
        // Embed the PDF within an iframe
        const pdfPreview = document.createElement('iframe');
        pdfPreview.src = event.eventPdfURL; // Set the PDF URL
        pdfPreview.className = 'card-img-top';
        pdfPreview.style.height = '200px'; // Set the height
        pdfPreview.style.border = 'none'; // Remove the border
  
        const cardBody = document.createElement('div');
        cardBody.className = 'card-body col-lg-12';
        cardBody.innerHTML = `
          <h5 class="card-title"><center>${event.eventName}</center></h5>
          <center>
            <a href="${event.eventPdfURL}" class="btn download" download>Download</a>
            <a href="#" class="btn btn-danger col-lg-5" onclick="deleteEvent('${eventId}', '${event.eventPdfURL}')">Delete</a>
          </center>`;
  
        card.appendChild(pdfPreview);
        card.appendChild(cardBody);
        cardDiv.appendChild(card);
        dnevent.appendChild(cardDiv);
      });
    });
  }
  
  // Ction done in the page
  function addEventHome() {
    Swal.fire({
      title: 'Add New Event',
      html:
        '<h3 for="eventName">Event Name:</h3>' +
        '<input type="text" id="eventName" class="swal2-input">' +
        '<h3 class="title">Add Event PDF</h3>' +
        '<input type="file" id="eventPdf" accept=".pdf" class="swal2-file" placeholder="Upload PDF" required>',
      showCancelButton: true,
      confirmButtonText: 'Add',
      cancelButtonText: 'Cancel',
      preConfirm: () => {
        const eventName = Swal.getPopup().querySelector('#eventName').value;
        const eventPdfFile = Swal.getPopup().querySelector('#eventPdf').files[0];
  
        if (!eventName) {
          Swal.showValidationMessage('Event Name is required');
        } else if (!eventPdfFile) {
          Swal.showValidationMessage('PDF file is required');
        } else {
          // Upload the PDF file to Firebase Storage
          const storageRef = storage.ref();
          const pdfRef = storageRef.child('event_pdfs/' + eventPdfFile.name);
  
          pdfRef.put(eventPdfFile)
            .then(function(snapshot) {
              return snapshot.ref.getDownloadURL();
            })
            .then(function(downloadURL) {
              // Now you have the download URL for the uploaded PDF
              // You can save it along with the event name in the Realtime Database
              var eventData = {
                eventName: eventName,
                eventPdfURL: downloadURL // Store the download URL
              };
  
              var newEventRef = upevent.push(eventData);
              var newIndex = newEventRef.key;
  
              console.log("New event index:", newIndex);
  
              // Display a success message using SweetAlert
              Swal.fire({
                icon: 'success',
                title: 'Success',
                text: 'Data added successfully'
              });
  
              // Refresh the displayed events
              displaynevent();
            })
            .catch(function(error) {
              console.error("Error uploading PDF: ", error);
  
              // Display an error message using SweetAlert
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error uploading PDF: ' + error
              });
            });
        }
      }
    });
  }
  
  
  //   YEAR PLANS 
  function addyearplan() {
    Swal.fire({
      title: 'Add Year Plans',
      html:
        '<h3 for="planName">Year Plan Name:</h3>' +
        '<input type="text" id="planName" class="swal2-input">' +
        '<h3 class="title">Add Year Plan PDF PDF</h3>' +
        '<input type="file" id="planPdf" accept=".pdf" class="swal2-file" placeholder="Upload PDF" required>',
      showCancelButton: true,
      confirmButtonText: 'Add',
      cancelButtonText: 'Cancel',
      preConfirm: () => {
        const eventName = Swal.getPopup().querySelector('#planName').value;
        const eventPdfFile = Swal.getPopup().querySelector('#planPdf').files[0];
  
        if (!eventName) {
          Swal.showValidationMessage('Year Plan Name is required');
        } else if (!eventPdfFile) {
          Swal.showValidationMessage('Year Plan PDF file is required');
        } else {
          // Upload the PDF file to Firebase Storage
          const storageRef = storage.ref();
          const pdfRef = storageRef.child('yearplan_pdfs/' + eventPdfFile.name);
  
          pdfRef.put(eventPdfFile)
            .then(function(snapshot) {
              return snapshot.ref.getDownloadURL();
            })
            .then(function(downloadURL) {
              // Now you have the download URL for the uploaded PDF
              // You can save it along with the event name in the Realtime Database
              var eventData = {
                name: eventName,
                planPDFURL: downloadURL // Store the download URL
              };
  
              var newEventRef = yearplan.push(eventData);
              var newIndex = newEventRef.key;
  
              console.log("New event index:", newIndex);
  
              // Display a success message using SweetAlert
              Swal.fire({
                icon: 'success',
                title: 'Success',
                text: 'Data added successfully'
              });
  
              // Refresh the displayed year plans
              displayyearplans();
            })
            .catch(function(error) {
              console.error("Error uploading PDF: ", error);
  
              // Display an error message using SweetAlert
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error uploading PDF: ' + error
              });
            });
        }
      }
    });
  }
  
  
function displayyearplans() {
  yearplans.innerHTML = '';

  yearplan.once('value', function(snapshot) {
    snapshot.forEach(function(childSnapshot) {
      var events = childSnapshot.val();
      var eventId = childSnapshot.key;
      const cardDiv = document.createElement('div');
      cardDiv.className = 'col-lg-4 mt-3 mx-auto'; // Add "mx-auto" class for horizontal centering

      const card = document.createElement('div');
      card.className = 'card card-with-padding'; // Apply custom padding class

      // Adjust the width of the card to make it wider
      card.style.width = '350px'; // Adjust the width as needed

      // Embed the PDF within an iframe
      const pdfPreview = document.createElement('iframe');
      pdfPreview.src = events.planPDFURL; // Set the PDF URL
      pdfPreview.className = 'card-img-top';
      pdfPreview.style.height = '200px'; // Set the height
      pdfPreview.style.border = 'none'; // Remove the border

      const cardBody = document.createElement('div');
      cardBody.className = 'card-body col-lg-12';
      cardBody.innerHTML = `
        <h5 class="card-title"><center>${events.name}</center></h5>
        <center>
          <a href="${events.planPDFURL}" class="btn download" download>Download</a>
          <a href="#" class="btn btn-danger col-lg-5" onclick="deleteplan('${eventId}', '${events.planPDFURL}')">Delete</a>
        </center>`;

      card.appendChild(pdfPreview);
      card.appendChild(cardBody);
      cardDiv.appendChild(card);
      yearplans.appendChild(cardDiv);
    });
  });
}

  
  function deleteplan(eventId, pdfUrl) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Are you sure you want to delete this event?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        // User confirmed the delete action
  
        // 1. Delete data from the Firebase Realtime Database
        var eventRef = database.ref('yearplan/' + eventId);
        eventRef.remove()
          .then(function() {
            console.log('Event data successfully deleted from Firebase');
            
            // 2. After deleting data from the database, delete the associated file from Firebase Storage
            deleteFileFromStorage(pdfUrl);
  
            // 3. Remove the corresponding HTML element from the webpage
            var elementToRemove = document.getElementById('event_' + eventId);
            if (elementToRemove) {
              elementToRemove.remove();
            }
          })
          .catch(function(error) {
            console.error('Error deleting event data: ' + error);
          });
      } else {
        // User canceled the delete action, do nothing
      }
    });
  }
  
  
  // home image content
  // Function to add new images
  function homeimg() {
    Swal.fire({
      title: 'Add New Home images',
      html: `
        <input type="file" id="cardImage" accept="image/*" class="swal2-file" multiple required>
      `,
      showCancelButton: true,
      confirmButtonText: 'Add',
      cancelButtonText: 'Cancel',
      preConfirm: () => {
        const imageFiles = document.getElementById('cardImage').files;
  
        if (imageFiles.length === 0) {
          Swal.showValidationMessage('At least one image is required');
          return false;
        }
  
        const imageUploadPromises = [];
  
        // Initialize Firebase Storage and Realtime Database references
        const storageRef = firebase.storage().ref();
        const dbRef = firebase.database().ref('homeimg');
  
        for (let i = 0; i < imageFiles.length; i++) {
          const imageFile = imageFiles[i];
          const imageFileName = new Date().getTime() + '-' + imageFile.name;
       
          const imageRef = storageRef.child('gallery/' + imageFileName);
  
          // Upload image to Firebase Storage
          const uploadTask = imageRef.put(imageFile);
  
          // Push the image URL to Realtime Database after upload is complete
          const uploadPromise = new Promise((resolve, reject) => {
            uploadTask.on('state_changed', null, reject, () => {
              // Get the image URL after successful upload
              imageRef.getDownloadURL().then((downloadURL) => {
                // Save the downloadURL in the Realtime Database
                dbRef.push({ imageURL: downloadURL });
                resolve();
              });
            });
          });
  
          imageUploadPromises.push(uploadPromise);
        }
  
        // Wait for all image uploads to complete
        return Promise.all(imageUploadPromises);
      }
    })
    .then((result) => {
      if (result.isConfirmed) {
        Swal.fire('Images added successfully!', '', 'success');
      }
    })
    .catch((error) => {
      Swal.fire('Error uploading images', error.message, 'error');
    });
  }
  
// Function to create an image card
function createImageCard(imageSrc, imageKey) {
    const cardElement = document.createElement('div');
    cardElement.className = 'card'; // You can style this class with CSS for your card appearance
  
    // Set the id attribute on the card element using the imageKey
    cardElement.id = imageKey;
  
    // Create a new image element for the file
    const imageElement = document.createElement('img');
    imageElement.src = imageSrc;
  
    const deleteButton = document.createElement('button');
    deleteButton.className = 'deleteBtnCard';
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', () => {
      Swal.fire({
        title: 'Confirm Deletion',
        text: 'Are you sure you want to delete this image?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel',
      }).then((result) => {
        if (result.isConfirmed) {
          deleteImageCard(imageKey); // Call the deleteImageCard function with the image key
        }
      });
    });
  
    cardElement.appendChild(imageElement);
    cardElement.appendChild(deleteButton);
  
    return cardElement;
  }
  
  
  
  // Function to display images from Firebase Storage
  function displayhomeimg() {
    // Reference to the Firebase Storage
    const storageRef = firebase.storage().ref();
  
    // Reference to the Realtime Database containing image data
    const dbRef = firebase.database().ref('homeimg');
  
    dbRef.on('child_added', (snapshot) => {
        const imageKey = snapshot.key; // Get the image key
        const imageURL = snapshot.val().imageURL;
  
        // Create an image card for the new imageURL
        const imageCard = createImageCard(imageURL, imageKey);
  
        // Append the image card to your HTML container (e.g., a div with id "imageContainer")
        homeimgd.appendChild(imageCard);
    });
  }
  
  
// Function to delete an image from the Realtime Database and remove the card
function deleteImageCard(imageKey) {
    // Reference to the Realtime Database
    const dbRef = firebase.database().ref('homeimg');
  
    // Remove the image data by its key
    dbRef
      .child(imageKey)
      .remove()
      .then(() => {
        // Find the parent element (container) of the image card and remove it
        const imageCard = document.getElementById(imageKey);
        if (imageCard) {
          const imageContainer = imageCard.parentElement;
          imageContainer.removeChild(imageCard); // Remove the image card
        }
        Swal.fire('Image Deleted', '', 'success'); // Show a success message
      })
      .catch((error) => {
        console.error('Error deleting image data:', error);
        Swal.fire('Error Deleting Image', error.message, 'error'); // Show an error message
      });
  }
  
  
  // Main Event page function
  function addNewEvent() {
    Swal.fire({
      title: 'Add New Home images',
      html: `
        <input id="eventTitle" class="swal2-input" placeholder="Title">
        <input type="date" id="eventDate" class="swal2-input" placeholder="Date">
        <input id="eventPlace" class="swal2-input" placeholder="Place">
        <textarea id="eventContent" class="swal2-textarea" placeholder="Content"></textarea>
        <input type="file" id="newEventFiles" class="swal2-file" accept="image/, video/" multiple>
      `,
      showCancelButton: true,
      confirmButtonText: 'Add',
      cancelButtonText: 'Cancel',
      preConfirm: () => {
        const title = Swal.getPopup().querySelector('#eventTitle').value;
        const date = Swal.getPopup().querySelector('#eventDate').value;
        const place = Swal.getPopup().querySelector('#eventPlace').value;
        const content = Swal.getPopup().querySelector('#eventContent').value;
        const imageFiles = Swal.getPopup().querySelector('#newEventFiles').files;
  
        if (imageFiles.length === 0) {
          Swal.showValidationMessage('At least one image is required');
          return false;
        }
  
        const imageUploadPromises = [];
  
        // Initialize Firebase Storage and Realtime Database references
        const storageRef = firebase.storage().ref();
        const dbRef = firebase.database().ref('eventlist');
  
        const eventData = {
          title: title,
          date: date,
          place: place,
          content: content,
          imageURLs: []
        };
  
        for (let i = 0; i < imageFiles.length; i++) {
          const imageFile = imageFiles[i];
          const imageFileName = new Date().getTime() + '-' + imageFile.name;
  
          const imageRef = storageRef.child('gallery/' + imageFileName);
  
          // Upload image to Firebase Storage
          const uploadTask = imageRef.put(imageFile);
  
          // Push the image URL to Realtime Database after upload is complete
          const uploadPromise = new Promise((resolve, reject) => {
            uploadTask.on('state_changed', null, reject, () => {
              // Get the image URL after a successful upload
              imageRef.getDownloadURL().then((downloadURL) => {
                // Add the downloadURL to the eventData object
                eventData.imageURLs.push(downloadURL);
                resolve();
              });
            });
          });
  
          imageUploadPromises.push(uploadPromise);
        }
  
        // Wait for all image uploads to complete
        return Promise.all(imageUploadPromises).then(() => {
          // Save the eventData in the Realtime Database
          dbRef.push(eventData);
        });
      }
    })
    .then((result) => {
      if (result.isConfirmed) {
        Swal.fire('Images added successfully!', '', 'success');
      }
    })
    .catch((error) => {
      Swal.fire('Error uploading images', error.message, 'error');
    });
  }
  
  
  // ================================================================
  
  
  function displayEventsWithImages() {
    const eventDisplay = document.getElementById('eventimgdisplay');
  
    const dbRef = firebase.database().ref('eventlist');
  
    dbRef.on('value', (snapshot) => {
      eventDisplay.innerHTML = '';
  
      const cardRow = document.createElement('div');
      cardRow.classList.add('row');
  
      snapshot.forEach((childSnapshot) => {
        const eventData = childSnapshot.val();
  
        const cardCol = document.createElement('div');
        cardCol.classList.add('col-md-4', 'mb-3');
  
        const card = document.createElement('div');
        card.classList.add('card');
  
        if (eventData.imageURLs.length > 0) {
          const firstFile = eventData.imageURLs[0];
  
          // Reference to the Firebase Storage file
          const storageRef = firebase.storage().refFromURL(firstFile);
  
          // Get the file's metadata
          storageRef.getMetadata()
            .then((metadata) => {
              // The MIME type of the file is in metadata.contentType
              const mimeType = metadata.contentType;
  
              if (mimeType.startsWith('image/')) {
                // Create an image element
                const img = document.createElement('img');
                img.src = firstFile;
                img.classList.add('card-img-top', 'fixed-image', 'align-self-center');
                card.appendChild(img);
  
                // Create a div for the title
                const titleDiv = document.createElement('div');
                titleDiv.classList.add('card-body', 'text-center');
                titleDiv.innerHTML = `
                  <h5 class="card-title">${eventData.title}</h5>
                `;
                card.appendChild(titleDiv);
  
  
  
                // <center> <a href="${events.planPDFURL}" class="btn download" download>Download</a>
                // <a class="btn btn-danger col-lg-5" onclick="deleteplan('${eventId}', '${events.planPDFURL}')">Delete</a>
                // Create a div for buttons
                const buttonDiv = document.createElement('div');
                buttonDiv.classList.add('card-body', 'text-center');
  
                const editButton = document.createElement('button');
                editButton.className = 'btn btn-primary edit-button';
                editButton.textContent = 'Edit';
                editButton.addEventListener('click', () => editEvent(childSnapshot.key));
                buttonDiv.appendChild(editButton);
  
                const deleteButton = document.createElement('button');
                deleteButton.className = 'btn btn-danger  ml-2';
                deleteButton.textContent = 'Delete';
                deleteButton.addEventListener('click', () => deleteEvents(childSnapshot.key));
                buttonDiv.appendChild(deleteButton);
  
                card.appendChild(buttonDiv);
              } else if (mimeType.startsWith('video/')) {
                // Create a video element
                const video = document.createElement('video');
                video.src = firstFile;
                video.controls = true; // Display video controls
                video.classList.add('card-img-top', 'fixed-image', 'align-self-center');
                card.appendChild(video);
  
                // Create a div for the title
                const titleDiv = document.createElement('div');
                titleDiv.classList.add('card-body', 'text-center');
                titleDiv.innerHTML = `
                  <h5 class="card-title">${eventData.title}</h5>
                `;
                card.appendChild(titleDiv);
  
                // Create a div for buttons
                const buttonDiv = document.createElement('div');
                buttonDiv.classList.add('card-body', 'text-center');
  
                const editButton = document.createElement('button');
                editButton.className = 'btn btn-primary edit-button';
                editButton.textContent = 'Edit';
                editButton.addEventListener('click', () => editEvent(childSnapshot.key));
                buttonDiv.appendChild(editButton);
  
                const deleteButton = document.createElement('button');
                deleteButton.className = 'btn btn-danger delete-button ml-2';
                deleteButton.textContent = 'Delete';
                deleteButton.addEventListener('click', () => deleteEvents(childSnapshot.key));
                buttonDiv.appendChild(deleteButton);
  
                card.appendChild(buttonDiv);
              } else {
                // Handle other file types or display an error message
                const errorMessage = document.createElement('p');
                errorMessage.textContent = 'Unsupported file type';
                card.appendChild(errorMessage);
              }
            })
            .catch((error) => {
              console.error('Error getting file metadata:', error);
            });
        }
  
        cardCol.appendChild(card);
  
        cardRow.appendChild(cardCol);
      });
  
      eventDisplay.appendChild(cardRow);
    });
  }
  

  
  function editEvent(eventKey) {
    // Reference to the Realtime Database event node with the specific key
    const dbRef = firebase.database().ref(`eventlist/${eventKey}`);
  
    // Get the existing event data
    dbRef.once('value')
      .then((snapshot) => {
        const eventData = snapshot.val();
  
        // Open the Swal modal for editing with existing data
        Swal.fire({
          title: 'Edit Event',
          html: `
            <input id="eventTitle" class="swal2-input" placeholder="Title" value="${eventData.title}">
            <input type="date" id="eventDate" class="swal2-input" placeholder="Date" value="${eventData.date}">
            <input id="eventPlace" class="swal2-input" placeholder="Place" value="${eventData.place}">
            <textarea id="eventContent" class="swal2-textarea" placeholder="Content">${eventData.content}</textarea>
            <input type="file" id="newEventFiles" class="swal2-file" accept="image/, video/" multiple>
          `,
          showCancelButton: true,
          confirmButtonText: 'Save',
          cancelButtonText: 'Cancel',
          preConfirm: () => {
            const title = Swal.getPopup().querySelector('#eventTitle').value;
            const date = Swal.getPopup().querySelector('#eventDate').value;
            const place = Swal.getPopup().querySelector('#eventPlace').value;
            const content = Swal.getPopup().querySelector('#eventContent').value;
            const imageFiles = Swal.getPopup().querySelector('#newEventFiles').files;
  
            // Update the event data with the edited values
            eventData.title = title;
            eventData.date = date;
            eventData.place = place;
            eventData.content = content;
  
            const imageUploadPromises = [];
  
            if (imageFiles.length > 0) {
              // Initialize Firebase Storage reference
              const storageRef = firebase.storage().ref();
  
              for (let i = 0; i < imageFiles.length; i++) {
                const imageFile = imageFiles[i];
                const imageFileName = new Date().getTime() + '-' + imageFile.name;
  
                const imageRef = storageRef.child('gallery/' + imageFileName);
  
                // Upload the new image to Firebase Storage
                const uploadTask = imageRef.put(imageFile);
  
                // Push the image URL to the event's imageURLs array after upload is complete
                const uploadPromise = new Promise((resolve, reject) => {
                  uploadTask.on('state_changed', null, reject, () => {
                    // Get the image URL after successful upload
                    imageRef.getDownloadURL().then((downloadURL) => {
                      eventData.imageURLs.push(downloadURL);
                      resolve();
                    });
                  });
                });
  
                imageUploadPromises.push(uploadPromise);
              }
            }
  
            // Wait for all image uploads to complete, then update the event data in the database
            return Promise.all(imageUploadPromises)
              .then(() => {
                return dbRef.set(eventData); // Update the event data in the database
              });
          }
        })
        .then((result) => {
          if (result.isConfirmed) {
            Swal.fire('Event updated successfully!', '', 'success');
          }
        })
        .catch((error) => {
          Swal.fire('Error updating event', error.message, 'error');
        });
      });
  }
  
  
  function deleteEvents(eventKey) {
    // Reference to the Realtime Database event node with the specific key
    const dbRef = firebase.database().ref(`eventlist/${eventKey}`);
  
    // Get the existing event data
    dbRef.once('value')
      .then((snapshot) => {
        const eventData = snapshot.val();
  
        // Display date and place information in the confirmation modal
        Swal.fire({
          title: 'Are you sure you want to delete this event?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#d33',
          cancelButtonColor: '#3085d6',
          confirmButtonText: 'Delete',
          cancelButtonText: 'Cancel'
        }).then((result) => {
          if (result.isConfirmed) {
            // User confirmed deletion, remove the event from the database
            dbRef.remove()
              .then(() => {
                Swal.fire('Event deleted successfully!', '', 'success');
              })
              .catch((error) => {
                Swal.fire('Error deleting event', error.message, 'error');
              });
          }
        });
      })
      .catch((error) => {
        Swal.fire('Error retrieving event data', error.message, 'error');
      });
  }
  
  
  //   navigation function
  
  const aneventpg = document.getElementById('aneventpg');
  const yplanpg = document.getElementById('yplanpg');
  const himgpg = document.getElementById('himgpg');
  const edetailspg = document.getElementById('edetailspg');
  const gallerypg = document.getElementById('gallerypg');
  const Interventionpg = document.getElementById('Interventionpg');
  
  function navpg(id) {
  
    // Hide all pages initially
    aneventpg.style.display = "none";
    yplanpg.style.display = "none";
    himgpg.style.display = "none";
    edetailspg.style.display = "none";
    gallerypg.style.display = "none";
    Interventionpg.style.display = "none";
  
    // Show the selected page based on the id
    switch (id) {
        case '1':
            aneventpg.style.display = "block";
            break;
        case '2':
            yplanpg.style.display = "block";
            break;
        case '3':
            himgpg.style.display = "block";
            break;
        case '4':
          Interventionpg.style.display = "block";
            break;
        case '5':
            edetailspg.style.display = "block";
            break;
        case '6':
            gallerypg.style.display = "block";
            break;
        default:
            // Handle the case when id is not recognized
            alert("Invalid id: " + id);
    }
  }
  // login function
  window.onload = () => {
    try{
        const currentUser = window.localStorage.getItem('zxcvasdf')
        if(currentUser == null){
            throw new Error('No Current User')
        } else {
            const loginpg=document.getElementById('loginpg');
            const dashboardpg=document.getElementById('dashboardpg');
            loginpg.style.display="none";
            dashboardpg.style.display="block";
        }
  
    }catch(err){
  
        const loginpg=document.getElementById('loginpg');
        const dashboardpg=document.getElementById('dashboardpg');
        dashboardpg.style.display="none";
        loginpg.style.display="block";
        
        
    }
  
    
  }
  
  const login_submit=document.getElementById('loginbtn');
  
  login_submit.addEventListener('click',(event)=>{
    event.preventDefault();
    login_submit.style.display = 'none'
    let mail=document.getElementById('emailid').value;
    let password=document.getElementById('password').value;
    auth.signInWithEmailAndPassword(mail,password).then(cred => {
  
        login_submit.style.display = 'block'
        mail="";
        password=""
        loginfun('jkhnsgiskjjbfgjia');
        }).catch(err => {
            swal.fire({
                title : err ,
                icon :'error'
            }).then(() => {
                login_submit.style.display = 'block'
            })
        })
  })
  
  function loginfun(id)
  {
    window.localStorage.setItem('zxcvasdf',id);
    const loginpg=document.getElementById('loginpg');
    const dashboardpg=document.getElementById('dashboardpg');
    loginpg.style.display="none";
    dashboardpg.style.display="block";
  }
  
  //   logout function
  function logout()
  {
    window.localStorage.removeItem('zxcvasdf')
    const loginpg=document.getElementById('loginpg');
    const dashboardpg=document.getElementById('dashboardpg');
    dashboardpg.style.display="none";
    loginpg.style.display="block";
  }
  
  const forgotpwd = document.getElementById('forgotpwd');
  // Assuming you have Firebase initialized properly (auth variable is defined)
  
  forgotpwd.addEventListener('click', () => {
    const swalWithInput = Swal.mixin({
        input: 'email',
        inputPlaceholder: 'Type your Email',
        confirmButtonText: 'Submit',
        showCancelButton: true,
        cancelButtonText: 'Cancel',
        focusConfirm: false,
        preConfirm: (email) => {
            return auth.sendPasswordResetEmail(email)
                .then(() => {
                    return { email };
                })
                .catch((error) => {
                    Swal.showValidationMessage(`Error: ${error.message}`);
                });
        }
    });
  
    swalWithInput.fire({
        title: 'Reset Password',
        showLoaderOnConfirm: true,
        allowOutsideClick: () => !Swal.isLoading(),
    }).then((result) => {
        if (result.isConfirmed) {
            swal({
                title: 'Check Your Email',
                icon: 'success'
            });
        }
    });
  });
  
  
  
  // add new user
  function addnewuser() {
    Swal.fire({
      title: 'User Registration',
      html:
        '<input id="username" class="swal2-input" placeholder="Username">' +
        '<input id="email" class="swal2-input" placeholder="Email">' +
        '<input type="password" id="password" class="swal2-input" placeholder="Password">' +
        '<input type="password" id="confirmPassword" class="swal2-input" placeholder="Confirm Password">',
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Add',
      cancelButtonText: 'Cancel',
      preConfirm: () => {
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
  
        if (password != confirmPassword) {
          Swal.fire('Error', 'Passwords do not match', 'error');
          return false; // Prevent the Swal dialog from closing
        }
  
        return {
          username,
          email,
          password,
        };
      },
      allowOutsideClick: false,
      didOpen: () => {
        // Add custom validation if needed
      },
    }).then((result) => {
      if (result.isConfirmed) {
        const userData = result.value;
        firebase.auth().createUserWithEmailAndPassword(userData.email, userData.password)
          .then((userCredential) => {
            // User registered successfully
            const user = userCredential.user;
            console.log('User registered:', user);
            Swal.fire('Success', 'User registered successfully', 'success');
          })
          .catch((error) => {
            // Handle errors during user registration
            const errorCode = error.code;
            const errorMessage = error.message;
            console.error('Error during registration:', errorCode, errorMessage);
            Swal.fire('Error', `Registration failed: ${errorMessage}`, 'error');
          });
      }
    });
  }

  //   gallery function
  function galleryupload() {
    Swal.fire({
      title: 'Add Gallery Files',
      html: `
        <input type="file" id="newEventFiles" class="swal2-file" accept="image/, video/" multiple>
      `,
      showCancelButton: true,
      confirmButtonText: 'Add',
      cancelButtonText: 'Cancel',
      
      preConfirm: () => {
        const imageFiles = Swal.getPopup().querySelector('#newEventFiles').files;
  
        if (imageFiles.length === 0) {
          Swal.showValidationMessage('At least one image is required');
          return false;
        }
  
        const imageUploadPromises = [];
  
        // Initialize Firebase Storage reference
        const storageRef = firebase.storage().ref();
  
        for (let i = 0; i < imageFiles.length; i++) {
          const imageFile = imageFiles[i];
          const imageFileName = new Date().getTime() + '-' + imageFile.name;
  
          const imageRef = storageRef.child('gallery/' + imageFileName);
  
          // Upload image to Firebase Storage
          const uploadTask = imageRef.put(imageFile);
  
          // Push the image URL to Realtime Database after upload is complete
          const uploadPromise = new Promise((resolve, reject) => {
            uploadTask.on('state_changed', null, reject, () => {
              // Get the image URL after successful upload
              imageRef.getDownloadURL().then((downloadURL) => {
                resolve(downloadURL);
              });
            });
          });
  
          imageUploadPromises.push(uploadPromise);
        }
  
        // Wait for all image uploads to complete
        return Promise.all(imageUploadPromises);
      }
    })
    .then((result) => {
      if (result.isConfirmed) {
  Swal.fire('Images added successfully!', '', 'success');
  
  // Remove the gallery element
  const gallery = document.getElementById('gallery');
  gallery.remove();
  
  // Call the galleryd() function
  galleryd();
}

    })
    .catch((error) => {
      Swal.fire('Error uploading images', error.message, 'error');
    });
  }

function galleryd()
{
    // Reference to the gallery element
const galleryElement = document.getElementById('gallery');
const storageRef = firebase.storage().ref().child('gallery'); // Specify the 'gallery' child directory

// Function to display a list of files in the gallery
function displayFiles(fileList) {
    fileList.forEach((file) => {
      // Get the file name to determine its type
      const fileName = file.name;
      const fileExtension = fileName.split('.').pop().toLowerCase();
  
      // Create a new card div element for each file
      const cardElement = document.createElement('div');
      cardElement.className = 'card'; // You can style this class with CSS for your card appearance
  
      // Add a fixed height to the card (adjust as needed)
      cardElement.style.height = '200px';
  
      if (fileExtension === 'jpg' || fileExtension === 'jpeg' || fileExtension === 'png' || fileExtension === 'gif') {
        // If the file is an image, create an image element
        const imageElement = document.createElement('img');
        imageElement.className = 'media'; // Add a class for styling
        imageElement.style.height = '200px';
        // Set the image source to the Firebase Storage download URL
        file.getDownloadURL().then((url) => {
          imageElement.src = url;
        });
  
        // Append the image to the card
        cardElement.appendChild(imageElement);
      } else if (fileExtension === 'mp4' || fileExtension === 'webm' || fileExtension === 'ogg') {
        // If the file is a video, create a video element
        const videoElement = document.createElement('video');
        videoElement.className = 'media'; // Add a class for styling
        videoElement.style.height = '200px';
        videoElement.controls = true; // Add video controls (play, pause, etc.)
  
        // Set the video source to the Firebase Storage download URL
        file.getDownloadURL().then((url) => {
          const sourceElement = document.createElement('source');
          sourceElement.src = url;
          sourceElement.type = `video/${fileExtension}`;
          videoElement.appendChild(sourceElement);
        });
  
        // Append the video to the card
        cardElement.appendChild(videoElement);
      } else {
        // If it's neither an image nor a video, you can display an "Unsupported file type" message or handle it differently
        const unsupportedFileMessage = document.createElement('p');
        unsupportedFileMessage.textContent = 'Unsupported file type';
        cardElement.appendChild(unsupportedFileMessage);
      }
  
      // Create a delete button for the file
      const deleteButton = document.createElement('button');
      deleteButton.className = 'deleteBtnCard';
      deleteButton.textContent = 'Delete';
  
      deleteButton.addEventListener('click', () => {
        // Show a confirmation dialog
        Swal.fire({
          title: 'Are you sure?',
          text: 'You are about to delete this file. This action cannot be undone.',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Yes, delete it!',
          cancelButtonText: 'No, cancel',
        }).then((result) => {
          if (result.isConfirmed) {
            // User confirmed, delete the file
            deleteFile(file).then(() => {
              // File is deleted, remove the card from the gallery
              galleryElement.removeChild(cardElement);
            }).catch((error) => {
              console.error('Error deleting file:', error);
              // Handle the error (e.g., display an error message to the user)
              Swal.fire('Error', 'An error occurred while deleting the file.', 'error');
            });
          }
        });
      });
  
      // Append the delete button to the card
      cardElement.appendChild(deleteButton);
  
      // Append the card to the gallery
      galleryElement.appendChild(cardElement);
    });
  }
  
  

// Function to delete a file from Firebase Storage
function deleteFile(file) {
  // Delete the file and return a promise
  return file.delete().then(() => {
    console.log('File deleted successfully');
    // Show a success message
    Swal.fire('Deleted!', 'The file has been deleted successfully.', 'success');
  }).catch((error) => {
    console.error('Error deleting file:', error);
    // Show an error message
    Swal.fire('Error', 'An error occurred while deleting the file.', 'error');
    throw error; // Rethrow the error for handling in the caller
  });
}

// Retrieve a list of files from Firebase Storage
storageRef.listAll().then((result) => {
  const files = result.items;

  // Display the list of files in the gallery
  displayFiles(files);
}).catch((error) => {
  console.error('Error listing files:', error);
});

}
// /////////////////addIntervention///////////////////////////////////////////////


function addIntervention() {
  let pointCounter = 1; // Counter to keep track of points
  const pointInputs = []; // Array to store the point input elements

  function createPointInput() {
    const input = document.createElement('input');
    input.setAttribute('class', 'swal2-input');
    input.setAttribute('placeholder', `Point ${pointCounter}`);
    input.setAttribute('id', `point${pointCounter}`);
    return input;
  }

  Swal.fire({
    title: 'Add New Home images',
    html: `
      <input id="eventTitle" class="swal2-input" placeholder="Title">
      <div id="pointsContainer">
        ${createPointInput().outerHTML} <!-- Initial point input -->
      </div>
      <button id="addPointButton" class="swal2-confirm swal2-styled" onclick="addPoint()">Add Point</button>
      <input type="file" id="newEventFile" class="swal2-file" accept="image/, video/">
    `,
    showCancelButton: true,
    confirmButtonText: 'Add',
    cancelButtonText: 'Cancel',
    preConfirm: () => {
      const title = Swal.getPopup().querySelector('#eventTitle').value;
      const imageFile = Swal.getPopup().querySelector('#newEventFile').files[0];

      if (!imageFile) {
        Swal.showValidationMessage('Please select an image');
        return false;
      }

      // Initialize Firebase Storage and Realtime Database references
      const storageRef = firebase.storage().ref();
      const dbRef = firebase.database().ref('Intervention'); // Change this to the new child name "Intervention"

      const eventData = {
        title: title,
        points: [],
        imageURL: null,
      };

      for (let i = 1; i <= pointCounter; i++) {
        const point = Swal.getPopup().querySelector(`#point${i}`).value;
        eventData.points.push(point);
      }

      const imageFileName = new Date().getTime() + '-' + imageFile.name;
      const imageRef = storageRef.child('gallery/' + imageFileName);

      // Upload image to Firebase Storage
      const uploadTask = imageRef.put(imageFile);

      // Push the image URL to Realtime Database after upload is complete
      const uploadPromise = new Promise((resolve, reject) => {
        uploadTask.on('state_changed', null, reject, () => {
          // Get the image URL after a successful upload
          imageRef.getDownloadURL().then((downloadURL) => {
            // Add the downloadURL to the eventData object
            eventData.imageURL = downloadURL;
            resolve();
          });
        });
      });

      return uploadPromise.then(() => {
        // Save the eventData in the Realtime Database under the "Intervention" child
        dbRef.push(eventData);
      });
    },
  })
  .then((result) => {
    if (result.isConfirmed) {
      Swal.fire('Success', 'Data added successfully!', 'success');
    }
  });

  // Function to add a new point input
  function addPoint() {
    pointCounter++;
    const pointsContainer = document.getElementById('pointsContainer');
    const newPointInput = createPointInput();
    pointsContainer.appendChild(newPointInput);
  }

  // Attach the "Add Point" button click event
  document.getElementById('addPointButton').addEventListener('click', addPoint);
}

function displayInterventionsWithImages() {
  const eventDisplay = document.getElementById('Interventiondisplay');

  const dbRef = firebase.database().ref('Intervention'); 

  dbRef.on('value', (snapshot) => {
    eventDisplay.innerHTML = '';

    const cardRow = document.createElement('div');
    cardRow.classList.add('row');

    snapshot.forEach((childSnapshot) => {
      const eventData = childSnapshot.val();

      const cardCol = document.createElement('div');
      cardCol.classList.add('col-md-4', 'mb-3');

      const card = document.createElement('div');
      card.classList.add('card');

      if (eventData.imageURL) {
        const imageURL = eventData.imageURL;

        // Reference to the Firebase Storage file
        const storageRef = firebase.storage().refFromURL(imageURL);

        // Get the file's metadata
        storageRef.getMetadata()
          .then((metadata) => {
            // The MIME type of the file is in metadata.contentType
            const mimeType = metadata.contentType;

            if (mimeType.startsWith('image/')) {
              // Create an image element
              const img = document.createElement('img');
              img.src = imageURL;
              img.classList.add('card-img-top', 'fixed-image', 'align-self-center');
              card.appendChild(img);

              // Create a div for the title
              const titleDiv = document.createElement('div');
              titleDiv.classList.add('card-body', 'text-center');
              titleDiv.innerHTML = `
                <h5 class="card-title">${eventData.title}</h5>
              `;
              card.appendChild(titleDiv);

              // Create a div for buttons
              const buttonDiv = document.createElement('div');
              buttonDiv.classList.add('card-body', 'text-center');

              const editButton = document.createElement('button');
              editButton.className = 'btn btn-primary edit-button';
              editButton.textContent = 'Edit';
              editButton.addEventListener('click', () => editIntervention(childSnapshot.key));
              buttonDiv.appendChild(editButton);

              const deleteButton = document.createElement('button');
              deleteButton.className = 'btn btn-danger  ml-2';
              deleteButton.textContent = 'Delete';
              deleteButton.addEventListener('click', () => deleteIntervention(childSnapshot.key));
              buttonDiv.appendChild(deleteButton);

              card.appendChild(buttonDiv);
            } else if (mimeType.startsWith('video/')) {
              // Create a video element
              const video = document.createElement('video');
              video.src = imageURL;
              video.controls = true; // Display video controls
              video.classList.add('card-img-top', 'fixed-image', 'align-self-center');
              card.appendChild(video);

              // Create a div for the title
              const titleDiv = document.createElement('div');
              titleDiv.classList.add('card-body', 'text-center');
              titleDiv.innerHTML = `
                <h5 class="card-title">${eventData.title}</h5>
              `;
              card.appendChild(titleDiv);

              // Create a div for buttons
              const buttonDiv = document.createElement('div');
              buttonDiv.classList.add('card-body', 'text-center');

              const editButton = document.createElement('button');
              editButton.className = 'btn btn-primary edit-button';
              editButton.textContent = 'Edit';
              editButton.addEventListener('click', () => editEvent(childSnapshot.key));
              buttonDiv.appendChild(editButton);

              const deleteButton = document.createElement('button');
              deleteButton.className = 'btn btn-danger delete-button ml-2';
              deleteButton.textContent = 'Delete';
              deleteButton.addEventListener('click', () => deleteIntervention(childSnapshot.key));
              buttonDiv.appendChild(deleteButton);

              card.appendChild(buttonDiv);
            } else {
              // Handle other file types or display an error message
              const errorMessage = document.createElement('p');
              errorMessage.textContent = 'Unsupported file type';
              card.appendChild(errorMessage);
            }
          })
          .catch((error) => {
            console.error('Error getting file metadata:', error);
          });
      }

      cardCol.appendChild(card);

      cardRow.appendChild(cardCol);
    });

    eventDisplay.appendChild(cardRow);
  });
}

function editIntervention(eventKey) {
  // Reference to the Realtime Database Intervention node with the specific key
  const dbRef = firebase.database().ref(`Intervention/${eventKey}`);

  // Get the existing Intervention data
  dbRef.once('value')
    .then((snapshot) => {
      const eventData = snapshot.val();

      // Open the Swal modal for editing with existing data
      Swal.fire({
        title: 'Edit Intervention',
        html: `
          <input id="eventTitle" class="swal2-input" placeholder="Title" value="${eventData.title}">
          <div id="pointsContainer"></div>
          <button id="addPointButton" class="swal2-confirm swal2-styled" onclick="addPoint()">Add Point</button>
          <input type="file" id="newEventFile" class="swal2-file" accept="image/, video/">
        `,
        showCancelButton: true,
        confirmButtonText: 'Save',
        cancelButtonText: 'Cancel',
        preConfirm: () => {
          const title = Swal.getPopup().querySelector('#eventTitle').value;
          const imageFile = Swal.getPopup().querySelector('#newEventFile').files[0];

          // Update the Intervention data with the edited values
          eventData.title = title;

          const pointInputs = Swal.getPopup().querySelectorAll('.swal2-input');
          const points = [];

          pointInputs.forEach((input) => {
            if (input.id.startsWith('point')) {
              const pointValue = input.value.trim(); // Remove leading/trailing whitespace

              // Only add non-empty points to the array
              if (pointValue !== '') {
                points.push(pointValue);
              }
            }
          });

          eventData.points = points;

          const imageUploadPromises = [];

          if (imageFile) {
            // Initialize Firebase Storage reference
            const storageRef = firebase.storage().ref();
            const imageFileName = new Date().getTime() + '-' + imageFile.name;
            const imageRef = storageRef.child('gallery/' + imageFileName);

            // Upload the new image to Firebase Storage
            const uploadTask = imageRef.put(imageFile);

            // Push the image URL to the Intervention's imageURL field after upload is complete
            const uploadPromise = new Promise((resolve, reject) => {
              uploadTask.on('state_changed', null, reject, () => {
                // Get the image URL after successful upload
                imageRef.getDownloadURL().then((downloadURL) => {
                  eventData.imageURL = downloadURL;
                  resolve();
                });
              });
            });

            imageUploadPromises.push(uploadPromise);
          }

          // Wait for all image uploads to complete, then update the Intervention data in the database
          return Promise.all(imageUploadPromises)
            .then(() => {
              return dbRef.set(eventData); // Update the Intervention data in the database
            });
        }
      })
      .then((result) => {
        if (result.isConfirmed) {
          Swal.fire('Intervention updated successfully!', '', 'success');
        }
      })
      .catch((error) => {
        Swal.fire('Error updating Intervention', error.message, 'error');
      });

      // Populate points in the Swal modal
      const pointsContainer = document.getElementById('pointsContainer');
      eventData.points.forEach((point, index) => {
        const newPointInput = document.createElement('input');
        newPointInput.setAttribute('class', 'swal2-input');
        newPointInput.setAttribute('placeholder', `Point ${index + 1}`);
        newPointInput.setAttribute('id', `point${index + 1}`);
        newPointInput.value = point;
        pointsContainer.appendChild(newPointInput);
      });
    });
}
function addPoint() {
  const pointInputs = document.querySelectorAll('.swal2-input[id^="point"]');
  const pointCounter = pointInputs.length + 1; // Calculate the next point number
  const pointsContainer = document.getElementById('pointsContainer');
  const newPointInput = createPointInput(pointCounter);
  pointsContainer.appendChild(newPointInput);
}

function deleteIntervention(eventKey) {
  // Reference to the Realtime Database Intervention node with the specific key
  const dbRef = firebase.database().ref(`Intervention/${eventKey}`);

  // Get the existing Intervention data
  dbRef.once('value')
    .then((snapshot) => {
      const eventData = snapshot.val();

      // Display a confirmation modal
      Swal.fire({
        title: 'Are you sure you want to delete this Intervention?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel'
      }).then((result) => {
        if (result.isConfirmed) {
          // User confirmed deletion, remove the Intervention from the database
          dbRef.remove()
            .then(() => {
              // If there's an image associated with the Intervention, delete it from Firebase Storage
              if (eventData.imageURL) {
                const storageRef = firebase.storage().refFromURL(eventData.imageURL);
                storageRef.delete()
                  .then(() => {
                    Swal.fire('Intervention deleted successfully!', '', 'success');
                  })
                  .catch((error) => {
                    Swal.fire('Error deleting image', error.message, 'error');
                  });
              } else {
                Swal.fire('Intervention deleted successfully!', '', 'success');
              }
            })
            .catch((error) => {
              Swal.fire('Error deleting Intervention', error.message, 'error');
            });
        }
      });
    })
    .catch((error) => {
      Swal.fire('Error retrieving Intervention data', error.message, 'error');
    });
}
