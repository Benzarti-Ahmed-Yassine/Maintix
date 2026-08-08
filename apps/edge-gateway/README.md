# Maintix Edge Gateway

## Overview

The Maintix Edge Gateway provides a Raspberry Pi-based industrial gateway layer for edge devices. It is responsible for protocol bridging, local buffering, OTA management, diagnostics, and secure connectivity between downstream industrial devices and upstream cloud or platform services.

## Architecture

The gateway is organized into the following high-level domains:

- `gateway/core` - Core application bootstrap, runtime manager, plugin orchestration, and lifecycle handling.
- `gateway/interfaces` - Protocol-agnostic interfaces for communication, device management, configuration, and telemetry services.
- `gateway/modules` - Domain-specific modules such as MQTT, OPC-UA, Modbus, local buffer, OTA, diagnostics, watchdog, and device manager.
- `gateway/services` - Cross-module services for scheduling, persistence, and REST API integration.
- `gateway/adapters` - Platform and cloud integration adapters for MQTT brokers, REST endpoints, and storage backends.

## Key Modules

- `mqtt` - MQTT client/service for local and cloud messaging, topic routing, and device telemetry publication.
- `opcua` - OPC-UA client/server integration for industrial data access and device interoperability.
- `modbus` - Modbus TCP/RTU protocol support for PLC and sensor communications.
- `buffer` - Local buffering and persistence for intermittent connectivity, message queuing, and retry handling.
- `ota` - Over-the-air update manager for firmware or software package delivery.
- `diagnostics` - Health monitoring, self-checks, and telemetry for gateway status.
- `watchdog` - Supervisory watchdog ensuring gateway process resilience and auto-recovery.
- `configuration` - Device and gateway configuration management, secure storage, and dynamic reload.
- `device_manager` - Device lifecycle manager for discovery, registration, health, and command execution.
- `rest_api` - Local REST API for control plane, management, and local integration.

## Notes

This repository contains architecture scaffolding only. Implementation details are intentionally omitted.
