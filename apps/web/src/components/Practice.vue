<template>
  <div>
    <b-card class="text-center" :header="practiceObj.name">
      <b-card-text>
        <b-input-group
          :prepend="forAdmin ? '统计日期：' : '最新报数：'"
          class="mt-3"
        >
          <b-form-input
            readonly
            v-model="practiceCountObj.latestCount"
          ></b-form-input>
          <b-input-group-append>
            <b-button
              variant="info"
              v-on:click="
                practiceObj.showDescription = !practiceObj.showDescription
              "
            >
              <b-icon
                v-if="practiceObj.showDescription"
                icon="chevron-double-up"
              ></b-icon>
              <b-icon v-else icon="chevron-double-down"></b-icon>
            </b-button>
          </b-input-group-append>
        </b-input-group>
        <b-input-group prepend="总计报数：" class="mt-3">
          <b-form-input
            readonly
            v-model="practiceCountObj.accumulatedCount"
          ></b-form-input>
          <b-input-group-append>
            <b-button
              v-if="isStudent && !forAdmin"
              variant="warning"
              v-on:click="toggleReportingCount()"
              >{{
                practiceObj.showReportingCount ? "完成报数" : "我要报数"
              }}</b-button
            >
          </b-input-group-append>
        </b-input-group>
        <b-form @submit="onSubmit" v-if="practiceObj.showReportingCount">
          <b-input-group prepend="选择日期：" class="mt-3">
            <v-date-picker
              locale="zh-CN"
              v-model="practiceObj.newCountReportedAt"
              :min-date="minDateForCountReporting()"
              :max-date="new Date()"
              :input-props="{
                readonly: true
              }"
            />
            <b-input-group-append v-if="practiceSubmodules.length > 0">
              <b-button type="submit" variant="primary">提交</b-button>
            </b-input-group-append>
          </b-input-group>
          <div v-if="practiceSubmodules.length > 0">
            <b-input-group prepend="输入小时：" class="mt-3">
              <b-form-input
                id="input-hours"
                v-model="practiceObj.newDurationHours"
                type="number"
                placeholder="多少小时？"
              ></b-form-input>
            </b-input-group>
            <b-input-group prepend="输入分钟：" class="mt-3">
              <b-form-input
                id="input-minutes"
                v-model="practiceObj.newDurationMinutes"
                type="number"
                placeholder="多少分钟？"
              ></b-form-input>
            </b-input-group>
            <b-input-group prepend="选择修法：" class="mt-3">
              <select v-model="practiceObj.submoduleId">
                <option
                  v-for="session in practiceSubmodules"
                  v-bind:key="session.id"
                  v-bind:value="session.id"
                  >{{ session.name }}</option
                >
              </select>
              <b-input-group-append>
                <b-button variant="success" v-on:click="addPracticeSession()"
                  >增加</b-button
                >
              </b-input-group-append>
            </b-input-group>
            <b-input-group
              v-for="(session, index) in practiceObj.sessions"
              :key="session.id + index"
              prepend="实修座次："
              class="mt-3"
            >
              <b-form-input
                readonly
                :value="
                  `(${index + 1}) ${session.name}：${session.duration}分钟`
                "
              ></b-form-input>
              <b-input-group-append>
                <b-button
                  variant="warning"
                  v-on:click="removePracticeSession(index)"
                  >删除</b-button
                >
              </b-input-group-append>
            </b-input-group>
          </div>
          <b-input-group v-else prepend="输入报数：" class="mt-3">
            <b-form-input
              id="input-count"
              v-model="practiceObj.newCount"
              type="number"
              placeholder="输入报数"
            ></b-form-input>
            <b-input-group-append>
              <b-button type="submit" variant="primary">提交</b-button>
            </b-input-group-append>
          </b-input-group>
        </b-form>
        <b-form-textarea
          v-if="practiceObj.showDescription"
          v-model="practiceObj.description"
          placeholder=""
          rows="3"
          max-rows="8"
          readonly
        ></b-form-textarea>
        <div v-if="practiceCounts">
          <div v-if="!forAdmin">
            <hr />
            <DownloadReport
              :forSelf="true"
              :practiceId="practice._getId()"
              :hasSubmodules="
                practiceSubmodules && practiceSubmodules.length > 0
              "
              :worksheet="`${practice.get('name')}统计`"
            />
          </div>
          <h5>总计有 {{ items.length }} 条报数记录</h5>
          <b-table striped hover :items="items" :fields="fields"></b-table>
        </div>
      </b-card-text>
    </b-card>
  </div>
</template>

<script>
import DatePicker from "v-calendar/lib/components/date-picker.umd";
import DownloadReport from "@/components/DownloadReport";
import Parse from "parse";
import { mapGetters } from "vuex";

export default {
  name: "Practice",
  components: {
    DatePicker,
    DownloadReport
  },
  props: {
    practice: { type: Object, required: true },
    latestPracticeCount: { type: Object, required: false },
    practiceSubmodules: { type: Array, required: false },
    practiceSessions: { type: Array, required: false },
    practiceCounts: { type: Array, required: false },
    users: { type: Array, required: false },
    forAdmin: Boolean
  },
  computed: {
    ...mapGetters(["isStudent"])
  },
  data: function() {
    return {
      practiceObj: {
        name: this.practice.get("name"),
        description: this.practice.get("description"),
        showDescription: false,
        showReportingCount: false,
        newCountReportedAt: "",
        newCount: "",
        submoduleId: undefined,
        sessions: []
      },
      practiceCountObj: this.buildPracticeCountObj(this.latestPracticeCount),
      fields: this.buildPracticeCountFields(),
      items: this.buildPracticeCountItems()
    };
  },
  methods: {
    buildPracticeCountFields() {
      var fields = [
        {
          key: this.forAdmin ? "name" : "reportedAt",
          label: this.forAdmin ? "姓名" : "日期",
          sortable: true
        },
        {
          key: "count",
          label: "报数",
          sortable: true
        }
      ];
      if (
        !this.forAdmin &&
        this.practiceSubmodules &&
        this.practiceSubmodules.length > 0
      ) {
        fields[1] = {
          key: "sessionName",
          label: "修法",
          sortable: true
        };
        fields.push({
          key: "duration",
          label: "时长",
          sortable: true
        });
      }
      return fields;
    },
    formatCount(count) {
      if (count != undefined) {
        return count.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
      }
      return "";
    },
    formatCountList(list) {
      if (list) {
        list = list.map(e => {
          return this.formatCount(e);
        });
        return list.join(",");
      }
      return "";
    },
    formatDuration(duration) {
      var hours = Math.floor(duration / 60);
      if (hours) {
        hours = `${hours}小时`;
      } else {
        hours = "";
      }
      var minutes = duration % 60;
      if (minutes) {
        minutes = `${minutes}分钟`;
      } else {
        minutes = "";
      }
      return `${hours}${minutes}`;
    },
    buildPracticeCountItems() {
      var items = [];
      if (this.practiceCounts) {
        if (this.forAdmin) {
          for (var i = 0; i < this.practiceCounts.length; i++) {
            items.push({
              name: this.users[i],
              count: this.formatCount(this.practiceCounts[i].get("count"))
            });
          }
        } else {
          const practiceSubmodules = this.practiceSubmodules;
          for (i = 0; i < this.practiceCounts.length; i++) {
            const e = this.practiceCounts[i];
            if (!e.get("reportedAt")) {
              continue;
            }

            if (this.practiceSessions && this.practiceSessions[i]) {
              const practiceSessions = this.practiceSessions[i];
              for (var j = 0; j < practiceSessions.length; j++) {
                const submoduleId = practiceSessions[j].get("submoduleId");
                var sessionName = undefined;
                if (submoduleId) {
                  sessionName = practiceSubmodules.find(
                    s => s.id == submoduleId
                  ).name;
                }
                const duration = practiceSessions[j].get("duration");

                items.push({
                  reportedAt: this.toLocalDateString(e.get("reportedAt")),
                  sessionName,
                  duration: this.formatDuration(duration)
                });
              }
            } else {
              items.push({
                reportedAt: this.toLocalDateString(e.get("reportedAt")),
                count: this.formatCount(e.get("count"))
              });
            }
          }
        }
      }
      return items;
    },
    buildPracticeCountObj(latestPracticeCount) {
      return this.forAdmin
        ? {
            latestCount:
              latestPracticeCount && latestPracticeCount.reportedAt
                ? `${this.toLocalDateString(
                    new Date(latestPracticeCount.reportedAt)
                  )}`
                : "未报数",
            accumulatedCount:
              latestPracticeCount && latestPracticeCount.accumulatedCount
                ? this.formatCount(latestPracticeCount.accumulatedCount)
                : "未报数"
          }
        : {
            latestCount:
              latestPracticeCount && latestPracticeCount.reportedAt
                ? `${this.formatCount(
                    latestPracticeCount.count
                  )} @ ${this.toLocalDateString(
                    latestPracticeCount.reportedAt
                  )}`
                : "未报数",
            accumulatedCount:
              latestPracticeCount && latestPracticeCount.accumulatedCount
                ? this.formatCount(latestPracticeCount.accumulatedCount)
                : "未报数"
          };
    },
    minDateForCountReporting() {
      const today = new Date();
      //student must report count within 365 days
      return new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000);
    },
    toLocalDateTimeString(date) {
      const options = {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "numeric"
      };
      return date.toLocaleDateString("zh-CN", options).substring(2);
    },
    toLocalDateString(date) {
      const options = {
        year: "numeric",
        month: "short",
        day: "numeric"
      };
      return date.toLocaleDateString("zh-CN", options).substring(2);
    },
    resetReportingUI() {
      this.practiceObj.newCountReportedAt = undefined;
      this.practiceObj.newCount = undefined;
      this.practiceObj.newDurationHours = undefined;
      this.practiceObj.newDurationMinutes = undefined;
      this.practiceObj.submoduleId = undefined;
      this.practiceObj.sessions = [];
    },
    toggleReportingCount() {
      this.practiceObj.showReportingCount = !this.practiceObj
        .showReportingCount;
      this.resetReportingUI();
    },
    addPracticeSession() {
      const id = this.practiceObj.submoduleId;
      var duration = 0;
      if (this.practiceObj.newDurationHours) {
        duration += parseInt(this.practiceObj.newDurationHours) * 60;
      }
      if (this.practiceObj.newDurationMinutes) {
        duration += parseInt(this.practiceObj.newDurationMinutes);
      }

      var errorMessage = "";
      if (duration < 30) {
        errorMessage = `${errorMessage}每座时长不能少于30分钟！`;
      }
      if (!id) {
        errorMessage = `${errorMessage}请选择修法！`;
      }
      if (errorMessage.length) {
        this.$dialog.alert(errorMessage, {
          okText: "知道了"
        });
      } else {
        const name = this.practiceSubmodules.find(e => e.id == id).name;
        this.practiceObj.sessions.push({ id, name, duration });
      }
    },
    removePracticeSession(index) {
      this.practiceObj.sessions.splice(index, 1);
    },
    onSubmit(evt) {
      evt.preventDefault();
      const options = {
        okText: "确认",
        cancelText: "取消",
        loader: true // default: false - when set to true, the proceed button shows a loader when clicked; and a dialog object will be passed to the then() callback
      };

      const practiceSessions =
        this.practiceSubmodules.length == 0
          ? undefined
          : this.practiceObj.sessions.map(e => {
              return { submoduleId: e.id, duration: e.duration };
            });
      if (this.practiceSubmodules.length > 0) {
        this.practiceObj.newCount = this.practiceObj.sessions.length.toString();
      }

      if (this.practiceObj.newCount) {
        this.practiceObj.newCount = this.practiceObj.newCount.trim();
      }

      var errorMessage = "";
      if (!this.practiceObj.newCountReportedAt) {
        errorMessage = `${errorMessage}请选择日期！`;
      }

      if (errorMessage.length) {
        this.$dialog.alert(errorMessage, {
          okText: "知道了"
        });
        return;
      }

      const prepend =
        !this.practiceObj.newCount || !this.practiceObj.newCount.length
          ? `删除报数`
          : `新增报数${this.practiceObj.newCount}`;
      const message = {
        title: this.practiceObj.name,
        body: `${prepend} @ ${this.toLocalDateString(
          this.practiceObj.newCountReportedAt
        )}？`
      };
      const practiceId = this.practice.id;

      const reportedAt = new Date(0);
      reportedAt.setUTCFullYear(
        this.practiceObj.newCountReportedAt.getFullYear()
      );
      reportedAt.setUTCMonth(this.practiceObj.newCountReportedAt.getMonth());
      reportedAt.setUTCDate(this.practiceObj.newCountReportedAt.getDate());

      const count =
        !this.practiceObj.newCount || !this.practiceObj.newCount.length
          ? undefined
          : parseInt(this.practiceObj.newCount);
      const thisComponent = this;

      console.log(
        `home:reportPracticeCount - practiceId: ${practiceId} reportedAt: ${reportedAt} count: ${count} practiceSessions: ${JSON.stringify(
          practiceSessions
        )}`
      );

      this.$dialog
        .confirm(message, options)
        .then(function(dialog) {
          Parse.Cloud.run("home:reportPracticeCountV2", {
            practiceId,
            reportedAt,
            count,
            practiceSessions
          })
            .then(result => {
              console.log(
                `reportPracticeCount - result: ${JSON.stringify(result)}`
              );

              thisComponent.practiceCountObj = thisComponent.buildPracticeCountObj(
                result
              );
              thisComponent.resetReportingUI();

              dialog.close();
              if (thisComponent.practiceCounts) {
                // thisComponent.$router.go();
                window.location.reload();
              }
            })
            .catch(e => {
              console.log(`error in reportPracticeCount: ${e}`);
              dialog.close();
              thisComponent.$dialog.alert(`error in reportPracticeCount: ${e}`);
            });
        })
        .catch(e => {
          console.log(`error: ${e}`);
        });
    }
  }
};
</script>
