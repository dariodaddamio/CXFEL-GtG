.. _quartz-vs-evt-timing:

EVG, EVR, EVT?
=====================

Purpose
-------

This page defines the core model used throughout the docs:

- Event Generator (EVG) and Event Receiver (EVR) are **timing roles**.
- Quartz and Event Timing (EVT) are **hardware families**.
- A chassis family does not automatically fix EVG versus EVR role.

Concept model (roles vs hardware)
---------------------------------

- **EVG role**

  - One node in a timing island acts as the source of event stream timing.
  - That node distributes events to downstream nodes over fiber.

- **EVR role**

  - Receivers consume the event stream and produce local outputs or triggers.
  - Most nodes in a timing island are EVRs.

- **Hardware family**

  - Quartz is the analog acquisition chassis family.
  - EVT is the digital timing/trigger chassis family.
  - Either family can be configured as EVG or EVR depending on wiring and configuration, and they can be interconnected.

Quartz chassis at a glance (analog)
-----------------------------------

- Primary function: analog acquisition with DB37 front interfaces.
- Timing fabric: participates in the same fiber timing network as EVT.
- Physical timing ports: eight Lucent Connector (LC) fiber ports (back panel) used for timing tree connections.
- IOC path: Quartz runs in the Quartz/ATF IOC workflow, not the EVT timing IOC tree.
- Hardware reference: use both Quartz front and back panel diagrams together to represent one chassis.

.. figure:: ../images/diagrams/Testing\ Rig\ Diagrams-Quartz\ Chassis\ Front\ Panel.drawio.png
   :alt: Quartz chassis front panel (DB37 analog connectors)
   :width: 720px

.. figure:: ../images/diagrams/Testing\ Rig\ Diagrams-Quartz\ Chassis\ Back\ Panel.drawio.png
   :alt: Quartz chassis back panel (LC timing fiber and DB9 digital)
   :width: 720px

Observed during bring-up:

- Flash/program cycles can require status clear and occasional full power cycle recovery.
- Forward timing path may be healthy while reverse diagnostics still fail; debug separately.
- Re-check channel and breakout mappings against current pinout revision before bench conclusions.

EVT chassis at a glance (digital)
---------------------------------

- Primary function: digital timing and trigger I/O.
- Front panel: SMA trigger connectors (digital I/O).
- Back panel: eight LC fiber ports for timing distribution.
- IOC path: EVT instances run from the timing IOC tree (not Quartz ``st.cmd`` trees).

.. figure:: ../../drawio/Testing\ Rig\ Diagrams-Digital\ Chassis\ Front\ Panel.drawio.png
   :alt: EVT digital chassis front panel (SMA trigger I/O)
   :width: 720px

.. figure:: ../../drawio/Testing\ Rig\ Diagrams-Digital\ Chassis\ Back\ Panel.drawio.png
   :alt: EVT digital chassis back panel (LC timing fiber)
   :width: 720px

Observed during bring-up:

- EVG mode requires Pulse Per Second (PPS) on input 1 at 1 Hz.
- Wrong netmask/gateway can mimic cable faults or unstable Ethernet behavior.
- After firmware update/erase, network and NTP settings may need re-entry.
- Firmware and Operator Interface (OPI) versions should stay aligned to avoid missing indicators.

Fiber port numbering (both families)
------------------------------------

Quartz and EVT follow the same port role convention in vendor docs:

- Port 1: EVR in
- Port 2: fan-out in
- Ports 3-8: fan-out outputs

Phoebus widgets 1-8 align with these physical ports. If software status looks inconsistent, verify
panel jumpers and cable placement before treating it as a software issue.

Where to go next
----------------

- :doc:`bringup_procedures` for step-by-step EVG/EVR bring-up.
- :doc:`evt_chassis` for EVT-specific checklist and digital hardware notes.
- :doc:`quartz_firmware` for Quartz firmware, boot, and service details.
- :doc:`integration_reference` for stack-wide wiring and IOC boundary mapping.
