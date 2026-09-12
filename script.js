/* =========================================================
   ROOMRENT - SCRIPT.JS
   FINAL INTEGRATED VERSION
   =========================================================

   MFUMO:
   1. Firebase + Firestore
   2. Account / Signup / Login
   3. Rooms + Booking
   4. Payment
   5. Booking Zangu + Notifications
   6. Profit Dashboard
   7. Admin Dashboard
   8. Wallet + Withdrawal
   9. Referral System
   10. Final Integration

   IMPORTANT:
   - Hakuna localStorage kwa data ya RoomRent
   - Data inahifadhiwa Firestore
   - Firebase Authentication hutumika Login/Signup
========================================================= */


/* =========================================================
   1. FIREBASE + FIRESTORE CORE
========================================================= */

let auth = null;
let db = null;

let roomrentCurrentUser = null;
let roomrentUserProfile = null;


/* ---------------------------------------------------------
   ANZISHA FIREBASE
--------------------------------------------------------- */

function anzishaFirebase() {

    try {

        if (
            typeof firebase === "undefined"
        ) {

            console.error(
                "Firebase SDK haijapatikana."
            );

            return false;

        }


        if (
            firebase.apps &&
            firebase.apps.length === 0
        ) {

            /*
             * Firebase yako inatarajiwa kuwa
             * initialized kwenye HTML/config.
             *
             * Kama firebaseConfig ipo HTML,
             * unaweza kuiacha hapo.
             */

            if (
                typeof firebaseConfig !==
                "undefined"
            ) {

                firebase.initializeApp(
                    firebaseConfig
                );

            } else {

                console.error(
                    "Firebase haija-initialize."
                );

                return false;

            }

        }


        auth = firebase.auth();
        db = firebase.firestore();

        return true;


    } catch (error) {

        console.error(
            "Firebase initialization error:",
            error
        );

        return false;

    }

}


/* ---------------------------------------------------------
   HAKIKISHA FIREBASE
--------------------------------------------------------- */

function hakikishaFirebase() {

    if (!auth || !db) {

        const success =
            anzishaFirebase();

        if (!success) {

            alert(
                "❌ Firebase haijaandaliwa vizuri."
            );

            return false;

        }

    }

    return true;

}


/* ---------------------------------------------------------
   FIREBASE ERROR
--------------------------------------------------------- */

function ujumbeWaFirebaseError(error) {

    const code =
        error?.code || "";

    const messages = {

        "auth/email-already-in-use":
            "❌ Email hii tayari imesajiliwa.",

        "auth/invalid-email":
            "❌ Email si sahihi.",

        "auth/weak-password":
            "❌ Password ni dhaifu. Tumia angalau herufi 6.",

        "auth/user-not-found":
            "❌ Account haijapatikana.",

        "auth/wrong-password":
            "❌ Password si sahihi.",

        "auth/invalid-credential":
            "❌ Email au password si sahihi.",

        "auth/too-many-requests":
            "⚠️ Umejaribu mara nyingi. Subiri kidogo.",

        "auth/network-request-failed":
            "❌ Hakuna internet au connection imekatika.",

        "auth/billing-not-enabled":
            "❌ Firebase Billing haijawezeshwa.",

        "permission-denied":
            "❌ Huna ruhusa ya kufanya kitendo hiki."

    };

    return (
        messages[code] ||
        error?.message ||
        "❌ Kumetokea kosa."
    );

}


/* ---------------------------------------------------------
   CURRENT USER
--------------------------------------------------------- */

function fuatiliaMtumiaji() {

    if (!hakikishaFirebase()) {
        return;
    }


    auth.onAuthStateChanged(
        async function(user) {

            roomrentCurrentUser =
                user || null;


            if (user) {

                await pakuaUserProfile(
                    user.uid
                );

            } else {

                roomrentUserProfile =
                    null;

            }


            await kamaMtumiajiAmebadilika();

        }
    );

}


/* ---------------------------------------------------------
   USER PROFILE
--------------------------------------------------------- */

async function pakuaUserProfile(uid) {

    if (!db || !uid) {
        return null;
    }


    try {

        const snap =
            await db
                .collection("users")
                .doc(uid)
                .get();


        if (!snap.exists) {

            roomrentUserProfile =
                null;

            return null;

        }


        roomrentUserProfile = {

            uid: uid,

            ...snap.data()

        };


        return roomrentUserProfile;


    } catch (error) {

        console.error(
            "Kosa kupakia profile:",
            error
        );

        return null;

    }

}


/* ---------------------------------------------------------
   HIFADHI USER PROFILE
--------------------------------------------------------- */

async function hifadhiUserProfile(
    uid,
    data
) {

    if (!db || !uid) {
        return false;
    }


    try {

        await db
            .collection("users")
            .doc(uid)
            .set(
                data,
                {
                    merge: true
                }
            );


        roomrentUserProfile = {

            ...(roomrentUserProfile || {}),

            uid: uid,

            ...data

        };


        return true;


    } catch (error) {

        console.error(
            "Kosa kuhifadhi profile:",
            error
        );

        return false;

    }

}


/* ---------------------------------------------------------
   ID
--------------------------------------------------------- */

function tengenezaID() {

    return (
        Date.now().toString(36) +
        Math.random()
            .toString(36)
            .substring(2, 8)
    );

}


/* ---------------------------------------------------------
   FEDHA
--------------------------------------------------------- */

function fedha(amount) {

    const number =
        Number(amount || 0);


    return (
        number.toLocaleString(
            "en-TZ"
        ) +
        " TSh"
    );

}


/* ---------------------------------------------------------
   TAREHE
--------------------------------------------------------- */

function tareheLeo() {

    return new Date()
        .toISOString()
        .split("T")[0];

}


/* ---------------------------------------------------------
   BOOKING NUMBER
--------------------------------------------------------- */

function tengenezaBookingNumber(
    roomNumber
) {

    const random =
        Math.floor(
            1000 +
            Math.random() * 9000
        );


    return (
        "RR-" +
        roomNumber +
        "-" +
        random
    );

}


/* ---------------------------------------------------------
   LOGIN CHECK
--------------------------------------------------------- */

function mtumiajiAmeingia() {

    return !!roomrentCurrentUser;

}


function hakikishaAmeingia() {

    if (!mtumiajiAmeingia()) {

        alert(
            "⚠️ Tafadhali ingia kwenye Account kwanza."
        );

        return false;

    }

    return true;

}


/* ---------------------------------------------------------
   CURRENT USER DATA
--------------------------------------------------------- */

function pataCurrentUserProfile() {

    return roomrentUserProfile;

}


function pataJinaLaUser() {

    return (
        roomrentUserProfile?.jina ||
        roomrentCurrentUser?.displayName ||
        "User"
    );

}


function pataSimuYaUser() {

    return (
        roomrentUserProfile?.simu ||
        ""
    );

}


/* ---------------------------------------------------------
   USER STATE
--------------------------------------------------------- */

async function kamaMtumiajiAmebadilika() {

    updateAccountUI();
    jazaProfileForm();

    unganishaRoomRentButtons();
    unganishaAdminButton();
    unganishaReferralButton();

    if (roomrentCurrentUser) {

        updateNotificationBadge();

    }

}


/* ---------------------------------------------------------
   ESCAPE HTML
--------------------------------------------------------- */

function escapeHTML(value) {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================================
   2. ACCOUNT / SIGNUP / LOGIN
========================================================= */


/* ---------------------------------------------------------
   SIGNUP
--------------------------------------------------------- */

async function sajiliAccount() {

    if (!hakikishaFirebase()) {
        return;
    }


    const jina =
        document
            .getElementById("signupJina")
            ?.value
            .trim();


    const email =
        document
            .getElementById("signupEmail")
            ?.value
            .trim();


    const simu =
        document
            .getElementById("signupSimu")
            ?.value
            .trim();


    const password =
        document
            .getElementById("signupPassword")
            ?.value;


    if (!jina) {

        alert(
            "❌ Weka jina."
        );

        return;

    }


    if (!email) {

        alert(
            "❌ Weka email."
        );

        return;

    }


    if (!simuNiSahihi(simu)) {

        alert(
            "❌ Weka namba sahihi ya Tanzania."
        );

        return;

    }


    if (
        !password ||
        password.length < 6
    ) {

        alert(
            "❌ Password iwe na angalau herufi 6."
        );

        return;

    }


    try {

        const referralCode =
            pataReferralCodeKwenyeURL();


        const credential =
            await auth
                .createUserWithEmailAndPassword(
                    email,
                    password
                );


        const user =
            credential.user;


        await user.updateProfile({

            displayName:
                jina

        });


        const profile = {

            uid:
                user.uid,

            jina:
                jina,

            email:
                email,

            simu:
                simu,

            role:
                "user",

            accountStatus:
                "active",

            balance:
                0,

            totalEarned:
                0,

            totalWithdrawn:
                0,

            referralCode:
                null,

            referredBy:
                null,

            referredByCode:
                null,

            referralLevel:
                null,

            levelBReferrer:
                null,

            levelCReferrer:
                null,

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
            .collection("users")
            .doc(user.uid)
            .set(profile);


        roomrentCurrentUser =
            user;


        await pakuaUserProfile(
            user.uid
        );


        /*
         * REFERRAL
         */

        if (referralCode) {

            await hifadhiReferralWakatiWaSignup(
                user.uid,
                referralCode
            );

            await pakuaUserProfile(
                user.uid
            );

        }


        alert(
            "✅ Account yako imetengenezwa vizuri."
        );


        updateAccountUI();


    } catch (error) {

        console.error(
            "Signup error:",
            error
        );

        alert(
            ujumbeWaFirebaseError(
                error
            )
        );

    }

}


/* ---------------------------------------------------------
   LOGIN
--------------------------------------------------------- */

async function ingiaAccount() {

    if (!hakikishaFirebase()) {
        return;
    }


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

        alert(
            "❌ Weka email na password."
        );

        return;

    }


    try {

        const credential =
            await auth
                .signInWithEmailAndPassword(
                    email,
                    password
                );


        roomrentCurrentUser =
            credential.user;


        await pakuaUserProfile(
            credential.user.uid
        );


        alert(
            "✅ Umeingia kwenye RoomRent."
        );


        updateAccountUI();
        updateNotificationBadge();


    } catch (error) {

        console.error(
            "Login error:",
            error
        );

        alert(
            ujumbeWaFirebaseError(
                error
            )
        );

    }

}


/* ---------------------------------------------------------
   LOGOUT
--------------------------------------------------------- */

async function tokaAccount() {

    try {

        await auth.signOut();

        roomrentCurrentUser =
            null;

        roomrentUserProfile =
            null;

        alert(
            "✅ Umetoka kwenye Account."
        );


        updateAccountUI();


    } catch (error) {

        console.error(
            error
        );

    }

}


/* ---------------------------------------------------------
   UPDATE PROFILE
--------------------------------------------------------- */

async function sasishaProfile() {

    if (!hakikishaAmeingia()) {
        return;
    }


    const jina =
        document
            .getElementById("profileJina")
            ?.value
            .trim();


    const simu =
        document
            .getElementById("profileSimu")
            ?.value
            .trim();


    if (!jina) {

        alert(
            "❌ Weka jina."
        );

        return;

    }


    if (
        simu &&
        !simuNiSahihi(simu)
    ) {

        alert(
            "❌ Namba ya simu si sahihi."
        );

        return;

    }


    try {

        await hifadhiUserProfile(

            roomrentCurrentUser.uid,

            {

                jina:
                    jina,

                simu:
                    simu,

                updatedAt:
                    firebase.firestore
                        .FieldValue
                        .serverTimestamp()

            }

        );


        await roomrentCurrentUser
            .updateProfile({

                displayName:
                    jina

            });


        alert(
            "✅ Profile imesasishwa."
        );


        updateAccountUI();


    } catch (error) {

        console.error(
            error
        );

        alert(
            "❌ Imeshindikana kusasisha profile."
        );

    }

}


/* ---------------------------------------------------------
   PASSWORD RESET
--------------------------------------------------------- */

async function tumaPasswordReset() {

    if (!hakikishaFirebase()) {
        return;
    }


    const email =
        document
            .getElementById("loginEmail")
            ?.value
            .trim();


    if (!email) {

        alert(
            "❌ Weka email kwanza."
        );

        return;

    }


    try {

        await auth
            .sendPasswordResetEmail(
                email
            );


        alert(
            "✅ Password reset imetumwa kwenye email yako."
        );


    } catch (error) {

        alert(
            ujumbeWaFirebaseError(
                error
            )
        );

    }

}


/* ---------------------------------------------------------
   PROFILE FORM
--------------------------------------------------------- */

function jazaProfileForm() {

    const jinaInput =
        document.getElementById(
            "profileJina"
        );


    const simuInput =
        document.getElementById(
            "profileSimu"
        );


    if (jinaInput) {

        jinaInput.value =
            pataJinaLaUser();

    }


    if (simuInput) {

        simuInput.value =
            pataSimuYaUser();

    }

}


/* ---------------------------------------------------------
   ACCOUNT BUTTON
--------------------------------------------------------- */

function updateAccountUI() {

    const button =
        document.getElementById(
            "accountBtn"
        );


    if (!button) {
        return;
    }


    if (roomrentCurrentUser) {

        button.textContent =
            "👤 " +
            pataJinaLaUser();

    } else {

        button.textContent =
            "👤 Account";

    }

}


function funguaAccount() {

    if (!roomrentCurrentUser) {

        alert(
            "⚠️ Tafadhali ingia au fungua Account."
        );

        return;

    }


    onyeshaProfile();

}


function onyeshaProfile() {

    if (!hakikishaAmeingia()) {
        return;
    }


    const profile =
        roomrentUserProfile || {};


    alert(

        "👤 ACCOUNT\n\n" +

        "Jina: " +
        (
            profile.jina ||
            ""
        ) +

        "\nEmail: " +
        (
            profile.email ||
            roomrentCurrentUser.email ||
            ""
        ) +

        "\nSimu: " +
        (
            profile.simu ||
            ""
        ) +

        "\nRole: " +
        (
            profile.role ||
            "user"
        )

    );

}


/* =========================================================
   3. ROOMS + BOOKING
========================================================= */

const vyumba = [

    {
        room: "0023",
        price: 30000,
        profit: 1200,
        days: 40
    },

    {
        room: "0024",
        price: 70000,
        profit: 2800,
        days: 35
    },

    {
        room: "0025",
        price: 140000,
        profit: 5600,
        days: 35
    },

    {
        room: "0026",
        price: 210000,
        profit: 8400,
        days: 35
    },

    {
        room: "0027",
        price: 280000,
        profit: 11200,
        days: 35
    },

    {
        room: "0028",
        price: 350000,
        profit: 14000,
        days: 35
    },

    {
        room: "0029",
        price: 420000,
        profit: 16800,
        days: 35
    },

    {
        room: "0030",
        price: 490000,
        profit: 19600,
        days: 35
    },

    {
        room: "0031",
        price: 560000,
        profit: 22400,
        days: 35
    },

    {
        room: "0032",
        price: 630000,
        profit: 25200,
        days: 35
    }

];


function pataChumba(roomNumber) {

    return vyumba.find(
        room =>
            room.room ===
            String(roomNumber)
    );

}


/* ---------------------------------------------------------
   DISPLAY ROOMS
--------------------------------------------------------- */

function onyeshaVyumba() {

    const container =
        document.getElementById(
            "vyumba"
        );


    if (!container) {
        return;
    }


    let html = `

        <h2>🏠 Vyumba vya RoomRent</h2>

        <div class="rooms-container">

    `;


    vyumba.forEach(room => {

        const totalProfit =
            room.profit *
            room.days;


        html += `

            <div class="room-card">

                <h3>
                    🏠 Chumba ${room.room}
                </h3>

                <p>
                    💰 Bei:
                    <strong>
                        ${fedha(room.price)}
                    </strong>
                </p>

                <p>
                    💵 Faida kwa siku:
                    <strong>
                        ${fedha(room.profit)}
                    </strong>
                </p>

                <p>
                    📅 Muda:
                    <strong>
                        ${room.days} siku
                    </strong>
                </p>

                <p>
                    📈 Faida yote:
                    <strong>
                        ${fedha(totalProfit)}
                    </strong>
                </p>

                <button
                    onclick="funguaBooking('${room.room}')"
                >
                    📝 Kodi Chumba
                </button>

            </div>

        `;

    });


    html += `

        </div>

    `;


    container.innerHTML =
        html;

}


/* ---------------------------------------------------------
   OPEN BOOKING
--------------------------------------------------------- */

function funguaBooking(roomNumber) {

    if (!hakikishaAmeingia()) {
        return;
    }


    const room =
        pataChumba(roomNumber);


    if (!room) {

        alert(
            "❌ Chumba hakijapatikana."
        );

        return;

    }


    const container =
        document.getElementById(
            "fomuKodi"
        );


    if (!container) {

        alert(
            "❌ Fomu ya booking haijapatikana."
        );

        return;

    }


    container.innerHTML = `

        <div class="booking-form">

            <h2>
                📝 Booking Chumba ${room.room}
            </h2>


            <p>
                Bei:
                <strong>
                    ${fedha(room.price)}
                </strong>
            </p>


            <p>
                Faida kwa siku:
                <strong>
                    ${fedha(room.profit)}
                </strong>
            </p>


            <p>
                Muda:
                <strong>
                    ${room.days} siku
                </strong>
            </p>


            <label>
                Jina
            </label>

            <input
                type="text"
                id="bookingJina"
                value="${escapeHTML(
                    pataJinaLaUser()
                )}"
            />


            <label>
                Simu
            </label>

            <input
                type="tel"
                id="bookingSimu"
                value="${escapeHTML(
                    pataSimuYaUser()
                )}"
                placeholder="07XXXXXXXX"
            />


            <label>
                Tarehe ya kuanza
            </label>

            <input
                type="date"
                id="bookingStartDate"
                min="${tareheLeo()}"
            />


            <br><br>


            <button
                onclick="tumaBooking('${room.room}')"
            >
                ✅ Thibitisha Booking
            </button>


            <button
                onclick="fungaBookingForm()"
            >
                ❌ Funga
            </button>

        </div>

    `;


    container.scrollIntoView({
        behavior: "smooth"
    });

}


function fungaBookingForm() {

    const container =
        document.getElementById(
            "fomuKodi"
        );


    if (container) {

        container.innerHTML = "";

    }

}


/* ---------------------------------------------------------
   SEND BOOKING
--------------------------------------------------------- */

async function tumaBooking(
    roomNumber
) {

    if (!hakikishaAmeingia()) {
        return;
    }


    const room =
        pataChumba(roomNumber);


    if (!room) {

        alert(
            "❌ Chumba hakijapatikana."
        );

        return;

    }


    const jina =
        document
            .getElementById(
                "bookingJina"
            )
            ?.value
            .trim();


    const simu =
        document
            .getElementById(
                "bookingSimu"
            )
            ?.value
            .trim();


    const startDate =
        document
            .getElementById(
                "bookingStartDate"
            )
            ?.value;


    if (!jina) {

        alert(
            "❌ Weka jina."
        );

        return;

    }


    if (!simuNiSahihi(simu)) {

        alert(
            "❌ Weka namba sahihi ya Tanzania."
        );

        return;

    }


    if (!startDate) {

        alert(
            "❌ Chagua tarehe ya kuanza."
        );

        return;

    }


    if (
        startDate <
        tareheLeo()
    ) {

        alert(
            "❌ Tarehe haiwezi kuwa imepita."
        );

        return;

    }


    try {

        const booking = {

            bookingNumber:
                tengenezaBookingNumber(
                    room.room
                ),

            userId:
                roomrentCurrentUser.uid,

            jina:
                jina,

            simu:
                simu,

            roomNumber:
                room.room,

            price:
                room.price,

            dailyProfit:
                room.profit,

            totalDays:
                room.days,

            startDate:
                startDate,

            paymentStatus:
                "Haijalipwa",

            bookingStatus:
                "Inasubiri",

            notificationRead:
                false,

            paymentMethod:
                null,

            paymentPhone:
                null,

            paymentDate:
                null,

            createdAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp(),

            updatedAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp()

        };


        const ref =
            await db
                .collection("bookings")
                .add(booking);


        await ref.update({

            bookingId:
                ref.id

        });


        await hifadhiUserProfile(

            roomrentCurrentUser.uid,

            {

                jina:
                    jina,

                simu:
                    simu

            }

        );


        await tengenezaNotification(

            roomrentCurrentUser.uid,

            {

                title:
                    "📝 Booking Imetumwa",

                message:
                    `Booking ${booking.bookingNumber} ya chumba ${room.room} imetumwa.`,

                type:
                    "booking_created",

                bookingId:
                    ref.id

            }

        );


        alert(
            "✅ Booking yako imetumwa."
        );


        fungaBookingForm();


        await onyeshaBookingZangu();


    } catch (error) {

        console.error(
            "Booking error:",
            error
        );

        alert(
            "❌ Imeshindikana kutengeneza booking."
        );

    }

}


/* ---------------------------------------------------------
   USER BOOKINGS
--------------------------------------------------------- */

async function pataBookingsZaUser() {

    if (!hakikishaAmeingia()) {
        return [];
    }


    try {

        const snapshot =
            await db
                .collection("bookings")
                .where(
                    "userId",
                    "==",
                    roomrentCurrentUser.uid
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

                const aTime =
                    a.createdAt?.toMillis
                        ? a.createdAt.toMillis()
                        : 0;

                const bTime =
                    b.createdAt?.toMillis
                        ? b.createdAt.toMillis()
                        : 0;

                return bTime - aTime;

            }
        );


        return bookings;


    } catch (error) {

        console.error(
            error
        );

        return [];

    }

}


/* ---------------------------------------------------------
   DAYS
--------------------------------------------------------- */

function hesabuSiku(
    startDate
) {

    if (!startDate) {
        return 0;
    }


    const start =
        new Date(
            startDate +
            "T00:00:00"
        );


    const now =
        new Date();


    const difference =
        now.getTime() -
        start.getTime();


    return Math.floor(
        difference /
        (
            1000 *
            60 *
            60 *
            24
        )
    );

}


function hesabuFaidaTarajiwa(
    dailyProfit,
    totalDays
) {

    return (
        Number(dailyProfit || 0) *
        Number(totalDays || 0)
    );

}


function bookingStatusText(
    booking
) {

    if (
        booking.bookingStatus ===
        "Imethibitishwa"
    ) {

        return (
            "✅ Booking yako imethibitishwa"
        );

    }


    if (
        booking.paymentStatus ===
        "Imelipwa"
    ) {

        return (
            "💳 Malipo yamepokelewa"
        );

    }


    if (
        booking.bookingStatus ===
        "Imekataliwa"
    ) {

        return (
            "❌ Booking imekataliwa"
        );

    }


    return (
        "⏳ Booking inasubiri malipo"
    );

}


/* =========================================================
   4. PAYMENT
========================================================= */

async function pataBookingKwaID(
    bookingId
) {

    if (!bookingId) {
        return null;
    }


    try {

        const snap =
            await db
                .collection("bookings")
                .doc(bookingId)
                .get();


        if (!snap.exists) {
            return null;
        }


        return {

            id: snap.id,

            ...snap.data()

        };


    } catch (error) {

        console.error(
            error
        );

        return null;

    }

}


/* ---------------------------------------------------------
   PHONE
--------------------------------------------------------- */

function simuNiSahihi(
    simu
) {

    if (!simu) {
        return false;
    }


    const clean =
        simu
            .replace(
                /\s/g,
                ""
            );


    return (
        /^0[67]\d{8}$/.test(clean) ||
        /^\+255[67]\d{8}$/.test(clean)
    );

}


function rekebishaSimu(
    simu
) {

    const clean =
        String(simu || "")
            .replace(
                /\s/g,
                ""
            );


    if (
        clean.startsWith("0")
    ) {

        return (
            "+255" +
            clean.substring(1)
        );

    }


    return clean;

}


/* ---------------------------------------------------------
   OPEN PAYMENT
--------------------------------------------------------- */

async function funguaMalipo(
    bookingId
) {

    if (!hakikishaAmeingia()) {
        return;
    }


    const booking =
        await pataBookingKwaID(
            bookingId
        );


    if (!booking) {

        alert(
            "❌ Booking haijapatikana."
        );

        return;

    }


    if (
        booking.userId !==
        roomrentCurrentUser.uid
    ) {

        alert(
            "❌ Huna ruhusa ya booking hii."
        );

        return;

    }


    if (
        booking.paymentStatus ===
        "Imelipwa"
    ) {

        alert(
            "ℹ️ Booking hii tayari imelipiwa."
        );

        return;

    }


    const container =
        document.getElementById(
            "fomuKodi"
        );


    if (!container) {
        return;
    }


    container.innerHTML = `

        <div class="payment-form">

            <h2>💳 Lipa Booking</h2>

            <p>
                Booking:
                <strong>
                    ${escapeHTML(
                        booking.bookingNumber
                    )}
                </strong>
            </p>

            <p>
                Chumba:
                <strong>
                    ${escapeHTML(
                        booking.roomNumber
                    )}
                </strong>
            </p>

            <p>
                Kiasi:
                <strong>
                    ${fedha(
                        booking.price
                    )}
                </strong>
            </p>


            <label>
                Namba ya simu ya malipo
            </label>

            <input
                type="tel"
                id="paymentPhone"
                value="${escapeHTML(
                    pataSimuYaUser()
                )}"
                placeholder="07XXXXXXXX"
            />


            <br><br>


            <button
                onclick="fanyaMalipo(
                    '${booking.id}',
                    'MIXX BY YAS'
                )"
            >
                💳 Lipa MIXX BY YAS
            </button>


            <button
                onclick="fanyaMalipo(
                    '${booking.id}',
                    'Airtel Money'
                )"
            >
                💳 Lipa Airtel Money
            </button>

        </div>

    `;

}


/* ---------------------------------------------------------
   MAKE PAYMENT REQUEST
--------------------------------------------------------- */

async function fanyaMalipo(
    bookingId,
    paymentMethod
) {

    if (!hakikishaAmeingia()) {
        return;
    }


    const booking =
        await pataBookingKwaID(
            bookingId
        );


    if (!booking) {

        alert(
            "❌ Booking haijapatikana."
        );

        return;

    }


    if (
        booking.userId !==
        roomrentCurrentUser.uid
    ) {

        alert(
            "❌ Huna ruhusa."
        );

        return;

    }


    if (
        booking.paymentStatus ===
        "Imelipwa"
    ) {

        alert(
            "ℹ️ Malipo tayari yamepokelewa."
        );

        return;

    }


    const phone =
        document
            .getElementById(
                "paymentPhone"
            )
            ?.value
            .trim();


    if (!simuNiSahihi(phone)) {

        alert(
            "❌ Weka namba sahihi."
        );

        return;

    }


    try {

        const normalizedPhone =
            rekebishaSimu(phone);


        const payment = {

            bookingId:
                bookingId,

            userId:
                roomrentCurrentUser.uid,

            bookingNumber:
                booking.bookingNumber,

            roomNumber:
                booking.roomNumber,

            amount:
                booking.price,

            paymentMethod:
                paymentMethod,

            paymentPhone:
                normalizedPhone,

            status:
                "Inasubiri Uthibitisho",

            createdAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp(),

            updatedAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp()

        };


        const paymentRef =
            await db
                .collection("payments")
                .add(payment);


        await db
            .collection("bookings")
            .doc(bookingId)
            .update({

                paymentStatus:
                    "Imelipwa",

                paymentMethod:
                    paymentMethod,

                paymentPhone:
                    normalizedPhone,

                paymentDate:
                    firebase.firestore
                        .FieldValue
                        .serverTimestamp(),

                bookingStatus:
                    "Inasubiri Uthibitisho wa Admin",

                paymentId:
                    paymentRef.id,

                updatedAt:
                    firebase.firestore
                        .FieldValue
                        .serverTimestamp()

            });


        await tengenezaNotification(

            roomrentCurrentUser.uid,

            {

                title:
                    "💳 Malipo Yamepokelewa",

                message:
                    `Malipo ya ${fedha(booking.price)} yamepokelewa na yanasubiri uthibitisho wa Admin.`,

                type:
                    "payment_received",

                bookingId:
                    bookingId

            }

        );


        alert(
            "✅ Ombi la malipo limetumwa."
        );


        await onyeshaBookingZangu();


    } catch (error) {

        console.error(
            error
        );

        alert(
            "❌ Imeshindikana kutuma malipo."
        );

    }

}


/* ---------------------------------------------------------
   DELETE UNPAID BOOKING
--------------------------------------------------------- */

async function futaBookingIsiyolipwa(
    bookingId
) {

    if (!hakikishaAmeingia()) {
        return;
    }


    const booking =
        await pataBookingKwaID(
            bookingId
        );


    if (!booking) {
        return;
    }


    if (
        booking.userId !==
        roomrentCurrentUser.uid
    ) {

        alert(
            "❌ Huna ruhusa."
        );

        return;

    }


    if (
        booking.paymentStatus !==
        "Haijalipwa"
    ) {

        alert(
            "❌ Booking iliyolipiwa haiwezi kufutwa hapa."
        );

        return;

    }


    if (
        !confirm(
            "Una uhakika unataka kufuta booking?"
        )
    ) {

        return;

    }


    try {

        await db
            .collection("bookings")
            .doc(bookingId)
            .delete();


        alert(
            "✅ Booking imefutwa."
        );


        await onyeshaBookingZangu();


    } catch (error) {

        console.error(
            error
        );

        alert(
            "❌ Imeshindikana kufuta booking."
        );

    }

}


/* =========================================================
   5. BOOKING ZANGU + NOTIFICATIONS
========================================================= */


/* ---------------------------------------------------------
   BOOKING ZANGU
--------------------------------------------------------- */

async function onyeshaBookingZangu() {

    if (!hakikishaAmeingia()) {
        return;
    }


    let container =
        document.getElementById(
            "bookingZanguSection"
        );


    if (!container) {

        container =
            document.getElementById(
                "vyumba"
            );

    }


    if (!container) {
        return;
    }


    const bookings =
        await pataBookingsZaUser();


    let html = `

        <div class="my-bookings">

            <h2>📋 Booking Zangu</h2>

    `;


    if (
        bookings.length === 0
    ) {

        html += `

            <p>
                Bado huna booking.
            </p>

        `;

    }


    bookings.forEach(
        booking => {

            html +=
                tengenezaBookingCard(
                    booking
                );

        }
    );


    html += `

        </div>

    `;


    container.innerHTML =
        html;

}


/* ---------------------------------------------------------
   BOOKING CARD
--------------------------------------------------------- */

function tengenezaBookingCard(
    booking
) {

    let actions = "";


    if (
        booking.paymentStatus ===
        "Haijalipwa"
    ) {

        actions += `

            <button
                onclick="funguaMalipo(
                    '${booking.id}'
                )"
            >
                💳 Lipa
            </button>

            <button
                onclick="futaBookingIsiyolipwa(
                    '${booking.id}'
                )"
            >
                🗑️ Futa
            </button>

        `;

    }


    if (
        booking.paymentStatus ===
            "Imelipwa" &&
        booking.bookingStatus !==
            "Imethibitishwa" &&
        booking.bookingStatus !==
            "Imekataliwa"
    ) {

        actions += `

            <p>
                ⏳ Inasubiri uthibitisho wa Admin.
            </p>

        `;

    }


    if (
        booking.bookingStatus ===
        "Imethibitishwa"
    ) {

        const daysElapsed =
            Math.min(
                Math.max(
                    hesabuSiku(
                        booking.startDate
                    ),
                    0
                ),
                Number(
                    booking.totalDays || 0
                )
            );


        const remaining =
            Math.max(
                Number(
                    booking.totalDays || 0
                ) -
                daysElapsed,
                0
            );


        const profit =
            Number(
                booking.dailyProfit || 0
            ) *
            daysElapsed;


        actions += `

            <p>
                ⏱️ Siku zilizopita:
                <strong>
                    ${daysElapsed}
                </strong>
            </p>

            <p>
                ⏳ Siku zilizobaki:
                <strong>
                    ${remaining}
                </strong>
            </p>

            <p>
                💰 Faida iliyopatikana:
                <strong>
                    ${fedha(profit)}
                </strong>
            </p>

        `;

    }


    return `

        <div class="booking-card">

            <h3>
                🏠 Chumba
                ${escapeHTML(
                    booking.roomNumber
                )}
            </h3>


            <p>
                Booking:
                <strong>
                    ${escapeHTML(
                        booking.bookingNumber
                    )}
                </strong>
            </p>


            <p>
                Jina:
                ${escapeHTML(
                    booking.jina
                )}
            </p>


            <p>
                Simu:
                ${escapeHTML(
                    booking.simu
                )}
            </p>


            <p>
                Bei:
                <strong>
                    ${fedha(
                        booking.price
                    )}
                </strong>
            </p>


            <p>
                Faida kwa siku:
                <strong>
                    ${fedha(
                        booking.dailyProfit
                    )}
                </strong>
            </p>


            <p>
                Muda:
                <strong>
                    ${booking.totalDays}
                    siku
                </strong>
            </p>


            <p>
                Tarehe ya kuanza:
                ${escapeHTML(
                    booking.startDate
                )}
            </p>


            <p>
                Payment:
                <strong>
                    ${escapeHTML(
                        booking.paymentStatus
                    )}
                </strong>
            </p>


            <p>
                Status:
                <strong>
                    ${escapeHTML(
                        booking.bookingStatus
                    )}
                </strong>
            </p>


            <p>
                ${bookingStatusText(
                    booking
                )}
            </p>


            <div class="booking-actions">

                ${actions}

            </div>

        </div>

    `;

}


/* ---------------------------------------------------------
   NOTIFICATION
--------------------------------------------------------- */

async function tengenezaNotification(
    userId,
    data
) {

    if (!db || !userId) {
        return;
    }


    try {

        await db
            .collection("notifications")
            .add({

                userId:
                    userId,

                title:
                    data.title ||
                    "Taarifa",

                message:
                    data.message ||
                    "",

                type:
                    data.type ||
                    "general",

                bookingId:
                    data.bookingId ||
                    null,

                read:
                    false,

                createdAt:
                    firebase.firestore
                        .FieldValue
                        .serverTimestamp()

            });


    } catch (error) {

        console.error(
            "Notification error:",
            error
        );

    }

}


/* ---------------------------------------------------------
   USER NOTIFICATIONS
--------------------------------------------------------- */

async function pataTaarifaZaUser() {

    if (!hakikishaAmeingia()) {
        return [];
    }


    try {

        const snapshot =
            await db
                .collection("notifications")
                .where(
                    "userId",
                    "==",
                    roomrentCurrentUser.uid
                )
                .get();


        const notifications = [];


        snapshot.forEach(doc => {

            notifications.push({

                id:
                    doc.id,

                ...doc.data()

            });

        });


        notifications.sort(
            (a, b) => {

                const aTime =
                    a.createdAt?.toMillis
                        ? a.createdAt.toMillis()
                        : 0;

                const bTime =
                    b.createdAt?.toMillis
                        ? b.createdAt.toMillis()
                        : 0;

                return bTime - aTime;

            }
        );


        return notifications;


    } catch (error) {

        console.error(
            error
        );

        return [];

    }

}


/* ---------------------------------------------------------
   COUNT NOTIFICATIONS
--------------------------------------------------------- */

async function pataIdadiYaTaarifa() {

    const notifications =
        await pataTaarifaZaUser();


    return notifications.filter(
        item =>
            item.read !== true
    ).length;

}


async function updateNotificationBadge() {

    const button =
        document.getElementById(
            "taarifaBtn"
        );


    if (!button) {
        return;
    }


    if (!roomrentCurrentUser) {

        button.textContent =
            "🔔 Taarifa";

        return;

    }


    const count =
        await pataIdadiYaTaarifa();


    button.textContent =
        count > 0
            ? `🔔 Taarifa (${count})`
            : "🔔 Taarifa";

}


/* ---------------------------------------------------------
   SHOW NOTIFICATIONS
--------------------------------------------------------- */

async function onyeshaTaarifa() {

    if (!hakikishaAmeingia()) {
        return;
    }


    const container =
        document.getElementById(
            "taarifaSection"
        );


    if (!container) {

        alert(
            "Hakuna sehemu ya Taarifa kwenye HTML."
        );

        return;

    }


    const notifications =
        await pataTaarifaZaUser();


    let html = `

        <div class="notifications">

            <h2>🔔 Taarifa</h2>

    `;


    if (
        notifications.length === 0
    ) {

        html += `

            <p>
                Huna taarifa mpya.
            </p>

        `;

    }


    notifications.forEach(
        notification => {

            html += `

                <div class="notification-card">

                    <h3>
                        ${escapeHTML(
                            notification.title
                        )}
                    </h3>

                    <p>
                        ${escapeHTML(
                            notification.message
                        )}
                    </p>

                </div>

            `;

        }
    );


    html += `

        </div>

    `;


    container.innerHTML =
        html;


    await markAllNotificationsAsRead();

}


/* ---------------------------------------------------------
   MARK READ
--------------------------------------------------------- */

async function markNotificationAsRead(
    notificationId
) {

    try {

        await db
            .collection("notifications")
            .doc(notificationId)
            .update({

                read:
                    true

            });

    } catch (error) {

        console.error(
            error
        );

    }

}


async function markAllNotificationsAsRead() {

    if (!hakikishaAmeingia()) {
        return;
    }


    try {

        const snapshot =
            await db
                .collection("notifications")
                .where(
                    "userId",
                    "==",
                    roomrentCurrentUser.uid
                )
                .get();


        const batch =
            db.batch();


        snapshot.forEach(doc => {

            const data =
                doc.data();


            if (
                data.read !== true
            ) {

                batch.update(
                    doc.ref,
                    {
                        read: true
                    }
                );

            }

        });


        await batch.commit();


        await updateNotificationBadge();


    } catch (error) {

        console.error(
            error
        );

    }

}


/* =========================================================
   6. PROFIT DASHBOARD
========================================================= */


/* ---------------------------------------------------------
   CONFIRMED BOOKINGS
--------------------------------------------------------- */

async function pataBookingsZilizothibitishwa() {

    const bookings =
        await pataBookingsZaUser();


    return bookings.filter(
        booking =>
            booking.bookingStatus ===
            "Imethibitishwa"
    );

}


/* ---------------------------------------------------------
   PROFIT CALCULATION
--------------------------------------------------------- */

function hesabuDashboardFaida(
    booking
) {

    const totalDays =
        Number(
            booking.totalDays || 0
        );


    const dailyProfit =
        Number(
            booking.dailyProfit || 0
        );


    let daysElapsed =
        hesabuSiku(
            booking.startDate
        );


    if (daysElapsed < 0) {
        daysElapsed = 0;
    }


    if (
        daysElapsed >
        totalDays
    ) {

        daysElapsed =
            totalDays;

    }


    const daysRemaining =
        Math.max(
            totalDays -
            daysElapsed,
            0
        );


    const profitEarned =
        dailyProfit *
        daysElapsed;


    const expectedProfit =
        dailyProfit *
        totalDays;


    const progress =
        totalDays > 0
            ? Math.min(
                (
                    daysElapsed /
                    totalDays
                ) * 100,
                100
            )
            : 0;


    return {

        totalDays,
        dailyProfit,
        daysElapsed,
        daysRemaining,
        profitEarned,
        expectedProfit,
        progress

    };

}


/* ---------------------------------------------------------
   PROFIT DASHBOARD
--------------------------------------------------------- */

async function onyeshaDashboardFaida() {

    if (!hakikishaAmeingia()) {
        return;
    }


    const bookings =
        await pataBookingsZilizothibitishwa();


    let container =
        document.getElementById(
            "faidaSection"
        );


    if (!container) {

        container =
            document.getElementById(
                "vyumba"
            );

    }


    if (!container) {
        return;
    }


    if (
        bookings.length === 0
    ) {

        container.innerHTML = `

            <div class="faida-dashboard">

                <h2>
                    📊 Dashboard ya Faida
                </h2>

                <p>
                    Bado huna booking
                    iliyothibitishwa.
                </p>

            </div>

        `;

        return;

    }


    let totalProfitEarned = 0;
    let totalExpectedProfit = 0;
    let totalDailyProfit = 0;


    bookings.forEach(
        booking => {

            const info =
                hesabuDashboardFaida(
                    booking
                );


            totalProfitEarned +=
                info.profitEarned;


            totalExpectedProfit +=
                info.expectedProfit;


            totalDailyProfit +=
                info.dailyProfit;

        }
    );


    let html = `

        <div class="faida-dashboard">

            <h2>
                📊 Dashboard ya Faida
            </h2>


            <div class="faida-summary">

                <div class="faida-box">

                    <h3>
                        💰 Faida Iliyopatikana
                    </h3>

                    <strong>
                        ${fedha(
                            totalProfitEarned
                        )}
                    </strong>

                </div>


                <div class="faida-box">

                    <h3>
                        📈 Faida Inayotarajiwa
                    </h3>

                    <strong>
                        ${fedha(
                            totalExpectedProfit
                        )}
                    </strong>

                </div>


                <div class="faida-box">

                    <h3>
                        💵 Faida Kwa Siku
                    </h3>

                    <strong>
                        ${fedha(
                            totalDailyProfit
                        )}
                    </strong>

                </div>

            </div>

    `;


    bookings.forEach(
        booking => {

            const info =
                hesabuDashboardFaida(
                    booking
                );


            html += `

                <div class="faida-card">

                    <h3>
                        🏠 Chumba
                        ${escapeHTML(
                            booking.roomNumber
                        )}
                    </h3>


                    <p>
                        Booking:
                        ${escapeHTML(
                            booking.bookingNumber
                        )}
                    </p>


                    <p>
                        💵 Faida kwa siku:
                        <strong>
                            ${fedha(
                                info.dailyProfit
                            )}
                        </strong>
                    </p>


                    <p>
                        📅 Muda:
                        <strong>
                            ${info.totalDays}
                            siku
                        </strong>
                    </p>


                    <p>
                        ⏳ Siku zilizopita:
                        <strong>
                            ${info.daysElapsed}
                        </strong>
                    </p>


                    <p>
                        🔄 Siku zilizobaki:
                        <strong>
                            ${info.daysRemaining}
                        </strong>
                    </p>


                    <p>
                        💰 Faida iliyopatikana:
                        <strong>
                            ${fedha(
                                info.profitEarned
                            )}
                        </strong>
                    </p>


                    <p>
                        📈 Faida inayotarajiwa:
                        <strong>
                            ${fedha(
                                info.expectedProfit
                            )}
                        </strong>
                    </p>


                    <div class="progress-container">

                        <div
                            class="progress-bar"
                            style="width:${info.progress}%"
                        ></div>

                    </div>


                    <p>
                        <strong>
                            ${info.progress.toFixed(1)}%
                        </strong>
                        imekamilika
                    </p>

                </div>

            `;

        }
    );


    html += `

        </div>

    `;


    container.innerHTML =
        html;

}


function funguaDashboardFaida() {

    if (!hakikishaAmeingia()) {
        return;
    }


    onyeshaDashboardFaida();

}


/* =========================================================
   7. ADMIN
========================================================= */


/* ---------------------------------------------------------
   IS ADMIN
--------------------------------------------------------- */

async function niAdmin() {

    if (!roomrentCurrentUser) {
        return false;
    }


    try {

        const snap =
            await db
                .collection("users")
                .doc(
                    roomrentCurrentUser.uid
                )
                .get();


        if (!snap.exists) {
            return false;
        }


        return (
            snap.data().role ===
            "admin"
        );


    } catch (error) {

        console.error(
            error
        );

        return false;

    }

}


/* ---------------------------------------------------------
   ADMIN DASHBOARD
--------------------------------------------------------- */

async function funguaAdminDashboard() {

    if (!hakikishaAmeingia()) {
        return;
    }


    const admin =
        await niAdmin();


    if (!admin) {

        alert(
            "❌ Huna ruhusa ya Admin."
        );

        return;

    }


    let container =
        document.getElementById(
            "adminSection"
        );


    if (!container) {

        container =
            document.getElementById(
                "vyumba"
            );

    }


    if (!container) {
        return;
    }


    container.innerHTML = `

        <div class="admin-dashboard">

            <h2>
                🛠️ Admin Dashboard
            </h2>

            <div id="adminBookings">
                ⏳ Inapakia...
            </div>


            <hr>


            <div id="adminWithdrawals">
                ⏳ Inapakia withdrawals...
            </div>

        </div>

    `;


    await onyeshaAdminBookings();
    await onyeshaAdminWithdrawals();

}


/* ---------------------------------------------------------
   ALL BOOKINGS
--------------------------------------------------------- */

async function pataBookingsZaAdmin() {

    try {

        const snapshot =
            await db
                .collection("bookings")
                .get();


        const bookings = [];


        snapshot.forEach(doc => {

            bookings.push({

                id:
                    doc.id,

                ...doc.data()

            });

        });


        bookings.sort(
            (a, b) => {

                const aTime =
                    a.createdAt?.toMillis
                        ? a.createdAt.toMillis()
                        : 0;

                const bTime =
                    b.createdAt?.toMillis
                        ? b.createdAt.toMillis()
                        : 0;

                return bTime - aTime;

            }
        );


        return bookings;


    } catch (error) {

        console.error(
            error
        );

        return [];

    }

}


/* ---------------------------------------------------------
   ADMIN BOOKINGS
--------------------------------------------------------- */

async function onyeshaAdminBookings() {

    if (
        !(await niAdmin())
    ) {
        return;
    }


    const container =
        document.getElementById(
            "adminBookings"
        );


    if (!container) {
        return;
    }


    const bookings =
        await pataBookingsZaAdmin();


    let html = `

        <h3>
            📋 Bookings
        </h3>

    `;


    if (
        bookings.length === 0
    ) {

        html += `
            <p>
                Hakuna booking.
            </p>
        `;

    }


    bookings.forEach(
        booking => {

            let buttons = "";


            if (
                booking.paymentStatus ===
                    "Imelipwa" &&
                booking.bookingStatus !==
                    "Imethibitishwa" &&
                booking.bookingStatus !==
                    "Imekataliwa"
            ) {

                buttons = `

                    <button
                        onclick="thibitishaBooking(
                            '${booking.id}'
                        )"
                    >
                        ✅ Thibitisha
                    </button>


                    <button
                        onclick="kataaBooking(
                            '${booking.id}'
                        )"
                    >
                        ❌ Kataa
                    </button>

                `;

            }


            html += `

                <div class="admin-booking-card">

                    <h3>
                        🏠 Chumba
                        ${escapeHTML(
                            booking.roomNumber
                        )}
                    </h3>


                    <p>
                        Booking:
                        ${escapeHTML(
                            booking.bookingNumber
                        )}
                    </p>


                    <p>
                        Jina:
                        ${escapeHTML(
                            booking.jina
                        )}
                    </p>


                    <p>
                        Simu:
                        ${escapeHTML(
                            booking.simu
                        )}
                    </p>


                    <p>
                        Kiasi:
                        <strong>
                            ${fedha(
                                booking.price
                            )}
                        </strong>
                    </p>


                    <p>
                        Payment:
                        ${escapeHTML(
                            booking.paymentStatus
                        )}
                    </p>


                    <p>
                        Status:
                        ${escapeHTML(
                            booking.bookingStatus
                        )}
                    </p>


                    ${buttons}

                </div>

            `;

        }
    );


    container.innerHTML =
        html;

}


/* ---------------------------------------------------------
   CONFIRM BOOKING
--------------------------------------------------------- */

async function thibitishaBooking(
    bookingId
) {

    if (
        !(await niAdmin())
    ) {

        alert(
            "❌ Huna ruhusa ya Admin."
        );

        return;

    }


    if (
        !confirm(
            "Thibitisha booking hii?"
        )
    ) {
        return;
    }


    try {

        const ref =
            db
                .collection("bookings")
                .doc(bookingId);


        const snap =
            await ref.get();


        if (!snap.exists) {

            alert(
                "❌ Booking haijapatikana."
            );

            return;

        }


        const booking =
            snap.data();


        await ref.update({

            bookingStatus:
                "Imethibitishwa",

            confirmedBy:
                roomrentCurrentUser.uid,

            confirmedAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp(),

            updatedAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp()

        });


        /*
         * CREATE REFERRAL COMMISSIONS
         * Mara moja tu kwa booking.
         */

        await tengenezaReferralCommission(
            bookingId,
            booking.userId,
            booking.price
        );


        await tengenezaNotification(

            booking.userId,

            {

                title:
                    "✅ Booking Imethibitishwa",

                message:
                    `Booking yako ya chumba ${booking.roomNumber} imethibitishwa na Admin.`,

                type:
                    "booking_confirmed",

                bookingId:
                    bookingId

            }

        );


        alert(
            "✅ Booking imethibitishwa."
        );


        await onyeshaAdminBookings();


    } catch (error) {

        console.error(
            error
        );

        alert(
            "❌ Imeshindikana kuthibitisha booking."
        );

    }

}


/* ---------------------------------------------------------
   REJECT BOOKING
--------------------------------------------------------- */

async function kataaBooking(
    bookingId
) {

    if (
        !(await niAdmin())
    ) {

        alert(
            "❌ Huna ruhusa ya Admin."
        );

        return;

    }


    if (
        !confirm(
            "Kataa booking hii?"
        )
    ) {
        return;
    }


    try {

        const ref =
            db
                .collection("bookings")
                .doc(bookingId);


        const snap =
            await ref.get();


        if (!snap.exists) {
            return;
        }


        const booking =
            snap.data();


        await ref.update({

            bookingStatus:
                "Imekataliwa",

            rejectedBy:
                roomrentCurrentUser.uid,

            rejectedAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp(),

            updatedAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp()

        });


        await tengenezaNotification(

            booking.userId,

            {

                title:
                    "❌ Booking Imekataliwa",

                message:
                    `Booking yako ya chumba ${booking.roomNumber} imekataliwa na Admin.`,

                type:
                    "booking_rejected",

                bookingId:
                    bookingId

            }

        );


        alert(
            "❌ Booking imekataliwa."
        );


        await onyeshaAdminBookings();


    } catch (error) {

        console.error(
            error
        );

        alert(
            "❌ Imeshindikana kukataa booking."
        );

    }

}


/* =========================================================
   8. WALLET + WITHDRAWAL
========================================================= */


/* ---------------------------------------------------------
   WALLET
--------------------------------------------------------- */

async function pataWalletYaUser() {

    if (!hakikishaAmeingia()) {

        return {

            balance: 0,
            totalEarned: 0,
            totalWithdrawn: 0

        };

    }


    try {

        const snap =
            await db
                .collection("users")
                .doc(
                    roomrentCurrentUser.uid
                )
                .get();


        if (!snap.exists) {

            return {

                balance: 0,
                totalEarned: 0,
                totalWithdrawn: 0

            };

        }


        const data =
            snap.data();


        return {

            balance:
                Number(
                    data.balance || 0
                ),

            totalEarned:
                Number(
                    data.totalEarned || 0
                ),

            totalWithdrawn:
                Number(
                    data.totalWithdrawn || 0
                )

        };


    } catch (error) {

        console.error(
            error
        );


        return {

            balance: 0,
            totalEarned: 0,
            totalWithdrawn: 0

        };

    }

}


/* ---------------------------------------------------------
   WALLET DISPLAY
--------------------------------------------------------- */

async function onyeshaWallet() {

    if (!hakikishaAmeingia()) {
        return;
    }


    const wallet =
        await pataWalletYaUser();


    let container =
        document.getElementById(
            "walletSection"
        );


    if (!container) {

        container =
            document.getElementById(
                "vyumba"
            );

    }


    if (!container) {
        return;
    }


    container.innerHTML = `

        <div class="wallet-dashboard">

            <h2>
                💰 Wallet Yangu
            </h2>


            <div class="wallet-box">

                <p>
                    Salio
                </p>

                <h2>
                    ${fedha(
                        wallet.balance
                    )}
                </h2>

            </div>


            <p>
                💵 Jumla Iliyopatikana:
                <strong>
                    ${fedha(
                        wallet.totalEarned
                    )}
                </strong>
            </p>


            <p>
                💸 Jumla Iliyotolewa:
                <strong>
                    ${fedha(
                        wallet.totalWithdrawn
                    )}
                </strong>
            </p>


            <button
                onclick="funguaWithdrawal()"
            >
                💸 Toa Pesa
            </button>


            <button
                onclick="onyeshaWithdrawals()"
            >
                📋 Withdrawal Zangu
            </button>

        </div>

    `;

}


/* ---------------------------------------------------------
   WITHDRAWAL FORM
--------------------------------------------------------- */

async function funguaWithdrawal() {

    if (!hakikishaAmeingia()) {
        return;
    }


    const wallet =
        await pataWalletYaUser();


    let container =
        document.getElementById(
            "walletSection"
        );


    if (!container) {

        container =
            document.getElementById(
                "vyumba"
            );

    }


    if (!container) {
        return;
    }


    container.innerHTML = `

        <div class="withdrawal-form">

            <h2>
                💸 Toa Pesa
            </h2>


            <p>
                Salio:
                <strong>
                    ${fedha(
                        wallet.balance
                    )}
                </strong>
            </p>


            <label>
                Kiasi
            </label>

            <input
                type="number"
                id="withdrawAmount"
                min="1"
                placeholder="Mfano 10000"
            />


            <label>
                Namba ya simu
            </label>

            <input
                type="tel"
                id="withdrawPhone"
                placeholder="07XXXXXXXX"
            />


            <label>
                Njia
            </label>

            <select
                id="withdrawMethod"
            >

                <option value="">
                    Chagua
                </option>

                <option value="MIXX BY YAS">
                    MIXX BY YAS
                </option>

                <option value="Airtel Money">
                    Airtel Money
                </option>

            </select>


            <br><br>


            <button
                onclick="tumaWithdrawal()"
            >
                📤 Tuma Ombi
            </button>


            <button
                onclick="onyeshaWallet()"
            >
                ↩️ Rudi
            </button>

        </div>

    `;

}


/* ---------------------------------------------------------
   SEND WITHDRAWAL
--------------------------------------------------------- */

async function tumaWithdrawal() {

    if (!hakikishaAmeingia()) {
        return;
    }


    const amount =
        Number(
            document
                .getElementById(
                    "withdrawAmount"
                )
                ?.value || 0
        );


    const phone =
        document
            .getElementById(
                "withdrawPhone"
            )
            ?.value
            .trim();


    const method =
        document
            .getElementById(
                "withdrawMethod"
            )
            ?.value;


    if (
        amount <= 0
    ) {

        alert(
            "❌ Weka kiasi sahihi."
        );

        return;

    }


    if (
        !simuNiSahihi(phone)
    ) {

        alert(
            "❌ Weka namba sahihi."
        );

        return;

    }


    if (!method) {

        alert(
            "❌ Chagua njia ya malipo."
        );

        return;

    }


    const wallet =
        await pataWalletYaUser();


    if (
        amount >
        wallet.balance
    ) {

        alert(
            "❌ Salio halitoshi."
        );

        return;

    }


    try {

        await db
            .collection("withdrawals")
            .add({

                userId:
                    roomrentCurrentUser.uid,

                amount:
                    amount,

                phone:
                    rekebishaSimu(
                        phone
                    ),

                method:
                    method,

                status:
                    "Inasubiri",

                createdAt:
                    firebase.firestore
                        .FieldValue
                        .serverTimestamp(),

                updatedAt:
                    firebase.firestore
                        .FieldValue
                        .serverTimestamp()

            });


        await tengenezaNotification(

            roomrentCurrentUser.uid,

            {

                title:
                    "💸 Withdrawal Imetumwa",

                message:
                    `Ombi la ${fedha(amount)} linasubiri Admin.`,

                type:
                    "withdrawal_pending"

            }

        );


        alert(
            "✅ Ombi limetumwa."
        );


        await onyeshaWallet();


    } catch (error) {

        console.error(
            error
        );

        alert(
            "❌ Imeshindikana kutuma withdrawal."
        );

    }

}


/* ---------------------------------------------------------
   USER WITHDRAWALS
--------------------------------------------------------- */

async function pataWithdrawalsZaUser() {

    if (!hakikishaAmeingia()) {
        return [];
    }


    try {

        const snapshot =
            await db
                .collection("withdrawals")
                .where(
                    "userId",
                    "==",
                    roomrentCurrentUser.uid
                )
                .get();


        const list = [];


        snapshot.forEach(doc => {

            list.push({

                id:
                    doc.id,

                ...doc.data()

            });

        });


        list.sort(
            (a, b) => {

                const aTime =
                    a.createdAt?.toMillis
                        ? a.createdAt.toMillis()
                        : 0;

                const bTime =
                    b.createdAt?.toMillis
                        ? b.createdAt.toMillis()
                        : 0;

                return bTime - aTime;

            }
        );


        return list;


    } catch (error) {

        console.error(
            error
        );

        return [];

    }

}


/* ---------------------------------------------------------
   SHOW WITHDRAWALS
--------------------------------------------------------- */

async function onyeshaWithdrawals() {

    if (!hakikishaAmeingia()) {
        return;
    }


    const list =
        await pataWithdrawalsZaUser();


    let container =
        document.getElementById(
            "withdrawalSection"
        );


    if (!container) {

        container =
            document.getElementById(
                "vyumba"
            );

    }


    if (!container) {
        return;
    }


    let html = `

        <div class="withdrawal-history">

            <h2>
                💸 Withdrawal Zangu
            </h2>

    `;


    if (
        list.length === 0
    ) {

        html += `
            <p>
                Bado hujafanya withdrawal.
            </p>
        `;

    }


    list.forEach(item => {

        html += `

            <div class="withdrawal-card">

                <p>
                    💰 Kiasi:
                    <strong>
                        ${fedha(
                            item.amount
                        )}
                    </strong>
                </p>

                <p>
                    📱 Simu:
                    ${escapeHTML(
                        item.phone
                    )}
                </p>

                <p>
                    💳 Njia:
                    ${escapeHTML(
                        item.method
                    )}
                </p>

                <p>
                    📌 Status:
                    <strong>
                        ${escapeHTML(
                            item.status
                        )}
                    </strong>
                </p>

            </div>

        `;

    });


    html += `
        </div>
    `;


    container.innerHTML =
        html;

}


/* ---------------------------------------------------------
   ADMIN WITHDRAWALS
--------------------------------------------------------- */

async function pataWithdrawalsZaAdmin() {

    if (
        !(await niAdmin())
    ) {
        return [];
    }


    try {

        const snapshot =
            await db
                .collection("withdrawals")
                .get();


        const list = [];


        snapshot.forEach(doc => {

            list.push({

                id:
                    doc.id,

                ...doc.data()

            });

        });


        list.sort(
            (a, b) => {

                const aTime =
                    a.createdAt?.toMillis
                        ? a.createdAt.toMillis()
                        : 0;

                const bTime =
                    b.createdAt?.toMillis
                        ? b.createdAt.toMillis()
                        : 0;

                return bTime - aTime;

            }
        );


        return list;


    } catch (error) {

        console.error(
            error
        );

        return [];

    }

}


/* ---------------------------------------------------------
   SHOW ADMIN WITHDRAWALS
--------------------------------------------------------- */

async function onyeshaAdminWithdrawals() {

    if (
        !(await niAdmin())
    ) {
        return;
    }


    const container =
        document.getElementById(
            "adminWithdrawals"
        );


    if (!container) {
        return;
    }


    const list =
        await pataWithdrawalsZaAdmin();


    let html = `

        <h3>
            💸 Withdrawals
        </h3>

    `;


    if (
        list.length === 0
    ) {

        html += `
            <p>
                Hakuna withdrawal.
            </p>
        `;

    }


    list.forEach(item => {

        let actions = "";


        if (
            item.status ===
            "Inasubiri"
        ) {

            actions = `

                <button
                    onclick="thibitishaWithdrawal(
                        '${item.id}'
                    )"
                >
                    ✅ Lipwa
                </button>


                <button
                    onclick="kataaWithdrawal(
                        '${item.id}'
                    )"
                >
                    ❌ Kataa
                </button>

            `;

        }


        html += `

            <div class="admin-withdrawal-card">

                <p>
                    💰 ${fedha(
                        item.amount
                    )}
                </p>

                <p>
                    📱 ${escapeHTML(
                        item.phone
                    )}
                </p>

                <p>
                    💳 ${escapeHTML(
                        item.method
                    )}
                </p>

                <p>
                    📌 ${escapeHTML(
                        item.status
                    )}
                </p>

                ${actions}

            </div>

        `;

    });


    container.innerHTML =
        html;

}


/* ---------------------------------------------------------
   CONFIRM WITHDRAWAL
--------------------------------------------------------- */

async function thibitishaWithdrawal(
    withdrawalId
) {

    if (
        !(await niAdmin())
    ) {

        alert(
            "❌ Huna ruhusa."
        );

        return;

    }


    if (
        !confirm(
            "Thibitisha withdrawal hii?"
        )
    ) {
        return;
    }


    try {

        const withdrawalRef =
            db
                .collection(
                    "withdrawals"
                )
                .doc(
                    withdrawalId
                );


        const snap =
            await withdrawalRef.get();


        if (!snap.exists) {

            alert(
                "❌ Withdrawal haijapatikana."
            );

            return;

        }


        const withdrawal =
            snap.data();


        if (
            withdrawal.status !==
            "Inasubiri"
        ) {

            alert(
                "⚠️ Withdrawal tayari imeshughulikiwa."
            );

            return;

        }


        const userRef =
            db
                .collection("users")
                .doc(
                    withdrawal.userId
                );


        const userSnap =
            await userRef.get();


        if (!userSnap.exists) {
            return;
        }


        const user =
            userSnap.data();


        const balance =
            Number(
                user.balance || 0
            );


        const amount =
            Number(
                withdrawal.amount || 0
            );


        if (
            balance < amount
        ) {

            alert(
                "❌ Salio la user halitoshi."
            );

            return;

        }


        const batch =
            db.batch();


        batch.update(

            withdrawalRef,

            {

                status:
                    "Imelipwa",

                approvedBy:
                    roomrentCurrentUser.uid,

                approvedAt:
                    firebase.firestore
                        .FieldValue
                        .serverTimestamp(),

                updatedAt:
                    firebase.firestore
                        .FieldValue
                        .serverTimestamp()

            }

        );


        batch.update(

            userRef,

            {

                balance:
                    balance - amount,

                totalWithdrawn:
                    Number(
                        user.totalWithdrawn || 0
                    ) + amount,

                updatedAt:
                    firebase.firestore
                        .FieldValue
                        .serverTimestamp()

            }

        );


        await batch.commit();


        await tengenezaNotification(

            withdrawal.userId,

            {

                title:
                    "✅ Withdrawal Imelipwa",

                message:
                    `Withdrawal ya ${fedha(amount)} imelipwa.`,

                type:
                    "withdrawal_paid"

            }

        );


        alert(
            "✅ Withdrawal imethibitishwa."
        );


        await onyeshaAdminWithdrawals();


    } catch (error) {

        console.error(
            error
        );

        alert(
            "❌ Imeshindikana."
        );

    }

}


/* ---------------------------------------------------------
   REJECT WITHDRAWAL
--------------------------------------------------------- */

async function kataaWithdrawal(
    withdrawalId
) {

    if (
        !(await niAdmin())
    ) {

        alert(
            "❌ Huna ruhusa."
        );

        return;

    }


    if (
        !confirm(
            "Kataa withdrawal hii?"
        )
    ) {
        return;
    }


    try {

        const ref =
            db
                .collection(
                    "withdrawals"
                )
                .doc(
                    withdrawalId
                );


        const snap =
            await ref.get();


        if (!snap.exists) {
            return;
        }


        const withdrawal =
            snap.data();


        await ref.update({

            status:
                "Imekataliwa",

            rejectedBy:
                roomrentCurrentUser.uid,

            rejectedAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp(),

            updatedAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp()

        });


        await tengenezaNotification(

            withdrawal.userId,

            {

                title:
                    "❌ Withdrawal Imekataliwa",

                message:
                    `Withdrawal ya ${fedha(
                        withdrawal.amount
                    )} imekataliwa.`,

                type:
                    "withdrawal_rejected"

            }

        );


        alert(
            "❌ Withdrawal imekataliwa."
        );


        await onyeshaAdminWithdrawals();


    } catch (error) {

        console.error(
            error
        );

        alert(
            "❌ Imeshindikana."
        );

    }

}


/* =========================================================
   9. REFERRAL SYSTEM
========================================================= */


/* ---------------------------------------------------------
   REFERRAL CODE
--------------------------------------------------------- */

function tengenezaReferralCode() {

    return (
        "RR" +
        Math.random()
            .toString(36)
            .substring(2, 8)
            .toUpperCase()
    );

}


/* ---------------------------------------------------------
   UNIQUE REFERRAL CODE
--------------------------------------------------------- */

async function pataReferralCodeYaUser() {

    if (!hakikishaAmeingia()) {
        return null;
    }


    try {

        const ref =
            db
                .collection("users")
                .doc(
                    roomrentCurrentUser.uid
                );


        const snap =
            await ref.get();


        if (!snap.exists) {
            return null;
        }


        const data =
            snap.data();


        if (
            data.referralCode
        ) {

            return data.referralCode;

        }


        let code =
            tengenezaReferralCode();


        let check =
            await db
                .collection("users")
                .where(
                    "referralCode",
                    "==",
                    code
                )
                .limit(1)
                .get();


        while (
            !check.empty
        ) {

            code =
                tengenezaReferralCode();


            check =
                await db
                    .collection("users")
                    .where(
                        "referralCode",
                        "==",
                        code
                    )
                    .limit(1)
                    .get();

        }


        await ref.update({

            referralCode:
                code,

            updatedAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp()

        });


        if (
            roomrentUserProfile
        ) {

            roomrentUserProfile
                .referralCode =
                code;

        }


        return code;


    } catch (error) {

        console.error(
            error
        );

        return null;

    }

}


/* ---------------------------------------------------------
   REFERRAL LINK
--------------------------------------------------------- */

async function pataReferralLinkYaUser() {

    const code =
        await pataReferralCodeYaUser();


    if (!code) {
        return null;
    }


    return (
        window.location.origin +
        window.location.pathname +
        "?ref=" +
        encodeURIComponent(code)
    );

}


/* ---------------------------------------------------------
   URL REFERRAL
--------------------------------------------------------- */

function pataReferralCodeKwenyeURL() {

    try {

        const params =
            new URLSearchParams(
                window.location.search
            );


        return params.get("ref");

    } catch (error) {

        return null;

    }

}


/* ---------------------------------------------------------
   FIND REFERRER
--------------------------------------------------------- */

async function pataUserKwaReferralCode(
    referralCode
) {

    if (!referralCode) {
        return null;
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

            uid:
                doc.id,

            ...doc.data()

        };


    } catch (error) {

        console.error(
            error
        );

        return null;

    }

}


/* ---------------------------------------------------------
   SAVE REFERRAL AT SIGNUP
--------------------------------------------------------- */

async function hifadhiReferralWakatiWaSignup(
    newUserUid,
    referralCode
) {

    if (!referralCode) {
        return null;
    }


    try {

        const referrer =
            await pataUserKwaReferralCode(
                referralCode
            );


        if (!referrer) {
            return null;
        }


        if (
            referrer.uid ===
            newUserUid
        ) {

            return null;

        }


        const updateData = {

            referredBy:
                referrer.uid,

            referredByCode:
                referralCode,

            referralLevel:
                "A"

        };


        /*
         * LEVEL B
         */

        if (
            referrer.referredBy
        ) {

            updateData.levelBReferrer =
                referrer.referredBy;

        }


        /*
         * LEVEL C
         */

        if (
            referrer.referredBy
        ) {

            const levelBSnap =
                await db
                    .collection("users")
                    .doc(
                        referrer.referredBy
                    )
                    .get();


            if (
                levelBSnap.exists
            ) {

                const levelB =
                    levelBSnap.data();


                if (
                    levelB.referredBy
                ) {

                    updateData
                        .levelCReferrer =
                        levelB.referredBy;

                }

            }

        }


        await db
            .collection("users")
            .doc(newUserUid)
            .update(
                updateData
            );


        return referrer.uid;


    } catch (error) {

        console.error(
            error
        );

        return null;

    }

}


/* ---------------------------------------------------------
   USER COMMISSION
--------------------------------------------------------- */

function pataReferralCommissionRate(
    level
) {

    if (level === "A") {
        return 0.05;
    }

    if (level === "B") {
        return 0.02;
    }

    if (level === "C") {
        return 0.01;
    }

    return 0;

}


/* ---------------------------------------------------------
   ADMIN COMMISSION
--------------------------------------------------------- */

function pataAdminReferralCommissionRate(
    level
) {

    if (level === "A") {
        return 0.20;
    }

    if (level === "B") {
        return 0.10;
    }

    if (level === "C") {
        return 0.05;
    }

    return 0;

}


/* ---------------------------------------------------------
   REFERRAL COMMISSION
--------------------------------------------------------- */

async function tengenezaReferralCommission(
    bookingId,
    userId,
    amount
) {

    try {

        /*
         * CHECK IF ALREADY CREATED
         */

        const existing =
            await db
                .collection(
                    "referralCommissions"
                )
                .where(
                    "bookingId",
                    "==",
                    bookingId
                )
                .limit(1)
                .get();


        if (
            !existing.empty
        ) {

            return;

        }


        const userSnap =
            await db
                .collection("users")
                .doc(userId)
                .get();


        if (
            !userSnap.exists
        ) {
            return;
        }


        const user =
            userSnap.data();


        const commissions = [];


        /*
         * LEVEL A
         */

        if (
            user.referredBy
        ) {

            commissions.push({

                level:
                    "A",

                receiverId:
                    user.referredBy,

                rate:
                    0.05,

                amount:
                    Number(amount) *
                    0.05

            });

        }


        /*
         * LEVEL B
         */

        if (
            user.levelBReferrer
        ) {

            commissions.push({

                level:
                    "B",

                receiverId:
                    user.levelBReferrer,

                rate:
                    0.02,

                amount:
                    Number(amount) *
                    0.02

            });

        }


        /*
         * LEVEL C
         */

        if (
            user.levelCReferrer
        ) {

            commissions.push({

                level:
                    "C",

                receiverId:
                    user.levelCReferrer,

                rate:
                    0.01,

                amount:
                    Number(amount) *
                    0.01

            });

        }


        /*
         * SAVE COMMISSIONS
         */

        for (
            const commission
            of commissions
        ) {

            await db
                .collection(
                    "referralCommissions"
                )
                .add({

                    bookingId:
                        bookingId,

                    sourceUserId:
                        userId,

                    receiverId:
                        commission.receiverId,

                    level:
                        commission.level,

                    rate:
                        commission.rate,

                    amount:
                        commission.amount,

                    status:
                        "Pending",

                    createdAt:
                        firebase.firestore
                            .FieldValue
                            .serverTimestamp()

                });

        }


    } catch (error) {

        console.error(
            "Referral commission error:",
            error
        );

    }

}


/* ---------------------------------------------------------
   REFERRAL DASHBOARD
--------------------------------------------------------- */

async function onyeshaReferralDashboard() {

    if (!hakikishaAmeingia()) {
        return;
    }


    const code =
        await pataReferralCodeYaUser();


    const link =
        await pataReferralLinkYaUser();


    if (!code || !link) {

        alert(
            "❌ Referral Link haijapatikana."
        );

        return;

    }


    let container =
        document.getElementById(
            "referralSection"
        );


    if (!container) {

        container =
            document.getElementById(
                "vyumba"
            );

    }


    if (!container) {
        return;
    }


    container.innerHTML = `

        <div class="referral-dashboard">

            <h2>
                🔗 Referral System
            </h2>


            <p>
                Mwalike watu kupitia
                Referral Link yako.
            </p>


            <div>

                <p>
                    Referral Code:
                </p>

                <strong>
                    ${escapeHTML(code)}
                </strong>

            </div>


            <br>


            <div>

                <p>
                    Referral Link:
                </p>

                <input
                    type="text"
                    id="myReferralLink"
                    value="${escapeHTML(link)}"
                    readonly
                />


                <button
                    onclick="copyReferralLink()"
                >
                    📋 Copy Link
                </button>

            </div>


            <br>


            <h3>
                💰 Commission
            </h3>


            <p>
                🥇 Level A:
                <strong>
                    5%
                </strong>
            </p>


            <p>
                🥈 Level B:
                <strong>
                    2%
                </strong>
            </p>


            <p>
                🥉 Level C:
                <strong>
                    1%
                </strong>
            </p>


            <div id="referralStats">

                ⏳ Inapakia...

            </div>

        </div>

    `;


    await onyeshaReferralStats();

}


/* ---------------------------------------------------------
   COPY LINK
--------------------------------------------------------- */

async function copyReferralLink() {

    const input =
        document.getElementById(
            "myReferralLink"
        );


    if (!input) {
        return;
    }


    try {

        await navigator.clipboard
            .writeText(
                input.value
            );


        alert(
            "✅ Referral Link imenakiliwa."
        );


    } catch (error) {

        input.select();

        document.execCommand(
            "copy"
        );


        alert(
            "✅ Referral Link imenakiliwa."
        );

    }

}


/* ---------------------------------------------------------
   REFERRAL STATS
--------------------------------------------------------- */

async function onyeshaReferralStats() {

    if (!hakikishaAmeingia()) {
        return;
    }


    const container =
        document.getElementById(
            "referralStats"
        );


    if (!container) {
        return;
    }


    try {

        const snapshot =
            await db
                .collection("users")
                .where(
                    "referredBy",
                    "==",
                    roomrentCurrentUser.uid
                )
                .get();


        const levelA =
            snapshot.size;


        const commissions =
            await db
                .collection(
                    "referralCommissions"
                )
                .where(
                    "receiverId",
                    "==",
                    roomrentCurrentUser.uid
                )
                .get();


        let totalCommission = 0;


        commissions.forEach(
            doc => {

                const data =
                    doc.data();


                if (
                    data.status !==
                    "Cancelled"
                ) {

                    totalCommission +=
                        Number(
                            data.amount || 0
                        );

                }

            }
        );


        container.innerHTML = `

            <div>

                <h3>
                    👥 Level A
                </h3>

                <strong>
                    ${levelA}
                </strong>

            </div>


            <div>

                <h3>
                    💰 Commission
                </h3>

                <strong>
                    ${fedha(
                        totalCommission
                    )}
                </strong>

            </div>

        `;


    } catch (error) {

        console.error(
            error
        );


        container.innerHTML = `

            <p>
                ❌ Imeshindikana kupakia statistics.
            </p>

        `;

    }

}


/* =========================================================
   10. FINAL BUTTON INTEGRATION
========================================================= */


/* ---------------------------------------------------------
   ROOMRENT BUTTONS
--------------------------------------------------------- */

function unganishaRoomRentButtons() {

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


    const roomsBtn =
        document.getElementById(
            "angaliaVyumba"
        );


    if (bookingBtn) {

        bookingBtn.onclick =
            function() {

                onyeshaBookingZangu();

            };

    }


    if (accountBtn) {

        accountBtn.onclick =
            function() {

                funguaAccount();

            };

    }


    if (taarifaBtn) {

        taarifaBtn.onclick =
            function() {

                onyeshaTaarifa();

            };

    }


    if (roomsBtn) {

        roomsBtn.onclick =
            function() {

                onyeshaVyumba();

            };

    }


    /*
     * OPTIONAL BUTTONS
     */

    const faidaBtn =
        document.getElementById(
            "faidaBtn"
        );


    if (faidaBtn) {

        faidaBtn.onclick =
            function() {

                onyeshaDashboardFaida();

            };

    }


    const walletBtn =
        document.getElementById(
            "walletBtn"
        );


    if (walletBtn) {

        walletBtn.onclick =
            function() {

                onyeshaWallet();

            };

    }


    const referralBtn =
        document.getElementById(
            "referralBtn"
        );


    if (referralBtn) {

        referralBtn.onclick =
            function() {

                onyeshaReferralDashboard();

            };

    }


    const adminBtn =
        document.getElementById(
            "adminBtn"
        );


    if (adminBtn) {

        adminBtn.onclick =
            function() {

                funguaAdminDashboard();

            };

    }

}


/* ---------------------------------------------------------
   ADMIN BUTTON
--------------------------------------------------------- */

function unganishaAdminButton() {

    const adminBtn =
        document.getElementById(
            "adminBtn"
        );


    if (adminBtn) {

        adminBtn.onclick =
            function() {

                funguaAdminDashboard();

            };

    }

}


/* ---------------------------------------------------------
   REFERRAL BUTTON
--------------------------------------------------------- */

function unganishaReferralButton() {

    const referralBtn =
        document.getElementById(
            "referralBtn"
        );


    if (referralBtn) {

        referralBtn.onclick =
            function() {

                onyeshaReferralDashboard();

            };

    }

}


/* =========================================================
   APP START
========================================================= */

async function anzishaRoomRent() {

    const success =
        anzishaFirebase();


    if (!success) {
        return;
    }


    fuatiliaMtumiaji();


    /*
     * Bind buttons immediately
     */

    unganishaRoomRentButtons();


    /*
     * Show rooms automatically
     * if container exists
     */

    if (
        document.getElementById(
            "vyumba"
        )
    ) {

        onyeshaVyumba();

    }


    /*
     * Check referral URL
     */

    const referralCode =
        pataReferralCodeKwenyeURL();


    if (referralCode) {

        console.log(
            "Referral code imepatikana:",
            referralCode
        );

    }

}


/* =========================================================
   DOM READY
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        anzishaRoomRent();

    }
);
/* =========================================================
   ROOMRENT - NAVIGATION
   ========================================================= */

function fichaSehemuZote() {
    const sehemu = [
        "vyumba",
        "fomuKodi",
        "taarifaSection",
        "bookingZanguSection",
        "faidaSection",
        "accountSection",
        "withdrawalSection"
    ];

    sehemu.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.style.display = "none";
        }
    });
}


/* =========================
   VYUMBA
========================= */

function funguaVyumba() {
    fichaSehemuZote();

    const section = document.getElementById("vyumba");

    if (section) {
        section.style.display = "block";
        onyeshaVyumba();

        section.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }
}


/* =========================
   BOOKING ZANGU
========================= */

function funguaBookingZanguNavigation() {
    if (!mtumiajiAmeingia()) {
        alert("Tafadhali ingia kwenye account yako kwanza.");
        return;
    }

    fichaSehemuZote();

    let section = document.getElementById("bookingZanguSection");

    if (!section) {
        section = document.createElement("section");
        section.id = "bookingZanguSection";
        section.style.display = "block";

        const main = document.querySelector("main");

        if (main) {
            main.appendChild(section);
        }
    }

    section.style.display = "block";

    if (typeof onyeshaBookingZangu === "function") {
        onyeshaBookingZangu();
    }

    section.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


/* =========================
   ACCOUNT
========================= */

function funguaAccountNavigation() {
    if (!mtumiajiAmeingia()) {
        alert("Tafadhali ingia kwenye account yako kwanza.");
        return;
    }

    fichaSehemuZote();

    let section = document.getElementById("accountSection");

    if (!section) {
        section = document.createElement("section");
        section.id = "accountSection";
        section.className = "booking-card";

        const main = document.querySelector("main");

        if (main) {
            main.appendChild(section);
        }
    }

    section.style.display = "block";

    const jina = pataJinaLaUser();
    const simu = pataSimuYaUser();
    const email = roomrentCurrentUser
        ? roomrentCurrentUser.email || ""
        : "";

    section.innerHTML = `
        <h2>👤 Account Yangu</h2>

        <p><strong>Jina:</strong> ${escapeHTML(jina)}</p>

        <p><strong>Email:</strong> ${escapeHTML(email)}</p>

        <p><strong>Simu:</strong> ${escapeHTML(simu)}</p>

        <hr>

        <button onclick="onyeshaProfile()">
            👤 Taarifa za Account
        </button>

        <button onclick="tokaAccount()">
            🚪 Toka
        </button>
    `;

    section.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


/* =========================
   TAARIFA
========================= */

function funguaTaarifaNavigation() {
    if (!mtumiajiAmeingia()) {
        alert("Tafadhali ingia kwenye account yako kwanza.");
        return;
    }

    fichaSehemuZote();

    const section = document.getElementById("taarifaSection");

    if (section) {
        section.style.display = "block";

        if (typeof onyeshaTaarifa === "function") {
            onyeshaTaarifa();
        }

        section.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }
}


/* =========================
   BUTTON BINDING
========================= */

function roomrentNavigationButtons() {

    const vyumbaBtn = document.getElementById("angaliaVyumba");
    const bookingBtn = document.getElementById("bookingZangu");
    const accountBtn = document.getElementById("accountBtn");
    const taarifaBtn = document.getElementById("taarifaBtn");

    if (vyumbaBtn) {
        vyumbaBtn.onclick = funguaVyumba;
    }

    if (bookingBtn) {
        bookingBtn.onclick = funguaBookingZanguNavigation;
    }

    if (accountBtn) {
        accountBtn.onclick = funguaAccountNavigation;
    }

    if (taarifaBtn) {
        taarifaBtn.onclick = funguaTaarifaNavigation;
    }

    console.log("✅ RoomRent navigation imeunganishwa.");
}


/* =========================
   START NAVIGATION
========================= */

document.addEventListener("DOMContentLoaded", function () {
    roomrentNavigationButtons();
});
