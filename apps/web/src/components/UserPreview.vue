<template>
  <div class="user-preview">
    <router-link :to="userLink" class="preview-link">
      <h3 v-text="displayName()" />
      <ul style="list-style-type: none">
        <li>用户名：{{ user.username }}</li>
        <li>用户角色：{{ displayRoles() }}</li>
        <li>电邮地址：{{ user.email }}</li>
        <li>电话号码：{{ user.phone }}</li>
      </ul>
    </router-link>
  </div>
</template>

<script>
import user from "../store/user.module";

export default {
  name: "UserPreview",
  components: {},
  props: {
    user: { type: Object, required: true }
  },
  computed: {
    userLink() {
      return {
        name: "user",
        params: {
          slug: this.user.id
        }
      };
    }
  },
  methods: {
    displayName() {
      return user.getDisplayName(this.user);
    },
    displayRoles() {
      return user.getDisplayRoles(this.user.roles);
    }
  }
};
</script>
