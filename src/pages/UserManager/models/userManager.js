import { queryUserManager,updateUserManager } from '@/services/api';
import moment from "moment";

export default {
  namespace: 'userManager',

  state: {
    data: {
      list: [],
      pagination: {},
    },
  },

  effects: {
    *fetch({ payload }, { call, put }) {
      const response = yield call(queryUserManager, payload);
      yield put({
        type: 'queryReduce',
        payload: response,
      });
    },
    *remove({ payload, callback }, { call, put }) {
      yield call(removeUserManager, payload);
      const response = yield call(queryUserManager);
      yield put({
        type: 'queryReduce',
        payload: response,
      });
      if (callback) callback();
    },
    *update({ payload, callback }, { call, put }) {
      const res = yield call(updateUserManager, payload);
      if (callback) callback(res);
      const response = yield call(queryUserManager);
      yield put({
        type: 'queryReduce',
        payload: response,
      });
    },
  },

  reducers: {
    queryReduce(state, action) {
      const gender = ['男', '女'];
      const status = ['启用', '禁用'];
      const list = action.payload.result;
      list.forEach(
        (value,i) => {
          value.gender = gender[(value.gender-1)];
          value.status = status[(value.status-1)];
          value.createTime = moment(value.createTime).format('YYYY-MM-DD HH:mm:ss');
        }
      );
      return {
        ...state,
        data: {
          list:action.payload.result,
          pagination:{
            total: action.payload.result.length,
          }
        },
      };
    },
    save(state, action) {
      return {
        ...state,
        data: action.payload,
      };
    },
  },
};
