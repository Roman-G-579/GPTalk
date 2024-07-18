import OpenAI from "openai";
import { Request, Response, NextFunction } from 'express';
import {Config} from "../config/config";
import httpStatus from "http-status";

const openai = new OpenAI({ apiKey: Config.OPENAI_API_KEY});

/**
 * Sends a chat completion request to the OpenAI API using the given parameters
 */
export async function generateLesson(req: Request, res: Response, next: NextFunction) {

    try {
        const { userPrompt } = req.body;

        const completion = await openai.chat.completions.create({
            messages: [
                {role: "system", content: "you are a helpful language learning exercise generator, please output valid JSON"},
                {role: "user", content: userPrompt }
            ],
            model: "gpt-4o",
            response_format: {"type": "json_object"},
            temperature: 0.2,
        });

        console.log(completion.choices[0]);
        return res.status(httpStatus.OK).send(completion.choices[0]);
    } catch (err) {
        next(err);
    }
}

// function getPrompt(exerciseType: string, difficulty: string, language: string, amount: number) {
//     let userPrompt: string = `Generate the following ${amount} exercises in ${language}.
//     Follow the example for each requested type:`;
//
//     switch (exerciseType) {
//         case "fillInTheBlank":
//             userPrompt += `
//         Generate a "Fill in the blank" exercise
//
//         question: "The sun rises in the ",
//         choices: ["East","West","North","South"],
//         answer: "East"
//         `
//             break;
//         case "translateWord":
//             userPrompt += `
//         Generate a "Translate the word" exercise
//
//         question: "תפוח",
//         choices: ["Hello","Apple","Tree"],
//         answer: "Apple"
//         `
//             break;
//         case "translateSentence":
//             userPrompt += `
//         Generate a "Translate the sentence" exercise
//
//         question: "קוראים לי דני",
//         answer: "My name is Danny"
//         `
//             break;
//         case "completeTheConversation":
//             userPrompt += `
//         Generate a "Complete conversation" exercise
//
//         question: "בהצלחה במבחן!",
//         choices: ["תודה, גם לך!","נעים להכיר!"],
//         answer: "תודה, גם לך!",
//         translation: "Person A: Good luck on the test! Person B: Thanks, You too!"
//         `
//             break;
//         case "matchTheWords":
//             userPrompt += `
//         Generate a "Match the words" exercise
//
//         correctPairs: [
//       ["חתול", "Cat"],
//       ["מים", "Water"],
//       ["תפוז", "Orange"],
//       ["ספר", "Book"],
//   ["שולחן", "Table"]
//         ],
//         `
//             break;
//         case "reorderSentence":
//             userPrompt += `
//         Generate a "Reorder the sentence" exercise
//
//         choices: ['יוסי','רוכב','על','האופניים'],
//         answer: 'יוסי רוכב על האופניים',
//         translation: 'Yossi is riding the bicycle'
//         `
//             break;
//         case "matchTheCategory":
//             userPrompt += `
//         Generate a "Match the words" exercise
//
//         correctPairs: [
//         ["כדורסל", "ספורט"],
//         ["טניס", "ספורט"],
//         ["עוגה", "אוכל"],
//         ["עגבניה", "אוכל"],
//         ["כדורגל", "ספורט"],
//         ["תפוח","אוכל"]
//         ],
//         `
//             break;
//         default:
//             ``;
//     }
//     return userPrompt;
// }
