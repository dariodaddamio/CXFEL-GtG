.. _bringup-procedures:

Bring-Up and Testing
===================


Recall:

- Conceptual background is in :doc:`/github_repositories/quartz_vs_evt_timing`
- Quartz chassis work in Phoebus (boot, network, and related controls): :doc:`/cs_studio/tabs/index`; vendor PDFs: :doc:`/equipment_manual`.
- Panel diagrams are in :doc:`/diagram_index`

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

#. Confirm Pulse Per Second (PPS) source is connected and set to 1 Hz (not kHz).

     .. figure:: ../images/diagrams/drawio/Testing\ Rig\ Diagrams-FS740\ Diagram.drawio.png
        :alt: FS740 diagram for the testing rig—Pulse Out and display reference
        :width: 720px

        FS740 reference: coax from **Pulse Out**; display should show ``1.000 000 Hz``.

   - Run the coaxial cable from the FS740 **Pulse Out** (or from the lab PPS output) to the EVG candidate:

     - Digital chassis: BNC-to-SMA adapter to front-panel input 1 (SMA).

     - Quartz chassis: wire directly to front-panel PPS TTL path.

   - Verify 1 Hz on a scope at the cable before the chassis input, then at the chassis connector.

#. Confirm Phoebus opens and the target IOC host is reachable.
   
   - In the command line of a ``cxfeldev`` terminal, run: ``ping <IOC_IP_ADDRESS>``

     .. figure:: ../images/Ping\ Example.png
        :alt: Example ping output in a cxfeldev terminal showing replies and no packet loss
        :width: 720px

        Example output: replies list ``bytes`` from the host; ``0% packet loss`` means the chassis is reachable.

     - If the ping is successful (returns some ``bytes`` and not ``packet loss``), the chassis is reachable.
   
     - Pinging can only be done if the chassis is in "GOLD" mode. 
   
       - GOLD vs APP is managed from Phoebus **FPGA boot control** on the Quartz screen (Event / Devel); see :doc:`/cs_studio/tabs/index`.

#. If anything is unclear physically (which connector or which port), stop and verify against the
   diagrams before applying signals, or ask Alex Gardeck or Mark Holl for assistance.
