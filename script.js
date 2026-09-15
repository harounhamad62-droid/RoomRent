/* =========================================================
   ROOMRENT - SCRIPT NZIMA
   VERSION: CLEAN MERGED
   =========================================================

   MFUMO:
   - Firebase
   - Firebase Auth
   - Firestore
   - Firebase Storage
   - Sign Up
   - Sign In
   - Sign Out
   - Account
   - Referral System
   - Level A / B / C
   - Vyumba
   - Booking
   - Manual Payment Request
   - Booking Zangu
   - Notifications
   - Withdrawal
   - Admin Login Modal

   MUHIMU:
   - Hakuna localStorage
   - Hakuna payment demo
   - Malipo yanaenda kwenye namba halisi
   - Admin ndiye anathibitisha malipo
========================================================= */


/* =========================================================
   1. FIREBASE CHECK
========================================================= */

if (typeof firebase === "undefined") {

    alert(
        "❌ Firebase haijapakiwa. Tafadhali hakikisha Firebase SDK ipo kwenye HTML."
    );

    console.error(
        "❌ Firebase SDK haipo."
    );

} else {

    console.log(
        "✅ Firebase SDK imepatikana."
    );

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

        console.log(
            "✅ Firebase Auth iko tayari."
        );

        console.log(
            "✅ Firestore iko tayari."
        );

        if (storage) {

            console.log(
                "✅ Firebase Storage iko tayari."
            );

        }

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
        durationDays: 40
    },

    {
        roomNumber: "0024",
        price: 70000,
        profitPerDay: 2333,
        durationDays: 40
    },

    {
        roomNumber: "0025",
        price: 140000,
        profitPerDay: 4666,
        durationDays: 40
    },

    {
        roomNumber: "0026",
        price: 210000,
        profitPerDay: 6993,
        durationDays: 40
    },

    {
        roomNumber: "0027",
        price: 280000,
        profitPerDay: 9324,
        durationDays: 40
    },

    {
        roomNumber: "0028",
        price: 350000,
        profitPerDay: 11655,
        durationDays: 40
    },

    {
        roomNumber: "0029",
        price: 420000,
        profitPerDay: 13986,
        durationDays: 40
    },

    {
        roomNumber: "0030",
        price: 490000,
        profitPerDay: 16317,
        durationDays: 40
    },

    {
        roomNumber: "0031",
        price: 560000,
        profitPerDay: 18648,
        durationDays: 40
    },

    {
        roomNumber: "0032",
        price: 630000,
        profitPerDay: 20979,
        durationDays: 40
    }

];


/* =========================================================
   5. HELPER - GET ELEMENT
========================================================= */

function getElement(id) {

    return document.getElementById(id);

}


/* =========================================================
   6. FORMAT MONEY
========================================================= */

function formatMoney(amount) {

    const number =
        Number(amount) || 0;

    return number.toLocaleString("en-US");

}


/* =========================================================
   7. ESCAPE HTML
========================================================= */

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }

    return String(value)

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
   8. SHOW SECTION
========================================================= */

function showSection(id) {

    const section =
        getElement(id);

    if (!section) {

        return;

    }

    section.style.display =
        "block";

}


/* =========================================================
   9. HIDE SECTION
========================================================= */

function hideSection(id) {

    const section =
        getElement(id);

    if (!section) {

        return;

    }

    section.style.display =
        "none";

}


/* =========================================================
   10. CURRENT USER
========================================================= */

function getCurrentUser() {

    if (!auth) {

        return null;

    }

    return auth.currentUser || null;

}


/* =========================================================
   11. LOGIN MESSAGE
========================================================= */

function onyeshaLoginMessage(
    message,
    type = "error"
) {

    const box =
        getElement("loginMessage");

    if (!box) {

        return;

    }

    box.style.display =
        "block";

    box.textContent =
        message;

    box.style.color =
        type === "success"
            ? "green"
            : "red";

}


/* =========================================================
   12. CLEAN EMAIL
========================================================= */

function safishaEmail(email) {

    return String(email || "")
        .trim()
        .toLowerCase();

}


/* =========================================================
   13. GENERATE REFERRAL CODE
========================================================= */

function generateReferralCode(email) {

    let prefix =
        "RR";

    if (email) {

        const emailName =
            email
                .split("@")[0]
                .replace(
                    /[^a-zA-Z0-9]/g,
                    ""
                )
                .substring(0, 5)
                .toUpperCase();

        if (
            emailName.length >= 2
        ) {

            prefix =
                "RR" + emailName;

        }

    }

    const randomPart =
        Math.random()
            .toString(36)
            .substring(2, 8)
            .toUpperCase();

    return prefix + randomPart;

}


/* =========================================================
   14. REFERRAL CODE UNIQUE
========================================================= */

async function tengenezaReferralCodeUnique(
    email
) {

    return generateReferralCode(
        email
    );

}


/* =========================================================
   15. REFERRAL URL
========================================================= */

function pataReferralKutokaURL() {

    try {

        const url =
            new URL(
                window.location.href
            );

        const code =
            url.searchParams.get(
                "ref"
            );

        if (!code) {

            return "";

        }

        return code
            .trim()
            .toUpperCase();

    } catch (error) {

        console.error(
            "Referral URL error:",
            error
        );

        return "";

    }

}


/* =========================================================
   16. REFERRAL LINK
========================================================= */

function pataReferralLink(code) {

    if (!code) {

        return "";

    }

    try {

        const baseURL =
            window.location.origin +
            window.location.pathname;

        return (
            baseURL +
            "?ref=" +
            encodeURIComponent(code)
        );

    } catch (error) {

        return (
            window.location.href.split("?")[0] +
            "?ref=" +
            encodeURIComponent(code)
        );

    }

}


/* =========================================================
   17. HAKIKISHA REFERRAL CODE YA USER
========================================================= */

async function hakikishaReferralCodeYaUser() {

    const user =
        getCurrentUser();

    if (!user) {

        return null;

    }

    if (!db) {

        console.error(
            "Firestore haipo."
        );

        return null;

    }

    try {

        const userRef =
            db
                .collection("users")
                .doc(user.uid);

        const userSnap =
            await userRef.get();

        if (!userSnap.exists) {

            const newCode =
                await tengenezaReferralCodeUnique(
                    user.email
                );

            const newLink =
                pataReferralLink(
                    newCode
                );

            await userRef.set({

                uid:
                    user.uid,

                email:
                    user.email || "",

                referralCode:
                    newCode,

                referralLink:
                    newLink,

                referredBy:
                    "",

                referredByUid:
                    "",

                referralType:
                    "",

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

            return newCode;

        }


        const data =
            userSnap.data();

        if (data.referralCode) {

            if (!data.referralLink) {

                await userRef.set({

                    referralLink:
                        pataReferralLink(
                            data.referralCode
                        ),

                    updatedAt:
                        firebase.firestore
                            .FieldValue
                            .serverTimestamp()

                }, {
                    merge: true
                });

            }

            return data.referralCode;

        }


        const newCode =
            await tengenezaReferralCodeUnique(
                user.email
            );

        const newLink =
            pataReferralLink(
                newCode
            );

        await userRef.set({

            referralCode:
                newCode,

            referralLink:
                newLink,

            updatedAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp()

        }, {
            merge: true
        });

        return newCode;

    } catch (error) {

        console.error(
            "REFERRAL CODE ERROR:",
            error
        );

        return null;

    }

}


/* =========================================================
   18. ACCOUNT DATA
========================================================= */

async function pataAccountData() {

    const user =
        getCurrentUser();

    if (!user || !db) {

        return null;

    }

    try {

        const snapshot =
            await db
                .collection("users")
                .doc(user.uid)
                .get();

        if (!snapshot.exists) {

            return {

                uid:
                    user.uid,

                email:
                    user.email || "",

                referralCode:
                    "",

                referralLink:
                    "",

                referredBy:
                    "",

                totalCommission:
                    0,

                totalBookings:
                    0

            };

        }

        return {

            uid:
                user.uid,

            ...snapshot.data()

        };

    } catch (error) {

        console.error(
            "ACCOUNT DATA ERROR:",
            error
        );

        return null;

    }

}


/* =========================================================
   19. SAVE NEW USER REFERRAL
========================================================= */

async function hifadhiReferralMpya(uid) {

    if (!uid || !db) {

        return "";

    }

    try {

        const userRef =
            db
                .collection("users")
                .doc(uid);

        const userSnap =
            await userRef.get();

        if (!userSnap.exists) {

            return "";

        }

        const userData =
            userSnap.data();

        if (userData.referredBy) {

            return userData.referredBy;

        }

        const referralCode =
            pataReferralKutokaURL();

        if (!referralCode) {

            return "";

        }

        if (
            referralCode ===
            ROOMRENT_SETTINGS.adminReferralCode
        ) {

            await userRef.set({

                referredBy:
                    referralCode,

                referralType:
                    "admin",

                updatedAt:
                    firebase.firestore
                        .FieldValue
                        .serverTimestamp()

            }, {
                merge: true
            });

            return referralCode;

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

            if (snapshot.empty) {

                return "";

            }

            const referrer =
                snapshot.docs[0];

            if (
                referrer.id === uid
            ) {

                return "";

            }

            await userRef.set({

                referredBy:
                    referralCode,

                referredByUid:
                    referrer.id,

                referralType:
                    "user",

                updatedAt:
                    firebase.firestore
                        .FieldValue
                        .serverTimestamp()

            }, {
                merge: true
            });

            return referralCode;

        } catch (queryError) {

            console.warn(
                "Referral query haikufanikiwa:",
                queryError
            );

            return "";

        }

    } catch (error) {

        console.error(
            "HIFADHI REFERRAL ERROR:",
            error
        );

        return "";

    }

}


/* =========================================================
   20. PREPARE REFERRAL AFTER LOGIN
========================================================= */

async function andaaReferralBaadaYaLogin() {

    const user =
        getCurrentUser();

    if (!user) {

        return;

    }

    try {

        await hakikishaReferralCodeYaUser();

        await hifadhiReferralMpya(
            user.uid
        );

    } catch (error) {

        console.error(
            "ANDAA REFERRAL ERROR:",
            error
        );

    }

}


/* =========================================================
   21. ONYESHA VYUMBA
========================================================= */

function onyeshaVyumba() {

    const user =
        getCurrentUser();

    if (!user) {

        alert(
            "Tafadhali ingia kwenye account kwanza."
        );

        return;

    }

    const container =
        getElement("vyumba");

    if (!container) {

        console.error(
            "❌ #vyumba haipo."
        );

        return;

    }

    hideSection(
        "fomuKodi"
    );

    hideSection(
        "taarifaSection"
    );

    container.style.display =
        "block";

    container.innerHTML = `

        <div class="booking-card">

            <h2>
                🏠 Vyumba vya RoomRent
            </h2>

            <p>
                Chagua chumba unachotaka kukodi.
            </p>

        </div>

    `;

    ROOMRENT_ROOMS.forEach(
        function(room) {

            const totalProfit =
                room.profitPerDay *
                room.durationDays;

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "booking-card";

            card.innerHTML = `

                <h2>
                    🏠 Chumba
                    ${escapeHTML(
                        room.roomNumber
                    )}
                </h2>

                <p>
                    💰 Bei:
                    <strong>
                        TSh ${formatMoney(
                            room.price
                        )}
                    </strong>
                </p>

                <p>
                    📈 Faida kwa siku:
                    <strong>
                        TSh ${formatMoney(
                            room.profitPerDay
                        )}
                    </strong>
                </p>

                <p>
                    📅 Muda:
                    <strong>
                        ${room.durationDays}
                        siku
                    </strong>
                </p>

                <p>
                    💵 Faida ya mzunguko:
                    <strong>
                        TSh ${formatMoney(
                            totalProfit
                        )}
                    </strong>
                </p>

                <button
                    class="thibitishaBtn"
                    onclick="funguaFomuKodi('${room.roomNumber}')"
                >
                    🏠 Kodi Chumba
                </button>

            `;

            container.appendChild(
                card
            );

        }
    );

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* =========================================================
   22. PATA CHUMBA
========================================================= */

function pataChumba(
    roomNumber
) {

    return ROOMRENT_ROOMS.find(
        function(room) {

            return (
                room.roomNumber ===
                roomNumber
            );

        }
    );

}


/* =========================================================
   23. OPEN BOOKING FORM
========================================================= */

function funguaFomuKodi(
    roomNumber
) {

    const user =
        getCurrentUser();

    if (!user) {

        alert(
            "Tafadhali ingia kwenye account kwanza."
        );

        return;

    }

    const room =
        pataChumba(
            roomNumber
        );

    if (!room) {

        alert(
            "❌ Chumba hakikupatikana."
        );

        return;

    }

    hideSection(
        "vyumba"
    );

    hideSection(
        "taarifaSection"
    );

    const container =
        getElement("fomuKodi");

    if (!container) {

        return;

    }

    container.style.display =
        "block";

    container.innerHTML = `

        <div class="booking-card">

            <h2>
                🏠 Kodi Chumba
                ${escapeHTML(
                    room.roomNumber
                )}
            </h2>

            <p>
                💰 Bei:
                <strong>
                    TSh ${formatMoney(
                        room.price
                    )}
                </strong>
            </p>

            <p>
                📅 Muda:
                <strong>
                    ${room.durationDays}
                    siku
                </strong>
            </p>

            <p>
                📈 Faida kwa siku:
                <strong>
                    TSh ${formatMoney(
                        room.profitPerDay
                    )}
                </strong>
            </p>

            <hr>

            <h3>
                📝 Taarifa za Booking
            </h3>

            <input
                type="text"
                id="bookingName"
                placeholder="Jina kamili"
                autocomplete="name"
            >

            <input
                type="tel"
                id="bookingPhone"
                placeholder="Namba ya simu"
                autocomplete="tel"
            >

            <label>
                <strong>
                    Njia ya malipo
                </strong>
            </label>

            <select
                id="paymentMethod"
            >

                <option value="">
                    -- Chagua njia ya malipo --
                </option>

                <option value="mixx">
                    MIXX BY YAS
                </option>

                <option value="airtel">
                    Airtel Money
                </option>

            </select>

            <div
                id="paymentDetails"
                style="margin-top:15px;"
            ></div>

            <button
                class="thibitishaBtn"
                id="submitBookingBtn"
            >
                💳 Endelea na Malipo
            </button>

            <button
                class="endeleaBtn"
                id="backToRoomsBtn"
            >
                ↩️ Rudi Vyumba
            </button>

            <p
                id="bookingMessage"
                style="
                    text-align:center;
                    margin-top:15px;
                "
            ></p>

        </div>

    `;

    const paymentSelect =
        getElement(
            "paymentMethod"
        );

    if (paymentSelect) {

        paymentSelect.onchange =
            function() {

                onyeshaPaymentDetails(
                    this.value
                );

            };

    }

    const submitButton =
        getElement(
            "submitBookingBtn"
        );

    if (submitButton) {

        submitButton.onclick =
            function() {

                tengenezaBooking(
                    roomNumber
                );

            };

    }

    const backButton =
        getElement(
            "backToRoomsBtn"
        );

    if (backButton) {

        backButton.onclick =
            onyeshaVyumba;

    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* =========================================================
   24. PAYMENT METHODS
========================================================= */

function onyeshaPaymentDetails(
    paymentMethod
) {

    const area =
        getElement(
            "paymentDetails"
        );

    if (!area) {

        return;

    }

    if (!paymentMethod) {

        area.innerHTML =
            "";

        return;

    }

    const payment =
        ROOMRENT_SETTINGS
            .paymentMethods[
                paymentMethod
            ];

    if (!payment) {

        area.innerHTML =
            "";

        return;

    }

    area.innerHTML = `

        <div
            style="
                padding:15px;
                border:1px solid #ddd;
                border-radius:10px;
            "
        >

            <h3>
                💳 ${escapeHTML(
                    payment.name
                )}
            </h3>

            <p>
                Tuma TSh
                <strong>
                    kwenda:
                </strong>
            </p>

            <h2>
                ${escapeHTML(
                    payment.phone
                )}
            </h2>

            <p>
                Jina la mpokeaji:
                <strong>
                    ${escapeHTML(
                        payment.owner
                    )}
                </strong>
            </p>

            <p>
                Baada ya kulipa,
                utaingiza namba uliyotumia
                kufanya malipo.
            </p>

        </div>

    `;

}


/* =========================================================
   25. BOOKING NUMBER
========================================================= */

function generateBookingNumber() {

    const timestamp =
        Date.now()
            .toString()
            .slice(-8);

    const random =
        Math.floor(
            100 +
            Math.random() * 900
        );

    return (
        "RR" +
        timestamp +
        random
    );

}


/* =========================================================
   26. BOOKING MESSAGE
========================================================= */

function onyeshaBookingMessage(
    text,
    color = "red"
) {

    const message =
        getElement(
            "bookingMessage"
        );

    if (!message) {

        return;

    }

    message.style.color =
        color;

    message.textContent =
        text;

}

/* =========================================================
   27. CREATE BOOKING
========================================================= */

async function tengenezaBooking(roomNumber) {

    console.log("🚀 tengenezaBooking imeanza:", roomNumber);

    const user = getCurrentUser();

    if (!user) {

        alert("Tafadhali ingia kwanza.");

        return;
    }

    if (!db) {

        alert("❌ Firestore haijaunganishwa.");

        return;
    }

    const room = pataChumba(roomNumber);

    if (!room) {

        alert("❌ Chumba hakikupatikana.");

        return;
    }

    const nameInput =
        getElement("bookingName");

    const phoneInput =
        getElement("bookingPhone");

    const paymentInput =
        getElement("paymentMethod");

    const submitButton =
        getElement("submitBookingBtn");

    const name =
        nameInput
            ? nameInput.value.trim()
            : "";

    const phone =
        phoneInput
            ? phoneInput.value.trim()
            : "";

    const paymentMethod =
        paymentInput
            ? paymentInput.value.trim()
            : "";

    console.log("BOOKING DATA:", {
        name: name,
        phone: phone,
        paymentMethod: paymentMethod,
        room: room
    });

    /* =====================================================
       VALIDATION
    ===================================================== */

    if (!name) {

        onyeshaBookingMessage(
            "⚠️ Weka jina lako."
        );

        return;
    }

    if (!phone) {

        onyeshaBookingMessage(
            "⚠️ Weka namba yako ya simu."
        );

        return;
    }

    if (phone.length < 9) {

        onyeshaBookingMessage(
            "⚠️ Namba ya simu si sahihi."
        );

        return;
    }

    if (!paymentMethod) {

        onyeshaBookingMessage(
            "⚠️ Chagua njia ya malipo."
        );

        return;
    }

    /* =====================================================
       PAYMENT METHOD
    ===================================================== */

    const paymentSettings =
        ROOMRENT_SETTINGS &&
        ROOMRENT_SETTINGS.paymentMethods
            ? ROOMRENT_SETTINGS.paymentMethods
            : null;

    if (!paymentSettings) {

        console.error(
            "ROOMRENT_SETTINGS.paymentMethods haipo."
        );

        onyeshaBookingMessage(
            "❌ Mfumo wa malipo haujapatikana."
        );

        return;
    }

    const payment =
        paymentSettings[paymentMethod];

    if (!payment) {

        console.error(
            "Payment method haijapatikana:",
            paymentMethod,
            paymentSettings
        );

        onyeshaBookingMessage(
            "❌ Njia ya malipo haijapatikana. Tafadhali chagua tena."
        );

        return;
    }

    /* =====================================================
       DISABLE BUTTON
    ===================================================== */

    if (submitButton) {

        submitButton.disabled = true;

        submitButton.textContent =
            "⏳ Inahifadhi Booking...";

    }

    try {

        /* =================================================
           GENERATE BOOKING NUMBER
        ================================================= */

        const bookingNumber =
            generateBookingNumber();

        if (!bookingNumber) {

            throw new Error(
                "Booking number haijatengenezwa."
            );

        }

        console.log(
            "📋 Booking Number:",
            bookingNumber
        );

        /* =================================================
           BOOKING DATA
        ================================================= */

        const bookingData = {

            bookingNumber:
                bookingNumber,

            uid:
                user.uid,

            email:
                user.email || "",

            customerName:
                name,

            customerPhone:
                phone,

            roomNumber:
                room.roomNumber,

            roomPrice:
                Number(room.price) || 0,

            profitPerDay:
                Number(room.profitPerDay) || 0,

            durationDays:
                Number(room.durationDays) || 40,

            totalProfit:
                (
                    Number(room.profitPerDay) || 0
                ) *
                (
                    Number(room.durationDays) || 40
                ),

            paymentMethod:
                payment.name || paymentMethod,

            paymentReceiver:
                payment.phone || "",

            paymentOwner:
                payment.owner || "",

            paymentPhone:
                "",

            paymentStatus:
                "Waiting Confirmation",

            status:
                "Waiting Confirmation",

            commissionStatus:
                "Pending",

            referralCommissionStatus:
                "Pending",

            createdAt:
                firebase.firestore.FieldValue.serverTimestamp(),

            updatedAt:
                firebase.firestore.FieldValue.serverTimestamp()

        };

        console.log(
            "📦 Booking inayotumwa Firestore:",
            bookingData
        );

        /* =================================================
           SAVE TO FIRESTORE
        ================================================= */

        await db
            .collection("bookings")
            .doc(bookingNumber)
            .set(bookingData);

        console.log(
            "✅ FIRESTORE: Booking imehifadhiwa:",
            bookingNumber
        );

        /* =================================================
           SHOW PAYMENT REQUEST
        ================================================= */

        onyeshaPaymentRequest(
            bookingData
        );

    } catch (error) {

        console.error(
            "❌ BOOKING ERROR:",
            error
        );

        console.error(
            "❌ ERROR CODE:",
            error.code
        );

        console.error(
            "❌ ERROR MESSAGE:",
            error.message
        );

        let ujumbe =
            "❌ Imeshindikana kuhifadhi booking.";

        if (error.code === "permission-denied") {

            ujumbe =
                "❌ Firestore imekataa kuhifadhi booking. Tatizo liko kwenye Firestore Rules.";

        } else if (
            error.code === "failed-precondition"
        ) {

            ujumbe =
                "❌ Firestore bado haijaandaliwa vizuri.";

        } else if (
            error.code === "unavailable"
        ) {

            ujumbe =
                "❌ Hakuna muunganisho mzuri wa Firestore. Angalia Internet.";

        } else if (error.message) {

            ujumbe +=
                " " + error.message;

        }

        onyeshaBookingMessage(
            ujumbe
        );

        if (submitButton) {

            submitButton.disabled =
                false;

            submitButton.textContent =
                "💳 Endelea na Malipo";

        }

    }

}


/* =========================================================
   28. PAYMENT REQUEST SCREEN
========================================================= */

function onyeshaPaymentRequest(
    booking
) {

    const container =
        getElement(
            "fomuKodi"
        );

    if (!container) {

        return;

    }

    let payment = null;

    if (
        booking.paymentMethod ===
        "MIXX BY YAS"
    ) {

        payment =
            ROOMRENT_SETTINGS
                .paymentMethods
                .mixx;

    } else {

        payment =
            ROOMRENT_SETTINGS
                .paymentMethods
                .airtel;

    }

    container.style.display =
        "block";

    container.innerHTML = `

        <div class="booking-card">

            <h2>
                💳 Malipo ya Booking
            </h2>

            <p>
                Booking Number:
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
                    TSh ${formatMoney(
                        booking.roomPrice
                    )}
                </strong>
            </p>

            <hr>

            <h3>
                💳 Fanya Malipo
            </h3>

            <p>
                Tuma TSh
                <strong>
                    ${formatMoney(
                        booking.roomPrice
                    )}
                </strong>
                kwenda:
            </p>

            <h2>
                ${escapeHTML(
                    payment.phone
                )}
            </h2>

            <p>
                ${escapeHTML(
                    payment.name
                )}
            </p>

            <p>
                Jina la mpokeaji:
                <strong>
                    ${escapeHTML(
                        payment.owner
                    )}
                </strong>
            </p>

            <hr>

            <h3>
                📱 Baada ya kulipa
            </h3>

            <p>
                Weka namba ya simu
                uliyotumia kufanya malipo.
            </p>

            <input
                type="tel"
                id="paymentPhoneInput"
                placeholder="Namba uliyotumia kulipia"
                autocomplete="tel"
            >

            <button
                class="thibitishaBtn"
                id="sendPaymentRequestBtn"
            >
                📤 Tuma Payment Request
            </button>

            <p
                id="paymentRequestMessage"
                style="
                    text-align:center;
                    margin-top:15px;
                "
            ></p>

            <div
                style="
                    margin-top:20px;
                    padding:15px;
                    border:1px solid #ddd;
                    border-radius:10px;
                "
            >

                <p>
                    ⏳ Status:
                </p>

                <strong>
                    Waiting Confirmation
                </strong>

                <p>
                    Admin atakagua malipo
                    na kuthibitisha booking.
                </p>

            </div>

        </div>

    `;

    const sendButton =
        getElement(
            "sendPaymentRequestBtn"
        );

    if (sendButton) {

        sendButton.onclick =
            function() {

                tumaPaymentRequest(
                    booking.bookingNumber
                );

            };

    }

}


/* =========================================================
   29. SEND PAYMENT REQUEST
========================================================= */

async function tumaPaymentRequest(
    bookingNumber
) {

    const user =
        getCurrentUser();

    if (!user) {

        alert(
            "Tafadhali ingia kwanza."
        );

        return;

    }

    if (!db) {

        alert(
            "❌ Firestore haijaunganishwa."
        );

        return;

    }

    const input =
        getElement(
            "paymentPhoneInput"
        );

    const message =
        getElement(
            "paymentRequestMessage"
        );

    const button =
        getElement(
            "sendPaymentRequestBtn"
        );

    const paymentPhone =
        input
            ? input.value.trim()
            : "";

    if (!paymentPhone) {

        if (message) {

            message.style.color =
                "red";

            message.textContent =
                "⚠️ Weka namba uliyotumia kulipia.";

        }

        return;

    }

    if (paymentPhone.length < 9) {

        if (message) {

            message.style.color =
                "red";

            message.textContent =
                "⚠️ Namba ya malipo si sahihi.";

        }

        return;

    }

    if (button) {

        button.disabled =
            true;

        button.textContent =
            "⏳ Inatuma...";

    }

    try {

        const bookingRef =
            db
                .collection("bookings")
                .doc(
                    bookingNumber
                );

        const bookingSnap =
            await bookingRef.get();

        if (!bookingSnap.exists) {

            throw new Error(
                "Booking haikupatikana."
            );

        }

        const booking =
            bookingSnap.data();

        if (
            booking.uid !==
            user.uid
        ) {

            throw new Error(
                "Huna ruhusa ya booking hii."
            );

        }

        await bookingRef.update({

            paymentPhone:
                paymentPhone,

            paymentStatus:
                "Waiting Confirmation",

            status:
                "Waiting Confirmation",

            paymentRequestedAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp(),

            updatedAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp()

        });

        try {

            await db
                .collection("users")
                .doc(user.uid)
                .collection("notifications")
                .add({

                    title:
                        "Payment Request",

                    message:
                        "Payment request yako imepokelewa. Subiri uthibitisho wa admin.",

                    bookingNumber:
                        bookingNumber,

                    type:
                        "payment",

                    read:
                        false,

                    createdAt:
                        firebase.firestore
                            .FieldValue
                            .serverTimestamp()

                });

        } catch (
            notificationError
        ) {

            console.warn(
                "Notification haikuweza kuhifadhiwa:",
                notificationError
            );

        }

        if (message) {

            message.style.color =
                "green";

            message.innerHTML = `

                ✅ Payment Request imetumwa.

                <br><br>

                Booking Number:
                <strong>
                    ${escapeHTML(
                        bookingNumber
                    )}
                </strong>

                <br><br>

                Status:
                <strong>
                    Waiting Confirmation
                </strong>

                <br><br>

                Subiri admin athibitishe malipo.

            `;

        }

        if (button) {

            button.disabled =
                true;

            button.textContent =
                "✅ Request Imetumwa";

        }

    } catch (error) {

        console.error(
            "PAYMENT REQUEST ERROR:",
            error
        );

        if (message) {

            message.style.color =
                "red";

            message.textContent =
                "❌ " +
                (
                    error.message ||
                    "Imeshindikana kutuma request."
                );

        }

        if (button) {

            button.disabled =
                false;

            button.textContent =
                "📤 Tuma Payment Request";

        }

    }

}


/* =========================================================
   30. BOOKING ZANGU
========================================================= */

async function funguaBookingZangu() {

    const user =
        getCurrentUser();

    if (!user) {

        alert(
            "Tafadhali ingia kwenye account kwanza."
        );

        return;

    }

    const section =
        getElement(
            "taarifaSection"
        );

    if (!section) {

        return;

    }

    hideSection(
        "vyumba"
    );

    hideSection(
        "fomuKodi"
    );

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

    if (!db) {

        section.innerHTML = `

            <div class="booking-card">

                <h2>
                    📋 Booking Zangu
                </h2>

                <p style="color:red;">
                    ❌ Firestore haijaunganishwa.
                </p>

            </div>

        `;

        return;

    }

    try {

        const snapshot =
            await db
                .collection("bookings")
                .where(
                    "uid",
                    "==",
                    user.uid
                )
                .get();

        section.innerHTML = `

            <div class="booking-card">

                <h2>
                    📋 Booking Zangu
                </h2>

                <div id="myBookingsList">
                </div>

            </div>

        `;

        const list =
            getElement(
                "myBookingsList"
            );

        if (!list) {

            return;

        }

        if (snapshot.empty) {

            list.innerHTML = `

                <p>
                    Huna booking bado.
                </p>

                <button
                    class="thibitishaBtn"
                    id="goRoomsFromBookings"
                >
                    🏠 Angalia Vyumba
                </button>

            `;

            const button =
                getElement(
                    "goRoomsFromBookings"
                );

            if (button) {

                button.onclick =
                    onyeshaVyumba;

            }

            return;

        }

        const bookings = [];

        snapshot.forEach(
            function(doc) {

                bookings.push({

                    id:
                        doc.id,

                    ...doc.data()

                });

            }
        );

        bookings.sort(
            function(a, b) {

                const dateA =
                    a.createdAt &&
                    a.createdAt.toMillis
                        ? a.createdAt.toMillis()
                        : 0;

                const dateB =
                    b.createdAt &&
                    b.createdAt.toMillis
                        ? b.createdAt.toMillis()
                        : 0;

                return (
                    dateB - dateA
                );

            }
        );

        list.innerHTML =
            "";

        bookings.forEach(
            function(booking) {

                const card =
                    document.createElement(
                        "div"
                    );

                card.style.marginBottom =
                    "15px";

                card.style.padding =
                    "15px";

                card.style.border =
                    "1px solid #ddd";

                card.style.borderRadius =
                    "10px";

                card.innerHTML = `

                    <h3>
                        🏠 Chumba
                        ${escapeHTML(
                            booking.roomNumber || ""
                        )}
                    </h3>

                    <p>
                        Booking:
                        <strong>
                            ${escapeHTML(
                                booking.bookingNumber || ""
                            )}
                        </strong>
                    </p>

                    <p>
                        Kiasi:
                        <strong>
                            TSh
                            ${formatMoney(
                                booking.roomPrice || 0
                            )}
                        </strong>
                    </p>

                    <p>
                        📅 Muda:
                        <strong>
                            ${booking.durationDays || 40}
                            siku
                        </strong>
                    </p>

                    <p>
                        📈 Faida kwa siku:
                        <strong>
                            TSh
                            ${formatMoney(
                                booking.profitPerDay || 0
                            )}
                        </strong>
                    </p>

                    <p>
                        Status:
                        <strong>
                            ${escapeHTML(
                                booking.status || ""
                            )}
                        </strong>
                    </p>

                    <p>
                        Payment:
                        <strong>
                            ${escapeHTML(
                                booking.paymentStatus || ""
                            )}
                        </strong>
                    </p>

                `;

                list.appendChild(
                    card
                );

            }
        );

    } catch (error) {

        console.error(
            "BOOKING ZANGU ERROR:",
            error
        );

        section.innerHTML = `

            <div class="booking-card">

                <h2>
                    📋 Booking Zangu
                </h2>

                <p style="color:red;">
                    ❌ Imeshindikana kupakia booking.
                </p>

                <button
                    class="thibitishaBtn"
                    id="retryBookingsBtn"
                >
                    🔄 Jaribu Tena
                </button>

            </div>

        `;

        const retry =
            getElement(
                "retryBookingsBtn"
            );

        if (retry) {

            retry.onclick =
                funguaBookingZangu;

        }

    }

}


/* =========================================================
   31. ACCOUNT
========================================================= */

async function funguaAccount() {

    const user =
        getCurrentUser();

    if (!user) {

        alert(
            "Tafadhali ingia kwenye account kwanza."
        );

        return;

    }

    const section =
        getElement(
            "taarifaSection"
        );

    if (!section) {

        return;

    }

    hideSection(
        "vyumba"
    );

    hideSection(
        "fomuKodi"
    );

    section.style.display =
        "block";

    section.innerHTML = `

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

        let data =
            await pataAccountData();

        const referralCode =
            await hakikishaReferralCodeYaUser();

        await hifadhiReferralMpya(
            user.uid
        );

        data =
            await pataAccountData();

        if (!data) {

            data = {

                uid:
                    user.uid,

                email:
                    user.email || "",

                referralCode:
                    referralCode || "",

                referralLink:
                    referralCode
                        ? pataReferralLink(
                            referralCode
                        )
                        : "",

                referredBy:
                    "",

                totalCommission:
                    0,

                totalBookings:
                    0

            };

        }

        const finalReferralCode =
            data.referralCode ||
            referralCode ||
            "";

        const referralLink =
            data.referralLink ||
            (
                finalReferralCode
                    ? pataReferralLink(
                        finalReferralCode
                    )
                    : ""
            );

        section.innerHTML = `

            <div class="booking-card">

                <h2>
                    👤 Account Yangu
                </h2>

                <p>
                    <strong>Email:</strong>
                </p>

                <p>
                    ${escapeHTML(
                        user.email || ""
                    )}
                </p>

                <hr>

                <p>
                    <strong>🆔 UID:</strong>
                </p>

                <p>
                    <small>
                        ${escapeHTML(
                            user.uid
                        )}
                    </small>
                </p>

                <hr>

                <h3>
                    🔗 Referral Yangu
                </h3>

                <p>
                    Referral Code yako:
                </p>

                <input
                    type="text"
                    id="myReferralCode"
                    value="${escapeHTML(
                        finalReferralCode
                    )}"
                    readonly
                >

                <p>
                    Referral Link yako:
                </p>

                <input
                    type="text"
                    id="myReferralLink"
                    value="${escapeHTML(
                        referralLink
                    )}"
                    readonly
                >

                <button
                    class="thibitishaBtn"
                    id="copyReferralBtn"
                >
                    📋 Copy Referral Link
                </button>

                <p
                    id="referralCopyMessage"
                    style="
                        text-align:center;
                        font-weight:bold;
                    "
                ></p>

                <hr>

                <h3>
                    💰 Commission System
                </h3>

                <p>
                    🥇 Level A:
                    <strong>
                        ${ROOMRENT_SETTINGS.commission.user.A}%
                    </strong>
                </p>

                <p>
                    🥈 Level B:
                    <strong>
                        ${ROOMRENT_SETTINGS.commission.user.B}%
                    </strong>
                </p>

                <p>
                    🥉 Level C:
                    <strong>
                        ${ROOMRENT_SETTINGS.commission.user.C}%
                    </strong>
                </p>

                <hr>

                <h3>
                    💵 Commission Yako
                </h3>

                <h2>
                    TSh
                    ${formatMoney(
                        data.totalCommission || 0
                    )}
                </h2>

                <p>
                    📊 Total Bookings:
                    <strong>
                        ${data.totalBookings || 0}
                    </strong>
                </p>

                <hr>

                <button
                    class="endeleaBtn"
                    id="logoutAccountBtn"
                >
                    🚪 Toka kwenye Account
                </button>

            </div>

        `;

        const copyButton =
            getElement(
                "copyReferralBtn"
            );

        if (copyButton) {

            copyButton.onclick =
                function() {

                    nakiliReferralLink(
                        referralLink
                    );

                };

        }

        const logoutButton =
            getElement(
                "logoutAccountBtn"
            );

        if (logoutButton) {

            logoutButton.onclick =
                tokaRoomRent;

        }

    } catch (error) {

        console.error(
            "FUNGUA ACCOUNT ERROR:",
            error
        );

        section.innerHTML = `

            <div class="booking-card">

                <h2>
                    👤 Account Yangu
                </h2>

                <p style="color:red;">
                    ❌ Imeshindikana kupakia taarifa za Account.
                </p>

                <button
                    class="thibitishaBtn"
                    id="retryAccountBtn"
                >
                    🔄 Jaribu Tena
                </button>

            </div>

        `;

        const retry =
            getElement(
                "retryAccountBtn"
            );

        if (retry) {

            retry.onclick =
                funguaAccount;

        }

    }

}


/* =========================================================
   32. COPY REFERRAL LINK
========================================================= */

async function nakiliReferralLink(
    link
) {

    const message =
        getElement(
            "referralCopyMessage"
        );

    if (!link) {

        if (message) {

            message.style.color =
                "red";

            message.textContent =
                "❌ Referral link haipo.";

        }

        return;

    }

    try {

        await navigator.clipboard.writeText(
            link
        );

        if (message) {

            message.style.color =
                "green";

            message.textContent =
                "✅ Referral link imenakiliwa.";

        }

    } catch (error) {

        const input =
            getElement(
                "myReferralLink"
            );

        if (input) {

            input.focus();

            input.select();

            try {

                document.execCommand(
                    "copy"
                );

                if (message) {

                    message.style.color =
                        "green";

                    message.textContent =
                        "✅ Referral link imenakiliwa.";

                }

            } catch (copyError) {

                if (message) {

                    message.style.color =
                        "red";

                    message.textContent =
                        "⚠️ Shikilia Referral Link kisha Copy.";

                }

            }

        }

    }

}


/* =========================================================
   33. TAARIFA
========================================================= */

async function funguaTaarifa() {

    const user =
        getCurrentUser();

    if (!user) {

        alert(
            "Tafadhali ingia kwenye account kwanza."
        );

        return;

    }

    hideSection(
        "vyumba"
    );

    hideSection(
        "fomuKodi"
    );

    const section =
        getElement(
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
                ⏳ Inapakia...
            </p>

        </div>

    `;

    if (!db) {

        return;

    }

    try {

        const snapshot =
            await db
                .collection("users")
                .doc(user.uid)
                .collection("notifications")
                .orderBy(
                    "createdAt",
                    "desc"
                )
                .limit(30)
                .get();

        if (snapshot.empty) {

            section.innerHTML = `

                <div class="booking-card">

                    <h2>
                        🔔 Taarifa
                    </h2>

                    <p>
                        Huna taarifa mpya kwa sasa.
                    </p>

                </div>

            `;

            return;

        }

        section.innerHTML = `

            <div class="booking-card">

                <h2>
                    🔔 Taarifa
                </h2>

                <div id="notificationsList"></div>

            </div>

        `;

        const list =
            getElement(
                "notificationsList"
            );

        snapshot.forEach(
            function(doc) {

                const notification =
                    doc.data();

                const item =
                    document.createElement(
                        "div"
                    );

                item.style.padding =
                    "12px";

                item.style.marginBottom =
                    "10px";

                item.style.border =
                    "1px solid #ddd";

                item.style.borderRadius =
                    "10px";

                item.innerHTML = `

                    <h4>
                        ${escapeHTML(
                            notification.title ||
                            "Taarifa"
                        )}
                    </h4>

                    <p>
                        ${escapeHTML(
                            notification.message ||
                            ""
                        )}
                    </p>

                `;

                if (list) {

                    list.appendChild(
                        item
                    );

                }

            }
        );

    } catch (error) {

        console.error(
            "NOTIFICATION ERROR:",
            error
        );

        section.innerHTML = `

            <div class="booking-card">

                <h2>
                    🔔 Taarifa
                </h2>

                <p>
                    Huna taarifa mpya kwa sasa.
                </p>

            </div>

        `;

    }

}


/* =========================================================
   34. WITHDRAWAL
========================================================= */

function funguaWithdrawal() {

    const user =
        getCurrentUser();

    if (!user) {

        alert(
            "Tafadhali ingia kwenye account kwanza."
        );

        return;

    }

    hideSection(
        "vyumba"
    );

    hideSection(
        "fomuKodi"
    );

    const section =
        getElement(
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
                💸 Withdrawal
            </h2>

            <p>
                Mfumo wa withdrawal utaunganishwa
                katika hatua inayofuata.
            </p>

            <p>
                💰 Commission yako:
                <strong>
                    TSh ${formatMoney(
                        0
                    )}
                </strong>
            </p>

        </div>

    `;

}


/* =========================================================
   35. SIGN UP
========================================================= */

async function jisajiliRoomRent() {

    const emailInput =
        getElement(
            "loginEmail"
        );

    const passwordInput =
        getElement(
            "loginPassword"
        );

    if (!emailInput ||
        !passwordInput) {

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

        const credential =
            await auth
                .createUserWithEmailAndPassword(
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

        if (db) {

            await db
                .collection("users")
                .doc(user.uid)
                .set({

                    uid:
                        user.uid,

                    email:
                        user.email,

                    referralCode:
                        "",

                    referralLink:
                        "",

                    referredBy:
                        "",

                    referredByUid:
                        "",

                    referralType:
                        "",

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

                }, {
                    merge: true
                });

        }

        await hakikishaReferralCodeYaUser();

        await hifadhiReferralMpya(
            user.uid
        );

        onyeshaLoginMessage(
            "✅ Account yako imetengenezwa kikamilifu!",
            "success"
        );

        alert(
            "🎉 Karibu RoomRent!\n\nAccount yako imetengenezwa."
        );

        passwordInput.value =
            "";

        setTimeout(
            function() {

                onyeshaVyumba();

            },
            500
        );

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

        } else if (
            error.code ===
            "auth/invalid-email"
        ) {

            message =
                "❌ Email uliyoweka si sahihi.";

        } else if (
            error.code ===
            "auth/weak-password"
        ) {

            message =
                "❌ Password ni dhaifu. Tumia angalau herufi/namba 6.";

        } else if (
            error.code ===
            "auth/operation-not-allowed"
        ) {

            message =
                "❌ Email/Password Login haijawezeshwa Firebase Console.";

        } else if (error.message) {

            message =
                "❌ " +
                error.message;

        }

        onyeshaLoginMessage(
            message
        );

    }

}


/* =========================================================
   36. SIGN IN
========================================================= */

async function ingiaRoomRent() {

    const emailInput =
        getElement(
            "loginEmail"
        );

    const passwordInput =
        getElement(
            "loginPassword"
        );

    if (!emailInput ||
        !passwordInput) {

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
            await auth
                .signInWithEmailAndPassword(
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

        if (db) {

            await db
                .collection("users")
                .doc(user.uid)
                .set({

                    uid:
                        user.uid,

                    email:
                        user.email,

                    updatedAt:
                        firebase.firestore
                            .FieldValue
                            .serverTimestamp()

                }, {
                    merge: true
                });

        }

        await andaaReferralBaadaYaLogin();

        onyeshaLoginMessage(
            "✅ Umeingia RoomRent kikamilifu!",
            "success"
        );

        alert(
            "👋 Karibu tena RoomRent!"
        );

        passwordInput.value =
            "";

        setTimeout(
            function() {

                onyeshaVyumba();

            },
            500
        );

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

        } else if (
            error.code ===
            "auth/wrong-password"
        ) {

            message =
                "❌ Password si sahihi.";

        } else if (
            error.code ===
            "auth/invalid-credential"
        ) {

            message =
                "❌ Email au Password si sahihi.";

        } else if (
            error.code ===
            "auth/invalid-email"
        ) {

            message =
                "❌ Email uliyoweka si sahihi.";

        } else if (error.message) {

            message =
                "❌ " +
                error.message;

        }

        onyeshaLoginMessage(
            message
        );

    }

}


/* =========================================================
   37. SIGN OUT
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

        hideSection(
            "vyumba"
        );

        hideSection(
            "fomuKodi"
        );

        hideSection(
            "taarifaSection"
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
   38. ADMIN MODAL OPEN
========================================================= */

function funguaAdmin() {

    const modal =
        getElement(
            "adminLoginModal"
        );

    if (!modal) {

        return;

    }

    modal.style.display =
        "flex";

}


/* =========================================================
   39. ADMIN MODAL CLOSE
========================================================= */

function fungaAdminLogin() {

    const modal =
        getElement(
            "adminLoginModal"
        );

    if (!modal) {

        return;

    }

    modal.style.display =
        "none";

}


/* =========================================================
   40. ADMIN LOGIN
========================================================= */

function adminLogin() {

    const username =
        getElement(
            "adminUsername"
        );

    const password =
        getElement(
            "adminPassword"
        );

    const message =
        getElement(
            "adminLoginMessage"
        );

    if (!username ||
        !password) {

        return;

    }

    const user =
        username.value.trim();

    const pass =
        password.value.trim();

    /*
     * Hapa bado hatujaweka
     * mfumo wa admin authentication
     * wa Firestore.
     *
     * Hatutumii admin password
     * ya siri kwenye frontend.
     */

    if (message) {

        message.style.display =
            "block";

        message.style.color =
            "red";

        message.textContent =
            "⚠️ Admin authentication itaunganishwa kwenye mfumo wa Admin Firebase.";

    }

    console.log(
        "Admin login attempt:",
        user,
        pass ? "Password imewekwa" : "Password haijawekwa"
    );

}


/* =========================================================
   41. AUTH STATE
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

                if (db) {

                    try {

                        await db
                            .collection("users")
                            .doc(user.uid)
                            .set({

                                uid:
                                    user.uid,

                                email:
                                    user.email || "",

                                lastLogin:
                                    firebase.firestore
                                        .FieldValue
                                        .serverTimestamp(),

                                updatedAt:
                                    firebase.firestore
                                        .FieldValue
                                        .serverTimestamp()

                            }, {
                                merge: true
                            });

                    } catch (error) {

                        console.error(
                            "User Firestore update error:",
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
   42. DOM READY
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        console.log(
            "🚀 RoomRent DOM imekamilika."
        );

        const roomsButton =
            getElement(
                "angaliaVyumba"
            );

        const bookingsButton =
            getElement(
                "bookingZangu"
            );

        const accountButton =
            getElement(
                "accountBtn"
            );

        const taarifaButton =
            getElement(
                "taarifaBtn"
            );

        const withdrawalButton =
            getElement(
                "withdrawalBtn"
            );

        const signInButton =
            getElement(
                "signInBtn"
            );

        const signUpButton =
            getElement(
                "signUpBtn"
            );


        /* VYUMBA */

        if (roomsButton) {

            roomsButton.onclick =
                onyeshaVyumba;

        }


        /* BOOKING ZANGU */

        if (bookingsButton) {

            bookingsButton.onclick =
                funguaBookingZangu;

        }


        /* ACCOUNT */

        if (accountButton) {

            accountButton.onclick =
                funguaAccount;

        }


        /* TAARIFA */

        if (taarifaButton) {

            taarifaButton.onclick =
                funguaTaarifa;

        }


        /* WITHDRAWAL */

        if (withdrawalButton) {

            withdrawalButton.onclick =
                funguaWithdrawal;

        }


        /* SIGN IN */

        if (signInButton) {

            signInButton.onclick =
                ingiaRoomRent;

        }


        /* SIGN UP */

        if (signUpButton) {

            signUpButton.onclick =
                jisajiliRoomRent;

        }


        console.log(
            "✅ RoomRent buttons zote zimeunganishwa."
        );

    }
);


/* =========================================================
   43. SCRIPT LOADED
========================================================= */

console.log(
    "🔥🔥 ROOMRENT SCRIPT NZIMA IMELOADED."
);
