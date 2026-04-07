Main tabs
=========

After reaching the home screen (:doc:`../boot_procedure`), routine work uses three main areas of the
Phoebus (Control System Studio, CS-Studio) display: Global, Event, and Network. Event Timing (EVT) and
Quartz chassis screens are reached from the Event tab (see :doc:`/osprey/evt_chassis`). Initial EVG and
EVR bring-up (EVT, Quartz, fiber interconnect, inputs, and where to read status) is documented in
:doc:`/osprey/initial_bring_up`.

.. _phoebus-global-tab:

Global tab
----------

Open ``System Manual`` to access Henrik's documentation.

.. _phoebus-event-tab:

Event tab (Devel)
-----------------

Select ``Devel``. On the left: ``DG645 #X`` (`DG645 manual <https://www.thinksrs.com/downloads/pdfs/manuals/DG645m.pdf>`_).
On the right: ``Quartz #N`` (chassis). ``EVT #N`` appears beside Quartz at the same hierarchy level;
see :doc:`/osprey/evt_chassis`.

.. figure:: ../../images/diagrams/Testing\ Rig\ Diagrams-DG645\ Front\ Panel.drawio.png
   :alt: DG645 delay generator front panel (reference)
   :width: 720px

``Acq. Recording`` → ``Control`` → ``Last Completed File`` → ATF previewer ``File`` → ``Open``. Full
notes: :ref:`atf-previewer` on :doc:`/osprey/quartz_daq_repo`.

.. figure:: ../../images/Acq\ Control.png
   :alt: Acq. Recording Control tab showing Last Completed File
   :width: 800px

See also: :doc:`/osprey/quartz_firmware`.

.. _phoebus-network-tab:

Network tab
-----------

Host and switch topology (depends on the display export). Chassis IP: :doc:`/osprey/quartz_firmware`.
EVT links and status: :doc:`/osprey/evt_chassis`.
