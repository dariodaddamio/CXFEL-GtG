import {useEffect,useMemo,useState} from 'react'
import {api,format} from './api'
import {cycleTiming,gap,difference,RECEIVERS,type ReceiverEvent,type Cycle} from './cycle-timing'

/* What the receivers logged, positioned only by receiver hardware timestamps.
   Host receipt, polling and browser times never place a mark. */

type Timeline={state:string;groups:{event:number;receivers:{ip:string;sec:number;ns:number}[];source:{requested_ns?:number|null}}[]}
const SHORT=['.195','.198'] as const
const NS=1_000_000_000n
const origin=(c:Cycle)=>c.a?.first??c.b!.first
const utcTime=(t:bigint)=>new Date(Number(t/1_000_000n)).toISOString().slice(11,23)
const utcSecond=(t:bigint)=>new Date(Number(t/NS)*1000).toISOString().slice(0,19).replace('T',' ')
const spacing=(n:number|null)=>n==null?'—':n>=1_000_000&&n%1_000_000===0?format(n/1_000_000,0)+' ms':format(n,0)+' ns'
const cycleOk=(c:Cycle,target:number|null)=>{const ga=gap(c.a),gb=gap(c.b);return ga!=null&&gb!=null&&(target==null||(ga===target&&gb===target))&&difference(c.a?.first,c.b?.first)===0&&difference(c.a?.second,c.b?.second)===0}

/** Nanoseconds within the second, grouped in threes; digits that differ from `base` are highlighted. */
function Digits({value,base}:{value?:bigint;base?:bigint}){
 if(value===undefined)return <span className="rt-digits">—</span>
 const d=(value%NS).toString().padStart(9,'0'),b=base===undefined?d:(base%NS).toString().padStart(9,'0')
 return <span className="rt-digits" title={(value/NS)+'.'+d+' POSIX seconds'}>{[0,3,6].map(s=><span key={s} className="rt-group">{d.slice(s,s+3).split('').map((ch,i)=>ch!==b[s+i]?<b key={i}>{ch}</b>:<span key={i}>{ch}</span>)}</span>)}</span>
}

/** Every cycle in view on a seconds axis: one tick per 42+43 pair, per receiver. */
function RunStrip({cycles,selected,onSelect}:{cycles:Cycle[];selected?:Cycle;onSelect:(id:string)=>void}){
 const W=900,x0=96,x1=884,first=origin(cycles[0]),last=origin(cycles[cycles.length-1])
 const span=Math.max(1,Math.ceil(Number(last-first)/1e9)),x=(t:bigint)=>x0+Number(t-first)/(span*1e9)*(x1-x0)
 return <svg className="rt-svg" viewBox={`0 0 ${W} 92`} role="img" aria-label={`${cycles.length} cycles across ${span} seconds; select a tick to inspect that cycle`}>
  {RECEIVERS.map((ip,lane)=><g key={ip}><text x={x0-10} y={22+lane*30+4} textAnchor="end" className="rt-lane">{ip}</text><line x1={x0} x2={x1} y1={22+lane*30} y2={22+lane*30} className="rt-rule"/></g>)}
  {cycles.map(c=>{const sel=c===selected;return <g key={c.id} className={'rt-tick'+(sel?' selected':'')} role="button" tabIndex={0} aria-label={'Cycle at '+utcTime(origin(c))+' UTC'} onClick={()=>onSelect(c.id)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();onSelect(c.id)}}}>
   <title>Cycle at {utcTime(origin(c))} UTC with spacing {spacing(gap(c.a))} on .195 and {spacing(gap(c.b))} on .198</title>
   <rect x={x(origin(c))-5} y={6} width={10} height={62} className="rt-hit"/>
   {[c.a,c.b].map((p,lane)=>p&&<line key={lane} x1={x(p.first)} x2={x(p.first)} y1={12+lane*30} y2={32+lane*30}/>)}
  </g>})}
  {Array.from({length:span+1},(_,s)=><g key={s}><line x1={x0+s/span*(x1-x0)} x2={x0+s/span*(x1-x0)} y1={70} y2={74} className="rt-axis"/><text x={x0+s/span*(x1-x0)} y={87} textAnchor="middle" className="rt-tick-label">{s} s</text></g>)}
 </svg>
}

/** One cycle magnified to nanoseconds: events 42 and 43 on both receivers. */
function CycleZoom({cycle,target}:{cycle:Cycle;target:number|null}){
 const W=900,x0=96,x1=884,o=origin(cycle)
 const seen=Math.max(gap(cycle.a)??0,gap(cycle.b)??0),g=Math.max(8,target??0,seen)
 const lo=-g,hi=2*g,x=(t:number)=>x0+(t-lo)/(hi-lo)*(x1-x0)
 const grid=(hi-lo)/8<=48?Array.from({length:Math.floor((hi-lo)/8)+1},(_,i)=>lo+i*8):[]
 const ticks=[...new Set([lo,0,g,hi])]
 const label=(t:number)=>t===0?'0':Math.abs(t)>=100_000?(t/1e6>0?'+':'')+format(t/1e6,3)+' ms':(t>0?'+':'')+format(t,0)+' ns'
 return <svg className="rt-svg" viewBox={`0 0 ${W} 156`} role="img" aria-label={`Cycle at ${utcTime(o)} UTC: event 42 and event 43 on both receivers, by receiver timestamp`}>
  {grid.map(t=><line key={t} x1={x(t)} x2={x(t)} y1={8} y2={118} className="rt-grid"/>)}
  {target!=null&&<line x1={x(target)} x2={x(target)} y1={8} y2={118} className="rt-programmed"><title>Programmed spacing: {spacing(target)}. This line is the setting, not a reception.</title></line>}
  {RECEIVERS.map((ip,lane)=>{const p=lane===0?cycle.a:cycle.b,y=42+lane*52
   return <g key={ip}><text x={x0-10} y={y+4} textAnchor="end" className="rt-lane">{ip}</text><line x1={x0} x2={x1} y1={y} y2={y} className="rt-rule"/>
    {p?[[42,p.first] as const,...(p.second===undefined?[]:[[43,p.second] as const])].map(([code,t])=>{const px=x(Number(t-o)),left=code===42
     return <g key={code}><title>{ip} logged event {code} at {utcSecond(t)} UTC plus {(t%NS).toString().padStart(9,'0')} ns</title>
      <line x1={px} x2={px} y1={y-15} y2={y+15} className={'rt-ev rt-ev'+code}/>
      <text x={px+(left?-9:9)} y={y-3} textAnchor={left?'end':'start'} className={'rt-code rt-c'+code}>{code}</text>
      <text x={px+(left?-9:9)} y={y+12} textAnchor={left?'end':'start'} className="rt-mini">{(t%NS).toString().padStart(9,'0').replace(/(\d{3})(\d{3})(\d{3})/,'$1 $2 $3')}</text></g>}):<text x={x0+8} y={y-6} className="rt-mini">no record</text>}
   </g>})}
  {ticks.map(t=><g key={t}><line x1={x(t)} x2={x(t)} y1={122} y2={126} className="rt-axis"/><text x={x(t)} y={140} textAnchor="middle" className="rt-tick-label">{label(t)}</text></g>)}
  {grid.length>0&&<text x={x1} y={18} textAnchor="end" className="rt-tick-label">Dotted lines mark 8 ns clock ticks</text>}
 </svg>
}

export default function EventTimeline({recordingId,events,programmedGapNs,replayLabel}:{recordingId?:string;events?:ReceiverEvent[];programmedGapNs?:number|null;replayLabel?:string}){
 const [data,setData]=useState<Timeline|null>(null),[error,setError]=useState(''),[pick,setPick]=useState<string|null>(null)
 useEffect(()=>{if(events!==undefined||!recordingId)return;let stopped=false,timer:ReturnType<typeof setTimeout>;const controller=new AbortController()
  async function read(){try{const d=await api<Timeline>('/api/runs/'+recordingId+'/timeline.json',undefined,controller.signal);if(!stopped){setData(d);setError('');if(['recording','finishing'].includes(d.state))timer=setTimeout(read,1000)}}catch(e){if(!stopped)setError((e as Error).message)}}
  setData(null);read();return()=>{stopped=true;controller.abort();clearTimeout(timer)}
 },[recordingId,events])
 const rows=useMemo(()=>events??data?.groups.flatMap(g=>g.receivers.map(r=>({...r,event:g.event})))??[],[events,data])
 const result=useMemo(()=>cycleTiming(rows),[rows])
 const target=programmedGapNs??data?.groups.find(g=>g.event===43)?.source.requested_ns??null
 const latest=result.cycles.at(-1),selected=result.cycles.find(c=>c.id===pick)??latest,following=!pick||selected===latest
 const ok=result.cycles.filter(c=>cycleOk(c,target)).length
 const d42=selected&&difference(selected.a?.first,selected.b?.first),d43=selected&&difference(selected.a?.second,selected.b?.second)
 return <section className="receiver-timing" aria-label="What the receivers logged">
  <div className="rt-head"><div><h2>What the receivers logged</h2><p>Positions use receiver hardware timestamps only.</p></div>
   {replayLabel&&<span className="rt-replay">{replayLabel}</span>}</div>
  <dl className="rt-counters">
   <div><dt>Programmed spacing</dt><dd>{spacing(target)}</dd></div>
   <div><dt><i className="rt-key rt-k42"/>42 → <i className="rt-key rt-k43"/>43 at {SHORT[0]}</dt><dd>{spacing(gap(selected?.a)??null)}</dd></div>
   <div><dt><i className="rt-key rt-k42"/>42 → <i className="rt-key rt-k43"/>43 at {SHORT[1]}</dt><dd>{spacing(gap(selected?.b)??null)}</dd></div>
   <div><dt>{SHORT[1]} minus {SHORT[0]}</dt><dd>{d42==null?'—':format(d42,0)} / {d43==null?'—':format(d43,0)} <small>ns</small></dd></div>
   <div className={result.cycles.length?ok===result.cycles.length?'good':'bad':''}><dt>Cycles matching</dt><dd>{ok} <small>of {result.cycles.length}</small></dd></div>
  </dl>
  {error?<p role="alert" className="runner-error">{error}</p>:!selected?<p className="rt-empty">{events!==undefined?'Waiting for the receivers to log events 42 and 43. Each fresh LED flash starts one cycle.':'Waiting for recorded receiver timestamps.'}</p>:<>
   <div className="rt-block"><div className="rt-block-head"><h3>Every cycle in view</h3><span>One line per cycle. Select a line to magnify it.</span></div><RunStrip cycles={result.cycles} selected={selected} onSelect={setPick}/></div>
   <div className="rt-block"><div className="rt-block-head"><h3>{following?'Latest cycle':'Selected cycle'}, magnified <small>at {utcTime(origin(selected))} UTC</small></h3>{!following&&<button type="button" className="rt-link" onClick={()=>setPick(null)}>Follow latest</button>}</div>
    <CycleZoom cycle={selected} target={target}/>
    <div className="instrument-scroll"><table className="rt-stamps"><thead><tr><th>Receiver</th><th><i className="rt-key rt-k42"/>Event 42 logged at</th><th><i className="rt-key rt-k43"/>Event 43 logged at</th><th>43 − 42</th></tr></thead><tbody>{RECEIVERS.map((ip,i)=>{const p=i===0?selected.a:selected.b;return <tr key={ip}><td>{ip}</td><td><Digits value={p?.first}/> <small>ns</small></td><td><Digits value={p?.second} base={p?.first}/> <small>ns</small></td><td className="num">{spacing(gap(p))}</td></tr>})}</tbody></table>
    <p className="rt-note">Nanoseconds within UTC second {utcSecond(origin(selected))}. Highlighted digits change from 42 to 43.</p></div></div>
   <details className="rt-history"><summary>All {result.cycles.length} cycles, newest first</summary><div className="instrument-scroll rt-history-scroll"><table><thead><tr><th>UTC</th><th>Spacing {SHORT[0]}</th><th>Spacing {SHORT[1]}</th><th>{SHORT[1]} − {SHORT[0]}, 42 / 43</th><th>Result</th></tr></thead><tbody>{[...result.cycles].reverse().map(c=><tr key={c.id} className={c===selected?'selected':''} onClick={()=>setPick(c.id)}><td>{utcTime(origin(c))}</td><td className="num">{spacing(gap(c.a))}</td><td className="num">{spacing(gap(c.b))}</td><td className="num">{format(difference(c.a?.first,c.b?.first),0)} / {format(difference(c.a?.second,c.b?.second),0)} ns</td><td>{cycleOk(c,target)?'Match':'Check'}</td></tr>)}</tbody></table></div></details>
  </>}
  {(result.incomplete>0||result.orphans>0||result.invalid>0)&&<p className="count-note">Some records could not be paired: {result.incomplete} cycles are incomplete, {result.orphans} event-43 records have no preceding 42, and {result.invalid} timestamps are invalid.</p>}
  <details className="rt-basis"><summary>How cycles are paired</summary><p>On each receiver, each event 43 is paired with the event 42 just before it. The two receivers' copies of a cycle are matched only when exactly one candidate lies within 1 ms; ambiguous or missing copies stay unmatched instead of being guessed. A cycle "matches" when both receivers logged the programmed spacing and agree on both timestamps. Receiver timestamps resolve 8 ns.</p></details>
 </section>
}
