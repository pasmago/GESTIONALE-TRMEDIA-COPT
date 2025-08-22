document.addEventListener('DOMContentLoaded', () => {
    // Funzione per salvare i dati nel Local Storage
    function saveToLocalStorage(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }

    // Funzione per caricare i dati dal Local Storage
    function loadFromLocalStorage(key, defaultData = []) {
        const storedData = localStorage.getItem(key);
        return storedData ? JSON.parse(storedData) : defaultData;
    }

    let database = loadFromLocalStorage('inventoryItems', [
        { name: 'Sony HDC-3500', serial: 'SN123456789', category: 'Telecamere', status: 'Disponibile', location: 'Magazzino', notes: '', image: '', attachment: { name: '', data: '' }, maintenance: [] },
        { name: 'Obiettivo Fujinon UA14x4.5BERD', serial: 'OB789012345', category: 'Ottiche', status: 'In Uso', location: 'OB Van', notes: 'Manutenzione periodica ogni 6 mesi.', image: '', attachment: { name: '', data: '' }, maintenance: [] },
        { name: 'Blackmagic ATEM Constellation 8K', serial: 'BMK567890123', category: 'Mixer Video', status: 'Disponibile', location: 'Magazzino', notes: '', image: '', attachment: { name: '', data: '' }, maintenance: [] },
        { name: 'Cavo SDI 50m', serial: 'SDI-50M-001', category: 'Cavi Video', status: 'In Manutenzione', location: 'Riparazione', notes: 'Sostituire connettore BNC.', image: '', attachment: { name: '', data: '' }, maintenance: [] }
    ]);
    
    let suppliers = loadFromLocalStorage('suppliers', []);

    const itemForm = document.getElementById('item-form');
    const itemListContainer = document.querySelector('.item-list');
    const searchInput = document.getElementById('search-input');
    const statusFilter = document.getElementById('status-filter');
    const navLinks = document.querySelectorAll('nav a');
    const formTitle = document.getElementById('form-title');
    const imageInput = document.getElementById('item-image');
    const imagePreview = document.getElementById('image-preview');
    const attachmentInput = document.getElementById('item-attachment');
    const attachmentNameSpan = document.getElementById('attachment-name');

    const loginScreen = document.getElementById('login-screen');
    const loginForm = document.getElementById('login-form');
    const mainHeader = document.querySelector('header');
    const mainContent = document.querySelector('main');
    const mainFooter = document.querySelector('footer');
    const backToInventoryBtn = document.getElementById('back-to-inventory-btn');

    const loanFormSection = document.getElementById('loan-form-section');
    const loanForm = document.getElementById('loan-form');
    const loanItemName = document.getElementById('loan-item-name');
    const loanItemSerial = document.getElementById('loan-item-serial');
    const loanPersonName = document.getElementById('loan-person-name');
    const loanReturnDateInput = document.getElementById('loan-return-date-input');
    const cancelLoanBtn = document.getElementById('cancel-loan-btn');
    const loanListContainer = document.querySelector('.loan-list-container');
    const noLoansMessage = document.querySelector('.no-loans-message');
    const quickLinks = document.querySelectorAll('.dashboard-quick-links .quick-link');
    const addMaintenanceBtn = document.getElementById('add-maintenance-btn');
    const maintenanceFormSection = document.getElementById('maintenance-form-section');
    const maintenanceForm = document.getElementById('maintenance-form');
    const cancelMaintenanceBtn = document.getElementById('cancel-maintenance-btn');
    const maintenanceItemName = document.getElementById('maintenance-item-name');
    const maintenanceItemSerial = document.getElementById('maintenance-item-serial');
    const maintenanceAttachmentInput = document.getElementById('maintenance-attachment');
    const maintenanceAttachmentNameSpan = document.getElementById('maintenance-attachment-name');
    const maintenanceExecutedBySelect = document.getElementById('maintenance-executed-by');
    const maintenanceFilterCompany = document.getElementById('maintenance-filter-company');
    const maintenanceFilterRating = document.getElementById('maintenance-filter-rating');
    const maintenanceAlertsList = document.getElementById('maintenance-alerts-list');
    const maintenanceAlertsContainer = document.getElementById('maintenance-alerts');
    const sendEmailReminderCheckbox = document.getElementById('send-email-reminder');

    const addSupplierBtn = document.getElementById('add-supplier-btn');
    const supplierListContainer = document.getElementById('supplier-list-container');
    const supplierFormContainer = document.getElementById('supplier-form-container');
    const supplierForm = document.getElementById('supplier-form');
    const supplierIdInput = document.getElementById('supplier-id');
    const supplierNameInput = document.getElementById('supplier-name');
    const supplierContactInput = document.getElementById('supplier-contact');
    const supplierNotesInput = document.getElementById('supplier-notes');
    const cancelSupplierBtn = document.getElementById('cancel-supplier-btn');
    const supplierFormTitle = document.getElementById('supplier-form-title');

    const customReportForm = document.getElementById('custom-report-form');
    const reportStartDate = document.getElementById('report-start-date');
    const reportEndDate = document.getElementById('report-end-date');
    const reportStatus = document.getElementById('report-status');
    const reportCategory = document.getElementById('report-category');
    const customReportOutput = document.getElementById('custom-report-output');
    const reportSummary = document.getElementById('report-summary');
    const reportList = document.getElementById('report-list');
    const exportCustomReportCsvBtn = document.getElementById('export-custom-report-csv-btn');
    
    let itemToLoan = null;
    let itemToMaintain = null;
    let statusChartInstance = null;
    let categoryChartInstance = null;

    let userRole = null;
    let currentAttachment = null;
    let currentImage = null;
    let currentMaintenanceAttachment = null;
    
    // Inizialmente nasconde tutto tranne la schermata di login
    mainHeader.classList.add('hidden');
    mainContent.classList.add('hidden');
    mainFooter.classList.add('hidden');

    // Funzione per visualizzare l'anteprima dell'immagine
    imageInput.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                imagePreview.src = e.target.result;
                imagePreview.style.display = 'block';
                currentImage = e.target.result;
            };
            reader.readAsDataURL(file);
        } else {
            imagePreview.style.display = 'none';
            currentImage = null;
        }
    });

    // Funzione per visualizzare il nome dell'allegato
    attachmentInput.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                attachmentNameSpan.textContent = file.name;
                attachmentNameSpan.style.display = 'block';
                currentAttachment = {
                    name: file.name,
                    data: e.target.result
                };
            };
            reader.readAsDataURL(file);
        } else {
            attachmentNameSpan.style.display = 'none';
            currentAttachment = null;
        }
    });

    // Funzione per visualizzare il nome dell'allegato di manutenzione
    maintenanceAttachmentInput.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                maintenanceAttachmentNameSpan.textContent = file.name;
                maintenanceAttachmentNameSpan.style.display = 'block';
                currentMaintenanceAttachment = {
                    name: file.name,
                    data: e.target.result
                };
            };
            reader.readAsDataURL(file);
        } else {
            maintenanceAttachmentNameSpan.style.display = 'none';
            currentMaintenanceAttachment = null;
        }
    });

    // Logica di Login
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const password = document.getElementById('password').value;

        if (password === 'admin') {
            userRole = 'admin';
            loginScreen.classList.add('hidden');
            mainHeader.classList.remove('hidden');
            mainContent.classList.remove('hidden');
            mainFooter.classList.remove('hidden');
            showSection('dashboard');
            alert('Accesso come Amministratore riuscito!');
        } else if (password === 'guest') {
            userRole = 'guest';
            loginScreen.classList.add('hidden');
            mainHeader.classList.remove('hidden');
            mainContent.classList.remove('hidden');
            mainFooter.classList.remove('hidden');
            showSection('dashboard');
            alert('Accesso come Visitatore riuscito!');
        } else {
            alert('Password errata!');
        }
    });
    
    // Funzione per popolare il selettore dei fornitori
    function populateSupplierSelect() {
        maintenanceExecutedBySelect.innerHTML = '<option value="">Seleziona un fornitore...</option>';
        suppliers.forEach(supplier => {
            const option = document.createElement('option');
            option.value = supplier.name;
            option.textContent = supplier.name;
            maintenanceExecutedBySelect.appendChild(option);
        });
    }

    // Funzioni per l'interfaccia utente
    function showSection(sectionId) {
        document.querySelectorAll('section').forEach(section => {
            section.style.display = 'none';
        });
        document.getElementById(sectionId).style.display = 'block';

        navLinks.forEach(link => {
            const linkSectionId = link.getAttribute('data-section');
            if (linkSectionId === sectionId) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        if (sectionId === 'inventory') {
            filterAndSearchItems();
        } else if (sectionId === 'dashboard') {
            updateDashboardStats();
            checkMaintenanceAlerts();
        } else if (sectionId === 'loans') {
            renderLoans();
        } else if (sectionId === 'add-item' && userRole === 'guest') {
            alert('Non hai i permessi per accedere a questa funzione.');
            showSection('inventory');
        } else if (sectionId === 'reports') {
            renderReports();
        } else if (sectionId === 'suppliers') {
            renderSuppliers();
        }
    }

    function updateDashboardStats() {
      document.getElementById('total-count').textContent = database.length;
      document.getElementById('available-count').textContent = database.filter(item => item.status === 'Disponibile').length;
      document.getElementById('in-use-count').textContent = database.filter(item => item.status === 'In Uso').length;
      document.getElementById('maintenance-count').textContent = database.filter(item => item.status === 'In Manutenzione').length;
      document.getElementById('faulty-count').textContent = database.filter(item => item.status === 'Non Funzionante').length;
    }

    function renderItems(itemsToRender) {
        itemListContainer.innerHTML = '';
        if (itemsToRender.length === 0) {
            itemListContainer.innerHTML = '<p class="no-items-message">Nessun articolo trovato.</p>';
            return;
        }
        itemsToRender.forEach(item => {
            const itemCard = document.createElement('div');
            itemCard.className = 'item-card';
            itemCard.dataset.serial = item.serial; // Aggiunto data attribute
            const statusClass = item.status.toLowerCase().replace(' ', '-');
            const statusText = item.status;
            const imageHTML = item.image ? `<img src="${item.image}" alt="Immagine di ${item.name}" class="item-image">` : '';
            itemCard.innerHTML = `
                ${imageHTML}
                <div class="item-header">
                    <h3>${item.name}</h3>
                    <span class="item-status ${statusClass}">${statusText}</span>
                </div>
                <p>Seriale: ${item.serial}</p>
                <p>Categoria: ${item.category}</p>
                <p>Posizione: ${item.location}</p>
            `;
            itemListContainer.appendChild(itemCard);
        });
        addEventListenersToItems();
    }
    
    function addEventListenersToItems() {
        document.querySelectorAll('.item-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const serial = e.currentTarget.dataset.serial;
                const selectedItem = database.find(item => item.serial === serial);
                if (selectedItem) {
                    renderItemDetail(selectedItem);
                }
            });
        });
    }

    function renderItemDetail(item) {
        showSection('item-detail');
        document.getElementById('detail-name').textContent = item.name;
        document.getElementById('detail-serial').textContent = item.serial;
        document.getElementById('detail-category').textContent = item.category;
        document.getElementById('detail-location').textContent = item.location;
        const detailStatusElement = document.getElementById('detail-status');
        detailStatusElement.textContent = item.status;
        detailStatusElement.className = `item-status ${item.status.toLowerCase().replace(' ', '-')}`;

        const detailImageElement = document.getElementById('detail-image');
        if (item.image) {
            detailImageElement.src = item.image;
        } else {
            detailImageElement.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" style="fill:%23f0f0f0;"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="10" fill="%23a0a0a0">Nessuna immagine</text></svg>';
        }

        const detailNotesContainer = document.getElementById('detail-notes-container');
        const detailNotesElement = document.getElementById('detail-notes');
        if (item.notes) {
            detailNotesElement.textContent = item.notes;
            detailNotesContainer.style.display = 'block';
        } else {
            detailNotesContainer.style.display = 'none';
        }
        
        const loanInfoContainer = document.getElementById('loan-info-container');
        if (item.loan) {
            document.getElementById('loan-person').textContent = item.loan.person;
            document.getElementById('loan-return-date').textContent = item.loan.returnDate;
            loanInfoContainer.classList.remove('hidden');
        } else {
            loanInfoContainer.classList.add('hidden');
        }

        const detailAttachmentContainer = document.getElementById('detail-attachment-container');
        const detailAttachmentLink = document.getElementById('detail-attachment');
        const attachmentLabel = document.getElementById('attachment-label');
        if (item.attachment && item.attachment.data) {
            detailAttachmentLink.href = item.attachment.data;
            attachmentLabel.textContent = item.attachment.name;
            detailAttachmentContainer.style.display = 'block';
        } else {
            detailAttachmentContainer.style.display = 'none';
        }
        
        renderMaintenanceHistory(item);

        // Reset maintenance filters when viewing a new item
        maintenanceFilterCompany.value = '';
        maintenanceFilterRating.value = 'all';

        const detailActions = document.getElementById('detail-actions');
        detailActions.innerHTML = ''; // Pulisci i vecchi pulsanti

        if (userRole === 'admin') {
            if (item.status === 'Disponibile') {
                const loanBtn = document.createElement('button');
                loanBtn.className = 'btn btn-loan';
                loanBtn.textContent = 'Presta Articolo';
                loanBtn.addEventListener('click', () => {
                    setupLoanForm(item);
                });
                detailActions.appendChild(loanBtn);
            } else if (item.status === 'In Uso' && item.loan) {
                const returnBtn = document.createElement('button');
                returnBtn.className = 'btn btn-return';
                returnBtn.textContent = 'Restituisci Articolo';
                returnBtn.addEventListener('click', () => {
                    returnItem(item.serial);
                });
                detailActions.appendChild(returnBtn);
            }

            const editBtn = document.createElement('button');
            editBtn.className = 'btn btn-edit';
            editBtn.textContent = 'Modifica';
            editBtn.addEventListener('click', () => {
                populateFormForEdit(item.serial);
                showSection('add-item');
            });
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn btn-delete';
            deleteBtn.textContent = 'Elimina';
            deleteBtn.addEventListener('click', () => {
                deleteItem(item.serial);
            });
            detailActions.appendChild(editBtn);
            detailActions.appendChild(deleteBtn);
        }
    }

    backToInventoryBtn.addEventListener('click', () => {
        showSection('inventory');
    });

    function filterAndSearchItems() {
      const searchText = searchInput.value.toLowerCase();
      const filterStatus = statusFilter.value;
      const filteredItems = database.filter(item => {
          const matchesSearch = searchText === '' ||
              item.name.toLowerCase().includes(searchText) ||
              item.serial.toLowerCase().includes(searchText) ||
              item.category.toLowerCase().includes(searchText);
          const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
          return matchesSearch && matchesStatus;
      });
      renderItems(filteredItems);
    }
    
    function populateFormForEdit(serial) {
        const itemToEdit = database.find(item => item.serial === serial);
        if (itemToEdit) {
            formTitle.textContent = 'Modifica Articolo';
            document.getElementById('item-serial').disabled = true;

            document.getElementById('item-name').value = itemToEdit.name;
            document.getElementById('item-serial').value = itemToEdit.serial;
            document.getElementById('item-category').value = itemToEdit.category;
            document.getElementById('item-status').value = itemToEdit.status;
            document.getElementById('item-location').value = itemToEdit.location;
            document.getElementById('item-notes').value = itemToEdit.notes;

            if (itemToEdit.image) {
                imagePreview.src = itemToEdit.image;
                imagePreview.style.display = 'block';
                currentImage = itemToEdit.image;
            } else {
                imagePreview.style.display = 'none';
                currentImage = null;
            }

            if (itemToEdit.attachment && itemToEdit.attachment.name) {
                attachmentNameSpan.textContent = itemToEdit.attachment.name;
                attachmentNameSpan.style.display = 'block';
                currentAttachment = itemToEdit.attachment;
            } else {
                attachmentNameSpan.style.display = 'none';
                currentAttachment = null;
            }

            document.querySelector('.btn-submit').style.display = 'none';
            let updateButton = document.getElementById('btn-update');
            if (!updateButton) {
                updateButton = document.createElement('button');
                updateButton.id = 'btn-update';
                updateButton.className = 'btn-submit';
                updateButton.textContent = 'Aggiorna Articolo';
                updateButton.type = 'button';
                document.getElementById('item-form').appendChild(updateButton);
            } else {
                updateButton.style.display = 'inline-block';
            }

            updateButton.onclick = () => {
                updateItem(serial);
            };
        }
    }

    function updateItem(serial) {
        const itemIndex = database.findIndex(item => item.serial === serial);
        if (itemIndex !== -1) {
            const file = imageInput.files[0];
            const attachmentFile = attachmentInput.files[0];

            let newImage = currentImage;
            let newAttachment = currentAttachment;

            const updateData = () => {
                database[itemIndex] = {
                    ...database[itemIndex],
                    name: document.getElementById('item-name').value,
                    serial: document.getElementById('item-serial').value,
                    category: document.getElementById('item-category').value,
                    status: document.getElementById('item-status').value,
                    location: document.getElementById('item-location').value,
                    notes: document.getElementById('item-notes').value,
                    image: newImage,
                    attachment: newAttachment,
                };
                saveToLocalStorage('inventoryItems', database);
                itemForm.reset();
                imagePreview.style.display = 'none';
                attachmentNameSpan.style.display = 'none';
                document.querySelector('.btn-submit').style.display = 'inline-block';
                const updateBtn = document.getElementById('btn-update');
                if (updateBtn) {
                    updateBtn.style.display = 'none';
                }
                formTitle.textContent = 'Aggiungi un Nuovo Articolo';
                document.getElementById('item-serial').disabled = false;
                showSection('inventory');
            };

            const imagePromise = new Promise(resolve => {
                if (file) {
                    const reader = new FileReader();
                    reader.onload = e => resolve(e.target.result);
                    reader.readAsDataURL(file);
                } else {
                    resolve(currentImage);
                }
            });

            const attachmentPromise = new Promise(resolve => {
                if (attachmentFile) {
                    const reader = new FileReader();
                    reader.onload = e => resolve({ name: attachmentFile.name, data: e.target.result });
                    reader.readAsDataURL(attachmentFile);
                } else {
                    resolve(currentAttachment);
                }
            });

            Promise.all([imagePromise, attachmentPromise]).then(results => {
                newImage = results[0];
                newAttachment = results[1];
                updateData();
            });
        }
    }

    function deleteItem(serial) {
      if (confirm(`Sei sicuro di voler eliminare l'articolo con seriale ${serial}?`)) {
          database = database.filter(item => item.serial !== serial);
          saveToLocalStorage('inventoryItems', database);
          showSection('inventory');
          updateDashboardStats();
          alert('Articolo eliminato con successo!');
      }
    }
    
    // Funzioni per la gestione dei prestiti
    function setupLoanForm(item) {
        itemToLoan = item;
        loanItemName.textContent = item.name;
        loanItemSerial.textContent = item.serial;
        loanPersonName.value = '';
        loanReturnDateInput.value = '';
        showSection('loan-form-section');
    }

    function recordLoan() {
        const person = loanPersonName.value;
        const returnDate = loanReturnDateInput.value;

        if (person && returnDate) {
            const item = database.find(i => i.serial === itemToLoan.serial);
            if (item) {
                item.status = 'In Uso';
                item.loan = { person, returnDate };
                saveToLocalStorage('inventoryItems', database);
                showSection('inventory');
                alert(`Prestito di "${item.name}" registrato per ${person}.`);
            }
        }
    }

    function returnItem(serial) {
        const item = database.find(i => i.serial === serial);
        if (item && item.loan) {
            item.status = 'Disponibile';
            item.loan = null;
            saveToLocalStorage('inventoryItems', database);
            showSection('inventory');
            alert(`Articolo "${item.name}" restituito con successo.`);
        }
    }

    function renderLoans() {
        const loans = database.filter(item => item.loan);
        loanListContainer.innerHTML = '';
        if (loans.length > 0) {
            noLoansMessage.style.display = 'none';
            loans.forEach(loan => {
                const loanCard = document.createElement('div');
                loanCard.className = 'loan-card';
                loanCard.innerHTML = `
                    <h3>${loan.name}</h3>
                    <p><strong>Seriale:</strong> ${loan.serial}</p>
                    <p><strong>Prestato a:</strong> ${loan.loan.person}</p>
                    <p><strong>Ritorno previsto:</strong> ${loan.loan.returnDate}</p>
                    <button class="btn btn-return" data-serial="${loan.serial}">Restituisci</button>
                `;
                loanListContainer.appendChild(loanCard);
            });
            document.querySelectorAll('.loan-card .btn-return').forEach(button => {
                button.addEventListener('click', (e) => {
                    const serial = e.target.dataset.serial;
                    returnItem(serial);
                });
            });
        } else {
            noLoansMessage.style.display = 'block';
        }
    }

    // Funzione per la gestione delle manutenzioni
    function renderMaintenanceHistory(item) {
        const maintenanceList = document.getElementById('maintenance-list');
        maintenanceList.innerHTML = '';

        const searchText = maintenanceFilterCompany.value.toLowerCase();
        const filterRating = parseInt(maintenanceFilterRating.value);

        const filteredMaintenance = item.maintenance.filter(m => {
            const matchesSearch = searchText === '' || (m.executedBy && m.executedBy.toLowerCase().includes(searchText));
            const matchesRating = isNaN(filterRating) || (m.rating && m.rating >= filterRating);
            return matchesSearch && matchesRating;
        });
        
        if (filteredMaintenance && filteredMaintenance.length > 0) {
            filteredMaintenance.forEach(m => {
                const ratingStars = m.rating ? '⭐'.repeat(m.rating) : 'N/A';
                const maintenanceItem = document.createElement('div');
                let maintenanceClass = 'maintenance-item';

                if (m.dueDate) {
                    const today = new Date();
                    const dueDate = new Date(m.dueDate);
                    const diffTime = dueDate.getTime() - today.getTime();
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    if (diffDays <= 30 && diffDays > 0) {
                        maintenanceClass += ' due-soon';
                    } else if (diffDays <= 0) {
                        maintenanceClass += ' overdue';
                    }
                }

                maintenanceItem.className = maintenanceClass;
                maintenanceItem.innerHTML = `
                    <p><strong>Data:</strong> ${m.date}</p>
                    <p><strong>Descrizione:</strong> ${m.description}</p>
                    ${m.executedBy ? `<p><strong>Eseguito da:</strong> ${m.executedBy}</p>` : ''}
                    ${m.dueDate ? `<p><strong>Scadenza:</strong> ${m.dueDate}</p>` : ''}
                    ${m.cost ? `<p class="maintenance-cost"><strong>Costo:</strong> €${m.cost.toFixed(2)}</p>` : ''}
                    ${m.rating ? `<p><strong>Valutazione:</strong> <span class="maintenance-rating">${ratingStars}</span></p>` : ''}
                    ${m.attachment && m.attachment.data ? `<p><strong>Allegato:</strong> <a href="${m.attachment.data}" download="${m.attachment.name}">${m.attachment.name}</a></p>` : ''}
                    <button class="btn-delete-maintenance" data-maintenance-id="${m.id}">×</button>
                `;
                maintenanceList.appendChild(maintenanceItem);
            });

            document.querySelectorAll('.btn-delete-maintenance').forEach(button => {
                button.addEventListener('click', (e) => {
                    const maintenanceId = e.target.dataset.maintenanceId;
                    deleteMaintenance(item.serial, maintenanceId);
                });
            });

        } else {
            maintenanceList.innerHTML = '<p>Nessun intervento di manutenzione registrato.</p>';
        }
    }

    addMaintenanceBtn.addEventListener('click', () => {
        itemToMaintain = database.find(i => i.serial === document.getElementById('detail-serial').textContent);
        if (itemToMaintain) {
            maintenanceItemName.textContent = itemToMaintain.name;
            maintenanceItemSerial.textContent = itemToMaintain.serial;
            maintenanceForm.reset();
            maintenanceAttachmentNameSpan.style.display = 'none';
            currentMaintenanceAttachment = null;
            populateSupplierSelect();
            showSection('maintenance-form-section');
        }
    });
    
    maintenanceFilterCompany.addEventListener('input', () => {
      const item = database.find(i => i.serial === document.getElementById('detail-serial').textContent);
      if (item) {
          renderMaintenanceHistory(item);
      }
    });

    maintenanceFilterRating.addEventListener('change', () => {
      const item = database.find(i => i.serial === document.getElementById('detail-serial').textContent);
      if (item) {
          renderMaintenanceHistory(item);
      }
    });


    maintenanceForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const date = document.getElementById('maintenance-date').value;
        const dueDate = document.getElementById('maintenance-due-date').value || null;
        const description = document.getElementById('maintenance-description').value;
        const executedBy = maintenanceExecutedBySelect.value;
        const cost = parseFloat(document.getElementById('maintenance-cost').value) || null;
        const rating = parseInt(document.getElementById('maintenance-rating').value) || null;
        const sendReminder = sendEmailReminderCheckbox.checked;
        const attachmentFile = maintenanceAttachmentInput.files[0];
        
        let newAttachment = currentMaintenanceAttachment;

        const attachmentPromise = new Promise(resolve => {
            if (attachmentFile) {
                const reader = new FileReader();
                reader.onload = e => resolve({ name: attachmentFile.name, data: e.target.result });
                reader.readAsDataURL(attachmentFile);
            } else {
                resolve(null);
            }
        });

        attachmentPromise.then(attachment => {
            const maintenance = {
                id: Date.now().toString(),
                date,
                dueDate,
                description,
                executedBy,
                cost,
                rating,
                attachment,
                sendReminder
            };

            const item = database.find(i => i.serial === itemToMaintain.serial);
            if (item) {
                if (!item.maintenance) {
                    item.maintenance = [];
                }
                item.maintenance.push(maintenance);
                saveToLocalStorage('inventoryItems', database);
                renderItemDetail(item);
                showSection('item-detail');
                alert('Intervento di manutenzione aggiunto!');
            }
        });
    });
    
    cancelMaintenanceBtn.addEventListener('click', () => {
        const item = database.find(i => i.serial === maintenanceItemSerial.textContent);
        if (item) {
            renderItemDetail(item);
        }
    });

    function deleteMaintenance(serial, maintenanceId) {
        const item = database.find(i => i.serial === serial);
        if (item && item.maintenance) {
            item.maintenance = item.maintenance.filter(m => m.id !== maintenanceId);
            saveToLocalStorage('inventoryItems', database);
            renderItemDetail(item);
            alert('Intervento di manutenzione eliminato.');
        }
    }
    
    function checkMaintenanceAlerts() {
        const today = new Date();
        const alerts = [];
        
        database.forEach(item => {
            if (item.maintenance && item.maintenance.length > 0) {
                item.maintenance.forEach(m => {
                    if (m.dueDate) {
                        const dueDate = new Date(m.dueDate);
                        const diffTime = dueDate.getTime() - today.getTime();
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        
                        if (diffDays <= 30 && diffDays >= 0) {
                            alerts.push({
                                name: item.name,
                                serial: item.serial,
                                dueDate: m.dueDate,
                                days: diffDays,
                                executedBy: m.executedBy,
                                sendReminder: m.sendReminder
                            });
                        }
                        
                        if (m.sendReminder && diffDays === 30) {
                            sendMaintenanceReminder(m, item);
                        }
                    }
                });
            }
        });
        
        maintenanceAlertsList.innerHTML = '';
        if (alerts.length > 0) {
            maintenanceAlertsContainer.style.display = 'block';
            alerts.sort((a, b) => a.days - b.days);
            alerts.forEach(alert => {
                const li = document.createElement('li');
                let message = '';
                if (alert.days === 0) {
                    message = `<strong>Oggi:</strong> "${alert.name}" (Seriale: ${alert.serial}) - Scadenza manutenzione.`;
                } else if (alert.days > 0) {
                    message = `<strong>${alert.days} giorni rimanenti:</strong> "${alert.name}" (Seriale: ${alert.serial}) - Scadenza il ${alert.dueDate}.`;
                }
                li.innerHTML = message;
                maintenanceAlertsList.appendChild(li);
            });
        } else {
            maintenanceAlertsContainer.style.display = 'none';
        }
    }

    // Funzione per simulare l'invio dell'email di promemoria
    function sendMaintenanceReminder(maintenance, item) {
        const supplier = suppliers.find(s => s.name === maintenance.executedBy);
        if (supplier && supplier.contact) {
            const subject = `Promemoria Manutenzione Articolo: ${item.name} (Seriale: ${item.serial})`;
            const body = `Gentile ${supplier.name},\n\nTi scriviamo per ricordarti che la manutenzione per l'articolo "${item.name}" (Seriale: ${item.serial}) è in scadenza il ${maintenance.dueDate}.\n\nCordiali saluti,\nGestione Inventario`;
            console.log(`Simulazione invio email a: ${supplier.contact}`);
            console.log(`Oggetto: ${subject}`);
            console.log(`Corpo: ${body}`);
            alert(`Promemoria email per la manutenzione di "${item.name}" inviato a ${supplier.name} (${supplier.contact}).`);
        } else {
            console.log(`Impossibile inviare promemoria email per "${item.name}". Fornitore non trovato o contatto mancante.`);
        }
    }


    // Funzione per la gestione dei fornitori
    function renderSuppliers() {
        supplierListContainer.innerHTML = '';
        supplierFormContainer.style.display = 'none';

        if (suppliers.length === 0) {
            supplierListContainer.innerHTML = '<p class="no-items-message">Nessun fornitore registrato.</p>';
        } else {
            suppliers.forEach(supplier => {
                const supplierCard = document.createElement('div');
                supplierCard.className = 'supplier-card';
                supplierCard.innerHTML = `
                    <div class="supplier-actions-card">
                        <button class="btn btn-edit" data-id="${supplier.id}">Modifica</button>
                        <button class="btn btn-delete" data-id="${supplier.id}">Elimina</button>
                    </div>
                    <h3>${supplier.name}</h3>
                    <p><strong>Contatto:</strong> ${supplier.contact}</p>
                    ${supplier.notes ? `<p><strong>Note:</strong> ${supplier.notes}</p>` : ''}
                `;
                supplierListContainer.appendChild(supplierCard);
            });

            document.querySelectorAll('.supplier-card .btn-edit').forEach(button => {
                button.addEventListener('click', (e) => {
                    const supplierId = e.target.dataset.id;
                    populateSupplierFormForEdit(supplierId);
                });
            });

            document.querySelectorAll('.supplier-card .btn-delete').forEach(button => {
                button.addEventListener('click', (e) => {
                    const supplierId = e.target.dataset.id;
                    deleteSupplier(supplierId);
                });
            });
        }
    }
    
    addSupplierBtn.addEventListener('click', () => {
        supplierFormTitle.textContent = 'Aggiungi Fornitore';
        supplierIdInput.value = '';
        supplierForm.reset();
        supplierFormContainer.style.display = 'block';
    });

    cancelSupplierBtn.addEventListener('click', () => {
        supplierFormContainer.style.display = 'none';
    });
    
    supplierForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = supplierIdInput.value || Date.now().toString();
        const name = supplierNameInput.value;
        const contact = supplierContactInput.value;
        const notes = supplierNotesInput.value;

        const existingSupplierIndex = suppliers.findIndex(s => s.id === id);

        if (existingSupplierIndex > -1) {
            suppliers[existingSupplierIndex] = { id, name, contact, notes };
        } else {
            suppliers.push({ id, name, contact, notes });
        }
        
        saveToLocalStorage('suppliers', suppliers);
        renderSuppliers();
        populateSupplierSelect();
        supplierFormContainer.style.display = 'none';
    });
    
    function populateSupplierFormForEdit(id) {
        const supplierToEdit = suppliers.find(s => s.id === id);
        if (supplierToEdit) {
            supplierFormTitle.textContent = 'Modifica Fornitore';
            supplierIdInput.value = supplierToEdit.id;
            supplierNameInput.value = supplierToEdit.name;
            supplierContactInput.value = supplierToEdit.contact;
            supplierNotesInput.value = supplierToEdit.notes;
            supplierFormContainer.style.display = 'block';
        }
    }

    function deleteSupplier(id) {
        if (confirm('Sei sicuro di voler eliminare questo fornitore?')) {
            suppliers = suppliers.filter(s => s.id !== id);
            saveToLocalStorage('suppliers', suppliers);
            renderSuppliers();
            populateSupplierSelect();
        }
    }


    // Funzione per generare i report
    function renderReports() {
        // Preparazione dei dati per il grafico di stato
        const statusCounts = database.reduce((acc, item) => {
            acc[item.status] = (acc[item.status] || 0) + 1;
            return acc;
        }, {});

        const statusLabels = Object.keys(statusCounts);
        const statusData = Object.values(statusCounts);
        const statusColors = statusLabels.map(status => {
            switch (status) {
                case 'Disponibile': return '#28a745';
                case 'In Uso': return '#ffc107';
                case 'In Manutenzione': return '#17a2b8';
                case 'Non Funzionante': return '#dc3545';
                default: return '#6c757d';
            }
        });

        // Disegna il grafico dello stato
        const statusCtx = document.getElementById('statusChart').getContext('2d');
        if (statusChartInstance) {
            statusChartInstance.destroy();
        }
        statusChartInstance = new Chart(statusCtx, {
            type: 'pie',
            data: {
                labels: statusLabels,
                datasets: [{
                    data: statusData,
                    backgroundColor: statusColors,
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Distribuzione Articoli per Stato'
                    }
                }
            }
        });

        // Preparazione dei dati per il grafico di categoria
        const categoryCounts = database.reduce((acc, item) => {
            acc[item.category] = (acc[item.category] || 0) + 1;
            return acc;
        }, {});

        const categoryLabels = Object.keys(categoryCounts);
        const categoryData = Object.values(categoryCounts);
        const categoryColors = [
            '#007bff', '#6610f2', '#6f42c1', '#e83e8c', '#dc3545',
            '#fd7e14', '#ffc107', '#28a745', '#20c997', '#17a2b8'
        ];

        // Disegna il grafico delle categorie
        const categoryCtx = document.getElementById('categoryChart').getContext('2d');
        if (categoryChartInstance) {
            categoryChartInstance.destroy();
        }
        categoryChartInstance = new Chart(categoryCtx, {
            type: 'doughnut',
            data: {
                labels: categoryLabels,
                datasets: [{
                    data: categoryData,
                    backgroundColor: categoryColors.slice(0, categoryLabels.length),
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Distribuzione Articoli per Categoria'
                    }
                }
            }
        });
        
        customReportOutput.style.display = 'none';
    }

    customReportForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const startDate = reportStartDate.value;
        const endDate = reportEndDate.value;
        const status = reportStatus.value;
        const category = reportCategory.value;

        const filteredItems = database.filter(item => {
            const itemDate = new Date(item.dateAdded); // Assumiamo che ci sia una data di aggiunta, altrimenti si può filtrare per altre proprietà.
            const matchesDate = (!startDate || new Date(startDate) <= itemDate) && (!endDate || new Date(endDate) >= itemDate);
            const matchesStatus = status === 'all' || item.status === status;
            const matchesCategory = category === 'all' || item.category === category;
            
            return matchesDate && matchesStatus && matchesCategory;
        });

        renderCustomReport(filteredItems);
    });

    function renderCustomReport(items) {
        reportList.innerHTML = '';
        customReportOutput.style.display = 'block';
        
        reportSummary.textContent = `Risultati: ${items.length} articoli trovati.`;

        if (items.length > 0) {
            items.forEach(item => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'report-item';
                itemDiv.innerHTML = `
                    <h4>${item.name}</h4>
                    <p>Seriale: ${item.serial}</p>
                    <p>Categoria: ${item.category}</p>
                    <p>Stato: ${item.status}</p>
                    <p>Posizione: ${item.location}</p>
                `;
                reportList.appendChild(itemDiv);
            });
        } else {
            reportList.innerHTML = '<p>Nessun articolo trovato con i filtri selezionati.</p>';
        }
    }
    
    exportCustomReportCsvBtn.addEventListener('click', () => {
        const items = Array.from(reportList.querySelectorAll('.report-item')).map(itemDiv => {
            return {
                name: itemDiv.querySelector('h4').textContent,
                serial: itemDiv.querySelector('p:nth-of-type(1)').textContent.replace('Seriale: ', ''),
                category: itemDiv.querySelector('p:nth-of-type(2)').textContent.replace('Categoria: ', ''),
                status: itemDiv.querySelector('p:nth-of-type(3)').textContent.replace('Stato: ', ''),
                location: itemDiv.querySelector('p:nth-of-type(4)').textContent.replace('Posizione: ', '')
            };
        });
        exportDataToCsv(items, 'report_personalizzato.csv');
    });

    function exportDataToCsv(data, filename) {
        if (data.length === 0) {
            alert('Non ci sono dati da esportare!');
            return;
        }
    
        const headers = Object.keys(data[0]).join(',');
        
        const rows = data.map(item => {
            const values = Object.values(item).map(value => {
                const sanitizedValue = ('' + value).replace(/"/g, '""');
                return `"${sanitizedValue}"`;
            });
            return values.join(',');
        });
        
        const csvContent = [headers, ...rows].join('\n');
    
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        alert(`Dati esportati in ${filename}!`);
    }

    loanForm.addEventListener('submit', (e) => {
        e.preventDefault();
        recordLoan();
    });

    cancelLoanBtn.addEventListener('click', () => {
        showSection('inventory');
    });

    itemForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const file = imageInput.files[0];
        const attachmentFile = attachmentInput.files[0];

        // Controllo se il numero seriale esiste già
        const newSerial = document.getElementById('item-serial').value;
        const existingItem = database.find(item => item.serial === newSerial);
        if (existingItem) {
            alert('Errore: un articolo con questo numero seriale esiste già.');
            return;
        }

        let newItem = {
            name: document.getElementById('item-name').value,
            serial: newSerial,
            category: document.getElementById('item-category').value,
            status: document.getElementById('item-status').value,
            location: document.getElementById('item-location').value,
            notes: document.getElementById('item-notes').value,
            image: '',
            attachment: { name: '', data: '' },
            maintenance: []
        };

        const imagePromise = new Promise(resolve => {
            if (file) {
                const reader = new FileReader();
                reader.onload = e => resolve(e.target.result);
                reader.readAsDataURL(file);
            } else {
                resolve('');
            }
        });

        const attachmentPromise = new Promise(resolve => {
            if (attachmentFile) {
                const reader = new FileReader();
                reader.onload = e => resolve({ name: attachmentFile.name, data: e.target.result });
                reader.readAsDataURL(attachmentFile);
            } else {
                resolve({ name: '', data: '' });
            }
        });

        Promise.all([imagePromise, attachmentPromise]).then(results => {
            newItem.image = results[0];
            newItem.attachment = results[1];
            database.push(newItem);
            saveToLocalStorage('inventoryItems', database);
            itemForm.reset();
            imagePreview.style.display = 'none';
            attachmentNameSpan.style.display = 'none';
            showSection('inventory');
            alert(`Articolo "${newItem.name}" aggiunto con successo!`);
        });
    });
    
    // Assegnazione dei listener una volta che il DOM è pronto
    searchInput.addEventListener('input', filterAndSearchItems);
    statusFilter.addEventListener('change', filterAndSearchItems);
    
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
          e.preventDefault();
          const sectionId = e.target.getAttribute('data-section');
          const filterStatus = e.target.getAttribute('data-filter-status');
          
          if (userRole === 'guest' && (sectionId === 'add-item' || sectionId === 'suppliers')) {
              alert('Non hai i permessi per accedere a questa funzione.');
              return;
          }
    
          if (sectionId) {
              showSection(sectionId);
          } else if (filterStatus) {
              statusFilter.value = filterStatus;
              searchInput.value = '';
              showSection('inventory');
          }
      });
    });

    // Aggiunta listener per i quick links nella dashboard
    quickLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const sectionId = e.target.getAttribute('data-section');
            const filterStatus = e.target.getAttribute('data-filter-status');

            if (sectionId === 'add-item' && userRole === 'guest') {
                alert('Non hai i permessi per accedere a questa funzione.');
                return;
            }

            if (sectionId) {
                if (filterStatus) {
                    statusFilter.value = filterStatus;
                    searchInput.value = '';
                }
                showSection(sectionId);
            }
        });
    });


    // Funzione per l'esportazione CSV
    function exportToCsv() {
        if (database.length === 0) {
            alert('Non ci sono dati da esportare!');
            return;
        }

        const headers = Object.keys(database[0]).filter(key => key !== 'image' && key !== 'attachment' && key !== 'loan' && key !== 'maintenance').join(',');
        
        const rows = database.map(item => {
            const values = Object.keys(item).filter(key => key !== 'image' && key !== 'attachment' && key !== 'loan' && key !== 'maintenance').map(key => {
                const value = item[key];
                const sanitizedValue = ('' + value).replace(/"/g, '""');
                return `"${sanitizedValue}"`;
            });
            return values.join(',');
        });
        
        const csvContent = [headers, ...rows].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'inventario.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        alert('Dati esportati in inventario.csv!');
    }

    document.getElementById('export-csv-btn').addEventListener('click', () => {
        if (userRole === 'admin') {
            exportToCsv();
        } else {
            alert('Non hai i permessi per esportare i dati.');
        }
    });

    updateDashboardStats();
    checkMaintenanceAlerts();
    populateSupplierSelect();
});
// ==========================
// LOGICA SEZIONE PRESTITI
// ==========================

function renderLoanList() {
    const loanListContainer = document.getElementById('loan-list');
    loanListContainer.innerHTML = '';

    const loans = JSON.parse(localStorage.getItem('loans')) || [];

    if (loans.length === 0) {
        const noLoansMessage = document.createElement('p');
        noLoansMessage.className = 'no-loans-message';
        noLoansMessage.textContent = 'Nessun prestito attivo.';
        loanListContainer.appendChild(noLoansMessage);
        return;
    }

    loans.forEach((loan, index) => {
        const card = document.createElement('div');
        card.className = 'loan-card';

        card.innerHTML = `
            <h3>${loan.bookTitle}</h3>
            <p><strong>Autore:</strong> ${loan.bookAuthor}</p>
            <p><strong>Utente:</strong> ${loan.userName}</p>
            <button class="btn-return">Restituisci</button>
        `;

        const returnBtn = card.querySelector('.btn-return');
        returnBtn.addEventListener('click', () => {
            loans.splice(index, 1);
            localStorage.setItem('loans', JSON.stringify(loans));
            renderLoanList();
        });

        loanListContainer.appendChild(card);
    });
}

// Esegui il rendering all'avvio
renderLoanList();
