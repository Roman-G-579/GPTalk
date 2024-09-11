import { NextFunction, Request, Response } from "express";
import { ResultModel } from "../models/result.interface";
import {PipelineStage} from "mongoose";

//Sorts the users in the database by their total exp in the given language
export async function getTopUsers(req: Request, res: Response, next: NextFunction) {

  try {
    let language = req.header('language');

    if (!language) {
      return res.status(400).send({ error: 'Error reading language from request' });
    }

    const aggregationPipeline: PipelineStage[] = [];

    if (language !== 'NOT_SELECTED') {
      aggregationPipeline.push({
        $match: { language: language } // Filter documents based on the selected language
      });
    }

    aggregationPipeline.push(
        {
          $group: {
            _id: '$user',
            totalExp: { $sum: '$exp' },
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user',
          },
        },
        {
          $unwind: '$user',
        },
        {
          $project: {
            _id: 0,
            userId: '$_id',
            username: '$user.username',
            firstName: '$user.firstName',
            lastName: '$user.lastName',
            createdAt: '$user.createdAt',
            totalExp: 1,
          },
        },
        {
          $sort: { totalExp: -1 },
        }
    );

    // Sorts the user's by exp, filtering the results by the given language
    const userExp: Object[] = await ResultModel.aggregate(aggregationPipeline);

    const top3Users = getTop3Users(userExp);
    const top4To10Users = getTop4To10Users(userExp);


    return res.send({top3Users, top4To10Users});
  } catch (err) {
    next(err);
  }
}

/**
 * Takes the first 3 user objects from the object array
 * @param userExp the user object array
 */
function getTop3Users(userExp: Object[]) {
  const top3Users = userExp.slice(0, 3);

  while (top3Users.length < 3) {
    top3Users.push(null);
  }

  return top3Users;
}


/**
 * Takes the  4th to 10th user objects from the object array
 * @param userExp the user object array
 */
function getTop4To10Users(userExp: Object[]) {
  const top4To10Users = userExp.slice(3, 10);

  while (top4To10Users.length < 7) {
    top4To10Users.push(null);
  }

  return top4To10Users;
}
