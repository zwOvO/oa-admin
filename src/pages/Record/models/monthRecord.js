import { queryMonthRecord,updateMonthRecord,downloadMonthRecordExcelUrl,uploadMonthRecordByExcel,addMonthRecord,removeMonthRecord } from '@/services/api';
import moment from 'moment';

export default {
  namespace: 'monthRecord',

  state: {
    data: {
      list: [],
      pagination: {},
    },
  },

  effects: {
    *fetch({ payload }, { call, put }) {
      const response = yield call(queryMonthRecord, payload);
      yield put({
        type: 'queryReduce',
        payload: response,
      });
    },
    *add({ payload }, { call, put }) {
      yield call(addMonthRecord, payload);
      const response = yield call(queryMonthRecord, {});
      yield put({
        type: 'queryReduce',
        payload: response,
      });
    },
    *remove({ payload,callback }, { call, put }) {
      const res = yield call(removeMonthRecord, payload);
      if (callback) callback(JSON.parse(res));
      const response = yield call(queryMonthRecord, {});
      yield put({
        type: 'queryReduce',
        payload: response,
      });
    },
    *update({ callback,payload }, { call, put }) {
      const res = yield call(updateMonthRecord, payload);
      if (callback) callback(res);
      const response = yield call(queryMonthRecord, {});
      yield put({
        type: 'queryReduce',
        payload: response,
      });
    },
  },

  reducers: {
    queryReduce(state, action) {
      const list = action.payload.result;
      list.forEach(
        (value,i) => {
          value.forDate = moment(value.forDate).format('YYYY-MM');
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
  },
};
