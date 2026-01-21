export function estimateLatency(sentTs, receivedTs) {
    return Math.max(0, Math.floor((receivedTs - sentTs) / 2))
    }