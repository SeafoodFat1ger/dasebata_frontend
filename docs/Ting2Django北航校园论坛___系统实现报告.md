# Ting2Django北航校园论坛___系统实现报告

# 一、系统结构设计
本项目采用前后端分离的体系架构，前后端通过API进行数据交互，前端发送API请求到后端，后端与数据库进行数据交互，之后通过API在返回给前端，从而实现前后端联调。
## 1.1 体系结构

### 1.1.1总体结构

### 1.1.2前端结构

### 1.1.3后端结构
#### 后端体系架构
系统后端采用Java + SpringBoot + MyBatis进行实现，Controller层捕获API请求之后，调用Service层方法进行处理，Service层调用Mapper层函数与数据库进行交互，最后由Controller层返回前端。
#### 后端实现环境
- 数据库：GaussDB(for MySQL)（关系型数据库）。
- 后端框架：Spring Boot 2.6.13
- 本地主要环境：jdk-1.8 + maven-3.9.9 + mysql-8.0.37
- Maven相关依赖：
  - org.springframework.boot:spring-boot-starter-jdbc:2.6.13
  - org.springframework.boot:spring-boot-starter-thymeleaf:2.6.13
  - org.springframework.boot:spring-boot-starter-web:2.6.13
  - org.mybatis.spring.boot:mybatis-spring-boot-starter:2.2.2
  - org.springframework.boot:spring-boot-starter-test:2.6.13
  - org.jsoup:jsoup:1.14.3
  - org.projectlombok:lombok:1.18.24
  - com.mysql:mysql-connector-j:8.0.31

本地启动
```cmd
// 启动命令
mvn clean package && java -jar target/BUAAbbs-0.0.1-SNAPSHOT.jar

// 本地后端请求
http://localhost:8082
```
### 1.1.4 前后端通信

采用axios 进行前后端通信。

## 1.2 功能结构

### 1. 用户功能

- **注册与登录**：用户可以注册新账户，使用用户名和密码进行登录。
- **个人资料管理**：用户可以查看和编辑个人资料，包括头像、简介等信息。
- **标签管理**：用户可以关注感兴趣的标签，以便获取相关内容。
### 2. 帖子功能
- **发帖**：用户可以发布帖子，包含标题、内容和标签。
- **查看帖子**：用户可以浏览所有帖子，按照时间、点赞数等排序。
- **帖子分类**：根据标签对帖子进行分类，便于用户查找。
- **帖子热度**：用户可以在首页看到帖子热榜，了解不同类型的热榜话题。
- **删除帖子**：用户可以删除自己发布的贴子。
### 3. 评论功能
- **评论帖子**：用户可以对帖子进行评论，发表自己的看法。
- **查看评论**：用户可以查看帖子的所有评论，了解其他用户的观点。
- **删除评论**：用户可以删除自己发布的评论，帖子拥有者可以删除帖子的任意评论。
### 4. 点赞功能
- **点赞帖子**：用户可以对帖子进行点赞，表达对内容的认可。
- **查看点赞**：用户可以查看自己点赞的帖子列表。
- **查看点赞数**：用户可以查看每个帖子的点赞数量，了解其受欢迎程度。
### 5. 收藏功能
- **收藏帖子**：用户可以将感兴趣的帖子收藏，方便日后查阅。
- **查看收藏**：用户可以查看自己收藏的帖子列表。
- **查看收藏数**：用户可以查看每个帖子的收藏数量，了解其受欢迎程度。
### 6. 私信功能
- **发送私信**：用户可以向其他用户发送私信，进行一对一交流。
- **查看私信**：用户可以查看自己的私信记录，下拉可以刷新记录。
- **查看联系人**：用户可以查看与自己有消息往来的用户。

### 7. 管理员功能
- **用户管理**：管理员可以查看、编辑或删除用户信息。
- **帖子管理**：管理员可以审核、删除不当帖子，维护论坛秩序。
- **评论管理**：管理员可以管理评论，删除不当评论。
### 8. 标签分区功能
- **帖子分区**：用户可以根据分区对帖子进行筛选，查看自己感兴趣的分区。
- **标签管理**：用户可以查看所有标签、以及使用了该标签的所有帖子。
- **问题帖子**：用户可以发布问题和文章，作为帖子的两种表现形式。
### 9. 搜索通知功能
- **字符串搜索**：用户可以输入字符串，搜索包含该字符串的帖子、用户或者标签。
- **消息通知**：当用户收到点赞、收藏或者评论时，系统会以私信的形式通知用户。
## 二、数据库基本表定义
### 1. 用户表 (Users)
**功能**: 存储论坛用户的信息，包括用户名、密码和其他个人资料。
**字段**:
- id: 唯一标识每个用户的主键。
- username: 用户的昵称，不同用户的用户名必须唯一。
- email: 用户的电子邮件地址，在系统中也需唯一，通常用于密码重置等功能。
- password: 存储用户密码，以保护用户的隐私安全，建议使用加密存储。
- created_at: 记录用户账户的创建时间，用于审计和用户管理。
- last_login: 记录用户最后一次登录的时间，方便追踪账户活动。
- profile: 用户个人简介，以展示在用户个人资料或帖子中。
- avatar: 用户头像的 URL，用于在论坛中显示用户的个人形象。

| 字段名       | 类型          | 含义                     |
|--------------|---------------|--------------------------|
| id           | int           | 用户唯一标识             |
| username     | varchar(50)   | 用户名                   |
| email        | varchar(100)  | 用户邮箱                 |
| password     | varchar(255)  | 用户密码                 |
| created_at   | datetime      | 用户注册时间             |
| last_login   | datetime      | 最后登录时间             |
| profile      | varchar(255)  | 用户个人简介             |
| avatar       | varchar(255)  | 用户头像                 |
### 2. 帖子表 (Posts)
**功能**: 存储用户发布的帖子信息，包括帖子标题、内容和相关属性。
**字段**:
- post_id: 唯一标识每个帖子的主键。
- user_id: 发布帖子的用户ID，关联到用户表，表示该帖子由哪个用户发布。
- post_area: 帖子所属的区域或分类，用于帖子管理和展示。
- post_type: 帖子的类型（如问答、分享等），用于内容分类和过滤。
- post_title: 帖子的标题，简要描述帖子内容。
- created_at: 记录帖子创建的时间，用于排序和管理。

| 字段名       | 类型          | 含义                     |
|--------------|---------------|--------------------------|
| post_id      | int           | 帖子唯一标识             |
| user_id      | int           | 发布用户的ID             |
| post_area    | int           | 帖子区域                 |
| post_type    | varchar(10)   | 帖子类型                 |
| post_title   | varchar(255)  | 帖子标题                 |
| created_at   | datetime      | 帖子创建时间             |
### 3. 用户-标签表 (UserTags)
**功能**: 存储用户关注的标签信息，以便用户获取相关内容。
**字段**:
- id: 唯一标识每个记录的主键。
- user_id: 关注标签的用户ID，关联到用户表。
- tag: 用户关注的标签名称，帮助用户定制内容展示。

| 字段名       | 类型          | 含义                     |
|--------------|---------------|--------------------------|
| id           | int           | 唯一标识                 |
| user_id      | int           | 用户ID                   |
| tag          | varchar(255)  | 用户关注的标签           |
### 4. 帖子-标签表 (PostTags)
**功能**: 存储帖子使用的标签，以便对帖子进行分类和搜索。
**字段**:
- id: 唯一标识每个记录的主键。
- post_id: 关联的帖子ID，表示该标签属于哪个帖子。
- tag: 帖子使用的标签名称，便于用户通过标签查找相关帖子。

| 字段名       | 类型          | 含义                     |
|--------------|---------------|--------------------------|
| id           | int           | 唯一标识                 |
| post_id      | int           | 帖子ID                   |
| tag          | varchar(255)  | 帖子使用的标签           |
### 5. 评论表 (Comments)
**功能**: 存储用户对帖子发表的评论，促进用户之间的互动。
**字段**:
- comment_id: 唯一标识每条评论的主键。
- post_id: 评论所属的帖子ID，关联到帖子表。
- user_id: 发表评论的用户ID，关联到用户表。
- content: 评论的内容，记录用户对帖子的看法和反馈。
- created_at: 记录评论创建的时间，用于排序和管理。

| 字段名       | 类型          | 含义                     |
|--------------|---------------|--------------------------|
| comment_id   | int           | 评论唯一标识             |
| post_id      | int           | 评论所属帖子ID           |
| user_id      | int           | 评论用户ID               |
| content      | TEXT          | 评论内容                 |
| created_at   | datetime      | 评论创建时间             |
### 6. 帖子-内容表 (PostContents)
**功能**: 存储帖子的详细内容，可以用于多种内容类型。
**字段**:
- id: 唯一标识每条内容的主键。
- post_id: 关联的帖子ID，表示该内容属于哪个帖子。
- type: 内容的类型（如文本、图片、视频等），用于内容展示。
- data: 内容数据，存储具体的内容信息。

| 字段名       | 类型          | 含义                     |
|--------------|---------------|--------------------------|
| id           | int           | 唯一标识                 |
| post_id      | int           | 帖子ID                   |
| type         | varchar(10)   | 内容类型                 |
| data         | TEXT          | 内容数据                 |
### 7. 点赞表 (Likes)
**功能**: 存储用户对帖子进行点赞的记录，反映帖子受欢迎程度。
**字段**:
- id: 唯一标识每条点赞记录的主键。
- post_id: 点赞的帖子ID，关联到帖子表。
- user_id: 点赞用户的ID，关联到用户表。
- create_time: 点赞时间，记录用户何时对帖子进行点赞。

| 字段名       | 类型          | 含义                     |
|--------------|---------------|--------------------------|
| id           | int           | 唯一标识                 |
| post_id      | int           | 点赞的帖子ID             |
| user_id      | int           | 点赞用户ID               |
| create_time  | datetime      | 点赞时间                 |
### 8. 收藏表 (Bookmarks)
**功能**: 存储用户对帖子进行收藏的记录，方便用户日后查看。
**字段**:
- id: 唯一标识每条收藏记录的主键。
- post_id: 收藏的帖子ID，关联到帖子表。
- user_id: 收藏用户的ID，关联到用户表。
- create_time: 收藏时间，记录用户何时对帖子进行收藏。

| 字段名       | 类型          | 含义                     |
|--------------|---------------|--------------------------|
| id           | int           | 唯一标识                 |
| post_id      | int           | 收藏的帖子ID             |
| user_id      | int           | 收藏用户ID               |
| create_time  | datetime      | 收藏时间                 |
### 9. 消息表 (Chats)
**功能**: 存储用户之间的私信记录，促进用户之间的交流。
**字段**:
- chat_id: 唯一标识每条消息的主键。
- from_id: 发送者用户的ID，关联到用户表。
- to_id: 接收者用户的ID，关联到用户表。
- message: 消息内容，记录用户发送的具体信息。
- created_at: 消息发送时间，便于用户查看聊天记录的时间顺序。

| 字段名       | 类型          | 含义                     |
|--------------|---------------|--------------------------|
| chat_id      | int           | 消息唯一标识             |
| from_id      | int           | 发送者用户ID             |
| to_id        | int           | 接收者用户ID             |
| message       | varchar(255)  | 消息内容                 |
| created_at   | datetime      | 消息发送时间             |
## 三、系统重要功能实现方法

### 鉴权实现

#### 路由守护

#### 文件上传

#### 图床

### 触发器设计与实现

触发器一方面通过MySQL建表语句进行约束，另一方面在Java中建立相应的实体类，与数据库进行交互。
### 1. 用户
建表语句如下
id为主键，实现自增约束
对username和email进行唯一性约束，确保用户名和邮箱不会重复
id、username、email、password字段以NOT NULL约束，其余字段默认为NULL
```sql
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `last_login` datetime DEFAULT NULL,
  `profile` varchar(255) DEFAULT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```
实体类如下
```java
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class User {
    private Integer id;
    private String username;
    private String email;
    private String password;
    private LocalDateTime createdAt;
    private LocalDateTime lastLogin;
    private String profile;
    private String avatar;
}
```
### 2. 帖子
建表语句如下
post_id为主键，实现自增约束
user_id为外键，posts_ibfk_1为user_id的外键约束
created_at字段默认为NULL，其余字段都以NOT NULL约束
```sql
CREATE TABLE `posts` (
  `post_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `post_area` int NOT NULL,
  `post_type` varchar(10) NOT NULL,
  `post_title` varchar(255) NOT NULL,
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`post_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `posts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```
实体类如下
```java
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Post {
    private Integer postId;
    private Integer userId;
    private Integer postArea;
    private String postType;
    private String postTitle;
    private LocalDateTime createdAt;
    private Integer postCommentNum;
    private Integer postLikeNum;
    private Integer postBookmarkNum;
}
```
### 3. 用户-标签
建表语句如下
id为主键，实现自增约束
所有字段都以NOT NULL约束
user_id为外键，usertags_ibfk_1为user_id的外键约束
对(user_id,tag)实现唯一性约束，确保用户不会重复关注同一个tag
```sql
CREATE TABLE `usertags` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `tag` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`,`tag`),
  CONSTRAINT `usertags_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```
实体类如下
```java
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserTag {
    private Integer id;
    private Integer userId;
    private String tag;
}
```
### 4. 帖子-标签
建表语句如下
id为主键，实现自增约束
所有字段都以NOT NULL约束
post_id为外键，posttags_ibfk_1为post_id的外键约束
对(post_id,tag)实现唯一性约束，确保帖子不会重复引用同一个tag

```sql
CREATE TABLE `posttags` (
  `id` int NOT NULL AUTO_INCREMENT,
  `post_id` int NOT NULL,
  `tag` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `post_id` (`post_id`,`tag`),
  CONSTRAINT `posttags_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `posts` (`post_id`)
) ENGINE=InnoDB AUTO_INCREMENT=47 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```
实体类如下
```java
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PostTag {
    private Integer id;
    private Integer postId;
    private String tag;
}
```
### 5. 评论
建表语句如下
comment_id为主键，实现自增约束
created_at字段默认为NULL，其余字段都以NOT NULL约束
post_id为外键，comments_ibfk_1为post_id的外键约束
user_id为外键，comments_ibfk_2为user_id的外键约束
```sql
CREATE TABLE `comments` (
  `comment_id` int NOT NULL AUTO_INCREMENT,
  `post_id` int NOT NULL,
  `user_id` int NOT NULL,
  `content` text NOT NULL,
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`comment_id`),
  KEY `post_id` (`post_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `posts` (`post_id`),
  CONSTRAINT `comments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```
实体类如下
```java
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Comment {
    private Integer commentId;
    private Integer postId;
    private Integer userId;
    private String content;
    private LocalDateTime createdAt;
}
```
### 6. 帖子-内容
建表语句如下
id为主键，实现自增约束
所有字段以NOT NULL 约束
post_id为外键，postcontents_ibfk_1为post_id的外键约束
```sql
CREATE TABLE `postcontents` (
  `id` int NOT NULL AUTO_INCREMENT,
  `post_id` int NOT NULL,
  `type` varchar(10) NOT NULL,
  `data` text NOT NULL,
  PRIMARY KEY (`id`),
  KEY `post_id` (`post_id`),
  CONSTRAINT `postcontents_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `posts` (`post_id`)
) ENGINE=InnoDB AUTO_INCREMENT=67 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```
实体类如下
```java
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PostContent {
    private Integer id;
    private Integer postId;
    private String type;
    private String data;
}
```
### 7. 点赞
建表语句如下
id为主键，实现自增约束
create_time字段默认为NULL，其余字段都以NOT NULL约束
对(post_id,user_id)实现唯一性约束，确保用户不会重复点赞同一个帖子
post_id为外键，likes_ibfk_1为post_id的外键约束
user_id为外键，likes_ibfk_2为user_id的外键约束
```sql
CREATE TABLE `likes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `post_id` int NOT NULL,
  `user_id` int NOT NULL,
  `create_time` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `post_id` (`post_id`,`user_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `likes_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `posts` (`post_id`),
  CONSTRAINT `likes_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```
实体类如下
```java
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class LikeBookmark {
    private Integer postId;
    private Integer userId;
    private LocalDateTime createTime;
}
```
### 8. 收藏
建表语句如下
id为主键，实现自增约束
create_time字段默认为NULL，其余字段都以NOT NULL约束
对(post_id,user_id)实现唯一性约束，确保用户不会重复点赞同一个帖子
post_id为外键，bookmarks_ibfk_1为post_id的外键约束
user_id为外键，bookmarks_ibfk_2为user_id的外键约束
```sql
CREATE TABLE `bookmarks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `post_id` int NOT NULL,
  `user_id` int NOT NULL,
  `create_time` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `post_id` (`post_id`,`user_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `bookmarks_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `posts` (`post_id`),
  CONSTRAINT `bookmarks_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```
实体类如下
```java
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class LikeBookmark {
    private Integer postId;
    private Integer userId;
    private LocalDateTime createTime;
}
```
### 9. 消息
建表语句如下
chat_id为主键，实现自增约束
created_at字段默认为NULL，其余字段都以NOT NULL约束
from_id为外键，chats_ibfk_1为from_id的外键约束
to_id为外键，chats_ibfk_2为to_id的外键约束
```sql
CREATE TABLE `chats` (
  `chat_id` int NOT NULL AUTO_INCREMENT,
  `from_id` int NOT NULL,
  `to_id` int NOT NULL,
  `message` varchar(255) NOT NULL,
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`chat_id`),
  KEY `chats_ibfk_1` (`from_id`),
  KEY `chats_ibfk_2` (`to_id`),
  CONSTRAINT `chats_ibfk_1` FOREIGN KEY (`from_id`) REFERENCES `users` (`id`),
  CONSTRAINT `chats_ibfk_2` FOREIGN KEY (`to_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=47 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```
实体类如下
```java
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Chat {
    private Integer chatId;
    private Integer fromId;
    private Integer toId;
    private String message;
    private LocalDateTime createdAt;
}
```
### 存储过程设计与实现
后端基于xml文件映射，使用MyBatis调用存储过程，操作数据库数据。下面介绍各个Mapper层数据库交互函数的定义和实现。
### User
UserMapper接口内容如下
```java
// 用户表users插入数据
@Insert("INSERT INTO users (username, email, password, created_at) VALUES (#{username}, #{email}, #{password}, #{createdAt})")
void insert(User user);

// 根据userId查询用户
@Select("SELECT * FROM users WHERE id = #{userId}")
User findById(@Param("userId") Integer userId);

// 根据username查询用户
@Select("SELECT * FROM users WHERE username = #{username}")
User findByUsername(@Param("username") String username);

// 根据userId删除用户
@Delete("DELETE FROM users WHERE id = #{userId}")
void deleteById(@Param("userId") Integer userId);

// 根据email查询用户
@Select("SELECT * FROM users WHERE email = #{email}")
User findByEmail(@Param("email") String email);

// 更新用户信息，参与xml映射
void update(User user);

// 用户-标签表usertags插入数据
@Insert("INSERT INTO usertags (user_id, tag) VALUES (#{userId}, #{tag})")
void insertUserTag(UserTagDto userTagDto);

// 查询关注tag的用户数量
@Select("SELECT count(*) FROM usertags WHERE tag = #{tag}")
Integer countTagFocus(@Param("tag") String tag);

// 根据userId和tag查询相应的关注信息
@Select("SELECT * FROM usertags WHERE user_id = #{userId} AND tag = #{tag}")
UserTagDto selectRecord(@Param("userId") Integer userId, @Param("tag") String tag);

// 根据userId和tag删除相应的关注信息
@Delete("DELETE FROM usertags WHERE user_id = #{userId} AND tag = #{tag}")
void deleteUserTag(UserTagDto userTagDto);

// 查询所有用户，按注册时间倒序返回
@Select("SELECT * FROM users ORDER BY created_at DESC")
List<User> findAll();
```
UserMapper.xml文件内容如下，update函数参与映射
```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
        "http://mybatis.org/dtd/mybatis-3-mapper.dtd" >
<mapper namespace="com.bbs.mapper.UserMapper">
    <update id="update" parameterType="com.bbs.entity.User">
        update users
        <set>
            <if test="username != null"> username = #{username},</if>
            <if test="email != null"> email = #{email},</if>
            <if test="password != null"> password = #{password},</if>
            <if test="createdAt != null"> created_at = #{createdAt},</if>
            <if test="lastLogin != null"> last_login = #{lastLogin},</if>
            <if test="profile != null"> profile = #{profile},</if>
            <if test="avatar != null"> avatar = #{avatar}</if>
        </set>
        where id = #{id}
    </update>
</mapper>
```
### Post
PostMapper接口内容如下
```java
// 帖子表posts插入数据
void insertPost(Post post);
    
// 帖子-标签表posttags插入数据
void insertPostTag(PostTag postTag);

// 帖子-内容表postcontents插入数据
void insertPostContent(PostContent postContent);

// 分页查询所有帖子，以帖子种类、帖子分区、引用标签和发布者为筛选
List<Post> pageQuery(@Param("postType") String postType, @Param("postArea") int postArea,
                    @Param("pageNumber") int pageNumber, @Param("pageSize") int pageSize,
                    @Param("tag") String tag, @Param("userId") Integer userId);

// 查询帖子数量，以帖子种类、引用标签、帖子分区和发布者为筛选
Integer countByTypeTagAreaUser(@Param("postType") String postType, @Param("tag") String tag,
                    @Param("postArea") Integer postArea, @Param("userId") Integer userId);

// 根据postId查询帖子-标签信息
List<String> searchPostTags(@Param("postId") Integer postId);

// 根据postId查询帖子-内容信息
List<PostContentDto> searchPostContents(@Param("postId") Integer postId);

// 根据postId查询帖子信息
Post searchPostById(@Param("postId") Integer postId);

// 分页查询所有tag
List<String> searchAllTagsPage(@Param("pageNumber") int pageNumber, @Param("pageSize") int pageSize);

// 查询tag总数量
@Select("SELECT count(DISTINCT tag) FROM posttags")
Integer countTags();

// 评论表comments插入数据
void insertComment(Comment comment);

// 查询所有tag
@Select("SELECT DISTINCT tag FROM posttags")
List<String> searchAllTags();

// 根据userId分页查询点赞记录
List<Post> pageQueryLikeByUserId(@Param("userId") Integer userId, @Param("pageNumber") int pageNumber, @Param("pageSize") int pageSize);

// 根据userId分页查询收藏记录
List<Post> pageQueryBookmarkByUserId(@Param("userId") Integer userId, @Param("pageNumber") int pageNumber, @Param("pageSize") int pageSize);

// 根据postId删除帖子
@Delete("DELETE FROM posts WHERE post_id = #{postId}")
void deletePost(Integer postId);

// 根据postId删除帖子所有评论
@Delete("DELETE FROM comments WHERE post_id = #{postId}")
void deleteCommentByPostId(Integer postId);

// 根据postId删除帖子-内容信息
@Delete("DELETE FROM postcontents WHERE post_id = #{postId}")
void deletePostContentByPostId(Integer postId);

// 根据postId删除帖子-标签信息
@Delete("DELETE FROM posttags WHERE post_id = #{postId}")
void deletePostTagsByPostId(Integer postId);

// 查询最热门的10条帖子，以点赞数量、收藏数量、评论数量以及三者之和为权重类别，以帖子种类为筛选
List<Post> queryHot(@Param("postType") String postType, @Param("like") int like, @Param("bookmark") int bookmark,
                    @Param("comment") int comment, @Param("all") int all);
```
PostMapper.xml文件内容如下，insertPost、insertPostTag、insertPostContent、insertComment、pageQuery、searchPostTags、searchPostContents、searchAllTagsPage、countByTypeTagAreaUser、pageQueryLikeByUserId、pageQueryBookmarkByUserId、searchPostById、queryHot等函数参与映射
```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
        "http://mybatis.org/dtd/mybatis-3-mapper.dtd" >
<mapper namespace="com.bbs.mapper.PostMapper">
    <sql id="Base_Column_List">
        post_id, user_id, post_area, post_type, post_title, created_at
    </sql>
    <insert id="insertPost" useGeneratedKeys="true" keyProperty="postId">
        INSERT INTO posts (user_id, post_area, post_type, post_title, created_at)
        VALUES (#{userId}, #{postArea}, #{postType}, #{postTitle}, #{createdAt})
    </insert>
    <insert id="insertPostTag" useGeneratedKeys="true" keyProperty="id">
        INSERT INTO posttags (post_id, tag)
        VALUES (#{postId}, #{tag})
    </insert>
    <insert id="insertPostContent" useGeneratedKeys="true" keyProperty="id">
        INSERT INTO postcontents (post_id, type, data)
        VALUES (#{postId}, #{type}, #{data})
    </insert>
    <insert id="insertComment" useGeneratedKeys="true" keyProperty="commentId">
        INSERT INTO comments (post_id, user_id, content, created_at)
        VALUES (#{postId}, #{userId}, #{content}, #{createdAt})
    </insert>
    <select id="pageQuery" resultType="com.bbs.entity.Post">
        SELECT
        distinct posts.post_id, posts.user_id, posts.post_area, posts.post_type, posts.post_title, posts.created_at,
        COUNT(likes.id) AS post_like_num,  -- 点赞数量
        COUNT(bookmarks.id) AS post_bookmark_num,  -- 收藏数量
        COUNT(comments.comment_id) AS post_comment_num  -- 评论数量
        FROM posts
        <if test="tag != null">
            JOIN posttags
            ON posts.post_id = posttags.post_id
        </if>
        LEFT JOIN likes ON posts.post_id = likes.post_id  -- 左连接点赞表
        LEFT JOIN bookmarks ON posts.post_id = bookmarks.post_id  -- 左连接收藏表
        LEFT JOIN comments ON posts.post_id = comments.post_id  -- 左连接评论表
        WHERE 1=1
        <if test="userId != null">
            AND posts.user_id = #{userId}
        </if>
        <if test="postType != null">
            AND posts.post_type = #{postType}
        </if>
        <if test="tag != null">
            AND posttags.tag = #{tag}
        </if>
        <if test="postArea != 0">
            AND posts.post_area = #{postArea}
        </if>
        GROUP BY
        posts.post_id,
        posts.user_id,
        posts.post_area,
        posts.post_type,
        posts.post_title,
        posts.created_at
        ORDER BY posts.created_at DESC
        <if test="pageSize != 0">
            LIMIT ${pageSize*(pageNumber-1)},#{pageSize}
        </if>
    </select>
    <select id="searchPostTags" resultType="java.lang.String">
        SELECT tag FROM posttags WHERE post_id = #{postId}
    </select>
    <select id="searchPostContents" resultType="com.bbs.dto.PostContentDto">
        SELECT type, data FROM postcontents WHERE post_id = #{postId}
    </select>
    <select id="searchAllTagsPage" resultType="java.lang.String">
        SELECT DISTINCT tag FROM posttags
        <if test="pageSize != 0">
            LIMIT ${pageSize*(pageNumber-1)},#{pageSize}
        </if>
    </select>
    <select id="countByTypeTagAreaUser" resultType="java.lang.Integer">
        SELECT count(distinct posts.post_id)
        FROM posts
        <if test="tag != null">
            JOIN posttags
            ON posts.post_id = posttags.post_id
        </if>
        WHERE 1=1
        <if test="postType != null">
            AND posts.post_type = #{postType}
        </if>
        <if test="tag != null">
            AND posttags.tag = #{tag}
        </if>
        <if test="postArea != 0">
            AND posts.post_area = #{postArea}
        </if>
        <if test="userId != null">
            AND posts.user_id = #{userId}
        </if>
    </select>
    <select id="pageQueryLikeByUserId" resultType="com.bbs.entity.Post">
        SELECT
        posts.post_id,
        posts.user_id,
        posts.post_area,
        posts.post_type,
        posts.post_title,
        posts.created_at,
        IFNULL(like_counts.post_like_num, 0) AS post_like_num,  -- 点赞数量
        IFNULL(bookmark_counts.post_bookmark_num, 0) AS post_bookmark_num,  -- 收藏数量
        IFNULL(comment_counts.post_comment_num, 0) AS post_comment_num  -- 评论数量
        FROM
        posts
        LEFT JOIN (
        SELECT post_id, COUNT(id) AS post_like_num
        FROM likes
        GROUP BY post_id
        ) AS like_counts ON posts.post_id = like_counts.post_id  -- 聚合后的点赞数量

        LEFT JOIN (
        SELECT post_id, COUNT(id) AS post_bookmark_num
        FROM bookmarks
        GROUP BY post_id
        ) AS bookmark_counts ON posts.post_id = bookmark_counts.post_id  -- 聚合后的收藏数量

        LEFT JOIN (
        SELECT post_id, COUNT(comment_id) AS post_comment_num
        FROM comments
        GROUP BY post_id
        ) AS comment_counts ON posts.post_id = comment_counts.post_id  -- 聚合后的评论数量
        WHERE posts.post_id IN (
        SELECT post_id FROM likes
        WHERE 1=1
        <if test="userId != null">
        AND user_id = #{userId}
    </if>
        )
        ORDER BY posts.created_at DESC
        <if test="pageSize != 0">
    LIMIT ${pageSize*(pageNumber-1)}, #{pageSize}
</if>
    </select>
    <select id="pageQueryBookmarkByUserId" resultType="com.bbs.entity.Post">
        SELECT
        posts.post_id,
        posts.user_id,
        posts.post_area,
        posts.post_type,
        posts.post_title,
        posts.created_at,
        IFNULL(like_counts.post_like_num, 0) AS post_like_num,  -- 点赞数量
        IFNULL(bookmark_counts.post_bookmark_num, 0) AS post_bookmark_num,  -- 收藏数量
        IFNULL(comment_counts.post_comment_num, 0) AS post_comment_num  -- 评论数量
        FROM
        posts
        LEFT JOIN (
        SELECT post_id, COUNT(id) AS post_like_num
        FROM likes
        GROUP BY post_id
        ) AS like_counts ON posts.post_id = like_counts.post_id  -- 聚合后的点赞数量

        LEFT JOIN (
        SELECT post_id, COUNT(id) AS post_bookmark_num
        FROM bookmarks
        GROUP BY post_id
        ) AS bookmark_counts ON posts.post_id = bookmark_counts.post_id  -- 聚合后的收藏数量

        LEFT JOIN (
        SELECT post_id, COUNT(comment_id) AS post_comment_num
        FROM comments
        GROUP BY post_id
        ) AS comment_counts ON posts.post_id = comment_counts.post_id  -- 聚合后的评论数量
        WHERE posts.post_id IN (
        SELECT post_id FROM bookmarks
        WHERE 1=1
        <if test="userId != null">
        AND user_id = #{userId}
    </if>
        )
        ORDER BY posts.created_at DESC
        <if test="pageSize != 0">
    LIMIT ${pageSize*(pageNumber-1)}, #{pageSize}
</if>
    </select>
    <select id="searchPostById" resultType="com.bbs.entity.Post">
        SELECT posts.post_id, posts.user_id, posts.post_area, posts.post_type, posts.post_title, posts.created_at,
        COUNT(likes.id) AS post_like_num,  -- 点赞数量
        COUNT(bookmarks.id) AS post_bookmark_num,  -- 收藏数量
        COUNT(comments.comment_id) AS post_comment_num  -- 评论数量
        FROM posts
        LEFT JOIN likes ON posts.post_id = likes.post_id  -- 左连接点赞表
        LEFT JOIN bookmarks ON posts.post_id = bookmarks.post_id  -- 左连接收藏表
        LEFT JOIN comments ON posts.post_id = comments.post_id  -- 左连接评论表
        WHERE 1=1
        <if test="postId != null">
            AND posts.post_id = #{postId}
        </if>
    </select>
    <select id="queryHot" resultType="com.bbs.entity.Post">
        SELECT
        distinct posts.post_id, posts.user_id, posts.post_area, posts.post_type, posts.post_title, posts.created_at,
        COUNT(likes.id) AS post_like_num,  -- 点赞数量
        COUNT(bookmarks.id) AS post_bookmark_num,  -- 收藏数量
        COUNT(comments.comment_id) AS post_comment_num  -- 评论数量
        FROM posts
        LEFT JOIN likes ON posts.post_id = likes.post_id  -- 左连接点赞表
        LEFT JOIN bookmarks ON posts.post_id = bookmarks.post_id  -- 左连接收藏表
        LEFT JOIN comments ON posts.post_id = comments.post_id  -- 左连接评论表
        WHERE 1=1
        <if test="postType != null">
            AND posts.post_type = #{postType}
        </if>
        GROUP BY
        posts.post_id,
        posts.user_id,
        posts.post_area,
        posts.post_type,
        posts.post_title,
        posts.created_at
        <if test="like != 0">
            ORDER BY post_like_num DESC,  -- 按点赞数量排序
        </if>
        <if test="bookmark != 0">
            ORDER BY post_bookmark_num DESC,  -- 按点赞数量排序
        </if>
        <if test="comment != 0">
            ORDER BY post_comment_num DESC,  -- 按点赞数量排序
        </if>
        <if test="all != 0">
            ORDER BY post_like_num + post_bookmark_num + post_comment_num DESC,  -- 按点赞数量排序
        </if>
        posts.created_at DESC
        LIMIT 10  -- 只返回点赞数量最多的10条帖子
    </select>
</mapper>
```
### Like
LikeMapper接口内容如下
```java
// 点赞表likes插入数据
@Insert("INSERT INTO likes (post_id, user_id, create_time) VALUES (#{postId}, #{userId}, #{createTime})")
void insertLike(LikeBookmark likeBookmark);

// 根据userId获取用户点赞记录，按点赞时间倒序
@Select("SELECT post_id FROM likes WHERE user_id = #{userId} ORDER BY create_time DESC")
List<Integer> getPostsByUserId(Integer userId);

// 根据postId查询帖子的点赞数量
@Select("SELECT count(*) FROM likes WHERE post_id = #{postId}")
Integer countByPostId(Integer postId);

// 根据userId查询用户点赞过的帖子数量
@Select("SELECT count(*) FROM likes WHERE user_id = #{userId}")
Integer countByUserId(Integer userId);

// 根据userId和postId删除点赞记录
@Delete("DELETE FROM likes WHERE user_id = #{userId} AND post_id = #{postId}")
void deleteLike(LikeBookmarkDto likeBookmarkDto);

// 根据postId删除帖子所有点赞记录
@Delete("DELETE FROM likes WHERE post_id = #{postId}")
void deleteByPostId(Integer postId);

// 根据userId和postId查询点赞信息
 @Select("SELECT * FROM likes WHERE user_id = #{userId} AND post_id = #{postId}")
LikeBookmarkDto selectRecord(@Param("userId") Integer userId, @Param("postId") Integer postId);
```
LikeMapper.xml文件置空，没有需要参与映射的函数
### Bookmark
BookmarkMapper接口内容如下
```java
// 收藏表bookmarks插入数据
@Insert("INSERT INTO bookmarks (post_id, user_id, create_time) VALUES (#{postId}, #{userId}, #{createTime})")
void insertBookmark(LikeBookmark likeBookmark);

// 根据userId获取用户收藏记录，按收藏时间倒序
@Select("SELECT post_id FROM bookmarks WHERE user_id = #{userId} ORDER BY create_time DESC")
List<Integer> getPostsByUserId(Integer userId);

// 根据postId查询帖子的收藏数量
@Select("SELECT count(*) FROM bookmarks WHERE post_id = #{postId}")
Integer countByPostId(Integer postId);

// 根据userId查询用户收藏过的帖子数量
@Select("SELECT count(*) FROM bookmarks WHERE user_id = #{userId}")
Integer countByUserId(Integer userId);

// 根据userId和postId删除收藏记录
@Delete("DELETE FROM bookmarks WHERE user_id = #{userId} AND post_id = #{postId}")
void deleteBookmark(LikeBookmarkDto likeBookmarkDto);

// 根据postId删除帖子所有收藏记录
@Delete("DELETE FROM bookmarks WHERE post_id = #{postId}")
void deleteByPostId(Integer postId);

// 根据userId和postId查询收藏信息
@Select("SELECT * FROM bookmarks WHERE user_id = #{userId} AND post_id = #{postId}")
LikeBookmarkDto selectRecord(@Param("userId") Integer userId, @Param("postId") Integer postId);
```
BookmarkMapper.xml文件置空，没有需要参与映射的函数
### Chat
ChatMapper接口内容如下
```java
// 根据userId查找用户联系人
List<Integer> findFriends(@Param("userId") Integer userId);
    
// 消息表chats插入数据
@Insert("INSERT INTO chats (from_id, to_id, message, created_at) " +
    "VALUES (#{fromId}, #{toId}, #{message}, #{createdAt})")
void insert(Chat chat);

// 根据userId1和userId2分页查询用户之间的聊天记录
List<Chat> selectAll(@Param("userId1") Integer userId1, @Param("userId2") Integer userId2, @Param("pageNumber") int pageNumber, @Param("pageSize") int pageSize);

// 根据userId1和userId2查询聊天记录总数
Integer count(@Param("userId1") Integer userId1, @Param("userId2") Integer userId2);
```
ChatMapper.xml文件如下，findFriends、selectAll、count等函数参与映射
```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
        "http://mybatis.org/dtd/mybatis-3-mapper.dtd" >
<mapper namespace="com.bbs.mapper.ChatMapper">
    <select id="findFriends" resultType="java.lang.Integer">
        SELECT DISTINCT from_id AS userId
        FROM chats
        WHERE to_id = #{userId}
        UNION
        SELECT DISTINCT to_id AS userId
        FROM chats
        WHERE from_id = #{userId}
    </select>
    <select id="selectAll" resultType="com.bbs.entity.Chat">
        SELECT *  FROM chats
        WHERE (from_id = #{userId1} AND to_id = #{userId2})
        OR (from_id = #{userId2} AND to_id = #{userId1})
        ORDER BY created_at DESC
        <if test="pageSize != 0">
            LIMIT ${pageSize*(pageNumber-1)},#{pageSize}
        </if>
    </select>
    <select id="count" resultType="java.lang.Integer">
        SELECT COUNT(chat_id)  FROM chats
        WHERE (from_id = #{userId1} AND to_id = #{userId2})
        OR (from_id = #{userId2} AND to_id = #{userId1})
    </select>
</mapper>
```
## 四、系统实现效果

### 登录注册

#### 首页

#### 登录

#### 注册

#### 登出

### 帖子

### 个人信息

### 管理员

## 五、总结
@**张馨月：**本次数据库作业应该是我第一次参与实现基于Web的中等规模数据库应用系统。由于选题十分自由，我们小组经过讨论选择了学校目前恰好相对缺失的学生论坛；所以正如登录界面的那一行”这是数据库大作业，更是我们的自由之地“，我在[39.105.0.52](http://39.105.0.52/)这片由我们搭建的BBS里实在是学到了很多东西。

当时确定选题后我们很快构建了数据库的实体及其联系，画出了E-R图和大致的表格，也勾勒出了我们对前端页面的构想。学期初刚开工的时候我们进度还较为缓慢，对于当时没有任何前后端基础的我来说，从前端的js语法到axios中的post、get请求，从最简单的html元素到复杂一些的诸如Grid，Flex的css样式，这些都需要从零开始学习。之后我们边开发边学，由于忙着平衡各种课，我们大致完成了有基本功能的框架。

到了学期末近DDL的两周我们又集中更新了前端和接口，大家集思广益，又提出了不少新创意（例如举报功能，管理员发消息和公告），大大完善了我们的功能。虽然大家都很忙，但我们已经非常熟悉各自的工作，padding和margin、父子组件通信、异步函数和Promise都已经难不倒我们，~~在ddl的催促下~~我们进展飞快，最终也交上了我们较为满意的作业。

总的看来，通过本次作业我对web端应用开发有了基本的概念，了解了课上学到的SQL语句如何通过后端框架具体地实现出来。对于我负责的前端部分，我对vue组件的编写也有了较为熟悉的掌握，对前端中各种组件的行为和属性也有了大致的了解；此外也学了前后端联调，还看了一些服务器部署、网络相关的知识。

我们其他两位组员干起活来也很认真负责，组里的气氛也非常好（感谢他们对我干活速度慢的包容orzz）。整个实现的过程确实有很多困难，我所负责的前端总有各种各样的细节问题需要修复，很多夜晚都是在localhost调试中度过，发出不知道多少条测试帖子；而当我和室友在手机上用我们的测试版本互相评论发消息时，还是感觉很爽的。我之前一直觉得一个匿名性质的bbs是一个很酷的事情，而参与其中写一个这样的论坛出来还是很有成就感的~

**@张峻誉：** 通过这次数据库大作业，我的收获颇丰，特别是在后端开发方面，我对 Spring Boot 的使用变得更为熟练。这个项目让我深入了解了 Spring Boot 框架的各个组件，包括依赖注入、RESTful API 的实现以及配置管理等。同时也对MyBatis和数据库之间的交互有了更加深刻的理解。

此外，我对数据库的约束关系有了更深入的理解。我学习到了如何使用外键、唯一约束以及检查约束等手段来保证数据的有效性。同时我对实体之间的关系也有了更加深刻的理解。存储过程和触发器的使用也让我更加熟悉数据库的高级功能。

最近，我还开始接触 Django 开发，虽然 Django 和 Spring Boot 是两种不同的后端框架，但两者都有许多相似之处，例如对 MVC 模式的支持和 ORM 的使用。对Spring Boot的掌握促使我能够更快地适应其他框架的开发。

在 SQL 方面，我的能力也有了很大提升。我现在可以熟练地编写复杂的 SQL 查询语句，并且掌握了一定的 SQL 调优技巧。这些技能帮助我在项目中能够有效地优化数据访问的性能，确保数据库能够高效响应用户的请求。

@**王宇汀：** 数据库大作业写前端真的太太太太太太太累了。知易行难，从前自己觉得UI丑陋功能单一的老牌论坛，原来麻雀虽小五脏俱全，实现起来并非简单。开发时不仅要考虑到数据的实时更新，还要在涉及到大量数据交互时，通过懒加载、分页加载等优化性能。伟大的Django2(zjy)巧妙设计数据库关系模型，优化查询计算接口响应速度，讴歌！前端不仅是数据展示的地方，也是用户与系统互动的窗口。伟大的Django1(zxy)认真打磨细节，保证用户交互的流畅性和界面的美观，讴歌！知难行易，设计先行、匠心打磨之后我们的论坛已经初具雏形，今后在软工项目中，我们有志于继续打磨论坛，创造北航人真正的精神家园！
