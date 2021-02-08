<template>
  <div v-if="isLoadingModuleInfo" class="classSession-preview">
    正在获取闻思记录...
  </div>
  <div v-else>
    <b-tabs pills content-class="mt-3" align="center">
      <b-tab title="未圆满" title-item-class="mytab" acitve>
        <Module
          :showIncompleted="true"
          :parseModule="userModuleInfo.module"
          :moduleDetails="userModuleInfo"
          :submodules="userModuleInfo.submodules"
          @submoduleCompleted="onSubmoduleCompleted"
        />
      </b-tab>
      <b-tab title="已圆满" title-item-class="mytab" acitve>
        <Module
          :parseModule="userModuleInfo.module"
          :moduleDetails="userModuleInfo"
          :submodules="userModuleInfo.completed"
        />
      </b-tab>
    </b-tabs>
  </div>
</template>

<script>
import store from "@/store";
import { FETCH_MODULE_DETAILS } from "../store/actions.type";
import { mapGetters } from "vuex";
import Module from "@/components/Module";

export default {
  name: "ModuleInfo",
  components: {
    Module
  },
  computed: {
    ...mapGetters(["isLoadingModuleInfo", "userModuleInfo"])
  },
  beforeRouteEnter(to, from, next) {
    store.dispatch(FETCH_MODULE_DETAILS, to.params).then(() => {
      next();
    });
  },
  methods: {
    onSubmoduleCompleted(value) {
      for (var i = 0; i < this.userModuleInfo.submodules.length; i++) {
        const submodule = this.userModuleInfo.submodules[i];
        if (submodule.id == value.submodule.id) {
          this.userModuleInfo.submodules.splice(i, 1);
          submodule.studyRecord = value.result.result;
          for (var j = 0; j < this.userModuleInfo.completed.length; j++) {
            if (submodule.index > this.userModuleInfo.completed[j].index) {
              this.userModuleInfo.completed.splice(j, 0, submodule);
              break;
            }
          }
          break;
        }
      }
    }
  }
};
</script>

<style>
.nav-pills li {
  list-style-type: none;
}

.nav-pills .mytab .nav-link:not(.active) {
  background-color: red !important;
  font-size: 22px;
}

.nav-pills .mytab .nav-link {
  background-color: blue !important;
  font-size: 22px;
}
</style>
