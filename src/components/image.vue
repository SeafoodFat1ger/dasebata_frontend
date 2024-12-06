<template>
  <el-upload
      ref="upload"
      class="avatar-uploader"
      action="链接"
      :limit="1"
      :on-exceed="handleExceed"
      :on-success="handleSuccess"
      :http-request="fnUploadRequest"
      :before-upload="handleUpload"
      list-type="picture"
      :auto-upload="true"
  >
    <template #trigger>
      <el-button type="primary">选择图片</el-button>
    </template>
    <template #tip>
      <div style="margin-left: 90px;margin-top: -30px;color: #E69F36">
        说明：仅支持jpg、jpeg、JPG、PNG、png图片格式。图片大小不可超过2k
      </div>
    </template>
  </el-upload>
</template>

<script setup>
import {onMounted, ref, reactive} from 'vue'
import OSS from 'ali-oss';
import {ElMessage, ElMessageBox, ElNotification, genFileId} from "element-plus";


// 接收父组件传参
const props = defineProps({
  fileType: {
    type: String
  },
  clear: {
    type: String
  }
})

const fileUrl = ref(null);
const upload = ref()

//校验
const handleUpload = (file, fileList) => {
  var testmsg = file.name.substring(file.name.lastIndexOf('.') + 1)
  const extension = testmsg === 'png' || testmsg === 'jpg'|| testmsg === 'PNG' || testmsg === 'JPG' || testmsg === 'jpeg';

  const isLimit200KB = file.size / 1024 < 20000000;
  var bool = false;
  if (extension && isLimit200KB) {
    bool = true;
  } else {
    bool = false;
  }
  if (!extension) {
    ElMessage.error('请选择附件文件类型！');
    return bool;
  }
  if (!isLimit200KB) {
    ElMessage.error('上传失败，文件大小不能超过200kb！');
    return bool;
  }
  return bool;
}

function handleSuccess() {
  setTimeout(() => {
    upload.value.clearFiles();
  }, 2000);
}



//随机名称
function random_string(len) {
  len = len || 32
  var chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678'
  var maxPos = chars.length
  var pwd = ''
  for (let i = 0; i < len; i++) {
    pwd += chars.charAt(Math.floor(Math.random() * maxPos))
  }
  return pwd
}

// 定义emit方法
const emits = defineEmits(['uploadSuccess'])

//上传
const fnUploadRequest = async (options) => {
  try {
    let file = options.file; // 拿到 file
    const objName = `online/file/${props.fileType}/${random_string(6)}_${file.name}`;

    // 创建一个用于压缩图片的canvas元素
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const image = new Image();
    const reader = new FileReader();

    reader.onload = function (event) {
      image.onload = function () {
        const maxWidth = 600; // 设置图片最大宽度
        const maxHeight = 600; // 设置图片最大高度

        let width = image.width;
        let height = image.height;

        // 按比例计算压缩后的宽度和高度
        if (width > maxWidth || height > maxHeight) {
          if (width / maxWidth > height / maxHeight) {
            // 宽度超出范围，按宽度进行等比例缩放
            width = maxWidth;
            height = (maxWidth / image.width) * image.height;
          } else {
            // 高度超出范围，按高度进行等比例缩放
            height = maxHeight;
            width = (maxHeight / image.height) * image.width;
          }
        }

        // 设置canvas的宽度和高度
        canvas.width = width;
        canvas.height = height;

        // 在canvas上绘制压缩后的图片
        ctx.drawImage(image, 0, 0, width, height);

        // 将canvas转换为Blob对象
        canvas.toBlob(async (compressedBlob) => {
          // 获取压缩后的文件
          const compressedFile = new File([compressedBlob], file.name, { type: file.type });

          // 获取临时凭证
          // let config = await getOssSts();
          let client = new OSS({
            region: 'oss-cn-hangzhou',
            // 云账号AccessKey有所有API访问权限，建议遵循阿里云安全最佳实践，部署在服务端使用RAM子账号或STS，部署在客户端使用STS。
            accessKeyId: '',
            accessKeySecret: '',
            bucket: '',
            // 刷新临时访问凭证的时间间隔，单位为毫秒。
            refreshSTSTokenInterval: 300000,
          });
          // 上传压缩后的图片
          let result = await client.put(objName, compressedFile);
          // 返回数据
          fileUrl.value = result.url;
          emits('uploadSuccess', fileUrl);

          ElMessage({
            type: 'success',
            message: '图片上传成功！',
          });
        }, file.type, 2); // 压缩质量设置为0.7，可以根据需要进行调整
      };
      image.src = event.target.result;
    };


    reader.readAsDataURL(file);
  } catch (e) {
    ElNotification.error('上传附件失败！');
  }
}
</script>



