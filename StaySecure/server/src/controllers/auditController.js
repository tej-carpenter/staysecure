const AuditLog = require('../models/AuditLog');
const User = require('../models/User');

const getAuditLogs = async (req, res, next) => {
  try {
    const logs = await AuditLog.aggregate([
      {
        $lookup: {
          from: 'users',
          let: { actorId: '$actorId' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: [
                    '$_id',
                    { $convert: { input: '$$actorId', to: 'objectId', onError: null, onNull: null } }
                  ]
                }
              }
            },
            {
              $project: {
                _id: 1,
                email: 1
              }
            }
          ],
          as: 'actor'
        }
      },
      {
        $addFields: {
          actorEmail: { $arrayElemAt: ['$actor.email', 0] }
        }
      },
      {
        $sort: { timestamp: -1 }
      },
      {
        $limit: 500
      }
    ]);

    res.status(200).json({
      success: true,
      logs
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAuditLogs
};