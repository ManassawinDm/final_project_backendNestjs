CREATE TYPE "public"."transfer_status" AS ENUM('Pending', 'Approved', 'Rejected');--> statement-breakpoint
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
	"type" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "office_positions" (
	"id" serial PRIMARY KEY NOT NULL,
	"office_id" integer NOT NULL,
	"class" integer NOT NULL,
	"quantity" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "refreshToken" (
	"id" serial PRIMARY KEY NOT NULL,
	"refreshToken" varchar(255),
	"user_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "report_result" (
	"id" serial PRIMARY KEY NOT NULL,
	"seniority_number" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"current_office" varchar(255) NOT NULL,
	"target_office" varchar(255) NOT NULL,
	"current_class" varchar(255) NOT NULL,
	"target_class" varchar(255) NOT NULL,
	"year_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transfer_periods" (
	"id" serial PRIMARY KEY NOT NULL,
	"round" integer NOT NULL,
	"year" integer NOT NULL,
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
CREATE TABLE "user_infomation" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"age" integer,
	"current_position_date" varchar(255) NOT NULL,
	"requested_class" integer,
	"home_province" varchar(255) NOT NULL,
	"relationship_status" varchar(255) NOT NULL,
	"house_number" varchar(255) NOT NULL,
	"village_number" varchar(255) NOT NULL,
	"alley" varchar(255),
	"soi" varchar(255),
	"province" varchar(255) NOT NULL,
	"district" varchar(255) NOT NULL,
	"subdistrict" varchar(255) NOT NULL,
	"postal_code" varchar(255) NOT NULL,
	"phone_number" varchar(255) NOT NULL,
	"address_type" varchar(255) NOT NULL,
	"spouse_name" varchar(255),
	"spouse_office" varchar(255),
	"spouse_house_number" varchar(255) NOT NULL,
	"spouse_village_number" varchar(255) NOT NULL,
	"spouse_alley" varchar(255),
	"spouse_soi" varchar(255),
	"spouse_province" varchar(255) NOT NULL,
	"spouse_district" varchar(255) NOT NULL,
	"spouse_subdistrict" varchar(255) NOT NULL,
	"spouse_postal_code" varchar(255) NOT NULL,
	"spouse_phone_number" varchar(255) NOT NULL,
	"work_history" varchar(255) NOT NULL,
	"work_history_date" varchar(255) NOT NULL,
	"work_history_two" varchar(255),
	"work_history_date_two" varchar(255),
	"work_history_three" varchar(255),
	"work_history_date_three" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"seniority_number" integer,
	"firstname" varchar(255) NOT NULL,
	"lastname" varchar(255) NOT NULL,
	"class" integer NOT NULL,
	"department_id" integer,
	"position_description" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users_reject" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"experience" varchar(100) NOT NULL,
	"latitude" numeric(10, 8) NOT NULL,
	"longitude" numeric(11, 8) NOT NULL,
	"ai_keyword" varchar(20) NOT NULL,
	"sick" varchar(100) NOT NULL,
	"spouse" varchar(100) NOT NULL,
	"score" integer,
	"requestId" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "auth_users" ADD CONSTRAINT "auth_users_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "office_positions" ADD CONSTRAINT "office_positions_office_id_main_offices_id_fk" FOREIGN KEY ("office_id") REFERENCES "public"."main_offices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "office_positions" ADD CONSTRAINT "office_positions_class_position_id_fk" FOREIGN KEY ("class") REFERENCES "public"."position"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refreshToken" ADD CONSTRAINT "refreshToken_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_result" ADD CONSTRAINT "report_result_year_id_transfer_periods_id_fk" FOREIGN KEY ("year_id") REFERENCES "public"."transfer_periods"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transfer_requests" ADD CONSTRAINT "transfer_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transfer_requests" ADD CONSTRAINT "transfer_requests_office_id_main_offices_id_fk" FOREIGN KEY ("office_id") REFERENCES "public"."main_offices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transfer_requests" ADD CONSTRAINT "transfer_requests_target_office_id_main_offices_id_fk" FOREIGN KEY ("target_office_id") REFERENCES "public"."main_offices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_infomation" ADD CONSTRAINT "user_infomation_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_class_position_id_fk" FOREIGN KEY ("class") REFERENCES "public"."position"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_department_id_main_offices_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."main_offices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users_reject" ADD CONSTRAINT "users_reject_requestId_transfer_requests_id_fk" FOREIGN KEY ("requestId") REFERENCES "public"."transfer_requests"("id") ON DELETE no action ON UPDATE no action;