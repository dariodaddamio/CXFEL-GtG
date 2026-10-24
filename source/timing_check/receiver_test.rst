:orphan:

.. _receiver-timestamp-check:

Receiver timestamp check
========================

*CXFEL test rack · measured 23 October 2026*

**Yes, for this measured pair at the reported timestamp resolution.** Two digital
receivers assigned identical timestamps to **2,990 matched test events** in
**299 complete seconds** of a five-minute, 10 Hz capture. The observed mean offset,
standard deviation and fitted drift were all zero. The timestamp clock tick is
**8 ns**; these results do not establish sub-tick precision or absolute UTC accuracy.

.. raw:: html

   <div class="timing-results" aria-label="Measured timestamp agreement">
     <div><span>Mean B − A</span><strong>0 ns</strong></div>
     <div><span>Observed jitter</span><strong>0 ns</strong></div>
     <div><span>Matched events</span><strong>2,990</strong></div>
     <div><span>Settings</span><strong>Restored</strong></div>
   </div>

The result in one picture
-------------------------

Every point below is one matched hardware timestamp pair. The offset uses the
event timestamps, **not** the times at which network updates reached the client.

.. raw:: html

   <div class="timing-chart">
     <div class="timing-controls">
       <label for="timing-view">View</label>
       <select id="timing-view">
         <option value="offset">Offset B − A</option>
         <option value="centered">Deviation from mean</option>
       </select>
       <label for="timing-window">Window</label>
       <select id="timing-window">
         <option value="all">Entire analyzed interval</option>
         <option value="first">First minute</option>
         <option value="last">Last minute</option>
       </select>
     </div>
     <svg id="timing-plot" viewBox="0 0 1000 290" role="img" aria-labelledby="timing-plot-title timing-plot-desc">
       <title id="timing-plot-title">Timestamp offset over the measured interval</title>
       <desc id="timing-plot-desc">All 2,990 matched event offsets were zero nanoseconds. The configured timestamp tick is eight nanoseconds.</desc>
     </svg>
     <p class="timing-chart-note">All measured offsets: 0 ns. Timestamp tick: 8 ns. Hover over a point for its value.</p>
   </div>
   <script defer src="../_static/timing-check/chart.js"></script>

:download:`Export the plot as SVG <../_static/timing-check/evidence/offset-agreement.svg>`
or :download:`PNG <../_static/timing-check/evidence/offset-agreement.png>` for reports and slides.

How the check worked
--------------------

The test used the existing IOC interfaces, with no firmware changes or IOC
restarts:

1. **Inventory:** identify working receivers, current event maps and the generator.
2. **Sanity:** monitor all eight digital EVRs for two minutes without changing PVs.
3. **Comparison:** with approval, send unused event **42** at **10 Hz** from timer 2
   on ``EVT:DEV2:20:``. Log it on receiver A, ``EVT:DEV2:10:``, and receiver B,
   ``EVT:DEV2:40:``.
4. **Restore:** disable that test event, restore its divisor and remove its two
   logging selections. Confirm the original values, complete maps and event streams.

The controlled event appeared on both receivers, confirming a common test-event
source. The exact physical fiber port-to-receiver assignments remain unverified.

.. list-table:: Five-minute comparison
   :header-rows: 1
   :widths: 55 45

   * - Quantity
     - Observed value
   * - Capture duration
     - 300.000219 s
   * - Selected test-event rows, A / B
     - 3,000 / 3,000, excluding initial cached batches
   * - Analyzed window
     - 299 complete seconds; ten events per second on each receiver
   * - Matched / unmatched A / unmatched B
     - 2,990 / 0 / 0 in that window
   * - Mean offset, B minus A
     - 0 ns
   * - Population standard deviation
     - 0 ns
   * - Minimum / maximum offset
     - 0 / 0 ns
   * - Fitted drift
     - 0 ns/s over a 298.9 s matched-event span

Rows were matched by **event code, POSIX second and order within the second**.
Each receiver's first and last shared event seconds were excluded because
subscriptions can start or stop partway through a second: ten rows per receiver
were excluded at those edges. This avoids pairing different pulses by ordinal.
All raw rows are retained in the local audit; unmatched counts above describe the
complete-second window, not a claim of total transport-loss coverage.

The initial untrimmed analysis exposed a false −100 ms pairing at the first
partial second. Its original results are preserved locally; no interior outliers
were removed to obtain the reported agreement.

What the sanity check found
---------------------------

Receivers 10 and 40 each logged **121 PPS markers** in two minutes, including an
initial cached batch. Every PPS nanosecond value was **8 ns** and all 120 successive
second increments were exactly **+1**. None of the four working logs went backwards.
Overflow was clear in all 59 valid status samples on each working receiver.

.. list-table:: Digital EVR health
   :header-rows: 1
   :widths: 18 42 40

   * - Prefix suffix
     - Timestamp state
     - What remains observable
   * - 10, 40
     - Valid; PPS cadence and phase checks passed
     - PPS and event 101 logs; used for the comparison
   * - 20, 30
     - Valid; event order checks passed
     - PPS was not selected in their existing logging maps
   * - 50
     - Hardware connection searching; read alarms
     - No trustworthy event or overflow measurements
   * - 60–80
     - Link up, timestamp invalid
     - No valid timestamp events; these are not passing receivers

Limits that matter for data correlation
---------------------------------------

**Absolute time is unresolved.** Sampled numeric ``EVR:now_`` values trailed host
receipt time by about **1.89–2.84 seconds**. IOC sampling delay and actual clock
offset have not been separated. Close relative agreement does not prove correct UTC.

**A dedicated rollover stress test was not performed.** No close cross-second
pairing candidates were found, but the test pulses were not within 1 ms of PPS.

**High-rate logging is unmeasured.** The live register region holds **85 event
triples per read**, even though IOC arrays declare 128 elements. The approved test
ran at 10 Hz. The proposed 100, 500 and 1000 Hz sweep still requires separate approval.

**Current CAM2 LED observation:** the later passive run saved 240 frames with
consecutive IDs and strict bright/dim alternation. See :doc:`index` for the current
LED images and timestamp-consistency results. The earlier target-grid capture is
a separate reference. Other cameras are intentionally closed.

**Firmware versions differ.** The generator uses revision ``2156018``; the two
comparison receivers use ``55055db``. The generator does not expose the newer
timer-control/status registers, explaining existing IOC READ/WRITE alarms on those
records. The test used the generator's supported event/divisor interface.

Restoration and evidence
------------------------

All four approved settings below were read back at their original values.
All eight receiver maps matched their saved baselines. Event 42 ceased after
cached updates drained, and the original 125/101 streams continued on A and B.
Reserved events and protection/MPS settings were untouched.

.. list-table:: The only changed PVs
   :header-rows: 1
   :widths: 58 14 14 14

   * - PV
     - Original
     - Test
     - Restored
   * - ``EVT:DEV2:10:EVR:LOG:evt3``
     - 0
     - 42
     - 0
   * - ``EVT:DEV2:40:EVR:LOG:evt3``
     - 0
     - 42
     - 0
   * - ``EVT:DEV2:20:EVG:TMR:2:divisor``
     - 2147483647
     - 12500000
     - 2147483647
   * - ``EVT:DEV2:20:EVG:TMR:2:event``
     - 0
     - 42
     - 0

Download the :download:`audit summary <../_static/timing-check/evidence/report.txt>`,
:download:`comparison summary <../_static/timing-check/evidence/comparison-summary.json>`,
:download:`matched event pairs (CSV) <../_static/timing-check/evidence/matched-events.csv>`,
:download:`sanity summary <../_static/timing-check/evidence/sanity-summary.json>`,
and :download:`restoration result <../_static/timing-check/evidence/restoration.json>`.
The :download:`read-only comparison script <../_static/timing-check/evidence/compare.py.txt>`
and :download:`analysis validation notes <../_static/timing-check/evidence/validation.txt>`
document the calculation. An :download:`evidence manifest <../_static/timing-check/evidence/manifest.json>`
provides SHA-256 checksums for the exported evidence.

The complete raw capture and write/readback journal remain under
``~/Desktop/dario/timing-check/`` on the test host. This documentation is a measured
snapshot; it does not connect to or control the rack.

For the hardware/role model, see :doc:`/github_repositories/quartz_vs_evt_timing`.

For the longer read-only audit trail, download the :download:`engineering appendix <../_static/timing-check/evidence/engineering-audit.txt>`.
