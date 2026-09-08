/* =========================================================
   ROOMRENT - SCRIPT NZIMA
   Mfumo wa:
   - Vyumba
   - Booking
   - Phone Number Payment
   - Payment Requests
   - Account
   - Notifications
   - Referral
   - Commission
   - Admin Login
   - Admin Dashboard
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
   2. REFERRAL SETTINGS
========================================================= */

const ADMIN_REFERRAL_CODE = "RRADMIN";

const ADMIN_REFERRAL_NAME = "RoomRent Admin";


/* =========================================================
   3. STORAGE
========================================================= */

function getJSON(key, fallback = []) {

    try {

        const data = localStorage.getItem(key);

        return data
            ? JSON.parse(data)
            : fallback;

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
   4. FORMAT MONEY
========================================================= */

function formatMoney(amount) {

    return Number(amount || 0)
        .toLocaleString("sw-TZ")
        + " TSh";

}


/* =========================================================
   5. ROOM IMAGES
========================================================= */

function getRoomImages() {

    return getJSON(
        "roomrentRoomImages",
        {}
    );

}


function saveRoomImages(images) {

    setJSON(
        "roomrentRoomImages",
        images
    );

}


function getRoomImage(roomNumber) {

    const images =
        getRoomImages();

    return images[roomNumber] || "";

}


/* =========================================================
   6. NOTIFICATIONS
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


function addNotification(
    phone,
    title,
    message
) {

    const notifications =
        getNotifications();


    notifications.unshift({

        id:
            "NOT" +
            Date.now(),

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


function formatDate(date) {

    try {

        return new Date(date)
            .toLocaleString("sw-TZ");

    } catch {

        return "";

    }

}


/* =========================================================
   7. DISPLAY ROOMS
========================================================= */

function onyeshaVyumba() {

    const container =
        document.getElementById("vyumba");

    if (!container) return;


    container.innerHTML = `

        <h2>🏠 Vyumba vya RoomRent</h2>

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
   8. OPEN RENT FORM
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


    section.style.display =
        "block";


    section.className =
        "fomuKodi";


    section.innerHTML = `

        <h2>
            🏠 Kukodi Chumba ${room.number}
        </h2>


        <p>
            ${room.description}
        </p>


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
            placeholder="Namba ya simu mfano 07XXXXXXXX"
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
   9. CREATE BOOKING
========================================================= */

function tengenezaBooking(roomNumber) {

    const room =
        rooms.find(
            r => r.number === roomNumber
        );


    if (!room) return;


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
            "⚠️ Tafadhali ingiza namba sahihi ya simu."
        );

        return;

    }


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

        paymentStatus:
            "Waiting",

        status:
            "Pending Payment",

        createdAt:
            new Date()
                .toISOString()

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
   10. PAYMENT REQUEST
========================================================= */

function funguaPaymentRequest(booking) {

    const section =
        document.getElementById("fomuKodi");


    if (!section) return;


    section.innerHTML = `

        <h2>
            💳 Lipa RoomRent
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


        <p>
            Thibitisha namba ya simu
            utakayotumia kufanya malipo.
        </p>


        <input
            type="tel"
            id="paymentPhone"
            value="${booking.phone}"
            placeholder="07XXXXXXXX"
        >


        <button
            class="thibitishaBtn"
            onclick="tumaPaymentRequest('${booking.bookingNumber}')"
        >

            💳 Lipa Sasa

        </button>


        <p
            style="
                font-size:13px;
                margin-top:15px;
            "
        >

            🔒 Malipo yako yatathibitishwa
            na RoomRent.

        </p>

    `;


    section.scrollIntoView({

        behavior: "smooth"

    });

}


/* =========================================================
   11. SEND PAYMENT REQUEST
========================================================= */

function tumaPaymentRequest(bookingNumber) {

    const paymentPhone =
        document
            .getElementById("paymentPhone")
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


    booking.paymentPhone =
        paymentPhone;


    booking.paymentStatus =
        "Requested";


    booking.status =
        "Waiting Confirmation";


    booking.paymentRequestedAt =
        new Date()
            .toISOString();


    setJSON(
        "roomrentBookings",
        bookings
    );


    addNotification(

        booking.phone,

        "Malipo Yameombwa",

        `Ombi la malipo ya ${formatMoney(booking.price)} limepokelewa kwa booking ${booking.bookingNumber}.`

    );


    showPaymentWaiting(
        booking
    );

}


/* =========================================================
   12. PAYMENT WAITING
========================================================= */

function showPaymentWaiting(booking) {

    const section =
        document.getElementById("fomuKodi");


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
                📱 Namba ya Malipo:
                ${booking.paymentPhone}
            </p>


            <p>
                💳 Njia:
                ${booking.paymentMethod}
            </p>


            <hr>


            <p>
                ⏳ Ombi lako la malipo
                limehifadhiwa.
            </p>


            <p>
                Admin atathibitisha
                malipo yako.
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
   13. BOOKING ZANGU
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
            b =>
                b.phone === phone
        );


    const section =
        document.getElementById(
            "taarifaSection"
        );


    if (!section) return;


    section.style.display =
        "block";


    if (!bookings.length) {

        section.innerHTML = `

            <h2>
                📋 Booking Zangu
            </h2>

            <p>
                Hakuna booking iliyopatikana.
            </p>

        `;

        return;

    }


    section.innerHTML = `

        <h2>
            📋 Booking Zangu
        </h2>


        ${bookings.map(b => `

            <div class="booking-card">

                <h3>
                    ${b.bookingNumber}
                </h3>


                <p>
                    🏠 Chumba:
                    ${b.roomNumber}
                </p>


                <p>
                    💰 Kiasi:
                    ${formatMoney(b.price)}
                </p>


                <p>
                    💳 ${b.paymentMethod}
                </p>


                <p>
                    📌 Booking:
                    <strong>
                        ${b.status}
                    </strong>
                </p>


                <p>
                    💰 Malipo:
                    <strong>
                        ${b.paymentStatus || "Waiting"}
                    </strong>
                </p>

            </div>

        `).join("")}

    `;


    section.scrollIntoView({
        behavior: "smooth"
    });

}


/* =========================================================
   14. ACCOUNT
========================================================= */

function funguaAccount() {

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


    section.style.display =
        "block";


    section.innerHTML = `

        <h2>
            👤 Account Yangu
        </h2>


        <div class="booking-card">

            <p>
                📱 Namba:
                ${phone}
            </p>


            <p>
                📋 Jumla ya Booking:
                ${bookings.length}
            </p>


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
   15. NOTIFICATIONS
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


    section.scrollIntoView({
        behavior: "smooth"
    });

}


/* =========================================================
   16. ADMIN LOGIN
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
            .getElementById(
                "adminUsername"
            )
            ?.value
            .trim();


    const password =
        document
            .getElementById(
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

    } else {

        alert(
            "❌ Username au password sio sahihi."
        );

    }

}


function isAdminLoggedIn() {

    return (
        localStorage.getItem(
            "roomrentAdminLoggedIn"
        ) === "true"
    );

}


/* =========================================================
   17. ADMIN DASHBOARD
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
                Karibu Admin.
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
   18. ADMIN BOOKINGS
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
                        📱 Payment Number:
                        ${b.paymentPhone || "-"}
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
                            ${b.paymentStatus || "Waiting"}
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


    section.scrollIntoView({
        behavior: "smooth"
    });

}


/* =========================================================
   19. CONFIRM BOOKING
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


    if (!booking) return;


    booking.status =
        "Confirmed";


    booking.paymentStatus =
        "Paid";


    booking.confirmedAt =
        new Date()
            .toISOString();


    setJSON(
        "roomrentBookings",
        bookings
    );


    addNotification(

        booking.phone,

        "Malipo Yamethibitishwa ✅",

        `Malipo ya ${formatMoney(booking.price)} kwa booking ${booking.bookingNumber} yamethibitishwa.`

    );


    alert(
        "✅ Malipo yamethibitishwa!"
    );


    onyeshaAdminBookings();

}


/* =========================================================
   20. CANCEL BOOKING
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


    alert(
        "Booking imefutwa."
    );


    onyeshaAdminBookings();

}


/* =========================================================
   21. ADMIN STATISTICS
========================================================= */

function onyeshaAdminStatistics() {

    const bookings =
        getJSON(
            "roomrentBookings",
            []
        );


    const confirmed =
        bookings.filter(
            b =>
                b.status === "Confirmed"
        );


    const pending =
        bookings.filter(
            b =>
                b.status !== "Confirmed"
        );


    const revenue =
        confirmed.reduce(
            (sum, b) =>
                sum + Number(b.price || 0),
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
                🏠 Total Rooms:
                <strong>
                    ${rooms.length}
                </strong>
            </p>

        </div>

    `;

}


/* =========================================================
   22. ADMIN LOGOUT
========================================================= */

function adminLogout() {

    localStorage.removeItem(
        "roomrentAdminLoggedIn"
    );


    location.reload();

}


/* =========================================================
   23. INITIALIZE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        onyeshaVyumba();


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


        const booking =
            document.getElementById(
                "bookingZangu"
            );


        if (booking) {

            booking.onclick =
                onyeshaBookingZangu;

        }


        const account =
            document.getElementById(
                "accountBtn"
            );


        if (account) {

            account.onclick =
                funguaAccount;

        }


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
