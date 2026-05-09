SELECT 'CREATE DATABASE catalog_db'
    WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'catalog_db')\gexec

SELECT 'CREATE DATABASE order_db'
    WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'order_db')\gexec

SELECT 'CREATE DATABASE users_db'
    WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'users_db')\gexec