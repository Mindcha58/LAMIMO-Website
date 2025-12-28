// JavaScript สำหรับควบคุมการทำงานของแท็บ
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



