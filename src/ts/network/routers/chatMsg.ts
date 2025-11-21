import { Router } from "./baseRouter";
import { ModuleLogger } from "../../utils/logger";

export const router = new Router(
    "chatMsgRouter"
)

function stripHtmlKeepTraitSpaces(html: string | null | undefined): string {
    const tmp = document.createElement('div');
    tmp.innerHTML = html ?? '';

    let result = '';
    let isInsideSpan = false;  // span 안에 있는지 추적

    // 모든 노드를 순회
    function traverse(node: Node): void {
        if (node.nodeType === Node.TEXT_NODE) {
            // 텍스트 노드면 그대로 추가
            result += node.textContent;
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;

            // span 태그 처리 (이미 span 안이 아닐 때만)
            if (element.tagName === 'SPAN' && !isInsideSpan) {
                result += '[';
                isInsideSpan = true;  // span 안으로 들어감

                // 자식 노드들 순회
                element.childNodes.forEach(child => traverse(child));

                result += '] ';
                isInsideSpan = false;  // span 밖으로 나옴
            } else {
                // span이 아니거나 이미 span 안이면 그냥 자식만 순회
                element.childNodes.forEach(child => traverse(child));
            }
        }
    }

    traverse(tmp);

    // 중복 스페이스 제거하고 trim
    return result.replace(/\s+/g, ' ').trim();
}

router.addRoute({
    actionType: "chat-logs",
    handler: async (data, context) => {
        const socketManager = context?.socketManager;
        ModuleLogger.info(`Received request for roll data`);

        const recentChat: any[] = [];
        game.messages.contents.slice(-20).forEach((message: ChatMessage) => {
            const cleanText = stripHtmlKeepTraitSpaces(message.flavor);
            if (cleanText) {
                recentChat.push(`${message.export()}\n${cleanText}`);
            } else {
                recentChat.push(message.export());
            }
        });

        socketManager?.send({
            type: "chat-logs-result",
            requestId: data.requestId,
            data: recentChat.slice(0, data.limit || 20)
        });
    }
});

router.addRoute(
    {
        actionType: "chat-message",
        handler: (data) => {
            if (data.audioPath) {
                const audioPath = data.audioPath;
                foundry.audio.AudioHelper.play({ src: audioPath, volume: 0.8, loop: false });
            }
            // const audience = [...everyoneUserIds()];
            ChatMessage.create({
                speaker: ChatMessage.getSpeaker(),
                //whisper: audience,
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
// function everyoneUserIds() { return game.users.map(u => u.id); }