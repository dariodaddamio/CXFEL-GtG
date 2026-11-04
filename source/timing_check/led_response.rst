LED-triggered event and receiver response
=========================================

:doc:`All experiments <scenario_results>`.

Objective
---------

Test whether a real LED flash can cause a timing event with an identified code, reach the intended receiver, and produce a measured response.
The result must connect the physical signal to the event record and the action that follows.

Setup
-----

The breadboard LED connects to a DG645. CAM2 is at 192.168.2.1; the event generator is at 10.139.5.196. Receivers 10.139.5.195 and 10.139.5.198 can record test event 42.
The DG645 unit and output, camera trigger cable and any light-detector input have not been identified. These connections must be recorded before the complete chain can be tested.

A read-only check found 16 EVG inputs with rising-edge and falling-edge event selections set to zero. No electrical input was assigned an event code.
The current configuration 5 detects a dark-to-bright change in CAM2 and then sends event 42 once through software. Both receivers are set to log that event. It does not yet produce a verified physical output action.
A camera image reports a sampled light state. To measure the optical transition and the downstream pulse, record a light-detector signal and the output edge on a common time base. An electrical LED-drive trace alone measures the drive, not the emitted light.

Procedure
---------

1. Identify and record the LED drive, light-detector or camera, timing input and receiver-output cable endpoints.
2. Connect the signals needed to measure the input and response on one time base. Record the instrument settings and measurement resolution.
3. Read the event maps and original settings. Select an unused test code and review the exact changes before writing any PV.
4. Record the LED signal, generated event identity, receiver timestamps and downstream response during the same trial.
5. Measure each available interval from the recorded signals. Leave an interval unmeasured if either endpoint is missing.
6. Restore the original controls and maps, then read them again to confirm restoration.

For the installed camera-based configuration, use a 1,000-count threshold in columns 300–699 and rows 550–849. A fresh dark frame must precede a fresh bright frame. A timeout sends no response event. The conditional command bundle is included below; it has not been executed.

Results
-------

No complete LED-to-event-to-output trial has been recorded. The existing receiver logs cannot supply missing optical, transmit or output-edge timestamps.
A separate read-only observation counted 10 rising edges and 10 falling edges on EVG input 1 over 10.084 seconds. Its event selections were zero and its cable source was unidentified. These counts do not timestamp individual edges or identify LED flashes.

.. list-table::
   :header-rows: 1

   * - Measurement point
     - Available evidence
   * - LED optical turn-on
     - No hardware edge timestamp recorded
   * - Light detection
     - Camera-based detection implemented; new trial not run
   * - Generated event
     - Code 42 proposed; no LED-triggered hardware record yet
   * - Event transmission
     - No hardware transmit timestamp exposed by the current IOC
   * - Event reception
     - Hardware receiver timestamps available; no LED-triggered trial yet
   * - Downstream physical action
     - No output edge measured

.. raw:: html

   <details class="experiment-details"><summary>Command log</summary>

Apply

.. code-block:: bash

   pvput -w 3 EVT:DEV2:30:EVR:OUT:1:source 0
   pvput -w 3 EVT:DEV2:20:EVG:TMR:1:divisor 125000000
   pvput -w 3 EVT:DEV2:30:EVR:OUT:1:delay 0.0
   pvput -w 3 EVT:DEV2:30:EVR:OUT:1:width 100000.0
   pvput -w 3 EVT:DEV2:30:EVR:OUT:1:source 1
   pvput -w 3 EVT:DEV2:10:EVR:LOG:evt3 42
   pvput -w 3 EVT:DEV2:40:EVR:LOG:evt3 42
   pvput -w 3 EVT:DEV2:20:EVG:SEQ:1:disarm 1
   pvput -w 3 EVT:DEV2:20:EVG:SEQ:1:HWrise 0
   pvput -w 3 EVT:DEV2:20:EVG:SEQ:1:HWfall 0
   pvput -w 3 EVT:DEV2:20:EVG:SEQ:1:Tmr 0
   pvput -w 3 EVT:DEV2:20:EVG:SEQ:1:tMode 0
   pvput -w 3 EVT:DEV2:20:EVG:SEQ:1:slo 1000000000
   pvput -w 3 EVT:DEV2:20:EVG:SEQ:1:codes '[42,255]'
   pvput -w 3 EVT:DEV2:20:EVG:SEQ:1:times '[0.0,1000.0]'
   pvput -w 3 EVT:DEV2:20:EVG:SEQ:1:store 1

Trigger

.. code-block:: bash

   pvput -w 3 EVT:DEV2:20:EVG:SEQ:1:arm 1
   pvput -w 3 EVT:DEV2:20:EVG:SEQ:1:trig 1

Disarm

.. code-block:: bash

   pvput -w 3 EVT:DEV2:20:EVG:SEQ:1:disarm 1

Restore

.. code-block:: bash

   pvput -w 3 EVT:DEV2:20:EVG:SEQ:1:disarm 1
   pvput -w 3 EVT:DEV2:20:EVG:SEQ:1:HWrise 0
   pvput -w 3 EVT:DEV2:20:EVG:SEQ:1:HWfall 0
   pvput -w 3 EVT:DEV2:20:EVG:SEQ:1:Tmr 0
   pvput -w 3 EVT:DEV2:20:EVG:SEQ:1:tMode 0
   pvput -w 3 EVT:DEV2:20:EVG:SEQ:1:slo 1000000000.0
   pvput -w 3 EVT:DEV2:20:EVG:SEQ:1:codes '[0]'
   pvput -w 3 EVT:DEV2:20:EVG:SEQ:1:times '[0.0]'
   pvput -w 3 EVT:DEV2:20:EVG:SEQ:1:store 1
   pvput -w 3 EVT:DEV2:10:EVR:LOG:evt3 0
   pvput -w 3 EVT:DEV2:40:EVR:LOG:evt3 0
   pvput -w 3 EVT:DEV2:30:EVR:OUT:1:source 0
   pvput -w 3 EVT:DEV2:20:EVG:TMR:1:divisor 12500000
   pvput -w 3 EVT:DEV2:30:EVR:OUT:1:delay 0.0
   pvput -w 3 EVT:DEV2:30:EVR:OUT:1:width 100000.0
   pvput -w 3 EVT:DEV2:30:EVR:OUT:1:source 1

.. raw:: html

   </details>

Findings
--------

This is the primary experiment, but the complete physical response remains unmeasured. The camera-based configuration can test a software response after image detection; it cannot establish nanosecond optical latency.
A real send-to-receive delay requires measured source and receiver endpoints on compatible time bases. A programmed delay, software put completion or sequencer counter is not a transmit timestamp.
