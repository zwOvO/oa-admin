import { queryRecord } from '@/services/api';
import moment from 'moment';

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
  },
};
