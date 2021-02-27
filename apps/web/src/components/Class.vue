<template>
  <div>
    <h3 v-text="buddhaClass.name" />
    <h4>
      主持人：{{ teachers }} 师兄&nbsp;&nbsp;
      <a
        v-if="buddhaClass.url"
        :href="getFullUrl(buddhaClass.url)"
        target="_blank"
        >学习资料网页</a
      >
    </h4>
    <div v-if="buddhaClass.classSnapshot">
      <b-table
        striped
        hover
        :items="items"
        thead-class="hidden_header"
      ></b-table>
      <b-button block variant="info" @click="listStudent">学员管理</b-button>
    </div>
    <div v-if="forApplication">
      <b-button block variant="info" @click="listSession">查看详情</b-button>
      <hr />
    </div>
    <div v-else>
      <div>
        <h4>正在闻思</h4>
        <div v-if="buddhaClass.classSessions.length === 0">
          还没有开课，敬请期待！
        </div>
        <ClassSession
          v-for="(classSession, index) in buddhaClass.classSessions"
          :classId="buddhaClass.id"
          :classSession="classSession"
          :sessionDetails="buddhaClass.sessionDetails[index]"
          :key="classSession.id + index"
          :forApplication="forApplication"
          :forAdmin="buddhaClass.classSnapshot != undefined"
        />
        <b-button block variant="info" @click="listSession">查看详情</b-button>
        <b-button
          v-if="buddhaClass.canDownloadReports"
          block
          variant="info"
          @click="downloadReports('dummy')"
          >闻思进度统计</b-button
        >
        <hr />
        <h4 v-if="buddhaClass.practices.length > 0">正在实修</h4>
        <div
          v-for="(practice, index) in buddhaClass.practices"
          :key="practice.id + index"
        >
          <Practice
            :practice="practice"
            :latestPracticeCount="buddhaClass.counts[index]"
            :practiceSubmodules="buddhaClass.practiceSubmodules[index]"
            :forAdmin="buddhaClass.classSnapshot != undefined"
          />
          <b-button block variant="info" @click="listPracticeCount(practice)"
            >查看详情</b-button
          >
          <b-button
            v-if="buddhaClass.canDownloadReports"
            block
            variant="info"
            @click="downloadReports(practice.id)"
            >实修统计</b-button
          >
          <hr />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ClassSession from "./ClassSession";
import Practice from "./Practice";
import { mapGetters } from "vuex";

export default {
  name: "Class",
  components: {
    ClassSession,
    Practice
  },
  props: {
    buddhaClass: { type: Object, required: true },
    forApplication: Boolean
  },
  data: function() {
    return {
      teachers: this.buddhaClass.teachers.join(),
      items: this.buddhaClass.classSnapshot
        ? [
            {
              key: "学生人数",
              value: this.buddhaClass.classSnapshot.studentCount
            },
            {
              key: "已计划上课",
              value: this.buddhaClass.classSnapshot.sessionScheduled
            },
            {
              key: " 已完成上课",
              value: this.buddhaClass.classSnapshot.sessionCompleted
            }
          ]
        : []
    };
  },
  computed: {
    ...mapGetters(["isClassAdmin", "isTeachingAssistant"])
  },
  methods: {
    getFullUrl(url) {
      if (!(url.includes("://") || url.indexOf("//") === 0)) {
        const parentUrl = process.env.VUE_APP_PARENT_URL;
        if (!url.startsWith(parentUrl)) {
          return parentUrl + url.replace("..", "");
        }
      }
      return url;
    },
    listSession() {
      this.$router.push({
        name: "session-management",
        params: {
          classId: this.buddhaClass.id,
          forApplication: this.forApplication,
          forAdmin: this.buddhaClass.classSnapshot != undefined,
          loadingNewSessions: this.isClassAdmin || this.isTeachingAssistant
        }
      });
    },
    listPracticeCount(practice) {
      this.$router.push({
        name: "count-list",
        params: {
          practiceId: practice.id,
          forAdmin: this.buddhaClass.classSnapshot != undefined
        }
      });
    },
    listStudent() {
      this.$router.push({
        name: "student-management",
        params: {
          classId: this.buddhaClass.id
        }
      });
    },
    downloadReports(practiceId) {
      console.log(`downloadReports - practiceId: ${practiceId}`);
      this.$router.push({
        name: "report-management",
        params: {
          classId: this.buddhaClass.id,
          practiceId,
          forAdmin:
            this.buddhaClass.classSnapshot != undefined ||
            this.buddhaClass.canDownloadReports == true
        }
      });
    }
  }
};
</script>

<style>
.hidden_header {
  display: none;
}
</style>
