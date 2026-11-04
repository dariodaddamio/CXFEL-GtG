import diagram from './experiment-path.svg?raw'
export default function ExperimentPath({interval}:{interval:number}){return <div className="experiment-path" dangerouslySetInnerHTML={{__html:diagram.replace('{INTERVAL}',Number.isFinite(interval)?interval.toLocaleString():'—')}}/>}
