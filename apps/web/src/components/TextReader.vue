<template>
  <div>
    <label class="text-reader">
      Read CSV File
      <input type="file" @change="loadCSVFieldsFromFile" />
    </label>
    {{ fileName }}
  </div>
</template>

<script>
export default {
  data: function() {
    return {
      fileName: undefined
    };
  },
  methods: {
    loadCSVFieldsFromFile(ev) {
      const file = ev.target.files[0];
      this.fileName = file.name;
      const reader = new FileReader();

      reader.onload = e => {
        const lines = e.target.result.split(/\r?\n/);
        const fields = lines[0].split(",");
        this.$emit("load", fields);
      };
      reader.readAsText(file);
    }
  }
};
</script>

<style>
.text-reader {
  position: relative;
  overflow: hidden;
  display: inline-block;

  /* Fancy button looking */
  border: 2px solid black;
  border-radius: 5px;
  padding: 8px 12px;
  cursor: pointer;
}
.text-reader input {
  position: absolute;
  top: 0;
  left: 0;
  z-index: -1;
  opacity: 0;
}
</style>
