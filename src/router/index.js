import { createRouter, createWebHashHistory } from 'vue-router'

import Discovery from '../views/discovery/index.vue'
import PlayLists from '../views/playlists/index.vue'
import Songs from '../views/songs/index.vue'
import Mvs from '../views/mvs/index.vue'
import Playlist from '../views/playlist/index.vue'
import Mv from '../views/mv/index.vue'
import Search from '../views/search/index.vue'
const routes = [
  {
    path: "/",
    redirect: '/discovery'
  },
  {
    path: "/discovery",
    component: Discovery
  },
  {
    path: '/playlist',
    component: Playlist
  },
  {
    path: '/mv',
    component: Mv
  },
  {
    path: '/playlists',
    component: PlayLists
  },
  {
    path: '/songs',
    component: Songs
  },
  {
    path: '/mvs',
    component: Mvs
  },
  {
    path: '/search',
    component: Search
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
