alert("TEST MPYA YA SCRIPT IMEFIKA!");

document.addEventListener("DOMContentLoaded", function () {

    alert("DOM IMESOMA!");

    const btn = document.getElementById("signUpBtn");

    if (btn) {

        btn.addEventListener("click", function () {

            alert("🟢 JISAJILI INAFANYA KAZI!");

        });

    } else {

        alert("🔴 signUpBtn HAJAPATIKANA!");

    }

});
