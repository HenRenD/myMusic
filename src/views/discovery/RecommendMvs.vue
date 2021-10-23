<template>
    <!-- 推荐mv -->
    <div v-if="mvList.length">
        <h3>推荐MV</h3>
        <ul>
            <li v-for="item in mvList" :key="item.id" @click="toMv(item.id)">
                <div class="imgContent">
                    <img :src="item.picUrl" alt="">
                    <span class="mvIcon iconfont"><i>&#xea82;</i>{{item.playCount}}</span>
                    <span class="playFont"></span>
                    <i class="iconfont innerPlayFont">&#xea82;</i>
                </div>
                <span class="mvName">{{item.name}}</span>
                <span class="mvAuthor">{{item.artistName}}</span>
            </li>
        </ul>
    </div>
</template>

<script>
import { reactive, getCurrentInstance } from "vue";
export default {
    name: "RecommentMvs",
    setup() {
        const { proxy: methods } = getCurrentInstance();
        // 定义保存mv数据的变量
        let mvList = reactive([]);
        // 点击跳转到mv详情页面
        function toMv(id) {
            methods.$root.$router.push(`/mv?mvsid=${id}`);
        }
        return {
            mvList,
            toMv,
        };
    },
    created() {
        // 获取mv数据
        this.http.get("/personalized/mv").then((res) => {
            for (let once of res.data.result) {
                this.mvList.push(once);
            }
        });
    },
};
</script>

<style scoped>
div {
    width: 100%;
    height: 100%;
}
/* 标题 */
h3 {
    font-size: 20px;
    font-weight: 400;
    margin-bottom: 20px;
}
/* 列表父级 */
ul {
    width: 100%;
    display: flex;
    justify-content: space-between;
}
li {
    width: 24%;
    cursor: pointer;
}
/* 图片容器 */
.imgContent {
    position: relative;
    overflow: hidden;
    border-radius: 10px;
    width: 100%;
    height: 130px;
    transition: all 0.2s linear;
}
img {
    width: 100%;
    height: 100%;
}
/* 右上角播放热度 */
.mvIcon {
    position: absolute;
    top: 0;
    right: 5px;
    color: white;
    font-size: 12px;
}
.mvIcon i {
    font-style: normal;
    padding-right: 10px;
    vertical-align: middle;
}
/* 中间的播放图标 */
li:hover .playFont {
    opacity: 0.5;
}
.imgContent .innerPlayFont {
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    color: #d33a31;
}
li:hover .innerPlayFont {
    opacity: 1;
}
/* li:hover .imgContent {
    transform: scale(1.1);
    box-shadow: 0 0 10px #ddd;
} */
.playFont {
    left: 50%;
    top: 50%;
    width: 40px;
    height: 40px;
    transform: translate(-50%, -50%);
}
/* 最下面的歌曲和歌手信息 */
.mvName,
.mvAuthor {
    display: block;
    font-size: 12px;
    margin-left: 5px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.mvName {
    margin-top: 10px;
}
.mvAuthor {
    color: #bebebe;
}
</style>
