<template>
  <JsonExcel
    class="btn btn-info btn-block"
    :worksheet="worksheet"
    :fetch="fetchData"
    :before-generate="startDownload"
    :before-finish="finishDownload"
    :name="getFilename()"
    :type="isSmartPhone ? 'csv' : 'xls'"
  >
    {{ downloading ? `${worksheet}下载中...` : `下载${worksheet}` }}
  </JsonExcel>
</template>

<script>
import JsonExcel from "vue-json-excel";
import Vue from "vue";

Vue.component("JsonExcel", JsonExcel);

export default {
  name: "JsonExcelWrapper",
  components: {
    JsonExcel
  },
  props: {
    worksheet: String,
    doFetchData: {
      type: Function
    }
  },
  data: function() {
    return {
      downloading: false,
      isSmartPhone: require("detect-mobile-browser")(false).isAny()
    };
  },
  methods: {
    getFilename() {
      const date = new Date();
      const timestamp = new Date(date.toString().split("GMT")[0] + " UTC")
        .toISOString()
        .split(".")[0];
      const fileExt = this.isSmartPhone ? "csv" : "xls";
      return `${this.worksheet}_${timestamp}.${fileExt}`;
    },
    async fetchData() {
      return await this.doFetchData();
    },
    startDownload() {
      this.downloading = true;
    },
    finishDownload() {
      this.downloading = false;
    }
  }
};
</script>
