// Constants used by the completeTheConversation exercise

export const CONVERSATION_STARTERS = [
  "question",
  "statement",
  "greeting",
  "observation",
  "suggestion"
]

export const MISTAKE_TYPES = [
  "grammatical",
  "relevancy",
  "spelling",
  "typographical",
  "wrong tense",
  "wrong aspect"
]

// Constants used by the ChooseTheTense exercise

export const TENSE_TYPES = [
  "past",
  "present",
  "future"
]

// Regex patterns for tenses in English
export const PAST_TENSE_ENG = /\b(was|were|had|did|went|gave|made|came|found|felt|put|kept|began|brought|drew|sent|sold|fell|drove|caught|chose|became|flew|rose|set|spoke|threw|wore|grew|built|knew|showed|held|wrote|ran|sat|bought|paid|lost|left|met|said|ate|drank|dreamed|saw|slept|spent|stood|swam|took|taught|told|thought|understood|won)\b/;
export const PRESENT_TENSE_ENG = /\b(am|is|are|have|has|do|does|go|see|eat|explore|give|take|make|come|know|think|tell|find|feel|become|leave|put|keep|begin|bring|run|build|understand|write|draw|send|sell|lose|fall|buy|drive|catch|choose|fly|rise|set|speak|throw|wear|grow|can|must|shall)\b/;
export const FUTURE_TENSE_ENG = /\b(will|shall|going to|is going to|are going to|am going to)\b/;
