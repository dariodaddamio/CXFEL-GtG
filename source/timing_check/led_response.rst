LED-triggered event sequence
============================

Objective
---------

This experiment checks whether camera detection of an LED flash can start a two-event sequence that both receivers record with consistent timing. The measured interval separates the received events; it does not measure the response from physical LED turn-on.

.. image:: ../_static/timing-check/scenarios/led-experiment-path.svg
   :alt: Camera-qualified trigger path and the definition of the measured interval.
   :width: 100%

Recorded demonstration
----------------------

The video shows the actual command review, 10-second acquisition and restoration. Its total length includes these steps; camera previews are sampled independently from the lossless image recording.

.. raw:: html

   <video controls playsinline preload="metadata" style="width:100%;max-height:640px" poster="../_static/timing-check/scenarios/led-demo-poster.png">
     <source src="../_static/timing-check/scenarios/led-demo-10s.mp4" type="video/mp4">
     <a href="../_static/timing-check/scenarios/led-demo-10s.mp4">Open the experiment recording</a>
   </video>

Results
-------

The source images and raw receiver records were checked independently for recording ``20261104T073310Z-044488``. The acquisition lasted 10 seconds.

.. list-table::
   :header-rows: 1

   * - Measurement
     - Recorded result
   * - Qualified LED transitions
     - 20 of 20; all 40 source frames verified
   * - Events received
     - 40 of 40 on each receiver
   * - Time between events, 10.139.5.195
     - Mean 8 ns; standard deviation 0 ns
   * - Time between events, 10.139.5.198
     - Mean 8 ns; standard deviation 0 ns
   * - Receiver B minus A
     - Mean 0 ns; standard deviation 0 ns across 40 events
   * - Capture and restoration
     - 100 images saved; no frame-ID gaps or writer overruns. Original settings/maps restored and verified.

.. figure:: ../_static/timing-check/scenarios/led-qualified-images.png
   :alt: A common intensity scale preserves the contrast used to qualify the first and last cycles; no brightness adjustment was applied to individual panels.
   :width: 100%

   A common intensity scale preserves the contrast used to qualify the first and last cycles; no brightness adjustment was applied to individual panels.

.. figure:: ../_static/timing-check/scenarios/led-hardware-timing.svg
   :alt: The vertical tick spacing is one hardware clock period, so variation below a tick cannot be resolved.
   :width: 100%

   The vertical tick spacing is one hardware clock period, so variation below a tick cannot be resolved.

:download:`Cycle data <../_static/timing-check/scenarios/led-sequence-cycles.csv>` · :download:`Source evidence and checks <../_static/timing-check/scenarios/led-sequence-evidence.json>`.

Setup
-----

.. list-table::
   :header-rows: 1

   * - Component
     - Address / PV prefix
     - Settings used
   * - Generator
     - 10.139.5.196 / EVT:DEV2:20:
     - Release 20261017; 125 MHz clock; sequencer bank 1 in Normal mode. Timer and external-input triggers are disabled.
   * - Receivers
     - 10.139.5.195 / EVT:DEV2:10: and 10.139.5.198 / EVT:DEV2:40:
     - Spare logging slots 3 and 4 select events 42 and 43. Each timestamp tick is 8 ns; neither event drives a physical output.
   * - Camera
     - 192.168.2.1 / CAM:DEV2:20:
     - CAM2 uses its existing Line1-triggered stream at approximately 10 frames/s, with a 1 ms exposure and 1200 × 900 Mono12 images.
   * - LED
     - Breadboard connected to a DG645
     - Detect the peak in columns 300–699 and rows 550–849, starting at zero. A value above 1,000 counts is bright. The exact DG645 output and cable endpoints remain unrecorded.
   * - Sequence
     - Events 42, 43 and stop code 255
     - Offsets are 0, 8 and 1,008 ns. Stop code 255 is not transmitted. The camera-qualified trigger limit is 20.
   * - Acquisition
     - Host 10.139.4.59
     - 10 seconds of receiver logs, camera metadata and lossless images, with settings and restoration records saved on the acquisition device.

Procedure
---------

.. list-table::
   :header-rows: 1

   * - Stage
     - Method and verification
   * - 1. Establish the starting state
     - Confirm that CAM2 shows both LED states, both receivers have valid links and timestamps, and FIFO overflow is clear. Save the sequencer controls and full event maps, then check that codes 42/43 and logging slots 3/4 are unused.
   * - 2. Review and record
     - Set the interval to 8 ns, the threshold to 1,000 counts and the recording duration to 10 seconds. Review the exact apply, trigger and restore commands before starting. Leave event 101, pulse outputs, camera acquisition and DG645 settings unchanged.
   * - 3. Qualify and measure
     - Arm the bank once. For each of 20 fresh dark-to-bright frame pairs, issue one software trigger and verify the run-counter increment, including its 15-to-0 wrap. Match the received code order, then subtract event 42’s timestamp from event 43 on each receiver.
   * - 4. Restore and inspect
     - Disarm and restore the saved controls and logging selections, including after a stop or timeout. Check fresh readbacks against the original snapshot, verify receiver health, and inspect the saved result.

.. raw:: html

   <details class="experiment-details"><summary>Software processing measurements</summary>

.. list-table::
   :header-rows: 1

   * - Host interval
     - Mean / standard deviation / range (ns)
   * - Detection → request
     - 3,408,472 / 480,093 / 2,534,414–4,178,936
   * - Detection → run-count confirmation
     - 62,257,284 / 8,289,719 / 56,046,073–93,241,587

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
     - 2026-11-04 07:33:11.264481912
     - 2026-11-04 07:33:11.264481912
     - 0
   * - 1
     - 43
     - 2026-11-04 07:33:11.264481920
     - 2026-11-04 07:33:11.264481920
     - 0
   * - 2
     - 42
     - 2026-11-04 07:33:11.450214728
     - 2026-11-04 07:33:11.450214728
     - 0
   * - 2
     - 43
     - 2026-11-04 07:33:11.450214736
     - 2026-11-04 07:33:11.450214736
     - 0
   * - 3
     - 42
     - 2026-11-04 07:33:11.651728232
     - 2026-11-04 07:33:11.651728232
     - 0
   * - 3
     - 43
     - 2026-11-04 07:33:11.651728240
     - 2026-11-04 07:33:11.651728240
     - 0
   * - 4
     - 42
     - 2026-11-04 07:33:11.856290136
     - 2026-11-04 07:33:11.856290136
     - 0
   * - 4
     - 43
     - 2026-11-04 07:33:11.856290144
     - 2026-11-04 07:33:11.856290144
     - 0
   * - 5
     - 42
     - 2026-11-04 07:33:12.053296064
     - 2026-11-04 07:33:12.053296064
     - 0
   * - 5
     - 43
     - 2026-11-04 07:33:12.053296072
     - 2026-11-04 07:33:12.053296072
     - 0
   * - 6
     - 42
     - 2026-11-04 07:33:12.254836216
     - 2026-11-04 07:33:12.254836216
     - 0
   * - 6
     - 43
     - 2026-11-04 07:33:12.254836224
     - 2026-11-04 07:33:12.254836224
     - 0
   * - 7
     - 42
     - 2026-11-04 07:33:12.451024704
     - 2026-11-04 07:33:12.451024704
     - 0
   * - 7
     - 43
     - 2026-11-04 07:33:12.451024712
     - 2026-11-04 07:33:12.451024712
     - 0
   * - 8
     - 42
     - 2026-11-04 07:33:12.850953936
     - 2026-11-04 07:33:12.850953936
     - 0
   * - 8
     - 43
     - 2026-11-04 07:33:12.850953944
     - 2026-11-04 07:33:12.850953944
     - 0
   * - 9
     - 42
     - 2026-11-04 07:33:13.069449376
     - 2026-11-04 07:33:13.069449376
     - 0
   * - 9
     - 43
     - 2026-11-04 07:33:13.069449384
     - 2026-11-04 07:33:13.069449384
     - 0
   * - 10
     - 42
     - 2026-11-04 07:33:13.254415064
     - 2026-11-04 07:33:13.254415064
     - 0
   * - 10
     - 43
     - 2026-11-04 07:33:13.254415072
     - 2026-11-04 07:33:13.254415072
     - 0
   * - 11
     - 42
     - 2026-11-04 07:33:13.449862968
     - 2026-11-04 07:33:13.449862968
     - 0
   * - 11
     - 43
     - 2026-11-04 07:33:13.449862976
     - 2026-11-04 07:33:13.449862976
     - 0
   * - 12
     - 42
     - 2026-11-04 07:33:13.652810704
     - 2026-11-04 07:33:13.652810704
     - 0
   * - 12
     - 43
     - 2026-11-04 07:33:13.652810712
     - 2026-11-04 07:33:13.652810712
     - 0
   * - 13
     - 42
     - 2026-11-04 07:33:13.850213152
     - 2026-11-04 07:33:13.850213152
     - 0
   * - 13
     - 43
     - 2026-11-04 07:33:13.850213160
     - 2026-11-04 07:33:13.850213160
     - 0
   * - 14
     - 42
     - 2026-11-04 07:33:14.055736336
     - 2026-11-04 07:33:14.055736336
     - 0
   * - 14
     - 43
     - 2026-11-04 07:33:14.055736344
     - 2026-11-04 07:33:14.055736344
     - 0
   * - 15
     - 42
     - 2026-11-04 07:33:14.254074184
     - 2026-11-04 07:33:14.254074184
     - 0
   * - 15
     - 43
     - 2026-11-04 07:33:14.254074192
     - 2026-11-04 07:33:14.254074192
     - 0
   * - 16
     - 42
     - 2026-11-04 07:33:14.455183616
     - 2026-11-04 07:33:14.455183616
     - 0
   * - 16
     - 43
     - 2026-11-04 07:33:14.455183624
     - 2026-11-04 07:33:14.455183624
     - 0
   * - 17
     - 42
     - 2026-11-04 07:33:14.656155104
     - 2026-11-04 07:33:14.656155104
     - 0
   * - 17
     - 43
     - 2026-11-04 07:33:14.656155112
     - 2026-11-04 07:33:14.656155112
     - 0
   * - 18
     - 42
     - 2026-11-04 07:33:14.851665312
     - 2026-11-04 07:33:14.851665312
     - 0
   * - 18
     - 43
     - 2026-11-04 07:33:14.851665320
     - 2026-11-04 07:33:14.851665320
     - 0
   * - 19
     - 42
     - 2026-11-04 07:33:15.056815872
     - 2026-11-04 07:33:15.056815872
     - 0
   * - 19
     - 43
     - 2026-11-04 07:33:15.056815880
     - 2026-11-04 07:33:15.056815880
     - 0
   * - 20
     - 42
     - 2026-11-04 07:33:15.252282192
     - 2026-11-04 07:33:15.252282192
     - 0
   * - 20
     - 43
     - 2026-11-04 07:33:15.252282200
     - 2026-11-04 07:33:15.252282200
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
     - 1761211 / 1761212
     - 175 / 4094
     - 2026-11-04 07:33:11.133132173
     - 2026-11-04 07:33:11.135667527
     - 2026-11-04 07:33:11.153303173
     - 2534414
     - 69501392
   * - 2
     - 1761213 / 1761214
     - 178 / 4094
     - 2026-11-04 07:33:11.328788270
     - 2026-11-04 07:33:11.331788455
     - 2026-11-04 07:33:11.339019056
     - 2998225
     - 59457378
   * - 3
     - 1761215 / 1761216
     - 179 / 4094
     - 2026-11-04 07:33:11.534003302
     - 2026-11-04 07:33:11.536772526
     - 2026-11-04 07:33:11.540526922
     - 2767724
     - 56426063
   * - 4
     - 1761217 / 1761218
     - 177 / 4094
     - 2026-11-04 07:33:11.734623257
     - 2026-11-04 07:33:11.737802172
     - 2026-11-04 07:33:11.745102033
     - 3177305
     - 59563378
   * - 5
     - 1761219 / 1761220
     - 179 / 4094
     - 2026-11-04 07:33:11.933450059
     - 2026-11-04 07:33:11.936353774
     - 2026-11-04 07:33:11.942112552
     - 2901925
     - 58836727
   * - 6
     - 1761221 / 1761222
     - 174 / 4094
     - 2026-11-04 07:33:12.136856008
     - 2026-11-04 07:33:12.139806563
     - 2026-11-04 07:33:12.143627908
     - 2949675
     - 56046073
   * - 7
     - 1761223 / 1761224
     - 177 / 4094
     - 2026-11-04 07:33:12.329628922
     - 2026-11-04 07:33:12.332691866
     - 2026-11-04 07:33:12.339820237
     - 3060954
     - 93241587
   * - 8
     - 1761227 / 1761228
     - 179 / 4094
     - 2026-11-04 07:33:12.729544960
     - 2026-11-04 07:33:12.732552484
     - 2026-11-04 07:33:12.739775895
     - 3005604
     - 61645330
   * - 9
     - 1761229 / 1761230
     - 172 / 4094
     - 2026-11-04 07:33:12.946916399
     - 2026-11-04 07:33:12.951039025
     - 2026-11-04 07:33:12.958294986
     - 4122196
     - 61759341
   * - 10
     - 1761231 / 1761232
     - 177 / 4094
     - 2026-11-04 07:33:13.132983053
     - 2026-11-04 07:33:13.136071827
     - 2026-11-04 07:33:13.143208588
     - 3087484
     - 60508339
   * - 11
     - 1761233 / 1761234
     - 179 / 4094
     - 2026-11-04 07:33:13.330746373
     - 2026-11-04 07:33:13.334416979
     - 2026-11-04 07:33:13.338647145
     - 3669516
     - 56980584
   * - 12
     - 1761235 / 1761236
     - 183 / 4094
     - 2026-11-04 07:33:13.531951039
     - 2026-11-04 07:33:13.535416714
     - 2026-11-04 07:33:13.541603163
     - 3464405
     - 61089030
   * - 13
     - 1761237 / 1761238
     - 185 / 4094
     - 2026-11-04 07:33:13.728059058
     - 2026-11-04 07:33:13.731792973
     - 2026-11-04 07:33:13.739036774
     - 3734045
     - 60967699
   * - 14
     - 1761239 / 1761240
     - 186 / 4094
     - 2026-11-04 07:33:13.933971140
     - 2026-11-04 07:33:13.937383295
     - 2026-11-04 07:33:13.944564396
     - 3410115
     - 74733840
   * - 15
     - 1761241 / 1761242
     - 188 / 4094
     - 2026-11-04 07:33:14.133863184
     - 2026-11-04 07:33:14.137541179
     - 2026-11-04 07:33:14.142898717
     - 3677465
     - 57583675
   * - 16
     - 1761243 / 1761244
     - 187 / 4094
     - 2026-11-04 07:33:14.334399519
     - 2026-11-04 07:33:14.338410455
     - 2026-11-04 07:33:14.344006133
     - 4010496
     - 57576735
   * - 17
     - 1761245 / 1761246
     - 189 / 4094
     - 2026-11-04 07:33:14.536790226
     - 2026-11-04 07:33:14.540843712
     - 2026-11-04 07:33:14.544974458
     - 4051885
     - 58155915
   * - 18
     - 1761247 / 1761248
     - 182 / 4094
     - 2026-11-04 07:33:14.729709880
     - 2026-11-04 07:33:14.733195355
     - 2026-11-04 07:33:14.740504016
     - 3483625
     - 61127700
   * - 19
     - 1761249 / 1761250
     - 181 / 4094
     - 2026-11-04 07:33:14.935986313
     - 2026-11-04 07:33:14.940167030
     - 2026-11-04 07:33:14.945640798
     - 4178936
     - 59969998
   * - 20
     - 1761251 / 1761252
     - 181 / 4094
     - 2026-11-04 07:33:15.129772078
     - 2026-11-04 07:33:15.133656834
     - 2026-11-04 07:33:15.141145715
     - 3883456
     - 59974888

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
   pvput -w 3 EVT:DEV2:20:EVG:SEQ:1:times &#x27;[0.0,8.0,1008.0]&#x27;
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

The measured spacing and receiver agreement support using the timing system to correlate event records across these devices. They do not establish absolute UTC accuracy or variation smaller than one clock tick.
The camera-qualified trigger also includes host processing: the mean delay from detection to the start of the trigger request was 3.41 ms. This path therefore does not provide an 8 ns optical response. Physical LED turn-on, wire transmit time and a receiver-driven output response remain unmeasured.
