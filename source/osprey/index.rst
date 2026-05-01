GitHub Repositories
=====================

Purpose
-------

This section synthesizes GitHub repositories provided by Osprey Distributed Control Systems (DCS), and additional repositories used for this project.
It separates timing roles (Event Generator/Event Receiver) from hardware families (Analog Quartz/Digital EVT),
then points to bring-up, firmware, and integration references.

Guide to Resources
------------------

- :doc:`quartz_vs_evt_timing`

  - Defines Event Generator (EVG) and Event Receiver (EVR) as timing roles.
  - Explains how Analog Quartz and Digital EVT hardware can each operate in either role.

- :doc:`bringup_procedures`

  - Provides a step-by-step bring-up sequence for EVT and Quartz and interconnecting them.

- :doc:`integration_reference`

  - Explains how fiber, PPS, and NTP fit together with Analog Quartz and Digital EVT.
  - Clarifies Input/Output Controller (IOC) boundaries.

- :doc:`evt_chassis`

  - Documents Digital EVT chassis hardware, interfaces, and operational notes.
  - Helps with rack-level integration and timing hardware troubleshooting.

- :doc:`quartz_firmware`

  - Summarizes Quartz firmware and service workflow.
  - Includes references used for chassis-level bench validation.

- :doc:`quartz_daq_repo`

  - Links to Osprey’s public Quartz DAQ repo on GitHub and how the source tree is organized.
  - Use it when you need the vendor’s layout, build notes, or where a feature lives in code.

..
   Descriptions cannot live inside one ``toctree`` list. This hidden tree still registers
   the child pages for navigation; the bullets above are what readers see on this page.

.. toctree::
   :maxdepth: 1
   :hidden:

   quartz_vs_evt_timing
   bringup_procedures
   integration_reference
   evt_chassis
   quartz_firmware
   quartz_daq_repo
