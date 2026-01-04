const API_BASE = "http://localhost:8080";

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("loginForm");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("loginEmail").value.trim();
        const password = document.getElementById("loginPassword").value;
        const keep = document.getElementById("keep-signed-in").checked;

        try {
            const res = await fetch(`${API_BASE}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            if (!res.ok) {
                const msg = await res.text();
                alert("Login ไม่สำเร็จ: " + msg);
                return;
            }

            const data = await res.json(); // { token, user: {id,email,role} }

            // เก็บ token ตาม keep
            if (keep) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(data.user || {}));
                sessionStorage.removeItem("token");
                sessionStorage.removeItem("user");
            } else {
                sessionStorage.setItem("token", data.token);
                sessionStorage.setItem("user", JSON.stringify(data.user || {}));
                localStorage.removeItem("token");
                localStorage.removeItem("user");
            }

            window.location.href = "Home.html";
        } catch (err) {
            console.error(err);
            alert("เชื่อมต่อ Backend ไม่ได้ (เช็คว่า Spring Boot รันอยู่ + CORS)");
        }
    });
});
