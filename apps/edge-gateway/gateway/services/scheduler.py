from datetime import timedelta
from typing import Callable


class SchedulerService:
    """Service for scheduling periodic gateway tasks."""

    def schedule(self, interval: timedelta, task: Callable[[], None]) -> None:
        pass

    def cancel(self, task: Callable[[], None]) -> None:
        pass
