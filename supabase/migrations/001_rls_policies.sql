-- =========================================================================
-- HELPER FUNCTIONS FOR RLS POLICIES
-- =========================================================================

CREATE OR REPLACE FUNCTION get_user_branch_id()
RETURNS UUID AS $$
  SELECT branch_id FROM profiles WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM profiles WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- =========================================================================
-- 1. PATIENTS Table RLS Policies
-- =========================================================================
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- SELECT: ADMIN thấy all, staff thấy patients có patient_branch_links với branch của họ
CREATE POLICY patients_select_policy ON patients
  FOR SELECT
  USING (
    get_user_role() = 'ADMIN'
    OR EXISTS (
      SELECT 1 FROM patient_branch_links
      WHERE patient_branch_links.patient_id = patients.id
      AND patient_branch_links.branch_id = get_user_branch_id()
    )
  );

-- INSERT: RECEPTION và ADMIN only
CREATE POLICY patients_insert_policy ON patients
  FOR INSERT
  WITH CHECK (
    get_user_role() IN ('RECEPTION', 'ADMIN', 'BRANCH_ADMIN')
  );

-- UPDATE: RECEPTION, DOCTOR, ADMIN
CREATE POLICY patients_update_policy ON patients
  FOR UPDATE
  USING (
    get_user_role() IN ('RECEPTION', 'DOCTOR', 'ADMIN', 'BRANCH_ADMIN')
  )
  WITH CHECK (
    get_user_role() IN ('RECEPTION', 'DOCTOR', 'ADMIN', 'BRANCH_ADMIN')
  );

-- DELETE: ADMIN only (soft delete thực ra là UPDATE deleted_at nhưng ta vẫn bảo vệ DELETE vật lý)
CREATE POLICY patients_delete_policy ON patients
  FOR DELETE
  USING (
    get_user_role() = 'ADMIN'
  );


-- =========================================================================
-- 2. VISITS Table RLS Policies
-- =========================================================================
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;

-- SELECT: ADMIN thấy all, staff chỉ thấy visits của branch mình
CREATE POLICY visits_select_policy ON visits
  FOR SELECT
  USING (
    get_user_role() = 'ADMIN'
    OR branch_id = get_user_branch_id()
  );

-- INSERT: RECEPTION, ADMIN
CREATE POLICY visits_insert_policy ON visits
  FOR INSERT
  WITH CHECK (
    get_user_role() IN ('RECEPTION', 'ADMIN')
  );

-- UPDATE: Theo role và status workflow
-- * RECEPTION: update status WAITING, IN_PROGRESS
-- * DOCTOR: update khi status IN_PROGRESS, CLS_PENDING
-- * CASHIER: update khi status COMPLETED
-- * ADMIN: unrestricted
CREATE POLICY visits_update_policy ON visits
  FOR UPDATE
  USING (
    get_user_role() = 'ADMIN'
    OR (
      get_user_role() = 'RECEPTION' 
      AND branch_id = get_user_branch_id()
    )
    OR (
      get_user_role() = 'DOCTOR' 
      AND branch_id = get_user_branch_id()
      AND status IN ('IN_PROGRESS', 'CLS_PENDING')
    )
    OR (
      get_user_role() = 'CASHIER' 
      AND branch_id = get_user_branch_id()
      AND status = 'COMPLETED'
    )
  )
  WITH CHECK (
    get_user_role() = 'ADMIN'
    OR (
      get_user_role() = 'RECEPTION' 
      AND branch_id = get_user_branch_id()
      AND status IN ('WAITING', 'IN_PROGRESS')
    )
    OR (
      get_user_role() = 'DOCTOR' 
      AND branch_id = get_user_branch_id()
    )
    OR (
      get_user_role() = 'CASHIER' 
      AND branch_id = get_user_branch_id()
    )
  );


-- =========================================================================
-- 3. CLS_ORDERS Table RLS Policies
-- =========================================================================
ALTER TABLE cls_orders ENABLE ROW LEVEL SECURITY;

-- SELECT: DOCTOR (ordered_by = auth.uid() hoặc branch match), PARACLINICAL (branch match), ADMIN (all)
CREATE POLICY cls_orders_select_policy ON cls_orders
  FOR SELECT
  USING (
    get_user_role() = 'ADMIN'
    OR (get_user_role() = 'DOCTOR' AND (ordered_by = auth.uid() OR branch_id = get_user_branch_id()))
    OR (get_user_role() = 'PARACLINICAL' AND branch_id = get_user_branch_id())
  );

-- INSERT: DOCTOR only
CREATE POLICY cls_orders_insert_policy ON cls_orders
  FOR INSERT
  WITH CHECK (
    get_user_role() = 'DOCTOR'
  );

-- UPDATE: PARACLINICAL (status changes), DOCTOR (read only - block update)
CREATE POLICY cls_orders_update_policy ON cls_orders
  FOR UPDATE
  USING (
    get_user_role() = 'ADMIN'
    OR (get_user_role() = 'PARACLINICAL' AND branch_id = get_user_branch_id())
  )
  WITH CHECK (
    get_user_role() = 'ADMIN'
    OR (get_user_role() = 'PARACLINICAL' AND branch_id = get_user_branch_id())
  );


-- =========================================================================
-- 4. CLS_RESULTS Table RLS Policies
-- =========================================================================
ALTER TABLE cls_results ENABLE ROW LEVEL SECURITY;

-- SELECT: DOCTOR, PARACLINICAL (branch match), ADMIN
CREATE POLICY cls_results_select_policy ON cls_results
  FOR SELECT
  USING (
    get_user_role() = 'ADMIN'
    OR EXISTS (
      SELECT 1 FROM cls_orders
      WHERE cls_orders.id = cls_results.order_id
      AND cls_orders.branch_id = get_user_branch_id()
    )
  );

-- INSERT: PARACLINICAL only
CREATE POLICY cls_results_insert_policy ON cls_results
  FOR INSERT
  WITH CHECK (
    get_user_role() = 'PARACLINICAL'
  );

-- UPDATE: PARACLINICAL (before review), ADMIN
CREATE POLICY cls_results_update_policy ON cls_results
  FOR UPDATE
  USING (
    get_user_role() = 'ADMIN'
    OR (
      get_user_role() = 'PARACLINICAL' 
      AND reviewed_at IS NULL
    )
  )
  WITH CHECK (
    get_user_role() = 'ADMIN'
    OR (
      get_user_role() = 'PARACLINICAL' 
      AND reviewed_at IS NULL
    )
  );


-- =========================================================================
-- 5. PRESCRIPTIONS Table RLS Policies
-- =========================================================================
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;

-- SELECT: DOCTOR (branch match), PHARMACIST (branch match), ADMIN
-- SELECT for PHARMACIST: chỉ status = CONFIRMED hoặc DISPENSED
CREATE POLICY prescriptions_select_policy ON prescriptions
  FOR SELECT
  USING (
    get_user_role() = 'ADMIN'
    OR (get_user_role() = 'DOCTOR' AND branch_id = get_user_branch_id())
    OR (
      get_user_role() = 'PHARMACIST' 
      AND branch_id = get_user_branch_id() 
      AND status IN ('CONFIRMED', 'DISPENSED')
    )
  );

-- INSERT/UPDATE: DOCTOR only
CREATE POLICY prescriptions_insert_update_policy ON prescriptions
  FOR ALL
  USING (
    get_user_role() IN ('DOCTOR', 'ADMIN')
  )
  WITH CHECK (
    get_user_role() IN ('DOCTOR', 'ADMIN')
  );


-- =========================================================================
-- 6. INVOICES + PAYMENTS Table RLS Policies
-- =========================================================================
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- INVOICES SELECT: CASHIER (branch match), ADMIN. DOCTOR/RECEPTION: chỉ xem summary (ta cho phép SELECT nhưng giấu ở client, hoặc RLS allow đọc)
CREATE POLICY invoices_select_policy ON invoices
  FOR SELECT
  USING (
    get_user_role() = 'ADMIN'
    OR (get_user_role() IN ('CASHIER', 'DOCTOR', 'RECEPTION', 'BRANCH_ADMIN') AND branch_id = get_user_branch_id())
  );

-- INVOICES INSERT/UPDATE: CASHIER, ADMIN
CREATE POLICY invoices_insert_update_policy ON invoices
  FOR ALL
  USING (
    get_user_role() IN ('CASHIER', 'ADMIN', 'BRANCH_ADMIN')
  )
  WITH CHECK (
    get_user_role() IN ('CASHIER', 'ADMIN', 'BRANCH_ADMIN')
  );

-- PAYMENTS SELECT: CASHIER (branch match), ADMIN
CREATE POLICY payments_select_policy ON payments
  FOR SELECT
  USING (
    get_user_role() = 'ADMIN'
    OR (
      get_user_role() IN ('CASHIER', 'BRANCH_ADMIN') 
      AND EXISTS (
        SELECT 1 FROM invoices 
        WHERE invoices.id = payments.invoice_id 
        AND invoices.branch_id = get_user_branch_id()
      )
    )
  );

-- PAYMENTS INSERT/UPDATE: CASHIER, ADMIN
CREATE POLICY payments_insert_update_policy ON payments
  FOR ALL
  USING (
    get_user_role() IN ('CASHIER', 'ADMIN', 'BRANCH_ADMIN')
  )
  WITH CHECK (
    get_user_role() IN ('CASHIER', 'ADMIN', 'BRANCH_ADMIN')
  );


-- =========================================================================
-- 7. INVENTORY_ITEMS Table RLS Policies
-- =========================================================================
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;

-- SELECT: PHARMACIST (branch match), ADMIN
CREATE POLICY inventory_items_select_policy ON inventory_items
  FOR SELECT
  USING (
    get_user_role() = 'ADMIN'
    OR branch_id = get_user_branch_id()
  );

-- INSERT/UPDATE: ADMIN only (hoặc PHARMACIST nếu có quyền)
CREATE POLICY inventory_items_insert_update_policy ON inventory_items
  FOR ALL
  USING (
    get_user_role() IN ('ADMIN', 'PHARMACIST', 'BRANCH_ADMIN')
  )
  WITH CHECK (
    get_user_role() IN ('ADMIN', 'PHARMACIST', 'BRANCH_ADMIN')
  );
