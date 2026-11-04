LED-triggered event sequence
============================

:doc:`All experiments <scenario_results>`.

Objective
---------

Test whether an observed LED flash can start an event sequence that both receivers record with consistent timing. CAM2 detects a dark-to-bright change; the generator sends code 42 followed by code 43, and the receivers log both.
This page documents the completed 1,000,000 ns reference trial. A different gap can be selected in the interface, but requires a new measurement.

Setup
-----

.. list-table::
   :header-rows: 1

   * - Component
     - Address / PV prefix
     - Settings used
   * - Generator
     - 10.139.5.196 / EVT:DEV2:20:
     - Release 20261017; 125 MHz clock; bank 1 in Normal mode. Timer and external-input trigger masks are disabled.
   * - Receivers
     - 10.139.5.195 / EVT:DEV2:10: and 10.139.5.198 / EVT:DEV2:40:
     - Logging slots 3 and 4 select codes 42 and 43. Timestamp resolution is 8 ns; neither code drives a pulse output.
   * - CAM2
     - 192.168.2.1 / CAM:DEV2:20:
     - Existing Line1-triggered stream at approximately 10 frames/s; 1 ms exposure; 1200 × 900 Mono12. Event-101 output on 10.139.5.197 is unchanged.
   * - LED detection
     - Breadboard LED connected to a DG645
     - Use columns 300–699 and rows 550–849, starting at zero. A peak above 1,000 counts is bright. The DG645 unit/output and camera-trigger cable endpoints remain unrecorded.
   * - Sequence
     - Codes 42, 43 and stop code 255
     - Offsets: 0, 1,000,000 and 1,001,000 ns. Code 255 ends the table without transmission. Accept 20 fresh dark-to-bright transitions.
   * - Recording
     - IOC host 10.139.4.59
     - The console saves receiver logs, camera metadata, lossless images and command/readback records under timing-check/console/runs/.

Procedure
---------

.. list-table::
   :header-rows: 1

   * - Stage
     - Method and check
   * - 1. Check and review
     - Confirm visible dark and bright LED states, valid receiver links/timestamps and no FIFO overflow. Save the controls and maps; verify that codes 42/43 and logging slots 3/4 are unused before reviewing the exact commands.
   * - 2. Configure and record
     - Load the listed table and logging selections, then start a 60 s lossless recording. Preserve event 101, pulse outputs, camera acquisition and DG645 settings.
   * - 3. Trigger and measure
     - Arm once and accept 20 fresh dark-to-bright frame pairs, issuing one software trigger per pair. Check each run-counter increment, including its 15-to-0 wrap, and match 40 events per receiver. Subtract the code-42 reception time from code 43 on each receiver.
   * - 4. Restore
     - Disarm and restore the saved controls and logging selections, including after a stop or timeout. Compare fresh controls and full maps with the original snapshot, then confirm receiver health.

Results
-------

Recording ``20261104T051638Z-3fd293`` completed all 20 LED-qualified sequences. Both receivers recorded the expected codes and order, and every qualifying dark/bright frame was checked against its original pixels.
The event gap below is measured between two receptions on the same receiver. Receiver difference compares the timestamps recorded by the two devices for the same event.

.. list-table::
   :header-rows: 1

   * - Measurement
     - Recorded result
   * - Qualified LED transitions
     - 20 of 20; all 40 source frames verified
   * - Events received
     - 40 of 40 on each receiver
   * - 42 → 43 gap, 10.139.5.195
     - Mean 1,000,000 ns; standard deviation 0 ns
   * - 42 → 43 gap, 10.139.5.198
     - Mean 1,000,000 ns; standard deviation 0 ns
   * - Receiver B minus A
     - Mean 0 ns; standard deviation 0 ns across 40 events
   * - Capture and restoration
     - 600 images saved; no frame-ID gaps or writer overruns. Original settings/maps restored and verified.

.. figure:: ../_static/timing-check/scenarios/led-qualified-images.png
   :alt: First and last qualifying LED frame pairs from the active trial, shown on the same intensity scale.
   :width: 100%

   First and last qualifying LED frame pairs from the active trial, shown on the same intensity scale.

.. figure:: ../_static/timing-check/scenarios/led-hardware-timing.svg
   :alt: Measured event intervals and receiver differences for all 20 cycles.
   :width: 100%

   Measured event intervals and receiver differences for all 20 cycles.

:download:`Cycle data <../_static/timing-check/scenarios/led-sequence-cycles.csv>` · :download:`Source evidence and checks <../_static/timing-check/scenarios/led-sequence-evidence.json>`.

.. raw:: html

   <details class="experiment-details"><summary>Software processing measurements</summary>

.. list-table::
   :header-rows: 1

   * - Host interval
     - Mean / standard deviation / range (ns)
   * - Detection → request
     - 3,267,748 / 336,534 / 2,668,934–3,777,316
   * - Detection → run-count confirmation
     - 60,032,252 / 2,669,866 / 57,292,733–70,288,531

.. figure:: ../_static/timing-check/scenarios/led-software-timing.svg
   :alt: Host processing intervals for the same 20 cycles; run-count confirmation includes IOC readback.
   :width: 100%

   Host processing intervals for the same 20 cycles; run-count confirmation includes IOC readback.

.. raw:: html

   </details>

.. raw:: html

   <details class="experiment-details"><summary>Hardware event records</summary>

.. list-table::
   :header-rows: 1

   * - Cycle
     - Code
     - 10.139.5.195 reported UTC
     - 10.139.5.198 reported UTC
     - B minus A (ns)
   * - 1
     - 42
     - 2026-11-04 05:16:38.966633888
     - 2026-11-04 05:16:38.966633888
     - 0
   * - 1
     - 43
     - 2026-11-04 05:16:38.967633888
     - 2026-11-04 05:16:38.967633888
     - 0
   * - 2
     - 42
     - 2026-11-04 05:16:39.158820376
     - 2026-11-04 05:16:39.158820376
     - 0
   * - 2
     - 43
     - 2026-11-04 05:16:39.159820376
     - 2026-11-04 05:16:39.159820376
     - 0
   * - 3
     - 42
     - 2026-11-04 05:16:39.348352232
     - 2026-11-04 05:16:39.348352232
     - 0
   * - 3
     - 43
     - 2026-11-04 05:16:39.349352232
     - 2026-11-04 05:16:39.349352232
     - 0
   * - 4
     - 42
     - 2026-11-04 05:16:39.552895544
     - 2026-11-04 05:16:39.552895544
     - 0
   * - 4
     - 43
     - 2026-11-04 05:16:39.553895544
     - 2026-11-04 05:16:39.553895544
     - 0
   * - 5
     - 42
     - 2026-11-04 05:16:39.755218008
     - 2026-11-04 05:16:39.755218008
     - 0
   * - 5
     - 43
     - 2026-11-04 05:16:39.756218008
     - 2026-11-04 05:16:39.756218008
     - 0
   * - 6
     - 42
     - 2026-11-04 05:16:39.959588328
     - 2026-11-04 05:16:39.959588328
     - 0
   * - 6
     - 43
     - 2026-11-04 05:16:39.960588328
     - 2026-11-04 05:16:39.960588328
     - 0
   * - 7
     - 42
     - 2026-11-04 05:16:40.153020392
     - 2026-11-04 05:16:40.153020392
     - 0
   * - 7
     - 43
     - 2026-11-04 05:16:40.154020392
     - 2026-11-04 05:16:40.154020392
     - 0
   * - 8
     - 42
     - 2026-11-04 05:16:40.354367904
     - 2026-11-04 05:16:40.354367904
     - 0
   * - 8
     - 43
     - 2026-11-04 05:16:40.355367904
     - 2026-11-04 05:16:40.355367904
     - 0
   * - 9
     - 42
     - 2026-11-04 05:16:40.555127976
     - 2026-11-04 05:16:40.555127976
     - 0
   * - 9
     - 43
     - 2026-11-04 05:16:40.556127976
     - 2026-11-04 05:16:40.556127976
     - 0
   * - 10
     - 42
     - 2026-11-04 05:16:40.759335544
     - 2026-11-04 05:16:40.759335544
     - 0
   * - 10
     - 43
     - 2026-11-04 05:16:40.760335544
     - 2026-11-04 05:16:40.760335544
     - 0
   * - 11
     - 42
     - 2026-11-04 05:16:40.954778488
     - 2026-11-04 05:16:40.954778488
     - 0
   * - 11
     - 43
     - 2026-11-04 05:16:40.955778488
     - 2026-11-04 05:16:40.955778488
     - 0
   * - 12
     - 42
     - 2026-11-04 05:16:41.154232616
     - 2026-11-04 05:16:41.154232616
     - 0
   * - 12
     - 43
     - 2026-11-04 05:16:41.155232616
     - 2026-11-04 05:16:41.155232616
     - 0
   * - 13
     - 42
     - 2026-11-04 05:16:41.360269496
     - 2026-11-04 05:16:41.360269496
     - 0
   * - 13
     - 43
     - 2026-11-04 05:16:41.361269496
     - 2026-11-04 05:16:41.361269496
     - 0
   * - 14
     - 42
     - 2026-11-04 05:16:41.556156816
     - 2026-11-04 05:16:41.556156816
     - 0
   * - 14
     - 43
     - 2026-11-04 05:16:41.557156816
     - 2026-11-04 05:16:41.557156816
     - 0
   * - 15
     - 42
     - 2026-11-04 05:16:41.749541040
     - 2026-11-04 05:16:41.749541040
     - 0
   * - 15
     - 43
     - 2026-11-04 05:16:41.750541040
     - 2026-11-04 05:16:41.750541040
     - 0
   * - 16
     - 42
     - 2026-11-04 05:16:41.954662184
     - 2026-11-04 05:16:41.954662184
     - 0
   * - 16
     - 43
     - 2026-11-04 05:16:41.955662184
     - 2026-11-04 05:16:41.955662184
     - 0
   * - 17
     - 42
     - 2026-11-04 05:16:42.156873456
     - 2026-11-04 05:16:42.156873456
     - 0
   * - 17
     - 43
     - 2026-11-04 05:16:42.157873456
     - 2026-11-04 05:16:42.157873456
     - 0
   * - 18
     - 42
     - 2026-11-04 05:16:42.357292208
     - 2026-11-04 05:16:42.357292208
     - 0
   * - 18
     - 43
     - 2026-11-04 05:16:42.358292208
     - 2026-11-04 05:16:42.358292208
     - 0
   * - 19
     - 42
     - 2026-11-04 05:16:42.550379248
     - 2026-11-04 05:16:42.550379248
     - 0
   * - 19
     - 43
     - 2026-11-04 05:16:42.551379248
     - 2026-11-04 05:16:42.551379248
     - 0
   * - 20
     - 42
     - 2026-11-04 05:16:42.756191064
     - 2026-11-04 05:16:42.756191064
     - 0
   * - 20
     - 43
     - 2026-11-04 05:16:42.757191064
     - 2026-11-04 05:16:42.757191064
     - 0

.. raw:: html

   </details>

.. raw:: html

   <details class="experiment-details"><summary>Optical qualification and host processing records</summary>

.. list-table::
   :header-rows: 1

   * - Cycle
     - Dark / bright frame ID
     - Dark / bright peak
     - Detected (host UTC)
     - Write started (host UTC)
     - Put returned (host UTC)
     - Detection → request (ns)
     - Detection → confirmation (ns)
   * - 1
     - 1679288 / 1679289
     - 180 / 4094
     - 2026-11-04 05:16:38.834113595
     - 2026-11-04 05:16:38.836785609
     - 2026-11-04 05:16:38.855467946
     - 2668934
     - 70288531
   * - 2
     - 1679290 / 1679291
     - 175 / 4094
     - 2026-11-04 05:16:39.037873968
     - 2026-11-04 05:16:39.040704702
     - 2026-11-04 05:16:39.047661092
     - 2829684
     - 57891383
   * - 3
     - 1679292 / 1679293
     - 174 / 4094
     - 2026-11-04 05:16:39.229785004
     - 2026-11-04 05:16:39.232561898
     - 2026-11-04 05:16:39.237196324
     - 2775824
     - 57367422
   * - 4
     - 1679294 / 1679295
     - 173 / 4094
     - 2026-11-04 05:16:39.430887312
     - 2026-11-04 05:16:39.434540958
     - 2026-11-04 05:16:39.441724358
     - 3652366
     - 59897747
   * - 5
     - 1679296 / 1679297
     - 175 / 4094
     - 2026-11-04 05:16:39.634501705
     - 2026-11-04 05:16:39.637974200
     - 2026-11-04 05:16:39.644053379
     - 3471105
     - 59816886
   * - 6
     - 1679298 / 1679299
     - 175 / 4094
     - 2026-11-04 05:16:39.838389728
     - 2026-11-04 05:16:39.841274862
     - 2026-11-04 05:16:39.848425732
     - 2883354
     - 59026075
   * - 7
     - 1679300 / 1679301
     - 176 / 4094
     - 2026-11-04 05:16:40.031433805
     - 2026-11-04 05:16:40.034497880
     - 2026-11-04 05:16:40.041888190
     - 3063115
     - 59385456
   * - 8
     - 1679302 / 1679303
     - 177 / 4094
     - 2026-11-04 05:16:40.233016235
     - 2026-11-04 05:16:40.235931959
     - 2026-11-04 05:16:40.243222310
     - 2914924
     - 59531615
   * - 9
     - 1679304 / 1679305
     - 171 / 4094
     - 2026-11-04 05:16:40.436555607
     - 2026-11-04 05:16:40.439654822
     - 2026-11-04 05:16:40.443954828
     - 3097775
     - 57292733
   * - 10
     - 1679306 / 1679307
     - 172 / 4094
     - 2026-11-04 05:16:40.637766476
     - 2026-11-04 05:16:40.640946351
     - 2026-11-04 05:16:40.648171291
     - 3178755
     - 61154488
   * - 11
     - 1679308 / 1679309
     - 174 / 4094
     - 2026-11-04 05:16:40.833167857
     - 2026-11-04 05:16:40.836448632
     - 2026-11-04 05:16:40.843613302
     - 3279495
     - 60337897
   * - 12
     - 1679310 / 1679311
     - 173 / 4094
     - 2026-11-04 05:16:41.033869725
     - 2026-11-04 05:16:41.037297060
     - 2026-11-04 05:16:41.043077428
     - 3426305
     - 59855186
   * - 13
     - 1679312 / 1679313
     - 178 / 4094
     - 2026-11-04 05:16:41.238579579
     - 2026-11-04 05:16:41.241860604
     - 2026-11-04 05:16:41.249109455
     - 3279255
     - 61858459
   * - 14
     - 1679314 / 1679315
     - 181 / 4094
     - 2026-11-04 05:16:41.434771081
     - 2026-11-04 05:16:41.438054716
     - 2026-11-04 05:16:41.444983156
     - 3282315
     - 61490179
   * - 15
     - 1679316 / 1679317
     - 186 / 4094
     - 2026-11-04 05:16:41.630567752
     - 2026-11-04 05:16:41.633847337
     - 2026-11-04 05:16:41.638372524
     - 3277795
     - 57765303
   * - 16
     - 1679318 / 1679319
     - 185 / 4094
     - 2026-11-04 05:16:41.832775533
     - 2026-11-04 05:16:41.836082798
     - 2026-11-04 05:16:41.843479458
     - 3306245
     - 60119536
   * - 17
     - 1679320 / 1679321
     - 183 / 4094
     - 2026-11-04 05:16:42.037688737
     - 2026-11-04 05:16:42.041367473
     - 2026-11-04 05:16:42.045681799
     - 3677585
     - 58001464
   * - 18
     - 1679322 / 1679323
     - 183 / 4094
     - 2026-11-04 05:16:42.235141591
     - 2026-11-04 05:16:42.238898166
     - 2026-11-04 05:16:42.246102617
     - 3754735
     - 60099796
   * - 19
     - 1679324 / 1679325
     - 186 / 4094
     - 2026-11-04 05:16:42.430003291
     - 2026-11-04 05:16:42.433762806
     - 2026-11-04 05:16:42.439177904
     - 3758085
     - 59470655
   * - 20
     - 1679326 / 1679327
     - 179 / 4094
     - 2026-11-04 05:16:42.634135954
     - 2026-11-04 05:16:42.637914259
     - 2026-11-04 05:16:42.644991040
     - 3777316
     - 59994236

.. raw:: html

   </details>

.. raw:: html

   <details class="experiment-details"><summary>Executed command log</summary><pre>Apply
   pvput -w 3 EVT:DEV2:10:EVR:LOG:evt3 42
   pvput -w 3 EVT:DEV2:10:EVR:LOG:evt4 43
   pvput -w 3 EVT:DEV2:40:EVR:LOG:evt3 42
   pvput -w 3 EVT:DEV2:40:EVR:LOG:evt4 43
   pvput -w 3 EVT:DEV2:20:EVG:SEQ:1:disarm 1
   pvput -w 3 EVT:DEV2:20:EVG:SEQ:1:HWrise 0
   pvput -w 3 EVT:DEV2:20:EVG:SEQ:1:HWfall 0
   pvput -w 3 EVT:DEV2:20:EVG:SEQ:1:Tmr 0
   pvput -w 3 EVT:DEV2:20:EVG:SEQ:1:tMode 1
   pvput -w 3 EVT:DEV2:20:EVG:SEQ:1:slo 1000000000
   pvput -w 3 EVT:DEV2:20:EVG:SEQ:1:codes &#x27;[42,43,255]&#x27;
   pvput -w 3 EVT:DEV2:20:EVG:SEQ:1:times &#x27;[0.0,1000000.0,1001000.0]&#x27;
   pvput -w 3 EVT:DEV2:20:EVG:SEQ:1:store 1

   Trigger: qualify each trig with a fresh dark-to-bright transition
   pvput -w 3 EVT:DEV2:20:EVG:SEQ:1:arm 1
   pvput -w 3 EVT:DEV2:20:EVG:SEQ:1:trig 1
   pvput -w 3 EVT:DEV2:20:EVG:SEQ:1:trig 1
   pvput -w 3 EVT:DEV2:20:EVG:SEQ:1:trig 1
   pvput -w 3 EVT:DEV2:20:EVG:SEQ:1:trig 1
   pvput -w 3 EVT:DEV2:20:EVG:SEQ:1:trig 1
   pvput -w 3 EVT:DEV2:20:EVG:SEQ:1:trig 1
   pvput -w 3 EVT:DEV2:20:EVG:SEQ:1:trig 1
   pvput -w 3 EVT:DEV2:20:EVG:SEQ:1:trig 1
   pvput -w 3 EVT:DEV2:20:EVG:SEQ:1:trig 1
   pvput -w 3 EVT:DEV2:20:EVG:SEQ:1:trig 1
   pvput -w 3 EVT:DEV2:20:EVG:SEQ:1:trig 1
   pvput -w 3 EVT:DEV2:20:EVG:SEQ:1:trig 1
   pvput -w 3 EVT:DEV2:20:EVG:SEQ:1:trig 1
   pvput -w 3 EVT:DEV2:20:EVG:SEQ:1:trig 1
   pvput -w 3 EVT:DEV2:20:EVG:SEQ:1:trig 1
   pvput -w 3 EVT:DEV2:20:EVG:SEQ:1:trig 1
   pvput -w 3 EVT:DEV2:20:EVG:SEQ:1:trig 1
   pvput -w 3 EVT:DEV2:20:EVG:SEQ:1:trig 1
   pvput -w 3 EVT:DEV2:20:EVG:SEQ:1:trig 1
   pvput -w 3 EVT:DEV2:20:EVG:SEQ:1:trig 1
   pvput -w 3 EVT:DEV2:20:EVG:SEQ:1:disarm 1

   Disarm
   pvput -w 3 EVT:DEV2:20:EVG:SEQ:1:disarm 1

   Restore
   pvput -w 3 EVT:DEV2:20:EVG:SEQ:1:disarm 1
   pvput -w 3 EVT:DEV2:20:EVG:SEQ:1:HWrise 0
   pvput -w 3 EVT:DEV2:20:EVG:SEQ:1:HWfall 0
   pvput -w 3 EVT:DEV2:20:EVG:SEQ:1:Tmr 0
   pvput -w 3 EVT:DEV2:20:EVG:SEQ:1:tMode 0
   pvput -w 3 EVT:DEV2:20:EVG:SEQ:1:slo 1000000000.0
   pvput -w 3 EVT:DEV2:20:EVG:SEQ:1:codes &#x27;[0]&#x27;
   pvput -w 3 EVT:DEV2:20:EVG:SEQ:1:times &#x27;[0.0]&#x27;
   pvput -w 3 EVT:DEV2:20:EVG:SEQ:1:store 1
   pvput -w 3 EVT:DEV2:10:EVR:LOG:evt3 0
   pvput -w 3 EVT:DEV2:10:EVR:LOG:evt4 0
   pvput -w 3 EVT:DEV2:40:EVR:LOG:evt3 0
   pvput -w 3 EVT:DEV2:40:EVR:LOG:evt4 0
   </pre></details>

Findings
--------

With a configured gap of 1,000,000 ns, the receivers measured means of 1,000,000 ns and 1,000,000 ns. Their timestamps agreed at 8 ns resolution. For CXFEL, this supports correlating the two devices’ event records at the tested setting.
After image detection, the host took 3.27 ms on average to begin the trigger request. This software interval is separate from the received event gap. Optical turn-on and physical transmit times were not measured, and event 43 was a sequencer follow-up rather than an EVR-controlled output pulse.
