import { queryLeave, removeLeave, addLeave, updateLeave } from '@/services/api';

export default {
  namespace: 'leave',

  state: {
    data: {
      list: [],
      pagination: {},
    },
  },

  effects: {
    *fetch({ payload }, { call, put }) {
      const response = yield call(queryLeave, payload);
      yield put({
        type: 'queryLeaveReduce',
        payload: response,
      });
    },
    *add({ payload, callback }, { call, put }) {
      const response = yield call(addLeave, payload);
      yield put({
        type: 'save',
        payload: response,
      });
      if (callback) callback();
    },
    *remove({ payload, callback }, { call, put }) {
      const response = yield call(removeLeave, payload);
      yield put({
        type: 'save',
        payload: response,
      });
      if (callback) callback();
    },
    *update({ payload, callback }, { call, put }) {
      yield call(updateLeave, payload);
      const response = yield call(queryLeave, {});
      yield put({
        type: 'queryLeaveReduce',
        payload: response,
      });
      if (callback) callback();
    },
  },

  reducers: {
    queryLeaveReduce(state, action) {
      console.log(action.payload);
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
