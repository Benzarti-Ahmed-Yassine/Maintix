import pandas as pd

from data_lake.validation import SchemaValidator


def test_validation_missing_column() -> None:
    df = pd.DataFrame({"id": [1, 2]})
    validator = SchemaValidator(required_columns=["id", "value"], column_types={"id": int, "value": str})
    result = validator.validate_dataframe(df)

    assert not result.success
    assert "Missing required column: value" in result.errors


def test_validation_type_mismatch() -> None:
    df = pd.DataFrame({"id": ["1", "2"], "value": ["x", "y"]})
    validator = SchemaValidator(required_columns=["id", "value"], column_types={"id": int, "value": str})
    result = validator.validate_dataframe(df)

    assert not result.success
    assert any("expected int" in msg for msg in result.errors)
