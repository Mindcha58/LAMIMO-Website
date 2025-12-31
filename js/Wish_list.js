// Maximum allowed items in the cart
const MAX_CART_ITEMS = 50;

// Cart count variable
let cartCount = 0;

// Get elements
const cartCountElement = document.getElementById('cart-count');
const addToCartButtons = document.querySelectorAll('.add-to-cart');

// Function to add item to the cart
function addToCart() {
    if (cartCount >= MAX_CART_ITEMS) {
        alert('You cannot add more than 50 items to the cart.');
        return;
    }

    // Increment cart count
    cartCount++;
    updateCartCount();
    alert('Item added to cart!');
}

// Function to update cart count on the page
function updateCartCount() {
    cartCountElement.textContent = cartCount;
}

// Attach click event to all "Add to Cart" buttons
addToCartButtons.forEach((button) => {
    button.addEventListener('click', addToCart);
});

// ====================== Backend Integration (Wish-list) ======================
const API_BASE = "http://localhost:8080";
const WISH_API = `${API_BASE}/api/wishlist`;
const CART_API = `${API_BASE}/api/cart`;
const CART_ITEMS_API = `${API_BASE}/api/cart/items`;

document.addEventListener("DOMContentLoaded", () => {
    loadWishlist();
    bindTopButtons();
});

function bindTopButtons() {
    document.querySelector(".clear-wishlist")?.addEventListener("click", clearWishlist);
    document.querySelector(".add-all-to-cart")?.addEventListener("click", addAllToCart);
}

async function loadWishlist() {
    try {
        const res = await fetch(WISH_API);
        if (!res.ok) throw new Error("GET /api/wishlist failed");
        const items = await res.json();

        renderWishlist(items);
        await updateCartCount();
    } catch (e) {
        console.error(e);
        //alert("โหลด Wish-list ไม่สำเร็จ (เช็คว่า backend รันอยู่ + CORS)");
    }
}

function renderWishlist(items) {
    const tbody = document.getElementById("wishBody");
    if (!tbody) return;

    if (!items || items.length === 0) {
        tbody.innerHTML = `
      <tr>
        <td colspan="4" style="text-align:center; padding: 20px;">
          Wish-list is empty
        </td>
      </tr>
    `;
        return;
    }

    tbody.innerHTML = items
        .map((it) => {
            const imgSrc = it.image && String(it.image).trim() ? it.image : "image/placeholder.png";
            const price = Number(it.price || 0).toFixed(2);

            return `
        <tr data-item-id="${it.itemId}" data-product-id="${it.productId}">
          <td>
            <div class="product-info">
              <img src="${imgSrc}" alt="${escapeHtml(it.name)}" class="product-image">
              <div class="product-details">
                <p>${escapeHtml(it.name)}</p>
                <p>Size: ${escapeHtml(it.size || "-")}</p>
              </div>
            </div>
          </td>

          <td>${price}</td>
          <td style="color: green;">In stock</td>
        </tr>
      `;
        })
        .join("");

    bindRowButtons();
}

async function addRowToCart(row, productId) {
    if (!productId) {
        alert("ไม่พบ productId ของสินค้าในแถวนี้");
        return;
    }

    const name = row.querySelector(".product-details p:nth-child(1)")?.textContent?.trim() || "";
    const sizeText = row.querySelector(".product-details p:nth-child(2)")?.textContent || "";
    const size = sizeText.replace("Size:", "").trim();
    const priceText = row.children[1]?.textContent || "0";
    const price = Number(String(priceText).replace(/[^\d.]/g, "")) || 0;
    const image = row.querySelector("img")?.getAttribute("src") || "";

    const payload = { productId, name, price, image, size, qty: 1 };

    const res = await fetch(CART_ITEMS_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        const txt = await res.text();
        console.error(txt);
        alert("เพิ่มลงตะกร้าไม่สำเร็จ");
    }
}

async function removeWishItem(itemId) {
    const res = await fetch(`${WISH_API}/items/${itemId}`, { method: "DELETE" });
    if (!res.ok) {
        const txt = await res.text();
        console.error(txt);
        alert("ลบไม่สำเร็จ");
    }
}

async function clearWishlist() {
    const ok = confirm("ต้องการล้าง Wish-list ทั้งหมดใช่ไหม?");
    if (!ok) return;

    const res = await fetch(WISH_API, { method: "DELETE" });
    if (!res.ok) {
        const txt = await res.text();
        console.error(txt);
        alert("ล้าง Wish-list ไม่สำเร็จ");
        return;
    }

    await loadWishlist();
}

async function addAllToCart() {
    const ok = confirm("เพิ่มสินค้าทั้งหมดไปยังตะกร้าใช่ไหม?");
    if (!ok) return;

    // โหลด wishlist ล่าสุดก่อน
    const wishRes = await fetch(WISH_API);
    const items = await wishRes.json();

    if (!items || items.length === 0) {
        alert("Wish-list ว่างอยู่");
        return;
    }

    // ส่งเข้า cart ทีละรายการ (ให้ชัวร์)
    for (const it of items) {
        const payload = {
            productId: Number(it.productId),
            name: it.name || "",
            price: Number(it.price || 0),
            image: it.image || "",
            size: it.size || "",
            qty: 1,
        };

        const res = await fetch(CART_ITEMS_API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            console.error(await res.text());
        }
    }

    // ล้าง wishlist หลังย้าย
    await fetch(WISH_API, { method: "DELETE" });

    alert("Added all to cart");
    await loadWishlist();
    await updateCartCount();
}

async function updateCartCount() {
    const el = document.getElementById("cart-count");
    if (!el) return;

    try {
        const res = await fetch(CART_API);
        if (!res.ok) throw new Error("GET /api/cart failed");
        const cartItems = await res.json();

        // รวม qty
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
