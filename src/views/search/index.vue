<template>
    <el-scrollbar>
        <div class="search">
            <div class="title">
                <span class="name">{{$route.query.q}}</span>找到{{showCount}}个结果
            </div>
            <div class="nav">
                <ul>
                    <li @click="tosong" :style="{color:switchTo===0?'black':''}">歌曲</li>
                    <li @click="toplay" :style="{color:switchTo===1?'black':''}">歌单</li>
                    <li @click="tomv_" :style="{color:switchTo===2?'black':''}">MV</li>
                </ul>
            </div>
            <div class="result">
                <div class="songs" v-if="switchTo===0">
                    <el-table :data="songs" style="width: 100%" @row-click="playSong">
                        <el-table-column label="" type="index" />
                        <el-table-column label="音乐标题" width="250">
                            <template v-slot='scope'>
                                <span class="songName iconfont">{{scope.row.name}}<i @click="toMv($event,scope.row.mvid)" v-if="scope.row.mvid">&#xe6a3;</i></span>
                                <span class="songDes">{{scope.row.alias[0]}}</span>
                            </template>
                        </el-table-column>
                        <el-table-column width="50">
                            <template v-slot='scope'>
                                <span class="addSong" @click="addSong($event,scope.row.id)">+</span>
                            </template>
                        </el-table-column>
                        <el-table-column width="50">
                            <template v-slot='scope'>
                                <span class="playsong iconfont" @click="iconPlaySong($event,scope.row)">&#xea82;</span>
                            </template>
                        </el-table-column>
                        <el-table-column width="200" label="歌手">
                            <template v-slot='scope'>
                                <span class="authorName">{{scope.row.artists[0].name}}</span>
                            </template>
                        </el-table-column>
                        <el-table-column width="300" prop="album.name" label="专辑" />
                        <el-table-column width="70" label="时长">
                            <template v-slot='scope'>
                                <span>{{formatTime(scope.row.duration)}}</span>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
                <div class="main_" v-else-if="switchTo===1">
                    <ul>
                        <li v-for="item in playlists" :key="item.id" @click="toPlaylist(item.id)">
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
                <div class="content_" v-else>
                    <ul>
                        <li v-for="item in mvs" :key="item.id" @click="toMv($event,item.id)">
                            <div class="img">
                                <img :src="item.cover" alt="">
                                <span class="playCount iconfont">&#xea82;&nbsp;{{Math.floor(item.playCount / 10000)}}万</span>
                                <span class="time">{{formatTime(item.duration)}}</span>
                                <div class="playfont iconfont">
                                    <span></span>
                                    <i>&#xea82;</i>
                                </div>
                            </div>
                            <div class="des">{{item.name}}</div>
                            <div class="name">{{item.artistName}}</div>
                        </li>
                        <li v-for="n in 4" :key="n" class="fill"></li>
                    </ul>
                </div>
            </div>
            <div class="changePage">
                <el-pagination @current-change="changePage" :page-size="20" :pager-count="7" :current-page="currentPage" layout="prev, pager, next" :total="showCount">
                </el-pagination>
            </div>
        </div>
    </el-scrollbar>
</template>

<script>
import { ref, getCurrentInstance, watchEffect, computed } from "vue";
import { useStore } from "vuex";
export default {
    setup() {
        const { proxy: methods } = getCurrentInstance();
        const store = useStore();
        let switchTo = ref(0);
        let keywords = ref("");
        let songs = ref([]);
        let time = ref(0);
        let playlists = ref([]);
        let mvs = ref([]);
        let songCount = ref(0);
        let playlistCount = ref(0);
        let mvCount = ref(0);
        let currentPage = ref(1);
        let offset = computed(() => {
            return (currentPage.value - 1) * 20;
        });
        let showCount = computed(() => {
            if (switchTo.value === 0) {
                return songCount.value;
            } else if (switchTo.value === 1) {
                return playlistCount.value;
            } else {
                return mvCount.value;
            }
        });
        watchEffect(() => {
            keywords.value = methods.$root.$route.query.q;
            // 获取歌曲
            methods.http
                .get(
                    `/search?keywords=${keywords.value}&limit=20&offset=${offset.value}`
                )
                .then((res) => {
                    songs.value = res.data.result.songs;
                    songCount.value = res.data.result.songCount;
                    let ids = [];
                    for (let once of res.data.result.songs) {
                        ids.push(once.id);
                    }
                    getSongDetail(ids.join(","));
                });
            // 获取歌单
            methods.http
                .get(
                    `search?keywords=${keywords.value}&type=1000&limit=20&offset=${offset.value}`
                )
                .then((res) => {
                    playlistCount.value = res.data.result.playlistCount;
                    playlists.value = res.data.result.playlists;
                });
            // 获取mv
            methods.http
                .get(
                    `search?keywords=${keywords.value}&type=1004&limit=20&offset=${offset.value}`
                )
                .then((res) => {
                    mvCount.value = res.data.result.mvCount;
                    mvs.value = res.data.result.mvs;
                });
        });
        // 获取歌曲时间
        function formatTime(time) {
            time = time / 1000;
            let minutes = String(Math.floor(time / 60)).padStart(2, "0");
            let second = String(Math.floor(time % 60)).padStart(2, "0");
            return minutes + ":" + second;
        }
        // 获取音乐的详细信息
        function getSongDetail(id) {
            methods.http.get(`song/detail?ids=${id}`).then((res) => {
                for (let res_ of res.data.songs) {
                    let authorName = "";
                    let name = [];
                    for (let i of res_.ar) {
                        name.push(i.name);
                    }
                    authorName = name.join("/");
                    let mTime = String(
                        Math.floor(res_.dt / 1000 / 60)
                    ).padStart(2, "0");
                    let sTime = String(
                        Math.floor((res_.dt / 1000) % 60)
                    ).padStart(2, "0");
                    let info = {
                        id: res_.id,
                        song: {
                            artists: res_.ar,
                            bMusic: {
                                playTime: res_.dt,
                            },
                        },
                        picUrl: res_.al.picUrl,
                        name: res_.name,
                        authorName: authorName,
                        album: res_.al.name,
                        time: `${mTime}:${sTime}`,
                        mvid: res_.mv,
                    };
                    store.commit("SAVEPLAYLISTINFO", info);
                }
            });
        }
        // 点击播放音乐，获取播放信息，并交给vuex
        function playSong(row) {
            let id = row.id;
            if (store.state.currentPlayingSong.length !== 0) {
                let exist = true;
                for (
                    let i = 0;
                    i < store.state.currentPlayingSong.length;
                    i++
                ) {
                    if (store.state.currentPlayingSong[i].id === id) {
                        exist = false;
                        // 歌单中已经存在了此次点击的歌曲，所以不用再次添加，但是要将播放指针移动过来
                        store.commit("CHANGEINDEX", i);
                        break;
                    }
                }
                if (exist) {
                    methods.http(`/song/url?id=${id}`).then((res) => {
                        // 将获取的播放数据保存的vuex中，方便播放组件使用
                        store.commit("CURRENTPLAYINGSONG", res.data.data[0]);
                        // 添加歌曲之后，不仅要将歌曲的播放信息添加到vuex中，还要将播放的指针移动到当前歌曲
                        store.commit(
                            "CHANGEINDEX",
                            store.state.currentPlayingSong.length - 1
                        );
                        // 添加歌曲到歌单中
                        addSongToSongList(id);
                        // 显示歌单更新的提示信息
                        updateSongMsg();
                    });
                }
            } else {
                methods.http(`/song/url?id=${id}`).then((res) => {
                    // 将获取的播放数据保存的vuex中，方便播放组件使用
                    store.commit("CURRENTPLAYINGSONG", res.data.data[0]);
                    // 添加歌曲到歌单中
                    addSongToSongList(id);
                    // 更新歌单的提示信息
                    updateSongMsg();
                });
            }
        }
        // 点击图标播放音乐
        function iconPlaySong(e, row) {
            e.stopPropagation();
            playSong(row);
        }
        // 将音乐信息添加到待播放歌单中
        function addSongToSongList(id) {
            // 获取对应id的歌曲的信息
            let songInfo = store.state.playListInfo[id];
            // 歌曲名字
            let songName = songInfo.name;
            // 歌手名字
            let name = [];
            for (let i = 0; i < songInfo.song.artists.length; i++) {
                name.push(songInfo.song.artists[i].name);
            }
            let authorName = name.join("/");
            // 歌曲的播放时长
            let songTime = songInfo.song.bMusic.playTime / 1000;
            let minute = String(parseInt(songTime / 60)).padStart(2, "0");
            let second = String(parseInt(songTime % 60)).padStart(2, "0");
            // 将这些信息保存到歌单中
            store.commit("SAVEWAITPLAYSONG", {
                songName: songName,
                authorName: authorName,
                songTime: minute + ":" + second,
                id: id,
                mvid: songInfo.mvid,
            });
        }
        // 更新歌单之后的提示信息
        function updateSongMsg() {
            // 显示歌单更新的提示信息
            store.commit("UPDATEMSGSHOW", {
                opacity: 1,
            });
            // 2秒之后，让提示信息自动消失
            setTimeout(() => {
                store.commit("UPDATEMSGSHOW", {
                    opacity: 0,
                });
            }, 2000);
        }
        // 添加音乐按钮，获取播放信息，并交给vuex
        function addSong(e, id) {
            e.stopPropagation();
            let exist = true;
            for (let i = 0; i < store.state.currentPlayingSong.length; i++) {
                if (store.state.currentPlayingSong[i].id === id) {
                    exist = false;
                    // 歌单中已经存在了此次点击的歌曲，所以不用再次添加
                    // 因为是添加歌曲，所以不用自动播放，所以不用移动播放指针
                    methods.$message.info({
                        message: "该歌曲已经添加过了哦~",
                        center: true,
                        iconClass: "none",
                        duration: 3000,
                    });
                    break;
                }
            }
            if (exist) {
                methods.http(`/song/url?id=${id}`).then((res) => {
                    // 将获取的播放数据保存的vuex中，方便播放组件使用
                    store.commit("CURRENTPLAYINGSONG", res.data.data[0]);
                    // 添加歌曲到歌单中
                    addSongToSongList(id);
                    // 更新歌单的提示信息
                    updateSongMsg();
                });
            }
        }
        // 跳转到mv
        function toMv(e, id) {
            e.stopPropagation();
            methods.$root.$router.push(`/mv?mvsid=${id}`);
        }
        // 跳转到歌单详情
        function toPlaylist(id) {
            methods.$root.$router.push(`/playlist?playlistid=${id}`);
        }
        // 页码改变
        function changePage(page) {
            currentPage.value = page;
            if (switchTo.value === 0) {
                // 获取歌曲
                methods.http
                    .get(
                        `/search?keywords=${keywords.value}&limit=20&offset=${offset.value}`
                    )
                    .then((res) => {
                        songs.value = res.data.result.songs;
                        songCount.value = res.data.result.songCount;
                        let ids = [];
                        for (let once of res.data.result.songs) {
                            ids.push(once.id);
                        }
                        getSongDetail(ids.join(","));
                    });
            } else if (switchTo.value === 1) {
                // 获取歌单
                methods.http
                    .get(
                        `search?keywords=${keywords.value}&type=1000&limit=20&offset=${offset.value}`
                    )
                    .then((res) => {
                        playlistCount.value = res.data.result.playlistCount;
                        playlists.value = res.data.result.playlists;
                    });
            } else {
                // 获取mv
                methods.http
                    .get(
                        `search?keywords=${keywords.value}&type=1004&limit=20&offset=${offset.value}`
                    )
                    .then((res) => {
                        mvCount.value = res.data.result.mvCount;
                        mvs.value = res.data.result.mvs;
                        console.log(res);
                    });
            }
        }
        // 切换重置页码
        function tosong() {
            switchTo.value = 0;
            currentPage.value = 1;
        }
        function toplay() {
            switchTo.value = 1;
            currentPage.value = 1;
        }
        function tomv_() {
            switchTo.value = 2;
            currentPage.value = 1;
        }
        return {
            switchTo,
            methods,
            songs,
            playSong,
            addSong,
            time,
            formatTime,
            toMv,
            showCount,
            playlists,
            toPlaylist,
            mvs,
            currentPage,
            changePage,
            tosong,
            toplay,
            tomv_,
            iconPlaySong,
        };
    },
};
</script>

<style scoped>
.el-scrollbar {
    width: 100%;
    height: 100%;
}
.search {
    width: 95%;
    margin: 20px auto;
    box-sizing: border-box;
}
.title {
    color: #d8dad7;
    margin: 20px 0;
}
.title .name {
    color: black;
    font-size: 22px;
    font-weight: 700;
    display: inline-block;
    vertical-align: text-bottom;
    margin-right: 10px;
}
.nav {
    width: 100%;
}
.nav ul {
    width: 100%;
    display: flex;
    justify-content: left;
    border-bottom: 1px solid #d8dad7;
    padding: 10px 0;
}
.nav ul li {
    width: 7%;
    font-size: 16px;
    color: #7f7f81;
    cursor: pointer;
}
.songs {
    width: 100%;
}
/* 歌单区域 */
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
/* 歌曲表格 */
.el-table tr:hover .playFont {
    opacity: 0.5;
}
.el-table tr:hover .innerPlayFont {
    opacity: 1;
}
span {
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
}
.addSong {
    font-size: 30px;
    color: #d33a31;
    opacity: 0;
    font-weight: 400;
}
.el-table tr:hover .addSong {
    opacity: 1;
}
.songName {
    font-size: 13px;
    color: black;
}
.songName i {
    font-style: normal;
    margin-left: 5px;
    color: #d33a31;
}
.songDes {
    color: #d8dad7;
}
.authorName {
    color: #517eaf;
}
.playsong {
    font-size: 14px;
    color: #d33a31;
    opacity: 0;
}
.el-table tr:hover .playsong {
    opacity: 1;
}
/* mv */
.content_ {
    width: 100%;
}
.content_ ul {
    display: flex;
    width: 100%;
    justify-content: space-between;
    flex-wrap: wrap;
}
.content_ ul li {
    width: 24%;
    padding: 0;
    border: none;
    margin: 10px 0;
}
.content_ ul .fill {
    width: 24%;
    height: 0;
    margin: 0;
}
.img {
    position: relative;
    height: 80%;
}
.img,
img {
    width: 100%;
    border-radius: 5px;
}
img {
    height: 100%;
}
.playCount {
    position: absolute;
    top: 5px;
    right: 10px;
    color: white;
    font-size: 15px;
}
.time {
    position: absolute;
    bottom: 5px;
    right: 10px;
    color: white;
    font-size: 15px;
}
.playfont {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 45px;
    height: 45px;
    border-radius: 50%;
    opacity: 0;
    transition: all 0.2s ease-in-out;
}
.playfont span {
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background-color: white;
    opacity: 0.5;
}
.playfont i {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    color: #d33a31;
    font-style: normal;
    font-size: 20px;
    opacity: 1;
}
.content_ li:hover .playfont {
    opacity: 1;
}
.des {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: #4a4a4a;
}
.name {
    color: #bebebe;
}
/* 分页 */
.changePage {
    width: 50%;
    margin: 30px auto;
    text-align: center;
}
</style>
