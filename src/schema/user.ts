import {
  pgTable, serial, varchar, text, timestamp, boolean, json
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  userKey: serial('userKey').primaryKey(),
  googleUserId: varchar('googleUserId', { length: 255 }),
  username: varchar('username', { length: 50 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: text('password').notNull(),

  profilePicture: text('profile_picture'),
  dob: timestamp('dob'),
  gender: varchar('gender', { length: 20 }),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at'),
  lastLogin: timestamp('last_login'),
  lastActiveAt: timestamp('last_active_at'),
  isOnline: boolean('is_online').default(false),

  isDeleted: boolean('is_deleted').default(false),
  role: varchar('role', { length: 20 }).default('user'), // user, admin, mod

  isPremium: boolean('is_premium').default(false),
  subscriptionType: varchar('subscription_type', { length: 20 }),
  subscriptionStart: timestamp('subscription_start'),
  subscriptionEnd: timestamp('subscription_end'),
  paymentMethod: text('payment_method'),

  bio: text('bio'),
  location: varchar('location', { length: 100 }),
  platform: varchar('platform', { length: 20 }), // ios, android, web

  emailVerified: boolean('email_verified').default(false),
  phoneNumber: varchar('phone_number', { length: 15 }),
  otpSecret: text('otp_secret'),
  loginProvider: varchar('login_provider', { length: 20 }),

  favoriteGame: json('favorite_game'),
  favoritePlayer: json('favorite_player'),
  likedplayer: json('liked_player'),
  dislikedplayer: json('disliked_player'),
  recentlyPlayed: json('recently_played'),
  
  library: json('library'),
  socialLinks: json('social_links'),
  followers: json('followers'),
  following: json('following'),
});
