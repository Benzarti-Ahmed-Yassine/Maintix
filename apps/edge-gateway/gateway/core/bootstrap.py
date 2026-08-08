from gateway.services.runtime_manager import RuntimeManager


def create_gateway_app() -> RuntimeManager:
    """Bootstrap the Maintix edge gateway application."""
    runtime = RuntimeManager()
    return runtime
