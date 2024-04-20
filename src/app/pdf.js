function createPdfDocument(roomData, roomName) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold'); // Set font to bold

    // Format the room details in bold
    const roomDetails = `${roomName} | Capacity: ${roomData.capacity} | Proctor: ${roomData.proctor}`;
    doc.text(roomDetails, 15, 10);

    // Reset font style to normal for the table content
    doc.setFont('helvetica', 'normal');

    const columns = [
        { header: 'Full Name', dataKey: 'FullName' },
        { header: 'ID', dataKey: 'ID' },
        { header: 'CRN', dataKey: 'CRN' },
        { header: 'Signature', dataKey: 'Signature' }
    ];

    const tableData = roomData.students.map(student => ({
        FullName: student['Full Name'], 
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
