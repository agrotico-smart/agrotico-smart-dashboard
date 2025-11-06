# Database Migrations

This directory contains SQL migration files for the Agrotico Smart Dashboard database.

## How to Run Migrations

### Prerequisites
- MySQL client installed
- Access to the database with appropriate privileges

### Running a Migration

```bash
mysql -u your_username -p your_database_name < migrations/migration_file.sql
```

Or using the DATABASE_URL environment variable:

```bash
# Extract connection details from your .env file
mysql -h hostname -P port -u username -p database_name < migrations/migration_file.sql
```

## Available Migrations

### add_missing_clima_satelital_columns.sql
Adds missing columns to the `clima_satelital` table that are required for full satellite data display:
- rango_temperatura
- temperatura_punto_rocio
- temperatura_humeda
- temperatura_superficie
- humedad_especifica
- radiacion_onda_larga
- radiacion_cielo_despejado
- indice_claridad

**When to run**: If you're experiencing "N/A" values in satellite data (Datos Satelitales) or database errors about missing columns.

**Safe to run multiple times**: Yes, uses `IF NOT EXISTS` to prevent duplicate columns.

## Notes

- Always backup your database before running migrations
- Test migrations in a development environment first
- Some migrations may take time on large databases
