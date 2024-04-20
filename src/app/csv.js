function createCSVContent(roomData, roomName) {
    let csvContent = `${roomName}, ${roomData.capacity}, ${roomData.proctor}\nFull Name, ID, CRN, Signature\n`;
    roomData.students.forEach(student => {
        csvContent += `${student['Full Name']}, ${student['ID']}, ${student['CRN']}\n`;
    });
    return csvContent;
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
