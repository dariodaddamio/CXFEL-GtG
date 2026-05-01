GOLD vs APP
============================

Quartz stores two Field-Programmable Gate Array (FPGA) images in flash:

- GOLD: bootloader image (minimal, stable)
- APP: application image (full data acquisition functionality)
- They can be found for each chassis in the Event tab's Devel sub-tab.


FPGA boot control (Phoebus)
---------------------------

The Phoebus ``FPGA boot control`` display shows:

- which image is active (GOLD vs APP)
- hash / build information for each image

Analog chassis FPGA boot control:

.. figure:: ../images/Analog\ Chassis\ FPGA\ Boot\ Control.png
   :alt: Analog chassis FPGA boot control screen
   :width: 900px

Digital chassis FPGA boot control is found in each chassis's screen:

.. figure:: ../images/Digital\ Chassis\ FPGA\ Boot\ Control.png
   :alt: Digital chassis FPGA boot control screen
   :width: 900px

Normal use
----------

- Automatically power-up into GOLD
- from Phoebus, select ``Boot App`` to start APP, or ``Boot Gold`` to start GOLD

Notes
-----

- GOLD typically responds to ping

See also :doc:`quartz_firmware` for the hub and reading order.
