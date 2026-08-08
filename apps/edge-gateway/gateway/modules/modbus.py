from gateway.interfaces.module import GatewayModule
from gateway.interfaces.communication import CommunicationInterface


class ModbusModule(GatewayModule):
    """Module for Modbus TCP/RTU communications."""

    def __init__(self, modbus_interface: CommunicationInterface) -> None:
        self.modbus_interface = modbus_interface

    def initialize(self) -> None:
        self.modbus_interface.connect()

    def shutdown(self) -> None:
        self.modbus_interface.disconnect()
