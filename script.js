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
   ROOMRENT - MAIN WALLET
========================================================= */

async function hakikishaMainWallet(uid) {

    if (!uid || !db) return null;

    const walletRef =
        db.collection("wallets").doc(uid);

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

            createdAt:
                firebase.firestore.FieldValue
                .serverTimestamp(),

            updatedAt:
                firebase.firestore.FieldValue
                .serverTimestamp()

        };

        await walletRef.set(walletData);

        return walletData;
    }

    return snap.data();
}


/* =========================================================
   ONGEZA FEDHA KWENYE MAIN WALLET
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

    amount = Number(amount || 0);

    if (amount <= 0) {
        return;
    }

    const walletRef =
        db.collection("wallets").doc(uid);

    await db.runTransaction(
        async (transaction) => {

            const snap =
                await transaction.get(walletRef);

            let wallet = {};

            if (snap.exists) {
                wallet = snap.data();
            }

            const oldBalance =
                Number(wallet.balance || 0);

            const oldTotalEarned =
                Number(wallet.totalEarned || 0);

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


            if (source === "booking") {

                bookingEarnings += amount;

            } else if (source === "referral") {

                referralCommission += amount;

            }


            transaction.set(
                walletRef,
                {

                    uid: uid,

                    balance:
                        oldBalance + amount,

                    bookingEarnings:
                        bookingEarnings,

                    referralCommission:
                        referralCommission,

                    totalEarned:
                        oldTotalEarned + amount,

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
   ONYESHA MAIN WALLET
========================================================= */

function onyeshaMainWallet(wallet) {

    const container =
        getElement("mainWallet");

    if (!container) return;

    const balance =
        Number(wallet.balance || 0);

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
                onclick="funguaWithdrawal()"
            >
                💸 Toa Pesa
            </button>

        </div>
    `;
}


/* =========================================================
   SIKILIZA MAIN WALLET
========================================================= */

let mainWalletUnsubscribe = null;

async function anzishaMainWallet() {

    const user =
        getCurrentUser();

    if (!user) return;

    await hakikishaMainWallet(
        user.uid
    );

    if (mainWalletUnsubscribe) {

        mainWalletUnsubscribe();

        mainWalletUnsubscribe = null;

    }

    mainWalletUnsubscribe =
        db.collection("wallets")
          .doc(user.uid)
          .onSnapshot(

            function(snapshot) {

                if (!snapshot.exists) {

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
}


/* =========================================================
   SIMAMISHA MAIN WALLET
========================================================= */

function simamishaMainWallet() {

    if (mainWalletUnsubscribe) {

        mainWalletUnsubscribe();

        mainWalletUnsubscribe = null;
    }

        }                      

/* =========================================================
   WITHDRAWAL - CUSTOMER
========================================================= */

async function funguaWithdrawal() {

    const user = getCurrentUser();

    if (!user) {
        alert("Tafadhali ingia kwenye account kwanza.");
        return;
    }

    const section =
        getElement("withdrawalSection");

    if (!section) {
        console.error(
            "❌ #withdrawalSection haipo kwenye HTML."
        );
        return;
    }


    /* FICHA SEHEMU NYINGINE */

    hideSection("vyumba");
    hideSection("fomuKodi");
    hideSection("taarifaSection");


    /* ONESHA WITHDRAWAL */

    section.style.display = "block";


    /* HTML YA WITHDRAWAL */

    section.innerHTML = `

        <div class="booking-card">

            <button
                type="button"
                onclick="
                    document.getElementById(
                        'withdrawalSection'
                    ).style.display='none';
                "
            >
                ✕ Funga
            </button>


            <h2>
                💸 Toa Pesa
            </h2>


            <div id="withdrawalWalletInfo">

                <p>
                    ⏳ Inapakia Salio Kuu...
                </p>

            </div>


            <hr>


            <label>
                💰 Kiasi cha kutoa
            </label>


            <input
                type="number"
                id="withdrawalAmount"
                placeholder="Mfano: 10000"
                min="1"
                step="1"
            >


            <br><br>


            <label>
                📱 Njia ya kupokea pesa
            </label>


            <select id="withdrawalMethod">

                <option value="">
                    -- Chagua njia --
                </option>

                <option value="MIXX BY YAS">
                    MIXX BY YAS
                </option>

                <option value="Airtel Money">
                    Airtel Money
                </option>

            </select>


            <br><br>


            <label>
                📞 Namba ya simu
            </label>


            <input
                type="tel"
                id="withdrawalPhone"
                placeholder="Mfano: 0651234567"
                maxlength="10"
            >


            <br><br>


            <!-- TUMA OMBI -->

           <button
    id="submitWithdrawalBtn"
    type="button"
    onclick="alert('🔥 TUMA OMBI BUTTON INAFANYA KAZI!')"
>
    💸 Tuma Ombi la Kutoa Pesa
</button> 


            <!-- UJUMBE -->

            <div
                id="withdrawalMessage"
                style="margin-top:15px;"
            ></div>

        </div>


        <div
            class="booking-card"
            id="withdrawalHistory"
            style="margin-top:20px;"
        >

            <h3>
                📋 Historia ya Withdrawal
            </h3>

            <p>
                ⏳ Inapakia...
            </p>

        </div>
    `;


    /* =====================================================
       MUHIMU:
       CONNECT BUTTON BAADA YA HTML KUTENGENEZWA
    ===================================================== */

    const submitWithdrawalBtn =
        document.getElementById(
            "submitWithdrawalBtn"
        );


    if (!submitWithdrawalBtn) {

        console.error(
            "❌ submitWithdrawalBtn haijapatikana."
        );

        return;
    }


    submitWithdrawalBtn.addEventListener(
        "click",
        function () {

            console.log(
                "🔥 TUMA OMBI BUTTON IMEBONYEZWA"
            );

            alert(
                "🔥 Button ya Tuma Ombi imefanya kazi."
            );


            /* ITAENDELEA KWENYE FUNCTION YA WITHDRAWAL */

            tumaWithdrawal();

        }
    );


    /* PAKIA TAARIFA */

    await pakiaWithdrawalData();


    /* SCROLL JUU */

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}

/* =========================================================
   PAKIA SALIO + HISTORIA
========================================================= */

async function pakiaWithdrawalData() {

    const user = getCurrentUser();

    if (!user || !db) return;

    try {

        const walletRef =
            db.collection("wallets").doc(user.uid);

        const walletSnap =
            await walletRef.get();

        let wallet = {
            balance: 0,
            totalWithdrawn: 0,
            pendingWithdrawal: 0
        };

        if (walletSnap.exists) {
            wallet = walletSnap.data();
        }

        const balance =
            Number(wallet.balance || 0);

        const totalWithdrawn =
            Number(wallet.totalWithdrawn || 0);

        const pendingWithdrawal =
            Number(wallet.pendingWithdrawal || 0);

        const info =
            getElement("withdrawalWalletInfo");

        if (info) {

            info.innerHTML = `
                <div style="
                    padding:15px;
                    border-radius:10px;
                    background:#f5f5f5;
                ">

                    <h3>💰 Salio Kuu</h3>

                    <h2>
                        TSh ${formatMoney(balance)}
                    </h2>

                    <p>
                        💸 Jumla iliyotolewa:
                        <strong>
                            TSh ${formatMoney(totalWithdrawn)}
                        </strong>
                    </p>

                    <p>
                        ⏳ Withdrawal inayosubiri:
                        <strong>
                            TSh ${formatMoney(pendingWithdrawal)}
                        </strong>
                    </p>

                </div>
            `;
        }

        await pakiaHistoriaWithdrawal();

    } catch (error) {

        console.error(
            "❌ Withdrawal data error:",
            error
        );

        const info =
            getElement("withdrawalWalletInfo");

        if (info) {

            info.innerHTML = `
                <p style="color:red;">
                    Imeshindikana kupakia Salio Kuu.
                </p>
            `;
        }
    }
}


/* =========================================================
   TUMA WITHDRAWAL
========================================================= */

async function tumaWithdrawal() {
console.log("🔥 TUMA WITHDRAWAL IMEITWA");
alert("🔥 Button ya Tuma Ombi imefanya kazi.");
    const user = getCurrentUser();

    if (!user || !db) {
        alert("Tafadhali ingia kwanza.");
        return;
    }

    const amountInput =
        getElement("withdrawalAmount");

    const methodInput =
        getElement("withdrawalMethod");

    const phoneInput =
        getElement("withdrawalPhone");

    const message =
        getElement("withdrawalMessage");

    const button =
        getElement("submitWithdrawalBtn");


    const amount =
        Number(amountInput?.value || 0);

    const method =
        methodInput?.value || "";

    const phone =
        (phoneInput?.value || "").trim();


    if (amount <= 0) {

        if (message) {
            message.innerHTML =
                `<p style="color:red;">
                    Tafadhali weka kiasi sahihi.
                </p>`;
        }

        return;
    }


    if (!method) {

        if (message) {
            message.innerHTML =
                `<p style="color:red;">
                    Tafadhali chagua njia ya malipo.
                </p>`;
        }

        return;
    }


    if (!/^[0-9]{10}$/.test(phone)) {

        if (message) {
            message.innerHTML =
                `<p style="color:red;">
                    Tafadhali weka namba ya simu yenye tarakimu 10.
                </p>`;
        }

        return;
    }


    try {

        if (button) {
            button.disabled = true;
            button.textContent =
                "⏳ Inatuma ombi...";
        }


        /*
         * READ WALLET
         *
         * Muhimu:
         * HATUPUNGUZI SALIO HAPA.
         * Admin ndiye atakayeshughulikia
         * uthibitisho baadaye.
         */

        const walletRef =
            db.collection("wallets").doc(user.uid);

        const walletSnap =
            await walletRef.get();

        if (!walletSnap.exists) {
            throw new Error(
                "Wallet haijapatikana."
            );
        }

        const wallet =
            walletSnap.data();

        const balance =
            Number(wallet.balance || 0);

        const pendingWithdrawal =
            Number(wallet.pendingWithdrawal || 0);

        const availableBalance =
            balance - pendingWithdrawal;


        if (amount > availableBalance) {

            if (message) {
                message.innerHTML =
                    `<p style="color:red;">
                        ❌ Salio lako linalopatikana
                        halitoshi kwa kiasi hicho.
                    </p>`;
            }

            return;
        }


        /* CREATE UNIQUE WITHDRAWAL NUMBER */

        const withdrawalNumber =
            "WD" +
            Date.now().toString().slice(-10);


        /* USER DATA */

        let userData = {};

        try {

            const userSnap =
                await db
                    .collection("users")
                    .doc(user.uid)
                    .get();

            if (userSnap.exists) {
                userData = userSnap.data();
            }

        } catch (userError) {

            console.warn(
                "User data haikupatikana:",
                userError
            );
        }


        /* SAVE REQUEST */

        await db
            .collection("withdrawals")
            .doc(withdrawalNumber)
            .set({

                withdrawalNumber,

                uid: user.uid,

                name:
                    userData.name ||
                    user.displayName ||
                    "",

                email:
                    user.email ||
                    userData.email ||
                    "",

                phone:

                    userData.phone ||
                    "",

                amount,

                method,

                paymentPhone: phone,

                status: "pending",

                createdAt:
                    firebase.firestore
                        .FieldValue
                        .serverTimestamp(),

                updatedAt:
                    firebase.firestore
                        .FieldValue
                        .serverTimestamp()

            });


        /*
         * UPDATE ONLY PENDING AMOUNT
         *
         * HATUGUSI BALANCE.
         */

        await walletRef.set({

            pendingWithdrawal:
                pendingWithdrawal + amount,

            updatedAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp()

        }, {
            merge: true
        });


        if (message) {

            message.innerHTML = `
                <div style="
                    padding:15px;
                    border-radius:10px;
                    background:#e8f5e9;
                ">

                    <strong>
                        ✅ Ombi limetumwa!
                    </strong>

                    <p>
                        Namba ya Withdrawal:
                        <strong>
                            ${escapeHTML(withdrawalNumber)}
                        </strong>
                    </p>

                    <p>
                        Kiasi:
                        <strong>
                            TSh ${formatMoney(amount)}
                        </strong>
                    </p>

                    <p>
                        Njia:
                        <strong>
                            ${escapeHTML(method)}
                        </strong>
                    </p>

                    <p>
                        Ombi lako linasubiri
                        uthibitisho wa Admin.
                    </p>

                </div>
            `;

        }


        /* CLEAR FORM */

        if (amountInput) {
            amountInput.value = "";
        }

        if (methodInput) {
            methodInput.value = "";
        }

        if (phoneInput) {
            phoneInput.value = "";
        }


        await pakiaWithdrawalData();


    } catch (error) {

        console.error(
            "❌ Tuma Withdrawal error:",
            error
        );

        if (message) {

            message.innerHTML = `
                <p style="color:red;">
                    ❌ Imeshindikana kutuma ombi:
                    ${escapeHTML(
                        error.message ||
                        "Hitilafu isiyojulikana."
                    )}
                </p>
            `;
        }

    } finally {

        if (button) {

            button.disabled = false;

            button.textContent =
                "💸 Tuma Ombi la Kutoa Pesa";
        }
    }
}


/* =========================================================
   HISTORIA YA WITHDRAWAL
========================================================= */

async function pakiaHistoriaWithdrawal() {

    const user = getCurrentUser();

    if (!user || !db) return;

    const container =
        getElement("withdrawalHistory");

    if (!container) return;

    try {

        const snapshot =
            await db
                .collection("withdrawals")
                .where("uid", "==", user.uid)
                .get();


        if (snapshot.empty) {

            container.innerHTML = `
                <h3>📋 Historia ya Withdrawal</h3>
                <p>
                    Bado hujafanya withdrawal yoyote.
                </p>
            `;

            return;
        }


        const withdrawals =
            snapshot.docs
                .map(doc => doc.data())
                .sort((a, b) => {

                    const aTime =
                        a.createdAt?.toMillis?.() || 0;

                    const bTime =
                        b.createdAt?.toMillis?.() || 0;

                    return bTime - aTime;
                });


        let html = `
            <h3>📋 Historia ya Withdrawal</h3>
        `;


        withdrawals.forEach(function(item) {

            let statusText =
                "⏳ Pending";

            if (item.status === "approved") {
                statusText =
                    "✅ Approved";
            }

            if (item.status === "rejected") {
                statusText =
                    "❌ Rejected";
            }

            html += `

                <div style="
                    padding:12px 0;
                    border-bottom:1px solid #ddd;
                ">

                    <strong>
                        ${escapeHTML(
                            item.withdrawalNumber || ""
                        )}
                    </strong>

                    <p>
                        💰 TSh
                        ${formatMoney(
                            Number(item.amount || 0)
                        )}
                    </p>

                    <p>
                        📱
                        ${escapeHTML(
                            item.method || ""
                        )}
                        -
                        ${escapeHTML(
                            item.paymentPhone || ""
                        )}
                    </p>

                    <p>
                        ${statusText}
                    </p>

                </div>
            `;
        });


        container.innerHTML = html;


    } catch (error) {

        console.error(
            "❌ Historia withdrawal error:",
            error
        );

        container.innerHTML = `
            <h3>📋 Historia ya Withdrawal</h3>
            <p style="color:red;">
                Imeshindikana kupakia historia.
            </p>
        `;
    }
}
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
   ADMIN REFERRAL LINK
========================================================= */

async function wekaAdminReferralLink() {

    const ADMIN_UID =
        "1kj3K591EHhHAOiSoxIp1xGve2x1";

    const ADMIN_REFERRAL_CODE =
        "RRADMIN";

    const adminRef =
        db.collection("users").doc(ADMIN_UID);

    const adminSnap =
        await adminRef.get();

    if (!adminSnap.exists) {
        console.warn(
            "⚠️ Admin user document haipo."
        );
        return;
    }

    const baseUrl =
        window.location.origin +
        window.location.pathname;

    const adminReferralLink =
        baseUrl +
        "?ref=" +
        ADMIN_REFERRAL_CODE;

    await adminRef.set({

        referralCode:
            ADMIN_REFERRAL_CODE,

        referralLink:
            adminReferralLink,

        referralType:
            "admin",

        updatedAt:
            firebase.firestore.FieldValue
                .serverTimestamp()

    }, {
        merge: true
    });

    console.log(
        "✅ Admin referral link:",
        adminReferralLink
    );

    return adminReferralLink;
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
        getElement("taarifaSection");

    if (!section) {
        return;
    }

    hideSection("vyumba");
    hideSection("fomuKodi");

    section.style.display = "block";

    section.innerHTML = `

        <div class="booking-card">

            <h2>👤 Account Yangu</h2>

            <p>
                ⏳ Inapakia taarifa...
            </p>

        </div>
    `;

    try {

        /* =================================================
           ACCOUNT DATA
        ================================================= */

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


        /* =================================================
           MAIN WALLET
        ================================================= */

        let wallet = {

            balance: 0,

            bookingEarnings: 0,

            referralCommission: 0,

            totalEarned: 0,

            totalWithdrawn: 0,

            pendingWithdrawal: 0

        };


        /*
           Wallet ikipata error, Account isianguke.
        */

        try {

            if (typeof hakikishaMainWallet === "function") {

                await hakikishaMainWallet(
                    user.uid
                );

            }

            const walletRef =
                db.collection("wallets")
                  .doc(user.uid);

            const walletSnap =
                await walletRef.get();

            if (walletSnap.exists) {

                wallet =
                    walletSnap.data();

            }

        } catch (walletError) {

            console.error(
                "MAIN WALLET ERROR:",
                walletError
            );

            /*
               Account itaendelea kuonekana
               hata kama Wallet ina tatizo.
            */

            wallet = {

                balance: 0,

                bookingEarnings: 0,

                referralCommission: 0,

                totalEarned: 0,

                totalWithdrawn: 0,

                pendingWithdrawal: 0

            };
        }


        /* =================================================
           WALLET VALUES
        ================================================= */

        const mainBalance =
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


        /* =================================================
           DISPLAY ACCOUNT
        ================================================= */

        section.innerHTML = `

            <!-- MAIN WALLET -->

            <div
                class="booking-card"
                id="accountMainWallet"
            >

                <h2>
                    💰 Salio Kuu
                </h2>

                <div style="
                    font-size:34px;
                    font-weight:bold;
                    margin:18px 0;
                ">

                    TSh ${formatMoney(
                        mainBalance
                    )}

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
                    id="accountWithdrawalBtn"
                >
                    💸 Toa Pesa
                </button>

            </div>


            <!-- ACCOUNT DETAILS -->

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


        /* =================================================
           WITHDRAWAL BUTTON
        ================================================= */

        const withdrawalButton =
            getElement(
                "accountWithdrawalBtn"
            );

        if (withdrawalButton) {

            withdrawalButton.onclick =
                function() {

                    funguaWithdrawal();

                };

        }


        /* =================================================
           COPY REFERRAL
        ================================================= */

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


        /* =================================================
           LOGOUT
        ================================================= */

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

async function adminLogin() {

    const message =
        getElement("adminLoginMessage");

    try {

        const user =
            getCurrentUser();

        /* ================================================
           CHECK LOGIN
        ================================================ */

        if (!user) {

            if (message) {

                message.style.display = "block";
                message.style.color = "red";

                message.textContent =
                    "❌ Tafadhali ingia RoomRent kwanza.";
            }

            return;
        }


        /* ================================================
           CHECK ADMIN EMAIL
        ================================================ */

        const adminEmail =
            "harounhamad62@gmail.com";

        const userEmail =
            (user.email || "").toLowerCase().trim();


        if (userEmail !== adminEmail) {

            if (message) {

                message.style.display = "block";
                message.style.color = "red";

                message.textContent =
                    "❌ Account hii haina ruhusa ya Admin.";
            }

            return;
        }


        /* ================================================
           ADMIN VERIFIED
        ================================================ */

        console.log(
            "✅ ADMIN VERIFIED:",
            userEmail
        );
await wekaAdminReferralLink();

        if (message) {

            message.style.display = "block";
            message.style.color = "green";

            message.textContent =
                "✅ Admin imethibitishwa. Inafungua Dashboard...";
        }


        /* ================================================
           CLOSE LOGIN MODAL
        ================================================ */

        setTimeout(() => {

            fungaAdminLogin();

            funguaAdminDashboard();

        }, 500);


    } catch (error) {

        console.error(
            "ADMIN LOGIN ERROR:",
            error
        );

        if (message) {

            message.style.display = "block";
            message.style.color = "red";

            message.textContent =
                "❌ Imeshindikana kuthibitisha Admin.";
        }

    }

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
/* =========================================================
   41. ADMIN DASHBOARD
========================================================= */

async function funguaAdminDashboard() {

    const user = getCurrentUser();

    if (!user) {
        alert("❌ Tafadhali ingia kwanza.");
        return;
    }

    const adminEmail =
        "harounhamad62@gmail.com";

    if (
        (user.email || "").toLowerCase().trim()
        !== adminEmail
    ) {
        alert("❌ Huna ruhusa ya Admin.");
        return;
    }

    let dashboard =
        getElement("adminDashboard");

    if (!dashboard) {

        dashboard =
            document.createElement("section");

        dashboard.id =
            "adminDashboard";

        dashboard.style.padding =
            "20px";

        dashboard.style.background =
            "#f5f5f5";

        document.querySelector("main")
            .appendChild(dashboard);
    }

    dashboard.style.display =
        "block";

    dashboard.innerHTML = `
        <div class="booking-card">

            <h2>🔐 RoomRent Admin</h2>

            <p>
                👤 Admin:
                <strong>${adminEmail}</strong>
            </p>

            <hr>

            <h3>📋 Bookings</h3>

            <div id="adminBookingsList">
                ⏳ Inapakia bookings...
            </div>

            <br>

            <button
                onclick="fungaAdminDashboard()"
                class="endeleaBtn">
                ❌ Funga Admin
            </button>

        </div>
    `;

    await pakiaAdminBookings();
}


/* =========================================================
   42. LOAD ADMIN BOOKINGS
========================================================= */

async function pakiaAdminBookings() {

    const container =
        getElement("adminBookingsList");

    if (!container) return;

    try {

        const snapshot =
            await db
                .collection("bookings")
                .orderBy(
                    "createdAt",
                    "desc"
                )
                .get();

        if (snapshot.empty) {

            container.innerHTML = `
                <p>
                    📭 Hakuna booking bado.
                </p>
            `;

            return;
        }

        let html = "";

        snapshot.forEach(doc => {

            const booking =
                doc.data();

            const status =
                booking.status ||
                "Waiting Confirmation";

            const paymentStatus =
                booking.paymentStatus ||
                "Waiting Confirmation";

            html += `

                <div
                    class="booking-card"
                    style="
                        background:white;
                        margin-bottom:15px;
                        padding:15px;
                        border-radius:10px;
                    "
                >

                    <h3>
                        🏠 Booking
                        ${booking.bookingNumber || doc.id}
                    </h3>

                    <p>
                        👤 <strong>Mteja:</strong>
                        ${booking.customerName || "-"}
                    </p>

                    <p>
                        📱 <strong>Simu:</strong>
                        ${booking.customerPhone || "-"}
                    </p>

                    <p>
                        🏠 <strong>Chumba:</strong>
                        ${booking.roomNumber || "-"}
                    </p>

                    <p>
                        💰 <strong>Kiasi:</strong>
                        TSh ${formatMoney(
                            booking.roomPrice || 0
                        )}
                    </p>

                    <p>
                        📲 <strong>Njia ya malipo:</strong>
                        ${booking.paymentMethod || "-"}
                    </p>

                    <p>
                        📞 <strong>Namba iliyotumika kulipia:</strong>
                        ${booking.paymentPhone || "Haijawekwa"}
                    </p>

                    <p>
                        💳 <strong>Payment Status:</strong>
                        ${paymentStatus}
                    </p>

                    <p>
                        📋 <strong>Booking Status:</strong>
                        ${status}
                    </p>

                    <hr>

                    ${
                        status ===
                        "Waiting Confirmation"
                        ?
                        `
                        <button
                            onclick="adminConfirmBooking('${doc.id}')"
                            style="margin:5px;"
                        >
                            ✅ Confirm Payment
                        </button>

                        <button
                            onclick="adminRejectBooking('${doc.id}')"
                            style="margin:5px;"
                        >
                            ❌ Reject Payment
                        </button>
                        `
                        :
                        `
                        <p>
                            ℹ️ Booking hii tayari
                            imefanyiwa uamuzi.
                        </p>
                        `
                    }

                </div>
            `;
        });

        container.innerHTML =
            html;

    } catch (error) {

        console.error(
            "ADMIN BOOKINGS ERROR:",
            error
        );

        container.innerHTML = `
            <p style="color:red;">
                ❌ Imeshindikana kupakia bookings.
                <br>
                ${error.message}
            </p>
        `;
    }
}


/* =========================================================
   43. ADMIN CONFIRM BOOKING + COMMISSION
========================================================= */

async function adminConfirmBooking(bookingId) {

    const user = getCurrentUser();

    if (!user) {
        alert("❌ Tafadhali ingia kwanza.");
        return;
    }

    if (
        (user.email || "").toLowerCase().trim()
        !== "harounhamad62@gmail.com"
    ) {
        alert("❌ Huna ruhusa ya Admin.");
        return;
    }

    const thibitisha = confirm(
        "Unataka kuthibitisha malipo ya booking hii?"
    );

    if (!thibitisha) return;

    try {

        /* =====================================================
           1. PATA BOOKING
        ===================================================== */

        const bookingRef =
            db.collection("bookings").doc(bookingId);

        const bookingSnap =
            await bookingRef.get();

        if (!bookingSnap.exists) {

            alert("❌ Booking haikupatikana.");

            return;
        }

        const booking =
            bookingSnap.data();


        /* =====================================================
           2. ANGALIA KAMA IMESHA-CONFIRM
        ===================================================== */

        if (
            booking.status === "Confirmed" &&
            booking.paymentStatus === "Confirmed"
        ) {

            alert(
                "⚠️ Booking hii tayari imethibitishwa."
            );

            return;
        }


        /* =====================================================
           3. CONFIRM PAYMENT
        ===================================================== */

        await bookingRef.update({

            status: "Confirmed",

            paymentStatus: "Confirmed",

            commissionStatus: "Pending",

            referralCommissionStatus: "Pending",

            confirmedBy: user.uid,

            confirmedAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp(),

            updatedAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp()
        });


        /* =====================================================
           4. ANZA COMMISSION
        ===================================================== */

        await tengenezaCommissionsKwaBooking(
            bookingId,
            booking
        );


        /* =====================================================
           5. UPDATE BOOKING COMMISSION STATUS
        ===================================================== */

        await bookingRef.update({

            commissionStatus: "Completed",

            referralCommissionStatus: "Completed",

            commissionProcessedAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp(),

            updatedAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp()
        });


        /* =====================================================
           6. UJUMBE KWA ADMIN
        ===================================================== */

        alert(
            "✅ Payment imethibitishwa.\n\n" +
            "💰 Commission za Referral zimeundwa."
        );


        /* =====================================================
           7. REFRESH ADMIN BOOKINGS
        ===================================================== */

        await pakiaAdminBookings();


    } catch (error) {

        console.error(
            "CONFIRM + COMMISSION ERROR:",
            error
        );

        alert(
            "❌ Payment imethibitishwa lakini commission " +
            "imeshindwa kuchakatwa.\n\n" +
            error.message
        );
    }
}


/* =========================================================
   43B. TENGENEZA COMMISSIONS KWA BOOKING
========================================================= */

async function tengenezaCommissionsKwaBooking(
    bookingId,
    booking
) {

    try {

        const customerUid =
            booking.uid;

        if (!customerUid) {

            console.warn(
                "⚠️ Booking haina uid ya mteja."
            );

            return;
        }


        /* =====================================================
           PATA CUSTOMER
        ===================================================== */

        const customerRef =
            db.collection("users")
              .doc(customerUid);

        const customerSnap =
            await customerRef.get();

        if (!customerSnap.exists) {

            console.warn(
                "⚠️ Customer hakupatikana."
            );

            return;
        }

        const customer =
            customerSnap.data();


        /* =====================================================
           REFERRAL CODE YA CUSTOMER
        ===================================================== */

        let referralCode =
            customer.referredBy || "";

        referralCode =
            referralCode.trim();


        /*
           Kama customer hana aliyem-refer,
           hakuna User Level A/B/C.
           
           Lakini booking inaweza kuwa chini
           ya Admin referral code RRADMIN.
        */

        if (!referralCode) {

            console.log(
                "ℹ️ Customer hana referrer."
            );

            return;
        }


        /* =====================================================
           TAFUTA REFERRER WA LEVEL A
        ===================================================== */

        const referrerQuery =
            await db
                .collection("users")
                .where(
                    "referralCode",
                    "==",
                    referralCode
                )
                .limit(1)
                .get();


        if (referrerQuery.empty) {

            console.warn(
                "⚠️ Referral code haikupatikana:",
                referralCode
            );

            return;
        }


        const referrerDoc =
            referrerQuery.docs[0];

        const levelAUser =
            referrerDoc.data();


        /* =====================================================
           LEVEL A
        ===================================================== */

        await createCommissionIfNotExists(
            bookingId,
            customerUid,
            referrerDoc.id,
            "A",
            ROOMRENT_SETTINGS.commission.user.A,
            booking
        );


        /* =====================================================
           TAFUTA LEVEL B
        ===================================================== */

        let levelBUid = null;

        if (levelAUser.referredBy) {

            const levelBQuery =
                await db
                    .collection("users")
                    .where(
                        "referralCode",
                        "==",
                        levelAUser.referredBy
                    )
                    .limit(1)
                    .get();

            if (!levelBQuery.empty) {

                levelBUid =
                    levelBQuery.docs[0].id;
            }
        }


        /* =====================================================
           LEVEL B
        ===================================================== */

        if (levelBUid) {

            await createCommissionIfNotExists(
                bookingId,
                customerUid,
                levelBUid,
                "B",
                ROOMRENT_SETTINGS.commission.user.B,
                booking
            );
        }


        /* =====================================================
           TAFUTA LEVEL C
        ===================================================== */

        let levelCUid = null;

        if (levelBUid) {

            const levelBRef =
                db.collection("users")
                  .doc(levelBUid);

            const levelBSnap =
                await levelBRef.get();

            if (levelBSnap.exists) {

                const levelBData =
                    levelBSnap.data();

                if (levelBData.referredBy) {

                    const levelCQuery =
                        await db
                            .collection("users")
                            .where(
                                "referralCode",
                                "==",
                                levelBData.referredBy
                            )
                            .limit(1)
                            .get();

                    if (!levelCQuery.empty) {

                        levelCUid =
                            levelCQuery.docs[0].id;
                    }
                }
            }
        }


        /* =====================================================
           LEVEL C
        ===================================================== */

        if (levelCUid) {

            await createCommissionIfNotExists(
                bookingId,
                customerUid,
                levelCUid,
                "C",
                ROOMRENT_SETTINGS.commission.user.C,
                booking
            );
        }


        /* =====================================================
           ADMIN COMMISSION
        ===================================================== */

        await createAdminCommissions(
            bookingId,
            customerUid,
            booking
        );


        console.log(
            "✅ Commissions zimeundwa kwa booking:",
            bookingId
        );

    } catch (error) {

        console.error(
            "COMMISSION PROCESS ERROR:",
            error
        );

        throw error;
    }
}


/* =========================================================
   43C. CREATE USER COMMISSION
========================================================= */

async function createCommissionIfNotExists(
    bookingId,
    customerUid,
    receiverUid,
    level,
    percentage,
    booking
) {

    if (!receiverUid) return;


    const commissionId =
        bookingId + "_USER_" + level;


    const commissionRef =
        db.collection("commissions")
          .doc(commissionId);


    const existing =
        await commissionRef.get();


    /* =====================================================
       USIUNDE COMMISSION MARA MBILI
    ===================================================== */

    if (existing.exists) {

        console.log(
            "ℹ️ Commission tayari ipo:",
            commissionId
        );

        return;
    }


    /* =====================================================
       HESABU COMMISSION
    ===================================================== */

    const bookingAmount =
        Number(booking.roomPrice || 0);

    const commissionAmount =
        Math.round(
            bookingAmount *
            Number(percentage) /
            100
        );


    /* =====================================================
       SAVE COMMISSION
    ===================================================== */

    await commissionRef.set({

        bookingId: bookingId,

        uid: receiverUid,

        customerUid: customerUid,

        level: level,

        percentage: Number(percentage),

        amount: commissionAmount,

        currency: "TSh",

        status: "Available",

        createdAt:
            firebase.firestore
                .FieldValue
                .serverTimestamp()
    });


    /* =====================================================
       NOTIFICATION
    ===================================================== */

    const notificationRef =
        db.collection("users")
          .doc(receiverUid)
          .collection("notifications")
          .doc();

    await notificationRef.set({

        title:
            "💰 Commission Mpya",

        message:
            "Umepokea commission ya Level " +
            level +
            " ya TSh " +
            formatMoney(commissionAmount) +
            " kutoka booking " +
            bookingId,

        type:
            "commission",

        bookingId:
            bookingId,

        level:
            level,

        amount:
            commissionAmount,

        read:
            false,

        createdAt:
            firebase.firestore
                .FieldValue
                .serverTimestamp()
    });


    console.log(
        "✅ User commission:",
        level,
        commissionAmount
    );
}


/* =========================================================
   43D. CREATE ADMIN COMMISSIONS
========================================================= */

async function createAdminCommissions(
    bookingId,
    customerUid,
    booking
) {

    const bookingAmount =
        Number(booking.roomPrice || 0);


    const adminLevels = [
        {
            level: "A",
            percentage:
                ROOMRENT_SETTINGS.commission.admin.A
        },
        {
            level: "B",
            percentage:
                ROOMRENT_SETTINGS.commission.admin.B
        },
        {
            level: "C",
            percentage:
                ROOMRENT_SETTINGS.commission.admin.C
        }
    ];


    for (const item of adminLevels) {

        const commissionId =
            bookingId +
            "_ADMIN_" +
            item.level;


        const commissionRef =
            db.collection("adminCommissions")
              .doc(commissionId);


        const existing =
            await commissionRef.get();


        if (existing.exists) {

            console.log(
                "ℹ️ Admin commission tayari ipo:",
                commissionId
            );

            continue;
        }


        const amount =
            Math.round(
                bookingAmount *
                Number(item.percentage) /
                100
            );


        await commissionRef.set({

            bookingId:
                bookingId,

            customerUid:
                customerUid,

            level:
                item.level,

            percentage:
                Number(item.percentage),

            amount:
                amount,

            currency:
                "TSh",

            status:
                "Available",

            createdAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp()
        });


        console.log(
            "✅ Admin commission:",
            item.level,
            amount
        );
    }
}


/* =========================================================
   44. ADMIN REJECT BOOKING
========================================================= */

async function adminRejectBooking(
    bookingId
) {

    const user =
        getCurrentUser();

    if (!user) {

        alert(
            "❌ Tafadhali ingia kwanza."
        );

        return;
    }

    if (
        (user.email || "").toLowerCase().trim()
        !== "harounhamad62@gmail.com"
    ) {

        alert(
            "❌ Huna ruhusa ya Admin."
        );

        return;
    }

    const thibitisha =
        confirm(
            "Unataka kukataa payment ya booking hii?"
        );

    if (!thibitisha) return;

    try {

        await db
            .collection("bookings")
            .doc(bookingId)
            .update({

                status:
                    "Rejected",

                paymentStatus:
                    "Rejected",

                commissionStatus:
                    "Rejected",

                referralCommissionStatus:
                    "Rejected",

                rejectedBy:
                    user.uid,

                rejectedAt:
                    firebase.firestore
                        .FieldValue
                        .serverTimestamp(),

                updatedAt:
                    firebase.firestore
                        .FieldValue
                        .serverTimestamp()
            });

        alert(
            "❌ Payment imekataliwa."
        );

        await pakiaAdminBookings();

    } catch (error) {

        console.error(
            "REJECT ERROR:",
            error
        );

        alert(
            "❌ Imeshindikana kukataa: "
            + error.message
        );
    }
}


/* =========================================================
   45. CLOSE ADMIN DASHBOARD
========================================================= */

function fungaAdminDashboard() {

    const dashboard =
        getElement(
            "adminDashboard"
        );

    if (!dashboard) return;

    dashboard.style.display =
        "none";
                           }/* =========================================================
   41. ADMIN DASHBOARD
========================================================= */

async function funguaAdminDashboard() {

    const user = getCurrentUser();

    if (!user) {
        alert("❌ Tafadhali ingia kwanza.");
        return;
    }

    const adminEmail =
        "harounhamad62@gmail.com";

    if (
        (user.email || "").toLowerCase().trim()
        !== adminEmail
    ) {
        alert("❌ Huna ruhusa ya Admin.");
        return;
    }

    let dashboard =
        getElement("adminDashboard");

    if (!dashboard) {

        dashboard =
            document.createElement("section");

        dashboard.id =
            "adminDashboard";

        dashboard.style.padding =
            "20px";

        dashboard.style.background =
            "#f5f5f5";

        document.querySelector("main")
            .appendChild(dashboard);
    }

    dashboard.style.display =
        "block";

    dashboard.innerHTML = `
        <div class="booking-card">

            <h2>🔐 RoomRent Admin</h2>

            <p>
                👤 Admin:
                <strong>${adminEmail}</strong>
            </p>

            <hr>

            <h3>📋 Bookings</h3>

            <div id="adminBookingsList">
                ⏳ Inapakia bookings...
            </div>

            <br>

            <button
                onclick="fungaAdminDashboard()"
                class="endeleaBtn">
                ❌ Funga Admin
            </button>

        </div>
    `;

    await pakiaAdminBookings();
}


/* =========================================================
   42. LOAD ADMIN BOOKINGS
========================================================= */

async function pakiaAdminBookings() {

    const container =
        getElement("adminBookingsList");

    if (!container) return;

    try {

        const snapshot =
            await db
                .collection("bookings")
                .orderBy(
                    "createdAt",
                    "desc"
                )
                .get();

        if (snapshot.empty) {

            container.innerHTML = `
                <p>
                    📭 Hakuna booking bado.
                </p>
            `;

            return;
        }

        let html = "";

        snapshot.forEach(doc => {

            const booking =
                doc.data();

            const status =
                booking.status ||
                "Waiting Confirmation";

            const paymentStatus =
                booking.paymentStatus ||
                "Waiting Confirmation";

            html += `

                <div
                    class="booking-card"
                    style="
                        background:white;
                        margin-bottom:15px;
                        padding:15px;
                        border-radius:10px;
                    "
                >

                    <h3>
                        🏠 Booking
                        ${booking.bookingNumber || doc.id}
                    </h3>

                    <p>
                        👤 <strong>Mteja:</strong>
                        ${booking.customerName || "-"}
                    </p>

                    <p>
                        📱 <strong>Simu:</strong>
                        ${booking.customerPhone || "-"}
                    </p>

                    <p>
                        🏠 <strong>Chumba:</strong>
                        ${booking.roomNumber || "-"}
                    </p>

                    <p>
                        💰 <strong>Kiasi:</strong>
                        TSh ${formatMoney(
                            booking.roomPrice || 0
                        )}
                    </p>

                    <p>
                        📲 <strong>Njia ya malipo:</strong>
                        ${booking.paymentMethod || "-"}
                    </p>

                    <p>
                        📞 <strong>Namba iliyotumika kulipia:</strong>
                        ${booking.paymentPhone || "Haijawekwa"}
                    </p>

                    <p>
                        💳 <strong>Payment Status:</strong>
                        ${paymentStatus}
                    </p>

                    <p>
                        📋 <strong>Booking Status:</strong>
                        ${status}
                    </p>

                    <hr>

                    ${
                        status ===
                        "Waiting Confirmation"
                        ?
                        `
                        <button
                            onclick="adminConfirmBooking('${doc.id}')"
                            style="margin:5px;"
                        >
                            ✅ Confirm Payment
                        </button>

                        <button
                            onclick="adminRejectBooking('${doc.id}')"
                            style="margin:5px;"
                        >
                            ❌ Reject Payment
                        </button>
                        `
                        :
                        `
                        <p>
                            ℹ️ Booking hii tayari
                            imefanyiwa uamuzi.
                        </p>
                        `
                    }

                </div>
            `;
        });

        container.innerHTML =
            html;

    } catch (error) {

        console.error(
            "ADMIN BOOKINGS ERROR:",
            error
        );

        container.innerHTML = `
            <p style="color:red;">
                ❌ Imeshindikana kupakia bookings.
                <br>
                ${error.message}
            </p>
        `;
    }
}
/* =========================================================
   43. ADMIN CONFIRM + COMMISSION PROCESSING
========================================================= */

async function adminConfirmBooking(bookingId) {

    const user = getCurrentUser();

    /* =====================================================
       1. HAKIKI ADMIN
    ===================================================== */

    if (!user) {
        alert("❌ Tafadhali ingia kwanza.");
        return;
    }

    const ADMIN_UID =
        "1kj3K591EHhHAOiSoxIp1xGve2x1";

    if (user.uid !== ADMIN_UID) {
        alert("❌ Huna ruhusa ya Admin.");
        return;
    }


    /* =====================================================
       2. CONFIRM
    ===================================================== */

    const thibitisha = confirm(
        "Unataka kuthibitisha payment ya booking hii?"
    );

    if (!thibitisha) {
        return;
    }


    try {

        /* =================================================
           3. PATA BOOKING
        ================================================= */

        const bookingRef =
            db.collection("bookings").doc(bookingId);

        const bookingSnap =
            await bookingRef.get();

        if (!bookingSnap.exists) {

            alert(
                "❌ Booking haikupatikana."
            );

            return;
        }

        const booking =
            bookingSnap.data();


        /* =================================================
           4. ZUIA BOOKING ILIYOKATALIWA
        ================================================= */

        if (booking.status === "Rejected") {

            alert(
                "❌ Booking hii tayari imekataliwa."
            );

            return;
        }


        /* =================================================
           5. KAMA PAYMENT IMETHIBITISHWA NA
              COMMISSION IMEKAMILIKA
        ================================================= */

        if (
            booking.status === "Confirmed" &&
            booking.paymentStatus === "Confirmed" &&
            booking.commissionStatus === "Completed"
        ) {

            alert(
                "⚠️ Booking hii tayari imethibitishwa " +
                "na commission zimekamilika."
            );

            return;
        }


        /* =================================================
           6. CONFIRM PAYMENT
        ================================================= */

        await bookingRef.update({

            status:
                "Confirmed",

            paymentStatus:
                "Confirmed",

            commissionStatus:
                "Processing",

            referralCommissionStatus:
                "Processing",

            confirmedBy:
                user.uid,

            confirmedAt:
                booking.confirmedAt ||
                firebase.firestore.FieldValue.serverTimestamp(),

            updatedAt:
                firebase.firestore.FieldValue.serverTimestamp()
        });


        /* =================================================
           7. CHAKATA COMMISSION
        ================================================= */

        const result =
            await tengenezaCommissionsKwaBooking(
                bookingId,
                booking
            );


        /* =================================================
           8. MALIZA PROCESSING
        ================================================= */

        await bookingRef.update({

            commissionStatus:
                "Completed",

            referralCommissionStatus:
                "Completed",

            userCommissionCount:
                result.userCommissionCount,

            adminCommissionCount:
                result.adminCommissionCount,

            commissionProcessedAt:
                firebase.firestore.FieldValue.serverTimestamp(),

            updatedAt:
                firebase.firestore.FieldValue.serverTimestamp()
        });


        /* =================================================
           9. UJUMBE
        ================================================= */

        alert(
            "✅ Payment imethibitishwa.\n\n" +
            "💰 User commissions: " +
            result.userCommissionCount + "\n" +
            "🔐 Admin commissions: " +
            result.adminCommissionCount
        );


        /* =================================================
           10. REFRESH ADMIN BOOKINGS
        ================================================= */

        await pakiaAdminBookings();


    } catch (error) {

        console.error(
            "ADMIN CONFIRM ERROR:",
            error
        );


        /* ================================================
           Payment inaweza kuwa Confirmed lakini commission
           ikashindwa. Tunaweka status Failed ili Admin
           aweze kujaribu tena.
        ================================================= */

        try {

            await db
                .collection("bookings")
                .doc(bookingId)
                .update({

                    commissionStatus:
                        "Failed",

                    referralCommissionStatus:
                        "Failed",

                    commissionError:
                        error.message || "Unknown error",

                    updatedAt:
                        firebase.firestore.FieldValue.serverTimestamp()
                });

        } catch (updateError) {

            console.error(
                "STATUS UPDATE ERROR:",
                updateError
            );
        }


        alert(
            "❌ Payment imekuwa Confirmed lakini " +
            "commission haijakamilika.\n\n" +
            error.message
        );
    }
}


/* =========================================================
   43B. REFERRAL COMMISSION ENGINE
========================================================= */

async function tengenezaCommissionsKwaBooking(
    bookingId,
    booking
) {

    const customerUid =
        booking.uid;

    if (!customerUid) {

        throw new Error(
            "Booking haina customer UID."
        );
    }


    /* =====================================================
       PATA CUSTOMER
    ===================================================== */

    const customerSnap =
        await db
            .collection("users")
            .doc(customerUid)
            .get();


    if (!customerSnap.exists) {

        throw new Error(
            "Customer account haikupatikana."
        );
    }


    const customer =
        customerSnap.data();


    /* =====================================================
       REFERRAL CODE YA CUSTOMER
    ===================================================== */

    let currentReferralCode =
        String(
            customer.referredBy || ""
        ).trim();


    let userCommissionCount = 0;

    let adminCommissionCount = 0;


    /* =====================================================
       LEVELS
    ===================================================== */

    const levels = [
        "A",
        "B",
        "C"
    ];


    const visitedUsers =
        new Set();

    visitedUsers.add(
        customerUid
    );


    /* =====================================================
       TRAVERSE REFERRAL CHAIN
       
       A = 5%
       B = 2%
       C = 1%

       Admin:
       A = 20%
       B = 10%
       C = 5%
    ===================================================== */

    for (
        let i = 0;
        i < levels.length;
        i++
    ) {

        const level =
            levels[i];


        if (!currentReferralCode) {
            break;
        }


        const normalizedCode =
            currentReferralCode
                .toUpperCase();


        /* =================================================
           ADMIN REFERRAL
           
           Kama RRADMIN ipo kwenye nafasi ya level hiyo,
           Admin anapata commission ya level hiyo.
        ================================================= */

        if (
            normalizedCode ===
            String(
                ROOMRENT_SETTINGS.adminReferralCode
            ).toUpperCase()
        ) {

            await createAdminReferralCommission(
                bookingId,
                customerUid,
                booking,
                level
            );

            adminCommissionCount++;

            console.log(
                "✅ Admin referral:",
                level
            );

            /* Admin ndiye mwisho wa chain */
            break;
        }


        /* =================================================
           TAFUTA USER KWA REFERRAL CODE
        ================================================= */

        const referrerQuery =
            await db
                .collection("users")
                .where(
                    "referralCode",
                    "==",
                    currentReferralCode
                )
                .limit(1)
                .get();


        if (referrerQuery.empty) {

            console.warn(
                "⚠️ Referral code haikupatikana:",
                currentReferralCode
            );

            break;
        }


        const referrerDoc =
            referrerQuery.docs[0];


        const referrerUid =
            referrerDoc.id;


        const referrerData =
            referrerDoc.data();


        /* =================================================
           ZUIA SELF REFERRAL / LOOP
        ================================================= */

        if (
            visitedUsers.has(
                referrerUid
            )
        ) {

            console.warn(
                "⚠️ Referral loop imegundulika."
            );

            break;
        }


        visitedUsers.add(
            referrerUid
        );


        /* =================================================
           USER COMMISSION
        ================================================= */

        await createCommissionIfNotExists(
            bookingId,
            customerUid,
            referrerUid,
            level,
            ROOMRENT_SETTINGS
                .commission
                .user[level],
            booking,
            currentReferralCode
        );


        userCommissionCount++;


        /* =================================================
           NENDA LEVEL INAYOFUATA
        ================================================= */

        currentReferralCode =
            String(
                referrerData.referredBy || ""
            ).trim();
    }


    console.log(
        "✅ Commission processing complete:",
        {
            bookingId,
            userCommissionCount,
            adminCommissionCount
        }
    );


    return {

        userCommissionCount:
            userCommissionCount,

        adminCommissionCount:
            adminCommissionCount
    };
}


/* =========================================================
   43C. CREATE USER COMMISSION
========================================================= */

async function createCommissionIfNotExists(
    bookingId,
    customerUid,
    receiverUid,
    level,
    percentage,
    booking,
    referralCode
) {

    if (!receiverUid) {
        return;
    }


    const commissionId =
        bookingId +
        "_USER_" +
        level;


    const commissionRef =
        db
            .collection("commissions")
            .doc(commissionId);


    const existing =
        await commissionRef.get();


    const bookingAmount =
        Number(
            booking.roomPrice || 0
        );


    const commissionAmount =
        Math.round(
            bookingAmount *
            Number(percentage) /
            100
        );


    /* =====================================================
       COMMISSION
    ===================================================== */

    if (!existing.exists) {

        await commissionRef.set({

            bookingId:
                bookingId,

            uid:
                receiverUid,

            customerUid:
                customerUid,

            level:
                level,

            percentage:
                Number(percentage),

            amount:
                commissionAmount,

            currency:
                "TSh",

            status:
                "Available",

            referralCode:
                referralCode || "",

            createdAt:
                firebase.firestore.FieldValue
                    .serverTimestamp()
        });


        console.log(
            "✅ User commission created:",
            commissionId
        );
    }


    /* =====================================================
       NOTIFICATION
       
       Tunatumia ID ile ile ya commission ili
       notification isijirudie.
    ===================================================== */

    const notificationRef =
        db
            .collection("users")
            .doc(receiverUid)
            .collection("notifications")
            .doc(commissionId);


    const notificationSnap =
        await notificationRef.get();


    if (!notificationSnap.exists) {

        await notificationRef.set({

            title:
                "💰 Commission Mpya",

            message:
                "Umepokea commission ya Level " +
                level +
                " ya TSh " +
                formatMoney(
                    commissionAmount
                ) +
                " kutoka booking " +
                bookingId,

            type:
                "commission",

            bookingId:
                bookingId,

            level:
                level,

            amount:
                commissionAmount,

            read:
                false,

            createdAt:
                firebase.firestore.FieldValue
                    .serverTimestamp()
        });


        console.log(
            "🔔 Notification ya commission imetumwa."
        );
    }
}


/* =========================================================
   43D. CREATE ADMIN COMMISSION
========================================================= */

async function createAdminReferralCommission(
    bookingId,
    customerUid,
    booking,
    level
) {

    const ADMIN_UID =
        "1kj3K591EHhHAOiSoxIp1xGve2x1";


    const percentage =
        Number(
            ROOMRENT_SETTINGS
                .commission
                .admin[level]
        );


    if (!percentage) {
        return;
    }


    const bookingAmount =
        Number(
            booking.roomPrice || 0
        );


    const amount =
        Math.round(
            bookingAmount *
            percentage /
            100
        );


    const commissionId =
        bookingId +
        "_ADMIN_" +
        level;


    const commissionRef =
        db
            .collection("adminCommissions")
            .doc(commissionId);


    const existing =
        await commissionRef.get();


    /* =====================================================
       ZUIA DUPLICATE
    ===================================================== */

    if (existing.exists) {

        console.log(
            "ℹ️ Admin commission tayari ipo:",
            commissionId
        );

        return;
    }


    /* =====================================================
       SAVE
    ===================================================== */

    await commissionRef.set({

        bookingId:
            bookingId,

        uid:
            ADMIN_UID,

        customerUid:
            customerUid,

        level:
            level,

        percentage:
            percentage,

        amount:
            amount,

        currency:
            "TSh",

        status:
            "Available",

        createdAt:
            firebase.firestore.FieldValue
                .serverTimestamp()
    });


    console.log(
        "✅ Admin commission created:",
        commissionId
    );
}

/* =========================================================
   ROOMRENT - MAIN WALLET & WITHDRAWAL
========================================================= */

let walletListener = null;

/* ---------------------------------------------------------
   1. GET / CREATE USER WALLET
--------------------------------------------------------- */

async function ensureUserWallet(uid) {
    if (!uid) return null;

    const walletRef = db.collection("wallets").doc(uid);
    const walletSnap = await walletRef.get();

    if (!walletSnap.exists) {
        const walletData = {
            uid: uid,
            balance: 0,
            totalEarned: 0,
            totalWithdrawn: 0,
            pendingWithdrawal: 0,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        await walletRef.set(walletData);

        return walletData;
    }

    return walletSnap.data();
}


/* ---------------------------------------------------------
   2. LISTEN TO MAIN WALLET
--------------------------------------------------------- */

function sikilizaMainWallet() {

    if (!currentUser) {
        console.log("Hakuna user aliyeingia.");
        return;
    }

    if (walletListener) {
        walletListener();
        walletListener = null;
    }

    const walletRef = db.collection("wallets").doc(currentUser.uid);

    walletListener = walletRef.onSnapshot(
        async (doc) => {

            if (!doc.exists) {
                await ensureUserWallet(currentUser.uid);
                return;
            }

            const wallet = doc.data();

            const balance = Number(wallet.balance || 0);
            const totalEarned = Number(wallet.totalEarned || 0);
            const totalWithdrawn = Number(wallet.totalWithdrawn || 0);
            const pendingWithdrawal =
                Number(wallet.pendingWithdrawal || 0);

            onyeshaWallet(
                balance,
                totalEarned,
                totalWithdrawn,
                pendingWithdrawal
            );
        },

        (error) => {
            console.error(
                "Wallet listener error:",
                error
            );
        }
    );
}


/* ---------------------------------------------------------
   3. DISPLAY WALLET
--------------------------------------------------------- */

function onyeshaWallet(
    balance,
    totalEarned,
    totalWithdrawn,
    pendingWithdrawal
) {

    const walletContainer =
        document.getElementById("mainWallet");

    if (!walletContainer) return;

    walletContainer.innerHTML = `

        <div class="wallet-card">

            <h2>💰 Salio Kuu</h2>

            <div class="wallet-balance">
                TSh ${formatMoney(balance)}
            </div>

            <p>
                Salio lako kuu la RoomRent
            </p>

            <div class="wallet-stats">

                <div>
                    <strong>
                        TSh ${formatMoney(totalEarned)}
                    </strong>
                    <span>
                        Jumla Iliyopatikana
                    </span>
                </div>

                <div>
                    <strong>
                        TSh ${formatMoney(totalWithdrawn)}
                    </strong>
                    <span>
                        Jumla Iliyotolewa
                    </span>
                </div>

                <div>
                    <strong>
                        TSh ${formatMoney(pendingWithdrawal)}
                    </strong>
                    <span>
                        Withdrawal Pending
                    </span>
                </div>

            </div>

            <button
                type="button"
                onclick="funguaWithdrawal()"
            >
                💸 Toa Pesa
            </button>

        </div>
    `;
}


/* ---------------------------------------------------------
   4. MONEY FORMAT
--------------------------------------------------------- */

function formatMoney(amount) {

    return Number(amount || 0).toLocaleString(
        "en-US"
    );
}


/* ---------------------------------------------------------
   5. OPEN WITHDRAWAL
--------------------------------------------------------- */

function funguaWithdrawal() {

    const container =
        document.getElementById("withdrawalSection");

    if (!container) {
        console.error(
            "withdrawalSection haipo kwenye HTML."
        );
        return;
    }

    container.style.display = "block";

    container.innerHTML = `

        <div class="withdrawal-card">

            <h2>💸 Toa Pesa</h2>

            <p>
                Tumia Salio Kuu lako kuomba malipo.
            </p>

            <label>
                Njia ya Malipo
            </label>

            <select id="withdrawalMethod">

                <option value="">
                    Chagua njia
                </option>

                <option value="AIRTEL_MONEY">
                    Airtel Money
                </option>

                <option value="MIXX_BY_YAS">
                    Mixx by Yas
                </option>

            </select>

            <label>
                Namba ya Simu
            </label>

            <input
                type="tel"
                id="withdrawalPhone"
                placeholder="Mfano: 067xxxxxxx"
            >

            <label>
                Kiasi
            </label>

            <input
                type="number"
                id="withdrawalAmount"
                placeholder="Mfano: 3000"
                min="3000"
            >

            <button
                type="button"
                onclick="tumaWithdrawal()"
            >
                Tuma Ombi
            </button>

            <button
                type="button"
                onclick="fungaWithdrawal()"
            >
                Funga
            </button>

            <p id="withdrawalMessage"></p>

        </div>
    `;
}


/* ---------------------------------------------------------
   6. CLOSE WITHDRAWAL
--------------------------------------------------------- */

function fungaWithdrawal() {

    const container =
        document.getElementById("withdrawalSection");

    if (container) {
        container.style.display = "none";
        container.innerHTML = "";
    }
}


/* ---------------------------------------------------------
   7. SEND WITHDRAWAL REQUEST
--------------------------------------------------------- */

async function tumaWithdrawal() {

    if (!currentUser) {
        alert(
            "Tafadhali ingia kwenye akaunti kwanza."
        );
        return;
    }

    const method =
        document.getElementById(
            "withdrawalMethod"
        ).value;

    const phone =
        document.getElementById(
            "withdrawalPhone"
        ).value.trim();

    const amount =
        Number(
            document.getElementById(
                "withdrawalAmount"
            ).value
        );

    const message =
        document.getElementById(
            "withdrawalMessage"
        );

    if (!method) {
        message.textContent =
            "❌ Chagua njia ya malipo.";
        return;
    }

    if (!phone) {
        message.textContent =
            "❌ Weka namba ya simu.";
        return;
    }

    if (!amount || amount < 3000) {
        message.textContent =
            "❌ Kiasi cha chini ni TSh 3,000.";
        return;
    }

    try {

        message.textContent =
            "⏳ Inatuma ombi...";

        const walletRef =
            db.collection("wallets")
              .doc(currentUser.uid);

        const withdrawalRef =
            db.collection("withdrawals")
              .doc();

        await db.runTransaction(
            async (transaction) => {

                const walletSnap =
                    await transaction.get(
                        walletRef
                    );

                if (!walletSnap.exists) {
                    throw new Error(
                        "Wallet haijapatikana."
                    );
                }

                const wallet =
                    walletSnap.data();

                const balance =
                    Number(
                        wallet.balance || 0
                    );

                if (amount > balance) {
                    throw new Error(
                        "INSUFFICIENT_BALANCE"
                    );
                }

                transaction.update(
                    walletRef,
                    {
                        balance:
                            balance - amount,

                        pendingWithdrawal:
                            Number(
                                wallet.pendingWithdrawal || 0
                            ) + amount,

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
                            currentUser.uid,

                        name:
                            currentUserData?.name || "",

                        email:
                            currentUser.email || "",

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

        message.textContent =
            "✅ Ombi lako limetumwa kwa admin.";

        document.getElementById(
            "withdrawalPhone"
        ).value = "";

        document.getElementById(
            "withdrawalAmount"
        ).value = "";

    } catch (error) {

        console.error(
            "Withdrawal error:",
            error
        );

        if (
            error.message ===
            "INSUFFICIENT_BALANCE"
        ) {

            message.textContent =
                "❌ Salio lako halitoshi.";
        } else {

            message.textContent =
                "❌ Imeshindikana kutuma ombi. Jaribu tena.";
        }
    }
}


/* ---------------------------------------------------------
   8. START WALLET AFTER LOGIN
--------------------------------------------------------- */

async function anzishaWallet() {

    if (!currentUser) return;

    try {

        await ensureUserWallet(
            currentUser.uid
        );

        sikilizaMainWallet();

    } catch (error) {

        console.error(
            "Wallet initialization error:",
            error
        );
    }
}


/* ---------------------------------------------------------
   9. STOP WALLET AFTER LOGOUT
--------------------------------------------------------- */

function simamishaWallet() {

    if (walletListener) {
        walletListener();
        walletListener = null;
    }
                            }

/* =========================================================
   AUTO START MAIN WALLET
========================================================= */

if (auth) {

    auth.onAuthStateChanged(async function(user) {

        if (user) {

            try {

                await anzishaMainWallet();

                console.log(
                    "✅ Main Wallet imeanzishwa."
                );

            } catch (error) {

                console.error(
                    "❌ Imeshindikana kuanzisha Main Wallet:",
                    error
                );

            }

        } else {

            simamishaMainWallet();

            const wallet =
                getElement("mainWallet");

            if (wallet) {

                wallet.style.display =
                    "none";

                wallet.innerHTML = "";

            }

        }

    });

               }/* =========================================================
   AUTO START MAIN WALLET
========================================================= */

if (auth) {

    auth.onAuthStateChanged(async function(user) {

        if (user) {

            try {

                await anzishaMainWallet();

                console.log(
                    "✅ Main Wallet imeanzishwa."
                );

            } catch (error) {

                console.error(
                    "❌ Imeshindikana kuanzisha Main Wallet:",
                    error
                );

            }

        } else {

            simamishaMainWallet();

            const wallet =
                getElement("mainWallet");

            if (wallet) {

                wallet.style.display =
                    "none";

                wallet.innerHTML = "";

            }

        }

    });

}

