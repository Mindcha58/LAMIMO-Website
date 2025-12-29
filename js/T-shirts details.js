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

