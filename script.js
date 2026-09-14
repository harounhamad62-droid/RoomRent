alert("SCRIPT.JS INAFANYA KAZI!");

document.addEventListener("DOMContentLoaded", function () {

    const vyumbaBtn = document.getElementById("angaliaVyumba");
    const bookingBtn = document.getElementById("bookingZangu");
    const accountBtn = document.getElementById("accountBtn");
    const taarifaBtn = document.getElementById("taarifaBtn");
    const withdrawalBtn = document.getElementById("withdrawalBtn");
    const signInBtn = document.getElementById("signInBtn");
    const signUpBtn = document.getElementById("signUpBtn");

    if (vyumbaBtn) {
        vyumbaBtn.onclick = function () {
            alert("🏠 BUTTON YA VYUMBA INAFANYA KAZI!");
        };
    }

    if (bookingBtn) {
        bookingBtn.onclick = function () {
            alert("📋 BUTTON YA BOOKING ZANGU INAFANYA KAZI!");
        };
    }

    if (accountBtn) {
        accountBtn.onclick = function () {
            alert("👤 BUTTON YA ACCOUNT INAFANYA KAZI!");
        };
    }

    if (taarifaBtn) {
        taarifaBtn.onclick = function () {
            alert("🔔 BUTTON YA TAARIFA INAFANYA KAZI!");
        };
    }

    if (withdrawalBtn) {
        withdrawalBtn.onclick = function () {
            alert("💸 BUTTON YA WITHDRAWAL INAFANYA KAZI!");
        };
    }

    if (signInBtn) {
        signInBtn.onclick = function () {
            alert("🔐 BUTTON YA INGIA INAFANYA KAZI!");
        };
    }

    if (signUpBtn) {
        signUpBtn.onclick = function () {
            alert("📝 BUTTON YA JISAJILI INAFANYA KAZI!");
        };
    }

});
