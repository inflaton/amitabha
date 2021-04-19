<template>
  <div>
    <b-form v-if="editing" @submit="onSubmit" @reset="onReset">
      <h4>{{ this.session.creating ? "创建新课" : session.name }}</h4>
      <b-input-group prepend="选择日期：" class="mt-3">
        <v-date-picker
          locale="zh-CN"
          v-model="session.scheduledAt"
          :input-props="{
            readonly: true
          }"
        />
        <b-input-group-append>
          <b-button v-if="!session.creating" type="reset" variant="warning">
            <b-icon icon="x-circle"></b-icon>
          </b-button>
        </b-input-group-append>
      </b-input-group>
      <b-input-group
        v-if="moduleDropdownOptions.length > 1"
        prepend="选择模块："
        class="mt-3"
      >
        <b-form-select
          v-model="session.moduleId"
          v-on:change="refreshUI"
          :options="moduleDropdownOptions"
        ></b-form-select>
      </b-input-group>
      <b-input-group prepend="选子模块：" class="mt-3">
        <b-form-select
          v-model="session.submoduleId"
          :options="submoduleDropdownOptions"
        ></b-form-select>
        <b-input-group-append>
          <b-button
            v-if="canAddSubmodule"
            variant="warning"
            v-on:click="addSubmodule()"
            >加入上课内容</b-button
          >
          <b-button type="submit" variant="success">
            <b-icon icon="check-circle"></b-icon>
          </b-button>
        </b-input-group-append>
      </b-input-group>
      <div v-if="!classInfo.singleSubmodule">
        <b-input-group
          v-for="(submodule, index) in session.submodules"
          :key="submodule.id + index"
          prepend="上课内容："
          class="mt-3"
        >
          <b-form-input
            readonly
            :value="`(${index + 1}) ${submodule.name}`"
          ></b-form-input>
          <b-input-group-append>
            <b-button variant="warning" v-on:click="removeSubmodule(index)"
              >删除</b-button
            >
          </b-input-group-append>
        </b-input-group>
        <b-input-group
          v-if="session.submodules.length > 0"
          prepend="上课名称："
          class="mt-3"
        >
          <b-form-input v-model="session.name"></b-form-input>
        </b-input-group>
      </div>
      <div v-if="!session.creating">
        <b-input-group prepend="材料链接：" type="url" class="mt-3">
          <b-form-input v-model="session.materialUrl"></b-form-input>
        </b-input-group>
        <b-input-group prepend="材料名称：" class="mt-3">
          <b-form-input v-model="session.materialName"></b-form-input>
          <b-button variant="warning" v-on:click="addMaterial()"
            >加入上课材料</b-button
          >
        </b-input-group>
        <b-input-group
          v-for="(material, index) in session.materials"
          :key="material.url + index"
          prepend="上课材料："
          class="mt-3"
        >
          <b-form-input
            readonly
            :value="`(${index + 1}) ${material.name}`"
          ></b-form-input>
          <b-input-group-append>
            <b-button variant="warning" v-on:click="removeMaterial(index)"
              >删除</b-button
            >
          </b-input-group-append>
        </b-input-group>
      </div>
      <b-form-textarea
        v-model="session.description"
        placeholder="输入上课通知"
        rows="8"
        max-rows="20"
      ></b-form-textarea>
    </b-form>
    <b-card v-else class="text-center" :header="session.name">
      <b-card-text>
        <b-input-group prepend="上课时间：" class="mt-3" v-if="!selfStudy">
          <b-form-input
            readonly
            v-model="session.scheduledAtLocalDateTimeString"
          ></b-form-input>
          <b-input-group-append>
            <b-button
              variant="warning"
              v-if="
                !forApplication &&
                  classInfo &&
                  !session.creating &&
                  (isClassAdmin || isTeachingAssistant)
              "
              v-on:click="editSession"
              >修改</b-button
            >
          </b-input-group-append>
        </b-input-group>
        <b-input-group
          v-if="sessionDetails.submodules.length == 1"
          prepend="课前学习："
          class="mt-3"
        >
          <b-form-input readonly v-model="session.prestudyState"></b-form-input>
          <b-input-group-append>
            <b-button
              variant="success"
              v-if="needToShowPrestudyButton(0)"
              v-on:click="updatePrestudyState(0)"
              >圆满</b-button
            >
            <b-button
              variant="info"
              :href="getFullUrl(sessionDetails.submodules[0].url)"
              target="_blank"
            >
              <b-icon icon="book"></b-icon>
            </b-button>
          </b-input-group-append>
        </b-input-group>
        <div
          v-else
          v-for="(submodule, index) in sessionDetails.submodules"
          :key="submodule.id + index"
        >
          <b-link :href="getFullUrl(submodule.url)" target="_blank">{{
            `(${index + 1}) ${submodule.name}`
          }}</b-link>
          <b-input-group
            :prepend="selfStudy ? '学习进度：' : '课前学习：'"
            class="mt-3"
          >
            <b-form-input
              readonly
              :value="toPrestudyStateString(sessionDetails, index)"
            ></b-form-input>
            <b-input-group-append>
              <b-button
                variant="success"
                v-if="needToShowPrestudyButton(index)"
                v-on:click="updatePrestudyState(index)"
                >圆满</b-button
              >
              <b-button
                variant="info"
                :href="getFullUrl(submodule.url)"
                target="_blank"
              >
                <b-icon icon="book"></b-icon>
              </b-button>
            </b-input-group-append>
          </b-input-group>
        </div>
        <hr />
        <b-input-group
          v-if="!session.forApplication"
          :prepend="selfStudy ? '总体进度：' : '共修出席：'"
          class="mt-3"
        >
          <b-form-input
            readonly
            v-model="session.attendanceState"
          ></b-form-input>
          <b-input-group-append>
            <b-button
              variant="success"
              v-if="needToShowAttendanceButton()"
              v-on:click="updateAttendance(false)"
              >{{ attendanceButtonName(false) }}</b-button
            >
            <b-button
              variant="warning"
              v-if="
                needToShowAttendanceButton() && session.needTwoAttendanceButtons
              "
              v-on:click="updateAttendance(true)"
              >{{ attendanceButtonName(true) }}</b-button
            >
            <b-button
              variant="info"
              v-on:click="session.showMoreDetails = !session.showMoreDetails"
            >
              <b-icon
                v-if="session.showMoreDetails"
                icon="chevron-double-up"
              ></b-icon>
              <b-icon v-else icon="chevron-double-down"></b-icon>
            </b-button>
          </b-input-group-append>
        </b-input-group>
        <div v-if="session.showMoreDetails">
          <b-input-group
            v-for="(material, index) in session.materials"
            :key="material.url + index"
            prepend="上课材料："
            class="mt-3"
          >
            <b-form-input
              readonly
              :value="`(${index + 1}) ${material.name}`"
            ></b-form-input>
            <b-input-group-append>
              <b-button
                variant="info"
                :href="getFullUrl(material.url)"
                target="_blank"
              >
                <b-icon icon="book"></b-icon>
              </b-button>
            </b-input-group-append>
          </b-input-group>
          <b-form-textarea
            v-model="session.description"
            placeholder=""
            rows="8"
            max-rows="20"
            readonly
          ></b-form-textarea>
        </div>
      </b-card-text>
    </b-card>
  </div>
</template>

<script>
import Parse from "parse";
import { mapGetters } from "vuex";

export default {
  name: "ClassSession",
  props: {
    classSession: { type: Object, required: true },
    sessionDetails: { type: Object, required: false },
    classInfo: { type: Object, required: false },
    newSessions: { type: Array, required: false },
    forApplication: Boolean,
    forAdmin: Boolean,
    selfStudy: Boolean,
    classId: String
  },
  data: function() {
    return {
      session: this.classSession.dummy
        ? { creating: true, editing: true, submodules: [] }
        : this.initSession(),
      moduleDropdownOptions: [],
      submoduleDropdownOptions: [],
      editing: this.classSession.dummy,
      canAddSubmodule: false
    };
  },
  computed: {
    ...mapGetters(["isClassAdmin", "isTeachingAssistant", "isStudent"])
  },
  mounted() {
    this.refreshUI();
  },
  methods: {
    initSession() {
      return {
        id: this.classSession.id,
        forApplication: this.classInfo
          ? this.classInfo.forApplication
          : this.forApplication,
        name: this.classSession.get("name"),
        submodules: [].concat(this.sessionDetails.submodules),
        materials: this.classSession.get("content").materials
          ? [].concat(this.classSession.get("content").materials)
          : [],
        description: this.classSession.get("description"),
        scheduledAt: this.classSession.get("scheduledAt"),
        scheduledAtLocalDateTimeString: this.toLocalDateTimeString(
          this.classSession.get("scheduledAt")
        ),
        showMoreDetails: false,
        attendanceState: this.toAttendanceStateString(this.sessionDetails),
        needTwoAttendanceButtons: this.checkIfTwoAttendanceButtonsNeeded(),
        prestudyState: this.toPrestudyStateString(this.sessionDetails, 0)
      };
    },
    refreshUI() {
      this.moduleDropdownOptions = [];
      this.submoduleDropdownOptions = [];
      if (!this.editing) {
        return;
      }

      this.moduleDropdownOptions = this.classInfo.modules.map(e => {
        return {
          value: e.id,
          text: e.name
        };
      });

      const session = this.session;

      var selectedModule;
      for (var i = 0; i < this.classInfo.modules.length; i++) {
        selectedModule = this.classInfo.modules[i];
        if (!session.moduleId || session.moduleId == selectedModule.id) {
          if (!session.moduleId) {
            session.moduleId = selectedModule.id;
          }
          this.submoduleDropdownOptions = this.submoduleDropdownOptions.concat(
            selectedModule.newSubmodules
          );
          console.log(`refreshUI - selectedModule: ${selectedModule.name}`);
          break;
        }
      }

      if (!this.classSession.dummy && selectedModule) {
        for (i = 0; i < this.sessionDetails.submodules.length; i++) {
          const submodule = this.sessionDetails.submodules[i];
          if (submodule.moduleId == selectedModule.id) {
            this.submoduleDropdownOptions.push(submodule);
            console.log(`refreshUI - pushed: ${submodule.name}`);
          }
        }
      }

      if (!this.classInfo.singleSubmodule && selectedModule) {
        for (i = 0; i < this.session.submodules.length; i++) {
          const submodule = this.session.submodules[i];
          if (submodule.moduleId == selectedModule.id) {
            this.submoduleDropdownOptions = this.submoduleDropdownOptions.filter(
              e => {
                return e.id != submodule.id;
              }
            );
          }
        }
      }

      if (this.submoduleDropdownOptions.length > 0) {
        this.submoduleDropdownOptions.sort((s1, s2) => {
          var a = s1.index;
          var b = s2.index;
          return a > b ? 1 : b > a ? -1 : 0;
        });

        const selectedSubmodule =
          this.classInfo.singleSubmodule && !this.classSession.dummy
            ? this.session.submodules[0]
            : this.submoduleDropdownOptions[0];
        console.log(`refreshUI - selectedSubmodule: ${selectedSubmodule.name}`);

        this.session.submoduleId = selectedSubmodule.id;
        this.canAddSubmodule = !this.classInfo.singleSubmodule;
      } else {
        this.canAddSubmodule = false;
      }

      this.submoduleDropdownOptions = this.submoduleDropdownOptions.map(e => {
        return {
          value: e.id,
          text: e.name
        };
      });
    },
    addSubmodule() {
      const session = this.session;
      console.log(
        `addSubmodule - moduleId: ${session.moduleId} submoduleId: ${session.submoduleId}`
      );

      var selectedModule;
      var selectedSubmodule;

      for (var i = 0; i < this.classInfo.modules.length; i++) {
        selectedModule = this.classInfo.modules[i];
        if (!session.moduleId || session.moduleId == selectedModule.id) {
          console.log(`addSubmodule - selectedModule: ${selectedModule.name}`);
          break;
        }
      }

      if (this.sessionDetails) {
        for (i = 0; i < this.sessionDetails.submodules.length; i++) {
          const submodule = this.sessionDetails.submodules[i];
          if (submodule.id == session.submoduleId) {
            selectedSubmodule = submodule;
            session.submodules.push(selectedSubmodule);
            console.log(
              `addSubmodule - selectedSubmodule: ${selectedSubmodule.name}`
            );
            break;
          }
        }
      }

      if (!selectedSubmodule && selectedModule) {
        for (i = 0; i < selectedModule.newSubmodules.length; i++) {
          const submodule = selectedModule.newSubmodules[i];
          if (submodule.id == session.submoduleId) {
            selectedSubmodule = submodule;
            session.submodules.push(selectedSubmodule);
            console.log(
              `addSubmodule - selectedSubmodule: ${selectedSubmodule.name}`
            );
            if (!session.name || this.classInfo.singleSubmodule) {
              session.name = selectedSubmodule.name;
            }
            break;
          }
        }
      }
      if (!this.classInfo.singleSubmodule) {
        this.refreshUI();
      }
    },
    removeSubmodule(index) {
      this.session.submodules.splice(index, 1);
      this.refreshUI();
    },
    addMaterial() {
      this.session.materials.push({
        name: this.session.materialName,
        url: this.session.materialUrl
      });
      this.session.materialName = "";
      this.session.materialUrl = "";
    },
    removeMaterial(index) {
      this.session.materials.splice(index, 1);
    },
    getFullUrl(url) {
      if (!(url.includes("://") || url.indexOf("//") === 0)) {
        const parentUrl = process.env.VUE_APP_PARENT_URL;
        if (!url.startsWith(parentUrl)) {
          return parentUrl + url.replace("..", "");
        }
      }
      return url;
    },
    toLocalDateTimeString(date) {
      const options = {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "numeric"
      };
      var result = date.toLocaleDateString("zh-CN", options);
      return result.startsWith("20") ? result.substring(2) : result;
    },
    toLocalDateString(date) {
      const options = {
        year: "numeric",
        month: "short",
        day: "numeric"
      };
      var result = date.toLocaleDateString("zh-CN", options);
      return result.startsWith("20") ? result.substring(2) : result;
    },
    needToShowAttendanceButton() {
      if (
        !this.selfStudy &&
        this.isStudent &&
        !this.forAdmin &&
        !this.forApplication
      ) {
        return true;
      }
      if (this.selfStudy && !this.forAdmin) {
        const progress = this.studyProgress();
        if (progress.total == progress.completed) {
          const sessionDetails = this.sessionDetails;
          return !sessionDetails.attendance.attendance;
        }
      }
      return false;
    },
    checkIfTwoAttendanceButtonsNeeded() {
      const d = new Date();
      const sessionDetails = this.sessionDetails;
      if (
        !this.selfStudy &&
        sessionDetails &&
        d >= this.classSession.get("scheduledAt")
      ) {
        if (sessionDetails.attendance.onLeave) {
          return false;
        }
        return sessionDetails.attendance.attendance == undefined;
      }

      return false;
    },
    studyProgress() {
      const sessionDetails = this.sessionDetails;
      const total = sessionDetails.submodules.length;
      var completed = 0;
      for (var i = 0; i < total; i++) {
        if (sessionDetails.submodules[i].studyRecord.lineage) {
          completed++;
        }
      }
      return { total, completed };
    },
    toAttendanceStateString(sessionDetails) {
      if (sessionDetails) {
        if (typeof sessionDetails.attendance.attendance == "number") {
          return `${sessionDetails.attendance.attendance}人已${
            this.selfStudy ? "圆满" : "上课"
          }`;
        }
        if (sessionDetails.attendance.onLeave) {
          return "请假";
        }
        if (sessionDetails.attendance.attendance == true) {
          return this.selfStudy ? "全部圆满" : "已上课";
        }
        if (!this.selfStudy && sessionDetails.attendance.attendance == false) {
          return "未上课";
        }
      }

      if (this.selfStudy) {
        const progress = this.studyProgress();
        if (progress.completed > 0) {
          return `已圆满 ${progress.completed}/${progress.total}`;
        }
        return "尚未开始学习";
      }

      return "未报出席";
    },
    toPrestudyStateString(sessionDetails, index) {
      if (this.forApplication) {
        return this.selfStudy ? "请自行安排时间学习" : "请在课前完成学习";
      }
      var chuanCheng = "未看传承";
      var faBen = "未看法本";
      var showStats = false;
      if (
        sessionDetails &&
        sessionDetails.submodules.length > 0 &&
        sessionDetails.submodules[index].studyRecord
      ) {
        const studyRecord = sessionDetails.submodules[index].studyRecord;
        if (typeof studyRecord.lineage == "number") {
          showStats = true;
          chuanCheng = `${studyRecord.lineage}人已看传承`;
          faBen = `${studyRecord.textbook}人已看法本`;
        } else if (studyRecord.lineage && studyRecord.textbook) {
          return "已圆满";
        }
      }

      return !showStats ? "未圆满" : `${chuanCheng}/${faBen}`;
    },
    needToShowPrestudyButton(index) {
      if (this.forApplication || this.forAdmin) {
        return false;
      }
      const sessionDetails = this.sessionDetails;
      if (sessionDetails && sessionDetails.submodules[index].studyRecord) {
        const studyRecord = sessionDetails.submodules[index].studyRecord;
        return !studyRecord.lineage || !studyRecord.textbook;
      }
      return false;
    },
    updatePrestudyState(index) {
      console.log(`updatePrestudyState - ${index}`);

      var msg = `确认已圆满${this.selfStudy ? "学习" : "传承和法本?"}`;
      const sessionDetails = this.sessionDetails;

      const options = {
        okText: "确认",
        cancelText: "取消",
        loader: true // default: false - when set to true, the proceed button shows a loader when clicked; and a dialog object will be passed to the then() callback
      };
      const message = {
        title: sessionDetails.submodules[index].name,
        body: msg
      };
      const thisComponent = this;
      const userStudyRecord = { lineage: true, textbook: true };

      this.$dialog
        .confirm(message, options)
        .then(function(dialog) {
          Parse.Cloud.run("home:updateUserStudyRecord", {
            pathname: sessionDetails.submodules[index].url,
            userStudyRecord
          })
            .then(result => {
              console.log(
                `updateUserStudyRecord - result: ${JSON.stringify(result)}`
              );
              sessionDetails.submodules[index].studyRecord = result;
              if (index == 0) {
                thisComponent.session.prestudyState = thisComponent.toPrestudyStateString(
                  sessionDetails,
                  0
                );
              }
              if (thisComponent.selfStudy) {
                thisComponent.session.attendanceState = thisComponent.toAttendanceStateString(
                  thisComponent.sessionDetails
                );
              }
              dialog.close();
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
    },
    attendanceButtonName(secondButton) {
      if (secondButton) {
        return "未上课";
      }
      if (this.selfStudy) {
        return "全部圆满";
      }
      const d = new Date();
      if (d < this.classSession.get("scheduledAt")) {
        if (this.sessionDetails.attendance.onLeave) {
          return "取消请假";
        }
        return "我要请假";
      } else {
        if (this.session.needTwoAttendanceButtons) {
          return "已上课";
        }
        return "我要改出席";
      }
    },
    updateAttendance(secondButton) {
      const d = new Date();
      var msg = "确认";
      var attendance = this.sessionDetails.attendance;
      if (d < this.classSession.get("scheduledAt")) {
        if (attendance.onLeave) {
          attendance.onLeave = false;
          msg += "取消请假";
        } else {
          attendance.onLeave = true;
          attendance.attendance = false;
          msg += "请假";
        }
      } else {
        if (secondButton || attendance.attendance) {
          attendance.attendance = false;
          msg += "没有上课";
        } else {
          attendance.attendance = true;
          attendance.onLeave = false;
          msg += this.selfStudy ? "已全部圆满" : "已上课";
        }
      }

      const classId = this.classId ? this.classId : this.classInfo.id;
      const sessionId = this.classSession.id;
      const options = {
        okText: "确认",
        cancelText: "取消",
        loader: true // default: false - when set to true, the proceed button shows a loader when clicked; and a dialog object will be passed to the then() callback
      };
      const message = {
        title: this.session.name,
        body: msg + "?"
      };
      const thisComponent = this;
      console.log(
        `updateAttendanceV2 - attendance: ${JSON.stringify(attendance)}`
      );

      this.$dialog
        .confirm(message, options)
        .then(function(dialog) {
          Parse.Cloud.run("home:updateAttendanceV2", {
            classId,
            sessionId,
            attendance
          })
            .then(result => {
              console.log(
                `updateAttendanceV2 - result: ${JSON.stringify(result)}`
              );
              if (result.attendance.onLeave != undefined) {
                thisComponent.sessionDetails.attendance.onLeave =
                  result.attendance.onLeave;
              }
              if (result.attendance.attendance != undefined) {
                thisComponent.sessionDetails.attendance.attendance =
                  result.attendance.attendance;
              }
              thisComponent.session.attendanceState = thisComponent.toAttendanceStateString(
                thisComponent.sessionDetails
              );
              thisComponent.session.needTwoAttendanceButtons = false;
              dialog.close();
            })
            .catch(e => {
              console.log(`error in updateAttendanceV2: ${e}`);
              dialog.close();
              thisComponent.$dialog.alert(`error in updateAttendance: ${e}`);
            });
        })
        .catch(e => {
          console.log(`error: ${e}`);
        });
    },
    editSession() {
      this.session = this.initSession();
      this.editing = true;
      this.refreshUI();
    },
    onReset(evt) {
      evt.preventDefault();
      this.session = this.initSession();
      this.editing = false;
    },
    onSubmit(evt) {
      evt.preventDefault();

      if (this.classInfo.singleSubmodule) {
        if (this.session.submodules.length > 0) {
          this.session.submodules.splice(0, 1);
        }
        this.addSubmodule();
      }
      const session = this.session;
      console.log(`session.submodules: ${JSON.stringify(session.submodules)}`);

      if (!session.scheduledAt) {
        this.$dialog.alert("请输入上课时间！", {
          okText: "知道了"
        });
        return;
      }

      const options = {
        okText: "确认",
        cancelText: "取消",
        loader: true // default: false - when set to true, the proceed button shows a loader when clicked; and a dialog object will be passed to the then() callback
      };
      const message = {
        title: this.classInfo.name,
        body: `${session.creating ? "创建新课" : "修改"} 《${
          session.name
        }》 @ ${this.toLocalDateString(session.scheduledAt)}？`
      };

      var dt = new Date(session.scheduledAt);
      if (this.classInfo.url.includes("sdjkb")) {
        dt.setHours(this.classInfo.url.includes("rpsxl") ? 9 : 14); //TODO: allow setting time
      } else {
        dt.setHours(8); //TODO: allow setting time
      }
      session.scheduledAt = dt;
      // console.log(`session.scheduledAt: ${session.scheduledAt}`);
      session.classId = this.classInfo.id;

      const thisComponent = this;

      this.$dialog
        .confirm(message, options)
        .then(function(dialog) {
          Parse.Cloud.run("class:updateClassSessionV2", { session })
            .then(result => {
              console.log(
                `updateClassSession - result: ${JSON.stringify(result)}`
              );
              dialog.close();
              // thisComponent.$router.go();
              window.location.reload();
            })
            .catch(e => {
              console.log(`error in updateClassSession: ${JSON.stringify(e)}`);
              dialog.close();
              thisComponent.$dialog.alert(`error in updateClassSession: ${e}`);
            });
        })
        .catch(e => {
          console.log(`error: ${e}`);
        });
    }
  }
};
</script>
