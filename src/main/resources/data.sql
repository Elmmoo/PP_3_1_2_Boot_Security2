
INSERT IGNORE INTO roles (name) VALUES ('ROLE_ADMIN'), ('ROLE_USER');


INSERT IGNORE INTO users (first_name, last_name, email, password, age)
VALUES
    ('Admin', 'Admin', 'admin@example.com', '$2a$10$sIVWIVHzQMLFoSYy.leiqeCKrbNYMWdPvcJxNS5CI4nM9YJMnET9S', 30),
    ('User', 'User', 'user@example.com', '$2a$10$RAexHNtNHj0sVVey7f/tf.SimmwmQcuIwbYjOvLSfTM4At7RI6.AW', 25);

INSERT IGNORE INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u, roles r
WHERE u.email = 'admin@example.com' AND r.name = 'ROLE_ADMIN';

INSERT IGNORE INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u, roles r
WHERE u.email = 'user@example.com' AND r.name = 'ROLE_USER';
