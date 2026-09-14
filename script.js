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
   18. FIREBASE AUTH - ROOMRENT
   SEHEMU YA 2
========================================================= */


/* =========================================================
   18.1 KUHAKIKI AUTH
========================================================= */

if (!auth) {

    console.error(
        "❌ Firebase Auth haipo."
    );

}


/* =========================================================
   18.2 MESSAGE YA LOGIN
========================================================= */

function onyeshaLoginMessage(message, type = "error") {

    const box =
        getElement("loginMessage");

    if (!box) {
        return;
    }

    box.style.display = "block";

    box.textContent = message;

    if (type === "success") {

        box.style.color = "green";

    } else {

        box.style.color = "red";

    }

}


/* =========================================================
   18.3 CLEAN PHONE / EMAIL
========================================================= */

function safishaEmail(email) {

    return String(email || "")
        .trim()
        .toLowerCase();

}


/* =========================================================
   18.4 JISAJILI
========================================================= */

async function jisajiliRoomRent() {

    const emailInput =
        getElement("loginEmail");

    const passwordInput =
        getElement("loginPassword");


    if (!emailInput || !passwordInput) {

        onyeshaLoginMessage(
            "❌ Sehemu ya Email au Password haijapatikana."
        );

        return;

    }


    const email =
        safishaEmail(
            emailInput.value
        );


    const password =
        String(
            passwordInput.value || ""
        ).trim();


    /* =========================
       VALIDATION
    ========================= */

    if (!email) {

        onyeshaLoginMessage(
            "❌ Tafadhali weka Email yako."
        );

        return;

    }


    if (!password) {

        onyeshaLoginMessage(
            "❌ Tafadhali weka Password yako."
        );

        return;

    }


    if (password.length < 6) {

        onyeshaLoginMessage(
            "❌ Password lazima iwe na angalau herufi/namba 6."
        );

        return;

    }


    if (!auth) {

        onyeshaLoginMessage(
            "❌ Firebase Auth haijapatikana."
        );

        return;

    }


    onyeshaLoginMessage(
        "⏳ Tunatengeneza account yako...",
        "success"
    );


    try {

        /* =========================
           CREATE FIREBASE ACCOUNT
        ========================= */

        const credential =
            await auth.createUserWithEmailAndPassword(
                email,
                password
            );


        const user =
            credential.user;


        if (!user) {

            throw new Error(
                "User hakupatikana baada ya registration."
            );

        }


        /* =========================
           SAVE USER FIRESTORE
        ========================= */

        if (db) {

            await db
                .collection("users")
                .doc(user.uid)
                .set({

                    uid: user.uid,

                    email: user.email,

                    referralCode: "",

                    referredBy: "",

                    totalCommission: 0,

                    totalBookings: 0,

                    createdAt:
                        firebase.firestore.FieldValue.serverTimestamp(),

                    updatedAt:
                        firebase.firestore.FieldValue.serverTimestamp()

                }, {

                    merge: true

                });

        }


        onyeshaLoginMessage(
            "✅ Account yako imetengenezwa kikamilifu!",
            "success"
        );


        alert(
            "🎉 Karibu RoomRent!\n\nAccount yako imetengenezwa."
        );


        /* =========================
           CLEAR PASSWORD
        ========================= */

        passwordInput.value = "";


    } catch (error) {

        console.error(
            "Signup Error:",
            error
        );


        let message =
            "❌ Imeshindikana kutengeneza account.";


        if (
            error.code ===
            "auth/email-already-in-use"
        ) {

            message =
                "❌ Email hii tayari ina account. Tafadhali Ingia.";

        }


        else if (
            error.code ===
            "auth/invalid-email"
        ) {

            message =
                "❌ Email uliyoweka si sahihi.";

        }


        else if (
            error.code ===
            "auth/weak-password"
        ) {

            message =
                "❌ Password ni dhaifu. Tumia angalau herufi/namba 6.";

        }


        else if (
            error.code ===
            "auth/operation-not-allowed"
        ) {

            message =
                "❌ Email/Password Login haijawezeshwa Firebase Console.";

        }


        else if (error.message) {

            message =
                "❌ " + error.message;

        }


        onyeshaLoginMessage(
            message
        );

    }

}


/* =========================================================
   18.5 INGIA
========================================================= */

async function ingiaRoomRent() {

    const emailInput =
        getElement("loginEmail");

    const passwordInput =
        getElement("loginPassword");


    if (!emailInput || !passwordInput) {

        onyeshaLoginMessage(
            "❌ Sehemu ya Email au Password haijapatikana."
        );

        return;

    }


    const email =
        safishaEmail(
            emailInput.value
        );


    const password =
        String(
            passwordInput.value || ""
        ).trim();


    /* =========================
       VALIDATION
    ========================= */

    if (!email) {

        onyeshaLoginMessage(
            "❌ Tafadhali weka Email yako."
        );

        return;

    }


    if (!password) {

        onyeshaLoginMessage(
            "❌ Tafadhali weka Password yako."
        );

        return;

    }


    if (!auth) {

        onyeshaLoginMessage(
            "❌ Firebase Auth haijapatikana."
        );

        return;

    }


    onyeshaLoginMessage(
        "⏳ Tunaingia RoomRent...",
        "success"
    );


    try {

        const credential =
            await auth.signInWithEmailAndPassword(
                email,
                password
            );


        const user =
            credential.user;


        if (!user) {

            throw new Error(
                "User hakupatikana."
            );

        }


        /* =========================
           ENSURE FIRESTORE USER
        ========================= */

        if (db) {

            await db
                .collection("users")
                .doc(user.uid)
                .set({

                    uid: user.uid,

                    email: user.email,

                    updatedAt:
                        firebase.firestore.FieldValue.serverTimestamp()

                }, {

                    merge: true

                });

        }


        onyeshaLoginMessage(
            "✅ Umeingia RoomRent kikamilifu!",
            "success"
        );


        alert(
            "👋 Karibu tena RoomRent!"
        );


        passwordInput.value = "";


        /* =========================
           SHOW ROOMS
        ========================= */

        setTimeout(function() {

            onyeshaVyumba();

        }, 500);


    } catch (error) {

        console.error(
            "Login Error:",
            error
        );


        let message =
            "❌ Imeshindikana kuingia.";


        if (
            error.code ===
            "auth/user-not-found"
        ) {

            message =
                "❌ Email hii haina account.";

        }


        else if (
            error.code ===
            "auth/wrong-password"
        ) {

            message =
                "❌ Password si sahihi.";

        }


        else if (
            error.code ===
            "auth/invalid-credential"
        ) {

            message =
                "❌ Email au Password si sahihi.";

        }


        else if (
            error.code ===
            "auth/invalid-email"
        ) {

            message =
                "❌ Email uliyoweka si sahihi.";

        }


        else if (error.message) {

            message =
                "❌ " + error.message;

        }


        onyeshaLoginMessage(
            message
        );

    }

}


/* =========================================================
   18.6 LOGOUT
========================================================= */

async function tokaRoomRent() {

    if (!auth) {
        return;
    }


    try {

        await auth.signOut();


        onyeshaLoginMessage(
            "✅ Umetoka kwenye account.",
            "success"
        );


        alert(
            "👋 Umetoka RoomRent."
        );


    } catch (error) {

        console.error(
            "Logout Error:",
            error
        );


        alert(
            "❌ Imeshindikana kutoka."
        );

    }

}


/* =========================================================
   18.7 KUANGALIA USER ALIYEINGIA
========================================================= */

if (auth) {

    auth.onAuthStateChanged(
        async function(user) {

            if (user) {

                console.log(
                    "👤 User aliyeingia:",
                    user.email
                );


                console.log(
                    "🆔 UID:",
                    user.uid
                );


                /*
                 * Hapa hatutaficha login section
                 * bado. Tutafanya hivyo kwenye
                 * sehemu inayofuata baada ya mfumo
                 * kuthibitishwa.
                 */


                if (db) {

                    try {

                        await db
                            .collection("users")
                            .doc(user.uid)
                            .set({

                                uid: user.uid,

                                email: user.email,

                                lastLogin:
                                    firebase.firestore.FieldValue.serverTimestamp(),

                                updatedAt:
                                    firebase.firestore.FieldValue.serverTimestamp()

                            }, {

                                merge: true

                            });

                    } catch (error) {

                        console.error(
                            "❌ User Firestore update error:",
                            error
                        );

                    }

                }

            } else {

                console.log(
                    "👤 Hakuna user aliyeingia."
                );

            }

        }
    );

}


/* =========================================================
   18.8 BUTTON EVENTS
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


        /* =========================
           VYUMBA
        ========================= */

        if (angaliaVyumba) {

            angaliaVyumba.addEventListener(
                "click",
                onyeshaVyumba
            );

        }


        /* =========================
           BOOKING
        ========================= */

        if (bookingZangu) {

            bookingZangu.addEventListener(
                "click",
                funguaBookingZangu
            );

        }


        /* =========================
           ACCOUNT
        ========================= */

        if (accountBtn) {

            accountBtn.addEventListener(
                "click",
                funguaAccount
            );

        }


        /* =========================
           TAARIFA
        ========================= */

        if (taarifaBtn) {

            taarifaBtn.addEventListener(
                "click",
                funguaTaarifa
            );

        }


        /* =========================
           WITHDRAWAL
        ========================= */

        if (withdrawalBtn) {

            withdrawalBtn.addEventListener(
                "click",
                funguaWithdrawal
            );

        }


        /* =========================
           SIGN IN
        ========================= */

        if (signInBtn) {

            signInBtn.addEventListener(
                "click",
                ingiaRoomRent
            );

        }


        /* =========================
           SIGN UP
        ========================= */

        if (signUpBtn) {

            signUpBtn.addEventListener(
                "click",
                jisajiliRoomRent
            );

        }


        console.log(
            "✅ RoomRent buttons zote zimeunganishwa."
        );

    }
);


/* =========================================================
   19. MWISHO WA SEHEMU YA 2
========================================================= */

console.log(
    "🔥 ROOMRENT SEHEMU YA 2 IMELOADED."
);



