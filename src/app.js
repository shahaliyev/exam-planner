document.addEventListener('DOMContentLoaded', function () {
    let rooms = [
        { Room: 'B101', Capacity: '15', Proctor: 'Proctor1' },
        { Room: 'B102', Capacity: '15', Proctor: 'Proctor2' },
        { Room: 'B201', Capacity: '16', Proctor: 'Proctor3' },
        { Room: 'B203', Capacity: '40', Proctor: 'Proctor4, Proctor5' },
    ];

    let students = generateDefaultStudents(); // Generates default students
    initializeRoomAssignments(rooms); // Initializes room assignments

    // Display initial state
    displayCSV(rooms, 'roomsTable', 'Rooms Data');
    displayCSV(students, 'studentsTable', 'Students Data');
    processAssignments();

    // File input for students
    document.getElementById('studentsInput').addEventListener('change', function(event) {
        const file = event.target.files[0];
        Papa.parse(file, {
            header: true,
            complete: function(results) {
                students = results.data;
                displayCSV(students, 'studentsTable', 'Students Data');
                processAssignments();
            }
        });
    });

    document.getElementById('roomsInput').addEventListener('change', function(event) {
        const file = event.target.files[0];
        Papa.parse(file, {
            header: true,
            complete: function(results) {
                rooms = results.data;
                initializeRoomAssignments(rooms); // Initializes room assignments
                students = []; // Clear existing students data
                displayCSV(rooms, 'roomsTable', 'Rooms Data');
                processAssignments(); // This will now only update the room display since there are no students yet
            }
        });
    });
    

    function processAssignments() {
        if (rooms.length > 0 && students.length > 0) {
            assignStudentsToRooms();
            displayRoomAssignments(roomAssignments);
        } else {
            console.log("Waiting for both rooms and students data to be loaded.");
        }
    }
    

    function initializeRoomAssignments(rooms) {
        roomAssignments = {};
        rooms.forEach(room => {
            roomAssignments[room.Room] = { capacity: parseInt(room.Capacity, 10), students: [], proctor: room.Proctor };
        });
    }

    function reinitializeAndProcessAssignments() {
        initializeRoomAssignments(rooms);
        if (students.length > 0) {
            processAssignments();
        } else {
            console.log("Student data not loaded or empty.");
        }
    }
    
    document.getElementById('roomsInput').addEventListener('change', function(event) {
        const file = event.target.files[0];
        Papa.parse(file, {
            header: true,
            complete: function(results) {
                rooms = results.data;
                reinitializeAndProcessAssignments();
                displayCSV(rooms, 'roomsTable', 'Rooms Data');
            }
        });
    });
    
    document.getElementById('studentsInput').addEventListener('change', function(event) {
        const file = event.target.files[0];
        Papa.parse(file, {
            header: true,
            complete: function(results) {
                students = results.data;
                reinitializeAndProcessAssignments();
                displayCSV(students, 'studentsTable', 'Students Data');
            }
        });
    });
    

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

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function createPdfDownloadLink(roomData, roomName) {
        const link = document.createElement('button');
        link.textContent = `Download ${roomName} PDF`;
        link.onclick = function () {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
    
            // Text details
            doc.setFontSize(10); // Set font size for the document
            let roomDetails = `${roomName} | ${roomData.capacity} | ${roomData.proctor}`;
            doc.text(roomDetails, 15, 10);  // Print the combined details on one line
    
            // Define the columns and their titles including a Signature column
            const columns = [
                { header: 'First Name', dataKey: 'FirstName' },
                { header: 'Last Name', dataKey: 'LastName' },
                { header: 'ID', dataKey: 'ID' },
                { header: 'CRN', dataKey: 'CRN' },
                { header: 'Signature', dataKey: 'Signature' } // Empty data for signatures
            ];
    
            // Map student data for AutoTable
            const tableData = roomData.students.map(student => ({
                FirstName: student['First Name'],
                LastName: student['Last Name'],
                ID: student['ID'],
                CRN: student['CRN'],
                Signature: '' // Placeholder for the signature column
            }));
    
            // Draw table with styles for the header
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
                    Signature: { cellWidth: 30 }, // Custom width for signature column
                }
            });
    
            doc.save(`assignments_${roomName}.pdf`);
        };
    
        return link;
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
            const downloadCsvLink = createRoomDownloadLink(roomData, room);
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
    

    function createRoomDownloadLink(roomData, roomName) {
        // Room details as the first descriptive row
        let roomDetails = [
            `${roomName}, ${roomData.capacity}, ${roomData.proctor}`
        ];
    
        // Prepare CSV content manually
        let csvContent = roomDetails.join(", ") + "\n";
        csvContent += "FirstName, LastName, ID, CRN, Signature\n"; // Column headers
    
        // Add student data to the CSV content
        roomData.students.forEach(student => {
            csvContent += `${student['First Name']}, ${student['Last Name']}, ${student['ID']}, ${student['CRN']}\n`;
        });
    
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
    
        const a = document.createElement('a');
        a.href = url;
        a.download = `exam_roster_${roomName}.csv`;
        a.textContent = 'Download ' + roomName + ' Roster';
        a.className = 'download-link';
        a.style.margin = '10px';
        a.style.display = 'inline-block';
    
        // Cleanup URL when the element is removed or replaced
        a.addEventListener('click', () => {
            setTimeout(() => URL.revokeObjectURL(url), 100);
        });
    
        return a;
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

    

    // Event listener for Download All as ZIP, including PDFs
    document.querySelector('#downloadAllButton').addEventListener('click', function() {
        var zip = new JSZip(); // Create a new instance of JSZip
        let pdfPromises = [];

        // Loop through each room assignment and add CSV and PDF to ZIP
        Object.keys(roomAssignments).forEach(room => {
            let csvContent = `Room: ${room}, Capacity: ${roomAssignments[room].capacity}, Proctor: ${roomAssignments[room].proctor}\n`;
            csvContent += "Room, FirstName, LastName, ID, CRN, Proctor\n";

            roomAssignments[room].students.forEach(student => {
                csvContent += `${room}, ${student['First Name']}, ${student['Last Name']}, ${student['ID']}, ${student['CRN']}, ${roomAssignments[room].proctor}\n`;
            });

            zip.file(`assignments_${room}.csv`, csvContent);

            // Create PDF and add to ZIP
            let pdfPromise = createPDFBlob(roomAssignments[room], room).then(blob => {
                zip.file(`assignments_${room}.pdf`, blob);
            });

            pdfPromises.push(pdfPromise);
        });

        // Generate the ZIP file after all PDFs have been created and added
        Promise.all(pdfPromises).then(() => {
            zip.generateAsync({type:"blob"}).then(function(content) {
                saveAs(content, "all_room_assignments.zip");
            });
        });
    });

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
    
});