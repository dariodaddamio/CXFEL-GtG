#!/usr/bin/env python3
"""Record an existing camera acquisition and two event logs. No PV writes."""
import argparse
import csv
import datetime
import json
from pathlib import Path
import queue
import shutil
import subprocess
import time
import epics
import numpy as np

PREFIX = 'CAM:DEV2:20:'
FIELDS = [
    'cam1:Acquire_RBV', 'cam1:ImageMode_RBV', 'cam1:AcquireTime_RBV',
    'cam1:GC_TriggerMode_RBV', 'cam1:GC_TriggerSource_RBV',
    'cam1:GC_TriggerSelector_RBV', 'cam1:MinX_RBV', 'cam1:MinY_RBV',
    'cam1:TimeStampMode_RBV', 'cam1:UniqueIdMode_RBV',
    'image1:ArraySize0_RBV', 'image1:ArraySize1_RBV',
    'image1:UniqueId_RBV', 'image1:TimeStamp_RBV',
]

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, required=True)
    parser.add_argument('--event-python', default='/usr/bin/python3')
    parser.add_argument('--seconds', type=float, default=60)
    args = parser.parse_args()
    if not 1 <= args.seconds <= 600:
        parser.error('--seconds must be between 1 and 600')
    args.output.mkdir(parents=True, exist_ok=False)
    pvs = {field: epics.PV(PREFIX + field, auto_monitor=False) for field in FIELDS}
    def get(field):
        value = pvs[field].get_with_metadata(timeout=3, use_monitor=False)
        active = (value is not None and field == 'cam1:Acquire_RBV'
                  and value.get('value') == 1 and value.get('status') == 7
                  and value.get('severity') == 1)
        if value is None or (value.get('severity', 3) and not active):
            raise RuntimeError('Camera read failed: ' + field)
        if pvs[field].enum_strs:
            value['label'] = pvs[field].enum_strs[value['value']]
        return value
    baseline = {field: get(field) for field in FIELDS}
    (args.output / 'baseline.json').write_text(json.dumps(baseline, indent=2) + '\n')
    expected = {'cam1:Acquire_RBV': 1, 'cam1:AcquireTime_RBV': .001,
                'cam1:MinX_RBV': 600, 'cam1:MinY_RBV': 400,
                'image1:ArraySize0_RBV': 1200, 'image1:ArraySize1_RBV': 900}
    for field, value in expected.items():
        if baseline[field]['value'] != value:
            raise RuntimeError('Camera setting differs: ' + field)
    labels = {'cam1:ImageMode_RBV': 'Continuous', 'cam1:GC_TriggerMode_RBV': 'On',
              'cam1:GC_TriggerSource_RBV': 'Line1', 'cam1:TimeStampMode_RBV': 'Camera',
              'cam1:GC_TriggerSelector_RBV': 'FrameStart',
              'cam1:UniqueIdMode_RBV': 'Camera'}
    for field, label in labels.items():
        if baseline[field].get('label') != label:
            raise RuntimeError('Camera setting differs: ' + field)
    if shutil.disk_usage(args.output).free < 3_000_000_000:
        raise RuntimeError('At least 3 GB of free space is required')
    messages = queue.Queue(maxsize=16)
    overruns = []
    gate = [None]
    def receive(value=None, timestamp=None, **kwargs):
        if gate[0] is None or value is None or timestamp is None or timestamp < gate[0]:
            return
        try:
            messages.put_nowait((time.time(), timestamp, np.array(value, copy=True)))
        except queue.Full:
            overruns.append(time.time())
    image = epics.PV(PREFIX + 'image1:ArrayData', form='time', count=1_080_000,
                     auto_monitor=True, callback=receive)
    child = None
    rows = []
    error = None
    started = None
    child_log = (args.output / 'event-logger.log').open('x')
    try:
        if not image.wait_for_connection(timeout=3):
            raise RuntimeError('Image channel is unavailable')
        ready = args.output / 'event-logger-ready.json'
        child = subprocess.Popen([
            args.event_python, '-B', str(Path(__file__).with_name('event_logger.py')),
            '--output', str(args.output / 'events.jsonl'), '--ready', str(ready),
            '--seconds', str(args.seconds + 15)], stdout=child_log, stderr=subprocess.STDOUT)
        deadline = time.monotonic() + 10
        while not ready.exists():
            if child.poll() is not None or time.monotonic() >= deadline:
                raise RuntimeError('Event logger did not become ready; inspect event-logger.log')
            time.sleep(.1)
        started = gate[0] = time.time()
        deadline = time.monotonic() + args.seconds
        fields = ['frame_file', 'camera_frame_id', 'camera_clock_seconds', 'ioc_frame_unix',
                  'host_received_unix', 'metadata_consistent', 'pixel_mean', 'pixel_max', 'pixel_min']
        with (args.output / 'frames.csv').open('x', newline='') as stream:
            writer = csv.DictWriter(stream, fieldnames=fields)
            writer.writeheader()
            while time.monotonic() < deadline:
                if overruns or len(rows) > args.seconds * 8 + 16:
                    raise RuntimeError('Recorder capacity exceeded')
                if child.poll() is not None:
                    raise RuntimeError('Event logger stopped')
                try:
                    received, timestamp, values = messages.get(timeout=.2)
                except queue.Empty:
                    continue
                uid = get('image1:UniqueId_RBV')
                clock = get('image1:TimeStamp_RBV')
                after = get('image1:UniqueId_RBV')
                stable = (uid['value'] == after['value'] and abs(uid['timestamp'] - timestamp) < .01
                          and abs(clock['timestamp'] - timestamp) < .01)
                pixels = values.reshape(900, 1200)
                name = 'frame-{:04d}.npz'.format(len(rows))
                np.savez_compressed(args.output / name, pixels=pixels)
                row = dict(frame_file=name, camera_frame_id=int(uid['value']),
                           camera_clock_seconds=clock['value'], ioc_frame_unix=timestamp,
                           host_received_unix=received, metadata_consistent=stable,
                           pixel_mean=float(pixels.mean()), pixel_max=int(pixels.max()),
                           pixel_min=int(pixels.min()))
                writer.writerow(row)
                stream.flush()
                rows.append(row)
    except BaseException as exc:
        error = repr(exc)
    finally:
        gate[0] = None
        image.clear_callbacks()
        image.auto_monitor = False
        if child is not None and child.poll() is None:
            child.terminate()
            try:
                child.wait(timeout=4)
            except subprocess.TimeoutExpired:
                child.kill()
                child.wait()
        child_log.close()
        result = dict(started_unix=started, ended_unix=time.time(),
                      created_utc=datetime.datetime.now(datetime.timezone.utc).isoformat(),
                      frames_saved=len(rows), metadata_consistent_frames=sum(r['metadata_consistent'] for r in rows),
                      frame_queue_overruns=len(overruns), error=error, pv_writes=0,
                      mode='passive', acquisition_control='unchanged')
        (args.output / 'observation.json').write_text(json.dumps(result, indent=2) + '\n')
        print(json.dumps(result, indent=2))
    if error:
        raise SystemExit(1)

if __name__ == '__main__':
    main()
