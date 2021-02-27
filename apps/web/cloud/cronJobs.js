/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

const commonFunctions = require("./commonFunctions.js");
const logger = require("parse-server").logger;

Parse.Cloud.job("removeInvalidLogin", async function (request, status) {
  var date = new Date();
  var timeNow = date.getTime();

  logger.info("Job removeInvalidLogin started at " + date);
  try {
    var intervalOfTime = 7 * commonFunctions.DAY_IN_MS; // the time set is 7 days in milliseconds
    var timeThen = timeNow - intervalOfTime;

    // Limit date
    var queryDate = new Date();
    queryDate.setTime(timeThen);

    // The query object
    var query = new Parse.Query(Parse.User);

    query.equalTo("emailVerified", false);
    query.lessThanOrEqualTo("updatedAt", queryDate);

    const results = await query.find({ useMasterKey: true });

    for (var i = 0; i < results.length; i++) {
      const user = results[i];
      if (user.get("state") != "blocked") {
        const email = user.get("email");
        if (email) {
          const subject = "用户账号注销通知";
          const body = `${user.get(
            "name"
          )}师兄，\n\n南无阿弥陀佛！因为您没有在一周以内完成电邮地址验证，您用${email}注册的账号已经被注销。如果您还想访问学修平台，请点击以下链接重新注册用户账户：\n\nhttps://amitabha.herokuapp.com/online/#/register \n\n新加坡智悲佛学会\nAMITABHA`;

          const sendEmailResult = await commonFunctions.sendEmail(
            email,
            undefined,
            subject,
            body
          );
          logger.info(`sent email to ${email} result: ${sendEmailResult}`);
        }
      }

      user
        .destroy({ useMasterKey: true })
        .then(destroyed => {
          logger.info(
            "Successfully destroyed object" + JSON.stringify(destroyed)
          );
        })
        .catch(error => {
          logger.info("Error: " + error.code + " - " + error.message);
        });
    }
  } catch (e) {
    logger.info("Exception: " + JSON.stringify(e));
  }

  logger.info("Job removeInvalidLogin finished at " + new Date());
});

const loadUserMissedReportingStates = async function (
  parseUser,
  parseClass,
  lastSession,
  lastWeek
) {
  const results = [];
  const userId = parseUser._getId();
  logger.info(`loadUserMissedReportingStates - userId: ${userId}`);

  if (lastSession) {
    const attendance = await commonFunctions.loadStudentAttendanceV2(
      userId,
      lastSession
    );
    var reported =
      attendance && (attendance.onLeave || attendance.attendance != undefined);
    if (!reported) {
      results.push("共修出席");
    }
  }

  logger.info(
    `loadUserMissedReportingStates - results: ${JSON.stringify(results)}`
  );

  var query = parseClass.relation("practices").query();
  logger.info(
    `loadUserMissedReportingStates - query: ${JSON.stringify(query)}`
  );
  query.ascending("index");
  const parsePractices = await query.find();
  logger.info(
    `loadUserMissedReportingStates - parsePractices: ${JSON.stringify(
      parsePractices
    )}`
  );

  for (var i = 0; i < parsePractices.length; i++) {
    const parsePractice = parsePractices[i];
    query = parsePractice.relation("counts").query();
    query.equalTo("userId", userId);
    query.greaterThanOrEqualTo("reportedAt", lastWeek.monday);
    query.lessThanOrEqualTo("reportedAt", lastWeek.sunday);
    const parseCounts = await query.find();
    if (!parseCounts.length) {
      results.push(parsePractice.get("name"));
    }
  }

  return results;
};

Parse.Cloud.job("remindClassReporting", async function (request, status) {
  var date = new Date();
  //only remind between Tue & Sat (both inclusive)
  if (date.getDay() > 1) {
    logger.info(
      `Job remindClassReporting started at ${date} - params: ${JSON.stringify(
        request.params
      )}`
    );
    try {
      const classId = request.params.classId;
      if (classId) {
        await commonFunctions.remindClassReporting(classId);
      }
    } catch (e) {
      logger.info("remindClassReporting - exception: " + JSON.stringify(e));
      return e;
    }

    logger.info("Job remindClassReporting finished at " + new Date());
  }
});
