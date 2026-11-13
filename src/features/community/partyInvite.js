// A party invite travels as an ordinary direct chat message. This file is the only place that
// writes or reads that text, so the sender and the "Join party" button cannot drift apart.
const invitePattern = /Room code: ([A-Z0-9]{8}) · Password: (\d{6})/

export const ALREADY_IN_PARTY = 'MM_ALREADY_IN_PARTY'

export const partyInviteText = party => `Join my party! Room code: ${party.partyCode} · Password: ${party.password}`

/** The code and password inside an invite message, or null for any other message. */
export function readPartyInvite(content) {
  const match = invitePattern.exec(content || '')
  return match ? { partyCode: match[1], password: match[2] } : null
}
