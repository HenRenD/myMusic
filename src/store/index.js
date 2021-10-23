import { createStore } from 'vuex'

export default createStore({
  state: {
    // 保存最新音乐的基本信息，用于在需要的地方展示
    musicListInfo: {},
    // 保存歌单中音乐信息
    playListInfo: {},
    // 保存待播放播放的音乐的id和播放url
    currentPlayingSong: [],
    // 当前正在播放的歌曲的index
    index: 0,
    // 控制歌单的显示与隐藏
    songListShow: {},
    // 在历史记录歌单中展示的信息
    historySongListInfo: [],
    // 歌单中待播放歌曲
    waitPlaySong: [],
    // 歌单更新提示信息的显示与隐藏
    updateMsg: {},
    // 控制歌曲详情页面的显示与隐藏
    songDetailShow: {},
    // 需要在歌曲详情页面中显示的歌曲的一些信息
    songDetailInfo: {},
    // 控制歌曲详情页面播放动画
    isPlaying: false,
    // 保存歌曲播放的当前时间currentTime,目的是触发歌词跟随
    songCurrentTime: 0,
    // 歌曲只要重新播放，就要重新播放歌词
    againPlayWords: '',
    // 控制搜索页面的显示
    searchShow: {},
    // 控制对话框的显示
    dialogShow: false
  },
  mutations: {
    // 将获取到的所有的音乐的基本信息保存在state中
    SAVEMUSICLISTINFO(state, value) {
      state.musicListInfo[value.id] = value
    },
    // 将获取到的歌单中音乐的信息，保存到state中
    SAVEPLAYLISTINFO(state, value) {
      state.playListInfo[value.id] = value
    },
    // 将获取到的播放url保存到state中
    CURRENTPLAYINGSONG(state, value) {
      state.currentPlayingSong.push({
        id: value.id,
        url: value.url,
      })
    },
    // 下一曲
    NEXTSONG(state) {
      state.index++
    },
    // 上一曲
    PRESONG(state) {
      state.index--
    },
    // 如果歌单中已经存在，再次点击之后，不会添加音乐，但是会将播放的指针移动到当前音乐
    CHANGEINDEX(state, index) {
      state.index = index
    },
    // 在每一次发送播放请求的时候，将需要在歌单中展示的信息收集到historySongListInfo中
    SAVEHISTORYSONGLISTINFO(state, info) {
      state.historySongListInfo.push(info)
    },
    // 保存歌单信息
    SAVEWAITPLAYSONG(state, info) {
      state.waitPlaySong.push(info)
    },
    // 修改songListShow,控制歌单的显示与隐藏
    CHANGESONGLISTSHOW(state, value) {
      state.songListShow = value
    },
    // 清空歌单
    CLEARSONGLIST(state) {
      state.waitPlaySong = []
      state.currentPlayingSong = []
      state.index = 0
    },
    // 清空历史记录
    CLEARHISTORYLIST(state) {
      state.historySongListInfo = []
    },
    // 处理歌单更新提示信息的显示与隐藏
    UPDATEMSGSHOW(state, value) {
      state.updateMsg = value
    },
    // 随机播放，随机生成index==>播放指针
    RANDOMPLAY(state) {
      // 歌单中可播放歌曲的个数
      let songs = state.waitPlaySong.length
      if (songs > 1) {
        let index = Math.floor(Math.random() * songs)
        // 避免两次随机到同一首歌曲
        while (state.index === index) {
          index = Math.floor(Math.random() * songs)
        }
        state.index = index
      }
    },
    // 控制歌单详情页面的显示与隐藏
    CHANGESONGDETAILINFOSHOW(state, value) {
      state.songDetailShow = value
    },
    // 接收需要在歌曲详情页面中显示的信息
    GETSONGDETAILINFO(state, value) {
      state.songDetailInfo = value
    },
    // 歌曲播放状态改变，歌曲详情页面的播放动画也要跟随改变
    CHANGEISPLAYING(state, value) {
      state.isPlaying = value
    },
    // 接收歌曲的当前播放进度时间
    GETSONGCURRENTTIME(state, value) {
      state.songCurrentTime = value
    },
    // 重新播放歌曲时，重新播放歌词
    AGAINPLAYWORDS(state, value) {
      state.againPlayWords = value
    },
    // 搜索页面显示
    SEARCHSHOW(state, value) {
      state.searchShow = value
    },
    // 控制对话框显示
    MAKEDIALOGSHOW(state, value) {
      state.dialogShow = value
    }
  },
  actions: {
  },
  modules: {
  }
})
