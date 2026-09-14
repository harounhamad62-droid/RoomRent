/* =========================================================
   ROOMRENT - SCRIPT NZIMA
   SEHEMU YA 1
   =========================================================

   MFUMO:
   - Firebase
   - Firestore
   - Room Data
   - Navigation
   - Basic UI Helpers

   MUHIMU:
   - Hakuna localStorage
   - Hakuna payment demo
   ========================================================= */


/* =========================================================
   1. KUHAKIKI FIREBASE
========================================================= */

if (typeof firebase === "undefined") {

    alert("❌ Firebase haijapakiwa. Tafadhali hakikisha Firebase SDK ipo kwenye HTML.");

} else {

    console.log("✅ Firebase SDK imepatikana.");

}


/* =========================================================
   2. FIREBASE SERVICES
========================================================= */

let auth = null;
let db = null;
let storage = null;


if (typeof firebase !== "undefined") {

    try {

        auth = firebase.auth();
        db = firebase.firestore();

        if (firebase.storage) {
            storage = firebase.storage();
        }

        console.log("✅ Firebase Auth iko tayari.");
        console.log("✅ Firestore iko tayari.");

    } catch (error) {

        console.error(
            "❌ Tatizo la kuanzisha Firebase:",
            error
        );

    }

}


/* =========================================================
   3. ROOMRENT SETTINGS
========================================================= */

const ROOMRENT_SETTINGS = {

    appName: "RoomRent",

    currency: "TSh",

    durationDays: 40,

    adminReferralCode: "RRADMIN",

    paymentMethods: {

        mixx: {
            name: "MIXX BY YAS",
            phone: "0651590936",
            owner: "HARUNA ISSA HAMAD"
        },

        airtel: {
            name: "Airtel Money",
            phone: "0667872515",
            owner: "HARUNA ISSA HAMAD"
        }

    },

    commission: {

        user: {
            A: 5,
            B: 2,
            C: 1
        },

        admin: {
            A: 20,
            B: 10,
            C: 5
        }

    }

};


/* =========================================================
   4. VYUMBA VYA ROOMRENT
========================================================= */

const ROOMRENT_ROOMS = [

    {
        roomNumber: "0023",
        price: 30000,
        profitPerDay: 1000,
        days: 40
    },

    {
        roomNumber: "0024",
        price: 70000,
        profitPerDay: 2333,
        days: 40
    },

    {
        roomNumber: "0025",
        price: 140000,
        profitPerDay: 4666,
        days: 40
    },

    {
        roomNumber: "0026",
        price: 210000,
        profitPerDay: 6993,
        days: 40
    },

    {
        roomNumber: "0027",
        price: 280000,
        profitPerDay: 9324,
        days: 40
    },

    {
        roomNumber: "0028",
        price: 350000,
        profitPerDay: 11655,
        days: 40
    },

    {
        roomNumber: "0029",
        price: 420000,
        profitPerDay: 13986,
        days: 40
    },

    {
        roomNumber: "0030",
        price: 490000,
        profitPerDay: 16317,
        days: 40
    },

    {
        roomNumber: "0031",
        price: 560000,
        profitPerDay: 18648,
        days: 40
    },

    {
        roomNumber: "0032",
        price: 630000,
        profitPerDay: 20979,
        days: 40
    }

];


/* =========================================================
   5. HELPER - MONEY
========================================================= */

function formatMoney(amount) {

    const number = Number(amount) || 0;

    return number.toLocaleString("en-TZ");

}


/* =========================================================
   6. HELPER - GET ELEMENT
========================================================= */

function getElement(id) {

    return document.getElementById(id);

}


/* =========================================================
   7. HELPER - SHOW SECTION
========================================================= */

function showSection(id) {

    const section = getElement(id);

    if (!section) {
        console.warn(
            "Section haijapatikana:",
            id
        );
        return;
    }

    section.style.display = "block";

}


/* =========================================================
   8. HELPER - HIDE SECTION
========================================================= */

function hideSection(id) {

    const section = getElement(id);

    if (!section) {
        return;
    }

    section.style.display = "none";

}


/* =========================================================
   9. FICHA SECTIONS KUBWA
========================================================= */

function hideMainSections() {

    hideSection("vyumba");
    hideSection("fomuKodi");
    hideSection("taarifaSection");

}


/* =========================================================
   10. HOME / VYUMBA
========================================================= */

function onyeshaVyumba() {

    const container = getElement("vyumba");

    if (!container) {

        console.error(
            "❌ Element #vyumba haijapatikana."
        );

        return;

    }


    hideSection("fomuKodi");
    hideSection("taarifaSection");


    container.style.display = "block";


    container.innerHTML = `

        <div class="booking-card">

            <h2>🏠 Vyumba vya RoomRent</h2>

            <p>
                Chagua chumba unachotaka kukodi.
            </p>

        </div>

    `;


    ROOMRENT_ROOMS.forEach(function(room) {

        const totalProfit =
            room.profitPerDay * room.days;


        const card = document.createElement("div");

        card.className = "booking-card";


        card.innerHTML = `

            <h3>
                🏠 Chumba ${room.roomNumber}
            </h3>

            <p>
                💰 Bei:
                <strong>
                    ${formatMoney(room.price)} TSh
                </strong>
            </p>

            <p>
                📈 Faida kwa siku:
                <strong>
                    ${formatMoney(room.profitPerDay)} TSh
                </strong>
            </p>

            <p>
                📅 Muda:
                <strong>
                    ${room.days} siku
                </strong>
            </p>

            <p>
                💵 Faida ya mzunguko:
                <strong>
                    ${formatMoney(totalProfit)} TSh
                </strong>
            </p>

            <button
                class="endeleaBtn"
                onclick="funguaFomuKodi('${room.roomNumber}')"
            >
                🏠 Kodi Chumba
            </button>

        `;


        container.appendChild(card);

    });


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* =========================================================
   11. FOMU YA KODI
========================================================= */

function funguaFomuKodi(roomNumber) {

    const room =
        ROOMRENT_ROOMS.find(function(item) {

            return item.roomNumber === roomNumber;

        });


    if (!room) {

        alert("❌ Chumba hakijapatikana.");

        return;

    }


    hideSection("vyumba");
    hideSection("taarifaSection");


    const form =
        getElement("fomuKodi");


    if (!form) {

        console.error(
            "❌ #fomuKodi haijapatikana."
        );

        return;

    }


    form.style.display = "block";


    form.innerHTML = `

        <div class="booking-card">

            <h2>
                🏠 Kodi Chumba ${room.roomNumber}
            </h2>

            <p>
                💰 Bei:
                <strong>
                    ${formatMoney(room.price)} TSh
                </strong>
            </p>

            <p>
                📅 Muda:
                <strong>
                    ${room.days} siku
                </strong>
            </p>

            <hr>

            <p>
                Mfumo wa booking utaunganishwa
                katika sehemu inayofuata.
            </p>

            <button
                class="endeleaBtn"
                onclick="onyeshaVyumba()"
            >
                ← Rudi Vyumba
            </button>

        </div>

    `;


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* =========================================================
   12. BOOKING ZANGU
========================================================= */

function funguaBookingZangu() {

    hideSection("vyumba");
    hideSection("fomuKodi");


    const section =
        getElement("taarifaSection");


    if (!section) {
        return;
    }


    section.style.display = "block";


    section.innerHTML = `

        <div class="booking-card">

            <h2>📋 Booking Zangu</h2>

            <p>
                Mfumo wa Booking Zangu
                utaunganishwa katika sehemu
                inayofuata.
            </p>

        </div>

    `;


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* =========================================================
   13. ACCOUNT
========================================================= */

function funguaAccount() {

    hideSection("vyumba");
    hideSection("fomuKodi");


    const section =
        getElement("taarifaSection");


    if (!section) {
        return;
    }


    section.style.display = "block";


    section.innerHTML = `

        <div class="booking-card">

            <h2>👤 Account</h2>

            <p>
                Mfumo wa Account utaunganishwa
                katika sehemu inayofuata.
            </p>

        </div>

    `;


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* =========================================================
   14. TAARIFA
========================================================= */

function funguaTaarifa() {

    hideSection("vyumba");
    hideSection("fomuKodi");


    const section =
        getElement("taarifaSection");


    if (!section) {
        return;
    }


    section.style.display = "block";


    section.innerHTML = `

        <div class="booking-card">

            <h2>🔔 Taarifa</h2>

            <p>
                Huna taarifa mpya kwa sasa.
            </p>

        </div>

    `;


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* =========================================================
   15. WITHDRAWAL
========================================================= */

function funguaWithdrawal() {

    hideSection("vyumba");
    hideSection("fomuKodi");


    const section =
        getElement("taarifaSection");


    if (!section) {
        return;
    }


    section.style.display = "block";


    section.innerHTML = `

        <div class="booking-card">

            <h2>💸 Withdrawal</h2>

            <p>
                Mfumo wa withdrawal utaunganishwa
                katika sehemu inayofuata.
            </p>

        </div>

    `;


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* =========================================================
   16. ADMIN LOGIN - OPEN
========================================================= */

function funguaAdmin() {

    const modal =
        getElement("adminLoginModal");


    if (!modal) {
        return;
    }


    modal.style.display = "flex";

}


/* =========================================================
   17. ADMIN LOGIN - CLOSE
========================================================= */

function fungaAdminLogin() {

    const modal =
        getElement("adminLoginModal");


    if (!modal) {
        return;
    }


    modal.style.display = "none";

}


/* =========================================================
   18. BUTTON EVENTS
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        console.log(
            "🚀 RoomRent DOM imekamilika."
        );


        const angaliaVyumba =
            getElement("angaliaVyumba");


        const bookingZangu =
            getElement("bookingZangu");


        const accountBtn =
            getElement("accountBtn");


        const taarifaBtn =
            getElement("taarifaBtn");


        const withdrawalBtn =
            getElement("withdrawalBtn");


        const signInBtn =
            getElement("signInBtn");


        const signUpBtn =
            getElement("signUpBtn");


        if (angaliaVyumba) {

            angaliaVyumba.addEventListener(
                "click",
                onyeshaVyumba
            );

        }


        if (bookingZangu) {

            bookingZangu.addEventListener(
                "click",
                funguaBookingZangu
            );

        }


        if (accountBtn) {

            accountBtn.addEventListener(
                "click",
                funguaAccount
            );

        }


        if (taarifaBtn) {

            taarifaBtn.addEventListener(
                "click",
                funguaTaarifa
            );

        }


        if (withdrawalBtn) {

            withdrawalBtn.addEventListener(
                "click",
                funguaWithdrawal
            );

        }


        if (signInBtn) {

            signInBtn.addEventListener(
                "click",
                function() {

                    alert(
                        "🔐 Mfumo wa Login utaunganishwa sasa."
                    );

                }
            );

        }


        if (signUpBtn) {

            signUpBtn.addEventListener(
                "click",
                function() {

                    alert(
                        "📝 Mfumo wa Jisajili utaunganishwa sasa."
                    );

                }
            );

        }


        console.log(
            "✅ Button events zimeunganishwa."
        );

    }
);


/* =========================================================
   19. MWISHO WA SEHEMU YA 1
========================================================= */

console.log(
    "🏠 ROOMRENT SEHEMU YA 1 IMELOADED."
);
