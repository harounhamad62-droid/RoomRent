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
   VERSION: CLEAN
========================================================= */


/* =========================================================
   3.1 - PATA USER ALIYEINGIA
========================================================= */

function getCurrentUser() {

    if (!auth) {
        return null;
    }

    return auth.currentUser || null;
}


/* =========================================================
   3.2 - PATA REFERRAL CODE KWENYE URL
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
   3.3 - GENERATE REFERRAL CODE
========================================================= */

function generateReferralCode(email) {

    let prefix = "RR";

    if (email) {

        const emailName =
            email
                .split("@")[0]
                .replace(/[^a-zA-Z0-9]/g, "")
                .substring(0, 5)
                .toUpperCase();

        if (emailName.length >= 2) {

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
   3.4 - GENERATE REFERRAL CODE
   BILA QUERY YA USERS
========================================================= */

async function tengenezaReferralCodeUnique(email) {

    /*
     * Tunatumia random code yenye nafasi kubwa sana
     * ya kuwa unique.
     *
     * Hii inazuia Account kushindwa kwa sababu ya
     * Firestore query.
     */

    return generateReferralCode(email);
}


/* =========================================================
   3.5 - TENGENEZA REFERRAL LINK
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
   3.6 - HAKIKISHA USER ANA REFERRAL CODE
========================================================= */

async function hakikishaReferralCodeYaUser() {

    const user =
        getCurrentUser();


    if (!user) {

        console.error(
            "Hakuna user aliyeingia."
        );

        return null;
    }


    if (!db) {

        console.error(
            "Firestore haijaunganishwa."
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


        /*
         * Kama document haipo
         */

        if (!userSnap.exists) {

            console.log(
                "User document haipo. Inatengenezwa..."
            );


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


            console.log(
                "User document mpya imetengenezwa."
            );


            return newCode;
        }


        /*
         * Kama document ipo
         */

        const userData =
            userSnap.data();


        /*
         * Kama referral code ipo tayari
         */

        if (
            userData.referralCode
        ) {

            /*
             * Kama link haipo,
             * itengeneze.
             */

            if (!userData.referralLink) {

                const link =
                    pataReferralLink(
                        userData.referralCode
                    );


                await userRef.set(
                    {
                        referralLink:
                            link,

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


            return userData.referralCode;
        }


        /*
         * Kama document ipo lakini
         * referralCode haipo
         */

        const newCode =
            await tengenezaReferralCodeUnique(
                user.email
            );


        const newLink =
            pataReferralLink(
                newCode
            );


        await userRef.set(
            {

                referralCode:
                    newCode,

                referralLink:
                    newLink,

                totalCommission:
                    userData.totalCommission || 0,

                totalBookings:
                    userData.totalBookings || 0,

                updatedAt:
                    firebase.firestore
                        .FieldValue
                        .serverTimestamp()

            },
            {
                merge: true
            }
        );


        console.log(
            "Referral code mpya:",
            newCode
        );


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
   3.7 - PATA ACCOUNT DATA
========================================================= */

async function pataAccountData() {

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

        const snapshot =
            await db
                .collection("users")
                .doc(user.uid)
                .get();


        /*
         * Kama user document haipo,
         * rudisha basic information.
         */

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
   3.8 - ESCAPE HTML
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
   3.9 - FORMAT MONEY
========================================================= */

function formatMoney(amount) {

    const number =
        Number(amount) || 0;


    return number.toLocaleString(
        "en-US"
    );
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

        console.error(
            "taarifaSection haipo HTML."
        );

        return;
    }


    /*
     * Onyesha section
     */

    section.style.display =
        "block";


    /*
     * Ficha vyumba
     */

    const vyumba =
        document.getElementById(
            "vyumba"
        );


    if (vyumba) {

        vyumba.style.display =
            "none";
    }


    /*
     * Onyesha loading
     */

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

        /*
         * Pata account
         */

        let data =
            await pataAccountData();


        /*
         * Hakikisha referral code ipo
         */

        let referralCode =
            await hakikishaReferralCodeYaUser();


        /*
         * Kama account haikupatikana
         */

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


        /*
         * Tumia code mpya kama
         * data ya zamani haina code.
         */

        if (!referralCode) {

            referralCode =
                data.referralCode || "";
        }


        const referralLink =
            data.referralLink ||
            (
                referralCode
                    ? pataReferralLink(
                        referralCode
                    )
                    : ""
            );


        /*
         * ACCOUNT UI
         */

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
                        referralCode
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


                <div>

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

                </div>


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


        /*
         * COPY BUTTON
         */

        const copyButton =
            document.getElementById(
                "copyReferralBtn"
            );


        if (copyButton) {

            copyButton.onclick =
                async function() {

                    await nakiliReferralLink(
                        referralLink
                    );

                };
        }


        /*
         * LOGOUT BUTTON
         */

        const logoutButton =
            document.getElementById(
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

                <p
                    style="color:red;"
                >
                    ❌ Imeshindikana kupakia
                    taarifa za Account.
                </p>

                <p>
                    Tafadhali jaribu tena.
                </p>

                <button
                    class="thibitishaBtn"
                    onclick="funguaAccount()"
                >
                    🔄 Jaribu Tena
                </button>

            </div>

        `;
    }
}


/* =========================================================
   3.11 - COPY REFERRAL LINK
========================================================= */

async function nakiliReferralLink(link) {

    const message =
        document.getElementById(
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

        /*
         * Fallback ya Android
         */

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
                        "⚠️ Shikilia Referral Link kisha Copy.";

                }
            }
        }
    }
}


/* =========================================================
   3.12 - HIFADHI REFERRAL YA MTUMIAJI MPYA
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


        /*
         * Kama tayari ana referredBy,
         * usibadilishe.
         */

        if (
            userData.referredBy
        ) {

            return userData.referredBy;
        }


        /*
         * Pata referral kutoka URL
         */

        const referralCode =
            pataReferralKutokaURL();


        if (!referralCode) {

            return "";
        }


        /*
         * Zuia RRADMIN hapa haitahitaji
         * user document.
         */

        if (
            referralCode ===
            ROOMRENT_SETTINGS
                .adminReferralCode
        ) {

            await userRef.set(
                {

                    referredBy:
                        referralCode,

                    referralType:
                        "admin",

                    updatedAt:
                        firebase.firestore
                            .FieldValue
                            .serverTimestamp()

                },
                {
                    merge: true
                }
            );


            return referralCode;
        }


        /*
         * Tafuta user mwenye code hiyo
         */

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

            console.log(
                "Referral code haipo:",
                referralCode
            );

            return "";
        }


        const referrer =
            snapshot.docs[0];


        /*
         * Zuia self-referral
         */

        if (
            referrer.id === uid
        ) {

            console.log(
                "Self referral imezuiwa."
            );

            return "";
        }


        /*
         * Hifadhi referral
         */

        await userRef.set(
            {

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

            },
            {
                merge: true
            }
        );


        console.log(
            "Referral imehifadhiwa:",
            referralCode
        );


        return referralCode;


    } catch (error) {

        console.error(
            "HIFADHI REFERRAL ERROR:",
            error
        );

        return "";
    }
}


/* =========================================================
   3.13 - ANDAA REFERRAL BAADA YA LOGIN
========================================================= */

async function andaaReferralBaadaYaLogin() {

    const user =
        getCurrentUser();


    if (!user) {
        return;
    }


    try {

        /*
         * Kwanza hakikisha user ana code yake
         */

        await hakikishaReferralCodeYaUser();


        /*
         * Kisha hifadhi aliyemleta
         */

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
   3.14 - ACCOUNT BUTTON
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        const accountButton =
            document.getElementById(
                "accountBtn"
            );


        if (accountButton) {

            /*
             * Ondoa event ya zamani
             * kama ipo.
             */

            accountButton.onclick =
                function() {

                    funguaAccount();

                };
        }

    }
);


/* =========================================================
   3.15 - MWISHO WA SEHEMU YA 3
========================================================= */

