ALTER TABLE "users" ALTER COLUMN "class" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_position_position_id_fk" FOREIGN KEY ("position") REFERENCES "public"."position"("id") ON DELETE no action ON UPDATE no action;