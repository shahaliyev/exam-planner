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


function createPDFBlob(roomData, roomName) {
    const doc = createPdfDocument(roomData, roomName);
    const pdfBlob = doc.output('blob');
    return pdfBlob;
}


async function mergePDFs(jsPDFBlob, uploadedPDFFile) {
    const blobToArrayBuffer = (blob) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (reader.result) {
                    resolve(reader.result);
                } else {
                    reject(new Error('Failed to read the Blob as ArrayBuffer'));
                }
            };
            reader.onerror = reject;
            reader.readAsArrayBuffer(blob);
        });
    };

    try {
        const jsPDFArrayBuffer = await blobToArrayBuffer(jsPDFBlob);
        const uploadedPDFArrayBuffer = await blobToArrayBuffer(uploadedPDFFile);

        const pdfDoc1 = await PDFLib.PDFDocument.load(jsPDFArrayBuffer);
        const pdfDoc2 = await PDFLib.PDFDocument.load(uploadedPDFArrayBuffer);

        // Create a new PDF document
        const mergedPdfDoc = await PDFLib.PDFDocument.create();

        // Copy all pages from the first and second documents to the new document
        const copiedPages1 = await mergedPdfDoc.copyPages(pdfDoc1, pdfDoc1.getPageIndices());
        copiedPages1.forEach(page => mergedPdfDoc.addPage(page));

        const copiedPages2 = await mergedPdfDoc.copyPages(pdfDoc2, pdfDoc2.getPageIndices());
        copiedPages2.forEach(page => mergedPdfDoc.addPage(page));

        // Save the merged PDF as a new Blob
        const mergedPdfBytes = await mergedPdfDoc.save();
        const mergedPdfBlob = new Blob([mergedPdfBytes], { type: "application/pdf" });

        return mergedPdfBlob;
    } catch (error) {
        console.error("Error during PDF merge: ", error);
    }
}