import Parse from "parse";
import Toasted from "vue-toasted";
import Vue from "vue";
import { FETCH_SELF_STUDY } from "./actions.type";
import { FETCH_SELF_STUDY_START, FETCH_SELF_STUDY_END } from "./mutations.type";

Vue.use(Toasted);

const state = {
  isLoadingSelfStudy: false,
  selfStudyInfo: {}
};

const getters = {
  isLoadingSelfStudy(st) {
    return st.isLoadingSelfStudy;
  },
  selfStudyInfo(st) {
    return st.selfStudyInfo;
  }
};

const actions = {
  [FETCH_SELF_STUDY](context) {
    context.commit(FETCH_SELF_STUDY_START);

    const fetchInfo = "selfStudy:fetchInfo";
    Parse.Cloud.run(fetchInfo)
      .then(selfStudyInfo => {
        console.log(
          `${fetchInfo} - selfStudyInfo: ${JSON.stringify(selfStudyInfo)}`
        );
        context.commit(FETCH_SELF_STUDY_END, selfStudyInfo);
      })
      .catch(e => {
        console.log(`error loading selfStudyInfo: ${JSON.stringify(e)}`);
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
  }
};

export default {
  state,
  getters,
  actions,
  mutations
};
