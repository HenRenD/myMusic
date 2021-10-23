<template>
    <!-- 推荐歌单 -->
    <div v-if="recommendSongList.length">
        <h3>推荐歌单</h3>
        <ul>
            <li v-for="item in recommendSongList" :key="item.id" @click="toPlaylist(item.id)">
                <span class="hotRecommend">{{item.copywriter ? item.copywriter : '热门推荐'}}</span>
                <div class="img">
                    <img :src="item.picUrl" alt="">
                </div>
                <span class="playFont"></span>
                <i class="iconfont innerPlayFont">&#xea82;</i>
                <span class="discription">{{item.name}}</span>
            </li>
        </ul>
    </div>
</template>

<script>
import { ref, getCurrentInstance } from "vue";
export default {
    name: "RecommendList",
    setup() {
        const { proxy: methods } = getCurrentInstance();
        // 定义变量保存推荐歌单的数据
        let recommendSongList = ref([]);
        // 跳转到playlist组件
        function toPlaylist(id) {
            methods.$root.$router.push(`/playlist?playlistid=${id}`);
        }
        return {
            recommendSongList,
            toPlaylist,
        };
    },
    created() {
        // 获取推荐歌单数据
        this.http.get("/personalized?limit=10", {}).then((res) => {
            this.recommendSongList = res.data.result;
        });
    },
};
</script>

<style scoped>
div {
    width: 100%;
    height: 100%;
}
h3 {
    font-weight: 400;
    font-size: 20px;
    margin: 10px 0;
}
ul {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    flex-wrap: wrap;
}
ul li {
    position: relative;
    overflow: hidden;
    width: 18%;
    margin-bottom: 20px;
    cursor: pointer;
    border-radius: 5px;
}
li img {
    width: 100%;
    transition: all 0.3s ease-in-out;
}
.img {
    width: 100%;
    height: 100%;
    border-radius: 5px;
    overflow: hidden;
}
.hotRecommend {
    position: absolute;
    width: 100%;
    height: 30px;
    top: -30px;
    padding-left: 10px;
    background-color: rgba(0, 0, 0, 0.3);
    text-align: left;
    box-sizing: border-box;
    line-height: 30px;
    color: #ddd;
    transition: all 0.3s ease-in-out;
    z-index: 10;
    opacity: 0;
}
.discription {
    display: inline-block;
    width: 100%;
    overflow: hidden;
    color: #4a4a4a;
    padding-left: 3px;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin-top: 5px;
}
li:hover .hotRecommend {
    top: 0;
    opacity: 1;
}
li:hover .playFont {
    opacity: 0.5;
}
li:hover i {
    opacity: 1;
}
.playFont {
    right: 10px;
    bottom: 45px;
    transition: all 0.1s ease-in-out;
}
i {
    right: 19px;
    bottom: 51px;
    transition: all 0.1s ease-in-out;
}
</style>
