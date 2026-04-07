GOLD vs APP
============================

Quartz stores two Field-Programmable Gate Array (FPGA) images in flash:

- GOLD: bootloader image (minimal, stable)
- APP: application image (full Data Acquisition (DAQ) functionality)

FPGA boot control (Phoebus)
---------------------------

The Phoebus ``FPGA boot control`` display shows:

- which image is active (GOLD vs APP)
- hash / build information for each image

[image needed: FPGA boot control screen with GOLD/APP hashes]

Normal use
----------

- power-up into GOLD
- from Phoebus, select ``boot app`` to start APP

Notes
-----

- GOLD typically responds to ping; APP may not (see :doc:`quartz_firmware_network`).

See also :doc:`quartz_firmware` for the hub and reading order.
