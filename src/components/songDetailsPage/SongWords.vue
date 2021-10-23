<template>
    <div class="songWord">
        <div class="playAnimation">
            <div class="playbar">
                <img src="../../assets/image/play-bar-support.png" alt="">
                <img :style="style" src="../../assets/image/play-bar.png" alt="">
            </div>
            <div class="outer">
                <div class="second">
                    <div class="inner" :style="scroll">
                        <img :src="songInfo.picture" alt="">
                    </div>
                </div>
            </div>
        </div>
        <div class="words">
            <p>{{songInfo.songName}}</p>
            <p>歌手：<span>{{songInfo.authorName}}</span></p>
            <div class="over">
                <div class="wrapper" ref="wrapper" v-show="wordShow">
                    <ul class="content">
                        <li :class="{'current':currentLine===index}" v-for="(word,index) in songWords" :key="index" ref="wordLine">
                            {{word.txt}}
                        </li>
                    </ul>
                </div>
                <div class="nowords" v-show="!wordShow"><span>暂没有歌词！</span></div>
            </div>
        </div>
    </div>
</template>

<script>
import { reactive, computed, watch, getCurrentInstance, ref } from "vue";
import { useStore } from "vuex";
import Lyric from "lyric-parser";
import BScroll from "better-scroll";
export default {
    name: "SongWords",
    setup() {
        const store = useStore();
        const { proxy: methods } = getCurrentInstance();
        let style = reactive({});
        let scroll = reactive({});
        let songWords = ref([]);
        let deg = 0;
        let timer;
        let currentLine = ref(0);
        let lyric;
        let wordScroll;
        let wordShow = ref(true);
        // 获取vuex中控制歌词重新播放的变量
        let againPlayWords = computed(() => {
            return store.state.againPlayWords;
        });
        // 获取vuex中保存的正在播放的音乐的信息
        let songInfo = computed(() => {
            return store.state.songDetailInfo;
        });
        // 获取歌曲的播放状态，以决定播放动画是否开启
        let isPlaying = computed(() => {
            return store.state.isPlaying;
        });
        // 获取当前歌曲的播放进度，控制歌词跟随
        let currentTime = computed(() => {
            return store.state.songCurrentTime;
        });
        // 监视当前歌曲的播放进度
        watch(currentTime, (newValue) => {
            if (lyric) {
                // 将歌词跳转到新的进度
                lyric.seek(newValue * 1000);
            }
        });
        // 监视播放状态的改变，作为开启和关闭动画的标准
        watch(isPlaying, (newValue, oldValue) => {
            if (newValue) {
                // 将playbar移动到滚动圆盘上
                style.transform = `translateX(-50%) rotate(5deg)`;
                // 让滚动圆盘转动起来
                timer = setInterval(() => {
                    if (deg >= 360) {
                        deg = 0;
                    }
                    deg += 1;
                    scroll.transform = `translate(-50%, -50%) rotate(${deg}deg)`;
                }, 50);
                // 开启歌词播放
                if (lyric) lyric.togglePlay();
            } else {
                style.transform = "";
                clearInterval(timer);
                // 暂停歌词播放
                if (lyric) lyric.togglePlay();
            }
        });
        // 监视歌曲信息的变化，获取对应的歌词
        watch(songInfo, (newValue) => {
            let id = newValue.id;
            // 每次歌曲信息改变，就根据对应的歌曲id发送获取歌词的请求
            if (id) {
                methods.http
                    .get(`/lyric?id=${id}`)
                    .then((res) => {
                        if (res.data.lrc) {
                            // 这里的作用是，在切换歌曲之后，清空上一首歌曲歌词的播放
                            if (lyric) lyric.stop();
                            lyric = new Lyric(res.data.lrc.lyric, handler);
                            songWords.value = lyric.lines;
                            lyric.play();
                            // 切换歌曲之后，重新滚动到最开始
                            if (wordScroll) {
                                wordScroll.scrollToElement(0, 0, 1000);
                            }
                            // 有歌词就让歌词显示
                            wordShow.value = true;
                        } else {
                            // 没有歌词就提示没有歌词
                            wordShow.value = false;
                        }
                    })
                    .catch();
            }
        });
        // 监视歌词重新播放的变量
        watch(againPlayWords, (newValue) => {
            if (newValue) {
                wordScroll.scrollTo(0, 0, 1000);
                lyric.play();
            }
        });
        // 歌词回调函数
        function handler({ lineNum, txt }) {
            // better-scorll歌词滚动
            wordScroll = new BScroll(methods.$refs.wrapper, {
                mouseWheel: true,
            });
            // 当前行数为歌词的当前行数
            currentLine.value = lineNum;
            // 当前行大于5，开始滚动
            if (lineNum > 4) {
                let lineElement = methods.$refs.wordLine;
                // 结合better-scroll,滚动歌词
                wordScroll.scrollTo(
                    0,
                    -(lineNum - 4) * lineElement.offsetHeight,
                    1000
                );
            } else {
                // better-scorll歌词滚动
                wordScroll.scrollTo(0, 0, 1000);
            }
        }
        return {
            style,
            songInfo,
            scroll,
            songWords,
            currentLine,
            wordShow,
        };
    },
};
</script>

<style scoped>
.songWord {
    display: flex;
    width: 100%;
    justify-content: space-between;
    height: 450px;
}
.songWord img {
    user-select: none;
}
.playAnimation {
    position: relative;
    width: 50%;
    height: 100%;
}
.playbar img {
    position: absolute;
    top: 0;
    left: 50%;
}
.playbar img:first-child {
    top: -16px;
    width: 30px;
    height: 30px;
    z-index: 99;
}
.playbar img:last-child {
    top: 0;
    left: 63%;
    width: 100px;
    z-index: 88;
    transform-origin: 0 0;
    transform: translateX(-50%) rotate(-30deg);
    transition: all 0.2s linear;
}
.outer {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 300px;
    height: 300px;
    border-radius: 50%;
    background-color: #e6e5e6;
}
.second {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 95%;
    height: 95%;
    border-radius: 50%;
    background-color: #16171c;
}
.inner {
    position: absolute;
    overflow: hidden;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 65%;
    height: 65%;
    border-radius: 50%;
}
.inner img {
    width: 100%;
    height: 100%;
}
/* 歌曲名字，歌手部分 */
.words {
    width: 50%;
    height: 100%;
}
.words p:first-child {
    font-size: 25px;
}
.words li {
    overflow: hidden;
    padding: 5px 0;
    color: #555;
    font-size: 13px;
    font-family: "楷体";
    font-weight: 450;
    transition: all 0.3s linear;
    text-overflow: hidden;
    white-space: nowrap;
}
.words span {
    color: #7791c9;
}
/* 歌词部分 */
.over {
    width: 100%;
    height: 70%;
    overflow: hidden;
    mask-image: -webkit-gradient(
        linear,
        left top,
        left bottom,
        color-stop(0, hsla(0, 0%, 100%, 0)),
        color-stop(15%, hsla(0, 0%, 100%, 0.6)),
        color-stop(25%, #fff),
        color-stop(75%, #fff),
        color-stop(85%, hsla(0, 0%, 100%, 0.6)),
        to(hsla(0, 0%, 100%, 0))
    );
    -webkit-mask-image: -webkit-gradient(
        linear,
        left top,
        left bottom,
        color-stop(0, hsla(0, 0%, 100%, 0)),
        color-stop(15%, hsla(0, 0%, 100%, 0.6)),
        color-stop(25%, #fff),
        color-stop(75%, #fff),
        color-stop(85%, hsla(0, 0%, 100%, 0.6)),
        to(hsla(0, 0%, 100%, 0))
    );
}
.wrapper {
    width: 100%;
    height: 100%;
}
.words .current {
    font-size: 16px;
    font-weight: 700;
    color: black;
}
.nowords {
    position: relative;
    width: 100%;
    height: 100%;
    font-size: 20px;
    font-family: "楷体";
}
.nowords span {
    position: absolute;
    top: 100px;
    color: #333;
}
</style>
