// ควบคุมการทำงานของแท็บ
const tabs = document.querySelectorAll('.tab');
const contents = document.querySelectorAll('[role="tabpanel"]');

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        // ลบสถานะ active จากแท็บและเนื้อหาที่ถูกเลือกก่อนหน้า
        tabs.forEach(t => {
            t.setAttribute('aria-selected', 'false');
            t.setAttribute('tabindex', '-1');
        });
        contents.forEach(content => content.hidden = true);

        // ตั้งค่ากับแท็บและเนื้อหาที่ถูกเลือกใหม่
        tab.setAttribute('aria-selected', 'true');
        tab.removeAttribute('tabindex');
        const contentId = tab.getAttribute('aria-controls');
        document.getElementById(contentId).hidden = false;
    });
});

// ฟังก์ชันสำหรับควบคุม Quantity
function decreaseQuantity() {
    const quantityInput = document.getElementById('quantity');
    let currentValue = parseInt(quantityInput.value, 10);

    if (currentValue > 1) {
        quantityInput.value = currentValue - 1;
    }
}

function increaseQuantity() {
    const quantityInput = document.getElementById('quantity');
    let currentValue = parseInt(quantityInput.value, 10);

    quantityInput.value = currentValue + 1;
}

// ควบคุมการเลือกขนาด (Size Option)
document.querySelectorAll('.size-option').forEach(option => {
    option.addEventListener('click', function () {
        // ลบการเลือกทั้งหมด
        document.querySelectorAll('.size-option').forEach(item => {
            item.setAttribute('aria-checked', 'false');
        });

        // ตั้งค่าการเลือกให้ตัวที่ถูกคลิก
        this.setAttribute('aria-checked', 'true');
        console.log('Selected size:', this.getAttribute('data-value'));
    });
});

function toggleDetails() {
    const details = document.getElementById('details');
    const button = document.querySelector('.toggle-button');

    if (details.style.display === 'none') {
        details.style.display = 'block'; // แสดงรายละเอียด
        button.textContent = '-'; // เปลี่ยนปุ่มเป็นลบ
    } else {
        details.style.display = 'none'; // ซ่อนรายละเอียด
        button.textContent = '+'; // เปลี่ยนปุ่มกลับเป็นบวก
    }
}

// ฟังก์ชันสำหรับเปลี่ยนแปลงรูปหลักเมื่อคลิกที่รูปย่อย
function changeMainImage(thumbnail) {
    const mainImage = document.getElementById('mainImage'); // ดึง <img> หลัก
    mainImage.src = thumbnail.src; // เปลี่ยน src ของรูปหลักเป็นรูปที่คลิก
}

document.querySelectorAll('.dropdown').forEach(function (dropdown) {
    let timeout;

    // เมื่อเมาส์อยู่บนเมนู
    dropdown.addEventListener('mouseenter', function () {
        clearTimeout(timeout); // หยุดการซ่อนเมนูถ้ามี
        const content = this.querySelector('.dropdown-content');
        if (content) {
            content.style.display = 'block';
            content.style.opacity = '1';
            content.style.visibility = 'visible';
        }
    });

    // เมื่อเมาส์ออกจากเมนู
    dropdown.addEventListener('mouseleave', function () {
        const content = this.querySelector('.dropdown-content');
        if (content) {
            timeout = setTimeout(function () {
                content.style.display = 'none';
                content.style.opacity = '0';
                content.style.visibility = 'hidden';
            }, 500); // เพิ่มเวลาค้าง (500ms)
        }
    });
});

// ====================== Backend Integration ======================
const API_BASE = "http://localhost:8080";
const CART_API = `${API_BASE}/api/cart`;

document.addEventListener("DOMContentLoaded", () => {
    loadCart();
});

async function loadCart() {
    try {
        const res = await fetch(CART_API);
        if (!res.ok) throw new Error("GET /api/cart failed");

        const items = await res.json(); // [{itemId, productId, name, price, image, size, qty}]
        renderCart(items);
    } catch (err) {
        console.error(err);
        alert("โหลดตะกร้าไม่สำเร็จ (เช็คว่า Backend รันอยู่ และ CORS ถูกต้อง)");
    }
}

function renderCart(items) {
    const tbody = document.getElementById("cartBody");
    const subtotalEl = document.getElementById("subtotal");
    const totalEl = document.getElementById("total");

    if (!items || items.length === 0) {
        tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center; padding: 20px;">
          Cart is empty
        </td>
      </tr>
    `;
        subtotalEl.textContent = "0.00";
        totalEl.textContent = "0.00";
        return;
    }

    let subtotal = 0;

    tbody.innerHTML = items
        .map((it) => {
            const price = Number(it.price || 0);
            const qty = Number(it.qty || 1);
            const rowTotal = price * qty;
            subtotal += rowTotal;

            const imgSrc = it.image && it.image.trim() ? it.image : "image/placeholder.png";

            return `
        <tr data-item-id="${it.itemId}">
          <td><input type="checkbox" class="product-checkbox"></td>

          <td>
            <div class="product-info">
              <img src="${imgSrc}" alt="${escapeHtml(it.name)}" class="product-image">
              <div class="product-details">
                <p>${escapeHtml(it.name)}</p>
                <p>Size: ${escapeHtml(it.size || "-")}</p>
              </div>
            </div>
          </td>

          <td class="unit-price">${price.toFixed(2)}</td>

          <td>
            <div class="quantity-control">
              <button class="quantity-btn decrement">-</button>
              <input type="number" class="quantity-input" value="${qty}" min="1" readonly>
              <button class="quantity-btn increment">+</button>
            </div>
          </td>

          <td class="row-total">${rowTotal.toFixed(2)}</td>
        </tr>
      `;
        })
        .join("");

    subtotalEl.textContent = "0.00";
    totalEl.textContent = "0.00";

    bindCartEvents();

    // เผื่ออนาคตมี logic auto-check บางแถว จะได้คำนวณถูก
    recalcTotalsByChecked();
}

function bindCartEvents() {
    // ปุ่ม +/-
    document.querySelectorAll("#cartBody tr").forEach((row) => {
        const itemId = row.getAttribute("data-item-id");
        const input = row.querySelector(".quantity-input");

        row.querySelector(".increment")?.addEventListener("click", async () => {
            const newQty = Number(input.value) + 1;
            await patchQty(itemId, newQty);
            await loadCart();
        });

        row.querySelector(".decrement")?.addEventListener("click", async () => {
            const currentQty = Number(input.value);
            // ถ้าเหลือ 1 แล้วกด - => ลบสินค้า
            if (currentQty <= 1) {
                const ok = confirm("ต้องการลบสินค้านี้ออกจากตะกร้าไหม?");
                if (!ok) return;

                await deleteItem(itemId);
                await loadCart();
                return;
            }

            // ถ้ามากกว่า 1 => ลดจำนวนตามปกติ
            const newQty = currentQty - 1;
            await patchQty(itemId, newQty);
            await loadCart();
        });
    });

    // ถ้าคุณอยากให้ subtotal คิดจาก checkbox (เลือก/ไม่เลือก) ให้เปิดใช้งานส่วนนี้
    document.querySelectorAll(".product-checkbox").forEach((cb) => {
        cb.addEventListener("change", recalcTotalsByChecked);
    });
}

async function patchQty(itemId, qty) {
    const res = await fetch(`${CART_API}/items/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qty }),
    });

    if (!res.ok) {
        const txt = await res.text();
        console.error(txt);
        alert("ปรับจำนวนไม่สำเร็จ");
    }
}

function recalcTotalsByChecked() {
    let subtotal = 0;

    document.querySelectorAll("#cartBody tr").forEach((row) => {
        const checked = row.querySelector(".product-checkbox")?.checked;
        if (!checked) return;

        const rowTotalText = row.querySelector(".row-total")?.textContent || "0";
        subtotal += Number(rowTotalText) || 0;
    });

    document.getElementById("subtotal").textContent = subtotal.toFixed(2);
    document.getElementById("total").textContent = subtotal.toFixed(2);
}

function escapeHtml(s) {
    return String(s || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

async function deleteItem(itemId) {
    const res = await fetch(`${CART_API}/items/${itemId}`, {
        method: "DELETE",
    });

    if (!res.ok) {
        const txt = await res.text();
        console.error(txt);
        alert("ลบสินค้าไม่สำเร็จ");
    }
}


