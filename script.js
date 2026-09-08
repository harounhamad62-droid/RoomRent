/* =========================================================
   ROOMRENT - SCRIPT KAMILI
   ========================================================= */


/* =========================================================
   1. ROOM DATA
========================================================= */

const rooms = [
    {
        number: "0023",
        price: 30000,
        profit: 1200,
        days: 40,
        description: "Chumba cha kuanzia kwa mfumo wa RoomRent."
    },
    {
        number: "0024",
        price: 70000,
        profit: 2800,
        days: 35,
        description: "Chumba chenye nafasi nzuri na mpango wa RoomRent."
    },
    {
        number: "0025",
        price: 140000,
        profit: 5600,
        days: 35,
        description: "Chumba cha kiwango cha kati kwa mpango wa RoomRent."
    },
    {
        number: "0026",
        price: 210000,
        profit: 8400,
        days: 35,
        description: "Chumba chenye mpango mzuri wa RoomRent."
    },
    {
        number: "0027",
        price: 280000,
        profit: 11200,
        days: 35,
        description: "Chumba cha kiwango cha juu kwa RoomRent."
    },
    {
        number: "0028",
        price: 350000,
        profit: 14000,
        days: 35,
        description: "Chumba chenye mpango mkubwa wa mapato."
    },
    {
        number: "0029",
        price: 420000,
        profit: 16800,
        days: 35,
        description: "Chumba cha kiwango cha juu zaidi."
    },
    {
        number: "0030",
        price: 490000,
        profit: 19600,
        days: 35,
        description: "Chumba chenye mpango mkubwa wa RoomRent."
    },
    {
        number: "0031",
        price: 560000,
        profit: 22400,
        days: 35,
        description: "Chumba cha kiwango cha juu."
    },
    {
        number: "0032",
        price: 630000,
        profit: 25200,
        days: 35,
        description: "Chumba cha juu zaidi katika orodha."
    }
];


/* =========================================================
   2. COMMISSION SETTINGS
========================================================= */

const ADMIN_COMMISSION = {
    A: 20,
    B: 10,
    C: 5
};

const USER_COMMISSION = {
    A: 5,
    B: 2,
    C: 1
};


/* =========================================================
   3. ADMIN REFERRAL
========================================================= */

const ADMIN_REFERRAL_CODE = "RRADMIN";
const ADMIN_REFERRAL_NAME = "RoomRent Admin";


/* =========================================================
   4. STORAGE FUNCTIONS
========================================================= */

function getJSON(key, fallback = []) {

    try {

        const data = localStorage.getItem(key);

        return data ? JSON.parse(data) : fallback;

    } catch (error) {

        return fallback;

    }

}


function setJSON(key, value) {

    localStorage.setItem(
        key,
        JSON.stringify(value)
    );

}


/* =========================================================
   5. FORMAT MONEY
========================================================= */

function formatMoney(amount) {

    return Number(amount || 0)
        .toLocaleString("sw-TZ") + " TSh";

}


/* =========================================================
   6. FORMAT DATE
========================================================= */

function formatDate(date) {

    if (!date) return "";

    try {

        return new Date(date)
            .toLocaleString("sw-TZ");

    } catch {

        return "";

    }

}


/* =========================================================
   7. ROOM IMAGES
========================================================= */

function getRoomImages() {

    return getJSON(
        "roomrentRoomImages",
        {}
    );

}


function getRoomImage(roomNumber) {

    const images = getRoomImages();

    return images[roomNumber] || "";

}


/* =========================================================
   8. NOTIFICATIONS
========================================================= */

function getNotifications() {

    return getJSON(
        "roomrentNotifications",
        []
    );

}


function saveNotifications(data) {

    setJSON(
        "roomrentNotifications",
        data
    );

}


function addNotification(phone, title, message) {

    const notifications =
        getNotifications();

    notifications.unshift({

        id:
            "NOT" +
            Date.now() +
            Math.floor(Math.random() * 1000),

        phone,

        title,

        message,

        read: false,

        createdAt:
            new Date().toISOString()

    });

    saveNotifications(
        notifications
    );

}


/* =========================================================
   9. USERS
========================================================= */

function getUsers() {

    return getJSON(
        "roomrentUsers",
        []
    );

}


function saveUsers(users) {

    setJSON(
        "roomrentUsers",
        users
    );

}


/* =========================================================
   10. GENERATE UNIQUE REFERRAL CODE
========================================================= */

function generateUniqueReferralCode(
    name,
    users,
    currentPhone = ""
) {

    let cleanName =
        String(name || "USER")
        .replace(/[^a-zA-Z]/g, "")
        .toUpperCase()
        .substring(0, 5);


    if (!cleanName) {

        cleanName = "USER";

    }


    let code = "";


    do {

        const random =
            Math.floor(
                1000 + Math.random() * 9000
            );

        code =
            cleanName + random;

    }

    while (

        users.some(

            user =>
                user.phone !== currentPhone &&
                user.referralCode === code

        )

    );


    return code;

}


/* =========================================================
   11. GENERATE REFERRAL CODE
========================================================= */

function generateReferralCode(name) {

    return generateUniqueReferralCode(
        name,
        getUsers()
    );

}


/* =========================================================
   12. FIX OLD USERS
========================================================= */

function fixUsersReferralCodes() {

    const users = getUsers();

    let changed = false;


    users.forEach(user => {

        if (!user.referralCode) {

            user.referralCode =
                generateUniqueReferralCode(
                    user.name || "USER",
                    users,
                    user.phone
                );

            changed = true;

        }


        if (
            user.totalCommission === undefined
        ) {

            user.totalCommission = 0;

            changed = true;

        }

    });


    if (changed) {

        saveUsers(users);

    }

}


/* =========================================================
   13. FIND USER BY PHONE
========================================================= */

function findUserByPhone(phone) {

    fixUsersReferralCodes();

    return getUsers().find(
        user => user.phone === phone
    );

}


/* =========================================================
   14. FIND USER BY REFERRAL CODE
========================================================= */

function findUserByReferralCode(code) {

    if (!code) return null;


    code =
        String(code)
        .trim()
        .toUpperCase();


    /* ADMIN */

    if (code === ADMIN_REFERRAL_CODE) {

        return {

            id: "ADMIN",

            name: ADMIN_REFERRAL_NAME,

            phone: "ADMIN",

            referralCode:
                ADMIN_REFERRAL_CODE,

            referredBy: "",

            isAdmin: true

        };

    }


    fixUsersReferralCodes();


    return getUsers().find(

        user =>

            String(
                user.referralCode || ""
            )
            .toUpperCase() === code

    ) || null;

}


/* =========================================================
   15. CREATE USER
========================================================= */

function createUser(
    name,
    phone,
    referralCode = ""
) {

    const users = getUsers();


    const existingUser =
        users.find(
            user => user.phone === phone
        );


    if (existingUser) {

        return existingUser;

    }


    const referrer =
        referralCode
        ? findUserByReferralCode(referralCode)
        : null;


    const newUser = {

        id:
            "USR" +
            Date.now() +
            Math.floor(Math.random() * 1000),

        name,

        phone,

        referralCode:
            generateUniqueReferralCode(
                name,
                users
            ),

        referredBy:

            referrer
            ? referrer.referralCode
            : "",

        totalCommission: 0,

        totalBookings: 0,

        createdAt:
            new Date().toISOString()

    };


    users.push(newUser);

    saveUsers(users);

    return newUser;

}


/* =========================================================
   16. REFERRAL LEVELS A B C
========================================================= */

function getReferralLevels(user) {

    const levels = {

        A: null,

        B: null,

        C: null

    };


    if (!user || !user.referredBy) {

        return levels;

    }


    let currentCode =
        user.referredBy;


    ["A", "B", "C"].forEach(level => {

        if (!currentCode) return;


        const referrer =
            findUserByReferralCode(
                currentCode
            );


        if (!referrer) return;


        levels[level] =
            referrer;


        currentCode =
            referrer.referredBy || "";

    });


    return levels;

}


/* =========================================================
   17. USER COMMISSIONS
========================================================= */

function getCommissions() {

    return getJSON(
        "roomrentCommissions",
        []
    );

}


function saveCommissions(data) {

    setJSON(
        "roomrentCommissions",
        data
    );

}


/* =========================================================
   18. ADMIN COMMISSIONS
========================================================= */

function getAdminCommissions() {

    return getJSON(
        "roomrentAdminCommissions",
        []
    );

}


function saveAdminCommissions(data) {

    setJSON(
        "roomrentAdminCommissions",
        data
    );

}


/* =========================================================
   19. DISPLAY ROOMS
========================================================= */

function onyeshaVyumba() {

    const container =
        document.getElementById("vyumba");

    if (!container) return;


    container.innerHTML = `

        <h2>🏠 Vyumba vya RoomRent</h2>

        <p>Chagua chumba unachotaka.</p>

        <div id="roomList"></div>

    `;


    const roomList =
        document.getElementById("roomList");


    rooms.forEach(room => {

        const image =
            getRoomImage(room.number);


        const card =
            document.createElement("div");


        card.className =
            "chumba room-card";


        card.innerHTML = `

            <div class="room-image-box">

                ${
                    image

                    ? `
                        <img
                            src="${image}"
                            class="room-image"
                        >
                    `

                    : `
                        <div class="room-placeholder">
                            🏠
                            <span>RoomRent</span>
                        </div>
                    `
                }

            </div>


            <div class="room-info">

                <h3>
                    🏠 Chumba ${room.number}
                </h3>


                <p>
                    ${room.description}
                </p>


                <p>
                    <strong>Bei:</strong>
                    ${formatMoney(room.price)}
                </p>


                <p>
                    <strong>Faida kwa siku:</strong>
                    ${formatMoney(room.profit)}
                </p>


                <p>
                    <strong>Muda:</strong>
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


        roomList.appendChild(card);

    });

}


/* =========================================================
   20. OPEN RENT FORM
========================================================= */

function funguaKodi(roomNumber) {

    const room =
        rooms.find(
            r => r.number === roomNumber
        );


    if (!room) return;


    const section =
        document.getElementById("fomuKodi");


    if (!section) return;


    section.style.display = "block";


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
        >


        <input
            type="tel"
            id="bookingPhone"
            placeholder="Namba ya simu"
        >


        <input
            type="text"
            id="referralCode"
            placeholder="Referral Code (si lazima)"
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
            💳 Endelea
        </button>

    `;


    section.scrollIntoView({
        behavior: "smooth"
    });

}


/* =========================================================
   21. CREATE BOOKING
========================================================= */

function tengenezaBooking(roomNumber) {

    const room =
        rooms.find(
            r => r.number === roomNumber
        );


    if (!room) return;


    const name =
        document.getElementById("bookingName")
        ?.value
        .trim();


    const phone =
        document.getElementById("bookingPhone")
        ?.value
        .trim();


    const referralCode =
        document.getElementById("referralCode")
        ?.value
        .trim()
        .toUpperCase();


    const paymentMethod =
        document.getElementById("paymentMethod")
        ?.value;


    if (!name || !phone || !paymentMethod) {

        alert(
            "⚠️ Tafadhali jaza taarifa zote."
        );

        return;

    }


    if (phone.length < 9) {

        alert(
            "⚠️ Ingiza namba sahihi."
        );

        return;

    }


    if (referralCode) {

        const referrer =
            findUserByReferralCode(
                referralCode
            );


        if (!referrer) {

            alert(
                "⚠️ Referral Code sio sahihi."
            );

            return;

        }

    }


    const user =
        createUser(
            name,
            phone,
            referralCode
        );


    const bookings =
        getJSON(
            "roomrentBookings",
            []
        );


    const bookingNumber =
        "RR" +
        Date.now()
        .toString()
        .slice(-8);


    const booking = {

        bookingNumber,

        userId:
            user.id,

        name,

        phone,

        roomNumber,

        price:
            room.price,

        profit:
            room.profit,

        days:
            room.days,

        paymentMethod,

        userReferralCode:
            user.referralCode,

        usedReferralCode:
            user.referredBy || "",

        paymentStatus:
            "Waiting",

        status:
            "Pending Payment",

        commissionProcessed:
            false,

        createdAt:
            new Date().toISOString()

    };


    bookings.push(booking);


    setJSON(
        "roomrentBookings",
        bookings
    );


    addNotification(

        phone,

        "Booking Imeundwa",

        `Booking ${bookingNumber} ya chumba ${roomNumber} imeundwa.`

    );


    funguaPaymentRequest(booking);

}


/* =========================================================
   22. PAYMENT REQUEST
========================================================= */

function funguaPaymentRequest(booking) {

    const section =
        document.getElementById("fomuKodi");


    if (!section) return;


    section.innerHTML = `

        <h2>💳 Lipa RoomRent</h2>


        <div class="booking-card">

            <p>
                📋 Booking:
                <strong>
                    ${booking.bookingNumber}
                </strong>
            </p>


            <p>
                🏠 Chumba:
                ${booking.roomNumber}
            </p>


            <p>
                💰 Kiasi:
                <strong>
                    ${formatMoney(booking.price)}
                </strong>
            </p>


            <p>
                📱 Njia:
                ${booking.paymentMethod}
            </p>

        </div>


        <h3>
            📱 Namba ya Kulipia
        </h3>


        <input
            type="tel"
            id="paymentPhone"
            value="${booking.phone}"
        >


        <button
            class="thibitishaBtn"
            onclick="tumaPaymentRequest('${booking.bookingNumber}')"
        >
            💳 Lipa Sasa
        </button>

    `;

}


/* =========================================================
   23. SEND PAYMENT REQUEST
========================================================= */

function tumaPaymentRequest(bookingNumber) {

    const paymentPhone =
        document.getElementById("paymentPhone")
        ?.value
        .trim();


    if (!paymentPhone) {

        alert(
            "Ingiza namba ya kulipia."
        );

        return;

    }


    const bookings =
        getJSON(
            "roomrentBookings",
            []
        );


    const booking =
        bookings.find(
            b => b.bookingNumber === bookingNumber
        );


    if (!booking) {

        return;

    }


    booking.paymentPhone =
        paymentPhone;


    booking.paymentStatus =
        "Requested";


    booking.status =
        "Waiting Confirmation";


    booking.paymentRequestedAt =
        new Date().toISOString();


    setJSON(
        "roomrentBookings",
        bookings
    );


    addNotification(

        booking.phone,

        "Malipo Yameombwa",

        `Ombi la malipo ya ${formatMoney(booking.price)} limepokelewa.`

    );


    showPaymentWaiting(booking);

}


/* =========================================================
   24. PAYMENT WAITING
========================================================= */

function showPaymentWaiting(booking) {

    const section =
        document.getElementById("fomuKodi");


    if (!section) return;


    section.innerHTML = `

        <h2>
            ⏳ Inasubiri Malipo
        </h2>


        <div class="booking-card">

            <p>
                📋 Booking:
                <strong>
                    ${booking.bookingNumber}
                </strong>
            </p>


            <p>
                💰 Kiasi:
                <strong>
                    ${formatMoney(booking.price)}
                </strong>
            </p>


            <p>
                📱 Namba:
                ${booking.paymentPhone}
            </p>


            <p>
                💳 Njia:
                ${booking.paymentMethod}
            </p>


            <hr>


            <p>
                Admin atathibitisha malipo yako.
            </p>

        </div>


        <button
            class="endeleaBtn"
            onclick="onyeshaBookingZangu()"
        >
            📋 Angalia Booking
        </button>

    `;

}


/* =========================================================
   25. BOOKINGS
========================================================= */

function onyeshaBookingZangu() {

    const phone =
        prompt(
            "📱 Ingiza namba yako ya simu:"
        );


    if (!phone) return;


    const bookings =
        getJSON(
            "roomrentBookings",
            []
        )
        .filter(
            b => b.phone === phone
        );


    const section =
        document.getElementById(
            "taarifaSection"
        );


    if (!section) return;


    section.style.display =
        "block";


    section.innerHTML = `

        <h2>
            📋 Booking Zangu
        </h2>


        ${
            !bookings.length

            ? `
                <p>
                    Hakuna booking iliyopatikana.
                </p>
            `

            : bookings.map(b => `

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
                        📌 ${b.status}
                    </p>


                    <p>
                        💳 ${b.paymentStatus}
                    </p>

                </div>

            `).join("")
        }

    `;


    section.scrollIntoView({
        behavior: "smooth"
    });

}


/* =========================================================
   26. ACCOUNT
========================================================= */

function funguaAccount() {

    const phone =
        prompt(
            "📱 Ingiza namba yako ya simu:"
        );


    if (!phone) return;


    fixUsersReferralCodes();


    const user =
        findUserByPhone(phone);


    if (!user) {

        alert(
            "Account haijapatikana. Tafadhali fanya booking kwanza."
        );

        return;

    }


    const bookings =
        getJSON(
            "roomrentBookings",
            []
        )
        .filter(
            b => b.phone === phone
        );


    const commissions =
        getCommissions()
        .filter(
            c => c.phone === phone
        );


    const totalCommission =
        commissions.reduce(

            (sum, c) =>
                sum + Number(c.amount || 0),

            0

        );


    const section =
        document.getElementById(
            "taarifaSection"
        );


    if (!section) return;


    section.style.display =
        "block";


    section.innerHTML = `

        <h2>👤 Account Yangu</h2>


        <div class="booking-card">

            <p>
                👤 Jina:
                <strong>
                    ${user.name}
                </strong>
            </p>


            <p>
                📱 Namba:
                ${user.phone}
            </p>


            <p>
                🔑 Referral Code:
                <strong>
                    ${user.referralCode}
                </strong>
            </p>


            <p>
                📋 Jumla ya Booking:
                ${bookings.length}
            </p>


            <p>
                💰 Total Commission:
                <strong>
                    ${formatMoney(totalCommission)}
                </strong>
            </p>


            <button
                class="endeleaBtn"
                onclick="onyeshaMyReferral('${phone}')"
            >
                🤝 Referral Zangu
            </button>


            <button
                class="endeleaBtn"
                onclick="onyeshaMyCommissions('${phone}')"
            >
                💰 Commission Zangu
            </button>


            <button
                class="endeleaBtn"
                onclick="onyeshaNotifications('${phone}')"
            >
                🔔 Taarifa Zangu
            </button>

        </div>

    `;


    section.scrollIntoView({
        behavior: "smooth"
    });

}


/* =========================================================
   27. MY REFERRALS
========================================================= */

function onyeshaMyReferral(phone) {

    fixUsersReferralCodes();


    const user =
        findUserByPhone(phone);


    if (!user) return;


    const users =
        getUsers();


    const levelA =
        users.filter(
            u => u.referredBy === user.referralCode
        );


    const levelB = [];

    const levelC = [];


    levelA.forEach(userA => {

        const children =
            users.filter(
                u =>
                    u.referredBy ===
                    userA.referralCode
            );

        levelB.push(...children);


        children.forEach(userB => {

            const grandchildren =
                users.filter(
                    u =>
                        u.referredBy ===
                        userB.referralCode
                );

            levelC.push(...grandchildren);

        });

    });


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
                🔑 Referral Code Yako:
                <strong>
                    ${user.referralCode}
                </strong>
            </p>


            <p>
                🅰️ Level A:
                <strong>
                    ${levelA.length}
                </strong>
            </p>


            <p>
                🅱️ Level B:
                <strong>
                    ${levelB.length}
                </strong>
            </p>


            <p>
                🅲 Level C:
                <strong>
                    ${levelC.length}
                </strong>
            </p>

        </div>


        <h3>
            🅰️ Level A
        </h3>

        ${
            levelA.length

            ? levelA.map(u => `

                <div class="booking-card">
                    👤 ${u.name}
                    <br>
                    📱 ${u.phone}
                </div>

            `).join("")

            : "<p>Hakuna referral Level A bado.</p>"
        }


        <h3>
            🅱️ Level B
        </h3>

        ${
            levelB.length

            ? levelB.map(u => `

                <div class="booking-card">
                    👤 ${u.name}
                    <br>
                    📱 ${u.phone}
                </div>

            `).join("")

            : "<p>Hakuna referral Level B bado.</p>"
        }


        <h3>
            🅲 Level C
        </h3>

        ${
            levelC.length

            ? levelC.map(u => `

                <div class="booking-card">
                    👤 ${u.name}
                    <br>
                    📱 ${u.phone}
                </div>

            `).join("")

            : "<p>Hakuna referral Level C bado.</p>"
        }

    `;

}


/* =========================================================
   28. USER COMMISSIONS
========================================================= */

function onyeshaMyCommissions(phone) {

    const commissions =
        getCommissions()
        .filter(
            c => c.phone === phone
        );


    const total =
        commissions.reduce(

            (sum, c) =>
                sum + Number(c.amount || 0),

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
                💰 Total:
                ${formatMoney(total)}
            </h3>

        </div>


        ${
            !commissions.length

            ? "<p>Bado hujapata commission.</p>"

            : commissions.map(c => `

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

                </div>

            `).join("")
        }

    `;

}


/* =========================================================
   29. NOTIFICATIONS
========================================================= */

function funguaTaarifa() {

    const phone =
        prompt(
            "📱 Ingiza namba yako ya simu:"
        );


    if (!phone) return;


    onyeshaNotifications(phone);

}


function onyeshaNotifications(phone) {

    const notifications =
        getNotifications()
        .filter(
            n => n.phone === phone
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

            ? "<p>Hakuna taarifa bado.</p>"

            : notifications.map(n => `

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

            `).join("")
        }

    `;

}


/* =========================================================
   30. PROCESS COMMISSIONS
========================================================= */

function processBookingCommissions(booking) {

    if (booking.commissionProcessed) {

        return;

    }


    fixUsersReferralCodes();


    const user =
        findUserByPhone(
            booking.phone
        );


    if (!user) {

        return;

    }


    const levels =
        getReferralLevels(user);


    const commissions =
        getCommissions();


    const adminCommissions =
        getAdminCommissions();


    ["A", "B", "C"].forEach(level => {

        const referrer =
            levels[level];


        /*
           Hakuna referral kwenye level
           hiyo = hakuna commission.
        */

        if (!referrer) {

            return;

        }


        /* =====================================
           USER COMMISSION
        ===================================== */

        if (!referrer.isAdmin) {

            const userPercent =
                USER_COMMISSION[level];


            const userAmount =

                Number(booking.price) *

                userPercent /

                100;


            commissions.push({

                id:
                    "COM" +
                    Date.now() +
                    Math.floor(Math.random() * 10000),

                bookingNumber:
                    booking.bookingNumber,

                phone:
                    referrer.phone,

                userName:
                    referrer.name,

                level,

                percent:
                    userPercent,

                amount:
                    userAmount,

                type:
                    "User Commission",

                createdAt:
                    new Date().toISOString()

            });


            /* UPDATE USER */

            const users =
                getUsers();


            const targetUser =
                users.find(
                    u => u.phone === referrer.phone
                );


            if (targetUser) {

                targetUser.totalCommission =

                    Number(
                        targetUser.totalCommission || 0
                    )

                    +

                    userAmount;

            }


            saveUsers(users);


            addNotification(

                referrer.phone,

                "Commission Mpya 💰",

                `Umepata ${userPercent}% commission ya ${formatMoney(userAmount)} kwenye Level ${level}.`

            );

        }


        /* =====================================
           ADMIN COMMISSION
        ===================================== */

        const adminPercent =
            ADMIN_COMMISSION[level];


        const adminAmount =

            Number(booking.price) *

            adminPercent /

            100;


        adminCommissions.push({

            id:
                "ADMCOM" +
                Date.now() +
                Math.floor(Math.random() * 10000),

            bookingNumber:
                booking.bookingNumber,

            level,

            percent:
                adminPercent,

            amount:
                adminAmount,

            createdAt:
                new Date().toISOString()

        });

    });


    saveCommissions(
        commissions
    );


    saveAdminCommissions(
        adminCommissions
    );


    booking.commissionProcessed =
        true;

}


/* =========================================================
   31. ADMIN LOGIN
========================================================= */

let adminLogoClicks = 0;

let adminLogoTimer = null;


function adminLogoClick() {

    adminLogoClicks++;


    clearTimeout(
        adminLogoTimer
    );


    adminLogoTimer =
        setTimeout(() => {

            adminLogoClicks = 0;

        }, 1500);


    if (adminLogoClicks >= 5) {

        adminLogoClicks = 0;

        funguaAdminLogin();

    }

}


function funguaAdminLogin() {

    const modal =
        document.getElementById(
            "adminLoginModal"
        );


    if (modal) {

        modal.style.display =
            "flex";

    }

}


function fungaAdminLogin() {

    const modal =
        document.getElementById(
            "adminLoginModal"
        );


    if (modal) {

        modal.style.display =
            "none";

    }

}


function adminLogin() {

    const username =
        document.getElementById(
            "adminUsername"
        )
        ?.value
        .trim();


    const password =
        document.getElementById(
            "adminPassword"
        )
        ?.value;


    if (

        username === "admin" &&

        password === "1234"

    ) {

        localStorage.setItem(
            "roomrentAdminLoggedIn",
            "true"
        );


        fungaAdminLogin();

        funguaAdmin();

    }

    else {

        alert(
            "❌ Username au password sio sahihi."
        );

    }

}


function isAdminLoggedIn() {

    return (

        localStorage.getItem(
            "roomrentAdminLoggedIn"
        )

        === "true"

    );

}


/* =========================================================
   32. ADMIN DASHBOARD
========================================================= */

function funguaAdmin() {

    if (!isAdminLoggedIn()) {

        funguaAdminLogin();

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
                👑 Karibu RoomRent Admin
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
                onclick="onyeshaAdminStatistics()"
            >
                📊 Statistics
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
                class="thibitishaBtn"
                onclick="adminLogout()"
            >
                🚪 Logout
            </button>

        </div>

    `;


    section.scrollIntoView({
        behavior: "smooth"
    });

}


/* =========================================================
   33. ADMIN BOOKINGS
========================================================= */

function onyeshaAdminBookings() {

    if (!isAdminLoggedIn()) {

        funguaAdminLogin();

        return;

    }


    const bookings =
        getJSON(
            "roomrentBookings",
            []
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


        <br><br>


        ${
            !bookings.length

            ? "<p>Hakuna booking bado.</p>"

            : bookings.map(b => `

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
                        💰 ${formatMoney(b.price)}
                    </p>


                    <p>
                        💳 ${b.paymentMethod}
                    </p>


                    <p>
                        📱 Payment Number:
                        ${b.paymentPhone || "-"}
                    </p>


                    <p>
                        🔑 Referral:
                        ${b.usedReferralCode || "Hakuna"}
                    </p>


                    <p>
                        📌 Booking:
                        <strong>
                            ${b.status}
                        </strong>
                    </p>


                    <p>
                        💰 Payment:
                        <strong>
                            ${b.paymentStatus}
                        </strong>
                    </p>


                    ${
                        b.status !== "Confirmed"

                        ? `

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

                        : `
                            <p>
                                ✅ Malipo yamethibitishwa
                            </p>
                        `
                    }

                </div>

            `).join("")
        }

    `;

}


/* =========================================================
   34. CONFIRM BOOKING
========================================================= */

function adminConfirmBooking(bookingNumber) {

    const bookings =
        getJSON(
            "roomrentBookings",
            []
        );


    const booking =
        bookings.find(
            b => b.bookingNumber === bookingNumber
        );


    if (!booking) return;


    booking.status =
        "Confirmed";


    booking.paymentStatus =
        "Paid";


    booking.confirmedAt =
        new Date().toISOString();


    processBookingCommissions(
        booking
    );


    setJSON(
        "roomrentBookings",
        bookings
    );


    addNotification(

        booking.phone,

        "Malipo Yamethibitishwa ✅",

        `Malipo ya ${formatMoney(booking.price)} yamethibitishwa.`

    );


    alert(
        "✅ Malipo na commissions yamethibitishwa!"
    );


    onyeshaAdminBookings();

}


/* =========================================================
   35. CANCEL BOOKING
========================================================= */

function adminCancelBooking(bookingNumber) {

    const bookings =
        getJSON(
            "roomrentBookings",
            []
        );


    const booking =
        bookings.find(
            b => b.bookingNumber === bookingNumber
        );


    if (!booking) return;


    booking.status =
        "Cancelled";


    booking.paymentStatus =
        "Cancelled";


    setJSON(
        "roomrentBookings",
        bookings
    );


    addNotification(

        booking.phone,

        "Booking Imefutwa",

        `Booking ${booking.bookingNumber} imefutwa.`

    );


    onyeshaAdminBookings();

}


/* =========================================================
   36. ADMIN COMMISSIONS
========================================================= */

function onyeshaAdminCommissions() {

    if (!isAdminLoggedIn()) {

        funguaAdminLogin();

        return;

    }


    const adminCommissions =
        getAdminCommissions();


    const userCommissions =
        getCommissions();


    const adminTotal =
        adminCommissions.reduce(

            (sum, c) =>
                sum + Number(c.amount || 0),

            0

        );


    const userTotal =
        userCommissions.reduce(

            (sum, c) =>
                sum + Number(c.amount || 0),

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
                🅰️ Level A: 20%
            </p>


            <p>
                🅱️ Level B: 10%
            </p>


            <p>
                🅲 Level C: 5%
            </p>


            <p>
                💰 Total:
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
                💰 Total:
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

            ? "<p>Hakuna commission bado.</p>"

            : adminCommissions.map(c => `

                <div class="booking-card">

                    <p>
                        📋 Booking:
                        ${c.bookingNumber}
                    </p>


                    <p>
                        🅰️🅱️🅲 Level:
                        ${c.level}
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

                </div>

            `).join("")
        }

    `;

}


/* =========================================================
   37. ADMIN REFERRALS
========================================================= */

function onyeshaAdminReferrals() {

    if (!isAdminLoggedIn()) {

        funguaAdminLogin();

        return;

    }


    fixUsersReferralCodes();


    const users =
        getUsers();


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


        <br><br>


        <div class="booking-card">

            <p>
                👑 Admin Referral Code:
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

            ? "<p>Hakuna users bado.</p>"

            : users.map(user => `

                <div class="booking-card">

                    <h3>
                        👤 ${user.name}
                    </h3>


                    <p>
                        📱 ${user.phone}
                    </p>


                    <p>
                        🔑 Referral Code:
                        <strong>
                            ${user.referralCode}
                        </strong>
                    </p>


                    <p>
                        🤝 Referred By:
                        ${user.referredBy || "-"}
                    </p>


                    <p>
                        💰 Commission:
                        ${formatMoney(user.totalCommission)}
                    </p>

                </div>

            `).join("")
        }

    `;

}


/* =========================================================
   38. ADMIN STATISTICS
========================================================= */

function onyeshaAdminStatistics() {

    if (!isAdminLoggedIn()) {

        funguaAdminLogin();

        return;

    }


    const bookings =
        getJSON(
            "roomrentBookings",
            []
        );


    const users =
        getUsers();


    const confirmed =
        bookings.filter(
            b => b.status === "Confirmed"
        );


    const pending =
        bookings.filter(
            b => b.status !== "Confirmed"
        );


    const revenue =
        confirmed.reduce(

            (sum, b) =>
                sum + Number(b.price || 0),

            0

        );


    const adminTotal =
        getAdminCommissions()
        .reduce(

            (sum, c) =>
                sum + Number(c.amount || 0),

            0

        );


    const userTotal =
        getCommissions()
        .reduce(

            (sum, c) =>
                sum + Number(c.amount || 0),

            0

        );


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
                ⏳ Pending:
                <strong>
                    ${pending.length}
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
   39. ADMIN LOGOUT
========================================================= */

function adminLogout() {

    localStorage.removeItem(
        "roomrentAdminLoggedIn"
    );


    location.reload();

}


/* =========================================================
   40. INITIALIZE
========================================================= */

document.addEventListener(

    "DOMContentLoaded",

    () => {


        /* FIX OLD USERS */

        fixUsersReferralCodes();


        /* DISPLAY ROOMS */

        onyeshaVyumba();


        /* ADMIN LOGO */

        const logo =
            document.getElementById(
                "roomrentLogo"
            );


        if (logo) {

            logo.addEventListener(
                "click",
                adminLogoClick
            );

        }


        /* VIEW ROOMS */

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
                        behavior: "smooth"
                    });

                };

        }


        /* BOOKINGS */

        const booking =
            document.getElementById(
                "bookingZangu"
            );


        if (booking) {

            booking.onclick =
                onyeshaBookingZangu;

        }


        /* ACCOUNT */

        const account =
            document.getElementById(
                "accountBtn"
            );


        if (account) {

            account.onclick =
                funguaAccount;

        }


        /* NOTIFICATIONS */

        const taarifa =
            document.getElementById(
                "taarifaBtn"
            );


        if (taarifa) {

            taarifa.onclick =
                funguaTaarifa;

        }

    }

);


/* =========================================================
   MWISHO WA ROOMRENT SCRIPT
========================================================= */
