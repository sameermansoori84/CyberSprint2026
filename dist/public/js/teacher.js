// public/js/teacher.js

// CHANGE this to your Render backend URL in production
const API_BASE = "";

document.addEventListener("DOMContentLoaded", () => {
  // ------- DOM references -------
  const teacherLoginForm = document.getElementById("teacherLoginForm");
  const teacherPasswordInput = document.getElementById("teacherPassword");
  const teacherLoginBtn = document.getElementById("teacherLoginBtn");
  const teacherLoginMessage = document.getElementById("teacherLoginMessage");
  const teacherContent = document.getElementById("teacherContent");

  const dayButtons = document.querySelectorAll(".day-btn");
  const manualCsIdSuffixInput = document.getElementById("manualCsIdSuffix");
  const manualPreviewBtn = document.getElementById("manualPreviewBtn");
  const studentDetailsDiv = document.getElementById("studentDetails");
  const markBtn = document.getElementById("markBtn");
  const resultDiv = document.getElementById("result");

  const video = document.getElementById("video");
  const canvas = document.getElementById("canvas");
  const startCameraBtn = document.getElementById("startCameraBtn");
  const stopCameraBtn = document.getElementById("stopCameraBtn");
  const ctx = canvas.getContext("2d");

  // ------- state -------
  const TEACHER_PASSWORD = "Attend@nceCS2026"; // change for your event
  let currentDay = "Day 1";
  let currentStudent = null;

  let stream = null;
  let scanning = false;
  let rafId = null;

  // ------- helpers -------
  function clearResult() {
    if (!resultDiv) return;
    resultDiv.textContent = "";
    resultDiv.className = "";
  }

  function showResult(message, isSuccess) {
    if (!resultDiv) return;
    resultDiv.textContent = message;
    resultDiv.className = isSuccess ? "success" : "error";
  }

  // ------- date-based day locking -------
  function getAllowedDayLabel() {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth(); // 0 = Jan, 2 = March
    const d = now.getDate();

    if (y === 2026 && m === 2 && d === 12) return "Day 1";
    if (y === 2026 && m === 2 && d === 13) return "Day 2";
    if (y === 2026 && m === 2 && d === 14) return "Day 3";

    return null;
  }

  const allowedDay = getAllowedDayLabel();

  if (allowedDay) {
    dayButtons.forEach((btn) => {
      const label = btn.getAttribute("data-day");
      if (label !== allowedDay) {
        btn.disabled = true;
        btn.classList.remove("active");
        btn.style.opacity = "0.4";
        btn.style.cursor = "not-allowed";
      } else {
        btn.disabled = false;
        btn.classList.add("active");
        btn.style.opacity = "1";
        btn.style.cursor = "pointer";
        currentDay = allowedDay;
      }
    });
  } else {
    dayButtons.forEach((btn) => {
      btn.disabled = true;
      btn.classList.remove("active");
      btn.style.opacity = "0.4";
      btn.style.cursor = "not-allowed";
    });
    showResult("Attendance marking is disabled today.", false);
  }

  // ------- Teacher auth gate (form-based) -------
  function handleTeacherLogin() {
    const entered = (teacherPasswordInput.value || "").trim();

    if (entered === TEACHER_PASSWORD) {
      teacherLoginMessage.style.color = "#bbf7d0";
      teacherLoginMessage.textContent = "Access granted.";

      const authPanel = teacherLoginBtn.closest("section");
      if (authPanel) authPanel.style.display = "none";

      teacherContent.style.display = "block";
      teacherPasswordInput.value = "";
      teacherPasswordInput.disabled = true;
      teacherLoginBtn.disabled = true;

      showResult("Camera is off.", false);
    } else {
      teacherLoginMessage.style.color = "#fecaca";
      teacherLoginMessage.textContent = "Incorrect password.";
    }
  }

  teacherLoginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    handleTeacherLogin();
  });

  teacherLoginBtn.addEventListener("click", (e) => {
    e.preventDefault();
    handleTeacherLogin();
  });

  teacherPasswordInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleTeacherLogin();
    }
  });

  // ------- Day selection (respect locking) -------
  dayButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn.disabled) return;
      dayButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentDay = btn.getAttribute("data-day") || "Day 1";
    });
  });

  // ------- Camera + jsQR scanner -------
  async function startCamera() {
    try {
      if (!allowedDay) {
        showResult("Camera cannot be started today. Outside event dates.", false);
        return;
      }

      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      video.srcObject = stream;
      scanning = true;
      showResult("Camera started. Point at QR code.", true);
      startCameraBtn.disabled = true;
      stopCameraBtn.disabled = false;
      scanLoop();
    } catch (err) {
      console.error("Error accessing camera:", err);
      showResult("Error accessing camera: " + err.message, false);
    }
  }

  function stopCamera() {
    scanning = false;
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      stream = null;
    }
    video.srcObject = null;
    video.pause();
    startCameraBtn.disabled = false;
    stopCameraBtn.disabled = true;
    showResult("Camera is off.", false);
  }

  function scanLoop() {
    if (!scanning) return;

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      if (window.jsQR) {
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        if (code && code.data) {
          const decodedText = code.data;
          scanning = false;
          showResult("QR detected, processing...", true);
          stopCamera();
          handleQrScan(decodedText);
          return;
        }
      }
    }

    rafId = requestAnimationFrame(scanLoop);
  }

  startCameraBtn.addEventListener("click", startCamera);
  stopCameraBtn.addEventListener("click", stopCamera);

  async function handleQrScan(decodedText) {
    clearResult();
    showResult("Processing QR...", true);

    try {
      const res = await fetch(`${API_BASE}/api/attendance/scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payload: decodedText,
          day: currentDay
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        showResult(
          data.message || "Failed to mark attendance from QR.",
          false
        );
        return;
      }

      showResult(data.message || "Attendance marked via QR.", true);
    } catch (err) {
      console.error(err);
      showResult("Server error while processing QR.", false);
    }
  }

  // ------- Manual CS‑ID preview (CS2026-xxxx) -------
  manualPreviewBtn.addEventListener("click", async () => {
    clearResult();
    studentDetailsDiv.style.display = "none";
    studentDetailsDiv.innerHTML = "";
    markBtn.disabled = true;
    currentStudent = null;

    if (!allowedDay) {
      showResult("Manual attendance is disabled today.", false);
      return;
    }

    const suffix = (manualCsIdSuffixInput.value || "").trim();
    if (!/^\d{4}$/.test(suffix)) {
      showResult("Please enter last 4 digits (numbers only).", false);
      return;
    }

    const csId = `CS2026-${suffix}`;
    showResult(`Fetching details for ${csId} (${currentDay})...`, true);

    try {
      const res = await fetch(
        `${API_BASE}/api/students/by-csid/${encodeURIComponent(csId)}`
      );
      const data = await res.json();

      if (!res.ok || !data.success || !data.student) {
        showResult(data.message || "Student not found.", false);
        return;
      }

      currentStudent = data.student;
      studentDetailsDiv.style.display = "block";
      studentDetailsDiv.innerHTML = `
        <strong>CS-ID:</strong> ${currentStudent.csId}<br/>
        <strong>Name:</strong> ${currentStudent.firstName} ${currentStudent.lastName}<br/>
        <strong>Email:</strong> ${currentStudent.email}<br/>
        <strong>University:</strong> ${currentStudent.university}<br/>
        <strong>College:</strong> ${currentStudent.collegeName || ""}<br/>
        <strong>Event:</strong> ${currentStudent.event || "CyberSprint 2026"}
      `;
      markBtn.disabled = false;
      showResult(
        "Student loaded. Confirm details and click Mark present.",
        true
      );
    } catch (err) {
      console.error(err);
      showResult("Error while previewing student.", false);
    }
  });

  manualCsIdSuffixInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      manualPreviewBtn.click();
    }
  });

  // ------- Manual mark present -------
  markBtn.addEventListener("click", async () => {
    if (!currentStudent) {
      showResult(
        "No student selected. Scan QR or preview CS-ID first.",
        false
      );
      return;
    }

    clearResult();
    showResult(
      `Marking ${currentStudent.csId} present for ${currentDay}...`,
      true
    );

    try {
      const res = await fetch(`${API_BASE}/api/attendance/manual-mark`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          csId: currentStudent.csId,
          day: currentDay
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        showResult(data.message || "Failed to mark attendance.", false);
        return;
      }

      showResult(data.message || "Attendance marked successfully.", true);
    } catch (err) {
      console.error(err);
      showResult("Server error while marking attendance.", false);
    }
  });
});
