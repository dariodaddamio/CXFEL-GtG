"""Render the update check from archived receiver timestamps; no device access."""
from pathlib import Path
from collections import defaultdict
import datetime as dt
import html,json,argparse
import xml.etree.ElementTree as ET
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.ticker import MaxNLocator,FuncFormatter
ROOT=Path(__file__).resolve().parents[2];S=ROOT/'source';A=S/'_static/timing-check/scenarios'
TRIALS=['led-8ns','led-80ns','led-1000000ns']
def stamp(text):
    sec,ns=text.split('.');assert len(ns)==9
    return int(sec)*10**9+int(ns)
def cycles(d):
    rows=defaultdict(dict)
    for r in d['receiver_rows']:
        assert r['event'] not in rows[r['cycle']]
        rows[r['cycle']][r['event']]=r
    out=[]
    for cycle,pair in sorted(rows.items()):
        assert set(pair)=={42,43}
        a,b=pair[42],pair[43]
        a42,a43,b42,b43=[stamp(r[k]) for r,k in [(a,'timestamp_a'),(b,'timestamp_a'),(a,'timestamp_b'),(b,'timestamp_b')]]
        out.append(dict(cycle=cycle,a42=a42,a43=a43,b42=b42,b43=b43,gap_a=a43-a42,gap_b=b43-b42,delta42=b42-a42,delta43=b43-a43))
    assert len(out)==d['qualified_cycles']
    return out

def group(ns):return f'{ns:09d}'[:3]+' '+f'{ns:09d}'[3:6]+' '+f'{ns:09d}'[6:]
def cell(value,previous=None):
    sec,ns=divmod(value,10**9);digits=f'{ns:09d}';old=f'{previous%10**9:09d}' if previous is not None else digits
    parts=['<mark>'+c+'</mark>' if c!=old[i] else c for i,c in enumerate(digits)]
    return dt.datetime.fromtimestamp(sec,dt.timezone.utc).strftime('%H:%M:%S')+'<br><span class="rx-ns">'+'&#8239;'.join(''.join(parts[i:i+3]) for i in [0,3,6])+'</span>'
def raw(markup):return ['.. raw:: html','','   '+markup.replace('\n','\n   '),'']
def table(headers,rows):
    out=['.. list-table::','   :header-rows: 1','']
    for r in [headers]+rows:out+=['   * - '+str(r[0])]+['     - '+str(x) for x in r[1:]]
    return out+['']
def fold(title,content):return raw('<details class="experiment-details"><summary>'+title+'</summary>')+content+raw('</details>')
def section(title):return [title,'-'*len(title),'']
def render(repo=None):
    global ROOT,S,A
    if repo is not None:
        ROOT=Path(repo).resolve();S=ROOT/'source';A=S/'_static/timing-check/scenarios'
    ds=[json.loads((A/(n+'-evidence.json')).read_text()) for n in TRIALS];allcycles=[cycles(d) for d in ds]
    for d in ds:
        requested={r['requested_relative_ns'] for r in d['receiver_rows'] if r['event']==43}
        assert len(requested)==1
        target=requested.pop()
        assert d.get('configured_gap_ns',target)==target
        d['configured_gap_ns']=target
    plt.rcParams.update({'font.size':12,'svg.fonttype':'none','svg.hashsalt':'receiver-only-update-check'})
    fig,axes=plt.subplots(2,3,figsize=(11,6.8),layout='constrained')
    summary=[]
    for col,(d,rows) in enumerate(zip(ds,allcycles)):
        x=[r['cycle'] for r in rows];target=d['configured_gap_ns'];ax=axes[0,col]
        ax.axhline(target,color='#697580',ls='--',lw=1.6,label='Programmed')
        ax.plot(x,[r['gap_a'] for r in rows],'o',mfc='none',ms=7,color='#176b8b',label='10.139.5.195')
        ax.plot(x,[r['gap_b'] for r in rows],'x',ms=5,color='#bc5c26',label='10.139.5.198')
        values=[r[k] for r in rows for k in ['gap_a','gap_b']]+[target]
        ax.set(title=f'{target:,} ns programmed',ylabel='Received 43 − 42 (ns)',ylim=(min(values)-16,max(values)+16))
        ax.yaxis.set_major_locator(MaxNLocator(integer=True,nbins=4));ax.yaxis.set_major_formatter(FuncFormatter(lambda v,pos:f'{v:,.0f}'.replace(',',' ')))
        ax=axes[1,col]
        ax.plot(x,[r['delta42'] for r in rows],'o',mfc='none',color='#176b8b',ms=6,label='Event 42')
        ax.plot(x,[r['delta43'] for r in rows],'x',color='#bc5c26',ms=5,label='Event 43')
        diffs=[r[k] for r in rows for k in ['delta42','delta43']]
        ax.set(xlabel='Cycle',ylabel='Receiver difference (ns)',ylim=(min(diffs)-16,max(diffs)+16));ax.yaxis.set_major_locator(MaxNLocator(integer=True,nbins=4))
        for ax in axes[:,col]:
            ax.set_xticks([1,5,10,15,20]);ax.spines[['top','right']].set_visible(False);ax.grid(axis='y',color='#dde4e8');ax.set_axisbelow(True)
        summary.append({'name':TRIALS[col],'recording_id':d['recording_id'],'programmed_ns':target,'cycles':len(rows),'gap_a_ns':{'min':min(r['gap_a'] for r in rows),'max':max(r['gap_a'] for r in rows)},'gap_b_ns':{'min':min(r['gap_b'] for r in rows),'max':max(r['gap_b'] for r in rows)},'receiver_difference_ns':{'min':min(diffs),'max':max(diffs)},'rows':[{**r,**{k:str(r[k]) for k in ['a42','a43','b42','b43']}} for r in rows]})
    axes[0,0].legend(loc='upper left',fontsize=9,frameon=False);axes[1,0].legend(loc='upper left',fontsize=9,frameon=False)
    fig.savefig(A/'receiver-gap-trials.svg',metadata={'Date':None});plt.close(fig)
    r=allcycles[0][0];origin=r['a42'];sec,ns=divmod(origin,10**9)
    fig,ax=plt.subplots(figsize=(10,3.3),layout='constrained')
    for y,ip,keys in [(1,'10.139.5.195',['a42','a43']),(0,'10.139.5.198',['b42','b43'])]:
        for code,key in zip([42,43],keys):
            x=r[key]-origin;ax.vlines(x,y-.12,y+.12,color='#176b8b',lw=2.5);ax.annotate(f'{code}: {group(r[key]%10**9)} ns',(x,y),xytext=(0,18),textcoords='offset points',ha='center',fontsize=12)
        ax.hlines(y,-1,9,color='#b8c4cd',lw=.8)
    ax.set(yticks=[0,1],yticklabels=['10.139.5.198','10.139.5.195'],xticks=[0,8],xlim=(-2,10),ylim=(-.5,1.6),xlabel=f'Nanoseconds since 10.139.5.195 received event 42\nOrigin: {dt.datetime.fromtimestamp(sec,dt.timezone.utc):%Y-%m-%d %H:%M:%S} UTC + {group(ns)} ns',title='8 ns trial · cycle 1 · receiver timestamps only')
    ax.spines[['top','right','left']].set_visible(False);fig.savefig(A/'receiver-cycle-zoom.svg',metadata={'Date':None});plt.close(fig)
    (A/'receiver-trial-analysis.json').write_text(json.dumps({'basis':'Integer subtraction of receiver_rows timestamp_a/timestamp_b; no host receipt times. Absolute nanosecond timestamps are serialized as strings to preserve precision.','trials':summary},indent=2)+'\n')
    zoom=A/'receiver-cycle-zoom.svg'
    svg=ET.parse(zoom);ns={'s':'http://www.w3.org/2000/svg'}
    for element in svg.findall('.//s:text',ns):
        if element.text and element.text.startswith('43: '):
            element.text=None;old=f'{r["a42"]%10**9:09d}';digits=f'{r["a43"]%10**9:09d}'
            ET.SubElement(element,'{http://www.w3.org/2000/svg}tspan').text='43: '
            for i,digit in enumerate(digits):
                span=ET.SubElement(element,'{http://www.w3.org/2000/svg}tspan')
                span.text=(' ' if i in (3,6) else '')+digit
                if digit!=old[i]:span.set('fill','#a84913');span.set('font-weight','bold')
            ET.SubElement(element,'{http://www.w3.org/2000/svg}tspan').text=' ns'
    svg.write(zoom,encoding='unicode',xml_declaration=True)
    for name in ['receiver-gap-trials.svg','receiver-cycle-zoom.svg']:
        path=A/name;path.write_text('\n'.join(line.rstrip() for line in path.read_text().splitlines())+'\n')
    lines=['20261017 timing update check' ,'============================','',
    'Mark asked whether Michael Davidsaver’s 20261017 firmware and IOC update works on the CXFEL test rack. The IOC is the control program on the host. The update adds a stored event sequence, moves network time handling from the firmware to the IOC, and allows the generator role to change without a reboot. In this test, an LED flash acts as the start button: camera software detects it and asks the generator to run its sequence.','',
    'The generator sends numbered event codes over the timing link. Each receiver timestamps incoming codes with a 125 MHz clock, giving **8 ns resolution**. We selected unused codes **42 and 43 as test markers**; they drive no outputs. The sequencer is a stored table of “send this code at this time,” which plays once per trigger. An 8 ns gap is one clock tick and the smallest programmable separation.','']
    lines+=section('Measured result')+['The three trials below each contain 20 cycles. Their receiver logs show the programmed separation on both receivers, with matching timestamps between receivers. These measurements check the sequencer and receiver timing; they do not verify every part of the update.','']
    lines+=table(['Programmed gap','10.139.5.195: received gap','10.139.5.198: received gap','Receiver difference'],[[f'{d["configured_gap_ns"]:,} ns',f'{s["gap_a_ns"]["min"]:,} ns in all 20 cycles',f'{s["gap_b_ns"]["min"]:,} ns in all 20 cycles',f'{s["receiver_difference_ns"]["min"]} ns for both markers'] for d,s in zip(ds,summary)])
    lines+=['.. figure:: ../_static/timing-check/scenarios/receiver-gap-trials.svg','   :alt: All receiver-derived event gaps and cross-receiver differences for the 8 ns, 80 ns and 1 ms trials.','   :width: 100%','','   Each column has its own gap axis. The lower row is 10.139.5.198 minus 10.139.5.195 for each marker. Overlapping marks reflect equal logged values, not omitted cycles.','',
    '.. figure:: ../_static/timing-check/scenarios/receiver-cycle-zoom.svg','   :alt: The first 8 ns cycle, positioned by the actual timestamps recorded at each receiver.','   :width: 100%','','   Both lanes share the first receiver’s event-42 origin, so a receiver offset would remain visible. No host or browser timestamp positions a mark.','']
    lines+=section('Which recording is which?')+['The comparison uses the three original evidence files listed below. The later 10-second 8 ns demonstration is a separate repeat, not a replacement for the comparison’s 8 ns run.','']
    lines+=table(['Use','Recording','Evidence'],[[f'{d["configured_gap_ns"]:,} ns comparison',f'``{d["recording_id"]}``',f':download:`{n}-evidence.json <../_static/timing-check/scenarios/{n}-evidence.json>`'] for n,d in zip(TRIALS,ds)]+[['10-second video / repeat','``20261104T073310Z-044488``',':download:`Repeat evidence <../_static/timing-check/scenarios/led-sequence-evidence.json>`']])
    lines+=raw('<video class="timing-experiment-video" controls playsinline preload="metadata" poster="../_static/timing-check/scenarios/led-demo-poster.png"><source src="../_static/timing-check/scenarios/led-demo-10s.mp4" type="video/mp4"></video>')
    lines+=section('Update coverage')+['The following readbacks were captured without device writes on 4 November 2026.','']
    rb=json.loads((A/'update-readbacks.json').read_text());pv=rb['pvs'];nxt=pv['EVT:DEV2:20:Nxt:Sec']['value']
    assert rb['release_artifact']['sha1']==rb['release_artifact']['expected_sha1']
    lines+=table(['Change','Observed evidence','Verification limit'],[
      ['Firmware identity',f'All four devices report ``{pv["EVT:DEV2:20:Date:FW-I"]["value"]}``. The release file SHA1 matches ``f228abca072271148c6042ba410dd5de443a03f1``.','The build date matches release 20261017; the running image hash is not exposed, so exact binary identity is not independently verified.'],
      ['IOC time / NTP',f'Host reports ``NTPSynchronized=yes``. IOC next second: {dt.datetime.fromtimestamp(nxt,dt.timezone.utc):%Y-%m-%d %H:%M:%S} UTC; PPS status is OK and timestamp status is Time OK.','The IOC time-distribution path is observed. Removal of the firmware NTP client is documented upstream but is not independently verified by these readbacks.'],
      ['Runtime generator mode','``EVT:DEV2:20:FPGA:Mode`` reads EVG/EVR; the other three devices read EVR Only.','Role readbacks captured. Switching and restoring a role without reboot is not verified; no mode write was made.']])
    lines+=['The `timing reference guide <https://github.com/osprey-dcs/timing-ioc/blob/ci/documentation/README.md>`_ identifies ``FPGA:Mode`` as the readback and ``FPGA:Mode:S`` as the setting. The `20261017 firmware release <https://github.com/osprey-dcs/timing-firmware/releases/tag/20261017>`_ documents NTP removal. The IOC database supplies ``Nxt:Sec`` from the IOC clock; it does not provide a standalone NTP-status PV.','']
    lines+=section('Records')+['Nanosecond digits are grouped for reading; highlighted digits change between codes 42 and 43. Times in the tables are UTC on 4 November 2026.','']
    for n,d,rows in zip(TRIALS,ds,allcycles):
        body='<div class="timing-records" tabindex="0"><table><thead><tr>'+''.join('<th>'+x+'</th>' for x in ['Cycle','10.139.5.195 · 42','10.139.5.195 · 43','10.139.5.198 · 42','10.139.5.198 · 43','Gap .195 (ns)','Gap .198 (ns)','B − A, 42 / 43 (ns)'])+'</tr></thead><tbody>'
        for r in rows:body+='<tr><td>'+str(r['cycle'])+'</td>'+''.join('<td>'+cell(r[k],r.get(prev) if prev else None)+'</td>' for k,prev in [('a42',None),('a43','a42'),('b42',None),('b43','b42')])+f'<td>{r["gap_a"]:,}</td><td>{r["gap_b"]:,}</td><td>{r["delta42"]} / {r["delta43"]}</td></tr>'
        lines+=fold(f'{d["configured_gap_ns"]:,} ns trial · 20 cycle records',raw(body+'</tbody></table></div>'))
    setup=table(['Component','Recorded setup'],[['Generator','10.139.5.196 / ``EVT:DEV2:20:``; 125 MHz; sequencer bank 1. Normal mode keeps the bank armed after one table finishes; each trigger still plays it only once.'],['Receivers','10.139.5.195 / ``EVT:DEV2:10:`` and 10.139.5.198 / ``EVT:DEV2:40:``. A logging slot is a configurable selection of which event code to put in the event log; slots 3 and 4 selected codes 42 and 43.'],['Sequence','42 at 0 ns; 43 at the selected gap; code 255 at gap + 1,000 ns. Code 255 stops the sequencer table and is not sent over the link. Timer and external-input triggers were disabled.'],['Start input','CAM2 at 192.168.2.1; existing Line1 trigger, approximately 10 frames/s, 1 ms exposure, 1200 × 900 Mono12 images. Peak above 1,000 counts in columns 300–699, rows 550–849 qualified a bright frame after a fresh dark frame.'],['Other event codes','101 is the existing camera-trigger event. Code 125 marks each second; codes 112 and 113 distribute the POSIX seconds value.'],['LED / storage','Breadboard LED connected to a DG645; exact output and cable endpoints were not recorded. Original images, event rows and settings were saved on host 10.139.4.59.']])
    procedure=table(['Step','Method'],[['Check','Confirm visible dark/bright LED states, valid receiver timestamps and links, and no FIFO overflow. Save controls and maps; verify that test markers and logging slots are free.'],['Acquire','After approval of the exact writes, load the table, select the two logging codes and arm once. For each accepted LED transition, issue one trigger and verify its counter increment; stop after 20 accepted transitions.'],['Compare','Pair codes 42 and 43 by cycle, subtract integer hardware timestamps, and compare the same code between receivers. Preserve full seconds across rollover.'],['Restore','Disarm and restore the saved controls and maps, including after timeout or stop. Read back settings and confirm receiver health. Do not change event 101, camera trigger settings or DG645 settings.']])
    lines+=fold('Setup and procedure',setup+procedure)
    command_path=A/'led-demo-commands.txt'
    lines+=fold('10-second demonstration command log',raw('<pre>'+html.escape(command_path.read_text() if command_path.exists() else 'See the saved executed command manifest on the acquisition host.')+'</pre>'))
    repeat=json.loads((A/'led-sequence-evidence.json').read_text())
    host=repeat['measurements']['detection_to_request_ns']
    lines+=fold('Host software records', ['Host detection-to-request intervals measure computer processing, not receiver hardware timing, so they are excluded from every receiver result and plot.','']+table(['Recording','Mean','Range'],[[repeat['recording_id'],f'{host["mean"]/1e6:.2f} ms',f'{host["min"]/1e6:.2f}–{host["max"]/1e6:.2f} ms']])+[':download:`Full software records <../_static/timing-check/scenarios/led-sequence-evidence.json>`',''])
    lines+=fold('Firmware, IOC clock and role readbacks',raw('<pre>'+html.escape(json.dumps(rb,indent=2))+'</pre>')+[':download:`Readback snapshot <../_static/timing-check/scenarios/update-readbacks.json>`',''])
    lines+=section('Findings and limits')+['The sequencer produces the requested separations down to one 8 ns clock tick, and the two receivers agree on the logged event timestamps in all three trials. This supports using common event markers to correlate CXFEL device records. It does not establish absolute UTC accuracy, variation below 8 ns, physical output response or lossless logging at 1 kHz.','',
    'NTP-client removal and a runtime role switch remain unverified. A later camera-view mismatch must be resolved before repeating the optical start check; it does not change the archived receiver measurements.','']
    (S/'timing_check/led_response.rst').write_text('\n'.join(line.rstrip() for line in '\n'.join(lines).splitlines()).rstrip()+'\n')
    print('Rendered',len(summary),'trials from receiver timestamps only.')
if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--repo',type=Path);render(parser.parse_args().repo)
