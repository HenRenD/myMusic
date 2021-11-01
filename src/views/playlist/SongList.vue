<template>
    <el-table :data="musicInfo" style="width: 100%" @row-click="playSong" :empty-text='"请稍等..."'>
        <el-table-column label="" prop="index" width="50" />
        <el-table-column width="100">
            <template v-slot="scope">
                <div class="img">
                    <img :src="scope.row.picUrl" alt="">
                    <span class="playFont"></span>
                    <i class="iconfont innerPlayFont">&#xea82;</i>
                </div>
            </template>
        </el-table-column>
        <el-table-column label="音乐标题" width="150">
            <template v-slot='scope'>
                <span>{{scope.row.name}}<i v-if="scope.row.mvid" class="iconfont tomv" @click="toMv($event,scope.row.mvid)">&#xe6a3;</i></span>
            </template>
        </el-table-column>
        <el-table-column width="150">
            <template v-slot='scope'>
                <span class="addSong" @click="addSong($event,scope.row.id)">+</span>
            </template>
        </el-table-column>
        <el-table-column width="200" prop="authorName" label="歌手" />
        <el-table-column width="200" prop="album" label="专辑" />
        <el-table-column width="100" prop="time" label="时长" />
    </el-table>
</template>

<script>
import { getCurrentInstance } from "vue";
import { useStore } from "vuex";
export default {
    name: "SongList",
    props: ["musicInfo"],
    setup(props) {
        const { proxy: methods } = getCurrentInstance();
        const store = useStore();
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
        return {
            playSong,
            addSong,
            toMv,
        };
    },
};
</script>

<style scoped>
.img {
    position: relative;
    width: 60px;
    height: 60px;
}
img {
    width: 100%;
    height: 100%;
    border-radius: 5px;
    border: none;
}
.playFont,
.innerPlayFont {
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    font-size: 14px;
}
.playFont {
    width: 30px;
    height: 30px;
}
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
.tomv {
    color: #d33a31;
    margin-left: 10px;
    vertical-align: middle;
}
</style>
