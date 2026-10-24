#!/usr/bin/env python3
"""Analyze saved observation files. No network or hardware access."""
import argparse
import collections
import csv
from decimal import Decimal
import json
from pathlib import Path
import statistics
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

RECEIVERS = {'10.139.5.195': 'EVT:DEV2:10:EVR:LOG',
             '10.139.5.198': 'EVT:DEV2:40:EVR:LOG'}

def statistics_for(values):
    return dict(count=len(values), mean=statistics.mean(values),
                stddev=statistics.pstdev(values), minimum=min(values), maximum=max(values))

def write_rows(path, rows):
    with path.open('x', newline='') as stream:
        writer = csv.DictWriter(stream, fieldnames=list(rows[0]))
        writer.writeheader()
        writer.writerows(rows)

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--input', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    args.output.mkdir(parents=True, exist_ok=False)
    frames = list(csv.DictReader((args.input / 'frames.csv').open()))
    valid = [r for r in frames if r['metadata_consistent'].lower() == 'true']
    if len(valid) < 2:
        raise RuntimeError('At least two frames with consistent metadata are required')
    events = collections.defaultdict(list)
    seen = collections.defaultdict(set)
    for line in (args.input / 'events.jsonl').read_text().splitlines():
        item = json.loads(line)
        value, pv = item['data'], item['pv']
        if 'value' not in value or value.get('alarm', {}).get('severity', 3):
            continue
        columns = value['value']
        lengths = {len(columns[k]) for k in ['evt', 'sec', 'ns']}
        if len(lengths) != 1:
            raise RuntimeError('Event table columns have different lengths')
        for word, seconds, ns in zip(columns['evt'], columns['sec'], columns['ns']):
            if word & 0x40000000:
                raise RuntimeError('Event log contains a FIFO overflow flag')
            key = (word & 255, seconds, round(ns))
            if key[0] == 101 and key not in seen[pv]:
                seen[pv].add(key)
                events[pv].append(key)
    a, b = [events[pv] for pv in RECEIVERS.values()]
    if not a or not b:
        raise RuntimeError('Both receiver logs must contain event 101')
    first = max(min(r[1] for r in a), min(r[1] for r in b)) + 1
    last = min(max(r[1] for r in a), max(r[1] for r in b)) - 1
    def index(records):
        counts, result = collections.Counter(), {}
        for event, seconds, ns in records:
            if first <= seconds <= last:
                key = (event, seconds)
                ordinal = counts[key]
                counts[key] += 1
                result[key + (ordinal,)] = ns
        return result
    ia, ib = index(a), index(b)
    keys = sorted(ia.keys() & ib.keys())
    if not keys:
        raise RuntimeError('No complete-second event pairs are available')
    matches = [dict(event=k[0], seconds=k[1], ordinal=k[2],
                    a_ns=ia[k], b_ns=ib[k], offset_ns=ib[k] - ia[k]) for k in keys]
    write_rows(args.output / 'receiver-matches.csv', matches)
    ids = [int(r['camera_frame_id']) for r in valid]
    times = [Decimal(r['camera_clock_seconds']) for r in valid]
    intervals = [float(y - x) for x, y in zip(times, times[1:])]
    result = dict(receiver_a_ip='10.139.5.195', receiver_b_ip='10.139.5.198',
                  camera_ip='192.168.2.1', matched_receiver_events=len(matches),
                  unmatched_a=len(ia.keys() - ib.keys()), unmatched_b=len(ib.keys() - ia.keys()),
                  receiver_offset_ns=statistics_for([r['offset_ns'] for r in matches]),
                  camera_frames=len(frames), accepted_camera_metadata=len(valid),
                  rejected_camera_metadata=len(frames) - len(valid),
                  camera_interval_seconds=statistics_for(intervals),
                  camera_backwards_timestamps=sum(y < x for x, y in zip(times, times[1:])),
                  frame_id_gaps=sum(max(0, y - x - 1) for x, y in zip(ids, ids[1:])),
                  frame_id_repeats_or_reversals=sum(y <= x for x, y in zip(ids, ids[1:])))
    states, camera_records = [], []
    for row in frames:
        with np.load(args.input / row['frame_file']) as saved:
            pixels = saved['pixels']
            region = pixels[550:850, 300:700]
            peak = int(region.max())
        state = peak > 1000
        states.append(state)
        camera_records.append(dict(row, led_state='bright' if state else 'dim', led_roi_peak=peak))
    write_rows(args.output / 'camera-records.csv', camera_records)
    result.update(led_bright_frames=sum(states), led_dim_frames=len(states) - sum(states),
                  adjacent_repeated_led_states=sum(x == y for x, y in zip(states, states[1:])),
                  led_roi=[300, 700, 550, 850], led_peak_threshold_counts=1000,
                  source_directory=str(args.input.resolve()),
                  camera_to_event_clock_mapping='Not established')
    (args.output / 'results.json').write_text(json.dumps(result, indent=2) + '\n')
    origin = matches[0]['seconds'] * 1_000_000_000 + matches[0]['a_ns']
    x = [(r['seconds'] * 1_000_000_000 + r['a_ns'] - origin) / 1e9 for r in matches]
    fig, ax = plt.subplots(figsize=(9, 3.5), layout='constrained')
    ax.plot(x, [r['offset_ns'] for r in matches], '.', color='#147d92', markersize=3)
    ax.set(xlabel='Elapsed event time (s)', ylabel='Timestamp difference B − A (ns)')
    if result['receiver_offset_ns']['minimum'] == result['receiver_offset_ns']['maximum']:
        center = result['receiver_offset_ns']['mean']
        ax.set_ylim(center - 8, center + 8)
    ax.grid(alpha=.2)
    fig.savefig(args.output / 'receiver-offset.svg')
    plt.close(fig)
    fig, axes = plt.subplots(2, 1, figsize=(9, 5), layout='constrained')
    elapsed = [float(t - times[0]) for t in times]
    axes[0].plot(elapsed[1:], (np.array(intervals) - .25) * 1e6, '.-', markersize=2)
    axes[0].set(xlabel='Camera elapsed time (s)', ylabel='Interval − 250 ms (µs)')
    axes[1].step(np.arange(len(states)) / 4, states, where='mid')
    axes[1].set(xlabel='Nominal frame position (s)', ylabel='LED state',
                yticks=[0, 1], yticklabels=['Dim', 'Bright'], ylim=(-.15, 1.15))
    for ax in axes:
        ax.grid(alpha=.2)
    fig.savefig(args.output / 'camera-led.svg')
    plt.close(fig)
    print(json.dumps(result, indent=2))

if __name__ == '__main__':
    main()
