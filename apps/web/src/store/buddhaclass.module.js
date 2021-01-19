import Parse from "parse";
import Toasted from "vue-toasted";
import Vue from "vue";
import {
  FETCH_SESSIONS,
  FETCH_PRACTICE_COUNTS,
  FILTER_SESSIONS,
  UPDATE_SESSION,
  FETCH_STUDENTS,
  RESET_STUDENTS,
  FETCH_STATS
} from "./actions.type";
import {
  FETCH_SESSIONS_START,
  FETCH_SESSIONS_END,
  FILTER_SESSIONS_IN_LIST,
  FETCH_PRACTICE_COUNTS_START,
  FETCH_PRACTICE_COUNTS_END,
  FETCH_STUDENTS_START,
  FETCH_STUDENTS_END,
  FETCH_STATS_START,
  FETCH_STATS_END
} from "./mutations.type";
import store from "./index";

Vue.use(Toasted);

const state = {
  classSession: {},
  classSessions: [],
  sessionDetails: [],
  classInfo: {},
  practiceInfo: {},
  isLoadingSessions: false,
  isLoadingPracticeCounts: false,
  isLoadingStudents: false,
  isLoadingStats: false,
  classTeams: [],
  classTeamOptions: [],
  classAdminUsers: [],
  removedStudents: [],
  classTeamsChanged: false,
  initComponentKey: 0
};

const getters = {
  classInfo(state) {
    return state.classInfo;
  },
  classSession(state) {
    return state.classSession;
  },
  classSessions(state) {
    return state.classSessions;
  },
  sessionDetails(state) {
    return state.sessionDetails;
  },
  isLoadingSessions(state) {
    return state.isLoadingSessions;
  },
  isLoadingPracticeCounts(state) {
    return state.isLoadingPracticeCounts;
  },
  isLoadingStudents(state) {
    return state.isLoadingStudents;
  },
  isLoadingStats(state) {
    return state.isLoadingStats;
  },
  classTeams(state) {
    return state.classTeams;
  },
  classTeamsChanged(state) {
    return state.classTeamsChanged;
  },
  classTeamOptions(state) {
    return state.classTeamOptions;
  },
  classAdminUsers(state) {
    return state.classAdminUsers;
  },
  initComponentKey(state) {
    return state.initComponentKey;
  },
  removedStudents(state) {
    return state.removedStudents;
  },
  practiceInfo(state) {
    return state.practiceInfo;
  }
};

const actions = {
  [FETCH_SESSIONS](context, params) {
    const classId = params["classId"];

    var forApplication = params["forApplication"];
    if (typeof forApplication === "string") {
      forApplication = forApplication === "true";
    }

    var forAdmin = params["forAdmin"];
    if (typeof forAdmin === "string") {
      forAdmin = forAdmin === "true";
    }

    var loadingNewSessions = params["loadingNewSessions"];
    if (typeof loadingNewSessions === "string") {
      loadingNewSessions = loadingNewSessions === "true";
    }

    console.log(
      `${FETCH_SESSIONS} - classId: ${classId} forApplication: ${forApplication} forAdmin: ${forAdmin} loadingNewSessions: ${loadingNewSessions}`
    );
    context.commit(FETCH_SESSIONS_START);

    const fetchSessions = "class:fetchSessionsV2";
    Parse.Cloud.run(fetchSessions, {
      classId,
      forApplication,
      forAdmin,
      loadingNewSessions
    })
      .then(classInfo => {
        console.log(
          `${fetchSessions} - #classSessions: ${classInfo.classSessions.length}`
          // `${fetchSessions} - classInfo: ${JSON.stringify(classInfo)}`
        );
        context.commit(FETCH_SESSIONS_END, classInfo);
      })
      .catch(e => {
        // console.log(`error loading classSession list: ${e.message}`);
        console.log(`error loading classSession list: ${JSON.stringify(e)}`);
        throw new Error(e);
      });
  },
  [FETCH_PRACTICE_COUNTS](context, params) {
    const practiceId = params["practiceId"];
    var forAdmin = params["forAdmin"];

    if (typeof forAdmin === "string") {
      forAdmin = forAdmin === "true";
    }
    console.log(
      `${FETCH_PRACTICE_COUNTS} - practiceId: ${practiceId} forAdmin: ${forAdmin}`
    );
    context.commit(FETCH_PRACTICE_COUNTS_START);

    const fetchPracticeCounts = "class:fetchPracticeCountsV2";
    Parse.Cloud.run(fetchPracticeCounts, { practiceId, forAdmin })
      .then(practiceInfo => {
        console.log(
          `${FETCH_PRACTICE_COUNTS} - #practiceCount: ${practiceInfo.counts.length}`
          // `${FETCH_PRACTICE_COUNTS} - practiceInfo: ${JSON.stringify(
          //   practiceInfo
          // )}`
        );
        context.commit(FETCH_PRACTICE_COUNTS_END, practiceInfo);
      })
      .catch(e => {
        // console.log(`error loading classSession list: ${e.message}`);
        console.log(`error loading practice counts: ${JSON.stringify(e)}`);
        throw new Error(e);
      });
  },
  [FILTER_SESSIONS](context, filterText) {
    console.log(
      `${FILTER_SESSIONS} - filterText: ${JSON.stringify(filterText)}`
    );
    context.commit(FILTER_SESSIONS_IN_LIST, filterText);
  },
  [UPDATE_SESSION](classSessionToUpdate) {
    console.log(
      `${UPDATE_SESSION} - classSessionToUpdate: ${JSON.stringify(
        classSessionToUpdate
      )}`
    );
  },
  [RESET_STUDENTS](context, classInfo) {
    context.commit(FETCH_STUDENTS_END, classInfo);
  },
  [FETCH_STUDENTS](context, params) {
    const user = store.state.auth.user;
    const classId = params["classId"];

    console.log(`${FETCH_STUDENTS} - classId: ${classId}`);
    context.commit(FETCH_STUDENTS_START);

    const fetchTeams = "class:fetchTeams";
    Parse.Cloud.run(fetchTeams, {
      user,
      classId
    })
      .then(classInfo => {
        console.log(
          `${fetchTeams} - #classTeams: ${classInfo.classTeams.length}`
          // `${fetchTeams} - classInfo: ${JSON.stringify(classInfo)}`
        );
        context.commit(FETCH_STUDENTS_END, classInfo);
      })
      .catch(e => {
        // console.log(`error loading classTeam list: ${e.message}`);
        console.log(`error loading classTeam list: ${JSON.stringify(e)}`);
        throw new Error(e);
      });
  },
  [FETCH_STATS](context, params) {
    const user = store.state.auth.user;
    const classId = params["classId"];
    var practiceId = params["practiceId"];
    var forAdmin = params["forAdmin"];

    if (typeof forAdmin === "string") {
      forAdmin = forAdmin === "true";
    }

    if (practiceId == "dummy") {
      practiceId = undefined;
    }
    console.log(
      `${FETCH_STATS} - classId: ${classId} practiceId: ${practiceId} forAdmin: ${forAdmin}`
    );
    context.commit(FETCH_STATS_START);

    const fetchStats = "class:fetchStats";

    Parse.Cloud.run(fetchStats, {
      user,
      classId,
      practiceId,
      forAdmin
    })
      .then(classInfo => {
        console.log(
          `${fetchStats} - #classTeam: ${
            classInfo.classTeams.length
          } lastWeek: ${JSON.stringify(classInfo.lastWeek)}`
        );
        // console.log(`${fetchStats} - classInfo: ${JSON.stringify(classInfo)}`);
        context.commit(FETCH_STATS_END, classInfo);
      })
      .catch(e => {
        // console.log(`error loading classTeam list: ${e.message}`);
        console.log(`error in ${fetchStats}: ${JSON.stringify(e)}`);
        throw new Error(e);
      });
  }
};

/* eslint no-param-reassign: ["error", { "props": false }] */
const mutations = {
  [FETCH_PRACTICE_COUNTS_START](state) {
    state.isLoadingPracticeCounts = true;
  },
  [FETCH_PRACTICE_COUNTS_END](state, practiceInfo) {
    state.practiceInfo = practiceInfo;
    state.isLoadingPracticeCounts = false;
  },
  [FETCH_SESSIONS_START](state) {
    state.isLoadingSessions = true;
  },
  [FETCH_SESSIONS_END](state, classInfo) {
    state.classInfo = classInfo;
    state.classSessions = classInfo.classSessions;
    state.sessionDetails = classInfo.sessionDetails;

    state.isLoadingSessions = false;
  },
  [FILTER_SESSIONS_IN_LIST](state, filterText) {
    if (!filterText || filterText == "") {
      state.classSessions = state.classInfo.classSessions;
      state.sessionDetails = state.classInfo.sessionDetails;
    } else {
      state.classSessions = [];
      state.sessionDetails = [];

      for (var i = 0; i < state.classInfo.classSessions.length; i++) {
        const s = state.classInfo.classSessions[i];
        if (
          s
            .get("name")
            .toLowerCase()
            .includes(filterText.toLowerCase())
        ) {
          state.classSessions.push(s);
          state.sessionDetails.push(state.classInfo.sessionDetails[i]);
        }
      }
    }
  },
  [FETCH_STUDENTS_START](state) {
    state.isLoadingStudents = true;
  },
  [FETCH_STUDENTS_END](state, classInfo) {
    state.initComponentKey = Math.floor(Math.random() * 10000 + 1);

    if (classInfo.changed) {
      state.classTeamsChanged = true;
      state.classTeamOptions = state.classTeams.map(e => {
        return { value: e.id, text: e.name };
      });
    } else {
      state.classTeamsChanged = false;
      state.classInfo = classInfo;
      state.removedStudents = [];
      state.classTeams = classInfo.classTeams.map(e => {
        var team = {
          id: e.id,
          index: e.index,
          name: e.name,
          classId: e.classId,
          leader: e.leader
        };
        team.members = e.members.map(m => {
          m.assignedTeamId = null;
          return m;
        });
        return team;
      });

      state.classTeams[0].name = "未分组";
      // state.classTeams[0].id = null;

      state.classTeamOptions = state.classTeams.map(e => {
        return { value: e.id ? e.id : null, text: e.name };
      });

      state.classAdminUsers = [
        { role: "中组长：", displayName: "待定" },
        { role: "副组长：", displayName: "待定" },
        { role: "统计员：", displayName: "待定" }
      ];

      var first = true;
      for (var i = 0; i < state.classInfo.classAdminStudents.length; i++) {
        const user = state.classInfo.classAdminStudents[i];
        if (user) {
          var index = 2;
          if (user.roles.some(role => role == "ClassAdminUser")) {
            index = first ? 0 : 1;
            first = false;
          }
          state.classAdminUsers[index].id = user.id;
          state.classAdminUsers[index].name = user.name;
          state.classAdminUsers[index].displayName = `(${index + 1}) ${
            user.name
          }`;
        }
      }
      state.isLoadingStudents = false;
    }
    // console.log(`state: ${JSON.stringify(state)}`);
  },
  [FETCH_STATS_START](state) {
    state.isLoadingStats = true;
  },
  [FETCH_STATS_END](state, classInfo) {
    state.classInfo = classInfo;
    state.classInfo.canDownloadClassReport = state.classInfo.forAdmin;
    state.classInfo.forAdmin = false;
    state.classTeams = classInfo.classTeams;
    state.isLoadingStats = false;
  }
};

export default {
  state,
  getters,
  actions,
  mutations
};
