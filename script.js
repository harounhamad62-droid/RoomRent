/* =========================================================
   ROOMRENT - SCRIPT NZIMA
   SEHEMU YA 1
   =========================================================

   MFUMO:
   - Firebase Authentication
   - Firestore
   - Email Login
   - Email Sign Up
   - User Account
   - Navigation
   - Notifications msingi
   - Referral system msingi
   - Booking msingi
   - Admin msingi

   IMPORTANT:
   Firebase tayari imeanzishwa ndani ya HTML.
   HATUTUMII localStorage kama database.
========================================================= */


/* =========================================================
   1. FIREBASE SERVICES
========================================================= */

const auth = firebase.auth();
const db = firebase.firestore();


/* =========================================================
   2. ROOMRENT GLOBAL VARIABLES
========================================================= */

let currentUser = null;
let currentUserData = null;

let selectedRoom = null;

let unsubscribeUser = null;
let unsubscribeNotifications = null;

let isAdmin = false;


/* =========================================================
   3. ROOM DATA
========================================================= */

/*
   HAPA NDIPO TUTAWEKA VYUMBA VYOTE.

   Mfumo wa siku/faida utaunganishwa kwenye sehemu
   ya rooms katika sehemu inayofuata.
*/

const rooms = [
    {
        id: "0023",
        price: 30000,
        days: 35,
        profitPerDay: 1000
    },

    {
        id: "0024",
        price: 70000,
        days: 35,
        profitPerDay: 0
    },

    {
        id: "0025",
        price: 140000,
        days: 35,
        profitPerDay: 0
    },

    {
        id: "0026",
        price: 210000,
        days: 35,
        profitPerDay: 0
    },

    {
        id: "0027",
        price: 280000,
        days: 35,
        profitPerDay: 0
    },

    {
        id: "0028",
        price: 350000,
        days: 35,
        profitPerDay: 0
    },

    {
        id: "0029",
        price: 420000,
        days: 35,
        profitPerDay: 0
    },

    {
        id: "0030",
        price: 490000,
        days: 35,
        profitPerDay: 0
    },

    {
        id: "0031",
        price: 560000,
        days: 35,
        profitPerDay: 0
    },

    {
        id: "0032",
        price: 630000,
        days: 35,
        profitPerDay: 0
    }
];


/* =========================================================
   4. REFERRAL COMMISSION SETTINGS
========================================================= */

const USER_COMMISSION = {
    A: 5,
    B: 2,
    C: 1
};


const ADMIN_COMMISSION = {
    A: 20,
    B: 10,
    C: 5
};


const ADMIN_REFERRAL_CODE = "RRADMIN";


/* =========================================================
   5. PAYMENT SETTINGS
========================================================= */

const PAYMENT_METHODS = {

    AIRTEL_MONEY: {
        name: "Airtel Money",
        number: ""
    },

    MIXX_BY_YAS: {
        name: "MIXX BY YAS",
        number: ""
    }

};


/* =========================================================
   6. HELPER FUNCTIONS
========================================================= */


/* Format Tanzania phone */

function formatTanzaniaPhone(phone) {

    if (!phone) {
        return "";
    }

    phone = String(phone).trim();

    phone = phone.replace(/\s+/g, "");
    phone = phone.replace(/-/g, "");

    if (phone.startsWith("+255")) {
        return phone;
    }

    if (phone.startsWith("255")) {
        return "+" + phone;
    }

    if (phone.startsWith("0")) {
        return "+255" + phone.substring(1);
    }

    return phone;
}


/* Format money */

function formatMoney(amount) {

    amount = Number(amount) || 0;

    return new Intl.NumberFormat("sw-TZ").format(amount) + " TSh";
}


/* Generate referral code */

function generateReferralCode(name = "USER") {

    let cleanName = String(name)
        .toUpperCase()
        .replace(/[^A-Z]/g, "")
        .substring(0, 4);

    if (!cleanName) {
        cleanName = "USER";
    }

    const randomNumber =
        Math.floor(1000 + Math.random() * 9000);

    return cleanName + randomNumber;
}


/* Generate booking number */

function generateBookingNumber() {

    return "RR" + Date.now().toString().slice(-8);

}


/* Show message */

function showMessage(elementId, message, type = "info") {

    const element =
        document.getElementById(elementId);

    if (!element) {
        return;
    }

    element.style.display = "block";

    element.textContent = message;

    if (type === "error") {

        element.style.color = "red";

    } else if (type === "success") {

        element.style.color = "green";

    } else {

        element.style.color = "";

    }

}


/* Hide element */

function hideElement(elementId) {

    const element =
        document.getElementById(elementId);

    if (!element) {
        return;
    }

    element.style.display = "none";

}


/* Show element */

function showElement(elementId) {

    const element =
        document.getElementById(elementId);

    if (!element) {
        return;
    }

    element.style.display = "block";

}


/* =========================================================
   7. MAIN NAVIGATION
========================================================= */

function hideAllMainSections() {

    const vyumba =
        document.getElementById("vyumba");

    const fomuKodi =
        document.getElementById("fomuKodi");

    const taarifa =
        document.getElementById("taarifaSection");


    if (vyumba) {
        vyumba.style.display = "none";
    }

    if (fomuKodi) {
        fomuKodi.style.display = "none";
    }

    if (taarifa) {
        taarifa.style.display = "none";
    }

}


/* Show rooms */

function funguaVyumba() {

    hideAllMainSections();

    const container =
        document.getElementById("vyumba");

    if (!container) {
        return;
    }

    container.style.display = "block";

    onyeshaVyumba();

}


/* =========================================================
   8. ROOMS DISPLAY
========================================================= */

function onyeshaVyumba() {

    const container =
        document.getElementById("vyumba");

    if (!container) {
        return;
    }


    container.innerHTML = `

        <div class="booking-card">

            <h2>🏠 Vyumba vya RoomRent</h2>

            <p>
                Chagua chumba unachotaka kukodi.
            </p>

        </div>

    `;


    rooms.forEach(room => {

        const card =
            document.createElement("div");

        card.className = "booking-card";


        card.innerHTML = `

            <h3>
                🏠 Chumba ${room.id}
            </h3>

            <p>
                💰 Bei:
                <strong>
                    ${formatMoney(room.price)}
                </strong>
            </p>

            <p>
                📅 Muda:
                <strong>
                    ${room.days} siku
                </strong>
            </p>

            <p>
                💵 Faida kwa siku:
                <strong>
                    ${formatMoney(room.profitPerDay)}
                </strong>
            </p>

            <button
                class="thibitishaBtn"
                onclick="funguaFomuKodi('${room.id}')"
            >
                🏠 Kodi Chumba
            </button>

        `;


        container.appendChild(card);

    });

}


/* =========================================================
   9. BOOKING FORM
========================================================= */

function funguaFomuKodi(roomId) {

    const room =
        rooms.find(r => r.id === String(roomId));


    if (!room) {

        alert("Chumba hakijapatikana.");

        return;
    }


    selectedRoom = room;


    hideAllMainSections();


    const form =
        document.getElementById("fomuKodi");


    if (!form) {
        return;
    }


    form.style.display = "block";


    form.innerHTML = `

        <div class="booking-card">

            <h2>
                🏠 Booking Chumba ${room.id}
            </h2>

            <p>
                Bei:
                <strong>
                    ${formatMoney(room.price)}
                </strong>
            </p>

            <p>
                Muda:
                <strong>
                    ${room.days} siku
                </strong>
            </p>

            <p>
                Faida kwa siku:
                <strong>
                    ${formatMoney(room.profitPerDay)}
                </strong>
            </p>


            <input
                type="text"
                id="bookingName"
                placeholder="Jina lako"
            >


            <input
                type="tel"
                id="bookingPhone"
                placeholder="Namba ya simu"
            >


            <input
                type="text"
                id="bookingReferral"
                placeholder="Referral Code (optional)"
            >


            <select id="bookingPaymentMethod">

                <option value="">
                    Chagua njia ya malipo
                </option>

                <option value="Airtel Money">
                    Airtel Money
                </option>

                <option value="MIXX BY YAS">
                    MIXX BY YAS
                </option>

            </select>


            <button
                class="thibitishaBtn"
                onclick="tengenezaBooking()"
            >

                🧾 Endelea na Booking

            </button>


            <button
                class="endeleaBtn"
                onclick="funguaVyumba()"
            >

                ↩️ Rudi Vyumba

            </button>


            <p id="bookingMessage"></p>

        </div>

    `;


    if (currentUserData) {

        const nameInput =
            document.getElementById("bookingName");

        const phoneInput =
            document.getElementById("bookingPhone");


        if (nameInput && currentUserData.name) {
            nameInput.value =
                currentUserData.name;
        }


        if (phoneInput && currentUserData.phone) {
            phoneInput.value =
                currentUserData.phone;
        }

    }

}


/* =========================================================
   10. AUTH STATE
========================================================= */

auth.onAuthStateChanged(async user => {

    currentUser = user;


    if (!user) {

        currentUserData = null;

        isAdmin = false;

        console.log(
            "RoomRent: Hakuna user aliyeingia."
        );

        return;
    }


    console.log(
        "RoomRent: User logged in:",
        user.uid
    );


    await loadCurrentUser();


    if (typeof funguaVyumba === "function") {

        funguaVyumba();

    }

});


/* =========================================================
   11. LOAD CURRENT USER
========================================================= */

async function loadCurrentUser() {

    if (!currentUser) {
        return;
    }


    try {

        const userRef =
            db.collection("users")
              .doc(currentUser.uid);


        const snapshot =
            await userRef.get();


        if (snapshot.exists) {

            currentUserData =
                snapshot.data();

        } else {

            currentUserData = {

                uid: currentUser.uid,

                email:
                    currentUser.email || "",

                name:
                    currentUser.displayName || "",

                phone: "",

                referralCode:
                    generateReferralCode(
                        currentUser.displayName ||
                        "USER"
                    ),

                referredBy: "",

                totalCommission: 0,

                totalBookings: 0

            };


            await userRef.set(
                currentUserData,
                { merge: true }
            );

        }


        if (
            currentUserData.role === "admin"
        ) {

            isAdmin = true;

        } else {

            isAdmin = false;

        }


        console.log(
            "RoomRent user:",
            currentUserData
        );


    } catch (error) {

        console.error(
            "loadCurrentUser error:",
            error
        );

    }

}


/* =========================================================
   12. EMAIL SIGN UP
========================================================= */

async function signUpUser() {

    const email =
        document
            .getElementById("loginEmail")
            ?.value
            .trim();


    const password =
        document
            .getElementById("loginPassword")
            ?.value;


    if (!email || !password) {

        showMessage(
            "loginMessage",
            "❌ Weka Email na Password.",
            "error"
        );

        return;
    }


    if (password.length < 6) {

        showMessage(
            "loginMessage",
            "❌ Password iwe na angalau herufi/namba 6.",
            "error"
        );

        return;
    }


    try {

        showMessage(
            "loginMessage",
            "⏳ Tunatengeneza account..."
        );


        const result =
            await auth.createUserWithEmailAndPassword(
                email,
                password
            );


        const user =
            result.user;


        const referralCode =
            generateReferralCode(
                email.split("@")[0]
            );


        await db
            .collection("users")
            .doc(user.uid)
            .set({

                uid: user.uid,

                email: user.email,

                name:
                    email.split("@")[0],

                phone: "",

                referralCode:
                    referralCode,

                referredBy: "",

                totalCommission: 0,

                totalBookings: 0,

                role: "user",

                createdAt:
                    firebase.firestore.FieldValue.serverTimestamp(),

                updatedAt:
                    firebase.firestore.FieldValue.serverTimestamp()

            }, {
                merge: true
            });


        showMessage(
            "loginMessage",
            "✅ Account imetengenezwa. Karibu RoomRent!",
            "success"
        );


        currentUser =
            user;


        await loadCurrentUser();


    } catch (error) {

        console.error(
            "Sign up error:",
            error
        );


        showMessage(
            "loginMessage",
            "❌ " + firebaseErrorMessage(error),
            "error"
        );

    }

}


/* =========================================================
   13. EMAIL SIGN IN
========================================================= */

async function signInUser() {

    const email =
        document
            .getElementById("loginEmail")
            ?.value
            .trim();


    const password =
        document
            .getElementById("loginPassword")
            ?.value;


    if (!email || !password) {

        showMessage(
            "loginMessage",
            "❌ Weka Email na Password.",
            "error"
        );

        return;
    }


    try {

        showMessage(
            "loginMessage",
            "⏳ Tunaingia..."
        );


        const result =
            await auth.signInWithEmailAndPassword(
                email,
                password
            );


        currentUser =
            result.user;


        await loadCurrentUser();


        showMessage(
            "loginMessage",
            "✅ Umefanikiwa kuingia RoomRent.",
            "success"
        );


        funguaVyumba();


    } catch (error) {

        console.error(
            "Sign in error:",
            error
        );


        showMessage(
            "loginMessage",
            "❌ " + firebaseErrorMessage(error),
            "error"
        );

    }

}


/* =========================================================
   14. SIGN OUT
========================================================= */

async function signOutUser() {

    try {

        await auth.signOut();

        currentUser = null;

        currentUserData = null;

        isAdmin = false;


        alert(
            "Umetoka kwenye account."
        );


    } catch (error) {

        console.error(
            "Sign out error:",
            error
        );

    }

}


/* =========================================================
   15. FIREBASE ERROR MESSAGE
========================================================= */

function firebaseErrorMessage(error) {

    if (!error) {
        return "Kuna tatizo lisilojulikana.";
    }


    switch (error.code) {

        case "auth/email-already-in-use":
            return "Email hii tayari imetumika.";

        case "auth/invalid-email":
            return "Email si sahihi.";

        case "auth/weak-password":
            return "Password ni dhaifu. Tumia angalau herufi/namba 6.";

        case "auth/user-not-found":
            return "Account haijapatikana.";

        case "auth/wrong-password":
            return "Password si sahihi.";

        case "auth/invalid-credential":
            return "Email au Password si sahihi.";

        case "auth/too-many-requests":
            return "Umejaribu mara nyingi. Jaribu tena baadaye.";

        default:
            return error.message ||
                "Kuna tatizo limetokea.";

    }

}


/* =========================================================
   16. BUTTON EVENTS
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {


        /* Vyumba */

        const roomsButton =
            document.getElementById(
                "angaliaVyumba"
            );


        if (roomsButton) {

            roomsButton.addEventListener(
                "click",
                funguaVyumba
            );

        }


        /* Booking Zangu */

        const bookingButton =
            document.getElementById(
                "bookingZangu"
            );


        if (bookingButton) {

            bookingButton.addEventListener(
                "click",
                funguaBookingZangu
            );

        }


        /* Account */

        const accountButton =
            document.getElementById(
                "accountBtn"
            );


        if (accountButton) {

            accountButton.addEventListener(
                "click",
                funguaAccount
            );

        }


        /* Taarifa */

        const notificationButton =
            document.getElementById(
                "taarifaBtn"
            );


        if (notificationButton) {

            notificationButton.addEventListener(
                "click",
                funguaTaarifa
            );

        }


        /* Withdrawal */

        const withdrawalButton =
            document.getElementById(
                "withdrawalBtn"
            );


        if (withdrawalButton) {

            withdrawalButton.addEventListener(
                "click",
                funguaWithdrawal
            );

        }


        /* Sign In */

        const signInButton =
            document.getElementById(
                "signInBtn"
            );


        if (signInButton) {

            signInButton.addEventListener(
                "click",
                signInUser
            );

        }


        /* Sign Up */

        const signUpButton =
            document.getElementById(
                "signUpBtn"
            );


        if (signUpButton) {

            signUpButton.addEventListener(
                "click",
                signUpUser
            );

        }


        console.log(
            "RoomRent buttons zimefungwa."
        );

    }
);


/* =========================================================
   17. PLACEHOLDER FUNCTIONS
   ========================================================= */

function funguaBookingZangu() {

    if (!currentUser) {

        alert(
            "Tafadhali ingia kwenye account kwanza."
        );

        return;
    }


    hideAllMainSections();


    const section =
        document.getElementById(
            "taarifaSection"
        );


    if (!section) {
        return;
    }


    section.style.display = "block";


    section.innerHTML = `

        <div class="booking-card">

            <h2>
                📋 Booking Zangu
            </h2>

            <p>
                ⏳ Sehemu hii itaunganishwa
                na Firestore kwenye sehemu inayofuata.
            </p>

        </div>

    `;

}


function funguaAccount() {

    if (!currentUser) {

        alert(
            "Tafadhali ingia kwenye account kwanza."
        );

        return;
    }


    hideAllMainSections();


    const section =
        document.getElementById(
            "taarifaSection"
        );


    if (!section) {
        return;
    }


    section.style.display = "block";


    section.innerHTML = `

        <div class="booking-card">

            <h2>
                👤 Account
            </h2>

            <p>
                📧 Email:
                ${currentUser.email || "-"}
            </p>

            <p>
                👤 Jina:
                ${currentUserData?.name || "-"}
            </p>

            <p>
                🔗 Referral Code:
                <strong>
                    ${currentUserData?.referralCode || "-"}
                </strong>
            </p>

            <button
                class="thibitishaBtn"
                onclick="signOutUser()"
            >
                🚪 Toka kwenye Account
            </button>

        </div>

    `;

}


function funguaTaarifa() {

    if (!currentUser) {

        alert(
            "Tafadhali ingia kwenye account kwanza."
        );

        return;
    }


    hideAllMainSections();


    const section =
        document.getElementById(
            "taarifaSection"
        );


    if (!section) {
        return;
    }


    section.style.display = "block";


    section.innerHTML = `

        <div class="booking-card">

            <h2>
                🔔 Taarifa
            </h2>

            <p>
                Hakuna taarifa mpya kwa sasa.
            </p>

        </div>

    `;

}


function funguaWithdrawal() {

    if (!currentUser) {

        alert(
            "Tafadhali ingia kwenye account kwanza."
        );

        return;
    }


    hideAllMainSections();


    const section =
        document.getElementById(
            "taarifaSection"
        );


    if (!section) {
        return;
    }


    section.style.display = "block";


    section.innerHTML = `

        <div class="booking-card">

            <h2>
                💸 Withdrawal
            </h2>

            <p>
                Withdrawal itaunganishwa
                na mfumo wa commission
                kwenye sehemu inayofuata.
            </p>

            <p>
                💰 Commission yako:
                <strong>
                    ${formatMoney(
                        currentUserData?.totalCommission || 0
                    )}
                </strong>
            </p>

        </div>

    `;

}


/* =========================================================
   18. BOOKING FUNCTION PLACEHOLDER
========================================================= */

async function tengenezaBooking() {

    if (!currentUser) {

        showMessage(
            "bookingMessage",
            "❌ Tafadhali ingia kwenye account kwanza.",
            "error"
        );

        return;
    }


    if (!selectedRoom) {

        showMessage(
            "bookingMessage",
            "❌ Chumba hakijachaguliwa.",
            "error"
        );

        return;
    }


    const name =
        document
            .getElementById("bookingName")
            ?.value
            .trim();


    const phone =
        document
            .getElementById("bookingPhone")
            ?.value
            .trim();


    const referralCode =
        document
            .getElementById("bookingReferral")
            ?.value
            .trim()
            .toUpperCase();


    const paymentMethod =
        document
            .getElementById(
                "bookingPaymentMethod"
            )
            ?.value;


    if (!name || !phone) {

        showMessage(
            "bookingMessage",
            "❌ Jaza jina na namba ya simu.",
            "error"
        );

        return;
    }


    if (!paymentMethod) {

        showMessage(
            "bookingMessage",
            "❌ Chagua njia ya malipo.",
            "error"
        );

        return;
    }


    try {

        showMessage(
            "bookingMessage",
            "⏳ Tunatengeneza booking..."
        );


        const bookingNumber =
            generateBookingNumber();


        const bookingData = {

            bookingNumber:

                bookingNumber,

            uid:
                currentUser.uid,

            name:
                name,

            email:
                currentUser.email || "",

            phone:
                formatTanzaniaPhone(phone),

            roomId:
                selectedRoom.id,

            roomPrice:
                selectedRoom.price,

            durationDays:
                selectedRoom.days,

            profitPerDay:
                selectedRoom.profitPerDay,

            referralCode:
                referralCode || "",

            paymentMethod:
                paymentMethod,

            paymentStatus:
                "Pending",

            status:
                "Pending",

            createdAt:
                firebase.firestore.FieldValue.serverTimestamp(),

            updatedAt:
                firebase.firestore.FieldValue.serverTimestamp()

        };


        await db
            .collection("bookings")
            .doc(bookingNumber)
            .set(bookingData);


        await db
            .collection("users")
            .doc(currentUser.uid)
            .set({

                totalBookings:
                    firebase.firestore.FieldValue.increment(1),

                updatedAt:
                    firebase.firestore.FieldValue.serverTimestamp()

            }, {
                merge: true
            });


        showMessage(
            "bookingMessage",
            "✅ Booking imetengenezwa: " +
            bookingNumber,
            "success"
        );


        console.log(
            "Booking created:",
            bookingData
        );


    } catch (error) {

        console.error(
            "Booking error:",
            error
        );


        showMessage(
            "bookingMessage",
            "❌ " + error.message,
            "error"
        );

    }

}


/* =========================================================
   19. ADMIN FUNCTIONS
========================================================= */

function funguaAdmin() {

    const modal =
        document.getElementById(
            "adminLoginModal"
        );


    if (!modal) {
        return;
    }


    modal.style.display = "flex";

}


function fungaAdminLogin() {

    const modal =
        document.getElementById(
            "adminLoginModal"
        );


    if (!modal) {
        return;
    }


    modal.style.display = "none";

}


/* =========================================================
   20. ADMIN LOGIN
========================================================= */

async function adminLogin() {

    const username =
        document
            .getElementById("adminUsername")
            ?.value
            .trim();


    const password =
        document
            .getElementById("adminPassword")
            ?.value;


    const message =
        document.getElementById(
            "adminLoginMessage"
        );


    if (!username || !password) {

        if (message) {

            message.style.display = "block";

            message.textContent =
                "❌ Weka Username na Password.";

        }

        return;
    }


    /*
       Admin halisi ataunganishwa
       na Firebase Auth + Firestore
       kwenye sehemu ya Admin.
    */

    if (message) {

        message.style.display = "block";

        message.style.color = "orange";

        message.textContent =
            "⏳ Mfumo wa Admin unaandaliwa...";

    }

}


/* =========================================================
   21. END OF SEHEMU YA 1
========================================================= */
/* =========================================================
   ROOMRENT - SCRIPT NZIMA
   SEHEMU YA 2
   =========================================================

   MFUMO WA:
   - ROOM DATA
   - PROFIT CALCULATION
   - REAL PAYMENT DETAILS
   - BOOKING
   - PAYMENT REQUEST
   - FIRESTORE
   - WAITING CONFIRMATION

   PAYMENT RECEIVING NUMBERS:

   MIXX BY YAS
   0651590936
   HARUNA ISSA HAMAD

   AIRTEL MONEY
   0667872515
   HARUNA ISSA HAMAD

========================================================= */


/* =========================================================
   22. ROOM PROFIT SYSTEM
========================================================= */

/*
   Mfumo wa sasa:

   Chumba 0023:
   Bei = 30,000
   Faida = 1,000 kwa siku
   Muda = 40 siku

   Vyumba vingine:
   Faida ya siku inahesabiwa kwa kiwango cha
   takribani 3.33% ya bei ya chumba kwa siku.

   Tunatumia Math.round ili kupata kiasi cha TSh
   kinachoweza kutumika kwenye malipo.
*/


function calculateProfitPerDay(price, roomId) {

    price = Number(price) || 0;


    /* Chumba cha kwanza */

    if (String(roomId) === "0023") {

        return 1000;

    }


    /* 3.33% kwa siku */

    return Math.round(
        price * 0.0333
    );

}


/* =========================================================
   23. UPDATE ROOM DATA
========================================================= */

/*
   Tunarekebisha rooms zilizotengenezwa SEHEMU YA 1
   bila kuandika data nyingine tofauti.
*/

if (Array.isArray(rooms)) {

    rooms.forEach(room => {

        room.profitPerDay =
            calculateProfitPerDay(
                room.price,
                room.id
            );


        if (String(room.id) === "0023") {

            room.days = 40;

        } else {

            room.days = 35;

        }

    });

}


/* =========================================================
   24. CALCULATE TOTAL PROFIT
========================================================= */

function calculateTotalProfit(room) {

    if (!room) {
        return 0;
    }


    const dailyProfit =
        Number(room.profitPerDay) || 0;


    const days =
        Number(room.days) || 0;


    return dailyProfit * days;

}


/* =========================================================
   25. REAL ROOM PAYMENT SETTINGS
========================================================= */

const REAL_PAYMENT_DETAILS = {

    "MIXX BY YAS": {

        name: "MIXX BY YAS",

        number: "0651590936",

        accountName: "HARUNA ISSA HAMAD"

    },


    "Airtel Money": {

        name: "Airtel Money",

        number: "0667872515",

        accountName: "HARUNA ISSA HAMAD"

    }

};


/* =========================================================
   26. GET PAYMENT DETAILS
========================================================= */

function getPaymentDetails(method) {

    if (
        !method ||
        !REAL_PAYMENT_DETAILS[method]
    ) {

        return null;

    }


    return REAL_PAYMENT_DETAILS[method];

}


/* =========================================================
   27. PAYMENT METHOD HTML
========================================================= */

function paymentMethodOptions() {

    return `

        <option value="">
            Chagua njia ya malipo
        </option>

        <option value="MIXX BY YAS">
            MIXX BY YAS
        </option>

        <option value="Airtel Money">
            Airtel Money
        </option>

    `;

}


/* =========================================================
   28. SHOW REAL PAYMENT INSTRUCTIONS
========================================================= */

function onyeshaMaelekezoMalipo(method) {

    const container =
        document.getElementById(
            "paymentInstructions"
        );


    if (!container) {
        return;
    }


    const payment =
        getPaymentDetails(method);


    if (!payment) {

        container.innerHTML = "";

        return;

    }


    container.innerHTML = `

        <div
            class="booking-card"
            style="
                margin-top:15px;
                border:2px solid #ddd;
            "
        >

            <h3>
                💳 Lipa kupitia ${payment.name}
            </h3>

            <p>
                <strong>
                    Jina la akaunti:
                </strong>
                ${payment.accountName}
            </p>

            <p>
                <strong>
                    Namba ya malipo:
                </strong>
            </p>

            <h2
                style="
                    text-align:center;
                    letter-spacing:2px;
                "
            >
                ${payment.number}
            </h2>

            <p>
                Tafadhali lipa kiasi cha:
            </p>

            <h2
                style="text-align:center;"
            >
                ${formatMoney(
                    selectedRoom
                        ? selectedRoom.price
                        : 0
                )}
            </h2>

            <p>
                Baada ya kufanya malipo,
                weka namba uliyotumia kulipia
                hapa chini.
            </p>

        </div>

    `;

}


/* =========================================================
   29. UPDATED BOOKING FORM
========================================================= */

function funguaFomuKodi(roomId) {

    const room =
        rooms.find(
            r => String(r.id) === String(roomId)
        );


    if (!room) {

        alert(
            "❌ Chumba hakijapatikana."
        );

        return;

    }


    selectedRoom = room;


    hideAllMainSections();


    const form =
        document.getElementById(
            "fomuKodi"
        );


    if (!form) {
        return;
    }


    form.style.display = "block";


    const totalProfit =
        calculateTotalProfit(room);


    form.innerHTML = `

        <div class="booking-card">

            <h2>
                🏠 Booking Chumba ${room.id}
            </h2>


            <p>
                💰 Bei ya chumba:
                <strong>
                    ${formatMoney(room.price)}
                </strong>
            </p>


            <p>
                📅 Muda:
                <strong>
                    ${room.days} siku
                </strong>
            </p>


            <p>
                💵 Faida kwa siku:
                <strong>
                    ${formatMoney(room.profitPerDay)}
                </strong>
            </p>


            <p>
                💰 Jumla ya faida:
                <strong>
                    ${formatMoney(totalProfit)}
                </strong>
            </p>


            <hr>


            <h3>
                👤 Taarifa za Booking
            </h3>


            <input
                type="text"
                id="bookingName"
                placeholder="Jina lako"
                autocomplete="name"
            >


            <input
                type="tel"
                id="bookingPhone"
                placeholder="Namba yako ya simu"
                autocomplete="tel"
            >


            <input
                type="text"
                id="bookingReferral"
                placeholder="Referral Code (optional)"
            >


            <h3>
                💳 Njia ya Malipo
            </h3>


            <select
                id="bookingPaymentMethod"
                onchange="onyeshaMaelekezoMalipo(this.value)"
            >

                ${paymentMethodOptions()}

            </select>


            <div
                id="paymentInstructions"
            ></div>


            <input
                type="tel"
                id="paymentPhone"
                placeholder="Namba uliyotumia kufanya malipo"
                autocomplete="tel"
            >


            <p
                style="
                    font-size:14px;
                    color:#555;
                "
            >
                ⚠️ Hakikisha umefanya malipo
                kabla ya kutuma ombi la uthibitisho.
            </p>


            <button
                class="thibitishaBtn"
                onclick="tengenezaBooking()"
            >
                💳 Nimefanya Malipo
            </button>


            <button
                class="endeleaBtn"
                onclick="funguaVyumba()"
            >
                ↩️ Rudi Vyumba
            </button>


            <p
                id="bookingMessage"
            ></p>

        </div>

    `;


    if (currentUserData) {

        const nameInput =
            document.getElementById(
                "bookingName"
            );


        const phoneInput =
            document.getElementById(
                "bookingPhone"
            );


        if (
            nameInput &&
            currentUserData.name
        ) {

            nameInput.value =
                currentUserData.name;

        }


        if (
            phoneInput &&
            currentUserData.phone
        ) {

            phoneInput.value =
                currentUserData.phone;

        }

    }

}


/* =========================================================
   30. VALIDATE PAYMENT PHONE
========================================================= */

function validatePaymentPhone(phone) {

    const formatted =
        formatTanzaniaPhone(phone);


    if (!formatted) {
        return false;
    }


    /*
       Tanzania mobile numbers baada ya
       formatting zinatakiwa kuwa na
       +255XXXXXXXXX
    */

    return /^\+255\d{9}$/.test(
        formatted
    );

}


/* =========================================================
   31. CHECK REFERRAL CODE
========================================================= */

async function findReferralUser(referralCode) {

    if (!referralCode) {

        return null;

    }


    referralCode =
        String(referralCode)
            .trim()
            .toUpperCase();


    /*
       Admin referral
    */

    if (
        referralCode ===
        ADMIN_REFERRAL_CODE
    ) {

        return {

            type: "admin",

            referralCode:
                ADMIN_REFERRAL_CODE

        };

    }


    try {

        const snapshot =
            await db
                .collection("users")
                .where(
                    "referralCode",
                    "==",
                    referralCode
                )
                .limit(1)
                .get();


        if (
            snapshot.empty
        ) {

            return null;

        }


        const doc =
            snapshot.docs[0];


        return {

            type: "user",

            uid: doc.id,

            ...doc.data()

        };


    } catch (error) {

        console.error(
            "findReferralUser error:",
            error
        );


        throw error;

    }

}


/* =========================================================
   32. CREATE PAYMENT REQUEST
========================================================= */

async function createPaymentRequest(
    bookingData,
    paymentPhone
) {

    if (!currentUser) {

        throw new Error(
            "User hajaingia kwenye account."
        );

    }


    if (!bookingData) {

        throw new Error(
            "Booking data haipo."
        );

    }


    const paymentId =
        "PAY" +
        Date.now().toString();


    const paymentData = {

        paymentId:

            paymentId,

        bookingNumber:

            bookingData.bookingNumber,

        uid:

            currentUser.uid,

        customerName:

            bookingData.name,

        customerEmail:

            bookingData.email,

        customerPhone:

            bookingData.phone,

        paymentPhone:

            formatTanzaniaPhone(
                paymentPhone
            ),

        paymentMethod:

            bookingData.paymentMethod,

        receivingNumber:

            REAL_PAYMENT_DETAILS[
                bookingData.paymentMethod
            ].number,

        receivingName:

            REAL_PAYMENT_DETAILS[
                bookingData.paymentMethod
            ].accountName,

        amount:

            Number(
                bookingData.roomPrice
            ),

        roomId:

            bookingData.roomId,

        status:

            "Waiting Confirmation",

        createdAt:

            firebase.firestore
                .FieldValue
                .serverTimestamp(),

        updatedAt:

            firebase.firestore
                .FieldValue
                .serverTimestamp()

    };


    await db
        .collection("paymentRequests")
        .doc(paymentId)
        .set(paymentData);


    return {

        paymentId:
            paymentId,

        ...paymentData

    };

}


/* =========================================================
   33. CREATE CUSTOMER NOTIFICATION
========================================================= */

async function createNotification(
    uid,
    title,
    message,
    type = "info"
) {

    if (!uid) {
        return;
    }


    const notificationRef =
        db
            .collection("users")
            .doc(uid)
            .collection("notifications")
            .doc();


    await notificationRef.set({

        title:

            title,

        message:

            message,

        type:

            type,

        read:

            false,

        createdAt:

            firebase.firestore
                .FieldValue
                .serverTimestamp()

    });

}


/* =========================================================
   34. CREATE BOOKING + PAYMENT REQUEST
========================================================= */

async function tengenezaBooking() {

    if (!currentUser) {

        showMessage(
            "bookingMessage",
            "❌ Tafadhali ingia kwenye account kwanza.",
            "error"
        );

        return;

    }


    if (!selectedRoom) {

        showMessage(
            "bookingMessage",
            "❌ Chumba hakijachaguliwa.",
            "error"
        );

        return;

    }


    const name =
        document
            .getElementById(
                "bookingName"
            )
            ?.value
            .trim();


    const phone =
        document
            .getElementById(
                "bookingPhone"
            )
            ?.value
            .trim();


    const referralCode =
        document
            .getElementById(
                "bookingReferral"
            )
            ?.value
            .trim()
            .toUpperCase();


    const paymentMethod =
        document
            .getElementById(
                "bookingPaymentMethod"
            )
            ?.value;


    const paymentPhone =
        document
            .getElementById(
                "paymentPhone"
            )
            ?.value
            .trim();


    /* =========================
       VALIDATION
    ========================= */


    if (!name) {

        showMessage(
            "bookingMessage",
            "❌ Weka jina lako.",
            "error"
        );

        return;

    }


    if (
        !validatePaymentPhone(phone)
    ) {

        showMessage(
            "bookingMessage",
            "❌ Weka namba yako ya simu ya Tanzania kwa usahihi.",
            "error"
        );

        return;

    }


    if (!paymentMethod) {

        showMessage(
            "bookingMessage",
            "❌ Chagua njia ya malipo.",
            "error"
        );

        return;

    }


    if (
        !validatePaymentPhone(
            paymentPhone
        )
    ) {

        showMessage(
            "bookingMessage",
            "❌ Weka namba uliyotumia kufanya malipo.",
            "error"
        );

        return;

    }


    const paymentDetails =
        getPaymentDetails(
            paymentMethod
        );


    if (!paymentDetails) {

        showMessage(
            "bookingMessage",
            "❌ Njia ya malipo haijatambuliwa.",
            "error"
        );

        return;

    }


    try {

        showMessage(
            "bookingMessage",
            "⏳ Tunathibitisha taarifa zako..."
        );


        /* =========================
           REFERRAL VALIDATION
        ========================= */


        let referralUser = null;


        if (referralCode) {

            referralUser =
                await findReferralUser(
                    referralCode
                );


            if (!referralUser) {

                showMessage(
                    "bookingMessage",
                    "❌ Referral Code si sahihi.",
                    "error"
                );

                return;

            }


            /*
               User hawezi kujirefer mwenyewe.
            */

            if (
                referralUser.type === "user" &&
                referralUser.uid ===
                    currentUser.uid
            ) {

                showMessage(
                    "bookingMessage",
                    "❌ Huwezi kutumia Referral Code yako mwenyewe.",
                    "error"
                );

                return;

            }

        }


        /* =========================
           BOOKING NUMBER
        ========================= */

        const bookingNumber =
            generateBookingNumber();


        /* =========================
           BOOKING DATA
        ========================= */

        const bookingData = {

            bookingNumber:

                bookingNumber,

            uid:

                currentUser.uid,

            name:

                name,

            email:

                currentUser.email || "",

            phone:

                formatTanzaniaPhone(
                    phone
                ),

            roomId:

                selectedRoom.id,

            roomPrice:

                Number(
                    selectedRoom.price
                ),

            durationDays:

                Number(
                    selectedRoom.days
                ),

            profitPerDay:

                Number(
                    selectedRoom.profitPerDay
                ),

            totalProfit:

                calculateTotalProfit(
                    selectedRoom
                ),

            referralCode:

                referralCode || "",

            referredByUid:

                referralUser &&
                referralUser.type === "user"
                    ? referralUser.uid
                    : "",

            paymentMethod:

                paymentMethod,

            paymentReceivingNumber:

                paymentDetails.number,

            paymentReceivingName:

                paymentDetails.accountName,

            paymentPhone:

                formatTanzaniaPhone(
                    paymentPhone
                ),

            paymentStatus:

                "Waiting Confirmation",

            status:

                "Waiting Payment Confirmation",

            createdAt:

                firebase.firestore
                    .FieldValue
                    .serverTimestamp(),

            updatedAt:

                firebase.firestore
                    .FieldValue
                    .serverTimestamp()

        };


        /* =========================
           SAVE BOOKING
        ========================= */

        await db
            .collection("bookings")
            .doc(bookingNumber)
            .set(
                bookingData
            );


        /* =========================
           SAVE PAYMENT REQUEST
        ========================= */

        const paymentRequest =
            await createPaymentRequest(
                bookingData,
                paymentPhone
            );


        /* =========================
           UPDATE USER
        ========================= */

        await db
            .collection("users")
            .doc(currentUser.uid)
            .set({

                totalBookings:
                    firebase.firestore
                        .FieldValue
                        .increment(1),

                updatedAt:
                    firebase.firestore
                        .FieldValue
                        .serverTimestamp()

            }, {
                merge: true
            });


        /* =========================
           NOTIFICATION
        ========================= */

        await createNotification(

            currentUser.uid,

            "💳 Payment Request Imepokelewa",

            "Booking " +
                bookingNumber +
                " imepokelewa. Payment yako inasubiri uthibitisho wa Admin.",

            "payment"

        );


        /* =========================
           SHOW SUCCESS
        ========================= */

        const message =
            document.getElementById(
                "bookingMessage"
            );


        if (message) {

            message.style.display =
                "block";

            message.style.color =
                "green";


            message.innerHTML = `

                <strong>
                    ✅ Booking imepokelewa!
                </strong>

                <br><br>

                Booking Number:
                <strong>
                    ${bookingNumber}
                </strong>

                <br>

                Payment ID:
                <strong>
                    ${paymentRequest.paymentId}
                </strong>

                <br><br>

                💳 Njia:
                ${paymentMethod}

                <br>

                📱 Namba ya malipo:
                ${paymentDetails.number}

                <br>

                👤 Jina:
                ${paymentDetails.accountName}

                <br><br>

                ⏳ Status:
                <strong>
                    Waiting Confirmation
                </strong>

                <br><br>

                Admin atathibitisha malipo
                baada ya kuyakagua.

            `;

        }


        console.log(
            "BOOKING:",
            bookingData
        );


        console.log(
            "PAYMENT REQUEST:",
            paymentRequest
        );


    } catch (error) {

        console.error(
            "Booking/payment error:",
            error
        );


        showMessage(
            "bookingMessage",
            "❌ Imeshindikana kutuma booking/payment: " +
            error.message,
            "error"
        );

    }

}


/* =========================================================
   35. PAYMENT STATUS HELPERS
========================================================= */

async function updatePaymentStatus(
    paymentId,
    status
) {

    if (!paymentId) {
        return;
    }


    await db
        .collection("paymentRequests")
        .doc(paymentId)
        .update({

            status:

                status,

            updatedAt:

                firebase.firestore
                    .FieldValue
                    .serverTimestamp()

        });

}


/* =========================================================
   36. PAYMENT STATUS MEANINGS
========================================================= */

/*

   Waiting Confirmation
   --------------------
   Mteja ametuma payment request.
   Admin bado hajathibitisha.


   Confirmed
   ---------
   Admin amethibitisha payment.


   Rejected
   --------
   Admin amekataa payment.


   Muhimu:
   Commission haitalipwa wakati booking
   inatengenezwa.

   Commission itaunganishwa kwenye
   PAYMENT CONFIRMED flow.

*/


/* =========================================================
   37. END OF SEHEMU YA 2
========================================================= */
/* =========================================================
   ROOMRENT - SCRIPT NZIMA
   SEHEMU YA 3
   =========================================================

   MFUMO:
   - CUSTOMER ACCOUNT
   - REFERRAL CODE
   - REFERRAL LINK
   - LEVEL A / B / C
   - USER COMMISSION
   - ADMIN COMMISSION
   - BOOKING ZANGU
   - NOTIFICATIONS
   - FIRESTORE

   USER COMMISSION:
   A = 5%
   B = 2%
   C = 1%

   ADMIN COMMISSION:
   A = 20%
   B = 10%
   C = 5%

========================================================= */


/* =========================================================
   38. GET CURRENT USER DATA
========================================================= */

async function getCurrentUserData() {

    if (!currentUser) {
        return null;
    }


    try {

        const userRef =
            db
                .collection("users")
                .doc(currentUser.uid);


        const snapshot =
            await userRef.get();


        if (!snapshot.exists) {

            return null;

        }


        return snapshot.data();


    } catch (error) {

        console.error(
            "getCurrentUserData error:",
            error
        );

        return null;

    }

}


/* =========================================================
   39. ENSURE USER REFERRAL CODE
========================================================= */

async function ensureUserReferralCode() {

    if (!currentUser) {
        return null;
    }


    try {

        const userRef =
            db
                .collection("users")
                .doc(currentUser.uid);


        const snapshot =
            await userRef.get();


        if (!snapshot.exists) {

            return null;

        }


        const data =
            snapshot.data();


        if (data.referralCode) {

            return data.referralCode;

        }


        const name =
            data.name ||
            currentUser.email ||
            "USER";


        const referralCode =
            generateReferralCode(
                name
            );


        await userRef.update({

            referralCode:
                referralCode,

            updatedAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp()

        });


        if (currentUserData) {

            currentUserData.referralCode =
                referralCode;

        }


        return referralCode;


    } catch (error) {

        console.error(
            "ensureUserReferralCode error:",
            error
        );

        return null;

    }

}


/* =========================================================
   40. CREATE REFERRAL LINK
========================================================= */

function createReferralLink(
    referralCode
) {

    if (!referralCode) {
        return "";
    }


    const currentUrl =
        window.location.href.split("?")[0];


    return (
        currentUrl +
        "?ref=" +
        encodeURIComponent(
            referralCode
        )
    );

}


/* =========================================================
   41. GET REFERRAL CODE FROM URL
========================================================= */

function getReferralCodeFromURL() {

    try {

        const params =
            new URLSearchParams(
                window.location.search
            );


        const referral =
            params.get("ref");


        if (!referral) {

            return "";

        }


        return referral
            .trim()
            .toUpperCase();


    } catch (error) {

        console.error(
            "getReferralCodeFromURL error:",
            error
        );


        return "";

    }

}


/* =========================================================
   42. AUTO-FILL REFERRAL CODE
========================================================= */

function autoFillReferralCode() {

    const referralCode =
        getReferralCodeFromURL();


    if (!referralCode) {
        return;
    }


    const input =
        document.getElementById(
            "bookingReferral"
        );


    if (input) {

        input.value =
            referralCode;

    }


    console.log(
        "Referral code kutoka URL:",
        referralCode
    );

}


/* =========================================================
   43. COPY REFERRAL LINK
========================================================= */

async function copyReferralLink() {

    if (!currentUser) {

        alert(
            "Tafadhali ingia kwenye account kwanza."
        );

        return;

    }


    const referralCode =
        await ensureUserReferralCode();


    if (!referralCode) {

        alert(
            "❌ Referral Code haijapatikana."
        );

        return;

    }


    const referralLink =
        createReferralLink(
            referralCode
        );


    try {

        await navigator.clipboard.writeText(
            referralLink
        );


        alert(
            "✅ Referral link imenakiliwa!"
        );


    } catch (error) {

        /*
           Backup kwa browsers ambazo
           haziruhusu navigator.clipboard.
        */

        const temp =
            document.createElement(
                "textarea"
            );


        temp.value =
            referralLink;


        document.body.appendChild(
            temp
        );


        temp.select();


        try {

            document.execCommand(
                "copy"
            );

            alert(
                "✅ Referral link imenakiliwa!"
            );

        } catch (copyError) {

            alert(
                "Referral Link:\n\n" +
                referralLink
            );

        }


        document.body.removeChild(
            temp
        );

    }

}


/* =========================================================
   44. SHARE REFERRAL LINK
========================================================= */

async function shareReferralLink() {

    if (!currentUser) {

        alert(
            "Tafadhali ingia kwenye account kwanza."
        );

        return;

    }


    const referralCode =
        await ensureUserReferralCode();


    if (!referralCode) {

        alert(
            "❌ Referral Code haijapatikana."
        );

        return;

    }


    const referralLink =
        createReferralLink(
            referralCode
        );


    const shareText =
        "🏠 Karibu RoomRent!\n\n" +
        "Jiunge kupitia referral link yangu:\n" +
        referralLink;


    if (
        navigator.share
    ) {

        try {

            await navigator.share({

                title:
                    "RoomRent",

                text:
                    shareText,

                url:
                    referralLink

            });

            return;

        } catch (error) {

            console.log(
                "Share cancelled."
            );

        }

    }


    await copyReferralLink();

}


/* =========================================================
   45. FIND REFERRAL UPLINE
========================================================= */

async function getReferralUpline(
    uid
) {

    const result = {

        A: null,

        B: null,

        C: null

    };


    if (!uid) {
        return result;
    }


    try {

        /*
           A = mtu aliyemrefer user
        */

        const userSnapshot =
            await db
                .collection("users")
                .doc(uid)
                .get();


        if (!userSnapshot.exists) {

            return result;

        }


        let current =
            userSnapshot.data();


        /* =========================
           LEVEL A
        ========================= */

        if (current.referredBy) {

            const aSnapshot =
                await db
                    .collection("users")
                    .where(
                        "referralCode",
                        "==",
                        current.referredBy
                    )
                    .limit(1)
                    .get();


            if (!aSnapshot.empty) {

                const aDoc =
                    aSnapshot.docs[0];


                result.A = {

                    uid:
                        aDoc.id,

                    ...aDoc.data()

                };

            }

        }


        /* =========================
           LEVEL B
        ========================= */

        if (
            result.A &&
            result.A.referredBy
        ) {

            const bSnapshot =
                await db
                    .collection("users")
                    .where(
                        "referralCode",
                        "==",
                        result.A.referredBy
                    )
                    .limit(1)
                    .get();


            if (!bSnapshot.empty) {

                const bDoc =
                    bSnapshot.docs[0];


                result.B = {

                    uid:
                        bDoc.id,

                    ...bDoc.data()

                };

            }

        }


        /* =========================
           LEVEL C
        ========================= */

        if (
            result.B &&
            result.B.referredBy
        ) {

            const cSnapshot =
                await db
                    .collection("users")
                    .where(
                        "referralCode",
                        "==",
                        result.B.referredBy
                    )
                    .limit(1)
                    .get();


            if (!cSnapshot.empty) {

                const cDoc =
                    cSnapshot.docs[0];


                result.C = {

                    uid:
                        cDoc.id,

                    ...cDoc.data()

                };

            }

        }


        return result;


    } catch (error) {

        console.error(
            "getReferralUpline error:",
            error
        );


        return result;

    }

}


/* =========================================================
   46. CALCULATE COMMISSION
========================================================= */

function calculateCommission(
    amount,
    level
) {

    amount =
        Number(amount) || 0;


    let percentage = 0;


    if (level === "A") {

        percentage =
            Number(
                USER_COMMISSION.A
            );

    }


    if (level === "B") {

        percentage =
            Number(
                USER_COMMISSION.B
            );

    }


    if (level === "C") {

        percentage =
            Number(
                USER_COMMISSION.C
            );

    }


    return Math.round(
        amount *
        percentage /
        100
    );

}


/* =========================================================
   47. CALCULATE ADMIN COMMISSION
========================================================= */

function calculateAdminCommission(
    amount,
    level
) {

    amount =
        Number(amount) || 0;


    let percentage = 0;


    if (level === "A") {

        percentage =
            Number(
                ADMIN_COMMISSION.A
            );

    }


    if (level === "B") {

        percentage =
            Number(
                ADMIN_COMMISSION.B
            );

    }


    if (level === "C") {

        percentage =
            Number(
                ADMIN_COMMISSION.C
            );

    }


    return Math.round(
        amount *
        percentage /
        100
    );

}


/* =========================================================
   48. SAVE COMMISSION RECORD
========================================================= */

async function saveCommissionRecord(
    receiverUid,
    sourceUid,
    bookingNumber,
    level,
    amount,
    percentage
) {

    if (!receiverUid) {
        return null;
    }


    const commissionAmount =
        Math.round(
            Number(amount) *
            Number(percentage) /
            100
        );


    const commissionRef =
        db
            .collection("commissions")
            .doc();


    const commissionData = {

        commissionId:
            commissionRef.id,

        receiverUid:
            receiverUid,

        sourceUid:
            sourceUid,

        bookingNumber:
            bookingNumber,

        level:
            level,

        percentage:
            Number(percentage),

        bookingAmount:
            Number(amount),

        commissionAmount:
            commissionAmount,

        status:
            "Available",

        createdAt:
            firebase.firestore
                .FieldValue
                .serverTimestamp()

    };


    await commissionRef.set(
        commissionData
    );


    /*
       Ongeza balance ya receiver.
    */

    await db
        .collection("users")
        .doc(receiverUid)
        .set({

            totalCommission:
                firebase.firestore
                    .FieldValue
                    .increment(
                        commissionAmount
                    ),

            updatedAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp()

        }, {
            merge: true
        });


    return commissionData;

}


/* =========================================================
   49. SAVE ADMIN COMMISSION RECORD
========================================================= */

async function saveAdminCommissionRecord(
    sourceUid,
    bookingNumber,
    level,
    amount,
    percentage
) {

    const commissionAmount =
        calculateAdminCommission(
            amount,
            level
        );


    if (
        commissionAmount <= 0
    ) {

        return null;

    }


    const commissionRef =
        db
            .collection("adminCommissions")
            .doc();


    const data = {

        commissionId:
            commissionRef.id,

        adminReferralCode:
            ADMIN_REFERRAL_CODE,

        sourceUid:
            sourceUid,

        bookingNumber:
            bookingNumber,

        level:
            level,

        percentage:
            Number(percentage),

        bookingAmount:
            Number(amount),

        commissionAmount:
            commissionAmount,

        status:
            "Available",

        createdAt:
            firebase.firestore
                .FieldValue
                .serverTimestamp()

    };


    await commissionRef.set(
        data
    );


    return data;

}


/* =========================================================
   50. DISTRIBUTE REFERRAL COMMISSION
========================================================= */

/*
   MUHIMU:

   Function hii itaitwa BAADA YA PAYMENT
   kuthibitishwa na Admin.

   HATUPEI commission wakati booking
   bado iko Waiting Confirmation.
*/

async function distributeReferralCommission(
    bookingData
) {

    if (!bookingData) {

        return;

    }


    if (
        !bookingData.uid ||
        !bookingData.bookingNumber
    ) {

        return;

    }


    const amount =
        Number(
            bookingData.roomPrice
        ) || 0;


    if (amount <= 0) {

        return;

    }


    /*
       Tunazuia commission kulipwa
       mara mbili.
    */

    const existing =
        await db
            .collection("commissions")
            .where(
                "bookingNumber",
                "==",
                bookingData.bookingNumber
            )
            .limit(1)
            .get();


    if (!existing.empty) {

        console.log(
            "Commission tayari imeshatengenezwa:",
            bookingData.bookingNumber
        );

        return;

    }


    const upline =
        await getReferralUpline(
            bookingData.uid
        );


    /* =========================
       USER LEVEL A
    ========================= */

    if (upline.A) {

        await saveCommissionRecord(

            upline.A.uid,

            bookingData.uid,

            bookingData.bookingNumber,

            "A",

            amount,

            USER_COMMISSION.A

        );

    }


    /* =========================
       USER LEVEL B
    ========================= */

    if (upline.B) {

        await saveCommissionRecord(

            upline.B.uid,

            bookingData.uid,

            bookingData.bookingNumber,

            "B",

            amount,

            USER_COMMISSION.B

        );

    }


    /* =========================
       USER LEVEL C
    ========================= */

    if (upline.C) {

        await saveCommissionRecord(

            upline.C.uid,

            bookingData.uid,

            bookingData.bookingNumber,

            "C",

            amount,

            USER_COMMISSION.C

        );

    }


    /*
       Kama referral ya moja kwa moja ni
       Admin, Admin commission itawekwa
       kulingana na Level A.
    */

    if (
        bookingData.referralCode ===
        ADMIN_REFERRAL_CODE
    ) {

        await saveAdminCommissionRecord(

            bookingData.uid,

            bookingData.bookingNumber,

            "A",

            amount,

            ADMIN_COMMISSION.A

        );

    }

}


/* =========================================================
   51. OPEN ACCOUNT
========================================================= */

async function funguaAccount() {

    if (!currentUser) {

        alert(
            "Tafadhali ingia kwenye account kwanza."
        );

        return;

    }


    hideAllMainSections();


    const section =
        document.getElementById(
            "taarifaSection"
        );


    if (!section) {
        return;
    }


    section.style.display =
        "block";


    const data =
        await getCurrentUserData();


    if (data) {

        currentUserData =
            data;

    }


    const referralCode =
        await ensureUserReferralCode();


    const referralLink =
        createReferralLink(
            referralCode
        );


    const totalCommission =
        Number(
            currentUserData?.totalCommission
        ) || 0;


    const totalBookings =
        Number(
            currentUserData?.totalBookings
        ) || 0;


    section.innerHTML = `

        <div class="booking-card">

            <h2>
                👤 Account Yangu
            </h2>


            <p>
                📧 Email:
                <strong>
                    ${
                        currentUser.email ||
                        "-"
                    }
                </strong>
            </p>


            <p>
                👤 Jina:
                <strong>
                    ${
                        currentUserData?.name ||
                        "-"
                    }
                </strong>
            </p>


            <p>
                📱 Simu:
                <strong>
                    ${
                        currentUserData?.phone ||
                        "-"
                    }
                </strong>
            </p>


            <hr>


            <h3>
                💰 Taarifa za Account
            </h3>


            <p>
                📋 Jumla ya Booking:
                <strong>
                    ${totalBookings}
                </strong>
            </p>


            <p>
                💵 Commission:
                <strong>
                    ${formatMoney(
                        totalCommission
                    )}
                </strong>
            </p>


            <hr>


            <h3>
                🔗 Referral Yangu
            </h3>


            <p>
                Referral Code:
            </p>


            <div
                style="
                    padding:12px;
                    background:#f2f2f2;
                    text-align:center;
                    font-size:20px;
                    font-weight:bold;
                    letter-spacing:2px;
                "
            >
                ${referralCode || "-"}
            </div>


            <p>
                Referral Link:
            </p>


            <input
                type="text"
                value="${referralLink}"
                readonly
                id="myReferralLink"
            >


            <button
                class="thibitishaBtn"
                onclick="copyReferralLink()"
            >
                📋 Copy Referral Link
            </button>


            <button
                class="endeleaBtn"
                onclick="shareReferralLink()"
            >
                📤 Share Referral Link
            </button>


            <hr>


            <button
                class="thibitishaBtn"
                onclick="funguaReferralDetails()"
            >
                👥 Referral & Commission
            </button>


            <button
                class="endeleaBtn"
                onclick="signOutUser()"
            >
                🚪 Toka kwenye Account
            </button>

        </div>

    `;

}


/* =========================================================
   52. OPEN REFERRAL DETAILS
========================================================= */

async function funguaReferralDetails() {

    if (!currentUser) {

        alert(
            "Tafadhali ingia kwanza."
        );

        return;

    }


    hideAllMainSections();


    const section =
        document.getElementById(
            "taarifaSection"
        );


    if (!section) {
        return;
    }


    section.style.display =
        "block";


    const data =
        await getCurrentUserData();


    currentUserData =
        data || currentUserData;


    const referralCode =
        await ensureUserReferralCode();


    const upline =
        await getReferralUpline(
            currentUser.uid
        );


    section.innerHTML = `

        <div class="booking-card">

            <h2>
                👥 Referral System
            </h2>


            <p>
                🔗 Referral Code:
                <strong>
                    ${referralCode || "-"}
                </strong>
            </p>


            <hr>


            <h3>
                🅰️ Level A
            </h3>

            ${
                upline.A
                ? `
                    <p>
                        👤 ${
                            upline.A.name ||
                            upline.A.email ||
                            "User"
                        }
                    </p>

                    <p>
                        💰 Commission:
                        5%
                    </p>
                `
                : `
                    <p>
                        Hakuna referral wa Level A.
                    </p>
                `
            }


            <h3>
                🅱️ Level B
            </h3>

            ${
                upline.B
                ? `
                    <p>
                        👤 ${
                            upline.B.name ||
                            upline.B.email ||
                            "User"
                        }
                    </p>

                    <p>
                        💰 Commission:
                        2%
                    </p>
                `
                : `
                    <p>
                        Hakuna referral wa Level B.
                    </p>
                `
            }


            <h3>
                ©️ Level C
            </h3>

            ${
                upline.C
                ? `
                    <p>
                        👤 ${
                            upline.C.name ||
                            upline.C.email ||
                            "User"
                        }
                    </p>

                    <p>
                        💰 Commission:
                        1%
                    </p>
                `
                : `
                    <p>
                        Hakuna referral wa Level C.
                    </p>
                `
            }


            <hr>


            <p>
                <strong>
                    User Commission
                </strong>
            </p>


            <p>
                🅰️ A = 5%
                <br>
                🅱️ B = 2%
                <br>
                ©️ C = 1%
            </p>


            <button
                class="endeleaBtn"
                onclick="funguaAccount()"
            >
                ↩️ Rudi Account
            </button>

        </div>

    `;

}


/* =========================================================
   53. OPEN MY BOOKINGS
========================================================= */

async function funguaBookingZangu() {

    if (!currentUser) {

        alert(
            "Tafadhali ingia kwenye account kwanza."
        );

        return;

    }


    hideAllMainSections();


    const section =
        document.getElementById(
            "taarifaSection"
        );


    if (!section) {
        return;
    }


    section.style.display =
        "block";


    section.innerHTML = `

        <div class="booking-card">

            <h2>
                📋 Booking Zangu
            </h2>

            <p>
                ⏳ Inapakia bookings...
            </p>

        </div>

    `;


    try {

        const snapshot =
            await db
                .collection("bookings")
                .where(
                    "uid",
                    "==",
                    currentUser.uid
                )
                .get();


        if (snapshot.empty) {

            section.innerHTML = `

                <div class="booking-card">

                    <h2>
                        📋 Booking Zangu
                    </h2>

                    <p>
                        Bado huna booking yoyote.
                    </p>


                    <button
                        class="thibitishaBtn"
                        onclick="funguaVyumba()"
                    >
                        🏠 Angalia Vyumba
                    </button>

                </div>

            `;

            return;

        }


        const bookings =
            snapshot.docs
                .map(
                    doc => ({
                        id: doc.id,
                        ...doc.data()
                    })
                );


        bookings.sort(
            (a, b) => {

                const aTime =
                    a.createdAt &&
                    a.createdAt.toMillis
                        ? a.createdAt.toMillis()
                        : 0;


                const bTime =
                    b.createdAt &&
                    b.createdAt.toMillis
                        ? b.createdAt.toMillis()
                        : 0;


                return bTime - aTime;

            }
        );


        let html = `

            <div class="booking-card">

                <h2>
                    📋 Booking Zangu
                </h2>

        `;


        bookings.forEach(
            booking => {

                html += `

                    <div
                        class="booking-card"
                        style="
                            margin-top:15px;
                        "
                    >

                        <h3>
                            🧾 ${
                                booking.bookingNumber ||
                                booking.id
                            }
                        </h3>


                        <p>
                            🏠 Chumba:
                            <strong>
                                ${
                                    booking.roomId ||
                                    "-"
                                }
                            </strong>
                        </p>


                        <p>
                            💰 Kiasi:
                            <strong>
                                ${formatMoney(
                                    booking.roomPrice ||
                                    0
                                )}
                            </strong>
                        </p>


                        <p>
                            📅 Muda:
                            <strong>
                                ${
                                    booking.durationDays ||
                                    0
                                }
                                siku
                            </strong>
                        </p>


                        <p>
                            💳 Payment:
                            <strong>
                                ${
                                    booking.paymentMethod ||
                                    "-"
                                }
                            </strong>
                        </p>


                        <p>
                            📱 Payment Phone:
                            <strong>
                                ${
                                    booking.paymentPhone ||
                                    "-"
                                }
                            </strong>
                        </p>


                        <p>
                            ⏳ Payment Status:
                            <strong>
                                ${
                                    booking.paymentStatus ||
                                    "-"
                                }
                            </strong>
                        </p>


                        <p>
                            📌 Booking Status:
                            <strong>
                                ${
                                    booking.status ||
                                    "-"
                                }
                            </strong>
                        </p>


                    </div>

                `;

            }
        );


        html += `

            </div>

        `;


        section.innerHTML =
            html;


    } catch (error) {

        console.error(
            "funguaBookingZangu error:",
            error
        );


        section.innerHTML = `

            <div class="booking-card">

                <h2>
                    📋 Booking Zangu
                </h2>

                <p style="color:red;">
                    ❌ Imeshindikana kupakia bookings.
                </p>

                <p>
                    ${error.message}
                </p>

            </div>

        `;

    }

}


/* =========================================================
   54. OPEN NOTIFICATIONS
========================================================= */

async function funguaTaarifa() {

    if (!currentUser) {

        alert(
            "Tafadhali ingia kwenye account kwanza."
        );

        return;

    }


    hideAllMainSections();


    const section =
        document.getElementById(
            "taarifaSection"
        );


    if (!section) {
        return;
    }


    section.style.display =
        "block";


    section.innerHTML = `

        <div class="booking-card">

            <h2>
                🔔 Taarifa
            </h2>

            <p>
                ⏳ Inapakia taarifa...
            </p>

        </div>

    `;


    try {

        const snapshot =
            await db
                .collection("users")
                .doc(currentUser.uid)
                .collection("notifications")
                .orderBy(
                    "createdAt",
                    "desc"
                )
                .limit(50)
                .get();


        if (snapshot.empty) {

            section.innerHTML = `

                <div class="booking-card">

                    <h2>
                        🔔 Taarifa
                    </h2>

                    <p>
                        Hakuna taarifa kwa sasa.
                    </p>

                </div>

            `;

            return;

        }


        let html = `

            <div class="booking-card">

                <h2>
                    🔔 Taarifa
                </h2>

        `;


        snapshot.docs.forEach(
            doc => {

                const notification =
                    doc.data();


                html += `

                    <div
                        class="booking-card"
                        style="
                            margin-top:12px;
                        "
                    >

                        <h3>
                            ${
                                notification.title ||
                                "Taarifa"
                            }
                        </h3>

                        <p>
                            ${
                                notification.message ||
                                ""
                            }
                        </p>

                        <button
                            class="endeleaBtn"
                            onclick="markNotificationRead('${doc.id}')"
                        >
                            ${
                                notification.read
                                ? "✓ Imesomwa"
                                : "✓ Weka kuwa imesomwa"
                            }
                        </button>

                    </div>

                `;

            }
        );


        html += `

            </div>

        `;


        section.innerHTML =
            html;


    } catch (error) {

        console.error(
            "funguaTaarifa error:",
            error
        );


        section.innerHTML = `

            <div class="booking-card">

                <h2>
                    🔔 Taarifa
                </h2>

                <p style="color:red;">
                    ❌ Imeshindikana kupakia taarifa.
                </p>

                <p>
                    ${error.message}
                </p>

            </div>

        `;

    }

}


/* =========================================================
   55. MARK NOTIFICATION AS READ
========================================================= */

async function markNotificationRead(
    notificationId
) {

    if (!currentUser) {
        return;
    }


    if (!notificationId) {
        return;
    }


    try {

        await db
            .collection("users")
            .doc(currentUser.uid)
            .collection("notifications")
            .doc(notificationId)
            .update({

                read:
                    true,

                readAt:
                    firebase.firestore
                        .FieldValue
                        .serverTimestamp()

            });


        funguaTaarifa();


    } catch (error) {

        console.error(
            "markNotificationRead error:",
            error
        );

    }

}


/* =========================================================
   56. COUNT UNREAD NOTIFICATIONS
========================================================= */

async function getUnreadNotificationCount() {

    if (!currentUser) {
        return 0;
    }


    try {

        const snapshot =
            await db
                .collection("users")
                .doc(currentUser.uid)
                .collection("notifications")
                .where(
                    "read",
                    "==",
                    false
                )
                .get();


        return snapshot.size;


    } catch (error) {

        console.error(
            "getUnreadNotificationCount error:",
            error
        );


        return 0;

    }

}


/* =========================================================
   57. UPDATE NOTIFICATION BUTTON
========================================================= */

async function updateNotificationButton() {

    const button =
        document.getElementById(
            "taarifaBtn"
        );


    if (!button) {
        return;
    }


    if (!currentUser) {

        button.textContent =
            "🔔 Taarifa";

        return;

    }


    const count =
        await getUnreadNotificationCount();


    if (count > 0) {

        button.textContent =
            "🔔 Taarifa (" +
            count +
            ")";

    } else {

        button.textContent =
            "🔔 Taarifa";

    }

}


/* =========================================================
   58. NOTIFICATION LISTENER
========================================================= */

function startNotificationListener() {

    if (!currentUser) {
        return;
    }


    if (
        typeof unsubscribeNotifications ===
        "function"
    ) {

        unsubscribeNotifications();

    }


    unsubscribeNotifications =
        db
            .collection("users")
            .doc(currentUser.uid)
            .collection("notifications")
            .where(
                "read",
                "==",
                false
            )
            .onSnapshot(

                snapshot => {

                    const button =
                        document.getElementById(
                            "taarifaBtn"
                        );


                    if (!button) {
                        return;
                    }


                    const count =
                        snapshot.size;


                    if (count > 0) {

                        button.textContent =
                            "🔔 Taarifa (" +
                            count +
                            ")";

                    } else {

                        button.textContent =
                            "🔔 Taarifa";

                    }

                },

                error => {

                    console.error(
                        "Notification listener error:",
                        error
                    );

                }

            );

}


/* =========================================================
   59. START USER SERVICES
========================================================= */

async function startUserServices() {

    if (!currentUser) {
        return;
    }


    await loadCurrentUser();


    await ensureUserReferralCode();


    startNotificationListener();


    await updateNotificationButton();


    autoFillReferralCode();

}


/* =========================================================
   60. UPDATE AUTH STATE SERVICES
========================================================= */

auth.onAuthStateChanged(
    async user => {

        currentUser =
            user;


        if (!user) {

            currentUserData =
                null;

            isAdmin =
                false;


            if (
                typeof unsubscribeNotifications ===
                "function"
            ) {

                unsubscribeNotifications();

                unsubscribeNotifications =
                    null;

            }


            const notificationButton =
                document.getElementById(
                    "taarifaBtn"
                );


            if (notificationButton) {

                notificationButton.textContent =
                    "🔔 Taarifa";

            }


            return;

        }


        try {

            await startUserServices();

        } catch (error) {

            console.error(
                "startUserServices error:",
                error
            );

        }

    }
);


/* =========================================================
   61. AUTO REFERRAL ON PAGE LOAD
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        setTimeout(
            function () {

                autoFillReferralCode();

            },
            500
        );

    }
);


/* =========================================================
   62. END OF SEHEMU YA 3
========================================================= *//* =========================================================
   ROOMRENT - SCRIPT NZIMA
   SEHEMU YA 3
   =========================================================

   MFUMO:
   - CUSTOMER ACCOUNT
   - REFERRAL CODE
   - REFERRAL LINK
   - LEVEL A / B / C
   - USER COMMISSION
   - ADMIN COMMISSION
   - BOOKING ZANGU
   - NOTIFICATIONS
   - FIRESTORE

   USER COMMISSION:
   A = 5%
   B = 2%
   C = 1%

   ADMIN COMMISSION:
   A = 20%
   B = 10%
   C = 5%

========================================================= */


/* =========================================================
   38. GET CURRENT USER DATA
========================================================= */

async function getCurrentUserData() {

    if (!currentUser) {
        return null;
    }


    try {

        const userRef =
            db
                .collection("users")
                .doc(currentUser.uid);


        const snapshot =
            await userRef.get();


        if (!snapshot.exists) {

            return null;

        }


        return snapshot.data();


    } catch (error) {

        console.error(
            "getCurrentUserData error:",
            error
        );

        return null;

    }

}


/* =========================================================
   39. ENSURE USER REFERRAL CODE
========================================================= */

async function ensureUserReferralCode() {

    if (!currentUser) {
        return null;
    }


    try {

        const userRef =
            db
                .collection("users")
                .doc(currentUser.uid);


        const snapshot =
            await userRef.get();


        if (!snapshot.exists) {

            return null;

        }


        const data =
            snapshot.data();


        if (data.referralCode) {

            return data.referralCode;

        }


        const name =
            data.name ||
            currentUser.email ||
            "USER";


        const referralCode =
            generateReferralCode(
                name
            );


        await userRef.update({

            referralCode:
                referralCode,

            updatedAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp()

        });


        if (currentUserData) {

            currentUserData.referralCode =
                referralCode;

        }


        return referralCode;


    } catch (error) {

        console.error(
            "ensureUserReferralCode error:",
            error
        );

        return null;

    }

}


/* =========================================================
   40. CREATE REFERRAL LINK
========================================================= */

function createReferralLink(
    referralCode
) {

    if (!referralCode) {
        return "";
    }


    const currentUrl =
        window.location.href.split("?")[0];


    return (
        currentUrl +
        "?ref=" +
        encodeURIComponent(
            referralCode
        )
    );

}


/* =========================================================
   41. GET REFERRAL CODE FROM URL
========================================================= */

function getReferralCodeFromURL() {

    try {

        const params =
            new URLSearchParams(
                window.location.search
            );


        const referral =
            params.get("ref");


        if (!referral) {

            return "";

        }


        return referral
            .trim()
            .toUpperCase();


    } catch (error) {

        console.error(
            "getReferralCodeFromURL error:",
            error
        );


        return "";

    }

}


/* =========================================================
   42. AUTO-FILL REFERRAL CODE
========================================================= */

function autoFillReferralCode() {

    const referralCode =
        getReferralCodeFromURL();


    if (!referralCode) {
        return;
    }


    const input =
        document.getElementById(
            "bookingReferral"
        );


    if (input) {

        input.value =
            referralCode;

    }


    console.log(
        "Referral code kutoka URL:",
        referralCode
    );

}


/* =========================================================
   43. COPY REFERRAL LINK
========================================================= */

async function copyReferralLink() {

    if (!currentUser) {

        alert(
            "Tafadhali ingia kwenye account kwanza."
        );

        return;

    }


    const referralCode =
        await ensureUserReferralCode();


    if (!referralCode) {

        alert(
            "❌ Referral Code haijapatikana."
        );

        return;

    }


    const referralLink =
        createReferralLink(
            referralCode
        );


    try {

        await navigator.clipboard.writeText(
            referralLink
        );


        alert(
            "✅ Referral link imenakiliwa!"
        );


    } catch (error) {

        /*
           Backup kwa browsers ambazo
           haziruhusu navigator.clipboard.
        */

        const temp =
            document.createElement(
                "textarea"
            );


        temp.value =
            referralLink;


        document.body.appendChild(
            temp
        );


        temp.select();


        try {

            document.execCommand(
                "copy"
            );

            alert(
                "✅ Referral link imenakiliwa!"
            );

        } catch (copyError) {

            alert(
                "Referral Link:\n\n" +
                referralLink
            );

        }


        document.body.removeChild(
            temp
        );

    }

}


/* =========================================================
   44. SHARE REFERRAL LINK
========================================================= */

async function shareReferralLink() {

    if (!currentUser) {

        alert(
            "Tafadhali ingia kwenye account kwanza."
        );

        return;

    }


    const referralCode =
        await ensureUserReferralCode();


    if (!referralCode) {

        alert(
            "❌ Referral Code haijapatikana."
        );

        return;

    }


    const referralLink =
        createReferralLink(
            referralCode
        );


    const shareText =
        "🏠 Karibu RoomRent!\n\n" +
        "Jiunge kupitia referral link yangu:\n" +
        referralLink;


    if (
        navigator.share
    ) {

        try {

            await navigator.share({

                title:
                    "RoomRent",

                text:
                    shareText,

                url:
                    referralLink

            });

            return;

        } catch (error) {

            console.log(
                "Share cancelled."
            );

        }

    }


    await copyReferralLink();

}


/* =========================================================
   45. FIND REFERRAL UPLINE
========================================================= */

async function getReferralUpline(
    uid
) {

    const result = {

        A: null,

        B: null,

        C: null

    };


    if (!uid) {
        return result;
    }


    try {

        /*
           A = mtu aliyemrefer user
        */

        const userSnapshot =
            await db
                .collection("users")
                .doc(uid)
                .get();


        if (!userSnapshot.exists) {

            return result;

        }


        let current =
            userSnapshot.data();


        /* =========================
           LEVEL A
        ========================= */

        if (current.referredBy) {

            const aSnapshot =
                await db
                    .collection("users")
                    .where(
                        "referralCode",
                        "==",
                        current.referredBy
                    )
                    .limit(1)
                    .get();


            if (!aSnapshot.empty) {

                const aDoc =
                    aSnapshot.docs[0];


                result.A = {

                    uid:
                        aDoc.id,

                    ...aDoc.data()

                };

            }

        }


        /* =========================
           LEVEL B
        ========================= */

        if (
            result.A &&
            result.A.referredBy
        ) {

            const bSnapshot =
                await db
                    .collection("users")
                    .where(
                        "referralCode",
                        "==",
                        result.A.referredBy
                    )
                    .limit(1)
                    .get();


            if (!bSnapshot.empty) {

                const bDoc =
                    bSnapshot.docs[0];


                result.B = {

                    uid:
                        bDoc.id,

                    ...bDoc.data()

                };

            }

        }


        /* =========================
           LEVEL C
        ========================= */

        if (
            result.B &&
            result.B.referredBy
        ) {

            const cSnapshot =
                await db
                    .collection("users")
                    .where(
                        "referralCode",
                        "==",
                        result.B.referredBy
                    )
                    .limit(1)
                    .get();


            if (!cSnapshot.empty) {

                const cDoc =
                    cSnapshot.docs[0];


                result.C = {

                    uid:
                        cDoc.id,

                    ...cDoc.data()

                };

            }

        }


        return result;


    } catch (error) {

        console.error(
            "getReferralUpline error:",
            error
        );


        return result;

    }

}


/* =========================================================
   46. CALCULATE COMMISSION
========================================================= */

function calculateCommission(
    amount,
    level
) {

    amount =
        Number(amount) || 0;


    let percentage = 0;


    if (level === "A") {

        percentage =
            Number(
                USER_COMMISSION.A
            );

    }


    if (level === "B") {

        percentage =
            Number(
                USER_COMMISSION.B
            );

    }


    if (level === "C") {

        percentage =
            Number(
                USER_COMMISSION.C
            );

    }


    return Math.round(
        amount *
        percentage /
        100
    );

}


/* =========================================================
   47. CALCULATE ADMIN COMMISSION
========================================================= */

function calculateAdminCommission(
    amount,
    level
) {

    amount =
        Number(amount) || 0;


    let percentage = 0;


    if (level === "A") {

        percentage =
            Number(
                ADMIN_COMMISSION.A
            );

    }


    if (level === "B") {

        percentage =
            Number(
                ADMIN_COMMISSION.B
            );

    }


    if (level === "C") {

        percentage =
            Number(
                ADMIN_COMMISSION.C
            );

    }


    return Math.round(
        amount *
        percentage /
        100
    );

}


/* =========================================================
   48. SAVE COMMISSION RECORD
========================================================= */

async function saveCommissionRecord(
    receiverUid,
    sourceUid,
    bookingNumber,
    level,
    amount,
    percentage
) {

    if (!receiverUid) {
        return null;
    }


    const commissionAmount =
        Math.round(
            Number(amount) *
            Number(percentage) /
            100
        );


    const commissionRef =
        db
            .collection("commissions")
            .doc();


    const commissionData = {

        commissionId:
            commissionRef.id,

        receiverUid:
            receiverUid,

        sourceUid:
            sourceUid,

        bookingNumber:
            bookingNumber,

        level:
            level,

        percentage:
            Number(percentage),

        bookingAmount:
            Number(amount),

        commissionAmount:
            commissionAmount,

        status:
            "Available",

        createdAt:
            firebase.firestore
                .FieldValue
                .serverTimestamp()

    };


    await commissionRef.set(
        commissionData
    );


    /*
       Ongeza balance ya receiver.
    */

    await db
        .collection("users")
        .doc(receiverUid)
        .set({

            totalCommission:
                firebase.firestore
                    .FieldValue
                    .increment(
                        commissionAmount
                    ),

            updatedAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp()

        }, {
            merge: true
        });


    return commissionData;

}


/* =========================================================
   49. SAVE ADMIN COMMISSION RECORD
========================================================= */

async function saveAdminCommissionRecord(
    sourceUid,
    bookingNumber,
    level,
    amount,
    percentage
) {

    const commissionAmount =
        calculateAdminCommission(
            amount,
            level
        );


    if (
        commissionAmount <= 0
    ) {

        return null;

    }


    const commissionRef =
        db
            .collection("adminCommissions")
            .doc();


    const data = {

        commissionId:
            commissionRef.id,

        adminReferralCode:
            ADMIN_REFERRAL_CODE,

        sourceUid:
            sourceUid,

        bookingNumber:
            bookingNumber,

        level:
            level,

        percentage:
            Number(percentage),

        bookingAmount:
            Number(amount),

        commissionAmount:
            commissionAmount,

        status:
            "Available",

        createdAt:
            firebase.firestore
                .FieldValue
                .serverTimestamp()

    };


    await commissionRef.set(
        data
    );


    return data;

}


/* =========================================================
   50. DISTRIBUTE REFERRAL COMMISSION
========================================================= */

/*
   MUHIMU:

   Function hii itaitwa BAADA YA PAYMENT
   kuthibitishwa na Admin.

   HATUPEI commission wakati booking
   bado iko Waiting Confirmation.
*/

async function distributeReferralCommission(
    bookingData
) {

    if (!bookingData) {

        return;

    }


    if (
        !bookingData.uid ||
        !bookingData.bookingNumber
    ) {

        return;

    }


    const amount =
        Number(
            bookingData.roomPrice
        ) || 0;


    if (amount <= 0) {

        return;

    }


    /*
       Tunazuia commission kulipwa
       mara mbili.
    */

    const existing =
        await db
            .collection("commissions")
            .where(
                "bookingNumber",
                "==",
                bookingData.bookingNumber
            )
            .limit(1)
            .get();


    if (!existing.empty) {

        console.log(
            "Commission tayari imeshatengenezwa:",
            bookingData.bookingNumber
        );

        return;

    }


    const upline =
        await getReferralUpline(
            bookingData.uid
        );


    /* =========================
       USER LEVEL A
    ========================= */

    if (upline.A) {

        await saveCommissionRecord(

            upline.A.uid,

            bookingData.uid,

            bookingData.bookingNumber,

            "A",

            amount,

            USER_COMMISSION.A

        );

    }


    /* =========================
       USER LEVEL B
    ========================= */

    if (upline.B) {

        await saveCommissionRecord(

            upline.B.uid,

            bookingData.uid,

            bookingData.bookingNumber,

            "B",

            amount,

            USER_COMMISSION.B

        );

    }


    /* =========================
       USER LEVEL C
    ========================= */

    if (upline.C) {

        await saveCommissionRecord(

            upline.C.uid,

            bookingData.uid,

            bookingData.bookingNumber,

            "C",

            amount,

            USER_COMMISSION.C

        );

    }


    /*
       Kama referral ya moja kwa moja ni
       Admin, Admin commission itawekwa
       kulingana na Level A.
    */

    if (
        bookingData.referralCode ===
        ADMIN_REFERRAL_CODE
    ) {

        await saveAdminCommissionRecord(

            bookingData.uid,

            bookingData.bookingNumber,

            "A",

            amount,

            ADMIN_COMMISSION.A

        );

    }

}


/* =========================================================
   51. OPEN ACCOUNT
========================================================= */

async function funguaAccount() {

    if (!currentUser) {

        alert(
            "Tafadhali ingia kwenye account kwanza."
        );

        return;

    }


    hideAllMainSections();


    const section =
        document.getElementById(
            "taarifaSection"
        );


    if (!section) {
        return;
    }


    section.style.display =
        "block";


    const data =
        await getCurrentUserData();


    if (data) {

        currentUserData =
            data;

    }


    const referralCode =
        await ensureUserReferralCode();


    const referralLink =
        createReferralLink(
            referralCode
        );


    const totalCommission =
        Number(
            currentUserData?.totalCommission
        ) || 0;


    const totalBookings =
        Number(
            currentUserData?.totalBookings
        ) || 0;


    section.innerHTML = `

        <div class="booking-card">

            <h2>
                👤 Account Yangu
            </h2>


            <p>
                📧 Email:
                <strong>
                    ${
                        currentUser.email ||
                        "-"
                    }
                </strong>
            </p>


            <p>
                👤 Jina:
                <strong>
                    ${
                        currentUserData?.name ||
                        "-"
                    }
                </strong>
            </p>


            <p>
                📱 Simu:
                <strong>
                    ${
                        currentUserData?.phone ||
                        "-"
                    }
                </strong>
            </p>


            <hr>


            <h3>
                💰 Taarifa za Account
            </h3>


            <p>
                📋 Jumla ya Booking:
                <strong>
                    ${totalBookings}
                </strong>
            </p>


            <p>
                💵 Commission:
                <strong>
                    ${formatMoney(
                        totalCommission
                    )}
                </strong>
            </p>


            <hr>


            <h3>
                🔗 Referral Yangu
            </h3>


            <p>
                Referral Code:
            </p>


            <div
                style="
                    padding:12px;
                    background:#f2f2f2;
                    text-align:center;
                    font-size:20px;
                    font-weight:bold;
                    letter-spacing:2px;
                "
            >
                ${referralCode || "-"}
            </div>


            <p>
                Referral Link:
            </p>


            <input
                type="text"
                value="${referralLink}"
                readonly
                id="myReferralLink"
            >


            <button
                class="thibitishaBtn"
                onclick="copyReferralLink()"
            >
                📋 Copy Referral Link
            </button>


            <button
                class="endeleaBtn"
                onclick="shareReferralLink()"
            >
                📤 Share Referral Link
            </button>


            <hr>


            <button
                class="thibitishaBtn"
                onclick="funguaReferralDetails()"
            >
                👥 Referral & Commission
            </button>


            <button
                class="endeleaBtn"
                onclick="signOutUser()"
            >
                🚪 Toka kwenye Account
            </button>

        </div>

    `;

}


/* =========================================================
   52. OPEN REFERRAL DETAILS
========================================================= */

async function funguaReferralDetails() {

    if (!currentUser) {

        alert(
            "Tafadhali ingia kwanza."
        );

        return;

    }


    hideAllMainSections();


    const section =
        document.getElementById(
            "taarifaSection"
        );


    if (!section) {
        return;
    }


    section.style.display =
        "block";


    const data =
        await getCurrentUserData();


    currentUserData =
        data || currentUserData;


    const referralCode =
        await ensureUserReferralCode();


    const upline =
        await getReferralUpline(
            currentUser.uid
        );


    section.innerHTML = `

        <div class="booking-card">

            <h2>
                👥 Referral System
            </h2>


            <p>
                🔗 Referral Code:
                <strong>
                    ${referralCode || "-"}
                </strong>
            </p>


            <hr>


            <h3>
                🅰️ Level A
            </h3>

            ${
                upline.A
                ? `
                    <p>
                        👤 ${
                            upline.A.name ||
                            upline.A.email ||
                            "User"
                        }
                    </p>

                    <p>
                        💰 Commission:
                        5%
                    </p>
                `
                : `
                    <p>
                        Hakuna referral wa Level A.
                    </p>
                `
            }


            <h3>
                🅱️ Level B
            </h3>

            ${
                upline.B
                ? `
                    <p>
                        👤 ${
                            upline.B.name ||
                            upline.B.email ||
                            "User"
                        }
                    </p>

                    <p>
                        💰 Commission:
                        2%
                    </p>
                `
                : `
                    <p>
                        Hakuna referral wa Level B.
                    </p>
                `
            }


            <h3>
                ©️ Level C
            </h3>

            ${
                upline.C
                ? `
                    <p>
                        👤 ${
                            upline.C.name ||
                            upline.C.email ||
                            "User"
                        }
                    </p>

                    <p>
                        💰 Commission:
                        1%
                    </p>
                `
                : `
                    <p>
                        Hakuna referral wa Level C.
                    </p>
                `
            }


            <hr>


            <p>
                <strong>
                    User Commission
                </strong>
            </p>


            <p>
                🅰️ A = 5%
                <br>
                🅱️ B = 2%
                <br>
                ©️ C = 1%
            </p>


            <button
                class="endeleaBtn"
                onclick="funguaAccount()"
            >
                ↩️ Rudi Account
            </button>

        </div>

    `;

}


/* =========================================================
   53. OPEN MY BOOKINGS
========================================================= */

async function funguaBookingZangu() {

    if (!currentUser) {

        alert(
            "Tafadhali ingia kwenye account kwanza."
        );

        return;

    }


    hideAllMainSections();


    const section =
        document.getElementById(
            "taarifaSection"
        );


    if (!section) {
        return;
    }


    section.style.display =
        "block";


    section.innerHTML = `

        <div class="booking-card">

            <h2>
                📋 Booking Zangu
            </h2>

            <p>
                ⏳ Inapakia bookings...
            </p>

        </div>

    `;


    try {

        const snapshot =
            await db
                .collection("bookings")
                .where(
                    "uid",
                    "==",
                    currentUser.uid
                )
                .get();


        if (snapshot.empty) {

            section.innerHTML = `

                <div class="booking-card">

                    <h2>
                        📋 Booking Zangu
                    </h2>

                    <p>
                        Bado huna booking yoyote.
                    </p>


                    <button
                        class="thibitishaBtn"
                        onclick="funguaVyumba()"
                    >
                        🏠 Angalia Vyumba
                    </button>

                </div>

            `;

            return;

        }


        const bookings =
            snapshot.docs
                .map(
                    doc => ({
                        id: doc.id,
                        ...doc.data()
                    })
                );


        bookings.sort(
            (a, b) => {

                const aTime =
                    a.createdAt &&
                    a.createdAt.toMillis
                        ? a.createdAt.toMillis()
                        : 0;


                const bTime =
                    b.createdAt &&
                    b.createdAt.toMillis
                        ? b.createdAt.toMillis()
                        : 0;


                return bTime - aTime;

            }
        );


        let html = `

            <div class="booking-card">

                <h2>
                    📋 Booking Zangu
                </h2>

        `;


        bookings.forEach(
            booking => {

                html += `

                    <div
                        class="booking-card"
                        style="
                            margin-top:15px;
                        "
                    >

                        <h3>
                            🧾 ${
                                booking.bookingNumber ||
                                booking.id
                            }
                        </h3>


                        <p>
                            🏠 Chumba:
                            <strong>
                                ${
                                    booking.roomId ||
                                    "-"
                                }
                            </strong>
                        </p>


                        <p>
                            💰 Kiasi:
                            <strong>
                                ${formatMoney(
                                    booking.roomPrice ||
                                    0
                                )}
                            </strong>
                        </p>


                        <p>
                            📅 Muda:
                            <strong>
                                ${
                                    booking.durationDays ||
                                    0
                                }
                                siku
                            </strong>
                        </p>


                        <p>
                            💳 Payment:
                            <strong>
                                ${
                                    booking.paymentMethod ||
                                    "-"
                                }
                            </strong>
                        </p>


                        <p>
                            📱 Payment Phone:
                            <strong>
                                ${
                                    booking.paymentPhone ||
                                    "-"
                                }
                            </strong>
                        </p>


                        <p>
                            ⏳ Payment Status:
                            <strong>
                                ${
                                    booking.paymentStatus ||
                                    "-"
                                }
                            </strong>
                        </p>


                        <p>
                            📌 Booking Status:
                            <strong>
                                ${
                                    booking.status ||
                                    "-"
                                }
                            </strong>
                        </p>


                    </div>

                `;

            }
        );


        html += `

            </div>

        `;


        section.innerHTML =
            html;


    } catch (error) {

        console.error(
            "funguaBookingZangu error:",
            error
        );


        section.innerHTML = `

            <div class="booking-card">

                <h2>
                    📋 Booking Zangu
                </h2>

                <p style="color:red;">
                    ❌ Imeshindikana kupakia bookings.
                </p>

                <p>
                    ${error.message}
                </p>

            </div>

        `;

    }

}


/* =========================================================
   54. OPEN NOTIFICATIONS
========================================================= */

async function funguaTaarifa() {

    if (!currentUser) {

        alert(
            "Tafadhali ingia kwenye account kwanza."
        );

        return;

    }


    hideAllMainSections();


    const section =
        document.getElementById(
            "taarifaSection"
        );


    if (!section) {
        return;
    }


    section.style.display =
        "block";


    section.innerHTML = `

        <div class="booking-card">

            <h2>
                🔔 Taarifa
            </h2>

            <p>
                ⏳ Inapakia taarifa...
            </p>

        </div>

    `;


    try {

        const snapshot =
            await db
                .collection("users")
                .doc(currentUser.uid)
                .collection("notifications")
                .orderBy(
                    "createdAt",
                    "desc"
                )
                .limit(50)
                .get();


        if (snapshot.empty) {

            section.innerHTML = `

                <div class="booking-card">

                    <h2>
                        🔔 Taarifa
                    </h2>

                    <p>
                        Hakuna taarifa kwa sasa.
                    </p>

                </div>

            `;

            return;

        }


        let html = `

            <div class="booking-card">

                <h2>
                    🔔 Taarifa
                </h2>

        `;


        snapshot.docs.forEach(
            doc => {

                const notification =
                    doc.data();


                html += `

                    <div
                        class="booking-card"
                        style="
                            margin-top:12px;
                        "
                    >

                        <h3>
                            ${
                                notification.title ||
                                "Taarifa"
                            }
                        </h3>

                        <p>
                            ${
                                notification.message ||
                                ""
                            }
                        </p>

                        <button
                            class="endeleaBtn"
                            onclick="markNotificationRead('${doc.id}')"
                        >
                            ${
                                notification.read
                                ? "✓ Imesomwa"
                                : "✓ Weka kuwa imesomwa"
                            }
                        </button>

                    </div>

                `;

            }
        );


        html += `

            </div>

        `;


        section.innerHTML =
            html;


    } catch (error) {

        console.error(
            "funguaTaarifa error:",
            error
        );


        section.innerHTML = `

            <div class="booking-card">

                <h2>
                    🔔 Taarifa
                </h2>

                <p style="color:red;">
                    ❌ Imeshindikana kupakia taarifa.
                </p>

                <p>
                    ${error.message}
                </p>

            </div>

        `;

    }

}


/* =========================================================
   55. MARK NOTIFICATION AS READ
========================================================= */

async function markNotificationRead(
    notificationId
) {

    if (!currentUser) {
        return;
    }


    if (!notificationId) {
        return;
    }


    try {

        await db
            .collection("users")
            .doc(currentUser.uid)
            .collection("notifications")
            .doc(notificationId)
            .update({

                read:
                    true,

                readAt:
                    firebase.firestore
                        .FieldValue
                        .serverTimestamp()

            });


        funguaTaarifa();


    } catch (error) {

        console.error(
            "markNotificationRead error:",
            error
        );

    }

}


/* =========================================================
   56. COUNT UNREAD NOTIFICATIONS
========================================================= */

async function getUnreadNotificationCount() {

    if (!currentUser) {
        return 0;
    }


    try {

        const snapshot =
            await db
                .collection("users")
                .doc(currentUser.uid)
                .collection("notifications")
                .where(
                    "read",
                    "==",
                    false
                )
                .get();


        return snapshot.size;


    } catch (error) {

        console.error(
            "getUnreadNotificationCount error:",
            error
        );


        return 0;

    }

}


/* =========================================================
   57. UPDATE NOTIFICATION BUTTON
========================================================= */

async function updateNotificationButton() {

    const button =
        document.getElementById(
            "taarifaBtn"
        );


    if (!button) {
        return;
    }


    if (!currentUser) {

        button.textContent =
            "🔔 Taarifa";

        return;

    }


    const count =
        await getUnreadNotificationCount();


    if (count > 0) {

        button.textContent =
            "🔔 Taarifa (" +
            count +
            ")";

    } else {

        button.textContent =
            "🔔 Taarifa";

    }

}


/* =========================================================
   58. NOTIFICATION LISTENER
========================================================= */

function startNotificationListener() {

    if (!currentUser) {
        return;
    }


    if (
        typeof unsubscribeNotifications ===
        "function"
    ) {

        unsubscribeNotifications();

    }


    unsubscribeNotifications =
        db
            .collection("users")
            .doc(currentUser.uid)
            .collection("notifications")
            .where(
                "read",
                "==",
                false
            )
            .onSnapshot(

                snapshot => {

                    const button =
                        document.getElementById(
                            "taarifaBtn"
                        );


                    if (!button) {
                        return;
                    }


                    const count =
                        snapshot.size;


                    if (count > 0) {

                        button.textContent =
                            "🔔 Taarifa (" +
                            count +
                            ")";

                    } else {

                        button.textContent =
                            "🔔 Taarifa";

                    }

                },

                error => {

                    console.error(
                        "Notification listener error:",
                        error
                    );

                }

            );

}


/* =========================================================
   59. START USER SERVICES
========================================================= */

async function startUserServices() {

    if (!currentUser) {
        return;
    }


    await loadCurrentUser();


    await ensureUserReferralCode();


    startNotificationListener();


    await updateNotificationButton();


    autoFillReferralCode();

}


/* =========================================================
   60. UPDATE AUTH STATE SERVICES
========================================================= */

auth.onAuthStateChanged(
    async user => {

        currentUser =
            user;


        if (!user) {

            currentUserData =
                null;

            isAdmin =
                false;


            if (
                typeof unsubscribeNotifications ===
                "function"
            ) {

                unsubscribeNotifications();

                unsubscribeNotifications =
                    null;

            }


            const notificationButton =
                document.getElementById(
                    "taarifaBtn"
                );


            if (notificationButton) {

                notificationButton.textContent =
                    "🔔 Taarifa";

            }


            return;

        }


        try {

            await startUserServices();

        } catch (error) {

            console.error(
                "startUserServices error:",
                error
            );

        }

    }
);


/* =========================================================
   61. AUTO REFERRAL ON PAGE LOAD
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        setTimeout(
            function () {

                autoFillReferralCode();

            },
            500
        );

    }
);


/* =========================================================
   62. END OF SEHEMU YA 3
========================================================= */
/* =========================================================
   ROOMRENT - SEHEMU YA 4
   ADMIN DASHBOARD + PAYMENT CONFIRMATION
   ========================================================= */


/* =========================================================
   4.1 ADMIN STATE
========================================================= */

let currentAdminUser = null;


/* =========================================================
   4.2 CHECK ADMIN ROLE
========================================================= */

async function checkAdminRole(uid) {

    try {

        if (!uid) return false;

        const userDoc =
            await db.collection("users")
                .doc(uid)
                .get();

        if (!userDoc.exists) {
            return false;
        }

        const userData = userDoc.data();

        return userData.role === "admin";

    } catch (error) {

        console.error(
            "Admin role error:",
            error
        );

        return false;
    }
}


/* =========================================================
   4.3 OPEN ADMIN LOGIN
========================================================= */

function funguaAdmin() {

    const modal =
        document.getElementById("adminLoginModal");

    if (!modal) return;

    modal.style.display = "flex";

    const message =
        document.getElementById("adminLoginMessage");

    if (message) {
        message.style.display = "none";
        message.textContent = "";
    }
}


/* =========================================================
   4.4 CLOSE ADMIN LOGIN
========================================================= */

function fungaAdminLogin() {

    const modal =
        document.getElementById("adminLoginModal");

    if (!modal) return;

    modal.style.display = "none";
}


/* =========================================================
   4.5 ADMIN LOGIN
========================================================= */

async function adminLogin() {

    const username =
        document.getElementById("adminUsername");

    const password =
        document.getElementById("adminPassword");

    const message =
        document.getElementById("adminLoginMessage");

    if (!username || !password || !message) {
        return;
    }

    const email =
        username.value.trim();

    const pass =
        password.value;

    if (!email || !pass) {

        message.style.display = "block";

        message.style.color = "red";

        message.textContent =
            "⚠️ Ingiza Email na Password.";

        return;
    }


    try {

        message.style.display = "block";

        message.style.color = "black";

        message.textContent =
            "⏳ Inaingia..." ;


        /*
         * ADMIN ANAINGIA KUPITIA FIREBASE AUTH
         * Username field inatumika kama EMAIL.
         */

        const credential =
            await auth.signInWithEmailAndPassword(
                email,
                pass
            );


        const isAdmin =
            await checkAdminRole(
                credential.user.uid
            );


        if (!isAdmin) {

            await auth.signOut();

            message.style.color = "red";

            message.textContent =
                "❌ Akaunti hii haina ruhusa ya Admin.";

            return;
        }


        currentAdminUser =
            credential.user;


        message.style.color = "green";

        message.textContent =
            "✅ Admin login imefanikiwa.";


        setTimeout(() => {

            fungaAdminLogin();

            funguaAdminDashboard();

        }, 700);


    } catch (error) {

        console.error(
            "Admin login error:",
            error
        );

        message.style.display = "block";

        message.style.color = "red";

        let errorText =
            "❌ Imeshindikana kuingia.";

        if (
            error.code ===
            "auth/invalid-credential"
        ) {

            errorText =
                "❌ Email au Password si sahihi.";

        } else if (
            error.code ===
            "auth/user-not-found"
        ) {

            errorText =
                "❌ Admin account haipo.";

        } else if (
            error.code ===
            "auth/wrong-password"
        ) {

            errorText =
                "❌ Password si sahihi.";

        } else if (
            error.code ===
            "auth/invalid-email"
        ) {

            errorText =
                "❌ Email si sahihi.";

        }

        message.textContent =
            errorText;
    }
}


/* =========================================================
   4.6 ADMIN DASHBOARD
========================================================= */

async function funguaAdminDashboard() {

    const section =
        document.getElementById("taarifaSection");

    if (!section) return;


    section.style.display = "block";


    section.innerHTML = `

        <div class="booking-card">

            <h2>🔐 RoomRent Admin Dashboard</h2>

            <p>
                Karibu Admin.
                Hapa unaweza kusimamia malipo na bookings.
            </p>


            <div style="
                display:flex;
                gap:10px;
                flex-wrap:wrap;
                margin:15px 0;
            ">

                <button
                    class="thibitishaBtn"
                    onclick="loadAdminPaymentRequests()">
                    💳 Payment Requests
                </button>

                <button
                    class="endeleaBtn"
                    onclick="loadAdminBookings()">
                    📋 Bookings
                </button>

                <button
                    class="endeleaBtn"
                    onclick="loadAdminUsers()">
                    👥 Users
                </button>

                <button
                    class="endeleaBtn"
                    onclick="adminLogout()">
                    🚪 Logout
                </button>

            </div>


            <div id="adminDashboardContent">

                <p>
                    Chagua sehemu unayotaka kusimamia.
                </p>

            </div>

        </div>
    `;


    await loadAdminPaymentRequests();
}


/* =========================================================
   4.7 ADMIN LOGOUT
========================================================= */

async function adminLogout() {

    try {

        await auth.signOut();

        currentAdminUser = null;

        const section =
            document.getElementById(
                "taarifaSection"
            );

        if (section) {

            section.innerHTML = "";

            section.style.display =
                "none";
        }

        alert(
            "✅ Admin ametoka kwenye mfumo."
        );

    } catch (error) {

        console.error(
            "Admin logout error:",
            error
        );

    }
}


/* =========================================================
   4.8 LOAD PAYMENT REQUESTS
========================================================= */

async function loadAdminPaymentRequests() {

    const content =
        document.getElementById(
            "adminDashboardContent"
        );

    if (!content) return;


    content.innerHTML = `
        <p>⏳ Inapakia payment requests...</p>
    `;


    try {

        const snapshot =
            await db.collection(
                "paymentRequests"
            )
            .orderBy(
                "createdAt",
                "desc"
            )
            .get();


        if (snapshot.empty) {

            content.innerHTML = `

                <div style="
                    padding:15px;
                    border:1px solid #ddd;
                    border-radius:10px;
                ">

                    <h3>💳 Payment Requests</h3>

                    <p>
                        Hakuna payment request kwa sasa.
                    </p>

                </div>
            `;

            return;
        }


        let html = `

            <h3>💳 Payment Requests</h3>

        `;


        snapshot.forEach(doc => {

            const data =
                doc.data();

            const id =
                doc.id;


            const created =
                formatDateTime(
                    data.createdAt
                );


            const status =
                data.status ||
                "Waiting Confirmation";


            let statusText = "";

            if (
                status ===
                "Waiting Confirmation"
            ) {

                statusText =
                    "🟡 Inasubiri uthibitisho";

            } else if (
                status === "Confirmed"
            ) {

                statusText =
                    "🟢 Imethibitishwa";

            } else if (
                status === "Rejected"
            ) {

                statusText =
                    "🔴 Imekataliwa";

            } else {

                statusText =
                    status;
            }


            html += `

                <div
                    style="
                        border:1px solid #ddd;
                        border-radius:12px;
                        padding:15px;
                        margin:15px 0;
                    "
                >

                    <h4>
                        💳 Payment Request
                    </h4>

                    <p>
                        <strong>Booking:</strong>
                        ${escapeHtml(
                            data.bookingNumber || "-"
                        )}
                    </p>

                    <p>
                        <strong>Mteja:</strong>
                        ${escapeHtml(
                            data.customerName || "-"
                        )}
                    </p>

                    <p>
                        <strong>Room:</strong>
                        ${escapeHtml(
                            data.roomNumber || "-"
                        )}
                    </p>

                    <p>
                        <strong>Kiasi:</strong>
                        TSh ${formatMoney(
                            data.amount || 0
                        )}
                    </p>

                    <p>
                        <strong>Njia ya malipo:</strong>
                        ${escapeHtml(
                            data.paymentMethod || "-"
                        )}
                    </p>

                    <p>
                        <strong>Namba iliyotumika kulipa:</strong>
                        ${escapeHtml(
                            data.paymentPhone || "-"
                        )}
                    </p>

                    <p>
                        <strong>RoomRent number:</strong>
                        ${escapeHtml(
                            data.receivingNumber || "-"
                        )}
                    </p>

                    <p>
                        <strong>Jina la mpokeaji:</strong>
                        ${escapeHtml(
                            data.receivingName || "-"
                        )}
                    </p>

                    <p>
                        <strong>Tarehe:</strong>
                        ${created}
                    </p>

                    <p>
                        <strong>Status:</strong>
                        ${statusText}
                    </p>

            `;


            if (
                status ===
                "Waiting Confirmation"
            ) {

                html += `

                    <div style="
                        display:flex;
                        gap:10px;
                        flex-wrap:wrap;
                        margin-top:15px;
                    ">

                        <button
                            class="thibitishaBtn"
                            onclick="confirmPayment('${id}')">
                            ✅ Confirm Payment
                        </button>

                        <button
                            class="endeleaBtn"
                            onclick="rejectPayment('${id}')">
                            ❌ Reject Payment
                        </button>

                    </div>

                `;
            }


            if (
                status === "Confirmed"
            ) {

                html += `

                    <p style="color:green;">
                        ✅ Payment hii tayari imethibitishwa.
                    </p>

                `;
            }


            if (
                status === "Rejected"
            ) {

                html += `

                    <p style="color:red;">
                        ❌ Payment hii imekataliwa.
                    </p>

                `;
            }


            html += `

                </div>

            `;

        });


        content.innerHTML =
            html;


    } catch (error) {

        console.error(
            "Load payment requests error:",
            error
        );

        content.innerHTML = `

            <p style="color:red;">
                ❌ Imeshindikana kupakia payment requests.
            </p>

        `;
    }
}


/* =========================================================
   4.9 CONFIRM PAYMENT
========================================================= */

async function confirmPayment(
    paymentRequestId
) {

    if (!paymentRequestId) {
        return;
    }


    const confirmed =
        confirm(
            "⚠️ Hakikisha umeona na kuthibitisha malipo halisi kwenye MIXX BY YAS/Airtel Money kabla ya kubonyeza OK.\n\nEndelea?"
        );


    if (!confirmed) {
        return;
    }


    try {

        const admin =
            auth.currentUser;


        if (!admin) {

            alert(
                "❌ Admin hajaingia."
            );

            return;
        }


        const isAdmin =
            await checkAdminRole(
                admin.uid
            );


        if (!isAdmin) {

            alert(
                "❌ Huna ruhusa ya Admin."
            );

            return;
        }


        const paymentRef =
            db.collection(
                "paymentRequests"
            )
            .doc(paymentRequestId);


        const paymentSnap =
            await paymentRef.get();


        if (!paymentSnap.exists) {

            alert(
                "❌ Payment request haipatikani."
            );

            return;
        }


        const payment =
            paymentSnap.data();


        if (
            payment.status !==
            "Waiting Confirmation"
        ) {

            alert(
                "⚠️ Payment hii tayari imeshughulikiwa."
            );

            await loadAdminPaymentRequests();

            return;
        }


        const bookingId =
            payment.bookingId;


        if (!bookingId) {

            alert(
                "❌ Booking ID haipo kwenye payment request."
            );

            return;
        }


        const bookingRef =
            db.collection(
                "bookings"
            )
            .doc(bookingId);


        const bookingSnap =
            await bookingRef.get();


        if (!bookingSnap.exists) {

            alert(
                "❌ Booking haipatikani."
            );

            return;
        }


        const booking =
            bookingSnap.data();


        /*
         * UPDATE PAYMENT
         */

        await paymentRef.update({

            status: "Confirmed",

            confirmedAt:
                firebase.firestore.FieldValue.serverTimestamp(),

            confirmedBy:
                admin.uid,

            confirmedByEmail:
                admin.email || ""

        });


        /*
         * UPDATE BOOKING
         */

        await bookingRef.update({

            paymentStatus: "Paid",

            status: "Confirmed",

            paymentConfirmedAt:
                firebase.firestore.FieldValue.serverTimestamp(),

            paymentConfirmedBy:
                admin.uid

        });


        /*
         * CUSTOMER NOTIFICATION
         */

        if (booking.userId) {

            await createNotification(

                booking.userId,

                "Payment Confirmed",

                `Malipo yako ya Booking ${booking.bookingNumber || ""} yamethibitishwa. Booking yako sasa imethibitishwa.`

            );

        }


        /*
         * REFERRAL COMMISSION
         *
         * Commission inaanza hapa tu,
         * baada ya payment confirmation.
         */

        try {

            await distributeReferralCommission(
                booking
            );

        } catch (commissionError) {

            console.error(
                "Commission error:",
                commissionError
            );

        }


        alert(
            "✅ Payment imethibitishwa na booking imekuwa Confirmed."
        );


        await loadAdminPaymentRequests();


    } catch (error) {

        console.error(
            "Confirm payment error:",
            error
        );

        alert(
            "❌ Imeshindikana kuthibitisha payment."
        );
    }
}


/* =========================================================
   4.10 REJECT PAYMENT
========================================================= */

async function rejectPayment(
    paymentRequestId
) {

    if (!paymentRequestId) {
        return;
    }


    const reason =
        prompt(
            "Andika sababu ya kukataa payment:"
        );


    if (
        reason === null
    ) {

        return;
    }


    const finalReason =
        reason.trim() ||
        "Payment haikuthibitishwa.";


    const confirmed =
        confirm(
            "Una uhakika unataka kukataa payment hii?"
        );


    if (!confirmed) {
        return;
    }


    try {

        const admin =
            auth.currentUser;


        if (!admin) {

            alert(
                "❌ Admin hajaingia."
            );

            return;
        }


        const isAdmin =
            await checkAdminRole(
                admin.uid
            );


        if (!isAdmin) {

            alert(
                "❌ Huna ruhusa ya Admin."
            );

            return;
        }


        const paymentRef =
            db.collection(
                "paymentRequests"
            )
            .doc(paymentRequestId);


        const paymentSnap =
            await paymentRef.get();


        if (!paymentSnap.exists) {

            alert(
                "❌ Payment request haipatikani."
            );

            return;
        }


        const payment =
            paymentSnap.data();


        if (
            payment.status !==
            "Waiting Confirmation"
        ) {

            alert(
                "⚠️ Payment hii tayari imeshughulikiwa."
            );

            return;
        }


        const bookingId =
            payment.bookingId;


        await paymentRef.update({

            status: "Rejected",

            rejectionReason:
                finalReason,

            rejectedAt:
                firebase.firestore.FieldValue.serverTimestamp(),

            rejectedBy:
                admin.uid,

            rejectedByEmail:
                admin.email || ""

        });


        if (bookingId) {

            const bookingRef =
                db.collection(
                    "bookings"
                )
                .doc(bookingId);


            await bookingRef.update({

                paymentStatus:
                    "Rejected",

                status:
                    "Payment Rejected",

                rejectionReason:
                    finalReason,

                rejectedAt:
                    firebase.firestore.FieldValue.serverTimestamp(),

                rejectedBy:
                    admin.uid

            });


            if (payment.userId) {

                await createNotification(

                    payment.userId,

                    "Payment Rejected",

                    `Malipo ya Booking ${payment.bookingNumber || ""} hayajathibitishwa. Sababu: ${finalReason}`

                );

            }

        }


        alert(
            "❌ Payment imekataliwa."
        );


        await loadAdminPaymentRequests();


    } catch (error) {

        console.error(
            "Reject payment error:",
            error
        );

        alert(
            "❌ Imeshindikana kukataa payment."
        );
    }
}


/* =========================================================
   4.11 LOAD ADMIN BOOKINGS
========================================================= */

async function loadAdminBookings() {

    const content =
        document.getElementById(
            "adminDashboardContent"
        );

    if (!content) return;


    content.innerHTML = `
        <p>⏳ Inapakia bookings...</p>
    `;


    try {

        const snapshot =
            await db.collection(
                "bookings"
            )
            .orderBy(
                "createdAt",
                "desc"
            )
            .get();


        if (snapshot.empty) {

            content.innerHTML = `
                <h3>📋 Bookings</h3>
                <p>Hakuna bookings.</p>
            `;

            return;
        }


        let html = `
            <h3>📋 Bookings Zote</h3>
        `;


        snapshot.forEach(doc => {

            const data =
                doc.data();


            html += `

                <div style="
                    border:1px solid #ddd;
                    border-radius:12px;
                    padding:15px;
                    margin:12px 0;
                ">

                    <p>
                        <strong>Booking:</strong>
                        ${escapeHtml(
                            data.bookingNumber || "-"
                        )}
                    </p>

                    <p>
                        <strong>Mteja:</strong>
                        ${escapeHtml(
                            data.customerName || "-"
                        )}
                    </p>

                    <p>
                        <strong>Simu:</strong>
                        ${escapeHtml(
                            data.phone || "-"
                        )}
                    </p>

                    <p>
                        <strong>Room:</strong>
                        ${escapeHtml(
                            data.roomNumber || "-"
                        )}
                    </p>

                    <p>
                        <strong>Kiasi:</strong>
                        TSh ${formatMoney(
                            data.amount || 0
                        )}
                    </p>

                    <p>
                        <strong>Payment:</strong>
                        ${escapeHtml(
                            data.paymentStatus || "-"
                        )}
                    </p>

                    <p>
                        <strong>Status:</strong>
                        ${escapeHtml(
                            data.status || "-"
                        )}
                    </p>

                </div>

            `;

        });


        content.innerHTML =
            html;


    } catch (error) {

        console.error(
            "Load admin bookings error:",
            error
        );

        content.innerHTML = `

            <p style="color:red;">
                ❌ Imeshindikana kupakia bookings.
            </p>

        `;
    }
}


/* =========================================================
   4.12 LOAD USERS
========================================================= */

async function loadAdminUsers() {

    const content =
        document.getElementById(
            "adminDashboardContent"
        );

    if (!content) return;


    content.innerHTML = `
        <p>⏳ Inapakia users...</p>
    `;


    try {

        const snapshot =
            await db.collection(
                "users"
            )
            .orderBy(
                "createdAt",
                "desc"
            )
            .get();


        if (snapshot.empty) {

            content.innerHTML = `
                <h3>👥 Users</h3>
                <p>Hakuna users.</p>
            `;

            return;
        }


        let html = `
            <h3>👥 Users</h3>
        `;


        snapshot.forEach(doc => {

            const data =
                doc.data();


            html += `

                <div style="
                    border:1px solid #ddd;
                    border-radius:12px;
                    padding:15px;
                    margin:12px 0;
                ">

                    <p>
                        <strong>Jina:</strong>
                        ${escapeHtml(
                            data.name || "-"
                        )}
                    </p>

                    <p>
                        <strong>Email:</strong>
                        ${escapeHtml(
                            data.email || "-"
                        )}
                    </p>

                    <p>
                        <strong>Phone:</strong>
                        ${escapeHtml(
                            data.phone || "-"
                        )}
                    </p>

                    <p>
                        <strong>Referral Code:</strong>
                        ${escapeHtml(
                            data.referralCode || "-"
                        )}
                    </p>

                    <p>
                        <strong>Commission:</strong>
                        TSh ${formatMoney(
                            data.totalCommission || 0
                        )}
                    </p>

                    <p>
                        <strong>Role:</strong>
                        ${escapeHtml(
                            data.role || "user"
                        )}
                    </p>

                </div>

            `;

        });


        content.innerHTML =
            html;


    } catch (error) {

        console.error(
            "Load admin users error:",
            error
        );

        content.innerHTML = `

            <p style="color:red;">
                ❌ Imeshindikana kupakia users.
            </p>

        `;
    }
}


/* =========================================================
   4.13 FORMAT MONEY
========================================================= */

function formatMoney(amount) {

    const number =
        Number(amount) || 0;

    return number.toLocaleString(
        "en-US"
    );
}


/* =========================================================
   4.14 FORMAT DATE/TIME
========================================================= */

function formatDateTime(
    timestamp
) {

    if (!timestamp) {
        return "-";
    }


    try {

        let date;


        if (
            timestamp.toDate
        ) {

            date =
                timestamp.toDate();

        } else {

            date =
                new Date(timestamp);
        }


        return date.toLocaleString(
            "sw-TZ"
        );

    } catch (error) {

        return "-";
    }
}


/* =========================================================
   4.15 ESCAPE HTML
========================================================= */

function escapeHtml(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";
    }


    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================================================
   4.16 ADMIN AUTH STATE
========================================================= */

auth.onAuthStateChanged(
    async function(user) {

        if (!user) {

            currentAdminUser = null;

            return;
        }


        try {

            const isAdmin =
                await checkAdminRole(
                    user.uid
                );


            if (isAdmin) {

                currentAdminUser =
                    user;

                console.log(
                    "✅ Admin authenticated:",
                    user.email
                );

            }

        } catch (error) {

            console.error(
                "Admin auth state error:",
                error
            );
        }

    }
);


/* =========================================================
   4.17 ADMIN DASHBOARD BUTTON SUPPORT
========================================================= */

window.funguaAdmin =
    funguaAdmin;

window.fungaAdminLogin =
    fungaAdminLogin;

window.adminLogin =
    adminLogin;

window.funguaAdminDashboard =
    funguaAdminDashboard;

window.adminLogout =
    adminLogout;

window.loadAdminPaymentRequests =
    loadAdminPaymentRequests;

window.loadAdminBookings =
    loadAdminBookings;

window.loadAdminUsers =
    loadAdminUsers;

window.confirmPayment =
    confirmPayment;

window.rejectPayment =
    rejectPayment;


/* =========================================================
   SEHEMU YA 4 IMEISHIA HAPA
========================================================= *//* =========================================================
   ROOMRENT - SEHEMU YA 4
   ADMIN DASHBOARD + PAYMENT CONFIRMATION
   ========================================================= */


/* =========================================================
   4.1 ADMIN STATE
========================================================= */

let currentAdminUser = null;


/* =========================================================
   4.2 CHECK ADMIN ROLE
========================================================= */

async function checkAdminRole(uid) {

    try {

        if (!uid) return false;

        const userDoc =
            await db.collection("users")
                .doc(uid)
                .get();

        if (!userDoc.exists) {
            return false;
        }

        const userData = userDoc.data();

        return userData.role === "admin";

    } catch (error) {

        console.error(
            "Admin role error:",
            error
        );

        return false;
    }
}


/* =========================================================
   4.3 OPEN ADMIN LOGIN
========================================================= */

function funguaAdmin() {

    const modal =
        document.getElementById("adminLoginModal");

    if (!modal) return;

    modal.style.display = "flex";

    const message =
        document.getElementById("adminLoginMessage");

    if (message) {
        message.style.display = "none";
        message.textContent = "";
    }
}


/* =========================================================
   4.4 CLOSE ADMIN LOGIN
========================================================= */

function fungaAdminLogin() {

    const modal =
        document.getElementById("adminLoginModal");

    if (!modal) return;

    modal.style.display = "none";
}


/* =========================================================
   4.5 ADMIN LOGIN
========================================================= */

async function adminLogin() {

    const username =
        document.getElementById("adminUsername");

    const password =
        document.getElementById("adminPassword");

    const message =
        document.getElementById("adminLoginMessage");

    if (!username || !password || !message) {
        return;
    }

    const email =
        username.value.trim();

    const pass =
        password.value;

    if (!email || !pass) {

        message.style.display = "block";

        message.style.color = "red";

        message.textContent =
            "⚠️ Ingiza Email na Password.";

        return;
    }


    try {

        message.style.display = "block";

        message.style.color = "black";

        message.textContent =
            "⏳ Inaingia..." ;


        /*
         * ADMIN ANAINGIA KUPITIA FIREBASE AUTH
         * Username field inatumika kama EMAIL.
         */

        const credential =
            await auth.signInWithEmailAndPassword(
                email,
                pass
            );


        const isAdmin =
            await checkAdminRole(
                credential.user.uid
            );


        if (!isAdmin) {

            await auth.signOut();

            message.style.color = "red";

            message.textContent =
                "❌ Akaunti hii haina ruhusa ya Admin.";

            return;
        }


        currentAdminUser =
            credential.user;


        message.style.color = "green";

        message.textContent =
            "✅ Admin login imefanikiwa.";


        setTimeout(() => {

            fungaAdminLogin();

            funguaAdminDashboard();

        }, 700);


    } catch (error) {

        console.error(
            "Admin login error:",
            error
        );

        message.style.display = "block";

        message.style.color = "red";

        let errorText =
            "❌ Imeshindikana kuingia.";

        if (
            error.code ===
            "auth/invalid-credential"
        ) {

            errorText =
                "❌ Email au Password si sahihi.";

        } else if (
            error.code ===
            "auth/user-not-found"
        ) {

            errorText =
                "❌ Admin account haipo.";

        } else if (
            error.code ===
            "auth/wrong-password"
        ) {

            errorText =
                "❌ Password si sahihi.";

        } else if (
            error.code ===
            "auth/invalid-email"
        ) {

            errorText =
                "❌ Email si sahihi.";

        }

        message.textContent =
            errorText;
    }
}


/* =========================================================
   4.6 ADMIN DASHBOARD
========================================================= */

async function funguaAdminDashboard() {

    const section =
        document.getElementById("taarifaSection");

    if (!section) return;


    section.style.display = "block";


    section.innerHTML = `

        <div class="booking-card">

            <h2>🔐 RoomRent Admin Dashboard</h2>

            <p>
                Karibu Admin.
                Hapa unaweza kusimamia malipo na bookings.
            </p>


            <div style="
                display:flex;
                gap:10px;
                flex-wrap:wrap;
                margin:15px 0;
            ">

                <button
                    class="thibitishaBtn"
                    onclick="loadAdminPaymentRequests()">
                    💳 Payment Requests
                </button>

                <button
                    class="endeleaBtn"
                    onclick="loadAdminBookings()">
                    📋 Bookings
                </button>

                <button
                    class="endeleaBtn"
                    onclick="loadAdminUsers()">
                    👥 Users
                </button>

                <button
                    class="endeleaBtn"
                    onclick="adminLogout()">
                    🚪 Logout
                </button>

            </div>


            <div id="adminDashboardContent">

                <p>
                    Chagua sehemu unayotaka kusimamia.
                </p>

            </div>

        </div>
    `;


    await loadAdminPaymentRequests();
}


/* =========================================================
   4.7 ADMIN LOGOUT
========================================================= */

async function adminLogout() {

    try {

        await auth.signOut();

        currentAdminUser = null;

        const section =
            document.getElementById(
                "taarifaSection"
            );

        if (section) {

            section.innerHTML = "";

            section.style.display =
                "none";
        }

        alert(
            "✅ Admin ametoka kwenye mfumo."
        );

    } catch (error) {

        console.error(
            "Admin logout error:",
            error
        );

    }
}


/* =========================================================
   4.8 LOAD PAYMENT REQUESTS
========================================================= */

async function loadAdminPaymentRequests() {

    const content =
        document.getElementById(
            "adminDashboardContent"
        );

    if (!content) return;


    content.innerHTML = `
        <p>⏳ Inapakia payment requests...</p>
    `;


    try {

        const snapshot =
            await db.collection(
                "paymentRequests"
            )
            .orderBy(
                "createdAt",
                "desc"
            )
            .get();


        if (snapshot.empty) {

            content.innerHTML = `

                <div style="
                    padding:15px;
                    border:1px solid #ddd;
                    border-radius:10px;
                ">

                    <h3>💳 Payment Requests</h3>

                    <p>
                        Hakuna payment request kwa sasa.
                    </p>

                </div>
            `;

            return;
        }


        let html = `

            <h3>💳 Payment Requests</h3>

        `;


        snapshot.forEach(doc => {

            const data =
                doc.data();

            const id =
                doc.id;


            const created =
                formatDateTime(
                    data.createdAt
                );


            const status =
                data.status ||
                "Waiting Confirmation";


            let statusText = "";

            if (
                status ===
                "Waiting Confirmation"
            ) {

                statusText =
                    "🟡 Inasubiri uthibitisho";

            } else if (
                status === "Confirmed"
            ) {

                statusText =
                    "🟢 Imethibitishwa";

            } else if (
                status === "Rejected"
            ) {

                statusText =
                    "🔴 Imekataliwa";

            } else {

                statusText =
                    status;
            }


            html += `

                <div
                    style="
                        border:1px solid #ddd;
                        border-radius:12px;
                        padding:15px;
                        margin:15px 0;
                    "
                >

                    <h4>
                        💳 Payment Request
                    </h4>

                    <p>
                        <strong>Booking:</strong>
                        ${escapeHtml(
                            data.bookingNumber || "-"
                        )}
                    </p>

                    <p>
                        <strong>Mteja:</strong>
                        ${escapeHtml(
                            data.customerName || "-"
                        )}
                    </p>

                    <p>
                        <strong>Room:</strong>
                        ${escapeHtml(
                            data.roomNumber || "-"
                        )}
                    </p>

                    <p>
                        <strong>Kiasi:</strong>
                        TSh ${formatMoney(
                            data.amount || 0
                        )}
                    </p>

                    <p>
                        <strong>Njia ya malipo:</strong>
                        ${escapeHtml(
                            data.paymentMethod || "-"
                        )}
                    </p>

                    <p>
                        <strong>Namba iliyotumika kulipa:</strong>
                        ${escapeHtml(
                            data.paymentPhone || "-"
                        )}
                    </p>

                    <p>
                        <strong>RoomRent number:</strong>
                        ${escapeHtml(
                            data.receivingNumber || "-"
                        )}
                    </p>

                    <p>
                        <strong>Jina la mpokeaji:</strong>
                        ${escapeHtml(
                            data.receivingName || "-"
                        )}
                    </p>

                    <p>
                        <strong>Tarehe:</strong>
                        ${created}
                    </p>

                    <p>
                        <strong>Status:</strong>
                        ${statusText}
                    </p>

            `;


            if (
                status ===
                "Waiting Confirmation"
            ) {

                html += `

                    <div style="
                        display:flex;
                        gap:10px;
                        flex-wrap:wrap;
                        margin-top:15px;
                    ">

                        <button
                            class="thibitishaBtn"
                            onclick="confirmPayment('${id}')">
                            ✅ Confirm Payment
                        </button>

                        <button
                            class="endeleaBtn"
                            onclick="rejectPayment('${id}')">
                            ❌ Reject Payment
                        </button>

                    </div>

                `;
            }


            if (
                status === "Confirmed"
            ) {

                html += `

                    <p style="color:green;">
                        ✅ Payment hii tayari imethibitishwa.
                    </p>

                `;
            }


            if (
                status === "Rejected"
            ) {

                html += `

                    <p style="color:red;">
                        ❌ Payment hii imekataliwa.
                    </p>

                `;
            }


            html += `

                </div>

            `;

        });


        content.innerHTML =
            html;


    } catch (error) {

        console.error(
            "Load payment requests error:",
            error
        );

        content.innerHTML = `

            <p style="color:red;">
                ❌ Imeshindikana kupakia payment requests.
            </p>

        `;
    }
}


/* =========================================================
   4.9 CONFIRM PAYMENT
========================================================= */

async function confirmPayment(
    paymentRequestId
) {

    if (!paymentRequestId) {
        return;
    }


    const confirmed =
        confirm(
            "⚠️ Hakikisha umeona na kuthibitisha malipo halisi kwenye MIXX BY YAS/Airtel Money kabla ya kubonyeza OK.\n\nEndelea?"
        );


    if (!confirmed) {
        return;
    }


    try {

        const admin =
            auth.currentUser;


        if (!admin) {

            alert(
                "❌ Admin hajaingia."
            );

            return;
        }


        const isAdmin =
            await checkAdminRole(
                admin.uid
            );


        if (!isAdmin) {

            alert(
                "❌ Huna ruhusa ya Admin."
            );

            return;
        }


        const paymentRef =
            db.collection(
                "paymentRequests"
            )
            .doc(paymentRequestId);


        const paymentSnap =
            await paymentRef.get();


        if (!paymentSnap.exists) {

            alert(
                "❌ Payment request haipatikani."
            );

            return;
        }


        const payment =
            paymentSnap.data();


        if (
            payment.status !==
            "Waiting Confirmation"
        ) {

            alert(
                "⚠️ Payment hii tayari imeshughulikiwa."
            );

            await loadAdminPaymentRequests();

            return;
        }


        const bookingId =
            payment.bookingId;


        if (!bookingId) {

            alert(
                "❌ Booking ID haipo kwenye payment request."
            );

            return;
        }


        const bookingRef =
            db.collection(
                "bookings"
            )
            .doc(bookingId);


        const bookingSnap =
            await bookingRef.get();


        if (!bookingSnap.exists) {

            alert(
                "❌ Booking haipatikani."
            );

            return;
        }


        const booking =
            bookingSnap.data();


        /*
         * UPDATE PAYMENT
         */

        await paymentRef.update({

            status: "Confirmed",

            confirmedAt:
                firebase.firestore.FieldValue.serverTimestamp(),

            confirmedBy:
                admin.uid,

            confirmedByEmail:
                admin.email || ""

        });


        /*
         * UPDATE BOOKING
         */

        await bookingRef.update({

            paymentStatus: "Paid",

            status: "Confirmed",

            paymentConfirmedAt:
                firebase.firestore.FieldValue.serverTimestamp(),

            paymentConfirmedBy:
                admin.uid

        });


        /*
         * CUSTOMER NOTIFICATION
         */

        if (booking.userId) {

            await createNotification(

                booking.userId,

                "Payment Confirmed",

                `Malipo yako ya Booking ${booking.bookingNumber || ""} yamethibitishwa. Booking yako sasa imethibitishwa.`

            );

        }


        /*
         * REFERRAL COMMISSION
         *
         * Commission inaanza hapa tu,
         * baada ya payment confirmation.
         */

        try {

            await distributeReferralCommission(
                booking
            );

        } catch (commissionError) {

            console.error(
                "Commission error:",
                commissionError
            );

        }


        alert(
            "✅ Payment imethibitishwa na booking imekuwa Confirmed."
        );


        await loadAdminPaymentRequests();


    } catch (error) {

        console.error(
            "Confirm payment error:",
            error
        );

        alert(
            "❌ Imeshindikana kuthibitisha payment."
        );
    }
}


/* =========================================================
   4.10 REJECT PAYMENT
========================================================= */

async function rejectPayment(
    paymentRequestId
) {

    if (!paymentRequestId) {
        return;
    }


    const reason =
        prompt(
            "Andika sababu ya kukataa payment:"
        );


    if (
        reason === null
    ) {

        return;
    }


    const finalReason =
        reason.trim() ||
        "Payment haikuthibitishwa.";


    const confirmed =
        confirm(
            "Una uhakika unataka kukataa payment hii?"
        );


    if (!confirmed) {
        return;
    }


    try {

        const admin =
            auth.currentUser;


        if (!admin) {

            alert(
                "❌ Admin hajaingia."
            );

            return;
        }


        const isAdmin =
            await checkAdminRole(
                admin.uid
            );


        if (!isAdmin) {

            alert(
                "❌ Huna ruhusa ya Admin."
            );

            return;
        }


        const paymentRef =
            db.collection(
                "paymentRequests"
            )
            .doc(paymentRequestId);


        const paymentSnap =
            await paymentRef.get();


        if (!paymentSnap.exists) {

            alert(
                "❌ Payment request haipatikani."
            );

            return;
        }


        const payment =
            paymentSnap.data();


        if (
            payment.status !==
            "Waiting Confirmation"
        ) {

            alert(
                "⚠️ Payment hii tayari imeshughulikiwa."
            );

            return;
        }


        const bookingId =
            payment.bookingId;


        await paymentRef.update({

            status: "Rejected",

            rejectionReason:
                finalReason,

            rejectedAt:
                firebase.firestore.FieldValue.serverTimestamp(),

            rejectedBy:
                admin.uid,

            rejectedByEmail:
                admin.email || ""

        });


        if (bookingId) {

            const bookingRef =
                db.collection(
                    "bookings"
                )
                .doc(bookingId);


            await bookingRef.update({

                paymentStatus:
                    "Rejected",

                status:
                    "Payment Rejected",

                rejectionReason:
                    finalReason,

                rejectedAt:
                    firebase.firestore.FieldValue.serverTimestamp(),

                rejectedBy:
                    admin.uid

            });


            if (payment.userId) {

                await createNotification(

                    payment.userId,

                    "Payment Rejected",

                    `Malipo ya Booking ${payment.bookingNumber || ""} hayajathibitishwa. Sababu: ${finalReason}`

                );

            }

        }


        alert(
            "❌ Payment imekataliwa."
        );


        await loadAdminPaymentRequests();


    } catch (error) {

        console.error(
            "Reject payment error:",
            error
        );

        alert(
            "❌ Imeshindikana kukataa payment."
        );
    }
}


/* =========================================================
   4.11 LOAD ADMIN BOOKINGS
========================================================= */

async function loadAdminBookings() {

    const content =
        document.getElementById(
            "adminDashboardContent"
        );

    if (!content) return;


    content.innerHTML = `
        <p>⏳ Inapakia bookings...</p>
    `;


    try {

        const snapshot =
            await db.collection(
                "bookings"
            )
            .orderBy(
                "createdAt",
                "desc"
            )
            .get();


        if (snapshot.empty) {

            content.innerHTML = `
                <h3>📋 Bookings</h3>
                <p>Hakuna bookings.</p>
            `;

            return;
        }


        let html = `
            <h3>📋 Bookings Zote</h3>
        `;


        snapshot.forEach(doc => {

            const data =
                doc.data();


            html += `

                <div style="
                    border:1px solid #ddd;
                    border-radius:12px;
                    padding:15px;
                    margin:12px 0;
                ">

                    <p>
                        <strong>Booking:</strong>
                        ${escapeHtml(
                            data.bookingNumber || "-"
                        )}
                    </p>

                    <p>
                        <strong>Mteja:</strong>
                        ${escapeHtml(
                            data.customerName || "-"
                        )}
                    </p>

                    <p>
                        <strong>Simu:</strong>
                        ${escapeHtml(
                            data.phone || "-"
                        )}
                    </p>

                    <p>
                        <strong>Room:</strong>
                        ${escapeHtml(
                            data.roomNumber || "-"
                        )}
                    </p>

                    <p>
                        <strong>Kiasi:</strong>
                        TSh ${formatMoney(
                            data.amount || 0
                        )}
                    </p>

                    <p>
                        <strong>Payment:</strong>
                        ${escapeHtml(
                            data.paymentStatus || "-"
                        )}
                    </p>

                    <p>
                        <strong>Status:</strong>
                        ${escapeHtml(
                            data.status || "-"
                        )}
                    </p>

                </div>

            `;

        });


        content.innerHTML =
            html;


    } catch (error) {

        console.error(
            "Load admin bookings error:",
            error
        );

        content.innerHTML = `

            <p style="color:red;">
                ❌ Imeshindikana kupakia bookings.
            </p>

        `;
    }
}


/* =========================================================
   4.12 LOAD USERS
========================================================= */

async function loadAdminUsers() {

    const content =
        document.getElementById(
            "adminDashboardContent"
        );

    if (!content) return;


    content.innerHTML = `
        <p>⏳ Inapakia users...</p>
    `;


    try {

        const snapshot =
            await db.collection(
                "users"
            )
            .orderBy(
                "createdAt",
                "desc"
            )
            .get();


        if (snapshot.empty) {

            content.innerHTML = `
                <h3>👥 Users</h3>
                <p>Hakuna users.</p>
            `;

            return;
        }


        let html = `
            <h3>👥 Users</h3>
        `;


        snapshot.forEach(doc => {

            const data =
                doc.data();


            html += `

                <div style="
                    border:1px solid #ddd;
                    border-radius:12px;
                    padding:15px;
                    margin:12px 0;
                ">

                    <p>
                        <strong>Jina:</strong>
                        ${escapeHtml(
                            data.name || "-"
                        )}
                    </p>

                    <p>
                        <strong>Email:</strong>
                        ${escapeHtml(
                            data.email || "-"
                        )}
                    </p>

                    <p>
                        <strong>Phone:</strong>
                        ${escapeHtml(
                            data.phone || "-"
                        )}
                    </p>

                    <p>
                        <strong>Referral Code:</strong>
                        ${escapeHtml(
                            data.referralCode || "-"
                        )}
                    </p>

                    <p>
                        <strong>Commission:</strong>
                        TSh ${formatMoney(
                            data.totalCommission || 0
                        )}
                    </p>

                    <p>
                        <strong>Role:</strong>
                        ${escapeHtml(
                            data.role || "user"
                        )}
                    </p>

                </div>

            `;

        });


        content.innerHTML =
            html;


    } catch (error) {

        console.error(
            "Load admin users error:",
            error
        );

        content.innerHTML = `

            <p style="color:red;">
                ❌ Imeshindikana kupakia users.
            </p>

        `;
    }
}


/* =========================================================
   4.13 FORMAT MONEY
========================================================= */

function formatMoney(amount) {

    const number =
        Number(amount) || 0;

    return number.toLocaleString(
        "en-US"
    );
}


/* =========================================================
   4.14 FORMAT DATE/TIME
========================================================= */

function formatDateTime(
    timestamp
) {

    if (!timestamp) {
        return "-";
    }


    try {

        let date;


        if (
            timestamp.toDate
        ) {

            date =
                timestamp.toDate();

        } else {

            date =
                new Date(timestamp);
        }


        return date.toLocaleString(
            "sw-TZ"
        );

    } catch (error) {

        return "-";
    }
}


/* =========================================================
   4.15 ESCAPE HTML
========================================================= */

function escapeHtml(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";
    }


    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================================================
   4.16 ADMIN AUTH STATE
========================================================= */

auth.onAuthStateChanged(
    async function(user) {

        if (!user) {

            currentAdminUser = null;

            return;
        }


        try {

            const isAdmin =
                await checkAdminRole(
                    user.uid
                );


            if (isAdmin) {

                currentAdminUser =
                    user;

                console.log(
                    "✅ Admin authenticated:",
                    user.email
                );

            }

        } catch (error) {

            console.error(
                "Admin auth state error:",
                error
            );
        }

    }
);


/* =========================================================
   4.17 ADMIN DASHBOARD BUTTON SUPPORT
========================================================= */

window.funguaAdmin =
    funguaAdmin;

window.fungaAdminLogin =
    fungaAdminLogin;

window.adminLogin =
    adminLogin;

window.funguaAdminDashboard =
    funguaAdminDashboard;

window.adminLogout =
    adminLogout;

window.loadAdminPaymentRequests =
    loadAdminPaymentRequests;

window.loadAdminBookings =
    loadAdminBookings;

window.loadAdminUsers =
    loadAdminUsers;

window.confirmPayment =
    confirmPayment;

window.rejectPayment =
    rejectPayment;


/* =========================================================
   SEHEMU YA 4 IMEISHIA HAPA
========================================================= */
/* =========================================================
   ROOMRENT - SEHEMU YA 5
   WITHDRAWAL SYSTEM
   CUSTOMER + ADMIN
   ========================================================= */


/* =========================================================
   5.1 WITHDRAWAL SETTINGS
========================================================= */

const WITHDRAWAL_SETTINGS = {

    minimumAmount: 1000,

    currency: "TSh"

};


/* =========================================================
   5.2 OPEN WITHDRAWAL
========================================================= */

async function funguaWithdrawal() {

    const section =
        document.getElementById(
            "taarifaSection"
        );

    if (!section) return;


    section.style.display = "block";


    const user =
        auth.currentUser;


    if (!user) {

        section.innerHTML = `

            <div class="booking-card">

                <h2>💸 Withdrawal</h2>

                <p>
                    Tafadhali ingia kwenye account yako
                    kwanza ili kuomba withdrawal.
                </p>

                <button
                    class="thibitishaBtn"
                    onclick="funguaAccount()">

                    👤 Ingia / Account

                </button>

            </div>

        `;

        return;
    }


    try {

        const userRef =
            db.collection("users")
                .doc(user.uid);


        const userSnap =
            await userRef.get();


        if (!userSnap.exists) {

            section.innerHTML = `

                <div class="booking-card">

                    <h2>💸 Withdrawal</h2>

                    <p style="color:red;">
                        ❌ Taarifa za account hazijapatikana.
                    </p>

                </div>

            `;

            return;
        }


        const userData =
            userSnap.data();


        const balance =
            Number(
                userData.totalCommission || 0
            );


        section.innerHTML = `

            <div class="booking-card">

                <h2>💸 Withdrawal</h2>

                <div style="
                    padding:18px;
                    border-radius:12px;
                    margin:15px 0;
                    border:1px solid #ddd;
                ">

                    <h3>
                        💰 Commission Balance
                    </h3>

                    <p style="
                        font-size:25px;
                        font-weight:bold;
                    ">

                        TSh ${formatMoney(balance)}

                    </p>

                </div>


                <label>
                    💰 Kiasi cha kutoa
                </label>

                <input
                    type="number"
                    id="withdrawAmount"
                    placeholder="Mfano: 10000"
                    min="${WITHDRAWAL_SETTINGS.minimumAmount}"
                >


                <label>
                    📱 Namba ya kupokea pesa
                </label>

                <input
                    type="tel"
                    id="withdrawPhone"
                    placeholder="Mfano: 0712345678"
                >


                <label>
                    💳 Njia ya kupokea
                </label>

                <select id="withdrawMethod">

                    <option value="">
                        Chagua njia
                    </option>

                    <option value="Airtel Money">
                        Airtel Money
                    </option>

                    <option value="MIXX BY YAS">
                        MIXX BY YAS
                    </option>

                </select>


                <p style="
                    font-size:13px;
                    margin-top:10px;
                ">

                    Minimum withdrawal:
                    TSh ${formatMoney(
                        WITHDRAWAL_SETTINGS.minimumAmount
                    )}

                </p>


                <button
                    class="thibitishaBtn"
                    onclick="tumaWithdrawalRequest()">

                    💸 Omba Withdrawal

                </button>


                <button
                    class="endeleaBtn"
                    onclick="loadMyWithdrawals()">

                    📋 Withdrawal Zangu

                </button>


                <div id="withdrawalMessage"></div>


                <div
                    id="myWithdrawals"
                    style="margin-top:20px;"
                ></div>

            </div>

        `;


        await loadMyWithdrawals();


    } catch (error) {

        console.error(
            "Withdrawal page error:",
            error
        );

        section.innerHTML = `

            <div class="booking-card">

                <h2>💸 Withdrawal</h2>

                <p style="color:red;">
                    ❌ Imeshindikana kupakia taarifa.
                </p>

            </div>

        `;
    }
}


/* =========================================================
   5.3 SUBMIT WITHDRAWAL REQUEST
========================================================= */

async function tumaWithdrawalRequest() {

    const user =
        auth.currentUser;


    if (!user) {

        alert(
            "❌ Tafadhali ingia kwanza."
        );

        return;
    }


    const amountInput =
        document.getElementById(
            "withdrawAmount"
        );


    const phoneInput =
        document.getElementById(
            "withdrawPhone"
        );


    const methodInput =
        document.getElementById(
            "withdrawMethod"
        );


    const message =
        document.getElementById(
            "withdrawalMessage"
        );


    if (
        !amountInput ||
        !phoneInput ||
        !methodInput
    ) {

        return;
    }


    const amount =
        Number(
            amountInput.value
        );


    const phone =
        formatTanzaniaPhone(
            phoneInput.value.trim()
        );


    const method =
        methodInput.value;


    if (
        !amount ||
        amount <= 0
    ) {

        showWithdrawalMessage(
            "❌ Weka kiasi sahihi.",
            "red"
        );

        return;
    }


    if (
        amount <
        WITHDRAWAL_SETTINGS.minimumAmount
    ) {

        showWithdrawalMessage(

            `❌ Minimum withdrawal ni TSh ${formatMoney(
                WITHDRAWAL_SETTINGS.minimumAmount
            )}.`,

            "red"

        );

        return;
    }


    if (!phone) {

        showWithdrawalMessage(
            "❌ Weka namba sahihi ya simu.",
            "red"
        );

        return;
    }


    if (!method) {

        showWithdrawalMessage(
            "❌ Chagua njia ya kupokea pesa.",
            "red"
        );

        return;
    }


    try {

        showWithdrawalMessage(
            "⏳ Inatuma withdrawal request...",
            "black"
        );


        const userRef =
            db.collection("users")
                .doc(user.uid);


        const userSnap =
            await userRef.get();


        if (!userSnap.exists) {

            showWithdrawalMessage(
                "❌ Account haijapatikana.",
                "red"
            );

            return;
        }


        const userData =
            userSnap.data();


        const balance =
            Number(
                userData.totalCommission || 0
            );


        if (amount > balance) {

            showWithdrawalMessage(

                `❌ Huna commission ya kutosha. Balance yako ni TSh ${formatMoney(
                    balance
                )}.`,

                "red"

            );

            return;
        }


        /*
         * CHECK PENDING WITHDRAWALS
         */

        const pendingSnapshot =
            await db.collection(
                "withdrawals"
            )
            .where(
                "userId",
                "==",
                user.uid
            )
            .where(
                "status",
                "==",
                "Waiting"
            )
            .get();


        let pendingTotal = 0;


        pendingSnapshot.forEach(
            doc => {

                const data =
                    doc.data();

                pendingTotal +=
                    Number(
                        data.amount || 0
                    );

            }
        );


        if (
            amount >
            balance - pendingTotal
        ) {

            showWithdrawalMessage(

                `❌ Una withdrawal nyingine inayosubiri. Kiasi kinachoweza kuombwa sasa ni TSh ${formatMoney(
                    Math.max(
                        0,
                        balance - pendingTotal
                    )
                )}.`,

                "red"

            );

            return;
        }


        /*
         * CREATE WITHDRAWAL
         */

        const withdrawalRef =
            await db.collection(
                "withdrawals"
            )
            .add({

                userId:
                    user.uid,

                userEmail:
                    user.email || "",

                userName:
                    userData.name || "",

                amount:
                    amount,

                phone:
                    phone,

                method:
                    method,

                status:
                    "Waiting",

                createdAt:
                    firebase.firestore.FieldValue
                        .serverTimestamp()

            });


        /*
         * NOTIFICATION
         */

        await createNotification(

            user.uid,

            "Withdrawal Request",

            `Withdrawal yako ya TSh ${formatMoney(
                amount
            )} imepokelewa na inasubiri uthibitisho wa Admin.`

        );


        showWithdrawalMessage(

            `✅ Withdrawal request imetumwa. Reference: ${withdrawalRef.id}`,

            "green"

        );


        amountInput.value = "";

        phoneInput.value = "";


        await loadMyWithdrawals();


    } catch (error) {

        console.error(
            "Withdrawal request error:",
            error
        );


        showWithdrawalMessage(
            "❌ Imeshindikana kutuma withdrawal request.",
            "red"
        );
    }
}


/* =========================================================
   5.4 WITHDRAWAL MESSAGE
========================================================= */

function showWithdrawalMessage(
    text,
    color
) {

    const message =
        document.getElementById(
            "withdrawalMessage"
        );


    if (!message) return;


    message.style.marginTop =
        "15px";

    message.style.padding =
        "10px";

    message.style.borderRadius =
        "8px";

    message.style.color =
        color;

    message.textContent =
        text;
}


/* =========================================================
   5.5 LOAD MY WITHDRAWALS
========================================================= */

async function loadMyWithdrawals() {

    const container =
        document.getElementById(
            "myWithdrawals"
        );


    if (!container) return;


    const user =
        auth.currentUser;


    if (!user) return;


    container.innerHTML = `
        <p>⏳ Inapakia withdrawals...</p>
    `;


    try {

        const snapshot =
            await db.collection(
                "withdrawals"
            )
            .where(
                "userId",
                "==",
                user.uid
            )
            .get();


        if (snapshot.empty) {

            container.innerHTML = `

                <div style="
                    padding:12px;
                    border:1px solid #ddd;
                    border-radius:10px;
                ">

                    <h3>
                        📋 Withdrawal Zangu
                    </h3>

                    <p>
                        Bado hujaomba withdrawal.
                    </p>

                </div>

            `;

            return;
        }


        const withdrawals = [];


        snapshot.forEach(doc => {

            withdrawals.push({

                id:
                    doc.id,

                ...doc.data()

            });

        });


        withdrawals.sort(
            (a, b) => {

                const dateA =
                    a.createdAt &&
                    a.createdAt.toDate
                        ? a.createdAt.toDate()
                        : new Date(0);

                const dateB =
                    b.createdAt &&
                    b.createdAt.toDate
                        ? b.createdAt.toDate()
                        : new Date(0);

                return dateB - dateA;

            }
        );


        let html = `

            <h3>
                📋 Withdrawal Zangu
            </h3>

        `;


        withdrawals.forEach(
            withdrawal => {

                let statusText;


                if (
                    withdrawal.status ===
                    "Waiting"
                ) {

                    statusText =
                        "🟡 Inasubiri";

                } else if (
                    withdrawal.status ===
                    "Approved"
                ) {

                    statusText =
                        "🟢 Imekubaliwa";

                } else if (
                    withdrawal.status ===
                    "Rejected"
                ) {

                    statusText =
                        "🔴 Imekataliwa";

                } else {

                    statusText =
                        escapeHtml(
                            withdrawal.status || "-"
                        );
                }


                html += `

                    <div style="
                        border:1px solid #ddd;
                        border-radius:12px;
                        padding:15px;
                        margin:12px 0;
                    ">

                        <p>
                            <strong>Kiasi:</strong>
                            TSh ${formatMoney(
                                withdrawal.amount || 0
                            )}
                        </p>

                        <p>
                            <strong>Namba:</strong>
                            ${escapeHtml(
                                withdrawal.phone || "-"
                            )}
                        </p>

                        <p>
                            <strong>Njia:</strong>
                            ${escapeHtml(
                                withdrawal.method || "-"
                            )}
                        </p>

                        <p>
                            <strong>Status:</strong>
                            ${statusText}
                        </p>

                        <p>
                            <strong>Tarehe:</strong>
                            ${formatDateTime(
                                withdrawal.createdAt
                            )}
                        </p>

                        ${
                            withdrawal.rejectionReason
                            ?
                            `
                            <p style="color:red;">
                                <strong>Sababu:</strong>
                                ${escapeHtml(
                                    withdrawal.rejectionReason
                                )}
                            </p>
                            `
                            :
                            ""
                        }

                    </div>

                `;

            }
        );


        container.innerHTML =
            html;


    } catch (error) {

        console.error(
            "Load withdrawals error:",
            error
        );


        container.innerHTML = `

            <p style="color:red;">
                ❌ Imeshindikana kupakia withdrawals.
            </p>

        `;
    }
}


/* =========================================================
   5.6 ADMIN WITHDRAWAL DASHBOARD
========================================================= */

async function loadAdminWithdrawals() {

    const content =
        document.getElementById(
            "adminDashboardContent"
        );


    if (!content) return;


    content.innerHTML = `
        <p>⏳ Inapakia withdrawal requests...</p>
    `;


    try {

        const admin =
            auth.currentUser;


        if (!admin) {

            content.innerHTML = `
                <p style="color:red;">
                    ❌ Admin hajaingia.
                </p>
            `;

            return;
        }


        const isAdmin =
            await checkAdminRole(
                admin.uid
            );


        if (!isAdmin) {

            content.innerHTML = `
                <p style="color:red;">
                    ❌ Huna ruhusa ya Admin.
                </p>
            `;

            return;
        }


        const snapshot =
            await db.collection(
                "withdrawals"
            )
            .where(
                "status",
                "==",
                "Waiting"
            )
            .get();


        if (snapshot.empty) {

            content.innerHTML = `

                <h3>
                    💸 Withdrawal Requests
                </h3>

                <p>
                    Hakuna withdrawal inayosubiri.
                </p>

            `;

            return;
        }


        const requests = [];


        snapshot.forEach(doc => {

            requests.push({

                id:
                    doc.id,

                ...doc.data()

            });

        });


        requests.sort(
            (a, b) => {

                const dateA =
                    a.createdAt &&
                    a.createdAt.toDate
                        ? a.createdAt.toDate()
                        : new Date(0);

                const dateB =
                    b.createdAt &&
                    b.createdAt.toDate
                        ? b.createdAt.toDate()
                        : new Date(0);

                return dateB - dateA;

            }
        );


        let html = `

            <h3>
                💸 Withdrawal Requests
            </h3>

            <p>
                Zifuatazo bado zinasubiri kushughulikiwa.
            </p>

        `;


        requests.forEach(
            withdrawal => {

                html += `

                    <div style="
                        border:1px solid #ddd;
                        border-radius:12px;
                        padding:15px;
                        margin:15px 0;
                    ">

                        <h4>
                            💸 Withdrawal Request
                        </h4>

                        <p>
                            <strong>User:</strong>
                            ${escapeHtml(
                                withdrawal.userName || "-"
                            )}
                        </p>

                        <p>
                            <strong>Email:</strong>
                            ${escapeHtml(
                                withdrawal.userEmail || "-"
                            )}
                        </p>

                        <p>
                            <strong>Kiasi:</strong>
                            TSh ${formatMoney(
                                withdrawal.amount || 0
                            )}
                        </p>

                        <p>
                            <strong>Namba ya kupokea:</strong>
                            ${escapeHtml(
                                withdrawal.phone || "-"
                            )}
                        </p>

                        <p>
                            <strong>Njia:</strong>
                            ${escapeHtml(
                                withdrawal.method || "-"
                            )}
                        </p>

                        <p>
                            <strong>Tarehe:</strong>
                            ${formatDateTime(
                                withdrawal.createdAt
                            )}
                        </p>


                        <div style="
                            display:flex;
                            gap:10px;
                            flex-wrap:wrap;
                            margin-top:15px;
                        ">

                            <button
                                class="thibitishaBtn"
                                onclick="approveWithdrawal('${withdrawal.id}')">

                                ✅ Approve

                            </button>


                            <button
                                class="endeleaBtn"
                                onclick="rejectWithdrawal('${withdrawal.id}')">

                                ❌ Reject

                            </button>

                        </div>

                    </div>

                `;

            }
        );


        content.innerHTML =
            html;


    } catch (error) {

        console.error(
            "Admin withdrawals error:",
            error
        );


        content.innerHTML = `

            <p style="color:red;">
                ❌ Imeshindikana kupakia withdrawal requests.
            </p>

        `;
    }
}


/* =========================================================
   5.7 APPROVE WITHDRAWAL
========================================================= */

async function approveWithdrawal(
    withdrawalId
) {

    if (!withdrawalId) return;


    const confirmed =
        confirm(

            "⚠️ Kabla ya Approve, hakikisha Admin amefanya malipo halisi kwenda kwenye namba ya mteja.\n\nEndelea?"

        );


    if (!confirmed) return;


    try {

        const admin =
            auth.currentUser;


        if (!admin) {

            alert(
                "❌ Admin hajaingia."
            );

            return;
        }


        const isAdmin =
            await checkAdminRole(
                admin.uid
            );


        if (!isAdmin) {

            alert(
                "❌ Huna ruhusa ya Admin."
            );

            return;
        }


        const withdrawalRef =
            db.collection(
                "withdrawals"
            )
            .doc(withdrawalId);


        const withdrawalSnap =
            await withdrawalRef.get();


        if (!withdrawalSnap.exists) {

            alert(
                "❌ Withdrawal haipatikani."
            );

            return;
        }


        const withdrawal =
            withdrawalSnap.data();


        if (
            withdrawal.status !==
            "Waiting"
        ) {

            alert(
                "⚠️ Withdrawal hii tayari imeshughulikiwa."
            );

            return;
        }


        const amount =
            Number(
                withdrawal.amount || 0
            );


        const userId =
            withdrawal.userId;


        if (!userId) {

            alert(
                "❌ User ID haipo."
            );

            return;
        }


        const userRef =
            db.collection(
                "users"
            )
            .doc(userId);


        /*
         * TRANSACTION
         *
         * Hii inalinda balance
         * isikatwe mara mbili.
         */

        await db.runTransaction(
            async transaction => {

                const userSnap =
                    await transaction.get(
                        userRef
                    );


                const freshWithdrawalSnap =
                    await transaction.get(
                        withdrawalRef
                    );


                if (
                    !freshWithdrawalSnap.exists
                ) {

                    throw new Error(
                        "Withdrawal haipatikani."
                    );
                }


                const freshWithdrawal =
                    freshWithdrawalSnap.data();


                if (
                    freshWithdrawal.status !==
                    "Waiting"
                ) {

                    throw new Error(
                        "Withdrawal tayari imeshughulikiwa."
                    );
                }


                if (
                    !userSnap.exists
                ) {

                    throw new Error(
                        "User haipatikani."
                    );
                }


                const userData =
                    userSnap.data();


                const currentBalance =
                    Number(
                        userData.totalCommission || 0
                    );


                if (
                    amount >
                    currentBalance
                ) {

                    throw new Error(
                        "Commission balance haitoshi."
                    );
                }


                const newBalance =
                    currentBalance -
                    amount;


                transaction.update(
                    userRef,
                    {

                        totalCommission:
                            newBalance,

                        updatedAt:
                            firebase.firestore
                                .FieldValue
                                .serverTimestamp()

                    }
                );


                transaction.update(
                    withdrawalRef,
                    {

                        status:
                            "Approved",

                        approvedAt:
                            firebase.firestore
                                .FieldValue
                                .serverTimestamp(),

                        approvedBy:
                            admin.uid,

                        approvedByEmail:
                            admin.email || "",

                        balanceAfter:
                            newBalance

                    }
                );

            }
        );


        /*
         * NOTIFICATION
         */

        await createNotification(

            userId,

            "Withdrawal Approved",

            `Withdrawal yako ya TSh ${formatMoney(
                amount
            )} imekubaliwa na Admin.`

        );


        alert(
            "✅ Withdrawal imekubaliwa."
        );


        await loadAdminWithdrawals();


    } catch (error) {

        console.error(
            "Approve withdrawal error:",
            error
        );


        alert(
            "❌ " +
            (
                error.message ||
                "Imeshindikana ku-approve withdrawal."
            )
        );
    }
}


/* =========================================================
   5.8 REJECT WITHDRAWAL
========================================================= */

async function rejectWithdrawal(
    withdrawalId
) {

    if (!withdrawalId) return;


    const reason =
        prompt(
            "Andika sababu ya kukataa withdrawal:"
        );


    if (
        reason === null
    ) {

        return;
    }


    const finalReason =
        reason.trim() ||
        "Withdrawal imekataliwa na Admin.";


    const confirmed =
        confirm(
            "Una uhakika unataka kukataa withdrawal hii?"
        );


    if (!confirmed) return;


    try {

        const admin =
            auth.currentUser;


        if (!admin) {

            alert(
                "❌ Admin hajaingia."
            );

            return;
        }


        const isAdmin =
            await checkAdminRole(
                admin.uid
            );


        if (!isAdmin) {

            alert(
                "❌ Huna ruhusa ya Admin."
            );

            return;
        }


        const withdrawalRef =
            db.collection(
                "withdrawals"
            )
            .doc(withdrawalId);


        const withdrawalSnap =
            await withdrawalRef.get();


        if (!withdrawalSnap.exists) {

            alert(
                "❌ Withdrawal haipatikani."
            );

            return;
        }


        const withdrawal =
            withdrawalSnap.data();


        if (
            withdrawal.status !==
            "Waiting"
        ) {

            alert(
                "⚠️ Withdrawal hii tayari imeshughulikiwa."
            );

            return;
        }


        await withdrawalRef.update({

            status:
                "Rejected",

            rejectionReason:
                finalReason,

            rejectedAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp(),

            rejectedBy:
                admin.uid,

            rejectedByEmail:
                admin.email || ""

        });


        await createNotification(

            withdrawal.userId,

            "Withdrawal Rejected",

            `Withdrawal yako ya TSh ${formatMoney(
                withdrawal.amount || 0
            )} imekataliwa. Sababu: ${finalReason}`

        );


        alert(
            "❌ Withdrawal imekataliwa."
        );


        await loadAdminWithdrawals();


    } catch (error) {

        console.error(
            "Reject withdrawal error:",
            error
        );


        alert(
            "❌ Imeshindikana kukataa withdrawal."
        );
    }
}


/* =========================================================
   5.9 ADD WITHDRAWAL BUTTON TO ADMIN DASHBOARD
========================================================= */

async function funguaAdminDashboard() {

    const section =
        document.getElementById(
            "taarifaSection"
        );

    if (!section) return;


    section.style.display =
        "block";


    section.innerHTML = `

        <div class="booking-card">

            <h2>
                🔐 RoomRent Admin Dashboard
            </h2>

            <p>
                Karibu Admin.
                Hapa unaweza kusimamia mfumo wa RoomRent.
            </p>


            <div style="
                display:flex;
                gap:10px;
                flex-wrap:wrap;
                margin:15px 0;
            ">


                <button
                    class="thibitishaBtn"
                    onclick="loadAdminPaymentRequests()">

                    💳 Payments

                </button>


                <button
                    class="endeleaBtn"
                    onclick="loadAdminWithdrawals()">

                    💸 Withdrawals

                </button>


                <button
                    class="endeleaBtn"
                    onclick="loadAdminBookings()">

                    📋 Bookings

                </button>


                <button
                    class="endeleaBtn"
                    onclick="loadAdminUsers()">

                    👥 Users

                </button>


                <button
                    class="endeleaBtn"
                    onclick="adminLogout()">

                    🚪 Logout

                </button>

            </div>


            <div id="adminDashboardContent">

                <p>
                    Chagua sehemu unayotaka kusimamia.
                </p>

            </div>

        </div>

    `;


    await loadAdminPaymentRequests();
}


/* =========================================================
   5.10 WINDOW EXPORTS
========================================================= */

window.funguaWithdrawal =
    funguaWithdrawal;


window.tumaWithdrawalRequest =
    tumaWithdrawalRequest;


window.loadMyWithdrawals =
    loadMyWithdrawals;


window.loadAdminWithdrawals =
    loadAdminWithdrawals;


window.approveWithdrawal =
    approveWithdrawal;


window.rejectWithdrawal =
    rejectWithdrawal;


/* =========================================================
   5.11 CONNECT WITHDRAWAL BUTTON
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        const withdrawalBtn =
            document.getElementById(
                "withdrawalBtn"
            );


        if (
            withdrawalBtn &&
            !withdrawalBtn.dataset.withdrawalReady
        ) {

            withdrawalBtn.dataset.withdrawalReady =
                "true";


            withdrawalBtn.addEventListener(
                "click",
                funguaWithdrawal
            );

        }

    }
);


/* =========================================================
   SEHEMU YA 5 IMEISHIA HAPA
========================================================= *//* =========================================================
   ROOMRENT - SEHEMU YA 5
   WITHDRAWAL SYSTEM
   CUSTOMER + ADMIN
   ========================================================= */


/* =========================================================
   5.1 WITHDRAWAL SETTINGS
========================================================= */

const WITHDRAWAL_SETTINGS = {

    minimumAmount: 1000,

    currency: "TSh"

};


/* =========================================================
   5.2 OPEN WITHDRAWAL
========================================================= */

async function funguaWithdrawal() {

    const section =
        document.getElementById(
            "taarifaSection"
        );

    if (!section) return;


    section.style.display = "block";


    const user =
        auth.currentUser;


    if (!user) {

        section.innerHTML = `

            <div class="booking-card">

                <h2>💸 Withdrawal</h2>

                <p>
                    Tafadhali ingia kwenye account yako
                    kwanza ili kuomba withdrawal.
                </p>

                <button
                    class="thibitishaBtn"
                    onclick="funguaAccount()">

                    👤 Ingia / Account

                </button>

            </div>

        `;

        return;
    }


    try {

        const userRef =
            db.collection("users")
                .doc(user.uid);


        const userSnap =
            await userRef.get();


        if (!userSnap.exists) {

            section.innerHTML = `

                <div class="booking-card">

                    <h2>💸 Withdrawal</h2>

                    <p style="color:red;">
                        ❌ Taarifa za account hazijapatikana.
                    </p>

                </div>

            `;

            return;
        }


        const userData =
            userSnap.data();


        const balance =
            Number(
                userData.totalCommission || 0
            );


        section.innerHTML = `

            <div class="booking-card">

                <h2>💸 Withdrawal</h2>

                <div style="
                    padding:18px;
                    border-radius:12px;
                    margin:15px 0;
                    border:1px solid #ddd;
                ">

                    <h3>
                        💰 Commission Balance
                    </h3>

                    <p style="
                        font-size:25px;
                        font-weight:bold;
                    ">

                        TSh ${formatMoney(balance)}

                    </p>

                </div>


                <label>
                    💰 Kiasi cha kutoa
                </label>

                <input
                    type="number"
                    id="withdrawAmount"
                    placeholder="Mfano: 10000"
                    min="${WITHDRAWAL_SETTINGS.minimumAmount}"
                >


                <label>
                    📱 Namba ya kupokea pesa
                </label>

                <input
                    type="tel"
                    id="withdrawPhone"
                    placeholder="Mfano: 0712345678"
                >


                <label>
                    💳 Njia ya kupokea
                </label>

                <select id="withdrawMethod">

                    <option value="">
                        Chagua njia
                    </option>

                    <option value="Airtel Money">
                        Airtel Money
                    </option>

                    <option value="MIXX BY YAS">
                        MIXX BY YAS
                    </option>

                </select>


                <p style="
                    font-size:13px;
                    margin-top:10px;
                ">

                    Minimum withdrawal:
                    TSh ${formatMoney(
                        WITHDRAWAL_SETTINGS.minimumAmount
                    )}

                </p>


                <button
                    class="thibitishaBtn"
                    onclick="tumaWithdrawalRequest()">

                    💸 Omba Withdrawal

                </button>


                <button
                    class="endeleaBtn"
                    onclick="loadMyWithdrawals()">

                    📋 Withdrawal Zangu

                </button>


                <div id="withdrawalMessage"></div>


                <div
                    id="myWithdrawals"
                    style="margin-top:20px;"
                ></div>

            </div>

        `;


        await loadMyWithdrawals();


    } catch (error) {

        console.error(
            "Withdrawal page error:",
            error
        );

        section.innerHTML = `

            <div class="booking-card">

                <h2>💸 Withdrawal</h2>

                <p style="color:red;">
                    ❌ Imeshindikana kupakia taarifa.
                </p>

            </div>

        `;
    }
}


/* =========================================================
   5.3 SUBMIT WITHDRAWAL REQUEST
========================================================= */

async function tumaWithdrawalRequest() {

    const user =
        auth.currentUser;


    if (!user) {

        alert(
            "❌ Tafadhali ingia kwanza."
        );

        return;
    }


    const amountInput =
        document.getElementById(
            "withdrawAmount"
        );


    const phoneInput =
        document.getElementById(
            "withdrawPhone"
        );


    const methodInput =
        document.getElementById(
            "withdrawMethod"
        );


    const message =
        document.getElementById(
            "withdrawalMessage"
        );


    if (
        !amountInput ||
        !phoneInput ||
        !methodInput
    ) {

        return;
    }


    const amount =
        Number(
            amountInput.value
        );


    const phone =
        formatTanzaniaPhone(
            phoneInput.value.trim()
        );


    const method =
        methodInput.value;


    if (
        !amount ||
        amount <= 0
    ) {

        showWithdrawalMessage(
            "❌ Weka kiasi sahihi.",
            "red"
        );

        return;
    }


    if (
        amount <
        WITHDRAWAL_SETTINGS.minimumAmount
    ) {

        showWithdrawalMessage(

            `❌ Minimum withdrawal ni TSh ${formatMoney(
                WITHDRAWAL_SETTINGS.minimumAmount
            )}.`,

            "red"

        );

        return;
    }


    if (!phone) {

        showWithdrawalMessage(
            "❌ Weka namba sahihi ya simu.",
            "red"
        );

        return;
    }


    if (!method) {

        showWithdrawalMessage(
            "❌ Chagua njia ya kupokea pesa.",
            "red"
        );

        return;
    }


    try {

        showWithdrawalMessage(
            "⏳ Inatuma withdrawal request...",
            "black"
        );


        const userRef =
            db.collection("users")
                .doc(user.uid);


        const userSnap =
            await userRef.get();


        if (!userSnap.exists) {

            showWithdrawalMessage(
                "❌ Account haijapatikana.",
                "red"
            );

            return;
        }


        const userData =
            userSnap.data();


        const balance =
            Number(
                userData.totalCommission || 0
            );


        if (amount > balance) {

            showWithdrawalMessage(

                `❌ Huna commission ya kutosha. Balance yako ni TSh ${formatMoney(
                    balance
                )}.`,

                "red"

            );

            return;
        }


        /*
         * CHECK PENDING WITHDRAWALS
         */

        const pendingSnapshot =
            await db.collection(
                "withdrawals"
            )
            .where(
                "userId",
                "==",
                user.uid
            )
            .where(
                "status",
                "==",
                "Waiting"
            )
            .get();


        let pendingTotal = 0;


        pendingSnapshot.forEach(
            doc => {

                const data =
                    doc.data();

                pendingTotal +=
                    Number(
                        data.amount || 0
                    );

            }
        );


        if (
            amount >
            balance - pendingTotal
        ) {

            showWithdrawalMessage(

                `❌ Una withdrawal nyingine inayosubiri. Kiasi kinachoweza kuombwa sasa ni TSh ${formatMoney(
                    Math.max(
                        0,
                        balance - pendingTotal
                    )
                )}.`,

                "red"

            );

            return;
        }


        /*
         * CREATE WITHDRAWAL
         */

        const withdrawalRef =
            await db.collection(
                "withdrawals"
            )
            .add({

                userId:
                    user.uid,

                userEmail:
                    user.email || "",

                userName:
                    userData.name || "",

                amount:
                    amount,

                phone:
                    phone,

                method:
                    method,

                status:
                    "Waiting",

                createdAt:
                    firebase.firestore.FieldValue
                        .serverTimestamp()

            });


        /*
         * NOTIFICATION
         */

        await createNotification(

            user.uid,

            "Withdrawal Request",

            `Withdrawal yako ya TSh ${formatMoney(
                amount
            )} imepokelewa na inasubiri uthibitisho wa Admin.`

        );


        showWithdrawalMessage(

            `✅ Withdrawal request imetumwa. Reference: ${withdrawalRef.id}`,

            "green"

        );


        amountInput.value = "";

        phoneInput.value = "";


        await loadMyWithdrawals();


    } catch (error) {

        console.error(
            "Withdrawal request error:",
            error
        );


        showWithdrawalMessage(
            "❌ Imeshindikana kutuma withdrawal request.",
            "red"
        );
    }
}


/* =========================================================
   5.4 WITHDRAWAL MESSAGE
========================================================= */

function showWithdrawalMessage(
    text,
    color
) {

    const message =
        document.getElementById(
            "withdrawalMessage"
        );


    if (!message) return;


    message.style.marginTop =
        "15px";

    message.style.padding =
        "10px";

    message.style.borderRadius =
        "8px";

    message.style.color =
        color;

    message.textContent =
        text;
}


/* =========================================================
   5.5 LOAD MY WITHDRAWALS
========================================================= */

async function loadMyWithdrawals() {

    const container =
        document.getElementById(
            "myWithdrawals"
        );


    if (!container) return;


    const user =
        auth.currentUser;


    if (!user) return;


    container.innerHTML = `
        <p>⏳ Inapakia withdrawals...</p>
    `;


    try {

        const snapshot =
            await db.collection(
                "withdrawals"
            )
            .where(
                "userId",
                "==",
                user.uid
            )
            .get();


        if (snapshot.empty) {

            container.innerHTML = `

                <div style="
                    padding:12px;
                    border:1px solid #ddd;
                    border-radius:10px;
                ">

                    <h3>
                        📋 Withdrawal Zangu
                    </h3>

                    <p>
                        Bado hujaomba withdrawal.
                    </p>

                </div>

            `;

            return;
        }


        const withdrawals = [];


        snapshot.forEach(doc => {

            withdrawals.push({

                id:
                    doc.id,

                ...doc.data()

            });

        });


        withdrawals.sort(
            (a, b) => {

                const dateA =
                    a.createdAt &&
                    a.createdAt.toDate
                        ? a.createdAt.toDate()
                        : new Date(0);

                const dateB =
                    b.createdAt &&
                    b.createdAt.toDate
                        ? b.createdAt.toDate()
                        : new Date(0);

                return dateB - dateA;

            }
        );


        let html = `

            <h3>
                📋 Withdrawal Zangu
            </h3>

        `;


        withdrawals.forEach(
            withdrawal => {

                let statusText;


                if (
                    withdrawal.status ===
                    "Waiting"
                ) {

                    statusText =
                        "🟡 Inasubiri";

                } else if (
                    withdrawal.status ===
                    "Approved"
                ) {

                    statusText =
                        "🟢 Imekubaliwa";

                } else if (
                    withdrawal.status ===
                    "Rejected"
                ) {

                    statusText =
                        "🔴 Imekataliwa";

                } else {

                    statusText =
                        escapeHtml(
                            withdrawal.status || "-"
                        );
                }


                html += `

                    <div style="
                        border:1px solid #ddd;
                        border-radius:12px;
                        padding:15px;
                        margin:12px 0;
                    ">

                        <p>
                            <strong>Kiasi:</strong>
                            TSh ${formatMoney(
                                withdrawal.amount || 0
                            )}
                        </p>

                        <p>
                            <strong>Namba:</strong>
                            ${escapeHtml(
                                withdrawal.phone || "-"
                            )}
                        </p>

                        <p>
                            <strong>Njia:</strong>
                            ${escapeHtml(
                                withdrawal.method || "-"
                            )}
                        </p>

                        <p>
                            <strong>Status:</strong>
                            ${statusText}
                        </p>

                        <p>
                            <strong>Tarehe:</strong>
                            ${formatDateTime(
                                withdrawal.createdAt
                            )}
                        </p>

                        ${
                            withdrawal.rejectionReason
                            ?
                            `
                            <p style="color:red;">
                                <strong>Sababu:</strong>
                                ${escapeHtml(
                                    withdrawal.rejectionReason
                                )}
                            </p>
                            `
                            :
                            ""
                        }

                    </div>

                `;

            }
        );


        container.innerHTML =
            html;


    } catch (error) {

        console.error(
            "Load withdrawals error:",
            error
        );


        container.innerHTML = `

            <p style="color:red;">
                ❌ Imeshindikana kupakia withdrawals.
            </p>

        `;
    }
}


/* =========================================================
   5.6 ADMIN WITHDRAWAL DASHBOARD
========================================================= */

async function loadAdminWithdrawals() {

    const content =
        document.getElementById(
            "adminDashboardContent"
        );


    if (!content) return;


    content.innerHTML = `
        <p>⏳ Inapakia withdrawal requests...</p>
    `;


    try {

        const admin =
            auth.currentUser;


        if (!admin) {

            content.innerHTML = `
                <p style="color:red;">
                    ❌ Admin hajaingia.
                </p>
            `;

            return;
        }


        const isAdmin =
            await checkAdminRole(
                admin.uid
            );


        if (!isAdmin) {

            content.innerHTML = `
                <p style="color:red;">
                    ❌ Huna ruhusa ya Admin.
                </p>
            `;

            return;
        }


        const snapshot =
            await db.collection(
                "withdrawals"
            )
            .where(
                "status",
                "==",
                "Waiting"
            )
            .get();


        if (snapshot.empty) {

            content.innerHTML = `

                <h3>
                    💸 Withdrawal Requests
                </h3>

                <p>
                    Hakuna withdrawal inayosubiri.
                </p>

            `;

            return;
        }


        const requests = [];


        snapshot.forEach(doc => {

            requests.push({

                id:
                    doc.id,

                ...doc.data()

            });

        });


        requests.sort(
            (a, b) => {

                const dateA =
                    a.createdAt &&
                    a.createdAt.toDate
                        ? a.createdAt.toDate()
                        : new Date(0);

                const dateB =
                    b.createdAt &&
                    b.createdAt.toDate
                        ? b.createdAt.toDate()
                        : new Date(0);

                return dateB - dateA;

            }
        );


        let html = `

            <h3>
                💸 Withdrawal Requests
            </h3>

            <p>
                Zifuatazo bado zinasubiri kushughulikiwa.
            </p>

        `;


        requests.forEach(
            withdrawal => {

                html += `

                    <div style="
                        border:1px solid #ddd;
                        border-radius:12px;
                        padding:15px;
                        margin:15px 0;
                    ">

                        <h4>
                            💸 Withdrawal Request
                        </h4>

                        <p>
                            <strong>User:</strong>
                            ${escapeHtml(
                                withdrawal.userName || "-"
                            )}
                        </p>

                        <p>
                            <strong>Email:</strong>
                            ${escapeHtml(
                                withdrawal.userEmail || "-"
                            )}
                        </p>

                        <p>
                            <strong>Kiasi:</strong>
                            TSh ${formatMoney(
                                withdrawal.amount || 0
                            )}
                        </p>

                        <p>
                            <strong>Namba ya kupokea:</strong>
                            ${escapeHtml(
                                withdrawal.phone || "-"
                            )}
                        </p>

                        <p>
                            <strong>Njia:</strong>
                            ${escapeHtml(
                                withdrawal.method || "-"
                            )}
                        </p>

                        <p>
                            <strong>Tarehe:</strong>
                            ${formatDateTime(
                                withdrawal.createdAt
                            )}
                        </p>


                        <div style="
                            display:flex;
                            gap:10px;
                            flex-wrap:wrap;
                            margin-top:15px;
                        ">

                            <button
                                class="thibitishaBtn"
                                onclick="approveWithdrawal('${withdrawal.id}')">

                                ✅ Approve

                            </button>


                            <button
                                class="endeleaBtn"
                                onclick="rejectWithdrawal('${withdrawal.id}')">

                                ❌ Reject

                            </button>

                        </div>

                    </div>

                `;

            }
        );


        content.innerHTML =
            html;


    } catch (error) {

        console.error(
            "Admin withdrawals error:",
            error
        );


        content.innerHTML = `

            <p style="color:red;">
                ❌ Imeshindikana kupakia withdrawal requests.
            </p>

        `;
    }
}


/* =========================================================
   5.7 APPROVE WITHDRAWAL
========================================================= */

async function approveWithdrawal(
    withdrawalId
) {

    if (!withdrawalId) return;


    const confirmed =
        confirm(

            "⚠️ Kabla ya Approve, hakikisha Admin amefanya malipo halisi kwenda kwenye namba ya mteja.\n\nEndelea?"

        );


    if (!confirmed) return;


    try {

        const admin =
            auth.currentUser;


        if (!admin) {

            alert(
                "❌ Admin hajaingia."
            );

            return;
        }


        const isAdmin =
            await checkAdminRole(
                admin.uid
            );


        if (!isAdmin) {

            alert(
                "❌ Huna ruhusa ya Admin."
            );

            return;
        }


        const withdrawalRef =
            db.collection(
                "withdrawals"
            )
            .doc(withdrawalId);


        const withdrawalSnap =
            await withdrawalRef.get();


        if (!withdrawalSnap.exists) {

            alert(
                "❌ Withdrawal haipatikani."
            );

            return;
        }


        const withdrawal =
            withdrawalSnap.data();


        if (
            withdrawal.status !==
            "Waiting"
        ) {

            alert(
                "⚠️ Withdrawal hii tayari imeshughulikiwa."
            );

            return;
        }


        const amount =
            Number(
                withdrawal.amount || 0
            );


        const userId =
            withdrawal.userId;


        if (!userId) {

            alert(
                "❌ User ID haipo."
            );

            return;
        }


        const userRef =
            db.collection(
                "users"
            )
            .doc(userId);


        /*
         * TRANSACTION
         *
         * Hii inalinda balance
         * isikatwe mara mbili.
         */

        await db.runTransaction(
            async transaction => {

                const userSnap =
                    await transaction.get(
                        userRef
                    );


                const freshWithdrawalSnap =
                    await transaction.get(
                        withdrawalRef
                    );


                if (
                    !freshWithdrawalSnap.exists
                ) {

                    throw new Error(
                        "Withdrawal haipatikani."
                    );
                }


                const freshWithdrawal =
                    freshWithdrawalSnap.data();


                if (
                    freshWithdrawal.status !==
                    "Waiting"
                ) {

                    throw new Error(
                        "Withdrawal tayari imeshughulikiwa."
                    );
                }


                if (
                    !userSnap.exists
                ) {

                    throw new Error(
                        "User haipatikani."
                    );
                }


                const userData =
                    userSnap.data();


                const currentBalance =
                    Number(
                        userData.totalCommission || 0
                    );


                if (
                    amount >
                    currentBalance
                ) {

                    throw new Error(
                        "Commission balance haitoshi."
                    );
                }


                const newBalance =
                    currentBalance -
                    amount;


                transaction.update(
                    userRef,
                    {

                        totalCommission:
                            newBalance,

                        updatedAt:
                            firebase.firestore
                                .FieldValue
                                .serverTimestamp()

                    }
                );


                transaction.update(
                    withdrawalRef,
                    {

                        status:
                            "Approved",

                        approvedAt:
                            firebase.firestore
                                .FieldValue
                                .serverTimestamp(),

                        approvedBy:
                            admin.uid,

                        approvedByEmail:
                            admin.email || "",

                        balanceAfter:
                            newBalance

                    }
                );

            }
        );


        /*
         * NOTIFICATION
         */

        await createNotification(

            userId,

            "Withdrawal Approved",

            `Withdrawal yako ya TSh ${formatMoney(
                amount
            )} imekubaliwa na Admin.`

        );


        alert(
            "✅ Withdrawal imekubaliwa."
        );


        await loadAdminWithdrawals();


    } catch (error) {

        console.error(
            "Approve withdrawal error:",
            error
        );


        alert(
            "❌ " +
            (
                error.message ||
                "Imeshindikana ku-approve withdrawal."
            )
        );
    }
}


/* =========================================================
   5.8 REJECT WITHDRAWAL
========================================================= */

async function rejectWithdrawal(
    withdrawalId
) {

    if (!withdrawalId) return;


    const reason =
        prompt(
            "Andika sababu ya kukataa withdrawal:"
        );


    if (
        reason === null
    ) {

        return;
    }


    const finalReason =
        reason.trim() ||
        "Withdrawal imekataliwa na Admin.";


    const confirmed =
        confirm(
            "Una uhakika unataka kukataa withdrawal hii?"
        );


    if (!confirmed) return;


    try {

        const admin =
            auth.currentUser;


        if (!admin) {

            alert(
                "❌ Admin hajaingia."
            );

            return;
        }


        const isAdmin =
            await checkAdminRole(
                admin.uid
            );


        if (!isAdmin) {

            alert(
                "❌ Huna ruhusa ya Admin."
            );

            return;
        }


        const withdrawalRef =
            db.collection(
                "withdrawals"
            )
            .doc(withdrawalId);


        const withdrawalSnap =
            await withdrawalRef.get();


        if (!withdrawalSnap.exists) {

            alert(
                "❌ Withdrawal haipatikani."
            );

            return;
        }


        const withdrawal =
            withdrawalSnap.data();


        if (
            withdrawal.status !==
            "Waiting"
        ) {

            alert(
                "⚠️ Withdrawal hii tayari imeshughulikiwa."
            );

            return;
        }


        await withdrawalRef.update({

            status:
                "Rejected",

            rejectionReason:
                finalReason,

            rejectedAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp(),

            rejectedBy:
                admin.uid,

            rejectedByEmail:
                admin.email || ""

        });


        await createNotification(

            withdrawal.userId,

            "Withdrawal Rejected",

            `Withdrawal yako ya TSh ${formatMoney(
                withdrawal.amount || 0
            )} imekataliwa. Sababu: ${finalReason}`

        );


        alert(
            "❌ Withdrawal imekataliwa."
        );


        await loadAdminWithdrawals();


    } catch (error) {

        console.error(
            "Reject withdrawal error:",
            error
        );


        alert(
            "❌ Imeshindikana kukataa withdrawal."
        );
    }
}


/* =========================================================
   5.9 ADD WITHDRAWAL BUTTON TO ADMIN DASHBOARD
========================================================= */

async function funguaAdminDashboard() {

    const section =
        document.getElementById(
            "taarifaSection"
        );

    if (!section) return;


    section.style.display =
        "block";


    section.innerHTML = `

        <div class="booking-card">

            <h2>
                🔐 RoomRent Admin Dashboard
            </h2>

            <p>
                Karibu Admin.
                Hapa unaweza kusimamia mfumo wa RoomRent.
            </p>


            <div style="
                display:flex;
                gap:10px;
                flex-wrap:wrap;
                margin:15px 0;
            ">


                <button
                    class="thibitishaBtn"
                    onclick="loadAdminPaymentRequests()">

                    💳 Payments

                </button>


                <button
                    class="endeleaBtn"
                    onclick="loadAdminWithdrawals()">

                    💸 Withdrawals

                </button>


                <button
                    class="endeleaBtn"
                    onclick="loadAdminBookings()">

                    📋 Bookings

                </button>


                <button
                    class="endeleaBtn"
                    onclick="loadAdminUsers()">

                    👥 Users

                </button>


                <button
                    class="endeleaBtn"
                    onclick="adminLogout()">

                    🚪 Logout

                </button>

            </div>


            <div id="adminDashboardContent">

                <p>
                    Chagua sehemu unayotaka kusimamia.
                </p>

            </div>

        </div>

    `;


    await loadAdminPaymentRequests();
}


/* =========================================================
   5.10 WINDOW EXPORTS
========================================================= */

window.funguaWithdrawal =
    funguaWithdrawal;


window.tumaWithdrawalRequest =
    tumaWithdrawalRequest;


window.loadMyWithdrawals =
    loadMyWithdrawals;


window.loadAdminWithdrawals =
    loadAdminWithdrawals;


window.approveWithdrawal =
    approveWithdrawal;


window.rejectWithdrawal =
    rejectWithdrawal;


/* =========================================================
   5.11 CONNECT WITHDRAWAL BUTTON
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        const withdrawalBtn =
            document.getElementById(
                "withdrawalBtn"
            );


        if (
            withdrawalBtn &&
            !withdrawalBtn.dataset.withdrawalReady
        ) {

            withdrawalBtn.dataset.withdrawalReady =
                "true";


            withdrawalBtn.addEventListener(
                "click",
                funguaWithdrawal
            );

        }

    }
);


/* =========================================================
   SEHEMU YA 5 IMEISHIA HAPA
========================================================= */
/* =========================================================
   ROOMRENT - SEHEMU YA 6
   ROOM IMAGES + ADMIN UPLOAD
   ========================================================= */


/* =========================================================
   6.1 FIREBASE STORAGE
========================================================= */

let roomRentStorage = null;

try {

    if (
        typeof firebase !== "undefined" &&
        firebase.storage
    ) {

        roomRentStorage =
            firebase.storage();

        console.log(
            "✅ Firebase Storage imeunganishwa."
        );

    }

} catch (error) {

    console.error(
        "❌ Firebase Storage error:",
        error
    );

}


/* =========================================================
   6.2 ROOM IMAGE CACHE
========================================================= */

const roomImageCache = {};


/* =========================================================
   6.3 GET ROOM IMAGE
========================================================= */

async function getRoomImage(
    roomNumber
) {

    if (!roomNumber) {
        return "";
    }


    const key =
        String(roomNumber);


    if (
        roomImageCache[key]
    ) {

        return roomImageCache[key];
    }


    try {

        const snapshot =
            await db.collection(
                "roomImages"
            )
            .where(
                "roomNumber",
                "==",
                key
            )
            .limit(1)
            .get();


        if (
            snapshot.empty
        ) {

            roomImageCache[key] = "";

            return "";
        }


        const data =
            snapshot.docs[0].data();


        const imageUrl =
            data.imageUrl || "";


        roomImageCache[key] =
            imageUrl;


        return imageUrl;


    } catch (error) {

        console.error(
            "Get room image error:",
            error
        );

        return "";
    }
}


/* =========================================================
   6.4 LOAD ALL ROOM IMAGES
========================================================= */

async function loadRoomImages() {

    try {

        const snapshot =
            await db.collection(
                "roomImages"
            )
            .get();


        snapshot.forEach(doc => {

            const data =
                doc.data();


            if (
                data.roomNumber &&
                data.imageUrl
            ) {

                roomImageCache[
                    String(
                        data.roomNumber
                    )
                ] =
                    data.imageUrl;

            }

        });


        console.log(
            "✅ Room images zimepakiwa."
        );


    } catch (error) {

        console.error(
            "Load room images error:",
            error
        );

    }
}


/* =========================================================
   6.5 DEFAULT ROOM IMAGE
========================================================= */

function getDefaultRoomImage() {

    return `
        <div style="
            width:100%;
            height:200px;
            display:flex;
            align-items:center;
            justify-content:center;
            background:#f1f1f1;
            border-radius:12px;
            font-size:70px;
        ">
            🏠
        </div>
    `;
}


/* =========================================================
   6.6 DISPLAY ROOM IMAGE
========================================================= */

function renderRoomImage(
    roomNumber
) {

    const imageUrl =
        roomImageCache[
            String(roomNumber)
        ] || "";


    if (!imageUrl) {

        return getDefaultRoomImage();

    }


    return `

        <img
            src="${escapeHtml(imageUrl)}"
            alt="Chumba ${escapeHtml(roomNumber)}"
            style="
                width:100%;
                height:200px;
                object-fit:cover;
                border-radius:12px;
                display:block;
            "
            onerror="this.style.display='none';"
        >

    `;
}


/* =========================================================
   6.7 ADMIN ROOM IMAGE PANEL
========================================================= */

async function funguaAdminRoomImages() {

    const content =
        document.getElementById(
            "adminDashboardContent"
        );


    if (!content) return;


    const admin =
        auth.currentUser;


    if (!admin) {

        content.innerHTML = `
            <p style="color:red;">
                ❌ Admin hajaingia.
            </p>
        `;

        return;
    }


    const isAdmin =
        await checkAdminRole(
            admin.uid
        );


    if (!isAdmin) {

        content.innerHTML = `
            <p style="color:red;">
                ❌ Huna ruhusa ya Admin.
            </p>
        `;

        return;
    }


    content.innerHTML = `

        <h3>
            🖼️ Room Images
        </h3>

        <p>
            Chagua chumba na picha yake.
        </p>


        <div style="
            border:1px solid #ddd;
            border-radius:12px;
            padding:15px;
            margin-top:15px;
        ">

            <label>
                🏠 Room Number
            </label>

            <input
                type="text"
                id="adminRoomNumber"
                placeholder="Mfano: 0023"
            >


            <label>
                🖼️ Chagua picha
            </label>

            <input
                type="file"
                id="adminRoomImage"
                accept="image/jpeg,image/png,image/webp"
            >


            <p style="
                font-size:13px;
                margin-top:10px;
            ">
                Aina zinazoruhusiwa:
                JPG, PNG, WEBP.
            </p>


            <button
                class="thibitishaBtn"
                onclick="uploadRoomImage()">

                🖼️ Upload Picha

            </button>


            <div
                id="roomImageUploadMessage"
                style="margin-top:15px;"
            ></div>

        </div>


        <div
            id="adminRoomImagesList"
            style="margin-top:20px;"
        >
        </div>

    `;


    await loadAdminRoomImagesList();
}


/* =========================================================
   6.8 UPLOAD ROOM IMAGE
========================================================= */

async function uploadRoomImage() {

    const roomInput =
        document.getElementById(
            "adminRoomNumber"
        );


    const fileInput =
        document.getElementById(
            "adminRoomImage"
        );


    const message =
        document.getElementById(
            "roomImageUploadMessage"
        );


    if (
        !roomInput ||
        !fileInput ||
        !message
    ) {

        return;
    }


    const roomNumber =
        roomInput.value.trim();


    const file =
        fileInput.files[0];


    if (!roomNumber) {

        message.style.color =
            "red";

        message.textContent =
            "❌ Weka Room Number.";

        return;
    }


    if (!file) {

        message.style.color =
            "red";

        message.textContent =
            "❌ Chagua picha kwanza.";

        return;
    }


    /*
     * CHECK ADMIN
     */

    const admin =
        auth.currentUser;


    if (!admin) {

        message.style.color =
            "red";

        message.textContent =
            "❌ Admin hajaingia.";

        return;
    }


    const isAdmin =
        await checkAdminRole(
            admin.uid
        );


    if (!isAdmin) {

        message.style.color =
            "red";

        message.textContent =
            "❌ Huna ruhusa ya Admin.";

        return;
    }


    /*
     * CHECK STORAGE
     */

    if (!roomRentStorage) {

        message.style.color =
            "red";

        message.textContent =
            "❌ Firebase Storage haijaunganishwa.";

        return;
    }


    /*
     * CHECK FILE TYPE
     */

    const allowedTypes = [

        "image/jpeg",

        "image/png",

        "image/webp"

    ];


    if (
        !allowedTypes.includes(
            file.type
        )
    ) {

        message.style.color =
            "red";

        message.textContent =
            "❌ Tumia JPG, PNG au WEBP.";

        return;
    }


    /*
     * MAX 5MB
     */

    const maxSize =
        5 * 1024 * 1024;


    if (
        file.size > maxSize
    ) {

        message.style.color =
            "red";

        message.textContent =
            "❌ Picha isiwe zaidi ya 5MB.";

        return;
    }


    try {

        message.style.color =
            "black";

        message.textContent =
            "⏳ Picha inapakiwa...";


        /*
         * STORAGE PATH
         */

        const safeRoomNumber =
            roomNumber.replace(
                /[^a-zA-Z0-9_-]/g,
                ""
            );


        const fileName =
            Date.now() +
            "_" +
            file.name.replace(
                /[^a-zA-Z0-9._-]/g,
                "_"
            );


        const storagePath =
            `roomImages/${safeRoomNumber}/${fileName}`;


        const storageRef =
            roomRentStorage.ref(
                storagePath
            );


        /*
         * UPLOAD
         */

        await storageRef.put(
            file
        );


        /*
         * GET URL
         */

        const imageUrl =
            await storageRef.getDownloadURL();


        /*
         * CHECK EXISTING ROOM IMAGE
         */

        const existingSnapshot =
            await db.collection(
                "roomImages"
            )
            .where(
                "roomNumber",
                "==",
                roomNumber
            )
            .limit(1)
            .get();


        if (
            existingSnapshot.empty
        ) {

            /*
             * CREATE
             */

            await db.collection(
                "roomImages"
            )
            .add({

                roomNumber:
                    roomNumber,

                imageUrl:
                    imageUrl,

                storagePath:
                    storagePath,

                uploadedBy:
                    admin.uid,

                uploadedByEmail:
                    admin.email || "",

                createdAt:
                    firebase.firestore
                        .FieldValue
                        .serverTimestamp(),

                updatedAt:
                    firebase.firestore
                        .FieldValue
                        .serverTimestamp()

            });


        } else {

            /*
             * UPDATE
             */

            const imageDoc =
                existingSnapshot
                    .docs[0];


            await imageDoc.ref.update({

                imageUrl:
                    imageUrl,

                storagePath:
                    storagePath,

                uploadedBy:
                    admin.uid,

                uploadedByEmail:
                    admin.email || "",

                updatedAt:
                    firebase.firestore
                        .FieldValue
                        .serverTimestamp()

            });

        }


        /*
         * UPDATE CACHE
         */

        roomImageCache[
            roomNumber
        ] =
            imageUrl;


        message.style.color =
            "green";

        message.textContent =
            "✅ Picha imepakiwa kikamilifu.";


        fileInput.value = "";


        await loadAdminRoomImagesList();


        /*
         * REFRESH ROOMS
         */

        if (
            typeof onyeshaVyumba ===
            "function"
        ) {

            await onyeshaVyumba();

        }


    } catch (error) {

        console.error(
            "Upload room image error:",
            error
        );


        message.style.color =
            "red";


        message.textContent =
            "❌ Imeshindikana kupakia picha: " +
            (
                error.message ||
                ""
            );

    }
}


/* =========================================================
   6.9 ADMIN ROOM IMAGE LIST
========================================================= */

async function loadAdminRoomImagesList() {

    const container =
        document.getElementById(
            "adminRoomImagesList"
        );


    if (!container) return;


    container.innerHTML = `
        <p>⏳ Inapakia picha...</p>
    `;


    try {

        const snapshot =
            await db.collection(
                "roomImages"
            )
            .get();


        if (
            snapshot.empty
        ) {

            container.innerHTML = `

                <div style="
                    padding:15px;
                    border:1px solid #ddd;
                    border-radius:12px;
                ">

                    <h3>
                        🖼️ Room Images
                    </h3>

                    <p>
                        Bado hakuna picha zilizowekwa.
                    </p>

                </div>

            `;

            return;
        }


        const images = [];


        snapshot.forEach(doc => {

            images.push({

                id:
                    doc.id,

                ...doc.data()

            });

        });


        images.sort(
            (a, b) => {

                const dateA =
                    a.updatedAt &&
                    a.updatedAt.toDate
                        ? a.updatedAt.toDate()
                        : new Date(0);


                const dateB =
                    b.updatedAt &&
                    b.updatedAt.toDate
                        ? b.updatedAt.toDate()
                        : new Date(0);


                return dateB - dateA;

            }
        );


        let html = `

            <h3>
                🖼️ Picha za Vyumba
            </h3>

        `;


        images.forEach(
            image => {

                html += `

                    <div style="
                        border:1px solid #ddd;
                        border-radius:12px;
                        padding:15px;
                        margin:15px 0;
                    ">

                        <h4>
                            🏠 Chumba
                            ${escapeHtml(
                                image.roomNumber || "-"
                            )}
                        </h4>


                        ${
                            image.imageUrl
                            ?
                            `
                            <img
                                src="${escapeHtml(
                                    image.imageUrl
                                )}"
                                alt="Room ${escapeHtml(
                                    image.roomNumber || ""
                                )}"
                                style="
                                    width:100%;
                                    max-height:250px;
                                    object-fit:cover;
                                    border-radius:10px;
                                "
                            >
                            `
                            :
                            getDefaultRoomImage()
                        }


                        <p style="
                            font-size:13px;
                            margin-top:10px;
                        ">

                            Updated:
                            ${formatDateTime(
                                image.updatedAt
                            )}

                        </p>


                        <button
                            class="endeleaBtn"
                            onclick="deleteRoomImage('${image.id}')">

                            🗑️ Ondoa Picha

                        </button>

                    </div>

                `;

            }
        );


        container.innerHTML =
            html;


    } catch (error) {

        console.error(
            "Admin room image list error:",
            error
        );


        container.innerHTML = `

            <p style="color:red;">
                ❌ Imeshindikana kupakia picha.
            </p>

        `;
    }
}


/* =========================================================
   6.10 DELETE ROOM IMAGE
========================================================= */

async function deleteRoomImage(
    imageId
) {

    if (!imageId) return;


    const confirmed =
        confirm(
            "Una uhakika unataka kuondoa picha hii?"
        );


    if (!confirmed) {
        return;
    }


    try {

        const admin =
            auth.currentUser;


        if (!admin) {

            alert(
                "❌ Admin hajaingia."
            );

            return;
        }


        const isAdmin =
            await checkAdminRole(
                admin.uid
            );


        if (!isAdmin) {

            alert(
                "❌ Huna ruhusa ya Admin."
            );

            return;
        }


        const imageRef =
            db.collection(
                "roomImages"
            )
            .doc(imageId);


        const imageSnap =
            await imageRef.get();


        if (
            !imageSnap.exists
        ) {

            alert(
                "❌ Picha haipatikani."
            );

            return;
        }


        const imageData =
            imageSnap.data();


        /*
         * DELETE STORAGE FILE
         */

        if (
            roomRentStorage &&
            imageData.storagePath
        ) {

            try {

                await roomRentStorage
                    .ref(
                        imageData.storagePath
                    )
                    .delete();

            } catch (storageError) {

                console.warn(
                    "Storage delete warning:",
                    storageError
                );

            }

        }


        /*
         * DELETE FIRESTORE RECORD
         */

        await imageRef.delete();


        /*
         * REMOVE CACHE
         */

        if (
            imageData.roomNumber
        ) {

            delete roomImageCache[
                String(
                    imageData.roomNumber
                )
            ];

        }


        alert(
            "✅ Picha imeondolewa."
        );


        await loadAdminRoomImagesList();


        if (
            typeof onyeshaVyumba ===
            "function"
        ) {

            await onyeshaVyumba();

        }


    } catch (error) {

        console.error(
            "Delete room image error:",
            error
        );


        alert(
            "❌ Imeshindikana kuondoa picha."
        );
    }
}


/* =========================================================
   6.11 ADD ROOM IMAGE BUTTON TO ADMIN
========================================================= */

async function funguaAdminDashboard() {

    const section =
        document.getElementById(
            "taarifaSection"
        );


    if (!section) return;


    section.style.display =
        "block";


    section.innerHTML = `

        <div class="booking-card">

            <h2>
                🔐 RoomRent Admin Dashboard
            </h2>


            <p>
                Karibu Admin.
                Hapa unaweza kusimamia mfumo wa RoomRent.
            </p>


            <div style="
                display:flex;
                gap:10px;
                flex-wrap:wrap;
                margin:15px 0;
            ">


                <button
                    class="thibitishaBtn"
                    onclick="loadAdminPaymentRequests()">

                    💳 Payments

                </button>


                <button
                    class="endeleaBtn"
                    onclick="loadAdminWithdrawals()">

                    💸 Withdrawals

                </button>


                <button
                    class="endeleaBtn"
                    onclick="loadAdminBookings()">

                    📋 Bookings

                </button>


                <button
                    class="endeleaBtn"
                    onclick="loadAdminUsers()">

                    👥 Users

                </button>


                <button
                    class="endeleaBtn"
                    onclick="funguaAdminRoomImages()">

                    🖼️ Room Images

                </button>


                <button
                    class="endeleaBtn"
                    onclick="adminLogout()">

                    🚪 Logout

                </button>

            </div>


            <div id="adminDashboardContent">

                <p>
                    Chagua sehemu unayotaka kusimamia.
                </p>

            </div>

        </div>

    `;


    await loadAdminPaymentRequests();

}


/* =========================================================
   6.12 INITIALIZE ROOM IMAGES
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async function() {

        try {

            await loadRoomImages();

        } catch (error) {

            console.error(
                "Room image initialization error:",
                error
            );

        }

    }
);


/* =========================================================
   6.13 WINDOW EXPORTS
========================================================= */

window.funguaAdminRoomImages =
    funguaAdminRoomImages;


window.uploadRoomImage =
    uploadRoomImage;


window.loadAdminRoomImagesList =
    loadAdminRoomImagesList;


window.deleteRoomImage =
    deleteRoomImage;


window.getRoomImage =
    getRoomImage;


window.renderRoomImage =
    renderRoomImage;


/* =========================================================
   SEHEMU YA 6 IMEISHIA HAPA
========================================================= *//* =========================================================
   ROOMRENT - SEHEMU YA 6
   ROOM IMAGES + ADMIN UPLOAD
   ========================================================= */


/* =========================================================
   6.1 FIREBASE STORAGE
========================================================= */

let roomRentStorage = null;

try {

    if (
        typeof firebase !== "undefined" &&
        firebase.storage
    ) {

        roomRentStorage =
            firebase.storage();

        console.log(
            "✅ Firebase Storage imeunganishwa."
        );

    }

} catch (error) {

    console.error(
        "❌ Firebase Storage error:",
        error
    );

}


/* =========================================================
   6.2 ROOM IMAGE CACHE
========================================================= */

const roomImageCache = {};


/* =========================================================
   6.3 GET ROOM IMAGE
========================================================= */

async function getRoomImage(
    roomNumber
) {

    if (!roomNumber) {
        return "";
    }


    const key =
        String(roomNumber);


    if (
        roomImageCache[key]
    ) {

        return roomImageCache[key];
    }


    try {

        const snapshot =
            await db.collection(
                "roomImages"
            )
            .where(
                "roomNumber",
                "==",
                key
            )
            .limit(1)
            .get();


        if (
            snapshot.empty
        ) {

            roomImageCache[key] = "";

            return "";
        }


        const data =
            snapshot.docs[0].data();


        const imageUrl =
            data.imageUrl || "";


        roomImageCache[key] =
            imageUrl;


        return imageUrl;


    } catch (error) {

        console.error(
            "Get room image error:",
            error
        );

        return "";
    }
}


/* =========================================================
   6.4 LOAD ALL ROOM IMAGES
========================================================= */

async function loadRoomImages() {

    try {

        const snapshot =
            await db.collection(
                "roomImages"
            )
            .get();


        snapshot.forEach(doc => {

            const data =
                doc.data();


            if (
                data.roomNumber &&
                data.imageUrl
            ) {

                roomImageCache[
                    String(
                        data.roomNumber
                    )
                ] =
                    data.imageUrl;

            }

        });


        console.log(
            "✅ Room images zimepakiwa."
        );


    } catch (error) {

        console.error(
            "Load room images error:",
            error
        );

    }
}


/* =========================================================
   6.5 DEFAULT ROOM IMAGE
========================================================= */

function getDefaultRoomImage() {

    return `
        <div style="
            width:100%;
            height:200px;
            display:flex;
            align-items:center;
            justify-content:center;
            background:#f1f1f1;
            border-radius:12px;
            font-size:70px;
        ">
            🏠
        </div>
    `;
}


/* =========================================================
   6.6 DISPLAY ROOM IMAGE
========================================================= */

function renderRoomImage(
    roomNumber
) {

    const imageUrl =
        roomImageCache[
            String(roomNumber)
        ] || "";


    if (!imageUrl) {

        return getDefaultRoomImage();

    }


    return `

        <img
            src="${escapeHtml(imageUrl)}"
            alt="Chumba ${escapeHtml(roomNumber)}"
            style="
                width:100%;
                height:200px;
                object-fit:cover;
                border-radius:12px;
                display:block;
            "
            onerror="this.style.display='none';"
        >

    `;
}


/* =========================================================
   6.7 ADMIN ROOM IMAGE PANEL
========================================================= */

async function funguaAdminRoomImages() {

    const content =
        document.getElementById(
            "adminDashboardContent"
        );


    if (!content) return;


    const admin =
        auth.currentUser;


    if (!admin) {

        content.innerHTML = `
            <p style="color:red;">
                ❌ Admin hajaingia.
            </p>
        `;

        return;
    }


    const isAdmin =
        await checkAdminRole(
            admin.uid
        );


    if (!isAdmin) {

        content.innerHTML = `
            <p style="color:red;">
                ❌ Huna ruhusa ya Admin.
            </p>
        `;

        return;
    }


    content.innerHTML = `

        <h3>
            🖼️ Room Images
        </h3>

        <p>
            Chagua chumba na picha yake.
        </p>


        <div style="
            border:1px solid #ddd;
            border-radius:12px;
            padding:15px;
            margin-top:15px;
        ">

            <label>
                🏠 Room Number
            </label>

            <input
                type="text"
                id="adminRoomNumber"
                placeholder="Mfano: 0023"
            >


            <label>
                🖼️ Chagua picha
            </label>

            <input
                type="file"
                id="adminRoomImage"
                accept="image/jpeg,image/png,image/webp"
            >


            <p style="
                font-size:13px;
                margin-top:10px;
            ">
                Aina zinazoruhusiwa:
                JPG, PNG, WEBP.
            </p>


            <button
                class="thibitishaBtn"
                onclick="uploadRoomImage()">

                🖼️ Upload Picha

            </button>


            <div
                id="roomImageUploadMessage"
                style="margin-top:15px;"
            ></div>

        </div>


        <div
            id="adminRoomImagesList"
            style="margin-top:20px;"
        >
        </div>

    `;


    await loadAdminRoomImagesList();
}


/* =========================================================
   6.8 UPLOAD ROOM IMAGE
========================================================= */

async function uploadRoomImage() {

    const roomInput =
        document.getElementById(
            "adminRoomNumber"
        );


    const fileInput =
        document.getElementById(
            "adminRoomImage"
        );


    const message =
        document.getElementById(
            "roomImageUploadMessage"
        );


    if (
        !roomInput ||
        !fileInput ||
        !message
    ) {

        return;
    }


    const roomNumber =
        roomInput.value.trim();


    const file =
        fileInput.files[0];


    if (!roomNumber) {

        message.style.color =
            "red";

        message.textContent =
            "❌ Weka Room Number.";

        return;
    }


    if (!file) {

        message.style.color =
            "red";

        message.textContent =
            "❌ Chagua picha kwanza.";

        return;
    }


    /*
     * CHECK ADMIN
     */

    const admin =
        auth.currentUser;


    if (!admin) {

        message.style.color =
            "red";

        message.textContent =
            "❌ Admin hajaingia.";

        return;
    }


    const isAdmin =
        await checkAdminRole(
            admin.uid
        );


    if (!isAdmin) {

        message.style.color =
            "red";

        message.textContent =
            "❌ Huna ruhusa ya Admin.";

        return;
    }


    /*
     * CHECK STORAGE
     */

    if (!roomRentStorage) {

        message.style.color =
            "red";

        message.textContent =
            "❌ Firebase Storage haijaunganishwa.";

        return;
    }


    /*
     * CHECK FILE TYPE
     */

    const allowedTypes = [

        "image/jpeg",

        "image/png",

        "image/webp"

    ];


    if (
        !allowedTypes.includes(
            file.type
        )
    ) {

        message.style.color =
            "red";

        message.textContent =
            "❌ Tumia JPG, PNG au WEBP.";

        return;
    }


    /*
     * MAX 5MB
     */

    const maxSize =
        5 * 1024 * 1024;


    if (
        file.size > maxSize
    ) {

        message.style.color =
            "red";

        message.textContent =
            "❌ Picha isiwe zaidi ya 5MB.";

        return;
    }


    try {

        message.style.color =
            "black";

        message.textContent =
            "⏳ Picha inapakiwa...";


        /*
         * STORAGE PATH
         */

        const safeRoomNumber =
            roomNumber.replace(
                /[^a-zA-Z0-9_-]/g,
                ""
            );


        const fileName =
            Date.now() +
            "_" +
            file.name.replace(
                /[^a-zA-Z0-9._-]/g,
                "_"
            );


        const storagePath =
            `roomImages/${safeRoomNumber}/${fileName}`;


        const storageRef =
            roomRentStorage.ref(
                storagePath
            );


        /*
         * UPLOAD
         */

        await storageRef.put(
            file
        );


        /*
         * GET URL
         */

        const imageUrl =
            await storageRef.getDownloadURL();


        /*
         * CHECK EXISTING ROOM IMAGE
         */

        const existingSnapshot =
            await db.collection(
                "roomImages"
            )
            .where(
                "roomNumber",
                "==",
                roomNumber
            )
            .limit(1)
            .get();


        if (
            existingSnapshot.empty
        ) {

            /*
             * CREATE
             */

            await db.collection(
                "roomImages"
            )
            .add({

                roomNumber:
                    roomNumber,

                imageUrl:
                    imageUrl,

                storagePath:
                    storagePath,

                uploadedBy:
                    admin.uid,

                uploadedByEmail:
                    admin.email || "",

                createdAt:
                    firebase.firestore
                        .FieldValue
                        .serverTimestamp(),

                updatedAt:
                    firebase.firestore
                        .FieldValue
                        .serverTimestamp()

            });


        } else {

            /*
             * UPDATE
             */

            const imageDoc =
                existingSnapshot
                    .docs[0];


            await imageDoc.ref.update({

                imageUrl:
                    imageUrl,

                storagePath:
                    storagePath,

                uploadedBy:
                    admin.uid,

                uploadedByEmail:
                    admin.email || "",

                updatedAt:
                    firebase.firestore
                        .FieldValue
                        .serverTimestamp()

            });

        }


        /*
         * UPDATE CACHE
         */

        roomImageCache[
            roomNumber
        ] =
            imageUrl;


        message.style.color =
            "green";

        message.textContent =
            "✅ Picha imepakiwa kikamilifu.";


        fileInput.value = "";


        await loadAdminRoomImagesList();


        /*
         * REFRESH ROOMS
         */

        if (
            typeof onyeshaVyumba ===
            "function"
        ) {

            await onyeshaVyumba();

        }


    } catch (error) {

        console.error(
            "Upload room image error:",
            error
        );


        message.style.color =
            "red";


        message.textContent =
            "❌ Imeshindikana kupakia picha: " +
            (
                error.message ||
                ""
            );

    }
}


/* =========================================================
   6.9 ADMIN ROOM IMAGE LIST
========================================================= */

async function loadAdminRoomImagesList() {

    const container =
        document.getElementById(
            "adminRoomImagesList"
        );


    if (!container) return;


    container.innerHTML = `
        <p>⏳ Inapakia picha...</p>
    `;


    try {

        const snapshot =
            await db.collection(
                "roomImages"
            )
            .get();


        if (
            snapshot.empty
        ) {

            container.innerHTML = `

                <div style="
                    padding:15px;
                    border:1px solid #ddd;
                    border-radius:12px;
                ">

                    <h3>
                        🖼️ Room Images
                    </h3>

                    <p>
                        Bado hakuna picha zilizowekwa.
                    </p>

                </div>

            `;

            return;
        }


        const images = [];


        snapshot.forEach(doc => {

            images.push({

                id:
                    doc.id,

                ...doc.data()

            });

        });


        images.sort(
            (a, b) => {

                const dateA =
                    a.updatedAt &&
                    a.updatedAt.toDate
                        ? a.updatedAt.toDate()
                        : new Date(0);


                const dateB =
                    b.updatedAt &&
                    b.updatedAt.toDate
                        ? b.updatedAt.toDate()
                        : new Date(0);


                return dateB - dateA;

            }
        );


        let html = `

            <h3>
                🖼️ Picha za Vyumba
            </h3>

        `;


        images.forEach(
            image => {

                html += `

                    <div style="
                        border:1px solid #ddd;
                        border-radius:12px;
                        padding:15px;
                        margin:15px 0;
                    ">

                        <h4>
                            🏠 Chumba
                            ${escapeHtml(
                                image.roomNumber || "-"
                            )}
                        </h4>


                        ${
                            image.imageUrl
                            ?
                            `
                            <img
                                src="${escapeHtml(
                                    image.imageUrl
                                )}"
                                alt="Room ${escapeHtml(
                                    image.roomNumber || ""
                                )}"
                                style="
                                    width:100%;
                                    max-height:250px;
                                    object-fit:cover;
                                    border-radius:10px;
                                "
                            >
                            `
                            :
                            getDefaultRoomImage()
                        }


                        <p style="
                            font-size:13px;
                            margin-top:10px;
                        ">

                            Updated:
                            ${formatDateTime(
                                image.updatedAt
                            )}

                        </p>


                        <button
                            class="endeleaBtn"
                            onclick="deleteRoomImage('${image.id}')">

                            🗑️ Ondoa Picha

                        </button>

                    </div>

                `;

            }
        );


        container.innerHTML =
            html;


    } catch (error) {

        console.error(
            "Admin room image list error:",
            error
        );


        container.innerHTML = `

            <p style="color:red;">
                ❌ Imeshindikana kupakia picha.
            </p>

        `;
    }
}


/* =========================================================
   6.10 DELETE ROOM IMAGE
========================================================= */

async function deleteRoomImage(
    imageId
) {

    if (!imageId) return;


    const confirmed =
        confirm(
            "Una uhakika unataka kuondoa picha hii?"
        );


    if (!confirmed) {
        return;
    }


    try {

        const admin =
            auth.currentUser;


        if (!admin) {

            alert(
                "❌ Admin hajaingia."
            );

            return;
        }


        const isAdmin =
            await checkAdminRole(
                admin.uid
            );


        if (!isAdmin) {

            alert(
                "❌ Huna ruhusa ya Admin."
            );

            return;
        }


        const imageRef =
            db.collection(
                "roomImages"
            )
            .doc(imageId);


        const imageSnap =
            await imageRef.get();


        if (
            !imageSnap.exists
        ) {

            alert(
                "❌ Picha haipatikani."
            );

            return;
        }


        const imageData =
            imageSnap.data();


        /*
         * DELETE STORAGE FILE
         */

        if (
            roomRentStorage &&
            imageData.storagePath
        ) {

            try {

                await roomRentStorage
                    .ref(
                        imageData.storagePath
                    )
                    .delete();

            } catch (storageError) {

                console.warn(
                    "Storage delete warning:",
                    storageError
                );

            }

        }


        /*
         * DELETE FIRESTORE RECORD
         */

        await imageRef.delete();


        /*
         * REMOVE CACHE
         */

        if (
            imageData.roomNumber
        ) {

            delete roomImageCache[
                String(
                    imageData.roomNumber
                )
            ];

        }


        alert(
            "✅ Picha imeondolewa."
        );


        await loadAdminRoomImagesList();


        if (
            typeof onyeshaVyumba ===
            "function"
        ) {

            await onyeshaVyumba();

        }


    } catch (error) {

        console.error(
            "Delete room image error:",
            error
        );


        alert(
            "❌ Imeshindikana kuondoa picha."
        );
    }
}


/* =========================================================
   6.11 ADD ROOM IMAGE BUTTON TO ADMIN
========================================================= */

async function funguaAdminDashboard() {

    const section =
        document.getElementById(
            "taarifaSection"
        );


    if (!section) return;


    section.style.display =
        "block";


    section.innerHTML = `

        <div class="booking-card">

            <h2>
                🔐 RoomRent Admin Dashboard
            </h2>


            <p>
                Karibu Admin.
                Hapa unaweza kusimamia mfumo wa RoomRent.
            </p>


            <div style="
                display:flex;
                gap:10px;
                flex-wrap:wrap;
                margin:15px 0;
            ">


                <button
                    class="thibitishaBtn"
                    onclick="loadAdminPaymentRequests()">

                    💳 Payments

                </button>


                <button
                    class="endeleaBtn"
                    onclick="loadAdminWithdrawals()">

                    💸 Withdrawals

                </button>


                <button
                    class="endeleaBtn"
                    onclick="loadAdminBookings()">

                    📋 Bookings

                </button>


                <button
                    class="endeleaBtn"
                    onclick="loadAdminUsers()">

                    👥 Users

                </button>


                <button
                    class="endeleaBtn"
                    onclick="funguaAdminRoomImages()">

                    🖼️ Room Images

                </button>


                <button
                    class="endeleaBtn"
                    onclick="adminLogout()">

                    🚪 Logout

                </button>

            </div>


            <div id="adminDashboardContent">

                <p>
                    Chagua sehemu unayotaka kusimamia.
                </p>

            </div>

        </div>

    `;


    await loadAdminPaymentRequests();

}


/* =========================================================
   6.12 INITIALIZE ROOM IMAGES
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async function() {

        try {

            await loadRoomImages();

        } catch (error) {

            console.error(
                "Room image initialization error:",
                error
            );

        }

    }
);


/* =========================================================
   6.13 WINDOW EXPORTS
========================================================= */

window.funguaAdminRoomImages =
    funguaAdminRoomImages;


window.uploadRoomImage =
    uploadRoomImage;


window.loadAdminRoomImagesList =
    loadAdminRoomImagesList;


window.deleteRoomImage =
    deleteRoomImage;


window.getRoomImage =
    getRoomImage;


window.renderRoomImage =
    renderRoomImage;


/* =========================================================
   SEHEMU YA 6 IMEISHIA HAPA
========================================================= */
/* =========================================================
   ROOMRENT - SEHEMU YA 7
   ROOM CARDS + ROOM IMAGES DISPLAY
   ========================================================= */


/* =========================================================
   7.1 ROOM DATA
========================================================= */

const ROOMRENT_ROOMS = [

    {
        number: "0023",
        price: 30000,
        dailyProfit: 1000,
        days: 40
    },

    {
        number: "0024",
        price: 70000,
        dailyProfit: 2331,
        days: 40
    },

    {
        number: "0025",
        price: 140000,
        dailyProfit: 4662,
        days: 40
    },

    {
        number: "0026",
        price: 210000,
        dailyProfit: 6993,
        days: 40
    },

    {
        number: "0027",
        price: 280000,
        dailyProfit: 9324,
        days: 40
    },

    {
        number: "0028",
        price: 350000,
        dailyProfit: 11655,
        days: 40
    },

    {
        number: "0029",
        price: 420000,
        dailyProfit: 13986,
        days: 40
    },

    {
        number: "0030",
        price: 490000,
        dailyProfit: 16317,
        days: 40
    },

    {
        number: "0031",
        price: 560000,
        dailyProfit: 18648,
        days: 40
    },

    {
        number: "0032",
        price: 630000,
        dailyProfit: 20979,
        days: 40
    }

];


/* =========================================================
   7.2 CALCULATE TOTAL PROFIT
========================================================= */

function calculateRoomTotalProfit(
    room
) {

    if (!room) {
        return 0;
    }


    return (
        Number(room.dailyProfit || 0) *
        Number(room.days || 0)
    );
}


/* =========================================================
   7.3 CALCULATE TOTAL RETURN
========================================================= */

function calculateRoomTotalReturn(
    room
) {

    if (!room) {
        return 0;
    }


    return (

        Number(room.price || 0) +

        calculateRoomTotalProfit(
            room
        )

    );
}


/* =========================================================
   7.4 CREATE ROOM CARD
========================================================= */

function createRoomCard(
    room
) {

    if (!room) {
        return "";
    }


    const roomNumber =
        String(
            room.number || ""
        );


    const imageHtml =
        typeof renderRoomImage ===
        "function"

            ?

            renderRoomImage(
                roomNumber
            )

            :

            `
            <div style="
                width:100%;
                height:200px;
                display:flex;
                align-items:center;
                justify-content:center;
                background:#f1f1f1;
                border-radius:12px;
                font-size:70px;
            ">
                🏠
            </div>
            `;


    const price =
        Number(
            room.price || 0
        );


    const dailyProfit =
        Number(
            room.dailyProfit || 0
        );


    const days =
        Number(
            room.days || 0
        );


    const totalProfit =
        calculateRoomTotalProfit(
            room
        );


    const totalReturn =
        calculateRoomTotalReturn(
            room
        );


    return `

        <div
            class="room-card"
            style="
                border:1px solid #ddd;
                border-radius:15px;
                padding:15px;
                margin:20px 0;
                background:white;
                box-shadow:0 3px 10px rgba(0,0,0,0.08);
            "
        >


            ${imageHtml}


            <h2 style="
                margin-top:15px;
            ">

                🏠 Chumba
                ${escapeHtml(
                    roomNumber
                )}

            </h2>


            <p>

                <strong>
                    💰 Bei ya Kodi:
                </strong>

                TSh ${formatMoney(
                    price
                )}

            </p>


            <p>

                <strong>
                    📈 Faida kwa Siku:
                </strong>

                TSh ${formatMoney(
                    dailyProfit
                )}

            </p>


            <p>

                <strong>
                    📅 Muda:
                </strong>

                Siku ${days}

            </p>


            <p>

                <strong>
                    💵 Jumla ya Faida:
                </strong>

                TSh ${formatMoney(
                    totalProfit
                )}

            </p>


            <p style="
                font-size:18px;
                font-weight:bold;
            ">

                <strong>
                    💰 Jumla Utakayopokea:
                </strong>

                TSh ${formatMoney(
                    totalReturn
                )}

            </p>


            <button
                class="thibitishaBtn"
                onclick="anzaBookingKwaRoom('${roomNumber}')"
            >

                🏠 Kodi Chumba

            </button>


        </div>

    `;
}


/* =========================================================
   7.5 DISPLAY ROOMS WITH IMAGES
========================================================= */

async function onyeshaVyumbaNaPicha() {

    const container =
        document.getElementById(
            "vyumba"
        );


    if (!container) {

        console.error(
            "Vyumba container haijapatikana."
        );

        return;

    }


    try {

        container.style.display =
            "block";


        /*
         * FUNGA SEHEMU NYENGINE
         */

        const fomuKodi =
            document.getElementById(
                "fomuKodi"
            );


        const taarifaSection =
            document.getElementById(
                "taarifaSection"
            );


        if (fomuKodi) {

            fomuKodi.style.display =
                "none";

        }


        if (taarifaSection) {

            taarifaSection.style.display =
                "none";

        }


        /*
         * LOADING
         */

        container.innerHTML = `

            <div class="booking-card">

                <h2>
                    🏠 Vyumba vya RoomRent
                </h2>

                <p>
                    ⏳ Inapakia vyumba...

                </p>

            </div>

        `;


        /*
         * LOAD ROOM IMAGES
         */

        if (
            typeof loadRoomImages ===
            "function"
        ) {

            await loadRoomImages();

        }


        /*
         * DISPLAY ROOMS
         */

        let html = `

            <div class="rooms-header">

                <h2>
                    🏠 Vyumba Vinavyopatikana
                </h2>

                <p>
                    Chagua chumba unachotaka
                    kukodi.
                </p>

            </div>

        `;


        ROOMRENT_ROOMS.forEach(
            room => {

                html +=
                    createRoomCard(
                        room
                    );

            }
        );


        container.innerHTML =
            html;


        /*
         * SCROLL
         */

        container.scrollIntoView({

            behavior:
                "smooth",

            block:
                "start"

        });


    } catch (error) {

        console.error(
            "Display rooms error:",
            error
        );


        container.innerHTML = `

            <div class="booking-card">

                <h2>
                    🏠 Vyumba</h2>

                <p style="color:red;">

                    ❌ Imeshindikana
                    kupakia vyumba.

                </p>

            </div>

        `;

    }
}


/* =========================================================
   7.6 START BOOKING FROM ROOM CARD
========================================================= */

async function anzaBookingKwaRoom(
    roomNumber
) {

    const room =
        ROOMRENT_ROOMS.find(
            item =>

                String(item.number) ===
                String(roomNumber)
        );


    if (!room) {

        alert(
            "❌ Chumba hakijapatikana."
        );

        return;

    }


    /*
     * HII INATUMIA FUNCTION YA BOOKING
     * ILIYOTENGENEZWA KWENYE SEHEMU ZA AWALI
     */

    if (
        typeof funguaFomuKodi ===
        "function"
    ) {

        await funguaFomuKodi(
            room
        );

        return;

    }


    /*
     * BACKUP
     */

    if (
        typeof anzaBooking ===
        "function"
    ) {

        await anzaBooking(
            room
        );

        return;

    }


    /*
     * IKIWA BOOKING FUNCTION
     * HAIJAPATIKANA
     */

    alert(
        "⚠️ Mfumo wa booking bado haujaunganishwa kikamilifu."
    );

}


/* =========================================================
   7.7 CONNECT VYUMBA BUTTON SAFELY
========================================================= */

function connectVyumbaButtonSehemu7() {

    const button =
        document.getElementById(
            "angaliaVyumba"
        );


    if (!button) {

        console.error(
            "Button ya Vyumba haijapatikana."
        );

        return;

    }


    /*
     * ONDOA EVENT YA ZAMANI
     * KWA KUTUMIA CLONE
     */

    const newButton =
        button.cloneNode(
            true
        );


    button.parentNode.replaceChild(
        newButton,
        button
    );


    /*
     * EVENT MPYA
     */

    newButton.addEventListener(
        "click",

        async function() {

            await onyeshaVyumbaNaPicha();

        }

    );


    console.log(
        "✅ Button ya Vyumba imeunganishwa."
    );

}


/* =========================================================
   7.8 INITIALIZE SEHEMU 7
========================================================= */

document.addEventListener(
    "DOMContentLoaded",

    async function() {

        try {

            connectVyumbaButtonSehemu7();


            console.log(
                "✅ Sehemu ya 7 tayari."
            );


        } catch (error) {

            console.error(
                "Sehemu 7 initialization error:",
                error
            );

        }

    }

);


/* =========================================================
   7.9 WINDOW EXPORTS
========================================================= */

window.onyeshaVyumbaNaPicha =
    onyeshaVyumbaNaPicha;


window.anzaBookingKwaRoom =
    anzaBookingKwaRoom;


window.createRoomCard =
    createRoomCard;


/* =========================================================
   SEHEMU YA 7 IMEISHIA HAPA
========================================================= */
/* =========================================================
   ROOMRENT - SEHEMU YA 8
   BOOKING FORM + PAYMENT REQUEST + FIRESTORE
   ========================================================= */


/* =========================================================
   8.1 ROOMRENT PAYMENT SETTINGS
========================================================= */

const ROOMRENT_PAYMENT_DETAILS = {

    "Airtel Money": {
        phone: "0667872515",
        name: "HARUNA ISSA HAMAD"
    },

    "MIXX BY YAS": {
        phone: "0651590936",
        name: "HARUNA ISSA HAMAD"
    }

};


/* =========================================================
   8.2 OPEN NEW BOOKING FORM
========================================================= */

async function funguaBookingFormSehemu8(roomNumber) {

    const room =
        ROOMRENT_ROOMS.find(
            item =>
                String(item.number) ===
                String(roomNumber)
        );


    if (!room) {

        alert("❌ Chumba hakijapatikana.");

        return;

    }


    const user =
        auth.currentUser;


    if (!user) {

        alert(
            "🔐 Tafadhali ingia au jisajili kwanza."
        );

        const loginSection =
            document.getElementById(
                "emailLoginSection"
            );


        if (loginSection) {

            loginSection.scrollIntoView({
                behavior: "smooth"
            });

        }

        return;

    }


    const section =
        document.getElementById(
            "fomuKodi"
        );


    if (!section) {

        console.error(
            "Fomu ya booking haijapatikana."
        );

        return;

    }


    const totalProfit =
        calculateRoomTotalProfit(room);


    const totalReturn =
        calculateRoomTotalReturn(room);


    section.style.display =
        "block";


    const vyumba =
        document.getElementById(
            "vyumba"
        );


    if (vyumba) {

        vyumba.style.display =
            "none";

    }


    const taarifa =
        document.getElementById(
            "taarifaSection"
        );


    if (taarifa) {

        taarifa.style.display =
            "none";

    }


    section.innerHTML = `

        <div class="booking-card">

            <h2>
                🏠 Kodi Chumba ${escapeHtml(room.number)}
            </h2>


            <div style="
                border:1px solid #ddd;
                border-radius:12px;
                padding:15px;
                margin:15px 0;
            ">

                <p>
                    <strong>Bei:</strong>
                    TSh ${formatMoney(room.price)}
                </p>

                <p>
                    <strong>Faida kwa siku:</strong>
                    TSh ${formatMoney(room.dailyProfit)}
                </p>

                <p>
                    <strong>Muda:</strong>
                    Siku ${room.days}
                </p>

                <p>
                    <strong>Jumla ya Faida:</strong>
                    TSh ${formatMoney(totalProfit)}
                </p>

                <p>
                    <strong>Jumla Utakayopokea:</strong>
                    TSh ${formatMoney(totalReturn)}
                </p>

            </div>


            <label>
                👤 Jina lako
            </label>

            <input
                type="text"
                id="bookingNameSehemu8"
                placeholder="Weka jina lako"
            >


            <label>
                📱 Namba ya simu
            </label>

            <input
                type="tel"
                id="bookingPhoneSehemu8"
                placeholder="Mfano: 0712345678"
            >


            <label>
                🎁 Referral Code (hiari)
            </label>

            <input
                type="text"
                id="bookingReferralSehemu8"
                placeholder="Mfano: RR1234"
            >


            <label>
                💳 Njia ya malipo
            </label>

            <select
                id="bookingPaymentMethodSehemu8"
                onchange="onyeshaPaymentDetailsSehemu8()"
            >

                <option value="">
                    Chagua njia ya malipo
                </option>

                <option value="Airtel Money">
                    Airtel Money
                </option>

                <option value="MIXX BY YAS">
                    MIXX BY YAS
                </option>

            </select>


            <div
                id="paymentDetailsSehemu8"
                style="
                    display:none;
                    border:1px solid #ddd;
                    padding:15px;
                    border-radius:12px;
                    margin:15px 0;
                "
            >
            </div>


            <button
                class="thibitishaBtn"
                onclick="tumaBookingSehemu8('${escapeHtml(room.number)}')"
            >

                📋 Thibitisha Booking

            </button>


            <button
                class="endeleaBtn"
                onclick="onyeshaVyumbaNaPicha()"
            >

                ← Rudi Vyumba

            </button>


            <div
                id="bookingMessageSehemu8"
                style="margin-top:15px;"
            ></div>

        </div>

    `;


    section.scrollIntoView({

        behavior: "smooth",

        block: "start"

    });

}


/* =========================================================
   8.3 SHOW REAL PAYMENT DETAILS
========================================================= */

function onyeshaPaymentDetailsSehemu8() {

    const methodElement =
        document.getElementById(
            "bookingPaymentMethodSehemu8"
        );


    const container =
        document.getElementById(
            "paymentDetailsSehemu8"
        );


    if (
        !methodElement ||
        !container
    ) {

        return;

    }


    const method =
        methodElement.value;


    if (
        !method ||
        !ROOMRENT_PAYMENT_DETAILS[method]
    ) {

        container.style.display =
            "none";

        return;

    }


    const details =
        ROOMRENT_PAYMENT_DETAILS[
            method
        ];


    container.style.display =
        "block";


    container.innerHTML = `

        <h3>
            💳 Maelekezo ya Malipo
        </h3>

        <p>
            Tuma pesa kwenda:
        </p>

        <p>
            <strong>
                ${escapeHtml(method)}
            </strong>
        </p>

        <p>
            📱 Namba:
            <strong>
                ${escapeHtml(details.phone)}
            </strong>
        </p>

        <p>
            👤 Jina:
            <strong>
                ${escapeHtml(details.name)}
            </strong>
        </p>

        <p style="
            color:#b45309;
            font-size:14px;
        ">

            ⚠️ Hakikisha umetuma
            TSh ${formatMoney(
                ROOMRENT_ROOMS.find(
                    room =>
                        String(room.number) ===
                        String(
                            document
                                .querySelector(
                                    "#fomuKodi h2"
                                )
                                ?.textContent
                                ?.replace(
                                    /[^0-9]/g,
                                    ""
                                )
                        )
                )?.price || 0
            )}
            kabla ya kuthibitisha booking.

        </p>

    `;

}


/* =========================================================
   8.4 SHOW BOOKING MESSAGE
========================================================= */

function showBookingMessageSehemu8(
    text,
    color = "black"
) {

    const message =
        document.getElementById(
            "bookingMessageSehemu8"
        );


    if (!message) return;


    message.style.color =
        color;


    message.style.padding =
        "10px";


    message.textContent =
        text;

}


/* =========================================================
   8.5 SUBMIT BOOKING
========================================================= */

async function tumaBookingSehemu8(roomNumber) {

    const user =
        auth.currentUser;


    if (!user) {

        alert(
            "❌ Tafadhali ingia kwanza."
        );

        return;

    }


    const room =
        ROOMRENT_ROOMS.find(
            item =>
                String(item.number) ===
                String(roomNumber)
        );


    if (!room) {

        showBookingMessageSehemu8(
            "❌ Chumba hakijapatikana.",
            "red"
        );

        return;

    }


    const name =
        document.getElementById(
            "bookingNameSehemu8"
        )
        ?.value
        .trim();


    const phone =
        formatTanzaniaPhone(
            document.getElementById(
                "bookingPhoneSehemu8"
            )
            ?.value
            .trim() || ""
        );


    const referralCode =
        document.getElementById(
            "bookingReferralSehemu8"
        )
        ?.value
        .trim()
        .toUpperCase();


    const paymentMethod =
        document.getElementById(
            "bookingPaymentMethodSehemu8"
        )
        ?.value;


    if (!name) {

        showBookingMessageSehemu8(
            "❌ Weka jina lako.",
            "red"
        );

        return;

    }


    if (!phone) {

        showBookingMessageSehemu8(
            "❌ Weka namba sahihi ya simu.",
            "red"
        );

        return;

    }


    if (!paymentMethod) {

        showBookingMessageSehemu8(
            "❌ Chagua njia ya malipo.",
            "red"
        );

        return;

    }


    try {

        showBookingMessageSehemu8(
            "⏳ Inahifadhi booking...",
            "black"
        );


        /*
         * CHECK REFERRAL CODE
         */

        let referredBy =
            null;


        if (referralCode) {

            const referralSnapshot =
                await db.collection(
                    "users"
                )
                .where(
                    "referralCode",
                    "==",
                    referralCode
                )
                .limit(1)
                .get();


            if (
                referralSnapshot.empty
            ) {

                showBookingMessageSehemu8(
                    "❌ Referral Code si sahihi.",
                    "red"
                );

                return;

            }


            const referralDoc =
                referralSnapshot.docs[0];


            if (
                referralDoc.id === user.uid
            ) {

                showBookingMessageSehemu8(
                    "❌ Huwezi kutumia Referral Code yako mwenyewe.",
                    "red"
                );

                return;

            }


            referredBy =
                referralDoc.id;

        }


        /*
         * CREATE BOOKING NUMBER
         */

        const bookingNumber =
            "RR" +
            Date.now()
                .toString()
                .slice(-8);


        /*
         * PAYMENT DETAILS
         */

        const paymentDetails =
            ROOMRENT_PAYMENT_DETAILS[
                paymentMethod
            ];


        /*
         * CREATE BOOKING
         */

        const bookingRef =
            await db.collection(
                "bookings"
            )
            .add({

                bookingNumber:
                    bookingNumber,

                userId:
                    user.uid,

                userEmail:
                    user.email || "",

                customerName:
                    name,

                customerPhone:
                    phone,

                roomNumber:
                    String(room.number),

                roomPrice:
                    Number(room.price),

                dailyProfit:
                    Number(room.dailyProfit),

                days:
                    Number(room.days),

                totalProfit:
                    calculateRoomTotalProfit(
                        room
                    ),

                totalReturn:
                    calculateRoomTotalReturn(
                        room
                    ),

                paymentMethod:
                    paymentMethod,

                paymentReceiverPhone:
                    paymentDetails.phone,

                paymentReceiverName:
                    paymentDetails.name,

                paymentStatus:
                    "Pending",

                paymentReference:
                    "",

                status:
                    "Waiting Payment",

                referralCode:
                    referralCode || "",

                referredBy:
                    referredBy,

                commissionProcessed:
                    false,

                createdAt:
                    firebase.firestore
                        .FieldValue
                        .serverTimestamp(),

                updatedAt:
                    firebase.firestore
                        .FieldValue
                        .serverTimestamp()

            });


        /*
         * UPDATE USER DETAILS
         */

        const userUpdate = {

            name:
                name,

            phone:
                phone,

            updatedAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp()

        };


        if (
            referredBy
        ) {

            userUpdate.referredBy =
                referredBy;

        }


        await db.collection(
            "users"
        )
        .doc(user.uid)
        .set(
            userUpdate,
            {
                merge: true
            }
        );


        /*
         * NOTIFICATION
         */

        await createNotification(

            user.uid,

            "Booking Created",

            `Booking yako ${bookingNumber} ya chumba ${room.number} imepokelewa. Tafadhali kamilisha malipo.`

        );


        showBookingMessageSehemu8(
            "✅ Booking imefanikiwa. Sasa tuma malipo na weka reference ya malipo.",
            "green"
        );


        /*
         * SHOW PAYMENT CONFIRMATION FORM
         */

        onyeshaPaymentConfirmationSehemu8(
            bookingRef.id,
            bookingNumber,
            room,
            paymentMethod,
            paymentDetails
        );


    } catch (error) {

        console.error(
            "Booking error:",
            error
        );


        showBookingMessageSehemu8(
            "❌ Imeshindikana kuhifadhi booking: " +
            (
                error.message || ""
            ),
            "red"
        );

    }

}


/* =========================================================
   8.6 PAYMENT CONFIRMATION FORM
========================================================= */

function onyeshaPaymentConfirmationSehemu8(

    bookingId,

    bookingNumber,

    room,

    paymentMethod,

    paymentDetails

) {

    const section =
        document.getElementById(
            "fomuKodi"
        );


    if (!section) return;


    section.innerHTML = `

        <div class="booking-card">

            <h2>
                💳 Kamilisha Malipo
            </h2>


            <p>

                Booking Number:

                <strong>
                    ${escapeHtml(
                        bookingNumber
                    )}
                </strong>

            </p>


            <p>

                🏠 Chumba:

                <strong>
                    ${escapeHtml(
                        room.number
                    )}
                </strong>

            </p>


            <p>

                💰 Kiasi:

                <strong>
                    TSh ${formatMoney(
                        room.price
                    )}
                </strong>

            </p>


            <div style="
                border:2px solid #ddd;
                border-radius:12px;
                padding:15px;
                margin:15px 0;
            ">

                <h3>
                    ${escapeHtml(
                        paymentMethod
                    )}
                </h3>

                <p>
                    📱 Namba ya kulipia:
                    <strong>
                        ${escapeHtml(
                            paymentDetails.phone
                        )}
                    </strong>
                </p>

                <p>
                    👤 Jina:
                    <strong>
                        ${escapeHtml(
                            paymentDetails.name
                        )}
                    </strong>
                </p>

            </div>


            <p>

                Baada ya kutuma malipo,
                weka **reference/transaction number**
                kutoka kwenye ujumbe wa malipo.

            </p>


            <label>
                🔢 Payment Reference
            </label>

            <input
                type="text"
                id="paymentReferenceSehemu8"
                placeholder="Mfano: ABC123XYZ"
            >


            <button
                class="thibitishaBtn"
                onclick="thibitishaPaymentSehemu8('${bookingId}')"
            >

                ✅ Nimetuma Malipo

            </button>


            <div
                id="paymentConfirmationMessageSehemu8"
                style="margin-top:15px;"
            ></div>

        </div>

    `;

}


/* =========================================================
   8.7 CONFIRM PAYMENT REQUEST
========================================================= */

async function thibitishaPaymentSehemu8(
    bookingId
) {

    const reference =
        document.getElementById(
            "paymentReferenceSehemu8"
        )
        ?.value
        .trim();


    const message =
        document.getElementById(
            "paymentConfirmationMessageSehemu8"
        );


    if (!reference) {

        if (message) {

            message.style.color =
                "red";

            message.textContent =
                "❌ Weka Payment Reference.";

        }

        return;

    }


    try {

        if (message) {

            message.style.color =
                "black";

            message.textContent =
                "⏳ Inatuma uthibitisho wa malipo...";

        }


        const bookingRef =
            db.collection(
                "bookings"
            )
            .doc(bookingId);


        const bookingSnap =
            await bookingRef.get();


        if (
            !bookingSnap.exists
        ) {

            throw new Error(
                "Booking haijapatikana."
            );

        }


        const booking =
            bookingSnap.data();


        if (
            booking.userId !==
            auth.currentUser.uid
        ) {

            throw new Error(
                "Huna ruhusa ya booking hii."
            );

        }


        /*
         * CREATE PAYMENT REQUEST
         */

        await db.collection(
            "paymentRequests"
        )
        .add({

            bookingId:
                bookingId,

            bookingNumber:
                booking.bookingNumber || "",

            userId:
                booking.userId,

            userEmail:
                booking.userEmail || "",

            customerName:
                booking.customerName || "",

            customerPhone:
                booking.customerPhone || "",

            roomNumber:
                booking.roomNumber || "",

            amount:
                Number(
                    booking.roomPrice || 0
                ),

            paymentMethod:
                booking.paymentMethod || "",

            paymentReference:
                reference,

            status:
                "Waiting",

            createdAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp()

        });


        /*
         * UPDATE BOOKING
         */

        await bookingRef.update({

            paymentReference:
                reference,

            paymentStatus:
                "Requested",

            status:
                "Waiting Confirmation",

            updatedAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp()

        });


        /*
         * USER NOTIFICATION
         */

        await createNotification(

            booking.userId,

            "Payment Requested",

            `Tumepokea taarifa ya malipo ya booking ${booking.bookingNumber}. Admin atathibitisha malipo yako.`

        );


        if (message) {

            message.style.color =
                "green";

            message.textContent =
                "✅ Taarifa ya malipo imetumwa kwa Admin. Subiri uthibitisho.";

        }


    } catch (error) {

        console.error(
            "Payment confirmation error:",
            error
        );


        if (message) {

            message.style.color =
                "red";

            message.textContent =
                "❌ " +
                (
                    error.message ||
                    "Imeshindikana."
                );

        }

    }

}


/* =========================================================
   8.8 RECONNECT ROOM BOOKING BUTTON
========================================================= */

function reconnectRoomBookingSehemu8() {

    /*
     * Tunabadilisha function
     * iliyotumiwa na room cards.
     */

    window.anzaBookingKwaRoom =
        async function(roomNumber) {

            await funguaBookingFormSehemu8(
                roomNumber
            );

        };

}


/* =========================================================
   8.9 INITIALIZE SEHEMU 8
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        reconnectRoomBookingSehemu8();


        console.log(
            "✅ Sehemu ya 8 tayari."
        );

    }
);


/* =========================================================
   8.10 WINDOW EXPORTS
========================================================= */

window.funguaBookingFormSehemu8 =
    funguaBookingFormSehemu8;


window.tumaBookingSehemu8 =
    tumaBookingSehemu8;


window.onyeshaPaymentDetailsSehemu8 =
    onyeshaPaymentDetailsSehemu8;


window.thibitishaPaymentSehemu8 =
    thibitishaPaymentSehemu8;


window.onyeshaPaymentConfirmationSehemu8 =
    onyeshaPaymentConfirmationSehemu8;


/* =========================================================
   SEHEMU YA 8 IMEISHIA HAPA
========================================================= */
/* =========================================================
   ROOMRENT - SEHEMU YA 9
   BOOKING ZANGU + ACCOUNT + NOTIFICATIONS
   ========================================================= */


/* =========================================================
   9.1 SAFE TEXT ESCAPE FALLBACK
========================================================= */

if (typeof escapeHtml !== "function") {

    function escapeHtml(value) {

        const div =
            document.createElement("div");

        div.textContent =
            value === null ||
            value === undefined
                ? ""
                : String(value);

        return div.innerHTML;
    }
}


/* =========================================================
   9.2 FORMAT DATE
========================================================= */

function formatRoomRentDateSehemu9(value) {

    if (!value) {
        return "Bado";
    }

    try {

        let date;

        if (
            value &&
            typeof value.toDate === "function"
        ) {

            date = value.toDate();

        } else {

            date = new Date(value);

        }

        if (
            isNaN(date.getTime())
        ) {

            return "Bado";

        }

        return date.toLocaleString(
            "sw-TZ",
            {
                dateStyle: "medium",
                timeStyle: "short"
            }
        );

    } catch (error) {

        return "Bado";
    }
}


/* =========================================================
   9.3 SHOW MAIN SECTION
========================================================= */

function showMainSectionSehemu9(sectionName) {

    const vyumba =
        document.getElementById("vyumba");

    const fomuKodi =
        document.getElementById("fomuKodi");

    const taarifa =
        document.getElementById("taarifaSection");


    if (vyumba) {
        vyumba.style.display = "none";
    }

    if (fomuKodi) {
        fomuKodi.style.display = "none";
    }

    if (taarifa) {
        taarifa.style.display = "block";
    }

}


/* =========================================================
   9.4 LOAD MY BOOKINGS
========================================================= */

async function funguaBookingZanguSehemu9() {

    const user =
        auth.currentUser;


    if (!user) {

        alert(
            "🔐 Tafadhali ingia kwanza."
        );

        const loginSection =
            document.getElementById(
                "emailLoginSection"
            );

        if (loginSection) {

            loginSection.scrollIntoView({
                behavior: "smooth"
            });

        }

        return;
    }


    showMainSectionSehemu9(
        "bookings"
    );


    const section =
        document.getElementById(
            "taarifaSection"
        );


    if (!section) return;


    section.innerHTML = `

        <div class="booking-card">

            <h2>
                📋 Booking Zangu
            </h2>

            <p>
                ⏳ Inapakia booking zako...
            </p>

        </div>

    `;


    try {

        const snapshot =
            await db.collection(
                "bookings"
            )
            .where(
                "userId",
                "==",
                user.uid
            )
            .get();


        const bookings = [];


        snapshot.forEach(doc => {

            bookings.push({

                id: doc.id,

                ...doc.data()

            });

        });


        bookings.sort(
            (a, b) => {

                const dateA =
                    a.createdAt &&
                    typeof a.createdAt.toDate ===
                    "function"
                        ? a.createdAt
                            .toDate()
                            .getTime()
                        : 0;


                const dateB =
                    b.createdAt &&
                    typeof b.createdAt.toDate ===
                    "function"
                        ? b.createdAt
                            .toDate()
                            .getTime()
                        : 0;


                return dateB - dateA;

            }
        );


        if (
            bookings.length === 0
        ) {

            section.innerHTML = `

                <div class="booking-card">

                    <h2>
                        📋 Booking Zangu
                    </h2>

                    <p>
                        Bado hujafanya booking yoyote.
                    </p>

                    <button
                        class="thibitishaBtn"
                        onclick="onyeshaVyumbaNaPicha()"
                    >

                        🏠 Angalia Vyumba

                    </button>

                </div>

            `;

            return;
        }


        let html = `

            <div class="booking-card">

                <h2>
                    📋 Booking Zangu
                </h2>

                <p>
                    Jumla ya booking:
                    <strong>
                        ${bookings.length}
                    </strong>
                </p>

        `;


        bookings.forEach(
            booking => {

                const paymentStatus =
                    booking.paymentStatus ||
                    "Pending";


                const bookingStatus =
                    booking.status ||
                    "Pending";


                let statusIcon =
                    "⏳";


                if (
                    paymentStatus ===
                    "Confirmed"
                ) {

                    statusIcon =
                        "✅";

                } else if (
                    paymentStatus ===
                    "Rejected"
                ) {

                    statusIcon =
                        "❌";

                } else if (
                    paymentStatus ===
                    "Requested"
                ) {

                    statusIcon =
                        "📨";

                }


                html += `

                    <div
                        style="
                            border:1px solid #ddd;
                            border-radius:12px;
                            padding:15px;
                            margin:15px 0;
                        "
                    >

                        <h3>
                            ${statusIcon}
                            Chumba
                            ${escapeHtml(
                                booking.roomNumber || "-"
                            )}
                        </h3>


                        <p>

                            📋 Booking:

                            <strong>
                                ${escapeHtml(
                                    booking.bookingNumber || "-"
                                )}
                            </strong>

                        </p>


                        <p>

                            💰 Bei:

                            <strong>

                                TSh ${
                                    typeof formatMoney ===
                                    "function"

                                        ?

                                        formatMoney(
                                            booking.roomPrice || 0
                                        )

                                        :

                                        Number(
                                            booking.roomPrice || 0
                                        )
                                        .toLocaleString()
                                }

                            </strong>

                        </p>


                        <p>

                            📈 Faida kwa siku:

                            <strong>

                                TSh ${
                                    typeof formatMoney ===
                                    "function"

                                        ?

                                        formatMoney(
                                            booking.dailyProfit || 0
                                        )

                                        :

                                        Number(
                                            booking.dailyProfit || 0
                                        )
                                        .toLocaleString()
                                }

                            </strong>

                        </p>


                        <p>

                            📅 Muda:

                            <strong>
                                Siku ${
                                    booking.days || 0
                                }
                            </strong>

                        </p>


                        <p>

                            💳 Njia ya malipo:

                            <strong>
                                ${escapeHtml(
                                    booking.paymentMethod || "-"
                                )}
                            </strong>

                        </p>


                        <p>

                            🔢 Reference:

                            <strong>
                                ${escapeHtml(
                                    booking.paymentReference || "Bado"
                                )}
                            </strong>

                        </p>


                        <p>

                            💳 Payment Status:

                            <strong>
                                ${escapeHtml(
                                    paymentStatus
                                )}
                            </strong>

                        </p>


                        <p>

                            📌 Status:

                            <strong>
                                ${escapeHtml(
                                    bookingStatus
                                )}
                            </strong>

                        </p>


                        <p
                            style="
                                font-size:13px;
                                opacity:0.8;
                            "
                        >

                            🕒
                            ${formatRoomRentDateSehemu9(
                                booking.createdAt
                            )}

                        </p>

                    </div>

                `;

            }
        );


        html += `

                <button
                    class="endeleaBtn"
                    onclick="onyeshaVyumbaNaPicha()"
                >

                    🏠 Vyumba

                </button>

            </div>

        `;


        section.innerHTML =
            html;


        section.scrollIntoView({

            behavior: "smooth",

            block: "start"

        });


    } catch (error) {

        console.error(
            "Load bookings error:",
            error
        );


        section.innerHTML = `

            <div class="booking-card">

                <h2>
                    📋 Booking Zangu
                </h2>

                <p style="color:red;">

                    ❌ Imeshindikana kupakia booking zako.

                </p>

            </div>

        `;
    }
}


/* =========================================================
   9.5 GET USER REFERRAL DATA
========================================================= */

async function getUserReferralDataSehemu9(
    userId
) {

    try {

        const userDoc =
            await db.collection(
                "users"
            )
            .doc(userId)
            .get();


        if (
            !userDoc.exists
        ) {

            return null;

        }


        return {

            id: userDoc.id,

            ...userDoc.data()

        };


    } catch (error) {

        console.error(
            "Referral data error:",
            error
        );

        return null;
    }
}


/* =========================================================
   9.6 GET TOTAL USER COMMISSION
========================================================= */

async function getUserCommissionSehemu9(
    userId
) {

    try {

        const snapshot =
            await db.collection(
                "commissions"
            )
            .where(
                "userId",
                "==",
                userId
            )
            .get();


        let total =
            0;


        snapshot.forEach(doc => {

            const data =
                doc.data();


            total +=
                Number(
                    data.amount || 0
                );

        });


        return total;


    } catch (error) {

        console.error(
            "Commission error:",
            error
        );

        return 0;
    }
}


/* =========================================================
   9.7 OPEN ACCOUNT
========================================================= */

async function funguaAccountSehemu9() {

    const user =
        auth.currentUser;


    if (!user) {

        alert(
            "🔐 Tafadhali ingia kwanza."
        );

        return;
    }


    showMainSectionSehemu9(
        "account"
    );


    const section =
        document.getElementById(
            "taarifaSection"
        );


    if (!section) return;


    section.innerHTML = `

        <div class="booking-card">

            <h2>
                👤 Account Yangu
            </h2>

            <p>
                ⏳ Inapakia taarifa zako...
            </p>

        </div>

    `;


    try {

        const userData =
            await getUserReferralDataSehemu9(
                user.uid
            );


        const totalCommission =
            await getUserCommissionSehemu9(
                user.uid
            );


        const referralCode =
            userData?.referralCode ||
            "Bado";


        const referralLink =
            referralCode !== "Bado"

                ?

                `${window.location.origin}${window.location.pathname}?ref=${encodeURIComponent(referralCode)}`

                :

                "";


        section.innerHTML = `

            <div class="booking-card">

                <h2>
                    👤 Account Yangu
                </h2>


                <div style="
                    border:1px solid #ddd;
                    border-radius:12px;
                    padding:15px;
                    margin:15px 0;
                ">

                    <p>

                        👤 Jina:

                        <strong>
                            ${escapeHtml(
                                userData?.name ||
                                "Bado hujaweka"
                            )}
                        </strong>

                    </p>


                    <p>

                        📧 Email:

                        <strong>
                            ${escapeHtml(
                                user.email || "-"
                            )}
                        </strong>

                    </p>


                    <p>

                        📱 Simu:

                        <strong>
                            ${escapeHtml(
                                userData?.phone ||
                                "Bado hujaweka"
                            )}
                        </strong>

                    </p>

                </div>


                <div style="
                    border:1px solid #ddd;
                    border-radius:12px;
                    padding:15px;
                    margin:15px 0;
                ">

                    <h3>
                        🎁 Referral Yangu
                    </h3>


                    <p>

                        Referral Code:

                        <strong>
                            ${escapeHtml(
                                referralCode
                            )}
                        </strong>

                    </p>


                    <input
                        type="text"
                        id="myReferralLinkSehemu9"
                        value="${escapeHtml(
                            referralLink
                        )}"
                        readonly
                    >


                    <button
                        class="thibitishaBtn"
                        onclick="copyReferralLinkSehemu9()"
                    >

                        📋 Copy Referral Link

                    </button>

                </div>


                <div style="
                    border:1px solid #ddd;
                    border-radius:12px;
                    padding:15px;
                    margin:15px 0;
                ">

                    <h3>
                        💰 Commission
                    </h3>


                    <p
                        style="
                            font-size:22px;
                            font-weight:bold;
                        "
                    >

                        TSh ${
                            typeof formatMoney ===
                            "function"

                                ?

                                formatMoney(
                                    totalCommission
                                )

                                :

                                Number(
                                    totalCommission
                                )
                                .toLocaleString()
                        }

                    </p>


                    <button
                        class="endeleaBtn"
                        onclick="funguaWithdrawalSehemu9()"
                    >

                        💸 Withdrawal

                    </button>

                </div>


                <button
                    class="endeleaBtn"
                    onclick="logoutRoomRentSehemu9()"
                >

                    🚪 Logout

                </button>

            </div>

        `;


    } catch (error) {

        console.error(
            "Account error:",
            error
        );


        section.innerHTML = `

            <div class="booking-card">

                <h2>
                    👤 Account Yangu
                </h2>

                <p style="color:red;">

                    ❌ Imeshindikana kupakia account.

                </p>

            </div>

        `;
    }
}


/* =========================================================
   9.8 COPY REFERRAL LINK
========================================================= */

async function copyReferralLinkSehemu9() {

    const input =
        document.getElementById(
            "myReferralLinkSehemu9"
        );


    if (!input) return;


    if (!input.value) {

        alert(
            "❌ Referral Link bado haijapatikana."
        );

        return;

    }


    try {

        await navigator.clipboard.writeText(
            input.value
        );


        alert(
            "✅ Referral Link imekopiwa."
        );


    } catch (error) {

        input.select();

        input.setSelectionRange(
            0,
            99999
        );


        document.execCommand(
            "copy"
        );


        alert(
            "✅ Referral Link imekopiwa."
        );
    }
}


/* =========================================================
   9.9 GET USER NOTIFICATIONS
========================================================= */

async function getNotificationsSehemu9(
    userId
) {

    try {

        const snapshot =
            await db.collection(
                "notifications"
            )
            .where(
                "userId",
                "==",
                userId
            )
            .get();


        const notifications =
            [];


        snapshot.forEach(doc => {

            notifications.push({

                id: doc.id,

                ...doc.data()

            });

        });


        notifications.sort(
            (a, b) => {

                const dateA =
                    a.createdAt &&
                    typeof a.createdAt.toDate ===
                    "function"

                        ?

                        a.createdAt
                            .toDate()
                            .getTime()

                        :

                        0;


                const dateB =
                    b.createdAt &&
                    typeof b.createdAt.toDate ===
                    "function"

                        ?

                        b.createdAt
                            .toDate()
                            .getTime()

                        :

                        0;


                return dateB - dateA;

            }
        );


        return notifications;


    } catch (error) {

        console.error(
            "Notifications error:",
            error
        );

        return [];
    }
}


/* =========================================================
   9.10 OPEN NOTIFICATIONS
========================================================= */

async function funguaTaarifaSehemu9() {

    const user =
        auth.currentUser;


    if (!user) {

        alert(
            "🔐 Tafadhali ingia kwanza."
        );

        return;
    }


    showMainSectionSehemu9(
        "notifications"
    );


    const section =
        document.getElementById(
            "taarifaSection"
        );


    if (!section) return;


    section.innerHTML = `

        <div class="booking-card">

            <h2>
                🔔 Taarifa
            </h2>

            <p>
                ⏳ Inapakia taarifa...
            </p>

        </div>

    `;


    const notifications =
        await getNotificationsSehemu9(
            user.uid
        );


    if (
        notifications.length === 0
    ) {

        section.innerHTML = `

            <div class="booking-card">

                <h2>
                    🔔 Taarifa
                </h2>

                <p>
                    Bado hakuna taarifa mpya.
                </p>

            </div>

        `;

        return;
    }


    let html = `

        <div class="booking-card">

            <h2>
                🔔 Taarifa
            </h2>

    `;


    notifications.forEach(
        notification => {

            html += `

                <div style="
                    border-bottom:1px solid #ddd;
                    padding:15px 0;
                ">

                    <h3>
                        ${escapeHtml(
                            notification.title ||
                            "Taarifa"
                        )}
                    </h3>


                    <p>
                        ${escapeHtml(
                            notification.message ||
                            ""
                        )}
                    </p>


                    <small>

                        🕒
                        ${formatRoomRentDateSehemu9(
                            notification.createdAt
                        )}

                    </small>

                </div>

            `;

        }
    );


    html += `

        </div>

    `;


    section.innerHTML =
        html;

}


/* =========================================================
   9.11 LOGOUT
========================================================= */

async function logoutRoomRentSehemu9() {

    const confirmed =
        confirm(
            "Una uhakika unataka kutoka?"
        );


    if (!confirmed) {
        return;
    }


    try {

        await auth.signOut();


        alert(
            "✅ Umetoka kwenye account yako."
        );


        const section =
            document.getElementById(
                "taarifaSection"
            );


        if (section) {

            section.style.display =
                "none";

        }


        const loginSection =
            document.getElementById(
                "emailLoginSection"
            );


        if (loginSection) {

            loginSection.style.display =
                "block";

            loginSection.scrollIntoView({

                behavior: "smooth"

            });

        }


    } catch (error) {

        console.error(
            "Logout error:",
            error
        );


        alert(
            "❌ Imeshindikana kutoka."
        );
    }
}


/* =========================================================
   9.12 WITHDRAWAL CONNECTOR
========================================================= */

function funguaWithdrawalSehemu9() {

    if (
        typeof funguaWithdrawal ===
        "function"
    ) {

        funguaWithdrawal();

        return;
    }


    if (
        typeof funguaWithdrawalSehemu5 ===
        "function"
    ) {

        funguaWithdrawalSehemu5();

        return;
    }


    alert(
        "⚠️ Mfumo wa Withdrawal bado haujaunganishwa."
    );
}


/* =========================================================
   9.13 CONNECT TOP BUTTONS
========================================================= */

function connectTopButtonsSehemu9() {

    const bookingBtn =
        document.getElementById(
            "bookingZangu"
        );


    const accountBtn =
        document.getElementById(
            "accountBtn"
        );


    const taarifaBtn =
        document.getElementById(
            "taarifaBtn"
        );


    const withdrawalBtn =
        document.getElementById(
            "withdrawalBtn"
        );


    if (bookingBtn) {

        const newBookingBtn =
            bookingBtn.cloneNode(
                true
            );


        bookingBtn.parentNode.replaceChild(
            newBookingBtn,
            bookingBtn
        );


        newBookingBtn.addEventListener(
            "click",
            async function() {

                await funguaBookingZanguSehemu9();

            }
        );

    }


    if (accountBtn) {

        const newAccountBtn =
            accountBtn.cloneNode(
                true
            );


        accountBtn.parentNode.replaceChild(
            newAccountBtn,
            accountBtn
        );


        newAccountBtn.addEventListener(
            "click",
            async function() {

                await funguaAccountSehemu9();

            }
        );

    }


    if (taarifaBtn) {

        const newTaarifaBtn =
            taarifaBtn.cloneNode(
                true
            );


        taarifaBtn.parentNode.replaceChild(
            newTaarifaBtn,
            taarifaBtn
        );


        newTaarifaBtn.addEventListener(
            "click",
            async function() {

                await funguaTaarifaSehemu9();

            }
        );

    }


    if (withdrawalBtn) {

        const newWithdrawalBtn =
            withdrawalBtn.cloneNode(
                true
            );


        withdrawalBtn.parentNode.replaceChild(
            newWithdrawalBtn,
            withdrawalBtn
        );


        newWithdrawalBtn.addEventListener(
            "click",
            function() {

                funguaWithdrawalSehemu9();

            }
        );

    }

}


/* =========================================================
   9.14 INITIALIZE SEHEMU 9
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        try {

            connectTopButtonsSehemu9();


            console.log(
                "✅ Sehemu ya 9 tayari."
            );


        } catch (error) {

            console.error(
                "Sehemu 9 initialization error:",
                error
            );

        }

    }
);


/* =========================================================
   9.15 WINDOW EXPORTS
========================================================= */

window.funguaBookingZanguSehemu9 =
    funguaBookingZanguSehemu9;


window.funguaAccountSehemu9 =
    funguaAccountSehemu9;


window.funguaTaarifaSehemu9 =
    funguaTaarifaSehemu9;


window.copyReferralLinkSehemu9 =
    copyReferralLinkSehemu9;


window.logoutRoomRentSehemu9 =
    logoutRoomRentSehemu9;


/* =========================================================
   SEHEMU YA 9 IMEISHIA HAPA
========================================================= *//* =========================================================
   ROOMRENT - SEHEMU YA 9
   BOOKING ZANGU + ACCOUNT + NOTIFICATIONS
   ========================================================= */


/* =========================================================
   9.1 SAFE TEXT ESCAPE FALLBACK
========================================================= */

if (typeof escapeHtml !== "function") {

    function escapeHtml(value) {

        const div =
            document.createElement("div");

        div.textContent =
            value === null ||
            value === undefined
                ? ""
                : String(value);

        return div.innerHTML;
    }
}


/* =========================================================
   9.2 FORMAT DATE
========================================================= */

function formatRoomRentDateSehemu9(value) {

    if (!value) {
        return "Bado";
    }

    try {

        let date;

        if (
            value &&
            typeof value.toDate === "function"
        ) {

            date = value.toDate();

        } else {

            date = new Date(value);

        }

        if (
            isNaN(date.getTime())
        ) {

            return "Bado";

        }

        return date.toLocaleString(
            "sw-TZ",
            {
                dateStyle: "medium",
                timeStyle: "short"
            }
        );

    } catch (error) {

        return "Bado";
    }
}


/* =========================================================
   9.3 SHOW MAIN SECTION
========================================================= */

function showMainSectionSehemu9(sectionName) {

    const vyumba =
        document.getElementById("vyumba");

    const fomuKodi =
        document.getElementById("fomuKodi");

    const taarifa =
        document.getElementById("taarifaSection");


    if (vyumba) {
        vyumba.style.display = "none";
    }

    if (fomuKodi) {
        fomuKodi.style.display = "none";
    }

    if (taarifa) {
        taarifa.style.display = "block";
    }

}


/* =========================================================
   9.4 LOAD MY BOOKINGS
========================================================= */

async function funguaBookingZanguSehemu9() {

    const user =
        auth.currentUser;


    if (!user) {

        alert(
            "🔐 Tafadhali ingia kwanza."
        );

        const loginSection =
            document.getElementById(
                "emailLoginSection"
            );

        if (loginSection) {

            loginSection.scrollIntoView({
                behavior: "smooth"
            });

        }

        return;
    }


    showMainSectionSehemu9(
        "bookings"
    );


    const section =
        document.getElementById(
            "taarifaSection"
        );


    if (!section) return;


    section.innerHTML = `

        <div class="booking-card">

            <h2>
                📋 Booking Zangu
            </h2>

            <p>
                ⏳ Inapakia booking zako...
            </p>

        </div>

    `;


    try {

        const snapshot =
            await db.collection(
                "bookings"
            )
            .where(
                "userId",
                "==",
                user.uid
            )
            .get();


        const bookings = [];


        snapshot.forEach(doc => {

            bookings.push({

                id: doc.id,

                ...doc.data()

            });

        });


        bookings.sort(
            (a, b) => {

                const dateA =
                    a.createdAt &&
                    typeof a.createdAt.toDate ===
                    "function"
                        ? a.createdAt
                            .toDate()
                            .getTime()
                        : 0;


                const dateB =
                    b.createdAt &&
                    typeof b.createdAt.toDate ===
                    "function"
                        ? b.createdAt
                            .toDate()
                            .getTime()
                        : 0;


                return dateB - dateA;

            }
        );


        if (
            bookings.length === 0
        ) {

            section.innerHTML = `

                <div class="booking-card">

                    <h2>
                        📋 Booking Zangu
                    </h2>

                    <p>
                        Bado hujafanya booking yoyote.
                    </p>

                    <button
                        class="thibitishaBtn"
                        onclick="onyeshaVyumbaNaPicha()"
                    >

                        🏠 Angalia Vyumba

                    </button>

                </div>

            `;

            return;
        }


        let html = `

            <div class="booking-card">

                <h2>
                    📋 Booking Zangu
                </h2>

                <p>
                    Jumla ya booking:
                    <strong>
                        ${bookings.length}
                    </strong>
                </p>

        `;


        bookings.forEach(
            booking => {

                const paymentStatus =
                    booking.paymentStatus ||
                    "Pending";


                const bookingStatus =
                    booking.status ||
                    "Pending";


                let statusIcon =
                    "⏳";


                if (
                    paymentStatus ===
                    "Confirmed"
                ) {

                    statusIcon =
                        "✅";

                } else if (
                    paymentStatus ===
                    "Rejected"
                ) {

                    statusIcon =
                        "❌";

                } else if (
                    paymentStatus ===
                    "Requested"
                ) {

                    statusIcon =
                        "📨";

                }


                html += `

                    <div
                        style="
                            border:1px solid #ddd;
                            border-radius:12px;
                            padding:15px;
                            margin:15px 0;
                        "
                    >

                        <h3>
                            ${statusIcon}
                            Chumba
                            ${escapeHtml(
                                booking.roomNumber || "-"
                            )}
                        </h3>


                        <p>

                            📋 Booking:

                            <strong>
                                ${escapeHtml(
                                    booking.bookingNumber || "-"
                                )}
                            </strong>

                        </p>


                        <p>

                            💰 Bei:

                            <strong>

                                TSh ${
                                    typeof formatMoney ===
                                    "function"

                                        ?

                                        formatMoney(
                                            booking.roomPrice || 0
                                        )

                                        :

                                        Number(
                                            booking.roomPrice || 0
                                        )
                                        .toLocaleString()
                                }

                            </strong>

                        </p>


                        <p>

                            📈 Faida kwa siku:

                            <strong>

                                TSh ${
                                    typeof formatMoney ===
                                    "function"

                                        ?

                                        formatMoney(
                                            booking.dailyProfit || 0
                                        )

                                        :

                                        Number(
                                            booking.dailyProfit || 0
                                        )
                                        .toLocaleString()
                                }

                            </strong>

                        </p>


                        <p>

                            📅 Muda:

                            <strong>
                                Siku ${
                                    booking.days || 0
                                }
                            </strong>

                        </p>


                        <p>

                            💳 Njia ya malipo:

                            <strong>
                                ${escapeHtml(
                                    booking.paymentMethod || "-"
                                )}
                            </strong>

                        </p>


                        <p>

                            🔢 Reference:

                            <strong>
                                ${escapeHtml(
                                    booking.paymentReference || "Bado"
                                )}
                            </strong>

                        </p>


                        <p>

                            💳 Payment Status:

                            <strong>
                                ${escapeHtml(
                                    paymentStatus
                                )}
                            </strong>

                        </p>


                        <p>

                            📌 Status:

                            <strong>
                                ${escapeHtml(
                                    bookingStatus
                                )}
                            </strong>

                        </p>


                        <p
                            style="
                                font-size:13px;
                                opacity:0.8;
                            "
                        >

                            🕒
                            ${formatRoomRentDateSehemu9(
                                booking.createdAt
                            )}

                        </p>

                    </div>

                `;

            }
        );


        html += `

                <button
                    class="endeleaBtn"
                    onclick="onyeshaVyumbaNaPicha()"
                >

                    🏠 Vyumba

                </button>

            </div>

        `;


        section.innerHTML =
            html;


        section.scrollIntoView({

            behavior: "smooth",

            block: "start"

        });


    } catch (error) {

        console.error(
            "Load bookings error:",
            error
        );


        section.innerHTML = `

            <div class="booking-card">

                <h2>
                    📋 Booking Zangu
                </h2>

                <p style="color:red;">

                    ❌ Imeshindikana kupakia booking zako.

                </p>

            </div>

        `;
    }
}


/* =========================================================
   9.5 GET USER REFERRAL DATA
========================================================= */

async function getUserReferralDataSehemu9(
    userId
) {

    try {

        const userDoc =
            await db.collection(
                "users"
            )
            .doc(userId)
            .get();


        if (
            !userDoc.exists
        ) {

            return null;

        }


        return {

            id: userDoc.id,

            ...userDoc.data()

        };


    } catch (error) {

        console.error(
            "Referral data error:",
            error
        );

        return null;
    }
}


/* =========================================================
   9.6 GET TOTAL USER COMMISSION
========================================================= */

async function getUserCommissionSehemu9(
    userId
) {

    try {

        const snapshot =
            await db.collection(
                "commissions"
            )
            .where(
                "userId",
                "==",
                userId
            )
            .get();


        let total =
            0;


        snapshot.forEach(doc => {

            const data =
                doc.data();


            total +=
                Number(
                    data.amount || 0
                );

        });


        return total;


    } catch (error) {

        console.error(
            "Commission error:",
            error
        );

        return 0;
    }
}


/* =========================================================
   9.7 OPEN ACCOUNT
========================================================= */

async function funguaAccountSehemu9() {

    const user =
        auth.currentUser;


    if (!user) {

        alert(
            "🔐 Tafadhali ingia kwanza."
        );

        return;
    }


    showMainSectionSehemu9(
        "account"
    );


    const section =
        document.getElementById(
            "taarifaSection"
        );


    if (!section) return;


    section.innerHTML = `

        <div class="booking-card">

            <h2>
                👤 Account Yangu
            </h2>

            <p>
                ⏳ Inapakia taarifa zako...
            </p>

        </div>

    `;


    try {

        const userData =
            await getUserReferralDataSehemu9(
                user.uid
            );


        const totalCommission =
            await getUserCommissionSehemu9(
                user.uid
            );


        const referralCode =
            userData?.referralCode ||
            "Bado";


        const referralLink =
            referralCode !== "Bado"

                ?

                `${window.location.origin}${window.location.pathname}?ref=${encodeURIComponent(referralCode)}`

                :

                "";


        section.innerHTML = `

            <div class="booking-card">

                <h2>
                    👤 Account Yangu
                </h2>


                <div style="
                    border:1px solid #ddd;
                    border-radius:12px;
                    padding:15px;
                    margin:15px 0;
                ">

                    <p>

                        👤 Jina:

                        <strong>
                            ${escapeHtml(
                                userData?.name ||
                                "Bado hujaweka"
                            )}
                        </strong>

                    </p>


                    <p>

                        📧 Email:

                        <strong>
                            ${escapeHtml(
                                user.email || "-"
                            )}
                        </strong>

                    </p>


                    <p>

                        📱 Simu:

                        <strong>
                            ${escapeHtml(
                                userData?.phone ||
                                "Bado hujaweka"
                            )}
                        </strong>

                    </p>

                </div>


                <div style="
                    border:1px solid #ddd;
                    border-radius:12px;
                    padding:15px;
                    margin:15px 0;
                ">

                    <h3>
                        🎁 Referral Yangu
                    </h3>


                    <p>

                        Referral Code:

                        <strong>
                            ${escapeHtml(
                                referralCode
                            )}
                        </strong>

                    </p>


                    <input
                        type="text"
                        id="myReferralLinkSehemu9"
                        value="${escapeHtml(
                            referralLink
                        )}"
                        readonly
                    >


                    <button
                        class="thibitishaBtn"
                        onclick="copyReferralLinkSehemu9()"
                    >

                        📋 Copy Referral Link

                    </button>

                </div>


                <div style="
                    border:1px solid #ddd;
                    border-radius:12px;
                    padding:15px;
                    margin:15px 0;
                ">

                    <h3>
                        💰 Commission
                    </h3>


                    <p
                        style="
                            font-size:22px;
                            font-weight:bold;
                        "
                    >

                        TSh ${
                            typeof formatMoney ===
                            "function"

                                ?

                                formatMoney(
                                    totalCommission
                                )

                                :

                                Number(
                                    totalCommission
                                )
                                .toLocaleString()
                        }

                    </p>


                    <button
                        class="endeleaBtn"
                        onclick="funguaWithdrawalSehemu9()"
                    >

                        💸 Withdrawal

                    </button>

                </div>


                <button
                    class="endeleaBtn"
                    onclick="logoutRoomRentSehemu9()"
                >

                    🚪 Logout

                </button>

            </div>

        `;


    } catch (error) {

        console.error(
            "Account error:",
            error
        );


        section.innerHTML = `

            <div class="booking-card">

                <h2>
                    👤 Account Yangu
                </h2>

                <p style="color:red;">

                    ❌ Imeshindikana kupakia account.

                </p>

            </div>

        `;
    }
}


/* =========================================================
   9.8 COPY REFERRAL LINK
========================================================= */

async function copyReferralLinkSehemu9() {

    const input =
        document.getElementById(
            "myReferralLinkSehemu9"
        );


    if (!input) return;


    if (!input.value) {

        alert(
            "❌ Referral Link bado haijapatikana."
        );

        return;

    }


    try {

        await navigator.clipboard.writeText(
            input.value
        );


        alert(
            "✅ Referral Link imekopiwa."
        );


    } catch (error) {

        input.select();

        input.setSelectionRange(
            0,
            99999
        );


        document.execCommand(
            "copy"
        );


        alert(
            "✅ Referral Link imekopiwa."
        );
    }
}


/* =========================================================
   9.9 GET USER NOTIFICATIONS
========================================================= */

async function getNotificationsSehemu9(
    userId
) {

    try {

        const snapshot =
            await db.collection(
                "notifications"
            )
            .where(
                "userId",
                "==",
                userId
            )
            .get();


        const notifications =
            [];


        snapshot.forEach(doc => {

            notifications.push({

                id: doc.id,

                ...doc.data()

            });

        });


        notifications.sort(
            (a, b) => {

                const dateA =
                    a.createdAt &&
                    typeof a.createdAt.toDate ===
                    "function"

                        ?

                        a.createdAt
                            .toDate()
                            .getTime()

                        :

                        0;


                const dateB =
                    b.createdAt &&
                    typeof b.createdAt.toDate ===
                    "function"

                        ?

                        b.createdAt
                            .toDate()
                            .getTime()

                        :

                        0;


                return dateB - dateA;

            }
        );


        return notifications;


    } catch (error) {

        console.error(
            "Notifications error:",
            error
        );

        return [];
    }
}


/* =========================================================
   9.10 OPEN NOTIFICATIONS
========================================================= */

async function funguaTaarifaSehemu9() {

    const user =
        auth.currentUser;


    if (!user) {

        alert(
            "🔐 Tafadhali ingia kwanza."
        );

        return;
    }


    showMainSectionSehemu9(
        "notifications"
    );


    const section =
        document.getElementById(
            "taarifaSection"
        );


    if (!section) return;


    section.innerHTML = `

        <div class="booking-card">

            <h2>
                🔔 Taarifa
            </h2>

            <p>
                ⏳ Inapakia taarifa...
            </p>

        </div>

    `;


    const notifications =
        await getNotificationsSehemu9(
            user.uid
        );


    if (
        notifications.length === 0
    ) {

        section.innerHTML = `

            <div class="booking-card">

                <h2>
                    🔔 Taarifa
                </h2>

                <p>
                    Bado hakuna taarifa mpya.
                </p>

            </div>

        `;

        return;
    }


    let html = `

        <div class="booking-card">

            <h2>
                🔔 Taarifa
            </h2>

    `;


    notifications.forEach(
        notification => {

            html += `

                <div style="
                    border-bottom:1px solid #ddd;
                    padding:15px 0;
                ">

                    <h3>
                        ${escapeHtml(
                            notification.title ||
                            "Taarifa"
                        )}
                    </h3>


                    <p>
                        ${escapeHtml(
                            notification.message ||
                            ""
                        )}
                    </p>


                    <small>

                        🕒
                        ${formatRoomRentDateSehemu9(
                            notification.createdAt
                        )}

                    </small>

                </div>

            `;

        }
    );


    html += `

        </div>

    `;


    section.innerHTML =
        html;

}


/* =========================================================
   9.11 LOGOUT
========================================================= */

async function logoutRoomRentSehemu9() {

    const confirmed =
        confirm(
            "Una uhakika unataka kutoka?"
        );


    if (!confirmed) {
        return;
    }


    try {

        await auth.signOut();


        alert(
            "✅ Umetoka kwenye account yako."
        );


        const section =
            document.getElementById(
                "taarifaSection"
            );


        if (section) {

            section.style.display =
                "none";

        }


        const loginSection =
            document.getElementById(
                "emailLoginSection"
            );


        if (loginSection) {

            loginSection.style.display =
                "block";

            loginSection.scrollIntoView({

                behavior: "smooth"

            });

        }


    } catch (error) {

        console.error(
            "Logout error:",
            error
        );


        alert(
            "❌ Imeshindikana kutoka."
        );
    }
}


/* =========================================================
   9.12 WITHDRAWAL CONNECTOR
========================================================= */

function funguaWithdrawalSehemu9() {

    if (
        typeof funguaWithdrawal ===
        "function"
    ) {

        funguaWithdrawal();

        return;
    }


    if (
        typeof funguaWithdrawalSehemu5 ===
        "function"
    ) {

        funguaWithdrawalSehemu5();

        return;
    }


    alert(
        "⚠️ Mfumo wa Withdrawal bado haujaunganishwa."
    );
}


/* =========================================================
   9.13 CONNECT TOP BUTTONS
========================================================= */

function connectTopButtonsSehemu9() {

    const bookingBtn =
        document.getElementById(
            "bookingZangu"
        );


    const accountBtn =
        document.getElementById(
            "accountBtn"
        );


    const taarifaBtn =
        document.getElementById(
            "taarifaBtn"
        );


    const withdrawalBtn =
        document.getElementById(
            "withdrawalBtn"
        );


    if (bookingBtn) {

        const newBookingBtn =
            bookingBtn.cloneNode(
                true
            );


        bookingBtn.parentNode.replaceChild(
            newBookingBtn,
            bookingBtn
        );


        newBookingBtn.addEventListener(
            "click",
            async function() {

                await funguaBookingZanguSehemu9();

            }
        );

    }


    if (accountBtn) {

        const newAccountBtn =
            accountBtn.cloneNode(
                true
            );


        accountBtn.parentNode.replaceChild(
            newAccountBtn,
            accountBtn
        );


        newAccountBtn.addEventListener(
            "click",
            async function() {

                await funguaAccountSehemu9();

            }
        );

    }


    if (taarifaBtn) {

        const newTaarifaBtn =
            taarifaBtn.cloneNode(
                true
            );


        taarifaBtn.parentNode.replaceChild(
            newTaarifaBtn,
            taarifaBtn
        );


        newTaarifaBtn.addEventListener(
            "click",
            async function() {

                await funguaTaarifaSehemu9();

            }
        );

    }


    if (withdrawalBtn) {

        const newWithdrawalBtn =
            withdrawalBtn.cloneNode(
                true
            );


        withdrawalBtn.parentNode.replaceChild(
            newWithdrawalBtn,
            withdrawalBtn
        );


        newWithdrawalBtn.addEventListener(
            "click",
            function() {

                funguaWithdrawalSehemu9();

            }
        );

    }

}


/* =========================================================
   9.14 INITIALIZE SEHEMU 9
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        try {

            connectTopButtonsSehemu9();


            console.log(
                "✅ Sehemu ya 9 tayari."
            );


        } catch (error) {

            console.error(
                "Sehemu 9 initialization error:",
                error
            );

        }

    }
);


/* =========================================================
   9.15 WINDOW EXPORTS
========================================================= */

window.funguaBookingZanguSehemu9 =
    funguaBookingZanguSehemu9;


window.funguaAccountSehemu9 =
    funguaAccountSehemu9;


window.funguaTaarifaSehemu9 =
    funguaTaarifaSehemu9;


window.copyReferralLinkSehemu9 =
    copyReferralLinkSehemu9;


window.logoutRoomRentSehemu9 =
    logoutRoomRentSehemu9;


/* =========================================================
   SEHEMU YA 9 IMEISHIA HAPA
========================================================= */
/* =========================================================
   ROOMRENT - SEHEMU YA 10
   REFERRAL COMMISSION AUTOMATION
   ========================================================= */


/* =========================================================
   10.1 COMMISSION SETTINGS
========================================================= */

const ROOMRENT_COMMISSION_RATES = {

    A: 0.05,

    B: 0.02,

    C: 0.01

};


/* =========================================================
   10.2 GET USER DATA
========================================================= */

async function getRoomRentUserSehemu10(userId) {

    if (!userId) {
        return null;
    }


    try {

        const snapshot =
            await db.collection(
                "users"
            )
            .doc(userId)
            .get();


        if (!snapshot.exists) {
            return null;
        }


        return {

            id: snapshot.id,

            ...snapshot.data()

        };


    } catch (error) {

        console.error(
            "Get user error:",
            error
        );

        return null;
    }
}


/* =========================================================
   10.3 GET REFERRAL CHAIN
========================================================= */

async function getReferralChainSehemu10(
    userId
) {

    const chain = {

        A: null,

        B: null,

        C: null

    };


    try {

        /*
         * USER MWENYEWE
         */

        const user =
            await getRoomRentUserSehemu10(
                userId
            );


        if (!user) {
            return chain;
        }


        /*
         * LEVEL A
         */

        if (
            user.referredBy
        ) {

            const levelA =
                await getRoomRentUserSehemu10(
                    user.referredBy
                );


            if (levelA) {

                chain.A =
                    levelA;


                /*
                 * LEVEL B
                 */

                if (
                    levelA.referredBy
                ) {

                    const levelB =
                        await getRoomRentUserSehemu10(
                            levelA.referredBy
                        );


                    if (levelB) {

                        chain.B =
                            levelB;


                        /*
                         * LEVEL C
                         */

                        if (
                            levelB.referredBy
                        ) {

                            const levelC =
                                await getRoomRentUserSehemu10(
                                    levelB.referredBy
                                );


                            if (levelC) {

                                chain.C =
                                    levelC;

                            }

                        }

                    }

                }

            }

        }


        return chain;


    } catch (error) {

        console.error(
            "Referral chain error:",
            error
        );

        return chain;
    }
}


/* =========================================================
   10.4 CREATE COMMISSION
========================================================= */

async function createCommissionSehemu10(
    data
) {

    try {

        const commissionRef =
            db.collection(
                "commissions"
            )
            .doc();


        await commissionRef.set({

            commissionId:
                commissionRef.id,

            bookingId:
                data.bookingId || "",

            bookingNumber:
                data.bookingNumber || "",

            userId:
                data.userId || "",

            fromUserId:
                data.fromUserId || "",

            level:
                data.level || "",

            rate:
                Number(
                    data.rate || 0
                ),

            amount:
                Number(
                    data.amount || 0
                ),

            roomPrice:
                Number(
                    data.roomPrice || 0
                ),

            roomNumber:
                data.roomNumber || "",

            status:
                "Available",

            withdrawalStatus:
                "Not Requested",

            createdAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp()

        });


        return commissionRef.id;


    } catch (error) {

        console.error(
            "Create commission error:",
            error
        );

        throw error;
    }
}


/* =========================================================
   10.5 UPDATE USER COMMISSION BALANCE
========================================================= */

async function updateCommissionBalanceSehemu10(
    userId,
    amount
) {

    if (
        !userId ||
        !amount
    ) {

        return;
    }


    try {

        const userRef =
            db.collection(
                "users"
            )
            .doc(userId);


        await db.runTransaction(
            async transaction => {

                const userSnap =
                    await transaction.get(
                        userRef
                    );


                if (
                    !userSnap.exists
                ) {

                    return;
                }


                const userData =
                    userSnap.data();


                const currentBalance =
                    Number(
                        userData.commissionBalance || 0
                    );


                const totalCommission =
                    Number(
                        userData.totalCommission || 0
                    );


                transaction.update(
                    userRef,
                    {

                        commissionBalance:
                            currentBalance +
                            Number(amount),

                        totalCommission:
                            totalCommission +
                            Number(amount),

                        updatedAt:
                            firebase.firestore
                                .FieldValue
                                .serverTimestamp()

                    }
                );

            }
        );


    } catch (error) {

        console.error(
            "Update balance error:",
            error
        );

        throw error;
    }
}


/* =========================================================
   10.6 CHECK IF COMMISSION ALREADY PROCESSED
========================================================= */

async function isCommissionProcessedSehemu10(
    bookingId
) {

    try {

        const booking =
            await db.collection(
                "bookings"
            )
            .doc(bookingId)
            .get();


        if (!booking.exists) {
            return true;
        }


        const data =
            booking.data();


        return (
            data.commissionProcessed ===
            true
        );


    } catch (error) {

        console.error(
            "Commission check error:",
            error
        );

        return true;
    }
}


/* =========================================================
   10.7 PROCESS REFERRAL COMMISSION
========================================================= */

async function chakataReferralCommissionSehemu10(
    bookingId
) {

    if (!bookingId) {

        console.error(
            "Booking ID haipo."
        );

        return false;
    }


    try {

        /*
         * CHECK BOOKING
         */

        const bookingRef =
            db.collection(
                "bookings"
            )
            .doc(bookingId);


        const bookingSnap =
            await bookingRef.get();


        if (!bookingSnap.exists) {

            throw new Error(
                "Booking haijapatikana."
            );

        }


        const booking =
            bookingSnap.data();


        /*
         * CHECK PAYMENT
         */

        if (
            booking.paymentStatus !==
            "Confirmed"
        ) {

            console.log(
                "Payment bado haijathibitishwa."
            );

            return false;
        }


        /*
         * CHECK DUPLICATE
         */

        if (
            booking.commissionProcessed ===
            true
        ) {

            console.log(
                "Commission tayari imechakatwa."
            );

            return true;
        }


        /*
         * LOCK BOOKING
         *
         * Tunazuia processing
         * mara mbili.
         */

        await bookingRef.update({

            commissionProcessed:
                "processing",

            commissionProcessingAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp()

        });


        /*
         * GET REFERRAL CHAIN
         */

        const chain =
            await getReferralChainSehemu10(
                booking.userId
            );


        /*
         * COMMISSION BASE
         *
         * Commission inahesabiwa
         * kwa room price.
         */

        const commissionBase =
            Number(
                booking.roomPrice || 0
            );


        const levels = [

            {
                level: "A",

                user: chain.A
            },

            {
                level: "B",

                user: chain.B
            },

            {
                level: "C",

                user: chain.C
            }

        ];


        let processedCount =
            0;


        /*
         * PROCESS LEVELS
         */

        for (
            const item of levels
        ) {

            if (!item.user) {
                continue;
            }


            const rate =
                ROOMRENT_COMMISSION_RATES[
                    item.level
                ] || 0;


            const amount =
                commissionBase *
                rate;


            if (
                amount <= 0
            ) {

                continue;
            }


            /*
             * CREATE COMMISSION
             */

            await createCommissionSehemu10({

                bookingId:
                    bookingId,

                bookingNumber:
                    booking.bookingNumber,

                userId:
                    item.user.id,

                fromUserId:
                    booking.userId,

                level:
                    item.level,

                rate:
                    rate,

                amount:
                    amount,

                roomPrice:
                    commissionBase,

                roomNumber:
                    booking.roomNumber

            });


            /*
             * UPDATE USER BALANCE
             */

            await updateCommissionBalanceSehemu10(

                item.user.id,

                amount

            );


            /*
             * NOTIFICATION
             */

            if (
                typeof createNotification ===
                "function"
            ) {

                await createNotification(

                    item.user.id,

                    "Commission Received",

                    `Umepata commission ya TSh ${formatMoney(amount)} kupitia Level ${item.level}.`

                );

            }


            processedCount++;

        }


        /*
         * FINISH BOOKING
         */

        await bookingRef.update({

            commissionProcessed:
                true,

            commissionProcessedAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp(),

            commissionCount:
                processedCount,

            updatedAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp()

        });


        console.log(
            "✅ Commission imechakatwa:",
            processedCount
        );


        return true;


    } catch (error) {

        console.error(
            "Process commission error:",
            error
        );


        /*
         * UNLOCK IF ERROR
         */

        try {

            await db.collection(
                "bookings"
            )
            .doc(bookingId)
            .update({

                commissionProcessed:
                    false

            });

        } catch (unlockError) {

            console.error(
                "Unlock error:",
                unlockError
            );

        }


        return false;
    }
}


/* =========================================================
   10.8 PROCESS COMMISSION AFTER ADMIN PAYMENT
========================================================= */

async function confirmPaymentAndCommissionSehemu10(
    bookingId
) {

    try {

        const bookingRef =
            db.collection(
                "bookings"
            )
            .doc(bookingId);


        /*
         * CONFIRM PAYMENT
         */

        await bookingRef.update({

            paymentStatus:
                "Confirmed",

            status:
                "Active",

            paymentConfirmedAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp(),

            updatedAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp()

        });


        /*
         * PROCESS COMMISSION
         */

        await chakataReferralCommissionSehemu10(
            bookingId
        );


        /*
         * GET BOOKING
         */

        const bookingSnap =
            await bookingRef.get();


        if (
            bookingSnap.exists
        ) {

            const booking =
                bookingSnap.data();


            if (
                typeof createNotification ===
                "function"
            ) {

                await createNotification(

                    booking.userId,

                    "Payment Confirmed",

                    `Malipo ya booking ${booking.bookingNumber} yamethibitishwa. Booking yako sasa imeanza.`

                );

            }

        }


        return true;


    } catch (error) {

        console.error(
            "Confirm payment error:",
            error
        );

        return false;
    }
}


/* =========================================================
   10.9 REJECT PAYMENT
========================================================= */

async function rejectPaymentSehemu10(
    bookingId,
    reason = ""
) {

    try {

        const bookingRef =
            db.collection(
                "bookings"
            )
            .doc(bookingId);


        await bookingRef.update({

            paymentStatus:
                "Rejected",

            status:
                "Payment Rejected",

            rejectionReason:
                reason,

            updatedAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp()

        });


        const bookingSnap =
            await bookingRef.get();


        if (
            bookingSnap.exists
        ) {

            const booking =
                bookingSnap.data();


            if (
                typeof createNotification ===
                "function"
            ) {

                await createNotification(

                    booking.userId,

                    "Payment Rejected",

                    reason

                        ?

                        `Malipo ya booking ${booking.bookingNumber} yamekataliwa: ${reason}`

                        :

                        `Malipo ya booking ${booking.bookingNumber} yamekataliwa. Tafadhali wasiliana na RoomRent.`

                );

            }

        }


        return true;


    } catch (error) {

        console.error(
            "Reject payment error:",
            error
        );

        return false;
    }
}


/* =========================================================
   10.10 GET COMMISSION BALANCE
========================================================= */

async function getCommissionBalanceSehemu10(
    userId
) {

    try {

        const user =
            await getRoomRentUserSehemu10(
                userId
            );


        if (!user) {
            return 0;
        }


        return Number(
            user.commissionBalance || 0
        );


    } catch (error) {

        return 0;
    }
}


/* =========================================================
   10.11 GET COMMISSION HISTORY
========================================================= */

async function getCommissionHistorySehemu10(
    userId
) {

    try {

        const snapshot =
            await db.collection(
                "commissions"
            )
            .where(
                "userId",
                "==",
                userId
            )
            .get();


        const commissions =
            [];


        snapshot.forEach(doc => {

            commissions.push({

                id:
                    doc.id,

                ...doc.data()

            });

        });


        return commissions;


    } catch (error) {

        console.error(
            "Commission history error:",
            error
        );

        return [];
    }
}


/* =========================================================
   10.12 ADMIN COMMISSION SUMMARY
========================================================= */

async function getCommissionSummarySehemu10() {

    try {

        const snapshot =
            await db.collection(
                "commissions"
            )
            .get();


        let total =
            0;


        let levelA =
            0;


        let levelB =
            0;


        let levelC =
            0;


        snapshot.forEach(doc => {

            const data =
                doc.data();


            const amount =
                Number(
                    data.amount || 0
                );


            total += amount;


            if (
                data.level === "A"
            ) {

                levelA += amount;

            }


            if (
                data.level === "B"
            ) {

                levelB += amount;

            }


            if (
                data.level === "C"
            ) {

                levelC += amount;

            }

        });


        return {

            total:
                total,

            A:
                levelA,

            B:
                levelB,

            C:
                levelC

        };


    } catch (error) {

        console.error(
            "Commission summary error:",
            error
        );


        return {

            total: 0,

            A: 0,

            B: 0,

            C: 0

        };
    }
}


/* =========================================================
   10.13 WINDOW EXPORTS
========================================================= */

window.chakataReferralCommissionSehemu10 =
    chakataReferralCommissionSehemu10;


window.confirmPaymentAndCommissionSehemu10 =
    confirmPaymentAndCommissionSehemu10;


window.rejectPaymentSehemu10 =
    rejectPaymentSehemu10;


window.getCommissionBalanceSehemu10 =
    getCommissionBalanceSehemu10;


window.getCommissionHistorySehemu10 =
    getCommissionHistorySehemu10;


/* =========================================================
   SEHEMU YA 10 IMEISHIA HAPA
========================================================= */
/* =========================================================
   ROOMRENT - SEHEMU YA 11
   ACTIVE BOOKING TIMER + DAILY PROFIT + COMPLETION
   ========================================================= */


/* =========================================================
   11.1 DAY IN MILLISECONDS
========================================================= */

const ROOMRENT_DAY_MS =
    24 * 60 * 60 * 1000;


/* =========================================================
   11.2 GET BOOKING START DATE
========================================================= */

function getBookingStartDateSehemu11(
    booking
) {

    if (!booking) {
        return null;
    }


    /*
     * PAYMENT CONFIRMED DATE
     */

    if (
        booking.paymentConfirmedAt &&
        typeof booking
            .paymentConfirmedAt
            .toDate === "function"
    ) {

        return booking
            .paymentConfirmedAt
            .toDate();

    }


    /*
     * ACTIVE DATE
     */

    if (
        booking.activeAt &&
        typeof booking
            .activeAt
            .toDate === "function"
    ) {

        return booking
            .activeAt
            .toDate();

    }


    /*
     * CREATED DATE FALLBACK
     */

    if (
        booking.createdAt &&
        typeof booking
            .createdAt
            .toDate === "function"
    ) {

        return booking
            .createdAt
            .toDate();

    }


    return null;
}


/* =========================================================
   11.3 CALCULATE BOOKING PROGRESS
========================================================= */

function calculateBookingProgressSehemu11(
    booking
) {

    const totalDays =
        Number(
            booking.days || 0
        );


    const dailyProfit =
        Number(
            booking.dailyProfit || 0
        );


    const startDate =
        getBookingStartDateSehemu11(
            booking
        );


    /*
     * DEFAULT RESULT
     */

    const result = {

        totalDays:
            totalDays,

        dailyProfit:
            dailyProfit,

        daysPassed:
            0,

        daysRemaining:
            totalDays,

        earnedProfit:
            0,

        totalProfit:
            dailyProfit * totalDays,

        progressPercent:
            0,

        completed:
            false,

        startDate:
            startDate,

        endDate:
            null

    };


    if (
        !startDate ||
        totalDays <= 0
    ) {

        return result;

    }


    const now =
        new Date();


    /*
     * TIME DIFFERENCE
     */

    const difference =
        now.getTime() -
        startDate.getTime();


    /*
     * CALCULATE FULL DAYS
     */

    let daysPassed =
        Math.floor(
            difference /
            ROOMRENT_DAY_MS
        );


    /*
     * NEGATIVE PROTECTION
     */

    if (
        daysPassed < 0
    ) {

        daysPassed = 0;

    }


    /*
     * MAXIMUM DAYS
     */

    if (
        daysPassed > totalDays
    ) {

        daysPassed =
            totalDays;

    }


    /*
     * EARNED PROFIT
     */

    const earnedProfit =
        daysPassed *
        dailyProfit;


    /*
     * REMAINING DAYS
     */

    const daysRemaining =
        Math.max(
            totalDays -
            daysPassed,
            0
        );


    /*
     * END DATE
     */

    const endDate =
        new Date(
            startDate.getTime() +
            (
                totalDays *
                ROOMRENT_DAY_MS
            )
        );


    /*
     * PROGRESS
     */

    const progressPercent =
        totalDays > 0

            ?

            Math.min(
                100,

                Math.round(
                    (
                        daysPassed /
                        totalDays
                    ) *
                    100
                )
            )

            :

            0;


    /*
     * UPDATE RESULT
     */

    result.daysPassed =
        daysPassed;


    result.daysRemaining =
        daysRemaining;


    result.earnedProfit =
        earnedProfit;


    result.totalProfit =
        dailyProfit *
        totalDays;


    result.progressPercent =
        progressPercent;


    result.completed =
        daysPassed >=
        totalDays;


    result.endDate =
        endDate;


    return result;
}


/* =========================================================
   11.4 FORMAT DATE
========================================================= */

function formatBookingDateSehemu11(
    date
) {

    if (!date) {
        return "-";
    }


    try {

        return date.toLocaleDateString(
            "sw-TZ",
            {

                year:
                    "numeric",

                month:
                    "long",

                day:
                    "numeric"

            }
        );


    } catch (error) {

        return "-";

    }
}


/* =========================================================
   11.5 GET ACTIVE BOOKINGS
========================================================= */

async function getActiveBookingsSehemu11(
    userId = null
) {

    try {

        let query =
            db.collection(
                "bookings"
            )
            .where(
                "status",
                "==",
                "Active"
            );


        /*
         * USER BOOKINGS ONLY
         */

        if (
            userId
        ) {

            query =
                query.where(
                    "userId",
                    "==",
                    userId
                );

        }


        const snapshot =
            await query.get();


        const bookings =
            [];


        snapshot.forEach(doc => {

            bookings.push({

                id:
                    doc.id,

                ...doc.data()

            });

        });


        return bookings;


    } catch (error) {

        console.error(
            "Get active bookings error:",
            error
        );

        return [];
    }
}


/* =========================================================
   11.6 UPDATE BOOKING PROGRESS
========================================================= */

async function updateBookingProgressSehemu11(
    bookingId,
    booking
) {

    try {

        if (
            !bookingId ||
            !booking
        ) {

            return null;

        }


        const progress =
            calculateBookingProgressSehemu11(
                booking
            );


        const bookingRef =
            db.collection(
                "bookings"
            )
            .doc(bookingId);


        /*
         * UPDATE FIRESTORE
         */

        const updateData = {

            daysPassed:
                progress.daysPassed,

            daysRemaining:
                progress.daysRemaining,

            earnedProfit:
                progress.earnedProfit,

            calculatedAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp()

        };


        /*
         * COMPLETION
         */

        if (
            progress.completed
        ) {

            updateData.status =
                "Completed";


            updateData.completedAt =
                firebase.firestore
                    .FieldValue
                    .serverTimestamp();

        }


        await bookingRef.update(
            updateData
        );


        /*
         * NOTIFICATION
         */

        if (
            progress.completed &&
            booking.userId &&
            !booking.completionNotified
        ) {

            if (
                typeof createNotification ===
                "function"
            ) {

                await createNotification(

                    booking.userId,

                    "Booking Completed",

                    `Booking yako ${booking.bookingNumber || ""} imekamilika baada ya siku ${progress.totalDays}.`

                );

            }


            await bookingRef.update({

                completionNotified:
                    true

            });

        }


        return progress;


    } catch (error) {

        console.error(
            "Update progress error:",
            error
        );

        return null;
    }
}


/* =========================================================
   11.7 REFRESH ONE BOOKING
========================================================= */

async function refreshBookingSehemu11(
    bookingId
) {

    try {

        const bookingRef =
            db.collection(
                "bookings"
            )
            .doc(bookingId);


        const snapshot =
            await bookingRef.get();


        if (
            !snapshot.exists
        ) {

            return null;

        }


        const booking =
            {

                id:
                    snapshot.id,

                ...snapshot.data()

            };


        /*
         * ACTIVE ONLY
         */

        if (
            booking.status !==
            "Active"
        ) {

            return calculateBookingProgressSehemu11(
                booking
            );

        }


        return await updateBookingProgressSehemu11(

            bookingId,

            booking

        );


    } catch (error) {

        console.error(
            "Refresh booking error:",
            error
        );

        return null;
    }
}


/* =========================================================
   11.8 REFRESH USER ACTIVE BOOKINGS
========================================================= */

async function refreshUserBookingsSehemu11(
    userId
) {

    if (!userId) {
        return [];
    }


    const bookings =
        await getActiveBookingsSehemu11(
            userId
        );


    const results =
        [];


    for (
        const booking of bookings
    ) {

        const progress =
            await updateBookingProgressSehemu11(

                booking.id,

                booking

            );


        results.push({

            bookingId:
                booking.id,

            progress:
                progress

        });

    }


    return results;
}


/* =========================================================
   11.9 REFRESH ALL ACTIVE BOOKINGS
   ADMIN USE
========================================================= */

async function refreshAllActiveBookingsSehemu11() {

    const bookings =
        await getActiveBookingsSehemu11();


    let completed =
        0;


    let updated =
        0;


    for (
        const booking of bookings
    ) {

        const progress =
            await updateBookingProgressSehemu11(

                booking.id,

                booking

            );


        if (progress) {

            updated++;

        }


        if (
            progress &&
            progress.completed
        ) {

            completed++;

        }

    }


    return {

        updated:
            updated,

        completed:
            completed

    };
}


/* =========================================================
   11.10 CREATE ACTIVE BOOKING CARD
========================================================= */

function createActiveBookingCardSehemu11(
    booking
) {

    const progress =
        calculateBookingProgressSehemu11(
            booking
        );


    const roomNumber =
        escapeHtml(
            booking.roomNumber || "-"
        );


    const bookingNumber =
        escapeHtml(
            booking.bookingNumber || "-"
        );


    const dailyProfit =
        Number(
            progress.dailyProfit || 0
        );


    const earnedProfit =
        Number(
            progress.earnedProfit || 0
        );


    const totalProfit =
        Number(
            progress.totalProfit || 0
        );


    const totalReturn =
        Number(
            booking.roomPrice || 0
        ) +
        totalProfit;


    return `

        <div
            class="booking-card"
            style="
                margin-bottom:20px;
            "
        >

            <h2>
                🏠 Chumba ${roomNumber}
            </h2>


            <p>

                📋 Booking:

                <strong>
                    ${bookingNumber}
                </strong>

            </p>


            <p>

                🟢 Status:

                <strong>
                    ${progress.completed

                        ?

                        "Completed"

                        :

                        "Active"
                    }
                </strong>

            </p>


            <hr>


            <p>

                📅 Siku Zilizopita:

                <strong>
                    ${progress.daysPassed}
                    /
                    ${progress.totalDays}
                </strong>

            </p>


            <p>

                ⏳ Siku Zilizobaki:

                <strong>
                    ${progress.daysRemaining}
                </strong>

            </p>


            <p>

                📈 Faida kwa siku:

                <strong>

                    TSh ${
                        typeof formatMoney ===
                        "function"

                            ?

                            formatMoney(
                                dailyProfit
                            )

                            :

                            dailyProfit
                            .toLocaleString()
                    }

                </strong>

            </p>


            <p>

                💰 Faida Iliyopatikana:

                <strong>

                    TSh ${
                        typeof formatMoney ===
                        "function"

                            ?

                            formatMoney(
                                earnedProfit
                            )

                            :

                            earnedProfit
                            .toLocaleString()
                    }

                </strong>

            </p>


            <p>

                💎 Jumla ya Faida:

                <strong>

                    TSh ${
                        typeof formatMoney ===
                        "function"

                            ?

                            formatMoney(
                                totalProfit
                            )

                            :

                            totalProfit
                            .toLocaleString()
                    }

                </strong>

            </p>


            <p>

                💵 Jumla Utakayopokea:

                <strong>

                    TSh ${
                        typeof formatMoney ===
                        "function"

                            ?

                            formatMoney(
                                totalReturn
                            )

                            :

                            totalReturn
                            .toLocaleString()
                    }

                </strong>

            </p>


            <hr>


            <p>

                🗓️ Mwanzo:

                <strong>
                    ${formatBookingDateSehemu11(
                        progress.startDate
                    )}
                </strong>

            </p>


            <p>

                🏁 Mwisho:

                <strong>
                    ${formatBookingDateSehemu11(
                        progress.endDate
                    )}
                </strong>

            </p>


            <!-- PROGRESS BAR -->

            <div
                style="
                    width:100%;
                    background:#eee;
                    border-radius:10px;
                    overflow:hidden;
                    height:20px;
                    margin-top:15px;
                "
            >

                <div
                    style="
                        width:${progress.progressPercent}%;
                        height:100%;
                        background:#22c55e;
                        transition:width 0.5s;
                    "
                >

                </div>

            </div>


            <p
                style="
                    text-align:center;
                    font-weight:bold;
                "
            >

                ${progress.progressPercent}%

            </p>

        </div>

    `;
}


/* =========================================================
   11.11 SHOW ACTIVE BOOKINGS
========================================================= */

async function onyeshaActiveBookingsSehemu11() {

    const user =
        auth.currentUser;


    if (!user) {

        alert(
            "🔐 Tafadhali ingia kwanza."
        );

        return;

    }


    const section =
        document.getElementById(
            "taarifaSection"
        );


    if (!section) {
        return;
    }


    /*
     * HIDE OTHER SECTIONS
     */

    const vyumba =
        document.getElementById(
            "vyumba"
        );


    const fomuKodi =
        document.getElementById(
            "fomuKodi"
        );


    if (vyumba) {

        vyumba.style.display =
            "none";

    }


    if (fomuKodi) {

        fomuKodi.style.display =
            "none";

    }


    section.style.display =
        "block";


    section.innerHTML = `

        <div class="booking-card">

            <h2>
                📈 Booking Zinazoendelea
            </h2>

            <p>
                ⏳ Inapakia...
            </p>

        </div>

    `;


    try {

        /*
         * REFRESH FIRST
         */

        await refreshUserBookingsSehemu11(
            user.uid
        );


        /*
         * GET ACTIVE
         */

        const activeBookings =
            await getActiveBookingsSehemu11(
                user.uid
            );


        /*
         * GET COMPLETED
         */

        const completedSnapshot =
            await db.collection(
                "bookings"
            )
            .where(
                "userId",
                "==",
                user.uid
            )
            .where(
                "status",
                "==",
                "Completed"
            )
            .get();


        const completedBookings =
            [];


        completedSnapshot.forEach(doc => {

            completedBookings.push({

                id:
                    doc.id,

                ...doc.data()

            });

        });


        /*
         * NO BOOKINGS
         */

        if (

            activeBookings.length === 0 &&
            completedBookings.length === 0

        ) {

            section.innerHTML = `

                <div class="booking-card">

                    <h2>
                        📈 Booking Zinazoendelea
                    </h2>

                    <p>
                        Bado huna booking
                        iliyoanza.
                    </p>

                </div>

            `;

            return;

        }


        let html = `

            <div class="booking-card">

                <h2>
                    📈 Booking Zinazoendelea
                </h2>

            </div>

        `;


        /*
         * ACTIVE BOOKINGS
         */

        activeBookings.forEach(
            booking => {

                html +=
                    createActiveBookingCardSehemu11(
                        booking
                    );

            }
        );


        /*
         * COMPLETED BOOKINGS
         */

        completedBookings.forEach(
            booking => {

                html +=
                    createActiveBookingCardSehemu11(
                        booking
                    );

            }
        );


        section.innerHTML =
            html;


    } catch (error) {

        console.error(
            "Show active bookings error:",
            error
        );


        section.innerHTML = `

            <div class="booking-card">

                <h2>
                    📈 Booking Zinazoendelea
                </h2>

                <p style="color:red;">

                    ❌ Imeshindikana
                    kupakia taarifa.

                </p>

            </div>

        `;

    }
}


/* =========================================================
   11.12 AUTO REFRESH
========================================================= */

let roomRentAutoRefreshSehemu11 =
    null;


function startAutoRefreshSehemu11() {

    /*
     * CLEAR OLD TIMER
     */

    if (
        roomRentAutoRefreshSehemu11
    ) {

        clearInterval(
            roomRentAutoRefreshSehemu11
        );

    }


    /*
     * REFRESH EVERY 30 MINUTES
     */

    roomRentAutoRefreshSehemu11 =
        setInterval(

            async function() {

                const user =
                    auth.currentUser;


                if (!user) {
                    return;
                }


                await refreshUserBookingsSehemu11(
                    user.uid
                );


                console.log(
                    "🔄 Booking progress refreshed."
                );

            },

            30 *
            60 *
            1000

        );

}


/* =========================================================
   11.13 START TIMER
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        startAutoRefreshSehemu11();


        console.log(
            "✅ Sehemu ya 11 tayari."
        );

    }
);


/* =========================================================
   11.14 WINDOW EXPORTS
========================================================= */

window.calculateBookingProgressSehemu11 =
    calculateBookingProgressSehemu11;


window.refreshBookingSehemu11 =
    refreshBookingSehemu11;


window.refreshUserBookingsSehemu11 =
    refreshUserBookingsSehemu11;


window.refreshAllActiveBookingsSehemu11 =
    refreshAllActiveBookingsSehemu11;


window.onyeshaActiveBookingsSehemu11 =
    onyeshaActiveBookingsSehemu11;


/* =========================================================
   SEHEMU YA 11 IMEISHIA HAPA
========================================================= */
/* =========================================================
   ROOMRENT - SEHEMU YA 12
   BOOKING DETAILS + PROGRESS + ACTIVE BOOKINGS
========================================================= */


/* =========================================================
   12.1 FORMAT MONEY SAFE
========================================================= */

function formatMoneySehemu12(amount) {

    const number =
        Number(amount || 0);

    return number.toLocaleString(
        "en-US"
    );
}


/* =========================================================
   12.2 GET BOOKING BY ID
========================================================= */

async function getBookingByIdSehemu12(
    bookingId
) {

    try {

        const snapshot =
            await db.collection(
                "bookings"
            )
            .doc(bookingId)
            .get();


        if (!snapshot.exists) {

            return null;

        }


        return {

            id:
                snapshot.id,

            ...snapshot.data()

        };


    } catch (error) {

        console.error(
            "Get booking error:",
            error
        );

        return null;
    }
}


/* =========================================================
   12.3 GET BOOKING STATUS ICON
========================================================= */

function getBookingStatusIconSehemu12(
    booking
) {

    if (!booking) {
        return "⏳";
    }


    if (
        booking.status ===
        "Active"
    ) {

        return "🟢";
    }


    if (
        booking.status ===
        "Completed"
    ) {

        return "🏁";
    }


    if (
        booking.paymentStatus ===
        "Confirmed"
    ) {

        return "✅";
    }


    if (
        booking.paymentStatus ===
        "Rejected"
    ) {

        return "❌";
    }


    if (
        booking.paymentStatus ===
        "Requested"
    ) {

        return "📨";
    }


    return "⏳";
}


/* =========================================================
   12.4 GET BOOKING STATUS TEXT
========================================================= */

function getBookingStatusTextSehemu12(
    booking
) {

    if (!booking) {
        return "Unknown";
    }


    if (
        booking.status ===
        "Active"
    ) {

        return "Booking Inaendelea";
    }


    if (
        booking.status ===
        "Completed"
    ) {

        return "Booking Imekamilika";
    }


    if (
        booking.status ===
        "Waiting Confirmation"
    ) {

        return "Inasubiri Uthibitisho wa Malipo";
    }


    if (
        booking.status ===
        "Waiting Payment"
    ) {

        return "Inasubiri Malipo";
    }


    if (
        booking.status ===
        "Payment Rejected"
    ) {

        return "Malipo Yamekataliwa";
    }


    if (
        booking.paymentStatus ===
        "Confirmed"
    ) {

        return "Malipo Yamethibitishwa";
    }


    return booking.status ||
        "Inasubiri";
}


/* =========================================================
   12.5 CALCULATE BOOKING DATA
========================================================= */

function getBookingProgressSehemu12(
    booking
) {

    /*
     * TUMIA SEHEMU YA 11
     */

    if (
        typeof calculateBookingProgressSehemu11 ===
        "function"
    ) {

        return calculateBookingProgressSehemu11(
            booking
        );

    }


    /*
     * FALLBACK
     */

    const totalDays =
        Number(
            booking.days || 0
        );


    const dailyProfit =
        Number(
            booking.dailyProfit || 0
        );


    return {

        totalDays:
            totalDays,

        daysPassed:
            Number(
                booking.daysPassed || 0
            ),

        daysRemaining:
            Number(
                booking.daysRemaining ||
                totalDays
            ),

        dailyProfit:
            dailyProfit,

        earnedProfit:
            Number(
                booking.earnedProfit || 0
            ),

        totalProfit:
            dailyProfit *
            totalDays,

        progressPercent:
            0,

        completed:
            booking.status ===
            "Completed"

    };
}


/* =========================================================
   12.6 OPEN BOOKING DETAILS
========================================================= */

async function funguaBookingDetailsSehemu12(
    bookingId
) {

    const user =
        auth.currentUser;


    if (!user) {

        alert(
            "🔐 Tafadhali ingia kwanza."
        );

        return;

    }


    const booking =
        await getBookingByIdSehemu12(
            bookingId
        );


    if (!booking) {

        alert(
            "❌ Booking haijapatikana."
        );

        return;

    }


    /*
     * SECURITY
     */

    if (
        booking.userId !==
        user.uid
    ) {

        alert(
            "❌ Huna ruhusa ya kuona booking hii."
        );

        return;

    }


    /*
     * REFRESH ACTIVE BOOKING
     */

    if (
        booking.status ===
        "Active"
    ) {

        if (
            typeof refreshBookingSehemu11 ===
            "function"
        ) {

            await refreshBookingSehemu11(
                bookingId
            );


            const refreshedBooking =
                await getBookingByIdSehemu12(
                    bookingId
                );


            if (
                refreshedBooking
            ) {

                Object.assign(
                    booking,
                    refreshedBooking
                );

            }

        }

    }


    const progress =
        getBookingProgressSehemu12(
            booking
        );


    const section =
        document.getElementById(
            "taarifaSection"
        );


    if (!section) {
        return;
    }


    /*
     * HIDE OTHER SECTIONS
     */

    const vyumba =
        document.getElementById(
            "vyumba"
        );


    const fomuKodi =
        document.getElementById(
            "fomuKodi"
        );


    if (vyumba) {

        vyumba.style.display =
            "none";

    }


    if (fomuKodi) {

        fomuKodi.style.display =
            "none";

    }


    section.style.display =
        "block";


    const roomPrice =
        Number(
            booking.roomPrice || 0
        );


    const totalReturn =
        roomPrice +
        Number(
            progress.totalProfit || 0
        );


    const statusIcon =
        getBookingStatusIconSehemu12(
            booking
        );


    const statusText =
        getBookingStatusTextSehemu12(
            booking
        );


    section.innerHTML = `

        <div class="booking-card">

            <button
                class="endeleaBtn"
                onclick="funguaBookingZanguSehemu12()"
            >

                ← Rudi Booking Zangu

            </button>


            <h2>

                ${statusIcon}

                Booking Details

            </h2>


            <div style="
                border:1px solid #ddd;
                border-radius:12px;
                padding:15px;
                margin:15px 0;
            ">


                <h3>
                    🏠 Chumba
                    ${escapeHtml(
                        booking.roomNumber || "-"
                    )}
                </h3>


                <p>

                    📋 Booking Number:

                    <strong>
                        ${escapeHtml(
                            booking.bookingNumber || "-"
                        )}
                    </strong>

                </p>


                <p>

                    📌 Status:

                    <strong>
                        ${escapeHtml(
                            statusText
                        )}
                    </strong>

                </p>


                <p>

                    💳 Payment:

                    <strong>
                        ${escapeHtml(
                            booking.paymentStatus ||
                            "Pending"
                        )}
                    </strong>

                </p>

            </div>


            <!-- PRICE -->

            <div style="
                border:1px solid #ddd;
                border-radius:12px;
                padding:15px;
                margin:15px 0;
            ">

                <h3>
                    💰 Taarifa za Faida
                </h3>


                <p>

                    Bei ya Booking:

                    <strong>

                        TSh
                        ${formatMoneySehemu12(
                            roomPrice
                        )}

                    </strong>

                </p>


                <p>

                    Faida kwa siku:

                    <strong>

                        TSh
                        ${formatMoneySehemu12(
                            progress.dailyProfit
                        )}

                    </strong>

                </p>


                <p>

                    Jumla ya siku:

                    <strong>
                        ${progress.totalDays}
                    </strong>

                </p>


                <p>

                    Faida iliyopatikana:

                    <strong>

                        TSh
                        ${formatMoneySehemu12(
                            progress.earnedProfit
                        )}

                    </strong>

                </p>


                <p>

                    Jumla ya faida:

                    <strong>

                        TSh
                        ${formatMoneySehemu12(
                            progress.totalProfit
                        )}

                    </strong>

                </p>


                <p>

                    Jumla ya mwisho:

                    <strong>

                        TSh
                        ${formatMoneySehemu12(
                            totalReturn
                        )}

                    </strong>

                </p>

            </div>


            <!-- TIME -->

            <div style="
                border:1px solid #ddd;
                border-radius:12px;
                padding:15px;
                margin:15px 0;
            ">

                <h3>
                    📅 Maendeleo ya Booking
                </h3>


                <p>

                    Siku zilizopita:

                    <strong>

                        ${progress.daysPassed}
                        /
                        ${progress.totalDays}

                    </strong>

                </p>


                <p>

                    Siku zilizobaki:

                    <strong>
                        ${progress.daysRemaining}
                    </strong>

                </p>


                <!-- PROGRESS BAR -->

                <div style="
                    width:100%;
                    height:22px;
                    background:#eeeeee;
                    border-radius:20px;
                    overflow:hidden;
                    margin-top:15px;
                ">

                    <div style="
                        width:${progress.progressPercent}%;
                        height:100%;
                        background:#22c55e;
                        transition:width 0.5s;
                    ">

                    </div>

                </div>


                <p style="
                    text-align:center;
                    font-weight:bold;
                    margin-top:10px;
                ">

                    ${progress.progressPercent}%

                </p>

            </div>


            <!-- PAYMENT INFO -->

            <div style="
                border:1px solid #ddd;
                border-radius:12px;
                padding:15px;
                margin:15px 0;
            ">

                <h3>
                    💳 Malipo
                </h3>


                <p>

                    Njia:

                    <strong>
                        ${escapeHtml(
                            booking.paymentMethod || "-"
                        )}
                    </strong>

                </p>


                <p>

                    Reference:

                    <strong>
                        ${escapeHtml(
                            booking.paymentReference ||
                            "Bado"
                        )}
                    </strong>

                </p>


                <p>

                    Payment Status:

                    <strong>
                        ${escapeHtml(
                            booking.paymentStatus ||
                            "Pending"
                        )}
                    </strong>

                </p>

            </div>


            <!-- ACTION BUTTONS -->

            <button
                class="thibitishaBtn"
                onclick="refreshBookingDetailsSehemu12('${booking.id}')"
            >

                🔄 Refresh

            </button>


            <button
                class="endeleaBtn"
                onclick="funguaBookingZanguSehemu12()"
            >

                📋 Booking Zangu

            </button>

        </div>

    `;


    section.scrollIntoView({

        behavior:
            "smooth",

        block:
            "start"

    });

}


/* =========================================================
   12.7 REFRESH BOOKING DETAILS
========================================================= */

async function refreshBookingDetailsSehemu12(
    bookingId
) {

    await funguaBookingDetailsSehemu12(
        bookingId
    );

}


/* =========================================================
   12.8 OPEN MY BOOKINGS
   UPDATED VERSION
========================================================= */

async function funguaBookingZanguSehemu12() {

    const user =
        auth.currentUser;


    if (!user) {

        alert(
            "🔐 Tafadhali ingia kwanza."
        );

        return;

    }


    const section =
        document.getElementById(
            "taarifaSection"
        );


    if (!section) {
        return;
    }


    /*
     * HIDE OTHER SECTIONS
     */

    const vyumba =
        document.getElementById(
            "vyumba"
        );


    const fomuKodi =
        document.getElementById(
            "fomuKodi"
        );


    if (vyumba) {

        vyumba.style.display =
            "none";

    }


    if (fomuKodi) {

        fomuKodi.style.display =
            "none";

    }


    section.style.display =
        "block";


    section.innerHTML = `

        <div class="booking-card">

            <h2>
                📋 Booking Zangu
            </h2>

            <p>
                ⏳ Inapakia...
            </p>

        </div>

    `;


    try {

        const snapshot =
            await db.collection(
                "bookings"
            )
            .where(
                "userId",
                "==",
                user.uid
            )
            .get();


        const bookings =
            [];


        snapshot.forEach(
            doc => {

                bookings.push({

                    id:
                        doc.id,

                    ...doc.data()

                });

            }
        );


        /*
         * SORT BOOKINGS
         */

        bookings.sort(
            (a, b) => {

                const timeA =
                    a.createdAt &&
                    typeof a.createdAt.toDate ===
                    "function"

                        ?

                        a.createdAt
                            .toDate()
                            .getTime()

                        :

                        0;


                const timeB =
                    b.createdAt &&
                    typeof b.createdAt.toDate ===
                    "function"

                        ?

                        b.createdAt
                            .toDate()
                            .getTime()

                        :

                        0;


                return timeB -
                    timeA;

            }
        );


        /*
         * EMPTY
         */

        if (
            bookings.length === 0
        ) {

            section.innerHTML = `

                <div class="booking-card">

                    <h2>
                        📋 Booking Zangu
                    </h2>


                    <p>
                        Bado huna booking.
                    </p>


                    <button
                        class="thibitishaBtn"
                        onclick="onyeshaVyumbaNaPicha()"
                    >

                        🏠 Angalia Vyumba

                    </button>

                </div>

            `;

            return;

        }


        let html = `

            <div class="booking-card">

                <h2>
                    📋 Booking Zangu
                </h2>

                <p>

                    Jumla ya Booking:

                    <strong>
                        ${bookings.length}
                    </strong>

                </p>

            </div>

        `;


        /*
         * CREATE BOOKING CARDS
         */

        bookings.forEach(
            booking => {

                const statusIcon =
                    getBookingStatusIconSehemu12(
                        booking
                    );


                const statusText =
                    getBookingStatusTextSehemu12(
                        booking
                    );


                const roomPrice =
                    Number(
                        booking.roomPrice || 0
                    );


                const dailyProfit =
                    Number(
                        booking.dailyProfit || 0
                    );


                html += `

                    <div
                        class="booking-card"
                        style="
                            margin-bottom:15px;
                        "
                    >

                        <h3>

                            ${statusIcon}

                            Chumba
                            ${escapeHtml(
                                booking.roomNumber ||
                                "-"
                            )}

                        </h3>


                        <p>

                            📋
                            ${escapeHtml(
                                booking.bookingNumber ||
                                "-"
                            )}

                        </p>


                        <p>

                            💰 Bei:

                            <strong>

                                TSh
                                ${formatMoneySehemu12(
                                    roomPrice
                                )}

                            </strong>

                        </p>


                        <p>

                            📈 Faida kwa siku:

                            <strong>

                                TSh
                                ${formatMoneySehemu12(
                                    dailyProfit
                                )}

                            </strong>

                        </p>


                        <p>

                            📌 Status:

                            <strong>
                                ${escapeHtml(
                                    statusText
                                )}
                            </strong>

                        </p>


                        <button
                            class="thibitishaBtn"
                            onclick="funguaBookingDetailsSehemu12('${booking.id}')"
                        >

                            👁️ Angalia Maelezo

                        </button>

                    </div>

                `;

            }
        );


        section.innerHTML =
            html;


        section.scrollIntoView({

            behavior:
                "smooth"

        });


    } catch (error) {

        console.error(
            "Booking list error:",
            error
        );


        section.innerHTML = `

            <div class="booking-card">

                <h2>
                    📋 Booking Zangu
                </h2>


                <p style="color:red;">

                    ❌ Imeshindikana
                    kupakia booking.

                </p>

            </div>

        `;

    }
}


/* =========================================================
   12.9 CONNECT BOOKING BUTTON
========================================================= */

function connectBookingButtonSehemu12() {

    const bookingBtn =
        document.getElementById(
            "bookingZangu"
        );


    if (!bookingBtn) {
        return;
    }


    const newButton =
        bookingBtn.cloneNode(
            true
        );


    bookingBtn.parentNode.replaceChild(

        newButton,

        bookingBtn

    );


    newButton.addEventListener(
        "click",

        async function() {

            await funguaBookingZanguSehemu12();

        }

    );

}


/* =========================================================
   12.10 AUTO REFRESH ACTIVE DETAILS
========================================================= */

let roomRentBookingDetailsTimerSehemu12 =
    null;


function startBookingDetailsTimerSehemu12() {

    if (
        roomRentBookingDetailsTimerSehemu12
    ) {

        clearInterval(
            roomRentBookingDetailsTimerSehemu12
        );

    }


    /*
     * REFRESH EVERY 10 MINUTES
     */

    roomRentBookingDetailsTimerSehemu12 =
        setInterval(

            async function() {

                const user =
                    auth.currentUser;


                if (!user) {
                    return;
                }


                console.log(
                    "🔄 Booking details refresh ready."
                );

            },

            10 *
            60 *
            1000

        );

}


/* =========================================================
   12.11 INITIALIZE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",

    function() {

        try {

            connectBookingButtonSehemu12();


            startBookingDetailsTimerSehemu12();


            console.log(
                "✅ Sehemu ya 12 tayari."
            );


        } catch (error) {

            console.error(
                "Sehemu 12 error:",
                error
            );

        }

    }

);


/* =========================================================
   12.12 WINDOW EXPORTS
========================================================= */

window.funguaBookingDetailsSehemu12 =
    funguaBookingDetailsSehemu12;


window.refreshBookingDetailsSehemu12 =
    refreshBookingDetailsSehemu12;


window.funguaBookingZanguSehemu12 =
    funguaBookingZanguSehemu12;


/* =========================================================
   SEHEMU YA 12 IMEISHIA HAPA
========================================================= *//* =========================================================
   ROOMRENT - SEHEMU YA 12
   BOOKING DETAILS + PROGRESS + ACTIVE BOOKINGS
========================================================= */


/* =========================================================
   12.1 FORMAT MONEY SAFE
========================================================= */

function formatMoneySehemu12(amount) {

    const number =
        Number(amount || 0);

    return number.toLocaleString(
        "en-US"
    );
}


/* =========================================================
   12.2 GET BOOKING BY ID
========================================================= */

async function getBookingByIdSehemu12(
    bookingId
) {

    try {

        const snapshot =
            await db.collection(
                "bookings"
            )
            .doc(bookingId)
            .get();


        if (!snapshot.exists) {

            return null;

        }


        return {

            id:
                snapshot.id,

            ...snapshot.data()

        };


    } catch (error) {

        console.error(
            "Get booking error:",
            error
        );

        return null;
    }
}


/* =========================================================
   12.3 GET BOOKING STATUS ICON
========================================================= */

function getBookingStatusIconSehemu12(
    booking
) {

    if (!booking) {
        return "⏳";
    }


    if (
        booking.status ===
        "Active"
    ) {

        return "🟢";
    }


    if (
        booking.status ===
        "Completed"
    ) {

        return "🏁";
    }


    if (
        booking.paymentStatus ===
        "Confirmed"
    ) {

        return "✅";
    }


    if (
        booking.paymentStatus ===
        "Rejected"
    ) {

        return "❌";
    }


    if (
        booking.paymentStatus ===
        "Requested"
    ) {

        return "📨";
    }


    return "⏳";
}


/* =========================================================
   12.4 GET BOOKING STATUS TEXT
========================================================= */

function getBookingStatusTextSehemu12(
    booking
) {

    if (!booking) {
        return "Unknown";
    }


    if (
        booking.status ===
        "Active"
    ) {

        return "Booking Inaendelea";
    }


    if (
        booking.status ===
        "Completed"
    ) {

        return "Booking Imekamilika";
    }


    if (
        booking.status ===
        "Waiting Confirmation"
    ) {

        return "Inasubiri Uthibitisho wa Malipo";
    }


    if (
        booking.status ===
        "Waiting Payment"
    ) {

        return "Inasubiri Malipo";
    }


    if (
        booking.status ===
        "Payment Rejected"
    ) {

        return "Malipo Yamekataliwa";
    }


    if (
        booking.paymentStatus ===
        "Confirmed"
    ) {

        return "Malipo Yamethibitishwa";
    }


    return booking.status ||
        "Inasubiri";
}


/* =========================================================
   12.5 CALCULATE BOOKING DATA
========================================================= */

function getBookingProgressSehemu12(
    booking
) {

    /*
     * TUMIA SEHEMU YA 11
     */

    if (
        typeof calculateBookingProgressSehemu11 ===
        "function"
    ) {

        return calculateBookingProgressSehemu11(
            booking
        );

    }


    /*
     * FALLBACK
     */

    const totalDays =
        Number(
            booking.days || 0
        );


    const dailyProfit =
        Number(
            booking.dailyProfit || 0
        );


    return {

        totalDays:
            totalDays,

        daysPassed:
            Number(
                booking.daysPassed || 0
            ),

        daysRemaining:
            Number(
                booking.daysRemaining ||
                totalDays
            ),

        dailyProfit:
            dailyProfit,

        earnedProfit:
            Number(
                booking.earnedProfit || 0
            ),

        totalProfit:
            dailyProfit *
            totalDays,

        progressPercent:
            0,

        completed:
            booking.status ===
            "Completed"

    };
}


/* =========================================================
   12.6 OPEN BOOKING DETAILS
========================================================= */

async function funguaBookingDetailsSehemu12(
    bookingId
) {

    const user =
        auth.currentUser;


    if (!user) {

        alert(
            "🔐 Tafadhali ingia kwanza."
        );

        return;

    }


    const booking =
        await getBookingByIdSehemu12(
            bookingId
        );


    if (!booking) {

        alert(
            "❌ Booking haijapatikana."
        );

        return;

    }


    /*
     * SECURITY
     */

    if (
        booking.userId !==
        user.uid
    ) {

        alert(
            "❌ Huna ruhusa ya kuona booking hii."
        );

        return;

    }


    /*
     * REFRESH ACTIVE BOOKING
     */

    if (
        booking.status ===
        "Active"
    ) {

        if (
            typeof refreshBookingSehemu11 ===
            "function"
        ) {

            await refreshBookingSehemu11(
                bookingId
            );


            const refreshedBooking =
                await getBookingByIdSehemu12(
                    bookingId
                );


            if (
                refreshedBooking
            ) {

                Object.assign(
                    booking,
                    refreshedBooking
                );

            }

        }

    }


    const progress =
        getBookingProgressSehemu12(
            booking
        );


    const section =
        document.getElementById(
            "taarifaSection"
        );


    if (!section) {
        return;
    }


    /*
     * HIDE OTHER SECTIONS
     */

    const vyumba =
        document.getElementById(
            "vyumba"
        );


    const fomuKodi =
        document.getElementById(
            "fomuKodi"
        );


    if (vyumba) {

        vyumba.style.display =
            "none";

    }


    if (fomuKodi) {

        fomuKodi.style.display =
            "none";

    }


    section.style.display =
        "block";


    const roomPrice =
        Number(
            booking.roomPrice || 0
        );


    const totalReturn =
        roomPrice +
        Number(
            progress.totalProfit || 0
        );


    const statusIcon =
        getBookingStatusIconSehemu12(
            booking
        );


    const statusText =
        getBookingStatusTextSehemu12(
            booking
        );


    section.innerHTML = `

        <div class="booking-card">

            <button
                class="endeleaBtn"
                onclick="funguaBookingZanguSehemu12()"
            >

                ← Rudi Booking Zangu

            </button>


            <h2>

                ${statusIcon}

                Booking Details

            </h2>


            <div style="
                border:1px solid #ddd;
                border-radius:12px;
                padding:15px;
                margin:15px 0;
            ">


                <h3>
                    🏠 Chumba
                    ${escapeHtml(
                        booking.roomNumber || "-"
                    )}
                </h3>


                <p>

                    📋 Booking Number:

                    <strong>
                        ${escapeHtml(
                            booking.bookingNumber || "-"
                        )}
                    </strong>

                </p>


                <p>

                    📌 Status:

                    <strong>
                        ${escapeHtml(
                            statusText
                        )}
                    </strong>

                </p>


                <p>

                    💳 Payment:

                    <strong>
                        ${escapeHtml(
                            booking.paymentStatus ||
                            "Pending"
                        )}
                    </strong>

                </p>

            </div>


            <!-- PRICE -->

            <div style="
                border:1px solid #ddd;
                border-radius:12px;
                padding:15px;
                margin:15px 0;
            ">

                <h3>
                    💰 Taarifa za Faida
                </h3>


                <p>

                    Bei ya Booking:

                    <strong>

                        TSh
                        ${formatMoneySehemu12(
                            roomPrice
                        )}

                    </strong>

                </p>


                <p>

                    Faida kwa siku:

                    <strong>

                        TSh
                        ${formatMoneySehemu12(
                            progress.dailyProfit
                        )}

                    </strong>

                </p>


                <p>

                    Jumla ya siku:

                    <strong>
                        ${progress.totalDays}
                    </strong>

                </p>


                <p>

                    Faida iliyopatikana:

                    <strong>

                        TSh
                        ${formatMoneySehemu12(
                            progress.earnedProfit
                        )}

                    </strong>

                </p>


                <p>

                    Jumla ya faida:

                    <strong>

                        TSh
                        ${formatMoneySehemu12(
                            progress.totalProfit
                        )}

                    </strong>

                </p>


                <p>

                    Jumla ya mwisho:

                    <strong>

                        TSh
                        ${formatMoneySehemu12(
                            totalReturn
                        )}

                    </strong>

                </p>

            </div>


            <!-- TIME -->

            <div style="
                border:1px solid #ddd;
                border-radius:12px;
                padding:15px;
                margin:15px 0;
            ">

                <h3>
                    📅 Maendeleo ya Booking
                </h3>


                <p>

                    Siku zilizopita:

                    <strong>

                        ${progress.daysPassed}
                        /
                        ${progress.totalDays}

                    </strong>

                </p>


                <p>

                    Siku zilizobaki:

                    <strong>
                        ${progress.daysRemaining}
                    </strong>

                </p>


                <!-- PROGRESS BAR -->

                <div style="
                    width:100%;
                    height:22px;
                    background:#eeeeee;
                    border-radius:20px;
                    overflow:hidden;
                    margin-top:15px;
                ">

                    <div style="
                        width:${progress.progressPercent}%;
                        height:100%;
                        background:#22c55e;
                        transition:width 0.5s;
                    ">

                    </div>

                </div>


                <p style="
                    text-align:center;
                    font-weight:bold;
                    margin-top:10px;
                ">

                    ${progress.progressPercent}%

                </p>

            </div>


            <!-- PAYMENT INFO -->

            <div style="
                border:1px solid #ddd;
                border-radius:12px;
                padding:15px;
                margin:15px 0;
            ">

                <h3>
                    💳 Malipo
                </h3>


                <p>

                    Njia:

                    <strong>
                        ${escapeHtml(
                            booking.paymentMethod || "-"
                        )}
                    </strong>

                </p>


                <p>

                    Reference:

                    <strong>
                        ${escapeHtml(
                            booking.paymentReference ||
                            "Bado"
                        )}
                    </strong>

                </p>


                <p>

                    Payment Status:

                    <strong>
                        ${escapeHtml(
                            booking.paymentStatus ||
                            "Pending"
                        )}
                    </strong>

                </p>

            </div>


            <!-- ACTION BUTTONS -->

            <button
                class="thibitishaBtn"
                onclick="refreshBookingDetailsSehemu12('${booking.id}')"
            >

                🔄 Refresh

            </button>


            <button
                class="endeleaBtn"
                onclick="funguaBookingZanguSehemu12()"
            >

                📋 Booking Zangu

            </button>

        </div>

    `;


    section.scrollIntoView({

        behavior:
            "smooth",

        block:
            "start"

    });

}


/* =========================================================
   12.7 REFRESH BOOKING DETAILS
========================================================= */

async function refreshBookingDetailsSehemu12(
    bookingId
) {

    await funguaBookingDetailsSehemu12(
        bookingId
    );

}


/* =========================================================
   12.8 OPEN MY BOOKINGS
   UPDATED VERSION
========================================================= */

async function funguaBookingZanguSehemu12() {

    const user =
        auth.currentUser;


    if (!user) {

        alert(
            "🔐 Tafadhali ingia kwanza."
        );

        return;

    }


    const section =
        document.getElementById(
            "taarifaSection"
        );


    if (!section) {
        return;
    }


    /*
     * HIDE OTHER SECTIONS
     */

    const vyumba =
        document.getElementById(
            "vyumba"
        );


    const fomuKodi =
        document.getElementById(
            "fomuKodi"
        );


    if (vyumba) {

        vyumba.style.display =
            "none";

    }


    if (fomuKodi) {

        fomuKodi.style.display =
            "none";

    }


    section.style.display =
        "block";


    section.innerHTML = `

        <div class="booking-card">

            <h2>
                📋 Booking Zangu
            </h2>

            <p>
                ⏳ Inapakia...
            </p>

        </div>

    `;


    try {

        const snapshot =
            await db.collection(
                "bookings"
            )
            .where(
                "userId",
                "==",
                user.uid
            )
            .get();


        const bookings =
            [];


        snapshot.forEach(
            doc => {

                bookings.push({

                    id:
                        doc.id,

                    ...doc.data()

                });

            }
        );


        /*
         * SORT BOOKINGS
         */

        bookings.sort(
            (a, b) => {

                const timeA =
                    a.createdAt &&
                    typeof a.createdAt.toDate ===
                    "function"

                        ?

                        a.createdAt
                            .toDate()
                            .getTime()

                        :

                        0;


                const timeB =
                    b.createdAt &&
                    typeof b.createdAt.toDate ===
                    "function"

                        ?

                        b.createdAt
                            .toDate()
                            .getTime()

                        :

                        0;


                return timeB -
                    timeA;

            }
        );


        /*
         * EMPTY
         */

        if (
            bookings.length === 0
        ) {

            section.innerHTML = `

                <div class="booking-card">

                    <h2>
                        📋 Booking Zangu
                    </h2>


                    <p>
                        Bado huna booking.
                    </p>


                    <button
                        class="thibitishaBtn"
                        onclick="onyeshaVyumbaNaPicha()"
                    >

                        🏠 Angalia Vyumba

                    </button>

                </div>

            `;

            return;

        }


        let html = `

            <div class="booking-card">

                <h2>
                    📋 Booking Zangu
                </h2>

                <p>

                    Jumla ya Booking:

                    <strong>
                        ${bookings.length}
                    </strong>

                </p>

            </div>

        `;


        /*
         * CREATE BOOKING CARDS
         */

        bookings.forEach(
            booking => {

                const statusIcon =
                    getBookingStatusIconSehemu12(
                        booking
                    );


                const statusText =
                    getBookingStatusTextSehemu12(
                        booking
                    );


                const roomPrice =
                    Number(
                        booking.roomPrice || 0
                    );


                const dailyProfit =
                    Number(
                        booking.dailyProfit || 0
                    );


                html += `

                    <div
                        class="booking-card"
                        style="
                            margin-bottom:15px;
                        "
                    >

                        <h3>

                            ${statusIcon}

                            Chumba
                            ${escapeHtml(
                                booking.roomNumber ||
                                "-"
                            )}

                        </h3>


                        <p>

                            📋
                            ${escapeHtml(
                                booking.bookingNumber ||
                                "-"
                            )}

                        </p>


                        <p>

                            💰 Bei:

                            <strong>

                                TSh
                                ${formatMoneySehemu12(
                                    roomPrice
                                )}

                            </strong>

                        </p>


                        <p>

                            📈 Faida kwa siku:

                            <strong>

                                TSh
                                ${formatMoneySehemu12(
                                    dailyProfit
                                )}

                            </strong>

                        </p>


                        <p>

                            📌 Status:

                            <strong>
                                ${escapeHtml(
                                    statusText
                                )}
                            </strong>

                        </p>


                        <button
                            class="thibitishaBtn"
                            onclick="funguaBookingDetailsSehemu12('${booking.id}')"
                        >

                            👁️ Angalia Maelezo

                        </button>

                    </div>

                `;

            }
        );


        section.innerHTML =
            html;


        section.scrollIntoView({

            behavior:
                "smooth"

        });


    } catch (error) {

        console.error(
            "Booking list error:",
            error
        );


        section.innerHTML = `

            <div class="booking-card">

                <h2>
                    📋 Booking Zangu
                </h2>


                <p style="color:red;">

                    ❌ Imeshindikana
                    kupakia booking.

                </p>

            </div>

        `;

    }
}


/* =========================================================
   12.9 CONNECT BOOKING BUTTON
========================================================= */

function connectBookingButtonSehemu12() {

    const bookingBtn =
        document.getElementById(
            "bookingZangu"
        );


    if (!bookingBtn) {
        return;
    }


    const newButton =
        bookingBtn.cloneNode(
            true
        );


    bookingBtn.parentNode.replaceChild(

        newButton,

        bookingBtn

    );


    newButton.addEventListener(
        "click",

        async function() {

            await funguaBookingZanguSehemu12();

        }

    );

}


/* =========================================================
   12.10 AUTO REFRESH ACTIVE DETAILS
========================================================= */

let roomRentBookingDetailsTimerSehemu12 =
    null;


function startBookingDetailsTimerSehemu12() {

    if (
        roomRentBookingDetailsTimerSehemu12
    ) {

        clearInterval(
            roomRentBookingDetailsTimerSehemu12
        );

    }


    /*
     * REFRESH EVERY 10 MINUTES
     */

    roomRentBookingDetailsTimerSehemu12 =
        setInterval(

            async function() {

                const user =
                    auth.currentUser;


                if (!user) {
                    return;
                }


                console.log(
                    "🔄 Booking details refresh ready."
                );

            },

            10 *
            60 *
            1000

        );

}


/* =========================================================
   12.11 INITIALIZE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",

    function() {

        try {

            connectBookingButtonSehemu12();


            startBookingDetailsTimerSehemu12();


            console.log(
                "✅ Sehemu ya 12 tayari."
            );


        } catch (error) {

            console.error(
                "Sehemu 12 error:",
                error
            );

        }

    }

);


/* =========================================================
   12.12 WINDOW EXPORTS
========================================================= */

window.funguaBookingDetailsSehemu12 =
    funguaBookingDetailsSehemu12;


window.refreshBookingDetailsSehemu12 =
    refreshBookingDetailsSehemu12;


window.funguaBookingZanguSehemu12 =
    funguaBookingZanguSehemu12;


/* =========================================================
   SEHEMU YA 12 IMEISHIA HAPA
========================================================= */
/* =========================================================
   ROOMRENT - SEHEMU YA 13
   WITHDRAWAL SYSTEM
   FIRESTORE + ADMIN APPROVAL
========================================================= */


/* =========================================================
   13.1 WITHDRAWAL SETTINGS
========================================================= */

const ROOMRENT_WITHDRAWAL_SETTINGS = {

    minimumAmount: 1000,

    methods: [

        "Airtel Money",

        "MIXX BY YAS"

    ]

};


/* =========================================================
   13.2 FORMAT WITHDRAWAL MONEY
========================================================= */

function formatWithdrawalMoneySehemu13(
    amount
) {

    return Number(
        amount || 0
    ).toLocaleString(
        "en-US"
    );
}


/* =========================================================
   13.3 GET USER BALANCE
========================================================= */

async function getWithdrawalBalanceSehemu13(
    userId
) {

    try {

        const userSnap =
            await db.collection(
                "users"
            )
            .doc(userId)
            .get();


        if (!userSnap.exists) {
            return 0;
        }


        const userData =
            userSnap.data();


        return Number(
            userData.commissionBalance || 0
        );


    } catch (error) {

        console.error(
            "Withdrawal balance error:",
            error
        );

        return 0;
    }
}


/* =========================================================
   13.4 GET PENDING WITHDRAWAL TOTAL
========================================================= */

async function getPendingWithdrawalTotalSehemu13(
    userId
) {

    try {

        const snapshot =
            await db.collection(
                "withdrawals"
            )
            .where(
                "userId",
                "==",
                userId
            )
            .get();


        let total =
            0;


        snapshot.forEach(
            doc => {

                const data =
                    doc.data();


                if (

                    data.status ===
                    "Pending"

                    ||

                    data.status ===
                    "Approved"

                    ||

                    data.status ===
                    "Processing"

                ) {

                    total += Number(
                        data.amount || 0
                    );

                }

            }
        );


        return total;


    } catch (error) {

        console.error(
            "Pending withdrawal error:",
            error
        );

        return 0;
    }
}


/* =========================================================
   13.5 OPEN WITHDRAWAL PAGE
========================================================= */

async function funguaWithdrawalSehemu13() {

    const user =
        auth.currentUser;


    if (!user) {

        alert(
            "🔐 Tafadhali ingia kwanza."
        );

        return;

    }


    const section =
        document.getElementById(
            "taarifaSection"
        );


    if (!section) {
        return;
    }


    const vyumba =
        document.getElementById(
            "vyumba"
        );


    const fomuKodi =
        document.getElementById(
            "fomuKodi"
        );


    if (vyumba) {

        vyumba.style.display =
            "none";

    }


    if (fomuKodi) {

        fomuKodi.style.display =
            "none";

    }


    section.style.display =
        "block";


    section.innerHTML = `

        <div class="booking-card">

            <h2>
                💸 Withdrawal
            </h2>

            <p>
                ⏳ Inapakia balance...
            </p>

        </div>

    `;


    const balance =
        await getWithdrawalBalanceSehemu13(
            user.uid
        );


    const pending =
        await getPendingWithdrawalTotalSehemu13(
            user.uid
        );


    const available =
        Math.max(
            0,
            balance - pending
        );


    section.innerHTML = `

        <div class="booking-card">

            <button
                class="endeleaBtn"
                onclick="fungaWithdrawalSehemu13()"
            >
                ← Rudi
            </button>


            <h2>
                💸 Withdrawal
            </h2>


            <div style="
                padding:15px;
                border-radius:12px;
                border:1px solid #ddd;
                margin:15px 0;
            ">

                <p>
                    💰 Commission Balance
                </p>

                <h2>
                    TSh ${formatWithdrawalMoneySehemu13(
                        balance
                    )}
                </h2>

            </div>


            <div style="
                padding:15px;
                border-radius:12px;
                border:1px solid #ddd;
                margin:15px 0;
            ">

                <p>
                    ⏳ Pending Withdrawal
                </p>

                <h3>
                    TSh ${formatWithdrawalMoneySehemu13(
                        pending
                    )}
                </h3>

            </div>


            <div style="
                padding:15px;
                border-radius:12px;
                border:1px solid #ddd;
                margin:15px 0;
            ">

                <p>
                    ✅ Available to Withdraw
                </p>

                <h2>
                    TSh ${formatWithdrawalMoneySehemu13(
                        available
                    )}
                </h2>

            </div>


            <hr>


            <h3>
                Omba Withdrawal
            </h3>


            <input
                type="number"
                id="withdrawAmount"
                placeholder="Kiasi unachotaka kutoa"
                min="${ROOMRENT_WITHDRAWAL_SETTINGS.minimumAmount}"
            >


            <select
                id="withdrawMethod"
            >

                <option value="">
                    Chagua njia ya malipo
                </option>

                <option value="Airtel Money">
                    Airtel Money
                </option>

                <option value="MIXX BY YAS">
                    MIXX BY YAS
                </option>

            </select>


            <input
                type="tel"
                id="withdrawPhone"
                placeholder="Namba ya kupokea pesa"
            >


            <button
                class="thibitishaBtn"
                onclick="ombaWithdrawalSehemu13()"
            >

                💸 Omba Withdrawal

            </button>


            <p
                id="withdrawMessage"
            ></p>


            <hr>


            <button
                class="endeleaBtn"
                onclick="onyeshaWithdrawalHistorySehemu13()"
            >

                📋 Withdrawal Zangu

            </button>

        </div>

    `;

}


/* =========================================================
   13.6 FORMAT TANZANIA PHONE
========================================================= */

function formatWithdrawalPhoneSehemu13(
    phone
) {

    let clean =
        String(
            phone || ""
        )
        .replace(
            /\s+/g,
            ""
        )
        .replace(
            /-/g,
            ""
        );


    if (
        clean.startsWith(
            "+255"
        )
    ) {

        clean =
            "255" +
            clean.substring(
                4
            );

    }


    if (
        clean.startsWith(
            "0"
        )
    ) {

        clean =
            "255" +
            clean.substring(
                1
            );

    }


    if (
        clean.length === 12 &&
        clean.startsWith(
            "255"
        )
    ) {

        return clean;

    }


    return null;
}


/* =========================================================
   13.7 REQUEST WITHDRAWAL
========================================================= */

async function ombaWithdrawalSehemu13() {

    const user =
        auth.currentUser;


    if (!user) {

        alert(
            "🔐 Tafadhali ingia kwanza."
        );

        return;

    }


    const amountInput =
        document.getElementById(
            "withdrawAmount"
        );


    const methodInput =
        document.getElementById(
            "withdrawMethod"
        );


    const phoneInput =
        document.getElementById(
            "withdrawPhone"
        );


    const message =
        document.getElementById(
            "withdrawMessage"
        );


    const amount =
        Number(
            amountInput
                ? amountInput.value
                : 0
        );


    const method =
        methodInput
            ? methodInput.value
            : "";


    const phone =
        formatWithdrawalPhoneSehemu13(

            phoneInput
                ? phoneInput.value
                : ""

        );


    /*
     * VALIDATE AMOUNT
     */

    if (

        !amount ||

        amount <
        ROOMRENT_WITHDRAWAL_SETTINGS
            .minimumAmount

    ) {

        if (message) {

            message.innerHTML =

                `❌ Kiasi cha chini cha withdrawal ni TSh ${formatWithdrawalMoneySehemu13(
                    ROOMRENT_WITHDRAWAL_SETTINGS
                        .minimumAmount
                )}`;

        }

        return;

    }


    /*
     * VALIDATE METHOD
     */

    if (
        !method
    ) {

        if (message) {

            message.innerHTML =
                "❌ Chagua njia ya kupokea pesa.";

        }

        return;

    }


    /*
     * VALIDATE PHONE
     */

    if (
        !phone
    ) {

        if (message) {

            message.innerHTML =
                "❌ Weka namba sahihi ya Tanzania.";

        }

        return;

    }


    if (message) {

        message.innerHTML =
            "⏳ Inatuma ombi...";

    }


    try {

        /*
         * GET USER DATA
         */

        const userSnap =
            await db.collection(
                "users"
            )
            .doc(user.uid)
            .get();


        if (!userSnap.exists) {

            throw new Error(
                "User data haijapatikana."
            );

        }


        const userData =
            userSnap.data();


        const balance =
            Number(
                userData.commissionBalance || 0
            );


        const pending =
            await getPendingWithdrawalTotalSehemu13(
                user.uid
            );


        const available =
            Math.max(
                0,
                balance - pending
            );


        /*
         * CHECK BALANCE
         */

        if (
            amount > available
        ) {

            throw new Error(
                "Kiasi unachoomba kinazidi balance yako."
            );

        }


        /*
         * CREATE WITHDRAWAL
         */

        const withdrawalRef =
            db.collection(
                "withdrawals"
            )
            .doc();


        await withdrawalRef.set({

            withdrawalId:
                withdrawalRef.id,

            userId:
                user.uid,

            userName:
                userData.name || "",

            userEmail:
                user.email || "",

            amount:
                amount,

            method:
                method,

            phone:
                phone,

            status:
                "Pending",

            adminNote:
                "",

            transactionReference:
                "",

            createdAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp(),

            updatedAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp()

        });


        /*
         * NOTIFICATION
         */

        if (
            typeof createNotification ===
            "function"
        ) {

            await createNotification(

                user.uid,

                "Withdrawal Requested",

                `Ombi lako la withdrawal ya TSh ${formatWithdrawalMoneySehemu13(
                    amount
                )} limepokelewa.`

            );

        }


        if (message) {

            message.style.color =
                "green";


            message.innerHTML =

                `✅ Ombi lako la TSh ${formatWithdrawalMoneySehemu13(
                    amount
                )} limepokelewa. Linangoja uthibitisho wa Admin.`;

        }


        if (amountInput) {

            amountInput.value =
                "";

        }


        if (phoneInput) {

            phoneInput.value =
                "";

        }


    } catch (error) {

        console.error(
            "Withdrawal request error:",
            error
        );


        if (message) {

            message.style.color =
                "red";


            message.innerHTML =

                "❌ " +
                error.message;

        }

    }

}


/* =========================================================
   13.8 GET USER WITHDRAWALS
========================================================= */

async function getUserWithdrawalsSehemu13(
    userId
) {

    try {

        const snapshot =
            await db.collection(
                "withdrawals"
            )
            .where(
                "userId",
                "==",
                userId
            )
            .get();


        const withdrawals =
            [];


        snapshot.forEach(
            doc => {

                withdrawals.push({

                    id:
                        doc.id,

                    ...doc.data()

                });

            }
        );


        withdrawals.sort(
            (a, b) => {

                const timeA =
                    a.createdAt &&
                    typeof a.createdAt.toDate ===
                    "function"

                        ?

                        a.createdAt
                            .toDate()
                            .getTime()

                        :

                        0;


                const timeB =
                    b.createdAt &&
                    typeof b.createdAt.toDate ===
                    "function"

                        ?

                        b.createdAt
                            .toDate()
                            .getTime()

                        :

                        0;


                return timeB -
                    timeA;

            }
        );


        return withdrawals;


    } catch (error) {

        console.error(
            "Get withdrawals error:",
            error
        );

        return [];
    }
}


/* =========================================================
   13.9 SHOW WITHDRAWAL HISTORY
========================================================= */

async function onyeshaWithdrawalHistorySehemu13() {

    const user =
        auth.currentUser;


    if (!user) {

        alert(
            "🔐 Tafadhali ingia kwanza."
        );

        return;

    }


    const section =
        document.getElementById(
            "taarifaSection"
        );


    if (!section) {
        return;
    }


    section.innerHTML = `

        <div class="booking-card">

            <button
                class="endeleaBtn"
                onclick="funguaWithdrawalSehemu13()"
            >
                ← Rudi Withdrawal
            </button>


            <h2>
                📋 Withdrawal Zangu
            </h2>


            <p>
                ⏳ Inapakia...
            </p>

        </div>

    `;


    const withdrawals =
        await getUserWithdrawalsSehemu13(
            user.uid
        );


    if (
        withdrawals.length === 0
    ) {

        section.innerHTML = `

            <div class="booking-card">

                <button
                    class="endeleaBtn"
                    onclick="funguaWithdrawalSehemu13()"
                >
                    ← Rudi
                </button>


                <h2>
                    📋 Withdrawal Zangu
                </h2>


                <p>
                    Bado hujaomba withdrawal.
                </p>

            </div>

        `;

        return;

    }


    let html = `

        <div class="booking-card">

            <button
                class="endeleaBtn"
                onclick="funguaWithdrawalSehemu13()"
            >
                ← Rudi Withdrawal
            </button>


            <h2>
                📋 Withdrawal Zangu
            </h2>

        </div>

    `;


    withdrawals.forEach(
        withdrawal => {

            let icon =
                "⏳";


            if (
                withdrawal.status ===
                "Paid"
            ) {

                icon =
                    "✅";

            }


            if (
                withdrawal.status ===
                "Rejected"
            ) {

                icon =
                    "❌";

            }


            if (
                withdrawal.status ===
                "Approved"
            ) {

                icon =
                    "👍";

            }


            html += `

                <div
                    class="booking-card"
                    style="
                        margin-bottom:15px;
                    "
                >

                    <h3>

                        ${icon}

                        TSh
                        ${formatWithdrawalMoneySehemu13(
                            withdrawal.amount
                        )}

                    </h3>


                    <p>

                        📱 Njia:

                        <strong>
                            ${escapeHtml(
                                withdrawal.method || "-"
                            )}
                        </strong>

                    </p>


                    <p>

                        📌 Status:

                        <strong>
                            ${escapeHtml(
                                withdrawal.status || "-"
                            )}
                        </strong>

                    </p>


                    <p>

                        🔢 Reference:

                        <strong>
                            ${escapeHtml(
                                withdrawal.transactionReference ||
                                "Bado"
                            )}
                        </strong>

                    </p>


                    ${

                        withdrawal.adminNote

                            ?

                            `

                                <p>

                                    📝 Admin:

                                    ${escapeHtml(
                                        withdrawal.adminNote
                                    )}

                                </p>

                            `

                            :

                            ""

                    }

                </div>

            `;

        }
    );


    section.innerHTML =
        html;

}


/* =========================================================
   13.10 ADMIN GET ALL WITHDRAWALS
========================================================= */

async function getAllWithdrawalsSehemu13() {

    try {

        const snapshot =
            await db.collection(
                "withdrawals"
            )
            .get();


        const withdrawals =
            [];


        snapshot.forEach(
            doc => {

                withdrawals.push({

                    id:
                        doc.id,

                    ...doc.data()

                });

            }
        );


        withdrawals.sort(
            (a, b) => {

                const timeA =
                    a.createdAt &&
                    typeof a.createdAt.toDate ===
                    "function"

                        ?

                        a.createdAt
                            .toDate()
                            .getTime()

                        :

                        0;


                const timeB =
                    b.createdAt &&
                    typeof b.createdAt.toDate ===
                    "function"

                        ?

                        b.createdAt
                            .toDate()
                            .getTime()

                        :

                        0;


                return timeB -
                    timeA;

            }
        );


        return withdrawals;


    } catch (error) {

        console.error(
            "Admin withdrawals error:",
            error
        );

        return [];
    }
}


/* =========================================================
   13.11 ADMIN APPROVE WITHDRAWAL
========================================================= */

async function approveWithdrawalSehemu13(
    withdrawalId
) {

    try {

        const withdrawalRef =
            db.collection(
                "withdrawals"
            )
            .doc(withdrawalId);


        const withdrawalSnap =
            await withdrawalRef.get();


        if (
            !withdrawalSnap.exists
        ) {

            throw new Error(
                "Withdrawal haijapatikana."
            );

        }


        const withdrawal =
            withdrawalSnap.data();


        if (
            withdrawal.status !==
            "Pending"
        ) {

            throw new Error(
                "Withdrawal hii tayari imefanyiwa kazi."
            );

        }


        await withdrawalRef.update({

            status:
                "Approved",

            approvedAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp(),

            updatedAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp()

        });


        /*
         * NOTIFICATION
         */

        if (
            typeof createNotification ===
            "function"
        ) {

            await createNotification(

                withdrawal.userId,

                "Withdrawal Approved",

                `Withdrawal yako ya TSh ${formatWithdrawalMoneySehemu13(
                    withdrawal.amount
                )} imeidhinishwa. Inasubiri malipo.`

            );

        }


        alert(
            "✅ Withdrawal imeidhinishwa."
        );


        return true;


    } catch (error) {

        console.error(
            "Approve withdrawal error:",
            error
        );


        alert(
            "❌ " +
            error.message
        );


        return false;
    }
}


/* =========================================================
   13.12 ADMIN MARK WITHDRAWAL AS PAID
========================================================= */

async function markWithdrawalPaidSehemu13(
    withdrawalId
) {

    const reference =
        prompt(
            "Weka Transaction Reference:"
        );


    if (
        reference === null
    ) {

        return;

    }


    if (
        !reference.trim()
    ) {

        alert(
            "❌ Transaction Reference inahitajika."
        );

        return;

    }


    try {

        const withdrawalRef =
            db.collection(
                "withdrawals"
            )
            .doc(withdrawalId);


        await db.runTransaction(
            async transaction => {

                const withdrawalSnap =
                    await transaction.get(
                        withdrawalRef
                    );


                if (
                    !withdrawalSnap.exists
                ) {

                    throw new Error(
                        "Withdrawal haijapatikana."
                    );

                }


                const withdrawal =
                    withdrawalSnap.data();


                if (

                    withdrawal.status !==
                    "Approved"

                    &&

                    withdrawal.status !==
                    "Processing"

                ) {

                    throw new Error(
                        "Withdrawal haijaidhinishwa."
                    );

                }


                const userRef =
                    db.collection(
                        "users"
                    )
                    .doc(
                        withdrawal.userId
                    );


                const userSnap =
                    await transaction.get(
                        userRef
                    );


                if (
                    !userSnap.exists
                ) {

                    throw new Error(
                        "User haijapatikana."
                    );

                }


                const userData =
                    userSnap.data();


                const balance =
                    Number(
                        userData.commissionBalance || 0
                    );


                /*
                 * CHECK BALANCE
                 */

                if (

                    balance <
                    Number(
                        withdrawal.amount || 0
                    )

                ) {

                    throw new Error(
                        "Balance haitoshi."
                    );

                }


                /*
                 * UPDATE USER
                 */

                transaction.update(

                    userRef,

                    {

                        commissionBalance:

                            balance -

                            Number(
                                withdrawal.amount || 0
                            ),

                        totalWithdrawn:

                            Number(
                                userData.totalWithdrawn || 0
                            ) +

                            Number(
                                withdrawal.amount || 0
                            ),

                        updatedAt:

                            firebase.firestore
                                .FieldValue
                                .serverTimestamp()

                    }

                );


                /*
                 * UPDATE WITHDRAWAL
                 */

                transaction.update(

                    withdrawalRef,

                    {

                        status:
                            "Paid",

                        transactionReference:
                            reference.trim(),

                        paidAt:

                            firebase.firestore
                                .FieldValue
                                .serverTimestamp(),

                        updatedAt:

                            firebase.firestore
                                .FieldValue
                                .serverTimestamp()

                    }

                );

            }
        );


        /*
         * GET UPDATED DATA
         */

        const withdrawalSnap =
            await withdrawalRef.get();


        if (
            withdrawalSnap.exists
        ) {

            const withdrawal =
                withdrawalSnap.data();


            if (
                typeof createNotification ===
                "function"
            ) {

                await createNotification(

                    withdrawal.userId,

                    "Withdrawal Paid",

                    `Withdrawal yako ya TSh ${formatWithdrawalMoneySehemu13(
                        withdrawal.amount
                    )} imelipwa. Reference: ${reference.trim()}`

                );

            }

        }


        alert(
            "✅ Withdrawal imewekwa Paid."
        );


        return true;


    } catch (error) {

        console.error(
            "Mark paid error:",
            error
        );


        alert(
            "❌ " +
            error.message
        );


        return false;
    }
}


/* =========================================================
   13.13 ADMIN REJECT WITHDRAWAL
========================================================= */

async function rejectWithdrawalSehemu13(
    withdrawalId
) {

    const reason =
        prompt(
            "Andika sababu ya kukataa withdrawal:"
        );


    if (
        reason === null
    ) {

        return;

    }


    try {

        const withdrawalRef =
            db.collection(
                "withdrawals"
            )
            .doc(withdrawalId);


        const withdrawalSnap =
            await withdrawalRef.get();


        if (
            !withdrawalSnap.exists
        ) {

            throw new Error(
                "Withdrawal haijapatikana."
            );

        }


        const withdrawal =
            withdrawalSnap.data();


        if (

            withdrawal.status !==
            "Pending"

            &&

            withdrawal.status !==
            "Approved"

        ) {

            throw new Error(
                "Withdrawal hii haiwezi kukataliwa sasa."
            );

        }


        await withdrawalRef.update({

            status:
                "Rejected",

            adminNote:
                reason.trim(),

            rejectedAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp(),

            updatedAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp()

        });


        /*
         * NOTIFICATION
         */

        if (
            typeof createNotification ===
            "function"
        ) {

            await createNotification(

                withdrawal.userId,

                "Withdrawal Rejected",

                reason.trim()

                    ?

                    `Withdrawal yako imekataliwa: ${reason.trim()}`

                    :

                    "Withdrawal yako imekataliwa."

            );

        }


        alert(
            "Withdrawal imekataliwa."
        );


        return true;


    } catch (error) {

        console.error(
            "Reject withdrawal error:",
            error
        );


        alert(
            "❌ " +
            error.message
        );


        return false;
    }
}


/* =========================================================
   13.14 CONNECT WITHDRAWAL BUTTON
========================================================= */

function connectWithdrawalButtonSehemu13() {

    const button =
        document.getElementById(
            "withdrawalBtn"
        );


    if (!button) {
        return;
    }


    const newButton =
        button.cloneNode(
            true
        );


    button.parentNode.replaceChild(

        newButton,

        button

    );


    newButton.addEventListener(
        "click",

        async function() {

            await funguaWithdrawalSehemu13();

        }

    );

}


/* =========================================================
   13.15 CLOSE WITHDRAWAL
========================================================= */

function fungaWithdrawalSehemu13() {

    const section =
        document.getElementById(
            "taarifaSection"
        );


    if (section) {

        section.style.display =
            "none";


        section.innerHTML =
            "";

    }


    const vyumba =
        document.getElementById(
            "vyumba"
        );


    if (vyumba) {

        vyumba.style.display =
            "block";

    }

}


/* =========================================================
   13.16 INITIALIZE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",

    function() {

        try {

            connectWithdrawalButtonSehemu13();


            console.log(
                "✅ Sehemu ya 13 tayari."
            );


        } catch (error) {

            console.error(
                "Sehemu 13 error:",
                error
            );

        }

    }

);


/* =========================================================
   13.17 WINDOW EXPORTS
========================================================= */

window.funguaWithdrawalSehemu13 =
    funguaWithdrawalSehemu13;


window.ombaWithdrawalSehemu13 =
    ombaWithdrawalSehemu13;


window.onyeshaWithdrawalHistorySehemu13 =
    onyeshaWithdrawalHistorySehemu13;


window.approveWithdrawalSehemu13 =
    approveWithdrawalSehemu13;


window.markWithdrawalPaidSehemu13 =
    markWithdrawalPaidSehemu13;


window.rejectWithdrawalSehemu13 =
    rejectWithdrawalSehemu13;


window.fungaWithdrawalSehemu13 =
    fungaWithdrawalSehemu13;


/* =========================================================
   SEHEMU YA 13 IMEISHIA HAPA
========================================================= *//* =========================================================
   ROOMRENT - SEHEMU YA 13
   WITHDRAWAL SYSTEM
   FIRESTORE + ADMIN APPROVAL
========================================================= */


/* =========================================================
   13.1 WITHDRAWAL SETTINGS
========================================================= */

const ROOMRENT_WITHDRAWAL_SETTINGS = {

    minimumAmount: 1000,

    methods: [

        "Airtel Money",

        "MIXX BY YAS"

    ]

};


/* =========================================================
   13.2 FORMAT WITHDRAWAL MONEY
========================================================= */

function formatWithdrawalMoneySehemu13(
    amount
) {

    return Number(
        amount || 0
    ).toLocaleString(
        "en-US"
    );
}


/* =========================================================
   13.3 GET USER BALANCE
========================================================= */

async function getWithdrawalBalanceSehemu13(
    userId
) {

    try {

        const userSnap =
            await db.collection(
                "users"
            )
            .doc(userId)
            .get();


        if (!userSnap.exists) {
            return 0;
        }


        const userData =
            userSnap.data();


        return Number(
            userData.commissionBalance || 0
        );


    } catch (error) {

        console.error(
            "Withdrawal balance error:",
            error
        );

        return 0;
    }
}


/* =========================================================
   13.4 GET PENDING WITHDRAWAL TOTAL
========================================================= */

async function getPendingWithdrawalTotalSehemu13(
    userId
) {

    try {

        const snapshot =
            await db.collection(
                "withdrawals"
            )
            .where(
                "userId",
                "==",
                userId
            )
            .get();


        let total =
            0;


        snapshot.forEach(
            doc => {

                const data =
                    doc.data();


                if (

                    data.status ===
                    "Pending"

                    ||

                    data.status ===
                    "Approved"

                    ||

                    data.status ===
                    "Processing"

                ) {

                    total += Number(
                        data.amount || 0
                    );

                }

            }
        );


        return total;


    } catch (error) {

        console.error(
            "Pending withdrawal error:",
            error
        );

        return 0;
    }
}


/* =========================================================
   13.5 OPEN WITHDRAWAL PAGE
========================================================= */

async function funguaWithdrawalSehemu13() {

    const user =
        auth.currentUser;


    if (!user) {

        alert(
            "🔐 Tafadhali ingia kwanza."
        );

        return;

    }


    const section =
        document.getElementById(
            "taarifaSection"
        );


    if (!section) {
        return;
    }


    const vyumba =
        document.getElementById(
            "vyumba"
        );


    const fomuKodi =
        document.getElementById(
            "fomuKodi"
        );


    if (vyumba) {

        vyumba.style.display =
            "none";

    }


    if (fomuKodi) {

        fomuKodi.style.display =
            "none";

    }


    section.style.display =
        "block";


    section.innerHTML = `

        <div class="booking-card">

            <h2>
                💸 Withdrawal
            </h2>

            <p>
                ⏳ Inapakia balance...
            </p>

        </div>

    `;


    const balance =
        await getWithdrawalBalanceSehemu13(
            user.uid
        );


    const pending =
        await getPendingWithdrawalTotalSehemu13(
            user.uid
        );


    const available =
        Math.max(
            0,
            balance - pending
        );


    section.innerHTML = `

        <div class="booking-card">

            <button
                class="endeleaBtn"
                onclick="fungaWithdrawalSehemu13()"
            >
                ← Rudi
            </button>


            <h2>
                💸 Withdrawal
            </h2>


            <div style="
                padding:15px;
                border-radius:12px;
                border:1px solid #ddd;
                margin:15px 0;
            ">

                <p>
                    💰 Commission Balance
                </p>

                <h2>
                    TSh ${formatWithdrawalMoneySehemu13(
                        balance
                    )}
                </h2>

            </div>


            <div style="
                padding:15px;
                border-radius:12px;
                border:1px solid #ddd;
                margin:15px 0;
            ">

                <p>
                    ⏳ Pending Withdrawal
                </p>

                <h3>
                    TSh ${formatWithdrawalMoneySehemu13(
                        pending
                    )}
                </h3>

            </div>


            <div style="
                padding:15px;
                border-radius:12px;
                border:1px solid #ddd;
                margin:15px 0;
            ">

                <p>
                    ✅ Available to Withdraw
                </p>

                <h2>
                    TSh ${formatWithdrawalMoneySehemu13(
                        available
                    )}
                </h2>

            </div>


            <hr>


            <h3>
                Omba Withdrawal
            </h3>


            <input
                type="number"
                id="withdrawAmount"
                placeholder="Kiasi unachotaka kutoa"
                min="${ROOMRENT_WITHDRAWAL_SETTINGS.minimumAmount}"
            >


            <select
                id="withdrawMethod"
            >

                <option value="">
                    Chagua njia ya malipo
                </option>

                <option value="Airtel Money">
                    Airtel Money
                </option>

                <option value="MIXX BY YAS">
                    MIXX BY YAS
                </option>

            </select>


            <input
                type="tel"
                id="withdrawPhone"
                placeholder="Namba ya kupokea pesa"
            >


            <button
                class="thibitishaBtn"
                onclick="ombaWithdrawalSehemu13()"
            >

                💸 Omba Withdrawal

            </button>


            <p
                id="withdrawMessage"
            ></p>


            <hr>


            <button
                class="endeleaBtn"
                onclick="onyeshaWithdrawalHistorySehemu13()"
            >

                📋 Withdrawal Zangu

            </button>

        </div>

    `;

}


/* =========================================================
   13.6 FORMAT TANZANIA PHONE
========================================================= */

function formatWithdrawalPhoneSehemu13(
    phone
) {

    let clean =
        String(
            phone || ""
        )
        .replace(
            /\s+/g,
            ""
        )
        .replace(
            /-/g,
            ""
        );


    if (
        clean.startsWith(
            "+255"
        )
    ) {

        clean =
            "255" +
            clean.substring(
                4
            );

    }


    if (
        clean.startsWith(
            "0"
        )
    ) {

        clean =
            "255" +
            clean.substring(
                1
            );

    }


    if (
        clean.length === 12 &&
        clean.startsWith(
            "255"
        )
    ) {

        return clean;

    }


    return null;
}


/* =========================================================
   13.7 REQUEST WITHDRAWAL
========================================================= */

async function ombaWithdrawalSehemu13() {

    const user =
        auth.currentUser;


    if (!user) {

        alert(
            "🔐 Tafadhali ingia kwanza."
        );

        return;

    }


    const amountInput =
        document.getElementById(
            "withdrawAmount"
        );


    const methodInput =
        document.getElementById(
            "withdrawMethod"
        );


    const phoneInput =
        document.getElementById(
            "withdrawPhone"
        );


    const message =
        document.getElementById(
            "withdrawMessage"
        );


    const amount =
        Number(
            amountInput
                ? amountInput.value
                : 0
        );


    const method =
        methodInput
            ? methodInput.value
            : "";


    const phone =
        formatWithdrawalPhoneSehemu13(

            phoneInput
                ? phoneInput.value
                : ""

        );


    /*
     * VALIDATE AMOUNT
     */

    if (

        !amount ||

        amount <
        ROOMRENT_WITHDRAWAL_SETTINGS
            .minimumAmount

    ) {

        if (message) {

            message.innerHTML =

                `❌ Kiasi cha chini cha withdrawal ni TSh ${formatWithdrawalMoneySehemu13(
                    ROOMRENT_WITHDRAWAL_SETTINGS
                        .minimumAmount
                )}`;

        }

        return;

    }


    /*
     * VALIDATE METHOD
     */

    if (
        !method
    ) {

        if (message) {

            message.innerHTML =
                "❌ Chagua njia ya kupokea pesa.";

        }

        return;

    }


    /*
     * VALIDATE PHONE
     */

    if (
        !phone
    ) {

        if (message) {

            message.innerHTML =
                "❌ Weka namba sahihi ya Tanzania.";

        }

        return;

    }


    if (message) {

        message.innerHTML =
            "⏳ Inatuma ombi...";

    }


    try {

        /*
         * GET USER DATA
         */

        const userSnap =
            await db.collection(
                "users"
            )
            .doc(user.uid)
            .get();


        if (!userSnap.exists) {

            throw new Error(
                "User data haijapatikana."
            );

        }


        const userData =
            userSnap.data();


        const balance =
            Number(
                userData.commissionBalance || 0
            );


        const pending =
            await getPendingWithdrawalTotalSehemu13(
                user.uid
            );


        const available =
            Math.max(
                0,
                balance - pending
            );


        /*
         * CHECK BALANCE
         */

        if (
            amount > available
        ) {

            throw new Error(
                "Kiasi unachoomba kinazidi balance yako."
            );

        }


        /*
         * CREATE WITHDRAWAL
         */

        const withdrawalRef =
            db.collection(
                "withdrawals"
            )
            .doc();


        await withdrawalRef.set({

            withdrawalId:
                withdrawalRef.id,

            userId:
                user.uid,

            userName:
                userData.name || "",

            userEmail:
                user.email || "",

            amount:
                amount,

            method:
                method,

            phone:
                phone,

            status:
                "Pending",

            adminNote:
                "",

            transactionReference:
                "",

            createdAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp(),

            updatedAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp()

        });


        /*
         * NOTIFICATION
         */

        if (
            typeof createNotification ===
            "function"
        ) {

            await createNotification(

                user.uid,

                "Withdrawal Requested",

                `Ombi lako la withdrawal ya TSh ${formatWithdrawalMoneySehemu13(
                    amount
                )} limepokelewa.`

            );

        }


        if (message) {

            message.style.color =
                "green";


            message.innerHTML =

                `✅ Ombi lako la TSh ${formatWithdrawalMoneySehemu13(
                    amount
                )} limepokelewa. Linangoja uthibitisho wa Admin.`;

        }


        if (amountInput) {

            amountInput.value =
                "";

        }


        if (phoneInput) {

            phoneInput.value =
                "";

        }


    } catch (error) {

        console.error(
            "Withdrawal request error:",
            error
        );


        if (message) {

            message.style.color =
                "red";


            message.innerHTML =

                "❌ " +
                error.message;

        }

    }

}


/* =========================================================
   13.8 GET USER WITHDRAWALS
========================================================= */

async function getUserWithdrawalsSehemu13(
    userId
) {

    try {

        const snapshot =
            await db.collection(
                "withdrawals"
            )
            .where(
                "userId",
                "==",
                userId
            )
            .get();


        const withdrawals =
            [];


        snapshot.forEach(
            doc => {

                withdrawals.push({

                    id:
                        doc.id,

                    ...doc.data()

                });

            }
        );


        withdrawals.sort(
            (a, b) => {

                const timeA =
                    a.createdAt &&
                    typeof a.createdAt.toDate ===
                    "function"

                        ?

                        a.createdAt
                            .toDate()
                            .getTime()

                        :

                        0;


                const timeB =
                    b.createdAt &&
                    typeof b.createdAt.toDate ===
                    "function"

                        ?

                        b.createdAt
                            .toDate()
                            .getTime()

                        :

                        0;


                return timeB -
                    timeA;

            }
        );


        return withdrawals;


    } catch (error) {

        console.error(
            "Get withdrawals error:",
            error
        );

        return [];
    }
}


/* =========================================================
   13.9 SHOW WITHDRAWAL HISTORY
========================================================= */

async function onyeshaWithdrawalHistorySehemu13() {

    const user =
        auth.currentUser;


    if (!user) {

        alert(
            "🔐 Tafadhali ingia kwanza."
        );

        return;

    }


    const section =
        document.getElementById(
            "taarifaSection"
        );


    if (!section) {
        return;
    }


    section.innerHTML = `

        <div class="booking-card">

            <button
                class="endeleaBtn"
                onclick="funguaWithdrawalSehemu13()"
            >
                ← Rudi Withdrawal
            </button>


            <h2>
                📋 Withdrawal Zangu
            </h2>


            <p>
                ⏳ Inapakia...
            </p>

        </div>

    `;


    const withdrawals =
        await getUserWithdrawalsSehemu13(
            user.uid
        );


    if (
        withdrawals.length === 0
    ) {

        section.innerHTML = `

            <div class="booking-card">

                <button
                    class="endeleaBtn"
                    onclick="funguaWithdrawalSehemu13()"
                >
                    ← Rudi
                </button>


                <h2>
                    📋 Withdrawal Zangu
                </h2>


                <p>
                    Bado hujaomba withdrawal.
                </p>

            </div>

        `;

        return;

    }


    let html = `

        <div class="booking-card">

            <button
                class="endeleaBtn"
                onclick="funguaWithdrawalSehemu13()"
            >
                ← Rudi Withdrawal
            </button>


            <h2>
                📋 Withdrawal Zangu
            </h2>

        </div>

    `;


    withdrawals.forEach(
        withdrawal => {

            let icon =
                "⏳";


            if (
                withdrawal.status ===
                "Paid"
            ) {

                icon =
                    "✅";

            }


            if (
                withdrawal.status ===
                "Rejected"
            ) {

                icon =
                    "❌";

            }


            if (
                withdrawal.status ===
                "Approved"
            ) {

                icon =
                    "👍";

            }


            html += `

                <div
                    class="booking-card"
                    style="
                        margin-bottom:15px;
                    "
                >

                    <h3>

                        ${icon}

                        TSh
                        ${formatWithdrawalMoneySehemu13(
                            withdrawal.amount
                        )}

                    </h3>


                    <p>

                        📱 Njia:

                        <strong>
                            ${escapeHtml(
                                withdrawal.method || "-"
                            )}
                        </strong>

                    </p>


                    <p>

                        📌 Status:

                        <strong>
                            ${escapeHtml(
                                withdrawal.status || "-"
                            )}
                        </strong>

                    </p>


                    <p>

                        🔢 Reference:

                        <strong>
                            ${escapeHtml(
                                withdrawal.transactionReference ||
                                "Bado"
                            )}
                        </strong>

                    </p>


                    ${

                        withdrawal.adminNote

                            ?

                            `

                                <p>

                                    📝 Admin:

                                    ${escapeHtml(
                                        withdrawal.adminNote
                                    )}

                                </p>

                            `

                            :

                            ""

                    }

                </div>

            `;

        }
    );


    section.innerHTML =
        html;

}


/* =========================================================
   13.10 ADMIN GET ALL WITHDRAWALS
========================================================= */

async function getAllWithdrawalsSehemu13() {

    try {

        const snapshot =
            await db.collection(
                "withdrawals"
            )
            .get();


        const withdrawals =
            [];


        snapshot.forEach(
            doc => {

                withdrawals.push({

                    id:
                        doc.id,

                    ...doc.data()

                });

            }
        );


        withdrawals.sort(
            (a, b) => {

                const timeA =
                    a.createdAt &&
                    typeof a.createdAt.toDate ===
                    "function"

                        ?

                        a.createdAt
                            .toDate()
                            .getTime()

                        :

                        0;


                const timeB =
                    b.createdAt &&
                    typeof b.createdAt.toDate ===
                    "function"

                        ?

                        b.createdAt
                            .toDate()
                            .getTime()

                        :

                        0;


                return timeB -
                    timeA;

            }
        );


        return withdrawals;


    } catch (error) {

        console.error(
            "Admin withdrawals error:",
            error
        );

        return [];
    }
}


/* =========================================================
   13.11 ADMIN APPROVE WITHDRAWAL
========================================================= */

async function approveWithdrawalSehemu13(
    withdrawalId
) {

    try {

        const withdrawalRef =
            db.collection(
                "withdrawals"
            )
            .doc(withdrawalId);


        const withdrawalSnap =
            await withdrawalRef.get();


        if (
            !withdrawalSnap.exists
        ) {

            throw new Error(
                "Withdrawal haijapatikana."
            );

        }


        const withdrawal =
            withdrawalSnap.data();


        if (
            withdrawal.status !==
            "Pending"
        ) {

            throw new Error(
                "Withdrawal hii tayari imefanyiwa kazi."
            );

        }


        await withdrawalRef.update({

            status:
                "Approved",

            approvedAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp(),

            updatedAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp()

        });


        /*
         * NOTIFICATION
         */

        if (
            typeof createNotification ===
            "function"
        ) {

            await createNotification(

                withdrawal.userId,

                "Withdrawal Approved",

                `Withdrawal yako ya TSh ${formatWithdrawalMoneySehemu13(
                    withdrawal.amount
                )} imeidhinishwa. Inasubiri malipo.`

            );

        }


        alert(
            "✅ Withdrawal imeidhinishwa."
        );


        return true;


    } catch (error) {

        console.error(
            "Approve withdrawal error:",
            error
        );


        alert(
            "❌ " +
            error.message
        );


        return false;
    }
}


/* =========================================================
   13.12 ADMIN MARK WITHDRAWAL AS PAID
========================================================= */

async function markWithdrawalPaidSehemu13(
    withdrawalId
) {

    const reference =
        prompt(
            "Weka Transaction Reference:"
        );


    if (
        reference === null
    ) {

        return;

    }


    if (
        !reference.trim()
    ) {

        alert(
            "❌ Transaction Reference inahitajika."
        );

        return;

    }


    try {

        const withdrawalRef =
            db.collection(
                "withdrawals"
            )
            .doc(withdrawalId);


        await db.runTransaction(
            async transaction => {

                const withdrawalSnap =
                    await transaction.get(
                        withdrawalRef
                    );


                if (
                    !withdrawalSnap.exists
                ) {

                    throw new Error(
                        "Withdrawal haijapatikana."
                    );

                }


                const withdrawal =
                    withdrawalSnap.data();


                if (

                    withdrawal.status !==
                    "Approved"

                    &&

                    withdrawal.status !==
                    "Processing"

                ) {

                    throw new Error(
                        "Withdrawal haijaidhinishwa."
                    );

                }


                const userRef =
                    db.collection(
                        "users"
                    )
                    .doc(
                        withdrawal.userId
                    );


                const userSnap =
                    await transaction.get(
                        userRef
                    );


                if (
                    !userSnap.exists
                ) {

                    throw new Error(
                        "User haijapatikana."
                    );

                }


                const userData =
                    userSnap.data();


                const balance =
                    Number(
                        userData.commissionBalance || 0
                    );


                /*
                 * CHECK BALANCE
                 */

                if (

                    balance <
                    Number(
                        withdrawal.amount || 0
                    )

                ) {

                    throw new Error(
                        "Balance haitoshi."
                    );

                }


                /*
                 * UPDATE USER
                 */

                transaction.update(

                    userRef,

                    {

                        commissionBalance:

                            balance -

                            Number(
                                withdrawal.amount || 0
                            ),

                        totalWithdrawn:

                            Number(
                                userData.totalWithdrawn || 0
                            ) +

                            Number(
                                withdrawal.amount || 0
                            ),

                        updatedAt:

                            firebase.firestore
                                .FieldValue
                                .serverTimestamp()

                    }

                );


                /*
                 * UPDATE WITHDRAWAL
                 */

                transaction.update(

                    withdrawalRef,

                    {

                        status:
                            "Paid",

                        transactionReference:
                            reference.trim(),

                        paidAt:

                            firebase.firestore
                                .FieldValue
                                .serverTimestamp(),

                        updatedAt:

                            firebase.firestore
                                .FieldValue
                                .serverTimestamp()

                    }

                );

            }
        );


        /*
         * GET UPDATED DATA
         */

        const withdrawalSnap =
            await withdrawalRef.get();


        if (
            withdrawalSnap.exists
        ) {

            const withdrawal =
                withdrawalSnap.data();


            if (
                typeof createNotification ===
                "function"
            ) {

                await createNotification(

                    withdrawal.userId,

                    "Withdrawal Paid",

                    `Withdrawal yako ya TSh ${formatWithdrawalMoneySehemu13(
                        withdrawal.amount
                    )} imelipwa. Reference: ${reference.trim()}`

                );

            }

        }


        alert(
            "✅ Withdrawal imewekwa Paid."
        );


        return true;


    } catch (error) {

        console.error(
            "Mark paid error:",
            error
        );


        alert(
            "❌ " +
            error.message
        );


        return false;
    }
}


/* =========================================================
   13.13 ADMIN REJECT WITHDRAWAL
========================================================= */

async function rejectWithdrawalSehemu13(
    withdrawalId
) {

    const reason =
        prompt(
            "Andika sababu ya kukataa withdrawal:"
        );


    if (
        reason === null
    ) {

        return;

    }


    try {

        const withdrawalRef =
            db.collection(
                "withdrawals"
            )
            .doc(withdrawalId);


        const withdrawalSnap =
            await withdrawalRef.get();


        if (
            !withdrawalSnap.exists
        ) {

            throw new Error(
                "Withdrawal haijapatikana."
            );

        }


        const withdrawal =
            withdrawalSnap.data();


        if (

            withdrawal.status !==
            "Pending"

            &&

            withdrawal.status !==
            "Approved"

        ) {

            throw new Error(
                "Withdrawal hii haiwezi kukataliwa sasa."
            );

        }


        await withdrawalRef.update({

            status:
                "Rejected",

            adminNote:
                reason.trim(),

            rejectedAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp(),

            updatedAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp()

        });


        /*
         * NOTIFICATION
         */

        if (
            typeof createNotification ===
            "function"
        ) {

            await createNotification(

                withdrawal.userId,

                "Withdrawal Rejected",

                reason.trim()

                    ?

                    `Withdrawal yako imekataliwa: ${reason.trim()}`

                    :

                    "Withdrawal yako imekataliwa."

            );

        }


        alert(
            "Withdrawal imekataliwa."
        );


        return true;


    } catch (error) {

        console.error(
            "Reject withdrawal error:",
            error
        );


        alert(
            "❌ " +
            error.message
        );


        return false;
    }
}


/* =========================================================
   13.14 CONNECT WITHDRAWAL BUTTON
========================================================= */

function connectWithdrawalButtonSehemu13() {

    const button =
        document.getElementById(
            "withdrawalBtn"
        );


    if (!button) {
        return;
    }


    const newButton =
        button.cloneNode(
            true
        );


    button.parentNode.replaceChild(

        newButton,

        button

    );


    newButton.addEventListener(
        "click",

        async function() {

            await funguaWithdrawalSehemu13();

        }

    );

}


/* =========================================================
   13.15 CLOSE WITHDRAWAL
========================================================= */

function fungaWithdrawalSehemu13() {

    const section =
        document.getElementById(
            "taarifaSection"
        );


    if (section) {

        section.style.display =
            "none";


        section.innerHTML =
            "";

    }


    const vyumba =
        document.getElementById(
            "vyumba"
        );


    if (vyumba) {

        vyumba.style.display =
            "block";

    }

}


/* =========================================================
   13.16 INITIALIZE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",

    function() {

        try {

            connectWithdrawalButtonSehemu13();


            console.log(
                "✅ Sehemu ya 13 tayari."
            );


        } catch (error) {

            console.error(
                "Sehemu 13 error:",
                error
            );

        }

    }

);


/* =========================================================
   13.17 WINDOW EXPORTS
========================================================= */

window.funguaWithdrawalSehemu13 =
    funguaWithdrawalSehemu13;


window.ombaWithdrawalSehemu13 =
    ombaWithdrawalSehemu13;


window.onyeshaWithdrawalHistorySehemu13 =
    onyeshaWithdrawalHistorySehemu13;


window.approveWithdrawalSehemu13 =
    approveWithdrawalSehemu13;


window.markWithdrawalPaidSehemu13 =
    markWithdrawalPaidSehemu13;


window.rejectWithdrawalSehemu13 =
    rejectWithdrawalSehemu13;


window.fungaWithdrawalSehemu13 =
    fungaWithdrawalSehemu13;


/* =========================================================
   SEHEMU YA 13 IMEISHIA HAPA
========================================================= */
/* =========================================================
   ROOMRENT - SEHEMU YA 14
   ADMIN DASHBOARD
   FIRESTORE
========================================================= */


/* =========================================================
   14.1 ADMIN SESSION CHECK
========================================================= */

function isAdminSehemu14() {

    return (
        sessionStorage.getItem(
            "roomrentAdmin"
        ) === "true"
    );

}


/* =========================================================
   14.2 REQUIRE ADMIN
========================================================= */

function requireAdminSehemu14() {

    if (
        !isAdminSehemu14()
    ) {

        alert(
            "❌ Huna ruhusa ya Admin."
        );

        return false;
    }

    return true;

}


/* =========================================================
   14.3 GET FIRESTORE COLLECTION
========================================================= */

async function getCollectionDataSehemu14(
    collectionName
) {

    try {

        const snapshot =
            await db.collection(
                collectionName
            ).get();


        const data = [];


        snapshot.forEach(
            doc => {

                data.push({

                    id: doc.id,

                    ...doc.data()

                });

            }
        );


        return data;


    } catch (error) {

        console.error(
            "Collection error:",
            collectionName,
            error
        );

        return [];
    }

}


/* =========================================================
   14.4 ADMIN STATISTICS
========================================================= */

async function getAdminStatisticsSehemu14() {

    try {

        const [

            users,

            rooms,

            bookings,

            withdrawals

        ] = await Promise.all([

            getCollectionDataSehemu14(
                "users"
            ),

            getCollectionDataSehemu14(
                "rooms"
            ),

            getCollectionDataSehemu14(
                "bookings"
            ),

            getCollectionDataSehemu14(
                "withdrawals"
            )

        ]);


        let totalBookingAmount = 0;

        let activeBookings = 0;

        let completedBookings = 0;

        let pendingPayments = 0;

        let totalWithdrawals = 0;

        let pendingWithdrawals = 0;

        let totalCommission = 0;


        bookings.forEach(
            booking => {

                totalBookingAmount +=
                    Number(
                        booking.roomPrice || 0
                    );


                if (
                    booking.status ===
                    "Active"
                ) {

                    activeBookings++;

                }


                if (
                    booking.status ===
                    "Completed"
                ) {

                    completedBookings++;

                }


                if (

                    booking.paymentStatus ===
                    "Pending"

                    ||

                    booking.paymentStatus ===
                    "Requested"

                ) {

                    pendingPayments++;

                }

            }
        );


        withdrawals.forEach(
            withdrawal => {

                if (
                    withdrawal.status ===
                    "Paid"
                ) {

                    totalWithdrawals +=
                        Number(
                            withdrawal.amount || 0
                        );

                }


                if (

                    withdrawal.status ===
                    "Pending"

                    ||

                    withdrawal.status ===
                    "Approved"

                    ||

                    withdrawal.status ===
                    "Processing"

                ) {

                    pendingWithdrawals++;

                }

            }
        );


        users.forEach(
            user => {

                totalCommission +=
                    Number(
                        user.commissionBalance || 0
                    );

            }
        );


        return {

            totalUsers:
                users.length,

            totalRooms:
                rooms.length,

            totalBookings:
                bookings.length,

            activeBookings:
                activeBookings,

            completedBookings:
                completedBookings,

            pendingPayments:
                pendingPayments,

            totalBookingAmount:
                totalBookingAmount,

            totalWithdrawals:
                totalWithdrawals,

            pendingWithdrawals:
                pendingWithdrawals,

            totalCommission:
                totalCommission

        };


    } catch (error) {

        console.error(
            "Statistics error:",
            error
        );


        return {

            totalUsers: 0,

            totalRooms: 0,

            totalBookings: 0,

            activeBookings: 0,

            completedBookings: 0,

            pendingPayments: 0,

            totalBookingAmount: 0,

            totalWithdrawals: 0,

            pendingWithdrawals: 0,

            totalCommission: 0

        };

    }

}


/* =========================================================
   14.5 OPEN ADMIN DASHBOARD
========================================================= */

async function funguaAdminDashboardSehemu14() {

    if (
        !requireAdminSehemu14()
    ) {

        return;

    }


    const section =
        document.getElementById(
            "taarifaSection"
        );


    if (!section) {
        return;
    }


    /*
     * HIDE OTHER SECTIONS
     */

    const vyumba =
        document.getElementById(
            "vyumba"
        );


    const fomuKodi =
        document.getElementById(
            "fomuKodi"
        );


    if (vyumba) {

        vyumba.style.display =
            "none";

    }


    if (fomuKodi) {

        fomuKodi.style.display =
            "none";

    }


    section.style.display =
        "block";


    section.innerHTML = `

        <div class="booking-card">

            <h2>
                🔐 Admin Dashboard
            </h2>

            <p>
                ⏳ Inapakia taarifa...
            </p>

        </div>

    `;


    const stats =
        await getAdminStatisticsSehemu14();


    section.innerHTML = `

        <div class="booking-card">

            <h2>
                🔐 RoomRent Admin Dashboard
            </h2>


            <p>
                Karibu kwenye mfumo wa Admin.
            </p>


            <!-- STATISTICS -->

            <div style="
                display:grid;
                grid-template-columns:
                repeat(
                    auto-fit,
                    minmax(
                        140px,
                        1fr
                    )
                );
                gap:10px;
                margin-top:20px;
            ">


                <div style="
                    border:1px solid #ddd;
                    padding:15px;
                    border-radius:10px;
                ">

                    👥 Users

                    <h2>
                        ${stats.totalUsers}
                    </h2>

                </div>


                <div style="
                    border:1px solid #ddd;
                    padding:15px;
                    border-radius:10px;
                ">

                    🏠 Vyumba

                    <h2>
                        ${stats.totalRooms}
                    </h2>

                </div>


                <div style="
                    border:1px solid #ddd;
                    padding:15px;
                    border-radius:10px;
                ">

                    📋 Bookings

                    <h2>
                        ${stats.totalBookings}
                    </h2>

                </div>


                <div style="
                    border:1px solid #ddd;
                    padding:15px;
                    border-radius:10px;
                ">

                    🟢 Active

                    <h2>
                        ${stats.activeBookings}
                    </h2>

                </div>


                <div style="
                    border:1px solid #ddd;
                    padding:15px;
                    border-radius:10px;
                ">

                    🏁 Completed

                    <h2>
                        ${stats.completedBookings}
                    </h2>

                </div>


                <div style="
                    border:1px solid #ddd;
                    padding:15px;
                    border-radius:10px;
                ">

                    ⏳ Payments

                    <h2>
                        ${stats.pendingPayments}
                    </h2>

                </div>


                <div style="
                    border:1px solid #ddd;
                    padding:15px;
                    border-radius:10px;
                ">

                    💸 Pending

                    <h2>
                        ${stats.pendingWithdrawals}
                    </h2>

                </div>


                <div style="
                    border:1px solid #ddd;
                    padding:15px;
                    border-radius:10px;
                ">

                    💰 Booking

                    <h3>
                        TSh
                        ${formatWithdrawalMoneySehemu13(
                            stats.totalBookingAmount
                        )}
                    </h3>

                </div>


                <div style="
                    border:1px solid #ddd;
                    padding:15px;
                    border-radius:10px;
                ">

                    💸 Paid

                    <h3>
                        TSh
                        ${formatWithdrawalMoneySehemu13(
                            stats.totalWithdrawals
                        )}
                    </h3>

                </div>


                <div style="
                    border:1px solid #ddd;
                    padding:15px;
                    border-radius:10px;
                ">

                    💰 Commission

                    <h3>
                        TSh
                        ${formatWithdrawalMoneySehemu13(
                            stats.totalCommission
                        )}
                    </h3>

                </div>

            </div>


            <hr>


            <!-- ADMIN MENU -->

            <h3>
                ⚙️ Admin Menu
            </h3>


            <button
                class="thibitishaBtn"
                onclick="onyeshaAdminBookingsSehemu14()"
            >

                📋 Manage Bookings

            </button>


            <button
                class="thibitishaBtn"
                onclick="onyeshaAdminPaymentsSehemu14()"
            >

                💳 Payment Requests

            </button>


            <button
                class="thibitishaBtn"
                onclick="onyeshaAdminWithdrawalsSehemu14()"
            >

                💸 Withdrawals

            </button>


            <button
                class="thibitishaBtn"
                onclick="onyeshaAdminUsersSehemu14()"
            >

                👥 Users

            </button>


            <button
                class="thibitishaBtn"
                onclick="onyeshaAdminRoomsSehemu14()"
            >

                🏠 Manage Rooms

            </button>


            <button
                class="endeleaBtn"
                onclick="refreshAdminDashboardSehemu14()"
            >

                🔄 Refresh

            </button>


            <button
                class="endeleaBtn"
                onclick="adminLogoutSehemu14()"
            >

                🚪 Logout Admin

            </button>

        </div>

    `;


    section.scrollIntoView({

        behavior:
            "smooth"

    });

}


/* =========================================================
   14.6 REFRESH DASHBOARD
========================================================= */

async function refreshAdminDashboardSehemu14() {

    await funguaAdminDashboardSehemu14();

}


/* =========================================================
   14.7 SHOW ADMIN BOOKINGS
========================================================= */

async function onyeshaAdminBookingsSehemu14() {

    if (
        !requireAdminSehemu14()
    ) {

        return;

    }


    const section =
        document.getElementById(
            "taarifaSection"
        );


    if (!section) {
        return;
    }


    section.innerHTML = `

        <div class="booking-card">

            <button
                class="endeleaBtn"
                onclick="funguaAdminDashboardSehemu14()"
            >

                ← Dashboard

            </button>


            <h2>
                📋 All Bookings
            </h2>


            <p>
                ⏳ Inapakia...
            </p>

        </div>

    `;


    const bookings =
        await getCollectionDataSehemu14(
            "bookings"
        );


    if (
        bookings.length === 0
    ) {

        section.innerHTML = `

            <div class="booking-card">

                <button
                    class="endeleaBtn"
                    onclick="funguaAdminDashboardSehemu14()"
                >

                    ← Dashboard

                </button>


                <h2>
                    📋 All Bookings
                </h2>


                <p>
                    Bado hakuna booking.
                </p>

            </div>

        `;

        return;

    }


    let html = `

        <div class="booking-card">

            <button
                class="endeleaBtn"
                onclick="funguaAdminDashboardSehemu14()"
            >

                ← Dashboard

            </button>


            <h2>
                📋 All Bookings
            </h2>

        </div>

    `;


    bookings.forEach(
        booking => {

            html += `

                <div
                    class="booking-card"
                    style="
                        margin-bottom:15px;
                    "
                >

                    <h3>
                        🏠 Chumba
                        ${escapeHtml(
                            booking.roomNumber || "-"
                        )}
                    </h3>


                    <p>
                        👤
                        ${escapeHtml(
                            booking.userName || "-"
                        )}
                    </p>


                    <p>
                        📧
                        ${escapeHtml(
                            booking.userEmail || "-"
                        )}
                    </p>


                    <p>

                        💰 TSh
                        ${formatWithdrawalMoneySehemu13(
                            booking.roomPrice
                        )}

                    </p>


                    <p>

                        📌 Status:

                        <strong>
                            ${escapeHtml(
                                booking.status || "-"
                            )}
                        </strong>

                    </p>


                    <p>

                        💳 Payment:

                        <strong>
                            ${escapeHtml(
                                booking.paymentStatus || "-"
                            )}
                        </strong>

                    </p>


                    <button
                        class="thibitishaBtn"
                        onclick="adminViewBookingSehemu14('${booking.id}')"
                    >

                        👁️ Details

                    </button>

                </div>

            `;

        }
    );


    section.innerHTML =
        html;

}


/* =========================================================
   14.8 ADMIN BOOKING DETAILS
========================================================= */

async function adminViewBookingSehemu14(
    bookingId
) {

    if (
        !requireAdminSehemu14()
    ) {

        return;

    }


    const bookingSnap =
        await db.collection(
            "bookings"
        )
        .doc(
            bookingId
        )
        .get();


    if (
        !bookingSnap.exists
    ) {

        alert(
            "❌ Booking haijapatikana."
        );

        return;

    }


    const booking = {

        id:
            bookingSnap.id,

        ...bookingSnap.data()

    };


    const section =
        document.getElementById(
            "taarifaSection"
        );


    section.innerHTML = `

        <div class="booking-card">

            <button
                class="endeleaBtn"
                onclick="onyeshaAdminBookingsSehemu14()"
            >

                ← Bookings

            </button>


            <h2>
                📋 Booking Details
            </h2>


            <p>

                🏠 Room:

                <strong>
                    ${escapeHtml(
                        booking.roomNumber || "-"
                    )}
                </strong>

            </p>


            <p>

                👤 User:

                <strong>
                    ${escapeHtml(
                        booking.userName || "-"
                    )}
                </strong>

            </p>


            <p>

                📧 Email:

                <strong>
                    ${escapeHtml(
                        booking.userEmail || "-"
                    )}
                </strong>

            </p>


            <p>

                💰 Amount:

                <strong>

                    TSh
                    ${formatWithdrawalMoneySehemu13(
                        booking.roomPrice
                    )}

                </strong>

            </p>


            <p>

                📌 Booking Status:

                <strong>
                    ${escapeHtml(
                        booking.status || "-"
                    )}
                </strong>

            </p>


            <p>

                💳 Payment Status:

                <strong>
                    ${escapeHtml(
                        booking.paymentStatus || "-"
                    )}
                </strong>

            </p>


            <p>

                📱 Payment Phone:

                <strong>
                    ${escapeHtml(
                        booking.paymentPhone || "-"
                    )}
                </strong>

            </p>


            <hr>


            <button
                class="thibitishaBtn"
                onclick="adminConfirmBookingPaymentSehemu14('${booking.id}')"
            >

                ✅ Confirm Payment

            </button>


            <button
                class="endeleaBtn"
                onclick="adminRejectBookingPaymentSehemu14('${booking.id}')"
            >

                ❌ Reject Payment

            </button>

        </div>

    `;

}


/* =========================================================
   14.9 ADMIN CONFIRM BOOKING PAYMENT
========================================================= */

async function adminConfirmBookingPaymentSehemu14(
    bookingId
) {

    if (
        !requireAdminSehemu14()
    ) {

        return;

    }


    try {

        const bookingRef =
            db.collection(
                "bookings"
            )
            .doc(
                bookingId
            );


        const bookingSnap =
            await bookingRef.get();


        if (
            !bookingSnap.exists
        ) {

            throw new Error(
                "Booking haijapatikana."
            );

        }


        const booking =
            bookingSnap.data();


        await bookingRef.update({

            paymentStatus:
                "Confirmed",

            status:
                "Active",

            startDate:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp(),

            paymentConfirmedAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp(),

            updatedAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp()

        });


        alert(
            "✅ Malipo yamethibitishwa. Booking imeanza."
        );


        await adminViewBookingSehemu14(
            bookingId
        );


    } catch (error) {

        console.error(
            error
        );


        alert(
            "❌ " +
            error.message
        );

    }

}


/* =========================================================
   14.10 ADMIN REJECT PAYMENT
========================================================= */

async function adminRejectBookingPaymentSehemu14(
    bookingId
) {

    if (
        !requireAdminSehemu14()
    ) {

        return;

    }


    const reason =
        prompt(
            "Sababu ya kukataa malipo:"
        );


    if (
        reason === null
    ) {

        return;

    }


    try {

        await db.collection(
            "bookings"
        )
        .doc(
            bookingId
        )
        .update({

            paymentStatus:
                "Rejected",

            status:
                "Payment Rejected",

            adminNote:
                reason.trim(),

            updatedAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp()

        });


        alert(
            "❌ Malipo yamekataliwa."
        );


        await adminViewBookingSehemu14(
            bookingId
        );


    } catch (error) {

        alert(
            "❌ " +
            error.message
        );

    }

}


/* =========================================================
   14.11 SHOW ADMIN PAYMENTS
========================================================= */

async function onyeshaAdminPaymentsSehemu14() {

    if (
        !requireAdminSehemu14()
    ) {

        return;

    }


    await onyeshaAdminBookingsSehemu14();

}


/* =========================================================
   14.12 SHOW ADMIN WITHDRAWALS
========================================================= */

async function onyeshaAdminWithdrawalsSehemu14() {

    if (
        !requireAdminSehemu14()
    ) {

        return;

    }


    const section =
        document.getElementById(
            "taarifaSection"
        );


    section.innerHTML = `

        <div class="booking-card">

            <button
                class="endeleaBtn"
                onclick="funguaAdminDashboardSehemu14()"
            >

                ← Dashboard

            </button>


            <h2>
                💸 Withdrawals
            </h2>


            <p>
                ⏳ Inapakia...
            </p>

        </div>

    `;


    const withdrawals =
        await getAllWithdrawalsSehemu13();


    let html = `

        <div class="booking-card">

            <button
                class="endeleaBtn"
                onclick="funguaAdminDashboardSehemu14()"
            >

                ← Dashboard

            </button>


            <h2>
                💸 All Withdrawals
            </h2>

        </div>

    `;


    if (
        withdrawals.length === 0
    ) {

        html += `

            <div class="booking-card">

                <p>
                    Hakuna withdrawal.
                </p>

            </div>

        `;

    }


    withdrawals.forEach(
        withdrawal => {

            html += `

                <div
                    class="booking-card"
                    style="
                        margin-bottom:15px;
                    "
                >

                    <h3>

                        💸 TSh
                        ${formatWithdrawalMoneySehemu13(
                            withdrawal.amount
                        )}

                    </h3>


                    <p>

                        👤
                        ${escapeHtml(
                            withdrawal.userName || "-"
                        )}

                    </p>


                    <p>

                        📱
                        ${escapeHtml(
                            withdrawal.phone || "-"
                        )}

                    </p>


                    <p>

                        💳
                        ${escapeHtml(
                            withdrawal.method || "-"
                        )}

                    </p>


                    <p>

                        📌 Status:

                        <strong>
                            ${escapeHtml(
                                withdrawal.status || "-"
                            )}
                        </strong>

                    </p>


                    ${

                        withdrawal.status ===
                        "Pending"

                            ?

                            `

                                <button
                                    class="thibitishaBtn"
                                    onclick="approveWithdrawalSehemu13('${withdrawal.id}')"
                                >

                                    ✅ Approve

                                </button>


                                <button
                                    class="endeleaBtn"
                                    onclick="rejectWithdrawalSehemu13('${withdrawal.id}')"
                                >

                                    ❌ Reject

                                </button>

                            `

                            :

                            ""

                    }


                    ${

                        withdrawal.status ===
                        "Approved"

                            ?

                            `

                                <button
                                    class="thibitishaBtn"
                                    onclick="markWithdrawalPaidSehemu13('${withdrawal.id}')"
                                >

                                    💰 Mark Paid

                                </button>

                            `

                            :

                            ""

                    }

                </div>

            `;

        }
    );


    section.innerHTML =
        html;

}


/* =========================================================
   14.13 SHOW ADMIN USERS
========================================================= */

async function onyeshaAdminUsersSehemu14() {

    if (
        !requireAdminSehemu14()
    ) {

        return;

    }


    const section =
        document.getElementById(
            "taarifaSection"
        );


    section.innerHTML = `

        <div class="booking-card">

            <button
                class="endeleaBtn"
                onclick="funguaAdminDashboardSehemu14()"
            >

                ← Dashboard

            </button>


            <h2>
                👥 Users
            </h2>


            <p>
                ⏳ Inapakia...
            </p>

        </div>

    `;


    const users =
        await getCollectionDataSehemu14(
            "users"
        );


    let html = `

        <div class="booking-card">

            <button
                class="endeleaBtn"
                onclick="funguaAdminDashboardSehemu14()"
            >

                ← Dashboard

            </button>


            <h2>
                👥 All Users
            </h2>

        </div>

    `;


    users.forEach(
        user => {

            html += `

                <div
                    class="booking-card"
                    style="
                        margin-bottom:15px;
                    "
                >

                    <h3>
                        👤
                        ${escapeHtml(
                            user.name || "User"
                        )}
                    </h3>


                    <p>
                        📧
                        ${escapeHtml(
                            user.email || "-"
                        )}
                    </p>


                    <p>

                        🔗 Referral Code:

                        <strong>
                            ${escapeHtml(
                                user.referralCode || "-"
                            )}
                        </strong>

                    </p>


                    <p>

                        💰 Commission:

                        <strong>

                            TSh
                            ${formatWithdrawalMoneySehemu13(
                                user.commissionBalance
                            )}

                        </strong>

                    </p>


                    <p>

                        📋 Bookings:

                        <strong>
                            ${Number(
                                user.totalBookings || 0
                            )}
                        </strong>

                    </p>

                </div>

            `;

        }
    );


    if (
        users.length === 0
    ) {

        html += `

            <div class="booking-card">

                <p>
                    Hakuna users.
                </p>

            </div>

        `;

    }


    section.innerHTML =
        html;

}


/* =========================================================
   14.14 SHOW ADMIN ROOMS
========================================================= */

async function onyeshaAdminRoomsSehemu14() {

    if (
        !requireAdminSehemu14()
    ) {

        return;

    }


    const section =
        document.getElementById(
            "taarifaSection"
        );


    section.innerHTML = `

        <div class="booking-card">

            <button
                class="endeleaBtn"
                onclick="funguaAdminDashboardSehemu14()"
            >

                ← Dashboard

            </button>


            <h2>
                🏠 Manage Rooms
            </h2>


            <p>
                ⏳ Inapakia vyumba...
            </p>

        </div>

    `;


    const rooms =
        await getCollectionDataSehemu14(
            "rooms"
        );


    let html = `

        <div class="booking-card">

            <button
                class="endeleaBtn"
                onclick="funguaAdminDashboardSehemu14()"
            >

                ← Dashboard

            </button>


            <h2>
                🏠 Manage Rooms
            </h2>


            <button
                class="thibitishaBtn"
                onclick="ongezaChumbaSehemu14()"
            >

                ➕ Ongeza Chumba

            </button>

        </div>

    `;


    rooms.forEach(
        room => {

            html += `

                <div
                    class="booking-card"
                    style="
                        margin-bottom:15px;
                    "
                >

                    <h3>
                        🏠 Room
                        ${escapeHtml(
                            room.number || room.roomNumber || "-"
                        )}
                    </h3>


                    <p>

                        💰 Bei:

                        <strong>

                            TSh
                            ${formatWithdrawalMoneySehemu13(
                                room.price
                            )}

                        </strong>

                    </p>


                    <p>

                        📈 Faida kwa siku:

                        <strong>

                            TSh
                            ${formatWithdrawalMoneySehemu13(
                                room.dailyProfit
                            )}

                        </strong>

                    </p>


                    <p>

                        📅 Siku:

                        <strong>
                            ${Number(
                                room.days || 0
                            )}
                        </strong>

                    </p>


                    <button
                        class="thibitishaBtn"
                        onclick="haririChumbaSehemu14('${room.id}')"
                    >

                        ✏️ Edit

                    </button>

                </div>

            `;

        }
    );


    section.innerHTML =
        html;

}


/* =========================================================
   14.15 ADD ROOM
========================================================= */

async function ongezaChumbaSehemu14() {

    const number =
        prompt(
            "Weka namba ya chumba:"
        );


    if (
        !number
    ) {

        return;

    }


    const price =
        Number(
            prompt(
                "Weka bei ya booking:"
            )
        );


    const dailyProfit =
        Number(
            prompt(
                "Weka faida kwa siku:"
            )
        );


    const days =
        Number(
            prompt(
                "Weka jumla ya siku:"
            )
        );


    if (

        !price ||

        !dailyProfit ||

        !days

    ) {

        alert(
            "❌ Weka taarifa sahihi."
        );

        return;

    }


    try {

        await db.collection(
            "rooms"
        )
        .add({

            number:
                number.trim(),

            price:
                price,

            dailyProfit:
                dailyProfit,

            days:
                days,

            imageUrl:
                "",

            active:
                true,

            createdAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp()

        });


        alert(
            "✅ Chumba kimeongezwa."
        );


        await onyeshaAdminRoomsSehemu14();


    } catch (error) {

        alert(
            "❌ " +
            error.message
        );

    }

}


/* =========================================================
   14.16 EDIT ROOM
========================================================= */

async function haririChumbaSehemu14(
    roomId
) {

    const roomRef =
        db.collection(
            "rooms"
        )
        .doc(
            roomId
        );


    const roomSnap =
        await roomRef.get();


    if (
        !roomSnap.exists
    ) {

        alert(
            "❌ Chumba hakijapatikana."
        );

        return;

    }


    const room =
        roomSnap.data();


    const price =
        Number(
            prompt(
                "Bei mpya:",

                room.price || 0
            )
        );


    const dailyProfit =
        Number(
            prompt(
                "Faida mpya kwa siku:",

                room.dailyProfit || 0
            )
        );


    const days =
        Number(
            prompt(
                "Siku:",

                room.days || 0
            )
        );


    try {

        await roomRef.update({

            price:
                price,

            dailyProfit:
                dailyProfit,

            days:
                days,

            updatedAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp()

        });


        alert(
            "✅ Chumba kimehaririwa."
        );


        await onyeshaAdminRoomsSehemu14();


    } catch (error) {

        alert(
            "❌ " +
            error.message
        );

    }

}


/* =========================================================
   14.17 ADMIN LOGOUT
========================================================= */

function adminLogoutSehemu14() {

    sessionStorage.removeItem(
        "roomrentAdmin"
    );


    alert(
        "👋 Umetoka kwenye Admin."
    );


    const section =
        document.getElementById(
            "taarifaSection"
        );


    if (section) {

        section.style.display =
            "none";

        section.innerHTML =
            "";

    }


    const vyumba =
        document.getElementById(
            "vyumba"
        );


    if (vyumba) {

        vyumba.style.display =
            "block";

    }

}


/* =========================================================
   14.18 INITIALIZE ADMIN BUTTON CONNECTION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",

    function() {

        console.log(
            "✅ Sehemu ya 14 - Admin Dashboard tayari."
        );

    }

);


/* =========================================================
   14.19 WINDOW EXPORTS
========================================================= */

window.funguaAdminDashboardSehemu14 =
    funguaAdminDashboardSehemu14;


window.refreshAdminDashboardSehemu14 =
    refreshAdminDashboardSehemu14;


window.onyeshaAdminBookingsSehemu14 =
    onyeshaAdminBookingsSehemu14;


window.adminViewBookingSehemu14 =
    adminViewBookingSehemu14;


window.adminConfirmBookingPaymentSehemu14 =
    adminConfirmBookingPaymentSehemu14;


window.adminRejectBookingPaymentSehemu14 =
    adminRejectBookingPaymentSehemu14;


window.onyeshaAdminPaymentsSehemu14 =
    onyeshaAdminPaymentsSehemu14;


window.onyeshaAdminWithdrawalsSehemu14 =
    onyeshaAdminWithdrawalsSehemu14;


window.onyeshaAdminUsersSehemu14 =
    onyeshaAdminUsersSehemu14;


window.onyeshaAdminRoomsSehemu14 =
    onyeshaAdminRoomsSehemu14;


window.ongezaChumbaSehemu14 =
    ongezaChumbaSehemu14;


window.haririChumbaSehemu14 =
    haririChumbaSehemu14;


window.adminLogoutSehemu14 =
    adminLogoutSehemu14;


/* =========================================================
   SEHEMU YA 14 IMEISHIA HAPA
========================================================= *//* =========================================================
   ROOMRENT - SEHEMU YA 14
   ADMIN DASHBOARD
   FIRESTORE
========================================================= */


/* =========================================================
   14.1 ADMIN SESSION CHECK
========================================================= */

function isAdminSehemu14() {

    return (
        sessionStorage.getItem(
            "roomrentAdmin"
        ) === "true"
    );

}


/* =========================================================
   14.2 REQUIRE ADMIN
========================================================= */

function requireAdminSehemu14() {

    if (
        !isAdminSehemu14()
    ) {

        alert(
            "❌ Huna ruhusa ya Admin."
        );

        return false;
    }

    return true;

}


/* =========================================================
   14.3 GET FIRESTORE COLLECTION
========================================================= */

async function getCollectionDataSehemu14(
    collectionName
) {

    try {

        const snapshot =
            await db.collection(
                collectionName
            ).get();


        const data = [];


        snapshot.forEach(
            doc => {

                data.push({

                    id: doc.id,

                    ...doc.data()

                });

            }
        );


        return data;


    } catch (error) {

        console.error(
            "Collection error:",
            collectionName,
            error
        );

        return [];
    }

}


/* =========================================================
   14.4 ADMIN STATISTICS
========================================================= */

async function getAdminStatisticsSehemu14() {

    try {

        const [

            users,

            rooms,

            bookings,

            withdrawals

        ] = await Promise.all([

            getCollectionDataSehemu14(
                "users"
            ),

            getCollectionDataSehemu14(
                "rooms"
            ),

            getCollectionDataSehemu14(
                "bookings"
            ),

            getCollectionDataSehemu14(
                "withdrawals"
            )

        ]);


        let totalBookingAmount = 0;

        let activeBookings = 0;

        let completedBookings = 0;

        let pendingPayments = 0;

        let totalWithdrawals = 0;

        let pendingWithdrawals = 0;

        let totalCommission = 0;


        bookings.forEach(
            booking => {

                totalBookingAmount +=
                    Number(
                        booking.roomPrice || 0
                    );


                if (
                    booking.status ===
                    "Active"
                ) {

                    activeBookings++;

                }


                if (
                    booking.status ===
                    "Completed"
                ) {

                    completedBookings++;

                }


                if (

                    booking.paymentStatus ===
                    "Pending"

                    ||

                    booking.paymentStatus ===
                    "Requested"

                ) {

                    pendingPayments++;

                }

            }
        );


        withdrawals.forEach(
            withdrawal => {

                if (
                    withdrawal.status ===
                    "Paid"
                ) {

                    totalWithdrawals +=
                        Number(
                            withdrawal.amount || 0
                        );

                }


                if (

                    withdrawal.status ===
                    "Pending"

                    ||

                    withdrawal.status ===
                    "Approved"

                    ||

                    withdrawal.status ===
                    "Processing"

                ) {

                    pendingWithdrawals++;

                }

            }
        );


        users.forEach(
            user => {

                totalCommission +=
                    Number(
                        user.commissionBalance || 0
                    );

            }
        );


        return {

            totalUsers:
                users.length,

            totalRooms:
                rooms.length,

            totalBookings:
                bookings.length,

            activeBookings:
                activeBookings,

            completedBookings:
                completedBookings,

            pendingPayments:
                pendingPayments,

            totalBookingAmount:
                totalBookingAmount,

            totalWithdrawals:
                totalWithdrawals,

            pendingWithdrawals:
                pendingWithdrawals,

            totalCommission:
                totalCommission

        };


    } catch (error) {

        console.error(
            "Statistics error:",
            error
        );


        return {

            totalUsers: 0,

            totalRooms: 0,

            totalBookings: 0,

            activeBookings: 0,

            completedBookings: 0,

            pendingPayments: 0,

            totalBookingAmount: 0,

            totalWithdrawals: 0,

            pendingWithdrawals: 0,

            totalCommission: 0

        };

    }

}


/* =========================================================
   14.5 OPEN ADMIN DASHBOARD
========================================================= */

async function funguaAdminDashboardSehemu14() {

    if (
        !requireAdminSehemu14()
    ) {

        return;

    }


    const section =
        document.getElementById(
            "taarifaSection"
        );


    if (!section) {
        return;
    }


    /*
     * HIDE OTHER SECTIONS
     */

    const vyumba =
        document.getElementById(
            "vyumba"
        );


    const fomuKodi =
        document.getElementById(
            "fomuKodi"
        );


    if (vyumba) {

        vyumba.style.display =
            "none";

    }


    if (fomuKodi) {

        fomuKodi.style.display =
            "none";

    }


    section.style.display =
        "block";


    section.innerHTML = `

        <div class="booking-card">

            <h2>
                🔐 Admin Dashboard
            </h2>

            <p>
                ⏳ Inapakia taarifa...
            </p>

        </div>

    `;


    const stats =
        await getAdminStatisticsSehemu14();


    section.innerHTML = `

        <div class="booking-card">

            <h2>
                🔐 RoomRent Admin Dashboard
            </h2>


            <p>
                Karibu kwenye mfumo wa Admin.
            </p>


            <!-- STATISTICS -->

            <div style="
                display:grid;
                grid-template-columns:
                repeat(
                    auto-fit,
                    minmax(
                        140px,
                        1fr
                    )
                );
                gap:10px;
                margin-top:20px;
            ">


                <div style="
                    border:1px solid #ddd;
                    padding:15px;
                    border-radius:10px;
                ">

                    👥 Users

                    <h2>
                        ${stats.totalUsers}
                    </h2>

                </div>


                <div style="
                    border:1px solid #ddd;
                    padding:15px;
                    border-radius:10px;
                ">

                    🏠 Vyumba

                    <h2>
                        ${stats.totalRooms}
                    </h2>

                </div>


                <div style="
                    border:1px solid #ddd;
                    padding:15px;
                    border-radius:10px;
                ">

                    📋 Bookings

                    <h2>
                        ${stats.totalBookings}
                    </h2>

                </div>


                <div style="
                    border:1px solid #ddd;
                    padding:15px;
                    border-radius:10px;
                ">

                    🟢 Active

                    <h2>
                        ${stats.activeBookings}
                    </h2>

                </div>


                <div style="
                    border:1px solid #ddd;
                    padding:15px;
                    border-radius:10px;
                ">

                    🏁 Completed

                    <h2>
                        ${stats.completedBookings}
                    </h2>

                </div>


                <div style="
                    border:1px solid #ddd;
                    padding:15px;
                    border-radius:10px;
                ">

                    ⏳ Payments

                    <h2>
                        ${stats.pendingPayments}
                    </h2>

                </div>


                <div style="
                    border:1px solid #ddd;
                    padding:15px;
                    border-radius:10px;
                ">

                    💸 Pending

                    <h2>
                        ${stats.pendingWithdrawals}
                    </h2>

                </div>


                <div style="
                    border:1px solid #ddd;
                    padding:15px;
                    border-radius:10px;
                ">

                    💰 Booking

                    <h3>
                        TSh
                        ${formatWithdrawalMoneySehemu13(
                            stats.totalBookingAmount
                        )}
                    </h3>

                </div>


                <div style="
                    border:1px solid #ddd;
                    padding:15px;
                    border-radius:10px;
                ">

                    💸 Paid

                    <h3>
                        TSh
                        ${formatWithdrawalMoneySehemu13(
                            stats.totalWithdrawals
                        )}
                    </h3>

                </div>


                <div style="
                    border:1px solid #ddd;
                    padding:15px;
                    border-radius:10px;
                ">

                    💰 Commission

                    <h3>
                        TSh
                        ${formatWithdrawalMoneySehemu13(
                            stats.totalCommission
                        )}
                    </h3>

                </div>

            </div>


            <hr>


            <!-- ADMIN MENU -->

            <h3>
                ⚙️ Admin Menu
            </h3>


            <button
                class="thibitishaBtn"
                onclick="onyeshaAdminBookingsSehemu14()"
            >

                📋 Manage Bookings

            </button>


            <button
                class="thibitishaBtn"
                onclick="onyeshaAdminPaymentsSehemu14()"
            >

                💳 Payment Requests

            </button>


            <button
                class="thibitishaBtn"
                onclick="onyeshaAdminWithdrawalsSehemu14()"
            >

                💸 Withdrawals

            </button>


            <button
                class="thibitishaBtn"
                onclick="onyeshaAdminUsersSehemu14()"
            >

                👥 Users

            </button>


            <button
                class="thibitishaBtn"
                onclick="onyeshaAdminRoomsSehemu14()"
            >

                🏠 Manage Rooms

            </button>


            <button
                class="endeleaBtn"
                onclick="refreshAdminDashboardSehemu14()"
            >

                🔄 Refresh

            </button>


            <button
                class="endeleaBtn"
                onclick="adminLogoutSehemu14()"
            >

                🚪 Logout Admin

            </button>

        </div>

    `;


    section.scrollIntoView({

        behavior:
            "smooth"

    });

}


/* =========================================================
   14.6 REFRESH DASHBOARD
========================================================= */

async function refreshAdminDashboardSehemu14() {

    await funguaAdminDashboardSehemu14();

}


/* =========================================================
   14.7 SHOW ADMIN BOOKINGS
========================================================= */

async function onyeshaAdminBookingsSehemu14() {

    if (
        !requireAdminSehemu14()
    ) {

        return;

    }


    const section =
        document.getElementById(
            "taarifaSection"
        );


    if (!section) {
        return;
    }


    section.innerHTML = `

        <div class="booking-card">

            <button
                class="endeleaBtn"
                onclick="funguaAdminDashboardSehemu14()"
            >

                ← Dashboard

            </button>


            <h2>
                📋 All Bookings
            </h2>


            <p>
                ⏳ Inapakia...
            </p>

        </div>

    `;


    const bookings =
        await getCollectionDataSehemu14(
            "bookings"
        );


    if (
        bookings.length === 0
    ) {

        section.innerHTML = `

            <div class="booking-card">

                <button
                    class="endeleaBtn"
                    onclick="funguaAdminDashboardSehemu14()"
                >

                    ← Dashboard

                </button>


                <h2>
                    📋 All Bookings
                </h2>


                <p>
                    Bado hakuna booking.
                </p>

            </div>

        `;

        return;

    }


    let html = `

        <div class="booking-card">

            <button
                class="endeleaBtn"
                onclick="funguaAdminDashboardSehemu14()"
            >

                ← Dashboard

            </button>


            <h2>
                📋 All Bookings
            </h2>

        </div>

    `;


    bookings.forEach(
        booking => {

            html += `

                <div
                    class="booking-card"
                    style="
                        margin-bottom:15px;
                    "
                >

                    <h3>
                        🏠 Chumba
                        ${escapeHtml(
                            booking.roomNumber || "-"
                        )}
                    </h3>


                    <p>
                        👤
                        ${escapeHtml(
                            booking.userName || "-"
                        )}
                    </p>


                    <p>
                        📧
                        ${escapeHtml(
                            booking.userEmail || "-"
                        )}
                    </p>


                    <p>

                        💰 TSh
                        ${formatWithdrawalMoneySehemu13(
                            booking.roomPrice
                        )}

                    </p>


                    <p>

                        📌 Status:

                        <strong>
                            ${escapeHtml(
                                booking.status || "-"
                            )}
                        </strong>

                    </p>


                    <p>

                        💳 Payment:

                        <strong>
                            ${escapeHtml(
                                booking.paymentStatus || "-"
                            )}
                        </strong>

                    </p>


                    <button
                        class="thibitishaBtn"
                        onclick="adminViewBookingSehemu14('${booking.id}')"
                    >

                        👁️ Details

                    </button>

                </div>

            `;

        }
    );


    section.innerHTML =
        html;

}


/* =========================================================
   14.8 ADMIN BOOKING DETAILS
========================================================= */

async function adminViewBookingSehemu14(
    bookingId
) {

    if (
        !requireAdminSehemu14()
    ) {

        return;

    }


    const bookingSnap =
        await db.collection(
            "bookings"
        )
        .doc(
            bookingId
        )
        .get();


    if (
        !bookingSnap.exists
    ) {

        alert(
            "❌ Booking haijapatikana."
        );

        return;

    }


    const booking = {

        id:
            bookingSnap.id,

        ...bookingSnap.data()

    };


    const section =
        document.getElementById(
            "taarifaSection"
        );


    section.innerHTML = `

        <div class="booking-card">

            <button
                class="endeleaBtn"
                onclick="onyeshaAdminBookingsSehemu14()"
            >

                ← Bookings

            </button>


            <h2>
                📋 Booking Details
            </h2>


            <p>

                🏠 Room:

                <strong>
                    ${escapeHtml(
                        booking.roomNumber || "-"
                    )}
                </strong>

            </p>


            <p>

                👤 User:

                <strong>
                    ${escapeHtml(
                        booking.userName || "-"
                    )}
                </strong>

            </p>


            <p>

                📧 Email:

                <strong>
                    ${escapeHtml(
                        booking.userEmail || "-"
                    )}
                </strong>

            </p>


            <p>

                💰 Amount:

                <strong>

                    TSh
                    ${formatWithdrawalMoneySehemu13(
                        booking.roomPrice
                    )}

                </strong>

            </p>


            <p>

                📌 Booking Status:

                <strong>
                    ${escapeHtml(
                        booking.status || "-"
                    )}
                </strong>

            </p>


            <p>

                💳 Payment Status:

                <strong>
                    ${escapeHtml(
                        booking.paymentStatus || "-"
                    )}
                </strong>

            </p>


            <p>

                📱 Payment Phone:

                <strong>
                    ${escapeHtml(
                        booking.paymentPhone || "-"
                    )}
                </strong>

            </p>


            <hr>


            <button
                class="thibitishaBtn"
                onclick="adminConfirmBookingPaymentSehemu14('${booking.id}')"
            >

                ✅ Confirm Payment

            </button>


            <button
                class="endeleaBtn"
                onclick="adminRejectBookingPaymentSehemu14('${booking.id}')"
            >

                ❌ Reject Payment

            </button>

        </div>

    `;

}


/* =========================================================
   14.9 ADMIN CONFIRM BOOKING PAYMENT
========================================================= */

async function adminConfirmBookingPaymentSehemu14(
    bookingId
) {

    if (
        !requireAdminSehemu14()
    ) {

        return;

    }


    try {

        const bookingRef =
            db.collection(
                "bookings"
            )
            .doc(
                bookingId
            );


        const bookingSnap =
            await bookingRef.get();


        if (
            !bookingSnap.exists
        ) {

            throw new Error(
                "Booking haijapatikana."
            );

        }


        const booking =
            bookingSnap.data();


        await bookingRef.update({

            paymentStatus:
                "Confirmed",

            status:
                "Active",

            startDate:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp(),

            paymentConfirmedAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp(),

            updatedAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp()

        });


        alert(
            "✅ Malipo yamethibitishwa. Booking imeanza."
        );


        await adminViewBookingSehemu14(
            bookingId
        );


    } catch (error) {

        console.error(
            error
        );


        alert(
            "❌ " +
            error.message
        );

    }

}


/* =========================================================
   14.10 ADMIN REJECT PAYMENT
========================================================= */

async function adminRejectBookingPaymentSehemu14(
    bookingId
) {

    if (
        !requireAdminSehemu14()
    ) {

        return;

    }


    const reason =
        prompt(
            "Sababu ya kukataa malipo:"
        );


    if (
        reason === null
    ) {

        return;

    }


    try {

        await db.collection(
            "bookings"
        )
        .doc(
            bookingId
        )
        .update({

            paymentStatus:
                "Rejected",

            status:
                "Payment Rejected",

            adminNote:
                reason.trim(),

            updatedAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp()

        });


        alert(
            "❌ Malipo yamekataliwa."
        );


        await adminViewBookingSehemu14(
            bookingId
        );


    } catch (error) {

        alert(
            "❌ " +
            error.message
        );

    }

}


/* =========================================================
   14.11 SHOW ADMIN PAYMENTS
========================================================= */

async function onyeshaAdminPaymentsSehemu14() {

    if (
        !requireAdminSehemu14()
    ) {

        return;

    }


    await onyeshaAdminBookingsSehemu14();

}


/* =========================================================
   14.12 SHOW ADMIN WITHDRAWALS
========================================================= */

async function onyeshaAdminWithdrawalsSehemu14() {

    if (
        !requireAdminSehemu14()
    ) {

        return;

    }


    const section =
        document.getElementById(
            "taarifaSection"
        );


    section.innerHTML = `

        <div class="booking-card">

            <button
                class="endeleaBtn"
                onclick="funguaAdminDashboardSehemu14()"
            >

                ← Dashboard

            </button>


            <h2>
                💸 Withdrawals
            </h2>


            <p>
                ⏳ Inapakia...
            </p>

        </div>

    `;


    const withdrawals =
        await getAllWithdrawalsSehemu13();


    let html = `

        <div class="booking-card">

            <button
                class="endeleaBtn"
                onclick="funguaAdminDashboardSehemu14()"
            >

                ← Dashboard

            </button>


            <h2>
                💸 All Withdrawals
            </h2>

        </div>

    `;


    if (
        withdrawals.length === 0
    ) {

        html += `

            <div class="booking-card">

                <p>
                    Hakuna withdrawal.
                </p>

            </div>

        `;

    }


    withdrawals.forEach(
        withdrawal => {

            html += `

                <div
                    class="booking-card"
                    style="
                        margin-bottom:15px;
                    "
                >

                    <h3>

                        💸 TSh
                        ${formatWithdrawalMoneySehemu13(
                            withdrawal.amount
                        )}

                    </h3>


                    <p>

                        👤
                        ${escapeHtml(
                            withdrawal.userName || "-"
                        )}

                    </p>


                    <p>

                        📱
                        ${escapeHtml(
                            withdrawal.phone || "-"
                        )}

                    </p>


                    <p>

                        💳
                        ${escapeHtml(
                            withdrawal.method || "-"
                        )}

                    </p>


                    <p>

                        📌 Status:

                        <strong>
                            ${escapeHtml(
                                withdrawal.status || "-"
                            )}
                        </strong>

                    </p>


                    ${

                        withdrawal.status ===
                        "Pending"

                            ?

                            `

                                <button
                                    class="thibitishaBtn"
                                    onclick="approveWithdrawalSehemu13('${withdrawal.id}')"
                                >

                                    ✅ Approve

                                </button>


                                <button
                                    class="endeleaBtn"
                                    onclick="rejectWithdrawalSehemu13('${withdrawal.id}')"
                                >

                                    ❌ Reject

                                </button>

                            `

                            :

                            ""

                    }


                    ${

                        withdrawal.status ===
                        "Approved"

                            ?

                            `

                                <button
                                    class="thibitishaBtn"
                                    onclick="markWithdrawalPaidSehemu13('${withdrawal.id}')"
                                >

                                    💰 Mark Paid

                                </button>

                            `

                            :

                            ""

                    }

                </div>

            `;

        }
    );


    section.innerHTML =
        html;

}


/* =========================================================
   14.13 SHOW ADMIN USERS
========================================================= */

async function onyeshaAdminUsersSehemu14() {

    if (
        !requireAdminSehemu14()
    ) {

        return;

    }


    const section =
        document.getElementById(
            "taarifaSection"
        );


    section.innerHTML = `

        <div class="booking-card">

            <button
                class="endeleaBtn"
                onclick="funguaAdminDashboardSehemu14()"
            >

                ← Dashboard

            </button>


            <h2>
                👥 Users
            </h2>


            <p>
                ⏳ Inapakia...
            </p>

        </div>

    `;


    const users =
        await getCollectionDataSehemu14(
            "users"
        );


    let html = `

        <div class="booking-card">

            <button
                class="endeleaBtn"
                onclick="funguaAdminDashboardSehemu14()"
            >

                ← Dashboard

            </button>


            <h2>
                👥 All Users
            </h2>

        </div>

    `;


    users.forEach(
        user => {

            html += `

                <div
                    class="booking-card"
                    style="
                        margin-bottom:15px;
                    "
                >

                    <h3>
                        👤
                        ${escapeHtml(
                            user.name || "User"
                        )}
                    </h3>


                    <p>
                        📧
                        ${escapeHtml(
                            user.email || "-"
                        )}
                    </p>


                    <p>

                        🔗 Referral Code:

                        <strong>
                            ${escapeHtml(
                                user.referralCode || "-"
                            )}
                        </strong>

                    </p>


                    <p>

                        💰 Commission:

                        <strong>

                            TSh
                            ${formatWithdrawalMoneySehemu13(
                                user.commissionBalance
                            )}

                        </strong>

                    </p>


                    <p>

                        📋 Bookings:

                        <strong>
                            ${Number(
                                user.totalBookings || 0
                            )}
                        </strong>

                    </p>

                </div>

            `;

        }
    );


    if (
        users.length === 0
    ) {

        html += `

            <div class="booking-card">

                <p>
                    Hakuna users.
                </p>

            </div>

        `;

    }


    section.innerHTML =
        html;

}


/* =========================================================
   14.14 SHOW ADMIN ROOMS
========================================================= */

async function onyeshaAdminRoomsSehemu14() {

    if (
        !requireAdminSehemu14()
    ) {

        return;

    }


    const section =
        document.getElementById(
            "taarifaSection"
        );


    section.innerHTML = `

        <div class="booking-card">

            <button
                class="endeleaBtn"
                onclick="funguaAdminDashboardSehemu14()"
            >

                ← Dashboard

            </button>


            <h2>
                🏠 Manage Rooms
            </h2>


            <p>
                ⏳ Inapakia vyumba...
            </p>

        </div>

    `;


    const rooms =
        await getCollectionDataSehemu14(
            "rooms"
        );


    let html = `

        <div class="booking-card">

            <button
                class="endeleaBtn"
                onclick="funguaAdminDashboardSehemu14()"
            >

                ← Dashboard

            </button>


            <h2>
                🏠 Manage Rooms
            </h2>


            <button
                class="thibitishaBtn"
                onclick="ongezaChumbaSehemu14()"
            >

                ➕ Ongeza Chumba

            </button>

        </div>

    `;


    rooms.forEach(
        room => {

            html += `

                <div
                    class="booking-card"
                    style="
                        margin-bottom:15px;
                    "
                >

                    <h3>
                        🏠 Room
                        ${escapeHtml(
                            room.number || room.roomNumber || "-"
                        )}
                    </h3>


                    <p>

                        💰 Bei:

                        <strong>

                            TSh
                            ${formatWithdrawalMoneySehemu13(
                                room.price
                            )}

                        </strong>

                    </p>


                    <p>

                        📈 Faida kwa siku:

                        <strong>

                            TSh
                            ${formatWithdrawalMoneySehemu13(
                                room.dailyProfit
                            )}

                        </strong>

                    </p>


                    <p>

                        📅 Siku:

                        <strong>
                            ${Number(
                                room.days || 0
                            )}
                        </strong>

                    </p>


                    <button
                        class="thibitishaBtn"
                        onclick="haririChumbaSehemu14('${room.id}')"
                    >

                        ✏️ Edit

                    </button>

                </div>

            `;

        }
    );


    section.innerHTML =
        html;

}


/* =========================================================
   14.15 ADD ROOM
========================================================= */

async function ongezaChumbaSehemu14() {

    const number =
        prompt(
            "Weka namba ya chumba:"
        );


    if (
        !number
    ) {

        return;

    }


    const price =
        Number(
            prompt(
                "Weka bei ya booking:"
            )
        );


    const dailyProfit =
        Number(
            prompt(
                "Weka faida kwa siku:"
            )
        );


    const days =
        Number(
            prompt(
                "Weka jumla ya siku:"
            )
        );


    if (

        !price ||

        !dailyProfit ||

        !days

    ) {

        alert(
            "❌ Weka taarifa sahihi."
        );

        return;

    }


    try {

        await db.collection(
            "rooms"
        )
        .add({

            number:
                number.trim(),

            price:
                price,

            dailyProfit:
                dailyProfit,

            days:
                days,

            imageUrl:
                "",

            active:
                true,

            createdAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp()

        });


        alert(
            "✅ Chumba kimeongezwa."
        );


        await onyeshaAdminRoomsSehemu14();


    } catch (error) {

        alert(
            "❌ " +
            error.message
        );

    }

}


/* =========================================================
   14.16 EDIT ROOM
========================================================= */

async function haririChumbaSehemu14(
    roomId
) {

    const roomRef =
        db.collection(
            "rooms"
        )
        .doc(
            roomId
        );


    const roomSnap =
        await roomRef.get();


    if (
        !roomSnap.exists
    ) {

        alert(
            "❌ Chumba hakijapatikana."
        );

        return;

    }


    const room =
        roomSnap.data();


    const price =
        Number(
            prompt(
                "Bei mpya:",

                room.price || 0
            )
        );


    const dailyProfit =
        Number(
            prompt(
                "Faida mpya kwa siku:",

                room.dailyProfit || 0
            )
        );


    const days =
        Number(
            prompt(
                "Siku:",

                room.days || 0
            )
        );


    try {

        await roomRef.update({

            price:
                price,

            dailyProfit:
                dailyProfit,

            days:
                days,

            updatedAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp()

        });


        alert(
            "✅ Chumba kimehaririwa."
        );


        await onyeshaAdminRoomsSehemu14();


    } catch (error) {

        alert(
            "❌ " +
            error.message
        );

    }

}


/* =========================================================
   14.17 ADMIN LOGOUT
========================================================= */

function adminLogoutSehemu14() {

    sessionStorage.removeItem(
        "roomrentAdmin"
    );


    alert(
        "👋 Umetoka kwenye Admin."
    );


    const section =
        document.getElementById(
            "taarifaSection"
        );


    if (section) {

        section.style.display =
            "none";

        section.innerHTML =
            "";

    }


    const vyumba =
        document.getElementById(
            "vyumba"
        );


    if (vyumba) {

        vyumba.style.display =
            "block";

    }

}


/* =========================================================
   14.18 INITIALIZE ADMIN BUTTON CONNECTION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",

    function() {

        console.log(
            "✅ Sehemu ya 14 - Admin Dashboard tayari."
        );

    }

);


/* =========================================================
   14.19 WINDOW EXPORTS
========================================================= */

window.funguaAdminDashboardSehemu14 =
    funguaAdminDashboardSehemu14;


window.refreshAdminDashboardSehemu14 =
    refreshAdminDashboardSehemu14;


window.onyeshaAdminBookingsSehemu14 =
    onyeshaAdminBookingsSehemu14;


window.adminViewBookingSehemu14 =
    adminViewBookingSehemu14;


window.adminConfirmBookingPaymentSehemu14 =
    adminConfirmBookingPaymentSehemu14;


window.adminRejectBookingPaymentSehemu14 =
    adminRejectBookingPaymentSehemu14;


window.onyeshaAdminPaymentsSehemu14 =
    onyeshaAdminPaymentsSehemu14;


window.onyeshaAdminWithdrawalsSehemu14 =
    onyeshaAdminWithdrawalsSehemu14;


window.onyeshaAdminUsersSehemu14 =
    onyeshaAdminUsersSehemu14;


window.onyeshaAdminRoomsSehemu14 =
    onyeshaAdminRoomsSehemu14;


window.ongezaChumbaSehemu14 =
    ongezaChumbaSehemu14;


window.haririChumbaSehemu14 =
    haririChumbaSehemu14;


window.adminLogoutSehemu14 =
    adminLogoutSehemu14;


/* =========================================================
   SEHEMU YA 14 IMEISHIA HAPA
========================================================= */
/* =========================================================
   ROOMRENT - SEHEMU YA 15
   ADMIN ROOM MANAGEMENT
   VERSION ILIYOREKEBISHWA
========================================================= */


/* =========================================================
   15.1 ROOM PROFIT SETTINGS
========================================================= */

const ROOMRENT_PROFIT_RATE_SEHEMU15 = 3.33;

const ROOMRENT_ROOM_DAYS_SEHEMU15 = 40;


/* =========================================================
   15.2 CALCULATE DAILY PROFIT
========================================================= */

function calculateDailyProfitSehemu15(
    price,
    roomNumber
) {

    const amount =
        Number(price) || 0;


    /*
     * CHUMBA 0023
     * FAIDA MAALUM
     */

    if (
        String(roomNumber) === "0023"
    ) {

        return 1000;

    }


    /*
     * VYUMBA VINGINE
     * 3.33% KWA SIKU
     */

    const profit =
        amount *
        (
            ROOMRENT_PROFIT_RATE_SEHEMU15 /
            100
        );


    return Math.round(
        profit
    );

}


/* =========================================================
   15.3 DEFAULT ROOM DATA
========================================================= */

const ROOMRENT_DEFAULT_ROOMS_SEHEMU15 = [

    {
        number: "0023",
        price: 30000
    },

    {
        number: "0024",
        price: 70000
    },

    {
        number: "0025",
        price: 140000
    },

    {
        number: "0026",
        price: 210000
    },

    {
        number: "0027",
        price: 280000
    },

    {
        number: "0028",
        price: 350000
    },

    {
        number: "0029",
        price: 420000
    },

    {
        number: "0030",
        price: 490000
    },

    {
        number: "0031",
        price: 560000
    },

    {
        number: "0032",
        price: 630000
    }

];


/* =========================================================
   15.4 CHECK ADMIN
========================================================= */

function requireAdminRoomSehemu15() {

    if (
        typeof requireAdminSehemu14 ===
        "function"
    ) {

        return requireAdminSehemu14();

    }


    alert(
        "❌ Mfumo wa Admin haujapatikana."
    );

    return false;

}


/* =========================================================
   15.5 GET ROOM BY NUMBER
========================================================= */

async function getRoomByNumberSehemu15(
    roomNumber
) {

    try {

        const snapshot =
            await db.collection(
                "rooms"
            )
            .where(
                "number",
                "==",
                String(roomNumber)
            )
            .limit(1)
            .get();


        if (
            snapshot.empty
        ) {

            return null;

        }


        const roomDoc =
            snapshot.docs[0];


        return {

            id:
                roomDoc.id,

            ...roomDoc.data()

        };


    } catch (error) {

        console.error(
            "Get room error:",
            error
        );

        return null;

    }

}


/* =========================================================
   15.6 SYNC DEFAULT ROOMS
========================================================= */

async function syncDefaultRoomsSehemu15() {

    if (
        !requireAdminRoomSehemu15()
    ) {

        return;

    }


    const confirmed =
        confirm(
            "Unataka kusawazisha vyumba 10 vya RoomRent kwenye Firestore?"
        );


    if (
        !confirmed
    ) {

        return;

    }


    try {

        let added = 0;

        let updated = 0;


        for (
            const room of
            ROOMRENT_DEFAULT_ROOMS_SEHEMU15
        ) {

            const dailyProfit =
                calculateDailyProfitSehemu15(
                    room.price,
                    room.number
                );


            const existing =
                await getRoomByNumberSehemu15(
                    room.number
                );


            /*
             * ROOM IPO TAYARI
             */

            if (
                existing
            ) {

                await db.collection(
                    "rooms"
                )
                .doc(
                    existing.id
                )
                .update({

                    number:
                        room.number,

                    price:
                        room.price,

                    dailyProfit:
                        dailyProfit,

                    days:
                        ROOMRENT_ROOM_DAYS_SEHEMU15,

                    updatedAt:
                        firebase.firestore
                            .FieldValue
                            .serverTimestamp()

                });


                updated++;


            }

            /*
             * ROOM MPYA
             */

            else {

                await db.collection(
                    "rooms"
                )
                .add({

                    number:
                        room.number,

                    price:
                        room.price,

                    dailyProfit:
                        dailyProfit,

                    days:
                        ROOMRENT_ROOM_DAYS_SEHEMU15,

                    imageUrl:
                        "",

                    active:
                        true,

                    createdAt:
                        firebase.firestore
                            .FieldValue
                            .serverTimestamp(),

                    updatedAt:
                        firebase.firestore
                            .FieldValue
                            .serverTimestamp()

                });


                added++;

            }

        }


        alert(

            "✅ Vyumba vimesawazishwa!\n\n" +

            "Vilivyoongezwa: " +
            added +

            "\nVilivyorekebishwa: " +
            updated +

            "\n\n📅 Vyumba vyote: siku 40" +

            "\n📈 Faida: 3.33% kwa siku"

        );


        await onyeshaAdminRoomsSehemu15();


    } catch (error) {

        console.error(
            "Sync rooms error:",
            error
        );


        alert(
            "❌ Imeshindikana: " +
            error.message
        );

    }

}


/* =========================================================
   15.7 SHOW ADMIN ROOMS
========================================================= */

async function onyeshaAdminRoomsSehemu15() {

    if (
        !requireAdminRoomSehemu15()
    ) {

        return;

    }


    const section =
        document.getElementById(
            "taarifaSection"
        );


    if (!section) {
        return;
    }


    section.style.display =
        "block";


    section.innerHTML = `

        <div class="booking-card">

            <button
                class="endeleaBtn"
                onclick="funguaAdminDashboardSehemu14()"
            >
                ← Dashboard
            </button>


            <h2>
                🏠 Manage Rooms
            </h2>


            <p>
                📅 Muda wa vyumba vyote:
                <strong>40 siku</strong>
            </p>


            <p>
                📈 Faida:
                <strong>3.33% kwa siku</strong>
            </p>


            <button
                class="thibitishaBtn"
                onclick="syncDefaultRoomsSehemu15()"
            >
                🔄 Sync Vyumba 10
            </button>


            <button
                class="thibitishaBtn"
                onclick="ongezaChumbaSehemu15()"
            >
                ➕ Ongeza Chumba
            </button>


            <p>
                ⏳ Inapakia vyumba...
            </p>

        </div>

    `;


    try {

        const snapshot =
            await db.collection(
                "rooms"
            )
            .get();


        const rooms = [];


        snapshot.forEach(
            doc => {

                rooms.push({

                    id:
                        doc.id,

                    ...doc.data()

                });

            }
        );


        /*
         * SORT ROOMS
         */

        rooms.sort(
            (a, b) => {

                return Number(
                    a.number
                ) - Number(
                    b.number
                );

            }
        );


        let html = `

            <div class="booking-card">

                <button
                    class="endeleaBtn"
                    onclick="funguaAdminDashboardSehemu14()"
                >
                    ← Dashboard
                </button>


                <h2>
                    🏠 Manage Rooms
                </h2>


                <p>
                    📅 Vyumba vyote:
                    <strong>40 siku</strong>
                </p>


                <p>
                    📈 Faida:
                    <strong>3.33% kwa siku</strong>
                </p>


                <button
                    class="thibitishaBtn"
                    onclick="syncDefaultRoomsSehemu15()"
                >
                    🔄 Sync Vyumba 10
                </button>


                <button
                    class="thibitishaBtn"
                    onclick="ongezaChumbaSehemu15()"
                >
                    ➕ Ongeza Chumba
                </button>

            </div>

        `;


        if (
            rooms.length === 0
        ) {

            html += `

                <div class="booking-card">

                    <h3>
                        🏠 Hakuna vyumba bado
                    </h3>


                    <p>
                        Bonyeza
                        <strong>
                            🔄 Sync Vyumba 10
                        </strong>

                        kuongeza vyumba vya RoomRent.
                    </p>

                </div>

            `;

        }


        rooms.forEach(
            room => {

                const roomNumber =
                    room.number ||
                    room.roomNumber ||
                    "-";


                const price =
                    Number(
                        room.price || 0
                    );


                /*
                 * RECALCULATE PROFIT
                 */

                const dailyProfit =
                    calculateDailyProfitSehemu15(
                        price,
                        roomNumber
                    );


                const active =
                    room.active !== false;


                let imageHtml = `

                    <div style="
                        width:100%;
                        height:120px;
                        border:1px dashed #aaa;
                        border-radius:12px;
                        display:flex;
                        align-items:center;
                        justify-content:center;
                        margin-bottom:10px;
                    ">

                        🏠 Hakuna Picha

                    </div>

                `;


                if (
                    room.imageUrl
                ) {

                    imageHtml = `

                        <img
                            src="${escapeHtml(
                                room.imageUrl
                            )}"
                            alt="Room ${escapeHtml(
                                roomNumber
                            )}"
                            style="
                                width:100%;
                                max-height:200px;
                                object-fit:cover;
                                border-radius:12px;
                                margin-bottom:10px;
                            "
                        >

                    `;

                }


                html += `

                    <div
                        class="booking-card"
                        style="
                            margin-bottom:15px;
                        "
                    >

                        ${imageHtml}


                        <h3>
                            🏠 Chumba
                            ${escapeHtml(
                                roomNumber
                            )}
                        </h3>


                        <p>

                            ${
                                active
                                    ?

                                    "🟢 Active"

                                    :

                                    "🔴 Inactive"
                            }

                        </p>


                        <p>

                            💰 Bei:

                            <strong>

                                TSh
                                ${formatWithdrawalMoneySehemu13(
                                    price
                                )}

                            </strong>

                        </p>


                        <p>

                            📈 Faida kwa siku:

                            <strong>

                                TSh
                                ${formatWithdrawalMoneySehemu13(
                                    dailyProfit
                                )}

                            </strong>

                        </p>


                        <p>

                            📅 Muda:

                            <strong>

                                ${ROOMRENT_ROOM_DAYS_SEHEMU15}
                                siku

                            </strong>

                        </p>


                        <button
                            class="thibitishaBtn"
                            onclick="haririChumbaSehemu15('${room.id}')"
                        >
                            ✏️ Edit
                        </button>


                        <button
                            class="endeleaBtn"
                            onclick="badilishaRoomStatusSehemu15('${room.id}')"
                        >

                            ${
                                active
                                    ?

                                    "🔴 Deactivate"

                                    :

                                    "🟢 Activate"
                            }

                        </button>


                        <button
                            class="endeleaBtn"
                            onclick="wekaRoomImageSehemu15('${room.id}')"
                        >
                            🖼️ Weka Picha
                        </button>


                        <button
                            class="endeleaBtn"
                            onclick="futaChumbaSehemu15('${room.id}')"
                        >
                            🗑️ Delete
                        </button>

                    </div>

                `;

            }
        );


        section.innerHTML =
            html;


    } catch (error) {

        console.error(
            "Show rooms error:",
            error
        );


        section.innerHTML = `

            <div class="booking-card">

                <h2>
                    🏠 Manage Rooms
                </h2>


                <p style="color:red;">

                    ❌ Imeshindikana kupakia vyumba.

                </p>


                <p>
                    ${escapeHtml(
                        error.message
                    )}
                </p>

            </div>

        `;

    }

}


/* =========================================================
   15.8 ADD ROOM
========================================================= */

async function ongezaChumbaSehemu15() {

    if (
        !requireAdminRoomSehemu15()
    ) {

        return;

    }


    const number =
        prompt(
            "Weka namba ya chumba:"
        );


    if (
        !number ||
        !number.trim()
    ) {

        return;

    }


    const roomNumber =
        number.trim();


    const existing =
        await getRoomByNumberSehemu15(
            roomNumber
        );


    if (
        existing
    ) {

        alert(
            "❌ Chumba hiki tayari kipo."
        );

        return;

    }


    const price =
        Number(
            prompt(
                "Weka bei ya chumba:"
            )
        );


    if (
        !price ||
        price <= 0
    ) {

        alert(
            "❌ Bei si sahihi."
        );

        return;

    }


    const dailyProfit =
        calculateDailyProfitSehemu15(
            price,
            roomNumber
        );


    try {

        await db.collection(
            "rooms"
        )
        .add({

            number:
                roomNumber,

            price:
                price,

            dailyProfit:
                dailyProfit,

            days:
                ROOMRENT_ROOM_DAYS_SEHEMU15,

            imageUrl:
                "",

            active:
                true,

            createdAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp(),

            updatedAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp()

        });


        alert(

            "✅ Chumba kimeongezwa!\n\n" +

            "📈 Faida kwa siku: TSh " +
            dailyProfit +

            "\n📅 Muda: siku 40"

        );


        await onyeshaAdminRoomsSehemu15();


    } catch (error) {

        console.error(
            "Add room error:",
            error
        );


        alert(
            "❌ " +
            error.message
        );

    }

}


/* =========================================================
   15.9 EDIT ROOM
========================================================= */

async function haririChumbaSehemu15(
    roomId
) {

    if (
        !requireAdminRoomSehemu15()
    ) {

        return;

    }


    try {

        const roomRef =
            db.collection(
                "rooms"
            )
            .doc(
                roomId
            );


        const roomSnap =
            await roomRef.get();


        if (
            !roomSnap.exists
        ) {

            alert(
                "❌ Chumba hakijapatikana."
            );

            return;

        }


        const room =
            roomSnap.data();


        const number =
            prompt(
                "Namba ya chumba:",
                room.number || ""
            );


        if (
            number === null ||
            !number.trim()
        ) {

            return;

        }


        const price =
            Number(
                prompt(
                    "Bei:",
                    room.price || 0
                )
            );


        if (
            !price ||
            price <= 0
        ) {

            alert(
                "❌ Bei si sahihi."
            );

            return;

        }


        const roomNumber =
            number.trim();


        const dailyProfit =
            calculateDailyProfitSehemu15(
                price,
                roomNumber
            );


        await roomRef.update({

            number:
                roomNumber,

            price:
                price,

            dailyProfit:
                dailyProfit,

            days:
                ROOMRENT_ROOM_DAYS_SEHEMU15,

            updatedAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp()

        });


        alert(

            "✅ Chumba kimehaririwa!\n\n" +

            "📈 Faida mpya kwa siku: TSh " +
            dailyProfit +

            "\n📅 Muda: siku 40"

        );


        await onyeshaAdminRoomsSehemu15();


    } catch (error) {

        console.error(
            "Edit room error:",
            error
        );


        alert(
            "❌ " +
            error.message
        );

    }

}


/* =========================================================
   15.10 ACTIVATE / DEACTIVATE ROOM
========================================================= */

async function badilishaRoomStatusSehemu15(
    roomId
) {

    if (
        !requireAdminRoomSehemu15()
    ) {

        return;

    }


    try {

        const roomRef =
            db.collection(
                "rooms"
            )
            .doc(
                roomId
            );


        const roomSnap =
            await roomRef.get();


        if (
            !roomSnap.exists
        ) {

            alert(
                "❌ Chumba hakijapatikana."
            );

            return;

        }


        const room =
            roomSnap.data();


        const currentStatus =
            room.active !== false;


        const newStatus =
            !currentStatus;


        const confirmed =
            confirm(

                newStatus

                    ?

                    "Unataka ku-activate chumba hiki?"

                    :

                    "Unataka ku-deactivate chumba hiki?"

            );


        if (
            !confirmed
        ) {

            return;

        }


        await roomRef.update({

            active:
                newStatus,

            updatedAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp()

        });


        alert(

            newStatus

                ?

                "🟢 Chumba kime-activate."

                :

                "🔴 Chumba kime-deactivate."

        );


        await onyeshaAdminRoomsSehemu15();


    } catch (error) {

        alert(
            "❌ " +
            error.message
        );

    }

}


/* =========================================================
   15.11 SET ROOM IMAGE
========================================================= */

async function wekaRoomImageSehemu15(
    roomId
) {

    if (
        !requireAdminRoomSehemu15()
    ) {

        return;

    }


    const imageUrl =
        prompt(
            "Weka Image URL ya chumba:"
        );


    if (
        imageUrl === null
    ) {

        return;

    }


    const cleanUrl =
        imageUrl.trim();


    if (
        !cleanUrl
    ) {

        alert(
            "❌ Image URL inahitajika."
        );

        return;

    }


    if (

        !cleanUrl.startsWith(
            "https://"
        )

        &&

        !cleanUrl.startsWith(
            "http://"
        )

    ) {

        alert(
            "❌ URL lazima ianze na https:// au http://"
        );

        return;

    }


    try {

        await db.collection(
            "rooms"
        )
        .doc(
            roomId
        )
        .update({

            imageUrl:
                cleanUrl,

            updatedAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp()

        });


        alert(
            "🖼️ Picha imewekwa."
        );


        await onyeshaAdminRoomsSehemu15();


    } catch (error) {

        alert(
            "❌ " +
            error.message
        );

    }

}


/* =========================================================
   15.12 DELETE ROOM
========================================================= */

async function futaChumbaSehemu15(
    roomId
) {

    if (
        !requireAdminRoomSehemu15()
    ) {

        return;

    }


    const confirmed =
        confirm(
            "⚠️ Una uhakika unataka kufuta chumba hiki?"
        );


    if (
        !confirmed
    ) {

        return;

    }


    try {

        const roomRef =
            db.collection(
                "rooms"
            )
            .doc(
                roomId
            );


        const roomSnap =
            await roomRef.get();


        if (
            !roomSnap.exists
        ) {

            alert(
                "❌ Chumba hakijapatikana."
            );

            return;

        }


        const room =
            roomSnap.data();


        const bookingSnapshot =
            await db.collection(
                "bookings"
            )
            .where(
                "roomNumber",
                "==",
                room.number
            )
            .get();


        let hasActiveBooking =
            false;


        bookingSnapshot.forEach(
            doc => {

                const booking =
                    doc.data();


                if (
                    booking.status ===
                    "Active"
                ) {

                    hasActiveBooking =
                        true;

                }

            }
        );


        if (
            hasActiveBooking
        ) {

            alert(
                "❌ Huwezi kufuta chumba chenye Active Booking."
            );

            return;

        }


        await roomRef.delete();


        alert(
            "🗑️ Chumba kimefutwa."
        );


        await onyeshaAdminRoomsSehemu15();


    } catch (error) {

        console.error(
            "Delete room error:",
            error
        );


        alert(
            "❌ " +
            error.message
        );

    }

}


/* =========================================================
   15.13 CONNECT ADMIN ROOM BUTTON
========================================================= */

function connectAdminRoomsSehemu15() {

    window.onyeshaAdminRoomsSehemu14 =
        onyeshaAdminRoomsSehemu15;

}


/* =========================================================
   15.14 INITIALIZE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",

    function() {

        connectAdminRoomsSehemu15();


        console.log(
            "✅ Sehemu ya 15 iliyorekebishwa tayari."
        );

    }

);


/* =========================================================
   15.15 WINDOW EXPORTS
========================================================= */

window.calculateDailyProfitSehemu15 =
    calculateDailyProfitSehemu15;


window.syncDefaultRoomsSehemu15 =
    syncDefaultRoomsSehemu15;


window.onyeshaAdminRoomsSehemu15 =
    onyeshaAdminRoomsSehemu15;


window.ongezaChumbaSehemu15 =
    ongezaChumbaSehemu15;


window.haririChumbaSehemu15 =
    haririChumbaSehemu15;


window.badilishaRoomStatusSehemu15 =
    badilishaRoomStatusSehemu15;


window.wekaRoomImageSehemu15 =
    wekaRoomImageSehemu15;


window.futaChumbaSehemu15 =
    futaChumbaSehemu15;


/* =========================================================
   SEHEMU YA 15 IMEISHIA HAPA
========================================================= *//* =========================================================
   ROOMRENT - SEHEMU YA 15
   ADMIN ROOM MANAGEMENT
   VERSION ILIYOREKEBISHWA
========================================================= */


/* =========================================================
   15.1 ROOM PROFIT SETTINGS
========================================================= */

const ROOMRENT_PROFIT_RATE_SEHEMU15 = 3.33;

const ROOMRENT_ROOM_DAYS_SEHEMU15 = 40;


/* =========================================================
   15.2 CALCULATE DAILY PROFIT
========================================================= */

function calculateDailyProfitSehemu15(
    price,
    roomNumber
) {

    const amount =
        Number(price) || 0;


    /*
     * CHUMBA 0023
     * FAIDA MAALUM
     */

    if (
        String(roomNumber) === "0023"
    ) {

        return 1000;

    }


    /*
     * VYUMBA VINGINE
     * 3.33% KWA SIKU
     */

    const profit =
        amount *
        (
            ROOMRENT_PROFIT_RATE_SEHEMU15 /
            100
        );


    return Math.round(
        profit
    );

}


/* =========================================================
   15.3 DEFAULT ROOM DATA
========================================================= */

const ROOMRENT_DEFAULT_ROOMS_SEHEMU15 = [

    {
        number: "0023",
        price: 30000
    },

    {
        number: "0024",
        price: 70000
    },

    {
        number: "0025",
        price: 140000
    },

    {
        number: "0026",
        price: 210000
    },

    {
        number: "0027",
        price: 280000
    },

    {
        number: "0028",
        price: 350000
    },

    {
        number: "0029",
        price: 420000
    },

    {
        number: "0030",
        price: 490000
    },

    {
        number: "0031",
        price: 560000
    },

    {
        number: "0032",
        price: 630000
    }

];


/* =========================================================
   15.4 CHECK ADMIN
========================================================= */

function requireAdminRoomSehemu15() {

    if (
        typeof requireAdminSehemu14 ===
        "function"
    ) {

        return requireAdminSehemu14();

    }


    alert(
        "❌ Mfumo wa Admin haujapatikana."
    );

    return false;

}


/* =========================================================
   15.5 GET ROOM BY NUMBER
========================================================= */

async function getRoomByNumberSehemu15(
    roomNumber
) {

    try {

        const snapshot =
            await db.collection(
                "rooms"
            )
            .where(
                "number",
                "==",
                String(roomNumber)
            )
            .limit(1)
            .get();


        if (
            snapshot.empty
        ) {

            return null;

        }


        const roomDoc =
            snapshot.docs[0];


        return {

            id:
                roomDoc.id,

            ...roomDoc.data()

        };


    } catch (error) {

        console.error(
            "Get room error:",
            error
        );

        return null;

    }

}


/* =========================================================
   15.6 SYNC DEFAULT ROOMS
========================================================= */

async function syncDefaultRoomsSehemu15() {

    if (
        !requireAdminRoomSehemu15()
    ) {

        return;

    }


    const confirmed =
        confirm(
            "Unataka kusawazisha vyumba 10 vya RoomRent kwenye Firestore?"
        );


    if (
        !confirmed
    ) {

        return;

    }


    try {

        let added = 0;

        let updated = 0;


        for (
            const room of
            ROOMRENT_DEFAULT_ROOMS_SEHEMU15
        ) {

            const dailyProfit =
                calculateDailyProfitSehemu15(
                    room.price,
                    room.number
                );


            const existing =
                await getRoomByNumberSehemu15(
                    room.number
                );


            /*
             * ROOM IPO TAYARI
             */

            if (
                existing
            ) {

                await db.collection(
                    "rooms"
                )
                .doc(
                    existing.id
                )
                .update({

                    number:
                        room.number,

                    price:
                        room.price,

                    dailyProfit:
                        dailyProfit,

                    days:
                        ROOMRENT_ROOM_DAYS_SEHEMU15,

                    updatedAt:
                        firebase.firestore
                            .FieldValue
                            .serverTimestamp()

                });


                updated++;


            }

            /*
             * ROOM MPYA
             */

            else {

                await db.collection(
                    "rooms"
                )
                .add({

                    number:
                        room.number,

                    price:
                        room.price,

                    dailyProfit:
                        dailyProfit,

                    days:
                        ROOMRENT_ROOM_DAYS_SEHEMU15,

                    imageUrl:
                        "",

                    active:
                        true,

                    createdAt:
                        firebase.firestore
                            .FieldValue
                            .serverTimestamp(),

                    updatedAt:
                        firebase.firestore
                            .FieldValue
                            .serverTimestamp()

                });


                added++;

            }

        }


        alert(

            "✅ Vyumba vimesawazishwa!\n\n" +

            "Vilivyoongezwa: " +
            added +

            "\nVilivyorekebishwa: " +
            updated +

            "\n\n📅 Vyumba vyote: siku 40" +

            "\n📈 Faida: 3.33% kwa siku"

        );


        await onyeshaAdminRoomsSehemu15();


    } catch (error) {

        console.error(
            "Sync rooms error:",
            error
        );


        alert(
            "❌ Imeshindikana: " +
            error.message
        );

    }

}


/* =========================================================
   15.7 SHOW ADMIN ROOMS
========================================================= */

async function onyeshaAdminRoomsSehemu15() {

    if (
        !requireAdminRoomSehemu15()
    ) {

        return;

    }


    const section =
        document.getElementById(
            "taarifaSection"
        );


    if (!section) {
        return;
    }


    section.style.display =
        "block";


    section.innerHTML = `

        <div class="booking-card">

            <button
                class="endeleaBtn"
                onclick="funguaAdminDashboardSehemu14()"
            >
                ← Dashboard
            </button>


            <h2>
                🏠 Manage Rooms
            </h2>


            <p>
                📅 Muda wa vyumba vyote:
                <strong>40 siku</strong>
            </p>


            <p>
                📈 Faida:
                <strong>3.33% kwa siku</strong>
            </p>


            <button
                class="thibitishaBtn"
                onclick="syncDefaultRoomsSehemu15()"
            >
                🔄 Sync Vyumba 10
            </button>


            <button
                class="thibitishaBtn"
                onclick="ongezaChumbaSehemu15()"
            >
                ➕ Ongeza Chumba
            </button>


            <p>
                ⏳ Inapakia vyumba...
            </p>

        </div>

    `;


    try {

        const snapshot =
            await db.collection(
                "rooms"
            )
            .get();


        const rooms = [];


        snapshot.forEach(
            doc => {

                rooms.push({

                    id:
                        doc.id,

                    ...doc.data()

                });

            }
        );


        /*
         * SORT ROOMS
         */

        rooms.sort(
            (a, b) => {

                return Number(
                    a.number
                ) - Number(
                    b.number
                );

            }
        );


        let html = `

            <div class="booking-card">

                <button
                    class="endeleaBtn"
                    onclick="funguaAdminDashboardSehemu14()"
                >
                    ← Dashboard
                </button>


                <h2>
                    🏠 Manage Rooms
                </h2>


                <p>
                    📅 Vyumba vyote:
                    <strong>40 siku</strong>
                </p>


                <p>
                    📈 Faida:
                    <strong>3.33% kwa siku</strong>
                </p>


                <button
                    class="thibitishaBtn"
                    onclick="syncDefaultRoomsSehemu15()"
                >
                    🔄 Sync Vyumba 10
                </button>


                <button
                    class="thibitishaBtn"
                    onclick="ongezaChumbaSehemu15()"
                >
                    ➕ Ongeza Chumba
                </button>

            </div>

        `;


        if (
            rooms.length === 0
        ) {

            html += `

                <div class="booking-card">

                    <h3>
                        🏠 Hakuna vyumba bado
                    </h3>


                    <p>
                        Bonyeza
                        <strong>
                            🔄 Sync Vyumba 10
                        </strong>

                        kuongeza vyumba vya RoomRent.
                    </p>

                </div>

            `;

        }


        rooms.forEach(
            room => {

                const roomNumber =
                    room.number ||
                    room.roomNumber ||
                    "-";


                const price =
                    Number(
                        room.price || 0
                    );


                /*
                 * RECALCULATE PROFIT
                 */

                const dailyProfit =
                    calculateDailyProfitSehemu15(
                        price,
                        roomNumber
                    );


                const active =
                    room.active !== false;


                let imageHtml = `

                    <div style="
                        width:100%;
                        height:120px;
                        border:1px dashed #aaa;
                        border-radius:12px;
                        display:flex;
                        align-items:center;
                        justify-content:center;
                        margin-bottom:10px;
                    ">

                        🏠 Hakuna Picha

                    </div>

                `;


                if (
                    room.imageUrl
                ) {

                    imageHtml = `

                        <img
                            src="${escapeHtml(
                                room.imageUrl
                            )}"
                            alt="Room ${escapeHtml(
                                roomNumber
                            )}"
                            style="
                                width:100%;
                                max-height:200px;
                                object-fit:cover;
                                border-radius:12px;
                                margin-bottom:10px;
                            "
                        >

                    `;

                }


                html += `

                    <div
                        class="booking-card"
                        style="
                            margin-bottom:15px;
                        "
                    >

                        ${imageHtml}


                        <h3>
                            🏠 Chumba
                            ${escapeHtml(
                                roomNumber
                            )}
                        </h3>


                        <p>

                            ${
                                active
                                    ?

                                    "🟢 Active"

                                    :

                                    "🔴 Inactive"
                            }

                        </p>


                        <p>

                            💰 Bei:

                            <strong>

                                TSh
                                ${formatWithdrawalMoneySehemu13(
                                    price
                                )}

                            </strong>

                        </p>


                        <p>

                            📈 Faida kwa siku:

                            <strong>

                                TSh
                                ${formatWithdrawalMoneySehemu13(
                                    dailyProfit
                                )}

                            </strong>

                        </p>


                        <p>

                            📅 Muda:

                            <strong>

                                ${ROOMRENT_ROOM_DAYS_SEHEMU15}
                                siku

                            </strong>

                        </p>


                        <button
                            class="thibitishaBtn"
                            onclick="haririChumbaSehemu15('${room.id}')"
                        >
                            ✏️ Edit
                        </button>


                        <button
                            class="endeleaBtn"
                            onclick="badilishaRoomStatusSehemu15('${room.id}')"
                        >

                            ${
                                active
                                    ?

                                    "🔴 Deactivate"

                                    :

                                    "🟢 Activate"
                            }

                        </button>


                        <button
                            class="endeleaBtn"
                            onclick="wekaRoomImageSehemu15('${room.id}')"
                        >
                            🖼️ Weka Picha
                        </button>


                        <button
                            class="endeleaBtn"
                            onclick="futaChumbaSehemu15('${room.id}')"
                        >
                            🗑️ Delete
                        </button>

                    </div>

                `;

            }
        );


        section.innerHTML =
            html;


    } catch (error) {

        console.error(
            "Show rooms error:",
            error
        );


        section.innerHTML = `

            <div class="booking-card">

                <h2>
                    🏠 Manage Rooms
                </h2>


                <p style="color:red;">

                    ❌ Imeshindikana kupakia vyumba.

                </p>


                <p>
                    ${escapeHtml(
                        error.message
                    )}
                </p>

            </div>

        `;

    }

}


/* =========================================================
   15.8 ADD ROOM
========================================================= */

async function ongezaChumbaSehemu15() {

    if (
        !requireAdminRoomSehemu15()
    ) {

        return;

    }


    const number =
        prompt(
            "Weka namba ya chumba:"
        );


    if (
        !number ||
        !number.trim()
    ) {

        return;

    }


    const roomNumber =
        number.trim();


    const existing =
        await getRoomByNumberSehemu15(
            roomNumber
        );


    if (
        existing
    ) {

        alert(
            "❌ Chumba hiki tayari kipo."
        );

        return;

    }


    const price =
        Number(
            prompt(
                "Weka bei ya chumba:"
            )
        );


    if (
        !price ||
        price <= 0
    ) {

        alert(
            "❌ Bei si sahihi."
        );

        return;

    }


    const dailyProfit =
        calculateDailyProfitSehemu15(
            price,
            roomNumber
        );


    try {

        await db.collection(
            "rooms"
        )
        .add({

            number:
                roomNumber,

            price:
                price,

            dailyProfit:
                dailyProfit,

            days:
                ROOMRENT_ROOM_DAYS_SEHEMU15,

            imageUrl:
                "",

            active:
                true,

            createdAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp(),

            updatedAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp()

        });


        alert(

            "✅ Chumba kimeongezwa!\n\n" +

            "📈 Faida kwa siku: TSh " +
            dailyProfit +

            "\n📅 Muda: siku 40"

        );


        await onyeshaAdminRoomsSehemu15();


    } catch (error) {

        console.error(
            "Add room error:",
            error
        );


        alert(
            "❌ " +
            error.message
        );

    }

}


/* =========================================================
   15.9 EDIT ROOM
========================================================= */

async function haririChumbaSehemu15(
    roomId
) {

    if (
        !requireAdminRoomSehemu15()
    ) {

        return;

    }


    try {

        const roomRef =
            db.collection(
                "rooms"
            )
            .doc(
                roomId
            );


        const roomSnap =
            await roomRef.get();


        if (
            !roomSnap.exists
        ) {

            alert(
                "❌ Chumba hakijapatikana."
            );

            return;

        }


        const room =
            roomSnap.data();


        const number =
            prompt(
                "Namba ya chumba:",
                room.number || ""
            );


        if (
            number === null ||
            !number.trim()
        ) {

            return;

        }


        const price =
            Number(
                prompt(
                    "Bei:",
                    room.price || 0
                )
            );


        if (
            !price ||
            price <= 0
        ) {

            alert(
                "❌ Bei si sahihi."
            );

            return;

        }


        const roomNumber =
            number.trim();


        const dailyProfit =
            calculateDailyProfitSehemu15(
                price,
                roomNumber
            );


        await roomRef.update({

            number:
                roomNumber,

            price:
                price,

            dailyProfit:
                dailyProfit,

            days:
                ROOMRENT_ROOM_DAYS_SEHEMU15,

            updatedAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp()

        });


        alert(

            "✅ Chumba kimehaririwa!\n\n" +

            "📈 Faida mpya kwa siku: TSh " +
            dailyProfit +

            "\n📅 Muda: siku 40"

        );


        await onyeshaAdminRoomsSehemu15();


    } catch (error) {

        console.error(
            "Edit room error:",
            error
        );


        alert(
            "❌ " +
            error.message
        );

    }

}


/* =========================================================
   15.10 ACTIVATE / DEACTIVATE ROOM
========================================================= */

async function badilishaRoomStatusSehemu15(
    roomId
) {

    if (
        !requireAdminRoomSehemu15()
    ) {

        return;

    }


    try {

        const roomRef =
            db.collection(
                "rooms"
            )
            .doc(
                roomId
            );


        const roomSnap =
            await roomRef.get();


        if (
            !roomSnap.exists
        ) {

            alert(
                "❌ Chumba hakijapatikana."
            );

            return;

        }


        const room =
            roomSnap.data();


        const currentStatus =
            room.active !== false;


        const newStatus =
            !currentStatus;


        const confirmed =
            confirm(

                newStatus

                    ?

                    "Unataka ku-activate chumba hiki?"

                    :

                    "Unataka ku-deactivate chumba hiki?"

            );


        if (
            !confirmed
        ) {

            return;

        }


        await roomRef.update({

            active:
                newStatus,

            updatedAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp()

        });


        alert(

            newStatus

                ?

                "🟢 Chumba kime-activate."

                :

                "🔴 Chumba kime-deactivate."

        );


        await onyeshaAdminRoomsSehemu15();


    } catch (error) {

        alert(
            "❌ " +
            error.message
        );

    }

}


/* =========================================================
   15.11 SET ROOM IMAGE
========================================================= */

async function wekaRoomImageSehemu15(
    roomId
) {

    if (
        !requireAdminRoomSehemu15()
    ) {

        return;

    }


    const imageUrl =
        prompt(
            "Weka Image URL ya chumba:"
        );


    if (
        imageUrl === null
    ) {

        return;

    }


    const cleanUrl =
        imageUrl.trim();


    if (
        !cleanUrl
    ) {

        alert(
            "❌ Image URL inahitajika."
        );

        return;

    }


    if (

        !cleanUrl.startsWith(
            "https://"
        )

        &&

        !cleanUrl.startsWith(
            "http://"
        )

    ) {

        alert(
            "❌ URL lazima ianze na https:// au http://"
        );

        return;

    }


    try {

        await db.collection(
            "rooms"
        )
        .doc(
            roomId
        )
        .update({

            imageUrl:
                cleanUrl,

            updatedAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp()

        });


        alert(
            "🖼️ Picha imewekwa."
        );


        await onyeshaAdminRoomsSehemu15();


    } catch (error) {

        alert(
            "❌ " +
            error.message
        );

    }

}


/* =========================================================
   15.12 DELETE ROOM
========================================================= */

async function futaChumbaSehemu15(
    roomId
) {

    if (
        !requireAdminRoomSehemu15()
    ) {

        return;

    }


    const confirmed =
        confirm(
            "⚠️ Una uhakika unataka kufuta chumba hiki?"
        );


    if (
        !confirmed
    ) {

        return;

    }


    try {

        const roomRef =
            db.collection(
                "rooms"
            )
            .doc(
                roomId
            );


        const roomSnap =
            await roomRef.get();


        if (
            !roomSnap.exists
        ) {

            alert(
                "❌ Chumba hakijapatikana."
            );

            return;

        }


        const room =
            roomSnap.data();


        const bookingSnapshot =
            await db.collection(
                "bookings"
            )
            .where(
                "roomNumber",
                "==",
                room.number
            )
            .get();


        let hasActiveBooking =
            false;


        bookingSnapshot.forEach(
            doc => {

                const booking =
                    doc.data();


                if (
                    booking.status ===
                    "Active"
                ) {

                    hasActiveBooking =
                        true;

                }

            }
        );


        if (
            hasActiveBooking
        ) {

            alert(
                "❌ Huwezi kufuta chumba chenye Active Booking."
            );

            return;

        }


        await roomRef.delete();


        alert(
            "🗑️ Chumba kimefutwa."
        );


        await onyeshaAdminRoomsSehemu15();


    } catch (error) {

        console.error(
            "Delete room error:",
            error
        );


        alert(
            "❌ " +
            error.message
        );

    }

}


/* =========================================================
   15.13 CONNECT ADMIN ROOM BUTTON
========================================================= */

function connectAdminRoomsSehemu15() {

    window.onyeshaAdminRoomsSehemu14 =
        onyeshaAdminRoomsSehemu15;

}


/* =========================================================
   15.14 INITIALIZE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",

    function() {

        connectAdminRoomsSehemu15();


        console.log(
            "✅ Sehemu ya 15 iliyorekebishwa tayari."
        );

    }

);


/* =========================================================
   15.15 WINDOW EXPORTS
========================================================= */

window.calculateDailyProfitSehemu15 =
    calculateDailyProfitSehemu15;


window.syncDefaultRoomsSehemu15 =
    syncDefaultRoomsSehemu15;


window.onyeshaAdminRoomsSehemu15 =
    onyeshaAdminRoomsSehemu15;


window.ongezaChumbaSehemu15 =
    ongezaChumbaSehemu15;


window.haririChumbaSehemu15 =
    haririChumbaSehemu15;


window.badilishaRoomStatusSehemu15 =
    badilishaRoomStatusSehemu15;


window.wekaRoomImageSehemu15 =
    wekaRoomImageSehemu15;


window.futaChumbaSehemu15 =
    futaChumbaSehemu15;


/* =========================================================
   SEHEMU YA 15 IMEISHIA HAPA
========================================================= */
/* =========================================================
   ROOMRENT - SEHEMU YA 16
   CUSTOMER ROOM DISPLAY
   FIRESTORE ROOMS
========================================================= */


/* =========================================================
   16.1 FORMAT MONEY
========================================================= */

function formatMoneySehemu16(
    amount
) {

    return Number(
        amount || 0
    ).toLocaleString(
        "en-US"
    );

}


/* =========================================================
   16.2 ESCAPE HTML
========================================================= */

function escapeHtmlSehemu16(
    text
) {

    if (
        typeof escapeHtml ===
        "function"
    ) {

        return escapeHtml(
            String(text || "")
        );

    }


    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        String(text || "");


    return div.innerHTML;

}


/* =========================================================
   16.3 HIDE OTHER SECTIONS
========================================================= */

function fichaSectionsSehemu16() {

    const sections = [

        "fomuKodi",

        "taarifaSection"

    ];


    sections.forEach(
        id => {

            const element =
                document.getElementById(
                    id
                );


            if (
                element
            ) {

                element.style.display =
                    "none";

            }

        }
    );

}


/* =========================================================
   16.4 SHOW CUSTOMER ROOMS
========================================================= */

async function onyeshaVyumbaSehemu16() {

    const container =
        document.getElementById(
            "vyumba"
        );


    if (
        !container
    ) {

        console.error(
            "❌ #vyumba haijapatikana."
        );

        return;

    }


    fichaSectionsSehemu16();


    container.style.display =
        "block";


    container.innerHTML = `

        <div class="booking-card">

            <h2>
                🏠 Vyumba Vinavyopatikana
            </h2>


            <p>
                ⏳ Inapakia vyumba...
            </p>

        </div>

    `;


    try {

        const snapshot =
            await db.collection(
                "rooms"
            )
            .get();


        const rooms = [];


        snapshot.forEach(
            doc => {

                const room =
                    doc.data();


                /*
                 * CUSTOMER ANAONA
                 * ACTIVE ROOMS TU
                 */

                if (
                    room.active === false
                ) {

                    return;

                }


                rooms.push({

                    id:
                        doc.id,

                    ...room

                });

            }
        );


        /*
         * PANGA KWA NAMBA
         */

        rooms.sort(
            (a, b) => {

                return Number(
                    a.number || 0
                ) - Number(
                    b.number || 0
                );

            }
        );


        if (
            rooms.length === 0
        ) {

            container.innerHTML = `

                <div class="booking-card">

                    <h2>
                        🏠 Vyumba
                    </h2>


                    <p>
                        Kwa sasa hakuna vyumba vinavyopatikana.
                    </p>


                    <p>
                        Tafadhali jaribu tena baadaye.
                    </p>

                </div>

            `;

            return;

        }


        let html = `

            <div class="booking-card">

                <h2>
                    🏠 Vyumba Vinavyopatikana
                </h2>


                <p>
                    Chagua chumba unachotaka kukodi.
                </p>

            </div>

        `;


        rooms.forEach(
            room => {

                const roomNumber =
                    room.number ||
                    "-";


                const price =
                    Number(
                        room.price || 0
                    );


                /*
                 * RECALCULATE PROFIT
                 */

                let dailyProfit = 0;


                if (
                    typeof calculateDailyProfitSehemu15 ===
                    "function"
                ) {

                    dailyProfit =
                        calculateDailyProfitSehemu15(
                            price,
                            roomNumber
                        );

                }

                else {

                    dailyProfit =
                        Number(
                            room.dailyProfit || 0
                        );

                }


                /*
                 * ALL ROOMS
                 * 40 DAYS
                 */

                const days = 40;


                /*
                 * TOTAL PROFIT
                 */

                const totalProfit =
                    dailyProfit *
                    days;


                /*
                 * TOTAL RETURN
                 */

                const totalReturn =
                    price +
                    totalProfit;


                /*
                 * ROOM IMAGE
                 */

                let imageHtml = `

                    <div
                        class="room-image-placeholder"
                        style="
                            width:100%;
                            height:180px;
                            border:1px dashed #aaa;
                            border-radius:12px;
                            display:flex;
                            align-items:center;
                            justify-content:center;
                            margin-bottom:15px;
                        "
                    >

                        🏠 RoomRent

                    </div>

                `;


                if (
                    room.imageUrl
                ) {

                    imageHtml = `

                        <img
                            src="${escapeHtmlSehemu16(
                                room.imageUrl
                            )}"
                            alt="Chumba ${escapeHtmlSehemu16(
                                roomNumber
                            )}"
                            style="
                                width:100%;
                                height:180px;
                                object-fit:cover;
                                border-radius:12px;
                                margin-bottom:15px;
                            "
                        >

                    `;

                }


                html += `

                    <div
                        class="booking-card room-card"
                    >

                        ${imageHtml}


                        <h2>

                            🏠 Chumba
                            ${escapeHtmlSehemu16(
                                roomNumber
                            )}

                        </h2>


                        <p>

                            💰 Bei ya booking:

                            <strong>

                                TSh
                                ${formatMoneySehemu16(
                                    price
                                )}

                            </strong>

                        </p>


                        <p>

                            📈 Faida kwa siku:

                            <strong>

                                TSh
                                ${formatMoneySehemu16(
                                    dailyProfit
                                )}

                            </strong>

                        </p>


                        <p>

                            📅 Muda:

                            <strong>

                                ${days}
                                siku

                            </strong>

                        </p>


                        <hr>


                        <p>

                            📊 Jumla ya faida:

                            <strong>

                                TSh
                                ${formatMoneySehemu16(
                                    totalProfit
                                )}

                            </strong>

                        </p>


                        <p>

                            💵 Jumla utakayopata:

                            <strong>

                                TSh
                                ${formatMoneySehemu16(
                                    totalReturn
                                )}

                            </strong>

                        </p>


                        <button
                            class="thibitishaBtn"
                            onclick="funguaFomuKodiSehemu16('${room.id}')"
                        >

                            🏠 Kodi Chumba

                        </button>

                    </div>

                `;

            }
        );


        container.innerHTML =
            html;


    } catch (error) {

        console.error(
            "Show customer rooms error:",
            error
        );


        container.innerHTML = `

            <div class="booking-card">

                <h2>
                    🏠 Vyumba
                </h2>


                <p style="color:red;">

                    ❌ Imeshindikana kupakia vyumba.

                </p>


                <p>

                    ${escapeHtmlSehemu16(
                        error.message
                    )}

                </p>


                <button
                    class="endeleaBtn"
                    onclick="onyeshaVyumbaSehemu16()"
                >

                    🔄 Jaribu Tena

                </button>

            </div>

        `;

    }

}


/* =========================================================
   16.5 OPEN BOOKING FORM
========================================================= */

async function funguaFomuKodiSehemu16(
    roomId
) {

    /*
     * CHECK LOGIN
     */

    if (
        !firebase.auth()
            .currentUser
    ) {

        alert(
            "🔐 Tafadhali ingia kwenye Account kwanza."
        );


        const loginSection =
            document.getElementById(
                "emailLoginSection"
            );


        if (
            loginSection
        ) {

            loginSection.style.display =
                "block";

        }


        return;

    }


    const roomRef =
        db.collection(
            "rooms"
        )
        .doc(
            roomId
        );


    try {

        const roomSnap =
            await roomRef.get();


        if (
            !roomSnap.exists
        ) {

            alert(
                "❌ Chumba hakijapatikana."
            );

            return;

        }


        const room =
            roomSnap.data();


        /*
         * CHECK ACTIVE
         */

        if (
            room.active === false
        ) {

            alert(
                "❌ Chumba hiki hakipatikani kwa sasa."
            );

            return;

        }


        const roomNumber =
            room.number ||
            "-";


        const price =
            Number(
                room.price || 0
            );


        let dailyProfit =
            Number(
                room.dailyProfit || 0
            );


        if (
            typeof calculateDailyProfitSehemu15 ===
            "function"
        ) {

            dailyProfit =
                calculateDailyProfitSehemu15(
                    price,
                    roomNumber
                );

        }


        const days =
            40;


        const totalProfit =
            dailyProfit *
            days;


        const totalReturn =
            price +
            totalProfit;


        const roomsSection =
            document.getElementById(
                "vyumba"
            );


        const formSection =
            document.getElementById(
                "fomuKodi"
            );


        if (
            roomsSection
        ) {

            roomsSection.style.display =
                "none";

        }


        if (
            formSection
        ) {

            formSection.style.display =
                "block";

        }


        formSection.innerHTML = `

            <div class="booking-card">

                <button
                    class="endeleaBtn"
                    onclick="onyeshaVyumbaSehemu16()"
                >

                    ← Rudi Vyumba

                </button>


                <h2>
                    🏠 Kodi Chumba
                </h2>


                <h3>

                    Chumba
                    ${escapeHtmlSehemu16(
                        roomNumber
                    )}

                </h3>


                <p>

                    💰 Bei:

                    <strong>

                        TSh
                        ${formatMoneySehemu16(
                            price
                        )}

                    </strong>

                </p>


                <p>

                    📈 Faida kwa siku:

                    <strong>

                        TSh
                        ${formatMoneySehemu16(
                            dailyProfit
                        )}

                    </strong>

                </p>


                <p>

                    📅 Muda:
                    ${days} siku

                </p>


                <p>

                    📊 Jumla ya faida:

                    TSh
                    ${formatMoneySehemu16(
                        totalProfit
                    )}

                </p>


                <p>

                    💵 Jumla utakayopata:

                    TSh
                    ${formatMoneySehemu16(
                        totalReturn
                    )}

                </p>


                <hr>


                <label>
                    Jina lako
                </label>


                <input
                    type="text"
                    id="bookingNameSehemu16"
                    placeholder="Weka jina lako"
                >


                <label>
                    Namba ya simu
                </label>


                <input
                    type="tel"
                    id="bookingPhoneSehemu16"
                    placeholder="Mfano: 0712345678"
                >


                <label>
                    Referral Code (si lazima)
                </label>


                <input
                    type="text"
                    id="bookingReferralSehemu16"
                    placeholder="Mfano: RR1234"
                >


                <label>
                    Njia ya Malipo
                </label>


                <select
                    id="bookingPaymentMethodSehemu16"
                >

                    <option value="">
                        Chagua njia ya malipo
                    </option>


                    <option value="Airtel Money">
                        Airtel Money
                    </option>


                    <option value="MIXX BY YAS">
                        MIXX BY YAS
                    </option>

                </select>


                <button
                    class="thibitishaBtn"
                    onclick="endeleaBookingSehemu16('${roomId}')"
                >

                    ➡️ Endelea na Malipo

                </button>


            </div>

        `;


    } catch (error) {

        console.error(
            "Open booking form error:",
            error
        );


        alert(
            "❌ " +
            error.message
        );

    }

}


/* =========================================================
   16.6 CONTINUE BOOKING
   PREPARE PAYMENT DATA
========================================================= */

async function endeleaBookingSehemu16(
    roomId
) {

    const nameInput =
        document.getElementById(
            "bookingNameSehemu16"
        );


    const phoneInput =
        document.getElementById(
            "bookingPhoneSehemu16"
        );


    const referralInput =
        document.getElementById(
            "bookingReferralSehemu16"
        );


    const paymentInput =
        document.getElementById(
            "bookingPaymentMethodSehemu16"
        );


    const name =
        nameInput
            ?
            nameInput.value.trim()
            :
            "";


    const phone =
        phoneInput
            ?
            phoneInput.value.trim()
            :
            "";


    const referralCode =
        referralInput
            ?
            referralInput.value
                .trim()
                .toUpperCase()
            :
            "";


    const paymentMethod =
        paymentInput
            ?
            paymentInput.value
            :
            "";


    if (
        !name
    ) {

        alert(
            "❌ Tafadhali weka jina lako."
        );

        return;

    }


    if (
        !phone
    ) {

        alert(
            "❌ Tafadhali weka namba yako ya simu."
        );

        return;

    }


    if (
        !paymentMethod
    ) {

        alert(
            "❌ Chagua njia ya malipo."
        );

        return;

    }


    try {

        const roomSnap =
            await db.collection(
                "rooms"
            )
            .doc(
                roomId
            )
            .get();


        if (
            !roomSnap.exists
        ) {

            alert(
                "❌ Chumba hakijapatikana."
            );

            return;

        }


        const room =
            roomSnap.data();


        const price =
            Number(
                room.price || 0
            );


        const roomNumber =
            room.number ||
            "-";


        let dailyProfit =
            Number(
                room.dailyProfit || 0
            );


        if (
            typeof calculateDailyProfitSehemu15 ===
            "function"
        ) {

            dailyProfit =
                calculateDailyProfitSehemu15(
                    price,
                    roomNumber
                );

        }


        /*
         * SAVE TEMP BOOKING
         * FOR PAYMENT SECTION
         */

        window.roomrentPendingBookingSehemu16 = {

            roomId:
                roomId,

            roomNumber:
                roomNumber,

            name:
                name,

            phone:
                phone,

            referralCode:
                referralCode,

            paymentMethod:
                paymentMethod,

            price:
                price,

            dailyProfit:
                dailyProfit,

            days:
                40

        };


        /*
         * NEXT:
         * PAYMENT SCREEN
         */

        onyeshaPaymentSehemu16();


    } catch (error) {

        console.error(
            "Continue booking error:",
            error
        );


        alert(
            "❌ " +
            error.message
        );

    }

}


/* =========================================================
   16.7 PAYMENT SCREEN
   REAL RECEIVING DETAILS
========================================================= */

function onyeshaPaymentSehemu16() {

    const booking =
        window.roomrentPendingBookingSehemu16;


    if (
        !booking
    ) {

        alert(
            "❌ Taarifa za booking hazijapatikana."
        );

        return;

    }


    const formSection =
        document.getElementById(
            "fomuKodi"
        );


    if (
        !formSection
    ) {

        return;

    }


    /*
     * PAYMENT DETAILS
     */

    let paymentNumber = "";

    let paymentName =
        "HARUNA ISSA HAMAD";


    if (
        booking.paymentMethod ===
        "Airtel Money"
    ) {

        paymentNumber =
            "0667872515";

    }


    else if (
        booking.paymentMethod ===
        "MIXX BY YAS"
    ) {

        paymentNumber =
            "0651590936";

    }


    formSection.innerHTML = `

        <div class="booking-card">

            <button
                class="endeleaBtn"
                onclick="rudiBookingSehemu16('${booking.roomId}')"
            >

                ← Rudi

            </button>


            <h2>
                💳 Fanya Malipo
            </h2>


            <p>

                🏠 Chumba:

                <strong>
                    ${escapeHtmlSehemu16(
                        booking.roomNumber
                    )}
                </strong>

            </p>


            <p>

                💰 Kiasi cha kulipa:

                <strong>

                    TSh
                    ${formatMoneySehemu16(
                        booking.price
                    )}

                </strong>

            </p>


            <hr>


            <h3>

                ${escapeHtmlSehemu16(
                    booking.paymentMethod
                )}

            </h3>


            <p>

                Tuma malipo kwenye namba:

            </p>


            <h2>

                ${paymentNumber}

            </h2>


            <p>

                Jina la mpokeaji:

                <strong>

                    ${paymentName}

                </strong>

            </p>


            <hr>


            <p>

                Baada ya kufanya malipo,
                weka namba ya simu
                uliyotumia kutuma malipo.

            </p>


            <input
                type="tel"
                id="paymentPhoneSehemu16"
                placeholder="Namba uliyotumia kulipa"
            >


            <input
                type="text"
                id="paymentReferenceSehemu16"
                placeholder="Transaction / Reference Number (kama ipo)"
            >


            <button
                class="thibitishaBtn"
                onclick="thibitishaPaymentRequestSehemu16()"
            >

                ✅ Nimelipa

            </button>


        </div>

    `;

}


/* =========================================================
   16.8 BACK TO BOOKING
========================================================= */

function rudiBookingSehemu16(
    roomId
) {

    const booking =
        window.roomrentPendingBookingSehemu16;


    if (
        !booking
    ) {

        funguaFomuKodiSehemu16(
            roomId
        );

        return;

    }


    funguaFomuKodiSehemu16(
        roomId
    );

}


/* =========================================================
   16.9 EXPORT FUNCTIONS
========================================================= */

window.onyeshaVyumbaSehemu16 =
    onyeshaVyumbaSehemu16;


window.funguaFomuKodiSehemu16 =
    funguaFomuKodiSehemu16;


window.endeleaBookingSehemu16 =
    endeleaBookingSehemu16;


window.onyeshaPaymentSehemu16 =
    onyeshaPaymentSehemu16;


window.rudiBookingSehemu16 =
    rudiBookingSehemu16;


/* =========================================================
   SEHEMU YA 16 IMEISHIA HAPA
========================================================= *//* =========================================================
   ROOMRENT - SEHEMU YA 16
   CUSTOMER ROOM DISPLAY
   FIRESTORE ROOMS
========================================================= */


/* =========================================================
   16.1 FORMAT MONEY
========================================================= */

function formatMoneySehemu16(
    amount
) {

    return Number(
        amount || 0
    ).toLocaleString(
        "en-US"
    );

}


/* =========================================================
   16.2 ESCAPE HTML
========================================================= */

function escapeHtmlSehemu16(
    text
) {

    if (
        typeof escapeHtml ===
        "function"
    ) {

        return escapeHtml(
            String(text || "")
        );

    }


    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        String(text || "");


    return div.innerHTML;

}


/* =========================================================
   16.3 HIDE OTHER SECTIONS
========================================================= */

function fichaSectionsSehemu16() {

    const sections = [

        "fomuKodi",

        "taarifaSection"

    ];


    sections.forEach(
        id => {

            const element =
                document.getElementById(
                    id
                );


            if (
                element
            ) {

                element.style.display =
                    "none";

            }

        }
    );

}


/* =========================================================
   16.4 SHOW CUSTOMER ROOMS
========================================================= */

async function onyeshaVyumbaSehemu16() {

    const container =
        document.getElementById(
            "vyumba"
        );


    if (
        !container
    ) {

        console.error(
            "❌ #vyumba haijapatikana."
        );

        return;

    }


    fichaSectionsSehemu16();


    container.style.display =
        "block";


    container.innerHTML = `

        <div class="booking-card">

            <h2>
                🏠 Vyumba Vinavyopatikana
            </h2>


            <p>
                ⏳ Inapakia vyumba...
            </p>

        </div>

    `;


    try {

        const snapshot =
            await db.collection(
                "rooms"
            )
            .get();


        const rooms = [];


        snapshot.forEach(
            doc => {

                const room =
                    doc.data();


                /*
                 * CUSTOMER ANAONA
                 * ACTIVE ROOMS TU
                 */

                if (
                    room.active === false
                ) {

                    return;

                }


                rooms.push({

                    id:
                        doc.id,

                    ...room

                });

            }
        );


        /*
         * PANGA KWA NAMBA
         */

        rooms.sort(
            (a, b) => {

                return Number(
                    a.number || 0
                ) - Number(
                    b.number || 0
                );

            }
        );


        if (
            rooms.length === 0
        ) {

            container.innerHTML = `

                <div class="booking-card">

                    <h2>
                        🏠 Vyumba
                    </h2>


                    <p>
                        Kwa sasa hakuna vyumba vinavyopatikana.
                    </p>


                    <p>
                        Tafadhali jaribu tena baadaye.
                    </p>

                </div>

            `;

            return;

        }


        let html = `

            <div class="booking-card">

                <h2>
                    🏠 Vyumba Vinavyopatikana
                </h2>


                <p>
                    Chagua chumba unachotaka kukodi.
                </p>

            </div>

        `;


        rooms.forEach(
            room => {

                const roomNumber =
                    room.number ||
                    "-";


                const price =
                    Number(
                        room.price || 0
                    );


                /*
                 * RECALCULATE PROFIT
                 */

                let dailyProfit = 0;


                if (
                    typeof calculateDailyProfitSehemu15 ===
                    "function"
                ) {

                    dailyProfit =
                        calculateDailyProfitSehemu15(
                            price,
                            roomNumber
                        );

                }

                else {

                    dailyProfit =
                        Number(
                            room.dailyProfit || 0
                        );

                }


                /*
                 * ALL ROOMS
                 * 40 DAYS
                 */

                const days = 40;


                /*
                 * TOTAL PROFIT
                 */

                const totalProfit =
                    dailyProfit *
                    days;


                /*
                 * TOTAL RETURN
                 */

                const totalReturn =
                    price +
                    totalProfit;


                /*
                 * ROOM IMAGE
                 */

                let imageHtml = `

                    <div
                        class="room-image-placeholder"
                        style="
                            width:100%;
                            height:180px;
                            border:1px dashed #aaa;
                            border-radius:12px;
                            display:flex;
                            align-items:center;
                            justify-content:center;
                            margin-bottom:15px;
                        "
                    >

                        🏠 RoomRent

                    </div>

                `;


                if (
                    room.imageUrl
                ) {

                    imageHtml = `

                        <img
                            src="${escapeHtmlSehemu16(
                                room.imageUrl
                            )}"
                            alt="Chumba ${escapeHtmlSehemu16(
                                roomNumber
                            )}"
                            style="
                                width:100%;
                                height:180px;
                                object-fit:cover;
                                border-radius:12px;
                                margin-bottom:15px;
                            "
                        >

                    `;

                }


                html += `

                    <div
                        class="booking-card room-card"
                    >

                        ${imageHtml}


                        <h2>

                            🏠 Chumba
                            ${escapeHtmlSehemu16(
                                roomNumber
                            )}

                        </h2>


                        <p>

                            💰 Bei ya booking:

                            <strong>

                                TSh
                                ${formatMoneySehemu16(
                                    price
                                )}

                            </strong>

                        </p>


                        <p>

                            📈 Faida kwa siku:

                            <strong>

                                TSh
                                ${formatMoneySehemu16(
                                    dailyProfit
                                )}

                            </strong>

                        </p>


                        <p>

                            📅 Muda:

                            <strong>

                                ${days}
                                siku

                            </strong>

                        </p>


                        <hr>


                        <p>

                            📊 Jumla ya faida:

                            <strong>

                                TSh
                                ${formatMoneySehemu16(
                                    totalProfit
                                )}

                            </strong>

                        </p>


                        <p>

                            💵 Jumla utakayopata:

                            <strong>

                                TSh
                                ${formatMoneySehemu16(
                                    totalReturn
                                )}

                            </strong>

                        </p>


                        <button
                            class="thibitishaBtn"
                            onclick="funguaFomuKodiSehemu16('${room.id}')"
                        >

                            🏠 Kodi Chumba

                        </button>

                    </div>

                `;

            }
        );


        container.innerHTML =
            html;


    } catch (error) {

        console.error(
            "Show customer rooms error:",
            error
        );


        container.innerHTML = `

            <div class="booking-card">

                <h2>
                    🏠 Vyumba
                </h2>


                <p style="color:red;">

                    ❌ Imeshindikana kupakia vyumba.

                </p>


                <p>

                    ${escapeHtmlSehemu16(
                        error.message
                    )}

                </p>


                <button
                    class="endeleaBtn"
                    onclick="onyeshaVyumbaSehemu16()"
                >

                    🔄 Jaribu Tena

                </button>

            </div>

        `;

    }

}


/* =========================================================
   16.5 OPEN BOOKING FORM
========================================================= */

async function funguaFomuKodiSehemu16(
    roomId
) {

    /*
     * CHECK LOGIN
     */

    if (
        !firebase.auth()
            .currentUser
    ) {

        alert(
            "🔐 Tafadhali ingia kwenye Account kwanza."
        );


        const loginSection =
            document.getElementById(
                "emailLoginSection"
            );


        if (
            loginSection
        ) {

            loginSection.style.display =
                "block";

        }


        return;

    }


    const roomRef =
        db.collection(
            "rooms"
        )
        .doc(
            roomId
        );


    try {

        const roomSnap =
            await roomRef.get();


        if (
            !roomSnap.exists
        ) {

            alert(
                "❌ Chumba hakijapatikana."
            );

            return;

        }


        const room =
            roomSnap.data();


        /*
         * CHECK ACTIVE
         */

        if (
            room.active === false
        ) {

            alert(
                "❌ Chumba hiki hakipatikani kwa sasa."
            );

            return;

        }


        const roomNumber =
            room.number ||
            "-";


        const price =
            Number(
                room.price || 0
            );


        let dailyProfit =
            Number(
                room.dailyProfit || 0
            );


        if (
            typeof calculateDailyProfitSehemu15 ===
            "function"
        ) {

            dailyProfit =
                calculateDailyProfitSehemu15(
                    price,
                    roomNumber
                );

        }


        const days =
            40;


        const totalProfit =
            dailyProfit *
            days;


        const totalReturn =
            price +
            totalProfit;


        const roomsSection =
            document.getElementById(
                "vyumba"
            );


        const formSection =
            document.getElementById(
                "fomuKodi"
            );


        if (
            roomsSection
        ) {

            roomsSection.style.display =
                "none";

        }


        if (
            formSection
        ) {

            formSection.style.display =
                "block";

        }


        formSection.innerHTML = `

            <div class="booking-card">

                <button
                    class="endeleaBtn"
                    onclick="onyeshaVyumbaSehemu16()"
                >

                    ← Rudi Vyumba

                </button>


                <h2>
                    🏠 Kodi Chumba
                </h2>


                <h3>

                    Chumba
                    ${escapeHtmlSehemu16(
                        roomNumber
                    )}

                </h3>


                <p>

                    💰 Bei:

                    <strong>

                        TSh
                        ${formatMoneySehemu16(
                            price
                        )}

                    </strong>

                </p>


                <p>

                    📈 Faida kwa siku:

                    <strong>

                        TSh
                        ${formatMoneySehemu16(
                            dailyProfit
                        )}

                    </strong>

                </p>


                <p>

                    📅 Muda:
                    ${days} siku

                </p>


                <p>

                    📊 Jumla ya faida:

                    TSh
                    ${formatMoneySehemu16(
                        totalProfit
                    )}

                </p>


                <p>

                    💵 Jumla utakayopata:

                    TSh
                    ${formatMoneySehemu16(
                        totalReturn
                    )}

                </p>


                <hr>


                <label>
                    Jina lako
                </label>


                <input
                    type="text"
                    id="bookingNameSehemu16"
                    placeholder="Weka jina lako"
                >


                <label>
                    Namba ya simu
                </label>


                <input
                    type="tel"
                    id="bookingPhoneSehemu16"
                    placeholder="Mfano: 0712345678"
                >


                <label>
                    Referral Code (si lazima)
                </label>


                <input
                    type="text"
                    id="bookingReferralSehemu16"
                    placeholder="Mfano: RR1234"
                >


                <label>
                    Njia ya Malipo
                </label>


                <select
                    id="bookingPaymentMethodSehemu16"
                >

                    <option value="">
                        Chagua njia ya malipo
                    </option>


                    <option value="Airtel Money">
                        Airtel Money
                    </option>


                    <option value="MIXX BY YAS">
                        MIXX BY YAS
                    </option>

                </select>


                <button
                    class="thibitishaBtn"
                    onclick="endeleaBookingSehemu16('${roomId}')"
                >

                    ➡️ Endelea na Malipo

                </button>


            </div>

        `;


    } catch (error) {

        console.error(
            "Open booking form error:",
            error
        );


        alert(
            "❌ " +
            error.message
        );

    }

}


/* =========================================================
   16.6 CONTINUE BOOKING
   PREPARE PAYMENT DATA
========================================================= */

async function endeleaBookingSehemu16(
    roomId
) {

    const nameInput =
        document.getElementById(
            "bookingNameSehemu16"
        );


    const phoneInput =
        document.getElementById(
            "bookingPhoneSehemu16"
        );


    const referralInput =
        document.getElementById(
            "bookingReferralSehemu16"
        );


    const paymentInput =
        document.getElementById(
            "bookingPaymentMethodSehemu16"
        );


    const name =
        nameInput
            ?
            nameInput.value.trim()
            :
            "";


    const phone =
        phoneInput
            ?
            phoneInput.value.trim()
            :
            "";


    const referralCode =
        referralInput
            ?
            referralInput.value
                .trim()
                .toUpperCase()
            :
            "";


    const paymentMethod =
        paymentInput
            ?
            paymentInput.value
            :
            "";


    if (
        !name
    ) {

        alert(
            "❌ Tafadhali weka jina lako."
        );

        return;

    }


    if (
        !phone
    ) {

        alert(
            "❌ Tafadhali weka namba yako ya simu."
        );

        return;

    }


    if (
        !paymentMethod
    ) {

        alert(
            "❌ Chagua njia ya malipo."
        );

        return;

    }


    try {

        const roomSnap =
            await db.collection(
                "rooms"
            )
            .doc(
                roomId
            )
            .get();


        if (
            !roomSnap.exists
        ) {

            alert(
                "❌ Chumba hakijapatikana."
            );

            return;

        }


        const room =
            roomSnap.data();


        const price =
            Number(
                room.price || 0
            );


        const roomNumber =
            room.number ||
            "-";


        let dailyProfit =
            Number(
                room.dailyProfit || 0
            );


        if (
            typeof calculateDailyProfitSehemu15 ===
            "function"
        ) {

            dailyProfit =
                calculateDailyProfitSehemu15(
                    price,
                    roomNumber
                );

        }


        /*
         * SAVE TEMP BOOKING
         * FOR PAYMENT SECTION
         */

        window.roomrentPendingBookingSehemu16 = {

            roomId:
                roomId,

            roomNumber:
                roomNumber,

            name:
                name,

            phone:
                phone,

            referralCode:
                referralCode,

            paymentMethod:
                paymentMethod,

            price:
                price,

            dailyProfit:
                dailyProfit,

            days:
                40

        };


        /*
         * NEXT:
         * PAYMENT SCREEN
         */

        onyeshaPaymentSehemu16();


    } catch (error) {

        console.error(
            "Continue booking error:",
            error
        );


        alert(
            "❌ " +
            error.message
        );

    }

}


/* =========================================================
   16.7 PAYMENT SCREEN
   REAL RECEIVING DETAILS
========================================================= */

function onyeshaPaymentSehemu16() {

    const booking =
        window.roomrentPendingBookingSehemu16;


    if (
        !booking
    ) {

        alert(
            "❌ Taarifa za booking hazijapatikana."
        );

        return;

    }


    const formSection =
        document.getElementById(
            "fomuKodi"
        );


    if (
        !formSection
    ) {

        return;

    }


    /*
     * PAYMENT DETAILS
     */

    let paymentNumber = "";

    let paymentName =
        "HARUNA ISSA HAMAD";


    if (
        booking.paymentMethod ===
        "Airtel Money"
    ) {

        paymentNumber =
            "0667872515";

    }


    else if (
        booking.paymentMethod ===
        "MIXX BY YAS"
    ) {

        paymentNumber =
            "0651590936";

    }


    formSection.innerHTML = `

        <div class="booking-card">

            <button
                class="endeleaBtn"
                onclick="rudiBookingSehemu16('${booking.roomId}')"
            >

                ← Rudi

            </button>


            <h2>
                💳 Fanya Malipo
            </h2>


            <p>

                🏠 Chumba:

                <strong>
                    ${escapeHtmlSehemu16(
                        booking.roomNumber
                    )}
                </strong>

            </p>


            <p>

                💰 Kiasi cha kulipa:

                <strong>

                    TSh
                    ${formatMoneySehemu16(
                        booking.price
                    )}

                </strong>

            </p>


            <hr>


            <h3>

                ${escapeHtmlSehemu16(
                    booking.paymentMethod
                )}

            </h3>


            <p>

                Tuma malipo kwenye namba:

            </p>


            <h2>

                ${paymentNumber}

            </h2>


            <p>

                Jina la mpokeaji:

                <strong>

                    ${paymentName}

                </strong>

            </p>


            <hr>


            <p>

                Baada ya kufanya malipo,
                weka namba ya simu
                uliyotumia kutuma malipo.

            </p>


            <input
                type="tel"
                id="paymentPhoneSehemu16"
                placeholder="Namba uliyotumia kulipa"
            >


            <input
                type="text"
                id="paymentReferenceSehemu16"
                placeholder="Transaction / Reference Number (kama ipo)"
            >


            <button
                class="thibitishaBtn"
                onclick="thibitishaPaymentRequestSehemu16()"
            >

                ✅ Nimelipa

            </button>


        </div>

    `;

}


/* =========================================================
   16.8 BACK TO BOOKING
========================================================= */

function rudiBookingSehemu16(
    roomId
) {

    const booking =
        window.roomrentPendingBookingSehemu16;


    if (
        !booking
    ) {

        funguaFomuKodiSehemu16(
            roomId
        );

        return;

    }


    funguaFomuKodiSehemu16(
        roomId
    );

}


/* =========================================================
   16.9 EXPORT FUNCTIONS
========================================================= */

window.onyeshaVyumbaSehemu16 =
    onyeshaVyumbaSehemu16;


window.funguaFomuKodiSehemu16 =
    funguaFomuKodiSehemu16;


window.endeleaBookingSehemu16 =
    endeleaBookingSehemu16;


window.onyeshaPaymentSehemu16 =
    onyeshaPaymentSehemu16;


window.rudiBookingSehemu16 =
    rudiBookingSehemu16;


/* =========================================================
   SEHEMU YA 16 IMEISHIA HAPA
========================================================= */
/* =========================================================
   ROOMRENT - SEHEMU YA 17
   SAVE BOOKING + PAYMENT REQUEST
   FIRESTORE
========================================================= */


/* =========================================================
   17.1 GENERATE BOOKING NUMBER
========================================================= */

function generateBookingNumberSehemu17() {

    const time =
        Date.now()
            .toString();


    const random =
        Math.floor(
            Math.random() *
            9000
        ) + 1000;


    return (
        "RR" +
        time.slice(-8) +
        random
    );

}


/* =========================================================
   17.2 FORMAT TANZANIA PHONE
========================================================= */

function formatBookingPhoneSehemu17(
    phone
) {

    if (
        !phone
    ) {

        return "";

    }


    let clean =
        String(phone)
            .trim()
            .replace(
                /\s+/g,
                ""
            )
            .replace(
                /-/g,
                ""
            );


    /*
     * +255XXXXXXXXX
     */

    if (
        clean.startsWith(
            "+255"
        )
    ) {

        clean =
            "255" +
            clean.slice(4);

    }


    /*
     * 0XXXXXXXXX
     */

    if (
        clean.startsWith(
            "0"
        )
    ) {

        clean =
            "255" +
            clean.slice(1);

    }


    /*
     * 7XXXXXXXX
     * 6XXXXXXXX
     */

    if (

        clean.length === 9

        &&

        (
            clean.startsWith("6") ||
            clean.startsWith("7")
        )

    ) {

        clean =
            "255" +
            clean;

    }


    return clean;

}


/* =========================================================
   17.3 VALIDATE PHONE
========================================================= */

function isValidBookingPhoneSehemu17(
    phone
) {

    const formatted =
        formatBookingPhoneSehemu17(
            phone
        );


    return (
        formatted.length === 12
        &&
        formatted.startsWith(
            "255"
        )
    );

}


/* =========================================================
   17.4 GET PAYMENT DETAILS
========================================================= */

function getPaymentDetailsSehemu17(
    paymentMethod
) {

    const details = {

        "Airtel Money": {

            number:
                "0667872515",

            name:
                "HARUNA ISSA HAMAD"

        },


        "MIXX BY YAS": {

            number:
                "0651590936",

            name:
                "HARUNA ISSA HAMAD"

        }

    };


    return (
        details[
            paymentMethod
        ]
        ||
        null
    );

}


/* =========================================================
   17.5 CHECK REFERRAL CODE
========================================================= */

async function checkReferralCodeSehemu17(
    referralCode,
    currentUserId
) {

    if (
        !referralCode
    ) {

        return {

            valid:
                false,

            empty:
                true,

            user:
                null

        };

    }


    try {

        const code =
            referralCode
                .trim()
                .toUpperCase();


        /*
         * ADMIN CODE
         */

        if (
            code ===
            "RRADMIN"
        ) {

            return {

                valid:
                    true,

                empty:
                    false,

                type:
                    "admin",

                user: {

                    uid:
                        "RRADMIN",

                    name:
                        "RoomRent Admin",

                    referralCode:
                        "RRADMIN"

                }

            };

        }


        /*
         * SEARCH USER
         */

        const snapshot =
            await db.collection(
                "users"
            )
            .where(
                "referralCode",
                "==",
                code
            )
            .limit(1)
            .get();


        if (
            snapshot.empty
        ) {

            return {

                valid:
                    false,

                empty:
                    false,

                user:
                    null

            };

        }


        const referralDoc =
            snapshot.docs[0];


        /*
         * USER ASIJITUMIE
         * REFERRAL YAKE MWENYEWE
         */

        if (
            referralDoc.id ===
            currentUserId
        ) {

            return {

                valid:
                    false,

                selfReferral:
                    true,

                user:
                    null

            };

        }


        return {

            valid:
                true,

            empty:
                false,

            type:
                "user",

            user: {

                uid:
                    referralDoc.id,

                ...referralDoc.data()

            }

        };


    } catch (error) {

        console.error(
            "Referral check error:",
            error
        );


        return {

            valid:
                false,

            error:
                true,

            user:
                null

        };

    }

}


/* =========================================================
   17.6 CREATE ADMIN NOTIFICATION
========================================================= */

async function createAdminNotificationSehemu17(
    bookingData
) {

    try {

        await db.collection(
            "notifications"
        )
        .add({

            type:
                "payment_request",

            title:
                "💳 Payment Request Mpya",

            message:

                bookingData.customerName +

                " ameomba uthibitisho wa malipo ya TSh " +

                formatMoneySehemu16(
                    bookingData.price
                )

                +

                " kwa chumba " +

                bookingData.roomNumber,

            bookingId:
                bookingData.id,

            bookingNumber:
                bookingData.bookingNumber,

            userId:
                bookingData.userId,

            roomNumber:
                bookingData.roomNumber,

            amount:
                bookingData.price,

            read:
                false,

            target:
                "admin",

            createdAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp()

        });


    } catch (error) {

        console.error(
            "Admin notification error:",
            error
        );

    }

}


/* =========================================================
   17.7 CREATE USER NOTIFICATION
========================================================= */

async function createUserNotificationSehemu17(
    bookingData
) {

    try {

        await db.collection(
            "notifications"
        )
        .add({

            type:
                "payment_waiting",

            title:
                "⏳ Malipo Yanasubiri Uthibitisho",

            message:

                "Booking yako ya chumba " +

                bookingData.roomNumber +

                " inasubiri Admin kuthibitisha malipo yako.",

            bookingId:
                bookingData.id,

            bookingNumber:
                bookingData.bookingNumber,

            userId:
                bookingData.userId,

            read:
                false,

            target:
                "user",

            createdAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp()

        });


    } catch (error) {

        console.error(
            "User notification error:",
            error
        );

    }

}


/* =========================================================
   17.8 SAVE PAYMENT REQUEST
========================================================= */

async function thibitishaPaymentRequestSehemu17() {

    /*
     * PREVENT DOUBLE CLICK
     */

    if (
        window.roomrentSavingBookingSehemu17
    ) {

        return;

    }


    const booking =
        window.roomrentPendingBookingSehemu16;


    if (
        !booking
    ) {

        alert(
            "❌ Taarifa za booking hazijapatikana. Tafadhali anza tena."
        );

        return;

    }


    /*
     * CHECK LOGIN
     */

    const currentUser =
        firebase.auth()
            .currentUser;


    if (
        !currentUser
    ) {

        alert(
            "🔐 Tafadhali ingia kwenye Account kwanza."
        );

        return;

    }


    /*
     * PAYMENT PHONE
     */

    const paymentPhoneInput =
        document.getElementById(
            "paymentPhoneSehemu16"
        );


    const paymentReferenceInput =
        document.getElementById(
            "paymentReferenceSehemu16"
        );


    const paymentPhone =
        paymentPhoneInput
            ?
            paymentPhoneInput.value.trim()
            :
            "";


    const paymentReference =
        paymentReferenceInput
            ?
            paymentReferenceInput.value.trim()
            :
            "";


    if (
        !paymentPhone
    ) {

        alert(
            "❌ Tafadhali weka namba uliyotumia kulipa."
        );

        return;

    }


    if (
        !isValidBookingPhoneSehemu17(
            paymentPhone
        )
    ) {

        alert(
            "❌ Weka namba sahihi ya Tanzania."
        );

        return;

    }


    /*
     * CHECK PAYMENT DETAILS
     */

    const paymentDetails =
        getPaymentDetailsSehemu17(
            booking.paymentMethod
        );


    if (
        !paymentDetails
    ) {

        alert(
            "❌ Njia ya malipo haijulikani."
        );

        return;

    }


    window.roomrentSavingBookingSehemu17 =
        true;


    const button =
        document.querySelector(
            '[onclick="thibitishaPaymentRequestSehemu17()"]'
        );


    if (
        button
    ) {

        button.disabled =
            true;


        button.innerText =
            "⏳ Inahifadhi...";

    }


    try {

        /*
         * CHECK ROOM AGAIN
         */

        const roomSnap =
            await db.collection(
                "rooms"
            )
            .doc(
                booking.roomId
            )
            .get();


        if (
            !roomSnap.exists
        ) {

            throw new Error(
                "Chumba hakipatikani tena."
            );

        }


        const room =
            roomSnap.data();


        if (
            room.active === false
        ) {

            throw new Error(
                "Chumba hiki hakipatikani kwa sasa."
            );

        }


        /*
         * VALIDATE REFERRAL
         */

        const referralResult =
            await checkReferralCodeSehemu17(
                booking.referralCode,
                currentUser.uid
            );


        if (

            booking.referralCode

            &&

            !referralResult.valid

        ) {

            if (
                referralResult.selfReferral
            ) {

                throw new Error(
                    "Huwezi kutumia Referral Code yako mwenyewe."
                );

            }


            throw new Error(
                "Referral Code si sahihi."
            );

        }


        /*
         * CALCULATE CURRENT VALUES
         */

        const roomNumber =
            room.number ||
            booking.roomNumber;


        const price =
            Number(
                room.price ||
                booking.price ||
                0
            );


        let dailyProfit =
            Number(
                room.dailyProfit || 0
            );


        if (
            typeof calculateDailyProfitSehemu15 ===
            "function"
        ) {

            dailyProfit =
                calculateDailyProfitSehemu15(
                    price,
                    roomNumber
                );

        }


        const days =
            40;


        const totalProfit =
            dailyProfit *
            days;


        const totalReturn =
            price +
            totalProfit;


        /*
         * BOOKING NUMBER
         */

        const bookingNumber =
            generateBookingNumberSehemu17();


        /*
         * CREATE BOOKING
         */

        const bookingRef =
            db.collection(
                "bookings"
            )
            .doc();


        const bookingData = {

            id:
                bookingRef.id,

            bookingNumber:
                bookingNumber,


            /*
             * USER
             */

            userId:
                currentUser.uid,

            userEmail:
                currentUser.email ||
                "",


            /*
             * CUSTOMER
             */

            customerName:
                booking.name,

            customerPhone:
                formatBookingPhoneSehemu17(
                    booking.phone
                ),


            /*
             * ROOM
             */

            roomId:
                booking.roomId,

            roomNumber:
                roomNumber,


            /*
             * MONEY
             */

            price:
                price,

            dailyProfit:
                dailyProfit,

            days:
                days,

            totalProfit:
                totalProfit,

            totalReturn:
                totalReturn,


            /*
             * PAYMENT
             */

            paymentMethod:
                booking.paymentMethod,

            paymentReceiverNumber:
                paymentDetails.number,

            paymentReceiverName:
                paymentDetails.name,

            paymentPhone:
                formatBookingPhoneSehemu17(
                    paymentPhone
                ),

            paymentReference:
                paymentReference,

            paymentStatus:
                "Waiting Confirmation",


            /*
             * BOOKING STATUS
             */

            status:
                "Pending",


            /*
             * REFERRAL
             */

            referralCode:
                booking.referralCode || "",

            referredBy:
                referralResult.valid
                    ?
                    referralResult.user.uid
                    :
                    "",

            referralType:
                referralResult.valid
                    ?
                    referralResult.type
                    :
                    "",


            /*
             * DATES
             */

            createdAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp(),

            updatedAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp()

        };


        /*
         * SAVE
         */

        await bookingRef.set(
            bookingData
        );


        /*
         * CREATE NOTIFICATIONS
         */

        await createAdminNotificationSehemu17(
            bookingData
        );


        await createUserNotificationSehemu17(
            bookingData
        );


        /*
         * CLEAR TEMP DATA
         */

        window.roomrentPendingBookingSehemu16 =
            null;


        /*
         * SUCCESS
         */

        onyeshaPaymentWaitingSehemu17(
            bookingData
        );


    } catch (error) {

        console.error(
            "Save payment request error:",
            error
        );


        alert(
            "❌ " +
            (
                error.message ||
                "Imeshindikana kuhifadhi booking."
            )
        );


        if (
            button
        ) {

            button.disabled =
                false;


            button.innerText =
                "✅ Nimelipa";

        }


    } finally {

        window.roomrentSavingBookingSehemu17 =
            false;

    }

}


/* =========================================================
   17.9 SHOW WAITING SCREEN
========================================================= */

function onyeshaPaymentWaitingSehemu17(
    bookingData
) {

    const section =
        document.getElementById(
            "fomuKodi"
        );


    if (
        !section
    ) {

        return;

    }


    section.style.display =
        "block";


    section.innerHTML = `

        <div class="booking-card">

            <h2>
                ⏳ Malipo Yanasubiri Uthibitisho
            </h2>


            <p>

                Asante
                <strong>

                    ${escapeHtmlSehemu16(
                        bookingData.customerName
                    )}

                </strong>.

            </p>


            <p>

                Taarifa zako za malipo
                zimepokelewa.

            </p>


            <hr>


            <p>

                📋 Booking Number:

                <strong>

                    ${escapeHtmlSehemu16(
                        bookingData.bookingNumber
                    )}

                </strong>

            </p>


            <p>

                🏠 Chumba:

                <strong>

                    ${escapeHtmlSehemu16(
                        bookingData.roomNumber
                    )}

                </strong>

            </p>


            <p>

                💰 Kiasi:

                <strong>

                    TSh
                    ${formatMoneySehemu16(
                        bookingData.price
                    )}

                </strong>

            </p>


            <p>

                💳 Njia ya malipo:

                <strong>

                    ${escapeHtmlSehemu16(
                        bookingData.paymentMethod
                    )}

                </strong>

            </p>


            <hr>


            <p>

                🔔 Admin atathibitisha malipo yako.

            </p>


            <p>

                Baada ya uthibitisho,
                Booking yako itaanza rasmi.

            </p>


            <button
                class="thibitishaBtn"
                onclick="funguaBookingZanguSehemu17()"
            >

                📋 Angalia Booking Zangu

            </button>


            <button
                class="endeleaBtn"
                onclick="onyeshaVyumbaSehemu16()"
            >

                🏠 Rudi Vyumba

            </button>

        </div>

    `;

}


/* =========================================================
   17.10 OPEN MY BOOKINGS
========================================================= */

async function funguaBookingZanguSehemu17() {

    const currentUser =
        firebase.auth()
            .currentUser;


    if (
        !currentUser
    ) {

        alert(
            "🔐 Tafadhali ingia kwanza."
        );

        return;

    }


    const section =
        document.getElementById(
            "taarifaSection"
        );


    if (
        !section
    ) {

        return;

    }


    /*
     * HIDE OTHERS
     */

    const rooms =
        document.getElementById(
            "vyumba"
        );


    const form =
        document.getElementById(
            "fomuKodi"
        );


    if (rooms) {

        rooms.style.display =
            "none";

    }


    if (form) {

        form.style.display =
            "none";

    }


    section.style.display =
        "block";


    section.innerHTML = `

        <div class="booking-card">

            <h2>
                📋 Booking Zangu
            </h2>


            <p>
                ⏳ Inapakia...
            </p>

        </div>

    `;


    try {

        const snapshot =
            await db.collection(
                "bookings"
            )
            .where(
                "userId",
                "==",
                currentUser.uid
            )
            .get();


        const bookings = [];


        snapshot.forEach(
            doc => {

                bookings.push({

                    id:
                        doc.id,

                    ...doc.data()

                });

            }
        );


        /*
         * SORT NEWEST FIRST
         */

        bookings.sort(
            (a, b) => {

                const aTime =
                    a.createdAt &&
                    a.createdAt.toMillis
                        ?
                        a.createdAt.toMillis()
                        :
                        0;


                const bTime =
                    b.createdAt &&
                    b.createdAt.toMillis
                        ?
                        b.createdAt.toMillis()
                        :
                        0;


                return (
                    bTime -
                    aTime
                );

            }
        );


        let html = `

            <div class="booking-card">

                <h2>
                    📋 Booking Zangu
                </h2>

            </div>

        `;


        if (
            bookings.length === 0
        ) {

            html += `

                <div class="booking-card">

                    <p>
                        Bado hujafanya Booking yoyote.
                    </p>


                    <button
                        class="thibitishaBtn"
                        onclick="onyeshaVyumbaSehemu16()"
                    >

                        🏠 Angalia Vyumba

                    </button>

                </div>

            `;

        }


        bookings.forEach(
            booking => {

                let statusIcon =
                    "⏳";


                let statusText =
                    booking.paymentStatus ||
                    "Pending";


                if (
                    booking.paymentStatus ===
                    "Confirmed"
                ) {

                    statusIcon =
                        "✅";

                }


                if (
                    booking.paymentStatus ===
                    "Rejected"
                ) {

                    statusIcon =
                        "❌";

                }


                html += `

                    <div
                        class="booking-card"
                        style="
                            margin-bottom:15px;
                        "
                    >

                        <h3>

                            ${statusIcon}

                            Chumba

                            ${escapeHtmlSehemu16(
                                booking.roomNumber
                            )}

                        </h3>


                        <p>

                            📋 Booking:

                            <strong>

                                ${escapeHtmlSehemu16(
                                    booking.bookingNumber
                                )}

                            </strong>

                        </p>


                        <p>

                            💰 Bei:

                            TSh

                            ${formatMoneySehemu16(
                                booking.price
                            )}

                        </p>


                        <p>

                            📈 Faida kwa siku:

                            TSh

                            ${formatMoneySehemu16(
                                booking.dailyProfit
                            )}

                        </p>


                        <p>

                            📅 Muda:

                            ${booking.days || 40}

                            siku

                        </p>


                        <p>

                            💳 Malipo:

                            <strong>

                                ${escapeHtmlSehemu16(
                                    statusText
                                )}

                            </strong>

                        </p>


                        <p>

                            📌 Booking Status:

                            <strong>

                                ${escapeHtmlSehemu16(
                                    booking.status ||
                                    "Pending"
                                )}

                            </strong>

                        </p>

                    </div>

                `;

            }
        );


        section.innerHTML =
            html;


    } catch (error) {

        console.error(
            "My bookings error:",
            error
        );


        section.innerHTML = `

            <div class="booking-card">

                <h2>
                    📋 Booking Zangu
                </h2>


                <p style="color:red;">

                    ❌ Imeshindikana kupakia Booking.

                </p>


                <p>

                    ${escapeHtmlSehemu16(
                        error.message
                    )}

                </p>

            </div>

        `;

    }

}


/* =========================================================
   17.11 CONNECT PAYMENT BUTTON
========================================================= */

window.thibitishaPaymentRequestSehemu16 =
    thibitishaPaymentRequestSehemu17;


/*
 * REPLACE FUNCTION
 * USED BY BUTTON IN PAYMENT SCREEN
 */

function connectPaymentButtonSehemu17() {

    /*
     * CREATE GLOBAL FUNCTION
     */

    window.thibitishaPaymentRequestSehemu16 =
        thibitishaPaymentRequestSehemu17;

}


/* =========================================================
   17.12 CONNECT BOOKING ZANGU BUTTON
========================================================= */

function connectBookingZanguSehemu17() {

    const button =
        document.getElementById(
            "bookingZangu"
        );


    if (
        button
    ) {

        button.addEventListener(
            "click",

            function() {

                funguaBookingZanguSehemu17();

            }

        );

    }

}


/* =========================================================
   17.13 INITIALIZE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",

    function() {

        connectPaymentButtonSehemu17();


        connectBookingZanguSehemu17();


        console.log(
            "✅ Sehemu ya 17 tayari."
        );

    }

);


/* =========================================================
   17.14 EXPORTS
========================================================= */

window.thibitishaPaymentRequestSehemu17 =
    thibitishaPaymentRequestSehemu17;


window.funguaBookingZanguSehemu17 =
    funguaBookingZanguSehemu17;


window.checkReferralCodeSehemu17 =
    checkReferralCodeSehemu17;


/* =========================================================
   SEHEMU YA 17 IMEISHIA HAPA
========================================================= *//* =========================================================
   ROOMRENT - SEHEMU YA 17
   SAVE BOOKING + PAYMENT REQUEST
   FIRESTORE
========================================================= */


/* =========================================================
   17.1 GENERATE BOOKING NUMBER
========================================================= */

function generateBookingNumberSehemu17() {

    const time =
        Date.now()
            .toString();


    const random =
        Math.floor(
            Math.random() *
            9000
        ) + 1000;


    return (
        "RR" +
        time.slice(-8) +
        random
    );

}


/* =========================================================
   17.2 FORMAT TANZANIA PHONE
========================================================= */

function formatBookingPhoneSehemu17(
    phone
) {

    if (
        !phone
    ) {

        return "";

    }


    let clean =
        String(phone)
            .trim()
            .replace(
                /\s+/g,
                ""
            )
            .replace(
                /-/g,
                ""
            );


    /*
     * +255XXXXXXXXX
     */

    if (
        clean.startsWith(
            "+255"
        )
    ) {

        clean =
            "255" +
            clean.slice(4);

    }


    /*
     * 0XXXXXXXXX
     */

    if (
        clean.startsWith(
            "0"
        )
    ) {

        clean =
            "255" +
            clean.slice(1);

    }


    /*
     * 7XXXXXXXX
     * 6XXXXXXXX
     */

    if (

        clean.length === 9

        &&

        (
            clean.startsWith("6") ||
            clean.startsWith("7")
        )

    ) {

        clean =
            "255" +
            clean;

    }


    return clean;

}


/* =========================================================
   17.3 VALIDATE PHONE
========================================================= */

function isValidBookingPhoneSehemu17(
    phone
) {

    const formatted =
        formatBookingPhoneSehemu17(
            phone
        );


    return (
        formatted.length === 12
        &&
        formatted.startsWith(
            "255"
        )
    );

}


/* =========================================================
   17.4 GET PAYMENT DETAILS
========================================================= */

function getPaymentDetailsSehemu17(
    paymentMethod
) {

    const details = {

        "Airtel Money": {

            number:
                "0667872515",

            name:
                "HARUNA ISSA HAMAD"

        },


        "MIXX BY YAS": {

            number:
                "0651590936",

            name:
                "HARUNA ISSA HAMAD"

        }

    };


    return (
        details[
            paymentMethod
        ]
        ||
        null
    );

}


/* =========================================================
   17.5 CHECK REFERRAL CODE
========================================================= */

async function checkReferralCodeSehemu17(
    referralCode,
    currentUserId
) {

    if (
        !referralCode
    ) {

        return {

            valid:
                false,

            empty:
                true,

            user:
                null

        };

    }


    try {

        const code =
            referralCode
                .trim()
                .toUpperCase();


        /*
         * ADMIN CODE
         */

        if (
            code ===
            "RRADMIN"
        ) {

            return {

                valid:
                    true,

                empty:
                    false,

                type:
                    "admin",

                user: {

                    uid:
                        "RRADMIN",

                    name:
                        "RoomRent Admin",

                    referralCode:
                        "RRADMIN"

                }

            };

        }


        /*
         * SEARCH USER
         */

        const snapshot =
            await db.collection(
                "users"
            )
            .where(
                "referralCode",
                "==",
                code
            )
            .limit(1)
            .get();


        if (
            snapshot.empty
        ) {

            return {

                valid:
                    false,

                empty:
                    false,

                user:
                    null

            };

        }


        const referralDoc =
            snapshot.docs[0];


        /*
         * USER ASIJITUMIE
         * REFERRAL YAKE MWENYEWE
         */

        if (
            referralDoc.id ===
            currentUserId
        ) {

            return {

                valid:
                    false,

                selfReferral:
                    true,

                user:
                    null

            };

        }


        return {

            valid:
                true,

            empty:
                false,

            type:
                "user",

            user: {

                uid:
                    referralDoc.id,

                ...referralDoc.data()

            }

        };


    } catch (error) {

        console.error(
            "Referral check error:",
            error
        );


        return {

            valid:
                false,

            error:
                true,

            user:
                null

        };

    }

}


/* =========================================================
   17.6 CREATE ADMIN NOTIFICATION
========================================================= */

async function createAdminNotificationSehemu17(
    bookingData
) {

    try {

        await db.collection(
            "notifications"
        )
        .add({

            type:
                "payment_request",

            title:
                "💳 Payment Request Mpya",

            message:

                bookingData.customerName +

                " ameomba uthibitisho wa malipo ya TSh " +

                formatMoneySehemu16(
                    bookingData.price
                )

                +

                " kwa chumba " +

                bookingData.roomNumber,

            bookingId:
                bookingData.id,

            bookingNumber:
                bookingData.bookingNumber,

            userId:
                bookingData.userId,

            roomNumber:
                bookingData.roomNumber,

            amount:
                bookingData.price,

            read:
                false,

            target:
                "admin",

            createdAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp()

        });


    } catch (error) {

        console.error(
            "Admin notification error:",
            error
        );

    }

}


/* =========================================================
   17.7 CREATE USER NOTIFICATION
========================================================= */

async function createUserNotificationSehemu17(
    bookingData
) {

    try {

        await db.collection(
            "notifications"
        )
        .add({

            type:
                "payment_waiting",

            title:
                "⏳ Malipo Yanasubiri Uthibitisho",

            message:

                "Booking yako ya chumba " +

                bookingData.roomNumber +

                " inasubiri Admin kuthibitisha malipo yako.",

            bookingId:
                bookingData.id,

            bookingNumber:
                bookingData.bookingNumber,

            userId:
                bookingData.userId,

            read:
                false,

            target:
                "user",

            createdAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp()

        });


    } catch (error) {

        console.error(
            "User notification error:",
            error
        );

    }

}


/* =========================================================
   17.8 SAVE PAYMENT REQUEST
========================================================= */

async function thibitishaPaymentRequestSehemu17() {

    /*
     * PREVENT DOUBLE CLICK
     */

    if (
        window.roomrentSavingBookingSehemu17
    ) {

        return;

    }


    const booking =
        window.roomrentPendingBookingSehemu16;


    if (
        !booking
    ) {

        alert(
            "❌ Taarifa za booking hazijapatikana. Tafadhali anza tena."
        );

        return;

    }


    /*
     * CHECK LOGIN
     */

    const currentUser =
        firebase.auth()
            .currentUser;


    if (
        !currentUser
    ) {

        alert(
            "🔐 Tafadhali ingia kwenye Account kwanza."
        );

        return;

    }


    /*
     * PAYMENT PHONE
     */

    const paymentPhoneInput =
        document.getElementById(
            "paymentPhoneSehemu16"
        );


    const paymentReferenceInput =
        document.getElementById(
            "paymentReferenceSehemu16"
        );


    const paymentPhone =
        paymentPhoneInput
            ?
            paymentPhoneInput.value.trim()
            :
            "";


    const paymentReference =
        paymentReferenceInput
            ?
            paymentReferenceInput.value.trim()
            :
            "";


    if (
        !paymentPhone
    ) {

        alert(
            "❌ Tafadhali weka namba uliyotumia kulipa."
        );

        return;

    }


    if (
        !isValidBookingPhoneSehemu17(
            paymentPhone
        )
    ) {

        alert(
            "❌ Weka namba sahihi ya Tanzania."
        );

        return;

    }


    /*
     * CHECK PAYMENT DETAILS
     */

    const paymentDetails =
        getPaymentDetailsSehemu17(
            booking.paymentMethod
        );


    if (
        !paymentDetails
    ) {

        alert(
            "❌ Njia ya malipo haijulikani."
        );

        return;

    }


    window.roomrentSavingBookingSehemu17 =
        true;


    const button =
        document.querySelector(
            '[onclick="thibitishaPaymentRequestSehemu17()"]'
        );


    if (
        button
    ) {

        button.disabled =
            true;


        button.innerText =
            "⏳ Inahifadhi...";

    }


    try {

        /*
         * CHECK ROOM AGAIN
         */

        const roomSnap =
            await db.collection(
                "rooms"
            )
            .doc(
                booking.roomId
            )
            .get();


        if (
            !roomSnap.exists
        ) {

            throw new Error(
                "Chumba hakipatikani tena."
            );

        }


        const room =
            roomSnap.data();


        if (
            room.active === false
        ) {

            throw new Error(
                "Chumba hiki hakipatikani kwa sasa."
            );

        }


        /*
         * VALIDATE REFERRAL
         */

        const referralResult =
            await checkReferralCodeSehemu17(
                booking.referralCode,
                currentUser.uid
            );


        if (

            booking.referralCode

            &&

            !referralResult.valid

        ) {

            if (
                referralResult.selfReferral
            ) {

                throw new Error(
                    "Huwezi kutumia Referral Code yako mwenyewe."
                );

            }


            throw new Error(
                "Referral Code si sahihi."
            );

        }


        /*
         * CALCULATE CURRENT VALUES
         */

        const roomNumber =
            room.number ||
            booking.roomNumber;


        const price =
            Number(
                room.price ||
                booking.price ||
                0
            );


        let dailyProfit =
            Number(
                room.dailyProfit || 0
            );


        if (
            typeof calculateDailyProfitSehemu15 ===
            "function"
        ) {

            dailyProfit =
                calculateDailyProfitSehemu15(
                    price,
                    roomNumber
                );

        }


        const days =
            40;


        const totalProfit =
            dailyProfit *
            days;


        const totalReturn =
            price +
            totalProfit;


        /*
         * BOOKING NUMBER
         */

        const bookingNumber =
            generateBookingNumberSehemu17();


        /*
         * CREATE BOOKING
         */

        const bookingRef =
            db.collection(
                "bookings"
            )
            .doc();


        const bookingData = {

            id:
                bookingRef.id,

            bookingNumber:
                bookingNumber,


            /*
             * USER
             */

            userId:
                currentUser.uid,

            userEmail:
                currentUser.email ||
                "",


            /*
             * CUSTOMER
             */

            customerName:
                booking.name,

            customerPhone:
                formatBookingPhoneSehemu17(
                    booking.phone
                ),


            /*
             * ROOM
             */

            roomId:
                booking.roomId,

            roomNumber:
                roomNumber,


            /*
             * MONEY
             */

            price:
                price,

            dailyProfit:
                dailyProfit,

            days:
                days,

            totalProfit:
                totalProfit,

            totalReturn:
                totalReturn,


            /*
             * PAYMENT
             */

            paymentMethod:
                booking.paymentMethod,

            paymentReceiverNumber:
                paymentDetails.number,

            paymentReceiverName:
                paymentDetails.name,

            paymentPhone:
                formatBookingPhoneSehemu17(
                    paymentPhone
                ),

            paymentReference:
                paymentReference,

            paymentStatus:
                "Waiting Confirmation",


            /*
             * BOOKING STATUS
             */

            status:
                "Pending",


            /*
             * REFERRAL
             */

            referralCode:
                booking.referralCode || "",

            referredBy:
                referralResult.valid
                    ?
                    referralResult.user.uid
                    :
                    "",

            referralType:
                referralResult.valid
                    ?
                    referralResult.type
                    :
                    "",


            /*
             * DATES
             */

            createdAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp(),

            updatedAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp()

        };


        /*
         * SAVE
         */

        await bookingRef.set(
            bookingData
        );


        /*
         * CREATE NOTIFICATIONS
         */

        await createAdminNotificationSehemu17(
            bookingData
        );


        await createUserNotificationSehemu17(
            bookingData
        );


        /*
         * CLEAR TEMP DATA
         */

        window.roomrentPendingBookingSehemu16 =
            null;


        /*
         * SUCCESS
         */

        onyeshaPaymentWaitingSehemu17(
            bookingData
        );


    } catch (error) {

        console.error(
            "Save payment request error:",
            error
        );


        alert(
            "❌ " +
            (
                error.message ||
                "Imeshindikana kuhifadhi booking."
            )
        );


        if (
            button
        ) {

            button.disabled =
                false;


            button.innerText =
                "✅ Nimelipa";

        }


    } finally {

        window.roomrentSavingBookingSehemu17 =
            false;

    }

}


/* =========================================================
   17.9 SHOW WAITING SCREEN
========================================================= */

function onyeshaPaymentWaitingSehemu17(
    bookingData
) {

    const section =
        document.getElementById(
            "fomuKodi"
        );


    if (
        !section
    ) {

        return;

    }


    section.style.display =
        "block";


    section.innerHTML = `

        <div class="booking-card">

            <h2>
                ⏳ Malipo Yanasubiri Uthibitisho
            </h2>


            <p>

                Asante
                <strong>

                    ${escapeHtmlSehemu16(
                        bookingData.customerName
                    )}

                </strong>.

            </p>


            <p>

                Taarifa zako za malipo
                zimepokelewa.

            </p>


            <hr>


            <p>

                📋 Booking Number:

                <strong>

                    ${escapeHtmlSehemu16(
                        bookingData.bookingNumber
                    )}

                </strong>

            </p>


            <p>

                🏠 Chumba:

                <strong>

                    ${escapeHtmlSehemu16(
                        bookingData.roomNumber
                    )}

                </strong>

            </p>


            <p>

                💰 Kiasi:

                <strong>

                    TSh
                    ${formatMoneySehemu16(
                        bookingData.price
                    )}

                </strong>

            </p>


            <p>

                💳 Njia ya malipo:

                <strong>

                    ${escapeHtmlSehemu16(
                        bookingData.paymentMethod
                    )}

                </strong>

            </p>


            <hr>


            <p>

                🔔 Admin atathibitisha malipo yako.

            </p>


            <p>

                Baada ya uthibitisho,
                Booking yako itaanza rasmi.

            </p>


            <button
                class="thibitishaBtn"
                onclick="funguaBookingZanguSehemu17()"
            >

                📋 Angalia Booking Zangu

            </button>


            <button
                class="endeleaBtn"
                onclick="onyeshaVyumbaSehemu16()"
            >

                🏠 Rudi Vyumba

            </button>

        </div>

    `;

}


/* =========================================================
   17.10 OPEN MY BOOKINGS
========================================================= */

async function funguaBookingZanguSehemu17() {

    const currentUser =
        firebase.auth()
            .currentUser;


    if (
        !currentUser
    ) {

        alert(
            "🔐 Tafadhali ingia kwanza."
        );

        return;

    }


    const section =
        document.getElementById(
            "taarifaSection"
        );


    if (
        !section
    ) {

        return;

    }


    /*
     * HIDE OTHERS
     */

    const rooms =
        document.getElementById(
            "vyumba"
        );


    const form =
        document.getElementById(
            "fomuKodi"
        );


    if (rooms) {

        rooms.style.display =
            "none";

    }


    if (form) {

        form.style.display =
            "none";

    }


    section.style.display =
        "block";


    section.innerHTML = `

        <div class="booking-card">

            <h2>
                📋 Booking Zangu
            </h2>


            <p>
                ⏳ Inapakia...
            </p>

        </div>

    `;


    try {

        const snapshot =
            await db.collection(
                "bookings"
            )
            .where(
                "userId",
                "==",
                currentUser.uid
            )
            .get();


        const bookings = [];


        snapshot.forEach(
            doc => {

                bookings.push({

                    id:
                        doc.id,

                    ...doc.data()

                });

            }
        );


        /*
         * SORT NEWEST FIRST
         */

        bookings.sort(
            (a, b) => {

                const aTime =
                    a.createdAt &&
                    a.createdAt.toMillis
                        ?
                        a.createdAt.toMillis()
                        :
                        0;


                const bTime =
                    b.createdAt &&
                    b.createdAt.toMillis
                        ?
                        b.createdAt.toMillis()
                        :
                        0;


                return (
                    bTime -
                    aTime
                );

            }
        );


        let html = `

            <div class="booking-card">

                <h2>
                    📋 Booking Zangu
                </h2>

            </div>

        `;


        if (
            bookings.length === 0
        ) {

            html += `

                <div class="booking-card">

                    <p>
                        Bado hujafanya Booking yoyote.
                    </p>


                    <button
                        class="thibitishaBtn"
                        onclick="onyeshaVyumbaSehemu16()"
                    >

                        🏠 Angalia Vyumba

                    </button>

                </div>

            `;

        }


        bookings.forEach(
            booking => {

                let statusIcon =
                    "⏳";


                let statusText =
                    booking.paymentStatus ||
                    "Pending";


                if (
                    booking.paymentStatus ===
                    "Confirmed"
                ) {

                    statusIcon =
                        "✅";

                }


                if (
                    booking.paymentStatus ===
                    "Rejected"
                ) {

                    statusIcon =
                        "❌";

                }


                html += `

                    <div
                        class="booking-card"
                        style="
                            margin-bottom:15px;
                        "
                    >

                        <h3>

                            ${statusIcon}

                            Chumba

                            ${escapeHtmlSehemu16(
                                booking.roomNumber
                            )}

                        </h3>


                        <p>

                            📋 Booking:

                            <strong>

                                ${escapeHtmlSehemu16(
                                    booking.bookingNumber
                                )}

                            </strong>

                        </p>


                        <p>

                            💰 Bei:

                            TSh

                            ${formatMoneySehemu16(
                                booking.price
                            )}

                        </p>


                        <p>

                            📈 Faida kwa siku:

                            TSh

                            ${formatMoneySehemu16(
                                booking.dailyProfit
                            )}

                        </p>


                        <p>

                            📅 Muda:

                            ${booking.days || 40}

                            siku

                        </p>


                        <p>

                            💳 Malipo:

                            <strong>

                                ${escapeHtmlSehemu16(
                                    statusText
                                )}

                            </strong>

                        </p>


                        <p>

                            📌 Booking Status:

                            <strong>

                                ${escapeHtmlSehemu16(
                                    booking.status ||
                                    "Pending"
                                )}

                            </strong>

                        </p>

                    </div>

                `;

            }
        );


        section.innerHTML =
            html;


    } catch (error) {

        console.error(
            "My bookings error:",
            error
        );


        section.innerHTML = `

            <div class="booking-card">

                <h2>
                    📋 Booking Zangu
                </h2>


                <p style="color:red;">

                    ❌ Imeshindikana kupakia Booking.

                </p>


                <p>

                    ${escapeHtmlSehemu16(
                        error.message
                    )}

                </p>

            </div>

        `;

    }

}


/* =========================================================
   17.11 CONNECT PAYMENT BUTTON
========================================================= */

window.thibitishaPaymentRequestSehemu16 =
    thibitishaPaymentRequestSehemu17;


/*
 * REPLACE FUNCTION
 * USED BY BUTTON IN PAYMENT SCREEN
 */

function connectPaymentButtonSehemu17() {

    /*
     * CREATE GLOBAL FUNCTION
     */

    window.thibitishaPaymentRequestSehemu16 =
        thibitishaPaymentRequestSehemu17;

}


/* =========================================================
   17.12 CONNECT BOOKING ZANGU BUTTON
========================================================= */

function connectBookingZanguSehemu17() {

    const button =
        document.getElementById(
            "bookingZangu"
        );


    if (
        button
    ) {

        button.addEventListener(
            "click",

            function() {

                funguaBookingZanguSehemu17();

            }

        );

    }

}


/* =========================================================
   17.13 INITIALIZE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",

    function() {

        connectPaymentButtonSehemu17();


        connectBookingZanguSehemu17();


        console.log(
            "✅ Sehemu ya 17 tayari."
        );

    }

);


/* =========================================================
   17.14 EXPORTS
========================================================= */

window.thibitishaPaymentRequestSehemu17 =
    thibitishaPaymentRequestSehemu17;


window.funguaBookingZanguSehemu17 =
    funguaBookingZanguSehemu17;


window.checkReferralCodeSehemu17 =
    checkReferralCodeSehemu17;


/* =========================================================
   SEHEMU YA 17 IMEISHIA HAPA
========================================================= */
/* =========================================================
   ROOMRENT - SEHEMU YA 18
   ADMIN PAYMENT MANAGEMENT
   FIRESTORE
========================================================= */


/* =========================================================
   18.1 CHECK ADMIN
========================================================= */

function isAdminSehemu18() {

    return (
        window.roomrentAdminLoggedIn === true
    );

}


/* =========================================================
   18.2 ADMIN PAYMENT REQUESTS
========================================================= */

async function onyeshaPaymentRequestsSehemu18() {

    if (
        !isAdminSehemu18()
    ) {

        alert(
            "❌ Huna ruhusa ya Admin."
        );

        return;

    }


    const section =
        document.getElementById(
            "taarifaSection"
        );


    if (
        !section
    ) {

        return;

    }


    section.style.display =
        "block";


    section.innerHTML = `

        <div class="booking-card">

            <h2>
                💳 Payment Requests
            </h2>

            <p>
                ⏳ Inapakia...
            </p>

        </div>

    `;


    try {

        const snapshot =
            await db.collection(
                "bookings"
            )
            .where(
                "paymentStatus",
                "==",
                "Waiting Confirmation"
            )
            .get();


        const bookings = [];


        snapshot.forEach(
            doc => {

                bookings.push({

                    id:
                        doc.id,

                    ...doc.data()

                });

            }
        );


        bookings.sort(
            (a, b) => {

                const aTime =
                    a.createdAt &&
                    a.createdAt.toMillis
                        ?
                        a.createdAt.toMillis()
                        :
                        0;


                const bTime =
                    b.createdAt &&
                    b.createdAt.toMillis
                        ?
                        b.createdAt.toMillis()
                        :
                        0;


                return bTime - aTime;

            }
        );


        let html = `

            <div class="booking-card">

                <button
                    class="endeleaBtn"
                    onclick="funguaAdminDashboardSehemu18()"
                >

                    ← Admin Dashboard

                </button>


                <h2>
                    💳 Payment Requests
                </h2>


                <p>

                    Jumla:
                    <strong>
                        ${bookings.length}
                    </strong>

                </p>

            </div>

        `;


        if (
            bookings.length === 0
        ) {

            html += `

                <div class="booking-card">

                    <p>
                        🎉 Hakuna Payment Request inayosubiri kwa sasa.
                    </p>

                </div>

            `;

        }


        bookings.forEach(
            booking => {

                html += `

                    <div
                        class="booking-card"
                        style="
                            margin-bottom:15px;
                        "
                    >

                        <h3>
                            💳 Payment Request
                        </h3>


                        <p>

                            📋 Booking:

                            <strong>

                                ${escapeHtmlSehemu16(
                                    booking.bookingNumber
                                )}

                            </strong>

                        </p>


                        <p>

                            👤 Mteja:

                            <strong>

                                ${escapeHtmlSehemu16(
                                    booking.customerName
                                )}

                            </strong>

                        </p>


                        <p>

                            📱 Namba ya mteja:

                            ${escapeHtmlSehemu16(
                                booking.customerPhone
                            )}

                        </p>


                        <p>

                            🏠 Chumba:

                            <strong>

                                ${escapeHtmlSehemu16(
                                    booking.roomNumber
                                )}

                            </strong>

                        </p>


                        <p>

                            💰 Kiasi:

                            <strong>

                                TSh
                                ${formatMoneySehemu16(
                                    booking.price
                                )}

                            </strong>

                        </p>


                        <p>

                            💳 Njia:

                            <strong>

                                ${escapeHtmlSehemu16(
                                    booking.paymentMethod
                                )}

                            </strong>

                        </p>


                        <p>

                            📲 Namba iliyotumika kulipa:

                            <strong>

                                ${escapeHtmlSehemu16(
                                    booking.paymentPhone
                                )}

                            </strong>

                        </p>


                        <p>

                            🔢 Transaction Reference:

                            <strong>

                                ${escapeHtmlSehemu16(
                                    booking.paymentReference ||
                                    "Haijawekwa"
                                )}

                            </strong>

                        </p>


                        <hr>


                        <button
                            class="thibitishaBtn"
                            onclick="confirmPaymentSehemu18('${booking.id}')"
                        >

                            ✅ Thibitisha Malipo

                        </button>


                        <button
                            class="endeleaBtn"
                            style="
                                margin-top:10px;
                            "
                            onclick="rejectPaymentSehemu18('${booking.id}')"
                        >

                            ❌ Kataa Malipo

                        </button>

                    </div>

                `;

            }
        );


        section.innerHTML =
            html;


    } catch (error) {

        console.error(
            "Payment requests error:",
            error
        );


        section.innerHTML = `

            <div class="booking-card">

                <h2>
                    💳 Payment Requests
                </h2>


                <p style="color:red;">

                    ❌ Imeshindikana kupakia taarifa.

                </p>


                <p>

                    ${escapeHtmlSehemu16(
                        error.message
                    )}

                </p>


                <button
                    class="endeleaBtn"
                    onclick="onyeshaPaymentRequestsSehemu18()"
                >

                    🔄 Jaribu Tena

                </button>

            </div>

        `;

    }

}


/* =========================================================
   18.3 CONFIRM PAYMENT
========================================================= */

async function confirmPaymentSehemu18(
    bookingId
) {

    if (
        !isAdminSehemu18()
    ) {

        alert(
            "❌ Huna ruhusa ya Admin."
        );

        return;

    }


    const confirmResult =
        confirm(
            "Je, umethibitisha kuwa malipo yameingia?"
        );


    if (
        !confirmResult
    ) {

        return;

    }


    try {

        const bookingRef =
            db.collection(
                "bookings"
            )
            .doc(
                bookingId
            );


        const bookingSnap =
            await bookingRef.get();


        if (
            !bookingSnap.exists
        ) {

            alert(
                "❌ Booking haijapatikana."
            );

            return;

        }


        const booking =
            bookingSnap.data();


        /*
         * PREVENT DOUBLE CONFIRM
         */

        if (
            booking.paymentStatus ===
            "Confirmed"
        ) {

            alert(
                "⚠️ Malipo haya tayari yamethibitishwa."
            );

            return;

        }


        /*
         * START DATE
         */

        const startDate =
            new Date();


        /*
         * END DATE
         */

        const endDate =
            new Date(
                startDate
            );


        endDate.setDate(
            startDate.getDate() +
            Number(
                booking.days || 40
            )
        );


        /*
         * UPDATE BOOKING
         */

        await bookingRef.update({

            paymentStatus:
                "Confirmed",

            status:
                "Active",

            confirmedAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp(),

            startDate:
                firebase.firestore
                    .Timestamp
                    .fromDate(
                        startDate
                    ),

            endDate:
                firebase.firestore
                    .Timestamp
                    .fromDate(
                        endDate
                    ),

            updatedAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp()

        });


        /*
         * USER NOTIFICATION
         */

        await db.collection(
            "notifications"
        )
        .add({

            type:
                "payment_confirmed",

            title:
                "✅ Malipo Yamethibitishwa",

            message:

                "Hongera! Malipo yako ya TSh " +

                formatMoneySehemu16(
                    booking.price
                )

                +

                " kwa chumba " +

                booking.roomNumber +

                " yamethibitishwa. Booking yako sasa imeanza.",

            userId:
                booking.userId,

            bookingId:
                bookingId,

            bookingNumber:
                booking.bookingNumber,

            read:
                false,

            target:
                "user",

            createdAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp()

        });


        alert(
            "✅ Malipo yamethibitishwa na Booking imeanza rasmi."
        );


        /*
         * REFRESH
         */

        onyeshaPaymentRequestsSehemu18();


    } catch (error) {

        console.error(
            "Confirm payment error:",
            error
        );


        alert(
            "❌ " +
            error.message
        );

    }

}


/* =========================================================
   18.4 REJECT PAYMENT
========================================================= */

async function rejectPaymentSehemu18(
    bookingId
) {

    if (
        !isAdminSehemu18()
    ) {

        alert(
            "❌ Huna ruhusa ya Admin."
        );

        return;

    }


    const reason =
        prompt(
            "Andika sababu ya kukataa malipo (si lazima):"
        );


    /*
     * USER CANCEL
     */

    if (
        reason === null
    ) {

        return;

    }


    const confirmResult =
        confirm(
            "Je, una uhakika unataka kukataa malipo haya?"
        );


    if (
        !confirmResult
    ) {

        return;

    }


    try {

        const bookingRef =
            db.collection(
                "bookings"
            )
            .doc(
                bookingId
            );


        const bookingSnap =
            await bookingRef.get();


        if (
            !bookingSnap.exists
        ) {

            alert(
                "❌ Booking haijapatikana."
            );

            return;

        }


        const booking =
            bookingSnap.data();


        /*
         * PREVENT REJECTING
         * CONFIRMED PAYMENT
         */

        if (
            booking.paymentStatus ===
            "Confirmed"
        ) {

            alert(
                "❌ Huwezi kukataa malipo ambayo tayari yamethibitishwa."
            );

            return;

        }


        /*
         * UPDATE
         */

        await bookingRef.update({

            paymentStatus:
                "Rejected",

            status:
                "Rejected",

            rejectionReason:
                reason.trim(),

            rejectedAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp(),

            updatedAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp()

        });


        /*
         * USER NOTIFICATION
         */

        await db.collection(
            "notifications"
        )
        .add({

            type:
                "payment_rejected",

            title:
                "❌ Malipo Yamekataliwa",

            message:

                "Malipo ya Booking " +

                booking.bookingNumber +

                " yamekataliwa." +

                (
                    reason.trim()
                        ?
                        " Sababu: " +
                        reason.trim()
                        :
                        ""
                ),

            userId:
                booking.userId,

            bookingId:
                bookingId,

            bookingNumber:
                booking.bookingNumber,

            read:
                false,

            target:
                "user",

            createdAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp()

        });


        alert(
            "❌ Malipo yamekataliwa."
        );


        /*
         * REFRESH
         */

        onyeshaPaymentRequestsSehemu18();


    } catch (error) {

        console.error(
            "Reject payment error:",
            error
        );


        alert(
            "❌ " +
            error.message
        );

    }

}


/* =========================================================
   18.5 ADMIN PAYMENT MENU BUTTON
========================================================= */

function createAdminPaymentMenuSehemu18() {

    return `

        <button
            class="thibitishaBtn"
            onclick="onyeshaPaymentRequestsSehemu18()"
        >

            💳 Payment Requests

        </button>

    `;

}


/* =========================================================
   18.6 EXPORT FUNCTIONS
========================================================= */

window.onyeshaPaymentRequestsSehemu18 =
    onyeshaPaymentRequestsSehemu18;


window.confirmPaymentSehemu18 =
    confirmPaymentSehemu18;


window.rejectPaymentSehemu18 =
    rejectPaymentSehemu18;


window.createAdminPaymentMenuSehemu18 =
    createAdminPaymentMenuSehemu18;


/* =========================================================
   SEHEMU YA 18 IMEISHIA HAPA
========================================================= */
/* =========================================================
   ROOMRENT - SEHEMU YA 19
   ADMIN LOGIN + ADMIN DASHBOARD
========================================================= */


/* =========================================================
   19.1 ADMIN SETTINGS
========================================================= */

/*
   BADILISHA TAARIFA HIZI
   KWA ADMIN YAKO HALISI
*/

const ROOMRENT_ADMIN_USERNAME =
    "admin";


const ROOMRENT_ADMIN_PASSWORD =
    "RoomRent2026";


/* =========================================================
   19.2 OPEN ADMIN LOGIN
========================================================= */

function funguaAdmin() {

    const modal =
        document.getElementById(
            "adminLoginModal"
        );


    if (
        !modal
    ) {

        alert(
            "❌ Admin Login Modal haijapatikana."
        );

        return;

    }


    modal.style.display =
        "block";


    const username =
        document.getElementById(
            "adminUsername"
        );


    const password =
        document.getElementById(
            "adminPassword"
        );


    const message =
        document.getElementById(
            "adminLoginMessage"
        );


    if (
        username
    ) {

        username.value =
            "";

    }


    if (
        password
    ) {

        password.value =
            "";

    }


    if (
        message
    ) {

        message.style.display =
            "none";


        message.textContent =
            "";

    }

}


/* =========================================================
   19.3 CLOSE ADMIN LOGIN
========================================================= */

function fungaAdminLogin() {

    const modal =
        document.getElementById(
            "adminLoginModal"
        );


    if (
        modal
    ) {

        modal.style.display =
            "none";

    }

}


/* =========================================================
   19.4 ADMIN LOGIN
========================================================= */

function adminLogin() {

    const usernameInput =
        document.getElementById(
            "adminUsername"
        );


    const passwordInput =
        document.getElementById(
            "adminPassword"
        );


    const message =
        document.getElementById(
            "adminLoginMessage"
        );


    if (
        !usernameInput ||
        !passwordInput
    ) {

        alert(
            "❌ Admin Login fields hazijapatikana."
        );

        return;

    }


    const username =
        usernameInput.value
            .trim();


    const password =
        passwordInput.value;


    /*
     * CHECK EMPTY
    */

    if (
        !username ||
        !password
    ) {

        if (
            message
        ) {

            message.textContent =
                "❌ Tafadhali jaza Username na Password.";


            message.style.display =
                "block";

        }

        return;

    }


    /*
     * CHECK ADMIN
    */

    if (

        username ===
        ROOMRENT_ADMIN_USERNAME

        &&

        password ===
        ROOMRENT_ADMIN_PASSWORD

    ) {

        /*
         * ADMIN LOGIN SUCCESS
        */

        window.roomrentAdminLoggedIn =
            true;


        /*
         * SAVE ADMIN SESSION
        */

        sessionStorage.setItem(
            "roomrentAdminLoggedIn",
            "true"
        );


        /*
         * CLOSE MODAL
        */

        fungaAdminLogin();


        /*
         * CLEAR PASSWORD
        */

        passwordInput.value =
            "";


        /*
         * SUCCESS MESSAGE
        */

        alert(
            "✅ Karibu Admin!"
        );


        /*
         * OPEN DASHBOARD
        */

        funguaAdminDashboardSehemu19();


        return;

    }


    /*
     * LOGIN FAILED
    */

    if (
        message
    ) {

        message.textContent =
            "❌ Username au Password si sahihi.";


        message.style.display =
            "block";

    }

}


/* =========================================================
   19.5 RESTORE ADMIN SESSION
========================================================= */

function restoreAdminSessionSehemu19() {

    const saved =
        sessionStorage.getItem(
            "roomrentAdminLoggedIn"
        );


    if (
        saved ===
        "true"
    ) {

        window.roomrentAdminLoggedIn =
            true;

    }

}


/* =========================================================
   19.6 ADMIN LOGOUT
========================================================= */

function adminLogoutSehemu19() {

    const result =
        confirm(
            "Je, una uhakika unataka kutoka kwenye Admin?"
        );


    if (
        !result
    ) {

        return;

    }


    window.roomrentAdminLoggedIn =
        false;


    sessionStorage.removeItem(
        "roomrentAdminLoggedIn"
    );


    alert(
        "👋 Umetoka kwenye Admin."
    );


    /*
     * HIDE ADMIN SECTION
    */

    const section =
        document.getElementById(
            "taarifaSection"
        );


    if (
        section
    ) {

        section.style.display =
            "none";


        section.innerHTML =
            "";

    }


    /*
     * SHOW ROOMS
    */

    if (
        typeof onyeshaVyumbaSehemu16 ===
        "function"
    ) {

        onyeshaVyumbaSehemu16();

    }

}


/* =========================================================
   19.7 OPEN ADMIN DASHBOARD
========================================================= */

async function funguaAdminDashboardSehemu19() {

    /*
     * CHECK ADMIN
    */

    if (
        window.roomrentAdminLoggedIn !==
        true
    ) {

        alert(
            "❌ Huna ruhusa ya Admin."
        );

        return;

    }


    /*
     * HIDE OTHER SECTIONS
    */

    const vyumba =
        document.getElementById(
            "vyumba"
        );


    const fomuKodi =
        document.getElementById(
            "fomuKodi"
        );


    const taarifa =
        document.getElementById(
            "taarifaSection"
        );


    if (
        vyumba
    ) {

        vyumba.style.display =
            "none";

    }


    if (
        fomuKodi
    ) {

        fomuKodi.style.display =
            "none";

    }


    if (
        !taarifa
    ) {

        alert(
            "❌ Admin section haijapatikana."
        );

        return;

    }


    taarifa.style.display =
        "block";


    /*
     * LOADING
    */

    taarifa.innerHTML = `

        <div class="booking-card">

            <h2>
                🔐 Admin Dashboard
            </h2>

            <p>
                ⏳ Inapakia taarifa...
            </p>

        </div>

    `;


    try {

        /*
         * GET COUNTS
        */

        const roomsSnapshot =
            await db.collection(
                "rooms"
            )
            .get();


        const bookingsSnapshot =
            await db.collection(
                "bookings"
            )
            .get();


        const usersSnapshot =
            await db.collection(
                "users"
            )
            .get();


        /*
         * COUNT PAYMENTS
        */

        let waitingPayments =
            0;


        let activeBookings =
            0;


        bookingsSnapshot.forEach(
            doc => {

                const booking =
                    doc.data();


                if (

                    booking.paymentStatus ===
                    "Waiting Confirmation"

                ) {

                    waitingPayments++;

                }


                if (

                    booking.status ===
                    "Active"

                ) {

                    activeBookings++;

                }

            }
        );


        /*
         * DASHBOARD HTML
        */

        taarifa.innerHTML = `

            <div class="booking-card">

                <h2>
                    🔐 Admin Dashboard
                </h2>


                <p>
                    Karibu kwenye mfumo wa usimamizi wa RoomRent.
                </p>


                <hr>


                <p>

                    🏠 Vyumba:

                    <strong>
                        ${roomsSnapshot.size}
                    </strong>

                </p>


                <p>

                    📋 Booking Zote:

                    <strong>
                        ${bookingsSnapshot.size}
                    </strong>

                </p>


                <p>

                    🟢 Active Booking:

                    <strong>
                        ${activeBookings}
                    </strong>

                </p>


                <p>

                    💳 Payment Requests:

                    <strong>
                        ${waitingPayments}
                    </strong>

                </p>


                <p>

                    👥 Users:

                    <strong>
                        ${usersSnapshot.size}
                    </strong>

                </p>


                <hr>


                <!-- PAYMENT REQUESTS -->

                <button
                    class="thibitishaBtn"
                    onclick="onyeshaPaymentRequestsSehemu18()"
                >

                    💳 Payment Requests
                    (${waitingPayments})

                </button>


                <!-- ROOM MANAGEMENT -->

                <button
                    class="endeleaBtn"
                    onclick="funguaRoomManagementSehemu19()"
                >

                    🏠 Simamia Vyumba

                </button>


                <!-- USERS -->

                <button
                    class="endeleaBtn"
                    onclick="onyeshaUsersSehemu19()"
                >

                    👥 Users

                </button>


                <!-- COMMISSIONS -->

                <button
                    class="endeleaBtn"
                    onclick="onyeshaCommissionsSehemu19()"
                >

                    💰 Commissions

                </button>


                <!-- NOTIFICATIONS -->

                <button
                    class="endeleaBtn"
                    onclick="onyeshaAdminNotificationsSehemu19()"
                >

                    🔔 Notifications

                </button>


                <hr>


                <!-- LOGOUT -->

                <button
                    class="endeleaBtn"
                    onclick="adminLogoutSehemu19()"
                >

                    🚪 Admin Logout

                </button>

            </div>

        `;


    } catch (error) {

        console.error(
            "Admin dashboard error:",
            error
        );


        taarifa.innerHTML = `

            <div class="booking-card">

                <h2>
                    🔐 Admin Dashboard
                </h2>


                <p style="color:red;">

                    ❌ Imeshindikana kupakia Dashboard.

                </p>


                <p>

                    ${escapeHtmlSehemu16(
                        error.message
                    )}

                </p>


                <button
                    class="thibitishaBtn"
                    onclick="funguaAdminDashboardSehemu19()"
                >

                    🔄 Jaribu Tena

                </button>

            </div>

        `;

    }

}


/* =========================================================
   19.8 ROOM MANAGEMENT
========================================================= */

async function funguaRoomManagementSehemu19() {

    if (
        window.roomrentAdminLoggedIn !==
        true
    ) {

        alert(
            "❌ Huna ruhusa ya Admin."
        );

        return;

    }


    const section =
        document.getElementById(
            "taarifaSection"
        );


    if (
        !section
    ) {

        return;

    }


    section.innerHTML = `

        <div class="booking-card">

            <button
                class="endeleaBtn"
                onclick="funguaAdminDashboardSehemu19()"
            >

                ← Dashboard

            </button>


            <h2>
                🏠 Room Management
            </h2>


            <p>
                ⏳ Inapakia vyumba...
            </p>

        </div>

    `;


    try {

        const snapshot =
            await db.collection(
                "rooms"
            )
            .get();


        const rooms = [];


        snapshot.forEach(
            doc => {

                rooms.push({

                    id:
                        doc.id,

                    ...doc.data()

                });

            }
        );


        rooms.sort(
            (a, b) => {

                return Number(
                    a.number || 0
                ) - Number(
                    b.number || 0
                );

            }
        );


        let html = `

            <div class="booking-card">

                <button
                    class="endeleaBtn"
                    onclick="funguaAdminDashboardSehemu19()"
                >

                    ← Dashboard

                </button>


                <h2>
                    🏠 Room Management
                </h2>


                <button
                    class="thibitishaBtn"
                    onclick="ongezaRoomSehemu19()"
                >

                    ➕ Ongeza Chumba

                </button>

            </div>

        `;


        if (
            rooms.length === 0
        ) {

            html += `

                <div class="booking-card">

                    <p>
                        Hakuna vyumba bado.
                    </p>

                </div>

            `;

        }


        rooms.forEach(
            room => {

                const status =
                    room.active === false
                        ?
                        "🔴 Inactive"
                        :
                        "🟢 Active";


                html += `

                    <div
                        class="booking-card"
                        style="
                            margin-bottom:15px;
                        "
                    >

                        <h3>

                            🏠 Chumba

                            ${escapeHtmlSehemu16(
                                room.number
                            )}

                        </h3>


                        <p>

                            💰 Bei:

                            TSh

                            ${formatMoneySehemu16(
                                room.price
                            )}

                        </p>


                        <p>

                            📈 Faida kwa siku:

                            TSh

                            ${formatMoneySehemu16(
                                room.dailyProfit
                            )}

                        </p>


                        <p>

                            📅 Muda:

                            ${room.days || 40}

                            siku

                        </p>


                        <p>

                            ${status}

                        </p>


                        <button
                            class="thibitishaBtn"
                            onclick="haririRoomSehemu19('${room.id}')"
                        >

                            ✏️ Hariri

                        </button>


                        <button
                            class="endeleaBtn"
                            onclick="badilishaRoomStatusSehemu19('${room.id}', ${room.active === false})"
                        >

                            🔄 Badilisha Status

                        </button>

                    </div>

                `;

            }
        );


        section.innerHTML =
            html;


    } catch (error) {

        console.error(
            "Room management error:",
            error
        );


        section.innerHTML = `

            <div class="booking-card">

                <h2>
                    🏠 Room Management
                </h2>


                <p style="color:red;">

                    ❌ ${escapeHtmlSehemu16(
                        error.message
                    )}

                </p>

            </div>

        `;

    }

}


/* =========================================================
   19.9 ADD ROOM
========================================================= */

function ongezaRoomSehemu19() {

    const number =
        prompt(
            "Weka namba ya chumba:"
        );


    if (
        !number
    ) {

        return;

    }


    const price =
        prompt(
            "Weka bei ya chumba (TSh):"
        );


    if (
        !price
    ) {

        return;

    }


    const dailyProfit =
        prompt(
            "Weka faida kwa siku (TSh):"
        );


    if (
        !dailyProfit
    ) {

        return;

    }


    db.collection(
        "rooms"
    )
    .add({

        number:
            number.trim(),

        price:
            Number(price),

        dailyProfit:
            Number(dailyProfit),

        days:
            40,

        active:
            true,

        createdAt:
            firebase.firestore
                .FieldValue
                .serverTimestamp()

    })
    .then(
        function() {

            alert(
                "✅ Chumba kimeongezwa."
            );


            funguaRoomManagementSehemu19();

        }
    )
    .catch(
        function(error) {

            alert(
                "❌ " +
                error.message
            );

        }
    );

}


/* =========================================================
   19.10 EDIT ROOM
========================================================= */

async function haririRoomSehemu19(
    roomId
) {

    try {

        const roomSnap =
            await db.collection(
                "rooms"
            )
            .doc(
                roomId
            )
            .get();


        if (
            !roomSnap.exists
        ) {

            alert(
                "❌ Chumba hakijapatikana."
            );

            return;

        }


        const room =
            roomSnap.data();


        const newPrice =
            prompt(
                "Bei mpya ya chumba:",
                room.price
            );


        if (
            newPrice === null
        ) {

            return;

        }


        const newProfit =
            prompt(
                "Faida mpya kwa siku:",
                room.dailyProfit
            );


        if (
            newProfit === null
        ) {

            return;

        }


        await db.collection(
            "rooms"
        )
        .doc(
            roomId
        )
        .update({

            price:
                Number(newPrice),

            dailyProfit:
                Number(newProfit),

            days:
                40,

            updatedAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp()

        });


        alert(
            "✅ Chumba kimehaririwa."
        );


        funguaRoomManagementSehemu19();


    } catch (error) {

        console.error(
            "Edit room error:",
            error
        );


        alert(
            "❌ " +
            error.message
        );

    }

}


/* =========================================================
   19.11 CHANGE ROOM STATUS
========================================================= */

async function badilishaRoomStatusSehemu19(
    roomId,
    currentlyInactive
) {

    const newStatus =
        currentlyInactive
            ?
            true
            :
            false;


    const message =
        newStatus
            ?
            "Je, unataka kuweka chumba Active?"
            :
            "Je, unataka kuweka chumba Inactive?";


    if (
        !confirm(
            message
        )
    ) {

        return;

    }


    try {

        await db.collection(
            "rooms"
        )
        .doc(
            roomId
        )
        .update({

            active:
                newStatus,

            updatedAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp()

        });


        alert(
            newStatus
                ?
                "✅ Chumba sasa ni Active."
                :
                "🔴 Chumba sasa ni Inactive."
        );


        funguaRoomManagementSehemu19();


    } catch (error) {

        alert(
            "❌ " +
            error.message
        );

    }

}


/* =========================================================
   19.12 USERS MANAGEMENT
========================================================= */

async function onyeshaUsersSehemu19() {

    const section =
        document.getElementById(
            "taarifaSection"
        );


    if (
        !section
    ) {

        return;

    }


    section.innerHTML = `

        <div class="booking-card">

            <button
                class="endeleaBtn"
                onclick="funguaAdminDashboardSehemu19()"
            >

                ← Dashboard

            </button>


            <h2>
                👥 Users
            </h2>


            <p>
                ⏳ Inapakia...
            </p>

        </div>

    `;


    try {

        const snapshot =
            await db.collection(
                "users"
            )
            .get();


        let html = `

            <div class="booking-card">

                <button
                    class="endeleaBtn"
                    onclick="funguaAdminDashboardSehemu19()"
                >

                    ← Dashboard

                </button>


                <h2>
                    👥 Users

                    (${snapshot.size})

                </h2>

            </div>

        `;


        if (
            snapshot.empty
        ) {

            html += `

                <div class="booking-card">

                    <p>
                        Hakuna users bado.
                    </p>

                </div>

            `;

        }


        snapshot.forEach(
            doc => {

                const user =
                    doc.data();


                html += `

                    <div
                        class="booking-card"
                        style="
                            margin-bottom:15px;
                        "
                    >

                        <h3>

                            👤

                            ${escapeHtmlSehemu16(
                                user.name ||
                                user.email ||
                                "User"
                            )}

                        </h3>


                        <p>

                            📧

                            ${escapeHtmlSehemu16(
                                user.email ||
                                "-"
                            )}

                        </p>


                        <p>

                            🎁 Referral Code:

                            <strong>

                                ${escapeHtmlSehemu16(
                                    user.referralCode ||
                                    "Haijatengenezwa"
                                )}

                            </strong>

                        </p>


                        <p>

                            💰 Commission:

                            TSh

                            ${formatMoneySehemu16(
                                user.totalCommission || 0
                            )}

                        </p>

                    </div>

                `;

            }
        );


        section.innerHTML =
            html;


    } catch (error) {

        section.innerHTML = `

            <div class="booking-card">

                <p style="color:red;">

                    ❌ ${escapeHtmlSehemu16(
                        error.message
                    )}

                </p>

            </div>

        `;

    }

}


/* =========================================================
   19.13 PLACEHOLDER FUNCTIONS
   NEXT SECTIONS
========================================================= */

function onyeshaCommissionsSehemu19() {

    alert(
        "💰 Commission System itaendelea kwenye Sehemu inayofuata."
    );

}


function onyeshaAdminNotificationsSehemu19() {

    alert(
        "🔔 Notification System itaendelea kwenye Sehemu inayofuata."
    );

}


/* =========================================================
   19.14 INITIALIZE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",

    function() {

        restoreAdminSessionSehemu19();


        console.log(
            "✅ Sehemu ya 19 tayari."
        );

    }

);


/* =========================================================
   19.15 EXPORT FUNCTIONS
========================================================= */

window.funguaAdmin =
    funguaAdmin;


window.fungaAdminLogin =
    fungaAdminLogin;


window.adminLogin =
    adminLogin;


window.adminLogoutSehemu19 =
    adminLogoutSehemu19;


window.funguaAdminDashboardSehemu19 =
    funguaAdminDashboardSehemu19;


window.funguaRoomManagementSehemu19 =
    funguaRoomManagementSehemu19;


window.ongezaRoomSehemu19 =
    ongezaRoomSehemu19;


window.haririRoomSehemu19 =
    haririRoomSehemu19;


window.badilishaRoomStatusSehemu19 =
    badilishaRoomStatusSehemu19;


window.onyeshaUsersSehemu19 =
    onyeshaUsersSehemu19;


/* =========================================================
   SEHEMU YA 19 IMEISHIA HAPA
========================================================= */
/* =========================================================
   ROOMRENT - SEHEMU YA 20
   REFERRAL + COMMISSION SYSTEM
   FIRESTORE
========================================================= */


/* =========================================================
   20.1 COMMISSION SETTINGS
========================================================= */

const ROOMRENT_USER_COMMISSION = {

    A: 5,

    B: 2,

    C: 1

};


const ROOMRENT_ADMIN_COMMISSION = {

    A: 20,

    B: 10,

    C: 5

};


/* =========================================================
   20.2 GENERATE REFERRAL CODE
========================================================= */

function generateReferralCodeSehemu20(
    name
) {

    let prefix =
        String(
            name || "RR"
        )
        .replace(
            /[^a-zA-Z]/g,
            ""
        )
        .substring(
            0,
            4
        )
        .toUpperCase();


    if (
        prefix.length < 2
    ) {

        prefix =
            "RR";

    }


    const random =
        Math.floor(
            1000 +
            Math.random() *
            9000
        );


    return (
        prefix +
        random
    );

}


/* =========================================================
   20.3 CREATE UNIQUE REFERRAL CODE
========================================================= */

async function createUniqueReferralCodeSehemu20(
    name
) {

    let code =
        generateReferralCodeSehemu20(
            name
        );


    let exists =
        true;


    let attempts =
        0;


    while (
        exists &&
        attempts < 20
    ) {

        const snapshot =
            await db.collection(
                "users"
            )
            .where(
                "referralCode",
                "==",
                code
            )
            .limit(1)
            .get();


        if (
            snapshot.empty
        ) {

            exists =
                false;

        } else {

            code =
                generateReferralCodeSehemu20(
                    name
                );

        }


        attempts++;

    }


    /*
     * FINAL FALLBACK
    */

    if (
        exists
    ) {

        code =
            "RR" +
            Date.now()
                .toString()
                .slice(-6);

    }


    return code;

}


/* =========================================================
   20.4 ENSURE USER REFERRAL PROFILE
========================================================= */

async function ensureUserReferralProfileSehemu20() {

    const currentUser =
        firebase.auth()
            .currentUser;


    if (
        !currentUser
    ) {

        return null;

    }


    const userRef =
        db.collection(
            "users"
        )
        .doc(
            currentUser.uid
        );


    const userSnap =
        await userRef.get();


    /*
     * USER EXISTS
    */

    if (
        userSnap.exists
    ) {

        const user =
            userSnap.data();


        /*
         * HAS REFERRAL CODE
        */

        if (
            user.referralCode
        ) {

            return {

                uid:
                    currentUser.uid,

                ...user

            };

        }


        /*
         * CREATE MISSING CODE
        */

        const newCode =
            await createUniqueReferralCodeSehemu20(
                user.name ||
                currentUser.email ||
                "RoomRent"
            );


        await userRef.update({

            referralCode:
                newCode,

            referralLink:
                getReferralLinkSehemu20(
                    newCode
                ),

            totalCommission:
                Number(
                    user.totalCommission || 0
                ),

            updatedAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp()

        });


        return {

            ...user,

            uid:
                currentUser.uid,

            referralCode:
                newCode,

            referralLink:
                getReferralLinkSehemu20(
                    newCode
                )

        };

    }


    /*
     * NEW USER
    */

    const name =
        currentUser.email
            ?
            currentUser.email
                .split("@")[0]
            :
            "RoomRent User";


    const referralCode =
        await createUniqueReferralCodeSehemu20(
            name
        );


    const userData = {

        uid:
            currentUser.uid,

        name:
            name,

        email:
            currentUser.email ||
            "",

        referralCode:
            referralCode,

        referralLink:
            getReferralLinkSehemu20(
                referralCode
            ),

        referredBy:
            "",

        totalCommission:
            0,

        totalBookings:
            0,

        referralLevel:
            "Direct",

        createdAt:
            firebase.firestore
                .FieldValue
                .serverTimestamp(),

        updatedAt:
            firebase.firestore
                .FieldValue
                .serverTimestamp()

    };


    await userRef.set(
        userData
    );


    return userData;

}


/* =========================================================
   20.5 GET REFERRAL LINK
========================================================= */

function getReferralLinkSehemu20(
    referralCode
) {

    const currentUrl =
        window.location.origin +
        window.location.pathname;


    return (
        currentUrl +
        "?ref=" +
        encodeURIComponent(
            referralCode
        )
    );

}


/* =========================================================
   20.6 GET REFERRAL CODE FROM URL
========================================================= */

function getReferralCodeFromUrlSehemu20() {

    try {

        const params =
            new URLSearchParams(
                window.location.search
            );


        const ref =
            params.get(
                "ref"
            );


        if (
            ref
        ) {

            return ref
                .trim()
                .toUpperCase();

        }


    } catch (error) {

        console.error(
            "Referral URL error:",
            error
        );

    }


    return "";

}


/* =========================================================
   20.7 SAVE URL REFERRAL
========================================================= */

function saveReferralFromUrlSehemu20() {

    const referralCode =
        getReferralCodeFromUrlSehemu20();


    if (
        referralCode
    ) {

        window.roomrentUrlReferralCode =
            referralCode;


        sessionStorage.setItem(
            "roomrentUrlReferralCode",
            referralCode
        );

    }

}


/* =========================================================
   20.8 GET SAVED REFERRAL
========================================================= */

function getSavedReferralCodeSehemu20() {

    return (

        window.roomrentUrlReferralCode

        ||

        sessionStorage.getItem(
            "roomrentUrlReferralCode"
        )

        ||

        ""

    );

}


/* =========================================================
   20.9 GET USER REFERRAL CHAIN
========================================================= */

async function getReferralChainSehemu20(
    userId
) {

    const chain = [];


    let currentUserId =
        userId;


    let level =
        "A";


    const levels =
        [
            "A",
            "B",
            "C"
        ];


    for (
        let i = 0;
        i < levels.length;
        i++
    ) {

        if (
            !currentUserId
        ) {

            break;

        }


        const userSnap =
            await db.collection(
                "users"
            )
            .doc(
                currentUserId
            )
            .get();


        if (
            !userSnap.exists
        ) {

            break;

        }


        const user =
            userSnap.data();


        /*
         * NEXT REFERRER
        */

        const referredBy =
            user.referredBy ||
            "";


        if (
            !referredBy
        ) {

            break;

        }


        /*
         * ADMIN CODE
        */

        if (
            referredBy ===
            "RRADMIN"
        ) {

            chain.push({

                level:
                    levels[i],

                type:
                    "admin",

                uid:
                    "RRADMIN",

                name:
                    "RoomRent Admin"

            });

            break;

        }


        /*
         * USER REFERRER
        */

        const referrerSnap =
            await db.collection(
                "users"
            )
            .doc(
                referredBy
            )
            .get();


        if (
            !referrerSnap.exists
        ) {

            break;

        }


        const referrer =
            referrerSnap.data();


        chain.push({

            level:
                levels[i],

            type:
                "user",

            uid:
                referredBy,

            name:
                referrer.name ||
                referrer.email ||
                "RoomRent User"

        });


        currentUserId =
            referredBy;

    }


    return chain;

}


/* =========================================================
   20.10 CALCULATE COMMISSION
========================================================= */

function calculateCommissionSehemu20(
    amount,
    percentage
) {

    const money =
        Number(
            amount || 0
        );


    const percent =
        Number(
            percentage || 0
        );


    return (
        money *
        percent
    ) / 100;

}


/* =========================================================
   20.11 CREATE COMMISSION RECORD
========================================================= */

async function createCommissionRecordSehemu20(
    data
) {

    const commissionRef =
        db.collection(
            "commissions"
        )
        .doc();


    await commissionRef.set({

        id:
            commissionRef.id,

        bookingId:
            data.bookingId,

        bookingNumber:
            data.bookingNumber,

        userId:
            data.userId,

        receiverId:
            data.receiverId,

        receiverType:
            data.receiverType,

        level:
            data.level,

        percentage:
            data.percentage,

        bookingAmount:
            data.bookingAmount,

        commissionAmount:
            data.commissionAmount,

        status:
            "Available",

        withdrawn:
            false,

        createdAt:
            firebase.firestore
                .FieldValue
                .serverTimestamp()

    });


    return commissionRef.id;

}


/* =========================================================
   20.12 ADD USER COMMISSION
========================================================= */

async function addUserCommissionSehemu20(
    userId,
    amount
) {

    if (
        !userId ||
        userId === "RRADMIN"
    ) {

        return;

    }


    const userRef =
        db.collection(
            "users"
        )
        .doc(
            userId
        );


    await userRef.update({

        totalCommission:
            firebase.firestore
                .FieldValue
                .increment(
                    Number(amount)
                ),

        updatedAt:
            firebase.firestore
                .FieldValue
                .serverTimestamp()

    });

}


/* =========================================================
   20.13 ADD ADMIN COMMISSION
========================================================= */

async function addAdminCommissionSehemu20(
    data
) {

    const adminRef =
        db.collection(
            "adminCommissions"
        )
        .doc();


    await adminRef.set({

        id:
            adminRef.id,

        bookingId:
            data.bookingId,

        bookingNumber:
            data.bookingNumber,

        level:
            data.level,

        percentage:
            data.percentage,

        bookingAmount:
            data.bookingAmount,

        commissionAmount:
            data.commissionAmount,

        status:
            "Available",

        createdAt:
            firebase.firestore
                .FieldValue
                .serverTimestamp()

    });

}


/* =========================================================
   20.14 PROCESS REFERRAL COMMISSION
========================================================= */

async function processReferralCommissionSehemu20(
    booking
) {

    /*
     * PREVENT DUPLICATE COMMISSION
    */

    const existing =
        await db.collection(
            "commissions"
        )
        .where(
            "bookingId",
            "==",
            booking.id
        )
        .limit(1)
        .get();


    if (
        !existing.empty
    ) {

        console.log(
            "Commission already processed."
        );

        return;

    }


    /*
     * GET REFERRAL CHAIN
    */

    const chain =
        await getReferralChainSehemu20(
            booking.userId
        );


    if (
        chain.length === 0
    ) {

        /*
         * CHECK DIRECT REFERRAL
        */

        if (
            booking.referredBy ===
            "RRADMIN"
        ) {

            const percentage =
                ROOMRENT_ADMIN_COMMISSION.A;


            const amount =
                calculateCommissionSehemu20(
                    booking.price,
                    percentage
                );


            await addAdminCommissionSehemu20({

                bookingId:
                    booking.id,

                bookingNumber:
                    booking.bookingNumber,

                level:
                    "A",

                percentage:
                    percentage,

                bookingAmount:
                    booking.price,

                commissionAmount:
                    amount

            });

        }

        return;

    }


    /*
     * PROCESS A B C
    */

    for (
        const item of chain
    ) {

        /*
         * ADMIN
        */

        if (
            item.type ===
            "admin"
        ) {

            const adminPercentage =
                ROOMRENT_ADMIN_COMMISSION[
                    item.level
                ];


            if (
                !adminPercentage
            ) {

                continue;

            }


            const adminAmount =
                calculateCommissionSehemu20(
                    booking.price,
                    adminPercentage
                );


            await addAdminCommissionSehemu20({

                bookingId:
                    booking.id,

                bookingNumber:
                    booking.bookingNumber,

                level:
                    item.level,

                percentage:
                    adminPercentage,

                bookingAmount:
                    booking.price,

                commissionAmount:
                    adminAmount

            });


            continue;

        }


        /*
         * USER
        */

        const percentage =
            ROOMRENT_USER_COMMISSION[
                item.level
            ];


        if (
            !percentage
        ) {

            continue;

        }


        const commissionAmount =
            calculateCommissionSehemu20(
                booking.price,
                percentage
            );


        /*
         * CREATE RECORD
        */

        await createCommissionRecordSehemu20({

            bookingId:
                booking.id,

            bookingNumber:
                booking.bookingNumber,

            userId:
                booking.userId,

            receiverId:
                item.uid,

            receiverType:
                "user",

            level:
                item.level,

            percentage:
                percentage,

            bookingAmount:
                booking.price,

            commissionAmount:
                commissionAmount

        });


        /*
         * UPDATE USER TOTAL
        */

        await addUserCommissionSehemu20(

            item.uid,

            commissionAmount

        );

    }


    console.log(
        "✅ Referral commission processed."
    );

}


/* =========================================================
   20.15 SHOW MY REFERRAL
========================================================= */

async function onyeshaReferralSehemu20() {

    const currentUser =
        firebase.auth()
            .currentUser;


    if (
        !currentUser
    ) {

        alert(
            "🔐 Tafadhali ingia kwanza."
        );

        return;

    }


    const section =
        document.getElementById(
            "taarifaSection"
        );


    if (
        !section
    ) {

        return;

    }


    section.style.display =
        "block";


    section.innerHTML = `

        <div class="booking-card">

            <h2>
                🎁 Referral Yangu
            </h2>


            <p>
                ⏳ Inapakia...
            </p>

        </div>

    `;


    try {

        const user =
            await ensureUserReferralProfileSehemu20();


        if (
            !user
        ) {

            throw new Error(
                "User hajapatikana."
            );

        }


        const referralLink =
            user.referralLink ||
            getReferralLinkSehemu20(
                user.referralCode
            );


        section.innerHTML = `

            <div class="booking-card">

                <button
                    class="endeleaBtn"
                    onclick="funguaAccountSehemu20()"
                >

                    ← Account

                </button>


                <h2>
                    🎁 Referral Yangu
                </h2>


                <p>
                    Referral Code yako:
                </p>


                <h3>

                    ${escapeHtmlSehemu16(
                        user.referralCode
                    )}

                </h3>


                <p>
                    🔗 Referral Link yako:
                </p>


                <textarea
                    id="myReferralLinkSehemu20"
                    readonly
                    style="
                        width:100%;
                        min-height:80px;
                    "
                >${escapeHtmlSehemu16(
                    referralLink
                )}</textarea>


                <button
                    class="thibitishaBtn"
                    onclick="copyReferralLinkSehemu20()"
                >

                    📋 Copy Referral Link

                </button>


                <button
                    class="endeleaBtn"
                    onclick="shareReferralSehemu20()"
                >

                    📤 Share Referral

                </button>


                <hr>


                <h3>
                    💰 Commission Yangu
                </h3>


                <p>

                    Jumla:

                    <strong>

                        TSh
                        ${formatMoneySehemu16(
                            user.totalCommission || 0
                        )}

                    </strong>

                </p>


                <p>
                    👤 Level A: 5%
                </p>


                <p>
                    👥 Level B: 2%
                </p>


                <p>
                    👥 Level C: 1%
                </p>

            </div>

        `;


    } catch (error) {

        console.error(
            "Referral error:",
            error
        );


        section.innerHTML = `

            <div class="booking-card">

                <p style="color:red;">

                    ❌ ${escapeHtmlSehemu16(
                        error.message
                    )}

                </p>

            </div>

        `;

    }

}


/* =========================================================
   20.16 COPY REFERRAL LINK
========================================================= */

async function copyReferralLinkSehemu20() {

    const input =
        document.getElementById(
            "myReferralLinkSehemu20"
        );


    if (
        !input
    ) {

        return;

    }


    try {

        await navigator.clipboard.writeText(
            input.value
        );


        alert(
            "✅ Referral Link imecopy."
        );


    } catch (error) {

        input.select();


        document.execCommand(
            "copy"
        );


        alert(
            "✅ Referral Link imecopy."
        );

    }

}


/* =========================================================
   20.17 SHARE REFERRAL
========================================================= */

async function shareReferralSehemu20() {

    const input =
        document.getElementById(
            "myReferralLinkSehemu20"
        );


    if (
        !input
    ) {

        return;

    }


    const shareText =

        "Jiunge na RoomRent kupitia link yangu ya Referral! 🏠💰\n\n" +

        input.value;


    try {

        if (
            navigator.share
        ) {

            await navigator.share({

                title:
                    "RoomRent Referral",

                text:
                    shareText

            });


        } else {

            await navigator.clipboard.writeText(
                shareText
            );


            alert(
                "📋 Referral Link imecopy. Unaweza kuituma WhatsApp."
            );

        }


    } catch (error) {

        console.error(
            "Share error:",
            error
        );

    }

}


/* =========================================================
   20.18 CREATE USER ACCOUNT PROFILE
   AFTER LOGIN
========================================================= */

async function initializeReferralUserSehemu20() {

    try {

        const currentUser =
            firebase.auth()
                .currentUser;


        if (
            !currentUser
        ) {

            return;

        }


        const userRef =
            db.collection(
                "users"
            )
            .doc(
                currentUser.uid
            );


        const userSnap =
            await userRef.get();


        /*
         * USER ALREADY EXISTS
        */

        if (
            userSnap.exists
        ) {

            await ensureUserReferralProfileSehemu20();

            return;

        }


        /*
         * REFERRAL FROM URL
        */

        const referralCode =
            getSavedReferralCodeSehemu20();


        let referredBy =
            "";


        /*
         * CHECK ADMIN
        */

        if (
            referralCode ===
            "RRADMIN"
        ) {

            referredBy =
                "RRADMIN";

        }


        /*
         * CHECK USER CODE
        */

        else if (
            referralCode
        ) {

            const referralSnap =
                await db.collection(
                    "users"
                )
                .where(
                    "referralCode",
                    "==",
                    referralCode
                )
                .limit(1)
                .get();


            if (
                !referralSnap.empty
            ) {

                referredBy =
                    referralSnap.docs[0].id;

            }

        }


        /*
         * CREATE PROFILE
        */

        const name =
            currentUser.email
                ?
                currentUser.email
                    .split("@")[0]
                :
                "RoomRent User";


        const newCode =
            await createUniqueReferralCodeSehemu20(
                name
            );


        await userRef.set({

            uid:
                currentUser.uid,

            name:
                name,

            email:
                currentUser.email || "",

            referralCode:
                newCode,

            referralLink:
                getReferralLinkSehemu20(
                    newCode
                ),

            referredBy:
                referredBy,

            totalCommission:
                0,

            totalBookings:
                0,

            createdAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp(),

            updatedAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp()

        });


        /*
         * REMOVE SAVED REFERRAL
        */

        sessionStorage.removeItem(
            "roomrentUrlReferralCode"
        );


        console.log(
            "✅ Referral profile created."
        );


    } catch (error) {

        console.error(
            "Initialize referral user error:",
            error
        );

    }

}


/* =========================================================
   20.19 CONNECT AUTH STATE
========================================================= */

firebase.auth().onAuthStateChanged(

    async function(user) {

        if (
            user
        ) {

            await initializeReferralUserSehemu20();

        }

    }

);


/* =========================================================
   20.20 INITIALIZE
========================================================= */

document.addEventListener(

    "DOMContentLoaded",

    function() {

        saveReferralFromUrlSehemu20();


        console.log(
            "✅ Sehemu ya 20 tayari."
        );

    }

);


/* =========================================================
   20.21 EXPORT FUNCTIONS
========================================================= */

window.onyeshaReferralSehemu20 =
    onyeshaReferralSehemu20;


window.copyReferralLinkSehemu20 =
    copyReferralLinkSehemu20;


window.shareReferralSehemu20 =
    shareReferralSehemu20;


window.processReferralCommissionSehemu20 =
    processReferralCommissionSehemu20;


window.initializeReferralUserSehemu20 =
    initializeReferralUserSehemu20;


/* =========================================================
   SEHEMU YA 20 IMEISHIA HAPA
========================================================= *//* =========================================================
   ROOMRENT - SEHEMU YA 20
   REFERRAL + COMMISSION SYSTEM
   FIRESTORE
========================================================= */


/* =========================================================
   20.1 COMMISSION SETTINGS
========================================================= */

const ROOMRENT_USER_COMMISSION = {

    A: 5,

    B: 2,

    C: 1

};


const ROOMRENT_ADMIN_COMMISSION = {

    A: 20,

    B: 10,

    C: 5

};


/* =========================================================
   20.2 GENERATE REFERRAL CODE
========================================================= */

function generateReferralCodeSehemu20(
    name
) {

    let prefix =
        String(
            name || "RR"
        )
        .replace(
            /[^a-zA-Z]/g,
            ""
        )
        .substring(
            0,
            4
        )
        .toUpperCase();


    if (
        prefix.length < 2
    ) {

        prefix =
            "RR";

    }


    const random =
        Math.floor(
            1000 +
            Math.random() *
            9000
        );


    return (
        prefix +
        random
    );

}


/* =========================================================
   20.3 CREATE UNIQUE REFERRAL CODE
========================================================= */

async function createUniqueReferralCodeSehemu20(
    name
) {

    let code =
        generateReferralCodeSehemu20(
            name
        );


    let exists =
        true;


    let attempts =
        0;


    while (
        exists &&
        attempts < 20
    ) {

        const snapshot =
            await db.collection(
                "users"
            )
            .where(
                "referralCode",
                "==",
                code
            )
            .limit(1)
            .get();


        if (
            snapshot.empty
        ) {

            exists =
                false;

        } else {

            code =
                generateReferralCodeSehemu20(
                    name
                );

        }


        attempts++;

    }


    /*
     * FINAL FALLBACK
    */

    if (
        exists
    ) {

        code =
            "RR" +
            Date.now()
                .toString()
                .slice(-6);

    }


    return code;

}


/* =========================================================
   20.4 ENSURE USER REFERRAL PROFILE
========================================================= */

async function ensureUserReferralProfileSehemu20() {

    const currentUser =
        firebase.auth()
            .currentUser;


    if (
        !currentUser
    ) {

        return null;

    }


    const userRef =
        db.collection(
            "users"
        )
        .doc(
            currentUser.uid
        );


    const userSnap =
        await userRef.get();


    /*
     * USER EXISTS
    */

    if (
        userSnap.exists
    ) {

        const user =
            userSnap.data();


        /*
         * HAS REFERRAL CODE
        */

        if (
            user.referralCode
        ) {

            return {

                uid:
                    currentUser.uid,

                ...user

            };

        }


        /*
         * CREATE MISSING CODE
        */

        const newCode =
            await createUniqueReferralCodeSehemu20(
                user.name ||
                currentUser.email ||
                "RoomRent"
            );


        await userRef.update({

            referralCode:
                newCode,

            referralLink:
                getReferralLinkSehemu20(
                    newCode
                ),

            totalCommission:
                Number(
                    user.totalCommission || 0
                ),

            updatedAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp()

        });


        return {

            ...user,

            uid:
                currentUser.uid,

            referralCode:
                newCode,

            referralLink:
                getReferralLinkSehemu20(
                    newCode
                )

        };

    }


    /*
     * NEW USER
    */

    const name =
        currentUser.email
            ?
            currentUser.email
                .split("@")[0]
            :
            "RoomRent User";


    const referralCode =
        await createUniqueReferralCodeSehemu20(
            name
        );


    const userData = {

        uid:
            currentUser.uid,

        name:
            name,

        email:
            currentUser.email ||
            "",

        referralCode:
            referralCode,

        referralLink:
            getReferralLinkSehemu20(
                referralCode
            ),

        referredBy:
            "",

        totalCommission:
            0,

        totalBookings:
            0,

        referralLevel:
            "Direct",

        createdAt:
            firebase.firestore
                .FieldValue
                .serverTimestamp(),

        updatedAt:
            firebase.firestore
                .FieldValue
                .serverTimestamp()

    };


    await userRef.set(
        userData
    );


    return userData;

}


/* =========================================================
   20.5 GET REFERRAL LINK
========================================================= */

function getReferralLinkSehemu20(
    referralCode
) {

    const currentUrl =
        window.location.origin +
        window.location.pathname;


    return (
        currentUrl +
        "?ref=" +
        encodeURIComponent(
            referralCode
        )
    );

}


/* =========================================================
   20.6 GET REFERRAL CODE FROM URL
========================================================= */

function getReferralCodeFromUrlSehemu20() {

    try {

        const params =
            new URLSearchParams(
                window.location.search
            );


        const ref =
            params.get(
                "ref"
            );


        if (
            ref
        ) {

            return ref
                .trim()
                .toUpperCase();

        }


    } catch (error) {

        console.error(
            "Referral URL error:",
            error
        );

    }


    return "";

}


/* =========================================================
   20.7 SAVE URL REFERRAL
========================================================= */

function saveReferralFromUrlSehemu20() {

    const referralCode =
        getReferralCodeFromUrlSehemu20();


    if (
        referralCode
    ) {

        window.roomrentUrlReferralCode =
            referralCode;


        sessionStorage.setItem(
            "roomrentUrlReferralCode",
            referralCode
        );

    }

}


/* =========================================================
   20.8 GET SAVED REFERRAL
========================================================= */

function getSavedReferralCodeSehemu20() {

    return (

        window.roomrentUrlReferralCode

        ||

        sessionStorage.getItem(
            "roomrentUrlReferralCode"
        )

        ||

        ""

    );

}


/* =========================================================
   20.9 GET USER REFERRAL CHAIN
========================================================= */

async function getReferralChainSehemu20(
    userId
) {

    const chain = [];


    let currentUserId =
        userId;


    let level =
        "A";


    const levels =
        [
            "A",
            "B",
            "C"
        ];


    for (
        let i = 0;
        i < levels.length;
        i++
    ) {

        if (
            !currentUserId
        ) {

            break;

        }


        const userSnap =
            await db.collection(
                "users"
            )
            .doc(
                currentUserId
            )
            .get();


        if (
            !userSnap.exists
        ) {

            break;

        }


        const user =
            userSnap.data();


        /*
         * NEXT REFERRER
        */

        const referredBy =
            user.referredBy ||
            "";


        if (
            !referredBy
        ) {

            break;

        }


        /*
         * ADMIN CODE
        */

        if (
            referredBy ===
            "RRADMIN"
        ) {

            chain.push({

                level:
                    levels[i],

                type:
                    "admin",

                uid:
                    "RRADMIN",

                name:
                    "RoomRent Admin"

            });

            break;

        }


        /*
         * USER REFERRER
        */

        const referrerSnap =
            await db.collection(
                "users"
            )
            .doc(
                referredBy
            )
            .get();


        if (
            !referrerSnap.exists
        ) {

            break;

        }


        const referrer =
            referrerSnap.data();


        chain.push({

            level:
                levels[i],

            type:
                "user",

            uid:
                referredBy,

            name:
                referrer.name ||
                referrer.email ||
                "RoomRent User"

        });


        currentUserId =
            referredBy;

    }


    return chain;

}


/* =========================================================
   20.10 CALCULATE COMMISSION
========================================================= */

function calculateCommissionSehemu20(
    amount,
    percentage
) {

    const money =
        Number(
            amount || 0
        );


    const percent =
        Number(
            percentage || 0
        );


    return (
        money *
        percent
    ) / 100;

}


/* =========================================================
   20.11 CREATE COMMISSION RECORD
========================================================= */

async function createCommissionRecordSehemu20(
    data
) {

    const commissionRef =
        db.collection(
            "commissions"
        )
        .doc();


    await commissionRef.set({

        id:
            commissionRef.id,

        bookingId:
            data.bookingId,

        bookingNumber:
            data.bookingNumber,

        userId:
            data.userId,

        receiverId:
            data.receiverId,

        receiverType:
            data.receiverType,

        level:
            data.level,

        percentage:
            data.percentage,

        bookingAmount:
            data.bookingAmount,

        commissionAmount:
            data.commissionAmount,

        status:
            "Available",

        withdrawn:
            false,

        createdAt:
            firebase.firestore
                .FieldValue
                .serverTimestamp()

    });


    return commissionRef.id;

}


/* =========================================================
   20.12 ADD USER COMMISSION
========================================================= */

async function addUserCommissionSehemu20(
    userId,
    amount
) {

    if (
        !userId ||
        userId === "RRADMIN"
    ) {

        return;

    }


    const userRef =
        db.collection(
            "users"
        )
        .doc(
            userId
        );


    await userRef.update({

        totalCommission:
            firebase.firestore
                .FieldValue
                .increment(
                    Number(amount)
                ),

        updatedAt:
            firebase.firestore
                .FieldValue
                .serverTimestamp()

    });

}


/* =========================================================
   20.13 ADD ADMIN COMMISSION
========================================================= */

async function addAdminCommissionSehemu20(
    data
) {

    const adminRef =
        db.collection(
            "adminCommissions"
        )
        .doc();


    await adminRef.set({

        id:
            adminRef.id,

        bookingId:
            data.bookingId,

        bookingNumber:
            data.bookingNumber,

        level:
            data.level,

        percentage:
            data.percentage,

        bookingAmount:
            data.bookingAmount,

        commissionAmount:
            data.commissionAmount,

        status:
            "Available",

        createdAt:
            firebase.firestore
                .FieldValue
                .serverTimestamp()

    });

}


/* =========================================================
   20.14 PROCESS REFERRAL COMMISSION
========================================================= */

async function processReferralCommissionSehemu20(
    booking
) {

    /*
     * PREVENT DUPLICATE COMMISSION
    */

    const existing =
        await db.collection(
            "commissions"
        )
        .where(
            "bookingId",
            "==",
            booking.id
        )
        .limit(1)
        .get();


    if (
        !existing.empty
    ) {

        console.log(
            "Commission already processed."
        );

        return;

    }


    /*
     * GET REFERRAL CHAIN
    */

    const chain =
        await getReferralChainSehemu20(
            booking.userId
        );


    if (
        chain.length === 0
    ) {

        /*
         * CHECK DIRECT REFERRAL
        */

        if (
            booking.referredBy ===
            "RRADMIN"
        ) {

            const percentage =
                ROOMRENT_ADMIN_COMMISSION.A;


            const amount =
                calculateCommissionSehemu20(
                    booking.price,
                    percentage
                );


            await addAdminCommissionSehemu20({

                bookingId:
                    booking.id,

                bookingNumber:
                    booking.bookingNumber,

                level:
                    "A",

                percentage:
                    percentage,

                bookingAmount:
                    booking.price,

                commissionAmount:
                    amount

            });

        }

        return;

    }


    /*
     * PROCESS A B C
    */

    for (
        const item of chain
    ) {

        /*
         * ADMIN
        */

        if (
            item.type ===
            "admin"
        ) {

            const adminPercentage =
                ROOMRENT_ADMIN_COMMISSION[
                    item.level
                ];


            if (
                !adminPercentage
            ) {

                continue;

            }


            const adminAmount =
                calculateCommissionSehemu20(
                    booking.price,
                    adminPercentage
                );


            await addAdminCommissionSehemu20({

                bookingId:
                    booking.id,

                bookingNumber:
                    booking.bookingNumber,

                level:
                    item.level,

                percentage:
                    adminPercentage,

                bookingAmount:
                    booking.price,

                commissionAmount:
                    adminAmount

            });


            continue;

        }


        /*
         * USER
        */

        const percentage =
            ROOMRENT_USER_COMMISSION[
                item.level
            ];


        if (
            !percentage
        ) {

            continue;

        }


        const commissionAmount =
            calculateCommissionSehemu20(
                booking.price,
                percentage
            );


        /*
         * CREATE RECORD
        */

        await createCommissionRecordSehemu20({

            bookingId:
                booking.id,

            bookingNumber:
                booking.bookingNumber,

            userId:
                booking.userId,

            receiverId:
                item.uid,

            receiverType:
                "user",

            level:
                item.level,

            percentage:
                percentage,

            bookingAmount:
                booking.price,

            commissionAmount:
                commissionAmount

        });


        /*
         * UPDATE USER TOTAL
        */

        await addUserCommissionSehemu20(

            item.uid,

            commissionAmount

        );

    }


    console.log(
        "✅ Referral commission processed."
    );

}


/* =========================================================
   20.15 SHOW MY REFERRAL
========================================================= */

async function onyeshaReferralSehemu20() {

    const currentUser =
        firebase.auth()
            .currentUser;


    if (
        !currentUser
    ) {

        alert(
            "🔐 Tafadhali ingia kwanza."
        );

        return;

    }


    const section =
        document.getElementById(
            "taarifaSection"
        );


    if (
        !section
    ) {

        return;

    }


    section.style.display =
        "block";


    section.innerHTML = `

        <div class="booking-card">

            <h2>
                🎁 Referral Yangu
            </h2>


            <p>
                ⏳ Inapakia...
            </p>

        </div>

    `;


    try {

        const user =
            await ensureUserReferralProfileSehemu20();


        if (
            !user
        ) {

            throw new Error(
                "User hajapatikana."
            );

        }


        const referralLink =
            user.referralLink ||
            getReferralLinkSehemu20(
                user.referralCode
            );


        section.innerHTML = `

            <div class="booking-card">

                <button
                    class="endeleaBtn"
                    onclick="funguaAccountSehemu20()"
                >

                    ← Account

                </button>


                <h2>
                    🎁 Referral Yangu
                </h2>


                <p>
                    Referral Code yako:
                </p>


                <h3>

                    ${escapeHtmlSehemu16(
                        user.referralCode
                    )}

                </h3>


                <p>
                    🔗 Referral Link yako:
                </p>


                <textarea
                    id="myReferralLinkSehemu20"
                    readonly
                    style="
                        width:100%;
                        min-height:80px;
                    "
                >${escapeHtmlSehemu16(
                    referralLink
                )}</textarea>


                <button
                    class="thibitishaBtn"
                    onclick="copyReferralLinkSehemu20()"
                >

                    📋 Copy Referral Link

                </button>


                <button
                    class="endeleaBtn"
                    onclick="shareReferralSehemu20()"
                >

                    📤 Share Referral

                </button>


                <hr>


                <h3>
                    💰 Commission Yangu
                </h3>


                <p>

                    Jumla:

                    <strong>

                        TSh
                        ${formatMoneySehemu16(
                            user.totalCommission || 0
                        )}

                    </strong>

                </p>


                <p>
                    👤 Level A: 5%
                </p>


                <p>
                    👥 Level B: 2%
                </p>


                <p>
                    👥 Level C: 1%
                </p>

            </div>

        `;


    } catch (error) {

        console.error(
            "Referral error:",
            error
        );


        section.innerHTML = `

            <div class="booking-card">

                <p style="color:red;">

                    ❌ ${escapeHtmlSehemu16(
                        error.message
                    )}

                </p>

            </div>

        `;

    }

}


/* =========================================================
   20.16 COPY REFERRAL LINK
========================================================= */

async function copyReferralLinkSehemu20() {

    const input =
        document.getElementById(
            "myReferralLinkSehemu20"
        );


    if (
        !input
    ) {

        return;

    }


    try {

        await navigator.clipboard.writeText(
            input.value
        );


        alert(
            "✅ Referral Link imecopy."
        );


    } catch (error) {

        input.select();


        document.execCommand(
            "copy"
        );


        alert(
            "✅ Referral Link imecopy."
        );

    }

}


/* =========================================================
   20.17 SHARE REFERRAL
========================================================= */

async function shareReferralSehemu20() {

    const input =
        document.getElementById(
            "myReferralLinkSehemu20"
        );


    if (
        !input
    ) {

        return;

    }


    const shareText =

        "Jiunge na RoomRent kupitia link yangu ya Referral! 🏠💰\n\n" +

        input.value;


    try {

        if (
            navigator.share
        ) {

            await navigator.share({

                title:
                    "RoomRent Referral",

                text:
                    shareText

            });


        } else {

            await navigator.clipboard.writeText(
                shareText
            );


            alert(
                "📋 Referral Link imecopy. Unaweza kuituma WhatsApp."
            );

        }


    } catch (error) {

        console.error(
            "Share error:",
            error
        );

    }

}


/* =========================================================
   20.18 CREATE USER ACCOUNT PROFILE
   AFTER LOGIN
========================================================= */

async function initializeReferralUserSehemu20() {

    try {

        const currentUser =
            firebase.auth()
                .currentUser;


        if (
            !currentUser
        ) {

            return;

        }


        const userRef =
            db.collection(
                "users"
            )
            .doc(
                currentUser.uid
            );


        const userSnap =
            await userRef.get();


        /*
         * USER ALREADY EXISTS
        */

        if (
            userSnap.exists
        ) {

            await ensureUserReferralProfileSehemu20();

            return;

        }


        /*
         * REFERRAL FROM URL
        */

        const referralCode =
            getSavedReferralCodeSehemu20();


        let referredBy =
            "";


        /*
         * CHECK ADMIN
        */

        if (
            referralCode ===
            "RRADMIN"
        ) {

            referredBy =
                "RRADMIN";

        }


        /*
         * CHECK USER CODE
        */

        else if (
            referralCode
        ) {

            const referralSnap =
                await db.collection(
                    "users"
                )
                .where(
                    "referralCode",
                    "==",
                    referralCode
                )
                .limit(1)
                .get();


            if (
                !referralSnap.empty
            ) {

                referredBy =
                    referralSnap.docs[0].id;

            }

        }


        /*
         * CREATE PROFILE
        */

        const name =
            currentUser.email
                ?
                currentUser.email
                    .split("@")[0]
                :
                "RoomRent User";


        const newCode =
            await createUniqueReferralCodeSehemu20(
                name
            );


        await userRef.set({

            uid:
                currentUser.uid,

            name:
                name,

            email:
                currentUser.email || "",

            referralCode:
                newCode,

            referralLink:
                getReferralLinkSehemu20(
                    newCode
                ),

            referredBy:
                referredBy,

            totalCommission:
                0,

            totalBookings:
                0,

            createdAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp(),

            updatedAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp()

        });


        /*
         * REMOVE SAVED REFERRAL
        */

        sessionStorage.removeItem(
            "roomrentUrlReferralCode"
        );


        console.log(
            "✅ Referral profile created."
        );


    } catch (error) {

        console.error(
            "Initialize referral user error:",
            error
        );

    }

}


/* =========================================================
   20.19 CONNECT AUTH STATE
========================================================= */

firebase.auth().onAuthStateChanged(

    async function(user) {

        if (
            user
        ) {

            await initializeReferralUserSehemu20();

        }

    }

);


/* =========================================================
   20.20 INITIALIZE
========================================================= */

document.addEventListener(

    "DOMContentLoaded",

    function() {

        saveReferralFromUrlSehemu20();


        console.log(
            "✅ Sehemu ya 20 tayari."
        );

    }

);


/* =========================================================
   20.21 EXPORT FUNCTIONS
========================================================= */

window.onyeshaReferralSehemu20 =
    onyeshaReferralSehemu20;


window.copyReferralLinkSehemu20 =
    copyReferralLinkSehemu20;


window.shareReferralSehemu20 =
    shareReferralSehemu20;


window.processReferralCommissionSehemu20 =
    processReferralCommissionSehemu20;


window.initializeReferralUserSehemu20 =
    initializeReferralUserSehemu20;


/* =========================================================
   SEHEMU YA 20 IMEISHIA HAPA
========================================================= */
/* =========================================================
   ROOMRENT - SEHEMU YA 21
   WITHDRAWAL SYSTEM + COMMISSION BALANCE
   FIRESTORE
========================================================= */


/* =========================================================
   21.1 GET USER COMMISSION SUMMARY
========================================================= */

async function getCommissionSummarySehemu21(
    userId
) {

    const summary = {

        total: 0,

        available: 0,

        withdrawn: 0,

        pending: 0

    };


    try {

        const snapshot =
            await db.collection(
                "commissions"
            )
            .where(
                "receiverId",
                "==",
                userId
            )
            .get();


        snapshot.forEach(
            doc => {

                const commission =
                    doc.data();


                const amount =
                    Number(
                        commission.commissionAmount ||
                        0
                    );


                summary.total +=
                    amount;


                /*
                 * WITHDRAWN
                */

                if (
                    commission.withdrawn ===
                    true
                ) {

                    summary.withdrawn +=
                        amount;

                }


                /*
                 * PENDING
                */

                else if (
                    commission.status ===
                    "Pending Withdrawal"
                ) {

                    summary.pending +=
                        amount;

                }


                /*
                 * AVAILABLE
                */

                else {

                    summary.available +=
                        amount;

                }

            }
        );


    } catch (error) {

        console.error(
            "Commission summary error:",
            error
        );

    }


    return summary;

}


/* =========================================================
   21.2 OPEN WITHDRAWAL
========================================================= */

async function funguaWithdrawalSehemu21() {

    const currentUser =
        firebase.auth()
            .currentUser;


    if (
        !currentUser
    ) {

        alert(
            "🔐 Tafadhali ingia kwanza kwenye Account."
        );

        return;

    }


    const section =
        document.getElementById(
            "taarifaSection"
        );


    if (
        !section
    ) {

        return;

    }


    /*
     * HIDE OTHER SECTIONS
    */

    const rooms =
        document.getElementById(
            "vyumba"
        );


    const form =
        document.getElementById(
            "fomuKodi"
        );


    if (
        rooms
    ) {

        rooms.style.display =
            "none";

    }


    if (
        form
    ) {

        form.style.display =
            "none";

    }


    section.style.display =
        "block";


    section.innerHTML = `

        <div class="booking-card">

            <h2>
                💸 Withdrawal
            </h2>

            <p>
                ⏳ Inapakia Commission...
            </p>

        </div>

    `;


    try {

        const summary =
            await getCommissionSummarySehemu21(
                currentUser.uid
            );


        section.innerHTML = `

            <div class="booking-card">

                <h2>
                    💸 Withdrawal
                </h2>


                <p>
                    💰 Available Balance
                </p>


                <h2>

                    TSh
                    ${formatMoneySehemu16(
                        summary.available
                    )}

                </h2>


                <hr>


                <p>

                    ⏳ Pending Withdrawal:

                    <strong>

                        TSh
                        ${formatMoneySehemu16(
                            summary.pending
                        )}

                    </strong>

                </p>


                <p>

                    ✅ Withdrawn:

                    <strong>

                        TSh
                        ${formatMoneySehemu16(
                            summary.withdrawn
                        )}

                    </strong>

                </p>


                <hr>


                <label>
                    💰 Kiasi unachotaka kutoa
                </label>


                <input
                    type="number"
                    id="withdrawAmountSehemu21"
                    placeholder="Mfano: 10000"
                    min="1"
                >


                <label>
                    📱 Njia ya kupokea pesa
                </label>


                <select
                    id="withdrawMethodSehemu21"
                >

                    <option value="">
                        Chagua njia
                    </option>


                    <option value="Airtel Money">
                        Airtel Money
                    </option>


                    <option value="MIXX BY YAS">
                        MIXX BY YAS
                    </option>

                </select>


                <label>
                    📱 Namba ya kupokea pesa
                </label>


                <input
                    type="tel"
                    id="withdrawPhoneSehemu21"
                    placeholder="Mfano: 0712345678"
                >


                <button
                    class="thibitishaBtn"
                    onclick="ombaWithdrawalSehemu21()"
                >

                    💸 Omba Withdrawal

                </button>


                <button
                    class="endeleaBtn"
                    onclick="funguaAccountSehemu20()"
                >

                    ← Rudi Account

                </button>

            </div>

        `;


    } catch (error) {

        console.error(
            "Withdrawal page error:",
            error
        );


        section.innerHTML = `

            <div class="booking-card">

                <h2>
                    💸 Withdrawal
                </h2>


                <p style="color:red;">

                    ❌ ${escapeHtmlSehemu16(
                        error.message
                    )}

                </p>

            </div>

        `;

    }

}


/* =========================================================
   21.3 REQUEST WITHDRAWAL
========================================================= */

async function ombaWithdrawalSehemu21() {

    const currentUser =
        firebase.auth()
            .currentUser;


    if (
        !currentUser
    ) {

        alert(
            "🔐 Tafadhali ingia kwanza."
        );

        return;

    }


    const amountInput =
        document.getElementById(
            "withdrawAmountSehemu21"
        );


    const methodInput =
        document.getElementById(
            "withdrawMethodSehemu21"
        );


    const phoneInput =
        document.getElementById(
            "withdrawPhoneSehemu21"
        );


    const amount =
        Number(
            amountInput
                ?
                amountInput.value
                :
                0
        );


    const method =
        methodInput
            ?
            methodInput.value
            :
            "";


    const phone =
        phoneInput
            ?
            phoneInput.value.trim()
            :
            "";


    /*
     * VALIDATE AMOUNT
    */

    if (
        !amount ||
        amount <= 0
    ) {

        alert(
            "❌ Weka kiasi sahihi."
        );

        return;

    }


    /*
     * VALIDATE METHOD
    */

    if (
        !method
    ) {

        alert(
            "❌ Chagua njia ya kupokea pesa."
        );

        return;

    }


    /*
     * VALIDATE PHONE
    */

    if (
        !phone
    ) {

        alert(
            "❌ Weka namba ya kupokea pesa."
        );

        return;

    }


    if (
        !isValidBookingPhoneSehemu17(
            phone
        )
    ) {

        alert(
            "❌ Weka namba sahihi ya Tanzania."
        );

        return;

    }


    /*
     * GET BALANCE
    */

    const summary =
        await getCommissionSummarySehemu21(
            currentUser.uid
        );


    if (
        amount >
        summary.available
    ) {

        alert(
            "❌ Kiasi ulichoomba kinazidi Available Balance yako."
        );

        return;

    }


    /*
     * CONFIRM
    */

    const confirmed =
        confirm(

            "Unaomba kutoa TSh " +

            formatMoneySehemu16(
                amount
            )

            +

            " kupitia " +

            method +

            ". Endelea?"

        );


    if (
        !confirmed
    ) {

        return;

    }


    try {

        /*
         * GET AVAILABLE COMMISSIONS
        */

        const commissionSnapshot =
            await db.collection(
                "commissions"
            )
            .where(
                "receiverId",
                "==",
                currentUser.uid
            )
            .get();


        let remaining =
            amount;


        const selectedCommissions =
            [];


        /*
         * SELECT COMMISSIONS
        */

        commissionSnapshot.forEach(
            doc => {

                const commission =
                    doc.data();


                if (
                    remaining <= 0
                ) {

                    return;

                }


                if (
                    commission.withdrawn === true
                ) {

                    return;

                }


                if (
                    commission.status ===
                    "Pending Withdrawal"
                ) {

                    return;

                }


                const commissionAmount =
                    Number(
                        commission.commissionAmount ||
                        0
                    );


                selectedCommissions.push({

                    id:
                        doc.id,

                    amount:
                        commissionAmount

                });


                remaining -=
                    commissionAmount;

            }
        );


        /*
         * CHECK SELECTED
        */

        if (
            selectedCommissions.length === 0
        ) {

            throw new Error(
                "Hakuna Commission inayopatikana."
            );

        }


        /*
         * CREATE WITHDRAWAL
        */

        const withdrawalRef =
            db.collection(
                "withdrawals"
            )
            .doc();


        const withdrawalData = {

            id:
                withdrawalRef.id,

            userId:
                currentUser.uid,

            userEmail:
                currentUser.email ||
                "",

            amount:
                amount,

            method:
                method,

            phone:
                formatBookingPhoneSehemu17(
                    phone
                ),

            status:
                "Pending",

            commissions:
                selectedCommissions,

            createdAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp(),

            updatedAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp()

        };


        /*
         * SAVE WITHDRAWAL
        */

        await withdrawalRef.set(
            withdrawalData
        );


        /*
         * MARK COMMISSIONS PENDING
        */

        for (
            const commission of
            selectedCommissions
        ) {

            await db.collection(
                "commissions"
            )
            .doc(
                commission.id
            )
            .update({

                status:
                    "Pending Withdrawal",

                withdrawalId:
                    withdrawalRef.id,

                updatedAt:
                    firebase.firestore
                        .FieldValue
                        .serverTimestamp()

            });

        }


        /*
         * ADMIN NOTIFICATION
        */

        await db.collection(
            "notifications"
        )
        .add({

            type:
                "withdrawal_request",

            title:
                "💸 Withdrawal Request Mpya",

            message:

                "User ameomba Withdrawal ya TSh " +

                formatMoneySehemu16(
                    amount
                )

                +

                " kupitia " +

                method,

            userId:
                currentUser.uid,

            withdrawalId:
                withdrawalRef.id,

            amount:
                amount,

            read:
                false,

            target:
                "admin",

            createdAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp()

        });


        alert(
            "✅ Withdrawal Request yako imetumwa kwa Admin."
        );


        /*
         * REFRESH PAGE
        */

        funguaWithdrawalSehemu21();


    } catch (error) {

        console.error(
            "Withdrawal request error:",
            error
        );


        alert(
            "❌ " +
            error.message
        );

    }

}


/* =========================================================
   21.4 SHOW MY WITHDRAWALS
========================================================= */

async function onyeshaWithdrawalZanguSehemu21() {

    const currentUser =
        firebase.auth()
            .currentUser;


    if (
        !currentUser
    ) {

        alert(
            "🔐 Tafadhali ingia kwanza."
        );

        return;

    }


    const section =
        document.getElementById(
            "taarifaSection"
        );


    if (
        !section
    ) {

        return;

    }


    section.style.display =
        "block";


    section.innerHTML = `

        <div class="booking-card">

            <h2>
                💸 Withdrawal Zangu
            </h2>


            <p>
                ⏳ Inapakia...
            </p>

        </div>

    `;


    try {

        const snapshot =
            await db.collection(
                "withdrawals"
            )
            .where(
                "userId",
                "==",
                currentUser.uid
            )
            .get();


        const withdrawals =
            [];


        snapshot.forEach(
            doc => {

                withdrawals.push({

                    id:
                        doc.id,

                    ...doc.data()

                });

            }
        );


        withdrawals.sort(
            (a, b) => {

                const aTime =
                    a.createdAt &&
                    a.createdAt.toMillis
                        ?
                        a.createdAt.toMillis()
                        :
                        0;


                const bTime =
                    b.createdAt &&
                    b.createdAt.toMillis
                        ?
                        b.createdAt.toMillis()
                        :
                        0;


                return (
                    bTime -
                    aTime
                );

            }
        );


        let html = `

            <div class="booking-card">

                <button
                    class="endeleaBtn"
                    onclick="funguaWithdrawalSehemu21()"
                >

                    ← Withdrawal

                </button>


                <h2>
                    💸 Withdrawal Zangu
                </h2>

            </div>

        `;


        if (
            withdrawals.length === 0
        ) {

            html += `

                <div class="booking-card">

                    <p>
                        Bado hujatuma Withdrawal Request.
                    </p>

                </div>

            `;

        }


        withdrawals.forEach(
            withdrawal => {

                let icon =
                    "⏳";


                if (
                    withdrawal.status ===
                    "Paid"
                ) {

                    icon =
                        "✅";

                }


                if (
                    withdrawal.status ===
                    "Rejected"
                ) {

                    icon =
                        "❌";

                }


                html += `

                    <div
                        class="booking-card"
                        style="
                            margin-bottom:15px;
                        "
                    >

                        <h3>

                            ${icon}

                            Withdrawal

                        </h3>


                        <p>

                            💰 Kiasi:

                            <strong>

                                TSh

                                ${formatMoneySehemu16(
                                    withdrawal.amount
                                )}

                            </strong>

                        </p>


                        <p>

                            📱 Njia:

                            ${escapeHtmlSehemu16(
                                withdrawal.method
                            )}

                        </p>


                        <p>

                            📲 Namba:

                            ${escapeHtmlSehemu16(
                                withdrawal.phone
                            )}

                        </p>


                        <p>

                            📌 Status:

                            <strong>

                                ${escapeHtmlSehemu16(
                                    withdrawal.status
                                )}

                            </strong>

                        </p>

                    </div>

                `;

            }
        );


        section.innerHTML =
            html;


    } catch (error) {

        console.error(
            "My withdrawals error:",
            error
        );


        section.innerHTML = `

            <div class="booking-card">

                <p style="color:red;">

                    ❌ ${escapeHtmlSehemu16(
                        error.message
                    )}

                </p>

            </div>

        `;

    }

}


/* =========================================================
   21.5 ADMIN WITHDRAWAL REQUESTS
========================================================= */

async function onyeshaAdminWithdrawalsSehemu21() {

    if (
        window.roomrentAdminLoggedIn !==
        true
    ) {

        alert(
            "❌ Huna ruhusa ya Admin."
        );

        return;

    }


    const section =
        document.getElementById(
            "taarifaSection"
        );


    if (
        !section
    ) {

        return;

    }


    section.innerHTML = `

        <div class="booking-card">

            <button
                class="endeleaBtn"
                onclick="funguaAdminDashboardSehemu19()"
            >

                ← Dashboard

            </button>


            <h2>
                💸 Withdrawal Requests
            </h2>


            <p>
                ⏳ Inapakia...
            </p>

        </div>

    `;


    try {

        const snapshot =
            await db.collection(
                "withdrawals"
            )
            .where(
                "status",
                "==",
                "Pending"
            )
            .get();


        const withdrawals =
            [];


        snapshot.forEach(
            doc => {

                withdrawals.push({

                    id:
                        doc.id,

                    ...doc.data()

                });

            }
        );


        let html = `

            <div class="booking-card">

                <button
                    class="endeleaBtn"
                    onclick="funguaAdminDashboardSehemu19()"
                >

                    ← Dashboard

                </button>


                <h2>
                    💸 Withdrawal Requests
                </h2>


                <p>

                    Jumla:

                    <strong>

                        ${withdrawals.length}

                    </strong>

                </p>

            </div>

        `;


        if (
            withdrawals.length === 0
        ) {

            html += `

                <div class="booking-card">

                    <p>
                        🎉 Hakuna Withdrawal Request kwa sasa.
                    </p>

                </div>

            `;

        }


        withdrawals.forEach(
            withdrawal => {

                html += `

                    <div
                        class="booking-card"
                        style="
                            margin-bottom:15px;
                        "
                    >

                        <h3>
                            💸 Withdrawal Request
                        </h3>


                        <p>

                            📧 User:

                            ${escapeHtmlSehemu16(
                                withdrawal.userEmail
                            )}

                        </p>


                        <p>

                            💰 Kiasi:

                            <strong>

                                TSh

                                ${formatMoneySehemu16(
                                    withdrawal.amount
                                )}

                            </strong>

                        </p>


                        <p>

                            📱 Njia:

                            <strong>

                                ${escapeHtmlSehemu16(
                                    withdrawal.method
                                )}

                            </strong>

                        </p>


                        <p>

                            📲 Namba:

                            <strong>

                                ${escapeHtmlSehemu16(
                                    withdrawal.phone
                                )}

                            </strong>

                        </p>


                        <hr>


                        <button
                            class="thibitishaBtn"
                            onclick="lipaWithdrawalSehemu21('${withdrawal.id}')"
                        >

                            ✅ Nimelipa

                        </button>


                        <button
                            class="endeleaBtn"
                            onclick="kataaWithdrawalSehemu21('${withdrawal.id}')"
                        >

                            ❌ Kataa

                        </button>

                    </div>

                `;

            }
        );


        section.innerHTML =
            html;


    } catch (error) {

        console.error(
            "Admin withdrawals error:",
            error
        );


        section.innerHTML = `

            <div class="booking-card">

                <p style="color:red;">

                    ❌ ${escapeHtmlSehemu16(
                        error.message
                    )}

                </p>

            </div>

        `;

    }

}


/* =========================================================
   21.6 ADMIN CONFIRM WITHDRAWAL PAYMENT
========================================================= */

async function lipaWithdrawalSehemu21(
    withdrawalId
) {

    if (
        window.roomrentAdminLoggedIn !==
        true
    ) {

        alert(
            "❌ Huna ruhusa ya Admin."
        );

        return;

    }


    if (
        !confirm(
            "Je, umemtumia mteja pesa?"
        )
    ) {

        return;

    }


    try {

        const withdrawalRef =
            db.collection(
                "withdrawals"
            )
            .doc(
                withdrawalId
            );


        const withdrawalSnap =
            await withdrawalRef.get();


        if (
            !withdrawalSnap.exists
        ) {

            throw new Error(
                "Withdrawal haijapatikana."
            );

        }


        const withdrawal =
            withdrawalSnap.data();


        /*
         * UPDATE WITHDRAWAL
        */

        await withdrawalRef.update({

            status:
                "Paid",

            paidAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp(),

            updatedAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp()

        });


        /*
         * MARK COMMISSIONS WITHDRAWN
        */

        if (
            withdrawal.commissions &&
            withdrawal.commissions.length
        ) {

            for (
                const commission of
                withdrawal.commissions
            ) {

                await db.collection(
                    "commissions"
                )
                .doc(
                    commission.id
                )
                .update({

                    withdrawn:
                        true,

                    status:
                        "Withdrawn",

                    withdrawnAt:
                        firebase.firestore
                            .FieldValue
                            .serverTimestamp()

                });

            }

        }


        /*
         * USER NOTIFICATION
        */

        await db.collection(
            "notifications"
        )
        .add({

            type:
                "withdrawal_paid",

            title:
                "✅ Withdrawal Imelipwa",

            message:

                "Withdrawal yako ya TSh " +

                formatMoneySehemu16(
                    withdrawal.amount
                )

                +

                " imelipwa kupitia " +

                withdrawal.method,

            userId:
                withdrawal.userId,

            withdrawalId:
                withdrawalId,

            read:
                false,

            target:
                "user",

            createdAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp()

        });


        alert(
            "✅ Withdrawal imethibitishwa kuwa imelipwa."
        );


        onyeshaAdminWithdrawalsSehemu21();


    } catch (error) {

        console.error(
            "Pay withdrawal error:",
            error
        );


        alert(
            "❌ " +
            error.message
        );

    }

}


/* =========================================================
   21.7 REJECT WITHDRAWAL
========================================================= */

async function kataaWithdrawalSehemu21(
    withdrawalId
) {

    if (
        window.roomrentAdminLoggedIn !==
        true
    ) {

        alert(
            "❌ Huna ruhusa ya Admin."
        );

        return;

    }


    const reason =
        prompt(
            "Sababu ya kukataa Withdrawal:"
        );


    if (
        reason === null
    ) {

        return;

    }


    if (
        !confirm(
            "Je, una uhakika?"
        )
    ) {

        return;

    }


    try {

        const withdrawalRef =
            db.collection(
                "withdrawals"
            )
            .doc(
                withdrawalId
            );


        const withdrawalSnap =
            await withdrawalRef.get();


        if (
            !withdrawalSnap.exists
        ) {

            throw new Error(
                "Withdrawal haijapatikana."
            );

        }


        const withdrawal =
            withdrawalSnap.data();


        /*
         * UPDATE WITHDRAWAL
        */

        await withdrawalRef.update({

            status:
                "Rejected",

            rejectionReason:
                reason.trim(),

            rejectedAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp()

        });


        /*
         * RETURN COMMISSIONS
        */

        if (
            withdrawal.commissions &&
            withdrawal.commissions.length
        ) {

            for (
                const commission of
                withdrawal.commissions
            ) {

                await db.collection(
                    "commissions"
                )
                .doc(
                    commission.id
                )
                .update({

                    status:
                        "Available",

                    withdrawalId:
                        firebase.firestore
                            .FieldValue
                            .delete(),

                    updatedAt:
                        firebase.firestore
                            .FieldValue
                            .serverTimestamp()

                });

            }

        }


        /*
         * USER NOTIFICATION
        */

        await db.collection(
            "notifications"
        )
        .add({

            type:
                "withdrawal_rejected",

            title:
                "❌ Withdrawal Imekataliwa",

            message:

                "Withdrawal yako imekataliwa." +

                (
                    reason.trim()
                        ?
                        " Sababu: " +
                        reason.trim()
                        :
                        ""
                ),

            userId:
                withdrawal.userId,

            withdrawalId:
                withdrawalId,

            read:
                false,

            target:
                "user",

            createdAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp()

        });


        alert(
            "❌ Withdrawal imekataliwa."
        );


        onyeshaAdminWithdrawalsSehemu21();


    } catch (error) {

        console.error(
            "Reject withdrawal error:",
            error
        );


        alert(
            "❌ " +
            error.message
        );

    }

}


/* =========================================================
   21.8 CONNECT WITHDRAWAL BUTTON
========================================================= */

function connectWithdrawalButtonSehemu21() {

    const button =
        document.getElementById(
            "withdrawalBtn"
        );


    if (
        !button
    ) {

        return;

    }


    button.addEventListener(

        "click",

        function() {

            funguaWithdrawalSehemu21();

        }

    );

}


/* =========================================================
   21.9 PATCH PAYMENT CONFIRMATION
   PROCESS COMMISSION
========================================================= */

const originalConfirmPaymentSehemu21 =
    window.confirmPaymentSehemu18;


/*
 * NEW WRAPPER
*/

window.confirmPaymentSehemu18 =
    async function(
        bookingId
    ) {

        /*
         * RUN ORIGINAL
        */

        await originalConfirmPaymentSehemu21(
            bookingId
        );


        /*
         * GET UPDATED BOOKING
        */

        try {

            const bookingSnap =
                await db.collection(
                    "bookings"
                )
                .doc(
                    bookingId
                )
                .get();


            if (
                !bookingSnap.exists
            ) {

                return;

            }


            const booking = {

                id:
                    bookingSnap.id,

                ...bookingSnap.data()

            };


            /*
             * ONLY CONFIRMED
            */

            if (
                booking.paymentStatus !==
                "Confirmed"
            ) {

                return;

            }


            /*
             * PROCESS COMMISSION
            */

            if (
                typeof processReferralCommissionSehemu20 ===
                "function"
            ) {

                await processReferralCommissionSehemu20(
                    booking
                );

            }


        } catch (error) {

            console.error(
                "Commission processing error:",
                error
            );

        }

    };


/* =========================================================
   21.10 INITIALIZE
========================================================= */

document.addEventListener(

    "DOMContentLoaded",

    function() {

        connectWithdrawalButtonSehemu21();


        console.log(
            "✅ Sehemu ya 21 tayari."
        );

    }

);


/* =========================================================
   21.11 EXPORT FUNCTIONS
========================================================= */

window.funguaWithdrawalSehemu21 =
    funguaWithdrawalSehemu21;


window.ombaWithdrawalSehemu21 =
    ombaWithdrawalSehemu21;


window.onyeshaWithdrawalZanguSehemu21 =
    onyeshaWithdrawalZanguSehemu21;


window.onyeshaAdminWithdrawalsSehemu21 =
    onyeshaAdminWithdrawalsSehemu21;


window.lipaWithdrawalSehemu21 =
    lipaWithdrawalSehemu21;


window.kataaWithdrawalSehemu21 =
    kataaWithdrawalSehemu21;


/* =========================================================
   SEHEMU YA 21 IMEISHIA HAPA
========================================================= *//* =========================================================
   ROOMRENT - SEHEMU YA 21
   WITHDRAWAL SYSTEM + COMMISSION BALANCE
   FIRESTORE
========================================================= */


/* =========================================================
   21.1 GET USER COMMISSION SUMMARY
========================================================= */

async function getCommissionSummarySehemu21(
    userId
) {

    const summary = {

        total: 0,

        available: 0,

        withdrawn: 0,

        pending: 0

    };


    try {

        const snapshot =
            await db.collection(
                "commissions"
            )
            .where(
                "receiverId",
                "==",
                userId
            )
            .get();


        snapshot.forEach(
            doc => {

                const commission =
                    doc.data();


                const amount =
                    Number(
                        commission.commissionAmount ||
                        0
                    );


                summary.total +=
                    amount;


                /*
                 * WITHDRAWN
                */

                if (
                    commission.withdrawn ===
                    true
                ) {

                    summary.withdrawn +=
                        amount;

                }


                /*
                 * PENDING
                */

                else if (
                    commission.status ===
                    "Pending Withdrawal"
                ) {

                    summary.pending +=
                        amount;

                }


                /*
                 * AVAILABLE
                */

                else {

                    summary.available +=
                        amount;

                }

            }
        );


    } catch (error) {

        console.error(
            "Commission summary error:",
            error
        );

    }


    return summary;

}


/* =========================================================
   21.2 OPEN WITHDRAWAL
========================================================= */

async function funguaWithdrawalSehemu21() {

    const currentUser =
        firebase.auth()
            .currentUser;


    if (
        !currentUser
    ) {

        alert(
            "🔐 Tafadhali ingia kwanza kwenye Account."
        );

        return;

    }


    const section =
        document.getElementById(
            "taarifaSection"
        );


    if (
        !section
    ) {

        return;

    }


    /*
     * HIDE OTHER SECTIONS
    */

    const rooms =
        document.getElementById(
            "vyumba"
        );


    const form =
        document.getElementById(
            "fomuKodi"
        );


    if (
        rooms
    ) {

        rooms.style.display =
            "none";

    }


    if (
        form
    ) {

        form.style.display =
            "none";

    }


    section.style.display =
        "block";


    section.innerHTML = `

        <div class="booking-card">

            <h2>
                💸 Withdrawal
            </h2>

            <p>
                ⏳ Inapakia Commission...
            </p>

        </div>

    `;


    try {

        const summary =
            await getCommissionSummarySehemu21(
                currentUser.uid
            );


        section.innerHTML = `

            <div class="booking-card">

                <h2>
                    💸 Withdrawal
                </h2>


                <p>
                    💰 Available Balance
                </p>


                <h2>

                    TSh
                    ${formatMoneySehemu16(
                        summary.available
                    )}

                </h2>


                <hr>


                <p>

                    ⏳ Pending Withdrawal:

                    <strong>

                        TSh
                        ${formatMoneySehemu16(
                            summary.pending
                        )}

                    </strong>

                </p>


                <p>

                    ✅ Withdrawn:

                    <strong>

                        TSh
                        ${formatMoneySehemu16(
                            summary.withdrawn
                        )}

                    </strong>

                </p>


                <hr>


                <label>
                    💰 Kiasi unachotaka kutoa
                </label>


                <input
                    type="number"
                    id="withdrawAmountSehemu21"
                    placeholder="Mfano: 10000"
                    min="1"
                >


                <label>
                    📱 Njia ya kupokea pesa
                </label>


                <select
                    id="withdrawMethodSehemu21"
                >

                    <option value="">
                        Chagua njia
                    </option>


                    <option value="Airtel Money">
                        Airtel Money
                    </option>


                    <option value="MIXX BY YAS">
                        MIXX BY YAS
                    </option>

                </select>


                <label>
                    📱 Namba ya kupokea pesa
                </label>


                <input
                    type="tel"
                    id="withdrawPhoneSehemu21"
                    placeholder="Mfano: 0712345678"
                >


                <button
                    class="thibitishaBtn"
                    onclick="ombaWithdrawalSehemu21()"
                >

                    💸 Omba Withdrawal

                </button>


                <button
                    class="endeleaBtn"
                    onclick="funguaAccountSehemu20()"
                >

                    ← Rudi Account

                </button>

            </div>

        `;


    } catch (error) {

        console.error(
            "Withdrawal page error:",
            error
        );


        section.innerHTML = `

            <div class="booking-card">

                <h2>
                    💸 Withdrawal
                </h2>


                <p style="color:red;">

                    ❌ ${escapeHtmlSehemu16(
                        error.message
                    )}

                </p>

            </div>

        `;

    }

}


/* =========================================================
   21.3 REQUEST WITHDRAWAL
========================================================= */

async function ombaWithdrawalSehemu21() {

    const currentUser =
        firebase.auth()
            .currentUser;


    if (
        !currentUser
    ) {

        alert(
            "🔐 Tafadhali ingia kwanza."
        );

        return;

    }


    const amountInput =
        document.getElementById(
            "withdrawAmountSehemu21"
        );


    const methodInput =
        document.getElementById(
            "withdrawMethodSehemu21"
        );


    const phoneInput =
        document.getElementById(
            "withdrawPhoneSehemu21"
        );


    const amount =
        Number(
            amountInput
                ?
                amountInput.value
                :
                0
        );


    const method =
        methodInput
            ?
            methodInput.value
            :
            "";


    const phone =
        phoneInput
            ?
            phoneInput.value.trim()
            :
            "";


    /*
     * VALIDATE AMOUNT
    */

    if (
        !amount ||
        amount <= 0
    ) {

        alert(
            "❌ Weka kiasi sahihi."
        );

        return;

    }


    /*
     * VALIDATE METHOD
    */

    if (
        !method
    ) {

        alert(
            "❌ Chagua njia ya kupokea pesa."
        );

        return;

    }


    /*
     * VALIDATE PHONE
    */

    if (
        !phone
    ) {

        alert(
            "❌ Weka namba ya kupokea pesa."
        );

        return;

    }


    if (
        !isValidBookingPhoneSehemu17(
            phone
        )
    ) {

        alert(
            "❌ Weka namba sahihi ya Tanzania."
        );

        return;

    }


    /*
     * GET BALANCE
    */

    const summary =
        await getCommissionSummarySehemu21(
            currentUser.uid
        );


    if (
        amount >
        summary.available
    ) {

        alert(
            "❌ Kiasi ulichoomba kinazidi Available Balance yako."
        );

        return;

    }


    /*
     * CONFIRM
    */

    const confirmed =
        confirm(

            "Unaomba kutoa TSh " +

            formatMoneySehemu16(
                amount
            )

            +

            " kupitia " +

            method +

            ". Endelea?"

        );


    if (
        !confirmed
    ) {

        return;

    }


    try {

        /*
         * GET AVAILABLE COMMISSIONS
        */

        const commissionSnapshot =
            await db.collection(
                "commissions"
            )
            .where(
                "receiverId",
                "==",
                currentUser.uid
            )
            .get();


        let remaining =
            amount;


        const selectedCommissions =
            [];


        /*
         * SELECT COMMISSIONS
        */

        commissionSnapshot.forEach(
            doc => {

                const commission =
                    doc.data();


                if (
                    remaining <= 0
                ) {

                    return;

                }


                if (
                    commission.withdrawn === true
                ) {

                    return;

                }


                if (
                    commission.status ===
                    "Pending Withdrawal"
                ) {

                    return;

                }


                const commissionAmount =
                    Number(
                        commission.commissionAmount ||
                        0
                    );


                selectedCommissions.push({

                    id:
                        doc.id,

                    amount:
                        commissionAmount

                });


                remaining -=
                    commissionAmount;

            }
        );


        /*
         * CHECK SELECTED
        */

        if (
            selectedCommissions.length === 0
        ) {

            throw new Error(
                "Hakuna Commission inayopatikana."
            );

        }


        /*
         * CREATE WITHDRAWAL
        */

        const withdrawalRef =
            db.collection(
                "withdrawals"
            )
            .doc();


        const withdrawalData = {

            id:
                withdrawalRef.id,

            userId:
                currentUser.uid,

            userEmail:
                currentUser.email ||
                "",

            amount:
                amount,

            method:
                method,

            phone:
                formatBookingPhoneSehemu17(
                    phone
                ),

            status:
                "Pending",

            commissions:
                selectedCommissions,

            createdAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp(),

            updatedAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp()

        };


        /*
         * SAVE WITHDRAWAL
        */

        await withdrawalRef.set(
            withdrawalData
        );


        /*
         * MARK COMMISSIONS PENDING
        */

        for (
            const commission of
            selectedCommissions
        ) {

            await db.collection(
                "commissions"
            )
            .doc(
                commission.id
            )
            .update({

                status:
                    "Pending Withdrawal",

                withdrawalId:
                    withdrawalRef.id,

                updatedAt:
                    firebase.firestore
                        .FieldValue
                        .serverTimestamp()

            });

        }


        /*
         * ADMIN NOTIFICATION
        */

        await db.collection(
            "notifications"
        )
        .add({

            type:
                "withdrawal_request",

            title:
                "💸 Withdrawal Request Mpya",

            message:

                "User ameomba Withdrawal ya TSh " +

                formatMoneySehemu16(
                    amount
                )

                +

                " kupitia " +

                method,

            userId:
                currentUser.uid,

            withdrawalId:
                withdrawalRef.id,

            amount:
                amount,

            read:
                false,

            target:
                "admin",

            createdAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp()

        });


        alert(
            "✅ Withdrawal Request yako imetumwa kwa Admin."
        );


        /*
         * REFRESH PAGE
        */

        funguaWithdrawalSehemu21();


    } catch (error) {

        console.error(
            "Withdrawal request error:",
            error
        );


        alert(
            "❌ " +
            error.message
        );

    }

}


/* =========================================================
   21.4 SHOW MY WITHDRAWALS
========================================================= */

async function onyeshaWithdrawalZanguSehemu21() {

    const currentUser =
        firebase.auth()
            .currentUser;


    if (
        !currentUser
    ) {

        alert(
            "🔐 Tafadhali ingia kwanza."
        );

        return;

    }


    const section =
        document.getElementById(
            "taarifaSection"
        );


    if (
        !section
    ) {

        return;

    }


    section.style.display =
        "block";


    section.innerHTML = `

        <div class="booking-card">

            <h2>
                💸 Withdrawal Zangu
            </h2>


            <p>
                ⏳ Inapakia...
            </p>

        </div>

    `;


    try {

        const snapshot =
            await db.collection(
                "withdrawals"
            )
            .where(
                "userId",
                "==",
                currentUser.uid
            )
            .get();


        const withdrawals =
            [];


        snapshot.forEach(
            doc => {

                withdrawals.push({

                    id:
                        doc.id,

                    ...doc.data()

                });

            }
        );


        withdrawals.sort(
            (a, b) => {

                const aTime =
                    a.createdAt &&
                    a.createdAt.toMillis
                        ?
                        a.createdAt.toMillis()
                        :
                        0;


                const bTime =
                    b.createdAt &&
                    b.createdAt.toMillis
                        ?
                        b.createdAt.toMillis()
                        :
                        0;


                return (
                    bTime -
                    aTime
                );

            }
        );


        let html = `

            <div class="booking-card">

                <button
                    class="endeleaBtn"
                    onclick="funguaWithdrawalSehemu21()"
                >

                    ← Withdrawal

                </button>


                <h2>
                    💸 Withdrawal Zangu
                </h2>

            </div>

        `;


        if (
            withdrawals.length === 0
        ) {

            html += `

                <div class="booking-card">

                    <p>
                        Bado hujatuma Withdrawal Request.
                    </p>

                </div>

            `;

        }


        withdrawals.forEach(
            withdrawal => {

                let icon =
                    "⏳";


                if (
                    withdrawal.status ===
                    "Paid"
                ) {

                    icon =
                        "✅";

                }


                if (
                    withdrawal.status ===
                    "Rejected"
                ) {

                    icon =
                        "❌";

                }


                html += `

                    <div
                        class="booking-card"
                        style="
                            margin-bottom:15px;
                        "
                    >

                        <h3>

                            ${icon}

                            Withdrawal

                        </h3>


                        <p>

                            💰 Kiasi:

                            <strong>

                                TSh

                                ${formatMoneySehemu16(
                                    withdrawal.amount
                                )}

                            </strong>

                        </p>


                        <p>

                            📱 Njia:

                            ${escapeHtmlSehemu16(
                                withdrawal.method
                            )}

                        </p>


                        <p>

                            📲 Namba:

                            ${escapeHtmlSehemu16(
                                withdrawal.phone
                            )}

                        </p>


                        <p>

                            📌 Status:

                            <strong>

                                ${escapeHtmlSehemu16(
                                    withdrawal.status
                                )}

                            </strong>

                        </p>

                    </div>

                `;

            }
        );


        section.innerHTML =
            html;


    } catch (error) {

        console.error(
            "My withdrawals error:",
            error
        );


        section.innerHTML = `

            <div class="booking-card">

                <p style="color:red;">

                    ❌ ${escapeHtmlSehemu16(
                        error.message
                    )}

                </p>

            </div>

        `;

    }

}


/* =========================================================
   21.5 ADMIN WITHDRAWAL REQUESTS
========================================================= */

async function onyeshaAdminWithdrawalsSehemu21() {

    if (
        window.roomrentAdminLoggedIn !==
        true
    ) {

        alert(
            "❌ Huna ruhusa ya Admin."
        );

        return;

    }


    const section =
        document.getElementById(
            "taarifaSection"
        );


    if (
        !section
    ) {

        return;

    }


    section.innerHTML = `

        <div class="booking-card">

            <button
                class="endeleaBtn"
                onclick="funguaAdminDashboardSehemu19()"
            >

                ← Dashboard

            </button>


            <h2>
                💸 Withdrawal Requests
            </h2>


            <p>
                ⏳ Inapakia...
            </p>

        </div>

    `;


    try {

        const snapshot =
            await db.collection(
                "withdrawals"
            )
            .where(
                "status",
                "==",
                "Pending"
            )
            .get();


        const withdrawals =
            [];


        snapshot.forEach(
            doc => {

                withdrawals.push({

                    id:
                        doc.id,

                    ...doc.data()

                });

            }
        );


        let html = `

            <div class="booking-card">

                <button
                    class="endeleaBtn"
                    onclick="funguaAdminDashboardSehemu19()"
                >

                    ← Dashboard

                </button>


                <h2>
                    💸 Withdrawal Requests
                </h2>


                <p>

                    Jumla:

                    <strong>

                        ${withdrawals.length}

                    </strong>

                </p>

            </div>

        `;


        if (
            withdrawals.length === 0
        ) {

            html += `

                <div class="booking-card">

                    <p>
                        🎉 Hakuna Withdrawal Request kwa sasa.
                    </p>

                </div>

            `;

        }


        withdrawals.forEach(
            withdrawal => {

                html += `

                    <div
                        class="booking-card"
                        style="
                            margin-bottom:15px;
                        "
                    >

                        <h3>
                            💸 Withdrawal Request
                        </h3>


                        <p>

                            📧 User:

                            ${escapeHtmlSehemu16(
                                withdrawal.userEmail
                            )}

                        </p>


                        <p>

                            💰 Kiasi:

                            <strong>

                                TSh

                                ${formatMoneySehemu16(
                                    withdrawal.amount
                                )}

                            </strong>

                        </p>


                        <p>

                            📱 Njia:

                            <strong>

                                ${escapeHtmlSehemu16(
                                    withdrawal.method
                                )}

                            </strong>

                        </p>


                        <p>

                            📲 Namba:

                            <strong>

                                ${escapeHtmlSehemu16(
                                    withdrawal.phone
                                )}

                            </strong>

                        </p>


                        <hr>


                        <button
                            class="thibitishaBtn"
                            onclick="lipaWithdrawalSehemu21('${withdrawal.id}')"
                        >

                            ✅ Nimelipa

                        </button>


                        <button
                            class="endeleaBtn"
                            onclick="kataaWithdrawalSehemu21('${withdrawal.id}')"
                        >

                            ❌ Kataa

                        </button>

                    </div>

                `;

            }
        );


        section.innerHTML =
            html;


    } catch (error) {

        console.error(
            "Admin withdrawals error:",
            error
        );


        section.innerHTML = `

            <div class="booking-card">

                <p style="color:red;">

                    ❌ ${escapeHtmlSehemu16(
                        error.message
                    )}

                </p>

            </div>

        `;

    }

}


/* =========================================================
   21.6 ADMIN CONFIRM WITHDRAWAL PAYMENT
========================================================= */

async function lipaWithdrawalSehemu21(
    withdrawalId
) {

    if (
        window.roomrentAdminLoggedIn !==
        true
    ) {

        alert(
            "❌ Huna ruhusa ya Admin."
        );

        return;

    }


    if (
        !confirm(
            "Je, umemtumia mteja pesa?"
        )
    ) {

        return;

    }


    try {

        const withdrawalRef =
            db.collection(
                "withdrawals"
            )
            .doc(
                withdrawalId
            );


        const withdrawalSnap =
            await withdrawalRef.get();


        if (
            !withdrawalSnap.exists
        ) {

            throw new Error(
                "Withdrawal haijapatikana."
            );

        }


        const withdrawal =
            withdrawalSnap.data();


        /*
         * UPDATE WITHDRAWAL
        */

        await withdrawalRef.update({

            status:
                "Paid",

            paidAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp(),

            updatedAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp()

        });


        /*
         * MARK COMMISSIONS WITHDRAWN
        */

        if (
            withdrawal.commissions &&
            withdrawal.commissions.length
        ) {

            for (
                const commission of
                withdrawal.commissions
            ) {

                await db.collection(
                    "commissions"
                )
                .doc(
                    commission.id
                )
                .update({

                    withdrawn:
                        true,

                    status:
                        "Withdrawn",

                    withdrawnAt:
                        firebase.firestore
                            .FieldValue
                            .serverTimestamp()

                });

            }

        }


        /*
         * USER NOTIFICATION
        */

        await db.collection(
            "notifications"
        )
        .add({

            type:
                "withdrawal_paid",

            title:
                "✅ Withdrawal Imelipwa",

            message:

                "Withdrawal yako ya TSh " +

                formatMoneySehemu16(
                    withdrawal.amount
                )

                +

                " imelipwa kupitia " +

                withdrawal.method,

            userId:
                withdrawal.userId,

            withdrawalId:
                withdrawalId,

            read:
                false,

            target:
                "user",

            createdAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp()

        });


        alert(
            "✅ Withdrawal imethibitishwa kuwa imelipwa."
        );


        onyeshaAdminWithdrawalsSehemu21();


    } catch (error) {

        console.error(
            "Pay withdrawal error:",
            error
        );


        alert(
            "❌ " +
            error.message
        );

    }

}


/* =========================================================
   21.7 REJECT WITHDRAWAL
========================================================= */

async function kataaWithdrawalSehemu21(
    withdrawalId
) {

    if (
        window.roomrentAdminLoggedIn !==
        true
    ) {

        alert(
            "❌ Huna ruhusa ya Admin."
        );

        return;

    }


    const reason =
        prompt(
            "Sababu ya kukataa Withdrawal:"
        );


    if (
        reason === null
    ) {

        return;

    }


    if (
        !confirm(
            "Je, una uhakika?"
        )
    ) {

        return;

    }


    try {

        const withdrawalRef =
            db.collection(
                "withdrawals"
            )
            .doc(
                withdrawalId
            );


        const withdrawalSnap =
            await withdrawalRef.get();


        if (
            !withdrawalSnap.exists
        ) {

            throw new Error(
                "Withdrawal haijapatikana."
            );

        }


        const withdrawal =
            withdrawalSnap.data();


        /*
         * UPDATE WITHDRAWAL
        */

        await withdrawalRef.update({

            status:
                "Rejected",

            rejectionReason:
                reason.trim(),

            rejectedAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp()

        });


        /*
         * RETURN COMMISSIONS
        */

        if (
            withdrawal.commissions &&
            withdrawal.commissions.length
        ) {

            for (
                const commission of
                withdrawal.commissions
            ) {

                await db.collection(
                    "commissions"
                )
                .doc(
                    commission.id
                )
                .update({

                    status:
                        "Available",

                    withdrawalId:
                        firebase.firestore
                            .FieldValue
                            .delete(),

                    updatedAt:
                        firebase.firestore
                            .FieldValue
                            .serverTimestamp()

                });

            }

        }


        /*
         * USER NOTIFICATION
        */

        await db.collection(
            "notifications"
        )
        .add({

            type:
                "withdrawal_rejected",

            title:
                "❌ Withdrawal Imekataliwa",

            message:

                "Withdrawal yako imekataliwa." +

                (
                    reason.trim()
                        ?
                        " Sababu: " +
                        reason.trim()
                        :
                        ""
                ),

            userId:
                withdrawal.userId,

            withdrawalId:
                withdrawalId,

            read:
                false,

            target:
                "user",

            createdAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp()

        });


        alert(
            "❌ Withdrawal imekataliwa."
        );


        onyeshaAdminWithdrawalsSehemu21();


    } catch (error) {

        console.error(
            "Reject withdrawal error:",
            error
        );


        alert(
            "❌ " +
            error.message
        );

    }

}


/* =========================================================
   21.8 CONNECT WITHDRAWAL BUTTON
========================================================= */

function connectWithdrawalButtonSehemu21() {

    const button =
        document.getElementById(
            "withdrawalBtn"
        );


    if (
        !button
    ) {

        return;

    }


    button.addEventListener(

        "click",

        function() {

            funguaWithdrawalSehemu21();

        }

    );

}


/* =========================================================
   21.9 PATCH PAYMENT CONFIRMATION
   PROCESS COMMISSION
========================================================= */

const originalConfirmPaymentSehemu21 =
    window.confirmPaymentSehemu18;


/*
 * NEW WRAPPER
*/

window.confirmPaymentSehemu18 =
    async function(
        bookingId
    ) {

        /*
         * RUN ORIGINAL
        */

        await originalConfirmPaymentSehemu21(
            bookingId
        );


        /*
         * GET UPDATED BOOKING
        */

        try {

            const bookingSnap =
                await db.collection(
                    "bookings"
                )
                .doc(
                    bookingId
                )
                .get();


            if (
                !bookingSnap.exists
            ) {

                return;

            }


            const booking = {

                id:
                    bookingSnap.id,

                ...bookingSnap.data()

            };


            /*
             * ONLY CONFIRMED
            */

            if (
                booking.paymentStatus !==
                "Confirmed"
            ) {

                return;

            }


            /*
             * PROCESS COMMISSION
            */

            if (
                typeof processReferralCommissionSehemu20 ===
                "function"
            ) {

                await processReferralCommissionSehemu20(
                    booking
                );

            }


        } catch (error) {

            console.error(
                "Commission processing error:",
                error
            );

        }

    };


/* =========================================================
   21.10 INITIALIZE
========================================================= */

document.addEventListener(

    "DOMContentLoaded",

    function() {

        connectWithdrawalButtonSehemu21();


        console.log(
            "✅ Sehemu ya 21 tayari."
        );

    }

);


/* =========================================================
   21.11 EXPORT FUNCTIONS
========================================================= */

window.funguaWithdrawalSehemu21 =
    funguaWithdrawalSehemu21;


window.ombaWithdrawalSehemu21 =
    ombaWithdrawalSehemu21;


window.onyeshaWithdrawalZanguSehemu21 =
    onyeshaWithdrawalZanguSehemu21;


window.onyeshaAdminWithdrawalsSehemu21 =
    onyeshaAdminWithdrawalsSehemu21;


window.lipaWithdrawalSehemu21 =
    lipaWithdrawalSehemu21;


window.kataaWithdrawalSehemu21 =
    kataaWithdrawalSehemu21;


/* =========================================================
   SEHEMU YA 21 IMEISHIA HAPA
========================================================= */
/* =========================================================
   ROOMRENT - SEHEMU YA 22
   ACCOUNT DASHBOARD
   NOTIFICATIONS
   REFERRAL
   WITHDRAWAL HISTORY
========================================================= */


/* =========================================================
   22.1 ACCOUNT DASHBOARD
========================================================= */

async function funguaAccountSehemu22() {

    const currentUser =
        firebase.auth().currentUser;

    if (!currentUser) {

        alert(
            "🔐 Tafadhali ingia kwanza."
        );

        return;

    }

    const rooms =
        document.getElementById("vyumba");

    const form =
        document.getElementById("fomuKodi");

    const taarifa =
        document.getElementById("taarifaSection");

    if (rooms) {
        rooms.style.display = "none";
    }

    if (form) {
        form.style.display = "none";
    }

    if (!taarifa) {
        return;
    }

    taarifa.style.display = "block";

    taarifa.innerHTML = `

        <div class="booking-card">

            <h2>
                👤 Account Yangu
            </h2>

            <p>
                ⏳ Inapakia taarifa...
            </p>

        </div>

    `;

    try {

        const userRef =
            db.collection("users")
              .doc(currentUser.uid);

        const userSnap =
            await userRef.get();

        if (!userSnap.exists) {

            await initializeReferralUserSehemu20();

        }

        const freshUserSnap =
            await userRef.get();

        const user =
            freshUserSnap.exists
                ? freshUserSnap.data()
                : {};

        const summary =
            await getCommissionSummarySehemu21(
                currentUser.uid
            );

        const bookingSnapshot =
            await db.collection("bookings")
                .where(
                    "userId",
                    "==",
                    currentUser.uid
                )
                .get();

        const bookingCount =
            bookingSnapshot.size;

        taarifa.innerHTML = `

            <div class="booking-card">

                <h2>
                    👤 Karibu Account Yako
                </h2>

                <p>
                    📧
                    ${escapeHtmlSehemu16(
                        user.email ||
                        currentUser.email ||
                        ""
                    )}
                </p>

                <hr>

                <h3>
                    💰 Commission Balance
                </h3>

                <h2>
                    TSh
                    ${formatMoneySehemu16(
                        summary.available
                    )}
                </h2>

                <p>
                    ⏳ Pending:
                    TSh
                    ${formatMoneySehemu16(
                        summary.pending
                    )}
                </p>

                <p>
                    ✅ Withdrawn:
                    TSh
                    ${formatMoneySehemu16(
                        summary.withdrawn
                    )}
                </p>

                <hr>

                <p>
                    📋 Bookings:
                    <strong>
                        ${bookingCount}
                    </strong>
                </p>

                <p>
                    🎁 Referral Code:
                    <strong>
                        ${escapeHtmlSehemu16(
                            user.referralCode || "-"
                        )}
                    </strong>
                </p>

            </div>


            <div class="booking-card">

                <h3>
                    📋 Booking Zangu
                </h3>

                <button
                    class="thibitishaBtn"
                    onclick="funguaBookingZangu()"
                >
                    📋 Angalia Booking
                </button>

            </div>


            <div class="booking-card">

                <h3>
                    🎁 Referral Yangu
                </h3>

                <button
                    class="thibitishaBtn"
                    onclick="onyeshaReferralSehemu20()"
                >
                    🎁 Referral & Commission
                </button>

            </div>


            <div class="booking-card">

                <h3>
                    💸 Withdrawal
                </h3>

                <button
                    class="thibitishaBtn"
                    onclick="funguaWithdrawalSehemu21()"
                >
                    💸 Omba Withdrawal
                </button>

                <button
                    class="endeleaBtn"
                    onclick="onyeshaWithdrawalZanguSehemu21()"
                >
                    📜 Withdrawal History
                </button>

            </div>


            <div class="booking-card">

                <h3>
                    🔔 Taarifa
                </h3>

                <button
                    class="thibitishaBtn"
                    onclick="funguaTaarifaSehemu22()"
                >
                    🔔 Angalia Taarifa
                </button>

            </div>


            <div class="booking-card">

                <button
                    class="endeleaBtn"
                    onclick="logoutRoomRentSehemu22()"
                >
                    🚪 Toka kwenye Account
                </button>

            </div>

        `;

    } catch (error) {

        console.error(
            "Account dashboard error:",
            error
        );

        taarifa.innerHTML = `

            <div class="booking-card">

                <p style="color:red;">
                    ❌
                    ${escapeHtmlSehemu16(
                        error.message
                    )}
                </p>

            </div>

        `;

    }
}


/* =========================================================
   22.2 NOTIFICATION COUNT
========================================================= */

async function pataNotificationCountSehemu22() {

    const currentUser =
        firebase.auth().currentUser;

    if (!currentUser) {
        return 0;
    }

    try {

        const snapshot =
            await db.collection(
                "notifications"
            )
            .where(
                "userId",
                "==",
                currentUser.uid
            )
            .where(
                "read",
                "==",
                false
            )
            .get();

        return snapshot.size;

    } catch (error) {

        console.error(
            "Notification count error:",
            error
        );

        return 0;

    }
}


/* =========================================================
   22.3 UPDATE NOTIFICATION BUTTON
========================================================= */

async function updateNotificationButtonSehemu22() {

    const button =
        document.getElementById(
            "taarifaBtn"
        );

    if (!button) {
        return;
    }

    const count =
        await pataNotificationCountSehemu22();

    button.innerHTML =
        count > 0
            ?
            `🔔 Taarifa (${count})`
            :
            `🔔 Taarifa`;
}


/* =========================================================
   22.4 OPEN NOTIFICATIONS
========================================================= */

async function funguaTaarifaSehemu22() {

    const currentUser =
        firebase.auth().currentUser;

    if (!currentUser) {

        alert(
            "🔐 Tafadhali ingia kwanza."
        );

        return;

    }

    const taarifa =
        document.getElementById(
            "taarifaSection"
        );

    const rooms =
        document.getElementById(
            "vyumba"
        );

    const form =
        document.getElementById(
            "fomuKodi"
        );

    if (rooms) {
        rooms.style.display = "none";
    }

    if (form) {
        form.style.display = "none";
    }

    if (!taarifa) {
        return;
    }

    taarifa.style.display = "block";

    taarifa.innerHTML = `

        <div class="booking-card">

            <h2>
                🔔 Taarifa
            </h2>

            <p>
                ⏳ Inapakia...
            </p>

        </div>

    `;

    try {

        const snapshot =
            await db.collection(
                "notifications"
            )
            .where(
                "userId",
                "==",
                currentUser.uid
            )
            .get();

        const notifications = [];

        snapshot.forEach(doc => {

            notifications.push({

                id: doc.id,

                ...doc.data()

            });

        });

        notifications.sort(
            (a, b) => {

                const aTime =
                    a.createdAt &&
                    a.createdAt.toMillis
                        ?
                        a.createdAt.toMillis()
                        :
                        0;

                const bTime =
                    b.createdAt &&
                    b.createdAt.toMillis
                        ?
                        b.createdAt.toMillis()
                        :
                        0;

                return bTime - aTime;

            }
        );

        let html = `

            <div class="booking-card">

                <h2>
                    🔔 Taarifa Zangu
                </h2>

                <button
                    class="thibitishaBtn"
                    onclick="markAllNotificationsReadSehemu22()"
                >
                    ✅ Soma Zote
                </button>

            </div>

        `;

        if (
            notifications.length === 0
        ) {

            html += `

                <div class="booking-card">

                    <p>
                        📭 Huna taarifa mpya.
                    </p>

                </div>

            `;

        }

        notifications.forEach(notification => {

            const unread =
                notification.read !== true;

            html += `

                <div
                    class="booking-card"
                    style="
                        margin-bottom:15px;
                        border-left:
                            ${unread ? "5px solid" : "2px solid"};
                    "
                >

                    <h3>

                        ${unread ? "🔵" : "⚪"}

                        ${escapeHtmlSehemu16(
                            notification.title ||
                            "RoomRent"
                        )}

                    </h3>

                    <p>

                        ${escapeHtmlSehemu16(
                            notification.message ||
                            ""
                        )}

                    </p>

                    ${
                        unread
                        ?
                        `
                        <button
                            class="endeleaBtn"
                            onclick="
                                markNotificationReadSehemu22(
                                    '${notification.id}'
                                )
                            "
                        >
                            ✓ Soma
                        </button>
                        `
                        :
                        ""
                    }

                </div>

            `;

        });

        taarifa.innerHTML =
            html;

        await updateNotificationButtonSehemu22();

    } catch (error) {

        console.error(
            "Notifications error:",
            error
        );

        taarifa.innerHTML = `

            <div class="booking-card">

                <p style="color:red;">
                    ❌
                    ${escapeHtmlSehemu16(
                        error.message
                    )}
                </p>

            </div>

        `;

    }
}


/* =========================================================
   22.5 MARK ONE NOTIFICATION READ
========================================================= */

async function markNotificationReadSehemu22(
    notificationId
) {

    try {

        await db.collection(
            "notifications"
        )
        .doc(
            notificationId
        )
        .update({

            read: true,

            readAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp()

        });

        await updateNotificationButtonSehemu22();

        await funguaTaarifaSehemu22();

    } catch (error) {

        console.error(
            "Read notification error:",
            error
        );

    }
}


/* =========================================================
   22.6 MARK ALL NOTIFICATIONS READ
========================================================= */

async function markAllNotificationsReadSehemu22() {

    const currentUser =
        firebase.auth().currentUser;

    if (!currentUser) {
        return;
    }

    try {

        const snapshot =
            await db.collection(
                "notifications"
            )
            .where(
                "userId",
                "==",
                currentUser.uid
            )
            .where(
                "read",
                "==",
                false
            )
            .get();

        const batch =
            db.batch();

        snapshot.forEach(doc => {

            batch.update(
                doc.ref,
                {

                    read: true,

                    readAt:
                        firebase.firestore
                            .FieldValue
                            .serverTimestamp()

                }
            );

        });

        await batch.commit();

        await updateNotificationButtonSehemu22();

        await funguaTaarifaSehemu22();

    } catch (error) {

        console.error(
            "Mark all notifications error:",
            error
        );

    }
}


/* =========================================================
   22.7 REAL-TIME NOTIFICATION LISTENER
========================================================= */

let roomrentNotificationUnsubscribeSehemu22 =
    null;


function startNotificationListenerSehemu22() {

    const currentUser =
        firebase.auth().currentUser;

    if (!currentUser) {
        return;
    }

    if (
        roomrentNotificationUnsubscribeSehemu22
    ) {

        roomrentNotificationUnsubscribeSehemu22();

    }

    roomrentNotificationUnsubscribeSehemu22 =
        db.collection(
            "notifications"
        )
        .where(
            "userId",
            "==",
            currentUser.uid
        )
        .where(
            "read",
            "==",
            false
        )
        .onSnapshot(

            snapshot => {

                const count =
                    snapshot.size;

                const button =
                    document.getElementById(
                        "taarifaBtn"
                    );

                if (button) {

                    button.innerHTML =
                        count > 0
                            ?
                            `🔔 Taarifa (${count})`
                            :
                            `🔔 Taarifa`;

                }

            },

            error => {

                console.error(
                    "Notification listener error:",
                    error
                );

            }

        );
}


/* =========================================================
   22.8 LOGOUT
========================================================= */

async function logoutRoomRentSehemu22() {

    const confirmed =
        confirm(
            "Je, unataka kutoka kwenye Account?"
        );

    if (!confirmed) {
        return;
    }

    try {

        if (
            roomrentNotificationUnsubscribeSehemu22
        ) {

            roomrentNotificationUnsubscribeSehemu22();

            roomrentNotificationUnsubscribeSehemu22 =
                null;

        }

        await firebase.auth()
            .signOut();

        alert(
            "✅ Umetoka kwenye Account."
        );

        location.reload();

    } catch (error) {

        console.error(
            "Logout error:",
            error
        );

        alert(
            "❌ Imeshindikana kutoka."
        );

    }
}


/* =========================================================
   22.9 CONNECT ACCOUNT BUTTON
========================================================= */

function connectAccountButtonSehemu22() {

    const button =
        document.getElementById(
            "accountBtn"
        );

    if (!button) {
        return;
    }

    button.addEventListener(
        "click",
        function() {

            funguaAccountSehemu22();

        }
    );
}


/* =========================================================
   22.10 CONNECT NOTIFICATION BUTTON
========================================================= */

function connectNotificationButtonSehemu22() {

    const button =
        document.getElementById(
            "taarifaBtn"
        );

    if (!button) {
        return;
    }

    button.addEventListener(
        "click",
        function() {

            funguaTaarifaSehemu22();

        }
    );
}


/* =========================================================
   22.11 START USER SERVICES
========================================================= */

function startUserServicesSehemu22() {

    const currentUser =
        firebase.auth().currentUser;

    if (!currentUser) {
        return;
    }

    startNotificationListenerSehemu22();

    updateNotificationButtonSehemu22();

}


/* =========================================================
   22.12 AUTH CONNECTION
========================================================= */

firebase.auth().onAuthStateChanged(

    async function(user) {

        if (user) {

            try {

                await initializeReferralUserSehemu20();

            } catch (error) {

                console.error(
                    "Referral initialization error:",
                    error
                );

            }

            startUserServicesSehemu22();

        } else {

            if (
                roomrentNotificationUnsubscribeSehemu22
            ) {

                roomrentNotificationUnsubscribeSehemu22();

                roomrentNotificationUnsubscribeSehemu22 =
                    null;

            }

        }

    }

);


/* =========================================================
   22.13 DOM READY
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        connectAccountButtonSehemu22();

        connectNotificationButtonSehemu22();

        connectWithdrawalButtonSehemu21();

        updateNotificationButtonSehemu22();

        console.log(
            "✅ Sehemu ya 22 tayari."
        );

    }
);


/* =========================================================
   22.14 EXPORT FUNCTIONS
========================================================= */

window.funguaAccountSehemu22 =
    funguaAccountSehemu22;

window.funguaTaarifaSehemu22 =
    funguaTaarifaSehemu22;

window.markNotificationReadSehemu22 =
    markNotificationReadSehemu22;

window.markAllNotificationsReadSehemu22 =
    markAllNotificationsReadSehemu22;

window.logoutRoomRentSehemu22 =
    logoutRoomRentSehemu22;


/* =========================================================
   SEHEMU YA 22 IMEISHIA HAPA
========================================================= */
