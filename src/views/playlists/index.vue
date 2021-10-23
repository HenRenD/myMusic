<template>
    <el-scrollbar>
        <div class="playlists" v-if="playlists.length">
            <div class="head" :style="{background:`url(${playlists[0].creator.backgroundUrl})`}">
                <div class="img">
                    <img :src="playlists[0].coverImgUrl" alt="" @click="toPlaylist(playlists[0].id)">
                </div>
                <div class="info">
                    <div class="title">精品歌单</div>
                    <div class="name">{{playlists[0].name}}</div>
                    <div class="des">
                        {{playlists[0].description}}
                    </div>
                </div>
            </div>
            <div class="nav">
                <ul>
                    <li @click="getPlaylists" :style="{color:tagMark===99?'#d33a31':''}">全部</li>
                    <li :style="{color:tagMark===index?'#d33a31':''}" v-for="(item,index) in playlistsTags" :key="item.id" @click="getPlaylistsByTag(item.name,index)">{{item.name}}</li>
                    <li v-for="n in 10" :key="n" class="fill"></li>
                </ul>
            </div>
            <div class="main_">
                <ul>
                    <li v-for="item in playlists.slice(1)" :key="item.id" @click="toPlaylist(item.id)">
                        <img :src="item.coverImgUrl" alt="">
                        <span>{{item.name}}</span>
                        <span class="playcount">播放数：{{Math.floor(item.playCount / 10000)}}万</span>
                        <div class="playfont">
                            <span></span>
                            <i class="iconfont">&#xea82;</i>
                        </div>
                    </li>
                    <li v-for="n in 5" :key="n" class="fill"></li>
                </ul>
            </div>
            <div class="changePage">
                <el-pagination @current-change="currentPageChange" :page-size="21" :current-page="page" layout="prev, pager, next" :total="total">
                </el-pagination>
            </div>
        </div>
    </el-scrollbar>
</template>

<script>
import { getCurrentInstance, ref, computed } from "vue";
export default {
    name: "PlayLists",
    setup() {
        const { proxy: methods } = getCurrentInstance();
        let playlistsTags = ref([]);
        let playlists = ref([]);
        let tagMark = ref(99);
        let total = ref(0);
        let tag = ref("全部");
        let offset = computed(() => {
            return (page.value - 1) * 21;
        });
        let page = ref(1);
        // 获取歌单数据
        function getPlaylists() {
            methods.http.get(`/top/playlist?limit=21`).then((res) => {
                total.value = res.data.total;
                playlists.value = res.data.playlists;
                tagMark.value = 99;
                tag.value = "全部";
                page.value = 1;
            });
        }
        getPlaylists();
        // 获取歌单标签
        methods.http.get("/playlist/catlist").then((res) => {
            playlistsTags.value = res.data.sub;
        });
        // 根据tag分类获取歌单
        function getPlaylistsByTag(tag_, index) {
            tag.value = tag_;
            methods.http
                .get(`/top/playlist?cat=${tag.value}&limit=21`)
                .then((res) => {
                    if (res.data.playlists.length) {
                        total.value = res.data.total;
                        playlists.value = res.data.playlists;
                        tagMark.value = index;
                        page.value = 1;
                    }
                })
                .catch((error) => {
                    methods.$message.info({
                        message: `似乎出现了一些错误(${error})`,
                        center: true,
                        iconClass: "none",
                        duration: 3000,
                    });
                });
        }
        // 分页回调
        function currentPageChange(currentPage) {
            page.value = currentPage;
            methods.http
                .get(
                    `/top/playlist?cat=${tag.value}&limit=21&offset=${offset.value}`
                )
                .then((res) => {
                    if (res.data.playlists.length) {
                        playlists.value = res.data.playlists;
                    }
                });
        }
        // 跳转到歌单详情
        function toPlaylist(id) {
            methods.$root.$router.push(`/playlist?playlistid=${id}`);
        }
        return {
            playlists,
            playlistsTags,
            getPlaylistsByTag,
            getPlaylists,
            tagMark,
            total,
            page,
            currentPageChange,
            toPlaylist,
        };
    },
};
</script>

<style scoped>
.el-scrollbar {
    width: 100%;
    height: 100%;
}
.playlists {
    position: relative;
    width: 80%;
    margin: 20px auto;
    user-select: none;
    transition: all 0.3s ease-in-out;
    box-sizing: border-box;
}
li {
    cursor: pointer;
}
/* 头部 */
.head {
    display: flex;
    justify-content: space-between;
    width: 100%;
    padding: 20px;
    border-radius: 5px;
    box-sizing: border-box;
    background-repeat: no-repeat;
    background-size: cover;
}
.img {
    width: 150px;
    height: 150px;
}
img {
    width: 100%;
    height: 100%;
    border-radius: 5px;
    cursor: pointer;
}
.info {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: 79%;
    height: 150px;
    color: #9f9c96;
}
.title {
    width: 80px;
    padding: 1px 10px;
    text-align: center;
    font-size: 16px;
    color: #dba257;
    font-weight: 500;
    border: 1px solid #dba257;
    border-radius: 5px;
}
.name {
    margin: 15px 0 5px 0;
    color: white;
    font-size: 18px;
}
.des {
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 5;
    -webkit-box-orient: vertical;
    line-height: 16px;
}
/* 导航 */
.nav {
    width: 100%;
    margin: 20px 0;
}
.nav ul {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
}
.nav li {
    width: 7%;
    margin-right: 25px;
    color: #7f8489;
}
.nav ul li:hover {
    color: black;
}
/* 展示区 */
.main_ {
    width: 100%;
}
.main_ ul {
    width: 100%;
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    user-select: none;
}
.main_ li {
    position: relative;
    overflow: hidden;
    width: 18%;
    margin: 10px 0;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    border-radius: 5px;
}
.main_ li img {
    width: 100%;
}
.main_ li span:first-of-type {
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
}
.playcount {
    position: absolute;
    width: 100%;
    padding: 3px 10px;
    background-color: rgba(0, 0, 0, 0.2);
    color: white;
    left: 0;
    top: -25%;
    box-sizing: border-box;
    transition: all 0.2s ease-in-out;
}
.main_ li:hover .playcount {
    top: 0;
}
.playfont {
    position: absolute;
    overflow: hidden;
    right: 10px;
    bottom: 30px;
    width: 35px;
    height: 35px;
    border-radius: 50%;
    opacity: 0;
    transition: all 0.2s ease-in-out;
}
.playfont span {
    position: absolute;
    width: 100%;
    height: 100%;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    background-color: white;
    opacity: 0.5;
}
.playfont i {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    color: #d33a31;
    opacity: 1;
}
.main_ li:hover .playfont {
    opacity: 1;
}
.main_ .fill {
    width: 18%;
    height: 0;
}
/* 分页 */
.changePage {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    padding: 20px 0;
}
</style>

