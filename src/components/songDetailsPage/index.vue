<template>
    <el-scrollbar>
        <div class="container">
            <!-- 歌词和播放碟盘动画 -->
            <div class="songWords">
                <SongWords></SongWords>
            </div>
            <!-- 主体内容，包括评论，相似歌曲等信息 -->
            <div class="mainInfo">
                <div class="comments">
                    <div class="goodComments">
                        <GoodComments></GoodComments>
                    </div>
                    <div class="newestComments"></div>
                </div>
                <div class="similar">
                    <SimilarSong></SimilarSong>
                </div>
            </div>
        </div>
    </el-scrollbar>
</template>

<script>
import SongWords from "./SongWords.vue";
import GoodComments from "./GoodComments.vue";
import SimilarSong from "./SimilarSong.vue";
export default {
    components: {
        SongWords,
        GoodComments,
        SimilarSong,
    },
};
</script>

<style scoped>
.el-scrollbar {
    width: 100%;
    height: 100%;
    background-color: #f9f9f9;
}
.container {
    width: 65%;
    height: 100%;
    margin: 0 auto;
    min-width: 900px;
}
.songWords {
    width: 100%;
}
.mainInfo {
    width: 100%;
    display: flex;
}
.comments {
    width: 80%;
}
.similar {
    width: 20%;
}
.goodComments,
.newestComments {
    width: 100%;
}
</style>
