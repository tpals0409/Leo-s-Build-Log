# 레오에 대한 사실 그래프 (챗봇용)

원본: 개인 LLM 위키에서 공개용으로 골라 다시 쓴 패키지 `portfolio-chatbot-public-v1`(2026-10-06). 프로젝트 5개, 주장(Claim) 23개(원본 24개 — 아래 "바꾼 것").
블로그 글처럼 **이 폴더가 원본, Neo4j는 사본**이다. 고치면 앱이 다음에 뜰 때(로컬 dev는 다음 질문 때) Neo4j에 다시 넣는다(`lib/chatGraph.ts`).

- `knowledge.json` — 노드(Author·Project·Claim·EvidenceReference)와 관계(Claim -ABOUT-> Project|Author, Claim -SUPPORTED_BY-> EvidenceReference).
  EvidenceReference는 원문을 뺀 식별자뿐이라 답에 쓰지 않는다. 주장 문장의 "작성자"는 레오다.
- `acceptance-tests.json` — 질문별 기대·금지 기준. `node scripts/chat-eval.mjs`(dev 서버 필요)로 돌려 본다.

원본에서 바꾼 것 (2026-10-06):
- claim_000252(야누스): 작업별 worktree 격리 → 현재 브랜치에서 직접 작업으로 수정(글 `janus-dropping-worktree-isolation`과 맞춤). claim_000253(worktree 격리 경계)과 그 근거 식별자는 뺌.
- 원본 패키지의 "이름·연락처 비공개" 규칙은 쓰지 않는다 — 소개 페이지에 공개된 실명·이메일·학력은 답한다(`lib/chat.ts` SYSTEM).
