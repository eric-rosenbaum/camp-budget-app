-- CreateEnum
CREATE TYPE "MemberRole" AS ENUM ('OWNER', 'MEMBER');

-- CreateEnum
CREATE TYPE "CostBehavior" AS ENUM ('FIXED', 'PER_CAMPER', 'PERCENT_REVENUE');

-- CreateEnum
CREATE TYPE "InputMode" AS ENUM ('TOTAL_BUDGET', 'PER_CAMPER', 'PERCENT_REVENUE');

-- CreateTable
CREATE TABLE "organizations" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_members" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "role" "MemberRole" NOT NULL DEFAULT 'OWNER',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "organization_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "camps" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "camps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "camp_seasons" (
    "id" UUID NOT NULL,
    "camp_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "year" INTEGER,
    "capacity" INTEGER NOT NULL,
    "tuition_per_camper" DECIMAL(12,2) NOT NULL,
    "baseline_enrollment_percent" DECIMAL(5,2) NOT NULL,
    "prior_year_campers" INTEGER,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "camp_seasons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expense_categories" (
    "id" UUID NOT NULL,
    "camp_season_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "cost_behavior" "CostBehavior" NOT NULL,
    "input_mode" "InputMode" NOT NULL,
    "budget_amount" DECIMAL(12,2),
    "cost_per_camper" DECIMAL(12,2),
    "percent_of_revenue" DECIMAL(7,4),
    "notes" TEXT,
    "sort_order" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "expense_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_scenarios" (
    "id" UUID NOT NULL,
    "camp_season_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "enrollment_percent" DECIMAL(5,2) NOT NULL,
    "notes" TEXT,
    "projected_revenue" DECIMAL(12,2),
    "projected_expenses" DECIMAL(12,2),
    "projected_surplus" DECIMAL(12,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "saved_scenarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "import_batches" (
    "id" UUID NOT NULL,
    "camp_season_id" UUID NOT NULL,
    "filename" TEXT NOT NULL,
    "created_by_user_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "import_batches_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "organization_members_organization_id_user_id_key" ON "organization_members"("organization_id", "user_id");

-- AddForeignKey
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "camps" ADD CONSTRAINT "camps_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "camp_seasons" ADD CONSTRAINT "camp_seasons_camp_id_fkey" FOREIGN KEY ("camp_id") REFERENCES "camps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expense_categories" ADD CONSTRAINT "expense_categories_camp_season_id_fkey" FOREIGN KEY ("camp_season_id") REFERENCES "camp_seasons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_scenarios" ADD CONSTRAINT "saved_scenarios_camp_season_id_fkey" FOREIGN KEY ("camp_season_id") REFERENCES "camp_seasons"("id") ON DELETE CASCADE ON UPDATE CASCADE;
