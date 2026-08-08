from datetime import timedelta
from maintix_backend.core.events.event_bus import EventBus

class SchedulerWorker:
    @staticmethod
    async def start() -> None:
        await SchedulerWorker.schedule_maintenance_poll()

    @staticmethod
    async def schedule_maintenance_poll() -> None:
        await EventBus.publish('scheduler.maintenance_poll', {'interval': timedelta(minutes=5)})
