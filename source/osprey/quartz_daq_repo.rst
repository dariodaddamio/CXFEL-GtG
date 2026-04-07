Quartz DAQ (upstream)
=====================

Vendor **GitHub** repository, **quickstart** (read upstream), and **ATF previewer** (Acquisition Test
Framework (ATF) acquisition preview tooling; vendor naming) for acquisition files. Chassis steps are on
:doc:`quartz_firmware`.

`Quartz DAQ 250‑24 <https://github.com/osprey-dcs/quartz-daq-250-24?tab=readme-ov-file>`_

`Quickstart (Quartz DAQ) <https://github.com/osprey-dcs/quartz-daq-250-24/blob/master/documentation/quick-start.md>`_

.. _atf-previewer:

ATF previewer
-------------

Open acquisition files from Quartz. In Phoebus: **Acq. Recording → Control** → **Last Completed File**,
then ATF previewer **File → Open** and paste the path.

**Gotchas:** unnamed channels clutter the signal list; for tests, enable only wired channels.

Then: :doc:`quartz_firmware` · GUI Event tab: :ref:`phoebus-event-tab`
