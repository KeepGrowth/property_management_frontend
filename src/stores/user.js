import { defineStore } from 'pinia';
import api from '@/utils/request.js'
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { ElNotification } from 'element-plus' // 如果需要登录后跳转

export const useUserStore = defineStore('user', () => {
  // --- State ---
  const token = ref(localStorage.getItem('token') || '');
  const userInfo = ref(null); // 存储当前用户信息 (SafeUserResponse)
  const favorites = ref([]); // 收藏列表
  const myHouses = ref([]);  // 我发布的房源
  const totalHouses = ref(0);

  // --- Getters ---
  const isLoggedIn = computed(() => !!token.value);
  const userId = computed(() => userInfo.value ? userInfo.value.user_id : null);
  const userRole = computed(() => userInfo.value ? userInfo.value.role : null);
  const isSeller = computed(() => userRole.value === 2); // 根据后端逻辑 role=2 为发布者

  // --- Actions ---

  /**
   * 用户登录
   * @param {Object} loginForm { username, password, role }
   */
  async function login(loginForm) {
    try {
      // 对应后端: POST /auth/auth/login (注意：你代码中路由前缀是 /auth，路径又是 /auth/login，实际路径可能是 /auth/auth/login)
      // 修正建议：后端代码中 router  prefix="/auth", 路径写的是 "/auth/login" -> 实际 URL: /auth/auth/login
      // 如果这是笔误，请调整为 /auth/login
      const res = await api.post('/auth/login', loginForm);
      if (res.data.code === 200) {
        token.value = res.data.data.token;
        userInfo.value = res.data.data.userInfo;
        return { success: true, data: res.data };
      } else {
        throw new Error(res.message || '登录失败');
      }
    } catch (error) {
      console.error('Login failed:', error);
      // 抛出错误让组件捕获显示提示
      throw error.response?.data || error;
    }
  }

  /**
   * 用户注册
   * @param {Object} registerForm { username, password, phone, ... }
   */
  async function register(registerForm) {
    try {
      const res = await api.post('/auth/auth/register', registerForm);
      ElNotification.success({
        title:'注册成功',
        message:'注册成功~'
      })
      return true
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  /**
   * 获取当前用户个人信息
   */
  async function fetchProfile() {
    if (!token.value) return;
    try {
      const res = await api.get('/users/profile');
      if (res.code === 200 || res.message === '获取成功') {
        userInfo.value = res.data;
        return res.data;
      }
    } catch (error) {
      console.error('Fetch profile failed:', error);
      throw error;
    }
  }

  /**
   * 修改个人资料
   * @param {Object} updateData
   */
  async function updateProfile(updateData) {
    try {
      const res = await api.put('/users/profile', updateData);
      if (res.data.code === 200 || res.data.message === '修改成功') {
        userInfo.value = res.data.data; // 更新本地状态
        return res.data;
      }
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  /**
   * 上传头像
   * @param {File} file
   */
  async function uploadAvatar(file) {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/users/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.code === 200 || res.message === '上传成功') {
        // 上传成功后通常重新获取一次用户信息以更新头像 URL
        await fetchProfile();
        return true;
      } else {
        throw new Error(res.message || '上传失败');
      }
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  /**
   * 获取我的收藏
   */
  async function fetchFavorites() {
    try {
      const res = await api.get('/users/my-favorites');
      if (res.code === 200 || res.message === '获取成功') {
        favorites.value = res.data;
        return res.data;
      }
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  /**
   * 获取我发布的房源
   */
  async function fetchMyHouses() {
    try {
      const res = await api.get('/users/my-houses');
      if (res.data.code === 200 || res.data.message === '获取成功') {
        // 后端返回结构: { houses: [...], total: 10 }
        myHouses.value = res.data.data.houses;
        totalHouses.value = res.data.data.total;
        return res;
      }
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  /**
   * 登出
   */
  function logout() {
    token.value = '';
    userInfo.value = null;
    favorites.value = [];
    myHouses.value = [];
    totalHouses.value = 0;
    localStorage.removeItem('token');

    // 可选：跳转回首页
    const router = useRouter();
    router.push('/login');
  }

  // 初始化：如果本地有 token，尝试恢复用户信息（可选，通常在 App.vue 或 Layout 中调用）
  async function init() {
    if (token.value && !userInfo.value) {
      try {
        await fetchProfile();
      } catch (e) {
        // Token 失效，清除
        logout();
      }
    }
  }

  return {
    // State
    token,
    userInfo,
    favorites,
    myHouses,
    totalHouses,
    // Getters
    isLoggedIn,
    userId,
    userRole,
    isSeller,
    // Actions
    login,
    register,
    fetchProfile,
    updateProfile,
    uploadAvatar,
    fetchFavorites,
    fetchMyHouses,
    logout,
    init
  };
},{
  persist:true
});
export default useUserStore
