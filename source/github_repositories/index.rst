GitHub Repositories
=====================

Purpose
-------

This section synthesizes GitHub repositories provided by Osprey Distributed Control Systems (DCS), and additional repositories used for this project.
It separates timing roles (Event Generator/Event Receiver) from hardware families (Analog Quartz/Digital EVT),
then points to bring-up procedures and the canonical timing model.

Note that the original GitHub reposities are very verbose, and may be time-consuming and confusing to process.

Analog chassis (Quartz)
-----------------------

This is the GitHub for the analog chassis: `Quartz DAQ-250-24 <https://github.com/osprey-dcs/quartz-daq-250-24>`_

- Open hardware collateral for the Quartz DAQ-250-24 chassis, including mechanical CAD, bill of materials, and wiring drawings.
- Pre-built firmware images and a firmware directory for the Marble and Quartz boards.
- A ``documentation/`` directory of Markdown guides for Quartz bring-up, EPICS IOC work, acquisition settings, chassis setup and recovery, and the on-disk data format.
- Other material at the repository root such as bench reports or platform-specific notes.

Digital chassis (EVT)
---------------------

This is the GitHub for the digital chassis: `timing-ioc <https://github.com/osprey-dcs/timing-ioc>`_

- EPICS timing IOC source for the Osprey timing driver, with README covering dependencies, layout, and how to build the project.
- ``iocBoot/iocEVT/`` holds the IOC boot scripts (``EVT_IPADDR`` and ``st.cmd`` are used there at runtime).
- ``opi/`` holds Phoebus operator interface files for the timing screens.
- ``documentation/`` Markdown notes on firmware topics, including serial console access, TFTP image updates, NTP and PPS for the event generator, and optical fiber port roles.

Guide to Resources
------------------

- :doc:`/github_repositories/quartz_vs_evt_timing`

  - Defines Event Generator (EVG) and Event Receiver (EVR) as timing roles.
  - Defines Analog (Quartz) and Digital (EVT) hardware families, and how they can each operate in either role (EVG or EVR).
  - Consolidates role setup guidance, fiber port meaning, and IOC/service boundary notes.

- :doc:`/github_repositories/bringup_procedures`

  - Step-by-step bring-up for Quartz and EVT, including preflight. Subpage :doc:`/github_repositories/gold_vs_app` covers GOLD vs APP and FPGA boot control screenshots.

..
   Descriptions cannot live inside one ``toctree`` list. This hidden tree still registers
   the child pages for navigation; the bullets above are what readers see on this page.

.. toctree::
   :maxdepth: 2
   :hidden:

   quartz_vs_evt_timing
   bringup_procedures
