<template>
  <div>
    <b-card class="text-center" :header="module.name">
      <b-card-text>
        <b-input-group prepend="总体进度：" class="mt-3">
          <b-form-input readonly v-model="module.studyProgress"></b-form-input>
          <b-input-group-append>
            <b-button
              variant="info"
              :href="getFullUrl(module.url)"
              target="_blank"
            >
              <b-icon icon="book"></b-icon>
            </b-button>
          </b-input-group-append>
        </b-input-group>
        <hr />
        <div
          v-for="(submodule, index) in this.submodules"
          :key="submodule.id + index"
        >
          <b-link :href="getFullUrl(submodule.url)" target="_blank">{{
            `(${submodule.index}) ${submodule.name}`
          }}</b-link>
          <b-input-group prepend="学习进度：" class="mt-3">
            <b-form-input
              readonly
              :value="toSubmoduleStudyStateString(moduleDetails, index)"
            ></b-form-input>
            <b-input-group-append>
              <b-button
                variant="info"
                :href="getFullUrl(submodule.url)"
                target="_blank"
              >
                <b-icon icon="book"></b-icon>
              </b-button>
              <b-button
                variant="success"
                v-if="needToShowPrestudyButton(index)"
                v-on:click="updateSubmoduleStudyState(index)"
                >圆满</b-button
              >
            </b-input-group-append>
          </b-input-group>
        </div>
      </b-card-text>
    </b-card>
  </div>
</template>

<script>
import Parse from "parse";

export default {
  name: "Module",
  props: {
    showIncompleted: Boolean,
    parseModule: { type: Object, required: true },
    moduleDetails: { type: Object, required: true },
    submodules: { type: Array, required: true }
  },
  data: function() {
    return {
      module: this.initModule()
    };
  },
  methods: {
    initModule() {
      return {
        id: this.parseModule.id,
        name: this.parseModule.get("name"),
        url: this.parseModule.get("url"),
        studyProgress: this.getStudyProgress()
      };
    },
    getFullUrl(url) {
      if (url && !(url.includes("://") || url.indexOf("//") === 0)) {
        const parentUrl = process.env.VUE_APP_PARENT_URL;
        if (!url.startsWith(parentUrl)) {
          return parentUrl + url.replace("..", "");
        }
      }
      return url;
    },
    getStudyProgress() {
      return this.showIncompleted
        ? `未圆满 ${this.moduleDetails.totalSubmodules -
            this.moduleDetails.completedSubmodules}/${
            this.moduleDetails.totalSubmodules
          }`
        : `已圆满 ${this.moduleDetails.completedSubmodules}/${this.moduleDetails.totalSubmodules}`;
    },
    toSubmoduleStudyStateString(moduleDetails, index) {
      if (moduleDetails && this.submodules[index].studyRecord) {
        const studyRecord = this.submodules[index].studyRecord;
        if (studyRecord.lineage && studyRecord.textbook) {
          return "已圆满";
        }
      }
      return "未圆满";
    },
    needToShowPrestudyButton(index) {
      if (this.forApplication || this.forAdmin) {
        return false;
      }
      const moduleDetails = this.moduleDetails;
      if (moduleDetails && this.submodules[index].studyRecord) {
        const studyRecord = this.submodules[index].studyRecord;
        return !studyRecord.lineage || !studyRecord.textbook;
      }
      return false;
    },
    updateSubmoduleStudyState(index) {
      console.log(`updateSubmoduleStudyState - ${index}`);

      var msg = "确认已圆满学习?";

      const options = {
        okText: "确认",
        cancelText: "取消",
        loader: true // default: false - when set to true, the proceed button shows a loader when clicked; and a dialog object will be passed to the then() callback
      };
      const submodule = this.submodules[index];
      const message = {
        title: submodule.name,
        body: msg
      };
      const thisComponent = this;
      const userStudyRecord = { lineage: true, textbook: true };
      const forDashboard = !this.showIncompleted;

      this.$dialog
        .confirm(message, options)
        .then(function(dialog) {
          Parse.Cloud.run("selfStudy:updateSubmoduleStudyState", {
            submodule,
            userStudyRecord,
            forDashboard
          })
            .then(result => {
              console.log(
                `updateSubmoduleStudyState - result: ${JSON.stringify(result)}`
              );
              dialog.close();
              // window.location.reload();
              thisComponent.$emit("submoduleCompleted", { submodule, result });
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
