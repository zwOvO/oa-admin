import { queryRecord } from '@/services/api';

export default {
  namespace: 'record',

  state: {
    data: {
      list: [],
      pagination: {},
    },
  },

  effects: {
    *fetch({ payload }, { call, put }) {
      const response = yield call(queryRecord, payload);
      yield put({
        type: 'queryRecordReduce',
        payload: response,
      });
    },
  },

  reducers: {
    queryRecordReduce(state, action) {
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
  },
};
