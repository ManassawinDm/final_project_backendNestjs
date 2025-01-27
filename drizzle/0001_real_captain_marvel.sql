ALTER TABLE "transfer_requests" DROP CONSTRAINT "transfer_requests_period_id_transfer_periods_id_fk";
--> statement-breakpoint
ALTER TABLE "transfer_requests" DROP COLUMN "period_id";