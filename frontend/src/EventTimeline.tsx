import {useEffect,useMemo,useState} from 'react'
import {api,format} from './api'
import {cycleTiming,gap,difference,RECEIVERS,type ReceiverEvent,type Cycle} from './cycle-timing'

type Timeline={state:string;groups:{event:number;receivers:{ip:string;sec:number;ns:number}[];source:{requested_ns?:number|null}}[]}
function Timestamp({value,first}:{value?:bigint;first?:bigint}){
 if(value===undefined)return <>—</>
 const sec=value/1_000_000_000n,ns=value%1_000_000_000n,digits=ns.toString().padStart(9,'0'),base=first===undefined?digits:(first%1_000_000_000n).toString().padStart(9,'0')
 return <time title={sec+'.'+digits+' POSIX seconds'}><span>{new Date(Number(sec)*1000).toISOString().slice(0,19).replace('T',' ')} UTC</span><br/><span className="cycle-ns">{[0,3,6].map((start,k)=><span key={start}>{k>0?'\u202f':''}{digits.slice(start,start+3).split('').map((d,i)=>d!==base[start+i]?<mark key={i}>{d}</mark>:<span key={i}>{d}</span>)}</span>)} ns</span></time>
}
function CyclePlot({cycle,target,compact=false}:{cycle:Cycle;target:number|null;compact?:boolean}){
 const origin=cycle.a?.first??cycle.b!.first
 const points=[cycle.a,cycle.b].flatMap((p,lane)=>p?[{lane,code:42,t:p.first},...(p.second===undefined?[]:[{lane,code:43,t:p.second}])]:[]).map(p=>({...p,x:Number(p.t-origin)}))
 const values=[0,target??8,...points.map(p=>p.x)],lo=Math.min(...values),hi=Math.max(...values),span=Math.max(8,hi-lo),pad=span*.15
 const x=(n:number)=>155+(n-lo+pad)/(span+2*pad)*590
 const height=compact?68:142,y=(lane:number)=>(compact?21:39)+lane*(compact?25:48)
 return <svg className={'cycle-plot '+(compact?'compact':'')} viewBox={`0 0 800 ${height}`} role="img" aria-label={'Hardware-timestamp cycle '+cycle.id}><title>Receiver hardware timestamps relative to this cycle's event 42 on {cycle.a?RECEIVERS[0]:RECEIVERS[1]}. No host receipt times are used.</title>
 {RECEIVERS.map((ip,lane)=><g key={ip}><text x="0" y={y(lane)+4}>{ip}</text><line x1="145" x2="780" y1={y(lane)} y2={y(lane)}/></g>)}
 {target!=null&&<path className="cycle-programmed" d={`M${x(target)} 5V${height-20}`}><title>Programmed gap: {target} ns; this line is a setting, not a reception.</title></path>}
 {points.map(p=><g key={p.lane+':'+p.code}><title>{RECEIVERS[p.lane]} · event {p.code} · {p.x} ns since the shared cycle origin · {p.t/1_000_000_000n}.{(p.t%1_000_000_000n).toString().padStart(9,'0')}</title><path className={'cycle-event code-'+p.code} d={`M${x(p.x)} ${y(p.lane)-9}V${y(p.lane)+9}`}/>{!compact&&<text x={x(p.x)} y={y(p.lane)-15} textAnchor="middle">{p.code} · {format(p.x,0)} ns</text>}</g>)}
 {!compact&&[...new Set([0,target??hi])].map(t=><text key={t} x={x(t)} y={height-2} textAnchor="middle">{format(t,0)} ns</text>)}
 </svg>
}
export default function EventTimeline({recordingId,events,programmedGapNs}:{recordingId?:string;events?:ReceiverEvent[];programmedGapNs?:number|null}){
 const [data,setData]=useState<Timeline|null>(null),[error,setError]=useState('')
 useEffect(()=>{if(events!==undefined||!recordingId)return;let stopped=false,timer:ReturnType<typeof setTimeout>;const controller=new AbortController()
  async function read(){try{const d=await api<Timeline>('/api/runs/'+recordingId+'/timeline.json',undefined,controller.signal);if(!stopped){setData(d);setError('');if(['recording','finishing'].includes(d.state))timer=setTimeout(read,1000)}}catch(e){if(!stopped)setError((e as Error).message)}}
  setData(null);read();return()=>{stopped=true;controller.abort();clearTimeout(timer)}
 },[recordingId,events])
 const rows=useMemo(()=>events??data?.groups.flatMap(g=>g.receivers.map(r=>({...r,event:g.event})))??[],[events,data])
 const result=useMemo(()=>cycleTiming(rows),[rows]);const latest=result.cycles.at(-1)
 const target=programmedGapNs??data?.groups.find(g=>g.event===43)?.source.requested_ns??null
 const delta42=difference(latest?.a?.first,latest?.b?.first),delta43=difference(latest?.a?.second,latest?.b?.second)
 return <section className="cycle-timeline" aria-label="Per-cycle receiver timing"><h3>Receiver timing by cycle</h3>
 <dl className="cycle-counters"><div><dt>Programmed gap</dt><dd>{format(target,0)} ns</dd></div><div><dt>{RECEIVERS[0]} gap</dt><dd>{format(gap(latest?.a),0)} ns</dd></div><div><dt>{RECEIVERS[1]} gap</dt><dd>{format(gap(latest?.b),0)} ns</dd></div><div><dt>B − A · 42 / 43</dt><dd>{format(delta42,0)} / {format(delta43,0)} ns</dd></div><div><dt>Cycles matched</dt><dd>{result.matched} / {result.cycles.length}</dd></div></dl>
 {error?<p role="alert">{error}</p>:latest?<><div className="latest-cycle"><strong>Latest cycle</strong><CyclePlot cycle={latest} target={target}/><p className="cycle-axis">Nanoseconds since this cycle’s event 42 on {latest.a?RECEIVERS[0]:RECEIVERS[1]}. Dashed line: programmed gap.</p></div>
 <div className="instrument-scroll"><table className="cycle-timestamps"><thead><tr><th>Receiver</th><th>Event 42 · UTC + ns</th><th>Event 43 · UTC + ns</th></tr></thead><tbody>{RECEIVERS.map((ip,i)=>{const pair=i===0?latest.a:latest.b;return <tr key={ip}><td>{ip}</td><td><Timestamp value={pair?.first}/></td><td><Timestamp value={pair?.second} first={pair?.first}/></td></tr>})}</tbody></table></div>
 {result.cycles.length>1&&<div className="earlier-cycles" aria-label="Earlier cycles">{result.cycles.slice(0,-1).reverse().map(c=><div className="earlier-cycle" key={c.id}><div><span>{new Date(Number((c.a?.first??c.b!.first)/1_000_000n)).toISOString().slice(11,23)} UTC</span><span>Gaps {format(gap(c.a),0)} / {format(gap(c.b),0)} ns · B − A {format(difference(c.a?.first,c.b?.first),0)} / {format(difference(c.a?.second,c.b?.second),0)} ns</span></div><CyclePlot cycle={c} target={target} compact/></div>)}</div>}</>:<p>{events!==undefined?'Waiting for receiver events 42 and 43.':'Waiting for recorded receiver timestamps.'}</p>}
 {(result.incomplete>0||result.orphans>0||result.invalid>0)&&<p className="count-note">{result.incomplete} incomplete or unpaired cycles · {result.orphans} event-43 records without a preceding 42 · {result.invalid} invalid timestamps.</p>}
 <details className="timeline-raw-log"><summary>Pairing and timestamp basis</summary><p>Each receiver’s next event 43 is paired with its preceding event 42. Cross-receiver pairing requires unique candidates within 1,000,000 ns; ambiguous or missing candidates remain unmatched. There is no per-shot identifier. A pair can cross the UTC second boundary. Marks use exact integer receiver timestamps, never browser arrival or polling times. Timestamp resolution is 8 ns.</p></details>
 </section>
}
