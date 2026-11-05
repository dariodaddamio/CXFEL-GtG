Event sequencer timing test
===========================

This test checks the event sequencer that the `timing-firmware 20261017`_ and `timing-ioc 20261017`_ releases add to the timing generator. One trigger makes the generator send event code 42 and then event code 43 after a set delay. Two receivers record the time each code arrives.

**Result:** In 80 cycles at three programmed delays, both receivers recorded the programmed delay exactly. The two receivers also recorded the same time for each code. The test was done on the CXFEL timing test rack in November 2026.

.. _timing-firmware 20261017: https://github.com/osprey-dcs/timing-firmware/releases/tag/20261017
.. _timing-ioc 20261017: https://github.com/osprey-dcs/timing-ioc/releases/tag/20261017
.. _timing reference guide: https://github.com/osprey-dcs/timing-ioc/blob/ci/documentation/README.md
.. _Sequencer Table Event Source: https://github.com/osprey-dcs/timing-ioc/blob/ci/documentation/README.md#sequencer-table-event-source
.. _Event Link model: https://github.com/osprey-dcs/timing-ioc/blob/ci/documentation/README.md#event-link-model
.. _Special Event Codes: https://github.com/osprey-dcs/timing-ioc/blob/ci/documentation/README.md#special-event-codes
.. _Operation Roles: https://github.com/osprey-dcs/timing-ioc/blob/ci/documentation/README.md#operation-roles
.. _Program Application Firmware: https://github.com/osprey-dcs/osprey-evt-8-8/blob/main/documentation/chassis-setup.md#program-application-firmware

.. list-table::
   :header-rows: 1
   :widths: 28 42 30
   :class: tc-status

   * - Release change
     - How this test checks it
     - Status
   * - Event sequencer
     - Run the sequencer 20 times at each delay. Compare the receiver records with the programmed delay.
     - Verified. See :ref:`tc-results`.
   * - IOC sends the time (firmware NTP client removed)
     - Read the time status from the host and the generator.
     - Partly verified. See :ref:`tc-other`.
   * - Role selectable at runtime
     - Read the role of each device.
     - Read only. See :ref:`tc-other`.

Background
----------

The timing system has one generator and several receivers, which are connected by optical fiber. The `Event Link model`_ describes the link. The generator sends a number from 1 to 255 to tell the receivers that something occurs. This number is an *event code*. For example, at CXFEL code 101 triggers the camera, and code 125 marks the start of each second (see `Special Event Codes`_).

Each receiver counts a 125 MHz clock. One clock period (one *tick*) is 8 ns. When a code arrives, the receiver records the time as a whole number of ticks. Thus 8 ns is the smallest time difference that a receiver can show.

The sequencer stores a table of event codes and delays. When you trigger the sequencer, it sends the codes in the table at their delays. The `Sequencer Table Event Source`_ section of the `timing reference guide`_ describes the sequencer.

This test uses codes 42 and 43 because no CXFEL equipment uses them. These codes do not operate any output.

How the test works
------------------

.. raw:: html
   :file: fragments/update-system.html

.. rst-class:: tc-figcaption

The LED only starts each cycle. The software step takes 2.5 to 4.5 ms and is not part of the result. The result uses only the times that the receivers record.

#. The DG645 delay generator turns the LED on and off.
#. The CAM2 camera takes images of the LED at approximately 10 images per second.
#. Software on the host computer finds a bright image after a dark image. Then it triggers the sequencer.
#. The generator sends code 42, then code 43 after the programmed delay.
#. Each receiver records the time of each code.

The test does 20 cycles at each delay. The `setup <#setup>`_ and `procedure <#procedure>`_ give the full configuration.

.. _tc-results:

Results
-------

In a full run, each cycle shows as one line, because 42 and 43 are only nanoseconds apart and the cycles are approximately 200 ms apart. The lower panel magnifies one cycle so that you can see the two codes.

.. raw:: html
   :file: fragments/update-run-zoom.html

.. rst-class:: tc-figcaption

Run with an 8 ns delay. Both receivers recorded code 43 exactly 8 ns after code 42, and both receivers recorded the same time for each code.

The table shows the times that the receivers recorded for the first cycle of each run. Each time is a count of nanoseconds after the start of the UTC second. Underlined digits change between code 42 and code 43.

.. raw:: html
   :file: fragments/update-first-cycles.html

The next table gives the results for all cycles. The "B minus A" column shows the difference between the two receivers for the same code.

.. raw:: html
   :file: fragments/update-summary.html

Limits
------

* The receivers resolve 8 ns. A result of 0 ns means that the difference is less than 8 ns.
* The test does not measure the time from the LED to the hardware. That path includes `software time <#software-time>`_.
* The test does not measure the accuracy of the timestamps against true UTC.
* The test ran at approximately 5 cycles per second, not at a facility rate such as 1 kHz.
* No physical output pulse was measured.
* After the test, the CAM2 view of the LED did not agree with the saved images. Before you do the test again, get a clear view of the LED in both states. This does not change the saved results.

.. _tc-other:

Other release changes
---------------------

The devices were read, but no setting was changed. The `release notes <timing-firmware 20261017_>`_ list each change.

.. list-table::
   :header-rows: 1
   :widths: 20 45 35

   * - Change
     - What the devices report
     - Limit
   * - Installed version
     - All four devices report a firmware and IOC build date that agrees with release 20261017. The SHA1 of the release file ``EVG-20261017-cdcfe1f.bit`` agrees with the published value.
     - The devices do not report the hash of the running image.
   * - IOC sends the time
     - The host clock is synchronized to NTP. The generator reports that its one-second pulse and its timestamps are valid. The IOC supplies the next second (``Nxt:Sec``).
     - These values show that the IOC time path operates. They do not show that the firmware NTP client is removed.
   * - Role selectable at runtime
     - ``FPGA:Mode`` reads *EVG/EVR* on the generator (10.139.5.196) and *EVR Only* on the other three devices. See `Operation Roles`_.
     - The role was not changed. To verify this item, change the role of one device and restore it without a reboot.

To install the release, use the `Program Application Firmware`_ procedure.

Recordings
----------

The video shows both receivers recording all 50 cycles during a new 10-second demonstration with an 8 ns event gap, a full-sensor camera view and a brightness cutoff of 4,000 counts. The tables and records below describe the earlier trials.

.. list-table::
   :header-rows: 1

   * - Run
     - Recording
     - Evidence
   * - 8 ns
     - ``20261104T065440Z-9f4ddd``
     - :download:`led-8ns-evidence.json <../_static/timing-check/scenarios/led-8ns-evidence.json>`
   * - 80 ns
     - ``20261104T065300Z-5ace19``
     - :download:`led-80ns-evidence.json <../_static/timing-check/scenarios/led-80ns-evidence.json>`
   * - 1 ms
     - ``20261104T051638Z-3fd293``
     - :download:`led-1000000ns-evidence.json <../_static/timing-check/scenarios/led-1000000ns-evidence.json>`
   * - 8 ns repeat
     - ``20261104T073310Z-044488``
     - :download:`led-sequence-evidence.json <../_static/timing-check/scenarios/led-sequence-evidence.json>`

.. raw:: html

   <video class="timing-experiment-video" controls playsinline preload="metadata" poster="../_static/timing-check/scenarios/led-demo-poster.png"><source src="../_static/timing-check/scenarios/led-demo-10s.mp4" type="video/mp4"><a href="../_static/timing-check/scenarios/led-demo-10s.mp4">Open the recording</a></video>

Records
-------

Each cycle table gives both codes on both receivers. Times are nanoseconds after the start of the UTC second in the second column.

.. raw:: html

   <details class="experiment-details"><summary>Cycles of the 8 ns run</summary>

.. raw:: html
   :file: fragments/update-records-led-8ns.html

.. raw:: html

   </details>
   <details class="experiment-details"><summary>Cycles of the 80 ns run</summary>

.. raw:: html
   :file: fragments/update-records-led-80ns.html

.. raw:: html

   </details>
   <details class="experiment-details"><summary>Cycles of the 1 ms run</summary>

.. raw:: html
   :file: fragments/update-records-led-1000000ns.html

.. raw:: html

   </details>
   <details class="experiment-details"><summary>Cycles of the 8 ns repeat run</summary>

.. raw:: html
   :file: fragments/update-records-led-sequence.html

.. raw:: html

   </details>

.. raw:: html

   <details class="experiment-details" id="software-time"><summary>Software time from LED detection to trigger request</summary>

This time is host software time. The results do not use it.

.. raw:: html
   :file: fragments/update-host.html

.. raw:: html

   </details>

.. raw:: html

   <details class="experiment-details" id="setup"><summary>Setup</summary>

.. list-table::
   :header-rows: 1
   :widths: 20 80

   * - Item
     - Configuration
   * - Generator
     - 10.139.5.196, PV prefix ``EVT:DEV2:20:``. 125 MHz reference clock. Sequencer bank 1 in Normal trigger mode, so the bank stays armed after each run. Timer and input triggers are off.
   * - Receivers
     - A is 10.139.5.195 (``EVT:DEV2:10:``). B is 10.139.5.198 (``EVT:DEV2:40:``). Logging slots 3 and 4 record codes 42 and 43.
   * - Sequence table
     - Code 42 at 0 ns. Code 43 at the programmed delay. Code 255 at the delay plus 1,000 ns. Code 255 ends the table and is not sent.
   * - Camera
     - CAM2 (192.168.2.1) on its existing trigger. 1 ms exposure, 1200 × 900 pixels. A bright image has a peak above 1,000 counts in columns 300 to 699 and rows 550 to 849.
   * - LED
     - Breadboard LED, driven by a DG645. The DG645 settings did not change.
   * - Unchanged codes
     - 101 (camera trigger), 125 (start of second), and 112 and 113 (seconds value).

.. raw:: html

   </details>

.. raw:: html

   <details class="experiment-details" id="procedure"><summary>Procedure</summary>

#. Make sure that CAM2 shows the LED dark and bright.
#. Make sure that both receivers have a valid link and valid timestamps, with no event-log overflow.
#. Save all settings that the test changes.
#. Load the sequence table and set logging slots 3 and 4.
#. Arm the sequencer one time.
#. For each new dark-to-bright change of the LED, send one trigger. Make sure that the run counter increases.
#. Stop after 20 cycles.
#. Disarm the sequencer and restore the saved settings. Read back the settings and make sure that the receivers are healthy.
#. For each receiver, subtract the time of code 42 from the time of code 43. Compare the time of each code between the two receivers.

.. raw:: html

   </details>
   <details class="experiment-details"><summary>Commands sent in the 8 ns repeat run</summary>

.. literalinclude:: ../_static/timing-check/scenarios/led-demo-commands.txt
   :language: text

.. raw:: html

   </details>
   <details class="experiment-details"><summary>Terms</summary>

.. list-table::
   :widths: 22 78

   * - Generator (EVG)
     - The device that sends the clock and event codes to all receivers.
   * - Receiver (EVR)
     - A device that records the time of each event code and can send output pulses.
   * - Event code
     - A number from 1 to 255 that the generator sends. Code 0 is idle.
   * - Sequencer
     - A table in the generator that sends event codes at set delays after a trigger.
   * - IOC
     - The EPICS control program of a device. You read and write its settings through PVs, for example ``EVT:DEV2:20:FPGA:Mode``.
   * - Tick
     - One period of the 125 MHz clock (8 ns).
   * - PPS
     - Pulse per second. Code 125 marks the start of each second.

.. raw:: html

   </details>

The analysis of all cycles is in :download:`receiver-trial-analysis.json <../_static/timing-check/scenarios/receiver-trial-analysis.json>`. The device values are in :download:`update-readbacks.json <../_static/timing-check/scenarios/update-readbacks.json>`. The script ``tools/timing_check/render_update_check.py`` makes the figures and tables from these files.

.. raw:: html

   <script>(()=>{const o=()=>{const d=document.getElementById(location.hash.slice(1));if(d&&d.tagName==='DETAILS')d.open=true};addEventListener('hashchange',o);o()})()</script>
