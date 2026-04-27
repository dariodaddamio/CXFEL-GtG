.. _bringup-procedures:

Bring-Up Procedures
===================


Recall:

- Conceptual background is in :doc:`quartz_vs_evt_timing`
- Digital chassis hardware and port roles are in :doc:`evt_chassis`
- Quartz chassis detail is in :doc:`quartz_firmware`
- Stack-wide integration is in :doc:`integration_reference`

Preflight
---------------------------

#. If available, refer to the rack map and fiber map provided by Alex Gardeck or Mark Holl.

   - This provides IP addresses, device-specific, and layout information.

#. Identify the exact hardware in front of you:

   - Digital chassis front/back panel diagrams
   - Quartz chassis front/back panel diagrams
   - DG645 and scope front panel diagrams (if used for validation)

   Diagram index: :doc:`/diagram_index`.

#. Decide which single chassis is going to be the EVG.

   - Usually static between testing and application, but can be changed if needed.
   - In testing, we may have siloed EVG for CXFEL and CXLS (each being connected to their own NTP server)

#. Confirm PPS source is connected and set to 1 Hz (not kHz).

   - Run coaxial cable from the FS740 (or lab PPS output) to the EVG candidate:

     - Digital chassis: BNC-to-SMA adapter to front-panel input 1 (SMA).

     - Quartz chassis: wire directly to front-panel PPS TTL path.

   - Verify 1 Hz on a scope at the cable before the chassis input, then at the chassis connector.

#. Confirm Phoebus opens and the target IOC host is reachable.

   - This can be done by pinging the IP address of the IOC host through the command line of a ``cxfeldev`` terminal.

#. If anything is unclear physically (which connector or which port), stop and verify against the
   diagrams before applying signals.

.. _bringup-digital:

1. Digital chassis
---------------------------------

Digital chassis are operated from the **timing IOC tree** (not Quartz ATF ``st.cmd`` startup paths).
Assume **Preflight** is complete.

.. _bringup-digital-evg:

**EVG Role Bring-Up**

#. **Network identity on the Digital console/OPI** (if not already persisted): IP, netmask, gateway,
   NTP server. Wrong netmask/gateway can look like fiber or link faults.
#. **Fiber self-test path:** install LC jumper **port 1 to port 3** on the Digital EVG candidate
   (minimal fan-out loop). Port roles: :doc:`evt_chassis`.
#. **Phoebus:** open the **Event** tab (:ref:`phoebus-event-tab`). The timing screen for Digital is
   still labeled ``EVT #N`` in CS-Studio; treat that button as **Digital chassis #N**.
#. **Verify** link widgets 1–8 match the physical LC ports you patched (including the 1–3 jumper).
#. **Logs:** open event / RX log and confirm activity (for example event code 125 during PPS checks).
#. **Scale only after stable:** add Digital or Quartz receivers one at a time (see
   :ref:`bringup-interconnect`).

**If Digital EVG is unstable**, check in order: PPS at input 1 and 1 Hz, network fields, 1–3 jumper,
fiber polarity/path, then Phoebus widget mapping versus physical ports.

.. _bringup-digital-evr:

**EVR Role Bring-Up**

#. Upstream fiber to **port 1 (EVR in)** per rack/fiber map.
#. **No** EVG 1–3 jumper on EVR-only nodes.
#. In Phoebus, open the same ``EVT #N`` screen for that chassis; confirm receive/link state and logs
   before adding another receiver.

.. _bringup-quartz:

2. Quartz chassis
------------------------------

Assume **Preflight** is complete (including PPS path appropriate for Quartz). Quartz uses the same
back-panel fiber numbering as Digital chassis (widgets/ports 1–8). EVG versus EVR-style behavior is set
in firmware via NTP and PPS—follow :doc:`quartz_firmware_network` and :doc:`quartz_firmware` instead of
duplicating console recipes here.

.. _bringup-quartz-evg:

**EVG Role Bring-Up**

#. NTP server, PPS TTL (0–5 V) at 1 Hz, and network fields per vendor/lab notes
   (:doc:`quartz_firmware_network`).
#. Confirm status in Quartz Phoebus/IOC tools before adding receivers.
#. Expand one receiver at a time after the Quartz EVG path is stable.

.. _bringup-quartz-evr:

**EVR Role Bring-Up**
When Quartz must not act as EVG, use EVR-only configuration (for
example ``ntp 0.0.0.0`` in the app console; see :doc:`quartz_firmware_network`).

Quartz uses Quartz OPI and ATF / Quartz IOC trees—not the timing IOC used for Digital chassis.

.. _bringup-interconnect:

3. Interconnecting Digital and Quartz chassis
---------------------------------------------

Assume **Preflight** rack/fiber maps are current.

#. Patch strictly from the map; add **one** receiver at a time.
#. After each addition: check forward link health, reverse link health, and event reception/log
   activity. If forward is healthy and reverse is not, treat reverse as a separate fault path
   (:doc:`evt_chassis`).
#. Do not proceed to the next node until the current node is stable.

.. _bringup-inputs:

4. Inputs and signals (reference only)
--------------------------------------

Preflight already covers **PPS path and 1 Hz check**. For everything else, use:

- Digital front-panel electrical inputs (SMA): :doc:`evt_chassis` and the Digital front diagram in
  :doc:`/diagram_index`.
- Quartz analog/digital connectors and PPS rules: :doc:`quartz_vs_evt_timing` and
  :doc:`quartz_firmware_network`.
- Network command patterns (NTP, gateway, netmask) vary by firmware build—use the console help text
  on the chassis you are holding.

.. _bringup-status:

5. Where to read status (after Preflight)
-----------------------------------------

Phoebus path is already confirmed in **Preflight**. For observation:

- **Digital chassis:** from :doc:`/cs_studio/boot_procedure`, **Event** tab (:ref:`phoebus-event-tab`),
  open ``EVT #N`` (CS-Studio label) for timing IOC screens—link widgets, expert/sysmon, event/RX logs.
  Widgets **1–8** match **back-panel** LC ports (:doc:`evt_chassis`).
- **Quartz chassis:** ``Quartz #N`` in the same Event area; diagrams in :doc:`quartz_firmware`.
- **Scope / DG645:** diagrams in :doc:`/diagram_index` and :doc:`/cs_studio/tabs/index`.

**IOC boundaries:** timing IOC for Digital chassis; ATF/Quartz IOC for Quartz
(:doc:`integration_reference`).

Minimum acceptance before scaling
-----------------------------------

Do not move to full rack until all are true:

#. EVG has stable PPS at 1 Hz (Preflight + scope).
#. NTP/gateway/netmask/IP are confirmed and persisted for the EVG candidate.
#. One EVR shows stable receive/link status.
#. Event/RX logs show expected activity.
#. Scope check confirms expected output behavior where applicable.

See also
--------

:doc:`evt_chassis`, :doc:`quartz_firmware_network`, :doc:`quartz_vs_evt_timing`, :doc:`integration_reference`.
