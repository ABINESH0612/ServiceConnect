-- ============================================================================
-- ServiceConnect Test Accounts Seeding Script
-- Database: serviceconnect_auth
-- Table: users
-- ============================================================================

BEGIN;

INSERT INTO users (
    email,
    password,
    phone,
    role,
    enabled,
    email_verified,
    phone_verified,
    created_at,
    updated_at
)
VALUES
    (
        'customer@serviceconnect.com',
        '$2a$10$0KdquhYZGGj.8xDl2slsuOy/tMYqtBkwN5Sh0jD7fzAinbjPzGsL.',
        '+10000000001',
        'CUSTOMER',
        TRUE,
        TRUE,
        TRUE,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    (
        'provider@serviceconnect.com',
        '$2a$10$0KdquhYZGGj.8xDl2slsuOy/tMYqtBkwN5Sh0jD7fzAinbjPzGsL.',
        '+10000000002',
        'PROVIDER',
        TRUE,
        TRUE,
        TRUE,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    (
        'admin@serviceconnect.com',
        '$2a$10$0KdquhYZGGj.8xDl2slsuOy/tMYqtBkwN5Sh0jD7fzAinbjPzGsL.',
        '+10000000003',
        'ADMIN',
        TRUE,
        TRUE,
        TRUE,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    (
        'agent@serviceconnect.com',
        '$2a$10$0KdquhYZGGj.8xDl2slsuOy/tMYqtBkwN5Sh0jD7fzAinbjPzGsL.',
        '+10000000004',
        'SUPPORT_AGENT',
        TRUE,
        TRUE,
        TRUE,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    )
ON CONFLICT (email) DO UPDATE SET
    password       = EXCLUDED.password,
    phone          = EXCLUDED.phone,
    role           = EXCLUDED.role,
    enabled        = TRUE,
    email_verified = TRUE,
    phone_verified = TRUE,
    updated_at     = CURRENT_TIMESTAMP;

COMMIT;

-- Verify the seeded accounts:
SELECT id, email, phone, role, enabled, email_verified, phone_verified, updated_at
FROM users
WHERE email IN (
    'customer@serviceconnect.com',
    'provider@serviceconnect.com',
    'admin@serviceconnect.com',
    'agent@serviceconnect.com'
)
ORDER BY id ASC;
