<template>
    <el-scrollbar>
        <div class="mv">
            <div class="main">
                <div class="play">
                    <MvDetail :mvInfo='mvInfo'></MvDetail>
                </div>
                <div class="similar">
                    <SimilarMv :simiMvs='simiMvs'></SimilarMv>
                </div>
            </div>
            <div class="comments">
                <MvComments :comments='comments'></MvComments>
            </div>
        </div>
    </el-scrollbar>
</template>

<script>
import MvDetail from "./MvDetail.vue";
import SimilarMv from "./SimilarMv.vue";
import MvComments from "./MvComments.vue";
import { ref, watchEffect, getCurrentInstance } from "vue";
export default {
    components: {
        MvDetail,
        SimilarMv,
        MvComments,
    },
    setup() {
        const { proxy: methods } = getCurrentInstance();
        let mvId = ref(0);
        let mvInfo = ref({});
        let simiMvs = ref([]);
        let comments = ref([]);
        watchEffect(() => {
            mvId.value = methods.$root.$route.query.mvsid;
            if (mvId.value) {
                // 获取mv播放链接
                methods.http
                    .get(`mv/url?id=${mvId.value}`)
                    .then((res) => {
                        mvInfo.value.url = res.data.data.url;
                    })
                    .catch(() => {});
                // 获取mv详情
                methods.http
                    .get(`mv/detail?mvid=${mvId.value}`)
                    .then((res) => {
                        mvInfo.value.authorName = res.data.data.artistName;
                        mvInfo.value.img = res.data.data.cover;
                        mvInfo.value.playTime = res.data.data.duration;
                        mvInfo.value.time = res.data.data.publishTime;
                        mvInfo.value.title = res.data.data.name;
                        mvInfo.value.playCount = res.data.data.playCount;
                    })
                    .catch(() => {});
                // 获取相似mv
                methods.http.get(`simi/mv?mvid=${mvId.value}`).then((res) => {
                    simiMvs.value = res.data.mvs;
                });
                // 获取mv评论
                methods.http.get(`comment/mv?id=${mvId.value}`).then((res) => {
                    comments.value = res.data.comments;
                });
            }
        });
        return {
            mvInfo,
            simiMvs,
            comments,
        };
    },
};
</script>

<style scoped>
.el-scrollbar {
    width: 100%;
    height: 100%;
}
.mv {
    width: 80%;
    margin: 20px auto;
}
.main {
    display: flex;
    justify-content: space-between;
    width: 100%;
}
.play {
    width: 70%;
}
.similar {
    width: 28%;
}
.comments {
    width: 70%;
    margin: 20px 0;
}
</style>
