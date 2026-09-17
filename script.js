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

        console.log(
            "✅ Firebase Storage iko tayari."
        );

    } catch (error) {

        console.error(
            "❌ Firebase initialization error:",
            error
        );

    }

}


/* =========================================================
   3. GLOBAL VARIABLES
========================================================= */

let currentUser = null;

let currentUserData = null;

let selectedRoom = null;

let unsubscribeUser = null;

let unsubscribeNotifications = null;

let unsubscribeBookings = null;

let mainWalletUnsubscribe = null;

let walletListener = null;

let isAdmin = false;


/* =========================================================
   4. ROOMRENT CONFIGURATION
========================================================= */

const ROOMRENT_SETTINGS = {

    durationDays: 40,

    firstRoomProfitPerDay: 1000,

    userCommissionA: 5,

    userCommissionB: 2,

    userCommissionC: 1,

    adminCommissionA: 20,

    adminCommissionB: 10,

    adminCommissionC: 5,

    minimumWithdrawal: 3000

};


/* =========================================================
   5. ADMIN CONFIGURATION
========================================================= */

const ADMIN_CONFIG = {

    uid:
        "1kj3K591EHhHAOiSoxIp1xGve2x1",

    referralCode:
        "RRADMIN",

    name:
        "RoomRent Admin"

};


/* =========================================================
   6. PAYMENT METHODS
========================================================= */

const PAYMENT_METHODS = {

    AIRTEL_MONEY: {

        name:
            "Airtel Money",

        number:
            "0667872515",

        owner:
            "HARUNA ISSA HAMAD"

    },

    MIXX_BY_YAS: {

        name:
            "MIXX BY YAS",

        number:
            "0651590936",

        owner:
            "HARUNA ISSA HAMAD"

    }

};


/* =========================================================
   7. ROOM DATA
========================================================= */

const ROOMS = [

    {
        roomNumber: "0023",
        price: 30000,
        profitPerDay: 1000,
        days: 40
    },

    {
        roomNumber: "0024",
        price: 70000,
        profitPerDay: 2333.33,
        days: 40
    },

    {
        roomNumber: "0025",
        price: 140000,
        profitPerDay: 4666.67,
        days: 40
    },

    {
        roomNumber: "0026",
        price: 210000,
        profitPerDay: 7000,
        days: 40
    },

    {
        roomNumber: "0027",
        price: 280000,
        profitPerDay: 9333.33,
        days: 40
    },

    {
        roomNumber: "0028",
        price: 350000,
        profitPerDay: 11666.67,
        days: 40
    },

    {
        roomNumber: "0029",
        price: 420000,
        profitPerDay: 14000,
        days: 40
    },

    {
        roomNumber: "0030",
        price: 490000,
        profitPerDay: 16333.33,
        days: 40
    },

    {
        roomNumber: "0031",
        price: 560000,
        profitPerDay: 18666.67,
        days: 40
    },

    {
        roomNumber: "0032",
        price: 630000,
        profitPerDay: 21000,
        days: 40
    }

];


/* =========================================================
   8. HELPER FUNCTIONS
========================================================= */

function getElement(id) {

    return document.getElementById(id);

}


function getCurrentUser() {

    if (auth && auth.currentUser) {

        return auth.currentUser;

    }

    return currentUser;

}


function formatMoney(amount) {

    const number =
        Number(amount || 0);

    return number.toLocaleString(
        "en-US",
        {
            maximumFractionDigits: 2
        }
    );

}


function hideSection(id) {

    const element =
        getElement(id);

    if (element) {

        element.style.display =
            "none";

    }

}


function showSection(id) {

    const element =
        getElement(id);

    if (element) {

        element.style.display =
            "block";

    }

}


function generateReferralCode(name) {

    const cleanName =
        String(name || "USER")
            .trim()
            .toUpperCase()
            .replace(
                /[^A-Z0-9]/g,
                ""
            )
            .substring(
                0,
                8
            );

    const random =
        Math.floor(
            1000 +
            Math.random() * 9000
        );

    return (
        cleanName ||
        "USER"
    ) + random;

}


function generateBookingNumber() {

    return (
        "RR" +
        Date.now()
            .toString()
            .slice(-8) +
        Math.floor(
            100 +
            Math.random() * 900
        )
    );

}


function firebaseErrorMessage(error) {

    if (!error) {

        return "❌ Hitilafu isiyojulikana.";

    }

    switch (error.code) {

        case "auth/email-already-in-use":

            return "❌ Email hii tayari imesajiliwa.";

        case "auth/invalid-email":

            return "❌ Email si sahihi.";

        case "auth/weak-password":

            return "❌ Password ni dhaifu. Tumia angalau characters 6.";

        case "auth/user-not-found":

            return "❌ Account haijapatikana.";

        case "auth/wrong-password":

            return "❌ Password si sahihi.";

        case "auth/invalid-credential":

            return "❌ Email au password si sahihi.";

        case "auth/network-request-failed":

            return "❌ Hakuna connection nzuri ya internet.";

        case "auth/too-many-requests":

            return "❌ Maombi yamekuwa mengi. Jaribu tena baadaye.";

        default:

            return (
                "❌ " +
                (
                    error.message ||
                    "Hitilafu imetokea."
                )
            );

    }

}


/* =========================================================
   9. FIRESTORE TIMESTAMP HELPER
========================================================= */

function serverTimestamp() {

    if (
        firebase &&
        firebase.firestore &&
        firebase.firestore.FieldValue
    ) {

        return firebase.firestore
            .FieldValue
            .serverTimestamp();

    }

    return new Date();

}


/* =========================================================
   10. AUTH CHECK
========================================================= */

function requireLogin() {

    const user =
        getCurrentUser();

    if (!user) {

        alert(
            "Tafadhali ingia kwenye account kwanza."
        );

        return false;

    }

    return true;

}


/* =========================================================
   11. CLEAN DISPLAY
========================================================= */

function clearMainSections() {

    hideSection("vyumba");

    hideSection("fomuKodi");

    hideSection("taarifaSection");

    hideSection("mainWallet");

    hideSection("withdrawalSection");

}


/* =========================================================
   12. ROOM LOOKUP
========================================================= */

function pataRoom(roomNumber) {

    return ROOMS.find(
        function(room) {

            return (
                room.roomNumber ===
                roomNumber
            );

        }
    );

}


/* =========================================================
   13. PROFIT CALCULATION
========================================================= */

function hesabuFaida(room) {

    if (!room) {

        return 0;

    }

    return (
        Number(room.profitPerDay || 0) *
        Number(room.days || 0)
    );

}


/* =========================================================
   14. TOTAL PAYOUT
========================================================= */

function hesabuJumla(room) {

    if (!room) {

        return 0;

    }

    return (
        Number(room.price || 0) +
        hesabuFaida(room)
    );

}


/* =========================================================
   15. REFERRAL URL
========================================================= */

function tengenezaReferralLink(
    referralCode
) {

    const code =
        encodeURIComponent(
            referralCode || ""
        );

    return (
        window.location.origin +
        window.location.pathname +
        "?ref=" +
        code
    );

}


/* =========================================================
   16. GET REFERRAL FROM URL
========================================================= */

function pataReferralKwenyeURL() {

    try {

        const params =
            new URLSearchParams(
                window.location.search
            );

        return (
            params.get("ref") ||
            ""
        )
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
   17. SAVE REFERRAL TEMPORARILY IN MEMORY
========================================================= */

let pendingReferralCode =
    pataReferralKwenyeURL();


/* =========================================================
   18. INITIALIZE FIREBASE
========================================================= */

async function initializeRoomRent() {

    if (!firebase) {

        console.error(
            "Firebase haipo."
        );

        return;

    }

    try {

        if (
            firebase.apps &&
            firebase.apps.length === 0
        ) {

            console.error(
                "❌ Firebase app haijaanzishwa kwenye HTML."
            );

            return;

        }

        auth =
            firebase.auth();

        db =
            firebase.firestore();

        if (firebase.storage) {

            storage =
                firebase.storage();

        }

        console.log(
            "🔥 RoomRent Firebase imeanzishwa."
        );

    } catch (error) {

        console.error(
            "❌ Firebase initialization failed:",
            error
        );

    }

}


/* =========================================================
   19. ENSURE MAIN WALLET
========================================================= */

async function hakikishaMainWallet(uid) {

    if (!uid || !db) {

        throw new Error(
            "User au Firestore haipo."
        );

    }

    const walletRef =
        db.collection(
            "wallets"
        ).doc(uid);

    const snap =
        await walletRef.get();

    if (!snap.exists) {

        const walletData = {

            uid: uid,

            balance: 0,

            bookingEarnings: 0,

            referralCommission: 0,

            totalEarned: 0,

            totalWithdrawn: 0,

            pendingWithdrawal: 0,

            updatedAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp()

        };

        await walletRef.set(
            walletData
        );

        return walletData;

    }

    return snap.data();

}


/* =========================================================
   20. ONGEZA FEDHA KWENYE MAIN WALLET
========================================================= */

async function ongezaMainWallet(
    uid,
    amount,
    source = "other"
) {

    if (!uid || !db) {

        throw new Error(
            "User au Firestore haipo."
        );

    }

    amount =
        Number(
            amount || 0
        );

    if (amount <= 0) {

        return;

    }

    const walletRef =
        db.collection(
            "wallets"
        ).doc(uid);

    await db.runTransaction(
        async function(transaction) {

            const snap =
                await transaction.get(
                    walletRef
                );

            let wallet = {};

            if (snap.exists) {

                wallet =
                    snap.data();

            }

            const oldBalance =
                Number(
                    wallet.balance || 0
                );

            const oldTotalEarned =
                Number(
                    wallet.totalEarned || 0
                );

            const oldBookingEarnings =
                Number(
                    wallet.bookingEarnings || 0
                );

            const oldReferralCommission =
                Number(
                    wallet.referralCommission || 0
                );

            let bookingEarnings =
                oldBookingEarnings;

            let referralCommission =
                oldReferralCommission;

            if (
                source ===
                "booking"
            ) {

                bookingEarnings +=
                    amount;

            } else if (
                source ===
                "referral"
            ) {

                referralCommission +=
                    amount;

            }

            transaction.set(
                walletRef,
                {

                    uid: uid,

                    balance:
                        oldBalance +
                        amount,

                    bookingEarnings:
                        bookingEarnings,

                    referralCommission:
                        referralCommission,

                    totalEarned:
                        oldTotalEarned +
                        amount,

                    updatedAt:
                        firebase.firestore
                            .FieldValue
                            .serverTimestamp()

                },
                {
                    merge: true
                }
            );

        }
    );

}


/* =========================================================
   21. ONYESHA MAIN WALLET
========================================================= */

function onyeshaMainWallet(
    wallet
) {

    const container =
        getElement(
            "mainWallet"
        );

    if (!container) {

        return;

    }

    const balance =
        Number(
            wallet.balance || 0
        );

    const bookingEarnings =
        Number(
            wallet.bookingEarnings || 0
        );

    const referralCommission =
        Number(
            wallet.referralCommission || 0
        );

    const totalEarned =
        Number(
            wallet.totalEarned || 0
        );

    const totalWithdrawn =
        Number(
            wallet.totalWithdrawn || 0
        );

    const pendingWithdrawal =
        Number(
            wallet.pendingWithdrawal || 0
        );


    container.style.display =
        "block";


    container.innerHTML = `

        <div class="booking-card">

            <h2>💰 Salio Kuu</h2>

            <div style="
                font-size:32px;
                font-weight:bold;
                margin:15px 0;
            ">

                TSh ${formatMoney(balance)}

            </div>

            <p>
                Salio lako kuu la RoomRent
            </p>

            <hr>

            <p>
                🏠 Booking:
                <strong>
                    TSh ${formatMoney(
                        bookingEarnings
                    )}
                </strong>
            </p>

            <p>
                👥 Referral:
                <strong>
                    TSh ${formatMoney(
                        referralCommission
                    )}
                </strong>
            </p>

            <p>
                📈 Jumla iliyopatikana:
                <strong>
                    TSh ${formatMoney(
                        totalEarned
                    )}
                </strong>
            </p>

            <p>
                💸 Jumla iliyotolewa:
                <strong>
                    TSh ${formatMoney(
                        totalWithdrawn
                    )}
                </strong>
            </p>

            <p>
                ⏳ Withdrawal pending:
                <strong>
                    TSh ${formatMoney(
                        pendingWithdrawal
                    )}
                </strong>
            </p>

            <button
                class="thibitishaBtn"
                type="button"
                onclick="funguaWithdrawal()"
            >
                💸 Toa Pesa
            </button>

        </div>

    `;

}


/* =========================================================
   22. SIKILIZA MAIN WALLET
========================================================= */

async function anzishaMainWallet() {

    const user =
        getCurrentUser();

    if (!user || !db) {

        return;

    }

    try {

        await hakikishaMainWallet(
            user.uid
        );

        if (
            mainWalletUnsubscribe
        ) {

            mainWalletUnsubscribe();

            mainWalletUnsubscribe =
                null;

        }

        mainWalletUnsubscribe =
            db.collection(
                "wallets"
            )
            .doc(user.uid)
            .onSnapshot(
                function(snapshot) {

                    if (
                        !snapshot.exists
                    ) {

                        return;

                    }

                    onyeshaMainWallet(
                        snapshot.data()
                    );

                },
                function(error) {

                    console.error(
                        "MAIN WALLET ERROR:",
                        error
                    );

                }
            );

    } catch (error) {

        console.error(
            "Main Wallet initialization error:",
            error
        );

    }

}


/* =========================================================
   23. SIMAMISHA MAIN WALLET
========================================================= */

function simamishaMainWallet() {

    if (
        mainWalletUnsubscribe
    ) {

        mainWalletUnsubscribe();

        mainWalletUnsubscribe =
            null;

    }

}


/* =========================================================
   24. OPEN MAIN WALLET
========================================================= */

async function funguaMainWallet() {

    if (!requireLogin()) {

        return;

    }

    clearMainSections();

    const container =
        getElement(
            "mainWallet"
        );

    if (!container) {

        return;

    }

    container.style.display =
        "block";

    await anzishaMainWallet();

    container.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


/* =========================================================
   25. WITHDRAWAL CUSTOMER
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

    const section =
        getElement(
            "withdrawalSection"
        );

    if (!section) {

        console.error(
            "❌ #withdrawalSection haipo kwenye HTML."
        );

        return;

    }

    hideSection("vyumba");

    hideSection("fomuKodi");

    hideSection("taarifaSection");

    hideSection("mainWallet");

    section.style.display =
        "block";

    section.innerHTML = `

        <div class="booking-card">

            <h2>💸 Toa Pesa</h2>

            <p>
                Kiasi cha chini cha withdrawal ni
                <strong>TSh 3,000</strong>.
            </p>

            <div id="withdrawalWalletInfo">
                ⏳ Inapakia salio...
            </div>

            <label>
                Njia ya kupokea pesa
            </label>

            <select id="withdrawalMethod">

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
                Namba ya simu
            </label>

            <input
                type="tel"
                id="withdrawalPhone"
                placeholder="Mfano: 06XXXXXXXX"
            >

            <label>
                Kiasi
            </label>

            <input
                type="number"
                id="withdrawalAmount"
                placeholder="Mfano: 3000"
                min="3000"
                step="1"
            >

            <button
                type="button"
                onclick="tumaWithdrawal()"
            >
                💸 Tuma Ombi
            </button>

            <button
                type="button"
                onclick="fungaWithdrawal()"
            >
                Funga
            </button>

            <p id="withdrawalMessage"></p>

            <div id="withdrawalHistory"></div>

        </div>

    `;

    pakiaWithdrawalData();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* =========================================================
   26. LOAD WITHDRAWAL DATA
========================================================= */

async function pakiaWithdrawalData() {

    const user =
        getCurrentUser();

    if (!user || !db) {

        return;

    }

    const info =
        getElement(
            "withdrawalWalletInfo"
        );

    try {

        const wallet =
            await hakikishaMainWallet(
                user.uid
            );

        if (info) {

            info.innerHTML = `

                <div style="
                    padding:12px;
                    margin:10px 0;
                    border-radius:8px;
                ">

                    💰 Salio:
                    <strong>
                        TSh ${formatMoney(
                            wallet.balance || 0
                        )}
                    </strong>

                    <br>

                    ⏳ Pending:
                    <strong>
                        TSh ${formatMoney(
                            wallet.pendingWithdrawal || 0
                        )}
                    </strong>

                    <br>

                    💸 Jumla iliyotolewa:
                    <strong>
                        TSh ${formatMoney(
                            wallet.totalWithdrawn || 0
                        )}
                    </strong>

                </div>

            `;

        }

        await pakiaHistoriaWithdrawal();

    } catch (error) {

        console.error(
            "Withdrawal wallet error:",
            error
        );

        if (info) {

            info.textContent =
                "❌ Imeshindikana kupakia salio.";

        }

    }

}


/* =========================================================
   27. CLOSE WITHDRAWAL
========================================================= */

function fungaWithdrawal() {

    const container =
        getElement(
            "withdrawalSection"
        );

    if (container) {

        container.style.display =
            "none";

        container.innerHTML =
            "";

    }

}


/* =========================================================
   28. SEND WITHDRAWAL REQUEST
========================================================= */

async function tumaWithdrawal() {

    const user =
        getCurrentUser();

    if (!user) {

        alert(
            "Tafadhali ingia kwenye account kwanza."
        );

        return;

    }

    const methodElement =
        getElement(
            "withdrawalMethod"
        );

    const phoneElement =
        getElement(
            "withdrawalPhone"
        );

    const amountElement =
        getElement(
            "withdrawalAmount"
        );

    const message =
        getElement(
            "withdrawalMessage"
        );

    if (
        !methodElement ||
        !phoneElement ||
        !amountElement
    ) {

        return;

    }

    const method =
        methodElement.value;

    const phone =
        phoneElement.value.trim();

    const amount =
        Number(
            amountElement.value
        );

    if (!method) {

        if (message) {

            message.textContent =
                "❌ Chagua njia ya malipo.";

        }

        return;

    }

    if (!phone) {

        if (message) {

            message.textContent =
                "❌ Weka namba ya simu.";

        }

        return;

    }

    if (
        !amount ||
        amount <
        ROOMRENT_SETTINGS.minimumWithdrawal
    ) {

        if (message) {

            message.textContent =
                "❌ Kiasi cha chini ni TSh 3,000.";

        }

        return;

    }

    try {

        if (message) {

            message.textContent =
                "⏳ Inatuma ombi...";

        }

        const walletRef =
            db.collection(
                "wallets"
            ).doc(user.uid);

        const withdrawalRef =
            db.collection(
                "withdrawals"
            ).doc();

        await db.runTransaction(
            async function(transaction) {

                const walletSnap =
                    await transaction.get(
                        walletRef
                    );

                if (
                    !walletSnap.exists
                ) {

                    throw new Error(
                        "WALLET_NOT_FOUND"
                    );

                }

                const wallet =
                    walletSnap.data();

                const balance =
                    Number(
                        wallet.balance || 0
                    );

                if (
                    amount >
                    balance
                ) {

                    throw new Error(
                        "INSUFFICIENT_BALANCE"
                    );

                }

                transaction.update(
                    walletRef,
                    {

                        balance:
                            balance -
                            amount,

                        pendingWithdrawal:
                            Number(
                                wallet.pendingWithdrawal ||
                                0
                            ) +
                            amount,

                        updatedAt:
                            firebase.firestore
                                .FieldValue
                                .serverTimestamp()

                    }
                );

                transaction.set(
                    withdrawalRef,
                    {

                        withdrawalId:
                            withdrawalRef.id,

                        uid:
                            user.uid,

                        name:
                            currentUserData?.name ||
                            "",

                        email:
                            user.email ||
                            "",

                        method:
                            method,

                        phone:
                            phone,

                        amount:
                            amount,

                        status:
                            "pending",

                        createdAt:
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

        if (message) {

            message.textContent =
                "✅ Ombi lako limetumwa kwa admin.";

        }

        phoneElement.value =
            "";

        amountElement.value =
            "";

        await pakiaWithdrawalData();

    } catch (error) {

        console.error(
            "Withdrawal error:",
            error
        );

        if (
            error.message ===
            "INSUFFICIENT_BALANCE"
        ) {

            if (message) {

                message.textContent =
                    "❌ Salio lako halitoshi.";

            }

        } else if (
            error.message ===
            "WALLET_NOT_FOUND"
        ) {

            if (message) {

                message.textContent =
                    "❌ Wallet haijapatikana.";

            }

        } else {

            if (message) {

                message.textContent =
                    "❌ Imeshindikana kutuma ombi. Jaribu tena.";

            }

        }

    }

}


/* =========================================================
   29. WITHDRAWAL HISTORY
========================================================= */

async function pakiaHistoriaWithdrawal() {

    const user =
        getCurrentUser();

    const container =
        getElement(
            "withdrawalHistory"
        );

    if (
        !user ||
        !db ||
        !container
    ) {

        return;

    }

    try {

        const snapshot =
            await db.collection(
                "withdrawals"
            )
            .where(
                "uid",
                "==",
                user.uid
            )
            .get();

        if (
            snapshot.empty
        ) {

            container.innerHTML = `

                <hr>

                <p>
                    📋 Bado huna historia ya withdrawal.
                </p>

            `;

            return;

        }

        const withdrawals =
            [];

        snapshot.forEach(
            function(doc) {

                withdrawals.push({
                    id: doc.id,
                    ...doc.data()
                });

            }
        );

        withdrawals.sort(
            function(a, b) {

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

        container.innerHTML = `

            <hr>

            <h3>
                📋 Historia ya Withdrawal
            </h3>

            ${withdrawals.map(
                function(item) {

                    return `

                        <div class="booking-card">

                            <p>
                                💸
                                <strong>
                                    TSh ${formatMoney(
                                        item.amount || 0
                                    )}
                                </strong>
                            </p>

                            <p>
                                📱
                                ${item.phone || ""}
                            </p>

                            <p>
                                💳
                                ${item.method || ""}
                            </p>

                            <p>
                                📌 Status:
                                <strong>
                                    ${
                                        item.status ||
                                        "pending"
                                    }
                                </strong>
                            </p>

                        </div>

                    `;

                }
            ).join("")}

        `;

    } catch (error) {

        console.error(
            "Withdrawal history error:",
            error
        );

        container.innerHTML = `

            <p>
                ❌ Imeshindikana kupakia historia ya withdrawal.
            </p>

        `;

    }

}

/* =========================================================
   ROOMRENT - SEHEMU YA 2
   AUTH + REFERRAL + VYUMBA + BOOKING FORM
========================================================= */


/* =========================================================
   30. ESCAPE HTML
========================================================= */

function escapeHTML(value) {

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
   31. SHOW LOGIN MESSAGE
========================================================= */

function onyeshaLoginMessage(
    message,
    type = "error"
) {

    const box =
        getElement("loginMessage");

    if (!box) return;

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
   32. CLEAN EMAIL
========================================================= */

function safishaEmail(email) {

    return String(email || "")
        .trim()
        .toLowerCase();

}


/* =========================================================
   33. SIGN UP USER
========================================================= */

async function signUpUser() {

    if (!auth || !db) {

        alert(
            "❌ Firebase haijawa tayari."
        );

        return;

    }

    const nameInput =
        getElement("signUpName");

    const emailInput =
        getElement("signUpEmail");

    const phoneInput =
        getElement("signUpPhone");

    const passwordInput =
        getElement("signUpPassword");

    const message =
        getElement("signUpMessage");

    const name =
        nameInput?.value.trim() || "";

    const email =
        safishaEmail(
            emailInput?.value
        );

    const phone =
        phoneInput?.value.trim() || "";

    const password =
        passwordInput?.value || "";


    if (!name) {

        onyeshaSignUpMessage(
            "❌ Tafadhali weka jina.",
            "error"
        );

        return;

    }


    if (!email) {

        onyeshaSignUpMessage(
            "❌ Tafadhali weka email.",
            "error"
        );

        return;

    }


    if (!phone) {

        onyeshaSignUpMessage(
            "❌ Tafadhali weka namba ya simu.",
            "error"
        );

        return;

    }


    if (password.length < 6) {

        onyeshaSignUpMessage(
            "❌ Password lazima iwe na angalau characters 6.",
            "error"
        );

        return;

    }


    try {

        if (message) {

            message.textContent =
                "⏳ Inatengeneza account...";

        }

        const credential =
            await auth.createUserWithEmailAndPassword(
                email,
                password
            );

        const user =
            credential.user;


        /* -------------------------------------------------
           REFERRAL CODE YA MTUMIAJI
        ------------------------------------------------- */

        const referralCode =
            generateReferralCode(
                email
            );

        const referralLink =
            tengenezaReferralLink(
                referralCode
            );


        /* -------------------------------------------------
           REFERRAL KUTOKA KWENYE URL
        ------------------------------------------------- */

        const referredBy =
            pendingReferralCode ||
            pataReferralKwenyeURL() ||
            "";


        let referredByUid =
            "";

        let referralType =
            "";


        if (referredBy) {

            if (
                referredBy ===
                ADMIN_CONFIG.referralCode
            ) {

                referredByUid =
                    ADMIN_CONFIG.uid;

                referralType =
                    "admin";

            } else {

                try {

                    const referrerSnapshot =
                        await db
                            .collection("users")
                            .where(
                                "referralCode",
                                "==",
                                referredBy
                            )
                            .limit(1)
                            .get();

                    if (
                        !referrerSnapshot.empty
                    ) {

                        const referrer =
                            referrerSnapshot.docs[0];

                        if (
                            referrer.id !==
                            user.uid
                        ) {

                            referredByUid =
                                referrer.id;

                            referralType =
                                "user";

                        }

                    }

                } catch (referralError) {

                    console.warn(
                        "Referral lookup error:",
                        referralError
                    );

                }

            }

        }


        /* -------------------------------------------------
           CREATE USER DOCUMENT
        ------------------------------------------------- */

        await db
            .collection("users")
            .doc(user.uid)
            .set({

                uid:
                    user.uid,

                name:
                    name,

                email:
                    email,

                phone:
                    phone,

                referralCode:
                    referralCode,

                referralLink:
                    referralLink,

                referredBy:
                    referredBy,

                referredByUid:
                    referredByUid,

                referralType:
                    referralType,

                totalCommission:
                    0,

                totalBookings:
                    0,

                role:
                    "user",

                createdAt:
                    firebase.firestore
                        .FieldValue
                        .serverTimestamp(),

                updatedAt:
                    firebase.firestore
                        .FieldValue
                        .serverTimestamp(),

                lastLogin:
                    firebase.firestore
                        .FieldValue
                        .serverTimestamp()

            });


        /* -------------------------------------------------
           CREATE MAIN WALLET
        ------------------------------------------------- */

        await hakikishaMainWallet(
            user.uid
        );


        /* -------------------------------------------------
           CLEAR REFERRAL
        ------------------------------------------------- */

        pendingReferralCode =
            "";


        if (message) {

            message.textContent =
                "✅ Account imetengenezwa kwa mafanikio.";

        }

        alert(
            "✅ Umejisajili kwa mafanikio!"
        );


        if (
            typeof funguaAccount ===
            "function"
        ) {

            setTimeout(
                function() {

                    funguaAccount();

                },
                500
            );

        }


    } catch (error) {

        console.error(
            "SIGN UP ERROR:",
            error
        );

        const errorMessage =
            firebaseErrorMessage(
                error
            );

        onyeshaSignUpMessage(
            errorMessage,
            "error"
        );

    }

}


/* =========================================================
   34. SIGN UP MESSAGE
========================================================= */

function onyeshaSignUpMessage(
    message,
    type = "error"
) {

    const box =
        getElement("signUpMessage");

    if (!box) {

        alert(message);

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
   35. SIGN IN USER
========================================================= */

async function signInUser() {

    if (!auth || !db) {

        alert(
            "❌ Firebase haijawa tayari."
        );

        return;

    }

    const emailInput =
        getElement("signInEmail");

    const passwordInput =
        getElement("signInPassword");

    const email =
        safishaEmail(
            emailInput?.value
        );

    const password =
        passwordInput?.value || "";


    if (!email) {

        onyeshaSignInMessage(
            "❌ Weka email.",
            "error"
        );

        return;

    }


    if (!password) {

        onyeshaSignInMessage(
            "❌ Weka password.",
            "error"
        );

        return;

    }


    try {

        onyeshaSignInMessage(
            "⏳ Inaingia...",
            "success"
        );


        const credential =
            await auth
                .signInWithEmailAndPassword(
                    email,
                    password
                );


        const user =
            credential.user;


        /* -------------------------------------------------
           LOAD USER DATA
        ------------------------------------------------- */

        const userRef =
            db
                .collection("users")
                .doc(user.uid);

        const userSnap =
            await userRef.get();


        if (
            userSnap.exists
        ) {

            currentUserData =
                userSnap.data();

        } else {

            currentUserData = {

                uid:
                    user.uid,

                email:
                    user.email || "",

                role:
                    "user"

            };

        }


        /* -------------------------------------------------
           UPDATE LAST LOGIN
        ------------------------------------------------- */

        await userRef.set({

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


        /* -------------------------------------------------
           START WALLET
        ------------------------------------------------- */

        await hakikishaMainWallet(
            user.uid
        );


        onyeshaSignInMessage(
            "✅ Umeingia kwenye account.",
            "success"
        );


        setTimeout(
            function() {

                if (
                    typeof funguaAccount ===
                    "function"
                ) {

                    funguaAccount();

                }

            },
            500
        );


    } catch (error) {

        console.error(
            "SIGN IN ERROR:",
            error
        );

        onyeshaSignInMessage(
            firebaseErrorMessage(
                error
            ),
            "error"
        );

    }

}


/* =========================================================
   36. SIGN IN MESSAGE
========================================================= */

function onyeshaSignInMessage(
    message,
    type = "error"
) {

    const box =
        getElement("signInMessage");

    if (!box) {

        alert(message);

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
   37. SIGN OUT
========================================================= */

async function signOutUser() {

    try {

        if (auth) {

            await auth.signOut();

        }

        currentUser =
            null;

        currentUserData =
            null;

        isAdmin =
            false;


        simamishaMainWallet();


        clearMainSections();


        const account =
            getElement(
                "accountSection"
            );

        if (account) {

            account.style.display =
                "none";

            account.innerHTML =
                "";

        }


        alert(
            "✅ Umetoka kwenye account."
        );


    } catch (error) {

        console.error(
            "SIGN OUT ERROR:",
            error
        );

        alert(
            "❌ Imeshindikana kutoka."
        );

    }

}


/* =========================================================
   38. AUTH STATE LISTENER
========================================================= */

function anzishaAuthListener() {

    if (!auth) {

        return;

    }


    auth.onAuthStateChanged(
        async function(user) {

            currentUser =
                user || null;


            if (!user) {

                currentUserData =
                    null;

                isAdmin =
                    false;

                simamishaMainWallet();

                clearMainSections();

                console.log(
                    "ℹ️ Hakuna user aliyeingia."
                );

                return;

            }


            try {

                const userRef =
                    db
                        .collection("users")
                        .doc(user.uid);

                const userSnap =
                    await userRef.get();


                if (
                    userSnap.exists
                ) {

                    currentUserData =
                        userSnap.data();

                } else {

                    currentUserData = {

                        uid:
                            user.uid,

                        email:
                            user.email || "",

                        role:
                            "user"

                    };

                }


                isAdmin =
                    (
                        currentUserData.role ===
                        "admin"
                    ) ||
                    (
                        user.uid ===
                        ADMIN_CONFIG.uid
                    );


                await hakikishaMainWallet(
                    user.uid
                );

                await anzishaMainWallet();


                console.log(
                    "✅ User ameingia:",
                    user.email
                );


                if (isAdmin) {

                    console.log(
                        "🔐 Admin account imegunduliwa."
                    );

                }


            } catch (error) {

                console.error(
                    "AUTH STATE ERROR:",
                    error
                );

            }

        }
    );

}


/* =========================================================
   39. ADMIN REFERRAL LINK
========================================================= */

async function wekaAdminReferralLink() {

    if (!db) {

        return "";

    }

    try {

        const adminRef =
            db
                .collection("users")
                .doc(
                    ADMIN_CONFIG.uid
                );

        const adminSnap =
            await adminRef.get();


        if (!adminSnap.exists) {

            console.warn(
                "⚠️ Admin user document haipo."
            );

            return "";

        }


        const adminReferralLink =
            tengenezaReferralLink(
                ADMIN_CONFIG.referralCode
            );


        await adminRef.set({

            referralCode:
                ADMIN_CONFIG.referralCode,

            referralLink:
                adminReferralLink,

            referralType:
                "admin",

            updatedAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp()

        }, {
            merge: true
        });


        console.log(
            "✅ Admin referral link:",
            adminReferralLink
        );


        return adminReferralLink;


    } catch (error) {

        console.error(
            "ADMIN REFERRAL ERROR:",
            error
        );

        return "";

    }

}


/* =========================================================
   40. SAVE USER REFERRAL
========================================================= */

async function hifadhiReferralMpya(
    uid
) {

    if (!uid || !db) {

        return "";

    }


    try {

        const referralCode =
            pendingReferralCode ||
            pataReferralKwenyeURL();


        if (!referralCode) {

            return "";

        }


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


        if (
            userData.referredBy
        ) {

            return userData.referredBy;

        }


        if (
            referralCode ===
            ADMIN_CONFIG.referralCode
        ) {

            await userRef.set({

                referredBy:
                    ADMIN_CONFIG.referralCode,

                referredByUid:
                    ADMIN_CONFIG.uid,

                referralType:
                    "admin",

                updatedAt:
                    firebase.firestore
                        .FieldValue
                        .serverTimestamp()

            }, {
                merge: true
            });


            pendingReferralCode =
                "";


            return ADMIN_CONFIG.referralCode;

        }


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

            return "";

        }


        const referrer =
            snapshot.docs[0];


        if (
            referrer.id ===
            uid
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


        pendingReferralCode =
            "";


        return referralCode;


    } catch (error) {

        console.error(
            "REFERRAL SAVE ERROR:",
            error
        );

        return "";

    }

}


/* =========================================================
   41. DISPLAY ROOMS
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
            "❌ #vyumba haipo kwenye HTML."
        );

        return;

    }


    hideSection(
        "fomuKodi"
    );

    hideSection(
        "taarifaSection"
    );

    hideSection(
        "mainWallet"
    );

    hideSection(
        "withdrawalSection"
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


    ROOMS.forEach(
        function(room) {

            const totalProfit =
                hesabuFaida(room);

            const totalPayout =
                hesabuJumla(room);


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
                    💰 Bei ya chumba:
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
                        ${room.days}
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

                <p>
                    💰 Jumla baada ya mzunguko:
                    <strong>
                        TSh ${formatMoney(
                            totalPayout
                        )}
                    </strong>
                </p>

                <button
                    class="thibitishaBtn"
                    type="button"
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
   42. OPEN BOOKING FORM
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
        ROOMS.find(
            function(item) {

                return (
                    item.roomNumber ===
                    roomNumber
                );

            }
        );


    if (!room) {

        alert(
            "❌ Chumba hakikupatikana."
        );

        return;

    }


    selectedRoom =
        room;


    hideSection(
        "vyumba"
    );

    hideSection(
        "taarifaSection"
    );

    hideSection(
        "mainWallet"
    );

    hideSection(
        "withdrawalSection"
    );


    const container =
        getElement(
            "fomuKodi"
        );


    if (!container) {

        return;

    }


    container.style.display =
        "block";


    container.innerHTML = `

        <div class="booking-card">

            <button
                type="button"
                onclick="fungaFomuKodi()"
            >
                ✕ Funga
            </button>

            <h2>
                🏠 Kodi Chumba
                ${escapeHTML(
                    room.roomNumber
                )}
            </h2>

            <hr>

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
                    ${room.days} siku
                </strong>
            </p>

            <p>
                💵 Faida ya mzunguko:
                <strong>
                    TSh ${formatMoney(
                        hesabuFaida(room)
                    )}
                </strong>
            </p>

            <p>
                💰 Jumla:
                <strong>
                    TSh ${formatMoney(
                        hesabuJumla(room)
                    )}
                </strong>
            </p>

            <hr>

            <label>
                👤 Jina
            </label>

            <input
                type="text"
                id="bookingName"
                value="${escapeHTML(
                    currentUserData?.name || ""
                )}"
                placeholder="Jina lako"
            >

            <label>
                📞 Namba ya simu
            </label>

            <input
                type="tel"
                id="bookingPhone"
                value="${escapeHTML(
                    currentUserData?.phone || ""
                )}"
                placeholder="06XXXXXXXX"
            >

            <button
                class="thibitishaBtn"
                type="button"
                onclick="endeleaMalipo()"
            >
                💳 Endelea na Malipo
            </button>

            <p id="bookingMessage"></p>

        </div>

    `;


    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}


/* =========================================================
   43. CLOSE BOOKING FORM
========================================================= */

function fungaFomuKodi() {

    const container =
        getElement(
            "fomuKodi"
        );

    if (container) {

        container.style.display =
            "none";

        container.innerHTML =
            "";

    }

    selectedRoom =
        null;

}


/* =========================================================
   44. CONTINUE TO PAYMENT
========================================================= */

function endeleaMalipo() {

    const user =
        getCurrentUser();


    if (!user) {

        alert(
            "Tafadhali ingia kwanza."
        );

        return;

    }


    if (!selectedRoom) {

        alert(
            "❌ Chumba hakijachaguliwa."
        );

        return;

    }


    const name =
        getElement(
            "bookingName"
        )?.value.trim() || "";


    const phone =
        getElement(
            "bookingPhone"
        )?.value.trim() || "";


    const message =
        getElement(
            "bookingMessage"
        );


    if (!name) {

        if (message) {

            message.textContent =
                "❌ Weka jina.";

        }

        return;

    }


    if (
        !/^[0-9]{10}$/.test(phone)
    ) {

        if (message) {

            message.textContent =
                "❌ Weka namba ya simu yenye tarakimu 10.";

        }

        return;

    }


    selectedRoom.bookingName =
        name;

    selectedRoom.bookingPhone =
        phone;


    funguaMalipo();

}


/* =========================================================
   MWISHO WA SEHEMU YA 2
========================================================= *//* =========================================================
   ROOMRENT - SEHEMU YA 2
   AUTH + REFERRAL + VYUMBA + BOOKING FORM
========================================================= */


/* =========================================================
   30. ESCAPE HTML
========================================================= */

function escapeHTML(value) {

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
   31. SHOW LOGIN MESSAGE
========================================================= */

function onyeshaLoginMessage(
    message,
    type = "error"
) {

    const box =
        getElement("loginMessage");

    if (!box) return;

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
   32. CLEAN EMAIL
========================================================= */

function safishaEmail(email) {

    return String(email || "")
        .trim()
        .toLowerCase();

}


/* =========================================================
   33. SIGN UP USER
========================================================= */

async function signUpUser() {

    if (!auth || !db) {

        alert(
            "❌ Firebase haijawa tayari."
        );

        return;

    }

    const nameInput =
        getElement("signUpName");

    const emailInput =
        getElement("signUpEmail");

    const phoneInput =
        getElement("signUpPhone");

    const passwordInput =
        getElement("signUpPassword");

    const message =
        getElement("signUpMessage");

    const name =
        nameInput?.value.trim() || "";

    const email =
        safishaEmail(
            emailInput?.value
        );

    const phone =
        phoneInput?.value.trim() || "";

    const password =
        passwordInput?.value || "";


    if (!name) {

        onyeshaSignUpMessage(
            "❌ Tafadhali weka jina.",
            "error"
        );

        return;

    }


    if (!email) {

        onyeshaSignUpMessage(
            "❌ Tafadhali weka email.",
            "error"
        );

        return;

    }


    if (!phone) {

        onyeshaSignUpMessage(
            "❌ Tafadhali weka namba ya simu.",
            "error"
        );

        return;

    }


    if (password.length < 6) {

        onyeshaSignUpMessage(
            "❌ Password lazima iwe na angalau characters 6.",
            "error"
        );

        return;

    }


    try {

        if (message) {

            message.textContent =
                "⏳ Inatengeneza account...";

        }

        const credential =
            await auth.createUserWithEmailAndPassword(
                email,
                password
            );

        const user =
            credential.user;


        /* -------------------------------------------------
           REFERRAL CODE YA MTUMIAJI
        ------------------------------------------------- */

        const referralCode =
            generateReferralCode(
                email
            );

        const referralLink =
            tengenezaReferralLink(
                referralCode
            );


        /* -------------------------------------------------
           REFERRAL KUTOKA KWENYE URL
        ------------------------------------------------- */

        const referredBy =
            pendingReferralCode ||
            pataReferralKwenyeURL() ||
            "";


        let referredByUid =
            "";

        let referralType =
            "";


        if (referredBy) {

            if (
                referredBy ===
                ADMIN_CONFIG.referralCode
            ) {

                referredByUid =
                    ADMIN_CONFIG.uid;

                referralType =
                    "admin";

            } else {

                try {

                    const referrerSnapshot =
                        await db
                            .collection("users")
                            .where(
                                "referralCode",
                                "==",
                                referredBy
                            )
                            .limit(1)
                            .get();

                    if (
                        !referrerSnapshot.empty
                    ) {

                        const referrer =
                            referrerSnapshot.docs[0];

                        if (
                            referrer.id !==
                            user.uid
                        ) {

                            referredByUid =
                                referrer.id;

                            referralType =
                                "user";

                        }

                    }

                } catch (referralError) {

                    console.warn(
                        "Referral lookup error:",
                        referralError
                    );

                }

            }

        }


        /* -------------------------------------------------
           CREATE USER DOCUMENT
        ------------------------------------------------- */

        await db
            .collection("users")
            .doc(user.uid)
            .set({

                uid:
                    user.uid,

                name:
                    name,

                email:
                    email,

                phone:
                    phone,

                referralCode:
                    referralCode,

                referralLink:
                    referralLink,

                referredBy:
                    referredBy,

                referredByUid:
                    referredByUid,

                referralType:
                    referralType,

                totalCommission:
                    0,

                totalBookings:
                    0,

                role:
                    "user",

                createdAt:
                    firebase.firestore
                        .FieldValue
                        .serverTimestamp(),

                updatedAt:
                    firebase.firestore
                        .FieldValue
                        .serverTimestamp(),

                lastLogin:
                    firebase.firestore
                        .FieldValue
                        .serverTimestamp()

            });


        /* -------------------------------------------------
           CREATE MAIN WALLET
        ------------------------------------------------- */

        await hakikishaMainWallet(
            user.uid
        );


        /* -------------------------------------------------
           CLEAR REFERRAL
        ------------------------------------------------- */

        pendingReferralCode =
            "";


        if (message) {

            message.textContent =
                "✅ Account imetengenezwa kwa mafanikio.";

        }

        alert(
            "✅ Umejisajili kwa mafanikio!"
        );


        if (
            typeof funguaAccount ===
            "function"
        ) {

            setTimeout(
                function() {

                    funguaAccount();

                },
                500
            );

        }


    } catch (error) {

        console.error(
            "SIGN UP ERROR:",
            error
        );

        const errorMessage =
            firebaseErrorMessage(
                error
            );

        onyeshaSignUpMessage(
            errorMessage,
            "error"
        );

    }

}


/* =========================================================
   34. SIGN UP MESSAGE
========================================================= */

function onyeshaSignUpMessage(
    message,
    type = "error"
) {

    const box =
        getElement("signUpMessage");

    if (!box) {

        alert(message);

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
   35. SIGN IN USER
========================================================= */

async function signInUser() {

    if (!auth || !db) {

        alert(
            "❌ Firebase haijawa tayari."
        );

        return;

    }

    const emailInput =
        getElement("signInEmail");

    const passwordInput =
        getElement("signInPassword");

    const email =
        safishaEmail(
            emailInput?.value
        );

    const password =
        passwordInput?.value || "";


    if (!email) {

        onyeshaSignInMessage(
            "❌ Weka email.",
            "error"
        );

        return;

    }


    if (!password) {

        onyeshaSignInMessage(
            "❌ Weka password.",
            "error"
        );

        return;

    }


    try {

        onyeshaSignInMessage(
            "⏳ Inaingia...",
            "success"
        );


        const credential =
            await auth
                .signInWithEmailAndPassword(
                    email,
                    password
                );


        const user =
            credential.user;


        /* -------------------------------------------------
           LOAD USER DATA
        ------------------------------------------------- */

        const userRef =
            db
                .collection("users")
                .doc(user.uid);

        const userSnap =
            await userRef.get();


        if (
            userSnap.exists
        ) {

            currentUserData =
                userSnap.data();

        } else {

            currentUserData = {

                uid:
                    user.uid,

                email:
                    user.email || "",

                role:
                    "user"

            };

        }


        /* -------------------------------------------------
           UPDATE LAST LOGIN
        ------------------------------------------------- */

        await userRef.set({

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


        /* -------------------------------------------------
           START WALLET
        ------------------------------------------------- */

        await hakikishaMainWallet(
            user.uid
        );


        onyeshaSignInMessage(
            "✅ Umeingia kwenye account.",
            "success"
        );


        setTimeout(
            function() {

                if (
                    typeof funguaAccount ===
                    "function"
                ) {

                    funguaAccount();

                }

            },
            500
        );


    } catch (error) {

        console.error(
            "SIGN IN ERROR:",
            error
        );

        onyeshaSignInMessage(
            firebaseErrorMessage(
                error
            ),
            "error"
        );

    }

}


/* =========================================================
   36. SIGN IN MESSAGE
========================================================= */

function onyeshaSignInMessage(
    message,
    type = "error"
) {

    const box =
        getElement("signInMessage");

    if (!box) {

        alert(message);

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
   37. SIGN OUT
========================================================= */

async function signOutUser() {

    try {

        if (auth) {

            await auth.signOut();

        }

        currentUser =
            null;

        currentUserData =
            null;

        isAdmin =
            false;


        simamishaMainWallet();


        clearMainSections();


        const account =
            getElement(
                "accountSection"
            );

        if (account) {

            account.style.display =
                "none";

            account.innerHTML =
                "";

        }


        alert(
            "✅ Umetoka kwenye account."
        );


    } catch (error) {

        console.error(
            "SIGN OUT ERROR:",
            error
        );

        alert(
            "❌ Imeshindikana kutoka."
        );

    }

}


/* =========================================================
   38. AUTH STATE LISTENER
========================================================= */

function anzishaAuthListener() {

    if (!auth) {

        return;

    }


    auth.onAuthStateChanged(
        async function(user) {

            currentUser =
                user || null;


            if (!user) {

                currentUserData =
                    null;

                isAdmin =
                    false;

                simamishaMainWallet();

                clearMainSections();

                console.log(
                    "ℹ️ Hakuna user aliyeingia."
                );

                return;

            }


            try {

                const userRef =
                    db
                        .collection("users")
                        .doc(user.uid);

                const userSnap =
                    await userRef.get();


                if (
                    userSnap.exists
                ) {

                    currentUserData =
                        userSnap.data();

                } else {

                    currentUserData = {

                        uid:
                            user.uid,

                        email:
                            user.email || "",

                        role:
                            "user"

                    };

                }


                isAdmin =
                    (
                        currentUserData.role ===
                        "admin"
                    ) ||
                    (
                        user.uid ===
                        ADMIN_CONFIG.uid
                    );


                await hakikishaMainWallet(
                    user.uid
                );

                await anzishaMainWallet();


                console.log(
                    "✅ User ameingia:",
                    user.email
                );


                if (isAdmin) {

                    console.log(
                        "🔐 Admin account imegunduliwa."
                    );

                }


            } catch (error) {

                console.error(
                    "AUTH STATE ERROR:",
                    error
                );

            }

        }
    );

}


/* =========================================================
   39. ADMIN REFERRAL LINK
========================================================= */

async function wekaAdminReferralLink() {

    if (!db) {

        return "";

    }

    try {

        const adminRef =
            db
                .collection("users")
                .doc(
                    ADMIN_CONFIG.uid
                );

        const adminSnap =
            await adminRef.get();


        if (!adminSnap.exists) {

            console.warn(
                "⚠️ Admin user document haipo."
            );

            return "";

        }


        const adminReferralLink =
            tengenezaReferralLink(
                ADMIN_CONFIG.referralCode
            );


        await adminRef.set({

            referralCode:
                ADMIN_CONFIG.referralCode,

            referralLink:
                adminReferralLink,

            referralType:
                "admin",

            updatedAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp()

        }, {
            merge: true
        });


        console.log(
            "✅ Admin referral link:",
            adminReferralLink
        );


        return adminReferralLink;


    } catch (error) {

        console.error(
            "ADMIN REFERRAL ERROR:",
            error
        );

        return "";

    }

}


/* =========================================================
   40. SAVE USER REFERRAL
========================================================= */

async function hifadhiReferralMpya(
    uid
) {

    if (!uid || !db) {

        return "";

    }


    try {

        const referralCode =
            pendingReferralCode ||
            pataReferralKwenyeURL();


        if (!referralCode) {

            return "";

        }


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


        if (
            userData.referredBy
        ) {

            return userData.referredBy;

        }


        if (
            referralCode ===
            ADMIN_CONFIG.referralCode
        ) {

            await userRef.set({

                referredBy:
                    ADMIN_CONFIG.referralCode,

                referredByUid:
                    ADMIN_CONFIG.uid,

                referralType:
                    "admin",

                updatedAt:
                    firebase.firestore
                        .FieldValue
                        .serverTimestamp()

            }, {
                merge: true
            });


            pendingReferralCode =
                "";


            return ADMIN_CONFIG.referralCode;

        }


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

            return "";

        }


        const referrer =
            snapshot.docs[0];


        if (
            referrer.id ===
            uid
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


        pendingReferralCode =
            "";


        return referralCode;


    } catch (error) {

        console.error(
            "REFERRAL SAVE ERROR:",
            error
        );

        return "";

    }

}


/* =========================================================
   41. DISPLAY ROOMS
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
            "❌ #vyumba haipo kwenye HTML."
        );

        return;

    }


    hideSection(
        "fomuKodi"
    );

    hideSection(
        "taarifaSection"
    );

    hideSection(
        "mainWallet"
    );

    hideSection(
        "withdrawalSection"
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


    ROOMS.forEach(
        function(room) {

            const totalProfit =
                hesabuFaida(room);

            const totalPayout =
                hesabuJumla(room);


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
                    💰 Bei ya chumba:
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
                        ${room.days}
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

                <p>
                    💰 Jumla baada ya mzunguko:
                    <strong>
                        TSh ${formatMoney(
                            totalPayout
                        )}
                    </strong>
                </p>

                <button
                    class="thibitishaBtn"
                    type="button"
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
   42. OPEN BOOKING FORM
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
        ROOMS.find(
            function(item) {

                return (
                    item.roomNumber ===
                    roomNumber
                );

            }
        );


    if (!room) {

        alert(
            "❌ Chumba hakikupatikana."
        );

        return;

    }


    selectedRoom =
        room;


    hideSection(
        "vyumba"
    );

    hideSection(
        "taarifaSection"
    );

    hideSection(
        "mainWallet"
    );

    hideSection(
        "withdrawalSection"
    );


    const container =
        getElement(
            "fomuKodi"
        );


    if (!container) {

        return;

    }


    container.style.display =
        "block";


    container.innerHTML = `

        <div class="booking-card">

            <button
                type="button"
                onclick="fungaFomuKodi()"
            >
                ✕ Funga
            </button>

            <h2>
                🏠 Kodi Chumba
                ${escapeHTML(
                    room.roomNumber
                )}
            </h2>

            <hr>

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
                    ${room.days} siku
                </strong>
            </p>

            <p>
                💵 Faida ya mzunguko:
                <strong>
                    TSh ${formatMoney(
                        hesabuFaida(room)
                    )}
                </strong>
            </p>

            <p>
                💰 Jumla:
                <strong>
                    TSh ${formatMoney(
                        hesabuJumla(room)
                    )}
                </strong>
            </p>

            <hr>

            <label>
                👤 Jina
            </label>

            <input
                type="text"
                id="bookingName"
                value="${escapeHTML(
                    currentUserData?.name || ""
                )}"
                placeholder="Jina lako"
            >

            <label>
                📞 Namba ya simu
            </label>

            <input
                type="tel"
                id="bookingPhone"
                value="${escapeHTML(
                    currentUserData?.phone || ""
                )}"
                placeholder="06XXXXXXXX"
            >

            <button
                class="thibitishaBtn"
                type="button"
                onclick="endeleaMalipo()"
            >
                💳 Endelea na Malipo
            </button>

            <p id="bookingMessage"></p>

        </div>

    `;


    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}


/* =========================================================
   43. CLOSE BOOKING FORM
========================================================= */

function fungaFomuKodi() {

    const container =
        getElement(
            "fomuKodi"
        );

    if (container) {

        container.style.display =
            "none";

        container.innerHTML =
            "";

    }

    selectedRoom =
        null;

}


/* =========================================================
   44. CONTINUE TO PAYMENT
========================================================= */

function endeleaMalipo() {

    const user =
        getCurrentUser();


    if (!user) {

        alert(
            "Tafadhali ingia kwanza."
        );

        return;

    }


    if (!selectedRoom) {

        alert(
            "❌ Chumba hakijachaguliwa."
        );

        return;

    }


    const name =
        getElement(
            "bookingName"
        )?.value.trim() || "";


    const phone =
        getElement(
            "bookingPhone"
        )?.value.trim() || "";


    const message =
        getElement(
            "bookingMessage"
        );


    if (!name) {

        if (message) {

            message.textContent =
                "❌ Weka jina.";

        }

        return;

    }


    if (
        !/^[0-9]{10}$/.test(phone)
    ) {

        if (message) {

            message.textContent =
                "❌ Weka namba ya simu yenye tarakimu 10.";

        }

        return;

    }


    selectedRoom.bookingName =
        name;

    selectedRoom.bookingPhone =
        phone;


    funguaMalipo();

}


/* =========================================================
   MWISHO WA SEHEMU YA 2
========================================================= */

/* =========================================================
   ROOMRENT - SEHEMU YA 3
   MALIPO + BOOKING + PAYMENT REQUEST
   ========================================================= */


/* =========================================================
   1. FUNGUA UKURASA WA MALIPO
========================================================= */

function funguaMalipo() {

    const user = getCurrentUser();

    if (!user) {
        alert("Tafadhali ingia kwanza kwenye akaunti yako.");
        return;
    }

    if (!selectedRoom) {
        alert("Hakuna chumba kilichochaguliwa.");
        return;
    }

    const section = getElement("fomuKodi");

    if (!section) return;

    const roomPrice = Number(selectedRoom.price || 0);
    const profitPerDay = Number(
        selectedRoom.profitPerDay || 0
    );

    const days = Number(
        selectedRoom.days ||
        ROOMRENT_SETTINGS.durationDays ||
        40
    );

    const totalProfit = Number(
        (profitPerDay * days).toFixed(2)
    );

    section.style.display = "block";

    section.innerHTML = `

        <div class="payment-box">

            <h2>💳 Malipo ya RoomRent</h2>

            <div class="booking-summary">

                <h3>🏠 Chumba ${escapeHTML(
                    selectedRoom.roomNumber
                )}</h3>

                <p>
                    💰 Kiasi:
                    <strong>
                        TSh ${formatMoney(roomPrice)}
                    </strong>
                </p>

                <p>
                    📅 Muda:
                    <strong>
                        ${days} siku
                    </strong>
                </p>

                <p>
                    📈 Faida kwa siku:
                    <strong>
                        TSh ${formatMoney(profitPerDay)}
                    </strong>
                </p>

                <p>
                    💵 Faida ya jumla:
                    <strong>
                        TSh ${formatMoney(totalProfit)}
                    </strong>
                </p>

            </div>


            <hr>


            <h3>📱 Chagua Njia ya Malipo</h3>

            <div class="payment-methods">

                <label class="payment-option">

                    <input
                        type="radio"
                        name="paymentMethod"
                        value="AIRTEL_MONEY"
                    >

                    <span>
                        🔴 Airtel Money
                    </span>

                </label>


                <label class="payment-option">

                    <input
                        type="radio"
                        name="paymentMethod"
                        value="MIXX_BY_YAS"
                    >

                    <span>
                        🟣 MIXX BY YAS
                    </span>

                </label>

            </div>


            <div
                id="paymentInstructions"
                style="display:none;"
            ></div>


            <div class="payment-inputs">

                <label>
                    📞 Namba uliyotumia kulipa
                </label>

                <input
                    id="paymentSenderPhone"
                    type="tel"
                    inputmode="numeric"
                    maxlength="10"
                    placeholder="Mfano: 07XXXXXXXX"
                >


                <label>
                    🧾 Transaction / Reference Number
                </label>

                <input
                    id="paymentReference"
                    type="text"
                    maxlength="100"
                    placeholder="Weka namba ya muamala"
                >

            </div>


            <button
                type="button"
                id="submitPaymentRequestBtn"
                class="primary-btn"
                onclick="tumaOmbiLaMalipo()"
            >
                📤 Tuma Ombi la Malipo
            </button>


            <button
                type="button"
                class="secondary-btn"
                onclick="fungaFomuKodi()"
            >
                ↩️ Rudi
            </button>


            <div id="paymentMessage"></div>

        </div>
    `;


    /* =====================================================
       PAYMENT METHOD LISTENERS
    ===================================================== */

    const paymentInputs =
        document.querySelectorAll(
            'input[name="paymentMethod"]'
        );


    paymentInputs.forEach(input => {

        input.addEventListener(
            "change",
            function () {

                onyeshaMaelekezoYaMalipo(
                    this.value
                );

            }
        );

    });


    section.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


/* =========================================================
   2. ONYESHA NAMBA YA MALIPO
========================================================= */

function onyeshaMaelekezoYaMalipo(method) {

    const box =
        getElement("paymentInstructions");

    if (!box) return;


    let payment = null;


    if (method === "AIRTEL_MONEY") {

        payment =
            PAYMENT_METHODS.AIRTEL_MONEY;

    }


    if (method === "MIXX_BY_YAS") {

        payment =
            PAYMENT_METHODS.MIXX_BY_YAS;

    }


    if (!payment) {

        box.style.display = "none";
        return;

    }


    box.style.display = "block";


    box.innerHTML = `

        <div class="payment-instruction-box">

            <h4>
                ${escapeHTML(payment.name)}
            </h4>

            <p>
                📞 Lipa kupitia:
                <strong>
                    ${escapeHTML(payment.number)}
                </strong>
            </p>

            <p>
                👤 Jina:
                <strong>
                    ${escapeHTML(payment.owner)}
                </strong>
            </p>

            <p>
                Baada ya kufanya malipo,
                weka namba ya muamala hapa chini.
            </p>

        </div>
    `;
}


/* =========================================================
   3. VALIDATE PHONE
========================================================= */

function niNambaYaSimuSahihi(phone) {

    const clean =
        String(phone || "")
            .replace(/\s+/g, "")
            .trim();

    return /^0\d{9}$/.test(clean);
}


/* =========================================================
   4. PATA PAYMENT METHOD
========================================================= */

function pataPaymentMethod() {

    const selected =
        document.querySelector(
            'input[name="paymentMethod"]:checked'
        );

    return selected
        ? selected.value
        : "";
}


/* =========================================================
   5. TUMA OMBI LA MALIPO
========================================================= */

async function tumaOmbiLaMalipo() {

    const user = getCurrentUser();

    if (!user) {

        alert(
            "Tafadhali ingia kwanza kwenye akaunti yako."
        );

        return;
    }


    if (!selectedRoom) {

        alert(
            "Hakuna chumba kilichochaguliwa."
        );

        return;
    }


    const paymentMethod =
        pataPaymentMethod();


    if (!paymentMethod) {

        alert(
            "Tafadhali chagua njia ya malipo."
        );

        return;
    }


    const senderPhone =
        String(
            getElement(
                "paymentSenderPhone"
            )?.value || ""
        )
        .replace(/\s+/g, "")
        .trim();


    const paymentReference =
        String(
            getElement(
                "paymentReference"
            )?.value || ""
        )
        .trim();


    if (!niNambaYaSimuSahihi(senderPhone)) {

        alert(
            "Tafadhali weka namba sahihi ya simu yenye tarakimu 10."
        );

        return;
    }


    if (!paymentReference) {

        alert(
            "Tafadhali weka Transaction / Reference Number."
        );

        return;
    }


    const message =
        getElement("paymentMessage");


    if (message) {

        message.innerHTML = `
            <p>
                ⏳ Tunatuma ombi lako la malipo...
            </p>
        `;

    }


    const button =
        getElement(
            "submitPaymentRequestBtn"
        );


    if (button) {

        button.disabled = true;

        button.textContent =
            "⏳ Inatuma...";
    }


    try {

        const bookingNumber =
            generateBookingNumber();


        const roomPrice =
            Number(
                selectedRoom.price || 0
            );


        const profitPerDay =
            Number(
                selectedRoom.profitPerDay || 0
            );


        const days =
            Number(
                selectedRoom.days ||
                ROOMRENT_SETTINGS.durationDays ||
                40
            );


        const totalProfit =
            Number(
                (profitPerDay * days)
                    .toFixed(2)
            );


        const paymentInfo =
            paymentMethod === "AIRTEL_MONEY"
                ? PAYMENT_METHODS.AIRTEL_MONEY
                : PAYMENT_METHODS.MIXX_BY_YAS;


        /* =================================================
           BOOKING DATA
        ================================================= */

        const bookingData = {

            bookingNumber: bookingNumber,

            uid: user.uid,

            userId: user.uid,

            customerName:
                selectedRoom.bookingName ||
                currentUserData?.name ||
                "",

            customerEmail:
                currentUserData?.email ||
                user.email ||
                "",

            customerPhone:
                selectedRoom.bookingPhone ||
                currentUserData?.phone ||
                "",


            roomNumber:
                selectedRoom.roomNumber,

            roomName:
                selectedRoom.name ||
                `Chumba ${selectedRoom.roomNumber}`,


            amount:
                roomPrice,

            price:
                roomPrice,


            profitPerDay:
                profitPerDay,

            durationDays:
                days,

            days:
                days,

            totalProfit:
                totalProfit,


            /* =============================================
               REFERRAL
            ============================================= */

            referredBy:
                currentUserData?.referredBy ||
                null,

            referralCode:
                currentUserData?.referralCode ||
                null,


            /* =============================================
               PAYMENT
            ============================================= */

            paymentMethod:
                paymentMethod,

            paymentMethodName:
                paymentInfo.name,

            paymentReceiver:
                paymentInfo.number,

            paymentReceiverName:
                paymentInfo.owner,

            paymentSenderPhone:
                senderPhone,

            paymentReference:
                paymentReference,


            /* =============================================
               STATUS
            ============================================= */

            status:
                "payment_pending",

            paymentStatus:
                "pending",

            adminConfirmed:
                false,


            /* =============================================
               COMMISSION STATUS
            ============================================= */

            commissionProcessed:
                false,

            profitProcessed:
                false,


            /* =============================================
               TIMESTAMPS
            ============================================= */

            createdAt:
                serverTimestamp(),

            updatedAt:
                serverTimestamp()

        };


        /* =================================================
           SAVE BOOKING TO FIRESTORE
        ================================================= */

        await db
            .collection("bookings")
            .doc(bookingNumber)
            .set(bookingData);


        /* =================================================
           CUSTOMER NOTIFICATION
        ================================================= */

        await tengenezaNotificationBooking(
            user.uid,
            bookingNumber,
            selectedRoom.roomNumber
        );


        /* =================================================
           ADMIN NOTIFICATION
        ================================================= */

        await tengenezaAdminNotificationBooking(
            bookingNumber,
            selectedRoom.roomNumber,
            bookingData.customerName,
            roomPrice
        );


        if (message) {

            message.innerHTML = `

                <div class="success-message">

                    <h3>
                        ✅ Ombi Limetumwa
                    </h3>

                    <p>
                        Ombi lako la malipo
                        limetumwa kwa Admin.
                    </p>

                    <p>
                        🧾 Booking Number:
                        <strong>
                            ${escapeHTML(
                                bookingNumber
                            )}
                        </strong>
                    </p>

                    <p>
                        💳 Status:
                        <strong>
                            Inasubiri uthibitisho
                        </strong>
                    </p>

                    <p>
                        Tafadhali subiri Admin
                        athibitishe malipo yako.
                    </p>

                    <button
                        type="button"
                        class="primary-btn"
                        onclick="funguaBookingZangu()"
                    >
                        📋 Angalia Booking Zangu
                    </button>

                </div>
            `;

        }


        if (button) {

            button.disabled = false;

            button.textContent =
                "📤 Tuma Ombi la Malipo";

        }


        /* =================================================
           CLEAR SELECTED ROOM
        ================================================= */

        selectedRoom = null;


    } catch (error) {

        console.error(
            "Tuma ombi la malipo error:",
            error
        );


        if (message) {

            message.innerHTML = `

                <div class="error-message">

                    ❌ Imeshindikana kutuma ombi.

                    <br><br>

                    ${escapeHTML(
                        firebaseErrorMessage(
                            error
                        )
                    )}

                </div>
            `;

        }


        if (button) {

            button.disabled = false;

            button.textContent =
                "📤 Tuma Ombi la Malipo";

        }

    }

}


/* =========================================================
   6. CUSTOMER BOOKING NOTIFICATION
========================================================= */

async function tengenezaNotificationBooking(
    uid,
    bookingNumber,
    roomNumber
) {

    if (!uid) return;


    try {

        await db
            .collection("notifications")
            .add({

                uid: uid,

                type: "booking_payment_pending",

                title:
                    "Ombi la Malipo Limetumwa",

                message:
                    `Booking ${bookingNumber} ` +
                    `ya chumba ${roomNumber} ` +
                    `inasubiri uthibitisho wa Admin.`,

                bookingNumber:
                    bookingNumber,

                roomNumber:
                    roomNumber,

                read:
                    false,

                createdAt:
                    serverTimestamp()

            });

    } catch (error) {

        console.error(
            "Customer notification error:",
            error
        );

    }

}


/* =========================================================
   7. ADMIN BOOKING NOTIFICATION
========================================================= */

async function tengenezaAdminNotificationBooking(
    bookingNumber,
    roomNumber,
    customerName,
    amount
) {

    try {

        await db
            .collection("notifications")
            .add({

                uid:
                    ADMIN_CONFIG.uid,

                type:
                    "admin_payment_request",

                title:
                    "💳 Ombi Jipya la Malipo",

                message:
                    `${customerName} ametuma ` +
                    `ombi la malipo la TSh ` +
                    `${formatMoney(amount)} ` +
                    `kwa chumba ${roomNumber}.`,

                bookingNumber:
                    bookingNumber,

                roomNumber:
                    roomNumber,

                amount:
                    Number(amount || 0),

                read:
                    false,

                createdAt:
                    serverTimestamp()

            });

    } catch (error) {

        console.error(
            "Admin notification error:",
            error
        );

    }

}


/* =========================================================
   8. MWISHO WA SEHEMU YA 3
========================================================= */


/* =========================================================
   ROOMRENT - SEHEMU YA 4
   BOOKING ZANGU + FIRESTORE
   ========================================================= */


/* =========================================================
   1. FUNGUA BOOKING ZANGU
========================================================= */

async function funguaBookingZangu() {

    const user = getCurrentUser();

    if (!user) {

        alert(
            "Tafadhali ingia kwanza ili kuona Booking Zako."
        );

        return;
    }


    clearMainSections();


    const section =
        getElement("vyumba");

    if (!section) return;


    section.style.display = "block";


    section.innerHTML = `

        <div class="booking-container">

            <h2>📋 Booking Zangu</h2>

            <p>
                ⏳ Inapakia booking zako...
            </p>

            <div id="bookingList">
            </div>

        </div>

    `;


    await pakiaBookingZangu();

}


/* =========================================================
   2. PAKIA BOOKING ZOTE ZA USER
========================================================= */

async function pakiaBookingZangu() {

    const user = getCurrentUser();

    if (!user) return;


    const container =
        getElement("bookingList");


    if (!container) return;


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


        if (snapshot.empty) {

            container.innerHTML = `

                <div class="empty-state">

                    <h3>
                        📋 Hakuna Booking bado
                    </h3>

                    <p>
                        Booking zako zitaonekana
                        hapa baada ya kufanya booking.
                    </p>

                    <button
                        type="button"
                        class="primary-btn"
                        onclick="onyeshaVyumba()"
                    >
                        🏠 Angalia Vyumba
                    </button>

                </div>

            `;

            return;
        }


        const bookings = [];


        snapshot.forEach(doc => {

            bookings.push({
                id: doc.id,
                ...doc.data()
            });

        });


        /* =================================================
           SORT NEWEST FIRST
        ================================================= */

        bookings.sort(
            (a, b) => {

                const dateA =
                    a.createdAt?.toDate
                        ? a.createdAt.toDate().getTime()
                        : 0;

                const dateB =
                    b.createdAt?.toDate
                        ? b.createdAt.toDate().getTime()
                        : 0;

                return dateB - dateA;

            }
        );


        container.innerHTML = "";


        bookings.forEach(
            booking => {

                container.insertAdjacentHTML(
                    "beforeend",
                    tengenezaBookingCard(
                        booking
                    )
                );

            }
        );


    } catch (error) {

        console.error(
            "Pakia Booking Zangu error:",
            error
        );


        container.innerHTML = `

            <div class="error-message">

                ❌ Imeshindikana kupakia Booking Zako.

                <br><br>

                ${escapeHTML(
                    firebaseErrorMessage(
                        error
                    )
                )}

                <br><br>

                <button
                    type="button"
                    class="primary-btn"
                    onclick="pakiaBookingZangu()"
                >
                    🔄 Jaribu Tena
                </button>

            </div>

        `;

    }

}


/* =========================================================
   3. TENGENEZA BOOKING CARD
========================================================= */

function tengenezaBookingCard(booking) {

    const roomNumber =
        booking.roomNumber || "-";


    const bookingNumber =
        booking.bookingNumber ||
        booking.id ||
        "-";


    const amount =
        Number(
            booking.amount ||
            booking.price ||
            0
        );


    const profitPerDay =
        Number(
            booking.profitPerDay ||
            0
        );


    const days =
        Number(
            booking.durationDays ||
            booking.days ||
            ROOMRENT_SETTINGS.durationDays ||
            40
        );


    const totalProfit =
        Number(
            booking.totalProfit ??
            (profitPerDay * days)
        );


    const paymentMethod =
        pataJinaLaPaymentMethod(
            booking.paymentMethod,
            booking.paymentMethodName
        );


    const paymentReference =
        booking.paymentReference ||
        "-";


    const paymentSenderPhone =
        booking.paymentSenderPhone ||
        "-";


    const status =
        pataBookingStatus(
            booking
        );


    const createdAt =
        formatFirestoreDate(
            booking.createdAt
        );


    const confirmedAt =
        formatFirestoreDate(
            booking.confirmedAt
        );


    return `

        <div class="booking-card">

            <div class="booking-card-header">

                <h3>
                    🏠 Chumba ${escapeHTML(
                        String(roomNumber)
                    )}
                </h3>

                <span class="booking-status">
                    ${status.html}
                </span>

            </div>


            <div class="booking-details">

                <p>
                    🧾 Booking Number:
                    <strong>
                        ${escapeHTML(
                            String(bookingNumber)
                        )}
                    </strong>
                </p>


                <p>
                    💰 Kiasi:
                    <strong>
                        TSh ${formatMoney(amount)}
                    </strong>
                </p>


                <p>
                    📅 Muda:
                    <strong>
                        ${days} siku
                    </strong>
                </p>


                <p>
                    📈 Faida kwa siku:
                    <strong>
                        TSh ${formatMoney(
                            profitPerDay
                        )}
                    </strong>
                </p>


                <p>
                    💵 Faida ya jumla:
                    <strong>
                        TSh ${formatMoney(
                            totalProfit
                        )}
                    </strong>
                </p>


                <hr>


                <p>
                    💳 Njia ya Malipo:
                    <strong>
                        ${escapeHTML(
                            paymentMethod
                        )}
                    </strong>
                </p>


                <p>
                    📞 Namba ya Mtumaji:
                    <strong>
                        ${escapeHTML(
                            String(
                                paymentSenderPhone
                            )
                        )}
                    </strong>
                </p>


                <p>
                    🧾 Transaction:
                    <strong>
                        ${escapeHTML(
                            String(
                                paymentReference
                            )
                        )}
                    </strong>
                </p>


                <p>
                    🕐 Tarehe ya Booking:
                    <strong>
                        ${escapeHTML(
                            createdAt
                        )}
                    </strong>
                </p>


                ${
                    booking.confirmedAt
                    ? `
                        <p>
                            ✅ Imethibitishwa:
                            <strong>
                                ${escapeHTML(
                                    confirmedAt
                                )}
                            </strong>
                        </p>
                    `
                    : ""
                }

            </div>


            ${
                booking.status ===
                    "payment_pending"
                ? `
                    <div class="booking-note">

                        ⏳ Booking hii
                        inasubiri Admin
                        athibitishe malipo.

                    </div>
                `
                : ""
            }


            ${
                booking.status ===
                    "confirmed"
                ? `
                    <div class="booking-note">

                        ✅ Malipo
                        yamethibitishwa.

                        <br>

                        Faida yako itaonekana
                        kwenye Salio Kuu.

                    </div>
                `
                : ""
            }


            ${
                booking.status ===
                    "rejected"
                ? `
                    <div class="booking-note">

                        ❌ Ombi hili
                        limekataliwa.

                        ${
                            booking.adminNote
                            ? `
                                <br><br>
                                <strong>
                                    Sababu:
                                </strong>
                                ${escapeHTML(
                                    String(
                                        booking.adminNote
                                    )
                                )}
                            `
                            : ""
                        }

                    </div>
                `
                : ""
            }

        </div>

    `;

}


/* =========================================================
   4. BOOKING STATUS
========================================================= */

function pataBookingStatus(booking) {

    const status =
        booking.status ||
        "payment_pending";


    if (
        status ===
        "payment_pending"
    ) {

        return {

            text:
                "Inasubiri Malipo",

            html:
                "🟡 Inasubiri Malipo"

        };

    }


    if (
        status ===
        "confirmed"
    ) {

        return {

            text:
                "Imethibitishwa",

            html:
                "🟢 Imethibitishwa"

        };

    }


    if (
        status ===
        "rejected"
    ) {

        return {

            text:
                "Imekataliwa",

            html:
                "🔴 Imekataliwa"

        };

    }


    if (
        status ===
        "cancelled"
    ) {

        return {

            text:
                "Imeghairiwa",

            html:
                "⚪ Imeghairiwa"

        };

    }


    return {

        text:
            status,

        html:
            `⚪ ${escapeHTML(
                String(status)
            )}`

    };

}


/* =========================================================
   5. PAYMENT METHOD NAME
========================================================= */

function pataJinaLaPaymentMethod(
    method,
    savedName
) {

    if (savedName) {

        return savedName;

    }


    if (
        method ===
        "AIRTEL_MONEY"
    ) {

        return "Airtel Money";

    }


    if (
        method ===
        "MIXX_BY_YAS"
    ) {

        return "MIXX BY YAS";

    }


    return method || "-";

}


/* =========================================================
   6. FORMAT FIRESTORE DATE
========================================================= */

function formatFirestoreDate(
    timestamp
) {

    if (!timestamp) {

        return "-";

    }


    try {

        let date;


        if (
            timestamp.toDate &&
            typeof timestamp.toDate ===
                "function"
        ) {

            date =
                timestamp.toDate();

        } else if (
            timestamp instanceof Date
        ) {

            date =
                timestamp;

        } else {

            return "-";

        }


        return date.toLocaleString(
            "sw-TZ",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            }
        );

    } catch (error) {

        console.error(
            "Date format error:",
            error
        );

        return "-";

    }

}


/* =========================================================
   7. REAL-TIME BOOKING LISTENER
========================================================= */

function anzaKusikilizaBookingZangu() {

    const user =
        getCurrentUser();


    if (!user) return;


    if (unsubscribeBookings) {

        unsubscribeBookings();

        unsubscribeBookings =
            null;

    }


    unsubscribeBookings =
        db
            .collection("bookings")
            .where(
                "uid",
                "==",
                user.uid
            )
            .onSnapshot(
                snapshot => {

                    const container =
                        getElement(
                            "bookingList"
                        );


                    if (
                        !container
                    ) {

                        return;

                    }


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

                            const dateA =
                                a.createdAt?.toDate
                                    ? a.createdAt
                                        .toDate()
                                        .getTime()
                                    : 0;


                            const dateB =
                                b.createdAt?.toDate
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

                        container.innerHTML = `

                            <div class="empty-state">

                                <h3>
                                    📋 Hakuna Booking bado
                                </h3>

                                <p>
                                    Booking zako
                                    zitaonekana hapa.
                                </p>

                            </div>

                        `;

                        return;

                    }


                    container.innerHTML =
                        bookings
                            .map(
                                booking =>
                                    tengenezaBookingCard(
                                        booking
                                    )
                            )
                            .join("");

                },

                error => {

                    console.error(
                        "Booking listener error:",
                        error
                    );

                }
            );

}


/* =========================================================
   8. SIMAMISHA BOOKING LISTENER
========================================================= */

function simamishaBookingListener() {

    if (unsubscribeBookings) {

        unsubscribeBookings();

        unsubscribeBookings =
            null;

    }

}


/* =========================================================
   9. MWISHO WA SEHEMU YA 4
========================================================= */
/* =========================================================
   ROOMRENT - SEHEMU YA 4
   BOOKING ZANGU + FIRESTORE
   ========================================================= */


/* =========================================================
   1. FUNGUA BOOKING ZANGU
========================================================= */

async function funguaBookingZangu() {

    const user = getCurrentUser();

    if (!user) {

        alert(
            "Tafadhali ingia kwanza ili kuona Booking Zako."
        );

        return;
    }


    clearMainSections();


    const section =
        getElement("vyumba");

    if (!section) return;


    section.style.display = "block";


    section.innerHTML = `

        <div class="booking-container">

            <h2>📋 Booking Zangu</h2>

            <p>
                ⏳ Inapakia booking zako...
            </p>

            <div id="bookingList">
            </div>

        </div>

    `;


    await pakiaBookingZangu();

}


/* =========================================================
   2. PAKIA BOOKING ZOTE ZA USER
========================================================= */

async function pakiaBookingZangu() {

    const user = getCurrentUser();

    if (!user) return;


    const container =
        getElement("bookingList");


    if (!container) return;


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


        if (snapshot.empty) {

            container.innerHTML = `

                <div class="empty-state">

                    <h3>
                        📋 Hakuna Booking bado
                    </h3>

                    <p>
                        Booking zako zitaonekana
                        hapa baada ya kufanya booking.
                    </p>

                    <button
                        type="button"
                        class="primary-btn"
                        onclick="onyeshaVyumba()"
                    >
                        🏠 Angalia Vyumba
                    </button>

                </div>

            `;

            return;
        }


        const bookings = [];


        snapshot.forEach(doc => {

            bookings.push({
                id: doc.id,
                ...doc.data()
            });

        });


        /* =================================================
           SORT NEWEST FIRST
        ================================================= */

        bookings.sort(
            (a, b) => {

                const dateA =
                    a.createdAt?.toDate
                        ? a.createdAt.toDate().getTime()
                        : 0;

                const dateB =
                    b.createdAt?.toDate
                        ? b.createdAt.toDate().getTime()
                        : 0;

                return dateB - dateA;

            }
        );


        container.innerHTML = "";


        bookings.forEach(
            booking => {

                container.insertAdjacentHTML(
                    "beforeend",
                    tengenezaBookingCard(
                        booking
                    )
                );

            }
        );


    } catch (error) {

        console.error(
            "Pakia Booking Zangu error:",
            error
        );


        container.innerHTML = `

            <div class="error-message">

                ❌ Imeshindikana kupakia Booking Zako.

                <br><br>

                ${escapeHTML(
                    firebaseErrorMessage(
                        error
                    )
                )}

                <br><br>

                <button
                    type="button"
                    class="primary-btn"
                    onclick="pakiaBookingZangu()"
                >
                    🔄 Jaribu Tena
                </button>

            </div>

        `;

    }

}


/* =========================================================
   3. TENGENEZA BOOKING CARD
========================================================= */

function tengenezaBookingCard(booking) {

    const roomNumber =
        booking.roomNumber || "-";


    const bookingNumber =
        booking.bookingNumber ||
        booking.id ||
        "-";


    const amount =
        Number(
            booking.amount ||
            booking.price ||
            0
        );


    const profitPerDay =
        Number(
            booking.profitPerDay ||
            0
        );


    const days =
        Number(
            booking.durationDays ||
            booking.days ||
            ROOMRENT_SETTINGS.durationDays ||
            40
        );


    const totalProfit =
        Number(
            booking.totalProfit ??
            (profitPerDay * days)
        );


    const paymentMethod =
        pataJinaLaPaymentMethod(
            booking.paymentMethod,
            booking.paymentMethodName
        );


    const paymentReference =
        booking.paymentReference ||
        "-";


    const paymentSenderPhone =
        booking.paymentSenderPhone ||
        "-";


    const status =
        pataBookingStatus(
            booking
        );


    const createdAt =
        formatFirestoreDate(
            booking.createdAt
        );


    const confirmedAt =
        formatFirestoreDate(
            booking.confirmedAt
        );


    return `

        <div class="booking-card">

            <div class="booking-card-header">

                <h3>
                    🏠 Chumba ${escapeHTML(
                        String(roomNumber)
                    )}
                </h3>

                <span class="booking-status">
                    ${status.html}
                </span>

            </div>


            <div class="booking-details">

                <p>
                    🧾 Booking Number:
                    <strong>
                        ${escapeHTML(
                            String(bookingNumber)
                        )}
                    </strong>
                </p>


                <p>
                    💰 Kiasi:
                    <strong>
                        TSh ${formatMoney(amount)}
                    </strong>
                </p>


                <p>
                    📅 Muda:
                    <strong>
                        ${days} siku
                    </strong>
                </p>


                <p>
                    📈 Faida kwa siku:
                    <strong>
                        TSh ${formatMoney(
                            profitPerDay
                        )}
                    </strong>
                </p>


                <p>
                    💵 Faida ya jumla:
                    <strong>
                        TSh ${formatMoney(
                            totalProfit
                        )}
                    </strong>
                </p>


                <hr>


                <p>
                    💳 Njia ya Malipo:
                    <strong>
                        ${escapeHTML(
                            paymentMethod
                        )}
                    </strong>
                </p>


                <p>
                    📞 Namba ya Mtumaji:
                    <strong>
                        ${escapeHTML(
                            String(
                                paymentSenderPhone
                            )
                        )}
                    </strong>
                </p>


                <p>
                    🧾 Transaction:
                    <strong>
                        ${escapeHTML(
                            String(
                                paymentReference
                            )
                        )}
                    </strong>
                </p>


                <p>
                    🕐 Tarehe ya Booking:
                    <strong>
                        ${escapeHTML(
                            createdAt
                        )}
                    </strong>
                </p>


                ${
                    booking.confirmedAt
                    ? `
                        <p>
                            ✅ Imethibitishwa:
                            <strong>
                                ${escapeHTML(
                                    confirmedAt
                                )}
                            </strong>
                        </p>
                    `
                    : ""
                }

            </div>


            ${
                booking.status ===
                    "payment_pending"
                ? `
                    <div class="booking-note">

                        ⏳ Booking hii
                        inasubiri Admin
                        athibitishe malipo.

                    </div>
                `
                : ""
            }


            ${
                booking.status ===
                    "confirmed"
                ? `
                    <div class="booking-note">

                        ✅ Malipo
                        yamethibitishwa.

                        <br>

                        Faida yako itaonekana
                        kwenye Salio Kuu.

                    </div>
                `
                : ""
            }


            ${
                booking.status ===
                    "rejected"
                ? `
                    <div class="booking-note">

                        ❌ Ombi hili
                        limekataliwa.

                        ${
                            booking.adminNote
                            ? `
                                <br><br>
                                <strong>
                                    Sababu:
                                </strong>
                                ${escapeHTML(
                                    String(
                                        booking.adminNote
                                    )
                                )}
                            `
                            : ""
                        }

                    </div>
                `
                : ""
            }

        </div>

    `;

}


/* =========================================================
   4. BOOKING STATUS
========================================================= */

function pataBookingStatus(booking) {

    const status =
        booking.status ||
        "payment_pending";


    if (
        status ===
        "payment_pending"
    ) {

        return {

            text:
                "Inasubiri Malipo",

            html:
                "🟡 Inasubiri Malipo"

        };

    }


    if (
        status ===
        "confirmed"
    ) {

        return {

            text:
                "Imethibitishwa",

            html:
                "🟢 Imethibitishwa"

        };

    }


    if (
        status ===
        "rejected"
    ) {

        return {

            text:
                "Imekataliwa",

            html:
                "🔴 Imekataliwa"

        };

    }


    if (
        status ===
        "cancelled"
    ) {

        return {

            text:
                "Imeghairiwa",

            html:
                "⚪ Imeghairiwa"

        };

    }


    return {

        text:
            status,

        html:
            `⚪ ${escapeHTML(
                String(status)
            )}`

    };

}


/* =========================================================
   5. PAYMENT METHOD NAME
========================================================= */

function pataJinaLaPaymentMethod(
    method,
    savedName
) {

    if (savedName) {

        return savedName;

    }


    if (
        method ===
        "AIRTEL_MONEY"
    ) {

        return "Airtel Money";

    }


    if (
        method ===
        "MIXX_BY_YAS"
    ) {

        return "MIXX BY YAS";

    }


    return method || "-";

}


/* =========================================================
   6. FORMAT FIRESTORE DATE
========================================================= */

function formatFirestoreDate(
    timestamp
) {

    if (!timestamp) {

        return "-";

    }


    try {

        let date;


        if (
            timestamp.toDate &&
            typeof timestamp.toDate ===
                "function"
        ) {

            date =
                timestamp.toDate();

        } else if (
            timestamp instanceof Date
        ) {

            date =
                timestamp;

        } else {

            return "-";

        }


        return date.toLocaleString(
            "sw-TZ",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            }
        );

    } catch (error) {

        console.error(
            "Date format error:",
            error
        );

        return "-";

    }

}


/* =========================================================
   7. REAL-TIME BOOKING LISTENER
========================================================= */

function anzaKusikilizaBookingZangu() {

    const user =
        getCurrentUser();


    if (!user) return;


    if (unsubscribeBookings) {

        unsubscribeBookings();

        unsubscribeBookings =
            null;

    }


    unsubscribeBookings =
        db
            .collection("bookings")
            .where(
                "uid",
                "==",
                user.uid
            )
            .onSnapshot(
                snapshot => {

                    const container =
                        getElement(
                            "bookingList"
                        );


                    if (
                        !container
                    ) {

                        return;

                    }


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

                            const dateA =
                                a.createdAt?.toDate
                                    ? a.createdAt
                                        .toDate()
                                        .getTime()
                                    : 0;


                            const dateB =
                                b.createdAt?.toDate
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

                        container.innerHTML = `

                            <div class="empty-state">

                                <h3>
                                    📋 Hakuna Booking bado
                                </h3>

                                <p>
                                    Booking zako
                                    zitaonekana hapa.
                                </p>

                            </div>

                        `;

                        return;

                    }


                    container.innerHTML =
                        bookings
                            .map(
                                booking =>
                                    tengenezaBookingCard(
                                        booking
                                    )
                            )
                            .join("");

                },

                error => {

                    console.error(
                        "Booking listener error:",
                        error
                    );

                }
            );

}


/* =========================================================
   8. SIMAMISHA BOOKING LISTENER
========================================================= */

function simamishaBookingListener() {

    if (unsubscribeBookings) {

        unsubscribeBookings();

        unsubscribeBookings =
            null;

    }

}


/* =========================================================
   9. MWISHO WA SEHEMU YA 4
========================================================= */

/* =========================================================
   ROOMRENT - SEHEMU YA 5
   ADMIN DASHBOARD + PAYMENT CONFIRMATION
   ========================================================= */


/* =========================================================
   1. FUNGUA ADMIN DASHBOARD
========================================================= */

async function funguaAdmin() {

    const user = getCurrentUser();

    if (!user) {

        alert(
            "Tafadhali ingia kwanza."
        );

        return;
    }


    if (
        user.uid !==
        ADMIN_CONFIG.uid
    ) {

        alert(
            "Huna ruhusa ya Admin."
        );

        return;
    }


    isAdmin = true;


    clearMainSections();


    const section =
        getElement("vyumba");


    if (!section) return;


    section.style.display =
        "block";


    section.innerHTML = `

        <div class="admin-container">

            <h2>🔐 RoomRent Admin Dashboard</h2>

            <p>
                Karibu Admin.
                Hapa unaweza kusimamia
                maombi ya malipo.
            </p>


            <div
                id="adminStats"
                class="admin-stats"
            >
                ⏳ Inapakia...
            </div>


            <hr>


            <h3>
                💳 Maombi ya Malipo
            </h3>


            <div
                id="adminBookingList"
            >
                ⏳ Inapakia booking...
            </div>

        </div>

    `;


    await pakiaAdminBookings();

}


/* =========================================================
   2. PAKIA BOOKING ZA ADMIN
========================================================= */

async function pakiaAdminBookings() {

    const user =
        getCurrentUser();


    if (!user) return;


    if (
        user.uid !==
        ADMIN_CONFIG.uid
    ) {

        return;

    }


    const container =
        getElement(
            "adminBookingList"
        );


    if (!container) return;


    try {

        const snapshot =
            await db
                .collection("bookings")
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

                const dateA =
                    a.createdAt?.toDate
                        ? a.createdAt
                            .toDate()
                            .getTime()
                        : 0;


                const dateB =
                    b.createdAt?.toDate
                        ? b.createdAt
                            .toDate()
                            .getTime()
                        : 0;


                return dateB - dateA;

            }
        );


        /* =================================================
           STATISTICS
        ================================================= */

        const pending =
            bookings.filter(
                booking =>
                    booking.status ===
                    "payment_pending"
            ).length;


        const confirmed =
            bookings.filter(
                booking =>
                    booking.status ===
                    "confirmed"
            ).length;


        const rejected =
            bookings.filter(
                booking =>
                    booking.status ===
                    "rejected"
            ).length;


        const total =
            bookings.length;


        const stats =
            getElement(
                "adminStats"
            );


        if (stats) {

            stats.innerHTML = `

                <div class="admin-stat-card">

                    <strong>
                        📋 ${total}
                    </strong>

                    <span>
                        Booking Zote
                    </span>

                </div>


                <div class="admin-stat-card">

                    <strong>
                        🟡 ${pending}
                    </strong>

                    <span>
                        Zinasubiri
                    </span>

                </div>


                <div class="admin-stat-card">

                    <strong>
                        🟢 ${confirmed}
                    </strong>

                    <span>
                        Zimethibitishwa
                    </span>

                </div>


                <div class="admin-stat-card">

                    <strong>
                        🔴 ${rejected}
                    </strong>

                    <span>
                        Zimekataliwa
                    </span>

                </div>

            `;

        }


        if (
            bookings.length ===
            0
        ) {

            container.innerHTML = `

                <div class="empty-state">

                    <h3>
                        📋 Hakuna Booking
                    </h3>

                    <p>
                        Hakuna booking
                        iliyopokelewa bado.
                    </p>

                </div>

            `;

            return;

        }


        container.innerHTML =
            bookings
                .map(
                    booking =>
                        tengenezaAdminBookingCard(
                            booking
                        )
                )
                .join("");


    } catch (error) {

        console.error(
            "Admin booking error:",
            error
        );


        container.innerHTML = `

            <div class="error-message">

                ❌ Imeshindikana
                kupakia booking.

                <br><br>

                ${escapeHTML(
                    firebaseErrorMessage(
                        error
                    )
                )}

            </div>

        `;

    }

}


/* =========================================================
   3. ADMIN BOOKING CARD
========================================================= */

function tengenezaAdminBookingCard(
    booking
) {

    const bookingNumber =
        booking.bookingNumber ||
        booking.id ||
        "-";


    const roomNumber =
        booking.roomNumber ||
        "-";


    const customerName =
        booking.customerName ||
        "-";


    const customerPhone =
        booking.customerPhone ||
        "-";


    const amount =
        Number(
            booking.amount ||
            booking.price ||
            0
        );


    const paymentMethod =
        booking.paymentMethodName ||
        pataJinaLaPaymentMethod(
            booking.paymentMethod
        );


    const paymentSenderPhone =
        booking.paymentSenderPhone ||
        "-";


    const paymentReference =
        booking.paymentReference ||
        "-";


    const status =
        booking.status ||
        "payment_pending";


    const createdAt =
        formatFirestoreDate(
            booking.createdAt
        );


    let statusHTML = "";


    if (
        status ===
        "payment_pending"
    ) {

        statusHTML =
            `<span>
                🟡 Inasubiri
             </span>`;

    } else if (
        status ===
        "confirmed"
    ) {

        statusHTML =
            `<span>
                🟢 Imethibitishwa
             </span>`;

    } else if (
        status ===
        "rejected"
    ) {

        statusHTML =
            `<span>
                🔴 Imekataliwa
             </span>`;

    } else {

        statusHTML =
            `<span>
                ⚪ ${escapeHTML(
                    String(status)
                )}
             </span>`;

    }


    return `

        <div class="admin-booking-card">

            <div
                class="admin-booking-header"
            >

                <h3>
                    🧾 ${escapeHTML(
                        String(
                            bookingNumber
                        )
                    )}
                </h3>

                ${statusHTML}

            </div>


            <div
                class="admin-booking-details"
            >

                <p>
                    🏠 Chumba:
                    <strong>
                        ${escapeHTML(
                            String(
                                roomNumber
                            )
                        )}
                    </strong>
                </p>


                <p>
                    👤 Mteja:
                    <strong>
                        ${escapeHTML(
                            String(
                                customerName
                            )
                        )}
                    </strong>
                </p>


                <p>
                    📞 Simu ya Mteja:
                    <strong>
                        ${escapeHTML(
                            String(
                                customerPhone
                            )
                        )}
                    </strong>
                </p>


                <p>
                    💰 Kiasi:
                    <strong>
                        TSh ${formatMoney(
                            amount
                        )}
                    </strong>
                </p>


                <hr>


                <p>
                    💳 Njia ya Malipo:
                    <strong>
                        ${escapeHTML(
                            String(
                                paymentMethod
                            )
                        )}
                    </strong>
                </p>


                <p>
                    📱 Namba iliyotumika:
                    <strong>
                        ${escapeHTML(
                            String(
                                paymentSenderPhone
                            )
                        )}
                    </strong>
                </p>


                <p>
                    🧾 Transaction:
                    <strong>
                        ${escapeHTML(
                            String(
                                paymentReference
                            )
                        )}
                    </strong>
                </p>


                <p>
                    🕐 Tarehe:
                    <strong>
                        ${escapeHTML(
                            createdAt
                        )}
                    </strong>
                </p>

            </div>


            ${
                status ===
                "payment_pending"
                ? `

                    <div
                        class="admin-actions"
                    >

                        <button
                            type="button"
                            class="primary-btn"
                            onclick="thibitishaBookingAdmin('${escapeHTML(
                                String(
                                    bookingNumber
                                )
                            )}')"
                        >
                            ✅ Thibitisha Malipo
                        </button>


                        <button
                            type="button"
                            class="danger-btn"
                            onclick="kataaBookingAdmin('${escapeHTML(
                                String(
                                    bookingNumber
                                )
                            )}')"
                        >
                            ❌ Kataa Malipo
                        </button>

                    </div>

                `
                : ""
            }


            ${
                status ===
                "confirmed"
                ? `

                    <div
                        class="booking-note"
                    >

                        ✅ Malipo
                        yameshathibitishwa.

                    </div>

                `
                : ""
            }


            ${
                status ===
                "rejected"
                ? `

                    <div
                        class="booking-note"
                    >

                        ❌ Booking hii
                        imekataliwa.

                        ${
                            booking.adminNote
                            ? `
                                <br><br>

                                <strong>
                                    Sababu:
                                </strong>

                                ${escapeHTML(
                                    String(
                                        booking.adminNote
                                    )
                                )}
                            `
                            : ""
                        }

                    </div>

                `
                : ""
            }

        </div>

    `;

}


/* =========================================================
   4. THIBITISHA BOOKING
========================================================= */

async function thibitishaBookingAdmin(
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


    if (
        user.uid !==
        ADMIN_CONFIG.uid
    ) {

        alert(
            "Huna ruhusa ya Admin."
        );

        return;
    }


    if (!bookingNumber) {

        alert(
            "Booking Number haipo."
        );

        return;
    }


    const confirmAction =
        confirm(
            "Unathibitisha kuwa malipo haya yamepokelewa?"
        );


    if (!confirmAction) {

        return;

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


        if (
            !bookingSnap.exists
        ) {

            alert(
                "Booking haikupatikana."
            );

            return;
        }


        const booking =
            bookingSnap.data();


        if (
            booking.status !==
            "payment_pending"
        ) {

            alert(
                "Booking hii tayari imeshughulikiwa."
            );

            return;
        }


        /* =================================================
           UPDATE BOOKING
        ================================================= */

        await bookingRef.update({

            status:
                "confirmed",

            paymentStatus:
                "confirmed",

            adminConfirmed:
                true,

            confirmedBy:
                ADMIN_CONFIG.uid,

            confirmedAt:
                serverTimestamp(),

            updatedAt:
                serverTimestamp()

        });


        /* =================================================
           CUSTOMER NOTIFICATION
        ================================================= */

        await db
            .collection("notifications")
            .add({

                uid:
                    booking.uid,

                type:
                    "payment_confirmed",

                title:
                    "✅ Malipo Yamehakikiwa",

                message:
                    `Malipo ya Booking ` +
                    `${bookingNumber} ` +
                    `yamehakikiwa na Admin.`,

                bookingNumber:
                    bookingNumber,

                roomNumber:
                    booking.roomNumber,

                read:
                    false,

                createdAt:
                    serverTimestamp()

            });


        alert(
            "✅ Malipo yamethibitishwa."
        );


        await pakiaAdminBookings();


    } catch (error) {

        console.error(
            "Thibitisha booking error:",
            error
        );


        alert(
            "❌ Imeshindikana kuthibitisha malipo.\n\n" +
            firebaseErrorMessage(
                error
            )
        );

    }

}


/* =========================================================
   5. KATAA BOOKING
========================================================= */

async function kataaBookingAdmin(
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


    if (
        user.uid !==
        ADMIN_CONFIG.uid
    ) {

        alert(
            "Huna ruhusa ya Admin."
        );

        return;
    }


    if (!bookingNumber) {

        alert(
            "Booking Number haipo."
        );

        return;
    }


    const reason =
        prompt(
            "Andika sababu ya kukataa malipo:"
        );


    if (
        reason === null
    ) {

        return;

    }


    const cleanReason =
        String(reason)
            .trim();


    if (!cleanReason) {

        alert(
            "Tafadhali weka sababu."
        );

        return;
    }


    const confirmAction =
        confirm(
            "Una uhakika unataka kukataa booking hii?"
        );


    if (!confirmAction) {

        return;

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


        if (
            !bookingSnap.exists
        ) {

            alert(
                "Booking haikupatikana."
            );

            return;
        }


        const booking =
            bookingSnap.data();


        if (
            booking.status !==
            "payment_pending"
        ) {

            alert(
                "Booking hii tayari imeshughulikiwa."
            );

            return;
        }


        /* =================================================
           UPDATE BOOKING
        ================================================= */

        await bookingRef.update({

            status:
                "rejected",

            paymentStatus:
                "rejected",

            adminConfirmed:
                false,

            rejectedBy:
                ADMIN_CONFIG.uid,

            rejectedAt:
                serverTimestamp(),

            adminNote:
                cleanReason,

            updatedAt:
                serverTimestamp()

        });


        /* =================================================
           CUSTOMER NOTIFICATION
        ================================================= */

        await db
            .collection("notifications")
            .add({

                uid:
                    booking.uid,

                type:
                    "payment_rejected",

                title:
                    "❌ Malipo Yamekataliwa",

                message:
                    `Malipo ya Booking ` +
                    `${bookingNumber} ` +
                    `yamekataliwa na Admin. ` +
                    `Sababu: ${cleanReason}`,

                bookingNumber:
                    bookingNumber,

                roomNumber:
                    booking.roomNumber,

                adminNote:
                    cleanReason,

                read:
                    false,

                createdAt:
                    serverTimestamp()

            });


        alert(
            "❌ Booking imekataliwa."
        );


        await pakiaAdminBookings();


    } catch (error) {

        console.error(
            "Kataa booking error:",
            error
        );


        alert(
            "❌ Imeshindikana kukataa booking.\n\n" +
            firebaseErrorMessage(
                error
            )
        );

    }

}


/* =========================================================
   6. REAL-TIME ADMIN BOOKINGS
========================================================= */

function anzaAdminBookingListener() {

    const user =
        getCurrentUser();


    if (!user) return;


    if (
        user.uid !==
        ADMIN_CONFIG.uid
    ) {

        return;
    }


    db
        .collection("bookings")
        .onSnapshot(
            snapshot => {

                const container =
                    getElement(
                        "adminBookingList"
                    );


                if (
                    !container
                ) {

                    return;

                }


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

                        const dateA =
                            a.createdAt?.toDate
                                ? a.createdAt
                                    .toDate()
                                    .getTime()
                                : 0;


                        const dateB =
                            b.createdAt?.toDate
                                ? b.createdAt
                                    .toDate()
                                    .getTime()
                                : 0;


                        return dateB - dateA;

                    }
                );


                container.innerHTML =
                    bookings.length
                    ? bookings
                        .map(
                            booking =>
                                tengenezaAdminBookingCard(
                                    booking
                                )
                        )
                        .join("")
                    : `
                        <div
                            class="empty-state"
                        >

                            <h3>
                                📋 Hakuna Booking
                            </h3>

                        </div>
                    `;

            },

            error => {

                console.error(
                    "Admin listener error:",
                    error
                );

            }
        );

}


/* =========================================================
   7. MWISHO WA SEHEMU YA 5
========================================================= *//* =========================================================
   ROOMRENT - SEHEMU YA 5
   ADMIN DASHBOARD + PAYMENT CONFIRMATION
   ========================================================= */


/* =========================================================
   1. FUNGUA ADMIN DASHBOARD
========================================================= */

async function funguaAdmin() {

    const user = getCurrentUser();

    if (!user) {

        alert(
            "Tafadhali ingia kwanza."
        );

        return;
    }


    if (
        user.uid !==
        ADMIN_CONFIG.uid
    ) {

        alert(
            "Huna ruhusa ya Admin."
        );

        return;
    }


    isAdmin = true;


    clearMainSections();


    const section =
        getElement("vyumba");


    if (!section) return;


    section.style.display =
        "block";


    section.innerHTML = `

        <div class="admin-container">

            <h2>🔐 RoomRent Admin Dashboard</h2>

            <p>
                Karibu Admin.
                Hapa unaweza kusimamia
                maombi ya malipo.
            </p>


            <div
                id="adminStats"
                class="admin-stats"
            >
                ⏳ Inapakia...
            </div>


            <hr>


            <h3>
                💳 Maombi ya Malipo
            </h3>


            <div
                id="adminBookingList"
            >
                ⏳ Inapakia booking...
            </div>

        </div>

    `;


    await pakiaAdminBookings();

}


/* =========================================================
   2. PAKIA BOOKING ZA ADMIN
========================================================= */

async function pakiaAdminBookings() {

    const user =
        getCurrentUser();


    if (!user) return;


    if (
        user.uid !==
        ADMIN_CONFIG.uid
    ) {

        return;

    }


    const container =
        getElement(
            "adminBookingList"
        );


    if (!container) return;


    try {

        const snapshot =
            await db
                .collection("bookings")
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

                const dateA =
                    a.createdAt?.toDate
                        ? a.createdAt
                            .toDate()
                            .getTime()
                        : 0;


                const dateB =
                    b.createdAt?.toDate
                        ? b.createdAt
                            .toDate()
                            .getTime()
                        : 0;


                return dateB - dateA;

            }
        );


        /* =================================================
           STATISTICS
        ================================================= */

        const pending =
            bookings.filter(
                booking =>
                    booking.status ===
                    "payment_pending"
            ).length;


        const confirmed =
            bookings.filter(
                booking =>
                    booking.status ===
                    "confirmed"
            ).length;


        const rejected =
            bookings.filter(
                booking =>
                    booking.status ===
                    "rejected"
            ).length;


        const total =
            bookings.length;


        const stats =
            getElement(
                "adminStats"
            );


        if (stats) {

            stats.innerHTML = `

                <div class="admin-stat-card">

                    <strong>
                        📋 ${total}
                    </strong>

                    <span>
                        Booking Zote
                    </span>

                </div>


                <div class="admin-stat-card">

                    <strong>
                        🟡 ${pending}
                    </strong>

                    <span>
                        Zinasubiri
                    </span>

                </div>


                <div class="admin-stat-card">

                    <strong>
                        🟢 ${confirmed}
                    </strong>

                    <span>
                        Zimethibitishwa
                    </span>

                </div>


                <div class="admin-stat-card">

                    <strong>
                        🔴 ${rejected}
                    </strong>

                    <span>
                        Zimekataliwa
                    </span>

                </div>

            `;

        }


        if (
            bookings.length ===
            0
        ) {

            container.innerHTML = `

                <div class="empty-state">

                    <h3>
                        📋 Hakuna Booking
                    </h3>

                    <p>
                        Hakuna booking
                        iliyopokelewa bado.
                    </p>

                </div>

            `;

            return;

        }


        container.innerHTML =
            bookings
                .map(
                    booking =>
                        tengenezaAdminBookingCard(
                            booking
                        )
                )
                .join("");


    } catch (error) {

        console.error(
            "Admin booking error:",
            error
        );


        container.innerHTML = `

            <div class="error-message">

                ❌ Imeshindikana
                kupakia booking.

                <br><br>

                ${escapeHTML(
                    firebaseErrorMessage(
                        error
                    )
                )}

            </div>

        `;

    }

}


/* =========================================================
   3. ADMIN BOOKING CARD
========================================================= */

function tengenezaAdminBookingCard(
    booking
) {

    const bookingNumber =
        booking.bookingNumber ||
        booking.id ||
        "-";


    const roomNumber =
        booking.roomNumber ||
        "-";


    const customerName =
        booking.customerName ||
        "-";


    const customerPhone =
        booking.customerPhone ||
        "-";


    const amount =
        Number(
            booking.amount ||
            booking.price ||
            0
        );


    const paymentMethod =
        booking.paymentMethodName ||
        pataJinaLaPaymentMethod(
            booking.paymentMethod
        );


    const paymentSenderPhone =
        booking.paymentSenderPhone ||
        "-";


    const paymentReference =
        booking.paymentReference ||
        "-";


    const status =
        booking.status ||
        "payment_pending";


    const createdAt =
        formatFirestoreDate(
            booking.createdAt
        );


    let statusHTML = "";


    if (
        status ===
        "payment_pending"
    ) {

        statusHTML =
            `<span>
                🟡 Inasubiri
             </span>`;

    } else if (
        status ===
        "confirmed"
    ) {

        statusHTML =
            `<span>
                🟢 Imethibitishwa
             </span>`;

    } else if (
        status ===
        "rejected"
    ) {

        statusHTML =
            `<span>
                🔴 Imekataliwa
             </span>`;

    } else {

        statusHTML =
            `<span>
                ⚪ ${escapeHTML(
                    String(status)
                )}
             </span>`;

    }


    return `

        <div class="admin-booking-card">

            <div
                class="admin-booking-header"
            >

                <h3>
                    🧾 ${escapeHTML(
                        String(
                            bookingNumber
                        )
                    )}
                </h3>

                ${statusHTML}

            </div>


            <div
                class="admin-booking-details"
            >

                <p>
                    🏠 Chumba:
                    <strong>
                        ${escapeHTML(
                            String(
                                roomNumber
                            )
                        )}
                    </strong>
                </p>


                <p>
                    👤 Mteja:
                    <strong>
                        ${escapeHTML(
                            String(
                                customerName
                            )
                        )}
                    </strong>
                </p>


                <p>
                    📞 Simu ya Mteja:
                    <strong>
                        ${escapeHTML(
                            String(
                                customerPhone
                            )
                        )}
                    </strong>
                </p>


                <p>
                    💰 Kiasi:
                    <strong>
                        TSh ${formatMoney(
                            amount
                        )}
                    </strong>
                </p>


                <hr>


                <p>
                    💳 Njia ya Malipo:
                    <strong>
                        ${escapeHTML(
                            String(
                                paymentMethod
                            )
                        )}
                    </strong>
                </p>


                <p>
                    📱 Namba iliyotumika:
                    <strong>
                        ${escapeHTML(
                            String(
                                paymentSenderPhone
                            )
                        )}
                    </strong>
                </p>


                <p>
                    🧾 Transaction:
                    <strong>
                        ${escapeHTML(
                            String(
                                paymentReference
                            )
                        )}
                    </strong>
                </p>


                <p>
                    🕐 Tarehe:
                    <strong>
                        ${escapeHTML(
                            createdAt
                        )}
                    </strong>
                </p>

            </div>


            ${
                status ===
                "payment_pending"
                ? `

                    <div
                        class="admin-actions"
                    >

                        <button
                            type="button"
                            class="primary-btn"
                            onclick="thibitishaBookingAdmin('${escapeHTML(
                                String(
                                    bookingNumber
                                )
                            )}')"
                        >
                            ✅ Thibitisha Malipo
                        </button>


                        <button
                            type="button"
                            class="danger-btn"
                            onclick="kataaBookingAdmin('${escapeHTML(
                                String(
                                    bookingNumber
                                )
                            )}')"
                        >
                            ❌ Kataa Malipo
                        </button>

                    </div>

                `
                : ""
            }


            ${
                status ===
                "confirmed"
                ? `

                    <div
                        class="booking-note"
                    >

                        ✅ Malipo
                        yameshathibitishwa.

                    </div>

                `
                : ""
            }


            ${
                status ===
                "rejected"
                ? `

                    <div
                        class="booking-note"
                    >

                        ❌ Booking hii
                        imekataliwa.

                        ${
                            booking.adminNote
                            ? `
                                <br><br>

                                <strong>
                                    Sababu:
                                </strong>

                                ${escapeHTML(
                                    String(
                                        booking.adminNote
                                    )
                                )}
                            `
                            : ""
                        }

                    </div>

                `
                : ""
            }

        </div>

    `;

}


/* =========================================================
   4. THIBITISHA BOOKING
========================================================= */

async function thibitishaBookingAdmin(
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


    if (
        user.uid !==
        ADMIN_CONFIG.uid
    ) {

        alert(
            "Huna ruhusa ya Admin."
        );

        return;
    }


    if (!bookingNumber) {

        alert(
            "Booking Number haipo."
        );

        return;
    }


    const confirmAction =
        confirm(
            "Unathibitisha kuwa malipo haya yamepokelewa?"
        );


    if (!confirmAction) {

        return;

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


        if (
            !bookingSnap.exists
        ) {

            alert(
                "Booking haikupatikana."
            );

            return;
        }


        const booking =
            bookingSnap.data();


        if (
            booking.status !==
            "payment_pending"
        ) {

            alert(
                "Booking hii tayari imeshughulikiwa."
            );

            return;
        }


        /* =================================================
           UPDATE BOOKING
        ================================================= */

        await bookingRef.update({

            status:
                "confirmed",

            paymentStatus:
                "confirmed",

            adminConfirmed:
                true,

            confirmedBy:
                ADMIN_CONFIG.uid,

            confirmedAt:
                serverTimestamp(),

            updatedAt:
                serverTimestamp()

        });


        /* =================================================
           CUSTOMER NOTIFICATION
        ================================================= */

        await db
            .collection("notifications")
            .add({

                uid:
                    booking.uid,

                type:
                    "payment_confirmed",

                title:
                    "✅ Malipo Yamehakikiwa",

                message:
                    `Malipo ya Booking ` +
                    `${bookingNumber} ` +
                    `yamehakikiwa na Admin.`,

                bookingNumber:
                    bookingNumber,

                roomNumber:
                    booking.roomNumber,

                read:
                    false,

                createdAt:
                    serverTimestamp()

            });


        alert(
            "✅ Malipo yamethibitishwa."
        );


        await pakiaAdminBookings();


    } catch (error) {

        console.error(
            "Thibitisha booking error:",
            error
        );


        alert(
            "❌ Imeshindikana kuthibitisha malipo.\n\n" +
            firebaseErrorMessage(
                error
            )
        );

    }

}


/* =========================================================
   5. KATAA BOOKING
========================================================= */

async function kataaBookingAdmin(
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


    if (
        user.uid !==
        ADMIN_CONFIG.uid
    ) {

        alert(
            "Huna ruhusa ya Admin."
        );

        return;
    }


    if (!bookingNumber) {

        alert(
            "Booking Number haipo."
        );

        return;
    }


    const reason =
        prompt(
            "Andika sababu ya kukataa malipo:"
        );


    if (
        reason === null
    ) {

        return;

    }


    const cleanReason =
        String(reason)
            .trim();


    if (!cleanReason) {

        alert(
            "Tafadhali weka sababu."
        );

        return;
    }


    const confirmAction =
        confirm(
            "Una uhakika unataka kukataa booking hii?"
        );


    if (!confirmAction) {

        return;

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


        if (
            !bookingSnap.exists
        ) {

            alert(
                "Booking haikupatikana."
            );

            return;
        }


        const booking =
            bookingSnap.data();


        if (
            booking.status !==
            "payment_pending"
        ) {

            alert(
                "Booking hii tayari imeshughulikiwa."
            );

            return;
        }


        /* =================================================
           UPDATE BOOKING
        ================================================= */

        await bookingRef.update({

            status:
                "rejected",

            paymentStatus:
                "rejected",

            adminConfirmed:
                false,

            rejectedBy:
                ADMIN_CONFIG.uid,

            rejectedAt:
                serverTimestamp(),

            adminNote:
                cleanReason,

            updatedAt:
                serverTimestamp()

        });


        /* =================================================
           CUSTOMER NOTIFICATION
        ================================================= */

        await db
            .collection("notifications")
            .add({

                uid:
                    booking.uid,

                type:
                    "payment_rejected",

                title:
                    "❌ Malipo Yamekataliwa",

                message:
                    `Malipo ya Booking ` +
                    `${bookingNumber} ` +
                    `yamekataliwa na Admin. ` +
                    `Sababu: ${cleanReason}`,

                bookingNumber:
                    bookingNumber,

                roomNumber:
                    booking.roomNumber,

                adminNote:
                    cleanReason,

                read:
                    false,

                createdAt:
                    serverTimestamp()

            });


        alert(
            "❌ Booking imekataliwa."
        );


        await pakiaAdminBookings();


    } catch (error) {

        console.error(
            "Kataa booking error:",
            error
        );


        alert(
            "❌ Imeshindikana kukataa booking.\n\n" +
            firebaseErrorMessage(
                error
            )
        );

    }

}


/* =========================================================
   6. REAL-TIME ADMIN BOOKINGS
========================================================= */

function anzaAdminBookingListener() {

    const user =
        getCurrentUser();


    if (!user) return;


    if (
        user.uid !==
        ADMIN_CONFIG.uid
    ) {

        return;
    }


    db
        .collection("bookings")
        .onSnapshot(
            snapshot => {

                const container =
                    getElement(
                        "adminBookingList"
                    );


                if (
                    !container
                ) {

                    return;

                }


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

                        const dateA =
                            a.createdAt?.toDate
                                ? a.createdAt
                                    .toDate()
                                    .getTime()
                                : 0;


                        const dateB =
                            b.createdAt?.toDate
                                ? b.createdAt
                                    .toDate()
                                    .getTime()
                                : 0;


                        return dateB - dateA;

                    }
                );


                container.innerHTML =
                    bookings.length
                    ? bookings
                        .map(
                            booking =>
                                tengenezaAdminBookingCard(
                                    booking
                                )
                        )
                        .join("")
                    : `
                        <div
                            class="empty-state"
                        >

                            <h3>
                                📋 Hakuna Booking
                            </h3>

                        </div>
                    `;

            },

            error => {

                console.error(
                    "Admin listener error:",
                    error
                );

            }
        );

}


/* =========================================================
   7. MWISHO WA SEHEMU YA 5
========================================================= */

/* =========================================================
   ROOMRENT - SEHEMU YA 6
   PROFIT + REFERRAL COMMISSION + MAIN WALLET
   ========================================================= */


/* =========================================================
   1. PATA USER KWA UID
========================================================= */

async function pataUserKwaUid(uid) {

    if (!uid) return null;

    try {

        const snap = await db
            .collection("users")
            .doc(uid)
            .get();

        if (!snap.exists) {
            return null;
        }

        return {
            uid: uid,
            ...snap.data()
        };

    } catch (error) {

        console.error(
            "Pata user kwa UID error:",
            error
        );

        return null;
    }
}


/* =========================================================
   2. ONGEZA COMMISSION KWENYE MAIN WALLET
========================================================= */

async function ongezaCommissionMainWallet(
    uid,
    amount,
    source,
    bookingNumber,
    level
) {

    if (!uid) return;

    const commissionAmount =
        Number(
            Number(amount || 0)
                .toFixed(2)
        );

    if (
        commissionAmount <= 0
    ) {
        return;
    }


    const walletRef =
        db
            .collection("wallets")
            .doc(uid);


    await db.runTransaction(
        async transaction => {

            const walletSnap =
                await transaction.get(
                    walletRef
                );


            let walletData =
                walletSnap.exists
                    ? walletSnap.data()
                    : {};


            const oldBalance =
                Number(
                    walletData.balance || 0
                );


            const oldReferralCommission =
                Number(
                    walletData.referralCommission || 0
                );


            const oldTotalEarned =
                Number(
                    walletData.totalEarned || 0
                );


            const newBalance =
                Number(
                    (
                        oldBalance +
                        commissionAmount
                    ).toFixed(2)
                );


            const newReferralCommission =
                Number(
                    (
                        oldReferralCommission +
                        commissionAmount
                    ).toFixed(2)
                );


            const newTotalEarned =
                Number(
                    (
                        oldTotalEarned +
                        commissionAmount
                    ).toFixed(2)
                );


            const walletUpdate = {

                balance:
                    newBalance,

                referralCommission:
                    newReferralCommission,

                totalEarned:
                    newTotalEarned,

                updatedAt:
                    serverTimestamp()

            };


            if (
                walletSnap.exists
            ) {

                transaction.update(
                    walletRef,
                    walletUpdate
                );

            } else {

                transaction.set(
                    walletRef,
                    {

                        uid: uid,

                        balance:
                            newBalance,

                        bookingEarnings:
                            0,

                        referralCommission:
                            newReferralCommission,

                        totalEarned:
                            newTotalEarned,

                        totalWithdrawn:
                            0,

                        pendingWithdrawal:
                            0,

                        updatedAt:
                            serverTimestamp()

                    }
                );

            }

        }
    );


    /* =====================================================
       COMMISSION TRANSACTION RECORD
    ===================================================== */

    await db
        .collection("walletTransactions")
        .add({

            uid: uid,

            type:
                "referral_commission",

            source:
                source,

            level:
                level || null,

            amount:
                commissionAmount,

            bookingNumber:
                bookingNumber || null,

            createdAt:
                serverTimestamp()

        });

}


/* =========================================================
   3. ONGEZA BOOKING PROFIT KWENYE MAIN WALLET
========================================================= */

async function ongezaBookingProfitMainWallet(
    uid,
    amount,
    bookingNumber
) {

    if (!uid) return;


    const profit =
        Number(
            Number(amount || 0)
                .toFixed(2)
        );


    if (profit <= 0) {
        return;
    }


    const walletRef =
        db
            .collection("wallets")
            .doc(uid);


    await db.runTransaction(
        async transaction => {

            const walletSnap =
                await transaction.get(
                    walletRef
                );


            let walletData =
                walletSnap.exists
                    ? walletSnap.data()
                    : {};


            const oldBalance =
                Number(
                    walletData.balance || 0
                );


            const oldBookingEarnings =
                Number(
                    walletData.bookingEarnings || 0
                );


            const oldTotalEarned =
                Number(
                    walletData.totalEarned || 0
                );


            const newBalance =
                Number(
                    (
                        oldBalance +
                        profit
                    ).toFixed(2)
                );


            const newBookingEarnings =
                Number(
                    (
                        oldBookingEarnings +
                        profit
                    ).toFixed(2)
                );


            const newTotalEarned =
                Number(
                    (
                        oldTotalEarned +
                        profit
                    ).toFixed(2)
                );


            const walletUpdate = {

                balance:
                    newBalance,

                bookingEarnings:
                    newBookingEarnings,

                totalEarned:
                    newTotalEarned,

                updatedAt:
                    serverTimestamp()

            };


            if (
                walletSnap.exists
            ) {

                transaction.update(
                    walletRef,
                    walletUpdate
                );

            } else {

                transaction.set(
                    walletRef,
                    {

                        uid: uid,

                        balance:
                            newBalance,

                        bookingEarnings:
                            newBookingEarnings,

                        referralCommission:
                            0,

                        totalEarned:
                            newTotalEarned,

                        totalWithdrawn:
                            0,

                        pendingWithdrawal:
                            0,

                        updatedAt:
                            serverTimestamp()

                    }
                );

            }

        }
    );


    await db
        .collection("walletTransactions")
        .add({

            uid: uid,

            type:
                "booking_profit",

            source:
                "room_booking",

            amount:
                profit,

            bookingNumber:
                bookingNumber || null,

            createdAt:
                serverTimestamp()

        });

}


/* =========================================================
   4. PATA REFERRAL CHAIN
========================================================= */

async function pataReferralChain(
    user
) {

    const chain = [];


    if (!user) {
        return chain;
    }


    let currentUid =
        user.referredBy || null;


    let level = 1;


    while (
        currentUid &&
        level <= 3
    ) {

        const parent =
            await pataUserKwaUid(
                currentUid
            );


        if (!parent) {
            break;
        }


        chain.push({

            level:
                level,

            uid:
                parent.uid,

            name:
                parent.name || "",

            email:
                parent.email || "",

            referralCode:
                parent.referralCode || "",

            referredBy:
                parent.referredBy || null

        });


        currentUid =
            parent.referredBy ||
            null;


        level++;

    }


    return chain;

}


/* =========================================================
   5. PATA COMMISSION RATE
========================================================= */

function pataReferralRate(
    level
) {

    if (level === 1) {

        return (
            Number(
                ROOMRENT_SETTINGS
                    .userCommissionA
            ) / 100
        );

    }


    if (level === 2) {

        return (
            Number(
                ROOMRENT_SETTINGS
                    .userCommissionB
            ) / 100
        );

    }


    if (level === 3) {

        return (
            Number(
                ROOMRENT_SETTINGS
                    .userCommissionC
            ) / 100
        );

    }


    return 0;

}


/* =========================================================
   6. PATA ADMIN COMMISSION RATE
========================================================= */

function pataAdminCommissionRate(
    level
) {

    if (level === 1) {

        return (
            Number(
                ROOMRENT_SETTINGS
                    .adminCommissionA
            ) / 100
        );

    }


    if (level === 2) {

        return (
            Number(
                ROOMRENT_SETTINGS
                    .adminCommissionB
            ) / 100
        );

    }


    if (level === 3) {

        return (
            Number(
                ROOMRENT_SETTINGS
                    .adminCommissionC
            ) / 100
        );

    }


    return 0;

}


/* =========================================================
   7. PROCESS REFERRAL COMMISSIONS
========================================================= */

async function processReferralCommissions(
    booking
) {

    if (!booking) {
        return;
    }


    const customer =
        await pataUserKwaUid(
            booking.uid
        );


    if (!customer) {
        return;
    }


    const bookingAmount =
        Number(
            booking.amount ||
            booking.price ||
            0
        );


    if (bookingAmount <= 0) {
        return;
    }


    const chain =
        await pataReferralChain(
            customer
        );


    if (
        chain.length === 0
    ) {

        return;

    }


    /* =====================================================
       REFERRAL COMMISSION
    ===================================================== */

    for (
        const parent of chain
    ) {

        const rate =
            pataReferralRate(
                parent.level
            );


        const commission =
            Number(
                (
                    bookingAmount *
                    rate
                ).toFixed(2)
            );


        if (
            commission <= 0
        ) {

            continue;

        }


        await ongezaCommissionMainWallet(
            parent.uid,
            commission,
            "referral_level_" +
                parent.level,
            booking.bookingNumber,
            parent.level
        );


        await db
            .collection("notifications")
            .add({

                uid:
                    parent.uid,

                type:
                    "referral_commission",

                title:
                    "💰 Referral Commission",

                message:
                    `Umepokea TSh ` +
                    `${formatMoney(commission)} ` +
                    `kutoka Booking ` +
                    `${booking.bookingNumber} ` +
                    `(Level ${parent.level}).`,

                amount:
                    commission,

                bookingNumber:
                    booking.bookingNumber,

                level:
                    parent.level,

                read:
                    false,

                createdAt:
                    serverTimestamp()

            });

    }


    /* =====================================================
       ADMIN COMMISSION
    ===================================================== */

    for (
        const parent of chain
    ) {

        const adminRate =
            pataAdminCommissionRate(
                parent.level
            );


        const adminCommission =
            Number(
                (
                    bookingAmount *
                    adminRate
                ).toFixed(2)
            );


        if (
            adminCommission <= 0
        ) {

            continue;

        }


        await ongezaCommissionMainWallet(
            ADMIN_CONFIG.uid,
            adminCommission,
            "admin_referral_level_" +
                parent.level,
            booking.bookingNumber,
            parent.level
        );

    }

}


/* =========================================================
   8. PROCESS BOOKING FINANCIALS
========================================================= */

async function processBookingFinancials(
    booking
) {

    if (!booking) {
        return;
    }


    if (
        booking.financialsProcessed ===
        true
    ) {

        console.log(
            "Financials tayari zimesindikwa:",
            booking.bookingNumber
        );

        return;

    }


    /* =====================================================
       1. BOOKING PROFIT
    ===================================================== */

    const profit =
        Number(
            booking.totalProfit ||
            hesabuFaida(
                booking
            ) ||
            0
        );


    if (
        profit > 0
    ) {

        await ongezaBookingProfitMainWallet(
            booking.uid,
            profit,
            booking.bookingNumber
        );

    }


    /* =====================================================
       2. REFERRAL COMMISSIONS
    ===================================================== */

    await processReferralCommissions(
        booking
    );


    /* =====================================================
       3. MARK FINANCIALS PROCESSED
    ===================================================== */

    await db
        .collection("bookings")
        .doc(
            booking.bookingNumber
        )
        .update({

            financialsProcessed:
                true,

            profitProcessed:
                profit > 0,

            commissionProcessed:
                true,

            financialsProcessedAt:
                serverTimestamp(),

            updatedAt:
                serverTimestamp()

        });


    /* =====================================================
       4. CUSTOMER NOTIFICATION
    ===================================================== */

    await db
        .collection("notifications")
        .add({

            uid:
                booking.uid,

            type:
                "booking_profit_added",

            title:
                "💰 Faida Imeongezwa",

            message:
                `Faida ya TSh ` +
                `${formatMoney(profit)} ` +
                `kutoka Booking ` +
                `${booking.bookingNumber} ` +
                `imeongezwa kwenye Salio Kuu.`,

            amount:
                profit,

            bookingNumber:
                booking.bookingNumber,

            read:
                false,

            createdAt:
                serverTimestamp()

        });

}


/* =========================================================
   9. FUNCTION MPYA YA ADMIN CONFIRMATION
========================================================= */

async function thibitishaBookingAdminV2(
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


    if (
        user.uid !==
        ADMIN_CONFIG.uid
    ) {

        alert(
            "Huna ruhusa ya Admin."
        );

        return;

    }


    if (!bookingNumber) {

        alert(
            "Booking Number haipo."
        );

        return;

    }


    const confirmAction =
        confirm(
            "Unathibitisha kuwa malipo haya yamepokelewa?"
        );


    if (!confirmAction) {
        return;
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


        if (
            !bookingSnap.exists
        ) {

            alert(
                "Booking haikupatikana."
            );

            return;

        }


        const booking =
            bookingSnap.data();


        if (
            booking.status !==
            "payment_pending"
        ) {

            alert(
                "Booking hii tayari imeshughulikiwa."
            );

            return;

        }


        /* =================================================
           CONFIRM PAYMENT
        ================================================= */

        await bookingRef.update({

            status:
                "confirmed",

            paymentStatus:
                "confirmed",

            adminConfirmed:
                true,

            confirmedBy:
                ADMIN_CONFIG.uid,

            confirmedAt:
                serverTimestamp(),

            updatedAt:
                serverTimestamp()

        });


        /* =================================================
           PROCESS MONEY
        ================================================= */

        const updatedBooking = {

            ...booking,

            bookingNumber:
                booking.bookingNumber ||
                bookingNumber,

            status:
                "confirmed"

        };


        await processBookingFinancials(
            updatedBooking
        );


        /* =================================================
           NOTIFICATION
        ================================================= */

        await db
            .collection("notifications")
            .add({

                uid:
                    booking.uid,

                type:
                    "payment_confirmed",

                title:
                    "✅ Malipo Yamethibitishwa",

                message:
                    `Malipo ya Booking ` +
                    `${bookingNumber} ` +
                    `yamehakikiwa. ` +
                    `Faida yako imeongezwa ` +
                    `kwenye Salio Kuu.`,

                bookingNumber:
                    bookingNumber,

                read:
                    false,

                createdAt:
                    serverTimestamp()

            });


        alert(
            "✅ Malipo yamethibitishwa na faida/commission zimesindikwa."
        );


        await pakiaAdminBookings();


    } catch (error) {

        console.error(
            "Admin confirmation V2 error:",
            error
        );


        alert(
            "❌ Imeshindikana kuthibitisha malipo.\n\n" +
            firebaseErrorMessage(
                error
            )
        );

    }

}


/* =========================================================
   10. MWISHO WA SEHEMU YA 6
========================================================= *//* =========================================================
   ROOMRENT - SEHEMU YA 6
   PROFIT + REFERRAL COMMISSION + MAIN WALLET
   ========================================================= */


/* =========================================================
   1. PATA USER KWA UID
========================================================= */

async function pataUserKwaUid(uid) {

    if (!uid) return null;

    try {

        const snap = await db
            .collection("users")
            .doc(uid)
            .get();

        if (!snap.exists) {
            return null;
        }

        return {
            uid: uid,
            ...snap.data()
        };

    } catch (error) {

        console.error(
            "Pata user kwa UID error:",
            error
        );

        return null;
    }
}


/* =========================================================
   2. ONGEZA COMMISSION KWENYE MAIN WALLET
========================================================= */

async function ongezaCommissionMainWallet(
    uid,
    amount,
    source,
    bookingNumber,
    level
) {

    if (!uid) return;

    const commissionAmount =
        Number(
            Number(amount || 0)
                .toFixed(2)
        );

    if (
        commissionAmount <= 0
    ) {
        return;
    }


    const walletRef =
        db
            .collection("wallets")
            .doc(uid);


    await db.runTransaction(
        async transaction => {

            const walletSnap =
                await transaction.get(
                    walletRef
                );


            let walletData =
                walletSnap.exists
                    ? walletSnap.data()
                    : {};


            const oldBalance =
                Number(
                    walletData.balance || 0
                );


            const oldReferralCommission =
                Number(
                    walletData.referralCommission || 0
                );


            const oldTotalEarned =
                Number(
                    walletData.totalEarned || 0
                );


            const newBalance =
                Number(
                    (
                        oldBalance +
                        commissionAmount
                    ).toFixed(2)
                );


            const newReferralCommission =
                Number(
                    (
                        oldReferralCommission +
                        commissionAmount
                    ).toFixed(2)
                );


            const newTotalEarned =
                Number(
                    (
                        oldTotalEarned +
                        commissionAmount
                    ).toFixed(2)
                );


            const walletUpdate = {

                balance:
                    newBalance,

                referralCommission:
                    newReferralCommission,

                totalEarned:
                    newTotalEarned,

                updatedAt:
                    serverTimestamp()

            };


            if (
                walletSnap.exists
            ) {

                transaction.update(
                    walletRef,
                    walletUpdate
                );

            } else {

                transaction.set(
                    walletRef,
                    {

                        uid: uid,

                        balance:
                            newBalance,

                        bookingEarnings:
                            0,

                        referralCommission:
                            newReferralCommission,

                        totalEarned:
                            newTotalEarned,

                        totalWithdrawn:
                            0,

                        pendingWithdrawal:
                            0,

                        updatedAt:
                            serverTimestamp()

                    }
                );

            }

        }
    );


    /* =====================================================
       COMMISSION TRANSACTION RECORD
    ===================================================== */

    await db
        .collection("walletTransactions")
        .add({

            uid: uid,

            type:
                "referral_commission",

            source:
                source,

            level:
                level || null,

            amount:
                commissionAmount,

            bookingNumber:
                bookingNumber || null,

            createdAt:
                serverTimestamp()

        });

}


/* =========================================================
   3. ONGEZA BOOKING PROFIT KWENYE MAIN WALLET
========================================================= */

async function ongezaBookingProfitMainWallet(
    uid,
    amount,
    bookingNumber
) {

    if (!uid) return;


    const profit =
        Number(
            Number(amount || 0)
                .toFixed(2)
        );


    if (profit <= 0) {
        return;
    }


    const walletRef =
        db
            .collection("wallets")
            .doc(uid);


    await db.runTransaction(
        async transaction => {

            const walletSnap =
                await transaction.get(
                    walletRef
                );


            let walletData =
                walletSnap.exists
                    ? walletSnap.data()
                    : {};


            const oldBalance =
                Number(
                    walletData.balance || 0
                );


            const oldBookingEarnings =
                Number(
                    walletData.bookingEarnings || 0
                );


            const oldTotalEarned =
                Number(
                    walletData.totalEarned || 0
                );


            const newBalance =
                Number(
                    (
                        oldBalance +
                        profit
                    ).toFixed(2)
                );


            const newBookingEarnings =
                Number(
                    (
                        oldBookingEarnings +
                        profit
                    ).toFixed(2)
                );


            const newTotalEarned =
                Number(
                    (
                        oldTotalEarned +
                        profit
                    ).toFixed(2)
                );


            const walletUpdate = {

                balance:
                    newBalance,

                bookingEarnings:
                    newBookingEarnings,

                totalEarned:
                    newTotalEarned,

                updatedAt:
                    serverTimestamp()

            };


            if (
                walletSnap.exists
            ) {

                transaction.update(
                    walletRef,
                    walletUpdate
                );

            } else {

                transaction.set(
                    walletRef,
                    {

                        uid: uid,

                        balance:
                            newBalance,

                        bookingEarnings:
                            newBookingEarnings,

                        referralCommission:
                            0,

                        totalEarned:
                            newTotalEarned,

                        totalWithdrawn:
                            0,

                        pendingWithdrawal:
                            0,

                        updatedAt:
                            serverTimestamp()

                    }
                );

            }

        }
    );


    await db
        .collection("walletTransactions")
        .add({

            uid: uid,

            type:
                "booking_profit",

            source:
                "room_booking",

            amount:
                profit,

            bookingNumber:
                bookingNumber || null,

            createdAt:
                serverTimestamp()

        });

}


/* =========================================================
   4. PATA REFERRAL CHAIN
========================================================= */

async function pataReferralChain(
    user
) {

    const chain = [];


    if (!user) {
        return chain;
    }


    let currentUid =
        user.referredBy || null;


    let level = 1;


    while (
        currentUid &&
        level <= 3
    ) {

        const parent =
            await pataUserKwaUid(
                currentUid
            );


        if (!parent) {
            break;
        }


        chain.push({

            level:
                level,

            uid:
                parent.uid,

            name:
                parent.name || "",

            email:
                parent.email || "",

            referralCode:
                parent.referralCode || "",

            referredBy:
                parent.referredBy || null

        });


        currentUid =
            parent.referredBy ||
            null;


        level++;

    }


    return chain;

}


/* =========================================================
   5. PATA COMMISSION RATE
========================================================= */

function pataReferralRate(
    level
) {

    if (level === 1) {

        return (
            Number(
                ROOMRENT_SETTINGS
                    .userCommissionA
            ) / 100
        );

    }


    if (level === 2) {

        return (
            Number(
                ROOMRENT_SETTINGS
                    .userCommissionB
            ) / 100
        );

    }


    if (level === 3) {

        return (
            Number(
                ROOMRENT_SETTINGS
                    .userCommissionC
            ) / 100
        );

    }


    return 0;

}


/* =========================================================
   6. PATA ADMIN COMMISSION RATE
========================================================= */

function pataAdminCommissionRate(
    level
) {

    if (level === 1) {

        return (
            Number(
                ROOMRENT_SETTINGS
                    .adminCommissionA
            ) / 100
        );

    }


    if (level === 2) {

        return (
            Number(
                ROOMRENT_SETTINGS
                    .adminCommissionB
            ) / 100
        );

    }


    if (level === 3) {

        return (
            Number(
                ROOMRENT_SETTINGS
                    .adminCommissionC
            ) / 100
        );

    }


    return 0;

}


/* =========================================================
   7. PROCESS REFERRAL COMMISSIONS
========================================================= */

async function processReferralCommissions(
    booking
) {

    if (!booking) {
        return;
    }


    const customer =
        await pataUserKwaUid(
            booking.uid
        );


    if (!customer) {
        return;
    }


    const bookingAmount =
        Number(
            booking.amount ||
            booking.price ||
            0
        );


    if (bookingAmount <= 0) {
        return;
    }


    const chain =
        await pataReferralChain(
            customer
        );


    if (
        chain.length === 0
    ) {

        return;

    }


    /* =====================================================
       REFERRAL COMMISSION
    ===================================================== */

    for (
        const parent of chain
    ) {

        const rate =
            pataReferralRate(
                parent.level
            );


        const commission =
            Number(
                (
                    bookingAmount *
                    rate
                ).toFixed(2)
            );


        if (
            commission <= 0
        ) {

            continue;

        }


        await ongezaCommissionMainWallet(
            parent.uid,
            commission,
            "referral_level_" +
                parent.level,
            booking.bookingNumber,
            parent.level
        );


        await db
            .collection("notifications")
            .add({

                uid:
                    parent.uid,

                type:
                    "referral_commission",

                title:
                    "💰 Referral Commission",

                message:
                    `Umepokea TSh ` +
                    `${formatMoney(commission)} ` +
                    `kutoka Booking ` +
                    `${booking.bookingNumber} ` +
                    `(Level ${parent.level}).`,

                amount:
                    commission,

                bookingNumber:
                    booking.bookingNumber,

                level:
                    parent.level,

                read:
                    false,

                createdAt:
                    serverTimestamp()

            });

    }


    /* =====================================================
       ADMIN COMMISSION
    ===================================================== */

    for (
        const parent of chain
    ) {

        const adminRate =
            pataAdminCommissionRate(
                parent.level
            );


        const adminCommission =
            Number(
                (
                    bookingAmount *
                    adminRate
                ).toFixed(2)
            );


        if (
            adminCommission <= 0
        ) {

            continue;

        }


        await ongezaCommissionMainWallet(
            ADMIN_CONFIG.uid,
            adminCommission,
            "admin_referral_level_" +
                parent.level,
            booking.bookingNumber,
            parent.level
        );

    }

}


/* =========================================================
   8. PROCESS BOOKING FINANCIALS
========================================================= */

async function processBookingFinancials(
    booking
) {

    if (!booking) {
        return;
    }


    if (
        booking.financialsProcessed ===
        true
    ) {

        console.log(
            "Financials tayari zimesindikwa:",
            booking.bookingNumber
        );

        return;

    }


    /* =====================================================
       1. BOOKING PROFIT
    ===================================================== */

    const profit =
        Number(
            booking.totalProfit ||
            hesabuFaida(
                booking
            ) ||
            0
        );


    if (
        profit > 0
    ) {

        await ongezaBookingProfitMainWallet(
            booking.uid,
            profit,
            booking.bookingNumber
        );

    }


    /* =====================================================
       2. REFERRAL COMMISSIONS
    ===================================================== */

    await processReferralCommissions(
        booking
    );


    /* =====================================================
       3. MARK FINANCIALS PROCESSED
    ===================================================== */

    await db
        .collection("bookings")
        .doc(
            booking.bookingNumber
        )
        .update({

            financialsProcessed:
                true,

            profitProcessed:
                profit > 0,

            commissionProcessed:
                true,

            financialsProcessedAt:
                serverTimestamp(),

            updatedAt:
                serverTimestamp()

        });


    /* =====================================================
       4. CUSTOMER NOTIFICATION
    ===================================================== */

    await db
        .collection("notifications")
        .add({

            uid:
                booking.uid,

            type:
                "booking_profit_added",

            title:
                "💰 Faida Imeongezwa",

            message:
                `Faida ya TSh ` +
                `${formatMoney(profit)} ` +
                `kutoka Booking ` +
                `${booking.bookingNumber} ` +
                `imeongezwa kwenye Salio Kuu.`,

            amount:
                profit,

            bookingNumber:
                booking.bookingNumber,

            read:
                false,

            createdAt:
                serverTimestamp()

        });

}


/* =========================================================
   9. FUNCTION MPYA YA ADMIN CONFIRMATION
========================================================= */

async function thibitishaBookingAdminV2(
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


    if (
        user.uid !==
        ADMIN_CONFIG.uid
    ) {

        alert(
            "Huna ruhusa ya Admin."
        );

        return;

    }


    if (!bookingNumber) {

        alert(
            "Booking Number haipo."
        );

        return;

    }


    const confirmAction =
        confirm(
            "Unathibitisha kuwa malipo haya yamepokelewa?"
        );


    if (!confirmAction) {
        return;
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


        if (
            !bookingSnap.exists
        ) {

            alert(
                "Booking haikupatikana."
            );

            return;

        }


        const booking =
            bookingSnap.data();


        if (
            booking.status !==
            "payment_pending"
        ) {

            alert(
                "Booking hii tayari imeshughulikiwa."
            );

            return;

        }


        /* =================================================
           CONFIRM PAYMENT
        ================================================= */

        await bookingRef.update({

            status:
                "confirmed",

            paymentStatus:
                "confirmed",

            adminConfirmed:
                true,

            confirmedBy:
                ADMIN_CONFIG.uid,

            confirmedAt:
                serverTimestamp(),

            updatedAt:
                serverTimestamp()

        });


        /* =================================================
           PROCESS MONEY
        ================================================= */

        const updatedBooking = {

            ...booking,

            bookingNumber:
                booking.bookingNumber ||
                bookingNumber,

            status:
                "confirmed"

        };


        await processBookingFinancials(
            updatedBooking
        );


        /* =================================================
           NOTIFICATION
        ================================================= */

        await db
            .collection("notifications")
            .add({

                uid:
                    booking.uid,

                type:
                    "payment_confirmed",

                title:
                    "✅ Malipo Yamethibitishwa",

                message:
                    `Malipo ya Booking ` +
                    `${bookingNumber} ` +
                    `yamehakikiwa. ` +
                    `Faida yako imeongezwa ` +
                    `kwenye Salio Kuu.`,

                bookingNumber:
                    bookingNumber,

                read:
                    false,

                createdAt:
                    serverTimestamp()

            });


        alert(
            "✅ Malipo yamethibitishwa na faida/commission zimesindikwa."
        );


        await pakiaAdminBookings();


    } catch (error) {

        console.error(
            "Admin confirmation V2 error:",
            error
        );


        alert(
            "❌ Imeshindikana kuthibitisha malipo.\n\n" +
            firebaseErrorMessage(
                error
            )
        );

    }

}


/* =========================================================
   10. MWISHO WA SEHEMU YA 6
========================================================= */

/* =========================================================
   ROOMRENT - SEHEMU YA 8
   ADMIN CONFIRMATION + DAILY PROFIT ACTIVATION
   =========================================================

   MUHIMU:
   - Admin confirmation HAILIPI profit ya siku 40
   - Booking inawekwa confirmed
   - Daily profit inaanza kupitia Cloud Function
   - Daily profit = siku 1 kwa siku
   - Referral commissions zinachakatwa mara moja
========================================================= */


/* =========================================================
   1. ADMIN CONFIRM BOOKING
========================================================= */

async function thibitishaBookingAdmin(bookingNumber) {

    try {

        if (!currentUser) {

            alert(
                "Tafadhali ingia kwanza."
            );

            return;
        }


        if (
            currentUser.uid !==
            ADMIN_CONFIG.uid
        ) {

            alert(
                "Huna ruhusa ya Admin."
            );

            return;
        }


        if (!bookingNumber) {

            alert(
                "Booking number haijapatikana."
            );

            return;
        }


        const bookingRef =
            db
                .collection("bookings")
                .doc(bookingNumber);


        const bookingSnap =
            await bookingRef.get();


        if (!bookingSnap.exists) {

            alert(
                "Booking haijapatikana."
            );

            return;
        }


        const booking =
            bookingSnap.data();


        /* -------------------------------------------------
           CHECK STATUS
        ------------------------------------------------- */

        if (
            booking.status ===
            "confirmed"
        ) {

            alert(
                "Booking hii tayari imethibitishwa."
            );

            return;
        }


        if (
            booking.status ===
            "completed"
        ) {

            alert(
                "Booking hii tayari imekamilika."
            );

            return;
        }


        if (
            booking.status ===
            "rejected"
        ) {

            alert(
                "Booking hii tayari imekataliwa."
            );

            return;
        }


        /* -------------------------------------------------
           CONFIRM BOOKING
           HAPA HATUTOI PROFIT
        ------------------------------------------------- */

        await bookingRef.update({

            status:
                "confirmed",

            confirmedAt:
                serverTimestamp(),

            updatedAt:
                serverTimestamp(),

            profitDaysPaid:
                Number(
                    booking.profitDaysPaid || 0
                ),

            totalProfitPaid:
                Number(
                    booking.totalProfitPaid || 0
                ),

            financialsProcessed:
                false
        });


        /* -------------------------------------------------
           REFERRAL COMMISSIONS
        -------------------------------------------------

           Referral commission ni tofauti na
           daily booking profit.
        ------------------------------------------------- */

        try {

            await processReferralCommissions(
                {
                    ...booking,

                    bookingNumber:
                        bookingNumber,

                    status:
                        "confirmed"
                }
            );

        } catch (commissionError) {

            console.error(
                "Referral commission error:",
                commissionError
            );

            /*
             * Booking tayari imethibitishwa.
             * Error ya referral isiifanye
             * payment confirmation ishindwe.
             */
        }


        /* -------------------------------------------------
           CUSTOMER NOTIFICATION
        ------------------------------------------------- */

        if (booking.uid) {

            await db
                .collection("users")
                .doc(booking.uid)
                .collection("notifications")
                .add({

                    type:
                        "booking_confirmed",

                    title:
                        "Booking imethibitishwa ✅",

                    message:
                        `Booking ${bookingNumber} ` +
                        `imethibitishwa. Faida yako ` +
                        `itaanza kuingia kila siku ` +
                        `saa 00:00.`,

                    bookingNumber:
                        bookingNumber,

                    read:
                        false,

                    createdAt:
                        serverTimestamp()
                });
        }


        /* -------------------------------------------------
           ADMIN NOTIFICATION
        ------------------------------------------------- */

        try {

            await db
                .collection("notifications")
                .add({

                    type:
                        "admin_booking_confirmed",

                    title:
                        "Booking imethibitishwa",

                    message:
                        `Booking ${bookingNumber} ` +
                        `imethibitishwa.`,

                    bookingNumber:
                        bookingNumber,

                    createdAt:
                        serverTimestamp()
                });

        } catch (notificationError) {

            console.warn(
                "Admin notification error:",
                notificationError
            );
        }


        alert(
            "✅ Booking imethibitishwa!\n\n" +
            "Faida ya siku 40 HAijawekwa yote.\n" +
            "Mfumo utaweka faida ya siku moja " +
            "automatic kila saa 00:00."
        );


        /* -------------------------------------------------
           REFRESH ADMIN
        ------------------------------------------------- */

        if (
            typeof pakiaAdminBookings ===
            "function"
        ) {

            await pakiaAdminBookings();
        }


    } catch (error) {

        console.error(
            "thibitishaBookingAdmin error:",
            error
        );


        alert(
            "❌ Imeshindikana kuthibitisha booking:\n" +
            firebaseErrorMessage(error)
        );
    }
}


/* =========================================================
   2. SAFETY VERSION
   =========================================================

   Hii inasaidia kama sehemu nyingine ya script
   inaita V2.
========================================================= */

async function thibitishaBookingAdminV2(
    bookingNumber
) {

    return await thibitishaBookingAdmin(
        bookingNumber
    );
}


/* =========================================================
   3. KATAA BOOKING
========================================================= */

async function kataaBookingAdmin(
    bookingNumber
) {

    try {

        if (!currentUser) {

            alert(
                "Tafadhali ingia kwanza."
            );

            return;
        }


        if (
            currentUser.uid !==
            ADMIN_CONFIG.uid
        ) {

            alert(
                "Huna ruhusa ya Admin."
            );

            return;
        }


        if (!bookingNumber) {

            alert(
                "Booking number haijapatikana."
            );

            return;
        }


        const bookingRef =
            db
                .collection("bookings")
                .doc(bookingNumber);


        const bookingSnap =
            await bookingRef.get();


        if (!bookingSnap.exists) {

            alert(
                "Booking haijapatikana."
            );

            return;
        }


        const booking =
            bookingSnap.data();


        if (
            booking.status ===
            "confirmed"
        ) {

            alert(
                "Booking hii tayari imethibitishwa, " +
                "haiwezi kukataliwa."
            );

            return;
        }


        if (
            booking.status ===
            "rejected"
        ) {

            alert(
                "Booking hii tayari imekataliwa."
            );

            return;
        }


        await bookingRef.update({

            status:
                "rejected",

            rejectedAt:
                serverTimestamp(),

            updatedAt:
                serverTimestamp()
        });


        /* -------------------------------------------------
           CUSTOMER NOTIFICATION
        ------------------------------------------------- */

        if (booking.uid) {

            await db
                .collection("users")
                .doc(booking.uid)
                .collection("notifications")
                .add({

                    type:
                        "booking_rejected",

                    title:
                        "Booking imekataliwa ❌",

                    message:
                        `Booking ${bookingNumber} ` +
                        `imekataliwa na Admin.`,

                    bookingNumber:
                        bookingNumber,

                    read:
                        false,

                    createdAt:
                        serverTimestamp()
                });
        }


        alert(
            "❌ Booking imekataliwa."
        );


        if (
            typeof pakiaAdminBookings ===
            "function"
        ) {

            await pakiaAdminBookings();
        }


    } catch (error) {

        console.error(
            "kataaBookingAdmin error:",
            error
        );


        alert(
            "❌ Imeshindikana kukataa booking:\n" +
            firebaseErrorMessage(error)
        );
    }
}


/* =========================================================
   4. IMPORTANT SAFETY OVERRIDE
=========================================================

   Usitumie tena function ya zamani ambayo
   ilikuwa inaongeza totalProfit yote.

   Function hii inazuia code nyingine kuiita
   processBookingFinancials kwa booking confirmation.
========================================================= */

async function processBookingFinancials(
    booking
) {

    console.warn(
        "processBookingFinancials imezuiwa " +
        "kwa sababu RoomRent sasa inalipa " +
        "profit daily kupitia Cloud Function."
    );


    return {

        success:
            true,

        daily:
            true,

        message:
            "Daily profit itashughulikiwa na Cloud Function."
    };
}


/* =========================================================
   5. ADMIN CONFIRMATION TEST
========================================================= */

async function testDailyProfitSystem() {

    console.log(
        "===================================="
    );

    console.log(
        "ROOMRENT DAILY PROFIT SYSTEM"
    );

    console.log(
        "Time: 00:00"
    );

    console.log(
        "Timezone: Africa/Dar_es_Salaam"
    );

    console.log(
        "Duration: 40 days"
    );

    console.log(
        "Profit: daily"
    );

    console.log(
        "===================================="
    );
}


