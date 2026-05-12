.. orphan::

.. _quartz-usb:

USB and Consoles
=================================

USB port location
-----------------

Each Quartz chassis has a **micro-USB** port on the back panel.

[image needed: rear panel photo with micro-USB highlighted]

USB required vs not required
----------------------------

USB is required for:

- accessing MMC console (management microcontroller)
- accessing the application/debug console (Universal Asynchronous Receiver-Transmitter (UART) logs and debug commands)

USB is not required for:

- normal Input/Output Controller (IOC) operation over Ethernet (once network settings are correct)
- Alluvium flash operations over Ethernet (requires GOLD running and network reachability)

MMC console vs debug console
----------------------------

Over USB you will see multiple virtual serial ports.

Use:

- MMC console:

  - management microcontroller
  - set IP address, reset FPGA, other low-level controls

- application/debug console:

  - bootloader / APP debug output
  - commands such as ``GW`` and ``ntp``

If console output is unreadable, check baud rate (``9600`` vs ``115200``).

[image needed: OS view of MMC vs application serial ports]

See also :doc:`bringup_procedures` and :doc:`quartz_network` for rack sequence and network fields.
