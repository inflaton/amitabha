import Parse from "parse";
import Toasted from "vue-toasted";
import Vue from "vue";
import { FETCH_SELF_STUDY, FETCH_MODULE_DETAILS } from "./actions.type";
import {
  FETCH_SELF_STUDY_START,
  FETCH_SELF_STUDY_END,
  FETCH_MODULE_DETAILS_START,
  FETCH_MODULE_DETAILS_END
} from "./mutations.type";

Vue.use(Toasted);

const state = {
  isLoadingSelfStudy: false,
  isLoadingModuleInfo: false,
  selfStudyInfo: {},
  userModuleInfo: {}
};

const getters = {
  isLoadingSelfStudy(st) {
    return st.isLoadingSelfStudy;
  },
  selfStudyInfo(st) {
    return st.selfStudyInfo;
  },
  userModuleInfo(st) {
    return st.userModuleInfo;
  },
  isLoadingModuleInfo(st) {
    return st.isLoadingModuleInfo;
  }
};

const actions = {
  [FETCH_SELF_STUDY](context) {
    context.commit(FETCH_SELF_STUDY_START);

    const fetchInfo = "selfStudy:fetchInfo";
    Parse.Cloud.run(fetchInfo)
      .then(selfStudyInfo => {
        console.log(
          // `${fetchInfo} - selfStudyInfo: ${JSON.stringify(selfStudyInfo)}`
          `${fetchInfo} - selfStudyInfo: ${selfStudyInfo}`
        );
        context.commit(FETCH_SELF_STUDY_END, selfStudyInfo);
      })
      .catch(e => {
        console.log(`error loading selfStudyInfo: ${JSON.stringify(e)}`);
        throw new Error(e);
      });
  },
  [FETCH_MODULE_DETAILS](context, params) {
    context.commit(FETCH_MODULE_DETAILS_START);

    const fetchInfo = "selfStudy:fetchModuleInfo";
    Parse.Cloud.run(fetchInfo, { moduleId: params["moduleId"] })
      .then(userModuleInfo => {
        console.log(
          // `${fetchInfo} - userModuleInfo: ${JSON.stringify(userModuleInfo)}`
          `${fetchInfo} - userModuleInfo progress: ${userModuleInfo.completedSubmodules}/${userModuleInfo.totalSubmodules}`
        );
        context.commit(FETCH_MODULE_DETAILS_END, userModuleInfo);
      })
      .catch(e => {
        console.log(`error loading userModuleInfo: ${JSON.stringify(e)}`);
        throw new Error(e);
      });
  }
};

/* eslint no-param-reassign: ["error", { "props": false }] */
const mutations = {
  [FETCH_SELF_STUDY_START](st) {
    st.isLoadingSelfStudy = true;
  },
  [FETCH_SELF_STUDY_END](st, selfStudyInfo) {
    st.selfStudyInfo = selfStudyInfo;
    st.isLoadingSelfStudy = false;
  },
  [FETCH_MODULE_DETAILS_START](st) {
    st.isLoadingModuleInfo = true;
  },
  [FETCH_MODULE_DETAILS_END](st, userModuleInfo) {
    st.userModuleInfo = userModuleInfo;
    st.isLoadingModuleInfo = false;
  }
};

export default {
  state,
  getters,
  actions,
  mutations
};
