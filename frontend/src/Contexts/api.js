import axios from 'axios';
import { logout, setToken } from '../redux/slice/auth';
import { store } from '../redux/store';

const api = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL,
});

api.interceptors.request.use(
    (config) => {
        const authData = localStorage.getItem('auth');
        const token = authData ? JSON.parse(authData)?.accessToken : null;

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (
            error.response?.status === 401 &&
            !originalRequest._retry
        ) {
            originalRequest._retry = true;

            try {
                const refreshToken = store.getState().auth.refreshToken;

                const res = await api.post('/auth/refresh-token', {
                    refreshToken,
                });

                const newAccessToken = res.data.accessToken;

                store.dispatch(setToken({ accessToken: newAccessToken }));

                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                store.dispatch(logout());
                window.location.href = "/";
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export const requestAccessCode = (identifier) => {
    return api.post('/createNewAccessCode', { identifier });
};

export const validateAccessCode = (phoneNumber, email, accessCode) => {
    return api.post('/validateAccessCode', { phoneNumber, email, accessCode });
};

export const createEmployee = (employeeData) => {
    return api.post('/createEmployee', employeeData);
}

export const setupEmployeeAccount = (token, username, password) => {
    return api.post('/setupEmployeeAccount', { token, username, password });
};

export const getEmployees = (searchText = '') => {
    return api.get('/getEmployees', {
        params: { searchText }
    });
};

export const updateEmployee = (id, status) => {
    return api.put(`/updateEmployee/${id}`, { status });
}

export const deleteEmployee = (id) => {
    return api.delete(`/deleteEmployee/${id}`);
}

export const createTask = (taskData) => {
    return api.post('/createTask', taskData);
}

export const getTasks = (status) => {
    return api.get('/getTasks', {
        params: { status }
    });
};

export const assignTask = (taskId, employeeId) => {
    return api.put(`/${taskId}/assign`, { assignee: employeeId });
};


export const getConversations = (userId) => {
    return api.get(`/getAllConversations/${userId}`);
};

export const createConversation = (conversationData) => {
    return api.post(`/messages/conversation`, conversationData);
};

export const getConversationMessages = (conversationId) => {
    return api.get(`/conversation/${conversationId}`);
};

export const getTasksAssignedToEmployee = (employeeId, status) => {
    return api.get(`/employee/assigned/${employeeId}`, {
        params: { status }
    });
};

export const completeTask = (taskId) => {
    return api.put(`/employee/completeTasks/${taskId}`);
};

export const getConversationsEmployee = (userId) => {
    return api.get(`/employee/getAllConversations/${userId}`);
};

export const getEmployeeInfo = (userId) => {
    return api.get(`/employee/${userId}`);
};

export const updateEmployeeInfo = (userId, address) => {
    return api.put(`/employee/update/${userId}`, { address });
};

export const getNotificationsByUser = (userId) => {
    return api.get(`/notifications/${userId}`);
};

export const getUnreadNotificationsCount = (userId) => {
    return api.get(`/notifications/${userId}/unread-count`);
};
