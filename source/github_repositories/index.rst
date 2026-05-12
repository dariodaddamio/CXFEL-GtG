GitHub Repositories
=====================

Purpose
-------

This section synthesizes GitHub repositories provided by Osprey Distributed Control Systems (DCS), and additional repositories used for this project.
It separates timing roles (Event Generator/Event Receiver) from hardware families (Analog Quartz/Digital EVT),
then points to bring-up procedures and the canonical timing model.

Guide to Resources
------------------

- :doc:`/github_repositories/quartz_vs_evt_timing`

  - Defines Event Generator (EVG) and Event Receiver (EVR) as timing roles.
  - Defines Analog (Quartz) and Digital (EVT) hardware families, and how they can each operate in either role (EVG or EVR).
  - Consolidates role setup guidance, fiber port meaning, and IOC/service boundary notes.

- :doc:`/github_repositories/bringup_procedures`

  - Provides a step-by-step bring-up sequence for Analog (Quartz) and Digital (EVT) and interconnecting them.

..
   Descriptions cannot live inside one ``toctree`` list. This hidden tree still registers
   the child pages for navigation; the bullets above are what readers see on this page.

.. toctree::
   :maxdepth: 1
   :hidden:

   quartz_vs_evt_timing
   bringup_procedures
