.. _bringup-procedures:

Bring-Up and Testing
===================
Purpose
---------------------------

This page serves as the foundation for setting up both roles in both chassis types, from start to finish, and adding tests thereafter.

Preflight
---------------------------

Preflight are physical preparations for bring-up and testing.

#. If available, refer to the rack map and fiber map provided by Alex Gardeck or Mark Holl.

   - This provides IP addresses, and desired layout information.

#. Identify the hardware in front of you, and refer to:

   - Digital chassis front/back panel diagrams
   - Quartz chassis front/back panel diagrams
   - DG645 front panel diagram
   - FS740 front panel diagram
   - Any other relevant diagrams in the Diagram Index: :doc:`/diagram_index`.

#. Decide which single chassis is going to be the EVG.

   - Note the IP address of the EVG candidate.
     
     - The EVG chassis usually doesn't change between testing and application, but can be changed if needed.
     
     - In testing, we may have siloed EVG for CXFEL and CXLS (each being connected to their own NTP server).
     
     - This is determined by the rack map and fiber map provided by Alex Gardeck or Mark Holl.

   - EVT (digital): for that EVG candidate, install the short fiber jumper between back-panel ports 1 and 3 as on the fiber map.

#. We must first configure the IP address, netmask, and gateway for each chassis family. This is done through the micro-USB, which can be connected to the back of the chassis one at a time. We can use the following commands to achieve this:

   - ``sudo python -m serial.tools.miniterm /dev/ttyUSB3 115200``

     - This opens the MMF console on ttyUSB3, for first-time ethernet setup.

     - After miniterm connects, type ``?`` and press Enter to print the firmware command list.

     - Set the IPv4 with ``m <IP_ADDRESS>`` (e.g. ``m 10.139.5.191``)

     - Enter ``5`` and press Enter to reset and/or boot the FPGA.

   - ``sudo python -m serial.tools.miniterm /dev/ttyUSB2 115200``

     - This opens the debug console on ttyUSB2, for whatever image is running; see :ref:`gold-vs-app`.

     - Type ``?`` and Enter for the command list.

     - Type ``l`` and Enter to show IP, netmask, gateway, NTP, and other information.

     - Use ``ntp <IP_ADDRESS>`` then Enter to set up the NTP server (``ntp X.X.X.X``).

       - EVG: ``ntp`` to the lab server (example ``ntp 10.139.5.50``, ask for lab specific).

       - EVR: ``ntp`` to ``0.0.0.0``.

     - For both chassis, set the gateway using ``gw X.X.X.X/X`` (e.g. ``gw 10.139.4.1/23``, ask for lab specific).

     - In GOLD this console may show repeating blocks until APP is running (:ref:`gold-vs-app`).

#. Confirm Pulse Per Second (PPS) source is connected and set to 1 Hz (not kHz).

     .. figure:: ../images/diagrams/drawio/Testing\ Rig\ Diagrams-FS740\ Diagram.drawio.png
        :alt: FS740 diagram for the testing rig, Pulse Out and display reference
        :width: 720px

        FS740 reference: coax from Pulse Out; display should show ``1.000 000 Hz``.

   - Run the coaxial cable from the FS740 Pulse Out (or from the lab PPS output) to the EVG candidate:

     - Digital chassis: BNC-to-SMA adapter to front-panel input 1 (SMA).

     - Quartz chassis: wire directly to front-panel PPS TTL path.

   - Verify 1 Hz on a scope at the cable before the chassis input, then at the chassis connector.

#. Confirm Phoebus opens and the target IOC host is reachable.

   - With the chassis in GOLD (:ref:`gold-vs-app`) and the address from step 4 on the rack map, run ``ping <IP_ADDRESS>`` in a ``cxfeldev`` terminal.

     .. figure:: ../images/Ping\ Example.png
        :alt: Example ping output in a cxfeldev terminal showing replies and no packet loss
        :width: 720px

        Example output: replies list ``bytes`` from the host; ``0% packet loss`` means the chassis is reachable.

   - If the ping is successful (returns some ``bytes`` and not ``packet loss``), the chassis is reachable.

   - Boot GOLD or Boot App from FPGA boot control (Event / Devel); see :doc:`/cs_studio/tabs/index` and :ref:`gold-vs-app`.

#. If anything is unclear physically (which connector or which port), stop and verify against the
   diagrams before applying signals, or ask Alex Gardeck or Mark Holl for assistance.

.. toctree::
   :maxdepth: 1
   :hidden:

   gold_vs_app
