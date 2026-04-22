Quartz firmware
===============

**Quartz** chassis: boot, Universal Serial Bus (USB), Ethernet, Alluvium. **Event Timing (EVT)** is a
different chassis family: :doc:`evt_chassis`.

Upstream (not replaced by this site): `Quartz Data Acquisition (DAQ) 250‑24 <https://github.com/osprey-dcs/quartz-daq-250-24>`_

Read next
---------

- :doc:`quartz_firmware_boot`: GOLD vs APP, ``FPGA boot control`` (Field-Programmable Gate Array (FPGA))
- :doc:`quartz_firmware_usb`: micro-USB, management microcontroller (MMC) vs debug console
- :doc:`quartz_firmware_network`: gateway/netmask, ping, Network Time Protocol (NTP), Event Receiver (EVR)–only
- :doc:`quartz_firmware_alluvium`: Alluvium program/verify

Panel reference (diagrams)
--------------------------

Analog connectors are on the front (DB37); digital and fiber are on the back (DB9 and eight Lucent
Connector (LC) ports). The same back-panel fiber numbering applies to Event Timing (EVT) chassis;
see :doc:`evt_chassis`. Rendered panel images are in ``source/images/diagrams/`` and editable Draw.io
sources are in ``drawio/``.

.. figure:: ../images/diagrams/Testing\ Rig\ Diagrams-Quartz\ Chassis\ Front\ Panel.drawio.png
   :alt: Quartz chassis front panel (connector layout)
   :width: 720px

.. figure:: ../images/diagrams/Testing\ Rig\ Diagrams-Quartz\ Chassis\ Back\ Panel.drawio.png
   :alt: Quartz chassis back panel (fiber and digital connectors)
   :width: 720px

Observed behaviors (Quartz)
---------------------------

- First flash status after FPGA reset can show error bits; one status/``clear`` with Alluvium often fixes it.
- MMC can rarely lock up after heavy flash/reset; full power cycle fixed it in the lab.
- **Network Time Protocol (NTP) / Pulse Per Second (PPS)** in firmware sets Quartz **Event Generator (EVG) vs Event Receiver (EVR)–style** behavior; ``ntp 0.0.0.0`` forces EVR-only (see network page).

See also: :doc:`quartz_daq_repo`, :doc:`evt_chassis`, :doc:`/cs_studio/tabs/index`.

.. toctree::
   :maxdepth: 1
   :hidden:

   quartz_firmware_boot
   quartz_firmware_usb
   quartz_firmware_network
   quartz_firmware_alluvium
