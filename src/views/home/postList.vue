<template>
  <el-container class="content">
    <!-- 左侧菜单 -->
    <el-aside min-width="300px" width="120px">
      <el-button type="primary" style="margin-left: 20px" @click="drawer = true">
        发起帖子
      </el-button>
      <el-menu
          default-active="0"
          class="el-menu-vertical-demo"
      >
        <el-menu-item
            index="0"
            @click="handleAreaChange(0)">全部
        </el-menu-item>
        <el-menu-item
            index="1"
            @click="handleAreaChange(1)">学习生活
        </el-menu-item>
        <el-menu-item
            index="2"
            @click="handleAreaChange(2)">日常事务
        </el-menu-item>
        <el-menu-item
            index="3"
            @click="handleAreaChange(3)">情感交流
        </el-menu-item>
        <el-menu-item
            index="4"
            @click="handleAreaChange(4)">潜水吐槽
        </el-menu-item>
        <el-menu-item
            index="5"
            @click="handleAreaChange(5)">寻找作乐
        </el-menu-item>
      </el-menu>

    </el-aside>
    <el-main>
      <div style="display: flex; justify-content: flex-start; flex-wrap: wrap;
           gap: 10px; padding: 10px;">
        <PostItem v-for="post in posts" :key="post.postId" :post="post" :needTag="true"/>
      </div>

      <div style="display: flex; justify-content: center; margin-top: 20px;">
        <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="currentPageSize"
            :page-sizes="pageSizes"
            :disabled="disabled"
            :background="background"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            @size-change="handlePageSizeChange"
            @current-change="handlePageChange"
        />
      </div>
    </el-main>
  </el-container>

  <!--rich text-->
  <el-drawer v-model="drawer" size="80%" direction="btt" title="发布帖子">
    <el-form :model="form">
      <el-form-item label="标题">
        <el-input v-model="form.postTitle" placeholder="请输入标题" autocomplete="off"/>
      </el-form-item>
      <el-form-item label="分区">
        <el-select
            v-model="form.postArea"
            placeholder="请选择分区"
        >
          <el-option label="学习生活" value="1"/>
          <el-option label="日常事务" value="2"/>
          <el-option label="情感交流" value="3"/>
          <el-option label="潜水吐槽" value="4"/>
          <el-option label="寻找作乐" value="5"/>
        </el-select>
      </el-form-item>

      <el-form-item label="话题" style="display: flex; align-items: center;">
        <el-autocomplete
            v-model="inputValue"
            value-key="name"
            :fetch-suggestions="querySearchAsync"
            clearable
            placeholder="请输入话题"
            @select="handleTagSelect"
            style="flex: 1;"
        />
        <el-button
            :disabled="isNewTagVisible === false || inputValue === ''"
            @click="createTag"
            type="primary"
            style="margin-left: auto;"
        >
          新建话题
        </el-button>
      </el-form-item>


      <el-form-item label="">
        <el-tag
            v-for="tag in tags"
            closable
            @close="removeTag(tag)"
        >{{ tag }}
        </el-tag>
      </el-form-item>


      <el-form-item label="图片">
        <el-upload
            list-type="picture-card"
            :action="'http://47.93.187.154:8082/posts/uploadImg'"
            :on-change="handleChange"
            :before-remove="beforeRemove"
            :on-preview="handlePictureCardPreview"
            :file-list="fileList.front_file"
            multiple
            :limit="1"
            :on-exceed="handleExceed"
            :before-upload="beforeUpload"
            name="img"
        >
        </el-upload>
      </el-form-item>


    </el-form>


    <myEditor @update:content="updateContent"/>

    <!-- 预览图片的弹窗 -->
    <el-dialog
        v-model="previewDialogVisible"
        :visible.sync="previewDialogVisible"
        :title="previewTitle"
        :width="'50%'"
        :before-close="handleClosePreview"
    >
      <img
          v-if="previewImage"
          :src="previewImage"
          alt="Preview Image"
          class="preview-image"
      />
    </el-dialog>

    <div class="demo-drawer__footer">
      <el-button @click="cancelForm">Cancel</el-button>
      <el-button type="primary" @click="submitPost">Submit</el-button>
    </div>
  </el-drawer>
</template>

<script>
import {ElAvatar, ElTag, ElIcon, ElPagination, ElMessage, ElMessageBox} from 'element-plus';
import {ChatLineSquare} from "@element-plus/icons-vue";
import myEditor from "../../components/Editor.vue";
import {reactive, ref} from 'vue';
import PostItem from "@/components/PostItem.vue";
import {post, get} from '@/net';
import {useStore} from "@/stores";

const store = useStore()

export default {
  components: {
    PostItem,
    myEditor,
    ElAvatar,
    ElTag,
    ElIcon,
    ElPagination,
    ChatLineSquare,
  },
  setup() {
    const form = reactive({
      postTitle: '',
      postArea: '',
      postContent: '',
    })
    let drawer = ref(false);
    const posts = ref([]);
    const currentPage = ref(1);
    const currentPageSize = ref(10);

    const pageSizes = [10, 20, 30, 40];
    const total = ref(10);
    const background = ref(true);
    const disabled = ref(false);
    let isNewTagVisible = ref(false);
    const inputValue = ref('');
    const tags = ref([]);
    const newTag = ref('');
    const activeArea = ref(0);
    const tagSuggestions = ref([])


    // 获取帖子数据
    const fetchPosts = async (areaId = 0, pageNumber = 1) => {
      get(`/posts/get/post/${areaId}/${pageNumber}/${currentPageSize.value}`, (message, data) => {
            posts.value = data.records
            total.value = data.total
          }
      )
    }
    const cancelForm = () => {
      drawer.value = false;
    }


    const submitPost = async () => {
      if (!form.postTitle || !form.postArea || !form.postContent ) {
        ElMessage.warning("请填写完整帖子信息")
        return
      }

      if(!form.avatar){
        form.avatar = 'http://47.93.187.154:8082/imgview/1733126975372tmp.png';
      }

      if (tags.value.length > 5) {
        ElMessage.warning("话题数不能多于5个");
        return;
      }

      const userId = store.auth.user.id;

      //TODO 图片上传！！
      const requestData = {
        "userId": userId,
        "postTitle": form.postTitle,
        "postArea": form.postArea,
        "postTags": tags.value,
        "postType": "post",
        "postContents": [
          {
            "type": "text",
            "data": form.postContent,
          },
          {
            "type": "image",
            "data": form.avatar,
          },
        ]
      }
      post(`/posts/add`, requestData,
          (message) => {
            ElMessage.success(message)
            drawer.value = false;
            fetchPosts(activeArea.value, 1);
          }
      )

    };

    const handleAreaChange = async (area) => {
      activeArea.value = area;
      currentPage.value = 1;
      await fetchPosts(activeArea.value, 1);
    };

    const handlePageSizeChange = async (pageSizes) => {
      currentPageSize.value = pageSizes;
      await fetchPosts(activeArea.value, currentPage.value); // 请求新数据
    }


    const handlePageChange = async (page) => {
      currentPage.value = page;
      await fetchPosts(activeArea.value, page); // 请求新数据
    };

    const updateContent = async (newContent) => {
      form.postContent = newContent; // 更新父组件的内容
    };


    const handleTagSelect = (item) => {
      inputValue.value = '';
      isNewTagVisible.value = false;
      addTag(item.name);
    }

    const gameList = ref([])

    const querySearchAsync = async (queryString, cb) => {
      if (queryString.length === 0) {
        return;
      }


      get(`/posts/find/tag/${queryString}`, (message, data) => {
            gameList.value = data.records.map((tag, index) => ({
              id: index + 1,  // 使用索引生成唯一 id
              name: tag       // 将标签作为 name
            }));
            tagSuggestions.value = data.records
            // console.log(tagSuggestions.value)
            // console.log(gameList.value)
            cb(gameList.value)

            isNewTagVisible.value = true
            newTag.value = queryString

          }
      )
    }


    const createTag = () => {
      addTag(newTag.value)
      inputValue.value = '';
      isNewTagVisible.value = false;
      newTag.value = '';
    }

    const addTag = async (tag) => {
      if (tags.value.includes(tag)) {
        ElMessage.warning("已添加过该话题")
        return
      }
      tags.value.push(tag);
    }
    const removeTag = async (tag) => {
      tags.value = tags.value.filter(t => t !== tag);
    }

    // 在组件挂载时获取初始数据
    fetchPosts();


    // 上传图片
    const fileList = ref([]);
    const handleChange = file => {
      if (file.status == "success") {
        fileList.value = [];
        fileList.value.push(file.response);
        form.avatar = file.response.data;
      }
    };
    // 删除
    const beforeRemove = () => {
      const result = new Promise((resolve, reject) => {
        ElMessageBox.confirm("此操作将删除该图片, 是否继续?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
            .then(() => {
              resolve();
              form.avatar = '';
            })
            .catch(() => {
              reject(false);
            });
      });
      return result;
    };

    const handleExceed = () => {
      ElMessage("只能上传一张");
    }

    const previewDialogVisible = ref(false);  // 控制预览弹窗显示
    const previewImage = ref('');  // 存储预览的图片
    const previewTitle = ref('图片预览');  // 预览图片的标题

    const handlePictureCardPreview = (file) => {
      // 获取点击的图片，并设置为预览图片
      previewImage.value = file.url || URL.createObjectURL(file.raw);
      previewDialogVisible.value = true; // 打开图片预览弹窗
    };
    const handleClosePreview = () => {
      previewDialogVisible.value = false;
    };
    const beforeUpload = (file) => {
      const isJpgOrPng = ['image/jpeg', 'image/png'].includes(file.type);
      const isLt2M = file.size / 1024 / 1024 < 2; // 限制文件大小为 2MB

      if (!isJpgOrPng) {
        ElMessage.error('上传头像图片只能是 JPG 或 PNG 格式!');
      }
      if (!isLt2M) {
        ElMessage.error('上传头像图片大小不能超过 2MB!');
      }

      return isJpgOrPng && isLt2M;  // 如果格式和大小都符合，返回 true 继续上传
    };

    return {
      form,
      drawer,
      posts,
      currentPage,
      pageSizes,
      total,
      background,
      disabled,
      inputValue,
      tags,
      tagSuggestions,
      newTag,
      isNewTagVisible,
      currentPageSize,
      handlePageSizeChange,
      handlePageChange,
      cancelForm,
      submitPost,
      updateContent,
      createTag,
      addTag,
      removeTag,
      handleAreaChange,
      handleTagSelect,
      querySearchAsync,


      fileList,
      handleChange,
      beforeRemove,
      handleExceed,
      previewDialogVisible,
      previewTitle,
      handleClosePreview,
      previewImage,
      handlePictureCardPreview,
      beforeUpload
    };
  }
}
;
</script>

<style scoped>

.fixed-header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
}

.content {
  padding-top: 60px;
}

.sidebar {
  width: 200px;
  margin-right: 20px;
}

.post-footer .el-icon {
  margin-right: 5px;
}

.pagination {
  margin-top: 20px;
  text-align: center;
}

.page-select {
  margin: 0 auto;
}
</style>
