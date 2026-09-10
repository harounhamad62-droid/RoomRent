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
        description: "Chumba chenye mpango mkubwa wa RoomRent."
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

    A: 80,
    B: 70,
    C: 30

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
   4. PAYMENT SETTINGS
========================================================= */

const DEFAULT_PAYMENT_SETTINGS = {

    airtel: {

        name: "HARUNA ISSA HAMAD",

        phone: "0667872515"

    },


    mixx: {

        name: "HARUNA ISSA HAMAD",

        phone: "0651590936"

    }

};


/* =========================================================
   5. WITHDRAWAL SETTINGS
========================================================= */

const MINIMUM_WITHDRAWAL = 2400;

const WITHDRAWAL_FEE_PERCENT = 8;


/* =========================================================
   6. STORAGE FUNCTIONS
========================================================= */

function getJSON(key, fallback = []) {

    try {

        const data =
            localStorage.getItem(key);

        return data
            ? JSON.parse(data)
            : fallback;

    }

    catch (error) {

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
   7. FORMAT MONEY
========================================================= */

function formatMoney(amount) {

    return Number(amount || 0)
        .toLocaleString("sw-TZ") + " TSh";

}


/* =========================================================
   8. FORMAT DATE
========================================================= */

function formatDate(date) {

    if (!date) {

        return "-";

    }

    try {

        return new Date(date)
            .toLocaleString("sw-TZ");

    }

    catch {

        return "-";

    }

}


/* =========================================================
   9. PAYMENT SETTINGS
========================================================= */

function getPaymentSettings() {

    return getJSON(

        "roomrentPaymentSettings",

        DEFAULT_PAYMENT_SETTINGS

    );

}


function getPaymentDetails(method) {

    const settings =
        getPaymentSettings();


    if (method === "Airtel Money") {

        return settings.airtel;

    }


    if (method === "MIXX BY YAS") {

        return settings.mixx;

    }


    return null;

}


/* =========================================================
   10. ROOM IMAGES
========================================================= */

function getRoomImages() {

    return getJSON(

        "roomrentRoomImages",

        {}

    );

}


function getRoomImage(roomNumber) {

    const images =
        getRoomImages();

    return images[roomNumber] || "";

}


/* =========================================================
   11. NOTIFICATIONS
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

            Math.floor(
                Math.random() * 1000
            ),

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
   12. USERS
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
   13. GENERATE REFERRAL CODE
========================================================= */

function generateUniqueReferralCode(
    name,
    users,
    currentPhone = ""
) {

    let cleanName =

        String(name || "USER")

        .replace(
            /[^a-zA-Z]/g,
            ""
        )

        .toUpperCase()

        .substring(0, 5);


    if (!cleanName) {

        cleanName = "USER";

    }


    let code = "";


    do {

        const random =

            Math.floor(
                1000 +
                Math.random() * 9000
            );


        code =
            cleanName +
            random;

    }

    while (

        users.some(

            user =>

                user.phone !==
                currentPhone &&

                user.referralCode ===
                code

        )

    );


    return code;

}


/* =========================================================
   14. FIX OLD USERS
========================================================= */

function fixUsersReferralCodes() {

    const users =
        getUsers();

    let changed =
        false;


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

            user.totalCommission ===
            undefined

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
   15. FIND USER BY PHONE
========================================================= */

function findUserByPhone(phone) {

    fixUsersReferralCodes();


    return getUsers().find(

        user =>
            user.phone === phone

    );

}


/* =========================================================
   16. FIND USER BY REFERRAL CODE
========================================================= */

function findUserByReferralCode(code) {

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

            id: "ADMIN",

            name:
                ADMIN_REFERRAL_NAME,

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

            .toUpperCase() ===
            code

    ) || null;

}


/* =========================================================
   17. CREATE USER
========================================================= */

function createUser(
    name,
    phone,
    referralCode = ""
) {

    const users =
        getUsers();


    const existingUser =

        users.find(

            user =>
                user.phone === phone

        );


    if (existingUser) {

        return existingUser;

    }


    const referrer =

        referralCode

        ? findUserByReferralCode(
            referralCode
        )

        : null;


    const newUser = {

        id:

            "USR" +

            Date.now() +

            Math.floor(
                Math.random() * 1000
            ),

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
   18. GET REFERRAL LEVELS
========================================================= */

function getReferralLevels(user) {

    const levels = {

        A: null,

        B: null,

        C: null

    };


    if (

        !user ||

        !user.referredBy

    ) {

        return levels;

    }


    let currentCode =
        user.referredBy;


    ["A", "B", "C"]
        .forEach(level => {


            if (!currentCode) {

                return;

            }


            const referrer =

                findUserByReferralCode(
                    currentCode
                );


            if (!referrer) {

                return;

            }


            levels[level] =
                referrer;


            currentCode =

                referrer.referredBy || "";

        });


    return levels;

}


/* =========================================================
   19. USER COMMISSIONS
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
   20. ADMIN COMMISSIONS
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
   21. WITHDRAWALS
========================================================= */

function getWithdrawals() {

    return getJSON(

        "roomrentWithdrawals",

        []

    );

}


function saveWithdrawals(data) {

    setJSON(

        "roomrentWithdrawals",

        data

    );

}


/* =========================================================
   22. DISPLAY ROOMS
========================================================= */

function onyeshaVyumba() {

    const container =
        document.getElementById("vyumba");


    if (!container) {

        return;

    }


    container.innerHTML = `

        <h2>
            🏠 Vyumba vya RoomRent
        </h2>

        <p>
            Chagua chumba unachotaka.
        </p>

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

                            <span>
                                RoomRent
                            </span>

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


        roomList.appendChild(card);

    });

}


/* =========================================================
   23. OPEN RENT FORM
========================================================= */

function funguaKodi(roomNumber) {

    const room =

        rooms.find(

            r =>
                r.number === roomNumber

        );


    if (!room) {

        return;

    }


    const section =
        document.getElementById("fomuKodi");


    if (!section) {

        return;

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

            💳 Endelea Kulipa

        </button>

    `;


    section.scrollIntoView({

        behavior: "smooth"

    });

}


/* =========================================================
   24. CREATE BOOKING
========================================================= */

function tengenezaBooking(roomNumber) {

    const room =

        rooms.find(

            r =>
                r.number === roomNumber

        );


    if (!room) {

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
        .getElementById("referralCode")
        ?.value
        .trim()
        .toUpperCase();


    const paymentMethod =

        document
        .getElementById("paymentMethod")
        ?.value;


    if (

        !name ||

        !phone ||

        !paymentMethod

    ) {

        alert(
            "⚠️ Tafadhali jaza taarifa zote."
        );

        return;

    }


    if (

        phone.length < 9

    ) {

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
            "Waiting Payment",

        status:
            "Pending Payment",

        transactionNumber: "",

        receiverName: "",

        receiverPhone: "",

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


    funguaPaymentRequest(
        booking
    );

}


/* =========================================================
   25. PAYMENT REQUEST
========================================================= */

function funguaPaymentRequest(booking) {

    const section =
        document.getElementById("fomuKodi");


    if (!section) {

        return;

    }


    const paymentDetails =

        getPaymentDetails(
            booking.paymentMethod
        );


    if (!paymentDetails) {

        alert(
            "Njia ya malipo haijapatikana."
        );

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

                💰 Kiasi cha Kulipa:

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

                👤 Jina la Mpokeaji:

                <strong>
                    ${paymentDetails.name}
                </strong>

            </p>


            <p>
                📱 Namba ya Kulipia:
            </p>


            <h2>
                ${paymentDetails.phone}
            </h2>


            <p>
                ⚠️ Hakikisha jina la mpokeaji
                ni sahihi kabla ya kutuma malipo.
            </p>

        </div>


        <div class="booking-card">

            <h3>
                📝 Baada ya Kulipa
            </h3>


            <p>
                Baada ya kutuma pesa,
                ingiza namba ya muamala.
            </p>


            <input
                type="text"
                id="transactionNumber"
                placeholder="Namba ya Muamala / Transaction ID"
            >


            <button
                class="thibitishaBtn"
                onclick="tumaPaymentRequest('${booking.bookingNumber}')"
            >

                ✅ Nimetuma Malipo

            </button>

        </div>

    `;


    section.scrollIntoView({

        behavior: "smooth"

    });

}


/* =========================================================
   26. SEND PAYMENT REQUEST
========================================================= */

function tumaPaymentRequest(bookingNumber) {

    const transactionNumber =

        document
        .getElementById("transactionNumber")
        ?.value
        .trim();


    if (!transactionNumber) {

        alert(
            "⚠️ Tafadhali ingiza namba ya muamala."
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

            b =>
                b.bookingNumber ===
                bookingNumber

        );


    if (!booking) {

        alert(
            "Booking haijapatikana."
        );

        return;

    }


    const paymentDetails =

        getPaymentDetails(
            booking.paymentMethod
        );


    booking.transactionNumber =
        transactionNumber;


    booking.receiverName =
        paymentDetails.name;


    booking.receiverPhone =
        paymentDetails.phone;


    booking.paymentStatus =
        "Waiting Confirmation";


    booking.status =
        "Payment Submitted";


    booking.paymentRequestedAt =
        new Date().toISOString();


    setJSON(

        "roomrentBookings",

        bookings

    );


    addNotification(

        booking.phone,

        "Malipo Yametumwa ⏳",

        `Tumepokea taarifa yako ya malipo ya ${formatMoney(booking.price)}. Admin atakagua muamala wako.`

    );


    showPaymentWaiting(
        booking
    );

}


/* =========================================================
   27. PAYMENT WAITING
========================================================= */

function showPaymentWaiting(booking) {

    const section =
        document.getElementById("fomuKodi");


    if (!section) {

        return;

    }


    section.innerHTML = `

        <h2>
            ⏳ Malipo Yanasubiri Uthibitisho
        </h2>


        <div class="booking-card">

            <p>

                📋 Booking:

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


            <p>

                💳 Njia:

                <strong>
                    ${booking.paymentMethod}
                </strong>

            </p>


            <p>

                📝 Transaction Number:

                <strong>
                    ${booking.transactionNumber}
                </strong>

            </p>


            <hr>


            <p>
                ⏳ Admin anakagua malipo yako.
            </p>

        </div>


        <button
            class="endeleaBtn"
            onclick="onyeshaBookingZangu()"
        >

            📋 Angalia Booking Zangu

        </button>

    `;

}


/* =========================================================
   28. SHOW BOOKINGS
========================================================= */

function onyeshaBookingZangu() {

    const phone =

        prompt(
            "📱 Ingiza namba yako ya simu:"
        );


    if (!phone) {

        return;

    }


    const bookings =

        getJSON(

            "roomrentBookings",

            []

        )

        .filter(

            b =>
                b.phone === phone

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
                        💰 ${formatMoney(b.price)}
                    </p>


                    <p>
                        📌 ${b.status}
                    </p>


                    <p>
                        💳 ${b.paymentStatus}
                    </p>


                    ${

                        b.transactionNumber

                        ? `

                            <p>

                                📝 Transaction:

                                <strong>
                                    ${b.transactionNumber}
                                </strong>

                            </p>

                        `

                        : ""

                    }

                </div>

            `).join("")

        }

    `;


    section.scrollIntoView({

        behavior: "smooth"

    });

}


/* =========================================================
   29. CALCULATE BOOKING PROFIT
========================================================= */

function calculateBookingProfit(booking) {

    if (

        booking.status !==
        "Confirmed" ||

        !booking.confirmedAt

    ) {

        return 0;

    }


    const startDate =
        new Date(
            booking.confirmedAt
        );


    const today =
        new Date();


    const difference =
        today - startDate;


    let daysPassed =

        Math.floor(

            difference /

            (1000 * 60 * 60 * 24)

        );


    if (daysPassed < 0) {

        daysPassed = 0;

    }


    const maximumDays =
        Number(booking.days || 0);


    if (

        daysPassed >
        maximumDays

    ) {

        daysPassed =
            maximumDays;

    }


    return (

        Number(
            booking.profit || 0
        )

        *

        daysPassed

    );

}


/* =========================================================
   30. USER PROFIT
========================================================= */

function getUserProfit(phone) {

    const bookings =

        getJSON(

            "roomrentBookings",

            []

        )

        .filter(

            booking =>

                booking.phone ===
                phone &&

                booking.status ===
                "Confirmed"

        );


    return bookings.reduce(

        (total, booking) =>

            total +

            calculateBookingProfit(
                booking
            ),

        0

    );

}


/* =========================================================
   31. USER COMMISSION BALANCE
========================================================= */

function getUserCommissionBalance(phone) {

    return getCommissions()

        .filter(

            commission =>

                commission.phone ===
                phone

        )

        .reduce(

            (total, commission) =>

                total +

                Number(
                    commission.amount || 0
                ),

            0

        );

}


/* =========================================================
   32. COMPLETED WITHDRAWALS
========================================================= */

function getUserCompletedWithdrawals(phone) {

    return getWithdrawals()

        .filter(

            withdrawal =>

                withdrawal.phone ===
                phone &&

                withdrawal.status ===
                "Paid"

        )

        .reduce(

            (total, withdrawal) =>

                total +

                Number(
                    withdrawal.amount || 0
                ),

            0

        );

}


/* =========================================================
   33. PENDING WITHDRAWALS
========================================================= */

function getUserPendingWithdrawals(phone) {

    return getWithdrawals()

        .filter(

            withdrawal =>

                withdrawal.phone ===
                phone &&

                withdrawal.status ===
                "Pending"

        )

        .reduce(

            (total, withdrawal) =>

                total +

                Number(
                    withdrawal.amount || 0
                ),

            0

        );

}


/* =========================================================
   34. USER TOTAL BALANCE
========================================================= */

function getUserTotalBalance(phone) {

    const profit =
        getUserProfit(phone);


    const commission =
        getUserCommissionBalance(phone);


    const paid =
        getUserCompletedWithdrawals(phone);


    const pending =
        getUserPendingWithdrawals(phone);


    const total =

        profit +

        commission -

        paid -

        pending;


    return total > 0
        ? total
        : 0;

}


/* =========================================================
   35. ACCOUNT
========================================================= */

function funguaAccount() {

    const phone =

        prompt(
            "📱 Ingiza namba yako ya simu:"
        );


    if (!phone) {

        return;

    }


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

            b =>
                b.phone === phone

        );


    const profit =
        getUserProfit(phone);


    const commission =
        getUserCommissionBalance(phone);


    const balance =
        getUserTotalBalance(phone);


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
            👤 Account Yangu
        </h2>


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

                📈 Faida:

                <strong>
                    ${formatMoney(profit)}
                </strong>

            </p>


            <p>

                💰 Commission:

                <strong>
                    ${formatMoney(commission)}
                </strong>

            </p>


            <p>

                💵 Balance:

                <strong>
                    ${formatMoney(balance)}
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
                class="thibitishaBtn"
                onclick="funguaWithdrawal('${phone}')"
            >

                💸 Withdrawal

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
   36. MY REFERRALS
========================================================= */

function onyeshaMyReferral(phone) {

    const user =
        findUserByPhone(phone);


    if (!user) {

        return;

    }


    const users =
        getUsers();


    const levelA =

        users.filter(

            u =>

                u.referredBy ===
                user.referralCode

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


        levelB.push(
            ...children
        );


        children.forEach(userB => {

            const grandchildren =

                users.filter(

                    u =>

                        u.referredBy ===
                        userB.referralCode

                );


            levelC.push(
                ...grandchildren
            );

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

            : `
                <p>
                    Hakuna referral Level A bado.
                </p>
            `

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

            : `
                <p>
                    Hakuna referral Level B bado.
                </p>
            `

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

            : `
                <p>
                    Hakuna referral Level C bado.
                </p>
            `

        }

    `;

}


/* =========================================================
   37. MY COMMISSIONS
========================================================= */

function onyeshaMyCommissions(phone) {

    const commissions =

        getCommissions()

        .filter(

            c =>
                c.phone === phone

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

                💰 Total:

                ${formatMoney(total)}

            </h3>


            <p>
                ℹ️ Commission ya referral
                inatolewa mara moja kwa
                referred user kwa kila level.
            </p>

        </div>


        ${

            !commissions.length

            ? `
                <p>
                    Bado hujapata commission.
                </p>
            `

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
   38. WITHDRAWAL PAGE
========================================================= */

function funguaWithdrawal(phone = "") {

    if (!phone) {

        phone = prompt(
            "📱 Ingiza namba yako ya simu:"
        );

    }


    if (!phone) {

        return;

    }


    const user =
        findUserByPhone(phone);


    if (!user) {

        alert(
            "⚠️ Account haijapatikana."
        );

        return;

    }


    const profit =
        getUserProfit(phone);


    const commission =
        getUserCommissionBalance(phone);


    const paid =
        getUserCompletedWithdrawals(phone);


    const pending =
        getUserPendingWithdrawals(phone);


    const balance =
        getUserTotalBalance(phone);


    const section =
        document.getElementById(
            "taarifaSection"
        );


    section.style.display =
        "block";


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
                👤 ${user.name}
            </h3>


            <p>

                📈 Faida:

                <strong>
                    ${formatMoney(profit)}
                </strong>

            </p>


            <p>

                🤝 Commission:

                <strong>
                    ${formatMoney(commission)}
                </strong>

            </p>


            <p>

                ⏳ Withdrawal Inayosubiri:

                <strong>
                    ${formatMoney(pending)}
                </strong>

            </p>


            <p>

                💸 Jumla Iliyotolewa:

                <strong>
                    ${formatMoney(paid)}
                </strong>

            </p>


            <hr>


            <h3>
                💰 Balance Inayopatikana
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

                Minimum Withdrawal:

                <strong>
                    ${formatMoney(MINIMUM_WITHDRAWAL)}
                </strong>

            </p>


            <p>

                📉 Makato ya huduma:

                <strong>
                    ${WITHDRAWAL_FEE_PERCENT}%
                </strong>

            </p>


            <p>
                ⚠️ Kila withdrawal
                inakatwa makato ya huduma
                ya 8%.
            </p>


            <input
                type="number"
                id="withdrawAmount"
                placeholder="Kiasi unachotaka kutoa"
                oninput="hesabuWithdrawalMakato()"
            >


            <div
                id="withdrawCalculation"
                class="booking-card"
                style="display:none;"
            >

                <p>

                    💰 Kiasi cha Withdrawal:

                    <strong id="grossAmount">
                        0 TSh
                    </strong>

                </p>


                <p>

                    📉 Makato 8%:

                    <strong id="withdrawFee">
                        0 TSh
                    </strong>

                </p>


                <hr>


                <p>

                    📱 Utakachopokea:

                    <strong id="netAmount">
                        0 TSh
                    </strong>

                </p>

            </div>


            <input
                type="tel"
                id="withdrawPhone"
                value="${phone}"
                placeholder="Namba ya kupokea pesa"
            >


            <select
                id="withdrawMethod"
            >

                <option value="">
                    Chagua njia ya kupokea
                </option>


                <option value="Airtel Money">
                    🔴 Airtel Money
                </option>


                <option value="MIXX BY YAS">
                    🔵 MIXX BY YAS
                </option>

            </select>


            <button
                class="thibitishaBtn"
                onclick="tumaWithdrawal('${phone}')"
            >

                💸 Omba Withdrawal

            </button>


            <p
                style="
                    margin-top:20px;
                    font-weight:bold;
                "
            >

                ⏳ Withdrawal yako itafika kati
                ya dakika 1 hadi saa 12 baada
                ya kuthibitishwa.

            </p>

        </div>


        <h3>
            📋 Withdrawal Zako
        </h3>


        ${onyeshaWithdrawalHistory(phone)}

    `;


    section.scrollIntoView({

        behavior: "smooth"

    });

}


/* =========================================================
   39. WITHDRAWAL CALCULATION
========================================================= */

function hesabuWithdrawalMakato() {

    const amount =

        Number(

            document
            .getElementById("withdrawAmount")
            ?.value

        );


    const calculation =
        document.getElementById(
            "withdrawCalculation"
        );


    if (

        !amount ||

        amount <= 0

    ) {

        if (calculation) {

            calculation.style.display =
                "none";

        }

        return;

    }


    const fee =

        amount *

        WITHDRAWAL_FEE_PERCENT /

        100;


    const netAmount =

        amount -

        fee;


    calculation.style.display =
        "block";


    document
    .getElementById("grossAmount")
    .textContent =
        formatMoney(amount);


    document
    .getElementById("withdrawFee")
    .textContent =
        formatMoney(fee);


    document
    .getElementById("netAmount")
    .textContent =
        formatMoney(netAmount);

}


/* =========================================================
   40. WITHDRAWAL HISTORY
========================================================= */

function onyeshaWithdrawalHistory(phone) {

    const withdrawals =

        getWithdrawals()

        .filter(

            withdrawal =>

                withdrawal.phone ===
                phone

        )

        .sort(

            (a, b) =>

                new Date(b.createdAt) -

                new Date(a.createdAt)

        );


    if (!withdrawals.length) {

        return `

            <p>
                Hakuna withdrawal bado.
            </p>

        `;

    }


    return withdrawals.map(

        withdrawal => `

            <div class="booking-card">

                <p>

                    💰 Kiasi:

                    <strong>
                        ${formatMoney(
                            withdrawal.amount
                        )}
                    </strong>

                </p>


                <p>

                    📉 Makato 8%:

                    <strong>
                        ${formatMoney(
                            withdrawal.fee
                        )}
                    </strong>

                </p>


                <p>

                    📱 Utapokea:

                    <strong>
                        ${formatMoney(
                            withdrawal.netAmount
                        )}
                    </strong>

                </p>


                <p>
                    📱 Namba:
                    ${withdrawal.withdrawPhone}
                </p>


                <p>
                    💳 Njia:
                    ${withdrawal.method}
                </p>


                <p>

                    📌 Status:

                    <strong>
                        ${withdrawal.status}
                    </strong>

                </p>


                <p>

                    📅 Tarehe:

                    ${formatDate(
                        withdrawal.createdAt
                    )}

                </p>


                ${

                    withdrawal.adminNote

                    ? `

                        <p>

                            📝 Maelezo:

                            ${withdrawal.adminNote}

                        </p>

                    `

                    : ""

                }

            </div>

        `

    ).join("");

}


/* =========================================================
   41. SEND WITHDRAWAL
========================================================= */

function tumaWithdrawal(userPhone) {

    const amount =

        Number(

            document
            .getElementById("withdrawAmount")
            ?.value

        );


    const withdrawPhone =

        document
        .getElementById("withdrawPhone")
        ?.value
        .trim();


    const method =

        document
        .getElementById("withdrawMethod")
        ?.value;


    if (

        !amount ||

        !withdrawPhone ||

        !method

    ) {

        alert(
            "⚠️ Tafadhali jaza taarifa zote."
        );

        return;

    }


    if (

        amount <
        MINIMUM_WITHDRAWAL

    ) {

        alert(

            `⚠️ Kiwango cha chini cha withdrawal ni ${formatMoney(MINIMUM_WITHDRAWAL)}`

        );

        return;

    }


    if (

        withdrawPhone.length < 9

    ) {

        alert(
            "⚠️ Ingiza namba sahihi."
        );

        return;

    }


    const balance =

        getUserTotalBalance(
            userPhone
        );


    if (

        amount >
        balance

    ) {

        alert(
            "⚠️ Kiasi unachotaka kutoa kinazidi balance yako."
        );

        return;

    }


    const fee =

        amount *

        WITHDRAWAL_FEE_PERCENT /

        100;


    const netAmount =

        amount -

        fee;


    const confirmation =

        confirm(

            `💸 THIBITISHA WITHDRAWAL\n\n` +

            `Kiasi: ${formatMoney(amount)}\n` +

            `Makato 8%: ${formatMoney(fee)}\n` +

            `Utapokea: ${formatMoney(netAmount)}\n\n` +

            `Je unataka kuendelea?`

        );


    if (!confirmation) {

        return;

    }


    const withdrawals =
        getWithdrawals();


    const withdrawal = {

        id:

            "WD" +

            Date.now() +

            Math.floor(
                Math.random() * 1000
            ),

        phone:
            userPhone,

        withdrawPhone,

        method,

        amount,

        fee,

        feePercent:
            WITHDRAWAL_FEE_PERCENT,

        netAmount,

        status:
            "Pending",

        adminNote:
            "",

        createdAt:
            new Date().toISOString()

    };


    withdrawals.unshift(
        withdrawal
    );


    saveWithdrawals(
        withdrawals
    );


    addNotification(

        userPhone,

        "Withdrawal Imepokelewa 💸",

        `Ombi lako la withdrawal ya ${formatMoney(amount)} limepokelewa. Makato ya 8% ni ${formatMoney(fee)} na utapokea ${formatMoney(netAmount)}. Withdrawal yako itafika kati ya dakika 1 hadi saa 12 baada ya kuthibitishwa.`

    );


    alert(

        `✅ Withdrawal imepokelewa!\n\n` +

        `Utaondoa: ${formatMoney(amount)}\n` +

        `Makato 8%: ${formatMoney(fee)}\n` +

        `Utapokea: ${formatMoney(netAmount)}\n\n` +

        `⏳ Withdrawal yako itafika kati ya dakika 1 hadi saa 12 baada ya kuthibitishwa.`

    );


    funguaWithdrawal(
        userPhone
    );

}


/* =========================================================
   42. NOTIFICATIONS
========================================================= */

function funguaTaarifa() {

    const phone =

        prompt(
            "📱 Ingiza namba yako ya simu:"
        );


    if (!phone) {

        return;

    }


    onyeshaNotifications(
        phone
    );

}


function onyeshaNotifications(phone) {

    const notifications =

        getNotifications()

        .filter(

            n =>
                n.phone === phone

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

            ? `
                <p>
                    Hakuna taarifa bado.
                </p>
            `

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
   43. PROCESS COMMISSIONS
========================================================= */

function processBookingCommissions(booking) {

    if (

        booking.commissionProcessed

    ) {

        return;

    }


    const user =

        findUserByPhone(
            booking.phone
        );


    if (!user) {

        return;

    }


    const levels =

        getReferralLevels(
            user
        );


    const commissions =
        getCommissions();


    const adminCommissions =
        getAdminCommissions();


    /* =============================================
       USER COMMISSION

       User commission:
       Inatolewa mara moja kwa referred user.
    ============================================= */

    ["A", "B", "C"]
        .forEach(level => {


            const referrer =
                levels[level];


            if (

                !referrer ||

                referrer.isAdmin

            ) {

                return;

            }


            const alreadyPaid =

                commissions.some(

                    commission =>

                        commission.phone ===
                        referrer.phone &&

                        commission.referredUserPhone ===
                        booking.phone &&

                        commission.level ===
                        level

                );


            if (alreadyPaid) {

                return;

            }


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

                    Math.floor(
                        Math.random() * 10000
                    ),

                bookingNumber:
                    booking.bookingNumber,

                phone:
                    referrer.phone,

                userName:
                    referrer.name,

                referredUserPhone:
                    booking.phone,

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


            const users =
                getUsers();


            const targetUser =

                users.find(

                    u =>
                        u.phone ===
                        referrer.phone

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

        });


    /* =============================================
       ADMIN COMMISSION

       Admin commission:
       Bila kikomo kwa kila booking
       iliyothibitishwa.
    ============================================= */

    ["A", "B", "C"]
        .forEach(level => {


            const referrer =
                levels[level];


            if (!referrer) {

                return;

            }


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

                    Math.floor(
                        Math.random() * 10000
                    ),

                bookingNumber:
                    booking.bookingNumber,

                customerPhone:
                    booking.phone,

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
   44. ADMIN LOGIN
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


    if (

        adminLogoClicks >= 5

    ) {

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

        document
        .getElementById("adminUsername")
        ?.value
        .trim();


    const password =

        document
        .getElementById("adminPassword")
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
   45. ADMIN DASHBOARD
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
                onclick="onyeshaAdminWithdrawals()"
            >

                💸 Manage Withdrawals

            </button>


            <button
                class="kodiBtn"
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
   46. ADMIN BOOKINGS
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

            ? `
                <p>
                    Hakuna booking bado.
                </p>
            `

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

                        📝 Transaction:

                        <strong>
                            ${b.transactionNumber || "Bado"}
                        </strong>

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

                        b.status !==
                        "Confirmed" &&

                        b.status !==
                        "Cancelled"

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
                                ${

                                    b.status ===
                                    "Confirmed"

                                    ? "✅ Malipo yamethibitishwa"

                                    : "❌ Booking imefutwa"

                                }
                            </p>

                        `

                    }

                </div>

            `).join("")

        }

    `;

}


/* =========================================================
   47. CONFIRM BOOKING
========================================================= */

function adminConfirmBooking(bookingNumber) {

    const bookings =

        getJSON(

            "roomrentBookings",

            []

        );


    const booking =

        bookings.find(

            b =>
                b.bookingNumber ===
                bookingNumber

        );


    if (!booking) {

        return;

    }


    if (

        booking.status ===
        "Confirmed"

    ) {

        alert(
            "Booking hii tayari imethibitishwa."
        );

        return;

    }


    booking.status =
        "Confirmed";


    booking.paymentStatus =
        "Paid";


    booking.confirmedAt =
        new Date().toISOString();


    processBookingCommissions(
        booking
    );


    const users =
        getUsers();


    const user =

        users.find(

            u =>
                u.phone ===
                booking.phone

        );


    if (user) {

        user.totalBookings =

            Number(
                user.totalBookings || 0
            )

            + 1;

        saveUsers(users);

    }


    setJSON(

        "roomrentBookings",

        bookings

    );


    addNotification(

        booking.phone,

        "Malipo Yamethibitishwa ✅",

        `Malipo ya ${formatMoney(booking.price)} yamethibitishwa. Booking yako sasa imeanza.`

    );


    alert(
        "✅ Malipo yamethibitishwa!"
    );


    onyeshaAdminBookings();

}


/* =========================================================
   48. CANCEL BOOKING
========================================================= */

function adminCancelBooking(bookingNumber) {

    const bookings =

        getJSON(

            "roomrentBookings",

            []

        );


    const booking =

        bookings.find(

            b =>
                b.bookingNumber ===
                bookingNumber

        );


    if (!booking) {

        return;

    }


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
   49. ADMIN WITHDRAWALS
========================================================= */

function onyeshaAdminWithdrawals() {

    if (!isAdminLoggedIn()) {

        funguaAdminLogin();

        return;

    }


    const withdrawals =
        getWithdrawals();


    const totalRequested =

        withdrawals.reduce(

            (sum, withdrawal) =>

                sum +

                Number(
                    withdrawal.amount || 0
                ),

            0

        );


    const totalFees =

        withdrawals

        .filter(

            withdrawal =>

                withdrawal.status ===
                "Paid"

        )

        .reduce(

            (sum, withdrawal) =>

                sum +

                Number(
                    withdrawal.fee || 0
                ),

            0

        );


    const section =
        document.getElementById(
            "taarifaSection"
        );


    section.style.display =
        "block";


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


        <div class="booking-card">

            <p>

                📋 Total Requests:

                <strong>
                    ${withdrawals.length}
                </strong>

            </p>


            <p>

                💰 Total Requested:

                <strong>
                    ${formatMoney(totalRequested)}
                </strong>

            </p>


            <p>

                📉 Total 8% Fees:

                <strong>
                    ${formatMoney(totalFees)}
                </strong>

            </p>

        </div>


        ${

            !withdrawals.length

            ? `
                <p>
                    Hakuna withdrawal bado.
                </p>
            `

            : withdrawals.map(withdrawal => `

                <div class="booking-card">

                    <h3>
                        ${withdrawal.id}
                    </h3>


                    <p>
                        👤 Account:
                        ${withdrawal.phone}
                    </p>


                    <p>

                        📱 Tuma Pesa:

                        <strong>
                            ${withdrawal.withdrawPhone}
                        </strong>

                    </p>


                    <p>
                        💳 Njia:
                        ${withdrawal.method}
                    </p>


                    <p>

                        💰 Withdrawal:

                        <strong>
                            ${formatMoney(
                                withdrawal.amount
                            )}
                        </strong>

                    </p>


                    <p>

                        📉 Makato 8%:

                        <strong>
                            ${formatMoney(
                                withdrawal.fee
                            )}
                        </strong>

                    </p>


                    <p>

                        📱 Atapokea:

                        <strong>
                            ${formatMoney(
                                withdrawal.netAmount
                            )}
                        </strong>

                    </p>


                    <p>

                        📌 Status:

                        <strong>
                            ${withdrawal.status}
                        </strong>

                    </p>


                    <p>
                        📅 ${formatDate(
                            withdrawal.createdAt
                        )}
                    </p>


                    ${

                        withdrawal.adminNote

                        ? `

                            <p>
                                📝 ${withdrawal.adminNote}
                            </p>

                        `

                        : ""

                    }


                    ${

                        withdrawal.status ===
                        "Pending"

                        ? `

                            <button
                                class="thibitishaBtn"
                                onclick="adminConfirmWithdrawal('${withdrawal.id}')"
                            >

                                ✅ Confirm & Pay

                            </button>


                            <button
                                class="kodiBtn"
                                onclick="adminRejectWithdrawal('${withdrawal.id}')"
                            >

                                ❌ Reject

                            </button>

                        `

                        : ""

                    }

                </div>

            `).join("")

        }

    `;

}


/* =========================================================
   50. CONFIRM WITHDRAWAL
========================================================= */

function adminConfirmWithdrawal(id) {

    if (!isAdminLoggedIn()) {

        funguaAdminLogin();

        return;

    }


    const withdrawals =
        getWithdrawals();


    const withdrawal =

        withdrawals.find(

            item =>
                item.id === id

        );


    if (!withdrawal) {

        return;

    }


    if (

        withdrawal.status !==
        "Pending"

    ) {

        alert(
            "Withdrawal hii tayari imeshashughulikiwa."
        );

        return;

    }


    const confirmation =

        confirm(

            `THIBITISHA MALIPO\n\n` +

            `Tuma: ${formatMoney(withdrawal.netAmount)}\n` +

            `Namba: ${withdrawal.withdrawPhone}\n` +

            `Njia: ${withdrawal.method}\n\n` +

            `Je umeshatuma pesa?`

        );


    if (!confirmation) {

        return;

    }


    withdrawal.status =
        "Paid";


    withdrawal.paidAt =
        new Date().toISOString();


    withdrawal.adminNote =
        "Withdrawal imelipwa na Admin.";


    saveWithdrawals(
        withdrawals
    );


    addNotification(

        withdrawal.phone,

        "Withdrawal Imekamilika ✅",

        `Withdrawal yako ya ${formatMoney(withdrawal.amount)} imeshughulikiwa. Makato yalikuwa ${formatMoney(withdrawal.fee)} na kiasi kilichotumwa ni ${formatMoney(withdrawal.netAmount)}.`

    );


    alert(
        "✅ Withdrawal imethibitishwa!"
    );


    onyeshaAdminWithdrawals();

}


/* =========================================================
   51. REJECT WITHDRAWAL
========================================================= */

function adminRejectWithdrawal(id) {

    if (!isAdminLoggedIn()) {

        funguaAdminLogin();

        return;

    }


    const reason =

        prompt(
            "📝 Andika sababu ya kukataa withdrawal:"
        );


    if (reason === null) {

        return;

    }


    const withdrawals =
        getWithdrawals();


    const withdrawal =

        withdrawals.find(

            item =>
                item.id === id

        );


    if (!withdrawal) {

        return;

    }


    withdrawal.status =
        "Rejected";


    withdrawal.rejectedAt =
        new Date().toISOString();


    withdrawal.adminNote =

        reason ||

        "Withdrawal imekataliwa na Admin.";


    saveWithdrawals(
        withdrawals
    );


    addNotification(

        withdrawal.phone,

        "Withdrawal Imekataliwa ❌",

        `Withdrawal yako ya ${formatMoney(withdrawal.amount)} imekataliwa. Sababu: ${withdrawal.adminNote}`

    );


    alert(
        "Withdrawal imekataliwa."
    );


    onyeshaAdminWithdrawals();

}


/* =========================================================
   52. ADMIN COMMISSIONS
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

                sum +

                Number(c.amount || 0),

            0

        );


    const userTotal =

        userCommissions.reduce(

            (sum, c) =>

                sum +

                Number(c.amount || 0),

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


            <p>🅰️ Level A: 20%</p>

            <p>🅱️ Level B: 10%</p>

            <p>🅲 Level C: 5%</p>


            <p>

                ♾️ Admin Commission:

                <strong>
                    Bila kikomo kwa kila booking
                </strong>

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


            <p>🅰️ Level A: 5%</p>

            <p>🅱️ Level B: 2%</p>

            <p>🅲 Level C: 1%</p>


            <p>
                ℹ️ User commission hutolewa
                mara moja kwa referred user.
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

            ? `
                <p>
                    Hakuna commission bado.
                </p>
            `

            : adminCommissions.map(c => `

                <div class="booking-card">

                    <p>
                        📋 Booking:
                        ${c.bookingNumber}
                    </p>


                    <p>
                        👤 Customer:
                        ${c.customerPhone}
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
   53. ADMIN REFERRALS
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

            ? `
                <p>
                    Hakuna users bado.
                </p>
            `

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

                        ${formatMoney(
                            user.totalCommission
                        )}

                    </p>

                </div>

            `).join("")

        }

    `;

}


/* =========================================================
   54. ADMIN STATISTICS
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


    const withdrawals =
        getWithdrawals();


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
                "Confirmed" &&

                b.status !==
                "Cancelled"

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


    const adminTotal =

        getAdminCommissions()

        .reduce(

            (sum, c) =>

                sum +

                Number(
                    c.amount || 0
                ),

            0

        );


    const userTotal =

        getCommissions()

        .reduce(

            (sum, c) =>

                sum +

                Number(
                    c.amount || 0
                ),

            0

        );


    const paidWithdrawals =

        withdrawals.filter(

            withdrawal =>

                withdrawal.status ===
                "Paid"

        )


        .reduce(

            (sum, withdrawal) =>

                sum +

                Number(
                    withdrawal.netAmount || 0
                ),

            0

        );


    const withdrawalFees =

        withdrawals.filter(

            withdrawal =>

                withdrawal.status ===
                "Paid"

        )


        .reduce(

            (sum, withdrawal) =>

                sum +

                Number(
                    withdrawal.fee || 0
                ),

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

                💸 Paid Withdrawals:

                <strong>
                    ${formatMoney(paidWithdrawals)}
                </strong>

            </p>


            <p>

                📉 Withdrawal Fees 8%:

                <strong>
                    ${formatMoney(withdrawalFees)}
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
   55. ADMIN LOGOUT
========================================================= */

function adminLogout() {

    localStorage.removeItem(
        "roomrentAdminLoggedIn"
    );


    location.reload();

}


/* =========================================================
   56. INITIALIZE
========================================================= */

document.addEventListener(

    "DOMContentLoaded",

    () => {


        fixUsersReferralCodes();


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


        /* ROOMS BUTTON */

        const angalia =
            document.getElementById(
                "angaliaVyumba"
            );


        if (angalia) {

            angalia.onclick =
                () => {

                    document
                    .getElementById("vyumba")
                    ?.scrollIntoView({

                        behavior:
                            "smooth"

                    });

                };

        }


        /* BOOKINGS BUTTON */

        const booking =
            document.getElementById(
                "bookingZangu"
            );


        if (booking) {

            booking.onclick =
                onyeshaBookingZangu;

        }


        /* ACCOUNT BUTTON */

        const account =
            document.getElementById(
                "accountBtn"
            );


        if (account) {

            account.onclick =
                funguaAccount;

        }


        /* NOTIFICATIONS BUTTON */

        const taarifa =
            document.getElementById(
                "taarifaBtn"
            );


        if (taarifa) {

            taarifa.onclick =
                funguaTaarifa;

        }


        /* WITHDRAWAL BUTTON */

        const withdrawal =
            document.getElementById(
                "withdrawalBtn"
            );


        if (withdrawal) {

            withdrawal.onclick =
                () => {

                    funguaWithdrawal();

                };

        }

    }

);


/* =========================================================
   MWISHO WA ROOMRENT SCRIPT
========================================================= */
