document.addEventListener('DOMContentLoaded', function () {
    let rooms = generateDefaultRooms();
    let students = generateDefaultStudents();

    displayCSV(rooms, 'roomsTable', 'Rooms Data');
    displayCSV(students, 'studentsTable', 'Students Data');

    processAssignments();


    document.getElementById('studentsInput').addEventListener('change', (event) => handleFileInput(event, 'students'));
    document.getElementById('roomsInput').addEventListener('change', (event) => handleFileInput(event, 'rooms'));
    document.querySelector('#downloadAllButton').addEventListener('click', downloadAll);
    document.getElementById('downloadSrc').addEventListener('click', downloadSourceFile);


    function processAssignments() {
        roomAssignments = {};
        rooms.forEach(room => {
            roomAssignments[room.Room] = { capacity: parseInt(room.Capacity, 10), students: [], proctor: room.Proctor };
        });
        if (rooms.length > 0 && students.length > 0) {
            assignStudentsToRooms();
            displayRoomAssignments(roomAssignments);
            displayStats();
        } else {
            console.log("Waiting for both rooms and students data to be loaded.");
        }
    }
    

    function assignStudentsToRooms() {
        shuffleArray(students);
        students.forEach(student => {
            let availableRooms = Object.keys(roomAssignments).filter(room => roomAssignments[room].students.length < roomAssignments[room].capacity);
            if (availableRooms.length > 0) {
                let randomRoom = availableRooms[Math.floor(Math.random() * availableRooms.length)];
                roomAssignments[randomRoom].students.push(student);
            } else {
                console.log(`No available room for ${student['Student Name']} (${student['ID']})`);
            }
        });
    }

    
    function displayRoomAssignments(roomAssignments) {
        const container = document.getElementById('assignmentResults');
        container.innerHTML = ''; 
    
        Object.keys(roomAssignments).forEach(room => {
            const roomData = roomAssignments[room];
            const students = roomData.students;
    
            // Create a container for each room's table and download links
            const roomContainer = document.createElement('div');
            roomContainer.className = 'room-container';
            roomContainer.style.marginBottom = '20px';

            const downloadCsvLink = createCsvDownloadLink(roomData, room);
            const downloadPdfLink = createPdfDownloadLink(roomData, room);
    
            roomContainer.appendChild(downloadCsvLink);
            roomContainer.appendChild(downloadPdfLink);
    
            let tableHtml = `<h2>${room} (${students.length}/${roomData.capacity}) ${roomData.proctor} </h2>
                             <table border="1">
                             <thead>
                                 <tr>
                                     <th>Student Name</th>
                                     <th>ID</th>
                                     <th>CRN</th>
                                 </tr>
                             </thead>
                             <tbody>`;
            students.forEach(student => {
                tableHtml += `<tr>
                                  <td>${student['Student Name']}</td>
                                  <td>${student['ID']}</td>
                                  <td>${student['CRN']}</td>
                              </tr>`;
            });
            tableHtml += `</tbody></table>`;
    
            const tableElement = document.createElement('div');
            tableElement.innerHTML = tableHtml;
            roomContainer.appendChild(tableElement);

            container.appendChild(roomContainer);
        });
    }


    function handleFileInput(event, entity) {
        const file = event.target.files[0];
        if (!file) return;
        
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: function(results) {
                const headers = results.meta.fields;
                const expectedHeaders = entity === 'students' ? ['Student Name', 'ID', 'CRN'] : ['Room', 'Capacity', 'Proctor'];
    
                const isHeaderCorrect = expectedHeaders.every(header => headers.includes(header));
    
                if (!isHeaderCorrect) {
                    alert(`The uploaded file for ${entity} does not contain the correct headers. Expected headers: ${expectedHeaders.join(', ')}`);
                    event.target.value = '';
                    return;
                }
    
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
                event.target.value = '';
            }
        });
    }
    

});