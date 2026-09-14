/* =========================================================
   ROOMRENT - SCRIPT MPYA
   SEHEMU YA 1
   =========================================================

   MFUMO:
   - Firebase Authentication
   - Firestore
   - Email Login
   - Email Sign Up
   - Navigation
   - Rooms msingi
   - Account msingi
   - Notifications msingi
   - Withdrawal msingi

   MUHIMU:
   Firebase tayari imeanzishwa ndani ya HTML.
   HATUTUMII localStorage kama database.
========================================================= */


/* =========================================================
   1. FIREBASE
========================================================= */

const auth = firebase.auth();
const db = firebase.firestore();


/* =========================================================
   2. GLOBAL VARIABLES
========================================================= */

let currentUser = null;
let currentUserData = null;
let selectedRoom = null;
let isAdmin = false;


/* =========================================================
   3. ROOM DATA
========================================================= */

const rooms = [

    {
        id: "0023",
        price: 30000,
        days: 40,
        profitPerDay: 1000
    },

    {
        id: "0024",
        price: 70000,
        days: 40,
        profitPerDay: 2333
    },

    {
        id: "0025",
        price: 140000,
        days: 40,
        profitPerDay: 4666
    },

    {
        id: "0026",
        price: 210000,
        days: 40,
        profitPerDay: 6993
    },

    {
        id: "0027",
        price: 280000,
        days: 40,
        profitPerDay: 9324
    },

    {
        id: "0028",
        price: 350000,
        days: 40,
        profitPerDay: 11655
    },

    {
        id: "0029",
        price: 420000,
        days: 40,
        profitPerDay: 13986
    },

    {
        id: "0030",
        price: 490000,
        days: 40,
        profitPerDay: 16317
    },

    {
        id: "0031",
        price: 560000,
        days: 40,
        profitPerDay: 18648
    },

    {
        id: "0032",
        price: 630000,
        days: 40,
        profitPerDay: 20979
    }

];


/* =========================================================
   4. PAYMENT SETTINGS
========================================================= */

const PAYMENT_METHODS = {

    AIRTEL_MONEY: {
        name: "Airtel Money",
        number: "0667872515",
        owner: "HARUNA ISSA HAMAD"
    },

    MIXX_BY_YAS: {
        name: "MIXX BY YAS",
        number: "0651590936",
        owner: "HARUNA ISSA HAMAD"
    }

};


/* =========================================================
   5. REFERRAL SETTINGS
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
   6. HELPER - FORMAT MONEY
========================================================= */

function formatMoney(amount) {

    const number = Number(amount) || 0;

    return new Intl.NumberFormat("sw-TZ").format(number)
        + " TSh";

}


/* =========================================================
   7. HELPER - PHONE
========================================================= */

function formatTanzaniaPhone(phone) {

    if (!phone) {
        return "";
    }

    let value = String(phone)
        .trim()
        .replace(/\s+/g, "")
        .replace(/-/g, "");


    if (value.startsWith("+255")) {
        return value;
    }


    if (value.startsWith("255")) {
        return "+" + value;
    }


    if (value.startsWith("0")) {
        return "+255" + value.substring(1);
    }


    return value;

}


/* =========================================================
   8. HELPER - REFERRAL CODE
========================================================= */

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


/* =========================================================
   9. HELPER - BOOKING NUMBER
========================================================= */

function generateBookingNumber() {

    return "RR" +
        Date.now()
            .toString()
            .slice(-8);

}


/* =========================================================
   10. MESSAGE
========================================================= */

function showMessage(elementId, message, type = "info") {

    const element =
        document.getElementById(elementId);


    if (!element) {
        return;
    }


    element.style.display = "block";

    element.textContent = message;


    if (type === "success") {

        element.style.color = "green";

    } else if (type === "error") {

        element.style.color = "red";

    } else {

        element.style.color = "";

    }

}


/* =========================================================
   11. HIDE MAIN SECTIONS
========================================================= */

function hideAllMainSections() {

    const sections = [

        "vyumba",
        "fomuKodi",
        "taarifaSection"

    ];


    sections.forEach(id => {

        const element =
            document.getElementById(id);


        if (element) {

            element.style.display = "none";

        }

    });

}


/* =========================================================
   12. SHOW ROOMS BUTTON
========================================================= */

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
   13. DISPLAY ROOMS
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
                type="button"
                onclick="funguaFomuKodi('${room.id}')"
            >
                🏠 Kodi Chumba
            </button>

        `;


        container.appendChild(card);

    });

}


/* =========================================================
   14. ACCOUNT
========================================================= */

function funguaAccount() {

    if (!currentUser) {

        alert(
            "Tafadhali ingia kwenye account kwanza."
        );

        return;
    }


    hideAllMainSections();


    const section =
        document.getElementById("taarifaSection");


    if (!section) {
        return;
    }


    section.style.display = "block";


    section.innerHTML = `

        <div class="booking-card">

            <h2>👤 Account Yangu</h2>

            <p>
                📧 Email:
                <strong>
                    ${currentUser.email || "-"}
                </strong>
            </p>

            <p>
                👤 Jina:
                <strong>
                    ${currentUserData?.name || "-"}
                </strong>
            </p>

            <p>
                🔗 Referral Code:
                <strong>
                    ${currentUserData?.referralCode || "-"}
                </strong>
            </p>

            <p>
                💰 Commission:
                <strong>
                    ${formatMoney(
                        currentUserData?.totalCommission || 0
                    )}
                </strong>
            </p>

            <button
                class="thibitishaBtn"
                type="button"
                onclick="signOutUser()"
            >
                🚪 Toka kwenye Account
            </button>

        </div>

    `;

}


/* =========================================================
   15. NOTIFICATIONS
========================================================= */

function funguaTaarifa() {

    if (!currentUser) {

        alert(
            "Tafadhali ingia kwenye account kwanza."
        );

        return;
    }


    hideAllMainSections();


    const section =
        document.getElementById("taarifaSection");


    if (!section) {
        return;
    }


    section.style.display = "block";


    section.innerHTML = `

        <div class="booking-card">

            <h2>🔔 Taarifa</h2>

            <p>
                Hakuna taarifa mpya kwa sasa.
            </p>

        </div>

    `;

}


/* =========================================================
   16. WITHDRAWAL
========================================================= */

function funguaWithdrawal() {

    if (!currentUser) {

        alert(
            "Tafadhali ingia kwenye account kwanza."
        );

        return;
    }


    hideAllMainSections();


    const section =
        document.getElementById("taarifaSection");


    if (!section) {
        return;
    }


    section.style.display = "block";


    section.innerHTML = `

        <div class="booking-card">

            <h2>💸 Withdrawal</h2>

            <p>
                Commission yako:
            </p>

            <h3>
                ${formatMoney(
                    currentUserData?.totalCommission || 0
                )}
            </h3>

            <p>
                Mfumo wa withdrawal utaunganishwa
                kwenye hatua inayofuata.
            </p>

        </div>

    `;

}


/* =========================================================
   17. BOOKING FORM
========================================================= */

function funguaFomuKodi(roomId) {

    const room =
        rooms.find(
            item => item.id === String(roomId)
        );


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
                type="button"
                onclick="tengenezaBooking()"
            >
                🧾 Endelea na Booking
            </button>

            <button
                class="endeleaBtn"
                type="button"
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
   18. SIGN UP
========================================================= */

async function signUpUser() {

    const emailInput =
        document.getElementById("loginEmail");


    const passwordInput =
        document.getElementById("loginPassword");


    if (!emailInput || !passwordInput) {

        console.error(
            "Login inputs hazijapatikana."
        );

        return;
    }


    const email =
        emailInput.value.trim();


    const password =
        passwordInput.value;


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
            "❌ Password iwe na angalau herufi 6.",
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


        const userData = {

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

        };


        await db
            .collection("users")
            .doc(user.uid)
            .set(
                userData,
                { merge: true }
            );


        currentUser =
            user;


        currentUserData =
            userData;


        showMessage(
            "loginMessage",
            "✅ Account imetengenezwa! Karibu RoomRent.",
            "success"
        );


        console.log(
            "RoomRent: Account created.",
            user.uid
        );


        setTimeout(
            () => {

                funguaVyumba();

            },
            700
        );


    } catch (error) {

        console.error(
            "RoomRent Sign Up Error:",
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
   19. SIGN IN
========================================================= */

async function signInUser() {

    const emailInput =
        document.getElementById("loginEmail");


    const passwordInput =
        document.getElementById("loginPassword");


    if (!emailInput || !passwordInput) {

        console.error(
            "Login inputs hazijapatikana."
        );

        return;
    }


    const email =
        emailInput.value.trim();


    const password =
        passwordInput.value;


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
            "⏳ Tunaingia RoomRent..."
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


        setTimeout(
            () => {

                funguaVyumba();

            },
            500
        );


    } catch (error) {

        console.error(
            "RoomRent Sign In Error:",
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
   20. LOAD CURRENT USER
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

            const newData = {

                uid:
                    currentUser.uid,

                email:
                    currentUser.email || "",

                name:
                    currentUser.displayName ||
                    currentUser.email?.split("@")[0] ||
                    "USER",

                phone: "",

                referralCode:
                    generateReferralCode(
                        currentUser.email ||
                        "USER"
                    ),

                referredBy: "",

                totalCommission: 0,

                totalBookings: 0,

                role: "user",

                createdAt:
                    firebase.firestore.FieldValue.serverTimestamp(),

                updatedAt:
                    firebase.firestore.FieldValue.serverTimestamp()

            };


            await userRef.set(
                newData,
                { merge: true }
            );


            currentUserData =
                newData;

        }


        isAdmin =
            currentUserData?.role === "admin";


    } catch (error) {

        console.error(
            "loadCurrentUser Error:",
            error
        );

    }

}


/* =========================================================
   21. SIGN OUT
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


        hideAllMainSections();


    } catch (error) {

        console.error(
            "Sign Out Error:",
            error
        );

    }

}


/* =========================================================
   22. FIREBASE ERROR MESSAGE
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

            return "Password ni dhaifu. Tumia angalau herufi 6.";


        case "auth/user-not-found":

            return "Account haijapatikana.";


        case "auth/wrong-password":

            return "Password si sahihi.";


        case "auth/invalid-credential":

            return "Email au Password si sahihi.";


        case "auth/too-many-requests":

            return "Umejaribu mara nyingi. Jaribu tena baadaye.";


        case "auth/network-request-failed":

            return "Tatizo la Internet. Angalia connection yako.";


        case "auth/operation-not-allowed":

            return "Email/Password Login haijawezeshwa Firebase.";


        default:

            return error.message ||
                "Kuna tatizo limetokea.";

    }

}


/* =========================================================
   23. BOOKING - BASIC
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
            .getElementById("bookingPaymentMethod")
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


    } catch (error) {

        console.error(
            "Booking Error:",
            error
        );


        showMessage(
            "bookingMessage",
            "❌ " + firebaseErrorMessage(error),
            "error"
        );

    }

}


/* =========================================================
   24. ADMIN MODAL
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

            message.style.color = "red";

            message.textContent =
                "❌ Weka Username na Password.";

        }

        return;
    }


    if (message) {

        message.style.display = "block";

        message.style.color = "orange";

        message.textContent =
            "⏳ Admin login itaunganishwa kwenye Firebase.";

    }

}


/* =========================================================
   25. BUTTON EVENTS
========================================================= */

function initializeRoomRentButtons() {

    console.log(
        "RoomRent: Naunganisha buttons..."
    );


    const roomsButton =
        document.getElementById(
            "angaliaVyumba"
        );


    if (roomsButton) {

        roomsButton.onclick =
            funguaVyumba;

    }


    const bookingButton =
        document.getElementById(
            "bookingZangu"
        );


    if (bookingButton) {

        bookingButton.onclick =
            funguaBookingZangu;

    }


    const accountButton =
        document.getElementById(
            "accountBtn"
        );


    if (accountButton) {

        accountButton.onclick =
            funguaAccount;

    }


    const notificationButton =
        document.getElementById(
            "taarifaBtn"
        );


    if (notificationButton) {

        notificationButton.onclick =
            funguaTaarifa;

    }


    const withdrawalButton =
        document.getElementById(
            "withdrawalBtn"
        );


    if (withdrawalButton) {

        withdrawalButton.onclick =
            funguaWithdrawal;

    }


    const signInButton =
        document.getElementById(
            "signInBtn"
        );


    if (signInButton) {

        signInButton.onclick =
            signInUser;

    }


    const signUpButton =
        document.getElementById(
            "signUpBtn"
        );


    if (signUpButton) {

        signUpButton.onclick =
            signUpUser;

    }


    console.log(
        "RoomRent: Buttons zimeunganishwa."
    );

}


/* =========================================================
   26. BOOKING ZANGU - BASIC
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

            <h2>📋 Booking Zangu</h2>

            <p>
                Mfumo wa kuonyesha booking zako
                utaendelea kwenye sehemu inayofuata.
            </p>

        </div>

    `;

}


/* =========================================================
   27. AUTH STATE
========================================================= */

auth.onAuthStateChanged(
    async function (user) {

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
            "RoomRent: User ameingia:",
            user.uid
        );


        await loadCurrentUser();


        console.log(
            "RoomRent: User data loaded."
        );

    }
);


/* =========================================================
   28. INITIALIZE
========================================================= */

function initializeRoomRent() {

    console.log(
        "================================="
    );

    console.log(
        "ROOMRENT INAANZA..."
    );

    console.log(
        "================================="
    );


    initializeRoomRentButtons();


    console.log(
        "RoomRent: Mfumo uko tayari."
    );

}


/* =========================================================
   29. DOM READY
========================================================= */

if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeRoomRent
    );

} else {

    initializeRoomRent();

}


/* =========================================================
   30. END OF SEHEMU YA 1
========================================================= */

console.log(
    "RoomRent Script Sehemu ya 1 imepakia."
);
