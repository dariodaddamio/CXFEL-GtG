.. rst-class:: event-code-guide

Event Codes
===========

*Proposal, October 2026. The evidence behind it is in the* :doc:`review`.

.. toctree::
   :hidden:

   review

Proposal
--------

We should give each subsystem its own block of 16 codes, because teams already
submit their event requirements to engineering (`17 October 2025`_) and a block
tells them where their codes will land. Aligning blocks to 16 also means the
first hex digit identifies the subsystem in logs and IOC settings. LCLS-I did
something similar for its experiment codes.

.. list-table:: Proposed block layout
   :header-rows: 1
   :widths: 14 18 30 38

   * - Codes
     - Hex
     - Block
     - Contents
   * - 0
     - ``0x00``
     - Null
     - Used by Osprey.
   * - 1–15
     - ``0x01–0x0F``
     - Global and fault
     - 1 ``POST_MORTEM``
   * - 16–31
     - ``0x10–0x1F``
     - Machine cycle
     - 16 ``CYCLE_START``, 17 ``SHOT_PREPARE``, 18 ``BEAM_SHOT``
   * - 32–47
     - ``0x20–0x2F``
     - RF and LLRF
     - Empty until requested.
   * - 48–63
     - ``0x30–0x3F``
     - Lasers
     - Empty until requested.
   * - 64–79
     - ``0x40–0x4F``
     - Diagnostics and DAQ
     - Empty until requested.
   * - 80–95
     - ``0x50–0x5F``
     - Experiments
     - 80 ``EXPERIMENT_REFERENCE``
   * - 96–111
     - ``0x60–0x6F``
     - Osprey application
     - Quartz uses 96, 97 and 99.
   * - 112–127
     - ``0x70–0x7F``
     - Timing protocol
     - Osprey uses 112, 113, 120, 122 and 125; MRF defines most of the rest.
   * - 128–239
     - ``0x80–0xEF``
     - Future subsystems
     - Seven empty blocks.
   * - 240–253
     - ``0xF0–0xFD``
     - Spare
     - Unassigned.
   * - 254–255
     - ``0xFE–0xFF``
     - Sequencer control
     - Used by the Osprey sequencer.

We should stay out of 96–127 even where codes are unused, because Osprey may
add application codes there and MRF tooling expects its protocol meanings. The
upper blocks are usable because digital EVRs can map any of the 256 codes
(`EVR action table`_). Quartz only listens for its own three codes, so the layout
doesn't affect it.

We should start with the five events from our meetings and add more only when a
subsystem needs its own timing, because one event can drive any number of
receivers, each with its own delay and pulse width.

.. list-table:: First five events
   :header-rows: 1
   :widths: 14 28 58

   * - Code
     - Name
     - Meaning
   * - 16
     - ``CYCLE_START``
     - Start of a scheduled timing slot, whether or not beam is requested.
   * - 17
     - ``SHOT_PREPARE``
     - Advance warning for RF, modulators and lasers before a requested shot.
   * - 18
     - ``BEAM_SHOT``
     - Reference time for a requested shot. It doesn't confirm beam was
       delivered.
   * - 80
     - ``EXPERIMENT_REFERENCE``
     - Experiment timing that runs independently of the beam, including dark
       exposures.
   * - 1
     - ``POST_MORTEM``
     - Tells devices to save fault data. Protection itself stays on its own
       path.

These numbers are provisional until we know the device lead times, since those
decide whether one ``SHOT_PREPARE`` is enough or RF and the lasers each need
their own.

We should record shot ID, mode and destination in separate timestamped records,
because the current firmware can't send them in the timing word.

Alternatives
------------

.. list-table::
   :header-rows: 1
   :widths: 30 18 52

   * - Alternative
     - Status
     - Reason
   * - Copy another facility's list
     - Not pursued
     - No facility we looked at publishes a complete, current list, and Osprey
       uses codes that theirs don't.
   * - Shot context on distributed-bus bits
     - Not pursued
     - Quartz leaves the bus output unconnected, so nothing would record it.
   * - Shot ID in the timing stream (buffered data)
     - Later option
     - Osprey has buffered data switched off, so this needs firmware, IOC and
       recording work. Worth it only if shot context changes often.
   * - New protocol or timing hardware
     - Not pursued
     - Would mean requalifying generators, receivers and software.

Resources
---------

- Osprey source (`timing-firmware`_, `timing-ioc`_, `Quartz-firmware`_), latest
  revisions as of 22 October 2026, including the ``evg-update`` branch.
- MRF event-system documentation.
- ASU Timing and DAQ Architecture, Revision 1.
- Published allocations from NSLS-II, APS, LCLS-I, Diamond, ESS and European
  XFEL.
- Our meeting transcripts, October 2025 to March 2026.

.. _brief-needed:

Still needed
------------

.. list-table::
   :header-rows: 1
   :widths: 34 40 26

   * - Information
     - What it decides
     - Source
   * - Device lead times and the full shot sequence
     - Whether one ``SHOT_PREPARE`` covers every device.
     - Source needed: subsystem teams.
   * - A CXLS event list
     - CXLS is a similar system, so we should match its codes where we can.
       We don't know of a list.
     - Source needed.
   * - Confirmation that the hardware runs the referenced builds
     - Whether the codes used in the source are the codes used on the devices,
       and what 126 does in the installed configuration.
     - Source needed: whoever flashes the boards.
   * - Which context changes from shot to shot
     - Whether separate records are enough.
     - Source needed: subsystem and DAQ teams.

.. _EVR action table: https://github.com/osprey-dcs/timing-firmware/blob/bb977b8ca20fdad8b76548a9739a15899e98db72/ip_repo/ospreyEVR/hdl/ospreyEVR.v#L255
.. _timing-firmware: https://github.com/osprey-dcs/timing-firmware
.. _timing-ioc: https://github.com/osprey-dcs/timing-ioc
.. _Quartz-firmware: https://github.com/osprey-dcs/Quartz-firmware
.. _17 October 2025: https://github.com/dariodaddamio/CXFEL-GtG/blob/50625191ff19ed56f68a5828eb084db2f8f17584/docx_extract/Oct%2017%202025.txt#L172
