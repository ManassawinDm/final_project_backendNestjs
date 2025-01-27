CREATE TABLE "transfer_results" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"office_id" integer,
	"status" "transfer_status" DEFAULT 'Pending' NOT NULL,
	"class" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "transfer_results" ADD CONSTRAINT "transfer_results_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transfer_results" ADD CONSTRAINT "transfer_results_class_position_id_fk" FOREIGN KEY ("class") REFERENCES "public"."position"("id") ON DELETE no action ON UPDATE no action;