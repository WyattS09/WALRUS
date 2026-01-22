export function scoreAnswer({ startTs, receivedTs, latency, duration }) {
    const maxPoints = 100
    const p = 0.8
    
    
    const t = (receivedTs - startTs) - latency
    const ratio = Math.max(0, Math.min(1, 1 - t / duration))
    
    
    return Math.round(maxPoints * Math.pow(ratio, p))
    }