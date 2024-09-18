// The heading strings of the available exercise types
import { ExerciseType } from '../enums/exercise-type.enum';

export const HEADINGS_MAP: { [key in ExerciseType]: string } = {
	0: 'Fill in the blank',
	1: 'Choose the correct translation',
	2: 'Translate the sentence',
	3: 'Complete the conversation',
	4: 'Match the words',
	5: 'Arrange the words to form a correct sentence',
	6: 'Match the words to their correct category',
	7: 'Summarize the paragraph',
	8: 'Choose the tense',
};

// The instruction strings of the available exercise types
export const INSTRUCTIONS_MAP: { [key in ExerciseType]: string } = {
	0: 'Click on an answer or type it and hit the <i>enter</i> key to submit',
	1: 'Click on the correct translation of the given word',
	2: `Write the given sentence in the chosen language`,
	3: `Click on an answer or type it and hit the <i>enter</i> key to submit`,
	4: `Match the words in a given language to their English translations`,
	5: `Click the words sequentially to place them onto the board. Click submit when finished.`,
	6: 'Drag and drop the words to their category container. Click submit when finished.',
	7: 'Click on the option that best summarizes the given paragraph',
	8: 'Click on the correct grammatical tense for the given sentence',
};

// Constants used by the completeTheConversation exercise

export const CONVERSATION_STARTERS = [
	'question',
	'statement',
	'greeting',
	'observation',
	'suggestion',
];

export const REPLY_MISTAKE_TYPES = [
	'grammatical',
	'relevancy',
	'spelling',
	'typographical',
	'wrong tense',
	'wrong aspect',
];

export const SUMMARY_MISTAKE_TYPES = ['incorrect key points', 'misinterpretation', 'relevancy'];

// Constants used by the ChooseTheTense exercise

export const TENSE_TYPES = ['past', 'present', 'future'];

// Regex patterns for tenses in English
export const PAST_TENSE_ENG =
	/\b(was|were|had|did|went|gave|made|came|found|felt|put|kept|began|brought|drew|sent|sold|fell|drove|caught|chose|became|flew|rose|set|spoke|threw|wore|grew|built|knew|showed|held|wrote|ran|sat|bought|paid|lost|left|met|said|ate|drank|dreamed|saw|slept|spent|stood|swam|took|taught|told|thought|understood|won)\b/;
export const PRESENT_TENSE_ENG =
	/\b(am|is|are|have|has|do|does|go|see|eat|explore|give|take|make|come|know|think|tell|find|feel|become|leave|put|keep|begin|bring|run|build|understand|write|draw|send|sell|lose|fall|buy|drive|catch|choose|fly|rise|set|speak|throw|wear|grow|can|must|shall)\b/;
export const FUTURE_TENSE_ENG = /\b(will|shall|going to|is going to|are going to|am going to)\b/;
