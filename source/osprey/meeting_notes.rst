Osprey / Quartz Bring-Up Notes
==============================

Informal notes from joint CXFEL–Osprey sessions. For procedures, see:

- :doc:`quartz_daq_repo`
- :doc:`quartz_firmware`

Observed behaviors
------------------

- First flash status read after FPGA reset can show error bits. Running one status/``clear`` cycle
  with Alluvium usually restores normal values.

- During repeated flashing and reset tests, the MMC has occasionally stopped responding. A full power
  cycle of the chassis restored normal behavior.

- EVG/EVR roles are determined in the Quartz firmware (NTP and PPS configuration). Disabling NTP
  (``0.0.0.0``) forces an EVR‑only role; see :doc:`quartz_firmware`.

