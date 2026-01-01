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

document.addEventListener("DOMContentLoaded", () => {
    document.querySelector('[data-action="add-cart"]')?.addEventListener("click", addToCart);
    document.querySelector('[data-action="add-wishlist"]')?.addEventListener("click", addToWishlist);
});

async function addToCart() {
    const meta = getProductMeta();
    const size = getSelectedSize();
    const qty = getQty();

    if (!meta.productId) return alert("ยังไม่ได้ใส่ data-product-id");
    if (!size) return alert("กรุณาเลือกไซส์ก่อน");

    const payload = { ...meta, size, qty };

    try {
        const res = await fetch(`${API_BASE}/api/cart/items`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Add to cart failed");
        alert("Add to cart");
    } catch (e) {
        console.error(e);
        alert("เรียก Backend ไม่สำเร็จ (เช็คว่า backend รันอยู่ + CORS)");
    }
}

async function addToWishlist() {
    const meta = getProductMeta();
    const size = getSelectedSize();

    if (!meta.productId) return alert("ยังไม่ได้ใส่ data-product-id");

    const hasSizeOptions = document.querySelectorAll(".size-option").length > 0;
    if (hasSizeOptions && !size) return alert("กรุณาเลือกไซส์ก่อน");

    const payload = { ...meta, size: size || "" };

    try {
        const res = await fetch(`${API_BASE}/api/wishlist/items`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Add to wishlist failed");

        const data = await res.json().catch(() => ({}));
        if (data.message === "already_in_wishlist") return alert("มีสินค้าใน Wish-list แล้ว");
        alert("Add to wish-list");
    } catch (e) {
        console.error(e);
        alert("เรียก Backend ไม่สำเร็จ (เช็คว่า backend รันอยู่ + CORS)");
    }
}

function getProductMeta() {
    // ถ้ามี data-* ที่ .product-info จะใช้ก่อน
    const info = document.querySelector(".product-info[data-product-id]");
    let productId = null;
    let name = "";
    let price = 0;
    let image = "";

    if (info?.dataset) {
        productId = parseInt(info.dataset.productId || "0", 10) || null;
        name = info.dataset.productName || "";
        price = parseFloat(info.dataset.productPrice || "0") || 0;
        image = info.dataset.productImage || "";
    }

    // fallback: อ่านจากหน้า (กรณีคุณยังไม่ได้ใส่ data-name/price/image)
    if (!name) name = document.querySelector(".Name h2")?.textContent?.trim() || "";
    if (!price) {
        const priceText = document.querySelector(".Name p")?.textContent?.trim() || "0";
        price = parseFloat(priceText.replace(/[^\d.]/g, "")) || 0;
    }

    // ใช้รูปหลักที่กำลังแสดงอยู่จริง
    const mainImg = document.getElementById("mainImage");
    if (mainImg) image = mainImg.getAttribute("src") || image;

    image = normalizeToRelativePath(image);

    return { productId, name, price, image };
}

function getSelectedSize() {
    const selected = document.querySelector('.size-option[aria-checked="true"]');
    if (!selected) return null;
    return selected.getAttribute("data-value") || selected.textContent.trim();
}

function getQty() {
    return parseInt(document.getElementById("quantity")?.value || "1", 10) || 1;
}

function normalizeToRelativePath(path) {
    if (!path) return "";
    try {
        const u = new URL(path, window.location.href);
        return u.pathname.startsWith("/") ? u.pathname.slice(1) : u.pathname;
    } catch {
        return path; // เป็น relative อยู่แล้ว
    }
}



