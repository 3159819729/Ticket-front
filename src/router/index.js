import { createRouter, createWebHistory } from 'vue-router'
import Main from '@/views/Main.vue'
import UpdatePwd from '@/components/UpdatePwd.vue'
import InfoCenter from "@/components/InfoCenter.vue";
import Info from "@/components/Info.vue";
import Orders from "@/components/Orders.vue";
import Visitors from "@/components/Visitors.vue";
import AdminEdit from "@/components/AdminEdit.vue";
import ActionLogs from "@/components/ActionLogs.vue";
import UsersEdit from "@/components/UsersEdit.vue";
import TicketEdit from "@/components/TicketEdit.vue";
import InventoryEdit from "@/components/InventoryEdit.vue";
import DiscountEdit from "@/components/DiscountEdit.vue";
import BlackEdit from "@/components/BlackEdit.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/main'
    },
    {
      path: '/main',
      component:Main,
    },
    {
      path:'/infoCenter',
      component:InfoCenter,
      redirect: '/infoCenter/info',
      children:[
        {
          path: 'info',
          component: Info,
        },
        {
          path:'orders',
          component:Orders
        },
        {
          path:'visitors',
          component:Visitors
        },
        {
          path:'usersEdit',
          component:UsersEdit
        },
        {
          path:'adminEdit',
          component:AdminEdit
        },
        {
          path:'actionLogs',
          component:ActionLogs
        },
        {
          path:'ticketEdit',
          component:TicketEdit
        },
        {
          path:'inventoryEdit',
          component:InventoryEdit
        },
        {
          path:"updatePwd",
          component:UpdatePwd
        },
        {
          path:"discountEdit",
          component:DiscountEdit
        },
        {
          path:"blackEdit",
          component:BlackEdit
        },
      ]
    }
  ]
})

export default router
