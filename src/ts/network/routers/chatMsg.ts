import { Router } from "./baseRouter";
import { ModuleLogger } from "../../utils/logger";

export const router = new Router(
    "chatMsgRouter"
)

router.addRoute(
    {
        actionType: "chat-message",
        handler: (data) => {
            // const user = gmUserIds();
            if (data.audioPath) {
                const audioPath = data.audioPath;
                foundry.audio.AudioHelper.play({ src: audioPath, volume: 0.8, loop: false });
            }
            const audience = [...everyoneUserIds()];
            ChatMessage.create({
                speaker: ChatMessage.getSpeaker(),
                whisper: audience,
                content: data.message,
            });
            ModuleLogger.info(`Received chat-message`);
        }
    }
)

router.addRoute(
    {
        actionType: "chat-narrator",
        handler: (data) => {
            ChatMessage.create(data);
            ModuleLogger.info(`Received chat-narrator`);
        }
    }
)

// function gmUserIds() { return game.users.filter(u => u.isGM).map(u => u.id); }
function everyoneUserIds() { return game.users.map(u => u.id); }