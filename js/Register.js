// ====================== UI: toggle password ======================
function togglePasswordVisibility() {
    const passwordField = document.getElementById("password");
    if (!passwordField) return;

    passwordField.type = passwordField.type === "password" ? "text" : "password";
}

// ====================== Init + Backend Register ======================
const API_BASE = "http://localhost:8080";

document.addEventListener("DOMContentLoaded", () => {
    // 1) เติมตัวเลือก Day / Year (กันซ้ำ)
    populateDayYear();

    // 2) จับ submit ฟอร์ม register
    const form = document.getElementById("registerForm");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const payload = {
            firstName: document.getElementById("firstname")?.value?.trim() || "",
            lastName: document.getElementById("lastname")?.value?.trim() || "",
            phone: document.getElementById("phonenumber")?.value?.trim() || "",
            email: document.getElementById("email")?.value?.trim() || "",
            password: document.getElementById("password")?.value || "",
            gender: document.getElementById("gender")?.value || null,
            dob: buildDob(), // "YYYY-MM-DD" หรือ null
        };

        try {
            const res = await fetch(`${API_BASE}/api/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const msg = await res.text();
                alert("Register ไม่สำเร็จ: " + msg);
                return;
            }

            alert("สมัครสมาชิกสำเร็จ! ไปหน้า Login");
            window.location.href = "Login.html";
        } catch (err) {
            console.error(err);
            alert("เชื่อมต่อ Backend ไม่ได้ (เช็คว่า Spring Boot รันอยู่ + CORS)");
        }
    });
});

function populateDayYear() {
    const daySelect = document.getElementById("day");
    const yearSelect = document.getElementById("year");
    if (!daySelect || !yearSelect) return;

    // ถ้ามี option มากกว่า 1 (มี Day อยู่แล้ว 1 อัน) แปลว่าเคยเติมแล้ว -> ไม่เติมซ้ำ
    if (daySelect.options.length <= 1) {
        for (let i = 1; i <= 31; i++) {
            const option = document.createElement("option");
            option.value = String(i);
            option.textContent = String(i);
            daySelect.appendChild(option);
        }
    }

    if (yearSelect.options.length <= 1) {
        const currentYear = new Date().getFullYear();
        for (let y = currentYear; y >= 1950; y--) {
            const option = document.createElement("option");
            option.value = String(y);
            option.textContent = String(y);
            yearSelect.appendChild(option);
        }
    }
}

function buildDob() {
    const day = document.getElementById("day")?.value;
    const month = document.getElementById("month")?.value;
    const year = document.getElementById("year")?.value;

    // ถ้ายังเลือกไม่ครบ ให้ส่ง null
    if (!day || !month || !year) return null;

    const mm = String(month).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    return `${year}-${mm}-${dd}`;
}
