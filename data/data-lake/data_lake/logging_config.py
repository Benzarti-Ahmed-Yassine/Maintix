from __future__ import annotations

import logging


def configure_logging(level: str = "INFO") -> None:
    logger = logging.getLogger("data_lake")
    if not logger.handlers:
        handler = logging.StreamHandler()
        formatter = logging.Formatter("%(asctime)s %(levelname)s %(name)s %(message)s")
        handler.setFormatter(formatter)
        logger.addHandler(handler)
    logger.setLevel(level)


def get_logger() -> logging.Logger:
    configure_logging()
    return logging.getLogger("data_lake")
