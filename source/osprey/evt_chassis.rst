EVT chassis
===========

This page summarizes Event Timing (EVT) chassis behavior: digital event timing (fiber, event codes,
Event Generator (EVG) and Event Receiver (EVR) roles, triggers). Quartz covers analog acquisition; see
:doc:`quartz_firmware`. Top-level orientation is in :doc:`index`.

A fuller Quartz-versus-EVT discussion and laboratory notes are in :doc:`quartz_vs_evt_timing`.
Stack-wide integration is in :doc:`integration_reference`.

Fiber ports (eight Lucent Connector (LC) ports, back of chassis)
----------------------------------------------------------------

Same layout idea as Quartz:

.. list-table::
   :widths: 22 78
   :header-rows: 1

   * - Port role (label)
     - Role in the timing tree
   * - 1 EVR in
     - Receive path from upstream (toward this chassis as EVR).
   * - 2 Fan-out in
     - Fan-in for the return / merge side of the tree.
   * - 3-8 Fan-out outputs
     - Fan the event stream to downstream EVT/Quartz nodes; EVG setups often use a short jumper
       between ports 1 and 3 so the generator also drives its own fan-out port.

Phoebus link widgets numbered 1-8 line up with these physical positions. If 1 and 2 look unused while
3+ are active, compare to jumpers on the real hardware before chasing software.

.. list-table::
   :widths: 18 41 41
   :header-rows: 1

   * - Role
     - Quartz
     - EVT
   * - Primary function
     - Analog acquisition (many channels).
     - Event stream over fiber; EVG/EVR; digital outputs.
   * - Phoebus
     - ``Quartz #N``
     - ``EVT #N`` (timing Input/Output Controller (IOC): links, logs, sysmon)

Typically one EVG per timing island; remaining nodes are EVRs (with Quartz present according to
wiring). Confirm against Phoebus and the rack diagram. Phoebus: :doc:`/cs_studio/boot_procedure`,
Event tab (:ref:`phoebus-event-tab`).

UI tips: Expert/sysmon for links; event/receive (RX) log for codes (for example 125 for a simple oscilloscope check).
Slow input-state scan rates can look stuck; check the widget rate before re-cabling.

.. _evt-fiber-debug:

Debug and bring-up
------------------

Timestamps on receivers usually mean the forward fiber path from the EVG works. Reverse link can still
fail; debug fibers separately. Universal Serial Bus (USB) console can look alive when Ethernet is down; test the switch port
with a known-good cable or chassis.

Subminiature version A (SMA) connectors and fans: mechanical follow-ups with vendor or lab, not a firmware tweak by themselves.

DB37 harness: if the rack uses one, match the laboratory drawing; incorrect pins often appear as
faulty General Purpose Input/Output (GPIO) or trigger behavior.

Checklist
---------

#. Timing IOC for EVT lives in the lab timing IOC tree (not the Quartz/ATF Quartz IOC). EVT instances
   are not configured by copying Quartz ``st.cmd`` EVG-only lines; IP and macros select the box;
   EVG vs EVR follows wiring and firmware (see :doc:`integration_reference`).
#. Pulse Per Second (PPS) to the EVG on input 1 in generator mode (that input is reserved for PPS). Confirm the source is
   1 Hz, not a kHz rate left over from another test. EVT fronts are SMA; Bayonet Neill–Concelman (BNC)-to-SMA adapters are
   normal when driving from Stanford Research Systems FS740–style BNC outputs.
#. Network Time Protocol (NTP) server IP, netmask, and gateway must match the laboratory Virtual Local Area Network (VLAN). Wrong mask or gateway has shown up as
   flaky link, Ethernet physical layer (PHY) resets, and misreads on Phoebus. Re-check after flash erase/program because network
   fields may reset with the application image.
#. Fiber per rack diagram; minimal debug is power, one EVG with 1-3 jumper, one fiber to a downstream
   chassis, PPS present.
#. Ethernet to the lab switch; verify port or cable with another chassis if the link is flaky.
#. Mode EVG vs EVR per Osprey docs and multi-gigabit transceiver (MGT) / link pages.
#. Oscilloscope on a digital output: DC coupling, threshold suited to Low-Voltage Transistor-Transistor Logic (LVTTL) (about 3 V high in vendor demos),
   tens of µs per division for a slow pulse train; use 50 Ω scope input when edge fidelity is required.

See also: :doc:`timestamping_detectors`, :doc:`quartz_firmware`.
