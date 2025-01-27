DROP TABLE "transfer_results" CASCADE;--> statement-breakpoint
ALTER TABLE "transfer_requests" ADD COLUMN "status" "transfer_status" DEFAULT 'Pending' NOT NULL;