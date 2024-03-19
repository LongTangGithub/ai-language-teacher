import * as sdk from "microsoft-cognitiveservices-speech-sdk";
import { PassThrough } from "stream";

export async function GET(req) {

    const speechConfig = sdk.SpeechConfig.fromSubscription(
        process.env["SPEECH_KEY"],
        process.env["SPEECH_REGION"]
    );

    const teacher = req.nextUrl.searchParams.get("teacher") || "Nanami";
    speechConfig.speechSynthesisVoiceName = `ja-JP-${teacher}Neural`;

    const speechSynthesizer = new sdk.SpeechSynthesizer(speechConfig);

    // Getting facial position with viseme 
    const visemes = [];
    speechSynthesizer.visemeReceived = function (s, e) {
        // console.log(
        //   "(Viseme), Audio offset: " +
        //     e.audioOffset / 10000 +
        //     "ms. Viseme ID: " +
        //     e.visemeId
        // );
        visemes.push([e.audioOffset / 10000, e.visemeId]);
    };

    const audioStream = await new Promise((resolve, reject) => {
        speechSynthesizer.speakTextAsync(
            req.nextUrl.searchParams.get("text") ||
            "I'm excited to try text to speech",
            (result) => {
                const { audioData } = result;

                speechSynthesizer.close();

                // convert arrayBuffer to stream
                const bufferStream = new PassThrough();
                bufferStream.end(Buffer.from(audioData));
                resolve(bufferStream);
            },
            (error) => {
                console.log(error);
                speechSynthesizer.close();
                reject(error);
            }
        );
    });

    const response = new Response(audioStream, {
        headers: {
            "Content-Type": "audio/mpeg",
            "Content-Disposition": `inline; filename=tts.mp3`,
            Visemes: JSON.stringify(visemes),
        },
    });
    return response;
};
