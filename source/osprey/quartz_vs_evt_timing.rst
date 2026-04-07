.. _quartz-vs-evt-timing:

Quartz vs EVT: EVG, EVR, and how to work with each
===================================================

This page explains what Event Generator (EVG) and Event Receiver (EVR) denote on the timing network,
how those roles appear on Quartz (analog acquisition) versus Event Timing (EVT) chassis, issues
observed during bring-up (including February–March 2026 laboratory work and vendor sessions), and how
Phoebus and Input/Output Controllers (IOCs) are used to operate the equipment.

- For a concise EVT checklist see :doc:`evt_chassis`. 
- A consolidated EVG/EVR bring-up entry point is :doc:`initial_bring_up`. 
- Quartz boot, USB, network, and Alluvium are covered in :doc:`quartz_firmware`.
- Stack-wide integration is in :doc:`integration_reference`.

What EVG and EVR are
----------------------------------------------------

EVG and EVR are **roles** on the timing network, not a fixed product model or part number.
In one fiber tree (call it an island), one node is the generator: it launches the event stream and the
time reference everyone else locks to. Receivers eat that stream and turn it into triggers and other output for local gear.

Multiple Quartz and multiple EVT chassis may be installed in one island; each unit is still configured
as EVG or EVR according to wiring, and set up procedure. Chassis family name
alone does not imply a fixed EVG or EVR role.

Quartz chassis: analog acquisition on the same timing fabric
-------------------------------------------------------------

Quartz is for high-channel analog (DB37 fronts; see the vendor Quartz Data Acquisition (DAQ) docs). It still sits on the
same Osprey fiber timing fabric: eight Lucent Connector (LC) fiber ports on the back, with Phoebus labeling ``Quartz #N``
link widgets. Whether that chassis is the generator or just a receiver follows the same physics as EVT: jumpers,
Network Time Protocol (NTP) when the design says so, Pulse Per Second (PPS) when it matters. Quartz firmware NTP/PPS knobs are what tilt you
toward EVG-style versus EVR-only-style behavior (for example EVR-only when the chassis is not acting
as an NTP server); details in :doc:`quartz_firmware_network`.

Software path: Quartz IOC configuration in the vendor Acquisition Test Framework (ATF) layout, **not** the timing IOC tree used for EVT. When Quartz
operates as an event generator, the IOC may load additional records that apply only in that mode;
vendor and laboratory startup files should be consulted rather than assuming a single ``st.cmd`` line
declares EVG role. On EVT, one IOC database covers the chassis type; EVG versus EVR follows wiring and
firmware, with IP and macros selecting the instance.

Analog: DB37. Digital on the back: DB9. We ordered DB9 breakouts to poke individual digital lines on the
bench. DB37 mapping on the testbed: DB2 channels 1–16, DB1 channels 17–32 (re-check the pinout PDF for
the applicable hardware revision).

Observed on Quartz during laboratory work:

- After Field-Programmable Gate Array (FPGA) reset, flash status may show error bits; a status/clear cycle via Alluvium often clears
  the condition (:doc:`quartz_firmware_alluvium`).
- The management microcontroller (MMC) over Universal Serial Bus (USB) can occasionally lock up after extensive flash or reset operations; a full power cycle
  restored operation in those cases.
- On fiber, the forward path may appear healthy (timestamps on receivers) while reverse-path
  diagnostics still fail; forward and reverse paths should be treated as separate diagnostic tracks,
  as on EVT.

EVT chassis: digital timing and triggers
------------------------------------------

EVT is the digital side: Subminiature version A (SMA) connectors in/out on the front for Low-Voltage Transistor-Transistor Logic (LVTTL)–class triggers, eight LC fibers on the back
for the event stream. It is not a substitute for Quartz analog.

EVG versus EVR here follows jumpers, NTP, and PPS on input 1 when the chassis is the generator. In EVG mode, input 1 is
for PPS; everything else is fair game for experiment signals. Front panel is SMA; our lab PPS from an
Stanford Research Systems FS740–class box is often Bayonet Neill–Concelman (BNC), so BNC-to-SMA adapters are normal rack clutter.

IOC configuration: timing IOC tree, Phoebus entry points, and systemd units for ``EVT #N``. EVT
instances must not be added by editing Quartz ``st.cmd`` trees.

Observed issues on EVT during laboratory work:

- PPS applied to input 1 must be 1 Hz. A source left at approximately 1 kHz may still toggle an input
  but does not satisfy pulse-per-second Phase-Locked Loop (PLL) requirements; PLL and timestamp fields remain incorrect
  until the source is corrected.
- Netmask and gateway must match the laboratory subnet. Incorrect values have produced intermittent
  Ethernet, Ethernet physical layer (PHY) reset loops, and fluctuating link indications; symptoms may resemble a cable fault
  until network parameters are verified.
- After application flash erase/program, IP, netmask, gateway, and NTP may need re-entry (same pattern
  as Quartz bring-up).
- Firmware must match what the Operator Interface (OPI) screens expect; older builds missed indicators or showed wrong time until
  update via bootloader/program, same family as Quartz.
- Forward vs reverse fiber: downstream chassis can show good timestamps while reverse-link status on
  the EVG is still wrong; uplink issues were tracked separately from forward delivery.
- Fans: EVT units in this build are effectively fully on or off; variable speed is limited by the
  installed parts. Noise and burn-in are normal operational considerations. One chassis exhibited one
  fan not spinning while the other operated (addressed as a hardware item).
- SMA bulkheads: if the connector body rotates while the nut is tightened, stop and use appropriate
  torque practice; keyed bulkheads are part of mechanical quality (report through vendor or laboratory
  quality channels as required).

Fiber port numbering (both families)
------------------------------------

Quartz and EVT share the same port role naming in vendor material: port 1 EVR in, port 2 fan-out in,
ports 3-8 fan-out outputs. Phoebus link or terminal widgets 1-8 line up with those physical ports. If
ports 1 and 2 appear inactive while 3 and above are active, verify **physical jumpers** on the panel
before attributing the behavior to the GUI.

How to interact: Phoebus, IOCs, and consoles
--------------------------------------------

Phoebus (CS-Studio)

- Home screen, then facility navigation. The event/timing area exposes ``Quartz #…`` and ``EVT #…``
  controls (exact layout depends on site OPI export; prototype racks used left/right groupings).
- Per chassis: fiber and multi-gigabit transceiver (MGT) link health, event logs, timestamps, and output configuration. Expert and
  sysmon views report optical power and link status.
- Network tab: IOC services, restart, and in some configurations telnet targets for shells. If OPI
  files on disk were updated, refresh the home screen (for example F5) to avoid a stale tree.
- Global: Virtual Private Network (VPN) and facility context. Event: timing and chassis detail.

IOC processes

- Quartz: ATF Quartz IOC host, ``st.cmd``-style bring-up per box.
- EVT: timing IOC host, systemd ``@`` templates, localhost telnet to the IOC shell port when
  the shell ``dbl`` (database list) command or other low-level checks are required and Channel Access (CA) behavior is unclear.

USB and debug

- MMC vs FPGA-debug USB serial: different cable, different port; see :doc:`quartz_firmware_usb` for
  Quartz. EVT debug consoles follow vendor docs; NTP/mode CLI overlaps Quartz where Osprey says it is
  the same family.

See also
--------

- :doc:`integration_reference` (stack-wide reference).
- :doc:`evt_chassis` (EVT checklist).
- :doc:`quartz_firmware` (Quartz procedures).
- :doc:`/cs_studio/index` (Phoebus tabs and boot).
