// public/js/register.js
// Backend API URL (Render deployment)
const API_BASE = "https://cybersprint2026-ob49.onrender.com";

const form = document.getElementById("regForm");
const university = document.getElementById("university");
const course = document.getElementById("course");
const yearOfStudy = document.getElementById("yearOfStudy");
const collegeDropdown = document.getElementById("collegeDropdown");
const collegeTextbox = document.getElementById("collegeTextbox");
const collegeHidden = document.getElementById("collegeHidden");
const collegeLabel = document.getElementById("collegeLabel");

// 1. BMU colleges vs Other University textbox
university.addEventListener("change", () => {
  collegeDropdown.style.display = "none";
  collegeTextbox.style.display = "none";
  collegeHidden.value = "";

  if (university.value === "Bhagwan Mahavir University") {
    collegeLabel.textContent = "College Name:";
    collegeDropdown.style.display = "block";
    collegeDropdown.innerHTML = `
      <option value="">Select College</option>
      <option value="Mahavir Swami College of Engineering & Technology">Mahavir Swami College of Engineering & Technology</option>
      <option value="Bhagwan Mahavir College of Computer Application">Bhagwan Mahavir College of Computer Application</option>
      <option value="Mahavir Swami Polytechnic">Mahavir Swami Polytechnic</option>
      <option value="Bhagwan Mahavir College of Pharmacy">Bhagwan Mahavir College of Pharmacy</option>
      <option value="Bhagwan Mahavir College of Management">Bhagwan Mahavir College of Management</option>
      <option value="Bhagwan Mahavir College of Commerce & Management Studies">Bhagwan Mahavir College of Commerce & Management Studies</option>
      <option value="Bhagwan Arihant Institute of Technology">Bhagwan Arihant Institute of Technology</option>
      <option value="Bhagwan Mahavir Centre for Advance Research">Bhagwan Mahavir Centre for Advance Research</option>
      <option value="Bhagwan Mahavir School of Nursing">Bhagwan Mahavir School of Nursing</option>
      <option value="Bhagwan Mahavir College of Liberal Arts & Humanities">Bhagwan Mahavir College of Liberal Arts & Humanities</option>
      <option value="Bhagwan Mahavir College of Para Medical Sciences & Healthcare">Bhagwan Mahavir College of Para Medical Sciences & Healthcare</option>
      <option value="Bhagwan Mahavir College of Basic & Applied Sciences">Bhagwan Mahavir College of Basic & Applied Sciences</option>
      <option value="Bhagwan Mahavir College of Architecture">Bhagwan Mahavir College of Architecture</option>
      <option value="Bhagwan Mahavir College of Hotel Management">Bhagwan Mahavir College of Hotel Management</option>
      <option value="Shikshan Bharti College of Education">Shikshan Bharti College of Education</option>
      <option value="Bhagwan Mahavir College of Education">Bhagwan Mahavir College of Education</option>
      <option value="Sharrik Shikshan Mahavidyalaya">Sharrik Shikshan Mahavidyalaya</option>
      <option value="Bhagwan Mahavir College of Physical Education">Bhagwan Mahavir College of Physical Education</option>
      <option value="Bhagwan Mahavir College of Fashion and Design">Bhagwan Mahavir College of Fashion and Design</option>
      <option value="Bhagwan Mahavir College of Legal Education">Bhagwan Mahavir College of Legal Education</option>
      <option value="Bhagwan Mahavir Centre for Skill Development">Bhagwan Mahavir Centre for Skill Development</option>
      <option value="Bhagwan Mahavir Centre for International Studies">Bhagwan Mahavir Centre for International Studies</option>
      <option value="Bhagwan Mahavir Polytechnic">Bhagwan Mahavir Polytechnic</option>
      <option value="Bhagwan Mahavir College of Engineering and Technology">Bhagwan Mahavir College of Engineering and Technology</option>
      <option value="Bhagwan Mahavir College of Nursing">Bhagwan Mahavir College of Nursing</option>
      <option value="Bhagwan Mahavir Finishing School">Bhagwan Mahavir Finishing School</option>
    `;
  } else if (university.value === "Other University") {
    collegeLabel.textContent = "College Name (Other University):";
    collegeTextbox.style.display = "block";
    collegeTextbox.value = "";
  }
});

collegeDropdown.addEventListener("change", () => {
  collegeHidden.value = collegeDropdown.value;
});

collegeTextbox.addEventListener("input", () => {
  collegeHidden.value = collegeTextbox.value;
});

// 2. Dynamic year-of-study based on course
course.addEventListener("change", () => {
  yearOfStudy.innerHTML = '<option value="">Select Year</option>';

  if (course.value === "Bachelors") {
    ["1st Year", "2nd Year", "3rd Year", "4th Year"].forEach((label) => {
      const opt = document.createElement("option");
      opt.value = label;
      opt.textContent = label;
      yearOfStudy.appendChild(opt);
    });
  } else if (course.value === "Masters") {
    ["1st Year", "2nd Year"].forEach((label) => {
      const opt = document.createElement("option");
      opt.value = label;
      opt.textContent = label;
      yearOfStudy.appendChild(opt);
    });
  }
});

// 3. Submit form
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(form);
  const data = Object.fromEntries(formData);

  const messageEl = document.getElementById("message");
  messageEl.innerHTML = "Registering...";
  messageEl.className = "";

  try {
    const response = await fetch(`${API_BASE}/api/students/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (result.success) {
      messageEl.innerHTML = `
    <h3>Registration Successful ✅</h3>
    <p><strong>CS-ID:</strong> ${result.student.csId}</p>
    <p><strong>Name:</strong> ${result.student.firstName} ${result.student.lastName}</p>
    <p>A confirmation email with your QR code has been sent to: <strong>${result.student.email}</strong>.</p>
     `;
      messageEl.className = "success";
      form.reset();
      yearOfStudy.innerHTML = '<option value="">Select Year</option>';
      collegeDropdown.style.display = "none";
      collegeTextbox.style.display = "none";
      collegeHidden.value = "";
    } else {
      messageEl.innerHTML = `❌ ${result.message}`;
      messageEl.className = "error";
    }
  } catch (error) {
    messageEl.innerHTML = `❌ Network error: ${error.message}`;
    messageEl.className = "error";
  }
});
