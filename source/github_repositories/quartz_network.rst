.. orphan::

.. _quartz-network:

Networking Configuration
===========================

Internet Control Message Protocol (ICMP) ping behavior
------------------------------------------------------

Observed:

- GOLD responds to ICMP ping
- APP may not respond to ping even when running correctly

Use ping only as a quick “GOLD is alive” check. For APP, rely on:

- Phoebus status (hash, build date, Event Generator (EVG) / Event Receiver (EVR) state)
- Input/Output Controller (IOC) or console tools

[image needed: simple diagram showing host <=> Quartz ping paths]

Gateway and netmask (/23)
-------------------------

Quartz needs to reach both ``10.139.4.x`` and ``10.139.5.x``. Use a /23 netmask.

Set gateway and netmask from the application/debug console::

   gw 10.139.4.1/23

This sets:

- default gateway: 10.139.4.1
- netmask: 255.255.254.0 (/23)

If left at /24:

- GOLD ping usually works
- application-level tools that cross .4/.5 may fail

Spanning-tree / switch delays
-----------------------------

Some switches delay traffic after link-up (spanning-tree).

Symptoms:

- first ping attempts fail or report “destination unreachable”
- pings start working after a few seconds

This is switch behavior, not a Quartz fault.

Event Generator (EVG) vs Event Receiver (EVR) (Network Time Protocol (NTP) and Pulse Per Second (PPS))
------------------------------------------------------------------------------------------------------

EVG role
^^^^^^^^

For a chassis that should act as an EVG:

- configure a valid NTP server
- provide PPS Transistor-Transistor Logic (TTL) input:

  - level: TTL (0–5 V)
  - rate: 1 Hz
  - duty cycle: < 50 %
  - rising edge at Global Positioning System (GPS) second

At CXFEL, the local NTP server for control-system hosts is::

   10.139.4.59

See Henrik’s documentation from Global tab -> Installation Procedures for ``chronyd`` configuration.

EVR-only role
^^^^^^^^^^^^^

For a chassis that should not act as EVG, disable NTP on the Quartz side::

   ntp 0.0.0.0

For EVT timing and EVG/EVR roles on
the digital chassis, see :doc:`quartz_vs_evt_timing` and :doc:`bringup_procedures`.
