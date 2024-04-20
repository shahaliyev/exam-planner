// For Future Instructions.pdf
// var instructionsPdfBlob = null; 

// document.getElementById('instructionsInput').addEventListener('change', function(event) {
//     const file = event.target.files[0];
//     if (file.type === "application/pdf") {
//         instructionsPdfBlob = file;
//         const instructionsLabel = document.querySelector('label[for="instructionsInput"]');
//         instructionsLabel.classList.add('uploaded');
//     }
// });


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


function generateDefaultRooms(){
    return [
        { Room: 'B101', Capacity: '15', Proctor: 'Proctor1' },
        { Room: 'B102', Capacity: '15', Proctor: 'Proctor2' },
        { Room: 'B201', Capacity: '16', Proctor: 'Proctor3' },
        { Room: 'B203', Capacity: '40', Proctor: 'Proctor4, Proctor5' },
    ];
}


function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}


function countDomElements(selector) {
    return document.querySelectorAll(selector).length;
}

function sumDomElementsTextContent(selector) {
    return Array.from(document.querySelectorAll(selector))
        .reduce((acc, elem) => acc + (parseInt(elem.textContent, 10) || 0), 0);
}

