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
      const response = yield call(queryLicense, payload);
      yield put({
        type: 'queryLicenseReduce',
        payload: response,
      });
      if (callback) callback();
    },
    *remove({ payload, callback }, { call, put }) {
      yield call(removeLicense, payload);
      const response = yield call(queryLicense, payload);
      yield put({
        type: 'queryLicenseReduce',
        payload: response,
      });
      if (callback) callback();
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
      console.log(action.payload);
      const list = action.payload.result;
      list.forEach(
        (value,i) => {
          value.createTime = moment(value.createTime).format('YYYY-MM-DD HH:mm:ss');
          console.log(`forEach遍历:${i}--${value.createTime}`);
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
