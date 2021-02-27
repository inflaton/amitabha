<template>
  <div>
    <!--
    <div v-if="!classInfo.forAdmin && !classInfo.forApplication">
      <DownloadReport
        :forSelf="true"
        :worksheet="selfStudy ? '自学进度统计' : '出席统计'"
        :selfStudy="selfStudy"
      />
      <br />
      <DownloadReport
        v-if="!selfStudy"
        :forSelf="true"
        worksheet="学修进度统计"
        :formalStudy="true"
      />
      <hr />
    </div>
    -->
    <div class="input-group mb-3" v-if="!selfStudy">
      <input
        type="text"
        class="form-control"
        aria-describedby="basic-addon2"
        v-model="filterText"
        v-on:change="filterSessions(filterText)"
        placeholder="搜索"
      />
      <div class="input-group-append">
        <button
          class="btn btn-outline-secondary"
          type="button"
          @click="clearFilter"
        >
          清除
        </button>
        <b-button
          variant="warning"
          v-if="classInfo.forApplication"
          v-on:click="applyClass()"
          >我要报名</b-button
        >
        <b-button
          variant="warning"
          v-if="
            !classInfo.forApplication && (isClassAdmin || isTeachingAssistant)
          "
          @click="createSession"
          >{{ creatingSession ? "取消创建" : "创建新课" }}</b-button
        >
      </div>
    </div>
    <div v-if="classSessions.length === 0">
      没有找到上课记录！
    </div>
    <ClassSession
      v-if="creatingSession"
      :classInfo="classInfo"
      :classSession="newClassSession"
    />
    <ClassSession
      v-for="(classSession, index) in classSessions"
      :classInfo="classInfo"
      :forApplication="classInfo.forApplication"
      :forAdmin="classInfo.forAdmin"
      :classSession="classSession"
      :sessionDetails="sessionDetails[index]"
      :key="classSession.id + index"
      :selfStudy="selfStudy"
    />
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import ClassSession from "@/components/ClassSession";
import DownloadReport from "@/components/DownloadReport";
import { FILTER_SESSIONS } from "../store/actions.type";
import Parse from "parse";

export default {
  name: "ClassSessionDetails",
  components: {
    ClassSession,
    DownloadReport
  },
  props: {
    classSessions: { type: Array, required: true },
    sessionDetails: { type: Array, required: true },
    selfStudy: Boolean
  },
  computed: {
    ...mapGetters([
      "classInfo",
      "isClassAdmin",
      "isTeachingAssistant",
      "isStudent"
    ])
  },
  data: function() {
    return {
      filterText: "",
      creatingSession: false,
      newClassSession: { dummy: true },
      newAttendance: { dummy: true }
    };
  },
  methods: {
    filterSessions(filterText) {
      this.$store.dispatch(FILTER_SESSIONS, filterText);
    },
    clearFilter() {
      this.filterText = "";
      this.$store.dispatch(FILTER_SESSIONS, this.filterText);
    },
    createSession() {
      this.creatingSession = !this.creatingSession;
    },
    applyClass() {
      const classId = this.classInfo.id;
      const options = {
        okText: "确认",
        cancelText: "取消"
      };
      const message = {
        title: this.classInfo.name,
        body: `南无阿弥陀佛！真的要报名？`
      };
      const thisComponent = this;

      console.log(`applyClass - classId: ${classId}`);

      this.$dialog
        .confirm(message, options)
        .then(function() {
          Parse.Cloud.run("class:apply", {
            classId
          })
            .then(result => {
              console.log(`class:apply - result: ${JSON.stringify(result)}`);

              thisComponent.$router.push({ name: "home" });
            })
            .catch(e => {
              console.log(`error in class:apply: ${e}`);
            });
        })
        .catch(e => {
          console.log(`error: ${e}`);
        });
    }
  }
};
</script>
