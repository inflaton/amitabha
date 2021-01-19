<template>
  <div>
    <b-card class="text-center" :header="classTeam.name">
      <b-card-text v-if="classTeam.dummy">
        将删除 {{ classTeam.members.length }} 名学员
      </b-card-text>
      <b-card-text v-else-if="classTeam.id == null">
        共有 {{ classTeam.members.length }} 名学员未分组
      </b-card-text>
      <b-card-text v-else>
        本组共有 {{ classTeam.members.length }} 名学员
      </b-card-text>
      <b-input-group
        v-for="(member, index) in classTeam.members"
        :key="member.id + index"
        :prepend="
          classTeam.id == null || classTeam.dummy
            ? '学员：'
            : !classTeam.dummy && index == 0
            ? '组长：'
            : '组员：'
        "
        class="mt-3"
      >
        <b-form-input
          v-if="classInfo.forAdmin"
          readonly
          :value="`(${index + 1}) ${member.name}`"
        ></b-form-input>
        <b-form-input
          v-else-if="classInfo.practiceId"
          readonly
          :value="
            `(${index + 1}) ${member.name}\t上周：${
              !member.lastWeek
                ? '未报数'
                : member.lastWeek
                    .toString()
                    .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
            }\t总计：${
              !member.count
                ? '未报数'
                : member.count
                    .toString()
                    .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
            }
            `
          "
        ></b-form-input>
        <b-form-input
          v-else
          readonly
          :value="
            `(${index + 1}) ${member.name}\t上周：${member.lastWeek}\t总计：${
              member.count
            }
            `
          "
        ></b-form-input>
        <b-button
          v-if="isClassAdmin && !classInfo.forAdmin && classInfo.practiceId"
          variant="success"
          v-on:click="setCompleted(index)"
          :disabled="member.completed"
          >{{ member.completed ? "已圆满" : "圆满" }}</b-button
        >
        <b-input-group-append>
          <div v-if="classInfo.forAdmin">
            <b-form-select
              v-if="classTeam.id == null"
              v-model="member.assignedTeamId"
              :options="classTeamOptions"
              v-on:change="assignTeam($event, index)"
            ></b-form-select>
            <b-button
              v-if="!classTeam.dummy && classTeam.id && index > 0"
              variant="info"
              v-on:click="setLeader(index)"
              >设为组长</b-button
            >
            <b-button variant="warning" v-on:click="removeMember(index)">{{
              classTeam.dummy ? "恢复" : "删除"
            }}</b-button>
          </div>
        </b-input-group-append>
      </b-input-group>
    </b-card>
  </div>
</template>

<script>
import Parse from "parse";
import { mapGetters } from "vuex";
import { RESET_STUDENTS } from "../store/actions.type";

export default {
  name: "ClassTeam",
  props: {
    classTeam: { type: Object, required: true }
  },
  data: function() {
    return {
      canAddSubmodule: false
    };
  },
  computed: {
    ...mapGetters([
      "isClassAdmin",
      "classInfo",
      "classTeams",
      "classTeamsChanged",
      "classTeamOptions",
      "removedStudents"
    ])
  },
  methods: {
    assignTeam(value, index) {
      console.log(`selected: ${value} index: ${index}`);
      const member = this.classTeam.members[index];
      this.classTeam.members.splice(index, 1);

      for (var i = 0; i < this.classTeams.length; i++) {
        const team = this.classTeams[i];
        if (team.id == member.assignedTeamId) {
          member.assignedTeamId = null;
          team.members.push(member);
          break;
        }
      }
      this.$store.dispatch(RESET_STUDENTS, { changed: true });
    },
    removeMember(index) {
      const member = this.classTeam.members[index];
      this.classTeam.members.splice(index, 1);

      if (this.classTeam.id) {
        this.classTeams[0].members.push(member);
      } else {
        this.removedStudents.push(member);
      }

      this.$store.dispatch(RESET_STUDENTS, { changed: true });
    },
    setLeader(index) {
      const member = this.classTeam.members[index];
      this.classTeam.members.splice(index, 1);
      this.classTeam.members.splice(0, 0, member);

      this.$store.dispatch(RESET_STUDENTS, { changed: true });
    },
    setCompleted(index) {
      const member = this.classTeam.members[index];

      console.log(`setCompleted - ${JSON.stringify(member)}`);

      var msg = `确认${member.name}已圆满${this.classInfo.practiceName}实修?`;

      const options = {
        okText: "确认",
        cancelText: "取消",
        loader: true // default: false - when set to true, the proceed button shows a loader when clicked; and a dialog object will be passed to the then() callback
      };
      const message = {
        title: this.classInfo.practiceName,
        body: msg
      };
      const thisComponent = this;

      this.$dialog
        .confirm(message, options)
        .then(function(dialog) {
          Parse.Cloud.run("admin:markUserPracticeCompleted", {
            userId: member.id,
            practiceId: thisComponent.classInfo.practiceId
          })
            .then(result => {
              console.log(
                `markUserPracticeCompleted - result: ${JSON.stringify(result)}`
              );
              member.completed = result.completed;
              dialog.close();
              window.location.reload();
            })
            .catch(e => {
              console.log(`error in updateUserStudyRecord: ${e}`);
              dialog.close();
              thisComponent.$dialog.alert(
                `error in updateUserStudyRecord: ${e}`
              );
            });
        })
        .catch(e => {
          console.log(`error: ${e}`);
        });
    }
  }
};
</script>
