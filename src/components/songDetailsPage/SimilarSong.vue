<template>
    <div class="similarSongList" v-show="similarSongList.length">
        <h2>相似歌单</h2>
        <ul>
            <li v-for="(item,index) in similarSongList" :key="index" @click="toPlaylist(item.id)">
                <img :src="item.coverImgUrl" alt="">
                <div class="info">
                    <p>{{item.name}}</p>
                    <p><i class="iconfont">&#xea82;</i>{{Math.floor(item.playCount / 10000)}}万</p>
                </div>
            </li>
        </ul>
    </div>
</template>

<script>
import { getCurrentInstance, computed, watch, ref } from "vue";
import { useStore } from "vuex";
export default {
    name: "SimilarSong",
    setup() {
        const { proxy: methods } = getCurrentInstance();
        const store = useStore();
        // 歌曲id
        let songId = computed(() => {
            if (store.state.songDetailInfo) {
                return store.state.songDetailInfo.id;
            }
            return "";
        });
        // 相似歌单
        let similarSongList = ref([]);
        watch(songId, (newValue) => {
            if (newValue) {
                methods.http
                    .get(`/simi/playlist?id=${newValue}`)
                    .then((res) => {
                        similarSongList.value = res.data.playlists;
                    });
            }
        });
        // 跳转到歌单页面
        function toPlaylist(id) {
            methods.$root.$router.push(`/playlist?playlistid=${id}`);
            // 关闭详情页
            store.commit("CHANGESONGDETAILINFOSHOW", {});
        }
        return {
            similarSongList,
            toPlaylist,
        };
    },
};
</script>

<style scoped>
.similarSongList,
.similarSong,
ul,
li {
    width: 100%;
}
h2 {
    font-size: 20px;
}
ul {
    margin: 20px 0;
}
li {
    display: flex;
    cursor: pointer;
    padding: 5px;
    border-radius: 5px;
}
li:hover {
    background-color: #efefef;
}
img {
    width: 50px;
    height: 50px;
    border-radius: 5px;
    margin-right: 8px;
}
.info {
    overflow: hidden;
}
p {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin: 0;
    padding: 0;
}
.info p:last-child {
    color: #bebebe;
}
.info i {
    font-size: 10px;
}
</style>
