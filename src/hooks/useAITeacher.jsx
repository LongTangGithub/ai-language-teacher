
import { teachers } from "@/app/components/Teacher";
const { create } = require("zustand");

const useAITeacher = create((set, get) => ({
    messages: [],
    currentMessage: null,
    teacher: teachers[0],
    setTeacher: (teacher) => set({
        teacher
    }),

    classroom: "default",
    setClassroom: (classroom) => {
        set(() => ({
            classroom,
        }))
    },
    furigana: true,
    setFurigana: (furigana) => {
        set(() => ({
            furigana,
        }));
    },
    english: true,
    setEnglish: (english) => {
        set(() => ({
            english,
        }));
    },
    speech: "formal",
    setSpeech: (speech) => {
      set(() => ({
        speech,
      }));
    },

    /**
     * API call
     * If there's no question, we won't fetch the api call 
     */
    loading: false,
    askAI: async (question) =>{
        if(!question){
            return;
        }
        const message = {
            question,
            id: get().messages.length,
        };
        set(() => ({
            loading: true,
        }));

        const speech = get().speech;

        // Ask AI
        const res = await fetch(`/api/ai?question=${question}&speech=${speech}`);
        const data = await res.json();
        message.answer = data;
        message.speech = speech;

        set((state) => ({
            messages: [...state.messages, message],
            loading: falsem
        })),
        get().playMessage(message);
    },
    playMessage: async (message) => {
        set(() => ({
            currentMessage: message,
        }));

        if(!message.audioPlayer){
            set(() => ({
                loading: true,
            }));
            // Get TTS route with the current teacher
            const audioRes = await fetch(
                `/api/tts?teacher=${get().teacher}&text=${message.answer.japanese
                    .map((word) => word.word)
                    .join(" ")}`
            );
            // Getting audio from response
            const audio = await audioRes.blob();
            const visemes = JSON.parse(await audioRes.headers.get("visemes"));
            const audioUrl = URL.createObjectURL(audio);
            const audioPlayer = new Audio(audioUrl);

            message.visemes = visemes;
            message.audioPlayer = audioPlayer;
            // when it finishes playing the audio, the teacher will not be speaking
            message.audioPlayer.onended = () => {
                set(() => ({
                    currentMessage: null,
                }));
            };

            set(() => ({
                loading: false,
                messages: get().messages.map((m) => {
                    if (m.id === message.id) {
                        return message;
                    }
                    return m;
                }),
            }));
        }

        message.audioPlayer.currentTime = 0;
        message.audioPlayer.play();
    },
    stopMessage: (message) => {
        message.audioPlayer.pause();
        set(() => ({
            currentMessage: null,
        }));
    },
}));