
function displayStats() {
    const totalStudents = calculateTotalStudents();
    const totalCapacity = calculateTotalRoomCapacity();
    const assignedStudents = calculateAssignedStudentsCount();

    const statsArea = document.getElementById('statsArea');
    let message = `Total Students: ${totalStudents}, Total Room Capacity: ${totalCapacity}, Assigned Students: ${assignedStudents}`;

    if (totalStudents > totalCapacity) {
        message += "<div class='error-message'>Not all students can be accommodated!</div>";
    } else if (totalStudents < totalCapacity) {
        message += "<div class='warning-message'>There are still available seats!</div>";
    } else {
        message += "<div class='success-message'>All students are perfectly accommodated!</div>";
    }

    statsArea.innerHTML = message;
}


function calculateTotalStudents() {
    return countDomElements('#studentsTable tbody tr');
}

function calculateTotalRoomCapacity() {
    return sumDomElementsTextContent('#roomsTable td:nth-child(2)');
}

function calculateAssignedStudentsCount() {
    return countDomElements('.room-container table tbody tr');
}

function recalculateAssignedStudentsCount() {
    const assignedStudentsCount = calculateAssignedStudentsCount();
    const assignedStudentsCountElement = document.getElementById('assignedStudentsCount');
    if (assignedStudentsCountElement) {
        assignedStudentsCountElement.textContent = assignedStudentsCount;
    }
}