.. _alluvium-quartz:

Alluvium (Quartz)
=================

Alluvium is a Python tool for talking to the Marble SPI flash over the lab Ethernet while the Quartz
chassis is up in GOLD (bootloader) and answering that traffic (:ref:`gold-vs-app`). It is not the timing IOC and not
Phoebus.

What it is for
--------------

- Clear flash error status after a bad programming attempt.

- Compare the **APP** region in flash to a reference bitfile.

- Load a new **APP** image from a Linux host without walking a full JTAG recovery.

- Upstream install and behavior are documented in `alluvium <https://github.com/mdavidsaver/alluvium>`_
  and in the Quartz repo ``documentation/`` (chassis setup and recovery).

Command shape
-------------

- General form:

  .. code-block:: text

     python3 -m alluvium <CHASSIS_IP> <subcommand> ...

- ``<CHASSIS_IP>`` comes from the rack map.

- Default LEEP port is **804** unless you spell the target as ``host:port``.

``status``
----------

- Read-only query of the SPI flash status registers (for example SR1 and SR2 in the upstream README).

  - Use it to see block protect bits, error flags, and write-in-progress before you erase or program.

``clear``
---------

- Clears flash status after a failed operation so a later command is not blocked on stale error bits.

``verify``
----------

- Compares flash starting at a base address to a reference bitstream. ``app`` is the upper 8M alias;
  ``gold`` is the lower 8M alias on the 16M Marble layout.

- **Reference is a file path**

  - ``python3 -m alluvium <CHASSIS_IP> verify app <path/to/file.bit>``

  - If you do not pass ``-S`` / ``--size``, the compare length defaults to the size of that file.

- **Reference is standard input**

  - ``python3 -m alluvium <CHASSIS_IP> verify app -``

  - Use ``-S`` / ``--size`` with a byte count when stdin is a pipe (not seekable), so Alluvium knows how many bytes to compare.

- Stock ``python3 -m alluvium`` still expects that third token after ``verify app``: a path or ``-``.
  If a local wrapper drops it, check ``python3 -m alluvium -h`` and ``python3 -m alluvium <CHASSIS_IP> verify -h`` on the machine you run from.

``program``
-----------

- ``python3 -m alluvium <CHASSIS_IP> program app <path/to/file.bit>``

  - Erases the **APP** region by default, programs it, then runs a verify pass unless you turn that off in the tool.

The same material is mirrored in plain text at ``docx_extract/Alluvium_CLI_reference.txt`` in this repository.

See also :doc:`/github_repositories/bringup_procedures` and :doc:`/github_repositories/gold_vs_app`.
