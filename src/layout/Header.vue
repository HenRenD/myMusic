<template>
    <header>
        <span class="back iconfont" @click="routeBack">&#xe600;</span>
        <span class="forward iconfont" @click="routeForward">&#xe61d;</span>
        <el-row>
            <el-input @blur="closeSearch" @focus="showSearch" @keyup.enter="toSearch" prefix-icon="el-icon-search" size="mini" placeholder="搜索-Enter开始" v-model="inputValue" />
        </el-row>
    </header>
</template>

<script>
import "../assets/css/myInput.css";
import { ref, getCurrentInstance, computed, watch } from "vue";
import { useStore } from "vuex";
export default {
    name: "Header",
    emits: ["gethotSearch"],
    props: ["currentWord"],
    setup(props, context) {
        const store = useStore();
        let changeSkinShow = ref(0);
        let inputValue = ref("");
        let history = [];
        const { proxy: methods } = getCurrentInstance();
        // 如果收到props，直接跳转
        let keyword = computed(() => {
            return props.currentWord;
        });
        watch(keyword, (newValue) => {
            if (newValue) {
                inputValue.value = newValue;
                toSearch();
            }
        });
        // 定义路由前进
        function routeForward() {
            methods.$root.$router.forward();
        }
        // 定义路由后退
        function routeBack() {
            methods.$root.$router.back();
        }
        // 搜索框跳转到搜索结果页面
        function toSearch() {
            if (inputValue.value.trim()) {
                methods.$root.$router.push(`/search?q=${inputValue.value}`);
                // 关闭搜索页面
                closeSearch();
                // 将搜索记录保存到本地的sessionstorage中
                history.push(inputValue.value);
                localStorage.setItem("history", history);
                // 清空input
                inputValue.value = "";
                // 关闭歌曲详情页
                store.commit("CHANGESONGDETAILINFOSHOW", {
                    height: 0,
                });
            } else {
                // 清空input
                inputValue.value = "";
                alert("输入不可以为空哦~");
            }
        }
        // input框获取焦点让search页面显示
        function showSearch() {
            store.commit("SEARCHSHOW", {
                height: "84%",
                opacity: 1,
            });
            // 获取热搜
            methods.http.get(`/search/hot`).then((res) => {
                context.emit("gethotSearch", res.data.result.hots);
            });
        }
        // input失去焦点，search页面隐藏
        function closeSearch() {
            store.commit("SEARCHSHOW", {
                height: 0,
                opacity: 0,
            });
        }
        return {
            changeSkinShow,
            inputValue,
            routeForward,
            routeBack,
            toSearch,
            showSearch,
            closeSearch,
        };
    },
};
</script>

<style scoped>
/* 头部区域样式 */
header {
    position: relative;
    width: 100%;
    height: 100%;
    background-color: #d33a31;
}
/* 前进和后退按钮的样式 */
.back,
.forward {
    position: absolute;
    left: 50px;
    top: 50%;
    width: 30px;
    height: 30px;
    transform: translateY(-50%);
    text-align: center;
    line-height: 30px;
    border-radius: 50%;
    font-size: 20px;
    color: #ddd;
    cursor: pointer;
    user-select: none;
}
.forward {
    left: 100px;
}
.back:hover,
.forward:hover {
    background-color: rgba(0, 0, 0, 0.1);
}
/* input框样式 */
.el-row {
    position: absolute;
    right: 20px;
    top: 50%;
    transform: translateY(-50%);
    width: 25%;
}
</style>

