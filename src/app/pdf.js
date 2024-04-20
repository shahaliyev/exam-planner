function createPdfDocument(roomData, roomName) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFontSize(10);
    const roomDetails = `${roomName} | ${roomData.capacity} | ${roomData.proctor}`;
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


function preparePDFData(roomData, roomName) {
    return createPdfDocument(roomData, roomName);
}

async function createPDFBlob(roomData, roomName) {
    const doc = createPdfDocument(roomData, roomName);
    const pdfBlob = doc.output('blob');
    return pdfBlob;
}
