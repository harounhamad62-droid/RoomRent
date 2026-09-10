/* =========================================================
   ROOMRENT - FIREBASE FULL SCRIPT
   SYSTEM A

   USERS:
   Level A = 5%
   Level B = 2%
   Level C = 1%

   ADMIN:
   Admin commission kwenye KILA booking iliyothibitishwa.

   WITHDRAWAL:
   Fee = 8%
========================================================= */


/* =========================================================
   1. FIREBASE IMPORTS
========================================================= */

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";

import {
    getAuth,
    RecaptchaVerifier,
    signInWithPhoneNumber,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
    getFirestore,
    collection,
    doc,
    setDoc,
    getDoc,
    addDoc,
    getDocs,
    updateDoc,
    query,
    where,
    orderBy,
    serverTimestamp,
    runTransaction
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";


/* =========================================================
   2. FIREBASE CONFIG
========================================================= */

const firebaseConfig = {

    apiKey: "AIzaSyBlLpRr_zx1ru9acHQ_qHNnZp9f6kv12yA",

    authDomain:
        "roomrent-4b63b.firebaseapp.com",

    projectId:
        "roomrent-4b63b",

    storageBucket:
        "roomrent-4b63b.firebasestorage.app",

    messagingSenderId:
        "585995801987",

    appId:
        "1:585995801987:web:04d246393e90deac6ed2b6",

    measurementId:
        "G-7NVWKMJJ17"
};


/* =========================================================
   3. INITIALIZE FIREBASE
========================================================= */

const app =
    initializeApp(firebaseConfig);

const auth =
    getAuth(app);

const db =
    getFirestore(app);


/* =========================================================
   4. ADMIN SETTINGS

   WEKA FIREBASE AUTH UID YA ADMIN HAPA

   Example:
   const ADMIN_UID = "xxxxxxxxxxxxx";
========================================================= */

const ADMIN_UID = "WEKA_ADMIN_UID_HAPA";


/* =========================================================
   5. SYSTEM SETTINGS
========================================================= */

const USER_COMMISSION = {

    A: 5,
    B: 2,
    C: 1

};


/*
   SYSTEM A

   Admin anapata commission kwenye
   kila booking iliyothibitishwa.
*/

const ADMIN_COMMISSION_PERCENT = 20;


/*
   WITHDRAWAL FEE
*/

const WITHDRAWAL_FEE_PERCENT = 8;


/*
   ADMIN REFERRAL
*/

const ADMIN_REFERRAL_CODE =
    "RRADMIN";


const ADMIN_REFERRAL_NAME =
    "RoomRent Admin";


/* =========================================================
   6. PAYMENT SETTINGS
========================================================= */

const PAYMENT_SETTINGS = {

    airtel: {

        name:
            "HARUNA ISSA HAMAD",

        phone:
            "0667872515"

    },

    mixx: {

        name:
            "HARUNA ISSA HAMAD",

        phone:
            "0651590936"

    }

};


/* =========================================================
   7. ROOM DATA
========================================================= */

const rooms = [

    {
        number: "0023",
        price: 30000,
        profit: 1200,
        days: 40,

        description:
            "Chumba cha kuanzia kwa mfumo wa RoomRent."
    },

    {
        number: "0024",
        price: 70000,
        profit: 2800,
        days: 35,

        description:
            "Chumba chenye nafasi nzuri na mpango wa RoomRent."
    },

    {
        number: "0025",
        price: 140000,
        profit: 5600,
        days: 35,

        description:
            "Chumba cha kiwango cha kati kwa mpango wa RoomRent."
    },

    {
        number: "0026",
        price: 210000,
        profit: 8400,
        days: 35,

        description:
            "Chumba chenye mpango mzuri wa RoomRent."
    },

    {
        number: "0027",
        price: 280000,
        profit: 11200,
        days: 35,

        description:
            "Chumba cha kiwango cha juu kwa RoomRent."
    },

    {
        number: "0028",
        price: 350000,
        profit: 14000,
        days: 35,

        description:
            "Chumba chenye mpango mkubwa wa mapato."
    },

    {
        number: "0029",
        price: 420000,
        profit: 16800,
        days: 35,

        description:
            "Chumba cha kiwango cha juu zaidi."
    },

    {
        number: "0030",
        price: 490000,
        profit: 19600,
        days: 35,

        description:
            "Chumba chenye mpango mkubwa wa RoomRent."
    },

    {
        number: "0031",
        price: 560000,
        profit: 22400,
        days: 35,

        description:
            "Chumba cha kiwango cha juu."
    },

    {
        number: "0032",
        price: 630000,
        profit: 25200,
        days: 35,

        description:
            "Chumba cha juu zaidi katika orodha."
    }

];


/* =========================================================
   8. CURRENT USER
========================================================= */

let currentUser = null;

let confirmationResult = null;

let recaptchaVerifier = null;


/* =========================================================
   9. AUTH STATE
========================================================= */

onAuthStateChanged(
    auth,

    async (user) => {

        currentUser = user || null;


        if (user) {

            console.log(
                "RoomRent User UID:",
                user.uid
            );


            console.log(
                "RoomRent Phone:",
                user.phoneNumber
            );


            await ensureFirebaseUser(user);

        }

        else {

            console.log(
                "Hakuna user aliyeingia."
            );

        }

    }

);


/* =========================================================
   10. ENSURE USER
========================================================= */

async function ensureFirebaseUser(user) {

    if (!user) return;


    const userRef =
        doc(
            db,
            "users",
            user.uid
        );


    const userSnap =
        await getDoc(userRef);


    if (!userSnap.exists()) {

        await setDoc(
            userRef,

            {

                uid:
                    user.uid,

                phone:
                    user.phoneNumber || "",

                name:
                    "",

                referralCode:
                    "",

                referredBy:
                    "",

                totalCommission:
                    0,

                totalWithdrawn:
                    0,

                pendingWithdrawal:
                    0,

                availableBalance:
                    0,

                createdAt:
                    serverTimestamp(),

                updatedAt:
                    serverTimestamp()

            }

        );

    }

}


/* =========================================================
   11. FORMAT MONEY
========================================================= */

function formatMoney(amount) {

    return Number(
        amount || 0
    ).toLocaleString(
        "sw-TZ"
    ) + " TSh";

}


/* =========================================================
   12. FORMAT DATE
========================================================= */

function formatDate(date) {

    if (!date) {

        return "-";

    }


    try {

        if (
            date.seconds
        ) {

            return new Date(
                date.seconds * 1000
            ).toLocaleString(
                "sw-TZ"
            );

        }


        return new Date(
            date
        ).toLocaleString(
            "sw-TZ"
        );

    }

    catch {

        return "-";

    }

}


/* =========================================================
   13. PHONE FORMAT
========================================================= */

function formatTanzaniaPhone(phone) {

    phone =
        String(
            phone || ""
        )
        .trim()
        .replace(
            /\s+/g,
            ""
        );


    if (
        phone.startsWith("+255")
    ) {

        return phone;

    }


    if (
        phone.startsWith("255")
    ) {

        return "+" + phone;

    }


    if (
        phone.startsWith("0")
    ) {

        return (
            "+255" +
            phone.substring(1)
        );

    }


    return (
        "+255" + phone
    );

}


/* =========================================================
   14. LOGIN MESSAGE
========================================================= */

function showLoginMessage(message) {

    const element =
        document.getElementById(
            "loginMessage"
        );


    if (element) {

        element.textContent =
            message;

    }

}


/* =========================================================
   15. SETUP RECAPTCHA
========================================================= */

async function setupRecaptcha() {

    if (
        recaptchaVerifier
    ) {

        return;

    }


    const container =
        document.getElementById(
            "recaptcha-container"
        );


    if (!container) {

        throw new Error(
            "recaptcha-container haipo kwenye HTML."
        );

    }


    recaptchaVerifier =
        new RecaptchaVerifier(

            auth,

            "recaptcha-container",

            {

                size:
                    "normal"

            }

        );


    await recaptchaVerifier.render();

}


/* =========================================================
   16. SEND OTP
========================================================= */

async function tumaOTP() {

    try {

        const phoneInput =
            document.getElementById(
                "loginPhone"
            );


        if (!phoneInput) {

            showLoginMessage(
                "⚠️ Sehemu ya namba ya simu haijapatikana."
            );

            return;

        }


        const phone =
            formatTanzaniaPhone(
                phoneInput.value
            );


        if (
            phone.length < 12
        ) {

            showLoginMessage(
                "⚠️ Ingiza namba sahihi."
            );

            return;

        }


        await setupRecaptcha();


        showLoginMessage(
            "⏳ Inatuma OTP..."
        );


        confirmationResult =
            await signInWithPhoneNumber(

                auth,

                phone,

                recaptchaVerifier

            );


        const otpSection =
            document.getElementById(
                "otpSection"
            );


        if (otpSection) {

            otpSection.style.display =
                "block";

        }


        showLoginMessage(
            "✅ OTP imetumwa kwenye simu yako."
        );

    }

    catch (error) {

        console.error(error);


        showLoginMessage(
            "❌ Imeshindikana kutuma OTP: " +
            error.message
        );


        if (recaptchaVerifier) {

            recaptchaVerifier.clear();

            recaptchaVerifier =
                null;

        }

    }

}


/* =========================================================
   17. VERIFY OTP
========================================================= */

async function thibitishaOTP() {

    try {

        const otpInput =
            document.getElementById(
                "otpCode"
            );


        const code =
            otpInput
                ?.value
                .trim();


        if (
            !confirmationResult
        ) {

            showLoginMessage(
                "⚠️ Tafadhali tuma OTP kwanza."
            );

            return;

        }


        if (!code) {

            showLoginMessage(
                "⚠️ Ingiza OTP."
            );

            return;

        }


        showLoginMessage(
            "⏳ Inathibitisha..."
        );


        const result =
            await confirmationResult.confirm(
                code
            );


        currentUser =
            result.user;


        await ensureFirebaseUser(
            result.user
        );


        const phoneSection =
            document.getElementById(
                "phoneLoginSection"
            );


        if (phoneSection) {

            phoneSection.style.display =
                "none";

        }


        showLoginMessage(
            "✅ Umefanikiwa kuingia RoomRent!"
        );


        alert(
            "🎉 Karibu RoomRent!"
        );

    }

    catch (error) {

        console.error(error);


        showLoginMessage(
            "❌ OTP sio sahihi au muda wake umeisha."
        );

    }

}


/* =========================================================
   18. CHECK LOGIN
========================================================= */

function requireLogin() {

    if (!currentUser) {

        alert(
            "⚠️ Tafadhali ingia kwa namba yako ya simu kwanza."
        );

        const section =
            document.getElementById(
                "phoneLoginSection"
            );


        if (section) {

            section.style.display =
                "block";

            section.scrollIntoView({

                behavior:
                    "smooth"

            });

        }

        return false;

    }


    return true;

}


/* =========================================================
   19. GET CURRENT USER DATA
========================================================= */

async function getCurrentUserData() {

    if (!currentUser) {

        return null;

    }


    const snap =
        await getDoc(

            doc(
                db,
                "users",
                currentUser.uid
            )

        );


    if (!snap.exists()) {

        return null;

    }


    return {

        id:
            snap.id,

        ...snap.data()

    };

}


/* =========================================================
   20. GENERATE REFERRAL CODE
========================================================= */

function generateReferralCode(name) {

    let cleanName =
        String(
            name || "USER"
        )
        .replace(
            /[^a-zA-Z]/g,
            ""
        )
        .toUpperCase()
        .substring(
            0,
            5
        );


    if (!cleanName) {

        cleanName =
            "USER";

    }


    const random =
        Math.floor(
            1000 +
            Math.random() * 9000
        );


    return (
        cleanName +
        random
    );

}


/* =========================================================
   21. FIND USER BY REFERRAL CODE
========================================================= */

async function findUserByReferralCode(code) {

    if (!code) {

        return null;

    }


    code =
        String(code)
        .trim()
        .toUpperCase();


    if (
        code ===
        ADMIN_REFERRAL_CODE
    ) {

        return {

            id:
                "ADMIN",

            uid:
                "ADMIN",

            name:
                ADMIN_REFERRAL_NAME,

            referralCode:
                ADMIN_REFERRAL_CODE,

            isAdmin:
                true

        };

    }


    const usersQuery =
        query(

            collection(
                db,
                "users"
            ),

            where(
                "referralCode",
                "==",
                code
            )

        );


    const result =
        await getDocs(
            usersQuery
        );


    if (
        result.empty
    ) {

        return null;

    }


    const first =
        result.docs[0];


    return {

        id:
            first.id,

        ...first.data()

    };

}


/* =========================================================
   22. GET USER BY UID
========================================================= */

async function getUserByUid(uid) {

    const snap =
        await getDoc(

            doc(
                db,
                "users",
                uid
            )

        );


    if (
        !snap.exists()
    ) {

        return null;

    }


    return {

        id:
            snap.id,

        ...snap.data()

    };

}


/* =========================================================
   23. DISPLAY ROOMS
========================================================= */

function onyeshaVyumba() {

    const container =
        document.getElementById(
            "vyumba"
        );


    if (!container) {

        return;

    }


    container.innerHTML = `

        <h2>🏠 Vyumba vya RoomRent</h2>

        <p>
            Chagua chumba unachotaka.
        </p>

        <div id="roomList"></div>

    `;


    const roomList =
        document.getElementById(
            "roomList"
        );


    rooms.forEach(
        room => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "chumba room-card";


            card.innerHTML = `

                <div class="room-info">

                    <h3>
                        🏠 Chumba ${room.number}
                    </h3>

                    <p>
                        ${room.description}
                    </p>

                    <p>
                        <strong>
                            Bei:
                        </strong>

                        ${formatMoney(room.price)}
                    </p>

                    <p>
                        <strong>
                            Faida kwa siku:
                        </strong>

                        ${formatMoney(room.profit)}
                    </p>

                    <p>
                        <strong>
                            Muda:
                        </strong>

                        ${room.days} siku
                    </p>

                    <button
                        class="kodiBtn"
                        onclick="funguaKodi('${room.number}')"
                    >

                        🏠 Kodi Chumba

                    </button>

                </div>

            `;


            roomList.appendChild(
                card
            );

        }

    );

}


/* =========================================================
   24. OPEN BOOKING FORM
========================================================= */

async function funguaKodi(roomNumber) {

    const room =
        rooms.find(

            r =>
                r.number ===
                roomNumber

        );


    if (!room) {

        return;

    }


    const section =
        document.getElementById(
            "fomuKodi"
        );


    if (!section) {

        return;

    }


    let userName =
        "";

    let referral =
        "";


    if (currentUser) {

        const user =
            await getCurrentUserData();


        if (user) {

            userName =
                user.name || "";

            referral =
                user.referredBy || "";

        }

    }


    section.style.display =
        "block";


    section.innerHTML = `

        <h2>
            🏠 Kukodi Chumba ${room.number}
        </h2>

        <div class="booking-card">

            <p>
                💰 Bei:

                <strong>
                    ${formatMoney(room.price)}
                </strong>
            </p>

            <p>
                📈 Faida kwa siku:

                <strong>
                    ${formatMoney(room.profit)}
                </strong>
            </p>

            <p>
                📅 Muda:

                <strong>
                    ${room.days} siku
                </strong>
            </p>

        </div>


        <input
            type="text"
            id="bookingName"
            placeholder="Jina lako kamili"
            value="${userName}"
        >


        <input
            type="text"
            id="referralCode"
            placeholder="Referral Code (si lazima)"
            value="${referral}"
        >


        <select id="paymentMethod">

            <option value="">
                Chagua njia ya malipo
            </option>

            <option value="Airtel Money">
                🔴 Airtel Money
            </option>

            <option value="MIXX BY YAS">
                🔵 MIXX BY YAS
            </option>

        </select>


        <button
            class="endeleaBtn"
            onclick="tengenezaBooking('${room.number}')"
        >

            💳 Endelea Kulipa

        </button>

    `;


    section.scrollIntoView({

        behavior:
            "smooth"

    });

}


/* =========================================================
   25. CREATE BOOKING
========================================================= */

async function tengenezaBooking(roomNumber) {

    try {

        if (!requireLogin()) {

            return;

        }


        const room =
            rooms.find(

                r =>
                    r.number ===
                    roomNumber

            );


        if (!room) {

            return;

        }


        const name =
            document
            .getElementById(
                "bookingName"
            )
            ?.value
            .trim();


        const referralCode =
            document
            .getElementById(
                "referralCode"
            )
            ?.value
            .trim()
            .toUpperCase();


        const paymentMethod =
            document
            .getElementById(
                "paymentMethod"
            )
            ?.value;


        if (
            !name ||
            !paymentMethod
        ) {

            alert(
                "⚠️ Tafadhali jaza taarifa zote."
            );

            return;

        }


        const userRef =
            doc(
                db,
                "users",
                currentUser.uid
            );


        const userSnap =
            await getDoc(
                userRef
            );


        let userData =
            userSnap.data();


        /*
           FIRST TIME PROFILE
        */

        if (
            !userData.name
        ) {

            let myReferralCode =
                generateReferralCode(
                    name
                );


            /*
               Hakikisha referral code
               haitumiki
            */

            let codeExists =
                await findUserByReferralCode(
                    myReferralCode
                );


            while (
                codeExists
            ) {

                myReferralCode =
                    generateReferralCode(
                        name
                    );


                codeExists =
                    await findUserByReferralCode(
                        myReferralCode
                    );

            }


            let referredBy =
                "";


            if (
                referralCode
            ) {

                const referrer =
                    await findUserByReferralCode(
                        referralCode
                    );


                if (!referrer) {

                    alert(
                        "⚠️ Referral Code sio sahihi."
                    );

                    return;

                }


                referredBy =
                    referrer.referralCode;

            }


            await updateDoc(

                userRef,

                {

                    name,

                    referralCode:
                        myReferralCode,

                    referredBy,

                    updatedAt:
                        serverTimestamp()

                }

            );


            userData =
                {

                    ...userData,

                    name,

                    referralCode:
                        myReferralCode,

                    referredBy

                };

        }


        /*
           USER HAWEZI KUBADILISHA
           REFERRER BAADA YA ACCOUNT
        */

        const bookingNumber =
            "RR" +
            Date.now()
            .toString()
            .slice(-10);


        const bookingRef =
            doc(

                db,

                "bookings",

                bookingNumber

            );


        const booking = {

            bookingNumber,

            userId:
                currentUser.uid,

            name:
                userData.name,

            phone:
                currentUser.phoneNumber || "",

            roomNumber,

            price:
                room.price,

            profit:
                room.profit,

            days:
                room.days,

            paymentMethod,

            userReferralCode:
                userData.referralCode,

            usedReferralCode:
                userData.referredBy || "",

            paymentStatus:
                "Waiting Payment",

            status:
                "Pending Payment",

            transactionNumber:
                "",

            receiverName:
                "",

            receiverPhone:
                "",

            commissionProcessed:
                false,

            createdAt:
                serverTimestamp()

        };


        await setDoc(

            bookingRef,

            booking

        );


        await addNotification(

            currentUser.uid,

            "Booking Imeundwa 🏠",

            `Booking ${bookingNumber} ya chumba ${roomNumber} imeundwa.`

        );


        funguaPaymentRequest(
            booking
        );

    }

    catch (error) {

        console.error(error);


        alert(
            "❌ Booking imeshindikana: " +
            error.message
        );

    }

}


/* =========================================================
   26. GET PAYMENT DETAILS
========================================================= */

function getPaymentDetails(method) {

    if (
        method ===
        "Airtel Money"
    ) {

        return PAYMENT_SETTINGS.airtel;

    }


    if (
        method ===
        "MIXX BY YAS"
    ) {

        return PAYMENT_SETTINGS.mixx;

    }


    return null;

}


/* =========================================================
   27. PAYMENT PAGE
========================================================= */

function funguaPaymentRequest(booking) {

    const section =
        document.getElementById(
            "fomuKodi"
        );


    if (!section) {

        return;

    }


    const details =
        getPaymentDetails(
            booking.paymentMethod
        );


    if (!details) {

        return;

    }


    section.innerHTML = `

        <h2>
            💳 Lipa RoomRent
        </h2>


        <div class="booking-card">

            <p>
                📋 Booking Number:

                <strong>
                    ${booking.bookingNumber}
                </strong>
            </p>


            <p>
                🏠 Chumba:

                <strong>
                    ${booking.roomNumber}
                </strong>
            </p>


            <p>
                💰 Kiasi:

                <strong>
                    ${formatMoney(booking.price)}
                </strong>
            </p>

        </div>


        <div class="booking-card">

            <h3>
                📱 ${booking.paymentMethod}
            </h3>


            <p>
                👤 Mpokeaji:

                <strong>
                    ${details.name}
                </strong>
            </p>


            <p>
                📱 Namba ya kulipia:
            </p>


            <h2>
                ${details.phone}
            </h2>


            <p>
                ⚠️ Hakikisha jina la mpokeaji
                kabla ya kutuma malipo.
            </p>

        </div>


        <div class="booking-card">

            <h3>
                📝 Baada ya Kulipa
            </h3>


            <input
                type="text"
                id="transactionNumber"
                placeholder="Transaction ID"
            >


            <button
                class="thibitishaBtn"
                onclick="tumaPaymentRequest('${booking.bookingNumber}')"
            >

                ✅ Nimetuma Malipo

            </button>

        </div>

    `;

}


/* =========================================================
   28. SEND PAYMENT REQUEST
========================================================= */

async function tumaPaymentRequest(
    bookingNumber
) {

    try {

        const transactionNumber =
            document
            .getElementById(
                "transactionNumber"
            )
            ?.value
            .trim();


        if (
            !transactionNumber
        ) {

            alert(
                "⚠️ Ingiza Transaction Number."
            );

            return;

        }


        const bookingRef =
            doc(

                db,

                "bookings",

                bookingNumber

            );


        const bookingSnap =
            await getDoc(
                bookingRef
            );


        if (
            !bookingSnap.exists()
        ) {

            alert(
                "Booking haijapatikana."
            );

            return;

        }


        const booking =
            bookingSnap.data();


        const paymentDetails =
            getPaymentDetails(
                booking.paymentMethod
            );


        await updateDoc(

            bookingRef,

            {

                transactionNumber,

                receiverName:
                    paymentDetails.name,

                receiverPhone:
                    paymentDetails.phone,

                paymentStatus:
                    "Waiting Confirmation",

                status:
                    "Payment Submitted",

                paymentRequestedAt:
                    serverTimestamp()

            }

        );


        await addNotification(

            booking.userId,

            "Malipo Yamepokelewa ⏳",

            `Tumepokea taarifa yako ya malipo ya ${formatMoney(booking.price)}. Admin atakagua.`

        );


        alert(
            "✅ Taarifa ya malipo imetumwa."
        );


        onyeshaBookingZangu();

    }

    catch (error) {

        console.error(error);


        alert(
            "❌ Imeshindikana kutuma malipo."
        );

    }

}


/* =========================================================
   29. ADD NOTIFICATION
========================================================= */

async function addNotification(
    userId,
    title,
    message
) {

    try {

        await addDoc(

            collection(
                db,
                "notifications"
            ),

            {

                userId,

                title,

                message,

                read:
                    false,

                createdAt:
                    serverTimestamp()

            }

        );

    }

    catch (error) {

        console.error(
            "Notification Error:",
            error
        );

    }

}


/* =========================================================
   30. MY BOOKINGS
========================================================= */

async function onyeshaBookingZangu() {

    try {

        if (!requireLogin()) {

            return;

        }


        const bookingQuery =
            query(

                collection(
                    db,
                    "bookings"
                ),

                where(
                    "userId",
                    "==",
                    currentUser.uid
                )

            );


        const result =
            await getDocs(
                bookingQuery
            );


        const bookings =
            result.docs.map(

                item => ({
                    id:
                        item.id,

                    ...item.data()
                })

            );


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

            <h2>
                📋 Booking Zangu
            </h2>


            ${

                !bookings.length

                ?

                `
                    <p>
                        Hakuna booking bado.
                    </p>
                `

                :

                bookings.map(

                    b => `

                        <div class="booking-card">

                            <h3>
                                ${b.bookingNumber}
                            </h3>


                            <p>
                                🏠 Chumba:
                                ${b.roomNumber}
                            </p>


                            <p>
                                💰
                                ${formatMoney(b.price)}
                            </p>


                            <p>
                                📌
                                ${b.status}
                            </p>


                            <p>
                                💳
                                ${b.paymentStatus}
                            </p>


                            ${

                                b.transactionNumber

                                ?

                                `
                                    <p>
                                        📝 Transaction:

                                        <strong>
                                            ${b.transactionNumber}
                                        </strong>
                                    </p>
                                `

                                :

                                ""

                            }

                        </div>

                    `

                ).join("")

            }

        `;


        section.scrollIntoView({

            behavior:
                "smooth"

        });

    }

    catch (error) {

        console.error(error);


        alert(
            "❌ Imeshindikana kupata bookings."
        );

    }

}


/* =========================================================
   31. GET REFERRAL LEVELS

   USER:
   A -> B -> C ONLY
========================================================= */

async function getReferralLevels(userData) {

    const levels = {

        A: null,
        B: null,
        C: null

    };


    if (
        !userData ||
        !userData.referredBy
    ) {

        return levels;

    }


    let currentCode =
        userData.referredBy;


    for (
        const level of
        ["A", "B", "C"]
    ) {

        const referrer =
            await findUserByReferralCode(
                currentCode
            );


        if (
            !referrer ||
            referrer.isAdmin
        ) {

            break;

        }


        levels[level] =
            referrer;


        currentCode =
            referrer.referredBy || "";


        if (!currentCode) {

            break;

        }

    }


    return levels;

}


/* =========================================================
   32. PROCESS COMMISSIONS

   SYSTEM A:

   USER:
   A = 5%
   B = 2%
   C = 1%

   ADMIN:
   KILA BOOKING = ADMIN COMMISSION
========================================================= */

async function processBookingCommissions(
    bookingNumber
) {

    const bookingRef =
        doc(
            db,
            "bookings",
            bookingNumber
        );


    await runTransaction(

        db,

        async transaction => {

            const bookingSnap =
                await transaction.get(
                    bookingRef
                );


            if (
                !bookingSnap.exists()
            ) {

                throw new Error(
                    "Booking haipo."
                );

            }


            const booking =
                bookingSnap.data();


            if (
                booking.commissionProcessed
            ) {

                return;

            }


            /*
               USER DATA
            */

            const userRef =
                doc(
                    db,
                    "users",
                    booking.userId
                );


            const userSnap =
                await transaction.get(
                    userRef
                );


            if (
                !userSnap.exists()
            ) {

                throw new Error(
                    "User haipo."
                );

            }


            /*
               MARK FIRST
               TO PREVENT DOUBLE COMMISSION
            */

            transaction.update(

                bookingRef,

                {

                    commissionProcessed:
                        true,

                    commissionProcessedAt:
                        serverTimestamp()

                }

            );

        }

    );


    /*
       GET BOOKING AFTER LOCK
    */

    const bookingSnap =
        await getDoc(
            bookingRef
        );


    const booking =
        bookingSnap.data();


    const userData =
        await getUserByUid(
            booking.userId
        );


    if (!userData) {

        return;

    }


    /*
       USER LEVELS
    */

    const levels =
        await getReferralLevels(
            userData
        );


    for (
        const level of
        ["A", "B", "C"]
    ) {

        const referrer =
            levels[level];


        if (!referrer) {

            continue;

        }


        const percent =
            USER_COMMISSION[level];


        const amount =
            Number(
                booking.price
            )
            *
            percent
            /
            100;


        const commissionRef =
            doc(
                collection(
                    db,
                    "commissions"
                )
            );


        await setDoc(

            commissionRef,

            {

                bookingNumber,

                userId:
                    referrer.id,

                phone:
                    referrer.phone || "",

                userName:
                    referrer.name || "",

                level,

                percent,

                amount,

                type:
                    "User Commission",

                createdAt:
                    serverTimestamp()

            }

        );


        /*
           UPDATE BALANCE
        */

        const targetRef =
            doc(
                db,
                "users",
                referrer.id
            );


        await runTransaction(

            db,

            async transaction => {

                const snap =
                    await transaction.get(
                        targetRef
                    );


                if (!snap.exists()) {

                    return;

                }


                const data =
                    snap.data();


                const totalCommission =
                    Number(
                        data.totalCommission || 0
                    )
                    +
                    amount;


                const availableBalance =
                    Number(
                        data.availableBalance || 0
                    )
                    +
                    amount;


                transaction.update(

                    targetRef,

                    {

                        totalCommission,

                        availableBalance,

                        updatedAt:
                            serverTimestamp()

                    }

                );

            }

        );


        await addNotification(

            referrer.id,

            "Commission Mpya 💰",

            `Umepata ${percent}% commission ya ${formatMoney(amount)} kwenye Level ${level}.`

        );

    }


    /*
       ADMIN COMMISSION

       SYSTEM A:
       KILA BOOKING
    */

    const adminAmount =
        Number(
            booking.price
        )
        *
        ADMIN_COMMISSION_PERCENT
        /
        100;


    await addDoc(

        collection(
            db,
            "adminCommissions"
        ),

        {

            bookingNumber,

            bookingUserId:
                booking.userId,

            bookingUserName:
                booking.name,

            percent:
                ADMIN_COMMISSION_PERCENT,

            amount:
                adminAmount,

            type:
                "System A Admin Commission",

            createdAt:
                serverTimestamp()

        }

    );

}


/* =========================================================
   33. ACCOUNT
========================================================= */

async function funguaAccount() {

    try {

        if (!requireLogin()) {

            return;

        }


        const user =
            await getCurrentUserData();


        if (!user) {

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


        const totalCommission =
            Number(
                user.totalCommission || 0
            );


        const totalWithdrawn =
            Number(
                user.totalWithdrawn || 0
            );


        const pendingWithdrawal =
            Number(
                user.pendingWithdrawal || 0
            );


        const availableBalance =
            Number(
                user.availableBalance || 0
            );


        /*
           SALIO LOTE

           Commission total -
           withdrawn

           Pending inaweza kuwa sehemu
           iliyokwishawekwa kwenye request.
        */

        const totalBalance =
            availableBalance +
            pendingWithdrawal;


        section.innerHTML = `

            <h2>
                👤 Account Yangu
            </h2>


            <div class="booking-card">

                <p>
                    👤 Jina:

                    <strong>
                        ${user.name || "Bado hujaweka jina"}
                    </strong>
                </p>


                <p>
                    📱 Namba:

                    ${user.phone || currentUser.phoneNumber || "-"}
                </p>


                <p>
                    🔑 Referral Code:

                    <strong>
                        ${user.referralCode || "-"}
                    </strong>
                </p>


                <hr>


                <h3>
                    🏦 Salio Lako
                </h3>


                <p>
                    💰 Jumla ya Commission:

                    <strong>
                        ${formatMoney(totalCommission)}
                    </strong>
                </p>


                <p>
                    🏦 Salio Lote:

                    <strong>
                        ${formatMoney(totalBalance)}
                    </strong>
                </p>


                <p>
                    💳 Salio Linaloweza Kuwithdraw:

                    <strong>
                        ${formatMoney(availableBalance)}
                    </strong>
                </p>


                <p>
                    ⏳ Withdrawal Inayosubiri:

                    <strong>
                        ${formatMoney(pendingWithdrawal)}
                    </strong>
                </p>


                <p>
                    💸 Jumla Iliyowahi Kuwithdraw:

                    <strong>
                        ${formatMoney(totalWithdrawn)}
                    </strong>
                </p>


                <hr>


                <button
                    class="thibitishaBtn"
                    onclick="funguaWithdrawal()"
                >

                    💸 Withdrawal

                </button>


                <button
                    class="endeleaBtn"
                    onclick="onyeshaMyReferral()"
                >

                    🤝 Referral Zangu

                </button>


                <button
                    class="endeleaBtn"
                    onclick="onyeshaMyCommissions()"
                >

                    💰 Commission Zangu

                </button>


                <button
                    class="endeleaBtn"
                    onclick="onyeshaWithdrawalHistory()"
                >

                    📜 Withdrawal History

                </button>


                <button
                    class="endeleaBtn"
                    onclick="onyeshaNotifications()"
                >

                    🔔 Taarifa Zangu

                </button>

            </div>

        `;


        section.scrollIntoView({

            behavior:
                "smooth"

        });

    }

    catch (error) {

        console.error(error);


        alert(
            "❌ Imeshindikana kufungua account."
        );

    }

}


/* =========================================================
   34. MY REFERRALS
========================================================= */

async function onyeshaMyReferral() {

    if (!requireLogin()) {

        return;

    }


    const user =
        await getCurrentUserData();


    if (!user) {

        return;

    }


    const usersSnap =
        await getDocs(

            collection(
                db,
                "users"
            )

        );


    const users =
        usersSnap.docs.map(

            item => ({

                id:
                    item.id,

                ...item.data()

            })

        );


    const levelA =
        users.filter(

            u =>
                u.referredBy ===
                user.referralCode

        );


    const levelB = [];

    const levelC = [];


    levelA.forEach(

        userA => {

            const children =
                users.filter(

                    u =>
                        u.referredBy ===
                        userA.referralCode

                );


            levelB.push(
                ...children
            );


            children.forEach(

                userB => {

                    const grandchildren =
                        users.filter(

                            u =>
                                u.referredBy ===
                                userB.referralCode

                        );


                    levelC.push(
                        ...grandchildren
                    );

                }

            );

        }

    );


    const section =
        document.getElementById(
            "taarifaSection"
        );


    section.innerHTML = `

        <h2>
            🤝 Referral Zangu
        </h2>


        <button
            class="endeleaBtn"
            onclick="funguaAccount()"
        >

            ⬅️ Rudi Account

        </button>


        <div class="booking-card">

            <p>
                🔑 Referral Code:

                <strong>
                    ${user.referralCode}
                </strong>
            </p>


            <p>
                🅰️ Level A:
                ${levelA.length}
            </p>


            <p>
                🅱️ Level B:
                ${levelB.length}
            </p>


            <p>
                🅲 Level C:
                ${levelC.length}
            </p>

        </div>


        <h3>
            🅰️ Level A
        </h3>

        ${

            levelA.length

            ?

            levelA.map(

                u => `

                    <div class="booking-card">

                        👤 ${u.name || "-"}

                        <br>

                        📱 ${u.phone || "-"}

                    </div>

                `

            ).join("")

            :

            "<p>Hakuna referral Level A bado.</p>"

        }


        <h3>
            🅱️ Level B
        </h3>

        ${

            levelB.length

            ?

            levelB.map(

                u => `

                    <div class="booking-card">

                        👤 ${u.name || "-"}

                        <br>

                        📱 ${u.phone || "-"}

                    </div>

                `

            ).join("")

            :

            "<p>Hakuna referral Level B bado.</p>"

        }


        <h3>
            🅲 Level C
        </h3>

        ${

            levelC.length

            ?

            levelC.map(

                u => `

                    <div class="booking-card">

                        👤 ${u.name || "-"}

                        <br>

                        📱 ${u.phone || "-"}

                    </div>

                `

            ).join("")

            :

            "<p>Hakuna referral Level C bado.</p>"

        }

    `;

}


/* =========================================================
   35. MY COMMISSIONS
========================================================= */

async function onyeshaMyCommissions() {

    if (!requireLogin()) {

        return;

    }


    const result =
        await getDocs(

            query(

                collection(
                    db,
                    "commissions"
                ),

                where(
                    "userId",
                    "==",
                    currentUser.uid
                )

            )

        );


    const commissions =
        result.docs.map(

            item => ({

                id:
                    item.id,

                ...item.data()

            })

        );


    const total =
        commissions.reduce(

            (sum, c) =>

                sum +
                Number(
                    c.amount || 0
                ),

            0

        );


    const section =
        document.getElementById(
            "taarifaSection"
        );


    section.innerHTML = `

        <h2>
            💰 Commission Zangu
        </h2>


        <button
            class="endeleaBtn"
            onclick="funguaAccount()"
        >

            ⬅️ Rudi Account

        </button>


        <div class="booking-card">

            <h3>
                💰 Jumla:

                ${formatMoney(total)}
            </h3>

        </div>


        ${

            !commissions.length

            ?

            "<p>Bado hujapata commission.</p>"

            :

            commissions.map(

                c => `

                    <div class="booking-card">

                        <p>
                            🅰️🅱️🅲 Level:

                            <strong>
                                ${c.level}
                            </strong>
                        </p>


                        <p>
                            📊 Asilimia:

                            ${c.percent}%
                        </p>


                        <p>
                            💰 Commission:

                            <strong>
                                ${formatMoney(c.amount)}
                            </strong>
                        </p>


                        <p>
                            📋 Booking:

                            ${c.bookingNumber}
                        </p>


                        <p>
                            📅

                            ${formatDate(c.createdAt)}
                        </p>

                    </div>

                `

            ).join("")

        }

    `;

}


/* =========================================================
   36. OPEN WITHDRAWAL
========================================================= */

async function funguaWithdrawal() {

    if (!requireLogin()) {

        return;

    }


    const user =
        await getCurrentUserData();


    const balance =
        Number(
            user.availableBalance || 0
        );


    const section =
        document.getElementById(
            "taarifaSection"
        );


    section.innerHTML = `

        <h2>
            💸 Withdrawal
        </h2>


        <button
            class="endeleaBtn"
            onclick="funguaAccount()"
        >

            ⬅️ Rudi Account

        </button>


        <div class="booking-card">

            <h3>
                🏦 Salio Linaloweza Kuwithdraw
            </h3>


            <h2>
                ${formatMoney(balance)}
            </h2>

        </div>


        <div class="booking-card">

            <h3>
                💸 Omba Withdrawal
            </h3>


            <p>
                ⚠️ Kila withdrawal ina
                makato ya 8%.
            </p>


            <input
                type="number"
                id="withdrawAmount"
                placeholder="Kiasi unachotaka kuwithdraw"
                oninput="hesabuWithdrawal()"
            >


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


            <input
                type="text"
                id="withdrawPhone"
                placeholder="Namba ya kupokea pesa"
            >


            <div id="withdrawPreview">

                <p>
                    💰 Ingiza kiasi kuona
                    makato na kiasi cha kupokea.
                </p>

            </div>


            <button
                class="thibitishaBtn"
                onclick="ombaWithdrawal()"
            >

                💸 Tuma Withdrawal Request

            </button>

        </div>

    `;

}


/* =========================================================
   37. CALCULATE WITHDRAWAL
========================================================= */

async function hesabuWithdrawal() {

    const amount =
        Number(

            document
            .getElementById(
                "withdrawAmount"
            )
            ?.value || 0

        );


    const fee =
        amount *
        WITHDRAWAL_FEE_PERCENT
        /
        100;


    const receive =
        amount -
        fee;


    const preview =
        document.getElementById(
            "withdrawPreview"
        );


    if (!preview) {

        return;

    }


    preview.innerHTML = `

        <div class="booking-card">

            <p>
                💰 Withdrawal:

                <strong>
                    ${formatMoney(amount)}
                </strong>
            </p>


            <p>
                ➖ Makato ${WITHDRAWAL_FEE_PERCENT}%:

                <strong>
                    ${formatMoney(fee)}
                </strong>
            </p>


            <hr>


            <p>
                ✅ Utapokea:

                <strong>
                    ${formatMoney(receive)}
                </strong>
            </p>

        </div>

    `;

}


/* =========================================================
   38. REQUEST WITHDRAWAL
========================================================= */

async function ombaWithdrawal() {

    try {

        if (!requireLogin()) {

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


        const method =
            document
            .getElementById(
                "withdrawMethod"
            )
            ?.value;


        const phone =
            document
            .getElementById(
                "withdrawPhone"
            )
            ?.value
            .trim();


        if (
            amount <= 0 ||
            !method ||
            !phone
        ) {

            alert(
                "⚠️ Tafadhali jaza taarifa zote."
            );

            return;

        }


        const userRef =
            doc(
                db,
                "users",
                currentUser.uid
            );


        const fee =
            amount *
            WITHDRAWAL_FEE_PERCENT
            /
            100;


        const receiveAmount =
            amount -
            fee;


        const withdrawalRef =
            doc(
                collection(
                    db,
                    "withdrawals"
                )
            );


        await runTransaction(

            db,

            async transaction => {

                const userSnap =
                    await transaction.get(
                        userRef
                    );


                if (
                    !userSnap.exists()
                ) {

                    throw new Error(
                        "User haipo."
                    );

                }


                const user =
                    userSnap.data();


                const balance =
                    Number(
                        user.availableBalance || 0
                    );


                if (
                    amount > balance
                ) {

                    throw new Error(
                        "Salio lako halitoshi."
                    );

                }


                /*
                   ONDOA KWENYE AVAILABLE

                   WEKA PENDING
                */

                transaction.update(

                    userRef,

                    {

                        availableBalance:
                            balance - amount,

                        pendingWithdrawal:

                            Number(
                                user.pendingWithdrawal || 0
                            )
                            +
                            amount,

                        updatedAt:
                            serverTimestamp()

                    }

                );


                transaction.set(

                    withdrawalRef,

                    {

                        withdrawalId:
                            withdrawalRef.id,

                        userId:
                            currentUser.uid,

                        userName:
                            user.name || "",

                        userPhone:
                            currentUser.phoneNumber || "",

                        amount,

                        fee,

                        feePercent:
                            WITHDRAWAL_FEE_PERCENT,

                        receiveAmount,

                        method,

                        phone,

                        status:
                            "Pending",

                        createdAt:
                            serverTimestamp()

                    }

                );

            }

        );


        await addNotification(

            currentUser.uid,

            "Withdrawal Request 💸",

            `Withdrawal ya ${formatMoney(amount)} imetumwa. Utapokea ${formatMoney(receiveAmount)} baada ya makato ya 8%.`

        );


        alert(
            `✅ Withdrawal request imetumwa.\n\nUtapokea: ${formatMoney(receiveAmount)}`
        );


        funguaAccount();

    }

    catch (error) {

        console.error(error);


        alert(
            "❌ " + error.message
        );

    }

}


/* =========================================================
   39. WITHDRAWAL HISTORY
========================================================= */

async function onyeshaWithdrawalHistory() {

    if (!requireLogin()) {

        return;

    }


    const result =
        await getDocs(

            query(

                collection(
                    db,
                    "withdrawals"
                ),

                where(
                    "userId",
                    "==",
                    currentUser.uid
                )

            )

        );


    const withdrawals =
        result.docs.map(

            item => ({

                id:
                    item.id,

                ...item.data()

            })

        );


    const section =
        document.getElementById(
            "taarifaSection"
        );


    section.innerHTML = `

        <h2>
            📜 Withdrawal History
        </h2>


        <button
            class="endeleaBtn"
            onclick="funguaAccount()"
        >

            ⬅️ Rudi Account

        </button>


        ${

            !withdrawals.length

            ?

            "<p>Hakuna withdrawal bado.</p>"

            :

            withdrawals.map(

                w => `

                    <div class="booking-card">

                        <p>
                            💰 Withdrawal:

                            <strong>
                                ${formatMoney(w.amount)}
                            </strong>
                        </p>


                        <p>
                            ➖ Makato:

                            ${formatMoney(w.fee)}
                        </p>


                        <p>
                            ✅ Utapokea:

                            <strong>
                                ${formatMoney(w.receiveAmount)}
                            </strong>
                        </p>


                        <p>
                            📱 ${w.method}
                        </p>


                        <p>
                            📌 Status:

                            <strong>
                                ${w.status}
                            </strong>
                        </p>


                        <p>
                            📅

                            ${formatDate(w.createdAt)}
                        </p>

                    </div>

                `

            ).join("")

        }

    `;

}


/* =========================================================
   40. NOTIFICATIONS
========================================================= */

async function funguaTaarifa() {

    if (!requireLogin()) {

        return;

    }


    onyeshaNotifications();

}


async function onyeshaNotifications() {

    if (!requireLogin()) {

        return;

    }


    const result =
        await getDocs(

            query(

                collection(
                    db,
                    "notifications"
                ),

                where(
                    "userId",
                    "==",
                    currentUser.uid
                )

            )

        );


    const notifications =
        result.docs.map(

            item => ({

                id:
                    item.id,

                ...item.data()

            })

        );


    const section =
        document.getElementById(
            "taarifaSection"
        );


    section.style.display =
        "block";


    section.innerHTML = `

        <h2>
            🔔 Taarifa Zangu
        </h2>


        ${

            !notifications.length

            ?

            "<p>Hakuna taarifa bado.</p>"

            :

            notifications.map(

                n => `

                    <div class="booking-card">

                        <h3>
                            ${n.title}
                        </h3>


                        <p>
                            ${n.message}
                        </p>


                        <small>
                            ${formatDate(n.createdAt)}
                        </small>

                    </div>

                `

            ).join("")

        }

    `;

}


/* =========================================================
   41. CHECK ADMIN
========================================================= */

function isAdmin() {

    return (

        currentUser &&

        currentUser.uid ===
        ADMIN_UID

    );

}


/* =========================================================
   42. ADMIN LOGIN
========================================================= */

function funguaAdminLogin() {

    if (!currentUser) {

        alert(
            "⚠️ Admin lazima aingie kwa Firebase Phone OTP kwanza."
        );

        return;

    }


    if (!isAdmin()) {

        alert(
            "❌ Account hii sio Admin."
        );

        return;

    }


    funguaAdmin();

}


/* =========================================================
   43. ADMIN DASHBOARD
========================================================= */

async function funguaAdmin() {

    if (!isAdmin()) {

        alert(
            "❌ Huna ruhusa ya Admin."
        );

        return;

    }


    const section =
        document.getElementById(
            "taarifaSection"
        );


    section.style.display =
        "block";


    section.innerHTML = `

        <h2>
            🔐 RoomRent Admin Dashboard
        </h2>


        <div class="booking-card">

            <p>
                👑 Karibu Admin
            </p>


            <p>
                🔑 Admin Referral Code:

                <strong>
                    ${ADMIN_REFERRAL_CODE}
                </strong>
            </p>


            <button
                class="endeleaBtn"
                onclick="onyeshaAdminBookings()"
            >

                📋 Manage Bookings

            </button>


            <button
                class="endeleaBtn"
                onclick="onyeshaAdminWithdrawals()"
            >

                💸 Manage Withdrawals

            </button>


            <button
                class="endeleaBtn"
                onclick="onyeshaAdminCommissions()"
            >

                💰 Commission Management

            </button>


            <button
                class="endeleaBtn"
                onclick="onyeshaAdminReferrals()"
            >

                🤝 Manage Referrals

            </button>


            <button
                class="endeleaBtn"
                onclick="onyeshaAdminStatistics()"
            >

                📊 Statistics

            </button>


            <button
                class="thibitishaBtn"
                onclick="adminLogout()"
            >

                🚪 Logout

            </button>

        </div>

    `;

}


/* =========================================================
   44. ADMIN BOOKINGS
========================================================= */

async function onyeshaAdminBookings() {

    if (!isAdmin()) {

        return;

    }


    const result =
        await getDocs(

            collection(
                db,
                "bookings"
            )

        );


    const bookings =
        result.docs.map(

            item => ({

                id:
                    item.id,

                ...item.data()

            })

        );


    const section =
        document.getElementById(
            "taarifaSection"
        );


    section.innerHTML = `

        <h2>
            📋 Manage Bookings
        </h2>


        <button
            class="endeleaBtn"
            onclick="funguaAdmin()"
        >

            ⬅️ Rudi Admin

        </button>


        ${

            !bookings.length

            ?

            "<p>Hakuna booking bado.</p>"

            :

            bookings.map(

                b => `

                    <div class="booking-card">

                        <h3>
                            ${b.bookingNumber}
                        </h3>


                        <p>
                            👤 ${b.name}
                        </p>


                        <p>
                            📱 ${b.phone}
                        </p>


                        <p>
                            🏠 Chumba:
                            ${b.roomNumber}
                        </p>


                        <p>
                            💰
                            ${formatMoney(b.price)}
                        </p>


                        <p>
                            💳
                            ${b.paymentMethod}
                        </p>


                        <p>
                            📝 Transaction:

                            <strong>
                                ${b.transactionNumber || "-"}
                            </strong>
                        </p>


                        <p>
                            📌

                            <strong>
                                ${b.status}
                            </strong>
                        </p>


                        ${

                            b.status !==
                            "Confirmed"

                            ?

                            `

                                <button
                                    class="thibitishaBtn"
                                    onclick="adminConfirmBooking('${b.bookingNumber}')"
                                >

                                    ✅ Confirm Payment

                                </button>


                                <button
                                    class="kodiBtn"
                                    onclick="adminCancelBooking('${b.bookingNumber}')"
                                >

                                    ❌ Cancel

                                </button>

                            `

                            :

                            `
                                <p>
                                    ✅ Confirmed
                                </p>
                            `

                        }

                    </div>

                `

            ).join("")

        }

    `;

}


/* =========================================================
   45. ADMIN CONFIRM BOOKING
========================================================= */

async function adminConfirmBooking(
    bookingNumber
) {

    try {

        if (!isAdmin()) {

            return;

        }


        const bookingRef =
            doc(

                db,

                "bookings",

                bookingNumber

            );


        const bookingSnap =
            await getDoc(
                bookingRef
            );


        if (
            !bookingSnap.exists()
        ) {

            return;

        }


        const booking =
            bookingSnap.data();


        if (
            booking.status ===
            "Confirmed"
        ) {

            alert(
                "Booking tayari imethibitishwa."
            );

            return;

        }


        if (
            !booking.transactionNumber
        ) {

            const answer =
                confirm(
                    "⚠️ Transaction Number haipo. Una uhakika unataka kuthibitisha?"
                );


            if (!answer) {

                return;

            }

        }


        await updateDoc(

            bookingRef,

            {

                status:
                    "Confirmed",

                paymentStatus:
                    "Paid",

                confirmedAt:
                    serverTimestamp(),

                confirmedBy:
                    currentUser.uid

            }

        );


        /*
           PROCESS COMMISSION
        */

        await processBookingCommissions(
            bookingNumber
        );


        await addNotification(

            booking.userId,

            "Malipo Yamethibitishwa ✅",

            `Malipo ya ${formatMoney(booking.price)} yamethibitishwa.`

        );


        alert(
            "✅ Booking na commissions zimethibitishwa!"
        );


        onyeshaAdminBookings();

    }

    catch (error) {

        console.error(error);


        alert(
            "❌ " +
            error.message
        );

    }

}


/* =========================================================
   46. CANCEL BOOKING
========================================================= */

async function adminCancelBooking(
    bookingNumber
) {

    if (!isAdmin()) {

        return;

    }


    const bookingRef =
        doc(

            db,

            "bookings",

            bookingNumber

        );


    const bookingSnap =
        await getDoc(
            bookingRef
        );


    if (
        !bookingSnap.exists()
    ) {

        return;

    }


    const booking =
        bookingSnap.data();


    await updateDoc(

        bookingRef,

        {

            status:
                "Cancelled",

            paymentStatus:
                "Cancelled",

            cancelledAt:
                serverTimestamp()

        }

    );


    await addNotification(

        booking.userId,

        "Booking Imefutwa ❌",

        `Booking ${bookingNumber} imefutwa.`

    );


    onyeshaAdminBookings();

}


/* =========================================================
   47. ADMIN WITHDRAWALS
========================================================= */

async function onyeshaAdminWithdrawals() {

    if (!isAdmin()) {

        return;

    }


    const result =
        await getDocs(

            collection(
                db,
                "withdrawals"
            )

        );


    const withdrawals =
        result.docs.map(

            item => ({

                id:
                    item.id,

                ...item.data()

            })

        );


    const section =
        document.getElementById(
            "taarifaSection"
        );


    section.innerHTML = `

        <h2>
            💸 Manage Withdrawals
        </h2>


        <button
            class="endeleaBtn"
            onclick="funguaAdmin()"
        >

            ⬅️ Rudi Admin

        </button>


        ${

            !withdrawals.length

            ?

            "<p>Hakuna withdrawal bado.</p>"

            :

            withdrawals.map(

                w => `

                    <div class="booking-card">

                        <h3>
                            💸 Withdrawal
                        </h3>


                        <p>
                            👤 ${w.userName}
                        </p>


                        <p>
                            📱 ${w.userPhone}
                        </p>


                        <p>
                            💰 Requested:

                            <strong>
                                ${formatMoney(w.amount)}
                            </strong>
                        </p>


                        <p>
                            ➖ Fee ${w.feePercent}%:

                            ${formatMoney(w.fee)}
                        </p>


                        <p>
                            ✅ Receive:

                            <strong>
                                ${formatMoney(w.receiveAmount)}
                            </strong>
                        </p>


                        <p>
                            📱 ${w.method}
                        </p>


                        <p>
                            📞 ${w.phone}
                        </p>


                        <p>
                            📌 Status:

                            <strong>
                                ${w.status}
                            </strong>
                        </p>


                        ${

                            w.status ===
                            "Pending"

                            ?

                            `

                                <button
                                    class="thibitishaBtn"
                                    onclick="adminApproveWithdrawal('${w.id}')"
                                >

                                    ✅ Approve

                                </button>


                                <button
                                    class="kodiBtn"
                                    onclick="adminRejectWithdrawal('${w.id}')"
                                >

                                    ❌ Reject

                                </button>

                            `

                            :

                            ""

                        }

                    </div>

                `

            ).join("")

        }

    `;

}


/* =========================================================
   48. APPROVE WITHDRAWAL
========================================================= */

async function adminApproveWithdrawal(
    withdrawalId
) {

    try {

        if (!isAdmin()) {

            return;

        }


        const withdrawalRef =
            doc(

                db,

                "withdrawals",

                withdrawalId

            );


        await runTransaction(

            db,

            async transaction => {

                const withdrawalSnap =
                    await transaction.get(
                        withdrawalRef
                    );


                if (
                    !withdrawalSnap.exists()
                ) {

                    throw new Error(
                        "Withdrawal haipo."
                    );

                }


                const withdrawal =
                    withdrawalSnap.data();


                if (
                    withdrawal.status !==
                    "Pending"
                ) {

                    throw new Error(
                        "Withdrawal tayari imeshughulikiwa."
                    );

                }


                const userRef =
                    doc(

                        db,

                        "users",

                        withdrawal.userId

                    );


                const userSnap =
                    await transaction.get(
                        userRef
                    );


                if (
                    !userSnap.exists()
                ) {

                    throw new Error(
                        "User haipo."
                    );

                }


                const user =
                    userSnap.data();


                transaction.update(

                    withdrawalRef,

                    {

                        status:
                            "Approved",

                        approvedAt:
                            serverTimestamp(),

                        approvedBy:
                            currentUser.uid

                    }

                );


                transaction.update(

                    userRef,

                    {

                        pendingWithdrawal:

                            Math.max(

                                0,

                                Number(
                                    user.pendingWithdrawal || 0
                                )
                                -
                                Number(
                                    withdrawal.amount || 0
                                )

                            ),

                        totalWithdrawn:

                            Number(
                                user.totalWithdrawn || 0
                            )
                            +
                            Number(
                                withdrawal.amount || 0
                            ),

                        updatedAt:
                            serverTimestamp()

                    }

                );

            }

        );


        const withdrawalSnap =
            await getDoc(
                withdrawalRef
            );


        const withdrawal =
            withdrawalSnap.data();


        await addNotification(

            withdrawal.userId,

            "Withdrawal Approved ✅",

            `Withdrawal yako ya ${formatMoney(withdrawal.amount)} imeidhinishwa. Kiasi cha kupokea ni ${formatMoney(withdrawal.receiveAmount)}.`

        );


        alert(
            "✅ Withdrawal imeidhinishwa."
        );


        onyeshaAdminWithdrawals();

    }

    catch (error) {

        console.error(error);


        alert(
            "❌ " +
            error.message
        );

    }

}


/* =========================================================
   49. REJECT WITHDRAWAL
========================================================= */

async function adminRejectWithdrawal(
    withdrawalId
) {

    try {

        if (!isAdmin()) {

            return;

        }


        const withdrawalRef =
            doc(

                db,

                "withdrawals",

                withdrawalId

            );


        await runTransaction(

            db,

            async transaction => {

                const withdrawalSnap =
                    await transaction.get(
                        withdrawalRef
                    );


                if (
                    !withdrawalSnap.exists()
                ) {

                    throw new Error(
                        "Withdrawal haipo."
                    );

                }


                const withdrawal =
                    withdrawalSnap.data();


                if (
                    withdrawal.status !==
                    "Pending"
                ) {

                    throw new Error(
                        "Withdrawal tayari imeshughulikiwa."
                    );

                }


                const userRef =
                    doc(

                        db,

                        "users",

                        withdrawal.userId

                    );


                const userSnap =
                    await transaction.get(
                        userRef
                    );


                if (
                    !userSnap.exists()
                ) {

                    throw new Error(
                        "User haipo."
                    );

                }


                const user =
                    userSnap.data();


                /*
                   RUDISHA PESA
                   KWENYE AVAILABLE BALANCE
                */

                transaction.update(

                    userRef,

                    {

                        availableBalance:

                            Number(
                                user.availableBalance || 0
                            )
                            +
                            Number(
                                withdrawal.amount || 0
                            ),

                        pendingWithdrawal:

                            Math.max(

                                0,

                                Number(
                                    user.pendingWithdrawal || 0
                                )
                                -
                                Number(
                                    withdrawal.amount || 0
                                )

                            ),

                        updatedAt:
                            serverTimestamp()

                    }

                );


                transaction.update(

                    withdrawalRef,

                    {

                        status:
                            "Rejected",

                        rejectedAt:
                            serverTimestamp(),

                        rejectedBy:
                            currentUser.uid

                    }

                );

            }

        );


        const withdrawalSnap =
            await getDoc(
                withdrawalRef
            );


        const withdrawal =
            withdrawalSnap.data();


        await addNotification(

            withdrawal.userId,

            "Withdrawal Imekataliwa ❌",

            `Withdrawal yako ya ${formatMoney(withdrawal.amount)} imekataliwa. Salio limerudishwa kwenye account yako.`

        );


        alert(
            "Withdrawal imekataliwa na salio limerudishwa."
        );


        onyeshaAdminWithdrawals();

    }

    catch (error) {

        console.error(error);


        alert(
            "❌ " +
            error.message
        );

    }

}


/* =========================================================
   50. ADMIN COMMISSIONS
========================================================= */

async function onyeshaAdminCommissions() {

    if (!isAdmin()) {

        return;

    }


    const adminResult =
        await getDocs(

            collection(
                db,
                "adminCommissions"
            )

        );


    const adminCommissions =
        adminResult.docs.map(

            item => ({

                id:
                    item.id,

                ...item.data()

            })

        );


    const userResult =
        await getDocs(

            collection(
                db,
                "commissions"
            )

        );


    const userCommissions =
        userResult.docs.map(

            item => ({

                id:
                    item.id,

                ...item.data()

            })

        );


    const adminTotal =
        adminCommissions.reduce(

            (sum, c) =>

                sum +
                Number(
                    c.amount || 0
                ),

            0

        );


    const userTotal =
        userCommissions.reduce(

            (sum, c) =>

                sum +
                Number(
                    c.amount || 0
                ),

            0

        );


    const section =
        document.getElementById(
            "taarifaSection"
        );


    section.innerHTML = `

        <h2>
            💰 Commission Management
        </h2>


        <button
            class="endeleaBtn"
            onclick="funguaAdmin()"
        >

            ⬅️ Rudi Admin

        </button>


        <div class="booking-card">

            <h3>
                👑 Admin Commission
            </h3>


            <p>
                System A:
                Admin hupata commission kwenye
                kila booking iliyothibitishwa.
            </p>


            <p>
                📊 Asilimia:

                <strong>
                    ${ADMIN_COMMISSION_PERCENT}%
                </strong>
            </p>


            <p>
                💰 Jumla:

                <strong>
                    ${formatMoney(adminTotal)}
                </strong>
            </p>


            <hr>


            <h3>
                👥 User Commission
            </h3>


            <p>
                🅰️ Level A: 5%
            </p>

            <p>
                🅱️ Level B: 2%
            </p>

            <p>
                🅲 Level C: 1%
            </p>


            <p>
                💰 Jumla:

                <strong>
                    ${formatMoney(userTotal)}
                </strong>
            </p>

        </div>


        <h3>
            👑 Admin Commission History
        </h3>


        ${

            !adminCommissions.length

            ?

            "<p>Hakuna commission bado.</p>"

            :

            adminCommissions.map(

                c => `

                    <div class="booking-card">

                        <p>
                            📋 Booking:
                            ${c.bookingNumber}
                        </p>


                        <p>
                            👤
                            ${c.bookingUserName}
                        </p>


                        <p>
                            📊
                            ${c.percent}%
                        </p>


                        <p>
                            💰

                            <strong>
                                ${formatMoney(c.amount)}
                            </strong>
                        </p>

                    </div>

                `

            ).join("")

        }

    `;

}


/* =========================================================
   51. ADMIN REFERRALS
========================================================= */

async function onyeshaAdminReferrals() {

    if (!isAdmin()) {

        return;

    }


    const result =
        await getDocs(

            collection(
                db,
                "users"
            )

        );


    const users =
        result.docs.map(

            item => ({

                id:
                    item.id,

                ...item.data()

            })

        );


    const section =
        document.getElementById(
            "taarifaSection"
        );


    section.innerHTML = `

        <h2>
            🤝 Manage Referrals
        </h2>


        <button
            class="endeleaBtn"
            onclick="funguaAdmin()"
        >

            ⬅️ Rudi Admin

        </button>


        <div class="booking-card">

            <p>
                🔑 Admin Referral Code:

                <strong>
                    ${ADMIN_REFERRAL_CODE}
                </strong>
            </p>


            <p>
                👥 Total Users:

                <strong>
                    ${users.length}
                </strong>
            </p>

        </div>


        ${

            !users.length

            ?

            "<p>Hakuna users bado.</p>"

            :

            users.map(

                user => `

                    <div class="booking-card">

                        <h3>
                            👤 ${user.name || "-"}
                        </h3>


                        <p>
                            📱
                            ${user.phone || "-"}
                        </p>


                        <p>
                            🔑 Referral:

                            <strong>
                                ${user.referralCode || "-"}
                            </strong>
                        </p>


                        <p>
                            🤝 Referred By:

                            ${user.referredBy || "-"}
                        </p>


                        <p>
                            🏦 Available Balance:

                            <strong>
                                ${formatMoney(user.availableBalance)}
                            </strong>
                        </p>

                    </div>

                `

            ).join("")

        }

    `;

}


/* =========================================================
   52. ADMIN STATISTICS
========================================================= */

async function onyeshaAdminStatistics() {

    if (!isAdmin()) {

        return;

    }


    const bookingResult =
        await getDocs(

            collection(
                db,
                "bookings"
            )

        );


    const bookings =
        bookingResult.docs.map(

            item =>
                item.data()

        );


    const userResult =
        await getDocs(

            collection(
                db,
                "users"
            )

        );


    const users =
        userResult.docs.map(

            item =>
                item.data()

        );


    const withdrawalResult =
        await getDocs(

            collection(
                db,
                "withdrawals"
            )

        );


    const withdrawals =
        withdrawalResult.docs.map(

            item =>
                item.data()

        );


    const confirmed =
        bookings.filter(

            b =>
                b.status ===
                "Confirmed"

        );


    const pending =
        bookings.filter(

            b =>
                b.status !==
                "Confirmed"

        );


    const revenue =
        confirmed.reduce(

            (sum, b) =>

                sum +
                Number(
                    b.price || 0
                ),

            0

        );


    const adminResult =
        await getDocs(

            collection(
                db,
                "adminCommissions"
            )

        );


    const adminTotal =
        adminResult.docs.reduce(

            (sum, item) =>

                sum +
                Number(
                    item.data().amount || 0
                ),

            0

        );


    const userCommissionResult =
        await getDocs(

            collection(
                db,
                "commissions"
            )

        );


    const userTotal =
        userCommissionResult.docs.reduce(

            (sum, item) =>

                sum +
                Number(
                    item.data().amount || 0
                ),

            0

        );


    const pendingWithdrawals =
        withdrawals.filter(

            w =>
                w.status ===
                "Pending"

        ).length;


    const section =
        document.getElementById(
            "taarifaSection"
        );


    section.innerHTML = `

        <h2>
            📊 Statistics
        </h2>


        <button
            class="endeleaBtn"
            onclick="funguaAdmin()"
        >

            ⬅️ Rudi Admin

        </button>


        <div class="booking-card">

            <p>
                📋 Total Bookings:

                <strong>
                    ${bookings.length}
                </strong>
            </p>


            <p>
                👥 Total Users:

                <strong>
                    ${users.length}
                </strong>
            </p>


            <p>
                ✅ Confirmed:

                <strong>
                    ${confirmed.length}
                </strong>
            </p>


            <p>
                ⏳ Pending Bookings:

                <strong>
                    ${pending.length}
                </strong>
            </p>


            <p>
                💸 Pending Withdrawals:

                <strong>
                    ${pendingWithdrawals}
                </strong>
            </p>


            <p>
                💰 Revenue:

                <strong>
                    ${formatMoney(revenue)}
                </strong>
            </p>


            <p>
                👑 Admin Commission:

                <strong>
                    ${formatMoney(adminTotal)}
                </strong>
            </p>


            <p>
                👥 User Commission:

                <strong>
                    ${formatMoney(userTotal)}
                </strong>
            </p>


            <p>
                🏠 Total Rooms:

                <strong>
                    ${rooms.length}
                </strong>
            </p>

        </div>

    `;

}


/* =========================================================
   53. ADMIN LOGOUT
========================================================= */

async function adminLogout() {

    try {

        await signOut(
            auth
        );


        alert(
            "👋 Umetoka kwenye RoomRent."
        );


        location.reload();

    }

    catch (error) {

        console.error(error);

    }

}


/* =========================================================
   54. EXPOSE FUNCTIONS TO WINDOW

   HII NI MUHIMU SANA KWA
   HTML onclick BUTTONS
========================================================= */

window.funguaKodi =
    funguaKodi;

window.tengenezaBooking =
    tengenezaBooking;

window.tumaPaymentRequest =
    tumaPaymentRequest;

window.onyeshaBookingZangu =
    onyeshaBookingZangu;

window.funguaAccount =
    funguaAccount;

window.onyeshaMyReferral =
    onyeshaMyReferral;

window.onyeshaMyCommissions =
    onyeshaMyCommissions;

window.funguaWithdrawal =
    funguaWithdrawal;

window.hesabuWithdrawal =
    hesabuWithdrawal;

window.ombaWithdrawal =
    ombaWithdrawal;

window.onyeshaWithdrawalHistory =
    onyeshaWithdrawalHistory;

window.funguaTaarifa =
    funguaTaarifa;

window.onyeshaNotifications =
    onyeshaNotifications;

window.tumaOTP =
    tumaOTP;

window.thibitishaOTP =
    thibitishaOTP;

window.funguaAdminLogin =
    funguaAdminLogin;

window.funguaAdmin =
    funguaAdmin;

window.onyeshaAdminBookings =
    onyeshaAdminBookings;

window.adminConfirmBooking =
    adminConfirmBooking;

window.adminCancelBooking =
    adminCancelBooking;

window.onyeshaAdminWithdrawals =
    onyeshaAdminWithdrawals;

window.adminApproveWithdrawal =
    adminApproveWithdrawal;

window.adminRejectWithdrawal =
    adminRejectWithdrawal;

window.onyeshaAdminCommissions =
    onyeshaAdminCommissions;

window.onyeshaAdminReferrals =
    onyeshaAdminReferrals;

window.onyeshaAdminStatistics =
    onyeshaAdminStatistics;

window.adminLogout =
    adminLogout;


/* =========================================================
   55. INITIALIZE WEBSITE
========================================================= */

document.addEventListener(

    "DOMContentLoaded",

    () => {


        /*
           DISPLAY ROOMS
        */

        onyeshaVyumba();


        /*
           ANGALIA VYUMBA
        */

        const angalia =
            document.getElementById(
                "angaliaVyumba"
            );


        if (angalia) {

            angalia.onclick =
                () => {

                    document
                    .getElementById(
                        "vyumba"
                    )
                    ?.scrollIntoView({

                        behavior:
                            "smooth"

                    });

                };

        }


        /*
           BOOKINGS
        */

        const booking =
            document.getElementById(
                "bookingZangu"
            );


        if (booking) {

            booking.onclick =
                onyeshaBookingZangu;

        }


        /*
           ACCOUNT
        */

        const account =
            document.getElementById(
                "accountBtn"
            );


        if (account) {

            account.onclick =
                funguaAccount;

        }


        /*
           NOTIFICATIONS
        */

        const taarifa =
            document.getElementById(
                "taarifaBtn"
            );


        if (taarifa) {

            taarifa.onclick =
                funguaTaarifa;

        }


        /*
           SEND OTP
        */

        const sendOtpBtn =
            document.getElementById(
                "sendOtpBtn"
            );


        if (sendOtpBtn) {

            sendOtpBtn.onclick =
                tumaOTP;

        }


        /*
           VERIFY OTP
        */

        const verifyOtpBtn =
            document.getElementById(
                "verifyOtpBtn"
            );


        if (verifyOtpBtn) {

            verifyOtpBtn.onclick =
                thibitishaOTP;

        }

    }

);


/* =========================================================
   MWISHO WA ROOMRENT FIREBASE SCRIPT
========================================================= */
