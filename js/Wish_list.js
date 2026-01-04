const API_BASE = "http://localhost:8080";
const WISH_API = `${API_BASE}/api/wishlist`;
const CART_API = `${API_BASE}/api/cart`;
const CART_ITEMS_API = `${API_BASE}/api/cart/items`;

document.addEventListener("DOMContentLoaded", () => {
    // กันเข้าหน้าโดยไม่ login
    if (!getToken()) {
        alert("กรุณา Login ก่อน");
        window.location.href = "Login.html";
        return;
    }

    bindTopButtons();
    loadWishlist();
    updateCartCount();
});

function getToken() {
    return localStorage.getItem("token") || sessionStorage.getItem("token");
}

function authHeaders(extra = {}) {
    const token = getToken();
    return {
        ...extra,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}

// fetch ที่แนบ token + handle 401/403
async function fetchAuth(url, options = {}) {
    const res = await fetch(url, {
        ...options,
        headers: authHeaders(options.headers || {}),
    });

    if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
        alert("Session หมดอายุ กรุณา Login ใหม่");
        window.location.href = "Login.html";
        throw new Error("AUTH_EXPIRED");
    }

    return res;
}

function bindTopButtons() {
    document.querySelector(".clear-wishlist")?.addEventListener("click", clearWishlist);
    document.querySelector(".add-all-to-cart")?.addEventListener("click", addAllToCart);
}

async function loadWishlist() {
    try {
        const res = await fetchAuth(WISH_API);
        if (!res.ok) throw new Error(await res.text());

        const items = await res.json();
        renderWishlist(items);
    } catch (e) {
        console.error(e);
    }
}

function renderWishlist(items) {
    const tbody = document.getElementById("wishBody");
    if (!tbody) return;

    if (!items || items.length === 0) {
        tbody.innerHTML = `
      <tr>
        <td colspan="3" style="text-align:center; padding: 20px;">
          Wish-list is empty
        </td>
      </tr>`;
        return;
    }

    tbody.innerHTML = items
        .map((it) => {
            const imgSrc = it.image && String(it.image).trim() ? it.image : "image/placeholder.png";
            const price = Number(it.price || 0).toFixed(2);
            const name = escapeHtml(it.name || "");
            const size = escapeHtml(it.size || "-");

            return `
        <tr data-item-id="${it.itemId ?? it.id}" data-product-id="${it.productId}">
          <td>
            <div class="product-info">
              <img src="${imgSrc}" alt="${name}" class="product-image">
              <div class="product-details">
                <p>${name}</p>
                <p>Size: ${size}</p>
              </div>
            </div>
          </td>
          <td>${price}</td>
          <td style="color: green;">In stock</td>
        </tr>
      `;
        })
        .join("");
}

async function clearWishlist() {
    const ok = confirm("ต้องการล้าง Wish-list ทั้งหมดใช่ไหม?");
    if (!ok) return;

    try {
        const res = await fetchAuth(WISH_API, { method: "DELETE" });

        if (!res.ok) {
            console.error(await res.text());
            alert("ล้าง Wish-list ไม่สำเร็จ");
            return;
        }

        await loadWishlist();
    } catch (e) {
        console.error(e);
    }
}

async function addAllToCart() {
    const ok = confirm("เพิ่มสินค้าทั้งหมดไปยังตะกร้าใช่ไหม?");
    if (!ok) return;

    try {
        // โหลด wishlist ล่าสุด
        const wishRes = await fetchAuth(WISH_API);
        if (!wishRes.ok) throw new Error(await wishRes.text());
        const items = await wishRes.json();

        if (!items || items.length === 0) {
            alert("Wish-list ว่างอยู่");
            return;
        }

        // ย้ายไป cart ทีละชิ้น
        for (const it of items) {
            const payload = {
                productId: Number(it.productId),
                name: it.name || "",
                price: Number(it.price || 0),
                image: it.image || "",
                size: it.size || "",
                qty: 1,
            };

            const res = await fetchAuth(CART_ITEMS_API, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) console.error(await res.text());
        }

        // ล้าง wishlist หลังย้าย
        await fetchAuth(WISH_API, { method: "DELETE" });

        alert("Added all to cart");
        await loadWishlist();
        await updateCartCount();
    } catch (e) {
        console.error(e);
        alert("เพิ่มทั้งหมดไม่สำเร็จ");
    }
}

async function updateCartCount() {
    const el = document.getElementById("cart-count");
    if (!el) return; // ถ้าหน้าไม่มี badge ก็ข้าม

    try {
        const res = await fetchAuth(CART_API);
        if (!res.ok) throw new Error(await res.text());

        const cartItems = await res.json();
        const totalQty = (cartItems || []).reduce((sum, it) => sum + Number(it.qty || 0), 0);
        el.textContent = String(totalQty);
    } catch (e) {
        console.error(e);
        el.textContent = "0";
    }
}

function escapeHtml(s) {
    return String(s || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}
