<template>
  <div>
    <el-button type="primary">{{hello}}</el-button>
  </div>
</template>
<script lang="ts">
import { Vue, Component } from "vue-property-decorator";

@Component
export default class Demo extends Vue {
  hello = "hello world!!!";
}
</script>