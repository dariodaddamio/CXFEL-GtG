Event tab
=========

At the top of this section, we can see: ``Accel``, ``Hutch``, and ``Devel``. We will be focusing on
the ``Devel`` tab.

DG645
-----

On the left column we can see buttons to access DG645 settings. Focusing on the ``DG645 #X``
buttons, each of these opens a GUI for managing channels.

The DG645 screen is essentially the front panel of the physical device, but in digital form. It
consists of several tabs that correspond to specific behaviors, which can be found in more detail
in the official manual.

Quartz Board
------------

On the right column, a crucial button is ``Quartz #1``. This is the main area to access
information about the physical Quartz chassis (chassis scope, ADC status, acquisition recording,
FPGA boot control, interlock I/O, etc.).

Acq. Recording / ATF previewer
------------------------------

In **Acq. Recording → Control**, look for the **Last Completed File** and copy its path.

Then in the ATF previewer: **File → Open** and paste that path.

.. figure:: ../../images/Acq\ Control.png
   :alt: Acq. Recording Control tab showing Last Completed File
   :width: 800px

   Acq. Recording Control tab (Last Completed File).

See also :doc:`/osprey/atf_previewer`.

