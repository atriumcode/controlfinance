-- ============================================================================
-- SCRIPT 00: Habilitar Extensões (EXECUTAR COMO SUPERUSUÁRIO)
-- ============================================================================
-- Este script deve ser executado PRIMEIRO como superusuário (postgres)
-- Comando: sudo -u postgres psql -d invoice_system -f scripts/00-enable-extensions-as-superuser.sql
-- ============================================================================

\echo '============================================================================'
\echo 'Habilitando extensões necessárias...'
\echo '============================================================================'

-- Habilitar extensão para gerar UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Verificar extensões instaladas
\echo 'Extensões instaladas:'
SELECT extname, extversion FROM pg_extension;

\echo '============================================================================'
\echo 'Extensões habilitadas com sucesso!'
\echo 'Agora execute o script principal: 01-complete-postgresql-setup.sql'
\echo '============================================================================'
