document.getElementById("submitOrderButton").addEventListener("click", function () {
    const successIcon = document.getElementById("successIcon");
    const homeButton = document.getElementById("homeButton");

    // แสดงเครื่องหมายถูก
    successIcon.style.display = "block";
    setTimeout(() => {
        successIcon.style.opacity = "1";
        successIcon.style.transform = "translateY(0)";
    }, 100);

    // แสดงปุ่ม HOME
    setTimeout(() => {
        homeButton.style.display = "block";
        homeButton.style.opacity = "1";
        homeButton.style.transform = "translateY(0)";
    }, 600); // เวลาหน่วงหลังจากเครื่องหมายถูก
});
