const API_BASE = "http://localhost:8080";

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("forgotForm");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("forgotEmail").value.trim();

        const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email })
        });

        if (!res.ok) {
            alert("ทำรายการไม่สำเร็จ");
            return;
        }

        alert("ถ้าเป็นระบบจริงจะส่งลิงก์ไปอีเมล (ตอนนี้เป็น demo)");
    });
});
