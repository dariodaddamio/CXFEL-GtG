.. _initial-bring-up:

Initial bring-up
================

This page is a single entry point for configuring Event Generator (EVG) and Event Receiver (EVR)
roles on Event Timing (EVT) and Quartz chassis, how those nodes connect on the fiber tree, what
signals can be applied, and where to read status and outputs in Phoebus and the Input/Output
Controller (IOC) layout.

Conceptual background is in :doc:`quartz_vs_evt_timing`. EVT checklist detail is in
:doc:`evt_chassis`. Quartz boot, Universal Serial Bus (USB), network, and Alluvium are in
:doc:`quartz_firmware`. Stack-wide integration is in :doc:`integration_reference`.

1. EVT chassis: EVG and EVR
---------------------------

**Roles.** In one timing island, one node is the EVG; the rest are EVRs (including Quartz when wired
as receivers). Role follows **wiring, jumpers, and firmware**, not the chassis model name alone.

**IOC path.** EVT uses the **lab timing IOC tree** (not the Quartz Acquisition Test Framework (ATF)
``st.cmd`` tree). EVG versus EVR is not selected by copying Quartz-only lines; instance IP and macros
identify the box; role matches hardware and firmware (:doc:`integration_reference`).

**EVG-style bring-up (EVT).**

- **Pulse Per Second (PPS)** on **input 1** in generator mode (that input is reserved for PPS). Must be
  **1 Hz**, not a kilohertz rate left from another test.
- **Network Time Protocol (NTP)** server Internet Protocol (IP), netmask, and gateway must match the
  laboratory Virtual Local Area Network (VLAN). Wrong values can look like cable or link faults.
- **Fiber:** minimal debug is power, one EVG with a **short jumper between ports 1 and 3** so the
  generator drives its own fan-out path, plus PPS present. Port roles: 1 EVR in, 2 fan-out in, 3–8
  fan-out outputs (:doc:`evt_chassis`).
- **Front panel:** Subminiature version A (SMA) inputs; Stanford Research Systems FS740–class sources
  are often Bayonet Neill–Concelman (BNC); BNC-to-SMA adapters are normal.

**EVR-style (EVT).** Receive the event stream from upstream fiber; no EVG jumper recipe on that
node—follow the rack diagram and Phoebus link widgets versus physical fibers.

2. Quartz chassis: EVG and EVR
-------------------------------

Quartz uses the **same fiber port numbering** as EVT (``Quartz #N`` link widgets 1–8). EVG versus
EVR-style behavior is set in **firmware** via NTP and PPS (:doc:`quartz_firmware_network`).

**EVG role (Quartz).**

- Configure a **valid NTP server** (for example the lab server used on control hosts).
- Provide **PPS Transistor-Transistor Logic (TTL)** input: 0–5 V, **1 Hz**, duty cycle under 50 %,
  rising edge at Global Positioning System (GPS) second.

**EVR-only role (Quartz).** When the chassis should **not** act as EVG, disable NTP on the Quartz
side (for example ``ntp 0.0.0.0`` in the application console—see :doc:`quartz_firmware_network`).

**IOC path.** Quartz Operator Interface (OPI) and ATF / Quartz IOC trees—not the timing IOC used for
EVT. When Quartz operates as an event generator, vendor startup files may load extra records; do not
assume one ``st.cmd`` line alone declares EVG role (:doc:`quartz_vs_evt_timing`).

3. Interconnecting EVT and Quartz
---------------------------------

- **Fiber:** Connect nodes per the **rack diagram**. Upstream fan-out outputs feed downstream **EVR
  in** (port 1) and **fan-out in** (port 2) where the tree design requires it. A minimal EVG uses
  jumper 1–3 and fibers to downstream chassis (:doc:`integration_reference`, :doc:`evt_chassis`).
- **Same island:** Multiple Quartz and EVT units may share one tree; each unit is still EVG or EVR by
  wiring and configuration.
- **Diagnostics:** Timestamps on receivers often mean the **forward** fiber path works; **reverse**
  link can still fail—debug forward and reverse separately (:doc:`evt_chassis`).

4. Possible inputs
------------------

**Electrical (EVT front, SMA unless noted).**

- **PPS** for EVG: input **1** only, **1 Hz** (FS740 BNC/TTL via adapter is typical).
- **Other experiment / trigger signals:** inputs **2–8** when not using them contrary to the lab
  plan; match Low-Voltage Transistor-Transistor Logic (LVTTL) vs TTL at loads.

**Electrical (Quartz).** Analog: DB37. Digital: DB9 on the back (see :doc:`quartz_vs_evt_timing`).
PPS for EVG mode follows the TTL rules in :doc:`quartz_firmware_network`.

**Network.** Correct IP, **/23 netmask** where the lab requires crossing ``10.139.4.x`` and
``10.139.5.x`` on Quartz; gateway ``10.139.4.1/23`` pattern in vendor notes
(:doc:`quartz_firmware_network`).

**Fiber.** LC ports 1–8 as above; align Phoebus widgets with **physical jumpers** before blaming the
GUI.

5. Where to see outputs and status
----------------------------------

**Phoebus (CS-Studio).** From :doc:`/cs_studio/boot_procedure`, open the **Event** tab
(:ref:`phoebus-event-tab`). Use **``EVT #N``** for EVT timing IOC screens (links, logs, sysmon) and
**``Quartz #N``** for Quartz. Link or terminal widgets **1–8** match back-panel fiber positions. The
Event tab page includes a **DG645** front-panel diagram; **Quartz** front and back panel diagrams are
in :doc:`quartz_firmware`.

**EVT.** **Expert / sysmon** for link health; **event / receive (RX) log** for event codes (for
example **125** for a simple scope check on the PPS-related path). **Slow widget scan rates** can
look stuck—check the widget rate. **Digital outputs:** scope on an output—Low-Voltage
Transistor-Transistor Logic (LVTTL), tens of microseconds per division for a slow train; **50 Ω**
scope input when edge fidelity matters (:doc:`evt_chassis`). A Siglent SDS1104X-E front-panel diagram is
on that page for quick lab orientation.

**Quartz.** Phoebus shows build/hash and EVG/EVR-related state; rely on Phoebus and IOC/console tools
when **Internet Control Message Protocol (ICMP) ping** to the application is inconclusive
(:doc:`quartz_firmware_network`).

**IOC boundaries.** Timing IOC for EVT; ATF/Quartz IOC for Quartz—see :doc:`integration_reference`.

See also
--------

:doc:`evt_chassis`, :doc:`quartz_firmware_network`, :doc:`quartz_vs_evt_timing`, :doc:`integration_reference`.
