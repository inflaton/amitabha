<template>
  <div>
    <b-card class="text-center" header="中组管理">
      <b-input-group
        v-for="(member, index) in classAdminUsers"
        :key="index"
        :prepend="member.role"
        class="mt-3"
      >
        <b-form-input readonly :value="member.displayName"></b-form-input>
        <b-input-group-append>
          <b-form-select
            v-model="newClassAdmins[index]"
            :options="classAdminOptions(index)"
            v-on:input="changeMember($event, index)"
          ></b-form-select>
        </b-input-group-append>
      </b-input-group>
    </b-card>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { RESET_STUDENTS } from "../store/actions.type";

export default {
  name: "ClassAdmin",
  props: {
    forStudentManagement: Boolean
  },
  data: function() {
    return {
      classAdminCandidates: [],
      classStatsCandidates: [],
      newClassAdmins: []
    };
  },
  computed: {
    ...mapGetters(["classInfo", "classTeams", "classAdminUsers"])
  },
  mounted() {
    this.buildNewClassAdmin();
    this.buildOptions();
  },
  methods: {
    buildNewClassAdmin() {
      const newClassAdmins = [];
      for (var i = 0; i < this.classAdminUsers.length; i++) {
        const user = this.classAdminUsers[i];
        newClassAdmins.push(user.id);
      }
      this.newClassAdmins = newClassAdmins;
    },
    buildOptions() {
      this.classAdminCandidates = [];
      for (var i = 0; i < this.classInfo.classAdminStudents.length; i++) {
        const user = this.classInfo.classAdminStudents[i];
        if (user && user.roles.some(role => role == "ClassAdminUser")) {
          this.classAdminCandidates.push(user);
        }
      }

      this.classAdminCandidates = this.classAdminCandidates.concat(
        this.classInfo.classAdminCandidates
      );
      this.classAdminCandidates = this.classAdminCandidates.map(e => {
        return { value: e.id, text: e.name, roles: e.roles };
      });

      this.classStatsCandidates = [];
      for (i = 0; i < this.classTeams.length; i++) {
        const team = this.classTeams[i];
        for (var j = 0; j < team.members.length; j++) {
          const member = team.members[j];
          if (!this.classAdminCandidates.some(e => e.value == member.id)) {
            this.classStatsCandidates.push({
              value: member.id,
              text: member.name,
              roles: member.roles
            });
          }
        }
      }
    },
    classAdminOptions(index) {
      if (index < 2) {
        return this.classAdminCandidates;
      }
      return this.classStatsCandidates;
    },
    changeMember(value, index) {
      if (value == this.classAdminUsers[index].id) {
        return;
      }

      console.log(`selected ${value} index: ${index}`);
      const options = this.classAdminOptions(index);

      for (var i = 0; i < options.length; i++) {
        const option = options[i];
        if (option.value == value) {
          this.classAdminUsers[index].id = value;
          this.classAdminUsers[index].name = option.name;
          this.classAdminUsers[index].displayName = `(${index + 1}) ${
            option.text
          }`;
          break;
        }
      }
      this.$store.dispatch(RESET_STUDENTS, { changed: true });
    }
  }
};
</script>
