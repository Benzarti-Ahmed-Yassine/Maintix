from gateway.interfaces.module import GatewayModule
from gateway.interfaces.communication import CommunicationInterface


class OPCUAModule(GatewayModule):
    """Module for OPC-UA client/server integration."""

    def __init__(self, opcua_interface: CommunicationInterface) -> None:
        self.opcua_interface = opcua_interface

    def initialize(self) -> None:
        self.opcua_interface.connect()

    def shutdown(self) -> None:
        self.opcua_interface.disconnect()
