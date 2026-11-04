Timing experiments
==================

Five experiments test event reception and sequence timing with firmware and IOC release 20261017. The LED experiment adds camera-qualified triggering; the other four isolate the sequencer functions. Each linked report contains its setup, procedure and source records.

.. list-table::
   :header-rows: 1

   * - Experiment
     - Function tested
     - Measured result
   * - :doc:`LED-triggered event sequence <led_response>`
     - Observed LED transition starts codes 42 and 43
     - 8 ns spacing over 20 cycles; 40/40 events on each receiver
   * - :doc:`Single-event reception <single_event>`
     - One event reaches two receivers
     - 1 of 1 on each; receiver difference 0 ns
   * - :doc:`Two-event spacing <event_pair>`
     - One trigger sends two events with a set interval
     - 1,000 ns gap on both receivers
   * - :doc:`Multiple event delays <multiple_delays>`
     - Receivers retain code order and different gaps
     - 1,000 ns and 9,000 ns gaps on both
   * - :doc:`Repeated sequence <repeated_sequence>`
     - Normal mode replays a table without rearming
     - 20 cycles without rearming; 40/40 events on each receiver

The separate :doc:`camera-rate trial <camera_response>` recorded 60 frames at 1 Hz but captured no bright LED. It is retained as an optical-capture limitation, rather than evidence of successful LED detection.

All measured event times come from saved receiver records. Receiver resolution is 8 ns. The IOC does not expose hardware transmit timestamps, so none of these records establishes the physical transmit-to-receive delay.

:download:`Measurement provenance <../_static/timing-check/scenarios/measured-experiments.json>` records the source file hashes and recomputed receiver measurements.

.. toctree::
   :hidden:

   led_response
   single_event
   event_pair
   multiple_delays
   repeated_sequence
   camera_response
