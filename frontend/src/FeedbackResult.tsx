import { format, type Feedback } from './api'

export default function FeedbackResult({feedback}:{feedback?:Feedback}){
 const f=feedback
 const confirmations=f?.cycles?.flatMap(c=>c.detection_to_confirmation_ns==null?[]:[c.detection_to_confirmation_ns])??[]
 const meanConfirmation=confirmations.length?confirmations.reduce((a,b)=>a+b,0)/confirmations.length:f?.host_detection_to_confirmation_ns
 const status=f?.state==='received'?'Sequence recorded by both receivers':f?.state==='no_transition'?'No LED transition detected':f?.state==='response_missing'?'Response event missing':f?.state==='stopped'?'Stopped':f?.state==='waiting_dark'?'Waiting for a dark frame':f?.state==='waiting_bright'?'Waiting for a bright frame':f?'Sending the response event':'Not run'
 return <section className="sequence-result" aria-label="LED feedback result">
  <h3>LED feedback · {status}</h3>
  <table className="setup-preview"><thead><tr><th>Step</th><th>Evidence</th></tr></thead><tbody>
   <tr><td>CAM2 · dark-to-bright observations</td><td>{f?.cycles_requested?`${f.cycles_detected??f.cycles?.length??0} / ${f.cycles_requested} qualified`:f?.bright_frame?'One transition qualified':'Not detected'}</td></tr>
   <tr><td>10.139.5.196 · events 42 and 43</td><td>{f?.cycles_requested?`${f.cycles?.length??0} / ${f.cycles_requested} sequences confirmed`:f?.triggered?'One sequence execution confirmed':'Not sent'}</td></tr>
   <tr><td>10.139.5.195 / 10.139.5.198</td><td>{f?.state==='received'?'All expected sequence events recorded on both receivers':f?.triggered?'Check receiver records':'No response expected'}</td></tr>
  </tbody></table>
  {f&&<details className="timeline-raw-log"><summary>LED detection and host processing log</summary><table className="setup-preview"><tbody>
   <tr><td>Last dark frame</td><td>{f.dark_frame?`${f.dark_frame.frame_id} · peak ${f.dark_frame.roi_peak} counts`:'Not detected'}</td></tr>
   <tr><td>Last bright frame</td><td>{f.bright_frame?`${f.bright_frame.frame_id} · peak ${f.bright_frame.roi_peak} counts`:'Not detected'}</td></tr>
   <tr title="Host monotonic time from image detection to sequencer run-count confirmation. Includes software, network and readback time."><td>{f?.cycles_requested?'Mean software response confirmation':'Software response confirmation'}</td><td>{meanConfirmation!=null?format(meanConfirmation,0)+' ns':'Not measured'}</td></tr>
  </tbody></table>
  {!!f?.cycles?.length&&<table className="setup-preview"><thead><tr><th>Cycle</th><th>Dark / bright frame</th><th>Detection → request (ns)</th><th>Detection → confirmation (ns)</th></tr></thead><tbody>{f.cycles.map(c=><tr key={c.cycle}><td>{c.cycle}</td><td>{c.dark_frame.frame_id} / {c.bright_frame.frame_id}</td><td>{format(c.detection_to_write_start_ns,0)}</td><td>{format(c.detection_to_confirmation_ns,0)}</td></tr>)}</tbody></table>}
  <p>Host confirmation includes software, network and IOC readback time; it is not an optical-edge timestamp.</p></details>}
  {f?.reason&&<p>{f.reason}</p>}

 </section>
}
