/* =========================================================
   ROOMRENT - SCRIPT NZIMA
   SEHEMU YA 1 + SEHEMU YA 2
   =========================================================

   MFUMO:
   - Firebase
   - Firebase Auth
   - Firestore
   - Room Data
   - Navigation
   - Sign Up
   - Sign In
   - Sign Out

   MUHIMU:
   - Hakuna localStorage
   - Hakuna payment demo
   ========================================================= */


/* =========================================================
   1. KUHAKIKI FIREBASE
========================================================= */

if (typeof firebase === "undefined") {

    alert(
        "❌ Firebase haijapakiwa. Tafadhali hakikisha Firebase SDK ipo kwenye HTML."
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
        days: 40
    },

    {
        roomNumber: "0024",
        price: 70000,
        profitPerDay: 2333,
        days: 40
    },

    {
        roomNumber: "0025",
        price: 140000,
        profitPerDay: 4666,
        days: 40
    },

    {
        roomNumber: "0026",
        price: 210000,
        profitPerDay: 6993,
        days: 40
    },

    {
        roomNumber: "0027",
        price: 280000,
        profitPerDay: 9324,
        days: 40
    },

    {
        roomNumber: "0028",
        price: 350000,
        profitPerDay: 11655,
        days: 40
    },

    {
        roomNumber: "0029",
        price: 420000,
        profitPerDay: 13986,
        days: 40
    },

    {
        roomNumber: "0030",
        price: 490000,
        profitPerDay: 16317,
        days: 40
    },

    {
        roomNumber: "0031",
        price: 560000,
        profitPerDay: 18648,
        days: 40
    },

    {
        roomNumber: "0032",
        price: 630000,
        profitPerDay: 20979,
        days: 40
    }

];


/* =========================================================
   5. HELPER - MONEY
========================================================= */

function formatMoney(amount) {

    const number = Number(amount) || 0;

    return number.toLocaleString("en-TZ");

}


/* =========================================================
   6. HELPER - GET ELEMENT
========================================================= */

function getElement(id) {

    return document.getElementById(id);

}


/* =========================================================
   7. SHOW SECTION
========================================================= */

function showSection(id) {

    const section =
        getElement(id);

    if (!section) {

        console.warn(
            "Section haijapatikana:",
            id
        );

        return;

    }

    section.style.display = "block";

}


/* =========================================================
   8. HIDE SECTION
========================================================= */

function hideSection(id) {

    const section =
        getElement(id);

    if (!section) {

        return;

    }

    section.style.display = "none";

}


/* =========================================================
   9. FICHA SECTIONS KUBWA
========================================================= */

function hideMainSections() {

    hideSection("vyumba");

    hideSection("fomuKodi");

    hideSection("taarifaSection");

}


/* =========================================================
   10. ONYESHA VYUMBA
========================================================= */

function onyeshaVyumba() {

    const container =
        getElement("vyumba");


    if (!container) {

        console.error(
            "❌ Element #vyumba haijapatikana."
        );

        return;

    }


    hideSection("fomuKodi");

    hideSection("taarifaSection");


    container.style.display = "block";


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
                room.days;


            const card =
                document.createElement("div");


            card.className =
                "booking-card";


            card.innerHTML = `

                <h3>
                    🏠 Chumba ${room.roomNumber}
                </h3>

                <p>
                    💰 Bei:
                    <strong>
                        ${formatMoney(room.price)} TSh
                    </strong>
                </p>

                <p>
                    📈 Faida kwa siku:
                    <strong>
                        ${formatMoney(room.profitPerDay)} TSh
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
                        ${formatMoney(totalProfit)} TSh
                    </strong>
                </p>

                <button
                    class="endeleaBtn"
                    onclick="funguaFomuKodi('${room.roomNumber}')"
                >
                    🏠 Kodi Chumba
                </button>

            `;


            container.appendChild(card);

        }
    );


    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}


/* =========================================================
   11. FOMU YA KODI
========================================================= */

function funguaFomuKodi(roomNumber) {

    const room =
        ROOMRENT_ROOMS.find(
            function(item) {

                return item.roomNumber === roomNumber;

            }
        );


    if (!room) {

        alert(
            "❌ Chumba hakijapatikana."
        );

        return;

    }


    hideSection("vyumba");

    hideSection("taarifaSection");


    const form =
        getElement("fomuKodi");


    if (!form) {

        console.error(
            "❌ #fomuKodi haijapatikana."
        );

        return;

    }


    form.style.display = "block";


    form.innerHTML = `

        <div class="booking-card">

            <h2>
                🏠 Kodi Chumba ${room.roomNumber}
            </h2>

            <p>
                💰 Bei:
                <strong>
                    ${formatMoney(room.price)} TSh
                </strong>
            </p>

            <p>
                📅 Muda:
                <strong>
                    ${room.days} siku
                </strong>
            </p>

            <hr>

            <p>
                Mfumo wa booking utaunganishwa
                katika sehemu inayofuata.
            </p>

            <button
                class="endeleaBtn"
                onclick="onyeshaVyumba()"
            >
                ← Rudi Vyumba
            </button>

        </div>

    `;


    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}


/* =========================================================
   12. BOOKING ZANGU
========================================================= */

function funguaBookingZangu() {

    hideSection("vyumba");

    hideSection("fomuKodi");


    const section =
        getElement("taarifaSection");


    if (!section) {

        return;

    }


    section.style.display =
        "block";


    section.innerHTML = `

        <div class="booking-card">

            <h2>
                📋 Booking Zangu
            </h2>

            <p>
                Mfumo wa Booking Zangu
                utaunganishwa katika sehemu
                inayofuata.
            </p>

        </div>

    `;


    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}


/* =========================================================
   13. ACCOUNT
========================================================= */

function funguaAccount() {

    hideSection("vyumba");

    hideSection("fomuKodi");


    const section =
        getElement("taarifaSection");


    if (!section) {

        return;

    }


    section.style.display =
        "block";


    section.innerHTML = `

        <div class="booking-card">

            <h2>
                👤 Account
            </h2>

            <p>
                Mfumo wa Account utaunganishwa
                katika sehemu inayofuata.
            </p>

        </div>

    `;


    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}


/* =========================================================
   14. TAARIFA
========================================================= */

function funguaTaarifa() {

    hideSection("vyumba");

    hideSection("fomuKodi");


    const section =
        getElement("taarifaSection");


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
                Huna taarifa mpya kwa sasa.
            </p>

        </div>

    `;


    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}


/* =========================================================
   15. WITHDRAWAL
========================================================= */

function funguaWithdrawal() {

    hideSection("vyumba");

    hideSection("fomuKodi");


    const section =
        getElement("taarifaSection");


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
                katika sehemu inayofuata.
            </p>

        </div>

    `;


    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}


/* =========================================================
   16. ADMIN LOGIN - OPEN
========================================================= */

function funguaAdmin() {

    const modal =
        getElement("adminLoginModal");


    if (!modal) {

        return;

    }


    modal.style.display =
        "flex";

}


/* =========================================================
   17. ADMIN LOGIN - CLOSE
========================================================= */

function fungaAdminLogin() {

    const modal =
        getElement("adminLoginModal");


    if (!modal) {

        return;

    }


    modal.style.display =
        "none";

}


/* =========================================================
   18. FIREBASE AUTH
========================================================= */


/* =========================================================
   18.1 LOGIN MESSAGE
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


    if (type === "success") {

        box.style.color =
            "green";

    } else {

        box.style.color =
            "red";

    }

}


/* =========================================================
   18.2 SAFISHA EMAIL
========================================================= */

function safishaEmail(email) {

    return String(email || "")
        .trim()
        .toLowerCase();

}


/* =========================================================
   18.3 JISAJILI
========================================================= */

async function jisajiliRoomRent() {

    const emailInput =
        getElement("loginEmail");


    const passwordInput =
        getElement("loginPassword");


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
            await auth.createUserWithEmailAndPassword(
                email,
                password
            );


        const user =
            credential.user;


        if (!user) {

            throw new Error(
                "User hakupatikana baada ya registration."
            );

        }


        if (db) {

            await db
                .collection("users")
                .doc(user.uid)
                .set({

                    uid: user.uid,

                    email: user.email,

                    referralCode: "",

                    referredBy: "",

                    totalCommission: 0,

                    totalBookings: 0,

                    createdAt:
                        firebase.firestore.FieldValue.serverTimestamp(),

                    updatedAt:
                        firebase.firestore.FieldValue.serverTimestamp()

                }, {

                    merge: true

                });

        }


        onyeshaLoginMessage(
            "✅ Account yako imetengenezwa kikamilifu!",
            "success"
        );


        alert(
            "🎉 Karibu RoomRent!\n\nAccount yako imetengenezwa."
        );


        passwordInput.value = "";


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

        }

        else if (
            error.code ===
            "auth/invalid-email"
        ) {

            message =
                "❌ Email uliyoweka si sahihi.";

        }

        else if (
            error.code ===
            "auth/weak-password"
        ) {

            message =
                "❌ Password ni dhaifu. Tumia angalau herufi/namba 6.";

        }

        else if (
            error.code ===
            "auth/operation-not-allowed"
        ) {

            message =
                "❌ Email/Password Login haijawezeshwa Firebase Console.";

        }

        else if (error.message) {

            message =
                "❌ " + error.message;

        }


        onyeshaLoginMessage(
            message
        );

    }

}


/* =========================================================
   18.4 INGIA
========================================================= */

async function ingiaRoomRent() {

    const emailInput =
        getElement("loginEmail");


    const passwordInput =
        getElement("loginPassword");


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
            await auth.signInWithEmailAndPassword(
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

                    uid: user.uid,

                    email: user.email,

                    updatedAt:
                        firebase.firestore.FieldValue.serverTimestamp()

                }, {

                    merge: true

                });

        }


        onyeshaLoginMessage(
            "✅ Umeingia RoomRent kikamilifu!",
            "success"
        );


        alert(
            "👋 Karibu tena RoomRent!"
        );


        passwordInput.value = "";


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

        }

        else if (
            error.code ===
            "auth/wrong-password"
        ) {

            message =
                "❌ Password si sahihi.";

        }

        else if (
            error.code ===
            "auth/invalid-credential"
        ) {

            message =
                "❌ Email au Password si sahihi.";

        }

        else if (
            error.code ===
            "auth/invalid-email"
        ) {

            message =
                "❌ Email uliyoweka si sahihi.";

        }

        else if (error.message) {

            message =
                "❌ " + error.message;

        }


        onyeshaLoginMessage(
            message
        );

    }

}


/* =========================================================
   18.5 LOGOUT
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
   18.6 AUTH STATE
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

                                uid: user.uid,

                                email: user.email,

                                lastLogin:
                                    firebase.firestore.FieldValue.serverTimestamp(),

                                updatedAt:
                                    firebase.firestore.FieldValue.serverTimestamp()

                            }, {

                                merge: true

                            });

                    } catch (error) {

                        console.error(
                            "❌ User Firestore update error:",
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
   19. BUTTON EVENTS
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        console.log(
            "🚀 RoomRent DOM imekamilika."
        );


        const angaliaVyumba =
            getElement("angaliaVyumba");


        const bookingZangu =
            getElement("bookingZangu");


        const accountBtn =
            getElement("accountBtn");


        const taarifaBtn =
            getElement("taarifaBtn");


        const withdrawalBtn =
            getElement("withdrawalBtn");


        const signInBtn =
            getElement("signInBtn");


        const signUpBtn =
            getElement("signUpBtn");


        if (angaliaVyumba) {

            angaliaVyumba.addEventListener(
                "click",
                onyeshaVyumba
            );

        }


        if (bookingZangu) {

            bookingZangu.addEventListener(
                "click",
                funguaBookingZangu
            );

        }


        if (accountBtn) {

            accountBtn.addEventListener(
                "click",
                funguaAccount
            );

        }


        if (taarifaBtn) {

            taarifaBtn.addEventListener(
                "click",
                funguaTaarifa
            );

        }


        if (withdrawalBtn) {

            withdrawalBtn.addEventListener(
                "click",
                funguaWithdrawal
            );

        }


        if (signInBtn) {

            signInBtn.addEventListener(
                "click",
                ingiaRoomRent
            );

        }


        if (signUpBtn) {

            signUpBtn.addEventListener(
                "click",
                jisajiliRoomRent
            );

        }


        console.log(
            "✅ RoomRent buttons zote zimeunganishwa."
        );

    }
);


/* =========================================================
   20. MWISHO
========================================================= */

console.log(
    "🔥 ROOMRENT SCRIPT IMELOADED."
);
/* =========================================================
   ROOMRENT - SEHEMU YA 3
   ACCOUNT + REFERRAL SYSTEM
   =========================================================

   MFUMO:
   - Account ya mtumiaji
   - Referral code ya kipekee
   - Referral link
   - Referral A / B / C
   - User Commission:
       A = 5%
       B = 2%
       C = 1%
   - Admin Referral:
       RRADMIN
   - Admin Commission:
       A = 20%
       B = 10%
       C = 5%
   - FIRESTORE ONLY
========================================================= */


/* =========================================================
   3.1 - HELPER: PATA USER WA SASA
========================================================= */

function getCurrentUser() {

    if (!auth) {
        return null;
    }

    return auth.currentUser || null;
}


/* =========================================================
   3.2 - GENERATE REFERRAL CODE
========================================================= */

function generateReferralCode(email) {

    let prefix = "RR";

    if (email) {

        const emailName =
            email.split("@")[0]
                .replace(/[^a-zA-Z0-9]/g, "")
                .substring(0, 5)
                .toUpperCase();

        if (emailName.length >= 2) {
            prefix = "RR" + emailName;
        }
    }


    const randomPart =
        Math.random()
            .toString(36)
            .substring(2, 6)
            .toUpperCase();


    return prefix + randomPart;
}


/* =========================================================
   3.3 - CHECK REFERRAL CODE
========================================================= */

async function tafutaReferralCode(code) {

    if (!db || !code) {
        return null;
    }


    const cleanCode =
        code.trim().toUpperCase();


    /* ADMIN REFERRAL */

    if (
        cleanCode ===
        ROOMRENT_SETTINGS.adminReferralCode
    ) {

        return {
            type: "admin",
            referralCode: cleanCode
        };
    }


    try {

        const snapshot =
            await db
                .collection("users")
                .where(
                    "referralCode",
                    "==",
                    cleanCode
                )
                .limit(1)
                .get();


        if (snapshot.empty) {
            return null;
        }


        const doc =
            snapshot.docs[0];


        return {
            type: "user",
            uid: doc.id,
            data: doc.data()
        };

    } catch (error) {

        console.error(
            "Hitilafu kutafuta referral:",
            error
        );

        return null;
    }
}


/* =========================================================
   3.4 - GET REFERRAL CODE FROM URL
========================================================= */

function pataReferralKutokaURL() {

    try {

        const url =
            new URL(window.location.href);


        const code =
            url.searchParams.get("ref");


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
   3.5 - CREATE UNIQUE REFERRAL CODE
========================================================= */

async function tengenezaReferralCodeUnique(email) {

    if (!db) {
        throw new Error(
            "Firestore haijaunganishwa."
        );
    }


    for (let attempt = 0; attempt < 10; attempt++) {

        const code =
            generateReferralCode(email);


        const existing =
            await db
                .collection("users")
                .where(
                    "referralCode",
                    "==",
                    code
                )
                .limit(1)
                .get();


        if (existing.empty) {

            return code;
        }
    }


    throw new Error(
        "Imeshindikana kutengeneza referral code ya kipekee."
    );
}


/* =========================================================
   3.6 - GET REFERRAL LINK
========================================================= */

function pataReferralLink(code) {

    if (!code) {
        return "";
    }


    try {

        const url =
            new URL(
                window.location.origin +
                window.location.pathname
            );


        url.searchParams.set(
            "ref",
            code
        );


        return url.toString();

    } catch (error) {

        return (
            window.location.href.split("?")[0] +
            "?ref=" +
            encodeURIComponent(code)
        );
    }
}


/* =========================================================
   3.7 - SAVE REFERRAL INFORMATION
========================================================= */

async function hifadhiReferralMpya(uid) {

    if (!db || !uid) {
        return null;
    }


    const userRef =
        db
            .collection("users")
            .doc(uid);


    const userSnap =
        await userRef.get();


    if (!userSnap.exists) {
        return null;
    }


    const userData =
        userSnap.data();


    /* Kama tayari ana referral */
    if (userData.referredBy) {

        return userData.referredBy;
    }


    const urlReferral =
        pataReferralKutokaURL();


    if (!urlReferral) {

        return "";
    }


    const referral =
        await tafutaReferralCode(
            urlReferral
        );


    if (!referral) {

        console.log(
            "Referral code haikupatikana:",
            urlReferral
        );

        return "";
    }


    /* Zuia kutumia referral yake mwenyewe */

    if (
        userData.referralCode &&
        userData.referralCode === urlReferral
    ) {

        return "";
    }


    await userRef.set(
        {
            referredBy: urlReferral,
            referralType: referral.type,
            updatedAt:
                firebase.firestore.FieldValue
                    .serverTimestamp()
        },
        {
            merge: true
        }
    );


    return urlReferral;
}


/* =========================================================
   3.8 - HAKIKISHA USER ANA REFERRAL CODE
========================================================= */

async function hakikishaReferralCodeYaUser() {

    const user =
        getCurrentUser();


    if (!user || !db) {
        return null;
    }


    const userRef =
        db
            .collection("users")
            .doc(user.uid);


    const userSnap =
        await userRef.get();


    if (!userSnap.exists) {
        return null;
    }


    const userData =
        userSnap.data();


    /* Kama tayari ipo */

    if (userData.referralCode) {

        return userData.referralCode;
    }


    /* Tengeneza mpya */

    const newCode =
        await tengenezaReferralCodeUnique(
            user.email
        );


    await userRef.set(
        {
            referralCode: newCode,

            referralLink:
                pataReferralLink(newCode),

            updatedAt:
                firebase.firestore.FieldValue
                    .serverTimestamp()
        },
        {
            merge: true
        }
    );


    return newCode;
}


/* =========================================================
   3.9 - ACCOUNT DATA
========================================================= */

async function pataAccountData() {

    const user =
        getCurrentUser();


    if (!user || !db) {
        return null;
    }


    const userRef =
        db
            .collection("users")
            .doc(user.uid);


    const snapshot =
        await userRef.get();


    if (!snapshot.exists) {

        return {
            uid: user.uid,
            email: user.email || "",
            referralCode: "",
            referralLink: "",
            referredBy: "",
            totalCommission: 0,
            totalBookings: 0
        };
    }


    return {
        uid: user.uid,
        ...snapshot.data()
    };
}


/* =========================================================
   3.10 - DISPLAY ACCOUNT
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
        document.getElementById(
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
                👤 Account Yangu
            </h2>

            <p>
                <strong>Email:</strong><br>
                ${escapeHTML(user.email || "")}
            </p>

            <p>
                <strong>UID:</strong><br>
                <small>
                    ${escapeHTML(user.uid)}
                </small>
            </p>

            <hr>

            <div id="accountReferralArea">

                <p>
                    ⏳ Inapakia taarifa za referral...
                </p>

            </div>

            <hr>

            <div id="accountCommissionArea">

                <p>
                    💰 Commission:
                    <strong>
                        TSh 0
                    </strong>
                </p>

            </div>

            <button
                class="endeleaBtn"
                id="logoutAccountBtn"
            >
                🚪 Toka kwenye Account
            </button>

        </div>
    `;


    await onyeshaReferralAccount();


    const logoutButton =
        document.getElementById(
            "logoutAccountBtn"
        );


    if (logoutButton) {

        logoutButton.onclick =
            tokaRoomRent;
    }
}


/* =========================================================
   3.11 - DISPLAY REFERRAL ACCOUNT
========================================================= */

async function onyeshaReferralAccount() {

    const area =
        document.getElementById(
            "accountReferralArea"
        );


    if (!area) {
        return;
    }


    try {

        const code =
            await hakikishaReferralCodeYaUser();


        const data =
            await pataAccountData();


        if (!data) {

            area.innerHTML = `
                <p>
                    ⚠️ Taarifa za account hazikupatikana.
                </p>
            `;

            return;
        }


        const referralCode =
            code ||
            data.referralCode ||
            "";


        const referralLink =
            data.referralLink ||
            pataReferralLink(
                referralCode
            );


        area.innerHTML = `

            <h3>
                🔗 Referral Yangu
            </h3>

            <p>
                Kila mteja ana referral code yake.
            </p>

            <label>
                <strong>Referral Code</strong>
            </label>

            <input
                type="text"
                value="${escapeHTML(referralCode)}"
                readonly
                id="myReferralCode"
            >


            <label>
                <strong>Referral Link</strong>
            </label>

            <input
                type="text"
                value="${escapeHTML(referralLink)}"
                readonly
                id="myReferralLink"
            >


            <button
                class="thibitishaBtn"
                id="copyReferralBtn"
            >
                📋 Copy Referral Link
            </button>


            <p
                id="referralCopyMessage"
                style="text-align:center;"
            ></p>


            <hr>


            <h3>
                💰 Mfumo wa Commission
            </h3>


            <p>
                🥇 Level A:
                <strong>5%</strong>
            </p>

            <p>
                🥈 Level B:
                <strong>2%</strong>
            </p>

            <p>
                🥉 Level C:
                <strong>1%</strong>
            </p>

        `;


        const copyButton =
            document.getElementById(
                "copyReferralBtn"
            );


        if (copyButton) {

            copyButton.onclick =
                async function () {

                    await nakiliReferralLink(
                        referralLink
                    );
                };
        }


        const commissionArea =
            document.getElementById(
                "accountCommissionArea"
            );


        if (
            commissionArea &&
            data.totalCommission !== undefined
        ) {

            commissionArea.innerHTML = `

                <p>
                    💰 Commission Yako:
                </p>

                <h2>
                    TSh
                    ${formatMoney(
                        data.totalCommission || 0
                    )}
                </h2>

                <p>
                    📊 Bookings:
                    <strong>
                        ${data.totalBookings || 0}
                    </strong>
                </p>

            `;
        }

    } catch (error) {

        console.error(
            "Referral Account Error:",
            error
        );


        area.innerHTML = `

            <p style="color:red;">
                ❌ Imeshindikana kupakia referral.
            </p>

        `;
    }
}


/* =========================================================
   3.12 - COPY REFERRAL LINK
========================================================= */

async function nakiliReferralLink(link) {

    const message =
        document.getElementById(
            "referralCopyMessage"
        );


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

        /* Fallback kwa baadhi ya Android browsers */

        const input =
            document.getElementById(
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
                        "⚠️ Copy haikufanikiwa. Shikilia link uinakili.";
                }
            }
        }
    }
}


/* =========================================================
   3.13 - ESCAPE HTML
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
   3.14 - FORMAT MONEY
========================================================= */

function formatMoney(amount) {

    const number =
        Number(amount) || 0;


    return number.toLocaleString(
        "en-US"
    );
}


/* =========================================================
   3.15 - PREPARE REFERRAL AFTER LOGIN
========================================================= */

async function andaaReferralBaadaYaLogin() {

    const user =
        getCurrentUser();


    if (!user) {
        return;
    }


    try {

        /*
         * Hakikisha ana referral code yake
         */

        await hakikishaReferralCodeYaUser();


        /*
         * Hifadhi aliyemleta kama
         * referral link ilitumika
         */

        await hifadhiReferralMpya(
            user.uid
        );


    } catch (error) {

        console.error(
            "Referral initialization error:",
            error
        );
    }
}


/* =========================================================
   3.16 - ON AUTH STATE CHANGED
   UPDATE YA SEHEMU YA 2
========================================================= */

if (auth) {

    auth.onAuthStateChanged(
        async function(user) {

            if (!user) {
                return;
            }


            try {

                /*
                 * Hakikisha document ya user ipo
                 */

                if (db) {

                    await db
                        .collection("users")
                        .doc(user.uid)
                        .set(
                            {
                                uid: user.uid,

                                email:
                                    user.email || "",

                                updatedAt:
                                    firebase.firestore
                                        .FieldValue
                                        .serverTimestamp(),

                                lastLogin:
                                    firebase.firestore
                                        .FieldValue
                                        .serverTimestamp()
                            },
                            {
                                merge: true
                            }
                        );
                }


                /*
                 * Anzisha referral
                 */

                await andaaReferralBaadaYaLogin();


                console.log(
                    "RoomRent user:",
                    user.email
                );


            } catch (error) {

                console.error(
                    "Auth state error:",
                    error
                );
            }

        }
    );
}


/* =========================================================
   3.17 - REFERRAL URL CHECK
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        const referral =
            pataReferralKutokaURL();


        if (referral) {

            console.log(
                "Referral code imeonekana:",
                referral
            );
        }


        /*
         * Account button
         */

        const accountButton =
            document.getElementById(
                "accountBtn"
            );


        if (accountButton) {

            accountButton.onclick =
                funguaAccount;
        }

    }
);


/* =========================================================
   MWISHO WA SEHEMU YA 3
========================================================= */
