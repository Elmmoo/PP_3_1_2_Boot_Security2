CREATE TABLE IF NOT EXISTS roles (
                                     id BIGINT PRIMARY KEY AUTO_INCREMENT,
                                     name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
                                     id BIGINT PRIMARY KEY AUTO_INCREMENT,
                                     username VARCHAR(50) UNIQUE NOT NULL,
                                     password VARCHAR(255) NOT NULL,
                                     age INT
);

CREATE TABLE IF NOT EXISTS user_roles (
                                          user_id BIGINT,
                                          role_id BIGINT,
                                          FOREIGN KEY (user_id) REFERENCES users(id),
                                          FOREIGN KEY (role_id) REFERENCES roles(id)
);