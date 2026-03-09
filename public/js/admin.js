// public/js/admin.js
// Backend API URL (Render deployment)
const API_BASE = "https://cybersprint2026-ob49.onrender.com";

const loginSection = document.getElementById("loginSection");
const adminContent = document.getElementById("adminContent");
const adminPasswordInput = document.getElementById("adminPassword");
const loginBtn = document.getElementById("loginBtn");
const loginMessage = document.getElementById("loginMessage");

const eventInput = document.getElementById("eventInput");
const summaryBox = document.getElementById("summaryBox");
const refreshBtn = document.getElementById("refreshBtn");

const loadRegistrationsBtn = document.getElementById("loadRegistrationsBtn");
const downloadRegistrationsCsvBtn = document.getElementById("downloadRegistrationsCsvBtn");
const registrationsTableBody = document.querySelector("#registrationsTable tbody");

const daySelect = document.getElementById("daySelect");
const loadAttendanceBtn = document.getElementById("loadAttendanceBtn");
const downloadAttendanceCsvBtn = document.getElementById("downloadAttendanceCsvBtn");
const attendanceTableBody = document.querySelector("#attendanceTable tbody");

let isLoggedIn = false;

async function fetchJson(url) {
  const res = await fetch(url);
  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    const text = await res.text();
    throw new Error("Non-JSON response: " + text);
  }
  return res.json();
}

// LOGIN
loginBtn.addEventListener("click", async () => {
  const password = adminPasswordInput.value;
  loginMessage.textContent = "Checking...";
  try {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
    });
    const data = await res.json();
    if (data.success) {
      isLoggedIn = true;
      loginMessage.textContent = "Login successful.";
      loginSection.style.display = "none";
      adminContent.style.display = "block";
      loadSummary();
    } else {
      loginMessage.textContent = data.message || "Login failed.";
    }
  } catch (err) {
    loginMessage.textContent = "Error: " + err.message;
  }
});

async function loadSummary() {
  if (!isLoggedIn) return;
  const event = encodeURIComponent(eventInput.value.trim() || "CyberSprint 2026");
  summaryBox.textContent = "Loading summary...";
  try {
    const data = await fetchJson(`${API_BASE}/api/admin/summary?event=${event}`);
    if (!data.success) {
      summaryBox.textContent = data.message || "Failed to load summary.";
      return;
    }
    const { totalStudents, attendance } = data;
    summaryBox.innerHTML = `
      <strong>Event:</strong> ${data.event}<br/>
      <strong>Total Registrations:</strong> ${totalStudents}<br/>
      <strong>Day 1 Present:</strong> ${attendance.day1}<br/>
      <strong>Day 2 Present:</strong> ${attendance.day2}<br/>
      <strong>Day 3 Present:</strong> ${attendance.day3}
    `;
  } catch (err) {
    summaryBox.textContent = "Error: " + err.message;
  }
}

async function loadRegistrations() {
  if (!isLoggedIn) return;
  const event = encodeURIComponent(eventInput.value.trim() || "CyberSprint 2026");
  registrationsTableBody.innerHTML = "<tr><td colspan='8'>Loading...</td></tr>";
  try {
    const data = await fetchJson(`${API_BASE}/api/admin/registrations?event=${event}`);
    if (!data.success) {
      registrationsTableBody.innerHTML = `<tr><td colspan="8">${data.message || "Failed to load registrations."}</td></tr>`;
      return;
    }
    const students = data.students || [];
    if (students.length === 0) {
      registrationsTableBody.innerHTML = "<tr><td colspan='8'>No registrations found.</td></tr>";
      return;
    }
    registrationsTableBody.innerHTML = students
      .map((s) => {
        const name = `${s.firstName} ${s.lastName}`;
        const courseYear = `${s.course} / ${s.yearOfStudy}`;
        const regDate = s.registeredAt
          ? new Date(s.registeredAt).toLocaleString()
          : "";
        return `
          <tr>
            <td>${s.csId}</td>
            <td>${name}</td>
            <td>${s.email}</td>
            <td>${s.whatsappNumber || ""}</td>
            <td>${s.university}</td>
            <td>${s.collegeName}</td>
            <td>${courseYear}</td>
            <td>${regDate}</td>
          </tr>
        `;
      })
      .join("");
  } catch (err) {
    registrationsTableBody.innerHTML = `<tr><td colspan="8">Error: ${err.message}</td></tr>`;
  }
}

async function loadAttendance() {
  if (!isLoggedIn) return;
  const event = encodeURIComponent(eventInput.value.trim() || "CyberSprint 2026");
  const day = encodeURIComponent(daySelect.value || "");
  const url = day
    ? `${API_BASE}/api/admin/attendance?event=${event}&day=${day}`
    : `${API_BASE}/api/admin/attendance?event=${event}`;

  attendanceTableBody.innerHTML = "<tr><td colspan='5'>Loading...</td></tr>";
  try {
    const data = await fetchJson(url);
    if (!data.success) {
      attendanceTableBody.innerHTML = `<tr><td colspan="5">${data.message || "Failed to load attendance."}</td></tr>`;
      return;
    }
    const records = data.records || [];
    if (records.length === 0) {
      attendanceTableBody.innerHTML = "<tr><td colspan='5'>No attendance records found.</td></tr>";
      return;
    }
    attendanceTableBody.innerHTML = records
      .map((r) => {
        const scanTime = r.scanTime
          ? new Date(r.scanTime).toLocaleString()
          : "";
        return `
          <tr>
            <td>${r.csId}</td>
            <td>${r.event}</td>
            <td>${r.day || ""}</td>
            <td>${r.status}</td>
            <td>${scanTime}</td>
          </tr>
        `;
      })
      .join("");
  } catch (err) {
    attendanceTableBody.innerHTML = `<tr><td colspan="5">Error: ${err.message}</td></tr>`;
  }
}

// CSV downloads
downloadRegistrationsCsvBtn.addEventListener("click", () => {
  if (!isLoggedIn) return;
  const event = encodeURIComponent(eventInput.value.trim() || "CyberSprint 2026");
  const url = `${API_BASE}/api/admin/registrations/csv?event=${event}`;
  window.location.href = url;
});

downloadAttendanceCsvBtn.addEventListener("click", () => {
  if (!isLoggedIn) return;
  const event = encodeURIComponent(eventInput.value.trim() || "CyberSprint 2026");
  const day = encodeURIComponent(daySelect.value || "");
  const url = day
    ? `${API_BASE}/api/admin/attendance/csv?event=${event}&day=${day}`
    : `${API_BASE}/api/admin/attendance/csv?event=${event}`;
  window.location.href = url;
});

// Buttons
refreshBtn.addEventListener("click", loadSummary);
loadRegistrationsBtn.addEventListener("click", loadRegistrations);
loadAttendanceBtn.addEventListener("click", loadAttendance);
