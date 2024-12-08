<template>
  <div style="border: 1px solid #ccc">
    <Toolbar style="border-bottom: 1px solid #ccc" :editor="editorRef" :defaultConfig="toolbarConfig" :mode="mode"/>
    <Editor style="height: 500px; overflow-y: hidden;" v-model="valueHtml" :defaultConfig="editorConfig" :mode="mode"
            @onCreated="handleCreated"/>
  </div>
</template>

<script>
import '@wangeditor/editor/dist/css/style.css' // 引入 css

import {onBeforeUnmount, ref, shallowRef, onMounted, watch} from 'vue'
import {Editor, Toolbar} from '@wangeditor/editor-for-vue'

export default {
  name: "editor",
  components: {Editor, Toolbar},
  setup(props, {emit}) {
    const editorRef = shallowRef();
    const valueHtml = ref('<p></p>');

    // 监听 valueHtml 的变化
    watch(valueHtml, (newValue) => {
      emit('update:content', newValue); // 向父组件发送事件
    });

    onMounted(() => {
      setTimeout(() => {
        valueHtml.value = '<p></p>';
      }, 1500);
    });

    const toolbarConfig = {
      excludeKeys: ["group-more-style", 'group-video', 'group-image', 'fullScreen']
    };

    const editorConfig = {placeholder: '请输入内容...'};

    // 组件销毁时，也及时销毁编辑器
    onBeforeUnmount(() => {
      const editor = editorRef.value
      if (editor == null) return
      editor.destroy()
    })

    const handleCreated = (editor) => {
      editorRef.value = editor;
    };

    return {
      editorRef,
      valueHtml,
      mode: 'default', // 或 'simple'
      toolbarConfig,
      editorConfig,
      handleCreated
    };
  },
};
</script>
