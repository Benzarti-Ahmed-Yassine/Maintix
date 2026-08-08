# Maintix Data Lake Architecture

## Overview

The Maintix Data Lake provides a structured, layered repository for raw and curated data. It is organized into Bronze, Silver, and Gold zones and includes metadata, cataloging, feature storage, and archival support.

## Zones

- `bronze/` - Raw ingested data in native or minimally transformed form.
- `silver/` - Cleaned and normalized data with schema enforcement and enrichment.
- `gold/` - Curated, analytics-ready datasets for reporting and machine learning.

## Supporting Layers

- `metadata/` - Data dictionaries, schema definitions, lineage, and dataset contracts.
- `catalog/` - Central dataset registry and searchable catalog for data consumers.
- `feature-store/` - Feature definitions, feature tables, and operational ML feature serving metadata.
- `archive/` - Historical snapshots, cold storage, and retention-managed archives.

## Architecture

The architecture follows a standard medallion pattern:

1. Ingest raw data into Bronze.
2. Transform and validate data into Silver.
3. Curate and aggregate data into Gold.
4. Maintain metadata and catalog records for discoverability.
5. Store ML feature definitions in the feature store.
6. Archive aged or compliance-sensitive data to the archive layer.

## Naming Convention

- Use lowercase snake_case paths and filenames.
- Prefix dataset files with `bronze_`, `silver_`, or `gold_` to indicate the layer.
- Metadata assets should include `schema_`, `lineage_`, or `contract_` in the filename.
- Catalog entries should follow `catalog_<domain>_<dataset>.yaml`.
- Feature store objects should use `feature_<domain>_<name>.yaml`.
- Archive snapshots should include `archive_<dataset>_<yyyyMMdd>.parquet`.

## Data Governance

- Document all datasets in `metadata/` with schema and owner information.
- Track data lineage from ingestion through transformation.
- Apply retention policies in `archive/` and enforce purge windows.
- Classify sensitive data and apply masking or encryption rules.
- Centralize access control and auditing through the catalog.
- Maintain a data steward for each data domain.

## Notes

This structure is architectural only; no data ingestion or transformation implementation is included.
