CREATE TABLE `accounts` (
	`user_id` text NOT NULL,
	`type` text NOT NULL,
	`provider` text NOT NULL,
	`provider_account_id` text NOT NULL,
	`refresh_token` text,
	`access_token` text,
	`expires_at` integer,
	`token_type` text,
	`scope` text,
	`id_token` text,
	`session_state` text,
	PRIMARY KEY(`provider`, `provider_account_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `historical_data` (
	`id` text PRIMARY KEY NOT NULL,
	`symbol` text NOT NULL,
	`timeframe` text NOT NULL,
	`timestamp` integer NOT NULL,
	`open` real NOT NULL,
	`high` real NOT NULL,
	`low` real NOT NULL,
	`close` real NOT NULL,
	`volume` real NOT NULL
);
--> statement-breakpoint
CREATE TABLE `lesson_progress` (
	`user_id` text NOT NULL,
	`lesson_id` text NOT NULL,
	`completed` integer DEFAULT false NOT NULL,
	`score` integer,
	`last_accessed` integer DEFAULT (unixepoch()) NOT NULL,
	PRIMARY KEY(`user_id`, `lesson_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`lesson_id`) REFERENCES `lessons`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `lessons` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`content` text NOT NULL,
	`category` text NOT NULL,
	`order` integer NOT NULL,
	`difficulty` integer DEFAULT 1 NOT NULL,
	`image_url` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `lessons_slug_unique` ON `lessons` (`slug`);--> statement-breakpoint
CREATE TABLE `orders` (
	`id` text PRIMARY KEY NOT NULL,
	`portfolio_id` text NOT NULL,
	`symbol` text NOT NULL,
	`type` text NOT NULL,
	`side` text NOT NULL,
	`quantity` real NOT NULL,
	`entry_price` real,
	`exit_price` real,
	`limit_price` real,
	`stop_price` real,
	`trailing_stop_distance` real,
	`status` text NOT NULL,
	`realized_pnl` real,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`closed_at` integer,
	FOREIGN KEY (`portfolio_id`) REFERENCES `portfolios`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `pattern_mastery` (
	`user_id` text NOT NULL,
	`pattern_name` text NOT NULL,
	`correct_count` integer DEFAULT 0 NOT NULL,
	`incorrect_count` integer DEFAULT 0 NOT NULL,
	`accuracy` real DEFAULT 0 NOT NULL,
	`weight` real DEFAULT 1 NOT NULL,
	`last_seen` integer DEFAULT (unixepoch()) NOT NULL,
	PRIMARY KEY(`user_id`, `pattern_name`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `portfolios` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text DEFAULT 'Default Portfolio' NOT NULL,
	`starting_balance` real DEFAULT 10000 NOT NULL,
	`current_balance` real NOT NULL,
	`equity` real NOT NULL,
	`leverage` real DEFAULT 1 NOT NULL,
	`max_position_size` real DEFAULT 0.1 NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `session_results` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`score` integer NOT NULL,
	`accuracy` real NOT NULL,
	`patterns_tested_count` integer NOT NULL,
	`duration` integer NOT NULL,
	`max_streak` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`session_token` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`email_verified` integer,
	`password_hash` text,
	`name` text,
	`image` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `verification_tokens` (
	`identifier` text NOT NULL,
	`token` text NOT NULL,
	`expires` integer NOT NULL,
	PRIMARY KEY(`identifier`, `token`)
);
