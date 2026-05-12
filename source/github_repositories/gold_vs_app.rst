.. _gold-vs-app:

GOLD vs APP
===========

Purpose
-------

GOLD and APP name the two FPGA images you switch between from Phoebus. This page states what each is for and shows FPGA boot control on the analog and digital chassis OPIs. In the site navigation it appears under Bring-Up and Testing.

GOLD
----

GOLD is the bootloader (gold) image. Use it when you need a simple Ethernet target after USB programming, for recovery, or before you load the application from Phoebus. On the ttyUSB2 debug console, GOLD can look like repeating block characters until APP is running.

APP
---

APP is the application image. Normal timing work and IOC interaction use APP after bring-up.

Where to switch
---------------

In Phoebus, open Event, then Devel, then the Quartz or EVT screen for that chassis. Use FPGA boot control there for Boot GOLD and Boot App. Screenshots of those areas:

.. figure:: ../images/Analog\ Chassis\ FPGA\ Boot\ Control.png
   :alt: Quartz analog chassis FPGA boot control in Phoebus (Boot GOLD, Boot App)
   :width: 720px

   Analog (Quartz) chassis: FPGA boot control.

.. figure:: ../images/Digital\ Chassis\ FPGA\ Boot\ Control.png
   :alt: EVT digital chassis FPGA boot control in Phoebus (Boot GOLD, Boot App)
   :width: 720px

   Digital (EVT) chassis: FPGA boot control.

See also :doc:`/cs_studio/tabs/index` and :doc:`/github_repositories/bringup_procedures`.
