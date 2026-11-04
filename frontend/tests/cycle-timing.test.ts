import {test} from 'node:test'
import assert from 'node:assert/strict'
import {cycleTiming,gap,difference,RECEIVERS,type ReceiverEvent} from '../src/cycle-timing.ts'
const e=(ip:string,event:number,sec:number,ns:number):ReceiverEvent=>({ip,event,sec,ns})
const pair=(ip:string,sec:number,ns:number,delta=8)=>[e(ip,42,sec,ns),e(ip,43,sec+Math.floor((ns+delta)/1e9),(ns+delta)%1e9)]
test('preserves an 8 ns gap at large POSIX seconds and ignores input ordering',()=>{
 const rows=[...pair(RECEIVERS[0],1793775280,966016992),...pair(RECEIVERS[1],1793775280,966016992)].reverse()
 const r=cycleTiming(rows);assert.equal(r.matched,1);assert.equal(gap(r.cycles[0].a),8);assert.equal(gap(r.cycles[0].b),8)
})
test('uses one common origin so the second receiver offset remains visible',()=>{
 const r=cycleTiming([...pair(RECEIVERS[0],1793775280,100),...pair(RECEIVERS[1],1793775280,116)])
 assert.equal(r.matched,1);assert.equal(difference(r.cycles[0].a?.first,r.cycles[0].b?.first),16)
})
test('pairs across PPS rollover using full timestamps',()=>{
 const r=cycleTiming([...pair(RECEIVERS[0],1793775280,999999996),...pair(RECEIVERS[1],1793775280,999999996)])
 assert.equal(r.matched,1);assert.equal(gap(r.cycles[0].a),8)
})
test('does not invent missing receptions or reuse a later cycle',()=>{
 const rows=[...pair(RECEIVERS[0],10,100),e(RECEIVERS[1],42,10,100),...pair(RECEIVERS[0],11,100),...pair(RECEIVERS[1],11,100)]
 const r=cycleTiming(rows);assert.equal(r.matched,1);assert.equal(r.incomplete,1);assert.equal(gap(r.cycles[0].b),null)
})
test('deduplicates repeated monitor batches',()=>{
 const rows=[...pair(RECEIVERS[0],10,100),...pair(RECEIVERS[1],10,100)];assert.equal(cycleTiming([...rows,...rows]).matched,1)
})
test('leaves ambiguous cross-receiver candidates unmatched',()=>{
 const r=cycleTiming([...pair(RECEIVERS[0],10,100),...pair(RECEIVERS[0],10,500),...pair(RECEIVERS[1],10,100)])
 assert.equal(r.matched,0);assert.equal(r.cycles.length,3)
})
test('reports invalid timestamps and unpaired event 43',()=>{
 const r=cycleTiming([e(RECEIVERS[0],42,10,1e9),e(RECEIVERS[0],43,10,40)])
 assert.equal(r.invalid,1);assert.equal(r.orphans,1);assert.equal(r.cycles.length,0)
})
