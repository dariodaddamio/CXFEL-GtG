LED detection and receiver timing
=================================

This experiment tests whether an LED flash detected in a camera image can start a programmed event sequence and produce consistent timestamps at two receivers. The 10-second reference trial used the event-table sequencer in release 20261017.

.. image:: ../_static/timing-check/scenarios/led-experiment-path.svg
   :alt: An LED flash is detected in CAM2, software triggers the generator, and both receivers timestamp events 42 and 43. The measured interval is between received events.
   :width: 100%

This interval tests the sequence executed after detection. It does not measure how quickly the hardware responds to the LED flash.

Results
-------

Recording ``20261104T073310Z-044488`` saved 100 original images. Software accepted 20 LED transitions, then stopped issuing triggers while the 10-second acquisition continued.

.. list-table::
   :header-rows: 1
   :class: led-measurements

   * - Measurement
     - Result
     - Sample
   * - Events received
     - 40 of 40 on each receiver
     - 20 accepted transitions
   * - 42 → 43 spacing on both receivers
     - 8 ns; standard deviation 0 ns
     - 20 pairs per receiver
   * - Receiver timestamp difference
     - 0 ns; standard deviation 0 ns
     - 40 matched events

.. figure:: ../_static/timing-check/scenarios/led-hardware-timing.svg
   :alt: The vertical tick spacing is 8 ns, which is one hardware clock period. Variation below that resolution cannot be resolved.
   :width: 100%

   The vertical tick spacing is 8 ns, which is one hardware clock period. Variation below that resolution cannot be resolved.

The first event pair shows how the interval was calculated. All times below share the UTC second **2026-11-04 07:33:11**; the remaining nine digits are integer nanoseconds within that second.

.. list-table::
   :header-rows: 1
   :class: led-timestamps

   * - Receiver
     - Event 42 (ns)
     - Event 43 (ns)
     - 43 − 42 (ns)
   * - 10.139.5.195
     - 264481912
     - 264481920
     - 8
   * - 10.139.5.198
     - 264481912
     - 264481920
     - 8

Recorded demonstration
----------------------

The recording includes review, acquisition and restoration, so the video lasts longer than the 10-second capture. The images below are the first accepted dark/bright pair from the saved camera data.

.. raw:: html

   <video class="timing-experiment-video" controls playsinline preload="metadata" poster="../_static/timing-check/scenarios/led-demo-poster.png">
     <source src="../_static/timing-check/scenarios/led-demo-10s.mp4" type="video/mp4">
     <a href="../_static/timing-check/scenarios/led-demo-10s.mp4">Open the experiment recording</a>
   </video>

.. figure:: ../_static/timing-check/scenarios/led-qualified-images.png
   :alt: Both full camera images use the same intensity scale. They establish a sampled dark-to-bright change, not the exact time when the LED switched on.
   :width: 100%

   Both full camera images use the same intensity scale. They establish a sampled dark-to-bright change, not the exact time when the LED switched on.

Setup
-----

These are the settings used for the reference recording. They describe the measured trial, rather than the current live configuration.

.. list-table::
   :header-rows: 1

   * - Component
     - Address / PV prefix
     - Recorded setup
   * - Generator
     - 10.139.5.196 / ``EVT:DEV2:20:``
     - Release 20261017; 125 MHz clock; bank 1 in Normal mode. Timer and external-input triggers disabled.
   * - Receivers
     - 10.139.5.195 / ``EVT:DEV2:10:``; 10.139.5.198 / ``EVT:DEV2:40:``
     - Logging slots 3 and 4 select events 42 and 43. Both receivers use the common generator stream. These events drive no physical outputs.
   * - Camera
     - 192.168.2.1 / ``CAM:DEV2:20:``
     - CAM2; external Line1 trigger; approximately 10 frames/s; 1 ms exposure; 1200 × 900 Mono12 images.
   * - LED detection
     - Breadboard LED driven by a DG645
     - Peak intensity above 1,000 counts in columns 300–699 and rows 550–849. Coordinates start at zero. The exact DG645 output and cable endpoints were not recorded.
   * - Sequence
     - Bank 1 on 10.139.5.196
     - Event 42 at 0 ns, event 43 at 8 ns, and stop code 255 at 1,008 ns. Code 255 ends the table and is not transmitted.
   * - Acquisition
     - Host 10.139.4.59
     - 10 seconds; at most 20 camera-qualified software triggers. Save receiver rows, original images, frame metadata and device settings.

.. list-table::
   :header-rows: 1

   * - Code
     - Role
   * - 42
     - First test event after software detects a fresh dark-to-bright camera transition.
   * - 43
     - Follow-up test event, programmed 8 ns after event 42.
   * - 101
     - Existing camera-trigger event; its configuration stays unchanged.
   * - 125
     - One-second marker (PPS), used to establish receiver timestamp seconds.

Procedure
---------

.. list-table::
   :header-rows: 1

   * - Step
     - Action and verification
   * - 1. Check and save
     - Confirm that CAM2 shows the LED switching between dark and bright. Check receiver link and timestamp validity, with FIFO overflow clear. Save the sequencer settings and event maps, and confirm that events 42/43 and logging slots 3/4 are available.
   * - 2. Configure
     - Select the sequence and detection settings in the setup table. Review the apply, trigger and restore commands below. Keep event 101, physical pulse outputs, camera acquisition settings and DG645 settings unchanged.
   * - 3. Acquire
     - Start the 10-second image and event recording, then arm the sequence once. For each accepted dark-to-bright frame pair, issue one software trigger and check the sequencer run-counter increment. Stop issuing triggers after 20 accepted transitions.
   * - 4. Compare and restore
     - Match event order within each second on both receivers, inspect PPS rollovers, and calculate the event spacing and receiver difference. Disarm the bank and restore the saved settings and maps, including after a stop or timeout. Read them back and confirm receiver health.

Evidence
--------

All 40 camera frames used to accept the 20 transitions were checked against the original pixels. The capture had no frame-ID gaps or image-writer overruns. Settings and event maps were restored and verified; the sequencer was inactive and disarmed.

:download:`Cycle data (CSV) <../_static/timing-check/scenarios/led-sequence-cycles.csv>` · :download:`Measurements and verification (JSON) <../_static/timing-check/scenarios/led-sequence-evidence.json>`

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

On this test link, the receivers agreed on event timestamps and preserved the programmed event spacing. This supports correlating data that carry the same timing events at CXFEL. Zero reported variation is limited by the 8 ns clock resolution; this trial does not establish absolute UTC accuracy or performance at 1 kHz.

The LED detection path includes software processing. Detection to the start of the trigger request averaged 3.41 ms, with a 2.53–4.18 ms range. Thus, the 8 ns result applies to the two sequenced events, not to the response from light to hardware. A receiver-driven device response remains to be measured.

A later camera-view mismatch is still unresolved. The measurements above remain tied to the saved reference images and logs. A repeat optical trial must first recover a clear view of the LED and confirm both image states.
