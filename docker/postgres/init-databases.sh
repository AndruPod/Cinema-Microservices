#!/bin/sh
# Runs once, when the PostgreSQL volume is first initialised.
# Creates one database per service (database-per-service pattern).
set -eu

for db in "$USERS_DB_NAME" "$CATALOG_DB_NAME" "$ORDER_DB_NAME"; do
    echo "Creating database $db"
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname postgres \
        -c "CREATE DATABASE \"$db\""
done
