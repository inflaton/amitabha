<template>
  <div>
    <div v-if="isLoadingStudents">
      正在获取学员详情...
    </div>
    <div v-else>
      <h3>{{ classInfo.name }} -- 学员管理</h3>
      <ClassAdmin :key="initComponentKey" :forStudentManagement="true" />
      <hr />
      <div class="input-group mb-3">
        <input
          type="text"
          class="form-control"
          aria-describedby="basic-addon2"
          v-model="newClassTeamName"
          placeholder="输入新组名称"
        />
        <b-button variant="info" @click="createClassTeam">创建新组</b-button>
        <b-button
          variant="success"
          v-if="classTeamsChanged"
          @click="submitClassTeams"
          >保存修改</b-button
        >
        <b-button
          variant="warning"
          v-if="classTeamsChanged"
          @click="resetClassTeams"
          >放弃修改</b-button
        >
      </div>
      <ClassTeam
        v-if="removedStudents.length > 0"
        :classTeam="dummyClassTeam()"
      />
      <div
        v-for="(classTeam, index) in classTeams"
        :key="classTeam.id + classTeam.name + index"
      >
        <ClassTeam :classTeam="classTeam" />
        <b-button
          v-if="index > 0"
          block
          variant="warning"
          @click="removeClass(index)"
          >删除本组</b-button
        >
        <hr />
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import ClassTeam from "@/components/ClassTeam";
import ClassAdmin from "@/components/ClassAdmin";
import { FETCH_STUDENTS, RESET_STUDENTS } from "../store/actions.type";
import store from "@/store";
import Parse from "parse";

export default {
  name: "StudentManagement",
  components: {
    ClassTeam,
    ClassAdmin
  },
  computed: {
    ...mapGetters([
      "isLoadingStudents",
      "classInfo",
      "classTeams",
      "isClassAdmin",
      "isSystemAdmin",
      "classTeamsChanged",
      "removedStudents",
      "initComponentKey",
      "classAdminUsers"
    ])
  },
  beforeRouteEnter(to, from, next) {
    store.dispatch(FETCH_STUDENTS, to.params).then(() => {
      next();
    });
  },
  data: function() {
    return {
      newClassTeamName: "",
      creatingClassTeam: false
    };
  },
  methods: {
    dummyClassTeam() {
      return {
        id: `DUMMY_${this.newClassTeamName}_${new Date().getTime()}`,
        dummy: true,
        name: "将删除学员",
        members: this.removedStudents
      };
    },
    createClassTeam() {
      const classTeam = {
        id: `NEW_${this.newClassTeamName}_${new Date().getTime()}`,
        classId: this.classInfo.id,
        name: this.newClassTeamName,
        members: []
      };
      this.newClassTeamName = "";
      this.classTeams.push(classTeam);
      store.dispatch(RESET_STUDENTS, { changed: true });
    },
    removeClass(index) {
      this.classTeams[0].members = this.classTeams[0].members.concat(
        this.classTeams[index].members
      );
      this.classTeams.splice(index, 1);
      store.dispatch(RESET_STUDENTS, { changed: true });
    },
    resetClassTeams() {
      const options = {
        okText: "确认",
        cancelText: "取消",
        loader: true // default: false - when set to true, the proceed button shows a loader when clicked; and a dialog object will be passed to the then() callback
      };
      const message = {
        title: this.classInfo.name,
        body: "放弃所做修改?"
      };
      const thisComponent = this;

      this.$dialog
        .confirm(message, options)
        .then(function(dialog) {
          thisComponent.newClassTeamName = "";
          thisComponent.classInfo.changed = false;
          store.dispatch(RESET_STUDENTS, thisComponent.classInfo);
          dialog.close();
        })
        .catch(e => {
          console.log(`error: ${e}`);
        });
    },
    submitClassTeams() {
      const options = {
        okText: "确认",
        cancelText: "取消",
        loader: true // default: false - when set to true, the proceed button shows a loader when clicked; and a dialog object will be passed to the then() callback
      };
      const message = {
        title: this.classInfo.name,
        body: "保存所做修改?"
      };
      const thisComponent = this;
      const classId = this.classInfo.id;
      const classTeams = this.classTeams.filter(e => e.id);
      const removedStudents = this.removedStudents;
      const classAdminUserIds = this.classAdminUsers.map(e => e.id);
      console.log(
        `updateTeams - classAdminUserIds: ${JSON.stringify(classAdminUserIds)}`
      );

      this.$dialog
        .confirm(message, options)
        .then(function(dialog) {
          Parse.Cloud.run("class:updateTeams", {
            classId,
            classTeams,
            removedStudents,
            classAdminUserIds
          })
            .then(result => {
              console.log(`updateTeams - result: ${JSON.stringify(result)}`);
              window.location.reload();
              dialog.close();
            })
            .catch(e => {
              console.log(`error in updateTeams: ${e}`);
              dialog.close();
              thisComponent.$dialog.alert(`error in updateTeams: ${e}`);
            });
        })
        .catch(e => {
          console.log(`error: ${e}`);
        });
    }
  }
};
</script>
