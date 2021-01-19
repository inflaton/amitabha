<template>
  <div>
    <div v-if="isLoadingSessions">
      正在获取课程详情...
    </div>
    <div v-else>
      <h3 v-text="classInfo.name" />
      <div
        v-if="classInfo.selfStudySessions && classInfo.selfStudySessions.length"
      >
        <b-tabs pills content-class="mt-3" align="center">
          <b-tab title="正式学修课程" title-item-class="mytab" acitve>
            <ClassSessionDetails
              :classSessions="classSessions"
              :sessionDetails="sessionDetails"
            />
          </b-tab>
          <b-tab title="限制性学修课程" title-item-class="mytab" acitve>
            <ClassSessionDetails
              :selfStudy="true"
              :classSessions="classInfo.selfStudySessions"
              :sessionDetails="classInfo.selfStudySessionDetails"
            />
          </b-tab>
        </b-tabs>
      </div>
      <ClassSessionDetails
        v-else
        :classSessions="classSessions"
        :sessionDetails="sessionDetails"
      />
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import ClassSessionDetails from "@/components/ClassSessionDetails";
import { FETCH_SESSIONS } from "../store/actions.type";
import store from "@/store";

export default {
  name: "SessionManagement",
  components: {
    ClassSessionDetails
  },
  computed: {
    ...mapGetters([
      "isLoadingSessions",
      "classInfo",
      "classSessions",
      "sessionDetails",
      "isClassAdmin",
      "isTeachingAssistant",
      "isStudent"
    ])
  },
  beforeRouteEnter(to, from, next) {
    store.dispatch(FETCH_SESSIONS, to.params).then(() => {
      next();
    });
  },
  data: function() {
    return {};
  },
  methods: {}
};
</script>

<style>
.nav-pills li {
  list-style-type: none;
}

.nav-pills .mytab .nav-link:not(.active) {
  background-color: red !important;
  font-size: 22px;
}

.nav-pills .mytab .nav-link {
  background-color: blue !important;
  font-size: 22px;
}
</style>
