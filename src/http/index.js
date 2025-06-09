//导入axios
import axios from 'axios'

//获取axios的实例
const instance = axios.create({
    // baseURL: 'https://some-domain.com/api/',
    timeout: 3000, //超时时间，超过3秒后端没有响应，就不等待了
    //headers: {'X-Custom-Header': 'foobar'}
});

//前置拦截：设置请求头中带上token
instance.interceptors.request.use(config => {
    //从本地存储中获取token,设置到请求头中去
    config.headers.Authorization = localStorage.getItem('token');
    return config;
})


//后置拦截
// 添加请求拦截器
instance.interceptors.response.use(function (config) {
    // 在发送请求之前做些什么
    return config.data;//滤掉一层data
}, function (error) {
    // 对请求错误做些什么
    return Promise.reject(error);
});

export default instance;//导出这个实例，供外部使用