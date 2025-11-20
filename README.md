# Foundry MCP Module
ThreeHats의 Foundry REST API 모듈을 기반으로, MCP/relay 서버와 Foundry VTT 사이의 WebSocket 통신을 강화하고 챗 로그/음성 전송 기능을 추가한 포크입니다.

## 주요 기능
- Foundry 데이터를 WebSocket relay(기본: `wss://foundryvtt-rest-api-relay.fly.dev/`)로 노출하여 외부 서비스가 조회·조작 가능
- `chat-logs`: 최근 채팅 20개를 HTML 정제 후 flavor 정보까지 포함해 전달
- `chat-message`: 외부에서 받은 메시지를 전체 귓속말로 뿌리고, `audioPath` 지정 시 클라이언트에서 바로 재생
- `chat-narrator`: 내레이터 스타일의 시스템 메시지 생성
- 설정 화면에서 API Key를 숨김 입력으로 처리하고, 클라이언트/월드 정보를 한 번에 복사할 수 있는 대화상자 제공

## 설치
1) Foundry VTT → **Add-on Modules** → **Install Module** → 매니페스트 URL 입력  
`https://github.com/darkbard81/fvtt-mcp-module/releases/latest/download/module.json`  
2) 모듈 활성화 후 월드를 다시 불러옵니다.  
직접 호스팅할 경우, Foundry가 접근 가능한 위치에 `module.json`과 빌드 산출물을 배치하고 그 URL을 매니페스트로 사용하면 됩니다.

## 설정
**Game Settings → Configure Settings → Module Settings → Foundry MCP Module**
- **WebSocket Relay URL**: 연결할 relay(WebSocket) 주소. 기본값은 공식 퍼블릭 릴레이.
- **API Key**: 릴레이 인증에 사용. self-host 시 릴레이에서 발급한 키나 원하는 값으로 교체 권장.
- **Custom Client Name**: 여러 인스턴스를 구분할 때 표시용 이름.
- **Log Level**: `debug / info / warn / error` (기본 warn).
- **Ping Interval (seconds)**: 릴레이로 keep-alive 핑을 보내는 주기. 기본 30초.
- **Max Reconnect Attempts**: 연결 끊김 시 재시도 횟수. 기본 20회.
- **Reconnect Base Delay (ms)**: 재연결 백오프 시작 지연. 기본 1000ms.

설정 변경 후에는 요청에 따라 월드 리로드가 필요할 수 있습니다(API Key, Relay URL 등).

## 사용 예시
- 릴레이(fvtt-mcp 등)에서 `chat-logs` 액션을 보내면 최근 채팅 로그를 `chat-logs-result`로 돌려줍니다.
- `chat-message` 액션으로 `{ message, audioPath? }`를 보내면 플레이어 전원에게 귓속말 메시지를 전송하고 `audioPath`가 있을 경우 즉시 재생합니다.
- `chat-narrator` 액션은 내레이터 메시지를 그대로 렌더링합니다.
- 모듈 API(`game.modules.get("fvtt-mcp-module").api`)로 WebSocket 매니저 접근, QuickInsert 검색, UUID 조회 기능을 다른 매크로나 모듈에서 재사용할 수 있습니다.

## 호환성
- Foundry VTT 13.x에서 검증됨(`system`: 디폴트 설정 자동 적용).

## 라이선스·크레딧
- MIT License
- 기반: [ThreeHats/foundryvtt-rest-api](https://github.com/ThreeHats/foundryvtt-rest-api) · [ThreeHats/foundryvtt-rest-api-relay](https://github.com/ThreeHats/foundryvtt-rest-api-relay)
- 포크/추가 작업: [darkbard81](https://github.com/darkbard81)
