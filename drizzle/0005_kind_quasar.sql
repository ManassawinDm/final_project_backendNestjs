CREATE TABLE "users_reject" (
	"id" serial PRIMARY KEY NOT NULL,
	"experience" varchar(100) NOT NULL,
	"distance" varchar(20) NOT NULL,
	"sick" integer NOT NULL,
	"spouse" integer NOT NULL,
	"score" integer,
	"requestId" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_position_position_id_fk";
--> statement-breakpoint
ALTER TABLE "users_reject" ADD CONSTRAINT "users_reject_requestId_transfer_requests_id_fk" FOREIGN KEY ("requestId") REFERENCES "public"."transfer_requests"("id") ON DELETE no action ON UPDATE no action;