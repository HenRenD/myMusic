<template>
    <div class="player">
        <!-- 歌曲播放详情页面的显示与隐藏 -->
        <div class="songDetails" v-show="onReady" @click="showSongDetailInfo">
            <img :src="musicInfo?musicInfo.picUrl:''" alt="">
            <span class="up iconfont" ref="up">&#xe769;</span>
            <span class="down iconfont" ref="down">&#xe601;</span>
        </div>
        <!-- 歌曲的简略信息，歌手，歌名，时间 -->
        <div class="songInfo" v-show="onReady">
            <span>{{musicInfo?musicInfo.name:''}}&nbsp;&nbsp;-&nbsp;&nbsp;{{autherName}}</span>
            <span>{{String(parseInt(currentTime / 60)).padStart(2,'0')}}:{{String(parseInt(currentTime % 60)).padStart(2,'0')}}&nbsp;&nbsp;/&nbsp;&nbsp;{{minute}}:{{second}}</span>
        </div>
        <!-- 播放与暂停，上一曲，下一曲切换 -->
        <div class="controls">
            <span class="pre iconfont" @click="preSong">&#xe800;</span>
            <span class="parse iconfont" @click="pausePlay">
                <i class="iconfont" ref="pauseIcon">&#xea82;</i>
            </span>
            <span class="next iconfont" @click="nextSong">&#xe7ff;</span>
        </div>
        <!-- 歌曲的播放模式，分享，播放列表，音量控制 -->
        <div class="mode" :style="{'z-index':playModeMsgZindex}">
            <ul>
                <li class="iconfont playMode" @click="changePlayMode" @mouseover="showPlayModeMsg" @mouseout="closePlayModeMsg">
                    <span v-if="playMode === 0">&#xe6a1;</span>
                    <span v-else-if="playMode === 1">&#xe66d;</span>
                    <span v-else>&#xe6a0;</span>
                </li>
                <li class="iconfont playList" @click="makeSongListShow">&#xea37;</li>
                <li class="iconfont volume">
                    <span v-show="volume !== '0'" @click="volumeMute">&#xeca6;</span>
                    <span v-show="volume === '0'" @click="openVolume">&#xe699;</span>
                </li>
            </ul>
            <span class="updateSongMeg" :style="store.state.updateMsg">已更新歌单~<i></i></span>
            <span class="updateSongMeg playModeMsg" :style="{opacity:playModeMsgShow}">
                <span v-if="playMode === 0">顺序播放</span>
                <span v-else-if="playMode === 1">单曲循环</span>
                <span v-else>随机播放</span>
                <i></i>
            </span>
        </div>
        <!-- 歌曲的进度条 -->
        <div class="progressOuter" @click='progressChangeByClick($event)' @mousedown="progressChangeByDrag" ref="progress">
            <div class="progress" :style="{width:currentProgress+'%'}">
                <span class="progressHead" v-show="!(currentProgress === 0)"></span>
            </div>
        </div>
        <!-- 歌曲播放控件-->
        <audio v-if="onReady" :src="songUrl" ref="audio" @canplay="haveReady" @ended="haveEnded"></audio>
        <!-- 音量播放条 -->
        <div class="volumeProgress" @click="changeVolume($event)" ref="volumeProgress">
            <div>
                <span :style="{width:volume + '%'}"></span>
            </div>
        </div>
    </div>
</template>

<script>
import { ref, computed, getCurrentInstance, watch } from "vue";
import { useStore } from "vuex";
export default {
    name: "Player",
    setup() {
        // 使用vuex
        const store = useStore();
        // 使用实例方法
        const { proxy: methods } = getCurrentInstance();
        // 定义一个变量保存audio标签的是否可播放状态
        let onReady = ref(false);
        // 定义一个变量保存当前播放音乐的index
        let currentSongIndex = computed(() => {
            return store.state.index;
        });
        // 使用计算属性获取待播放歌曲的url
        let songUrl = computed(() => {
            if (store.state.currentPlayingSong[currentSongIndex.value]) {
                return store.state.currentPlayingSong[currentSongIndex.value]
                    .url;
            }
            return "";
        });
        // 使用计算属性获取待播放歌曲的id
        let id = computed(() => {
            if (store.state.currentPlayingSong[currentSongIndex.value]) {
                return store.state.currentPlayingSong[currentSongIndex.value]
                    .id;
            }
            return "";
        });
        // 使用计算属性从vuex中获取正在播放的音乐的信息用于展示
        let musicInfo = computed(() => {
            if (id.value) {
                if (
                    Object.keys(store.state.musicListInfo).indexOf(
                        String(id.value)
                    ) !== -1
                ) {
                    return store.state.musicListInfo[id.value];
                } else {
                    return store.state.playListInfo[id.value];
                }
            }
            return {};
        });
        // 定义保存歌手姓名的变量
        let autherName = ref("");
        // 定义两个变量分别保存歌曲的分钟数以及秒数
        let minute = ref("");
        let second = ref("");
        // 用于保存当前播放的时间进度
        let currentTime = ref(0);
        // 用于保存更新当前时间进度的定时器
        let timer;
        // 当前进度条长度
        let currentProgress = ref(0);
        // 用于更新当前进度条的定时器
        let progressTimer;
        // 定义一个变量，控制顺序播放，随机播放，单曲循环
        let playMode = ref(0);
        // 音频的音量
        let volume = ref(50);
        // 当鼠标移动到切换播放模式图标时，让提示信息显示,同时提升层级
        let playModeMsgShow = ref(0);
        let playModeMsgZindex = ref(0);
        // 保存开启静音之前音量，以便恢复
        let beforeVolume;
        // wordId变量用于判断歌曲是否是同一曲,避免歌词的重复请求
        let wordId = 0;
        let updateMsg = computed(() => {
            return store.state.updateMsg;
        });
        watch(updateMsg, (newValue) => {
            if (newValue.opacity) {
                playModeMsgZindex.value = 999;
            } else {
                playModeMsgZindex.value = 0;
            }
        });
        // 监视音乐是否可播放，不可播放时，重置
        watch(onReady, (newValue) => {
            if (!newValue) {
                clearInterval(timer);
                clearInterval(progressTimer);
                currentTime.value = 0;
                currentProgress.value = 0;
                // 改变播放图标
                methods.$refs.pauseIcon.innerHTML = "&#xea82;";
                // 歌曲详情页动画关闭，歌词暂停
                store.commit("CHANGEISPLAYING", false);
                // 关闭歌曲详情页
                store.commit("CHANGESONGDETAILINFOSHOW", {});
                store.commit("GETSONGDETAILINFO", {});
                wordId = 0;
            }
        });
        // 监视id，如果获取到了id，表示歌曲可以播放，此时将audio标签挂载
        watch(id, (newValue) => {
            if (newValue) {
                onReady.value = true;
            } else {
                onReady.value = false;
            }
        });
        // 音乐准备好可以播放了的回调函数
        function haveReady() {
            onReady.value = true;
            methods.$refs.audio.play();
            // 将audio的声音设置为volume
            methods.$refs.audio.volume = volume.value / 100;
            // 切换为播放状态的图标
            methods.$refs.pauseIcon.innerHTML = "&#xea81;";
            // 在歌曲准备好之后，将歌手的姓名渲染到页面，这里对具有多位歌手姓名进行拼接
            let name = [];
            for (let once of musicInfo.value.song.artists) {
                name.push(once.name);
            }
            autherName.value = name.join("/");
            // 在歌曲准备好，可以播放了之后，在取得播放时间，否则会出现NaN的问题
            let songTime = musicInfo.value.song.bMusic.playTime / 1000;
            minute.value = String(parseInt(songTime / 60)).padStart(2, "0");
            second.value = String(parseInt(songTime % 60)).padStart(2, "0");
            // 控制时间进度的更新
            clearInterval(timer);
            currentTime.value = methods.$refs.audio.currentTime;
            timer = setInterval(() => {
                ++currentTime.value;
            }, 1000);
            // 控制进度条的更新
            clearInterval(progressTimer);
            progressTimer = setInterval(() => {
                const audio = methods.$refs.audio;
                let number = audio.currentTime / audio.duration;
                currentProgress.value = (100 * number).toFixed(2);
            }, 30);
            // 将待播放歌曲历史信息存到需要在歌单中展示的信息列表中，该信息列表在vuex中
            let exist = true;
            // exist变量的作用是避免重复添加
            if (store.state.historySongListInfo.length) {
                for (
                    let i = 0;
                    i < store.state.historySongListInfo.length;
                    i++
                ) {
                    if (store.state.historySongListInfo[i].id === id.value) {
                        exist = false;
                        break;
                    }
                }
            }
            // 如果列表中没有该信息才添加
            if (exist) {
                let time = minute.value + ":" + second.value;
                let info = {
                    id: id.value,
                    songName: musicInfo.value.name,
                    authorName: autherName.value,
                    time: time,
                    mvid: musicInfo.value.song.mvid,
                };
                store.commit("SAVEHISTORYSONGLISTINFO", info);
            }
            // 利用id判断歌曲是否是同一首，否则在操作进度条的时候，会重新请求歌词
            if (wordId !== musicInfo.value.id) {
                // 将正在播放的歌曲的相关信息，交给歌曲详情页面
                store.commit("GETSONGDETAILINFO", {
                    songName: musicInfo.value.name,
                    authorName: autherName.value,
                    picture: musicInfo.value.picUrl,
                    id: musicInfo.value.id,
                });
                wordId = musicInfo.value.id;
            }
            // 将歌曲详情页的播放状态设置为true，开启播放动画
            store.commit("CHANGEISPLAYING", true);
        }
        // 暂停播放按钮回调函数
        function pausePlay() {
            // 如果当前audio的状态是可以播放的，才可以进行暂停或者播放
            if (methods.$refs.audio) {
                if (methods.$refs.audio.readyState === 4) {
                    let audio = methods.$refs.audio;
                    if (audio.paused) {
                        // 暂停之后重新播放需要重新开启定时器
                        timer = setInterval(() => {
                            ++currentTime.value;
                        }, 1000);
                        progressTimer = setInterval(() => {
                            const audio = methods.$refs.audio;
                            let number = audio.currentTime / audio.duration;
                            currentProgress.value = (100 * number).toFixed(2);
                        }, 30);
                        audio.play();
                        // 如果不使用这种操作DOM的方式，会出现bug，原因未知
                        methods.$refs.pauseIcon.innerHTML = "&#xea81;";
                        // 开启歌曲详情页动画
                        store.commit("CHANGEISPLAYING", true);
                    } else {
                        audio.pause();
                        // 如果不使用这种操作DOM的方式，会出现bug，原因未知
                        methods.$refs.pauseIcon.innerHTML = "&#xea82;";
                        // 暂停之后，清除定时器
                        clearInterval(timer);
                        clearInterval(progressTimer);
                        // 暂停的同时要关闭歌曲详情页的动画
                        store.commit("CHANGEISPLAYING", false);
                    }
                } else if (methods.$refs.audio.readyState === 2) {
                    // 播放结束后重新开始播放
                    haveReady();
                    // 歌曲重新播放时，控制歌词也重新播放
                    store.commit("AGAINPLAYWORDS", Date.now());
                }
            } else {
                methods.$message.info({
                    message: "歌单中还没有歌曲快去添加吧~",
                    center: true,
                    iconClass: "none",
                    duration: 3000,
                });
            }
        }
        // 歌曲播放完毕的回调函数
        function haveEnded() {
            // 清除定时器
            clearInterval(timer);
            clearInterval(progressTimer);
            // 重置歌曲时间进度和进度条
            currentTime.value = 0;
            currentProgress.value = 0;
            // 将播放状态图标，换为暂停
            methods.$refs.pauseIcon.innerHTML = "&#xea82;";
            // 播放结束的同时要关闭歌曲详情页的动画
            store.commit("CHANGEISPLAYING", false);
            // 根据播放模式自动播放
            if (playMode.value === 0) {
                // 0表示顺序播放
                // 自动播放下一曲
                if (
                    store.state.index !==
                    store.state.currentPlayingSong.length - 1
                ) {
                    store.commit("NEXTSONG");
                }
            } else if (playMode.value === 1) {
                // 1表示单曲循环
                haveReady();
                // 歌曲重新播放时，控制歌词也重新播放
                store.commit("AGAINPLAYWORDS", Date.now());
            } else {
                // 此时playMode = 2，表示随机播放，需要随机生成一个播放指针，将这个工作交给vuex做
                // 在这里只commit
                store.commit("RANDOMPLAY");
            }
        }
        // 通过click进度条改变事件，进度条改变事件的调用会引起audio的canplay事件的触发
        function progressChangeByClick(e) {
            if (methods.$refs.audio) {
                let audio = methods.$refs.audio;
                // 播放器的状态在就绪状态才可以改变进度条
                if (audio.readyState === 4 || audio.readyState === 2) {
                    // 获取鼠标的x轴坐标
                    let x = e.x;
                    // 获取进度条父元素的总长度
                    let progressTotal = methods.$refs.progress.offsetWidth;
                    // 通过鼠标坐标和总长度计算百分比
                    let precent = parseFloat((x / progressTotal).toFixed(2));
                    // 获取audio元素
                    let audio = methods.$refs.audio;
                    // 通过百分比，重新定位currentTime
                    audio.currentTime = audio.duration * precent;
                    // 将当前时间交给vuex，控制歌词的跟随
                    store.commit("GETSONGCURRENTTIME", audio.currentTime);
                }
            }
        }
        // 通过拖动触发进度条改变事件
        function progressChangeByDrag() {
            // mousemove事件的回调函数
            function move(e) {
                // 获取鼠标的x轴坐标
                let x = e.x;
                // 获取进度条父元素的总长度
                let progressTotal = methods.$refs.progress.offsetWidth;
                // 通过鼠标坐标和总长度计算百分比
                let precent = parseFloat((x / progressTotal).toFixed(2));
                // 获取audio元素
                let audio = methods.$refs.audio;
                // 通过百分比，重新定位currentTime
                audio.currentTime = audio.duration * precent;
                // 进度条要跟随拖动变化
                let number = audio.currentTime / audio.duration;
                currentProgress.value = (100 * number).toFixed(2);
                // 将当前时间交给vuex，控制歌词的跟随
                store.commit("GETSONGCURRENTTIME", audio.currentTime);
            }
            if (methods.$refs.audio) {
                let audio = methods.$refs.audio;
                // 播放器的状态在就绪状态才可以拖动
                if (audio.readyState === 4 || audio.readyState === 2) {
                    document.addEventListener("mousemove", move);
                    document.addEventListener("mouseup", function () {
                        document.removeEventListener("mousemove", move);
                    });
                }
            }
        }
        // 上一首歌曲
        function preSong() {
            if (store.state.currentPlayingSong.length === 0) {
                methods.$message.info({
                    message: "歌单中还没有歌曲快去添加吧~",
                    center: true,
                    iconClass: "none",
                    duration: 3000,
                });
            } else {
                // 顺序播放或者单曲循环
                if (playMode.value === 0 || playMode.value === 1) {
                    if (store.state.index === 0) {
                        methods.$message.info({
                            message: "已经是第一首歌咯~",
                            center: true,
                            iconClass: "none",
                            duration: 3000,
                        });
                    } else {
                        store.commit("PRESONG");
                    }
                    // 随机播放
                } else {
                    store.commit("RANDOMPLAY");
                }
            }
        }
        // 下一首歌曲
        function nextSong() {
            if (store.state.currentPlayingSong.length === 0) {
                methods.$message.info({
                    message: "歌单中还没有歌曲快去添加吧~",
                    center: true,
                    iconClass: "none",
                    duration: 3000,
                });
            } else {
                // 顺序播放或者单曲循环
                if (playMode.value === 0 || playMode.value === 1) {
                    if (
                        store.state.index ===
                        store.state.currentPlayingSong.length - 1
                    ) {
                        methods.$message.info({
                            message: "已经是最后一首歌咯~",
                            center: true,
                            iconClass: "none",
                            duration: 3000,
                        });
                    } else {
                        store.commit("NEXTSONG");
                    }
                    // 随机播放
                } else {
                    store.commit("RANDOMPLAY");
                }
            }
        }
        // 让歌单显示与隐藏
        function makeSongListShow() {
            let height = store.state.songListShow;
            if (height.height) {
                store.commit("CHANGESONGLISTSHOW", {
                    height: 0,
                    opacity: 0,
                });
            } else {
                store.commit("CHANGESONGLISTSHOW", {
                    height: "92%",
                    opacity: 1,
                });
            }
        }
        // 改变播放模式
        function changePlayMode() {
            playMode.value++;
            if (playMode.value > 2) {
                playMode.value = 0;
            }
        }
        // 改变播放声音
        function changeVolume(e) {
            let offsetLeft = methods.$refs.volumeProgress.offsetLeft;
            let offsetWidth = methods.$refs.volumeProgress.offsetWidth;
            let pageX = e.pageX;
            let volumeWidth = pageX - offsetLeft;
            let precent = (volumeWidth / offsetWidth).toFixed(2);
            if (precent > 0.95) {
                precent = 1;
                volume.value = 100;
                if (methods.$refs.audio) methods.$refs.audio.volume = 1;
            } else if (precent < 0.05) {
                precent = 0;
                volume.value = "0";
                if (methods.$refs.audio) methods.$refs.audio.volume = 0;
            } else {
                volume.value = precent * 100;
                if (methods.$refs.audio) methods.$refs.audio.volume = precent;
            }
        }
        // 静音按键
        function volumeMute() {
            beforeVolume = volume.value;
            volume.value = "0";
            if (methods.$refs.audio) {
                methods.$refs.audio.volume = volume.value / 100;
            }
        }
        // 关闭静音
        function openVolume() {
            volume.value = beforeVolume;
            if (methods.$refs.audio) {
                methods.$refs.audio.volume = volume.value / 100;
            }
        }
        // 播放模式提示信息的显示与隐藏
        // 显示
        function showPlayModeMsg() {
            playModeMsgShow.value = 1;
            playModeMsgZindex.value = 999;
        }
        // 隐藏
        function closePlayModeMsg() {
            playModeMsgShow.value = 0;
            playModeMsgZindex.value = 0;
        }
        // 控制歌曲详情页面的显示
        function showSongDetailInfo() {
            let info = store.state.songDetailShow;
            if (!info.height) {
                store.commit("CHANGESONGDETAILINFOSHOW", {
                    height: "84%",
                    opacity: 1,
                });
                methods.$refs.up.innerHTML = "&#xe601;";
                methods.$refs.down.innerHTML = "&#xe769;";
            } else {
                store.commit("CHANGESONGDETAILINFOSHOW", {});
                methods.$refs.up.innerHTML = "&#xe769;";
                methods.$refs.down.innerHTML = "&#xe601;";
            }
        }
        let songDetailShow = computed(() => {
            return store.state.songDetailShow;
        });
        watch(songDetailShow, (newValue) => {
            if (newValue.height) {
                methods.$refs.up.innerHTML = "&#xe601;";
                methods.$refs.down.innerHTML = "&#xe769;";
            } else {
                methods.$refs.up.innerHTML = "&#xe769;";
                methods.$refs.down.innerHTML = "&#xe601;";
            }
        });
        return {
            songUrl,
            haveReady,
            onReady,
            musicInfo,
            autherName,
            pausePlay,
            minute,
            second,
            currentTime,
            haveEnded,
            currentProgress,
            progressChangeByClick,
            progressChangeByDrag,
            preSong,
            nextSong,
            makeSongListShow,
            timer,
            progressTimer,
            store,
            playMode,
            changePlayMode,
            volume,
            changeVolume,
            volumeMute,
            openVolume,
            playModeMsgShow,
            playModeMsgZindex,
            showPlayModeMsg,
            closePlayModeMsg,
            showSongDetailInfo,
        };
    },
};
</script>

<style scoped>
.player {
    position: relative;
    width: 100%;
    height: 100%;
    border-top: 2px solid #f5f5f5;
    z-index: 999;
}
/* 展开歌曲播放详情的控制区域样式 */
.songDetails {
    overflow: hidden;
    position: absolute;
    left: 20px;
    top: 50%;
    transform: translateY(-50%);
    width: 3.6%;
    min-width: 45px;
    height: 80%;
    border-radius: 10px;
    cursor: pointer;
    user-select: none;
    border: 1px solid #ddd;
    box-sizing: border-box;
}
.songDetails img {
    width: 100%;
    height: 100%;
    filter: blur(2px);
}
.songDetails span {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    color: white;
    font-size: 30px;
    font-weight: 500;
    text-align: center;
    user-select: none;
}
.up {
    top: 6%;
}
.down {
    bottom: 6%;
}
/* 歌曲的简略信息展示，歌名，歌手，播放时间 */
.songInfo {
    display: flex;
    overflow: hidden;
    position: absolute;
    top: 50%;
    left: 80px;
    height: 80%;
    width: 200px;
    flex-direction: column;
    justify-content: space-between;
    transform: translateY(-50%);
    user-select: none;
}
.songInfo span:first-child {
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
}
/* 歌曲的暂定与播放，上一曲，下一曲的切换 */
.controls {
    position: absolute;
    left: 50%;
    top: 50%;
    height: 80%;
    width: 150px;
    transform: translate(-50%, -50%);
    cursor: pointer;
    user-select: none;
}
.parse {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: #d33a31;
}
.parse i {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    color: white;
}
.pre,
.next {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    font-size: 30px;
    color: #d33a31;
}
.pre {
    left: 0;
}
.next {
    right: 0;
}
/* 播放模式，音量控制，播放列表等 */
.mode {
    position: absolute;
    right: 200px;
    top: 50%;
    transform: translateY(-50%);
    width: 120px;
    height: 80%;
    cursor: pointer;
    user-select: none;
}
.mode ul {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.mode ul li {
    position: relative;
    font-size: 18px;
}
/* 歌曲进度条样式 */
.progressOuter {
    position: absolute;
    overflow-x: hidden;
    top: -7px;
    left: 0;
    width: 100%;
    height: 12px;
    cursor: pointer;
    z-index: 888;
}
.progress {
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    height: 2px;
    background-color: #d33a31;
}
.progressHead {
    position: absolute;
    right: -10px;
    top: 50%;
    transform: translateY(-50%);
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: #d33a31;
    opacity: 0;
    transition: all 0.2s ease-in-out;
}
.progressOuter:hover .progressHead {
    opacity: 1;
}
/* 歌单提示消息框 */
.updateSongMeg {
    position: absolute;
    top: -30px;
    right: 0;
    width: 100px;
    height: 30px;
    border-radius: 5px;
    text-align: center;
    line-height: 30px;
    box-shadow: 2px 2px 5px #999;
    background-color: white;
    opacity: 0;
    transition: all 0.2s linear;
}
.updateSongMeg i {
    position: absolute;
    left: 50%;
    bottom: -14px;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border: 7px solid transparent;
    border-top: 7px solid white;
}
/* 播放模式的提示信息 */
.playModeMsg {
    opacity: 0;
    top: -30px;
    right: 50px;
    font-size: 12px;
}
/* 控制声音的音量条 */
.volumeProgress {
    position: absolute;
    right: 40px;
    top: 50%;
    transform: translateY(-50%);
    width: 150px;
    height: 15px;
    cursor: pointer;
}
.volumeProgress div {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 100%;
    height: 2px;
    background-color: #999;
}
.volumeProgress span {
    position: absolute;
    width: 50%;
    height: 100%;
    background-color: #d33a31;
}
.volumeProgress span::before {
    position: absolute;
    right: -6px;
    top: 50%;
    transform: translateY(-50%);
    content: "";
    width: 12px;
    height: 12px;
    background-color: #d33a31;
    border-radius: 50%;
}
</style>
