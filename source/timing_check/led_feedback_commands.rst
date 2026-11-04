:orphan:

LED feedback command review
===========================

Not executed. These commands require approval before a live trial.

Condition: one fresh dark frame, then a fresh bright frame in CAM2.
Response: event 42 once; no transition means no response trigger.

Apply
-----

.. code-block:: bash

   pvput -w 3 EVT:DEV2:30:EVR:OUT:1:source 0
   pvput -w 3 EVT:DEV2:20:EVG:TMR:1:divisor 125000000
   pvput -w 3 EVT:DEV2:30:EVR:OUT:1:delay 0.0
   pvput -w 3 EVT:DEV2:30:EVR:OUT:1:width 100000.0
   pvput -w 3 EVT:DEV2:30:EVR:OUT:1:source 1
   pvput -w 3 EVT:DEV2:10:EVR:LOG:evt3 42
   pvput -w 3 EVT:DEV2:40:EVR:LOG:evt3 42
   pvput -w 3 EVT:DEV2:20:EVG:SEQ:1:disarm 1
   pvput -w 3 EVT:DEV2:20:EVG:SEQ:1:HWrise 0
   pvput -w 3 EVT:DEV2:20:EVG:SEQ:1:HWfall 0
   pvput -w 3 EVT:DEV2:20:EVG:SEQ:1:Tmr 0
   pvput -w 3 EVT:DEV2:20:EVG:SEQ:1:tMode 0
   pvput -w 3 EVT:DEV2:20:EVG:SEQ:1:slo 1000000000
   pvput -w 3 EVT:DEV2:20:EVG:SEQ:1:codes '[42,255]'
   pvput -w 3 EVT:DEV2:20:EVG:SEQ:1:times '[0.0,1000.0]'
   pvput -w 3 EVT:DEV2:20:EVG:SEQ:1:store 1

After detection only
--------------------

.. code-block:: bash

   pvput -w 3 EVT:DEV2:20:EVG:SEQ:1:arm 1
   pvput -w 3 EVT:DEV2:20:EVG:SEQ:1:trig 1

Stop
----

.. code-block:: bash

   pvput -w 3 EVT:DEV2:20:EVG:SEQ:1:disarm 1

Restore
-------

.. code-block:: bash

   pvput -w 3 EVT:DEV2:20:EVG:SEQ:1:disarm 1
   pvput -w 3 EVT:DEV2:20:EVG:SEQ:1:HWrise 0
   pvput -w 3 EVT:DEV2:20:EVG:SEQ:1:HWfall 0
   pvput -w 3 EVT:DEV2:20:EVG:SEQ:1:Tmr 0
   pvput -w 3 EVT:DEV2:20:EVG:SEQ:1:tMode 0
   pvput -w 3 EVT:DEV2:20:EVG:SEQ:1:slo 1000000000.0
   pvput -w 3 EVT:DEV2:20:EVG:SEQ:1:codes '[0]'
   pvput -w 3 EVT:DEV2:20:EVG:SEQ:1:times '[0.0]'
   pvput -w 3 EVT:DEV2:20:EVG:SEQ:1:store 1
   pvput -w 3 EVT:DEV2:10:EVR:LOG:evt3 0
   pvput -w 3 EVT:DEV2:40:EVR:LOG:evt3 0
   pvput -w 3 EVT:DEV2:30:EVR:OUT:1:source 0
   pvput -w 3 EVT:DEV2:20:EVG:TMR:1:divisor 12500000
   pvput -w 3 EVT:DEV2:30:EVR:OUT:1:delay 0.0
   pvput -w 3 EVT:DEV2:30:EVR:OUT:1:width 100000.0
   pvput -w 3 EVT:DEV2:30:EVR:OUT:1:source 1
