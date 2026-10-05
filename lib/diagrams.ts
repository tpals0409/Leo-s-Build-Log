import type { Locale } from './i18n';

// 프로젝트 아키텍처·사용자 시나리오 그림의 데이터 (FlowDiagram이 그린다).
// 포트폴리오(포폴 자료 canvas/*Arch·*Scenario.dc.html)의 좌표를 그대로 옮긴 것 — 좌표계는 w×h(1296×760) 안의 px.
// 노드 종류: user(흰 상자) sys(회색 상자) key(강조) db(저장소, 알약) ext(외부, 점선) term(시작·끝, 진한 알약) dec(판단, 마름모)
type T = Record<Locale, string>;
export type DiagramNode = { kind: 'user' | 'sys' | 'key' | 'db' | 'ext' | 'term' | 'dec'; x: number; y: number; w: number; h: number; title: T; sub?: T };
export type Diagram = { w: number; h: number; lanes: { y: number; label: T }[]; nodes: DiagramNode[]; edges: { d: string; dashed?: boolean }[]; labels: { x: number; y: number; text: T }[] };

export const DIAGRAMS = {
  'algosu-arch': {
    w: 1296, h: 760,
    lanes: [
      { y: 20, label: { ko: '클라이언트', en: 'Client' } },
      { y: 170, label: { ko: '엣지', en: 'Edge' } },
      { y: 320, label: { ko: '서비스', en: 'Services' } },
      { y: 470, label: { ko: '데이터 · 큐', en: 'Data · queue' } },
      { y: 620, label: { ko: '워커 · 외부', en: 'Workers · external' } },
    ],
    nodes: [
      { kind: 'user', x: 444, y: 50, w: 190, h: 64, title: { ko: 'Frontend', en: 'Frontend' }, sub: { ko: 'Next.js · Monaco Editor', en: 'Next.js · Monaco Editor' } },
      { kind: 'key', x: 444, y: 200, w: 190, h: 64, title: { ko: 'Gateway', en: 'Gateway' }, sub: { ko: '인증 · API 진입점 · SSE', en: 'Auth · API entry · SSE' } },
      { kind: 'db', x: 0, y: 200, w: 190, h: 64, title: { ko: 'Redis', en: 'Redis' }, sub: { ko: '상태 이벤트', en: 'status event' } },
      { kind: 'sys', x: 222, y: 350, w: 190, h: 64, title: { ko: 'Identity', en: 'Identity' }, sub: { ko: '사용자 · 스터디', en: 'Users · studies' } },
      { kind: 'sys', x: 444, y: 350, w: 190, h: 64, title: { ko: 'Problem', en: 'Problem' }, sub: { ko: '문제 · 마감', en: 'Problems · deadlines' } },
      { kind: 'key', x: 666, y: 350, w: 190, h: 64, title: { ko: 'Submission', en: 'Submission' }, sub: { ko: 'Saga Orchestrator', en: 'Saga Orchestrator' } },
      { kind: 'db', x: 222, y: 500, w: 190, h: 64, title: { ko: 'Identity DB', en: 'Identity DB' } },
      { kind: 'db', x: 444, y: 500, w: 190, h: 64, title: { ko: 'Problem DB', en: 'Problem DB' } },
      { kind: 'db', x: 666, y: 500, w: 190, h: 64, title: { ko: 'Submission DB', en: 'Submission DB' } },
      { kind: 'key', x: 888, y: 500, w: 190, h: 64, title: { ko: 'RabbitMQ', en: 'RabbitMQ' }, sub: { ko: '작업 큐 · DLQ(실패 보관)', en: 'Job queue · DLQ (failures)' } },
      { kind: 'ext', x: 1106, y: 500, w: 190, h: 64, title: { ko: 'Claude API', en: 'Claude API' } },
      { kind: 'ext', x: 666, y: 650, w: 190, h: 64, title: { ko: 'GitHub App', en: 'GitHub App' } },
      { kind: 'sys', x: 888, y: 650, w: 190, h: 64, title: { ko: 'GitHub Worker', en: 'GitHub Worker' }, sub: { ko: '커밋 저장', en: 'Commits code' } },
      { kind: 'sys', x: 1106, y: 650, w: 190, h: 64, title: { ko: 'AI Analysis', en: 'AI Analysis' }, sub: { ko: 'FastAPI', en: 'FastAPI' } },
    ],
    edges: [
      { d: 'M539,114 L539,200' },
      { d: 'M444,215 L414,215 L414,82 L444,82', dashed: true },
      { d: 'M539,264 L539,304 L317,304 L317,350' },
      { d: 'M539,264 L539,350' },
      { d: 'M539,264 L539,304 L761,304 L761,350' },
      { d: 'M317,414 L317,500' },
      { d: 'M539,414 L539,500' },
      { d: 'M761,414 L761,500' },
      { d: 'M856,382 L876,382 L983,382 L983,500' },
      { d: 'M983,564 L983,650' },
      { d: 'M1040,564 L1040,607 L1170,607 L1170,650' },
      { d: 'M888,682 L856,682' },
      { d: 'M1201,650 L1201,564' },
      { d: 'M666,382 L636,382 L636,284 L95,284 L95,264', dashed: true },
      { d: 'M190,232 L444,232', dashed: true },
    ],
    labels: [
      { x: 539, y: 161, text: { ko: 'REST', en: 'REST' } },
      { x: 414, y: 161, text: { ko: 'SSE 상태 알림', en: 'SSE status' } },
      { x: 983, y: 445, text: { ko: '발행', en: 'publish' } },
      { x: 428, y: 288, text: { ko: '상태 이벤트', en: 'status event' } },
      { x: 317, y: 236, text: { ko: '구독', en: 'subscribe' } },
    ],
  },
  'algosu-scenario': {
    w: 1296, h: 760,
    lanes: [
      { y: 40, label: { ko: '사용자', en: 'User' } },
      { y: 270, label: { ko: '시스템', en: 'System' } },
      { y: 510, label: { ko: '실패 경로', en: 'Failure path' } },
    ],
    nodes: [
      { kind: 'term', x: 0, y: 70, w: 120, h: 56, title: { ko: '스터디원', en: 'Member' } },
      { kind: 'user', x: 170, y: 70, w: 190, h: 72, title: { ko: '문제 선택', en: 'Pick a problem' }, sub: { ko: '주차별 문제 · 마감', en: 'Weekly problems · due' } },
      { kind: 'user', x: 410, y: 70, w: 190, h: 72, title: { ko: '코드 제출', en: 'Submit code' }, sub: { ko: '에디터에서 작성', en: 'Write in the editor' } },
      { kind: 'user', x: 650, y: 70, w: 210, h: 72, title: { ko: '진행 상태 확인', en: 'Watch progress' }, sub: { ko: '저장 → 기록 → 분석 (SSE)', en: 'Save → commit → review (SSE)' } },
      { kind: 'user', x: 910, y: 70, w: 190, h: 72, title: { ko: 'AI 피드백 확인', en: 'AI feedback' }, sub: { ko: '점수 · 항목별 리뷰', en: 'Score · review' } },
      { kind: 'term', x: 1150, y: 70, w: 146, h: 56, title: { ko: '대시보드', en: 'Dashboard' } },
      { kind: 'sys', x: 410, y: 300, w: 190, h: 72, title: { ko: '제출 저장', en: 'Save submission' }, sub: { ko: 'Submission DB · Saga 시작', en: 'Submission DB · start saga' } },
      { kind: 'key', x: 650, y: 300, w: 210, h: 72, title: { ko: 'RabbitMQ 발행', en: 'Publish to RabbitMQ' }, sub: { ko: 'GitHub · AI 작업 분리', en: 'GitHub and AI jobs split' } },
      { kind: 'sys', x: 910, y: 300, w: 190, h: 72, title: { ko: 'GitHub Worker', en: 'GitHub Worker' }, sub: { ko: '저장소 커밋', en: 'Commit to repo' } },
      { kind: 'sys', x: 1150, y: 300, w: 146, h: 72, title: { ko: 'AI Analysis', en: 'AI Analysis' }, sub: { ko: 'Claude API', en: 'Claude API' } },
      { kind: 'dec', x: 710, y: 540, w: 90, h: 90, title: { ko: '단계 실패?', en: 'Step failed?' } },
      { kind: 'sys', x: 910, y: 549, w: 190, h: 72, title: { ko: 'DLQ 보존 · 재시도', en: 'Keep in DLQ · retry' }, sub: { ko: '상태 “실패” 기록', en: 'Status set to failed' } },
      { kind: 'sys', x: 410, y: 549, w: 190, h: 72, title: { ko: '미완료 Saga 재개', en: 'Resume saga' }, sub: { ko: '재시작 시 자동', en: 'Automatic on restart' } },
    ],
    edges: [
      { d: 'M120,98 L170,98' },
      { d: 'M360,106 L410,106' },
      { d: 'M600,106 L650,106' },
      { d: 'M860,106 L910,106' },
      { d: 'M1100,106 L1150,106' },
      { d: 'M505,142 L505,300' },
      { d: 'M600,336 L650,336' },
      { d: 'M860,336 L910,336' },
      { d: 'M1100,336 L1150,336' },
      { d: 'M1223,300 L1223,205 L1005,205 L1005,146', dashed: true },
      { d: 'M755,372 L755,521' },
      { d: 'M818,585 L910,585' },
      { d: 'M1005,621 L1005,660 L505,660 L505,621', dashed: true },
      { d: 'M505,549 L505,372' },
    ],
    labels: [
      { x: 1114, y: 209, text: { ko: '상태 이벤트 · SSE', en: 'status event · SSE' } },
      { x: 870, y: 589, text: { ko: '예', en: 'yes' } },
      { x: 755, y: 664, text: { ko: '재시작', en: 'restart' } },
    ],
  },
  'pinlog-arch': {
    w: 1296, h: 760,
    lanes: [
      { y: 20, label: { ko: '서비스', en: 'Services' } },
      { y: 170, label: { ko: '플랫폼', en: 'Platform' } },
      { y: 320, label: { ko: '배포', en: 'Delivery' } },
      { y: 470, label: { ko: '관측 · 알림', en: 'Observe · alert' } },
      { y: 620, label: { ko: '로그', en: 'Logs' } },
    ],
    nodes: [
      { kind: 'sys', x: 222, y: 50, w: 190, h: 64, title: { ko: 'Frontend', en: 'Frontend' } },
      { kind: 'sys', x: 444, y: 50, w: 190, h: 64, title: { ko: 'Backend', en: 'Backend' } },
      { kind: 'sys', x: 666, y: 50, w: 190, h: 64, title: { ko: 'AI Service', en: 'AI Service' } },
      { kind: 'key', x: 444, y: 200, w: 190, h: 64, title: { ko: 'k3s', en: 'k3s' }, sub: { ko: '단일 VM · 4 vCPU · 15GiB', en: '1 VM · 4 vCPU · 15 GiB' } },
      { kind: 'sys', x: 666, y: 200, w: 190, h: 64, title: { ko: 'containerd', en: 'containerd' }, sub: { ko: '내장 런타임', en: 'Built-in runtime' } },
      { kind: 'sys', x: 222, y: 200, w: 190, h: 64, title: { ko: 'Helm · ApplicationSet', en: 'Helm · ApplicationSet' }, sub: { ko: '설정 파일 → 배포 단위', en: 'Config → deploy unit' } },
      { kind: 'sys', x: 0, y: 350, w: 190, h: 64, title: { ko: 'GitHub Actions', en: 'GitHub Actions' }, sub: { ko: '빌드 · SHA·digest 고정', en: 'Build · pin SHA' } },
      { kind: 'sys', x: 222, y: 350, w: 190, h: 64, title: { ko: '인프라 저장소 PR', en: 'Infra repo PR' }, sub: { ko: '필수 검사', en: 'Required checks' } },
      { kind: 'key', x: 444, y: 350, w: 190, h: 64, title: { ko: 'Argo CD', en: 'Argo CD' }, sub: { ko: 'GitOps 동기화', en: 'GitOps sync' } },
      { kind: 'sys', x: 0, y: 500, w: 190, h: 64, title: { ko: 'Prometheus', en: 'Prometheus' }, sub: { ko: '메트릭', en: 'Metrics' } },
      { kind: 'sys', x: 222, y: 500, w: 190, h: 64, title: { ko: 'Alertmanager', en: 'Alertmanager' }, sub: { ko: '알림', en: 'Alerts' } },
      { kind: 'sys', x: 0, y: 650, w: 190, h: 64, title: { ko: 'Loki', en: 'Loki' }, sub: { ko: '로그', en: 'Logs' } },
      { kind: 'sys', x: 444, y: 500, w: 190, h: 64, title: { ko: 'Sentinel', en: 'Sentinel' }, sub: { ko: 'LLM 요약', en: 'LLM summary' } },
      { kind: 'sys', x: 666, y: 500, w: 190, h: 64, title: { ko: 'Mattermost', en: 'Mattermost' }, sub: { ko: '팀 채널', en: 'Team channel' } },
      { kind: 'key', x: 888, y: 500, w: 190, h: 64, title: { ko: '사람', en: 'Person' }, sub: { ko: '변경 · 복구 결정', en: 'Decides fixes' } },
      { kind: 'ext', x: 888, y: 200, w: 190, h: 64, title: { ko: '단일 VM (Linux)', en: 'Single VM (Linux)' } },
    ],
    edges: [
      { d: 'M317,114 L317,154 L539,154 L539,200' },
      { d: 'M539,114 L539,200' },
      { d: 'M761,114 L761,154 L539,154 L539,200' },
      { d: 'M634,232 L666,232' },
      { d: 'M856,232 L888,232' },
      { d: 'M412,232 L444,232' },
      { d: 'M190,382 L222,382' },
      { d: 'M412,382 L444,382' },
      { d: 'M539,350 L539,300 L317,300 L317,264' },
      { d: 'M190,532 L222,532' },
      { d: 'M412,532 L444,532' },
      { d: 'M190,682 L539,682 L539,564' },
      { d: 'M634,532 L666,532' },
      { d: 'M856,532 L888,532', dashed: true },
      { d: 'M444,250 L428,250 L428,454 L95,454 L95,500', dashed: true },
      { d: 'M983,500 L983,264', dashed: true },
    ],
    labels: [
      { x: 254.5, y: 458, text: { ko: 'scrape', en: 'scrape' } },
      { x: 983, y: 386, text: { ko: '사람이 직접 변경', en: 'changed by a person' } },
    ],
  },
  'pinlog-scenario': {
    w: 1296, h: 760,
    lanes: [
      { y: 40, label: { ko: '사용자', en: 'User' } },
      { y: 270, label: { ko: '시스템', en: 'System' } },
      { y: 510, label: { ko: '재시도 경로', en: 'Retry path' } },
    ],
    nodes: [
      { kind: 'term', x: 0, y: 70, w: 120, h: 56, title: { ko: '사용자', en: 'User' } },
      { kind: 'user', x: 170, y: 70, w: 190, h: 72, title: { ko: '지도에서 위치 선택', en: 'Pick a spot' }, sub: { ko: '핀 위치 지정', en: 'Drop a pin' } },
      { kind: 'user', x: 410, y: 70, w: 190, h: 72, title: { ko: '장소 추가 · 기록', en: 'Add a place' }, sub: { ko: '메모 · 기억 남기기', en: 'Memo · memories' } },
      { kind: 'user', x: 650, y: 70, w: 210, h: 72, title: { ko: '내가 적어 둔 곳', en: 'My saved places' }, sub: { ko: '저장 목록 확인', en: 'Browse saved list' } },
      { kind: 'user', x: 910, y: 70, w: 190, h: 72, title: { ko: '자연어로 찾기', en: 'Search in words' }, sub: { ko: '“비 오는 날 혼자 책 읽기 좋은 카페”', en: '“A quiet café for reading on a rainy day”' } },
      { kind: 'user', x: 1150, y: 70, w: 146, h: 72, title: { ko: '기록 열기', en: 'Open record' }, sub: { ko: '재방문 · 덧붙이기', en: 'Revisit · add' } },
      { kind: 'sys', x: 410, y: 300, w: 190, h: 72, title: { ko: 'Backend 저장', en: 'Backend saves' }, sub: { ko: '핀 · 기록', en: 'Pin · record' } },
      { kind: 'key', x: 910, y: 300, w: 190, h: 72, title: { ko: 'AI 검색', en: 'AI search' }, sub: { ko: '내 기록과 매칭', en: 'Matches your records' } },
      { kind: 'sys', x: 1150, y: 300, w: 146, h: 72, title: { ko: '결과 핀 강조', en: 'Highlight pins' }, sub: { ko: '지도 위 표시', en: 'On the map' } },
      { kind: 'dec', x: 960, y: 540, w: 90, h: 90, title: { ko: '원하는 장소?', en: 'Right place?' } },
      { kind: 'user', x: 650, y: 549, w: 210, h: 72, title: { ko: '검색어 수정', en: 'Rephrase' }, sub: { ko: '조건 바꿔 다시 찾기', en: 'Change terms, search again' } },
    ],
    edges: [
      { d: 'M120,98 L170,98' },
      { d: 'M360,106 L410,106' },
      { d: 'M600,106 L650,106' },
      { d: 'M860,106 L910,106' },
      { d: 'M1100,106 L1150,106' },
      { d: 'M505,142 L505,300' },
      { d: 'M600,336 L625,336 L625,106 L650,106' },
      { d: 'M1005,142 L1005,300' },
      { d: 'M1100,336 L1150,336' },
      { d: 'M1223,300 L1223,142' },
      { d: 'M1005,372 L1005,521' },
      { d: 'M942,585 L860,585' },
      { d: 'M820,549 L820,470 L885,470 L885,106 L910,106' },
      { d: 'M1068,585 L1223,585 L1223,372' },
    ],
    labels: [
      { x: 895, y: 589, text: { ko: '아니오', en: 'no' } },
      { x: 1223, y: 482.5, text: { ko: '예', en: 'yes' } },
    ],
  },
  'janus-arch': {
    w: 1296, h: 760,
    lanes: [
      { y: 20, label: { ko: '데스크톱', en: 'Desktop' } },
      { y: 170, label: { ko: '백엔드', en: 'Backend' } },
      { y: 320, label: { ko: '에이전트', en: 'Agent' } },
      { y: 470, label: { ko: '리뷰', en: 'Review' } },
      { y: 620, label: { ko: '대상', en: 'Target' } },
    ],
    nodes: [
      { kind: 'user', x: 222, y: 50, w: 190, h: 64, title: { ko: 'React UI', en: 'React UI' }, sub: { ko: 'Task · 에디터 · 터미널 · 미리보기', en: 'Task · editor · terminal · preview' } },
      { kind: 'key', x: 666, y: 50, w: 190, h: 64, title: { ko: 'Electron Main', en: 'Electron Main' }, sub: { ko: '프로세스 · IPC', en: 'Processes · IPC' } },
      { kind: 'key', x: 222, y: 200, w: 190, h: 64, title: { ko: 'FastAPI', en: 'FastAPI' }, sub: { ko: 'Task API · HTTP·WebSocket', en: 'Task API · HTTP·WebSocket' } },
      { kind: 'db', x: 0, y: 200, w: 190, h: 64, title: { ko: 'SQLite', en: 'SQLite' }, sub: { ko: '작업 · 세션 기록', en: 'Tasks · sessions' } },
      { kind: 'sys', x: 666, y: 200, w: 190, h: 64, title: { ko: 'MLX Runtime', en: 'MLX Runtime' }, sub: { ko: 'Qwen 27B 4-bit', en: 'Qwen 27B 4-bit' } },
      { kind: 'sys', x: 222, y: 350, w: 190, h: 64, title: { ko: 'Orchestrator', en: 'Orchestrator' }, sub: { ko: 'worker 위임 · 자원 예산', en: 'Delegation · budgets' } },
      { kind: 'sys', x: 444, y: 350, w: 190, h: 64, title: { ko: 'Tools', en: 'Tools' }, sub: { ko: '파일 · 셸 · 검증', en: 'Files · shell · checks' } },
      { kind: 'sys', x: 222, y: 500, w: 190, h: 64, title: { ko: 'Git diff', en: 'Git diff' }, sub: { ko: '변경 기준', en: 'Source of change' } },
      { kind: 'sys', x: 444, y: 500, w: 190, h: 64, title: { ko: '검증 · 리뷰', en: 'Verify · review' }, sub: { ko: '현재 revision', en: 'Current revision' } },
      { kind: 'sys', x: 666, y: 500, w: 230, h: 64, title: { ko: 'Commit · Push · PR', en: 'Commit · Push · PR' }, sub: { ko: 'gh CLI 선택 연동', en: 'Optional gh CLI' } },
      { kind: 'ext', x: 504, y: 650, w: 300, h: 64, title: { ko: '선택한 저장소 · 현재 브랜치', en: 'Chosen repo · current branch' } },
    ],
    edges: [
      { d: 'M317,114 L317,200' },
      { d: 'M412,82 L666,82' },
      { d: 'M761,114 L761,154 L432,154 L432,232 L412,232', dashed: true },
      { d: 'M761,114 L761,200' },
      { d: 'M222,232 L190,232' },
      { d: 'M317,264 L317,350' },
      { d: 'M380,350 L380,307 L761,307 L761,264' },
      { d: 'M412,382 L444,382' },
      { d: 'M222,250 L200,250 L200,532 L222,532', dashed: true },
      { d: 'M412,532 L444,532' },
      { d: 'M634,532 L666,532' },
      { d: 'M781,564 L781,604 L700,604 L700,650' },
      { d: 'M600,650 L600,604 L317,604 L317,564' },
      { d: 'M634,382 L920,382 L920,682 L804,682' },
    ],
    labels: [
      { x: 317, y: 161, text: { ko: '로컬 HTTP · WS', en: 'local HTTP · WS' } },
      { x: 539, y: 86, text: { ko: 'IPC', en: 'IPC' } },
      { x: 596.5, y: 158, text: { ko: '프로세스 관리', en: 'process mgmt' } },
      { x: 761, y: 161, text: { ko: '모델 서버 관리', en: 'model server' } },
      { x: 596.5, y: 386, text: { ko: '추론', en: 'inference' } },
      { x: 200, y: 309, text: { ko: '리뷰 흐름', en: 'review' } },
    ],
  },
  'janus-scenario': {
    w: 1296, h: 760,
    lanes: [
      { y: 40, label: { ko: '사용자', en: 'User' } },
      { y: 270, label: { ko: '시스템', en: 'System' } },
      { y: 510, label: { ko: '재시도 경로', en: 'Retry path' } },
    ],
    nodes: [
      { kind: 'term', x: 0, y: 70, w: 120, h: 56, title: { ko: '개발자', en: 'Developer' } },
      { kind: 'user', x: 170, y: 70, w: 190, h: 72, title: { ko: 'Task 생성', en: 'Create a Task' }, sub: { ko: '프로젝트 · 목표', en: 'Project · goal' } },
      { kind: 'user', x: 410, y: 70, w: 190, h: 72, title: { ko: '실행기 선택', en: 'Choose a runner' }, sub: { ko: 'MLX 로컬 / Claude Code · Codex', en: 'Local MLX / Claude Code · Codex' } },
      { kind: 'user', x: 650, y: 70, w: 210, h: 72, title: { ko: '도구 승인', en: 'Approve tools' }, sub: { ko: '파일 · 셸 호출 확인', en: 'Review file and shell calls' } },
      { kind: 'user', x: 910, y: 70, w: 190, h: 72, title: { ko: 'diff · 검증 확인', en: 'Check diff' }, sub: { ko: '같은 화면에서', en: 'On the same screen' } },
      { kind: 'user', x: 1150, y: 70, w: 146, h: 72, title: { ko: '리뷰 수락', en: 'Accept' }, sub: { ko: '커밋 · push · PR', en: 'Commit · PR' } },
      { kind: 'sys', x: 410, y: 300, w: 190, h: 72, title: { ko: '에이전트 실행', en: 'Agent runs' }, sub: { ko: 'Orchestrator · worker', en: 'Orchestrator · worker' } },
      { kind: 'key', x: 650, y: 300, w: 210, h: 72, title: { ko: '도구 실행', en: 'Tools run' }, sub: { ko: '저장소 현재 브랜치', en: 'Repo\'s current branch' } },
      { kind: 'sys', x: 910, y: 300, w: 190, h: 72, title: { ko: 'Git diff · 테스트', en: 'Git diff · tests' }, sub: { ko: '현재 revision', en: 'Current revision' } },
      { kind: 'sys', x: 1150, y: 300, w: 146, h: 72, title: { ko: '커밋 · push', en: 'Commit' }, sub: { ko: 'HEAD · SHA 확인', en: 'HEAD · SHA check' } },
      { kind: 'dec', x: 960, y: 540, w: 90, h: 90, title: { ko: '검증 통과?', en: 'Checks pass?' } },
      { kind: 'sys', x: 650, y: 549, w: 210, h: 72, title: { ko: '실패 원인 확인 · 재실행', en: 'Find cause · rerun' }, sub: { ko: '실행 상태 ≠ 성공', en: 'Run state ≠ success' } },
    ],
    edges: [
      { d: 'M120,98 L170,98' },
      { d: 'M360,106 L410,106' },
      { d: 'M600,106 L650,106' },
      { d: 'M860,106 L910,106' },
      { d: 'M1100,106 L1150,106' },
      { d: 'M505,142 L505,300' },
      { d: 'M600,336 L650,336' },
      { d: 'M755,300 L755,142', dashed: true },
      { d: 'M860,336 L910,336' },
      { d: 'M1005,300 L1005,142' },
      { d: 'M1223,142 L1223,300' },
      { d: 'M1005,372 L1005,521' },
      { d: 'M942,585 L860,585' },
      { d: 'M650,585 L505,585 L505,372' },
      { d: 'M1068,585 L1223,585 L1223,372' },
    ],
    labels: [
      { x: 755, y: 225, text: { ko: '승인 요청', en: 'approval request' } },
      { x: 895, y: 589, text: { ko: '아니오', en: 'no' } },
      { x: 1223, y: 482.5, text: { ko: '예 · 리뷰 수락 후', en: 'yes · after review' } },
    ],
  },
  'finch-arch': {
    w: 1296, h: 760,
    lanes: [
      { y: 20, label: { ko: '클라이언트', en: 'Client' } },
      { y: 170, label: { ko: '인그레스', en: 'Ingress' } },
      { y: 320, label: { ko: '서비스', en: 'Services' } },
      { y: 470, label: { ko: '데이터', en: 'Data' } },
      { y: 620, label: { ko: '외부', en: 'External' } },
    ],
    nodes: [
      { kind: 'user', x: 222, y: 50, w: 190, h: 64, title: { ko: 'React 웹', en: 'React web' }, sub: { ko: 'Vite · TanStack Query', en: 'Vite · TanStack Query' } },
      { kind: 'user', x: 666, y: 50, w: 190, h: 64, title: { ko: 'Capacitor 앱 셸', en: 'Capacitor shell' }, sub: { ko: 'iOS · Android', en: 'iOS · Android' } },
      { kind: 'sys', x: 444, y: 200, w: 190, h: 64, title: { ko: 'Traefik Ingress', en: 'Traefik Ingress' }, sub: { ko: '운영 클러스터 · Kubernetes', en: 'Prod cluster · Kubernetes' } },
      { kind: 'sys', x: 222, y: 350, w: 190, h: 64, title: { ko: 'Frontend', en: 'Frontend' }, sub: { ko: 'nginx · 정적 화면', en: 'nginx · static pages' } },
      { kind: 'key', x: 444, y: 350, w: 190, h: 64, title: { ko: 'Backend', en: 'Backend' }, sub: { ko: 'Kotlin · Spring Boot · 원장·시세', en: 'Kotlin · Spring Boot · ledger, prices' } },
      { kind: 'sys', x: 888, y: 350, w: 190, h: 64, title: { ko: 'AI', en: 'AI' }, sub: { ko: 'FastAPI · 설명·브리핑·위험 진단', en: 'FastAPI · explain, brief, risk' } },
      { kind: 'db', x: 222, y: 500, w: 190, h: 64, title: { ko: 'PostgreSQL', en: 'PostgreSQL' }, sub: { ko: '원장 · 종목', en: 'Ledger · stocks' } },
      { kind: 'db', x: 444, y: 500, w: 190, h: 64, title: { ko: 'Redis', en: 'Redis' }, sub: { ko: '실시간 시세', en: 'Live prices' } },
      { kind: 'db', x: 888, y: 500, w: 190, h: 64, title: { ko: 'AI DB', en: 'AI DB' }, sub: { ko: '시세 이력 · pgvector', en: 'Price history · pgvector' } },
      { kind: 'ext', x: 444, y: 650, w: 190, h: 64, title: { ko: '한국투자증권 OpenAPI', en: 'KIS OpenAPI' } },
      { kind: 'ext', x: 888, y: 650, w: 190, h: 64, title: { ko: 'KRX · DART · NAVER', en: 'KRX · DART · NAVER' } },
      { kind: 'ext', x: 1106, y: 650, w: 190, h: 64, title: { ko: 'LLM', en: 'LLM' } },
    ],
    edges: [
      { d: 'M666,82 L412,82', dashed: true },
      { d: 'M317,114 L317,154 L539,154 L539,200' },
      { d: 'M539,264 L539,304 L317,304 L317,350' },
      { d: 'M539,264 L539,350' },
      { d: 'M539,414 L539,454 L317,454 L317,500' },
      { d: 'M539,414 L539,500' },
      { d: 'M634,382 L888,382' },
      { d: 'M983,414 L983,434 L579,434 L539,414', dashed: true },
      { d: 'M983,414 L983,500' },
      { d: 'M539,650 L539,564', dashed: true },
      { d: 'M983,564 L983,650' },
      { d: 'M1078,382 L1098,382 L1201,382 L1201,650' },
    ],
    labels: [
      { x: 539, y: 86, text: { ko: '웹 화면 사용', en: 'uses the web UI' } },
      { x: 428, y: 308, text: { ko: '정적', en: 'static' } },
      { x: 539, y: 311, text: { ko: 'API', en: 'API' } },
      { x: 761, y: 386, text: { ko: 'AI 요청 중계', en: 'relays AI requests' } },
      { x: 781, y: 438, text: { ko: '내부 API로 원장 조회', en: 'reads ledger via internal API' } },
      { x: 539, y: 611, text: { ko: '시세 수집', en: 'Price feed' } },
    ],
  },
  'finch-scenario': {
    w: 1296, h: 760,
    lanes: [
      { y: 40, label: { ko: '사용자', en: 'User' } },
      { y: 270, label: { ko: '시스템', en: 'System' } },
      { y: 510, label: { ko: '근거 경로', en: 'Evidence path' } },
    ],
    nodes: [
      { kind: 'term', x: 0, y: 70, w: 120, h: 56, title: { ko: '사용자', en: 'User' } },
      { kind: 'user', x: 170, y: 70, w: 190, h: 72, title: { ko: '가입', en: 'Sign up' }, sub: { ko: '가상 예수금 100만 원', en: '₩1M virtual cash' } },
      { kind: 'user', x: 410, y: 70, w: 190, h: 72, title: { ko: '종목 탐색', en: 'Explore stocks' }, sub: { ko: '검색 · 일봉 · 실시간 시세', en: 'Search · daily · live prices' } },
      { kind: 'user', x: 650, y: 70, w: 210, h: 72, title: { ko: '모의 매수 · 매도', en: 'Paper buy · sell' }, sub: { ko: '실제 시세로 주문', en: 'Orders at real prices' } },
      { kind: 'user', x: 910, y: 70, w: 190, h: 72, title: { ko: '포트폴리오 확인', en: 'Check portfolio' }, sub: { ko: '총자산 · 평가손익', en: 'Total assets · P&L' } },
      { kind: 'user', x: 1150, y: 70, w: 146, h: 72, title: { ko: 'AI에게 질문', en: 'Ask the AI' }, sub: { ko: '브리핑 · 위험 진단', en: 'Briefing · risk check' } },
      { kind: 'sys', x: 410, y: 300, w: 190, h: 72, title: { ko: '시세 수집', en: 'Price feed' }, sub: { ko: '한국투자증권 · Redis', en: 'KIS · Redis' } },
      { kind: 'key', x: 650, y: 300, w: 210, h: 72, title: { ko: '원장 기록', en: 'Ledger entry' }, sub: { ko: '충전 · 체결 (PostgreSQL)', en: 'Deposits · fills (PostgreSQL)' } },
      { kind: 'sys', x: 910, y: 300, w: 190, h: 72, title: { ko: '계산 엔진', en: 'Calc engine' }, sub: { ko: '수익률 · 집중도 · 위험', en: 'Returns · concentration · risk' } },
      { kind: 'sys', x: 1150, y: 300, w: 146, h: 72, title: { ko: 'LLM 설명', en: 'LLM explanation' }, sub: { ko: '근거 포함', en: 'With sources' } },
      { kind: 'dec', x: 960, y: 540, w: 90, h: 90, title: { ko: '수치 질의?', en: 'Numeric question?' } },
      { kind: 'sys', x: 650, y: 549, w: 210, h: 72, title: { ko: '공시 · 뉴스 근거 조회', en: 'Look up filings · news' }, sub: { ko: 'KRX · DART · NAVER', en: 'KRX · DART · NAVER' } },
    ],
    edges: [
      { d: 'M120,98 L170,98' },
      { d: 'M360,106 L410,106' },
      { d: 'M600,106 L650,106' },
      { d: 'M860,106 L910,106' },
      { d: 'M1100,106 L1150,106' },
      { d: 'M505,300 L505,142' },
      { d: 'M755,142 L755,300' },
      { d: 'M860,336 L910,336' },
      { d: 'M1005,300 L1005,142' },
      { d: 'M1223,142 L1223,300' },
      { d: 'M1005,372 L1005,521' },
      { d: 'M1068,585 L1223,585 L1223,372' },
      { d: 'M942,585 L860,585' },
      { d: 'M755,621 L755,670 L1223,670 L1223,372' },
    ],
    labels: [
      { x: 1223, y: 482.5, text: { ko: '예 · 엔진 결과 전달', en: 'yes · engine results' } },
      { x: 895, y: 589, text: { ko: '아니오', en: 'no' } },
    ],
  },
} satisfies Record<string, Diagram>;

export type DiagramKey = keyof typeof DIAGRAMS;

// 그림 검사(npm run check): 선이 다른 노드 밑을 지나가거나, 화살촉이 노드에 묻히거나 찌그러지거나,
// 서로 다른 선이 한 줄로 겹치거나(같은 출발·도착을 나누는 갈래는 허용), 다른 선이 화살촉을 지나가면 문제로 돌려준다.
export function diagramProblems(d: Diagram): string[] {
  const inside = (n: DiagramNode, x: number, y: number) => {
    if (n.kind === 'dec') return Math.abs(x - n.x - n.w / 2) + Math.abs(y - n.y - n.h / 2) < n.w / Math.SQRT2 - 0.5;
    return x > n.x + 0.5 && x < n.x + n.w - 0.5 && y > n.y + 0.5 && y < n.y + n.h - 0.5;
  };
  const near = (n: DiagramNode, [x, y]: number[]) => x >= n.x - 2 && x <= n.x + n.w + 2 && y >= n.y - 2 && y <= n.y + n.h + 2 || inside(n, x, y);
  const pts = d.edges.map((e) => [...e.d.matchAll(/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g)].map((m) => [+m[1], +m[2]]));
  const segs = pts.flatMap((p, i) => p.slice(1).map((b, j) => ({ i, a: p[j], b })));
  const along = (a: number[], b: number[], step: number, max = Infinity) => {
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]), out: number[][] = [];
    for (let t = 0; t <= Math.min(len, max); t += step) out.push([b[0] - (b[0] - a[0]) * t / len, b[1] - (b[1] - a[1]) * t / len]);
    return out;
  };
  const out: string[] = [];
  pts.forEach((p, i) => {
    const e = d.edges[i].d, ends = d.nodes.filter((n) => near(n, p[0]) || near(n, p.at(-1)!));
    const through = new Set(segs.filter((s) => s.i === i).flatMap((s) => along(s.a, s.b, 1))
      .flatMap(([x, y]) => d.nodes.filter((n) => !ends.includes(n) && inside(n, x, y)).map((n) => n.title.ko)));
    if (through.size) out.push(`${e}: ${[...through].join(', ')} 밑을 지나감`);
    const [a, b] = p.slice(-2);
    if (Math.hypot(b[0] - a[0], b[1] - a[1]) < 10) out.push(`${e}: 마지막 선이 10px보다 짧아 화살촉이 찌그러짐`);
    if (along(a, b, 1, 8).some(([x, y]) => d.nodes.some((n) => inside(n, x, y)))) out.push(`${e}: 화살촉이 노드에 가려짐`);
    for (const s of segs) {
      if (s.i === i || pts[s.i][0].join() === b.join() || pts[s.i].at(-1)!.join() === b.join()) continue;
      const [x1, y1] = s.a, [x2, y2] = s.b, L2 = (x2 - x1) ** 2 + (y2 - y1) ** 2;
      const t = Math.max(0, Math.min(1, ((b[0] - x1) * (x2 - x1) + (b[1] - y1) * (y2 - y1)) / L2));
      if (Math.hypot(x1 + t * (x2 - x1) - b[0], y1 + t * (y2 - y1) - b[1]) < 9) { out.push(`${e}: 화살촉 위로 ${d.edges[s.i].d} 선이 지나감`); break; }
    }
  });
  for (const [k, s] of segs.entries()) for (const t of segs.slice(k + 1)) {
    if (s.i === t.i || pts[s.i][0].join() === pts[t.i][0].join() || pts[s.i].at(-1)!.join() === pts[t.i].at(-1)!.join()) continue;
    for (const [c, o] of [[1, 0], [0, 1]]) {
      if (s.a[c] !== s.b[c] || t.a[c] !== t.b[c] || s.a[c] !== t.a[c]) continue;
      const lo = Math.max(Math.min(s.a[o], s.b[o]), Math.min(t.a[o], t.b[o])), hi = Math.min(Math.max(s.a[o], s.b[o]), Math.max(t.a[o], t.b[o]));
      if (hi - lo > 1) out.push(`${d.edges[s.i].d} · ${d.edges[t.i].d}: 한 줄로 겹침`);
    }
  }
  return out;
}
