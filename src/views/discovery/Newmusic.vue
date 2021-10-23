<template>
    <!-- 最新音乐 -->
    <div v-if="Object.values(newMusicList).length">
        <h3>最新音乐</h3>
        <ul>
            <li v-for="(item,index) in Object.values(newMusicList)" :key='item.id' @click="getSongUrl(item.id)">
                <span class="order">{{index + 1 < 10 ? "0" + (index + 1) : index + 1}}</span>
                <span class="imgContent">
                    <img :src="item.picUrl" alt="">
                    <span class="playFont"></span>
                    <i class="innerPlayFont iconfont">&#xea82;</i>
                </span>
                <span class="songName">{{item.name}}</span>
                <span class="author">{{authorName[index]}}</span>
                <span class="addSong" @click="addSong($event,item.id)">+</span>
            </li>
        </ul>
    </div>
</template>

<script>
import { reactive, getCurrentInstance, computed } from "vue";
import { useStore } from "vuex";
export default {
    name: "newMusic",
    setup() {
        // 使用实例方法
        const { proxy: methods } = getCurrentInstance();
        // 使用vuex
        const store = useStore();
        // 定义保存新音乐的变量,从vuex中获取
        let newMusicList = computed(() => {
            return store.state.musicListInfo;
        });
        // 因为每一首歌曲的歌手不止一位，需要将他们单独做拼接
        let authorName = reactive([]);
        // 点击播放音乐，获取播放信息，并交给vuex
        function getSongUrl(id) {
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
        // 添加音乐按钮，获取播放信息，并交给vuex
        function addSong(e, id) {
            e.stopPropagation();
            let exist = true;
            for (let i = 0; i < store.state.currentPlayingSong.length; i++) {
                if (store.state.currentPlayingSong[i].id === id) {
                    exist = false;
                    // 歌单中已经存在了此次点击的歌曲，所以不用再次添加
                    // 因为是添加歌曲，所以不用自动播放，所以不用移动播放指针
                    // methods.$message.info("歌单中已经存在该歌曲啦~");
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
        // 将音乐信息添加到待播放歌单中
        function addSongToSongList(id) {
            // 获取对应id的歌曲的信息
            let songInfo = store.state.musicListInfo[id];
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
                mvid: songInfo.song.mvid,
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
                store.commit("UPDATEMSGSHOW", {});
            }, 2000);
        }
        return {
            newMusicList,
            authorName,
            getSongUrl,
            store,
            addSong,
        };
    },
    created() {
        // 获取最新音乐数据
        this.http.get("/personalized/newsong").then((res) => {
            for (let once of res.data.result) {
                // 将获取的数据保存到vuex中
                this.store.commit("SAVEMUSICLISTINFO", once);
            }
            // // 处理歌手名字拼接
            for (let item of Object.values(this.newMusicList)) {
                let name = [];
                for (let once of item.song.artists) {
                    name.push(once.name);
                }
                this.authorName.push(name.join("/"));
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
h3 {
    font-size: 20px;
    font-weight: 400;
    margin: 10px 0;
}
ul {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    justify-content: left;
}
ul li {
    position: relative;
    width: 50%;
    padding: 10px 0;
    transition: all 0.2s ease-in-out;
    cursor: pointer;
}
ul li:hover {
    background-color: #e2e2e2;
    /* transform: scale(1.1); */
    box-shadow: 0 0 10px #f5f5f5;
}
.imgContent {
    position: relative;
    display: inline-block;
    width: 60px;
    height: 60px;
}
.imgContent img {
    width: 100%;
    height: 100%;
    vertical-align: middle;
}

li:hover .playFont {
    opacity: 0.5;
}
li:hover i {
    opacity: 1;
}
.playFont,
i {
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
}
.playFont {
    width: 30px;
    height: 30px;
}
i {
    font-size: 14px;
}
.order {
    margin: 0 30px;
}
.songName {
    position: absolute;
    left: 145px;
    top: 16px;
    color: #333;
}
.author {
    position: absolute;
    left: 145px;
    bottom: 16px;
    color: #333;
}
/* 添加歌曲按钮 */
.addSong {
    position: absolute;
    right: 60px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 30px;
    color: #d33a31;
    opacity: 0;
    transition: all 0.2s ease-in-out;
}
li:hover .addSong {
    opacity: 1;
}
</style>
