export type Reading = {value?: number|string; label?: string|null; error?: string; alarm?: {severity:number}; severity?:number; status?:number}
export type Status = {pva:Record<string,Reading>; ca:Record<string,Reading>; prefixes:Record<string,string>; read_utc:string|null}
export type Summary = {count:number; mean:number|null; stddev:number|null; min:number|null; max:number|null}
export type Feedback = {state:string;response_event:number;threshold:number;triggered:boolean;cycles_requested?:number;cycles_detected?:number;cycles?:{cycle:number;dark_frame:{frame_id:number;roi_peak:number};bright_frame:{frame_id:number;roi_peak:number};detection_to_write_start_ns?:number;detection_to_confirmation_ns?:number}[];reason?:string;dark_frame?:{frame_id:number;roi_peak:number};bright_frame?:{frame_id:number;roi_peak:number};detected_host_ns?:string;trigger_confirmed_host_ns?:string;host_detection_to_confirmation_ns?:number}
export type Live = {server_unix:number; status:Status; errors:string[]; pv_writes:number;
 image_stream?:{roi_peak?:number;led_bright?:boolean;source_images_received:number;preview_frames_encoded:number;preview_dropped:number;capture_started_unix:number;ioc_timestamp:number;encoded_unix:number;frame_id:number}|null;
 metrics:{window_seconds:number;offset_ns:Summary;unmatched_a:number;unmatched_b:number;drift_ns_per_s:number|null;receiver_trace?:{ip:string;event:number;sec:number;ns:number;received:number}[];requested_observed?:{state:string;reason?:string;repeat_count?:number;within_cycle_error_ns?:Record<string,Summary>;software_cycle_interval_ns?:Summary;expected_count?:number;observed_counts?:Record<string,number>;rows?:{index:number;cycle?:number;event:number;requested_relative_ns:number;observed_a_ns:number;observed_b_ns:number;error_a_ns:number;error_b_ns:number;receiver_difference_ns:number;timestamp_a?:string;timestamp_b?:string}[]};
 offset_series:{seconds:number;ns:number;offset_ns:number}[];
 event_streams?:{ip:string;event:number;count:number;interval_ns:Summary;rate_hz:number|null;last_sec:number;last_ns:number;last_received_age_s:number}[];
 receivers:{ip:string;online:boolean;last_batch_age_s:number|null;event_count:number;interval_ms:Summary;interval_ns?:Summary;rate_hz?:number|null;pps_count:number;pps_ns:Summary;backwards_total:number;fifo_overflow_flags_total:number}[];
 camera:{clock_samples:number;interval_ms:Summary;interval_series:{host:number;interval_ms:number}[];backwards:number;id_gaps:number;id_repeats_or_reversals:number;last_id:number|null;id_samples:number;last_sample_age_s:number|null;disconnects_total:number;connected:Record<string,boolean>};
 led_samples:{frame_id:number;roi_peak:number|null;host:number;led_bright:boolean|null}[]};
 observation: {feedback?:Feedback;configuration_snapshot?:{id?:number|string;kind?:string};id:string;state:string;remaining_seconds?:number;duration_seconds:number;save_images?:boolean;image_storage?:{state:string;frames_saved:number;queue_overruns:number;bytes_saved:number;error?:string};results?:Live['metrics']}|null}
export type Plan={feedback?:{threshold:number;response_event:number;cycles?:number};initialization_note?:string;id:string;plan_id?:string;state:string;blocked_reason?:string;kind:string;commands:string[];restore_commands:string[];restore_target?:'default'|'plan_baseline';disarm_commands?:string[];trigger_commands?:string[];checks:string[];quantized:Record<string,number|string>;rows?:{event:number;delay_ns:number}[]}
export type ConfigurationFields={threshold:string;responseGap:string;rate:string;delay:string;width:string;dg:string;pair:string;dgDelay:string;dgWidth:string;rows:{event:string;delay_ns:string}[];stop:string}
export type Configuration={id:number;name:string;kind:'sequence'|'led'|'led-feedback';values:Record<string,any>;revision:number;updated_utc?:string}
export type Baseline={captured_utc:string;immutable:boolean;snapshot:Record<string,any>}
export type ConfigurationsResponse={baseline:Baseline|null;configurations:Configuration[];capabilities?:Record<string,unknown>}
export type ActionResult={state:string;blocked_reason?:string;plan_id?:string;message?:string;[key:string]:unknown}
// This checkout contains the UI only. It cannot connect to or control the rack.
export const FRONTEND_ONLY = true
export async function api<T>(_path:string,_body?:unknown,_signal?:AbortSignal):Promise<T>{
 throw new Error('Unavailable in frontend preview: no timing backend is included.')
}
export function numeric(data:Record<string,Reading>|undefined,key:string){const item=data?.[key];return item&&item.error===undefined&&typeof item.value==='number'?item.value:undefined}
export function text(data:Record<string,Reading>|undefined,key:string){const item=data?.[key];if(!item||item.error!==undefined)return 'Unavailable';return String(item.label??item.value??'Unavailable')}
export function format(value:number|null|undefined,digits=3){return value==null||!Number.isFinite(value)?'—':new Intl.NumberFormat('en-US',{maximumFractionDigits:digits}).format(value)}
