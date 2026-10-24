A read-only configuration check at approximately 23:46 UTC found these output settings.
This check occurred after the observation. It records configured routes, not measured output waveforms.

.. list-table::
   :header-rows: 1
   :widths: 25 20 20 35

   * - Receiver IP
     - Output
     - Event
     - Pulse settings
   * - ``10.139.5.195``
     - 1
     - 125
     - Pulse source; delay 0 ns; width 50,000 ns
   * - ``10.139.5.197``
     - 1
     - 101
     - Pulse source; delay 0 ns; width 100,000 ns
   * - ``10.139.5.198``
     - 1
     - 125
     - Pulse source; delay 0 ns; width 100,000 ns

Outputs 2–8 were configured as Static 0 on these receivers.
The event-101 route on ``10.139.5.197`` is a candidate source for the camera trigger.
The exposed records do not confirm its cable destination.
This receiver was not part of the two-receiver timestamp comparison.

Two development DG645 IOCs were found in the startup files.
Their readbacks were retrieved without changing settings:

.. list-table::
   :header-rows: 1
   :widths: 30 35 35

   * - Setting
     - ``10.139.4.87``
     - ``10.139.4.88``
   * - PV prefix
     - ``DGEN:DEV2:20:``
     - ``DGEN:DEV2:30:``
   * - Serial number
     - 010941
     - 011444
   * - Trigger source
     - Internal
     - External rising edge
   * - Trigger prescale
     - 1
     - 2
   * - Trigger inhibit
     - Triggers
     - Triggers
   * - Burst mode
     - Disabled
     - Disabled
   * - A reference and delay
     - T0; 0 s
     - T0; 0 s
   * - B reference and delay
     - A; 10 ns
     - A; 1.15 µs
   * - AB amplitude / offset / polarity
     - 4 V / 0 V / positive
     - 3.5 V / 0 V / positive
   * - C reference and delay
     - T0; 926 µs
     - T0; 0 s
   * - D reference and delay
     - C; 20 µs
     - C; 10 ns
   * - CD amplitude / offset / polarity
     - 2.5 V / 0 V / positive
     - 2.5 V / 0 V / positive

Both units reported an internal-rate setting of 1000 Hz.
That setting is not a measurement of the external trigger rate or emitted pulse rate.
The inhibit readback also prevents a claim that these settings prove active output pulses.
No unit or output has been assigned to the breadboard from these readbacks alone.
