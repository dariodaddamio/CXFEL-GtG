import {useEffect,useState} from 'react'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue} from '@/components/ui/select'
import {Label} from '@/components/ui/label'
import {Dialog,DialogContent,DialogHeader,DialogTitle,DialogDescription} from '@/components/ui/dialog'
import {Tooltip as TooltipPrimitive} from 'radix-ui'
import {FRONTEND_ONLY,api,format,numeric,type Live,type Configuration,type ConfigurationsResponse} from './api'
import {CameraView,Help} from './experiment-parts'
import SessionMeasurements,{type Measurement} from './SessionMeasurements'
import {useRef} from 'react'
import SequenceResult from './SequenceResult'
import FeedbackResult from './FeedbackResult'
import EventTimeline from './EventTimeline'
import type {ReceiverEvent} from './cycle-timing'

type Review={review:{id:string;target:'live'|'record';seconds:number;configuration:Configuration;plan:{commands:string[];trigger_commands:string[];disarm_commands:string[];restore_commands:string[];session_policy:Record<string,unknown>}};digest:string}
type Session={detector_state?:string;state:string;error?:string;live:boolean;recording:boolean;remaining_seconds:number|null;configuration:Configuration|null;recording_id:string|null;feed:{recent_events?:{ip:string;event:number;sec:number;ns:number}[];trigger_period_ns:{mean:number|null};first_event_cursor:number|null;first_frame_id:number|null;retention_seconds:number;buffered_seconds:number;bytes_estimate:number;max_bytes:number;total_events:number;evicted_entries:number;next_before:number|null;frames:number;confirmed_sequences:number;retained_seconds:number;events:{ip:string;event:number;sec:number;ns:number;cursor:number}[];measurement:Measurement|null};last_result:{id:string;images_saved:number;capture_issue?:string;measurement:Measurement}|null}
type Saved=NonNullable<Live['observation']>&{display_name:string;protected:boolean;stored_bytes:number;stored_images:number;started_unix:number;led_session?:{measurement:Measurement}}
const EVENT_NAMES:Record<number,string>={42:'LED detection: first test event',43:'Follow-up test event',101:'Existing camera-trigger stream',125:'One-second clock marker (PPS)'}
const GEN='EVT:DEV2:20:',SEQ=GEN+'EVG:SEQ:1:'
const durationLabel=(seconds:number)=>seconds>=3600?format(seconds/3600,1)+' h':seconds>=60?format(seconds/60,0)+' min':Math.ceil(seconds)+' s'
const guide='https://dariodaddamio.github.io/CXFEL-GtG/timing_check/led_response.html'
export default function App(){
 const [live,setLive]=useState<Live|null>(null),[connected,setConnected]=useState(false),[session,setSession]=useState<Session|null>(null)
 const [config,setConfig]=useState<Configuration|null>(null)
 const [interval,setInterval]=useState('8'),[threshold,setThreshold]=useState('1000'),[seconds,setSeconds]=useState('10'),[name,setName]=useState('LED experiment')
 const [rawLogOpen,setRawLogOpen]=useState(false)
 const [olderRows,setOlderRows]=useState<Session['feed']['events']|null>(null),[before,setBefore]=useState<number|null>(null)
 const [error,setError]=useState(''),[saving,setSaving]=useState(false),[history,setHistory]=useState(false),[runs,setRuns]=useState<Saved[]>([])
 const [selected,setSelected]=useState<Saved|null>(null),[deleting,setDeleting]=useState<Saved|null>(null),[renaming,setRenaming]=useState<Saved|null>(null),[rename,setRename]=useState(''),[managing,setManaging]=useState(false)
 const [review,setReview]=useState<Review|null>(null),[reviewBusy,setReviewBusy]=useState(false)
 const [replay,setReplay]=useState<{id:string;target:number;shown:ReceiverEvent[]}|null>(null),replayTimers=useRef<ReturnType<typeof globalThis.setTimeout>[]>([])
 const running=!!session?.recording
 const activeDiff=session?.state==='running'&&!!config&&JSON.stringify(config.values)!==JSON.stringify(session.configuration?.values)
 const working=!!session&&['starting','applying','restoring'].includes(session.state)
 const revisionRef=useRef('')
 const tick=numeric(live?.status.pva,GEN+'Ref:Freq')?1000/numeric(live?.status.pva,GEN+'Ref:Freq')!:8
 const rounded=Math.ceil(Number(interval)/tick)*tick
 const valid=Number.isFinite(rounded)&&rounded>=8&&rounded<=1000000&&Number.isFinite(Number(threshold))&&Number(threshold)>0&&Number(threshold)<=4095&&Number.isInteger(Number(seconds))&&Number(seconds)>=10&&Number(seconds)<=60&&name.trim().length>0&&name.trim().length<=80
 const dirty=!!config&&(Number(interval)!==config.values.response_delay_ns||Number(threshold)!==config.values.threshold||name.trim()!==config.name)
 useEffect(()=>{
  if(FRONTEND_ONLY)return
  api<ConfigurationsResponse>('/api/configurations').then(d=>{const c=d.configurations.find(c=>c.id===5);if(!c)throw Error('LED configuration unavailable');setConfig(c);setInterval(String(c.values.response_delay_ns??8));setThreshold(String(c.values.threshold??1000));setName(c.name)}).catch(e=>setError(e.message))
  let closed=false,timer:ReturnType<typeof globalThis.setTimeout>;const controller=new AbortController()
  async function poll(){try{
   const [d,state]=await Promise.all([api<Live>('/api/live?since='+(Date.now()/1000-10),undefined,controller.signal),api<Session>('/api/session/status?heartbeat=1',undefined,controller.signal)])
   if(!closed){setLive(d);setConnected(true);setSession(state)}
  }catch{if(!closed)setConnected(false)}finally{if(!closed)timer=globalThis.setTimeout(poll,1000)}}
  poll();return()=>{closed=true;controller.abort();clearTimeout(timer)}
 },[])
 async function save(){if(!config||!valid)return;setSaving(true);setError('');try{const d=await api<Configuration>('/api/configurations',{id:5,revision:config.revision,kind:'led-feedback',name:name.trim(),values:{...config.values,response_delay_ns:Number(interval),threshold:Number(threshold)}});setConfig(d);setInterval(String(d.values.response_delay_ns));setName(d.name)}catch(e){setError((e as Error).message)}finally{setSaving(false)}}
 async function loadRuns(){try{setRuns((await api<{runs:Saved[]}>('/api/runs')).runs)}catch(e){setError((e as Error).message)}}
 async function manage(action:'rename'|'delete',run:Saved){setManaging(true);try{await api('/api/runs/manage',{id:run.id,action,...(action==='delete'?{confirm_id:run.id}:{name:rename})});setDeleting(null);setRenaming(null);await loadRuns()}catch(e){setError((e as Error).message)}finally{setManaging(false)}}
 const freq=numeric(live?.status.pva,GEN+'Ref:Freq'),divisor=numeric(live?.status.pva,GEN+'EVG:TMR:1:divisor'),sourcePeriod=freq&&divisor?divisor*1000/freq:null
 const times=live?.status.pva[SEQ+'times']?.value as unknown
 const storedInterval=Array.isArray(times)&&times.length>=2?Number(times[1])-Number(times[0]):null
 const context=JSON.stringify([config?.revision,interval,threshold,name,seconds,dirty]);revisionRef.current=context
 useEffect(()=>setReview(null),[context])
 useEffect(()=>{if(olderRows&&(!session?.feed.total_events||olderRows.some(r=>r.cursor<(session.feed.first_event_cursor??0)))){setOlderRows(null);setBefore(null)}},[session?.feed.first_event_cursor,session?.feed.total_events])
 async function begin(target:'live'|'record'){
  setReviewBusy(true);setError('');const key=revisionRef.current
  try{if(session?.state==='running'){
   const state=await api<Session>(target==='live'?'/api/session/live':'/api/session/record',target==='live'?{enabled:true}:{seconds:Number(seconds)});setSession(state)
  }else{const d=await api<Review>('/api/session/prepare',{target,seconds:Number(seconds)});if(revisionRef.current===key)setReview(d)}}catch(e){setError((e as Error).message)}finally{setReviewBusy(false)}
 }
 async function apply(){if(!review||dirty||config?.revision!==review.review.configuration.revision)return;setReviewBusy(true);try{setSession(await api<Session>('/api/session/start',{id:review.review.id,digest:review.digest,confirmed:true}));setReview(null)}catch(e){setError((e as Error).message)}finally{setReviewBusy(false)}}
 async function memoryWindow(value:string){try{setSession(await api<Session>('/api/session/buffer',{seconds:Number(value)}));setOlderRows(null)}catch(e){setError((e as Error).message)}}
 async function olderEvents(){try{const d=await api<{events:Session['feed']['events'];next_before:number|null}>('/api/session/events?before='+(before??session?.feed.next_before??0));setOlderRows(d.events);setBefore(d.next_before)}catch(e){setError((e as Error).message)}}
 function stopReplay(){replayTimers.current.forEach(clearTimeout);replayTimers.current=[];setReplay(null)}
 async function startReplay(){
  stopReplay()
  try{const r=await fetch(import.meta.env.BASE_URL+'replay/led-8ns.json');if(!r.ok)throw Error('The replay file is unavailable.');const d=await r.json() as {recording_id:string;programmed_ns:number;events:ReceiverEvent[]}
   setReplay({id:d.recording_id,target:d.programmed_ns,shown:[]})
   // Pace the replay by the receivers' own timestamps; nothing else sets the timing.
   const t0=BigInt(d.events[0].sec)*1_000_000_000n+BigInt(d.events[0].ns)
   d.events.forEach((e,i)=>{const at=Number((BigInt(e.sec)*1_000_000_000n+BigInt(e.ns)-t0)/1_000_000n)
    replayTimers.current.push(globalThis.setTimeout(()=>setReplay(p=>p&&{...p,shown:d.events.slice(0,i+1)}),600+at))})
  }catch(e){setError((e as Error).message)}
 }
 useEffect(()=>{if(FRONTEND_ONLY&&new URLSearchParams(location.search).has('replay'))startReplay();return()=>replayTimers.current.forEach(clearTimeout)},[])
 async function stopLive(){try{setSession(await api<Session>('/api/session/live',{enabled:false}))}catch(e){setError((e as Error).message)}}
 const stale=!connected||!live?.status.read_utc||Date.now()-Date.parse(live.status.read_utc)>12000
 return <TooltipPrimitive.Provider delayDuration={250}><main className="novice-app led-only">
 <header className="experiment-header"><div className="experiment-title"><h1>Timing console</h1>{!FRONTEND_ONLY&&<span className="connection-state">{stale?'Connecting…':'Connected'}</span>}</div><div className="experiment-links"><Button variant="outline" onClick={()=>{setHistory(true);loadRuns()}}>Saved runs</Button><a href={guide} target="_blank" rel="noreferrer">Experiment report</a></div></header>
 <section className="event-legend" aria-label="Event codes"><span><i className="rt-key rt-k42"/><b>42</b> is the first test marker, sent when a fresh LED flash starts a cycle.</span><span><i className="rt-key rt-k43"/><b>43</b> is the second marker, sent {format(rounded,0)} ns after 42.</span><span><b>101</b> triggers the camera and <b>125</b> marks each second; neither is changed.</span></section>
 {error&&<p role="alert" className="runner-error">{error}<Button variant="ghost" onClick={()=>setError('')}>Dismiss</Button></p>}
 <section className="run-bar" aria-label="Run controls">
  <div className="run-actions">
   <Button disabled={working||reviewBusy||!!replay||(!session?.live&&(dirty||!valid||!config))} onClick={()=>session?.live?stopLive():begin('live')}>{session?.live?'Stop Live':'Start Live'}</Button>
   <Button variant="outline" disabled={running||working||reviewBusy||dirty||activeDiff||!valid||!config||!!replay} onClick={()=>begin('record')}>{running?((session?.remaining_seconds??0)>0?'Recording, '+Math.ceil(session?.remaining_seconds??0)+' s left':'Finishing save…'):'Record '+seconds+' seconds'}</Button>
   {FRONTEND_ONLY&&<Button variant="outline" onClick={replay?stopReplay:startReplay}>{replay?'Stop replay':'Replay recording'}</Button>}
   <span className="run-memory"><Label htmlFor="memory-window">Keep live history for</Label><Select value={String(session?.feed.retention_seconds??10800)} onValueChange={memoryWindow}><SelectTrigger id="memory-window" aria-label="Memory window"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="10">10 seconds</SelectItem><SelectItem value="60">1 minute</SelectItem><SelectItem value="600">10 minutes</SelectItem><SelectItem value="3600">1 hour</SelectItem><SelectItem value="10800">3 hours</SelectItem></SelectContent></Select></span>
  </div>
  <p className="run-state">{replay?'Replaying recording '+replay.id+' at its original pace.':session?.live?'Live is running. Each fresh LED flash triggers one cycle on generator 10.139.5.196, and '+(session?.feed.confirmed_sequences??0)+' cycles were confirmed in the latest 10 seconds.':running?'A recording is running and saving to this device, so hardware settings stay locked until it finishes.':session?.feed.frames?'Live is stopped, and its history expires in '+durationLabel(session.feed.retained_seconds)+'.':FRONTEND_ONLY?'Not connected to the timing hardware. Replay a recording to see how a run looks.':'Live is stopped. Start Live to watch cycles as they happen, or record a fixed-length run.'}</p>
  {session?.error&&<p className="runner-error">{session.error}</p>}
  {session?.state==='restoring'&&<p className="run-state">Restoring the original device settings.</p>}
 </section>
 <div className="console-grid">
  <div className="console-main">
   <EventTimeline events={replay?replay.shown:(session?.feed.recent_events??session?.feed.events??[])} programmedGapNs={replay?replay.target:(session?.feed.measurement?.target_ns??(session?.state==='running'?storedInterval:null))} replayLabel={replay?'Replay':undefined}/>
   {session?.last_result&&<section className="step-panel last-result"><h2>Last recording</h2><p>{session.last_result.id} saved {session.last_result.images_saved} images and confirmed {session.last_result.measurement.source_cycles??0} cycles.</p>{session.last_result.capture_issue&&<p className="runner-error">{session.last_result.capture_issue}</p>}<SessionMeasurements data={session.last_result.measurement} recorded/></section>}
   <details className="console-details"><summary>Session statistics</summary>
    <SessionMeasurements data={session?.feed.measurement} emptyText={session?.live?(session.detector_state==='waiting_bright'?'Waiting for a bright image above the cutoff.':session.detector_state==='waiting_dark'?'Waiting for a dark image before the next LED transition.':'Waiting for receiver logs.'):'Live is stopped.'}/>
    <p className="buffer-usage">The live buffer holds {format(session?.feed.total_events??0,0)} event rows and {format(session?.feed.frames??0,0)} preview frames, about {format((session?.feed.bytes_estimate??0)/1048576,1)} MiB covering {format((session?.feed.buffered_seconds??0)/60,1)} minutes, against a 4 GiB limit.{!!session?.feed.evicted_entries&&' The limit was reached, so the oldest entries were discarded.'}</p>
    <p className="buffer-usage">Software trigger requests arrived every {format(session?.feed.trigger_period_ns?.mean,0)} ns on average, which is host timing rather than a hardware measurement. Camera trigger event 101 is configured at {format(stale?null:sourcePeriod,0)} ns, and CAM2 is delivering {format(live?.metrics.camera.interval_ms.mean?1000/live.metrics.camera.interval_ms.mean:null,2)} frames per second.</p>
   </details>
   <details className="console-details" onToggle={e=>setRawLogOpen(e.currentTarget.open)}><summary>Raw event log ({format(session?.feed.total_events??0,0)} rows)</summary>{rawLogOpen&&<><div className="event-log-controls"><Button size="sm" variant="outline" onClick={()=>{setOlderRows(null);setBefore(null)}}>Newest</Button><Button size="sm" variant="outline" disabled={olderRows?before==null:session?.feed.next_before==null} onClick={olderEvents}>Older 200</Button></div><div className="instrument-scroll live-log"><table className="setup-preview event-log-table"><thead><tr><th>Receiver IP</th><th>Event</th><th>UTC second</th><th title="Nanoseconds elapsed within the displayed UTC second, from 0 to 999,999,999. This is not a transmission delay.">Within second (ns)</th></tr></thead><tbody>{(olderRows??session?.feed.events)?.map((r,i)=><tr key={i}><td>{r.ip}</td><td title={EVENT_NAMES[r.event]}>{r.event}, {EVENT_NAMES[r.event]}</td><td className="timestamp-second" title={r.sec+'.'+String(r.ns).padStart(9,'0')+' POSIX seconds'}>{new Date(r.sec*1000).toISOString().slice(0,19).replace('T',' ')}</td><td className="timestamp-ns" title={r.ns+' nanoseconds into this UTC second'}>{format(r.ns,0)}</td></tr>)}</tbody></table></div><p className="timestamp-explanation">Nanoseconds count from the start of the UTC second. Receiver timestamp resolution is 8 ns.</p></>}</details>
  </div>
  <div className="console-side">
   <CameraView active={connected} retained={!!session?.feed.frames} historyFrames={session?.feed.frames??0} firstFrameId={session?.feed.first_frame_id??null} threshold={Number(session?.configuration?.values.threshold??threshold)} live={live}/>
   <section className="step-panel"><h2>Settings</h2><div className="led-fields">
    <div><Label htmlFor="event-gap">Time from 42 to 43 (ns)</Label><Help name="The spacing the generator is programmed to put between the two markers. It is not the delay from the LED turning on. The receiver timestamps show the spacing actually logged."/><Input id="event-gap" type="number" min={8} max={1000000} step={tick} disabled={running} value={interval} onChange={e=>setInterval(e.target.value)}/></div>
    <div><Label htmlFor="led-threshold">LED brightness cutoff (counts)</Label><Help name="A fresh dark frame followed by a frame whose peak is above this value starts one cycle."/><Input id="led-threshold" type="number" min={1} max={4095} disabled={running} value={threshold} onChange={e=>setThreshold(e.target.value)}/></div>
    <div><Label htmlFor="record-seconds">Recording length (s)</Label><Input id="record-seconds" type="number" min={10} max={60} step={1} disabled={running} value={seconds} onChange={e=>setSeconds(e.target.value)}/></div>
    <div><Label htmlFor="run-name">Run name</Label><Input id="run-name" value={name} maxLength={80} disabled={running} onChange={e=>setName(e.target.value)}/></div>
   </div><div className="led-settings-footer"><span>Rounded to 8 ns ticks: {format(rounded,0)} ns.</span><Button variant="outline" disabled={!dirty||!valid||saving||running} onClick={save}>{saving?'Saving…':'Save settings'}</Button></div>{activeDiff&&<p className="settings-apply-note">Stop and restart Live to apply the saved changes.</p>}</section>
  </div>
 </div>
 <Dialog open={history} onOpenChange={setHistory}><DialogContent className="sm:max-w-4xl max-h-[85vh] overflow-auto"><DialogHeader><DialogTitle>Saved LED runs</DialogTitle><DialogDescription>Images, timestamps and settings are stored on this device. Published evidence and the latest result are protected from deletion.</DialogDescription></DialogHeader><div className="instrument-scroll"><table className="setup-preview"><thead><tr><th>Run</th><th>Recorded</th><th>Images / size</th><th/></tr></thead><tbody>{runs.map(run=><tr key={run.id}><td>{run.display_name}<br/><small>{run.duration_seconds} s · {run.state}</small></td><td>{new Date(run.started_unix*1000).toLocaleString()}</td><td>{run.stored_images} / {format(run.stored_bytes/1e6,1)} MB</td><td><div className="saved-run-actions"><Button size="sm" variant="outline" onClick={()=>setSelected(run)}>Open</Button><Button size="sm" variant="outline" disabled={running} onClick={()=>{setRenaming(run);setRename(run.display_name)}}>Rename</Button><Button size="sm" variant="outline" disabled={running||run.protected} title={run.protected?'Published evidence or latest result':'Permanently delete this recording and its images'} onClick={()=>setDeleting(run)}>{run.protected?'Protected':'Delete'}</Button></div></td></tr>)}</tbody></table></div>{!runs.length&&<p>No saved recordings.</p>}</DialogContent></Dialog>
 <Dialog open={!!selected} onOpenChange={open=>{if(!open)setSelected(null)}}><DialogContent className="sm:max-w-5xl max-h-[85vh] overflow-auto"><DialogHeader><DialogTitle>{selected?.display_name}</DialogTitle><DialogDescription>{selected?.id}</DialogDescription></DialogHeader>{selected&&<>{!selected.led_session&&selected.feedback&&<FeedbackResult feedback={selected.feedback}/>} {selected.led_session?<><p>{selected.led_session.measurement.source_cycles??0} sequence executions confirmed in this recording.</p><SessionMeasurements data={selected.led_session.measurement} recorded/></>:<SequenceResult measurement={selected.results?.requested_observed}/>} <EventTimeline recordingId={selected.id} programmedGapNs={selected.led_session?.measurement.target_ns}/><div className="saved-file-links"><a href={'/api/runs/'+selected.id+'/raw.jsonl'} download>Raw timestamps</a><a href={'/api/runs/'+selected.id+'/frames.csv'} download>Image metadata</a></div></>}</DialogContent></Dialog>
 <Dialog open={!!deleting} onOpenChange={open=>{if(!open&&!managing)setDeleting(null)}}><DialogContent><DialogHeader><DialogTitle>Delete {deleting?.display_name}?</DialogTitle><DialogDescription>This permanently removes the saved images and raw logs. Device-action audit records are retained.</DialogDescription></DialogHeader><div className="dialog-actions"><Button variant="outline" disabled={managing} onClick={()=>setDeleting(null)}>Cancel</Button><Button disabled={managing} onClick={()=>deleting&&manage('delete',deleting)}>Delete recording</Button></div></DialogContent></Dialog>
 <Dialog open={!!renaming} onOpenChange={open=>{if(!open&&!managing)setRenaming(null)}}><DialogContent><DialogHeader><DialogTitle>Rename recording</DialogTitle><DialogDescription>Measurement records remain unchanged.</DialogDescription></DialogHeader><Label htmlFor="saved-run-name">Name</Label><Input id="saved-run-name" maxLength={80} value={rename} onChange={e=>setRename(e.target.value)}/><Button disabled={managing||!rename.trim()} onClick={()=>renaming&&manage('rename',renaming)}>Save name</Button></DialogContent></Dialog>
 <Dialog open={!!review} onOpenChange={open=>{if(!open)setReview(null)}}><DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-auto"><DialogHeader><DialogTitle>{review?.review.target==='live'?'Start Live LED check':'Start timed recording'}</DialogTitle><DialogDescription>Apply the reviewed configuration. Events 42 and 43 repeat for fresh LED transitions while Live or Record needs the check; stop and restore when both are inactive.</DialogDescription></DialogHeader><p>Maximum 10 software triggers/s. Live stops if its browser heartbeat is absent for 15 seconds; a timed recording keeps its own deadline. Event 101, camera acquisition and DG645 stay unchanged.</p>{review&&(['commands','trigger_commands','restore_commands'] as const).map(key=><details open key={key}><summary>{key==='commands'?'Apply':key==='trigger_commands'?'Arm once; repeat trig per fresh LED transition; disarm on stop':'Restore'}</summary><pre>{review.review.plan[key].join('\n')}</pre></details>)}<div className="dialog-actions"><Button variant="outline" onClick={()=>setReview(null)}>Cancel</Button><Button disabled={reviewBusy||dirty} onClick={apply}>Apply and start {review?.review.target==='live'?'Live':'recording'}</Button></div></DialogContent></Dialog>
 {!FRONTEND_ONLY&&<footer className="experiment-footer">Saved on this device: Desktop/dario/timing-check/console/runs/</footer>}
 </main></TooltipPrimitive.Provider>
}
