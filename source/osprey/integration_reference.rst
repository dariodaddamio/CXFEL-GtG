.. _integration-reference:

Timing and lab integration
===========================

This page describes how Quartz versus Event Timing (EVT) chassis, EVT fiber layout, Event Generator (EVG)
bring-up, Input/Output Controller (IOC) boundaries, Pulse Per Second (PPS) and Network Time Protocol (NTP),
and detector integration fit together. Read :doc:`quartz_vs_evt_timing` first for EVG and Event
Receiver (EVR) roles and laboratory observations; use this page together with :doc:`evt_chassis`,
:doc:`timestamping_detectors`, and :doc:`quartz_firmware`.

Chassis families and EVG/EVR roles
----------------------------------

- Quartz chassis: analog acquisition (many channels, DB37 fronts; see vendor Quartz DAQ docs). EVT
  chassis: digital timing (fiber event stream, event codes, SMA digital I/O).

- EVG and EVR are roles on the timing network, not chassis model numbers. Typically one node per timing
  island is the generator; the rest are receivers. The same hardware type can be wired and configured
  for either role.

- On EVT, EVG versus EVR follows firmware configuration and wiring (fiber between specific ports, NTP
  server address, PPS on input 1 in generator mode). The timing IOC uses one database for the chassis
  type; in EVR-only mode, records that do not apply may have no effect.

EVT fiber layout (eight LC ports)
---------------------------------

The eight back-panel LC transceivers follow the same port numbering idea as Quartz:

- Port 1: EVR in (receive from upstream).
- Port 2: Fan-out in (aggregate return path in a full tree).
- Ports 3-8: Fan-out outputs (downstream EVT/Quartz).

A minimal EVG setup uses a short jumper between ports 1 and 3 so the chassis drives its own fan-out
path, plus PPS on electrical input 1 in EVG mode. In generator mode, input 1 is for PPS; use inputs
2-8 for other experiment signals.

Phoebus link widgets 1-8 match these physical fiber positions. If 1 and 2 look unused while 3+ are
active, compare against actual jumpers on the panel before assuming a display bug.

PPS, NTP, and EVG bring-up
--------------------------

- PPS into input 1 must be 1 Hz. A source left at 1 kHz can look partially alive but will not work as
  a pulse-per-second reference for the Phase-Locked Loop (PLL).

- Laboratory Stanford Research Systems FS740 (or similar) Bayonet Neill–Concelman (BNC) / Transistor-Transistor Logic (TTL) outputs often feed the EVT; EVT inputs are Subminiature version A (SMA), so BNC-to-SMA
  adapters are normal. If splitting PPS to multiple chassis, verify termination: both legs should see
  valid loads; open stubs cause marginal PPS.

- NTP IP, netmask, and gateway must match the laboratory Virtual Local Area Network (VLAN). Wrong mask or gateway produces flaky Ethernet,
  Ethernet physical layer (PHY) resets, and confusing link lights. After application flash erase/program, network and NTP may
  need to be re-entered (same pattern as Quartz).

- Event code 125 is the usual fixed-function PPS tick tied to the Global Positioning System (GPS)/PPS path. Use 125 when validating
  event receive (RX) paths and timestamps before adding arbitrary codes.

Event generation (conceptual)
-----------------------------

The EVG can emit events via timer/divider paths, software (write an event code to a process variable (PV)), and sequence
logic where implemented. Event code 0 is idle. Multiple physical outputs can respond to the same event
code; some Operator Interface (OPI) tables have an extra column for multi-map cases; simple use is event number, width,
and pulse vs static.

Digital outputs are Low-Voltage Transistor-Transistor Logic (LVTTL) (often about 3.3 V high). Match LVTTL vs Transistor-Transistor Logic (TTL) at downstream loads; on a scope
use 50 Ω input when edge fidelity and reduced ringing are required.

Timing IOC vs Quartz (ATF) IOC
------------------------------

- Quartz Operator Interface (OPI) and Acquisition Test Framework (ATF) / Quartz IOC startup trees are not where new EVT instances are added.

- EVT chassis are run from the timing IOC module tree (Phoebus entry points and systemd services live
  with that layout). EVG versus EVR is not declared in the startup file in the manner of some Quartz
  configurations; role follows hardware and firmware; the IOC loads the same record set and IP and
  macros identify the chassis.

- PV numbering (for example increments of 10 per chassis) is a lab convention; align names with the
  rack sheet.

- IOC shell for debug is often localhost telnet to a fixed high port per instance; Channel Access (CA) ports may be
  dynamic during early bring-up.

Forward vs reverse fiber (debugging)
------------------------------------

If downstream EVT or Quartz show good timestamps and healthy receive links, the forward path from the
EVG is often fine even when reverse-link or return-path indicators on the generator look wrong. Treat
forward and reverse as separate checks: swap cables, confirm transmit/receive (TX/RX) on the correct Lucent Connector (LC) strand (A vs B),
and use sysmon/optical power before assuming Field-Programmable Gate Array (FPGA) issues.

Quartz analog: DB1, DB2, bench wiring
-------------------------------------

- DB2: channels 1-16. DB1: channels 17-32 in the mapping used on the testbed (always confirm against the
  current vendor pinout for your hardware revision).

- Bench tests often use pins 1 and 20 on breakouts with coax; follow the applicable bench wiring drawing.

- For per-channel digital I/O tests on Quartz, use DB9 breakouts and cables on the digital connectors
  on the back.

Detector stack: timestamps, Eiger, cameras
--------------------------------------------

More detail is in :doc:`timestamping_detectors`. Summary:

- Target: at the machine rate of interest (for example 1 kHz), timing ticks must be joinable to
  frames after the camera path delivers pixels to a server. Plan where timing metadata meets
  areaDetector (or successor), not camera-only timestamps.

- Eiger: metadata may use ZeroMQ (ZMQ); EVT triggers still need to land in PVs/metadata so each exposure
  records which pulse or counter fired. Size buffers to latency, not a default guess.

- Allied Vision / Gigabit Ethernet (GigE): pixels and trigger are separate paths; prove scope or LED triggers early to
  separate timing from camera-specific bugs.

- Older facilities often put frame grabber and EVR together so one IOC saw images and stamps in one
  place. GigE moves pixels on another link; the association job remains in software.

Laboratory practice
-------------------

- Keep rack schedules, fiber maps, and IP rows aligned with Phoebus and IOC macros (including which
  chassis is EVG in each rack).

- Prefer small, accurate schematics (power, PPS, one fiber hop, scope) and add complexity in steps.

- EVT firmware may lag OPI features; version skew shows up as missing widgets or bad time readouts.
  After bootloader versus application work, confirm firmware vintage. Clear/program flows follow the
  same idea as Quartz.

- EVT fans in current builds are effectively on or off (limited variable speed with the installed
  parts). Plan for noise and burn-in when racks are open.

- SMA bulkheads should not spin under torque; use proper wrenches and flat engagement; if hardware does
  not key the body, treat it as a mechanical/process issue and track with vendor or lab quality
  channels.

See also
--------

- :doc:`quartz_vs_evt_timing` for EVG/EVR on Quartz vs EVT and lab interaction.
- :doc:`evt_chassis` for EVT checklist and UI pointers.
- :doc:`timestamping_detectors` for correlation design notes.
- :doc:`quartz_firmware`, :doc:`quartz_daq_repo` for Quartz bring-up and upstream links.
- :doc:`/cs_studio/index` for Phoebus (Global / Event / Network).
