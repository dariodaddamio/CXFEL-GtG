.. _equipment-manual:

Equipment Manual
================

Vendor PDF ls and bench equipment documentation used with CXFEL timing bring-up.

The links below are the **canonical** copies (vendor / ManualsLib). The docs do not require
checked-in PDFs for a normal HTML build.

**Architecture PDFs (Internal Documentation):** :doc:`/internal/daq_architecture_pdf` (ASU timing and DAQ proposal) and :doc:`/internal/nsls2_timing_pdf` (NSLS-II timing design).

**Optional offline library:** if you want vendor PDFs in the repository (for example air-gapped
preview builds), add them under ``source/_static/pdfs/vendor/`` and link them here with Sphinx’s
``:download:`` role. Older ad-hoc copies under a repo-root ``assets/`` folder were removed after
they duplicated those public URLs or the NSLS-II PDF already in ``_static/pdfs/``; restore them from
backup or re-download if you still want that layout.

- `Stanford Research Systems FS740 manual (PDF) <https://www.thinksrs.com/downloads/pdfs/manuals/FS740m.pdf>`_
- `Stanford Research Systems DG645 manual (PDF) <https://www.thinksrs.com/downloads/pdfs/manuals/DG645m.pdf>`_
- `Siglent SDS1104X-E manual (ManualsLib) <https://www.manualslib.com/manual/3204284/Siglent-Technologies-Sds1104x-E.html>`_
