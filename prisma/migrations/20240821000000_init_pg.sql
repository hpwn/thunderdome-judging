-- CreateEnum
CREATE TYPE "JudgeCategory" AS ENUM ('TECHNICALITY', 'AESTHETICS', 'COMPOSITION');

-- CreateEnum
CREATE TYPE "HeatStatus" AS ENUM ('SCHEDULED', 'LIVE', 'LOCKED');

-- CreateEnum
CREATE TYPE "RunStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'VOID');

-- CreateEnum
CREATE TYPE "ScoreCategory" AS ENUM ('TECHNICALITY', 'AESTHETICS', 'COMPOSITION');

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "start_date" TIMESTAMP(3),
    "venue" TEXT,
    "config_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "divisions" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "divisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "heats" (
    "id" TEXT NOT NULL,
    "division_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "status" "HeatStatus" NOT NULL DEFAULT 'SCHEDULED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "heats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skaters" (
    "id" TEXT NOT NULL,
    "division_id" TEXT NOT NULL,
    "bib" TEXT,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "sponsor" TEXT,
    "notes" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "skaters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "judges" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "JudgeCategory" NOT NULL,
    "pin_hash" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "judges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "runs" (
    "id" TEXT NOT NULL,
    "heat_id" TEXT NOT NULL,
    "skater_id" TEXT NOT NULL,
    "run_number" INTEGER NOT NULL,
    "status" "RunStatus" NOT NULL DEFAULT 'SCHEDULED',
    "started_at" TIMESTAMP(3),
    "ended_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scores" (
    "id" TEXT NOT NULL,
    "run_id" TEXT NOT NULL,
    "judge_id" TEXT NOT NULL,
    "category" "ScoreCategory" NOT NULL,
    "value" DECIMAL(8,2) NOT NULL,
    "client_uuid" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "placements" (
    "id" TEXT NOT NULL,
    "division_id" TEXT NOT NULL,
    "skater_id" TEXT NOT NULL,
    "best_run_id" TEXT,
    "total" DECIMAL(8,2) NOT NULL,
    "rank" INTEGER NOT NULL,
    "tiebreak_json" JSONB,
    "computed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "placements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "event_id" TEXT,
    "actor" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "data_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "divisions_event_id_order_idx" ON "divisions"("event_id", "order");

-- CreateIndex
CREATE INDEX "heats_division_id_order_idx" ON "heats"("division_id", "order");

-- CreateIndex
CREATE INDEX "skaters_division_id_order_idx" ON "skaters"("division_id", "order");

-- CreateIndex
CREATE INDEX "judges_event_id_category_idx" ON "judges"("event_id", "category");

-- CreateIndex
CREATE INDEX "runs_skater_id_idx" ON "runs"("skater_id");

-- CreateIndex
CREATE UNIQUE INDEX "runs_heat_id_skater_id_run_number_key" ON "runs"("heat_id", "skater_id", "run_number");

-- CreateIndex
CREATE INDEX "scores_judge_id_idx" ON "scores"("judge_id");

-- CreateIndex
CREATE INDEX "scores_run_id_idx" ON "scores"("run_id");

-- CreateIndex
CREATE UNIQUE INDEX "scores_run_id_judge_id_category_key" ON "scores"("run_id", "judge_id", "category");

-- CreateIndex
CREATE INDEX "placements_division_id_rank_idx" ON "placements"("division_id", "rank");

-- CreateIndex
CREATE UNIQUE INDEX "placements_division_id_skater_id_key" ON "placements"("division_id", "skater_id");

-- CreateIndex
CREATE INDEX "audit_logs_event_id_idx" ON "audit_logs"("event_id");

-- AddForeignKey
ALTER TABLE "divisions" ADD CONSTRAINT "divisions_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "heats" ADD CONSTRAINT "heats_division_id_fkey" FOREIGN KEY ("division_id") REFERENCES "divisions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skaters" ADD CONSTRAINT "skaters_division_id_fkey" FOREIGN KEY ("division_id") REFERENCES "divisions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "judges" ADD CONSTRAINT "judges_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "runs" ADD CONSTRAINT "runs_heat_id_fkey" FOREIGN KEY ("heat_id") REFERENCES "heats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "runs" ADD CONSTRAINT "runs_skater_id_fkey" FOREIGN KEY ("skater_id") REFERENCES "skaters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scores" ADD CONSTRAINT "scores_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scores" ADD CONSTRAINT "scores_judge_id_fkey" FOREIGN KEY ("judge_id") REFERENCES "judges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "placements" ADD CONSTRAINT "placements_division_id_fkey" FOREIGN KEY ("division_id") REFERENCES "divisions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "placements" ADD CONSTRAINT "placements_skater_id_fkey" FOREIGN KEY ("skater_id") REFERENCES "skaters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "placements" ADD CONSTRAINT "placements_best_run_id_fkey" FOREIGN KEY ("best_run_id") REFERENCES "runs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

