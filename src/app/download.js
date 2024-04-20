function downloadSourceFile(){
    var zip = new JSZip();
    
    filePaths = [
        '/src/index.html',
        '/src/css/style.css',
        '/src/css/input.css',
        '/src/css/table.css',
        '/src/css/stats.css',
        '/src/app/helper.js',
        '/src/app/app.js',
        '/src/app/csv.js',
        '/src/app/pdf.js',
        '/src/app/download.js',
        '/src/app/stats.js',
    ]

    async function fetchAndAddFile(filePath) {
        return fetch(filePath)
            .then(response => response.text())
            .then(content => {
                zip.file(filePath, content);
            });
    }

    var fetchPromises = filePaths.map(fetchAndAddFile);

    Promise.all(fetchPromises)
        .then(() => {
            // Generate the zip file
            return zip.generateAsync({ type: "blob" });
        })
        .then(function(content) {
            // Trigger the download
            saveAs(content, "exam-planner.zip");
        });
}


async function downloadAll() {
    const zip = new JSZip();
    const pdfPromises = Object.keys(roomAssignments).map(async room => {
        const csvContent = createCSVContent(roomAssignments[room], room);
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

function createPdfDownloadLink(roomData, roomName) {
    const doc = preparePDFData(roomData, roomName);
    return createDownloadLink(`exam_roster_${roomName}.pdf`, doc.output(), 'application/pdf', `Download ${roomName} Roster .pdf`);
}

function createCsvDownloadLink(roomData, roomName) {
    let csvContent = createCSVContent(roomData, roomName)
    return createDownloadLink(`exam_roster_${roomName}.csv`, csvContent, 'text/csv;charset=utf-8;', `Download ${roomName} Roster .csv`);
}