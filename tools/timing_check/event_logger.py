#!/usr/bin/env python3
"""Read PVA event tables. This program cannot write a PV."""
import argparse
import json
from pathlib import Path
import queue
import time
from p4p.client.thread import Context

RECEIVERS = {
    '10.139.5.195': 'EVT:DEV2:10:',
    '10.139.5.198': 'EVT:DEV2:40:',
}

def plain(value):
    if hasattr(value, 'todict'):
        return plain(value.todict())
    if isinstance(value, dict):
        return {key: plain(item) for key, item in value.items()}
    if hasattr(value, 'tolist'):
        return plain(value.tolist())
    if isinstance(value, (list, tuple)):
        return [plain(item) for item in value]
    if isinstance(value, Exception):
        return {'error': type(value).__name__ + ': ' + str(value)}
    return value

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, required=True)
    parser.add_argument('--ready', type=Path, required=True)
    parser.add_argument('--seconds', type=float, required=True)
    args = parser.parse_args()
    context = Context('pva', nt=False)
    messages = queue.Queue()
    subscriptions = []
    try:
        for suffix, expected in [('APP:IPADDR', '10.139.5.196'), ('Ref:Freq', 125),
                                 ('EVG:TMR:1:event', 101), ('EVG:TMR:1:divisor', 31250000)]:
            if context.get('EVT:DEV2:20:' + suffix, timeout=3)['value'] != expected:
                raise RuntimeError('Generator setting differs: ' + suffix)
        for address, prefix in RECEIVERS.items():
            actual = context.get(prefix + 'APP:IPADDR', timeout=3)['value']
            status = context.get(prefix + 'EVR:status', timeout=3)
            if (actual != address or status['alarm.severity'] or status['value'] & 3 != 3
                    or status['value'] & 8):
                raise RuntimeError('Receiver address, link or time is invalid: ' + address)
            if not context.get(prefix + 'EVR:map', timeout=3)['value'][101] & (1 << 17):
                raise RuntimeError('Event 101 is not selected for logging: ' + address)
            pv = prefix + 'EVR:LOG'
            subscriptions.append(context.monitor(
                pv, lambda value, pv=pv: messages.put((time.time(), pv, plain(value))),
                notify_disconnect=True))
        with args.output.open('x', buffering=1) as stream:
            args.ready.write_text(json.dumps({'receivers': RECEIVERS, 'pv_writes': 0}) + '\n')
            deadline = time.monotonic() + args.seconds
            while time.monotonic() < deadline:
                try:
                    received, pv, value = messages.get(timeout=.2)
                except queue.Empty:
                    continue
                stream.write(json.dumps({'received_unix': received, 'pv': pv, 'data': value}) + '\n')
    finally:
        for subscription in subscriptions:
            subscription.close()
        context.close()

if __name__ == '__main__':
    main()
