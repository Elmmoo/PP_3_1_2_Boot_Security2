
INSERT IGNORE INTO roles (name) VALUES ('ROLE_ADMIN'), ('ROLE_USER');


INSERT IGNORE INTO users (username, password, age)
VALUES ('admin', '$2a$10$sIVWIVHzQMLFoSYy.leiqeCKrbNYMWdPvcJxNS5CI4nM9YJMnET9S', 30);


INSERT IGNORE INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u, roles r
WHERE u.username = 'admin' AND r.name = 'ROLE_ADMIN';


INSERT IGNORE INTO users (username, password, age)
VALUES ('user', '$2a$10$RAexHNtNHj0sVVey7f/tf.SimmwmQcuIwbYjOvLSfTM4At7RI6.AW', 25);


INSERT IGNORE INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u, roles r
WHERE u.username = 'user' AND r.name = 'ROLE_USER';
