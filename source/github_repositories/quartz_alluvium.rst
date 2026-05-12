.. orphan::

.. _quartz-alluvium:

Alluvium and Flashing Procedure
======================================

Alluvium
--------

Alluvium (from the Osprey repository) accesses the flash attached to the Field-Programmable Gate Array (FPGA).

Typical APP update sequence::

   # clear flash status
   alluvium clear

   # verify against local bitfile
   alluvium verify app <bitfile>

   # program APP region (erase + program + verify)
   alluvium program app <bitfile>

Then in Phoebus, use ``boot app`` to load the new image.

[image needed: terminal session running alluvium clear/verify/program]

Miscellaneous notes
-------------------

- After FPGA reset, the first flash status read can show error bits. Running one status/``clear``
  cycle usually restores normal values.
- Rare MMC “lock-ups” during heavy testing were fixed by a full power cycle of the chassis.

See also :doc:`bringup_procedures` and :doc:`quartz_boot` for bring-up order and boot modes.
