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
import {ElMessage} from "element-plus";

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
      excludeKeys: ["group-more-style", 'group-video', 'fullScreen']
    };

    const editorConfig = {
      placeholder: '请输入内容...',
      withCredentials: true,
      MENU_CONF: {
        uploadImage: {
          server: 'http://47.93.187.154:8082/posts/uploadImg',
          maxFileSize: 10 * 1024 * 1024, // 10M
          base64LimitSize: 5 * 1024, // 5kb 以下插入 base64
          onSuccess(file, res) {
            console.log(`${file.name} 上传成功`, res);
          },
          // 上传错误，或者触发 timeout 超时
          onError(file, err, res) {
            console.log(`${file.name} 上传出错`, err, res);
          },
          //自定义插入
          customInsert(res, insertFn) {
            // res 即服务端的返回结果
            let url = res.data;
            let alt = res.data;
            let href = res.data;
            // 最后插入图片
            insertFn(url, alt, href);
          },
          //自定义上传
          async customUpload(file, insertFn) {
            // file 即选中的文件
            console.log(file);
            let formData = new FormData();
            formData.append("img", file);
            // 自己实现上传，并得到图片 url alt href
            fetch('http://47.93.187.154:8082/posts/uploadImg', {
              method: "POST",
              body: formData,
            })
                .then((res) => res.json())
                .then((res) => {
                  let url = res.data;
                  let alt = res.data;
                  let href = res.data;
                  // 最后插入图片
                  insertFn(url, alt, href);

                });
          },

        },
      },

    };


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
