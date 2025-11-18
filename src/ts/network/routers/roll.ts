import { Router } from "./baseRouter";
import { ModuleLogger } from "../../utils/logger";
import { recentRolls } from "../../constants";

export const router = new Router("rollRouter");

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
  actionType: "rolls",
  handler: async (data, context) => {
    const socketManager = context?.socketManager;
    ModuleLogger.info(`Received request for roll data`);

    const recentChat: any[] = [];
    game.messages.contents.slice(-20).forEach((message: ChatMessage) => {
      const cleanText = stripHtmlKeepTraitSpaces(message.flavor);
      if (cleanText) {
        recentChat.push(message.export(), '\n', cleanText);
      } else {
        recentChat.push(message.export());
      }
    });

    socketManager?.send({
      type: "rolls-result",
      requestId: data.requestId,
      data: recentChat.slice(0, data.limit || 20)
    });
  }
});

router.addRoute({
  actionType: "last-roll",
  handler: (data, context) => {
    const socketManager = context?.socketManager;
    ModuleLogger.info(`Received request for last roll data`);

    socketManager?.send({
      type: "last-roll-result",
      requestId: data.requestId,
      data: recentRolls.length > 0 ? recentRolls[0] : null
    });
  }
});

// router.addRoute({
//   actionType: "roll",
//   handler: async (data, context) => {
//     const socketManager = context?.socketManager;
//     try {
//       const { formula, flavor, createChatMessage, speaker, whisper, requestId } = data;

//       let rollResult;
//       let speakerData = {};
//       let rollMode = whisper && whisper.length > 0 ? CONST.DICE_ROLL_MODES.PRIVATE : CONST.DICE_ROLL_MODES.PUBLIC;

//       // Process speaker if provided
//       if (speaker) {
//         try {
//           const speakerEntity = await fromUuid(speaker);

//           if (speakerEntity) {
//             if (speakerEntity instanceof TokenDocument) {
//               speakerData = {
//                 token: speakerEntity?.id,
//                 actor: speakerEntity?.actor?.id,
//                 scene: speakerEntity?.parent?.id,
//                 alias: speakerEntity?.name || speakerEntity?.actor?.name
//               };
//             } else if (speakerEntity instanceof Actor) {
//               const activeScene = game.scenes?.active;
//               if (activeScene) {
//                 const tokens = activeScene.tokens?.filter(t => t.actor?.id === speakerEntity.id);
//                 if (tokens && tokens.length > 0) {
//                   const token = tokens[0];
//                   speakerData = {
//                     token: token.id,
//                     actor: speakerEntity.id,
//                     scene: activeScene.id,
//                     alias: token.name || speakerEntity.name
//                   };
//                 } else {
//                   speakerData = {
//                     actor: speakerEntity.id,
//                     alias: speakerEntity.name
//                   };
//                 }
//               }
//             }
//           }
//         } catch (err) {
//           ModuleLogger.warn(`Failed to process speaker: ${err}`);
//         }
//       }

//       try {
//         const roll = new Roll(formula);

//         await roll.evaluate();

//         if (createChatMessage) {
//           await roll.toMessage({
//             speaker: speakerData,
//             flavor: flavor || "",
//             rollMode,
//             whisper: whisper || []
//           });
//         }

//         rollResult = {
//           id: `manual_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
//           chatMessageCreated: !!createChatMessage,
//           roll: {
//             formula: formula,
//             total: roll.total,
//             isCritical: roll.terms.some(term => (term as DiceTerm).results?.some(result => result.result === (roll.terms[0] as DiceTerm).faces)),
//             isFumble: roll.terms.some(term => (term as DiceTerm).results?.some(result => result.result === 1)),
//             dice: roll.dice.map(d => ({
//               faces: d.faces,
//               results: d.results.map(r => ({
//                 result: r.result,
//                 active: r.active
//               }))
//             })),
//             timestamp: Date.now()
//           }
//         };
//       } catch (err) {
//         ModuleLogger.error(`Error rolling formula: ${err}`);
//         socketManager?.send({
//           type: "roll-result",
//           requestId: requestId,
//           success: false,
//           error: `Failed to roll formula: ${(err as Error).message}`
//         });
//         return;
//       }

//       socketManager?.send({
//         type: "roll-result",
//         requestId: requestId,
//         success: true,
//         data: rollResult
//       });
//     } catch (error) {
//       ModuleLogger.error(`Error in roll handler: ${error}`);
//       socketManager?.send({
//         type: "roll-result",
//         requestId: data.requestId,
//         success: false,
//         error: (error as Error).message || "Unknown error occurred during roll"
//       });
//     }
//   }
// });
