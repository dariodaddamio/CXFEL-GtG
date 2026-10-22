.. rst-class:: event-code-guide

Event Codes
===========

October 2026

This report examines event-code allocation for CXFEL using published timing-system
designs, Osprey firmware and IOC source code, and CXFEL architecture and meeting
records. The analysis addresses the relationship between equipment-defined
functions, facility timing events and data correlation.

The source revisions and document dates are identified with each finding.
Installed firmware versions, current wiring and measured timing performance have
not been verified. The numerical CXFEL assignments are illustrative and remain
subject to the requirements and implementation limits described below.

.. _the-two-8-bit-channels:

Timing-word format
------------------

The two-byte format comes from the `MRF event-stream specification`_: one byte
for event codes and one for distributed bus signals or data transfer. It is also
described in the :doc:`NSLS-II design </internal/nsls2_timing_pdf>`, §§4.2.2–4.2.3.
The 16 bits describe the logical frame, before 8b/10b link encoding.

The inspected Osprey `digital receiver`_ explicitly reads bits 15–8 as the event
code and bits 7–0 as bus data:

.. code-block:: text

   Bits 15–8                 Bits 7–0
   +------------------------+------------------------+
   | Event code: 8 bits     | Bus / data: 8 bits     |
   +------------------------+------------------------+

.. list-table:: Timing word
   :header-rows: 1
   :widths: 25 75

   * - Channel
     - Function
   * - Event code
     - Identifies a timing event, such as acquisition start or the PPS marker. Receivers use this value to select local actions.
   * - Bus / data
     - Carries distributed bus signals or buffered data bytes, according to the firmware implementation. It is processed separately from the event code.

The event-code field therefore contains 256 possible values. The separate bus
byte does not increase that range. The older `Quartz receiver`_ uses different
byte positions, so the diagram applies specifically to the inspected digital
timing implementation.

The role of the data channel in CXFEL has not been established. In particular,
the reviewed source does not demonstrate a complete per-shot metadata interface.

.. raw:: html

   <details class="timing-design-notes" id="osprey-support">
   <summary>Osprey support and limitations</summary>
   <div class="facility-codes-body">

The following findings apply to the pinned source revisions linked in the table.
Installed image versions and measured behavior have not been verified.

.. list-table:: Implementation evidence
   :header-rows: 1
   :widths: 24 76

   * - Capability
     - What the inspected source supports
   * - Events and timestamps
     - The digital receiver decodes 8-bit event codes. Its event FIFO stores the code and a timestamp, without a shot ID or a copy of the bus byte (`event FIFO`_).
   * - Distributed bus
     - The generator maps hardware inputs to bus bits. The receiver reconstructs the bus separately from event decoding; output controls include a bus source (`generator`_, `digital receiver`_, `output controls`_). This does not establish an atomic event-plus-payload message.
   * - Buffered data
     - The `generator core`_ includes a data-buffer transmitter, but its `application wrapper`_ disables buffer writes and sending. The `receiver wrapper`_ ties buffer read data to zero. The core's presence alone does not provide a usable metadata service.
   * - Sequence payload
     - The sequencer stores event codes and time gaps, not a data byte for each entry (`Osprey sequencer`_).
   * - Quartz recording
     - The shown Quartz receiver leaves the distributed-bus output unconnected (`receiver wiring`_). Storage of that byte alongside ADC samples has not been established.

These findings are insufficient to establish the second byte as a usable
shot-ID, mode or destination field. Such a use requires an update, sampling and
recording path that is absent from the evidence reviewed here.

.. raw:: html

   </div>
   </details>

.. raw:: html

   <details class="timing-design-notes" id="timing-design-options">
   <summary>Design options and consequences</summary>
   <div class="facility-codes-body">

.. list-table:: Options for CXFEL
   :header-rows: 1
   :widths: 25 35 40

   * - Approach
     - Suitable use
     - Consequence / work required
   * - 8-bit events with separately recorded context
     - Triggers, event timestamps and run-level mode/destination records.
     - Retains the inspected event interface. Context requires explicit association with a run or shot; an asynchronously read PV does not establish the state at that shot. Loss detection and data joins remain implementation requirements.
   * - Use distributed bus bits
     - A small set of persistent signals where receivers expose them.
     - Requires defined bit assignments, sampling and validity, confirmed receiver support and a recording path. The inspected Quartz path does not record these bits.
   * - Implement buffered metadata
     - Shot IDs or structured context delivered before the associated event.
     - Requires Osprey firmware/IOC and recording changes, or hardware exposing the required buffer functions. Ordering, completion, integrity and shot association require specification. Full MRF products document buffer support; compatibility with this implementation remains unverified (`MRF receiver data transfer`_).
   * - Revise the proposed code allocation
     - Different event categories or fewer shared references.
     - Retains the frame format while changing facility assignments. Existing firmware-owned codes and affected consumer mappings constrain the allocation.
   * - Change the protocol or timing hardware
     - Requirements that cannot fit the supported event and data interfaces.
     - A wider event field or different message format requires compatible generators, receivers and software, with renewed qualification of timing, timestamps and data association. Compatibility with existing Quartz/MRF links is not established.

The source review supports evaluating an eight-bit event dictionary as the
baseline interface. Shot correlation through the second byte remains dependent
on a complete transport and recording implementation. Applicability of the
format diagram and reserved-code table also depends on the installed firmware
matching the revisions examined in this report.

.. raw:: html

   </div>
   </details>

Event distribution
------------------

The event generator broadcasts a code. Each receiver maps that code to local
actions, with its own delay and pulse width. The code identifies the timing event;
the receiver configuration identifies the output.

.. mermaid::
   :alt: Proposed beam-shot event shared by LLRF, detector timing and a DAQ timing record.

   flowchart TD
       EVG["EVG sends BEAM_SHOT<br/>18 / 0x12"]
       EVG --> RF["LLRF receiver<br/>local delay and width"]
       EVG --> DET["Detector receiver<br/>local delay and width"]
       EVG --> LOG["Timing record<br/>to match acquired data"]

Actions needed *before* the beam use an earlier preparation reference.
The event code is reused on every shot; it does not identify an individual shot.

.. _osprey-nsls-ii-and-the-cxfel-dictionary:

Existing functions and facility-defined events
----------------------------------------------

A CXFEL event dictionary would contain equipment-defined Osprey functions
alongside facility-defined beamline events. Quartz acquisition controls,
timestamp codes and protection functions already occupy values in the reviewed
implementations. Additional beamline events would require allocations compatible
with those functions.

The NSLS-II material is an example of a facility event system built on MRF timing.
The Osprey implementation uses related event-stream and timestamp conventions,
but it implements a different subset and adds application-specific functions.
NSLS-II machine events therefore provide examples, rather than a second list of
codes that CXFEL must adopt unchanged.

In the `6 March 2026 · 29:01–31:25`_ discussion, code 125 is identified as fixed
function, most values are described as assignable, and roughly 20–30 events are
recalled for NSLS-II. The estimate of about six fixed-function codes is not a
complete firmware inventory. The later source inspection also finds compiled
Quartz controls, protection-clear differences and Osprey sequencer values.

The resulting code space comprises inherited functions, compatibility
reservations, site-defined events and unassigned values. Unassigned values
provide capacity for later requirements. The number of devices does not directly
determine the number of codes, because several receivers can respond to the same
event.

.. _all-256-values:

Event-code space
----------------

The table accounts for every value from 0 through 255. "Unassigned" means that
no meaning is selected in this outline; it does not certify that every installed
receiver can use the value. Compatibility reservations are distinguished from
confirmed Osprey functions.

.. list-table:: Complete 0–255 overview
   :header-rows: 1
   :widths: 12 16 35 37

   * - Decimal
     - Hex
     - Meaning in the reviewed material
     - Status for CXFEL
   * - 0
     - ``0x00``
     - Null / idle.
     - Osprey / protocol function.
   * - 1
     - ``0x01``
     - POST_MORTEM example.
     - CXFEL discussion value; not assigned.
   * - 2–15
     - ``0x02–0x0F``
     - No CXFEL assignment in this outline.
     - Unassigned; possible future use after firmware checks.
   * - 16–18
     - ``0x10–0x12``
     - CYCLE_START, SHOT_PREPARE and BEAM_SHOT examples.
     - CXFEL discussion values; not assigned.
   * - 19–79
     - ``0x13–0x4F``
     - No CXFEL assignment in this outline.
     - Unassigned; no fixed RF, laser or DAQ meaning is implied.
   * - 80
     - ``0x50``
     - EXPERIMENT_REFERENCE example.
     - CXFEL discussion value; not assigned.
   * - 81–95
     - ``0x51–0x5F``
     - No CXFEL assignment in this outline.
     - Unassigned.
   * - 96–97
     - ``0x60–0x61``
     - Quartz acquisition stop (96) and start (97).
     - Osprey application functions; retain their meanings for those images.
   * - 98
     - ``0x62``
     - No assignment found in the inspected definitions.
     - Unassigned, subject to the installed image.
   * - 99
     - ``0x63``
     - Quartz protection clear.
     - Osprey application function.
   * - 100–111
     - ``0x64–0x6F``
     - No assignment found in the inspected definitions.
     - Unassigned, subject to the installed image.
   * - 112–113
     - ``0x70–0x71``
     - Seconds bits: zero (112), one (113).
     - Osprey / MRF timestamp functions.
   * - 114–119
     - ``0x72–0x77``
     - MRF permits user-defined meanings; no special Osprey decoder was established here.
     - Compatibility reservation suggested for study; not a confirmed Osprey assignment.
   * - 120
     - ``0x78``
     - Protection clear in the inspected digital timing build.
     - Osprey application function; compare with installed firmware.
   * - 121
     - ``0x79``
     - MRF stop event log.
     - MRF convention; corresponding Osprey function not established.
   * - 122
     - ``0x7A``
     - Heartbeat.
     - Generation confirmed in the Osprey core; timeout behavior needs separate confirmation.
   * - 123
     - ``0x7B``
     - MRF synchronize prescalers.
     - MRF convention; corresponding Osprey function not established.
   * - 124
     - ``0x7C``
     - MRF timestamp-counter increment.
     - MRF convention; the inspected Osprey receiver counts local clock ticks.
   * - 125
     - ``0x7D``
     - PPS / seconds marker.
     - Osprey timestamp function, demonstrated in the meeting records.
   * - 126
     - ``0x7E``
     - MRF delay-compensation beacon; Osprey test script uses it for protection clear; meeting demo uses it as a timer event.
     - Conflicting uses across sources; availability for a machine event depends on the identified image and configuration.
   * - 127
     - ``0x7F``
     - MRF / NSLS-II end-of-sequence convention.
     - Compatibility reservation; the inspected Osprey sequencer ends on 255 instead.
   * - 128–253
     - ``0x80–0xFD``
     - No CXFEL assignment in this outline.
     - Unassigned; consumer support must be checked. The shown Quartz direct-strobe interface only exposes 1–126.
   * - 254
     - ``0xFE``
     - Repeat constant declared in Osprey sequencer source; repeat behavior not established.
     - Conservative reservation, not a confirmed working repeat instruction.
   * - 255
     - ``0xFF``
     - End-of-sequence instruction in the inspected Osprey sequencer.
     - Osprey control value; not a normal machine event.

Sources: `Quartz configuration`_, `digital firmware`_, `generator core`_,
`digital receiver`_, `Osprey sequencer`_, `IOC test script`_ and
`MRF conventions`_. The full 112–127 block is a possible compatibility reservation;
it is not a claim that Osprey assigns all sixteen values.

.. _cxfel-event-concepts-to-compare:

.. _illustrative-cxfel-event-allocation:

Example event-code assignments for CXFEL
----------------------------------------

Five example events are shown below. The reviewed records do not confirm these
assignments. Other codes remain unassigned because operating sequences, device
timing and existing firmware uses still need verification. Several devices may
share one event, using different local delays.

.. list-table:: Example CXFEL assignments
   :header-rows: 1
   :widths: 15 24 36 25

   * - Decimal / hex
     - Name
     - Definition
     - Application
   * - 16 / ``0x10``
     - ``CYCLE_START``
     - A scheduled timing slot begins, including a slot with no beam requested.
     - Cycle synchronization and data correlation.
   * - 17 / ``0x11``
     - ``SHOT_PREPARE``
     - An advance reference before the requested beam shot.
     - RF, modulator and laser timing ahead of beam arrival.
   * - 18 / ``0x12``
     - ``BEAM_SHOT``
     - The scheduled reference for a requested beam shot.
     - Beam-related triggers and data correlation; not confirmation of beam delivery.
   * - 80 / ``0x50``
     - ``EXPERIMENT_REFERENCE``
     - An independently scheduled experiment reference, including dark exposures.
     - Independent exposures and reduced-rate measurements.
   * - 1 / ``0x01``
     - ``POST_MORTEM``
     - A notification to capture fault-related data.
     - Fault recording; protection actuation is separate.

Still to establish: whether cycle start and shot preparation need separate events,
which devices can share the beam-shot reference, and how many experiment references
are needed.

Quartz uses 97/96 to start/stop acquisition. Matching its samples to shot times
is described as planned; implementation remains unconfirmed.

Documented CXFEL requirements
----------------------------------------

The :doc:`ASU Timing and DAQ Architecture, Revision 1
</internal/daq_architecture_pdf>`, available in the supplied Dropbox material,
identifies the following timing consumers. The document specifies requirements
and proposed interfaces; it does not establish current wiring or completed
integration.

.. list-table:: Requirements in the architecture document
   :header-rows: 1
   :widths: 25 60 15

   * - Subsystem
     - Documented timing requirement
     - PDF page
   * - LLRF, modulators and LLRF gates
     - Beam-rate triggers from the EVG.
     - 2
   * - Beam-generation and high-power lasers
     - Beam-rate triggers from the EVG; experiments are also named as consumers.
     - 2
   * - Quartz DAQ
     - Embedded EVR supplies acquisition triggers and timestamps; synchronized data are streamed to the IOC/server.
     - 7–8
   * - PXI LLRF
     - A receiver in the PXI crate provides timestamps and synchronization. Streaming, storage and monitoring were still to be demonstrated or defined.
     - 9
   * - Eiger
     - External hardware triggers, with EVR timestamps associated with detector frames through a planned IOC plugin. Frame loss, packet format and buffering remain under evaluation.
     - 9–10
   * - ROENTek / SPECS
     - External triggers; the notes specify 1 kHz image initiation and a proposed TTL / ToF tagging path for subsecond correlation.
     - 11

The Eiger discussion considers streaming up to 500 Hz; this is not evidence that
every detector must run at 1 kHz. The architecture identifies the DG645 as existing
equipment, but does not give its AB/CD/EF/GH cable assignments or operating delays.

.. raw:: html

   <details class="timing-design-notes" id="cxfel-meeting-records">
   <summary>Additional evidence from the meeting records</summary>
   <div class="facility-codes-body">

The guide's meeting transcripts provide dated implementation context in addition
to the Dropbox architecture. They are historical records, not a current equipment
inventory.

.. list-table:: Recorded operating context
   :header-rows: 1
   :widths: 30 70

   * - Record
     - Finding
   * - `17 October 2025 · 15:30`_
     - Subsystem teams submit event requirements; engineering implements the events. The recorded workflow does not specify a complete release-approval procedure.
   * - `20 November 2025 · 22:08–23:19`_
     - PXI development used a 1 kHz trigger and 400 samples per record. The stated maximum trigger-rate requirement was 1 kHz; larger records remained a test target.
   * - `27 February 2026 · 06:01–06:55`_
     - DG645 #1 is identified with the LLRF test setup; #2 and #3 are labelled EVG/EVR #1 and #2. Individual pulse-output assignments are not supplied.
   * - `13 March 2026 · 15:42–16:49`_
     - Two prototype racks, for CXFEL and CXLS, are described with EVT generators and Quartz receivers. A rack spreadsheet is referenced, but was not found in the supplied Dropbox CXFEL tree.

Times are elapsed meeting times from the available transcripts. Links open the
corresponding transcript passages; recording links were not available in the
reviewed material.

.. raw:: html

   </div>
   </details>

.. _questions-for-further-study:

Unresolved requirements
-----------------------

The reviewed material leaves six groups of requirements unresolved.

.. list-table:: Information required to evaluate an allocation
   :header-rows: 1
   :widths: 25 75

   * - Area
     - Evidence still required
   * - Equipment inventory
     - Additional timing consumers, device IDs, rack locations and connections; the referenced rack spreadsheet and DG645 AB/CD/EF/GH output assignments.
   * - Timing sequence
     - Device lead times, pulse widths, polarities and tolerances, together with the complete shot sequence and per-device settings.
   * - Operating modes
     - The operational meaning of EVG beam-path selection, including destinations and reduced-rate or dark patterns.
   * - Data correlation
     - Implementation and validation of the Eiger timestamp plugin; available frame counters, accepted-trigger signals and ROENTek/SPECS tags for detecting lost triggers or data.
   * - Installed implementation
     - Firmware and IOC versions, protection-clear behavior, and responses to timing-link or PPS loss.
   * - Per-shot context
     - Which context changes between shots, and whether separate records, distributed bus bits or buffered metadata can transport and record it adequately.

.. _directions-to-compare:

Allocation strategies
---------------------

.. list-table:: Allocation strategies and evaluation criteria
   :header-rows: 1
   :widths: 25 40 35

   * - Strategy
     - Potential advantage
     - Evaluation criterion
   * - Small set of shared cycle events
     - Many devices use the same reference with local delays; little namespace growth.
     - Sufficiency of common references for RF, lasers, diagnostics and experiments.
   * - Additional subsystem events
     - RF, laser or experiment sequences can operate independently where required.
     - Presence of independently scheduled occurrences requiring distinct event meanings.
   * - Events plus synchronized metadata
     - Shot identity, mode, destination and pattern can be associated with the timing reference.
     - Availability of the required transport and recording path in the installed implementation, or the extent of firmware, software or hardware changes required.

These strategies are compatible with one another. Their applicability depends
on consumer requirements, timing precision, operating patterns, receiver
capabilities and data-correlation requirements. The transport alternatives and
implementation limits are assessed in the preceding source review.

Facility event codes
--------------------

The following references document selected facility assignments and protocol
functions. Each example is identified by its publication date and scope; none
provides a complete current operational dictionary for direct adoption by CXFEL.

.. raw:: html

   <details class="facility-codes" id="aps-codes">
   <summary>APS / Argonne — 2025</summary>
   <div class="facility-codes-body">

Published timestamp and delay-compensation codes. The paper does not provide a complete machine-event allocation.

.. list-table::
   :header-rows: 1
   :widths: 15 20 65

   * - Decimal
     - Hex
     - Function
   * - 112
     - ``0x70``
     - Shift a zero into the seconds register.
   * - 113
     - ``0x71``
     - Shift a one into the seconds register.
   * - 125
     - ``0x7D``
     - Reset the subsecond timestamp counter.
   * - 126
     - ``0x7E``
     - Beacon used for delay compensation.

Reference: `Fast Event System for the Advanced Photon Source <https://proceedings.jacow.org/icalepcs2025/pdf/WEBR001.pdf>`_, ICALEPCS 2025, pp. 838–839.

.. raw:: html

   </div>
   </details>

.. raw:: html

   <details class="facility-codes" id="nsls-codes">
   <summary>NSLS-II — 2009 design</summary>
   <div class="facility-codes-body">

Reserved codes from the timing-system design. These are protocol functions, not a complete list of machine triggers.

.. list-table::
   :header-rows: 1
   :widths: 15 20 65

   * - Decimal
     - Hex
     - Function
   * - 0
     - ``0x00``
     - Null event.
   * - 112
     - ``0x70``
     - Seconds bit: zero.
   * - 113
     - ``0x71``
     - Seconds bit: one.
   * - 122
     - ``0x7A``
     - Heartbeat.
   * - 123
     - ``0x7B``
     - Synchronize prescalers.
   * - 124
     - ``0x7C``
     - Increment the timestamp counter.
   * - 125
     - ``0x7D``
     - Reset / latch the timestamp.
   * - 127
     - ``0x7F``
     - End of sequence.

Reference: :doc:`Timing System Design for the NSLS-II </internal/nsls2_timing_pdf>`, Joe DeLong, July 2009, p. 12.

The `17 October 2025 · 34:51–37:31`_ discussion also identifies **15 (0x0F)**
as an NSLS-II Linac-cycle reference at approximately 1 Hz, derived from the RF
timing. This is a site-specific example from the meeting, not an Osprey-reserved
value or a complete current NSLS-II dictionary.

.. raw:: html

   </div>
   </details>

.. raw:: html

   <details class="facility-codes" id="lcls-codes">
   <summary>SLAC / LCLS-I — 2009–2010</summary>
   <div class="facility-codes-body">

The experiment sequencer reserves a block of codes for user sequences. A separate code marks a Linac shot.

.. list-table::
   :header-rows: 1
   :widths: 15 20 65

   * - Decimal
     - Hex
     - Function
   * - 67–98
     - ``0x43–0x62``
     - Experiment event codes; functions are assigned by the experiment.
   * - 140
     - ``0x8C``
     - Linac-shot marker; also a start marker for experiment software.
   * - 112
     - ``0x70``
     - Shift a zero for fiducial-ID distribution.
   * - 113
     - ``0x71``
     - Shift a one for fiducial-ID distribution.
   * - 125
     - ``0x7D``
     - Latch the shifted value and reset the timestamp counter.

References: `Event Code Sequence User Manual, Revision C <https://www.slac.stanford.edu/grp/lcls/controls/global/sw/epics/app/Mpg/mpg-R2-5-1-2/documentation/EventCodeSequences/revisions/event_code_sequences_rev_c.pdf>`_, 27 April 2010, p. 6; `LCLS timing interface ICD 1.1-528 <https://www-ssrl.slac.stanford.edu/lcls/PRD/1.1-528-r0.pdf>`_, 2009, pp. 3–4. Code 140 does not guarantee usable beam. These references describe LCLS-I, not LCLS-II.

.. raw:: html

   </div>
   </details>

.. raw:: html

   <details class="facility-codes" id="diamond-codes">
   <summary>Diamond Light Source — 2010</summary>
   <div class="facility-codes-body">

The published EPICS example assigns the same reference event to generator and receiver records.

.. list-table::
   :header-rows: 1
   :widths: 15 20 65

   * - Decimal
     - Hex
     - Function
   * - 32
     - ``0x20``
     - T-ZERO reference in the Linac EVG and EVR records.

Reference: `Review of the Diamond Light Source Timing System — presentation <https://accelconf.web.cern.ch/r10/talks/wechb02_talk.pdf>`_, RuPAC 2010, slide 10. This is a documented example; the presentation does not provide a complete numeric allocation.

.. raw:: html

   </div>
   </details>

.. raw:: html

   <details class="facility-codes" id="ess-codes">
   <summary>ESS — 2023</summary>
   <div class="facility-codes-body">

The LLRF integration paper names the events below but does not give their numeric codes.

.. list-table::
   :header-rows: 1
   :widths: 15 20 65

   * - Decimal
     - Hex
     - Function
   * - Not specified
     - —
     - RF Start: starts the modulator, LLRF and local protection-system acquisition.
   * - Not specified
     - —
     - Beam Start: beam-envelope marker for LLRF.
   * - Not specified
     - —
     - Beam End: beam-envelope marker for LLRF.

Reference: `LLRF and Timing System Integration at ESS <https://accelconf.web.cern.ch/icalepcs2023/papers/thpdp051.pdf>`_, ICALEPCS 2023, p. 1426. Numeric assignments require a facility event dictionary.

.. raw:: html

   </div>
   </details>

.. raw:: html

   <details class="facility-codes" id="xfel-codes">
   <summary>European XFEL — 2022</summary>
   <div class="facility-codes-body">

The reviewed camera-integration reference uses a facility-wide train ID to associate data. It does not publish a numeric event-code allocation. A train ID identifies a particular train; it is not a fixed event code.

Reference: `Synchronization of commercial camera data at the European XFEL <https://indico.psi.ch/event/12738/contributions/38944/>`_, NOBUGS 2022. A numeric event dictionary is required for a code-by-code comparison.

.. raw:: html

   </div>
   </details>

.. _APS / Argonne: https://proceedings.jacow.org/icalepcs2025/pdf/WEBR001.pdf
.. _Diamond: https://accelconf.web.cern.ch/r10/papers/wechb02.pdf
.. _LCLS-I: https://www-ssrl.slac.stanford.edu/lcls/PRD/1.1-528-r0.pdf
.. _European XFEL: https://indico.psi.ch/event/12738/contributions/38944/
.. _ESS: https://accelconf.web.cern.ch/icalepcs2023/papers/thpdp051.pdf
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
