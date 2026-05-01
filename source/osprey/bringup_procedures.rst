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

   - This provides IP addresses, device-specific, and desired layout information.

#. Identify the hardware in front of you, and refer to:

   - Digital chassis front/back panel diagrams
   - Quartz chassis front/back panel diagrams
   - DG645 and scope front panel diagrams (if used for validation)
   - Any other relevant diagrams in the diagram index: :doc:`/diagram_index`.

#. Decide which single chassis is going to be the EVG.

   - Usually static between testing and application, but can be changed if needed.
   - In testing, we may have siloed EVG for CXFEL and CXLS (each being connected to their own NTP server).
   - This is determined by the rack map and fiber map provided by Alex Gardeck or Mark Holl.

#. Confirm PPS source is connected and set to 1 Hz (not kHz).

   - Run coaxial cable from the FS740 (or lab PPS output) to the EVG candidate:

     - Digital chassis: BNC-to-SMA adapter to front-panel input 1 (SMA).

     - Quartz chassis: wire directly to front-panel PPS TTL path.

   - Verify 1 Hz on a scope at the cable before the chassis input, then at the chassis connector.

#. Confirm Phoebus opens and the target IOC host is reachable.

   - This can be done by pinging the IP address of the IOC host through the command line of a ``cxfeldev`` terminal.
   
   - Pinging can only be done if the chassis is in "GOLD" mode. 
        
     - Find out what this means here: :doc:`quartz_firmware_boot`.

#. If anything is unclear physically (which connector or which port), stop and verify against the
   diagrams before applying signals, or ask Alex Gardeck or Mark Holl for assistance.

.. _bringup-digital:

1. Digital chassis
---------------------------------

Digital chassis are operated from the **timing IOC tree** (not Quartz ATF ``st.cmd`` startup paths).
Assume **Preflight** is complete.

.. _bringup-digital-evg:

**EVG Role Bring-Up**

#. **Open the EVG candidate in controls.**

   - Physical: use the EVG chassis selected in Preflight.
   - CXFEL dev: from Home screen, open **Event** tab (:ref:`phoebus-event-tab`) and open that
     chassis as ``EVT #N``.
   - Pass: chassis is reachable and status widgets update.

#. **Re-check Preflight items only if behavior is unstable.**

   - Physical: PPS remains on **input 1** at **1 Hz**.
   - CXFEL dev: if needed, re-check IP/netmask/gateway/NTP in controls/console.
   - Pass: no obvious Preflight regressions before fiber troubleshooting.

#. **Create the EVG self-loop baseline first.**

   - Physical: install LC jumper **port 1 to port 3** on the EVG candidate only.
   - CXFEL dev: on ``EVT #N``, verify link widgets/indicators for ports **1..8** map to the
     same physical back-panel numbering (see :doc:`evt_chassis`).
   - Pass: expected link state appears for the 1-to-3 baseline and mode/readback is consistent
     with EVG operation.

#. **Validate logs before adding any receivers.**

   - Physical: keep only the baseline loop while validating.
   - CXFEL dev: open event/RX diagnostics on the same ``EVT #N`` screen and verify expected
     activity (for example event code 125 during PPS-tied checks).
   - Pass: logs are active and stable (not intermittent/noisy fault flapping).

#. **Scale after baseline is stable.**

   - Physical: add one downstream fiber connection at a time.
   - CXFEL dev: after each added cable, confirm new link state and logs before adding next.
   - Pass: current step remains stable before proceeding (see :ref:`bringup-interconnect`).

**If Digital EVG is unstable**, check in order: PPS at input 1 and 1 Hz, network fields, 1–3 jumper,
fiber polarity/path, then Phoebus widget mapping versus physical ports.

.. _bringup-digital-evr:

**EVR Role Bring-Up**

#. **Connect EVR input path.**

   - Physical: connect upstream fiber to **port 1 (EVR in)** per the rack/fiber map.
   - CXFEL dev: open that chassis in Event tab as ``EVT #N``.
   - Pass: receive/link indicators show expected lock/activity for port 1 path.

#. **Keep EVR wiring distinct from EVG wiring.**

   - Physical: ensure **no** 1-to-3 EVG jumper exists on EVR-only chassis.
   - CXFEL dev: confirm mode/readback is EVR behavior, not EVG baseline configuration.
   - Pass: no accidental EVG-style self-loop on receiver nodes.

#. **Gate progression on per-node verification.**

   - Physical: add next EVR only after current EVR is confirmed.
   - CXFEL dev: verify receive state plus event/RX logs on current node.
   - Pass: stable receive/log behavior before proceeding.

.. _bringup-quartz:

2. Quartz chassis
------------------------------

Assume **Preflight** is complete (including PPS path appropriate for Quartz). Quartz uses the same
back-panel fiber numbering as Digital chassis (widgets/ports 1–8). EVG versus EVR-style behavior is set
in firmware via NTP and PPS—follow :doc:`quartz_firmware_network` and :doc:`quartz_firmware` instead of
duplicating console recipes here.

.. _bringup-quartz-evg:

**EVG Role Bring-Up**

#. **Establish Quartz EVG baseline (after Preflight).**

   - Physical: apply EVG-side fiber path per map.
   - CXFEL dev: in Quartz controls/IOC tools, verify EVG-relevant status
     per :doc:`quartz_firmware_network`.
   - Pass: EVG baseline is stable before any fan-out.

#. **Scale incrementally.**

   - Physical: add one receiver fiber path at a time.
   - CXFEL dev: verify status after each addition.
   - Pass: each added receiver remains stable before next step.

.. _bringup-quartz-evr:

**EVR Role Bring-Up**
When Quartz must not act as EVG, use EVR-only configuration (for
example ``ntp 0.0.0.0`` in the app console; see :doc:`quartz_firmware_network`).

Quartz uses Quartz OPI and ATF / Quartz IOC trees—not the timing IOC used for Digital chassis.

.. _bringup-interconnect:

3. Interconnecting Digital and Quartz chassis
---------------------------------------------

Assume **Preflight** rack/fiber maps are current.

#. **Patch strictly from map and keep changes atomic.**

   - Physical: add **one** receiver at a time.
   - CXFEL dev: immediately verify only that one new endpoint.
   - Pass: clear per-step state transition (avoids multi-fault ambiguity).

#. **Evaluate forward and reverse paths separately.**

   - Physical: keep current cabling unchanged while diagnosing.
   - CXFEL dev: after each addition, check forward link health, reverse link health, and event/log
     reception.
   - Pass: if forward is healthy but reverse is not, classify as separate reverse-path fault
     (:doc:`evt_chassis`) and do not mask it by adding more nodes.

#. **Only advance on stability.**

   - Physical: no additional patching until current node is stable.
   - CXFEL dev: logs and link indicators remain stable over observation interval.
   - Pass: stable current node before next interconnect.

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

- **Home and tab orientation:** use :doc:`/cs_studio/boot_procedure` and :doc:`/cs_studio/tabs/index`
  for the CXFEL home view and tab map (including Global/Event examples).
- **Digital chassis status:** in Event tab (:ref:`phoebus-event-tab`), open ``EVT #N`` for timing IOC
  screens (link widgets, expert/sysmon, event/RX logs). Widgets **1–8** match **back-panel** LC ports
  (:doc:`evt_chassis`).
- **Quartz chassis status:** open ``Quartz #N`` in the Event area; hardware/firmware context in
  :doc:`quartz_firmware`.
- **Scope / DG645 cross-checks:** wiring and panel references in :doc:`/diagram_index` and
  :doc:`/cs_studio/tabs/index`.

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
