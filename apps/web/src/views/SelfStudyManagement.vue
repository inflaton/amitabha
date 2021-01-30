<template>
  <div>
    <div v-if="isLoadingSelfStudy">
      正在获取自修详情...
    </div>
    <div v-else>
      <h3>自修管理</h3>
      <div
        v-for="(groupInfo, index) in getGroupInfoList()"
        :key="groupInfo.name + index"
      >
        <SelfStudyGroup :groupInfo="groupInfo" @dataChanged="onDataChanged" />
        <hr />
      </div>
      <b-input-group v-if="dataChanged" class="mt-3">
        <b-form-input
          readonly
          :value="`共有 ${dataChanged} 处修改`"
        ></b-form-input>
        <b-input-group-append>
          <b-button variant="success" @click="submitSelfStudyInfo"
            >保存修改</b-button
          >
          <b-button variant="warning" @click="resetSelfStudyInfo"
            >放弃修改</b-button
          >
        </b-input-group-append>
      </b-input-group>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import SelfStudyGroup from "@/components/SelfStudyGroup";
import { FETCH_SELF_STUDY } from "../store/actions.type";
import store from "@/store";
import Parse from "parse";

export default {
  name: "SelfStudyManagement",
  components: {
    SelfStudyGroup
  },
  computed: {
    ...mapGetters(["isLoadingSelfStudy", "selfStudyInfo"])
  },
  beforeRouteEnter(to, from, next) {
    store.dispatch(FETCH_SELF_STUDY, to.params).then(() => {
      next();
    });
  },
  data: function() {
    return {
      groupInfoList: undefined,
      dataChanged: 0
    };
  },
  methods: {
    onDataChanged(value) {
      this.dataChanged = value ? this.dataChanged + 1 : 0;
    },
    getGroupInfoList() {
      if (!this.groupInfoList) {
        this.dataChanged = 0;
        this.groupInfoList = [];
        var groupInfo = { name: "模块", header: "正在闻思" };
        groupInfo.active = this.selfStudyInfo.modules.map(e => {
          return { id: e._getId(), name: e.get("name"), url: e.get("url") };
        });
        groupInfo.available = this.selfStudyInfo.availableModules.map(e => {
          return { id: e._getId(), name: e.get("name"), url: e.get("url") };
        });
        groupInfo.completed = this.selfStudyInfo.completedModules.map(e => {
          return { id: e._getId(), name: e.get("name"), url: e.get("url") };
        });
        this.groupInfoList.push(groupInfo);

        groupInfo = { name: "修法", header: "正在实修" };
        groupInfo.active = this.selfStudyInfo.practices.map(e => {
          return { id: e._getId(), name: e.get("name"), url: e.get("url") };
        });
        groupInfo.available = this.selfStudyInfo.availablePractices.map(e => {
          return { id: e._getId(), name: e.get("name"), url: e.get("url") };
        });
        groupInfo.completed = this.selfStudyInfo.completedPractices.map(e => {
          return { id: e._getId(), name: e.get("name"), url: e.get("url") };
        });
        this.groupInfoList.push(groupInfo);
      }

      return this.groupInfoList;
    },
    resetSelfStudyInfo() {
      const options = {
        okText: "确认",
        cancelText: "取消",
        loader: true // default: false - when set to true, the proceed button shows a loader when clicked; and a dialog object will be passed to the then() callback
      };
      const message = {
        title: this.selfStudyInfo.name,
        body: "放弃所做修改?"
      };
      const thisComponent = this;

      this.$dialog
        .confirm(message, options)
        .then(function(dialog) {
          thisComponent.groupInfoList = undefined;
          thisComponent.getGroupInfoList();
          dialog.close();
        })
        .catch(e => {
          console.log(`error: ${e}`);
        });
    },
    submitSelfStudyInfo() {
      const options = {
        okText: "确认",
        cancelText: "取消",
        loader: true // default: false - when set to true, the proceed button shows a loader when clicked; and a dialog object will be passed to the then() callback
      };
      const message = {
        title: this.selfStudyInfo.name,
        body: "保存所做修改?"
      };
      const thisComponent = this;
      var selfStudyInfo = { modules: {}, practices: {} };
      selfStudyInfo.modules.active = this.groupInfoList[0].active.map(
        e => e.id
      );
      selfStudyInfo.modules.completed = this.groupInfoList[0].completed.map(
        e => e.id
      );
      selfStudyInfo.practices.active = this.groupInfoList[1].active.map(
        e => e.id
      );
      selfStudyInfo.practices.completed = this.groupInfoList[1].completed.map(
        e => e.id
      );

      console.log(
        `updateSelfStudy - selfStudyInfo: ${JSON.stringify(selfStudyInfo)}`
      );

      this.$dialog
        .confirm(message, options)
        .then(function(dialog) {
          Parse.Cloud.run("selfStudy:updateInfo", {
            selfStudyInfo
          })
            .then(result => {
              console.log(
                `updateSelfStudy - result: ${JSON.stringify(result)}`
              );
              thisComponent.$router.push({ name: "home" });
              dialog.close();
            })
            .catch(e => {
              console.log(`error in updateSelfStudy: ${e}`);
              dialog.close();
              thisComponent.$dialog.alert(`error in updateSelfStudy: ${e}`);
            });
        })
        .catch(e => {
          console.log(`error: ${e}`);
        });
    }
  }
};
</script>
