import Parse from "parse";
import Toasted from "vue-toasted";
import Vue from "vue";
import {
  FETCH_USERS,
  FILTER_USERS,
  UPDATE_USER_BY_ADMIN,
  ADMIN_FETCH_USER
} from "./actions.type";
import {
  FETCH_USERS_START,
  FETCH_USERS_END,
  SET_USER,
  UPDATE_USER_IN_LIST,
  FILTER_USERS_IN_LIST
} from "./mutations.type";
import store from "./index";

Vue.use(Toasted);

const state = {
  user: {},
  users: [],
  allUsers: [],
  isLoadingUsers: true,
  usersCount: 0
};

const getDisplayRoles = function(userRoles) {
  const array = [
    { name: "StudentUser", displayName: "学员" },
    { name: "TeacherUser", displayName: "主持人" },
    { name: "TeachingAssistantUser", displayName: "学修助理" },
    { name: "ClassAdminUser", displayName: "学修管理员" },
    { name: "B4aAdminUser", displayName: "系统管理员" }
  ];
  var roles = "";
  if (!userRoles) {
    return array[0].displayName;
  }
  for (var i = 0; i < array.length; i++) {
    if (userRoles.some(role => role == array[i].name)) {
      if (roles.length > 0) {
        roles = roles + "，";
      }
      roles = roles + array[i].displayName;
    }
  }

  return roles;
};
const getDisplayName = function(user) {
  if (!user.state && user.emailVerified) {
    return user.name;
  }

  var userState;
  if (user.state == "blocked") {
    userState = "账号已禁用";
  } else if (!user.emailVerified) {
    userState = "电邮地址待验证";
  } else {
    userState = "密码需更改";
  }

  return `${user.name} (${userState})`;
};

const getters = {
  user(userState) {
    return userState.user;
  },
  usersCount(userState) {
    return userState.usersCount;
  },
  users(userState) {
    return userState.users;
  },
  isLoadingUsers(userState) {
    return userState.isLoadingUsers;
  }
};

const actions = {
  [FETCH_USERS]({ commit }) {
    const user = store.state.auth.user;
    console.log(`${FETCH_USERS} - auth.user: ${JSON.stringify(user)}`);
    commit(FETCH_USERS_START);
    const adminFetchUsers = "user:adminFetchUsers";
    Parse.Cloud.run(adminFetchUsers, { user })
      .then(users => {
        // console.log(`${FETCH_USERS} - users: ${JSON.stringify(users)}`);
        console.log(`${FETCH_USERS} - #users: ${users.users.length}`);
        commit(FETCH_USERS_END, users);
      })
      .catch(e => {
        console.log(`error loading user list: ${e.message}`);
        throw new Error(e);
      });
  },
  [FILTER_USERS](context, filterText) {
    console.log(`${FILTER_USERS} - filterText: ${JSON.stringify(filterText)}`);
    context.commit(FILTER_USERS_IN_LIST, filterText);
  },
  [ADMIN_FETCH_USER](context, userSlug) {
    console.log(`${ADMIN_FETCH_USER} - userSlug: ${userSlug}`);
    if (!userSlug) {
      context.commit(SET_USER, {});
      return;
    }

    const user = store.state.auth.user;
    console.log(`${ADMIN_FETCH_USER} - auth.user: ${JSON.stringify(user)}`);
    const adminFetchUser = "user:adminFetchUser";
    return new Promise((resolve, reject) => {
      Parse.Cloud.run(adminFetchUser, { user, userSlug })
        .then(u => {
          console.log(`${ADMIN_FETCH_USER} - user: ${JSON.stringify(u)}`);

          // default user role is StudentUser
          u.isStudent = u.roles.length == 0 || u.roles.includes("StudentUser");
          u.isTeachingAssistant = u.roles.includes("TeachingAssistantUser");
          u.isClassAdmin = u.roles.includes("ClassAdminUser");
          u.isSystemAdmin = u.roles.includes("B4aAdminUser");
          u.isTeacher = u.roles.includes("TeacherUser");

          context.commit(SET_USER, u);
          resolve();
        })
        .catch(e => {
          console.log(`error loading user: ${e.message}`);
          Vue.toasted.error(`Error loading user: ${e.message}`, {
            duration: 5000
          });
          reject();
        });
    });
  },
  [UPDATE_USER_BY_ADMIN](context, userToUpdate) {
    const user = store.state.auth.user;
    console.log(`${UPDATE_USER_BY_ADMIN} - auth.user: ${JSON.stringify(user)}`);
    console.log(
      `${UPDATE_USER_BY_ADMIN} - userToUpdate: ${JSON.stringify(userToUpdate)}`
    );
    const adminUpdateUser = "user:adminUpdateUser";
    const password = userToUpdate.password;
    const confirmPassword = userToUpdate.confirmPassword;

    const i = store.state.user.allUsers.findIndex(
      u => u.id === userToUpdate.id
    );
    if (i >= 0 && store.state.user.allUsers[i].email === userToUpdate.email) {
      userToUpdate.email = undefined;
    }
    console.log(`${i} - userToUpdate: ${JSON.stringify(userToUpdate)}`);

    return new Promise((resolve, reject) => {
      if (password && password.length < 6) {
        Vue.toasted.error("密码不可以少于6位！", { duration: 5000 });
        reject();
        return;
      } else if (password && password != confirmPassword) {
        Vue.toasted.error("密码和确认密码不匹配！", { duration: 5000 });
        reject();
        return;
      }
      Parse.Cloud.run(adminUpdateUser, { user, userToUpdate })
        .then(u => {
          context.commit(UPDATE_USER_IN_LIST, u);
          Vue.toasted.show("更新成功！", { icon: "check", duration: 5000 });
          resolve();
        })
        .catch(e => {
          Vue.toasted.error(`更新失败！${e.message}`, { duration: 5000 });
          console.log(`error updating user: ${e.message}`);
          reject();
        });
    });
  }
};

/* eslint no-param-reassign: ["error", { "props": false }] */
const mutations = {
  [SET_USER](userState, user) {
    userState.user = user;
  },
  [FETCH_USERS_START](userState) {
    userState.isLoadingUsers = true;
  },
  [FETCH_USERS_END](userState, { users, usersCount }) {
    userState.users = users;
    userState.allUsers = users;
    userState.usersCount = usersCount;
    userState.isLoadingUsers = false;
  },
  [UPDATE_USER_IN_LIST](userState, user) {
    var found = false;
    var place = 0;
    for (var i = 0; i < userState.allUsers.length; i++) {
      if (userState.allUsers[i].id == user.id) {
        found = true;
        if (!user.email) {
          user.email = userState.allUsers[i].email;
        }
        userState.allUsers[i] = user;
        break;
      }
      if (user.name > userState.allUsers[i].name) {
        place = i + 1;
      }
    }
    if (!found) {
      userState.allUsers.splice(place, 0, user);
    }

    userState.users = userState.allUsers;
  },
  [FILTER_USERS_IN_LIST](userState, filterText) {
    if (!filterText || filterText == "") {
      userState.users = userState.allUsers;
    } else {
      userState.users = userState.allUsers.filter(user => {
        const name = getDisplayName(user);
        const roles = getDisplayRoles(user.roles);
        const text = `${name}\t${user.username}\t${user.email}\t${user.phone}\t${roles}`;
        return text.toLowerCase().includes(filterText.toLowerCase());
      });
    }
  }
};

export default {
  state,
  getters,
  actions,
  mutations,
  getDisplayRoles,
  getDisplayName
};
