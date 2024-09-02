import { NextFunction, Request, Response } from "express";
import { ResultModel } from "../models/result.interface";

export async function getTopUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const userExp = await ResultModel.aggregate([
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
      },
    ]);

    const top3Users = userExp.slice(0, 3);
    const top4To10Users = userExp.slice(3, 10);

    while (top3Users.length < 3) {
      top3Users.push(null);
    }

    while (top4To10Users.length < 7) {  
      top4To10Users.push(null);
    }

    return res.send({top3Users, top4To10Users});
  } catch (err) {
    next(err);
  }
}