from gateway.core.manager import RuntimeManager


class RuntimeManagerService(RuntimeManager):
    """Runtime service wrapper for gateway orchestration."""

    def __init__(self) -> None:
        super().__init__()
