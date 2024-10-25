<template>
  <!-- 分页 -->
  <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :page-sizes="[10, 20, 30, 40]"
      :disabled="disabled"
      :background="background"
      layout=" prev, pager, next,sizes,jumper"
      :total="total"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
  />

</template>

<script setup>

import { ref, defineEmits } from 'vue';
const currentPage = ref(1);
const pageSize = ref(10);
const pageSizes = [10, 20, 30, 40];
const background = ref(true);
const disabled = ref(false);
const total = ref(100)
const emit = defineEmits(['update:currentPage', 'update:pageSize']);

const handleSizeChange = (val) => {
  console.log(`${val} items per page`)
  emit('update:pageSize', val);
}
const handleCurrentChange = (val) => {
  console.log(`current page: ${val}`)
  emit('update:currentPage', val)
}
</script>
