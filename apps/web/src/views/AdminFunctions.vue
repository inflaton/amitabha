<template>
  <div>
    <b-form @submit="onSubmit" @reset="onReset">
      <h4>Run Admin Functions</h4>
      <TextReader @load="fields = $event" />
      <b-form-textarea
        :value="JSON.stringify(fields, null, 4)"
        placeholder="CSV fields will appear here"
        rows="2"
        max-rows="10"
        readonly
      ></b-form-textarea>
      <VueCsvImport
        v-if="fields"
        v-model="parseCsv"
        :map-fields="fields"
        :autoMatchFields="true"
      ></VueCsvImport>
      <b-form-textarea
        v-if="parseCsv"
        :value="JSON.stringify(parseCsv, null, 4)"
        placeholder="JSON converted from CSV file content will appear here"
        rows="8"
        max-rows="20"
        readonly
      ></b-form-textarea>
      <b-form-textarea
        v-model="params"
        placeholder="Enter parameters"
        rows="8"
        max-rows="20"
      ></b-form-textarea>
      <b-input-group prepend="Name：" class="mt-3">
        <b-form-input v-model="name" placeholder="Enter function name" trim />
        <b-input-group-append>
          <b-button type="reset" variant="warning">
            <b-icon icon="x-circle"></b-icon>
          </b-button>
          <b-button type="submit" variant="success">
            <b-icon icon="check-circle"></b-icon>
          </b-button>
        </b-input-group-append>
      </b-input-group>
    </b-form>
    <div v-for="(buttonName, index) in buttonNames" :key="buttonName + index">
      <b-button
        block
        :variant="selectedIndex == index ? 'warning' : 'info'"
        @click="importData(index)"
        >{{ buttonName }}</b-button
      >
      <hr />
    </div>
    <JsonExcel
      class="btn btn-info btn-block"
      :data="parseCsv"
      worksheet="My Worksheet"
      name="filename.xls"
    >
      下载报表
    </JsonExcel>
    <hr />
    <div class="multiline">Result: {{ result }}</div>
  </div>
</template>

<script>
import Parse from "parse";
import TextReader from "../components/TextReader";
import { VueCsvImport } from "vue-csv-import";
import JsonExcel from "vue-json-excel";
import Vue from "vue";
import importdata from "../store/importdata.module";

Vue.component("JsonExcel", JsonExcel);

export default {
  name: "AdminDashboard",
  components: {
    TextReader,
    VueCsvImport,
    JsonExcel
  },
  data: function() {
    return {
      name: "",
      params: "",
      result: "",
      parseCsv: undefined,
      fields: undefined,
      buttonNames: [
        "导入一组心咒",
        "导入一组共修",
        "导入二组心咒",
        "导入二组共修",
        "导入旁听组心咒",
        "导入旁听组共修"
      ],
      selectedIndex: undefined
    };
  },
  methods: {
    importData(index) {
      this.selectedIndex = index;
      console.log(`importData - index: ${index}`);

      this.parseCsv = importdata.parseCsvList[index];
      // console.log(`importData - parseCsv: ${JSON.stringify(this.parseCsv)}`);
      console.log(`importData - #records: ${this.parseCsv.length}`);

      this.params = importdata.paramsList[index % 2];
    },
    onReset(evt) {
      evt.preventDefault();
      window.location.reload();
    },
    onSubmit(evt) {
      evt.preventDefault();
      const options = {
        okText: "Confirm",
        cancelText: "Cancel",
        loader: true // default: false - when set to true, the proceed button shows a loader when clicked; and a dialog object will be passed to the then() callback
      };
      const params = JSON.parse(this.params);
      if (!this.name || this.name.length == 0) {
        this.name = params.functionName;
      }

      const message = {
        title: "Run Admin Function",
        body: `Confirm to run function ${this.name}？`
      };

      params.csv = this.parseCsv;
      this.text = JSON.stringify(params);

      const thisComponent = this;

      this.$dialog
        .confirm(message, options)
        .then(function(dialog) {
          Parse.Cloud.run(thisComponent.name, params)
            .then(result => {
              thisComponent.result = JSON.stringify(result, null, 4);
              dialog.close();
            })
            .catch(e => {
              thisComponent.result = JSON.stringify(e, null, 4);
              dialog.close();
            });
        })
        .catch(e => {
          console.log(`error: ${e}`);
        });
    }
  }
};
</script>

<style>
.multiline {
  white-space: pre-wrap;
}
</style>
