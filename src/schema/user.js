"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.users = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.users = (0, pg_core_1.pgTable)('users', {
    userKey: (0, pg_core_1.serial)('userKey').primaryKey(),
    googleUserId: (0, pg_core_1.varchar)('googleUserId', { length: 255 }),
    username: (0, pg_core_1.varchar)('username', { length: 50 }).notNull(),
    email: (0, pg_core_1.varchar)('email', { length: 255 }).notNull().unique(),
    password: (0, pg_core_1.text)('password').notNull(),
    profilePicture: (0, pg_core_1.text)('profile_picture'),
    dob: (0, pg_core_1.timestamp)('dob'),
    gender: (0, pg_core_1.varchar)('gender', { length: 20 }),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at'),
    lastLogin: (0, pg_core_1.timestamp)('last_login'),
    lastActiveAt: (0, pg_core_1.timestamp)('last_active_at'),
    isOnline: (0, pg_core_1.boolean)('is_online').default(false),
    isDeleted: (0, pg_core_1.boolean)('is_deleted').default(false),
    role: (0, pg_core_1.varchar)('role', { length: 20 }).default('user'), // user, admin, mod
    isPremium: (0, pg_core_1.boolean)('is_premium').default(false),
    subscriptionType: (0, pg_core_1.varchar)('subscription_type', { length: 20 }),
    subscriptionStart: (0, pg_core_1.timestamp)('subscription_start'),
    subscriptionEnd: (0, pg_core_1.timestamp)('subscription_end'),
    paymentMethod: (0, pg_core_1.text)('payment_method'),
    bio: (0, pg_core_1.text)('bio'),
    location: (0, pg_core_1.varchar)('location', { length: 100 }),
    platform: (0, pg_core_1.varchar)('platform', { length: 20 }), // ios, android, web
    emailVerified: (0, pg_core_1.boolean)('email_verified').default(false),
    phoneNumber: (0, pg_core_1.varchar)('phone_number', { length: 15 }),
    otpSecret: (0, pg_core_1.text)('otp_secret'),
    loginProvider: (0, pg_core_1.varchar)('login_provider', { length: 20 }),
    favoriteGame: (0, pg_core_1.json)('favorite_game'),
    favoritePlayer: (0, pg_core_1.json)('favorite_player'),
    likedplayer: (0, pg_core_1.json)('liked_player'),
    dislikedplayer: (0, pg_core_1.json)('disliked_player'),
    recentlyPlayed: (0, pg_core_1.json)('recently_played'),
    library: (0, pg_core_1.json)('library'),
    socialLinks: (0, pg_core_1.json)('social_links'),
    followers: (0, pg_core_1.json)('followers'),
    following: (0, pg_core_1.json)('following'),
});
