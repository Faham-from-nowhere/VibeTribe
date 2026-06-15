// Removed polyfill that caused env.js crash

let pipeline: any = null;
let env: any = null;



class PipelineSingleton {
  static task = "automatic-speech-recognition";
  static model = "Xenova/whisper-tiny.en";
  static instance: any = null;

  static async getInstance(progress_callback: Function) {
    if (!pipeline) {
      const transformers = await import("@xenova/transformers");
      pipeline = transformers.pipeline;
      env = transformers.env;
      env.allowLocalModels = false;
    }
    
    if (this.instance === null) {
      this.instance = pipeline(this.task as any, this.model, { progress_callback });
    }
    return this.instance;
  }
}

self.addEventListener("message", async (event) => {
  if (event.data.type === "load") {
    // Pre-load the model
    await PipelineSingleton.getInstance((x: any) => {
      self.postMessage(x);
    });
    self.postMessage({ status: "ready" });
  } else if (event.data.type === "transcribe") {
    const transcriber = await PipelineSingleton.getInstance((x: any) => {
      self.postMessage(x);
    });

    const output = await transcriber(event.data.audio, {
      chunk_length_s: 30,
      stride_length_s: 5,
      return_timestamps: true,
    });

    self.postMessage({
      status: "complete",
      output,
    });
  }
});
