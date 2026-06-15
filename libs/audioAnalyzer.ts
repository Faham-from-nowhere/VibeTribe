export const analyzeBPM = async (file: File): Promise<number> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const audioData = e.target?.result as ArrayBuffer;
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        const audioCtx = new AudioContext();
        
        const audioBuffer = await audioCtx.decodeAudioData(audioData);
        
        // Simple peak detection for BPM
        const channelData = audioBuffer.getChannelData(0);
        const peaks = getPeaksAtThreshold(channelData, 0.8);
        const intervals = countIntervalsBetweenAdjacentPeaks(peaks, audioBuffer.sampleRate);
        const tempo = groupNeighborsByTempo(intervals);
        
        resolve(tempo);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};

function getPeaksAtThreshold(data: Float32Array, threshold: number) {
  const peaksArray = [];
  const length = data.length;
  for (let i = 0; i < length;) {
    if (data[i] > threshold) {
      peaksArray.push(i);
      // Skip forward ~1/4s to get past this peak.
      i += 10000;
    }
    i++;
  }
  return peaksArray;
}

function countIntervalsBetweenAdjacentPeaks(peaks: number[], sampleRate: number) {
  const intervalCounts: { [key: number]: number } = {};
  peaks.forEach((peak, index) => {
    for (let i = 1; i < 10; i++) {
      const interval = peaks[index + i] - peak;
      if (isNaN(interval)) break;
      const tempo = Math.round(60 / (interval / sampleRate));
      
      // Filter reasonable tempos
      if (tempo >= 60 && tempo <= 180) {
        intervalCounts[tempo] = (intervalCounts[tempo] || 0) + 1;
      }
    }
  });
  return intervalCounts;
}

function groupNeighborsByTempo(intervalCounts: { [key: number]: number }) {
  let maxTempo = 0;
  let maxCount = 0;

  Object.keys(intervalCounts).forEach((tempoStr) => {
    const tempo = parseInt(tempoStr);
    const count = intervalCounts[tempo];
    if (count > maxCount) {
      maxCount = count;
      maxTempo = tempo;
    }
  });

  return maxTempo || 120; // Default to 120 if undetectable
}
