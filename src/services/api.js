import { stringify } from 'qs';
import request from '@/utils/request';

// const apiUrl = "http://192.168.43.64:8080/oa-web";
const apiUrl = "https://www.zwovo.club/oa-web";

export async function queryProjectNotice() {
  return request('/api/project/notice');
}

export async function queryActivities() {
  return request('/api/activities');
}

export async function queryRecord(params) {
  return request(`${apiUrl}/record/list?${stringify(params)}`);
}

export async function queryLicense(params) {
  return request(`${apiUrl}/license?${stringify(params)}`);
}

export async function addLicense(params) {
  return request(`${apiUrl}/license`, {
    method: 'POST',
    body: {
      ...params,
    },
  });
}

export async function updateLicense(params) {
  return request(`${apiUrl}/license`, {
    method: 'PUT',
    body: {
      ...params,
    },
  });
}

export async function removeLicense(params) {
  return request(`${apiUrl}/license`, {
    method: 'DELETE',
    body: {
      ...params,
    },
  });
}

export async function queryLeave(params) {
  return request(`${apiUrl}/leave/list?${stringify(params)}`);
}

export async function updateLeave(params) {
  console.log("params:");
  console.log(params);
  return request(`${apiUrl}/leave/audit`, {
    method: 'PUT',
    body: {
      ...params,
    },
  });
}

export async function queryUserManager(params) {
  return request(`${apiUrl}/user/list?${stringify(params)}`);
}

export async function updateUserManager(params) {
  return request(`${apiUrl}/user/${params.openId}`, {
    method: 'PUT',
    body: {
      ...params,
    },
  });
}

export async function fakeSubmitForm(params) {
  return request('/api/forms', {
    method: 'POST',
    body: params,
  });
}

export async function fakeChartData() {
  return request('/api/fake_chart_data');
}

export async function queryTags() {
  return request('/api/tags');
}

export async function queryBasicProfile() {
  return request('/api/profile/basic');
}

export async function queryAdvancedProfile() {
  return request('/api/profile/advanced');
}

export async function queryFakeList(params) {
  return request(`/api/fake_list?${stringify(params)}`);
}

export async function removeFakeList(params) {
  const { count = 5, ...restParams } = params;
  return request(`/api/fake_list?count=${count}`, {
    method: 'POST',
    body: {
      ...restParams,
      method: 'delete',
    },
  });
}

export async function addFakeList(params) {
  const { count = 5, ...restParams } = params;
  return request(`/api/fake_list?count=${count}`, {
    method: 'POST',
    body: {
      ...restParams,
      method: 'post',
    },
  });
}

export async function updateFakeList(params) {
  const { count = 5, ...restParams } = params;
  return request(`/api/fake_list?count=${count}`, {
    method: 'POST',
    body: {
      ...restParams,
      method: 'update',
    },
  });
}

export async function fakeAccountLogin(params) {
  return request(`${apiUrl}/user/login`, {
    method: 'POST',
    body: params,
  });
}

export async function fakeRegister(params) {
  return request('/api/register', {
    method: 'POST',
    body: params,
  });
}

export async function queryNotices() {
  return request('/api/notices');
}

export async function getFakeCaptcha(mobile) {
  return request(`/api/captcha?mobile=${mobile}`);
}
