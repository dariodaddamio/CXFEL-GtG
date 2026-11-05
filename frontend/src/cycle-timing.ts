/** Pair receiver hardware timestamps. Host receipt times are deliberately absent. */
export type ReceiverEvent={ip:string;event:number;sec:number;ns:number}
export type Pair={first:bigint;second?:bigint}
export type Cycle={id:string;a?:Pair;b?:Pair}
export const RECEIVERS=['10.139.5.195','10.139.5.198'] as const
export const hardwareStamp=(r:ReceiverEvent)=>BigInt(r.sec)*1_000_000_000n+BigInt(r.ns)
export const gap=(p?:Pair)=>p?.second===undefined?null:Number(p.second-p.first)
export const difference=(a?:bigint,b?:bigint)=>a===undefined||b===undefined?null:Number(b-a)
export function cycleTiming(events:ReceiverEvent[],windowNs=1_000_000n){
 const seen=new Set<string>();let invalid=0,orphans=0
 const pairs:Pair[][]=RECEIVERS.map(ip=>{
  const rows=events.filter(r=>r.ip===ip&&(r.event===42||r.event===43)).filter(r=>{
   if(!Number.isSafeInteger(r.sec)||!Number.isInteger(r.ns)||r.ns<0||r.ns>=1e9){invalid++;return false}
   const key=[r.ip,r.event,r.sec,r.ns].join(':');if(seen.has(key))return false;seen.add(key);return true
  }).sort((a,b)=>{const x=hardwareStamp(a),y=hardwareStamp(b);return x<y?-1:x>y?1:a.event-b.event})
  const result:Pair[]=[];let pending:Pair|undefined
  for(const r of rows){const t=hardwareStamp(r)
   if(r.event===42){if(pending)result.push(pending);pending={first:t}}
   else if(pending){pending.second=t;result.push(pending);pending=undefined}
   else orphans++
  }
  if(pending)result.push(pending);return result
 })
 // Sorted sliding windows count candidates without allocating an N x M matrix.
 const uniqueCandidates=(left:Pair[],right:Pair[])=>{
  let start=0,end=0
  return left.map(p=>{
   while(start<right.length&&right[start].first<p.first-windowNs)start++
   end=Math.max(start,end)
   while(end<right.length&&right[end].first<=p.first+windowNs)end++
   return end-start===1?start:undefined
  })
 }
 const ab=uniqueCandidates(pairs[0],pairs[1]),ba=uniqueCandidates(pairs[1],pairs[0])
 const used=new Set<number>();const cycles:Cycle[]=pairs[0].map((a,i)=>{
  const j=ab[i]
  const b=j!==undefined&&ba[j]===i?pairs[1][j]:undefined
  if(b&&j!==undefined)used.add(j)
  return {id:'a:'+a.first,a,b}
 })
 pairs[1].forEach((b,j)=>{if(!used.has(j))cycles.push({id:'b:'+b.first,b})})
 cycles.sort((a,b)=>{const x=a.a?.first??a.b!.first,y=b.a?.first??b.b!.first;return x<y?-1:x>y?1:0})
 const matched=cycles.filter(c=>c.a?.second!==undefined&&c.b?.second!==undefined).length
 return {cycles,matched,incomplete:cycles.length-matched,orphans,invalid,windowNs:Number(windowNs)}
}
