"""Render the data-driven parts of the event sequencer timing test page.

Every mark, number and table cell comes from the receivers' own recorded
timestamps (``receiver_rows``) or from saved device readbacks. Host and browser
times never position anything. The script needs no device access.

The prose lives in ``source/timing_check/led_response.rst``; this script writes
the HTML fragments that page includes, plus a machine-readable summary.

    python tools/timing_check/render_update_check.py
"""
from __future__ import annotations

import argparse
import datetime as dt
import html
import json
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
RUNS = ["led-8ns", "led-80ns", "led-1000000ns", "led-sequence"]
A_IP, B_IP = "10.139.5.195", "10.139.5.198"


# --------------------------------------------------------------------------- data
def stamp(text: str) -> int:
    sec, ns = text.split(".")
    assert len(ns) == 9, text
    return int(sec) * 10**9 + int(ns)


def load_run(scenarios: Path, name: str) -> dict:
    d = json.loads((scenarios / f"{name}-evidence.json").read_text())
    by_cycle: dict[int, dict[int, dict]] = defaultdict(dict)
    for r in d["receiver_rows"]:
        assert r["event"] not in by_cycle[r["cycle"]], (name, r)
        by_cycle[r["cycle"]][r["event"]] = r
    cycles = []
    for cycle, pair in sorted(by_cycle.items()):
        assert set(pair) == {42, 43}, (name, cycle)
        e42, e43 = pair[42], pair[43]
        c = dict(
            cycle=cycle,
            a42=stamp(e42["timestamp_a"]), a43=stamp(e43["timestamp_a"]),
            b42=stamp(e42["timestamp_b"]), b43=stamp(e43["timestamp_b"]),
            programmed=e43["requested_relative_ns"] - e42["requested_relative_ns"],
        )
        c.update(gap_a=c["a43"] - c["a42"], gap_b=c["b43"] - c["b42"],
                 d42=c["b42"] - c["a42"], d43=c["b43"] - c["a43"])
        cycles.append(c)
    assert len(cycles) == d["qualified_cycles"], name
    programmed = {c["programmed"] for c in cycles}
    assert len(programmed) == 1, name
    host = d["measurements"]["detection_to_request_ns"]
    return dict(name=name, recording_id=d["recording_id"], cycles=cycles, programmed=programmed.pop(),
                host_ms=(host["min"] / 1e6, host["max"] / 1e6, host["mean"] / 1e6))


# ------------------------------------------------------------------------ helpers
def esc(s) -> str:
    return html.escape(str(s), quote=True)


def utc(ns: int, fmt="%H:%M:%S") -> str:
    return dt.datetime.fromtimestamp(ns // 10**9, dt.timezone.utc).strftime(fmt)


def grouped(ns_in_second: int) -> str:
    s = f"{ns_in_second:09d}"
    return f"{s[:3]} {s[3:6]} {s[6:]}"


def digits_html(value: int, against: int | None = None) -> str:
    """Nanoseconds within the second, grouped, with changed digits marked."""
    new = f"{value % 10**9:09d}"
    old = f"{against % 10**9:09d}" if against is not None else new
    out = []
    for i, ch in enumerate(new):
        if i in (3, 6):
            out.append(" ")
        out.append(f"<b>{ch}</b>" if ch != old[i] else ch)
    return '<span class="tc-ns">' + "".join(out) + "</span>"


def delay_label(n: int) -> str:
    return "1 ms" if n == 1_000_000 else f"{n:,} ns"


def run_label(run: dict) -> str:
    return delay_label(run["programmed"]) + (" repeat" if run["name"] == "led-sequence" else "")


def svg_wrap(body: str, w: int, h: int, label: str, min_width: int = 620) -> str:
    return (f'<div class="tc-figure" style="--tc-min:{min_width}px">'
            f'<svg viewBox="0 0 {w} {h}" role="img" aria-label="{esc(label)}" class="tc-svg">'
            f"<title>{esc(label)}</title>{body}</svg></div>")


def text(x, y, s, cls="", anchor="start") -> str:
    return f'<text x="{x:.1f}" y="{y:.1f}" text-anchor="{anchor}" class="{cls}">{s}</text>'


def table(headers: list[str], rows: list[str], cls: str = "", num: tuple[int, ...] = ()) -> str:
    return (f'<div class="tc-table-wrap {cls}"><table class="docutils tc-table"><thead><tr>'
            + "".join(f'<th class="tc-num">{h}</th>' if i in num else f"<th>{h}</th>" for i, h in enumerate(headers)) + "</tr></thead><tbody>" + "".join(rows) + "</tbody></table></div>")


# ----------------------------------------------------------------------- figures
def system_diagram() -> str:
    """How a cycle starts (software) and what is measured (timing hardware)."""
    w, h = 760, 252
    p = ['<defs><marker id="tc-head" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">'
         '<path d="M0 0L10 5L0 10z" class="tc-arrowhead"/></marker></defs>']
    p.append('<rect x="6" y="28" width="372" height="216" rx="8" class="tc-zone-soft"/>')
    p.append('<rect x="392" y="28" width="362" height="216" rx="8" class="tc-zone-hard"/>')
    p.append(text(18, 18, "Software: starts each cycle, not measured", "tc-zone-label"))
    p.append(text(404, 18, "Timing hardware: measured, 8 ns resolution", "tc-zone-label tc-strong"))

    def box(x, y, bw, bh, title, sub, cls="tc-box"):
        s = [f'<rect x="{x}" y="{y}" width="{bw}" height="{bh}" rx="6" class="{cls}"/>',
             text(x + bw / 2, y + 22, esc(title), "tc-box-title", "middle")]
        s += [text(x + bw / 2, y + 40 + i * 15, esc(line), "tc-box-sub", "middle") for i, line in enumerate(sub)]
        return "".join(s)

    def arrow(x1, y1, x2, y2):
        return f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" class="tc-arrow" marker-end="url(#tc-head)"/>'

    p.append(box(18, 102, 96, 70, "LED", ["turns on", "(DG645)"]))
    p.append(box(140, 102, 104, 70, "Camera", ["CAM2 sees", "dark, then bright"]))
    p.append(box(268, 102, 100, 70, "Host", ["finds the flash,", "sends trigger"]))
    p.append(arrow(114, 137, 138, 137))
    p.append(arrow(244, 137, 266, 137))
    p.append(arrow(368, 137, 404, 137))
    p.append(box(406, 94, 132, 86, "Generator", ["10.139.5.196", "sends 42, then", "43 after the delay"], "tc-box tc-box-hard"))
    p.append(box(612, 44, 134, 70, "Receiver A", [A_IP, "records 42 and 43"], "tc-box tc-box-hard"))
    p.append(box(612, 162, 134, 70, "Receiver B", [B_IP, "records 42 and 43"], "tc-box tc-box-hard"))
    p.append(arrow(538, 126, 610, 82))
    p.append(arrow(538, 148, 610, 194))
    p.append(text(578, 134, "fiber", "tc-small", "middle"))
    p.append(text(578, 148, "link", "tc-small", "middle"))
    p.append(text(192, 212, "Software time: 2.5 to 4.5 ms per cycle", "tc-small", "middle"))
    return svg_wrap("".join(p), w, h, "The LED and host software start each cycle. The generator and two receivers are the measured timing hardware.")


def run_zoom_figure(run: dict) -> str:
    """Whole run on a seconds axis, then one cycle magnified to nanoseconds."""
    w, h = 760, 366
    x0, x1 = 128, 736
    cyc = run["cycles"]
    origin = cyc[0]["a42"]
    span_s = max(1, -(-(cyc[-1]["a42"] - origin) // 10**9))
    xs = lambda t: x0 + (t - origin) / (span_s * 1e9) * (x1 - x0)
    p = [text(16, 22, f"Full run: {len(cyc)} cycles, one line for each cycle", "tc-panel-title")]
    lanes_top = {A_IP: 56, B_IP: 90}
    for ip, y in lanes_top.items():
        p.append(text(x0 - 12, y + 4, "A" if ip == A_IP else "B", "tc-lane", "end"))
        p.append(f'<line x1="{x0}" x2="{x1}" y1="{y}" y2="{y}" class="tc-rule"/>')
    for c in cyc:
        for ip, key in ((A_IP, "a42"), (B_IP, "b42")):
            y = lanes_top[ip]
            cls = "tc-pair tc-pair-sel" if c is cyc[0] else "tc-pair"
            p.append(f'<line x1="{xs(c[key]):.2f}" x2="{xs(c[key]):.2f}" y1="{y-10}" y2="{y+10}" class="{cls}">'
                     f'<title>Cycle {c["cycle"]}: receiver {"A" if ip == A_IP else "B"} recorded 42 at {utc(c[key])} plus {grouped(c[key] % 10**9)} ns</title></line>')
    for s in range(span_s + 1):
        x = x0 + s / span_s * (x1 - x0)
        p.append(f'<line x1="{x:.1f}" x2="{x:.1f}" y1="104" y2="109" class="tc-axis"/>')
        p.append(text(x, 122, f"{s} s", "tc-tick", "middle"))
    p.append(text((x0 + x1) / 2, 138, "Time after the first code 42", "tc-axis-label", "middle"))

    sel = xs(cyc[0]["a42"])
    p.append(f'<path d="M{sel:.1f} 128 L{sel:.1f} 146 L{x0} 186 M{sel:.1f} 146 L{x1} 186" class="tc-zoomline"/>')

    gap = run["programmed"]
    lo, hi = -gap, 2 * gap
    xn = lambda t: x0 + (t - lo) / (hi - lo) * (x1 - x0)
    zoom = (span_s * 1e9) / (hi - lo)
    p.append(text(16, 178, f"Cycle 1, magnified approximately {round(zoom / 1e7) * 10:,} million times", "tc-panel-title"))
    p.append(f'<rect x="{x0-4}" y="186" width="{x1-x0+8}" height="168" rx="6" class="tc-zoomframe"/>')
    if (hi - lo) / 8 <= 40:
        t = lo
        while t <= hi:
            p.append(f'<line x1="{xn(t):.1f}" x2="{xn(t):.1f}" y1="194" y2="310" class="tc-grid"/>')
            t += 8
        p.append(text(x1 - 4, 204, "Dotted lines: 8 ns ticks", "tc-small", "end"))
    c = cyc[0]
    for name, y, k42, k43 in (("A", 244, "a42", "a43"), ("B", 296, "b42", "b43")):
        p.append(text(x0 - 12, y + 4, name, "tc-lane", "end"))
        p.append(f'<line x1="{x0}" x2="{x1}" y1="{y}" y2="{y}" class="tc-rule"/>')
        for code, key in ((42, k42), (43, k43)):
            x = xn(c[key] - c["a42"])
            anchor, dx = ("end", -8) if code == 42 else ("start", 8)
            p.append(f'<line x1="{x:.1f}" x2="{x:.1f}" y1="{y-13}" y2="{y+13}" class="tc-ev"/>')
            p.append(text(x + dx, y - 2, f"{code}", "tc-ev-label", anchor))
            p.append(text(x + dx, y + 13, grouped(c[key] % 10**9) + " ns", "tc-ns-svg", anchor))
    for t in sorted({lo, 0, gap, hi}):
        p.append(f'<line x1="{xn(t):.1f}" x2="{xn(t):.1f}" y1="316" y2="321" class="tc-axis"/>')
        label = "0" if t == 0 else (f"{t / 1e6:+g} ms" if abs(t) >= 100_000 else f"{t:+,} ns")
        p.append(text(xn(t), 334, label.replace("-", "−"), "tc-tick", "middle"))
    p.append(text((x0 + x1) / 2, 350, "Time after code 42 at receiver A", "tc-axis-label", "middle"))
    label = (f"Full run of {len(cyc)} cycles over {span_s} seconds. Cycle 1 is magnified: "
             f"codes 42 and 43 are {gap} ns apart at receivers A and B.")
    return svg_wrap("".join(p), w, h, label)


# ------------------------------------------------------------------------ tables
def first_cycle_table(runs: list[dict]) -> str:
    rows = []
    for run in runs[:3]:
        c = run["cycles"][0]
        for i, (name, k42, k43) in enumerate((("A", "a42", "a43"), ("B", "b42", "b43"))):
            first = f'<td rowspan="2">{delay_label(run["programmed"])}</td>' if i == 0 else ""
            rows.append(f"<tr>{first}<td>{name}</td><td>{digits_html(c[k42])}</td><td>{digits_html(c[k43], c[k42])}</td>"
                        f'<td class="tc-num">{c[k43] - c[k42]:,} ns</td></tr>')
    return table(["Programmed delay", "Receiver", "Code 42 time (ns)", "Code 43 time (ns)", "43 minus 42"], rows, num=(4,))


def summary_table(runs: list[dict]) -> str:
    def value(vals):
        lo, hi = min(vals), max(vals)
        return f"{lo:,} ns" if lo == hi else f"{lo:,} to {hi:,} ns"

    rows = []
    for run in runs:
        cy = run["cycles"]
        diffs = [c[k] for c in cy for k in ("d42", "d43")]
        rows.append(f"<tr><td>{run_label(run)}</td><td class=\"tc-num\">{value([c['gap_a'] for c in cy])}</td>"
                    f"<td class=\"tc-num\">{value([c['gap_b'] for c in cy])}</td><td class=\"tc-num\">{value(diffs)}</td>"
                    f"<td class=\"tc-num\">{len(cy)} of {len(cy)}</td></tr>")
    return table(["Run", "Delay at A", "Delay at B", "B minus A", "Complete cycles"], rows, num=(1, 2, 3, 4))


def records_table(run: dict) -> str:
    rows = [f"<tr><td class=\"tc-num\">{c['cycle']}</td><td>{utc(c['a42'])}</td>"
            f"<td>{digits_html(c['a42'])}</td><td>{digits_html(c['a43'], c['a42'])}</td>"
            f"<td>{digits_html(c['b42'])}</td><td>{digits_html(c['b43'], c['b42'])}</td>"
            f"<td class=\"tc-num\">{c['gap_a']:,} / {c['gap_b']:,}</td><td class=\"tc-num\">{c['d42']} / {c['d43']}</td></tr>"
            for c in run["cycles"]]
    return table(["Cycle", "UTC second", "A: code 42", "A: code 43", "B: code 42", "B: code 43",
                  "Delay A / B (ns)", "B minus A, 42 / 43 (ns)"], rows, "tc-records", num=(0, 6, 7))


def host_table(runs: list[dict]) -> str:
    rows = [f"<tr><td>{run_label(r)}</td><td class=\"tc-num\">{r['host_ms'][2]:.2f} ms</td>"
            f"<td class=\"tc-num\">{r['host_ms'][0]:.2f} to {r['host_ms'][1]:.2f} ms</td></tr>" for r in runs]
    return table(["Run", "Mean", "Range"], rows, num=(1, 2))


# -------------------------------------------------------------------------- main
def render(repo: Path | None = None) -> None:
    root = Path(repo).resolve() if repo else ROOT
    scenarios = root / "source/_static/timing-check/scenarios"
    out = root / "source/timing_check/fragments"
    out.mkdir(exist_ok=True)
    runs = [load_run(scenarios, n) for n in RUNS]

    files = {
        "update-system.html": system_diagram(),
        "update-run-zoom.html": run_zoom_figure(runs[0]),
        "update-first-cycles.html": first_cycle_table(runs),
        "update-summary.html": summary_table(runs),
        "update-host.html": host_table(runs),
    }
    for run in runs:
        files[f"update-records-{run['name']}.html"] = records_table(run)
    for name, body in files.items():
        (out / name).write_text(body + "\n", encoding="utf-8")

    analysis = {
        "basis": "Integer subtraction of receiver_rows timestamp_a/timestamp_b (receiver hardware timestamps). No host or browser times are used. Absolute timestamps are strings to preserve nanosecond precision.",
        "receivers": {"A": A_IP, "B": B_IP},
        "runs": [{
            "name": r["name"], "recording_id": r["recording_id"], "programmed_ns": r["programmed"], "cycles": len(r["cycles"]),
            "delay_a_ns": sorted({c["gap_a"] for c in r["cycles"]}), "delay_b_ns": sorted({c["gap_b"] for c in r["cycles"]}),
            "b_minus_a_ns": sorted({c[k] for c in r["cycles"] for k in ("d42", "d43")}),
            "rows": [{**c, **{k: str(c[k]) for k in ("a42", "a43", "b42", "b43")}} for c in r["cycles"]],
        } for r in runs],
    }
    (scenarios / "receiver-trial-analysis.json").write_text(json.dumps(analysis, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {len(files)} fragments from {sum(len(r['cycles']) for r in runs)} receiver-recorded cycles.")


if __name__ == "__main__":
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--repo", type=Path)
    render(ap.parse_args().repo)
