/* =========================================================
   ROOMRENT
   SCRIPT MPYA - CLEAN + SECURE ARCHITECTURE
   SEHEMU YA 1
   =========================================================

   MFUMO:
   - Firebase Authentication
   - Firestore
   - Firebase Storage
   - Rooms
   - Booking
   - Manual Payment
   - Admin Confirmation
   - Referral
   - Wallet
   - Withdrawal
   - Notifications

   MUHIMU:
   - Hakuna localStorage kwa database
   - Hakuna profit ya siku 40/43 inayolipwa mara moja
   - Profit itaendeshwa na server-side Cloud Function
   - Profit inahesabiwa kwa vipindi kamili vya saa 24
   - Mzunguko mpya = SIKU 43
   - Withdrawal fee = TSh 0
   ========================================================= */


/* =========================================================
   1. FIREBASE CHECK
========================================================= */

if (
    typeof firebase === "undefined"
) {

    console.error(
        "❌ Firebase SDK haijapatikana."
    );

    alert(
        "Firebase haijapakiwa. Tafadhali hakikisha Firebase scripts zipo kwenye HTML."
    );

    throw new Error(
        "Firebase SDK haijapatikana."
    );
}


/* =========================================================
   2. FIREBASE SERVICES
========================================================= */

const auth =
    firebase.auth();

const db =
    firebase.firestore();

const storage =
    firebase.storage();


/* =========================================================
   3. GLOBAL VARIABLES
========================================================= */

let currentUser =
    null;

let currentUserData =
    null;

let selectedRoom =
    null;

let pendingReferralCode =
    null;

let unsubscribeUser =
    null;

let unsubscribeNotifications =
    null;

let unsubscribeBookings =
    null;

let unsubscribeAdminBookings =
    null;

let unsubscribeMainWallet =
    null;

let isAdmin =
    false;


/* =========================================================
   4. ROOMRENT SETTINGS
========================================================= */

const ROOMRENT_SETTINGS = {

    /*
     * MZUNGUKO MPYA
     * Kila booking = siku 43
     */

    durationDays:
        43,


    /*
     * Chumba cha kwanza
     */

    firstRoomProfitPerDay:
        1000,


    /*
     * Referral commission
     */

    userCommissionA:
        5,

    userCommissionB:
        2,

    userCommissionC:
        1,


    /*
     * Admin referral commission
     */

    adminCommissionA:
        20,

    adminCommissionB:
        10,

    adminCommissionC:
        5,


    /*
     * Withdrawal
     */

    minimumWithdrawal:
        3000,

    withdrawalFee:
        0

};


/* =========================================================
   5. ADMIN CONFIG
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
=========================================================

   RULE:
   - Room 0023 = TSh 1,000/day
   - Rooms nyingine = takriban 3.33%/day
   - Kila room = siku 43
   - Hakuna limit ya booking
   - Customer anaweza booking room ileile zaidi ya mara moja

========================================================= */

const ROOMS = [

    {
        number:
            "0023",

        name:
            "Room 0023",

        price:
            30000,

        profitPerDay:
            1000,

        days:
            43
    },


    {
        number:
            "0024",

        name:
            "Room 0024",

        price:
            70000,

        profitPerDay:
            2333.33,

        days:
            43
    },


    {
        number:
            "0025",

        name:
            "Room 0025",

        price:
            140000,

        profitPerDay:
            4666.67,

        days:
            43
    },


    {
        number:
            "0026",

        name:
            "Room 0026",

        price:
            210000,

        profitPerDay:
            7000,

        days:
            43
    },


    {
        number:
            "0027",

        name:
            "Room 0027",

        price:
            280000,

        profitPerDay:
            9333.33,

        days:
            43
    },


    {
        number:
            "0028",

        name:
            "Room 0028",

        price:
            350000,

        profitPerDay:
            11666.67,

        days:
            43
    },


    {
        number:
            "0029",

        name:
            "Room 0029",

        price:
            420000,

        profitPerDay:
            14000,

        days:
            43
    },


    {
        number:
            "0030",

        name:
            "Room 0030",

        price:
            490000,

        profitPerDay:
            16333.33,

        days:
            43
    },


    {
        number:
            "0031",

        name:
            "Room 0031",

        price:
            560000,

        profitPerDay:
            18666.67,

        days:
            43
    },


    {
        number:
            "0032",

        name:
            "Room 0032",

        price:
            630000,

        profitPerDay:
            21000,

        days:
            43
    }

];


/* =========================================================
   8. BASIC HELPERS
========================================================= */

function getElement(id) {

    return document.getElementById(id);

}


/* =========================================================
   9. CURRENT USER
========================================================= */

function getCurrentUser() {

    return auth.currentUser || null;

}


/* =========================================================
   10. FORMAT MONEY
========================================================= */

function formatMoney(amount) {

    const number =
        Number(amount || 0);

    return number.toLocaleString(
        "en-US",
        {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }
    );

}


/* =========================================================
   11. SERVER TIMESTAMP
========================================================= */

function serverTimestamp() {

    return firebase.firestore
        .FieldValue
        .serverTimestamp();

}


/* =========================================================
   12. HIDE SECTION
========================================================= */

function hideSection(id) {

    const element =
        getElement(id);

    if (!element) {
        return;
    }

    element.style.display =
        "none";

}


/* =========================================================
   13. SHOW SECTION
========================================================= */

function showSection(id) {

    const element =
        getElement(id);

    if (!element) {
        return;
    }

    element.style.display =
        "block";

}


/* =========================================================
   14. CLEAR MAIN SECTIONS
========================================================= */

function clearMainSections() {

    const sections = [

        "vyumba",

        "fomuKodi",

        "taarifaSection",

        "mainWallet",

        "withdrawalSection",

        "bookingList",

        "accountSection"

    ];


    sections.forEach(
        id => hideSection(id)
    );

}


/* =========================================================
   15. FIND ROOM
========================================================= */

function pataRoom(roomNumber) {

    if (!roomNumber) {
        return null;
    }


    return ROOMS.find(
        room =>
            room.number ===
            String(roomNumber)
    ) || null;

}


/* =========================================================
   16. CALCULATE TOTAL PROFIT
========================================================= */

function hesabuFaida(room) {

    if (!room) {
        return 0;
    }


    const profitPerDay =
        Number(
            room.profitPerDay || 0
        );


    const days =
        Number(
            room.days ||
            ROOMRENT_SETTINGS.durationDays
        );


    return Number(
        (
            profitPerDay *
            days
        ).toFixed(2)
    );

}


/* =========================================================
   17. CALCULATE TOTAL PAYOUT
========================================================= */

function hesabuJumla(room) {

    if (!room) {
        return 0;
    }


    const price =
        Number(
            room.price || 0
        );


    const profit =
        hesabuFaida(room);


    return Number(
        (
            price +
            profit
        ).toFixed(2)
    );

}


/* =========================================================
   18. GENERATE BOOKING NUMBER
========================================================= */

function generateBookingNumber() {

    const timestamp =
        Date.now()
            .toString()
            .slice(-10);


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
   19. GENERATE REFERRAL CODE
========================================================= */

function generateReferralCode(
    email
) {

    const prefix =
        String(email || "USER")
            .split("@")[0]
            .replace(
                /[^a-zA-Z0-9]/g,
                ""
            )
            .substring(0, 6)
            .toUpperCase();


    const random =
        Math.floor(
            1000 +
            Math.random() * 9000
        );


    return (
        "RR" +
        prefix +
        random
    );

}


/* =========================================================
   20. REFERRAL LINK
========================================================= */

function tengenezaReferralLink(
    referralCode
) {

    if (!referralCode) {
        return "";
    }


    const baseURL =
        window.location.origin +
        window.location.pathname;


    return (
        baseURL +
        "?ref=" +
        encodeURIComponent(
            referralCode
        )
    );

}


/* =========================================================
   21. GET REFERRAL CODE FROM URL
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
        ).trim();

    } catch (error) {

        console.error(
            "Referral URL error:",
            error
        );

        return "";

    }

}


/* =========================================================
   22. FIREBASE ERROR MESSAGE
========================================================= */

function firebaseErrorMessage(
    error
) {

    if (!error) {
        return "Hitilafu isiyojulikana.";
    }


    const code =
        error.code || "";


    const messages = {

        "auth/email-already-in-use":
            "Email hii tayari imesajiliwa.",

        "auth/invalid-email":
            "Email si sahihi.",

        "auth/weak-password":
            "Password ni dhaifu.",

        "auth/user-not-found":
            "Account haijapatikana.",

        "auth/wrong-password":
            "Password si sahihi.",

        "auth/invalid-credential":
            "Email au password si sahihi.",

        "auth/too-many-requests":
            "Majaribio yamekuwa mengi. Tafadhali jaribu tena baadaye.",

        "permission-denied":
            "Huna ruhusa ya kufanya kitendo hiki.",

        "failed-precondition":
            "Firebase haijakamilisha hitaji fulani.",

        "unavailable":
            "Firebase haipatikani kwa sasa."

    };


    return (
        messages[code] ||
        error.message ||
        "Hitilafu imetokea."
    );

}


/* =========================================================
   23. REQUIRE LOGIN
========================================================= */

function requireLogin() {

    if (
        !auth.currentUser
    ) {

        alert(
            "Tafadhali jisajili au ingia kwanza."
        );

        return false;
    }


    return true;

}


/* =========================================================
   24. INITIAL REFERRAL
========================================================= */

pendingReferralCode =
    pataReferralKwenyeURL();


/* =========================================================
   25. FIREBASE INITIALIZATION CHECK
========================================================= */

function initializeRoomRent() {

    try {

        if (
            typeof firebase ===
            "undefined"
        ) {

            throw new Error(
                "Firebase haijapatikana."
            );

        }


        if (
            !firebase.apps ||
            firebase.apps.length === 0
        ) {

            throw new Error(
                "Firebase App haijaanzishwa."
            );

        }


        console.log(
            "✅ RoomRent Firebase imeanza."
        );


        console.log(
            "Firebase Project:",
            firebase.app().options.projectId
        );


        return true;

    } catch (error) {

        console.error(
            "RoomRent initialization error:",
            error
        );

        return false;
    }

}


/* =========================================================
   26. END OF SEHEMU YA 1
========================================================= */
/* =========================================================
   ROOMRENT - SEHEMU YA 2
   AUTHENTICATION + USER + REFERRAL
   =========================================================

   MFUMO:
   - Firebase Authentication
   - Firestore users/{uid}
   - Unique referral code
   - Referral link
   - Referral parent UID
   - Wallet initialization
   - Admin identification
   - Hakuna localStorage
========================================================= */


/* =========================================================
   27. ESCAPE HTML
========================================================= */

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================================================
   28. CLEAN EMAIL
========================================================= */

function safishaEmail(email) {

    return String(email || "")
        .trim()
        .toLowerCase();

}


/* =========================================================
   29. VALIDATE PHONE
========================================================= */

function niNambaYaSimuSahihi(phone) {

    return /^0\d{9}$/.test(
        String(phone || "").trim()
    );

}


/* =========================================================
   30. FIND USER BY REFERRAL CODE
========================================================= */

async function pataUserKwaReferralCode(
    referralCode
) {

    if (!referralCode) {
        return null;
    }


    try {

        const code =
            String(referralCode)
                .trim()
                .toUpperCase();


        const snapshot =
            await db
                .collection("users")
                .where(
                    "referralCode",
                    "==",
                    code
                )
                .limit(1)
                .get();


        if (
            snapshot.empty
        ) {

            return null;
        }


        const doc =
            snapshot.docs[0];


        return {

            uid:
                doc.id,

            ...doc.data()

        };

    } catch (error) {

        console.error(
            "Pata referral user error:",
            error
        );

        return null;

    }

}


/* =========================================================
   31. FIND USER BY UID
========================================================= */

async function pataUserKwaUid(
    uid
) {

    if (!uid) {
        return null;
    }


    try {

        const snap =
            await db
                .collection("users")
                .doc(uid)
                .get();


        if (!snap.exists) {
            return null;
        }


        return {

            uid:
                uid,

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
   32. ENSURE WALLET
========================================================= */

async function hakikishaMainWallet(
    uid
) {

    if (!uid) {
        return false;
    }


    const walletRef =
        db
            .collection("wallets")
            .doc(uid);


    try {

        const walletSnap =
            await walletRef.get();


        if (
            walletSnap.exists
        ) {

            return true;
        }


        /*
         * Wallet mpya huanzishwa
         * bila balance.
         */

        await walletRef.set({

            uid:
                uid,

            balance:
                0,

            bookingEarnings:
                0,

            referralCommission:
                0,

            totalEarned:
                0,

            totalWithdrawn:
                0,

            pendingWithdrawal:
                0,

            updatedAt:
                serverTimestamp()

        });


        return true;

    } catch (error) {

        console.error(
            "Wallet initialization error:",
            error
        );

        return false;

    }

}


/* =========================================================
   33. GET REFERRAL PARENT
========================================================= */

async function pataReferralParent(
    referralCode
) {

    if (!referralCode) {
        return null;
    }


    const code =
        String(referralCode)
            .trim()
            .toUpperCase();


    /*
     * Admin referral
     */

    if (
        code ===
        ADMIN_CONFIG.referralCode
    ) {

        return {

            uid:
                ADMIN_CONFIG.uid,

            name:
                ADMIN_CONFIG.name,

            referralCode:
                ADMIN_CONFIG.referralCode,

            referralType:
                "admin"

        };

    }


    /*
     * User referral
     */

    const parent =
        await pataUserKwaReferralCode(
            code
        );


    if (!parent) {
        return null;
    }


    /*
     * Hakuna kujirefer mwenyewe
     */

    if (
        auth.currentUser &&
        parent.uid ===
        auth.currentUser.uid
    ) {

        return null;
    }


    return {

        uid:
            parent.uid,

        name:
            parent.name || "",

        referralCode:
            parent.referralCode || "",

        referralType:
            "user"

    };

}


/* =========================================================
   34. CREATE UNIQUE REFERRAL CODE
========================================================= */

async function tengenezaUniqueReferralCode(
    email
) {

    /*
     * Tunajaribu mara kadhaa kuhakikisha
     * code haijatumika tayari.
     */

    for (
        let attempt = 0;
        attempt < 10;
        attempt++
    ) {

        const code =
            generateReferralCode(
                email
            );


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


        if (
            existing.empty &&
            code !==
            ADMIN_CONFIG.referralCode
        ) {

            return code;
        }

    }


    /*
     * Fallback ya ziada
     */

    return (
        "RR" +
        Date.now()
            .toString()
            .slice(-12)
    );

}


/* =========================================================
   35. SIGN UP
========================================================= */

async function signUpUser() {

    if (
        typeof auth ===
        "undefined" ||
        typeof db ===
        "undefined"
    ) {

        alert(
            "Firebase haijawa tayari."
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


    const name =
        String(
            nameInput?.value || ""
        ).trim();


    const email =
        safishaEmail(
            emailInput?.value
        );


    const phone =
        String(
            phoneInput?.value || ""
        ).trim();


    const password =
        String(
            passwordInput?.value || ""
        );


    if (!name) {

        onyeshaSignUpMessage(
            "Tafadhali weka jina lako."
        );

        return;
    }


    if (!email) {

        onyeshaSignUpMessage(
            "Tafadhali weka email."
        );

        return;
    }


    if (!phone) {

        onyeshaSignUpMessage(
            "Tafadhali weka namba ya simu."
        );

        return;
    }


    if (
        !niNambaYaSimuSahihi(
            phone
        )
    ) {

        onyeshaSignUpMessage(
            "Namba ya simu lazima iwe tarakimu 10 na ianze na 0."
        );

        return;
    }


    if (
        password.length < 6
    ) {

        onyeshaSignUpMessage(
            "Password lazima iwe na angalau characters 6."
        );

        return;
    }


    try {

        onyeshaSignUpMessage(
            "Inatengeneza account..."
        );


        /*
         * Referral inayotumika wakati
         * wa usajili.
         */

        const referralCode =
            (
                pendingReferralCode ||
                pataReferralKwenyeURL() ||
                ""
            )
            .trim()
            .toUpperCase();


        /*
         * Tafuta referral parent
         * kabla ya kutengeneza user.
         */

        let referralParent =
            null;


        if (referralCode) {

            referralParent =
                await pataReferralParent(
                    referralCode
                );

        }


        /*
         * Tengeneza Firebase Auth user.
         */

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
                "Firebase haikurudisha user."
            );

        }


        const uid =
            user.uid;


        /*
         * Referral code ya user mpya.
         */

        const newReferralCode =
            await tengenezaUniqueReferralCode(
                email
            );


        const referralLink =
            tengenezaReferralLink(
                newReferralCode
            );


        /*
         * User document.
         */

        const userData = {

            uid:
                uid,

            name:
                name,

            email:
                email,

            phone:
                phone,

            referralCode:
                newReferralCode,

            referralLink:
                referralLink,

            referredBy:
                referralParent
                    ? referralParent.uid
                    : null,

            referredByUid:
                referralParent
                    ? referralParent.uid
                    : null,

            referredByCode:
                referralParent
                    ? referralCode
                    : null,

            referralType:
                referralParent
                    ? referralParent.referralType
                    : null,

            totalCommission:
                0,

            totalBookings:
                0,

            role:
                "user",

            createdAt:
                serverTimestamp(),

            updatedAt:
                serverTimestamp(),

            lastLogin:
                serverTimestamp()

        };


        /*
         * Andika user Firestore.
         */

        await db
            .collection("users")
            .doc(uid)
            .set(
                userData
            );


        /*
         * Tengeneza wallet.
         */

        await hakikishaMainWallet(
            uid
        );


        /*
         * Update globals.
         */

        currentUser =
            user;

        currentUserData =
            {
                ...userData,
                uid: uid
            };


        isAdmin =
            uid ===
            ADMIN_CONFIG.uid;


        pendingReferralCode =
            null;


        onyeshaSignUpMessage(
            "✅ Account imetengenezwa."
        );


        /*
         * Fungua account ikiwa ipo.
         */

        setTimeout(
            () => {

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
            "Sign up error:",
            error
        );


        onyeshaSignUpMessage(
            "❌ " +
            firebaseErrorMessage(
                error
            )
        );

    }

}


/* =========================================================
   36. SIGN UP MESSAGE
========================================================= */

function onyeshaSignUpMessage(
    message
) {

    const element =
        getElement(
            "signUpMessage"
        );


    if (element) {

        element.textContent =
            message;

        element.style.display =
            "block";

    } else {

        console.log(
            "SIGN UP:",
            message
        );

    }

}


/* =========================================================
   37. SIGN IN
========================================================= */

async function signInUser() {

    if (
        typeof auth ===
        "undefined"
    ) {

        alert(
            "Firebase Authentication haijawa tayari."
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
        String(
            passwordInput?.value || ""
        );


    if (!email) {

        onyeshaSignInMessage(
            "Tafadhali weka email."
        );

        return;
    }


    if (!password) {

        onyeshaSignInMessage(
            "Tafadhali weka password."
        );

        return;
    }


    try {

        onyeshaSignInMessage(
            "Inaingia..."
        );


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
                "User hajapatikana."
            );

        }


        currentUser =
            user;


        /*
         * Pata Firestore user.
         */

        const userRef =
            db
                .collection("users")
                .doc(user.uid);


        const userSnap =
            await userRef.get();


        if (
            !userSnap.exists
        ) {

            /*
             * Account ya Auth ipo lakini
             * Firestore document haipo.
             *
             * Tunaunda document salama
             * yenye role ya user.
             */

            const referralCode =
                await tengenezaUniqueReferralCode(
                    email
                );


            const referralLink =
                tengenezaReferralLink(
                    referralCode
                );


            currentUserData = {

                uid:
                    user.uid,

                name:
                    user.displayName ||
                    email.split("@")[0],

                email:
                    user.email ||
                    email,

                phone:
                    "",

                referralCode:
                    referralCode,

                referralLink:
                    referralLink,

                referredBy:
                    null,

                referredByUid:
                    null,

                referredByCode:
                    null,

                referralType:
                    null,

                totalCommission:
                    0,

                totalBookings:
                    0,

                role:
                    "user"

            };


            await userRef.set({

                ...currentUserData,

                createdAt:
                    serverTimestamp(),

                updatedAt:
                    serverTimestamp(),

                lastLogin:
                    serverTimestamp()

            });


        } else {

            currentUserData = {

                uid:
                    user.uid,

                ...userSnap.data()

            };


            await userRef.update({

                lastLogin:
                    serverTimestamp(),

                updatedAt:
                    serverTimestamp()

            });

        }


        /*
         * Admin anatambuliwa kwa UID
         * pamoja na role.
         */

        isAdmin =
            user.uid ===
            ADMIN_CONFIG.uid ||
            currentUserData.role ===
            "admin";


        /*
         * Hakikisha wallet ipo.
         */

        await hakikishaMainWallet(
            user.uid
        );


        /*
         * Ondoa referral URL baada ya login.
         */

        pendingReferralCode =
            null;


        onyeshaSignInMessage(
            "✅ Umeingia kikamilifu."
        );


        /*
         * Fungua account.
         */

        setTimeout(
            () => {

                if (
                    typeof funguaAccount ===
                    "function"
                ) {

                    funguaAccount();

                }

            },
            400
        );


    } catch (error) {

        console.error(
            "Sign in error:",
            error
        );


        onyeshaSignInMessage(
            "❌ " +
            firebaseErrorMessage(
                error
            )
        );

    }

}


/* =========================================================
   38. SIGN IN MESSAGE
========================================================= */

function onyeshaSignInMessage(
    message
) {

    const element =
        getElement(
            "signInMessage"
        );


    if (element) {

        element.textContent =
            message;

        element.style.display =
            "block";

    } else {

        console.log(
            "SIGN IN:",
            message
        );

    }

}


/* =========================================================
   39. SIGN OUT
========================================================= */

async function signOutUser() {

    try {

        await auth.signOut();


        currentUser =
            null;

        currentUserData =
            null;

        selectedRoom =
            null;

        isAdmin =
            false;


        if (
            typeof unsubscribeMainWallet ===
            "function"
        ) {

            if (
                unsubscribeMainWallet
            ) {

                unsubscribeMainWallet();
            }

        }


        if (
            typeof unsubscribeBookings ===
            "function"
        ) {

            if (
                unsubscribeBookings
            ) {

                unsubscribeBookings();
            }

        }


        if (
            typeof unsubscribeNotifications ===
            "function"
        ) {

            if (
                unsubscribeNotifications
            ) {

                unsubscribeNotifications();
            }

        }


        if (
            typeof unsubscribeAdminBookings ===
            "function"
        ) {

            if (
                unsubscribeAdminBookings
            ) {

                unsubscribeAdminBookings();
            }

        }


        unsubscribeMainWallet =
            null;

        unsubscribeBookings =
            null;

        unsubscribeNotifications =
            null;

        unsubscribeAdminBookings =
            null;


        clearMainSections();


        const accountSection =
            getElement(
                "accountSection"
            );


        if (accountSection) {

            accountSection.style.display =
                "none";

        }


        alert(
            "Umetoka kwenye account."
        );


    } catch (error) {

        console.error(
            "Sign out error:",
            error
        );


        alert(
            "❌ Imeshindikana kutoka:\n" +
            firebaseErrorMessage(
                error
            )
        );

    }

}


/* =========================================================
   40. AUTH STATE LISTENER
========================================================= */

function anzishaAuthListener() {

    auth.onAuthStateChanged(
        async user => {

            try {

                currentUser =
                    user || null;


                /*
                 * Hakuna user
                 */

                if (!user) {

                    currentUserData =
                        null;

                    isAdmin =
                        false;

                    clearMainSections();


                    console.log(
                        "RoomRent: hakuna user aliyeingia."
                    );


                    return;
                }


                /*
                 * Pata user Firestore.
                 */

                const userSnap =
                    await db
                        .collection("users")
                        .doc(user.uid)
                        .get();


                if (
                    userSnap.exists
                ) {

                    currentUserData = {

                        uid:
                            user.uid,

                        ...userSnap.data()

                    };

                } else {

                    /*
                     * Security-first:
                     * account ya Auth bila Firestore
                     * document inachukuliwa kama user,
                     * sio admin.
                     */

                    currentUserData = {

                        uid:
                            user.uid,

                        name:
                            user.displayName ||
                            "",

                        email:
                            user.email ||
                            "",

                        role:
                            "user"

                    };

                }


                /*
                 * Admin UID ndiyo authority
                 * ya msingi upande wa client.
                 *
                 * Security Rules/Cloud Functions
                 * zitatumika upande wa server.
                 */

                isAdmin =
                    user.uid ===
                    ADMIN_CONFIG.uid;


                await hakikishaMainWallet(
                    user.uid
                );


                console.log(
                    "RoomRent Auth:",
                    {
                        uid:
                            user.uid,

                        isAdmin:
                            isAdmin
                    }
                );


            } catch (error) {

                console.error(
                    "Auth state listener error:",
                    error
                );

            }

        }
    );

}


/* =========================================================
   41. SAVE ADMIN REFERRAL LINK
========================================================= */

async function wekaAdminReferralLink() {

    try {

        const adminRef =
            db
                .collection("users")
                .doc(
                    ADMIN_CONFIG.uid
                );


        const adminSnap =
            await adminRef.get();


        /*
         * Hii function haitengenezi admin mpya.
         *
         * Ikiwa admin document ipo,
         * inaweka referral information.
         */

        if (
            adminSnap.exists
        ) {

            await adminRef.update({

                referralCode:
                    ADMIN_CONFIG.referralCode,

                referralLink:
                    tengenezaReferralLink(
                        ADMIN_CONFIG.referralCode
                    ),

                referralType:
                    "admin",

                updatedAt:
                    serverTimestamp()

            });

        }


    } catch (error) {

        console.error(
            "Admin referral link error:",
            error
        );

    }

}


/* =========================================================
   42. SAVE NEW REFERRAL
========================================================= */

async function hifadhiReferralMpya(
    uid
) {

    if (!uid) {
        return;
    }


    try {

        const userRef =
            db
                .collection("users")
                .doc(uid);


        const userSnap =
            await userRef.get();


        if (
            !userSnap.exists
        ) {

            return;
        }


        const user =
            userSnap.data();


        /*
         * Kama tayari ana sponsor,
         * hatubadilishi.
         */

        if (
            user.referredByUid
        ) {

            return;
        }


        const code =
            (
                pendingReferralCode ||
                pataReferralKwenyeURL() ||
                ""
            )
            .trim()
            .toUpperCase();


        if (!code) {
            return;
        }


        /*
         * Usijirefer mwenyewe.
         */

        if (
            code ===
            user.referralCode
        ) {

            return;
        }


        const parent =
            await pataReferralParent(
                code
            );


        if (!parent) {

            return;
        }


        await userRef.update({

            referredBy:
                parent.uid,

            referredByUid:
                parent.uid,

            referredByCode:
                code,

            referralType:
                parent.referralType,

            updatedAt:
                serverTimestamp()

        });


        currentUserData = {

            ...currentUserData,

            referredBy:
                parent.uid,

            referredByUid:
                parent.uid,

            referredByCode:
                code,

            referralType:
                parent.referralType

        };


        pendingReferralCode =
            null;


    } catch (error) {

        console.error(
            "Hifadhi referral error:",
            error
        );

    }

}


/* =========================================================
   43. END OF SEHEMU YA 2
========================================================= */
/* =========================================================
   ROOMRENT - SEHEMU YA 3
   VYUMBA + BOOKING FORM
   =========================================================

   MFUMO:
   - Vyumba vinaonekana baada ya login tu
   - Hakuna limit ya bookings kwa room
   - Customer anaweza booking room ileile mara nyingi
   - Kila booking inapata bookingNumber mpya
   - Room object HAIBADILISHWI kwa taarifa za customer
========================================================= */


/* =========================================================
   44. ONYESHA VYUMBA
========================================================= */

function onyeshaVyumba() {

    if (!requireLogin()) {
        return;
    }


    clearMainSections();


    const container =
        getElement("vyumba");


    if (!container) {

        console.error(
            "Element #vyumba haipo kwenye HTML."
        );

        return;
    }


    container.style.display =
        "block";


    let html = `

        <div class="roomrent-section-header">

            <h2>🏠 Vyumba vya RoomRent</h2>

            <p>
                Chagua chumba unachotaka kukodi.
            </p>

        </div>

        <div class="rooms-container">

    `;


    ROOMS.forEach(
        room => {

            const totalProfit =
                hesabuFaida(room);


            const totalPayout =
                hesabuJumla(room);


            html += `

                <div class="room-card">

                    <h3>
                        🏠 ${escapeHTML(room.name)}
                    </h3>

                    <p>
                        <strong>
                            Namba:
                        </strong>
                        ${escapeHTML(room.number)}
                    </p>

                    <p>
                        <strong>
                            Bei:
                        </strong>
                        TSh ${formatMoney(room.price)}
                    </p>

                    <p>
                        <strong>
                            Faida kwa siku:
                        </strong>
                        TSh ${formatMoney(room.profitPerDay)}
                    </p>

                    <p>
                        <strong>
                            Muda:
                        </strong>
                        ${room.days} siku
                    </p>

                    <p>
                        <strong>
                            Faida yote:
                        </strong>
                        TSh ${formatMoney(totalProfit)}
                    </p>

                    <p>
                        <strong>
                            Jumla ya malipo:
                        </strong>
                        TSh ${formatMoney(totalPayout)}
                    </p>

                    <button
                        type="button"
                        class="room-book-btn"
                        data-room="${escapeHTML(room.number)}"
                    >
                        Kodi Chumba
                    </button>

                </div>

            `;

        }
    );


    html += `

        </div>

    `;


    container.innerHTML =
        html;


    /*
     * Event delegation.
     *
     * Tunatumia listener moja tu badala ya
     * kuweka onclick nyingi.
     */

    container.onclick =
        function(event) {

            const button =
                event.target.closest(
                    ".room-book-btn"
                );


            if (!button) {
                return;
            }


            const roomNumber =
                button.dataset.room;


            funguaFomuKodi(
                roomNumber
            );

        };

}


/* =========================================================
   45. FUNGUA BOOKING FORM
========================================================= */

function funguaFomuKodi(
    roomNumber
) {

    if (!requireLogin()) {
        return;
    }


    const room =
        pataRoom(roomNumber);


    if (!room) {

        alert(
            "❌ Chumba hakijapatikana."
        );

        return;
    }


    /*
     * Hifadhi room iliyochaguliwa
     * bila kuongeza taarifa za customer
     * ndani ya ROOMS.
     */

    selectedRoom = {

        number:
            room.number,

        name:
            room.name,

        price:
            Number(room.price),

        profitPerDay:
            Number(room.profitPerDay),

        days:
            Number(room.days)

    };


    clearMainSections();


    const formSection =
        getElement(
            "fomuKodi"
        );


    if (!formSection) {

        console.error(
            "Element #fomuKodi haipo kwenye HTML."
        );

        return;
    }


    formSection.style.display =
        "block";


    const defaultName =
        currentUserData?.name ||
        "";


    const defaultPhone =
        currentUserData?.phone ||
        "";


    const totalProfit =
        hesabuFaida(
            selectedRoom
        );


    const totalPayout =
        hesabuJumla(
            selectedRoom
        );


    formSection.innerHTML = `

        <div class="booking-form-container">

            <h2>
                🏠 Kodi ${escapeHTML(room.name)}
            </h2>

            <div class="booking-summary">

                <p>
                    <strong>
                        Bei ya chumba:
                    </strong>
                    TSh ${formatMoney(room.price)}
                </p>

                <p>
                    <strong>
                        Faida kwa siku:
                    </strong>
                    TSh ${formatMoney(room.profitPerDay)}
                </p>

                <p>
                    <strong>
                        Muda:
                    </strong>
                    ${room.days} siku
                </p>

                <p>
                    <strong>
                        Faida yote:
                    </strong>
                    TSh ${formatMoney(totalProfit)}
                </p>

                <p>
                    <strong>
                        Jumla:
                    </strong>
                    TSh ${formatMoney(totalPayout)}
                </p>

            </div>


            <div class="form-group">

                <label for="bookingName">
                    Jina kamili
                </label>

                <input
                    type="text"
                    id="bookingName"
                    value="${escapeHTML(defaultName)}"
                    autocomplete="name"
                    placeholder="Jina kamili"
                >

            </div>


            <div class="form-group">

                <label for="bookingPhone">
                    Namba ya simu
                </label>

                <input
                    type="tel"
                    id="bookingPhone"
                    value="${escapeHTML(defaultPhone)}"
                    inputmode="numeric"
                    maxlength="10"
                    placeholder="07XXXXXXXX"
                >

            </div>


            <div class="booking-form-buttons">

                <button
                    type="button"
                    id="continuePaymentBtn"
                >
                    Endelea na Malipo
                </button>

                <button
                    type="button"
                    id="closeBookingFormBtn"
                >
                    Funga
                </button>

            </div>

        </div>

    `;


    /*
     * Bind buttons mara moja.
     */

    const continueBtn =
        getElement(
            "continuePaymentBtn"
        );


    if (continueBtn) {

        continueBtn.onclick =
            endeleaMalipo;

    }


    const closeBtn =
        getElement(
            "closeBookingFormBtn"
        );


    if (closeBtn) {

        closeBtn.onclick =
            fungaFomuKodi;

    }


    formSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


/* =========================================================
   46. FUNGA BOOKING FORM
========================================================= */

function fungaFomuKodi() {

    selectedRoom =
        null;


    const formSection =
        getElement(
            "fomuKodi"
        );


    if (formSection) {

        formSection.innerHTML =
            "";

        formSection.style.display =
            "none";

    }

}


/* =========================================================
   47. ENDELEA MALIPO
========================================================= */

function endeleaMalipo() {

    if (!requireLogin()) {
        return;
    }


    if (!selectedRoom) {

        alert(
            "❌ Tafadhali chagua chumba kwanza."
        );

        return;
    }


    const nameInput =
        getElement(
            "bookingName"
        );


    const phoneInput =
        getElement(
            "bookingPhone"
        );


    const bookingName =
        String(
            nameInput?.value || ""
        ).trim();


    const bookingPhone =
        String(
            phoneInput?.value || ""
        ).trim();


    if (!bookingName) {

        alert(
            "Tafadhali weka jina kamili."
        );

        return;
    }


    if (
        !niNambaYaSimuSahihi(
            bookingPhone
        )
    ) {

        alert(
            "Tafadhali weka namba ya simu sahihi yenye tarakimu 10."
        );

        return;
    }


    /*
     * Muhimu:
     *
     * HATUBADILISHI selectedRoom
     * kwa bookingName/bookingPhone.
     *
     * Taarifa hizi zitapita kwenye
     * function ya malipo kama variables
     * tofauti.
     */

    funguaMalipo({

        bookingName:
            bookingName,

        bookingPhone:
            bookingPhone

    });

}


/* =========================================================
   48. FUNGUA MALIPO
========================================================= */

function funguaMalipo(
    customerInfo = {}
) {

    if (!requireLogin()) {
        return;
    }


    if (!selectedRoom) {

        alert(
            "❌ Chumba hakijachaguliwa."
        );

        return;
    }


    const formSection =
        getElement(
            "fomuKodi"
        );


    if (!formSection) {
        return;
    }


    const room =
        selectedRoom;


    const totalProfit =
        hesabuFaida(room);


    const totalPayout =
        hesabuJumla(room);


    const bookingName =
        customerInfo.bookingName ||
        currentUserData?.name ||
        "";


    const bookingPhone =
        customerInfo.bookingPhone ||
        currentUserData?.phone ||
        "";


    formSection.style.display =
        "block";


    formSection.innerHTML = `

        <div class="payment-container">

            <h2>
                💳 Malipo ya Booking
            </h2>


            <div class="payment-summary">

                <p>
                    <strong>
                        Chumba:
                    </strong>
                    ${escapeHTML(room.name)}
                </p>

                <p>
                    <strong>
                        Bei:
                    </strong>
                    TSh ${formatMoney(room.price)}
                </p>

                <p>
                    <strong>
                        Muda:
                    </strong>
                    ${room.days} siku
                </p>

                <p>
                    <strong>
                        Faida kwa siku:
                    </strong>
                    TSh ${formatMoney(room.profitPerDay)}
                </p>

                <p>
                    <strong>
                        Faida yote:
                    </strong>
                    TSh ${formatMoney(totalProfit)}
                </p>

                <p>
                    <strong>
                        Jumla ya payout:
                    </strong>
                    TSh ${formatMoney(totalPayout)}
                </p>

            </div>


            <hr>


            <h3>
                Chagua njia ya malipo
            </h3>


            <div class="payment-methods">

                <label>

                    <input
                        type="radio"
                        name="paymentMethod"
                        value="AIRTEL_MONEY"
                    >

                    Airtel Money

                </label>


                <label>

                    <input
                        type="radio"
                        name="paymentMethod"
                        value="MIXX_BY_YAS"
                    >

                    MIXX BY YAS

                </label>

            </div>


            <div
                id="paymentInstructions"
                style="display:none;"
            ></div>


            <div class="form-group">

                <label for="paymentSenderPhone">
                    Namba iliyotuma malipo
                </label>

                <input
                    type="tel"
                    id="paymentSenderPhone"
                    value="${escapeHTML(bookingPhone)}"
                    inputmode="numeric"
                    maxlength="10"
                    placeholder="07XXXXXXXX"
                >

            </div>


            <div class="form-group">

                <label for="paymentReference">
                    Transaction Reference
                </label>

                <input
                    type="text"
                    id="paymentReference"
                    placeholder="Weka reference ya muamala"
                    autocomplete="off"
                >

            </div>


            <div
                id="paymentMessage"
                style="display:none;"
            ></div>


            <div class="payment-buttons">

                <button
                    type="button"
                    id="submitPaymentBtn"
                >
                    Nimetuma Malipo
                </button>


                <button
                    type="button"
                    id="backToBookingBtn"
                >
                    Rudi
                </button>

            </div>

        </div>

    `;


    /*
     * Payment method listeners.
     */

    const paymentRadios =
        formSection.querySelectorAll(
            'input[name="paymentMethod"]'
        );


    paymentRadios.forEach(
        radio => {

            radio.addEventListener(
                "change",
                function() {

                    onyeshaMaelekezoYaMalipo(
                        this.value
                    );

                }
            );

        }
    );


    const submitBtn =
        getElement(
            "submitPaymentBtn"
        );


    if (submitBtn) {

        submitBtn.onclick =
            function() {

                tumaOmbiLaMalipo({

                    bookingName:
                        bookingName,

                    bookingPhone:
                        bookingPhone

                });

            };

    }


    const backBtn =
        getElement(
            "backToBookingBtn"
        );


    if (backBtn) {

        backBtn.onclick =
            function() {

                funguaFomuKodi(
                    room.number
                );

            };

    }


    formSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


/* =========================================================
   49. PAYMENT INSTRUCTIONS
========================================================= */

function onyeshaMaelekezoYaMalipo(
    method
) {

    const container =
        getElement(
            "paymentInstructions"
        );


    if (!container) {
        return;
    }


    const payment =
        PAYMENT_METHODS[
            method
        ];


    if (!payment) {

        container.innerHTML =
            "";

        container.style.display =
            "none";

        return;
    }


    container.innerHTML = `

        <div class="payment-instructions">

            <p>
                <strong>
                    Tuma TSh ${formatMoney(
                        selectedRoom?.price || 0
                    )}
                </strong>
            </p>

            <p>
                Njia:
                <strong>
                    ${escapeHTML(payment.name)}
                </strong>
            </p>

            <p>
                Namba:
                <strong>
                    ${escapeHTML(payment.number)}
                </strong>
            </p>

            <p>
                Jina:
                <strong>
                    ${escapeHTML(payment.owner)}
                </strong>
            </p>

            <p>
                Baada ya kutuma malipo,
                weka namba iliyotuma na
                Transaction Reference hapa chini.
            </p>

        </div>

    `;


    container.style.display =
        "block";

}


/* =========================================================
   50. GET SELECTED PAYMENT METHOD
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
   51. SHOW PAYMENT MESSAGE
========================================================= */

function onyeshaPaymentMessage(
    message
) {

    const element =
        getElement(
            "paymentMessage"
        );


    if (!element) {

        alert(message);

        return;
    }


    element.textContent =
        message;

    element.style.display =
        "block";

}


/* =========================================================
   52. END OF SEHEMU YA 3
========================================================= */
/* =========================================================
   ROOMRENT - SEHEMU YA 4
   PAYMENT REQUEST + BOOKING CREATION + NOTIFICATIONS
   =========================================================

   MUHIMU:
   - Booking mpya HAINAZUIWI kwa room/uid
   - Mteja anaweza booking chumba hicho hicho mara nyingi
   - Kila booking inapata bookingNumber mpya
   - Profit HAITOLWI wakati wa booking
   - Profit itaanza baada ya Admin kuthibitisha booking
   - Malipo ni manual: Airtel Money / MIXX BY YAS
   ========================================================= */


/* =========================================================
   4.1 - PAYMENT METHOD RADIO
========================================================= */

function chaguaPaymentMethod() {

    const radios =
        document.querySelectorAll(
            'input[name="paymentMethod"]'
        );

    let selected = null;

    radios.forEach(function (radio) {

        if (radio.checked) {
            selected = radio.value;
        }

    });

    return selected;
}


/* =========================================================
   4.2 - CREATE BOOKING PAYMENT REQUEST
========================================================= */

async function tumaOmbiLaMalipo(customerInfo = {}) {

    try {

        if (!currentUser) {
            alert("Tafadhali ingia kwenye akaunti yako kwanza.");
            return;
        }

        if (!selectedRoom) {
            alert("Hakuna chumba kilichochaguliwa.");
            return;
        }


        /* -----------------------------------------
           CUSTOMER INFORMATION
        ----------------------------------------- */

        const bookingName =
            String(
                customerInfo.bookingName ||
                getElement("bookingName")?.value ||
                ""
            ).trim();

        const bookingPhone =
            String(
                customerInfo.bookingPhone ||
                getElement("bookingPhone")?.value ||
                ""
            ).trim();


        /* -----------------------------------------
           PAYMENT INFORMATION
        ----------------------------------------- */

        const paymentMethod =
            chaguaPaymentMethod();

        const senderPhone =
            String(
                getElement("paymentSenderPhone")?.value ||
                ""
            ).trim();

        const paymentReference =
            String(
                getElement("paymentReference")?.value ||
                ""
            ).trim();


        /* -----------------------------------------
           VALIDATION
        ----------------------------------------- */

        if (!bookingName) {

            alert("Tafadhali weka jina la mpangaji.");

            return;
        }


        if (!niNambaYaSimuSahihi(bookingPhone)) {

            alert(
                "Namba ya simu ya mpangaji lazima iwe na tarakimu 10 na ianze na 0."
            );

            return;
        }


        if (!paymentMethod) {

            alert(
                "Tafadhali chagua njia ya malipo."
            );

            return;
        }


        if (!niNambaYaSimuSahihi(senderPhone)) {

            alert(
                "Tafadhali weka namba ya simu iliyotumika kufanya malipo."
            );

            return;
        }


        if (!paymentReference) {

            alert(
                "Tafadhali weka namba/rejea ya muamala wa malipo."
            );

            return;
        }


        /* -----------------------------------------
           GET PAYMENT METHOD
        ----------------------------------------- */

        const method =
            pataPaymentMethod(paymentMethod);

        if (!method) {

            alert(
                "Njia ya malipo haijatambuliwa."
            );

            return;
        }


        /* -----------------------------------------
           BUTTON LOADING
        ----------------------------------------- */

        const submitBtn =
            getElement("submitPaymentBtn");

        if (submitBtn) {

            submitBtn.disabled = true;

            submitBtn.dataset.originalText =
                submitBtn.textContent;

            submitBtn.textContent =
                "Inatumwa...";
        }


        /* -----------------------------------------
           NEW BOOKING NUMBER
        ----------------------------------------- */

        const bookingNumber =
            generateBookingNumber();


        /* -----------------------------------------
           ROOM DATA
        ----------------------------------------- */

        const room =
            pataRoom(selectedRoom.roomNumber);

        if (!room) {

            throw new Error(
                "Chumba hakijapatikana."
            );
        }


        const price =
            Number(room.price || 0);

        const profitPerDay =
            Number(room.profitPerDay || 0);

        const durationDays =
            Number(
                room.days ||
                ROOMRENT_SETTINGS.durationDays
            );

        const totalProfit =
            hesabuFaida(
                profitPerDay,
                durationDays
            );

        const totalPayout =
            hesabuJumla(
                price,
                totalProfit
            );


        /* -----------------------------------------
           USER DATA
        ----------------------------------------- */

        let userData =
            currentUserData || {};

        if (!userData.uid) {

            const userSnap =
                await db
                    .collection("users")
                    .doc(currentUser.uid)
                    .get();

            if (userSnap.exists) {

                userData =
                    userSnap.data() || {};

                currentUserData =
                    userData;
            }
        }


        /* -----------------------------------------
           REFERRAL DATA
        ----------------------------------------- */

        const referredBy =
            userData.referredBy || null;

        const referredByUid =
            userData.referredByUid || null;

        const referralCode =
            userData.referralCode || null;


        /* -----------------------------------------
           BOOKING OBJECT
        -----------------------------------------

           Financial fields are stored for display.

           Final financial confirmation must be
           controlled by the Admin/backend.
        ----------------------------------------- */

        const bookingData = {

            bookingNumber: bookingNumber,

            uid: currentUser.uid,

            userId: currentUser.uid,


            /* Customer */

            customerName: bookingName,

            customerEmail:
                currentUser.email || "",

            customerPhone: bookingPhone,


            /* Room */

            roomNumber: room.roomNumber,

            roomName:
                room.name ||
                `Chumba ${room.roomNumber}`,


            /* Financial information */

            amount: price,

            price: price,

            profitPerDay: profitPerDay,

            durationDays: durationDays,

            days: durationDays,

            totalProfit: totalProfit,

            totalPayout: totalPayout,


            /* Referral */

            referredBy: referredBy,

            referredByUid: referredByUid,

            referralCode: referralCode,


            /* Payment */

            paymentMethod: paymentMethod,

            paymentMethodName:
                method.name || paymentMethod,

            paymentReceiver:
                method.number || "",

            paymentReceiverName:
                method.name || "",

            paymentSenderPhone:
                senderPhone,

            paymentReference:
                paymentReference,


            /* Status */

            status: "payment_pending",

            paymentStatus: "pending",

            adminConfirmed: false,

            commissionProcessed: false,

            profitProcessed: false,

            profitDaysPaid: 0,

            totalProfitPaid: 0,


            /* Dates */

            createdAt: serverTimestamp(),

            updatedAt: serverTimestamp(),

            confirmedAt: null,

            completedAt: null
        };


        /* -----------------------------------------
           CREATE FIRESTORE BOOKING
        ----------------------------------------- */

        await db
            .collection("bookings")
            .doc(bookingNumber)
            .set(bookingData);


        /* -----------------------------------------
           USER BOOKING COUNTER
        ----------------------------------------- */

        try {

            await db
                .collection("users")
                .doc(currentUser.uid)
                .update({

                    totalBookings:
                        firebase.firestore.FieldValue.increment(1),

                    updatedAt:
                        serverTimestamp()
                });

        } catch (counterError) {

            console.warn(
                "Booking imeundwa lakini counter haiku-update:",
                counterError
            );
        }


        /* -----------------------------------------
           NOTIFICATION
        ----------------------------------------- */

        await tengenezaNotification(

            currentUser.uid,

            {
                title:
                    "Booking imepokelewa",

                message:
                    `Ombi lako la booking ${bookingNumber} limepokelewa. Subiri uthibitisho wa malipo na Admin.`,

                type:
                    "booking",

                bookingNumber:
                    bookingNumber
            }

        );


        /* -----------------------------------------
           SUCCESS MESSAGE
        ----------------------------------------- */

        const container =
            getElement("fomuKodi");

        if (container) {

            container.innerHTML = `

                <div class="roomrent-success-box">

                    <h2>✅ Ombi Limetumwa</h2>

                    <p>
                        Booking yako imetumwa kikamilifu.
                    </p>

                    <p>
                        <strong>Booking Number:</strong>
                        ${escapeHTML(bookingNumber)}
                    </p>

                    <p>
                        <strong>Chumba:</strong>
                        ${escapeHTML(
                            room.name ||
                            room.roomNumber
                        )}
                    </p>

                    <p>
                        <strong>Kiasi:</strong>
                        ${formatMoney(price)}
                    </p>

                    <p>
                        <strong>Faida kwa siku:</strong>
                        ${formatMoney(profitPerDay)}
                    </p>

                    <p>
                        <strong>Muda:</strong>
                        ${durationDays} siku
                    </p>

                    <hr>

                    <p>
                        💰 Faida haitaanza kuhesabiwa mpaka
                        Admin athibitishe booking yako.
                    </p>

                    <p>
                        📌 Unaweza kuona hali ya booking
                        kupitia <strong>Booking Zangu</strong>.
                    </p>

                    <button
                        type="button"
                        id="goToBookingsAfterPayment"
                    >
                        📋 Booking Zangu
                    </button>

                    <button
                        type="button"
                        id="goToRoomsAfterPayment"
                    >
                        🏠 Rudi Vyumbani
                    </button>

                </div>
            `;


            const bookingBtn =
                getElement(
                    "goToBookingsAfterPayment"
                );

            if (bookingBtn) {

                bookingBtn.onclick =
                    function () {

                        funguaBookingZangu();

                    };
            }


            const roomsBtn =
                getElement(
                    "goToRoomsAfterPayment"
                );

            if (roomsBtn) {

                roomsBtn.onclick =
                    function () {

                        onyeshaVyumba();

                    };
            }
        }


        /* -----------------------------------------
           CLEAR SELECTED ROOM
        ----------------------------------------- */

        selectedRoom = null;


        console.log(
            "BOOKING CREATED:",
            bookingNumber
        );


    } catch (error) {

        console.error(
            "tumaOmbiLaMalipo ERROR:",
            error
        );


        const message =
            firebaseErrorMessage(error);


        alert(
            "Imeshindikana kutuma booking.\n\n" +
            message
        );


        const submitBtn =
            getElement("submitPaymentBtn");

        if (submitBtn) {

            submitBtn.disabled = false;

            submitBtn.textContent =
                submitBtn.dataset.originalText ||
                "Tuma Ombi la Malipo";
        }
    }
}


/* =========================================================
   4.3 - PAYMENT METHOD LOOKUP
========================================================= */

function pataPaymentMethod(methodKey) {

    if (!methodKey) {
        return null;
    }


    if (
        typeof PAYMENT_METHODS ===
        "undefined"
    ) {

        return null;
    }


    return (
        PAYMENT_METHODS[methodKey] ||
        null
    );
}


/* =========================================================
   4.4 - CREATE USER NOTIFICATION
========================================================= */

async function tengenezaNotification(
    uid,
    data = {}
) {

    try {

        if (!uid) {
            return;
        }


        const notificationRef =
            db
                .collection("notifications")
                .doc();


        await notificationRef.set({

            uid: uid,

            title:
                data.title ||
                "RoomRent",

            message:
                data.message ||
                "",

            type:
                data.type ||
                "general",

            bookingNumber:
                data.bookingNumber ||
                null,

            read: false,

            createdAt:
                serverTimestamp()
        });


    } catch (error) {

        console.error(
            "Notification error:",
            error
        );
    }
}


/* =========================================================
   4.5 - MARK NOTIFICATION AS READ
========================================================= */

async function somaNotification(
    notificationId
) {

    try {

        if (!currentUser) {
            return;
        }

        if (!notificationId) {
            return;
        }


        await db
            .collection("notifications")
            .doc(notificationId)
            .update({

                read: true,

                readAt:
                    serverTimestamp()
            });


    } catch (error) {

        console.error(
            "somaNotification ERROR:",
            error
        );
    }
}


/* =========================================================
   4.6 - LOAD USER NOTIFICATIONS
========================================================= */

function anzishaNotificationsListener() {

    if (!currentUser) {
        return;
    }


    /* Ondoa listener ya zamani */

    if (
        typeof unsubscribeNotifications ===
        "function"
    ) {

        try {

            unsubscribeNotifications();

        } catch (e) {}

    }


    unsubscribeNotifications =
        db
            .collection("notifications")
            .where(
                "uid",
                "==",
                currentUser.uid
            )
            .onSnapshot(

                function (snapshot) {

                    const notifications =
                        [];


                    snapshot.forEach(
                        function (doc) {

                            notifications.push({

                                id: doc.id,

                                ...doc.data()

                            });

                        }
                    );


                    notifications.sort(
                        function (a, b) {

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


                    window.roomRentNotifications =
                        notifications;


                    onyeshaNotificationCount(
                        notifications
                    );


                    if (
                        typeof window
                            .renderRoomRentNotifications ===
                        "function"
                    ) {

                        window
                            .renderRoomRentNotifications(
                                notifications
                            );
                    }

                },

                function (error) {

                    console.error(
                        "Notifications listener error:",
                        error
                    );
                }
            );
}


/* =========================================================
   4.7 - NOTIFICATION COUNT
========================================================= */

function onyeshaNotificationCount(
    notifications = []
) {

    const unread =
        notifications.filter(
            function (item) {

                return item.read !== true;

            }
        ).length;


    const possibleIds = [

        "notificationCount",

        "taarifaCount",

        "unreadNotifications",

        "taarifaBadge"

    ];


    possibleIds.forEach(
        function (id) {

            const el =
                getElement(id);

            if (!el) {
                return;
            }


            if (unread > 0) {

                el.textContent =
                    unread > 99
                        ? "99+"
                        : String(unread);

                el.style.display =
                    "inline-flex";

            } else {

                el.textContent =
                    "";

                el.style.display =
                    "none";
            }

        }
    );
}


/* =========================================================
   4.8 - OPEN NOTIFICATIONS
========================================================= */

function funguaTaarifa() {

    if (!requireLogin()) {
        return;
    }


    clearMainSections();


    const section =
        getElement("taarifaSection");

    if (!section) {

        console.warn(
            "taarifaSection haipo kwenye HTML."
        );

        return;
    }


    section.style.display =
        "block";


    const notifications =
        window.roomRentNotifications ||
        [];


    if (!notifications.length) {

        section.innerHTML = `

            <div class="roomrent-empty-box">

                <h2>🔔 Taarifa</h2>

                <p>
                    Huna taarifa mpya kwa sasa.
                </p>

            </div>
        `;

        return;
    }


    let html = `

        <div class="roomrent-notifications">

            <h2>🔔 Taarifa Zako</h2>

    `;


    notifications.forEach(
        function (notification) {

            const unread =
                notification.read !== true;


            html += `

                <div
                    class="notification-item ${
                        unread
                            ? "notification-unread"
                            : ""
                    }"
                    data-notification-id="${
                        escapeHTML(
                            notification.id
                        )
                    }"
                >

                    <div>

                        <strong>
                            ${escapeHTML(
                                notification.title ||
                                "RoomRent"
                            )}
                        </strong>

                        <p>
                            ${escapeHTML(
                                notification.message ||
                                ""
                            )}
                        </p>

                    </div>

                    ${
                        unread
                            ? `
                                <button
                                    type="button"
                                    class="mark-notification-read"
                                    data-id="${
                                        escapeHTML(
                                            notification.id
                                        )
                                    }"
                                >
                                    ✓ Soma
                                </button>
                            `
                            : `
                                <span>
                                    Imesomwa
                                </span>
                            `
                    }

                </div>

            `;

        }
    );


    html += `

        </div>
    `;


    section.innerHTML =
        html;


    section
        .querySelectorAll(
            ".mark-notification-read"
        )
        .forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    async function () {

                        const id =
                            button.dataset.id;

                        await somaNotification(
                            id
                        );

                    }
                );

            }
        );
}


/* =========================================================
   4.9 - PAYMENT SUBMISSION MESSAGE
========================================================= */

function onyeshaBookingSuccess(
    bookingNumber
) {

    const section =
        getElement("fomuKodi");

    if (!section) {
        return;
    }


    section.innerHTML = `

        <div class="roomrent-success-box">

            <h2>✅ Booking Imetumwa</h2>

            <p>
                Booking yako imepokelewa.
            </p>

            <p>
                <strong>Booking Number:</strong>
                ${escapeHTML(bookingNumber)}
            </p>

            <p>
                Subiri Admin athibitishe malipo.
            </p>

        </div>
    `;
}


/* =========================================================
   4.10 - PAYMENT METHOD DISPLAY HELPER
========================================================= */

function onyeshaPaymentMethodInfo() {

    const selected =
        chaguaPaymentMethod();


    const info =
        getElement("paymentMethodInfo");


    if (!info) {
        return;
    }


    const method =
        pataPaymentMethod(selected);


    if (!method) {

        info.innerHTML = "";

        return;
    }


    info.innerHTML = `

        <div class="payment-info-box">

            <strong>
                ${escapeHTML(
                    method.name ||
                    selected
                )}
            </strong>

            <br>

            Namba ya kupokea:
            <strong>
                ${escapeHTML(
                    method.number ||
                    ""
                )}
            </strong>

            ${
                method.receiver
                    ? `
                        <br>
                        Jina:
                        <strong>
                            ${escapeHTML(
                                method.receiver
                            )}
                        </strong>
                    `
                    : ""
            }

        </div>
    `;
}


/* =========================================================
   4.11 - PAYMENT RADIO EVENT LISTENER
========================================================= */

function anzishaPaymentMethodListeners() {

    const radios =
        document.querySelectorAll(
            'input[name="paymentMethod"]'
        );


    radios.forEach(
        function (radio) {

            radio.addEventListener(
                "change",
                function () {

                    onyeshaPaymentMethodInfo();

                }
            );

        }
    );


    onyeshaPaymentMethodInfo();
}


/* =========================================================
   4.12 - SAFE BOOKING DATA RELOAD
========================================================= */

async function pataBooking(
    bookingNumber
) {

    try {

        if (!bookingNumber) {
            return null;
        }


        const snapshot =
            await db
                .collection("bookings")
                .doc(bookingNumber)
                .get();


        if (!snapshot.exists) {
            return null;
        }


        const data =
            snapshot.data();


        /* -----------------------------------------
           USER HAWEZI KUFANYA ACCESS YA BOOKING
           YA MTU MWINGINE
        ----------------------------------------- */

        if (
            currentUser &&
            data.uid !== currentUser.uid &&
            !isAdmin
        ) {

            return null;
        }


        return {

            id: snapshot.id,

            ...data

        };


    } catch (error) {

        console.error(
            "pataBooking ERROR:",
            error
        );

        return null;
    }
}


/* =========================================================
   4.13 - FORMAT BOOKING STATUS
========================================================= */

function formatBookingStatus(status) {

    const statuses = {

        payment_pending:
            "⏳ Inasubiri uthibitisho wa malipo",

        confirmed:
            "✅ Imethibitishwa",

        rejected:
            "❌ Imekataliwa",

        completed:
            "🏁 Imekamilika",

        cancelled:
            "🚫 Imeghairiwa"

    };


    return (
        statuses[status] ||
        status ||
        "Haijulikani"
    );
}


/* =========================================================
   4.14 - FORMAT FIRESTORE DATE
========================================================= */

function formatFirestoreDate(value) {

    if (!value) {
        return "-";
    }


    try {

        let date;


        if (
            value &&
            typeof value.toDate ===
            "function"
        ) {

            date =
                value.toDate();

        } else if (
            value instanceof Date
        ) {

            date =
                value;

        } else {

            date =
                new Date(value);
        }


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return "-";
        }


        return date.toLocaleString(
            "sw-TZ",
            {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit"
            }
        );


    } catch (error) {

        return "-";
    }
}


/* =========================================================
   4.15 - DEBUG BOOKING
========================================================= */

window.debugRoomRentBooking =
    async function (bookingNumber) {

        const booking =
            await pataBooking(
                bookingNumber
            );


        console.log(
            "ROOMRENT BOOKING:",
            booking
        );


        return booking;
    };


/* =========================================================
   4.16 - EXPOSE FUNCTIONS
========================================================= */

window.tumaOmbiLaMalipo =
    tumaOmbiLaMalipo;

window.tengenezaNotification =
    tengenezaNotification;

window.funguaTaarifa =
    funguaTaarifa;

window.somaNotification =
    somaNotification;

window.pataBooking =
    pataBooking;

window.formatBookingStatus =
    formatBookingStatus;

window.formatFirestoreDate =
    formatFirestoreDate;


/* =========================================================
   MWISHO WA SEHEMU YA 4
========================================================= */
/* =========================================================
   ROOMRENT - SEHEMU YA 5
   BOOKING ZANGU + FIRESTORE REALTIME
   =========================================================

   MUHIMU:
   - Inaonyesha booking zote za mteja aliyeingia.
   - Hakuna kuzuia booking zinazojirudia.
   - Booking ya chumba kilekile inaweza kufanyika mara nyingi.
   - Kila booking ina bookingNumber yake.
   - Data inatoka Firestore.
   - Hakuna localStorage.
   ========================================================= */


/* =========================================================
   5.1 - OPEN BOOKING ZANGU
========================================================= */

function funguaBookingZangu() {

    if (!requireLogin()) {
        return;
    }


    clearMainSections();


    const section =
        getElement("bookingList");


    if (!section) {

        console.warn(
            "bookingList haipo kwenye HTML."
        );

        return;
    }


    section.style.display =
        "block";


    section.innerHTML = `

        <div class="roomrent-loading-box">

            <h2>📋 Booking Zangu</h2>

            <p>
                Inapakia booking zako...
            </p>

        </div>

    `;


    anzishaBookingsListener();
}


/* =========================================================
   5.2 - FIRESTORE BOOKINGS REALTIME LISTENER
========================================================= */

function anzishaBookingsListener() {

    if (!currentUser) {
        return;
    }


    /* -----------------------------------------
       ONDOA LISTENER YA ZAMANI
    ----------------------------------------- */

    if (
        typeof unsubscribeBookings ===
        "function"
    ) {

        try {

            unsubscribeBookings();

        } catch (error) {

            console.warn(
                "Old booking listener:",
                error
            );
        }

    }


    /* -----------------------------------------
       FIRESTORE QUERY
       
       Tunatumia WHERE pekee.
       Sorting tutafanya JavaScript ili
       kupunguza uwezekano wa kuhitaji
       composite index.
    ----------------------------------------- */

    unsubscribeBookings =
        db
            .collection("bookings")
            .where(
                "uid",
                "==",
                currentUser.uid
            )
            .onSnapshot(

                function (snapshot) {

                    const bookings = [];


                    snapshot.forEach(
                        function (doc) {

                            bookings.push({

                                id: doc.id,

                                ...doc.data()

                            });

                        }
                    );


                    /* ---------------------------------
                       SORT BY CREATED DATE
                    --------------------------------- */

                    bookings.sort(
                        function (a, b) {

                            const aTime =
                                a.createdAt &&
                                typeof a.createdAt.toMillis ===
                                "function"
                                    ? a.createdAt.toMillis()
                                    : 0;


                            const bTime =
                                b.createdAt &&
                                typeof b.createdAt.toMillis ===
                                "function"
                                    ? b.createdAt.toMillis()
                                    : 0;


                            return bTime - aTime;

                        }
                    );


                    /* ---------------------------------
                       SAVE TEMPORARILY IN MEMORY
                    --------------------------------- */

                    window.roomRentBookings =
                        bookings;


                    /* ---------------------------------
                       DISPLAY
                    --------------------------------- */

                    onyeshaBookingZangu(
                        bookings
                    );

                },

                function (error) {

                    console.error(
                        "Bookings listener error:",
                        error
                    );


                    const section =
                        getElement("bookingList");


                    if (!section) {
                        return;
                    }


                    section.innerHTML = `

                        <div class="roomrent-error-box">

                            <h2>⚠️ Hitilafu</h2>

                            <p>
                                Imeshindikana kupata
                                booking zako.
                            </p>

                            <small>
                                ${escapeHTML(
                                    firebaseErrorMessage(
                                        error
                                    )
                                )}
                            </small>

                        </div>

                    `;
                }
            );
}


/* =========================================================
   5.3 - DISPLAY ALL USER BOOKINGS
========================================================= */

function onyeshaBookingZangu(
    bookings = []
) {

    const section =
        getElement("bookingList");


    if (!section) {
        return;
    }


    if (!bookings.length) {

        section.innerHTML = `

            <div class="roomrent-empty-box">

                <h2>📋 Booking Zangu</h2>

                <p>
                    Bado hujafanya booking yoyote.
                </p>

                <button
                    type="button"
                    id="goToRoomsFromBookings"
                >
                    🏠 Angalia Vyumba
                </button>

            </div>

        `;


        const roomsBtn =
            getElement(
                "goToRoomsFromBookings"
            );


        if (roomsBtn) {

            roomsBtn.onclick =
                function () {

                    onyeshaVyumba();

                };
        }


        return;
    }


    let html = `

        <div class="roomrent-bookings-wrapper">

            <div class="booking-header">

                <h2>
                    📋 Booking Zangu
                </h2>

                <p>
                    Jumla ya booking:
                    <strong>
                        ${bookings.length}
                    </strong>
                </p>

            </div>

    `;


    bookings.forEach(
        function (booking, index) {

            html +=
                tengenezaBookingCard(
                    booking,
                    index
                );

        }
    );


    html += `

        </div>

    `;


    section.innerHTML =
        html;


    /* -----------------------------------------
       DETAILS BUTTONS
    ----------------------------------------- */

    section
        .querySelectorAll(
            ".booking-details-btn"
        )
        .forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        const bookingNumber =
                            button.dataset.booking;

                        funguaBookingDetails(
                            bookingNumber
                        );

                    }
                );

            }
        );


    /* -----------------------------------------
       ROOMS BUTTON
    ----------------------------------------- */

    const roomsBtn =
        getElement(
            "goToRoomsFromBookingList"
        );


    if (roomsBtn) {

        roomsBtn.onclick =
            function () {

                onyeshaVyumba();

            };
    }
}


/* =========================================================
   5.4 - CREATE BOOKING CARD
========================================================= */

function tengenezaBookingCard(
    booking,
    index = 0
) {

    const bookingNumber =
        booking.bookingNumber ||
        booking.id ||
        "-";


    const roomNumber =
        booking.roomNumber ||
        "-";


    const roomName =
        booking.roomName ||
        `Chumba ${roomNumber}`;


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


    const durationDays =
        Number(
            booking.durationDays ||
            booking.days ||
            ROOMRENT_SETTINGS.durationDays
        );


    const totalProfit =
        Number(
            booking.totalProfit ||
            hesabuFaida(
                profitPerDay,
                durationDays
            )
        );


    const totalProfitPaid =
        Number(
            booking.totalProfitPaid ||
            0
        );


    const profitDaysPaid =
        Number(
            booking.profitDaysPaid ||
            0
        );


    const status =
        booking.status ||
        "payment_pending";


    const statusText =
        formatBookingStatus(
            status
        );


    const createdAt =
        formatFirestoreDate(
            booking.createdAt
        );


    const confirmedAt =
        formatFirestoreDate(
            booking.confirmedAt
        );


    const paymentMethod =
        booking.paymentMethodName ||
        booking.paymentMethod ||
        "-";


    const paymentReference =
        booking.paymentReference ||
        "-";


    const cardClass =
        status === "confirmed"
            ? "booking-confirmed"
            : status === "rejected"
                ? "booking-rejected"
                : status === "completed"
                    ? "booking-completed"
                    : "booking-pending";


    return `

        <div
            class="
                roomrent-booking-card
                ${cardClass}
            "
        >

            <div class="booking-card-top">

                <div>

                    <span>
                        Booking #${index + 1}
                    </span>

                    <h3>
                        ${escapeHTML(
                            roomName
                        )}
                    </h3>

                </div>

                <strong>
                    ${escapeHTML(
                        statusText
                    )}
                </strong>

            </div>


            <hr>


            <div class="booking-info-grid">

                <div>

                    <small>
                        Booking Number
                    </small>

                    <strong>
                        ${escapeHTML(
                            bookingNumber
                        )}
                    </strong>

                </div>


                <div>

                    <small>
                        Chumba
                    </small>

                    <strong>
                        ${escapeHTML(
                            roomNumber
                        )}
                    </strong>

                </div>


                <div>

                    <small>
                        Kiasi
                    </small>

                    <strong>
                        ${formatMoney(
                            amount
                        )}
                    </strong>

                </div>


                <div>

                    <small>
                        Faida kwa siku
                    </small>

                    <strong>
                        ${formatMoney(
                            profitPerDay
                        )}
                    </strong>

                </div>


                <div>

                    <small>
                        Muda
                    </small>

                    <strong>
                        ${durationDays} siku
                    </strong>

                </div>


                <div>

                    <small>
                        Faida yote
                    </small>

                    <strong>
                        ${formatMoney(
                            totalProfit
                        )}
                    </strong>

                </div>

            </div>


            ${
                status === "confirmed" ||
                status === "completed"

                    ? `

                        <div class="booking-profit-progress">

                            <p>
                                <strong>
                                    Faida iliyolipwa:
                                </strong>

                                ${formatMoney(
                                    totalProfitPaid
                                )}
                            </p>

                            <p>
                                <strong>
                                    Siku zilizolipwa:
                                </strong>

                                ${profitDaysPaid}
                                /
                                ${durationDays}
                            </p>

                        </div>

                    `

                    : ""
            }


            <div class="booking-payment-info">

                <p>

                    <strong>
                        Njia ya malipo:
                    </strong>

                    ${escapeHTML(
                        paymentMethod
                    )}

                </p>


                <p>

                    <strong>
                        Rejea ya malipo:
                    </strong>

                    ${escapeHTML(
                        paymentReference
                    )}

                </p>

            </div>


            <div class="booking-date-info">

                <p>

                    <strong>
                        Iliombwa:
                    </strong>

                    ${escapeHTML(
                        createdAt
                    )}

                </p>


                ${
                    booking.confirmedAt

                        ? `

                            <p>

                                <strong>
                                    Imethibitishwa:
                                </strong>

                                ${escapeHTML(
                                    confirmedAt
                                )}

                            </p>

                        `

                        : ""
                }

            </div>


            <div class="booking-card-actions">

                <button
                    type="button"
                    class="booking-details-btn"
                    data-booking="${escapeHTML(
                        bookingNumber
                    )}"
                >
                    👁️ Angalia Maelezo
                </button>

            </div>

        </div>

    `;
}


/* =========================================================
   5.5 - BOOKING DETAILS
========================================================= */

async function funguaBookingDetails(
    bookingNumber
) {

    if (!requireLogin()) {
        return;
    }


    if (!bookingNumber) {
        return;
    }


    const booking =
        await pataBooking(
            bookingNumber
        );


    if (!booking) {

        alert(
            "Booking haijapatikana."
        );

        return;
    }


    const section =
        getElement("bookingList");


    if (!section) {
        return;
    }


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


    const durationDays =
        Number(
            booking.durationDays ||
            booking.days ||
            ROOMRENT_SETTINGS.durationDays
        );


    const totalProfit =
        Number(
            booking.totalProfit ||
            hesabuFaida(
                profitPerDay,
                durationDays
            )
        );


    const totalPayout =
        Number(
            booking.totalPayout ||
            hesabuJumla(
                amount,
                totalProfit
            )
        );


    const totalProfitPaid =
        Number(
            booking.totalProfitPaid ||
            0
        );


    const profitDaysPaid =
        Number(
            booking.profitDaysPaid ||
            0
        );


    section.innerHTML = `

        <div class="roomrent-booking-details">

            <button
                type="button"
                id="backToBookingsList"
            >
                ← Rudi Booking Zangu
            </button>


            <h2>
                📄 Maelezo ya Booking
            </h2>


            <div class="booking-detail-box">

                <h3>
                    ${escapeHTML(
                        booking.roomName ||
                        `Chumba ${
                            booking.roomNumber ||
                            ""
                        }`
                    )}
                </h3>


                <p>

                    <strong>
                        Booking Number:
                    </strong>

                    ${escapeHTML(
                        booking.bookingNumber ||
                        booking.id ||
                        "-"
                    )}

                </p>


                <p>

                    <strong>
                        Namba ya Chumba:
                    </strong>

                    ${escapeHTML(
                        booking.roomNumber ||
                        "-"
                    )}

                </p>


                <p>

                    <strong>
                        Jina la mpangaji:
                    </strong>

                    ${escapeHTML(
                        booking.customerName ||
                        "-"
                    )}

                </p>


                <p>

                    <strong>
                        Simu:
                    </strong>

                    ${escapeHTML(
                        booking.customerPhone ||
                        "-"
                    )}

                </p>


                <hr>


                <p>

                    <strong>
                        Bei ya booking:
                    </strong>

                    ${formatMoney(
                        amount
                    )}

                </p>


                <p>

                    <strong>
                        Faida kwa siku:
                    </strong>

                    ${formatMoney(
                        profitPerDay
                    )}

                </p>


                <p>

                    <strong>
                        Muda:
                    </strong>

                    ${durationDays}
                    siku

                </p>


                <p>

                    <strong>
                        Faida yote:
                    </strong>

                    ${formatMoney(
                        totalProfit
                    )}

                </p>


                <p>

                    <strong>
                        Jumla ya malipo:
                    </strong>

                    ${formatMoney(
                        totalPayout
                    )}

                </p>


                <hr>


                <p>

                    <strong>
                        Hali:
                    </strong>

                    ${escapeHTML(
                        formatBookingStatus(
                            booking.status
                        )
                    )}

                </p>


                <p>

                    <strong>
                        Siku za faida zilizolipwa:
                    </strong>

                    ${profitDaysPaid}
                    /
                    ${durationDays}

                </p>


                <p>

                    <strong>
                        Faida iliyolipwa:
                    </strong>

                    ${formatMoney(
                        totalProfitPaid
                    )}

                </p>


                <hr>


                <p>

                    <strong>
                        Njia ya malipo:
                    </strong>

                    ${escapeHTML(
                        booking.paymentMethodName ||
                        booking.paymentMethod ||
                        "-"
                    )}

                </p>


                <p>

                    <strong>
                        Namba iliyotuma:
                    </strong>

                    ${escapeHTML(
                        booking.paymentSenderPhone ||
                        "-"
                    )}

                </p>


                <p>

                    <strong>
                        Rejea ya muamala:
                    </strong>

                    ${escapeHTML(
                        booking.paymentReference ||
                        "-"
                    )}

                </p>


                <hr>


                <p>

                    <strong>
                        Tarehe ya booking:
                    </strong>

                    ${escapeHTML(
                        formatFirestoreDate(
                            booking.createdAt
                        )
                    )}

                </p>


                ${
                    booking.confirmedAt

                        ? `

                            <p>

                                <strong>
                                    Tarehe ya uthibitisho:
                                </strong>

                                ${escapeHTML(
                                    formatFirestoreDate(
                                        booking.confirmedAt
                                    )
                                )}

                            </p>

                        `

                        : ""
                }

            </div>

        </div>

    `;


    const backButton =
        getElement(
            "backToBookingsList"
        );


    if (backButton) {

        backButton.onclick =
            function () {

                onyeshaBookingZangu(
                    window.roomRentBookings ||
                    []
                );

            };
    }
}


/* =========================================================
   5.6 - BOOKING LIST CLEANUP
========================================================= */

function simamishaBookingsListener() {

    if (
        typeof unsubscribeBookings ===
        "function"
    ) {

        try {

            unsubscribeBookings();

        } catch (error) {

            console.warn(
                "Booking listener cleanup:",
                error
            );

        }

    }


    unsubscribeBookings =
        null;
}


/* =========================================================
   5.7 - USER LOGOUT CLEANUP
========================================================= */

function safishaBookingData() {

    simamishaBookingsListener();


    window.roomRentBookings =
        [];


    selectedRoom =
        null;
}


/* =========================================================
   5.8 - EXPOSE FUNCTIONS
========================================================= */

window.funguaBookingZangu =
    funguaBookingZangu;

window.anzishaBookingsListener =
    anzishaBookingsListener;

window.onyeshaBookingZangu =
    onyeshaBookingZangu;

window.funguaBookingDetails =
    funguaBookingDetails;

window.tengenezaBookingCard =
    tengenezaBookingCard;

window.simamishaBookingsListener =
    simamishaBookingsListener;

window.safishaBookingData =
    safishaBookingData;


/* =========================================================
   MWISHO WA SEHEMU YA 5
========================================================= *//* =========================================================
   ROOMRENT - SEHEMU YA 5
   BOOKING ZANGU + FIRESTORE REALTIME
   =========================================================

   MUHIMU:
   - Inaonyesha booking zote za mteja aliyeingia.
   - Hakuna kuzuia booking zinazojirudia.
   - Booking ya chumba kilekile inaweza kufanyika mara nyingi.
   - Kila booking ina bookingNumber yake.
   - Data inatoka Firestore.
   - Hakuna localStorage.
   ========================================================= */


/* =========================================================
   5.1 - OPEN BOOKING ZANGU
========================================================= */

function funguaBookingZangu() {

    if (!requireLogin()) {
        return;
    }


    clearMainSections();


    const section =
        getElement("bookingList");


    if (!section) {

        console.warn(
            "bookingList haipo kwenye HTML."
        );

        return;
    }


    section.style.display =
        "block";


    section.innerHTML = `

        <div class="roomrent-loading-box">

            <h2>📋 Booking Zangu</h2>

            <p>
                Inapakia booking zako...
            </p>

        </div>

    `;


    anzishaBookingsListener();
}


/* =========================================================
   5.2 - FIRESTORE BOOKINGS REALTIME LISTENER
========================================================= */

function anzishaBookingsListener() {

    if (!currentUser) {
        return;
    }


    /* -----------------------------------------
       ONDOA LISTENER YA ZAMANI
    ----------------------------------------- */

    if (
        typeof unsubscribeBookings ===
        "function"
    ) {

        try {

            unsubscribeBookings();

        } catch (error) {

            console.warn(
                "Old booking listener:",
                error
            );
        }

    }


    /* -----------------------------------------
       FIRESTORE QUERY
       
       Tunatumia WHERE pekee.
       Sorting tutafanya JavaScript ili
       kupunguza uwezekano wa kuhitaji
       composite index.
    ----------------------------------------- */

    unsubscribeBookings =
        db
            .collection("bookings")
            .where(
                "uid",
                "==",
                currentUser.uid
            )
            .onSnapshot(

                function (snapshot) {

                    const bookings = [];


                    snapshot.forEach(
                        function (doc) {

                            bookings.push({

                                id: doc.id,

                                ...doc.data()

                            });

                        }
                    );


                    /* ---------------------------------
                       SORT BY CREATED DATE
                    --------------------------------- */

                    bookings.sort(
                        function (a, b) {

                            const aTime =
                                a.createdAt &&
                                typeof a.createdAt.toMillis ===
                                "function"
                                    ? a.createdAt.toMillis()
                                    : 0;


                            const bTime =
                                b.createdAt &&
                                typeof b.createdAt.toMillis ===
                                "function"
                                    ? b.createdAt.toMillis()
                                    : 0;


                            return bTime - aTime;

                        }
                    );


                    /* ---------------------------------
                       SAVE TEMPORARILY IN MEMORY
                    --------------------------------- */

                    window.roomRentBookings =
                        bookings;


                    /* ---------------------------------
                       DISPLAY
                    --------------------------------- */

                    onyeshaBookingZangu(
                        bookings
                    );

                },

                function (error) {

                    console.error(
                        "Bookings listener error:",
                        error
                    );


                    const section =
                        getElement("bookingList");


                    if (!section) {
                        return;
                    }


                    section.innerHTML = `

                        <div class="roomrent-error-box">

                            <h2>⚠️ Hitilafu</h2>

                            <p>
                                Imeshindikana kupata
                                booking zako.
                            </p>

                            <small>
                                ${escapeHTML(
                                    firebaseErrorMessage(
                                        error
                                    )
                                )}
                            </small>

                        </div>

                    `;
                }
            );
}


/* =========================================================
   5.3 - DISPLAY ALL USER BOOKINGS
========================================================= */

function onyeshaBookingZangu(
    bookings = []
) {

    const section =
        getElement("bookingList");


    if (!section) {
        return;
    }


    if (!bookings.length) {

        section.innerHTML = `

            <div class="roomrent-empty-box">

                <h2>📋 Booking Zangu</h2>

                <p>
                    Bado hujafanya booking yoyote.
                </p>

                <button
                    type="button"
                    id="goToRoomsFromBookings"
                >
                    🏠 Angalia Vyumba
                </button>

            </div>

        `;


        const roomsBtn =
            getElement(
                "goToRoomsFromBookings"
            );


        if (roomsBtn) {

            roomsBtn.onclick =
                function () {

                    onyeshaVyumba();

                };
        }


        return;
    }


    let html = `

        <div class="roomrent-bookings-wrapper">

            <div class="booking-header">

                <h2>
                    📋 Booking Zangu
                </h2>

                <p>
                    Jumla ya booking:
                    <strong>
                        ${bookings.length}
                    </strong>
                </p>

            </div>

    `;


    bookings.forEach(
        function (booking, index) {

            html +=
                tengenezaBookingCard(
                    booking,
                    index
                );

        }
    );


    html += `

        </div>

    `;


    section.innerHTML =
        html;


    /* -----------------------------------------
       DETAILS BUTTONS
    ----------------------------------------- */

    section
        .querySelectorAll(
            ".booking-details-btn"
        )
        .forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        const bookingNumber =
                            button.dataset.booking;

                        funguaBookingDetails(
                            bookingNumber
                        );

                    }
                );

            }
        );


    /* -----------------------------------------
       ROOMS BUTTON
    ----------------------------------------- */

    const roomsBtn =
        getElement(
            "goToRoomsFromBookingList"
        );


    if (roomsBtn) {

        roomsBtn.onclick =
            function () {

                onyeshaVyumba();

            };
    }
}


/* =========================================================
   5.4 - CREATE BOOKING CARD
========================================================= */

function tengenezaBookingCard(
    booking,
    index = 0
) {

    const bookingNumber =
        booking.bookingNumber ||
        booking.id ||
        "-";


    const roomNumber =
        booking.roomNumber ||
        "-";


    const roomName =
        booking.roomName ||
        `Chumba ${roomNumber}`;


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


    const durationDays =
        Number(
            booking.durationDays ||
            booking.days ||
            ROOMRENT_SETTINGS.durationDays
        );


    const totalProfit =
        Number(
            booking.totalProfit ||
            hesabuFaida(
                profitPerDay,
                durationDays
            )
        );


    const totalProfitPaid =
        Number(
            booking.totalProfitPaid ||
            0
        );


    const profitDaysPaid =
        Number(
            booking.profitDaysPaid ||
            0
        );


    const status =
        booking.status ||
        "payment_pending";


    const statusText =
        formatBookingStatus(
            status
        );


    const createdAt =
        formatFirestoreDate(
            booking.createdAt
        );


    const confirmedAt =
        formatFirestoreDate(
            booking.confirmedAt
        );


    const paymentMethod =
        booking.paymentMethodName ||
        booking.paymentMethod ||
        "-";


    const paymentReference =
        booking.paymentReference ||
        "-";


    const cardClass =
        status === "confirmed"
            ? "booking-confirmed"
            : status === "rejected"
                ? "booking-rejected"
                : status === "completed"
                    ? "booking-completed"
                    : "booking-pending";


    return `

        <div
            class="
                roomrent-booking-card
                ${cardClass}
            "
        >

            <div class="booking-card-top">

                <div>

                    <span>
                        Booking #${index + 1}
                    </span>

                    <h3>
                        ${escapeHTML(
                            roomName
                        )}
                    </h3>

                </div>

                <strong>
                    ${escapeHTML(
                        statusText
                    )}
                </strong>

            </div>


            <hr>


            <div class="booking-info-grid">

                <div>

                    <small>
                        Booking Number
                    </small>

                    <strong>
                        ${escapeHTML(
                            bookingNumber
                        )}
                    </strong>

                </div>


                <div>

                    <small>
                        Chumba
                    </small>

                    <strong>
                        ${escapeHTML(
                            roomNumber
                        )}
                    </strong>

                </div>


                <div>

                    <small>
                        Kiasi
                    </small>

                    <strong>
                        ${formatMoney(
                            amount
                        )}
                    </strong>

                </div>


                <div>

                    <small>
                        Faida kwa siku
                    </small>

                    <strong>
                        ${formatMoney(
                            profitPerDay
                        )}
                    </strong>

                </div>


                <div>

                    <small>
                        Muda
                    </small>

                    <strong>
                        ${durationDays} siku
                    </strong>

                </div>


                <div>

                    <small>
                        Faida yote
                    </small>

                    <strong>
                        ${formatMoney(
                            totalProfit
                        )}
                    </strong>

                </div>

            </div>


            ${
                status === "confirmed" ||
                status === "completed"

                    ? `

                        <div class="booking-profit-progress">

                            <p>
                                <strong>
                                    Faida iliyolipwa:
                                </strong>

                                ${formatMoney(
                                    totalProfitPaid
                                )}
                            </p>

                            <p>
                                <strong>
                                    Siku zilizolipwa:
                                </strong>

                                ${profitDaysPaid}
                                /
                                ${durationDays}
                            </p>

                        </div>

                    `

                    : ""
            }


            <div class="booking-payment-info">

                <p>

                    <strong>
                        Njia ya malipo:
                    </strong>

                    ${escapeHTML(
                        paymentMethod
                    )}

                </p>


                <p>

                    <strong>
                        Rejea ya malipo:
                    </strong>

                    ${escapeHTML(
                        paymentReference
                    )}

                </p>

            </div>


            <div class="booking-date-info">

                <p>

                    <strong>
                        Iliombwa:
                    </strong>

                    ${escapeHTML(
                        createdAt
                    )}

                </p>


                ${
                    booking.confirmedAt

                        ? `

                            <p>

                                <strong>
                                    Imethibitishwa:
                                </strong>

                                ${escapeHTML(
                                    confirmedAt
                                )}

                            </p>

                        `

                        : ""
                }

            </div>


            <div class="booking-card-actions">

                <button
                    type="button"
                    class="booking-details-btn"
                    data-booking="${escapeHTML(
                        bookingNumber
                    )}"
                >
                    👁️ Angalia Maelezo
                </button>

            </div>

        </div>

    `;
}


/* =========================================================
   5.5 - BOOKING DETAILS
========================================================= */

async function funguaBookingDetails(
    bookingNumber
) {

    if (!requireLogin()) {
        return;
    }


    if (!bookingNumber) {
        return;
    }


    const booking =
        await pataBooking(
            bookingNumber
        );


    if (!booking) {

        alert(
            "Booking haijapatikana."
        );

        return;
    }


    const section =
        getElement("bookingList");


    if (!section) {
        return;
    }


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


    const durationDays =
        Number(
            booking.durationDays ||
            booking.days ||
            ROOMRENT_SETTINGS.durationDays
        );


    const totalProfit =
        Number(
            booking.totalProfit ||
            hesabuFaida(
                profitPerDay,
                durationDays
            )
        );


    const totalPayout =
        Number(
            booking.totalPayout ||
            hesabuJumla(
                amount,
                totalProfit
            )
        );


    const totalProfitPaid =
        Number(
            booking.totalProfitPaid ||
            0
        );


    const profitDaysPaid =
        Number(
            booking.profitDaysPaid ||
            0
        );


    section.innerHTML = `

        <div class="roomrent-booking-details">

            <button
                type="button"
                id="backToBookingsList"
            >
                ← Rudi Booking Zangu
            </button>


            <h2>
                📄 Maelezo ya Booking
            </h2>


            <div class="booking-detail-box">

                <h3>
                    ${escapeHTML(
                        booking.roomName ||
                        `Chumba ${
                            booking.roomNumber ||
                            ""
                        }`
                    )}
                </h3>


                <p>

                    <strong>
                        Booking Number:
                    </strong>

                    ${escapeHTML(
                        booking.bookingNumber ||
                        booking.id ||
                        "-"
                    )}

                </p>


                <p>

                    <strong>
                        Namba ya Chumba:
                    </strong>

                    ${escapeHTML(
                        booking.roomNumber ||
                        "-"
                    )}

                </p>


                <p>

                    <strong>
                        Jina la mpangaji:
                    </strong>

                    ${escapeHTML(
                        booking.customerName ||
                        "-"
                    )}

                </p>


                <p>

                    <strong>
                        Simu:
                    </strong>

                    ${escapeHTML(
                        booking.customerPhone ||
                        "-"
                    )}

                </p>


                <hr>


                <p>

                    <strong>
                        Bei ya booking:
                    </strong>

                    ${formatMoney(
                        amount
                    )}

                </p>


                <p>

                    <strong>
                        Faida kwa siku:
                    </strong>

                    ${formatMoney(
                        profitPerDay
                    )}

                </p>


                <p>

                    <strong>
                        Muda:
                    </strong>

                    ${durationDays}
                    siku

                </p>


                <p>

                    <strong>
                        Faida yote:
                    </strong>

                    ${formatMoney(
                        totalProfit
                    )}

                </p>


                <p>

                    <strong>
                        Jumla ya malipo:
                    </strong>

                    ${formatMoney(
                        totalPayout
                    )}

                </p>


                <hr>


                <p>

                    <strong>
                        Hali:
                    </strong>

                    ${escapeHTML(
                        formatBookingStatus(
                            booking.status
                        )
                    )}

                </p>


                <p>

                    <strong>
                        Siku za faida zilizolipwa:
                    </strong>

                    ${profitDaysPaid}
                    /
                    ${durationDays}

                </p>


                <p>

                    <strong>
                        Faida iliyolipwa:
                    </strong>

                    ${formatMoney(
                        totalProfitPaid
                    )}

                </p>


                <hr>


                <p>

                    <strong>
                        Njia ya malipo:
                    </strong>

                    ${escapeHTML(
                        booking.paymentMethodName ||
                        booking.paymentMethod ||
                        "-"
                    )}

                </p>


                <p>

                    <strong>
                        Namba iliyotuma:
                    </strong>

                    ${escapeHTML(
                        booking.paymentSenderPhone ||
                        "-"
                    )}

                </p>


                <p>

                    <strong>
                        Rejea ya muamala:
                    </strong>

                    ${escapeHTML(
                        booking.paymentReference ||
                        "-"
                    )}

                </p>


                <hr>


                <p>

                    <strong>
                        Tarehe ya booking:
                    </strong>

                    ${escapeHTML(
                        formatFirestoreDate(
                            booking.createdAt
                        )
                    )}

                </p>


                ${
                    booking.confirmedAt

                        ? `

                            <p>

                                <strong>
                                    Tarehe ya uthibitisho:
                                </strong>

                                ${escapeHTML(
                                    formatFirestoreDate(
                                        booking.confirmedAt
                                    )
                                )}

                            </p>

                        `

                        : ""
                }

            </div>

        </div>

    `;


    const backButton =
        getElement(
            "backToBookingsList"
        );


    if (backButton) {

        backButton.onclick =
            function () {

                onyeshaBookingZangu(
                    window.roomRentBookings ||
                    []
                );

            };
    }
}


/* =========================================================
   5.6 - BOOKING LIST CLEANUP
========================================================= */

function simamishaBookingsListener() {

    if (
        typeof unsubscribeBookings ===
        "function"
    ) {

        try {

            unsubscribeBookings();

        } catch (error) {

            console.warn(
                "Booking listener cleanup:",
                error
            );

        }

    }


    unsubscribeBookings =
        null;
}


/* =========================================================
   5.7 - USER LOGOUT CLEANUP
========================================================= */

function safishaBookingData() {

    simamishaBookingsListener();


    window.roomRentBookings =
        [];


    selectedRoom =
        null;
}


/* =========================================================
   5.8 - EXPOSE FUNCTIONS
========================================================= */

window.funguaBookingZangu =
    funguaBookingZangu;

window.anzishaBookingsListener =
    anzishaBookingsListener;

window.onyeshaBookingZangu =
    onyeshaBookingZangu;

window.funguaBookingDetails =
    funguaBookingDetails;

window.tengenezaBookingCard =
    tengenezaBookingCard;

window.simamishaBookingsListener =
    simamishaBookingsListener;

window.safishaBookingData =
    safishaBookingData;


/* =========================================================
   MWISHO WA SEHEMU YA 5
========================================================= */
/* =========================================================
   ROOMRENT - SEHEMU YA 6
   MAIN WALLET + PROFIT DISPLAY
   =========================================================

   MFUMO:
   - Wallet inasomwa kutoka Firestore.
   - Client HAIJIONGEZI balance yenyewe.
   - Profit haitolewi yote wakati wa confirmation.
   - Profit itahesabiwa kwa vipindi kamili vya saa 24.
   - Kuanza kwa profit = confirmedAt.
   - Maximum = siku 43.
   - Wallet financial updates zitafanywa na backend/
     Cloud Function yenye ruhusa ya server.
   ========================================================= */


/* =========================================================
   6.1 - OPEN MAIN WALLET
========================================================= */

async function funguaMainWallet() {

    if (!requireLogin()) {
        return;
    }


    clearMainSections();


    const section =
        getElement("mainWallet");


    if (!section) {

        console.warn(
            "mainWallet haipo kwenye HTML."
        );

        return;
    }


    section.style.display =
        "block";


    section.innerHTML = `

        <div class="roomrent-loading-box">

            <h2>💰 Main Wallet</h2>

            <p>
                Inapakia wallet yako...
            </p>

        </div>

    `;


    anzishaMainWalletListener();


    /*
       Backend profit processor itaongezwa
       kwenye Cloud Functions.

       Hatuongezi balance moja kwa moja
       kutoka browser.
    */

    await jaribuProcessProfitYaMtumiaji();


    await pakiaMainWalletMaraMoja();
}


/* =========================================================
   6.2 - FIRESTORE WALLET REALTIME LISTENER
========================================================= */

function anzishaMainWalletListener() {

    if (!currentUser) {
        return;
    }


    /* Ondoa listener ya zamani */

    if (
        typeof unsubscribeMainWallet ===
        "function"
    ) {

        try {

            unsubscribeMainWallet();

        } catch (error) {

            console.warn(
                "Old wallet listener:",
                error
            );

        }

    }


    unsubscribeMainWallet =
        db
            .collection("wallets")
            .doc(currentUser.uid)
            .onSnapshot(

                function (snapshot) {

                    let wallet;


                    if (snapshot.exists) {

                        wallet =
                            snapshot.data();

                    } else {

                        wallet = {

                            uid:
                                currentUser.uid,

                            balance: 0,

                            bookingEarnings: 0,

                            referralCommission: 0,

                            totalEarned: 0,

                            totalWithdrawn: 0,

                            pendingWithdrawal: 0

                        };

                    }


                    window.roomRentWallet =
                        wallet;


                    onyeshaMainWallet(
                        wallet
                    );

                },

                function (error) {

                    console.error(
                        "Wallet listener error:",
                        error
                    );


                    const section =
                        getElement(
                            "mainWallet"
                        );


                    if (!section) {
                        return;
                    }


                    section.innerHTML = `

                        <div class="roomrent-error-box">

                            <h2>
                                ⚠️ Hitilafu ya Wallet
                            </h2>

                            <p>
                                Imeshindikana kupata
                                taarifa za wallet.
                            </p>

                            <small>
                                ${escapeHTML(
                                    firebaseErrorMessage(
                                        error
                                    )
                                )}
                            </small>

                        </div>

                    `;
                }
            );
}


/* =========================================================
   6.3 - LOAD WALLET ONCE
========================================================= */

async function pakiaMainWalletMaraMoja() {

    if (!currentUser) {
        return null;
    }


    try {

        const snapshot =
            await db
                .collection("wallets")
                .doc(currentUser.uid)
                .get();


        if (!snapshot.exists) {

            const wallet = {

                uid:
                    currentUser.uid,

                balance: 0,

                bookingEarnings: 0,

                referralCommission: 0,

                totalEarned: 0,

                totalWithdrawn: 0,

                pendingWithdrawal: 0

            };


            window.roomRentWallet =
                wallet;


            onyeshaMainWallet(
                wallet
            );


            return wallet;
        }


        const wallet =
            snapshot.data();


        window.roomRentWallet =
            wallet;


        onyeshaMainWallet(
            wallet
        );


        return wallet;


    } catch (error) {

        console.error(
            "pakiaMainWalletMaraMoja ERROR:",
            error
        );

        return null;
    }
}


/* =========================================================
   6.4 - DISPLAY MAIN WALLET
========================================================= */

function onyeshaMainWallet(
    wallet = {}
) {

    const section =
        getElement("mainWallet");


    if (!section) {
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


    section.innerHTML = `

        <div class="roomrent-wallet">

            <div class="wallet-header">

                <h2>
                    💰 Main Wallet
                </h2>

                <p>
                    Salio linalopatikana
                </p>

            </div>


            <div class="wallet-balance-card">

                <span>
                    Salio
                </span>

                <strong>
                    ${formatMoney(
                        balance
                    )}
                </strong>

            </div>


            <div class="wallet-grid">

                <div class="wallet-stat">

                    <small>
                        Faida za Booking
                    </small>

                    <strong>
                        ${formatMoney(
                            bookingEarnings
                        )}
                    </strong>

                </div>


                <div class="wallet-stat">

                    <small>
                        Referral Commission
                    </small>

                    <strong>
                        ${formatMoney(
                            referralCommission
                        )}
                    </strong>

                </div>


                <div class="wallet-stat">

                    <small>
                        Jumla Iliyopatikana
                    </small>

                    <strong>
                        ${formatMoney(
                            totalEarned
                        )}
                    </strong>

                </div>


                <div class="wallet-stat">

                    <small>
                        Jumla Iliyotolewa
                    </small>

                    <strong>
                        ${formatMoney(
                            totalWithdrawn
                        )}
                    </strong>

                </div>


                <div class="wallet-stat">

                    <small>
                        Withdrawal Inayosubiri
                    </small>

                    <strong>
                        ${formatMoney(
                            pendingWithdrawal
                        )}
                    </strong>

                </div>

            </div>


            <div class="wallet-actions">

                <button
                    type="button"
                    id="walletWithdrawBtn"
                >
                    💸 Toa Pesa
                </button>


                <button
                    type="button"
                    id="walletBookingsBtn"
                >
                    📋 Booking Zangu
                </button>

            </div>


            <div class="wallet-profit-info">

                <h3>
                    📈 Mfumo wa Faida
                </h3>

                <p>
                    Faida ya booking huanza baada ya
                    Admin kuthibitisha booking.
                </p>

                <p>
                    Kila kipindi kamili cha
                    <strong>masaa 24</strong>
                    huhesabiwa kama siku moja.
                </p>

                <p>
                    Muda wa juu wa booking ni
                    <strong>43 siku</strong>.
                </p>

                <p>
                    Faida haiingii yote mara moja
                    wakati wa confirmation.
                </p>

            </div>

        </div>

    `;


    /* -----------------------------------------
       WITHDRAW BUTTON
    ----------------------------------------- */

    const withdrawBtn =
        getElement(
            "walletWithdrawBtn"
        );


    if (withdrawBtn) {

        withdrawBtn.onclick =
            function () {

                if (
                    typeof funguaWithdrawal ===
                    "function"
                ) {

                    funguaWithdrawal();

                } else {

                    alert(
                        "Withdrawal system bado inaandaliwa."
                    );

                }

            };
    }


    /* -----------------------------------------
       BOOKINGS BUTTON
    ----------------------------------------- */

    const bookingsBtn =
        getElement(
            "walletBookingsBtn"
        );


    if (bookingsBtn) {

        bookingsBtn.onclick =
            function () {

                funguaBookingZangu();

            };
    }
}


/* =========================================================
   6.5 - CHECK PROFIT PROCESSOR
========================================================= */

async function jaribuProcessProfitYaMtumiaji() {

    if (!currentUser) {
        return;
    }


    /*
       Tunatumia Cloud Function kwa profit.

       Muhimu:
       Browser HAITAKIWI kufanya:

       wallet.balance += profit

       kwa sababu hiyo inaweza kuruhusu
       mtumiaji kujiongezea pesa.

       Cloud Function ndiyo itafanya
       calculation na transaction.
    */


    try {

        /*
           Firebase Functions SDK ikiwa haijawekwa
           kwenye HTML bado, function hii itaruka
           bila kuvunja website.
        */

        if (
            typeof firebase ===
            "undefined" ||
            typeof firebase.functions !==
            "function"
        ) {

            console.warn(
                "Firebase Functions SDK bado haijaunganishwa."
            );

            return null;
        }


        const functions =
            firebase.functions();


        const processProfit =
            functions.httpsCallable(
                "processUserProfit"
            );


        const result =
            await processProfit({});


        console.log(
            "Profit processor:",
            result.data
        );


        return result.data;


    } catch (error) {

        /*
           Hapa hatufuti wallet wala booking.

           Kama Cloud Function haijawa deployed,
           website itaendelea kufanya kazi.
        */

        console.warn(
            "Profit processor haikufanya kazi:",
            error
        );


        return null;
    }
}


/* =========================================================
   6.6 - GET CURRENT WALLET BALANCE
========================================================= */

function pataWalletBalance() {

    const wallet =
        window.roomRentWallet || {};


    return Number(
        wallet.balance || 0
    );
}


/* =========================================================
   6.7 - GET BOOKING EARNINGS
========================================================= */

function pataBookingEarnings() {

    const wallet =
        window.roomRentWallet || {};


    return Number(
        wallet.bookingEarnings || 0
    );
}


/* =========================================================
   6.8 - GET REFERRAL COMMISSION
========================================================= */

function pataReferralCommission() {

    const wallet =
        window.roomRentWallet || {};


    return Number(
        wallet.referralCommission || 0
    );
}


/* =========================================================
   6.9 - PROFIT CALCULATION DISPLAY
========================================================= */

function hesabuFaidaYaBooking(
    booking
) {

    if (!booking) {
        return 0;
    }


    const profitPerDay =
        Number(
            booking.profitPerDay || 0
        );


    const durationDays =
        Number(
            booking.durationDays ||
            booking.days ||
            ROOMRENT_SETTINGS.durationDays
        );


    return hesabuFaida(
        profitPerDay,
        durationDays
    );
}


/* =========================================================
   6.10 - CALCULATE TOTAL PAYOUT
========================================================= */

function hesabuJumlaYaBooking(
    booking
) {

    if (!booking) {
        return 0;
    }


    const price =
        Number(
            booking.price ||
            booking.amount ||
            0
        );


    const totalProfit =
        Number(
            booking.totalProfit ||
            hesabuFaidaYaBooking(
                booking
            )
        );


    return hesabuJumla(
        price,
        totalProfit
    );
}


/* =========================================================
   6.11 - CALCULATE ELAPSED 24-HOUR PERIODS
=========================================================

   Hii ni calculation ya kuonyesha/kuhakiki
   logic tu.

   CREDIT HALISI YA WALLET HAIFANYWI HAPA.

   Cloud Function ndiyo itakayotumia
   calculation hii kwa transaction salama.
========================================================= */

function hesabuSikuZilizopita(
    confirmedAt,
    maxDays = 43
) {

    if (!confirmedAt) {
        return 0;
    }


    let confirmedDate;


    try {

        if (
            confirmedAt &&
            typeof confirmedAt.toDate ===
            "function"
        ) {

            confirmedDate =
                confirmedAt.toDate();

        } else {

            confirmedDate =
                new Date(
                    confirmedAt
                );

        }

    } catch (error) {

        return 0;
    }


    if (
        Number.isNaN(
            confirmedDate.getTime()
        )
    ) {

        return 0;
    }


    const now =
        Date.now();


    const elapsed =
        now -
        confirmedDate.getTime();


    if (elapsed <= 0) {
        return 0;
    }


    const fullDays =
        Math.floor(
            elapsed /
            (
                24 *
                60 *
                60 *
                1000
            )
        );


    return Math.min(
        fullDays,
        maxDays
    );
}


/* =========================================================
   6.12 - CALCULATE UNPAID PROFIT DAYS
========================================================= */

function hesabuSikuZaFaidaZisizolipwa(
    booking
) {

    if (!booking) {
        return 0;
    }


    const confirmedDays =
        hesabuSikuZilizopita(
            booking.confirmedAt,
            Number(
                booking.durationDays ||
                booking.days ||
                ROOMRENT_SETTINGS.durationDays
            )
        );


    const alreadyPaid =
        Number(
            booking.profitDaysPaid ||
            0
        );


    return Math.max(
        0,
        confirmedDays -
        alreadyPaid
    );
}


/* =========================================================
   6.13 - ESTIMATE CURRENT UNPAID PROFIT
========================================================= */

function hesabuFaidaIsiyolipwa(
    booking
) {

    if (!booking) {
        return 0;
    }


    const unpaidDays =
        hesabuSikuZaFaidaZisizolipwa(
            booking
        );


    const profitPerDay =
        Number(
            booking.profitPerDay ||
            0
        );


    return (
        unpaidDays *
        profitPerDay
    );
}


/* =========================================================
   6.14 - SHOW PROFIT STATUS FOR BOOKING
========================================================= */

function pataHaliYaFaida(
    booking
) {

    if (!booking) {

        return {
            daysElapsed: 0,
            daysPaid: 0,
            daysRemaining: 0,
            unpaidDays: 0,
            profitPaid: 0,
            profitRemaining: 0
        };
    }


    const durationDays =
        Number(
            booking.durationDays ||
            booking.days ||
            ROOMRENT_SETTINGS.durationDays
        );


    const daysElapsed =
        hesabuSikuZilizopita(
            booking.confirmedAt,
            durationDays
        );


    const daysPaid =
        Number(
            booking.profitDaysPaid ||
            0
        );


    const daysRemaining =
        Math.max(
            0,
            durationDays -
            daysPaid
        );


    const unpaidDays =
        Math.max(
            0,
            daysElapsed -
            daysPaid
        );


    const profitPerDay =
        Number(
            booking.profitPerDay ||
            0
        );


    const profitPaid =
        Number(
            booking.totalProfitPaid ||
            0
        );


    const totalProfit =
        Number(
            booking.totalProfit ||
            (
                profitPerDay *
                durationDays
            )
        );


    const profitRemaining =
        Math.max(
            0,
            totalProfit -
            profitPaid
        );


    return {

        daysElapsed:
            daysElapsed,

        daysPaid:
            daysPaid,

        daysRemaining:
            daysRemaining,

        unpaidDays:
            unpaidDays,

        profitPaid:
            profitPaid,

        profitRemaining:
            profitRemaining

    };
}


/* =========================================================
   6.15 - REFRESH WALLET DISPLAY
========================================================= */

async function refreshMainWallet() {

    if (!currentUser) {
        return;
    }


    await jaribuProcessProfitYaMtumiaji();


    await pakiaMainWalletMaraMoja();
}


/* =========================================================
   6.16 - STOP WALLET LISTENER
========================================================= */

function simamishaMainWalletListener() {

    if (
        typeof unsubscribeMainWallet ===
        "function"
    ) {

        try {

            unsubscribeMainWallet();

        } catch (error) {

            console.warn(
                "Wallet listener cleanup:",
                error
            );

        }

    }


    unsubscribeMainWallet =
        null;
}


/* =========================================================
   6.17 - CLEAN WALLET DATA ON LOGOUT
========================================================= */

function safishaWalletData() {

    simamishaMainWalletListener();


    window.roomRentWallet =
        null;
}


/* =========================================================
   6.18 - EXPOSE FUNCTIONS
========================================================= */

window.funguaMainWallet =
    funguaMainWallet;

window.anzishaMainWalletListener =
    anzishaMainWalletListener;

window.onyeshaMainWallet =
    onyeshaMainWallet;

window.refreshMainWallet =
    refreshMainWallet;

window.pataWalletBalance =
    pataWalletBalance;

window.pataBookingEarnings =
    pataBookingEarnings;

window.pataReferralCommission =
    pataReferralCommission;

window.hesabuFaidaYaBooking =
    hesabuFaidaYaBooking;

window.hesabuJumlaYaBooking =
    hesabuJumlaYaBooking;

window.hesabuSikuZilizopita =
    hesabuSikuZilizopita;

window.hesabuSikuZaFaidaZisizolipwa =
    hesabuSikuZaFaidaZisizolipwa;

window.hesabuFaidaIsiyolipwa =
    hesabuFaidaIsiyolipwa;

window.pataHaliYaFaida =
    pataHaliYaFaida;

window.jaribuProcessProfitYaMtumiaji =
    jaribuProcessProfitYaMtumiaji;

window.simamishaMainWalletListener =
    simamishaMainWalletListener;

window.safishaWalletData =
    safishaWalletData;


/* =========================================================
   MWISHO WA SEHEMU YA 6
========================================================= *//* =========================================================
   ROOMRENT - SEHEMU YA 6
   MAIN WALLET + PROFIT DISPLAY
   =========================================================

   MFUMO:
   - Wallet inasomwa kutoka Firestore.
   - Client HAIJIONGEZI balance yenyewe.
   - Profit haitolewi yote wakati wa confirmation.
   - Profit itahesabiwa kwa vipindi kamili vya saa 24.
   - Kuanza kwa profit = confirmedAt.
   - Maximum = siku 43.
   - Wallet financial updates zitafanywa na backend/
     Cloud Function yenye ruhusa ya server.
   ========================================================= */


/* =========================================================
   6.1 - OPEN MAIN WALLET
========================================================= */

async function funguaMainWallet() {

    if (!requireLogin()) {
        return;
    }


    clearMainSections();


    const section =
        getElement("mainWallet");


    if (!section) {

        console.warn(
            "mainWallet haipo kwenye HTML."
        );

        return;
    }


    section.style.display =
        "block";


    section.innerHTML = `

        <div class="roomrent-loading-box">

            <h2>💰 Main Wallet</h2>

            <p>
                Inapakia wallet yako...
            </p>

        </div>

    `;


    anzishaMainWalletListener();


    /*
       Backend profit processor itaongezwa
       kwenye Cloud Functions.

       Hatuongezi balance moja kwa moja
       kutoka browser.
    */

    await jaribuProcessProfitYaMtumiaji();


    await pakiaMainWalletMaraMoja();
}


/* =========================================================
   6.2 - FIRESTORE WALLET REALTIME LISTENER
========================================================= */

function anzishaMainWalletListener() {

    if (!currentUser) {
        return;
    }


    /* Ondoa listener ya zamani */

    if (
        typeof unsubscribeMainWallet ===
        "function"
    ) {

        try {

            unsubscribeMainWallet();

        } catch (error) {

            console.warn(
                "Old wallet listener:",
                error
            );

        }

    }


    unsubscribeMainWallet =
        db
            .collection("wallets")
            .doc(currentUser.uid)
            .onSnapshot(

                function (snapshot) {

                    let wallet;


                    if (snapshot.exists) {

                        wallet =
                            snapshot.data();

                    } else {

                        wallet = {

                            uid:
                                currentUser.uid,

                            balance: 0,

                            bookingEarnings: 0,

                            referralCommission: 0,

                            totalEarned: 0,

                            totalWithdrawn: 0,

                            pendingWithdrawal: 0

                        };

                    }


                    window.roomRentWallet =
                        wallet;


                    onyeshaMainWallet(
                        wallet
                    );

                },

                function (error) {

                    console.error(
                        "Wallet listener error:",
                        error
                    );


                    const section =
                        getElement(
                            "mainWallet"
                        );


                    if (!section) {
                        return;
                    }


                    section.innerHTML = `

                        <div class="roomrent-error-box">

                            <h2>
                                ⚠️ Hitilafu ya Wallet
                            </h2>

                            <p>
                                Imeshindikana kupata
                                taarifa za wallet.
                            </p>

                            <small>
                                ${escapeHTML(
                                    firebaseErrorMessage(
                                        error
                                    )
                                )}
                            </small>

                        </div>

                    `;
                }
            );
}


/* =========================================================
   6.3 - LOAD WALLET ONCE
========================================================= */

async function pakiaMainWalletMaraMoja() {

    if (!currentUser) {
        return null;
    }


    try {

        const snapshot =
            await db
                .collection("wallets")
                .doc(currentUser.uid)
                .get();


        if (!snapshot.exists) {

            const wallet = {

                uid:
                    currentUser.uid,

                balance: 0,

                bookingEarnings: 0,

                referralCommission: 0,

                totalEarned: 0,

                totalWithdrawn: 0,

                pendingWithdrawal: 0

            };


            window.roomRentWallet =
                wallet;


            onyeshaMainWallet(
                wallet
            );


            return wallet;
        }


        const wallet =
            snapshot.data();


        window.roomRentWallet =
            wallet;


        onyeshaMainWallet(
            wallet
        );


        return wallet;


    } catch (error) {

        console.error(
            "pakiaMainWalletMaraMoja ERROR:",
            error
        );

        return null;
    }
}


/* =========================================================
   6.4 - DISPLAY MAIN WALLET
========================================================= */

function onyeshaMainWallet(
    wallet = {}
) {

    const section =
        getElement("mainWallet");


    if (!section) {
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


    section.innerHTML = `

        <div class="roomrent-wallet">

            <div class="wallet-header">

                <h2>
                    💰 Main Wallet
                </h2>

                <p>
                    Salio linalopatikana
                </p>

            </div>


            <div class="wallet-balance-card">

                <span>
                    Salio
                </span>

                <strong>
                    ${formatMoney(
                        balance
                    )}
                </strong>

            </div>


            <div class="wallet-grid">

                <div class="wallet-stat">

                    <small>
                        Faida za Booking
                    </small>

                    <strong>
                        ${formatMoney(
                            bookingEarnings
                        )}
                    </strong>

                </div>


                <div class="wallet-stat">

                    <small>
                        Referral Commission
                    </small>

                    <strong>
                        ${formatMoney(
                            referralCommission
                        )}
                    </strong>

                </div>


                <div class="wallet-stat">

                    <small>
                        Jumla Iliyopatikana
                    </small>

                    <strong>
                        ${formatMoney(
                            totalEarned
                        )}
                    </strong>

                </div>


                <div class="wallet-stat">

                    <small>
                        Jumla Iliyotolewa
                    </small>

                    <strong>
                        ${formatMoney(
                            totalWithdrawn
                        )}
                    </strong>

                </div>


                <div class="wallet-stat">

                    <small>
                        Withdrawal Inayosubiri
                    </small>

                    <strong>
                        ${formatMoney(
                            pendingWithdrawal
                        )}
                    </strong>

                </div>

            </div>


            <div class="wallet-actions">

                <button
                    type="button"
                    id="walletWithdrawBtn"
                >
                    💸 Toa Pesa
                </button>


                <button
                    type="button"
                    id="walletBookingsBtn"
                >
                    📋 Booking Zangu
                </button>

            </div>


            <div class="wallet-profit-info">

                <h3>
                    📈 Mfumo wa Faida
                </h3>

                <p>
                    Faida ya booking huanza baada ya
                    Admin kuthibitisha booking.
                </p>

                <p>
                    Kila kipindi kamili cha
                    <strong>masaa 24</strong>
                    huhesabiwa kama siku moja.
                </p>

                <p>
                    Muda wa juu wa booking ni
                    <strong>43 siku</strong>.
                </p>

                <p>
                    Faida haiingii yote mara moja
                    wakati wa confirmation.
                </p>

            </div>

        </div>

    `;


    /* -----------------------------------------
       WITHDRAW BUTTON
    ----------------------------------------- */

    const withdrawBtn =
        getElement(
            "walletWithdrawBtn"
        );


    if (withdrawBtn) {

        withdrawBtn.onclick =
            function () {

                if (
                    typeof funguaWithdrawal ===
                    "function"
                ) {

                    funguaWithdrawal();

                } else {

                    alert(
                        "Withdrawal system bado inaandaliwa."
                    );

                }

            };
    }


    /* -----------------------------------------
       BOOKINGS BUTTON
    ----------------------------------------- */

    const bookingsBtn =
        getElement(
            "walletBookingsBtn"
        );


    if (bookingsBtn) {

        bookingsBtn.onclick =
            function () {

                funguaBookingZangu();

            };
    }
}


/* =========================================================
   6.5 - CHECK PROFIT PROCESSOR
========================================================= */

async function jaribuProcessProfitYaMtumiaji() {

    if (!currentUser) {
        return;
    }


    /*
       Tunatumia Cloud Function kwa profit.

       Muhimu:
       Browser HAITAKIWI kufanya:

       wallet.balance += profit

       kwa sababu hiyo inaweza kuruhusu
       mtumiaji kujiongezea pesa.

       Cloud Function ndiyo itafanya
       calculation na transaction.
    */


    try {

        /*
           Firebase Functions SDK ikiwa haijawekwa
           kwenye HTML bado, function hii itaruka
           bila kuvunja website.
        */

        if (
            typeof firebase ===
            "undefined" ||
            typeof firebase.functions !==
            "function"
        ) {

            console.warn(
                "Firebase Functions SDK bado haijaunganishwa."
            );

            return null;
        }


        const functions =
            firebase.functions();


        const processProfit =
            functions.httpsCallable(
                "processUserProfit"
            );


        const result =
            await processProfit({});


        console.log(
            "Profit processor:",
            result.data
        );


        return result.data;


    } catch (error) {

        /*
           Hapa hatufuti wallet wala booking.

           Kama Cloud Function haijawa deployed,
           website itaendelea kufanya kazi.
        */

        console.warn(
            "Profit processor haikufanya kazi:",
            error
        );


        return null;
    }
}


/* =========================================================
   6.6 - GET CURRENT WALLET BALANCE
========================================================= */

function pataWalletBalance() {

    const wallet =
        window.roomRentWallet || {};


    return Number(
        wallet.balance || 0
    );
}


/* =========================================================
   6.7 - GET BOOKING EARNINGS
========================================================= */

function pataBookingEarnings() {

    const wallet =
        window.roomRentWallet || {};


    return Number(
        wallet.bookingEarnings || 0
    );
}


/* =========================================================
   6.8 - GET REFERRAL COMMISSION
========================================================= */

function pataReferralCommission() {

    const wallet =
        window.roomRentWallet || {};


    return Number(
        wallet.referralCommission || 0
    );
}


/* =========================================================
   6.9 - PROFIT CALCULATION DISPLAY
========================================================= */

function hesabuFaidaYaBooking(
    booking
) {

    if (!booking) {
        return 0;
    }


    const profitPerDay =
        Number(
            booking.profitPerDay || 0
        );


    const durationDays =
        Number(
            booking.durationDays ||
            booking.days ||
            ROOMRENT_SETTINGS.durationDays
        );


    return hesabuFaida(
        profitPerDay,
        durationDays
    );
}


/* =========================================================
   6.10 - CALCULATE TOTAL PAYOUT
========================================================= */

function hesabuJumlaYaBooking(
    booking
) {

    if (!booking) {
        return 0;
    }


    const price =
        Number(
            booking.price ||
            booking.amount ||
            0
        );


    const totalProfit =
        Number(
            booking.totalProfit ||
            hesabuFaidaYaBooking(
                booking
            )
        );


    return hesabuJumla(
        price,
        totalProfit
    );
}


/* =========================================================
   6.11 - CALCULATE ELAPSED 24-HOUR PERIODS
=========================================================

   Hii ni calculation ya kuonyesha/kuhakiki
   logic tu.

   CREDIT HALISI YA WALLET HAIFANYWI HAPA.

   Cloud Function ndiyo itakayotumia
   calculation hii kwa transaction salama.
========================================================= */

function hesabuSikuZilizopita(
    confirmedAt,
    maxDays = 43
) {

    if (!confirmedAt) {
        return 0;
    }


    let confirmedDate;


    try {

        if (
            confirmedAt &&
            typeof confirmedAt.toDate ===
            "function"
        ) {

            confirmedDate =
                confirmedAt.toDate();

        } else {

            confirmedDate =
                new Date(
                    confirmedAt
                );

        }

    } catch (error) {

        return 0;
    }


    if (
        Number.isNaN(
            confirmedDate.getTime()
        )
    ) {

        return 0;
    }


    const now =
        Date.now();


    const elapsed =
        now -
        confirmedDate.getTime();


    if (elapsed <= 0) {
        return 0;
    }


    const fullDays =
        Math.floor(
            elapsed /
            (
                24 *
                60 *
                60 *
                1000
            )
        );


    return Math.min(
        fullDays,
        maxDays
    );
}


/* =========================================================
   6.12 - CALCULATE UNPAID PROFIT DAYS
========================================================= */

function hesabuSikuZaFaidaZisizolipwa(
    booking
) {

    if (!booking) {
        return 0;
    }


    const confirmedDays =
        hesabuSikuZilizopita(
            booking.confirmedAt,
            Number(
                booking.durationDays ||
                booking.days ||
                ROOMRENT_SETTINGS.durationDays
            )
        );


    const alreadyPaid =
        Number(
            booking.profitDaysPaid ||
            0
        );


    return Math.max(
        0,
        confirmedDays -
        alreadyPaid
    );
}


/* =========================================================
   6.13 - ESTIMATE CURRENT UNPAID PROFIT
========================================================= */

function hesabuFaidaIsiyolipwa(
    booking
) {

    if (!booking) {
        return 0;
    }


    const unpaidDays =
        hesabuSikuZaFaidaZisizolipwa(
            booking
        );


    const profitPerDay =
        Number(
            booking.profitPerDay ||
            0
        );


    return (
        unpaidDays *
        profitPerDay
    );
}


/* =========================================================
   6.14 - SHOW PROFIT STATUS FOR BOOKING
========================================================= */

function pataHaliYaFaida(
    booking
) {

    if (!booking) {

        return {
            daysElapsed: 0,
            daysPaid: 0,
            daysRemaining: 0,
            unpaidDays: 0,
            profitPaid: 0,
            profitRemaining: 0
        };
    }


    const durationDays =
        Number(
            booking.durationDays ||
            booking.days ||
            ROOMRENT_SETTINGS.durationDays
        );


    const daysElapsed =
        hesabuSikuZilizopita(
            booking.confirmedAt,
            durationDays
        );


    const daysPaid =
        Number(
            booking.profitDaysPaid ||
            0
        );


    const daysRemaining =
        Math.max(
            0,
            durationDays -
            daysPaid
        );


    const unpaidDays =
        Math.max(
            0,
            daysElapsed -
            daysPaid
        );


    const profitPerDay =
        Number(
            booking.profitPerDay ||
            0
        );


    const profitPaid =
        Number(
            booking.totalProfitPaid ||
            0
        );


    const totalProfit =
        Number(
            booking.totalProfit ||
            (
                profitPerDay *
                durationDays
            )
        );


    const profitRemaining =
        Math.max(
            0,
            totalProfit -
            profitPaid
        );


    return {

        daysElapsed:
            daysElapsed,

        daysPaid:
            daysPaid,

        daysRemaining:
            daysRemaining,

        unpaidDays:
            unpaidDays,

        profitPaid:
            profitPaid,

        profitRemaining:
            profitRemaining

    };
}


/* =========================================================
   6.15 - REFRESH WALLET DISPLAY
========================================================= */

async function refreshMainWallet() {

    if (!currentUser) {
        return;
    }


    await jaribuProcessProfitYaMtumiaji();


    await pakiaMainWalletMaraMoja();
}


/* =========================================================
   6.16 - STOP WALLET LISTENER
========================================================= */

function simamishaMainWalletListener() {

    if (
        typeof unsubscribeMainWallet ===
        "function"
    ) {

        try {

            unsubscribeMainWallet();

        } catch (error) {

            console.warn(
                "Wallet listener cleanup:",
                error
            );

        }

    }


    unsubscribeMainWallet =
        null;
}


/* =========================================================
   6.17 - CLEAN WALLET DATA ON LOGOUT
========================================================= */

function safishaWalletData() {

    simamishaMainWalletListener();


    window.roomRentWallet =
        null;
}


/* =========================================================
   6.18 - EXPOSE FUNCTIONS
========================================================= */

window.funguaMainWallet =
    funguaMainWallet;

window.anzishaMainWalletListener =
    anzishaMainWalletListener;

window.onyeshaMainWallet =
    onyeshaMainWallet;

window.refreshMainWallet =
    refreshMainWallet;

window.pataWalletBalance =
    pataWalletBalance;

window.pataBookingEarnings =
    pataBookingEarnings;

window.pataReferralCommission =
    pataReferralCommission;

window.hesabuFaidaYaBooking =
    hesabuFaidaYaBooking;

window.hesabuJumlaYaBooking =
    hesabuJumlaYaBooking;

window.hesabuSikuZilizopita =
    hesabuSikuZilizopita;

window.hesabuSikuZaFaidaZisizolipwa =
    hesabuSikuZaFaidaZisizolipwa;

window.hesabuFaidaIsiyolipwa =
    hesabuFaidaIsiyolipwa;

window.pataHaliYaFaida =
    pataHaliYaFaida;

window.jaribuProcessProfitYaMtumiaji =
    jaribuProcessProfitYaMtumiaji;

window.simamishaMainWalletListener =
    simamishaMainWalletListener;

window.safishaWalletData =
    safishaWalletData;


/* =========================================================
   MWISHO WA SEHEMU YA 6
========================================================= */
/* =========================================================
   ROOMRENT - SEHEMU YA 7
   WITHDRAWAL SYSTEM
   =========================================================

   MFUMO:
   - Minimum withdrawal = TSh 3,000
   - Withdrawal fee = TSh 0
   - User hawezi kutoa zaidi ya balance.
   - Ombi linaingia status = pending.
   - Kiasi kinawekwa pendingWithdrawal.
   - Admin ata-approve au reject.
   - Reject -> pesa zinarudi balance.
   - Approve -> pesa zinakuwa withdrawn.
   - Client HAITAKIWI ku-edit wallet moja kwa moja.
   - Transaction halisi itafanywa na Cloud Function.
   ========================================================= */


/* =========================================================
   7.1 - WITHDRAWAL SETTINGS
========================================================= */

const ROOMRENT_WITHDRAWAL_SETTINGS = {

    minimumAmount:
        Number(
            ROOMRENT_SETTINGS.minimumWithdrawal ||
            3000
        ),

    fee: 0

};


/* =========================================================
   7.2 - OPEN WITHDRAWAL
========================================================= */

async function funguaWithdrawal() {

    if (!requireLogin()) {
        return;
    }


    clearMainSections();


    const section =
        getElement("withdrawalSection");


    if (!section) {

        console.warn(
            "withdrawalSection haipo kwenye HTML."
        );

        return;
    }


    section.style.display =
        "block";


    let wallet =
        window.roomRentWallet;


    if (!wallet) {

        wallet =
            await pakiaMainWalletMaraMoja();

    }


    wallet =
        wallet || {};


    const balance =
        Number(
            wallet.balance || 0
        );


    const pendingWithdrawal =
        Number(
            wallet.pendingWithdrawal || 0
        );


    section.innerHTML = `

        <div class="roomrent-withdrawal">

            <div class="withdrawal-header">

                <h2>
                    💸 Toa Pesa
                </h2>

                <p>
                    Omba withdrawal kutoka Main Wallet.
                </p>

            </div>


            <div class="withdrawal-balance-card">

                <span>
                    Salio Linalopatikana
                </span>

                <strong>
                    ${formatMoney(
                        balance
                    )}
                </strong>

            </div>


            <div class="withdrawal-pending-card">

                <span>
                    Withdrawal Inayosubiri
                </span>

                <strong>
                    ${formatMoney(
                        pendingWithdrawal
                    )}
                </strong>

            </div>


            <div class="withdrawal-info-box">

                <p>
                    <strong>
                        Minimum:
                    </strong>
                    ${formatMoney(
                        ROOMRENT_WITHDRAWAL_SETTINGS.minimumAmount
                    )}
                </p>

                <p>
                    <strong>
                        Withdrawal Fee:
                    </strong>
                    ${formatMoney(
                        ROOMRENT_WITHDRAWAL_SETTINGS.fee
                    )}
                </p>

                <p>
                    Pesa ya withdrawal itatumwa
                    kwa namba utakayoweka hapa chini.
                </p>

            </div>


            <form
                id="withdrawalForm"
                autocomplete="off"
            >

                <div class="form-group">

                    <label>
                        Kiasi cha kutoa
                    </label>

                    <input
                        type="number"
                        id="withdrawalAmount"
                        min="${
                            ROOMRENT_WITHDRAWAL_SETTINGS.minimumAmount
                        }"
                        step="1"
                        placeholder="Mfano 3000"
                        required
                    >

                </div>


                <div class="form-group">

                    <label>
                        Njia ya kupokea
                    </label>

                    <select
                        id="withdrawalMethod"
                        required
                    >

                        <option value="">
                            -- Chagua njia --
                        </option>

                        <option value="AIRTEL_MONEY">
                            Airtel Money
                        </option>

                        <option value="MIXX_BY_YAS">
                            MIXX BY YAS
                        </option>

                    </select>

                </div>


                <div class="form-group">

                    <label>
                        Namba ya kupokea pesa
                    </label>

                    <input
                        type="tel"
                        id="withdrawalPhone"
                        inputmode="numeric"
                        maxlength="10"
                        placeholder="07XXXXXXXX / 06XXXXXXXX"
                        required
                    >

                </div>


                <div
                    id="withdrawalMessage"
                    class="withdrawal-message"
                ></div>


                <button
                    type="submit"
                    id="submitWithdrawalBtn"
                >
                    💸 Tuma Ombi la Withdrawal
                </button>

            </form>


            <div class="withdrawal-actions">

                <button
                    type="button"
                    id="backToWalletBtn"
                >
                    ← Rudi Main Wallet
                </button>

                <button
                    type="button"
                    id="viewWithdrawalsBtn"
                >
                    📋 Withdrawal Zangu
                </button>

            </div>

        </div>

    `;


    const form =
        getElement(
            "withdrawalForm"
        );


    if (form) {

        form.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();

                await tumaWithdrawal();

            }
        );

    }


    const backBtn =
        getElement(
            "backToWalletBtn"
        );


    if (backBtn) {

        backBtn.onclick =
            function () {

                funguaMainWallet();

            };

    }


    const historyBtn =
        getElement(
            "viewWithdrawalsBtn"
        );


    if (historyBtn) {

        historyBtn.onclick =
            function () {

                funguaWithdrawalZangu();

            };

    }

}


/* =========================================================
   7.3 - SUBMIT WITHDRAWAL
========================================================= */

async function tumaWithdrawal() {

    if (!requireLogin()) {
        return;
    }


    const amountInput =
        getElement(
            "withdrawalAmount"
        );


    const methodInput =
        getElement(
            "withdrawalMethod"
        );


    const phoneInput =
        getElement(
            "withdrawalPhone"
        );


    const message =
        getElement(
            "withdrawalMessage"
        );


    const submitBtn =
        getElement(
            "submitWithdrawalBtn"
        );


    const amount =
        Number(
            amountInput?.value || 0
        );


    const method =
        String(
            methodInput?.value || ""
        ).trim();


    const phone =
        String(
            phoneInput?.value || ""
        ).trim();


    /* -----------------------------------------
       VALIDATION
    ----------------------------------------- */

    if (
        !Number.isFinite(amount) ||
        amount <= 0
    ) {

        onyeshaWithdrawalMessage(
            "Tafadhali weka kiasi sahihi.",
            "error"
        );

        return;
    }


    if (
        amount <
        ROOMRENT_WITHDRAWAL_SETTINGS.minimumAmount
    ) {

        onyeshaWithdrawalMessage(

            `Minimum withdrawal ni ${formatMoney(
                ROOMRENT_WITHDRAWAL_SETTINGS.minimumAmount
            )}.`,

            "error"
        );

        return;
    }


    if (!method) {

        onyeshaWithdrawalMessage(
            "Tafadhali chagua njia ya kupokea.",
            "error"
        );

        return;
    }


    if (!niNambaYaSimuSahihi(phone)) {

        onyeshaWithdrawalMessage(
            "Tafadhali weka namba sahihi ya simu yenye tarakimu 10.",
            "error"
        );

        return;
    }


    /* -----------------------------------------
       CHECK CURRENT WALLET DISPLAY
       
       Hii ni preliminary check tu.
       Server ndiyo itafanya check ya mwisho.
    ----------------------------------------- */

    const wallet =
        window.roomRentWallet ||
        {};


    const balance =
        Number(
            wallet.balance || 0
        );


    if (amount > balance) {

        onyeshaWithdrawalMessage(
            "Salio lako halitoshi kwa withdrawal hii.",
            "error"
        );

        return;
    }


    /* -----------------------------------------
       BUTTON LOADING
    ----------------------------------------- */

    if (submitBtn) {

        submitBtn.disabled =
            true;

        submitBtn.dataset.originalText =
            submitBtn.textContent;

        submitBtn.textContent =
            "Inatumwa...";

    }


    try {

        /*
           -------------------------------------------------
           SERVER-SIDE WITHDRAWAL
           -------------------------------------------------

           Cloud Function ndiyo itakayofanya:

           1. Auth check
           2. Amount check
           3. Balance check
           4. Minimum check
           5. Fee = 0
           6. Wallet transaction
           7. Withdrawal document
           
           Hii inazuia user kubadilisha balance kupitia
           browser.
        */


        if (
            typeof firebase ===
            "undefined" ||
            typeof firebase.functions !==
            "function"
        ) {

            throw new Error(
                "Firebase Functions SDK bado haijaunganishwa."
            );

        }


        const functions =
            firebase.functions();


        const requestWithdrawal =
            functions.httpsCallable(
                "requestWithdrawal"
            );


        const result =
            await requestWithdrawal({

                amount:
                    amount,

                method:
                    method,

                phone:
                    phone

            });


        const resultData =
            result.data || {};


        const withdrawalId =
            resultData.withdrawalId ||
            "";


        /* -----------------------------------------
           SUCCESS
        ----------------------------------------- */

        onyeshaWithdrawalMessage(

            withdrawalId

                ? `Ombi lako limetumwa kikamilifu. Namba ya withdrawal: ${withdrawalId}`

                : "Ombi lako la withdrawal limetumwa kikamilifu.",

            "success"

        );


        if (amountInput) {
            amountInput.value = "";
        }


        if (methodInput) {
            methodInput.value = "";
        }


        if (phoneInput) {
            phoneInput.value = "";
        }


        /* -----------------------------------------
           REFRESH WALLET
        ----------------------------------------- */

        await pakiaMainWalletMaraMoja();


    } catch (error) {

        console.error(
            "tumaWithdrawal ERROR:",
            error
        );


        onyeshaWithdrawalMessage(

            firebaseErrorMessage(
                error
            ),

            "error"

        );


    } finally {

        if (submitBtn) {

            submitBtn.disabled =
                false;

            submitBtn.textContent =
                submitBtn.dataset.originalText ||
                "💸 Tuma Ombi la Withdrawal";

        }

    }
}


/* =========================================================
   7.4 - WITHDRAWAL MESSAGE
========================================================= */

function onyeshaWithdrawalMessage(
    message,
    type = "info"
) {

    const container =
        getElement(
            "withdrawalMessage"
        );


    if (!container) {

        alert(
            message
        );

        return;
    }


    container.textContent =
        message;


    container.className =
        `withdrawal-message withdrawal-${type}`;

}


/* =========================================================
   7.5 - OPEN WITHDRAWAL HISTORY
========================================================= */

function funguaWithdrawalZangu() {

    if (!requireLogin()) {
        return;
    }


    clearMainSections();


    const section =
        getElement(
            "withdrawalSection"
        );


    if (!section) {
        return;
    }


    section.style.display =
        "block";


    section.innerHTML = `

        <div class="roomrent-loading-box">

            <h2>
                📋 Withdrawal Zangu
            </h2>

            <p>
                Inapakia...
            </p>

        </div>

    `;


    anzishaWithdrawalsListener();

}


/* =========================================================
   7.6 - WITHDRAWALS REALTIME LISTENER
========================================================= */

function anzishaWithdrawalsListener() {

    if (!currentUser) {
        return;
    }


    /*
       Hakuna global unsubscribe ya lazima hapa
       kwa sababu tunahifadhi kwenye window.
    */

    if (
        typeof window
            .roomRentWithdrawalUnsubscribe ===
        "function"
    ) {

        try {

            window
                .roomRentWithdrawalUnsubscribe();

        } catch (error) {}

    }


    window.roomRentWithdrawalUnsubscribe =
        db
            .collection("withdrawals")
            .where(
                "uid",
                "==",
                currentUser.uid
            )
            .onSnapshot(

                function (snapshot) {

                    const withdrawals =
                        [];


                    snapshot.forEach(
                        function (doc) {

                            withdrawals.push({

                                id: doc.id,

                                ...doc.data()

                            });

                        }
                    );


                    withdrawals.sort(
                        function (a, b) {

                            const aTime =
                                a.createdAt &&
                                typeof a.createdAt.toMillis ===
                                "function"
                                    ? a.createdAt.toMillis()
                                    : 0;


                            const bTime =
                                b.createdAt &&
                                typeof b.createdAt.toMillis ===
                                "function"
                                    ? b.createdAt.toMillis()
                                    : 0;


                            return bTime - aTime;

                        }
                    );


                    window.roomRentWithdrawals =
                        withdrawals;


                    onyeshaWithdrawalZangu(
                        withdrawals
                    );

                },

                function (error) {

                    console.error(
                        "Withdrawal listener error:",
                        error
                    );


                    const section =
                        getElement(
                            "withdrawalSection"
                        );


                    if (!section) {
                        return;
                    }


                    section.innerHTML = `

                        <div class="roomrent-error-box">

                            <h2>
                                ⚠️ Hitilafu
                            </h2>

                            <p>
                                Imeshindikana kupata
                                withdrawal zako.
                            </p>

                            <small>
                                ${escapeHTML(
                                    firebaseErrorMessage(
                                        error
                                    )
                                )}
                            </small>

                        </div>

                    `;

                }
            );
}


/* =========================================================
   7.7 - DISPLAY WITHDRAWALS
========================================================= */

function onyeshaWithdrawalZangu(
    withdrawals = []
) {

    const section =
        getElement(
            "withdrawalSection"
        );


    if (!section) {
        return;
    }


    let html = `

        <div class="roomrent-withdrawal-history">

            <div class="withdrawal-history-header">

                <button
                    type="button"
                    id="backToWithdrawalForm"
                >
                    ← Toa Pesa
                </button>

                <h2>
                    📋 Withdrawal Zangu
                </h2>

            </div>

    `;


    if (!withdrawals.length) {

        html += `

            <div class="roomrent-empty-box">

                <p>
                    Bado hujafanya withdrawal yoyote.
                </p>

            </div>

        `;

    } else {

        withdrawals.forEach(
            function (withdrawal) {

                html +=
                    tengenezaWithdrawalCard(
                        withdrawal
                    );

            }
        );

    }


    html += `

        </div>

    `;


    section.innerHTML =
        html;


    const backBtn =
        getElement(
            "backToWithdrawalForm"
        );


    if (backBtn) {

        backBtn.onclick =
            function () {

                funguaWithdrawal();

            };

    }

}


/* =========================================================
   7.8 - WITHDRAWAL CARD
========================================================= */

function tengenezaWithdrawalCard(
    withdrawal
) {

    const amount =
        Number(
            withdrawal.amount || 0
        );


    const fee =
        Number(
            withdrawal.fee || 0
        );


    const netAmount =
        Number(
            withdrawal.netAmount ??
            (
                amount -
                fee
            )
        );


    const status =
        withdrawal.status ||
        "pending";


    const statusText =
        formatWithdrawalStatus(
            status
        );


    const method =
        withdrawal.methodName ||
        withdrawal.method ||
        "-";


    const phone =
        withdrawal.phone ||
        "-";


    const createdAt =
        formatFirestoreDate(
            withdrawal.createdAt
        );


    const processedAt =
        formatFirestoreDate(
            withdrawal.processedAt
        );


    return `

        <div
            class="
                roomrent-withdrawal-card
                withdrawal-status-${escapeHTML(
                    status
                )}
            "
        >

            <div class="withdrawal-card-header">

                <strong>
                    ${escapeHTML(
                        statusText
                    )}
                </strong>

                <span>
                    ${escapeHTML(
                        withdrawal.id ||
                        "-"
                    )}
                </span>

            </div>


            <div class="withdrawal-card-body">

                <p>

                    <strong>
                        Kiasi:
                    </strong>

                    ${formatMoney(
                        amount
                    )}

                </p>


                <p>

                    <strong>
                        Fee:
                    </strong>

                    ${formatMoney(
                        fee
                    )}

                </p>


                <p>

                    <strong>
                        Utapokea:
                    </strong>

                    ${formatMoney(
                        netAmount
                    )}

                </p>


                <p>

                    <strong>
                        Njia:
                    </strong>

                    ${escapeHTML(
                        method
                    )}

                </p>


                <p>

                    <strong>
                        Namba:
                    </strong>

                    ${escapeHTML(
                        phone
                    )}

                </p>


                <p>

                    <strong>
                        Iliombwa:
                    </strong>

                    ${escapeHTML(
                        createdAt
                    )}

                </p>


                ${
                    withdrawal.processedAt
                        ? `

                            <p>

                                <strong>
                                    Ilichakatwa:
                                </strong>

                                ${escapeHTML(
                                    processedAt
                                )}

                            </p>

                        `
                        : ""
                }


                ${
                    withdrawal.adminNote
                        ? `

                            <div class="withdrawal-admin-note">

                                <strong>
                                    Ujumbe wa Admin:
                                </strong>

                                <p>
                                    ${escapeHTML(
                                        withdrawal.adminNote
                                    )}
                                </p>

                            </div>

                        `
                        : ""
                }

            </div>

        </div>

    `;

}


/* =========================================================
   7.9 - WITHDRAWAL STATUS
========================================================= */

function formatWithdrawalStatus(
    status
) {

    const statuses = {

        pending:
            "⏳ Inasubiri",

        processing:
            "🔄 Inachakatwa",

        approved:
            "✅ Imekubaliwa",

        completed:
            "✅ Imekamilika",

        rejected:
            "❌ Imekataliwa",

        cancelled:
            "🚫 Imeghairiwa"

    };


    return (
        statuses[status] ||
        status ||
        "Haijulikani"
    );

}


/* =========================================================
   7.10 - STOP WITHDRAWAL LISTENER
========================================================= */

function simamishaWithdrawalsListener() {

    if (
        typeof window
            .roomRentWithdrawalUnsubscribe ===
        "function"
    ) {

        try {

            window
                .roomRentWithdrawalUnsubscribe();

        } catch (error) {

            console.warn(
                "Withdrawal listener cleanup:",
                error
            );

        }

    }


    window.roomRentWithdrawalUnsubscribe =
        null;

}


/* =========================================================
   7.11 - EXPOSE FUNCTIONS
========================================================= */

window.funguaWithdrawal =
    funguaWithdrawal;

window.tumaWithdrawal =
    tumaWithdrawal;

window.funguaWithdrawalZangu =
    funguaWithdrawalZangu;

window.anzishaWithdrawalsListener =
    anzishaWithdrawalsListener;

window.onyeshaWithdrawalZangu =
    onyeshaWithdrawalZangu;

window.tengenezaWithdrawalCard =
    tengenezaWithdrawalCard;

window.formatWithdrawalStatus =
    formatWithdrawalStatus;

window.simamishaWithdrawalsListener =
    simamishaWithdrawalsListener;


/* =========================================================
   MWISHO WA SEHEMU YA 7
========================================================= *//* =========================================================
   ROOMRENT - SEHEMU YA 7
   WITHDRAWAL SYSTEM
   =========================================================

   MFUMO:
   - Minimum withdrawal = TSh 3,000
   - Withdrawal fee = TSh 0
   - User hawezi kutoa zaidi ya balance.
   - Ombi linaingia status = pending.
   - Kiasi kinawekwa pendingWithdrawal.
   - Admin ata-approve au reject.
   - Reject -> pesa zinarudi balance.
   - Approve -> pesa zinakuwa withdrawn.
   - Client HAITAKIWI ku-edit wallet moja kwa moja.
   - Transaction halisi itafanywa na Cloud Function.
   ========================================================= */


/* =========================================================
   7.1 - WITHDRAWAL SETTINGS
========================================================= */

const ROOMRENT_WITHDRAWAL_SETTINGS = {

    minimumAmount:
        Number(
            ROOMRENT_SETTINGS.minimumWithdrawal ||
            3000
        ),

    fee: 0

};


/* =========================================================
   7.2 - OPEN WITHDRAWAL
========================================================= */

async function funguaWithdrawal() {

    if (!requireLogin()) {
        return;
    }


    clearMainSections();


    const section =
        getElement("withdrawalSection");


    if (!section) {

        console.warn(
            "withdrawalSection haipo kwenye HTML."
        );

        return;
    }


    section.style.display =
        "block";


    let wallet =
        window.roomRentWallet;


    if (!wallet) {

        wallet =
            await pakiaMainWalletMaraMoja();

    }


    wallet =
        wallet || {};


    const balance =
        Number(
            wallet.balance || 0
        );


    const pendingWithdrawal =
        Number(
            wallet.pendingWithdrawal || 0
        );


    section.innerHTML = `

        <div class="roomrent-withdrawal">

            <div class="withdrawal-header">

                <h2>
                    💸 Toa Pesa
                </h2>

                <p>
                    Omba withdrawal kutoka Main Wallet.
                </p>

            </div>


            <div class="withdrawal-balance-card">

                <span>
                    Salio Linalopatikana
                </span>

                <strong>
                    ${formatMoney(
                        balance
                    )}
                </strong>

            </div>


            <div class="withdrawal-pending-card">

                <span>
                    Withdrawal Inayosubiri
                </span>

                <strong>
                    ${formatMoney(
                        pendingWithdrawal
                    )}
                </strong>

            </div>


            <div class="withdrawal-info-box">

                <p>
                    <strong>
                        Minimum:
                    </strong>
                    ${formatMoney(
                        ROOMRENT_WITHDRAWAL_SETTINGS.minimumAmount
                    )}
                </p>

                <p>
                    <strong>
                        Withdrawal Fee:
                    </strong>
                    ${formatMoney(
                        ROOMRENT_WITHDRAWAL_SETTINGS.fee
                    )}
                </p>

                <p>
                    Pesa ya withdrawal itatumwa
                    kwa namba utakayoweka hapa chini.
                </p>

            </div>


            <form
                id="withdrawalForm"
                autocomplete="off"
            >

                <div class="form-group">

                    <label>
                        Kiasi cha kutoa
                    </label>

                    <input
                        type="number"
                        id="withdrawalAmount"
                        min="${
                            ROOMRENT_WITHDRAWAL_SETTINGS.minimumAmount
                        }"
                        step="1"
                        placeholder="Mfano 3000"
                        required
                    >

                </div>


                <div class="form-group">

                    <label>
                        Njia ya kupokea
                    </label>

                    <select
                        id="withdrawalMethod"
                        required
                    >

                        <option value="">
                            -- Chagua njia --
                        </option>

                        <option value="AIRTEL_MONEY">
                            Airtel Money
                        </option>

                        <option value="MIXX_BY_YAS">
                            MIXX BY YAS
                        </option>

                    </select>

                </div>


                <div class="form-group">

                    <label>
                        Namba ya kupokea pesa
                    </label>

                    <input
                        type="tel"
                        id="withdrawalPhone"
                        inputmode="numeric"
                        maxlength="10"
                        placeholder="07XXXXXXXX / 06XXXXXXXX"
                        required
                    >

                </div>


                <div
                    id="withdrawalMessage"
                    class="withdrawal-message"
                ></div>


                <button
                    type="submit"
                    id="submitWithdrawalBtn"
                >
                    💸 Tuma Ombi la Withdrawal
                </button>

            </form>


            <div class="withdrawal-actions">

                <button
                    type="button"
                    id="backToWalletBtn"
                >
                    ← Rudi Main Wallet
                </button>

                <button
                    type="button"
                    id="viewWithdrawalsBtn"
                >
                    📋 Withdrawal Zangu
                </button>

            </div>

        </div>

    `;


    const form =
        getElement(
            "withdrawalForm"
        );


    if (form) {

        form.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();

                await tumaWithdrawal();

            }
        );

    }


    const backBtn =
        getElement(
            "backToWalletBtn"
        );


    if (backBtn) {

        backBtn.onclick =
            function () {

                funguaMainWallet();

            };

    }


    const historyBtn =
        getElement(
            "viewWithdrawalsBtn"
        );


    if (historyBtn) {

        historyBtn.onclick =
            function () {

                funguaWithdrawalZangu();

            };

    }

}


/* =========================================================
   7.3 - SUBMIT WITHDRAWAL
========================================================= */

async function tumaWithdrawal() {

    if (!requireLogin()) {
        return;
    }


    const amountInput =
        getElement(
            "withdrawalAmount"
        );


    const methodInput =
        getElement(
            "withdrawalMethod"
        );


    const phoneInput =
        getElement(
            "withdrawalPhone"
        );


    const message =
        getElement(
            "withdrawalMessage"
        );


    const submitBtn =
        getElement(
            "submitWithdrawalBtn"
        );


    const amount =
        Number(
            amountInput?.value || 0
        );


    const method =
        String(
            methodInput?.value || ""
        ).trim();


    const phone =
        String(
            phoneInput?.value || ""
        ).trim();


    /* -----------------------------------------
       VALIDATION
    ----------------------------------------- */

    if (
        !Number.isFinite(amount) ||
        amount <= 0
    ) {

        onyeshaWithdrawalMessage(
            "Tafadhali weka kiasi sahihi.",
            "error"
        );

        return;
    }


    if (
        amount <
        ROOMRENT_WITHDRAWAL_SETTINGS.minimumAmount
    ) {

        onyeshaWithdrawalMessage(

            `Minimum withdrawal ni ${formatMoney(
                ROOMRENT_WITHDRAWAL_SETTINGS.minimumAmount
            )}.`,

            "error"
        );

        return;
    }


    if (!method) {

        onyeshaWithdrawalMessage(
            "Tafadhali chagua njia ya kupokea.",
            "error"
        );

        return;
    }


    if (!niNambaYaSimuSahihi(phone)) {

        onyeshaWithdrawalMessage(
            "Tafadhali weka namba sahihi ya simu yenye tarakimu 10.",
            "error"
        );

        return;
    }


    /* -----------------------------------------
       CHECK CURRENT WALLET DISPLAY
       
       Hii ni preliminary check tu.
       Server ndiyo itafanya check ya mwisho.
    ----------------------------------------- */

    const wallet =
        window.roomRentWallet ||
        {};


    const balance =
        Number(
            wallet.balance || 0
        );


    if (amount > balance) {

        onyeshaWithdrawalMessage(
            "Salio lako halitoshi kwa withdrawal hii.",
            "error"
        );

        return;
    }


    /* -----------------------------------------
       BUTTON LOADING
    ----------------------------------------- */

    if (submitBtn) {

        submitBtn.disabled =
            true;

        submitBtn.dataset.originalText =
            submitBtn.textContent;

        submitBtn.textContent =
            "Inatumwa...";

    }


    try {

        /*
           -------------------------------------------------
           SERVER-SIDE WITHDRAWAL
           -------------------------------------------------

           Cloud Function ndiyo itakayofanya:

           1. Auth check
           2. Amount check
           3. Balance check
           4. Minimum check
           5. Fee = 0
           6. Wallet transaction
           7. Withdrawal document
           
           Hii inazuia user kubadilisha balance kupitia
           browser.
        */


        if (
            typeof firebase ===
            "undefined" ||
            typeof firebase.functions !==
            "function"
        ) {

            throw new Error(
                "Firebase Functions SDK bado haijaunganishwa."
            );

        }


        const functions =
            firebase.functions();


        const requestWithdrawal =
            functions.httpsCallable(
                "requestWithdrawal"
            );


        const result =
            await requestWithdrawal({

                amount:
                    amount,

                method:
                    method,

                phone:
                    phone

            });


        const resultData =
            result.data || {};


        const withdrawalId =
            resultData.withdrawalId ||
            "";


        /* -----------------------------------------
           SUCCESS
        ----------------------------------------- */

        onyeshaWithdrawalMessage(

            withdrawalId

                ? `Ombi lako limetumwa kikamilifu. Namba ya withdrawal: ${withdrawalId}`

                : "Ombi lako la withdrawal limetumwa kikamilifu.",

            "success"

        );


        if (amountInput) {
            amountInput.value = "";
        }


        if (methodInput) {
            methodInput.value = "";
        }


        if (phoneInput) {
            phoneInput.value = "";
        }


        /* -----------------------------------------
           REFRESH WALLET
        ----------------------------------------- */

        await pakiaMainWalletMaraMoja();


    } catch (error) {

        console.error(
            "tumaWithdrawal ERROR:",
            error
        );


        onyeshaWithdrawalMessage(

            firebaseErrorMessage(
                error
            ),

            "error"

        );


    } finally {

        if (submitBtn) {

            submitBtn.disabled =
                false;

            submitBtn.textContent =
                submitBtn.dataset.originalText ||
                "💸 Tuma Ombi la Withdrawal";

        }

    }
}


/* =========================================================
   7.4 - WITHDRAWAL MESSAGE
========================================================= */

function onyeshaWithdrawalMessage(
    message,
    type = "info"
) {

    const container =
        getElement(
            "withdrawalMessage"
        );


    if (!container) {

        alert(
            message
        );

        return;
    }


    container.textContent =
        message;


    container.className =
        `withdrawal-message withdrawal-${type}`;

}


/* =========================================================
   7.5 - OPEN WITHDRAWAL HISTORY
========================================================= */

function funguaWithdrawalZangu() {

    if (!requireLogin()) {
        return;
    }


    clearMainSections();


    const section =
        getElement(
            "withdrawalSection"
        );


    if (!section) {
        return;
    }


    section.style.display =
        "block";


    section.innerHTML = `

        <div class="roomrent-loading-box">

            <h2>
                📋 Withdrawal Zangu
            </h2>

            <p>
                Inapakia...
            </p>

        </div>

    `;


    anzishaWithdrawalsListener();

}


/* =========================================================
   7.6 - WITHDRAWALS REALTIME LISTENER
========================================================= */

function anzishaWithdrawalsListener() {

    if (!currentUser) {
        return;
    }


    /*
       Hakuna global unsubscribe ya lazima hapa
       kwa sababu tunahifadhi kwenye window.
    */

    if (
        typeof window
            .roomRentWithdrawalUnsubscribe ===
        "function"
    ) {

        try {

            window
                .roomRentWithdrawalUnsubscribe();

        } catch (error) {}

    }


    window.roomRentWithdrawalUnsubscribe =
        db
            .collection("withdrawals")
            .where(
                "uid",
                "==",
                currentUser.uid
            )
            .onSnapshot(

                function (snapshot) {

                    const withdrawals =
                        [];


                    snapshot.forEach(
                        function (doc) {

                            withdrawals.push({

                                id: doc.id,

                                ...doc.data()

                            });

                        }
                    );


                    withdrawals.sort(
                        function (a, b) {

                            const aTime =
                                a.createdAt &&
                                typeof a.createdAt.toMillis ===
                                "function"
                                    ? a.createdAt.toMillis()
                                    : 0;


                            const bTime =
                                b.createdAt &&
                                typeof b.createdAt.toMillis ===
                                "function"
                                    ? b.createdAt.toMillis()
                                    : 0;


                            return bTime - aTime;

                        }
                    );


                    window.roomRentWithdrawals =
                        withdrawals;


                    onyeshaWithdrawalZangu(
                        withdrawals
                    );

                },

                function (error) {

                    console.error(
                        "Withdrawal listener error:",
                        error
                    );


                    const section =
                        getElement(
                            "withdrawalSection"
                        );


                    if (!section) {
                        return;
                    }


                    section.innerHTML = `

                        <div class="roomrent-error-box">

                            <h2>
                                ⚠️ Hitilafu
                            </h2>

                            <p>
                                Imeshindikana kupata
                                withdrawal zako.
                            </p>

                            <small>
                                ${escapeHTML(
                                    firebaseErrorMessage(
                                        error
                                    )
                                )}
                            </small>

                        </div>

                    `;

                }
            );
}


/* =========================================================
   7.7 - DISPLAY WITHDRAWALS
========================================================= */

function onyeshaWithdrawalZangu(
    withdrawals = []
) {

    const section =
        getElement(
            "withdrawalSection"
        );


    if (!section) {
        return;
    }


    let html = `

        <div class="roomrent-withdrawal-history">

            <div class="withdrawal-history-header">

                <button
                    type="button"
                    id="backToWithdrawalForm"
                >
                    ← Toa Pesa
                </button>

                <h2>
                    📋 Withdrawal Zangu
                </h2>

            </div>

    `;


    if (!withdrawals.length) {

        html += `

            <div class="roomrent-empty-box">

                <p>
                    Bado hujafanya withdrawal yoyote.
                </p>

            </div>

        `;

    } else {

        withdrawals.forEach(
            function (withdrawal) {

                html +=
                    tengenezaWithdrawalCard(
                        withdrawal
                    );

            }
        );

    }


    html += `

        </div>

    `;


    section.innerHTML =
        html;


    const backBtn =
        getElement(
            "backToWithdrawalForm"
        );


    if (backBtn) {

        backBtn.onclick =
            function () {

                funguaWithdrawal();

            };

    }

}


/* =========================================================
   7.8 - WITHDRAWAL CARD
========================================================= */

function tengenezaWithdrawalCard(
    withdrawal
) {

    const amount =
        Number(
            withdrawal.amount || 0
        );


    const fee =
        Number(
            withdrawal.fee || 0
        );


    const netAmount =
        Number(
            withdrawal.netAmount ??
            (
                amount -
                fee
            )
        );


    const status =
        withdrawal.status ||
        "pending";


    const statusText =
        formatWithdrawalStatus(
            status
        );


    const method =
        withdrawal.methodName ||
        withdrawal.method ||
        "-";


    const phone =
        withdrawal.phone ||
        "-";


    const createdAt =
        formatFirestoreDate(
            withdrawal.createdAt
        );


    const processedAt =
        formatFirestoreDate(
            withdrawal.processedAt
        );


    return `

        <div
            class="
                roomrent-withdrawal-card
                withdrawal-status-${escapeHTML(
                    status
                )}
            "
        >

            <div class="withdrawal-card-header">

                <strong>
                    ${escapeHTML(
                        statusText
                    )}
                </strong>

                <span>
                    ${escapeHTML(
                        withdrawal.id ||
                        "-"
                    )}
                </span>

            </div>


            <div class="withdrawal-card-body">

                <p>

                    <strong>
                        Kiasi:
                    </strong>

                    ${formatMoney(
                        amount
                    )}

                </p>


                <p>

                    <strong>
                        Fee:
                    </strong>

                    ${formatMoney(
                        fee
                    )}

                </p>


                <p>

                    <strong>
                        Utapokea:
                    </strong>

                    ${formatMoney(
                        netAmount
                    )}

                </p>


                <p>

                    <strong>
                        Njia:
                    </strong>

                    ${escapeHTML(
                        method
                    )}

                </p>


                <p>

                    <strong>
                        Namba:
                    </strong>

                    ${escapeHTML(
                        phone
                    )}

                </p>


                <p>

                    <strong>
                        Iliombwa:
                    </strong>

                    ${escapeHTML(
                        createdAt
                    )}

                </p>


                ${
                    withdrawal.processedAt
                        ? `

                            <p>

                                <strong>
                                    Ilichakatwa:
                                </strong>

                                ${escapeHTML(
                                    processedAt
                                )}

                            </p>

                        `
                        : ""
                }


                ${
                    withdrawal.adminNote
                        ? `

                            <div class="withdrawal-admin-note">

                                <strong>
                                    Ujumbe wa Admin:
                                </strong>

                                <p>
                                    ${escapeHTML(
                                        withdrawal.adminNote
                                    )}
                                </p>

                            </div>

                        `
                        : ""
                }

            </div>

        </div>

    `;

}


/* =========================================================
   7.9 - WITHDRAWAL STATUS
========================================================= */

function formatWithdrawalStatus(
    status
) {

    const statuses = {

        pending:
            "⏳ Inasubiri",

        processing:
            "🔄 Inachakatwa",

        approved:
            "✅ Imekubaliwa",

        completed:
            "✅ Imekamilika",

        rejected:
            "❌ Imekataliwa",

        cancelled:
            "🚫 Imeghairiwa"

    };


    return (
        statuses[status] ||
        status ||
        "Haijulikani"
    );

}


/* =========================================================
   7.10 - STOP WITHDRAWAL LISTENER
========================================================= */

function simamishaWithdrawalsListener() {

    if (
        typeof window
            .roomRentWithdrawalUnsubscribe ===
        "function"
    ) {

        try {

            window
                .roomRentWithdrawalUnsubscribe();

        } catch (error) {

            console.warn(
                "Withdrawal listener cleanup:",
                error
            );

        }

    }


    window.roomRentWithdrawalUnsubscribe =
        null;

}


/* =========================================================
   7.11 - EXPOSE FUNCTIONS
========================================================= */

window.funguaWithdrawal =
    funguaWithdrawal;

window.tumaWithdrawal =
    tumaWithdrawal;

window.funguaWithdrawalZangu =
    funguaWithdrawalZangu;

window.anzishaWithdrawalsListener =
    anzishaWithdrawalsListener;

window.onyeshaWithdrawalZangu =
    onyeshaWithdrawalZangu;

window.tengenezaWithdrawalCard =
    tengenezaWithdrawalCard;

window.formatWithdrawalStatus =
    formatWithdrawalStatus;

window.simamishaWithdrawalsListener =
    simamishaWithdrawalsListener;


/* =========================================================
   MWISHO WA SEHEMU YA 7
========================================================= */
/* =========================================================
   ROOMRENT - SEHEMU YA 8
   ADMIN DASHBOARD + ROOM MANAGEMENT + ROOM PHOTOS
   =========================================================

   MFUMO:
   - Admin pekee ndiye anaweza kufungua Dashboard
   - Admin anaona bookings zote
   - Admin anaweza kuthibitisha/kukataa booking
   - Admin anaweza kusimamia vyumba
   - Admin anaweza kupakia picha za vyumba
   - Picha zinaenda Firebase Storage
   - URL za picha zinaenda Firestore
   - Admin anaweza kufuta picha
   - Mteja ataweza kuona picha za vyumba
   - Hakuna localStorage
   ========================================================= */


/* =========================================================
   8.1 ADMIN CONFIGURATION
========================================================= */

const ROOMRENT_ADMIN_UID =
    "1kj3K591EHhHAOiSoxIp1xGve2x1";


/* =========================================================
   8.2 ADMIN CHECK
========================================================= */

function niAdmin() {

    if (!currentUser) {
        return false;
    }

    return currentUser.uid === ROOMRENT_ADMIN_UID;
}


function requireAdmin() {

    if (!currentUser) {

        alert("⚠️ Tafadhali ingia kwanza.");

        return false;
    }

    if (!niAdmin()) {

        alert("❌ Huna ruhusa ya Admin.");

        return false;
    }

    return true;
}


/* =========================================================
   8.3 OPEN ADMIN DASHBOARD
========================================================= */

function funguaAdminDashboard() {

    if (!requireAdmin()) {
        return;
    }

    clearMainSections();

    const adminSection =
        document.getElementById("adminSection");

    if (!adminSection) {

        alert(
            "❌ adminSection haipo kwenye HTML."
        );

        return;
    }

    adminSection.style.display = "block";

    adminSection.innerHTML = `

        <div class="admin-dashboard">

            <h2>🛠️ RoomRent Admin Dashboard</h2>

            <p>
                Karibu Admin.
                Hapa unaweza kusimamia mfumo wa RoomRent.
            </p>


            <!-- =========================================
                 ADMIN MENU
            ========================================== -->

            <div class="admin-menu">

                <button
                    type="button"
                    id="adminBookingsBtn">
                    📋 Bookings
                </button>

                <button
                    type="button"
                    id="adminRoomsBtn">
                    🏠 Vyumba
                </button>

                <button
                    type="button"
                    id="adminRefreshBtn">
                    🔄 Refresh
                </button>

            </div>


            <!-- =========================================
                 ADMIN CONTENT
            ========================================== -->

            <div id="adminContent">

                <div class="admin-welcome">

                    <h3>👋 Karibu Admin</h3>

                    <p>
                        Chagua sehemu unayotaka
                        kusimamia.
                    </p>

                </div>

            </div>

        </div>
    `;


    const bookingsBtn =
        document.getElementById(
            "adminBookingsBtn"
        );

    const roomsBtn =
        document.getElementById(
            "adminRoomsBtn"
        );

    const refreshBtn =
        document.getElementById(
            "adminRefreshBtn"
        );


    if (bookingsBtn) {

        bookingsBtn.addEventListener(
            "click",
            () => {

                anzishaAdminBookingsListener();

            }
        );
    }


    if (roomsBtn) {

        roomsBtn.addEventListener(
            "click",
            () => {

                funguaAdminVyumba();

            }
        );
    }


    if (refreshBtn) {

        refreshBtn.addEventListener(
            "click",
            () => {

                funguaAdminDashboard();

            }
        );
    }
}


/* =========================================================
   8.4 ADMIN BOOKINGS LISTENER
========================================================= */

function anzishaAdminBookingsListener() {

    if (!requireAdmin()) {
        return;
    }


    if (unsubscribeAdminBookings) {

        unsubscribeAdminBookings();

        unsubscribeAdminBookings = null;
    }


    const content =
        document.getElementById("adminContent");


    if (!content) {
        return;
    }


    content.innerHTML = `

        <h3>📋 Bookings za Wateja</h3>

        <div id="adminBookingsList">

            <p>⏳ Inapakia bookings...</p>

        </div>

    `;


    unsubscribeAdminBookings =
        db.collection("bookings")
          .onSnapshot(

        snapshot => {

            const bookings = [];


            snapshot.forEach(doc => {

                bookings.push({

                    id: doc.id,

                    ...doc.data()

                });

            });


            bookings.sort(
                (a, b) => {

                    const timeA =
                        a.createdAt &&
                        a.createdAt.toMillis
                            ? a.createdAt.toMillis()
                            : 0;

                    const timeB =
                        b.createdAt &&
                        b.createdAt.toMillis
                            ? b.createdAt.toMillis()
                            : 0;

                    return timeB - timeA;

                }
            );


            onyeshaAdminBookings(
                bookings
            );

        },

        error => {

            console.error(
                "Admin bookings error:",
                error
            );


            const list =
                document.getElementById(
                    "adminBookingsList"
                );


            if (list) {

                list.innerHTML = `

                    <p>
                        ❌ Imeshindikana kupakia
                        bookings.
                    </p>

                `;

            }

        }

    );
}


/* =========================================================
   8.5 DISPLAY ADMIN BOOKINGS
========================================================= */

function onyeshaAdminBookings(bookings) {

    const list =
        document.getElementById(
            "adminBookingsList"
        );


    if (!list) {
        return;
    }


    if (!bookings.length) {

        list.innerHTML = `

            <div class="empty-state">

                <h3>📭 Hakuna booking bado.</h3>

            </div>

        `;

        return;
    }


    list.innerHTML = bookings
        .map(booking => {

            return tengenezaAdminBookingCard(
                booking
            );

        })
        .join("");


    document
        .querySelectorAll(
            ".admin-booking-details-btn"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const bookingNumber =
                        button.dataset.booking;

                    funguaAdminBookingDetails(
                        bookingNumber
                    );

                }
            );

        });


    document
        .querySelectorAll(
            ".admin-confirm-booking-btn"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const bookingNumber =
                        button.dataset.booking;

                    thibitishaBookingAdmin(
                        bookingNumber
                    );

                }
            );

        });


    document
        .querySelectorAll(
            ".admin-reject-booking-btn"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const bookingNumber =
                        button.dataset.booking;

                    kataaBookingAdmin(
                        bookingNumber
                    );

                }
            );

        });

}


/* =========================================================
   8.6 ADMIN BOOKING CARD
========================================================= */

function tengenezaAdminBookingCard(
    booking
) {

    const status =
        booking.status ||
        "unknown";


    let actionButtons = "";


    if (
        status === "payment_pending"
    ) {

        actionButtons = `

            <button
                type="button"
                class="admin-confirm-booking-btn"
                data-booking="${escapeHTML(
                    booking.bookingNumber || ""
                )}">

                ✅ Thibitisha

            </button>


            <button
                type="button"
                class="admin-reject-booking-btn"
                data-booking="${escapeHTML(
                    booking.bookingNumber || ""
                )}">

                ❌ Kataa

            </button>

        `;

    }


    return `

        <div class="admin-booking-card">

            <h3>
                🧾 ${escapeHTML(
                    booking.bookingNumber || "-"
                )}
            </h3>


            <p>
                👤
                <strong>Mteja:</strong>
                ${escapeHTML(
                    booking.customerName || "-"
                )}
            </p>


            <p>
                📱
                <strong>Simu:</strong>
                ${escapeHTML(
                    booking.customerPhone ||
                    booking.phone ||
                    "-"
                )}
            </p>


            <p>
                🏠
                <strong>Chumba:</strong>
                ${escapeHTML(
                    booking.roomNumber || "-"
                )}
            </p>


            <p>
                💰
                <strong>Kiasi:</strong>
                ${formatMoney(
                    booking.amount ||
                    booking.price ||
                    0
                )}
            </p>


            <p>
                📌
                <strong>Status:</strong>
                ${escapeHTML(
                    formatBookingStatus(
                        status
                    )
                )}
            </p>


            <div class="admin-booking-actions">

                <button
                    type="button"
                    class="admin-booking-details-btn"
                    data-booking="${escapeHTML(
                        booking.bookingNumber || ""
                    )}">

                    👁️ Maelezo

                </button>


                ${actionButtons}

            </div>

        </div>

    `;

}


/* =========================================================
   8.7 ADMIN BOOKING DETAILS
========================================================= */

async function funguaAdminBookingDetails(
    bookingNumber
) {

    if (!requireAdmin()) {
        return;
    }


    try {

        const snap =
            await db
                .collection("bookings")
                .doc(bookingNumber)
                .get();


        if (!snap.exists) {

            alert(
                "❌ Booking haijapatikana."
            );

            return;
        }


        const booking =
            snap.data();


        const content =
            document.getElementById(
                "adminContent"
            );


        if (!content) {
            return;
        }


        content.innerHTML = `

            <div class="admin-booking-details">

                <button
                    type="button"
                    id="backToAdminBookingsBtn">

                    ← Rudi kwenye Bookings

                </button>


                <h3>
                    🧾 Maelezo ya Booking
                </h3>


                <p>
                    <strong>Booking:</strong>
                    ${escapeHTML(
                        booking.bookingNumber || "-"
                    )}
                </p>


                <p>
                    <strong>Mteja:</strong>
                    ${escapeHTML(
                        booking.customerName || "-"
                    )}
                </p>


                <p>
                    <strong>Email:</strong>
                    ${escapeHTML(
                        booking.customerEmail || "-"
                    )}
                </p>


                <p>
                    <strong>Simu:</strong>
                    ${escapeHTML(
                        booking.customerPhone ||
                        booking.phone ||
                        "-"
                    )}
                </p>


                <p>
                    <strong>Chumba:</strong>
                    ${escapeHTML(
                        booking.roomNumber || "-"
                    )}
                </p>


                <p>
                    <strong>Bei:</strong>
                    ${formatMoney(
                        booking.amount ||
                        booking.price ||
                        0
                    )}
                </p>


                <p>
                    <strong>Faida kwa siku:</strong>
                    ${formatMoney(
                        booking.profitPerDay || 0
                    )}
                </p>


                <p>
                    <strong>Siku:</strong>
                    ${Number(
                        booking.durationDays ||
                        booking.days ||
                        0
                    )}
                </p>


                <p>
                    <strong>Faida yote:</strong>
                    ${formatMoney(
                        booking.totalProfit || 0
                    )}
                </p>


                <p>
                    <strong>Jumla ya malipo:</strong>
                    ${formatMoney(
                        booking.totalPayout || 0
                    )}
                </p>


                <p>
                    <strong>Njia ya malipo:</strong>
                    ${escapeHTML(
                        booking.paymentMethod || "-"
                    )}
                </p>


                <p>
                    <strong>Namba iliyotuma:</strong>
                    ${escapeHTML(
                        booking.senderPhone || "-"
                    )}
                </p>


                <p>
                    <strong>Reference:</strong>
                    ${escapeHTML(
                        booking.paymentReference ||
                        "-"
                    )}
                </p>


                <p>
                    <strong>Status:</strong>
                    ${escapeHTML(
                        formatBookingStatus(
                            booking.status || ""
                        )
                    )}
                </p>


                ${
                    booking.rejectionReason
                    ? `
                        <p>
                            <strong>
                                Sababu ya kukataa:
                            </strong>

                            ${escapeHTML(
                                booking.rejectionReason
                            )}

                        </p>
                    `
                    : ""
                }


                ${
                    booking.status ===
                    "payment_pending"
                    ? `

                        <div class="admin-booking-actions">

                            <button
                                type="button"
                                id="detailsConfirmBookingBtn">

                                ✅ Thibitisha Booking

                            </button>


                            <button
                                type="button"
                                id="detailsRejectBookingBtn">

                                ❌ Kataa Booking

                            </button>

                        </div>

                    `
                    : ""
                }

            </div>

        `;


        const backBtn =
            document.getElementById(
                "backToAdminBookingsBtn"
            );


        if (backBtn) {

            backBtn.addEventListener(
                "click",
                () => {

                    anzishaAdminBookingsListener();

                }
            );

        }


        const confirmBtn =
            document.getElementById(
                "detailsConfirmBookingBtn"
            );


        if (confirmBtn) {

            confirmBtn.addEventListener(
                "click",
                () => {

                    thibitishaBookingAdmin(
                        booking.bookingNumber
                    );

                }
            );

        }


        const rejectBtn =
            document.getElementById(
                "detailsRejectBookingBtn"
            );


        if (rejectBtn) {

            rejectBtn.addEventListener(
                "click",
                () => {

                    kataaBookingAdmin(
                        booking.bookingNumber
                    );

                }
            );

        }


    } catch (error) {

        console.error(
            "Admin booking details error:",
            error
        );


        alert(
            "❌ Imeshindikana kufungua booking."
        );

    }

}


/* =========================================================
   8.8 ADMIN CONFIRM BOOKING
========================================================= */

async function thibitishaBookingAdmin(
    bookingNumber
) {

    if (!requireAdmin()) {
        return;
    }


    const confirmAction =
        confirm(
            "Una uhakika unataka kuthibitisha booking hii?"
        );


    if (!confirmAction) {
        return;
    }


    if (
        typeof firebase === "undefined" ||
        !firebase.functions
    ) {

        alert(
            "❌ Firebase Functions SDK haijaunganishwa kwenye HTML."
        );

        return;
    }


    try {

        const functions =
            firebase.functions();


        const confirmBooking =
            functions.httpsCallable(
                "confirmBooking"
            );


        await confirmBooking({

            bookingNumber:
                bookingNumber

        });


        alert(
            "✅ Booking imethibitishwa."
        );


    } catch (error) {

        console.error(
            "Confirm booking error:",
            error
        );


        alert(
            "❌ Imeshindikana kuthibitisha booking:\n" +
            firebaseErrorMessage(error)
        );

    }

}


/* =========================================================
   8.9 ADMIN REJECT BOOKING
========================================================= */

async function kataaBookingAdmin(
    bookingNumber
) {

    if (!requireAdmin()) {
        return;
    }


    const reason =
        prompt(
            "Andika sababu ya kukataa booking:"
        );


    if (
        reason === null
    ) {
        return;
    }


    const cleanReason =
        reason.trim();


    if (!cleanReason) {

        alert(
            "❌ Lazima uweke sababu."
        );

        return;
    }


    if (
        typeof firebase === "undefined" ||
        !firebase.functions
    ) {

        alert(
            "❌ Firebase Functions SDK haijaunganishwa kwenye HTML."
        );

        return;
    }


    try {

        const functions =
            firebase.functions();


        const rejectBooking =
            functions.httpsCallable(
                "rejectBooking"
            );


        await rejectBooking({

            bookingNumber:
                bookingNumber,

            reason:
                cleanReason

        });


        alert(
            "✅ Booking imekataliwa."
        );


    } catch (error) {

        console.error(
            "Reject booking error:",
            error
        );


        alert(
            "❌ Imeshindikana kukataa booking:\n" +
            firebaseErrorMessage(error)
        );

    }

}


/* =========================================================
   8.10 ADMIN ROOMS MANAGEMENT
========================================================= */

function funguaAdminVyumba() {

    if (!requireAdmin()) {
        return;
    }


    const content =
        document.getElementById(
            "adminContent"
        );


    if (!content) {
        return;
    }


    content.innerHTML = `

        <div class="admin-rooms">

            <h3>
                🏠 Usimamizi wa Vyumba
            </h3>


            <p>
                Hapa Admin anaweza kuweka
                na kusimamia picha za vyumba.
            </p>


            <div id="adminRoomsList">

                <p>
                    ⏳ Inapakia vyumba...
                </p>

            </div>

        </div>

    `;


    onyeshaAdminRooms();

}


/* =========================================================
   8.11 DISPLAY ADMIN ROOMS
========================================================= */

async function onyeshaAdminRooms() {

    if (!requireAdmin()) {
        return;
    }


    const container =
        document.getElementById(
            "adminRoomsList"
        );


    if (!container) {
        return;
    }


    try {

        const roomSnapshots =
            await db
                .collection("rooms")
                .get();


        const firestoreRooms = {};


        roomSnapshots.forEach(
            doc => {

                firestoreRooms[
                    doc.id
                ] = doc.data();

            }
        );


        container.innerHTML =
            ROOMS.map(room => {

                const roomData =
                    firestoreRooms[
                        room.roomNumber
                    ] || {};


                const imageUrls =
                    Array.isArray(
                        roomData.imageUrls
                    )
                        ? roomData.imageUrls
                        : [];


                const imagesHTML =
                    imageUrls.length
                        ? imageUrls
                            .map(
                                (
                                    url,
                                    index
                                ) => `

                                    <div
                                        class="admin-room-image">

                                        <img
                                            src="${escapeHTML(
                                                url
                                            )}"
                                            alt="${escapeHTML(
                                                room.name ||
                                                room.roomNumber
                                            )}"
                                            loading="lazy"
                                        />


                                        <button
                                            type="button"
                                            class="delete-room-image-btn"
                                            data-room="${escapeHTML(
                                                room.roomNumber
                                            )}"
                                            data-url="${escapeHTML(
                                                url
                                            )}">

                                            🗑️ Futa

                                        </button>

                                    </div>

                                `
                            )
                            .join("")
                        : `

                            <p>
                                📷 Hakuna picha
                                iliyowekwa bado.
                            </p>

                        `;


                return `

                    <div
                        class="admin-room-card"
                        data-room="${escapeHTML(
                            room.roomNumber
                        )}">

                        <h3>
                            🏠
                            ${escapeHTML(
                                room.name ||
                                "Chumba"
                            )}
                        </h3>


                        <p>
                            <strong>
                                Namba:
                            </strong>

                            ${escapeHTML(
                                room.roomNumber
                            )}
                        </p>


                        <p>
                            <strong>
                                Bei:
                            </strong>

                            ${formatMoney(
                                room.price
                            )}
                        </p>


                        <p>
                            <strong>
                                Faida kwa siku:
                            </strong>

                            ${formatMoney(
                                room.profitPerDay
                            )}
                        </p>


                        <p>
                            <strong>
                                Muda:
                            </strong>

                            ${Number(
                                room.days ||
                                ROOMRENT_SETTINGS.durationDays
                            )}
                            siku
                        </p>


                        <hr>


                        <h4>
                            📸 Picha za Chumba
                        </h4>


                        <div
                            class="admin-room-images">

                            ${imagesHTML}

                        </div>


                        <div
                            class="admin-room-upload">

                            <label>
                                Ongeza picha:
                            </label>


                            <input
                                type="file"
                                class="room-photo-input"
                                data-room="${escapeHTML(
                                    room.roomNumber
                                )}"
                                accept="image/*"
                            />


                            <button
                                type="button"
                                class="upload-room-photo-btn"
                                data-room="${escapeHTML(
                                    room.roomNumber
                                )}">

                                📤 Pakia Picha

                            </button>


                            <div
                                class="room-upload-status"
                                id="uploadStatus-${escapeHTML(
                                    room.roomNumber
                                )}">
                            </div>

                        </div>

                    </div>

                `;

            }).join("");


        anzishaAdminRoomPhotoListeners();


    } catch (error) {

        console.error(
            "Admin rooms error:",
            error
        );


        container.innerHTML = `

            <p>
                ❌ Imeshindikana kupakia
                vyumba.
            </p>

        `;

    }

}


/* =========================================================
   8.12 ROOM PHOTO LISTENERS
========================================================= */

function anzishaAdminRoomPhotoListeners() {


    document
        .querySelectorAll(
            ".upload-room-photo-btn"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                async () => {

                    const roomNumber =
                        button.dataset.room;


                    const input =
                        document.querySelector(
                            `.room-photo-input[data-room="${CSS.escape(
                                roomNumber
                            )}"]`
                        );


                    if (!input) {
                        return;
                    }


                    const file =
                        input.files &&
                        input.files[0];


                    if (!file) {

                        alert(
                            "❌ Chagua picha kwanza."
                        );

                        return;
                    }


                    await pakiaPichaYaChumba(
                        roomNumber,
                        file
                    );

                }
            );

        });


    document
        .querySelectorAll(
            ".delete-room-image-btn"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                async () => {

                    const roomNumber =
                        button.dataset.room;

                    const imageUrl =
                        button.dataset.url;


                    await futaPichaYaChumba(
                        roomNumber,
                        imageUrl
                    );

                }
            );

        });

}


/* =========================================================
   8.13 UPLOAD ROOM PHOTO
========================================================= */

async function pakiaPichaYaChumba(
    roomNumber,
    file
) {

    if (!requireAdmin()) {
        return;
    }


    if (!file) {

        alert(
            "❌ Picha haijapatikana."
        );

        return;
    }


    if (
        !file.type ||
        !file.type.startsWith("image/")
    ) {

        alert(
            "❌ Tafadhali chagua faili la picha."
        );

        return;
    }


    /*
       Limit ya browser.
       Security Rules za Storage nazo
       zitakuwa na limit ya mwisho.
    */

    const maxSize =
        10 * 1024 * 1024;


    if (file.size > maxSize) {

        alert(
            "❌ Picha ni kubwa sana. " +
            "Maximum ni 10MB."
        );

        return;
    }


    const statusElement =
        document.getElementById(
            `uploadStatus-${roomNumber}`
        );


    if (statusElement) {

        statusElement.innerHTML =
            "⏳ Inapakia picha...";

    }


    try {

        if (
            typeof firebase === "undefined" ||
            !firebase.storage
        ) {

            throw new Error(
                "Firebase Storage SDK haijaunganishwa."
            );

        }


        const safeFileName =
            file.name
                .replace(
                    /[^a-zA-Z0-9._-]/g,
                    "_"
                );


        const uniqueFileName =
            Date.now() +
            "_" +
            Math.random()
                .toString(36)
                .substring(2, 8) +
            "_" +
            safeFileName;


        const storagePath =
            `rooms/${roomNumber}/${uniqueFileName}`;


        const storageRef =
            firebase
                .storage()
                .ref()
                .child(storagePath);


        const uploadTask =
            await storageRef.put(file);


        const downloadURL =
            await uploadTask.ref
                .getDownloadURL();


        const roomRef =
            db
                .collection("rooms")
                .doc(roomNumber);


        await roomRef.set(

            {

                roomNumber:
                    roomNumber,

                imageUrls:
                    firebase.firestore.FieldValue
                        .arrayUnion(
                            downloadURL
                        ),

                updatedAt:
                    serverTimestamp(),

                updatedBy:
                    currentUser.uid

            },

            {

                merge: true

            }

        );


        if (statusElement) {

            statusElement.innerHTML =
                "✅ Picha imewekwa.";

        }


        alert(
            "✅ Picha ya chumba imepakiwa."
        );


        await onyeshaAdminRooms();


    } catch (error) {

        console.error(
            "Room photo upload error:",
            error
        );


        if (statusElement) {

            statusElement.innerHTML =
                "❌ Imeshindikana kupakia.";

        }


        alert(
            "❌ Imeshindikana kupakia picha:\n" +
            firebaseErrorMessage(error)
        );

    }

}


/* =========================================================
   8.14 DELETE ROOM PHOTO
========================================================= */

async function futaPichaYaChumba(
    roomNumber,
    imageUrl
) {

    if (!requireAdmin()) {
        return;
    }


    const confirmDelete =
        confirm(
            "Una uhakika unataka kufuta picha hii?"
        );


    if (!confirmDelete) {
        return;
    }


    try {

        /*
           Ondoa URL kutoka Firestore.
        */

        await db
            .collection("rooms")
            .doc(roomNumber)
            .update({

                imageUrls:
                    firebase.firestore.FieldValue
                        .arrayRemove(
                            imageUrl
                        ),

                updatedAt:
                    serverTimestamp(),

                updatedBy:
                    currentUser.uid

            });


        /*
           Jaribu pia kufuta file
           kutoka Firebase Storage.
        */

        try {

            await firebase
                .storage()
                .refFromURL(
                    imageUrl
                )
                .delete();

        } catch (
            storageDeleteError
        ) {

            console.warn(
                "Storage delete warning:",
                storageDeleteError
            );

        }


        alert(
            "✅ Picha imefutwa."
        );


        await onyeshaAdminRooms();


    } catch (error) {

        console.error(
            "Delete room image error:",
            error
        );


        alert(
            "❌ Imeshindikana kufuta picha:\n" +
            firebaseErrorMessage(error)
        );

    }

}


/* =========================================================
   8.15 GET ROOM IMAGES
========================================================= */

async function pataPichaZaChumba(
    roomNumber
) {

    try {

        const snap =
            await db
                .collection("rooms")
                .doc(roomNumber)
                .get();


        if (!snap.exists) {
            return [];
        }


        const data =
            snap.data();


        if (
            !Array.isArray(
                data.imageUrls
            )
        ) {

            return [];

        }


        return data.imageUrls;

    } catch (error) {

        console.error(
            "Get room images error:",
            error
        );

        return [];

    }

}


/* =========================================================
   8.16 GET ALL ROOM IMAGES
========================================================= */

async function pataPichaZaVyumbaVyote() {

    const result = {};


    try {

        const snapshot =
            await db
                .collection("rooms")
                .get();


        snapshot.forEach(
            doc => {

                const data =
                    doc.data();


                result[
                    doc.id
                ] =
                    Array.isArray(
                        data.imageUrls
                    )
                        ? data.imageUrls
                        : [];

            }
        );


    } catch (error) {

        console.error(
            "Get all room images error:",
            error
        );

    }


    return result;
}


/* =========================================================
   8.17 SAVE ROOM BASE DATA
   Admin anaweza kuweka taarifa za
   chumba kwenye Firestore bila
   kuondoa picha zilizopo.
========================================================= */

async function hifadhiRoomDataYaAdmin(
    roomNumber
) {

    if (!requireAdmin()) {
        return;
    }


    const room =
        pataRoom(roomNumber);


    if (!room) {

        alert(
            "❌ Chumba hakijapatikana."
        );

        return;
    }


    try {

        await db
            .collection("rooms")
            .doc(roomNumber)
            .set(

                {

                    roomNumber:
                        room.roomNumber,

                    name:
                        room.name || "",

                    price:
                        Number(room.price || 0),

                    profitPerDay:
                        Number(
                            room.profitPerDay ||
                            0
                        ),

                    days:
                        Number(
                            room.days ||
                            ROOMRENT_SETTINGS.durationDays
                        ),

                    updatedAt:
                        serverTimestamp(),

                    updatedBy:
                        currentUser.uid

                },

                {

                    merge: true

                }

            );


    } catch (error) {

        console.error(
            "Save room data error:",
            error
        );

        throw error;

    }

}


/* =========================================================
   8.18 REFRESH ADMIN BOOKINGS
========================================================= */

function refreshAdminBookings() {

    if (!requireAdmin()) {
        return;
    }


    anzishaAdminBookingsListener();

}


/* =========================================================
   8.19 STOP ADMIN LISTENER
========================================================= */

function simamishaAdminBookingsListener() {

    if (
        unsubscribeAdminBookings
    ) {

        unsubscribeAdminBookings();

        unsubscribeAdminBookings = null;

    }

}


/* =========================================================
   8.20 CLEAN ADMIN DATA
========================================================= */

function safishaAdminData() {

    simamishaAdminBookingsListener();


    const adminSection =
        document.getElementById(
            "adminSection"
        );


    if (adminSection) {

        adminSection.innerHTML = "";

        adminSection.style.display =
            "none";

    }

}


/* =========================================================
   8.21 EXPOSE ADMIN FUNCTIONS
========================================================= */

window.niAdmin =
    niAdmin;

window.requireAdmin =
    requireAdmin;

window.funguaAdminDashboard =
    funguaAdminDashboard;

window.anzishaAdminBookingsListener =
    anzishaAdminBookingsListener;

window.onyeshaAdminBookings =
    onyeshaAdminBookings;

window.tengenezaAdminBookingCard =
    tengenezaAdminBookingCard;

window.funguaAdminBookingDetails =
    funguaAdminBookingDetails;

window.thibitishaBookingAdmin =
    thibitishaBookingAdmin;

window.kataaBookingAdmin =
    kataaBookingAdmin;

window.funguaAdminVyumba =
    funguaAdminVyumba;

window.onyeshaAdminRooms =
    onyeshaAdminRooms;

window.pakiaPichaYaChumba =
    pakiaPichaYaChumba;

window.futaPichaYaChumba =
    futaPichaYaChumba;

window.pataPichaZaChumba =
    pataPichaZaChumba;

window.pataPichaZaVyumbaVyote =
    pataPichaZaVyumbaVyote;

window.hifadhiRoomDataYaAdmin =
    hifadhiRoomDataYaAdmin;

window.refreshAdminBookings =
    refreshAdminBookings;

window.simamishaAdminBookingsListener =
    simamishaAdminBookingsListener;

window.safishaAdminData =
    safishaAdminData;


/* =========================================================
   MWISHO WA SEHEMU YA 8
========================================================= *//* =========================================================
   ROOMRENT - SEHEMU YA 8
   ADMIN DASHBOARD + ROOM MANAGEMENT + ROOM PHOTOS
   =========================================================

   MFUMO:
   - Admin pekee ndiye anaweza kufungua Dashboard
   - Admin anaona bookings zote
   - Admin anaweza kuthibitisha/kukataa booking
   - Admin anaweza kusimamia vyumba
   - Admin anaweza kupakia picha za vyumba
   - Picha zinaenda Firebase Storage
   - URL za picha zinaenda Firestore
   - Admin anaweza kufuta picha
   - Mteja ataweza kuona picha za vyumba
   - Hakuna localStorage
   ========================================================= */


/* =========================================================
   8.1 ADMIN CONFIGURATION
========================================================= */

const ROOMRENT_ADMIN_UID =
    "1kj3K591EHhHAOiSoxIp1xGve2x1";


/* =========================================================
   8.2 ADMIN CHECK
========================================================= */

function niAdmin() {

    if (!currentUser) {
        return false;
    }

    return currentUser.uid === ROOMRENT_ADMIN_UID;
}


function requireAdmin() {

    if (!currentUser) {

        alert("⚠️ Tafadhali ingia kwanza.");

        return false;
    }

    if (!niAdmin()) {

        alert("❌ Huna ruhusa ya Admin.");

        return false;
    }

    return true;
}


/* =========================================================
   8.3 OPEN ADMIN DASHBOARD
========================================================= */

function funguaAdminDashboard() {

    if (!requireAdmin()) {
        return;
    }

    clearMainSections();

    const adminSection =
        document.getElementById("adminSection");

    if (!adminSection) {

        alert(
            "❌ adminSection haipo kwenye HTML."
        );

        return;
    }

    adminSection.style.display = "block";

    adminSection.innerHTML = `

        <div class="admin-dashboard">

            <h2>🛠️ RoomRent Admin Dashboard</h2>

            <p>
                Karibu Admin.
                Hapa unaweza kusimamia mfumo wa RoomRent.
            </p>


            <!-- =========================================
                 ADMIN MENU
            ========================================== -->

            <div class="admin-menu">

                <button
                    type="button"
                    id="adminBookingsBtn">
                    📋 Bookings
                </button>

                <button
                    type="button"
                    id="adminRoomsBtn">
                    🏠 Vyumba
                </button>

                <button
                    type="button"
                    id="adminRefreshBtn">
                    🔄 Refresh
                </button>

            </div>


            <!-- =========================================
                 ADMIN CONTENT
            ========================================== -->

            <div id="adminContent">

                <div class="admin-welcome">

                    <h3>👋 Karibu Admin</h3>

                    <p>
                        Chagua sehemu unayotaka
                        kusimamia.
                    </p>

                </div>

            </div>

        </div>
    `;


    const bookingsBtn =
        document.getElementById(
            "adminBookingsBtn"
        );

    const roomsBtn =
        document.getElementById(
            "adminRoomsBtn"
        );

    const refreshBtn =
        document.getElementById(
            "adminRefreshBtn"
        );


    if (bookingsBtn) {

        bookingsBtn.addEventListener(
            "click",
            () => {

                anzishaAdminBookingsListener();

            }
        );
    }


    if (roomsBtn) {

        roomsBtn.addEventListener(
            "click",
            () => {

                funguaAdminVyumba();

            }
        );
    }


    if (refreshBtn) {

        refreshBtn.addEventListener(
            "click",
            () => {

                funguaAdminDashboard();

            }
        );
    }
}


/* =========================================================
   8.4 ADMIN BOOKINGS LISTENER
========================================================= */

function anzishaAdminBookingsListener() {

    if (!requireAdmin()) {
        return;
    }


    if (unsubscribeAdminBookings) {

        unsubscribeAdminBookings();

        unsubscribeAdminBookings = null;
    }


    const content =
        document.getElementById("adminContent");


    if (!content) {
        return;
    }


    content.innerHTML = `

        <h3>📋 Bookings za Wateja</h3>

        <div id="adminBookingsList">

            <p>⏳ Inapakia bookings...</p>

        </div>

    `;


    unsubscribeAdminBookings =
        db.collection("bookings")
          .onSnapshot(

        snapshot => {

            const bookings = [];


            snapshot.forEach(doc => {

                bookings.push({

                    id: doc.id,

                    ...doc.data()

                });

            });


            bookings.sort(
                (a, b) => {

                    const timeA =
                        a.createdAt &&
                        a.createdAt.toMillis
                            ? a.createdAt.toMillis()
                            : 0;

                    const timeB =
                        b.createdAt &&
                        b.createdAt.toMillis
                            ? b.createdAt.toMillis()
                            : 0;

                    return timeB - timeA;

                }
            );


            onyeshaAdminBookings(
                bookings
            );

        },

        error => {

            console.error(
                "Admin bookings error:",
                error
            );


            const list =
                document.getElementById(
                    "adminBookingsList"
                );


            if (list) {

                list.innerHTML = `

                    <p>
                        ❌ Imeshindikana kupakia
                        bookings.
                    </p>

                `;

            }

        }

    );
}


/* =========================================================
   8.5 DISPLAY ADMIN BOOKINGS
========================================================= */

function onyeshaAdminBookings(bookings) {

    const list =
        document.getElementById(
            "adminBookingsList"
        );


    if (!list) {
        return;
    }


    if (!bookings.length) {

        list.innerHTML = `

            <div class="empty-state">

                <h3>📭 Hakuna booking bado.</h3>

            </div>

        `;

        return;
    }


    list.innerHTML = bookings
        .map(booking => {

            return tengenezaAdminBookingCard(
                booking
            );

        })
        .join("");


    document
        .querySelectorAll(
            ".admin-booking-details-btn"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const bookingNumber =
                        button.dataset.booking;

                    funguaAdminBookingDetails(
                        bookingNumber
                    );

                }
            );

        });


    document
        .querySelectorAll(
            ".admin-confirm-booking-btn"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const bookingNumber =
                        button.dataset.booking;

                    thibitishaBookingAdmin(
                        bookingNumber
                    );

                }
            );

        });


    document
        .querySelectorAll(
            ".admin-reject-booking-btn"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const bookingNumber =
                        button.dataset.booking;

                    kataaBookingAdmin(
                        bookingNumber
                    );

                }
            );

        });

}


/* =========================================================
   8.6 ADMIN BOOKING CARD
========================================================= */

function tengenezaAdminBookingCard(
    booking
) {

    const status =
        booking.status ||
        "unknown";


    let actionButtons = "";


    if (
        status === "payment_pending"
    ) {

        actionButtons = `

            <button
                type="button"
                class="admin-confirm-booking-btn"
                data-booking="${escapeHTML(
                    booking.bookingNumber || ""
                )}">

                ✅ Thibitisha

            </button>


            <button
                type="button"
                class="admin-reject-booking-btn"
                data-booking="${escapeHTML(
                    booking.bookingNumber || ""
                )}">

                ❌ Kataa

            </button>

        `;

    }


    return `

        <div class="admin-booking-card">

            <h3>
                🧾 ${escapeHTML(
                    booking.bookingNumber || "-"
                )}
            </h3>


            <p>
                👤
                <strong>Mteja:</strong>
                ${escapeHTML(
                    booking.customerName || "-"
                )}
            </p>


            <p>
                📱
                <strong>Simu:</strong>
                ${escapeHTML(
                    booking.customerPhone ||
                    booking.phone ||
                    "-"
                )}
            </p>


            <p>
                🏠
                <strong>Chumba:</strong>
                ${escapeHTML(
                    booking.roomNumber || "-"
                )}
            </p>


            <p>
                💰
                <strong>Kiasi:</strong>
                ${formatMoney(
                    booking.amount ||
                    booking.price ||
                    0
                )}
            </p>


            <p>
                📌
                <strong>Status:</strong>
                ${escapeHTML(
                    formatBookingStatus(
                        status
                    )
                )}
            </p>


            <div class="admin-booking-actions">

                <button
                    type="button"
                    class="admin-booking-details-btn"
                    data-booking="${escapeHTML(
                        booking.bookingNumber || ""
                    )}">

                    👁️ Maelezo

                </button>


                ${actionButtons}

            </div>

        </div>

    `;

}


/* =========================================================
   8.7 ADMIN BOOKING DETAILS
========================================================= */

async function funguaAdminBookingDetails(
    bookingNumber
) {

    if (!requireAdmin()) {
        return;
    }


    try {

        const snap =
            await db
                .collection("bookings")
                .doc(bookingNumber)
                .get();


        if (!snap.exists) {

            alert(
                "❌ Booking haijapatikana."
            );

            return;
        }


        const booking =
            snap.data();


        const content =
            document.getElementById(
                "adminContent"
            );


        if (!content) {
            return;
        }


        content.innerHTML = `

            <div class="admin-booking-details">

                <button
                    type="button"
                    id="backToAdminBookingsBtn">

                    ← Rudi kwenye Bookings

                </button>


                <h3>
                    🧾 Maelezo ya Booking
                </h3>


                <p>
                    <strong>Booking:</strong>
                    ${escapeHTML(
                        booking.bookingNumber || "-"
                    )}
                </p>


                <p>
                    <strong>Mteja:</strong>
                    ${escapeHTML(
                        booking.customerName || "-"
                    )}
                </p>


                <p>
                    <strong>Email:</strong>
                    ${escapeHTML(
                        booking.customerEmail || "-"
                    )}
                </p>


                <p>
                    <strong>Simu:</strong>
                    ${escapeHTML(
                        booking.customerPhone ||
                        booking.phone ||
                        "-"
                    )}
                </p>


                <p>
                    <strong>Chumba:</strong>
                    ${escapeHTML(
                        booking.roomNumber || "-"
                    )}
                </p>


                <p>
                    <strong>Bei:</strong>
                    ${formatMoney(
                        booking.amount ||
                        booking.price ||
                        0
                    )}
                </p>


                <p>
                    <strong>Faida kwa siku:</strong>
                    ${formatMoney(
                        booking.profitPerDay || 0
                    )}
                </p>


                <p>
                    <strong>Siku:</strong>
                    ${Number(
                        booking.durationDays ||
                        booking.days ||
                        0
                    )}
                </p>


                <p>
                    <strong>Faida yote:</strong>
                    ${formatMoney(
                        booking.totalProfit || 0
                    )}
                </p>


                <p>
                    <strong>Jumla ya malipo:</strong>
                    ${formatMoney(
                        booking.totalPayout || 0
                    )}
                </p>


                <p>
                    <strong>Njia ya malipo:</strong>
                    ${escapeHTML(
                        booking.paymentMethod || "-"
                    )}
                </p>


                <p>
                    <strong>Namba iliyotuma:</strong>
                    ${escapeHTML(
                        booking.senderPhone || "-"
                    )}
                </p>


                <p>
                    <strong>Reference:</strong>
                    ${escapeHTML(
                        booking.paymentReference ||
                        "-"
                    )}
                </p>


                <p>
                    <strong>Status:</strong>
                    ${escapeHTML(
                        formatBookingStatus(
                            booking.status || ""
                        )
                    )}
                </p>


                ${
                    booking.rejectionReason
                    ? `
                        <p>
                            <strong>
                                Sababu ya kukataa:
                            </strong>

                            ${escapeHTML(
                                booking.rejectionReason
                            )}

                        </p>
                    `
                    : ""
                }


                ${
                    booking.status ===
                    "payment_pending"
                    ? `

                        <div class="admin-booking-actions">

                            <button
                                type="button"
                                id="detailsConfirmBookingBtn">

                                ✅ Thibitisha Booking

                            </button>


                            <button
                                type="button"
                                id="detailsRejectBookingBtn">

                                ❌ Kataa Booking

                            </button>

                        </div>

                    `
                    : ""
                }

            </div>

        `;


        const backBtn =
            document.getElementById(
                "backToAdminBookingsBtn"
            );


        if (backBtn) {

            backBtn.addEventListener(
                "click",
                () => {

                    anzishaAdminBookingsListener();

                }
            );

        }


        const confirmBtn =
            document.getElementById(
                "detailsConfirmBookingBtn"
            );


        if (confirmBtn) {

            confirmBtn.addEventListener(
                "click",
                () => {

                    thibitishaBookingAdmin(
                        booking.bookingNumber
                    );

                }
            );

        }


        const rejectBtn =
            document.getElementById(
                "detailsRejectBookingBtn"
            );


        if (rejectBtn) {

            rejectBtn.addEventListener(
                "click",
                () => {

                    kataaBookingAdmin(
                        booking.bookingNumber
                    );

                }
            );

        }


    } catch (error) {

        console.error(
            "Admin booking details error:",
            error
        );


        alert(
            "❌ Imeshindikana kufungua booking."
        );

    }

}


/* =========================================================
   8.8 ADMIN CONFIRM BOOKING
========================================================= */

async function thibitishaBookingAdmin(
    bookingNumber
) {

    if (!requireAdmin()) {
        return;
    }


    const confirmAction =
        confirm(
            "Una uhakika unataka kuthibitisha booking hii?"
        );


    if (!confirmAction) {
        return;
    }


    if (
        typeof firebase === "undefined" ||
        !firebase.functions
    ) {

        alert(
            "❌ Firebase Functions SDK haijaunganishwa kwenye HTML."
        );

        return;
    }


    try {

        const functions =
            firebase.functions();


        const confirmBooking =
            functions.httpsCallable(
                "confirmBooking"
            );


        await confirmBooking({

            bookingNumber:
                bookingNumber

        });


        alert(
            "✅ Booking imethibitishwa."
        );


    } catch (error) {

        console.error(
            "Confirm booking error:",
            error
        );


        alert(
            "❌ Imeshindikana kuthibitisha booking:\n" +
            firebaseErrorMessage(error)
        );

    }

}


/* =========================================================
   8.9 ADMIN REJECT BOOKING
========================================================= */

async function kataaBookingAdmin(
    bookingNumber
) {

    if (!requireAdmin()) {
        return;
    }


    const reason =
        prompt(
            "Andika sababu ya kukataa booking:"
        );


    if (
        reason === null
    ) {
        return;
    }


    const cleanReason =
        reason.trim();


    if (!cleanReason) {

        alert(
            "❌ Lazima uweke sababu."
        );

        return;
    }


    if (
        typeof firebase === "undefined" ||
        !firebase.functions
    ) {

        alert(
            "❌ Firebase Functions SDK haijaunganishwa kwenye HTML."
        );

        return;
    }


    try {

        const functions =
            firebase.functions();


        const rejectBooking =
            functions.httpsCallable(
                "rejectBooking"
            );


        await rejectBooking({

            bookingNumber:
                bookingNumber,

            reason:
                cleanReason

        });


        alert(
            "✅ Booking imekataliwa."
        );


    } catch (error) {

        console.error(
            "Reject booking error:",
            error
        );


        alert(
            "❌ Imeshindikana kukataa booking:\n" +
            firebaseErrorMessage(error)
        );

    }

}


/* =========================================================
   8.10 ADMIN ROOMS MANAGEMENT
========================================================= */

function funguaAdminVyumba() {

    if (!requireAdmin()) {
        return;
    }


    const content =
        document.getElementById(
            "adminContent"
        );


    if (!content) {
        return;
    }


    content.innerHTML = `

        <div class="admin-rooms">

            <h3>
                🏠 Usimamizi wa Vyumba
            </h3>


            <p>
                Hapa Admin anaweza kuweka
                na kusimamia picha za vyumba.
            </p>


            <div id="adminRoomsList">

                <p>
                    ⏳ Inapakia vyumba...
                </p>

            </div>

        </div>

    `;


    onyeshaAdminRooms();

}


/* =========================================================
   8.11 DISPLAY ADMIN ROOMS
========================================================= */

async function onyeshaAdminRooms() {

    if (!requireAdmin()) {
        return;
    }


    const container =
        document.getElementById(
            "adminRoomsList"
        );


    if (!container) {
        return;
    }


    try {

        const roomSnapshots =
            await db
                .collection("rooms")
                .get();


        const firestoreRooms = {};


        roomSnapshots.forEach(
            doc => {

                firestoreRooms[
                    doc.id
                ] = doc.data();

            }
        );


        container.innerHTML =
            ROOMS.map(room => {

                const roomData =
                    firestoreRooms[
                        room.roomNumber
                    ] || {};


                const imageUrls =
                    Array.isArray(
                        roomData.imageUrls
                    )
                        ? roomData.imageUrls
                        : [];


                const imagesHTML =
                    imageUrls.length
                        ? imageUrls
                            .map(
                                (
                                    url,
                                    index
                                ) => `

                                    <div
                                        class="admin-room-image">

                                        <img
                                            src="${escapeHTML(
                                                url
                                            )}"
                                            alt="${escapeHTML(
                                                room.name ||
                                                room.roomNumber
                                            )}"
                                            loading="lazy"
                                        />


                                        <button
                                            type="button"
                                            class="delete-room-image-btn"
                                            data-room="${escapeHTML(
                                                room.roomNumber
                                            )}"
                                            data-url="${escapeHTML(
                                                url
                                            )}">

                                            🗑️ Futa

                                        </button>

                                    </div>

                                `
                            )
                            .join("")
                        : `

                            <p>
                                📷 Hakuna picha
                                iliyowekwa bado.
                            </p>

                        `;


                return `

                    <div
                        class="admin-room-card"
                        data-room="${escapeHTML(
                            room.roomNumber
                        )}">

                        <h3>
                            🏠
                            ${escapeHTML(
                                room.name ||
                                "Chumba"
                            )}
                        </h3>


                        <p>
                            <strong>
                                Namba:
                            </strong>

                            ${escapeHTML(
                                room.roomNumber
                            )}
                        </p>


                        <p>
                            <strong>
                                Bei:
                            </strong>

                            ${formatMoney(
                                room.price
                            )}
                        </p>


                        <p>
                            <strong>
                                Faida kwa siku:
                            </strong>

                            ${formatMoney(
                                room.profitPerDay
                            )}
                        </p>


                        <p>
                            <strong>
                                Muda:
                            </strong>

                            ${Number(
                                room.days ||
                                ROOMRENT_SETTINGS.durationDays
                            )}
                            siku
                        </p>


                        <hr>


                        <h4>
                            📸 Picha za Chumba
                        </h4>


                        <div
                            class="admin-room-images">

                            ${imagesHTML}

                        </div>


                        <div
                            class="admin-room-upload">

                            <label>
                                Ongeza picha:
                            </label>


                            <input
                                type="file"
                                class="room-photo-input"
                                data-room="${escapeHTML(
                                    room.roomNumber
                                )}"
                                accept="image/*"
                            />


                            <button
                                type="button"
                                class="upload-room-photo-btn"
                                data-room="${escapeHTML(
                                    room.roomNumber
                                )}">

                                📤 Pakia Picha

                            </button>


                            <div
                                class="room-upload-status"
                                id="uploadStatus-${escapeHTML(
                                    room.roomNumber
                                )}">
                            </div>

                        </div>

                    </div>

                `;

            }).join("");


        anzishaAdminRoomPhotoListeners();


    } catch (error) {

        console.error(
            "Admin rooms error:",
            error
        );


        container.innerHTML = `

            <p>
                ❌ Imeshindikana kupakia
                vyumba.
            </p>

        `;

    }

}


/* =========================================================
   8.12 ROOM PHOTO LISTENERS
========================================================= */

function anzishaAdminRoomPhotoListeners() {


    document
        .querySelectorAll(
            ".upload-room-photo-btn"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                async () => {

                    const roomNumber =
                        button.dataset.room;


                    const input =
                        document.querySelector(
                            `.room-photo-input[data-room="${CSS.escape(
                                roomNumber
                            )}"]`
                        );


                    if (!input) {
                        return;
                    }


                    const file =
                        input.files &&
                        input.files[0];


                    if (!file) {

                        alert(
                            "❌ Chagua picha kwanza."
                        );

                        return;
                    }


                    await pakiaPichaYaChumba(
                        roomNumber,
                        file
                    );

                }
            );

        });


    document
        .querySelectorAll(
            ".delete-room-image-btn"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                async () => {

                    const roomNumber =
                        button.dataset.room;

                    const imageUrl =
                        button.dataset.url;


                    await futaPichaYaChumba(
                        roomNumber,
                        imageUrl
                    );

                }
            );

        });

}


/* =========================================================
   8.13 UPLOAD ROOM PHOTO
========================================================= */

async function pakiaPichaYaChumba(
    roomNumber,
    file
) {

    if (!requireAdmin()) {
        return;
    }


    if (!file) {

        alert(
            "❌ Picha haijapatikana."
        );

        return;
    }


    if (
        !file.type ||
        !file.type.startsWith("image/")
    ) {

        alert(
            "❌ Tafadhali chagua faili la picha."
        );

        return;
    }


    /*
       Limit ya browser.
       Security Rules za Storage nazo
       zitakuwa na limit ya mwisho.
    */

    const maxSize =
        10 * 1024 * 1024;


    if (file.size > maxSize) {

        alert(
            "❌ Picha ni kubwa sana. " +
            "Maximum ni 10MB."
        );

        return;
    }


    const statusElement =
        document.getElementById(
            `uploadStatus-${roomNumber}`
        );


    if (statusElement) {

        statusElement.innerHTML =
            "⏳ Inapakia picha...";

    }


    try {

        if (
            typeof firebase === "undefined" ||
            !firebase.storage
        ) {

            throw new Error(
                "Firebase Storage SDK haijaunganishwa."
            );

        }


        const safeFileName =
            file.name
                .replace(
                    /[^a-zA-Z0-9._-]/g,
                    "_"
                );


        const uniqueFileName =
            Date.now() +
            "_" +
            Math.random()
                .toString(36)
                .substring(2, 8) +
            "_" +
            safeFileName;


        const storagePath =
            `rooms/${roomNumber}/${uniqueFileName}`;


        const storageRef =
            firebase
                .storage()
                .ref()
                .child(storagePath);


        const uploadTask =
            await storageRef.put(file);


        const downloadURL =
            await uploadTask.ref
                .getDownloadURL();


        const roomRef =
            db
                .collection("rooms")
                .doc(roomNumber);


        await roomRef.set(

            {

                roomNumber:
                    roomNumber,

                imageUrls:
                    firebase.firestore.FieldValue
                        .arrayUnion(
                            downloadURL
                        ),

                updatedAt:
                    serverTimestamp(),

                updatedBy:
                    currentUser.uid

            },

            {

                merge: true

            }

        );


        if (statusElement) {

            statusElement.innerHTML =
                "✅ Picha imewekwa.";

        }


        alert(
            "✅ Picha ya chumba imepakiwa."
        );


        await onyeshaAdminRooms();


    } catch (error) {

        console.error(
            "Room photo upload error:",
            error
        );


        if (statusElement) {

            statusElement.innerHTML =
                "❌ Imeshindikana kupakia.";

        }


        alert(
            "❌ Imeshindikana kupakia picha:\n" +
            firebaseErrorMessage(error)
        );

    }

}


/* =========================================================
   8.14 DELETE ROOM PHOTO
========================================================= */

async function futaPichaYaChumba(
    roomNumber,
    imageUrl
) {

    if (!requireAdmin()) {
        return;
    }


    const confirmDelete =
        confirm(
            "Una uhakika unataka kufuta picha hii?"
        );


    if (!confirmDelete) {
        return;
    }


    try {

        /*
           Ondoa URL kutoka Firestore.
        */

        await db
            .collection("rooms")
            .doc(roomNumber)
            .update({

                imageUrls:
                    firebase.firestore.FieldValue
                        .arrayRemove(
                            imageUrl
                        ),

                updatedAt:
                    serverTimestamp(),

                updatedBy:
                    currentUser.uid

            });


        /*
           Jaribu pia kufuta file
           kutoka Firebase Storage.
        */

        try {

            await firebase
                .storage()
                .refFromURL(
                    imageUrl
                )
                .delete();

        } catch (
            storageDeleteError
        ) {

            console.warn(
                "Storage delete warning:",
                storageDeleteError
            );

        }


        alert(
            "✅ Picha imefutwa."
        );


        await onyeshaAdminRooms();


    } catch (error) {

        console.error(
            "Delete room image error:",
            error
        );


        alert(
            "❌ Imeshindikana kufuta picha:\n" +
            firebaseErrorMessage(error)
        );

    }

}


/* =========================================================
   8.15 GET ROOM IMAGES
========================================================= */

async function pataPichaZaChumba(
    roomNumber
) {

    try {

        const snap =
            await db
                .collection("rooms")
                .doc(roomNumber)
                .get();


        if (!snap.exists) {
            return [];
        }


        const data =
            snap.data();


        if (
            !Array.isArray(
                data.imageUrls
            )
        ) {

            return [];

        }


        return data.imageUrls;

    } catch (error) {

        console.error(
            "Get room images error:",
            error
        );

        return [];

    }

}


/* =========================================================
   8.16 GET ALL ROOM IMAGES
========================================================= */

async function pataPichaZaVyumbaVyote() {

    const result = {};


    try {

        const snapshot =
            await db
                .collection("rooms")
                .get();


        snapshot.forEach(
            doc => {

                const data =
                    doc.data();


                result[
                    doc.id
                ] =
                    Array.isArray(
                        data.imageUrls
                    )
                        ? data.imageUrls
                        : [];

            }
        );


    } catch (error) {

        console.error(
            "Get all room images error:",
            error
        );

    }


    return result;
}


/* =========================================================
   8.17 SAVE ROOM BASE DATA
   Admin anaweza kuweka taarifa za
   chumba kwenye Firestore bila
   kuondoa picha zilizopo.
========================================================= */

async function hifadhiRoomDataYaAdmin(
    roomNumber
) {

    if (!requireAdmin()) {
        return;
    }


    const room =
        pataRoom(roomNumber);


    if (!room) {

        alert(
            "❌ Chumba hakijapatikana."
        );

        return;
    }


    try {

        await db
            .collection("rooms")
            .doc(roomNumber)
            .set(

                {

                    roomNumber:
                        room.roomNumber,

                    name:
                        room.name || "",

                    price:
                        Number(room.price || 0),

                    profitPerDay:
                        Number(
                            room.profitPerDay ||
                            0
                        ),

                    days:
                        Number(
                            room.days ||
                            ROOMRENT_SETTINGS.durationDays
                        ),

                    updatedAt:
                        serverTimestamp(),

                    updatedBy:
                        currentUser.uid

                },

                {

                    merge: true

                }

            );


    } catch (error) {

        console.error(
            "Save room data error:",
            error
        );

        throw error;

    }

}


/* =========================================================
   8.18 REFRESH ADMIN BOOKINGS
========================================================= */

function refreshAdminBookings() {

    if (!requireAdmin()) {
        return;
    }


    anzishaAdminBookingsListener();

}


/* =========================================================
   8.19 STOP ADMIN LISTENER
========================================================= */

function simamishaAdminBookingsListener() {

    if (
        unsubscribeAdminBookings
    ) {

        unsubscribeAdminBookings();

        unsubscribeAdminBookings = null;

    }

}


/* =========================================================
   8.20 CLEAN ADMIN DATA
========================================================= */

function safishaAdminData() {

    simamishaAdminBookingsListener();


    const adminSection =
        document.getElementById(
            "adminSection"
        );


    if (adminSection) {

        adminSection.innerHTML = "";

        adminSection.style.display =
            "none";

    }

}


/* =========================================================
   8.21 EXPOSE ADMIN FUNCTIONS
========================================================= */

window.niAdmin =
    niAdmin;

window.requireAdmin =
    requireAdmin;

window.funguaAdminDashboard =
    funguaAdminDashboard;

window.anzishaAdminBookingsListener =
    anzishaAdminBookingsListener;

window.onyeshaAdminBookings =
    onyeshaAdminBookings;

window.tengenezaAdminBookingCard =
    tengenezaAdminBookingCard;

window.funguaAdminBookingDetails =
    funguaAdminBookingDetails;

window.thibitishaBookingAdmin =
    thibitishaBookingAdmin;

window.kataaBookingAdmin =
    kataaBookingAdmin;

window.funguaAdminVyumba =
    funguaAdminVyumba;

window.onyeshaAdminRooms =
    onyeshaAdminRooms;

window.pakiaPichaYaChumba =
    pakiaPichaYaChumba;

window.futaPichaYaChumba =
    futaPichaYaChumba;

window.pataPichaZaChumba =
    pataPichaZaChumba;

window.pataPichaZaVyumbaVyote =
    pataPichaZaVyumbaVyote;

window.hifadhiRoomDataYaAdmin =
    hifadhiRoomDataYaAdmin;

window.refreshAdminBookings =
    refreshAdminBookings;

window.simamishaAdminBookingsListener =
    simamishaAdminBookingsListener;

window.safishaAdminData =
    safishaAdminData;


/* =========================================================
   MWISHO WA SEHEMU YA 8
========================================================= */
/* =========================================================
   ROOMRENT - SEHEMU YA 9
   CUSTOMER ROOM PHOTOS
   =========================================================

   MFUMO:
   - Mteja anaona picha za vyumba
   - Picha zinatoka Firebase Firestore
   - Picha zenyewe ziko Firebase Storage
   - Admin ndiye anayezipakia
   - Hakuna localStorage
   - Kama chumba hakina picha, mfumo unaendelea
     kufanya kazi bila kuvunjika
   ========================================================= */


/* =========================================================
   9.1 LOAD ROOM IMAGES
========================================================= */

async function pakiaPichaZaVyumbaKwaMteja() {

    try {

        const roomImages =
            await pataPichaZaVyumbaVyote();


        /*
           Tafuta cards zote za vyumba
           zilizotengenezwa na Section 3.
        */

        const roomCards =
            document.querySelectorAll(
                "[data-room-number]"
            );


        roomCards.forEach(card => {

            const roomNumber =
                card.dataset.roomNumber;


            if (!roomNumber) {
                return;
            }


            const images =
                roomImages[
                    roomNumber
                ] || [];


            let imageContainer =
                card.querySelector(
                    ".customer-room-images"
                );


            /*
               Kama container haipo,
               tengeneza.
            */

            if (!imageContainer) {

                imageContainer =
                    document.createElement(
                        "div"
                    );


                imageContainer.className =
                    "customer-room-images";


                const title =
                    document.createElement(
                        "h4"
                    );


                title.textContent =
                    "📸 Picha za Chumba";


                imageContainer.appendChild(
                    title
                );


                card.insertBefore(
                    imageContainer,
                    card.firstChild
                );

            }


            /*
               Kama hakuna picha.
            */

            if (!images.length) {

                imageContainer.innerHTML = `

                    <h4>
                        📸 Picha za Chumba
                    </h4>

                    <p>
                        Picha bado
                        hazijawekwa.
                    </p>

                `;

                return;
            }


            /*
               Tengeneza gallery.
            */

            imageContainer.innerHTML = `

                <h4>
                    📸 Picha za Chumba
                </h4>

                <div
                    class="customer-room-image-gallery">

                    ${images
                        .map(
                            (
                                url,
                                index
                            ) => `

                                <div
                                    class="customer-room-image-item">

                                    <img
                                        src="${escapeHTML(
                                            url
                                        )}"
                                        alt="Picha ya chumba ${escapeHTML(
                                            roomNumber
                                        )}"
                                        loading="lazy"
                                        class="customer-room-image"
                                        data-image-url="${escapeHTML(
                                            url
                                        )}"
                                    />

                                </div>

                            `
                        )
                        .join("")}

                </div>

            `;

        });


        anzishaCustomerImageListeners();


    } catch (error) {

        console.error(
            "Customer room images error:",
            error
        );

    }

}


/* =========================================================
   9.2 CUSTOMER IMAGE CLICK
========================================================= */

function anzishaCustomerImageListeners() {

    document
        .querySelectorAll(
            ".customer-room-image"
        )
        .forEach(image => {

            image.addEventListener(
                "click",
                () => {

                    const imageUrl =
                        image.dataset.imageUrl;


                    funguaRoomImagePreview(
                        imageUrl
                    );

                }
            );

        });

}


/* =========================================================
   9.3 IMAGE PREVIEW
========================================================= */

function funguaRoomImagePreview(
    imageUrl
) {

    if (!imageUrl) {
        return;
    }


    /*
       Kama preview ipo tayari,
       itumie tena.
    */

    let preview =
        document.getElementById(
            "roomImagePreview"
        );


    if (!preview) {

        preview =
            document.createElement(
                "div"
            );


        preview.id =
            "roomImagePreview";


        preview.innerHTML = `

            <div
                class="room-image-preview-overlay">

                <button
                    type="button"
                    id="closeRoomImagePreview">

                    ✕

                </button>


                <img
                    id="roomImagePreviewImage"
                    src=""
                    alt="Picha ya chumba"
                />

            </div>

        `;


        document.body.appendChild(
            preview
        );


        const closeButton =
            document.getElementById(
                "closeRoomImagePreview"
            );


        if (closeButton) {

            closeButton.addEventListener(
                "click",
                fungaRoomImagePreview
            );

        }


        preview.addEventListener(
            "click",
            event => {

                if (
                    event.target ===
                    preview
                ) {

                    fungaRoomImagePreview();

                }

            }
        );

    }


    const previewImage =
        document.getElementById(
            "roomImagePreviewImage"
        );


    if (previewImage) {

        previewImage.src =
            imageUrl;

    }


    preview.style.display =
        "flex";

}


/* =========================================================
   9.4 CLOSE IMAGE PREVIEW
========================================================= */

function fungaRoomImagePreview() {

    const preview =
        document.getElementById(
            "roomImagePreview"
        );


    if (preview) {

        preview.style.display =
            "none";

    }

}


/* =========================================================
   9.5 AUTOMATICALLY ADD ROOM PHOTOS
=========================================================

   Section 3 tayari ina function
   onyeshaVyumba().

   Hapa tunaiunganisha na mfumo
   wa picha bila kuandika tena
   function nzima ya Section 3.
========================================================= */

(function
    unganishaRoomPhotosNaVyumba()
{

    if (
        typeof window.onyeshaVyumba !==
        "function"
    ) {

        console.warn(
            "onyeshaVyumba haijapatikana bado."
        );

        return;
    }


    /*
       Hifadhi function ya zamani
       mara moja.
    */

    const
        onyeshaVyumbaOriginal =
            window.onyeshaVyumba;


    /*
       Tusiunganishe mara mbili.
    */

    if (
        window.__roomRentRoomsWrapped
    ) {

        return;

    }


    window.__roomRentRoomsWrapped =
        true;


    /*
       Function mpya inafanya:

       1. Inaonyesha vyumba
       2. Inasubiri DOM itengenezwe
       3. Inapakia picha kutoka Firestore
    */

    window.onyeshaVyumba =
        async function () {

            try {

                await
                    onyeshaVyumbaOriginal();

            } catch (error) {

                console.error(
                    "Rooms display error:",
                    error
                );

                return;

            }


            /*
               Subiri kidogo ili cards
               ziwe tayari kwenye DOM.
            */

            setTimeout(
                async () => {

                    await
                        pakiaPichaZaVyumbaKwaMteja();

                },
                100
            );

        };

})();


/* =========================================================
   9.6 CUSTOMER ROOM IMAGE REFRESH
========================================================= */

async function refreshPichaZaVyumba() {

    if (!currentUser) {
        return;
    }


    await
        pakiaPichaZaVyumbaKwaMteja();

}


/* =========================================================
   9.7 PUBLIC FUNCTIONS
========================================================= */

window.pakiaPichaZaVyumbaKwaMteja =
    pakiaPichaZaVyumbaKwaMteja;

window.anzishaCustomerImageListeners =
    anzishaCustomerImageListeners;

window.funguaRoomImagePreview =
    funguaRoomImagePreview;

window.fungaRoomImagePreview =
    fungaRoomImagePreview;

window.refreshPichaZaVyumba =
    refreshPichaZaVyumba;


/* =========================================================
   MWISHO WA SEHEMU YA 9
========================================================= */
/* =========================================================
   ROOMRENT - SEHEMU YA 10
   ACCOUNT + REFERRAL DASHBOARD
   =========================================================

   MFUMO:
   - Taarifa za akaunti ya mteja
   - Referral code
   - Referral link binafsi
   - Copy referral link
   - Jumla ya bookings
   - Jumla ya commission
   - Referral information
   - Firestore ndiyo chanzo cha data
   - Hakuna localStorage
   ========================================================= */


/* =========================================================
   10.1 OPEN ACCOUNT
========================================================= */

async function funguaAccount() {

    if (!requireLogin()) {
        return;
    }


    clearMainSections();


    const accountSection =
        document.getElementById(
            "accountSection"
        );


    if (!accountSection) {

        alert(
            "❌ accountSection haipo kwenye HTML."
        );

        return;
    }


    accountSection.style.display =
        "block";


    accountSection.innerHTML = `

        <div class="account-dashboard">

            <h2>👤 Akaunti Yangu</h2>


            <div id="accountContent">

                <p>
                    ⏳ Inapakia taarifa zako...
                </p>

            </div>

        </div>

    `;


    await onyeshaAccountData();

}


/* =========================================================
   10.2 LOAD ACCOUNT DATA
========================================================= */

async function onyeshaAccountData() {

    if (!currentUser) {
        return;
    }


    const content =
        document.getElementById(
            "accountContent"
        );


    if (!content) {
        return;
    }


    try {

        const userSnap =
            await db
                .collection("users")
                .doc(currentUser.uid)
                .get();


        if (!userSnap.exists) {

            content.innerHTML = `

                <p>
                    ❌ Taarifa za akaunti
                    hazijapatikana.
                </p>

            `;

            return;
        }


        const user =
            userSnap.data();


        const referralCode =
            user.referralCode ||
            "";


        const referralLink =
            user.referralLink ||
            tengenezaReferralLink(
                referralCode
            );


        const totalBookings =
            Number(
                user.totalBookings || 0
            );


        const totalCommission =
            Number(
                user.totalCommission || 0
            );


        const referredBy =
            user.referredBy ||
            "Hakuna";


        content.innerHTML = `

            <!-- ======================================
                 BASIC ACCOUNT
            ======================================= -->

            <div class="account-card">

                <h3>
                    👤 Taarifa Zangu
                </h3>


                <p>
                    <strong>Jina:</strong>
                    ${escapeHTML(
                        user.name || "-"
                    )}
                </p>


                <p>
                    <strong>Email:</strong>
                    ${escapeHTML(
                        user.email ||
                        currentUser.email ||
                        "-"
                    )}
                </p>


                <p>
                    <strong>Simu:</strong>
                    ${escapeHTML(
                        user.phone || "-"
                    )}
                </p>


                <p>
                    <strong>Referral Code:</strong>
                    ${escapeHTML(
                        referralCode ||
                        "-"
                    )}
                </p>

            </div>


            <!-- ======================================
                 REFERRAL LINK
            ======================================= -->

            <div class="account-card">

                <h3>
                    🔗 Referral Link Yangu
                </h3>


                <p>
                    Tumia link hii kuwaalika
                    wateja wengine kwenye RoomRent.
                </p>


                <div
                    class="referral-link-box">

                    <input
                        type="text"
                        id="myReferralLink"
                        value="${escapeHTML(
                            referralLink
                        )}"
                        readonly
                    />


                    <button
                        type="button"
                        id="copyReferralLinkBtn">

                        📋 Copy Link

                    </button>

                </div>


                <div
                    id="referralCopyMessage">
                </div>

            </div>


            <!-- ======================================
                 REFERRAL STATISTICS
            ======================================= -->

            <div class="account-card">

                <h3>
                    📊 Referral & Commission
                </h3>


                <p>
                    <strong>
                        Jumla ya Bookings:
                    </strong>

                    ${totalBookings}
                </p>


                <p>
                    <strong>
                        Commission Yangu:
                    </strong>

                    ${formatMoney(
                        totalCommission
                    )}
                </p>


                <p>
                    <strong>
                        Umealikwa na:
                    </strong>

                    ${escapeHTML(
                        referredBy
                    )}
                </p>

            </div>


            <!-- ======================================
                 REFERRAL LEVELS
            ======================================= -->

            <div class="account-card">

                <h3>
                    🌐 Mfumo wa Referral
                </h3>


                <div class="referral-level">

                    <strong>
                        Level A
                    </strong>

                    <span>
                        5%
                    </span>

                </div>


                <div class="referral-level">

                    <strong>
                        Level B
                    </strong>

                    <span>
                        2%
                    </span>

                </div>


                <div class="referral-level">

                    <strong>
                        Level C
                    </strong>

                    <span>
                        1%
                    </span>

                </div>


                <p>
                    Commission huhesabiwa na
                    mfumo kulingana na booking
                    iliyothibitishwa.
                </p>

            </div>


            <!-- ======================================
                 ACCOUNT ACTIONS
            ======================================= -->

            <div class="account-actions">

                <button
                    type="button"
                    id="accountRefreshBtn">

                    🔄 Refresh

                </button>


                <button
                    type="button"
                    id="accountLogoutBtn">

                    🚪 Toka

                </button>

            </div>

        `;


        anzishaAccountListeners();


    } catch (error) {

        console.error(
            "Account data error:",
            error
        );


        content.innerHTML = `

            <p>
                ❌ Imeshindikana kupakia
                taarifa za akaunti.
            </p>

        `;

    }

}


/* =========================================================
   10.3 ACCOUNT BUTTON LISTENERS
========================================================= */

function anzishaAccountListeners() {

    const copyBtn =
        document.getElementById(
            "copyReferralLinkBtn"
        );


    if (copyBtn) {

        copyBtn.addEventListener(
            "click",
            nakiliReferralLink
        );

    }


    const refreshBtn =
        document.getElementById(
            "accountRefreshBtn"
        );


    if (refreshBtn) {

        refreshBtn.addEventListener(
            "click",
            async () => {

                await
                    onyeshaAccountData();

            }
        );

    }


    const logoutBtn =
        document.getElementById(
            "accountLogoutBtn"
        );


    if (logoutBtn) {

        logoutBtn.addEventListener(
            "click",
            async () => {

                await signOutUser();

            }
        );

    }

}


/* =========================================================
   10.4 COPY REFERRAL LINK
========================================================= */

async function nakiliReferralLink() {

    const input =
        document.getElementById(
            "myReferralLink"
        );


    const message =
        document.getElementById(
            "referralCopyMessage"
        );


    if (!input) {
        return;
    }


    const link =
        input.value.trim();


    if (!link) {

        if (message) {

            message.innerHTML =
                "❌ Referral link haipo.";

        }

        return;
    }


    try {

        /*
           Clipboard API
        */

        if (
            navigator.clipboard &&
            navigator.clipboard.writeText
        ) {

            await navigator.clipboard
                .writeText(link);

        } else {

            /*
               Fallback kwa baadhi ya
               browser za Android.
            */

            input.focus();

            input.select();

            document.execCommand(
                "copy"
            );

        }


        if (message) {

            message.innerHTML =
                "✅ Referral link imenakiliwa.";

        }


    } catch (error) {

        console.error(
            "Copy referral link error:",
            error
        );


        if (message) {

            message.innerHTML =
                "❌ Imeshindikana kunakili link.";

        }

    }

}


/* =========================================================
   10.5 ACCOUNT FIRESTORE LISTENER
========================================================= */

let unsubscribeAccount =
    null;


function anzishaAccountListener() {

    if (!currentUser) {
        return;
    }


    if (unsubscribeAccount) {

        unsubscribeAccount();

        unsubscribeAccount = null;

    }


    unsubscribeAccount =
        db
            .collection("users")
            .doc(currentUser.uid)
            .onSnapshot(

                snapshot => {

                    if (!snapshot.exists) {
                        return;
                    }


                    /*
                       Kama Account iko wazi,
                       refresh taarifa zake.
                    */

                    const accountSection =
                        document.getElementById(
                            "accountSection"
                        );


                    if (
                        accountSection &&
                        accountSection.style.display !==
                        "none"
                    ) {

                        onyeshaAccountData();

                    }

                },

                error => {

                    console.error(
                        "Account listener error:",
                        error
                    );

                }

            );

}


/* =========================================================
   10.6 STOP ACCOUNT LISTENER
========================================================= */

function simamishaAccountListener() {

    if (unsubscribeAccount) {

        unsubscribeAccount();

        unsubscribeAccount = null;

    }

}


/* =========================================================
   10.7 REFERRAL SUMMARY FROM FIRESTORE
========================================================= */

async function pataReferralSummary() {

    if (!currentUser) {

        return {

            totalBookings: 0,

            totalCommission: 0

        };

    }


    try {

        const snap =
            await db
                .collection("users")
                .doc(currentUser.uid)
                .get();


        if (!snap.exists) {

            return {

                totalBookings: 0,

                totalCommission: 0

            };

        }


        const data =
            snap.data();


        return {

            totalBookings:
                Number(
                    data.totalBookings || 0
                ),

            totalCommission:
                Number(
                    data.totalCommission || 0
                )

        };


    } catch (error) {

        console.error(
            "Referral summary error:",
            error
        );


        return {

            totalBookings: 0,

            totalCommission: 0

        };

    }

}


/* =========================================================
   10.8 UPDATE ACCOUNT REFERRAL LINK
========================================================= */

async function hakikishaReferralLinkYaAccount() {

    if (!currentUser) {
        return;
    }


    try {

        const userRef =
            db
                .collection("users")
                .doc(currentUser.uid);


        const snap =
            await userRef.get();


        if (!snap.exists) {
            return;
        }


        const user =
            snap.data();


        if (!user.referralCode) {
            return;
        }


        const correctLink =
            tengenezaReferralLink(
                user.referralCode
            );


        if (
            user.referralLink !==
            correctLink
        ) {

            await userRef.update({

                referralLink:
                    correctLink,

                updatedAt:
                    serverTimestamp()

            });

        }


    } catch (error) {

        console.error(
            "Ensure referral link error:",
            error
        );

    }

}


/* =========================================================
   10.9 ACCOUNT CLEANUP
========================================================= */

function safishaAccountData() {

    simamishaAccountListener();


    const accountSection =
        document.getElementById(
            "accountSection"
        );


    if (accountSection) {

        accountSection.innerHTML =
            "";

        accountSection.style.display =
            "none";

    }

}


/* =========================================================
   10.10 EXPOSE FUNCTIONS
========================================================= */

window.funguaAccount =
    funguaAccount;

window.onyeshaAccountData =
    onyeshaAccountData;

window.anzishaAccountListeners =
    anzishaAccountListeners;

window.nakiliReferralLink =
    nakiliReferralLink;

window.anzishaAccountListener =
    anzishaAccountListener;

window.simamishaAccountListener =
    simamishaAccountListener;

window.pataReferralSummary =
    pataReferralSummary;

window.hakikishaReferralLinkYaAccount =
    hakikishaReferralLinkYaAccount;

window.safishaAccountData =
    safishaAccountData;


/* =========================================================
   MWISHO WA SEHEMU YA 10
========================================================= */
/* =========================================================
   ROOMRENT - SEHEMU YA 11
   NOTIFICATIONS / TAARIFA
   =========================================================

   MFUMO:
   - Notifications zinahifadhiwa Firestore
   - User anaona taarifa zake tu
   - Realtime updates kupitia onSnapshot
   - Unread count kwenye taarifa
   - Mark notification as read
   - Mark all as read
   - Hakuna localStorage
   ========================================================= */


/* =========================================================
   11.1 NOTIFICATION VARIABLES
========================================================= */

let roomRentNotifications = [];

let roomRentUnreadNotifications = 0;


/* =========================================================
   11.2 NOTIFICATION COLLECTION
========================================================= */

function notificationCollection() {

    if (!currentUser) {
        return null;
    }


    return db
        .collection("users")
        .doc(currentUser.uid)
        .collection("notifications");
}


/* =========================================================
   11.3 START NOTIFICATION LISTENER
========================================================= */

function anzishaNotificationsListener() {

    if (!currentUser) {
        return;
    }


    /*
       Zima listener wa zamani
       kama upo.
    */

    if (unsubscribeNotifications) {

        unsubscribeNotifications();

        unsubscribeNotifications = null;

    }


    const collection =
        notificationCollection();


    if (!collection) {
        return;
    }


    unsubscribeNotifications =
        collection
            .orderBy(
                "createdAt",
                "desc"
            )
            .limit(100)
            .onSnapshot(

                snapshot => {

                    roomRentNotifications =
                        [];


                    snapshot.forEach(
                        doc => {

                            roomRentNotifications
                                .push({

                                    id: doc.id,

                                    ...doc.data()

                                });

                        }
                    );


                    roomRentUnreadNotifications =
                        roomRentNotifications
                            .filter(
                                notification =>
                                    notification.read !== true
                            )
                            .length;


                    onyeshaNotificationCount();


                    /*
                       Kama taarifa section iko wazi,
                       i-refresh moja kwa moja.
                    */

                    const section =
                        document.getElementById(
                            "taarifaSection"
                        );


                    if (
                        section &&
                        section.style.display !==
                        "none"
                    ) {

                        onyeshaNotifications();

                    }

                },

                error => {

                    console.error(
                        "Notifications listener error:",
                        error
                    );

                }

            );

}


/* =========================================================
   11.4 SHOW NOTIFICATION COUNT
========================================================= */

function onyeshaNotificationCount() {

    const buttons = [

        document.getElementById(
            "taarifaBtn"
        ),

        document.getElementById(
            "notificationBtn"
        )

    ];


    buttons.forEach(button => {

        if (!button) {
            return;
        }


        /*
           Ondoa badge ya zamani.
        */

        const oldBadge =
            button.querySelector(
                ".notification-badge"
            );


        if (oldBadge) {

            oldBadge.remove();

        }


        /*
           Kama hakuna unread,
           usionyeshe badge.
        */

        if (
            roomRentUnreadNotifications <= 0
        ) {

            return;

        }


        const badge =
            document.createElement(
                "span"
            );


        badge.className =
            "notification-badge";


        badge.textContent =
            roomRentUnreadNotifications >
            99
                ? "99+"
                : roomRentUnreadNotifications;


        button.appendChild(
            badge
        );

    });

}


/* =========================================================
   11.5 OPEN NOTIFICATIONS
========================================================= */

async function funguaTaarifa() {

    if (!requireLogin()) {
        return;
    }


    clearMainSections();


    const section =
        document.getElementById(
            "taarifaSection"
        );


    if (!section) {

        alert(
            "❌ taarifaSection haipo kwenye HTML."
        );

        return;
    }


    section.style.display =
        "block";


    section.innerHTML = `

        <div class="notifications-page">

            <div class="notifications-header">

                <h2>
                    🔔 Taarifa Zangu
                </h2>


                <button
                    type="button"
                    id="markAllNotificationsReadBtn">

                    ✓ Soma Zote

                </button>

            </div>


            <div
                id="notificationsList">

                <p>
                    ⏳ Inapakia taarifa...
                </p>

            </div>

        </div>

    `;


    onyeshaNotifications();


    anzishaNotificationPageListeners();

}


/* =========================================================
   11.6 DISPLAY NOTIFICATIONS
========================================================= */

function onyeshaNotifications() {

    const container =
        document.getElementById(
            "notificationsList"
        );


    if (!container) {
        return;
    }


    if (
        !roomRentNotifications.length
    ) {

        container.innerHTML = `

            <div class="empty-notifications">

                <div
                    style="
                        font-size:48px;
                        margin-bottom:10px;
                    ">

                    🔔

                </div>


                <h3>
                    Hakuna taarifa bado.
                </h3>


                <p>
                    Taarifa mpya zitaonekana
                    hapa.
                </p>

            </div>

        `;

        return;
    }


    container.innerHTML =
        roomRentNotifications
            .map(
                notification => {

                    return tengenezaNotificationCard(
                        notification
                    );

                }
            )
            .join("");


    anzishaNotificationCardListeners();

}


/* =========================================================
   11.7 NOTIFICATION CARD
========================================================= */

function tengenezaNotificationCard(
    notification
) {

    const isRead =
        notification.read === true;


    const title =
        notification.title ||
        "RoomRent";


    const message =
        notification.message ||
        "";


    const type =
        notification.type ||
        "general";


    const createdAt =
        formatFirestoreDate(
            notification.createdAt
        );


    return `

        <div
            class="notification-card ${
                isRead
                    ? "notification-read"
                    : "notification-unread"
            }"
            data-notification-id="${escapeHTML(
                notification.id || ""
            )}">


            <div
                class="notification-icon">

                ${getNotificationIcon(type)}

            </div>


            <div
                class="notification-content">

                <h3>
                    ${escapeHTML(title)}
                </h3>


                <p>
                    ${escapeHTML(message)}
                </p>


                <small>
                    ${escapeHTML(
                        createdAt
                    )}
                </small>


                ${
                    !isRead
                    ? `

                        <button
                            type="button"
                            class="mark-notification-read-btn"
                            data-id="${escapeHTML(
                                notification.id || ""
                            )}">

                            ✓ Weka kama imesomwa

                        </button>

                    `
                    : `

                        <span
                            class="notification-read-label">

                            ✓ Imesomwa

                        </span>

                    `
                }

            </div>

        </div>

    `;

}


/* =========================================================
   11.8 NOTIFICATION ICON
========================================================= */

function getNotificationIcon(
    type
) {

    const icons = {

        booking:
            "🧾",

        payment:
            "💳",

        confirmed:
            "✅",

        rejected:
            "❌",

        profit:
            "💰",

        commission:
            "🎁",

        withdrawal:
            "💵",

        admin:
            "🛠️",

        general:
            "🔔"

    };


    return (
        icons[type] ||
        icons.general
    );

}


/* =========================================================
   11.9 NOTIFICATION PAGE LISTENERS
========================================================= */

function anzishaNotificationPageListeners() {

    const markAllButton =
        document.getElementById(
            "markAllNotificationsReadBtn"
        );


    if (markAllButton) {

        markAllButton.addEventListener(
            "click",
            markAllNotificationsAsRead
        );

    }

}


/* =========================================================
   11.10 NOTIFICATION CARD LISTENERS
========================================================= */

function anzishaNotificationCardListeners() {

    document
        .querySelectorAll(
            ".mark-notification-read-btn"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                async () => {

                    const id =
                        button.dataset.id;


                    await
                        markNotificationAsRead(
                            id
                        );

                }
            );

        });

}


/* =========================================================
   11.11 MARK ONE NOTIFICATION AS READ
========================================================= */

async function markNotificationAsRead(
    notificationId
) {

    if (!currentUser) {
        return;
    }


    if (!notificationId) {
        return;
    }


    try {

        await db
            .collection("users")
            .doc(currentUser.uid)
            .collection("notifications")
            .doc(notificationId)
            .update({

                read:
                    true,

                readAt:
                    serverTimestamp()

            });


    } catch (error) {

        console.error(
            "Mark notification read error:",
            error
        );

    }

}


/* =========================================================
   11.12 MARK ALL NOTIFICATIONS AS READ
========================================================= */

async function markAllNotificationsAsRead() {

    if (!currentUser) {
        return;
    }


    const unread =
        roomRentNotifications
            .filter(
                notification =>
                    notification.read !== true
            );


    if (!unread.length) {

        alert(
            "✅ Taarifa zote tayari zimesomwa."
        );

        return;
    }


    try {

        const batch =
            db.batch();


        unread.forEach(
            notification => {

                const ref =
                    db
                        .collection("users")
                        .doc(currentUser.uid)
                        .collection(
                            "notifications"
                        )
                        .doc(
                            notification.id
                        );


                batch.update(
                    ref,
                    {

                        read:
                            true,

                        readAt:
                            serverTimestamp()

                    }
                );

            }
        );


        await batch.commit();


    } catch (error) {

        console.error(
            "Mark all notifications error:",
            error
        );


        alert(
            "❌ Imeshindikana kusoma taarifa zote."
        );

    }

}


/* =========================================================
   11.13 CREATE USER NOTIFICATION
   =========================================================

   Hii ni helper ya ndani.

   Kwa notifications muhimu za kifedha,
   Cloud Functions ndiyo itakuwa chanzo
   salama cha kuziunda.
========================================================= */

async function tengenezaNotificationYaUser(
    uid,
    data
) {

    if (!uid) {
        return null;
    }


    if (!data) {
        return null;
    }


    try {

        const notificationRef =
            db
                .collection("users")
                .doc(uid)
                .collection("notifications")
                .doc();


        await notificationRef.set({

            type:
                data.type ||
                "general",

            title:
                data.title ||
                "RoomRent",

            message:
                data.message ||
                "",

            read:
                false,

            createdAt:
                serverTimestamp(),

            relatedBooking:
                data.relatedBooking ||
                null,

            relatedWithdrawal:
                data.relatedWithdrawal ||
                null

        });


        return notificationRef.id;


    } catch (error) {

        console.error(
            "Create notification error:",
            error
        );


        return null;

    }

}


/* =========================================================
   11.14 NOTIFICATION COUNT GETTER
========================================================= */

function pataNotificationCount() {

    return roomRentUnreadNotifications;

}


/* =========================================================
   11.15 NOTIFICATIONS CLEANUP
========================================================= */

function simamishaNotificationsListener() {

    if (unsubscribeNotifications) {

        unsubscribeNotifications();

        unsubscribeNotifications = null;

    }


    roomRentNotifications = [];

    roomRentUnreadNotifications = 0;


    onyeshaNotificationCount();

}


/* =========================================================
   11.16 NOTIFICATIONS DATA CLEANUP
========================================================= */

function safishaNotificationsData() {

    simamishaNotificationsListener();


    const section =
        document.getElementById(
            "taarifaSection"
        );


    if (section) {

        section.innerHTML = "";

        section.style.display =
            "none";

    }

}


/* =========================================================
   11.17 EXPOSE FUNCTIONS
========================================================= */

window.anzishaNotificationsListener =
    anzishaNotificationsListener;

window.onyeshaNotificationCount =
    onyeshaNotificationCount;

window.funguaTaarifa =
    funguaTaarifa;

window.onyeshaNotifications =
    onyeshaNotifications;

window.tengenezaNotificationCard =
    tengenezaNotificationCard;

window.markNotificationAsRead =
    markNotificationAsRead;

window.markAllNotificationsAsRead =
    markAllNotificationsAsRead;

window.tengenezaNotificationYaUser =
    tengenezaNotificationYaUser;

window.pataNotificationCount =
    pataNotificationCount;

window.simamishaNotificationsListener =
    simamishaNotificationsListener;

window.safishaNotificationsData =
    safishaNotificationsData;


/* =========================================================
   MWISHO WA SEHEMU YA 11
========================================================= */
/* =========================================================
   ROOMRENT - SEHEMU YA 12
   SYSTEM INITIALIZATION + BUTTON CONNECTIONS
   =========================================================

   MFUMO:
   - Inaunganisha buttons za HTML
   - Binding ya buttons inafanyika mara moja
   - Inazuia duplicate event listeners
   - Inaunganisha Admin
   - Inaunganisha Notifications
   - Inaweka mfumo tayari baada ya page load
   ========================================================= */


/* =========================================================
   12.1 INITIALIZATION FLAG
========================================================= */

let roomRentSystemInitialized = false;


/* =========================================================
   12.2 SAFE BUTTON CLICK
========================================================= */

function roomRentBindClick(
    elementId,
    callback
) {

    const element =
        document.getElementById(
            elementId
        );


    if (!element) {

        console.warn(
            "RoomRent: Button haipo:",
            elementId
        );

        return false;
    }


    /*
       Ondoa onclick ya zamani
       kama ilikuwa imewekwa na
       mfumo huu.
    */

    element.onclick = null;


    /*
       onclick property inatumika
       badala ya addEventListener.

       Hii inasaidia kuzuia
       duplicate listeners.
    */

    element.onclick =
        function(event) {

            try {

                const result =
                    callback(event);


                /*
                   Kama callback imerudisha
                   Promise, ishughulikie
                   bila kuvunja UI.
                */

                if (
                    result &&
                    typeof result.catch ===
                    "function"
                ) {

                    result.catch(
                        error => {

                            console.error(
                                "RoomRent button error:",
                                error
                            );

                        }
                    );

                }

            } catch (error) {

                console.error(
                    "RoomRent button error:",
                    error
                );

            }

        };


    return true;
}


/* =========================================================
   12.3 CONNECT MAIN BUTTONS
========================================================= */

function unganishaMainButtons() {


    /*
       VYUMBA
    */

    roomRentBindClick(
        "angaliaVyumba",
        async () => {

            if (!requireLogin()) {
                return;
            }


            await onyeshaVyumba();

        }
    );


    /*
       BOOKING ZANGU
    */

    roomRentBindClick(
        "bookingZangu",
        async () => {

            await funguaBookingZangu();

        }
    );


    /*
       ACCOUNT
    */

    roomRentBindClick(
        "accountBtn",
        async () => {

            await funguaAccount();

        }
    );


    /*
       TAARIFA
    */

    roomRentBindClick(
        "taarifaBtn",
        async () => {

            await funguaTaarifa();

        }
    );


    /*
       WITHDRAWAL
    */

    roomRentBindClick(
        "withdrawalBtn",
        async () => {

            await funguaWithdrawal();

        }
    );


    /*
       ADMIN
    */

    roomRentBindClick(
        "adminBtn",
        async () => {

            await funguaAdminDashboard();

        }
    );


    /*
       LOGIN
    */

    roomRentBindClick(
        "signInBtn",
        async () => {

            await signInUser();

        }
    );


    /*
       SIGN UP
    */

    roomRentBindClick(
        "signUpBtn",
        async () => {

            await signUpUser();

        }
    );


    /*
       LOGOUT
    */

    roomRentBindClick(
        "signOutBtn",
        async () => {

            await signOutUser();

        }
    );


    /*
       LOGO
    */

    roomRentBindClick(
        "roomrentLogo",
        () => {

            if (!currentUser) {
                return;
            }


            clearMainSections();

        }
    );

}


/* =========================================================
   12.4 CONNECT AUTH UI
========================================================= */

function sasishaAuthUI() {

    const signedInElements =
        document.querySelectorAll(
            ".roomrent-signed-in"
        );


    const signedOutElements =
        document.querySelectorAll(
            ".roomrent-signed-out"
        );


    signedInElements.forEach(
        element => {

            element.style.display =
                currentUser
                    ? ""
                    : "none";

        }
    );


    signedOutElements.forEach(
        element => {

            element.style.display =
                currentUser
                    ? "none"
                    : "";

        }
    );


    /*
       Admin button
    */

    const adminBtn =
        document.getElementById(
            "adminBtn"
        );


    if (adminBtn) {

        adminBtn.style.display =
            currentUser && niAdmin()
                ? ""
                : "none";

    }


    /*
       Withdrawal button
    */

    const withdrawalBtn =
        document.getElementById(
            "withdrawalBtn"
        );


    if (withdrawalBtn) {

        withdrawalBtn.style.display =
            currentUser
                ? ""
                : "none";

    }

}


/* =========================================================
   12.5 HIDE PRIVATE SECTIONS
========================================================= */

function fichaSehemuZaPrivate() {

    const privateSections = [

        "vyumba",

        "fomuKodi",

        "taarifaSection",

        "mainWallet",

        "withdrawalSection",

        "bookingList",

        "accountSection",

        "adminSection"

    ];


    privateSections.forEach(
        id => {

            const section =
                document.getElementById(
                    id
                );


            if (section) {

                section.style.display =
                    "none";

            }

        }
    );

}


/* =========================================================
   12.6 UPDATE LOGIN STATE
========================================================= */

function sasishaHaliYaMfumo() {

    sasishaAuthUI();


    if (!currentUser) {

        /*
           Hakuna user aliyeingia.

           Vyumba na sehemu binafsi
           zisifanye kazi.
        */

        fichaSehemuZaPrivate();


        simamishaNotificationsListener();

        simamishaAccountListener();

        simamishaAdminBookingsListener();


        return;
    }


    /*
       User ameingia.
    */

    if (
        typeof anzishaNotificationsListener ===
        "function"
    ) {

        anzishaNotificationsListener();

    }


    if (
        typeof anzishaAccountListener ===
        "function"
    ) {

        anzishaAccountListener();

    }


    /*
       Hakikisha referral link
       ipo sahihi.
    */

    if (
        typeof hakikishaReferralLinkYaAccount ===
        "function"
    ) {

        hakikishaReferralLinkYaAccount();

    }

}


/* =========================================================
   12.7 INITIALIZE SYSTEM
========================================================= */

function initializeRoomRentSystem() {

    /*
       Zuia initialization kufanyika
       mara mbili.
    */

    if (
        roomRentSystemInitialized
    ) {

        return;
    }


    roomRentSystemInitialized =
        true;


    console.log(
        "🚀 RoomRent system inaanza..."
    );


    /*
       Hide private sections
       kabla ya user login.
    */

    fichaSehemuZaPrivate();


    /*
       Connect all buttons.
    */

    unganishaMainButtons();


    /*
       Initial auth UI.
    */

    sasishaAuthUI();


    /*
       Kama auth state tayari ipo,
       sasisha mfumo.
    */

    sasishaHaliYaMfumo();


    console.log(
        "✅ RoomRent system iko tayari."
    );

}


/* =========================================================
   12.8 AUTH STATE BRIDGE
=========================================================

   Tunatumia listener hii kusasisha UI
   kila Firebase Auth inapobadilika.

   Kama Section 2 tayari ina
   onAuthStateChanged, hii bridge
   haitengenezi user mpya; inasubiri
   currentUser iliyowekwa na Section 2.
========================================================= */

function roomRentAuthUIRefresh() {

    try {

        sasishaHaliYaMfumo();

    } catch (error) {

        console.error(
            "Auth UI refresh error:",
            error
        );

    }

}


/* =========================================================
   12.9 PAGE LOAD
========================================================= */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeRoomRentSystem,
        {
            once: true
        }
    );

} else {

    initializeRoomRentSystem();

}


/* =========================================================
   12.10 EXPOSE FUNCTIONS
========================================================= */

window.roomRentBindClick =
    roomRentBindClick;

window.unganishaMainButtons =
    unganishaMainButtons;

window.sasishaAuthUI =
    sasishaAuthUI;

window.fichaSehemuZaPrivate =
    fichaSehemuZaPrivate;

window.sasishaHaliYaMfumo =
    sasishaHaliYaMfumo;

window.initializeRoomRentSystem =
    initializeRoomRentSystem;

window.roomRentAuthUIRefresh =
    roomRentAuthUIRefresh;


/* =========================================================
   MWISHO WA SEHEMU YA 12
========================================================= *//* =========================================================
   ROOMRENT - SEHEMU YA 12
   SYSTEM INITIALIZATION + BUTTON CONNECTIONS
   =========================================================

   MFUMO:
   - Inaunganisha buttons za HTML
   - Binding ya buttons inafanyika mara moja
   - Inazuia duplicate event listeners
   - Inaunganisha Admin
   - Inaunganisha Notifications
   - Inaweka mfumo tayari baada ya page load
   ========================================================= */


/* =========================================================
   12.1 INITIALIZATION FLAG
========================================================= */

let roomRentSystemInitialized = false;


/* =========================================================
   12.2 SAFE BUTTON CLICK
========================================================= */

function roomRentBindClick(
    elementId,
    callback
) {

    const element =
        document.getElementById(
            elementId
        );


    if (!element) {

        console.warn(
            "RoomRent: Button haipo:",
            elementId
        );

        return false;
    }


    /*
       Ondoa onclick ya zamani
       kama ilikuwa imewekwa na
       mfumo huu.
    */

    element.onclick = null;


    /*
       onclick property inatumika
       badala ya addEventListener.

       Hii inasaidia kuzuia
       duplicate listeners.
    */

    element.onclick =
        function(event) {

            try {

                const result =
                    callback(event);


                /*
                   Kama callback imerudisha
                   Promise, ishughulikie
                   bila kuvunja UI.
                */

                if (
                    result &&
                    typeof result.catch ===
                    "function"
                ) {

                    result.catch(
                        error => {

                            console.error(
                                "RoomRent button error:",
                                error
                            );

                        }
                    );

                }

            } catch (error) {

                console.error(
                    "RoomRent button error:",
                    error
                );

            }

        };


    return true;
}


/* =========================================================
   12.3 CONNECT MAIN BUTTONS
========================================================= */

function unganishaMainButtons() {


    /*
       VYUMBA
    */

    roomRentBindClick(
        "angaliaVyumba",
        async () => {

            if (!requireLogin()) {
                return;
            }


            await onyeshaVyumba();

        }
    );


    /*
       BOOKING ZANGU
    */

    roomRentBindClick(
        "bookingZangu",
        async () => {

            await funguaBookingZangu();

        }
    );


    /*
       ACCOUNT
    */

    roomRentBindClick(
        "accountBtn",
        async () => {

            await funguaAccount();

        }
    );


    /*
       TAARIFA
    */

    roomRentBindClick(
        "taarifaBtn",
        async () => {

            await funguaTaarifa();

        }
    );


    /*
       WITHDRAWAL
    */

    roomRentBindClick(
        "withdrawalBtn",
        async () => {

            await funguaWithdrawal();

        }
    );


    /*
       ADMIN
    */

    roomRentBindClick(
        "adminBtn",
        async () => {

            await funguaAdminDashboard();

        }
    );


    /*
       LOGIN
    */

    roomRentBindClick(
        "signInBtn",
        async () => {

            await signInUser();

        }
    );


    /*
       SIGN UP
    */

    roomRentBindClick(
        "signUpBtn",
        async () => {

            await signUpUser();

        }
    );


    /*
       LOGOUT
    */

    roomRentBindClick(
        "signOutBtn",
        async () => {

            await signOutUser();

        }
    );


    /*
       LOGO
    */

    roomRentBindClick(
        "roomrentLogo",
        () => {

            if (!currentUser) {
                return;
            }


            clearMainSections();

        }
    );

}


/* =========================================================
   12.4 CONNECT AUTH UI
========================================================= */

function sasishaAuthUI() {

    const signedInElements =
        document.querySelectorAll(
            ".roomrent-signed-in"
        );


    const signedOutElements =
        document.querySelectorAll(
            ".roomrent-signed-out"
        );


    signedInElements.forEach(
        element => {

            element.style.display =
                currentUser
                    ? ""
                    : "none";

        }
    );


    signedOutElements.forEach(
        element => {

            element.style.display =
                currentUser
                    ? "none"
                    : "";

        }
    );


    /*
       Admin button
    */

    const adminBtn =
        document.getElementById(
            "adminBtn"
        );


    if (adminBtn) {

        adminBtn.style.display =
            currentUser && niAdmin()
                ? ""
                : "none";

    }


    /*
       Withdrawal button
    */

    const withdrawalBtn =
        document.getElementById(
            "withdrawalBtn"
        );


    if (withdrawalBtn) {

        withdrawalBtn.style.display =
            currentUser
                ? ""
                : "none";

    }

}


/* =========================================================
   12.5 HIDE PRIVATE SECTIONS
========================================================= */

function fichaSehemuZaPrivate() {

    const privateSections = [

        "vyumba",

        "fomuKodi",

        "taarifaSection",

        "mainWallet",

        "withdrawalSection",

        "bookingList",

        "accountSection",

        "adminSection"

    ];


    privateSections.forEach(
        id => {

            const section =
                document.getElementById(
                    id
                );


            if (section) {

                section.style.display =
                    "none";

            }

        }
    );

}


/* =========================================================
   12.6 UPDATE LOGIN STATE
========================================================= */

function sasishaHaliYaMfumo() {

    sasishaAuthUI();


    if (!currentUser) {

        /*
           Hakuna user aliyeingia.

           Vyumba na sehemu binafsi
           zisifanye kazi.
        */

        fichaSehemuZaPrivate();


        simamishaNotificationsListener();

        simamishaAccountListener();

        simamishaAdminBookingsListener();


        return;
    }


    /*
       User ameingia.
    */

    if (
        typeof anzishaNotificationsListener ===
        "function"
    ) {

        anzishaNotificationsListener();

    }


    if (
        typeof anzishaAccountListener ===
        "function"
    ) {

        anzishaAccountListener();

    }


    /*
       Hakikisha referral link
       ipo sahihi.
    */

    if (
        typeof hakikishaReferralLinkYaAccount ===
        "function"
    ) {

        hakikishaReferralLinkYaAccount();

    }

}


/* =========================================================
   12.7 INITIALIZE SYSTEM
========================================================= */

function initializeRoomRentSystem() {

    /*
       Zuia initialization kufanyika
       mara mbili.
    */

    if (
        roomRentSystemInitialized
    ) {

        return;
    }


    roomRentSystemInitialized =
        true;


    console.log(
        "🚀 RoomRent system inaanza..."
    );


    /*
       Hide private sections
       kabla ya user login.
    */

    fichaSehemuZaPrivate();


    /*
       Connect all buttons.
    */

    unganishaMainButtons();


    /*
       Initial auth UI.
    */

    sasishaAuthUI();


    /*
       Kama auth state tayari ipo,
       sasisha mfumo.
    */

    sasishaHaliYaMfumo();


    console.log(
        "✅ RoomRent system iko tayari."
    );

}


/* =========================================================
   12.8 AUTH STATE BRIDGE
=========================================================

   Tunatumia listener hii kusasisha UI
   kila Firebase Auth inapobadilika.

   Kama Section 2 tayari ina
   onAuthStateChanged, hii bridge
   haitengenezi user mpya; inasubiri
   currentUser iliyowekwa na Section 2.
========================================================= */

function roomRentAuthUIRefresh() {

    try {

        sasishaHaliYaMfumo();

    } catch (error) {

        console.error(
            "Auth UI refresh error:",
            error
        );

    }

}


/* =========================================================
   12.9 PAGE LOAD
========================================================= */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeRoomRentSystem,
        {
            once: true
        }
    );

} else {

    initializeRoomRentSystem();

}


/* =========================================================
   12.10 EXPOSE FUNCTIONS
========================================================= */

window.roomRentBindClick =
    roomRentBindClick;

window.unganishaMainButtons =
    unganishaMainButtons;

window.sasishaAuthUI =
    sasishaAuthUI;

window.fichaSehemuZaPrivate =
    fichaSehemuZaPrivate;

window.sasishaHaliYaMfumo =
    sasishaHaliYaMfumo;

window.initializeRoomRentSystem =
    initializeRoomRentSystem;

window.roomRentAuthUIRefresh =
    roomRentAuthUIRefresh;


/* =========================================================
   MWISHO WA SEHEMU YA 12
========================================================= */
/* =========================================================
   ROOMRENT - SECTION YA 13
   ADMIN WITHDRAWAL MANAGEMENT
   =========================================================
   
   MFUMO:
   - Admin anaona maombi yote ya withdrawal
   - Admin anaweza APPROVE
   - Admin anaweza REJECT
   - Approve/Reject hutumia Cloud Functions
   - Browser HAIBADILISHI wallet moja kwa moja
   - Withdrawal fee = 0
   ========================================================= */


/* =========================================================
   13.1 ADMIN WITHDRAWAL VARIABLES
========================================================= */

let unsubscribeAdminWithdrawals = null;


/* =========================================================
   13.2 FUNGUA ADMIN WITHDRAWALS
========================================================= */

function funguaAdminWithdrawals() {

    if (!requireAdmin()) return;

    clearMainSections();

    const section = getElement("adminSection");

    if (!section) {
        console.warn("adminSection haipo kwenye HTML.");
        return;
    }

    section.style.display = "block";

    section.innerHTML = `

        <div class="admin-withdrawal-page">

            <div class="admin-page-header">

                <h2>💸 Withdrawal Requests</h2>

                <button
                    type="button"
                    id="adminBackFromWithdrawalsBtn">
                    ← Rudi Admin
                </button>

                <button
                    type="button"
                    id="adminRefreshWithdrawalsBtn">
                    🔄 Refresh
                </button>

            </div>

            <div id="adminWithdrawalsMessage"></div>

            <div id="adminWithdrawalsList">

                <p>
                    ⏳ Inapakia maombi ya withdrawal...
                </p>

            </div>

        </div>
    `;

    anzishaAdminWithdrawalsListener();

    const backBtn =
        document.getElementById(
            "adminBackFromWithdrawalsBtn"
        );

    if (backBtn) {

        backBtn.onclick = function () {
            funguaAdminDashboard();
        };

    }


    const refreshBtn =
        document.getElementById(
            "adminRefreshWithdrawalsBtn"
        );

    if (refreshBtn) {

        refreshBtn.onclick = function () {

            anzishaAdminWithdrawalsListener();

        };

    }

}


/* =========================================================
   13.3 ADMIN WITHDRAWALS LISTENER
========================================================= */

function anzishaAdminWithdrawalsListener() {

    if (!requireAdmin()) return;

    simamishaAdminWithdrawalsListener();

    const container =
        document.getElementById(
            "adminWithdrawalsList"
        );

    if (!container) return;

    try {

        unsubscribeAdminWithdrawals =
            db.collection("withdrawals")
                .orderBy("createdAt", "desc")
                .limit(100)
                .onSnapshot(

                    snapshot => {

                        const withdrawals = [];

                        snapshot.forEach(doc => {

                            withdrawals.push({
                                id: doc.id,
                                ...doc.data()
                            });

                        });

                        onyeshaAdminWithdrawals(
                            withdrawals
                        );

                    },

                    error => {

                        console.error(
                            "Admin withdrawals listener error:",
                            error
                        );

                        container.innerHTML = `

                            <div class="error-box">

                                ❌ Imeshindikana kupakia
                                withdrawal requests.

                                <br><br>

                                ${escapeHTML(
                                    firebaseErrorMessage(error)
                                )}

                            </div>
                        `;

                    }

                );

    } catch (error) {

        console.error(
            "anzishaAdminWithdrawalsListener:",
            error
        );

    }

}


/* =========================================================
   13.4 DISPLAY ADMIN WITHDRAWALS
========================================================= */

function onyeshaAdminWithdrawals(
    withdrawals = []
) {

    const container =
        document.getElementById(
            "adminWithdrawalsList"
        );

    if (!container) return;

    if (!withdrawals.length) {

        container.innerHTML = `

            <div class="empty-box">

                📭 Hakuna withdrawal requests
                kwa sasa.

            </div>

        `;

        return;

    }


    container.innerHTML = `

        <div class="admin-withdrawals-count">

            <strong>
                Maombi: ${withdrawals.length}
            </strong>

        </div>

        <div class="admin-withdrawals-wrapper">

            ${withdrawals
                .map(tengenezaAdminWithdrawalCard)
                .join("")}

        </div>

    `;


    document
        .querySelectorAll(
            ".admin-withdrawal-approve-btn"
        )
        .forEach(button => {

            button.onclick = function () {

                const withdrawalId =
                    button.dataset.withdrawalId;

                approveAdminWithdrawal(
                    withdrawalId
                );

            };

        });


    document
        .querySelectorAll(
            ".admin-withdrawal-reject-btn"
        )
        .forEach(button => {

            button.onclick = function () {

                const withdrawalId =
                    button.dataset.withdrawalId;

                rejectAdminWithdrawal(
                    withdrawalId
                );

            };

        });

}


/* =========================================================
   13.5 WITHDRAWAL CARD
========================================================= */

function tengenezaAdminWithdrawalCard(
    withdrawal
) {

    const id =
        withdrawal.id || "";

    const status =
        withdrawal.status || "pending";

    const amount =
        Number(withdrawal.amount || 0);

    const fee =
        Number(withdrawal.fee || 0);

    const netAmount =
        Number(
            withdrawal.netAmount ??
            (amount - fee)
        );

    const customerName =
        withdrawal.customerName ||
        withdrawal.name ||
        "Mteja";

    const phone =
        withdrawal.phone ||
        withdrawal.customerPhone ||
        "";

    const method =
        withdrawal.method ||
        withdrawal.paymentMethod ||
        "";

    const uid =
        withdrawal.uid ||
        withdrawal.userId ||
        "";

    const createdAt =
        formatFirestoreDate(
            withdrawal.createdAt
        );


    let statusText = "⏳ Pending";

    if (status === "approved") {
        statusText = "✅ Approved";
    }

    if (status === "rejected") {
        statusText = "❌ Rejected";
    }


    const isPending =
        status === "pending";


    return `

        <div
            class="admin-withdrawal-card"
            data-withdrawal-id="${escapeHTML(id)}"
        >

            <div class="withdrawal-header">

                <h3>
                    💸 ${escapeHTML(customerName)}
                </h3>

                <span>
                    ${statusText}
                </span>

            </div>


            <div class="withdrawal-details">

                <p>
                    <strong>Withdrawal ID:</strong>
                    ${escapeHTML(id)}
                </p>

                <p>
                    <strong>UID:</strong>
                    ${escapeHTML(uid)}
                </p>

                <p>
                    <strong>Simu:</strong>
                    ${escapeHTML(phone)}
                </p>

                <p>
                    <strong>Njia:</strong>
                    ${escapeHTML(method)}
                </p>

                <p>
                    <strong>Kiasi:</strong>
                    ${formatMoney(amount)}
                </p>

                <p>
                    <strong>Fee:</strong>
                    ${formatMoney(fee)}
                </p>

                <p>
                    <strong>Kiasi cha kutumwa:</strong>
                    ${formatMoney(netAmount)}
                </p>

                <p>
                    <strong>Tarehe:</strong>
                    ${escapeHTML(createdAt)}
                </p>

                ${
                    withdrawal.rejectionReason
                        ? `
                            <p>
                                <strong>
                                    Sababu ya kukataliwa:
                                </strong>

                                ${escapeHTML(
                                    withdrawal.rejectionReason
                                )}
                            </p>
                          `
                        : ""
                }

            </div>


            ${
                isPending
                    ? `

                        <div class="withdrawal-admin-actions">

                            <button
                                type="button"
                                class="admin-withdrawal-approve-btn"
                                data-withdrawal-id="${escapeHTML(id)}">

                                ✅ Approve

                            </button>


                            <button
                                type="button"
                                class="admin-withdrawal-reject-btn"
                                data-withdrawal-id="${escapeHTML(id)}">

                                ❌ Reject

                            </button>

                        </div>

                      `
                    : ""
            }

        </div>

    `;

}


/* =========================================================
   13.6 APPROVE WITHDRAWAL
========================================================= */

async function approveAdminWithdrawal(
    withdrawalId
) {

    if (!requireAdmin()) return;

    if (!withdrawalId) {

        alert(
            "❌ Withdrawal ID haipo."
        );

        return;

    }


    const confirmed =
        confirm(
            "Unataka ku-APPROVE withdrawal hii?"
        );

    if (!confirmed) return;


    try {

        const button =
            document.querySelector(
                `.admin-withdrawal-approve-btn[data-withdrawal-id="${CSS.escape(withdrawalId)}"]`
            );

        if (button) {

            button.disabled = true;

            button.textContent =
                "⏳ Ina-approve...";

        }


        if (
            !firebase.functions ||
            typeof firebase.functions !== "function"
        ) {

            throw new Error(
                "Firebase Functions haijaunganishwa."
            );

        }


        const functions =
            firebase.functions();

        const approveWithdrawal =
            functions.httpsCallable(
                "approveWithdrawal"
            );


        const result =
            await approveWithdrawal({
                withdrawalId: withdrawalId
            });


        console.log(
            "Withdrawal approved:",
            result.data
        );


        alert(
            "✅ Withdrawal ime-approve successfully."
        );


    } catch (error) {

        console.error(
            "approveAdminWithdrawal:",
            error
        );


        alert(
            "❌ Imeshindikana ku-approve withdrawal:\n\n" +
            firebaseErrorMessage(error)
        );


    } finally {

        const button =
            document.querySelector(
                `.admin-withdrawal-approve-btn[data-withdrawal-id="${CSS.escape(withdrawalId)}"]`
            );

        if (button) {

            button.disabled = false;

            button.textContent =
                "✅ Approve";

        }

    }

}


/* =========================================================
   13.7 REJECT WITHDRAWAL
========================================================= */

async function rejectAdminWithdrawal(
    withdrawalId
) {

    if (!requireAdmin()) return;

    if (!withdrawalId) {

        alert(
            "❌ Withdrawal ID haipo."
        );

        return;

    }


    const reason =
        prompt(
            "Andika sababu ya kukataa withdrawal:"
        );


    if (reason === null) {
        return;
    }


    const cleanReason =
        String(reason).trim();


    if (!cleanReason) {

        alert(
            "❌ Lazima uweke sababu ya rejection."
        );

        return;

    }


    const confirmed =
        confirm(
            "Una uhakika unataka kukataa withdrawal hii?"
        );

    if (!confirmed) return;


    try {

        const button =
            document.querySelector(
                `.admin-withdrawal-reject-btn[data-withdrawal-id="${CSS.escape(withdrawalId)}"]`
            );

        if (button) {

            button.disabled = true;

            button.textContent =
                "⏳ Ina-reject...";

        }


        if (
            !firebase.functions ||
            typeof firebase.functions !== "function"
        ) {

            throw new Error(
                "Firebase Functions haijaunganishwa."
            );

        }


        const functions =
            firebase.functions();


        const rejectWithdrawal =
            functions.httpsCallable(
                "rejectWithdrawal"
            );


        const result =
            await rejectWithdrawal({

                withdrawalId: withdrawalId,

                reason: cleanReason

            });


        console.log(
            "Withdrawal rejected:",
            result.data
        );


        alert(
            "✅ Withdrawal imekataliwa."
        );


    } catch (error) {

        console.error(
            "rejectAdminWithdrawal:",
            error
        );


        alert(
            "❌ Imeshindikana kukataa withdrawal:\n\n" +
            firebaseErrorMessage(error)
        );


    } finally {

        const button =
            document.querySelector(
                `.admin-withdrawal-reject-btn[data-withdrawal-id="${CSS.escape(withdrawalId)}"]`
            );

        if (button) {

            button.disabled = false;

            button.textContent =
                "❌ Reject";

        }

    }

}


/* =========================================================
   13.8 STOP LISTENER
========================================================= */

function simamishaAdminWithdrawalsListener() {

    if (
        typeof unsubscribeAdminWithdrawals ===
        "function"
    ) {

        try {

            unsubscribeAdminWithdrawals();

        } catch (error) {

            console.warn(
                "Admin withdrawals unsubscribe error:",
                error
            );

        }

    }


    unsubscribeAdminWithdrawals = null;

}


/* =========================================================
   13.9 CLEAN ADMIN WITHDRAWALS
========================================================= */

function safishaAdminWithdrawalsData() {

    simamishaAdminWithdrawalsListener();

    const container =
        document.getElementById(
            "adminWithdrawalsList"
        );

    if (container) {

        container.innerHTML = "";

    }

}


/* =========================================================
   13.10 ADD WITHDRAWAL BUTTON TO ADMIN DASHBOARD
========================================================= */

function ongezaAdminWithdrawalsButton() {

    if (!requireAdmin()) return;

    const adminSection =
        document.getElementById(
            "adminSection"
        );

    if (!adminSection) return;


    if (
        document.getElementById(
            "adminWithdrawalsBtn"
        )
    ) {

        return;

    }


    const dashboard =
        adminSection.querySelector(
            ".admin-dashboard"
        );


    const parent =
        dashboard ||
        adminSection;


    const button =
        document.createElement("button");


    button.type = "button";

    button.id =
        "adminWithdrawalsBtn";

    button.textContent =
        "💸 Withdrawals";

    button.onclick =
        function () {

            funguaAdminWithdrawals();

        };


    parent.appendChild(button);

}


/* =========================================================
   13.11 EXPOSE FUNCTIONS
========================================================= */

window.funguaAdminWithdrawals =
    funguaAdminWithdrawals;

window.anzishaAdminWithdrawalsListener =
    anzishaAdminWithdrawalsListener;

window.onyeshaAdminWithdrawals =
    onyeshaAdminWithdrawals;

window.tengenezaAdminWithdrawalCard =
    tengenezaAdminWithdrawalCard;

window.approveAdminWithdrawal =
    approveAdminWithdrawal;

window.rejectAdminWithdrawal =
    rejectAdminWithdrawal;

window.simamishaAdminWithdrawalsListener =
    simamishaAdminWithdrawalsListener;

window.safishaAdminWithdrawalsData =
    safishaAdminWithdrawalsData;

window.ongezaAdminWithdrawalsButton =
    ongezaAdminWithdrawalsButton;


/* =========================================================
   13.12 SAFE ADMIN BUTTON SETUP
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        setTimeout(
            function () {

                if (!isAdmin) return;

                ongezaAdminWithdrawalsButton();

            },
            500
        );

    }
);

/* =========================================================
   ROOMRENT - SECTION YA 14
   ADMIN STATISTICS / SYSTEM OVERVIEW
   =========================================================

   MFUMO:
   - Admin anaona muhtasari wa mfumo
   - Total bookings
   - Pending payments
   - Confirmed bookings
   - Rejected bookings
   - Completed bookings
   - Total sales
   - Total profit iliyolipwa
   - Total withdrawals
   - Pending withdrawals
   - Approved withdrawals
   - Rejected withdrawals

   MUHIMU:
   - Hii ni DISPLAY / REPORTING TU
   - Haibadilishi wallet
   - Haibadilishi booking
   - Haibadilishi profit
   ========================================================= */


/* =========================================================
   14.1 VARIABLES
========================================================= */

let adminStatisticsLoading = false;


/* =========================================================
   14.2 FUNGUA ADMIN STATISTICS
========================================================= */

async function funguaAdminStatistics() {

    if (!requireAdmin()) return;

    clearMainSections();

    const section =
        getElement("adminSection");

    if (!section) {

        console.warn(
            "adminSection haipo kwenye HTML."
        );

        return;
    }

    section.style.display = "block";

    section.innerHTML = `

        <div class="admin-statistics-page">

            <div class="admin-page-header">

                <h2>📊 RoomRent Statistics</h2>

                <button
                    type="button"
                    id="adminBackFromStatisticsBtn">

                    ← Rudi Admin

                </button>

                <button
                    type="button"
                    id="adminRefreshStatisticsBtn">

                    🔄 Refresh

                </button>

            </div>


            <div
                id="adminStatisticsMessage">
            </div>


            <div
                id="adminStatisticsLoading">

                ⏳ Inapakia statistics...

            </div>


            <div
                id="adminStatisticsContent"
                style="display:none;">

                <div
                    id="adminStatisticsCards"
                    class="admin-statistics-cards">
                </div>


                <div
                    id="adminStatisticsDetails"
                    class="admin-statistics-details">
                </div>

            </div>

        </div>

    `;


    const backBtn =
        document.getElementById(
            "adminBackFromStatisticsBtn"
        );

    if (backBtn) {

        backBtn.onclick =
            function () {

                funguaAdminDashboard();

            };

    }


    const refreshBtn =
        document.getElementById(
            "adminRefreshStatisticsBtn"
        );

    if (refreshBtn) {

        refreshBtn.onclick =
            function () {

                pakiaAdminStatistics();

            };

    }


    await pakiaAdminStatistics();

}


/* =========================================================
   14.3 LOAD STATISTICS
========================================================= */

async function pakiaAdminStatistics() {

    if (!requireAdmin()) return;

    if (adminStatisticsLoading) {
        return;
    }

    adminStatisticsLoading = true;


    const loading =
        document.getElementById(
            "adminStatisticsLoading"
        );

    const content =
        document.getElementById(
            "adminStatisticsContent"
        );

    const message =
        document.getElementById(
            "adminStatisticsMessage"
        );


    if (loading) {

        loading.style.display =
            "block";

        loading.innerHTML =
            "⏳ Inapakia statistics...";

    }


    if (content) {

        content.style.display =
            "none";

    }


    if (message) {

        message.innerHTML = "";

    }


    try {

        const data =
            await pataAdminStatistics();

        onyeshaAdminStatistics(
            data
        );


    } catch (error) {

        console.error(
            "pakiaAdminStatistics:",
            error
        );


        if (loading) {

            loading.innerHTML = `
                ❌ Imeshindikana kupakia
                statistics.
            `;

        }


        if (message) {

            message.innerHTML = `

                <div class="error-box">

                    ${escapeHTML(
                        firebaseErrorMessage(error)
                    )}

                </div>

            `;

        }

    } finally {

        adminStatisticsLoading =
            false;

    }

}


/* =========================================================
   14.4 GET BOOKING STATISTICS
========================================================= */

async function pataAdminBookingStatistics() {

    const snapshot =
        await db.collection("bookings")
            .get();


    const stats = {

        total: 0,

        pending: 0,

        confirmed: 0,

        rejected: 0,

        completed: 0,

        totalSales: 0,

        totalProfit: 0,

        totalProfitPaid: 0

    };


    snapshot.forEach(doc => {

        const booking =
            doc.data() || {};


        stats.total++;


        const status =
            booking.status ||
            "pending";


        if (
            status ===
            "payment_pending"
        ) {

            stats.pending++;

        }


        if (
            status ===
            "confirmed"
        ) {

            stats.confirmed++;

        }


        if (
            status ===
            "rejected"
        ) {

            stats.rejected++;

        }


        if (
            status ===
            "completed"
        ) {

            stats.completed++;

        }


        stats.totalSales +=
            Number(
                booking.amount ||
                booking.price ||
                0
            );


        stats.totalProfit +=
            Number(
                booking.totalProfit ||
                0
            );


        stats.totalProfitPaid +=
            Number(
                booking.totalProfitPaid ||
                0
            );

    });


    return stats;

}


/* =========================================================
   14.5 GET WITHDRAWAL STATISTICS
========================================================= */

async function pataAdminWithdrawalStatistics() {

    const snapshot =
        await db.collection("withdrawals")
            .get();


    const stats = {

        total: 0,

        pending: 0,

        approved: 0,

        rejected: 0,

        totalAmount: 0,

        pendingAmount: 0,

        approvedAmount: 0,

        rejectedAmount: 0

    };


    snapshot.forEach(doc => {

        const withdrawal =
            doc.data() || {};


        stats.total++;


        const amount =
            Number(
                withdrawal.amount ||
                0
            );


        const status =
            withdrawal.status ||
            "pending";


        stats.totalAmount +=
            amount;


        if (
            status ===
            "pending"
        ) {

            stats.pending++;

            stats.pendingAmount +=
                amount;

        }


        if (
            status ===
            "approved"
        ) {

            stats.approved++;

            stats.approvedAmount +=
                amount;

        }


        if (
            status ===
            "rejected"
        ) {

            stats.rejected++;

            stats.rejectedAmount +=
                amount;

        }

    });


    return stats;

}


/* =========================================================
   14.6 COMBINE ALL STATISTICS
========================================================= */

async function pataAdminStatistics() {

    const [
        bookingStats,
        withdrawalStats
    ] = await Promise.all([

        pataAdminBookingStatistics(),

        pataAdminWithdrawalStatistics()

    ]);


    return {

        bookings:
            bookingStats,

        withdrawals:
            withdrawalStats,

        generatedAt:
            new Date()

    };

}


/* =========================================================
   14.7 DISPLAY STATISTICS
========================================================= */

function onyeshaAdminStatistics(
    data
) {

    const loading =
        document.getElementById(
            "adminStatisticsLoading"
        );

    const content =
        document.getElementById(
            "adminStatisticsContent"
        );

    const cards =
        document.getElementById(
            "adminStatisticsCards"
        );

    const details =
        document.getElementById(
            "adminStatisticsDetails"
        );


    if (!cards || !details) {
        return;
    }


    const bookings =
        data.bookings || {};


    const withdrawals =
        data.withdrawals || {};


    cards.innerHTML = `

        <div class="admin-stat-card">

            <h3>📦 Bookings</h3>

            <strong>
                ${bookings.total || 0}
            </strong>

        </div>


        <div class="admin-stat-card">

            <h3>⏳ Pending</h3>

            <strong>
                ${bookings.pending || 0}
            </strong>

        </div>


        <div class="admin-stat-card">

            <h3>✅ Confirmed</h3>

            <strong>
                ${bookings.confirmed || 0}
            </strong>

        </div>


        <div class="admin-stat-card">

            <h3>❌ Rejected</h3>

            <strong>
                ${bookings.rejected || 0}
            </strong>

        </div>


        <div class="admin-stat-card">

            <h3>🏁 Completed</h3>

            <strong>
                ${bookings.completed || 0}
            </strong>

        </div>


        <div class="admin-stat-card">

            <h3>💰 Total Sales</h3>

            <strong>
                ${formatMoney(
                    bookings.totalSales || 0
                )}
            </strong>

        </div>


        <div class="admin-stat-card">

            <h3>📈 Profit Total</h3>

            <strong>
                ${formatMoney(
                    bookings.totalProfit || 0
                )}
            </strong>

        </div>


        <div class="admin-stat-card">

            <h3>💵 Profit Paid</h3>

            <strong>
                ${formatMoney(
                    bookings.totalProfitPaid || 0
                )}
            </strong>

        </div>


        <div class="admin-stat-card">

            <h3>💸 Withdrawals</h3>

            <strong>
                ${withdrawals.total || 0}
            </strong>

        </div>


        <div class="admin-stat-card">

            <h3>⏳ Pending Withdrawals</h3>

            <strong>
                ${withdrawals.pending || 0}
            </strong>

        </div>


        <div class="admin-stat-card">

            <h3>✅ Approved Withdrawals</h3>

            <strong>
                ${withdrawals.approved || 0}
            </strong>

        </div>


        <div class="admin-stat-card">

            <h3>❌ Rejected Withdrawals</h3>

            <strong>
                ${withdrawals.rejected || 0}
            </strong>

        </div>

    `;


    details.innerHTML = `

        <div class="admin-statistics-report">

            <h3>
                📊 Financial Overview
            </h3>


            <p>
                <strong>
                    Jumla ya Booking:
                </strong>

                ${bookings.total || 0}
            </p>


            <p>
                <strong>
                    Mauzo:
                </strong>

                ${formatMoney(
                    bookings.totalSales || 0
                )}
            </p>


            <p>
                <strong>
                    Profit iliyopangwa:
                </strong>

                ${formatMoney(
                    bookings.totalProfit || 0
                )}
            </p>


            <p>
                <strong>
                    Profit iliyolipwa:
                </strong>

                ${formatMoney(
                    bookings.totalProfitPaid || 0
                )}
            </p>


            <p>
                <strong>
                    Withdrawal zote:
                </strong>

                ${formatMoney(
                    withdrawals.totalAmount || 0
                )}
            </p>


            <p>
                <strong>
                    Withdrawal pending:
                </strong>

                ${formatMoney(
                    withdrawals.pendingAmount || 0
                )}
            </p>


            <p>
                <strong>
                    Withdrawal approved:
                </strong>

                ${formatMoney(
                    withdrawals.approvedAmount || 0
                )}
            </p>


            <p>
                <strong>
                    Withdrawal rejected:
                </strong>

                ${formatMoney(
                    withdrawals.rejectedAmount || 0
                )}
            </p>


            <hr>


            <p>

                <strong>
                    Mfumo wa Profit:
                </strong>

                ${ROOMRENT_SETTINGS.durationDays}
                siku

            </p>


            <p>

                <strong>
                    Withdrawal Fee:
                </strong>

                ${formatMoney(
                    ROOMRENT_SETTINGS.withdrawalFee || 0
                )}

            </p>


            <p>

                <strong>
                    Minimum Withdrawal:
                </strong>

                ${formatMoney(
                    ROOMRENT_SETTINGS.minimumWithdrawal || 0
                )}

            </p>

        </div>

    `;


    if (loading) {

        loading.style.display =
            "none";

    }


    if (content) {

        content.style.display =
            "block";

    }

}


/* =========================================================
   14.8 ADD STATISTICS BUTTON TO ADMIN
========================================================= */

function ongezaAdminStatisticsButton() {

    if (!requireAdmin()) return;


    const adminSection =
        document.getElementById(
            "adminSection"
        );

    if (!adminSection) return;


    if (
        document.getElementById(
            "adminStatisticsBtn"
        )
    ) {

        return;

    }


    const dashboard =
        adminSection.querySelector(
            ".admin-dashboard"
        );


    const parent =
        dashboard ||
        adminSection;


    const button =
        document.createElement(
            "button"
        );


    button.type = "button";

    button.id =
        "adminStatisticsBtn";

    button.textContent =
        "📊 Statistics";


    button.onclick =
        function () {

            funguaAdminStatistics();

        };


    parent.appendChild(button);

}


/* =========================================================
   14.9 REFRESH STATISTICS
========================================================= */

async function refreshAdminStatistics() {

    if (!requireAdmin()) return;

    await pakiaAdminStatistics();

}


/* =========================================================
   14.10 CLEAN STATISTICS
========================================================= */

function safishaAdminStatisticsData() {

    adminStatisticsLoading =
        false;


    const cards =
        document.getElementById(
            "adminStatisticsCards"
        );

    const details =
        document.getElementById(
            "adminStatisticsDetails"
        );


    if (cards) {

        cards.innerHTML = "";

    }


    if (details) {

        details.innerHTML = "";

    }

}


/* =========================================================
   14.11 EXPOSE FUNCTIONS
========================================================= */

window.funguaAdminStatistics =
    funguaAdminStatistics;

window.pakiaAdminStatistics =
    pakiaAdminStatistics;

window.pataAdminStatistics =
    pataAdminStatistics;

window.pataAdminBookingStatistics =
    pataAdminBookingStatistics;

window.pataAdminWithdrawalStatistics =
    pataAdminWithdrawalStatistics;

window.onyeshaAdminStatistics =
    onyeshaAdminStatistics;

window.refreshAdminStatistics =
    refreshAdminStatistics;

window.safishaAdminStatisticsData =
    safishaAdminStatisticsData;

window.ongezaAdminStatisticsButton =
    ongezaAdminStatisticsButton;


/* =========================================================
   14.12 SAFE ADMIN BUTTON SETUP
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        setTimeout(
            function () {

                if (!isAdmin) return;

                ongezaAdminStatisticsButton();

            },
            600
        );

    }
);

