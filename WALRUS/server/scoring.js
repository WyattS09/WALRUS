export function scoreAnswer({ startTs, receivedTs, latency, duration }) {
    const maxPoints = 1000
    const p = 1.3
    
    
    const t = (receivedTs - startTs) - latency
    const ratio = Math.max(0, Math.min(1, 1 - t / duration))
    
    
    return Math.round(maxPoints * Math.pow(ratio, p))
    }