-- Habilitar RLS em todas as tabelas
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Políticas para a tabela companies
-- Usuários podem ver apenas sua própria empresa
CREATE POLICY "Users can view their own company" ON companies
    FOR SELECT USING (
        id IN (
            SELECT company_id FROM profiles 
            WHERE id = auth.uid()
        )
    );

-- Apenas administradores podem atualizar dados da empresa
CREATE POLICY "Admins can update company data" ON companies
    FOR UPDATE USING (
        id IN (
            SELECT company_id FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Políticas para a tabela profiles
-- Usuários podem ver perfis da mesma empresa
CREATE POLICY "Users can view profiles from same company" ON profiles
    FOR SELECT USING (
        company_id IN (
            SELECT company_id FROM profiles 
            WHERE id = auth.uid()
        )
    );

-- Usuários podem atualizar seu próprio perfil
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (id = auth.uid());

-- Apenas administradores podem inserir novos usuários
CREATE POLICY "Admins can insert new users" ON profiles
    FOR INSERT WITH CHECK (
        company_id IN (
            SELECT company_id FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Apenas administradores podem deletar usuários
CREATE POLICY "Admins can delete users" ON profiles
    FOR DELETE USING (
        company_id IN (
            SELECT company_id FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Políticas para a tabela clients
-- Usuários podem ver clientes da mesma empresa
CREATE POLICY "Users can view clients from same company" ON clients
    FOR SELECT USING (
        company_id IN (
            SELECT company_id FROM profiles 
            WHERE id = auth.uid()
        )
    );

-- Usuários com permissão de escrita podem inserir clientes
CREATE POLICY "Users with write permission can insert clients" ON clients
    FOR INSERT WITH CHECK (
        company_id IN (
            SELECT company_id FROM profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'escrita')
        )
    );

-- Usuários com permissão de escrita podem atualizar clientes
CREATE POLICY "Users with write permission can update clients" ON clients
    FOR UPDATE USING (
        company_id IN (
            SELECT company_id FROM profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'escrita')
        )
    );

-- Apenas administradores podem deletar clientes
CREATE POLICY "Admins can delete clients" ON clients
    FOR DELETE USING (
        company_id IN (
            SELECT company_id FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Políticas para a tabela invoices
-- Usuários podem ver faturas da mesma empresa
CREATE POLICY "Users can view invoices from same company" ON invoices
    FOR SELECT USING (
        company_id IN (
            SELECT company_id FROM profiles 
            WHERE id = auth.uid()
        )
    );

-- Usuários com permissão de escrita podem inserir faturas
CREATE POLICY "Users with write permission can insert invoices" ON invoices
    FOR INSERT WITH CHECK (
        company_id IN (
            SELECT company_id FROM profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'escrita')
        )
    );

-- Usuários com permissão de escrita podem atualizar faturas
CREATE POLICY "Users with write permission can update invoices" ON invoices
    FOR UPDATE USING (
        company_id IN (
            SELECT company_id FROM profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'escrita')
        )
    );

-- Apenas administradores podem deletar faturas
CREATE POLICY "Admins can delete invoices" ON invoices
    FOR DELETE USING (
        company_id IN (
            SELECT company_id FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Políticas para a tabela invoice_items
-- Usuários podem ver itens de faturas da mesma empresa
CREATE POLICY "Users can view invoice items from same company" ON invoice_items
    FOR SELECT USING (
        invoice_id IN (
            SELECT id FROM invoices 
            WHERE company_id IN (
                SELECT company_id FROM profiles 
                WHERE id = auth.uid()
            )
        )
    );

-- Usuários com permissão de escrita podem inserir itens
CREATE POLICY "Users with write permission can insert invoice items" ON invoice_items
    FOR INSERT WITH CHECK (
        invoice_id IN (
            SELECT id FROM invoices 
            WHERE company_id IN (
                SELECT company_id FROM profiles 
                WHERE id = auth.uid() AND role IN ('admin', 'escrita')
            )
        )
    );

-- Usuários com permissão de escrita podem atualizar itens
CREATE POLICY "Users with write permission can update invoice items" ON invoice_items
    FOR UPDATE USING (
        invoice_id IN (
            SELECT id FROM invoices 
            WHERE company_id IN (
                SELECT company_id FROM profiles 
                WHERE id = auth.uid() AND role IN ('admin', 'escrita')
            )
        )
    );

-- Apenas administradores podem deletar itens
CREATE POLICY "Admins can delete invoice items" ON invoice_items
    FOR DELETE USING (
        invoice_id IN (
            SELECT id FROM invoices 
            WHERE company_id IN (
                SELECT company_id FROM profiles 
                WHERE id = auth.uid() AND role = 'admin'
            )
        )
    );

-- Políticas para a tabela payments
-- Usuários podem ver pagamentos de faturas da mesma empresa
CREATE POLICY "Users can view payments from same company" ON payments
    FOR SELECT USING (
        invoice_id IN (
            SELECT id FROM invoices 
            WHERE company_id IN (
                SELECT company_id FROM profiles 
                WHERE id = auth.uid()
            )
        )
    );

-- Usuários com permissão de escrita podem inserir pagamentos
CREATE POLICY "Users with write permission can insert payments" ON payments
    FOR INSERT WITH CHECK (
        invoice_id IN (
            SELECT id FROM invoices 
            WHERE company_id IN (
                SELECT company_id FROM profiles 
                WHERE id = auth.uid() AND role IN ('admin', 'escrita')
            )
        )
    );

-- Usuários com permissão de escrita podem atualizar pagamentos
CREATE POLICY "Users with write permission can update payments" ON payments
    FOR UPDATE USING (
        invoice_id IN (
            SELECT id FROM invoices 
            WHERE company_id IN (
                SELECT company_id FROM profiles 
                WHERE id = auth.uid() AND role IN ('admin', 'escrita')
            )
        )
    );

-- Apenas administradores podem deletar pagamentos
CREATE POLICY "Admins can delete payments" ON payments
    FOR DELETE USING (
        invoice_id IN (
            SELECT id FROM invoices 
            WHERE company_id IN (
                SELECT company_id FROM profiles 
                WHERE id = auth.uid() AND role = 'admin'
            )
        )
    );

-- Políticas para a tabela audit_logs
-- Usuários podem ver logs de auditoria da mesma empresa
CREATE POLICY "Users can view audit logs from same company" ON audit_logs
    FOR SELECT USING (
        company_id IN (
            SELECT company_id FROM profiles 
            WHERE id = auth.uid()
        )
    );

-- Sistema pode inserir logs de auditoria (sem restrição para triggers)
CREATE POLICY "System can insert audit logs" ON audit_logs
    FOR INSERT WITH CHECK (true);

-- Ninguém pode atualizar ou deletar logs de auditoria (imutáveis)
-- (Não criamos políticas de UPDATE/DELETE, então são negadas por padrão)

-- Comentário informativo
COMMENT ON TABLE companies IS 'RLS habilitado - usuários veem apenas sua empresa';
COMMENT ON TABLE profiles IS 'RLS habilitado - usuários veem perfis da mesma empresa';
COMMENT ON TABLE clients IS 'RLS habilitado - usuários veem clientes da mesma empresa';
COMMENT ON TABLE invoices IS 'RLS habilitado - usuários veem faturas da mesma empresa';
COMMENT ON TABLE invoice_items IS 'RLS habilitado - usuários veem itens de faturas da mesma empresa';
COMMENT ON TABLE payments IS 'RLS habilitado - usuários veem pagamentos da mesma empresa';
COMMENT ON TABLE audit_logs IS 'RLS habilitado - logs imutáveis por empresa';
