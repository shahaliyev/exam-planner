function createPdfDocument(roomData, roomName) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');

    const roomDetails = `${roomName} (${roomData.capacity}) ${roomData.proctor}`;
    doc.text(roomDetails, 15, 10);

    doc.setFont('helvetica', 'normal');

    const columns = [
        { header: 'Student Name', dataKey: 'StudentName' },
        { header: 'ID', dataKey: 'ID' },
        { header: 'CRN', dataKey: 'CRN' },
        { header: 'Signature', dataKey: 'Signature' }
    ];

    const tableData = roomData.students.map(student => ({
        StudentName: student['Student Name'],
        ID: student['ID'],
        CRN: student['CRN'],
        Signature: ''
    }));

    const maxWidth = Math.max(...tableData.map(s => doc.getTextWidth(s.StudentName)));
    const minWidth = 50;
    const studentNameWidth = Math.max(maxWidth, minWidth);

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
            StudentName: { cellWidth: studentNameWidth },
            Signature: { cellWidth: 50 }
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
