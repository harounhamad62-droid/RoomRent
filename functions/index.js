/* =========================================================
   ROOMRENT - CLOUD FUNCTIONS
   SECTION 15
   ========================================================= */

const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

const db = admin.firestore();
const FieldValue = admin.firestore.FieldValue;

/* =========================================================
   1. CONFIGURATION
========================================================= */

const ADMIN_UID = "1kj3K591EHhHAOiSoxIp1xGve2x1";

const ROOMRENT_SETTINGS = {
    durationDays: 43,

    minimumWithdrawal: 3000,

    withdrawalFee: 0,

    userCommissions: {
        A: 0.05,
        B: 0.02,
        C: 0.01
    },

    adminCommissions: {
        A: 0.20,
        B: 0.10,
        C: 0.05
    }
};

/* =========================================================
   2. ROOM CONFIGURATION
========================================================= */

const ROOMS = {
    "0023": {
        roomNumber: "0023",
        name: "Room 0023",
        price: 30000,
        profitPerDay: 1000,
        durationDays: 43
    },

    "0024": {
        roomNumber: "0024",
        name: "Room 0024",
        price: 70000,
        profitPerDay: 2333.33,
        durationDays: 43
    },

    "0025": {
        roomNumber: "0025",
        name: "Room 0025",
        price: 140000,
        profitPerDay: 4666.67,
        durationDays: 43
    },

    "0026": {
        roomNumber: "0026",
        name: "Room 0026",
        price: 210000,
        profitPerDay: 7000,
        durationDays: 43
    },

    "0027": {
        roomNumber: "0027",
        name: "Room 0027",
        price: 280000,
        profitPerDay: 9333.33,
        durationDays: 43
    },

    "0028": {
        roomNumber: "0028",
        name: "Room 0028",
        price: 350000,
        profitPerDay: 11666.67,
        durationDays: 43
    },

    "0029": {
        roomNumber: "0029",
        name: "Room 0029",
        price: 420000,
        profitPerDay: 14000,
        durationDays: 43
    },

    "0030": {
        roomNumber: "0030",
        name: "Room 0030",
        price: 490000,
        profitPerDay: 16333.33,
        durationDays: 43
    },

    "0031": {
        roomNumber: "0031",
        name: "Room 0031",
        price: 560000,
        profitPerDay: 18666.67,
        durationDays: 43
    },

    "0032": {
        roomNumber: "0032",
        name: "Room 0032",
        price: 630000,
        profitPerDay: 21000,
        durationDays: 43
    }
};

/* =========================================================
   3. BASIC HELPERS
========================================================= */

function requireAuth(context) {
    if (!context.auth || !context.auth.uid) {
        throw new functions.https.HttpsError(
            "unauthenticated",
            "Lazima uwe umeingia kwenye akaunti."
        );
    }

    return context.auth.uid;
}

function requireAdmin(context) {
    const uid = requireAuth(context);

    if (uid !== ADMIN_UID) {
        throw new functions.https.HttpsError(
            "permission-denied",
            "Huna ruhusa ya Admin."
        );
    }

    return uid;
}

function getRoom(roomNumber) {
    const room = ROOMS[String(roomNumber)];

    if (!room) {
        throw new functions.https.HttpsError(
            "not-found",
            "Chumba hakijapatikana."
        );
    }

    return room;
}

function timestampNow() {
    return admin.firestore.Timestamp.now();
}

function money(value) {
    return Math.round(Number(value) * 100) / 100;
}

function getFullDaysSince(timestamp) {
    if (!timestamp) return 0;

    const start =
        timestamp.toDate
            ? timestamp.toDate()
            : new Date(timestamp);

    const now = new Date();

    const milliseconds = now.getTime() - start.getTime();

    if (milliseconds <= 0) return 0;

    return Math.floor(
        milliseconds / (24 * 60 * 60 * 1000)
    );
}

async function createUserNotification(
    uid,
    title,
    message,
    type = "system"
) {
    if (!uid) return;

    const ref = db
        .collection("users")
        .doc(uid)
        .collection("notifications")
        .doc();

    await ref.set({
        title,
        message,
        type,
        read: false,
        createdAt: FieldValue.serverTimestamp()
    });
}

/* =========================================================
   4. PROCESS USER PROFIT
   Full 24-hour periods only
========================================================= */

exports.processUserProfit = functions.https.onCall(
    async (data, context) => {

        const uid = requireAuth(context);

        const bookingsSnapshot = await db
            .collection("bookings")
            .where("uid", "==", uid)
            .where("adminConfirmed", "==", true)
            .get();

        if (bookingsSnapshot.empty) {
            return {
                success: true,
                processedBookings: 0,
                totalProfit: 0
            };
        }

        let totalProfit = 0;
        let processedBookings = 0;

        for (const bookingDoc of bookingsSnapshot.docs) {

            const bookingRef = bookingDoc.ref;
            const booking = bookingDoc.data();

            if (!booking.confirmedAt) {
                continue;
            }

            if (
                booking.status === "rejected" ||
                booking.status === "cancelled"
            ) {
                continue;
            }

            const room = getRoom(booking.roomNumber);

            const maximumDays = room.durationDays;

            const elapsedDays = Math.min(
                getFullDaysSince(booking.confirmedAt),
                maximumDays
            );

            const alreadyPaidDays =
                Number(booking.profitDaysPaid || 0);

            const unpaidDays =
                elapsedDays - alreadyPaidDays;

            if (unpaidDays <= 0) {
                continue;
            }

            const profitToPay = money(
                unpaidDays * room.profitPerDay
            );

            if (profitToPay <= 0) {
                continue;
            }

            await db.runTransaction(async transaction => {

                const freshBookingSnap =
                    await transaction.get(bookingRef);

                if (!freshBookingSnap.exists) {
                    return;
                }

                const freshBooking =
                    freshBookingSnap.data();

                const freshPaidDays =
                    Number(
                        freshBooking.profitDaysPaid || 0
                    );

                const freshElapsedDays = Math.min(
                    getFullDaysSince(
                        freshBooking.confirmedAt
                    ),
                    maximumDays
                );

                const freshUnpaidDays =
                    freshElapsedDays - freshPaidDays;

                if (freshUnpaidDays <= 0) {
                    return;
                }

                const freshProfit = money(
                    freshUnpaidDays *
                    room.profitPerDay
                );

                const walletRef = db
                    .collection("wallets")
                    .doc(uid);

                const walletSnap =
                    await transaction.get(walletRef);

                const currentWallet =
                    walletSnap.exists
                        ? walletSnap.data()
                        : {};

                const currentBalance =
                    Number(currentWallet.balance || 0);

                const newBalance =
                    money(
                        currentBalance +
                        freshProfit
                    );

                const newPaidDays =
                    freshPaidDays +
                    freshUnpaidDays;

                const previousProfit =
                    Number(
                        freshBooking.totalProfitPaid || 0
                    );

                const newTotalProfit =
                    money(
                        previousProfit +
                        freshProfit
                    );

                transaction.set(
                    walletRef,
                    {
                        uid,
                        balance: newBalance,
                        totalProfit: money(
                            Number(
                                currentWallet.totalProfit || 0
                            ) + freshProfit
                        ),
                        pendingWithdrawal:
                            Number(
                                currentWallet.pendingWithdrawal || 0
                            ),
                        totalWithdrawn:
                            Number(
                                currentWallet.totalWithdrawn || 0
                            ),
                        updatedAt:
                            FieldValue.serverTimestamp()
                    },
                    { merge: true }
                );

                transaction.update(
                    bookingRef,
                    {
                        profitDaysPaid: newPaidDays,

                        totalProfitPaid:
                            newTotalProfit,

                        lastProfitProcessedAt:
                            FieldValue.serverTimestamp(),

                        status:
                            newPaidDays >= maximumDays
                                ? "completed"
                                : "active",

                        completedAt:
                            newPaidDays >= maximumDays
                                ? FieldValue.serverTimestamp()
                                : null,

                        updatedAt:
                            FieldValue.serverTimestamp()
                    }
                );

                const dailyProfitRef =
                    db.collection("dailyProfits").doc();

                transaction.set(
                    dailyProfitRef,
                    {
                        uid,

                        bookingNumber:
                            freshBooking.bookingNumber,

                        roomNumber:
                            freshBooking.roomNumber,

                        days:
                            freshUnpaidDays,

                        amount:
                            freshProfit,

                        createdAt:
                            FieldValue.serverTimestamp()
                    }
                );
            });

            totalProfit += profitToPay;
            processedBookings++;
        }

        if (totalProfit > 0) {
            await createUserNotification(
                uid,
                "Faida imeongezwa",
                `Faida ya TSh ${totalProfit.toLocaleString()} imeongezwa kwenye wallet yako.`,
                "profit"
            );
        }

        return {
            success: true,
            processedBookings,
            totalProfit: money(totalProfit)
        };
    }
);

/* =========================================================
   5. CONFIRM BOOKING
========================================================= */

exports.confirmBooking = functions.https.onCall(
    async (data, context) => {

        requireAdmin(context);

        const bookingNumber =
            String(data.bookingNumber || "").trim();

        if (!bookingNumber) {
            throw new functions.https.HttpsError(
                "invalid-argument",
                "Booking number haijatumwa."
            );
        }

        const bookingRef =
            db.collection("bookings")
                .doc(bookingNumber);

        const bookingSnap =
            await bookingRef.get();

        if (!bookingSnap.exists) {
            throw new functions.https.HttpsError(
                "not-found",
                "Booking haijapatikana."
            );
        }

        const booking = bookingSnap.data();

        if (
            booking.adminConfirmed === true
        ) {
            return {
                success: true,
                message: "Booking tayari imethibitishwa."
            };
        }

        const room =
            getRoom(booking.roomNumber);

        const uid = booking.uid;

        const userRef =
            db.collection("users").doc(uid);

        const userSnap =
            await userRef.get();

        if (!userSnap.exists) {
            throw new functions.https.HttpsError(
                "not-found",
                "Mtumiaji hajapatikana."
            );
        }

        const user = userSnap.data();

        await db.runTransaction(async transaction => {

            const freshBookingSnap =
                await transaction.get(bookingRef);

            if (!freshBookingSnap.exists) {
                throw new functions.https.HttpsError(
                    "not-found",
                    "Booking haijapatikana."
                );
            }

            const freshBooking =
                freshBookingSnap.data();

            if (
                freshBooking.adminConfirmed === true
            ) {
                return;
            }

            transaction.update(
                bookingRef,
                {
                    price: room.price,
                    amount: room.price,

                    profitPerDay:
                        room.profitPerDay,

                    durationDays:
                        room.durationDays,

                    days:
                        room.durationDays,

                    totalProfit:
                        money(
                            room.profitPerDay *
                            room.durationDays
                        ),

                    totalPayout:
                        money(
                            room.price +
                            (
                                room.profitPerDay *
                                room.durationDays
                            )
                        ),

                    status: "active",

                    paymentStatus:
                        "confirmed",

                    adminConfirmed:
                        true,

                    confirmedAt:
                        FieldValue.serverTimestamp(),

                    profitDaysPaid: 0,

                    totalProfitPaid: 0,

                    commissionProcessed: false,

                    updatedAt:
                        FieldValue.serverTimestamp()
                }
            );
        });

        /* =================================================
           REFERRAL COMMISSION
        ================================================= */

        await processReferralCommission(
            uid,
            room.price,
            bookingNumber
        );

        await db.runTransaction(async transaction => {

            const freshBookingSnap =
                await transaction.get(bookingRef);

            if (!freshBookingSnap.exists) {
                return;
            }

            transaction.update(
                bookingRef,
                {
                    commissionProcessed: true,
                    updatedAt:
                        FieldValue.serverTimestamp()
                }
            );
        });

        await createUserNotification(
            uid,
            "Booking imethibitishwa",
            `Booking ${bookingNumber} imethibitishwa. Faida itaanza kuhesabiwa kwa kila saa 24 kamili.`,
            "booking"
        );

        return {
            success: true,
            message: "Booking imethibitishwa."
        };
    }
);

/* =========================================================
   6. REFERRAL COMMISSION
========================================================= */

async function processReferralCommission(
    customerUid,
    bookingAmount,
    bookingNumber
) {

    const customerRef =
        db.collection("users")
            .doc(customerUid);

    const customerSnap =
        await customerRef.get();

    if (!customerSnap.exists) {
        return;
    }

    const customer =
        customerSnap.data();

    let parentUid =
        customer.referredByUid || null;

    const levels = ["A", "B", "C"];

    for (const level of levels) {

        if (!parentUid) {
            break;
        }

        const parentRef =
            db.collection("users")
                .doc(parentUid);

        const parentSnap =
            await parentRef.get();

        if (!parentSnap.exists) {
            break;
        }

        const parent =
            parentSnap.data();

        const percentage =
            ROOMRENT_SETTINGS
                .userCommissions[level];

        const commission =
            money(
                Number(bookingAmount) *
                percentage
            );

        if (commission > 0) {

            const walletRef =
                db.collection("wallets")
                    .doc(parentUid);

            await db.runTransaction(
                async transaction => {

                    const walletSnap =
                        await transaction.get(
                            walletRef
                        );

                    const wallet =
                        walletSnap.exists
                            ? walletSnap.data()
                            : {};

                    const balance =
                        Number(
                            wallet.balance || 0
                        );

                    const totalCommission =
                        Number(
                            wallet.totalCommission || 0
                        );

                    transaction.set(
                        walletRef,
                        {
                            uid: parentUid,

                            balance:
                                money(
                                    balance +
                                    commission
                                ),

                            totalCommission:
                                money(
                                    totalCommission +
                                    commission
                                ),

                            pendingWithdrawal:
                                Number(
                                    wallet.pendingWithdrawal || 0
                                ),

                            totalWithdrawn:
                                Number(
                                    wallet.totalWithdrawn || 0
                                ),

                            updatedAt:
                                FieldValue.serverTimestamp()
                        },
                        { merge: true }
                    );

                    const commissionRef =
                        db.collection(
                            "commissions"
                        ).doc();

                    transaction.set(
                        commissionRef,
                        {
                            uid: parentUid,

                            fromUid:
                                customerUid,

                            level,

                            amount:
                                commission,

                            bookingNumber,

                            createdAt:
                                FieldValue.serverTimestamp()
                        }
                    );
                }
            );

            await createUserNotification(
                parentUid,
                "Commission imeongezeka",
                `Commission ya level ${level} ya TSh ${commission.toLocaleString()} imeongezwa kwenye wallet yako.`,
                "commission"
            );
        }

        parentUid =
            parent.referredByUid || null;
    }
}

/* =========================================================
   7. REJECT BOOKING
========================================================= */

exports.rejectBooking = functions.https.onCall(
    async (data, context) => {

        requireAdmin(context);

        const bookingNumber =
            String(data.bookingNumber || "").trim();

        const reason =
            String(data.reason || "Booking imekataliwa.")
                .trim();

        if (!bookingNumber) {
            throw new functions.https.HttpsError(
                "invalid-argument",
                "Booking number haijatumwa."
            );
        }

        const bookingRef =
            db.collection("bookings")
                .doc(bookingNumber);

        const bookingSnap =
            await bookingRef.get();

        if (!bookingSnap.exists) {
            throw new functions.https.HttpsError(
                "not-found",
                "Booking haijapatikana."
            );
        }

        const booking =
            bookingSnap.data();

        if (booking.adminConfirmed === true) {
            throw new functions.https.HttpsError(
                "failed-precondition",
                "Booking hii tayari imethibitishwa."
            );
        }

        await bookingRef.update({
            status: "rejected",

            paymentStatus:
                "rejected",

            adminConfirmed:
                false,

            rejectionReason:
                reason,

            rejectedAt:
                FieldValue.serverTimestamp(),

            updatedAt:
                FieldValue.serverTimestamp()
        });

        await createUserNotification(
            booking.uid,
            "Booking imekataliwa",
            `Booking ${bookingNumber} imekataliwa. Sababu: ${reason}`,
            "booking"
        );

        return {
            success: true,
            message: "Booking imekataliwa."
        };
    }
);

/* =========================================================
   8. REQUEST WITHDRAWAL
========================================================= */

exports.requestWithdrawal = functions.https.onCall(
    async (data, context) => {

        const uid = requireAuth(context);

        const amount =
            money(Number(data.amount || 0));

        const method =
            String(data.method || "").trim();

        const phone =
            String(data.phone || "").trim();

        if (!amount || amount <= 0) {
            throw new functions.https.HttpsError(
                "invalid-argument",
                "Kiasi cha withdrawal si sahihi."
            );
        }

        if (
            amount <
            ROOMRENT_SETTINGS.minimumWithdrawal
        ) {
            throw new functions.https.HttpsError(
                "failed-precondition",
                `Kiasi cha chini ni TSh ${ROOMRENT_SETTINGS.minimumWithdrawal}.`
            );
        }

        if (!method || !phone) {
            throw new functions.https.HttpsError(
                "invalid-argument",
                "Njia ya malipo na namba ya simu vinahitajika."
            );
        }

        const walletRef =
            db.collection("wallets").doc(uid);

        const withdrawalRef =
            db.collection("withdrawals").doc();

        await db.runTransaction(
            async transaction => {

                const walletSnap =
                    await transaction.get(walletRef);

                if (!walletSnap.exists) {
                    throw new functions.https.HttpsError(
                        "failed-precondition",
                        "Wallet haijapatikana."
                    );
                }

                const wallet =
                    walletSnap.data();

                const balance =
                    Number(wallet.balance || 0);

                if (balance < amount) {
                    throw new functions.https.HttpsError(
                        "failed-precondition",
                        "Salio halitoshi."
                    );
                }

                const pending =
                    Number(
                        wallet.pendingWithdrawal || 0
                    );

                transaction.update(
                    walletRef,
                    {
                        balance:
                            money(
                                balance - amount
                            ),

                        pendingWithdrawal:
                            money(
                                pending + amount
                            ),

                        updatedAt:
                            FieldValue.serverTimestamp()
                    }
                );

                transaction.set(
                    withdrawalRef,
                    {
                        uid,

                        amount,

                        fee: 0,

                        netAmount: amount,

                        method,

                        phone,

                        status: "pending",

                        createdAt:
                            FieldValue.serverTimestamp(),

                        updatedAt:
                            FieldValue.serverTimestamp()
                    }
                );
            }
        );

        await createUserNotification(
            uid,
            "Withdrawal imepokelewa",
            `Ombi lako la withdrawal la TSh ${amount.toLocaleString()} limepokelewa.`,
            "withdrawal"
        );

        return {
            success: true,
            withdrawalId:
                withdrawalRef.id,

            amount
        };
    }
);

/* =========================================================
   9. APPROVE WITHDRAWAL
========================================================= */

exports.approveWithdrawal =
    functions.https.onCall(
        async (data, context) => {

            requireAdmin(context);

            const withdrawalId =
                String(
                    data.withdrawalId || ""
                ).trim();

            if (!withdrawalId) {
                throw new functions.https.HttpsError(
                    "invalid-argument",
                    "Withdrawal ID haijatumwa."
                );
            }

            const withdrawalRef =
                db.collection("withdrawals")
                    .doc(withdrawalId);

            const withdrawalSnap =
                await withdrawalRef.get();

            if (!withdrawalSnap.exists) {
                throw new functions.https.HttpsError(
                    "not-found",
                    "Withdrawal haijapatikana."
                );
            }

            const withdrawal =
                withdrawalSnap.data();

            if (
                withdrawal.status !==
                "pending"
            ) {
                throw new functions.https.HttpsError(
                    "failed-precondition",
                    "Withdrawal hii tayari imefanyiwa kazi."
                );
            }

            const uid =
                withdrawal.uid;

            const amount =
                Number(
                    withdrawal.amount || 0
                );

            const walletRef =
                db.collection("wallets")
                    .doc(uid);

            await db.runTransaction(
                async transaction => {

                    const walletSnap =
                        await transaction.get(
                            walletRef
                        );

                    const wallet =
                        walletSnap.exists
                            ? walletSnap.data()
                            : {};

                    const pending =
                        Number(
                            wallet.pendingWithdrawal || 0
                        );

                    const totalWithdrawn =
                        Number(
                            wallet.totalWithdrawn || 0
                        );

                    transaction.update(
                        withdrawalRef,
                        {
                            status: "approved",

                            approvedAt:
                                FieldValue.serverTimestamp(),

                            updatedAt:
                                FieldValue.serverTimestamp()
                        }
                    );

                    transaction.set(
                        walletRef,
                        {
                            pendingWithdrawal:
                                Math.max(
                                    0,
                                    money(
                                        pending -
                                        amount
                                    )
                                ),

                            totalWithdrawn:
                                money(
                                    totalWithdrawn +
                                    amount
                                ),

                            updatedAt:
                                FieldValue.serverTimestamp()
                        },
                        { merge: true }
                    );
                }
            );

            await createUserNotification(
                uid,
                "Withdrawal imeidhinishwa",
                `Withdrawal yako ya TSh ${amount.toLocaleString()} imeidhinishwa.`,
                "withdrawal"
            );

            return {
                success: true
            };
        }
    );

/* =========================================================
   10. REJECT WITHDRAWAL
========================================================= */

exports.rejectWithdrawal =
    functions.https.onCall(
        async (data, context) => {

            requireAdmin(context);

            const withdrawalId =
                String(
                    data.withdrawalId || ""
                ).trim();

            const reason =
                String(
                    data.reason ||
                    "Withdrawal imekataliwa."
                ).trim();

            if (!withdrawalId) {
                throw new functions.https.HttpsError(
                    "invalid-argument",
                    "Withdrawal ID haijatumwa."
                );
            }

            const withdrawalRef =
                db.collection("withdrawals")
                    .doc(withdrawalId);

            const withdrawalSnap =
                await withdrawalRef.get();

            if (!withdrawalSnap.exists) {
                throw new functions.https.HttpsError(
                    "not-found",
                    "Withdrawal haijapatikana."
                );
            }

            const withdrawal =
                withdrawalSnap.data();

            if (
                withdrawal.status !==
                "pending"
            ) {
                throw new functions.https.HttpsError(
                    "failed-precondition",
                    "Withdrawal hii tayari imefanyiwa kazi."
                );
            }

            const uid =
                withdrawal.uid;

            const amount =
                Number(
                    withdrawal.amount || 0
                );

            const walletRef =
                db.collection("wallets")
                    .doc(uid);

            await db.runTransaction(
                async transaction => {

                    const walletSnap =
                        await transaction.get(
                            walletRef
                        );

                    const wallet =
                        walletSnap.exists
                            ? walletSnap.data()
                            : {};

                    const balance =
                        Number(
                            wallet.balance || 0
                        );

                    const pending =
                        Number(
                            wallet.pendingWithdrawal || 0
                        );

                    transaction.update(
                        withdrawalRef,
                        {
                            status: "rejected",

                            rejectionReason:
                                reason,

                            rejectedAt:
                                FieldValue.serverTimestamp(),

                            updatedAt:
                                FieldValue.serverTimestamp()
                        }
                    );

                    transaction.set(
                        walletRef,
                        {
                            balance:
                                money(
                                    balance +
                                    amount
                                ),

                            pendingWithdrawal:
                                Math.max(
                                    0,
                                    money(
                                        pending -
                                        amount
                                    )
                                ),

                            updatedAt:
                                FieldValue.serverTimestamp()
                        },
                        { merge: true }
                    );
                }
            );

            await createUserNotification(
                uid,
                "Withdrawal imekataliwa",
                `Withdrawal yako ya TSh ${amount.toLocaleString()} imekataliwa. Sababu: ${reason}`,
                "withdrawal"
            );

            return {
                success: true
            };
        }
    );

/* =========================================================
   11. EXPORT TEST FUNCTION
========================================================= */

exports.roomRentTest =
    functions.https.onCall(
        async (data, context) => {

            requireAuth(context);

            return {
                success: true,
                message:
                    "RoomRent Cloud Functions zinafanya kazi."
            };
        }
    );
