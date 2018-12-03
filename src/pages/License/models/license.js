import { queryLicense, removeLicense, addLicense, updateLicense } from '@/services/api';
import moment from "moment";

export default {
  namespace: 'license',

  state: {
    data: {
      list: [],
      pagination: {},
    },
  },

  effects: {
    *fetch({ payload }, { call, put }) {
      const response = yield call(queryLicense, payload);
      yield put({
        type: 'queryLicenseReduce',
        payload: response,
      });
    },
    *add({ payload, callback }, { call, put }) {
      yield call(addLicense, payload);
      const response = yield call(queryLicense, {});
      yield put({
        type: 'queryLicenseReduce',
        payload: response,
      });
      if (callback) callback();
    },
    *remove({ payload, callback }, { call, put }) {
      const res = yield call(removeLicense, payload);
      if (callback) callback(JSON.parse(res));
      const response = yield call(queryLicense, {});
      yield put({
        type: 'queryLicenseReduce',
        payload: response,
      });
    },
    *update({ payload, callback }, { call, put }) {
      yield call(updateLicense, payload);
      const response = yield call(queryLicense, {});
      yield put({
        type: 'queryLicenseReduce',
        payload: response,
      });
      if (callback) callback();
    },
  },

  reducers: {
    queryLicenseReduce(state, action) {
      const list = action.payload.result;
      list.forEach(
        (value,i) => {
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
