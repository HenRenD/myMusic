<template>
    <div class="newsongs" @scroll='handleScroll' ref="scrollContainer">

        <div class="nav">
            <ul>
                <li @click="getSongInfo(item[0])" :style="{color:String(type)===item[0]?'#d33a31':''}" v-for="(item,index) in Object.entries(tags)" :key="index">{{item[1]}}</li>
            </ul>
        </div>
        <div :style="fillStyle">
            <div class="content">
                <SongList :musicInfo='musicInfo'></SongList>
            </div>
        </div>
    </div>
</template>

<script>
import { getCurrentInstance, ref, computed } from "vue";
import { useStore } from "vuex";
import SongList from "../playlist/SongList.vue";
export default {
    components: { SongList },
    setup() {
        const { proxy: methods } = getCurrentInstance();
        const store = useStore();
        let type = ref(0);
        let tags = {
            0: "全部",
            7: "华语",
            96: "欧美",
            8: "日本",
            16: "韩国",
        };
        let musicInfo_ = ref([]);
        let startIndex = ref(0);
        let containerSize = ref(0);
        let scrollFlag = ref(true);
        let endIndex = computed(() => {
            let endIndex_ = startIndex.value + containerSize.value;
            if (!musicInfo_.value[endIndex_]) {
                endIndex_ = musicInfo_.value.length - 1;
            }
            return endIndex_;
        });
        let fillStyle = computed(() => {
            return {
                marginTop: startIndex.value * 70 + "px",
                marginBottom:
                    (musicInfo_.value.length - endIndex.value) * 70 + "px",
            };
        });
        let musicInfo = computed(() => {
            return musicInfo_.value.slice(startIndex.value, endIndex.value);
        });
        function getSongInfo(type_) {
            type.value = type_;
            methods.http.get(`/top/song?type=${type_}`).then((res) => {
                let _ = [];
                let i = 0;
                for (let once of res.data.data) {
                    i++;
                    let authorName = "";
                    let name = [];
                    for (let i of once.artists) {
                        name.push(i.name);
                    }
                    authorName = name.join("/");
                    let mTime = String(
                        Math.floor(once.duration / 1000 / 60)
                    ).padStart(2, "0");
                    let sTime = String(
                        Math.floor((once.duration / 1000) % 60)
                    ).padStart(2, "0");
                    let info = {
                        index: i,
                        id: once.id,
                        song: {
                            artists: once.artists,
                            bMusic: once.bMusic,
                        },
                        picUrl: once.album.picUrl,
                        name: once.name,
                        authorName: authorName,
                        album: once.album.name,
                        time: `${mTime}:${sTime}`,
                        mvid: once.mvid,
                    };
                    store.commit("SAVEPLAYLISTINFO", info);
                    _.push(info);
                }
                musicInfo_.value = _;
            });
        }
        getSongInfo(type.value);
        // 滚动回调函数
        function handleScroll() {
            if (scrollFlag.value) {
                scrollFlag.value = false;
                if (methods.$refs.scrollContainer.scrollTop > 100) {
                    startIndex.value = parseInt(
                        (methods.$refs.scrollContainer.scrollTop - 100) / 70
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
        return {
            musicInfo,
            tags,
            type,
            getSongInfo,
            handleScroll,
            containerSize,
            fillStyle,
        };
    },
    mounted() {
        this.containerSize =
            Math.ceil(this.$refs.scrollContainer.offsetHeight / 70) + 1;
    },
};
</script>

<style scoped>
.newsongs {
    width: 100%;
    height: 100%;
    padding: 20px 5%;
    overflow-y: auto;
    box-sizing: border-box;
}
.newsongs::-webkit-scrollbar {
    /*滚动条整体样式*/
    width: 7px; /*高宽分别对应横竖滚动条的尺寸*/
    height: 100px;
}
.newsongs::-webkit-scrollbar-thumb {
    /*滚动条里面小方块*/
    border-radius: 5px;
    -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
    box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
    background: rgba(0, 0, 0, 0.1);
}
.nav,
.nav ul {
    width: 100%;
    margin: 20px 0;
}
.nav ul {
    display: flex;
}
.nav ul li {
    width: 5%;
    cursor: pointer;
}
.content {
    width: 100%;
}
</style>
