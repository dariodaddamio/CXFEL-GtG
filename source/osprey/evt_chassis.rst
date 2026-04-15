EVT chassis
===========

This page is EVT-specific. EVT is the **digital chassis family**; Event Generator (EVG) versus Event
Receiver (EVR) is assigned by wiring and configuration, not by chassis name alone.

For the role model (EVG/EVR) versus hardware model (Quartz/EVT), see :doc:`quartz_vs_evt_timing`.
For stack-wide wiring and IOC boundaries, see :doc:`integration_reference`.

.. _evt-fiber-debug:

Hardware snapshot
-----------------

- Front panel: digital trigger I/O (SMA connectors).
- Back panel: eight LC fiber ports for timing-tree links.
- IOC identity in Phoebus: ``EVT #N``.

Fiber ports (back panel)
------------------------

.. list-table::
   :widths: 22 78
   :header-rows: 1

   * - Port role (label)
     - Role in the timing tree
   * - 1 EVR in
     - Receive path from upstream.
   * - 2 Fan-out in
     - Return/merge-side fan-in path.
   * - 3-8 Fan-out outputs
     - Downstream outputs to EVT/Quartz nodes.

Phoebus link widgets 1-8 map to these physical ports.

Bring-up checklist
------------------

#. Use the timing IOC tree for EVT instances (not Quartz startup trees).
#. In EVG mode, apply PPS to input 1 and verify source frequency is 1 Hz.
#. Confirm NTP server, IP, netmask, and gateway match lab network design.
#. Verify fiber routing against rack map before software-level debugging.
#. Validate outputs on scope/diagnostic endpoints after link health is stable.

Common failure patterns
-----------------------

- Forward path healthy, reverse path unhealthy: treat as separate diagnostics.
- Wrong PPS rate (for example kHz instead of 1 Hz): PLL/timestamps remain incorrect.
- Wrong network mask/gateway: intermittent links or PHY resets that look like hardware faults.
- Post-flash settings drift: re-enter NTP/network fields after erase/program operations.

Diagram placeholder
-------------------

EVT front/back formal diagram is pending. Keep this page text-first for now and add the diagram after
the EVT chassis drawing is finalized.

Checklist
---------

- :doc:`initial_bring_up` for full sequence across racks.
- :doc:`quartz_vs_evt_timing` for role-versus-hardware definitions.
- :doc:`integration_reference` for cross-system IOC and wiring context.
