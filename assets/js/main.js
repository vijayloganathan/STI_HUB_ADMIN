
      let eventData = [];
  
      function displayEventCards() {
        const eventCardsContainer = document.getElementById('eventCards');
        eventCardsContainer.innerHTML = '';
  
        eventData.forEach((event, index) => {
          const cardDiv = document.createElement('div');
          cardDiv.className = 'col-md-4 mt-3';
  
          const card = document.createElement('div');
          card.className = 'card';
  
          // Embed the PDF within an iframe
          const pdfPreview = document.createElement('iframe');
          pdfPreview.src = event.pdf; // Set the PDF URL
          pdfPreview.className = 'card-img-top';
          pdfPreview.style.height = '200px'; // Adjust the height as needed
          pdfPreview.style.border = 'none'; // Remove the border
  
          const cardBody = document.createElement('div');
          cardBody.className = 'card-body';
          cardBody.innerHTML = `
          <h5 class="card-title">${event.title}</h5>
          <a href="${event.pdf}" class="btn btn-primary" download>Download PDF</a>
          <button class="btn btn-danger mt-2" onclick="deleteEvent(${index})">Delete</button>
        `;
  
          card.appendChild(pdfPreview);
          card.appendChild(cardBody);
          cardDiv.appendChild(card);
          eventCardsContainer.appendChild(cardDiv);
        });
      }
  
      function addEvent() {
        Swal.fire({
          title: 'Add Event',
          html: `
            <h3 class="title">Enter Event Name</h3>
            <input id="eventTitle" class="swal2-input" placeholder="Event Title" required>
            <h3 class="title">Add Event PDF</h3>
            <input type="file" id="eventPdf" accept=".pdf" class="swal2-file" placeholder="Upload PDF" required>
        `,
          showCancelButton: true,
          confirmButtonText: 'Add',
          cancelButtonText: 'Cancel',
          preConfirm: () => {
            const title = document.getElementById('eventTitle').value;
            const pdf = URL.createObjectURL(document.getElementById('eventPdf').files[0]);
  
            if (!title || !pdf) {
              Swal.showValidationMessage('All fields are required');
              return false;
            }
  
            return { title, pdf };
          }
        }).then((result) => {
          if (result.isConfirmed) {
            eventData.push(result.value);
            displayEventCards();
          }
        });
      }
  
      function deleteEvent(index) {
        Swal.fire({
          title: 'Confirm Deletion',
          text: 'Are you sure you want to delete this event?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Delete',
          cancelButtonText: 'Cancel'
        }).then((result) => {
          if (result.isConfirmed) {
            eventData.splice(index, 1);
            displayEventCards();
          }
        });
      }
  
      displayEventCards();
  
  
  
  
      // =============================
  
      let imageCards = [];
  
      // Function to create an image card
      function createImageCard(imageSrc) {
        const card = document.createElement('div');
        card.className = 'col-md-6 image-card';
  
        const deleteIcon = document.createElement('span');
        deleteIcon.className = 'delete-icon';
        deleteIcon.innerHTML = 'x';
        deleteIcon.addEventListener('click', () => {
          deleteImageCard(card);
        });
  
        const image = document.createElement('img');
        image.src = imageSrc;
  
        card.appendChild(deleteIcon);
        card.appendChild(image);
  
        return card;
      }
  
      // Function to display the image cards
      function displayImageCards() {
        const imageCardContainer = document.getElementById('imageCardContainer');
        imageCardContainer.innerHTML = ''; // Clear the existing content
  
        imageCards.forEach((card) => {
          imageCardContainer.appendChild(card);
        });
      }
  
      // Function to add a new image card
      function addImageCard() {
        Swal.fire({
          title: 'Add Image Card',
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
  
            const imageSrcArray = [];
            for (let i = 0; i < imageFiles.length; i++) {
              const imageSrc = URL.createObjectURL(imageFiles[i]);
              imageSrcArray.push(imageSrc);
            }
  
            return { imageSrcArray: imageSrcArray };
          }
        }).then((result) => {
          if (result.isConfirmed) {
            const imageSrcArray = result.value.imageSrcArray;
  
            imageSrcArray.forEach((imageSrc) => {
              const imageCard = createImageCard(imageSrc);
              imageCards.push(imageCard);
            });
  
            displayImageCards();
          }
        });
      }
  
      // Function to delete an image card
      function deleteImageCard(card) {
        const index = imageCards.indexOf(card);
        if (index !== -1) {
          imageCards.splice(index, 1);
          displayImageCards();
        }
      }
  
      // Add click event listener to the + button
      const addIcon = document.getElementById('addIcon');
      addIcon.addEventListener('click', () => {
        addImageCard();
      });
  
  