import {useEffect,useLayoutEffect,useRef,useState} from 'react'
import {api,format} from './api'

type Receipt={ip:string;sec:number;ns:number;timestamp:string;utc:string;difference_ns:number;overflow_flag:boolean;actions:{known:boolean;logged:boolean|null;other_action_mask?:string;outputs:{output:number;mode:string|null;delay_ns:number|null;width_ns:number|null}[]}}
type Group={id:string;event:number;reference_timestamp:string|null;reference_utc?:string;reference_sec:number|null;reference_ns:number|null;reference_ip:string|null;status:string;association:string;expected_receivers:string[];missing_receivers:string[];receivers:Receipt[];source:{ip:string;kind:string;requested_ns:number|null;cycle?:number;cycle_origin_sec?:number;cycle_origin_ns?:number;run_count?:number|null;transmit_timestamp:null;timers?:{timer:number;configured_hz:number|null}[]}}
type Timeline={monitored_receivers:string[];monitoring_scope_inferred:boolean;recording_id:string;state:string;groups:Group[];total_groups:number;total_receipts:number;event_codes:number[];test_codes:number[];association_note:string;output_note:string}
const stamp=(row:{sec:number;ns:number})=>BigInt(row.sec)*1_000_000_000n+BigInt(row.ns)
function Plot({groups,selected,onSelect}:{groups:Group[];selected:string;onSelect:(id:string)=>void}){
 const track=useRef<HTMLDivElement>(null),[viewport,setViewport]=useState(720)
 useLayoutEffect(()=>{const element=track.current;if(!element)return;const observer=new ResizeObserver(()=>setViewport(element.clientWidth));setViewport(element.clientWidth);observer.observe(element);return()=>observer.disconnect()},[])
 const received=groups.flatMap(g=>g.receivers),first=received.reduce<bigint|null>((min,r)=>min===null||stamp(r)<min?stamp(r):min,null)
 const ips=[...new Set(groups.flatMap(g=>[...g.expected_receivers,...g.receivers.map(r=>r.ip)]))].sort()
 const lanes=ips.map(ip=>ip+' RX')
 const points=groups.flatMap(g=>g.receivers.map(r=>({lane:lanes.indexOf(r.ip+' RX'),x:first===null?0:Number(stamp(r)-first),code:g.event,id:g.id,title:r.ip+' · code '+g.event+' · '+r.utc})))
 const min=Math.min(0,...points.map(p=>p.x)),span=Math.max(8,...points.map(p=>p.x))-min,height=lanes.length*34+36,width=Math.max(720,viewport,groups.length*56)
 return <div className="continuous-timeline"><div className="timeline-lanes">{lanes.map(lane=><span key={lane}>{lane}</span>)}</div><div ref={track} className="timeline-track" tabIndex={0} aria-label="Scroll event timeline horizontally"><svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Recorded receiver events in nanoseconds"><title>Measured receiver timestamps, relative to the first recorded reception. Scroll horizontally; select a mark to inspect its event.</title>{lanes.map((lane,index)=><line key={lane} x1="20" x2={width-20} y1={21+index*34} y2={21+index*34}/>)}{points.map((p,index)=><g key={index} role="button" tabIndex={0} aria-label={'Inspect event '+p.code+' '+p.title} onClick={()=>onSelect(p.id)} onKeyDown={event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();onSelect(p.id)}}}><title>{p.title}</title><line className={'received-mark'+(selected===p.id?' selected':'')} x1={20+(p.x-min)/span*(width-40)} x2={20+(p.x-min)/span*(width-40)} y1={12+p.lane*34} y2={30+p.lane*34}/>{groups.length<=12&&<text x={20+(p.x-min)/span*(width-40)} y={10+p.lane*34} textAnchor="middle">{p.code}</text>}</g>)}{Array.from({length:Math.max(2,Math.ceil(width/500))},(_,index)=>{const portion=index/(Math.max(2,Math.ceil(width/500))-1);return <text key={index} x={20+portion*(width-40)} y={height-4} textAnchor={index===0?'start':index===Math.max(2,Math.ceil(width/500))-1?'end':'middle'}>{format(min+portion*span,0)} ns</text>})}</svg></div></div>
}
function Action({receipt:r}:{receipt:Receipt}){
 return <>{!r.actions.known?'Action map not captured':r.actions.outputs.length?r.actions.outputs.map(o=>`Output ${o.output}: ${o.mode??'mode unknown'}; delay ${format(o.delay_ns,0)} ns; width ${format(o.width_ns,0)} ns`).join(' · '):r.actions.other_action_mask&&r.actions.other_action_mask!=='0x0'?'Log; additional map bits '+r.actions.other_action_mask:'Log only; no pulse outputs mapped'}{r.overflow_flag?' · FIFO overflow flag':''}</>
}
function Receipts({groups}:{groups:Group[]}){
 return <div className="instrument-scroll"><table className="visible-receipts"><thead><tr><th>Event</th><th>Receiver IP</th><th>Reception time (UTC)</th><th>Receiver Δ (ns)</th><th>Configured action</th></tr></thead><tbody>{groups.flatMap(g=>[...g.receivers.map(r=><tr key={g.id+r.ip}><td>{g.event}</td><td>{r.ip}</td><td title={'POSIX timestamp '+r.timestamp}>{r.utc??r.timestamp}</td><td>{['confirmed sequence','code / second / ordinal'].includes(g.association)?format(r.difference_ns,0):'Not qualified'}</td><td><Action receipt={r}/></td></tr>),...g.missing_receivers.map(ip=><tr key={g.id+ip}><td>{g.event}</td><td>{ip}</td><td colSpan={3}>No corresponding record in this capture.</td></tr>)])}</tbody></table></div>
}
export default function EventTimeline({recordingId}:{recordingId:string}){
 const [data,setData]=useState<Timeline|null>(null),[error,setError]=useState(''),[filter,setFilter]=useState('test'),[selected,setSelected]=useState('')
 useEffect(()=>{let closed=false,timer:ReturnType<typeof setTimeout>;const controller=new AbortController();
  async function read(){try{const next=await api<Timeline>('/api/runs/'+recordingId+'/timeline.json',undefined,controller.signal);if(!closed){setData(next);setError('');if(!next.test_codes.length)setFilter(previous=>previous==='test'?(next.event_codes.includes(101)?'101':'all'):previous);if(['recording','finishing'].includes(next.state))timer=setTimeout(read,2000)}}catch(e){if(!closed)setError((e as Error).message)}}
  setData(null);setFilter('test');setSelected('');read();return()=>{closed=true;controller.abort();clearTimeout(timer)}
 },[recordingId])
 const groups=(data?.groups??[]).filter(g=>filter==='all'||(filter==='test'?!!data?.test_codes.includes(g.event):g.event===Number(filter)))
 const current=groups.find(g=>g.id===selected)??groups.find(g=>g.status==='Logs paired'||g.status==='Reception confirmed')??groups[0]
 const visible=groups.length<=12?groups:current?[current]:[]
 return <section className="trial-timeline" aria-label="Event timeline"><div className="timeline-heading"><h3>Event timeline</h3>{data&&<label>Event code <select aria-label="Event code" value={filter} onChange={event=>{setFilter(event.target.value);setSelected('')}}>{data.test_codes.length>0&&<option value="test">Sequence events</option>}<option value="all">All recorded events</option>{data.event_codes.map(code=><option key={code} value={code}>{code}</option>)}</select></label>}</div>{error?<p role="alert">{error}</p>:!data?<p>Reading the event log…</p>:<>
  <div className="timeline-record-count">{format(data.total_receipts,0)} receiver records · {format(groups.length,0)} event groups</div>
  {groups.length>0&&<Plot groups={groups} selected={current?.id??''} onSelect={setSelected}/>}
  <div className="timeline-current"><strong>{groups.length<=12?'Recorded test events':current?'Event '+current.event+' · '+(current.reference_utc??'no reception timestamp'):'No recorded events'}</strong><span>{current?.status}</span></div>
  {current&&<p className="timeline-source">Source {current.source.ip} · {current.source.kind}{current.source.run_count!=null?' · hardware counter '+current.source.run_count+' (mod 16)':''}{current.source.cycle?' · cycle '+current.source.cycle:''}{current.source.timers?.map(t=>' · timer '+t.timer+' configured '+format(t.configured_hz,6)+' Hz').join('')}</p>}
  <Receipts groups={visible}/>
  <p className="timeline-evidence-note">Every mark is a recorded receiver timestamp, relative to the first reception shown. Transmit timestamps are unavailable. Receiver resolution is 8 ns; output settings do not measure electrical edges.</p>
  <details className="timeline-raw-log"><summary>Complete receiver log · {data.total_receipts} records</summary><Receipts groups={groups}/><p>{data.association_note}{data.monitoring_scope_inferred?' Monitoring scope is reconstructed from this older archive.':''}</p></details>
 </>}</section>
}
