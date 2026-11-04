Timing experiments
==================

These experiments check the functions available with firmware and IOC release 20261017. Each page gives the setup, procedure, recorded results and findings.
The LED-response experiment is first because it tests a timing sequence started by an observed optical transition. The completed LED trial links 20 observed transitions to identified event sequences and independent receiver timestamps.

.. list-table::
   :header-rows: 1

   * - Experiment
     - What it establishes
     - Recorded status
   * - :doc:`LED-triggered event sequence <led_response>`
     - Observed LED transition starts codes 42 and 43
     - 20 LED-qualified sequences; 40 events on each receiver
   * - :doc:`Single-event reception <single_event>`
     - One event reaches two receivers
     - 1 of 1 on each; receiver difference 0 ns
   * - :doc:`Two-event spacing <event_pair>`
     - Two received events retain their configured gap
     - 1,000 ns gap on both receivers
   * - :doc:`Multiple event delays <multiple_delays>`
     - Receivers retain code order and different gaps
     - 1,000 ns and 9,000 ns gaps on both
   * - :doc:`Repeated sequence <repeated_sequence>`
     - Normal mode replays a table without rearming
     - 40 of 40 events on each receiver
   * - :doc:`Camera response to event rate <camera_response>`
     - Camera delivery and LED visibility at 1 Hz
     - 60 frames; no bright LED captured

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
