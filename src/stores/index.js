import { createStore } from "vuex";
import axios from "@/http";
import {all} from "axios";

const store = createStore({
    state: {
        isAdmin: false,
        isLoggedIn:false,
        role:null,
        avatar:null,
        id:null,
        name: null,
        isSuperAdmin: false,
        currentStep:1,
    },
    mutations: {
        setTickets(state, tickets) {
            state.ticketList = tickets;
            state.lastFetchTime = Date.now();
        },
        updateInfoA(state, { name, avatar }) {
            state.name = name;
            state.avatar = avatar;
            localStorage.setItem("name", name);
            localStorage.setItem("avatar", avatar);
        },
        updateInfo(state, { name}) {
            state.name = name;
            localStorage.setItem("name", name);
        },
        setRole(state,role){
            state.role = role;
        },
        setIsLoggedIn(state,isLoggedIn){
            state.isLoggedIn = isLoggedIn;
        },
        setIsAdmin(state,isAdmin){
            state.isAdmin = isAdmin;
        },
        setId(state,id){
            state.id = id;
        },
        setName(state,name){
            state.name = name;
        },
        setAvatar(state,avatar){
            state.avatar = avatar;
        },
        setIsSuperAdmin(state,isSuperAdmin){
            state.isSuperAdmin = isSuperAdmin;
        },
        setCurrentStep(state,currentStep){
            state.currentStep = currentStep;
        },
        login(state, {id,name, avatar ,isSuperAdmin}) {
            state.id = id;
            state.isLoggedIn = true;
            state.isAdmin = state.role==='admin';
            state.name = name;
            state.avatar = avatar;
            state.isSuperAdmin = isSuperAdmin;
            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("id", id);
            localStorage.setItem("isAdmin",state.isAdmin);
            localStorage.setItem("name", name);
            localStorage.setItem("avatar", avatar);
            localStorage.setItem("is_super_admin", isSuperAdmin)
        },
        chooseLoginButton(state,role){
            state.role = role;
            localStorage.setItem("role", role);
        },
        logout(state) {
            state.isLoggedIn = false;
            state.isAdmin = false;
            state.role = "";
            state.name = "";
            state.avatar = "";
            state.currentStep = 1;
            localStorage.clear();
        },
    },
    actions: {
        async confirmCancelOrder({}, { orderId, cancelReason }) {
            try {
                const response = await axios.post('/api/user/cancelOrder', {
                    order_id: orderId,
                    cancel_reason: cancelReason,
                });
                const { code, message } = response;
                if (code === 20000) {
                    return response;
                } else {
                    throw new Error(message);
                }
            } catch (error) {
                throw error;
            }
        },
    },
    getters: {
        isAdmin: (state) => state.role === "admin",
        getLocalTime() {
            const localDate = new Date();
            const timezoneOffset = localDate.getTimezoneOffset();
            return new Date(localDate.getTime() - timezoneOffset * 60000).toISOString().replace("Z", "");
        },
        convertUtcToLocalDate: () => (utcDate) => {
            return new Intl.DateTimeFormat('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                timeZone: 'Asia/Shanghai'
            }).format(new Date(utcDate)).replace(/\//g, '-'); // 替换 "/" 为 "-"
        },
    },
});

export default store;
