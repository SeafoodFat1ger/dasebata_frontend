<template>
  <el-container class="content">
    <!-- 左侧菜单 -->
    <el-aside min-width="300px" width="150px" class="sidebar">
      <el-button
          type="primary"
          class="action-btn"
          @click="drawer = true"
      >
        发起问题
      </el-button>

      <el-button
          v-if="3 === userId"
          type="primary"
          class="action-btn notice-btn"
          @click="addNotice"
      >
        发起公告
      </el-button>

      <el-menu
          default-active="0"
          class="el-menu-vertical-demo"
      >
        <div class="custom-menu">
          <div class="custom-menu-item" @click="handleAreaChange(0)" :class="{ active: activeArea === 0 }">
            全部
          </div>
          <div class="custom-menu-item" @click="handleAreaChange(1)" :class="{ active: activeArea === 1 }">
            学习生活
          </div>
          <div class="custom-menu-item" @click="handleAreaChange(2)" :class="{ active: activeArea === 2 }">
            日常事务
          </div>
          <div class="custom-menu-item" @click="handleAreaChange(3)" :class="{ active: activeArea === 3 }">
            情感交流
          </div>
          <div class="custom-menu-item" @click="handleAreaChange(4)" :class="{ active: activeArea === 4 }">
            潜水吐槽
          </div>
          <div class="custom-menu-item" @click="handleAreaChange(5)" :class="{ active: activeArea === 5 }">
            寻找作乐
          </div>
        </div>
      </el-menu>
    </el-aside>
    <el-main>
      <div style="display: flex; justify-content: flex-start; flex-wrap: wrap;
           gap: 10px; padding: 10px;">
        <PostItem v-for="post in posts" :key="post.postId" :post="post" :needTag="true" :color="'rgba(228,231,255,0.82)'"/>
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
  <el-drawer v-model="drawer" size="80%" direction="btt" title="发布问题">
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
    const userId = store.auth.user.id;


    // 获取帖子数据
    const fetchPosts = async (areaId = 0, pageNumber = 1) => {
      get(`/posts/get/problem/${areaId}/${pageNumber}/${currentPageSize.value}`, (message, data) => {
            posts.value = data.records
            total.value = data.total
            console.log(posts.value);
          }
      )
    }
    const cancelForm = () => {
      drawer.value = false;
    }

    const isNoticePost = ref(false);

    function addNotice() {
      const confirmDelete = confirm("尊敬的管理员您好，您将要发布的公告会通知所有用户~");
      if (confirmDelete) {
        isNoticePost.value = true;
        isNoticePost.value = true;
        drawer.value = true;
      }
    }

    const submitPost = async () => {
      if (!form.postTitle || !form.postArea || !form.postContent ) {
        ElMessage.warning("请填写完整问题信息")
        return
      }
      if(!form.avatar){
        form.avatar='null';
      }
      if (tags.value.length > 5) {
        ElMessage.warning("话题数不能多于5个");
        return;
      }
      const userId = store.auth.user.id;
      const requestData = {
        "userId": userId,
        "postTitle": form.postTitle,
        "postArea": form.postArea,
        "postTags": tags.value,
        "postType": "problem",
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
      let pid = 0;
      console.log(requestData);
      post(`/posts/add`, requestData,
          (message, data) => {
            ElMessage.success(message)
            drawer.value = false;
            fetchPosts(activeArea.value, 1);
            pid=data;
            if (isNoticePost.value) {
              // 将信息发给所有人
              const reqData = {
                message: "管理员发公告了！快去查看吧！ "+"http://39.105.0.52/home/postDetail/"+pid,
                fromId: 3,
              };
              post(`/chats/addAll`, reqData, (message)=>{
                isNoticePost.value = false;
                ElMessage("群发成功");
              })
            }
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
      if (queryString.trim().length === 0) {
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
      activeArea,
      userId,
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
      addNotice,

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

/* 整体侧边栏样式 */
.sidebar {
  background-color: #ffffff;  /* 浅蓝色背景 */
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.sidebar:hover {
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

/* 按钮样式 */
.action-btn {
  background-color: rgba(78, 115, 223, 0.2);
  color: #4e73df;
  font-weight: bold;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.action-btn:hover {
  background-color: rgba(54, 94, 209, 0.3);
  border-color: #365ed1;
  color: #2b4aa4;
  transform: translateY(-3px);
}

.action-btn:focus {
  outline: none;
}

/* 发起公告按钮样式 */
.notice-btn {
  background-color: rgba(220, 169, 251, 0.6);
  color: #af27ff;
  font-weight: bold;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  border: 1px solid #b233ff;
}

.notice-btn:hover {
  background-color: rgba(188, 118, 232, 0.49);
  border-color: #a30aff;
  color: rgb(170, 57, 232);
  transform: translateY(-3px);
}

.notice-btn:focus {
  outline: none;
}

/* El-menu 样式 */
.el-menu-vertical-demo {
  background-color: #f2f5fa;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
  margin-top: 10px;
  padding-top: 10px;
}

/* 每个菜单项的渐变背景 */
.sidebar {
  background-color: #f4f7fc;  /* 浅蓝色背景 */
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.sidebar:hover {
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

/* 按钮样式 */
.action-btn {
  width: 100%;
  margin-left: 0;
  margin-bottom: 15px;
  border-radius: 8px;
  font-weight: bold;
  font-size: 1rem;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.action-btn:hover {
  transform: translateY(-3px);
}

.action-btn:focus {
  outline: none;
}

/* 自定义菜单 */
.custom-menu {
  margin-top: 20px;
}

.custom-menu-item {
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  color: #313131;
  cursor: pointer;
  margin: 5px 0;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, rgba(194, 214, 246, 0.62), rgba(243, 213, 255, 0.72));  /* 蓝紫渐变 */
}

.custom-menu-item:hover {
  background: linear-gradient(135deg, rgba(123, 166, 234, 0.73), #E4A0FFE5); /* 悬停时的渐变效果 */
  transform: translateY(-2px);  /* 悬停时上移 */
}
.custom-menu-item.active {
  background: linear-gradient(135deg, rgba(123, 166, 234, 0.73), #E4A0FFE5); /* 点击后的深色渐变 */
}

/***********/
.content {
  padding-top: 60px;
}

</style>
