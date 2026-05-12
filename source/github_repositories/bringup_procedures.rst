.. _bringup-procedures:

Bring-Up and Testing
===================


Recall:

- Conceptual background is in :doc:`quartz_vs_evt_timing`
- Quartz chassis fields and console work: :doc:`quartz_network`, :doc:`quartz_boot`, :doc:`quartz_usb`, and :doc:`quartz_alluvium` as needed.
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
   
       - Find out what this means here: :doc:`quartz_boot`.

#. If anything is unclear physically (which connector or which port), stop and verify against the
   diagrams before applying signals, or ask Alex Gardeck or Mark Holl for assistance.

.. _bringup-analog:

1. Analog (Quartz) Bring-Up and Testing
---------------------------------------

Preflight prerequisites:
   Complete all items in **Preflight** above before starting this section.

.. _bringup-analog-evg:

**A. EVG bring-up**

#. Physical setup: select the Quartz node that will act as EVG.

   - Recall: Preflight already set the EVG baseline loop (port 1 -> port 3) on the selected node.
   - Keep all other downstream links disconnected until baseline is stable.
   - Expected: EVG baseline loop is physically installed on the selected Quartz EVG only.

#. Phoebus verification: open the Quartz EVG controls path.

   - Use Quartz OPI / ATF-Quartz IOC controls (not ``EVT #N``).
   - Expected: the selected node appears in Quartz controls and is clearly the node being configured.

#. Software/network setup: configure EVG network fields on the Quartz EVG candidate.

   - Set IP/netmask/gateway/NTP according to rack/fiber map and Quartz guidance in :doc:`quartz_network`.
   - Expected: configured values persist and match the planned EVG network identity.

#. Testing (lab-validated only):

   - Run only the checks already documented in `docx_extract/`.
   - Expected: no test procedure is executed unless it already exists in `docx_extract/`.
   - If no applicable test exists, record: **Not yet validated in lab**.

#. Stop condition before continuing:

   - If Quartz controls do not show expected EVG state, stop here, re-check physical loop and PPS path, then re-verify before continuing.
   - Expected: EVG state is confirmed before any EVR setup starts.

.. _bringup-analog-evr:

**B. EVR add-on and setup**

#. Physical setup: connect one Quartz EVR path at a time to the already verified Quartz EVG.

   - Connect upstream timing fiber to EVR input path; do not add EVG 1->3 loop on EVR-only nodes.
   - Expected: EVR node has upstream timing input and no EVG baseline loop.

#. Phoebus verification: open the Quartz EVR node in Quartz controls.

   - Verify receive/link indicators and event/log behavior for the newly added EVR node.
   - Expected: EVR receive/link and logs are stable before adding another node.

#. Software/network setup: configure EVR network/role settings as needed for EVR-only behavior.

   - Apply only settings documented for EVR behavior in :doc:`quartz_network`.
   - Expected: EVR node remains in receiver behavior and does not act as EVG.

#. Testing (lab-validated only):

   - Execute only tests currently documented in `docx_extract/`.
   - Expected: test coverage does not exceed lab-validated documented scope.
   - If no applicable test exists, record: **Not yet validated in lab**.

#. Stop condition before next EVR:

   - If EVR receive/link state is unstable, stop and fix current node before adding another EVR.
   - Expected: each EVR is stable before scaling out.

.. _bringup-digital:

2. Digital (EVT) Bring-Up and Testing
-------------------------------------

Preflight prerequisites:
   Complete all items in **Preflight** above before starting this section.

.. _bringup-digital-evg:

**A. EVG bring-up (Digital / EVT)**

#. Physical setup: select the digital node that will act as EVG.

   - Recall: Preflight already set the EVG baseline loop (port 1 -> port 3) on the selected EVT node.
   - Keep downstream EVR links disconnected until baseline is stable.
   - Expected: only the selected EVT EVG has the 1->3 baseline loop installed.

#. Phoebus verification: open the EVG candidate in Event tab as ``EVT #N``.

   - Verify the selected physical chassis maps to the opened ``EVT #N`` instance.
   - Expected: operator confirms correct chassis-to-widget mapping before changes proceed.

#. Software/network setup: configure EVG network fields for the selected digital EVG.

   - Set IP/netmask/gateway/NTP according to rack/fiber map and current IOC configuration requirements.
   - Expected: EVG network identity is correct and persistent.

#. Testing (lab-validated only):

   - Run only tests already documented in `docx_extract/`.
   - Expected: no undocumented test procedure is introduced here.
   - If no applicable test exists, record: **Not yet validated in lab**.

#. Stop condition before continuing:

   - If Event tab does not show expected EVG role/state, stop, fix physical setup first, then re-verify before continuing.
   - Expected: EVG role/state is confirmed before EVR setup starts.

.. _bringup-digital-evr:

**B. EVR add-on and setup (Digital / EVT)**

#. Physical setup: connect one EVR node at a time to the verified digital EVG.

   - Connect upstream timing fiber to EVR input path; ensure EVR-only nodes do not keep EVG 1->3 loop.
   - Expected: EVR node has upstream timing input and no EVG baseline loop.

#. Phoebus verification: open each EVR node as ``EVT #N`` and verify receive/link state.

   - Confirm event/RX log behavior is stable for each added EVR before adding the next one.
   - Expected: current EVR is stable before scale-out.

#. Software/network setup: configure EVR network fields as required for the node.

   - Apply only node-specific settings needed for EVR operation in the current IOC deployment.
   - Expected: EVR node remains receiver behavior and communicates on expected network settings.

#. Testing (lab-validated only):

   - Execute only tests documented in `docx_extract/`.
   - Expected: testing remains within documented, lab-validated scope.
   - If no applicable test exists, record: **Not yet validated in lab**.

#. Stop condition before next EVR:

   - If receive/link or logs are unstable, stop and fix current EVR before adding the next one.
   - Expected: each EVR node is stable before further expansion.

See also
--------

:doc:`quartz_network`, :doc:`quartz_vs_evt_timing`, :doc:`/diagram_index`.
