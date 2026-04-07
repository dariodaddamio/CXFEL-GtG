Timestamps and detectors
========================

The design remains under development. The objective is to correlate timing-side timestamps (Event
Timing (EVT) path) with detector metadata (readout time, frame index, vendor fields), rather than
relying on a single timestamp from the camera.

This documentation does not replace the areaDetector EPICS module or vendor manuals. For laboratory
wiring, Input/Output Controllers (IOCs), and EVT context in relation to this topic, see
:doc:`integration_reference`.

Architecture
------------

- At 1 kHz (or the relevant machine rate), every timing tick should be joinable to image rows after
  camera server ingest, with metadata that records which trigger or counter fired.

- Historical pattern (storage-ring style): a crate that held both a frame grabber and an Event Receiver (EVR) so one IOC
  saw pixels and timestamps together. With Gigabit Ethernet (GigE) cameras, pixels and timing may enter different Network Interface Cards (NICs);
  the association then must be designed in software (same host, or a defined merge with latency
  bounds).

- Hosts that run areaDetector (or successors) may need a reliable path to timing process variables (PVs) or timestamp
  streams, not only the camera’s own vendor timestamp field.

Eiger (ZeroMQ / ZMQ)
--------------------

- Timestamps and metadata can arrive on a ZMQ interface; work in progress is to add real EVT triggers
  and record which event code or counter goes with each exposure.

- Buffer depth is not arbitrary: size buffers to expected network and processing latency so frames are
  not dropped while pulse trains from the timing system remain correlatable.

Allied Vision / GigE
--------------------

- Pixels ride the camera Ethernet. Triggers often come from EVT or Quartz digital outputs. Allied
  Vision can be debugged in parallel with Eiger: prove trigger and timestamp on a simple target (scope,
  LED) before chasing detector-specific edge cases.

1D / digitizer class
--------------------

- Same pattern as other triggered devices: bursts and windows are per device; timing still requires a
  shared notion of event index or counter when matching to machine events.

Link health on receivers
------------------------

See :ref:`evt-fiber-debug` in :doc:`evt_chassis`. Good timestamps on a downstream receiver usually
indicate that the forward fiber from the EVG is healthy; reverse-link indicators may still be wrong
independently.

See also: :doc:`integration_reference`, :doc:`evt_chassis`, :doc:`quartz_firmware`, :doc:`index`.
