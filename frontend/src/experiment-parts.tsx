import {useEffect,useRef,useState,type ReactNode} from 'react'
import {Camera,CircleHelp,ScanLine} from 'lucide-react'
import {Tooltip as TooltipPrimitive} from 'radix-ui'
import {Label} from '@/components/ui/label'
import {FRONTEND_ONLY,format,numeric,type Live} from './api'
const CAMERA='CAM:DEV2:20:'
const HELP:Record<string,string>={Preview:'Pause or resume the live image preview. Recording continues to save original camera frames independently.'}
function Help({name,description}:{name:string;description?:string}){
 const [open,setOpen]=useState(false),[pinned,setPinned]=useState(false);const content=description??HELP[name]??name;
 if(!content)return null;
 const close=()=>{setPinned(false);setOpen(false)};
 return <TooltipPrimitive.Root open={open} onOpenChange={next=>{if(next||!pinned)setOpen(next)}}><TooltipPrimitive.Trigger asChild><button type="button" className="field-help" aria-label={'Explain '+name} onBlur={close} onClick={e=>{e.preventDefault();setPinned(!pinned);setOpen(!pinned)}}><CircleHelp size={13}/></button></TooltipPrimitive.Trigger><TooltipPrimitive.Portal><TooltipPrimitive.Content sideOffset={6} collisionPadding={12} onEscapeKeyDown={close} onPointerDownOutside={close} className="field-tooltip">{content}<TooltipPrimitive.Arrow className="fill-[#22343b]"/></TooltipPrimitive.Content></TooltipPrimitive.Portal></TooltipPrimitive.Root>
}

function Panel({title,icon,action,children,className=''}:{title:string;icon?:ReactNode;action?:ReactNode;children:ReactNode;className?:string}){
 return <section className={'panel '+className}><div className="panel-title"><h2>{icon}{title}</h2>{action}</div>{children}</section>
}
function CameraView({active,live,retained=true,threshold=1000,historyFrames=0,firstFrameId=null}:{active:boolean;live:Live|null;retained?:boolean;threshold?:number;historyFrames?:number;firstFrameId?:number|null}){
 const [historyIndex,setHistoryIndex]=useState<number|null>(null);
 const preview=true;const [frame,setFrame]=useState<{url:string;id:string|null;stamp:number;peak:number|null;bright:boolean|null;cutoff:number;roi:number[]}|null>(null),[failure,setFailure]=useState('');
 const url=useRef<string|undefined>(undefined);
 const deliveries=useRef<number[]>([]),lastId=useRef<string|null>(null);
 const [previewFps,setPreviewFps]=useState<number|null>(null);
 const [latency,setLatency]=useState<number|null>(null);
 useEffect(()=>{if(FRONTEND_ONLY)return;if((!active&&historyIndex==null)||!preview)return;let stopped=false,timer:ReturnType<typeof setTimeout>;const controller=new AbortController();
 const read=async()=>{const started=performance.now();if(document.hidden){timer=setTimeout(read,1000);return}try{const response=await fetch(historyIndex!=null?'/api/session/frame?index='+historyIndex:'/api/frame'+(lastId.current?'?after='+encodeURIComponent(lastId.current):''),{signal:controller.signal});if(response.status===204)return;if(!response.ok)throw new Error('Frame unavailable; retrying');const blob=await response.blob();if(stopped)return;const next=URL.createObjectURL(blob);if(url.current)URL.revokeObjectURL(url.current);url.current=next;
 const id=response.headers.get('X-Frame-Id');if(id!==lastId.current){const now=performance.now();deliveries.current=deliveries.current.filter(t=>now-t<5000);deliveries.current.push(now);lastId.current=id;const values=deliveries.current;if(values.length>1)setPreviewFps((values.length-1)*1000/(values[values.length-1]-values[0]));}
 setLatency(Math.max(0,Date.now()-Number(response.headers.get('X-IOC-Timestamp'))*1000));
 const peak=response.headers.get('X-ROI-Peak');setFrame({url:next,id:response.headers.get('X-Frame-Id'),stamp:Number(response.headers.get('X-IOC-Timestamp')),peak:peak?Number(peak):null,bright:response.headers.get('X-LED-Bright')==='true',roi:JSON.parse(response.headers.get('X-LED-ROI')??'[300,700,550,850]'),cutoff:historyIndex!=null?Number(response.headers.get('X-LED-Cutoff')??threshold):threshold});setFailure('');}catch(error){if(!stopped)setFailure((error as Error).message)}finally{if(!stopped&&historyIndex==null)timer=setTimeout(read,Math.max(0,50-(performance.now()-started)))}};read();return()=>{stopped=true;controller.abort();clearTimeout(timer)};
 },[active,preview,historyIndex,threshold]);
 useEffect(()=>()=>{if(url.current)URL.revokeObjectURL(url.current)},[]);
 const ca=live?.status.ca,stale=frame&&Date.now()/1000-frame.stamp>3;
 const recentIntervals=(live?.metrics.camera.interval_series??[]).slice(-10);
 const recentPeriod=recentIntervals.length?recentIntervals.reduce((sum,p)=>sum+p.interval_ms,0)/recentIntervals.length:null;
 useEffect(()=>{if(!retained&&historyIndex!=null){setHistoryIndex(null);if(!active){setFrame(null);if(url.current)URL.revokeObjectURL(url.current);url.current=undefined;lastId.current=null;}}},[retained,active,historyIndex]);
 useEffect(()=>{if(historyIndex!=null&&frame?.id&&firstFrameId!=null&&Number(frame.id)<firstFrameId){setFrame(null);if(url.current)URL.revokeObjectURL(url.current);url.current=undefined;setHistoryIndex(active?null:0)}},[firstFrameId,frame?.id,active,historyIndex]);
 useEffect(()=>{if(active)setHistoryIndex(null)},[active]);
 useEffect(()=>{if(!active&&historyFrames>0&&!frame&&historyIndex==null)setHistoryIndex(historyFrames-1)},[active,historyFrames,frame,historyIndex]);
 const effectiveCutoff=frame?.cutoff??threshold;
 const bright=frame?.peak!=null&&frame.peak>effectiveCutoff;
 return <Panel title="Live camera" icon={<Camera size={16}/>}>
 <div className="camera-stage">{frame?<img src={frame.url} alt="Live LED breadboard view from camera 192.168.2.1"/>:<div className="camera-empty"><ScanLine size={24}/>{FRONTEND_ONLY?'Camera unavailable in frontend preview':active?(failure||'Waiting for camera…'):'Live is stopped'}</div>}

 {frame&&<div className="image-meta"><span><i className={'led-dot '+(bright?'bright':'')}/>{bright?'LED bright':'LED dim'}</span><span>{historyIndex!=null?'Buffered frame':stale&&active?'Camera image stale':active?'Live image':'Last live image'}</span></div>}</div>
 <div className="camera-caption"><span>CAM2 · 192.168.2.1{frame?.id?' · frame '+frame.id:''}</span><span>{active?format(recentPeriod?1000/recentPeriod:null,2)+' frames/s received':'Preview stopped'}</span></div>
 {frame&&<div className="camera-cutoff">Image peak {format(frame.peak,0)} counts · brightness cutoff {format(effectiveCutoff,0)} counts</div>}
 {historyFrames>1&&<div className="camera-history"><Label htmlFor="camera-history">Camera history</Label><input id="camera-history" type="range" min="0" max={historyFrames-1} value={historyIndex??historyFrames-1} onChange={e=>setHistoryIndex(Number(e.target.value))}/><button type="button" onClick={()=>setHistoryIndex(active?null:historyFrames-1)}>Latest</button></div>}
 <details className="image-diagnostics"><summary>Image details</summary><dl><dt>Frame ID</dt><dd>{frame?.id??'Waiting'}</dd><dt>Image age</dt><dd>{format(latency,0)} ms</dd><dt>Image peak</dt><dd>{format(frame?.peak,0)} counts</dd><dt>Browser preview</dt><dd>{format(previewFps,1)} frames/s</dd></dl></details>
 {failure&&frame&&<p className="px-5 pb-3 text-xs text-amber-700">{failure}</p>}
 </Panel>
}



export {CameraView,Help,Panel}
