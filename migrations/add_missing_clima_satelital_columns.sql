-- Migration to add missing columns to clima_satelital table
-- Run this only if you encounter errors about missing columns

-- Add rango_temperatura column if it doesn't exist
ALTER TABLE clima_satelital 
ADD COLUMN IF NOT EXISTS rango_temperatura DECIMAL(5,2) DEFAULT NULL;

-- Add temperatura_punto_rocio column if it doesn't exist
ALTER TABLE clima_satelital 
ADD COLUMN IF NOT EXISTS temperatura_punto_rocio DECIMAL(5,2) DEFAULT NULL;

-- Add temperatura_humeda column if it doesn't exist
ALTER TABLE clima_satelital 
ADD COLUMN IF NOT EXISTS temperatura_humeda DECIMAL(5,2) DEFAULT NULL;

-- Add temperatura_superficie column if it doesn't exist
ALTER TABLE clima_satelital 
ADD COLUMN IF NOT EXISTS temperatura_superficie DECIMAL(5,2) DEFAULT NULL;

-- Add humedad_especifica column if it doesn't exist
ALTER TABLE clima_satelital 
ADD COLUMN IF NOT EXISTS humedad_especifica DECIMAL(5,2) DEFAULT NULL;

-- Add radiacion_onda_larga column if it doesn't exist
ALTER TABLE clima_satelital 
ADD COLUMN IF NOT EXISTS radiacion_onda_larga DECIMAL(7,2) DEFAULT NULL;

-- Add radiacion_cielo_despejado column if it doesn't exist
ALTER TABLE clima_satelital 
ADD COLUMN IF NOT EXISTS radiacion_cielo_despejado DECIMAL(7,2) DEFAULT NULL;

-- Add indice_claridad column if it doesn't exist
ALTER TABLE clima_satelital 
ADD COLUMN IF NOT EXISTS indice_claridad DECIMAL(3,2) DEFAULT NULL;

-- Verify columns were added
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'clima_satelital' 
ORDER BY ORDINAL_POSITION;
