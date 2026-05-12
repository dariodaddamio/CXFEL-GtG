Main tabs
=========

After reaching the home screen (:doc:`../boot_procedure`), routine work uses three main areas of the
Phoebus (Control System Studio, CS-Studio) display: Global, Event, and Network. Event Timing (EVT) and
Quartz chassis screens are reached from the Event tab **Devel** area below. Initial EVG and
EVR bring-up (EVT, Quartz, fiber interconnect, inputs, and where to read status) is documented in
:doc:`/github_repositories/bringup_procedures`.

.. _phoebus-global-tab:

Global Tab
----------

Primarily used to access the System Manual to access Henrik's documentation. Go to :doc:`/internal/index` for more information.

.. _phoebus-event-tab:

Event Tab
---------

Open the **Event** tab, then the **Devel** sub-tab. Timing-system development screens (DG645, Quartz,
ATF Previewer, and EVT) are grouped here.

- On the left: ``DG645 #X`` (`DG645 manual <https://www.thinksrs.com/downloads/pdfs/manuals/DG645m.pdf>`_).

  Phoebus reaches the delay generator over the lab network. The Operator Interface (OPI) mirrors the front-panel feature
  set (repetition rate, delays, amplitudes, and channel routing). Use it when you need bench triggers
  or delay lines relative to Quartz acquisition or scope checks. A very low duty-cycle output can be
  hard to see on a scope, because the trigger is not synchronized to every acquisition sweep.

- On the right: ``Quartz #1-4`` (analog).

  Each control opens the Quartz screen for that chassis: analog channels, acquisition
  enables, and status LEDs that show which channels are armed for acquisition (the chassis “scope”
  style view). Firmware actions such as **Boot GOLD** are available from the same family of displays
  when you need to re-enter the bootloader image from the network. If OPI files change on the server,
  return to the Phoebus home **Event** panel and refresh (**F5**) so clients load the latest screens.
  Boot mode, USB console, Ethernet/NTP, and Alluvium are documented on :doc:`/github_repositories/quartz_boot`,
  :doc:`/github_repositories/quartz_usb`, :doc:`/github_repositories/quartz_network`, and :doc:`/github_repositories/quartz_alluvium`.

- ``ATF Previewer``.

  A button on this Event / Devel panel launches the ATF acquisition preview tool so you can open and
  inspect captured waveforms without leaving CS-Studio. Typical hand-off from a run:
  **Acq. Recording → Control → Last Completed File**, then in the ATF previewer **File → Open** and
  paste the path (see :ref:`atf-previewer` on :doc:`/github_repositories/quartz_daq_repo`). During tests, enable only
  wired channels so unused logical channels do not clutter the signal list.

- Below that, ``EVT #N`` (digital).

  Each **N** opens the timing-IOC Operator Interface for that EVT chassis: fiber link widgets aligned
  with back-panel ports 1–8, Pulse Per Second (PPS) and network fields when the node is in Event
  Generator (EVG) mode, and forward/reverse link diagnostics. Event or receive logs in the expert views
  are used during bring-up checks (for example matching scope behavior to configured event codes).
  Phoebus only reflects what the IOC reports—if a chassis disappears, verify the timing IOC and network
  before chasing display issues. Fiber roles, EVT checklists, and rack sequencing are documented in
  :doc:`/github_repositories/bringup_procedures`.

.. figure:: ../../images/EVT \ Screen \ Example.png
   :alt: Example of the EVT screen
   :width: 600px

   Example EVT timing screen: fiber link widgets (1–8), configuration fields, and diagnostic or receive
   logs used during bring-up.

.. figure:: ../../images/Acq\ Control.png
   :alt: Acq. Recording Control tab showing Last Completed File
   :width: 800px

   **Acq. Recording** control view: use **Last Completed File** as the path source for the ATF previewer
   **File → Open** workflow.

See also: :doc:`/github_repositories/bringup_procedures`, :doc:`/github_repositories/quartz_network`.

.. _phoebus-network-tab:

Network tab
-----------

Host and switch topology (depends on the display export). Chassis IP fields: :doc:`/github_repositories/quartz_network`.
EVT links and status checks: :doc:`/github_repositories/bringup_procedures`.
