from locust import HttpUser, between, task


class IndustrialPlantUser(HttpUser):
    wait_time = between(1, 3)

    @task
    def health_check(self) -> None:
        self.client.get('/health')

    @task
    def maintenance_dashboard(self) -> None:
        self.client.get('/maintenance')
