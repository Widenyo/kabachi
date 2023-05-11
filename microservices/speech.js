//@ts-check
const { parseJSONFile } = require("../utils");
const player = require("node-wav-player");
const ttsSdk = require("microsoft-cognitiveservices-speech-sdk");
const fs = require('fs')

/**
 * el string debe ser un ssml
 * @param {string} ssml
 */
class SpeechService {
  constructor({TTS_KEY, TTS_REGION, TTSConfigPath}) {
    this.TTS_KEY = TTS_KEY
    this.TTS_REGION = TTS_REGION
    this.TTSConfigPath = TTSConfigPath
  }



  /**
   * @param {string} texto
   */
  ssml(texto) {
    const { voiceName, rate, contour, pitch, volume } = parseJSONFile(this.TTSConfigPath);
    return `<speak version="1.0" xmlns="https://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="es-ES">
    <voice name="${voiceName || "es-ES-IreneNeural"}">
      <prosody volume="${volume || "default"}" rate="${
      rate || "default"
    }" contour="${contour || ""}" pitch="${pitch || "default"}">
        ${texto}
      </prosody>
    </voice>
  </speak>
  `;
  }


  /**
   * @param {string} texto
   */
  speech(texto) {
    const speechConfig = ttsSdk.SpeechConfig.fromSubscription(
      this.TTS_KEY,
      this.TTS_REGION
    );
    const audiocfg = ttsSdk.AudioConfig.fromAudioFileOutput(
      parseJSONFile(this.TTSConfigPath).outputName
    );
      // const a = new ttsSdk.SpeechRecognizer(speechConfig, audiocfg)
      // a.recognizeOnceAsync()
    const synthesizer = new ttsSdk.SpeechSynthesizer(speechConfig, audiocfg);
    return new Promise((resolve, eject) => {
      synthesizer.speakSsmlAsync(
        this.ssml(texto),
        async (result) => {
          if (
            result.reason === ttsSdk.ResultReason.SynthesizingAudioCompleted
          ) {
            console.log("Sintetizado");
            synthesizer.close();
            await player.play({ path: parseJSONFile(this.TTSConfigPath).outputName, sync: true });
            console.log("Finished playing audio.");
          } else {
            console.error(
              "Speech synthesis canceled, " +
                result.errorDetails +
                "\nDid you set the speech resource key and region values?"
            );
            synthesizer.close();
          }
          resolve(result);
          // liveChat.resetObserver();
        },
        (err) => {
          eject(err);
          console.trace("err - " + err);
          // liveChat.resetObserver();
          synthesizer.close();
        }
      );
    });
  }
}

module.exports = SpeechService;
