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
