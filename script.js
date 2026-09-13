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
