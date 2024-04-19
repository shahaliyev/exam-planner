document.addEventListener('DOMContentLoaded', function () {
    let students = [];
    let rooms = [];
    let roomAssignments = {};

    document.getElementById('studentsInput').addEventListener('change', function(event) {
        const file = event.target.files[0];
        Papa.parse(file, {
            header: true,
            complete: function(results) {
                students = results.data;
                displayCSV(results.data, 'studentsTable', 'Students Data');
            }
        });
    });

    document.getElementById('roomsInput').addEventListener('change', function(event) {
        const file = event.target.files[0];
        Papa.parse(file, {
            header: true,
            complete: function(results) {
                rooms = results.data;
                rooms.forEach(room => {
                    roomAssignments[room.Room] = { capacity: parseInt(room.Capacity, 10), students: [], proctor: room.Proctor };
                });
                displayCSV(results.data, 'roomsTable', 'Rooms Data');
            }
        });
    });

    document.querySelector('button').addEventListener('click', processFiles);

    function processFiles() {
        if (students.length === 0 || rooms.length === 0) {
            alert("Please make sure both files are loaded.");
            return;
        }

        students.forEach(student => {
            const assignedRoom = Object.keys(roomAssignments).find(room => roomAssignments[room].students.length < roomAssignments[room].capacity);
            if (assignedRoom) {
                roomAssignments[assignedRoom].students.push(student);
            } else {
                console.log(`No available room for ${student['First Name']} ${student['Last Name']}`);
            }
        });

        displayRoomAssignments(roomAssignments);
        createDownloadLink(roomAssignments);
    }


    function displayRoomAssignments(roomAssignments) {
        const container = document.getElementById('assignmentResults');
        container.innerHTML = ''; // Clear previous results
    
        Object.keys(roomAssignments).forEach(room => {
            const roomData = roomAssignments[room];
            const students = roomData.students;
    
            // Create a container for each room's table and download link
            const roomContainer = document.createElement('div');
            roomContainer.className = 'room-container';
            roomContainer.style.marginBottom = '20px';  // Ensure space between room sections
    
            // Create and append the download link for the room at the top
            const downloadLink = createRoomDownloadLink(roomData, room);
            roomContainer.appendChild(downloadLink);
    
            // Create and append the table for the room
            let tableHtml = `<h2>${room} - Proctor: ${roomData.proctor}</h2>
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
    
            // Append the table HTML to the room container
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
        csvContent += "Room, FirstName, LastName, ID, CRN\n"; // Column headers
    
        // Add student data to the CSV content
        roomData.students.forEach(student => {
            csvContent += `${roomName}, ${student['First Name']}, ${student['Last Name']}, ${student['ID']}, ${student['CRN']}\n`;
        });
    
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
    
        const a = document.createElement('a');
        a.href = url;
        a.download = `assignments_${roomName}.csv`;
        a.textContent = 'Download ' + roomName + ' Assignments';
        a.className = 'download-link';
        a.style.marginTop = '10px';
        a.style.display = 'block';
    
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

    document.querySelector('#downloadAllButton').addEventListener('click', function() {
        var zip = new JSZip(); // Create a new instance of JSZip
    
        // Loop through each room assignment and add it to the ZIP file
        Object.keys(roomAssignments).forEach(room => {
            let csvContent = `Room: ${room}, Capacity: ${roomAssignments[room].capacity}, Proctor: ${roomAssignments[room].proctor}\n`;
            csvContent += "Room, FirstName, LastName, ID, CRN, Proctor\n"; // headers
    
            roomAssignments[room].students.forEach(student => {
                csvContent += `${room}, ${student['First Name']}, ${student['Last Name']}, ${student['ID']}, ${student['CRN']}, ${roomAssignments[room].proctor}\n`;
            });
    
            zip.file(`assignments_${room}.csv`, csvContent);
        });
    
        // Generate the ZIP file and trigger the download
        zip.generateAsync({type:"blob"}).then(function(content) {
            saveAs(content, "all_room_assignments.zip");
        });
    });
    
});
