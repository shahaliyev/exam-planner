function downloadSourceFile(){
    var zip = new JSZip();
    
    const basePath = 'https://shahaliyev.github.io/exam-planner/';
    const filePaths = [
        'src/index.html',
        'src/css/style.css',
        'src/css/input.css',
        'src/css/table.css',
        'src/css/stats.css',
        'src/app/helper.js',
        'src/app/app.js',
        'src/app/csv.js',
        'src/app/pdf.js',
        'src/app/download.js',
        'src/app/stats.js',
        'data/students.csv',
        'data/rooms.csv',
        'data/instructions.pdf',
    ].map(path => basePath + path);

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
            return zip.generateAsync({ type: "blob" });
        })
        .then(function(content) {
            saveAs(content, "exam-planner.zip");
        });
}


async function downloadAll(instructionsFile) {
    const zip = new JSZip();
    const pdfPromises = Object.keys(roomAssignments).map(async room => {
        const csvContent = createCSVContent(roomAssignments[room], room);
        zip.file(`csv/exam_roster_${room}.csv`, csvContent);

        let blob = createPDFBlob(roomAssignments[room], room);
        if (instructionsFile) {
            blob = await mergePDFs(blob, instructionsFile)
        }
        zip.file(`pdf/exam_roster_${room}.pdf`, blob);
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

async function createPdfDownloadLink(roomData, roomName, instructionsFile) {
    let blob = createPDFBlob(roomData, roomName);
    if (instructionsFile) {
        blob = await mergePDFs(blob, instructionsFile)
    }
    return createDownloadLink(`exam_roster_${roomName}.pdf`, blob, 'application/pdf', `Download ${roomName} Roster .pdf`);
}

function createCsvDownloadLink(roomData, roomName) {
    let csvContent = createCSVContent(roomData, roomName)
    return createDownloadLink(`exam_roster_${roomName}.csv`, csvContent, 'text/csv;charset=utf-8;', `Download ${roomName} Roster .csv`);
}




