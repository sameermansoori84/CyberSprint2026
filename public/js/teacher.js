// public/js/teacher.js
let html5QrcodeScanner = null;
let currentCsId = null;

const eventInput = document.getElementById("event");
const resultDiv = document.getElementById("result");

const manualCsIdInput = document.getElementById("manualCsId");
const manualPreviewBtn = document.getElementById("manualPreviewBtn");
const markBtn = document.getElementById("markBtn");
const studentDetailsDiv = document.getElementById("studentDetails");

const dayButtons = document.querySelectorAll(".day-btn");
let currentDay = "Day 1";

dayButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    dayButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentDay = btn.getAttribute("data-day");
    showResult(`Selected ${currentDay}`, true);
  });
});

function showResult(msg, success) {
  resultDiv.textContent = msg;
  resultDiv.className = success ? "success" : "error";
}

function showStudentDetails(student) {
  studentDetailsDiv.style.display = "block";
  studentDetailsDiv.innerHTML = `
    <strong>Student Details</strong><br/>
    Name: ${student.firstName} ${student.lastName}<br/>
    CS-ID: ${student.csId}<br/>
    Event: ${student.event}<br/>
    University: ${student.university}<br/>
    College: ${student.collegeName}<br/>
    Course: ${student.course} (${student.yearOfStudy})<br/>
    Day: ${currentDay}
  `;
}

async function previewStudent(csId, event) {
  if (!csId || !event || !currentDay) {
    showResult("CS-ID, event and day are required.", false);
    return;
  }

  try {
    const res = await fetch("/api/attendance/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ csId, event, day: currentDay, preview: true }),
    });

    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      const text = await res.text();
      console.error("Non-JSON response (preview):", text);
      showResult("Server returned non-JSON response. Check backend logs.", false);
      return;
    }

    const data = await res.json();

    if (!data.success) {
      showResult(data.message || "Student preview failed.", false);
      studentDetailsDiv.style.display = "none";
      markBtn.disabled = true;
      currentCsId = null;
      return;
    }

    currentCsId = data.student.csId;
    showStudentDetails(data.student);
    markBtn.disabled = false;
    showResult(
      `Student found for ${currentDay}. Tap 'Mark Present' to record attendance.`,
      true
    );
  } catch (err) {
    console.error("Preview fetch error:", err);
    showResult("Network error: " + err.message, false);
  }
}

async function markAttendance(csId, event) {
  if (!csId || !event || !currentDay) {
    showResult("CS-ID, event and day are required.", false);
    return;
  }

  try {
    const res = await fetch("/api/attendance/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ csId, event, day: currentDay }),
    });

    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      const text = await res.text();
      console.error("Non-JSON response (mark):", text);
      showResult("Server returned non-JSON response. Check backend logs.", false);
      return;
    }

    const data = await res.json();

    if (!data.success) {
      showResult(data.message || "Failed to mark attendance.", false);
      return;
    }

    if (data.alreadyMarked) {
      showResult(
        `Already marked present for ${currentDay}: ${data.student.firstName} ${data.student.lastName} (${data.student.csId})`,
        true
      );
    } else {
      showResult(
        `Attendance marked for ${currentDay}: ${data.student.firstName} ${data.student.lastName} (${data.student.csId})`,
        true
      );
    }
  } catch (err) {
    console.error("Mark fetch error:", err);
    showResult("Network error: " + err.message, false);
  }
}

async function onScanSuccess(decodedText, decodedResult) {
  const csId = decodedText.trim();
  const event = eventInput.value.trim();
  showResult(`Scanned: ${csId}. Fetching student details for ${currentDay}...`, true);
  await previewStudent(csId, event);
}

function onScanFailure(error) {
  // ignore frequent failures
}

// auto start camera on load
window.addEventListener("load", () => {
  const config = { fps: 10, qrbox: 250 };
  const readerElementId = "reader";
  const html5Qr = new Html5Qrcode(readerElementId);
  html5QrcodeScanner = html5Qr;

  Html5Qrcode.getCameras()
    .then((devices) => {
      if (!devices || devices.length === 0) {
        showResult("No camera found.", false);
        return;
      }
      const backCamera = devices.find((d) =>
        d.label.toLowerCase().includes("back")
      );
      const cameraId = backCamera ? backCamera.id : devices[0].id;

      html5Qr
        .start(cameraId, config, onScanSuccess, onScanFailure)
        .then(() => {
          showResult("Camera started. Scan QR code.", true);
        })
        .catch((err) => {
          console.error("Camera start error:", err);
          showResult("Could not start camera: " + err, false);
        });
    })
    .catch((err) => {
      console.error("Camera get error:", err);
      showResult("Could not access camera. Check permissions.", false);
    });
});

manualPreviewBtn.addEventListener("click", async () => {
  const csId = manualCsIdInput.value.trim();
  const event = eventInput.value.trim();
  if (!csId) {
    showResult("Please enter CS-ID.", false);
    return;
  }
  showResult(`Fetching details for ${csId} (${currentDay})...`, true);
  await previewStudent(csId, event);
});

markBtn.addEventListener("click", async () => {
  const event = eventInput.value.trim();
  if (!currentCsId) {
    showResult("No student selected. Scan QR or preview CS-ID first.", false);
    return;
  }
  await markAttendance(currentCsId, event);
});
