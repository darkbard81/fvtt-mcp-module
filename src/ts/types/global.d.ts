declare global {
    const game: ReadyGame = game;
    declare const canvas: foundry.canvas.Canvas;
    declare const ui: foundry.applications.ui;
}

export { };

// declare module "../module.json" {
//     export const id: "fvtt-mcp-module";
// }

// Hooks.on("closeWebSocketConnections", () => {
//   const XYZGame: SetupGame = game;
//   XYZGame.messages.contents.slice(-20).forEach((message: ChatMessage) => {
//     const cleanText = stripHtmlKeepTraitSpaces(message.flavor);
//     if (cleanText) {
//       console.log(message.export(), '\n', cleanText);
//     } else {
//       console.log(message.export());
//     }
//   });
// });

// function stripHtmlKeepTraitSpaces(html: string | null | undefined): string {
//   const tmp = document.createElement('div');
//   tmp.innerHTML = html ?? '';

//   let result = '';
//   let isInsideSpan = false;  // span 안에 있는지 추적

//   // 모든 노드를 순회
//   function traverse(node: Node): void {
//     if (node.nodeType === Node.TEXT_NODE) {
//       // 텍스트 노드면 그대로 추가
//       result += node.textContent;
//     } else if (node.nodeType === Node.ELEMENT_NODE) {
//       const element = node as Element;

//       // span 태그 처리 (이미 span 안이 아닐 때만)
//       if (element.tagName === 'SPAN' && !isInsideSpan) {
//         result += '[';
//         isInsideSpan = true;  // span 안으로 들어감

//         // 자식 노드들 순회
//         element.childNodes.forEach(child => traverse(child));

//         result += '] ';
//         isInsideSpan = false;  // span 밖으로 나옴
//       } else {
//         // span이 아니거나 이미 span 안이면 그냥 자식만 순회
//         element.childNodes.forEach(child => traverse(child));
//       }
//     }
//   }

//   traverse(tmp);

//   // 중복 스페이스 제거하고 trim
//   return result.replace(/\s+/g, ' ').trim();
// }
