.. _gold-vs-app:

GOLD vs APP
===========

Each chassis stores two Field-Programmable Gate Array (FPGA) images in flash. You pick which image
runs from Phoebus; the **FPGA boot control** screen tells you which side is active and what build is
loaded.

What is in flash
----------------

- **GOLD**

  - Bootloader image: small, stable firmware used for recovery and for network tools such as Alluvium.

- **APP**

  - Application image: full timing and acquisition behavior for that chassis family.

- **Where you switch in Phoebus**

  - **Event** tab, then **Devel** sub-tab, then the Quartz or ``EVT #N`` screen for that chassis.

  - Boot actions on that screen move you between GOLD and APP without re-cabling.

FPGA boot control (Phoebus)
---------------------------

The **FPGA boot control** display on each chassis screen shows:

- which image is active (GOLD vs APP)

- hash or build information for each stored image

Analog chassis (Quartz) FPGA boot control:

.. figure:: ../images/Analog\ Chassis\ FPGA\ Boot\ Control.png
   :alt: Quartz analog chassis FPGA boot control in Phoebus
   :width: 720px

   Analog chassis FPGA boot control screen.

Digital chassis (EVT) FPGA boot control:

.. figure:: ../images/Digital\ Chassis\ FPGA\ Boot\ Control.png
   :alt: EVT digital chassis FPGA boot control in Phoebus
   :width: 720px

   Digital chassis FPGA boot control screen.

Normal use
----------

- At power-up the chassis normally lands in **GOLD** first.

  - From there you bring up Ethernet and sanity-check reachability (for example ping while still in GOLD).

- When you are ready for normal timing or acquisition work, use **Boot App** on the FPGA boot control screen to run **APP**.

- To return to the bootloader side, use **Boot Gold** on the same screen.

Notes
-----

- **GOLD** often responds to ping once Ethernet is configured; **APP** behavior on ICMP depends on what that image is doing, so do not treat a missing ping as “dead” without checking which image is running.

See also :doc:`/cs_studio/tabs/index`, :doc:`/github_repositories/bringup_procedures`, and :doc:`/github_repositories/alluvium`.
