/* =========================================================
   ROOMRENT - SCRIPT NZIMA
   Mfumo wa:
   - Vyumba
   - Picha za vyumba
   - Booking
   - Payment
   - Account
   - Notifications
   - Referral
   - Commission
   - Admin Login
   - Admin Dashboard
   - Admin Statistics Dashboard
   - Huduma kwa Wateja WhatsApp
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
        description: "Chumba chenye nafasi nzuri na mpango wa faida wa kila siku."
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
        description: "Chumba chenye mpango mzuri wa mapato ya kila siku."
    },
    {
        number: "0027",
        price: 280000,
        profit: 11200,
        days: 35,
        description: "Chumba cha kiwango cha juu kwa mpango wa RoomRent."
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
        description: "Chumba cha kiwango cha juu zaidi katika mfumo."
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
        description: "Chumba cha kiwango cha juu kwa watumiaji wanaotaka mpango mkubwa."
    },
    {
        number: "0032",
        price: 630000,
        profit: 25200,
        days: 35,
        description: "Chumba cha juu zaidi katika orodha ya sasa ya RoomRent."
    }
];


/* =========================================================
   2. REFERRAL SETTINGS
   ========================================================= */

const ADMIN_REFERRAL_CODE = "RRADMIN";

const ADMIN_REFERRAL_NAME = "RoomRent Admin";


const ADMIN_RATES = {
    A: 20,
    B: 10,
    C: 5
};


const USER_RATES = {
    A: 5,
    B: 2,
    C: 1
};


/* =========================================================
   3. STORAGE HELPERS
   ========================================================= */

function getJSON(key, fallback = []) {

    try {

        const data = localStorage.getItem(key);

        return data
            ? JSON.parse(data)
            : fallback;

    } catch (error) {

        console.error("Storage error:", error);

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

    const images = getRoomImages();

    return images[roomNumber] || "";
}


/* =========================================================
   6. DISPLAY ROOMS
   ========================================================= */

function onyeshaVyumba() {

    const container =
        document.getElementById("vyumba");

    if (!container) return;


    container.innerHTML = `

        <h2>🏠 Vyumba vya RoomRent</h2>

        <p>
            Chagua chumba unachotaka kukodi.
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
                                alt="Room ${room.number}"
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
   7. OPEN RENT FORM
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

    section.className = "fomuKodi";


    section.innerHTML = `

        <h2>
            🏠 Kukodi Chumba ${room.number}
        </h2>


        <p>${room.description}</p>


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


        <select id="paymentMethod">

            <option value="">
                Chagua njia ya malipo
            </option>

            <option value="MIXX BY YAS">
                MIXX BY YAS
            </option>

            <option value="Airtel Money">
                Airtel Money
            </option>

        </select>


        <button
            class="endeleaBtn"
            onclick="tengenezaBooking('${room.number}')"
        >
            💳 Endelea na Malipo
        </button>

    `;


    section.scrollIntoView({
        behavior: "smooth"
    });

}


/* =========================================================
   8. CREATE BOOKING
   ========================================================= */

function tengenezaBooking(roomNumber) {

    const room =
        rooms.find(
            r => r.number === roomNumber
        );


    if (!room) {

        alert("Chumba hakijapatikana.");

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


    const paymentMethod =
        document
            .getElementById("paymentMethod")
            ?.value;


    if (!name || !phone || !paymentMethod) {

        alert(
            "Tafadhali jaza taarifa zote."
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


    const incomingReferral =
        localStorage.getItem(
            "roomrentIncomingReferral"
        ) || "";


    const booking = {

        bookingNumber,

        name,

        phone,

        roomNumber,

        price: room.price,

        profit: room.profit,

        days: room.days,

        paymentMethod,

        referralCode:
            incomingReferral,

        status:
            "Pending Payment",

        createdAt:
            new Date().toISOString()

    };


    bookings.push(booking);


    setJSON(
        "roomrentBookings",
        bookings
    );


    registerReferralUser(
        phone,
        name,
        incomingReferral
    );


    /* Notification ya booking mpya */

    createNotification({

        phone: phone,

        title:
            "📋 Booking Imepokelewa",

        message:
            `Booking yako ya chumba ${roomNumber} imepokelewa. Tafadhali subiri uthibitisho wa malipo.`,

        type:
            "booking",

        bookingNumber:
            bookingNumber

    });


    showPaymentInstructions(
        booking
    );

}


/* =========================================================
   9. PAYMENT INSTRUCTIONS
   ========================================================= */

function showPaymentInstructions(booking) {

    const section =
        document.getElementById("fomuKodi");


    if (!section) return;


    section.innerHTML = `

        <h2>
            💳 Malipo ya RoomRent
        </h2>


        <p>
            Booking yako imeundwa.
        </p>


        <p>
            <strong>Namba ya Booking:</strong>
            ${booking.bookingNumber}
        </p>


        <p>
            <strong>Chumba:</strong>
            ${booking.roomNumber}
        </p>


        <p>
            <strong>Kiasi:</strong>
            ${formatMoney(booking.price)}
        </p>


        <p>
            <strong>Njia ya malipo:</strong>
            ${booking.paymentMethod}
        </p>


        <hr>


        <p>
            Fanya malipo kwa njia uliyochagua,
            kisha Admin atakagua na kuthibitisha
            booking yako.
        </p>


        <button
            class="endeleaBtn"
            onclick="onyeshaBookingZangu()"
        >
            📋 Booking Zangu
        </button>

    `;

}


/* =========================================================
   10. BOOKING ZANGU
   ========================================================= */

function onyeshaBookingZangu() {

    const phone =
        prompt(
            "Ingiza namba yako ya simu:"
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


    section.style.display = "block";


    if (bookings.length === 0) {

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
                    💳 Malipo:
                    ${b.paymentMethod}
                </p>


                <p>
                    📌 Hali:

                    <strong>
                        ${b.status}
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
   11. ACCOUNT
   ========================================================= */

function funguaAccount() {

    const phone =
        prompt(
            "Ingiza namba yako ya simu:"
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


    const notifications =
        getNotificationsByPhone(phone);


    const unread =
        notifications.filter(
            n => !n.read
        ).length;


    const section =
        document.getElementById(
            "taarifaSection"
        );


    if (!section) return;


    section.style.display = "block";


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


            <p>
                🔔 Notifications Mpya:
                ${unread}
            </p>


            <button
                class="endeleaBtn"
                onclick="onyeshaUserCommission('${phone}')"
            >
                💰 Commission Yangu
            </button>


            <button
                class="thibitishaBtn"
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
   12. NOTIFICATION STORAGE
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


/* =========================================================
   13. CREATE NOTIFICATION
   ========================================================= */

function createNotification(data) {

    if (!data || !data.phone) return;


    const notifications =
        getNotifications();


    const notification = {

        id:
            "NOT" +
            Date.now() +
            Math.random()
                .toString(36)
                .substring(2, 7),

        phone:
            data.phone,

        title:
            data.title ||
            "🔔 RoomRent",

        message:
            data.message ||
            "",

        type:
            data.type ||
            "general",

        bookingNumber:
            data.bookingNumber ||
            "",

        read:
            false,

        createdAt:
            new Date()
                .toISOString()

    };


    notifications.unshift(
        notification
    );


    saveNotifications(
        notifications
    );

}


/* =========================================================
   14. GET USER NOTIFICATIONS
   ========================================================= */

function getNotificationsByPhone(phone) {

    return getNotifications()
        .filter(
            n => n.phone === phone
        )
        .sort(
            (a, b) =>
                new Date(b.createdAt) -
                new Date(a.createdAt)
        );

}


/* =========================================================
   15. SHOW NOTIFICATIONS
   ========================================================= */

function onyeshaNotifications(phone) {

    const notifications =
        getNotificationsByPhone(phone);


    const section =
        document.getElementById(
            "taarifaSection"
        );


    if (!section) return;


    section.style.display =
        "block";


    section.innerHTML = `

        <h2>
            🔔 Taarifa Zangu
        </h2>


        <button
            class="endeleaBtn"
            onclick="funguaAccountKwaSimu('${phone}')"
        >
            ⬅️ Rudi Account
        </button>


        <br><br>


        ${
            notifications.length === 0

                ? `

                    <div class="booking-card">

                        <p>
                            🔔 Huna taarifa mpya.
                        </p>

                    </div>

                `

                : notifications.map(n => `

                    <div class="booking-card">

                        <h3>
                            ${n.title}
                        </h3>


                        <p>
                            ${n.message}
                        </p>


                        ${
                            n.bookingNumber

                                ? `

                                    <p>
                                        📋 Booking:
                                        ${n.bookingNumber}
                                    </p>

                                `

                                : ""
                        }


                        <p>
                            📅
                            ${formatNotificationDate(
                                n.createdAt
                            )}
                        </p>


                        ${
                            !n.read

                                ? `

                                    <p>
                                        🆕
                                        <strong>
                                            Mpya
                                        </strong>
                                    </p>

                                `

                                : `
                                    <p>
                                        ✅ Imesomwa
                                    </p>
                                `
                        }

                    </div>

                `).join("")
        }

    `;


    markNotificationsAsRead(phone);


    section.scrollIntoView({
        behavior: "smooth"
    });

}


/* =========================================================
   16. MARK NOTIFICATIONS READ
   ========================================================= */

function markNotificationsAsRead(phone) {

    const notifications =
        getNotifications();


    let changed = false;


    notifications.forEach(n => {

        if (
            n.phone === phone &&
            !n.read
        ) {

            n.read = true;

            changed = true;

        }

    });


    if (changed) {

        saveNotifications(
            notifications
        );

    }

}


/* =========================================================
   17. FORMAT NOTIFICATION DATE
   ========================================================= */

function formatNotificationDate(date) {

    try {

        return new Date(date)
            .toLocaleString(
                "sw-TZ",
                {
                    dateStyle: "medium",
                    timeStyle: "short"
                }
            );

    } catch (error) {

        return date;

    }

}


/* =========================================================
   18. OPEN ACCOUNT BY PHONE
   ========================================================= */

function funguaAccountKwaSimu(phone) {

    const bookings =
        getJSON(
            "roomrentBookings",
            []
        )
        .filter(
            b => b.phone === phone
        );


    const notifications =
        getNotificationsByPhone(phone);


    const unread =
        notifications.filter(
            n => !n.read
        ).length;


    const section =
        document.getElementById(
            "taarifaSection"
        );


    if (!section) return;


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


            <p>
                🔔 Notifications:
                ${unread}
            </p>


            <button
                class="endeleaBtn"
                onclick="onyeshaUserCommission('${phone}')"
            >
                💰 Commission Yangu
            </button>


            <button
                class="thibitishaBtn"
                onclick="onyeshaNotifications('${phone}')"
            >
                🔔 Taarifa Zangu
            </button>

        </div>

    `;

}


/* =========================================================
   19. OPEN NOTIFICATIONS FROM MENU
   ========================================================= */

function funguaTaarifa() {

    const phone =
        prompt(
            "Ingiza namba yako ya simu kuona taarifa zako:"
        );


    if (!phone) return;


    onyeshaNotifications(phone);

}


/* =========================================================
   20. REFERRALS
   ========================================================= */

function getReferrals() {

    return getJSON(
        "roomrentReferrals",
        []
    );
}


function saveReferrals(data) {

    setJSON(
        "roomrentReferrals",
        data
    );
}


/* =========================================================
   21. REGISTER REFERRAL USER
   ========================================================= */

function registerReferralUser(
    phone,
    name,
    referralCode
) {

    if (!phone) return;


    const referrals =
        getReferrals();


    const exists =
        referrals.find(
            r => r.phone === phone
        );


    if (exists) return;


    let sponsor = null;


    if (referralCode) {

        sponsor =
            referrals.find(
                r =>
                    r.referralCode ===
                    referralCode
            );


        if (
            !sponsor &&
            referralCode ===
            ADMIN_REFERRAL_CODE
        ) {

            sponsor = {

                phone:
                    "ADMIN",

                name:
                    ADMIN_REFERRAL_NAME,

                referralCode:
                    ADMIN_REFERRAL_CODE

            };

        }

    }


    const myReferralCode =
        "RR" +
        phone
            .replace(/\D/g, "")
            .slice(-8);


    referrals.push({

        phone,

        name,

        referralCode:
            myReferralCode,

        sponsorPhone:
            sponsor
                ? sponsor.phone
                : "ADMIN",

        sponsorName:
            sponsor
                ? sponsor.name
                : ADMIN_REFERRAL_NAME,

        createdAt:
            new Date().toISOString()

    });


    saveReferrals(referrals);

}


/* =========================================================
   22. REFERRAL CHAIN
   ========================================================= */

function calculateReferralChain(phone) {

    const referrals =
        getReferrals();


    const chain = [];


    let currentPhone =
        phone;


    for (
        let level = 0;
        level < 3;
        level++
    ) {

        const user =
            referrals.find(
                r =>
                    r.phone === currentPhone
            );


        if (!user) break;


        const sponsorPhone =
            user.sponsorPhone;


        if (!sponsorPhone) break;


        const levelName =
            level === 0
                ? "A"
                : level === 1
                ? "B"
                : "C";


        if (
            sponsorPhone === "ADMIN"
        ) {

            chain.push({

                phone:
                    "ADMIN",

                name:
                    ADMIN_REFERRAL_NAME,

                level:
                    levelName

            });

            break;

        }


        const sponsor =
            referrals.find(
                r =>
                    r.phone === sponsorPhone
            );


        if (!sponsor) break;


        chain.push({

            phone:
                sponsor.phone,

            name:
                sponsor.name,

            level:
                levelName

        });


        currentPhone =
            sponsor.phone;

    }


    return chain;

}


/* =========================================================
   23. COMMISSIONS
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
   24. CREATE COMMISSIONS
   ========================================================= */

function createCommissionsForBooking(booking) {

    if (!booking) return;


    const commissions =
        getCommissions();


    const alreadyCreated =
        commissions.find(
            c =>
                c.bookingNumber ===
                booking.bookingNumber
        );


    if (alreadyCreated) return;


    const chain =
        calculateReferralChain(
            booking.phone
        );


    if (!chain.length) return;


    chain.forEach(person => {

        let rate = 0;

        let recipientType =
            "User";


        if (
            person.phone === "ADMIN"
        ) {

            rate =
                ADMIN_RATES[
                    person.level
                ];

            recipientType =
                "Admin";

        } else {

            rate =
                USER_RATES[
                    person.level
                ];

        }


        if (!rate) return;


        let shouldPay = true;


        if (
            recipientType === "User"
        ) {

            const existing =
                commissions.find(
                    c =>

                        c.sourceUserPhone ===
                        booking.phone

                        &&

                        c.recipientPhone ===
                        person.phone

                        &&

                        c.recipientType ===
                        "User"
                );


            if (existing) {

                shouldPay = false;

            }

        }


        if (!shouldPay) return;


        const amount =
            Math.round(
                booking.price *
                rate /
                100
            );


        commissions.push({

            id:
                "COM" +
                Date.now() +
                Math.random()
                    .toString(36)
                    .substring(2, 7),

            bookingNumber:
                booking.bookingNumber,

            sourceUserPhone:
                booking.phone,

            recipientPhone:
                person.phone,

            recipientName:
                person.name,

            recipientType,

            level:
                person.level,

            rate,

            amount,

            status:
                "Pending",

            createdAt:
                new Date()
                    .toISOString()

        });

    });


    saveCommissions(commissions);

}


/* =========================================================
   25. USER COMMISSION
   ========================================================= */

function onyeshaUserCommission(phone) {

    const commissions =
        getCommissions()
        .filter(
            c =>
                c.recipientPhone === phone &&
                c.recipientType === "User"
        );


    const pending =
        commissions
        .filter(
            c => c.status === "Pending"
        )
        .reduce(
            (sum, c) =>
                sum + c.amount,
            0
        );


    const paid =
        commissions
        .filter(
            c => c.status === "Paid"
        )
        .reduce(
            (sum, c) =>
                sum + c.amount,
            0
        );


    const section =
        document.getElementById(
            "taarifaSection"
        );


    section.innerHTML = `

        <h2>
            💰 Commission Yangu
        </h2>


        <div class="booking-card">

            <p>
                <strong>Pending:</strong>
                ${formatMoney(pending)}
            </p>


            <p>
                <strong>Paid:</strong>
                ${formatMoney(paid)}
            </p>

        </div>


        ${
            commissions.length === 0

                ? `
                    <p>
                        Huna commission bado.
                    </p>
                `

                : commissions.map(c => `

                    <div class="booking-card">

                        <p>
                            Booking:
                            ${c.bookingNumber}
                        </p>


                        <p>
                            Level:
                            ${c.level}
                        </p>


                        <p>
                            Rate:
                            ${c.rate}%
                        </p>


                        <p>
                            Commission:
                            ${formatMoney(c.amount)}
                        </p>


                        <p>
                            Status:
                            <strong>
                                ${c.status}
                            </strong>
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
   26. ADMIN LOGIN
   ========================================================= */

let adminLogoClicks = 0;

let adminLogoTimer = null;


function adminLogoClick() {

    adminLogoClicks++;


    clearTimeout(adminLogoTimer);


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


    if (!modal) return;


    modal.style.display =
        "flex";

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

        const message =
            document.getElementById(
                "adminLoginMessage"
            );


        if (message) {

            message.style.display =
                "block";

            message.textContent =
                "❌ Username au password sio sahihi.";

        } else {

            alert(
                "Username au password sio sahihi."
            );

        }

    }

}


/* =========================================================
   27. ADMIN AUTH
   ========================================================= */

function isAdminLoggedIn() {

    return (
        localStorage.getItem(
            "roomrentAdminLoggedIn"
        ) === "true"
    );

}


/* =========================================================
   28. ADMIN DASHBOARD
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


    if (!section) return;


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
                onclick="onyeshaAdminStatistics()"
            >
                📊 Statistics Dashboard
            </button>


            <button
                class="endeleaBtn"
                onclick="onyeshaAdminBookings()"
            >
                📋 Manage Bookings
            </button>


            <button
                class="endeleaBtn"
                onclick="onyeshaAdminRoomImages()"
            >
                🖼️ Picha za Vyumba
            </button>


            <button
                class="endeleaBtn"
                onclick="onyeshaAdminCommission()"
            >
                💰 Commission Dashboard
            </button>


            <button
                class="endeleaBtn"
                onclick="onyeshaAdminReferral()"
            >
                🔗 Admin Referral
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
   29. ADMIN STATISTICS DASHBOARD
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


    const referrals =
        getReferrals();


    const commissions =
        getCommissions();


    const totalBookings =
        bookings.length;


    const confirmedBookings =
        bookings.filter(
            b =>
                b.status === "Confirmed"
        );


    const pendingBookings =
        bookings.filter(
            b =>
                b.status ===
                "Pending Payment"
        );


    const cancelledBookings =
        bookings.filter(
            b =>
                b.status === "Cancelled"
        );


    const totalRevenue =
        confirmedBookings.reduce(
            (sum, booking) =>
                sum +
                Number(booking.price || 0),
            0
        );


    const pendingRevenue =
        pendingBookings.reduce(
            (sum, booking) =>
                sum +
                Number(booking.price || 0),
            0
        );


    const adminCommissions =
        commissions.filter(
            c =>
                c.recipientType === "Admin"
        );


    const userCommissions =
        commissions.filter(
            c =>
                c.recipientType === "User"
        );


    const totalAdminCommission =
        adminCommissions.reduce(
            (sum, c) =>
                sum + Number(c.amount || 0),
            0
        );


    const totalUserCommission =
        userCommissions.reduce(
            (sum, c) =>
                sum + Number(c.amount || 0),
            0
        );


    const paidCommission =
        commissions
        .filter(
            c => c.status === "Paid"
        )
        .reduce(
            (sum, c) =>
                sum + Number(c.amount || 0),
            0
        );


    const pendingCommission =
        commissions
        .filter(
            c => c.status === "Pending"
        )
        .reduce(
            (sum, c) =>
                sum + Number(c.amount || 0),
            0
        );


    const bookedRooms =
        new Set(
            confirmedBookings.map(
                b => b.roomNumber
            )
        ).size;


    const section =
        document.getElementById(
            "taarifaSection"
        );


    if (!section) return;


    section.innerHTML = `

        <h2>
            📊 Admin Statistics Dashboard
        </h2>


        <button
            class="endeleaBtn"
            onclick="funguaAdmin()"
        >
            ⬅️ Rudi Admin
        </button>


        <br><br>


        <div class="booking-card">

            <h3>
                📋 Booking Statistics
            </h3>

            <p>
                <strong>Jumla ya Bookings:</strong>
                ${totalBookings}
            </p>

            <p>
                <strong>✅ Confirmed:</strong>
                ${confirmedBookings.length}
            </p>

            <p>
                <strong>⏳ Pending:</strong>
                ${pendingBookings.length}
            </p>

            <p>
                <strong>❌ Cancelled:</strong>
                ${cancelledBookings.length}
            </p>

        </div>


        <div class="booking-card">

            <h3>
                💰 Revenue Statistics
            </h3>

            <p>
                <strong>Confirmed Revenue:</strong>
                ${formatMoney(totalRevenue)}
            </p>

            <p>
                <strong>Pending Revenue:</strong>
                ${formatMoney(pendingRevenue)}
            </p>

        </div>


        <div class="booking-card">

            <h3>
                🏠 Room Statistics
            </h3>

            <p>
                <strong>Jumla ya Vyumba:</strong>
                ${rooms.length}
            </p>

            <p>
                <strong>Vyumba vilivyowahi Confirm:</strong>
                ${bookedRooms}
            </p>

        </div>


        <div class="booking-card">

            <h3>
                👥 User Statistics
            </h3>

            <p>
                <strong>Jumla ya Users:</strong>
                ${referrals.length}
            </p>

            <p>
                <strong>Admin Referrals:</strong>
                ${
                    referrals.filter(
                        r =>
                            r.sponsorPhone === "ADMIN"
                    ).length
                }
            </p>

        </div>


        <div class="booking-card">

            <h3>
                💵 Commission Statistics
            </h3>

            <p>
                <strong>Admin Commission:</strong>
                ${formatMoney(totalAdminCommission)}
            </p>

            <p>
                <strong>User Commission:</strong>
                ${formatMoney(totalUserCommission)}
            </p>

            <p>
                <strong>Pending Commission:</strong>
                ${formatMoney(pendingCommission)}
            </p>

            <p>
                <strong>Paid Commission:</strong>
                ${formatMoney(paidCommission)}
            </p>

        </div>

    `;


    section.scrollIntoView({
        behavior: "smooth"
    });

}


/* =========================================================
   30. ADMIN LOGOUT
   ========================================================= */

function adminLogout() {

    localStorage.removeItem(
        "roomrentAdminLoggedIn"
    );


    alert(
        "Admin ametoka kwenye mfumo."
    );


    location.reload();

}


/* =========================================================
   31. ADMIN BOOKINGS
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


    if (!section) return;


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
            bookings.length === 0

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
                            👤 Jina:
                            ${b.name}
                        </p>


                        <p>
                            📱 Simu:
                            ${b.phone}
                        </p>


                        <p>
                            🏠 Chumba:
                            ${b.roomNumber}
                        </p>


                        <p>
                            💰 Kiasi:
                            ${formatMoney(b.price)}
                        </p>


                        <p>
                            💳 Payment:
                            ${b.paymentMethod}
                        </p>


                        <p>
                            📌 Status:

                            <strong>
                                ${b.status}
                            </strong>
                        </p>


                        ${
                            b.status ===
                            "Pending Payment"

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
   32. CONFIRM BOOKING + NOTIFICATION
   ========================================================= */

function adminConfirmBooking(bookingNumber) {

    if (!isAdminLoggedIn()) {

        funguaAdminLogin();

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


    if (
        booking.status ===
        "Confirmed"
    ) {

        alert(
            "Booking tayari imethibitishwa."
        );

        return;

    }


    booking.status =
        "Confirmed";


    booking.confirmedAt =
        new Date()
            .toISOString();


    setJSON(
        "roomrentBookings",
        bookings
    );


    createCommissionsForBooking(
        booking
    );


    /* =========================
       NOTIFICATION
       ========================= */

    createNotification({

        phone:
            booking.phone,

        title:
            "✅ Booking Imethibitishwa!",

        message:
            `Hongera ${booking.name}! Booking yako ya chumba ${booking.roomNumber} imethibitishwa. Kiasi: ${formatMoney(booking.price)}. Muda: ${booking.days} siku.`,

        type:
            "confirmed",

        bookingNumber:
            booking.bookingNumber

    });


    alert(
        "✅ Malipo yamethibitishwa!"
    );


    onyeshaAdminBookings();

}


/* =========================================================
   33. CANCEL BOOKING + NOTIFICATION
   ========================================================= */

function adminCancelBooking(bookingNumber) {

    if (!isAdminLoggedIn()) {

        funguaAdminLogin();

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


    if (!booking) return;


    booking.status =
        "Cancelled";


    booking.cancelledAt =
        new Date()
            .toISOString();


    setJSON(
        "roomrentBookings",
        bookings
    );


    /* =========================
       NOTIFICATION
       ========================= */

    createNotification({

        phone:
            booking.phone,

        title:
            "❌ Booking Imeghairiwa",

        message:
            `Samahani ${booking.name}, booking yako ya chumba ${booking.roomNumber} imeghairiwa. Wasiliana na Huduma kwa Wateja kwa maelezo zaidi.`,

        type:
            "cancelled",

        bookingNumber:
            booking.bookingNumber

    });


    alert(
        "Booking imefutwa."
    );


    onyeshaAdminBookings();

}


/* =========================================================
   34. ADMIN ROOM IMAGES
   ========================================================= */

function onyeshaAdminRoomImages() {

    if (!isAdminLoggedIn()) {

        funguaAdminLogin();

        return;

    }


    const section =
        document.getElementById(
            "taarifaSection"
        );


    const images =
        getRoomImages();


    section.innerHTML = `

        <h2>
            🖼️ Picha za Vyumba
        </h2>


        <button
            class="endeleaBtn"
            onclick="funguaAdmin()"
        >
            ⬅️ Rudi Admin
        </button>


        <p>
            Chagua picha kwa kila chumba.
        </p>


        <div id="adminRoomImages"></div>

    `;


    const container =
        document.getElementById(
            "adminRoomImages"
        );


    rooms.forEach(room => {

        const image =
            images[room.number] || "";


        const card =
            document.createElement("div");


        card.className =
            "booking-card";


        card.innerHTML = `

            <h3>
                🏠 Chumba ${room.number}
            </h3>


            ${
                image

                    ? `
                        <img
                            src="${image}"
                            class="admin-room-preview"
                            style="
                                width:100%;
                                max-height:220px;
                                object-fit:cover;
                                border-radius:12px;
                            "
                        >
                    `

                    : `
                        <div class="room-placeholder">
                            🏠 RoomRent
                        </div>
                    `
            }


            <br><br>


            <input
                type="file"
                id="imageInput-${room.number}"
                accept="image/*"
            >


            <br><br>


            <button
                class="endeleaBtn"
                onclick="uploadRoomImage('${room.number}')"
            >
                🖼️ Hifadhi Picha
            </button>


            ${
                image

                    ? `
                        <button
                            class="kodiBtn"
                            onclick="removeRoomImage('${room.number}')"
                        >
                            🗑️ Ondoa Picha
                        </button>
                    `

                    : ""
            }

        `;


        container.appendChild(card);

    });

}


/* =========================================================
   35. COMPRESS IMAGE
   ========================================================= */

function compressImage(
    file,
    maxWidth = 900,
    quality = 0.75
) {

    return new Promise(
        (resolve, reject) => {

            const reader =
                new FileReader();


            reader.onload =
                event => {

                    const img =
                        new Image();


                    img.onload =
                        () => {

                            let width =
                                img.width;


                            let height =
                                img.height;


                            if (
                                width > maxWidth
                            ) {

                                const ratio =
                                    maxWidth /
                                    width;


                                width =
                                    maxWidth;


                                height =
                                    height *
                                    ratio;

                            }


                            const canvas =
                                document.createElement(
                                    "canvas"
                                );


                            canvas.width =
                                width;


                            canvas.height =
                                height;


                            const ctx =
                                canvas.getContext(
                                    "2d"
                                );


                            ctx.drawImage(
                                img,
                                0,
                                0,
                                width,
                                height
                            );


                            const compressed =
                                canvas.toDataURL(
                                    "image/jpeg",
                                    quality
                                );


                            resolve(
                                compressed
                            );

                        };


                    img.onerror =
                        reject;


                    img.src =
                        event.target.result;

                };


            reader.onerror =
                reject;


            reader.readAsDataURL(
                file
            );

        }
    );

}


/* =========================================================
   36. UPLOAD ROOM IMAGE
   ========================================================= */

async function uploadRoomImage(roomNumber) {

    if (!isAdminLoggedIn()) {

        funguaAdminLogin();

        return;

    }


    const input =
        document.getElementById(
            `imageInput-${roomNumber}`
        );


    if (
        !input ||
        !input.files.length
    ) {

        alert(
            "Tafadhali chagua picha kwanza."
        );

        return;

    }


    const file =
        input.files[0];


    if (
        !file.type.startsWith(
            "image/"
        )
    ) {

        alert(
            "Chagua picha halali."
        );

        return;

    }


    try {

        const compressed =
            await compressImage(file);


        const images =
            getRoomImages();


        images[roomNumber] =
            compressed;


        saveRoomImages(images);


        alert(
            `Picha ya chumba ${roomNumber} imehifadhiwa.`
        );


        onyeshaAdminRoomImages();


        onyeshaVyumba();

    } catch (error) {

        console.error(error);


        alert(
            "Imeshindikana kuhifadhi picha."
        );

    }

}


/* =========================================================
   37. REMOVE ROOM IMAGE
   ========================================================= */

function removeRoomImage(roomNumber) {

    if (!isAdminLoggedIn()) {

        funguaAdminLogin();

        return;

    }


    const images =
        getRoomImages();


    delete images[roomNumber];


    saveRoomImages(images);


    onyeshaAdminRoomImages();


    onyeshaVyumba();

}


/* =========================================================
   38. ADMIN COMMISSION
   ========================================================= */

function onyeshaAdminCommission() {

    if (!isAdminLoggedIn()) {

        funguaAdminLogin();

        return;

    }


    const commissions =
        getCommissions();


    const section =
        document.getElementById(
            "taarifaSection"
        );


    const adminCommissions =
        commissions.filter(
            c =>
                c.recipientType === "Admin"
        );


    const totalPending =
        adminCommissions
        .filter(
            c =>
                c.status === "Pending"
        )
        .reduce(
            (sum, c) =>
                sum + c.amount,
            0
        );


    const totalPaid =
        adminCommissions
        .filter(
            c =>
                c.status === "Paid"
        )
        .reduce(
            (sum, c) =>
                sum + c.amount,
            0
        );


    section.innerHTML = `

        <h2>
            💰 Admin Commission Dashboard
        </h2>


        <button
            class="endeleaBtn"
            onclick="funguaAdmin()"
        >
            ⬅️ Rudi Admin
        </button>


        <div class="booking-card">

            <p>
                Pending:
                <strong>
                    ${formatMoney(totalPending)}
                </strong>
            </p>


            <p>
                Paid:
                <strong>
                    ${formatMoney(totalPaid)}
                </strong>
            </p>

        </div>


        ${
            adminCommissions.length === 0

                ? `
                    <p>
                        Hakuna commission bado.
                    </p>
                `

                : adminCommissions.map(c => `

                    <div class="booking-card">

                        <p>
                            Booking:
                            ${c.bookingNumber}
                        </p>


                        <p>
                            User:
                            ${c.sourceUserPhone}
                        </p>


                        <p>
                            Level:
                            ${c.level}
                        </p>


                        <p>
                            Rate:
                            ${c.rate}%
                        </p>


                        <p>
                            Amount:
                            ${formatMoney(c.amount)}
                        </p>


                        <p>
                            Status:
                            <strong>
                                ${c.status}
                            </strong>
                        </p>


                        ${
                            c.status === "Pending"

                                ? `
                                    <button
                                        class="thibitishaBtn"
                                        onclick="adminLipaCommission('${c.id}')"
                                    >
                                        💵 Mark as Paid
                                    </button>
                                `

                                : `
                                    <p>
                                        ✅ Imelipwa
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
   39. MARK COMMISSION PAID
   ========================================================= */

function adminLipaCommission(id) {

    const commissions =
        getCommissions();


    const commission =
        commissions.find(
            c => c.id === id
        );


    if (!commission) return;


    commission.status =
        "Paid";


    commission.paidAt =
        new Date()
            .toISOString();


    saveCommissions(
        commissions
    );


    alert(
        "Commission imewekwa Paid."
    );


    onyeshaAdminCommission();

}


/* =========================================================
   40. ADMIN REFERRAL
   ========================================================= */

function onyeshaAdminReferral() {

    if (!isAdminLoggedIn()) {

        funguaAdminLogin();

        return;

    }


    const baseURL =
        window.location.origin +
        window.location.pathname;


    const referralLink =
        baseURL +
        "?ref=" +
        ADMIN_REFERRAL_CODE;


    const referrals =
        getReferrals();


    const adminUsers =
        referrals.filter(
            r =>
                r.sponsorPhone === "ADMIN"
        );


    const section =
        document.getElementById(
            "taarifaSection"
        );


    section.innerHTML = `

        <h2>
            🔗 Admin Referral
        </h2>


        <button
            class="endeleaBtn"
            onclick="funguaAdmin()"
        >
            ⬅️ Rudi Admin
        </button>


        <div class="booking-card">

            <p>
                <strong>
                    Referral Code:
                </strong>

                ${ADMIN_REFERRAL_CODE}
            </p>


            <input
                type="text"
                id="adminReferralLink"
                value="${referralLink}"
                readonly
            >


            <button
                class="thibitishaBtn"
                onclick="copyAdminReferral()"
            >
                📋 Copy Referral Link
            </button>

        </div>


        <h3>
            👥 Waliopo chini ya Admin
        </h3>


        <p>
            Jumla:
            ${adminUsers.length}
        </p>


        ${
            adminUsers.length === 0

                ? `
                    <p>
                        Bado hakuna user.
                    </p>
                `

                : adminUsers.map(u => `

                    <div class="booking-card">

                        <p>
                            👤 ${u.name}
                        </p>


                        <p>
                            📱 ${u.phone}
                        </p>


                        <p>
                            🔗 ${u.referralCode}
                        </p>

                    </div>

                `).join("")
        }

    `;

}


/* =========================================================
   41. COPY ADMIN REFERRAL
   ========================================================= */

function copyAdminReferral() {

    const input =
        document.getElementById(
            "adminReferralLink"
        );


    if (!input) return;


    input.select();


    navigator.clipboard
        .writeText(
            input.value
        )
        .then(() => {

            alert(
                "Referral link imenakiliwa."
            );

        })
        .catch(() => {

            document.execCommand(
                "copy"
            );

            alert(
                "Referral link imenakiliwa."
            );

        });

}


/* =========================================================
   42. DETECT REFERRAL
   ========================================================= */

function detectReferral() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    const ref =
        params.get("ref");


    if (!ref) return;


    localStorage.setItem(
        "roomrentIncomingReferral",
        ref
    );

}


/* =========================================================
   43. INITIALIZE ROOMRENT
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        detectReferral();


        onyeshaVyumba();


        /* LOGO ADMIN ACCESS */

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


        /* BUTTON: VYUMBA */

        const angalia =
            document.getElementById(
                "angaliaVyumba"
            );


        if (angalia) {

            angalia.onclick =
                () => {

                    onyeshaVyumba();


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


        /* BUTTON: BOOKINGS */

        const booking =
            document.getElementById(
                "bookingZangu"
            );


        if (booking) {

            booking.onclick =
                onyeshaBookingZangu;

        }


        /* BUTTON: ACCOUNT */

        const account =
            document.getElementById(
                "accountBtn"
            );


        if (account) {

            account.onclick =
                funguaAccount;

        }


        /* BUTTON: TAARIFA */

        const taarifa =
            document.getElementById(
                "taarifaBtn"
            );


        if (taarifa) {

            taarifa.onclick =
                funguaTaarifa;

        }


        /* =====================================
           HUDUMA KWA WATEJA - WHATSAPP
           Namba: 0703551515
           ===================================== */

        const hudumaBtn =
            document.getElementById(
                "hudumaBtn"
            );


        if (hudumaBtn) {

            hudumaBtn.onclick =
                () => {

                    const whatsappNumber =
                        "255703551515";


                    const message =
                        encodeURIComponent(
                            "Habari RoomRent, nahitaji huduma kwa wateja."
                        );


                    window.open(
                        `https://wa.me/${whatsappNumber}?text=${message}`,
                        "_blank"
                    );

                };

        }

    }
);


/* =========================================================
   MWISHO WA ROOMRENT SCRIPT
   ========================================================= */
