.. _quartz-vs-evt-timing:

EVG, EVR, EVT?
=====================

Purpose
-------

This page defines the core model used throughout the docs:

- Event Generator (EVG) and Event Receiver (EVR) are **timing roles**.
- Analog (Quartz) and Digital (EVT) are **hardware families**.
- A hardware family does not automatically fix EVG versus EVR role.

Roles vs Hardware Family
---------------------------------

- **EVG role**

  - One node in a timing island acts as the source of event stream timing.
  - That node distributes events to downstream nodes over fiber.

- **EVR role**

  - Receivers consume the event stream and produce local outputs or triggers.
  - Most nodes in a timing island are EVRs.

- **Hardware family**

  - Quartz is the analog acquisition chassis family.
  - EVT is the digital timing/trigger chassis family.
  - Either family can be configured as EVG or EVR depending on wiring and configuration, and they can be interconnected.

Analog Chassis (Quartz)
-----------------------------------

- Primary function: analog acquisition with DB37 front interfaces.
- Timing fabric: participates in the same fiber timing network as EVT.
- Physical timing ports: eight Lucent Connector (LC) fiber ports (front panel) used for timing tree connections.
- IOC path: Quartz runs in the Quartz/ATF IOC workflow, not the EVT timing IOC tree.
- Hardware reference: use both Quartz front and back panel diagrams together to represent one chassis, which can also be seen below:

.. figure:: ../images/diagrams/drawio/Testing\ Rig\ Diagrams-Quartz\ Chassis\ Front\ Panel.drawio.png
   :width: 720px
   
   Quartz chassis front panel (DB37 analog connectors)

.. figure:: ../images/diagrams/drawio/Testing\ Rig\ Diagrams-Quartz\ Chassis\ Back\ Panel.drawio.png
   :width: 720px

   Quartz chassis back panel
   

Digital Chassis (EVT)
---------------------------------

- Primary function: digital timing and trigger I/O with SMA connectors on the front panel and LC fiber ports on the back panel.
- Timing fabric: participates in the same fiber timing network as Quartz.
- Physical timing ports: eight Lucent Connector (LC) fiber ports (back panel) used for timing tree connections.
- IOC path: EVT runs in the EVT timing IOC workflow, not the Quartz IOC tree.
- Hardware reference: use both EVT front and back panel diagrams together to represent one chassis, which can also be seen below:

.. figure:: ../images/diagrams/drawio/Testing\ Rig\ Diagrams-Digital\ Chassis\ Front\ Panel.drawio.png
   :alt: EVT digital chassis front panel (SMA trigger I/O)  
   :width: 720px

   EVT digital chassis front panel (SMA trigger I/O)

.. figure:: ../images/diagrams/drawio/Testing\ Rig\ Diagrams-Digital\ Chassis\ Back\ Panel.drawio.png
   :alt: EVT digital chassis back panel (LC timing fiber)
   :width: 720px  
   
   EVT digital chassis back panel (LC timing fiber)

Fiber Port Layout
------------------------------------

Analog (Quartz) and Digital (EVT) follow the same fiber port layout in vendor docs:

- Port 1: EVR in
- Port 2: Fan-out in
- Ports 3-8: Fan-out outputs

Where to go next
----------------

- :doc:`/github_repositories/bringup_procedures` for step-by-step EVG/EVR bring-up.
- Quartz Phoebus controls and vendor manuals: :doc:`/cs_studio/tabs/index` and :doc:`/equipment_manual`; upstream Quartz DAQ reference: `Quartz DAQ 250‑24 <https://github.com/osprey-dcs/quartz-daq-250-24?tab=readme-ov-file>`_.
