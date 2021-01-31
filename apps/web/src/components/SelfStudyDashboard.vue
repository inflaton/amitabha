<template>
  <div class="user-preview">
    <div v-if="dashboard.modules.length === 0" class="user-preview">
      您还没有开始闻思！
      <hr />
    </div>
    <h4 v-if="dashboard.modules.length > 0">正在闻思</h4>
    <div v-for="(module, index) in dashboard.modules" :key="module.id + index">
      <Module
        :parseModule="module"
        :moduleDetails="dashboard.moduleDetails[index]"
        :submodules="dashboard.moduleDetails[index].submodules"
      />
      <b-button block variant="info" @click="showModuleDetails(module)"
        >查看详情</b-button
      >
      <hr />
    </div>
    <div v-if="dashboard.practices.length === 0" class="user-preview">
      您还没有开始实修！
      <hr />
    </div>
    <h4 v-if="dashboard.practices.length > 0">正在实修</h4>
    <div
      v-for="(practice, index) in dashboard.practices"
      :key="practice.id + index"
    >
      <Practice
        :practice="practice"
        :latestPracticeCount="dashboard.counts[index]"
        :practiceSubmodules="dashboard.practiceSubmodules[index]"
      />
      <b-button block variant="info" @click="listPracticeCount(practice)"
        >查看详情</b-button
      >
      <hr />
    </div>
    <b-button block variant="warning" @click="manageSelfStudy()"
      >自修管理</b-button
    >
  </div>
</template>

<script>
import Module from "./Module.vue";
import Practice from "./Practice";

export default {
  name: "SelfStudyDashboard",
  props: {
    dashboard: { type: Object, required: true }
  },
  components: {
    Practice,
    Module
  },
  methods: {
    showModuleDetails(module) {
      this.$router.push({
        name: "study-records",
        params: {
          moduleId: module.id
        }
      });
    },
    listPracticeCount(practice) {
      this.$router.push({
        name: "count-list",
        params: {
          practiceId: practice.id,
          forAdmin: false
        }
      });
    },
    manageSelfStudy() {
      this.$router.push({
        name: "self-study-management",
        params: {}
      });
    }
  }
};
</script>
