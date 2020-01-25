<template>
  <div id="app">
    <div v-if="!signedIn">
      <amplify-authenticator :authConfig="authConfig"></amplify-authenticator>
    </div>
    <div v-if="signedIn">
      <h1 data-test="logged-in-header">You are Logged In!</h1>
      <amplify-sign-out></amplify-sign-out>
    </div>
  </div>
</template>

<script>
import { AmplifyEventBus } from "aws-amplify-vue";
import { Auth } from "aws-amplify";
export default {
  name: "app",
  components: {},
  data() {
    return {
      signedIn: false,
      authConfig: {
        signUpConfig: {
          hiddenDefaults: ["phone_number"]
        }
      }
    };
  },
  async beforeCreate() {
    try {
      await Auth.currentAuthenticatedUser();
      this.signedIn = true;
    } catch (err) {
      this.signedIn = false;
    }
    AmplifyEventBus.$on("authState", info => {
      if (info === "signedIn") {
        this.signedIn = true;
      } else {
        this.signedIn = false;
      }
    });
  }
};
</script>