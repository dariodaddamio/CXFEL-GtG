.. role:: st-inuse
   :class: st st-inuse

.. role:: st-avoid
   :class: st st-avoid

.. role:: st-proposed
   :class: st st-proposed

.. role:: st-free
   :class: st st-free

.. rst-class:: event-code-guide

Event Code Review
=================

*Source and literature review, October 2026. The proposal it supports is on*
:doc:`index`.

This review draws on published timing-system designs, Osprey firmware and IOC
source at pinned revisions, the ASU Timing and DAQ Architecture document, and
group meeting transcripts from October 2025 to March 2026. It does not cover
current wiring or measured timing performance.

The Osprey findings were checked on 22 October 2026 against the latest public
source in each repository:

- ``timing-firmware``: ``trunk`` at ``bb977b8`` and the newer development
  branch `evg-update`_ at ``47ccb9c`` (14 October 2026).
- ``timing-ioc``: ``master`` at ``7ee1b02``.
- ``Quartz-firmware``: ``v1.x`` at ``fb6cfd7``, ``v1.x-software`` at
  ``36e943a`` and the `20250525 release tag`_.

The findings below hold on all of these revisions unless noted. The hardware is
assumed to run builds from this source; that has not been confirmed on the
devices.

.. _osprey-nsls-ii-and-the-cxfel-dictionary:

How an event code reaches a device
----------------------------------

The EVG broadcasts a continuous stream of timing words over fiber. Each EVR
watches the stream, and when a configured code arrives it fires a local output
after its own delay and pulse width. The code identifies the timing event; the
receiver's configuration decides what that event does at each device.

.. mermaid::
   :alt: One BEAM_SHOT event from the generator reaches the LLRF receiver, the detector receiver and the timing record, each applying its own delay.

   flowchart TD
       EVG["EVG sends BEAM_SHOT<br/>18 / 0x12"]
       EVG --> RF["LLRF receiver<br/>local delay and width"]
       EVG --> DET["Detector receiver<br/>local delay and width"]
       EVG --> LOG["Timing record<br/>to match acquired data"]

Because many receivers can respond to one code, the number of codes needed
tracks the number of distinct timing events, not the number of devices. Because
the same code repeats on every shot, the code alone does not identify an
individual shot.

.. _the-two-8-bit-channels:

The timing word
^^^^^^^^^^^^^^^

The word format follows the `MRF event-stream specification`_ and the
:doc:`NSLS-II timing design </internal/nsls2_timing_pdf>` (§§4.2.2–4.2.3): one
byte for the event code and one for distributed-bus signals or buffered data.
These 16 bits describe the logical frame, before 8b/10b line encoding. The
inspected Osprey `digital receiver`_ reads the two bytes as follows:

.. code-block:: text

   Bits 15–8                 Bits 7–0
   +------------------------+------------------------+
   | Event code: 8 bits     | Bus / data: 8 bits     |
   +------------------------+------------------------+

The receiver decodes the two bytes independently, so the event code space holds
256 values. The Quartz receiver on the ``v1.x`` branch reads the event code from
bits 7–0 instead (`Quartz receiver`_), but the receiver in the
`release tag <Quartz receiver, release tag_>`__ reads bits 15–8, matching the
digital receiver.

.. _all-256-values:

Which codes are already in use
------------------------------

In the `6 March 2026 · 29:01–31:25`_ meeting, the group estimated that about six
codes have fixed functions, named 125 as one of them, and recalled 20 to 30
machine events at NSLS-II. The source inspection finds more fixed values than
that estimate: compiled Quartz acquisition controls, a second protection-clear
code and sequencer control values.

Of the 256 values, 10 have an Osprey function, 12 should be avoided for
compatibility or because sources conflict, 5 are proposed for CXFEL and 229 are
free.

.. list-table:: Status labels
   :header-rows: 1
   :widths: 22 78

   * - Label
     - Meaning
   * - :st-inuse:`In use`
     - Has a function in the inspected Osprey source.
   * - :st-avoid:`Avoid`
     - An MRF convention, a compatibility reservation, or a value the sources
       disagree about.
   * - :st-proposed:`Proposed`
     - CXFEL discussion value. Not yet allocated.
   * - :st-free:`Free`
     - No meaning in any reviewed source. Each consumer still needs checking
       before the value is used.

.. list-table:: Event-code space, 0–255
   :header-rows: 1
   :widths: 14 18 46 22

   * - Code
     - Hex
     - Meaning
     - Status
   * - 0
     - ``0x00``
     - Null (idle)
     - :st-inuse:`In use`
   * - 1
     - ``0x01``
     - ``POST_MORTEM``
     - :st-proposed:`Proposed`
   * - 2–15
     - ``0x02–0x0F``
     - —
     - :st-free:`Free`
   * - 16–18
     - ``0x10–0x12``
     - ``CYCLE_START``, ``SHOT_PREPARE``, ``BEAM_SHOT``
     - :st-proposed:`Proposed`
   * - 19–79
     - ``0x13–0x4F``
     - —
     - :st-free:`Free`
   * - 80
     - ``0x50``
     - ``EXPERIMENT_REFERENCE``
     - :st-proposed:`Proposed`
   * - 81–95
     - ``0x51–0x5F``
     - —
     - :st-free:`Free`
   * - 96, 97
     - ``0x60``, ``0x61``
     - Quartz acquisition stop, start
     - :st-inuse:`In use`
   * - 98
     - ``0x62``
     - —
     - :st-free:`Free`
   * - 99
     - ``0x63``
     - Quartz protection clear
     - :st-inuse:`In use`
   * - 100–111
     - ``0x64–0x6F``
     - —
     - :st-free:`Free`
   * - 112, 113
     - ``0x70``, ``0x71``
     - Seconds bit 0, seconds bit 1
     - :st-inuse:`In use`
   * - 114–119
     - ``0x72–0x77``
     - User-defined under MRF; no Osprey decoder found
     - :st-avoid:`Avoid`
   * - 120
     - ``0x78``
     - Protection clear (digital EVR) [#pc]_
     - :st-inuse:`In use`
   * - 121
     - ``0x79``
     - Stop event log (MRF convention)
     - :st-avoid:`Avoid`
   * - 122
     - ``0x7A``
     - Heartbeat [#hb]_
     - :st-inuse:`In use`
   * - 123
     - ``0x7B``
     - Synchronize prescalers (MRF convention)
     - :st-avoid:`Avoid`
   * - 124
     - ``0x7C``
     - Timestamp counter increment (MRF convention) [#tc]_
     - :st-avoid:`Avoid`
   * - 125
     - ``0x7D``
     - PPS seconds marker
     - :st-inuse:`In use`
   * - 126
     - ``0x7E``
     - Beacon, protection clear or timer event; sources conflict [#b]_
     - :st-avoid:`Avoid`
   * - 127
     - ``0x7F``
     - End of sequence (MRF, NSLS-II) [#eos]_
     - :st-avoid:`Avoid`
   * - 128–253
     - ``0x80–0xFD``
     - — [#hi]_
     - :st-free:`Free`
   * - 254
     - ``0xFE``
     - Repeat constant, declared but not shown to work [#rp]_
     - :st-avoid:`Avoid`
   * - 255
     - ``0xFF``
     - End of sequence (Osprey sequencer control)
     - :st-inuse:`In use`

.. [#pc] The two protection-clear codes belong to different receivers. Quartz
   clears on 99 (`Quartz configuration`_), and the digital EVR clears on 120
   (`digital firmware`_). Both values are unchanged on every revision checked.
.. [#hb] The Osprey core generates the heartbeat. Receiver timeout behavior was
   not confirmed.
.. [#tc] The inspected Osprey receiver counts local clock ticks instead of
   responding to this code.
.. [#b] MRF defines 126 as the delay-compensation beacon. The Osprey IOC test
   script uses it for protection clear, and a meeting demonstration used it as a
   timer event. Whether it is free for a machine event depends on the installed
   image and its configuration.
.. [#eos] The inspected Osprey sequencer ends on 255, not 127. Keeping 127 free
   preserves compatibility with MRF tooling.
.. [#hi] Digital EVRs can use these codes, since their action table covers all
   256 values (`EVR action table`_). Quartz responds only to its configured
   start, stop and protection-clear codes, which must lie within 1–126 on both
   ``v1.x`` and the release tag (`receiver wiring`_).
.. [#rp] The ``trunk`` sequencer declares this constant, but its repeat
   behavior was not established. The ``evg-update`` branch removes it, so 254
   may become free once that branch is released.

Sources: `Quartz configuration`_, `digital firmware`_, `generator core`_,
`digital receiver`_, `Osprey sequencer`_, `IOC test script`_ and
`MRF conventions`_. Avoiding the whole 112–127 block is a compatibility
recommendation; Osprey itself does not assign all sixteen values.

.. _facility-event-codes:

Facilities agree on the timestamp codes
---------------------------------------

NSLS-II, APS, LCLS-I and Diamond all build their timing on MRF hardware or its
event-stream conventions. Osprey follows the same conventions but implements a
subset and adds its own application codes. The published allocations are
therefore precedents for CXFEL, not lists to adopt unchanged, and none of them is
a complete, current operational dictionary.

.. list-table:: Protocol codes across facilities
   :header-rows: 1
   :widths: 10 18 18 18 18 18

   * - Code
     - MRF
     - NSLS-II (2009)
     - APS (2025)
     - LCLS-I (2009–10)
     - Osprey (inspected)
   * - 0
     - Null
     - Null
     - —
     - —
     - Null
   * - 112
     - Seconds bit 0
     - Seconds bit 0
     - Seconds bit 0
     - Fiducial ID bit 0
     - Seconds bit 0
   * - 113
     - Seconds bit 1
     - Seconds bit 1
     - Seconds bit 1
     - Fiducial ID bit 1
     - Seconds bit 1
   * - 121
     - Stop event log
     - —
     - —
     - —
     - Not found
   * - 122
     - Heartbeat
     - Heartbeat
     - —
     - —
     - Heartbeat
   * - 123
     - Sync prescalers
     - Sync prescalers
     - —
     - —
     - Not found
   * - 124
     - Timestamp increment
     - Timestamp increment
     - —
     - —
     - Not used
   * - 125
     - Timestamp reset
     - Reset / latch timestamp
     - Reset subsecond counter
     - Latch and reset
     - PPS marker
   * - 126
     - Beacon
     - —
     - Beacon
     - —
     - Conflicting
   * - 127
     - End of sequence
     - End of sequence
     - —
     - —
     - Uses 255

Codes 112, 113 and 125 mean the same thing in every source, so any CXFEL
dictionary inherits them. A dash means the source does not list the code, not
that the facility leaves it unused.

Machine events, unlike protocol codes, are site-specific:

- **NSLS-II:** 15 (``0x0F``) is a Linac-cycle reference at about 1 Hz, derived
  from RF timing, according to the `17 October 2025 · 34:51–37:31`_ discussion.
  This is a recalled example, not a published allocation.
- **LCLS-I:** 67–98 (``0x43–0x62``) are experiment codes whose functions each
  experiment assigns. 140 (``0x8C``) marks a Linac shot and starts experiment
  software, but does not guarantee usable beam.
- **Diamond:** 32 (``0x20``) is the T-ZERO reference in both the Linac EVG and
  EVR records.
- **ESS:** RF Start, Beam Start and Beam End drive the modulator, LLRF and local
  protection acquisition. The paper does not give their numeric codes.
- **European XFEL:** data are associated through a facility-wide train ID, which
  identifies a particular train rather than serving as a fixed event code. No
  numeric allocation is published.

.. rubric:: Facility sources

- APS: `Fast Event System for the Advanced Photon Source`_, ICALEPCS 2025,
  pp. 838–839. Timestamp and delay-compensation codes only.
- NSLS-II: :doc:`Timing System Design for the NSLS-II </internal/nsls2_timing_pdf>`,
  J. DeLong, July 2009, p. 12. Reserved protocol codes only.
- LCLS-I: `Event Code Sequence User Manual, Rev. C`_, 27 April 2010, p. 6, and
  `LCLS timing interface ICD 1.1-528`_, 2009, pp. 3–4. These describe LCLS-I,
  not LCLS-II.
- Diamond: `Review of the Diamond Light Source Timing System`_, RuPAC 2010,
  slide 10. A single example, not a full allocation.
- ESS: `LLRF and Timing System Integration at ESS`_, ICALEPCS 2023, p. 1426.
- European XFEL: `Synchronization of commercial camera data at the European XFEL`_,
  NOBUGS 2022.

.. _osprey-support:

Why the shot number cannot travel with the event
------------------------------------------------

A shot ID, operating mode or destination sent alongside each event would make
data correlation straightforward. The inspected Osprey source does not provide
that path.

.. list-table:: What the inspected Osprey source supports
   :header-rows: 1
   :widths: 24 76

   * - Capability
     - Finding
   * - Events and timestamps
     - The digital receiver decodes 8-bit event codes. Its event FIFO stores
       each code with a timestamp, but no shot ID and no copy of the bus byte
       (`event FIFO`_).
   * - Distributed bus
     - The generator maps hardware inputs to bus bits, and the receiver
       reconstructs the bus separately from event decoding. Outputs can select
       the bus as a source (`generator`_, `digital receiver`_,
       `output controls`_). Nothing here ties a bus value to a particular event.
   * - Buffered data
     - The `generator core`_ contains a data-buffer transmitter, but the
       `application wrapper`_ disables buffer writes and sending, and the
       `receiver wrapper`_ ties buffer read data to zero. The ``evg-update``
       branch still disables buffer sending (`evg-update wrapper`_).
   * - Sequencer
     - The sequencer stores event codes and time gaps, with no data byte per
       entry (`Osprey sequencer`_).
   * - Quartz recording
     - The Quartz receiver leaves its distributed-bus output unconnected
       (`receiver wiring`_), and the release tag does the same. No path stores
       the bus byte alongside ADC samples.

Using the second byte as a shot-ID, mode or destination field would therefore
require new update, sampling and recording logic.

.. _timing-design-options:

.. _directions-to-compare:

Options in detail
^^^^^^^^^^^^^^^^^

.. list-table:: Allocation and context options
   :header-rows: 1
   :widths: 24 36 40

   * - Option
     - What it offers
     - What it requires
   * - Few shared cycle events
     - Many devices use one reference with local delays; the namespace stays
       small.
     - Common references that are sufficient for RF, lasers, diagnostics and
       experiments.
   * - Additional subsystem events
     - RF, laser or experiment sequences can run independently.
     - Occurrences that are genuinely scheduled independently, and values
       clear of firmware-owned codes.
   * - Context recorded separately
     - Keeps the inspected 8-bit interface. Suits triggers, event timestamps
       and run-level mode or destination records.
     - An explicit link from each record to its run or shot. Reading a PV
       asynchronously does not establish its state at a given shot. Loss
       detection and data joins must be built.
   * - Distributed-bus bits
     - A few persistent signals, where receivers expose them.
     - Defined bit assignments, sampling and validity rules, confirmed receiver
       support and a recording path. Quartz does not currently record these
       bits.
   * - Buffered metadata
     - Shot IDs or structured context delivered before the associated event.
     - Changes to Osprey firmware, IOC and recording, or hardware with working
       buffer functions; a specification for ordering, completion, integrity
       and shot association. Full MRF products support buffers
       (`MRF receiver data transfer`_), but compatibility with Osprey is
       unverified.
   * - Different protocol or hardware
     - A wider event field or a different message format.
     - Compatible generators, receivers and software, plus requalification of
       timing, timestamps and data association. Compatibility with the existing
       Quartz and MRF links is not established.

.. _questions-for-further-study:

Open questions
--------------

.. list-table:: Information needed to finalize the allocation
   :header-rows: 1
   :widths: 25 75

   * - Area
     - What is missing
   * - Equipment inventory
     - The full list of timing consumers with device IDs, rack locations and
       connections, including the referenced rack spreadsheet and the DG645
       AB/CD/EF/GH output assignments.
   * - Timing sequence
     - The complete shot sequence, with each device's lead time, pulse width,
       polarity and tolerance.
   * - Operating modes
     - What EVG beam-path selection means in operation, including destinations
       and reduced-rate or dark patterns.
   * - Data correlation
     - A working Eiger timestamp plugin, and the frame counters,
       accepted-trigger signals and ROENTek/SPECS tags available for detecting
       lost triggers or data.
   * - Installed implementation
     - Confirmation that the hardware runs builds from the referenced source,
       what code 126 does in the installed configuration, and how devices
       respond to loss of the timing link or PPS.
   * - Per-shot context
     - Which context changes between shots, and whether separate records, bus
       bits or buffered metadata can carry and record it.

Supporting evidence
-------------------

CXFEL timing requirements
^^^^^^^^^^^^^^^^^^^^^^^^^

Revision 1 of the :doc:`ASU Timing and DAQ Architecture
</internal/daq_architecture_pdf>`, from the supplied Dropbox material, names the
timing consumers below. It states requirements and proposed interfaces; it does
not establish current wiring or completed integration.

.. list-table:: Timing consumers in the architecture document
   :header-rows: 1
   :widths: 25 60 15

   * - Subsystem
     - Requirement
     - PDF page
   * - LLRF, modulators and LLRF gates
     - Beam-rate triggers from the EVG.
     - 2
   * - Beam-generation and high-power lasers
     - Beam-rate triggers from the EVG. Experiments are also named as consumers.
     - 2
   * - Quartz DAQ
     - An embedded EVR supplies acquisition triggers and timestamps;
       synchronized data stream to the IOC and server.
     - 7–8
   * - PXI LLRF
     - A receiver in the PXI crate provides timestamps and synchronization.
       Streaming, storage and monitoring were still to be demonstrated or
       defined.
     - 9
   * - Eiger
     - External hardware triggers, with EVR timestamps attached to detector
       frames through a planned IOC plugin. Frame loss, packet format and
       buffering are under evaluation.
     - 9–10
   * - ROENTek / SPECS
     - External triggers at 1 kHz image initiation, with a proposed TTL / ToF
       tagging path for subsecond correlation.
     - 11

The Eiger discussion considers streaming at up to 500 Hz, so not every detector
needs to run at 1 kHz. The document lists the DG645 as existing equipment but
gives no AB/CD/EF/GH cable assignments or operating delays.

.. raw:: html

   <details class="timing-design-notes" id="cxfel-meeting-records">
   <summary>Meeting records</summary>
   <div class="facility-codes-body">

The group meeting transcripts add dated implementation context. They record what
was said at the time and are not a current equipment inventory.

.. list-table:: Operating context from the meetings
   :header-rows: 1
   :widths: 30 70

   * - Record
     - Finding
   * - `17 October 2025 · 15:30`_
     - Subsystem teams submit event requirements, and engineering implements
       the events. No release-approval step is recorded.
   * - `20 November 2025 · 22:08–23:19`_
     - PXI development used a 1 kHz trigger and 400 samples per record. The
       stated maximum trigger rate was 1 kHz; larger records remained a test
       target.
   * - `27 February 2026 · 06:01–06:55`_
     - DG645 #1 belongs to the LLRF test setup; #2 and #3 are labelled EVG/EVR
       #1 and #2. Individual pulse-output assignments are not given.
   * - `13 March 2026 · 15:42–16:49`_
     - Two prototype racks, for CXFEL and CXLS, are described with EVT
       generators and Quartz receivers. The rack spreadsheet mentioned was not
       found in the supplied Dropbox CXFEL tree.

Times are elapsed meeting times. Links open the matching transcript passages;
recordings were not available.

.. raw:: html

   </div>
   </details>

.. _Fast Event System for the Advanced Photon Source: https://proceedings.jacow.org/icalepcs2025/pdf/WEBR001.pdf
.. _Event Code Sequence User Manual, Rev. C: https://www.slac.stanford.edu/grp/lcls/controls/global/sw/epics/app/Mpg/mpg-R2-5-1-2/documentation/EventCodeSequences/revisions/event_code_sequences_rev_c.pdf
.. _LCLS timing interface ICD 1.1-528: https://www-ssrl.slac.stanford.edu/lcls/PRD/1.1-528-r0.pdf
.. _Review of the Diamond Light Source Timing System: https://accelconf.web.cern.ch/r10/talks/wechb02_talk.pdf
.. _LLRF and Timing System Integration at ESS: https://accelconf.web.cern.ch/icalepcs2023/papers/thpdp051.pdf
.. _Synchronization of commercial camera data at the European XFEL: https://indico.psi.ch/event/12738/contributions/38944/
.. _Quartz configuration: https://github.com/osprey-dcs/Quartz-firmware/blob/36e943a6153a964a22e0a99fc16ecced9659627c/src/config.h#L83
.. _Osprey sequencer: https://github.com/osprey-dcs/timing-firmware/blob/bb977b8ca20fdad8b76548a9739a15899e98db72/ip_repo/ospreyEVG/hdl/ospreyEVGsequencer.v#L54
.. _MRF conventions: https://mrftiming.readthedocs.io/en/stable/hardware/event-system-intro.html#event-codes
.. _digital firmware: https://github.com/osprey-dcs/timing-firmware/blob/bb977b8ca20fdad8b76548a9739a15899e98db72/Workspace/EVG/src/config.h#L49
.. _IOC test script: https://github.com/osprey-dcs/timing-ioc/blob/7ee1b02c7116c17d63679cd26c5c3f46ea5a1732/scripts/mpsCheck.py#L25
.. _generator: https://github.com/osprey-dcs/timing-firmware/blob/bb977b8ca20fdad8b76548a9739a15899e98db72/ip_repo/ospreyEVG/hdl/ospreyEVG.v#L721
.. _receiver wiring: https://github.com/osprey-dcs/Quartz-firmware/blob/fb6cfd7def3a0ccc288a67507173bc248c3d6857/NASA_ACQ.srcs/sources_1/hdl/fiberLinks.v#L146
.. _digital receiver: https://github.com/osprey-dcs/timing-firmware/blob/bb977b8ca20fdad8b76548a9739a15899e98db72/ip_repo/ospreyEVR/hdl/tinyEVR.v#L147
.. _MRF event-stream specification: https://mrftiming.readthedocs.io/en/stable/hardware/event-system-intro.html#event-stream
.. _MRF receiver data transfer: https://mrftiming.readthedocs.io/en/stable/hardware/event-receiver.html#distributed-bus-and-data-transmission
.. _Quartz receiver: https://github.com/osprey-dcs/Quartz-firmware/blob/fb6cfd7def3a0ccc288a67507173bc248c3d6857/NASA_ACQ.srcs/sources_1/hdl/tinyEVR.v#L146
.. _Quartz receiver, release tag: https://github.com/osprey-dcs/Quartz-firmware/blob/78d576743b85c5747faf8ae053d77cc6dd35022c/NASA_ACQ.srcs/sources_1/hdl/tinyEVR.v#L147
.. _20250525 release tag: https://github.com/osprey-dcs/Quartz-firmware/tree/20250525
.. _evg-update: https://github.com/osprey-dcs/timing-firmware/tree/47ccb9c36f7aa060b08b296f1ef7a77593ddc7f4
.. _EVR action table: https://github.com/osprey-dcs/timing-firmware/blob/bb977b8ca20fdad8b76548a9739a15899e98db72/ip_repo/ospreyEVR/hdl/ospreyEVR.v#L255
.. _evg-update wrapper: https://github.com/osprey-dcs/timing-firmware/blob/47ccb9c36f7aa060b08b296f1ef7a77593ddc7f4/ip_repo/ospreyEVG/hdl/ospreyEVG.v#L810
.. _event FIFO: https://github.com/osprey-dcs/timing-firmware/blob/bb977b8ca20fdad8b76548a9739a15899e98db72/ip_repo/ospreyEVR/hdl/ospreyEVR.v#L342
.. _output controls: https://github.com/osprey-dcs/timing-ioc/blob/7ee1b02c7116c17d63679cd26c5c3f46ea5a1732/timingApp/Db/evr/perEVRoutputDriver.template#L31
.. _generator core: https://github.com/osprey-dcs/timing-firmware/blob/bb977b8ca20fdad8b76548a9739a15899e98db72/ip_repo/ospreyEVG/hdl/tinyEVG.v#L53
.. _application wrapper: https://github.com/osprey-dcs/timing-firmware/blob/bb977b8ca20fdad8b76548a9739a15899e98db72/ip_repo/ospreyEVG/hdl/ospreyEVG.v#L750
.. _receiver wrapper: https://github.com/osprey-dcs/timing-firmware/blob/bb977b8ca20fdad8b76548a9739a15899e98db72/ip_repo/ospreyEVR/hdl/ospreyEVR.v#L229
.. _17 October 2025 · 15:30: https://github.com/dariodaddamio/CXFEL-GtG/blob/50625191ff19ed56f68a5828eb084db2f8f17584/docx_extract/Oct%2017%202025.txt#L172
.. _20 November 2025 · 22:08–23:19: https://github.com/dariodaddamio/CXFEL-GtG/blob/50625191ff19ed56f68a5828eb084db2f8f17584/docx_extract/Nov%2020%202025.txt#L486
.. _27 February 2026 · 06:01–06:55: https://github.com/dariodaddamio/CXFEL-GtG/blob/50625191ff19ed56f68a5828eb084db2f8f17584/docx_extract/Feb%2027%202026.txt#L43
.. _13 March 2026 · 15:42–16:49: https://github.com/dariodaddamio/CXFEL-GtG/blob/50625191ff19ed56f68a5828eb084db2f8f17584/docx_extract/Mar%2013%202026.txt#L167
.. _6 March 2026 · 29:01–31:25: https://github.com/dariodaddamio/CXFEL-GtG/blob/50625191ff19ed56f68a5828eb084db2f8f17584/docx_extract/Mar%206%202026.txt#L369
.. _17 October 2025 · 34:51–37:31: https://github.com/dariodaddamio/CXFEL-GtG/blob/50625191ff19ed56f68a5828eb084db2f8f17584/docx_extract/Oct%2017%202025.txt#L517
