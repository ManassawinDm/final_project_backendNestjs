CREATE TYPE "public"."transfer_status" AS ENUM('Pending', 'Approved', 'Rejected');--> statement-breakpoint
CREATE TABLE "ai_recommendations" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"office_id" integer NOT NULL,
	"predicted_reason" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "auth_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"role" varchar(50) NOT NULL,
	"user_id" integer
);
--> statement-breakpoint
CREATE TABLE "position" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "main_offices" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"short_name" varchar(255) NOT NULL,
	"address" varchar(255) NOT NULL,
	"latitude" numeric(10, 8) NOT NULL,
	"longitude" numeric(11, 8) NOT NULL,
	"province" varchar(255) NOT NULL,
	"area" varchar(255) NOT NULL,
	"type" varchar(10) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "office_positions" (
	"id" serial PRIMARY KEY NOT NULL,
	"office_id" integer NOT NULL,
	"class" integer NOT NULL,
	"quantity" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "refreshToken" (
	"id" serial PRIMARY KEY NOT NULL,
	"refreshToken" varchar(255),
	"user_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transfer_periods" (
	"id" serial PRIMARY KEY NOT NULL,
	"round" integer NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"status" varchar(50) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transfer_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"office_id" integer NOT NULL,
	"target_office_id" integer,
	"class_id" integer NOT NULL,
	"status" "transfer_status" DEFAULT 'Pending' NOT NULL,
	"reason" text
);
--> statement-breakpoint
CREATE TABLE "transfer_results" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"office_id" integer,
	"status" "transfer_status" DEFAULT 'Pending' NOT NULL,
	"class" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"firstname" varchar(255),
	"lastname" varchar(255),
	"class" integer NOT NULL,
	"department_id" integer,
	"position_description" varchar(255)
);
--> statement-breakpoint
ALTER TABLE "ai_recommendations" ADD CONSTRAINT "ai_recommendations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth_users" ADD CONSTRAINT "auth_users_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "office_positions" ADD CONSTRAINT "office_positions_office_id_main_offices_id_fk" FOREIGN KEY ("office_id") REFERENCES "public"."main_offices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "office_positions" ADD CONSTRAINT "office_positions_class_position_id_fk" FOREIGN KEY ("class") REFERENCES "public"."position"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refreshToken" ADD CONSTRAINT "refreshToken_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transfer_requests" ADD CONSTRAINT "transfer_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transfer_requests" ADD CONSTRAINT "transfer_requests_office_id_main_offices_id_fk" FOREIGN KEY ("office_id") REFERENCES "public"."main_offices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transfer_requests" ADD CONSTRAINT "transfer_requests_target_office_id_main_offices_id_fk" FOREIGN KEY ("target_office_id") REFERENCES "public"."main_offices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transfer_requests" ADD CONSTRAINT "transfer_requests_class_id_users_class_fk" FOREIGN KEY ("class_id") REFERENCES "public"."users"("class") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transfer_results" ADD CONSTRAINT "transfer_results_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transfer_results" ADD CONSTRAINT "transfer_results_class_position_id_fk" FOREIGN KEY ("class") REFERENCES "public"."position"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_class_position_id_fk" FOREIGN KEY ("class") REFERENCES "public"."position"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_department_id_main_offices_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."main_offices"("id") ON DELETE no action ON UPDATE no action;