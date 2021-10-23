<template>
    <div class="scrollbar" @scroll="handleScroll" ref="scrollContainer">
        <HeadInfo :listInfo='listInfo'></HeadInfo>
        <div class="nav">
            <div class="changeCard">
                <span @click="changeToSongList" :style="show?style:{}">歌曲列表</span>
                <span @click="changeToComments" :style="show?{}:style">评论({{comments.length}})</span>
            </div>
        </div>
        <div :style="songListFillStyle" v-if="show">
            <SongList :musicInfo='musicInfo'></SongList>
        </div>
        <div :style="commentsFillStyle" v-if="!show">
            <Comments :comments="comments"></Comments>
        </div>
    </div>
</template>

<script>
import { ref, getCurrentInstance, watchEffect, computed } from "vue";
import HeadInfo from "./HeadInfo.vue";
import SongList from "./SongList.vue";
import Comments from "./Comments.vue";
import { useStore } from "vuex";
export default {
    components: {
        HeadInfo,
        SongList,
        Comments,
    },
    setup() {
        const store = useStore();
        const { proxy: methods } = getCurrentInstance();
        let listInfo = ref({});
        let show = ref(true);
        let startIndex = ref(0);
        let containerSize = ref(0);
        let scrollFlag = ref(true);
        let showdata = computed(() => {
            if (show.value) {
                return musicInfo_.value;
            }
            return comments_.value;
        });
        let endIndex = computed(() => {
            let endIndex_ = startIndex.value + containerSize.value;
            if (!showdata.value[endIndex_]) {
                endIndex_ = showdata.value.length - 1;
            }
            return endIndex_;
        });
        let songListFillStyle = computed(() => {
            return {
                paddingTop: startIndex.value * 70 + "px",
                paddingBottom:
                    (musicInfo_.value.length - endIndex.value) * 70 + "px",
            };
        });
        let commentsFillStyle = computed(() => {
            return {
                paddingTop: startIndex.value * 70 + "px",
                paddingBottom:
                    (comments_.value.length - endIndex.value) * 70 + "px",
            };
        });
        let musicInfo_ = ref([]);
        let musicInfo = computed(() => {
            return musicInfo_.value.slice(startIndex.value, endIndex.value);
        });
        let comments_ = ref([]);
        let comments = computed(() => {
            return comments_.value.slice(startIndex.value, endIndex.value);
        });
        let id = ref(0);
        watchEffect(() => {
            id.value = methods.$root.$route.query.playlistid;
            // 获取歌单信息和歌单下的歌曲信息
            if (id.value) {
                methods.http
                    .get(`/playlist/detail?id=${id.value}`)
                    .then((res) => {
                        listInfo.value = res.data.playlist;
                        let ids_ = [];
                        for (let once of res.data.playlist.trackIds) {
                            ids_.push(once.id);
                        }
                        let ids = ids_.join(",");
                        methods.http
                            .get(`song/detail?ids=${ids}`)
                            .then((res) => {
                                let _ = [];
                                let i = 0;
                                for (let once of res.data.songs) {
                                    i++;
                                    let authorName = "";
                                    let name = [];
                                    for (let i of once.ar) {
                                        name.push(i.name);
                                    }
                                    authorName = name.join("/");
                                    let mTime = String(
                                        Math.floor(once.dt / 1000 / 60)
                                    ).padStart(2, "0");
                                    let sTime = String(
                                        Math.floor((once.dt / 1000) % 60)
                                    ).padStart(2, "0");
                                    let info = {
                                        index: i,
                                        id: once.id,
                                        song: {
                                            artists: once.ar,
                                            bMusic: {
                                                playTime: once.dt,
                                            },
                                        },
                                        picUrl: once.al.picUrl,
                                        name: once.name,
                                        authorName: authorName,
                                        album: once.al.name,
                                        time: `${mTime}:${sTime}`,
                                        mvid: once.mv,
                                    };
                                    store.commit("SAVEPLAYLISTINFO", info);
                                    _.push(info);
                                }
                                musicInfo_.value = _;
                            })
                            .catch();
                    })
                    .catch();
                // 获取歌单评论
                methods.http
                    .get(`/comment/playlist?id=${id.value}`)
                    .then((res) => {
                        comments_.value = res.data.comments;
                    });
            }
        });
        let style = {
            color: "#d63a31",
            "border-bottom": "2px solid #d63a31",
        };
        // 滚动回调函数
        function handleScroll() {
            if (scrollFlag.value) {
                scrollFlag.value = false;
                if (methods.$refs.scrollContainer.scrollTop > 320) {
                    startIndex.value = parseInt(
                        (methods.$refs.scrollContainer.scrollTop - 320) / 70
                    );
                } else {
                    startIndex.value = 0;
                }
                let scrollTime = setTimeout(() => {
                    scrollFlag.value = true;
                    window.clearTimeout(scrollTime);
                }, 60);
            }
        }
        // 切换到歌单
        function changeToSongList() {
            show.value = true;
            startIndex.value = 0;
        }
        // 切换到评论
        function changeToComments() {
            show.value = false;
            startIndex.value = 0;
        }
        return {
            listInfo,
            show,
            style,
            musicInfo,
            store,
            comments,
            id,
            containerSize,
            handleScroll,
            songListFillStyle,
            changeToSongList,
            changeToComments,
            commentsFillStyle,
        };
    },
    mounted() {
        this.containerSize =
            Math.ceil(this.$refs.scrollContainer.offsetHeight / 70) + 5;
    },
};
</script>

<style scoped>
.scrollbar {
    width: 100%;
    height: 100%;
    padding: 30px;
    box-sizing: border-box;
    overflow-y: auto;
}
.scrollbar::-webkit-scrollbar {
    /*滚动条整体样式*/
    width: 7px; /*高宽分别对应横竖滚动条的尺寸*/
    height: 100px;
}
.scrollbar::-webkit-scrollbar-thumb {
    /*滚动条里面小方块*/
    border-radius: 5px;
    -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
    box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
    background: rgba(0, 0, 0, 0.1);
}
.nav {
    display: flex;
    width: 100%;
    height: 30px;
    justify-content: space-between;
    margin: 20px 0 10px 0;
    border-bottom: 1px solid #f2f2f1;
}
.changeCard span {
    font-size: 16px;
    margin-right: 20px;
    padding-bottom: 9px;
    cursor: pointer;
}
</style>
