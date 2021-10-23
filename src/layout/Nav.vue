<template>
    <div>
        <ul>
            <li @click="dialogShow">
                <span class="iconfont">&#xe67c;</span>登录
            </li>
            <router-link to="/discovery">
                <li>
                    <span class="iconfont">&#xe63b;</span>发现音乐
                </li>
            </router-link>
            <router-link to="playlists">
                <li>
                    <span class="iconfont">&#xe7fe;</span>推荐歌单
                </li>
            </router-link>
            <router-link to="songs">
                <li>
                    <span class="iconfont">&#xe687;</span>新歌速递
                </li>
            </router-link>
            <router-link to="mvs">
                <li>
                    <span class="iconfont">&#xe6a3;</span>最新MV
                </li>
            </router-link>
        </ul>
    </div>
</template>

<script>
import { useStore } from "vuex";
export default {
    setup() {
        const store = useStore();
        function dialogShow() {
            store.commit("MAKEDIALOGSHOW", true);
        }
        return {
            dialogShow,
        };
    },
};
</script>

<style scoped>
div {
    width: 100%;
    height: 100%;
}
ul {
    width: 100%;
    height: 100%;
    background-color: #ededed;
}
ul li {
    font-size: 15px;
    color: #4a4a4a;
    padding: 13px 0 13px 30px;
    user-select: none;
    cursor: pointer;
}
ul li:hover {
    background-color: #e2e2e2;
}
li span {
    margin-right: 15px;
    vertical-align: middle;
}
/* 被选中的路由侧边栏的颜色 */
a.router-link-active li {
    color: #d33a31;
    background-color: #e2e2e2;
}
</style>
