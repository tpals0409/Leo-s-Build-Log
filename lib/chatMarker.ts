// 챗봇 답 첫 줄의 자료 번호 표시([[1,3]])를 떼어 낸다 (lib/chat.ts). 스트림으로 조금씩 오므로 판단이 서기 전엔 null.
// 모델은 [[1,3]] 대신 [1,3]으로 쓰거나 줄을 안 바꾸기도 하고, 표시 없이 바로 답하기도 한다.
const STRICT = /^\s*\[\[?([\d,\s]*)\]\]?[ \t]*\n\s*/;
const LOOSE = /^\s*\[\[?([\d,\s]*)\]\]?\s*/;

export function splitMarker(head: string, final = false): { used: number[]; rest: string } | null {
  const m = head.match(STRICT) ?? (final || head.length > 40 ? head.match(LOOSE) : null);
  if (m) return { used: m[1].split(',').map(Number).filter((n) => n > 0), rest: head.slice(m[0].length) };
  if (final || head.length > 40 || (!/^\s*\[/.test(head) && head.trim())) return { used: [], rest: head };
  return null;
}
