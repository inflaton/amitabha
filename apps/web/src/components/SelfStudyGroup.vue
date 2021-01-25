<template>
  <div>
    <b-card class="text-center" :header="groupInfo.header">
      <b-card-text>
        共 {{ groupInfo.active.length }} 个 {{ groupInfo.name }}
      </b-card-text>
      <b-input-group
        v-for="(item, index) in groupInfo.active"
        :key="item.id + index"
        :prepend="`${groupInfo.name}：`"
        class="mt-3"
      >
        <b-form-input
          readonly
          :value="`(${index + 1}) ${item.name}`"
        ></b-form-input>
        <b-input-group-append
          ><b-button variant="success" v-on:click="removeItem(index, true)"
            >圆满</b-button
          >
        </b-input-group-append>
        <b-input-group-append
          ><b-button variant="warning" v-on:click="removeItem(index, false)"
            >删除</b-button
          >
        </b-input-group-append>
      </b-input-group>
      <hr />
      <b-input-group class="mt-3" :prepend="`未开始：`">
        <b-form-input
          readonly
          :value="`共 ${groupInfo.available.length} 个 ${groupInfo.name}`"
        ></b-form-input>
        <b-form-select
          v-model="itemToAdd"
          :options="availableItemOptions()"
        ></b-form-select>
        <b-input-group-append>
          <b-button variant="success" v-on:click="addItem()">开始</b-button>
        </b-input-group-append>
      </b-input-group>
      <b-input-group class="mt-3" :prepend="`已圆满：`">
        <b-form-input
          readonly
          :value="`共 ${groupInfo.completed.length} 个 ${groupInfo.name}`"
        ></b-form-input>
        <b-form-select
          v-model="completedItemToAdd"
          :options="completedItemOptions()"
        ></b-form-select>
        <b-input-group-append>
          <b-button variant="success" v-on:click="addCompletedItem()"
            >开始</b-button
          >
        </b-input-group-append>
      </b-input-group>
    </b-card>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "SelfStudyGroup",
  props: {
    groupInfo: { type: Object, required: true }
  },
  data: function() {
    return {
      itemToAdd: undefined,
      completedItemToAdd: undefined
    };
  },
  computed: {
    ...mapGetters(["selfStudyInfo"])
  },
  methods: {
    completedItemOptions() {
      const options = this.groupInfo.completed.map(e => {
        return { value: e.id, text: e.name };
      });
      return options;
    },
    availableItemOptions() {
      const options = this.groupInfo.available.map(e => {
        return { value: e.id, text: e.name };
      });
      return options;
    },
    addCompletedItem() {
      console.log(`addCompletedItem: ${this.completedItemToAdd}`);
      for (var i = 0; i < this.groupInfo.completed.length; i++) {
        const item = this.groupInfo.completed[i];
        if (item.id == this.completedItemToAdd) {
          this.groupInfo.completed.splice(i, 1);
          this.groupInfo.active.push(item);
          this.$emit("dataChanged", true);
          break;
        }
      }
    },
    addItem() {
      console.log(`addItem: ${this.itemToAdd}`);
      for (var i = 0; i < this.groupInfo.available.length; i++) {
        const item = this.groupInfo.available[i];
        if (item.id == this.itemToAdd) {
          this.groupInfo.available.splice(i, 1);
          this.groupInfo.active.push(item);
          this.$emit("dataChanged", true);
          break;
        }
      }
    },
    removeItem(index, completed) {
      const item = this.groupInfo.active[index];
      this.groupInfo.active.splice(index, 1);
      if (completed) {
        this.groupInfo.completed.push(item);
      } else {
        this.groupInfo.available.push(item);
      }
      this.$emit("dataChanged", true);
    }
  }
};
</script>
