# TODO (documentation gaps)

This file tracks documentation items that are either:

- not covered in the recorded EVG/EVR meetings, or
- covered in meetings but not yet captured cleanly in the docs.

## Quartz / Osprey documentation

- [ ] Add screenshots to Quartz firmware pages:
  - [ ] Phoebus `FPGA boot control` showing GOLD vs APP hash/build.
  - [ ] Rear panel photo showing micro-USB port (Quartz).
  - [ ] OS view showing which USB serial devices map to MMC vs debug console.
  - [ ] Terminal capture of Alluvium `clear` / `verify` / `program`.

- [ ] Document “who talks to who” on the Quartz testbed:
  - [ ] IOC host(s) and where they run (procServ/systemd), and naming conventions.
  - [ ] What is expected to work with only Ethernet (no USB attached).
  - [ ] What requires USB attached (MMC, debug console).

- [ ] Pinouts and channel mapping:
  - [ ] Confirm DB37 pinout reference for the breakout boards (beyond the one lab-tested mapping).
  - [ ] Confirm DB1 vs DB2 channel mapping table (what is channel 1 vs channel 17, etc.).

## EVT (digital timing chassis)

Most EVT items are not in the meetings yet (or are only discussed at a high level).

- [ ] Add an EVT overview page:
  - [ ] EVT chassis purpose and how it differs from Quartz (ADC vs digital timing).
  - [ ] What “8 channels” means (inputs/outputs, PPS reservation when acting as EVG).
  - [ ] Expected workflow in Phoebus (screens, PVs).
  - [ ] How Quartz and EVT are expected to coexist (one EVG only; distribution plan).

- [ ] Add an EVT bring-up checklist:
  - [ ] Firmware/IOC install steps (once delivered).
  - [ ] PPS/NTP requirements.
  - [ ] First “hello world” trigger test (TTL out -> scope).

## Timestamping and detector integration (open design)

Meetings discuss the need, but do not fully specify implementation.

- [ ] Define the “timestamp association” strategy for triggered devices:
  - [ ] Where the event timestamp lives (EVT receiver timestamp per event code).
  - [ ] How areaDetector (or other pipelines) will buffer frames and timestamps and match them.
  - [ ] Failure modes (off-by-one, dropped frame) and how they are detected/flagged.
  - [ ] Policy: “drop data” vs “mark damaged” (meetings lean toward marking damaged).

- [ ] For each major detector class, document a minimal integration target:
  - [ ] Dectris (Eiger4) ZMQ metadata availability (what timestamps exist today).
  - [ ] Mako/Prosilica-style GigE camera (simple trigger + frame timestamp).
  - [ ] “1D digitizer” class (shot-by-shot traces, required sample windows).

## Internal docs integration

- [ ] Add links into Henrik’s internal docs (do not duplicate) for:
  - [ ] NTP/chrony setup (already referenced, but link location/page needs to exist in Sphinx).
  - [ ] Creating a new IOC instance + system service setup.
  - [ ] SELinux disable note (already in internal docs; link it from relevant troubleshooting pages).

## Housekeeping

- [ ] Decide on consistent terminology:
  - [ ] “Phoebus (CS-Studio)” first mention, then “Phoebus” on each page.
  - [ ] “MMC console” vs “debug console” naming (and which USB device index maps to each).

## CS-Studio tab docs

The CS-Studio (Phoebus) tab pages are intentionally short, but some are effectively stubs.

- [ ] `source/cs_studio/tabs/global.rst`
  - [ ] Expand beyond “System Manual” pointer (brief list of common global entries relevant to DAQ).

- [ ] `source/cs_studio/tabs/network.rst`
  - [ ] Add 1–2 bullets describing what the Network tab actually shows (switch view, host list, etc.).
  - [ ] Keep Quartz‑specific details in Osprey docs; only add CS-Studio‑level description here.

- [ ] `source/cs_studio/tabs/index.rst`
  - [ ] Fix typos in the “global opasderations / theasdn” line.
  - [ ] Add one‑line descriptions under Event / Network entries for quick navigation.
