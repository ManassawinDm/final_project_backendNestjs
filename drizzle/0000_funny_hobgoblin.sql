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
	"description" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "competitors" (
	"id" serial PRIMARY KEY NOT NULL,
	"office_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"class_id" integer NOT NULL,
	"score" numeric(10, 2) NOT NULL,
	"winner" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
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
	"firstname" varchar(255) NOT NULL,
	"lastname" varchar(255) NOT NULL,
	"class" varchar(255) NOT NULL,
	"current_office" varchar(255) NOT NULL,
	"target_office" varchar(255) NOT NULL,
	"current_class" varchar(255) NOT NULL,
	"target_class" varchar(255) NOT NULL,
	"year_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transfer_periods" (
	"id" serial PRIMARY KEY NOT NULL,
	"round" integer NOT NULL,
	"year" integer NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"status" varchar(50) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transfer_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"office_id" integer NOT NULL,
	"target_office_id" integer,
	"class_id" integer NOT NULL,
	"reason" text,
	"sick" varchar(100),
	"spouse" varchar(100),
	"status" "transfer_status" DEFAULT 'Pending' NOT NULL,
	"transferPeriods" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
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
	"work_history_startDate" date NOT NULL,
	"work_history_endDate" date NOT NULL,
	"work_history_position" varchar(255) NOT NULL,
	"work_history_two" varchar(255),
	"work_history_startDate_two" date,
	"work_history_endDate_two" date NOT NULL,
	"work_history_position_two" varchar(255),
	"work_history_three" varchar(255),
	"work_history_startDate_three" date,
	"work_history_endDate_three" date NOT NULL,
	"work_history_position_three" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"seniority_number" integer NOT NULL,
	"firstname" varchar(255) NOT NULL,
	"lastname" varchar(255) NOT NULL,
	"class" integer NOT NULL,
	"department_id" integer,
	"position_description" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users_reject" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"class" integer NOT NULL,
	"experience" integer NOT NULL,
	"latitude" numeric(10, 8) NOT NULL,
	"longitude" numeric(11, 8) NOT NULL,
	"ai_keyword" text NOT NULL,
	"civil" varchar(100) NOT NULL,
	"criminal" varchar(100) NOT NULL,
	"administrative" varchar(100) NOT NULL,
	"narcotics" varchar(100) NOT NULL,
	"general" varchar(100) NOT NULL,
	"sick" varchar(100) NOT NULL,
	"spouse" varchar(100) NOT NULL,
	"score" integer,
	"request_id" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "auth_users" ADD CONSTRAINT "auth_users_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competitors" ADD CONSTRAINT "competitors_office_id_main_offices_id_fk" FOREIGN KEY ("office_id") REFERENCES "public"."main_offices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competitors" ADD CONSTRAINT "competitors_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competitors" ADD CONSTRAINT "competitors_class_id_position_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."position"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "office_positions" ADD CONSTRAINT "office_positions_office_id_main_offices_id_fk" FOREIGN KEY ("office_id") REFERENCES "public"."main_offices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "office_positions" ADD CONSTRAINT "office_positions_class_position_id_fk" FOREIGN KEY ("class") REFERENCES "public"."position"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refreshToken" ADD CONSTRAINT "refreshToken_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_result" ADD CONSTRAINT "report_result_year_id_transfer_periods_id_fk" FOREIGN KEY ("year_id") REFERENCES "public"."transfer_periods"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transfer_requests" ADD CONSTRAINT "transfer_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transfer_requests" ADD CONSTRAINT "transfer_requests_office_id_main_offices_id_fk" FOREIGN KEY ("office_id") REFERENCES "public"."main_offices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transfer_requests" ADD CONSTRAINT "transfer_requests_target_office_id_main_offices_id_fk" FOREIGN KEY ("target_office_id") REFERENCES "public"."main_offices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transfer_requests" ADD CONSTRAINT "transfer_requests_transferPeriods_transfer_periods_id_fk" FOREIGN KEY ("transferPeriods") REFERENCES "public"."transfer_periods"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_infomation" ADD CONSTRAINT "user_infomation_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_class_position_id_fk" FOREIGN KEY ("class") REFERENCES "public"."position"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_department_id_main_offices_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."main_offices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users_reject" ADD CONSTRAINT "users_reject_request_id_transfer_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."transfer_requests"("id") ON DELETE no action ON UPDATE no action;