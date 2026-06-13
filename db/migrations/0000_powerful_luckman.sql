CREATE TYPE "public"."user_role" AS ENUM('ADMIN', 'RECEPTION', 'DOCTOR', 'PARACLINICAL', 'CASHIER', 'PHARMACIST');--> statement-breakpoint
CREATE TYPE "public"."gender" AS ENUM('MALE', 'FEMALE', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."visit_status" AS ENUM('WAITING', 'IN_PROGRESS', 'CLS_PENDING', 'COMPLETED', 'CANCELLED', 'PAID');--> statement-breakpoint
CREATE TYPE "public"."diagnosis_type" AS ENUM('PRIMARY', 'SECONDARY', 'COMPLICATION');--> statement-breakpoint
CREATE TYPE "public"."cls_order_status" AS ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."cls_priority" AS ENUM('NORMAL', 'URGENT');--> statement-breakpoint
CREATE TYPE "public"."cls_service_type" AS ENUM('LAB', 'IMAGING', 'ECG', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."prescription_status" AS ENUM('DRAFT', 'CONFIRMED', 'DISPENSED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."procedure_status" AS ENUM('ORDERED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."invoice_item_type" AS ENUM('VISIT_FEE', 'CLS', 'PROCEDURE', 'DRUG');--> statement-breakpoint
CREATE TYPE "public"."invoice_status" AS ENUM('DRAFT', 'PENDING', 'PAID', 'CANCELLED', 'REFUNDED');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('CASH', 'CARD', 'TRANSFER', 'MOMO', 'VNPAY');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED');--> statement-breakpoint
CREATE TYPE "public"."appointment_status" AS ENUM('BOOKED', 'CONFIRMED', 'ARRIVED', 'CANCELLED', 'NO_SHOW');--> statement-breakpoint
CREATE TABLE "branches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"address" text NOT NULL,
	"phone" varchar(50) NOT NULL,
	"code" varchar(100) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "branches_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "auth"."users" (
	"id" uuid PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"phone" varchar(50) NOT NULL,
	"role" "user_role" NOT NULL,
	"branch_id" uuid NOT NULL,
	"employee_code" varchar(100) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "profiles_employee_code_unique" UNIQUE("employee_code")
);
--> statement-breakpoint
CREATE TABLE "patient_branch_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_id" uuid NOT NULL,
	"branch_id" uuid NOT NULL,
	"first_visit_at" timestamp DEFAULT now() NOT NULL,
	"last_visit_at" timestamp DEFAULT now() NOT NULL,
	"visit_count" integer DEFAULT 0 NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	CONSTRAINT "patient_branch_links_patient_id_branch_id_key" UNIQUE("patient_id","branch_id")
);
--> statement-breakpoint
CREATE TABLE "patients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_code" varchar(100) NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"date_of_birth" timestamp NOT NULL,
	"gender" "gender" NOT NULL,
	"phone" varchar(50) NOT NULL,
	"cccd" varchar(50),
	"bhyt_code" varchar(50),
	"address" text NOT NULL,
	"blood_type" varchar(10),
	"allergies" text[],
	"primary_branch_id" uuid NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "patients_patient_code_unique" UNIQUE("patient_code"),
	CONSTRAINT "patients_cccd_unique" UNIQUE("cccd")
);
--> statement-breakpoint
CREATE TABLE "visits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"visit_code" varchar(100) NOT NULL,
	"patient_id" uuid NOT NULL,
	"branch_id" uuid NOT NULL,
	"doctor_id" uuid NOT NULL,
	"receptionist_id" uuid NOT NULL,
	"status" "visit_status" NOT NULL,
	"chief_complaint" text NOT NULL,
	"medical_history" text NOT NULL,
	"scheduled_at" timestamp,
	"started_at" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "visits_visit_code_unique" UNIQUE("visit_code")
);
--> statement-breakpoint
CREATE TABLE "vitals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"visit_id" uuid NOT NULL,
	"blood_pressure_systolic" integer NOT NULL,
	"blood_pressure_diastolic" integer NOT NULL,
	"heart_rate" integer NOT NULL,
	"temperature" numeric(4, 1) NOT NULL,
	"weight" numeric(5, 2) NOT NULL,
	"height" numeric(5, 2) NOT NULL,
	"spo2" integer NOT NULL,
	"notes" text,
	"recorded_by" uuid NOT NULL,
	"recorded_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "vitals_visit_id_unique" UNIQUE("visit_id")
);
--> statement-breakpoint
CREATE TABLE "diagnoses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"visit_id" uuid NOT NULL,
	"icd10_code" varchar(10) NOT NULL,
	"icd10_description" text NOT NULL,
	"diagnosis_type" "diagnosis_type" NOT NULL,
	"notes" text,
	"created_by" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cls_orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_code" varchar(100) NOT NULL,
	"visit_id" uuid NOT NULL,
	"branch_id" uuid NOT NULL,
	"ordered_by" uuid NOT NULL,
	"service_name" varchar(255) NOT NULL,
	"service_type" "cls_service_type" NOT NULL,
	"status" "cls_order_status" NOT NULL,
	"priority" "cls_priority" NOT NULL,
	"notes" text,
	"ordered_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "cls_orders_order_code_unique" UNIQUE("order_code")
);
--> statement-breakpoint
CREATE TABLE "cls_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"performed_by" uuid NOT NULL,
	"result_text" text NOT NULL,
	"result_data" jsonb,
	"file_urls" text[],
	"is_abnormal" boolean DEFAULT false NOT NULL,
	"reviewed_by" uuid,
	"reviewed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "cls_results_order_id_unique" UNIQUE("order_id")
);
--> statement-breakpoint
CREATE TABLE "prescription_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"prescription_id" uuid NOT NULL,
	"drug_name" varchar(255) NOT NULL,
	"drug_code" varchar(100),
	"dosage" varchar(255) NOT NULL,
	"frequency" varchar(255) NOT NULL,
	"duration_days" integer NOT NULL,
	"quantity" integer NOT NULL,
	"unit" varchar(50) NOT NULL,
	"instructions" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prescriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"prescription_code" varchar(100) NOT NULL,
	"visit_id" uuid NOT NULL,
	"branch_id" uuid NOT NULL,
	"prescribed_by" uuid NOT NULL,
	"status" "prescription_status" NOT NULL,
	"national_prescription_sync_at" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "prescriptions_prescription_code_unique" UNIQUE("prescription_code")
);
--> statement-breakpoint
CREATE TABLE "procedures" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"visit_id" uuid NOT NULL,
	"procedure_name" varchar(255) NOT NULL,
	"procedure_code" varchar(100),
	"performed_by" uuid NOT NULL,
	"status" "procedure_status" NOT NULL,
	"notes" text,
	"report" text,
	"performed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoice_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invoice_id" uuid NOT NULL,
	"item_type" "invoice_item_type" NOT NULL,
	"item_ref_id" uuid,
	"description" varchar(255) NOT NULL,
	"quantity" integer NOT NULL,
	"unit_price" numeric(12, 2) NOT NULL,
	"discount_pct" numeric(5, 2) DEFAULT '0.00' NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invoice_code" varchar(100) NOT NULL,
	"visit_id" uuid NOT NULL,
	"branch_id" uuid NOT NULL,
	"subtotal" numeric(12, 2) DEFAULT '0.00' NOT NULL,
	"discount_amount" numeric(12, 2) DEFAULT '0.00' NOT NULL,
	"bhyt_amount" numeric(12, 2) DEFAULT '0.00' NOT NULL,
	"total_amount" numeric(12, 2) DEFAULT '0.00' NOT NULL,
	"status" "invoice_status" NOT NULL,
	"issued_at" timestamp,
	"paid_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "invoices_invoice_code_unique" UNIQUE("invoice_code"),
	CONSTRAINT "invoices_visit_id_unique" UNIQUE("visit_id")
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invoice_id" uuid NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"method" "payment_method" NOT NULL,
	"status" "payment_status" NOT NULL,
	"transaction_id" varchar(255),
	"paid_at" timestamp,
	"processed_by" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inventory_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"branch_id" uuid NOT NULL,
	"drug_name" varchar(255) NOT NULL,
	"drug_code" varchar(100) NOT NULL,
	"unit" varchar(50) NOT NULL,
	"quantity_in_stock" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"min_stock_threshold" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"expiry_date" date NOT NULL,
	"batch_number" varchar(100) NOT NULL,
	"received_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "appointments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_id" uuid NOT NULL,
	"branch_id" uuid NOT NULL,
	"doctor_id" uuid,
	"scheduled_at" timestamp NOT NULL,
	"duration_minutes" integer DEFAULT 15 NOT NULL,
	"status" "appointment_status" NOT NULL,
	"reason" text NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient_branch_links" ADD CONSTRAINT "patient_branch_links_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient_branch_links" ADD CONSTRAINT "patient_branch_links_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patients" ADD CONSTRAINT "patients_primary_branch_id_branches_id_fk" FOREIGN KEY ("primary_branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "visits" ADD CONSTRAINT "visits_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "visits" ADD CONSTRAINT "visits_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "visits" ADD CONSTRAINT "visits_doctor_id_profiles_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "visits" ADD CONSTRAINT "visits_receptionist_id_profiles_id_fk" FOREIGN KEY ("receptionist_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vitals" ADD CONSTRAINT "vitals_visit_id_visits_id_fk" FOREIGN KEY ("visit_id") REFERENCES "public"."visits"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vitals" ADD CONSTRAINT "vitals_recorded_by_profiles_id_fk" FOREIGN KEY ("recorded_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "diagnoses" ADD CONSTRAINT "diagnoses_visit_id_visits_id_fk" FOREIGN KEY ("visit_id") REFERENCES "public"."visits"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "diagnoses" ADD CONSTRAINT "diagnoses_created_by_profiles_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cls_orders" ADD CONSTRAINT "cls_orders_visit_id_visits_id_fk" FOREIGN KEY ("visit_id") REFERENCES "public"."visits"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cls_orders" ADD CONSTRAINT "cls_orders_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cls_orders" ADD CONSTRAINT "cls_orders_ordered_by_profiles_id_fk" FOREIGN KEY ("ordered_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cls_results" ADD CONSTRAINT "cls_results_order_id_cls_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."cls_orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cls_results" ADD CONSTRAINT "cls_results_performed_by_profiles_id_fk" FOREIGN KEY ("performed_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cls_results" ADD CONSTRAINT "cls_results_reviewed_by_profiles_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prescription_items" ADD CONSTRAINT "prescription_items_prescription_id_prescriptions_id_fk" FOREIGN KEY ("prescription_id") REFERENCES "public"."prescriptions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_visit_id_visits_id_fk" FOREIGN KEY ("visit_id") REFERENCES "public"."visits"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_prescribed_by_profiles_id_fk" FOREIGN KEY ("prescribed_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "procedures" ADD CONSTRAINT "procedures_visit_id_visits_id_fk" FOREIGN KEY ("visit_id") REFERENCES "public"."visits"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "procedures" ADD CONSTRAINT "procedures_performed_by_profiles_id_fk" FOREIGN KEY ("performed_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_visit_id_visits_id_fk" FOREIGN KEY ("visit_id") REFERENCES "public"."visits"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_processed_by_profiles_id_fk" FOREIGN KEY ("processed_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_doctor_id_profiles_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;