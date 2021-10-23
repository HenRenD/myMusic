<template>
    <div class="songlistcontent">
        <div class="title">
            <span class="pointer" @click="show=true" :style="{color:show?'#d33a31':'#333'}">播放列表</span>
            <span class="pointer" @click="show=false" :style="{color:show?'#333':'#d33a31'}">历史记录</span>
        </div>
        <div class="header">
            <span>总共{{show ? waitPlaySong.length:historyInfo.length}}首</span>
            <span class="pointer" @click="clearSongListOrHistoryList"><i class="iconfont clear">&#xe613;</i>清空</span>
        </div>
        <div class="playlist" v-if="show">
            <div class="songInfo" v-if="waitPlaySong.length">
                <div class="songtitle">
                    <span class="songName">音乐标题</span>
                    <span class="songAuthor">歌手</span>
                    <span class="songTime">时长</span>
                </div>
                <ul>
                    <li @click="changeIndex(index)" v-for="(item,index) in waitPlaySong" :key="index" class="pointer" :style="{color:index === playIndex?'#d33a31':'#333'}">
                        <span class="songName">{{item.songName}}<i @click="tomv($event,item.mvid)" v-if="item.mvid" class="iconfont tomv">&#xe6a3;</i></span>
                        <span class="songAuthor">{{item.authorName}}</span>
                        <span class="songTime">{{item.songTime}}</span>
                    </li>
                </ul>
            </div>
            <span class="initialShow" v-else>你还没有添加任何歌曲</span>
        </div>
        <div class="historylist" v-else>
            <div class="songInfo" v-if="historyInfo.length">
                <div class="songtitle">
                    <span class="songName">音乐标题</span>
                    <span class="songAuthor">歌手</span>
                    <span class="songTime">时长</span>
                </div>
                <ul>
                    <li @click="playHistorySong(item.id)" v-for="(item,index) in historyInfo" :key="index" class="pointer" :style="{color:item.id === playId?'#d33a31':'#333'}">
                        <span class="songName">{{item.songName}}<i @click="tomv($event,item.mvid)" v-if="item.mvid" class="iconfont tomv">&#xe6a3;</i></span>
                        <span class="songAuthor">{{item.authorName}}</span>
                        <span class="songTime">{{item.time}}</span>
                    </li>
                </ul>
            </div>
            <span class="initialShow" v-else>你还没有播放记录</span>
        </div>
    </div>
</template>

<script>
import { computed, ref, getCurrentInstance } from "vue";
import { useStore } from "vuex";
export default {
    name: "SongList1",
    setup() {
        const store = useStore();
        const { proxy: methods } = getCurrentInstance();
        // 历史记录
        let historyInfo = computed(() => {
            return store.state.historySongListInfo;
        });
        // 播放列表
        let waitPlaySong = computed(() => {
            return store.state.waitPlaySong;
        });
        // 播放列表的正在播放歌曲的index
        let playIndex = computed(() => {
            return store.state.index;
        });
        // 控制播放列表与历史记录的切换
        let show = ref(true);
        // 当前正在播放的歌曲的id
        let playId = computed(() => {
            if (store.state.currentPlayingSong[store.state.index]) {
                return store.state.currentPlayingSong[store.state.index].id;
            }
            return "";
        });
        // 改变store的index到当前点击的歌曲
        function changeIndex(index) {
            store.commit("CHANGEINDEX", index);
        }
        // 清空歌单或者历史记录
        function clearSongListOrHistoryList() {
            if (show.value) {
                store.commit("CLEARSONGLIST");
            } else {
                store.commit("CLEARHISTORYLIST");
            }
        }
        // 播放历史记录里的歌曲
        function playHistorySong(id) {
            let existSong = store.state.currentPlayingSong;
            let exist = false;
            let index = 0;
            // 这里的目的是，在点击历史记录里面的歌曲使其播放时，先在歌单里面查找时候存在该歌曲
            // 如果存在，直接将播放指针移动到该歌曲，而不用再发送请求
            for (let i = 0; i < existSong.length; i++) {
                if (existSong[i].id === id) {
                    exist = true;
                    index = i;
                    break;
                }
            }
            if (exist) {
                // 如果历史记录中的歌曲，歌单中存在，则移动指针即可
                store.commit("CHANGEINDEX", index);
            } else {
                // 经过上面的查找，发现歌单里面没有历史记录中的歌曲，这里需要重新发送请求，获取歌曲信息
                methods
                    .http("/song/url", {
                        params: {
                            id: id,
                        },
                    })
                    .then((res) => {
                        // 将获取的播放数据保存的vuex中，方便播放组件使用
                        store.commit("CURRENTPLAYINGSONG", res.data.data[0]);
                        // 改变播放指针到当前音乐
                        store.commit(
                            "CHANGEINDEX",
                            store.state.currentPlayingSong.length - 1
                        );
                        // 添加歌曲到歌单中
                        addSongToSongList(id);
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
            });
        }
        // 跳转到mv
        function tomv(e, id) {
            e.stopPropagation();
            methods.$root.$router.push(`/mv?mvsid=${id}`);
        }
        return {
            historyInfo,
            waitPlaySong,
            show,
            playIndex,
            changeIndex,
            clearSongListOrHistoryList,
            playId,
            playHistorySong,
            tomv,
            store,
        };
    },
};
</script>

<style scoped>
.songlistcontent {
    position: relative;
    width: 100%;
    height: 100%;
    padding: 0 20px;
    box-sizing: border-box;
    overflow: hidden;
}
.title {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 8%;
}
.title span {
    font-size: 15px;
    text-align: center;
    padding: 15px;
}
.playlist,
.historylist {
    position: absolute;
    top: 13%;
    left: 0;
    width: 100%;
    height: 87%;
    padding: 0 20px;
    box-sizing: border-box;
}
.header,
.songtitle,
li {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    height: 5%;
    border-bottom: 1px solid #ddd;
    padding: 5px 0;
    box-sizing: border-box;
}
.songtitle,
li {
    border: none;
}
.songName,
.songAuthor {
    width: 40%;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
}
.songTime {
    width: 10%;
}
.pointer {
    cursor: pointer;
}
.clear {
    vertical-align: middle;
    font-size: 18px;
}
.initialShow {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}
.tomv {
    vertical-align: middle;
    color: #d33a31;
    margin-left: 5px;
}
</style>
