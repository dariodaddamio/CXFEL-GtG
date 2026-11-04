Timing console frontend
=======================

This folder contains the React, TypeScript and shadcn UI source for the localhost LED timing interface. It is a separate frontend preview and is not part of the published experiment report.

Run the preview
---------------

Use Node.js 22.12 or later, then run these commands from the repository root::

    cd frontend
    npm ci
    npm run dev

Open http://127.0.0.1:5173. Changes to files in ``src/`` update the preview.
The form fields can be edited. Camera images, receiver measurements and saved recordings remain unavailable because this checkout has no timing backend. It generates no sample measurements.

To build and inspect the static frontend::

    npm run build
    npm run preview

The static preview opens at http://127.0.0.1:4173.

Scope
-----

``src/App.tsx`` contains the layout and form interactions. ``src/components/ui/`` contains the shadcn components, and ``src/api.ts`` retains the TypeScript interface contracts. Its request function rejects device and storage operations; there is no API proxy.

No EPICS client, IOC configuration, hardware-control backend, firmware, acquisition script, credential or recorded run is included. The operational localhost service remains separate. Generated files and installed dependencies are ignored by Git.

The included shadcn UI license is in ``SHADCN-LICENSE.txt``.

Receiver cycle display
----------------------

``EventTimeline`` accepts ``events`` (receiver IP, event code, seconds and nanoseconds) and ``programmedGapNs`` for a live feed. It can also read an existing recording through the API contract. ``cycle-timing.ts`` uses integer hardware timestamps, pairs each receiver's 42/43 markers, and matches only unique cross-receiver candidates. Missing or ambiguous cycles remain unmatched. The two lanes share the first receiver's event-42 origin so receiver offsets remain visible. Host receipt and polling timestamps are not accepted as plot coordinates.

Run ``npm test`` for the focused pairing and precision checks. These tests use synthetic inputs to exercise edge cases; they are not experiment measurements. The archived-trial browser validation uses actual receiver records separately from this frontend-only preview.
