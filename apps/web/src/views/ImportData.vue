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
    <JsonExcel
      class="btn btn-info btn-block"
      :data="parseCsv"
      worksheet="My Worksheet"
      name="filename.xls"
    >
      下载报表
    </JsonExcel>
    <hr />
    <div class="multiline">Params: {{ text }}</div>
    <div class="multiline">Result: {{ result }}</div>
  </div>
</template>

<script>
import Parse from "parse";
import TextReader from "../components/TextReader";
import { VueCsvImport } from "vue-csv-import";
import JsonExcel from "vue-json-excel";
import Vue from "vue";

Vue.component("JsonExcel", JsonExcel);

export default {
  name: "ImportData",
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
      text: "",
      parseCsv: undefined,
      fields: undefined
    };
  },
  methods: {
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

      const thisComponent = this;
      this.text = "";
      this.result = "";

      this.$dialog
        .confirm(message, options)
        .then(async function(dialog) {
          var i = 0;
          while (i < 5) {
            i += 1;
            params.csv = thisComponent.parseCsv.filter(e => {
              const index = e["组别"];
              return index == i.toString();
            });
            if (params.csv.length == 0) {
              continue;
            }
            console.log(
              `importing data for team: ${i} #records: ${params.csv.length}`
            );
            thisComponent.text += `${i} - ${JSON.stringify(params, null, 4)}`;
            await Parse.Cloud.run(thisComponent.name, params)
              .then(result => {
                thisComponent.result += `${i} - ${JSON.stringify(
                  result,
                  null,
                  4
                )}`;
              })
              .catch(e => {
                thisComponent.result += `${i} - ${JSON.stringify(e, null, 4)}`;
              });
          }
          dialog.close();
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
