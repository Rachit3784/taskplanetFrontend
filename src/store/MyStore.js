import { create } from "zustand";

export const BASE_URL = import.meta.env.VITE_BASE_URL;
const TOKEN_KEY = import.meta.env.VITE_TOKEN_KEY;

/* ---------------- TOKEN STORAGE (WEB) ---------------- */

const saveToken = (token) => {
  if (token) localStorage.setItem(TOKEN_KEY, token);
};

const getToken = () => {
  return localStorage.getItem("userToken");
};

const deleteToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

/* ---------------- STORE ---------------- */

const userStore = create((set, get) => ({
  userName: null,
  token: null,
  userEmailID: null,
  userModelID: null,
  gender: null,
  currentProfileUrl: "",
  userMobileNum: null,
  isUploading: false,
  error: null,
 

  /* ---------------- LOAD USER FROM STORAGE ---------------- */
  loadUserFromStorage: () => {
    const token = getToken();
    if (!token) return false;
    set({ token });
    return true;
  },

  /* ---------------- LOGIN ---------------- */
  login: async (data) => {
    try {
      const resp = await fetch(`${BASE_URL}/authenticate/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const respData = await resp.json();
      if (!resp.ok) return { message: respData?.msg || "Login failed", success: false };

      if (respData?.token) saveToken(respData.token);

      set({
        userName: respData?.detail.fullname,
        token: respData?.token,
        userEmailID: respData?.detail.email,
        userModelID: respData?.detail._id,
        userMobileNum  : respData?.detail.MobileNum || "",
        gender: respData?.detail.gender,
        currentProfileUrl: respData.detail.profile,
      });

      return { message: "Logged In Successfully", success: true };
    } catch (error) {
      console.log(error);
      return { message: "Login error", success: false };
    }
  },

  /* ---------------- LOGOUT ---------------- */
  logout: () => {
    deleteToken();
    set({
      userName: null,
      token: null,
      userEmailID: null,
      userModelID: null,
      gender: null,
      currentProfileUrl: "",
      userMobileNum: null,
    });
  },

  /* ---------------- UPDATE PROFILE INFO ---------------- */
  updateDetails: async (name, mobileNum) => {
    const token = getToken();
    const { userModelID } = get();

    try {
      const response = await fetch(`${BASE_URL}/profile-manage/update-profile-info`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: userModelID, name, mobileNum }),
      });

      const result = await response.json();

      set({ userName: result.fullname, userMobileNum: result.mobileNum });

      return {result,success : true};

    } catch (error) {
      console.log(error);
      return { success: false };
    }
  },

  /* ---------------- UPDATE PROFILE PHOTO (WEB) ---------------- */
  updateProfilePhoto: async ( file) => {
    const token = getToken();
    const {userModelID} = get();
    const formData = new FormData();
    formData.append("userId", userModelID);
    formData.append("profilePhoto", file); // <input type="file" />

    try {
      set({ isUploading: true });

      const response = await fetch(`${BASE_URL}/profile-manage/update-profile-photo`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const result = await response.json();

      if (!result.success) throw new Error(result.msg);

      set({ currentProfileUrl: result.ProfileURL, isUploading: false });
      return result;
    } catch (err) {
      set({ isUploading: false, error: err.message });
      throw err;
    }
  },

  /* ---------------- REGISTER ---------------- */
  createUser: async (data) => {
    try {
      const response = await fetch(`${BASE_URL}/authenticate/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const res = await response.json();
      if (!response.ok) return { message: res.msg, success: false };
      return { message: res.msg, success: true };
    } catch (error) {
      return { message: "Signup error", success: false };
    }
  },


  /* ---------------- VERIFY OTP & CREATE ACCOUNT ---------------- */
verifyNewUser: async (data) => {
  try {
    const resp = await fetch(`${BASE_URL}/authenticate/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: data.email,
        otp: data.code,
        password: data.password,
      }),
    });

    const respData = await resp.json();

    if (!resp.ok) {
      return { message: respData?.msg || "Error verifying user", success: false };
    }

    /* Save token in localStorage */
    if (respData?.token) saveToken(respData.token);

    /* Update Zustand state */
    set({
      userName: respData?.detail.username,
      token: respData?.token,
      userMobileNum  : respData?.detail.MobileNum || "",
      userEmailID: respData?.detail.email,
      userModelID: respData?.detail._id,
      gender: respData?.detail.gender,
    });

    return { message: "Account Created", success: true };
  } catch (error) {
    console.error("Verify OTP Error:", error);
    return { message: "OTP verification failed", success: false };
  }
},


  /* ---------------- TOKEN BASED LOGIN ---------------- */
  loginWithToken: async () => {
    const token = getToken();

    if (!token) return { success: false };

    try {
      const resp = await fetch(`${BASE_URL}/authenticate/verifywithCookie`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await resp.json();
       console.log(data);
      if (!resp.ok) return { success: false };


      const user = data.userdata;


      set({
        userName: user.username,
        userEmailID: user.email,
         currentProfileUrl: user.profile,
        userModelID: user._id,
        gender: user.gender,
      });

      return { success: true };
    } catch {
      return { success: false };
    }
  },


  /* ---------------- ADD POST ---------------- */
addPost: async (imageFile, title, description) => {
  const token = getToken();
  const { userModelID } = get();

  if (!imageFile && !title && !description) {
    return { success: false, message: "At least one field required" };
  }

  try {
    const formData = new FormData();
    formData.append("userId", userModelID);

    if (imageFile) formData.append("postImage", imageFile);
    if (title) formData.append("PostTitle", title);
    if (description) formData.append("PostDescription", description);

    const response = await fetch(`${BASE_URL}/post/add-post`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, message: data.msg };
    }

    return { success: true, message: "Post created" };
  } catch (error) {
    console.log(error);
    return { success: false, message: "Post upload failed" };
  }
},

fetchPost: async (page = 1, limit = 10) => {
  try {
    const { userModelID } = get();
    const token = getToken();


    console.log(page,"lllllllllll")
    const response = await fetch(
      `${BASE_URL}/post/fetch-posts?page=${page}&limit=${limit}&userId=${userModelID}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return { success: false, message: data.msg, posts: [] };
    }

    // Return current posts array from data
    return { 
      success: true, 
      message: "Fetched Posts", 
      posts: data.Posts || [] 
    };

  } catch (error) {
    console.error(error);
    return { success: false, message: "Post fetch failed", posts: [] };
  }
},

LikePost: async (postId) => {
  try {
    const { userModelID } = get();
    const token = getToken();

    const response = await fetch(`${BASE_URL}/post/like-post`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ postId, userId: userModelID }),
    });

    const data = await response.json();
    return data; // { success, liked, totalLikes }
  } catch (error) {
    console.error(error);
    return { success: false };
  }
},

addComment: async (postId, comment) => {
  try {
    const { userModelID } = get();
    const token = getToken();

    const res = await fetch(`${BASE_URL}/post/add-comment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ postId, userId: userModelID, comment }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { success: false, msg: data.msg || "Failed to add comment" };
    }

    return { success: true, comment: data.comment };

  } catch (err) {
    console.error("Add Comment Error:", err);
    return { success: false, msg: "Network error while adding comment" };
  }
},


loadComments: async (postId,page=1,limit=10) => {
  try {
      const token = getToken();
    const res = await fetch(`${BASE_URL}/post/comments?postId=${postId}&page=${page}&limit=${limit}`,{
      method : 'GET',
       headers: {
       
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();

    if (!res.ok) {
      return { success: false, comments: [], msg: data.msg || "Failed to load comments" };
    }

    return { success: true, comments: data.comments || [] };

  } catch (err) {
    console.error("Load Comments Error:", err);
    return { success: false, comments: [], msg: "Network error while loading comments" };
  }
},


deleteComment: async (postId, commentId) => {
  try {
    const { userModelID } = get();
    const token = getToken();

    const res = await fetch(`${BASE_URL}/post/delete-comment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ postId, commentId, userId: userModelID }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { success: false, msg: data.msg || "Failed to delete comment" };
    }

    return { success: true };

  } catch (err) {
    console.error("Delete Comment Error:", err);
    return { success: false, msg: "Network error while deleting comment" };
  }
},

fetchMyPost: async (page = 1, limit = 10) => {
  try {
    const { userModelID } = get();
    const token = getToken();

    const response = await fetch(
      `${BASE_URL}/post/fetchmypost?page=${page}&limit=${limit}&userId=${userModelID}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return { success: false, message: data.msg, posts: [] };
    }

    // Return current posts array from data
    return { 
      success: true, 
      message: "Fetched Posts", 
      posts: data.Posts || [] 
    };

  } catch (error) {
    console.error(error);
    return { success: false, message: "Post fetch failed", posts: [] };
  }
},

deletePost: async (postId) => {
  try {
    const { userModelID } = get();
    const token = getToken();

    const response = await fetch(`${BASE_URL}/post/delete-post`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ postId, userId: userModelID }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, message: data.msg };
    }

    return { success: true, message: data.msg || "Post deleted" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Failed to delete post" };
  }
},

}));

export default userStore;
