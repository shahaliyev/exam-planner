document.addEventListener('DOMContentLoaded', function () {
    let rooms = [
        { Room: 'B101', Capacity: '15', Proctor: 'Proctor1' },
        { Room: 'B102', Capacity: '15', Proctor: 'Proctor2' },
        { Room: 'B201', Capacity: '16', Proctor: 'Proctor3' },
        { Room: 'B203', Capacity: '40', Proctor: 'Proctor4, Proctor5' },
    ];

    let students = generateDefaultStudents();
    initializeRoomAssignments(rooms); 

    displayCSV(rooms, 'roomsTable', 'Rooms Data');
    displayCSV(students, 'studentsTable', 'Students Data');
    processAssignments();

    function handleFileInput(event, entity) {
        const file = event.target.files[0];
        Papa.parse(file, {
            header: true,
            complete: function(results) {
                if (entity === 'students') {
                    students = results.data;
                } else if (entity === 'rooms') {
                    rooms = results.data;
                }
                displayCSV(entity === 'students' ? students : rooms, entity + 'Table', `${entity.charAt(0).toUpperCase() + entity.slice(1)} Data`);
                processAssignments(); 
                recalculateAssignedStudentsCount();
                const label = document.querySelector(`label[for="${entity}Input"]`);
                label.classList.add('uploaded');
            }
        });
    }

    function displayCSV(data, elementId, title) {
        let content = `<h2>${title}</h2>`;
        let table = '<table border="1"><thead><tr>';
        if (data.length > 0) {
            Object.keys(data[0]).forEach(key => {
                table += `<th>${key}</th>`;
            });
            table += '</tr></thead><tbody>';
            data.forEach(row => {
                table += '<tr>';
                Object.values(row).forEach(val => {
                    table += `<td>${val}</td>`;
                });
                table += '</tr>';
            });
            table += '</tbody></table>';
            content += table;
        } else {
            content += '<p>No data available to display.</p>';
        }
        document.getElementById(elementId).innerHTML = content;
    }

    
    document.getElementById('studentsInput').addEventListener('change', (event) => handleFileInput(event, 'students'));
    document.getElementById('roomsInput').addEventListener('change', (event) => handleFileInput(event, 'rooms'));
    document.querySelector('#downloadAllButton').addEventListener('click', downloadAllAssignments);

    
    function processAssignments() {
        initializeRoomAssignments();
        if (rooms.length > 0 && students.length > 0) {
            assignStudentsToRooms();
            displayRoomAssignments(roomAssignments);
            displayNotifications();
        } else {
            console.log("Waiting for both rooms and students data to be loaded.");
        }
    }
    
    function initializeRoomAssignments() {
        roomAssignments = {};
        rooms.forEach(room => {
            roomAssignments[room.Room] = { capacity: parseInt(room.Capacity, 10), students: [], proctor: room.Proctor };
        });
    }

    function generateDefaultStudents() {
        let defaultStudents = [];
        const crns = [20415, 20416, 20417];
        for (let i = 1; i <= 86; i++) {
            defaultStudents.push({
                'First Name': `FirstName${i}`,
                'Last Name': `LastName${i}`,
                'ID': `StudentID${i}`,
                'CRN': crns[i % crns.length]
            });
        }
        return defaultStudents;
    }
    
    

    function assignStudentsToRooms() {
        shuffleArray(students);
        students.forEach(student => {
            let availableRooms = Object.keys(roomAssignments).filter(room => roomAssignments[room].students.length < roomAssignments[room].capacity);
            if (availableRooms.length > 0) {
                let randomRoom = availableRooms[Math.floor(Math.random() * availableRooms.length)];
                roomAssignments[randomRoom].students.push(student);
            } else {
                console.log(`No available room for ${student['First Name']} ${student['Last Name']}`);
            }
        });
    }


    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    
    function displayRoomAssignments(roomAssignments) {
        const container = document.getElementById('assignmentResults');
        container.innerHTML = ''; // Clear previous results
    
        Object.keys(roomAssignments).forEach(room => {
            const roomData = roomAssignments[room];
            const students = roomData.students;
    
            // Create a container for each room's table and download links
            const roomContainer = document.createElement('div');
            roomContainer.className = 'room-container';
            roomContainer.style.marginBottom = '20px';
    
            // Create download links for CSV and PDF
            const downloadCsvLink = createCsvDownloadLink(roomData, room);
            const downloadPdfLink = createPdfDownloadLink(roomData, room);
    
            // Append the download links
            roomContainer.appendChild(downloadCsvLink);
            roomContainer.appendChild(downloadPdfLink);
    
            // Create and append the table for the room
            let tableHtml = `<h2>${room} [${roomData.capacity}] ${roomData.proctor} </h2>
                             <table border="1">
                             <thead>
                                 <tr>
                                     <th>First Name</th>
                                     <th>Last Name</th>
                                     <th>ID</th>
                                     <th>CRN</th>
                                 </tr>
                             </thead>
                             <tbody>`;
            students.forEach(student => {
                tableHtml += `<tr>
                                  <td>${student['First Name']}</td>
                                  <td>${student['Last Name']}</td>
                                  <td>${student['ID']}</td>
                                  <td>${student['CRN']}</td>
                              </tr>`;
            });
            tableHtml += `</tbody></table>`;
    
            const tableElement = document.createElement('div');
            tableElement.innerHTML = tableHtml;
            roomContainer.appendChild(tableElement);
    
            // Append the room container to the main container
            container.appendChild(roomContainer);
        });
    }


    function createDownloadLink(filename, content, contentType, text) {
        const blob = new Blob([content], { type: contentType });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.textContent = text;
        link.className = 'download-link';
        link.style.margin = '10px';
        link.style.display = 'inline-block';

        // Cleanup URL when the element is removed or replaced
        link.addEventListener('click', () => {
            setTimeout(() => URL.revokeObjectURL(url), 100);
        });

        return link;
    }

    function preparePdfData(roomData, roomName) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        doc.setFontSize(10);
        let roomDetails = `${roomName} | ${roomData.capacity} | ${roomData.proctor}`;
        doc.text(roomDetails, 15, 10);

        const columns = [
            { header: 'First Name', dataKey: 'FirstName' },
            { header: 'Last Name', dataKey: 'LastName' },
            { header: 'ID', dataKey: 'ID' },
            { header: 'CRN', dataKey: 'CRN' },
            { header: 'Signature', dataKey: 'Signature' }
        ];

        const tableData = roomData.students.map(student => ({
            FirstName: student['First Name'],
            LastName: student['Last Name'],
            ID: student['ID'],
            CRN: student['CRN'],
            Signature: ''
        }));

        doc.autoTable(columns, tableData, {
            startY: 20,
            theme: 'grid',
            headStyles: {
                fillColor: [255, 255, 255],
                textColor: [0, 0, 0],
                fontStyle: 'bold'
            },
            styles: {
                cellPadding: 1,
                fontSize: 10,
                font: 'helvetica',
                lineColor: [0, 0, 0],
                lineWidth: 0.1,
                halign: 'left',
                valign: 'middle'
            },
            columnStyles: {
                Signature: { cellWidth: 30 }
            }
        });

        return doc;
    }

    function createPdfDownloadLink(roomData, roomName) {
        const doc = preparePdfData(roomData, roomName);
        return createDownloadLink(`exam_roster_${roomName}.pdf`, doc.output(), 'application/pdf', `Download ${roomName} Roster .pdf`);
    }

    function createCsvDownloadLink(roomData, roomName) {
        let csvContent = `${roomName}, ${roomData.capacity}, ${roomData.proctor}\nFirstName, LastName, ID, CRN, Signature\n`;
        roomData.students.forEach(student => {
            csvContent += `${student['First Name']}, ${student['Last Name']}, ${student['ID']}, ${student['CRN']}\n`;
        });
        return createDownloadLink(`exam_roster_${roomName}.csv`, csvContent, 'text/csv;charset=utf-8;', `Download ${roomName} Roster .csv`);
    }
 
    
    // Utility function to create CSV content
    function createCSVContent(room, data) {
        let csvContent = `Room: ${room}, Capacity: ${data.capacity}, Proctor: ${data.proctor}\n`;
        csvContent += "Room, FirstName, LastName, ID, CRN, Proctor\n";
        data.students.forEach(student => {
            csvContent += `${room}, ${student['First Name']}, ${student['Last Name']}, ${student['ID']}, ${student['CRN']}, ${data.proctor}\n`;
        });
        return csvContent;
    }

    // Main function to handle the ZIP creation and download
    async function downloadAllAssignments() {
        const zip = new JSZip();
        const pdfPromises = Object.keys(roomAssignments).map(async room => {
            const csvContent = createCSVContent(room, roomAssignments[room]);
            zip.file(`exam_roster_${room}.csv`, csvContent);

            const blob = await createPDFBlob(roomAssignments[room], room);
            zip.file(`exam_roster_${room}.pdf`, blob);
        });

        try {
            await Promise.all(pdfPromises);
            const content = await zip.generateAsync({type: "blob"});
            saveAs(content, "all_room_assignments.zip");
        } catch (error) {
            console.error('Error while creating ZIP:', error);
        }
    }




    function createPDFBlob(roomData, roomName) {
        return new Promise((resolve, reject) => {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
    
            let roomDetails = `${roomName} | ${roomData.capacity} | ${roomData.proctor}`;
            doc.setFontSize(10);
            doc.text(roomDetails, 15, 10);
    
            const columns = [
                { header: 'First Name', dataKey: 'FirstName' },
                { header: 'Last Name', dataKey: 'LastName' },
                { header: 'ID', dataKey: 'ID' },
                { header: 'CRN', dataKey: 'CRN' },
                { header: 'Signature', dataKey: 'Signature' }
            ];
    
            const tableData = roomData.students.map(student => ({
                FirstName: student['First Name'],
                LastName: student['Last Name'],
                ID: student['ID'],
                CRN: student['CRN'],
                Signature: '' // Placeholder for the signature column
            }));
    
            doc.autoTable(columns, tableData, {
                startY: 20,
                theme: 'grid',
                headStyles: {
                    fillColor: [255, 255, 255], // White color for header background
                    textColor: [0, 0, 0], // Black color for header text
                    fontStyle: 'bold' // Bold font style for header
                },
                styles: {
                    cellPadding: 1,
                    fontSize: 10,
                    font: 'helvetica',
                    lineColor: [0, 0, 0],
                    lineWidth: 0.1,
                    halign: 'left', // Horizontal alignment of the text
                    valign: 'middle' // Vertical alignment of the text
                },
                columnStyles: {
                    Signature: { cellWidth: 30 } // Custom width for signature column
                }
            });
    
            // Convert PDF to Blob
            const pdfBlob = doc.output('blob');
            resolve(pdfBlob);
        });
    }


    
    function displayNotifications() {
        const totalStudents = calculateTotalStudents();
        const totalCapacity = calculateTotalRoomCapacity();
        const assignedStudents = calculateAssignedStudentsCount();

        const notificationArea = document.getElementById('notificationArea');
        let message = `Total Students: ${totalStudents}, Total Room Capacity: ${totalCapacity}, Assigned Students: ${assignedStudents}`;
        if (totalStudents > totalCapacity) {
            message += "<div class='error-message'>Not all students can be accommodated!</div>";
        } else if (totalStudents < totalCapacity) {
            message += "<div class='warning-message'>There are still available seats!</div>";
        } else {
            message += "<div class='success-message'>All students are perfectly accommodated!</div>";
        }

        notificationArea.innerHTML = message;
    }

    function calculateTotalStudents() {
        // Select the students table
        const studentsTable = document.getElementById('studentsTable');
        if (!studentsTable) return 0; // Return 0 if the table is not found
    
        // Count the number of rows in the table body
        const tbody = studentsTable.querySelector('tbody');
        if (!tbody) return 0; // Return 0 if the table body is not found
    
        return tbody.querySelectorAll('tr').length;
    }
    
    function calculateTotalRoomCapacity() {
        // Select the rooms table
        const roomsTable = document.getElementById('roomsTable');
        if (!roomsTable) return 0; // Return 0 if the table is not found
    
        // Select all cells containing capacity values and sum them
        const capacityCells = roomsTable.querySelectorAll('td:nth-child(2)'); // Assuming capacity is in the second column
        let totalCapacity = 0;
        capacityCells.forEach(cell => {
            totalCapacity += parseInt(cell.textContent, 10) || 0; // Parse capacity and add to total, handle NaN with 0
        });
    
        return totalCapacity;
    }
    
    function calculateAssignedStudentsCount() {
        // Select all assigned students tables
        const assignedStudentsTables = document.querySelectorAll('.room-container table');
        let totalCount = 0;
    
        // Iterate through each assigned students table and count the number of rows
        assignedStudentsTables.forEach(table => {
            const tbody = table.querySelector('tbody');
            if (tbody) {
                totalCount += tbody.querySelectorAll('tr').length;
            }
        });
    
        return totalCount;
    }

    function recalculateAssignedStudentsCount() {
        // Call the function to calculate assigned students count
        const assignedStudentsCount = calculateAssignedStudentsCount();
    
        // Update the displayed count on the webpage
        const assignedStudentsCountElement = document.getElementById('assignedStudentsCount');
        if (assignedStudentsCountElement) {
            assignedStudentsCountElement.textContent = assignedStudentsCount;
        }
    }


    var instructionsPdfBlob = null; 

    document.getElementById('instructionsInput').addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file.type === "application/pdf") {
            instructionsPdfBlob = file;
            const instructionsLabel = document.querySelector('label[for="instructionsInput"]');
            instructionsLabel.classList.add('uploaded');
        }
    });
    
    
    
    
    document.getElementById('downloadSrc').addEventListener('click', function() {
        var zip = new JSZip();
    
        // Array to hold all fetch promises
        var fetchPromises = [];
    
        // Fetch index.html and add to zip
        fetchPromises.push(fetch('/src/index.html')
            .then(response => response.text())
            .then(content => {
                zip.file('src/index.html', content);
            }));
    
        // Fetch app.js and add to zip
        fetchPromises.push(fetch('/src/app.js')
            .then(response => response.text())
            .then(content => {
                zip.file('src/app.js', content);
            }));
    
        // Fetch styles.css and add to zip
        fetchPromises.push(fetch('/src/styles.css')
            .then(response => response.text())
            .then(content => {
                zip.file('src/styles.css', content);
            }));
    
        // Wait for all fetch promises to resolve
        Promise.all(fetchPromises)
            .then(() => {
                // Generate the zip file
                return zip.generateAsync({ type: "blob" });
            })
            .then(function(content) {
                // Trigger the download
                saveAs(content, "exam-planner.zip");
            });
    });
    

});