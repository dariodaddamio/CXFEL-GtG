DAQ architecture proposal
=========================

The original architecture proposal for the CXFEL timing and DAQ system describes how a
GPS-disciplined atomic clock provides a global reference, and how the local timing hardware
derives clocks and event streams from it.

Key concepts
------------

- A GPS receiver and atomic reference generate a stable **1 pulse-per-second (1 PPS)** signal.
- Local timing hardware uses that 1 PPS to synthesize higher-frequency clocks while staying
  locked to the global reference.
- The accelerator’s **1 kHz repetition rate** is represented as an event pattern on this timing
  infrastructure, so EVRs can convert events into precise local triggers, gates, and other actions.

.. raw:: html

   <object data="_static/pdfs/ASUTimingAndDAQArchitectureR1.pdf"
           type="application/pdf"
           width="100%"
           height="800px"
           style="border: 1px solid #ccc;">
     <p>
       Your browser does not support inline PDF preview.
       You can
       <a href="_static/pdfs/ASUTimingAndDAQArchitectureR1.pdf">download the PDF directly</a>.
     </p>
   </object>
