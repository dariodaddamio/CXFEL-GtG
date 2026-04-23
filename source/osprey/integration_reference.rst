.. _integration-reference:

Integration Reference
===========================

This page is the integration map for the CXFEL timing stack. It describes how hardware families,
timing roles, wiring, and IOC boundaries connect in practice.

Use this page to answer: "Where does this signal/configuration belong in the full system?"

- Role definitions: :doc:`quartz_vs_evt_timing`
- EVT-specific checks: :doc:`evt_chassis`
- Quartz firmware and bench procedures: :doc:`quartz_firmware`

Chassis families and EVG/EVR roles
----------------------------------

- **Quartz (analog chassis family)**

  - Analog acquisition focus.
  - DB37 front connectivity in lab usage.
  - Participates in timing fabric over fiber.

- **EVT (digital chassis family)**

  - Digital timing and trigger I/O focus.
  - SMA digital connections on front, LC timing fibers on back.

- **EVG/EVR (timing roles)**

  - EVG generates/distributes timing events in one island.
  - EVR receives/acts on timing events.
  - Either Quartz or EVT hardware may be configured as EVG or EVR.

EVT fiber layout (eight LC ports)
---------------------------------

Both chassis families follow the same role labels for fiber ports:

- Port 1: EVR in (receive from upstream).
- Port 2: Fan-out in (aggregate return path in a full tree).
- Ports 3-8: Fan-out outputs (downstream EVT/Quartz).

- What this tells you:

  - A minimal EVG setup often uses a short 1-to-3 jumper.
  - In EVG mode, input 1 is reserved for PPS.
  - Phoebus 1-8 link widgets should map directly to physical ports.

PPS, NTP, and EVG bring-up
--------------------------

- PPS on EVG input 1 must be 1 Hz.
- NTP server, IP, netmask, and gateway must match lab network design.
- After erase/program cycles, re-check network and NTP fields.
- Verify timing receive path with known-good event behavior before adding custom logic.

What this tells you:

- Timing can look partially alive even when PPS/network configuration is wrong.
- Configuration mismatches can mimic cable or hardware faults.

Event generation (conceptual)
-----------------------------

- EVG event output can come from timer/divider logic, software writes, and sequence logic (where enabled).
- Outputs can be mapped to events by code, width, and output mode.
- Multiple outputs may respond to the same event code when configured.

What this tells you:

- Keep event mapping and output validation coupled; test mapping on scope/diagnostics early.

Timing IOC vs Quartz (ATF) IOC
------------------------------

- Quartz IOC workflows live in Quartz/ATF paths.
- EVT instances are added in the timing IOC tree.
- EVG/EVR role assignment follows wiring/configuration; IOC identity follows IP/macros/service instance.

What this tells you:

- Do not add EVT boxes by copying Quartz startup fragments.
- Keep IOC ownership and service boundaries explicit in rack documentation.

Forward vs reverse fiber (debugging)
------------------------------------

- Forward delivery and reverse/return reporting should be debugged as separate paths.
- Good downstream timestamps do not guarantee healthy reverse-link status on the EVG.
- Verify cable strand orientation and optical link metrics before firmware-level assumptions.

Quartz analog: DB1, DB2, bench wiring
-------------------------------------

- Testbed mapping commonly used in lab work:

  - DB2: channels 1-16
  - DB1: channels 17-32

- Always confirm mapping against the current hardware revision pinout.
- Use DB9 breakout paths for per-channel digital I/O verification on Quartz.

Detector stack: timestamps, Eiger, cameras
--------------------------------------------

- Timing metadata must remain joinable to detector frames at target machine rate.
- Trigger path validation should happen independently from camera transport debugging.
- GigE camera deployments keep pixel transport and timing transport on separate paths; software joins them.

Laboratory practice
-------------------

- Keep rack sheets, fiber maps, and IOC naming conventions synchronized.
- Start with minimal, known-good test topology and scale stepwise.
- Check firmware/OPI version alignment before deep troubleshooting.
- Track mechanical issues (fans, connectors, bulkheads) separately from firmware issues.

See also
--------

- :doc:`quartz_vs_evt_timing` for role and hardware definitions.
- :doc:`evt_chassis` for EVT hardware behavior and checklist.
- :doc:`quartz_firmware` and :doc:`quartz_daq_repo` for Quartz procedures and source references.
- :doc:`/cs_studio/index` for Phoebus usage (Global/Event/Network).
