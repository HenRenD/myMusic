<template>
    <div class="content">
        <!-- 头部内容 -->
        <div class="header" @click="closeSongList">
            <Header @gethotSearch='gethotsearch' :currentWord='currentSearchWord'></Header>
        </div>
        <!-- 主体展示内容 -->
        <div class="main" @click="closeSongList">
            <div class="aside">
                <Nav></Nav>
            </div>
            <div class="mainContent">
                <Content></Content>
            </div>
        </div>
        <!-- 底部播放栏 -->
        <div class="footer">
            <MusicPlayer></MusicPlayer>
        </div>
        <!-- 歌单 -->
        <div class="songlist" :style="songListShow">
            <SongList></SongList>
        </div>
        <!-- 歌曲的详细信息 -->
        <div class="songDetailInfo" :style="songDetialShow" @click="closeSongList">
            <SongDetailInfo></SongDetailInfo>
        </div>
        <!-- 搜索页面 -->
        <div class="search" :style="searchShow">
            <div class="hotsearch">
                <h2>热门搜索</h2>
                <ul>
                    <li @click="currentSearchWord = item.first" v-for="(item,index) in hotSearch" :key="index">{{item.first}}</li>
                </ul>
            </div>
            <div class="searchHistory">
                <h2>搜索历史</h2>
                <ul>
                    <li @click="currentSearchWord = item" v-for="(item,index) in history" :key="index">{{item}}</li>
                </ul>
                <div @click="clearHistory" class="clearHistory iconfont">&#xe613;清空历史</div>
                <span v-if="!history.length">还没有搜索记录~</span>
            </div>
        </div>
        <!-- 对话框 -->
        <el-dialog v-model="dialogShow" title="登录提示" @close='closeDialog' :modal='false'>
            <p>本网站仅用于学习交流</p>
            <p>如需登录请<a href="https://music.163.com/">点我(https://music.163.com/)</a>去往网易云官网</p>
        </el-dialog>
    </div>
</template>

<script>
import Header from "./Header.vue";
import Nav from "./Nav.vue";
import Content from "./Content.vue";
import MusicPlayer from "./MusicPlayer.vue";
import SongList from "../components/Songlist.vue";
import SongDetailInfo from "../components/songDetailsPage/index.vue";
import { useStore } from "vuex";
import { computed, ref, watch } from "vue";
export default {
    name: "Index",
    components: {
        Header,
        Nav,
        Content,
        MusicPlayer,
        SongList,
        SongDetailInfo,
    },
    setup() {
        const store = useStore();
        let hotSearch = ref([]);
        let currentSearchWord = ref("");
        let history = ref([]);
        // 控制歌单的显示与隐藏
        let songListShow = computed(() => {
            return store.state.songListShow;
        });
        // 控制歌曲详情页面的显示
        let songDetialShow = computed(() => {
            return store.state.songDetailShow;
        });
        // 控制搜索页面显示
        let searchShow = computed(() => {
            return store.state.searchShow;
        });
        // 控制对话框的显示
        let dialogShow = computed(() => {
            return store.state.dialogShow;
        });
        watch(searchShow, (newValue) => {
            let _ = localStorage.getItem("history");
            if (_) {
                history.value = _.split(",");
            } else {
                history.value = [];
            }
        });
        // 关闭歌单显示
        function closeSongList() {
            if (store.state.songListShow.height) {
                store.commit("CHANGESONGLISTSHOW", {
                    height: 0,
                    opacity: 0,
                });
            }
        }
        // 获取热搜的回调
        function gethotsearch(value) {
            hotSearch.value = value;
        }
        // 清空历史
        function clearHistory() {
            localStorage.removeItem("history");
        }
        // 关闭对话框
        function closeDialog() {
            store.commit("MAKEDIALOGSHOW", false);
        }
        return {
            store,
            songListShow,
            closeSongList,
            songDetialShow,
            searchShow,
            gethotsearch,
            hotSearch,
            currentSearchWord,
            history,
            clearHistory,
            dialogShow,
            closeDialog,
        };
    },
};
</script>

<style scoped>
.content {
    width: 100%;
    height: 100%;
    overflow: hidden;
}
/* 头部 */
.header {
    width: 100%;
    height: 7%;
    min-width: 700px;
}
/* 主体内容 */
.main {
    display: flex;
    width: 100%;
    height: 84%;
    min-width: 700px;
}
.aside {
    width: 18%;
    height: 100%;
}
.mainContent {
    width: 82%;
    height: 100%;
}
/* 底部播放栏 */
.footer {
    width: 100%;
    min-width: 700px;
    height: 9%;
}
/* 歌单 */
.songlist {
    position: fixed;
    right: 0;
    bottom: 9%;
    width: 28%;
    height: 0;
    background-color: white;
    box-shadow: 0 0 5px #ddd;
    z-index: 99;
    transition: all 0.2s ease-in-out;
    opacity: 0;
}
/* 歌曲详情页面 */
.songDetailInfo {
    position: fixed;
    overflow-y: auto;
    width: 100%;
    bottom: 9%;
    height: 0;
    opacity: 1;
    transition: all 0.4s ease-out;
    z-index: 88;
}
/* 搜索页面 */
.search {
    overflow: hidden;
    position: absolute;
    right: 0;
    top: 7%;
    width: 25%;
    height: 0;
    padding: 10px 20px;
    background-color: white;
    font-size: 12px;
    box-sizing: border-box;
    box-shadow: 0 0 10px #ddd;
    z-index: 99;
    transition: all 0.2s ease-in-out;
    opacity: 0;
}
.hotsearch {
    width: 100%;
}
h2 {
    margin: 15px 0;
}
.search ul {
    display: flex;
    flex-wrap: wrap;
}
.search li {
    padding: 3px 10px;
    border: 1px solid #d9d9d9;
    margin: 0 10px 10px 0;
    cursor: pointer;
}
.searchHistory {
    position: relative;
}
.clearHistory {
    position: absolute;
    right: 0;
    top: 0;
    font-size: 12px;
    cursor: pointer;
}
.searchHistory span {
    position: absolute;
    left: 50%;
    top: 50%;
    margin: 50px 0;
    transform: translate(-50%, -50%);
}
</style>
