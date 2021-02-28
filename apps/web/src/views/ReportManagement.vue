<template>
  <div>
    <div v-if="isLoadingStats">正在获取统计信息...</div>
    <div v-else>
      <h3>
        {{ classInfo.name }} --
        {{
          !classInfo.practiceId
            ? "闻思进度统计"
            : `${classInfo.practiceName}实修统计`
        }}
      </h3>
      <div v-if="classInfo.canDownloadClassReport">
        <DownloadReport
          :worksheet="
            !classInfo.practiceId
              ? '中组出席统计'
              : `中组${classInfo.practiceName}统计`
          "
        />
        <!--
        <br v-if="!classInfo.practiceId" />
        <DownloadReport
          v-if="!classInfo.practiceId"
          :worksheet="`中组学修进度统计`"
          :formalStudy="true"
        />
        <br v-if="classInfo.hasSelfStudySessions" />
        <DownloadReport
          v-if="classInfo.hasSelfStudySessions"
          worksheet="中组自学进度统计"
          :selfStudy="true"
        />
        <hr />
        -->
      </div>
      <div
        v-for="(classTeam, index) in classTeams"
        :key="classTeam.id + classTeam.name + index"
      >
        <div v-if="index > 0 && classTeam.members.length > 0">
          <ClassTeam :classTeam="classTeam" />
          <DownloadReport
            :classTeam="classTeam"
            :worksheet="
              !classInfo.practiceId
                ? `${classTeam.name}出席统计`
                : `${classTeam.name}${classInfo.practiceName}统计`
            "
          />
          <!--
          <br v-if="!classInfo.practiceId" />
          <DownloadReport
            v-if="!classInfo.practiceId"
            :classTeam="classTeam"
            :worksheet="`${classTeam.name}学修进度统计`"
            :formalStudy="true"
          />
          <br v-if="classInfo.hasSelfStudySessions" />
          <DownloadReport
            v-if="classInfo.hasSelfStudySessions"
            :classTeam="classTeam"
            :worksheet="`${classTeam.name}自学进度统计`"
            :selfStudy="true"
          />
          <hr />
          -->
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import ClassTeam from "@/components/ClassTeam";
import DownloadReport from "@/components/DownloadReport";
import { FETCH_STATS } from "../store/actions.type";
import store from "@/store";

export default {
  name: "ReportManagement",
  components: {
    ClassTeam,
    DownloadReport
  },
  computed: {
    ...mapGetters([
      "isLoadingStats",
      "classInfo",
      "classTeams",
      "isClassAdmin",
      "isSystemAdmin"
    ])
  },
  beforeRouteEnter(to, from, next) {
    store.dispatch(FETCH_STATS, to.params).then(() => {
      next();
    });
  }
};
</script>
